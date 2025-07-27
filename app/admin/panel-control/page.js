// app/admin/panel-control/page.jsx - Dashboard IMSSE con Gestión de Usuarios
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FilePlus,
  FileText,
  Home,
  BarChart3,
  DollarSign,
  FileCheck,
  Receipt,
  ScrollText,
  TrendingUp,
  Users,
  Calendar,
  ChevronRight,
  Clock,
  AlertCircle,
  Shield,
  Bell,
  Settings,
  Wrench,
  CreditCard,
  UserPlus
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { obtenerEstadisticasUsuarios } from '../../lib/firestore'; // ← AGREGADO

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totales, setTotales] = useState({
    presupuestos: 0,
    recibos: 0,
    remitos: 0,
    estadosCuenta: 0,
    ordenesTrabajo: 0,
    recordatorios: 0,
    usuarios: 0 // ← AGREGADO
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarTotales();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarTotales = async () => {
    try {
      // Total de presupuestos
      const presupuestosRef = collection(db, 'presupuestos');
      const presupuestosSnapshot = await getDocs(presupuestosRef);

      // Total de recibos
      const recibosRef = collection(db, 'recibos');
      const recibosSnapshot = await getDocs(recibosRef);

      // Total de remitos
      const remitosRef = collection(db, 'remitos');
      const remitosSnapshot = await getDocs(remitosRef);

      // Total de estados de cuenta
      const estadosCuentaRef = collection(db, 'estados_cuenta');
      const estadosCuentaSnapshot = await getDocs(estadosCuentaRef);

      // Total de órdenes de mantenimiento
      const ordenesTrabajoRef = collection(db, 'ordenes_trabajo');
      const ordenesTrabajoSnapshot = await getDocs(ordenesTrabajoRef);

      // Total de recordatorios
      const recordatoriosRef = collection(db, 'recordatorios');
      const recordatoriosSnapshot = await getDocs(recordatoriosRef);

      // Total de usuarios - AGREGADO
      const usuariosRef = collection(db, 'usuarios');
      const usuariosSnapshot = await getDocs(usuariosRef);

      setTotales({
        presupuestos: presupuestosSnapshot.size,
        recibos: recibosSnapshot.size,
        remitos: remitosSnapshot.size,
        estadosCuenta: estadosCuentaSnapshot.size,
        ordenesTrabajo: ordenesTrabajoSnapshot.size,
        recordatorios: recordatoriosSnapshot.size,
        usuarios: usuariosSnapshot.size // ← AGREGADO
      });
    } catch (error) {
      console.error('Error al cargar totales IMSSE:', error);
      // Si hay error, mantener valores en 0
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando panel IMSSE...</p>
        </div>
      </div>
    );
  }

  // Módulos del sistema IMSSE - Todos activos con USUARIOS agregado
  const modulos = [
    {
      id: 'presupuestos',
      titulo: 'Presupuestos',
      icono: FileText,
      color: 'bg-red-600',
      colorHover: 'hover:bg-red-700',
      descripcion: 'Cotizaciones técnicas',
      total: totales.presupuestos,
      rutas: {
        nuevo: '/admin/presupuestos/nuevo',
        historial: '/admin/presupuestos'
      }
    },
    {
      id: 'estadosCuenta',
      titulo: 'Estados de Cuenta',
      icono: CreditCard,
      color: 'bg-indigo-600',
      colorHover: 'hover:bg-indigo-700',
      descripcion: 'Resúmenes financieros',
      total: totales.estadosCuenta,
      rutas: {
        nuevo: '/admin/estados-cuenta/nuevo',
        historial: '/admin/estados-cuenta'
      }
    },
    {
      id: 'recibos',
      titulo: 'Recibos',
      icono: Receipt,
      color: 'bg-green-600',
      colorHover: 'hover:bg-green-700',
      descripcion: 'Facturación',
      total: totales.recibos,
      rutas: {
        nuevo: '/admin/recibos/nuevo',
        historial: '/admin/recibos'
      }
    },
    {
      id: 'remitos',
      titulo: 'Remitos',
      icono: FileCheck,
      color: 'bg-blue-600',
      colorHover: 'hover:bg-blue-700',
      descripcion: 'Entregas',
      total: totales.remitos,
      rutas: {
        nuevo: '/admin/remitos/nuevo',
        historial: '/admin/remitos'
      }
    },
    {
      id: 'ordenes',
      titulo: 'Órdenes de Trabajo',
      icono: Shield,
      color: 'bg-purple-600',
      colorHover: 'hover:bg-purple-700',
      descripcion: 'Instalaciones',
      total: totales.ordenesTrabajo,
      rutas: {
        nuevo: '/admin/ordenes/nuevo',
        historial: '/admin/ordenes'
      }
    },
    {
      id: 'recordatorios',
      titulo: 'Recordatorios',
      icono: Bell,
      color: 'bg-yellow-600',
      colorHover: 'hover:bg-yellow-700',
      descripcion: 'Vencimientos',
      total: totales.recordatorios,
      rutas: {
        nuevo: '/admin/recordatorios/nuevo',
        historial: '/admin/recordatorios'
      }
    },
    // ← NUEVO MÓDULO DE USUARIOS
    {
      id: 'usuarios',
      titulo: 'Usuarios',
      icono: Users,
      color: 'bg-gray-600',
      colorHover: 'hover:bg-gray-700',
      descripcion: 'Gestión de accesos',
      total: totales.usuarios,
      rutas: {
        nuevo: '/registro',
        historial: '/admin/usuarios'
      }
    }
  ];

  return (
    <div className="p-6">
      {/* Título y bienvenida */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold md:text-3xl font-montserrat text-primary">
          ¡Bienvenido, {user?.displayName || user?.email?.split('@')[0]}!
        </h2>
        <p className="text-gray-600">
          Sistema de Gestión IMSSE Ingeniería S.A.S
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

      {/* Módulos del sistema - Con usuarios incluido */}
      <h3 className="flex items-center mb-6 text-xl font-bold text-gray-800">
        <Settings size={20} className="mr-2 text-primary" />
        Módulos del Sistema
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-4">
        {modulos.map(modulo => {
          const Icono = modulo.icono;
          return (
            <Link
              key={modulo.id}
              href={modulo.rutas.historial}
              className="block p-4 transition-all bg-white border-2 border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-lg hover:border-gray-300 group"
            >
              <div className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-lg ${modulo.color} ${modulo.colorHover} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <Icono size={24} className="text-white" />
                </div>
                <h4 className="mb-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary">
                  {modulo.titulo}
                </h4>
                <p className="mb-2 text-xs text-gray-600">
                  {modulo.descripcion}
                </p>
                <div className="text-lg font-bold text-primary">
                  {modulo.total}
                </div>
                <p className="text-xs text-gray-500">registros</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Acciones rápidas mejoradas - Con nuevo usuario */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <h3 className="flex items-center mb-4 text-lg font-bold text-gray-800">
          <Clock size={20} className="mr-2 text-primary" />
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          <Link
            href="/admin/presupuestos/nuevo"
            className="flex flex-col items-center p-3 text-center transition-colors border border-gray-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-300 hover:shadow-md group"
          >
            <FilePlus size={20} className="mb-2 text-red-600 transition-transform group-hover:scale-110" />
            <span className="text-xs font-medium text-gray-900 group-hover:text-red-700">Nuevo Presupuesto</span>
          </Link>
          <Link
            href="/admin/estados-cuenta/nuevo"
            className="flex flex-col items-center p-3 text-center transition-colors border border-gray-200 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md group"
          >
            <CreditCard size={20} className="mb-2 text-indigo-600 transition-transform group-hover:scale-110" />
            <span className="text-xs font-medium text-gray-900 group-hover:text-indigo-700">Nuevo Estado Cuenta</span>
          </Link>
          <Link
            href="/admin/recibos/nuevo"
            className="flex flex-col items-center p-3 text-center transition-colors border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 hover:shadow-md group"
          >
            <Receipt size={20} className="mb-2 text-green-600 transition-transform group-hover:scale-110" />
            <span className="text-xs font-medium text-gray-900 group-hover:text-green-700">Nuevo Recibo</span>
          </Link>
          <Link
            href="/admin/remitos/nuevo"
            className="flex flex-col items-center p-3 text-center transition-colors border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:shadow-md group"
          >
            <FileCheck size={20} className="mb-2 text-blue-600 transition-transform group-hover:scale-110" />
            <span className="text-xs font-medium text-gray-900 group-hover:text-blue-700">Nuevo Remito</span>
          </Link>
          <Link
            href="/admin/orden/nuevo"
            className="flex flex-col items-center p-3 text-center transition-colors border border-gray-200 rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-300 hover:shadow-md group"
          >
            <Shield size={20} className="mb-2 text-orange-600 transition-transform group-hover:scale-110" />
            <span className="text-xs font-medium text-gray-900 group-hover:text-orange-700">Nueva Orden de Trabajo</span>
          </Link>
          <Link
            href="/admin/recordatorio/nuevo"
            className="flex flex-col items-center p-3 text-center transition-colors border border-gray-200 rounded-lg cursor-pointer hover:bg-yellow-50 hover:border-yellow-300 hover:shadow-md group"
          >
            <Bell size={20} className="mb-2 text-yellow-600 transition-transform group-hover:scale-110" />
            <span className="text-xs font-medium text-gray-900 group-hover:text-yellow-700">Nuevo Recordatorio</span>
          </Link>
          {/* ← NUEVA ACCIÓN RÁPIDA PARA USUARIOS */}
          <Link
            href="/registro"
            className="flex flex-col items-center p-3 text-center transition-colors border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 hover:shadow-md group"
          >
            <UserPlus size={20} className="mb-2 text-gray-600 transition-transform group-hover:scale-110" />
            <span className="text-xs font-medium text-gray-900 group-hover:text-gray-700">Nuevo Usuario</span>
          </Link>
          <Link
            href="/admin/usuarios"
            className="flex flex-col items-center p-3 text-center transition-colors border border-gray-200 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-300 hover:shadow-md group"
          >
            <Users size={20} className="mb-2 transition-transform text-slate-600 group-hover:scale-110" />
            <span className="text-xs font-medium text-gray-900 group-hover:text-slate-700">Gestionar Usuarios</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
