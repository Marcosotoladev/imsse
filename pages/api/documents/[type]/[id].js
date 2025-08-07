// pages/api/documents/[type]/[id].js - MODIFICADO
import { withAuth, ROLES } from '../../../../lib/auth-middleware';
import { firestore } from '../../../../lib/firebase-admin';
import admin from '../../../../lib/firebase-admin';

const COLLECTIONS = {
  presupuestos: 'presupuestos',
  recibos: 'recibos', 
  remitos: 'remitos',
  estados: 'estados_cuenta',
  ordenes: 'ordenes_trabajo',
  recordatorios: 'recordatorios',
  visitas: 'visitas'
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
      // ✅ CAMBIO: Técnicos pueden acceder a órdenes, recordatorios Y VISITAS
      if (!['ordenes', 'recordatorios', 'visitas'].includes(type)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      // ✅ Removemos las verificaciones de asignación específica
      // Las siguientes líneas se eliminan:
      // if (type === 'ordenes' && docData.tecnicoAsignado?.id !== user.uid) {
      //   return res.status(403).json({ error: 'Access denied' });
      // }
      // if (type === 'recordatorios' && docData.asignadoA !== user.uid) {
      //   return res.status(403).json({ error: 'Access denied' });
      // }
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
    let updateData;
    
    // Verificar permisos de edición
    if (user.role === ROLES.CLIENTE) {
      return res.status(403).json({ error: 'Clients cannot edit documents' });
    }

    if (user.role === ROLES.TECNICO) {
      // ✅ CAMBIO: Técnicos pueden editar órdenes, recordatorios Y VISITAS
      if (!['ordenes', 'recordatorios', 'visitas'].includes(type)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // ✅ Removemos las verificaciones de asignación específica
      // Las siguientes líneas se eliminan:
      // if (type === 'ordenes' && docData.tecnicoAsignado?.id !== user.uid) {
      //   return res.status(403).json({ error: 'Access denied' });
      // }
      // if (type === 'recordatorios' && docData.asignadoA !== user.uid) {
      //   return res.status(403).json({ error: 'Access denied' });
      // }
      
      // ✅ CAMBIO: Técnicos pueden actualizar más campos incluyendo campos de visitas
      const allowedFields = [
        'estado', 'notas', 'fechaCompletado', 'descripcionTrabajo', 'fotos',
        'titulo', 'descripcion', 'fechaRecordatorio', 'prioridad', 'completado',
        'cliente', 'direccion', 'telefono', 'email', 'observaciones',
        // Campos específicos para visitas:
        'fecha', 'hora', 'empresa', 'detalle'
      ];
      updateData = {};
      
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = req.body[key];
        }
      });
      
      updateData.fechaModificacion = admin.firestore.FieldValue.serverTimestamp();
      updateData.modificadoPor = user.uid;
      
      // Para visitas, agregar campos de auditoría específicos
      if (type === 'visitas') {
        updateData.usuarioModificador = user.displayName || user.email || 'Usuario IMSSE';
      }
    } else {
      // Admin puede actualizar todo
      updateData = {
        ...req.body,
        fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
        modificadoPor: user.uid
      };
      
      // Para visitas, agregar campos de auditoría específicos
      if (type === 'visitas') {
        updateData.usuarioModificador = user.displayName || user.email || 'Usuario IMSSE';
      }
    }

    await docRef.update(updateData);
    
    return res.status(200).json({
      id,
      message: 'Document updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteDocument(req, res, type, id, user) {
  try {
    // ✅ CAMBIO: Técnicos también pueden eliminar órdenes, recordatorios Y VISITAS
    if (user.role === ROLES.CLIENTE) {
      return res.status(403).json({ error: 'Clients cannot delete documents' });
    }

    if (user.role === ROLES.TECNICO && !['ordenes', 'recordatorios', 'visitas'].includes(type)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const collection = COLLECTIONS[type];
    await firestore.collection(collection).doc(id).delete();
    
    return res.status(200).json({
      id,
      message: 'Document deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);