// app/admin/ordenes/editar/[id]/page.jsx - Editar Orden de Trabajo IMSSE
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  LogOut,
  Save,
  Download,
  RefreshCw,
  Eye,
  Shield,
  User,
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
  FileText
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../../../lib/firebase';
import apiService from '../../../../../lib/services/apiService';
import { use } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function EditarOrdenTrabajo({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  // Referencias para firmas
  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  // Estado del formulario
  const [orden, setOrden] = useState({
    numero: '',
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
    tecnicos: [{ nombre: '' }],
    tareasRealizadas: '',
    fotos: []
  });

  // Estado para firmas
  const [firmas, setFirmas] = useState({
    tecnico: { firma: null, aclaracion: '' },
    cliente: { firma: null, aclaracion: '' }
  });

  // Estado para mostrar canvas de firma
  const [mostrarCanvasTecnico, setMostrarCanvasTecnico] = useState(false);
  const [mostrarCanvasCliente, setMostrarCanvasCliente] = useState(false);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const ordenData = await apiService.obtenerOrdenTrabajoPorId(id);

          if (ordenData) {
            setOrden({
              numero: ordenData.numero || '',
              cliente: {
                empresa: ordenData.cliente?.empresa || '',
                nombre: ordenData.cliente?.nombre || '',
                telefono: ordenData.cliente?.telefono || '',
                direccion: ordenData.cliente?.direccion || '',
                solicitadoPor: ordenData.cliente?.solicitadoPor || ''
              },
              fechaTrabajo: ordenData.fechaTrabajo || '',
              horarioInicio: ordenData.horarioInicio || '',
              horarioFin: ordenData.horarioFin || '',
              tecnicos: ordenData.tecnicos?.length > 0 ? ordenData.tecnicos : [{ nombre: '' }],
              tareasRealizadas: ordenData.tareasRealizadas || '',
              fotos: ordenData.fotos || []
            });

            setFirmas({
              tecnico: {
                firma: ordenData.firmas?.tecnico?.firma || null,
                aclaracion: ordenData.firmas?.tecnico?.aclaracion || ''
              },
              cliente: {
                firma: ordenData.firmas?.cliente?.firma || null,
                aclaracion: ordenData.firmas?.cliente?.aclaracion || ''
              }
            });
          } else {
            alert('Orden de trabajo no encontrada.');
            router.push('/admin/ordenes');
          }

          setLoading(false);
        } catch (error) {
          console.error('Error al cargar orden de trabajo IMSSE:', error);
          alert('Error al cargar los datos de la orden.');
          router.push('/admin/ordenes');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleDescargarPDF = async () => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: OrdenTrabajoPDF } = await import('../../../../components/pdf/OrdenTrabajoPDF');

      const blob = await pdf(<OrdenTrabajoPDF orden={{...orden, firmas}} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${orden.numero}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
      alert(`✅ Orden ${orden.numero} descargada exitosamente`);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrden(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setOrden(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTecnicoChange = (index, value) => {
    const updatedTecnicos = orden.tecnicos.map((tecnico, i) =>
      i === index ? { nombre: value } : tecnico
    );
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

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'ordenes_trabajo');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error('Error al subir la imagen');
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
        if (file.size > 10 * 1024 * 1024) {
          alert(`La foto ${file.name} es muy grande. Máximo 10MB por foto.`);
          return null;
        }

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
      e.target.value = '';
    }
  };

  const removeFoto = (id) => {
    setOrden(prev => ({
      ...prev,
      fotos: prev.fotos.filter(foto => foto.id !== id)
    }));
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

      setFirmas(prev => ({
        ...prev,
        [tipo]: { ...prev[tipo], firma: firmaDataURL }
      }));

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
    setFirmas(prev => ({
      ...prev,
      [tipo]: { ...prev[tipo], firma: null }
    }));

    if (tipo === 'tecnico') {
      setMostrarCanvasTecnico(false);
    } else {
      setMostrarCanvasCliente(false);
    }
  };

  const handleAclaracionChange = (tipo, value) => {
    setFirmas(prev => ({
      ...prev,
      [tipo]: { ...prev[tipo], aclaracion: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        cliente: orden.cliente,
        fechaTrabajo: orden.fechaTrabajo,
        horarioInicio: orden.horarioInicio,
        horarioFin: orden.horarioFin,
        tecnicos: orden.tecnicos.filter(t => t.nombre.trim()),
        tareasRealizadas: orden.tareasRealizadas,
        fotos: orden.fotos,
        firmas: firmas,
        empresa: 'IMSSE INGENIERÍA S.A.S'
      };

      await apiService.actualizarOrdenTrabajo(id, ordenData);
      alert('✅ Orden de trabajo actualizada exitosamente');
      router.push('/admin/ordenes');
    } catch (error) {
      console.error('Error al actualizar orden de trabajo:', error);
      alert('❌ Error al actualizar la orden. Inténtelo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando orden de trabajo IMSSE...</p>
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
              <span className="font-medium text-gray-700">Editar</span>
            </div>

            <div className="flex space-x-2">
              <Link
                href={`/admin/ordenes/${id}`}
                className="flex items-center px-3 py-2 text-sm text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 md:px-4"
              >
                <Eye size={16} className="mr-1 md:mr-2" />
                Ver
              </Link>
              {orden.cliente.empresa && orden.tareasRealizadas && (
                <button
                  onClick={handleDescargarPDF}
                  className="flex items-center px-3 py-2 text-sm text-white transition-colors bg-purple-600 rounded-md hover:bg-purple-700 md:px-4"
                >
                  <Download size={16} className="mr-1 md:mr-2" />
                  PDF
                </button>
              )}
              <button
                type="submit"
                form="orden-form"
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
        {/* Título */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield size={28} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold md:text-2xl font-montserrat text-primary">
            Editar Orden de Trabajo {orden.numero}
          </h2>
          <p className="text-sm text-gray-600 md:text-base">
            Actualiza los datos del trabajo realizado por IMSSE
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
                className="w-full px-4 py-3 text-lg bg-gray-100 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                readOnly
              />
            </div>
          </div>

          {/* Cliente */}
          <div className="p-4 text-gray-700 rounded-lg shadow-md bg-w hite md:p-6">
            <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
              <User size={20} className="mr-2 text-primary" />
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
                />
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
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  name="cliente.telefono"
                  value={orden.cliente.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+54 351 123 4567"
                />
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
                  Agregar Más Fotos (Opcional)
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
                    Fotos Actuales ({orden.fotos.length})
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
                          className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full top-1 right-1 group-hover:opacity-100"
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

                {/* Mostrar firma existente o canvas */}
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

                {firmas.tecnico.firma && !mostrarCanvasTecnico && (
                  <div className="p-2 mt-3 border border-green-200 rounded-md bg-green-50">
                    <p className="text-sm font-medium text-green-700">✓ Firma del técnico guardada</p>
                  </div>
                )}
              </div>

              {/* Firma del cliente */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Firma del Cliente (Conformidad)
                </label>

                {/* Mostrar firma existente o canvas */}
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

                {firmas.cliente.firma && !mostrarCanvasCliente && (
                  <div className="p-2 mt-3 border border-green-200 rounded-md bg-green-50">
                    <p className="text-sm font-medium text-green-700">✓ Firma del cliente guardada</p>
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
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>

        {/* Información IMSSE */}
        <div className="p-6 mt-8 text-center bg-white border border-red-200 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Edición de órdenes de trabajo - Sistemas de protección contra incendios</p>
            <p>Especialistas en sistemas contra incendios desde 1994</p>
            <p className="mt-2">
              <span className="font-medium">Certificaciones:</span> Notifier | Mircom | Inim | Secutron | Bosch
            </p>
            <p className="mt-2">
              📧 info@imsseingenieria.com | 🌐 www.imsseingenieria.com | 📍 Córdoba, Argentina
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}