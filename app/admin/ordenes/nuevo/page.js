// app/admin/ordenes/nuevo/page.jsx - CON SELECTOR DE CLIENTE
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LogOut,
  Save,
  ArrowLeft,
  Shield,
  User,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Users,
  Camera,
  Plus,
  Trash2,
  Upload,
  PenTool,
  CheckCircle,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrdenTrabajoPDF from '../../../components/pdf/OrdenTrabajoPDF';
import SignatureCanvas from 'react-signature-canvas';
import tecnicoService from '../../../../lib/services/tecnicoService';

export default function CrearOrdenTrabajo() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [mostrarPDF, setMostrarPDF] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const router = useRouter();

  // NUEVO: Estados para gestión de clientes
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [tipoCliente, setTipoCliente] = useState('existente'); // 'existente' | 'manual'
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Referencias para firmas
  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  // Estado del formulario
  const [orden, setOrden] = useState({
    numero: '',
    clienteId: '', // ← NUEVO CAMPO CRÍTICO
    cliente: {
      empresa: '',
      nombre: '',
      telefono: '',
      direccion: '',
      solicitadoPor: ''
    },
    fechaTrabajo: '',
    horarioInicio: '',
    horarioFin: '',
    tecnicos: [
      { nombre: '' }
    ],
    tareasRealizadas: '',
    fotos: []
  });

  // Estado para firmas CON ACLARACIONES
  const [firmas, setFirmas] = useState({
    tecnico: {
      firma: null,
      aclaracion: ''
    },
    cliente: {
      firma: null,
      aclaracion: ''
    }
  });

  // Reemplaza el useEffect completo:
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // ✅ AGREGADO: Obtener perfil del usuario
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);

          // Verificar que tenga acceso (admin o técnico)
          if (!['admin', 'tecnico'].includes(perfilUsuario.rol)) {
            router.push('/cliente/dashboard');
            return;
          }

          setUser(currentUser);
          setPerfil(perfilUsuario); // ✅ AGREGADO

          // Generar número de orden automático
          const now = new Date();
          const numeroOrden = `OT${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

          setOrden(prev => ({
            ...prev,
            numero: numeroOrden,
            fechaTrabajo: now.toISOString().split('T')[0]
          }));

          cargarClientesDisponibles(perfilUsuario); // ✅ MODIFICADO: pasar perfil
          setLoading(false);
        } catch (error) {
          console.error('Error al obtener perfil:', error);
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Reemplaza SOLO esta función en tu código existente:
  const cargarClientesDisponibles = async (perfilUsuario) => {
    setCargandoClientes(true);
    try {
      let clientes = [];

      if (perfilUsuario && perfilUsuario.rol === 'tecnico') {
        // ✅ TÉCNICOS: usar endpoint específico
        console.log('Cargando clientes para técnico...');
        const clientesData = await tecnicoService.obtenerClientes();
        clientes = clientesData.users || clientesData.clientes || [];
      } else {
        // ✅ ADMIN: usar endpoint normal
        console.log('Cargando clientes para admin...');
        const usuariosData = await apiService.obtenerUsuarios();
        clientes = usuariosData.users.filter(u =>
          u.rol === 'cliente' && u.estado === 'activo'
        );
      }

      setClientesDisponibles(clientes);
      console.log('Clientes disponibles:', clientes);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setClientesDisponibles([]);
    } finally {
      setCargandoClientes(false);
    }
  };

  // NUEVA FUNCIÓN: Manejar selección de cliente existente
  const handleSeleccionarCliente = (clienteId) => {
    if (!clienteId) {
      setClienteSeleccionado(null);
      setOrden(prev => ({
        ...prev,
        clienteId: '',
        cliente: {
          empresa: '',
          nombre: '',
          telefono: '',
          direccion: '',
          solicitadoPor: ''
        }
      }));
      return;
    }

    const clienteEncontrado = clientesDisponibles.find(c => c.id === clienteId);
    if (clienteEncontrado) {
      setClienteSeleccionado(clienteEncontrado);
      setOrden(prev => ({
        ...prev,
        clienteId: clienteId,
        cliente: {
          empresa: clienteEncontrado.empresa || '',
          nombre: clienteEncontrado.nombreCompleto || '',
          telefono: clienteEncontrado.telefono || '',
          direccion: '', // ← Siempre vacío porque no se guarda en el registro
          solicitadoPor: ''
        }
      }));
    }
  };

  // FUNCIÓN MODIFICADA: Cambiar tipo de cliente
  const handleCambiarTipoCliente = (tipo) => {
    setTipoCliente(tipo);
    if (tipo === 'manual') {
      // Limpiar selección y permitir edición manual
      setClienteSeleccionado(null);
      setOrden(prev => ({
        ...prev,
        clienteId: '',
        cliente: {
          empresa: '',
          nombre: '',
          telefono: '',
          direccion: '',
          solicitadoPor: ''
        }
      }));
    }
  };

  // useEffect para configurar los canvas de firma después del montaje
  useEffect(() => {
    const configurarCanvas = () => {
      [firmaTecnicoRef, firmaClienteRef].forEach(ref => {
        if (ref.current) {
          const canvas = ref.current.getCanvas();
          if (canvas) {
            // Configurar el canvas para mejor respuesta táctil
            canvas.style.touchAction = 'none';
            canvas.style.msTouchAction = 'none';

            // Prevenir comportamientos por defecto en móvil
            canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
            canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
            canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
          }
        }
      });
    };

    // Configurar canvas después de un pequeño delay para asegurar que estén montados
    const timer = setTimeout(configurarCanvas, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup de event listeners
      [firmaTecnicoRef, firmaClienteRef].forEach(ref => {
        if (ref.current) {
          const canvas = ref.current.getCanvas();
          if (canvas) {
            canvas.removeEventListener('touchstart', (e) => e.preventDefault());
            canvas.removeEventListener('touchmove', (e) => e.preventDefault());
            canvas.removeEventListener('touchend', (e) => e.preventDefault());
          }
        }
      });
    };
  }, [loading]); // Ejecutar cuando loading cambie (después del montaje)

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrden(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setOrden(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTecnicoChange = (index, value) => {
    const updatedTecnicos = orden.tecnicos.map((tecnico, i) => {
      if (i === index) {
        return { nombre: value };
      }
      return tecnico;
    });
    setOrden(prev => ({ ...prev, tecnicos: updatedTecnicos }));
  };

  const addTecnico = () => {
    setOrden(prev => ({
      ...prev,
      tecnicos: [...prev.tecnicos, { nombre: '' }]
    }));
  };

  const removeTecnico = (index) => {
    if (orden.tecnicos.length === 1) return;
    const updatedTecnicos = orden.tecnicos.filter((_, i) => i !== index);
    setOrden(prev => ({ ...prev, tecnicos: updatedTecnicos }));
  };

  // Función para subir fotos a Cloudinary - CORREGIDA
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'ordenes_trabajo');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleFotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSubiendoFoto(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validar tamaño (máximo 10MB por foto)
        if (file.size > 10 * 1024 * 1024) {
          alert(`La foto ${file.name} es muy grande. Máximo 10MB por foto.`);
          return null;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} no es una imagen válida.`);
          return null;
        }

        try {
          const url = await uploadToCloudinary(file);
          return {
            id: Date.now() + Math.random(),
            url,
            nombre: file.name,
            fechaSubida: new Date().toISOString()
          };
        } catch (error) {
          alert(`Error al subir ${file.name}: ${error.message}`);
          return null;
        }
      });

      const fotosSubidas = await Promise.all(uploadPromises);
      const fotosValidas = fotosSubidas.filter(foto => foto !== null);

      if (fotosValidas.length > 0) {
        setOrden(prev => ({
          ...prev,
          fotos: [...prev.fotos, ...fotosValidas]
        }));
        alert(`${fotosValidas.length} foto(s) subida(s) exitosamente.`);
      }
    } catch (error) {
      console.error('Error al procesar fotos:', error);
      alert('Error al procesar las fotos.');
    } finally {
      setSubiendoFoto(false);
      e.target.value = ''; // Limpiar input
    }
  };

  const removeFoto = (id) => {
    setOrden(prev => ({
      ...prev,
      fotos: prev.fotos.filter(foto => foto.id !== id)
    }));
  };

  // Función para capturar firma - MEJORADA para mejor respuesta
  const capturarFirma = (tipo) => {
    const sigCanvas = tipo === 'tecnico' ? firmaTecnicoRef.current : firmaClienteRef.current;
    if (!sigCanvas) {
      alert('Error: Canvas de firma no disponible');
      return;
    }

    if (sigCanvas.isEmpty()) {
      alert('Por favor dibuje la firma antes de capturar.');
      return;
    }

    try {
      // Configurar calidad del canvas antes de exportar
      const canvas = sigCanvas.getCanvas();
      const context = canvas.getContext('2d');

      // Mejorar la calidad de exportación
      const firmaDataURL = sigCanvas.toDataURL('image/png', 1.0);

      setFirmas(prev => ({
        ...prev,
        [tipo]: {
          ...prev[tipo],
          firma: firmaDataURL
        }
      }));

      console.log(`Firma ${tipo} capturada exitosamente`);
    } catch (error) {
      console.error('Error al capturar firma:', error);
      alert('Error al capturar la firma. Inténtelo de nuevo.');
    }
  };

  const limpiarFirma = (tipo) => {
    const sigCanvas = tipo === 'tecnico' ? firmaTecnicoRef.current : firmaClienteRef.current;
    if (!sigCanvas) return;

    sigCanvas.clear();
    setFirmas(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        firma: null
      }
    }));
  };

  const handleAclaracionChange = (tipo, value) => {
    setFirmas(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        aclaracion: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDACIÓN: Verificar que hay cliente asignado para clientes existentes
    if (tipoCliente === 'existente' && !orden.clienteId) {
      alert('Por favor, selecciona un cliente del sistema.');
      return;
    }

    // Validaciones
    if (!orden.numero || !orden.cliente.empresa || !orden.cliente.nombre) {
      alert('Por favor completa: Empresa y Contacto del cliente');
      return;
    }

    if (!orden.tareasRealizadas.trim()) {
      alert('Por favor describe las tareas realizadas');
      return;
    }

    if (!orden.fechaTrabajo) {
      alert('Por favor especifica la fecha del trabajo');
      return;
    }

    if (orden.tecnicos.some(t => !t.nombre.trim())) {
      alert('Por favor completa el nombre de todos los técnicos');
      return;
    }

    setGuardando(true);

    try {
      const ordenData = {
        numero: orden.numero,
        clienteId: orden.clienteId || null, // ← CAMPO CRÍTICO
        tipoCliente: tipoCliente, // Para referencia
        cliente: orden.cliente,
        fechaTrabajo: orden.fechaTrabajo,
        horarioInicio: orden.horarioInicio,
        horarioFin: orden.horarioFin,
        tecnicos: orden.tecnicos.filter(t => t.nombre.trim()),
        tareasRealizadas: orden.tareasRealizadas,
        fotos: orden.fotos,
        firmas: firmas,
        empresa: 'IMSSE INGENIERÍA S.A.S',
        usuarioCreador: user.email,
        creadoPor: user.email,
        fechaCreacion: new Date(),
        fechaModificacion: new Date()
      };

      console.log('Guardando orden con datos:', ordenData);

      await apiService.crearOrdenTrabajo(ordenData);
      alert('✅ Orden de trabajo creada exitosamente');
      router.push('/admin/ordenes');
    } catch (error) {
      console.error('Error al crear orden de trabajo:', error);
      alert('❌ Error al crear la orden. Inténtelo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando formulario IMSSE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header IMSSE */}
      <header className="text-white shadow bg-primary">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/logo/imsse-logo.png"
                alt="IMSSE Logo"
                className="w-6 h-6 mr-2 md:w-8 md:h-8 md:mr-3"
              />
              <h1 className="text-lg font-bold md:text-xl font-montserrat">IMSSE</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="hidden text-sm md:inline">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center p-2 text-white rounded-md hover:bg-red-700"
              >
                <LogOut size={16} className="md:mr-2" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center text-sm">
              <Link href="/admin/panel-control" className="text-primary hover:underline">
                <Home size={14} className="inline mr-1" />
                Panel
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <Link href="/admin/ordenes" className="text-primary hover:underline">
                Órdenes
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="font-medium text-gray-700">Nueva</span>
            </div>

            <div className="flex space-x-2">
              <Link
                href="/admin/ordenes"
                className="flex items-center px-3 py-2 text-sm text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300 md:px-4"
              >
                <ArrowLeft size={16} className="mr-1 md:mr-2" />
                Cancelar
              </Link>
              {orden.cliente.empresa && orden.tareasRealizadas && (
                <button
                  onClick={() => setMostrarPDF(true)}
                  className="flex items-center px-3 py-2 text-sm text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 md:px-4"
                >
                  <Download size={16} className="mr-1 md:mr-2" />
                  Ver PDF
                </button>
              )}
              <button
                type="submit"
                form="orden-form"
                disabled={guardando}
                className="flex items-center px-3 py-2 text-sm text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50 md:px-4"
              >
                <Save size={16} className="mr-1 md:mr-2" />
                {guardando ? 'Creando...' : 'Crear Orden'}
              </button>

              {/* PDF bajo demanda */}
              {mostrarPDF && (
                <div style={{ position: 'absolute', left: '-9999px' }}>
                  <PDFDownloadLink
                    document={<OrdenTrabajoPDF orden={orden} />}
                    fileName={`${orden.numero}.pdf`}
                  >
                    {({ blob, url, loading, error }) => {
                      if (url) {
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${orden.numero}.pdf`;
                        link.click();
                        setMostrarPDF(false);
                      }
                      return null;
                    }}
                  </PDFDownloadLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl px-4 py-6 mx-auto">
        {/* Título */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Shield size={28} className="text-purple-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold md:text-2xl font-montserrat text-primary">
            Nueva Orden de Trabajo
          </h2>
          <p className="text-sm text-gray-600 md:text-base">
            Documenta el trabajo realizado por IMSSE
          </p>
        </div>

        <form id="orden-form" onSubmit={handleSubmit} className="space-y-6">

          {/* Información básica */}
          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <FileText size={20} className="mr-2 text-primary" />
              Información Básica
            </h3>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Número de Orden</label>
              <input
                type="text"
                name="numero"
                value={orden.numero}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                readOnly
              />
            </div>
          </div>

          {/* NUEVA SECCIÓN: Selección de Cliente */}
          <div className="p-4 text-gray-700 bg-white border-l-4 border-green-500 rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <User className="mr-2" size={20} />
              Selección de Cliente
            </h3>

            {/* Toggle entre cliente existente y manual */}
            <div className="mb-6">
              <div className="flex mb-4 space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tipoCliente"
                    value="existente"
                    checked={tipoCliente === 'existente'}
                    onChange={() => handleCambiarTipoCliente('existente')}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Cliente del sistema</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tipoCliente"
                    value="manual"
                    checked={tipoCliente === 'manual'}
                    onChange={() => handleCambiarTipoCliente('manual')}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Cliente nuevo (manual)</span>
                </label>
              </div>

              {/* Selector de cliente existente */}
              {tipoCliente === 'existente' && (
                <div className="p-4 rounded-lg bg-green-50">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Seleccionar cliente registrado *
                  </label>
                  <select
                    value={orden.clienteId}
                    onChange={(e) => handleSeleccionarCliente(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    disabled={cargandoClientes}
                  >
                    <option value="">
                      {cargandoClientes ? 'Cargando clientes...' : 'Seleccionar cliente...'}
                    </option>
                    {clientesDisponibles.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.empresa} - {cliente.nombreCompleto}
                      </option>
                    ))}
                  </select>

                  {/* Información del cliente seleccionado */}
                  {clienteSeleccionado && (
                    <div className="p-3 mt-3 bg-white border border-green-200 rounded">
                      <div className="text-sm">
                        <p className="font-medium">{clienteSeleccionado.nombreCompleto}</p>
                        <p className="text-gray-600">{clienteSeleccionado.email}</p>
                        {clienteSeleccionado.telefono && (
                          <p className="text-gray-600">{clienteSeleccionado.telefono}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {clientesDisponibles.length === 0 && !cargandoClientes && (
                    <p className="mt-2 text-sm text-yellow-600">
                      No hay clientes activos en el sistema.
                      <Link href="/admin/usuarios" className="underline hover:text-yellow-800">
                        Crear cliente aquí
                      </Link>
                    </p>
                  )}
                </div>
              )}

              {/* Modo manual */}
              {tipoCliente === 'manual' && (
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="mb-3 text-sm text-gray-600">
                    Los datos se ingresarán manualmente y no se asignará a un usuario del sistema.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cliente */}
          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <Building2 size={20} className="mr-2 text-primary" />
              Datos del Cliente
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Empresa *</label>
                <input
                  type="text"
                  name="cliente.empresa"
                  value={orden.cliente.empresa}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nombre de la empresa"
                  required
                  disabled={tipoCliente === 'existente' && clienteSeleccionado}
                />
                {tipoCliente === 'existente' && clienteSeleccionado && (
                  <p className="mt-1 text-xs text-green-600">
                    ✅ Auto-completado desde el cliente seleccionado
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Contacto Principal *</label>
                <input
                  type="text"
                  name="cliente.nombre"
                  value={orden.cliente.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nombre del contacto"
                  required
                  disabled={tipoCliente === 'existente' && clienteSeleccionado}
                />
                {tipoCliente === 'existente' && clienteSeleccionado && (
                  <p className="mt-1 text-xs text-green-600">
                    ✅ Auto-completado desde el cliente seleccionado
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Dirección del Trabajo</label>
                <div className="relative">
                  <MapPin className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    name="cliente.direccion"
                    value={orden.cliente.direccion}
                    onChange={handleInputChange}
                    className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Dirección donde se realizó el trabajo"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  💡 La dirección siempre es editable (específica para cada trabajo)
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Solicitado por</label>
                <input
                  type="text"
                  name="cliente.solicitadoPor"
                  value={orden.cliente.solicitadoPor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Quien solicitó el trabajo"
                />
              </div>
            </div>

            {/* Indicadores de asignación */}
            {tipoCliente === 'existente' && clienteSeleccionado && (
              <div className="p-3 mt-4 border border-green-200 rounded-md bg-green-50">
                <p className="text-sm text-green-800">
                  ✅ <strong>Orden será asignada a:</strong> {clienteSeleccionado.empresa}
                  <br />
                  <span className="text-green-600">El cliente podrá ver esta orden en su panel.</span>
                </p>
              </div>
            )}

            {tipoCliente === 'manual' && (
              <div className="p-3 mt-4 border border-yellow-200 rounded-md bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Modo manual:</strong> Esta orden no estará visible para ningún cliente en el sistema.
                </p>
              </div>
            )}
          </div>

          {/* Fecha y horarios */}
          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <Calendar size={20} className="mr-2 text-primary" />
              Fecha y Horarios
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Fecha de Trabajo *</label>
                <input
                  type="date"
                  name="fechaTrabajo"
                  value={orden.fechaTrabajo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Hora Inicio</label>
                  <div className="relative">
                    <Clock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="time"
                      name="horarioInicio"
                      value={orden.horarioInicio}
                      onChange={handleInputChange}
                      className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Hora Fin</label>
                  <div className="relative">
                    <Clock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="time"
                      name="horarioFin"
                      value={orden.horarioFin}
                      onChange={handleInputChange}
                      className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Técnicos */}
          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <Users size={20} className="mr-2 text-primary" />
              Técnicos que Trabajaron
            </h3>

            {orden.tecnicos.map((tecnico, index) => (
              <div key={index} className="p-4 mb-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Nombre del Técnico *</label>
                    <input
                      type="text"
                      value={tecnico.nombre}
                      onChange={(e) => handleTecnicoChange(index, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Nombre completo"
                      required
                    />
                  </div>

                  {orden.tecnicos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTecnico(index)}
                      className="flex items-center px-3 py-2 text-sm text-red-600 transition-colors border border-red-300 rounded-md hover:bg-red-50"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Quitar Técnico
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addTecnico}
              className="flex items-center w-full px-4 py-3 text-blue-600 transition-colors border border-blue-300 rounded-md hover:bg-blue-50"
            >
              <Plus size={20} className="mr-2" />
              Agregar Otro Técnico
            </button>
          </div>

          {/* Tareas realizadas */}
          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <CheckCircle size={20} className="mr-2 text-primary" />
              Tareas Realizadas
            </h3>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Descripción de los Trabajos Realizados *</label>
              <textarea
                name="tareasRealizadas"
                value={orden.tareasRealizadas}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe detalladamente todos los trabajos realizados, materiales utilizados, observaciones, etc."
                rows={6}
                required
              />
            </div>
          </div>

          {/* Fotos del trabajo */}
          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <Camera size={20} className="mr-2 text-primary" />
              Fotos del Trabajo
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Subir Fotos (Opcional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFotoUpload}
                    disabled={subiendoFoto}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {subiendoFoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-md">
                      <div className="flex items-center">
                        <Upload className="w-5 h-5 mr-2 animate-spin text-primary" />
                        <span className="text-sm text-primary">Subiendo...</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Máximo 10MB por foto. Formatos: JPG, PNG, GIF
                </p>
              </div>

              {/* Previsualización de fotos */}
              {orden.fotos.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700">
                    Fotos Subidas ({orden.fotos.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {orden.fotos.map((foto) => (
                      <div key={foto.id} className="relative group">
                        <img
                          src={foto.url}
                          alt={foto.nombre}
                          className="object-cover w-full h-24 border border-gray-200 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeFoto(foto.id)}
                          className="absolute p-1 text-white bg-red-500 rounded-full top-1 right-1"
                        >
                          <Trash2 size={12} />
                        </button>
                        <p className="mt-1 text-xs text-gray-500 truncate">
                          {foto.nombre}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Firmas digitales */}
          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <PenTool size={20} className="mr-2 text-primary" />
              Firmas Digitales
            </h3>

            <div className="space-y-6">
              {/* Firma del técnico */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Firma del Técnico
                </label>
                <div className="flex justify-center">
                  <div className="w-full max-w-lg p-3 bg-white border-2 border-gray-300 rounded-md">
                    <SignatureCanvas
                      ref={firmaTecnicoRef}
                      canvasProps={{
                        width: 400,
                        height: 150,
                        className: 'signature-canvas border border-gray-200 rounded',
                        style: {
                          width: '100%',
                          height: '150px',
                          touchAction: 'none'
                        }
                      }}
                      backgroundColor="#f9fafb"
                      penColor="#000000"
                      dotSize={2}
                      minWidth={1}
                      maxWidth={3}
                      velocityFilterWeight={0.7}
                      onEnd={() => {
                        // Opcional: callback cuando termina de firmar
                      }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Aclaración</label>
                  <input
                    type="text"
                    value={firmas.tecnico.aclaracion}
                    onChange={(e) => handleAclaracionChange('tecnico', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nombre completo del técnico"
                  />
                </div>
                <div className="flex justify-center mt-3 space-x-2">
                  <button
                    type="button"
                    onClick={() => capturarFirma('tecnico')}
                    className="flex items-center px-4 py-2 text-sm text-green-600 transition-colors border border-green-300 rounded-md hover:bg-green-50"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Confirmar Firma
                  </button>
                  <button
                    type="button"
                    onClick={() => limpiarFirma('tecnico')}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Limpiar
                  </button>
                </div>
                {firmas.tecnico.firma && (
                  <div className="p-2 mt-3 border border-green-200 rounded-md bg-green-50">
                    <p className="text-sm font-medium text-green-700">✓ Firma del técnico capturada exitosamente</p>
                  </div>
                )}
              </div>

              {/* Firma del cliente */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Firma del Cliente (Conformidad)
                </label>
                <div className="flex justify-center">
                  <div className="w-full max-w-lg p-3 bg-white border-2 border-gray-300 rounded-md">
                    <SignatureCanvas
                      ref={firmaClienteRef}
                      canvasProps={{
                        width: 400,
                        height: 150,
                        className: 'signature-canvas border border-gray-200 rounded',
                        style: {
                          width: '100%',
                          height: '150px',
                          touchAction: 'none'
                        }
                      }}
                      backgroundColor="#f9fafb"
                      penColor="#000000"
                      dotSize={2}
                      minWidth={1}
                      maxWidth={3}
                      velocityFilterWeight={0.7}
                      onEnd={() => {
                        // Opcional: callback cuando termina de firmar
                      }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Aclaración</label>
                  <input
                    type="text"
                    value={firmas.cliente.aclaracion}
                    onChange={(e) => handleAclaracionChange('cliente', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nombre completo del cliente"
                  />
                </div>
                <div className="flex justify-center mt-3 space-x-2">
                  <button
                    type="button"
                    onClick={() => capturarFirma('cliente')}
                    className="flex items-center px-4 py-2 text-sm text-green-600 transition-colors border border-green-300 rounded-md hover:bg-green-50"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Confirmar Firma
                  </button>
                  <button
                    type="button"
                    onClick={() => limpiarFirma('cliente')}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Limpiar
                  </button>
                </div>
                {firmas.cliente.firma && (
                  <div className="p-2 mt-3 border border-green-200 rounded-md bg-green-50">
                    <p className="text-sm font-medium text-green-700">✓ Firma del cliente capturada exitosamente</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones finales */}
          <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200 shadow-lg md:static md:shadow-none md:border-0 md:bg-transparent">
            <div className="flex space-x-3">
              <Link
                href="/admin/ordenes"
                className="flex-1 px-4 py-3 text-center text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100 md:flex-none md:px-6"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={guardando}
                className="flex items-center justify-center flex-1 px-4 py-3 text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50 md:flex-none md:px-6"
              >
                <Save size={18} className="mr-2" />
                {guardando ? 'Creando...' : 'Crear Orden'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}