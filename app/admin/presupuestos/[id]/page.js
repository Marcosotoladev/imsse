// app/admin/presupuestos/[id]/page.jsx - Ver Presupuesto IMSSE (CORREGIDO)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download, Calendar, User, Building, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { obtenerPresupuestoPorId } from '../../../lib/firestore';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PresupuestoPDF from '../../../components/pdf/PresupuestoPDF';

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
      return date.toString();
    }
  };

  // Función para obtener color del estado (solo 3 estados)
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
          const presupuestoData = await obtenerPresupuestoPorId(id);
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

  // Función para adaptar datos para el PDF
  const adaptarDatosParaPDF = (presupuesto) => {
    return {
      ...presupuesto,
      // Asegurar que las fechas estén en formato correcto
      fecha: presupuesto.fecha?.toDate ? presupuesto.fecha.toDate() : new Date(presupuesto.fecha),
      fechaVencimiento: presupuesto.fechaVencimiento?.toDate ? 
        presupuesto.fechaVencimiento.toDate() : new Date(presupuesto.fechaVencimiento),
      // Asegurar estructura del cliente
      cliente: {
        nombre: presupuesto.cliente?.nombre || '',
        empresa: presupuesto.cliente?.empresa || '',
        email: presupuesto.cliente?.email || '',
        telefono: presupuesto.cliente?.telefono || '',
        direccion: presupuesto.cliente?.direccion || '',
        cuit: presupuesto.cliente?.cuit || ''
      },
      // Asegurar items
      items: presupuesto.items || [],
      // Asegurar totales
      subtotal: presupuesto.subtotal || 0,
      iva: presupuesto.iva || 0,
      total: presupuesto.total || 0,
      // Asegurar observaciones
      observaciones: presupuesto.observaciones || presupuesto.notas || '',
      // Asegurar estado
      estado: presupuesto.estado || 'pendiente',
      // Asegurar mostrarIva
      mostrarIva: presupuesto.mostrarIva || false
    };
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
              <PDFDownloadLink
                document={<PresupuestoPDF presupuesto={adaptarDatosParaPDF(presupuesto)} />}
                fileName={`${presupuesto.numero}.pdf`}
                className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
              >     
                {({ blob, url, loading, error }) =>
                  loading ? (
                    <>
                      <span className="inline-block w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></span>
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <Download size={18} className="mr-2" />
                      Descargar PDF
                    </>
                  )
                }
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal - Responsive */}
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header del presupuesto */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
                  Presupuesto {presupuesto.numero}
                </h1>
                <p className="text-gray-600">
                  Especialistas en Sistemas de Protección Contra Incendios
                </p>
              </div>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(presupuesto.estado)}`}>
                  {presupuesto.estado || 'pendiente'}
                </span>
              </div>
            </div>
          </div>

          {/* Información en cards responsive */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            {/* Información del presupuesto */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Calendar size={20} className="mr-2 text-primary" />
                Detalles del Presupuesto
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-20 text-sm font-medium text-gray-600">Número:</span>
                  <span className="text-sm text-gray-900">{presupuesto.numero}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-20 text-sm font-medium text-gray-600">Fecha:</span>
                  <span className="text-sm text-gray-900">{formatDate(presupuesto.fecha)}</span>
                </div>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Building size={20} className="mr-2 text-primary" />
                Información del Cliente
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Building size={16} className="mt-1 mr-2 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{presupuesto.cliente?.empresa}</p>
                    <p className="text-xs text-gray-600">Empresa</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <User size={16} className="mt-1 mr-2 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">{presupuesto.cliente?.nombre}</p>
                    <p className="text-xs text-gray-600">Contacto</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail size={16} className="mt-1 mr-2 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">{presupuesto.cliente?.email}</p>
                    <p className="text-xs text-gray-600">Email</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone size={16} className="mt-1 mr-2 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-900">{presupuesto.cliente?.telefono}</p>
                    <p className="text-xs text-gray-600">Teléfono</p>
                  </div>
                </div>
                {presupuesto.cliente?.cuit && (
                  <div className="flex items-start">
                    <CreditCard size={16} className="mt-1 mr-2 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">{presupuesto.cliente.cuit}</p>
                      <p className="text-xs text-gray-600">CUIT</p>
                    </div>
                  </div>
                )}
                {presupuesto.cliente?.direccion && (
                  <div className="flex items-start">
                    <MapPin size={16} className="mt-1 mr-2 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">{presupuesto.cliente.direccion}</p>
                      <p className="text-xs text-gray-600">Dirección</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de items - Responsive con scroll horizontal */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Detalle de Servicios y Productos</h2>
            </div>
            
            {/* Contenedor con scroll horizontal para móviles */}
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
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                      Precio Unitario
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(presupuesto.items || []).map((item, index) => (
                    <tr key={item.id || index} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.descripcion}</div>
                        {item.categoria && (
                          <div className="text-xs text-gray-500 capitalize">{item.categoria}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900">
                        {item.cantidad} {item.unidad || 'ud.'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right text-gray-900">
                        {formatCurrency(item.precioUnitario)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(presupuesto.subtotal)}</span>
                  </div>
                  {presupuesto.mostrarIva && presupuesto.iva > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IVA (21%):</span>
                      <span className="font-medium text-gray-900">{formatCurrency(presupuesto.iva)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 text-lg font-bold border-t border-gray-200">
                    <span className="text-gray-900">TOTAL:</span>
                    <span className="text-primary">{formatCurrency(presupuesto.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {presupuesto.observaciones && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Observaciones</h2>
              <div className="p-4 text-sm text-gray-700 whitespace-pre-line border-l-4 border-yellow-400 rounded-lg bg-yellow-50">
                {presupuesto.observaciones}
              </div>
            </div>
          )}

          {/* Footer con información de IMSSE */}
          <div className="p-6 text-center bg-white rounded-lg shadow-md">
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
              <p>Instalación y Mantenimiento de Sistemas de Seguridad Electrónicos</p>
              <p>Especialistas en sistemas de protección contra incendios desde 1994</p>
              <p className="mt-2">
                <span className="font-medium">Certificaciones:</span> Notifier | Mircom | Inim | Secutron | Bosch
              </p>
              <p className="mt-2">
                📧 info@imsseingenieria.com | 🌐 www.imsseingenieria.com | 📍 Córdoba, Argentina
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}