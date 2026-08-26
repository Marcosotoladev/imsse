// pages/api/admin/backfill-empresas.js
// Migración de datos históricos al modelo Empresa + Contactos:
//   1. A cada contacto (usuarios rol=cliente) sin empresaId le crea/vincula una Empresa
//      a partir de su campo `empresa` (texto libre).
//   2. A cada documento histórico (presupuestos, remitos, recibos, estados de cuenta,
//      órdenes) le estampa `empresaId` a partir del `clienteId` que ya tenía, para que
//      sea visible a todos los contactos de esa Empresa (no solo al contacto original).
// Es idempotente: correrla más de una vez no duplica empresas ni reprocesa lo ya migrado.
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';

const DOCUMENT_COLLECTIONS = ['presupuestos', 'remitos', 'recibos', 'estados_cuenta', 'ordenes_trabajo'];
const BATCH_LIMIT = 400;

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user } = req;
  if (user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Solo administradores pueden ejecutar la migración' });
  }

  try {
    const resumen = {
      empresasCreadas: 0,
      empresasReutilizadas: 0,
      contactosVinculados: 0,
      contactosYaVinculados: 0,
      contactosSinEmpresa: 0,
      documentosActualizados: 0,
      documentosYaMigrados: 0,
      documentosSinCoincidencia: 0
    };

    // 1. Vincular cada contacto cliente a una Empresa
    const clientesSnapshot = await firestore.collection('usuarios').where('rol', '==', 'cliente').get();
    const empresaIdPorUid = {};
    const empresaCache = {};

    for (const doc of clientesSnapshot.docs) {
      const data = doc.data();

      if (data.empresaId) {
        empresaIdPorUid[doc.id] = data.empresaId;
        resumen.contactosYaVinculados++;
        continue;
      }

      const nombreEmpresa = (data.empresa || '').trim();
      if (!nombreEmpresa) {
        resumen.contactosSinEmpresa++;
        continue;
      }

      const nombreLower = nombreEmpresa.toLowerCase();
      let empresaId = empresaCache[nombreLower];

      if (!empresaId) {
        const existentes = await firestore
          .collection('empresas')
          .where('razonSocialLower', '==', nombreLower)
          .limit(1)
          .get();

        if (!existentes.empty) {
          empresaId = existentes.docs[0].id;
          resumen.empresasReutilizadas++;
        } else {
          const nuevaEmpresaRef = await firestore.collection('empresas').add({
            razonSocial: nombreEmpresa,
            razonSocialLower: nombreLower,
            cuit: '',
            direccionPrincipal: data.direccion || '',
            telefono: data.telefono || '',
            emailPrincipal: '',
            sedes: [],
            estado: 'activo',
            creadoPor: user.uid,
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
            fechaModificacion: admin.firestore.FieldValue.serverTimestamp()
          });
          empresaId = nuevaEmpresaRef.id;
          resumen.empresasCreadas++;
        }

        empresaCache[nombreLower] = empresaId;
      }

      await firestore.collection('usuarios').doc(doc.id).update({
        empresaId,
        fechaModificacion: admin.firestore.FieldValue.serverTimestamp()
      });

      empresaIdPorUid[doc.id] = empresaId;
      resumen.contactosVinculados++;
    }

    // 2. Estampar empresaId en los documentos históricos a partir de su clienteId
    for (const coleccion of DOCUMENT_COLLECTIONS) {
      const snapshot = await firestore.collection(coleccion).get();

      let batch = firestore.batch();
      let opsEnBatch = 0;

      for (const doc of snapshot.docs) {
        const docData = doc.data();

        if (docData.empresaId) {
          resumen.documentosYaMigrados++;
          continue;
        }

        const empresaId = docData.clienteId ? empresaIdPorUid[docData.clienteId] : null;

        if (!empresaId) {
          resumen.documentosSinCoincidencia++;
          continue;
        }

        batch.update(doc.ref, { empresaId });
        opsEnBatch++;
        resumen.documentosActualizados++;

        if (opsEnBatch >= BATCH_LIMIT) {
          await batch.commit();
          batch = firestore.batch();
          opsEnBatch = 0;
        }
      }

      if (opsEnBatch > 0) {
        await batch.commit();
      }
    }

    return res.status(200).json({ message: 'Migración completada', resumen });
  } catch (error) {
    console.error('Error en backfill de empresas:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export default withAuth(handler);
