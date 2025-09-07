// app/admin/ordenes/page.jsx - Lista de Órdenes de Trabajo IMSSE (versión offline)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LogOut,
  FilePlus,
  Eye,
  Edit,
  Trash2,
  Search,
  Download,
  Calendar,
  User,
  Shield,
  Clock,
  MapPin,
  WifiOff,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';
import offlineApiService from '../../../lib/services/offlineApiService';
import OfflineIndicator from '../../components/OfflineIndicator';

export default function ListaOrdenesTrabajo() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesFiltradas, setOrdenesFiltradas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [descargando, setDescargando] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    esteMes: 0,
    estaSemana: 0,
    completadas: 0
  });

  // Función para formatear fechas
  const formatDate = (fecha) => {
    if (!fecha) return '';
    try {
      const dateObj = fecha.toDate ? fecha.toDate() : new Date(fecha);
      return dateObj.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return fecha.toString();
    }
  };

  // Función para formatear hora
  const formatTime = (time) => {
    if (!time) return '';
    return time;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarOrdenes();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    // Escuchar cambios de conexión
    const handleOnline = () => {
      setIsOffline(false);
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

  const cargarOrdenes = async () => {
    try {
      // Intentar cargar desde el servidor primero
      let response;
      try {
        response = await apiService.obtenerOrdenesTrabajo();
        setIsOffline(false);
      } catch (error) {
        // Si falla, intentar desde cache offline
        console.log('Error online, cargando desde cache offline:', error);
        response = await offlineApiService.obtenerOrdenesTecnico();
        setIsOffline(true);
      }

      const ordenesData = response.documents || response.ordenes || response || [];
      setOrdenes(ordenesData);
      setOrdenesFiltradas(ordenesData);
      calcularEstadisticas(ordenesData);
    } catch (error) {
      console.error('Error al cargar órdenes de trabajo IMSSE:', error);
      setIsOffline(true);
      // Mostrar mensaje pero no bloquear la interfaz
    }
  };

  const sincronizarDatos = async () => {
    if (isOffline) return;
    
    try {
      setSincronizando(true);
      await offlineApiService.forcSync();
      await cargarOrdenes();
    } catch (error) {
      console.error('Error al sincronizar:', error);
    } finally {
      setSincronizando(false);
    }
  };

  const calcularEstadisticas = (ordenesData) => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioSemana = new Date(hoy.getTime() - (hoy.getDay() * 24 * 60 * 60 * 1000));

    const estadisticas = {
      total: ordenesData.length,
      esteMes: 0,
      estaSemana: 0,
      completadas: ordenesData.filter(orden => orden.firmas?.tecnico?.firma && orden.firmas?.cliente?.firma).length
    };

    // Calcular estadísticas temporales
    ordenesData.forEach(orden => {
      const fechaOrden = orden.fechaCreacion?.toDate ? orden.fechaCreacion.toDate() : new Date(orden.fechaTrabajo);
      if (fechaOrden >= inicioMes) {
        estadisticas.esteMes++;
      }
      if (fechaOrden >= inicioSemana) {
        estadisticas.estaSemana++;
      }
    });

    setEstadisticas(estadisticas);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleEliminarOrden = async (id, numero) => {
    if (confirm(`¿Está seguro de que desea eliminar la orden de trabajo ${numero}?`)) {
      try {
        if (isOffline) {
          // En modo offline, marcar para eliminar después
          await offlineApiService.eliminarOrden(id);
          alert('Orden marcada para eliminar. Se eliminará del servidor cuando haya conexión.');
        } else {
          await apiService.eliminarOrdenTrabajo(id);
          alert('Orden de trabajo eliminada exitosamente');
        }
        await cargarOrdenes(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar orden de trabajo:', error);
        alert('Error al eliminar la orden de trabajo');
      }
    }
  };

  const handleDescargarPDF = async (orden) => {
    if (descargando === orden.id) return; // Evitar doble descarga

    setDescargando(orden.id);

    try {
      // Importar dinámicamente react-pdf para generar el PDF
      const { pdf } = await import('@react-pdf/renderer');
      const { default: OrdenTrabajoPDF } = await import('../../components/pdf/OrdenTrabajoPDF');

      // Generar el PDF
      const blob = await pdf(<OrdenTrabajoPDF orden={orden} />).toBlob();

      // Crear URL y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${orden.numero}.pdf`;
      link.click();

      // Limpiar URL
      URL.revokeObjectURL(url);

      // Resetear estado y mostrar confirmación
      setDescargando(null);
      alert(`✅ Orden ${orden.numero} descargada exitosamente`);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      setDescargando(null);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === '') {
      setOrdenesFiltradas(ordenes);
    } else {
      const filtradas = ordenes.filter(orden =>
        orden.numero?.toLowerCase().includes(term.toLowerCase()) ||
        orden.cliente?.empresa?.toLowerCase().includes(term.toLowerCase()) ||
        orden.cliente?.nombre?.toLowerCase().includes(term.toLowerCase()) ||
        orden.tareasRealizadas?.toLowerCase().includes(term.toLowerCase())
      );
      setOrdenesFiltradas(filtradas);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando órdenes de trabajo IMSSE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header IMSSE */}
      <header className="text-white shadow bg-primary">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="flex items-center">
            <img
              src="/logo/imsse-logo.png"
              alt="IMSSE Logo"
              className="w-8 h-8 mr-3"
            />
            <h1 className="text-xl font-bold font-montserrat">IMSSE - Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Indicador de conexión */}
            <OfflineIndicator className="text-white" />
            
            <span className="hidden md:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-red-700"
            >
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center">
            <Link
              href="/admin/panel-control"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              <Home size={16} className="mr-1" /> Panel de Control
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Órdenes de Trabajo</span>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        {/* Alerta de modo offline */}
        {isOffline && (
          <div className="p-4 mb-6 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center gap-2">
              <WifiOff size={20} className="text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">Modo Offline</p>
                <p className="text-sm text-orange-600">
                  Mostrando datos almacenados localmente. Algunas funciones pueden estar limitadas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header de página */}
        <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold font-montserrat text-primary">
              Órdenes de Trabajo IMSSE
            </h2>
            <p className="text-gray-600">
              Gestión de trabajos de sistemas contra incendios
              {isOffline && <span className="text-orange-600"> (Datos locales)</span>}
            </p>
          </div>
          <div className="flex gap-2">
            {!isOffline && (
              <button
                onClick={sincronizarDatos}
                disabled={sincronizando}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={16} className={`mr-2 ${sincronizando ? 'animate-spin' : ''}`} />
                {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            )}
            <Link
              href="/admin/ordenes/nuevo"
              className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
            >
              <FilePlus size={18} className="mr-2" /> 
              Nueva Orden
              {isOffline && <span className="ml-2 text-xs">(Offline)</span>}
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Shield size={24} className="mr-3 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
                {isOffline && <p className="text-xs text-orange-600">Datos locales</p>}
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Calendar size={24} className="mr-3 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.esteMes}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Clock size={24} className="mr-3 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.estaSemana}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <User size={24} className="mr-3 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.completadas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center">
            <Search size={20} className="mr-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, cliente, empresa o descripción..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabla de órdenes */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Lista de Órdenes de Trabajo ({ordenesFiltradas.length})
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Gestión de trabajos de sistemas contra incendios
              {isOffline && <span className="text-orange-600"> - Datos almacenados localmente</span>}
            </p>
          </div>

          {ordenesFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <Shield size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {searchTerm ? 'No se encontraron órdenes' : 'No hay órdenes de trabajo'}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Intenta con otros términos de búsqueda'
                  : isOffline 
                    ? 'No hay órdenes almacenadas localmente'
                    : 'Comienza creando tu primera orden de trabajo IMSSE'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/admin/ordenes/nuevo"
                  className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                >
                  <FilePlus size={18} className="mr-2" /> 
                  Crear {isOffline ? 'Orden (Offline)' : 'Primera Orden'}
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="table-scroll-container">
                <div className="table-wrapper">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                          Número
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                          Fecha Trabajo
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                          Cliente
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                          Técnicos
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                          Estado
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase sm:px-6">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ordenesFiltradas.map((orden, index) => (
                        <tr
                          key={orden.id}
                          className={`${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} ${orden.isPending ? 'border-l-4 border-orange-400' : ''}`}
                        >
                          <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{orden.numero}</div>
                                <div className="text-xs text-gray-500">
                                  Creada: {formatDate(orden.fechaCreacion)}
                                </div>
                                {orden.isPending && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                                    <AlertCircle size={10} className="mr-1" />
                                    Pendiente
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                            <div className="text-sm text-gray-900">{formatDate(orden.fechaTrabajo)}</div>
                            <div className="text-xs text-gray-500">
                              {formatTime(orden.horarioInicio)} - {formatTime(orden.horarioFin)}
                            </div>
                          </td>
                          <td className="px-3 py-4 sm:px-6">
                            <div className="text-sm font-medium text-gray-900">
                              {orden.cliente?.empresa || 'Sin empresa'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {orden.cliente?.nombre || 'Sin contacto'}
                            </div>
                            {orden.cliente?.direccion && (
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <MapPin size={12} className="mr-1" />
                                {orden.cliente.direccion.length > 30
                                  ? `${orden.cliente.direccion.substring(0, 30)}...`
                                  : orden.cliente.direccion
                                }
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-4 sm:px-6">
                            <div className="text-sm text-gray-900">
                              {orden.tecnicos?.length > 0 ? (
                                <div>
                                  {orden.tecnicos.slice(0, 2).map((tecnico, idx) => (
                                    <div key={idx} className="text-xs text-gray-600">
                                      • {tecnico.nombre}
                                    </div>
                                  ))}
                                  {orden.tecnicos.length > 2 && (
                                    <div className="text-xs text-gray-400">
                                      +{orden.tecnicos.length - 2} más
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Sin técnicos</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                            <div className="flex flex-col space-y-1">
                              {/* Estado de firmas */}
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${orden.firmas?.tecnico?.firma ? 'bg-green-500' : 'bg-gray-300'
                                  }`}></div>
                                <span className="text-xs text-gray-600">Técnico</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${orden.firmas?.cliente?.firma ? 'bg-green-500' : 'bg-gray-300'
                                  }`}></div>
                                <span className="text-xs text-gray-600">Cliente</span>
                              </div>
                              {/* Estado fotos */}
                              {orden.fotos?.length > 0 && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-xs text-gray-600">{orden.fotos.length} fotos</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center whitespace-nowrap sm:px-6">
                            <div className="flex justify-center space-x-1">
                              <Link
                                href={`/admin/ordenes/${orden.id}`}
                                className="p-2 text-blue-600 transition-colors rounded-md hover:bg-blue-100"
                                title="Ver orden"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link
                                href={`/admin/ordenes/editar/${orden.id}`}
                                className="p-2 text-orange-600 transition-colors rounded-md hover:bg-orange-100"
                                title={`Editar orden${isOffline ? ' (offline)' : ''}`}
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                onClick={() => handleDescargarPDF(orden)}
                                disabled={descargando === orden.id}
                                className={`p-2 transition-colors rounded-md ${descargando === orden.id
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-green-600 hover:bg-green-100'
                                  }`}
                                title={descargando === orden.id ? 'Descargando...' : 'Descargar PDF'}
                              >
                                <Download size={16} />
                              </button>
                              <button
                                onClick={() => handleEliminarOrden(orden.id, orden.numero)}
                                className="p-2 text-red-600 transition-colors rounded-md hover:bg-red-100"
                                title={`Eliminar orden${isOffline ? ' (marcará para eliminar)' : ''}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-4 py-2 text-center border-t border-gray-200 bg-gray-50 sm:hidden">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <span>👈</span>
                  <span>Deslizá para ver más columnas</span>
                  <span>👉</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer con información IMSSE */}
        <div className="p-6 mt-8 text-center bg-white rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Sistema de gestión de órdenes de trabajo - Protección contra incendios</p>
            <p className="mt-2">
              <span className="font-medium">Certificaciones:</span> Notifier | Mircom | Inim | Secutron | Bosch
            </p>
            <p className="mt-2">
              📧 info@imsseingenieria.com | 🌐 www.imsseingenieria.com | 📍 Córdoba, Argentina
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}