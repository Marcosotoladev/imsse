 // pages/api/users/index.js
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';

async function handler(req, res) {
  const { user } = req;

  switch (req.method) {
    case 'GET':
      return await getUsers(req, res, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getUsers(req, res, user) {
  try {
    if (user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { role, status } = req.query;
    let query = firestore.collection('usuarios');

    if (role) {
      query = query.where('rol', '==', role);
    }

    if (status) {
      query = query.where('estado', '==', status);
    }

    const snapshot = await query.orderBy('fechaCreacion', 'desc').get();
    
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
        fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
      };
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler); 

/* // pages/api/users/index.js - TEMPORAL SIN AUTH
import { firestore } from '../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 API /users llamada');
    return res.status(200).json({ message: 'API funciona correctamente' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} */