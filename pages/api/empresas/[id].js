// pages/api/empresas/[id].js
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';

async function handler(req, res) {
  const { id } = req.query;
  const { user } = req;

  switch (req.method) {
    case 'GET':
      return await getEmpresa(req, res, id, user);
    case 'PUT':
      return await updateEmpresa(req, res, id, user);
    case 'DELETE':
      return await deleteEmpresa(req, res, id, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getEmpresa(req, res, id, user) {
  try {
    // Admin ve cualquiera; un contacto puede leer los datos de su propia empresa
    if (user.role !== ROLES.ADMIN && user.clientId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const doc = await firestore.collection('empresas').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const data = doc.data();
    return res.status(200).json({
      id: doc.id,
      ...data,
      fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
      fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
    });
  } catch (error) {
    console.error('Error getting empresa:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateEmpresa(req, res, id, user) {
  try {
    if (user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const doc = await firestore.collection('empresas').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    const {
      razonSocial,
      cuit,
      direccionPrincipal,
      telefono,
      emailPrincipal,
      sedes,
      estado
    } = req.body;

    if (razonSocial !== undefined && !razonSocial.trim()) {
      return res.status(400).json({ error: 'La razón social / nombre de la empresa es obligatorio' });
    }

    const updateData = { fechaModificacion: admin.firestore.FieldValue.serverTimestamp() };
    if (razonSocial !== undefined) {
      updateData.razonSocial = razonSocial.trim();
      updateData.razonSocialLower = razonSocial.trim().toLowerCase();
    }
    if (cuit !== undefined) updateData.cuit = cuit.trim();
    if (direccionPrincipal !== undefined) updateData.direccionPrincipal = direccionPrincipal.trim();
    if (telefono !== undefined) updateData.telefono = telefono.trim();
    if (emailPrincipal !== undefined) updateData.emailPrincipal = emailPrincipal.trim();
    if (Array.isArray(sedes)) updateData.sedes = sedes;
    if (estado !== undefined) updateData.estado = estado;

    await firestore.collection('empresas').doc(id).update(updateData);

    return res.status(200).json({ id, message: 'Empresa actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating empresa:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteEmpresa(req, res, id, user) {
  try {
    if (user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const doc = await firestore.collection('empresas').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    // No permitir eliminar una empresa con contactos (usuarios) vinculados
    const contactosSnapshot = await firestore
      .collection('usuarios')
      .where('empresaId', '==', id)
      .limit(1)
      .get();

    if (!contactosSnapshot.empty) {
      return res.status(400).json({
        error: 'No se puede eliminar: hay contactos vinculados a esta empresa. Reasigná o eliminá esos contactos primero.'
      });
    }

    await firestore.collection('empresas').doc(id).delete();

    return res.status(200).json({ message: 'Empresa eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting empresa:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
