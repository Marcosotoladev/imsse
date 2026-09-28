// pages/api/documents/[type]/[id].js - Ver, editar y eliminar un documento
// (cliente: por accesos a Empresa/Sede; técnico/secretaria: por la grilla de permisos por rol; admin: todo)
import { withAuth, ROLES } from '../../../../lib/auth-middleware';
import { firestore } from '../../../../lib/firebase-admin';
import admin from '../../../../lib/firebase-admin';
import { contactoPuedeVer } from '../../../../lib/documentosCliente';
import { resolverEmpresaSede } from '../../../../lib/empresaSede';
import { permisoParaUsuario } from '../../../../lib/permisosRolesServer';
import { puedeSobre } from '../../../../lib/permisosRoles';

const COLLECTIONS = {
  presupuestos: 'presupuestos',
  recibos: 'recibos',
  remitos: 'remitos',
  estados: 'estados_cuenta',
  ordenes: 'ordenes_trabajo',
  recordatorios: 'recordatorios',
  visitas: 'visitas',
  inspecciones: 'inspecciones_tecnicas',
  plantillas: 'plantillas_inspeccion',
  planaccion: 'plan_accion'
};

// Campos que nadie cambia al editar: quién y cuándo lo creó (de eso depende "solo propios")
const CAMPOS_PROTEGIDOS = ['id', 'creadoPor', 'fechaCreacion'];

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

    if (user.role === ROLES.CLIENTE) {
      // Según los accesos del contacto a esa Empresa/Sede y tipo
      const userProfile = await firestore.collection('usuarios').doc(user.uid).get();
      if (!contactoPuedeVer(userProfile.data() || {}, user.uid, type, docData)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Observaciones internas: comunicación técnico-admin, nunca visible para el cliente
      delete docData.observacionesImsse;
    } else if (!puedeSobre(await permisoParaUsuario(user, type), 'ver', docData, user.uid)) {
      return res.status(403).json({ error: 'Access denied' });
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

    if (user.role === ROLES.CLIENTE) {
      return res.status(403).json({ error: 'Clients cannot edit documents' });
    }

    if (!puedeSobre(await permisoParaUsuario(user, type), 'editar', docData, user.uid)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = { ...req.body };
    CAMPOS_PROTEGIDOS.forEach((campo) => delete updateData[campo]);
    updateData.fechaModificacion = admin.firestore.FieldValue.serverTimestamp();
    updateData.modificadoPor = user.uid;

    // Para visitas, agregar campos de auditoría específicos
    if (type === 'visitas') {
      updateData.usuarioModificador = user.displayName || user.email || 'Usuario IMSSE';
    }

    // Si cambia la Empresa o la Sede, validar que exista y que la Sede sea de esa Empresa
    if ('empresaId' in updateData || 'sedeId' in updateData) {
      const empresaId = ('empresaId' in updateData ? updateData.empresaId : docData.empresaId) || null;
      const sedeId = ('sedeId' in updateData
        ? updateData.sedeId
        : empresaId === (docData.empresaId || null) ? docData.sedeId : null) || null;

      if (empresaId !== (docData.empresaId || null) || sedeId !== (docData.sedeId || null)) {
        const vinculo = await resolverEmpresaSede({ empresaId, sedeId });
        if (vinculo.error) {
          return res.status(400).json({ error: vinculo.error });
        }
        updateData.empresaId = vinculo.empresaId;
        updateData.sedeId = vinculo.sedeId;
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
    if (user.role === ROLES.CLIENTE) {
      return res.status(403).json({ error: 'Clients cannot delete documents' });
    }

    const docRef = firestore.collection(COLLECTIONS[type]).doc(id);
    const doc = await docRef.get();

    // Ya no existe: se responde OK igual (idempotente, como antes), para que la cola offline
    // no quede trabada reintentando un borrado que ya ocurrió.
    if (!doc.exists) {
      return res.status(200).json({ id, message: 'Document deleted successfully', success: true });
    }

    if (!puedeSobre(await permisoParaUsuario(user, type), 'eliminar', doc.data(), user.uid)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await docRef.delete();

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
