// ============= pages/api/documents/[type]/pdf/[id].js =============
import { withAuth, ROLES } from '../../../../../lib/auth-middleware';
import { firestore } from '../../../../../lib/firebase-admin';

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

    // Verificar permisos de acceso (misma lógica que GET)
    if (user.role === ROLES.CLIENTE && docData.clienteId !== user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (user.role === ROLES.TECNICO && type !== 'ordenes') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (user.role === ROLES.TECNICO && type === 'ordenes' && docData.tecnicoAsignado?.id !== user.uid) {
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
