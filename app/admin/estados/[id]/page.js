// app/admin/estados-cuenta/[id]/page.jsx - Ver Estado de Cuenta IMSSE (MIGRADO A API)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download, Trash2, Calendar, Building, TrendingUp, TrendingDown } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';
import { use } from 'react';

export default function VerEstadoCuenta({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadoCuenta, setEstadoCuenta] = useState(null);

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

  // Función para formatear moneda estilo argentino
  const formatCurrency = (amount) => {
    if (!amount) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Función para obtener color del saldo
  const getSaldoColor = (saldo) => {
    if (saldo > 0) return 'text-red-600'; // Debe
    if (saldo < 0) return 'text-green-600'; // A favor
    return 'text-gray-600'; // Sin saldo
  };

  // Función para obtener texto del saldo
  const getSaldoText = (saldo) => {
    if (saldo > 0) return 'DEBE';
    if (saldo < 0) return 'A FAVOR';
    return 'AL DÍA';
  };

  // Función para obtener color del estado
  const getStatusColor = (saldo) => {
    if (saldo > 0) return 'bg-red-100 text-red-800 border-red-200';
    if (saldo < 0) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // ✅ USAR apiService
          const estadoData = await apiService.obtenerEstadoCuentaPorId(id);
          setEstadoCuenta({ id, ...estadoData });
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar estado de cuenta IMSSE:', error);
          alert('Error al cargar los datos del estado de cuenta.');
          router.push('/admin/estados-cuenta');
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

  const handleDeleteEstado = async () => {
    if (confirm(`¿Está seguro de que desea eliminar el estado de cuenta ${estadoCuenta.numero}?`)) {
      try {
        // ✅ USAR apiService
        await apiService.eliminarEstadoCuenta(id);
        alert('Estado de cuenta eliminado exitosamente.');
        router.push('/admin/estados-cuenta');
      } catch (error) {
        console.error('Error al eliminar estado de cuenta:', error);
        alert('Error al eliminar el estado de cuenta.');
      }
    }
  };

  const handleDescargarPDF = async () => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: EstadoCuentaPDF } = await import('../../../components/pdf/EstadoCuentaPDF');
      
      const blob = await pdf(<EstadoCuentaPDF estadoCuenta={estadoCuenta} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${estadoCuenta.numero}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      alert(`✅ Estado de cuenta ${estadoCuenta.numero} descargado exitosamente`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  // Calcular totales
  const calcularTotales = () => {
    if (!estadoCuenta?.movimientos) return { totalDebe: 0, totalHaber: 0 };
    
    const totalDebe = estadoCuenta.movimientos.reduce((sum, mov) => sum + (mov.debe || 0), 0);
    const totalHaber = estadoCuenta.movimientos.reduce((sum, mov) => sum + (mov.haber || 0), 0);
    
    return { totalDebe, totalHaber };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando estado de cuenta IMSSE...</p>
        </div>
      </div>
    );
  }

  if (!estadoCuenta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Estado de cuenta no encontrado</h2>
          <Link
            href="/admin/estados-cuenta"
            className="inline-flex items-center px-4 py-2 mt-4 text-white rounded-md bg-primary hover:bg-primary/90"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a Estados de Cuenta
          </Link>
        </div>
      </div>
    );
  }

  const { totalDebe, totalHaber } = calcularTotales();

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
                href="/admin/estados"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                Estados de Cuenta
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-700">Detalles</span>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/estados"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Link>
              <Link
                href={`/admin/estados/editar/${id}`}
                className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Edit size={18} className="mr-2" /> Editar
              </Link>
              <button
                onClick={handleDeleteEstado}
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
          
          {/* Header del estado de cuenta */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
                  Estado de Cuenta {estadoCuenta.numero}
                </h1>
                <p className="text-gray-600">
                  Sistema Contable IMSSE Ingeniería
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getSaldoColor(estadoCuenta.saldoActual)}`}>
                  {formatCurrency(Math.abs(estadoCuenta.saldoActual || 0))}
                </div>
                <p className="text-sm text-gray-500">Saldo actual</p>
                <div className={`inline-block px-3 py-1 mt-2 rounded-full border font-semibold text-sm ${getStatusColor(estadoCuenta.saldoActual)}`}>
                  {getSaldoText(estadoCuenta.saldoActual)}
                </div>
              </div>
            </div>
          </div>

          {/* Vista estilo estado de cuenta */}
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
              <h1 className="text-3xl font-bold text-red-600">ESTADO DE CUENTA</h1>
              <div className="text-xl font-semibold text-red-600">N° {estadoCuenta.numero}</div>
            </div>

            {/* Estado destacado */}
            <div className="px-8 py-4">
              <div className={`p-4 text-center rounded-lg border font-bold text-lg ${getStatusColor(estadoCuenta.saldoActual)}`}>
                {getSaldoText(estadoCuenta.saldoActual)} - {formatCurrency(Math.abs(estadoCuenta.saldoActual || 0))}
              </div>
            </div>

            {/* Información en dos columnas */}
            <div className="flex flex-col px-8 py-6 space-y-6 md:flex-row md:space-y-0 md:space-x-8">
              {/* Datos del estado */}
              <div className="flex-1 p-4 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-lg font-bold text-red-600">DATOS DEL PERÍODO</h3>
                
                <div className="space-y-4">
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">DESDE:</div>
                      <div className="flex-1 text-sm text-black">{formatDate(estadoCuenta.periodo?.desde)}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">HASTA:</div>
                      <div className="flex-1 text-sm text-black">{formatDate(estadoCuenta.periodo?.hasta)}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">SALDO ANT:</div>
                      <div className="flex-1 text-sm text-black">{formatCurrency(estadoCuenta.saldoAnterior)}</div>
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
                      <div className="flex-1 text-sm text-black">{estadoCuenta.cliente?.empresa || 'No especificado'}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">CONTACTO:</div>
                      <div className="flex-1 text-sm text-black">{estadoCuenta.cliente?.nombre || 'No especificado'}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">EMAIL:</div>
                      <div className="flex-1 text-sm text-black break-all">{estadoCuenta.cliente?.email || 'No especificado'}</div>
                    </div>
                  </div>

                  {estadoCuenta.cliente?.cuit && (
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-24 text-sm font-bold text-gray-700">CUIT:</div>
                        <div className="flex-1 text-sm text-black">{estadoCuenta.cliente.cuit}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de movimientos */}
            <div className="px-8 py-6">
              <h3 className="mb-4 text-lg font-bold text-center text-red-600">
                DETALLE DE MOVIMIENTOS ({estadoCuenta.movimientos?.length || 0} movimientos)
              </h3>
              
              {estadoCuenta.movimientos && estadoCuenta.movimientos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-sm font-bold text-left text-gray-700 border-b border-gray-300">
                          FECHA
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-center text-gray-700 border-b border-l border-gray-300">
                          TIPO
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-center text-gray-700 border-b border-l border-gray-300">
                          NÚMERO
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-left text-gray-700 border-b border-l border-gray-300">
                          CONCEPTO
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-right text-gray-700 border-b border-l border-gray-300">
                          DEBE
                        </th>
                        <th className="px-4 py-3 text-sm font-bold text-right text-gray-700 border-b border-l border-gray-300">
                          HABER
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {estadoCuenta.movimientos.map((movimiento, index) => (
                        <tr key={movimiento.id || index} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-3 text-sm text-black border-b border-gray-200">
                            {formatDate(movimiento.fecha)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-black capitalize border-b border-l border-gray-200">
                            {movimiento.tipo?.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-black border-b border-l border-gray-200">
                            {movimiento.numero || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-black border-b border-l border-gray-200">
                            {movimiento.concepto || 'Sin concepto'}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-right text-red-600 border-b border-l border-gray-200">
                            {movimiento.debe > 0 ? formatCurrency(movimiento.debe) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-right text-green-600 border-b border-l border-gray-200">
                            {movimiento.haber > 0 ? formatCurrency(movimiento.haber) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totales */}
                  <div className="flex justify-end mt-6">
                    <div className="w-full max-w-md">
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">SALDO ANTERIOR:</span>
                            <span className="font-bold text-gray-900">{formatCurrency(estadoCuenta.saldoAnterior)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">TOTAL DEBE:</span>
                            <span className="font-bold text-red-600">{formatCurrency(totalDebe)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">TOTAL HABER:</span>
                            <span className="font-bold text-green-600">{formatCurrency(totalHaber)}</span>
                          </div>
                          <div className="pt-2 border-t border-gray-300">
                            <div className="flex justify-between text-lg font-bold">
                              <span className="text-gray-900">SALDO ACTUAL:</span>
                              <span className={getSaldoColor(estadoCuenta.saldoActual)}>
                                {formatCurrency(Math.abs(estadoCuenta.saldoActual || 0))}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className={`text-sm font-medium ${getSaldoColor(estadoCuenta.saldoActual)}`}>
                                {getSaldoText(estadoCuenta.saldoActual)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-lg bg-gray-50">
                  <p className="text-gray-500">No hay movimientos en este estado de cuenta</p>
                </div>
              )}
            </div>

            {/* Observaciones */}
            {estadoCuenta.observaciones && (
              <div className="px-8 py-6">
                <div className="p-4 rounded-lg bg-gray-50">
                  <h3 className="mb-3 text-lg font-bold text-red-600">OBSERVACIONES</h3>
                  <div className="text-sm text-black whitespace-pre-line">{estadoCuenta.observaciones}</div>
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
                <span className="text-gray-900">{estadoCuenta.usuarioCreador || 'No disponible'}</span>
              </div>
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Fecha de creación:</span>
                <span className="text-gray-900">
                  {estadoCuenta.fechaCreacion && estadoCuenta.fechaCreacion.toDate 
                    ? new Date(estadoCuenta.fechaCreacion.toDate()).toLocaleString('es-AR')
                    : 'No disponible'}
                </span>
              </div>
              {estadoCuenta.fechaModificacion && (
                <div className="md:col-span-2">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Última modificación:</span>
                  <span className="text-gray-900">
                    {estadoCuenta.fechaModificacion.toDate 
                      ? new Date(estadoCuenta.fechaModificacion.toDate()).toLocaleString('es-AR')
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