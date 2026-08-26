import { firestore } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uid, userData } = req.body;

    // Vincular (o crear) la Empresa a partir del nombre cargado en el registro,
    // para que el contacto quede asociado a la misma Empresa que sus futuros compañeros.
    let empresaId = null;
    const nombreEmpresa = (userData.empresa || '').trim();

    if (nombreEmpresa) {
      const nombreEmpresaLower = nombreEmpresa.toLowerCase();
      const empresasExistentes = await firestore
        .collection('empresas')
        .where('razonSocialLower', '==', nombreEmpresaLower)
        .limit(1)
        .get();

      if (!empresasExistentes.empty) {
        empresaId = empresasExistentes.docs[0].id;
      } else {
        const nuevaEmpresaRef = await firestore.collection('empresas').add({
          razonSocial: nombreEmpresa,
          razonSocialLower: nombreEmpresaLower,
          cuit: '',
          direccionPrincipal: '',
          telefono: userData.telefono || '',
          emailPrincipal: '',
          sedes: [],
          estado: 'activo',
          creadoPor: uid,
          fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
          fechaModificacion: admin.firestore.FieldValue.serverTimestamp()
        });
        empresaId = nuevaEmpresaRef.id;
      }
    }

    await firestore.collection('usuarios').doc(uid).set({
      ...userData,
      empresaId,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
      estado: userData.estado || 'activo',
      rol: userData.tipoSolicitud || 'cliente'
    });

    return res.status(201).json({ message: 'Profile created', uid, empresaId });
  } catch (error) {
    console.error('Error al crear perfil de usuario:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}