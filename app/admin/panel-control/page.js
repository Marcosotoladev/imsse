// app/admin/panel-control/page.jsx - Panel para Admin y Técnicos
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LogOut,
  Users,
  Wrench,
  Bell,
  Plus,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  Receipt,
  Truck,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/services/apiService';

export default function PanelControl() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({});
  const [documentosRecientes, setDocumentosRecientes] = useState({
    ordenes: [],
    recordatorios: []
  });

  // Configuración específica por rol
  const configuracionModulos = {
    admin: {
      documentos: [
        { key: 'presupuestos', nombre: 'Presupuestos', icono: FileText, color: 'blue', acceso: true },
        { key: 'recibos', nombre: 'Recibos', icono: Receipt, color: 'green', acceso: true },
        { key: 'remitos', nombre: 'Remitos', icono: Truck, color: 'purple', acceso: true },
        { key: 'estados', nombre: 'Estados de Cuenta', icono: CreditCard, color: 'orange', acceso: true },
        { key: 'ordenes', nombre: 'Órdenes de Trabajo', icono: Wrench, color: 'red', acceso: true },
        { key: 'recordatorios', nombre: 'Recordatorios', icono: Bell, color: 'yellow', acceso: true }
      ],
      herramientas: [
        { key: 'usuarios', nombre: 'Gestión de Usuarios', icono: Users, url: '/admin/usuarios' },
        { key: 'estadisticas', nombre: 'Estadísticas', icono: BarChart3, url: '/admin/estadisticas' },
        { key: 'configuracion', nombre: 'Configuración', icono: Settings, url: '/admin/configuracion' }
      ]
    },
    tecnico: {
      documentos: [
        { key: 'ordenes', nombre: 'Órdenes de Trabajo', icono: Wrench, color: 'red', acceso: true },
        { key: 'recordatorios', nombre: 'Recordatorios', icono: Bell, color: 'yellow', acceso: true }
      ],
      herramientas: [
        // Sin herramientas adicionales por ahora
      ]
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);
          
          // Verificar que tenga acceso (admin o técnico)
          if (perfilUsuario.rol !== 'admin' && perfilUsuario.rol !== 'tecnico') {
            router.push('/cliente/dashboard');
            return;
          }

          // Verificar estado activo
          if (perfilUsuario.estado !== 'activo') {
            router.push('/admin');
            return;
          }

          setUser(currentUser);
          setPerfil(perfilUsuario);
          await cargarDatos(perfilUsuario);
        } catch (error) {
          console.error('Error al verificar usuario:', error);
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarDatos = async (perfilUsuario) => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      const stats = {};
      const docsRecientes = {};

      if (perfilUsuario.rol === 'admin') {
        // Admin ve todo
        try {
          const [presupuestos, recibos, remitos, estados, ordenes, recordatorios, usuarios] = await Promise.allSettled([
            apiService.obtenerPresupuestos(),
            apiService.obtenerRecibos(),
            apiService.obtenerRemitos(),
            apiService.obtenerEstadosCuenta(),
            apiService.obtenerOrdenesTrabajo(),
            apiService.obtenerRecordatorios(),
            apiService.obtenerUsuarios()
          ]);

          stats.presupuestos = presupuestos.status === 'fulfilled' ? (presupuestos.value?.documents || presupuestos.value || []).length : 0;
          stats.recibos = recibos.status === 'fulfilled' ? (recibos.value?.documents || recibos.value || []).length : 0;
          stats.remitos = remitos.status === 'fulfilled' ? (remitos.value?.documents || remitos.value || []).length : 0;
          stats.estados = estados.status === 'fulfilled' ? (estados.value?.documents || estados.value || []).length : 0;
          stats.ordenes = ordenes.status === 'fulfilled' ? (ordenes.value?.documents || ordenes.value || []).length : 0;
          stats.recordatorios = recordatorios.status === 'fulfilled' ? (recordatorios.value?.documents || recordatorios.value || []).length : 0;
          stats.usuarios = usuarios.status === 'fulfilled' ? (usuarios.value?.users || usuarios.value || []).length : 0;

          // Documentos recientes para admin
          docsRecientes.ordenes = ordenes.status === 'fulfilled' ? (ordenes.value?.documents || ordenes.value || []).slice(0, 5) : [];
          docsRecientes.recordatorios = recordatorios.status === 'fulfilled' ? (recordatorios.value?.documents || recordatorios.value || []).slice(0, 5) : [];

        } catch (error) {
          console.error('Error cargando datos de admin:', error);
        }
      } else if (perfilUsuario.rol === 'tecnico') {
        // Técnico solo ve órdenes y recordatorios
        try {
          const [ordenes, recordatorios] = await Promise.allSettled([
            apiService.obtenerOrdenesTrabajo(),
            apiService.obtenerRecordatorios()
          ]);

          stats.ordenes = ordenes.status === 'fulfilled' ? (ordenes.value?.documents || ordenes.value || []).length : 0;
          stats.recordatorios = recordatorios.status === 'fulfilled' ? (recordatorios.value?.documents || recordatorios.value || []).length : 0;

          // Documentos recientes para técnico
          docsRecientes.ordenes = ordenes.status === 'fulfilled' ? (ordenes.value?.documents || ordenes.value || []).slice(0, 5) : [];
          docsRecientes.recordatorios = recordatorios.status === 'fulfilled' ? (recordatorios.value?.documents || recordatorios.value || []).slice(0, 5) : [];

        } catch (error) {
          console.error('Error cargando datos de técnico:', error);
        }
      }

      setEstadisticas(stats);
      setDocumentosRecientes(docsRecientes);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
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

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getColorClasses = (color) => {
    const colores = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
    };
    return colores[color] || colores.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  const configuracion = configuracionModulos[perfil?.rol] || configuracionModulos.tecnico;

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
              <div>
                <h1 className="text-lg font-bold md:text-xl font-montserrat">IMSSE</h1>
                <p className="text-xs text-red-100 md:text-sm">
                  {perfil?.rol === 'admin' ? 'Panel Administrador' : 'Panel Técnico'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium">{perfil?.nombreCompleto}</p>
                <p className="text-xs text-red-100 capitalize">{perfil?.rol}</p>
              </div>
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

      <div className="px-4 py-6 mx-auto max-w-7xl">
        {/* Bienvenida */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 font-montserrat">
            ¡Bienvenido, {perfil?.nombre}!
          </h2>
          <p className="text-gray-600">
            {perfil?.rol === 'admin' 
              ? 'Panel completo de administración del sistema IMSSE'
              : 'Gestiona tus órdenes de trabajo y recordatorios'
            }
          </p>
        </div>

        {/* Estadísticas de documentos */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {configuracion.documentos.map((modulo) => {
            const IconoComponente = modulo.icono;
            const cantidad = estadisticas[modulo.key] || 0;

            return (
              <Link
                key={modulo.key}
                href={`/admin/${modulo.key}`}
                className={`p-6 rounded-lg shadow transition-colors border ${getColorClasses(modulo.color)}`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm">
                    <IconoComponente size={24} className={`text-${modulo.color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">
                      {modulo.nombre}
                    </p>
                    <p className="text-2xl font-bold">
                      {cantidad}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Estadística de usuarios solo para admin */}
          {perfil?.rol === 'admin' && (
            <Link
              href="/admin/usuarios"
              className="p-6 transition-colors bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
                  <Users size={24} className="text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Usuarios
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {estadisticas.usuarios || 0}
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          {/* Órdenes de trabajo recientes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wrench className="w-5 h-5 mr-2 text-red-600" />
                  <h3 className="text-lg font-medium text-gray-900">Órdenes de Trabajo</h3>
                </div>
                <Link
                  href="/admin/ordenes/nuevo"
                  className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
                >
                  <Plus size={16} className="mr-1" />
                  Nueva
                </Link>
              </div>
            </div>
            <div className="px-6 py-4">
              {documentosRecientes.ordenes?.length > 0 ? (
                <div className="space-y-3">
                  {documentosRecientes.ordenes.map((orden, index) => (
                    <div
                      key={orden.id || index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {orden.numero || orden.titulo || `Orden #${index + 1}`}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatearFecha(orden.fechaCreacion)}
                        </p>
                      </div>
                      <Link
                        href={`/admin/ordenes/${orden.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Ver
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Wrench className="w-12 h-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay órdenes recientes
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Crea una nueva orden de trabajo para comenzar.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recordatorios recientes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-yellow-600" />
                  <h3 className="text-lg font-medium text-gray-900">Recordatorios</h3>
                </div>
                <Link
                  href="/admin/recordatorios/nuevo"
                  className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
                >
                  <Plus size={16} className="mr-1" />
                  Nuevo
                </Link>
              </div>
            </div>
            <div className="px-6 py-4">
              {documentosRecientes.recordatorios?.length > 0 ? (
                <div className="space-y-3">
                  {documentosRecientes.recordatorios.map((recordatorio, index) => (
                    <div
                      key={recordatorio.id || index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {recordatorio.titulo || `Recordatorio #${index + 1}`}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatearFecha(recordatorio.fechaCreacion)}
                        </p>
                      </div>
                      <Link
                        href={`/admin/recordatorios/${recordatorio.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Ver
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Bell className="w-12 h-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay recordatorios
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Crea un nuevo recordatorio para organizar tu trabajo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documentos disponibles solo para admin */}
        {perfil?.rol === 'admin' && (
          <div className="mb-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-900">Gestión de Documentos</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {configuracion.documentos.filter(doc => !['ordenes', 'recordatorios'].includes(doc.key)).map((modulo) => {
                const IconoComponente = modulo.icono;

                return (
                  <Link
                    key={modulo.key}
                    href={`/admin/${modulo.key}`}
                    className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow hover:shadow-md"
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${getColorClasses(modulo.color)}`}>
                        <IconoComponente size={24} />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{modulo.nombre}</h4>
                        <p className="text-xs text-gray-500">Gestionar {modulo.nombre.toLowerCase()}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Herramientas adicionales - Solo mostrar si hay herramientas */}
        {configuracion.herramientas.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-6 text-xl font-semibold text-gray-900">Herramientas</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {configuracion.herramientas.map((herramienta) => {
                const IconoComponente = herramienta.icono;

                return (
                  <Link
                    key={herramienta.key}
                    href={herramienta.url}
                    className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow hover:shadow-md"
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <IconoComponente size={24} className="text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{herramienta.nombre}</h4>
                        <p className="text-xs text-gray-500">
                          {herramienta.key === 'usuarios' && 'Gestionar usuarios y permisos'}
                          {herramienta.key === 'estadisticas' && 'Ver estadísticas del sistema'}
                          {herramienta.key === 'configuracion' && 'Configuración del sistema'}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Información del sistema */}
        <div className="p-6 text-center bg-white border border-blue-200 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Sistema de gestión de documentos - Protección contra incendios</p>
            <p className="mt-2">
              <span className="font-medium">
                {perfil?.rol === 'admin' ? 'Panel de Administración' : 'Panel Técnico'}
              </span>
              {perfil?.rol === 'tecnico' && (
                <span> - Órdenes de trabajo y recordatorios</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}