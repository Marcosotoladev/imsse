// ============= pages/api/statistics/index.js =============
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';

async function handler(req, res) {
  const { user } = req;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (user.role === ROLES.ADMIN) {
      return await getAdminStatistics(req, res);
    } else if (user.role === ROLES.CLIENTE) {
      return await getClientStatistics(req, res, user);
    } else if (user.role === ROLES.TECNICO) {
      return await getTechnicianStatistics(req, res, user);
    }
  } catch (error) {
    console.error('Error getting statistics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAdminStatistics(req, res) {
  try {
    const collections = ['presupuestos', 'recibos', 'remitos', 'estados_cuenta', 'ordenes_trabajo', 'recordatorios', 'usuarios'];
    
    const stats = {};
    
    for (const collection of collections) {
      const snapshot = await firestore.collection(collection).get();
      const docs = snapshot.docs.map(doc => doc.data());
      
      stats[collection] = {
        total: docs.length,
        // Estadísticas por estado si existe
        ...(docs.some(doc => doc.estado) && {
          porEstado: docs.reduce((acc, doc) => {
            const estado = doc.estado || 'sin_estado';
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
          }, {})
        }),
        // Estadísticas del mes actual
        estesMes: docs.filter(doc => {
          const fecha = doc.fechaCreacion?.toDate ? doc.fechaCreacion.toDate() : new Date(doc.fechaCreacion);
          const ahora = new Date();
          return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
        }).length
      };
    }

    // Estadísticas específicas de usuarios
    const usuarios = await firestore.collection('usuarios').get();
    const userData = usuarios.docs.map(doc => doc.data());
    
    stats.usuarios = {
      total: userData.length,
      porRol: userData.reduce((acc, user) => {
        const rol = user.rol || 'sin_rol';
        acc[rol] = (acc[rol] || 0) + 1;
        return acc;
      }, {}),
      porEstado: userData.reduce((acc, user) => {
        const estado = user.estado || 'sin_estado';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {}),
      nuevosEstesMes: userData.filter(user => {
        const fecha = user.fechaCreacion?.toDate ? user.fechaCreacion.toDate() : new Date(user.fechaCreacion);
        const ahora = new Date();
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
      }).length
    };

    return res.status(200).json({ statistics: stats });
  } catch (error) {
    throw error;
  }
}

async function getClientStatistics(req, res, user) {
  try {
    const collections = ['presupuestos', 'recibos', 'remitos', 'estados_cuenta', 'ordenes_trabajo'];
    const stats = {};
    
    for (const collection of collections) {
      const snapshot = await firestore.collection(collection)
        .where('clienteId', '==', user.uid)
        .get();
      
      const docs = snapshot.docs.map(doc => doc.data());
      
      stats[collection] = {
        total: docs.length,
        ...(docs.some(doc => doc.estado) && {
          porEstado: docs.reduce((acc, doc) => {
            const estado = doc.estado || 'sin_estado';
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
          }, {})
        })
      };
    }

    return res.status(200).json({ statistics: stats });
  } catch (error) {
    throw error;
  }
}

async function getTechnicianStatistics(req, res, user) {
  try {
    // Órdenes asignadas al técnico
    const ordenesSnapshot = await firestore.collection('ordenes_trabajo')
      .where('tecnicoAsignado.id', '==', user.uid)
      .get();
    
    const ordenes = ordenesSnapshot.docs.map(doc => doc.data());
    
    // Recordatorios del técnico
    const recordatoriosSnapshot = await firestore.collection('recordatorios')
      .where('asignadoA', '==', user.uid)
      .get();
    
    const recordatorios = recordatoriosSnapshot.docs.map(doc => doc.data());

    const stats = {
      ordenes_trabajo: {
        total: ordenes.length,
        porEstado: ordenes.reduce((acc, orden) => {
          const estado = orden.estado || 'sin_estado';
          acc[estado] = (acc[estado] || 0) + 1;
          return acc;
        }, {}),
        completadasEstesMes: ordenes.filter(orden => {
          const fecha = orden.fechaCompletado?.toDate ? orden.fechaCompletado.toDate() : null;
          if (!fecha) return false;
          const ahora = new Date();
          return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
        }).length
      },
      recordatorios: {
        total: recordatorios.length,
        pendientes: recordatorios.filter(r => r.estado === 'pendiente').length,
        completados: recordatorios.filter(r => r.estado === 'completado').length
      }
    };

    return res.status(200).json({ statistics: stats });
  } catch (error) {
    throw error;
  }
}

export default withAuth(handler);

