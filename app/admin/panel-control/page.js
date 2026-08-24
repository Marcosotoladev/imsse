// app/admin/panel-control/page.jsx - Panel Final con Calendario de Visitas y Control de Asistencia
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Wrench,
  Bell,
  BellRing,
  CalendarDays,
  Clock,
  Folder,
  Plus
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

// Documentos que se agrupan bajo la tarjeta "Documentos"
const DOCUMENTOS_SUB = [
  { key: 'presupuestos', nombre: 'Presupuestos', listUrl: '/admin/presupuestos', nuevoUrl: '/admin/presupuestos/nuevo' },
  { key: 'recibos', nombre: 'Recibos', listUrl: '/admin/recibos', nuevoUrl: '/admin/recibos/nuevo' },
  { key: 'remitos', nombre: 'Remitos', listUrl: '/admin/remitos', nuevoUrl: '/admin/remitos/nuevo' },
  { key: 'estados', nombre: 'Estados de Cuenta', listUrl: '/admin/estados', nuevoUrl: '/admin/estados/nuevo' },
  { key: 'facturas', nombre: 'Facturas', disabled: true }
];

// Configuración específica por rol: un solo listado de tarjetas (sin "acciones rápidas" separadas)
const configuracionModulos = {
  admin: [
    { key: 'ordenes', nombre: 'Órdenes de Trabajo', icono: Wrench, color: 'red', listUrl: '/admin/ordenes', nuevoUrl: '/admin/ordenes/nuevo' },
    { key: 'asistencia', nombre: 'Control de Asistencia', icono: Clock, color: 'teal', listUrl: '/admin/control-asistencia/admin' },
    { key: 'notificaciones', nombre: 'Notificaciones', icono: BellRing, disabled: true },
    { key: 'recordatorios', nombre: 'Recordatorios', icono: Bell, color: 'yellow', listUrl: '/admin/recordatorios', nuevoUrl: '/admin/recordatorios/nuevo' },
    { key: 'visitas', nombre: 'Calendario de Visitas', icono: CalendarDays, color: 'indigo', listUrl: '/admin/calendario-visitas', nuevoUrl: '/admin/calendario-visitas/nueva' },
    { key: 'documentos', nombre: 'Documentos', icono: Folder, esDocumentos: true, sub: DOCUMENTOS_SUB },
    { key: 'usuarios', nombre: 'Usuarios', icono: Users, color: 'slate', listUrl: '/admin/usuarios' }
  ],
  tecnico: [
    { key: 'ordenes', nombre: 'Órdenes de Trabajo', icono: Wrench, color: 'red', listUrl: '/admin/ordenes', nuevoUrl: '/admin/ordenes/nuevo' },
    { key: 'asistencia', nombre: 'Control de Asistencia', icono: Clock, color: 'teal', listUrl: '/admin/control-asistencia', nuevoUrl: '/admin/control-asistencia/marcar' },
    { key: 'recordatorios', nombre: 'Recordatorios', icono: Bell, color: 'yellow', listUrl: '/admin/recordatorios', nuevoUrl: '/admin/recordatorios/nuevo' },
    { key: 'visitas', nombre: 'Calendario de Visitas', icono: CalendarDays, color: 'indigo', listUrl: '/admin/calendario-visitas', nuevoUrl: '/admin/calendario-visitas/nueva' }
  ]
};

// Paleta moderna: badges de icono en color sólido sobre tarjetas blancas
const getIconBadgeClasses = (color) => {
  const colores = {
    red: 'bg-red-600',
    teal: 'bg-teal-600',
    yellow: 'bg-amber-500',
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    slate: 'bg-slate-700'
  };
  return colores[color] || 'bg-blue-600';
};

// Tarjeta "Documentos": el cuerpo despliega la lista para VER, el botón "Nuevo" despliega la lista para CREAR
function DocumentosCard({ modulo }) {
  const [openMenu, setOpenMenu] = useState(null); // 'ver' | 'nuevo' | null
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center gap-3 p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-lg">
      <button
        type="button"
        onClick={() => setOpenMenu(openMenu === 'ver' ? null : 'ver')}
        className="flex items-center flex-1 min-w-0 gap-3 text-left"
      >
        <div className="inline-flex items-center justify-center flex-shrink-0 text-white bg-purple-600 w-11 h-11 rounded-xl shadow-sm">
          <Folder size={20} />
        </div>
        <p className="text-sm font-semibold text-gray-900 truncate">{modulo.nombre}</p>
      </button>

      <button
        type="button"
        onClick={() => setOpenMenu(openMenu === 'nuevo' ? null : 'nuevo')}
        className="inline-flex items-center flex-shrink-0 gap-1 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
      >
        <Plus size={14} /> Nuevo
      </button>

      {openMenu && (
        <div className="absolute left-4 right-4 top-full mt-1 z-20 overflow-hidden bg-white border border-gray-100 rounded-xl shadow-lg">
          {modulo.sub.map((item) =>
            item.disabled ? (
              <div
                key={item.key}
                className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
              >
                {item.nombre}
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gray-100 rounded">Pronto</span>
              </div>
            ) : (
              <Link
                key={item.key}
                href={openMenu === 'nuevo' ? item.nuevoUrl : item.listUrl}
                onClick={() => setOpenMenu(null)}
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                {item.nombre}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function PanelControl() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);

          if (perfilUsuario.rol !== 'admin' && perfilUsuario.rol !== 'tecnico') {
            router.push('/cliente/dashboard');
            return;
          }

          if (perfilUsuario.estado !== 'activo') {
            router.push('/admin');
            return;
          }

          setUser(currentUser);
          setPerfil(perfilUsuario);
        } catch (error) {
          console.error('Error al verificar usuario:', error);
          router.push('/admin');
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

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
      <div className="px-4 py-6 mx-auto max-w-7xl">
        {/* Bienvenida */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 font-montserrat">
            ¡Bienvenido, {perfil?.nombre}!
          </h2>
          <p className="text-gray-600">
            {perfil?.rol === 'admin'
              ? 'Panel completo de administración del sistema IMSSE'
              : 'Gestiona tus órdenes de trabajo, recordatorios y calendario de visitas'
            }
          </p>
        </div>

        {/* Menú principal */}
        <h3 className="mb-6 text-xl font-semibold text-gray-900">Menú</h3>
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3">
          {configuracion.map((modulo) => {
            const Icono = modulo.icono;

            // Tarjeta deshabilitada (Notificaciones: "más adelante")
            if (modulo.disabled) {
              return (
                <div
                  key={modulo.key}
                  className="flex items-center gap-3 p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl"
                >
                  <div className="inline-flex items-center justify-center flex-shrink-0 text-gray-400 bg-gray-200 w-11 h-11 rounded-xl">
                    <Icono size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-400 truncate">{modulo.nombre}</p>
                    <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-100 rounded-full w-fit">
                      Próximamente
                    </span>
                  </div>
                </div>
              );
            }

            // Tarjeta "Documentos": agrupa presupuestos/recibos/remitos/estados/facturas
            if (modulo.esDocumentos) {
              return <DocumentosCard key={modulo.key} modulo={modulo} />;
            }

            return (
              <div
                key={modulo.key}
                className="relative flex items-center gap-3 p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm group rounded-2xl hover:shadow-lg hover:-translate-y-0.5"
              >
                <Link href={modulo.listUrl} className="absolute inset-0 rounded-2xl" aria-label={modulo.nombre} />
                <div className="flex items-center flex-1 min-w-0 gap-3 pointer-events-none">
                  <div className={`inline-flex items-center justify-center flex-shrink-0 w-11 h-11 rounded-xl text-white shadow-sm transition-transform group-hover:scale-105 ${getIconBadgeClasses(modulo.color)}`}>
                    <Icono size={20} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {modulo.nombre}
                  </p>
                </div>
                {modulo.nuevoUrl && (
                  <Link
                    href={modulo.nuevoUrl}
                    className="relative z-10 inline-flex items-center flex-shrink-0 gap-1 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Plus size={14} /> Nuevo
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Información del sistema */}
        <div className="relative p-6 overflow-hidden text-center text-white shadow-md bg-gradient-imsse rounded-2xl">
          <div className="relative z-10 text-sm">
            <p className="font-semibold tracking-wide">IMSSE INGENIERÍA S.A.S</p>
            <p className="text-white/80">Sistema de gestión completo - Protección contra incendios</p>
            <p className="mt-2">
              <span className="font-medium">
                {perfil?.rol === 'admin' ? 'Panel de Administración' : 'Panel Técnico'}
              </span>
              {perfil?.rol === 'tecnico' && (
                <span className="text-white/80"> - Órdenes, recordatorios y calendario de visitas</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
