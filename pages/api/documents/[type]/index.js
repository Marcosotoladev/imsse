// ============= pages/api/documents/[type]/index.js =============//
import { withAuth, PERMISSIONS, ROLES } from '../../../../lib/auth-middleware';
import { firestore } from '../../../../lib/firebase-admin';
import admin from '../../../../lib/firebase-admin';

const COLLECTIONS = {
  presupuestos: 'presupuestos',
  recibos: 'recibos',
  remitos: 'remitos',
  estados: 'estados_cuenta',
  ordenes: 'ordenes_trabajo',
  recordatorios: 'recordatorios'
};

async function handler(req, res) {
  const { type } = req.query;
  const { user } = req;

  if (!COLLECTIONS[type]) {
    return res.status(400).json({ error: 'Invalid document type' });
  }

  switch (req.method) {
    case 'GET':
      return await getDocuments(req, res, type, user);
    case 'POST':
      return await createDocument(req, res, type, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getDocuments(req, res, type, user) {
  try {
    const collection = COLLECTIONS[type];
    let query = firestore.collection(collection);

    // Aplicar filtros según el rol
    if (user.role === ROLES.CLIENTE) {
      // Cliente: solo sus documentos y verificar permisos
      const userProfile = await firestore.collection('usuarios').doc(user.uid).get();
      const permisos = userProfile.data()?.permisos || {};
      
      if (!permisos[type]) {
        return res.status(403).json({ error: 'Access denied to this document type' });
      }
      
      query = query.where('clienteId', '==', user.uid);
    } else if (user.role === ROLES.TECNICO) {
      // Técnico: solo órdenes y recordatorios
      if (!['ordenes', 'recordatorios'].includes(type)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      if (type === 'ordenes') {
        query = query.where('tecnicoAsignado.id', '==', user.uid);
      } else if (type === 'recordatorios') {
        query = query.where('asignadoA', '==', user.uid);
      }
    }
    // ADMIN: acceso completo, no se aplican filtros

    // Filtros adicionales por query params
    const { status, dateFrom, dateTo, clientId } = req.query;
    
    if (status) {
      query = query.where('estado', '==', status);
    }
    
    if (dateFrom) {
      query = query.where('fechaCreacion', '>=', new Date(dateFrom));
    }
    
    if (dateTo) {
      query = query.where('fechaCreacion', '<=', new Date(dateTo));
    }
    
    if (clientId && user.role === ROLES.ADMIN) {
      query = query.where('clienteId', '==', clientId);
    }

    const snapshot = await query.orderBy('fechaCreacion', 'desc').get();
    
    const documents = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
        fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
      };
    });

    return res.status(200).json({ documents });
  } catch (error) {
    console.error('Error getting documents:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createDocument(req, res, type, user) {
  try {
    const collection = COLLECTIONS[type];
    const data = req.body;

    // Validaciones según el tipo y rol
    if (user.role === ROLES.CLIENTE) {
      return res.status(403).json({ error: 'Clients cannot create documents' });
    }

    if (user.role === ROLES.TECNICO && !['recordatorios'].includes(type)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Agregar metadatos
    const docData = {
      ...data,
      creadoPor: user.uid,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
      estado: data.estado || 'borrador'
    };

    const docRef = await firestore.collection(collection).add(docData);
    
    return res.status(201).json({
      id: docRef.id,
      message: 'Document created successfully'
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);