// app/admin/inspecciones/page.jsx - Lista de Visitas Técnicas IMSSE (versión offline)
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

function AccionesInspeccion({ inspeccion, descargando, onDescargar, onEliminar, isOffline }) {
  return (
    <div className="flex items-center gap-2">
      <AccionBoton href={`/admin/inspecciones/${inspeccion.id}`} title="Ver visita" colorClasses="text-blue-600 bg-blue-50 hover:bg-blue-100">
        <Eye size={18} />
      </AccionBoton>
      <AccionBoton href={`/admin/inspecciones/editar/${inspeccion.id}`} title={`Editar visita${isOffline ? ' (offline)' : ''}`} colorClasses="text-orange-600 bg-orange-50 hover:bg-orange-100">
        <Edit size={18} />
      </AccionBoton>
      <AccionBoton
        onClick={() => onDescargar(inspeccion)}
        disabled={descargando === inspeccion.id}
        title={descargando === inspeccion.id ? 'Descargando...' : 'Descargar PDF'}
        colorClasses="text-green-600 bg-green-50 hover:bg-green-100"
      >
        <Download size={18} />
      </AccionBoton>
      <AccionBoton
        onClick={() => onEliminar(inspeccion.id, inspeccion.numero)}
        title={`Eliminar visita${isOffline ? ' (marcará para eliminar)' : ''}`}
        colorClasses="text-red-600 bg-red-50 hover:bg-red-100"
      >
        <Trash2 size={18} />
      </AccionBoton>
    </div>
  );
}

export default function ListaInspeccionesTecnicas() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inspecciones, setInspecciones] = useState([]);
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

  const getFechaTrabajo = (inspeccion) => {
    if (!inspeccion.fechaTrabajo) return null;
    const f = inspeccion.fechaTrabajo.toDate ? inspeccion.fechaTrabajo.toDate() : new Date(inspeccion.fechaTrabajo);
    return Number.isNaN(f.getTime()) ? null : f;
  };

  const estaCompletada = (inspeccion) => Boolean(inspeccion.firmas?.tecnico?.firma && inspeccion.firmas?.cliente?.firma);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarInspecciones();
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

  const cargarInspecciones = async () => {
    try {
      const response = await offlineApiService.obtenerInspeccionesTecnicas();
      setIsOffline(Boolean(response?.offline));

      const inspeccionesData = response.documents || response.inspecciones || response || [];
      setInspecciones(inspeccionesData);
    } catch (error) {
      console.error('Error al cargar inspecciones técnicas IMSSE:', error);
      setIsOffline(true);
    }
  };

  const sincronizarDatos = async () => {
    if (isOffline) return;
    try {
      setSincronizando(true);
      await offlineApiService.forcSync();
      await cargarInspecciones();
    } catch (error) {
      console.error('Error al sincronizar:', error);
    } finally {
      setSincronizando(false);
    }
  };

  const handleEliminarInspeccion = async (id, numero) => {
    if (confirm(`¿Está seguro de que desea eliminar la visita técnica ${numero}?`)) {
      try {
        const resultado = await offlineApiService.eliminarInspeccionTecnica(id);
        if (resultado?.offline) {
          alert('Visita marcada para eliminar. Se eliminará del servidor cuando haya conexión.');
        } else {
          alert('Visita técnica eliminada exitosamente');
        }
        await cargarInspecciones();
      } catch (error) {
        console.error('Error al eliminar inspección técnica:', error);
        alert('Error al eliminar la visita técnica');
      }
    }
  };

  const handleDescargarPDF = async (inspeccion) => {
    if (descargando === inspeccion.id) return;
    setDescargando(inspeccion.id);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: InspeccionTecnicaPDF } = await import('../../components/pdf/InspeccionTecnicaPDF');
      const blob = await pdf(<InspeccionTecnicaPDF inspeccion={inspeccion} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${inspeccion.numero}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setDescargando(null);
      alert(`✅ Visita ${inspeccion.numero} descargada exitosamente`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setDescargando(null);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  const hayFiltrosActivos = filtros.desde || filtros.hasta || filtros.estado !== 'todas';

  const inspeccionesFiltradas = useMemo(() => {
    let resultado = inspecciones;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(inspeccion =>
        inspeccion.numero?.toLowerCase().includes(term) ||
        inspeccion.cliente?.empresa?.toLowerCase().includes(term) ||
        inspeccion.cliente?.nombre?.toLowerCase().includes(term) ||
        inspeccion.observaciones?.toLowerCase().includes(term)
      );
    }

    if (filtros.desde) {
      const desde = new Date(filtros.desde);
      resultado = resultado.filter(inspeccion => {
        const f = getFechaTrabajo(inspeccion);
        return f && f >= desde;
      });
    }

    if (filtros.hasta) {
      const hasta = new Date(`${filtros.hasta}T23:59:59`);
      resultado = resultado.filter(inspeccion => {
        const f = getFechaTrabajo(inspeccion);
        return f && f <= hasta;
      });
    }

    if (filtros.estado === 'completadas') {
      resultado = resultado.filter(estaCompletada);
    } else if (filtros.estado === 'pendientes') {
      resultado = resultado.filter(inspeccion => !estaCompletada(inspeccion));
    }

    return resultado;
  }, [inspecciones, searchTerm, filtros]);

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando visitas técnicas IMSSE...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Visita Técnica</h2>
            <p className="text-sm text-gray-500">
              {inspeccionesFiltradas.length} de {inspecciones.length} {inspecciones.length === 1 ? 'visita' : 'visitas'}
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
              href="/admin/inspecciones/nueva"
              className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
            >
              <FilePlus size={18} className="mr-2" />
              Nueva Visita
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
                placeholder="Buscar por número, cliente, empresa u observaciones..."
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
        {inspeccionesFiltradas.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-sm rounded-2xl">
            <Shield size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchTerm || hayFiltrosActivos ? 'No se encontraron visitas' : 'No hay visitas técnicas'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || hayFiltrosActivos
                ? 'Probá con otros términos o ajustá los filtros'
                : isOffline
                  ? 'No hay inspecciones almacenadas localmente'
                  : 'Comenzá creando tu primera visita técnica'
              }
            </p>
            {!searchTerm && !hayFiltrosActivos && (
              <Link
                href="/admin/inspecciones/nueva"
                className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
              >
                <FilePlus size={18} className="mr-2" />
                Crear {isOffline ? 'Visita (Offline)' : 'Primera Visita'}
              </Link>
            )}
          </div>
        ) : vista === 'cards' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inspeccionesFiltradas.map((inspeccion) => (
              <div
                key={inspeccion.id}
                className={`p-4 bg-white border rounded-2xl shadow-sm ${inspeccion.isPending ? 'border-orange-300' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{inspeccion.numero}</p>
                    <p className="text-xs text-gray-500">Trabajo: {formatDate(inspeccion.fechaTrabajo) || 'Sin fecha'}</p>
                  </div>
                  {inspeccion.isPending ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                      <AlertCircle size={10} className="mr-1" /> Pendiente
                    </span>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      estaCompletada(inspeccion) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {estaCompletada(inspeccion) ? 'Completada' : 'En curso'}
                    </span>
                  )}
                </div>

                <div className="pb-3 mb-3 space-y-1 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{inspeccion.cliente?.empresa || 'Sin empresa'}</p>
                  <p className="text-xs text-gray-500">{inspeccion.cliente?.nombre || 'Sin contacto'}</p>
                  {inspeccion.cliente?.direccion && (
                    <p className="flex items-center text-xs text-gray-500">
                      <MapPin size={12} className="flex-shrink-0 mr-1" />
                      <span className="truncate">{inspeccion.cliente.direccion}</span>
                    </p>
                  )}
                  <p className="flex items-center text-xs text-gray-500">
                    <User size={12} className="flex-shrink-0 mr-1" />
                    {inspeccion.tecnicos?.length > 0
                      ? inspeccion.tecnicos.map(t => t.nombre).join(', ')
                      : 'Sin técnicos asignados'
                    }
                  </p>
                  {inspeccion.fotos?.length > 0 && (
                    <p className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></span>
                      {inspeccion.fotos.length} fotos
                    </p>
                  )}
                </div>

                <AccionesInspeccion
                  inspeccion={inspeccion}
                  descargando={descargando}
                  onDescargar={handleDescargarPDF}
                  onEliminar={handleEliminarInspeccion}
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
                    {inspeccionesFiltradas.map((inspeccion, index) => (
                      <tr
                        key={inspeccion.id}
                        className={`${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} ${inspeccion.isPending ? 'border-l-4 border-orange-400' : ''}`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{inspeccion.numero}</div>
                          <div className="text-xs text-gray-500">Creada: {formatDate(inspeccion.fechaCreacion)}</div>
                          {inspeccion.isPending && (
                            <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                              <AlertCircle size={10} className="mr-1" /> Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(inspeccion.fechaTrabajo)}</div>
                          <div className="text-xs text-gray-500">{inspeccion.horarioInicio} - {inspeccion.horarioFin}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{inspeccion.cliente?.empresa || 'Sin empresa'}</div>
                          <div className="text-xs text-gray-500">{inspeccion.cliente?.nombre || 'Sin contacto'}</div>
                          {inspeccion.cliente?.direccion && (
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <MapPin size={12} className="flex-shrink-0 mr-1" />
                              {inspeccion.cliente.direccion.length > 30
                                ? `${inspeccion.cliente.direccion.substring(0, 30)}...`
                                : inspeccion.cliente.direccion}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {inspeccion.tecnicos?.length > 0 ? (
                            <div>
                              {inspeccion.tecnicos.slice(0, 2).map((tecnico, idx) => (
                                <div key={idx} className="text-xs text-gray-600">• {tecnico.nombre}</div>
                              ))}
                              {inspeccion.tecnicos.length > 2 && (
                                <div className="text-xs text-gray-400">+{inspeccion.tecnicos.length - 2} más</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sin técnicos</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${inspeccion.firmas?.tecnico?.firma ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-xs text-gray-600">Técnico</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${inspeccion.firmas?.cliente?.firma ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="text-xs text-gray-600">Cliente</span>
                            </div>
                            {inspeccion.fotos?.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">{inspeccion.fotos.length} fotos</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <div className="flex justify-center">
                            <AccionesInspeccion
                              inspeccion={inspeccion}
                              descargando={descargando}
                              onDescargar={handleDescargarPDF}
                              onEliminar={handleEliminarInspeccion}
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
