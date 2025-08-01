// app/admin/panel-control/page.jsx - Panel Simplificado para Admin y Técnicos
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  Users,
  Plus,
  FileText,
  Receipt,
  Truck,
  CreditCard,
  Wrench,
  Bell
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
      accionesRapidas: [
        { key: 'presupuestos', nombre: 'Nuevo Presupuesto', icono: FileText, url: '/admin/presupuestos/nuevo', color: 'blue' },
        { key: 'estados', nombre: 'Nuevo Estado de Cuenta', icono: CreditCard, url: '/admin/estados/nuevo', color: 'orange' },
        { key: 'recibos', nombre: 'Nuevo Recibo', icono: Receipt, url: '/admin/recibos/nuevo', color: 'green' },
        { key: 'remitos', nombre: 'Nuevo Remito', icono: Truck, url: '/admin/remitos/nuevo', color: 'purple' },
        { key: 'ordenes', nombre: 'Nueva Orden de Trabajo', icono: Wrench, url: '/admin/ordenes/nuevo', color: 'red' },
        { key: 'recordatorios', nombre: 'Nuevo Recordatorio', icono: Bell, url: '/admin/recordatorios/nuevo', color: 'yellow' }
      ]
    },
    tecnico: {
      documentos: [
        { key: 'ordenes', nombre: 'Órdenes de Trabajo', icono: Wrench, color: 'red', acceso: true },
        { key: 'recordatorios', nombre: 'Recordatorios', icono: Bell, color: 'yellow', acceso: true }
      ],
      accionesRapidas: [
        { key: 'ordenes', nombre: 'Nueva Orden de Trabajo', icono: Wrench, url: '/admin/ordenes/nuevo', color: 'red' },
        { key: 'recordatorios', nombre: 'Nuevo Recordatorio', icono: Bell, url: '/admin/recordatorios/nuevo', color: 'yellow' }
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
          await cargarEstadisticas(perfilUsuario);
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

  const cargarEstadisticas = async (perfilUsuario) => {
    try {
      setLoading(true);
      
      const stats = {};

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

        } catch (error) {
          console.error('Error cargando datos de técnico:', error);
        }
      }

      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
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

  const getActionButtonClasses = (color) => {
    const colores = {
      blue: 'bg-white border-2 border-blue-200 text-blue-800 hover:border-blue-400 hover:bg-blue-50',
      green: 'bg-white border-2 border-green-200 text-green-800 hover:border-green-400 hover:bg-green-50',
      purple: 'bg-white border-2 border-purple-200 text-purple-800 hover:border-purple-400 hover:bg-purple-50',
      orange: 'bg-white border-2 border-orange-200 text-orange-800 hover:border-orange-400 hover:bg-orange-50',
      red: 'bg-white border-2 border-red-200 text-red-800 hover:border-red-400 hover:bg-red-50',
      yellow: 'bg-white border-2 border-yellow-200 text-yellow-800 hover:border-yellow-400 hover:bg-yellow-50'
    };
    return colores[color] || colores.blue;
  };

  const getIconBgClasses = (color) => {
    const colores = {
      blue: 'bg-blue-100',
      green: 'bg-green-100',
      purple: 'bg-purple-100',
      orange: 'bg-orange-100',
      red: 'bg-red-100',
      yellow: 'bg-yellow-100'
    };
    return colores[color] || colores.blue;
  };

  const getIconColorClasses = (color) => {
    const colores = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600'
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
        <div className="px-4 py-3 mx-auto max-w-7xl">
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
        <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-5">
          {configuracion.documentos.map((modulo) => {
            const IconoComponente = modulo.icono;
            const cantidad = estadisticas[modulo.key] || 0;

            return (
              <Link
                key={modulo.key}
                href={`/admin/${modulo.key}`}
                className={`p-4 md:p-6 rounded-lg shadow transition-colors border ${getColorClasses(modulo.color)}`}
              >
                <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                  <div className="flex-shrink-0 p-2 mb-3 bg-white rounded-lg shadow-sm md:p-3 md:mb-0">
                    <IconoComponente size={20} className={`md:size-6 text-${modulo.color}-600`} />
                  </div>
                  <div className="md:ml-4">
                    <p className="text-xs font-medium md:text-sm">
                      {modulo.nombre}
                    </p>
                    <p className="text-lg font-bold md:text-2xl">
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
              className="p-4 transition-colors bg-white border border-gray-200 rounded-lg shadow md:p-6 hover:bg-gray-50"
            >
              <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                <div className="flex-shrink-0 p-2 mb-3 bg-gray-100 rounded-lg md:p-3 md:mb-0">
                  <Users size={20} className="text-gray-600 md:size-6" />
                </div>
                <div className="md:ml-4">
                  <p className="text-xs font-medium text-gray-900 md:text-sm">
                    Usuarios
                  </p>
                  <p className="text-lg font-bold text-gray-900 md:text-2xl">
                    {estadisticas.usuarios || 0}
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-8">
          <h3 className="mb-6 text-xl font-semibold text-gray-900">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {configuracion.accionesRapidas.map((accion) => {
              const IconoComponente = accion.icono;

              return (
                <Link
                  key={accion.key}
                  href={accion.url}
                  className={`p-6 rounded-lg shadow transition-all hover:shadow-md ${getActionButtonClasses(accion.color)}`}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-lg ${getIconBgClasses(accion.color)}`}>
                      <IconoComponente size={24} className={getIconColorClasses(accion.color)} />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium">{accion.nombre}</h4>
                      <p className="text-xs opacity-75">
                        Crear {accion.nombre.toLowerCase().replace('nuevo ', '').replace('nueva ', '')}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

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