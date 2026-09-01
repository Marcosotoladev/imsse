// app/admin/suscripcion/page.jsx - Estado de la suscripción; edición completa solo para Superadmin
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Calendar,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  XCircle,
  RefreshCw,
  History
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function SuscripcionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [suscripcion, setSuscripcion] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const [form, setForm] = useState({
    fechaVencimiento: '',
    monto: '',
    moneda: 'ARS',
    diasGracia: 0,
    activadoManualmente: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/admin');
        return;
      }
      try {
        const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);
        if (perfilUsuario.rol !== 'admin') {
          router.push('/admin');
          return;
        }
        setPerfil(perfilUsuario);
        await cargarSuscripcion();
      } catch (error) {
        console.error('Error al verificar permisos:', error);
        router.push('/admin');
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const cargarSuscripcion = async () => {
    try {
      setLoading(true);
      const data = await apiService.obtenerSuscripcion();
      setSuscripcion(data);
      setForm({
        fechaVencimiento: data.fechaVencimiento ? String(data.fechaVencimiento).slice(0, 10) : '',
        monto: data.monto ?? '',
        moneda: data.moneda || 'ARS',
        diasGracia: data.diasGracia ?? 0,
        activadoManualmente: data.activadoManualmente ?? false
      });
    } catch (error) {
      console.error('Error al cargar suscripción:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarConfig = async (e) => {
    e.preventDefault();
    setProcesando(true);
    try {
      await apiService.actualizarSuscripcion({
        fechaVencimiento: form.fechaVencimiento ? new Date(form.fechaVencimiento).toISOString() : undefined,
        monto: form.monto,
        moneda: form.moneda,
        diasGracia: form.diasGracia,
        activadoManualmente: form.activadoManualmente
      });
      alert('✅ Configuración de suscripción actualizada');
      await cargarSuscripcion();
    } catch (error) {
      console.error('Error al guardar suscripción:', error);
      alert(`❌ Error al guardar: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleGenerarCobro = async () => {
    setProcesando(true);
    try {
      const resultado = await apiService.generarCobroSuscripcion({
        monto: form.monto,
        moneda: form.moneda
      });
      window.open(resultado.initPoint, '_blank', 'noopener,noreferrer');
      await cargarSuscripcion();
    } catch (error) {
      console.error('Error al generar cobro:', error);
      alert(`❌ Error al generar el cobro: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleCancelar = async () => {
    if (!confirm('¿Cancelar la suscripción activa en MercadoPago? Esto corta el cobro recurrente.')) return;
    setProcesando(true);
    try {
      await apiService.cancelarSuscripcion();
      alert('✅ Suscripción cancelada');
      await cargarSuscripcion();
    } catch (error) {
      console.error('Error al cancelar suscripción:', error);
      alert(`❌ Error al cancelar: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  const formatearFecha = (iso) => {
    if (!iso) return 'Sin definir';
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando suscripción...</p>
        </div>
      </div>
    );
  }

  const vencida = suscripcion?.bloqueada;
  const estadoLabel = vencida ? 'Vencida' : 'Activa';
  const estadoColor = vencida ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl px-4 py-6 mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-montserrat text-primary">Suscripción</h2>
            <p className="text-gray-600">Estado del cobro recurrente de la app</p>
          </div>
        </div>

        {/* Tarjeta resumen - visible para cualquier admin */}
        <div className="p-6 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-medium text-gray-900">Estado actual</h3>
            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${estadoColor}`}>
              {estadoLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center p-4 border border-gray-200 rounded-xl bg-gray-50">
              <Calendar className="flex-shrink-0 w-5 h-5 mr-3 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Fecha de vencimiento</p>
                <p className="font-medium text-gray-900">{formatearFecha(suscripcion?.fechaVencimiento)}</p>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-xl bg-gray-50">
              <DollarSign className="flex-shrink-0 w-5 h-5 mr-3 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Monto</p>
                <p className="font-medium text-gray-900">
                  {suscripcion?.monto != null ? `${suscripcion.moneda || 'ARS'} ${suscripcion.monto}` : 'Sin definir'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={handleCancelar}
              disabled={procesando || !suscripcion?.mercadopago?.preapprovalId}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-700 transition-colors bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 disabled:opacity-50"
            >
              <XCircle size={16} className="mr-2" />
              {procesando ? 'Procesando...' : 'Cancelar suscripción'}
            </button>
            {!suscripcion?.mercadopago?.preapprovalId && (
              <p className="mt-2 text-xs text-gray-400">Todavía no hay un cobro configurado en MercadoPago.</p>
            )}
          </div>
        </div>

        {/* Panel completo - solo Superadmin */}
        {perfil?.superAdmin && (
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex items-center mb-4">
              <ShieldCheck className="w-5 h-5 mr-2 text-primary" />
              <h3 className="text-lg font-medium text-gray-900">Configuración (Superadmin)</h3>
            </div>

            <form onSubmit={handleGuardarConfig} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Fecha de vencimiento</label>
                  <input
                    type="date"
                    value={form.fechaVencimiento}
                    onChange={(e) => setForm((prev) => ({ ...prev, fechaVencimiento: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Monto</label>
                  <div className="flex gap-2">
                    <select
                      value={form.moneda}
                      onChange={(e) => setForm((prev) => ({ ...prev, moneda: e.target.value }))}
                      className="px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="ARS">ARS</option>
                      <option value="USD">USD</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.monto}
                      onChange={(e) => setForm((prev) => ({ ...prev, monto: e.target.value }))}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Días de gracia</label>
                  <input
                    type="number"
                    min="0"
                    value={form.diasGracia}
                    onChange={(e) => setForm((prev) => ({ ...prev, diasGracia: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.activadoManualmente}
                      onChange={(e) => setForm((prev) => ({ ...prev, activadoManualmente: e.target.checked }))}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Activar manualmente (ignorar vencimiento)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-red-700 disabled:opacity-50"
                >
                  {procesando ? 'Guardando...' : 'Guardar configuración'}
                </button>
              </div>
            </form>

            <div className="pt-4 mt-6 border-t border-gray-100">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Cobro en MercadoPago</h4>
              <p className="mb-1 text-xs text-gray-500">
                Estado MP: <span className="font-medium">{suscripcion?.mercadopago?.status || 'sin configurar'}</span>
              </p>
              <p className="mb-3 text-xs text-gray-500">
                Pagador: <span className="font-medium">{suscripcion?.mercadopago?.payerEmail || 'todavía no autorizó nadie'}</span>
              </p>
              <p className="mb-3 text-xs text-gray-400">
                Al generar el link, quien lo abra inicia sesión en MercadoPago con su propia cuenta y autoriza
                el cobro con su propio email — no hace falta indicarlo de antemano.
              </p>
              <button
                onClick={handleGenerarCobro}
                disabled={procesando}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-red-700 disabled:opacity-50"
              >
                <RefreshCw size={16} className="mr-2" />
                Generar / Reautorizar cobro
              </button>
              {suscripcion?.mercadopago?.initPoint && (
                <a
                  href={suscripcion.mercadopago.initPoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-3 text-sm text-primary hover:underline"
                >
                  <ExternalLink size={14} className="mr-1" />
                  Abrir link de autorización de MercadoPago
                </a>
              )}
            </div>

            {suscripcion?.pagos?.length > 0 && (
              <div className="pt-4 mt-6 border-t border-gray-100">
                <div className="flex items-center mb-3">
                  <History className="w-4 h-4 mr-2 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">Historial de pagos</h4>
                </div>
                <div className="space-y-2">
                  {suscripcion.pagos.map((pago) => (
                    <div
                      key={pago.id}
                      className="flex items-center justify-between p-3 text-sm border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <span>{formatearFecha(pago.fecha)}</span>
                      <span className="font-medium">
                        {suscripcion.moneda || 'ARS'} {pago.monto}
                      </span>
                      <span className="text-xs text-gray-500">{pago.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
