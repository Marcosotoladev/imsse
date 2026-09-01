// app/cliente/inspecciones/[id]/page.jsx - Detalle de visita técnica para cliente
'use client';

import { Fragment, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  Clock,
  MapPin,
  Users,
  User,
  Building2,
  PenTool,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  ClipboardCheck,
  Download
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';

// Colores de badges: mismo criterio visual que app/components/inspecciones/PlanillasAdjuntas.jsx
const ESTADO_BADGE = {
  OK: { label: 'OK', clase: 'bg-success text-white' },
  NOK: { label: 'N OK', clase: 'bg-danger text-white' },
  NA: { label: 'N/A', clase: 'bg-gray-500 text-white' }
};

const SEVERIDAD_BADGE = {
  LEVE: 'bg-warning text-white',
  MODERADA: 'bg-orange-600 text-white',
  CRITICA: 'bg-danger text-white'
};

function EstadoBadge({ estado }) {
  const info = ESTADO_BADGE[estado] || { label: estado, clase: 'bg-gray-400 text-white' };
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-md shrink-0 ${info.clase}`}>
      {info.label}
    </span>
  );
}

function SeveridadBadge({ severidad }) {
  const clase = SEVERIDAD_BADGE[severidad] || 'bg-gray-400 text-white';
  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${clase}`}>
      {severidad}
    </span>
  );
}

export default function DetalleInspeccionCliente() {
  const router = useRouter();
  const params = useParams();
  const [inspeccion, setInspeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // Estado para el modal de fotos (igual que en admin)
  const [modalFoto, setModalFoto] = useState({
    isOpen: false,
    fotoActual: null,
    indiceActual: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarInspeccion();
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [params.id]);

  const cargarInspeccion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.obtenerInspeccionTecnicaPorId(params.id);
      setInspeccion(response);
    } catch (error) {
      console.error('Error al cargar inspección:', error);
      setError('No se pudo cargar la visita técnica');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async () => {
    if (!inspeccion) return;
    setGenerandoPDF(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: InspeccionTecnicaPDF } = await import('../../../components/pdf/InspeccionTecnicaPDF');

      const blob = await pdf(<InspeccionTecnicaPDF inspeccion={inspeccion} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${inspeccion.numero}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    } finally {
      setGenerandoPDF(false);
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

  const getEstadoInspeccion = () => {
    if (!inspeccion) return { estado: 'Desconocido', color: 'gray', icon: AlertCircle };

    const tieneFirmas = inspeccion.firmas && (inspeccion.firmas.tecnico?.firma || inspeccion.firmas.cliente?.firma);
    const tieneAmbas = inspeccion.firmas && inspeccion.firmas.tecnico?.firma && inspeccion.firmas.cliente?.firma;

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
    const siguienteIndice = (modalFoto.indiceActual + 1) % inspeccion.fotos.length;
    setModalFoto({
      ...modalFoto,
      fotoActual: inspeccion.fotos[siguienteIndice],
      indiceActual: siguienteIndice
    });
  };

  const anteriorFoto = () => {
    const anteriorIndice = modalFoto.indiceActual === 0 ? inspeccion.fotos.length - 1 : modalFoto.indiceActual - 1;
    setModalFoto({
      ...modalFoto,
      fotoActual: inspeccion.fotos[anteriorIndice],
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
          <p className="mt-4 text-gray-600">Cargando visita técnica...</p>
        </div>
      </div>
    );
  }

  if (error || !inspeccion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error al cargar</h2>
          <p className="mt-2 text-gray-600">{error || 'Inspección técnica no encontrada'}</p>
          <Link
            href="/cliente/inspecciones"
            className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a inspecciones
          </Link>
        </div>
      </div>
    );
  }

  const estadoInspeccion = getEstadoInspeccion();
  const EstadoIcon = estadoInspeccion.icon;

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Link
            href="/cliente/inspecciones"
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver a inspecciones
          </Link>

          <button
            onClick={handleDescargarPDF}
            disabled={generandoPDF}
            className="flex items-center px-4 py-2 text-sm text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
          >
            <Download size={16} className="mr-2" />
            {generandoPDF ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="lg:col-span-2">
          {/* Header de la inspección */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Visita Técnica {inspeccion.numero}
                </h1>
                <p className="text-gray-600">
                  Fecha del trabajo: {formatearFecha(inspeccion.fechaTrabajo || inspeccion.fechaCreacion)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
                  <Shield size={32} className="text-purple-600" />
                </div>
                <div className="mt-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    estadoInspeccion.color === 'green' ? 'bg-green-100 text-green-800' :
                    estadoInspeccion.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {estadoInspeccion.estado}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          {inspeccion.cliente && (
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
                    <p className="text-sm text-gray-900">{inspeccion.cliente.empresa}</p>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Contacto:
                  </label>
                  <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-900">{inspeccion.cliente.nombre}</p>
                  </div>
                </div>

                {inspeccion.cliente.telefono && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Teléfono:
                    </label>
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900">{inspeccion.cliente.telefono}</p>
                    </div>
                  </div>
                )}

                {inspeccion.cliente.solicitadoPor && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Solicitado por:
                    </label>
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900">{inspeccion.cliente.solicitadoPor}</p>
                    </div>
                  </div>
                )}

                {inspeccion.cliente.sedeNombre && (
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Sede:
                    </label>
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900">{inspeccion.cliente.sedeNombre}</p>
                    </div>
                  </div>
                )}

                {inspeccion.cliente.direccion && (
                  <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Dirección del trabajo:
                    </label>
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-sm text-gray-900">{inspeccion.cliente.direccion}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Técnicos que realizaron la inspección */}
          {inspeccion.tecnicos && inspeccion.tecnicos.length > 0 && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Users className="mr-2" size={20} />
                Técnicos que Realizaron la Inspección ({inspeccion.tecnicos.length})
              </h2>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {inspeccion.tecnicos.map((tecnico, index) => (
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
                    {formatearFecha(inspeccion.fechaTrabajo || inspeccion.fechaCreacion)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Hora de inicio:
                </label>
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-900">
                    {formatearHora(inspeccion.horarioInicio) || 'No especificada'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Hora de fin:
                </label>
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-900">
                    {formatearHora(inspeccion.horarioFin) || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist de inspección */}
          {inspeccion.planillasAdjuntas && inspeccion.planillasAdjuntas.length > 0 && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <ClipboardCheck className="mr-2" size={20} />
                Checklist de Inspección
              </h2>

              <div className="space-y-4">
                {inspeccion.planillasAdjuntas.map((planilla, planillaIndex) => (
                  <div key={planillaIndex} className="overflow-hidden border border-gray-200 rounded-lg">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">{planilla.grupo}</p>
                      <p className="font-medium text-gray-800">{planilla.titulo}</p>
                    </div>

                    {planilla.tipo === 'tabular' ? (
                      <div className="p-4 space-y-3">
                        {(!planilla.unidades || planilla.unidades.length === 0) && (
                          <p className="text-sm text-gray-400">
                            Sin {(planilla.nombreUnidad || 'unidad').toLowerCase()}es cargadas.
                          </p>
                        )}
                        {(planilla.unidades || []).map((unidad, unidadIndex) => (
                          <div key={unidadIndex} className="border border-gray-200 rounded-md">
                            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                              <p className="text-sm font-semibold text-gray-800">
                                {planilla.nombreUnidad} {unidad.numero}
                              </p>
                              {(planilla.camposTexto || []).map((campo) => (
                                unidad.campos?.[campo] ? (
                                  <p key={campo} className="text-xs text-gray-500">
                                    {campo}: {unidad.campos[campo]}
                                  </p>
                                ) : null
                              ))}
                            </div>
                            <div className="p-3 space-y-2">
                              {(planilla.columnas || []).map((columna) => (
                                <div key={columna} className="flex items-center justify-between gap-2">
                                  <span className="text-sm text-gray-700">{columna}</span>
                                  {unidad.valores?.[columna] && (
                                    <EstadoBadge estado={unidad.valores[columna]} />
                                  )}
                                </div>
                              ))}
                              {unidad.observacion && (
                                <p className="pt-2 text-sm text-gray-600 border-t border-gray-100 whitespace-pre-line">
                                  {unidad.observacion}
                                </p>
                              )}
                              {unidad.severidad && (
                                <div><SeveridadBadge severidad={unidad.severidad} /></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {(planilla.items || []).map((item, itemIndex) => (
                          <Fragment key={itemIndex}>
                            {item.subtitulo && (
                              <div className="px-4 py-2 text-xs font-bold tracking-wide text-gray-500 uppercase bg-gray-100">
                                {item.subtitulo}
                              </div>
                            )}
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-gray-700">
                                  {itemIndex + 1}. {item.descripcion}
                                </p>
                                {item.estado && <EstadoBadge estado={item.estado} />}
                              </div>
                              {item.observacion && (
                                <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{item.observacion}</p>
                              )}
                              {item.severidad && (
                                <div className="mt-2"><SeveridadBadge severidad={item.severidad} /></div>
                              )}
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones generales */}
          {inspeccion.observaciones && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <CheckCircle className="mr-2" size={20} />
                Observaciones Generales
              </h2>

              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <p className="text-sm text-gray-900 whitespace-pre-line">
                  {inspeccion.observaciones}
                </p>
              </div>
            </div>
          )}

          {/* Fotos del trabajo */}
          {inspeccion.fotos && inspeccion.fotos.length > 0 && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Camera className="mr-2" size={20} />
                Fotos del Trabajo ({inspeccion.fotos.length})
              </h2>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {inspeccion.fotos.map((foto, index) => (
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
          {inspeccion.firmas && (inspeccion.firmas.tecnico?.firma || inspeccion.firmas.cliente?.firma) && (
            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <PenTool className="mr-2" size={20} />
                Firmas de Conformidad
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Firma del técnico */}
                {inspeccion.firmas.tecnico?.firma && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-700">Firma del Técnico</h3>
                    <div className="text-center">
                      <div className="inline-block p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <img
                          src={inspeccion.firmas.tecnico.firma}
                          alt="Firma del técnico"
                          className="h-auto max-w-full max-h-32"
                          style={{ maxWidth: '250px' }}
                        />
                      </div>
                      {inspeccion.firmas.tecnico.aclaracion && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">Aclaración:</p>
                          <p className="text-sm font-medium text-gray-900">
                            {inspeccion.firmas.tecnico.aclaracion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Firma del cliente */}
                {inspeccion.firmas.cliente?.firma && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-700">Firma del Cliente</h3>
                    <div className="text-center">
                      <div className="inline-block p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <img
                          src={inspeccion.firmas.cliente.firma}
                          alt="Firma del cliente"
                          className="h-auto max-w-full max-h-32"
                          style={{ maxWidth: '250px' }}
                        />
                      </div>
                      {inspeccion.firmas.cliente.aclaracion && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">Aclaración:</p>
                          <p className="text-sm font-medium text-gray-900">
                            {inspeccion.firmas.cliente.aclaracion}
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
          {/* Resumen de la inspección */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Resumen de la Inspección</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Número:</span>
                <span className="text-sm font-medium text-gray-900">{inspeccion.numero}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fecha del trabajo:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatearFecha(inspeccion.fechaTrabajo || inspeccion.fechaCreacion)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estado:</span>
                <span className={`text-sm font-medium ${
                  estadoInspeccion.color === 'green' ? 'text-green-600' :
                  estadoInspeccion.color === 'yellow' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {estadoInspeccion.estado}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Técnicos:</span>
                <span className="text-sm font-bold text-primary">
                  {inspeccion.tecnicos ? inspeccion.tecnicos.length : 0}
                </span>
              </div>

              {inspeccion.planillasAdjuntas && inspeccion.planillasAdjuntas.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Planillas:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {inspeccion.planillasAdjuntas.length}
                  </span>
                </div>
              )}

              {inspeccion.fotos && inspeccion.fotos.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fotos:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {inspeccion.fotos.length}
                  </span>
                </div>
              )}

              {inspeccion.fechaModificacion && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Última actualización:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatearFecha(inspeccion.fechaModificacion)}
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
                estadoInspeccion.color === 'green' ? 'border-green-200 bg-green-50' :
                estadoInspeccion.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center">
                  <EstadoIcon className={`w-5 h-5 mr-3 ${
                    estadoInspeccion.color === 'green' ? 'text-green-600' :
                    estadoInspeccion.color === 'yellow' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      estadoInspeccion.color === 'green' ? 'text-green-800' :
                      estadoInspeccion.color === 'yellow' ? 'text-yellow-800' :
                      'text-gray-800'
                    }`}>
                      {estadoInspeccion.estado}
                    </p>
                    <p className={`text-xs ${
                      estadoInspeccion.color === 'green' ? 'text-green-600' :
                      estadoInspeccion.color === 'yellow' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {estadoInspeccion.estado === 'Completado' && 'Inspección finalizada con conformidad'}
                      {estadoInspeccion.estado === 'Parcialmente Firmado' && 'Falta alguna firma de conformidad'}
                      {estadoInspeccion.estado === 'Pendiente de Firmas' && 'Inspección realizada, pendiente de firmas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">¿Necesitás ayuda?</h2>
            <div className="text-sm text-gray-600">
              <p className="mb-3">
                Si tenés consultas sobre esta inspección realizada:
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
            {inspeccion.fotos.length > 1 && (
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
            {inspeccion.fotos.length > 1 && (
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
                {inspeccion.fotos.length > 1 && (
                  <div className="mt-1 text-xs text-gray-300">
                    {modalFoto.indiceActual + 1} de {inspeccion.fotos.length}
                  </div>
                )}
              </div>
            </div>

            {/* Indicadores de navegación por teclado */}
            <div className="absolute px-3 py-2 text-xs text-white bg-black rounded-lg top-4 left-4 bg-opacity-70">
              <div>ESC: Cerrar</div>
              {inspeccion.fotos.length > 1 && (
                <div>← → : Navegar</div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
