// pages/api/documents/[type]/[id].js
import { withAuth, ROLES } from '../../../../lib/auth-middleware';
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
  const { type, id } = req.query;
  const { user } = req;

  if (!COLLECTIONS[type]) {
    return res.status(400).json({ error: 'Invalid document type' });
  }

  switch (req.method) {
    case 'GET':
      return await getDocument(req, res, type, id, user);
    case 'PUT':
      return await updateDocument(req, res, type, id, user);
    case 'DELETE':
      return await deleteDocument(req, res, type, id, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getDocument(req, res, type, id, user) {
  try {
    const collection = COLLECTIONS[type];
    const docRef = firestore.collection(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const docData = doc.data();

    // Verificar permisos de acceso
    if (user.role === ROLES.CLIENTE && docData.clienteId !== user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (user.role === ROLES.TECNICO) {
      if (type === 'ordenes' && docData.tecnicoAsignado?.id !== user.uid) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (type === 'recordatorios' && docData.asignadoA !== user.uid) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (!['ordenes', 'recordatorios'].includes(type)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    return res.status(200).json({
      id: doc.id,
      ...docData,
      fechaCreacion: docData.fechaCreacion?.toDate?.() || docData.fechaCreacion,
      fechaModificacion: docData.fechaModificacion?.toDate?.() || docData.fechaModificacion
    });
  } catch (error) {
    console.error('Error getting document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateDocument(req, res, type, id, user) {
  try {
    const collection = COLLECTIONS[type];
    const docRef = firestore.collection(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const docData = doc.data();
    let updateData; // ✅ DECLARAR AQUÍ
    
    // Verificar permisos de edición
    if (user.role === ROLES.CLIENTE) {
      return res.status(403).json({ error: 'Clients cannot edit documents' });
    }

    if (user.role === ROLES.TECNICO) {
      // Solo puede editar ordenes asignadas y recordatorios propios
      if (type === 'ordenes' && docData.tecnicoAsignado?.id !== user.uid) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (type === 'recordatorios' && docData.asignadoA !== user.uid) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (!['ordenes', 'recordatorios'].includes(type)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Técnico solo puede actualizar ciertos campos
      const allowedFields = ['estado', 'notas', 'fechaCompletado', 'descripcionTrabajo', 'fotos'];
      updateData = {};
      
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = req.body[key];
        }
      });
      
      updateData.fechaModificacion = admin.firestore.FieldValue.serverTimestamp();
      updateData.modificadoPor = user.uid;
    } else {
      // ✅ Admin puede actualizar todo
      updateData = {
        ...req.body,
        fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
        modificadoPor: user.uid
      };
    }

    await docRef.update(updateData);
    
    return res.status(200).json({
      id,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteDocument(req, res, type, id, user) {
  try {
    // Solo admin puede eliminar
    if (user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Only admin can delete documents' });
    }

    const collection = COLLECTIONS[type];
    await firestore.collection(collection).doc(id).delete();
    
    return res.status(200).json({
      id,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
