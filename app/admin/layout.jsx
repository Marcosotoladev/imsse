// app/admin/layout.jsx - Layout wrapper arreglado
'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '../components/admin/AdminLayout';

export default function AdminLayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Si estamos en la página de login (/admin), no usar AdminLayout
  if (pathname === '/admin') {
    return (
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    );
  }
  
  // Para todas las demás rutas admin, usar AdminLayout
  return <AdminLayout>{children}</AdminLayout>;
}