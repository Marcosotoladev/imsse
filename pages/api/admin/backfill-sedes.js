// pages/api/admin/backfill-sedes.js
// Migración de datos históricos al modelo de accesos por Empresa + Sede:
//   1. A cada contacto (usuarios rol=cliente) con empresaId pero sin `accesos` le escribe los
//      accesos equivalentes a lo que ya veía: todas las sedes de su empresa, para los tipos que
//      tenía habilitados en `permisos`.
//   2. A cada documento con empresaId pero sin `sedeId` le estampa la Sede, buscando la que tenga
//      el mismo nombre que `cliente.sedeNombre` (lo que se eligió al crearlo). Si no hay
//      coincidencia queda sedeId: null (Dirección Principal). Los documentos sin empresaId pero
//      con clienteId toman la empresa del contacto.
// Es idempotente: correrla más de una vez no reprocesa lo ya migrado.
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';
import { accesosEfectivos } from '../../../lib/accesos';

const DOCUMENT_COLLECTIONS = [
  'presupuestos', 'remitos', 'recibos', 'estados_cuenta', 'ordenes_trabajo', 'inspecciones_tecnicas', 'plan_accion'
];
const BATCH_LIMIT = 400;

const normalizar = (texto) => (texto || '').trim().toLowerCase().replace(/\s+/g, ' ');

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
      contactosMigrados: 0,
      contactosYaMigrados: 0,
      contactosSinEmpresa: 0,
      documentosConSede: 0,
      documentosDireccionPrincipal: 0,
      documentosYaMigrados: 0,
      documentosSinEmpresa: 0
    };

    // 1. Accesos de los contactos
    const clientesSnapshot = await firestore.collection('usuarios').where('rol', '==', 'cliente').get();
    const empresaIdPorUid = {};

    for (const doc of clientesSnapshot.docs) {
      const data = doc.data();
      if (data.empresaId) empresaIdPorUid[doc.id] = data.empresaId;

      if (data.accesos) {
        resumen.contactosYaMigrados++;
        continue;
      }
      if (!data.empresaId) {
        // Sin empresa siguen viendo solo lo emitido a ellos (clienteId), no se tocan
        resumen.contactosSinEmpresa++;
        continue;
      }

      await doc.ref.update({
        accesos: accesosEfectivos(data),
        fechaModificacion: admin.firestore.FieldValue.serverTimestamp()
      });
      resumen.contactosMigrados++;
    }

    // 2. Sede de los documentos
    const empresasSnapshot = await firestore.collection('empresas').get();
    const sedesPorEmpresa = {};
    for (const doc of empresasSnapshot.docs) {
      sedesPorEmpresa[doc.id] = new Map(
        (doc.data().sedes || []).map((sede) => [normalizar(sede.nombreObra), sede.id])
      );
    }

    for (const coleccion of DOCUMENT_COLLECTIONS) {
      const snapshot = await firestore.collection(coleccion).get();

      let batch = firestore.batch();
      let opsEnBatch = 0;

      for (const doc of snapshot.docs) {
        const docData = doc.data();

        if (docData.sedeId !== undefined) {
          resumen.documentosYaMigrados++;
          continue;
        }

        const empresaId = docData.empresaId || (docData.clienteId ? empresaIdPorUid[docData.clienteId] : null);
        if (!empresaId) {
          resumen.documentosSinEmpresa++;
          continue;
        }

        const sedeNombre = normalizar(docData.cliente?.sedeNombre);
        const sedeId = (sedeNombre && sedesPorEmpresa[empresaId]?.get(sedeNombre)) || null;

        batch.update(doc.ref, { empresaId, sedeId });
        opsEnBatch++;
        if (sedeId) resumen.documentosConSede++;
        else resumen.documentosDireccionPrincipal++;

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
    console.error('Error en backfill de sedes:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export default withAuth(handler);
