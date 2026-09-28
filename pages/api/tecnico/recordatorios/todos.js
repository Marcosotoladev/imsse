// pages/api/tecnico/recordatorios/todos.js - Recordatorios visibles para el personal (se usa para
// llenar el caché offline), según la grilla de permisos por rol.
import { verifyAuth, ROLES_PERSONAL } from '../../../../lib/auth-middleware';
import { listarDocumentosPersonal } from '../../../../lib/documentosPersonal';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const user = await verifyAuth(req);

    if (!ROLES_PERSONAL.includes(user.role) || !user.isActive) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const recordatorios = await listarDocumentosPersonal(user, 'recordatorios', 'recordatorios');
    if (recordatorios === null) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    res.status(200).json({
      success: true,
      documents: recordatorios,
      total: recordatorios.length
    });
  } catch (error) {
    console.error('Error al obtener recordatorios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
