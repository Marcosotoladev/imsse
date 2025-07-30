// app/cliente/ordenes/page.jsx - Lista de órdenes de trabajo para clientes
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Calendar,
  Clock,
  Users,
  Eye,
  Search,
  FileText,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  PenTool
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function OrdenesCliente() {
  const [user, setUser] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [ordenesFiltradas, setOrdenesFiltradas] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarOrdenes();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [ordenes, filtros]);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const response = await apiService.obtenerOrdenesTrabajo();
      
      // Manejar diferentes estructuras de respuesta
      let ordenesArray = [];
      if (Array.isArray(response)) {
        ordenesArray = response;
      } else if (response && response.documents && Array.isArray(response.documents)) {
        ordenesArray = response.documents;
      } else if (response && response.success && response.documents) {
        ordenesArray = response.documents;
      }
      
      setOrdenes(ordenesArray);
      console.log('Órdenes cargadas:', ordenesArray);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...ordenes];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(orden =>
        orden.numero?.toLowerCase().includes(busqueda) ||
        orden.cliente?.empresa?.toLowerCase().includes(busqueda) ||
        orden.cliente?.nombre?.toLowerCase().includes(busqueda) ||
        orden.cliente?.direccion?.toLowerCase().includes(busqueda) ||
        orden.tareasRealizadas?.toLowerCase().includes(busqueda) ||
        orden.tecnicos?.some(t => t.nombre?.toLowerCase().includes(busqueda))
      );
    }

    // Filtro por fecha
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultado = resultado.filter(orden => {
        const fechaOrden = new Date(orden.fechaTrabajo || orden.fechaCreacion);
        return fechaOrden >= fechaDesde;
      });
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      resultado = resultado.filter(orden => {
        const fechaOrden = new Date(orden.fechaTrabajo || orden.fechaCreacion);
        return fechaOrden <= fechaHasta;
      });
    }

    setOrdenesFiltradas(resultado);
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

  const formatearHora = (hora) => {
    if (!hora) return null;
    return hora;
  };

  const contarTecnicos = (tecnicos) => {
    if (!tecnicos || !Array.isArray(tecnicos)) return 0;
    return tecnicos.filter(t => t.nombre && t.nombre.trim()).length;
  };

  const tieneFirmas = (orden) => {
    return orden.firmas && (orden.firmas.tecnico?.firma || orden.firmas.cliente?.firma);
  };

  const tienefotos = (orden) => {
    return orden.fotos && Array.isArray(orden.fotos) && orden.fotos.length > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes de trabajo...</p>
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
              Mis Órdenes de Trabajo
            </h1>
            <p className="text-gray-600">
              Consulta los trabajos realizados por IMSSE Ingeniería
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{ordenesFiltradas.length}</p>
            <p className="text-sm text-gray-600">Órdenes</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Buscar</label>
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                placeholder="Número, empresa, técnico, descripción..."
                className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
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
              fechaDesde: '',
              fechaHasta: ''
            })}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="bg-white rounded-lg shadow">
        {ordenesFiltradas.length > 0 ? (
          <div className="overflow-hidden">
            {/* Vista desktop - tabla */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Orden de Trabajo
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Técnicos
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Trabajo
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
                  {ordenesFiltradas.map((orden) => (
                    <tr key={orden.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                              <Shield size={20} className="text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {orden.numero}
                            </div>
                            {orden.cliente?.direccion && (
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin size={12} className="mr-1" />
                                {orden.cliente.direccion.length > 30 
                                  ? `${orden.cliente.direccion.substring(0, 30)}...`
                                  : orden.cliente.direccion
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatearFecha(orden.fechaTrabajo || orden.fechaCreacion)}
                        </div>
                        {(orden.horarioInicio || orden.horarioFin) && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {formatearHora(orden.horarioInicio)} 
                            {orden.horarioInicio && orden.horarioFin && ' - '}
                            {formatearHora(orden.horarioFin)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users size={14} className="mr-1 text-gray-400" />
                          {contarTecnicos(orden.tecnicos)} técnico{contarTecnicos(orden.tecnicos) !== 1 ? 's' : ''}
                        </div>
                        {orden.tecnicos && orden.tecnicos.length > 0 && (
                          <div className="text-sm text-gray-500">
                            {orden.tecnicos[0].nombre}
                            {orden.tecnicos.length > 1 && ` +${orden.tecnicos.length - 1} más`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs text-sm text-gray-900 truncate">
                          {orden.tareasRealizadas || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {tieneFirmas(orden) && (
                            <div className="flex items-center text-green-600" title="Trabajo completado con firmas">
                              <CheckCircle size={16} />
                            </div>
                          )}
                          {tienefotos(orden) && (
                            <div className="flex items-center text-blue-600" title={`${orden.fotos.length} foto(s)`}>
                              <FileText size={16} />
                            </div>
                          )}
                          {!tieneFirmas(orden) && (
                            <div className="flex items-center text-yellow-600" title="Pendiente de firmas">
                              <AlertCircle size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/cliente/ordenes/${orden.id}`}
                          className="p-2 text-blue-600 hover:text-blue-800"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista móvil - cards */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-200">
                {ordenesFiltradas.map((orden) => (
                  <div key={orden.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                          <Shield size={16} className="text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {orden.numero}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatearFecha(orden.fechaTrabajo || orden.fechaCreacion)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {tieneFirmas(orden) && (
                          <CheckCircle size={16} className="text-green-600" title="Completado" />
                        )}
                        {tienefotos(orden) && (
                          <FileText size={16} className="text-blue-600" title={`${orden.fotos.length} foto(s)`} />
                        )}
                        {!tieneFirmas(orden) && (
                          <AlertCircle size={16} className="text-yellow-600" title="Pendiente" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      {orden.cliente?.direccion && (
                        <div className="flex items-center mb-1">
                          <MapPin size={14} className="mr-1 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {orden.cliente.direccion}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center mb-1">
                        <Users size={14} className="mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {contarTecnicos(orden.tecnicos)} técnico{contarTecnicos(orden.tecnicos) !== 1 ? 's' : ''}
                          {orden.tecnicos && orden.tecnicos.length > 0 && `: ${orden.tecnicos[0].nombre}`}
                        </span>
                      </div>
                      
                      {(orden.horarioInicio || orden.horarioFin) && (
                        <div className="flex items-center mb-1">
                          <Clock size={14} className="mr-1 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatearHora(orden.horarioInicio)} 
                            {orden.horarioInicio && orden.horarioFin && ' - '}
                            {formatearHora(orden.horarioFin)}
                          </span>
                        </div>
                      )}
                      
                      {orden.tareasRealizadas && (
                        <div className="text-sm text-gray-600 truncate">
                          <strong>Trabajo:</strong> {orden.tareasRealizadas}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/cliente/ordenes/${orden.id}`}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                      >
                        <Eye size={14} className="mr-1" />
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Shield className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No hay órdenes de trabajo disponibles
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {ordenes.length === 0 
                ? 'Aún no tienes órdenes de trabajo asignadas a tu cuenta.'
                : 'No se encontraron órdenes con los filtros aplicados.'
              }
            </p>
            {ordenes.length === 0 && (
              <div className="mt-6">
                <Link
                  href="mailto:info@imsse.com"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
                >
                  Solicitar Servicio
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="p-6 mt-8 text-center bg-white border border-purple-200 rounded-lg shadow-md">
        <div className="text-sm text-gray-600">
          <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
          <p>Órdenes de trabajo - Sistemas contra incendios</p>
          <p className="mt-2">
            <span className="font-medium">Servicios:</span> Instalación | Mantenimiento | Reparación | Certificación
          </p>
          <p className="mt-2">
            ¿Consultas sobre un trabajo realizado? 
            <Link href="mailto:info@imsse.com" className="ml-1 text-primary hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}