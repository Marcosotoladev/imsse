// app/admin/calendario-visitas/page.jsx - Calendario de Visitas IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

// Nombres de los meses en español
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Días de la semana en español
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Botón de acción de fila/tarjeta: grande y bien separado para uso cómodo en mobile
function AccionBoton({ href, onClick, title, colorClasses, children }) {
  const className = `inline-flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${colorClasses}`;

  if (href) {
    return (
      <Link href={href} title={title} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} title={title} className={className}>
      {children}
    </button>
  );
}

function AccionesVisita({ visita, onVer, onEliminar }) {
  return (
    <div className="flex items-center gap-2">
      <AccionBoton onClick={() => onVer(visita)} title="Ver detalles" colorClasses="text-blue-600 bg-blue-50 hover:bg-blue-100">
        <Eye size={18} />
      </AccionBoton>
      <AccionBoton href={`/admin/calendario-visitas/editar/${visita.id}`} title="Editar visita" colorClasses="text-orange-600 bg-orange-50 hover:bg-orange-100">
        <Edit size={18} />
      </AccionBoton>
      <AccionBoton onClick={() => onEliminar(visita.id, visita.empresa)} title="Eliminar visita" colorClasses="text-red-600 bg-red-50 hover:bg-red-100">
        <Trash2 size={18} />
      </AccionBoton>
    </div>
  );
}

export default function CalendarioVisitas() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitas, setVisitas] = useState([]);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vistaMovil, setVistaMovil] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [visitaSeleccionada, setVisitaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarVisitas();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    // Detectar vista móvil
    const detectarMovil = () => {
      setVistaMovil(window.innerWidth < 768);
    };

    detectarMovil();
    window.addEventListener('resize', detectarMovil);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', detectarMovil);
    };
  }, [router]);

  const cargarVisitas = async () => {
    try {
      const año = fechaActual.getFullYear();
      const mes = fechaActual.getMonth() + 1;

      const response = await apiService.obtenerVisitasPorMes(año, mes);

      const visitasData = response.documents || response || [];

      setVisitas(visitasData);
    } catch (error) {
      console.error('Error al cargar visitas:', error);
      alert('Error al cargar las visitas. Inténtelo de nuevo más tarde.');
    }
  };

  useEffect(() => {
    if (user) {
      cargarVisitas();
    }
  }, [fechaActual, user]);

  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaActual(nuevaFecha);
  };

  const obtenerDiasDelMes = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias = [];

    // Días vacíos al principio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }

    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      dias.push(dia);
    }

    return dias;
  };

  const obtenerVisitasDelDia = (dia) => {
    if (!dia) return [];

    const fechaBuscar = `${fechaActual.getFullYear()}-${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;

    return visitas.filter(visita => visita.fecha === fechaBuscar)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  };

  const manejarClickDia = (dia) => {
    if (!dia) return;

    if (vistaMovil) {
      setDiaSeleccionado(dia);
      setMostrarModal(true);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setDiaSeleccionado(null);
    setVisitaSeleccionada(null);
  };

  const formatearHora = (hora) => {
    return hora.substring(0, 5); // HH:MM
  };

  const eliminarVisita = async (id, empresa) => {
    if (confirm(`¿Está seguro de que desea eliminar la visita a "${empresa}"?`)) {
      try {
        await apiService.eliminarVisita(id);
        alert('Visita eliminada exitosamente.');
        await cargarVisitas();
        cerrarModal();
      } catch (error) {
        console.error('Error al eliminar visita:', error);
        alert('Error al eliminar la visita.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando calendario IMSSE...</p>
        </div>
      </div>
    );
  }

  const diasDelMes = obtenerDiasDelMes();
  const visitasDelDiaSeleccionado = diaSeleccionado ? obtenerVisitasDelDia(diaSeleccionado) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 mx-auto max-w-7xl">
        {/* Título + acciones */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Calendario de Visitas</h2>
            <p className="text-sm text-gray-500">
              {visitas.length} {visitas.length === 1 ? 'visita' : 'visitas'} en {MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
            </p>
          </div>
          <Link
            href="/admin/calendario-visitas/nueva"
            className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-primary rounded-xl hover:bg-red-700"
          >
            <Plus size={18} className="mr-2" />
            Nueva Visita
          </Link>
        </div>

        {/* Navegación de mes + búsqueda */}
        <div className="p-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => cambiarMes(-1)}
                className="p-2 text-gray-600 transition-colors rounded-xl hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>

              <h3 className="text-lg font-semibold text-gray-800 min-w-[180px] text-center">
                {MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </h3>

              <button
                onClick={() => cambiarMes(1)}
                className="p-2 text-gray-600 transition-colors rounded-xl hover:bg-gray-100"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="relative sm:w-64">
              <Search size={18} className="absolute -translate-y-1/2 left-3 top-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empresa..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Calendario */}
        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
          {/* Encabezado de días de la semana */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="p-3 text-sm font-medium text-center text-gray-600 bg-gray-50">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7">
            {diasDelMes.map((dia, index) => {
              const visitasDelDia = obtenerVisitasDelDia(dia);
              const visitasFiltradasDelDia = dia ? visitasDelDia.filter(visita =>
                visita.empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
                visita.detalle?.toLowerCase().includes(busqueda.toLowerCase())
              ) : [];

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-b border-r border-gray-200 ${
                    dia ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-100'
                  } ${vistaMovil && dia ? 'min-h-[80px]' : ''}`}
                  onClick={() => manejarClickDia(dia)}
                >
                  {dia && (
                    <>
                      <div className="mb-1 text-sm font-medium text-gray-900">
                        {dia}
                      </div>

                      {/* Visitas del día */}
                      <div className="space-y-1">
                        {visitasFiltradasDelDia.slice(0, vistaMovil ? 1 : 3).map((visita) => (
                          <div
                            key={visita.id}
                            className="p-1 text-xs bg-blue-100 border border-blue-200 rounded cursor-pointer hover:bg-blue-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!vistaMovil) {
                                setVisitaSeleccionada(visita);
                                setMostrarModal(true);
                              }
                            }}
                          >
                            <div className="font-medium text-blue-800 truncate">
                              {formatearHora(visita.hora)} - {visita.empresa}
                            </div>
                          </div>
                        ))}

                        {visitasFiltradasDelDia.length > (vistaMovil ? 1 : 3) && (
                          <div className="text-xs text-center text-gray-500">
                            +{visitasFiltradasDelDia.length - (vistaMovil ? 1 : 3)} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal para vista móvil y detalles */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {visitaSeleccionada ? 'Detalles de la Visita' : `Visitas del ${diaSeleccionado}`}
                </h3>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {visitaSeleccionada ? (
                /* Detalles de visita específica */
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Empresa</label>
                      <p className="text-gray-900">{visitaSeleccionada.empresa}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Fecha y Hora</label>
                      <p className="text-gray-900">
                        {new Date(visitaSeleccionada.fecha).toLocaleDateString('es-AR')} a las {formatearHora(visitaSeleccionada.hora)}
                      </p>
                    </div>

                    {visitaSeleccionada.detalle && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Detalle</label>
                        <p className="text-gray-900">{visitaSeleccionada.detalle}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Creado por</label>
                      <p className="text-gray-900">{visitaSeleccionada.usuarioCreador}</p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 space-x-2">
                    <button
                      onClick={cerrarModal}
                      className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-xl hover:bg-gray-100"
                    >
                      Cerrar
                    </button>
                    <Link
                      href={`/admin/calendario-visitas/editar/${visitaSeleccionada.id}`}
                      className="flex items-center px-4 py-2 text-white transition-colors bg-orange-600 rounded-xl hover:bg-orange-700"
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
                    </Link>
                    <button
                      onClick={() => eliminarVisita(visitaSeleccionada.id, visitaSeleccionada.empresa)}
                      className="flex items-center px-4 py-2 text-white transition-colors bg-red-600 rounded-xl hover:bg-red-700"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                /* Lista de visitas del día */
                <div>
                  {visitasDelDiaSeleccionado.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No hay visitas programadas para este día</p>
                      <Link
                        href="/admin/calendario-visitas/nueva"
                        className="inline-flex items-center px-4 py-2 mt-4 text-white rounded-xl bg-primary hover:bg-red-700"
                      >
                        <Plus size={16} className="mr-2" />
                        Programar Visita
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visitasDelDiaSeleccionado.map((visita) => (
                        <div
                          key={visita.id}
                          className="p-3 border border-gray-100 shadow-sm rounded-2xl"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{visita.empresa}</h4>
                              <p className="text-sm text-gray-600">
                                <Clock size={14} className="inline mr-1" />
                                {formatearHora(visita.hora)}
                              </p>
                              {visita.detalle && (
                                <p className="mt-1 text-sm text-gray-500">{visita.detalle}</p>
                              )}
                            </div>
                            <AccionesVisita
                              visita={visita}
                              onVer={(v) => setVisitaSeleccionada(v)}
                              onEliminar={eliminarVisita}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={cerrarModal}
                      className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-xl hover:bg-gray-100"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
