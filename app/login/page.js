// app/admin/page.jsx - Login mejorado con redirección por rol
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import apiService from '../lib/services/apiService';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  // Verificar si ya hay una sesión activa
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const perfil = await apiService.obtenerPerfilUsuario(user.uid);
          redirigirSegunRol(perfil);
        } catch (error) {
          console.error('Error al verificar perfil:', error);
          setVerificandoSesion(false);
        }
      } else {
        setVerificandoSesion(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Función para redirigir según el rol del usuario
  const redirigirSegunRol = (perfil) => {
    if (!perfil) {
      setError('No se encontró el perfil del usuario');
      return;
    }

    // Verificar estado del usuario
    if (perfil.estado === 'pendiente') {
      setError('Tu cuenta está pendiente de aprobación. Contacta al administrador.');
      return;
    }

    if (perfil.estado === 'inactivo') {
      setError('Tu cuenta está inactiva. Contacta al administrador.');
      return;
    }

    // Redirigir según el rol
    switch (perfil.rol) {
      case 'admin':
      case 'tecnico':
        router.push('/admin/panel-control');
        break;
      case 'cliente':
        router.push('/cliente/dashboard');
        break;
      default:
        setError('Rol de usuario no válido');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(''); // Limpiar error cuando el usuario escriba
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Obtener perfil del usuario
      const perfil = await apiService.obtenerPerfilUsuario(userCredential.user.uid);
      
      // Redirigir según rol
      redirigirSegunRol(perfil);

    } catch (error) {
      console.error('Error en login:', error);
      
      // Manejar errores específicos
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No existe una cuenta con este email');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta');
          break;
        case 'auth/invalid-email':
          setError('Email no válido');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos fallidos. Intenta más tarde');
          break;
        default:
          setError('Error al iniciar sesión. Verifica tus credenciales');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Verificar si el usuario existe en nuestra base de datos
      const perfil = await apiService.obtenerPerfilUsuario(result.user.uid);
      
      if (!perfil) {
        // Usuario no registrado en nuestro sistema
        await auth.signOut();
        setError('Esta cuenta de Google no está registrada en IMSSE. Regístrate primero.');
        return;
      }
      
      // Redirigir según rol
      redirigirSegunRol(perfil);

    } catch (error) {
      console.error('Error con Google:', error);
      
      if (error.code === 'auth/popup-cancelled-by-user') {
        setError(''); // No mostrar error si el usuario canceló
      } else {
        setError('Error al conectar con Google. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras verifica la sesión
  if (verificandoSesion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white shadow bg-primary">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center">
            <img 
              src="/logo/imsse-logo.png" 
              alt="IMSSE Logo" 
              className="w-6 h-6 mr-2 md:w-8 md:h-8 md:mr-3"
            />
            <h1 className="text-lg font-bold md:text-xl font-montserrat">IMSSE INGENIERÍA</h1>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Título */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-gray-600">
              Accede al sistema de gestión de IMSSE
            </p>
          </div>

          {/* Formulario */}
          <div className="p-8 bg-white rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error general */}
              {error && (
                <div className="flex items-center p-4 border border-red-200 rounded-lg bg-red-50">
                  <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="tu@empresa.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full py-3 pl-10 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tu contraseña"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Botón de Google */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-500 bg-white">o</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center w-full px-4 py-3 text-gray-700 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Conectando...' : 'Continuar con Google'}
              </button>

              {/* Botón de login tradicional */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>

              {/* Link de registro */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <Link href="/registro" className="font-medium text-primary hover:underline">
                    Regístrate aquí
                  </Link>
                </p>
              </div>

              {/* Estados de cuenta */}
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="mb-2 text-sm font-medium text-blue-800">Estados de cuenta:</h4>
                <div className="space-y-1 text-xs text-blue-700">
                  <div className="flex items-center">
                    <CheckCircle size={14} className="mr-2 text-green-600" />
                    <span><strong>Activo:</strong> Acceso completo al sistema</span>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle size={14} className="mr-2 text-yellow-600" />
                    <span><strong>Pendiente:</strong> Esperando aprobación del admin</span>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle size={14} className="mr-2 text-red-600" />
                    <span><strong>Inactivo:</strong> Cuenta deshabilitada</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Información de registro */}
          <div className="p-4 mt-6 text-center border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-center mb-2">
              <UserPlus className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">¿Nuevo en IMSSE?</span>
            </div>
            <p className="text-xs text-gray-600">
              Los nuevos usuarios deben registrarse y esperar la aprobación del administrador.
            </p>
            <Link
              href="/registro"
              className="inline-block px-4 py-2 mt-2 text-sm font-medium text-white transition-colors bg-gray-600 rounded hover:bg-gray-700"
            >
              Crear cuenta nueva
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 text-sm text-center text-gray-500">
            <p>© 2025 IMSSE Ingeniería S.A.S</p>
            <p>Sistemas de protección contra incendios</p>
          </div>
        </div>
      </div>
    </div>
  );
}