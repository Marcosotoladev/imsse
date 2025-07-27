// lib/services/clienteService.js - Servicio para consumir APIs del cliente
import { getAuth } from 'firebase/auth';

class ClienteService {
  
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

  // Verificar autenticación del cliente
  async verificarAuth() {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      if (!response.ok) {
        throw new Error('Verificación fallida');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en verificación:', error);
      throw error;
    }
  }

  // Obtener estadísticas del cliente
  async obtenerEstadisticas() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch('/api/cliente/estadisticas', {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Obtener documentos por tipo
  async obtenerDocumentos(tipo) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`/api/cliente/documentos/${tipo}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener ${tipo}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al obtener ${tipo}:`, error);
      throw error;
    }
  }

  // Métodos específicos para cada tipo de documento
  async obtenerPresupuestos() {
    return this.obtenerDocumentos('presupuestos');
  }

  async obtenerRecibos() {
    return this.obtenerDocumentos('recibos');
  }

  async obtenerRemitos() {
    return this.obtenerDocumentos('remitos');
  }

  async obtenerOrdenesTrabajo() {
    return this.obtenerDocumentos('ordenesTrabajo');
  }

  async obtenerRecordatorios() {
    return this.obtenerDocumentos('recordatorios');
  }

  async obtenerEstadosCuenta() {
    return this.obtenerDocumentos('estadosCuenta');
  }
}

// Exportar instancia singleton
export default new ClienteService();