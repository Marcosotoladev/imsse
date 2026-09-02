// app/admin/notificaciones/page.js - Recordatorios que los clientes dejan para la próxima visita
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  MessageSquareReply,
  Building2,
  User
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

function formatearFecha(fecha) {
  if (!fecha) return '';
  try {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

function TarjetaNotificacion({ notificacion, puedeGestionar, puedeEliminar, onResponder, onToggleEstado, onEliminar }) {
  const [respuesta, setRespuesta] = useState(notificacion.respuesta || '');
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const atendido = notificacion.estado === 'atendido';

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await onResponder(notificacion.id, respuesta);
      setEditando(false);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={`p-4 border-l-4 rounded-r-lg bg-white shadow ${notificacion._esNueva ? 'border-primary' : 'border-transparent'}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Building2 size={14} className="text-primary shrink-0" />
            <span className="truncate">{notificacion.empresaNombre || 'Sin empresa'}</span>
            {notificacion._esNueva && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold text-white uppercase rounded-full bg-primary">Nuevo</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
            <User size={12} /> {notificacion.clienteNombre} · {formatearFecha(notificacion.fechaCreacion)}
          </div>
        </div>
        <span className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border shrink-0 ${
          atendido ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'
        }`}>
          {atendido ? <CheckCircle2 size={13} /> : <Clock size={13} />}
          {atendido ? 'Atendido' : 'Pendiente'}
        </span>
      </div>

      <p className="p-3 mt-3 text-sm text-gray-700 whitespace-pre-line rounded-md bg-gray-50">{notificacion.mensaje}</p>

      {notificacion.respuesta && !editando && (
        <div className="p-3 mt-2 text-sm border-l-4 rounded-md bg-primary/5 border-primary">
          <p className="text-xs font-semibold text-primary">Respuesta de {notificacion.respondidoPorNombre || 'IMSSE'}</p>
          <p className="mt-1 text-gray-700 whitespace-pre-line">{notificacion.respuesta}</p>
        </div>
      )}

      {puedeGestionar && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {editando ? (
            <div className="w-full space-y-2">
              <textarea
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={2}
                maxLength={1500}
                placeholder="Escribí una respuesta para el cliente..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
                >
                  <Send size={13} /> {guardando ? 'Guardando...' : 'Guardar respuesta'}
                </button>
                <button
                  onClick={() => { setEditando(false); setRespuesta(notificacion.respuesta || ''); }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditando(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20"
            >
              <MessageSquareReply size={13} /> {notificacion.respuesta ? 'Editar respuesta' : 'Responder'}
            </button>
          )}
          <button
            onClick={() => onToggleEstado(notificacion.id, notificacion.estado)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md ${
              atendido ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-green-700 bg-green-50 hover:bg-green-100'
            }`}
          >
            <CheckCircle2 size={13} /> {atendido ? 'Marcar pendiente' : 'Marcar atendido'}
          </button>
          {puedeEliminar && (
            <button
              onClick={() => onEliminar(notificacion.id)}
              className="flex items-center gap-1 px-3 py-1.5 ml-auto text-xs font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              <Trash2 size={13} /> Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function NotificacionesAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/admin');
        return;
      }
      try {
        const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);
        setPerfil(perfilUsuario);
        await cargarNotificaciones();
        // Se marcan como leídas después de tomar la lista, para poder mostrar "Nuevo"
        // en los que llegaron sin leer hasta que se recargue la página.
        apiService.marcarNotificacionesLeidas().catch((error) => {
          console.error('Error al marcar notificaciones como leídas:', error);
        });
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarNotificaciones = async () => {
    const response = await apiService.obtenerNotificaciones();
    const lista = (response?.notificaciones || []).map((n) => ({ ...n, _esNueva: n.leidoPorAdmin === false }));
    setNotificaciones(lista);
  };

  const handleResponder = async (id, respuesta) => {
    try {
      await apiService.actualizarNotificacion(id, { respuesta });
      await cargarNotificaciones();
    } catch (error) {
      console.error('Error al responder notificación:', error);
      alert('Error al guardar la respuesta.');
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 'atendido' ? 'pendiente' : 'atendido';
      await apiService.actualizarNotificacion(id, { estado: nuevoEstado });
      await cargarNotificaciones();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado.');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta notificación? Esta acción no se puede deshacer.')) return;
    try {
      await apiService.eliminarNotificacion(id);
      await cargarNotificaciones();
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      alert('Error al eliminar la notificación.');
    }
  };

  const filtradas = useMemo(() => {
    return notificaciones.filter((n) => {
      const termino = busqueda.toLowerCase();
      const matchBusqueda = !termino ||
        n.empresaNombre?.toLowerCase().includes(termino) ||
        n.clienteNombre?.toLowerCase().includes(termino) ||
        n.mensaje?.toLowerCase().includes(termino);
      const matchEstado = filtroEstado === 'todos' || n.estado === filtroEstado;
      return matchBusqueda && matchEstado;
    });
  }, [notificaciones, busqueda, filtroEstado]);

  const totalPendientes = notificaciones.filter((n) => n.estado !== 'atendido').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  const puedeGestionar = perfil?.rol === 'admin' || perfil?.rol === 'tecnico';
  const puedeEliminar = perfil?.rol === 'admin';

  return (
    <div className="px-4 py-6 mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Notificaciones</h1>
        <p className="text-gray-600">Recordatorios que los clientes dejaron para tener en cuenta en la próxima visita.</p>
      </div>

      {notificaciones.length > 0 && (
        <div className="flex gap-8 p-4 mb-6 bg-white rounded-lg shadow">
          <div>
            <p className="text-2xl font-extrabold text-amber-500">{totalPendientes}</p>
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Pendientes</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-green-600">{notificaciones.length - totalPendientes}</p>
            <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Atendidas</p>
          </div>
        </div>
      )}

      <div className="p-4 mb-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Empresa, cliente o mensaje..."
              className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="atendido">Atendidas</option>
          </select>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-white rounded-lg shadow">
          {notificaciones.length === 0 ? 'Todavía no hay notificaciones de clientes.' : 'No se encontraron notificaciones con esos filtros.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map((n) => (
            <TarjetaNotificacion
              key={n.id}
              notificacion={n}
              puedeGestionar={puedeGestionar}
              puedeEliminar={puedeEliminar}
              onResponder={handleResponder}
              onToggleEstado={handleToggleEstado}
              onEliminar={handleEliminar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
