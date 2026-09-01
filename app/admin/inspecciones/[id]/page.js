// app/admin/inspecciones/[id]/page.jsx - Ver Visita Técnica IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Edit,
  ArrowLeft,
  Download,
  Trash2,
  Shield,
  User,
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  Camera,
  CheckCircle,
  PenTool,
  ClipboardCheck
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';
import { use } from 'react';

// Colores de badge para los estados del checklist (OK / NOK / NA)
const badgeClaseEstado = (estado) => {
  if (estado === 'OK') return 'bg-green-600 text-white';
  if (estado === 'NOK') return 'bg-red-600 text-white';
  if (estado === 'NA') return 'bg-gray-500 text-white';
  return 'bg-gray-300 text-gray-700';
};

export default function VerInspeccionTecnica({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inspeccion, setInspeccion] = useState(null);

  // Estado para el modal de fotos
  const [modalFoto, setModalFoto] = useState({
    isOpen: false,
    fotoActual: null,
    indiceActual: 0
  });

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Función para formatear hora
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  useEffect(() => {
  if (!id) return;

  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      try {
        const inspeccionData = await apiService.obtenerInspeccionTecnicaPorId(id);
        if (inspeccionData) {
          setInspeccion(inspeccionData);
        } else {
          alert('Inspección técnica no encontrada.');
          router.push('/admin/inspecciones');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar inspección técnica IMSSE:', error);
        alert('Error al cargar los datos de la inspección.');
        router.push('/admin/inspecciones');
      }
    } else {
      router.push('/admin');
    }
  });

  return () => unsubscribe();
}, [id, router]);
  const handleDeleteInspeccion = async () => {
    if (confirm(`¿Está seguro de que desea eliminar la visita técnica ${inspeccion.numero}?`)) {
      try {
        await apiService.eliminarInspeccionTecnica(id);
        alert('Inspección técnica eliminada exitosamente.');
        router.push('/admin/inspecciones');
      } catch (error) {
        console.error('Error al eliminar inspección técnica:', error);
        alert('Error al eliminar la visita técnica.');
      }
    }
  };

  const handleDescargarPDF = async () => {
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
      alert(`✅ Inspección ${inspeccion.numero} descargada exitosamente`);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  // Funciones para el modal de fotos
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
          <p className="mt-4">Cargando visita técnica IMSSE...</p>
        </div>
      </div>
    );
  }

  if (!inspeccion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Inspección técnica no encontrada</h2>
          <Link
            href="/admin/inspecciones"
            className="inline-flex items-center px-4 py-2 mt-4 text-white rounded-md bg-primary hover:bg-primary/90"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver a Inspecciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación y controles */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            {/* Breadcrumb */}
            <div className="flex items-center">
              <Link
                href="/admin/panel-control"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                <Home size={16} className="mr-1" /> Panel de Control
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <Link
                href="/admin/inspecciones"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                Visita Técnica
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-700">Detalles</span>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/inspecciones"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Link>
              <Link
                href={`/admin/inspecciones/editar/${id}`}
                className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Edit size={18} className="mr-2" /> Editar
              </Link>
              <button
                onClick={handleDeleteInspeccion}
                className="flex items-center px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
              >
                <Trash2 size={18} className="mr-2" /> Eliminar
              </button>
              <button
                onClick={handleDescargarPDF}
                className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
              >
                <Download size={18} className="mr-2" /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header de la inspección */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
                  Visita Técnica {inspeccion.numero}
                </h1>
                <p className="text-gray-600">
                  Sistema de Gestión IMSSE Ingeniería
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {formatDate(inspeccion.fechaTrabajo)}
                </div>
                <p className="text-sm text-gray-500">
                  {formatTime(inspeccion.horarioInicio)} - {formatTime(inspeccion.horarioFin)}
                </p>
              </div>
            </div>
          </div>

          {/* Vista estilo inspección técnica */}
          <div className="bg-white shadow-lg">
            {/* Encabezado IMSSE */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-red-600">
              <div className="flex items-center">
                <img
                  src="/logo/imsse-logo.png"
                  alt="IMSSE Logo"
                  className="w-10 h-10 mr-4"
                />
                <div>
                  <div className="text-xl font-bold">
                    <span className="text-red-600">IMSSE </span>
                    <span className="text-blue-500">INGENIERÍA </span>
                    <span className="text-red-600">S.A.S</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Instalación y Mantenimiento de Sistemas de Seguridad Electrónicos
                  </div>
                </div>
              </div>
              <div className="text-xs text-right text-gray-600">
                <div>Córdoba, Argentina</div>
                <div>📧 info@imsseingenieria.com</div>
                <div>🌐 www.imsseingenieria.com</div>
              </div>
            </div>

            {/* Título y número */}
            <div className="flex items-center justify-between px-8 py-6">
              <h1 className="text-2xl font-bold text-red-600">VISITA TÉCNICA</h1>
              <div className="text-xl font-semibold text-red-600">N° {inspeccion.numero}</div>
            </div>

            {/* Información básica */}
            <div className="px-8 py-4">
              <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="mb-3 text-lg font-semibold text-gray-700">Información Básica</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Fecha de trabajo:</span>
                    <span className="text-gray-900">{formatDate(inspeccion.fechaTrabajo)}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Horario:</span>
                    <span className="text-gray-900">
                      {formatTime(inspeccion.horarioInicio)} - {formatTime(inspeccion.horarioFin)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos del cliente */}
            <div className="px-8 py-4">
              <div className="p-4 rounded-lg bg-blue-50">
                <h3 className="mb-3 text-lg font-semibold text-gray-700">Datos del Cliente</h3>
                <div className="space-y-3">
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Empresa:</span>
                    <span className="text-gray-900">{inspeccion.cliente?.empresa || 'No especificada'}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Contacto:</span>
                    <span className="text-gray-900">{inspeccion.cliente?.nombre || 'No especificado'}</span>
                  </div>
                  {inspeccion.cliente?.telefono && (
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Teléfono:</span>
                      <span className="text-gray-900">{inspeccion.cliente.telefono}</span>
                    </div>
                  )}
                  {inspeccion.cliente?.sedeNombre && (
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Sede:</span>
                      <span className="text-gray-900">{inspeccion.cliente.sedeNombre}</span>
                    </div>
                  )}
                  {inspeccion.cliente?.direccion && (
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Dirección:</span>
                      <span className="text-gray-900">{inspeccion.cliente.direccion}</span>
                    </div>
                  )}
                  {inspeccion.cliente?.solicitadoPor && (
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Solicitado por:</span>
                      <span className="text-gray-900">{inspeccion.cliente.solicitadoPor}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Técnicos asignados */}
            <div className="px-8 py-4">
              <div className="p-4 rounded-lg bg-green-50">
                <h3 className="mb-3 text-lg font-semibold text-gray-700">Técnicos Asignados</h3>
                {inspeccion.tecnicos?.length > 0 ? (
                  <div className="space-y-2">
                    {inspeccion.tecnicos.map((tecnico, index) => (
                      <div key={index} className="flex items-center">
                        <Users size={16} className="mr-2 text-green-600" />
                        <span className="text-gray-900">{tecnico.nombre}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No se asignaron técnicos</p>
                )}
              </div>
            </div>

            {/* Checklist de inspección */}
            <div className="px-8 py-4">
              <div className="p-4 rounded-lg bg-yellow-50">
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-700">
                  <ClipboardCheck size={20} className="mr-2 text-gray-600" />
                  Checklist de Inspección
                </h3>
                {inspeccion.planillasAdjuntas?.length > 0 ? (
                  <div className="space-y-4">
                    {inspeccion.planillasAdjuntas.map((planilla, planillaIndex) => (
                      <div key={planillaIndex} className="p-4 bg-white border border-gray-200 rounded-md">
                        {planilla.grupo && (
                          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">{planilla.grupo}</p>
                        )}
                        <p className="mb-3 font-semibold text-gray-800">{planilla.titulo}</p>

                        {planilla.tipo === 'tabular' ? (
                          <div className="space-y-3">
                            {(planilla.unidades || []).map((unidad, unidadIndex) => (
                              <div key={unidadIndex} className="p-3 border border-gray-100 rounded-md bg-gray-50">
                                <p className="mb-2 text-sm font-medium text-gray-800">
                                  {planilla.nombreUnidad} {unidad.numero}
                                </p>

                                {(planilla.camposTexto || []).map((campo) => (
                                  unidad.campos?.[campo] ? (
                                    <p key={campo} className="text-xs text-gray-600">
                                      <span className="font-medium">{campo}:</span> {unidad.campos[campo]}
                                    </p>
                                  ) : null
                                ))}

                                {(planilla.columnas || []).length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {(planilla.columnas || []).map((columna) => (
                                      unidad.valores?.[columna] ? (
                                        <span key={columna} className="inline-flex items-center gap-1 text-xs">
                                          <span className="text-gray-600">{columna}:</span>
                                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeClaseEstado(unidad.valores[columna])}`}>
                                            {unidad.valores[columna]}
                                          </span>
                                        </span>
                                      ) : null
                                    ))}
                                  </div>
                                )}

                                {unidad.observacion && (
                                  <p className="mt-2 text-xs italic text-gray-500">{unidad.observacion}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {(planilla.items || []).map((item, itemIndex) => (
                              <div key={itemIndex}>
                                {item.subtitulo && (
                                  <p className="mt-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">{item.subtitulo}</p>
                                )}
                                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                                  <div className="pr-3">
                                    <p className="text-sm text-gray-800">{item.descripcion}</p>
                                    {item.observacion && (
                                      <p className="mt-1 text-xs italic text-gray-500">{item.observacion}</p>
                                    )}
                                  </div>
                                  {item.estado && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${badgeClaseEstado(item.estado)}`}>
                                      {item.estado}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No se adjuntaron planillas de checklist.</p>
                )}
              </div>
            </div>

            {/* Observaciones generales */}
            {inspeccion.observaciones && (
              <div className="px-8 py-4">
                <div className="p-4 rounded-lg bg-orange-50">
                  <h3 className="mb-3 text-lg font-semibold text-gray-700">Observaciones Generales</h3>
                  <div className="text-gray-900 whitespace-pre-line">
                    {inspeccion.observaciones}
                  </div>
                </div>
              </div>
            )}

            {/* Fotos del trabajo */}
            {inspeccion.fotos?.length > 0 && (
              <div className="px-8 py-4">
                <div className="p-4 rounded-lg bg-purple-50">
                  <h3 className="mb-3 text-lg font-semibold text-gray-700">
                    Fotografías del Trabajo ({inspeccion.fotos.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {inspeccion.fotos.map((foto, index) => (
                      <div
                        key={foto.id || index}
                        className="relative cursor-pointer group"
                        onClick={() => abrirModalFoto(foto, index)}
                      >
                        <img
                          src={foto.url}
                          alt={foto.nombre || `Foto ${index + 1}`}
                          className="object-cover w-full h-48 transition-shadow border border-gray-200 rounded-md hover:shadow-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-50 rounded-md opacity-0 pointer-events-none group-hover:opacity-100">
                          <Camera size={32} className="text-white" />
                        </div>
                        <p className="mt-2 text-sm text-center text-gray-600 truncate">
                          {foto.nombre || `Foto ${index + 1}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sección de firmas */}
            {(inspeccion.firmas?.tecnico?.firma || inspeccion.firmas?.cliente?.firma) && (
              <div className="flex justify-around px-8 py-12 mt-8 border-t border-gray-200">
                {/* Firma del técnico */}
                <div className="flex flex-col items-center w-2/5">
                  <h4 className="mb-4 text-sm font-semibold text-gray-700 uppercase">Técnico Responsable</h4>
                  {inspeccion.firmas?.tecnico?.firma ? (
                    <div className="flex items-center justify-center w-40 h-20 mb-4 border border-gray-200 rounded bg-gray-50">
                      <img
                        src={inspeccion.firmas.tecnico.firma}
                        alt="Firma técnico"
                        className="object-contain max-w-full max-h-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span style={{ display: 'none' }} className="text-xs text-gray-400">Firma no disponible</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-40 h-20 mb-4 border border-gray-200 rounded bg-gray-50">
                      <span className="text-xs text-gray-400">Sin firma</span>
                    </div>
                  )}
                  <div className="w-full pt-2 border-t border-gray-800">
                    <div className="mt-2 text-xs text-center text-gray-600">FIRMA</div>
                    {inspeccion.firmas?.tecnico?.aclaracion && (
                      <div className="mt-1 text-sm text-center">{inspeccion.firmas.tecnico.aclaracion}</div>
                    )}
                  </div>
                </div>

                {/* Firma del cliente */}
                <div className="flex flex-col items-center w-2/5">
                  <h4 className="mb-4 text-sm font-semibold text-gray-700 uppercase">Conforme Cliente</h4>
                  {inspeccion.firmas?.cliente?.firma ? (
                    <div className="flex items-center justify-center w-40 h-20 mb-4 border border-gray-200 rounded bg-gray-50">
                      <img
                        src={inspeccion.firmas.cliente.firma}
                        alt="Firma cliente"
                        className="object-contain max-w-full max-h-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span style={{ display: 'none' }} className="text-xs text-gray-400">Firma no disponible</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-40 h-20 mb-4 border border-gray-200 rounded bg-gray-50">
                      <span className="text-xs text-gray-400">Sin firma</span>
                    </div>
                  )}
                  <div className="w-full pt-2 border-t border-gray-800">
                    <div className="mt-2 text-xs text-center text-gray-600">FIRMA Y ACLARACIÓN</div>
                    {inspeccion.firmas?.cliente?.aclaracion && (
                      <div className="mt-1 text-sm text-center">{inspeccion.firmas.cliente.aclaracion}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pie de página IMSSE */}
            <div className="px-8 py-4 text-xs text-center text-gray-500 border-t border-gray-200">
              <div className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</div>
              <div>Especialistas en sistemas de protección contra incendios desde 1994</div>
              <div className="mt-1">
                <span className="font-medium">Certificaciones:</span> Notifier | Mircom | Inim | Secutron | Bosch
              </div>
              <div className="mt-2">
                📧 info@imsseingenieria.com | 🌐 www.imsseingenieria.com | 📍 Córdoba, Argentina
              </div>
            </div>
          </div>

          {/* Información de auditoría */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información de Auditoría</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Usuario creador:</span>
                <span className="text-gray-900">{inspeccion.usuarioCreador || 'No disponible'}</span>
              </div>
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-600">Fecha de creación:</span>
                <span className="text-gray-900">
                  {inspeccion.fechaCreacion && inspeccion.fechaCreacion.toDate
                    ? new Date(inspeccion.fechaCreacion.toDate()).toLocaleString('es-AR')
                    : 'No disponible'}
                </span>
              </div>
              {inspeccion.fechaModificacion && (
                <div className="md:col-span-2">
                  <span className="block mb-1 text-sm font-medium text-gray-600">Última actualización:</span>
                  <span className="text-gray-900">
                    {inspeccion.fechaModificacion.toDate
                      ? new Date(inspeccion.fechaModificacion.toDate()).toLocaleString('es-AR')
                      : 'No disponible'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de foto en pantalla completa */}
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
