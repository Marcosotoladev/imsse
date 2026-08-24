// app/admin/usuarios/page.jsx - Gestión de Usuarios IMSSE con Permisos Granulares y Eliminación
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Shield,
  Clock,
  Search,
  MoreVertical,
  UserPlus,
  FileText,
  Receipt,
  Truck,
  CreditCard,
  Wrench,
  Bell,
  List,
  LayoutGrid
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function GestionUsuarios() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    rol: 'todos',
    estado: 'todos',
    metodo: 'todos'
  });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [vista, setVista] = useState('tabla'); // 'tabla' | 'cards'

  // Estados para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Estados para permisos
  const [permisosTemporales, setPermisosTemporales] = useState({});

  // Iconos para cada tipo de documento
  const iconosDocumentos = {
    presupuestos: FileText,
    recibos: Receipt,
    remitos: Truck,
    estados: CreditCard,
    ordenes: Wrench,
    recordatorios: Bell
  };

  // Nombres legibles para los tipos de documentos
  const nombresDocumentos = {
    presupuestos: 'Presupuestos',
    recibos: 'Recibos',
    remitos: 'Remitos',
    estados: 'Estados de Cuenta',
    ordenes: 'Órdenes de Trabajo',
    recordatorios: 'Recordatorios'
  };

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

      setUsuarios(usuarios);
      setUsuariosFiltrados(usuarios);
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
        resultado = resultado.filter(usuario => usuario.metodoRegistro === 'google');
      } else {
        resultado = resultado.filter(usuario => usuario.metodoRegistro !== 'google');
      }
    }

    setUsuariosFiltrados(resultado);
  }, [filtros, usuarios]);

  // Funciones para el modal
  const abrirModal = (usuario) => {
    setUsuarioSeleccionado(usuario);
    // Inicializar permisos temporales con los permisos actuales del usuario
    setPermisosTemporales(usuario.permisos || {
      presupuestos: false,
      recibos: false,
      remitos: false,
      estados: false,
      ordenes: false,
      recordatorios: false
    });
    setModalAbierto(true);
    setUsuarioEditando(null); // Cerrar dropdown si estaba abierto
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
    setPermisosTemporales({});
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

  // Función para cambiar un permiso específico
  const handleCambiarPermiso = (tipoDocumento, valor) => {
    setPermisosTemporales(prev => ({
      ...prev,
      [tipoDocumento]: valor
    }));
  };

  // Función para guardar los permisos
  const handleGuardarPermisos = async () => {
    if (!usuarioSeleccionado) return;

    setProcesando(true);
    try {
      await apiService.actualizarUsuario(usuarioSeleccionado.id, {
        permisos: permisosTemporales
      });
      await cargarDatos();
      alert('✅ Permisos actualizados correctamente');
      cerrarModal();
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      alert('❌ Error al actualizar los permisos');
    } finally {
      setProcesando(false);
    }
  };

  // Función para eliminar usuario
  const handleEliminarUsuario = async () => {
    if (!usuarioSeleccionado) return;

    // Primera confirmación
    const nombreUsuario = usuarioSeleccionado.nombreCompleto || usuarioSeleccionado.email;
    const primeraConfirmacion = confirm(
      `⚠️ ¿Estás seguro de que quieres ELIMINAR permanentemente al usuario "${nombreUsuario}"?\n\n` +
      `Esta acción NO se puede deshacer y eliminará:\n` +
      `• El usuario del sistema\n` +
      `• Su acceso a la plataforma\n` +
      `• Sus configuraciones y permisos\n\n` +
      `Haz clic en "Aceptar" para continuar o "Cancelar" para abortar.`
    );

    if (!primeraConfirmacion) return;

    // Segunda confirmación - más específica
    const segundaConfirmacion = confirm(
      `🚨 CONFIRMACIÓN FINAL\n\n` +
      `Vas a eliminar permanentemente a:\n` +
      `Usuario: ${nombreUsuario}\n` +
      `Email: ${usuarioSeleccionado.email}\n` +
      `Rol: ${usuarioSeleccionado.rol}\n\n` +
      `Esta acción es IRREVERSIBLE.\n\n` +
      `¿Confirmas la eliminación?`
    );

    if (!segundaConfirmacion) return;

    setProcesando(true);
    try {
      // Llamar a la API para eliminar usuario
      await apiService.eliminarUsuario(usuarioSeleccionado.id);

      // Recargar datos
      await cargarDatos();

      // Mostrar confirmación
      alert(`✅ Usuario "${nombreUsuario}" eliminado correctamente del sistema.`);

      // Cerrar modal
      cerrarModal();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert(`❌ Error al eliminar el usuario: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  // Función para activar/desactivar todos los permisos
  const handleToggleTodosPermisos = (activar) => {
    const nuevosPermisos = {};
    Object.keys(nombresDocumentos).forEach(tipo => {
      // Recordatorios siempre false para clientes
      nuevosPermisos[tipo] = tipo === 'recordatorios' ? false : activar;
    });
    setPermisosTemporales(nuevosPermisos);
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

  const usuariosPendientes = usuarios.filter(u => u.estado === 'pendiente').length;

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
      <div className="px-4 py-6 mx-auto max-w-7xl">
        {/* Título + acciones */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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
            className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-xl bg-primary hover:bg-red-700"
          >
            <UserPlus size={18} className="mr-2" />
            Nuevo Usuario
          </Link>
        </div>

        {/* Filtros */}
        <div className="p-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
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
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Rol</label>
              <select
                value={filtros.rol}
                onChange={(e) => setFiltros(prev => ({ ...prev, rol: e.target.value }))}
                className="w-full py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
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
                className="w-full py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
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
                className="w-full py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
              >
                <option value="todos">Todos</option>
                <option value="google">Google</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => setFiltros({ busqueda: '', rol: 'todos', estado: 'todos', metodo: 'todos' })}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
              <div className="flex overflow-hidden border border-gray-300 rounded-xl">
                <button
                  type="button"
                  onClick={() => setVista('tabla')}
                  title="Vista de tabla"
                  className={`p-2.5 ${vista === 'tabla' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <List size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setVista('cards')}
                  title="Vista de tarjetas"
                  className={`p-2.5 border-l border-gray-300 ${vista === 'cards' ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de usuarios: tabla o tarjetas */}
        {vista === 'cards' ? (
          <div className="bg-transparent">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {usuariosFiltrados.map((usuario) => (
                <div
                  key={usuario.id}
                  className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center min-w-0">
                      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gray-300 rounded-full">
                        <span className="text-sm font-medium text-gray-700">
                          {usuario.nombreCompleto?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="min-w-0 ml-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {usuario.nombreCompleto || 'Sin nombre'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
                        {usuario.empresa && (
                          <p className="text-xs text-gray-400 truncate">{usuario.empresa}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => abrirModal(usuario)}
                      className="flex items-center justify-center flex-shrink-0 w-10 h-10 ml-2 text-gray-600 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200"
                      title="Gestionar usuario"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(usuario.rol, 'rol')}`}>
                      {usuario.rol}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(usuario.estado, 'estado')}`}>
                      {usuario.estado}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(usuario.metodoRegistro === 'google' ? 'google' : 'email', 'metodo')}`}>
                      {usuario.metodoRegistro === 'google' ? 'Google' : 'Email'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {usuariosFiltrados.length === 0 && (
              <div className="p-12 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
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
        ) : (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="p-4 border-b border-gray-100 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Lista de Usuarios ({usuariosFiltrados.length})
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Gestión de usuarios, roles y permisos del sistema IMSSE
            </p>
          </div>

          <div className="table-scroll-container">
            <div className="table-wrapper">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Usuario
                    </th>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Rol
                    </th>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Estado
                    </th>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Método
                    </th>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Permisos
                    </th>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Registro
                    </th>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 sm:px-6">
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
                      <td className="px-3 py-4 sm:px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(usuario.rol, 'rol')}`}>
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="px-3 py-4 sm:px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(usuario.estado, 'estado')}`}>
                          {usuario.estado}
                        </span>
                      </td>
                      <td className="px-3 py-4 sm:px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(usuario.metodoRegistro === 'google' ? 'google' : 'email', 'metodo')}`}>
                          {usuario.metodoRegistro === 'google' ? 'Google' : 'Email'}
                        </span>
                      </td>
                      <td className="px-3 py-4 sm:px-6">
                        {usuario.rol === 'cliente' ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(usuario.permisos || {}).map(([tipo, activo]) => {
                              if (!activo) return null;

                              const IconoComponente = iconosDocumentos[tipo];
                              return (
                                <span
                                  key={tipo}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
                                  title={nombresDocumentos[tipo]}
                                >
                                  {IconoComponente && <IconoComponente size={12} className="mr-1" />}
                                  {tipo}
                                </span>
                              );
                            })}
                            {Object.values(usuario.permisos || {}).every(p => !p) && (
                              <span className="text-xs text-gray-500">Sin permisos</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Acceso completo</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 sm:px-6">
                        {formatearFecha(usuario.fechaCreacion)}
                      </td>
                      <td className="relative px-3 py-4 sm:px-6">
                        <button
                          onClick={() => abrirModal(usuario)}
                          className="flex items-center justify-center w-10 h-10 text-gray-600 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200"
                          title="Gestionar usuario"
                        >
                          <MoreVertical size={18} />
                        </button>
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
        )}

        {/* Acciones rápidas para usuarios pendientes */}
        {usuariosPendientes > 0 && (
          <div className="p-4 mt-6 border border-yellow-200 rounded-2xl bg-yellow-50">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-yellow-600" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Usuarios pendientes de aprobación
                </h3>
                <p className="text-sm text-yellow-700">
                  Hay {usuariosPendientes} usuario(s) esperando aprobación.
                  Use los filtros para verlos y aprobarlos.
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setFiltros(prev => ({ ...prev, estado: 'pendiente' }))}
                  className="px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-xl hover:bg-yellow-200"
                >
                  Ver pendientes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de gestión de usuarios CON PERMISOS GRANULARES Y ELIMINACIÓN */}
      {modalAbierto && usuarioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
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
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${usuarioSeleccionado.rol === rol
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
              <div className="mb-6">
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
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${usuarioSeleccionado.estado === estado.key
                          ? 'bg-primary text-white cursor-default'
                          : estado.color + ' disabled:opacity-50'
                        }`}
                    >
                      {usuarioSeleccionado.estado === estado.key ? '✓ ' : ''}{estado.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PERMISOS GRANULARES - Solo para clientes */}
              {usuarioSeleccionado.rol === 'cliente' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Permisos de Documentos</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleTodosPermisos(true)}
                        className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                        disabled={procesando}
                      >
                        Activar todos
                      </button>
                      <button
                        onClick={() => handleToggleTodosPermisos(false)}
                        className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                        disabled={procesando}
                      >
                        Desactivar todos
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="mb-3 text-xs text-gray-600">
                      Selecciona qué tipos de documentos puede ver este cliente:
                    </p>

                    <div className="space-y-3">
                      {Object.entries(nombresDocumentos).map(([tipo, nombre]) => {
                        const IconoComponente = iconosDocumentos[tipo];
                        const esRecordatorio = tipo === 'recordatorios';

                        return (
                          <label
                            key={tipo}
                            className={`flex items-center p-3 border rounded-md transition-colors ${esRecordatorio
                                ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                                : permisosTemporales[tipo]
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={permisosTemporales[tipo] || false}
                              onChange={(e) => handleCambiarPermiso(tipo, e.target.checked)}
                              disabled={procesando || esRecordatorio}
                              className={`mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ${esRecordatorio ? 'cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            />
                            <IconoComponente size={18} className={`mr-3 ${esRecordatorio ? 'text-gray-400' : permisosTemporales[tipo] ? 'text-blue-600' : 'text-gray-500'
                              }`} />
                            <div className="flex-1">
                              <span className={`text-sm font-medium ${esRecordatorio ? 'text-gray-400' : 'text-gray-700'
                                }`}>
                                {nombre}
                              </span>
                              {esRecordatorio && (
                                <p className="mt-1 text-xs text-gray-400">
                                  Solo disponible para administradores y técnicos
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    <div className="p-3 mt-4 border border-yellow-200 rounded-md bg-yellow-50">
                      <p className="text-xs text-yellow-800">
                        <strong>Nota:</strong> Los usuarios pueden ver únicamente los documentos que tengan asignados y para los cuales tengan permisos habilitados.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Información adicional para admin/técnico */}
              {(usuarioSeleccionado.rol === 'admin' || usuarioSeleccionado.rol === 'tecnico') && (
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Permisos</h4>
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {usuarioSeleccionado.rol === 'admin' ? 'Acceso completo al sistema' : 'Acceso a todos los documentos'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-blue-700">
                      {usuarioSeleccionado.rol === 'admin'
                        ? 'Los administradores pueden gestionar usuarios, documentos y configuraciones del sistema.'
                        : 'Los técnicos pueden ver y gestionar todos los documentos, y comunicarse con administradores.'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal CON BOTÓN ELIMINAR */}
            <div className="px-6 py-4 rounded-b-lg bg-gray-50">
              <div className="flex justify-between">
                {/* Botón de eliminar - lado izquierdo */}
                <button
                  onClick={handleEliminarUsuario}
                  disabled={procesando}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {procesando ? 'Eliminando...' : 'Eliminar Usuario'}
                </button>

                {/* Botones de la derecha */}
                <div className="flex space-x-3">
                  <button
                    onClick={cerrarModal}
                    disabled={procesando}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    {procesando ? 'Procesando...' : 'Cerrar'}
                  </button>

                  {/* Botón para guardar permisos - Solo para clientes */}
                  {usuarioSeleccionado.rol === 'cliente' && (
                    <button
                      onClick={handleGuardarPermisos}
                      disabled={procesando}
                      className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
                    >
                      {procesando ? 'Guardando...' : 'Guardar Permisos'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}