// components/admin/AdminLayout.jsx - Layout con Sidebar para Admin IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  LogOut, 
  Menu,
  X,
  Receipt,
  FileText,
  Truck,
  Wrench,
  Building,
  Bell,
  BarChart3,
  ChevronLeft,
  User
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Verificar autenticación
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

  // Cerrar sidebar en móvil al cambiar de ruta
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Elementos del menú
  const menuItems = [
    {
      href: '/admin/panel-control',
      icon: BarChart3,
      label: 'Panel de Control',
      description: 'Resumen general'
    },
    {
      href: '/admin/presupuestos',
      icon: FileText,
      label: 'Presupuestos',
      description: 'Cotizaciones'
    },
    {
      href: '/admin/recibos',
      icon: Receipt,
      label: 'Recibos',
      description: 'Facturación'
    },
    {
      href: '/admin/remitos',
      icon: Truck,
      label: 'Remitos',
      description: 'Entregas'
    },
    {
      href: '/admin/mantenimiento',
      icon: Wrench,
      label: 'Mantenimiento',
      description: 'Servicios'
    },
    {
      href: '/admin/obras',
      icon: Building,
      label: 'Obras',
      description: 'Proyectos'
    },
    {
      href: '/admin/recordatorios',
      icon: Bell,
      label: 'Recordatorios',
      description: 'Vencimientos'
    }
  ];

  // Función para verificar si la ruta está activa
  const isActiveRoute = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando sistema IMSSE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 bg-white shadow-xl transform transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:shadow-lg
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        {/* Header del sidebar */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-200 bg-primary ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center">
              <img 
                src="/logo/imsse-logo.png" 
                alt="IMSSE Logo" 
                className="w-8 h-8 mr-3"
              />
              <div>
                <h1 className="text-lg font-bold text-white font-montserrat">IMSSE</h1>
                <p className="text-xs text-white/80">Sistema Admin</p>
              </div>
            </div>
          )}
          
          {/* Botón colapsar - solo desktop */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden p-1 text-white rounded-md lg:block hover:bg-white/10"
          >
            <ChevronLeft size={18} className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Botón cerrar - solo móvil */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-white rounded-md lg:hidden hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center px-3 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                  }
                  ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon size={20} className={`flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className={`p-4 border-t border-gray-200 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
          {!sidebarCollapsed && (
            <div className="mb-3">
              <div className="flex items-center p-2 rounded-lg bg-gray-50">
                <User size={16} className="mr-2 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{user?.email}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-3 py-2 text-sm text-red-600 rounded-lg transition-all duration-200
              hover:bg-red-50 hover:text-red-700
              ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}
            `}
            title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
          >
            <LogOut size={18} className={`flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-2'}`} />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header móvil */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 rounded-md hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center">
            <img 
              src="/logo/imsse-logo.png" 
              alt="IMSSE Logo" 
              className="w-6 h-6 mr-2"
            />
            <h1 className="text-lg font-bold text-primary font-montserrat">IMSSE Admin</h1>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-red-600 rounded-md hover:bg-red-50"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Área de contenido */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;