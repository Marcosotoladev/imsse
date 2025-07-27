import { firestore } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uid, userData } = req.body;

    await firestore.collection('usuarios').doc(uid).set({
      ...userData,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
      estado: userData.estado || 'activo',
      rol: userData.tipoSolicitud || 'cliente'
    });

    return res.status(201).json({ message: 'Profile created', uid });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}