// lib/permisosRolesServer.js - Lectura de la config de permisos por rol. Solo servidor.
import { firestore } from './firebase-admin';
import { permisoDeRol, SIN_PERMISO } from './permisosRoles';

export const permisosRolesRef = () => firestore.collection('sistema').doc('permisosRoles');

// Config guardada por el admin ({} si todavía no se configuró: rigen los permisos por defecto)
export async function obtenerConfigPermisos() {
  const doc = await permisosRolesRef().get();
  return doc.exists ? (doc.data().roles || {}) : {};
}

// Permiso del usuario autenticado (req.user) sobre un tipo de documento
export async function permisoParaUsuario(user, tipo) {
  if (user.role === 'admin') return permisoDeRol(null, 'admin', tipo);
  if (user.role === 'cliente') return SIN_PERMISO;
  return permisoDeRol(await obtenerConfigPermisos(), user.role, tipo);
}
