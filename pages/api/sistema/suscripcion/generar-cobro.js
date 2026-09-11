// pages/api/sistema/suscripcion/generar-cobro.js - Genera el link de suscripción en MercadoPago
// Usa un Plan (preapproval_plan) en vez de un Preapproval directo a propósito:
// el plan no lleva payer_email fijo, así que quien abre el link autoriza con
// la cuenta de MercadoPago que quiera y aporta su propio email en ese momento.
// Esto evita el error "no coincide el email" que da un Preapproval con email prefijado.
import { withAuth, ROLES } from '../../../../lib/auth-middleware';
import admin from '../../../../lib/firebase-admin';
import { subscriptionRef, invalidateSubscriptionCache } from '../../../../lib/subscription';
import { preApprovalPlanClient } from '../../../../lib/mercadopago';

async function handler(req, res) {
  const { user } = req;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // El admin dueño de la cuenta también puede generar/reautorizar su propio cobro
  // (típicamente desde /mantenimiento, para destrabarse solo). El resto de roles, no.
  if (!user.superAdmin && user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const snap = await subscriptionRef().get();
    const sub = snap.exists ? snap.data() : null;
    // Solo el Superadmin puede fijar precio distinto al ya configurado: un admin
    // bloqueado que llama esto no debe poder mandar su propio monto en el body.
    const { monto, moneda } = user.superAdmin ? req.body : {};
    const montoFinal = Number(monto ?? sub?.monto);
    const monedaFinal = moneda || sub?.moneda || 'ARS';

    if (!montoFinal || Number.isNaN(montoFinal) || montoFinal <= 0) {
      return res.status(400).json({ error: 'Definí un monto válido antes de generar el cobro' });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;

    const plan = await preApprovalPlanClient.create({
      body: {
        reason: 'Suscripción IMSSE',
        back_url: baseUrl ? `${baseUrl}/admin/suscripcion` : undefined,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: montoFinal,
          currency_id: monedaFinal
        }
      }
    });

    await subscriptionRef().set(
      {
        monto: montoFinal,
        moneda: monedaFinal,
        mercadopago: {
          preapprovalPlanId: plan.id,
          initPoint: plan.init_point,
          status: 'pending',
          preapprovalId: null,
          payerEmail: null
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: user.uid
      },
      { merge: true }
    );

    invalidateSubscriptionCache();

    return res.status(200).json({ initPoint: plan.init_point, preapprovalPlanId: plan.id });
  } catch (error) {
    console.error('Error generando plan de suscripción en MercadoPago:', error);
    return res.status(500).json({ error: 'No se pudo generar el link de suscripción en MercadoPago' });
  }
}

export default withAuth(handler, [], { allowDuringMaintenance: true });
