// app/admin/empresas/page.jsx - Gestión de Empresas (clientes) y sus Sedes IMSSE
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  X
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

function generarIdSede() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `sede_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const FORM_VACIO = {
  razonSocial: '',
  cuit: '',
  direccionPrincipal: '',
  telefono: '',
  emailPrincipal: '',
  sedes: []
};

export default function GestionEmpresas() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfil = await apiService.obtenerPerfilUsuario(currentUser.uid);
          if (perfil.rol !== 'admin') {
            router.push('/admin');
            return;
          }
          await cargarDatos();
        } catch (error) {
          console.error('Error al verificar permisos:', error);
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('crear') === 'true') {
        handleAbrirCrear();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await apiService.obtenerEmpresas();
      setEmpresas(data.empresas || []);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const empresasFiltradas = empresas.filter((empresa) => {
    if (!busqueda.trim()) return true;
    const texto = busqueda.toLowerCase();
    return (
      empresa.razonSocial?.toLowerCase().includes(texto) ||
      empresa.cuit?.toLowerCase().includes(texto) ||
      empresa.emailPrincipal?.toLowerCase().includes(texto)
    );
  });

  const handleAgregarSede = () => {
    setFormData((prev) => ({
      ...prev,
      sedes: [...prev.sedes, { id: generarIdSede(), nombreObra: '', direccion: '' }]
    }));
  };

  const handleEliminarSede = (id) => {
    setFormData((prev) => ({
      ...prev,
      sedes: prev.sedes.filter((sede) => sede.id !== id)
    }));
  };

  const handleCambiarSede = (id, campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      sedes: prev.sedes.map((sede) => (sede.id === id ? { ...sede, [campo]: valor } : sede))
    }));
  };

  const handleAbrirCrear = () => {
    setFormData(FORM_VACIO);
    setModalCrearAbierto(true);
  };

  const handleAbrirEditar = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setFormData({
      razonSocial: empresa.razonSocial || '',
      cuit: empresa.cuit || '',
      direccionPrincipal: empresa.direccionPrincipal || '',
      telefono: empresa.telefono || '',
      emailPrincipal: empresa.emailPrincipal || '',
      sedes: (empresa.sedes || []).map((sede) => ({ id: sede.id || generarIdSede(), ...sede }))
    });
    setModalEditarAbierto(true);
  };

  const handleCrearEmpresa = async (e) => {
    e.preventDefault();
    if (!formData.razonSocial.trim()) {
      alert('La razón social / nombre de la empresa es obligatorio');
      return;
    }

    setProcesando(true);
    try {
      await apiService.crearEmpresa(formData);
      alert('✅ Empresa creada exitosamente');
      setModalCrearAbierto(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error al crear empresa:', error);
      alert(`❌ Error al crear empresa: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleEditarEmpresa = async (e) => {
    e.preventDefault();
    if (!empresaSeleccionada) return;
    if (!formData.razonSocial.trim()) {
      alert('La razón social / nombre de la empresa es obligatorio');
      return;
    }

    setProcesando(true);
    try {
      await apiService.actualizarEmpresa(empresaSeleccionada.id, formData);
      alert('✅ Empresa actualizada exitosamente');
      setModalEditarAbierto(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      alert(`❌ Error al actualizar empresa: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminarEmpresa = async (empresa) => {
    if (!confirm(`¿Eliminar la empresa "${empresa.razonSocial}"? Esta acción no se puede deshacer.`)) return;

    setProcesando(true);
    try {
      await apiService.eliminarEmpresa(empresa.id);
      alert('✅ Empresa eliminada correctamente');
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
      alert(`❌ Error al eliminar empresa: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  // Formulario de sedes reutilizado en crear y editar
  const SedesForm = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-medium text-gray-700">Sedes / Obras</label>
        <button
          type="button"
          onClick={handleAgregarSede}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20"
        >
          <Plus size={14} />
          Agregar Sede
        </button>
      </div>

      {formData.sedes.length === 0 ? (
        <p className="text-xs text-gray-400 italic">
          Sin sedes cargadas. Si el cliente tiene una sola dirección, no hace falta agregar ninguna.
        </p>
      ) : (
        <div className="space-y-2">
          {formData.sedes.map((sede) => (
            <div key={sede.id} className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
              <MapPin size={16} className="mt-2 text-gray-400 flex-shrink-0" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={sede.nombreObra}
                  onChange={(e) => handleCambiarSede(sede.id, 'nombreObra', e.target.value)}
                  placeholder="Nombre de la obra"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={sede.direccion}
                  onChange={(e) => handleCambiarSede(sede.id, 'direccion', e.target.value)}
                  placeholder="Dirección de la obra"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="button"
                onClick={() => handleEliminarSede(sede.id)}
                className="mt-1.5 text-gray-400 hover:text-red-600 flex-shrink-0"
                title="Quitar sede"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold font-montserrat text-primary">
              Gestión de Empresas
            </h2>
            <p className="text-gray-600">
              Empresas cliente y sus sedes/obras. Los contactos de cada empresa se administran desde Usuarios.
            </p>
          </div>
          <button
            onClick={handleAbrirCrear}
            className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-xl bg-primary hover:bg-red-700 shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            Nueva Empresa
          </button>
        </div>

        <div className="p-3 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por razón social, CUIT o email..."
              className="w-full py-2 pl-9 pr-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {empresasFiltradas.length === 0 ? (
          <div className="p-8 text-center bg-white border border-gray-100 rounded-2xl">
            <Building2 size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">
              {empresas.length === 0 ? 'Todavía no hay empresas cargadas.' : 'Ninguna empresa coincide con la búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {empresasFiltradas.map((empresa) => (
              <div key={empresa.id} className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center min-w-0">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full">
                      <Building2 size={18} className="text-gray-500" />
                    </div>
                    <div className="min-w-0 ml-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{empresa.razonSocial}</p>
                      {empresa.cuit && <p className="text-xs text-gray-500 truncate">CUIT: {empresa.cuit}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleAbrirEditar(empresa)}
                      className="flex items-center justify-center w-8 h-8 text-gray-500 rounded-lg hover:bg-gray-100"
                      title="Editar empresa"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleEliminarEmpresa(empresa)}
                      className="flex items-center justify-center w-8 h-8 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600"
                      title="Eliminar empresa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {empresa.direccionPrincipal && (
                  <p className="text-xs text-gray-500 mb-1 flex items-start gap-1">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                    {empresa.direccionPrincipal}
                  </p>
                )}
                {empresa.telefono && <p className="text-xs text-gray-500">Tel: {empresa.telefono}</p>}

                {empresa.sedes?.length > 0 && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                    <MapPin size={12} />
                    {empresa.sedes.length} {empresa.sedes.length === 1 ? 'sede' : 'sedes'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CREAR EMPRESA */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 size={20} className="mr-2 text-primary" />
                Nueva Empresa
              </h3>
              <button onClick={() => setModalCrearAbierto(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearEmpresa} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Razón Social / Nombre de la Empresa *</label>
                <input
                  type="text"
                  required
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Ej: Autocity S.A."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">CUIT</label>
                  <input
                    type="text"
                    value={formData.cuit}
                    onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="30-12345678-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Ej: +54 9 11..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Principal</label>
                <input
                  type="email"
                  value={formData.emailPrincipal}
                  onChange={(e) => setFormData({ ...formData, emailPrincipal: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="contacto@empresa.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dirección Principal</label>
                <input
                  type="text"
                  value={formData.direccionPrincipal}
                  onChange={(e) => setFormData({ ...formData, direccionPrincipal: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Dirección administrativa / fiscal"
                />
              </div>

              <SedesForm />

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {procesando ? 'Creando...' : 'Crear Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR EMPRESA */}
      {modalEditarAbierto && empresaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Edit size={20} className="mr-2 text-blue-600" />
                Editar Empresa
              </h3>
              <button onClick={() => setModalEditarAbierto(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditarEmpresa} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Razón Social / Nombre de la Empresa *</label>
                <input
                  type="text"
                  required
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">CUIT</label>
                  <input
                    type="text"
                    value={formData.cuit}
                    onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Principal</label>
                <input
                  type="email"
                  value={formData.emailPrincipal}
                  onChange={(e) => setFormData({ ...formData, emailPrincipal: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dirección Principal</label>
                <input
                  type="text"
                  value={formData.direccionPrincipal}
                  onChange={(e) => setFormData({ ...formData, direccionPrincipal: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <SedesForm />

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(false)}
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {procesando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
