// lib/empresaSede.js - Valida el vínculo Empresa + Sede que manda un formulario de documento. Solo servidor.
import { firestore } from './firebase-admin';

// Devuelve { empresaId, sedeId } (sedeId null = Dirección Principal) o { error }.
export async function resolverEmpresaSede({ empresaId, sedeId }) {
  if (!empresaId) return { empresaId: null, sedeId: null };

  const empresaDoc = await firestore.collection('empresas').doc(empresaId).get();
  if (!empresaDoc.exists) return { error: 'Empresa no encontrada' };

  if (!sedeId) return { empresaId, sedeId: null };

  const sedes = empresaDoc.data().sedes || [];
  if (!sedes.some((sede) => sede.id === sedeId)) {
    return { error: 'La sede elegida no pertenece a la empresa' };
  }
  return { empresaId, sedeId };
}
