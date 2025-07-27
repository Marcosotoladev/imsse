// pages/api/auth/profile.js - Obtener perfil del usuario actual
import { withAuth } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';

async function handler(req, res) {
  const { user } = req;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userDoc = await firestore.collection('usuarios').doc(user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();
    
    // Actualizar fecha de último acceso
    await firestore.collection('usuarios').doc(user.uid).update({
      fechaUltimoAcceso: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({
      id: userDoc.id,
      email: userData.email,
      nombre: userData.nombre,
      apellido: userData.apellido,
      rol: userData.rol,
      estado: userData.estado,
      permisos: userData.permisos,
      empresa: userData.empresa,
      telefono: userData.telefono,
      clienteId: userData.clienteId,
      fechaCreacion: userData.fechaCreacion?.toDate?.() || userData.fechaCreacion
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);