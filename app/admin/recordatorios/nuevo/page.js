// app/admin/recordatorios/nuevo/page.jsx - Crear Recordatorio IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, ArrowLeft, Bell, Calendar, AlertCircle, Clock } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function CrearRecordatorio() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  // Estado del formulario
  const [recordatorio, setRecordatorio] = useState({
    titulo: '',
    descripcion: '',
    fechaVencimiento: '',
    prioridad: 'media',
    notas: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Establecer fecha mínima como hoy
        const hoy = new Date().toISOString().split('T')[0];
        setRecordatorio(prev => ({ ...prev, fechaVencimiento: hoy }));
        setLoading(false);
      } else {
        router.push('/admin');
      }
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

    // Validar que la fecha no sea anterior a hoy
    const fechaSeleccionada = new Date(recordatorio.fechaVencimiento);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      alert('La fecha de vencimiento no puede ser anterior a hoy');
      return;
    }

    setGuardando(true);

    try {
  const recordatorioData = {
    titulo: recordatorio.titulo.trim(),
    descripcion: recordatorio.descripcion.trim(),
    fechaVencimiento: recordatorio.fechaVencimiento,
    prioridad: recordatorio.prioridad,
    notas: recordatorio.notas.trim(),
    estado: 'pendiente'
  };

  await apiService.crearRecordatorio(recordatorioData);
  alert('Recordatorio creado exitosamente');
  router.push('/admin/recordatorios');
    } catch (error) {
      console.error('Error al crear recordatorio:', error);
      alert('Error al crear el recordatorio. Inténtelo de nuevo más tarde.');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando formulario IMSSE...</p>
        </div>
      </div>
    );
  }

  const prioridadConfig = getPrioridadConfig(recordatorio.prioridad);

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
              <span className="font-medium text-gray-700">Nuevo Recordatorio</span>
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
              <button
                type="submit"
                form="recordatorio-form"
                disabled={guardando}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />
                {guardando ? 'Guardando...' : 'Crear Recordatorio'}
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
              <div className="p-3 bg-yellow-100 rounded-full">
                <Bell size={32} className="text-yellow-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold font-montserrat text-primary">
              Crear Nuevo Recordatorio
            </h2>
            <p className="text-gray-600">
              Programa tareas, eventos y seguimientos para el equipo IMSSE
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

                {/* Fecha y prioridad en fila */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        min={new Date().toISOString().split('T')[0]}
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
              <div>
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

              {/* Información del creador */}
              <div className="p-4 mt-4 border border-gray-200 rounded-md bg-gray-50">
                <h4 className="mb-2 text-sm font-medium text-gray-700">Información del Creador</h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
                  <div>
                    <span className="font-medium">Usuario:</span> {user?.displayName || user?.email?.split('@')[0]}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user?.email}
                  </div>
                  <div>
                    <span className="font-medium">Fecha de creación:</span> {new Date().toLocaleDateString('es-AR')}
                  </div>
                  <div>
                    <span className="font-medium">Estado inicial:</span> Pendiente
                  </div>
                </div>
              </div>
            </div>

            {/* Vista previa */}
            {recordatorio.titulo && (
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">Vista Previa</h3>
                <div className={`p-4 rounded-lg border-l-4 ${recordatorio.prioridad === 'alta' ? 'border-red-500 bg-red-50' :
                    recordatorio.prioridad === 'media' ? 'border-yellow-500 bg-yellow-50' :
                      'border-green-500 bg-green-50'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{recordatorio.titulo}</h4>
                      {recordatorio.descripcion && (
                        <p className="mt-1 text-sm text-gray-600">{recordatorio.descripcion}</p>
                      )}
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        {recordatorio.fechaVencimiento && new Date(recordatorio.fechaVencimiento).toLocaleDateString('es-AR')}
                        <span className="mx-2">•</span>
                        <span>Creado por {user?.displayName || user?.email?.split('@')[0]}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${recordatorio.prioridad === 'alta' ? 'bg-red-500' :
                          recordatorio.prioridad === 'media' ? 'bg-yellow-500' :
                            'bg-green-500'
                        }`}></span>
                      <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 border border-yellow-200 rounded-full">
                        PENDIENTE
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
                {guardando ? 'Creando...' : 'Crear Recordatorio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}