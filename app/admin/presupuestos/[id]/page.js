// app/admin/presupuestos/[id]/page.jsx - Ver Presupuesto IMSSE COMPLETO CON DESCUENTO
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download, Trash2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';
import { use } from 'react';

export default function VerPresupuesto({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [presupuesto, setPresupuesto] = useState(null);

  // Función para formatear moneda estilo argentino
  const formatCurrency = (amount) => {
    if (!amount) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Función para formatear fechas
  const formatDate = (date) => {
    if (!date) return '';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return date?.toString() || '';
    }
  };

  // Función para obtener color del estado
  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'aprobado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendiente':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const presupuestoData = await apiService.obtenerPresupuestoPorId(id);
          setPresupuesto(presupuestoData);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar presupuesto IMSSE:', error);
          alert('Error al cargar los datos del presupuesto.');
          router.push('/admin/presupuestos');
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

  const handleDeletePresupuesto = async () => {
    if (confirm(`¿Está seguro de que desea eliminar el presupuesto ${presupuesto.numero}?`)) {
      try {
        await apiService.eliminarPresupuesto(id);
        alert('Presupuesto eliminado exitosamente.');
        router.push('/admin/presupuestos');
      } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
        alert('Error al eliminar el presupuesto.');
      }
    }
  };

  const adaptarDatosParaPDF = (presupuesto) => {
    return {
      ...presupuesto,
      fecha: presupuesto.fecha?.toDate ? presupuesto.fecha.toDate() : new Date(presupuesto.fecha),
      fechaVencimiento: presupuesto.fechaVencimiento?.toDate ?
        presupuesto.fechaVencimiento.toDate() : new Date(presupuesto.fechaVencimiento),
      cliente: {
        nombre: presupuesto.cliente?.nombre || '',
        empresa: presupuesto.cliente?.empresa || '',
        email: presupuesto.cliente?.email || '',
        telefono: presupuesto.cliente?.telefono || '',
        direccion: presupuesto.cliente?.direccion || '',
        cuit: presupuesto.cliente?.cuit || ''
      },
      items: presupuesto.items || [],
      subtotal: presupuesto.subtotal || 0,
      iva: presupuesto.iva || 0,
      // CAMPOS DE DESCUENTO
      tipoDescuento: presupuesto.tipoDescuento || 'porcentaje',
      valorDescuento: presupuesto.valorDescuento || 0,
      montoDescuento: presupuesto.montoDescuento || 0,
      total: presupuesto.total || 0,
      observaciones: presupuesto.observaciones || presupuesto.notas || '',
      estado: presupuesto.estado || 'pendiente',
      mostrarIva: presupuesto.mostrarIva || false
    };
  };

  const handleDescargarPDF = async () => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: PresupuestoPDF } = await import('../../../components/pdf/PresupuestoPDF');

      const blob = await pdf(<PresupuestoPDF presupuesto={adaptarDatosParaPDF(presupuesto)} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${presupuesto.numero}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
      alert(`✅ Presupuesto ${presupuesto.numero} descargado exitosamente`);

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
          <p className="mt-4">Cargando presupuesto IMSSE...</p>
        </div>
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Presupuesto no encontrado</h2>
          <Link
            href="/admin/presupuestos"
            className="inline-flex items-center px-4 py-2 mt-4 text-white rounded-md bg-primary hover:bg-primary/90"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a Presupuestos
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
                href="/admin/presupuestos"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                Presupuestos
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-700">Detalles</span>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/presupuestos"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Link>
              <Link
                href={`/admin/presupuestos/editar/${id}`}
                className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Edit size={18} className="mr-2" /> Editar
              </Link>
              <button
                onClick={handleDeletePresupuesto}
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

          {/* Header del presupuesto */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
                  Presupuesto {presupuesto.numero}
                </h1>
                <p className="text-gray-600">
                  Sistema de Cotizaciones IMSSE Ingeniería
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(presupuesto.total)}
                </div>
                <p className="text-sm text-gray-500">Total presupuestado</p>
                <div className={`inline-block px-3 py-1 mt-2 rounded-full border font-semibold text-sm ${getStatusColor(presupuesto.estado)}`}>
                  {presupuesto.estado?.toUpperCase() || 'PENDIENTE'}
                </div>
              </div>
            </div>
          </div>

          {/* Vista estilo presupuesto */}
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
                <div>Especialistas desde 1994</div>
              </div>
            </div>

            {/* Título y número */}
            <div className="flex items-center justify-between px-8 py-6">
              <h1 className="text-3xl font-bold text-red-600">PRESUPUESTO</h1>
              <div className="text-xl font-semibold text-red-600">N° {presupuesto.numero}</div>
            </div>

            {/* Estado destacado */}
            <div className="px-8 py-4">
              <div className={`p-4 text-center rounded-lg border font-bold text-lg ${getStatusColor(presupuesto.estado)}`}>
                {presupuesto.estado?.toUpperCase() || 'PENDIENTE'}
              </div>
            </div>

            {/* Información en dos columnas */}
            <div className="flex flex-col px-8 py-6 space-y-6 md:flex-row md:space-y-0 md:space-x-8">
              {/* Datos del presupuesto */}
              <div className="flex-1 p-4 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-lg font-bold text-red-600">DATOS DEL PRESUPUESTO</h3>

                <div className="space-y-4">
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">FECHA:</div>
                      <div className="flex-1 text-sm text-black">{formatDate(presupuesto.fecha)}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">VÁLIDO:</div>
                      <div className="flex-1 text-sm text-black">
                        {presupuesto.fechaVencimiento ? formatDate(presupuesto.fechaVencimiento) : 'Sin vencimiento'}
                      </div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">ESTADO:</div>
                      <div className="flex-1">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(presupuesto.estado)}`}>
                          {presupuesto.estado?.toUpperCase() || 'PENDIENTE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos del cliente */}
              <div className="flex-1 p-4 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-lg font-bold text-red-600">DATOS DEL CLIENTE</h3>

                <div className="space-y-4">
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">EMPRESA:</div>
                      <div className="flex-1 text-sm text-black">{presupuesto.cliente?.empresa || 'No especificado'}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">CONTACTO:</div>
                      <div className="flex-1 text-sm text-black">{presupuesto.cliente?.nombre || 'No especificado'}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">EMAIL:</div>
                      <div className="flex-1 text-sm text-black break-all">{presupuesto.cliente?.email || 'No especificado'}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">TELÉFONO:</div>
                      <div className="flex-1 text-sm text-black">{presupuesto.cliente?.telefono || 'No especificado'}</div>
                    </div>
                  </div>

                  {presupuesto.cliente?.cuit && (
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">CUIT:</div>
                        <div className="flex-1 text-sm text-black">{presupuesto.cliente.cuit}</div>
                      </div>
                    </div>
                  )}

                  {presupuesto.cliente?.direccion && (
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">DIRECCIÓN:</div>
                        <div className="flex-1 text-sm text-black">{presupuesto.cliente.direccion}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de servicios y productos */}
            <div className="px-8 py-6">
              <h3 className="mb-4 text-lg font-bold text-center text-red-600">
                SERVICIOS Y PRODUCTOS DE PROTECCIÓN CONTRA INCENDIOS
              </h3>

              {presupuesto.items && presupuesto.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-sm font-bold text-left text-gray-700 border-b border-gray-300">
                          DESCRIPCIÓN
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-center text-gray-700 border-b border-l border-gray-300">
                          CANT.
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-center text-gray-700 border-b border-l border-gray-300">
                          UNIDAD
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-right text-gray-700 border-b border-l border-gray-300">
                          PRECIO UNIT.
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-right text-gray-700 border-b border-l border-gray-300">
                          SUBTOTAL
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {presupuesto.items.map((item, index) => (
                        <tr key={item.id || index} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-3 text-sm text-black whitespace-pre-wrap border-b border-gray-200">
                            {item.descripcion || 'Sin descripción'}
                            {item.categoria && (
                              <div className="mt-1 text-xs text-gray-500 capitalize">
                                Categoría: {item.categoria}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-center text-black border-b border-l border-gray-200">
                            {item.cantidad || '0'}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-black border-b border-l border-gray-200">
                            {item.unidad || 'ud.'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-black border-b border-l border-gray-200">
                            {formatCurrency(item.precioUnitario)}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-right text-black border-b border-l border-gray-200">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totales CON DESCUENTO */}
                  <div className="flex justify-end mt-6">
                    <div className="w-full max-w-sm">
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">SUBTOTAL:</span>
                            <span className="font-bold text-gray-900">{formatCurrency(presupuesto.subtotal)}</span>
                          </div>
                          {presupuesto.mostrarIva && presupuesto.iva > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700">IVA (21%):</span>
                              <span className="font-bold text-gray-900">{formatCurrency(presupuesto.iva)}</span>
                            </div>
                          )}
                          
                          {/* MOSTRAR DESCUENTO SI EXISTE */}
                          {presupuesto.montoDescuento > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-orange-700">
                                DESCUENTO ({presupuesto.tipoDescuento === 'porcentaje' 
                                  ? `${presupuesto.valorDescuento}%` 
                                  : 'Monto fijo'}):
                              </span>
                              <span className="font-bold text-orange-700">-{formatCurrency(presupuesto.montoDescuento)}</span>
                            </div>
                          )}
                          
                          <div className="pt-2 border-t border-gray-300">
                            <div className="flex justify-between text-lg font-bold">
                              <span className="text-gray-900">TOTAL:</span>
                              <span className="text-primary">{formatCurrency(presupuesto.total)}</span>
                            </div>
                          </div>
                          
                          {/* Información adicional del descuento */}
                          {presupuesto.montoDescuento > 0 && (
                            <div className="p-2 pt-2 mt-2 text-xs border-t border-orange-200 rounded bg-orange-50">
                              <div className="text-orange-800">
                                <strong>Descuento aplicado:</strong><br />
                                Tipo: {presupuesto.tipoDescuento === 'porcentaje' ? 'Porcentaje' : 'Monto fijo'}<br />
                                Valor: {presupuesto.tipoDescuento === 'porcentaje' 
                                  ? `${presupuesto.valorDescuento}%` 
                                  : formatCurrency(presupuesto.valorDescuento)}<br />
                                Total descontado: {formatCurrency(presupuesto.montoDescuento)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-lg bg-gray-50">
                  <p className="text-gray-500">No hay items en este presupuesto</p>
                </div>
              )}
            </div>

            {/* Observaciones */}
            {presupuesto.observaciones && (
              <div className="px-8 py-6">
                <div className="p-4 rounded-lg bg-gray-50">
                  <h3 className="mb-3 text-lg font-bold text-red-600">OBSERVACIONES</h3>
                  <div className="text-sm text-black whitespace-pre-line">{presupuesto.observaciones}</div>
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
                <span className="text-gray-900">{presupuesto.usuarioCreador || 'No disponible'}</span>
              </div>
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Fecha de creación:</span>
                <span className="text-gray-900">
                  {presupuesto.fechaCreacion && presupuesto.fechaCreacion.toDate
                    ? new Date(presupuesto.fechaCreacion.toDate()).toLocaleString('es-AR')
                    : 'No disponible'}
                </span>
              </div>
              {presupuesto.fechaActualizacion && (
                <div className="md:col-span-2">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Última actualización:</span>
                  <span className="text-gray-900">
                    {presupuesto.fechaActualizacion.toDate
                      ? new Date(presupuesto.fechaActualizacion.toDate()).toLocaleString('es-AR')
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