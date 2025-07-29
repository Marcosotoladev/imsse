// components/admin/AdminLayout.jsx - Layout con filtros por rol
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  LogOut, 
  ChevronDown,
  ChevronUp,
  FileText,
  FileChartColumn,
  CreditCard,
  Receipt,
  FileCheck,
  Wrench,
  Shield,
  Bell,
  BarChart3,
  ChevronRight,
  Users
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/services/apiService';

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
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

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
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

  // Función para generar breadcrumb
  const generateBreadcrumb = () => {
    const segments = pathname.split('/').filter(segment => segment);
    const breadcrumbs = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      let displayName = segment;
      
      // Personalizar nombres de rutas
      switch (segment) {
        case 'admin':
          displayName = 'Admin';
          break;
        case 'panel-control':
          displayName = 'Panel de Control';
          break;
        case 'presupuestos':
          displayName = 'Presupuestos';
          break;
        case 'recibos':
          displayName = 'Recibos';
          break;
        case 'remitos':
          displayName = 'Remitos';
          break;
        case 'estados':
          displayName = 'Estados de Cuenta';
          break;
        case 'ordenes':
          displayName = 'Órdenes de Trabajo';
          break;
        case 'recordatorios':
          displayName = 'Recordatorios';
          break;
        case 'usuarios':
          displayName = 'Gestión de Usuarios';
          break;
        case 'nuevo':
          displayName = 'Nuevo';
          break;
        case 'editar':
          displayName = 'Editar';
          break;
        default:
          displayName = segment;
      }

      breadcrumbs.push({
        name: displayName,
        path: currentPath,
        isLast
      });
    });

    return breadcrumbs;
  };

  // Menú completo con configuración de acceso por rol
  const menuItemsConfig = [
    {
      name: 'Panel de Control',
      path: '/admin/panel-control',
      icon: BarChart3,
      roles: ['admin', 'tecnico'] // Ambos roles
    },
    {
      name: 'Presupuestos',
      path: '/admin/presupuestos',
      icon: FileText,
      roles: ['admin'] // Solo admin
    },
    {
      name: 'Estados de Cuenta',
      path: '/admin/estados',
      icon: CreditCard,
      roles: ['admin'] // Solo admin
    },
    {
      name: 'Recibos',
      path: '/admin/recibos',
      icon: Receipt,
      roles: ['admin'] // Solo admin
    },
    {
      name: 'Remitos',
      path: '/admin/remitos',
      icon: FileCheck,
      roles: ['admin'] // Solo admin
    },
    {
      name: 'Órdenes de Trabajo',
      path: '/admin/ordenes',
      icon: Wrench,
      roles: ['admin', 'tecnico'] // Ambos roles
    },
    {
      name: 'Recordatorios',
      path: '/admin/recordatorios',
      icon: Bell,
      roles: ['admin', 'tecnico'] // Ambos roles
    },
    {
      name: 'Gestión de Usuarios',
      path: '/admin/usuarios',
      icon: Users,
      roles: ['admin'] // Solo admin
    }
  ];

  // Filtrar menú según el rol del usuario
  const menuItems = menuItemsConfig.filter(item => 
    perfil && item.roles.includes(perfil.rol)
  );

  // Encontrar el item activo para mostrar en el dropdown
  const activeItem = menuItems.find(item => 
    pathname === item.path || pathname.startsWith(`${item.path}/`)
  );

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
    <div className="min-h-screen pt-20 bg-gray-50"> {/* Agregamos pt-20 para el navbar principal */}      
      <div className="flex">
        {/* Dropdown de navegación móvil */}
        <div className="lg:hidden" ref={dropdownRef}>
          <div className="fixed z-40 w-full px-4 py-2 bg-white shadow-md top-20"> {/* top-20 para estar debajo del navbar */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <div className="flex items-center">
                {activeItem ? (
                  <>
                    <activeItem.icon size={20} className="mr-3 text-primary" />
                    <span className="font-medium text-gray-900">{activeItem.name}</span>
                  </>
                ) : (
                  <>
                    <BarChart3 size={20} className="mr-3 text-primary" />
                    <span className="font-medium text-gray-900">Seleccionar Sección</span>
                  </>
                )}
              </div>
              {dropdownOpen ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>

            {/* Dropdown menu */}
            <div className={`absolute top-full left-4 right-4 mt-1 bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 transform ${
              dropdownOpen 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
            }`}>
              <div className="overflow-y-auto max-h-96">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                  
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center px-4 py-3 transition-colors border-b border-gray-100 last:border-b-0 ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                      }`}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Icon size={18} className="mr-3" />
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <ChevronRight size={16} className="ml-auto" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar para desktop */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-white shadow-lg lg:block top-20"> {/* top-20 para estar debajo del navbar */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Información del usuario en sidebar */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="px-4 py-3 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-900">{perfil?.nombreCompleto}</p>
                <p className="text-xs text-gray-500 capitalize">{perfil?.rol}</p>
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    perfil?.rol === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {perfil?.rol === 'admin' ? 'Administrador' : 'Técnico'}
                  </span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 lg:ml-64">
          {/* Espaciado adicional en móvil para el dropdown */}
          <div className="h-16 lg:hidden"></div>
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}