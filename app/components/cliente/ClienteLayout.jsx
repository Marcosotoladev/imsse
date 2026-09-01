// components/cliente/ClienteLayout.jsx - Layout con sidebar (desktop) y bottom nav (mobile)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LogOut,
  ChevronDown,
  ChevronRight,
  BellRing,
  FileText,
  Receipt,
  Truck,
  CreditCard,
  Wrench,
  ClipboardCheck,
  ClipboardList,
  Folder,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

// Configuración de módulos para clientes (Documentos agrupa los distintos tipos)
const MODULOS_DISPONIBLES = [
  { key: 'dashboard', nombre: 'Inicio', icono: Home, path: '/cliente/dashboard', siempre: true },
  { key: 'inspecciones', nombre: 'Visita Técnica', icono: ClipboardCheck, path: '/cliente/inspecciones' },
  { key: 'planaccion', nombre: 'Plan de Acción', icono: ClipboardList, path: '/cliente/plan-accion' },
  {
    key: 'documentos',
    nombre: 'Documentos',
    icono: Folder,
    children: [
      { key: 'presupuestos', nombre: 'Presupuestos', path: '/cliente/presupuestos' },
      { key: 'recibos', nombre: 'Recibos', path: '/cliente/recibos' },
      { key: 'remitos', nombre: 'Remitos', path: '/cliente/remitos' },
      { key: 'estados', nombre: 'Estados de Cuenta', path: '/cliente/estados' }
    ]
  }
];

function isPathActive(pathname, path) {
  return !!path && (pathname === path || pathname.startsWith(`${path}/`));
}

function MenuEntry({ item, pathname, docsOpen, setDocsOpen, onNavigate }) {
  if (item.children) {
    const childActive = item.children.some((child) => isPathActive(pathname, child.path));
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
          <item.icono size={18} className="mr-3" />
          <span className="flex-1 text-left">{item.nombre}</span>
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="pl-3 mt-1 ml-4 space-y-0.5 border-l border-gray-200">
            {item.children.map((child) => (
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
                {child.nombre}
              </Link>
            ))}
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
      <item.icono size={18} className="mr-3" />
      {item.nombre}
    </Link>
  );
}

// Un ícono de la bottom nav (mobile)
function BottomNavEntry({ item, pathname, isOpen, onOpenClick }) {
  if (item.disabled) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-gray-300">
        <item.icono size={20} />
        <span className="text-[11px] font-medium">{item.nombre}</span>
      </div>
    );
  }

  if (item.children) {
    const active = isOpen || item.children.some((child) => isPathActive(pathname, child.path));
    return (
      <button
        type="button"
        onClick={onOpenClick}
        className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 ${
          active ? 'text-primary' : 'text-gray-500'
        }`}
      >
        <item.icono size={20} />
        <span className="text-[11px] font-medium">{item.nombre}</span>
      </button>
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
      <item.icono size={20} />
      <span className="text-[11px] font-medium">{item.nombre}</span>
    </Link>
  );
}

export default function ClienteLayout({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docsSheetOpen, setDocsSheetOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const sheetRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);

          // Verificar que sea cliente
          if (perfilUsuario.rol !== 'cliente') {
            router.push('/admin/panel-control');
            return;
          }

          // Verificar estado activo
          if (perfilUsuario.estado !== 'activo') {
            router.push('/admin');
            return;
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
  }, [router]);

  // Cerrar sheet de Documentos al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target)) {
        setDocsSheetOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setDocsSheetOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Filtrar módulos (y sub-items) según permisos del usuario
  const menuItems = MODULOS_DISPONIBLES
    .map((modulo) => {
      if (modulo.children) {
        const children = modulo.children.filter((child) => perfil?.permisos?.[child.key] === true);
        return children.length ? { ...modulo, children } : null;
      }
      return modulo.siempre || perfil?.permisos?.[modulo.key] === true ? modulo : null;
    })
    .filter(Boolean);

  // Bottom nav: el mismo menú filtrado + "Notificaciones" (próximamente) al final
  const bottomNavItems = [...menuItems, { key: 'notificaciones', nombre: 'Notificaciones', icono: BellRing, disabled: true }];

  // Nombre a mostrar en breadcrumb (baja hasta el sub-item si corresponde)
  let activeLabel = null;
  for (const item of menuItems) {
    if (isPathActive(pathname, item.path)) {
      activeLabel = item.nombre;
      break;
    }
    if (item.children) {
      const child = item.children.find((c) => isPathActive(pathname, c.path));
      if (child) {
        activeLabel = child.nombre;
        break;
      }
    }
  }

  const documentosModulo = menuItems.find((item) => item.key === 'documentos');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando portal cliente...</p>
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
            <img src="/logo/imsse-logo.png" alt="IMSSE Logo" className="flex-shrink-0 w-8 h-8 mr-3" />
            <h1 className="text-base font-bold leading-tight truncate font-montserrat md:text-lg">IMSSE</h1>
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden mr-2 text-sm md:inline text-white/90">{perfil?.empresa}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white transition-colors rounded-md hover:bg-white/10"
            >
              <LogOut size={18} className="md:mr-2" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sheet de Documentos (bottom sheet, mobile) */}
      {docsSheetOpen && documentosModulo && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/40" onClick={() => setDocsSheetOpen(false)} />
          <div
            ref={sheetRef}
            className="absolute inset-x-0 bottom-16 bg-white rounded-t-2xl shadow-xl max-h-[70vh] overflow-y-auto animate-sheet-up"
          >
            <div className="w-10 h-1 mx-auto my-3 bg-gray-200 rounded-full" />
            <nav className="p-2 pb-4">
              {documentosModulo.children.map((child) => (
                <Link
                  key={child.path}
                  href={child.path}
                  onClick={() => setDocsSheetOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isPathActive(pathname, child.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {child.nombre}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex pt-16">
        {/* Sidebar para desktop */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-white border-r border-gray-100 lg:block top-16">
          <div className="flex flex-col h-full">
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <MenuEntry key={item.key} item={item} pathname={pathname} docsOpen={docsOpen} setDocsOpen={setDocsOpen} />
              ))}
            </nav>

            {/* Información del cliente en sidebar */}
            <div className="p-4 border-t border-gray-100">
              <div className="px-4 py-3 rounded-xl bg-gray-50">
                <p className="text-sm font-medium text-gray-900 truncate">{perfil?.nombreCompleto}</p>
                <p className="text-xs text-gray-500 truncate">{perfil?.empresa}</p>
                <div className="mt-2">
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium text-white rounded-full bg-teal-600">
                    Cliente
                  </span>
                </div>
              </div>

              {/* Enlaces de contacto */}
              <div className="flex justify-center mt-4 space-x-4">
                <Link
                  href="tel:+543511234567"
                  className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-primary"
                  title="Llamar"
                >
                  <Phone size={16} />
                </Link>
                <Link
                  href="mailto:info@imsse.com"
                  className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-primary"
                  title="Email"
                >
                  <Mail size={16} />
                </Link>
                <Link
                  href="/cliente/ayuda"
                  className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-primary"
                  title="Ayuda"
                >
                  <HelpCircle size={16} />
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 pb-16 lg:pb-0 lg:ml-64">
          {/* Breadcrumbs */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 py-3">
              <div className="flex items-center text-sm">
                <Link href="/cliente/dashboard" className="text-primary hover:underline">
                  <Home size={14} className="inline mr-1" />
                  Inicio
                </Link>
                {pathname !== '/cliente/dashboard' && (
                  <>
                    <ChevronRight size={14} className="mx-2 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {activeLabel || 'Página'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom nav - SOLO MOBILE */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex bg-white border-t border-gray-100 shadow-lg h-16 lg:hidden">
        {bottomNavItems.map((item) => (
          <BottomNavEntry
            key={item.key}
            item={item}
            pathname={pathname}
            isOpen={docsSheetOpen}
            onOpenClick={() => setDocsSheetOpen(!docsSheetOpen)}
          />
        ))}
      </nav>
    </div>
  );
}
