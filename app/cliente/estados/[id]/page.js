// app/cliente/estados/[id]/page.jsx - Detalle de estado de cuenta para cliente
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  DollarSign,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  FileText,
  Receipt,
  CreditCard as CardIcon,
  Minus,
  Plus
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';

export default function DetalleEstadoCuentaCliente() {
  const router = useRouter();
  const params = useParams();
  const [estadoCuenta, setEstadoCuenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarEstadoCuenta();
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [params.id]);

  const cargarEstadoCuenta = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.obtenerEstadoCuentaPorId(params.id);
      setEstadoCuenta(response);
    } catch (error) {
      console.error('Error al cargar estado de cuenta:', error);
      setError('No se pudo cargar el estado de cuenta');
    } finally {
      setLoading(false);
    }
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

  const getTipoMovimientoIcon = (tipo) => {
    const tipos = {
      factura: { icono: FileText, color: 'text-blue-600', nombre: 'Factura' },
      pago: { icono: DollarSign, color: 'text-green-600', nombre: 'Pago' },
      nota_credito: { icono: Minus, color: 'text-green-600', nombre: 'Nota Crédito' },
      nota_debito: { icono: Plus, color: 'text-red-600', nombre: 'Nota Débito' },
      ajuste: { icono: CardIcon, color: 'text-orange-600', nombre: 'Ajuste' }
    };
    
    return tipos[tipo] || tipos.factura;
  };

  const getSaldoBadge = (saldo) => {
    if (saldo > 0) {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icono: TrendingUp,
        texto: 'A favor empresa',
        descripcion: 'Saldo deudor'
      };
    } else if (saldo < 0) {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icono: TrendingDown,
        texto: 'A favor cliente',
        descripcion: 'Saldo acreedor'
      };
    } else {
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icono: CheckCircle,
        texto: 'Saldado',
        descripcion: 'Sin saldo pendiente'
      };
    }
  };

  const calcularTotales = () => {
    const movimientos = estadoCuenta?.movimientos || [];
    return {
      totalDebe: movimientos.reduce((sum, mov) => sum + (mov.debe || 0), 0),
      totalHaber: movimientos.reduce((sum, mov) => sum + (mov.haber || 0), 0),
      cantidadMovimientos: movimientos.length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando estado de cuenta...</p>
        </div>
      </div>
    );
  }

  if (error || !estadoCuenta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error al cargar</h2>
          <p className="mt-2 text-gray-600">{error || 'Estado de cuenta no encontrado'}</p>
          <Link
            href="/cliente/estados"
            className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a estados
          </Link>
        </div>
      </div>
    );
  }

  const saldoInfo = getSaldoBadge(estadoCuenta.saldoActual || 0);
  const IconoSaldo = saldoInfo.icono;
  const totales = calcularTotales();

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/cliente/estados"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver a estados
            </Link>
          </div>
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="lg:col-span-2">
          {/* Header del estado de cuenta */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Estado de Cuenta {estadoCuenta.numero}
                </h1>
                <p className="text-gray-600">
                  Período: {formatearFecha(estadoCuenta.periodo?.desde)} - {formatearFecha(estadoCuenta.periodo?.hasta)}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${saldoInfo.color}`}>
                  <IconoSaldo size={16} className="mr-2" />
                  {saldoInfo.texto}
                </span>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {formatearMonto(estadoCuenta.saldoActual)}
                </p>
                <p className="text-xs text-gray-500">{saldoInfo.descripcion}</p>
              </div>
            </div>
          </div>

          {/* Resumen del período */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Resumen del Período</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatearMonto(estadoCuenta.saldoAnterior || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Saldo Anterior</p>
                </div>
              </div>
              
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-700">
                    {formatearMonto(totales.totalDebe)}
                  </p>
                  <p className="text-sm text-red-600">Total Debe</p>
                </div>
              </div>
              
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {formatearMonto(totales.totalHaber)}
                  </p>
                  <p className="text-sm text-green-600">Total Haber</p>
                </div>
              </div>
              
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {totales.cantidadMovimientos}
                  </p>
                  <p className="text-sm text-blue-600">Movimientos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Movimientos del período */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Movimientos del Período</h2>
            
            {estadoCuenta.movimientos && estadoCuenta.movimientos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Número
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Concepto
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                        Debe
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                        Haber
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {estadoCuenta.movimientos.map((movimiento, index) => {
                      const tipoInfo = getTipoMovimientoIcon(movimiento.tipo);
                      const IconoTipo = tipoInfo.icono;

                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {formatearFecha(movimiento.fecha)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <IconoTipo size={16} className={`mr-2 ${tipoInfo.color}`} />
                              <span className="text-sm text-gray-900">
                                {tipoInfo.nombre}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {movimiento.numero || '-'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {movimiento.concepto}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-right">
                            {movimiento.debe > 0 ? (
                              <span className="font-medium text-red-600">
                                {formatearMonto(movimiento.debe)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-right">
                            {movimiento.haber > 0 ? (
                              <span className="font-medium text-green-600">
                                {formatearMonto(movimiento.haber)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td colSpan="4" className="px-4 py-3 text-sm font-medium text-gray-900">
                        TOTALES DEL PERÍODO
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-red-700">
                        {formatearMonto(totales.totalDebe)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-right text-green-700">
                        {formatearMonto(totales.totalHaber)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center">
                <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Sin movimientos
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No hay movimientos registrados en este período.
                </p>
              </div>
            )}
          </div>

          {/* Observaciones */}
          {estadoCuenta.observaciones && (
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Observaciones</h2>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {estadoCuenta.observaciones}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Información del cliente */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Información del Cliente</h2>
            
            <div className="space-y-4">
              {estadoCuenta.cliente?.empresa && (
                <div className="flex items-center">
                  <Building size={16} className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {estadoCuenta.cliente.empresa}
                    </p>
                    <p className="text-xs text-gray-500">Empresa</p>
                  </div>
                </div>
              )}

              {estadoCuenta.cliente?.nombre && (
                <div className="flex items-center">
                  <User size={16} className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {estadoCuenta.cliente.nombre}
                    </p>
                    <p className="text-xs text-gray-500">Contacto</p>
                  </div>
                </div>
              )}

              {estadoCuenta.cliente?.email && (
                <div className="flex items-center">
                  <Mail size={16} className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {estadoCuenta.cliente.email}
                    </p>
                    <p className="text-xs text-gray-500">Email</p>
                  </div>
                </div>
              )}

              {estadoCuenta.cliente?.telefono && (
                <div className="flex items-center">
                  <Phone size={16} className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {estadoCuenta.cliente.telefono}
                    </p>
                    <p className="text-xs text-gray-500">Teléfono</p>
                  </div>
                </div>
              )}

              {estadoCuenta.cliente?.direccion && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {estadoCuenta.cliente.direccion}
                    </p>
                    <p className="text-xs text-gray-500">Dirección</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del estado */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Detalles del Estado</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Número:</span>
                <span className="text-sm font-medium text-gray-900">{estadoCuenta.numero}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Período:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatearFecha(estadoCuenta.periodo?.desde)} - {formatearFecha(estadoCuenta.periodo?.hasta)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado del saldo:</span>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${saldoInfo.color}`}>
                  <IconoSaldo size={12} className="mr-1" />
                  {saldoInfo.texto}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Movimientos:</span>
                <span className="text-sm font-medium text-gray-900">
                  {totales.cantidadMovimientos}
                </span>
              </div>
              
              {estadoCuenta.fechaModificacion && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Última modificación:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatearFecha(estadoCuenta.fechaModificacion)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Información del saldo */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Estado del Saldo</h2>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-md ${saldoInfo.color.replace('text-', 'bg-').replace('-800', '-50').replace('border-', 'border-')}`}>
                <div className="flex items-center">
                  <IconoSaldo className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm font-medium">{saldoInfo.texto}</p>
                    <p className="text-xs">{saldoInfo.descripcion}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-lg font-bold">
                    {formatearMonto(Math.abs(estadoCuenta.saldoActual || 0))}
                  </p>
                </div>
              </div>

              {estadoCuenta.saldoActual !== 0 && (
                <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
                  <p className="text-xs text-blue-800">
                    <strong>Información:</strong> {
                      estadoCuenta.saldoActual > 0 
                        ? 'Existe un saldo pendiente de pago a favor de IMSSE.'
                        : 'Existe un saldo a su favor que será aplicado en próximas operaciones.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="p-6 mt-8 text-center bg-white border border-blue-200 rounded-lg shadow-md">
        <div className="text-sm text-gray-600">
          <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
          <p>Sistemas de protección contra incendios</p>
          <p className="mt-2">
            ¿Consultas sobre este estado de cuenta? 
            <Link 
              href={`mailto:info@imsse.com?subject=Consulta sobre estado de cuenta ${estadoCuenta.numero}`}
              className="ml-1 text-primary hover:underline"
            >
              Contáctanos
            </Link>
          </p>
          <div className="mt-4 space-y-1">
            <p>📧 info@imsse.com</p>
            <p>📞 +54 351 123 4567</p>
            <p>📍 Córdoba, Argentina</p>
          </div>
        </div>
      </div>
    </div>
  );
}