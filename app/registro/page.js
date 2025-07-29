// app/registro/page.jsx - Registro Público IMSSE
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Building, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import apiService from '../lib/services/apiService';

export default function RegistroPublico() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  
  // Estados para Google Auth
  const [mostrarModalGoogle, setMostrarModalGoogle] = useState(false);
  const [usuarioGoogle, setUsuarioGoogle] = useState(null);
  const [datosGoogleCompletos, setDatosGoogleCompletos] = useState({
    empresa: '',
    telefono: '',
    nombre: '',
    apellido: ''
  });

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    empresa: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });

  const [errores, setErrores] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores({ ...errores, [name]: '' });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar campos requeridos
    if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) nuevosErrores.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) nuevosErrores.email = 'El email es requerido';
    if (!formData.empresa.trim()) nuevosErrores.empresa = 'La empresa es requerida';
    if (!formData.password) nuevosErrores.password = 'La contraseña es requerida';
    if (!formData.confirmPassword) nuevosErrores.confirmPassword = 'Confirma tu contraseña';

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      nuevosErrores.email = 'Ingresa un email válido';
    }

    // Validar contraseña
    if (formData.password && formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar que las contraseñas coincidan
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Extraer datos del usuario de Google
      const displayName = result.user.displayName || '';
      const nameParts = displayName.split(' ');
      const nombre = nameParts[0] || '';
      const apellidoGoogle = nameParts.slice(1).join(' ') || '';
      
      setUsuarioGoogle(result.user);
      setDatosGoogleCompletos({
        empresa: '',
        telefono: '',
        nombre: nombre,
        apellido: apellidoGoogle
      });
      
      // Cerrar sesión temporalmente y mostrar modal para completar datos
      await auth.signOut();
      setMostrarModalGoogle(true);
      
    } catch (error) {
      console.error('Error con Google Auth:', error);
      if (error.code !== 'auth/popup-cancelled-by-user') {
        alert('Error al conectar con Google. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompletarRegistroGoogle = async (e) => {
    e.preventDefault();
    
    if (!datosGoogleCompletos.empresa.trim() || !datosGoogleCompletos.nombre.trim()) {
      alert('La empresa y el nombre son requeridos');
      return;
    }
    
    setLoading(true);
    
    try {
      // Reautenticar con Google para completar registro
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Extraer datos del usuario de Google
      const displayName = result.user.displayName || '';
      const nameParts = displayName.split(' ');
      const nombreFinal = datosGoogleCompletos.nombre.trim() || nameParts[0] || '';
      const apellidoFinal = datosGoogleCompletos.apellido.trim() || nameParts.slice(1).join(' ') || '';
      
      // Crear perfil completo
      const userData = {
        nombre: nombreFinal,
        apellido: apellidoFinal,
        nombreCompleto: `${nombreFinal} ${apellidoFinal}`.trim(),
        email: result.user.email,
        empresa: datosGoogleCompletos.empresa.trim(),
        telefono: datosGoogleCompletos.telefono.trim(),
        rol: 'cliente',
        estado: 'pendiente',
        metodoRegistro: 'google',
        photoURL: result.user.photoURL || null,
        permisos: {
          presupuestos: false,
          recibos: false,
          remitos: false,
          estados: false,
          ordenes: false,
          recordatorios: false
        }
      };

      await apiService.crearPerfilUsuario(result.user.uid, userData);
      
      // Cerrar sesión y mostrar éxito
      await auth.signOut();
      setMostrarModalGoogle(false);
      
      // Actualizar formData para mostrar en pantalla de éxito
      setFormData({
        ...formData,
        nombreCompleto: userData.nombreCompleto,
        empresa: userData.empresa,
        email: userData.email
      });
      
      setRegistroExitoso(true);
      
    } catch (error) {
      console.error('Error al completar registro con Google:', error);
      alert('Error al completar el registro. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN PRINCIPAL DE REGISTRO CON EMAIL - ESTA ERA LA QUE FALTABA
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setLoading(true);

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // 2. Crear perfil de usuario en Firestore con estado "pendiente"
      const userData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        nombreCompleto: `${formData.nombre.trim()} ${formData.apellido.trim()}`,
        email: formData.email.toLowerCase().trim(),
        empresa: formData.empresa.trim(),
        telefono: formData.telefono.trim(),
        rol: 'cliente', // Rol por defecto
        estado: 'pendiente', // Necesita aprobación del admin
        metodoRegistro: 'email',
        permisos: {
          presupuestos: false,
          recibos: false,
          remitos: false,
          estados: false,
          ordenes: false,
          recordatorios: false
        }
      };

      await apiService.crearPerfilUsuario(userCredential.user.uid, userData);

      // 3. Cerrar sesión automáticamente (usuario debe esperar aprobación)
      await auth.signOut();

      setRegistroExitoso(true);

    } catch (error) {
      console.error('Error en el registro:', error);
      
      // Manejar errores específicos de Firebase
      let mensajeError = 'Error al crear la cuenta. Inténtalo de nuevo.';
      
      if (error.code === 'auth/email-already-in-use') {
        mensajeError = 'Este email ya está registrado. Intenta con otro email.';
        setErrores({ email: mensajeError });
      } else if (error.code === 'auth/weak-password') {
        mensajeError = 'La contraseña es muy débil. Usa al menos 6 caracteres.';
        setErrores({ password: mensajeError });
      } else if (error.code === 'auth/invalid-email') {
        mensajeError = 'El formato del email no es válido.';
        setErrores({ email: mensajeError });
      } else {
        alert(mensajeError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
  if (registroExitoso) {
    return (
      <div className="flex items-center justify-center min-h-screen mt-16 bg-gray-50">
        <div className="w-full max-w-md mx-4">
          <div className="p-8 text-center bg-white rounded-lg shadow-lg">
            <div className="mb-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
            
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              ¡Registro Exitoso!
            </h2>
            
            <div className="space-y-4 text-gray-600">
              <p>
                Tu cuenta ha sido creada exitosamente para <strong>IMSSE Ingeniería</strong>.
              </p>
              <p>
                Tu solicitud está <span className="px-2 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">pendiente de aprobación</span>.
              </p>
              <p>
                Un administrador revisará tu solicitud y te contactará por email cuando tu cuenta sea activada.
              </p>
            </div>

            <div className="p-4 mt-6 rounded-lg bg-blue-50">
              <p className="text-sm text-blue-800">
                <strong>Datos registrados:</strong><br/>
                {formData.nombreCompleto || `${formData.nombre} ${formData.apellido}`}<br/>
                {formData.empresa}<br/>
                {formData.email}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/admin"
                className="block w-full px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700"
              >
                Ir al Login
              </Link>
              <p className="text-xs text-gray-500">
                ¿Tienes una cuenta activa? Inicia sesión mientras esperas la aprobación.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white shadow bg-primary">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/logo/imsse-logo.png" 
                alt="IMSSE Logo" 
                className="w-6 h-6 mr-2 md:w-8 md:h-8 md:mr-3"
              />
              <h1 className="text-lg font-bold md:text-xl font-montserrat">IMSSE INGENIERÍA</h1>
            </div>
            <Link
              href="/admin"
              className="flex items-center text-white transition-colors hover:text-gray-200"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span className="hidden md:inline">Volver al Login</span>
              <span className="md:hidden">Login</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Título */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">
              Crear Cuenta
            </h2>
            <p className="mt-2 text-gray-600">
              Regístrate para acceder al sistema de IMSSE Ingeniería
            </p>
          </div>

          {/* Formulario */}
          <div className="p-8 bg-white rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <div className="relative">
                    <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errores.nombre ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Juan"
                    />
                  </div>
                  {errores.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errores.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errores.apellido ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Pérez"
                  />
                  {errores.apellido && (
                    <p className="mt-1 text-sm text-red-600">{errores.apellido}</p>
                  )}
                </div>
              </div>

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
                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errores.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="juan@empresa.com"
                  />
                </div>
                {errores.email && (
                  <p className="mt-1 text-sm text-red-600">{errores.email}</p>
                )}
              </div>

              {/* Empresa */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Empresa *
                </label>
                <div className="relative">
                  <Building className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errores.empresa ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                {errores.empresa && (
                  <p className="mt-1 text-sm text-red-600">{errores.empresa}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+54 351 123 4567"
                />
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
                    className={`w-full pl-10 pr-12 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errores.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errores.password && (
                  <p className="mt-1 text-sm text-red-600">{errores.password}</p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errores.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Repite tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errores.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errores.confirmPassword}</p>
                )}
              </div>

              {/* Información importante */}
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  <strong>Nota importante:</strong> Tu cuenta será creada con estado "pendiente". 
                  Un administrador de IMSSE revisará tu solicitud y te contactará cuando sea activada.
                </p>
              </div>

              {/* Botón de Google Auth */}
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
                className="flex items-center justify-center w-full px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Conectando...' : 'Continuar con Google'}
              </button>

              {/* Botón de registro tradicional */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta con Email'}
              </button>

              {/* Link de login */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
                  <Link href="/admin" className="font-medium text-primary hover:underline">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-sm text-center text-gray-500">
            <p>© 2025 IMSSE Ingeniería S.A.S</p>
            <p>Sistemas de protección contra incendios</p>
          </div>
        </div>
      </div>

      {/* Modal para completar datos de Google */}
      {mostrarModalGoogle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Completa tu registro</h3>
              <p className="mt-1 text-sm text-gray-600">Necesitamos algunos datos adicionales para IMSSE</p>
            </div>

            {/* Contenido del modal */}
            <form onSubmit={handleCompletarRegistroGoogle} className="px-6 py-4">
              <div className="space-y-4">
                {/* Datos de Google (editables) */}
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="mb-2 text-sm text-gray-600">
                    <strong>Datos de Google:</strong> Puedes editarlos si es necesario
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Email:</strong> {usuarioGoogle?.email}
                  </p>
                </div>

                {/* Nombre (editable) */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <div className="relative">
                    <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      value={datosGoogleCompletos.nombre}
                      onChange={(e) => setDatosGoogleCompletos({
                        ...datosGoogleCompletos, 
                        nombre: e.target.value
                      })}
                      className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                </div>

                {/* Apellido (editable) */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={datosGoogleCompletos.apellido}
                    onChange={(e) => setDatosGoogleCompletos({
                      ...datosGoogleCompletos, 
                      apellido: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tu apellido"
                    required
                  />
                </div>

                {/* Empresa (requerido) */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Empresa *
                  </label>
                  <div className="relative">
                    <Building className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      value={datosGoogleCompletos.empresa}
                      onChange={(e) => setDatosGoogleCompletos({
                        ...datosGoogleCompletos, 
                        empresa: e.target.value
                      })}
                      className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Nombre de tu empresa"
                      required
                    />
                  </div>
                </div>

                {/* Apellido (si falta) */}
                {!datosGoogleCompletos.apellido.trim() && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={datosGoogleCompletos.apellido}
                      onChange={(e) => setDatosGoogleCompletos({
                        ...datosGoogleCompletos, 
                        apellido: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tu apellido"
                    />
                  </div>
                )}

                {/* Teléfono (opcional) */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Teléfono (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={datosGoogleCompletos.telefono}
                    onChange={(e) => setDatosGoogleCompletos({
                      ...datosGoogleCompletos, 
                      telefono: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+54 351 123 4567"
                  />
                </div>

                {/* Información */}
                <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <p className="text-sm text-yellow-800">
                    Tu cuenta será creada con estado "pendiente" y necesitará aprobación del administrador.
                  </p>
                </div>
              </div>

              {/* Botones del modal */}
              <div className="flex mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalGoogle(false);
                    setUsuarioGoogle(null);
                    setDatosGoogleCompletos({ empresa: '', telefono: '', nombre: '', apellido: '' });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !datosGoogleCompletos.empresa.trim() || !datosGoogleCompletos.nombre.trim()}
                  className="flex-1 px-4 py-2 text-white rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Completando...' : 'Completar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}