// app/cliente/remitos/page.jsx - Lista de remitos para clientes
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Calendar,
  Truck,
  Eye,
  Search,
  FileText,
  MapPin,
  Hash,
  Clock
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function RemitosCliente() {
  const [user, setUser] = useState(null);
  const [remitos, setRemitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [remitosFiltrados, setRemitosFiltrados] = useState([]);

  const estados = [
    { valor: '', label: 'Todos los estados' },
    { valor: 'pendiente', label: 'Pendiente', color: 'yellow' },
    { valor: 'en_transito', label: 'En Tránsito', color: 'blue' },
    { valor: 'entregado', label: 'Entregado', color: 'green' }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarRemitos();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [remitos, filtros]);

  const cargarRemitos = async () => {
    try {
      setLoading(true);
      const response = await apiService.obtenerRemitos();
      
      // Manejar diferentes estructuras de respuesta
      let remitosArray = [];
      if (Array.isArray(response)) {
        remitosArray = response;
      } else if (response && response.documents && Array.isArray(response.documents)) {
        remitosArray = response.documents;
      } else if (response && response.success && response.documents) {
        remitosArray = response.documents;
      }
      
      setRemitos(remitosArray);
      console.log('Remitos cargados:', remitosArray);
    } catch (error) {
      console.error('Error al cargar remitos:', error);
      setRemitos([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...remitos];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(remito =>
        remito.numero?.toLowerCase().includes(busqueda) ||
        remito.destino?.toLowerCase().includes(busqueda) ||
        remito.transportista?.toLowerCase().includes(busqueda) ||
        remito.cliente?.empresa?.toLowerCase().includes(busqueda) ||
        remito.cliente?.nombre?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por estado
    if (filtros.estado) {
      resultado = resultado.filter(remito => remito.estado === filtros.estado);
    }

    // Filtro por fecha
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultado = resultado.filter(remito => {
        const fechaRemito = new Date(remito.fecha || remito.fechaCreacion);
        return fechaRemito >= fechaDesde;
      });
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      resultado = resultado.filter(remito => {
        const fechaRemito = new Date(remito.fecha || remito.fechaCreacion);
        return fechaRemito <= fechaHasta;
      });
    }

    setRemitosFiltrados(resultado);
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

  const getEstadoColor = (estado) => {
    const estadoInfo = estados.find(e => e.valor === estado);
    return estadoInfo?.color || 'gray';
  };

  const getEstadoLabel = (estado) => {
    const estadoInfo = estados.find(e => e.valor === estado);
    return estadoInfo?.label || estado;
  };

  const contarTotalItems = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + parseInt(item.cantidad || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando remitos...</p>
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
              Mis Remitos
            </h1>
            <p className="text-gray-600">
              Consulta tus entregas de equipos contra incendios de IMSSE
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{remitosFiltrados.length}</p>
            <p className="text-sm text-gray-600">Remitos</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Buscar</label>
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                placeholder="Número, destino, transportista..."
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
              {estados.map(estado => (
                <option key={estado.valor} value={estado.valor}>
                  {estado.label}
                </option>
              ))}
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
              estado: '',
              fechaDesde: '',
              fechaHasta: ''
            })}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Lista de remitos */}
      <div className="bg-white rounded-lg shadow">
        {remitosFiltrados.length > 0 ? (
          <div className="overflow-hidden">
            {/* Vista desktop - tabla */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Remito
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Destino
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Items
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {remitosFiltrados.map((remito) => (
                    <tr key={remito.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                              <Package size={20} className="text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {remito.numero}
                            </div>
                            {remito.transportista && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Truck size={12} className="mr-1" />
                                {remito.transportista}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatearFecha(remito.fecha || remito.fechaCreacion)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getEstadoColor(remito.estado) === 'green' ? 'bg-green-100 text-green-800' :
                          getEstadoColor(remito.estado) === 'blue' ? 'bg-blue-100 text-blue-800' :
                          getEstadoColor(remito.estado) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getEstadoLabel(remito.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {remito.destino || 'No especificado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <Hash size={14} className="mr-1 text-gray-400" />
                          {contarTotalItems(remito.items)} equipos
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/cliente/remitos/${remito.id}`}
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
                {remitosFiltrados.map((remito) => (
                  <div key={remito.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <Package size={16} className="text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {remito.numero}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatearFecha(remito.fecha || remito.fechaCreacion)}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getEstadoColor(remito.estado) === 'green' ? 'bg-green-100 text-green-800' :
                        getEstadoColor(remito.estado) === 'blue' ? 'bg-blue-100 text-blue-800' :
                        getEstadoColor(remito.estado) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getEstadoLabel(remito.estado)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center mb-1">
                        <MapPin size={14} className="mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {remito.destino || 'Destino no especificado'}
                        </span>
                      </div>
                      <div className="flex items-center mb-1">
                        <Hash size={14} className="mr-1 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {contarTotalItems(remito.items)} equipos
                        </span>
                      </div>
                      {remito.transportista && (
                        <div className="flex items-center">
                          <Truck size={14} className="mr-1 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {remito.transportista}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/cliente/remitos/${remito.id}`}
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
            <Package className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No hay remitos disponibles
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {remitos.length === 0 
                ? 'Aún no tienes remitos asignados a tu cuenta.'
                : 'No se encontraron remitos con los filtros aplicados.'
              }
            </p>
            {remitos.length === 0 && (
              <div className="mt-6">
                <Link
                  href="mailto:info@imsse.com"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
                >
                  Consultar Entregas
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
          <p>Sistema de entregas de equipos contra incendios</p>
          <p className="mt-2">
            <span className="font-medium">Especialistas en:</span> Detección | Supresión | Rociadores | Alarmas
          </p>
          <p className="mt-2">
            ¿Consultas sobre una entrega? 
            <Link href="mailto:info@imsse.com" className="ml-1 text-primary hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}