// pages/api/dashboard/index.js - Dashboard específico por rol
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';

async function handler(req, res) {
  const { user } = req;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    switch (user.role) {
      case ROLES.ADMIN:
        return await getAdminDashboard(req, res);
      case ROLES.CLIENTE:
        return await getClientDashboard(req, res, user);
      case ROLES.TECNICO:
        return await getTechnicianDashboard(req, res, user);
      default:
        return res.status(403).json({ error: 'Invalid role' });
    }
  } catch (error) {
    console.error('Error getting dashboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAdminDashboard(req, res) {
  try {
    // Resumen rápido para admin
    const collections = ['presupuestos', 'recibos', 'remitos', 'estados_cuenta', 'ordenes_trabajo', 'recordatorios', 'usuarios'];
    
    const promises = collections.map(async (collection) => {
      const snapshot = await firestore.collection(collection).count().get();
      return { collection, count: snapshot.data().count };
    });
    
    const counts = await Promise.all(promises);
    
    // Actividad reciente (últimos 10 documentos)
    const recentActivity = await firestore
      .collectionGroup('ordenes_trabajo')
      .orderBy('fechaCreacion', 'desc')
      .limit(5)
      .get();
    
    const activity = recentActivity.docs.map(doc => ({
      id: doc.id,
      type: 'orden_trabajo',
      ...doc.data(),
      fechaCreacion: doc.data().fechaCreacion?.toDate?.() || doc.data().fechaCreacion
    }));

    return res.status(200).json({
      role: 'admin',
      counts: counts.reduce((acc, item) => {
        acc[item.collection] = item.count;
        return acc;
      }, {}),
      recentActivity: activity
    });
  } catch (error) {
    throw error;
  }
}

async function getClientDashboard(req, res, user) {
  try {
    const userProfile = await firestore.collection('usuarios').doc(user.uid).get();
    const permisos = userProfile.data()?.permisos || {};
    
    const dashboard = {
      role: 'cliente',
      permisos: permisos,
      counts: {},
      recentDocuments: []
    };
    
    // Solo contar lo que puede ver
    const allowedTypes = Object.entries(permisos)
      .filter(([type, allowed]) => allowed)
      .map(([type]) => type);
    
    for (const type of allowedTypes) {
      const collectionMap = {
        presupuestos: 'presupuestos',
        recibos: 'recibos',
        remitos: 'remitos',
        estados: 'estados_cuenta',
        ordenes: 'ordenes_trabajo'
      };
      
      if (collectionMap[type]) {
        const snapshot = await firestore
          .collection(collectionMap[type])
          .where('clienteId', '==', user.uid)
          .count()
          .get();
        
        dashboard.counts[type] = snapshot.data().count;
      }
    }
    
    return res.status(200).json(dashboard);
  } catch (error) {
    throw error;
  }
}

async function getTechnicianDashboard(req, res, user) {
  try {
    // Órdenes asignadas
    const ordenesSnapshot = await firestore
      .collection('ordenes_trabajo')
      .where('tecnicoAsignado.id', '==', user.uid)
      .count()
      .get();
    
    // Recordatorios
    const recordatoriosSnapshot = await firestore
      .collection('recordatorios')
      .where('asignadoA', '==', user.uid)
      .count()
      .get();
    
    // Órdenes pendientes
    const ordenesPendientes = await firestore
      .collection('ordenes_trabajo')
      .where('tecnicoAsignado.id', '==', user.uid)
      .where('estado', '==', 'pendiente')
      .limit(5)
      .get();
    
    return res.status(200).json({
      role: 'tecnico',
      counts: {
        ordenes_trabajo: ordenesSnapshot.data().count,
        recordatorios: recordatoriosSnapshot.data().count
      },
      ordenesPendientes: ordenesPendientes.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate?.() || doc.data().fechaCreacion
      }))
    });
  } catch (error) {
    throw error;
  }
}

export default withAuth(handler);