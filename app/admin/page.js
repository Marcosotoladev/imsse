// app/admin/page.jsx - Login Panel IMSSE
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Autenticación con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // Login exitoso, redirigir al dashboard IMSSE
      router.push('/admin/panel-control');
    } catch (err) {
      console.error('Error login IMSSE:', err);
      
      // Mensajes de error personalizados según el código
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

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div>
          <Link href="/" className="flex items-center justify-center mb-6 group">
            {/* Logo IMSSE */}
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
            Panel de Administración
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Acceso exclusivo para personal autorizado de IMSSE
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

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
              disabled={loading}
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
              {loading ? 'Verificando credenciales...' : 'Acceder al Panel'}
            </button>
          </div>

          <div className="text-center">
            <div className="mb-2 text-xs text-gray-500">
              ¿Olvidó su contraseña? Contacte al administrador del sistema
            </div>
            <Link href="/" className="text-sm transition-colors text-primary hover:text-red-700">
              ← Volver al sitio principal de IMSSE
            </Link>
          </div>
        </form>

        {/* Información adicional de seguridad */}
        <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="mb-1 text-sm font-medium text-blue-800">Acceso Seguro</h4>
              <p className="text-xs text-blue-700">
                Este panel está protegido con autenticación Firebase. Solo personal autorizado de IMSSE puede acceder al sistema de gestión.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}