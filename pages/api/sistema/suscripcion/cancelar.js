// pages/api/sistema/suscripcion/cancelar.js - Cancela el cobro recurrente activo en MercadoPago
import { withAuth, ROLES } from '../../../../lib/auth-middleware';
import admin from '../../../../lib/firebase-admin';
import { subscriptionRef, invalidateSubscriptionCache } from '../../../../lib/subscription';
import { preApprovalClient } from '../../../../lib/mercadopago';

async function handler(req, res) {
  const { user } = req;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (user.role !== ROLES.ADMIN && !user.superAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const snap = await subscriptionRef().get();
    const sub = snap.exists ? snap.data() : null;
    const preapprovalId = sub?.mercadopago?.preapprovalId;

    if (!preapprovalId) {
      return res.status(400).json({ error: 'No hay una suscripción activa en MercadoPago para cancelar' });
    }

    await preApprovalClient.update({ id: preapprovalId, body: { status: 'cancelled' } });

    await subscriptionRef().set(
      {
        mercadopago: { ...sub.mercadopago, status: 'cancelled' },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: user.uid
      },
      { merge: true }
    );

    invalidateSubscriptionCache();

    return res.status(200).json({ message: 'Suscripción cancelada' });
  } catch (error) {
    console.error('Error cancelando suscripcion MercadoPago:', error);
    return res.status(500).json({ error: 'No se pudo cancelar la suscripción en MercadoPago' });
  }
}

export default withAuth(handler);
