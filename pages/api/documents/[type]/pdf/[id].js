// ============= pages/api/documents/[type]/pdf/[id].js =============
import { withAuth, ROLES } from '../../../../../lib/auth-middleware';
import { firestore } from '../../../../../lib/firebase-admin';
import { contactoPuedeVer } from '../../../../../lib/documentosCliente';
import { permisoParaUsuario } from '../../../../../lib/permisosRolesServer';
import { puedeSobre } from '../../../../../lib/permisosRoles';

async function handler(req, res) {
  const { type, id } = req.query;
  const { user } = req;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const COLLECTIONS = {
    presupuestos: 'presupuestos',
    recibos: 'recibos',
    remitos: 'remitos',
    estados: 'estados_cuenta',
    ordenes: 'ordenes_trabajo'
  };

  if (!COLLECTIONS[type]) {
    return res.status(400).json({ error: 'Invalid document type' });
  }

  try {
    // Verificar que el documento existe y el usuario tiene permisos
    const docRef = firestore.collection(COLLECTIONS[type]).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const docData = doc.data();

    // Verificar permisos de acceso (misma lógica que GET): accesos del contacto a esa Empresa/Sede
    if (user.role === ROLES.CLIENTE) {
      const userProfile = await firestore.collection('usuarios').doc(user.uid).get();
      if (!contactoPuedeVer(userProfile.data() || {}, user.uid, type, docData)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (!puedeSobre(await permisoParaUsuario(user, type), 'ver', docData, user.uid)) {
      // Técnico / Secretaria: según la grilla de permisos por rol
      return res.status(403).json({ error: 'Access denied' });
    }

    // Por ahora retornamos la URL para descarga
    // Aquí podrías integrar una librería como jsPDF o Puppeteer
    return res.status(200).json({
      downloadUrl: `/api/documents/${type}/pdf/${id}/download`,
      document: {
        id: doc.id,
        ...docData,
        fechaCreacion: docData.fechaCreacion?.toDate?.() || docData.fechaCreacion
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
