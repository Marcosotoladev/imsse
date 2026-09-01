// app/admin/plan-accion/editar/[id]/page.js - Editar propuesta del Plan de Acción (admin)
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  ArrowLeft,
  User,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Home
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../../lib/firebase';
import apiService from '../../../../../lib/services/apiService';
import { PRIORIDADES, PRIORIDAD_CLASES } from '../../../../../lib/constants/planAccion';

export default function EditarPropuestaPlanAccion({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const loading = loadingAuth || loadingData;

  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
  const [tipoCliente, setTipoCliente] = useState('existente');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [empresaDelCliente, setEmpresaDelCliente] = useState(null);

  const [propuesta, setPropuesta] = useState({
    clienteId: '',
    cliente: { empresa: '', nombre: '', sedeNombre: '', direccion: '' },
    fecha: '',
    detalle: '',
    prioridad: 'Leve',
    costo: '',
    realizado: false,
    fechaRealizacion: ''
  });

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
        setLoadingAuth(false);
      } catch (error) {
        console.error('Error al verificar acceso:', error);
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!id || loadingAuth) return;

    (async () => {
      try {
        const [usuariosData, empresasData, propuestaData] = await Promise.all([
          apiService.obtenerUsuarios(),
          apiService.obtenerEmpresas().catch(() => ({ empresas: [] })),
          apiService.obtenerPlanAccionPorId(id)
        ]);

        const clientes = usuariosData.users.filter(u => u.rol === 'cliente' && u.estado === 'activo');
        setClientesDisponibles(clientes);
        setEmpresasDisponibles(empresasData.empresas || []);

        if (!propuestaData) {
          alert('Propuesta no encontrada.');
          router.push('/admin/plan-accion');
          return;
        }

        setPropuesta({
          clienteId: propuestaData.clienteId || '',
          cliente: {
            empresa: propuestaData.cliente?.empresa || '',
            nombre: propuestaData.cliente?.nombre || '',
            sedeNombre: propuestaData.cliente?.sedeNombre || '',
            direccion: propuestaData.cliente?.direccion || ''
          },
          fecha: propuestaData.fecha || '',
          detalle: propuestaData.detalle || '',
          prioridad: propuestaData.prioridad || 'Leve',
          costo: propuestaData.costo ? String(propuestaData.costo) : '',
          realizado: propuestaData.realizado || false,
          fechaRealizacion: propuestaData.fechaRealizacion || ''
        });

        setTipoCliente(propuestaData.tipoCliente || (propuestaData.clienteId ? 'existente' : 'manual'));

        if (propuestaData.clienteId) {
          const clienteEncontrado = clientes.find(c => c.id === propuestaData.clienteId);
          if (clienteEncontrado) {
            setClienteSeleccionado(clienteEncontrado);
            const empresa = (empresasData.empresas || []).find(e => e.id === clienteEncontrado.empresaId) || null;
            setEmpresaDelCliente(empresa);
          }
        }

        setLoadingData(false);
      } catch (error) {
        console.error('Error al cargar la propuesta:', error);
        alert('Error al cargar los datos de la propuesta.');
        router.push('/admin/plan-accion');
      }
    })();
  }, [id, loadingAuth, router]);

  const handleSeleccionarCliente = (clienteId) => {
    if (!clienteId) {
      setClienteSeleccionado(null);
      setEmpresaDelCliente(null);
      setPropuesta(prev => ({
        ...prev,
        clienteId: '',
        cliente: { empresa: '', nombre: '', sedeNombre: '', direccion: '' }
      }));
      return;
    }

    const clienteEncontrado = clientesDisponibles.find(c => c.id === clienteId);
    if (clienteEncontrado) {
      const empresa = empresasDisponibles.find(e => e.id === clienteEncontrado.empresaId) || null;

      setClienteSeleccionado(clienteEncontrado);
      setEmpresaDelCliente(empresa);
      setPropuesta(prev => ({
        ...prev,
        clienteId,
        cliente: {
          empresa: clienteEncontrado.empresa || '',
          nombre: clienteEncontrado.nombreCompleto || '',
          direccion: empresa?.direccionPrincipal || '',
          sedeNombre: ''
        }
      }));
    }
  };

  const handleSeleccionarSede = (sedeId) => {
    if (!sedeId) {
      setPropuesta(prev => ({
        ...prev,
        cliente: { ...prev.cliente, direccion: empresaDelCliente?.direccionPrincipal || '', sedeNombre: '' }
      }));
      return;
    }
    const sede = empresaDelCliente?.sedes?.find(s => s.id === sedeId);
    if (sede) {
      setPropuesta(prev => ({
        ...prev,
        cliente: { ...prev.cliente, direccion: sede.direccion || '', sedeNombre: sede.nombreObra || '' }
      }));
    }
  };

  const handleCambiarTipoCliente = (tipo) => {
    setTipoCliente(tipo);
    if (tipo === 'manual') {
      setClienteSeleccionado(null);
      setEmpresaDelCliente(null);
      setPropuesta(prev => ({
        ...prev,
        clienteId: '',
        cliente: { empresa: '', nombre: '', sedeNombre: '', direccion: '' }
      }));
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    if (tipoCliente === 'existente' && !propuesta.clienteId) {
      alert('Por favor, selecciona un cliente del sistema.');
      return;
    }
    if (!propuesta.cliente.empresa) {
      alert('Por favor completa la empresa/cliente.');
      return;
    }
    if (!propuesta.detalle.trim()) {
      alert('Por favor describe la propuesta de mejora.');
      return;
    }

    setGuardando(true);
    try {
      const datos = {
        clienteId: propuesta.clienteId || null,
        tipoCliente,
        cliente: propuesta.cliente,
        fecha: propuesta.fecha,
        detalle: propuesta.detalle.trim(),
        prioridad: propuesta.prioridad,
        costo: propuesta.costo ? Number(propuesta.costo) : 0,
        realizado: propuesta.realizado,
        fechaRealizacion: propuesta.realizado ? (propuesta.fechaRealizacion || new Date().toISOString().split('T')[0]) : ''
      };

      await apiService.actualizarPlanAccion(id, datos);
      router.push('/admin/plan-accion');
    } catch (error) {
      console.error('Error al actualizar la propuesta:', error);
      alert('❌ Error al actualizar la propuesta. Inténtelo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center text-sm">
              <Link href="/admin/panel-control" className="text-primary hover:underline">
                <Home size={14} className="inline mr-1" />
                Panel
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <Link href="/admin/plan-accion" className="text-primary hover:underline">
                Plan de Acción
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="font-medium text-gray-700">Editar</span>
            </div>

            <div className="flex space-x-2">
              <Link
                href="/admin/plan-accion"
                className="flex items-center px-3 py-2 text-sm text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300 md:px-4"
              >
                <ArrowLeft size={16} className="mr-1 md:mr-2" />
                Cancelar
              </Link>
              <button
                type="submit"
                form="plan-accion-form"
                disabled={guardando}
                className="flex items-center px-3 py-2 text-sm text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50 md:px-4"
              >
                <Save size={16} className="mr-1 md:mr-2" />
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl px-4 py-6 mx-auto">
        <h2 className="mb-6 text-xl font-bold md:text-2xl font-montserrat text-primary">
          Editar Propuesta de Mejora
        </h2>

        <form id="plan-accion-form" onSubmit={handleGuardar} className="space-y-6">

          <div className="p-4 text-gray-700 bg-white border-l-4 border-green-500 rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <User className="mr-2" size={20} />
              Cliente
            </h3>

            <div className="mb-6">
              <div className="flex mb-4 space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tipoCliente"
                    checked={tipoCliente === 'existente'}
                    onChange={() => handleCambiarTipoCliente('existente')}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Cliente del sistema</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tipoCliente"
                    checked={tipoCliente === 'manual'}
                    onChange={() => handleCambiarTipoCliente('manual')}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Consorcio/edificio (manual)</span>
                </label>
              </div>

              {tipoCliente === 'existente' ? (
                <div className="p-4 rounded-lg bg-green-50">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Seleccionar cliente registrado *
                  </label>
                  <select
                    value={propuesta.clienteId}
                    onChange={(e) => handleSeleccionarCliente(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientesDisponibles.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.empresa} - {cliente.nombreCompleto}
                      </option>
                    ))}
                  </select>

                  {empresaDelCliente?.sedes?.length > 0 && (
                    <div className="mt-3">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Sede</label>
                      <select
                        onChange={(e) => handleSeleccionarSede(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Dirección Principal</option>
                        {empresaDelCliente.sedes.map(sede => (
                          <option key={sede.id} value={sede.id}>{sede.nombreObra}</option>
                        ))}
                      </select>
                      {propuesta.cliente.sedeNombre && (
                        <p className="mt-1 text-xs text-gray-500">Sede actual: {propuesta.cliente.sedeNombre}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-gray-50">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Empresa/Consorcio *</label>
                  <input
                    type="text"
                    value={propuesta.cliente.empresa}
                    onChange={(e) => setPropuesta(prev => ({ ...prev, cliente: { ...prev.cliente, empresa: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ej: Torre Alem"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <Building2 size={20} className="mr-2 text-primary" />
              Datos del Sitio
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Sede / Consorcio</label>
                <input
                  type="text"
                  value={propuesta.cliente.sedeNombre}
                  onChange={(e) => setPropuesta(prev => ({ ...prev, cliente: { ...prev.cliente, sedeNombre: e.target.value } }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nombre de la sede u obra"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Dirección</label>
                <div className="relative">
                  <MapPin className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    value={propuesta.cliente.direccion}
                    onChange={(e) => setPropuesta(prev => ({ ...prev, cliente: { ...prev.cliente, direccion: e.target.value } }))}
                    className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Dirección del sitio"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <FileText size={20} className="mr-2 text-primary" />
              Propuesta
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Fecha Propuesta</label>
                <div className="relative">
                  <Calendar className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="date"
                    value={propuesta.fecha}
                    onChange={(e) => setPropuesta(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Detalle de la Mejora / Observación *</label>
                <textarea
                  value={propuesta.detalle}
                  onChange={(e) => setPropuesta(prev => ({ ...prev, detalle: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describí lo que hay que hacer..."
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Prioridad</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRIORIDADES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPropuesta(prev => ({ ...prev, prioridad: p }))}
                        className={`py-2.5 rounded-md text-sm font-semibold border transition-colors ${
                          propuesta.prioridad === p
                            ? PRIORIDAD_CLASES[p] + ' border-transparent'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Costo Estimado ($)</label>
                  <input
                    type="number"
                    value={propuesta.costo}
                    onChange={(e) => setPropuesta(prev => ({ ...prev, costo: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={propuesta.realizado}
                onChange={(e) => setPropuesta(prev => ({ ...prev, realizado: e.target.checked }))}
                className="w-5 h-5"
              />
              <span className="text-sm font-semibold text-gray-700">Marcar como REALIZADO</span>
            </label>
            {propuesta.realizado && (
              <div className="mt-3">
                <label className="block mb-2 text-sm font-medium text-gray-700">Fecha de Realización</label>
                <input
                  type="date"
                  value={propuesta.fechaRealizacion}
                  onChange={(e) => setPropuesta(prev => ({ ...prev, fechaRealizacion: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="sticky bottom-16 md:bottom-0 p-4 bg-white border-t border-gray-200 shadow-lg md:static md:shadow-none md:border-0 md:bg-transparent">
            <div className="flex space-x-3">
              <Link
                href="/admin/plan-accion"
                className="flex-1 px-4 py-3 text-center text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100 md:flex-none md:px-6"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={guardando}
                className="flex items-center justify-center flex-1 px-4 py-3 text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50 md:flex-none md:px-6"
              >
                <Save size={18} className="mr-2" />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
