// lib/services/offlineApiService.js - Servicio API que funciona online y offline

import localDB from '../db/localDB';
import apiService from './apiService';
import tecnicoService from './tecnicoService';

class OfflineApiService {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.syncInProgress = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Conexión restaurada');
        this.isOnline = true;
        this.syncPendingData();
      });
      
      window.addEventListener('offline', () => {
        console.log('Conexión perdida');
        this.isOnline = false;
      });
    }
  }

  // ========== MARCACIONES ==========
  
  async crearMarcacion(data) {
    try {
      if (this.isOnline) {
        // Intentar guardar online primero
        console.log('Intentando crear marcación online');
        const result = await apiService.crearMarcacion(data);
        
        // También guardar localmente con estado sincronizado
        await localDB.saveMarcacion({
          ...data,
          serverId: result.id,
          syncStatus: 'synced'
        });
        
        return { ...result, offline: false };
      } else {
        throw new Error('Sin conexión');
      }
    } catch (error) {
      console.log('Error online, guardando offline:', error.message);
      
      // Guardar offline con ID temporal
      const localId = await localDB.saveMarcacion({
        ...data,
        syncStatus: 'pending'
      });
      
      // Agregar a cola de sincronización
      await localDB.addToSyncQueue('CREATE_MARCACION', {
        ...data,
        localId
      }, 'high');
      
      return { 
        success: true, 
        offline: true, 
        localId,
        message: 'Guardado offline. Se sincronizará cuando haya conexión.'
      };
    }
  }

  async obtenerMarcacionesTecnico(tecnicoId, filtros = {}) {
    try {
      if (this.isOnline) {
        // Intentar obtener datos frescos del servidor
        console.log('Obteniendo marcaciones online');
        const result = await apiService.obtenerMarcacionesTecnico(tecnicoId, filtros);
        
        // Actualizar cache local con datos del servidor
        if (result?.documents) {
          for (const marcacion of result.documents) {
            // Verificar si ya existe localmente
            const existing = await localDB.findMarcacionByServerId(marcacion.id);
            if (!existing) {
              await localDB.saveMarcacion({
                ...marcacion,
                serverId: marcacion.id,
                syncStatus: 'synced'
              });
            }
          }
        }
        
        // Obtener datos locales para incluir marcaciones pendientes
        const localData = await localDB.getMarcaciones(tecnicoId);
        
        // Combinar datos del servidor con pendientes locales
        const serverIds = new Set((result?.documents || []).map(m => m.id));
        const pendingLocal = localData.filter(m => 
          m.syncStatus === 'pending' && !serverIds.has(m.serverId)
        );
        
        const combinedDocuments = [
          ...(result?.documents || []),
          ...pendingLocal.map(m => ({
            ...m,
            id: m.serverId || `local_${m.localId}`,
            isPending: true
          }))
        ];
        
        return {
          ...result,
          documents: combinedDocuments.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          ),
          offline: false
        };
      } else {
        throw new Error('Sin conexión');
      }
    } catch (error) {
      console.log('Error online, obteniendo datos offline:', error.message);
      
      // Fallback a datos locales únicamente
      const localData = await localDB.getMarcaciones(tecnicoId);
      
      return {
        documents: localData.map(m => ({
          ...m,
          id: m.serverId || `local_${m.localId}`,
          isPending: m.syncStatus === 'pending'
        })),
        offline: true
      };
    }
  }

  async eliminarMarcacion(id) {
    try {
      // Verificar si es una marcación local
      const isLocalId = id.startsWith('local_');
      
      if (isLocalId) {
        // Es una marcación que solo existe localmente
        const localId = parseInt(id.replace('local_', ''));
        await localDB.deleteMarcacion(localId);
        
        // Eliminar de cola de sincronización si existe
        const syncQueue = await localDB.getSyncQueue();
        const syncItem = syncQueue.find(item => 
          item.action === 'CREATE_MARCACION' && item.data.localId === localId
        );
        
        if (syncItem) {
          await localDB.removeSyncItem(syncItem.localId);
        }
        
        return { success: true, offline: true };
      }
      
      if (this.isOnline) {
        // Eliminar del servidor
        console.log('Eliminando marcación online');
        const result = await apiService.eliminarMarcacion(id);
        
        // Eliminar también del cache local
        const localMarcacion = await localDB.findMarcacionByServerId(id);
        if (localMarcacion) {
          await localDB.deleteMarcacion(localMarcacion.localId);
        }
        
        return { ...result, offline: false };
      } else {
        throw new Error('Sin conexión');
      }
    } catch (error) {
      console.log('Error online, marcando para eliminar:', error.message);
      
      // Marcar para eliminar cuando vuelva la conexión
      await localDB.addToSyncQueue('DELETE_MARCACION', { id }, 'high');
      
      // Marcar como eliminado localmente
      const localMarcacion = await localDB.findMarcacionByServerId(id);
      if (localMarcacion) {
        await localDB.deleteMarcacion(localMarcacion.localId);
      }
      
      return { 
        success: true, 
        offline: true,
        message: 'Marcado para eliminar. Se eliminará del servidor cuando haya conexión.'
      };
    }
  }

  // ========== ÓRDENES DE TRABAJO ==========
  
  async obtenerOrdenesTecnico() {
    try {
      if (this.isOnline) {
        console.log('Obteniendo órdenes online');
        const result = await tecnicoService.obtenerTodasLasOrdenes();
        
        // Actualizar cache local
        if (result?.documents || result?.ordenes) {
          const ordenes = result.documents || result.ordenes || [];
          for (const orden of ordenes) {
            const existing = await localDB.findOrdenByServerId(orden.id);
            if (!existing) {
              await localDB.saveOrden({
                ...orden,
                serverId: orden.id,
                syncStatus: 'synced'
              });
            }
          }
        }
        
        return { ...result, offline: false };
      } else {
        throw new Error('Sin conexión');
      }
    } catch (error) {
      console.log('Error online, obteniendo órdenes offline:', error.message);
      
      // Obtener del cache local
      const localOrdenes = await localDB.getOrdenes();
      
      return {
        documents: localOrdenes,
        offline: true
      };
    }
  }

  // ========== RECORDATORIOS ==========
  
  async obtenerRecordatoriosTecnico() {
    try {
      if (this.isOnline) {
        console.log('Obteniendo recordatorios online');
        const result = await tecnicoService.obtenerTodosLosRecordatorios();
        
        // Actualizar cache local
        if (result?.documents || result?.recordatorios) {
          const recordatorios = result.documents || result.recordatorios || [];
          for (const recordatorio of recordatorios) {
            const existing = await localDB.findRecordatorioByServerId(recordatorio.id);
            if (!existing) {
              await localDB.saveRecordatorio({
                ...recordatorio,
                serverId: recordatorio.id,
                syncStatus: 'synced'
              });
            }
          }
        }
        
        return { ...result, offline: false };
      } else {
        throw new Error('Sin conexión');
      }
    } catch (error) {
      console.log('Error online, obteniendo recordatorios offline:', error.message);
      
      // Obtener del cache local
      const localRecordatorios = await localDB.getRecordatorios();
      
      return {
        documents: localRecordatorios,
        offline: true
      };
    }
  }

  // ========== SINCRONIZACIÓN ==========
  
  async syncPendingData() {
    if (this.syncInProgress) {
      console.log('Sincronización ya en progreso');
      return;
    }
    
    this.syncInProgress = true;
    console.log('Iniciando sincronización de datos pendientes');
    
    try {
      const syncQueue = await localDB.getPendingSyncItems();
      console.log(`${syncQueue.length} elementos en cola de sincronización`);
      
      for (const item of syncQueue) {
        try {
          let result = null;
          
          switch (item.action) {
            case 'CREATE_MARCACION':
              console.log('Sincronizando marcación:', item.data);
              result = await apiService.crearMarcacion(item.data);
              
              // Actualizar la marcación local con el ID del servidor
              if (item.data.localId && result.id) {
                await localDB.updateMarcacion(item.data.localId, {
                  serverId: result.id,
                  syncStatus: 'synced'
                });
              }
              break;
              
            case 'DELETE_MARCACION':
              console.log('Sincronizando eliminación:', item.data.id);
              result = await apiService.eliminarMarcacion(item.data.id);
              break;
              
            default:
              console.warn('Acción de sincronización desconocida:', item.action);
          }
          
          // Eliminar de la cola si se sincronizó exitosamente
          await localDB.removeSyncItem(item.localId);
          console.log('Elemento sincronizado correctamente:', item.action);
          
        } catch (error) {
          console.error(`Error sincronizando ${item.action}:`, error);
          
          // Incrementar contador de reintentos
          await localDB.updateSyncItem(item.localId, {
            retries: item.retries + 1,
            lastAttempt: new Date().toISOString(),
            error: error.message
          });
          
          // Si ha fallado muchas veces, eliminar de la cola
          if (item.retries >= 2) {
            console.warn('Eliminando elemento tras múltiples fallos:', item.action);
            await localDB.removeSyncItem(item.localId);
          }
        }
      }
      
      console.log('Sincronización completada');
      
    } catch (error) {
      console.error('Error durante la sincronización:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // ========== ESTADO ==========
  
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress
    };
  }

  async getOfflineStatus() {
    const storageInfo = await localDB.getStorageInfo();
    const syncQueue = await localDB.getSyncQueue();
    
    return {
      ...this.getConnectionStatus(),
      pendingSync: syncQueue.length,
      localData: storageInfo
    };
  }

  // ========== FORZAR SINCRONIZACIÓN ==========
  
  async forcSync() {
    if (this.isOnline) {
      return this.syncPendingData();
    } else {
      throw new Error('No hay conexión para sincronizar');
    }
  }
}

// Exportar instancia singleton
const offlineApiService = new OfflineApiService();
export default offlineApiService;