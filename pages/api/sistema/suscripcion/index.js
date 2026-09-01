// pages/api/sistema/suscripcion/index.js
import { withAuth, ROLES } from '../../../../lib/auth-middleware';
import admin from '../../../../lib/firebase-admin';
import {
  subscriptionRef,
  pagosRef,
  computeBloqueada,
  invalidateSubscriptionCache
} from '../../../../lib/subscription';

async function handler(req, res) {
  const { user } = req;

  switch (req.method) {
    case 'GET':
      return await getSuscripcion(req, res, user);
    case 'PUT':
      return await updateSuscripcion(req, res, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getSuscripcion(req, res, user) {
  try {
    const snap = await subscriptionRef().get();
    const sub = snap.exists ? snap.data() : null;
    const bloqueada = computeBloqueada(sub);

    const response = { bloqueada };

    if (user.role === ROLES.ADMIN || user.superAdmin) {
      response.fechaVencimiento = sub?.fechaVencimiento?.toDate?.() || null;
      response.monto = sub?.monto ?? null;
      response.moneda = sub?.moneda || 'ARS';
      response.estadoMP = sub?.mercadopago?.status || null;
    }

    if (user.superAdmin) {
      response.activadoManualmente = sub?.activadoManualmente || false;
      response.diasGracia = sub?.diasGracia ?? 0;
      response.mercadopago = sub?.mercadopago || null;

      const pagosSnap = await pagosRef().orderBy('fecha', 'desc').limit(12).get();
      response.pagos = pagosSnap.docs.map((doc) => {
        const data = doc.data();
        return { id: doc.id, ...data, fecha: data.fecha?.toDate?.() || data.fecha };
      });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error getting suscripcion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateSuscripcion(req, res, user) {
  try {
    if (!user.superAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { fechaVencimiento, monto, moneda, diasGracia, activadoManualmente } = req.body;
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: user.uid
    };

    if (fechaVencimiento !== undefined) {
      const fecha = new Date(fechaVencimiento);
      if (Number.isNaN(fecha.getTime())) {
        return res.status(400).json({ error: 'Invalid fechaVencimiento' });
      }
      updateData.fechaVencimiento = admin.firestore.Timestamp.fromDate(fecha);
    }

    if (monto !== undefined) {
      const montoNum = Number(monto);
      if (Number.isNaN(montoNum) || montoNum < 0) {
        return res.status(400).json({ error: 'Invalid monto' });
      }
      updateData.monto = montoNum;
    }

    if (moneda !== undefined) {
      updateData.moneda = moneda;
    }

    if (diasGracia !== undefined) {
      const diasNum = Number(diasGracia);
      if (Number.isNaN(diasNum) || diasNum < 0) {
        return res.status(400).json({ error: 'Invalid diasGracia' });
      }
      updateData.diasGracia = diasNum;
    }

    if (activadoManualmente !== undefined) {
      updateData.activadoManualmente = !!activadoManualmente;
    }

    await subscriptionRef().set(updateData, { merge: true });
    invalidateSubscriptionCache();

    return res.status(200).json({ message: 'Suscripción actualizada' });
  } catch (error) {
    console.error('Error updating suscripcion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
