// app/admin/control-asistencia/admin/page.jsx - Panel administrador offline con eliminar marcaciones - MOBILE FIXED
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Map,
  List,
  Filter,
  Download,
  User,
  Calendar,
  Clock,
  MapPin,
  LogIn,
  LogOut,
  RefreshCw,
  Trash2,
  X,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';
import offlineApiService from '../../../../lib/services/offlineApiService';
import OfflineIndicator from '../../../components/OfflineIndicator';

// Importar mapa dinámicamente para evitar problemas de SSR
const MapaMarcaciones = dynamic(() => import('../../../components/MapaMarcaciones'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg h-96">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-2 border-b-2 rounded-full animate-spin border-primary"></div>
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  )
});

export default function PanelAdminMarcaciones() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marcaciones, setMarcaciones] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [vista, setVista] = useState('mapa'); // 'mapa' | 'lista'
  const [filtros, setFiltros] = useState({
    tecnico: '',
    fecha: '',
    tipo: ''
  });
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    enObra: 0,
    fueraObra: 0
  });
  const [marcacionAEliminar, setMarcacionAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);
          
          if (perfilUsuario.rol !== 'admin') {
            router.push('/admin/dashboard-tecnico');
            return;
          }

          setUser(currentUser);
          setPerfil(perfilUsuario);
          
          await Promise.all([
            cargarMarcaciones(),
            cargarTecnicos()
          ]);
          
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
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-sincronizar cuando vuelve la conexión
      sincronizarDatos();
    };
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
      // Los administradores generalmente trabajan online, pero pueden ver datos en cache
      const response = await apiService.obtenerMarcaciones(filtros);
      
      if (response?.documents) {
        setMarcaciones(response.documents);
        calcularEstadisticas(response.documents);
        setIsOffline(false);
      }
    } catch (error) {
      console.error('Error al cargar marcaciones:', error);
      setIsOffline(true);
      // En caso de error, podrías cargar datos locales si fuera necesario
    }
  };

  const cargarTecnicos = async () => {
    try {
      const response = await apiService.obtenerUsuarios({ rol: 'tecnico', estado: 'activo' });
      
      if (response?.documents || response?.users) {
        setTecnicos(response.documents || response.users || []);
      }
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
    }
  };

  const calcularEstadisticas = (marcacionesData) => {
    const total = marcacionesData.length;
    
    // Agrupar por técnico y obtener última marcación
    const tecnicosEstado = {};
    
    marcacionesData.forEach(marcacion => {
      const tecnicoId = marcacion.tecnicoId;
      if (!tecnicosEstado[tecnicoId] || 
          new Date(marcacion.timestamp) > new Date(tecnicosEstado[tecnicoId].timestamp)) {
        tecnicosEstado[tecnicoId] = marcacion;
      }
    });
    
    const enObra = Object.values(tecnicosEstado).filter(m => m.tipo === 'ingreso').length;
    const fueraObra = Object.keys(tecnicosEstado).length - enObra;
    
    setEstadisticas({ total, enObra, fueraObra });
  };

  const aplicarFiltros = async () => {
    await cargarMarcaciones();
  };

  const eliminarMarcacion = async (marcacionId) => {
    try {
      setEliminando(true);
      
      // Los admins pueden usar el servicio offline también
      const result = await offlineApiService.eliminarMarcacion(marcacionId);
      
      if (result.offline) {
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

  const sincronizarDatos = async () => {
    if (isOffline) return;
    
    try {
      setSincronizando(true);
      await offlineApiService.forcSync();
      await cargarMarcaciones(); // Recargar después de sincronizar
    } catch (error) {
      console.error('Error al sincronizar:', error);
    } finally {
      setSincronizando(false);
    }
  };

  const exportarDatos = () => {
    const csvContent = [
      ['Técnico', 'Tipo', 'Fecha', 'Hora', 'Latitud', 'Longitud', 'Estado'],
      ...marcaciones.map(m => [
        m.tecnicoNombre,
        m.tipo,
        new Date(m.timestamp).toLocaleDateString('es-AR'),
        new Date(m.timestamp).toLocaleTimeString('es-AR'),
        m.coordenadas?.latitud || 'N/A',
        m.coordenadas?.longitud || 'N/A',
        m.isPending ? 'Pendiente' : 'Sincronizado'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marcaciones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatearFecha = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
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
                <h1 className="text-lg font-bold md:text-xl font-montserrat">Panel Administrador</h1>
                <p className="text-xs text-red-100 md:text-sm">Control de Asistencia</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Indicador de conexión */}
              <OfflineIndicator className="text-white" />
              
              <div className="min-w-0 text-right">
                <p className="text-sm font-medium truncate">{perfil?.nombreCompleto}</p>
                <p className="text-xs text-red-100">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 mx-auto max-w-7xl">
        {/* Alerta de modo offline */}
        {isOffline && (
          <div className="p-4 mb-6 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-start gap-2">
              <WifiOff size={20} className="flex-shrink-0 text-orange-600 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium text-orange-800">Sin Conexión</p>
                <p className="text-sm text-orange-600">
                  Mostrando datos almacenados. Algunas funciones pueden estar limitadas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3 sm:gap-6">
          <div className="p-4 bg-white border border-blue-200 rounded-lg shadow sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg sm:p-3">
                <User size={20} className="text-blue-600 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 ml-3 sm:ml-4">
                <p className="text-sm font-medium text-gray-900">Total Marcaciones</p>
                <p className="text-2xl font-bold text-blue-800 sm:text-3xl">{estadisticas.total}</p>
                {isOffline && (
                  <p className="text-xs text-orange-600">Datos locales</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-green-200 rounded-lg shadow sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg sm:p-3">
                <LogIn size={20} className="text-green-600 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 ml-3 sm:ml-4">
                <p className="text-sm font-medium text-gray-900">Técnicos en Obra</p>
                <p className="text-2xl font-bold text-green-800 sm:text-3xl">{estadisticas.enObra}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-red-200 rounded-lg shadow sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg sm:p-3">
                <LogOut size={20} className="text-red-600 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 ml-3 sm:ml-4">
                <p className="text-sm font-medium text-gray-900">Técnicos Fuera</p>
                <p className="text-2xl font-bold text-red-800 sm:text-3xl">{estadisticas.fueraObra}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="p-4 mb-8 bg-white rounded-lg shadow sm:p-6">
          <div className="space-y-4">
            {/* Filtros - Stack en móvil */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4">
              <select
                value={filtros.tecnico}
                onChange={(e) => setFiltros({...filtros, tecnico: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary sm:w-auto"
                disabled={isOffline}
              >
                <option value="">Todos los técnicos</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico.id || tecnico.uid} value={tecnico.id || tecnico.uid}>
                    {tecnico.nombreCompleto || tecnico.email}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={filtros.fecha}
                onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary sm:w-auto"
                disabled={isOffline}
              />

              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary sm:w-auto"
                disabled={isOffline}
              >
                <option value="">Todos los tipos</option>
                <option value="ingreso">Solo ingresos</option>
                <option value="salida">Solo salidas</option>
              </select>

              <button
                onClick={aplicarFiltros}
                disabled={isOffline}
                className="flex items-center justify-center w-full px-4 py-2 text-white rounded-md sm:w-auto bg-primary hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Filter size={16} className="mr-2" />
                Filtrar
              </button>
            </div>

            {/* Controles de vista - Stack en móvil */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setVista('mapa')}
                  className={`flex-1 sm:flex-none flex items-center justify-center px-3 py-2 text-sm ${
                    vista === 'mapa' 
                      ? 'bg-primary text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Map size={16} className="mr-1" />
                  Mapa
                </button>
                <button
                  onClick={() => setVista('lista')}
                  className={`flex-1 sm:flex-none flex items-center justify-center px-3 py-2 text-sm ${
                    vista === 'lista' 
                      ? 'bg-primary text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List size={16} className="mr-1" />
                  Lista
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exportarDatos}
                  className="flex items-center justify-center flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md sm:flex-none hover:bg-gray-50"
                >
                  <Download size={16} className="mr-2" />
                  <span className="hidden sm:inline">Exportar</span>
                  <span className="sm:hidden">CSV</span>
                </button>

                <button
                  onClick={isOffline ? cargarMarcaciones : sincronizarDatos}
                  disabled={sincronizando}
                  className="flex items-center justify-center flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md sm:flex-none hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={`mr-2 ${sincronizando ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">
                    {sincronizando ? 'Sincronizando...' : isOffline ? 'Actualizar' : 'Sincronizar'}
                  </span>
                  <span className="sm:hidden">Sync</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        {vista === 'mapa' ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Mapa de Marcaciones</h3>
              <p className="text-sm text-gray-600">
                Verde: Ingresos | Rojo: Salidas | Total: {marcaciones.length} marcaciones
                {isOffline && <span className="text-orange-600"> (Datos locales)</span>}
              </p>
            </div>
            <div className="p-2 sm:p-4">
              <MapaMarcaciones marcaciones={marcaciones} />
            </div>
          </div>
        ) : (
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lista de Marcaciones</h3>
              {isOffline && (
                <p className="text-sm text-orange-600">Mostrando datos almacenados localmente</p>
              )}
            </div>
            
            {/* Contenedor con scroll horizontal y límites de ancho */}
            <div className="w-full">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="min-w-full">
                  <table className="w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-40 px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap sm:px-6">
                          Técnico
                        </th>
                        <th className="w-24 px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap sm:px-6">
                          Tipo
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap sm:px-6 w-44">
                          Fecha y Hora
                        </th>
                        <th className="w-32 px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap sm:px-6">
                          Ubicación
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap sm:px-6 w-28">
                          Estado
                        </th>
                        <th className="w-20 px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase whitespace-nowrap sm:px-6">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marcaciones.map((marcacion) => (
                        <tr key={marcacion.id} className={`hover:bg-gray-50 ${marcacion.isPending ? 'bg-orange-50' : ''}`}>
                          <td className="w-40 px-3 py-4 whitespace-nowrap sm:px-6">
                            <div className="flex items-center">
                              <User size={16} className="flex-shrink-0 mr-2 text-gray-400" />
                              <div className="min-w-0">
                                <span className="block text-sm font-medium text-gray-900 truncate" title={marcacion.tecnicoNombre}>
                                  {marcacion.tecnicoNombre}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="w-24 px-3 py-4 whitespace-nowrap sm:px-6">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              marcacion.tipo === 'ingreso'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {marcacion.tipo === 'ingreso' ? (
                                <LogIn size={12} className="flex-shrink-0 mr-1" />
                              ) : (
                                <LogOut size={12} className="flex-shrink-0 mr-1" />
                              )}
                              <span className="hidden sm:inline">{marcacion.tipo}</span>
                              <span className="sm:hidden">{marcacion.tipo === 'ingreso' ? 'In' : 'Out'}</span>
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap sm:px-6 w-44">
                            <div className="flex items-center text-sm text-gray-900">
                              <Clock size={14} className="flex-shrink-0 mr-2 text-gray-400" />
                              <div className="min-w-0">
                                <div className="text-xs font-medium">
                                  {new Date(marcacion.timestamp).toLocaleDateString('es-AR')}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(marcacion.timestamp).toLocaleTimeString('es-AR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="w-32 px-3 py-4 whitespace-nowrap sm:px-6">
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin size={14} className="flex-shrink-0 mr-2 text-gray-400" />
                              <div className="min-w-0">
                                <div className="text-xs truncate">
                                  {marcacion.coordenadas?.latitud?.toFixed(2) || 'N/A'}
                                </div>
                                <div className="text-xs truncate">
                                  {marcacion.coordenadas?.longitud?.toFixed(2) || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap sm:px-6 w-28">
                            {marcacion.isPending ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full whitespace-nowrap">
                                <AlertCircle size={10} className="flex-shrink-0 mr-1" />
                                <span className="hidden sm:inline">Pendiente</span>
                                <span className="sm:hidden">Pend</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full whitespace-nowrap">
                                <span className="hidden sm:inline">Sincronizado</span>
                                <span className="sm:hidden">OK</span>
                              </span>
                            )}
                          </td>
                          <td className="w-20 px-3 py-4 whitespace-nowrap sm:px-6">
                            <button
                              onClick={() => setMarcacionAEliminar(marcacion)}
                              className="p-1.5 sm:p-2 text-red-600 transition-colors rounded-lg hover:bg-red-100"
                              title="Eliminar marcación"
                            >
                              <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {marcaciones.length === 0 && (
                    <div className="py-12 text-center">
                      <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">No hay marcaciones que mostrar</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Indicador de scroll en móvil */}
              <div className="block px-4 py-2 text-xs text-center text-gray-500 border-t sm:hidden bg-gray-50">
                👆 Desliza horizontalmente para ver más columnas
              </div>
            </div>
          </div>
        )}
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
                  <strong>Técnico:</strong> {marcacionAEliminar.tecnicoNombre}
                </p>
                <p className="font-medium">
                  <strong>Tipo:</strong> {marcacionAEliminar.tipo === 'ingreso' ? 'Ingreso' : 'Salida'}
                  {marcacionAEliminar.isPending && (
                    <span className="ml-2 text-sm text-orange-600">(Pendiente)</span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong> {formatearFecha(marcacionAEliminar.timestamp)}
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