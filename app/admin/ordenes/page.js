// app/admin/ordenes/page.jsx - Lista de Órdenes de Trabajo IMSSE (versión offline)
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FilePlus,
  Eye,
  Edit,
  Trash2,
  Search,
  Download,
  Shield,
  MapPin,
  WifiOff,
  AlertCircle,
  RefreshCw,
  Filter,
  List,
  LayoutGrid,
  X,
  User
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';
import offlineApiService from '../../../lib/services/offlineApiService';

const FILTROS_INICIALES = { desde: '', hasta: '', estado: 'todas' };

// Botón de acción de fila/tarjeta: grande y bien separado para uso cómodo en mobile
function AccionBoton({ href, onClick, disabled, title, colorClasses, children }) {
  const className = `inline-flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
    disabled ? 'text-gray-300 cursor-not-allowed' : colorClasses
  }`;

  if (href) {
    return (
      <Link href={href} title={title} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} className={className}>
      {children}
    </button>
  );
}

function AccionesOrden({ orden, descargando, onDescargar, onEliminar, isOffline }) {
  return (
    <div className="flex items-center gap-2">
      <AccionBoton href={`/admin/ordenes/${orden.id}`} title="Ver orden" colorClasses="text-blue-600 bg-blue-50 hover:bg-blue-100">
        <Eye size={18} />
      </AccionBoton>
      <AccionBoton href={`/admin/ordenes/editar/${orden.id}`} title={`Editar orden${isOffline ? ' (offline)' : ''}`} colorClasses="text-orange-600 bg-orange-50 hover:bg-orange-100">
        <Edit size={18} />
      </AccionBoton>
      <AccionBoton
        onClick={() => onDescargar(orden)}
        disabled={descargando === orden.id}
        title={descargando === orden.id ? 'Descargando...' : 'Descargar PDF'}
        colorClasses="text-green-600 bg-green-50 hover:bg-green-100"
      >
        <Download size={18} />
      </AccionBoton>
      <AccionBoton
        onClick={() => onEliminar(orden.id, orden.numero)}
        title={`Eliminar orden${isOffline ? ' (marcará para eliminar)' : ''}`}
        colorClasses="text-red-600 bg-red-50 hover:bg-red-100"
      >
        <Trash2 size={18} />
      </AccionBoton>
    </div>
  );
}

export default function ListaOrdenesTrabajo() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ordenes, setOrdenes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [vista, setVista] = useState('tabla'); // 'tabla' | 'cards'
  const [descargando, setDescargando] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);

  const formatDate = (fecha) => {
    if (!fecha) return '';
    try {
      const dateObj = fecha.toDate ? fecha.toDate() : new Date(fecha);
      return dateObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return fecha.toString();
    }
  };

  const getFechaTrabajo = (orden) => {
    if (!orden.fechaTrabajo) return null;
    const f = orden.fechaTrabajo.toDate ? orden.fechaTrabajo.toDate() : new Date(orden.fechaTrabajo);
    return Number.isNaN(f.getTime()) ? null : f;
  };

  const estaCompletada = (orden) => Boolean(orden.firmas?.tecnico?.firma && orden.firmas?.cliente?.firma);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarOrdenes();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

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
      let response;
      try {
        response = await apiService.obtenerOrdenesTrabajo();
        setIsOffline(false);
      } catch (error) {
        console.log('Error online, cargando desde cache offline:', error);
        response = await offlineApiService.obtenerOrdenesTecnico();
        setIsOffline(true);
      }

      const ordenesData = response.documents || response.ordenes || response || [];
      setOrdenes(ordenesData);
    } catch (error) {
      console.error('Error al cargar órdenes de trabajo IMSSE:', error);
      setIsOffline(true);
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

  const handleEliminarOrden = async (id, numero) => {
    if (confirm(`¿Está seguro de que desea eliminar la orden de trabajo ${numero}?`)) {
      try {
        if (isOffline) {
          await offlineApiService.eliminarOrden(id);
          alert('Orden marcada para eliminar. Se eliminará del servidor cuando haya conexión.');
        } else {
          await apiService.eliminarOrdenTrabajo(id);
          alert('Orden de trabajo eliminada exitosamente');
        }
        await cargarOrdenes();
      } catch (error) {
        console.error('Error al eliminar orden de trabajo:', error);
        alert('Error al eliminar la orden de trabajo');
      }
    }
  };

  const handleDescargarPDF = async (orden) => {
    if (descargando === orden.id) return;
    setDescargando(orden.id);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: OrdenTrabajoPDF } = await import('../../components/pdf/OrdenTrabajoPDF');
      const blob = await pdf(<OrdenTrabajoPDF orden={orden} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${orden.numero}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setDescargando(null);
      alert(`✅ Orden ${orden.numero} descargada exitosamente`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setDescargando(null);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  const hayFiltrosActivos = filtros.desde || filtros.hasta || filtros.estado !== 'todas';

  const ordenesFiltradas = useMemo(() => {
    let resultado = ordenes;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(orden =>
        orden.numero?.toLowerCase().includes(term) ||
        orden.cliente?.empresa?.toLowerCase().includes(term) ||
        orden.cliente?.nombre?.toLowerCase().includes(term) ||
        orden.tareasRealizadas?.toLowerCase().includes(term)
      );
    }

    if (filtros.desde) {
      const desde = new Date(filtros.desde);
      resultado = resultado.filter(orden => {
        const f = getFechaTrabajo(orden);
        return f && f >= desde;
      });
    }

    if (filtros.hasta) {
      const hasta = new Date(`${filtros.hasta}T23:59:59`);
      resultado = resultado.filter(orden => {
        const f = getFechaTrabajo(orden);
        return f && f <= hasta;
      });
    }

    if (filtros.estado === 'completadas') {
      resultado = resultado.filter(estaCompletada);
    } else if (filtros.estado === 'pendientes') {
      resultado = resultado.filter(orden => !estaCompletada(orden));
    }

    return resultado;
  }, [ordenes, searchTerm, filtros]);

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES);

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
      <div className="px-4 py-6 mx-auto max-w-7xl">
        {/* Título + acciones */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Órdenes de Trabajo</h2>
            <p className="text-sm text-gray-500">
              {ordenesFiltradas.length} de {ordenes.length} {ordenes.length === 1 ? 'orden' : 'órdenes'}
              {isOffline && <span className="text-orange-600"> · Datos locales</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isOffline && (
              <button
                onClick={sincronizarDatos}
                disabled={sincronizando}
                className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={16} className={`mr-2 ${sincronizando ? 'animate-spin' : ''}`} />
                <span>{sincronizando ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>
            )}
            <Link
              href="/admin/ordenes/nuevo"
              className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
            >
              <FilePlus size={18} className="mr-2" />
              Nueva Orden
            </Link>
          </div>
        </div>

        {/* Alerta de modo offline */}
        {isOffline && (
          <div className="p-4 mb-6 border border-orange-200 rounded-2xl bg-orange-50">
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

        {/* Búsqueda + filtros + vista */}
        <div className="p-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={18} className="absolute -translate-y-1/2 left-3 top-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número, cliente, empresa o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border rounded-xl transition-colors ${
                  hayFiltrosActivos
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter size={16} />
                Filtros
                {hayFiltrosActivos && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>

              <div className="flex overflow-hidden border border-gray-300 rounded-xl">
                <button
                  type="button"
                  onClick={() => setVista('tabla')}
                  title="Vista de tabla"
                  className={`p-2.5 ${vista === 'tabla' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <List size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setVista('cards')}
                  title="Vista de tarjetas"
                  className={`p-2.5 border-l border-gray-300 ${vista === 'cards' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>
          </div>

          {filtrosAbiertos && (
            <div className="grid grid-cols-1 gap-3 pt-4 mt-4 border-t border-gray-100 sm:grid-cols-3">
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Desde</label>
                <input
                  type="date"
                  value={filtros.desde}
                  onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Hasta</label>
                <input
                  type="date"
                  value={filtros.hasta}
                  onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="todas">Todas</option>
                  <option value="completadas">Completadas</option>
                  <option value="pendientes">Pendientes</option>
                </select>
              </div>

              {hayFiltrosActivos && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="inline-flex items-center gap-1 text-sm text-gray-500 sm:col-span-3 w-fit hover:text-gray-700"
                >
                  <X size={14} /> Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Resultado: vacío / tabla / tarjetas */}
        {ordenesFiltradas.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-sm rounded-2xl">
            <Shield size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchTerm || hayFiltrosActivos ? 'No se encontraron órdenes' : 'No hay órdenes de trabajo'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || hayFiltrosActivos
                ? 'Probá con otros términos o ajustá los filtros'
                : isOffline
                  ? 'No hay órdenes almacenadas localmente'
                  : 'Comenzá creando tu primera orden de trabajo'
              }
            </p>
            {!searchTerm && !hayFiltrosActivos && (
              <Link
                href="/admin/ordenes/nuevo"
                className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
              >
                <FilePlus size={18} className="mr-2" />
                Crear {isOffline ? 'Orden (Offline)' : 'Primera Orden'}
              </Link>
            )}
          </div>
        ) : vista === 'cards' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ordenesFiltradas.map((orden) => (
              <div
                key={orden.id}
                className={`p-4 bg-white border rounded-2xl shadow-sm ${orden.isPending ? 'border-orange-300' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{orden.numero}</p>
                    <p className="text-xs text-gray-500">Trabajo: {formatDate(orden.fechaTrabajo) || 'Sin fecha'}</p>
                  </div>
                  {orden.isPending ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                      <AlertCircle size={10} className="mr-1" /> Pendiente
                    </span>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      estaCompletada(orden) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {estaCompletada(orden) ? 'Completada' : 'En curso'}
                    </span>
                  )}
                </div>

                <div className="pb-3 mb-3 space-y-1 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{orden.cliente?.empresa || 'Sin empresa'}</p>
                  <p className="text-xs text-gray-500">{orden.cliente?.nombre || 'Sin contacto'}</p>
                  {orden.cliente?.direccion && (
                    <p className="flex items-center text-xs text-gray-500">
                      <MapPin size={12} className="flex-shrink-0 mr-1" />
                      <span className="truncate">{orden.cliente.direccion}</span>
                    </p>
                  )}
                  <p className="flex items-center text-xs text-gray-500">
                    <User size={12} className="flex-shrink-0 mr-1" />
                    {orden.tecnicos?.length > 0
                      ? orden.tecnicos.map(t => t.nombre).join(', ')
                      : 'Sin técnicos asignados'
                    }
                  </p>
                </div>

                <AccionesOrden
                  orden={orden}
                  descargando={descargando}
                  onDescargar={handleDescargarPDF}
                  onEliminar={handleEliminarOrden}
                  isOffline={isOffline}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-2xl">
            <div className="table-scroll-container">
              <div className="table-wrapper">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Número</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha Trabajo</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Técnicos</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordenesFiltradas.map((orden, index) => (
                      <tr
                        key={orden.id}
                        className={`${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} ${orden.isPending ? 'border-l-4 border-orange-400' : ''}`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{orden.numero}</div>
                          <div className="text-xs text-gray-500">Creada: {formatDate(orden.fechaCreacion)}</div>
                          {orden.isPending && (
                            <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                              <AlertCircle size={10} className="mr-1" /> Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(orden.fechaTrabajo)}</div>
                          <div className="text-xs text-gray-500">{orden.horarioInicio} - {orden.horarioFin}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{orden.cliente?.empresa || 'Sin empresa'}</div>
                          <div className="text-xs text-gray-500">{orden.cliente?.nombre || 'Sin contacto'}</div>
                          {orden.cliente?.direccion && (
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <MapPin size={12} className="flex-shrink-0 mr-1" />
                              {orden.cliente.direccion.length > 30
                                ? `${orden.cliente.direccion.substring(0, 30)}...`
                                : orden.cliente.direccion}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {orden.tecnicos?.length > 0 ? (
                            <div>
                              {orden.tecnicos.slice(0, 2).map((tecnico, idx) => (
                                <div key={idx} className="text-xs text-gray-600">• {tecnico.nombre}</div>
                              ))}
                              {orden.tecnicos.length > 2 && (
                                <div className="text-xs text-gray-400">+{orden.tecnicos.length - 2} más</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sin técnicos</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${orden.firmas?.tecnico?.firma ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-xs text-gray-600">Técnico</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${orden.firmas?.cliente?.firma ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-xs text-gray-600">Cliente</span>
                            </div>
                            {orden.fotos?.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">{orden.fotos.length} fotos</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <div className="flex justify-center">
                            <AccionesOrden
                              orden={orden}
                              descargando={descargando}
                              onDescargar={handleDescargarPDF}
                              onEliminar={handleEliminarOrden}
                              isOffline={isOffline}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-4 py-2 text-center border-t border-gray-200 bg-gray-50 sm:hidden">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>👈</span>
                <span>Deslizá para ver más columnas, o probá la vista de tarjetas</span>
                <span>👉</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
