// pages/api/empresas/index.js - CRUD de Empresas (clientes) y sus Sedes
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';

async function handler(req, res) {
  const { user } = req;

  switch (req.method) {
    case 'GET':
      return await getEmpresas(req, res, user);
    case 'POST':
      return await createEmpresa(req, res, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getEmpresas(req, res, user) {
  try {
    // Admin gestiona Empresas; técnico solo necesita leerlas para elegir Sede al crear una orden
    if (user.role !== ROLES.ADMIN && user.role !== ROLES.TECNICO) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const snapshot = await firestore.collection('empresas').orderBy('razonSocial').get();

    const empresas = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
        fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
      };
    });

    return res.status(200).json({ empresas });
  } catch (error) {
    console.error('Error getting empresas:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createEmpresa(req, res, user) {
  try {
    if (user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      razonSocial = '',
      cuit = '',
      direccionPrincipal = '',
      telefono = '',
      emailPrincipal = '',
      sedes = []
    } = req.body;

    if (!razonSocial.trim()) {
      return res.status(400).json({ error: 'La razón social / nombre de la empresa es obligatorio' });
    }

    const empresaData = {
      razonSocial: razonSocial.trim(),
      razonSocialLower: razonSocial.trim().toLowerCase(),
      cuit: cuit.trim(),
      direccionPrincipal: direccionPrincipal.trim(),
      telefono: telefono.trim(),
      emailPrincipal: emailPrincipal.trim(),
      sedes: Array.isArray(sedes) ? sedes : [],
      estado: 'activo',
      creadoPor: user.uid,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await firestore.collection('empresas').add(empresaData);

    return res.status(201).json({
      id: docRef.id,
      ...empresaData,
      fechaCreacion: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating empresa:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export default withAuth(handler);
