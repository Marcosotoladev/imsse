// app/components/SessionRedirect.jsx
// Componente de la home pública: si ya hay una sesión activa, redirige directo
// al panel correspondiente en vez de mostrar la landing page.
// Mientras verifica, muestra una pantalla de carga (solo si el dispositivo tiene
// la marca de sesión; los visitantes sin sesión ven la landing sin demora).
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/services/apiService';
import { limpiarSesionActiva } from '../../lib/utils/sessionHint';

// Si algo se cuelga (red lenta, error), no dejar al usuario trabado en el loader
const TIMEOUT_LOADER_MS = 8000;

export default function SessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    const ocultarLoader = () => {
      delete document.documentElement.dataset.sessionRedirect;
    };
    const timeout = setTimeout(ocultarLoader, TIMEOUT_LOADER_MS);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        limpiarSesionActiva();
        return;
      }

      try {
        const perfil = await apiService.obtenerPerfilUsuario(user.uid);
        if (perfil.estado !== 'activo') {
          limpiarSesionActiva();
          return;
        }

        switch (perfil.rol) {
          case 'admin':
          case 'tecnico':
            router.replace('/admin/panel-control');
            break;
          case 'cliente':
            router.replace('/cliente/dashboard');
            break;
          default:
            limpiarSesionActiva();
            break;
        }
      } catch (error) {
        console.error('Error al verificar sesión para redirección automática:', error);
        ocultarLoader();
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [router]);

  // Oculto por CSS salvo que <html> tenga data-session-redirect (ver globals.css)
  return (
    <div className="session-redirect-loader" aria-busy="true">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
        <p className="mt-4">Cargando sistema IMSSE...</p>
      </div>
    </div>
  );
}
