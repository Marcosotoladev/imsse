// pages/api/documents/[type]/count.js - Contar documentos sin traer todos
import { withAuth, ROLES } from '../../../../lib/auth-middleware';
import { firestore } from '../../../../lib/firebase-admin';

async function handler(req, res) {
  const { type } = req.query;
  const { user } = req;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const COLLECTIONS = {
    presupuestos: 'presupuestos',
    recibos: 'recibos',
    remitos: 'remitos',
    estados: 'estados_cuenta',
    ordenes: 'ordenes_trabajo',
    recordatorios: 'recordatorios'
  };

  if (!COLLECTIONS[type]) {
    return res.status(400).json({ error: 'Invalid document type' });
  }

  try {
    const collection = COLLECTIONS[type];
    let query = firestore.collection(collection);

    // Aplicar filtros según el rol (misma lógica que en index.js)
    if (user.role === ROLES.CLIENTE) {
      const userProfile = await firestore.collection('usuarios').doc(user.uid).get();
      const permisos = userProfile.data()?.permisos || {};
      
      if (!permisos[type]) {
        return res.status(403).json({ error: 'Access denied to this document type' });
      }
      
      query = query.where('clienteId', '==', user.uid);
    } else if (user.role === ROLES.TECNICO) {
      if (!['ordenes', 'recordatorios'].includes(type)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      if (type === 'ordenes') {
        query = query.where('tecnicoAsignado.id', '==', user.uid);
      } else if (type === 'recordatorios') {
        query = query.where('asignadoA', '==', user.uid);
      }
    }

    // Filtros adicionales
    const { status } = req.query;
    if (status) {
      query = query.where('estado', '==', status);
    }

    const snapshot = await query.count().get();
    
    return res.status(200).json({ 
      count: snapshot.data().count,
      type: type
    });
  } catch (error) {
    console.error('Error counting documents:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);