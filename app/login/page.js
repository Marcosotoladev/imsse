// app/login/page.jsx - Login actualizado para el nuevo sistema
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import apiService, { 
  obtenerPerfilUsuario, 
  crearPerfilUsuario, 
  obtenerClientePorEmail, 
  crearClienteCompleto 
} from '../lib/services/apiService';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [modalDatos, setModalDatos] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState({
    telefono: '',
    empresa: '',
    tipoSolicitud: 'cliente'
  });
  const [usuarioTemporal, setUsuarioTemporal] = useState(null);
  const router = useRouter();

  // Función para asegurar que el cliente existe en ambas colecciones
  const asegurarClienteCompleto = async (user, perfil) => {
    // Si es cliente, verificar que también exista en colección clientes
    if (perfil.rol === 'cliente') {
      try {
        // Intentar obtener de la colección clientes
        await obtenerClientePorEmail(user.email);
        console.log('✅ Cliente existe en ambas colecciones');
      } catch (error) {
        console.log('🔄 Cliente no existe en colección clientes, creando...');
        
        // Crear en la colección clientes
        const clienteData = {
          empresa: perfil.empresa || 'Empresa no especificada',
          nombreCompleto: perfil.nombreCompleto || user.displayName || `${perfil.nombre} ${perfil.apellido}`,
          email: user.email,
          telefono: perfil.telefono || '',
          direccion: '',
          cargo: '',
          tipoCliente: 'completo', // Por defecto acceso completo
          observaciones: `Cliente migrado automáticamente desde sistema de usuarios el ${new Date().toLocaleDateString('es-AR')}`,
          creadoPor: user.uid,
          metodoBegistro: perfil.metodoBegistro || 'email'
        };
        
        await crearClienteCompleto(clienteData);
        console.log('✅ Cliente creado en colección clientes');
      }
    }
  };

  // Función para redirigir según el rol
  const redirigirSegunRol = async (user, rol, estado) => {
    if (estado === 'inactivo') {
      setError('Su cuenta ha sido desactivada. Contacte al administrador.');
      return;
    }
    
    if (estado === 'pendiente') {
      setError('Su cuenta está pendiente de aprobación por un administrador.');
      return;
    }

    switch (rol) {
      case 'admin':
        router.push('/admin/panel-control');
        break;
      case 'tecnico':
        router.push('/tecnico/panel-control');
        break;
      case 'cliente':
        // Para clientes, primero asegurar que exista en ambas colecciones
        try {
          const perfil = await obtenerPerfilUsuario(user.uid);
          await asegurarClienteCompleto(user, perfil);
          router.push('/cliente/panel-control');
        } catch (error) {
          console.error('Error al asegurar datos del cliente:', error);
          setError('Error al preparar su cuenta. Inténtelo de nuevo.');
        }
        break;
      default:
        router.push('/admin/panel-control');
    }
  };

  // Login con email y password
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      try {
        // Intentar obtener el perfil del usuario usando la nueva API
        const perfil = await obtenerPerfilUsuario(userCredential.user.uid);
        await redirigirSegunRol(userCredential.user, perfil.rol, perfil.estado);
      } catch (perfilError) {
        console.log('Error al obtener perfil:', perfilError);
        
        // Si no existe perfil, crear uno básico (caso raro para email/password)
        await crearPerfilUsuario(userCredential.user.uid, {
          nombre: userCredential.user.displayName?.split(' ')[0] || 'Usuario',
          apellido: userCredential.user.displayName?.split(' ')[1] || '',
          email: userCredential.user.email,
          nombreCompleto: userCredential.user.displayName || userCredential.user.email,
          tipoSolicitud: 'cliente',
          estado: 'activo'
        });
        
        await redirigirSegunRol(userCredential.user, 'cliente', 'activo');
      }
    } catch (err) {
      console.error('Error login IMSSE:', err);
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Por favor, inténtelo más tarde.');
      } else if (err.code === 'auth/user-disabled') {
        setError('Esta cuenta ha sido deshabilitada. Contacte al administrador.');
      } else {
        setError('Error al iniciar sesión. Por favor, inténtelo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Login con Google
  const handleGoogleLogin = async () => {
    setError('');
    setLoadingGoogle(true);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      try {
        // Verificar si ya existe el perfil
        const perfil = await obtenerPerfilUsuario(user.uid);
        await redirigirSegunRol(user, perfil.rol, perfil.estado);
      } catch (perfilError) {
        // Usuario nuevo de Google - mostrar modal para completar datos
        setUsuarioTemporal(user);
        setModalDatos(true);
      }
    } catch (err) {
      console.error('Error Google login:', err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Autenticación cancelada por el usuario.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup bloqueado. Por favor, permita popups para este sitio.');
      } else {
        setError('Error al autenticar con Google. Inténtelo de nuevo.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Completar perfil de usuario de Google
  const completarPerfilGoogle = async () => {
    if (!usuarioTemporal) return;
    
    setLoading(true);
    
    try {
      const nombres = usuarioTemporal.displayName?.split(' ') || ['Usuario'];
      const nombre = nombres[0] || 'Usuario';
      const apellido = nombres.slice(1).join(' ') || '';

      // Crear en colección usuarios
      await crearPerfilUsuario(usuarioTemporal.uid, {
        nombre,
        apellido,
        email: usuarioTemporal.email,
        telefono: datosUsuario.telefono,
        empresa: datosUsuario.empresa,
        nombreCompleto: usuarioTemporal.displayName || usuarioTemporal.email,
        tipoSolicitud: datosUsuario.tipoSolicitud,
        metodoBegistro: 'google',
        estado: 'activo'
      });

      // Si es cliente, también crear en colección clientes
      if (datosUsuario.tipoSolicitud === 'cliente') {
        const clienteData = {
          empresa: datosUsuario.empresa || 'Empresa no especificada',
          nombreCompleto: usuarioTemporal.displayName || usuarioTemporal.email,
          email: usuarioTemporal.email,
          telefono: datosUsuario.telefono || '',
          direccion: '',
          cargo: '',
          tipoCliente: 'completo',
          observaciones: `Cliente registrado via Google el ${new Date().toLocaleDateString('es-AR')}`,
          creadoPor: usuarioTemporal.uid,
          metodoBegistro: 'google'
        };
        
        await crearClienteCompleto(clienteData);
      }

      setModalDatos(false);
      
      // Redirigir según el tipo
      await redirigirSegunRol(usuarioTemporal, datosUsuario.tipoSolicitud, 'activo');
    } catch (error) {
      console.error('Error al crear perfil:', error);
      setError('Error al completar el perfil. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Saltar modal (crear perfil mínimo)
  const saltarModal = async () => {
    if (!usuarioTemporal) return;
    
    try {
      const nombres = usuarioTemporal.displayName?.split(' ') || ['Usuario'];
      
      // Crear en usuarios
      await crearPerfilUsuario(usuarioTemporal.uid, {
        nombre: nombres[0] || 'Usuario',
        apellido: nombres.slice(1).join(' ') || '',
        email: usuarioTemporal.email,
        nombreCompleto: usuarioTemporal.displayName || usuarioTemporal.email,
        tipoSolicitud: 'cliente',
        metodoBegistro: 'google',
        estado: 'activo'
      });

      // También crear en clientes (acceso por defecto como cliente)
      const clienteData = {
        empresa: 'Empresa no especificada',
        nombreCompleto: usuarioTemporal.displayName || usuarioTemporal.email,
        email: usuarioTemporal.email,
        telefono: '',
        direccion: '',
        cargo: '',
        tipoCliente: 'completo',
        observaciones: `Cliente Google sin datos adicionales - ${new Date().toLocaleDateString('es-AR')}`,
        creadoPor: usuarioTemporal.uid,
        metodoBegistro: 'google'
      };
      
      await crearClienteCompleto(clienteData);

      setModalDatos(false);
      await redirigirSegunRol(usuarioTemporal, 'cliente', 'activo');
    } catch (error) {
      console.error('Error al crear perfil mínimo:', error);
      setError('Error al crear el perfil. Inténtelo de nuevo.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 pt-24 bg-gray-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div>
          <Link href="/" className="flex items-center justify-center mb-6 group">
            <div className="mr-4">
              <img 
                src="/logo/imsse-logo.png" 
                alt="IMSSE Logo" 
                className="w-16 h-16 transition-transform group-hover:scale-110"
              />
            </div>
            <div>
              <div className="text-2xl font-bold font-montserrat">
                <span className="text-primary">IMSSE </span>
                <span className="text-blue-600">INGENIERÍA </span>
                <span className="text-primary">S.A.S</span>
              </div>
              <div className="mt-1 text-xs text-center text-gray-600">
                Sistemas de Seguridad Contra Incendios
              </div>
            </div>
          </Link>
          
          <h2 className="mt-6 text-2xl font-bold text-center font-montserrat text-primary">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Acceda a su panel IMSSE
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Botón de Google Sign-In */}
        <div>
          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle || loading}
            className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              {loadingGoogle ? (
                <svg className="w-5 h-5 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
            </span>
            {loadingGoogle ? 'Autenticando...' : 'Continuar con Google'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">O continúe con email</span>
          </div>
        </div>

        {/* Formulario email/password */}
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block mb-1 text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="usuario@imsseingenieria.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Ingrese su contraseña"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || loadingGoogle}
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white transition-colors border border-transparent rounded-lg group bg-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {loading ? (
                  <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white group-hover:text-gray-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              {loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
            </button>
          </div>

          <div className="text-center">
            <div className="mb-2 text-xs text-gray-500">
              ¿No tiene cuenta? 
            </div>
            <Link href="/registro" className="text-sm transition-colors text-primary hover:text-red-700">
              Registrarse en IMSSE
            </Link>
          </div>
        </form>

        {/* Modal para completar datos de Google */}
        {modalDatos && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                ¡Bienvenido a IMSSE!
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Complete estos datos opcionales para mejorar su experiencia:
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Tipo de cuenta
                  </label>
                  <select
                    value={datosUsuario.tipoSolicitud}
                    onChange={(e) => setDatosUsuario(prev => ({ ...prev, tipoSolicitud: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="tecnico">Técnico</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={datosUsuario.telefono}
                    onChange={(e) => setDatosUsuario(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                    placeholder="+54 351 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={datosUsuario.empresa}
                    onChange={(e) => setDatosUsuario(prev => ({ ...prev, empresa: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                    placeholder="Nombre de su empresa"
                  />
                </div>
              </div>
              
              <div className="flex mt-6 space-x-3">
                <button
                  onClick={saltarModal}
                  className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Saltar
                </button>
                <button
                  onClick={completarPerfilGoogle}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm text-white rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Completar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}