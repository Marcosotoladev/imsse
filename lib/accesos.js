// lib/accesos.js - Accesos de los contactos (rol cliente) a los documentos de Empresas y Sedes
//
// Cada contacto tiene `accesos`: { [empresaId]: { [claveSede]: [tipo, ...] } }, donde claveSede es
//   '*'         → todas las sedes de esa empresa (incluye las que se agreguen después)
//   'principal' → documentos emitidos a la Dirección Principal (sin sede)
//   <sedeId>    → una sede puntual (empresa.sedes[].id)
// Los documentos guardan `empresaId` y `sedeId` (null = Dirección Principal).
//
// `permisos` ({ tipo: true }) se sigue guardando, derivado de `accesos`, porque es lo que usan el
// menú y el dashboard del cliente para saber qué módulos mostrar.

export const TODAS_LAS_SEDES = '*';
export const SEDE_PRINCIPAL = 'principal';

// Tipos de documento que puede ver un cliente (claves de /api/documents/[type])
export const TIPOS_CLIENTE = {
  presupuestos: { label: 'Presupuestos', corto: 'Presup.' },
  recibos: { label: 'Recibos', corto: 'Recibos' },
  remitos: { label: 'Remitos', corto: 'Remitos' },
  estados: { label: 'Estados de Cuenta', corto: 'Est. cta.' },
  ordenes: { label: 'Órdenes de Trabajo', corto: 'OT' },
  inspecciones: { label: 'Visita Técnica', corto: 'Visita téc.' },
  planaccion: { label: 'Plan de Acción', corto: 'Plan acc.' }
};

export const LISTA_TIPOS_CLIENTE = Object.keys(TIPOS_CLIENTE);

// Accesos que rigen para un contacto. Si todavía no tiene `accesos` (contactos anteriores a este
// modelo), se derivan de su empresaId + permisos: todas las sedes de su empresa, para los tipos
// que tenga habilitados. Así nada cambia para ellos hasta que el admin les edite la grilla.
export function accesosEfectivos(perfil) {
  if (!perfil) return {};
  if (perfil.accesos && typeof perfil.accesos === 'object') return perfil.accesos;
  if (!perfil.empresaId) return {};

  const tipos = LISTA_TIPOS_CLIENTE.filter((tipo) => perfil.permisos?.[tipo] === true);
  return tipos.length ? { [perfil.empresaId]: { [TODAS_LAS_SEDES]: tipos } } : {};
}

// Deja solo tipos válidos, sin repetidos, y quita sedes sin tipos y empresas sin sedes.
export function limpiarAccesos(accesos) {
  const limpio = {};
  if (!accesos || typeof accesos !== 'object') return limpio;

  for (const [empresaId, porSede] of Object.entries(accesos)) {
    if (!porSede || typeof porSede !== 'object') continue;
    const sedes = {};
    for (const [claveSede, tipos] of Object.entries(porSede)) {
      if (!Array.isArray(tipos)) continue;
      const validos = [...new Set(tipos.filter((t) => TIPOS_CLIENTE[t]))];
      if (validos.length) sedes[claveSede] = validos;
    }
    if (Object.keys(sedes).length) limpio[empresaId] = sedes;
  }
  return limpio;
}

// { tipo: true/false } con los tipos habilitados en alguna empresa/sede
export function permisosDesdeAccesos(accesos) {
  const habilitados = new Set(Object.values(accesos || {}).flatMap((porSede) => Object.values(porSede).flat()));
  return Object.fromEntries(LISTA_TIPOS_CLIENTE.map((tipo) => [tipo, habilitados.has(tipo)]));
}

// Empresas en las que el contacto tiene algún acceso a ese tipo
export function empresasConTipo(accesos, tipo) {
  return Object.entries(accesos || {})
    .filter(([, porSede]) => Object.values(porSede).some((tipos) => tipos.includes(tipo)))
    .map(([empresaId]) => empresaId);
}

// ¿Puede ver este documento (de este tipo) según sus accesos?
export function puedeVerDocumento(accesos, tipo, doc) {
  const porSede = doc?.empresaId ? accesos?.[doc.empresaId] : null;
  if (!porSede) return false;
  if ((porSede[TODAS_LAS_SEDES] || []).includes(tipo)) return true;
  return (porSede[doc.sedeId || SEDE_PRINCIPAL] || []).includes(tipo);
}
