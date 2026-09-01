// pages/api/tecnico/tecnicos.js - Lista de usuarios con rol técnico, para el
// desplegable de "Técnicos" en Órdenes de Trabajo / Inspección Técnica.
import { verifyAuth, ROLES } from '../../../lib/auth-middleware';
import { db } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const user = await verifyAuth(req);

    // Solo admins y técnicos pueden acceder
    if (![ROLES.ADMIN, ROLES.TECNICO].includes(user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (!db) {
      return res.status(500).json({ error: 'Base de datos no disponible' });
    }

    const usuariosRef = db.collection('usuarios');
    const tecnicosQuery = usuariosRef
      .where('rol', '==', 'tecnico')
      .where('estado', '==', 'activo');

    const tecnicosSnap = await tecnicosQuery.get();

    const tecnicos = [];
    tecnicosSnap.forEach((doc) => {
      const data = doc.data();
      tecnicos.push({
        id: doc.id,
        uid: doc.id,
        nombre: data.nombre || '',
        nombreCompleto: data.nombreCompleto || data.nombre || '',
        email: data.email || '',
        telefono: data.telefono || '',
        estado: data.estado || 'activo',
        rol: 'tecnico'
      });
    });

    tecnicos.sort((a, b) => (a.nombreCompleto || '').localeCompare(b.nombreCompleto || ''));

    res.status(200).json({
      success: true,
      users: tecnicos,
      tecnicos,
      total: tecnicos.length
    });
  } catch (error) {
    console.error('Error al obtener técnicos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}
