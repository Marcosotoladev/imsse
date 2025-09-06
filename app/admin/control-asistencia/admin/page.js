// app/admin/control-asistencia/admin/page.jsx - Panel administrador con mapa
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Map,
  List,
  Filter,
  Download,
  User,
  Calendar,
  Clock,
  MapPin,
  LogIn,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';

// Importar mapa dinámicamente para evitar problemas de SSR
const MapaMarcaciones = dynamic(() => import('../../../components/MapaMarcaciones'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg h-96">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-2 border-b-2 rounded-full animate-spin border-primary"></div>
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  )
});

export default function PanelAdminMarcaciones() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marcaciones, setMarcaciones] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [vista, setVista] = useState('mapa'); // 'mapa' | 'lista'
  const [filtros, setFiltros] = useState({
    tecnico: '',
    fecha: '',
    tipo: ''
  });
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    enObra: 0,
    fueraObra: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);
          
          if (perfilUsuario.rol !== 'admin') {
            router.push('/admin/dashboard-tecnico');
            return;
          }

          setUser(currentUser);
          setPerfil(perfilUsuario);
          
          await Promise.all([
            cargarMarcaciones(),
            cargarTecnicos()
          ]);
          
        } catch (error) {
          console.error('Error al verificar usuario:', error);
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const cargarMarcaciones = async () => {
    try {
      const response = await apiService.obtenerMarcaciones(filtros);
      
      if (response?.documents) {
        setMarcaciones(response.documents);
        calcularEstadisticas(response.documents);
      }
    } catch (error) {
      console.error('Error al cargar marcaciones:', error);
    }
  };

  const cargarTecnicos = async () => {
    try {
      const response = await apiService.obtenerUsuarios({ rol: 'tecnico', estado: 'activo' });
      
      if (response?.documents || response?.users) {
        setTecnicos(response.documents || response.users || []);
      }
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
    }
  };

  const calcularEstadisticas = (marcacionesData) => {
    const total = marcacionesData.length;
    
    // Agrupar por técnico y obtener última marcación
    const tecnicosEstado = {};
    
    marcacionesData.forEach(marcacion => {
      const tecnicoId = marcacion.tecnicoId;
      if (!tecnicosEstado[tecnicoId] || 
          new Date(marcacion.timestamp) > new Date(tecnicosEstado[tecnicoId].timestamp)) {
        tecnicosEstado[tecnicoId] = marcacion;
      }
    });
    
    const enObra = Object.values(tecnicosEstado).filter(m => m.tipo === 'ingreso').length;
    const fueraObra = Object.keys(tecnicosEstado).length - enObra;
    
    setEstadisticas({ total, enObra, fueraObra });
  };

  const aplicarFiltros = async () => {
    await cargarMarcaciones();
  };

  const exportarDatos = () => {
    const csvContent = [
      ['Técnico', 'Tipo', 'Fecha', 'Hora', 'Latitud', 'Longitud'],
      ...marcaciones.map(m => [
        m.tecnicoNombre,
        m.tipo,
        new Date(m.timestamp).toLocaleDateString('es-AR'),
        new Date(m.timestamp).toLocaleTimeString('es-AR'),
        m.coordenadas.latitud,
        m.coordenadas.longitud
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marcaciones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatearFecha = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white shadow bg-primary">
        <div className="px-4 py-3 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/admin/control-asistencia"
                className="flex items-center p-2 mr-4 text-white rounded-md hover:bg-red-700"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-lg font-bold md:text-xl font-montserrat">Panel Administrador</h1>
                <p className="text-xs text-red-100 md:text-sm">Control de Asistencia</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{perfil?.nombreCompleto}</p>
              <p className="text-xs text-red-100">Administrador</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 mx-auto max-w-7xl">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white border border-blue-200 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Total Marcaciones</p>
                <p className="text-3xl font-bold text-blue-800">{estadisticas.total}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-green-200 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <LogIn size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Técnicos en Obra</p>
                <p className="text-3xl font-bold text-green-800">{estadisticas.enObra}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-red-200 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <LogOut size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Técnicos Fuera</p>
                <p className="text-3xl font-bold text-red-800">{estadisticas.fueraObra}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filtros.tecnico}
                onChange={(e) => setFiltros({...filtros, tecnico: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos los técnicos</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico.id || tecnico.uid} value={tecnico.id || tecnico.uid}>
                    {tecnico.nombreCompleto || tecnico.email}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={filtros.fecha}
                onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos los tipos</option>
                <option value="ingreso">Solo ingresos</option>
                <option value="salida">Solo salidas</option>
              </select>

              <button
                onClick={aplicarFiltros}
                className="flex items-center px-4 py-2 text-white rounded-md bg-primary hover:bg-red-700"
              >
                <Filter size={16} className="mr-2" />
                Filtrar
              </button>
            </div>

            {/* Controles de vista */}
            <div className="flex gap-2">
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setVista('mapa')}
                  className={`flex items-center px-3 py-2 text-sm ${
                    vista === 'mapa' 
                      ? 'bg-primary text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Map size={16} className="mr-1" />
                  Mapa
                </button>
                <button
                  onClick={() => setVista('lista')}
                  className={`flex items-center px-3 py-2 text-sm ${
                    vista === 'lista' 
                      ? 'bg-primary text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List size={16} className="mr-1" />
                  Lista
                </button>
              </div>

              <button
                onClick={exportarDatos}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download size={16} className="mr-2" />
                Exportar
              </button>

              <button
                onClick={cargarMarcaciones}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <RefreshCw size={16} className="mr-2" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        {vista === 'mapa' ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Mapa de Marcaciones</h3>
              <p className="text-sm text-gray-600">
                Verde: Ingresos | Rojo: Salidas | Total: {marcaciones.length} marcaciones
              </p>
            </div>
            <div className="p-4">
              <MapaMarcaciones marcaciones={marcaciones} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Lista de Marcaciones</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Técnico
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Ubicación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marcaciones.map((marcacion) => (
                    <tr key={marcacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {marcacion.tecnicoNombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          marcacion.tipo === 'ingreso'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {marcacion.tipo === 'ingreso' ? (
                            <LogIn size={12} className="mr-1" />
                          ) : (
                            <LogOut size={12} className="mr-1" />
                          )}
                          {marcacion.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock size={16} className="mr-2 text-gray-400" />
                          {formatearFecha(marcacion.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={16} className="mr-2 text-gray-400" />
                          {marcacion.coordenadas.latitud.toFixed(4)}, {marcacion.coordenadas.longitud.toFixed(4)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {marcaciones.length === 0 && (
                <div className="py-12 text-center">
                  <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No hay marcaciones que mostrar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}