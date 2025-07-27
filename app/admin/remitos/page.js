// app/admin/remitos/page.jsx - Lista de Remitos IMSSE (MIGRADO A API)
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
  Package,
  Truck,
  FileCheck
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/services/apiService';

export default function ListaRemitos() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remitos, setRemitos] = useState([]);
  const [remitosFiltrados, setRemitosFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [descargando, setDescargando] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    entregados: 0,
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
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_transito':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendiente':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarRemitos();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarRemitos = async () => {
    try {
      // ✅ MIGRADO: Usar apiService en lugar de Firestore directo
      const response = await apiService.obtenerRemitos();
      const remitosData = response.documents || response || [];

      setRemitos(remitosData);
      setRemitosFiltrados(remitosData);
      calcularEstadisticas(remitosData);
    } catch (error) {
      console.error('Error al cargar remitos IMSSE:', error);
      alert('Error al cargar los remitos');
    }
  };

  const calcularEstadisticas = (remitosData) => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const estadisticas = {
      total: remitosData.length,
      pendientes: remitosData.filter(r => r.estado === 'pendiente').length,
      entregados: remitosData.filter(r => r.estado === 'entregado').length,
      esteMes: 0
    };

    // Calcular estadísticas del mes actual
    remitosData.forEach(remito => {
      const fechaRemito = remito.fechaCreacion?.toDate ? remito.fechaCreacion.toDate() : new Date(remito.fecha);
      if (fechaRemito >= inicioMes) {
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

  const handleEliminarRemito = async (id, numero) => {
    if (confirm(`¿Está seguro de que desea eliminar el remito ${numero}?`)) {
      try {
        // ✅ MIGRADO: Usar apiService en lugar de deleteDoc directo
        await apiService.eliminarRemito(id);
        await cargarRemitos();
        alert('Remito eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar remito:', error);
        alert('Error al eliminar el remito');
      }
    }
  };

  const handleDescargarPDF = async (remito) => {
    if (descargando === remito.id) return;
    
    setDescargando(remito.id);
    
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: RemitoPDF } = await import('../../components/pdf/RemitoPDF');
      
      const blob = await pdf(<RemitoPDF remito={remito} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${remito.numero}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      setDescargando(null);
      alert(`✅ Remito ${remito.numero} descargado exitosamente`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setDescargando(null);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === '') {
      setRemitosFiltrados(remitos);
    } else {
      const filtrados = remitos.filter(remito =>
        remito.numero?.toLowerCase().includes(term.toLowerCase()) ||
        remito.cliente?.nombre?.toLowerCase().includes(term.toLowerCase()) ||
        remito.cliente?.empresa?.toLowerCase().includes(term.toLowerCase()) ||
        remito.destino?.toLowerCase().includes(term.toLowerCase())
      );
      setRemitosFiltrados(filtrados);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando remitos IMSSE...</p>
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
            <span className="text-gray-700">Remitos</span>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        {/* Header de página */}
        <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold font-montserrat text-primary">
              Remitos IMSSE
            </h2>
            <p className="text-gray-600">
              Sistema de entregas - Equipos contra incendios
            </p>
          </div>
          <Link
            href="/admin/remitos/nuevo"
            className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
          >
            <FilePlus size={18} className="mr-2" /> Nuevo Remito
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <FileCheck size={24} className="mr-3 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Remitos</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Package size={24} className="mr-3 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.pendientes}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Truck size={24} className="mr-3 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Entregados</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.entregados}</p>
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
              placeholder="Buscar por número, cliente o destino..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabla de remitos */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Remitos ({remitosFiltrados.length})
            </h3>
          </div>

          {remitosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <FileCheck size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {searchTerm ? 'No se encontraron remitos' : 'No hay remitos'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza creando tu primer remito IMSSE'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/admin/remitos/nuevo"
                  className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                >
                  <FilePlus size={18} className="mr-2" /> Crear Primer Remito
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
                      Destino
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
                  {remitosFiltrados.map((remito, index) => (
                    <tr 
                      key={remito.id} 
                      className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{remito.numero}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(remito.fecha)}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(remito.fechaCreacion)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {remito.cliente?.nombre || remito.cliente?.empresa || 'Sin cliente'}
                        </div>
                        {remito.cliente?.empresa && remito.cliente?.nombre && (
                          <div className="text-xs text-gray-500">
                            {remito.cliente.empresa}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {remito.destino}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(remito.estado)}`}>
                          {remito.estado || 'pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex justify-center space-x-1">
                          <Link
                            href={`/admin/remitos/${remito.id}`}
                            className="p-2 text-blue-600 transition-colors rounded-md hover:bg-blue-100"
                            title="Ver remito"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/admin/remitos/editar/${remito.id}`}
                            className="p-2 text-orange-600 transition-colors rounded-md hover:bg-orange-100"
                            title="Editar remito"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDescargarPDF(remito)}
                            disabled={descargando === remito.id}
                            className={`p-2 transition-colors rounded-md ${
                              descargando === remito.id 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-green-600 hover:bg-green-100'
                            }`}
                            title={descargando === remito.id ? 'Descargando...' : 'Descargar PDF'}
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleEliminarRemito(remito.id, remito.numero)}
                            className="p-2 text-red-600 transition-colors rounded-md hover:bg-red-100"
                            title="Eliminar remito"
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
            <p>Sistema de entregas para equipos de protección contra incendios</p>
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