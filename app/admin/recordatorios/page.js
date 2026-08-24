// app/admin/recordatorios/page.jsx - Lista de Recordatorios IMSSE
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Calendar,
  User,
  List,
  LayoutGrid,
  X
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

const FILTROS_INICIALES = { desde: '', hasta: '', estado: 'todos', prioridad: 'todos' };

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

function AccionesRecordatorio({ recordatorio, onToggleCompletado, onEliminar }) {
  const completado = recordatorio.estadoCalculado === 'completado';

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onToggleCompletado(recordatorio.id, recordatorio.estado)}
        title={completado ? 'Marcar como pendiente' : 'Marcar como completado'}
        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-colors ${
          completado ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent hover:border-green-500'
        }`}
      >
        <CheckCircle size={18} />
      </button>
      <AccionBoton href={`/admin/recordatorios/${recordatorio.id}`} title="Ver recordatorio" colorClasses="text-blue-600 bg-blue-50 hover:bg-blue-100">
        <Eye size={18} />
      </AccionBoton>
      <AccionBoton href={`/admin/recordatorios/editar/${recordatorio.id}`} title="Editar recordatorio" colorClasses="text-orange-600 bg-orange-50 hover:bg-orange-100">
        <Edit size={18} />
      </AccionBoton>
      <AccionBoton
        onClick={() => onEliminar(recordatorio.id, recordatorio.titulo)}
        title="Eliminar recordatorio"
        colorClasses="text-red-600 bg-red-50 hover:bg-red-100"
      >
        <Trash2 size={18} />
      </AccionBoton>
    </div>
  );
}

export default function ListaRecordatorios() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recordatorios, setRecordatorios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [vista, setVista] = useState('tabla'); // 'tabla' | 'cards'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarRecordatorios();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarRecordatorios = async () => {
    try {
      const response = await apiService.obtenerRecordatorios();
      const recordatoriosData = response.documents || response || [];

      // Procesar datos (calcular estado automáticamente)
      const recordatoriosProcesados = recordatoriosData.map(recordatorio => {
        const fechaVencimiento = new Date(recordatorio.fechaVencimiento);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaVencimiento.setHours(0, 0, 0, 0);

        let estadoCalculado = recordatorio.estado;
        if (recordatorio.estado === 'pendiente' && fechaVencimiento < hoy) {
          estadoCalculado = 'vencido';
        }

        return {
          ...recordatorio,
          estadoCalculado
        };
      });

      // Ordenar por fecha de vencimiento por defecto
      recordatoriosProcesados.sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));

      setRecordatorios(recordatoriosProcesados);
    } catch (error) {
      console.error('Error al cargar recordatorios IMSSE:', error);
      alert('Error al cargar los recordatorios. Inténtelo de nuevo más tarde.');
    }
  };

  const handleDelete = async (id, titulo) => {
    if (confirm(`¿Está seguro de que desea eliminar el recordatorio "${titulo}"?`)) {
      try {
        await apiService.eliminarRecordatorio(id);
        alert('Recordatorio eliminado exitosamente.');
        await cargarRecordatorios();
      } catch (error) {
        console.error('Error al eliminar recordatorio:', error);
        alert('Error al eliminar el recordatorio.');
      }
    }
  };

  const handleToggleCompletado = async (id, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 'completado' ? 'pendiente' : 'completado';
      const datosActualizacion = {
        estado: nuevoEstado,
        fechaCompletado: nuevoEstado === 'completado' ? new Date().toISOString() : null
      };

      await apiService.actualizarRecordatorio(id, datosActualizacion);
      await cargarRecordatorios();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado del recordatorio.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const today = new Date();
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const formatted = date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      if (diffDays === 0) return `${formatted} (Hoy)`;
      if (diffDays === 1) return `${formatted} (Mañana)`;
      if (diffDays === -1) return `${formatted} (Ayer)`;
      if (diffDays < 0) return `${formatted} (${Math.abs(diffDays)} días atrás)`;
      if (diffDays <= 7) return `${formatted} (En ${diffDays} días)`;

      return formatted;
    } catch (e) {
      return dateString;
    }
  };

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'vencido':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          text: 'VENCIDO'
        };
      case 'pendiente':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          text: 'PENDIENTE'
        };
      case 'completado':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'COMPLETADO'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          text: estado?.toUpperCase() || 'DESCONOCIDO'
        };
    }
  };

  const getPrioridadConfig = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return { color: 'bg-red-500', text: 'ALTA' };
      case 'media':
        return { color: 'bg-yellow-500', text: 'MEDIA' };
      case 'baja':
        return { color: 'bg-green-500', text: 'BAJA' };
      default:
        return { color: 'bg-gray-500', text: 'SIN DEFINIR' };
    }
  };

  const hayFiltrosActivos = filtros.desde || filtros.hasta || filtros.estado !== 'todos' || filtros.prioridad !== 'todos';

  const recordatoriosFiltrados = useMemo(() => {
    let resultado = recordatorios;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(recordatorio =>
        recordatorio.titulo?.toLowerCase().includes(term) ||
        recordatorio.descripcion?.toLowerCase().includes(term) ||
        recordatorio.usuarioCreador?.toLowerCase().includes(term)
      );
    }

    if (filtros.desde) {
      const desde = new Date(filtros.desde);
      resultado = resultado.filter(recordatorio => {
        const f = new Date(recordatorio.fechaVencimiento);
        return !Number.isNaN(f.getTime()) && f >= desde;
      });
    }

    if (filtros.hasta) {
      const hasta = new Date(`${filtros.hasta}T23:59:59`);
      resultado = resultado.filter(recordatorio => {
        const f = new Date(recordatorio.fechaVencimiento);
        return !Number.isNaN(f.getTime()) && f <= hasta;
      });
    }

    if (filtros.estado !== 'todos') {
      resultado = resultado.filter(recordatorio => recordatorio.estadoCalculado === filtros.estado);
    }

    if (filtros.prioridad !== 'todos') {
      resultado = resultado.filter(recordatorio => recordatorio.prioridad === filtros.prioridad);
    }

    return resultado;
  }, [recordatorios, searchTerm, filtros]);

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando recordatorios IMSSE...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Recordatorios</h2>
            <p className="text-sm text-gray-500">
              {recordatoriosFiltrados.length} de {recordatorios.length} {recordatorios.length === 1 ? 'recordatorio' : 'recordatorios'}
            </p>
          </div>
          <Link
            href="/admin/recordatorios/nuevo"
            className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
          >
            <Plus size={18} className="mr-2" />
            Nuevo Recordatorio
          </Link>
        </div>

        {/* Búsqueda + filtros + vista */}
        <div className="p-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={18} className="absolute -translate-y-1/2 left-3 top-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, descripción o responsable..."
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
            <div className="grid grid-cols-1 gap-3 pt-4 mt-4 border-t border-gray-100 sm:grid-cols-2 lg:grid-cols-4">
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
                  <option value="todos">Todos</option>
                  <option value="vencido">Vencidos</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="completado">Completados</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-500">Prioridad</label>
                <select
                  value={filtros.prioridad}
                  onChange={(e) => setFiltros({ ...filtros, prioridad: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="todos">Todas</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>

              {hayFiltrosActivos && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="inline-flex items-center gap-1 text-sm text-gray-500 sm:col-span-2 lg:col-span-4 w-fit hover:text-gray-700"
                >
                  <X size={14} /> Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Resultado: vacío / tabla / tarjetas */}
        {recordatoriosFiltrados.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-sm rounded-2xl">
            <Bell size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchTerm || hayFiltrosActivos ? 'No se encontraron recordatorios' : 'No hay recordatorios'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || hayFiltrosActivos
                ? 'Probá con otros términos o ajustá los filtros'
                : 'Comenzá creando tu primer recordatorio'
              }
            </p>
            {!searchTerm && !hayFiltrosActivos && (
              <Link
                href="/admin/recordatorios/nuevo"
                className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
              >
                <Plus size={18} className="mr-2" />
                Crear Primer Recordatorio
              </Link>
            )}
          </div>
        ) : vista === 'cards' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recordatoriosFiltrados.map((recordatorio) => {
              const estadoConfig = getEstadoConfig(recordatorio.estadoCalculado);
              const prioridadConfig = getPrioridadConfig(recordatorio.prioridad);
              const IconoEstado = estadoConfig.icon;
              const completado = recordatorio.estadoCalculado === 'completado';

              return (
                <div
                  key={recordatorio.id}
                  className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <p className={`font-semibold truncate ${completado ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {recordatorio.titulo}
                      </p>
                      <p className="flex items-center mt-1 text-xs text-gray-500">
                        <Calendar size={12} className="flex-shrink-0 mr-1" />
                        {formatDate(recordatorio.fechaVencimiento)}
                      </p>
                    </div>
                    <span className={`inline-flex flex-shrink-0 items-center px-2 py-1 text-xs font-medium rounded-full border ${estadoConfig.color}`}>
                      <IconoEstado size={10} className="mr-1" />
                      {estadoConfig.text}
                    </span>
                  </div>

                  {recordatorio.descripcion && (
                    <p className={`mb-3 text-sm ${completado ? 'text-gray-400' : 'text-gray-600'}`}>
                      {recordatorio.descripcion}
                    </p>
                  )}

                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <span className={`w-2.5 h-2.5 rounded-full ${prioridadConfig.color}`} />
                      Prioridad {prioridadConfig.text}
                    </span>
                    <span className="flex items-center text-xs text-gray-500">
                      <User size={12} className="flex-shrink-0 mr-1" />
                      {recordatorio.usuarioCreador || 'Sin asignar'}
                    </span>
                  </div>

                  <AccionesRecordatorio
                    recordatorio={recordatorio}
                    onToggleCompletado={handleToggleCompletado}
                    onEliminar={handleDelete}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-2xl">
            <div className="table-scroll-container">
              <div className="table-wrapper">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Título</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Vencimiento</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Prioridad</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Creado por</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recordatoriosFiltrados.map((recordatorio, index) => {
                      const estadoConfig = getEstadoConfig(recordatorio.estadoCalculado);
                      const prioridadConfig = getPrioridadConfig(recordatorio.prioridad);
                      const IconoEstado = estadoConfig.icon;
                      const completado = recordatorio.estadoCalculado === 'completado';

                      return (
                        <tr key={recordatorio.id} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-4">
                            <div className={`text-sm font-medium ${completado ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {recordatorio.titulo}
                            </div>
                            {recordatorio.descripcion && (
                              <div className="max-w-xs text-xs text-gray-500 truncate">{recordatorio.descripcion}</div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar size={14} className="flex-shrink-0 mr-1 text-gray-400" />
                              {formatDate(recordatorio.fechaVencimiento)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                              <span className={`w-2.5 h-2.5 rounded-full ${prioridadConfig.color}`} />
                              {prioridadConfig.text}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${estadoConfig.color}`}>
                              <IconoEstado size={12} className="mr-1" />
                              {estadoConfig.text}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-600">
                              <User size={14} className="flex-shrink-0 mr-1 text-gray-400" />
                              {recordatorio.usuarioCreador || 'Sin asignar'}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <div className="flex justify-center">
                              <AccionesRecordatorio
                                recordatorio={recordatorio}
                                onToggleCompletado={handleToggleCompletado}
                                onEliminar={handleDelete}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
