// app/admin/control-asistencia/marcar/page.jsx - Versión final sin debug
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  LogIn,
  LogOut,
  MapPin,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';

export default function MarcarAsistencia() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [ubicacion, setUbicacion] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [marcaciones, setMarcaciones] = useState([]);

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
          
          await cargarMarcaciones(currentUser.uid);
          await obtenerUbicacion();
          
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

  const cargarMarcaciones = async (tecnicoId) => {
    try {
      const response = await apiService.obtenerMarcacionesTecnico(tecnicoId, { limit: 10 });
      
      if (response?.documents) {
        setMarcaciones(response.documents);
      } else {
        setMarcaciones([]);
      }
      
    } catch (error) {
      console.error('Error al cargar marcaciones:', error);
      if (!error.message.includes('404') && !error.message.includes('No documents found')) {
        setMensaje({
          tipo: 'error',
          texto: 'Error al cargar historial de marcaciones'
        });
      }
      setMarcaciones([]);
    }
  };

  const obtenerUbicacion = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setMensaje({
          tipo: 'error',
          texto: 'Tu dispositivo no soporta geolocalización'
        });
        resolve();
        return;
      }

      setMensaje({
        tipo: 'info',
        texto: 'Obteniendo tu ubicación...'
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacion({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            precision: position.coords.accuracy
          });
          setMensaje({
            tipo: 'success',
            texto: 'Ubicación obtenida correctamente'
          });
          resolve();
        },
        (error) => {
          console.error('Error de geolocalización:', error);
          setMensaje({
            tipo: 'error',
            texto: 'No se pudo obtener la ubicación. Permite el acceso en tu navegador.'
          });
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const marcarAsistencia = async (tipo) => {
    if (!ubicacion) {
      setMensaje({
        tipo: 'error',
        texto: 'Necesitamos tu ubicación para registrar la marcación'
      });
      return;
    }

    try {
      setLoadingAction(true);
      setMensaje({
        tipo: 'info',
        texto: `Registrando ${tipo}...`
      });

      const marcacionData = {
        tecnicoId: user.uid,
        tecnicoNombre: perfil?.nombreCompleto || user.email,
        tipo: tipo,
        timestamp: new Date().toISOString(),
        coordenadas: {
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud
        },
        precision: ubicacion.precision,
        fechaCreacion: new Date().toISOString()
      };

      await apiService.crearMarcacion(marcacionData);

      setMensaje({
        tipo: 'success',
        texto: `${tipo === 'ingreso' ? 'Ingreso' : 'Salida'} registrado correctamente`
      });

      await cargarMarcaciones(user.uid);

    } catch (error) {
      console.error('Error al marcar asistencia:', error);
      setMensaje({
        tipo: 'error',
        texto: error.message || 'Error al registrar. Inténtalo nuevamente.'
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const ultimaMarcacion = marcaciones.length > 0 ? marcaciones[0] : null;
  const puedeMarcarIngreso = !ultimaMarcacion || ultimaMarcacion.tipo === 'salida';
  const puedeMarcarSalida = ultimaMarcacion && ultimaMarcacion.tipo === 'ingreso';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando sistema de marcación...</p>
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
                <h1 className="text-lg font-bold md:text-xl font-montserrat">Control de Asistencia</h1>
                <p className="text-xs text-red-100 md:text-sm">Marcar Ingreso/Salida</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{perfil?.nombreCompleto || user?.email}</p>
              <p className="text-xs text-red-100">Técnico</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl px-4 py-6 mx-auto">
        {/* Mensaje de estado */}
        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            mensaje.tipo === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            mensaje.tipo === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {mensaje.tipo === 'success' && <CheckCircle size={20} className="mr-2" />}
            {mensaje.tipo === 'error' && <AlertCircle size={20} className="mr-2" />}
            {mensaje.tipo === 'info' && <Loader size={20} className="mr-2 animate-spin" />}
            {mensaje.texto}
          </div>
        )}

        {/* Estado actual */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Estado Actual</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center p-4 rounded-lg bg-gray-50">
              <User size={24} className="mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Técnico</p>
                <p className="font-medium">{perfil?.nombreCompleto || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center p-4 rounded-lg bg-gray-50">
              <Clock size={24} className="mr-3 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Última marcación</p>
                <p className="font-medium">
                  {ultimaMarcacion ? 
                    `${ultimaMarcacion.tipo === 'ingreso' ? 'Ingreso' : 'Salida'} - ${new Date(ultimaMarcacion.timestamp).toLocaleString()}` :
                    'Sin marcaciones'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de ubicación */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Información de Ubicación</h3>
          <div className="flex items-center p-4 rounded-lg bg-gray-50">
            <MapPin size={24} className="mr-3 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Estado de GPS</p>
              <p className="font-medium">
                {ubicacion ? 
                  `Ubicación obtenida (±${Math.round(ubicacion.precision)}m)` :
                  'Obteniendo ubicación...'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Botones de marcación */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Botón Marcar Ingreso */}
          <button
            onClick={() => marcarAsistencia('ingreso')}
            disabled={!puedeMarcarIngreso || !ubicacion || loadingAction}
            className={`p-8 rounded-lg border-2 transition-all ${
              puedeMarcarIngreso && ubicacion && !loadingAction
                ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-400 text-green-800'
                : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              {loadingAction && !puedeMarcarSalida ? (
                <Loader size={48} className="mx-auto mb-4 animate-spin" />
              ) : (
                <LogIn size={48} className="mx-auto mb-4" />
              )}
              <h3 className="mb-2 text-2xl font-bold">Marcar Ingreso</h3>
              <p className="text-sm">
                {loadingAction && !puedeMarcarSalida ? 'Registrando...' :
                 !puedeMarcarIngreso ? 'Ya marcaste ingreso' : 'Registrar llegada a la obra'}
              </p>
            </div>
          </button>

          {/* Botón Marcar Salida */}
          <button
            onClick={() => marcarAsistencia('salida')}
            disabled={!puedeMarcarSalida || !ubicacion || loadingAction}
            className={`p-8 rounded-lg border-2 transition-all ${
              puedeMarcarSalida && ubicacion && !loadingAction
                ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-400 text-red-800'
                : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              {loadingAction && puedeMarcarSalida ? (
                <Loader size={48} className="mx-auto mb-4 animate-spin" />
              ) : (
                <LogOut size={48} className="mx-auto mb-4" />
              )}
              <h3 className="mb-2 text-2xl font-bold">Marcar Salida</h3>
              <p className="text-sm">
                {loadingAction && puedeMarcarSalida ? 'Registrando...' :
                 !puedeMarcarSalida ? 'Primero marca ingreso' : 'Registrar salida de la obra'}
              </p>
            </div>
          </button>
        </div>

        {/* Historial de marcaciones */}
        {marcaciones.length > 0 && (
          <div className="p-6 mt-8 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Últimas Marcaciones</h3>
            <div className="space-y-2">
              {marcaciones.map((marcacion) => (
                <div
                  key={marcacion.id}
                  className={`flex items-center justify-between p-3 rounded border ${
                    marcacion.tipo === 'ingreso'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center">
                    {marcacion.tipo === 'ingreso' ? (
                      <LogIn size={16} className="mr-2 text-green-600" />
                    ) : (
                      <LogOut size={16} className="mr-2 text-red-600" />
                    )}
                    <span className="font-medium">
                      {marcacion.tipo === 'ingreso' ? 'Ingreso' : 'Salida'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(marcacion.timestamp).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 mt-8 text-center bg-white rounded-lg shadow">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Sistema de Control de Asistencia</p>
          </div>
        </div>
      </div>
    </div>
  );
}