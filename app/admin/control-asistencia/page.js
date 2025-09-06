// app/admin/control-asistencia/page.jsx - Página principal del control de asistencia
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Navigation,
  Clock,
  MapPin,
  Calendar,
  User,
  LogIn,
  LogOut,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function ControlAsistencia() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marcaciones, setMarcaciones] = useState([]);
  const [ultimaMarcacion, setUltimaMarcacion] = useState(null);
  const [estadoActual, setEstadoActual] = useState('fuera'); // 'en_obra' | 'fuera'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);
          
          if (perfilUsuario.rol !== 'tecnico' || perfilUsuario.estado !== 'activo') {
            router.push('/admin/dashboard-tecnico');
            return;
          }

          setUser(currentUser);
          setPerfil(perfilUsuario);
          await cargarMarcaciones();
        } catch (error) {
          console.error('Error al verificar usuario:', error);
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarMarcaciones = async () => {
    try {
      setLoading(true);
      
      // Cargar marcaciones del técnico (últimas 10)
      const response = await apiService.obtenerMarcacionesTecnico(auth.currentUser?.uid);
      
      if (response?.documents) {
        const marcacionesOrdenadas = response.documents
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10);
        
        setMarcaciones(marcacionesOrdenadas);
        
        if (marcacionesOrdenadas.length > 0) {
          const ultima = marcacionesOrdenadas[0];
          setUltimaMarcacion(ultima);
          setEstadoActual(ultima.tipo === 'ingreso' ? 'en_obra' : 'fuera');
        }
      }
      
    } catch (error) {
      console.error('Error al cargar marcaciones:', error);
      // No mostrar error si es 404 (colección no existe aún)
      if (!error.message.includes('404')) {
        console.error('Error inesperado:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = new Date(timestamp);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearSoloHora = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = new Date(timestamp);
    return fecha.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTiempoTrabajado = () => {
    if (!marcaciones.length) return '0h 0m';
    
    const hoy = new Date().toDateString();
    const marcacionesHoy = marcaciones.filter(m => 
      new Date(m.timestamp).toDateString() === hoy
    );

    let tiempoTotal = 0;
    let ingresoTemp = null;

    for (const marcacion of marcacionesHoy.reverse()) {
      if (marcacion.tipo === 'ingreso') {
        ingresoTemp = new Date(marcacion.timestamp);
      } else if (marcacion.tipo === 'salida' && ingresoTemp) {
        tiempoTotal += new Date(marcacion.timestamp) - ingresoTemp;
        ingresoTemp = null;
      }
    }

    // Si hay un ingreso sin salida, contar hasta ahora
    if (ingresoTemp) {
      tiempoTotal += new Date() - ingresoTemp;
    }

    const horas = Math.floor(tiempoTotal / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoTotal % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando control de asistencia...</p>
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
                href="/admin/dashboard-tecnico"
                className="flex items-center p-2 mr-4 text-white rounded-md hover:bg-red-700"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-lg font-bold md:text-xl font-montserrat">Control de Asistencia</h1>
                <p className="text-xs text-red-100 md:text-sm">Gestión de marcaciones</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{perfil?.nombreCompleto}</p>
              <p className="text-xs text-red-100">Técnico</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl px-4 py-6 mx-auto">
        {/* Estado actual y estadísticas */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          {/* Estado actual */}
          <div className={`p-6 rounded-lg shadow ${
            estadoActual === 'en_obra' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${
                estadoActual === 'en_obra' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {estadoActual === 'en_obra' ? (
                  <CheckCircle size={24} className="text-green-600" />
                ) : (
                  <AlertTriangle size={24} className="text-gray-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Estado Actual</p>
                <p className={`text-lg font-bold ${
                  estadoActual === 'en_obra' ? 'text-green-800' : 'text-gray-800'
                }`}>
                  {estadoActual === 'en_obra' ? 'En Obra' : 'Fuera de Obra'}
                </p>
              </div>
            </div>
          </div>

          {/* Tiempo trabajado hoy */}
          <div className="p-6 bg-white border border-blue-200 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Tiempo Hoy</p>
                <p className="text-lg font-bold text-blue-800">
                  {calcularTiempoTrabajado()}
                </p>
              </div>
            </div>
          </div>

          {/* Total marcaciones */}
          <div className="p-6 bg-white border border-purple-200 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <User size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Total Marcaciones</p>
                <p className="text-lg font-bold text-purple-800">
                  {marcaciones.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón principal de marcación */}
        <div className="mb-8">
          <Link
            href="/admin/control-asistencia/marcar"
            className="block p-8 transition-all bg-white border-2 border-green-200 rounded-lg shadow hover:border-green-400 hover:bg-green-50"
          >
            <div className="text-center">
              <Navigation size={48} className="mx-auto mb-4 text-green-600" />
              <h3 className="mb-2 text-2xl font-bold text-green-800">Marcar Asistencia</h3>
              <p className="text-green-600">
                {estadoActual === 'en_obra' 
                  ? 'Registrar salida de obra' 
                  : 'Registrar ingreso a obra'
                }
              </p>
            </div>
          </Link>
        </div>

        {/* Historial de marcaciones */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-6 text-xl font-semibold text-gray-900">Últimas Marcaciones</h3>
          
          {marcaciones.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No hay marcaciones registradas</p>
              <p className="text-sm text-gray-400">Presiona "Marcar Asistencia" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {marcaciones.map((marcacion, index) => (
                <div
                  key={marcacion.id || index}
                  className={`flex items-center p-4 rounded-lg border ${
                    marcacion.tipo === 'ingreso'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    marcacion.tipo === 'ingreso'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}>
                    {marcacion.tipo === 'ingreso' ? (
                      <LogIn size={20} className="text-green-600" />
                    ) : (
                      <LogOut size={20} className="text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${
                          marcacion.tipo === 'ingreso' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {marcacion.tipo === 'ingreso' ? 'Ingreso' : 'Salida'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatearFecha(marcacion.timestamp)}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={14} className="mr-1" />
                          GPS
                        </div>
                        <p className="text-lg font-bold text-gray-800">
                          {formatearSoloHora(marcacion.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 mt-8 text-center bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Sistema de Control de Asistencia - v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}