// lib/documentosPersonal.js - Listado de documentos para el personal (técnico/secretaria/admin)
// según la grilla de permisos por rol. Solo servidor.
import { firestore } from './firebase-admin';
import { permisoParaUsuario } from './permisosRolesServer';

// Devuelve los documentos visibles (más recientes primero), o null si no puede ver ese tipo.
export async function listarDocumentosPersonal(user, tipo, coleccion) {
  const permiso = await permisoParaUsuario(user, tipo);
  if (permiso.ver === 'no') return null;

  const base = firestore.collection(coleccion);
  const snapshot = permiso.ver === 'propios'
    ? await base.where('creadoPor', '==', user.uid).get()
    : await base.get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
        fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
      };
    })
    .sort((a, b) => new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0));
}
