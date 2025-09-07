// next.config.mjs - Configuración modificada para funcionalidad offline

import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Aquí van tus otras configuraciones si las tienes
};

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // PWA solo en producción
  register: true,
  skipWaiting: true,
  
  // ✅ NUEVA CONFIGURACIÓN PARA OFFLINE
  runtimeCaching: [
    // Cache para APIs críticas (marcaciones, órdenes, etc.)
    {
      urlPattern: /^https?.*\/api\/documents\/(marcaciones|ordenes|recordatorios)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-critical',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 horas
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    
    // Cache para APIs de técnico
    {
      urlPattern: /^https?.*\/api\/tecnico/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-tecnico',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 2, // 2 horas
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    
    // Cache para otras APIs
    {
      urlPattern: /^https?.*\/api\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-general',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60, // 1 hora
        },
      },
    },
    
    // Cache para páginas importantes del técnico
    {
      urlPattern: /^\/$|\/admin\/dashboard-tecnico|\/admin\/control-asistencia/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-critical',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24, // 24 horas
        },
      },
    },
    
    // Cache para todas las demás páginas
    {
      urlPattern: /^https?.*\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-general',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24, // 24 horas
        },
      },
    },
  ],
  
  // Páginas que deben funcionar offline
  fallbacks: {
    document: '/offline',
  },
});

export default pwaConfig(nextConfig);