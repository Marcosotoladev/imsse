// lib/db/localDB.js - Base de datos local con IndexedDB para funcionalidad offline

class LocalDB {
  constructor() {
    this.dbName = 'ImssePWADB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        console.error('Error al abrir IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB inicializada correctamente');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('Actualizando esquema de IndexedDB');
        
        // Store para marcaciones
        if (!db.objectStoreNames.contains('marcaciones')) {
          const marcacionesStore = db.createObjectStore('marcaciones', { 
            keyPath: 'localId', 
            autoIncrement: true 
          });
          marcacionesStore.createIndex('tecnicoId', 'tecnicoId', { unique: false });
          marcacionesStore.createIndex('timestamp', 'timestamp', { unique: false });
          marcacionesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          marcacionesStore.createIndex('serverId', 'serverId', { unique: false });
          console.log('Store marcaciones creado');
        }
        
        // Store para órdenes de trabajo
        if (!db.objectStoreNames.contains('ordenes')) {
          const ordenesStore = db.createObjectStore('ordenes', { 
            keyPath: 'localId', 
            autoIncrement: true 
          });
          ordenesStore.createIndex('tecnicoId', 'tecnicoId', { unique: false });
          ordenesStore.createIndex('estado', 'estado', { unique: false });
          ordenesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          ordenesStore.createIndex('serverId', 'serverId', { unique: false });
          console.log('Store ordenes creado');
        }
        
        // Store para recordatorios
        if (!db.objectStoreNames.contains('recordatorios')) {
          const recordatoriosStore = db.createObjectStore('recordatorios', { 
            keyPath: 'localId', 
            autoIncrement: true 
          });
          recordatoriosStore.createIndex('tecnicoId', 'tecnicoId', { unique: false });
          recordatoriosStore.createIndex('fecha', 'fecha', { unique: false });
          recordatoriosStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          recordatoriosStore.createIndex('serverId', 'serverId', { unique: false });
          console.log('Store recordatorios creado');
        }
        
        // Store para cola de sincronización
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { 
            keyPath: 'localId', 
            autoIncrement: true 
          });
          syncStore.createIndex('action', 'action', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('retries', 'retries', { unique: false });
          console.log('Store syncQueue creado');
        }
      };
    });
  }

  // ========== MARCACIONES ==========
  
  async saveMarcacion(marcacion) {
    await this.init();
    
    const transaction = this.db.transaction(['marcaciones'], 'readwrite');
    const store = transaction.objectStore('marcaciones');
    
    const marcacionLocal = {
      ...marcacion,
      syncStatus: marcacion.syncStatus || 'pending',
      localTimestamp: new Date().toISOString(),
      serverId: marcacion.id || null
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(marcacionLocal);
      request.onsuccess = () => {
        console.log('Marcación guardada localmente:', request.result);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('Error al guardar marcación:', request.error);
        reject(request.error);
      };
    });
  }

  async getMarcaciones(tecnicoId) {
    await this.init();
    
    const transaction = this.db.transaction(['marcaciones'], 'readonly');
    const store = transaction.objectStore('marcaciones');
    const index = store.index('tecnicoId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(tecnicoId);
      request.onsuccess = () => {
        // Filtrar las marcaciones eliminadas y ordenar por timestamp
        const marcaciones = request.result
          .filter(m => !m.deleted)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        resolve(marcaciones);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateMarcacion(localId, updates) {
    await this.init();
    
    const transaction = this.db.transaction(['marcaciones'], 'readwrite');
    const store = transaction.objectStore('marcaciones');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(localId);
      getRequest.onsuccess = () => {
        const marcacion = getRequest.result;
        if (!marcacion) {
          reject(new Error('Marcación no encontrada'));
          return;
        }
        
        const marcacionActualizada = { ...marcacion, ...updates };
        const putRequest = store.put(marcacionActualizada);
        putRequest.onsuccess = () => resolve(putRequest.result);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteMarcacion(localId) {
    await this.init();
    
    const transaction = this.db.transaction(['marcaciones'], 'readwrite');
    const store = transaction.objectStore('marcaciones');
    
    return new Promise((resolve, reject) => {
      // Marcar como eliminado en lugar de eliminar físicamente
      const getRequest = store.get(localId);
      getRequest.onsuccess = () => {
        const marcacion = getRequest.result;
        if (!marcacion) {
          reject(new Error('Marcación no encontrada'));
          return;
        }
        
        marcacion.deleted = true;
        marcacion.deletedAt = new Date().toISOString();
        
        const putRequest = store.put(marcacion);
        putRequest.onsuccess = () => resolve(putRequest.result);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ========== ÓRDENES DE TRABAJO ==========
  
  async saveOrden(orden) {
    await this.init();
    
    const transaction = this.db.transaction(['ordenes'], 'readwrite');
    const store = transaction.objectStore('ordenes');
    
    const ordenLocal = {
      ...orden,
      syncStatus: orden.syncStatus || 'pending',
      localTimestamp: new Date().toISOString(),
      serverId: orden.id || null
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(ordenLocal);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getOrdenes(tecnicoId) {
    await this.init();
    
    const transaction = this.db.transaction(['ordenes'], 'readonly');
    const store = transaction.objectStore('ordenes');
    const index = store.index('tecnicoId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(tecnicoId);
      request.onsuccess = () => {
        const ordenes = request.result.filter(o => !o.deleted);
        resolve(ordenes);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ========== RECORDATORIOS ==========
  
  async saveRecordatorio(recordatorio) {
    await this.init();
    
    const transaction = this.db.transaction(['recordatorios'], 'readwrite');
    const store = transaction.objectStore('recordatorios');
    
    const recordatorioLocal = {
      ...recordatorio,
      syncStatus: recordatorio.syncStatus || 'pending',
      localTimestamp: new Date().toISOString(),
      serverId: recordatorio.id || null
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(recordatorioLocal);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getRecordatorios(tecnicoId) {
    await this.init();
    
    const transaction = this.db.transaction(['recordatorios'], 'readonly');
    const store = transaction.objectStore('recordatorios');
    const index = store.index('tecnicoId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(tecnicoId);
      request.onsuccess = () => {
        const recordatorios = request.result.filter(r => !r.deleted);
        resolve(recordatorios);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ========== COLA DE SINCRONIZACIÓN ==========
  
  async addToSyncQueue(action, data, priority = 'normal') {
    await this.init();
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    const syncItem = {
      action,
      data,
      priority,
      timestamp: new Date().toISOString(),
      retries: 0,
      lastAttempt: null,
      error: null
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(syncItem);
      request.onsuccess = () => {
        console.log('Agregado a cola de sincronización:', action);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue() {
    await this.init();
    
    const transaction = this.db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        // Ordenar por prioridad y timestamp
        const items = request.result.sort((a, b) => {
          if (a.priority === 'high' && b.priority !== 'high') return -1;
          if (b.priority === 'high' && a.priority !== 'high') return 1;
          return new Date(a.timestamp) - new Date(b.timestamp);
        });
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeSyncItem(localId) {
    await this.init();
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(localId);
      request.onsuccess = () => {
        console.log('Elemento removido de cola de sincronización:', localId);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateSyncItem(localId, updates) {
    await this.init();
    
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(localId);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          reject(new Error('Item de sincronización no encontrado'));
          return;
        }
        
        const itemActualizado = { ...item, ...updates };
        const putRequest = store.put(itemActualizado);
        putRequest.onsuccess = () => resolve(putRequest.result);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ========== UTILIDADES ==========
  
  async clearAllData() {
    await this.init();
    
    const stores = ['marcaciones', 'ordenes', 'recordatorios', 'syncQueue'];
    
    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    console.log('Todos los datos locales eliminados');
  }

  async getStorageInfo() {
    await this.init();
    
    const info = {};
    const stores = ['marcaciones', 'ordenes', 'recordatorios', 'syncQueue'];
    
    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      info[storeName] = await new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    
    return info;
  }

  // ========== BÚSQUEDAS ESPECÍFICAS ==========
  
  async findMarcacionByServerId(serverId) {
    await this.init();
    
    const transaction = this.db.transaction(['marcaciones'], 'readonly');
    const store = transaction.objectStore('marcaciones');
    const index = store.index('serverId');
    
    return new Promise((resolve, reject) => {
      const request = index.get(serverId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingSyncItems() {
    const syncQueue = await this.getSyncQueue();
    return syncQueue.filter(item => item.retries < 3); // Solo intentar 3 veces
  }
}

// Exportar instancia singleton
const localDB = new LocalDB();
export default localDB;