// types/index.js - Definiciones de tipos para Firebase y la aplicación

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

export const CATEGORIAS_ITEM = {
  DETECCION: "deteccion",
  EXTINCION: "extincion",
  MANTENIMIENTO: "mantenimiento",
  CONSULTORIA: "consultoria"
};

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
    tipo: TIPOS_CLIENTE.COMERCIO,
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
    tipo: TIPOS_CLIENTE.GOBIERNO,
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
    tipo: TIPOS_CLIENTE.INDUSTRIA,
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
    especialidad: CATEGORIAS_ITEM.DETECCION,
    estado: "activo"
  },
  {
    id: "TEC-002",
    nombre: "Ana Martinez",
    email: "ana.martinez@imsse.com.ar",
    telefono: "+54 9 351 333-4444", 
    certificaciones: ["Notifier", "Inim", "Secutron"],
    especialidad: CATEGORIAS_ITEM.EXTINCION,
    estado: "activo"
  },
  {
    id: "TEC-003",
    nombre: "Roberto Silva",
    email: "roberto.silva@imsse.com.ar",
    telefono: "+54 9 351 555-6666", 
    certificaciones: ["Bosch", "Mircom", "Notifier"],
    especialidad: "general",
    estado: "activo"
  }
];

export const MOCK_ITEMS_PRESUPUESTO = [
  {
    id: "ITEM-001",
    descripcion: "Detector de humo óptico Bosch FAP-325",
    cantidad: 1,
    unidad: "unidad",
    precioUnitario: 25000,
    categoria: CATEGORIAS_ITEM.DETECCION
  },
  {
    id: "ITEM-002", 
    descripcion: "Central de detección Notifier NFW2-100",
    cantidad: 1,
    unidad: "unidad",
    precioUnitario: 450000,
    categoria: CATEGORIAS_ITEM.DETECCION
  },
  {
    id: "ITEM-003",
    descripcion: "Detector de temperatura Bosch FAP-440",
    cantidad: 1,
    unidad: "unidad",
    precioUnitario: 28000,
    categoria: CATEGORIAS_ITEM.DETECCION
  },
  {
    id: "ITEM-004",
    descripcion: "Sirena estroboscópica Bosch FNS-320",
    cantidad: 1,
    unidad: "unidad",
    precioUnitario: 35000,
    categoria: CATEGORIAS_ITEM.DETECCION
  },
  {
    id: "ITEM-005",
    descripcion: "Pulsador manual Bosch FMM-100",
    cantidad: 1,
    unidad: "unidad",
    precioUnitario: 15000,
    categoria: CATEGORIAS_ITEM.DETECCION
  },
  {
    id: "ITEM-006",
    descripcion: "Sistema extinción automático FM-200",
    cantidad: 1,
    unidad: "sistema",
    precioUnitario: 850000,
    categoria: CATEGORIAS_ITEM.EXTINCION
  },
  {
    id: "ITEM-007",
    descripcion: "Extintor polvo ABC 5kg",
    cantidad: 1,
    unidad: "unidad",
    precioUnitario: 8500,
    categoria: CATEGORIAS_ITEM.EXTINCION
  },
  {
    id: "ITEM-008",
    descripcion: "Extintor CO2 5kg",
    cantidad: 1,
    unidad: "unidad",
    precioUnitario: 12000,
    categoria: CATEGORIAS_ITEM.EXTINCION
  },
  {
    id: "ITEM-009",
    descripcion: "Manguera contraincendios 25mm x 20m",
    cantidad: 1,
    unidad: "unidad",
    precioUnitario: 18000,
    categoria: CATEGORIAS_ITEM.EXTINCION
  },
  {
    id: "ITEM-010",
    descripcion: "Instalación y programación completa",
    cantidad: 1,
    unidad: "servicio",
    precioUnitario: 180000,
    categoria: CATEGORIAS_ITEM.CONSULTORIA
  },
  {
    id: "ITEM-011",
    descripcion: "Proyecto ejecutivo y documentación técnica",
    cantidad: 1,
    unidad: "proyecto",
    precioUnitario: 150000,
    categoria: CATEGORIAS_ITEM.CONSULTORIA
  },
  {
    id: "ITEM-012",
    descripcion: "Certificación y habilitación de obra",
    cantidad: 1,
    unidad: "certificado",
    precioUnitario: 35000,
    categoria: CATEGORIAS_ITEM.CONSULTORIA
  },
  {
    id: "ITEM-013",
    descripcion: "Mantenimiento anual del sistema",
    cantidad: 1,
    unidad: "contrato",
    precioUnitario: 95000,
    categoria: CATEGORIAS_ITEM.MANTENIMIENTO
  },
  {
    id: "ITEM-014",
    descripcion: "Mantenimiento preventivo trimestral",
    cantidad: 1,
    unidad: "servicio",
    precioUnitario: 25000,
    categoria: CATEGORIAS_ITEM.MANTENIMIENTO
  },
  {
    id: "ITEM-015",
    descripcion: "Recarga de extintores ABC",
    cantidad: 1,
    unidad: "servicio",
    precioUnitario: 2800,
    categoria: CATEGORIAS_ITEM.MANTENIMIENTO
  },
  {
    id: "ITEM-016",
    descripcion: "Recarga de extintores CO2",
    cantidad: 1,
    unidad: "servicio",
    precioUnitario: 3200,
    categoria: CATEGORIAS_ITEM.MANTENIMIENTO
  },
  {
    id: "ITEM-017",
    descripcion: "Prueba hidráulica de mangueras",
    cantidad: 1,
    unidad: "servicio",
    precioUnitario: 1500,
    categoria: CATEGORIAS_ITEM.MANTENIMIENTO
  },
  {
    id: "ITEM-018",
    descripcion: "Cable detector 2x1.5mm ignífugo",
    cantidad: 1,
    unidad: "metro",
    precioUnitario: 450,
    categoria: CATEGORIAS_ITEM.DETECCION
  },
  {
    id: "ITEM-019",
    descripcion: "Caño conduit 3/4 galvanizado",
    cantidad: 1,
    unidad: "metro",
    precioUnitario: 380,
    categoria: CATEGORIAS_ITEM.DETECCION
  },
  {
    id: "ITEM-020",
    descripcion: "Caja de paso metálica 10x10cm",
    cantidad: 1,
    unidad: "unidad",
    precioUnitario: 850,
    categoria: CATEGORIAS_ITEM.DETECCION
  }
];

// Configuraciones de la empresa
export const EMPRESA_CONFIG = {
  nombre: "IMSSE INGENIERÍA",
  nombreCompleto: "Instalación y Mantenimiento de Sistemas de Seguridad Electrónicos",
  direccion: "Córdoba, Argentina",
  telefono: "+54 9 351 123-4567",
  email: "info@imsseingenieria.com",
  web: "www.imsseingenieria.com",
  cuit: "30-12345678-9",
  iva: "IVA Responsable Inscripto",
  certificaciones: ["Notifier", "Mircom", "Inim", "Secutron", "Bosch"],
  descripcion: "Especialistas en sistemas de protección contra incendios desde 1994",
  eslogan: "Técnicos certificados internacionalmente"
};

// Funciones utilitarias para trabajar con tipos
export const formatearEstado = (estado) => {
  const estados = {
    [ESTADOS_PRESUPUESTO.BORRADOR]: "Borrador",
    [ESTADOS_PRESUPUESTO.ENVIADO]: "Enviado",
    [ESTADOS_PRESUPUESTO.APROBADO]: "Aprobado",
    [ESTADOS_PRESUPUESTO.RECHAZADO]: "Rechazado",
    [ESTADOS_PRESUPUESTO.VENCIDO]: "Vencido"
  };
  return estados[estado] || estado;
};

export const formatearTipoCliente = (tipo) => {
  const tipos = {
    [TIPOS_CLIENTE.INDUSTRIA]: "Industria",
    [TIPOS_CLIENTE.COMERCIO]: "Comercio",
    [TIPOS_CLIENTE.GOBIERNO]: "Gobierno"
  };
  return tipos[tipo] || tipo;
};

export const formatearCategoria = (categoria) => {
  const categorias = {
    [CATEGORIAS_ITEM.DETECCION]: "Detección",
    [CATEGORIAS_ITEM.EXTINCION]: "Extinción",
    [CATEGORIAS_ITEM.MANTENIMIENTO]: "Mantenimiento",
    [CATEGORIAS_ITEM.CONSULTORIA]: "Consultoría"
  };
  return categorias[categoria] || categoria;
};

export const formatearPrioridad = (prioridad) => {
  const prioridades = {
    [PRIORIDADES.BAJA]: "Baja",
    [PRIORIDADES.MEDIA]: "Media",
    [PRIORIDADES.ALTA]: "Alta",
    [PRIORIDADES.CRITICA]: "Crítica"
  };
  return prioridades[prioridad] || prioridad;
};

// Validaciones
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarTelefono = (telefono) => {
  const regex = /^\+?54\s?9?\s?(\d{2,4})\s?(\d{3,4})-?(\d{4})$/;
  return regex.test(telefono);
};

export const validarCUIT = (cuit) => {
  const regex = /^\d{2}-\d{8}-\d{1}$/;
  return regex.test(cuit);
};

// Calculadoras
export const calcularSubtotal = (items) => {
  return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
};

export const calcularIVA = (subtotal, porcentaje = 21) => {
  return Math.round(subtotal * (porcentaje / 100));
};

export const calcularTotal = (subtotal, iva) => {
  return subtotal + iva;
};

export const calcularItemSubtotal = (cantidad, precioUnitario) => {
  return cantidad * precioUnitario;
};