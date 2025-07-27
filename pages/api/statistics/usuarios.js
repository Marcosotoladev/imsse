import { authMiddleware } from '../../../lib/auth-middleware';
import { adminDb } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación y que sea admin
    const { decodedToken, error } = await authMiddleware(req);
    if (error) {
      return res.status(401).json({ error });
    }

    // Solo admins pueden ver estadísticas de usuarios
    const userDoc = await adminDb.collection('usuarios').doc(decodedToken.uid).get();
    if (!userDoc.exists || userDoc.data().rol !== 'admin') {
      return res.status(403).json({ error: 'Sin permisos para ver estadísticas de usuarios' });
    }

    // Obtener todos los usuarios
    const usuariosSnapshot = await adminDb.collection('usuarios').get();
    const usuarios = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calcular estadísticas
    const estadisticas = {
      total: usuarios.length,
      admins: usuarios.filter(u => u.rol === 'admin').length,
      tecnicos: usuarios.filter(u => u.rol === 'tecnico').length,
      clientes: usuarios.filter(u => u.rol === 'cliente').length,
      activos: usuarios.filter(u => u.estado === 'activo').length,
      pendientes: usuarios.filter(u => u.estado === 'pendiente').length,
      inactivos: usuarios.filter(u => u.estado === 'inactivo').length
    };

    res.status(200).json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}