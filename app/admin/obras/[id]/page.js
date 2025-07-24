// app/admin/ordenes/[id]/page.jsx - Ver Orden de Trabajo IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  LogOut, 
  Edit, 
  ArrowLeft, 
  Download, 
  Trash2,
  Shield,
  User,
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  Camera,
  CheckCircle,
  PenTool
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { obtenerOrdenTrabajoPorId, eliminarOrdenTrabajo } from '../../../lib/firestore';
import { use } from 'react';

export default function VerOrdenTrabajo({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orden, setOrden] = useState(null);

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Función para formatear hora
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const ordenData = await obtenerOrdenTrabajoPorId(id);
          setOrden(ordenData);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar orden de trabajo IMSSE:', error);
          alert('Error al cargar los datos de la orden.');
          router.push('/admin/ordenes');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleDeleteOrden = async () => {
    if (confirm(`¿Está seguro de que desea eliminar la orden de trabajo ${orden.numero}?`)) {
      try {
        await eliminarOrdenTrabajo(id);
        alert('Orden de trabajo eliminada exitosamente.');
        router.push('/admin/ordenes');
      } catch (error) {
        console.error('Error al eliminar orden de trabajo:', error);
        alert('Error al eliminar la orden de trabajo.');
      }
    }
  };

  const handleDescargarPDF = async () => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: OrdenTrabajoPDF } = await import('../../../components/pdf/OrdenTrabajoPDF');
      
      const blob = await pdf(<OrdenTrabajoPDF orden={orden} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${orden.numero}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      alert(`✅ Orden ${orden.numero} descargada exitosamente`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando orden de trabajo IMSSE...</p>
        </div>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Orden de trabajo no encontrada</h2>
          <Link
            href="/admin/ordenes"
            className="inline-flex items-center px-4 py-2 mt-4 text-white rounded-md bg-primary hover:bg-primary/90"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a Órdenes
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
                href="/admin/ordenes"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                Órdenes de Trabajo
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-700">Detalles</span>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/ordenes"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Link>
              <Link
                href={`/admin/ordenes/editar/${id}`}
                className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Edit size={18} className="mr-2" /> Editar
              </Link>
              <button
                onClick={handleDeleteOrden}
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

      {/* Contenido principal */}
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header de la orden */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
                  Orden de Trabajo {orden.numero}
                </h1>
                <p className="text-gray-600">
                  Sistema de Gestión IMSSE Ingeniería
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {formatDate(orden.fechaTrabajo)}
                </div>
                <p className="text-sm text-gray-500">
                  {formatTime(orden.horarioInicio)} - {formatTime(orden.horarioFin)}
                </p>
              </div>
            </div>
          </div>

          {/* Vista estilo orden de trabajo */}
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
              <h1 className="text-2xl font-bold text-red-600">ORDEN DE TRABAJO</h1>
              <div className="text-xl font-semibold text-red-600">N° {orden.numero}</div>
            </div>

            {/* Información básica */}
            <div className="px-8 py-4">
              <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="mb-3 text-lg font-semibold text-gray-700">Información Básica</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Fecha de trabajo:</span>
                    <span className="text-gray-900">{formatDate(orden.fechaTrabajo)}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Horario:</span>
                    <span className="text-gray-900">
                      {formatTime(orden.horarioInicio)} - {formatTime(orden.horarioFin)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos del cliente */}
            <div className="px-8 py-4">
              <div className="p-4 rounded-lg bg-blue-50">
                <h3 className="mb-3 text-lg font-semibold text-gray-700">Datos del Cliente</h3>
                <div className="space-y-3">
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Empresa:</span>
                    <span className="text-gray-900">{orden.cliente?.empresa || 'No especificada'}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Contacto:</span>
                    <span className="text-gray-900">{orden.cliente?.nombre || 'No especificado'}</span>
                  </div>
                  {orden.cliente?.telefono && (
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Teléfono:</span>
                      <span className="text-gray-900">{orden.cliente.telefono}</span>
                    </div>
                  )}
                  {orden.cliente?.direccion && (
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Dirección:</span>
                      <span className="text-gray-900">{orden.cliente.direccion}</span>
                    </div>
                  )}
                  {orden.cliente?.solicitadoPor && (
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Solicitado por:</span>
                      <span className="text-gray-900">{orden.cliente.solicitadoPor}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Técnicos asignados */}
            <div className="px-8 py-4">
              <div className="p-4 rounded-lg bg-green-50">
                <h3 className="mb-3 text-lg font-semibold text-gray-700">Técnicos Asignados</h3>
                {orden.tecnicos?.length > 0 ? (
                  <div className="space-y-2">
                    {orden.tecnicos.map((tecnico, index) => (
                      <div key={index} className="flex items-center">
                        <Users size={16} className="mr-2 text-green-600" />
                        <span className="text-gray-900">{tecnico.nombre}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No se asignaron técnicos</p>
                )}
              </div>
            </div>

            {/* Tareas realizadas */}
            <div className="px-8 py-4">
              <div className="p-4 rounded-lg bg-yellow-50">
                <h3 className="mb-3 text-lg font-semibold text-gray-700">Tareas Realizadas</h3>
                <div className="text-gray-900 whitespace-pre-line">
                  {orden.tareasRealizadas || 'No se especificaron tareas realizadas.'}
                </div>
              </div>
            </div>

            {/* Fotos del trabajo */}
            {orden.fotos?.length > 0 && (
              <div className="px-8 py-4">
                <div className="p-4 rounded-lg bg-purple-50">
                  <h3 className="mb-3 text-lg font-semibold text-gray-700">
                    Fotografías del Trabajo ({orden.fotos.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {orden.fotos.map((foto, index) => (
                      <div key={foto.id || index} className="relative group">
                        <img
                          src={foto.url}
                          alt={foto.nombre || `Foto ${index + 1}`}
                          className="object-cover w-full h-48 transition-shadow border border-gray-200 rounded-md cursor-pointer hover:shadow-lg"
                          onClick={() => window.open(foto.url, '_blank')}
                        />
                        <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-50 rounded-md opacity-0 group-hover:opacity-100">
                          <Camera size={32} className="text-white" />
                        </div>
                        <p className="mt-2 text-sm text-center text-gray-600 truncate">
                          {foto.nombre || `Foto ${index + 1}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sección de firmas */}
            {(orden.firmas?.tecnico?.firma || orden.firmas?.cliente?.firma) && (
              <div className="flex justify-around px-8 py-12 mt-8 border-t border-gray-200">
                {/* Firma del técnico */}
                <div className="flex flex-col items-center w-2/5">
                  <h4 className="mb-4 text-sm font-semibold text-gray-700 uppercase">Técnico Responsable</h4>
                  {orden.firmas?.tecnico?.firma ? (
                    <div className="flex items-center justify-center w-40 h-20 mb-4 border border-gray-200 rounded bg-gray-50">
                      <img 
                        src={orden.firmas.tecnico.firma} 
                        alt="Firma técnico" 
                        className="object-contain max-w-full max-h-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span style={{display: 'none'}} className="text-xs text-gray-400">Firma no disponible</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-40 h-20 mb-4 border border-gray-200 rounded bg-gray-50">
                      <span className="text-xs text-gray-400">Sin firma</span>
                    </div>
                  )}
                  <div className="w-full pt-2 border-t border-gray-800">
                    <div className="mt-2 text-xs text-center text-gray-600">FIRMA</div>
                    {orden.firmas?.tecnico?.aclaracion && (
                      <div className="mt-1 text-sm text-center">{orden.firmas.tecnico.aclaracion}</div>
                    )}
                  </div>
                </div>

                {/* Firma del cliente */}
                <div className="flex flex-col items-center w-2/5">
                  <h4 className="mb-4 text-sm font-semibold text-gray-700 uppercase">Conforme Cliente</h4>
                  {orden.firmas?.cliente?.firma ? (
                    <div className="flex items-center justify-center w-40 h-20 mb-4 border border-gray-200 rounded bg-gray-50">
                      <img 
                        src={orden.firmas.cliente.firma} 
                        alt="Firma cliente" 
                        className="object-contain max-w-full max-h-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span style={{display: 'none'}} className="text-xs text-gray-400">Firma no disponible</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-40 h-20 mb-4 border border-gray-200 rounded bg-gray-50">
                      <span className="text-xs text-gray-400">Sin firma</span>
                    </div>
                  )}
                  <div className="w-full pt-2 border-t border-gray-800">
                    <div className="mt-2 text-xs text-center text-gray-600">FIRMA Y ACLARACIÓN</div>
                    {orden.firmas?.cliente?.aclaracion && (
                      <div className="mt-1 text-sm text-center">{orden.firmas.cliente.aclaracion}</div>
                    )}
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
                <span className="text-gray-900">{orden.usuarioCreador || 'No disponible'}</span>
              </div>
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Fecha de creación:</span>
                <span className="text-gray-900">
                  {orden.fechaCreacion && orden.fechaCreacion.toDate 
                    ? new Date(orden.fechaCreacion.toDate()).toLocaleString('es-AR')
                    : 'No disponible'}
                </span>
              </div>
              {orden.fechaModificacion && (
                <div className="md:col-span-2">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Última actualización:</span>
                  <span className="text-gray-900">
                    {orden.fechaModificacion.toDate 
                      ? new Date(orden.fechaModificacion.toDate()).toLocaleString('es-AR')
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