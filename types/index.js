// types/index.js - Definiciones de tipos para Firebase

/**
 * @typedef {Object} Cliente
 * @property {string} id - ID único del cliente
 * @property {string} nombre - Nombre de la empresa
 * @property {string} contacto - Persona de contacto
 * @property {string} email - Email de contacto
 * @property {string} telefono - Teléfono de contacto
 * @property {string} direccion - Dirección completa
 * @property {string} cuit - CUIT/CUIL
 * @property {string} tipo - "industria" | "comercio" | "gobierno"
 * @property {Date} fechaAlta - Fecha de alta del cliente
 * @property {string} estado - "activo" | "inactivo"
 */

/**
 * @typedef {Object} ItemPresupuesto
 * @property {string} id - ID único del item
 * @property {string} descripcion - Descripción del servicio/producto
 * @property {number} cantidad - Cantidad
 * @property {string} unidad - Unidad de medida
 * @property {number} precioUnitario - Precio por unidad
 * @property {number} subtotal - Cantidad * precioUnitario
 * @property {string} categoria - "deteccion" | "extincion" | "mantenimiento" | "consultoria"
 */

/**
 * @typedef {Object} Presupuesto
 * @property {string} id - ID único del presupuesto
 * @property {string} numero - Número de presupuesto (formato: PRES-2024-001)
 * @property {Cliente} cliente - Información del cliente
 * @property {Date} fecha - Fecha de creación
 * @property {Date} fechaVencimiento - Fecha de vencimiento
 * @property {ItemPresupuesto[]} items - Items del presupuesto
 * @property {number} subtotal - Suma de subtotales
 * @property {number} iva - Monto del IVA
 * @property {number} total - Total final
 * @property {string} estado - "borrador" | "enviado" | "aprobado" | "rechazado" | "vencido"
 * @property {string} observaciones - Observaciones adicionales
 * @property {string} validez - Días de validez del presupuesto
 * @property {string} creadoPor - ID del usuario que creó el presupuesto
 * @property {Date} fechaCreacion - Timestamp de creación
 * @property {Date} fechaModificacion - Timestamp de última modificación
 */

/**
 * @typedef {Object} Tecnico
 * @property {string} id - ID único del técnico
 * @property {string} nombre - Nombre completo
 * @property {string} email - Email del técnico
 * @property {string} telefono - Teléfono de contacto
 * @property {string[]} certificaciones - Array de certificaciones
 * @property {string} especialidad - "deteccion" | "extincion" | "mantenimiento" | "general"
 * @property {string} estado - "activo" | "inactivo"
 */

/**
 * @typedef {Object} OrdenTrabajo
 * @property {string} id - ID único de la orden
 * @property {string} numero - Número de orden (formato: OT-2024-001)
 * @property {string} tipo - "mantenimiento" | "obra"
 * @property {Cliente} cliente - Información del cliente
 * @property {Tecnico} tecnico - Técnico asignado
 * @property {Date} fecha - Fecha programada
 * @property {string} horaInicio - Hora de inicio
 * @property {string} horaFin - Hora de finalización
 * @property {string} descripcion - Descripción del trabajo
 * @property {string} equipo - Equipo/sistema a trabajar
 * @property {string} estado - "programada" | "en_progreso" | "completada" | "cancelada"
 * @property {string} prioridad - "baja" | "media" | "alta" | "critica"
 * @property {string[]} fotos - URLs de fotos tomadas
 * @property {Object} firmas - Firmas digitales
 * @property {string} firmas.tecnico - Firma del técnico
 * @property {string} firmas.cliente - Firma del cliente
 * @property {string} observaciones - Observaciones del trabajo
 * @property {number} tiempoTotal - Tiempo total en minutos
 * @property {Date} fechaCreacion - Timestamp de creación
 */

/**
 * @typedef {Object} Recordatorio
 * @property {string} id - ID único del recordatorio
 * @property {string} titulo - Título del recordatorio
 * @property {string} descripcion - Descripción detallada
 * @property {Date} fechaVencimiento - Fecha de vencimiento
 * @property {string} prioridad - "baja" | "media" | "alta"
 * @property {string} tipo - "llamada" | "mantenimiento" | "visita" | "documento" | "otro"
 * @property {string} creadoPor - ID del usuario que lo creó
 * @property {string} asignadoA - ID del usuario asignado (opcional)
 * @property {string} estado - "pendiente" | "completado" | "vencido"
 * @property {Date} fechaCreacion - Timestamp de creación
 * @property {Date} fechaCompletado - Timestamp de completado (opcional)
 */

/**
 * @typedef {Object} Recibo
 * @property {string} id - ID único del recibo
 * @property {string} numero - Número de recibo
 * @property {Cliente} cliente - Información del cliente
 * @property {Date} fecha - Fecha del recibo
 * @property {ItemPresupuesto[]} items - Items facturados
 * @property {number} subtotal - Subtotal
 * @property {number} iva - IVA
 * @property {number} total - Total
 * @property {string} metodoPago - Método de pago
 * @property {string} estado - "pendiente" | "pagado" | "vencido"
 * @property {string} presupuestoId - ID del presupuesto relacionado (opcional)
 */

/**
 * @typedef {Object} Remito
 * @property {string} id - ID único del remito
 * @property {string} numero - Número de remito
 * @property {Cliente} cliente - Información del cliente
 * @property {Date} fecha - Fecha del remito
 * @property {Object[]} items - Items del remito
 * @property {string} transportista - Información del transportista
 * @property {string} observaciones - Observaciones del envío
 * @property {string} estado - "preparado" | "enviado" | "entregado"
 */

// Datos mock para desarrollo
export const MOCK_CLIENTES = [
  {
    id: "CLI-001",
    nombre: "Centro Comercial Norte S.A.",
    contacto: "Juan Carlos Mendez",
    email: "jmendez@centronorte.com.ar",
    telefono: "+54 9 351 456-7890",
    direccion: "Av. Rafael Núñez 4850, Córdoba Capital",
    cuit: "30-12345678-9",
    tipo: "comercio",
    fechaAlta: new Date("2019-03-15"),
    estado: "activo"
  },
  {
    id: "CLI-002", 
    nombre: "Hospital Provincial",
    contacto: "Dra. María Rodriguez",
    email: "administracion@hospitalprovincial.gov.ar",
    telefono: "+54 9 351 123-4567",
    direccion: "Av. Colón 1250, Córdoba Capital",
    cuit: "30-87654321-2",
    tipo: "gobierno",
    fechaAlta: new Date("2020-01-10"),
    estado: "activo"
  },
  {
    id: "CLI-003",
    nombre: "Industria Metalúrgica SA",
    contacto: "Ing. Roberto Silva", 
    email: "rsilva@metalurgica.com.ar",
    telefono: "+54 9 351 789-0123",
    direccion: "Zona Industrial Norte, Córdoba",
    cuit: "30-98765432-1",
    tipo: "industria",
    fechaAlta: new Date("2018-11-20"),
    estado: "activo"
  }
];

export const MOCK_TECNICOS = [
  {
    id: "TEC-001",
    nombre: "Carlos Rodriguez",
    email: "carlos.rodriguez@imsse.com.ar", 
    telefono: "+54 9 351 111-2222",
    certificaciones: ["Bosch", "Mircom"],
    especialidad: "deteccion",
    estado: "activo"
  },
  {
    id: "TEC-002",
    nombre: "Ana Martinez",
    email: "ana.martinez@imsse.com.ar",
    telefono: "+54 9 351 333-4444", 
    certificaciones: ["Notifier", "Inim", "Secutron"],
    especialidad: "extincion",
    estado: "activo"
  }
];

export const MOCK_ITEMS_PRESUPUESTO = [
  {
    id: "ITEM-001",
    descripcion: "Detector de humo óptico Bosch FAP-325",
    cantidad: 15,
    unidad: "unidad",
    precioUnitario: 25000,
    subtotal: 375000,
    categoria: "deteccion"
  },
  {
    id: "ITEM-002", 
    descripcion: "Central de detección Notifier NFW2-100",
    cantidad: 1,
    unidad: "unidad",
    precioUnitario: 450000,
    subtotal: 450000,
    categoria: "deteccion"
  },
  {
    id: "ITEM-003",
    descripcion: "Instalación y programación completa",
    cantidad: 1,
    unidad: "servicio",
    precioUnitario: 180000,
    subtotal: 180000,
    categoria: "consultoria"
  },
  {
    id: "ITEM-004",
    descripcion: "Mantenimiento anual del sistema",
    cantidad: 1,
    unidad: "contrato",
    precioUnitario: 95000,
    subtotal: 95000,
    categoria: "mantenimiento"
  }
];

// Estados y configuraciones
export const ESTADOS_PRESUPUESTO = {
  BORRADOR: "borrador",
  ENVIADO: "enviado", 
  APROBADO: "aprobado",
  RECHAZADO: "rechazado",
  VENCIDO: "vencido"
};

export const TIPOS_CLIENTE = {
  INDUSTRIA: "industria",
  COMERCIO: "comercio", 
  GOBIERNO: "gobierno"
};

export const PRIORIDADES = {
  BAJA: "baja",
  MEDIA: "media",
  ALTA: "alta", 
  CRITICA: "critica"
};

export const ESTADOS_ORDEN = {
  PROGRAMADA: "programada",
  EN_PROGRESO: "en_progreso",
  COMPLETADA: "completada",
  CANCELADA: "cancelada"
};