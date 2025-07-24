// components/admin/AdminLayout.jsx - Layout completo IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  LogOut, 
  Menu, 
  X,
  FileText,
  FileChartColumn,
  CreditCard,
  Receipt,
  FileCheck,
  Wrench,
  Shield,
  Bell,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        case 'ordenes':
          displayName = 'Ordenes';
          break;
        case 'recordatorios':
          displayName = 'Recordatorios';
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

  // Menú de navegación
  const menuItems = [
    {
      name: 'Panel de Control',
      path: '/admin/panel-control',
      icon: BarChart3
    },
    {
      name: 'Presupuestos',
      path: '/admin/presupuestos',
      icon: FileText
    },
    {
      name: 'Estados de Cuentas',
      path: '/admin/estados-cuenta',
      icon: CreditCard
    },
    {
      name: 'Recibos',
      path: '/admin/recibos',
      icon: Receipt
    },
    {
      name: 'Remitos',
      path: '/admin/remitos',
      icon: FileCheck
    },
    {
      name: 'Ordenes de Trabajo',
      path: '/admin/ordenes',
      icon: Shield
    },
    {
      name: 'Recordatorios',
      path: '/admin/recordatorios',
      icon: Bell
    }
  ];

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
    <div className="min-h-screen pt-20 bg-gray-50"> {/* Espacio para navbar principal */}
      
      {/* Botón hamburguesa para móvil - AGREGADO */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed z-40 p-2 transition-colors bg-white rounded-lg shadow-lg top-18 left-1 lg:hidden hover:bg-gray-50"
        aria-label="Abrir menú"
      >
        {sidebarOpen ? (
          <X size={24} className="text-gray-600" />
        ) : (
          <Menu size={24} className="text-gray-600" />
        )}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:block mt-20`}>
          
          {/* Header del sidebar en móvil */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-800">IMSSE Admin</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

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
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Footer del sidebar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center px-4 py-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <Home size={20} className="mr-3" />
              Sitio Web IMSSE
            </Link>
            
            {/* Botón de logout en móvil */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 mt-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 lg:hidden"
            >
              <LogOut size={20} className="mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Overlay móvil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main className="flex-1 lg:ml-0">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}