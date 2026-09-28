// pages/api/documents/[type]/count.js - MODIFICADO para incluir visitas
import { withAuth, ROLES } from '../../../../lib/auth-middleware';
import { firestore } from '../../../../lib/firebase-admin';
import { obtenerDocumentosCliente } from '../../../../lib/documentosCliente';
import { permisoParaUsuario } from '../../../../lib/permisosRolesServer';

async function handler(req, res) {
  const { type } = req.query;
  const { user } = req;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  if (!COLLECTIONS[type]) {
    return res.status(400).json({ error: 'Invalid document type' });
  }

  try {
    const collection = COLLECTIONS[type];
    let query = firestore.collection(collection);

    // Aplicar filtros según el rol (misma lógica que en index.js)
    if (user.role === ROLES.CLIENTE) {
      // Los accesos por Sede no se pueden expresar en una sola consulta: se cuentan los visibles
      const userProfile = await firestore.collection('usuarios').doc(user.uid).get();
      const visibles = await obtenerDocumentosCliente({
        coleccion: collection, tipo: type, perfil: userProfile.data() || {}, uid: user.uid
      });

      if (visibles === null) {
        return res.status(403).json({ error: 'Access denied to this document type' });
      }

      const { status } = req.query;
      const count = status ? visibles.filter((doc) => doc.estado === status).length : visibles.length;
      return res.status(200).json({ count, type });
    } else if (user.role !== ROLES.ADMIN) {
      // Técnico / Secretaria: según la grilla de permisos por rol
      const permiso = await permisoParaUsuario(user, type);
      if (permiso.ver === 'no') {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (permiso.ver === 'propios') {
        query = query.where('creadoPor', '==', user.uid);
      }
    }

    // Filtros adicionales
    const { status } = req.query;
    if (status) {
      query = query.where('estado', '==', status);
    }

    const snapshot = await query.count().get();
    
    return res.status(200).json({ 
      count: snapshot.data().count,
      type: type
    });
  } catch (error) {
    console.error('Error counting documents:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);