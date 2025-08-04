// components/cliente/ClienteLayout.jsx - Layout como AdminLayout pero para clientes
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
  Receipt,
  Truck,
  CreditCard,
  Wrench,
  ChevronRight,
  User,
  Building,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function ClienteLayout({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Configuración de módulos para clientes
  const modulosDisponibles = [
    { key: 'dashboard', nombre: 'Panel de Control', icono: Home, path: '/cliente/dashboard', siempre: true },
    { key: 'presupuestos', nombre: 'Presupuestos', icono: FileText, path: '/cliente/presupuestos' },
    { key: 'recibos', nombre: 'Recibos', icono: Receipt, path: '/cliente/recibos' },
    { key: 'remitos', nombre: 'Remitos', icono: Truck, path: '/cliente/remitos' },
    { key: 'estados', nombre: 'Estados de Cuenta', icono: CreditCard, path: '/cliente/estados' },
    { key: 'ordenes', nombre: 'Órdenes de Trabajo', icono: Wrench, path: '/cliente/ordenes' }
  ];

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

  // Filtrar módulos según permisos del usuario
  const menuItems = modulosDisponibles.filter(modulo => 
    modulo.siempre || (perfil?.permisos?.[modulo.key] === true)
  );

  // Encontrar el item activo
  const activeItem = menuItems.find(item => 
    pathname === item.path || pathname.startsWith(`${item.path}/`)
  );

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
    <div className="min-h-screen pt-20 bg-gray-50"> {/* Espacio para navbar principal */}
      
      <div className="flex">
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
                    <activeItem.icono size={20} className="mr-3 text-primary" />
                    <span className="font-medium text-gray-900">{activeItem.nombre}</span>
                  </>
                ) : (
                  <>
                    <Home size={20} className="mr-3 text-primary" />
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
                  const Icon = item.icono;
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
                      <span className="font-medium">{item.nombre}</span>
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
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-white shadow-lg lg:block top-20">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icono;
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
                  {item.nombre}
                </Link>
              );
            })}
            
            {/* Información del cliente en sidebar */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="px-4 py-3 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-900">{perfil?.nombreCompleto}</p>
                <p className="text-xs text-gray-500">{perfil?.empresa}</p>
                <div className="mt-2">
                  <span className="inline-flex px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
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
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 lg:ml-64">
          {/* Espaciado adicional en móvil para el dropdown */}
          <div className="h-16 lg:hidden"></div>
          
          {/* Breadcrumbs */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 py-3">
              <div className="flex items-center text-sm">
                <Link href="/cliente/dashboard" className="text-primary hover:underline">
                  <Home size={14} className="inline mr-1" />
                  Panel de Control
                </Link>
                {pathname !== '/cliente/dashboard' && (
                  <>
                    <ChevronRight size={14} className="mx-2 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {activeItem?.nombre || 'Página'}
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
    </div>
  );
}