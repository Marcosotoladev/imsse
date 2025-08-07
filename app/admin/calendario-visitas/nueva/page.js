// app/admin/calendario-visitas/nueva/page.jsx - Crear Nueva Visita IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, ArrowLeft, MapPin, Calendar, Clock, Building, FileText } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';

export default function NuevaVisita() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  // Estado del formulario
  const [visita, setVisita] = useState({
    fecha: '',
    hora: '',
    empresa: '',
    detalle: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Establecer fecha por defecto como hoy
        const hoy = new Date().toISOString().split('T')[0];
        setVisita(prev => ({ ...prev, fecha: hoy }));
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
    setVisita({ ...visita, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!visita.fecha.trim()) {
      alert('Por favor selecciona una fecha para la visita');
      return;
    }

    if (!visita.hora.trim()) {
      alert('Por favor selecciona una hora para la visita');
      return;
    }

    if (!visita.empresa.trim()) {
      alert('Por favor ingresa el nombre de la empresa');
      return;
    }

    setGuardando(true);

    try {
      const visitaData = {
        fecha: visita.fecha,
        hora: visita.hora,
        empresa: visita.empresa.trim(),
        detalle: visita.detalle.trim()
      };

      await apiService.crearVisita(visitaData);
      alert('Visita programada exitosamente');
      router.push('/admin/calendario-visitas');
    } catch (error) {
      console.error('Error al crear visita:', error);
      alert('Error al programar la visita. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  const obtenerFechaFormateada = (fecha) => {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleDateString('es-AR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return fecha;
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
              <Link href="/admin/calendario-visitas" className="text-primary hover:underline">
                Calendario de Visitas
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="font-medium text-gray-700">Nueva Visita</span>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-2">
              <Link
                href="/admin/calendario-visitas"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" />
                Cancelar
              </Link>
              <button
                type="submit"
                form="visita-form"
                disabled={guardando}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />
                {guardando ? 'Guardando...' : 'Programar Visita'}
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
                <MapPin size={32} className="text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold font-montserrat text-primary">
              Programar Nueva Visita
            </h2>
            <p className="text-gray-600">
              Programa una visita a una empresa cliente
            </p>
          </div>

          <form id="visita-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Información de la visita */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
                <Calendar size={20} className="mr-2 text-primary" />
                Información de la Visita
              </h3>

              <div className="space-y-4">
                {/* Fecha y hora en fila */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Fecha */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Fecha de la Visita *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type="date"
                        name="fecha"
                        value={visita.fecha}
                        onChange={handleInputChange}
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    {visita.fecha && (
                      <p className="mt-1 text-xs text-gray-500">
                        {obtenerFechaFormateada(visita.fecha)}
                      </p>
                    )}
                  </div>

                  {/* Hora */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Hora de la Visita *
                    </label>
                    <div className="relative">
                      <Clock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type="time"
                        name="hora"
                        value={visita.hora}
                        onChange={handleInputChange}
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Empresa */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Nombre de la Empresa *
                  </label>
                  <div className="relative">
                    <Building className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      name="empresa"
                      value={visita.empresa}
                      onChange={handleInputChange}
                      className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ej: Empresa ABC, Cliente XYZ, etc."
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {visita.empresa.length}/100 caracteres
                  </div>
                </div>

                {/* Detalle */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Detalle de la Visita
                  </label>
                  <div className="relative">
                    <FileText className="absolute w-5 h-5 text-gray-400 top-3 left-3" />
                    <textarea
                      name="detalle"
                      value={visita.detalle}
                      onChange={handleInputChange}
                      className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Describe el propósito de la visita, qué se va a hacer, materiales necesarios, etc."
                      rows={4}
                      maxLength={500}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {visita.detalle.length}/500 caracteres
                  </div>
                </div>
              </div>
            </div>

            {/* Información del creador */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
                <FileText size={20} className="mr-2 text-primary" />
                Información del Registro
              </h3>

              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
                  <div>
                    <span className="font-medium">Programado por:</span> {user?.displayName || user?.email?.split('@')[0]}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user?.email}
                  </div>
                  <div>
                    <span className="font-medium">Fecha de registro:</span> {new Date().toLocaleDateString('es-AR')}
                  </div>
                  <div>
                    <span className="font-medium">Hora de registro:</span> {new Date().toLocaleTimeString('es-AR')}
                  </div>
                </div>
              </div>
            </div>

            {/* Vista previa */}
            {visita.empresa && visita.fecha && visita.hora && (
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">Vista Previa</h3>
                <div className="p-4 border-l-4 border-blue-500 rounded-lg bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Visita a {visita.empresa}
                      </h4>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <Calendar size={14} className="mr-1" />
                        {obtenerFechaFormateada(visita.fecha)}
                        <Clock size={14} className="ml-4 mr-1" />
                        {visita.hora}
                      </div>
                      {visita.detalle && (
                        <p className="mt-2 text-sm text-gray-700">{visita.detalle}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Programado por {user?.displayName || user?.email?.split('@')[0]}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 border border-blue-200 rounded-full">
                        PROGRAMADA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2">
              <Link
                href="/admin/calendario-visitas"
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
                {guardando ? 'Programando...' : 'Programar Visita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}