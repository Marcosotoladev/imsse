// lib/services/apiService.js - Servicio universal para todas las APIs
import { getAuth } from 'firebase/auth';

class ApiService {
  
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
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
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

  // ========== USUARIOS ==========
  
  async obtenerUsuarios(filtros = {}) {
    const params = new URLSearchParams(filtros);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    return await this.makeRequest(`/api/users${queryString}`);
  }

  async obtenerPerfilUsuario(id) {
    return await this.makeRequest(`/api/users/${id}`);
  }

  async actualizarUsuario(id, data) {
    return await this.makeRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // FUNCIÓN ELIMINAR USUARIO - CRÍTICA
  async eliminarUsuario(id) {
    return await this.makeRequest(`/api/users/${id}`, {
      method: 'DELETE'
    });
  }

  async crearPerfilUsuario(uid, userData) {
    return await this.makeRequest('/api/users/create-profile', {
      method: 'POST',
      body: JSON.stringify({ uid, userData })
    });
  }

  // ========== CLIENTES ==========
  
  async obtenerClientePorEmail(email) {
    return await this.makeRequest('/api/clients/by-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async crearClienteCompleto(clienteData) {
    return await this.makeRequest('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clienteData)
    });
  }

  // ========== DOCUMENTOS ==========
  
  // Obtener documentos por tipo
  async obtenerDocumentos(tipo, filtros = {}) {
    const params = new URLSearchParams(filtros);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    return await this.makeRequest(`/api/documents/${tipo}${queryString}`);
  }

  // Obtener documento específico
  async obtenerDocumento(tipo, id) {
    return await this.makeRequest(`/api/documents/${tipo}/${id}`);
  }

  // Crear documento
  async crearDocumento(tipo, data) {
    return await this.makeRequest(`/api/documents/${tipo}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Actualizar documento
  async actualizarDocumento(tipo, id, data) {
    return await this.makeRequest(`/api/documents/${tipo}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Eliminar documento
  async eliminarDocumento(tipo, id) {
    return await this.makeRequest(`/api/documents/${tipo}/${id}`, {
      method: 'DELETE'
    });
  }

  // ========== MÉTODOS ESPECÍFICOS POR TIPO ==========
  
  // Presupuestos
  async obtenerPresupuestos(filtros = {}) {
    return this.obtenerDocumentos('presupuestos', filtros);
  }

  async crearPresupuesto(data) {
    return this.crearDocumento('presupuestos', data);
  }

  async obtenerPresupuestoPorId(id) {
    return this.obtenerDocumento('presupuestos', id);
  }

  async actualizarPresupuesto(id, data) {
    return this.actualizarDocumento('presupuestos', id, data);
  }

  async eliminarPresupuesto(id) {
    return this.eliminarDocumento('presupuestos', id);
  }

  // Recibos
  async obtenerRecibos(filtros = {}) {
    return this.obtenerDocumentos('recibos', filtros);
  }

  async crearRecibo(data) {
    return this.crearDocumento('recibos', data);
  }

  async obtenerReciboPorId(id) {
    return this.obtenerDocumento('recibos', id);
  }

  async actualizarRecibo(id, data) {
    return this.actualizarDocumento('recibos', id, data);
  }

  async eliminarRecibo(id) {
    return this.eliminarDocumento('recibos', id);
  }

  // Remitos
  async obtenerRemitos(filtros = {}) {
    return this.obtenerDocumentos('remitos', filtros);
  }

  async crearRemito(data) {
    return this.crearDocumento('remitos', data);
  }

  async obtenerRemitoPorId(id) {
    return this.obtenerDocumento('remitos', id);
  }

  async actualizarRemito(id, data) {
    return this.actualizarDocumento('remitos', id, data);
  }

  async eliminarRemito(id) {
    return this.eliminarDocumento('remitos', id);
  }

  // Estados de Cuenta
  async obtenerEstadosCuenta(filtros = {}) {
    return this.obtenerDocumentos('estados', filtros);
  }

  async crearEstadoCuenta(data) {
    return this.crearDocumento('estados', data);
  }

  async obtenerEstadoCuentaPorId(id) {
    return this.obtenerDocumento('estados', id);
  }

  async actualizarEstadoCuenta(id, data) {
    return this.actualizarDocumento('estados', id, data);
  }

  async eliminarEstadoCuenta(id) {
    return this.eliminarDocumento('estados', id);
  }

  // Órdenes de Trabajo
  async obtenerOrdenesTrabajo(filtros = {}) {
    return this.obtenerDocumentos('ordenes', filtros);
  }

  async crearOrdenTrabajo(data) {
    return this.crearDocumento('ordenes', data);
  }

  async obtenerOrdenTrabajoPorId(id) {
    return this.obtenerDocumento('ordenes', id);
  }

  async actualizarOrdenTrabajo(id, data) {
    return this.actualizarDocumento('ordenes', id, data);
  }

  async eliminarOrdenTrabajo(id) {
    return this.eliminarDocumento('ordenes', id);
  }

  // Recordatorios
  async obtenerRecordatorios(filtros = {}) {
    return this.obtenerDocumentos('recordatorios', filtros);
  }

  async crearRecordatorio(data) {
    return this.crearDocumento('recordatorios', data);
  }

  async obtenerRecordatorioPorId(id) {
    return this.obtenerDocumento('recordatorios', id);
  }

  async actualizarRecordatorio(id, data) {
    return this.actualizarDocumento('recordatorios', id, data);
  }

  async eliminarRecordatorio(id) {
    return this.eliminarDocumento('recordatorios', id);
  }

  // ========== ESTADÍSTICAS ==========
  
  async obtenerEstadisticas() {
    return await this.makeRequest('/api/statistics');
  }

  async obtenerEstadisticasCliente() {
    return await this.makeRequest('/api/statistics/cliente');
  }

  async obtenerEstadisticasUsuarios() {
    return await this.makeRequest('/api/statistics/usuarios');
  }

  // ========== FILTROS POR ROL ==========
  
  // Para técnicos - órdenes asignadas
  async obtenerOrdenesAsignadas() {
    return this.obtenerOrdenesTrabajo();
  }

  // Para técnicos - recordatorios propios  
  async obtenerRecordatoriosPropios() {
    return this.obtenerRecordatorios();
  }

  // Para clientes - solo sus documentos (filtro automático en backend)
  async obtenerMisDocumentos(tipo) {
    return this.obtenerDocumentos(tipo);
  }
}

// Exportar instancia singleton
const apiService = new ApiService();
export default apiService;

// También exportar la clase para testing
export { ApiService };

// Exportar funciones individuales para compatibilidad con el login
export const obtenerPerfilUsuario = (uid) => apiService.obtenerPerfilUsuario(uid);
export const crearPerfilUsuario = (uid, data) => apiService.crearPerfilUsuario(uid, data);
export const obtenerClientePorEmail = (email) => apiService.obtenerClientePorEmail(email);
export const crearClienteCompleto = (data) => apiService.crearClienteCompleto(data);