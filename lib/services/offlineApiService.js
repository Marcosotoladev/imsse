// lib/services/offlineApiService.js - Servicio API que funciona online y offline

import localDB from '../db/localDB';
import apiService from './apiService';
import tecnicoService from './tecnicoService';
import { uploadToCloudinary, subirFotos } from '../cloudinary';
import { archivoABase64, base64ToBlob } from '../imagenes';

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

  // Crea una Orden de Trabajo. `fotosFiles` son los File originales elegidos en el
  // formulario, todavía sin subir: si hay conexión se suben a Cloudinary antes de
  // crear el documento; si no, se guardan como base64 en IndexedDB y se suben recién
  // al sincronizar (mismo patrón que `crearInspeccionTecnica`).
  async crearOrdenTrabajo(datos, fotosFiles = []) {
    try {
      if (this.isOnline) {
        console.log('Creando orden de trabajo online');
        const fotosSubidas = await subirFotos(fotosFiles, 'ordenes_trabajo');
        const payload = { ...datos, fotos: fotosSubidas };
        const result = await apiService.crearOrdenTrabajo(payload);

        await localDB.saveOrden({
          ...payload,
          serverId: result.id,
          syncStatus: 'synced'
        });

        return { ...result, offline: false };
      } else {
        throw new Error('Sin conexión');
      }
    } catch (error) {
      console.log('Error online, guardando orden offline:', error.message);

      const fotosBase64 = await Promise.all(
        fotosFiles.map(async (file) => ({ nombre: file.name, dataUrl: await archivoABase64(file) }))
      );

      const datosOffline = { ...datos, fotosPendientes: fotosBase64 };
      const localId = await localDB.saveOrden({ ...datosOffline, syncStatus: 'pending' });
      await localDB.addToSyncQueue('CREATE_ORDEN', { ...datosOffline, localId }, 'high');

      return {
        success: true,
        offline: true,
        localId,
        message: 'Guardado offline. Se sincronizará automáticamente cuando haya conexión.'
      };
    }
  }

  // Actualiza una Orden de Trabajo existente. `datos.fotos` son las fotos que ya
  // estaban subidas (se conservan), `fotosFiles` son los File nuevos todavía sin subir.
  async actualizarOrdenTrabajo(id, datos, fotosFiles = []) {
    try {
      if (this.isOnline) {
        console.log('Actualizando orden de trabajo online');
        const fotosNuevas = await subirFotos(fotosFiles, 'ordenes_trabajo');
        const payload = { ...datos, fotos: [...(datos.fotos || []), ...fotosNuevas] };
        const result = await apiService.actualizarOrdenTrabajo(id, payload);

        const existente = await localDB.findOrdenByServerId(id);
        if (existente) {
          await localDB.updateOrden(existente.localId, { ...payload, serverId: id, syncStatus: 'synced' });
        } else {
          await localDB.saveOrden({ ...payload, serverId: id, syncStatus: 'synced' });
        }

        return { ...result, offline: false };
      } else {
        throw new Error('Sin conexión');
      }
    } catch (error) {
      console.log('Error online, guardando actualización de orden offline:', error.message);

      const fotosBase64 = await Promise.all(
        fotosFiles.map(async (file) => ({ nombre: file.name, dataUrl: await archivoABase64(file) }))
      );

      await localDB.addToSyncQueue('UPDATE_ORDEN', { id, datos, fotosPendientes: fotosBase64 }, 'high');

      return {
        success: true,
        offline: true,
        message: 'Guardado offline. Se sincronizará automáticamente cuando haya conexión.'
      };
    }
  }

  // ========== INSPECCIONES TÉCNICAS ==========

  // Crea una Inspección Técnica. `fotosFiles` son los File originales elegidos en el
  // formulario: si hay conexión se suben a Cloudinary antes de crear el documento;
  // si no, se guardan como base64 en IndexedDB y se suben recién al sincronizar.
  async crearInspeccionTecnica(datos, fotosFiles = []) {
    try {
      if (this.isOnline) {
        console.log('Creando inspección técnica online');
        const fotosSubidas = await Promise.all(
          fotosFiles.map((file) => uploadToCloudinary(file, 'inspecciones_tecnicas'))
        );
        const payload = { ...datos, fotos: fotosSubidas };
        const result = await apiService.crearInspeccionTecnica(payload);

        await localDB.saveInspeccion({
          ...payload,
          serverId: result.id,
          syncStatus: 'synced'
        });

        return { ...result, offline: false };
      } else {
        throw new Error('Sin conexión');
      }
    } catch (error) {
      console.log('Error online, guardando inspección offline:', error.message);

      const fotosBase64 = await Promise.all(
        fotosFiles.map(async (file) => ({ nombre: file.name, dataUrl: await archivoABase64(file) }))
      );

      const datosOffline = { ...datos, fotosPendientes: fotosBase64 };
      const localId = await localDB.saveInspeccion({ ...datosOffline, syncStatus: 'pending' });
      await localDB.addToSyncQueue('CREATE_INSPECCION', { ...datosOffline, localId }, 'high');

      return {
        success: true,
        offline: true,
        localId,
        message: 'Guardado offline. Se sincronizará automáticamente cuando haya conexión.'
      };
    }
  }

  // Actualiza una Inspección Técnica existente. `datos.fotos` son las fotos que ya
  // estaban subidas (se conservan), `fotosFiles` son los File nuevos todavía sin subir.
  async actualizarInspeccionTecnica(id, datos, fotosFiles = []) {
    try {
      if (this.isOnline) {
        console.log('Actualizando inspección técnica online');
        const fotosNuevas = await subirFotos(fotosFiles, 'inspecciones_tecnicas');
        const payload = { ...datos, fotos: [...(datos.fotos || []), ...fotosNuevas] };
        const result = await apiService.actualizarInspeccionTecnica(id, payload);

        const existente = await localDB.findInspeccionByServerId(id);
        if (existente) {
          await localDB.updateInspeccion(existente.localId, { ...payload, serverId: id, syncStatus: 'synced' });
        } else {
          await localDB.saveInspeccion({ ...payload, serverId: id, syncStatus: 'synced' });
        }

        return { ...result, offline: false };
      } else {
        throw new Error('Sin conexión');
      }
    } catch (error) {
      console.log('Error online, guardando actualización de inspección offline:', error.message);

      const fotosBase64 = await Promise.all(
        fotosFiles.map(async (file) => ({ nombre: file.name, dataUrl: await archivoABase64(file) }))
      );

      await localDB.addToSyncQueue('UPDATE_INSPECCION', { id, datos, fotosPendientes: fotosBase64 }, 'high');

      return {
        success: true,
        offline: true,
        message: 'Guardado offline. Se sincronizará automáticamente cuando haya conexión.'
      };
    }
  }

  async obtenerInspeccionesTecnicas() {
    try {
      if (this.isOnline) {
        console.log('Obteniendo inspecciones técnicas online');
        const result = await apiService.obtenerInspeccionesTecnicas();

        if (result?.documents) {
          for (const inspeccion of result.documents) {
            const existing = await localDB.findInspeccionByServerId(inspeccion.id);
            if (!existing) {
              await localDB.saveInspeccion({
                ...inspeccion,
                serverId: inspeccion.id,
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
      console.log('Error online, obteniendo inspecciones offline:', error.message);

      const localInspecciones = await localDB.getInspecciones();

      return {
        documents: localInspecciones.map((i) => ({
          ...i,
          id: i.serverId || `local_${i.localId}`,
          isPending: i.syncStatus === 'pending'
        })),
        offline: true
      };
    }
  }

  async eliminarInspeccionTecnica(id) {
    try {
      const isLocalId = String(id).startsWith('local_');

      if (isLocalId) {
        const localId = parseInt(String(id).replace('local_', ''), 10);
        await localDB.deleteInspeccion(localId);

        const syncQueue = await localDB.getSyncQueue();
        const syncItem = syncQueue.find(
          (item) => item.action === 'CREATE_INSPECCION' && item.data.localId === localId
        );
        if (syncItem) {
          await localDB.removeSyncItem(syncItem.localId);
        }

        return { success: true, offline: true };
      }

      if (this.isOnline) {
        const result = await apiService.eliminarInspeccionTecnica(id);

        const localInspeccion = await localDB.findInspeccionByServerId(id);
        if (localInspeccion) {
          await localDB.deleteInspeccion(localInspeccion.localId);
        }

        return { ...result, offline: false };
      } else {
        throw new Error('Sin conexión');
      }
    } catch (error) {
      console.log('Error online, marcando inspección para eliminar:', error.message);

      await localDB.addToSyncQueue('DELETE_INSPECCION', { id }, 'high');

      const localInspeccion = await localDB.findInspeccionByServerId(id);
      if (localInspeccion) {
        await localDB.deleteInspeccion(localInspeccion.localId);
      }

      return {
        success: true,
        offline: true,
        message: 'Marcado para eliminar. Se eliminará del servidor cuando haya conexión.'
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

            case 'CREATE_INSPECCION': {
              console.log('Sincronizando inspección técnica:', item.data);
              const { localId, fotosPendientes, ...datosInspeccion } = item.data;

              // Recién ahora, con conexión confirmada, se convierten las fotos
              // guardadas en base64 de vuelta a Blob y se suben a Cloudinary.
              const fotosSubidas = await Promise.all(
                (fotosPendientes || []).map(async (foto) => {
                  const blob = base64ToBlob(foto.dataUrl);
                  blob.name = foto.nombre;
                  return uploadToCloudinary(blob, 'inspecciones_tecnicas');
                })
              );

              result = await apiService.crearInspeccionTecnica({ ...datosInspeccion, fotos: fotosSubidas });

              if (localId && result.id) {
                await localDB.updateInspeccion(localId, {
                  serverId: result.id,
                  syncStatus: 'synced',
                  fotos: fotosSubidas,
                  fotosPendientes: undefined
                });
              }
              break;
            }

            case 'DELETE_INSPECCION':
              console.log('Sincronizando eliminación de inspección:', item.data.id);
              result = await apiService.eliminarInspeccionTecnica(item.data.id);
              break;

            case 'CREATE_ORDEN': {
              console.log('Sincronizando orden de trabajo:', item.data);
              const { localId, fotosPendientes, ...datosOrden } = item.data;

              const fotosSubidas = await Promise.all(
                (fotosPendientes || []).map(async (foto) => {
                  const blob = base64ToBlob(foto.dataUrl);
                  blob.name = foto.nombre;
                  return uploadToCloudinary(blob, 'ordenes_trabajo');
                })
              );

              result = await apiService.crearOrdenTrabajo({ ...datosOrden, fotos: fotosSubidas });

              if (localId && result.id) {
                await localDB.updateOrden(localId, {
                  serverId: result.id,
                  syncStatus: 'synced',
                  fotos: fotosSubidas,
                  fotosPendientes: undefined
                });
              }
              break;
            }

            case 'UPDATE_ORDEN': {
              console.log('Sincronizando actualización de orden:', item.data);
              const { id, datos, fotosPendientes } = item.data;

              const fotosNuevasSubidas = await Promise.all(
                (fotosPendientes || []).map(async (foto) => {
                  const blob = base64ToBlob(foto.dataUrl);
                  blob.name = foto.nombre;
                  return uploadToCloudinary(blob, 'ordenes_trabajo');
                })
              );

              const payload = { ...datos, fotos: [...(datos.fotos || []), ...fotosNuevasSubidas] };
              result = await apiService.actualizarOrdenTrabajo(id, payload);

              const ordenExistente = await localDB.findOrdenByServerId(id);
              if (ordenExistente) {
                await localDB.updateOrden(ordenExistente.localId, { ...payload, serverId: id, syncStatus: 'synced' });
              }
              break;
            }

            case 'UPDATE_INSPECCION': {
              console.log('Sincronizando actualización de inspección técnica:', item.data);
              const { id, datos, fotosPendientes } = item.data;

              const fotosNuevasSubidas = await Promise.all(
                (fotosPendientes || []).map(async (foto) => {
                  const blob = base64ToBlob(foto.dataUrl);
                  blob.name = foto.nombre;
                  return uploadToCloudinary(blob, 'inspecciones_tecnicas');
                })
              );

              const payload = { ...datos, fotos: [...(datos.fotos || []), ...fotosNuevasSubidas] };
              result = await apiService.actualizarInspeccionTecnica(id, payload);

              const inspeccionExistente = await localDB.findInspeccionByServerId(id);
              if (inspeccionExistente) {
                await localDB.updateInspeccion(inspeccionExistente.localId, { ...payload, serverId: id, syncStatus: 'synced' });
              }
              break;
            }

            default:
              console.warn('Acción de sincronización desconocida:', item.action);
          }
          
          // Eliminar de la cola si se sincronizó exitosamente
          await localDB.removeSyncItem(item.localId);
          console.log('Elemento sincronizado correctamente:', item.action);
          
        } catch (error) {
          console.error(`Error sincronizando ${item.action}:`, error);

          // Si ya era el 3er intento fallido, se marca "fallido" y se deja visible en
          // la cola (en vez de borrarlo en silencio) para que el técnico/admin pueda
          // notar que algo no se sincronizó nunca, vía `getOfflineStatus().fallidos`.
          const seDaPorVencido = item.retries >= 2;

          await localDB.updateSyncItem(item.localId, {
            retries: item.retries + 1,
            lastAttempt: new Date().toISOString(),
            error: error.message,
            ...(seDaPorVencido ? { estado: 'fallido' } : {})
          });

          if (seDaPorVencido) {
            console.warn('Elemento marcado como fallido tras múltiples fallos:', item.action);
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
    const fallidos = syncQueue.filter((item) => item.estado === 'fallido').length;

    return {
      ...this.getConnectionStatus(),
      pendingSync: syncQueue.length - fallidos,
      fallidos,
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