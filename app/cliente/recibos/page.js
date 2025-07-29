// app/cliente/recibos/page.jsx - Lista de recibos para clientes
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Calendar,
  DollarSign,
  Eye,
  Search,
  User,
  FileText
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function RecibosCliente() {
  const [user, setUser] = useState(null);
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [recibosFiltrados, setRecibosFiltrados] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarRecibos();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [recibos, filtros]);

  const cargarRecibos = async () => {
    try {
      setLoading(true);
      const response = await apiService.obtenerRecibos();
      
      // Manejar diferentes estructuras de respuesta
      let recibosArray = [];
      if (Array.isArray(response)) {
        recibosArray = response;
      } else if (response && response.documents && Array.isArray(response.documents)) {
        recibosArray = response.documents;
      } else if (response && response.success && response.documents) {
        recibosArray = response.documents;
      }
      
      setRecibos(recibosArray);
      console.log('Recibos cargados:', recibosArray);
    } catch (error) {
      console.error('Error al cargar recibos:', error);
      setRecibos([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...recibos];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(recibo =>
        recibo.numero?.toLowerCase().includes(busqueda) ||
        recibo.recibiDe?.toLowerCase().includes(busqueda) ||
        recibo.concepto?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por fecha
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultado = resultado.filter(recibo => {
        const fechaRecibo = new Date(recibo.fecha || recibo.fechaCreacion);
        return fechaRecibo >= fechaDesde;
      });
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      resultado = resultado.filter(recibo => {
        const fechaRecibo = new Date(recibo.fecha || recibo.fechaCreacion);
        return fechaRecibo <= fechaHasta;
      });
    }

    setRecibosFiltrados(resultado);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando recibos...</p>
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
              Mis Recibos
            </h1>
            <p className="text-gray-600">
              Consulta tus recibos de pago de IMSSE Ingeniería
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{recibosFiltrados.length}</p>
            <p className="text-sm text-gray-600">Recibos</p>
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
                placeholder="Número, concepto..."
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

      {/* Lista de recibos */}
      <div className="bg-white rounded-lg shadow">
        {recibosFiltrados.length > 0 ? (
          <div className="overflow-hidden">
            {/* Vista desktop - tabla */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Recibo
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Concepto
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recibosFiltrados.map((recibo) => (
                    <tr key={recibo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                              <Receipt size={20} className="text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {recibo.numero}
                            </div>
                            <div className="text-sm text-gray-500">
                              Recibí de: {recibo.recibiDe}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatearFecha(recibo.fecha || recibo.fechaCreacion)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatearMonto(recibo.monto)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs text-sm text-gray-900 truncate">
                          {recibo.concepto || 'Sin concepto especificado'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/cliente/recibos/${recibo.id}`}
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
                {recibosFiltrados.map((recibo) => (
                  <div key={recibo.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <Receipt size={16} className="text-green-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {recibo.numero}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatearFecha(recibo.fecha || recibo.fechaCreacion)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-lg font-bold text-gray-900">
                        {formatearMonto(recibo.monto)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Recibí de: {recibo.recibiDe}
                      </p>
                      {recibo.concepto && (
                        <p className="text-sm text-gray-600 truncate">
                          {recibo.concepto}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/cliente/recibos/${recibo.id}`}
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
            <Receipt className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No hay recibos disponibles
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {recibos.length === 0 
                ? 'Aún no tienes recibos asignados a tu cuenta.'
                : 'No se encontraron recibos con los filtros aplicados.'
              }
            </p>
            {recibos.length === 0 && (
              <div className="mt-6">
                <Link
                  href="mailto:info@imsse.com"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
                >
                  Consultar Pagos
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
            ¿Consultas sobre un recibo? 
            <Link href="mailto:info@imsse.com" className="ml-1 text-primary hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}