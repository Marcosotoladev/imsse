// pages/api/users/permissions/[id].js - Gestionar permisos específicos
import { withAuth, ROLES } from '../../../../lib/auth-middleware';
import { firestore } from '../../../../lib/firebase-admin';
import admin from '../../../../lib/firebase-admin';

async function handler(req, res) {
  const { id } = req.query;
  const { user } = req;

  // Solo admin puede gestionar permisos
  if (user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Only admin can manage permissions' });
  }

  switch (req.method) {
    case 'GET':
      return await getPermissions(req, res, id);
    case 'PUT':
      return await updatePermissions(req, res, id, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getPermissions(req, res, id) {
  try {
    const userDoc = await firestore.collection('usuarios').doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    return res.status(200).json({
      userId: id,
      rol: userData.rol,
      permisos: userData.permisos || {},
      estado: userData.estado
    });
  } catch (error) {
    console.error('Error getting permissions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updatePermissions(req, res, id, user) {
  try {
    const { permisos } = req.body;
    
    if (!permisos || typeof permisos !== 'object') {
      return res.status(400).json({ error: 'Invalid permissions object' });
    }

    // Validar que los permisos son válidos
    const validPermissions = [
      'presupuestos', 'recibos', 'remitos', 'estados', 
      'ordenes', 'recordatorios'
    ];
    
    const invalidPerms = Object.keys(permisos).filter(
      perm => !validPermissions.includes(perm)
    );
    
    if (invalidPerms.length > 0) {
      return res.status(400).json({ 
        error: `Invalid permissions: ${invalidPerms.join(', ')}` 
      });
    }

    await firestore.collection('usuarios').doc(id).update({
      permisos: permisos,
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
      modificadoPor: user.uid
    });
    
    return res.status(200).json({
      userId: id,
      message: 'Permissions updated successfully',
      permisos: permisos
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
