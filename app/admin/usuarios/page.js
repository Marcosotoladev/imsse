// app/admin/usuarios/page.jsx - Gestión de Usuarios IMSSE con Modal
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LogOut,
  Users,
  Shield,
  UserCheck,
  UserX,
  Clock,
  Building,
  Calendar,
  Search,
  MoreVertical,
  UserPlus
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/services/apiService';

export default function GestionUsuarios() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [filtros, setFiltros] = useState({
    busqueda: '',
    rol: 'todos',
    estado: 'todos',
    metodo: 'todos'
  });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [procesando, setProcesando] = useState(false);
  
  // Estados para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfil = await apiService.obtenerPerfilUsuario(currentUser.uid);
          if (perfil.rol !== 'admin') {
            router.push('/admin');
            return;
          }

          setUser(currentUser);
          await cargarDatos();
        } catch (error) {
          console.error('Error al verificar permisos:', error);
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const usuariosData = await apiService.obtenerUsuarios();
      
      // La estructura correcta es usuariosData.users
      const usuarios = usuariosData.users || [];
      
      // Calcular estadísticas
      const estadisticas = {
        total: usuarios.length,
        admins: usuarios.filter(u => u.rol === 'admin').length,
        tecnicos: usuarios.filter(u => u.rol === 'tecnico').length,
        clientes: usuarios.filter(u => u.rol === 'cliente').length,
        activos: usuarios.filter(u => u.estado === 'activo').length,
        pendientes: usuarios.filter(u => u.estado === 'pendiente').length,
        inactivos: usuarios.filter(u => u.estado === 'inactivo').length
      };
      
      setUsuarios(usuarios);
      setUsuariosFiltrados(usuarios);
      setEstadisticas(estadisticas);
    } catch (error) {
      console.error('Error al cargar datos de usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let resultado = usuarios;

    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(usuario =>
        usuario.nombreCompleto?.toLowerCase().includes(busqueda) ||
        usuario.email?.toLowerCase().includes(busqueda) ||
        usuario.empresa?.toLowerCase().includes(busqueda)
      );
    }

    if (filtros.rol !== 'todos') {
      resultado = resultado.filter(usuario => usuario.rol === filtros.rol);
    }

    if (filtros.estado !== 'todos') {
      resultado = resultado.filter(usuario => usuario.estado === filtros.estado);
    }

    if (filtros.metodo !== 'todos') {
      if (filtros.metodo === 'google') {
        resultado = resultado.filter(usuario => usuario.metodoBegistro === 'google');
      } else {
        resultado = resultado.filter(usuario => usuario.metodoBegistro !== 'google');
      }
    }

    setUsuariosFiltrados(resultado);
  }, [filtros, usuarios]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Funciones para el modal
  const abrirModal = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalAbierto(true);
    setUsuarioEditando(null); // Cerrar dropdown si estaba abierto
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
  };

  const handleCambiarRolModal = async (nuevoRol) => {
    if (!usuarioSeleccionado) return;
    
    if (!confirm(`¿Cambiar rol de "${usuarioSeleccionado.nombreCompleto || usuarioSeleccionado.email}" a "${nuevoRol}"?`)) return;
    
    setProcesando(true);
    try {
      await apiService.actualizarUsuario(usuarioSeleccionado.id, { rol: nuevoRol });
      await cargarDatos();
      alert(`✅ Rol actualizado a "${nuevoRol}"`);
      cerrarModal();
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      alert('❌ Error al cambiar el rol');
    } finally {
      setProcesando(false);
    }
  };

  const handleCambiarEstadoModal = async (nuevoEstado) => {
    if (!usuarioSeleccionado) return;
    
    const mensajes = {
      activo: '¿Activar este usuario?',
      inactivo: '¿Desactivar este usuario?',
      pendiente: '¿Marcar como pendiente?'
    };
    
    if (!confirm(`${mensajes[nuevoEstado]} Usuario: ${usuarioSeleccionado.nombreCompleto || usuarioSeleccionado.email}`)) return;
    
    setProcesando(true);
    try {
      await apiService.actualizarUsuario(usuarioSeleccionado.id, { estado: nuevoEstado });
      await cargarDatos();
      alert(`✅ Estado actualizado a "${nuevoEstado}"`);
      cerrarModal();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('❌ Error al cambiar el estado');
    } finally {
      setProcesando(false);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeColor = (valor, tipo) => {
    const colores = {
      rol: {
        admin: 'bg-red-100 text-red-800',
        tecnico: 'bg-blue-100 text-blue-800',
        cliente: 'bg-green-100 text-green-800'
      },
      estado: {
        activo: 'bg-green-100 text-green-800',
        pendiente: 'bg-yellow-100 text-yellow-800',
        inactivo: 'bg-gray-100 text-gray-800'
      },
      metodo: {
        google: 'bg-purple-100 text-purple-800',
        email: 'bg-blue-100 text-blue-800'
      }
    };

    return colores[tipo]?.[valor] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando gestión de usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white shadow bg-primary">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/logo/imsse-logo.png"
                alt="IMSSE Logo"
                className="w-6 h-6 mr-2 md:w-8 md:h-8 md:mr-3"
              />
              <h1 className="text-lg font-bold md:text-xl font-montserrat">IMSSE</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="hidden text-sm md:inline">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center p-2 text-white rounded-md hover:bg-red-700"
              >
                <LogOut size={16} className="md:mr-2" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center text-sm">
            <Link href="/admin/panel-control" className="text-primary hover:underline">
              <Home size={14} className="inline mr-1" />
              Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="font-medium text-gray-700">Gestión de Usuarios</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 mx-auto max-w-7xl">
        {/* Título y estadísticas */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold font-montserrat text-primary">
                Gestión de Usuarios
              </h2>
              <p className="text-gray-600">
                Administre usuarios, roles y permisos del sistema IMSSE
              </p>
            </div>
            <Link
              href="/registro"
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700"
            >
              <UserPlus size={18} className="mr-2" />
              Nuevo Usuario
            </Link>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-3 lg:grid-cols-6">
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.admins || 0}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Técnicos</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.tecnicos || 0}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.clientes || 0}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.pendientes || 0}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.activos || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-4 mb-6 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  placeholder="Nombre, email, empresa..."
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Rol</label>
              <select
                value={filtros.rol}
                onChange={(e) => setFiltros(prev => ({ ...prev, rol: e.target.value }))}
                className="w-full py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="tecnico">Técnicos</option>
                <option value="cliente">Clientes</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="pendiente">Pendientes</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Método</label>
              <select
                value={filtros.metodo}
                onChange={(e) => setFiltros(prev => ({ ...prev, metodo: e.target.value }))}
                className="w-full py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos</option>
                <option value="google">Google</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFiltros({ busqueda: '', rol: 'todos', estado: 'todos', metodo: 'todos' })}
                className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Método
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                            <span className="text-sm font-medium text-gray-700">
                              {usuario.nombreCompleto?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombreCompleto || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">{usuario.email}</div>
                          {usuario.empresa && (
                            <div className="text-xs text-gray-400">{usuario.empresa}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(usuario.rol, 'rol')}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(usuario.estado, 'estado')}`}>
                        {usuario.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(usuario.metodoBegistro === 'google' ? 'google' : 'email', 'metodo')}`}>
                        {usuario.metodoBegistro === 'google' ? 'Google' : 'Email'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatearFecha(usuario.fechaCreacion)}
                    </td>
                    <td className="relative px-6 py-4">
                      <button
                        onClick={() => abrirModal(usuario)}
                        className="p-2 text-gray-600 transition-colors rounded-md hover:bg-gray-100 hover:text-gray-900"
                        title="Gestionar usuario"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {usuariosFiltrados.length === 0 && (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filtros.busqueda || filtros.rol !== 'todos' || filtros.estado !== 'todos' || filtros.metodo !== 'todos'
                  ? 'No se encontraron usuarios con los filtros aplicados.'
                  : 'Aún no hay usuarios registrados en el sistema.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Acciones rápidas para usuarios pendientes */}
        {estadisticas.pendientes > 0 && (
          <div className="p-4 mt-6 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-yellow-600" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Usuarios pendientes de aprobación
                </h3>
                <p className="text-sm text-yellow-700">
                  Hay {estadisticas.pendientes} usuario(s) esperando aprobación.
                  Use los filtros para verlos y aprobarlos.
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setFiltros(prev => ({ ...prev, estado: 'pendiente' }))}
                  className="px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200"
                >
                  Ver pendientes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="p-6 mt-8 text-center bg-white border border-red-200 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Gestión de usuarios del sistema - Panel de administración</p>
            <p className="mt-2">
              <span className="font-medium">Total de usuarios registrados:</span> {estadisticas.total || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de gestión de usuarios */}
      {modalAbierto && usuarioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Gestionar Usuario</h3>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={procesando}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Información del usuario */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-300 rounded-full">
                    <span className="text-lg font-medium text-gray-700">
                      {usuarioSeleccionado.nombreCompleto?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {usuarioSeleccionado.nombreCompleto || 'Sin nombre'}
                  </div>
                  <div className="text-sm text-gray-500">{usuarioSeleccionado.email}</div>
                  {usuarioSeleccionado.empresa && (
                    <div className="text-xs text-gray-400">{usuarioSeleccionado.empresa}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-4">
              {/* Cambiar rol */}
              <div className="mb-6">
                <h4 className="mb-3 text-sm font-medium text-gray-700">Cambiar Rol</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['admin', 'tecnico', 'cliente'].map(rol => (
                    <button
                      key={rol}
                      onClick={() => handleCambiarRolModal(rol)}
                      disabled={procesando || usuarioSeleccionado.rol === rol}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        usuarioSeleccionado.rol === rol
                          ? 'bg-primary text-white cursor-default'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                      }`}
                    >
                      {usuarioSeleccionado.rol === rol ? '✓ ' : ''}{rol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cambiar estado */}
              <div className="mb-4">
                <h4 className="mb-3 text-sm font-medium text-gray-700">Cambiar Estado</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'activo', label: 'Activo', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
                    { key: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
                    { key: 'inactivo', label: 'Inactivo', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' }
                  ].map(estado => (
                    <button
                      key={estado.key}
                      onClick={() => handleCambiarEstadoModal(estado.key)}
                      disabled={procesando || usuarioSeleccionado.estado === estado.key}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        usuarioSeleccionado.estado === estado.key
                          ? 'bg-primary text-white cursor-default'
                          : estado.color + ' disabled:opacity-50'
                      }`}
                    >
                      {usuarioSeleccionado.estado === estado.key ? '✓ ' : ''}{estado.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 rounded-b-lg bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={cerrarModal}
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {procesando ? 'Procesando...' : 'Cerrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}