// app/admin/remitos/[id]/page.jsx - Ver Remito IMSSE (Formato como ReciboPDF)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download, Trash2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';

export default function VerRemito() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remito, setRemito] = useState(null);
  const [mostrarPDF, setMostrarPDF] = useState(false);

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
      return fecha?.toString() || '';
    }
  };

  useEffect(() => {
    if (!params.id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, 'remitos', params.id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setRemito({ id: docSnap.id, ...docSnap.data() });
          } else {
            alert('Remito no encontrado.');
            router.push('/admin/remitos');
          }
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar remito IMSSE:', error);
          alert('Error al cargar los datos del remito.');
          router.push('/admin/remitos');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [params.id, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleDeleteRemito = async () => {
    if (confirm('¿Está seguro de que desea eliminar este remito?')) {
      try {
        await deleteDoc(doc(db, 'remitos', params.id));
        alert('Remito eliminado exitosamente.');
        router.push('/admin/remitos');
      } catch (error) {
        console.error('Error al eliminar remito:', error);
        alert('Error al eliminar el remito.');
      }
    }
  };

  const handleDescargarPDF = async () => {
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
      alert(`✅ Remito ${remito.numero} descargado exitosamente`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
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
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Remito no encontrado</h2>
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
      {/* Header IMSSE */}
      <header className="text-white shadow bg-primary">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="flex items-center">
            <img 
              src="/logo/imsse-logo.png" 
              alt="IMSSE Logo" 
              className="w-8 h-8 mr-3"
            />
            <h1 className="text-xl font-bold font-montserrat">IMSSE - Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-red-700"
            >
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navegación y controles */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            {/* Breadcrumb */}
            <div className="flex items-center">
              <Link
                href="/admin/panel-control"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                <Home size={16} className="mr-1" /> Panel de Control
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <Link
                href="/admin/remitos"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                Remitos
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-700">Detalles</span>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/remitos"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Link>
              <Link
                href={`/admin/remitos/editar/${params.id}`}
                className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Edit size={18} className="mr-2" /> Editar
              </Link>
              <button
                onClick={handleDeleteRemito}
                className="flex items-center px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
              >
                <Trash2 size={18} className="mr-2" /> Eliminar
              </button>
              <button
                onClick={handleDescargarPDF}
                className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
              >
                <Download size={18} className="mr-2" /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal - Responsive */}
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header del remito */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
                  Remito {remito.numero}
                </h1>
                <p className="text-gray-600">
                  Sistema de Entregas IMSSE Ingeniería
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-4 py-2 rounded-full border font-semibold ${getStatusColor(remito.estado)}`}>
                  {remito.estado?.toUpperCase() || 'PENDIENTE'}
                </div>
                <p className="mt-1 text-sm text-gray-500">Estado del remito</p>
              </div>
            </div>
          </div>

          {/* Vista estilo remito */}
          <div className="bg-white shadow-lg">
            {/* Encabezado IMSSE */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-red-600">
              <div className="flex items-center">
                <img 
                  src="/logo/imsse-logo.png" 
                  alt="IMSSE Logo" 
                  className="w-10 h-10 mr-4"
                />
                <div>
                  <div className="text-xl font-bold">
                    <span className="text-red-600">IMSSE </span>
                    <span className="text-blue-500">INGENIERÍA </span>
                    <span className="text-red-600">S.A.S</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Instalación y Mantenimiento de Sistemas de Seguridad Electrónicos
                  </div>
                </div>
              </div>
              <div className="text-xs text-right text-gray-600">
                <div>Córdoba, Argentina</div>
                <div>📧 info@imsseingenieria.com</div>
                <div>🌐 www.imsseingenieria.com</div>
              </div>
            </div>

            {/* Título y número */}
            <div className="flex items-center justify-between px-8 py-6">
              <h1 className="text-3xl font-bold text-red-600">REMITO DE ENTREGA</h1>
              <div className="text-xl font-semibold text-red-600">N° {remito.numero}</div>
            </div>

            {/* Estado destacado */}
            <div className="px-8 py-4">
              <div className={`p-4 text-center rounded-lg border font-bold text-lg ${getStatusColor(remito.estado)}`}>
                {remito.estado?.toUpperCase() || 'PENDIENTE'}
              </div>
            </div>

            {/* Información en dos columnas */}
            <div className="flex flex-col px-8 py-6 space-y-6 md:flex-row md:space-y-0 md:space-x-8">
              {/* Datos del remito */}
              <div className="flex-1 p-4 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-lg font-bold text-red-600">DATOS DEL REMITO</h3>
                
                <div className="space-y-4">
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">FECHA:</div>
                      <div className="flex-1 text-sm text-black">{formatDate(remito.fecha)}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">ESTADO:</div>
                      <div className="flex-1">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(remito.estado)}`}>
                          {remito.estado?.toUpperCase() || 'PENDIENTE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {remito.destino && (
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">DESTINO:</div>
                        <div className="flex-1 text-sm text-black">{remito.destino}</div>
                      </div>
                    </div>
                  )}

                  {remito.transportista && (
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">TRANSPORT:</div>
                        <div className="flex-1 text-sm text-black">{remito.transportista}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Datos del cliente */}
              <div className="flex-1 p-4 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-lg font-bold text-red-600">DATOS DEL CLIENTE</h3>
                
                <div className="space-y-4">
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">NOMBRE:</div>
                      <div className="flex-1 text-sm text-black">{remito.cliente?.nombre || 'No especificado'}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">EMPRESA:</div>
                      <div className="flex-1 text-sm text-black">{remito.cliente?.empresa || 'No especificado'}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">EMAIL:</div>
                      <div className="flex-1 text-sm text-black break-all">{remito.cliente?.email || 'No especificado'}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">TELÉFONO:</div>
                      <div className="flex-1 text-sm text-black">{remito.cliente?.telefono || 'No especificado'}</div>
                    </div>
                  </div>

                  {remito.cliente?.direccion && (
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">DIRECCIÓN:</div>
                        <div className="flex-1 text-sm text-black">{remito.cliente.direccion}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de equipos */}
            <div className="px-8 py-6">
              <h3 className="mb-4 text-lg font-bold text-center text-red-600">
                EQUIPOS DE PROTECCIÓN CONTRA INCENDIOS ({remito.items?.length || 0} items)
              </h3>
              
              {remito.items && remito.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-sm font-bold text-left text-gray-700 border-b border-gray-300">
                          DESCRIPCIÓN DEL EQUIPO
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-center text-gray-700 border-b border-l border-gray-300">
                          CANTIDAD
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-center text-gray-700 border-b border-l border-gray-300">
                          UNIDAD
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {remito.items.map((item, index) => (
                        <tr key={item.id || index} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-3 text-sm text-black whitespace-pre-wrap border-b border-gray-200">
                            {item.descripcion || 'Sin descripción'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-center text-black border-b border-l border-gray-200">
                            {item.cantidad || '0'}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-black border-b border-l border-gray-200">
                            {item.unidad || 'unidad'}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Fila de total */}
                      <tr className="font-bold bg-gray-200">
                        <td className="px-4 py-3 text-sm font-bold text-black border-b border-gray-300">
                          TOTAL DE EQUIPOS
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-center text-black border-b border-l border-gray-300">
                          {remito.items.reduce((sum, item) => sum + Number(item.cantidad || 0), 0)}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-center text-black border-b border-l border-gray-300">
                          ITEMS
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center rounded-lg bg-gray-50">
                  <p className="text-gray-500">No hay equipos registrados en este remito</p>
                </div>
              )}
            </div>

            {/* Observaciones */}
            {remito.observaciones && (
              <div className="px-8 py-6">
                <div className="p-4 rounded-lg bg-gray-50">
                  <h3 className="mb-3 text-lg font-bold text-red-600">OBSERVACIONES</h3>
                  <div className="text-sm text-black whitespace-pre-line">{remito.observaciones}</div>
                </div>
              </div>
            )}

            {/* Sección de firmas */}
            {(remito.firma || remito.aclaracionFirma) && (
              <div className="flex justify-around px-8 py-12 mt-8">
                <div className="flex flex-col items-center w-2/5">
                  {remito.firma && (
                    <div className="flex items-center justify-center w-40 h-20 mb-4 border border-gray-200 rounded bg-gray-50">
                      <img 
                        src={remito.firma} 
                        alt="Firma de recepción" 
                        className="object-contain max-w-full max-h-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span style={{display: 'none'}} className="text-xs text-gray-400">Firma no disponible</span>
                    </div>
                  )}
                  <div className="w-full pt-2 border-t border-gray-800">
                    <div className="mt-2 text-xs text-center text-gray-600">RECIBÍ CONFORME</div>
                  </div>
                </div>

                <div className="flex flex-col items-center w-2/5">
                  <div className="flex items-end justify-center w-40 h-20 mb-4">
                    {remito.aclaracionFirma && (
                      <div className="text-sm text-center">{remito.aclaracionFirma}</div>
                    )}
                  </div>
                  <div className="w-full pt-2 border-t border-gray-800">
                    <div className="mt-2 text-xs text-center text-gray-600">ACLARACIÓN</div>
                  </div>
                </div>
              </div>
            )}

            {/* Pie de página IMSSE */}
            <div className="px-8 py-4 text-xs text-center text-gray-500 border-t border-gray-200">
              <div className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</div>
              <div>Especialistas en sistemas de protección contra incendios desde 1994</div>
              <div className="mt-1">
                <span className="font-medium">Certificaciones:</span> Notifier | Mircom | Inim | Secutron | Bosch
              </div>
              <div className="mt-2">
                📧 info@imsseingenieria.com | 🌐 www.imsseingenieria.com | 📍 Córdoba, Argentina
              </div>
            </div>
          </div>

          {/* Información de auditoría */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información de Auditoría</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Usuario creador:</span>
                <span className="text-gray-900">{remito.usuarioCreador || 'No disponible'}</span>
              </div>
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Fecha de creación:</span>
                <span className="text-gray-900">
                  {remito.fechaCreacion && remito.fechaCreacion.toDate 
                    ? new Date(remito.fechaCreacion.toDate()).toLocaleString('es-AR')
                    : 'No disponible'}
                </span>
              </div>
              {remito.fechaModificacion && (
                <div className="md:col-span-2">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Última modificación:</span>
                  <span className="text-gray-900">
                    {remito.fechaModificacion.toDate 
                      ? new Date(remito.fechaModificacion.toDate()).toLocaleString('es-AR')
                      : 'No disponible'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}