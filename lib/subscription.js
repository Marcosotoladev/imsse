// lib/subscription.js - Estado de la suscripción global de la app (doc singleton sistema/suscripcion)
import admin, { firestore } from './firebase-admin';

const CACHE_TTL_MS = 60 * 1000;
// Cada cuánto, como mucho, se le vuelve a preguntar a MercadoPago antes de bloquear.
const SYNC_THROTTLE_MS = 5 * 60 * 1000;
// Con un débito automático activo, MercadoPago puede cobrar unas horas tarde o reintentar
// un cobro fallido en los días siguientes: no se bloquea mientras tenga margen para hacerlo.
const MARGEN_COBRO_AUTOMATICO_DIAS = 3;

let cache = { data: null, fetchedAt: 0 };

export function subscriptionRef() {
  return firestore.collection('sistema').doc('suscripcion');
}

export function pagosRef() {
  return subscriptionRef().collection('pagos');
}

function toDate(value) {
  if (!value) return null;
  return value.toDate?.() ?? new Date(value);
}

function vencidaPorFecha(sub) {
  const vencimiento = toDate(sub.fechaVencimiento);
  if (!vencimiento) return false;

  const margen = sub.mercadopago?.status === 'authorized' ? MARGEN_COBRO_AUTOMATICO_DIAS : 0;
  const limite = new Date(vencimiento);
  limite.setDate(limite.getDate() + (sub.diasGracia || 0) + margen);

  return new Date() > limite;
}

export function computeBloqueada(sub) {
  if (!sub) return false;
  // El bloqueo manual es un freno de mano: gana siempre, incluso con la suscripción al día.
  if (sub.bloqueadoManualmente) return true;
  if (sub.activadoManualmente) return false;
  return vencidaPorFecha(sub);
}

export function invalidateSubscriptionCache() {
  cache = { data: null, fetchedAt: 0 };
}

export async function getSubscriptionDoc({ skipCache = false } = {}) {
  const now = Date.now();
  if (!skipCache && cache.data !== null && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  const snap = await subscriptionRef().get();
  const data = snap.exists ? snap.data() : null;
  cache = { data, fetchedAt: now };
  return data;
}

async function mpGet(path) {
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` }
  });
  if (!response.ok) {
    throw new Error(`MercadoPago GET ${path} respondió ${response.status}`);
  }
  return response.json();
}

async function buscarPreapproval(mp) {
  if (mp.preapprovalId) {
    return mpGet(`/preapproval/${mp.preapprovalId}`);
  }
  if (!mp.preapprovalPlanId) return null;

  // Todavía no vinculada: se busca quién se suscribió a nuestro plan (prioriza la activa).
  const { results = [] } = await mpGet(`/preapproval/search?preapproval_plan_id=${mp.preapprovalPlanId}`);
  const ordenadas = [...results].sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
  return ordenadas.find((p) => p.status === 'authorized') || ordenadas[0] || null;
}

async function buscarCobrosAprobados(preapprovalId) {
  const cobros = [];
  // MercadoPago rechaza páginas de más de 12 en este endpoint.
  const limit = 12;
  for (let offset = 0; ; offset += limit) {
    const { results = [], paging } = await mpGet(
      `/authorized_payments/search?preapproval_id=${preapprovalId}&limit=${limit}&offset=${offset}`
    );
    cobros.push(...results);
    if (!results.length || offset + limit >= (paging?.total ?? 0)) break;
  }
  return cobros.filter((cobro) => cobro.payment?.status === 'approved');
}

// Trae de MercadoPago el estado real de la suscripción y sus cobros, y deja el doc al día.
// Es idempotente (los pagos se guardan por id de pago), así que se puede llamar desde el
// webhook y como verificación antes de bloquear sin riesgo de extender dos veces.
export async function sincronizarConMercadoPago() {
  const snap = await subscriptionRef().get();
  const sub = snap.exists ? snap.data() : null;
  const mp = sub?.mercadopago || {};

  const update = { ultimaSincronizacion: admin.firestore.FieldValue.serverTimestamp() };
  const preapproval = await buscarPreapproval(mp);

  if (preapproval) {
    update.mercadopago = {
      ...mp,
      preapprovalId: preapproval.id,
      payerEmail: preapproval.payer_email || mp.payerEmail || null,
      status: preapproval.status
    };

    const aprobados = await buscarCobrosAprobados(preapproval.id);
    let ultimoCobro = null;

    for (const cobro of aprobados) {
      const fecha = new Date(cobro.debit_date || cobro.date_created);
      if (!ultimoCobro || fecha > ultimoCobro) ultimoCobro = fecha;

      await pagosRef()
        .doc(String(cobro.payment.id))
        .set(
          {
            fecha: admin.firestore.Timestamp.fromDate(fecha),
            monto: cobro.transaction_amount,
            status: cobro.payment.status,
            mpPaymentId: cobro.payment.id,
            mpAuthorizedPaymentId: cobro.id
          },
          { merge: true }
        );
    }

    if (ultimoCobro) {
      const nuevoVencimiento = new Date(ultimoCobro);
      nuevoVencimiento.setMonth(nuevoVencimiento.getMonth() + 1);
      // Nunca acorta una fecha que el Superadmin haya extendido a mano.
      const actual = toDate(sub?.fechaVencimiento);
      if (!actual || nuevoVencimiento > actual) {
        update.fechaVencimiento = admin.firestore.Timestamp.fromDate(nuevoVencimiento);
      }
    }
  }

  await subscriptionRef().set(update, { merge: true });
  invalidateSubscriptionCache();
}

export async function getSubscriptionState({ skipCache = false } = {}) {
  let sub = await getSubscriptionDoc({ skipCache });
  let bloqueada = computeBloqueada(sub);

  // Antes de bloquear por vencimiento se confirma con MercadoPago: si el webhook del cobro
  // se perdió, esto lo recupera y la app sigue funcionando sin que nadie toque nada.
  const tieneMercadoPago = sub?.mercadopago?.preapprovalId || sub?.mercadopago?.preapprovalPlanId;
  const ultimaSync = toDate(sub?.ultimaSincronizacion);
  const puedeSincronizar = !ultimaSync || Date.now() - ultimaSync.getTime() > SYNC_THROTTLE_MS;

  if (bloqueada && !sub.bloqueadoManualmente && tieneMercadoPago && puedeSincronizar) {
    try {
      await sincronizarConMercadoPago();
      sub = await getSubscriptionDoc({ skipCache: true });
      bloqueada = computeBloqueada(sub);
    } catch (error) {
      console.error('No se pudo verificar la suscripción con MercadoPago:', error);
    }
  }

  return { sub, bloqueada };
}
