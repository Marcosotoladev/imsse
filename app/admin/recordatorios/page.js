// app/admin/recordatorios/page.jsx - Lista de Recordatorios IMSSE
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
  Bell,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

export default function ListaRecordatorios() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordatorios, setRecordatorios] = useState([]);
  const [recordatoriosFiltrados, setRecordatoriosFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    vencidos: 0,
    porVencer: 0,
    completados: 0,
    pendientes: 0,
    estaSemana: 0
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

  // Función para calcular días hasta vencimiento
  const diasHastaVencimiento = (fechaVencimiento) => {
    if (!fechaVencimiento) return null;
    const hoy = new Date();
    const vencimiento = fechaVencimiento.toDate ? fechaVencimiento.toDate() : new Date(fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para obtener color del estado
  const getStatusColor = (estado, fechaVencimiento) => {
    const dias = diasHastaVencimiento(fechaVencimiento);
    
    if (estado === 'completado') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    
    if (dias !== null) {
      if (dias < 0) {
        return 'bg-red-100 text-red-800 border-red-200'; // Vencido
      } else if (dias <= 7) {
        return 'bg-orange-100 text-orange-800 border-orange-200'; // Por vencer
      }
    }
    
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Pendiente
  };

  // Función para obtener el texto del estado
  const getStatusText = (estado, fechaVencimiento) => {
    if (estado === 'completado') return 'Completado';
    
    const dias = diasHastaVencimiento(fechaVencimiento);
    if (dias !== null) {
      if (dias < 0) return 'Vencido';
      if (dias === 0) return 'Vence hoy';
      if (dias === 1) return 'Vence mañana';
      if (dias <= 7) return `${dias} días`;
    }
    
    return 'Pendiente';
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
        await cargarRecordatorios();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarRecordatorios = async () => {
    try {
      const q = query(
        collection(db, 'recordatorios'),
        orderBy('fechaVencimiento', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const recordatoriosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRecordatorios(recordatoriosData);
      setRecordatoriosFiltrados(recordatoriosData);
      calcularEstadisticas(recordatoriosData);
    } catch (error) {
      console.error('Error al cargar recordatorios IMSSE:', error);
      alert('Error al cargar los recordatorios');
    }
  };

  const calcularEstadisticas = (recordatoriosData) => {
    const hoy = new Date();
    const finSemana = new Date();
    finSemana.setDate(hoy.getDate() + 7);

    const estadisticas = {
      total: recordatoriosData.length,
      vencidos: 0,
      porVencer: 0,
      completados: recordatoriosData.filter(r => r.estado === 'completado').length,
      pendientes: recordatoriosData.filter(r => r.estado !== 'completado').length,
      estaSemana: 0
    };

    recordatoriosData.forEach(recordatorio => {
      const dias = diasHastaVencimiento(recordatorio.fechaVencimiento);
      const fechaVenc = recordatorio.fechaVencimiento?.toDate ? recordatorio.fechaVencimiento.toDate() : new Date(recordatorio.fechaVencimiento);
      
      if (recordatorio.estado !== 'completado') {
        if (dias !== null && dias < 0) {
          estadisticas.vencidos++;
        } else if (dias !== null && dias <= 7) {
          estadisticas.porVencer++;
        }
      }
      
      if (fechaVenc <= finSemana && fechaVenc >= hoy) {
        estadisticas.estaSemana++;
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

  const handleEliminarRecordatorio = async (id, titulo) => {
    if (confirm(`¿Está seguro de que desea eliminar el recordatorio "${titulo}"?`)) {
      try {
        await deleteDoc(doc(db, 'recordatorios', id));
        await cargarRecordatorios();
        alert('Recordatorio eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar recordatorio:', error);
        alert('Error al eliminar el recordatorio');
      }
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === '') {
      setRecordatoriosFiltrados(recordatorios);
    } else {
      const filtrados = recordatorios.filter(recordatorio =>
        recordatorio.titulo?.toLowerCase().includes(term.toLowerCase()) ||
        recordatorio.cliente?.toLowerCase().includes(term.toLowerCase()) ||
        recordatorio.descripcion?.toLowerCase().includes(term.toLowerCase()) ||
        recordatorio.tipo?.toLowerCase().includes(term.toLowerCase())
      );
      setRecordatoriosFiltrados(filtrados);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando recordatorios IMSSE...</p>
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
            <span className="text-gray-700">Recordatorios</span>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        {/* Header de página */}
        <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold font-montserrat text-primary">
              Recordatorios IMSSE
            </h2>
            <p className="text-gray-600">
              Vencimientos y notificaciones - Sistemas contra incendios
            </p>
          </div>
          <Link
            href="/admin/recordatorios/nuevo"
            className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
          >
            <FilePlus size={18} className="mr-2" /> Nuevo Recordatorio
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3 lg:grid-cols-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Bell size={24} className="mr-3 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <AlertTriangle size={24} className="mr-3 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.vencidos}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <AlertCircle size={24} className="mr-3 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Por Vencer</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.porVencer}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckCircle size={24} className="mr-3 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.completados}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Clock size={24} className="mr-3 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.pendientes}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
              <Calendar size={24} className="mr-3 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.estaSemana}</p>
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
              placeholder="Buscar por título, cliente, descripción o tipo..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabla de recordatorios */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Recordatorios ({recordatoriosFiltrados.length})
            </h3>
          </div>

          {recordatoriosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <Bell size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {searchTerm ? 'No se encontraron recordatorios' : 'No hay recordatorios'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza creando tu primer recordatorio IMSSE'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/admin/recordatorios/nuevo"
                  className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                >
                  <FilePlus size={18} className="mr-2" /> Crear Primer Recordatorio
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Título
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Vencimiento
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
                  {recordatoriosFiltrados.map((recordatorio, index) => (
                    <tr 
                      key={recordatorio.id} 
                      className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{recordatorio.titulo}</div>
                        <div className="text-xs text-gray-500">
                          {recordatorio.descripcion ? 
                            (recordatorio.descripcion.length > 50 
                              ? `${recordatorio.descripcion.substring(0, 50)}...` 
                              : recordatorio.descripcion
                            ) : ''
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{recordatorio.cliente}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{recordatorio.tipo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(recordatorio.fechaVencimiento)}</div>
                        <div className="text-xs text-gray-500">
                          {diasHastaVencimiento(recordatorio.fechaVencimiento) !== null && (
                            `${Math.abs(diasHastaVencimiento(recordatorio.fechaVencimiento))} días`
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(recordatorio.prioridad)}`}>
                          {recordatorio.prioridad || 'baja'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(recordatorio.estado, recordatorio.fechaVencimiento)}`}>
                          {getStatusText(recordatorio.estado, recordatorio.fechaVencimiento)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex justify-center space-x-1">
                          <Link
                            href={`/admin/recordatorios/${recordatorio.id}`}
                            className="p-2 text-blue-600 transition-colors rounded-md hover:bg-blue-100"
                            title="Ver recordatorio"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/admin/recordatorios/editar/${recordatorio.id}`}
                            className="p-2 text-orange-600 transition-colors rounded-md hover:bg-orange-100"
                            title="Editar recordatorio"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleEliminarRecordatorio(recordatorio.id, recordatorio.titulo)}
                            className="p-2 text-red-600 transition-colors rounded-md hover:bg-red-100"
                            title="Eliminar recordatorio"
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
            <p>Sistema de recordatorios y vencimientos para sistemas contra incendios</p>
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