// app/cliente/estados/page.jsx - Lista de estados de cuenta para clientes
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Eye,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function EstadosCuentaCliente() {
  const [user, setUser] = useState(null);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [estadosFiltrados, setEstadosFiltrados] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarEstados();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [estados, filtros]);

  const cargarEstados = async () => {
    try {
      setLoading(true);
      const response = await apiService.obtenerEstadosCuenta();
      
      // Manejar diferentes estructuras de respuesta
      let estadosArray = [];
      if (Array.isArray(response)) {
        estadosArray = response;
      } else if (response && response.documents && Array.isArray(response.documents)) {
        estadosArray = response.documents;
      } else if (response && response.success && response.documents) {
        estadosArray = response.documents;
      }
      
      setEstados(estadosArray);
      console.log('Estados de cuenta cargados:', estadosArray);
    } catch (error) {
      console.error('Error al cargar estados:', error);
      setEstados([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...estados];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(estado =>
        estado.numero?.toLowerCase().includes(busqueda) ||
        estado.periodo?.desde?.includes(busqueda) ||
        estado.periodo?.hasta?.includes(busqueda) ||
        (estado.cliente?.empresa && estado.cliente.empresa.toLowerCase().includes(busqueda))
      );
    }

    // Filtro por fecha
    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde);
      resultado = resultado.filter(estado => {
        const fechaEstado = new Date(estado.periodo?.desde || estado.fechaCreacion);
        return fechaEstado >= fechaDesde;
      });
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta);
      resultado = resultado.filter(estado => {
        const fechaEstado = new Date(estado.periodo?.hasta || estado.fechaCreacion);
        return fechaEstado <= fechaHasta;
      });
    }

    setEstadosFiltrados(resultado);
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

  const getSaldoBadge = (saldo) => {
    if (saldo > 0) {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icono: TrendingUp,
        texto: 'A favor empresa',
        valor: saldo
      };
    } else if (saldo < 0) {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icono: TrendingDown,
        texto: 'A favor cliente',
        valor: Math.abs(saldo)
      };
    } else {
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icono: CheckCircle,
        texto: 'Saldado',
        valor: 0
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando estados de cuenta...</p>
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
              Mis Estados de Cuenta
            </h1>
            <p className="text-gray-600">
              Consulta tus estados de cuenta y movimientos de IMSSE Ingeniería
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{estadosFiltrados.length}</p>
            <p className="text-sm text-gray-600">Estados</p>
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
                placeholder="Número, período..."
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

      {/* Lista de estados de cuenta */}
      <div className="bg-white rounded-lg shadow">
        {estadosFiltrados.length > 0 ? (
          <div className="overflow-hidden">
            {/* Vista desktop - tabla */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Estado de Cuenta
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Período
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Saldo Actual
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
                  {estadosFiltrados.map((estado) => {
                    const saldoInfo = getSaldoBadge(estado.saldoActual || 0);
                    const IconoSaldo = saldoInfo.icono;

                    return (
                      <tr key={estado.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                                <CreditCard size={20} className="text-orange-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {estado.numero}
                              </div>
                              {estado.observaciones && (
                                <div className="max-w-xs text-sm text-gray-500 truncate">
                                  {estado.observaciones}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">
                              {formatearFecha(estado.periodo?.desde)} - {formatearFecha(estado.periodo?.hasta)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {estado.movimientos?.length || 0} movimientos
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatearMonto(estado.saldoActual)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${saldoInfo.color}`}>
                            <IconoSaldo size={12} className="mr-1" />
                            {saldoInfo.texto}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/cliente/estados/${estado.id}`}
                            className="p-2 text-blue-600 hover:text-blue-800"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Vista móvil - cards */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-200">
                {estadosFiltrados.map((estado) => {
                  const saldoInfo = getSaldoBadge(estado.saldoActual || 0);
                  const IconoSaldo = saldoInfo.icono;

                  return (
                    <div key={estado.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                            <CreditCard size={16} className="text-orange-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {estado.numero}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatearFecha(estado.periodo?.desde)} - {formatearFecha(estado.periodo?.hasta)}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${saldoInfo.color}`}>
                          <IconoSaldo size={12} className="mr-1" />
                          {saldoInfo.texto}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-lg font-bold text-gray-900">
                          {formatearMonto(estado.saldoActual)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {estado.movimientos?.length || 0} movimientos en el período
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <Link
                          href={`/cliente/estados/${estado.id}`}
                          className="flex items-center px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                        >
                          <Eye size={14} className="mr-1" />
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <CreditCard className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No hay estados de cuenta disponibles
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {estados.length === 0 
                ? 'Aún no tienes estados de cuenta asignados a tu cuenta.'
                : 'No se encontraron estados con los filtros aplicados.'
              }
            </p>
            {estados.length === 0 && (
              <div className="mt-6">
                <Link
                  href="mailto:info@imsse.com"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
                >
                  Solicitar Estado de Cuenta
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
            ¿Necesitas ayuda con un estado de cuenta? 
            <Link href="mailto:info@imsse.com" className="ml-1 text-primary hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}