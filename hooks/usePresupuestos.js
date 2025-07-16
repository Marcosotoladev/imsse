// hooks/usePresupuestos.js - Actualizado con tipos y compatibilidad Firebase
import { useState, useEffect } from 'react';
import { 
  MOCK_CLIENTES, 
  MOCK_ITEMS_PRESUPUESTO, 
  ESTADOS_PRESUPUESTO 
} from '../types/index.js';

// Datos mock actualizados con la estructura correcta
const PRESUPUESTOS_MOCK = [
  {
    id: '1',
    numero: 'PRES-2024-001',
    fecha: new Date('2024-01-15'),
    fechaVencimiento: new Date('2024-02-15'),
    validez: '30 días',
    estado: ESTADOS_PRESUPUESTO.ENVIADO,
    cliente: {
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
    items: [
      {
        id: '1',
        descripcion: 'Detector de humo óptico Bosch FAP-325',
        cantidad: 15,
        unidad: 'unidad',
        precioUnitario: 25000,
        subtotal: 375000,
        categoria: 'deteccion'
      },
      {
        id: '2',
        descripcion: 'Central de detección Notifier NFW2-100',
        cantidad: 1,
        unidad: 'unidad',
        precioUnitario: 450000,
        subtotal: 450000,
        categoria: 'deteccion'
      },
      {
        id: '3',
        descripcion: 'Instalación y programación completa',
        cantidad: 1,
        unidad: 'servicio',
        precioUnitario: 180000,
        subtotal: 180000,
        categoria: 'consultoria'
      }
    ],
    subtotal: 1005000,
    iva: 211050,
    total: 1216050,
    observaciones: 'Incluye garantía de 2 años en equipos y 6 meses en mano de obra. Instalación programada para la semana del 20/01/2024. Sistema completo con certificaciones correspondientes.',
    creadoPor: 'admin',
    fechaCreacion: new Date('2024-01-15'),
    fechaModificacion: new Date('2024-01-15')
  },
  {
    id: '2',
    numero: 'PRES-2024-002',
    fecha: new Date('2024-01-12'),
    fechaVencimiento: new Date('2024-02-12'),
    validez: '30 días',
    estado: ESTADOS_PRESUPUESTO.APROBADO,
    cliente: {
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
    items: [
      {
        id: '1',
        descripcion: 'Mantenimiento anual del sistema contra incendios',
        cantidad: 1,
        unidad: 'contrato',
        precioUnitario: 180000,
        subtotal: 180000,
        categoria: 'mantenimiento'
      },
      {
        id: '2',
        descripcion: 'Recarga de extintores ABC 5kg',
        cantidad: 25,
        unidad: 'unidad',
        precioUnitario: 2800,
        subtotal: 70000,
        categoria: 'mantenimiento'
      },
      {
        id: '3',
        descripcion: 'Pruebas y certificaciones anuales',
        cantidad: 1,
        unidad: 'servicio',
        precioUnitario: 95000,
        subtotal: 95000,
        categoria: 'consultoria'
      }
    ],
    subtotal: 345000,
    iva: 72450,
    total: 417450,
    observaciones: 'Servicio incluye revisión completa de todos los sistemas, pruebas funcionales y emisión de certificaciones correspondientes. Mantenimiento programado mensualmente.',
    creadoPor: 'admin',
    fechaCreacion: new Date('2024-01-12'),
    fechaModificacion: new Date('2024-01-12')
  },
  {
    id: '3',
    numero: 'PRES-2024-003',
    fecha: new Date('2024-01-10'),
    fechaVencimiento: new Date('2024-02-10'),
    validez: '30 días',
    estado: ESTADOS_PRESUPUESTO.BORRADOR,
    cliente: {
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
    },
    items: [
      {
        id: '1',
        descripcion: 'Sistema extinción automático FM-200 para sala de servidores',
        cantidad: 1,
        unidad: 'sistema',
        precioUnitario: 850000,
        subtotal: 850000,
        categoria: 'extincion'
      },
      {
        id: '2',
        descripcion: 'Tablero de control y monitoreo Notifier',
        cantidad: 1,
        unidad: 'unidad',
        precioUnitario: 125000,
        subtotal: 125000,
        categoria: 'deteccion'
      },
      {
        id: '3',
        descripcion: 'Proyecto ejecutivo y documentación técnica',
        cantidad: 1,
        unidad: 'proyecto',
        precioUnitario: 150000,
        subtotal: 150000,
        categoria: 'consultoria'
      }
    ],
    subtotal: 1125000,
    iva: 236250,
    total: 1361250,
    observaciones: 'Presupuesto para protección de sala de servidores crítica. Incluye proyecto ejecutivo, instalación completa y puesta en marcha. Requiere coordinación con área IT para programación de trabajos.',
    creadoPor: 'admin',
    fechaCreacion: new Date('2024-01-10'),
    fechaModificacion: new Date('2024-01-10')
  },
  {
    id: '4',
    numero: 'PRES-2024-004',
    fecha: new Date('2024-01-08'),
    fechaVencimiento: new Date('2024-01-20'),
    validez: '15 días',
    estado: ESTADOS_PRESUPUESTO.VENCIDO,
    cliente: {
      id: "CLI-004",
      nombre: "Edificio Corporativo ABC",
      contacto: "Lic. Ana Martínez",
      email: "amartinez@edificioabc.com",
      telefono: "+54 9 351 987-6543",
      direccion: "Nueva Córdoba, Córdoba",
      cuit: "30-11223344-5",
      tipo: "comercio",
      fechaAlta: new Date("2021-05-15"),
      estado: "activo"
    },
    items: [
      {
        id: '1',
        descripcion: 'Actualización sistema detección a tecnología analógica',
        cantidad: 1,
        unidad: 'proyecto',
        precioUnitario: 450000,
        subtotal: 450000,
        categoria: 'deteccion'
      },
      {
        id: '2',
        descripcion: 'Migración de datos y configuraciones',
        cantidad: 1,
        unidad: 'servicio',
        precioUnitario: 85000,
        subtotal: 85000,
        categoria: 'consultoria'
      }
    ],
    subtotal: 535000,
    iva: 112350,
    total: 647350,
    observaciones: 'Modernización del sistema existente con nueva tecnología analógica. Incluye aprovechamiento del cableado existente donde sea posible.',
    creadoPor: 'admin',
    fechaCreacion: new Date('2024-01-08'),
    fechaModificacion: new Date('2024-01-08')
  },
  {
    id: '5',
    numero: 'PRES-2024-005',
    fecha: new Date('2024-01-05'),
    fechaVencimiento: new Date('2024-01-25'),
    validez: '20 días',
    estado: ESTADOS_PRESUPUESTO.RECHAZADO,
    cliente: {
      id: "CLI-005",
      nombre: "Shopping Patio Olmos",
      contacto: "Sr. Carlos Pérez",
      email: "cperez@patioolmos.com",
      telefono: "+54 9 351 321-9876",
      direccion: "Av. Vélez Sársfield 361, Córdoba",
      cuit: "30-55667788-9",
      tipo: "comercio",
      fechaAlta: new Date("2020-08-10"),
      estado: "activo"
    },
    items: [
      {
        id: '1',
        descripcion: 'Contrato anual de mantenimiento preventivo y correctivo',
        cantidad: 1,
        unidad: 'contrato',
        precioUnitario: 320000,
        subtotal: 320000,
        categoria: 'mantenimiento'
      },
      {
        id: '2',
        descripcion: 'Servicios de emergencia 24/7',
        cantidad: 1,
        unidad: 'servicio',
        precioUnitario: 120000,
        subtotal: 120000,
        categoria: 'mantenimiento'
      }
    ],
    subtotal: 440000,
    iva: 92400,
    total: 532400,
    observaciones: 'Contrato anual de mantenimiento preventivo y correctivo. Incluye atención de emergencias 24/7 y reposición de materiales menores.',
    creadoPor: 'admin',
    fechaCreacion: new Date('2024-01-05'),
    fechaModificacion: new Date('2024-01-05')
  }
];

export function usePresupuestos() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simular carga inicial desde Firebase
  useEffect(() => {
    const loadPresupuestos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Procesar fechas para asegurar que sean objetos Date
        const processedPresupuestos = PRESUPUESTOS_MOCK.map(presupuesto => ({
          ...presupuesto,
          fecha: presupuesto.fecha instanceof Date ? presupuesto.fecha : new Date(presupuesto.fecha),
          fechaVencimiento: presupuesto.fechaVencimiento instanceof Date ? 
            presupuesto.fechaVencimiento : new Date(presupuesto.fechaVencimiento),
          fechaCreacion: presupuesto.fechaCreacion instanceof Date ? 
            presupuesto.fechaCreacion : new Date(presupuesto.fechaCreacion),
          fechaModificacion: presupuesto.fechaModificacion instanceof Date ? 
            presupuesto.fechaModificacion : new Date(presupuesto.fechaModificacion),
        }));
        
        setPresupuestos(processedPresupuestos);
        
      } catch (err) {
        setError('Error al cargar los presupuestos desde la base de datos');
        console.error('Error loading presupuestos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPresupuestos();
  }, []);

  // Función para generar nuevo número de presupuesto
  const generateNewNumber = () => {
    const year = new Date().getFullYear();
    const existingNumbers = presupuestos
      .filter(p => p.numero.includes(year.toString()))
      .map(p => {
        const match = p.numero.match(/PRES-\d{4}-(\d{3})/);
        return match ? parseInt(match[1]) : 0;
      });
    
    const lastNumber = Math.max(0, ...existingNumbers);
    return `PRES-${year}-${(lastNumber + 1).toString().padStart(3, '0')}`;
  };

  // Función para calcular totales automáticamente
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const iva = Math.round(subtotal * 0.21);
    const total = subtotal + iva;
    
    return { subtotal, iva, total };
  };

  // Crear nuevo presupuesto
  const createPresupuesto = async (data) => {
    try {
      setError(null);
      
      // Calcular totales si no están incluidos
      const totals = data.items ? calculateTotals(data.items) : { subtotal: 0, iva: 0, total: 0 };
      
      const newPresupuesto = {
        id: `pres_${Date.now()}`,
        numero: generateNewNumber(),
        fecha: new Date(),
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        estado: ESTADOS_PRESUPUESTO.BORRADOR,
        creadoPor: 'admin', // En el futuro vendrá del contexto de usuario
        validez: '30 días',
        items: [],
        observaciones: '',
        ...data,
        ...totals
      };
      
      // Simular llamada a Firebase
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPresupuestos(prev => [newPresupuesto, ...prev]);
      
      console.log('Presupuesto creado:', newPresupuesto.numero);
      return newPresupuesto;
      
    } catch (err) {
      const errorMessage = 'Error al crear el presupuesto';
      setError(errorMessage);
      console.error(errorMessage, err);
      throw new Error(errorMessage);
    }
  };

  // Actualizar presupuesto
  const updatePresupuesto = async (id, updates) => {
    try {
      setError(null);
      
      // Si se actualizan los items, recalcular totales
      let processedUpdates = { ...updates };
      if (updates.items) {
        const totals = calculateTotals(updates.items);
        processedUpdates = { ...updates, ...totals };
      }
      
      // Agregar timestamp de modificación
      processedUpdates.fechaModificacion = new Date();
      
      // Simular llamada a Firebase
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setPresupuestos(prev => 
        prev.map(p => p.id === id ? { ...p, ...processedUpdates } : p)
      );
      
      console.log(`Presupuesto ${id} actualizado:`, processedUpdates);
      
    } catch (err) {
      const errorMessage = 'Error al actualizar el presupuesto';
      setError(errorMessage);
      console.error(errorMessage, err);
      throw new Error(errorMessage);
    }
  };

  // Eliminar presupuesto
  const deletePresupuesto = async (id) => {
    try {
      setError(null);
      
      // Simular llamada a Firebase
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setPresupuestos(prev => prev.filter(p => p.id !== id));
      
      console.log(`Presupuesto ${id} eliminado`);
      
    } catch (err) {
      const errorMessage = 'Error al eliminar el presupuesto';
      setError(errorMessage);
      console.error(errorMessage, err);
      throw new Error(errorMessage);
    }
  };

  // Duplicar presupuesto
  const duplicatePresupuesto = async (id) => {
    try {
      setError(null);
      
      const original = presupuestos.find(p => p.id === id);
      if (!original) {
        throw new Error('Presupuesto no encontrado');
      }

      const duplicated = {
        ...original,
        id: `pres_${Date.now()}_dup`,
        numero: generateNewNumber(),
        fecha: new Date(),
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        estado: ESTADOS_PRESUPUESTO.BORRADOR,
        // Actualizar fechas de vencimiento basadas en la nueva fecha
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      };

      // Simular llamada a Firebase
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setPresupuestos(prev => [duplicated, ...prev]);
      
      console.log(`Presupuesto ${id} duplicado como ${duplicated.numero}`);
      return duplicated;
      
    } catch (err) {
      const errorMessage = 'Error al duplicar el presupuesto';
      setError(errorMessage);
      console.error(errorMessage, err);
      throw new Error(errorMessage);
    }
  };

  // Cambiar estado del presupuesto
  const changeStatus = async (id, newStatus) => {
    try {
      if (!Object.values(ESTADOS_PRESUPUESTO).includes(newStatus)) {
        throw new Error('Estado no válido');
      }
      
      await updatePresupuesto(id, { estado: newStatus });
      
    } catch (err) {
      const errorMessage = 'Error al cambiar el estado del presupuesto';
      setError(errorMessage);
      console.error(errorMessage, err);
      throw new Error(errorMessage);
    }
  };

  // Obtener estadísticas
  const getEstadisticas = () => {
    const total = presupuestos.length;
    const aprobados = presupuestos.filter(p => p.estado === ESTADOS_PRESUPUESTO.APROBADO).length;
    const pendientes = presupuestos.filter(p => p.estado === ESTADOS_PRESUPUESTO.ENVIADO).length;
    const borradores = presupuestos.filter(p => p.estado === ESTADOS_PRESUPUESTO.BORRADOR).length;
    const rechazados = presupuestos.filter(p => p.estado === ESTADOS_PRESUPUESTO.RECHAZADO).length;
    const vencidos = presupuestos.filter(p => p.estado === ESTADOS_PRESUPUESTO.VENCIDO).length;
    
    const tasaAprobacion = total > 0 ? Math.round((aprobados / (total - borradores)) * 100) : 0;
    
    const montoTotal = presupuestos
      .filter(p => p.estado === ESTADOS_PRESUPUESTO.APROBADO)
      .reduce((sum, p) => sum + (p.total || 0), 0);

    const montoEnEspera = presupuestos
      .filter(p => p.estado === ESTADOS_PRESUPUESTO.ENVIADO)
      .reduce((sum, p) => sum + (p.total || 0), 0);

    return {
      total,
      aprobados,
      pendientes,
      borradores,
      rechazados,
      vencidos,
      tasaAprobacion,
      montoTotal,
      montoEnEspera
    };
  };

  // Obtener presupuesto por ID
  const getPresupuesto = (id) => {
    return presupuestos.find(p => p.id === id);
  };

  // Obtener presupuestos por estado
  const getPresupuestosByStatus = (estado) => {
    return presupuestos.filter(p => p.estado === estado);
  };

  // Obtener presupuestos por cliente
  const getPresupuestosByClient = (clienteId) => {
    return presupuestos.filter(p => p.cliente.id === clienteId);
  };

  // Buscar presupuestos
  const searchPresupuestos = (searchTerm) => {
    if (!searchTerm.trim()) return presupuestos;
    
    const term = searchTerm.toLowerCase();
    return presupuestos.filter(p => 
      p.numero.toLowerCase().includes(term) ||
      p.cliente.nombre.toLowerCase().includes(term) ||
      p.cliente.contacto.toLowerCase().includes(term) ||
      p.observaciones?.toLowerCase().includes(term)
    );
  };

  return {
    // Estado
    presupuestos,
    loading,
    error,
    
    // Operaciones CRUD
    createPresupuesto,
    updatePresupuesto,
    deletePresupuesto,
    duplicatePresupuesto,
    
    // Operaciones específicas
    changeStatus,
    
    // Consultas
    getPresupuesto,
    getPresupuestosByStatus,
    getPresupuestosByClient,
    searchPresupuestos,
    getEstadisticas,
    
    // Utilidades
    calculateTotals,
    generateNewNumber
  };
}