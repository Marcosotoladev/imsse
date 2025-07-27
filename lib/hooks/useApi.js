// ============= lib/hooks/useApi.js =============
import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

// Hook genérico para cualquier endpoint
export function useApi(apiCall, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiCall();
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Error al cargar datos');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
}

// Hooks específicos para documentos
export function useDocuments(type, filtros = {}) {
  return useApi(
    () => apiService.obtenerDocumentos(type, filtros),
    [type, JSON.stringify(filtros)]
  );
}

export function useDocument(type, id) {
  return useApi(
    () => apiService.obtenerDocumento(type, id),
    [type, id]
  );
}

// Hooks específicos por tipo
export function usePresupuestos(filtros = {}) {
  return useDocuments('presupuestos', filtros);
}

export function useRecibos(filtros = {}) {
  return useDocuments('recibos', filtros);
}

export function useRemitos(filtros = {}) {
  return useDocuments('remitos', filtros);
}

export function useOrdenesTrabajo(filtros = {}) {
  return useDocuments('ordenes', filtros);
}

export function useRecordatorios(filtros = {}) {
  return useDocuments('recordatorios', filtros);
}

export function useEstadosCuenta(filtros = {}) {
  return useDocuments('estados', filtros);
}

// Hook para usuarios (admin)
export function useUsers(filtros = {}) {
  return useApi(
    () => apiService.obtenerUsuarios(filtros),
    [JSON.stringify(filtros)]
  );
}

// Hook para estadísticas
export function useStatistics() {
  return useApi(() => apiService.obtenerEstadisticas(), []);
}

// Hook para operaciones CRUD
export function useDocumentMutations(type) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.crearDocumento(type, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.actualizarDocumento(type, id, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.eliminarDocumento(type, id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    update,
    remove,
    loading,
    error
  };
}