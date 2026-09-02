// pages/api/notificaciones/no-leidas.js - Cantidad de notificaciones sin leer (para el numerito del ícono)
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';

const COLLECTION = 'notificaciones';

async function handler(req, res) {
  if (req.method !== 'GET') {
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

      const count = snapshot.docs.filter(doc => doc.data().leidoPorCliente === false).length;
      return res.status(200).json({ count });
    }

    const snapshot = await firestore.collection(COLLECTION).where('leidoPorAdmin', '==', false).count().get();
    return res.status(200).json({ count: snapshot.data().count });
  } catch (error) {
    console.error('Error al contar notificaciones sin leer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
