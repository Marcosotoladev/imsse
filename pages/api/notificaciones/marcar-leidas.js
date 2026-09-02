// pages/api/notificaciones/marcar-leidas.js - Marca como leídas todas las notificaciones visibles del usuario actual
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';

const COLLECTION = 'notificaciones';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user } = req;

  try {
    if (user.role === ROLES.CLIENTE) {
      const perfilDoc = await firestore.collection('usuarios').doc(user.uid).get();
      const perfilData = perfilDoc.data() || {};
      const empresaId = perfilData.empresaId || null;

      const snapshot = empresaId
        ? await firestore.collection(COLLECTION).where('empresaId', '==', empresaId).get()
        : await firestore.collection(COLLECTION).where('clienteId', '==', user.uid).get();

      const pendientes = snapshot.docs.filter(doc => doc.data().leidoPorCliente === false);
      await marcarComoLeidas(pendientes, 'leidoPorCliente');
    } else {
      const snapshot = await firestore.collection(COLLECTION).where('leidoPorAdmin', '==', false).get();
      await marcarComoLeidas(snapshot.docs, 'leidoPorAdmin');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificaciones como leídas:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function marcarComoLeidas(docs, campo) {
  if (docs.length === 0) return;

  const batch = firestore.batch();
  docs.forEach(doc => batch.update(doc.ref, { [campo]: true }));
  await batch.commit();
}

export default withAuth(handler);
