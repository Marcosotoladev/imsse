// app/cliente/notificaciones/page.js - El cliente deja recordatorios para la próxima visita
'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, Clock, MessageSquareReply } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

const MENSAJE_MAX_LENGTH = 1500;

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

export default function NotificacionesCliente() {
  const [loading, setLoading] = useState(true);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          await cargarNotificaciones();
          apiService.marcarNotificacionesLeidas().catch((error) => {
            console.error('Error al marcar notificaciones como leídas:', error);
          });
        } catch (error) {
          console.error('Error al cargar notificaciones:', error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const cargarNotificaciones = async () => {
    const response = await apiService.obtenerNotificaciones();
    const lista = (response?.notificaciones || []).map((n) => ({ ...n, _esNueva: n.leidoPorCliente === false }));
    setNotificaciones(lista);
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    const texto = mensaje.trim();
    if (!texto) return;

    setEnviando(true);
    try {
      await apiService.crearNotificacion(texto);
      setMensaje('');
      await cargarNotificaciones();
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      alert('No se pudo enviar el recordatorio. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

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

  return (
    <div className="px-4 py-6 mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Notificaciones</h1>
        <p className="text-gray-600">Dejá un recordatorio y lo tendremos en cuenta en la próxima visita técnica.</p>
      </div>

      <form onSubmit={handleEnviar} className="p-4 mb-6 bg-white rounded-lg shadow">
        <label className="block mb-2 text-sm font-medium text-gray-700">Nuevo recordatorio</label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={3}
          maxLength={MENSAJE_MAX_LENGTH}
          placeholder="Ej: revisar el detector del pasillo del 2do piso, quedó pitando..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">{mensaje.length}/{MENSAJE_MAX_LENGTH}</span>
          <button
            type="submit"
            disabled={enviando || !mensaje.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
          >
            <Send size={16} /> {enviando ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>

      {notificaciones.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-white rounded-lg shadow">
          Todavía no dejaste ningún recordatorio.
        </div>
      ) : (
        <div className="space-y-3">
          {notificaciones.map((n) => {
            const atendido = n.estado === 'atendido';
            return (
              <div key={n.id} className={`p-4 border-l-4 rounded-r-lg bg-white shadow ${n._esNueva ? 'border-primary' : 'border-transparent'}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-gray-400">{formatearFecha(n.fechaCreacion)}</p>
                  <span className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border shrink-0 ${
                    atendido ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {atendido ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {atendido ? 'Atendido' : 'Pendiente'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{n.mensaje}</p>

                {n.respuesta && (
                  <div className="p-3 mt-3 text-sm border-l-4 rounded-md bg-primary/5 border-primary">
                    <p className="flex items-center gap-1 text-xs font-semibold text-primary">
                      <MessageSquareReply size={13} /> Respuesta de IMSSE
                      {n._esNueva && <span className="px-1.5 py-0.5 text-[10px] font-bold text-white uppercase rounded-full bg-primary">Nuevo</span>}
                    </p>
                    <p className="mt-1 text-gray-700 whitespace-pre-line">{n.respuesta}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
