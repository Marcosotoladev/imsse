// app/admin/control-asistencia/page.jsx - Página principal del control de asistencia (versión offline) - MOBILE FIXED
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Navigation,
  Clock,
  MapPin,
  Calendar,
  User,
  LogIn,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Trash2,
  X,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';
import offlineApiService from '../../../lib/services/offlineApiService';
import OfflineIndicator from '../../components/OfflineIndicator';

export default function ControlAsistencia() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marcaciones, setMarcaciones] = useState([]);
  const [ultimaMarcacion, setUltimaMarcacion] = useState(null);
  const [estadoActual, setEstadoActual] = useState('fuera'); // 'en_obra' | 'fuera'
  const [marcacionAEliminar, setMarcacionAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);
          
          if (perfilUsuario.rol !== 'tecnico' || perfilUsuario.estado !== 'activo') {
            router.push('/admin/dashboard-tecnico');
            return;
          }

          setUser(currentUser);
          setPerfil(perfilUsuario);
          await cargarMarcaciones();
        } catch (error) {
          console.error('Error al verificar usuario:', error);
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
    });

    // Escuchar cambios de conexión
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [router]);

  const cargarMarcaciones = async () => {
    try {
      setLoading(true);
      
      // Usar servicio offline que maneja online/offline automáticamente
      const response = await offlineApiService.obtenerMarcacionesTecnico(auth.currentUser?.uid);
      
      if (response?.documents) {
        const marcacionesOrdenadas = response.documents
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10);
        
        setMarcaciones(marcacionesOrdenadas);
        setIsOffline(response.offline || false);
        
        if (marcacionesOrdenadas.length > 0) {
          const ultima = marcacionesOrdenadas[0];
          setUltimaMarcacion(ultima);
          setEstadoActual(ultima.tipo === 'ingreso' ? 'en_obra' : 'fuera');
        }
      }
      
    } catch (error) {
      console.error('Error al cargar marcaciones:', error);
      // En caso de error, intentar cargar solo datos locales
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const eliminarMarcacion = async (marcacionId) => {
    try {
      setEliminando(true);
      
      // Usar servicio offline para eliminar
      const result = await offlineApiService.eliminarMarcacion(marcacionId);
      
      if (result.offline) {
        // Mostrar mensaje de que se eliminará cuando haya conexión
        alert(result.message || 'Marcación marcada para eliminar. Se eliminará del servidor cuando haya conexión.');
      }
      
      await cargarMarcaciones(); // Recargar la lista
      setMarcacionAEliminar(null);
      
    } catch (error) {
      console.error('Error al eliminar marcación:', error);
      alert('Error al eliminar la marcación. Inténtalo nuevamente.');
    } finally {
      setEliminando(false);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = new Date(timestamp);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearSoloHora = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = new Date(timestamp);
    return fecha.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTiempoTrabajado = () => {
    if (!marcaciones.length) return '0h 0m';
    
    const hoy = new Date().toDateString();
    const marcacionesHoy = marcaciones.filter(m => 
      new Date(m.timestamp).toDateString() === hoy
    );

    let tiempoTotal = 0;
    let ingresoTemp = null;

    for (const marcacion of marcacionesHoy.reverse()) {
      if (marcacion.tipo === 'ingreso') {
        ingresoTemp = new Date(marcacion.timestamp);
      } else if (marcacion.tipo === 'salida' && ingresoTemp) {
        tiempoTotal += new Date(marcacion.timestamp) - ingresoTemp;
        ingresoTemp = null;
      }
    }

    // Si hay un ingreso sin salida, contar hasta ahora
    if (ingresoTemp) {
      tiempoTotal += new Date() - ingresoTemp;
    }

    const horas = Math.floor(tiempoTotal / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoTotal % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando control de asistencia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white shadow bg-primary">
        <div className="px-4 py-3 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <Link
                href="/admin/dashboard-tecnico"
                className="flex items-center flex-shrink-0 p-2 mr-4 text-white rounded-md hover:bg-red-700"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg font-bold md:text-xl font-montserrat">Control de Asistencia</h1>
                <p className="text-xs text-red-100 md:text-sm">Gestión de marcaciones</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Indicador de conexión */}
              <OfflineIndicator className="text-white" />
              
              <div className="min-w-0 text-right">
                <p className="text-sm font-medium truncate">{perfil?.nombreCompleto}</p>
                <p className="text-xs text-red-100">Técnico</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl px-4 py-6 mx-auto">
        {/* Alerta de modo offline */}
        {isOffline && (
          <div className="p-4 mb-6 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-start gap-2">
              <WifiOff size={20} className="flex-shrink-0 text-orange-600 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium text-orange-800">Modo Offline Activo</p>
                <p className="text-sm text-orange-600">
                  Los datos se guardan localmente y se sincronizarán cuando recuperes la conexión.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estado actual y estadísticas */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3 sm:gap-6">
          {/* Estado actual */}
          <div className={`p-4 sm:p-6 rounded-lg shadow ${
            estadoActual === 'en_obra' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                estadoActual === 'en_obra' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {estadoActual === 'en_obra' ? (
                  <CheckCircle size={24} className="text-green-600" />
                ) : (
                  <AlertTriangle size={24} className="text-gray-600" />
                )}
              </div>
              <div className="min-w-0 ml-3 sm:ml-4">
                <p className="text-sm font-medium text-gray-900">Estado Actual</p>
                <p className={`text-lg font-bold truncate ${
                  estadoActual === 'en_obra' ? 'text-green-800' : 'text-gray-800'
                }`}>
                  {estadoActual === 'en_obra' ? 'En Obra' : 'Fuera de Obra'}
                </p>
              </div>
            </div>
          </div>

          {/* Tiempo trabajado hoy */}
          <div className="p-4 bg-white border border-blue-200 rounded-lg shadow sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg sm:p-3">
                <Clock size={24} className="text-blue-600" />
              </div>
              <div className="min-w-0 ml-3 sm:ml-4">
                <p className="text-sm font-medium text-gray-900">Tiempo Hoy</p>
                <p className="text-lg font-bold text-blue-800">
                  {calcularTiempoTrabajado()}
                </p>
              </div>
            </div>
          </div>

          {/* Total marcaciones */}
          <div className="p-4 bg-white border border-purple-200 rounded-lg shadow sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg sm:p-3">
                <User size={24} className="text-purple-600" />
              </div>
              <div className="min-w-0 ml-3 sm:ml-4">
                <p className="text-sm font-medium text-gray-900">Total Marcaciones</p>
                <p className="text-lg font-bold text-purple-800">
                  {marcaciones.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón principal de marcación */}
        <div className="mb-8">
          <Link
            href="/admin/control-asistencia/marcar"
            className="block p-6 transition-all bg-white border-2 border-green-200 rounded-lg shadow sm:p-8 hover:border-green-400 hover:bg-green-50"
          >
            <div className="text-center">
              <Navigation size={48} className="mx-auto mb-4 text-green-600" />
              <h3 className="mb-2 text-xl font-bold text-green-800 sm:text-2xl">Marcar Asistencia</h3>
              <p className="text-green-600">
                {estadoActual === 'en_obra' 
                  ? 'Registrar salida de obra' 
                  : 'Registrar ingreso a obra'
                }
              </p>
              {isOffline && (
                <p className="mt-2 text-sm text-orange-600">
                  Funciona sin conexión
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* Historial de marcaciones */}
        <div className="p-4 bg-white rounded-lg shadow sm:p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 sm:mb-6">Últimas Marcaciones</h3>
          
          {marcaciones.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No hay marcaciones registradas</p>
              <p className="text-sm text-gray-400">Presiona "Marcar Asistencia" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {marcaciones.map((marcacion, index) => (
                <div
                  key={marcacion.id || index}
                  className={`flex items-center p-3 sm:p-4 rounded-lg border ${
                    marcacion.tipo === 'ingreso'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  } ${marcacion.isPending ? 'border-dashed border-orange-300 bg-orange-50' : ''}`}
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    marcacion.tipo === 'ingreso'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}>
                    {marcacion.tipo === 'ingreso' ? (
                      <LogIn size={18} className="text-green-600 sm:w-5 sm:h-5" />
                    ) : (
                      <LogOut size={18} className="text-red-600 sm:w-5 sm:h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 ml-3 sm:ml-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className={`font-medium text-sm sm:text-base ${
                            marcacion.tipo === 'ingreso' ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {marcacion.tipo === 'ingreso' ? 'Ingreso' : 'Salida'}
                          </p>
                          {marcacion.isPending && (
                            <span className="px-2 py-1 text-xs font-medium text-orange-800 bg-orange-200 rounded-full">
                              Pendiente
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate sm:text-sm">
                          {formatearFecha(marcacion.timestamp)}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between gap-3 sm:gap-4 sm:justify-end">
                        <div className="text-right">
                          <div className="flex items-center text-xs text-gray-500 sm:text-sm">
                            <MapPin size={12} className="mr-1 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                            <span className="hidden sm:inline">GPS</span>
                            {marcacion.isPending && (
                              <AlertCircle size={10} className="ml-1 text-orange-500 sm:w-3 sm:h-3" />
                            )}
                          </div>
                          <p className="text-base font-bold text-gray-800 sm:text-lg">
                            {formatearSoloHora(marcacion.timestamp)}
                          </p>
                        </div>
                        
                        {/* Botón eliminar */}
                        <button
                          onClick={() => setMarcacionAEliminar(marcacion)}
                          className="flex-shrink-0 p-1.5 sm:p-2 text-red-600 transition-colors rounded-lg hover:bg-red-100"
                          title="Eliminar marcación"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 mt-8 text-center bg-white rounded-lg shadow sm:p-6">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Sistema de Control de Asistencia - v1.0</p>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {marcacionAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-xl sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
              <button
                onClick={() => setMarcacionAEliminar(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar esta marcación?
              </p>
              <div className="p-3 mt-4 rounded-lg bg-gray-50">
                <p className="font-medium">
                  {marcacionAEliminar.tipo === 'ingreso' ? 'Ingreso' : 'Salida'}
                  {marcacionAEliminar.isPending && (
                    <span className="ml-2 text-sm text-orange-600">(Pendiente)</span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {formatearFecha(marcacionAEliminar.timestamp)}
                </p>
              </div>
              
              {isOffline && !marcacionAEliminar.isPending && (
                <div className="p-3 mt-3 border border-orange-200 rounded-lg bg-orange-50">
                  <p className="text-sm text-orange-700">
                    Sin conexión: Se marcará para eliminar y se eliminará del servidor cuando vuelva la conexión.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setMarcacionAEliminar(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarMarcacion(marcacionAEliminar.id)}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={eliminando}
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}