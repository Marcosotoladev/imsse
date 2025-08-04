// app/admin/recordatorios/editar/[id]/page.jsx - Editar Recordatorio IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, ArrowLeft, Bell, Calendar, AlertCircle, Clock, Eye } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../../../lib/firebase';
import apiService from '../../../../../lib/services/apiService';

export default function EditarRecordatorio() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [recordatorioOriginal, setRecordatorioOriginal] = useState(null);

  // Estado del formulario
  const [recordatorio, setRecordatorio] = useState({
    titulo: '',
    descripcion: '',
    fechaVencimiento: '',
    prioridad: 'media',
    notas: '',
    estado: 'pendiente'
  });

  useEffect(() => {
    if (!params.id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const recordatorioData = await apiService.obtenerRecordatorioPorId(params.id);

          if (recordatorioData) {
            setRecordatorioOriginal(recordatorioData);

            // Pre-cargar datos en el formulario
            setRecordatorio({
              titulo: recordatorioData.titulo || '',
              descripcion: recordatorioData.descripcion || '',
              fechaVencimiento: recordatorioData.fechaVencimiento || '',
              prioridad: recordatorioData.prioridad || 'media',
              notas: recordatorioData.notas || '',
              estado: recordatorioData.estado || 'pendiente'
            });
          } else {
            alert('Recordatorio no encontrado.');
            router.push('/admin/recordatorios');
          }
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar recordatorio:', error);
          alert('Error al cargar los datos del recordatorio.');
          router.push('/admin/recordatorios');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [params.id, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecordatorio({ ...recordatorio, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!recordatorio.titulo.trim()) {
      alert('Por favor ingresa un título para el recordatorio');
      return;
    }

    if (!recordatorio.fechaVencimiento) {
      alert('Por favor selecciona una fecha de vencimiento');
      return;
    }

    // Validar que la fecha no sea anterior a hoy (solo si no está completado)
    if (recordatorio.estado !== 'completado') {
      const fechaSeleccionada = new Date(recordatorio.fechaVencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaSeleccionada < hoy) {
        const confirmar = confirm(
          'La fecha de vencimiento es anterior a hoy. ¿Deseas continuar de todos modos?'
        );
        if (!confirmar) return;
      }
    }

    setGuardando(true);

    try {
  const recordatorioData = {
    titulo: recordatorio.titulo.trim(),
    descripcion: recordatorio.descripcion.trim(),
    fechaVencimiento: recordatorio.fechaVencimiento,
    prioridad: recordatorio.prioridad,
    notas: recordatorio.notas.trim(),
    estado: recordatorio.estado
  };

  // Si se está marcando como completado y no tenía fecha de completado
  if (recordatorio.estado === 'completado' && !recordatorioOriginal.fechaCompletado) {
    recordatorioData.fechaCompletado = new Date().toISOString();
    recordatorioData.usuarioCompletor = user?.displayName || user?.email;
  }

  // Si se está cambiando de completado a pendiente, limpiar datos de completado
  if (recordatorio.estado !== 'completado' && recordatorioOriginal.estado === 'completado') {
    recordatorioData.fechaCompletado = null;
    recordatorioData.usuarioCompletor = null;
  }

  await apiService.actualizarRecordatorio(params.id, recordatorioData);
  alert('Recordatorio actualizado exitosamente');
  router.push('/admin/recordatorios');
    } catch (error) {
      console.error('Error al actualizar recordatorio:', error);
      alert('Error al actualizar el recordatorio. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  const getPrioridadConfig = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return { color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', text: 'Alta' };
      case 'media':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', text: 'Media' };
      case 'baja':
        return { color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', text: 'Baja' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200', text: 'Media' };
    }
  };

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'completado':
        return { color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', text: 'Completado' };
      case 'pendiente':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', text: 'Pendiente' };
      default:
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', text: 'Pendiente' };
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

  const prioridadConfig = getPrioridadConfig(recordatorio.prioridad);
  const estadoConfig = getEstadoConfig(recordatorio.estado);

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
              <span className="font-medium text-gray-700">Editar {recordatorio.titulo}</span>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-2">
              <Link
                href="/admin/recordatorios"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" />
                Cancelar
              </Link>
              <Link
                href={`/admin/recordatorios/${params.id}`}
                className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Eye size={18} className="mr-2" />
                Ver Recordatorio
              </Link>
              <button
                type="submit"
                form="recordatorio-form"
                disabled={guardando}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-2xl mx-auto">
          {/* Título */}
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Bell size={32} className="text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold font-montserrat text-primary">
              Editar Recordatorio
            </h2>
            <p className="text-gray-600">
              Modifica la información del recordatorio
            </p>
          </div>

          <form id="recordatorio-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Información básica */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
                <AlertCircle size={20} className="mr-2 text-primary" />
                Información del Recordatorio
              </h3>

              <div className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Título del Recordatorio *
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={recordatorio.titulo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: Revisión mensual de equipos, Reunión con cliente, etc."
                    maxLength={100}
                    required
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {recordatorio.titulo.length}/100 caracteres
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={recordatorio.descripcion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe los detalles del recordatorio..."
                    rows={3}
                    maxLength={500}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {recordatorio.descripcion.length}/500 caracteres
                  </div>
                </div>

                {/* Fecha, prioridad y estado en fila */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Fecha de vencimiento */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Fecha de Vencimiento *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type="date"
                        name="fechaVencimiento"
                        value={recordatorio.fechaVencimiento}
                        onChange={handleInputChange}
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Prioridad */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Prioridad
                    </label>
                    <select
                      name="prioridad"
                      value={recordatorio.prioridad}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${prioridadConfig.bgColor} ${prioridadConfig.color}`}
                    >
                      <option value="baja">🟢 Baja Prioridad</option>
                      <option value="media">🟡 Media Prioridad</option>
                      <option value="alta">🔴 Alta Prioridad</option>
                    </select>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <select
                      name="estado"
                      value={recordatorio.estado}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${estadoConfig.bgColor} ${estadoConfig.color}`}
                    >
                      <option value="pendiente">⏳ Pendiente</option>
                      <option value="completado">✅ Completado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
                <Clock size={20} className="mr-2 text-primary" />
                Información Adicional
              </h3>

              {/* Notas */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Notas Adicionales
                </label>
                <textarea
                  name="notas"
                  value={recordatorio.notas}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Agrega cualquier información extra, enlaces, contactos, etc."
                  rows={4}
                  maxLength={1000}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {recordatorio.notas.length}/1000 caracteres
                </div>
              </div>

              {/* Información de auditoría */}
              {recordatorioOriginal && (
                <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Información de Auditoría</h4>
                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
                    <div>
                      <span className="font-medium">Creado por:</span> {recordatorioOriginal.usuarioCreador}
                    </div>
                    <div>
                      <span className="font-medium">Fecha creación:</span> {formatDateTime(recordatorioOriginal.fechaCreacion)}
                    </div>
                    {recordatorioOriginal.fechaModificacion && (
                      <>
                        <div>
                          <span className="font-medium">Última modificación:</span> {formatDateTime(recordatorioOriginal.fechaModificacion)}
                        </div>
                        {recordatorioOriginal.usuarioModificador && (
                          <div>
                            <span className="font-medium">Modificado por:</span> {recordatorioOriginal.usuarioModificador}
                          </div>
                        )}
                      </>
                    )}
                    {recordatorioOriginal.fechaCompletado && (
                      <>
                        <div>
                          <span className="font-medium">Completado el:</span> {formatDateTime(recordatorioOriginal.fechaCompletado)}
                        </div>
                        {recordatorioOriginal.usuarioCompletor && (
                          <div>
                            <span className="font-medium">Completado por:</span> {recordatorioOriginal.usuarioCompletor}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Vista previa */}
            {recordatorio.titulo && (
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">Vista Previa</h3>
                <div className={`p-4 rounded-lg border-l-4 ${recordatorio.estado === 'completado' ? 'border-green-500 bg-green-50' :
                    recordatorio.prioridad === 'alta' ? 'border-red-500 bg-red-50' :
                      recordatorio.prioridad === 'media' ? 'border-yellow-500 bg-yellow-50' :
                        'border-green-500 bg-green-50'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-lg font-semibold ${recordatorio.estado === 'completado' ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                        {recordatorio.titulo}
                      </h4>
                      {recordatorio.descripcion && (
                        <p className={`mt-1 text-sm ${recordatorio.estado === 'completado' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {recordatorio.descripcion}
                        </p>
                      )}
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        {recordatorio.fechaVencimiento && new Date(recordatorio.fechaVencimiento).toLocaleDateString('es-AR')}
                        <span className="mx-2">•</span>
                        <span>Editado por {user?.displayName || user?.email?.split('@')[0]}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${recordatorio.prioridad === 'alta' ? 'bg-red-500' :
                          recordatorio.prioridad === 'media' ? 'bg-yellow-500' :
                            'bg-green-500'
                        }`}></span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${recordatorio.estado === 'completado'
                          ? 'text-green-800 bg-green-100 border-green-200'
                          : 'text-yellow-800 bg-yellow-100 border-yellow-200'
                        }`}>
                        {recordatorio.estado === 'completado' ? 'COMPLETADO' : 'PENDIENTE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2">
              <Link
                href="/admin/recordatorios"
                className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={guardando}
                className="flex items-center px-6 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}