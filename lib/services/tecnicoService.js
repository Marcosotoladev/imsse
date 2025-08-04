// lib/services/tecnicoService.js
import { getAuth } from 'firebase/auth';

class TecnicoService {
  // Obtener token del usuario actual
  async getAuthToken() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    return await user.getIdToken();
  }

  // Headers con autenticación
  async getAuthHeaders() {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Método genérico para hacer requests
  async makeRequest(url, options = {}) {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        // Intentar leer el mensaje de error del backend
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error en ${url}:`, error);
      throw error;
    }
  }

  // ========== AUTENTICACIÓN ==========

  async verificarAuth() {
    const token = await this.getAuthToken();

    return await this.makeRequest('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  // ========== CLIENTES ==========

  async obtenerClientes() {
    return await this.makeRequest('/api/tecnico/clientes');
  }

  // ========== ESTADÍSTICAS ==========

  async obtenerEstadisticas() {
    return await this.makeRequest('/api/tecnico/estadisticas');
  }

  // ========== ÓRDENES DE TRABAJO ==========

  async obtenerTodasLasOrdenes() {
    return await this.makeRequest('/api/tecnico/ordenes/todas');
  }

  async obtenerOrden(id) {
    return await this.makeRequest(`/api/tecnico/ordenes/${id}`);
  }

  async crearOrden(ordenData) {
    return await this.makeRequest('/api/tecnico/ordenes', {
      method: 'POST',
      body: JSON.stringify(ordenData)
    });
  }

  async actualizarOrden(id, ordenData) {
    return await this.makeRequest(`/api/tecnico/ordenes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ordenData)
    });
  }

  async eliminarOrden(id) {
    return await this.makeRequest(`/api/tecnico/ordenes/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== RECORDATORIOS ==========

  async obtenerTodosLosRecordatorios() {
    return await this.makeRequest('/api/tecnico/recordatorios/todos');
  }

  async obtenerRecordatorio(id) {
    return await this.makeRequest(`/api/tecnico/recordatorios/${id}`);
  }

  async crearRecordatorio(recordatorioData) {
    return await this.makeRequest('/api/tecnico/recordatorios', {
      method: 'POST',
      body: JSON.stringify(recordatorioData)
    });
  }

  async actualizarRecordatorio(id, recordatorioData) {
    return await this.makeRequest(`/api/tecnico/recordatorios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordatorioData)
    });
  }

  async eliminarRecordatorio(id) {
    return await this.makeRequest(`/api/tecnico/recordatorios/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== MÉTODOS DE CONVENIENCIA ==========

  async obtenerOrdenesPorEstado(estado) {
    return await this.makeRequest(`/api/tecnico/ordenes/estado/${estado}`);
  }

  async obtenerRecordatoriosHoy() {
    return await this.makeRequest('/api/tecnico/recordatorios/hoy');
  }

  async obtenerRecordatoriosProximos() {
    return await this.makeRequest('/api/tecnico/recordatorios/proximos');
  }

  async marcarRecordatorioCompletado(id) {
    return await this.makeRequest(`/api/tecnico/recordatorios/${id}/completar`, {
      method: 'PUT'
    });
  }

  async cambiarEstadoOrden(id, nuevoEstado) {
    return await this.makeRequest(`/api/tecnico/ordenes/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado })
    });
  }
}

const tecnicoService = new TecnicoService();
export default tecnicoService;

