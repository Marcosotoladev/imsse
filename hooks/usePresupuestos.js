// hooks/usePresupuestos.js
"use client";

import { useState, useEffect } from 'react';
import { MOCK_CLIENTES, MOCK_ITEMS_PRESUPUESTO, ESTADOS_PRESUPUESTO } from '../types';

// Hook para gestionar presupuestos - preparado para Firebase
export const usePresupuestos = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Datos mock para desarrollo - después será Firebase
  const MOCK_PRESUPUESTOS = [
    {
      id: "PRES-2024-001",
      numero: "PRES-2024-001",
      cliente: MOCK_CLIENTES[0],
      fecha: new Date("2024-01-15"),
      fechaVencimiento: new Date("2024-02-15"),
      items: [
        MOCK_ITEMS_PRESUPUESTO[0],
        MOCK_ITEMS_PRESUPUESTO[1],
        MOCK_ITEMS_PRESUPUESTO[2]
      ],
      subtotal: 1005000,
      iva: 211050,
      total: 1216050,
      estado: ESTADOS_PRESUPUESTO.ENVIADO,
      observaciones: "Presupuesto para ampliación del sistema de detección en planta 3",
      validez: "30 días",
      creadoPor: "ADMIN-001",
      fechaCreacion: new Date("2024-01-15T09:00:00"),
      fechaModificacion: new Date("2024-01-15T09:00:00")
    },
    {
      id: "PRES-2024-002", 
      numero: "PRES-2024-002",
      cliente: MOCK_CLIENTES[1],
      fecha: new Date("2024-01-12"),
      fechaVencimiento: new Date("2024-02-12"),
      items: [
        MOCK_ITEMS_PRESUPUESTO[1],
        MOCK_ITEMS_PRESUPUESTO[3]
      ],
      subtotal: 545000,
      iva: 114450,
      total: 659450,
      estado: ESTADOS_PRESUPUESTO.APROBADO,
      observaciones: "Sistema para área crítica de quirófanos",
      validez: "30 días",
      creadoPor: "ADMIN-001", 
      fechaCreacion: new Date("2024-01-12T14:30:00"),
      fechaModificacion: new Date("2024-01-12T14:30:00")
    },
    {
      id: "PRES-2024-003",
      numero: "PRES-2024-003", 
      cliente: MOCK_CLIENTES[2],
      fecha: new Date("2024-01-10"),
      fechaVencimiento: new Date("2024-02-10"),
      items: [
        MOCK_ITEMS_PRESUPUESTO[0],
        MOCK_ITEMS_PRESUPUESTO[2],
        MOCK_ITEMS_PRESUPUESTO[3]
      ],
      subtotal: 650000,
      iva: 136500,
      total: 786500,
      estado: ESTADOS_PRESUPUESTO.BORRADOR,
      observaciones: "Presupuesto preliminar para evaluación",
      validez: "15 días",
      creadoPor: "ADMIN-001",
      fechaCreacion: new Date("2024-01-10T11:15:00"),
      fechaModificacion: new Date("2024-01-10T11:15:00")
    }
  ];

  // Simular carga inicial de datos
  useEffect(() => {
    loadPresupuestos();
  }, []);

  const loadPresupuestos = async () => {
    setLoading(true);
    try {
      // Simular llamada a Firebase
      await new Promise(resolve => setTimeout(resolve, 500));
      setPresupuestos(MOCK_PRESUPUESTOS);
      setError(null);
    } catch (err) {
      setError('Error al cargar presupuestos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createPresupuesto = async (presupuestoData) => {
    setLoading(true);
    try {
      // Generar nuevo número de presupuesto
      const numeroPresupuesto = generateNumeroPresupuesto();
      
      // Calcular totales
      const subtotal = presupuestoData.items.reduce((sum, item) => sum + item.subtotal, 0);
      const iva = subtotal * 0.21; // 21% IVA
      const total = subtotal + iva;

      const nuevoPresupuesto = {
        id: `PRES-${Date.now()}`,
        numero: numeroPresupuesto,
        ...presupuestoData,
        subtotal,
        iva,
        total,
        estado: ESTADOS_PRESUPUESTO.BORRADOR,
        fechaCreacion: new Date(),
        fechaModificacion: new Date()
      };

      // Simular guardado en Firebase
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setPresupuestos(prev => [nuevoPresupuesto, ...prev]);
      setError(null);
      
      return nuevoPresupuesto;
    } catch (err) {
      setError('Error al crear presupuesto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePresupuesto = async (id, updates) => {
    setLoading(true);
    try {
      // Simular actualización en Firebase
      await new Promise(resolve => setTimeout(resolve, 300));

      setPresupuestos(prev => 
        prev.map(presupuesto => 
          presupuesto.id === id 
            ? { 
                ...presupuesto, 
                ...updates, 
                fechaModificacion: new Date() 
              }
            : presupuesto
        )
      );
      setError(null);
    } catch (err) {
      setError('Error al actualizar presupuesto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePresupuesto = async (id) => {
    setLoading(true);
    try {
      // Simular eliminación en Firebase
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setPresupuestos(prev => prev.filter(p => p.id !== id));
      setError(null);
    } catch (err) {
      setError('Error al eliminar presupuesto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPresupuestoById = (id) => {
    return presupuestos.find(p => p.id === id);
  };

  const getPresupuestosByCliente = (clienteId) => {
    return presupuestos.filter(p => p.cliente.id === clienteId);
  };

  const getPresupuestosByEstado = (estado) => {
    return presupuestos.filter(p => p.estado === estado);
  };

  // Generar número de presupuesto automático
  const generateNumeroPresupuesto = () => {
    const year = new Date().getFullYear();
    const existingNumbers = presupuestos
      .filter(p => p.numero.includes(year.toString()))
      .map(p => {
        const match = p.numero.match(/PRES-\d{4}-(\d{3})/);
        return match ? parseInt(match[1]) : 0;
      });
    
    const nextNumber = Math.max(...existingNumbers, 0) + 1;
    return `PRES-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  // Función para duplicar presupuesto
  const duplicatePresupuesto = async (id) => {
    const original = getPresupuestoById(id);
    if (!original) throw new Error('Presupuesto no encontrado');

    const duplicated = {
      ...original,
      id: undefined,
      numero: undefined,
      fecha: new Date(),
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      estado: ESTADOS_PRESUPUESTO.BORRADOR,
      observaciones: `Duplicado de ${original.numero} - ${original.observaciones}`
    };

    return await createPresupuesto(duplicated);
  };

  // Estadísticas
  const getEstadisticas = () => {
    const total = presupuestos.length;
    const aprobados = presupuestos.filter(p => p.estado === ESTADOS_PRESUPUESTO.APROBADO).length;
    const pendientes = presupuestos.filter(p => p.estado === ESTADOS_PRESUPUESTO.ENVIADO).length;
    const montoTotal = presupuestos
      .filter(p => p.estado === ESTADOS_PRESUPUESTO.APROBADO)
      .reduce((sum, p) => sum + p.total, 0);

    return {
      total,
      aprobados,
      pendientes,
      montoTotal,
      tasaAprobacion: total > 0 ? (aprobados / total * 100).toFixed(1) : 0
    };
  };

  return {
    // Estados
    presupuestos,
    loading,
    error,
    
    // Métodos CRUD
    createPresupuesto,
    updatePresupuesto, 
    deletePresupuesto,
    loadPresupuestos,
    
    // Consultas
    getPresupuestoById,
    getPresupuestosByCliente,
    getPresupuestosByEstado,
    
    // Utilidades
    duplicatePresupuesto,
    generateNumeroPresupuesto,
    getEstadisticas
  };
};

// Hook para gestionar clientes
export const useClientes = () => {
  const [clientes, setClientes] = useState(MOCK_CLIENTES);
  const [loading, setLoading] = useState(false);

  const getClienteById = (id) => {
    return clientes.find(c => c.id === id);
  };

  const searchClientes = (query) => {
    return clientes.filter(c => 
      c.nombre.toLowerCase().includes(query.toLowerCase()) ||
      c.contacto.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    clientes,
    loading,
    getClienteById,
    searchClientes
  };
};

// Hook para gestionar items de presupuesto
export const useItemsPresupuesto = () => {
  const [items, setItems] = useState(MOCK_ITEMS_PRESUPUESTO);

  const searchItems = (query) => {
    return items.filter(item =>
      item.descripcion.toLowerCase().includes(query.toLowerCase()) ||
      item.categoria.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getItemsByCategoria = (categoria) => {
    return items.filter(item => item.categoria === categoria);
  };

  return {
    items,
    searchItems,
    getItemsByCategoria
  };
};