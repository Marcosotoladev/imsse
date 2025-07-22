// app/admin/recibos/[id]/page.jsx - Ver Recibo IMSSE (Arreglado)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download, Trash2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { obtenerReciboPorId } from '../../../lib/firestore';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { use } from 'react';

export default function VerRecibo({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recibo, setRecibo] = useState(null);

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

  // Función para formatear moneda estilo argentino
  const formatCurrency = (amount) => {
    if (!amount) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const reciboData = await obtenerReciboPorId(id);
          setRecibo(reciboData);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar recibo IMSSE:', error);
          alert('Error al cargar los datos del recibo.');
          router.push('/admin/recibos');
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

  const handleDeleteRecibo = async () => {
    if (confirm(`¿Está seguro de que desea eliminar el recibo ${recibo.numero}?`)) {
      try {
        await deleteDoc(doc(db, 'recibos', id));
        alert('Recibo eliminado exitosamente.');
        router.push('/admin/recibos');
      } catch (error) {
        console.error('Error al eliminar recibo:', error);
        alert('Error al eliminar el recibo.');
      }
    }
  };

  const handleDescargarPDF = async () => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: ReciboPDF } = await import('../../../components/pdf/ReciboPDF');
      
      const blob = await pdf(<ReciboPDF recibo={recibo} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${recibo.numero}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      alert(`✅ Recibo ${recibo.numero} descargado exitosamente`);
      
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
          <p className="mt-4">Cargando recibo IMSSE...</p>
        </div>
      </div>
    );
  }

  if (!recibo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Recibo no encontrado</h2>
          <Link
            href="/admin/recibos"
            className="inline-flex items-center px-4 py-2 mt-4 text-white rounded-md bg-primary hover:bg-primary/90"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a Recibos
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
                href="/admin/recibos"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                Recibos
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-700">Detalles</span>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/recibos"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Link>
              <Link
                href={`/admin/recibos/editar/${id}`}
                className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Edit size={18} className="mr-2" /> Editar
              </Link>
              <button
                onClick={handleDeleteRecibo}
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
          
          {/* Header del recibo */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
                  Recibo {recibo.numero}
                </h1>
                <p className="text-gray-600">
                  Sistema de Facturación IMSSE Ingeniería
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(recibo.monto)}
                </div>
                <p className="text-sm text-gray-500">Monto total</p>
              </div>
            </div>
          </div>

          {/* Vista estilo recibo */}
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
              <h1 className="text-3xl font-bold text-red-600">RECIBO</h1>
              <div className="text-xl font-semibold text-red-600">N° {recibo.numero}</div>
            </div>

            {/* Monto destacado */}
            <div className="px-8 py-4">
              <div className="p-6 text-2xl font-bold text-center bg-gray-100 rounded-lg">
                {formatCurrency(recibo.monto)}
              </div>
            </div>

            {/* Detalles del recibo */}
            <div className="px-8 py-6 space-y-6">
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-32 text-sm font-bold text-gray-700">RECIBÍ DE:</div>
                  <div className="flex-1 text-sm text-black">{recibo.recibiDe || ''}</div>
                </div>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-32 text-sm font-bold text-gray-700">LA SUMA DE:</div>
                  <div className="flex-1 text-sm italic text-black">{recibo.cantidadLetras || ''}</div>
                </div>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-32 text-sm font-bold text-gray-700">CONCEPTO:</div>
                  <div className="flex-1 text-sm text-black whitespace-pre-line">{recibo.concepto || ''}</div>
                </div>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-32 text-sm font-bold text-gray-700">FECHA:</div>
                  <div className="flex-1 text-sm text-black">{formatDate(recibo.fecha)}</div>
                </div>
              </div>
            </div>

            {/* Sección de firmas */}
            {(recibo.firma || recibo.aclaracion) && (
              <div className="flex justify-around px-8 py-12 mt-8">
                <div className="flex flex-col items-center w-2/5">
                  {recibo.firma && (
                    <div className="flex items-center justify-center w-40 h-20 mb-4 border border-gray-200 rounded bg-gray-50">
                      <img 
                        src={recibo.firma} 
                        alt="Firma" 
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
                    <div className="mt-2 text-xs text-center text-gray-600">FIRMA</div>
                  </div>
                </div>

                <div className="flex flex-col items-center w-2/5">
                  <div className="flex items-end justify-center w-40 h-20 mb-4">
                    {recibo.aclaracion && (
                      <div className="text-sm text-center">{recibo.aclaracion}</div>
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
                <span className="text-gray-900">{recibo.usuarioCreador || 'No disponible'}</span>
              </div>
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Fecha de creación:</span>
                <span className="text-gray-900">
                  {recibo.fechaCreacion && recibo.fechaCreacion.toDate 
                    ? new Date(recibo.fechaCreacion.toDate()).toLocaleString('es-AR')
                    : 'No disponible'}
                </span>
              </div>
              {recibo.fechaActualizacion && (
                <div className="md:col-span-2">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Última actualización:</span>
                  <span className="text-gray-900">
                    {recibo.fechaActualizacion.toDate 
                      ? new Date(recibo.fechaActualizacion.toDate()).toLocaleString('es-AR')
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