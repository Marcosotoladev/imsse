// app/admin/plan-accion/page.js - Listado del Plan de Acción (admin)
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FilePlus,
  Eye,
  Edit,
  Trash2,
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  Home,
  X
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';
import { PRIORIDAD_CLASES_SUAVE } from '../../../lib/constants/planAccion';

function DonutEjecucion({ pct, size = 110, strokeWidth = 13 }) {
  const radius = (size - strokeWidth) / 2;
  const circumferencia = 2 * Math.PI * radius;
  const offset = circumferencia - (pct / 100) * circumferencia;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#fef3c7" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#16a34a"
        strokeWidth={strokeWidth}
        strokeDasharray={circumferencia}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="800" fill="#1e293b">
        {pct}%
      </text>
    </svg>
  );
}

const FILTROS_INICIALES = { prioridad: 'Todas', estado: 'Todos', sede: 'Todas' };

export default function ListaPlanAccion() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [propuestas, setPropuestas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [itemVer, setItemVer] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/admin');
        return;
      }
      try {
        const perfil = await apiService.obtenerPerfilUsuario(currentUser.uid);
        if (perfil.rol !== 'admin') {
          router.push(perfil.rol === 'tecnico' ? '/admin/dashboard-tecnico' : '/cliente/dashboard');
          return;
        }
        await cargarPropuestas();
        setLoading(false);
      } catch (error) {
        console.error('Error al verificar acceso:', error);
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarPropuestas = async () => {
    try {
      const response = await apiService.obtenerPlanAccion();
      setPropuestas(response?.documents || []);
    } catch (error) {
      console.error('Error al cargar el plan de acción:', error);
      setPropuestas([]);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await apiService.eliminarPlanAccion(id);
      setPropuestas(prev => prev.filter(p => p.id !== id));
      setConfirmarEliminar(null);
    } catch (error) {
      console.error('Error al eliminar la propuesta:', error);
      alert('Error al eliminar la propuesta. Inténtelo de nuevo más tarde.');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    try {
      return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-AR');
    } catch {
      return fecha;
    }
  };

  const sedesDisponibles = useMemo(
    () => [...new Set(propuestas.map(p => p.cliente?.sedeNombre).filter(Boolean))],
    [propuestas]
  );

  const filtradas = useMemo(() => {
    return propuestas.filter(p => {
      const termino = busqueda.toLowerCase();
      const matchBusqueda = !termino ||
        p.cliente?.empresa?.toLowerCase().includes(termino) ||
        p.cliente?.sedeNombre?.toLowerCase().includes(termino) ||
        p.detalle?.toLowerCase().includes(termino);
      const matchPrioridad = filtros.prioridad === 'Todas' || p.prioridad === filtros.prioridad;
      const matchEstado = filtros.estado === 'Todos' || (filtros.estado === 'Si' ? p.realizado : !p.realizado);
      const matchSede = filtros.sede === 'Todas' || p.cliente?.sedeNombre === filtros.sede;
      return matchBusqueda && matchPrioridad && matchEstado && matchSede;
    });
  }, [propuestas, busqueda, filtros]);

  const totalRealizados = propuestas.filter(p => p.realizado).length;
  const pctEjecucion = propuestas.length > 0 ? Math.round((totalRealizados / propuestas.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link href="/admin/panel-control" className="flex items-center mr-4 text-primary hover:underline">
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Plan de Acción</span>
          </div>

          <Link
            href="/admin/plan-accion/nueva"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <FilePlus size={18} className="mr-2" /> Nueva Propuesta
          </Link>
        </div>

        <h2 className="mb-1 text-2xl font-bold font-montserrat text-primary">Plan de Acción</h2>
        <p className="mb-6 text-sm text-gray-500">
          Propuestas de mejora, mantenimiento y seguimiento de prioridades por cliente.
        </p>

        {propuestas.length > 0 && (
          <div className="flex flex-wrap items-center gap-8 p-6 mb-6 bg-white rounded-lg shadow-md">
            <DonutEjecucion pct={pctEjecucion} />
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-extrabold text-green-600">{totalRealizados}</p>
                <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Realizados</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-amber-500">{propuestas.length - totalRealizados}</p>
                <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Pendientes</p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Tasa de ejecución</p>
              <p className="text-3xl font-extrabold text-primary">{pctEjecucion}%</p>
              <p className="text-xs text-gray-400">{propuestas.length} propuestas en total</p>
            </div>
          </div>
        )}

        <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={18} className="absolute text-gray-400 left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cliente, sede o detalle..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="w-40">
              <label className="block mb-1 text-xs font-medium text-gray-500">Prioridad</label>
              <select
                value={filtros.prioridad}
                onChange={(e) => setFiltros(prev => ({ ...prev, prioridad: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
              >
                <option value="Todas">Todas</option>
                <option value="Leve">Leve</option>
                <option value="Moderada">Moderada</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>
            <div className="w-40">
              <label className="block mb-1 text-xs font-medium text-gray-500">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
              >
                <option value="Todos">Todos</option>
                <option value="Si">Realizados</option>
                <option value="No">Pendientes</option>
              </select>
            </div>
            <div className="w-44">
              <label className="block mb-1 text-xs font-medium text-gray-500">Sede</label>
              <select
                value={filtros.sede}
                onChange={(e) => setFiltros(prev => ({ ...prev, sede: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
              >
                <option value="Todas">Todas las sedes</option>
                {sedesDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {(busqueda || filtros.prioridad !== 'Todas' || filtros.estado !== 'Todos' || filtros.sede !== 'Todas') && (
              <button
                type="button"
                onClick={() => { setBusqueda(''); setFiltros(FILTROS_INICIALES); }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow-md">
          {filtradas.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {propuestas.length === 0 ? 'No hay propuestas cargadas todavía.' : 'No se encontraron propuestas con esos filtros.'}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Fecha', 'Cliente / Sede', 'Detalle', 'Prioridad', 'Costo', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtradas.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">{formatearFecha(item.fecha)}</td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-primary">{item.cliente?.empresa}</div>
                          {item.cliente?.sedeNombre && (
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin size={12} className="mr-1" /> {item.cliente.sedeNombre}
                            </div>
                          )}
                        </td>
                        <td className="max-w-xs px-4 py-4 text-sm text-gray-600 truncate">{item.detalle}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${PRIORIDAD_CLASES_SUAVE[item.prioridad] || ''}`}>
                            {item.prioridad}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-green-700">
                          {item.costo ? `$${Number(item.costo).toLocaleString('es-AR')}` : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-4">
                          {item.realizado ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 size={14} /> Realizado</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Clock size={14} /> Pendiente</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            <button onClick={() => setItemVer(item)} title="Ver detalle" className="inline-flex items-center justify-center w-9 h-9 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 hover:text-green-600">
                              <Eye size={16} />
                            </button>
                            <Link href={`/admin/plan-accion/editar/${item.id}`} title="Editar" className="inline-flex items-center justify-center w-9 h-9 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 hover:text-secondary">
                              <Edit size={16} />
                            </Link>
                            <button onClick={() => setConfirmarEliminar(item)} title="Eliminar" className="inline-flex items-center justify-center w-9 h-9 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 hover:text-red-600">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 p-3 md:hidden">
                {filtradas.map(item => (
                  <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-xs text-gray-400">{formatearFecha(item.fecha)}</p>
                        <p className="text-sm font-bold text-primary">{item.cliente?.empresa}</p>
                        {item.cliente?.sedeNombre && (
                          <p className="flex items-center text-xs text-gray-500"><MapPin size={12} className="mr-1" /> {item.cliente.sedeNombre}</p>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border shrink-0 ${PRIORIDAD_CLASES_SUAVE[item.prioridad] || ''}`}>
                        {item.prioridad}
                      </span>
                    </div>
                    <p className="my-2 text-sm text-gray-600">{item.detalle}</p>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                      <span className="text-sm font-semibold text-green-700">
                        {item.costo ? `$${Number(item.costo).toLocaleString('es-AR')}` : '—'}
                      </span>
                      {item.realizado ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 size={14} /> Realizado</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Clock size={14} /> Pendiente</span>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-100">
                      <button onClick={() => setItemVer(item)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-700 bg-green-50 rounded-md">
                        <Eye size={14} /> Ver
                      </button>
                      <Link href={`/admin/plan-accion/editar/${item.id}`} className="flex items-center gap-1 px-3 py-1.5 text-xs text-secondary bg-gray-100 rounded-md">
                        <Edit size={14} /> Editar
                      </Link>
                      <button onClick={() => setConfirmarEliminar(item)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-md">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Ver Detalle */}
      {itemVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary">Detalle de Propuesta</h3>
              <button onClick={() => setItemVer(null)} className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Cliente</p>
                <p className="font-semibold text-primary">{itemVer.cliente?.empresa}</p>
              </div>
              {itemVer.cliente?.sedeNombre && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Sede</p>
                  <p className="flex items-center gap-1"><MapPin size={14} /> {itemVer.cliente.sedeNombre}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Fecha propuesta</p>
                <p>{formatearFecha(itemVer.fecha)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Detalle</p>
                <p className="p-3 mt-1 text-gray-700 whitespace-pre-line rounded-md bg-gray-50">{itemVer.detalle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Costo Estimado</p>
                  <p className="text-lg font-bold text-green-700">{itemVer.costo ? `$${Number(itemVer.costo).toLocaleString('es-AR')}` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Estado</p>
                  {itemVer.realizado ? (
                    <p className="flex items-center gap-1 font-semibold text-green-600">
                      <CheckCircle2 size={16} /> Realizado {itemVer.fechaRealizacion && `(${formatearFecha(itemVer.fechaRealizacion)})`}
                    </p>
                  ) : (
                    <p className="flex items-center gap-1 font-semibold text-amber-600"><Clock size={16} /> Pendiente</p>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setItemVer(null)} className="w-full py-2.5 mt-6 text-white transition-colors rounded-md bg-primary hover:bg-red-700">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Confirmar eliminar */}
      {confirmarEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm p-6 text-center bg-white rounded-lg shadow-xl">
            <h3 className="mb-2 font-bold text-gray-900">¿Eliminar propuesta?</h3>
            <p className="mb-5 text-sm text-gray-500">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarEliminar(null)} className="flex-1 py-2.5 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => handleEliminar(confirmarEliminar.id)} className="flex-1 py-2.5 text-white rounded-md bg-danger hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
