// components/admin/AdminLayout.jsx - Layout con sidebar (desktop) y bottom nav (mobile)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  Menu,
  ChevronDown,
  MoreHorizontal,
  X,
  Wrench,
  Clock,
  BellRing,
  Bell,
  BarChart3,
  Users,
  Building2,
  Folder,
  FileText,
  Receipt,
  Truck,
  CreditCard,
  Crown,
  ClipboardCheck,
  ListChecks,
  ClipboardList
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

// Submenú de Documentos (compartido entre el panel "Más" y el sidebar desktop)
const DOCUMENTOS_SUB = [
  { name: 'Presupuestos', path: '/admin/presupuestos', icon: FileText },
  { name: 'Recibos', path: '/admin/recibos', icon: Receipt },
  { name: 'Remitos', path: '/admin/remitos', icon: Truck },
  { name: 'Estados de Cuenta', path: '/admin/estados', icon: CreditCard },
  { name: 'Facturas', disabled: true, icon: FileText }
];

// Los 4-5 accesos directos de la bottom nav en mobile. Lo que no entra queda en "Más" (solo admin).
const BOTTOM_NAV = {
  admin: [
    { name: 'Inicio', path: '/admin/panel-control', icon: BarChart3 },
    { name: 'Órdenes', path: '/admin/ordenes', icon: Wrench },
    { name: 'Asistencia', path: '/admin/control-asistencia/admin', icon: Clock },
    { name: 'Notificaciones', path: '/admin/notificaciones', icon: BellRing }
  ],
  tecnico: [
    { name: 'Inicio', path: '/admin/dashboard-tecnico', icon: BarChart3 },
    { name: 'Órdenes', path: '/admin/ordenes', icon: Wrench },
    { name: 'Asistencia', path: '/admin/control-asistencia', icon: Clock },
    { name: 'Recordatorios', path: '/admin/recordatorios', icon: Bell }
  ]
};

// Nombres del sidebar (menuItemsConfig) que ya están cubiertos por la bottom nav de admin:
// el resto del menú (Recordatorios, Documentos, Usuarios) cae dentro de "Más"
const BOTTOM_NAV_ADMIN_NAMES = new Set(['Panel de Control', 'Órdenes de Trabajo', 'Control de Asistencia', 'Notificaciones']);

function isPathActive(pathname, path) {
  return !!path && (pathname === path || pathname.startsWith(`${path}/`));
}

function isGroupActive(pathname, children) {
  return children.some((child) => isPathActive(pathname, child.path));
}

// Numerito de no leídos, reutilizado en sidebar y bottom nav
function BadgeNoLeidos({ count, className = '' }) {
  if (!count) return null;
  return (
    <span className={`flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ${className}`}>
      {count > 9 ? '9+' : count}
    </span>
  );
}

// Una fila de menú: link simple, grupo desplegable (Documentos) o item deshabilitado (Facturas)
function MenuEntry({ item, pathname, docsOpen, setDocsOpen, onNavigate }) {
  if (item.disabled) {
    return (
      <div className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed">
        <item.icon size={18} className="mr-3" />
        <span className="flex-1">{item.name}</span>
        <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gray-100 rounded">Pronto</span>
      </div>
    );
  }

  if (item.children) {
    const childActive = isGroupActive(pathname, item.children);
    const open = docsOpen || childActive;

    return (
      <div>
        <button
          type="button"
          onClick={() => setDocsOpen(!docsOpen)}
          className={`flex items-center w-full px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${
            childActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <item.icon size={18} className="mr-3" />
          <span className="flex-1 text-left">{item.name}</span>
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="pl-3 mt-1 ml-4 space-y-0.5 border-l border-gray-200">
            {item.children.map((child) =>
              child.disabled ? (
                <div
                  key={child.name}
                  className="flex items-center justify-between px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                >
                  {child.name}
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gray-100 rounded">Pronto</span>
                </div>
              ) : (
                <Link
                  key={child.path}
                  href={child.path}
                  onClick={onNavigate}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    isPathActive(pathname, child.path)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {child.name}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    );
  }

  const active = isPathActive(pathname, item.path);

  return (
    <Link
      href={item.path}
      onClick={onNavigate}
      className={`flex items-center px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${
        active ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <item.icon size={18} className="mr-3" />
      <span className="flex-1">{item.name}</span>
      <BadgeNoLeidos count={item.badge} />
    </Link>
  );
}

// Un ícono de la bottom nav (mobile)
function BottomNavEntry({ item, pathname, isMoreOpen, onMoreClick }) {
  if (item.isMore) {
    const active = isMoreOpen;
    return (
      <button
        type="button"
        onClick={onMoreClick}
        className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 ${
          active ? 'text-primary' : 'text-gray-500'
        }`}
      >
        {isMoreOpen ? <X size={20} /> : <MoreHorizontal size={20} />}
        <span className="text-[11px] font-medium">Más</span>
      </button>
    );
  }

  if (item.disabled) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-gray-300">
        <item.icon size={20} />
        <span className="text-[11px] font-medium">{item.name}</span>
      </div>
    );
  }

  const active = isPathActive(pathname, item.path);

  return (
    <Link
      href={item.path}
      className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 ${
        active ? 'text-primary' : 'text-gray-500'
      }`}
    >
      <span className="relative">
        <item.icon size={20} />
        <BadgeNoLeidos count={item.badge} className="absolute -top-1.5 -right-2" />
      </span>
      <span className="text-[11px] font-medium">{item.name}</span>
    </Link>
  );
}

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const moreRef = useRef(null);
  const menuRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Obtener perfil del usuario para conocer su rol
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);

          // Verificar que tenga acceso al panel admin
          if (!['admin', 'tecnico'].includes(perfilUsuario.rol)) {
            router.push('/cliente/dashboard');
            return;
          }

          // NUEVO: Redirigir técnicos a su dashboard específico
          // Solo si están intentando acceder al panel-control
          if (perfilUsuario.rol === 'tecnico' && pathname === '/admin/panel-control') {
            router.push('/admin/dashboard-tecnico');
            return;
          }

          // Modo mantenimiento: si la suscripción está vencida, se bloquea el acceso
          // (el Superadmin siempre puede entrar, sin importar el estado de la suscripción)
          if (!perfilUsuario.superAdmin) {
            const suscripcion = await apiService.obtenerSuscripcion();
            if (suscripcion.bloqueada) {
              router.push('/mantenimiento');
              return;
            }
          }

          setUser(currentUser);
          setPerfil(perfilUsuario);
          setLoading(false);
        } catch (error) {
          console.error('Error al obtener perfil:', error);
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Cerrar panel "Más" / menú hamburguesa al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Cantidad de notificaciones sin leer para el numerito del ícono: se consulta al entrar,
  // cada 45s, y al cambiar de página (para que se limpie apenas se sale de /admin/notificaciones,
  // que es donde se marcan como leídas).
  useEffect(() => {
    if (!user) return;

    let activo = true;

    const cargarNoLeidas = async () => {
      try {
        const { count } = await apiService.obtenerNotificacionesNoLeidas();
        if (activo) setNotifCount(count || 0);
      } catch (error) {
        console.error('Error al obtener notificaciones sin leer:', error);
      }
    };

    cargarNoLeidas();
    const intervalo = setInterval(cargarNoLeidas, 45000);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [user, pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Menú completo (sidebar desktop) con configuración de acceso por rol
  const menuItemsConfig = [
    {
      name: 'Panel de Control',
      path: '/admin/panel-control',
      icon: BarChart3,
      roles: ['admin']
    },
    {
      name: 'Panel de Control',
      path: '/admin/dashboard-tecnico',
      icon: BarChart3,
      roles: ['tecnico']
    },
    {
      name: 'Órdenes de Trabajo',
      path: '/admin/ordenes',
      icon: Wrench,
      roles: ['admin', 'tecnico']
    },
    {
      name: 'Visita Técnica',
      path: '/admin/inspecciones',
      icon: ClipboardCheck,
      roles: ['admin', 'tecnico']
    },
    {
      name: 'Plantillas',
      path: '/admin/plantillas',
      icon: ListChecks,
      roles: ['admin']
    },
    {
      name: 'Plan de Acción',
      path: '/admin/plan-accion',
      icon: ClipboardList,
      roles: ['admin']
    },
    {
      name: 'Control de Asistencia',
      path: '/admin/control-asistencia/admin',
      icon: Clock,
      roles: ['admin']
    },
    {
      name: 'Control de Asistencia',
      path: '/admin/control-asistencia',
      icon: Clock,
      roles: ['tecnico']
    },
    {
      name: 'Notificaciones',
      path: '/admin/notificaciones',
      icon: BellRing,
      roles: ['admin', 'tecnico']
    },
    {
      name: 'Recordatorios',
      path: '/admin/recordatorios',
      icon: Bell,
      roles: ['admin', 'tecnico']
    },
    {
      name: 'Documentos',
      icon: Folder,
      roles: ['admin'],
      children: DOCUMENTOS_SUB
    },
    {
      name: 'Empresas',
      path: '/admin/empresas',
      icon: Building2,
      roles: ['admin']
    },
    {
      name: 'Usuarios',
      path: '/admin/usuarios',
      icon: Users,
      roles: ['admin']
    },
    {
      name: 'Suscripción',
      path: '/admin/suscripcion',
      icon: Crown,
      roles: ['admin']
    }
  ];

  // Filtrar menú según el rol del usuario, agregando el numerito de no leídas a Notificaciones
  const conBadge = (item) => (item.name === 'Notificaciones' ? { ...item, badge: notifCount } : item);
  const menuItems = menuItemsConfig
    .filter(item => perfil && item.roles.includes(perfil.rol))
    .map(conBadge);

  const rol = perfil?.rol === 'tecnico' ? 'tecnico' : 'admin';
  const bottomNavItems = BOTTOM_NAV[rol].map(conBadge);
  // Para admin: lo que no entra en la bottom nav queda en el panel "Más"
  const moreItems = rol === 'admin' ? menuItems.filter((item) => !BOTTOM_NAV_ADMIN_NAMES.has(item.name)) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando sistema IMSSE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header principal fijo (único) */}
      <header className="fixed top-0 left-0 right-0 z-50 text-white shadow-lg bg-primary">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl">
          <div className="flex items-center min-w-0">
            <img
              src="/logo/imsse-logo.png"
              alt="IMSSE Logo"
              className="flex-shrink-0 w-8 h-8 mr-3"
            />
            <h1 className="text-base font-bold leading-tight truncate font-montserrat md:text-lg">IMSSE</h1>
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden mr-2 text-sm md:inline text-white/90">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white transition-colors rounded-md hover:bg-white/10"
            >
              <LogOut size={18} className="md:mr-2" />
              <span className="hidden md:inline">Salir</span>
            </button>
            {/* Botón de menú completo, solo móvil/tablet */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-white transition-colors rounded-md lg:hidden hover:bg-white/10"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú completo (dropdown desde el header, solo mobile) */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/40" onClick={() => setMenuOpen(false)} />
          <div
            ref={menuRef}
            className="absolute left-0 right-0 overflow-y-auto bg-white shadow-xl top-16 max-h-[calc(100vh-4rem)] animate-admin-menu"
          >
            <nav className="p-2">
              {menuItems.map((item) => (
                <MenuEntry
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  docsOpen={docsOpen}
                  setDocsOpen={setDocsOpen}
                  onNavigate={() => setMenuOpen(false)}
                />
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-sm font-medium text-gray-900">{perfil?.nombreCompleto}</p>
              <p className="text-xs text-gray-500 capitalize">{perfil?.rol}</p>
              <button
                onClick={handleLogout}
                className="flex items-center mt-3 text-sm font-medium text-primary"
              >
                <LogOut size={16} className="mr-2" /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel "Más" (bottom sheet, solo admin/mobile) */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/40" onClick={() => setMoreOpen(false)} />
          <div
            ref={moreRef}
            className="absolute inset-x-0 bottom-16 bg-white rounded-t-2xl shadow-xl max-h-[70vh] overflow-y-auto animate-sheet-up"
          >
            <div className="w-10 h-1 mx-auto my-3 bg-gray-200 rounded-full" />
            <nav className="p-2 pb-4">
              {moreItems.map((item) => (
                <MenuEntry
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  docsOpen={docsOpen}
                  setDocsOpen={setDocsOpen}
                  onNavigate={() => setMoreOpen(false)}
                />
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex pt-16">
        {/* SIDEBAR - SOLO DESKTOP */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-white border-r border-gray-100 lg:block top-16">
          <div className="flex flex-col h-full">
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <MenuEntry
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  docsOpen={docsOpen}
                  setDocsOpen={setDocsOpen}
                />
              ))}
            </nav>

            {/* Información del usuario fija en la parte inferior */}
            <div className="p-4 border-t border-gray-100">
              <div className="px-4 py-3 rounded-xl bg-gray-50">
                <p className="text-sm font-medium text-gray-900 truncate">{perfil?.nombreCompleto}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500 capitalize">{perfil?.rol}</span>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full text-white ${
                    perfil?.rol === 'admin' ? 'bg-red-600' : 'bg-teal-600'
                  }`}>
                    {perfil?.rol === 'admin' ? 'Admin' : 'Técnico'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 pb-16 lg:pb-0 lg:ml-64">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom nav - SOLO MOBILE */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex bg-white border-t border-gray-100 shadow-lg h-16 lg:hidden">
        {bottomNavItems.map((item) => (
          <BottomNavEntry key={item.name} item={item} pathname={pathname} />
        ))}
        {rol === 'admin' && (
          <BottomNavEntry
            item={{ name: 'Más', isMore: true }}
            pathname={pathname}
            isMoreOpen={moreOpen}
            onMoreClick={() => setMoreOpen(!moreOpen)}
          />
        )}
      </nav>
    </div>
  );
}
