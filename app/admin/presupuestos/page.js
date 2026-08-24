// app/admin/presupuestos/page.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FilePlus,
  FileText,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  Filter,
  List,
  LayoutGrid,
  X
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PresupuestoPDF from '../../components/pdf/PresupuestoPDF';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

const FILTROS_INICIALES = { desde: '', hasta: '', estado: 'todos' };

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

function AccionesPresupuesto({ presupuesto, onEliminar }) {
  return (
    <div className="flex items-center gap-2">
      <AccionBoton href={`/admin/presupuestos/${presupuesto.id}`} title="Ver detalles" colorClasses="text-blue-600 bg-blue-50 hover:bg-blue-100">
        <Eye size={18} />
      </AccionBoton>
      <AccionBoton href={`/admin/presupuestos/editar/${presupuesto.id}`} title="Editar presupuesto" colorClasses="text-orange-600 bg-orange-50 hover:bg-orange-100">
        <Edit size={18} />
      </AccionBoton>
      <PDFDownloadLink
        document={<PresupuestoPDF presupuesto={presupuesto} />}
        fileName={`${presupuesto.numero}.pdf`}
        title="Descargar PDF"
        className="inline-flex items-center justify-center text-green-600 transition-colors bg-green-50 w-10 h-10 rounded-xl hover:bg-green-100"
      >
        {({ loading }) => <Download size={18} className={loading ? 'animate-pulse' : ''} />}
      </PDFDownloadLink>
      <AccionBoton onClick={() => onEliminar(presupuesto.id)} title="Eliminar presupuesto" colorClasses="text-red-600 bg-red-50 hover:bg-red-100">
        <Trash2 size={18} />
      </AccionBoton>
    </div>
  );
}

export default function HistorialPresupuestos() {
  const [loading, setLoading] = useState(true);
  const [presupuestos, setPresupuestos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [vista, setVista] = useState('tabla'); // 'tabla' | 'cards'
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación con Firebase
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarPresupuestos();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarPresupuestos = async () => {
    try {
      const response = await apiService.obtenerPresupuestos();
      const presupuestosData = response.documents || [];

      console.log("Presupuestos cargados:", presupuestosData.length);
      setPresupuestos(presupuestosData);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
      setPresupuestos([]);
    }
  };

  const handleDeletePresupuesto = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este presupuesto?')) {
      try {
        await apiService.eliminarPresupuesto(id);
        setPresupuestos(presupuestos.filter(p => p.id !== id));
        alert('Presupuesto eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
        alert('Error al eliminar el presupuesto. Inténtelo de nuevo más tarde.');
      }
    }
  };

  // Función para cambiar estado del presupuesto
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await apiService.actualizarPresupuesto(id, {
        estado: nuevoEstado,
        fechaModificacion: new Date()
      });

      // Actualizar lista local
      setPresupuestos(presupuestos.map(p =>
        p.id === id ? { ...p, estado: nuevoEstado } : p
      ));

      console.log(`Estado cambiado a: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del presupuesto.');
    }
  };

  // Función para formatear moneda estilo argentino
  const formatCurrency = (amount) => {
    if (!amount) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Función para formatear fecha
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('es-AR');
    } catch (e) {
      return 'N/A';
    }
  };

  const getFechaPresupuesto = (presupuesto) => {
    const raw = presupuesto.fechaCreacion || presupuesto.fecha;
    if (!raw) return null;
    const f = raw.toDate ? raw.toDate() : new Date(raw);
    return Number.isNaN(f.getTime()) ? null : f;
  };

  // Función para obtener color del estado (solo 3 estados)
  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'aprobado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendiente':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const hayFiltrosActivos = filtros.desde || filtros.hasta || filtros.estado !== 'todos';

  const presupuestosFiltrados = useMemo(() => {
    let resultado = presupuestos;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(presupuesto => [
        presupuesto.numero,
        presupuesto.cliente?.nombre,
        presupuesto.cliente?.empresa
      ].some(campo => campo?.toLowerCase().includes(term)));
    }

    if (filtros.desde) {
      const desde = new Date(filtros.desde);
      resultado = resultado.filter(presupuesto => {
        const f = getFechaPresupuesto(presupuesto);
        return f && f >= desde;
      });
    }

    if (filtros.hasta) {
      const hasta = new Date(`${filtros.hasta}T23:59:59`);
      resultado = resultado.filter(presupuesto => {
        const f = getFechaPresupuesto(presupuesto);
        return f && f <= hasta;
      });
    }

    if (filtros.estado !== 'todos') {
      resultado = resultado.filter(presupuesto =>
        (presupuesto.estado?.toLowerCase() || 'pendiente') === filtros.estado
      );
    }

    return resultado;
  }, [presupuestos, searchTerm, filtros]);

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando presupuestos...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Presupuestos</h2>
            <p className="text-sm text-gray-500">
              {presupuestosFiltrados.length} de {presupuestos.length} {presupuestos.length === 1 ? 'presupuesto' : 'presupuestos'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/presupuestos/nuevo"
              className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
            >
              <FilePlus size={18} className="mr-2" />
              Nuevo Presupuesto
            </Link>
          </div>
        </div>

        {/* Búsqueda + filtros + vista */}
        <div className="p-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={18} className="absolute -translate-y-1/2 left-3 top-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número, cliente o empresa..."
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
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
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
        {presupuestosFiltrados.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-sm rounded-2xl">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchTerm || hayFiltrosActivos ? 'No se encontraron presupuestos' : 'No hay presupuestos creados aún'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || hayFiltrosActivos
                ? 'Probá con otros términos o ajustá los filtros'
                : 'Creá tu primer presupuesto para comenzar'
              }
            </p>
            {!searchTerm && !hayFiltrosActivos && (
              <Link
                href="/admin/presupuestos/nuevo"
                className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
              >
                <FilePlus size={18} className="mr-2" />
                Crear Primer Presupuesto
              </Link>
            )}
          </div>
        ) : vista === 'cards' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {presupuestosFiltrados.map((presupuesto) => (
              <div key={presupuesto.id} className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{presupuesto.numero}</p>
                    <p className="text-xs text-gray-500">{formatDate(presupuesto.fechaCreacion || presupuesto.fecha)}</p>
                  </div>
                  <select
                    value={presupuesto.estado || 'pendiente'}
                    onChange={(e) => handleCambiarEstado(presupuesto.id, e.target.value)}
                    className={`px-2 py-1 pr-6 text-xs font-semibold rounded-full border cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none ${getStatusColor(presupuesto.estado)}`}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>

                <div className="pb-3 mb-3 space-y-1 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{presupuesto.cliente?.empresa || 'Sin empresa'}</p>
                  <p className="text-xs text-gray-500">{presupuesto.cliente?.nombre || 'Sin contacto'}</p>
                  <p className="text-xs text-gray-500">
                    {presupuesto.items?.length || 0} item{(presupuesto.items?.length || 0) !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(presupuesto.total)}</p>
                </div>

                <AccionesPresupuesto presupuesto={presupuesto} onEliminar={handleDeletePresupuesto} />
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
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {presupuestosFiltrados.map((presupuesto, index) => (
                      <tr key={presupuesto.id} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{presupuesto.numero}</div>
                          <div className="text-xs text-gray-500">
                            {presupuesto.items?.length || 0} item{(presupuesto.items?.length || 0) !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(presupuesto.fechaCreacion || presupuesto.fecha)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{presupuesto.cliente?.empresa || 'Sin empresa'}</div>
                          <div className="text-xs text-gray-500">{presupuesto.cliente?.nombre || 'Sin contacto'}</div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {formatCurrency(presupuesto.total)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <select
                            value={presupuesto.estado || 'pendiente'}
                            onChange={(e) => handleCambiarEstado(presupuesto.id, e.target.value)}
                            className={`px-3 py-1 pr-8 text-xs font-semibold rounded-full border cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none ${getStatusColor(presupuesto.estado)}`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="aprobado">Aprobado</option>
                            <option value="rechazado">Rechazado</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <div className="flex justify-center">
                            <AccionesPresupuesto presupuesto={presupuesto} onEliminar={handleDeletePresupuesto} />
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
