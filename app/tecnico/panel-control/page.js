// app/tecnico/panel-control/page.jsx - Dashboard IMSSE solo para Técnicos
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FilePlus,
  Shield,
  Bell,
  Settings,
  Calendar
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { obtenerPerfilUsuario } from '../../lib/firestore';
import TecnicoLayout from '../../components/tecnico/TecnicoLayout';

export default function TecnicoDashboard() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totales, setTotales] = useState({
    ordenesTrabajo: 0,
    recordatorios: 0
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await obtenerPerfilUsuario(currentUser.uid);
          
          // Verificar que sea técnico
          if (perfilUsuario.rol !== 'tecnico') {
            router.push('/admin');
            return;
          }
          
          setUser(currentUser);
          setPerfil(perfilUsuario);
          await cargarTotales();
        } catch (error) {
          console.error('Error al verificar perfil de técnico:', error);
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarTotales = async () => {
    try {
      setLoading(true);

      // Total de órdenes de trabajo
      const ordenesTrabajoRef = collection(db, 'ordenes_trabajo');
      const ordenesTrabajoSnapshot = await getDocs(ordenesTrabajoRef);

      // Total de recordatorios
      const recordatoriosRef = collection(db, 'recordatorios');
      const recordatoriosSnapshot = await getDocs(recordatoriosRef);

      setTotales({
        ordenesTrabajo: ordenesTrabajoSnapshot.size,
        recordatorios: recordatoriosSnapshot.size
      });
    } catch (error) {
      console.error('Error al cargar totales IMSSE:', error);
      // Si hay error, mantener valores en 0
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TecnicoLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
            <p className="mt-4">Cargando panel técnico IMSSE...</p>
          </div>
        </div>
      </TecnicoLayout>
    );
  }

  // Solo los módulos que puede ver el técnico (apuntan a rutas de admin)
  const modulosTecnico = [
    {
      id: 'ordenes',
      titulo: 'Órdenes de Trabajo',
      icono: Shield,
      color: 'bg-purple-600',
      colorHover: 'hover:bg-purple-700',
      descripcion: 'Instalaciones y mantenimiento',
      total: totales.ordenesTrabajo,
      rutas: {
        nuevo: '/admin/ordenes/nuevo',      // ← Apunta a admin
        historial: '/admin/ordenes'        // ← Apunta a admin
      }
    },
    {
      id: 'recordatorios',
      titulo: 'Recordatorios',
      icono: Bell,
      color: 'bg-yellow-600',
      colorHover: 'hover:bg-yellow-700',
      descripcion: 'Vencimientos y alertas',
      total: totales.recordatorios,
      rutas: {
        nuevo: '/admin/recordatorios/nuevo',   // ← Apunta a admin
        historial: '/admin/recordatorios'     // ← Apunta a admin
      }
    }
  ];

  return (
    <TecnicoLayout>
      <div className="p-6">
        {/* Título y bienvenida */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold md:text-3xl font-montserrat text-primary">
            ¡Bienvenido, {perfil?.nombreCompleto || user?.displayName || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Panel Técnico - Sistema de Gestión IMSSE Ingeniería S.A.S
          </p>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Módulos disponibles para técnicos */}
        <h3 className="flex items-center mb-6 text-xl font-bold text-gray-800">
          <Settings size={20} className="mr-2 text-primary" />
          Módulos Disponibles
        </h3>

        {/* Cards de módulos - Solo 2 para técnicos */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-2">
          {modulosTecnico.map(modulo => {
            const Icono = modulo.icono;
            return (
              <Link
                key={modulo.id}
                href={modulo.rutas.historial}
                className="block p-6 transition-all bg-white border-2 border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-lg hover:border-gray-300 group"
              >
                <div className="text-center">
                  <div className={`mx-auto w-16 h-16 rounded-lg ${modulo.color} ${modulo.colorHover} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icono size={32} className="text-white" />
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary">
                    {modulo.titulo}
                  </h4>
                  <p className="mb-3 text-sm text-gray-600">
                    {modulo.descripcion}
                  </p>
                  <div className="text-2xl font-bold text-primary">
                    {modulo.total}
                  </div>
                  <p className="text-sm text-gray-500">registros</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Accesos rápidos - Solo para técnicos */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
          <h3 className="flex items-center mb-4 text-lg font-bold text-gray-800">
            <Calendar size={20} className="mr-2 text-primary" />
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/ordenes/nuevo"
              className="flex flex-col items-center p-4 text-center transition-colors border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 hover:shadow-md group"
            >
              <FilePlus size={24} className="mb-3 text-purple-600 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700">Nueva Orden de Trabajo</span>
            </Link>
            
            <Link
              href="/admin/recordatorios/nuevo"
              className="flex flex-col items-center p-4 text-center transition-colors border border-gray-200 rounded-lg cursor-pointer hover:bg-yellow-50 hover:border-yellow-300 hover:shadow-md group"
            >
              <Bell size={24} className="mb-3 text-yellow-600 transition-transform group-hover:scale-110" />
              <span className="text-sm font-medium text-gray-900 group-hover:text-yellow-700">Nuevo Recordatorio</span>
            </Link>
          </div>
        </div>

        {/* Información adicional para técnicos */}
        <div className="p-6 mt-8 bg-white border border-blue-200 rounded-lg shadow-md">
          <div className="text-center">
            <h4 className="mb-3 text-lg font-semibold text-primary">Panel Técnico IMSSE</h4>
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <span className="font-medium">Técnico:</span> {perfil?.nombreCompleto || 'No especificado'}
              </p>
              {perfil?.telefono && (
                <p className="mb-2">
                  <span className="font-medium">Teléfono:</span> {perfil.telefono}
                </p>
              )}
              {perfil?.empresa && (
                <p className="mb-2">
                  <span className="font-medium">Empresa:</span> {perfil.empresa}
                </p>
              )}
              <div className="pt-3 mt-3 border-t border-gray-200">
                <p className="font-medium text-primary">Acceso autorizado a:</p>
                <p className="text-xs">• Gestión completa de Órdenes de Trabajo</p>
                <p className="text-xs">• Gestión completa de Recordatorios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer IMSSE */}
        <div className="p-6 mt-8 text-center bg-white border border-red-200 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Sistema de Gestión Técnica - Protección contra incendios</p>
            <p className="mt-2">
              <span className="font-medium">Certificaciones:</span> Notifier | Mircom | Inim | Secutron | Bosch
            </p>
            <p className="mt-2">
              📧 info@imsseingenieria.com | 🌐 www.imsseingenieria.com | 📍 Córdoba, Argentina
            </p>
          </div>
        </div>
      </div>
    </TecnicoLayout>
  );
}