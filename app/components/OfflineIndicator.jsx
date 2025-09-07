// app/components/OfflineIndicator.jsx - Componente indicador de estado offline

'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Database, AlertCircle, CheckCircle } from 'lucide-react';
import offlineApiService from '../../lib/services/offlineApiService';

export default function OfflineIndicator({ showDetails = false, className = '' }) {
  const [isOnline, setIsOnline] = useState(true);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Verificar estado inicial
    setIsOnline(navigator.onLine);
    updateOfflineStatus();

    // Escuchar cambios de conexión
    const handleOnline = () => {
      setIsOnline(true);
      updateOfflineStatus();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      updateOfflineStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Actualizar estado cada 30 segundos
    const interval = setInterval(updateOfflineStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const updateOfflineStatus = async () => {
    try {
      const status = await offlineApiService.getOfflineStatus();
      setOfflineStatus(status);
      setSyncInProgress(status.syncInProgress);
    } catch (error) {
      console.error('Error obteniendo estado offline:', error);
    }
  };

  const handleForceSync = async () => {
    if (!isOnline) return;
    
    try {
      setSyncInProgress(true);
      await offlineApiService.forcSync();
      await updateOfflineStatus();
    } catch (error) {
      console.error('Error forzando sincronización:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  // Indicador simple (para header)
  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
            isOnline 
              ? 'text-green-700 bg-green-100 hover:bg-green-200' 
              : 'text-orange-700 bg-orange-100 hover:bg-orange-200'
          }`}
          onClick={() => setShowModal(true)}
        >
          {isOnline ? (
            <Wifi size={14} />
          ) : (
            <WifiOff size={14} />
          )}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
          {syncInProgress && <RefreshCw size={12} className="animate-spin" />}
          {offlineStatus?.pendingSync > 0 && (
            <span className="px-1 text-xs text-white bg-orange-500 rounded-full">
              {offlineStatus.pendingSync}
            </span>
          )}
        </div>

        {/* Modal de detalles */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Estado de Conexión</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <OfflineIndicator showDetails={true} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista detallada (para modal o página)
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Estado de conexión */}
      <div className={`flex items-center gap-3 p-4 rounded-lg ${
        isOnline ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
      }`}>
        <div className={`p-2 rounded-full ${
          isOnline ? 'bg-green-100' : 'bg-orange-100'
        }`}>
          {isOnline ? (
            <Wifi size={20} className="text-green-600" />
          ) : (
            <WifiOff size={20} className="text-orange-600" />
          )}
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${
            isOnline ? 'text-green-800' : 'text-orange-800'
          }`}>
            {isOnline ? 'Conectado a Internet' : 'Sin conexión a Internet'}
          </h4>
          <p className={`text-sm ${
            isOnline ? 'text-green-600' : 'text-orange-600'
          }`}>
            {isOnline 
              ? 'Los datos se sincronizan automáticamente'
              : 'Los datos se guardan localmente y se sincronizarán cuando vuelva la conexión'
            }
          </p>
        </div>
        {isOnline && syncInProgress && (
          <RefreshCw size={20} className="text-green-600 animate-spin" />
        )}
      </div>

      {/* Estado de sincronización */}
      {offlineStatus && (
        <div className="p-4 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Estado de Sincronización</h4>
            {isOnline && (
              <button
                onClick={handleForceSync}
                disabled={syncInProgress}
                className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw size={14} className={syncInProgress ? 'animate-spin' : ''} />
                {syncInProgress ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Datos pendientes */}
            <div className="flex items-center gap-2">
              {offlineStatus.pendingSync === 0 ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <AlertCircle size={16} className="text-orange-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Pendientes: {offlineStatus.pendingSync}
                </p>
                <p className="text-xs text-gray-600">
                  {offlineStatus.pendingSync === 0 
                    ? 'Todo sincronizado' 
                    : 'Datos por sincronizar'
                  }
                </p>
              </div>
            </div>

            {/* Estado de progreso */}
            <div className="flex items-center gap-2">
              {syncInProgress ? (
                <RefreshCw size={16} className="text-blue-600 animate-spin" />
              ) : (
                <Database size={16} className="text-gray-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {syncInProgress ? 'Sincronizando' : 'En espera'}
                </p>
                <p className="text-xs text-gray-600">
                  {syncInProgress ? 'Enviando datos...' : 'Listo para sincronizar'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Datos locales */}
      {offlineStatus?.localData && (
        <div className="p-4 rounded-lg bg-blue-50">
          <h4 className="mb-3 font-medium text-gray-900">Datos Almacenados Localmente</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Marcaciones</p>
              <p className="text-gray-600">{offlineStatus.localData.marcaciones || 0}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Órdenes</p>
              <p className="text-gray-600">{offlineStatus.localData.ordenes || 0}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Recordatorios</p>
              <p className="text-gray-600">{offlineStatus.localData.recordatorios || 0}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">En cola</p>
              <p className="text-gray-600">{offlineStatus.localData.syncQueue || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="p-4 rounded-lg bg-gray-50">
        <h4 className="mb-2 font-medium text-gray-900">Funciones Offline</h4>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• Marcar asistencia (ingreso/salida)</li>
          <li>• Ver marcaciones anteriores</li>
          <li>• Consultar órdenes de trabajo</li>
          <li>• Ver recordatorios</li>
          <li>• Navegar por la aplicación</li>
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          Los datos se sincronizarán automáticamente cuando recuperes la conexión.
        </p>
      </div>

      {/* Advertencias */}
      {!isOnline && (
        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-yellow-600" />
            <p className="text-sm font-medium text-yellow-800">Modo Offline Activo</p>
          </div>
          <p className="mt-1 text-xs text-yellow-700">
            Algunas funciones pueden estar limitadas sin conexión a Internet.
          </p>
        </div>
      )}
    </div>
  );
}