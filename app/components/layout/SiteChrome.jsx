// app/components/layout/SiteChrome.jsx - Oculta el header/footer públicos dentro de la app (admin/cliente/login/registro)
'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

// Rutas que tienen su propio shell (AdminLayout, ClienteLayout, pantallas de auth)
// y no deben mostrar el header/footer del sitio público.
const APP_PREFIXES = ['/admin', '/cliente', '/login', '/registro'];

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAppRoute = APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isAppRoute) {
    return children;
  }

  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
