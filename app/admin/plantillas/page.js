// app/admin/plantillas/page.js - Listado de Plantillas de Visita Técnica (admin)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FilePlus, ClipboardCheck, Home, Search, Edit, Trash2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function ListaPlantillas() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plantillas, setPlantillas] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/admin');
        return;
      }
      try {
        const perfil = await apiService.obtenerPerfilUsuario(currentUser.uid);
        if (perfil.rol !== 'admin') {
          router.push('/admin/panel-control');
          return;
        }
        await cargarPlantillas();
        setLoading(false);
      } catch (error) {
        console.error('Error al verificar acceso:', error);
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarPlantillas = async () => {
    try {
      const response = await apiService.obtenerPlantillasInspeccion();
      const lista = response?.documents || [];
      setPlantillas(lista);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
      setPlantillas([]);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de que desea eliminar esta plantilla? Las inspecciones que ya la usaron no se ven afectadas.')) {
      return;
    }
    try {
      await apiService.eliminarPlantillaInspeccion(id);
      setPlantillas((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar la plantilla:', error);
      alert('Error al eliminar la plantilla. Inténtelo de nuevo más tarde.');
    }
  };

  const plantillasFiltradas = plantillas.filter((p) => {
    if (!filtro) return true;
    const termino = filtro.toLowerCase();
    return (
      p.titulo?.toLowerCase().includes(termino) ||
      p.grupo?.toLowerCase().includes(termino)
    );
  });

  const grupos = [...new Set(plantillasFiltradas.map((p) => p.grupo))];

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
    <div>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link href="/admin/panel-control" className="flex items-center mr-4 text-primary hover:underline">
              <Home size={16} className="mr-1" /> Panel
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Plantillas de Inspección</span>
          </div>

          <Link
            href="/admin/plantillas/nueva"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
          >
            <FilePlus size={18} className="mr-2" /> Nueva Plantilla
          </Link>
        </div>

        <h2 className="mb-1 text-2xl font-bold font-montserrat text-primary">
          Plantillas de Inspección
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Checklists reutilizables que los técnicos adjuntan al crear una Visita Técnica.
        </p>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="relative flex items-center mb-6">
            <Search size={18} className="absolute text-gray-400 left-3" />
            <input
              type="text"
              placeholder="Buscar por título o categoría..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {plantillasFiltradas.length === 0 ? (
            <div className="py-10 text-center">
              <ClipboardCheck size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-500">
                {filtro ? 'No hay plantillas que coincidan con su búsqueda' : 'Todavía no hay plantillas cargadas'}
              </p>
              {!filtro && (
                <p className="text-sm text-gray-400">Creá la primera desde &quot;Nueva Plantilla&quot;</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {grupos.map((grupo) => (
                <div key={grupo}>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">{grupo}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {plantillasFiltradas.filter((p) => p.grupo === grupo).map((plantilla) => (
                      <div key={plantilla.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-900">{plantilla.titulo}</p>
                            <p className="mt-1 text-xs text-gray-400">
                              {plantilla.tipo === 'tabular'
                                ? `Tabular · ${plantilla.nombreUnidad || 'unidad'}`
                                : `Lista · ${plantilla.items?.length || 0} ítem(s)`}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-100">
                          <Link
                            href={`/admin/plantillas/editar/${plantilla.id}`}
                            title="Editar"
                            className="inline-flex items-center justify-center w-9 h-9 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 hover:text-secondary"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleEliminar(plantilla.id)}
                            title="Eliminar"
                            className="inline-flex items-center justify-center w-9 h-9 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
