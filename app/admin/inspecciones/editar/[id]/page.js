// app/admin/inspecciones/editar/[id]/page.js - Editar Visita Técnica (siempre online)
'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  Eye,
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
  PenTool,
  CheckCircle,
  FileText,
  RefreshCw,
  Home,
  ClipboardCheck
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../../lib/firebase';
import apiService from '../../../../../lib/services/apiService';
import tecnicoService from '../../../../../lib/services/tecnicoService';
import { uploadToCloudinary } from '../../../../../lib/cloudinary';
import PlanillasAdjuntas from '../../../../components/inspecciones/PlanillasAdjuntas';
import SignatureCanvas from 'react-signature-canvas';
import { extraerObservacionesChecklist, sincronizarObservaciones } from '../../../../../lib/utils/observacionesChecklist';

export default function EditarInspeccionTecnica({ params }) {
  const { id } = use(params);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const router = useRouter();

  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [tipoCliente, setTipoCliente] = useState('existente');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [empresaDelCliente, setEmpresaDelCliente] = useState(null);

  const [plantillasDisponibles, setPlantillasDisponibles] = useState([]);
  const [planillasAdjuntas, setPlanillasAdjuntas] = useState([]);
  const [tecnicosDisponibles, setTecnicosDisponibles] = useState([]);

  // Fotos ya guardadas en Cloudinary (vienen con `url` real). Se pueden quitar
  // de la lista pero no se re-suben. Las fotos nuevas quedan como File locales
  // hasta el guardado, igual que en "nueva".
  const [fotosExistentes, setFotosExistentes] = useState([]);
  const [fotos, setFotos] = useState([]);

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);
  const observacionesChecklistRef = useRef(new Map());
  const [mostrarCanvasTecnico, setMostrarCanvasTecnico] = useState(false);
  const [mostrarCanvasCliente, setMostrarCanvasCliente] = useState(false);

  const [inspeccion, setInspeccion] = useState({
    numero: '',
    clienteId: '',
    cliente: {
      empresa: '',
      nombre: '',
      telefono: '',
      direccion: '',
      sedeNombre: '',
      solicitadoPor: ''
    },
    fechaTrabajo: '',
    horarioInicio: '',
    horarioFin: '',
    tecnicos: [{ nombre: '' }],
    observaciones: ''
  });

  const [firmas, setFirmas] = useState({
    tecnico: { firma: null, aclaracion: '' },
    cliente: { firma: null, aclaracion: '' }
  });

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);

          if (!['admin', 'tecnico'].includes(perfilUsuario.rol)) {
            router.push('/cliente/dashboard');
            return;
          }

          setUser(currentUser);
          setPerfil(perfilUsuario);

          const [{ clientes, empresas }, inspeccionData] = await Promise.all([
            cargarClientesDisponibles(perfilUsuario),
            apiService.obtenerInspeccionTecnicaPorId(id)
          ]);
          cargarPlantillas();
          cargarTecnicos();

          if (!inspeccionData) {
            alert('Visita técnica no encontrada.');
            router.push('/admin/inspecciones');
            return;
          }

          setInspeccion({
            numero: inspeccionData.numero || '',
            clienteId: inspeccionData.clienteId || '',
            cliente: {
              empresa: inspeccionData.cliente?.empresa || '',
              nombre: inspeccionData.cliente?.nombre || '',
              telefono: inspeccionData.cliente?.telefono || '',
              direccion: inspeccionData.cliente?.direccion || '',
              sedeNombre: inspeccionData.cliente?.sedeNombre || '',
              solicitadoPor: inspeccionData.cliente?.solicitadoPor || ''
            },
            fechaTrabajo: inspeccionData.fechaTrabajo || '',
            horarioInicio: inspeccionData.horarioInicio || '',
            horarioFin: inspeccionData.horarioFin || '',
            tecnicos: inspeccionData.tecnicos?.length > 0 ? inspeccionData.tecnicos : [{ nombre: '' }],
            observaciones: inspeccionData.observaciones || ''
          });

          setFirmas({
            tecnico: {
              firma: inspeccionData.firmas?.tecnico?.firma || null,
              aclaracion: inspeccionData.firmas?.tecnico?.aclaracion || ''
            },
            cliente: {
              firma: inspeccionData.firmas?.cliente?.firma || null,
              aclaracion: inspeccionData.firmas?.cliente?.aclaracion || ''
            }
          });

          setPlanillasAdjuntas(inspeccionData.planillasAdjuntas || []);
          setFotosExistentes(inspeccionData.fotos || []);

          const tipo = inspeccionData.tipoCliente || (inspeccionData.clienteId ? 'existente' : 'manual');
          setTipoCliente(tipo);

          if (inspeccionData.clienteId) {
            const clienteEncontrado = clientes.find(c => c.id === inspeccionData.clienteId);
            if (clienteEncontrado) {
              setClienteSeleccionado(clienteEncontrado);
              const empresa = empresas.find(e => e.id === clienteEncontrado.empresaId) || null;
              setEmpresaDelCliente(empresa);
            }
          }

          setLoading(false);
        } catch (error) {
          console.error('Error al cargar la inspección técnica:', error);
          alert('Error al cargar los datos de la visita.');
          router.push('/admin/inspecciones');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  const cargarPlantillas = async () => {
    try {
      const response = await apiService.obtenerPlantillasInspeccion();
      setPlantillasDisponibles(response?.documents || []);
    } catch (error) {
      console.error('Error al cargar las plantillas:', error);
      setPlantillasDisponibles([]);
    }
  };

  const cargarTecnicos = async () => {
    try {
      const response = await tecnicoService.obtenerTecnicos();
      setTecnicosDisponibles(response?.users || response?.tecnicos || []);
    } catch (error) {
      console.error('Error al cargar los técnicos:', error);
      setTecnicosDisponibles([]);
    }
  };

  const cargarClientesDisponibles = async (perfilUsuario) => {
    setCargandoClientes(true);
    try {
      let clientes = [];

      if (perfilUsuario && perfilUsuario.rol === 'tecnico') {
        const clientesData = await tecnicoService.obtenerClientes();
        clientes = clientesData.users || clientesData.clientes || [];
      } else {
        const usuariosData = await apiService.obtenerUsuarios();
        clientes = usuariosData.users.filter(u =>
          u.rol === 'cliente' && u.estado === 'activo'
        );
      }

      setClientesDisponibles(clientes);

      let empresas = [];
      try {
        const empresasData = await apiService.obtenerEmpresas();
        empresas = empresasData.empresas || [];
        setEmpresasDisponibles(empresas);
      } catch (empresaError) {
        console.error('Error al cargar empresas:', empresaError);
        setEmpresasDisponibles([]);
      }

      return { clientes, empresas };
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setClientesDisponibles([]);
      return { clientes: [], empresas: [] };
    } finally {
      setCargandoClientes(false);
    }
  };

  const handleSeleccionarCliente = (clienteId) => {
    if (!clienteId) {
      setClienteSeleccionado(null);
      setEmpresaDelCliente(null);
      setInspeccion(prev => ({
        ...prev,
        clienteId: '',
        cliente: { empresa: '', nombre: '', telefono: '', direccion: '', sedeNombre: '', solicitadoPor: '' }
      }));
      return;
    }

    const clienteEncontrado = clientesDisponibles.find(c => c.id === clienteId);
    if (clienteEncontrado) {
      const empresa = empresasDisponibles.find(e => e.id === clienteEncontrado.empresaId) || null;

      setClienteSeleccionado(clienteEncontrado);
      setEmpresaDelCliente(empresa);
      setInspeccion(prev => ({
        ...prev,
        clienteId,
        cliente: {
          empresa: clienteEncontrado.empresa || '',
          nombre: clienteEncontrado.nombreCompleto || '',
          telefono: clienteEncontrado.telefono || '',
          direccion: empresa?.direccionPrincipal || '',
          sedeNombre: '',
          solicitadoPor: ''
        }
      }));
    }
  };

  const handleSeleccionarSede = (sedeId) => {
    if (!sedeId) {
      setInspeccion(prev => ({
        ...prev,
        cliente: { ...prev.cliente, direccion: empresaDelCliente?.direccionPrincipal || '', sedeNombre: '' }
      }));
      return;
    }
    const sede = empresaDelCliente?.sedes?.find(s => s.id === sedeId);
    if (sede) {
      setInspeccion(prev => ({
        ...prev,
        cliente: { ...prev.cliente, direccion: sede.direccion || '', sedeNombre: sede.nombreObra || '' }
      }));
    }
  };

  const handleCambiarTipoCliente = (tipo) => {
    setTipoCliente(tipo);
    if (tipo === 'manual') {
      setClienteSeleccionado(null);
      setEmpresaDelCliente(null);
      setInspeccion(prev => ({
        ...prev,
        clienteId: '',
        cliente: { empresa: '', nombre: '', telefono: '', direccion: '', sedeNombre: '', solicitadoPor: '' }
      }));
    }
  };

  useEffect(() => {
    const configurarCanvas = () => {
      [firmaTecnicoRef, firmaClienteRef].forEach(ref => {
        if (ref.current) {
          const canvas = ref.current.getCanvas();
          if (canvas) {
            canvas.style.touchAction = 'none';
            canvas.style.msTouchAction = 'none';
            canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
            canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
            canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
          }
        }
      });
    };

    const timer = setTimeout(configurarCanvas, 100);
    return () => clearTimeout(timer);
  }, [loading, mostrarCanvasTecnico, mostrarCanvasCliente]);

  // Copia a "Observaciones Generales" las observaciones que se van cargando en los
  // ítems del checklist (una por línea), sin pisar lo que el usuario escriba a mano.
  useEffect(() => {
    const mapaNuevo = extraerObservacionesChecklist(planillasAdjuntas);
    setInspeccion(prev => ({
      ...prev,
      observaciones: sincronizarObservaciones(prev.observaciones, observacionesChecklistRef.current, mapaNuevo)
    }));
    observacionesChecklistRef.current = mapaNuevo;
  }, [planillasAdjuntas]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setInspeccion(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setInspeccion(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTecnicoChange = (index, value) => {
    const updatedTecnicos = inspeccion.tecnicos.map((tecnico, i) => (i === index ? { nombre: value } : tecnico));
    setInspeccion(prev => ({ ...prev, tecnicos: updatedTecnicos }));
  };

  const addTecnico = () => {
    setInspeccion(prev => ({ ...prev, tecnicos: [...prev.tecnicos, { nombre: '' }] }));
  };

  const removeTecnico = (index) => {
    if (inspeccion.tecnicos.length === 1) return;
    setInspeccion(prev => ({ ...prev, tecnicos: prev.tecnicos.filter((_, i) => i !== index) }));
  };

  const handleFotoSeleccionada = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const nuevasFotos = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`La foto ${file.name} es muy grande. Máximo 10MB por foto.`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen válida.`);
        continue;
      }
      nuevasFotos.push({
        id: Date.now() + Math.random(),
        file,
        previewUrl: URL.createObjectURL(file),
        nombre: file.name
      });
    }

    if (nuevasFotos.length > 0) {
      setFotos(prev => [...prev, ...nuevasFotos]);
    }
    e.target.value = '';
  };

  const removeFoto = (id) => {
    setFotos(prev => {
      const foto = prev.find(f => f.id === id);
      if (foto) URL.revokeObjectURL(foto.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const removeFotoExistente = (id) => {
    setFotosExistentes(prev => prev.filter(f => f.id !== id));
  };

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
      const firmaDataURL = sigCanvas.toDataURL('image/png', 1.0);
      setFirmas(prev => ({ ...prev, [tipo]: { ...prev[tipo], firma: firmaDataURL } }));
      if (tipo === 'tecnico') {
        setMostrarCanvasTecnico(false);
      } else {
        setMostrarCanvasCliente(false);
      }
    } catch (error) {
      console.error('Error al capturar firma:', error);
      alert('Error al capturar la firma. Inténtelo de nuevo.');
    }
  };

  const limpiarFirma = (tipo) => {
    const sigCanvas = tipo === 'tecnico' ? firmaTecnicoRef.current : firmaClienteRef.current;
    if (sigCanvas) sigCanvas.clear();
  };

  const eliminarFirma = (tipo) => {
    setFirmas(prev => ({ ...prev, [tipo]: { ...prev[tipo], firma: null } }));
    if (tipo === 'tecnico') {
      setMostrarCanvasTecnico(false);
    } else {
      setMostrarCanvasCliente(false);
    }
  };

  const handleAclaracionChange = (tipo, value) => {
    setFirmas(prev => ({ ...prev, [tipo]: { ...prev[tipo], aclaracion: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tipoCliente === 'existente' && !inspeccion.clienteId) {
      alert('Por favor, selecciona un cliente del sistema.');
      return;
    }

    if (!inspeccion.numero || !inspeccion.cliente.empresa || !inspeccion.cliente.nombre) {
      alert('Por favor completa: Empresa y Contacto del cliente');
      return;
    }

    if (!inspeccion.fechaTrabajo) {
      alert('Por favor especifica la fecha del trabajo');
      return;
    }

    if (inspeccion.tecnicos.some(t => !t.nombre.trim())) {
      alert('Por favor completa el nombre de todos los técnicos');
      return;
    }

    if (planillasAdjuntas.length === 0) {
      alert('Adjuntá al menos una planilla de inspección y completá el checklist.');
      return;
    }

    setGuardando(true);

    try {
      const fotosNuevasSubidas = await Promise.all(
        fotos.map((foto) => uploadToCloudinary(foto.file, 'inspecciones_tecnicas'))
      );

      const datos = {
        numero: inspeccion.numero,
        clienteId: inspeccion.clienteId || null,
        tipoCliente,
        cliente: inspeccion.cliente,
        fechaTrabajo: inspeccion.fechaTrabajo,
        horarioInicio: inspeccion.horarioInicio,
        horarioFin: inspeccion.horarioFin,
        tecnicos: inspeccion.tecnicos.filter(t => t.nombre.trim()),
        observaciones: inspeccion.observaciones,
        planillasAdjuntas,
        fotos: [...fotosExistentes, ...fotosNuevasSubidas],
        firmas,
        empresa: 'IMSSE INGENIERÍA S.A.S'
      };

      await apiService.actualizarInspeccionTecnica(id, datos);
      router.push(`/admin/inspecciones/${id}`);
    } catch (error) {
      console.error('Error al actualizar la inspección técnica:', error);
      alert('❌ Error al actualizar la visita. Inténtelo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando visita técnica IMSSE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center text-sm">
              <Link href="/admin/panel-control" className="text-primary hover:underline">
                <Home size={14} className="inline mr-1" />
                Panel
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <Link href="/admin/inspecciones" className="text-primary hover:underline">
                Visita Técnica
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="font-medium text-gray-700">Editar</span>
            </div>

            <div className="flex space-x-2">
              <Link
                href={`/admin/inspecciones/${id}`}
                className="flex items-center px-3 py-2 text-sm text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 md:px-4"
              >
                <Eye size={16} className="mr-1 md:mr-2" />
                Ver
              </Link>
              <button
                type="submit"
                form="inspeccion-form"
                disabled={guardando}
                className="flex items-center px-3 py-2 text-sm text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50 md:px-4"
              >
                <Save size={16} className="mr-1 md:mr-2" />
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl px-4 py-6 mx-auto">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Shield size={28} className="text-purple-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold md:text-2xl font-montserrat text-primary">
            Editar Visita Técnica {inspeccion.numero}
          </h2>
          <p className="text-sm text-gray-600 md:text-base">
            Actualizá el checklist y los datos correspondientes al sistema inspeccionado
          </p>
        </div>

        <form id="inspeccion-form" onSubmit={handleSubmit} className="space-y-6">

          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <FileText size={20} className="mr-2 text-primary" />
              Información Básica
            </h3>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Número de Visita</label>
              <input
                type="text"
                name="numero"
                value={inspeccion.numero}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="p-4 text-gray-700 bg-white border-l-4 border-green-500 rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <User className="mr-2" size={20} />
              Selección de Cliente
            </h3>

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

              {tipoCliente === 'existente' && (
                <div className="p-4 rounded-lg bg-green-50">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Seleccionar cliente registrado *
                  </label>
                  <select
                    value={inspeccion.clienteId}
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

              {tipoCliente === 'manual' && (
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="mb-3 text-sm text-gray-600">
                    Los datos se ingresarán manualmente y no se asignará a un usuario del sistema.
                  </p>
                </div>
              )}
            </div>
          </div>

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
                  value={inspeccion.cliente.empresa}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nombre de la empresa"
                  required
                  disabled={tipoCliente === 'existente' && clienteSeleccionado}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Contacto Principal *</label>
                <input
                  type="text"
                  name="cliente.nombre"
                  value={inspeccion.cliente.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nombre del contacto"
                  required
                  disabled={tipoCliente === 'existente' && clienteSeleccionado}
                />
              </div>

              {tipoCliente === 'existente' && empresaDelCliente?.sedes?.length > 0 && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Sede</label>
                  <select
                    onChange={(e) => handleSeleccionarSede(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Dirección Principal</option>
                    {empresaDelCliente.sedes.map(sede => (
                      <option key={sede.id} value={sede.id}>{sede.nombreObra}</option>
                    ))}
                  </select>
                  {inspeccion.cliente.sedeNombre && (
                    <p className="mt-1 text-xs text-gray-500">Sede actual: {inspeccion.cliente.sedeNombre}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Dirección del Trabajo</label>
                <div className="relative">
                  <MapPin className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    name="cliente.direccion"
                    value={inspeccion.cliente.direccion}
                    onChange={handleInputChange}
                    className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Dirección donde se realizó la visita"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Solicitado por</label>
                <input
                  type="text"
                  name="cliente.solicitadoPor"
                  value={inspeccion.cliente.solicitadoPor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Quien solicitó la visita"
                />
              </div>
            </div>
          </div>

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
                  value={inspeccion.fechaTrabajo}
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
                      value={inspeccion.horarioInicio}
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
                      value={inspeccion.horarioFin}
                      onChange={handleInputChange}
                      className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <Users size={20} className="mr-2 text-primary" />
              Técnicos que Realizaron la Visita
            </h3>

            {inspeccion.tecnicos.map((tecnico, index) => (
              <div key={index} className="p-4 mb-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Técnico *</label>
                    <select
                      value={tecnico.nombre}
                      onChange={(e) => handleTecnicoChange(index, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar técnico...</option>
                      {tecnicosDisponibles.map((t) => (
                        <option key={t.id} value={t.nombreCompleto || t.nombre}>
                          {t.nombreCompleto || t.nombre}
                        </option>
                      ))}
                      {tecnico.nombre && !tecnicosDisponibles.some((t) => (t.nombreCompleto || t.nombre) === tecnico.nombre) && (
                        <option value={tecnico.nombre}>{tecnico.nombre}</option>
                      )}
                    </select>
                  </div>

                  {inspeccion.tecnicos.length > 1 && (
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

          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <ClipboardCheck size={20} className="mr-2 text-primary" />
              Checklist de Inspección *
            </h3>
            <PlanillasAdjuntas
              plantillasDisponibles={plantillasDisponibles}
              planillasAdjuntas={planillasAdjuntas}
              onChange={setPlanillasAdjuntas}
            />
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <CheckCircle size={20} className="mr-2 text-primary" />
              Observaciones Generales
            </h3>
            <textarea
              name="observaciones"
              value={inspeccion.observaciones}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Se completan solas con las observaciones que cargues en el checklist — podés editarlas o agregar más acá (opcional)"
              rows={4}
            />
          </div>

          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <Camera size={20} className="mr-2 text-primary" />
              Fotos
            </h3>

            <div className="space-y-4">
              {fotosExistentes.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700">
                    Fotos Actuales ({fotosExistentes.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {fotosExistentes.map((foto) => (
                      <div key={foto.id} className="relative group">
                        <img
                          src={foto.url}
                          alt={foto.nombre}
                          className="object-cover w-full h-24 border border-gray-200 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeFotoExistente(foto.id)}
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

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Agregar Fotos Nuevas (Opcional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFotoSeleccionada}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Máximo 10MB por foto. Se suben recién al guardar los cambios.
                </p>
              </div>

              {fotos.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700">
                    Fotos Nuevas ({fotos.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {fotos.map((foto) => (
                      <div key={foto.id} className="relative group">
                        <img
                          src={foto.previewUrl}
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

          <div className="p-4 bg-white rounded-lg shadow-md md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <PenTool size={20} className="mr-2 text-primary" />
              Firmas Digitales
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Firma del Técnico
                </label>

                {firmas.tecnico.firma && !mostrarCanvasTecnico ? (
                  <div className="text-center">
                    <img
                      src={firmas.tecnico.firma}
                      alt="Firma técnico"
                      className="mx-auto mb-4 border border-gray-300 rounded"
                      style={{ maxWidth: '300px', height: '120px', objectFit: 'contain' }}
                    />
                    <div className="flex justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setMostrarCanvasTecnico(true)}
                        className="flex items-center px-4 py-2 text-sm text-blue-600 transition-colors border border-blue-300 rounded-md hover:bg-blue-50"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Cambiar Firma
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarFirma('tecnico')}
                        className="flex items-center px-4 py-2 text-sm text-red-600 transition-colors border border-red-300 rounded-md hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Eliminar Firma
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-center">
                      <div className="w-full max-w-lg p-3 bg-white border-2 border-gray-300 rounded-md">
                        <SignatureCanvas
                          ref={firmaTecnicoRef}
                          canvasProps={{
                            width: 400,
                            height: 150,
                            className: 'signature-canvas border border-gray-200 rounded',
                            style: { width: '100%', height: '150px', touchAction: 'none' }
                          }}
                          backgroundColor="#f9fafb"
                          penColor="#000000"
                          dotSize={2}
                          minWidth={1}
                          maxWidth={3}
                          velocityFilterWeight={0.7}
                        />
                      </div>
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
                      {firmas.tecnico.firma && (
                        <button
                          type="button"
                          onClick={() => setMostrarCanvasTecnico(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-600 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )}

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
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Firma del Cliente (Conformidad)
                </label>

                {firmas.cliente.firma && !mostrarCanvasCliente ? (
                  <div className="text-center">
                    <img
                      src={firmas.cliente.firma}
                      alt="Firma cliente"
                      className="mx-auto mb-4 border border-gray-300 rounded"
                      style={{ maxWidth: '300px', height: '120px', objectFit: 'contain' }}
                    />
                    <div className="flex justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setMostrarCanvasCliente(true)}
                        className="flex items-center px-4 py-2 text-sm text-blue-600 transition-colors border border-blue-300 rounded-md hover:bg-blue-50"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Cambiar Firma
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarFirma('cliente')}
                        className="flex items-center px-4 py-2 text-sm text-red-600 transition-colors border border-red-300 rounded-md hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Eliminar Firma
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-center">
                      <div className="w-full max-w-lg p-3 bg-white border-2 border-gray-300 rounded-md">
                        <SignatureCanvas
                          ref={firmaClienteRef}
                          canvasProps={{
                            width: 400,
                            height: 150,
                            className: 'signature-canvas border border-gray-200 rounded',
                            style: { width: '100%', height: '150px', touchAction: 'none' }
                          }}
                          backgroundColor="#f9fafb"
                          penColor="#000000"
                          dotSize={2}
                          minWidth={1}
                          maxWidth={3}
                          velocityFilterWeight={0.7}
                        />
                      </div>
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
                      {firmas.cliente.firma && (
                        <button
                          type="button"
                          onClick={() => setMostrarCanvasCliente(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-600 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )}

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
              </div>
            </div>
          </div>

          <div className="sticky bottom-16 md:bottom-0 p-4 bg-white border-t border-gray-200 shadow-lg md:static md:shadow-none md:border-0 md:bg-transparent">
            <div className="flex space-x-3">
              <Link
                href="/admin/inspecciones"
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
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
