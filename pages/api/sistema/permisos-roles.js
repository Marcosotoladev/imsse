// pages/api/sistema/permisos-roles.js - Grilla de permisos por rol (técnico, secretaria)
//   GET: cualquier usuario del personal. Devuelve la matriz efectiva de cada rol configurable y
//        la del propio usuario (`mio`), que usa el panel para armar el menú y los botones.
//   PUT: solo admin. Guarda { roles: { [rol]: { [tipo]: { ver, crear, editar, eliminar } } } }.
import { withAuth, ROLES, ROLES_PERSONAL } from '../../../lib/auth-middleware';
import admin from '../../../lib/firebase-admin';
import { ROLES_CONFIGURABLES, matrizDeRol, limpiarConfig } from '../../../lib/permisosRoles';
import { obtenerConfigPermisos, permisosRolesRef } from '../../../lib/permisosRolesServer';

async function handler(req, res) {
  const { user } = req;

  if (!ROLES_PERSONAL.includes(user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    if (req.method === 'GET') {
      const config = await obtenerConfigPermisos();
      const roles = Object.fromEntries(
        Object.keys(ROLES_CONFIGURABLES).map((rol) => [rol, matrizDeRol(config, rol)])
      );
      return res.status(200).json({ roles, mio: matrizDeRol(config, user.role), rol: user.role });
    }

    if (req.method === 'PUT') {
      if (user.role !== ROLES.ADMIN) {
        return res.status(403).json({ error: 'Solo el administrador puede cambiar los permisos' });
      }

      const roles = limpiarConfig(req.body?.roles);
      await permisosRolesRef().set({
        roles,
        fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
        modificadoPor: user.uid
      });

      return res.status(200).json({ roles, message: 'Permisos actualizados' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error en permisos por rol:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
