// app/admin/estados/page.jsx - Lista Estados de Cuenta IMSSE (MIGRADO A API)
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
  Download,
  BarChart3,
  List,
  LayoutGrid,
  X
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
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

function AccionesEstado({ estado, descargando, onDescargar, onEliminar }) {
  return (
    <div className="flex items-center gap-2">
      <AccionBoton href={`/admin/estados/${estado.id}`} title="Ver estado" colorClasses="text-blue-600 bg-blue-50 hover:bg-blue-100">
        <Eye size={18} />
      </AccionBoton>
      <AccionBoton href={`/admin/estados/editar/${estado.id}`} title="Editar estado" colorClasses="text-orange-600 bg-orange-50 hover:bg-orange-100">
        <Edit size={18} />
      </AccionBoton>
      <AccionBoton
        onClick={() => onDescargar(estado)}
        disabled={descargando === estado.id}
        title={descargando === estado.id ? 'Descargando...' : 'Descargar PDF'}
        colorClasses="text-green-600 bg-green-50 hover:bg-green-100"
      >
        <Download size={18} />
      </AccionBoton>
      <AccionBoton
        onClick={() => onEliminar(estado.id, estado.numero)}
        title="Eliminar estado"
        colorClasses="text-red-600 bg-red-50 hover:bg-red-100"
      >
        <Trash2 size={18} />
      </AccionBoton>
    </div>
  );
}

export default function EstadosCuenta() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [estados, setEstados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [vista, setVista] = useState('tabla'); // 'tabla' | 'cards'
  const [descargando, setDescargando] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarEstados();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarEstados = async () => {
    try {
      // ✅ USAR apiService
      const response = await apiService.obtenerEstadosCuenta();
      const estadosData = response.documents || response || [];
      setEstados(estadosData);
    } catch (error) {
      console.error('Error al cargar estados de cuenta:', error);
      alert('Error al cargar los estados de cuenta');
      // Fallback para evitar crashes
      setEstados([]);
    }
  };

  const handleDelete = async (id, numero) => {
    if (confirm(`¿Está seguro de que desea eliminar el estado de cuenta ${numero}?`)) {
      try {
        // ✅ USAR apiService
        await apiService.eliminarEstadoCuenta(id);
        alert('Estado de cuenta eliminado exitosamente');
        await cargarEstados();
      } catch (error) {
        console.error('Error al eliminar estado de cuenta:', error);
        alert('Error al eliminar el estado de cuenta');
      }
    }
  };

  const handleDescargarPDF = async (estado) => {
    if (descargando === estado.id) return;
    setDescargando(estado.id);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: EstadoCuentaPDF } = await import('../../components/pdf/EstadoCuentaPDF');

      const blob = await pdf(<EstadoCuentaPDF estadoCuenta={estado} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${estado.numero}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
      setDescargando(null);
      alert(`✅ PDF ${estado.numero} descargado exitosamente`);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      setDescargando(null);
      alert('❌ Error al generar el PDF');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('es-AR');
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getSaldoColor = (saldo) => {
    if (saldo > 0) return 'text-red-600'; // Debe
    if (saldo < 0) return 'text-green-600'; // A favor
    return 'text-gray-600'; // Sin saldo
  };

  const getSaldoText = (saldo) => {
    if (saldo > 0) return 'Pendiente';
    if (saldo < 0) return 'A favor';
    return 'Al día';
  };

  const getFechaPeriodo = (estado) => {
    if (!estado.periodo?.desde) return null;
    const f = new Date(estado.periodo.desde);
    return Number.isNaN(f.getTime()) ? null : f;
  };

  const hayFiltrosActivos = filtros.desde || filtros.hasta || filtros.estado !== 'todos';

  const estadosFiltrados = useMemo(() => {
    let resultado = estados;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(estado =>
        estado.numero?.toLowerCase().includes(term) ||
        estado.cliente?.nombre?.toLowerCase().includes(term) ||
        estado.cliente?.empresa?.toLowerCase().includes(term)
      );
    }

    if (filtros.desde) {
      const desde = new Date(filtros.desde);
      resultado = resultado.filter(estado => {
        const f = getFechaPeriodo(estado);
        return f && f >= desde;
      });
    }

    if (filtros.hasta) {
      const hasta = new Date(`${filtros.hasta}T23:59:59`);
      resultado = resultado.filter(estado => {
        const f = getFechaPeriodo(estado);
        return f && f <= hasta;
      });
    }

    if (filtros.estado === 'pendiente') {
      resultado = resultado.filter(estado => (estado.saldoActual || 0) > 0);
    } else if (filtros.estado === 'al-dia') {
      resultado = resultado.filter(estado => (estado.saldoActual || 0) === 0);
    } else if (filtros.estado === 'a-favor') {
      resultado = resultado.filter(estado => (estado.saldoActual || 0) < 0);
    }

    return resultado;
  }, [estados, searchTerm, filtros]);

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando estados de cuenta IMSSE...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Estados de Cuenta</h2>
            <p className="text-sm text-gray-500">
              {estadosFiltrados.length} de {estados.length} {estados.length === 1 ? 'estado' : 'estados'}
            </p>
          </div>
          <Link
            href="/admin/estados/nuevo"
            className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
          >
            <Plus size={18} className="mr-2" />
            Nuevo Estado de Cuenta
          </Link>
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
                  <option value="todos">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="al-dia">Al día</option>
                  <option value="a-favor">A favor</option>
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
        {estadosFiltrados.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-sm rounded-2xl">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchTerm || hayFiltrosActivos ? 'No se encontraron estados de cuenta' : 'No hay estados de cuenta'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || hayFiltrosActivos
                ? 'Probá con otros términos o ajustá los filtros'
                : 'Comenzá creando tu primer estado de cuenta'
              }
            </p>
            {!searchTerm && !hayFiltrosActivos && (
              <Link
                href="/admin/estados/nuevo"
                className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
              >
                <Plus size={18} className="mr-2" />
                Crear Primer Estado de Cuenta
              </Link>
            )}
          </div>
        ) : vista === 'cards' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {estadosFiltrados.map((estado) => (
              <div key={estado.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{estado.numero}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(estado.periodo?.desde)} - {formatDate(estado.periodo?.hasta)}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    estado.saldoActual > 0
                      ? 'bg-red-100 text-red-800'
                      : estado.saldoActual < 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getSaldoText(estado.saldoActual)}
                  </span>
                </div>

                <div className="pb-3 mb-3 space-y-1 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{estado.cliente?.empresa || 'Sin empresa'}</p>
                  <p className="text-xs text-gray-500">{estado.cliente?.nombre || 'Sin nombre'}</p>
                  <p className={`text-sm font-bold ${getSaldoColor(estado.saldoActual)}`}>
                    {formatCurrency(Math.abs(estado.saldoActual || 0))}
                  </p>
                </div>

                <AccionesEstado
                  estado={estado}
                  descargando={descargando}
                  onDescargar={handleDescargarPDF}
                  onEliminar={handleDelete}
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
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado de Cuenta</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Período</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Saldo Actual</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Estado Financiero</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estadosFiltrados.map((estado, index) => (
                      <tr key={estado.id} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{estado.numero}</div>
                          <div className="text-xs text-gray-500">
                            {estado.fechaCreacion && estado.fechaCreacion.toDate
                              ? formatDate(estado.fechaCreacion.toDate())
                              : estado.fechaCreacion
                                ? formatDate(estado.fechaCreacion)
                                : 'Fecha no disponible'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{estado.cliente?.nombre || 'Sin nombre'}</div>
                          <div className="text-xs text-gray-500">{estado.cliente?.empresa || 'Sin empresa'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(estado.periodo?.desde)} - {formatDate(estado.periodo?.hasta)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${getSaldoColor(estado.saldoActual)}`}>
                            {formatCurrency(Math.abs(estado.saldoActual || 0))}
                          </div>
                          <div className={`text-xs ${getSaldoColor(estado.saldoActual)}`}>
                            {getSaldoText(estado.saldoActual)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            estado.saldoActual > 0
                              ? 'bg-red-100 text-red-800'
                              : estado.saldoActual < 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getSaldoText(estado.saldoActual)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <div className="flex justify-center">
                            <AccionesEstado
                              estado={estado}
                              descargando={descargando}
                              onDescargar={handleDescargarPDF}
                              onEliminar={handleDelete}
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
