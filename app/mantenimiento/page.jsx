// app/mantenimiento/page.jsx - Pantalla mostrada cuando la suscripción está vencida
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, LogOut, CreditCard, RefreshCw, Calendar } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/services/apiService';

export default function MantenimientoPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [suscripcion, setSuscripcion] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setChecking(false);
        return;
      }

      try {
        const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);
        // El Superadmin nunca se queda en esta pantalla: va directo a gestionar el cobro.
        if (perfilUsuario.superAdmin) {
          router.push('/admin/suscripcion');
          return;
        }

        setPerfil(perfilUsuario);

        // El admin dueño de la cuenta puede regularizar el pago desde acá mismo.
        if (perfilUsuario.rol === 'admin') {
          const data = await apiService.obtenerSuscripcion();
          setSuscripcion(data);
        }
      } catch (error) {
        console.error('Error verificando perfil en mantenimiento:', error);
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  // El link de pago se abre en otra pestaña; al volver a esta, revisamos solos
  // si ya se acreditó el pago para no obligar al admin a hacer nada más.
  useEffect(() => {
    if (perfil?.rol !== 'admin') return;

    const revisarAlVolver = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const data = await apiService.obtenerSuscripcion();
        if (!data.bloqueada) {
          router.push('/admin/panel-control');
          return;
        }
        setSuscripcion(data);
      } catch (error) {
        console.error('Error revisando suscripción al volver:', error);
      }
    };

    document.addEventListener('visibilitychange', revisarAlVolver);
    return () => document.removeEventListener('visibilitychange', revisarAlVolver);
  }, [perfil, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handlePagar = async () => {
    setProcesando(true);
    try {
      let initPoint = suscripcion?.initPoint;
      if (!initPoint) {
        const resultado = await apiService.generarCobroSuscripcion({});
        initPoint = resultado.initPoint;
        setSuscripcion((prev) => ({ ...prev, initPoint }));
      }
      window.open(initPoint, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error al generar el link de pago:', error);
      alert(`No se pudo generar el link de pago: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleVerificar = async () => {
    setVerificando(true);
    try {
      const data = await apiService.obtenerSuscripcion();
      if (!data.bloqueada) {
        router.push('/admin/panel-control');
        return;
      }
      setSuscripcion(data);
      alert('Todavía no detectamos el pago. Si ya pagaste, esperá unos segundos y probá de nuevo.');
    } catch (error) {
      console.error('Error al verificar suscripción:', error);
    } finally {
      setVerificando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return null;
    return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  const esAdmin = perfil?.rol === 'admin';
  const puedePagar = esAdmin && (suscripcion?.initPoint || suscripcion?.monto);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 text-center bg-white shadow-lg rounded-2xl">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Aplicación en mantenimiento</h1>

        {esAdmin ? (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Tu suscripción está vencida. Regularizá el pago en MercadoPago y la app se reactiva
              automáticamente en cuanto se acredite.
            </p>

            {(suscripcion?.fechaVencimiento || suscripcion?.monto != null) && (
              <div className="p-3 mb-4 text-sm text-left border border-gray-200 rounded-xl bg-gray-50">
                {suscripcion?.fechaVencimiento && (
                  <div className="flex items-center text-gray-700">
                    <Calendar size={14} className="mr-2 text-gray-400" />
                    Venció el {formatearFecha(suscripcion.fechaVencimiento)}
                  </div>
                )}
                {suscripcion?.monto != null && (
                  <p className="mt-1 text-xs text-gray-500">
                    Monto: {suscripcion.moneda || 'ARS'} {suscripcion.monto}
                  </p>
                )}
              </div>
            )}

            {puedePagar ? (
              <button
                onClick={handlePagar}
                disabled={procesando}
                className="inline-flex items-center justify-center w-full px-4 py-2.5 mb-3 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-red-700 disabled:opacity-50"
              >
                <CreditCard size={16} className="mr-2" />
                {procesando ? 'Generando link...' : 'Pagar suscripción con MercadoPago'}
              </button>
            ) : (
              <p className="mb-3 text-xs text-gray-400">
                Todavía no se configuró el monto de la suscripción. Contactá al administrador del sistema.
              </p>
            )}

            <button
              onClick={handleVerificar}
              disabled={verificando}
              className="inline-flex items-center justify-center w-full px-4 py-2 mb-4 text-sm font-medium transition-colors border border-gray-200 rounded-lg text-primary hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={`mr-2 ${verificando ? 'animate-spin' : ''}`} />
              {verificando ? 'Verificando...' : 'Ya pagué, verificar de nuevo'}
            </button>
          </>
        ) : (
          <p className="mb-6 text-sm text-gray-600">
            El acceso está suspendido temporalmente. Contactá al administrador del sistema
            para regularizar la suscripción y restablecer el servicio.
          </p>
        )}

        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        >
          <LogOut size={16} className="mr-2" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
