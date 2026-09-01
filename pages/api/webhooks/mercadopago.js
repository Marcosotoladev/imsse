// pages/api/webhooks/mercadopago.js - Notificaciones públicas de MercadoPago (pagos y estado del preapproval)
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from 'mercadopago';
import admin from '../../../lib/firebase-admin';
import { subscriptionRef, pagosRef, invalidateSubscriptionCache } from '../../../lib/subscription';
import { preApprovalClient, paymentClient } from '../../../lib/mercadopago';

function verificarFirma(req) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    // Sin secret configurado no se puede validar; se deja pasar solo para desarrollo temprano.
    console.warn('MERCADOPAGO_WEBHOOK_SECRET no configurado, se omite validación de firma');
    return true;
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers['x-signature'],
      xRequestId: req.headers['x-request-id'],
      dataId: req.query['data.id'] || req.query.id,
      secret
    });
    return true;
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.warn('Webhook MercadoPago: firma inválida', error.reason);
      return false;
    }
    throw error;
  }
}

async function registrarPagoAprobado(payment) {
  const snap = await subscriptionRef().get();
  const sub = snap.exists ? snap.data() : null;

  const vencimientoActual = sub?.fechaVencimiento?.toDate?.() || null;
  const base = vencimientoActual && vencimientoActual > new Date() ? vencimientoActual : new Date();
  const nuevaFecha = new Date(base);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);

  await subscriptionRef().set(
    {
      fechaVencimiento: admin.firestore.Timestamp.fromDate(nuevaFecha),
      mercadopago: { ...(sub?.mercadopago || {}), status: 'authorized' },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  await pagosRef()
    .doc(String(payment.id))
    .set({
      fecha: admin.firestore.Timestamp.fromDate(new Date(payment.date_approved || Date.now())),
      monto: payment.transaction_amount,
      status: payment.status,
      mpPaymentId: payment.id
    });

  invalidateSubscriptionCache();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  if (!verificarFirma(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const body = req.body || {};
    const topic = req.query.type || body.type;

    if (topic === 'payment') {
      const paymentId = body.data?.id || req.query['data.id'];
      if (paymentId) {
        const payment = await paymentClient.get({ id: paymentId });
        if (payment.status === 'approved') {
          await registrarPagoAprobado(payment);
        }
      }
    }

    if (topic === 'subscription_preapproval' || topic === 'preapproval') {
      const preapprovalId = body.data?.id || req.query['data.id'];
      if (preapprovalId) {
        const preapproval = await preApprovalClient.get({ id: preapprovalId });
        const snap = await subscriptionRef().get();
        const sub = snap.exists ? snap.data() : null;

        // Ya vinculado: es una actualización de estado de nuestra suscripción.
        const yaVinculado = sub?.mercadopago?.preapprovalId === preapprovalId;
        // Primera autorización: viene de nuestro plan (no había preapprovalId todavía).
        const perteneceANuestroPlan =
          !!sub?.mercadopago?.preapprovalPlanId &&
          preapproval.preapproval_plan_id === sub.mercadopago.preapprovalPlanId;

        if (yaVinculado || perteneceANuestroPlan) {
          await subscriptionRef().set(
            {
              mercadopago: {
                ...sub.mercadopago,
                preapprovalId: preapproval.id,
                payerEmail: preapproval.payer_email || sub?.mercadopago?.payerEmail || null,
                status: preapproval.status
              },
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            },
            { merge: true }
          );
          invalidateSubscriptionCache();
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook MercadoPago:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
