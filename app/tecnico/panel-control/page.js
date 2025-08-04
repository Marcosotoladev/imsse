// app/admin/dashboard-tecnico/page.jsx - Dashboard específico para técnicos
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  Plus,
  Wrench,
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Building,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/services/apiService';

export default function DashboardTecnico() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState({
    ordenes: [],
    recordatorios: []
  });
  const [estadisticas, setEstadisticas] = useState({
    ordenes: { total: 0, pendientes: 0, completadas: 0, enProceso: 0 },
    recordatorios: { total: 0, hoy: 0, proximos: 0, vencidos: 0 }
  });

  // Configuración de tipos de documentos para técnicos
  const tiposDocumentos = {
    ordenes: {
      nombre: 'Órdenes de Trabajo',
      icono: Wrench,
      color: 'red',
      descripcion: 'Gestión de órdenes de trabajo y servicios técnicos',
      url: '/admin/ordenes'
    },
    recordatorios: {
      nombre: 'Recordatorios',
      icono: Bell,
      color: 'yellow',
      descripcion: 'Recordatorios y notificaciones importantes', 
      url: '/admin/recordatorios'
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);
          
          // Verificar que sea técnico
          if (perfilUsuario.rol !== 'tecnico') {
            if (perfilUsuario.rol === 'admin') {
              router.push('/admin/panel-control');
            } else {
              router.push('/cliente/dashboard');
            }
            return;
          }

          // Verificar estado activo
          if (perfilUsuario.estado !== 'activo') {
            router.push('/admin');
            return;
          }

          setUser(currentUser);
          setPerfil(perfilUsuario);
          await cargarDocumentosTecnico();
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

  const cargarDocumentosTecnico = async () => {
    try {
      setLoading(true);
      const documentosData = {};
      const stats = {
        ordenes: { total: 0, pendientes: 0, completadas: 0, enProceso: 0 },
        recordatorios: { total: 0, hoy: 0, proximos: 0, vencidos: 0 }
      };

      // Cargar órdenes de trabajo - TODAS las órdenes
      try {
        console.log('Cargando órdenes de trabajo...');
        const ordenesResponse = await apiService.obtenerOrdenesTrabajo();
        
        let ordenesArray = [];
        if (Array.isArray(ordenesResponse)) {
          ordenesArray = ordenesResponse;
        } else if (ordenesResponse && ordenesResponse.documents) {
          ordenesArray = ordenesResponse.documents;
        } else if (ordenesResponse && ordenesResponse.data) {
          ordenesArray = ordenesResponse.data;
        }

        documentosData.ordenes = ordenesArray.slice(0, 8); // Mostrar las 8 más recientes
        
        // Calcular estadísticas de órdenes
        stats.ordenes.total = ordenesArray.length;
        stats.ordenes.pendientes = ordenesArray.filter(orden => orden.estado === 'pendiente').length;
        stats.ordenes.enProceso = ordenesArray.filter(orden => orden.estado === 'en_proceso').length;
        stats.ordenes.completadas = ordenesArray.filter(orden => orden.estado === 'completada').length;

        console.log(`✅ Órdenes: ${ordenesArray.length} cargadas`);
      } catch (error) {
        console.error('❌ Error al cargar órdenes:', error);
        documentosData.ordenes = [];
      }

      // Cargar recordatorios - TODOS los recordatorios
      try {
        console.log('Cargando recordatorios...');
        const recordatoriosResponse = await apiService.obtenerRecordatorios();
        
        let recordatoriosArray = [];
        if (Array.isArray(recordatoriosResponse)) {
          recordatoriosArray = recordatoriosResponse;
        } else if (recordatoriosResponse && recordatoriosResponse.documents) {
          recordatoriosArray = recordatoriosResponse.documents;
        } else if (recordatoriosResponse && recordatoriosResponse.data) {
          recordatoriosArray = recordatoriosResponse.data;
        }

        documentosData.recordatorios = recordatoriosArray.slice(0, 8); // Mostrar los 8 más recientes

        // Calcular estadísticas de recordatorios
        const hoy = new Date();
        const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const finHoy = new Date(inicioHoy.getTime() + 24 * 60 * 60 * 1000);
        const proximaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);

        stats.recordatorios.total = recordatoriosArray.length;
        
        recordatoriosArray.forEach(recordatorio => {
          if (recordatorio.fechaRecordatorio) {
            const fechaRecordatorio = new Date(
              recordatorio.fechaRecordatorio.seconds ? 
              recordatorio.fechaRecordatorio.seconds * 1000 : 
              recordatorio.fechaRecordatorio
            );

            if (fechaRecordatorio >= inicioHoy && fechaRecordatorio < finHoy) {
              stats.recordatorios.hoy++;
            } else if (fechaRecordatorio > finHoy && fechaRecordatorio <= proximaSemana) {
              stats.recordatorios.proximos++;
            } else if (fechaRecordatorio < inicioHoy) {
              stats.recordatorios.vencidos++;
            }
          }
        });

        console.log(`✅ Recordatorios: ${recordatoriosArray.length} cargados`);
      } catch (error) {
        console.error('❌ Error al cargar recordatorios:', error);
        documentosData.recordatorios = [];
      }

      setDocumentos(documentosData);
      setEstadisticas(stats);
      console.log('📊 Dashboard técnico cargado:', { documentosData, stats });

    } catch (error) {
      console.error('❌ Error general al cargar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = timestamp.seconds ? 
      new Date(timestamp.seconds * 1000) : 
      new Date(timestamp);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'en_proceso': 'bg-blue-100 text-blue-800', 
      'completada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'completada': 'Completada', 
      'cancelada': 'Cancelada'
    };
    return textos[estado] || estado;
  };

  const obtenerInfoCliente = (doc) => {
    if (!doc) return '';
    
    if (doc.cliente && typeof doc.cliente === 'object') {
      return doc.cliente.empresa || doc.cliente.nombre || '';
    }
    
    if (typeof doc.cliente === 'string') {
      return doc.cliente;
    }
    
    return doc.empresa || doc.nombreEmpresa || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard técnico...</p>
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
              <img
                src="/logo/imsse-logo.png"
                alt="IMSSE Logo"
                className="w-6 h-6 mr-2 md:w-8 md:h-8 md:mr-3"
              />
              <div>
                <h1 className="text-lg font-bold md:text-xl font-montserrat">IMSSE</h1>
                <p className="text-xs text-red-100 md:text-sm">Panel Técnico</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium">{perfil?.nombreCompleto}</p>
                <p className="text-xs text-red-100">Técnico</p>
              </div>
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

      <div className="px-4 py-6 mx-auto max-w-7xl">
        {/* Bienvenida */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 font-montserrat">
            ¡Bienvenido, {perfil?.nombre}!
          </h2>
          <p className="text-gray-600">
            Gestiona todas las órdenes de trabajo y recordatorios del sistema
          </p>
        </div>

        {/* Información del perfil */}
        <div className="p-6 mb-8 bg-white border border-blue-200 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-16 h-16">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <User size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="ml-6">
              <h3 className="text-lg font-medium text-gray-900">{perfil?.nombreCompleto}</h3>
              <div className="mt-1 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Building size={14} className="mr-2" />
                  Técnico IMSSE
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={14} className="mr-2" />
                  Acceso desde {formatearFecha(perfil?.fechaCreacion)}
                </div>
              </div>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                <CheckCircle size={16} className="mr-1" />
                Activo
              </span>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Órdenes - Total */}
          <div className="p-4 bg-white border border-red-200 rounded-lg shadow md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg md:p-3">
                <Wrench size={20} className="text-red-600 md:size-6" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs font-medium text-gray-900 md:text-sm">Total Órdenes</p>
                <p className="text-lg font-bold text-gray-900 md:text-2xl">{estadisticas.ordenes.total}</p>
              </div>
            </div>
          </div>

          {/* Órdenes - Pendientes */}
          <div className="p-4 bg-white border border-yellow-200 rounded-lg shadow md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg md:p-3">
                <Clock size={20} className="text-yellow-600 md:size-6" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs font-medium text-gray-900 md:text-sm">Pendientes</p>
                <p className="text-lg font-bold text-gray-900 md:text-2xl">{estadisticas.ordenes.pendientes}</p>
              </div>
            </div>
          </div>

          {/* Órdenes - En Proceso */}
          <div className="p-4 bg-white border border-blue-200 rounded-lg shadow md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg md:p-3">
                <AlertTriangle size={20} className="text-blue-600 md:size-6" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs font-medium text-gray-900 md:text-sm">En Proceso</p>
                <p className="text-lg font-bold text-gray-900 md:text-2xl">{estadisticas.ordenes.enProceso}</p>
              </div>
            </div>
          </div>

          {/* Órdenes - Completadas */}
          <div className="p-4 bg-white border border-green-200 rounded-lg shadow md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg md:p-3">
                <CheckCircle size={20} className="text-green-600 md:size-6" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs font-medium text-gray-900 md:text-sm">Completadas</p>
                <p className="text-lg font-bold text-gray-900 md:text-2xl">{estadisticas.ordenes.completadas}</p>
              </div>
            </div>
          </div>

          {/* Recordatorios - Total */}
          <div className="p-4 bg-white border border-purple-200 rounded-lg shadow md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg md:p-3">
                <Bell size={20} className="text-purple-600 md:size-6" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs font-medium text-gray-900 md:text-sm">Recordatorios</p>
                <p className="text-lg font-bold text-gray-900 md:text-2xl">{estadisticas.recordatorios.total}</p>
              </div>
            </div>
          </div>

          {/* Recordatorios - Hoy */}
          <div className="p-4 bg-white border border-orange-200 rounded-lg shadow md:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg md:p-3">
                <Calendar size={20} className="text-orange-600 md:size-6" />
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs font-medium text-gray-900 md:text-sm">Hoy</p>
                <p className="text-lg font-bold text-gray-900 md:text-2xl">{estadisticas.recordatorios.hoy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/ordenes/nuevo"
              className="flex items-center p-4 transition-all bg-white border-2 border-red-200 rounded-lg shadow hover:border-red-400 hover:bg-red-50"
            >
              <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
                <Plus size={20} className="text-red-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-red-800">Nueva Orden</h4>
                <p className="text-xs text-red-600">Crear orden de trabajo</p>
              </div>
            </Link>

            <Link
              href="/admin/recordatorios/nuevo"
              className="flex items-center p-4 transition-all bg-white border-2 border-yellow-200 rounded-lg shadow hover:border-yellow-400 hover:bg-yellow-50"
            >
              <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
                <Plus size={20} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-yellow-800">Nuevo Recordatorio</h4>
                <p className="text-xs text-yellow-600">Crear recordatorio</p>
              </div>
            </Link>

            <Link
              href="/admin/ordenes"
              className="flex items-center p-4 transition-all bg-white border-2 border-gray-200 rounded-lg shadow hover:border-gray-400 hover:bg-gray-50"
            >
              <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
                <Wrench size={20} className="text-gray-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-800">Todas las Órdenes</h4>
                <p className="text-xs text-gray-600">Gestionar órdenes</p>
              </div>
            </Link>

            <Link
              href="/admin/recordatorios"
              className="flex items-center p-4 transition-all bg-white border-2 border-gray-200 rounded-lg shadow hover:border-gray-400 hover:bg-gray-50"
            >
              <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
                <Bell size={20} className="text-gray-600" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-800">Todos los Recordatorios</h4>
                <p className="text-xs text-gray-600">Gestionar recordatorios</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Documentos recientes */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Object.entries(tiposDocumentos).map(([tipo, config]) => {
            const docs = documentos[tipo] || [];
            const IconoComponente = config.icono;

            return (
              <div key={tipo} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg bg-${config.color}-100`}>
                        <IconoComponente size={20} className={`text-${config.color}-600`} />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{config.nombre}</h3>
                        <p className="text-sm text-gray-500">{config.descripcion}</p>
                      </div>
                    </div>
                    <Link
                      href={config.url}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Ver todos
                    </Link>
                  </div>
                </div>

                <div className="px-6 py-4">
                  {docs.length > 0 ? (
                    <div className="space-y-3">
                      {docs.map((doc, index) => (
                        <div
                          key={doc.id || index}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900">
                                {tipo === 'ordenes' ? 
                                  `Orden #${doc.numeroOrden || doc.id?.substring(0, 8)}` :
                                  doc.titulo || `Recordatorio #${index + 1}`
                                }
                              </h4>
                              <span className="text-xs text-gray-500">
                                {formatearFecha(doc.fechaCreacion || doc.fechaRecordatorio)}
                              </span>
                            </div>
                            
                            {/* Estado para órdenes */}
                            {tipo === 'ordenes' && doc.estado && (
                              <div className="mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(doc.estado)}`}>
                                  {getEstadoTexto(doc.estado)}
                                </span>
                              </div>
                            )}

                            {/* Descripción */}
                            {(doc.descripcion || obtenerInfoCliente(doc)) && (
                              <p className="mt-1 text-xs text-gray-600 truncate">
                                {doc.descripcion || obtenerInfoCliente(doc)}
                              </p>
                            )}

                            {/* Cliente para órdenes */}
                            {tipo === 'ordenes' && obtenerInfoCliente(doc) && (
                              <p className="mt-1 text-xs text-gray-500">
                                Cliente: {obtenerInfoCliente(doc)}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center ml-3 space-x-1">
                            <Link
                              href={`${config.url}/${doc.id}`}
                              className="p-2 text-gray-400 hover:text-gray-600"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              href={`${config.url}/${doc.id}/editar`}
                              className="p-2 text-gray-400 hover:text-blue-600"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <IconoComponente className="w-12 h-12 mx-auto text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Sin {config.nombre.toLowerCase()} disponibles
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No hay {config.nombre.toLowerCase()} en el sistema.
                      </p>
                      <div className="mt-4">
                        <Link
                          href={`${config.url}/nuevo`}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
                        >
                          <Plus size={16} className="mr-1" />
                          Crear {tipo === 'ordenes' ? 'Orden' : 'Recordatorio'}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Información del sistema */}
        <div className="p-6 mt-8 text-center bg-white border border-blue-200 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Panel Técnico - Gestión completa de órdenes y recordatorios</p>
            <p className="mt-2">
              <span className="font-medium">Técnico:</span> {perfil?.nombreCompleto}
            </p>
            <p className="mt-2 text-xs">
              Tienes acceso completo para ver, crear, editar y eliminar órdenes de trabajo y recordatorios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}