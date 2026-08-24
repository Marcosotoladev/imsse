import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { user } = req;

  // Solo admins pueden ver estadísticas de usuarios
  if (user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Sin permisos para ver estadísticas de usuarios' });
  }

  try {
    // Obtener todos los usuarios
    const usuariosSnapshot = await firestore.collection('usuarios').get();
    const usuarios = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calcular estadísticas
    const estadisticas = {
      total: usuarios.length,
      admins: usuarios.filter(u => u.rol === 'admin').length,
      tecnicos: usuarios.filter(u => u.rol === 'tecnico').length,
      clientes: usuarios.filter(u => u.rol === 'cliente').length,
      activos: usuarios.filter(u => u.estado === 'activo').length,
      inactivos: usuarios.filter(u => u.estado === 'inactivo').length
    };

    return res.status(200).json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export default withAuth(handler);