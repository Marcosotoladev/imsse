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
  LayoutGrid,
  Key,
  Edit,
  Lock,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Filter,
  ChevronDown,
  ChevronUp,
  RotateCcw
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
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Estados para modales de creación, edición y contraseña
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);

  const [formDataCrear, setFormDataCrear] = useState({
    nombre: '',
    apellido: '',
    email: '',
    esEmailFicticio: false,
    empresa: '',
    telefono: '',
    rol: 'cliente',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });

  const [formDataEditar, setFormDataEditar] = useState({
    nombre: '',
    apellido: '',
    email: '',
    empresa: '',
    telefono: '',
    rol: 'cliente',
    estado: 'activo'
  });

  const [passwordState, setPasswordState] = useState({
    newPassword: '',
    confirmPassword: '',
    showNew: false,
    showConfirm: false
  });

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
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('crear') === 'true') {
        handleAbrirCrearModal();
      }
    }
  }, []);

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

  // Handlers para Crear Usuario desde Admin
  const handleAbrirCrearModal = () => {
    setFormDataCrear({
      nombre: '',
      apellido: '',
      email: '',
      esEmailFicticio: false,
      empresa: '',
      telefono: '',
      rol: 'cliente',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false
    });
    setModalCrearAbierto(true);
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    if (!formDataCrear.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    if (!formDataCrear.password || formDataCrear.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (formDataCrear.password !== formDataCrear.confirmPassword) {
      alert('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }
    if (!formDataCrear.esEmailFicticio && !formDataCrear.email.trim()) {
      alert('Ingresa un correo electrónico o selecciona la opción de correo ficticio');
      return;
    }

    setProcesando(true);
    try {
      await apiService.crearUsuarioAdmin(formDataCrear);
      alert('✅ Usuario creado exitosamente');
      setModalCrearAbierto(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert(`❌ Error al crear usuario: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  // Handlers para Editar Perfil de Usuario
  const handleAbrirEditarModal = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormDataEditar({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      empresa: usuario.empresa || '',
      telefono: usuario.telefono || '',
      rol: usuario.rol || 'cliente',
      estado: usuario.estado || 'activo'
    });
    setModalEditarAbierto(true);
    setModalAbierto(false);
  };

  const handleEditarUsuario = async (e) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;

    setProcesando(true);
    try {
      await apiService.actualizarUsuario(usuarioSeleccionado.id, formDataEditar);
      alert('✅ Usuario actualizado exitosamente');
      setModalEditarAbierto(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      alert(`❌ Error al actualizar usuario: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  // Handlers para Cambiar Contraseña desde Admin
  const handleAbrirPasswordModal = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setPasswordState({
      newPassword: '',
      confirmPassword: '',
      showNew: false,
      showConfirm: false
    });
    setModalPasswordAbierto(true);
    setModalAbierto(false);
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;

    if (!passwordState.newPassword || passwordState.newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setProcesando(true);
    try {
      await apiService.cambiarPasswordUsuario(usuarioSeleccionado.id, passwordState.newPassword);
      alert(`✅ Contraseña de "${usuarioSeleccionado.nombreCompleto || usuarioSeleccionado.email}" actualizada correctamente.`);
      setModalPasswordAbierto(false);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      alert(`❌ Error al cambiar la contraseña: ${error.message || 'Error desconocido'}`);
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
          <button
            onClick={handleAbrirCrearModal}
            className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-xl bg-primary hover:bg-red-700 shadow-sm"
          >
            <UserPlus size={18} className="mr-2" />
            + Nuevo
          </button>
        </div>

        {/* Filtros Colapsables */}
        {(() => {
          const filtrosActivosCount = (filtros.rol !== 'todos' ? 1 : 0) + (filtros.estado !== 'todos' ? 1 : 0) + (filtros.metodo !== 'todos' ? 1 : 0);

          return (
            <div className="p-3 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              {/* Barra Principal: Buscador + Botón Filtros + Toggle Vista */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Buscador de usuarios */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                    placeholder="Buscar por nombre, email, empresa..."
                    className="w-full py-2 pl-9 pr-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Botón Filtros (Despliega/Oculta opciones) */}
                <button
                  type="button"
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-xl transition-colors ${
                    mostrarFiltros || filtrosActivosCount > 0
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <SlidersHorizontal size={16} />
                  <span>Filtros</span>
                  {filtrosActivosCount > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-primary rounded-full font-bold">
                      {filtrosActivosCount}
                    </span>
                  )}
                  {mostrarFiltros ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Alternador de Vista (Tabla / Tarjetas) */}
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

              {/* Opciones Avanzadas de Filtro (Desplegable) */}
              {mostrarFiltros && (
                <div className="pt-3 mt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-600">Rol</label>
                    <select
                      value={filtros.rol}
                      onChange={(e) => setFiltros(prev => ({ ...prev, rol: e.target.value }))}
                      className="w-full py-2 px-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                    >
                      <option value="todos">Todos los roles</option>
                      <option value="admin">Administradores</option>
                      <option value="tecnico">Técnicos</option>
                      <option value="cliente">Clientes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-600">Estado</label>
                    <select
                      value={filtros.estado}
                      onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                      className="w-full py-2 px-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="activo">Activos</option>
                      <option value="inactivo">Inactivos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-600">Método de Registro</label>
                    <select
                      value={filtros.metodo}
                      onChange={(e) => setFiltros(prev => ({ ...prev, metodo: e.target.value }))}
                      className="w-full py-2 px-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                    >
                      <option value="todos">Todos</option>
                      <option value="google">Google</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3 flex justify-end pt-1">
                    <button
                      onClick={() => setFiltros({ busqueda: '', rol: 'todos', estado: 'todos', metodo: 'todos' })}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw size={13} />
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
              {/* Acciones Rápidas: Editar Perfil & Cambiar Contraseña */}
              <div className="p-4 mb-6 border border-gray-200 rounded-xl bg-gray-50/50">
                <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Acciones Rápidas</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAbrirEditarModal(usuarioSeleccionado)}
                    className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 shadow-sm"
                  >
                    <Edit size={16} className="mr-2 text-blue-600" />
                    Editar Perfil
                  </button>
                  <button
                    onClick={() => handleAbrirPasswordModal(usuarioSeleccionado)}
                    className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 shadow-sm"
                  >
                    <Key size={16} className="mr-2 text-yellow-600" />
                    Cambiar Contraseña
                  </button>
                </div>
              </div>

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
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'activo', label: 'Activo', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
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

      {/* MODAL CREAR USUARIO / TÉCNICO DESDE ADMIN */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserPlus size={20} className="mr-2 text-primary" />
                Crear Nuevo Usuario
              </h3>
              <button onClick={() => setModalCrearAbierto(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCrearUsuario} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rol del Usuario</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cliente', label: 'Cliente (Defecto)' },
                    { id: 'tecnico', label: 'Técnico' },
                    { id: 'admin', label: 'Administrador' }
                  ].map(r => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setFormDataCrear(prev => ({
                        ...prev,
                        rol: r.id,
                        esEmailFicticio: r.id === 'tecnico' ? true : prev.esEmailFicticio
                      }))}
                      className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-colors ${
                        formDataCrear.rol === r.id
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formDataCrear.nombre}
                    onChange={(e) => setFormDataCrear({ ...formDataCrear, nombre: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Ej: Juan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={formDataCrear.apellido}
                    onChange={(e) => setFormDataCrear({ ...formDataCrear, apellido: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Ej: Pérez"
                  />
                </div>
              </div>

              {/* Opción Email Ficticio / Interno */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="flex items-center text-xs font-medium text-blue-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formDataCrear.esEmailFicticio}
                    onChange={(e) => setFormDataCrear({ ...formDataCrear, esEmailFicticio: e.target.checked })}
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  No requiere correo real (Generar email interno automático)
                </label>
                {formDataCrear.esEmailFicticio && (
                  <p className="mt-1 text-[11px] text-blue-700">
                    Útil para técnicos. Se generará un email como: <span className="font-mono">tecnico.{formDataCrear.nombre.toLowerCase().trim() || 'nombre'}@imse.app</span>.
                  </p>
                )}
              </div>

              {!formDataCrear.esEmailFicticio && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico Real *</label>
                  <input
                    type="email"
                    required={!formDataCrear.esEmailFicticio}
                    value={formDataCrear.email}
                    onChange={(e) => setFormDataCrear({ ...formDataCrear, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={formDataCrear.empresa}
                    onChange={(e) => setFormDataCrear({ ...formDataCrear, empresa: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formDataCrear.telefono}
                    onChange={(e) => setFormDataCrear({ ...formDataCrear, telefono: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Ej: +54 9 11..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña Inicial *</label>
                  <div className="relative">
                    <input
                      type={formDataCrear.showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formDataCrear.password}
                      onChange={(e) => setFormDataCrear({ ...formDataCrear, password: e.target.value })}
                      className="w-full px-3 py-2 pr-9 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setFormDataCrear(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {formDataCrear.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
                  <div className="relative">
                    <input
                      type={formDataCrear.showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formDataCrear.confirmPassword}
                      onChange={(e) => setFormDataCrear({ ...formDataCrear, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-9 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Repite la contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setFormDataCrear(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {formDataCrear.showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {procesando ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PERFIL DE USUARIO */}
      {modalEditarAbierto && usuarioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Edit size={20} className="mr-2 text-blue-600" />
                Editar Perfil de Usuario
              </h3>
              <button onClick={() => setModalEditarAbierto(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleEditarUsuario} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formDataEditar.nombre}
                    onChange={(e) => setFormDataEditar({ ...formDataEditar, nombre: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={formDataEditar.apellido}
                    onChange={(e) => setFormDataEditar({ ...formDataEditar, apellido: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email / Identificador</label>
                <input
                  type="email"
                  value={formDataEditar.email}
                  onChange={(e) => setFormDataEditar({ ...formDataEditar, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={formDataEditar.empresa}
                    onChange={(e) => setFormDataEditar({ ...formDataEditar, empresa: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formDataEditar.telefono}
                    onChange={(e) => setFormDataEditar({ ...formDataEditar, telefono: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={formDataEditar.rol}
                    onChange={(e) => setFormDataEditar({ ...formDataEditar, rol: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={formDataEditar.estado}
                    onChange={(e) => setFormDataEditar({ ...formDataEditar, estado: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(false)}
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {procesando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR CONTRASEÑA */}
      {modalPasswordAbierto && usuarioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Key size={20} className="mr-2 text-yellow-600" />
                Cambiar Contraseña
              </h3>
              <button onClick={() => setModalPasswordAbierto(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCambiarPassword} className="p-6 space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500">Usuario:</p>
                <p className="text-sm font-medium text-gray-900">{usuarioSeleccionado.nombreCompleto || 'Sin nombre'}</p>
                <p className="text-xs text-gray-500 font-mono">{usuarioSeleccionado.email}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={passwordState.showNew ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordState.newPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Ingresa la nueva clave"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordState(prev => ({ ...prev, showNew: !prev.showNew }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {passwordState.showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={passwordState.showConfirm ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordState.confirmPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Repite la nueva clave"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordState(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {passwordState.showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalPasswordAbierto(false)}
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {procesando ? 'Guardando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}