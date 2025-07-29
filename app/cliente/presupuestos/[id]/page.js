// app/cliente/presupuestos/[id]/page.jsx - Detalle de presupuesto corregido
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Download,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';

export default function DetallePresupuestoCliente() {
  const router = useRouter();
  const params = useParams();
  const [presupuesto, setPresupuesto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarPresupuesto();
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [params.id]);

  const cargarPresupuesto = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.obtenerPresupuestoPorId(params.id);
      setPresupuesto(response);
    } catch (error) {
      console.error('Error al cargar presupuesto:', error);
      setError('No se pudo cargar el presupuesto');
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
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${config.color}`}>
        <IconoComponente size={16} className="mr-2" />
        {config.texto}
      </span>
    );
  };

  // Función temporal para manejar descarga PDF
  const handleDescargarPDF = () => {
    // TODO: Implementar generación de PDF
    alert(`Función de PDF en desarrollo.\nPresupuesto: ${presupuesto.numero}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  if (error || !presupuesto) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error al cargar</h2>
          <p className="mt-2 text-gray-600">{error || 'Presupuesto no encontrado'}</p>
          <Link
            href="/cliente/presupuestos"
            className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a presupuestos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/cliente/presupuestos"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver a presupuestos
            </Link>
          </div>
          {/* Comentado temporalmente hasta implementar PDF
          <div className="flex space-x-3">
            <button
              onClick={handleDescargarPDF}
              className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
            >
              <Download size={16} className="mr-2" />
              Descargar PDF
            </button>
          </div>
          */}
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="lg:col-span-2">
          {/* Header del presupuesto */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Presupuesto {presupuesto.numero}
                </h1>
                <p className="text-gray-600">
                  Fecha: {formatearFecha(presupuesto.fecha || presupuesto.fechaCreacion)}
                </p>
              </div>
              <div className="text-right">
                {getEstadoBadge(presupuesto.estado)}
                <p className="mt-2 text-2xl font-bold text-primary">
                  {formatearMonto(presupuesto.total)}
                </p>
              </div>
            </div>
          </div>

          {/* Items del presupuesto */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Detalle de Servicios</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {presupuesto.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 whitespace-pre-line">
                          {item.descripcion}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-gray-900">
                        {item.cantidad}
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-gray-900">
                        {formatearMonto(item.precioUnitario)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-right text-gray-900">
                        {formatearMonto(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="flex justify-end mt-6">
              <div className="w-full max-w-sm">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium">{formatearMonto(presupuesto.subtotal)}</span>
                  </div>
                  {presupuesto.mostrarIva && presupuesto.iva > 0 && (
                    <div className="flex justify-between py-2 text-sm border-b border-gray-300">
                      <span className="text-gray-700">IVA (21%):</span>
                      <span className="font-medium">{formatearMonto(presupuesto.iva)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 text-lg font-bold text-primary">
                    <span>TOTAL:</span>
                    <span>{formatearMonto(presupuesto.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {presupuesto.observaciones && (
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Observaciones</h2>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {presupuesto.observaciones}
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
              {presupuesto.cliente?.empresa && (
                <div className="flex items-center">
                  <Building size={16} className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {presupuesto.cliente.empresa}
                    </p>
                    <p className="text-xs text-gray-500">Empresa</p>
                  </div>
                </div>
              )}

              {presupuesto.cliente?.nombre && (
                <div className="flex items-center">
                  <User size={16} className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {presupuesto.cliente.nombre}
                    </p>
                    <p className="text-xs text-gray-500">Contacto</p>
                  </div>
                </div>
              )}

              {presupuesto.cliente?.email && (
                <div className="flex items-center">
                  <Mail size={16} className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {presupuesto.cliente.email}
                    </p>
                    <p className="text-xs text-gray-500">Email</p>
                  </div>
                </div>
              )}

              {presupuesto.cliente?.telefono && (
                <div className="flex items-center">
                  <Phone size={16} className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {presupuesto.cliente.telefono}
                    </p>
                    <p className="text-xs text-gray-500">Teléfono</p>
                  </div>
                </div>
              )}

              {presupuesto.cliente?.direccion && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {presupuesto.cliente.direccion}
                    </p>
                    <p className="text-xs text-gray-500">Dirección</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del presupuesto */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Detalles del Presupuesto</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Número:</span>
                <span className="text-sm font-medium text-gray-900">{presupuesto.numero}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fecha:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatearFecha(presupuesto.fecha || presupuesto.fechaCreacion)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado:</span>
                {getEstadoBadge(presupuesto.estado)}
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Items:</span>
                <span className="text-sm font-medium text-gray-900">
                  {presupuesto.items?.length || 0}
                </span>
              </div>
              
              {presupuesto.fechaModificacion && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Última modificación:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatearFecha(presupuesto.fechaModificacion)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Información de estado */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Estado del Presupuesto</h2>
            
            <div className="space-y-4">
              {presupuesto.estado === 'pendiente' && (
                <div className="p-4 border border-yellow-200 rounded-md bg-yellow-50">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Presupuesto Pendiente</p>
                      <p className="text-xs text-yellow-700">
                        Este presupuesto está siendo revisado por nuestro equipo.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {presupuesto.estado === 'aprobado' && (
                <div className="p-4 border border-green-200 rounded-md bg-green-50">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Presupuesto Aprobado</p>
                      <p className="text-xs text-green-700">
                        Puedes proceder con la contratación del servicio.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {presupuesto.estado === 'rechazado' && (
                <div className="p-4 border border-red-200 rounded-md bg-red-50">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Presupuesto Rechazado</p>
                      <p className="text-xs text-red-700">
                        Por favor contacta con nuestro equipo para más información.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {presupuesto.estado === 'borrador' && (
                <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Borrador</p>
                      <p className="text-xs text-gray-700">
                        Este presupuesto está en proceso de elaboración.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comentado: Botón de descarga PDF
              <button
                onClick={handleDescargarPDF}
                className="flex items-center justify-center w-full px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
              >
                <Download size={16} className="mr-2" />
                Descargar PDF
              </button>
              */}
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
            ¿Necesitas ayuda con este presupuesto? 
            <Link 
              href={`mailto:info@imsse.com?subject=Consulta sobre presupuesto ${presupuesto.numero}`}
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