// lib/auth-middleware.js
import { auth, firestore } from './firebase-admin';

export const ROLES = {
  ADMIN: 'admin',
  TECNICO: 'tecnico', 
  CLIENTE: 'cliente'
};

export const PERMISSIONS = {
  // Documentos
  CREATE_DOCUMENT: 'create_document',
  READ_ALL_DOCUMENTS: 'read_all_documents',
  READ_OWN_DOCUMENTS: 'read_own_documents',
  UPDATE_DOCUMENT: 'update_document',
  DELETE_DOCUMENT: 'delete_document',
  
  // Órdenes de trabajo
  CREATE_ORDEN: 'create_orden',
  READ_ALL_ORDENES: 'read_all_ordenes',
  READ_ASSIGNED_ORDENES: 'read_assigned_ordenes',
  UPDATE_ORDEN: 'update_orden',
  
  // Recordatorios
  CREATE_REMINDER: 'create_reminder',
  READ_ALL_REMINDERS: 'read_all_reminders',
  READ_OWN_REMINDERS: 'read_own_reminders',
  
  // Usuarios
  CREATE_USER: 'create_user',
  READ_ALL_USERS: 'read_all_users',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user'
};

const rolePermissions = {
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_DOCUMENT,
    PERMISSIONS.READ_ALL_DOCUMENTS,
    PERMISSIONS.UPDATE_DOCUMENT,
    PERMISSIONS.DELETE_DOCUMENT,
    PERMISSIONS.CREATE_ORDEN,
    PERMISSIONS.READ_ALL_ORDENES,
    PERMISSIONS.UPDATE_ORDEN,
    PERMISSIONS.CREATE_REMINDER,
    PERMISSIONS.READ_ALL_REMINDERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_ALL_USERS,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER
  ],
  [ROLES.TECNICO]: [
    // ✅ CAMBIO PRINCIPAL: Técnicos ahora pueden ver TODAS las órdenes y recordatorios
    PERMISSIONS.CREATE_ORDEN,
    PERMISSIONS.READ_ALL_ORDENES,     // ✅ Cambiado de READ_ASSIGNED_ORDENES a READ_ALL_ORDENES
    PERMISSIONS.UPDATE_ORDEN,
    PERMISSIONS.CREATE_REMINDER,
    PERMISSIONS.READ_ALL_REMINDERS    // ✅ Cambiado de READ_OWN_REMINDERS a READ_ALL_REMINDERS
  ],
  [ROLES.CLIENTE]: [
    PERMISSIONS.READ_OWN_DOCUMENTS
  ]
};

export async function verifyAuth(req) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    const decodedToken = await auth.verifyIdToken(token);
    
    // Obtener datos adicionales del usuario desde Firestore
    const userDoc = await firestore
      .collection('usuarios')
      .doc(decodedToken.uid)
      .get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.rol,
      clientId: userData.clienteId, // Para filtrar documentos por cliente
      isActive: userData.estado === 'activo'
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function hasPermission(userRole, permission) {
  return rolePermissions[userRole]?.includes(permission) || false;
}

export function withAuth(handler, requiredPermissions = []) {
  return async (req, res) => {
    try {
      const user = await verifyAuth(req);
      
      if (!user.isActive) {
        return res.status(403).json({ error: 'User is inactive' });
      }

      // Verificar permisos
      for (const permission of requiredPermissions) {
        if (!hasPermission(user.role, permission)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
      }

      // Agregar user info al request
      req.user = user;
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  };
}