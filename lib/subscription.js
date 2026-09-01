// lib/subscription.js - Estado de la suscripción global de la app (doc singleton sistema/suscripcion)
import { firestore } from './firebase-admin';

const CACHE_TTL_MS = 60 * 1000;

let cache = { data: null, fetchedAt: 0 };

export function subscriptionRef() {
  return firestore.collection('sistema').doc('suscripcion');
}

export function pagosRef() {
  return subscriptionRef().collection('pagos');
}

export function computeBloqueada(sub) {
  if (!sub) return false;
  // El bloqueo manual es un freno de mano: gana siempre, incluso con la suscripción al día.
  if (sub.bloqueadoManualmente) return true;
  if (sub.activadoManualmente) return false;
  if (!sub.fechaVencimiento) return false;

  const vencimiento = sub.fechaVencimiento?.toDate?.() ?? new Date(sub.fechaVencimiento);
  const limite = new Date(vencimiento);
  limite.setDate(limite.getDate() + (sub.diasGracia || 0));

  return new Date() > limite;
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

export async function getSubscriptionState() {
  const sub = await getSubscriptionDoc();
  return { sub, bloqueada: computeBloqueada(sub) };
}
