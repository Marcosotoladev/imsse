// pages/api/webhooks/mercadopago.js - Notificaciones públicas de MercadoPago (pagos y estado del preapproval)
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from 'mercadopago';
import { sincronizarConMercadoPago } from '../../../lib/subscription';

// Los cobros mensuales de la suscripción llegan como subscription_authorized_payment;
// los otros avisan altas/cambios de estado o pagos sueltos.
const TOPICS_SUSCRIPCION = [
  'payment',
  'subscription_preapproval',
  'preapproval',
  'subscription_authorized_payment'
];

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  if (!verificarFirma(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const body = req.body || {};
    const topic = req.query.type || req.query.topic || body.type;

    // No se confía en el contenido del aviso: se usa solo como disparador y el estado real
    // (suscripción, cobros, vencimiento) se vuelve a leer de MercadoPago. Es idempotente,
    // así que avisos repetidos o de varios topics para el mismo cobro no extienden dos veces.
    if (TOPICS_SUSCRIPCION.includes(topic)) {
      await sincronizarConMercadoPago();
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook MercadoPago:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
