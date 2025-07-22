// app/admin/mantenimiento/page.jsx - Lista de Órdenes de Mantenimiento IMSSE COMPLETO
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
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

export default function ListaMantenimiento() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesFiltradas, setOrdenesFiltradas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [descargando, setDescargando] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    completadas: 0,
    urgentes: 0,
    esteMes: 0
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
      return fecha.toString();
    }
  };

  // Función para obtener color del estado
  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'urgente':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendiente':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Función para obtener color de prioridad
  const getPriorityColor = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarOrdenes();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarOrdenes = async () => {
    try {
      const q = query(
        collection(db, 'ordenes_mantenimiento'),
        orderBy('fechaCreacion', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const ordenesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setOrdenes(ordenesData);
      setOrdenesFiltradas(ordenesData);
      calcularEstadisticas(ordenesData);
    } catch (error) {
      console.error('Error al cargar órdenes de mantenimiento IMSSE:', error);
      alert('Error al cargar las órdenes de mantenimiento');
    }
  };

  const calcularEstadisticas = (ordenesData) => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const estadisticas = {
      total: ordenesData.length,
      pendientes: ordenesData.filter(o => o.estado === 'pendiente').length,
      enProceso: ordenesData.filter(o => o.estado === 'en_proceso').length,
      completadas: ordenesData.filter(o => o.estado === 'completada').length,
      urgentes: ordenesData.filter(o => o.prioridad === 'alta' || o.estado === 'urgente').length,
      esteMes: 0
    };

    // Calcular estadísticas del mes actual
    ordenesData.forEach(orden => {
      const fechaOrden = orden.fechaCreacion?.toDate ? orden.fechaCreacion.toDate() : new Date(orden.fecha);
      if (fechaOrden >= inicioMes) {
        estadisticas.esteMes++;
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

  const handleEliminarOrden = async (id, numero) => {
    if (confirm(`¿Está seguro de que desea eliminar la orden de mantenimiento ${numero}?`)) {
      try {
        await deleteDoc(doc(db, 'ordenes_mantenimiento', id));
        await cargarOrdenes();
        alert('Orden de mantenimiento eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar orden:', error);
        alert('Error al eliminar la orden');
      }
    }
  };

  const handleDescargarPDF = async (orden) => {
    if (descargando === orden.id) return;
    
    setDescargando(orden.id);
    
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: MantenimientoPDF } = await import('../../components/pdf/MantenimientoPDF');
      
      const blob = await pdf(<MantenimientoPDF orden={orden} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${orden.numero}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      setDescargando(null);
      alert(`✅ Orden ${orden.numero} descargada exitosamente`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setDescargando(null);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === '') {
      setOrdenesFiltradas(ordenes);
    } else {
      const filtradas = ordenes.filter(orden =>
        orden.numero?.toLowerCase().includes(term.toLowerCase()) ||
        orden.cliente?.toLowerCase().includes(term.toLowerCase()) ||
        orden.ubicacion?.toLowerCase().includes(term.toLowerCase()) ||
        orden.tipoMantenimiento?.toLowerCase().includes(term.toLowerCase())
      );
      setOrdenesFiltradas(filtradas);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando órdenes de mantenimiento IMSSE...</p>
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
            <span className="text-gray-700">Órdenes de Mantenimiento</span>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        {/* Header de página */}
        <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold font-montserrat text-primary">
              Órdenes de Mantenimiento IMSSE
            </h2>
            <p className="text-gray-600">
              Mantenimiento preventivo y correctivo - Sistemas contra incendios
            </p>
          </div>
          <Link
            href="/admin/mantenimiento/nuevo"
            className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
          >
            <FilePlus size={18} className="mr-2" /> Nueva Orden
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3 lg:grid-cols-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Wrench size={24} className="mr-3 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Clock size={24} className="mr-3 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.pendientes}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Wrench size={24} className="mr-3 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.enProceso}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckCircle size={24} className="mr-3 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.completadas}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <AlertTriangle size={24} className="mr-3 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.urgentes}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Calendar size={24} className="mr-3 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.esteMes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center">
            <Search size={20} className="mr-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, cliente, ubicación o tipo de mantenimiento..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabla de órdenes */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Órdenes de Mantenimiento ({ordenesFiltradas.length})
            </h3>
          </div>

          {ordenesFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <Wrench size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {searchTerm ? 'No se encontraron órdenes' : 'No hay órdenes de mantenimiento'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza creando tu primera orden de mantenimiento IMSSE'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/admin/mantenimiento/nuevo"
                  className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                >
                  <FilePlus size={18} className="mr-2" /> Crear Primera Orden
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Número
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordenesFiltradas.map((orden, index) => (
                    <tr 
                      key={orden.id} 
                      className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{orden.numero}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(orden.fecha)}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(orden.fechaCreacion)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {orden.cliente}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {orden.ubicacion}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {orden.tipoMantenimiento}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(orden.prioridad)}`}>
                          {orden.prioridad || 'baja'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(orden.estado)}`}>
                          {orden.estado || 'pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex justify-center space-x-1">
                          <Link
                            href={`/admin/mantenimiento/${orden.id}`}
                            className="p-2 text-blue-600 transition-colors rounded-md hover:bg-blue-100"
                            title="Ver orden"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/admin/mantenimiento/editar/${orden.id}`}
                            className="p-2 text-orange-600 transition-colors rounded-md hover:bg-orange-100"
                            title="Editar orden"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDescargarPDF(orden)}
                            disabled={descargando === orden.id}
                            className={`p-2 transition-colors rounded-md ${
                              descargando === orden.id 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-green-600 hover:bg-green-100'
                            }`}
                            title={descargando === orden.id ? 'Descargando...' : 'Descargar PDF'}
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleEliminarOrden(orden.id, orden.numero)}
                            className="p-2 text-red-600 transition-colors rounded-md hover:bg-red-100"
                            title="Eliminar orden"
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
          )}
        </div>

        {/* Footer con información IMSSE */}
        <div className="p-6 mt-8 text-center bg-white rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Mantenimiento preventivo y correctivo de sistemas contra incendios</p>
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