// app/admin/recordatorios/page.jsx - Lista de Recordatorios IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Home,
  LogOut,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Calendar,
  User,
  ChevronDown
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function ListaRecordatorios() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordatorios, setRecordatorios] = useState([]);
  const [filteredRecordatorios, setFilteredRecordatorios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterPrioridad, setFilterPrioridad] = useState('todos');
  const [sortBy, setSortBy] = useState('fecha');
  const router = useRouter();

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

  // ❌ REEMPLAZAR todo el contenido de la función:
  const cargarRecordatorios = async () => {
    try {
      // ✅ NUEVO CÓDIGO:
      const response = await apiService.obtenerRecordatorios();
      const recordatoriosData = response.documents || response || [];

      // Procesar datos (calcular estado automáticamente)
      const recordatoriosProcesados = recordatoriosData.map(recordatorio => {
        const fechaVencimiento = new Date(recordatorio.fechaVencimiento);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaVencimiento.setHours(0, 0, 0, 0);

        let estadoCalculado = recordatorio.estado;
        if (recordatorio.estado === 'pendiente' && fechaVencimiento < hoy) {
          estadoCalculado = 'vencido';
        }

        return {
          ...recordatorio,
          estadoCalculado
        };
      });

      // Ordenar por fecha de vencimiento por defecto
      recordatoriosProcesados.sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));

      setRecordatorios(recordatoriosProcesados);
      setFilteredRecordatorios(recordatoriosProcesados);
    } catch (error) {
      console.error('Error al cargar recordatorios IMSSE:', error);
      alert('Error al cargar los recordatorios. Inténtelo de nuevo más tarde.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleDelete = async (id, titulo) => {
    if (confirm(`¿Está seguro de que desea eliminar el recordatorio "${titulo}"?`)) {
      try {
        await apiService.eliminarRecordatorio(id);
        alert('Recordatorio eliminado exitosamente.');
        await cargarRecordatorios();
      } catch (error) {
        console.error('Error al eliminar recordatorio:', error);
        alert('Error al eliminar el recordatorio.');
      }
    }
  };

const handleToggleCompletado = async (id, estadoActual) => {
  try {
    const nuevoEstado = estadoActual === 'completado' ? 'pendiente' : 'completado';
    const datosActualizacion = {
      estado: nuevoEstado,
      fechaCompletado: nuevoEstado === 'completado' ? new Date().toISOString() : null
    };
    
    await apiService.actualizarRecordatorio(id, datosActualizacion);
    await cargarRecordatorios();
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    alert('Error al actualizar el estado del recordatorio.');
  }
};

  // Filtros y búsqueda
  useEffect(() => {
    let filtered = [...recordatorios];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(recordatorio =>
        recordatorio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recordatorio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recordatorio.usuarioCreador?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (filterEstado !== 'todos') {
      filtered = filtered.filter(recordatorio => recordatorio.estadoCalculado === filterEstado);
    }

    // Filtro por prioridad
    if (filterPrioridad !== 'todos') {
      filtered = filtered.filter(recordatorio => recordatorio.prioridad === filterPrioridad);
    }

    // Ordenamiento
    if (sortBy === 'fecha') {
      filtered.sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));
    } else if (sortBy === 'prioridad') {
      const prioridadOrder = { 'alta': 1, 'media': 2, 'baja': 3 };
      filtered.sort((a, b) => prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad]);
    } else if (sortBy === 'estado') {
      const estadoOrder = { 'vencido': 1, 'pendiente': 2, 'completado': 3 };
      filtered.sort((a, b) => estadoOrder[a.estadoCalculado] - estadoOrder[b.estadoCalculado]);
    }

    setFilteredRecordatorios(filtered);
  }, [searchTerm, filterEstado, filterPrioridad, sortBy, recordatorios]);

  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const today = new Date();
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const formatted = date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      if (diffDays === 0) return `${formatted} (Hoy)`;
      if (diffDays === 1) return `${formatted} (Mañana)`;
      if (diffDays === -1) return `${formatted} (Ayer)`;
      if (diffDays < 0) return `${formatted} (${Math.abs(diffDays)} días atrás)`;
      if (diffDays <= 7) return `${formatted} (En ${diffDays} días)`;

      return formatted;
    } catch (e) {
      return dateString;
    }
  };

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'vencido':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          text: 'VENCIDO'
        };
      case 'pendiente':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          text: 'PENDIENTE'
        };
      case 'completado':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'COMPLETADO'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          text: estado?.toUpperCase() || 'DESCONOCIDO'
        };
    }
  };

  const getPrioridadConfig = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return { color: 'bg-red-500', text: 'ALTA' };
      case 'media':
        return { color: 'bg-yellow-500', text: 'MEDIA' };
      case 'baja':
        return { color: 'bg-green-500', text: 'BAJA' };
      default:
        return { color: 'bg-gray-500', text: 'SIN DEFINIR' };
    }
  };

  const contarPorEstado = () => {
    const todos = recordatorios.length;
    const vencidos = recordatorios.filter(r => r.estadoCalculado === 'vencido').length;
    const pendientes = recordatorios.filter(r => r.estadoCalculado === 'pendiente').length;
    const completados = recordatorios.filter(r => r.estadoCalculado === 'completado').length;

    return { todos, vencidos, pendientes, completados };
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

  const estadisticas = contarPorEstado();

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
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            {/* Breadcrumb */}
            <div className="flex items-center">
              <Link href="/admin/panel-control" className="text-primary hover:underline">
                <Home size={16} className="inline mr-1" />
                Panel de Control
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="font-medium text-gray-700">Recordatorios</span>
            </div>

            {/* Botón nuevo */}
            <Link
              href="/admin/recordatorios/nuevo"
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700"
            >
              <Plus size={18} className="mr-2" />
              Nuevo Recordatorio
            </Link>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        {/* Título y estadísticas */}
        <div className="mb-6">
          <h2 className="mb-4 text-2xl font-bold font-montserrat text-primary">
            Gestión de Recordatorios
          </h2>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Bell className="w-8 h-8 mr-3 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.todos}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 mr-3 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{estadisticas.vencidos}</p>
                  <p className="text-sm text-gray-600">Vencidos</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-8 h-8 mr-3 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
                  <p className="text-sm text-gray-600">Pendientes</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 mr-3 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{estadisticas.completados}</p>
                  <p className="text-sm text-gray-600">Completados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Buscar recordatorios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="todos">Todos los estados</option>
                <option value="vencido">Vencidos</option>
                <option value="pendiente">Pendientes</option>
                <option value="completado">Completados</option>
              </select>
            </div>

            {/* Filtro por prioridad */}
            <div>
              <select
                value={filterPrioridad}
                onChange={(e) => setFilterPrioridad(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="todos">Todas las prioridades</option>
                <option value="alta">Alta prioridad</option>
                <option value="media">Media prioridad</option>
                <option value="baja">Baja prioridad</option>
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="fecha">Ordenar por fecha</option>
                <option value="prioridad">Ordenar por prioridad</option>
                <option value="estado">Ordenar por estado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de recordatorios tipo tarjetas */}
        <div className="space-y-4">
          {filteredRecordatorios.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg shadow-md">
              <Bell size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No hay recordatorios</h3>
              <p className="text-gray-600">
                {searchTerm || filterEstado !== 'todos' || filterPrioridad !== 'todos'
                  ? 'No se encontraron recordatorios que coincidan con los filtros seleccionados.'
                  : 'Aún no has creado ningún recordatorio.'}
              </p>
              {!searchTerm && filterEstado === 'todos' && filterPrioridad === 'todos' && (
                <Link
                  href="/admin/recordatorios/nuevo"
                  className="inline-flex items-center px-4 py-2 mt-4 text-white rounded-md bg-primary hover:bg-red-700"
                >
                  <Plus size={16} className="mr-2" />
                  Crear primer recordatorio
                </Link>
              )}
            </div>
          ) : (
            filteredRecordatorios.map((recordatorio) => {
              const estadoConfig = getEstadoConfig(recordatorio.estadoCalculado);
              const prioridadConfig = getPrioridadConfig(recordatorio.prioridad);
              const IconoEstado = estadoConfig.icon;

              return (
                <div
                  key={recordatorio.id}
                  className={`p-6 bg-white rounded-lg shadow-md border-l-4 ${recordatorio.estadoCalculado === 'vencido' ? 'border-red-500' :
                      recordatorio.estadoCalculado === 'pendiente' ? 'border-yellow-500' :
                        'border-green-500'
                    }`}
                >
                  <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                    {/* Checkbox de completado */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleToggleCompletado(recordatorio.id, recordatorio.estado)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${recordatorio.estadoCalculado === 'completado'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                          }`}
                        title={recordatorio.estadoCalculado === 'completado' ? 'Marcar como pendiente' : 'Marcar como completado'}
                      >
                        {recordatorio.estadoCalculado === 'completado' && <CheckCircle size={16} />}
                      </button>
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col space-y-2 md:flex-row md:items-start md:justify-between md:space-y-0">
                        {/* Título y descripción */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-semibold ${recordatorio.estadoCalculado === 'completado' ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                            {recordatorio.titulo}
                          </h3>
                          {recordatorio.descripcion && (
                            <p className={`text-sm mt-1 ${recordatorio.estadoCalculado === 'completado' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                              {recordatorio.descripcion}
                            </p>
                          )}

                          {/* Información adicional */}
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {formatDate(recordatorio.fechaVencimiento)}
                            </div>
                            <div className="flex items-center">
                              <User size={14} className="mr-1" />
                              {recordatorio.usuarioCreador}
                            </div>
                          </div>
                        </div>

                        {/* Estados y acciones */}
                        <div className="flex flex-col items-start space-y-2 md:items-end">
                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            {/* Prioridad */}
                            <span className={`inline-block w-3 h-3 rounded-full ${prioridadConfig.color}`} title={`Prioridad ${prioridadConfig.text}`}></span>

                            {/* Estado */}
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${estadoConfig.color}`}>
                              <IconoEstado size={12} className="mr-1" />
                              {estadoConfig.text}
                            </span>
                          </div>

                          {/* Acciones */}
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/recordatorios/${recordatorio.id}`}
                              className="text-blue-600 transition-colors hover:text-blue-900"
                              title="Ver recordatorio"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              href={`/admin/recordatorios/editar/${recordatorio.id}`}
                              className="text-green-600 transition-colors hover:text-green-900"
                              title="Editar recordatorio"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(recordatorio.id, recordatorio.titulo)}
                              className="text-red-600 transition-colors cursor-pointer hover:text-red-900"
                              title="Eliminar recordatorio"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Información adicional */}
        {filteredRecordatorios.length > 0 && (
          <div className="mt-6 text-center text-gray-500">
            <p className="text-sm">
              Mostrando {filteredRecordatorios.length} de {recordatorios.length} recordatorios
            </p>
          </div>
        )}
      </div>
    </div>
  );
}