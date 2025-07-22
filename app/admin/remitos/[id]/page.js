// app/admin/remitos/[id]/page.jsx - Ver Remito IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Package,
  User,
  MapPin,
  Calendar,
  Truck,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';

export default function VerRemito() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remito, setRemito] = useState(null);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarRemito();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router, params.id]);

  const cargarRemito = async () => {
    try {
      const docRef = doc(db, 'remitos', params.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setRemito({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert('Remito no encontrado');
        router.push('/admin/remitos');
      }
    } catch (error) {
      console.error('Error al cargar remito:', error);
      alert('Error al cargar el remito');
      router.push('/admin/remitos');
    }
  };

  const handleDescargarPDF = async () => {
    if (descargando) return;
    
    setDescargando(true);
    
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: RemitoPDF } = await import('../../../components/pdf/RemitoPDF');
      
      const blob = await pdf(<RemitoPDF remito={remito} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${remito.numero}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      setDescargando(false);
      alert(`✅ Remito ${remito.numero} descargado exitosamente`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setDescargando(false);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

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
      return fecha.toString();
    }
  };

  // Función para obtener color del estado
  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_transito':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendiente':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Función para obtener icono del estado
  const getStatusIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'entregado':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'en_transito':
        return <Truck size={16} className="text-blue-600" />;
      case 'pendiente':
      default:
        return <Clock size={16} className="text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando remito IMSSE...</p>
        </div>
      </div>
    );
  }

  if (!remito) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Remito no encontrado</h2>
          <p className="text-gray-600">El remito que buscas no existe o ha sido eliminado.</p>
          <Link
            href="/admin/remitos"
            className="inline-flex items-center px-4 py-2 mt-4 text-white rounded-md bg-primary hover:bg-primary/90"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a Remitos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        {/* Header */}
        <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link
              href="/admin/remitos"
              className="flex items-center p-2 mr-4 text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-montserrat text-primary">
                Remito {remito.numero}
              </h1>
              <p className="text-gray-600">
                Detalles de entrega - Equipos contra incendios IMSSE
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Link
              href={`/admin/remitos/editar/${remito.id}`}
              className="flex items-center px-4 py-2 text-white transition-colors bg-orange-600 rounded-md hover:bg-orange-700"
            >
              <Edit size={18} className="mr-2" />
              Editar
            </Link>
            <button
              onClick={handleDescargarPDF}
              disabled={descargando}
              className={`flex items-center px-4 py-2 text-white transition-colors rounded-md ${
                descargando 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {descargando ? (
                <>
                  <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Download size={18} className="mr-2" />
                  Descargar PDF
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna principal */}
          <div className="space-y-6 lg:col-span-2">
            {/* Información del remito */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-primary">
                <FileText size={20} className="mr-2" />
                Información del Remito
              </h2>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Número</label>
                  <p className="text-lg font-semibold text-gray-900">{remito.numero}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Fecha</label>
                  <p className="text-gray-900">{formatDate(remito.fecha)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Estado</label>
                  <div className="flex items-center mt-1">
                    {getStatusIcon(remito.estado)}
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(remito.estado)}`}>
                      {remito.estado || 'pendiente'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Fecha de Creación</label>
                  <p className="text-gray-900">{formatDate(remito.fechaCreacion)}</p>
                </div>
              </div>

              {(remito.destino || remito.transportista) && (
                <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                  {remito.destino && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Destino</label>
                      <p className="text-gray-900">{remito.destino}</p>
                    </div>
                  )}
                  
                  {remito.transportista && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Transportista</label>
                      <p className="text-gray-900">{remito.transportista}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Información del cliente */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-primary">
                <User size={20} className="mr-2" />
                Datos del Cliente
              </h2>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-gray-900">{remito.cliente?.nombre || 'No especificado'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Empresa</label>
                  <p className="text-gray-900">{remito.cliente?.empresa || 'No especificado'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{remito.cliente?.email || 'No especificado'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-gray-900">{remito.cliente?.telefono || 'No especificado'}</p>
                </div>
                
                {remito.cliente?.direccion && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Dirección</label>
                    <p className="text-gray-900">{remito.cliente.direccion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items del remito */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-primary">
                <Package size={20} className="mr-2" />
                Equipos Contra Incendios ({remito.items?.length || 0} items)
              </h2>
              
              {remito.items && remito.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                          Unidad
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {remito.items.map((item, index) => (
                        <tr key={item.id || index} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">
                              {item.descripcion || 'Sin descripción'}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {item.cantidad || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                              {item.unidad || 'unidad'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Package size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No hay items en este remito</p>
                </div>
              )}
            </div>

            {/* Observaciones */}
            {remito.observaciones && (
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="mb-4 text-lg font-semibold text-primary">Observaciones</h2>
                <p className="text-gray-900 whitespace-pre-wrap">{remito.observaciones}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumen */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-primary">Resumen</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Items:</span>
                  <span className="font-medium text-gray-900">
                    {remito.totalItems || remito.items?.reduce((sum, item) => sum + Number(item.cantidad || 0), 0) || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(remito.estado)}`}>
                    {remito.estado || 'pendiente'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Creado por:</span>
                  <span className="text-sm text-gray-900">{remito.usuarioCreador || 'Sistema'}</span>
                </div>
              </div>
            </div>

            {/* Firma */}
            {remito.firma && (
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-primary">Firma de Recepción</h3>
                
                <div className="text-center">
                  <img
                    src={remito.firma}
                    alt="Firma de recepción"
                    className="mx-auto mb-3 border border-gray-300 rounded"
                    style={{ maxWidth: '200px', height: '120px', objectFit: 'contain' }}
                  />
                  {remito.aclaracionFirma && (
                    <p className="text-sm font-medium text-gray-700">
                      {remito.aclaracionFirma}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Información técnica */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-primary">Información Técnica</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">ID:</span>
                  <span className="ml-2 font-mono text-gray-600">{remito.id}</span>
                </div>
                
                <div>
                  <span className="font-medium">Empresa:</span>
                  <span className="ml-2 text-gray-600">{remito.empresa || 'IMSSE INGENIERÍA S.A.S'}</span>
                </div>
                
                <div>
                  <span className="font-medium">Tipo:</span>
                  <span className="ml-2 text-gray-600">{remito.tipo || 'remito_entrega'}</span>
                </div>
                
                {remito.fechaModificacion && (
                  <div>
                    <span className="font-medium">Última modificación:</span>
                    <span className="ml-2 text-gray-600">{formatDate(remito.fechaModificacion)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer con información IMSSE */}
        <div className="p-6 mt-8 text-center bg-white rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Sistema de entregas para equipos de protección contra incendios</p>
            <p className="mt-2">
              <span className="font-medium">Especialistas en:</span> Detección | Supresión | Rociadores | Alarmas
            </p>
            <p className="mt-2">
              📧 info@imsseingenieria.com | 🌐 www.imsseingenieria.com | 📍 Córdoba, Argentina
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}