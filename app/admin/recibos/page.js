// app/admin/recibos/page.jsx - Lista de Recibos IMSSE (MIGRADO A API)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LogOut,
  FilePlus,
  Eye,
  Edit,
  Trash2,
  Search,
  Download,
  Calendar,
  DollarSign,
  User,
  Receipt
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/services/apiService';

export default function ListaRecibos() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recibos, setRecibos] = useState([]);
  const [recibosFiltrados, setRecibosFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [descargando, setDescargando] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    montoTotal: 0,
    esteMes: 0,
    montoEsteMes: 0
  });

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarRecibos();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarRecibos = async () => {
    try {
      // ✅ USAR apiService
      const response = await apiService.obtenerRecibos();
      const recibosData = response.documents || response || [];

      setRecibos(recibosData);
      setRecibosFiltrados(recibosData);
      calcularEstadisticas(recibosData);
    } catch (error) {
      console.error('Error al cargar recibos IMSSE:', error);
      alert('Error al cargar los recibos');
      // Fallback para evitar crashes
      setRecibos([]);
      setRecibosFiltrados([]);
      setEstadisticas({ total: 0, montoTotal: 0, esteMes: 0, montoEsteMes: 0 });
    }
  };

  const calcularEstadisticas = (recibosData) => {
    if (!Array.isArray(recibosData)) {
      setEstadisticas({ total: 0, montoTotal: 0, esteMes: 0, montoEsteMes: 0 });
      return;
    }

    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const estadisticas = {
      total: recibosData.length,
      montoTotal: recibosData.reduce((sum, recibo) => sum + (recibo.monto || 0), 0),
      esteMes: 0,
      montoEsteMes: 0
    };

    // Calcular estadísticas del mes actual
    recibosData.forEach(recibo => {
      try {
        const fechaRecibo = recibo.fechaCreacion?.toDate ? recibo.fechaCreacion.toDate() : new Date(recibo.fecha);
        if (fechaRecibo >= inicioMes) {
          estadisticas.esteMes++;
          estadisticas.montoEsteMes += recibo.monto || 0;
        }
      } catch (e) {
        // Ignorar errores de fecha individual
      }
    });

    setEstadisticas(estadisticas);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleEliminarRecibo = async (id, numero) => {
    if (confirm(`¿Está seguro de que desea eliminar el recibo ${numero}?`)) {
      try {
        // ✅ USAR apiService
        await apiService.eliminarRecibo(id);
        await cargarRecibos(); // Recargar la lista
        alert('Recibo eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar recibo:', error);
        alert('Error al eliminar el recibo');
      }
    }
  };

  const handleDescargarPDF = async (recibo) => {
    if (descargando === recibo.id) return; // Evitar doble descarga

    setDescargando(recibo.id);

    try {
      // Importar dinámicamente react-pdf para generar el PDF
      const { pdf } = await import('@react-pdf/renderer');
      const { default: ReciboPDF } = await import('../../components/pdf/ReciboPDF');

      // Generar el PDF
      const blob = await pdf(<ReciboPDF recibo={recibo} />).toBlob();

      // Crear URL y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${recibo.numero}.pdf`;
      link.click();

      // Limpiar URL
      URL.revokeObjectURL(url);

      // Resetear estado y mostrar confirmación
      setDescargando(null);
      alert(`✅ Recibo ${recibo.numero} descargado exitosamente`);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      setDescargando(null);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === '') {
      setRecibosFiltrados(recibos);
    } else {
      const filtrados = recibos.filter(recibo =>
        recibo.numero?.toLowerCase().includes(term.toLowerCase()) ||
        recibo.recibiDe?.toLowerCase().includes(term.toLowerCase()) ||
        recibo.concepto?.toLowerCase().includes(term.toLowerCase())
      );
      setRecibosFiltrados(filtrados);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando recibos IMSSE...</p>
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

      {/* Navegación */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center">
            <Link
              href="/admin/panel-control"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              <Home size={16} className="mr-1" /> Panel de Control
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Recibos</span>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        {/* Header de página */}
        <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold font-montserrat text-primary">
              Recibos IMSSE
            </h2>
            <p className="text-gray-600">
              Sistema de facturación - Servicios contra incendios
            </p>
          </div>
          <Link
            href="/admin/recibos/nuevo"
            className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
          >
            <FilePlus size={18} className="mr-2" /> Nuevo Recibo
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Receipt size={24} className="mr-3 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recibos</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
            </div>
          </div>
{/*           <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <DollarSign size={24} className="mr-3 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(estadisticas.montoTotal)}</p>
              </div>
            </div>
          </div> */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Calendar size={24} className="mr-3 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.esteMes}</p>
              </div>
            </div>
          </div>
          {/*           <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <DollarSign size={24} className="mr-3 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Mes</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(estadisticas.montoEsteMes)}</p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Búsqueda */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center">
            <Search size={20} className="mr-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, cliente o concepto..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabla de recibos */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Lista de Recibos ({recibosFiltrados?.length || 0})
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Gestión de recibos IMSSE - Servicios contra incendios
            </p>
          </div>

          {(!recibosFiltrados || recibosFiltrados.length === 0) ? (
            <div className="p-12 text-center">
              <Receipt size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {searchTerm ? 'No se encontraron recibos' : 'No hay recibos'}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza creando tu primer recibo IMSSE'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/admin/recibos/nuevo"
                  className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                >
                  <FilePlus size={18} className="mr-2" /> Crear Primer Recibo
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="table-scroll-container">
                <div className="table-wrapper">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                          Número
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                          Fecha
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                          Cliente
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                          Concepto
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase sm:px-6">
                          Monto
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase sm:px-6">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recibosFiltrados.map((recibo, index) => (
                        <tr
                          key={recibo.id}
                          className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                        >
                          <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                            <div className="text-sm font-medium text-gray-900">{recibo.numero}</div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                            <div className="text-sm text-gray-900">{formatDate(recibo.fecha)}</div>
                            <div className="text-xs text-gray-500">
                              {formatDate(recibo.fechaCreacion)}
                            </div>
                          </td>
                          <td className="px-3 py-4 sm:px-6">
                            <div className="text-sm font-medium text-gray-900">
                              {recibo.recibiDe}
                            </div>
                          </td>
                          <td className="px-3 py-4 sm:px-6">
                            <div className="text-sm text-gray-900">
                              {recibo.concepto ?
                                (recibo.concepto.length > 50
                                  ? `${recibo.concepto.substring(0, 50)}...`
                                  : recibo.concepto
                                ) : 'Sin concepto'
                              }
                            </div>
                          </td>
                          <td className="px-3 py-4 text-right whitespace-nowrap sm:px-6">
                            <div className="text-sm font-bold text-green-600">
                              {formatCurrency(recibo.monto)}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center whitespace-nowrap sm:px-6">
                            <div className="flex justify-center space-x-1">
                              <Link
                                href={`/admin/recibos/${recibo.id}`}
                                className="p-2 text-blue-600 transition-colors rounded-md hover:bg-blue-100"
                                title="Ver recibo"
                              >
                                <Eye size={16} />
                              </Link>
                              <Link
                                href={`/admin/recibos/editar/${recibo.id}`}
                                className="p-2 text-orange-600 transition-colors rounded-md hover:bg-orange-100"
                                title="Editar recibo"
                              >
                                <Edit size={16} />
                              </Link>
                              <button
                                onClick={() => handleDescargarPDF(recibo)}
                                disabled={descargando === recibo.id}
                                className={`p-2 transition-colors rounded-md ${descargando === recibo.id
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-green-600 hover:bg-green-100'
                                  }`}
                                title={descargando === recibo.id ? 'Descargando...' : 'Descargar PDF'}
                              >
                                <Download size={16} />
                              </button>
                              <button
                                onClick={() => handleEliminarRecibo(recibo.id, recibo.numero)}
                                className="p-2 text-red-600 transition-colors rounded-md hover:bg-red-100"
                                title="Eliminar recibo"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-4 py-2 text-center border-t border-gray-200 bg-gray-50 sm:hidden">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <span>👈</span>
                  <span>Deslizá para ver más columnas</span>
                  <span>👉</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer con información IMSSE */}
        <div className="p-6 mt-8 text-center bg-white rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Sistema de facturación para servicios de protección contra incendios</p>
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
  );
}