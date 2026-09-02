// pages/api/notificaciones/[id].js - Responder / marcar atendido / eliminar una notificación
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';

const COLLECTION = 'notificaciones';
const ESTADOS_VALIDOS = ['pendiente', 'atendido'];
const RESPUESTA_MAX_LENGTH = 1500;

async function handler(req, res) {
  const { id } = req.query;
  const { user } = req;

  switch (req.method) {
    case 'PUT':
      return await actualizarNotificacion(req, res, id, user);
    case 'DELETE':
      return await eliminarNotificacion(req, res, id, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function actualizarNotificacion(req, res, id, user) {
  try {
    if (user.role === ROLES.CLIENTE) {
      return res.status(403).json({ error: 'El cliente no puede editar la notificación' });
    }

    const docRef = firestore.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    const updateData = {
      leidoPorAdmin: true,
      leidoPorCliente: false,
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp()
    };

    if (req.body?.respuesta !== undefined) {
      const respuesta = (req.body.respuesta || '').trim();
      if (respuesta.length > RESPUESTA_MAX_LENGTH) {
        return res.status(400).json({ error: `La respuesta no puede superar los ${RESPUESTA_MAX_LENGTH} caracteres` });
      }
      updateData.respuesta = respuesta || null;
      updateData.respondidoPor = respuesta ? user.uid : null;
      updateData.respondidoPorNombre = respuesta ? (user.displayName || user.email || 'IMSSE') : null;
      updateData.fechaRespuesta = respuesta ? admin.firestore.FieldValue.serverTimestamp() : null;
    }

    if (req.body?.estado !== undefined) {
      if (!ESTADOS_VALIDOS.includes(req.body.estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      updateData.estado = req.body.estado;
    }

    await docRef.update(updateData);

    return res.status(200).json({
      id,
      message: 'Notificación actualizada correctamente',
      success: true
    });
  } catch (error) {
    console.error('Error al actualizar notificación:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function eliminarNotificacion(req, res, id, user) {
  try {
    if (user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Solo un administrador puede eliminar notificaciones' });
    }

    await firestore.collection(COLLECTION).doc(id).delete();

    return res.status(200).json({
      id,
      message: 'Notificación eliminada correctamente',
      success: true
    });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
