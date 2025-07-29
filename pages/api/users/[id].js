// pages/api/users/[id].js
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore, auth } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';

async function handler(req, res) {
  const { id } = req.query;
  const { user } = req;

  switch (req.method) {
    case 'GET':
      return await getUser(req, res, id, user);
    case 'PUT':
      return await updateUser(req, res, id, user);
    case 'DELETE':
      return await deleteUser(req, res, id, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getUser(req, res, id, user) {
  try {
    // Usuario puede ver su propio perfil, admin puede ver cualquiera
    if (user.uid !== id && user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userDoc = await firestore.collection('usuarios').doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    // No enviar datos sensibles
    const safeUserData = {
      id: userDoc.id,
      email: userData.email,
      nombre: userData.nombre,
      apellido: userData.apellido,
      empresa: userData.empresa,
      telefono: userData.telefono,
      rol: userData.rol,
      estado: userData.estado,
      permisos: userData.permisos,
      clienteId: userData.clienteId,
      metodoBegistro: userData.metodoBegistro,
      fechaCreacion: userData.fechaCreacion?.toDate?.() || userData.fechaCreacion,
      fechaModificacion: userData.fechaModificacion?.toDate?.() || userData.fechaModificacion,
      fechaUltimoAcceso: userData.fechaUltimoAcceso?.toDate?.() || userData.fechaUltimoAcceso
    };
    
    return res.status(200).json(safeUserData);
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateUser(req, res, id, user) {
  try {
    // Usuario puede actualizar su propio perfil, admin puede actualizar cualquiera
    if (user.uid !== id && user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userDoc = await firestore.collection('usuarios').doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    let updateData = { ...req.body };
    
    // Solo admin puede cambiar rol, estado y permisos
    if (user.role !== ROLES.ADMIN) {
      delete updateData.rol;
      delete updateData.estado;
      delete updateData.permisos;
      delete updateData.clienteId;
      
      // Usuarios normales solo pueden actualizar datos personales
      const allowedFields = [
        'nombre', 'apellido', 'telefono', 'empresa', 
        'direccion', 'ciudad', 'codigoPostal'
      ];
      
      const filteredUpdate = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredUpdate[field] = updateData[field];
        }
      });
      
      updateData = filteredUpdate;
    }

    // Validaciones específicas para admin
    if (user.role === ROLES.ADMIN) {
      // Validar rol válido
      if (updateData.rol && !Object.values(ROLES).includes(updateData.rol)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      
      // Validar estado válido
      if (updateData.estado && !['activo', 'inactivo', 'pendiente'].includes(updateData.estado)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      // Si cambia el rol a cliente, asegurar que tenga clienteId
      if (updateData.rol === ROLES.CLIENTE && !updateData.clienteId) {
        updateData.clienteId = id;
      }
      
      // Si cambia de cliente a otro rol, limpiar clienteId
      if (updateData.rol && updateData.rol !== ROLES.CLIENTE) {
        updateData.clienteId = null;
      }
    }

    // Agregar metadata
    updateData.fechaModificacion = admin.firestore.FieldValue.serverTimestamp();
    updateData.modificadoPor = user.uid;

    // Si está vacío después de filtrar, no hacer nada
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await firestore.collection('usuarios').doc(id).update(updateData);
    
    return res.status(200).json({
      id,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteUser(req, res, id, user) {
  try {
    // Solo admin puede eliminar usuarios
    if (user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Only admin can delete users' });
    }

    // No permitir que admin se elimine a sí mismo
    if (user.uid === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const userDoc = await firestore.collection('usuarios').doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    // Verificar si es el último admin activo (prevención de seguridad)
    if (userData.rol === ROLES.ADMIN) {
      const adminsSnapshot = await firestore.collection('usuarios')
        .where('rol', '==', ROLES.ADMIN)
        .where('estado', '==', 'activo')
        .get();
      
      if (adminsSnapshot.size <= 1) {
        return res.status(400).json({ 
          error: 'Cannot delete the last active administrator' 
        });
      }
    }

    // Eliminar completamente el documento de Firestore
    await firestore.collection('usuarios').doc(id).delete();

    // Intentar eliminar de Firebase Auth (puede fallar si el usuario no existe en Auth)
    try {
      await auth.deleteUser(id);
      console.log(`Usuario ${id} eliminado de Firebase Auth`);
    } catch (authError) {
      console.warn(`No se pudo eliminar usuario ${id} de Auth:`, authError.message);
      // No fallar si no se puede eliminar de Auth
    }

    // Log de auditoría
    console.log(`Usuario eliminado - ID: ${id}, Email: ${userData.email}, Eliminado por: ${user.email}`);
    
    return res.status(200).json({
      id,
      message: 'User deleted successfully',
      deletedUser: {
        id: id,
        email: userData.email,
        nombreCompleto: userData.nombreCompleto || userData.nombre + ' ' + userData.apellido
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default withAuth(handler);