// lib/permisosRoles.js - Qué documentos puede gestionar cada rol del personal (técnico, secretaria)
//
// El admin siempre puede todo. Para los demás roles, el admin configura en /admin/roles una grilla
// Tipo de documento × Acción, que se guarda en `configuracion/permisosRoles`:
//   { [rol]: { [tipo]: { ver, crear, editar, eliminar } } }
// ver / editar / eliminar: 'todos' | 'propios' (los que creó ese usuario: doc.creadoPor === uid) | 'no'
// crear: true | false
// Lo que no esté configurado toma PERMISOS_POR_DEFECTO (que reproduce cómo funcionaba antes).

export const ROLES_PERSONAL = ['admin', 'tecnico', 'secretaria'];

export const ROLES_CONFIGURABLES = {
  tecnico: 'Técnico',
  secretaria: 'Secretaria'
};

// Claves = tipos de /api/documents/[type]
export const TIPOS_GESTION = {
  ordenes: 'Órdenes de Trabajo',
  inspecciones: 'Visita Técnica',
  planaccion: 'Plan de Acción',
  presupuestos: 'Presupuestos',
  recibos: 'Recibos',
  remitos: 'Remitos',
  estados: 'Estados de Cuenta',
  recordatorios: 'Recordatorios',
  visitas: 'Calendario de Visitas',
  plantillas: 'Plantillas de Visita Técnica'
};

export const ALCANCES = {
  todos: 'Todos',
  propios: 'Solo propios',
  no: 'No'
};

const RANGO = { no: 0, propios: 1, todos: 2 };

const TODO = { ver: 'todos', crear: true, editar: 'todos', eliminar: 'todos' };
const SOLO_VER = { ver: 'todos', crear: false, editar: 'no', eliminar: 'no' };
export const SIN_PERMISO = { ver: 'no', crear: false, editar: 'no', eliminar: 'no' };

export const PERMISOS_POR_DEFECTO = {
  tecnico: {
    ordenes: TODO,
    inspecciones: TODO,
    recordatorios: TODO,
    visitas: TODO,
    // Las necesita para adjuntarlas a una Visita Técnica
    plantillas: SOLO_VER
  },
  secretaria: {
    presupuestos: TODO,
    recibos: TODO,
    remitos: TODO,
    estados: TODO,
    planaccion: TODO,
    recordatorios: TODO,
    visitas: TODO,
    ordenes: SOLO_VER,
    inspecciones: SOLO_VER,
    plantillas: SOLO_VER
  }
};

// Editar/eliminar no pueden abarcar más que ver, y sin ver no se puede crear
function normalizar(permiso) {
  const alcance = (valor) => (RANGO[valor] !== undefined ? valor : 'no');
  const ver = alcance(permiso.ver);
  const tope = (valor) => (RANGO[alcance(valor)] > RANGO[ver] ? ver : alcance(valor));
  return {
    ver,
    crear: ver !== 'no' && permiso.crear === true,
    editar: tope(permiso.editar),
    eliminar: tope(permiso.eliminar)
  };
}

// Permiso efectivo de un rol sobre un tipo de documento
export function permisoDeRol(config, rol, tipo) {
  if (rol === 'admin') return TODO;
  if (!ROLES_CONFIGURABLES[rol] || !TIPOS_GESTION[tipo]) return SIN_PERMISO;
  return normalizar({
    ...SIN_PERMISO,
    ...(PERMISOS_POR_DEFECTO[rol]?.[tipo] || {}),
    ...(config?.[rol]?.[tipo] || {})
  });
}

// Matriz completa { tipo: permiso } de un rol
export function matrizDeRol(config, rol) {
  return Object.fromEntries(Object.keys(TIPOS_GESTION).map((tipo) => [tipo, permisoDeRol(config, rol, tipo)]));
}

// ¿Puede hacer `accion` sobre este documento? (para 'crear' no hace falta doc)
export function puedeSobre(permiso, accion, doc, uid) {
  if (accion === 'crear') return permiso.crear === true;
  const alcance = permiso[accion];
  if (alcance === 'todos') return true;
  if (alcance === 'propios') return !!doc && !!uid && doc.creadoPor === uid;
  return false;
}

// Config válida para guardar: solo roles/tipos conocidos, normalizada
export function limpiarConfig(config) {
  const limpio = {};
  for (const rol of Object.keys(ROLES_CONFIGURABLES)) {
    limpio[rol] = {};
    for (const tipo of Object.keys(TIPOS_GESTION)) {
      limpio[rol][tipo] = normalizar({ ...SIN_PERMISO, ...(config?.[rol]?.[tipo] || {}) });
    }
  }
  return limpio;
}
