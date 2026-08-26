// app/components/SessionRedirect.jsx
// Componente invisible: si ya hay una sesión activa al abrir la home pública,
// redirige directo al panel correspondiente en vez de mostrar la landing page.
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/services/apiService';

export default function SessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const perfil = await apiService.obtenerPerfilUsuario(user.uid);
        if (perfil.estado !== 'activo') return;

        switch (perfil.rol) {
          case 'admin':
          case 'tecnico':
            router.replace('/admin/panel-control');
            break;
          case 'cliente':
            router.replace('/cliente/dashboard');
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error al verificar sesión para redirección automática:', error);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}
