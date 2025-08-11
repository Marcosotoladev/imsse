import './globals.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppBadge from './components/ui/WhatsAppBadge';
import PWARegister from './components/PWARegister';

export const metadata = {
  title: 'IMSSE',
  description: 'Instalación y mantenimiento de sistemas de seguridad electrónicos contra incendios. Detección, supresión, alarmas y rociadores automáticos.',
  keywords: 'sistemas contra incendios, detección de incendios, supresión de incendios, alarmas contra incendio, rociadores automáticos, seguridad industrial',
  author: 'IMSSE Ingeniería SAS',
  robots: 'index, follow',
  'og:title': 'IMSSE Ingeniería SAS - Sistemas de Seguridad Contra Incendios',
  'og:description': 'Protegemos vidas y patrimonio con sistemas de seguridad contra incendios de última generación',
  'og:type': 'website',
  'og:site_name': 'IMSSE Ingeniería SAS',
  // ✅ PWA Configuration CORREGIDO
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IMSSE',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#DC2626'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <WhatsAppBadge phoneNumber="+5493515484437" />
        <PWARegister />

      </body>
    </html>
  );
}