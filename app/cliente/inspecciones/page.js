// app/cliente/inspecciones/page.jsx - Lista de visitas técnicas para clientes
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Clock,
  Users,
  Eye,
  Search,
  FileText,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  ClipboardCheck
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function InspeccionesCliente() {
  const [user, setUser] = useState(null);
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [inspeccionesFiltradas, setInspeccionesFiltradas] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarInspecciones();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [inspecciones, filtros]);

  const cargarInspecciones = async () => {
    try {
      setLoading(true);
      const response = await apiService.obtenerInspeccionesTecnicas();

      // Manejar diferentes estructuras de respuesta
      let inspeccionesArray = [];
      if (Array.isArray(response)) {
        inspeccionesArray = response;
      } else if (response && response.documents && Array.isArray(response.documents)) {
        inspeccionesArray = response.documents;
      } else if (response && response.success && response.documents) {
        inspeccionesArray = response.documents;
      }

      setInspecciones(inspeccionesArray);
    } catch (error) {
      console.error('Error al cargar inspecciones:', error);
      setInspecciones([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...inspecciones];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(inspeccion =>
        inspeccion.numero?.toLowerCase().includes(busqueda) ||
        inspeccion.cliente?.empresa?.toLowerCase().includes(busqueda) ||
        inspeccion.cliente?.nombre?.toLowerCase().includes(busqueda) ||
        inspeccion.cliente?.direccion?.toLowerCase().includes(busqueda) ||
        inspeccion.observaciones?.toLowerCase().includes(busqueda) ||
        inspeccion.planillasAdjuntas?.some(p => p.titulo?.toLowerCase().includes(busqueda)) ||
        inspeccion.tecnicos?.some(t => t.nombre?.toLowerCase().includes(busqueda))
      );
    }

    // Filtro por fecha
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultado = resultado.filter(inspeccion => {
        const fechaInspeccion = new Date(inspeccion.fechaTrabajo || inspeccion.fechaCreacion);
        return fechaInspeccion >= fechaDesde;
      });
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      resultado = resultado.filter(inspeccion => {
        const fechaInspeccion = new Date(inspeccion.fechaTrabajo || inspeccion.fechaCreacion);
        return fechaInspeccion <= fechaHasta;
      });
    }

    setInspeccionesFiltradas(resultado);
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

  const tieneFirmas = (inspeccion) => {
    return inspeccion.firmas && (inspeccion.firmas.tecnico?.firma || inspeccion.firmas.cliente?.firma);
  };

  const tieneFotos = (inspeccion) => {
    return inspeccion.fotos && Array.isArray(inspeccion.fotos) && inspeccion.fotos.length > 0;
  };

  const resumenChecklist = (inspeccion) => {
    const planillas = inspeccion.planillasAdjuntas;
    if (planillas && planillas.length > 0) {
      return planillas.map(p => p.titulo).filter(Boolean).join(', ');
    }
    return inspeccion.observaciones || 'Sin descripción';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando visitas técnicas...</p>
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
              Mis Visitas Técnicas
            </h1>
            <p className="text-gray-600">
              Consultá las inspecciones realizadas por IMSSE Ingeniería
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{inspeccionesFiltradas.length}</p>
            <p className="text-sm text-gray-600">Visitas</p>
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
                placeholder="Número, empresa, técnico, planilla..."
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

      {/* Lista de inspecciones */}
      <div className="bg-white rounded-lg shadow">
        {inspeccionesFiltradas.length > 0 ? (
          <div className="overflow-hidden">
            {/* Vista desktop - tabla */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Visita Técnica
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Técnicos
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Checklist
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
                  {inspeccionesFiltradas.map((inspeccion) => (
                    <tr key={inspeccion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                              <Shield size={20} className="text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {inspeccion.numero}
                            </div>
                            {inspeccion.cliente?.direccion && (
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin size={12} className="mr-1" />
                                {inspeccion.cliente.direccion.length > 30
                                  ? `${inspeccion.cliente.direccion.substring(0, 30)}...`
                                  : inspeccion.cliente.direccion
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatearFecha(inspeccion.fechaTrabajo || inspeccion.fechaCreacion)}
                        </div>
                        {(inspeccion.horarioInicio || inspeccion.horarioFin) && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {formatearHora(inspeccion.horarioInicio)}
                            {inspeccion.horarioInicio && inspeccion.horarioFin && ' - '}
                            {formatearHora(inspeccion.horarioFin)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users size={14} className="mr-1 text-gray-400" />
                          {contarTecnicos(inspeccion.tecnicos)} técnico{contarTecnicos(inspeccion.tecnicos) !== 1 ? 's' : ''}
                        </div>
                        {inspeccion.tecnicos && inspeccion.tecnicos.length > 0 && (
                          <div className="text-sm text-gray-500">
                            {inspeccion.tecnicos[0].nombre}
                            {inspeccion.tecnicos.length > 1 && ` +${inspeccion.tecnicos.length - 1} más`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center max-w-xs text-sm text-gray-900">
                          <ClipboardCheck size={14} className="flex-shrink-0 mr-1 text-gray-400" />
                          <span className="truncate">{resumenChecklist(inspeccion)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {tieneFirmas(inspeccion) && (
                            <div className="flex items-center text-green-600" title="Visita completada con firmas">
                              <CheckCircle size={16} />
                            </div>
                          )}
                          {tieneFotos(inspeccion) && (
                            <div className="flex items-center text-blue-600" title={`${inspeccion.fotos.length} foto(s)`}>
                              <FileText size={16} />
                            </div>
                          )}
                          {!tieneFirmas(inspeccion) && (
                            <div className="flex items-center text-yellow-600" title="Pendiente de firmas">
                              <AlertCircle size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/cliente/inspecciones/${inspeccion.id}`}
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
                {inspeccionesFiltradas.map((inspeccion) => (
                  <div key={inspeccion.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                          <Shield size={16} className="text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {inspeccion.numero}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatearFecha(inspeccion.fechaTrabajo || inspeccion.fechaCreacion)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {tieneFirmas(inspeccion) && (
                          <CheckCircle size={16} className="text-green-600" title="Completado" />
                        )}
                        {tieneFotos(inspeccion) && (
                          <FileText size={16} className="text-blue-600" title={`${inspeccion.fotos.length} foto(s)`} />
                        )}
                        {!tieneFirmas(inspeccion) && (
                          <AlertCircle size={16} className="text-yellow-600" title="Pendiente" />
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      {inspeccion.cliente?.direccion && (
                        <div className="flex items-center mb-1">
                          <MapPin size={14} className="mr-1 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {inspeccion.cliente.direccion}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center mb-1">
                        <Users size={14} className="mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {contarTecnicos(inspeccion.tecnicos)} técnico{contarTecnicos(inspeccion.tecnicos) !== 1 ? 's' : ''}
                          {inspeccion.tecnicos && inspeccion.tecnicos.length > 0 && `: ${inspeccion.tecnicos[0].nombre}`}
                        </span>
                      </div>

                      {(inspeccion.horarioInicio || inspeccion.horarioFin) && (
                        <div className="flex items-center mb-1">
                          <Clock size={14} className="mr-1 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatearHora(inspeccion.horarioInicio)}
                            {inspeccion.horarioInicio && inspeccion.horarioFin && ' - '}
                            {formatearHora(inspeccion.horarioFin)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-start mb-1">
                        <ClipboardCheck size={14} className="mt-0.5 mr-1 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate">
                          {resumenChecklist(inspeccion)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/cliente/inspecciones/${inspeccion.id}`}
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
              No hay visitas técnicas disponibles
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {inspecciones.length === 0
                ? 'Aún no tenés visitas técnicas asignadas a tu cuenta.'
                : 'No se encontraron inspecciones con los filtros aplicados.'
              }
            </p>
            {inspecciones.length === 0 && (
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
          <p>Visita Técnica - Sistemas contra incendios</p>
          <p className="mt-2">
            <span className="font-medium">Servicios:</span> Instalación | Mantenimiento | Reparación | Certificación
          </p>
          <p className="mt-2">
            ¿Consultas sobre una visita realizada?
            <Link href="mailto:info@imsse.com" className="ml-1 text-primary hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
