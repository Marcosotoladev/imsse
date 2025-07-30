// app/cliente/remitos/[id]/page.jsx - Detalle de remito para cliente
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  Truck,
  FileText,
  Hash,
  User,
  Building2,
  PenTool,
  XCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';

export default function DetalleRemitoCliente() {
  const router = useRouter();
  const params = useParams();
  const [remito, setRemito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const estados = {
    'pendiente': { label: 'Pendiente', color: 'yellow', icon: Clock },
    'en_transito': { label: 'En Tránsito', color: 'blue', icon: Truck },
    'entregado': { label: 'Entregado', color: 'green', icon: CheckCircle }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarRemito();
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [params.id]);

  const cargarRemito = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.obtenerRemitoPorId(params.id);
      setRemito(response);
    } catch (error) {
      console.error('Error al cargar remito:', error);
      setError('No se pudo cargar el remito');
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

  const getEstadoInfo = (estado) => {
    return estados[estado] || { label: estado, color: 'gray', icon: FileText };
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
          <p className="mt-4 text-gray-600">Cargando remito...</p>
        </div>
      </div>
    );
  }

  if (error || !remito) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error al cargar</h2>
          <p className="mt-2 text-gray-600">{error || 'Remito no encontrado'}</p>
          <Link
            href="/cliente/remitos"
            className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a remitos
          </Link>
        </div>
      </div>
    );
  }

  const estadoInfo = getEstadoInfo(remito.estado);
  const EstadoIcon = estadoInfo.icon;

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/cliente/remitos"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver a remitos
            </Link>
          </div>
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="lg:col-span-2">
          {/* Header del remito */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Remito {remito.numero}
                </h1>
                <p className="text-gray-600">
                  Fecha: {formatearFecha(remito.fecha || remito.fechaCreacion)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                  <Package size={32} className="text-blue-600" />
                </div>
                <div className="mt-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    estadoInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                    estadoInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    estadoInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {estadoInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          {remito.cliente && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <User className="mr-2" size={20} />
                Información del Cliente
              </h2>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Contacto:
                  </label>
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-900">{remito.cliente.nombre}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Empresa:
                  </label>
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-900">{remito.cliente.empresa}</p>
                  </div>
                </div>

                {remito.cliente.email && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Email:
                    </label>
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900">{remito.cliente.email}</p>
                    </div>
                  </div>
                )}

                {remito.cliente.telefono && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Teléfono:
                    </label>
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900">{remito.cliente.telefono}</p>
                    </div>
                  </div>
                )}

                {remito.cliente.direccion && (
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Dirección:
                    </label>
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900">{remito.cliente.direccion}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipos entregados */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <Package className="mr-2" size={20} />
              Equipos Contra Incendios ({contarTotalItems(remito.items)} total)
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Unidad
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {remito.items && remito.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 whitespace-pre-line">
                          {item.descripcion}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.cantidad}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.unidad}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Información de entrega */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <Truck className="mr-2" size={20} />
              Información de Entrega
            </h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {remito.destino && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Destino:
                  </label>
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-900">{remito.destino}</p>
                  </div>
                </div>
              )}

              {remito.transportista && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Transportista:
                  </label>
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-900">{remito.transportista}</p>
                  </div>
                </div>
              )}
            </div>

            {remito.observaciones && (
              <div className="mt-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Observaciones:
                </label>
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-900 whitespace-pre-line">
                    {remito.observaciones}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Firma de recepción */}
          {remito.firma && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <PenTool className="mr-2" size={20} />
                Firma de Recepción
              </h2>
              <div className="text-center">
                <div className="inline-block p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <img
                    src={remito.firma}
                    alt="Firma de recepción"
                    className="h-auto max-w-full max-h-40"
                    style={{ maxWidth: '300px' }}
                  />
                </div>
                {remito.aclaracionFirma && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Recibido por:</p>
                    <p className="text-sm font-medium text-gray-900">{remito.aclaracionFirma}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Resumen del remito */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Resumen del Remito</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Número:</span>
                <span className="text-sm font-medium text-gray-900">{remito.numero}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fecha:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatearFecha(remito.fecha || remito.fechaCreacion)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estado:</span>
                <span className={`text-sm font-medium ${
                  estadoInfo.color === 'green' ? 'text-green-600' :
                  estadoInfo.color === 'blue' ? 'text-blue-600' :
                  estadoInfo.color === 'yellow' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {estadoInfo.label}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total equipos:</span>
                <span className="text-sm font-bold text-primary">
                  {contarTotalItems(remito.items)}
                </span>
              </div>
              
              {remito.fechaModificacion && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Última actualización:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatearFecha(remito.fechaModificacion)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Estado de la entrega */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Estado de la Entrega</h2>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-md ${
                estadoInfo.color === 'green' ? 'border-green-200 bg-green-50' :
                estadoInfo.color === 'blue' ? 'border-blue-200 bg-blue-50' :
                estadoInfo.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center">
                  <EstadoIcon className={`w-5 h-5 mr-3 ${
                    estadoInfo.color === 'green' ? 'text-green-600' :
                    estadoInfo.color === 'blue' ? 'text-blue-600' :
                    estadoInfo.color === 'yellow' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      estadoInfo.color === 'green' ? 'text-green-800' :
                      estadoInfo.color === 'blue' ? 'text-blue-800' :
                      estadoInfo.color === 'yellow' ? 'text-yellow-800' :
                      'text-gray-800'
                    }`}>
                      {estadoInfo.label}
                    </p>
                    <p className={`text-xs ${
                      estadoInfo.color === 'green' ? 'text-green-600' :
                      estadoInfo.color === 'blue' ? 'text-blue-600' :
                      estadoInfo.color === 'yellow' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {remito.estado === 'entregado' && 'Los equipos han sido entregados exitosamente'}
                      {remito.estado === 'en_transito' && 'Los equipos están en camino a destino'}
                      {remito.estado === 'pendiente' && 'Preparando equipos para envío'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">¿Necesitas ayuda?</h2>
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                Si tienes consultas sobre esta entrega, contáctanos:
              </p>
              <div className="space-y-1">
                <Link href="mailto:info@imsse.com" className="block text-primary hover:underline">
                  📧 info@imsse.com
                </Link>
                <p>📞 +54 351 123-4567</p>
                <p>📍 Córdoba, Argentina</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}