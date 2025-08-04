// app/admin/dashboard-tecnico/page.jsx - Dashboard simple para técnicos
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  Plus,
  Wrench,
  Bell,
  CheckCircle,
  User,
  Building,
  Calendar
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function DashboardTecnico() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    ordenes: 0,
    recordatorios: 0
  });

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
          await cargarEstadisticas();
        } catch (error) {
          console.error('Error al verificar usuario:', error);
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      
      // Cargar solo las cantidades
      const [ordenesResponse, recordatoriosResponse] = await Promise.allSettled([
        apiService.obtenerOrdenesTrabajo(),
        apiService.obtenerRecordatorios()
      ]);

      let totalOrdenes = 0;
      let totalRecordatorios = 0;

      // Procesar órdenes
      if (ordenesResponse.status === 'fulfilled') {
        const ordenes = ordenesResponse.value?.documents || ordenesResponse.value || [];
        totalOrdenes = Array.isArray(ordenes) ? ordenes.length : 0;
      }

      // Procesar recordatorios
      if (recordatoriosResponse.status === 'fulfilled') {
        const recordatorios = recordatoriosResponse.value?.documents || recordatoriosResponse.value || [];
        totalRecordatorios = Array.isArray(recordatorios) ? recordatorios.length : 0;
      }

      setEstadisticas({
        ordenes: totalOrdenes,
        recordatorios: totalRecordatorios
      });

      console.log(`📊 Estadísticas cargadas: ${totalOrdenes} órdenes, ${totalRecordatorios} recordatorios`);

    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

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
      {/* Header */}
      <header className="text-white shadow bg-primary">
        <div className="px-4 py-3 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/logo/imsse-logo.png"
                alt="IMSSE Logo"
                className="w-6 h-6 mr-2 md:w-8 md:h-8 md:mr-3"
              />
              <div>
                <h1 className="text-lg font-bold md:text-xl font-montserrat">IMSSE</h1>
                <p className="text-xs text-red-100 md:text-sm">Panel Técnico</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium">{perfil?.nombreCompleto}</p>
                <p className="text-xs text-red-100">Técnico</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center p-2 text-white rounded-md hover:bg-red-700"
              >
                <LogOut size={16} className="md:mr-2" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 mx-auto max-w-7xl">
        {/* Información del perfil */}
        <div className="p-6 mb-8 bg-white border border-blue-200 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-16 h-16">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <User size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="ml-6">
              <h3 className="text-lg font-medium text-gray-900">{perfil?.nombreCompleto}</h3>
              <div className="mt-1 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Building size={14} className="mr-2" />
                  Técnico IMSSE
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={14} className="mr-2" />
                  Acceso desde {formatearFecha(perfil?.fechaCreacion)}
                </div>
              </div>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                <CheckCircle size={16} className="mr-1" />
                Activo
              </span>
            </div>
          </div>
        </div>

        {/* Cards de estadísticas - Solo 2 cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
          {/* Card Órdenes de Trabajo */}
          <Link
            href="/admin/ordenes"
            className="p-6 transition-all bg-white border-l-4 rounded-lg shadow border-l-red-500 hover:shadow-lg hover:bg-red-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
                <Wrench size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Órdenes de Trabajo
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {estadisticas.ordenes}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Click para gestionar
                </p>
              </div>
            </div>
          </Link>

          {/* Card Recordatorios */}
          <Link
            href="/admin/recordatorios"
            className="p-6 transition-all bg-white border-l-4 rounded-lg shadow border-l-yellow-500 hover:shadow-lg hover:bg-yellow-50"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
                <Bell size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Recordatorios
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {estadisticas.recordatorios}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Click para gestionar
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Acciones Rápidas - Solo 2 botones */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              href="/admin/ordenes/nuevo"
              className="flex items-center p-6 transition-all bg-white border-2 border-red-200 rounded-lg shadow hover:border-red-400 hover:bg-red-50"
            >
              <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
                <Plus size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-red-800">Nueva Orden de Trabajo</h4>
                <p className="text-sm text-red-600">Crear nueva orden de trabajo</p>
              </div>
            </Link>

            <Link
              href="/admin/recordatorios/nuevo"
              className="flex items-center p-6 transition-all bg-white border-2 border-yellow-200 rounded-lg shadow hover:border-yellow-400 hover:bg-yellow-50"
            >
              <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
                <Plus size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-yellow-800">Nuevo Recordatorio</h4>
                <p className="text-sm text-yellow-600">Crear nuevo recordatorio</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer simple */}
        <div className="p-6 mt-8 text-center bg-white border border-blue-200 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Panel Técnico - Gestión de órdenes y recordatorios</p>
            <p className="mt-2">
              <span className="font-medium">Técnico:</span> {perfil?.nombreCompleto}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}