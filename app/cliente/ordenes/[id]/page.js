// app/cliente/ordenes/[id]/page.jsx - Detalle de orden de trabajo para cliente
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  User,
  Building2,
  PenTool,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';

export default function DetalleOrdenCliente() {
  const router = useRouter();
  const params = useParams();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el modal de fotos (igual que en admin)
  const [modalFoto, setModalFoto] = useState({
    isOpen: false,
    fotoActual: null,
    indiceActual: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarOrden();
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [params.id]);

  const cargarOrden = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.obtenerOrdenTrabajoPorId(params.id);
      setOrden(response);
    } catch (error) {
      console.error('Error al cargar orden:', error);
      setError('No se pudo cargar la orden de trabajo');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return null;
    return hora;
  };

  const getEstadoTrabajo = () => {
    if (!orden) return { estado: 'Desconocido', color: 'gray', icon: AlertCircle };
    
    const tieneFirmas = orden.firmas && (orden.firmas.tecnico?.firma || orden.firmas.cliente?.firma);
    const tieneAmbas = orden.firmas && orden.firmas.tecnico?.firma && orden.firmas.cliente?.firma;
    
    if (tieneAmbas) {
      return { estado: 'Completado', color: 'green', icon: CheckCircle };
    } else if (tieneFirmas) {
      return { estado: 'Parcialmente Firmado', color: 'yellow', icon: AlertCircle };
    } else {
      return { estado: 'Pendiente de Firmas', color: 'yellow', icon: AlertCircle };
    }
  };

  // Funciones para el modal de fotos (copiadas del admin)
  const abrirModalFoto = (foto, indice) => {
    setModalFoto({
      isOpen: true,
      fotoActual: foto,
      indiceActual: indice
    });
  };

  const cerrarModalFoto = () => {
    setModalFoto({
      isOpen: false,
      fotoActual: null,
      indiceActual: 0
    });
  };

  const siguienteFoto = () => {
    const siguienteIndice = (modalFoto.indiceActual + 1) % orden.fotos.length;
    setModalFoto({
      ...modalFoto,
      fotoActual: orden.fotos[siguienteIndice],
      indiceActual: siguienteIndice
    });
  };

  const anteriorFoto = () => {
    const anteriorIndice = modalFoto.indiceActual === 0 ? orden.fotos.length - 1 : modalFoto.indiceActual - 1;
    setModalFoto({
      ...modalFoto,
      fotoActual: orden.fotos[anteriorIndice],
      indiceActual: anteriorIndice
    });
  };

  // Manejar teclas de navegación
  useEffect(() => {
    const manejarTeclas = (e) => {
      if (!modalFoto.isOpen) return;

      if (e.key === 'Escape') {
        cerrarModalFoto();
      } else if (e.key === 'ArrowLeft') {
        anteriorFoto();
      } else if (e.key === 'ArrowRight') {
        siguienteFoto();
      }
    };

    document.addEventListener('keydown', manejarTeclas);
    return () => document.removeEventListener('keydown', manejarTeclas);
  }, [modalFoto.isOpen, modalFoto.indiceActual]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando orden de trabajo...</p>
        </div>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error al cargar</h2>
          <p className="mt-2 text-gray-600">{error || 'Orden de trabajo no encontrada'}</p>
          <Link
            href="/cliente/ordenes"
            className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a órdenes
          </Link>
        </div>
      </div>
    );
  }

  const estadoTrabajo = getEstadoTrabajo();
  const EstadoIcon = estadoTrabajo.icon;

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/cliente/ordenes"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver a órdenes
            </Link>
          </div>
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="lg:col-span-2">
          {/* Header de la orden */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Orden de Trabajo {orden.numero}
                </h1>
                <p className="text-gray-600">
                  Fecha del trabajo: {formatearFecha(orden.fechaTrabajo || orden.fechaCreacion)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
                  <Shield size={32} className="text-purple-600" />
                </div>
                <div className="mt-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    estadoTrabajo.color === 'green' ? 'bg-green-100 text-green-800' :
                    estadoTrabajo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {estadoTrabajo.estado}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          {orden.cliente && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Building2 className="mr-2" size={20} />
                Información del Cliente
              </h2>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Empresa:
                  </label>
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-900">{orden.cliente.empresa}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Contacto:
                  </label>
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-900">{orden.cliente.nombre}</p>
                  </div>
                </div>

                {orden.cliente.telefono && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Teléfono:
                    </label>
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900">{orden.cliente.telefono}</p>
                    </div>
                  </div>
                )}

                {orden.cliente.solicitadoPor && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Solicitado por:
                    </label>
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900">{orden.cliente.solicitadoPor}</p>
                    </div>
                  </div>
                )}

                {orden.cliente.direccion && (
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Dirección del trabajo:
                    </label>
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900">{orden.cliente.direccion}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Técnicos que trabajaron */}
          {orden.tecnicos && orden.tecnicos.length > 0 && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Users className="mr-2" size={20} />
                Técnicos que Trabajaron ({orden.tecnicos.length})
              </h2>
              
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {orden.tecnicos.map((tecnico, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-3 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">{tecnico.nombre}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Horarios del trabajo */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <Clock className="mr-2" size={20} />
              Horarios del Trabajo
            </h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Fecha:
                </label>
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-900">
                    {formatearFecha(orden.fechaTrabajo || orden.fechaCreacion)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Hora de inicio:
                </label>
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-900">
                    {formatearHora(orden.horarioInicio) || 'No especificada'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Hora de fin:
                </label>
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-900">
                    {formatearHora(orden.horarioFin) || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tareas realizadas */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <CheckCircle className="mr-2" size={20} />
              Trabajos Realizados
            </h2>
            
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <p className="text-sm text-gray-900 whitespace-pre-line">
                {orden.tareasRealizadas || 'No se especificaron tareas realizadas'}
              </p>
            </div>
          </div>

          {/* Fotos del trabajo */}
          {orden.fotos && orden.fotos.length > 0 && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Camera className="mr-2" size={20} />
                Fotos del Trabajo ({orden.fotos.length})
              </h2>
              
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {orden.fotos.map((foto, index) => (
                  <div
                    key={foto.id || index}
                    className="relative cursor-pointer group"
                    onClick={() => abrirModalFoto(foto, index)}
                  >
                    <img
                      src={foto.url}
                      alt={foto.nombre || `Foto ${index + 1}`}
                      className="object-cover w-full h-32 transition-shadow border border-gray-200 rounded-md hover:shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.nextElementSibling;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                    
                    {/* Placeholder para errores (igual que admin) */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-200 rounded-md"
                      style={{ display: 'none' }}
                    >
                      <div className="text-center">
                        <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs">Error al cargar</p>
                      </div>
                    </div>
                    
                    {/* Overlay de hover (igual que admin) */}
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-50 rounded-md opacity-0 pointer-events-none group-hover:opacity-100">
                      <Camera size={32} className="text-white" />
                    </div>
                    
                    {/* Nombre del archivo */}
                    {foto.nombre && (
                      <p className="mt-2 text-xs text-center text-gray-600 truncate">
                        {foto.nombre}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Firmas */}
          {orden.firmas && (orden.firmas.tecnico?.firma || orden.firmas.cliente?.firma) && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <PenTool className="mr-2" size={20} />
                Firmas de Conformidad
              </h2>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Firma del técnico */}
                {orden.firmas.tecnico?.firma && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-700">Firma del Técnico</h3>
                    <div className="text-center">
                      <div className="inline-block p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <img
                          src={orden.firmas.tecnico.firma}
                          alt="Firma del técnico"
                          className="h-auto max-w-full max-h-32"
                          style={{ maxWidth: '250px' }}
                        />
                      </div>
                      {orden.firmas.tecnico.aclaracion && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">Aclaración:</p>
                          <p className="text-sm font-medium text-gray-900">
                            {orden.firmas.tecnico.aclaracion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Firma del cliente */}
                {orden.firmas.cliente?.firma && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-700">Firma del Cliente</h3>
                    <div className="text-center">
                      <div className="inline-block p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <img
                          src={orden.firmas.cliente.firma}
                          alt="Firma del cliente"
                          className="h-auto max-w-full max-h-32"
                          style={{ maxWidth: '250px' }}
                        />
                      </div>
                      {orden.firmas.cliente.aclaracion && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">Aclaración:</p>
                          <p className="text-sm font-medium text-gray-900">
                            {orden.firmas.cliente.aclaracion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Resumen de la orden */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Resumen de la Orden</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Número:</span>
                <span className="text-sm font-medium text-gray-900">{orden.numero}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fecha del trabajo:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatearFecha(orden.fechaTrabajo || orden.fechaCreacion)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estado:</span>
                <span className={`text-sm font-medium ${
                  estadoTrabajo.color === 'green' ? 'text-green-600' :
                  estadoTrabajo.color === 'yellow' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {estadoTrabajo.estado}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Técnicos:</span>
                <span className="text-sm font-bold text-primary">
                  {orden.tecnicos ? orden.tecnicos.length : 0}
                </span>
              </div>
              
              {orden.fotos && orden.fotos.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fotos:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {orden.fotos.length}
                  </span>
                </div>
              )}
              
              {orden.fechaModificacion && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Última actualización:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatearFecha(orden.fechaModificacion)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Estado del trabajo */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Estado del Trabajo</h2>
            
            <div className="space-y-4">
              <div className={`p-4 border rounded-md ${
                estadoTrabajo.color === 'green' ? 'border-green-200 bg-green-50' :
                estadoTrabajo.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center">
                  <EstadoIcon className={`w-5 h-5 mr-3 ${
                    estadoTrabajo.color === 'green' ? 'text-green-600' :
                    estadoTrabajo.color === 'yellow' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      estadoTrabajo.color === 'green' ? 'text-green-800' :
                      estadoTrabajo.color === 'yellow' ? 'text-yellow-800' :
                      'text-gray-800'
                    }`}>
                      {estadoTrabajo.estado}
                    </p>
                    <p className={`text-xs ${
                      estadoTrabajo.color === 'green' ? 'text-green-600' :
                      estadoTrabajo.color === 'yellow' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {estadoTrabajo.estado === 'Completado' && 'Trabajo finalizado con conformidad'}
                      {estadoTrabajo.estado === 'Parcialmente Firmado' && 'Falta alguna firma de conformidad'}
                      {estadoTrabajo.estado === 'Pendiente de Firmas' && 'Trabajo realizado, pendiente de firmas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">¿Necesitas ayuda?</h2>
            <div className="text-sm text-gray-600">
              <p className="mb-3">
                Si tienes consultas sobre este trabajo realizado:
              </p>
              <div className="space-y-2">
                <Link href="mailto:info@imsse.com" className="flex items-center text-primary hover:underline">
                  <Mail size={16} className="mr-2" />
                  info@imsse.com
                </Link>
                <div className="flex items-center">
                  <Phone size={16} className="mr-2" />
                  +54 351 123-4567
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  Córdoba, Argentina
                </div>
              </div>
              <div className="pt-3 mt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>IMSSE INGENIERÍA S.A.S</strong><br />
                  Especialistas en sistemas contra incendios
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de foto en pantalla completa (copiado exacto del admin) */}
      {modalFoto.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative flex items-center justify-center w-full h-full">

            {/* Botón cerrar */}
            <button
              onClick={cerrarModalFoto}
              className="absolute z-10 p-2 text-white transition-all bg-black bg-opacity-50 rounded-full top-4 right-4 hover:bg-opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navegación anterior */}
            {orden.fotos.length > 1 && (
              <button
                onClick={anteriorFoto}
                className="absolute z-10 p-3 text-white transition-all transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full left-4 top-1/2 hover:bg-opacity-70"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Navegación siguiente */}
            {orden.fotos.length > 1 && (
              <button
                onClick={siguienteFoto}
                className="absolute z-10 p-3 text-white transition-all transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full right-4 top-1/2 hover:bg-opacity-70"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Imagen principal */}
            <div className="max-w-full max-h-full p-4">
              <img
                src={modalFoto.fotoActual?.url}
                alt={modalFoto.fotoActual?.nombre || 'Foto del trabajo'}
                className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
                onClick={cerrarModalFoto}
              />
            </div>

            {/* Información de la foto */}
            <div className="absolute px-4 py-2 text-white transform -translate-x-1/2 bg-black rounded-lg bottom-4 left-1/2 bg-opacity-70">
              <div className="text-center">
                <div className="text-sm font-medium">
                  {modalFoto.fotoActual?.nombre || `Foto ${modalFoto.indiceActual + 1}`}
                </div>
                {orden.fotos.length > 1 && (
                  <div className="mt-1 text-xs text-gray-300">
                    {modalFoto.indiceActual + 1} de {orden.fotos.length}
                  </div>
                )}
              </div>
            </div>

            {/* Indicadores de navegación por teclado */}
            <div className="absolute px-3 py-2 text-xs text-white bg-black rounded-lg top-4 left-4 bg-opacity-70">
              <div>ESC: Cerrar</div>
              {orden.fotos.length > 1 && (
                <div>← → : Navegar</div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}