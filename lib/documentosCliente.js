// lib/documentosCliente.js - Documentos que puede ver un contacto (rol cliente). Solo servidor.
import { firestore } from './firebase-admin';
import { accesosEfectivos, empresasConTipo, puedeVerDocumento } from './accesos';

const LIMITE_POR_EMPRESA = 200;

const normalizar = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
    fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
  };
};

const masRecientePrimero = (a, b) => new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0);

async function consultar(coleccion, campo, valor) {
  const base = firestore.collection(coleccion).where(campo, '==', valor);
  try {
    const snapshot = await base.orderBy('fechaCreacion', 'desc').limit(LIMITE_POR_EMPRESA).get();
    return snapshot.docs.map(normalizar);
  } catch (indexError) {
    // Sin índice compuesto (campo + fechaCreacion): la igualdad sola no lo necesita, se ordena en memoria
    console.warn(`Índice compuesto no disponible para ${coleccion}.${campo}, ordenando en memoria:`, indexError.message);
    const snapshot = await base.get();
    return snapshot.docs.map(normalizar).sort(masRecientePrimero).slice(0, LIMITE_POR_EMPRESA);
  }
}

// Devuelve los documentos visibles, o null si el contacto no tiene acceso a ese tipo.
export async function obtenerDocumentosCliente({ coleccion, tipo, perfil, uid }) {
  // Contactos anteriores al modelo Empresa (sin empresa ni accesos): solo lo emitido a ellos
  if (!perfil.accesos && !perfil.empresaId) {
    if (!perfil.permisos?.[tipo]) return null;
    return consultar(coleccion, 'clienteId', uid);
  }

  const accesos = accesosEfectivos(perfil);
  const empresaIds = empresasConTipo(accesos, tipo);
  if (!empresaIds.length) return null;

  const porEmpresa = await Promise.all(empresaIds.map((empresaId) => consultar(coleccion, 'empresaId', empresaId)));
  return porEmpresa
    .flat()
    .filter((doc) => puedeVerDocumento(accesos, tipo, doc))
    .sort(masRecientePrimero);
}

// ¿Puede el contacto ver este documento puntual?
export function contactoPuedeVer(perfil, uid, tipo, docData) {
  // Documentos anteriores al modelo Empresa: solo el contacto al que se emitió
  if (!docData.empresaId) return docData.clienteId === uid && !!perfil.permisos?.[tipo];
  return puedeVerDocumento(accesosEfectivos(perfil), tipo, docData);
}
