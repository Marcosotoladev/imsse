// app/admin/control-asistencia/marcar/page.jsx - Versión offline con eliminar marcaciones - MOBILE FIXED
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  LogIn,
  LogOut,
  MapPin,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Loader,
  Trash2,
  X,
  WifiOff,
  Wifi
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';
import offlineApiService from '../../../../lib/services/offLineApiService';
import OfflineIndicator from '../../../components/OfflineIndicator';

export default function MarcarAsistencia() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [ubicacion, setUbicacion] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [marcaciones, setMarcaciones] = useState([]);
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
          
          await cargarMarcaciones(currentUser.uid);
          await obtenerUbicacion();
          
        } catch (error) {
          console.error('Error al verificar usuario:', error);
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
      setLoading(false);
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

  const cargarMarcaciones = async (tecnicoId) => {
    try {
      // Usar servicio offline que maneja online/offline automáticamente
      const response = await offlineApiService.obtenerMarcacionesTecnico(tecnicoId, { limit: 10 });
      
      if (response?.documents) {
        setMarcaciones(response.documents);
        setIsOffline(response.offline || false);
      } else {
        setMarcaciones([]);
      }
      
    } catch (error) {
      console.error('Error al cargar marcaciones:', error);
      setIsOffline(true);
      if (!error.message.includes('404') && !error.message.includes('No documents found')) {
        setMensaje({
          tipo: 'error',
          texto: 'Error al cargar historial de marcaciones'
        });
      }
      setMarcaciones([]);
    }
  };

  const obtenerUbicacion = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setMensaje({
          tipo: 'error',
          texto: 'Tu dispositivo no soporta geolocalización'
        });
        resolve();
        return;
      }

      setMensaje({
        tipo: 'info',
        texto: 'Obteniendo tu ubicación...'
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacion({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            precision: position.coords.accuracy
          });
          setMensaje({
            tipo: 'success',
            texto: 'Ubicación obtenida correctamente'
          });
          resolve();
        },
        (error) => {
          console.error('Error de geolocalización:', error);
          setMensaje({
            tipo: 'error',
            texto: 'No se pudo obtener la ubicación. Permite el acceso en tu navegador.'
          });
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const marcarAsistencia = async (tipo) => {
    if (!ubicacion) {
      setMensaje({
        tipo: 'error',
        texto: 'Necesitamos tu ubicación para registrar la marcación'
      });
      return;
    }

    try {
      setLoadingAction(true);
      setMensaje({
        tipo: 'info',
        texto: `Registrando ${tipo}...`
      });

      const marcacionData = {
        tecnicoId: user.uid,
        tecnicoNombre: perfil?.nombreCompleto || user.email,
        tipo: tipo,
        timestamp: new Date().toISOString(),
        coordenadas: {
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud
        },
        precision: ubicacion.precision,
        fechaCreacion: new Date().toISOString()
      };

      // Usar servicio offline para crear marcación
      const result = await offlineApiService.crearMarcacion(marcacionData);

      if (result.offline) {
        setMensaje({
          tipo: 'success',
          texto: `${tipo === 'ingreso' ? 'Ingreso' : 'Salida'} guardado offline. Se sincronizará cuando haya conexión.`
        });
        setIsOffline(true);
      } else {
        setMensaje({
          tipo: 'success',
          texto: `${tipo === 'ingreso' ? 'Ingreso' : 'Salida'} registrado correctamente`
        });
      }

      await cargarMarcaciones(user.uid);

    } catch (error) {
      console.error('Error al marcar asistencia:', error);
      setMensaje({
        tipo: 'error',
        texto: error.message || 'Error al registrar. Inténtalo nuevamente.'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const eliminarMarcacion = async (marcacionId) => {
    try {
      setEliminando(true);
      
      // Usar servicio offline para eliminar
      const result = await offlineApiService.eliminarMarcacion(marcacionId);
      
      if (result.offline) {
        setMensaje({
          tipo: 'success',
          texto: result.message || 'Marcación marcada para eliminar. Se eliminará del servidor cuando haya conexión.'
        });
      } else {
        setMensaje({
          tipo: 'success',
          texto: 'Marcación eliminada correctamente'
        });
      }
      
      await cargarMarcaciones(user.uid);
      setMarcacionAEliminar(null);
      
    } catch (error) {
      console.error('Error al eliminar marcación:', error);
      setMensaje({
        tipo: 'error',
        texto: 'Error al eliminar la marcación. Inténtalo nuevamente.'
      });
    } finally {
      setEliminando(false);
    }
  };

  const ultimaMarcacion = marcaciones.length > 0 ? marcaciones[0] : null;
  const puedeMarcarIngreso = !ultimaMarcacion || ultimaMarcacion.tipo === 'salida';
  const puedeMarcarSalida = ultimaMarcacion && ultimaMarcacion.tipo === 'ingreso';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando sistema de marcación...</p>
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
                href="/admin/control-asistencia"
                className="flex items-center flex-shrink-0 p-2 mr-4 text-white rounded-md hover:bg-red-700"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg font-bold md:text-xl font-montserrat">Control de Asistencia</h1>
                <p className="text-xs text-red-100 md:text-sm">Marcar Ingreso/Salida</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Indicador de conexión */}
              <OfflineIndicator className="text-white" />
              
              <div className="min-w-0 text-right">
                <p className="text-sm font-medium truncate">{perfil?.nombreCompleto || user?.email}</p>
                <p className="text-xs text-red-100">Técnico</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl px-4 py-6 mx-auto">
        {/* Alerta de modo offline */}
        {isOffline && (
          <div className="p-4 mb-6 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-start gap-2">
              <WifiOff size={20} className="flex-shrink-0 text-orange-600 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium text-orange-800">Modo Offline Activo</p>
                <p className="text-sm text-orange-600">
                  Las marcaciones se guardan localmente y se sincronizarán cuando vuelva la conexión.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de estado */}
        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-lg flex items-start ${
            mensaje.tipo === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            mensaje.tipo === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex-shrink-0">
              {mensaje.tipo === 'success' && <CheckCircle size={20} className="mr-2" />}
              {mensaje.tipo === 'error' && <AlertCircle size={20} className="mr-2" />}
              {mensaje.tipo === 'info' && <Loader size={20} className="mr-2 animate-spin" />}
            </div>
            <div className="min-w-0">
              {mensaje.texto}
            </div>
          </div>
        )}

        {/* Estado actual */}
        <div className="p-4 mb-8 bg-white rounded-lg shadow sm:p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Estado Actual</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center p-3 rounded-lg bg-gray-50 sm:p-4">
              <User size={20} className="flex-shrink-0 mr-3 text-blue-600 sm:w-6 sm:h-6" />
              <div className="min-w-0">
                <p className="text-sm text-gray-600">Técnico</p>
                <p className="font-medium truncate">{perfil?.nombreCompleto || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-gray-50 sm:p-4">
              <Clock size={20} className="flex-shrink-0 mr-3 text-green-600 sm:w-6 sm:h-6" />
              <div className="min-w-0">
                <p className="text-sm text-gray-600">Última marcación</p>
                <p className="font-medium">
                  {ultimaMarcacion ? 
                    `${ultimaMarcacion.tipo === 'ingreso' ? 'Ingreso' : 'Salida'} - ${new Date(ultimaMarcacion.timestamp).toLocaleString()}` :
                    'Sin marcaciones'
                  }
                </p>
                {ultimaMarcacion?.isPending && (
                  <span className="text-xs text-orange-600">(Pendiente de sincronizar)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información de ubicación */}
        <div className="p-4 mb-8 bg-white rounded-lg shadow sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Información de Ubicación</h3>
          <div className="flex items-center p-3 rounded-lg bg-gray-50 sm:p-4">
            <MapPin size={20} className="flex-shrink-0 mr-3 text-red-600 sm:w-6 sm:h-6" />
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Estado de GPS</p>
              <p className="font-medium">
                {ubicacion ? 
                  `Ubicación obtenida (±${Math.round(ubicacion.precision)}m)` :
                  'Obteniendo ubicación...'
                }
              </p>
              {isOffline && ubicacion && (
                <p className="text-xs text-orange-600">Funciona sin conexión</p>
              )}
            </div>
          </div>
        </div>

        {/* Botones de marcación */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
          {/* Botón Marcar Ingreso */}
          <button
            onClick={() => marcarAsistencia('ingreso')}
            disabled={!puedeMarcarIngreso || !ubicacion || loadingAction}
            className={`p-6 sm:p-8 rounded-lg border-2 transition-all ${
              puedeMarcarIngreso && ubicacion && !loadingAction
                ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-400 text-green-800'
                : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              {loadingAction && !puedeMarcarSalida ? (
                <Loader size={40} className="mx-auto mb-4 animate-spin sm:w-12 sm:h-12" />
              ) : (
                <LogIn size={40} className="mx-auto mb-4 sm:w-12 sm:h-12" />
              )}
              <h3 className="mb-2 text-xl font-bold sm:text-2xl">Marcar Ingreso</h3>
              <p className="text-sm">
                {loadingAction && !puedeMarcarSalida ? 'Registrando...' :
                 !puedeMarcarIngreso ? 'Ya marcaste ingreso' : 'Registrar llegada a la obra'}
              </p>
              {isOffline && puedeMarcarIngreso && ubicacion && (
                <p className="mt-2 text-xs text-orange-600">Funciona offline</p>
              )}
            </div>
          </button>

          {/* Botón Marcar Salida */}
          <button
            onClick={() => marcarAsistencia('salida')}
            disabled={!puedeMarcarSalida || !ubicacion || loadingAction}
            className={`p-6 sm:p-8 rounded-lg border-2 transition-all ${
              puedeMarcarSalida && ubicacion && !loadingAction
                ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-400 text-red-800'
                : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              {loadingAction && puedeMarcarSalida ? (
                <Loader size={40} className="mx-auto mb-4 animate-spin sm:w-12 sm:h-12" />
              ) : (
                <LogOut size={40} className="mx-auto mb-4 sm:w-12 sm:h-12" />
              )}
              <h3 className="mb-2 text-xl font-bold sm:text-2xl">Marcar Salida</h3>
              <p className="text-sm">
                {loadingAction && puedeMarcarSalida ? 'Registrando...' :
                 !puedeMarcarSalida ? 'Primero marca ingreso' : 'Registrar salida de la obra'}
              </p>
              {isOffline && puedeMarcarSalida && ubicacion && (
                <p className="mt-2 text-xs text-orange-600">Funciona offline</p>
              )}
            </div>
          </button>
        </div>

        {/* Historial de marcaciones */}
        {marcaciones.length > 0 && (
          <div className="p-4 mt-8 bg-white rounded-lg shadow sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Últimas Marcaciones</h3>
            
            {/* Vista móvil - Cards */}
            <div className="block space-y-3 sm:hidden">
              {marcaciones.map((marcacion) => (
                <div
                  key={marcacion.id}
                  className={`p-3 rounded-lg border ${
                    marcacion.tipo === 'ingreso'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  } ${marcacion.isPending ? 'border-dashed border-orange-300 bg-orange-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center min-w-0">
                      {marcacion.tipo === 'ingreso' ? (
                        <LogIn size={16} className="flex-shrink-0 mr-2 text-green-600" />
                      ) : (
                        <LogOut size={16} className="flex-shrink-0 mr-2 text-red-600" />
                      )}
                      <div className="flex flex-wrap items-center min-w-0 gap-2">
                        <span className="font-medium">
                          {marcacion.tipo === 'ingreso' ? 'Ingreso' : 'Salida'}
                        </span>
                        {marcacion.isPending && (
                          <span className="px-1 py-0.5 text-xs font-medium text-orange-800 bg-orange-200 rounded">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setMarcacionAEliminar(marcacion)}
                      className="flex-shrink-0 p-1 text-red-600 transition-colors rounded hover:bg-red-100"
                      title="Eliminar marcación"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(marcacion.timestamp).toLocaleString('es-AR')}
                  </p>
                </div>
              ))}
            </div>

            {/* Vista desktop - Lista mejorada */}
            <div className="hidden sm:block">
              <div className="space-y-2">
                {marcaciones.map((marcacion) => (
                  <div
                    key={marcacion.id}
                    className={`flex items-center justify-between p-3 rounded border ${
                      marcacion.tipo === 'ingreso'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    } ${marcacion.isPending ? 'border-dashed border-orange-300 bg-orange-50' : ''}`}
                  >
                    <div className="flex items-center min-w-0">
                      {marcacion.tipo === 'ingreso' ? (
                        <LogIn size={16} className="flex-shrink-0 mr-2 text-green-600" />
                      ) : (
                        <LogOut size={16} className="flex-shrink-0 mr-2 text-red-600" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium whitespace-nowrap">
                            {marcacion.tipo === 'ingreso' ? 'Ingreso' : 'Salida'}
                          </span>
                          {marcacion.isPending && (
                            <span className="px-1 py-0.5 text-xs font-medium text-orange-800 bg-orange-200 rounded whitespace-nowrap">
                              Pendiente
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {new Date(marcacion.timestamp).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setMarcacionAEliminar(marcacion)}
                      className="flex-shrink-0 p-1 ml-4 text-red-600 transition-colors rounded hover:bg-red-100"
                      title="Eliminar marcación"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 mt-8 text-center bg-white rounded-lg shadow sm:p-6">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Sistema de Control de Asistencia</p>
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
                  {new Date(marcacionAEliminar.timestamp).toLocaleString('es-AR')}
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
};