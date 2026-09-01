// app/cliente/plan-accion/page.js - Plan de Acción para clientes (solo lectura)
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  Eye,
  X
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';
import { PRIORIDAD_CLASES_SUAVE } from '../../../lib/constants/planAccion';

const FILTROS_INICIALES = { prioridad: 'Todas', estado: 'Todos' };

export default function PlanAccionCliente() {
  const [loading, setLoading] = useState(true);
  const [propuestas, setPropuestas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [itemVer, setItemVer] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await cargarPropuestas();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const cargarPropuestas = async () => {
    try {
      const response = await apiService.obtenerPlanAccion();
      setPropuestas(response?.documents || []);
    } catch (error) {
      console.error('Error al cargar el plan de acción:', error);
      setPropuestas([]);
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

  const filtradas = useMemo(() => {
    return propuestas.filter(p => {
      const termino = busqueda.toLowerCase();
      const matchBusqueda = !termino ||
        p.cliente?.sedeNombre?.toLowerCase().includes(termino) ||
        p.detalle?.toLowerCase().includes(termino);
      const matchPrioridad = filtros.prioridad === 'Todas' || p.prioridad === filtros.prioridad;
      const matchEstado = filtros.estado === 'Todos' || (filtros.estado === 'Si' ? p.realizado : !p.realizado);
      return matchBusqueda && matchPrioridad && matchEstado;
    });
  }, [propuestas, busqueda, filtros]);

  const totalRealizados = propuestas.filter(p => p.realizado).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Plan de Acción</h1>
        <p className="text-gray-600">Propuestas de mejora asignadas a tus instalaciones.</p>
      </div>

      {propuestas.length > 0 && (
        <div className="flex gap-8 p-4 mb-6 bg-white rounded-lg shadow">
          <div>
            <p className="text-2xl font-extrabold text-green-600">{totalRealizados}</p>
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Realizadas</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-amber-500">{propuestas.length - totalRealizados}</p>
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Pendientes</p>
          </div>
        </div>
      )}

      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Sede o detalle..."
              className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filtros.prioridad}
            onChange={(e) => setFiltros(prev => ({ ...prev, prioridad: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="Todas">Todas las prioridades</option>
            <option value="Leve">Leve</option>
            <option value="Moderada">Moderada</option>
            <option value="Crítica">Crítica</option>
          </select>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Si">Realizadas</option>
            <option value="No">Pendientes</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {filtradas.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            {propuestas.length === 0 ? 'Todavía no tenés propuestas cargadas.' : 'No se encontraron propuestas con esos filtros.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtradas.map(item => (
              <div key={item.id} className="flex items-start justify-between gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{formatearFecha(item.fecha)}</p>
                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${PRIORIDAD_CLASES_SUAVE[item.prioridad] || ''}`}>
                      {item.prioridad}
                    </span>
                  </div>
                  {item.cliente?.sedeNombre && (
                    <p className="flex items-center gap-1 mt-1 text-sm font-medium text-primary">
                      <MapPin size={14} /> {item.cliente.sedeNombre}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-600 truncate">{item.detalle}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {item.realizado ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 size={14} /> Realizado</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Clock size={14} /> Pendiente</span>
                  )}
                  <button onClick={() => setItemVer(item)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-primary bg-primary/10 rounded-md hover:bg-primary/20">
                    <Eye size={14} /> Ver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}
