// components/cliente/ClienteLayout.jsx - Layout para clientes IMSSE
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
  CreditCard,
  Receipt,
  FileCheck,
  Shield,
  Bell,
  BarChart3,
  ChevronRight,
  Building,
  User
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function ClienteLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
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
      
      // Personalizar nombres de rutas para clientes
      switch (segment) {
        case 'cliente':
          displayName = 'Portal Cliente';
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
        case 'ordenes':
          displayName = 'Órdenes de Trabajo';
          break;
        case 'recordatorios':
          displayName = 'Recordatorios';
          break;
        case 'estados-cuenta':
          displayName = 'Estados de Cuenta';
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

  // Menú de navegación para clientes (dinámico según permisos)
  const menuItems = [
    {
      name: 'Panel de Control',
      path: '/cliente/panel-control',
      icon: BarChart3
    },
    {
      name: 'Presupuestos',
      path: '/cliente/presupuestos',
      icon: FileText
    },
    {
      name: 'Estados de Cuenta',
      path: '/cliente/estados-cuenta',
      icon: CreditCard
    },
    {
      name: 'Recibos',
      path: '/cliente/recibos',
      icon: Receipt
    },
    {
      name: 'Remitos',
      path: '/cliente/remitos',
      icon: FileCheck
    },
    {
      name: 'Órdenes de Trabajo',
      path: '/cliente/ordenes',
      icon: Shield
    },
    {
      name: 'Recordatorios',
      path: '/cliente/recordatorios',
      icon: Bell
    }
  ];

  // Encontrar el item activo para mostrar en el dropdown
  const activeItem = menuItems.find(item => 
    pathname === item.path || pathname.startsWith(`${item.path}/`)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando portal del cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header principal */}
      <header className="fixed top-0 z-50 w-full text-white shadow-lg bg-primary">
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
                <p className="text-xs text-red-200 md:text-sm">Portal del Cliente</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden md:block">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-red-200" />
                  <div>
                    <p className="text-sm">{user?.displayName || user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-red-200">Cliente</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center p-2 text-white transition-colors rounded-md hover:bg-red-700"
              >
                <LogOut size={16} className="md:mr-2" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20"> {/* Espacio para navbar principal */}
        
        {/* Dropdown de navegación móvil */}
        <div className="lg:hidden" ref={dropdownRef}>
          <div className="fixed z-40 w-full px-4 py-2 bg-white shadow-md top-20">
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

        <div className="flex">
          {/* Sidebar para desktop */}
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 mt-20 bg-white shadow-lg lg:block">
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
              
              {/* Información del cliente en sidebar */}
              <div className="p-4 mt-8 rounded-lg bg-gray-50">
                <div className="flex items-center mb-3">
                  <Building className="w-5 h-5 mr-2 text-primary" />
                  <h4 className="text-sm font-medium text-gray-700">Portal Cliente</h4>
                </div>
                <div className="text-xs text-gray-600">
                  <p className="mb-1">Acceso a sus documentos y órdenes de trabajo de IMSSE.</p>
                  <p className="font-medium text-primary">Sistemas contra incendios</p>
                </div>
              </div>
              
              {/* Contacto IMSSE */}
              <div className="p-3 mt-4 border border-blue-200 rounded-lg bg-blue-50">
                <h5 className="mb-2 text-xs font-medium text-blue-900">¿Necesita ayuda?</h5>
                <div className="space-y-1 text-xs text-blue-700">
                  <p>📧 info@imsseingenieria.com</p>
                  <p>🌐 www.imsseingenieria.com</p>
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
    </div>
  );
}