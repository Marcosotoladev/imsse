// lib/mercadopago.js - Cliente de MercadoPago para la suscripción recurrente
import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// PreApprovalPlan: genera el link de suscripción sin email fijo (quien paga
// inicia sesión en MercadoPago con su propia cuenta al autorizar).
export const preApprovalPlanClient = new PreApprovalPlan(client);
// PreApproval: la suscripción concreta ya autorizada (para consultar/cancelar).
export const preApprovalClient = new PreApproval(client);
export const paymentClient = new Payment(client);

export default client;
