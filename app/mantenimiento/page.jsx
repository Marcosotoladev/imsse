// app/mantenimiento/page.jsx - Pantalla mostrada cuando la suscripción está vencida
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LogOut } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/services/apiService';

export default function MantenimientoPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setChecking(false);
        return;
      }

      try {
        const perfil = await apiService.obtenerPerfilUsuario(currentUser.uid);
        // El Superadmin nunca se queda en esta pantalla: va directo a gestionar el cobro.
        if (perfil.superAdmin) {
          router.push('/admin/suscripcion');
          return;
        }
      } catch (error) {
        console.error('Error verificando perfil en mantenimiento:', error);
      }

      setChecking(false);
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

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 text-center bg-white shadow-lg rounded-2xl">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Aplicación en mantenimiento</h1>
        <p className="mb-6 text-sm text-gray-600">
          El acceso está suspendido temporalmente. Contactá al administrador del sistema
          para regularizar la suscripción y restablecer el servicio.
        </p>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-red-700"
        >
          <LogOut size={16} className="mr-2" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
