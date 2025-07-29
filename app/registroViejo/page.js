// app/registro/page.jsx - Registro híbrido que funciona con sistema actual
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { crearPerfilUsuario, crearClienteCompleto } from '../lib/firestore';

export default function RegistroHibrido() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    empresa: '',
    direccion: '',
    cargo: '',
    password: '',
    confirmPassword: '',
    tipoCliente: 'completo' // completo, administrativo, mantenimiento
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password) {
      return 'Por favor, complete todos los campos obligatorios.';
    }

    if (!formData.empresa) {
      return 'El nombre de la empresa es obligatorio.';
    }

    if (formData.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Las contraseñas no coinciden.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Por favor, ingrese un email válido.';
    }

    return null;
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // 2. Actualizar el displayName en Auth
      await updateProfile(userCredential.user, {
        displayName: `${formData.nombre} ${formData.apellido}`
      });

      // 3. Crear en colección 'usuarios' (sistema actual)
      await crearPerfilUsuario(userCredential.user.uid, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        empresa: formData.empresa,
        nombreCompleto: `${formData.nombre} ${formData.apellido}`,
        metodoBegistro: 'email',
        // IMPORTANTE: Estado activo para acceso inmediato
        estado: 'activo',
        rol: 'cliente'
      });

      // 4. TAMBIÉN crear en colección 'clientes' (sistema nuevo)
      const clienteData = {
        empresa: formData.empresa,
        nombreCompleto: `${formData.nombre} ${formData.apellido}`,
        email: formData.email,
        telefono: formData.telefono || '',
        direccion: formData.direccion || '',
        cargo: formData.cargo || '',
        tipoCliente: formData.tipoCliente,
        observaciones: `Cliente registrado vía formulario web el ${new Date().toLocaleDateString('es-AR')}`,
        creadoPor: userCredential.user.uid,
        metodoBegistro: 'email'
      };

      await crearClienteCompleto(clienteData);

      setSuccess(`¡Registro exitoso! Bienvenido ${formData.nombre}.\n\n✅ Su cuenta ha sido creada y activada automáticamente.\n\n🎯 Puede iniciar sesión inmediatamente y acceder a su portal de cliente.\n\nRedirigiendo al login...`);
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        empresa: '',
        direccion: '',
        cargo: '',
        password: '',
        confirmPassword: '',
        tipoCliente: 'completo'
      });

      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/admin');
      }, 3000);

    } catch (err) {
      console.error('Error en registro IMSSE:', err);
      
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado. Intente con otro email o inicie sesión.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es muy débil. Use al menos 6 caracteres.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('El registro está temporalmente deshabilitado. Contacte al administrador.');
      } else {
        setError(`Error al crear la cuenta: ${err.message}. Por favor, inténtelo de nuevo.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const tiposCliente = [
    {
      value: 'completo',
      label: 'Acceso Completo',
      description: 'Presupuestos, recibos, remitos, órdenes de trabajo, estados de cuenta'
    },
    {
      value: 'administrativo', 
      label: 'Administrativo',
      description: 'Presupuestos, recibos, remitos, estados de cuenta (sin órdenes técnicas)'
    },
    {
      value: 'mantenimiento',
      label: 'Mantenimiento',
      description: 'Solo órdenes de trabajo y recordatorios técnicos'
    }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 pt-16 bg-gray-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white border border-gray-200 rounded-lg shadow-lg">
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
            Registro de Cliente
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Cree su cuenta para acceder al portal de cliente IMSSE
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
            <div className="flex items-center">
              <svg className="flex-shrink-0 w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 text-sm text-green-700 border border-green-200 rounded-md bg-green-50">
            <div className="flex items-center">
              <svg className="flex-shrink-0 w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="whitespace-pre-line">{success}</span>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleRegistro}>
          {/* Tipo de cliente */}
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <label className="block mb-3 text-sm font-semibold text-blue-900">
              Tipo de acceso requerido *
            </label>
            <div className="space-y-3">
              {tiposCliente.map((tipo) => (
                <label key={tipo.value} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="tipoCliente"
                    value={tipo.value}
                    checked={formData.tipoCliente === tipo.value}
                    onChange={handleInputChange}
                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-blue-900">{tipo.label}</div>
                    <div className="text-sm text-blue-700">{tipo.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Información personal */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Nombre *
              </label>
              <input
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Su nombre"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Apellido *
              </label>
              <input
                name="apellido"
                type="text"
                required
                value={formData.apellido}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Su apellido"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Correo electrónico *
            </label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="ejemplo@empresa.com"
            />
          </div>

          {/* Información empresarial */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Empresa *
              </label>
              <input
                name="empresa"
                type="text"
                required
                value={formData.empresa}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Nombre de su empresa"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Cargo
              </label>
              <input
                name="cargo"
                type="text"
                value={formData.cargo}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Su cargo en la empresa"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="+54 351 123 4567"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                name="direccion"
                type="text"
                value={formData.direccion}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Dirección de la empresa"
              />
            </div>
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Confirmar contraseña *
              </label>
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Repita la contraseña"
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
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                )}
              </span>
              {loading ? 'Creando cuenta...' : 'Crear cuenta de cliente'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/admin" className="text-sm transition-colors text-primary hover:text-red-700">
              ← ¿Ya tiene cuenta? Iniciar sesión
            </Link>
          </div>
        </form>

        {/* Información adicional */}
        <div className="p-4 mt-6 border border-green-200 rounded-lg bg-green-50">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="mb-1 text-sm font-medium text-green-800">Sistema híbrido</h4>
              <p className="text-xs text-green-700">
                ✅ <strong>Acceso inmediato:</strong> Su cuenta se activa automáticamente.<br/>
                ✅ <strong>Compatible:</strong> Funciona con sistema actual y nuevo.<br/>
                ✅ <strong>Portal avanzado:</strong> Acceso a documentos filtrados por cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}