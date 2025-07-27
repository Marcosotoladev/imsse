// ============= pages/api/auth/verify.js =============//
import { auth } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    
    // Obtener datos del usuario
    const userDoc = await admin.firestore()
      .collection('usuarios')
      .doc(decodedToken.uid)
      .get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    return res.status(200).json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.rol,
      isActive: userData.estado === 'activo',
      profile: userData
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
