// app/admin/recibos/page.jsx - Lista de Recibos IMSSE (MIGRADO A API)
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
  Receipt,
  Filter,
  List,
  LayoutGrid,
  X,
  User
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

const FILTROS_INICIALES = { desde: '', hasta: '' };

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

function AccionesRecibo({ recibo, descargando, onDescargar, onEliminar }) {
  return (
    <div className="flex items-center gap-2">
      <AccionBoton href={`/admin/recibos/${recibo.id}`} title="Ver recibo" colorClasses="text-blue-600 bg-blue-50 hover:bg-blue-100">
        <Eye size={18} />
      </AccionBoton>
      <AccionBoton href={`/admin/recibos/editar/${recibo.id}`} title="Editar recibo" colorClasses="text-orange-600 bg-orange-50 hover:bg-orange-100">
        <Edit size={18} />
      </AccionBoton>
      <AccionBoton
        onClick={() => onDescargar(recibo)}
        disabled={descargando === recibo.id}
        title={descargando === recibo.id ? 'Descargando...' : 'Descargar PDF'}
        colorClasses="text-green-600 bg-green-50 hover:bg-green-100"
      >
        <Download size={18} />
      </AccionBoton>
      <AccionBoton
        onClick={() => onEliminar(recibo.id, recibo.numero)}
        title="Eliminar recibo"
        colorClasses="text-red-600 bg-red-50 hover:bg-red-100"
      >
        <Trash2 size={18} />
      </AccionBoton>
    </div>
  );
}

export default function ListaRecibos() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recibos, setRecibos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [vista, setVista] = useState('tabla'); // 'tabla' | 'cards'
  const [descargando, setDescargando] = useState(null);

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
      return fecha?.toString() || '';
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

  const getFechaRecibo = (recibo) => {
    if (!recibo.fecha) return null;
    const f = recibo.fecha.toDate ? recibo.fecha.toDate() : new Date(recibo.fecha);
    return Number.isNaN(f.getTime()) ? null : f;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarRecibos();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarRecibos = async () => {
    try {
      // ✅ USAR apiService
      const response = await apiService.obtenerRecibos();
      const recibosData = response.documents || response || [];

      setRecibos(recibosData);
    } catch (error) {
      console.error('Error al cargar recibos IMSSE:', error);
      alert('Error al cargar los recibos');
      // Fallback para evitar crashes
      setRecibos([]);
    }
  };

  const handleEliminarRecibo = async (id, numero) => {
    if (confirm(`¿Está seguro de que desea eliminar el recibo ${numero}?`)) {
      try {
        // ✅ USAR apiService
        await apiService.eliminarRecibo(id);
        await cargarRecibos(); // Recargar la lista
        alert('Recibo eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar recibo:', error);
        alert('Error al eliminar el recibo');
      }
    }
  };

  const handleDescargarPDF = async (recibo) => {
    if (descargando === recibo.id) return; // Evitar doble descarga

    setDescargando(recibo.id);

    try {
      // Importar dinámicamente react-pdf para generar el PDF
      const { pdf } = await import('@react-pdf/renderer');
      const { default: ReciboPDF } = await import('../../components/pdf/ReciboPDF');

      // Generar el PDF
      const blob = await pdf(<ReciboPDF recibo={recibo} />).toBlob();

      // Crear URL y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${recibo.numero}.pdf`;
      link.click();

      // Limpiar URL
      URL.revokeObjectURL(url);

      // Resetear estado y mostrar confirmación
      setDescargando(null);
      alert(`✅ Recibo ${recibo.numero} descargado exitosamente`);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      setDescargando(null);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  const hayFiltrosActivos = filtros.desde || filtros.hasta;

  const recibosFiltrados = useMemo(() => {
    let resultado = recibos;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(recibo =>
        recibo.numero?.toLowerCase().includes(term) ||
        recibo.recibiDe?.toLowerCase().includes(term) ||
        recibo.concepto?.toLowerCase().includes(term)
      );
    }

    if (filtros.desde) {
      const desde = new Date(filtros.desde);
      resultado = resultado.filter(recibo => {
        const f = getFechaRecibo(recibo);
        return f && f >= desde;
      });
    }

    if (filtros.hasta) {
      const hasta = new Date(`${filtros.hasta}T23:59:59`);
      resultado = resultado.filter(recibo => {
        const f = getFechaRecibo(recibo);
        return f && f <= hasta;
      });
    }

    return resultado;
  }, [recibos, searchTerm, filtros]);

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando recibos IMSSE...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Recibos</h2>
            <p className="text-sm text-gray-500">
              {recibosFiltrados.length} de {recibos.length} {recibos.length === 1 ? 'recibo' : 'recibos'}
            </p>
          </div>
          <Link
            href="/admin/recibos/nuevo"
            className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
          >
            <FilePlus size={18} className="mr-2" />
            Nuevo Recibo
          </Link>
        </div>

        {/* Búsqueda + filtros + vista */}
        <div className="p-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={18} className="absolute -translate-y-1/2 left-3 top-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número, cliente o concepto..."
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
            <div className="grid grid-cols-1 gap-3 pt-4 mt-4 border-t border-gray-100 sm:grid-cols-2">
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

              {hayFiltrosActivos && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="inline-flex items-center gap-1 text-sm text-gray-500 sm:col-span-2 w-fit hover:text-gray-700"
                >
                  <X size={14} /> Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Resultado: vacío / tabla / tarjetas */}
        {recibosFiltrados.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-sm rounded-2xl">
            <Receipt size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchTerm || hayFiltrosActivos ? 'No se encontraron recibos' : 'No hay recibos'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || hayFiltrosActivos
                ? 'Probá con otros términos o ajustá los filtros'
                : 'Comenzá creando tu primer recibo IMSSE'
              }
            </p>
            {!searchTerm && !hayFiltrosActivos && (
              <Link
                href="/admin/recibos/nuevo"
                className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
              >
                <FilePlus size={18} className="mr-2" />
                Crear Primer Recibo
              </Link>
            )}
          </div>
        ) : vista === 'cards' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recibosFiltrados.map((recibo) => (
              <div
                key={recibo.id}
                className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{recibo.numero}</p>
                    <p className="text-xs text-gray-500">Fecha: {formatDate(recibo.fecha) || 'Sin fecha'}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(recibo.monto)}</span>
                </div>

                <div className="pb-3 mb-3 space-y-1 border-b border-gray-100">
                  <p className="flex items-center text-sm font-medium text-gray-900">
                    <User size={12} className="flex-shrink-0 mr-1" />
                    {recibo.recibiDe || 'Sin cliente'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {recibo.concepto
                      ? (recibo.concepto.length > 60 ? `${recibo.concepto.substring(0, 60)}...` : recibo.concepto)
                      : 'Sin concepto'}
                  </p>
                </div>

                <AccionesRecibo
                  recibo={recibo}
                  descargando={descargando}
                  onDescargar={handleDescargarPDF}
                  onEliminar={handleEliminarRecibo}
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
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Concepto</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Monto</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recibosFiltrados.map((recibo, index) => (
                      <tr
                        key={recibo.id}
                        className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{recibo.numero}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(recibo.fecha)}</div>
                          <div className="text-xs text-gray-500">{formatDate(recibo.fechaCreacion)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{recibo.recibiDe}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {recibo.concepto
                              ? (recibo.concepto.length > 50 ? `${recibo.concepto.substring(0, 50)}...` : recibo.concepto)
                              : 'Sin concepto'}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600">{formatCurrency(recibo.monto)}</div>
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <div className="flex justify-center">
                            <AccionesRecibo
                              recibo={recibo}
                              descargando={descargando}
                              onDescargar={handleDescargarPDF}
                              onEliminar={handleEliminarRecibo}
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
