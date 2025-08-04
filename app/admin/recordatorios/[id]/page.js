// app/admin/recordatorios/[id]/page.jsx - Ver Recordatorio IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LogOut,
  Edit,
  ArrowLeft,
  Bell,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  FileText,
  Tag,
  MessageSquare
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';

export default function VerRecordatorio() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordatorio, setRecordatorio] = useState(null);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarRecordatorio();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [params.id, router]);

  const cargarRecordatorio = async () => {
    try {
      const data = await apiService.obtenerRecordatorioPorId(params.id);

      if (data) {
        // Calcular estado automáticamente
        const fechaVencimiento = new Date(data.fechaVencimiento);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaVencimiento.setHours(0, 0, 0, 0);

        let estadoCalculado = data.estado;
        if (data.estado === 'pendiente' && fechaVencimiento < hoy) {
          estadoCalculado = 'vencido';
        }

        setRecordatorio({
          ...data,
          estadoCalculado
        });
      } else {
        alert('Recordatorio no encontrado.');
        router.push('/admin/recordatorios');
      }
    } catch (error) {
      console.error('Error al cargar recordatorio:', error);
      alert('Error al cargar el recordatorio.');
      router.push('/admin/recordatorios');
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

  const handleToggleCompletado = async () => {
    if (!recordatorio) return;

    setActualizando(true);
    try {
      const nuevoEstado = recordatorio.estado === 'completado' ? 'pendiente' : 'completado';

      const datosActualizacion = {
        estado: nuevoEstado,
        fechaCompletado: nuevoEstado === 'completado' ? new Date().toISOString() : null,
        usuarioCompletor: nuevoEstado === 'completado' ? (user?.displayName || user?.email) : null
      };

      await apiService.actualizarRecordatorio(params.id, datosActualizacion);

      // Recargar el recordatorio
      await cargarRecordatorio();

      alert(nuevoEstado === 'completado'
        ? '✅ Recordatorio marcado como completado'
        : '🔄 Recordatorio reactivado como pendiente'
      );
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado del recordatorio.');
    } finally {
      setActualizando(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';

    try {
      const date = new Date(dateString);
      const today = new Date();
      const diffTime = date - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const formatted = date.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      if (diffDays === 0) return `${formatted} (Hoy)`;
      if (diffDays === 1) return `${formatted} (Mañana)`;
      if (diffDays === -1) return `${formatted} (Ayer)`;
      if (diffDays < 0) return `${formatted} (${Math.abs(diffDays)} días atrás)`;
      if (diffDays <= 7) return `${formatted} (En ${diffDays} días)`;

      return formatted;
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'No disponible';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'No disponible';
    }
  };

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'vencido':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          text: 'VENCIDO',
          bgCard: 'border-red-500'
        };
      case 'pendiente':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          text: 'PENDIENTE',
          bgCard: 'border-yellow-500'
        };
      case 'completado':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'COMPLETADO',
          bgCard: 'border-green-500'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          text: 'DESCONOCIDO',
          bgCard: 'border-gray-500'
        };
    }
  };

  const getPrioridadConfig = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return { color: 'bg-red-500', text: 'Alta Prioridad', textColor: 'text-red-700' };
      case 'media':
        return { color: 'bg-yellow-500', text: 'Media Prioridad', textColor: 'text-yellow-700' };
      case 'baja':
        return { color: 'bg-green-500', text: 'Baja Prioridad', textColor: 'text-green-700' };
      default:
        return { color: 'bg-gray-500', text: 'Sin definir', textColor: 'text-gray-700' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando recordatorio IMSSE...</p>
        </div>
      </div>
    );
  }

  if (!recordatorio) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bell size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Recordatorio no encontrado</h2>
          <p className="text-gray-600">El recordatorio que buscas no existe o ha sido eliminado.</p>
          <Link href="/admin/recordatorios" className="inline-flex items-center px-4 py-2 mt-4 text-white rounded-md bg-primary hover:bg-red-700">
            <ArrowLeft size={16} className="mr-2" />
            Volver a Recordatorios
          </Link>
        </div>
      </div>
    );
  }

  const estadoConfig = getEstadoConfig(recordatorio.estadoCalculado);
  const prioridadConfig = getPrioridadConfig(recordatorio.prioridad);
  const IconoEstado = estadoConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header IMSSE */}
      <header className="text-white shadow bg-primary">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="flex items-center">
            <img
              src="/logo/imsse-logo.png"
              alt="IMSSE Logo"
              className="w-8 h-8 mr-3"
            />
            <h1 className="text-xl font-bold font-montserrat">IMSSE - Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-red-700"
            >
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            {/* Breadcrumb */}
            <div className="flex items-center">
              <Link href="/admin/panel-control" className="text-primary hover:underline">
                <Home size={16} className="inline mr-1" />
                Panel de Control
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <Link href="/admin/recordatorios" className="text-primary hover:underline">
                Recordatorios
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="font-medium text-gray-700">Ver Recordatorio</span>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-2">
              <Link
                href="/admin/recordatorios"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" />
                Volver
              </Link>
              <button
                onClick={handleToggleCompletado}
                disabled={actualizando}
                className={`flex items-center px-4 py-2 text-white transition-colors rounded-md disabled:opacity-50 ${recordatorio.estado === 'completado'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                <CheckCircle size={18} className="mr-2" />
                {actualizando
                  ? 'Actualizando...'
                  : recordatorio.estado === 'completado'
                    ? 'Reactivar'
                    : 'Marcar Completado'
                }
              </button>
              <Link
                href={`/admin/recordatorios/editar/${params.id}`}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700"
              >
                <Edit size={18} className="mr-2" />
                Editar
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">

          {/* Tarjeta principal del recordatorio */}
          <div className={`p-8 mb-6 bg-white rounded-lg shadow-md border-l-4 ${estadoConfig.bgCard}`}>
            <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
              {/* Contenido principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start space-x-4">
                  {/* Checkbox visual */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mt-1 ${recordatorio.estado === 'completado'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300'
                    }`}>
                    {recordatorio.estado === 'completado' && <CheckCircle size={20} />}
                  </div>

                  {/* Información del recordatorio */}
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-2xl font-bold mb-2 ${recordatorio.estado === 'completado' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                      {recordatorio.titulo}
                    </h2>

                    {recordatorio.descripcion && (
                      <p className={`text-lg mb-4 ${recordatorio.estado === 'completado' ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                        {recordatorio.descripcion}
                      </p>
                    )}

                    {/* Información clave */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        <span className="font-medium">Vence:</span>
                        <span className="ml-1">{formatDate(recordatorio.fechaVencimiento)}</span>
                      </div>
                      <div className="flex items-center">
                        <User size={16} className="mr-2" />
                        <span className="font-medium">Creado por:</span>
                        <span className="ml-1">{recordatorio.usuarioCreador}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estados y prioridad */}
              <div className="flex flex-col items-start space-y-3 md:items-end">
                {/* Estado */}
                <span className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-full border ${estadoConfig.color}`}>
                  <IconoEstado size={16} className="mr-2" />
                  {estadoConfig.text}
                </span>

                {/* Prioridad */}
                <div className="flex items-center">
                  <span className={`w-4 h-4 rounded-full ${prioridadConfig.color} mr-2`}></span>
                  <span className={`text-sm font-medium ${prioridadConfig.textColor}`}>
                    {prioridadConfig.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información detallada */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Detalles del recordatorio */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
                <FileText size={20} className="mr-2 text-primary" />
                Detalles del Recordatorio
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Título</label>
                  <p className="text-gray-900">{recordatorio.titulo}</p>
                </div>

                {recordatorio.descripcion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Descripción</label>
                    <p className="text-gray-900">{recordatorio.descripcion}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de Vencimiento</label>
                    <p className="text-gray-900">{formatDate(recordatorio.fechaVencimiento)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Prioridad</label>
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full ${prioridadConfig.color} mr-2`}></span>
                      <span className="text-gray-900">{prioridadConfig.text}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Estado Actual</label>
                  <div className="flex items-center">
                    <IconoEstado size={16} className="mr-2 text-gray-600" />
                    <span className="text-gray-900">{estadoConfig.text}</span>
                  </div>
                </div>

                {recordatorio.notas && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Notas Adicionales</label>
                    <div className="p-3 mt-1 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-gray-900 whitespace-pre-wrap">{recordatorio.notas}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información de seguimiento */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
                <Clock size={20} className="mr-2 text-primary" />
                Información de Seguimiento
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Creado por</label>
                  <p className="text-gray-900">{recordatorio.usuarioCreador}</p>
                  <p className="text-sm text-gray-600">{recordatorio.emailCreador}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Fecha de Creación</label>
                  <p className="text-gray-900">{formatDateTime(recordatorio.fechaCreacion)}</p>
                </div>

                {recordatorio.fechaModificacion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Última Modificación</label>
                    <p className="text-gray-900">{formatDateTime(recordatorio.fechaModificacion)}</p>
                  </div>
                )}

                {recordatorio.fechaCompletado && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Completado el</label>
                    <p className="text-gray-900">{formatDateTime(recordatorio.fechaCompletado)}</p>
                    {recordatorio.usuarioCompletor && (
                      <p className="text-sm text-gray-600">Por: {recordatorio.usuarioCompletor}</p>
                    )}
                  </div>
                )}

                {/* Estado calculado */}
                {recordatorio.estadoCalculado !== recordatorio.estado && (
                  <div className="p-3 border border-yellow-200 rounded-md bg-yellow-50">
                    <p className="text-sm text-yellow-800">
                      <AlertTriangle size={16} className="inline mr-1" />
                      <strong>Nota:</strong> Este recordatorio está marcado como "{recordatorio.estado}" pero ha vencido automáticamente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex justify-center mt-8 space-x-4">
            <Link
              href="/admin/recordatorios"
              className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Volver a la Lista
            </Link>
            <Link
              href={`/admin/recordatorios/editar/${params.id}`}
              className="px-6 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700"
            >
              Editar Recordatorio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}