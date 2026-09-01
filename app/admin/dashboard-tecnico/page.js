// app/admin/dashboard-tecnico/page.jsx - Dashboard con Control de Asistencia
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Wrench,
  Bell,
  CheckCircle,
  User,
  Building,
  Calendar,
  Clock,
  ClipboardCheck
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function DashboardTecnico() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);

          // Verificar que sea técnico
          if (perfilUsuario.rol !== 'tecnico') {
            if (perfilUsuario.rol === 'admin') {
              router.push('/admin/panel-control');
            } else {
              router.push('/cliente/dashboard');
            }
            return;
          }

          // Verificar estado activo
          if (perfilUsuario.estado !== 'activo') {
            router.push('/admin');
            return;
          }

          setUser(currentUser);
          setPerfil(perfilUsuario);
        } catch (error) {
          console.error('Error al verificar usuario:', error);
          router.push('/admin');
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = timestamp.seconds ? 
      new Date(timestamp.seconds * 1000) : 
      new Date(timestamp);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard técnico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 mx-auto max-w-7xl">
        {/* Bienvenida */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 font-montserrat">
            ¡Bienvenido, {perfil?.nombre}!
          </h2>
          <p className="text-gray-600">Gestiona tus órdenes de trabajo, visitas técnicas y recordatorios</p>
        </div>

        {/* Información del perfil */}
        <div className="flex items-center p-5 mb-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-center flex-shrink-0 text-white bg-blue-600 rounded-full w-14 h-14">
            <User size={22} />
          </div>
          <div className="ml-5">
            <h3 className="text-lg font-semibold text-gray-900">{perfil?.nombreCompleto}</h3>
            <div className="mt-1 space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <Building size={14} className="mr-2" />
                Técnico IMSSE
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={14} className="mr-2" />
                Acceso desde {formatearFecha(perfil?.fechaCreacion)}
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 rounded-full bg-green-50">
              <CheckCircle size={16} className="mr-1" />
              Activo
            </span>
          </div>
        </div>

        {/* Menú principal */}
        <h3 className="mb-6 text-xl font-semibold text-gray-900">Menú</h3>
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2">
          {/* Card Órdenes de Trabajo */}
          <div className="relative flex items-center gap-3 p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm group rounded-2xl hover:shadow-lg hover:-translate-y-0.5">
            <Link href="/admin/ordenes" className="absolute inset-0 rounded-2xl" aria-label="Órdenes de Trabajo" />
            <div className="flex items-center flex-1 min-w-0 gap-3 pointer-events-none">
              <div className="flex items-center justify-center flex-shrink-0 text-white bg-red-600 w-11 h-11 rounded-xl shadow-sm transition-transform group-hover:scale-105">
                <Wrench size={20} />
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">Órdenes de Trabajo</p>
            </div>
            <Link
              href="/admin/ordenes/nuevo"
              className="relative z-10 inline-flex items-center flex-shrink-0 gap-1 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} /> Nuevo
            </Link>
          </div>

          {/* Card Visita Técnica */}
          <div className="relative flex items-center gap-3 p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm group rounded-2xl hover:shadow-lg hover:-translate-y-0.5">
            <Link href="/admin/inspecciones" className="absolute inset-0 rounded-2xl" aria-label="Visita Técnica" />
            <div className="flex items-center flex-1 min-w-0 gap-3 pointer-events-none">
              <div className="flex items-center justify-center flex-shrink-0 text-white bg-orange-600 w-11 h-11 rounded-xl shadow-sm transition-transform group-hover:scale-105">
                <ClipboardCheck size={20} />
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">Visita Técnica</p>
            </div>
            <Link
              href="/admin/inspecciones/nueva"
              className="relative z-10 inline-flex items-center flex-shrink-0 gap-1 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} /> Nuevo
            </Link>
          </div>

          {/* Card Control de Asistencia */}
          <div className="relative flex items-center gap-3 p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm group rounded-2xl hover:shadow-lg hover:-translate-y-0.5">
            <Link href="/admin/control-asistencia" className="absolute inset-0 rounded-2xl" aria-label="Control de Asistencia" />
            <div className="flex items-center flex-1 min-w-0 gap-3 pointer-events-none">
              <div className="flex items-center justify-center flex-shrink-0 text-white bg-teal-600 w-11 h-11 rounded-xl shadow-sm transition-transform group-hover:scale-105">
                <Clock size={20} />
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">Control de Asistencia</p>
            </div>
            <Link
              href="/admin/control-asistencia/marcar"
              className="relative z-10 inline-flex items-center flex-shrink-0 gap-1 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} /> Nuevo
            </Link>
          </div>

          {/* Card Recordatorios */}
          <div className="relative flex items-center gap-3 p-4 transition-all duration-200 bg-white border border-gray-100 shadow-sm group rounded-2xl hover:shadow-lg hover:-translate-y-0.5">
            <Link href="/admin/recordatorios" className="absolute inset-0 rounded-2xl" aria-label="Recordatorios" />
            <div className="flex items-center flex-1 min-w-0 gap-3 pointer-events-none">
              <div className="flex items-center justify-center flex-shrink-0 text-white bg-amber-500 w-11 h-11 rounded-xl shadow-sm transition-transform group-hover:scale-105">
                <Bell size={20} />
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">Recordatorios</p>
            </div>
            <Link
              href="/admin/recordatorios/nuevo"
              className="relative z-10 inline-flex items-center flex-shrink-0 gap-1 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} /> Nuevo
            </Link>
          </div>

        </div>

        {/* Footer simple */}
        <div className="relative p-6 overflow-hidden text-center text-white shadow-md bg-gradient-imsse rounded-2xl">
          <div className="relative z-10 text-sm">
            <p className="font-semibold tracking-wide">IMSSE INGENIERÍA S.A.S</p>
            <p className="text-white/80">Panel Técnico - Gestión completa</p>
            <p className="mt-2">
              <span className="font-medium">Técnico:</span> {perfil?.nombreCompleto}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}