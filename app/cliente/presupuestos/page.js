// app/cliente/presupuestos/page.jsx - Lista de presupuestos corregida
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Calendar,
  DollarSign,
  Eye,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function PresupuestosCliente() {
  const [user, setUser] = useState(null);
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [presupuestosFiltrados, setPresupuestosFiltrados] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarPresupuestos();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [presupuestos, filtros]);

  const cargarPresupuestos = async () => {
    try {
      setLoading(true);
      const response = await apiService.obtenerPresupuestos();
      
      // Manejar diferentes estructuras de respuesta
      let presupuestosArray = [];
      if (Array.isArray(response)) {
        presupuestosArray = response;
      } else if (response && response.documents && Array.isArray(response.documents)) {
        presupuestosArray = response.documents;
      } else if (response && response.success && response.documents) {
        presupuestosArray = response.documents;
      }
      
      setPresupuestos(presupuestosArray);
      console.log('Presupuestos cargados:', presupuestosArray);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
      setPresupuestos([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...presupuestos];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(presupuesto =>
        presupuesto.numero?.toLowerCase().includes(busqueda) ||
        presupuesto.descripcion?.toLowerCase().includes(busqueda) ||
        (presupuesto.cliente?.empresa && presupuesto.cliente.empresa.toLowerCase().includes(busqueda))
      );
    }

    // Filtro por estado
    if (filtros.estado !== 'todos') {
      resultado = resultado.filter(presupuesto => presupuesto.estado === filtros.estado);
    }

    // Filtro por fecha
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultado = resultado.filter(presupuesto => {
        const fechaPresupuesto = new Date(presupuesto.fecha || presupuesto.fechaCreacion);
        return fechaPresupuesto >= fechaDesde;
      });
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      resultado = resultado.filter(presupuesto => {
        const fechaPresupuesto = new Date(presupuesto.fecha || presupuesto.fechaCreacion);
        return fechaPresupuesto <= fechaHasta;
      });
    }

    setPresupuestosFiltrados(resultado);
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearMonto = (monto) => {
    if (!monto) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(monto);
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icono: Clock,
        texto: 'Pendiente'
      },
      aprobado: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icono: CheckCircle,
        texto: 'Aprobado'
      },
      rechazado: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icono: XCircle,
        texto: 'Rechazado'
      },
      borrador: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icono: AlertCircle,
        texto: 'Borrador'
      }
    };

    const config = estados[estado] || estados.pendiente;
    const IconoComponente = config.icono;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        <IconoComponente size={12} className="mr-1" />
        {config.texto}
      </span>
    );
  };

  // Función temporal para manejar descarga PDF
  const handleDescargarPDF = (presupuesto) => {
    // TODO: Implementar generación de PDF
    alert(`Función de PDF en desarrollo.\nPresupuesto: ${presupuesto.numero}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando presupuestos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
              Mis Presupuestos
            </h1>
            <p className="text-gray-600">
              Consulta y gestiona tus presupuestos de IMSSE Ingeniería
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{presupuestosFiltrados.length}</p>
            <p className="text-sm text-gray-600">Presupuestos</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Buscar</label>
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                placeholder="Número, descripción..."
                className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="borrador">Borrador</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Desde</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
              className="w-full py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Hasta</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
              className="w-full py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Botón limpiar filtros */}
        <div className="mt-4">
          <button
            onClick={() => setFiltros({
              busqueda: '',
              estado: 'todos',
              fechaDesde: '',
              fechaHasta: ''
            })}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Lista de presupuestos */}
      <div className="bg-white rounded-lg shadow">
        {presupuestosFiltrados.length > 0 ? (
          <div className="overflow-hidden">
            {/* Vista desktop - tabla */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Presupuesto
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {presupuestosFiltrados.map((presupuesto) => (
                    <tr key={presupuesto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                              <FileText size={20} className="text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {presupuesto.numero}
                            </div>
                            {presupuesto.observaciones && (
                              <div className="max-w-xs text-sm text-gray-500 truncate">
                                {presupuesto.observaciones}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatearFecha(presupuesto.fecha || presupuesto.fechaCreacion)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatearMonto(presupuesto.total)}
                      </td>
                      <td className="px-6 py-4">
                        {getEstadoBadge(presupuesto.estado)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Link
                            href={`/cliente/presupuestos/${presupuesto.id}`}
                            className="p-2 text-blue-600 hover:text-blue-800"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </Link>
                          {/* Comentado temporalmente hasta implementar PDF
                          <button
                            onClick={() => handleDescargarPDF(presupuesto)}
                            className="p-2 text-green-600 hover:text-green-800"
                            title="Descargar PDF"
                          >
                            <Download size={16} />
                          </button>
                          */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista móvil - cards */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-200">
                {presupuestosFiltrados.map((presupuesto) => (
                  <div key={presupuesto.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <FileText size={16} className="text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {presupuesto.numero}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatearFecha(presupuesto.fecha || presupuesto.fechaCreacion)}
                          </p>
                        </div>
                      </div>
                      {getEstadoBadge(presupuesto.estado)}
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-lg font-bold text-gray-900">
                        {formatearMonto(presupuesto.total)}
                      </p>
                      {presupuesto.observaciones && (
                        <p className="text-sm text-gray-600 truncate">
                          {presupuesto.observaciones}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/cliente/presupuestos/${presupuesto.id}`}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                      >
                        <Eye size={14} className="mr-1" />
                        Ver detalles
                      </Link>
                      {/* Comentado temporalmente hasta implementar PDF
                      <button
                        onClick={() => handleDescargarPDF(presupuesto)}
                        className="flex items-center px-3 py-1 ml-2 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50"
                      >
                        <Download size={14} className="mr-1" />
                        PDF
                      </button>
                      */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No hay presupuestos disponibles
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {presupuestos.length === 0 
                ? 'Aún no tienes presupuestos asignados a tu cuenta.'
                : 'No se encontraron presupuestos con los filtros aplicados.'
              }
            </p>
            {presupuestos.length === 0 && (
              <div className="mt-6">
                <Link
                  href="mailto:info@imsse.com"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
                >
                  Solicitar Presupuesto
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="p-6 mt-8 text-center bg-white border border-blue-200 rounded-lg shadow-md">
        <div className="text-sm text-gray-600">
          <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
          <p>Sistemas de protección contra incendios</p>
          <p className="mt-2">
            ¿Necesitas ayuda con un presupuesto? 
            <Link href="mailto:info@imsse.com" className="ml-1 text-primary hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}