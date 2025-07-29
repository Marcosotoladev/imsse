// app/cliente/dashboard/page.jsx - Dashboard simplificado (usa ClienteLayout automático)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Receipt,
  Truck,
  CreditCard,
  Wrench,
  User,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import apiService from '../../lib/services/apiService';

export default function DashboardCliente() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState({
    presupuestos: [],
    recibos: [],
    remitos: [],
    estados: [],
    ordenes: []
  });
  const [estadisticas, setEstadisticas] = useState({});

  // Configuración de tipos de documentos
  const tiposDocumentos = {
    presupuestos: {
      nombre: 'Presupuestos',
      icono: FileText,
      color: 'blue',
      descripcion: 'Cotizaciones y presupuestos de servicios'
    },
    recibos: {
      nombre: 'Recibos',
      icono: Receipt,
      color: 'green',
      descripcion: 'Comprobantes de pago y recibos'
    },
    remitos: {
      nombre: 'Remitos',
      icono: Truck,
      color: 'purple',
      descripcion: 'Documentos de entrega y transporte'
    },
    estados: {
      nombre: 'Estados de Cuenta',
      icono: CreditCard,
      color: 'orange',
      descripcion: 'Resúmenes de cuenta y estados financieros'
    },
    ordenes: {
      nombre: 'Órdenes de Trabajo',
      icono: Wrench,
      color: 'red',
      descripcion: 'Órdenes de trabajo y servicios técnicos'
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await apiService.obtenerPerfilUsuario(currentUser.uid);
          setPerfil(perfilUsuario);
          await cargarDocumentos(perfilUsuario);
        } catch (error) {
          console.error('Error al cargar perfil:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const cargarDocumentos = async (perfilUsuario) => {
    try {
      setLoading(true);
      const documentosData = {};
      const stats = {};
      
      // Mapeo de tipos a métodos de API correctos
      const metodosAPI = {
        presupuestos: 'obtenerPresupuestos',
        recibos: 'obtenerRecibos',
        remitos: 'obtenerRemitos',
        estados: 'obtenerEstadosCuenta',
        ordenes: 'obtenerOrdenesTrabajo'
      };
      
      // Cargar solo los documentos para los que tiene permisos
      for (const [tipo, config] of Object.entries(tiposDocumentos)) {
        if (perfilUsuario.permisos?.[tipo]) {
          try {
            const metodoAPI = metodosAPI[tipo];
            if (metodoAPI && typeof apiService[metodoAPI] === 'function') {
              console.log(`Cargando ${tipo}...`);
              const docs = await apiService[metodoAPI]();
              
              // Manejar diferentes estructuras de respuesta
              let documentosArray = [];
              if (Array.isArray(docs)) {
                documentosArray = docs;
              } else if (docs && docs.documents && Array.isArray(docs.documents)) {
                documentosArray = docs.documents;
              } else if (docs && docs.data && Array.isArray(docs.data)) {
                documentosArray = docs.data;
              } else if (docs && docs.success && docs.documents) {
                documentosArray = docs.documents;
              } else {
                console.warn(`Estructura de respuesta inesperada para ${tipo}:`, docs);
                documentosArray = [];
              }
              
              documentosData[tipo] = documentosArray.slice(0, 5); // Limitamos a 5 para el dashboard
              stats[tipo] = documentosArray.length;
              console.log(`✅ ${tipo}: ${documentosArray.length} documentos cargados`);
            } else {
              console.warn(`❌ Método ${metodoAPI} no encontrado en apiService`);
              documentosData[tipo] = [];
              stats[tipo] = 0;
            }
          } catch (error) {
            console.error(`❌ Error al cargar ${tipo}:`, error.message || error);
            documentosData[tipo] = [];
            stats[tipo] = 0;
          }
        } else {
          documentosData[tipo] = [];
          stats[tipo] = 0;
        }
      }
      
      setDocumentos(documentosData);
      setEstadisticas(stats);
      console.log('📊 Dashboard cargado:', { documentosData, stats });
    } catch (error) {
      console.error('❌ Error general al cargar documentos:', error);
      setDocumentos({
        presupuestos: [],
        recibos: [],
        remitos: [],
        estados: [],
        ordenes: []
      });
      setEstadisticas({});
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getColorClasses = (color) => {
    const colores = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    return colores[color] || colores.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      {/* Bienvenida */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 font-montserrat">
          ¡Bienvenido, {perfil?.nombre}!
        </h2>
        <p className="text-gray-600">
          Gestiona tus documentos y servicios de IMSSE Ingeniería
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
                {perfil?.empresa}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={14} className="mr-2" />
                Cliente desde {formatearFecha(perfil?.fechaCreacion)}
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

      {/* Estadísticas de documentos - Solo mostrar los que tienen acceso */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Object.entries(tiposDocumentos)
          .filter(([tipo, config]) => perfil?.permisos?.[tipo]) // Solo mostrar con permisos
          .map(([tipo, config]) => {
            const cantidad = estadisticas[tipo] || 0;
            const IconoComponente = config.icono;

            return (
              <div
                key={tipo}
                className="p-6 bg-white border-l-4 rounded-lg shadow border-l-blue-500"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${getColorClasses(config.color)}`}>
                    <IconoComponente size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {config.nombre}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {cantidad}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Documentos recientes por categoría */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Object.entries(tiposDocumentos).map(([tipo, config]) => {
          const tienePermiso = perfil?.permisos?.[tipo];
          const docs = documentos[tipo] || [];
          const IconoComponente = config.icono;

          if (!tienePermiso) return null;

          return (
            <div key={tipo} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${getColorClasses(config.color)}`}>
                      <IconoComponente size={20} />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{config.nombre}</h3>
                      <p className="text-sm text-gray-500">{config.descripcion}</p>
                    </div>
                  </div>
                  <Link
                    href={`/cliente/${tipo}`}
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
                              {doc.numero || doc.titulo || doc.id || `${config.nombre} #${index + 1}`}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatearFecha(doc.fechaCreacion || doc.fecha || doc.fechaModificacion)}
                            </span>
                          </div>
                          {(doc.descripcion || doc.cliente || doc.empresa) && (
                            <p className="mt-1 text-xs text-gray-600 truncate">
                              {doc.descripcion || doc.cliente || doc.empresa || ''}
                            </p>
                          )}
                          {(doc.total || doc.monto || doc.importe) && (
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              ${(doc.total || doc.monto || doc.importe || 0).toLocaleString('es-AR')}
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/cliente/${tipo}/${doc.id}`}
                          className="p-2 ml-3 text-gray-400 hover:text-gray-600"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </Link>
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
                      No hay {config.nombre.toLowerCase()} asignados a tu cuenta en este momento.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje si no tiene permisos */}
      {Object.values(perfil?.permisos || {}).every(p => !p) && (
        <div className="p-8 mt-8 text-center bg-white border border-yellow-200 rounded-lg shadow-md">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Acceso pendiente
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Tu cuenta está siendo configurada por nuestro equipo.
            En breve tendrás acceso a tus documentos y servicios.
          </p>
          <div className="mt-6">
            <Link
              href="mailto:info@imsse.com"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-red-700"
            >
              Contactar Soporte
            </Link>
          </div>
        </div>
      )}

      {/* Información de contacto */}
      <div className="p-6 mt-8 text-center bg-white border border-blue-200 rounded-lg shadow-md">
        <div className="text-sm text-gray-600">
          <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
          <p>Sistemas de protección contra incendios</p>
          <p className="mt-2">
            <span className="font-medium">Portal Cliente</span> - 
            Gestión de documentos y servicios
          </p>
          <div className="mt-4 space-y-1">
            <p>📧 info@imsse.com</p>
            <p>📞 +54 351 123 4567</p>
            <p>📍 Córdoba, Argentina</p>
          </div>
        </div>
      </div>

      {/* Estado de permisos - Solo mostrar servicios disponibles */}
      <div className="p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          Servicios disponibles:
        </h4>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(tiposDocumentos)
            .filter(([tipo, config]) => perfil?.permisos?.[tipo]) // Solo mostrar con permisos
            .map(([tipo, config]) => {
              const IconoComponente = config.icono;
              
              return (
                <div
                  key={tipo}
                  className="flex items-center p-2 text-xs text-green-800 bg-green-100 rounded"
                >
                  <IconoComponente size={14} className="mr-2" />
                  <span className="truncate">{config.nombre}</span>
                  <CheckCircle size={12} className="ml-auto" />
                </div>
              );
            })}
        </div>
        
        {Object.values(perfil?.permisos || {}).every(p => !p) ? (
          <p className="mt-3 text-xs text-gray-500">
            No tienes servicios habilitados. Contacta a nuestro equipo para solicitar acceso.
          </p>
        ) : (
          <p className="mt-3 text-xs text-gray-500">
            Estos son los servicios habilitados para tu cuenta. 
            Para solicitar acceso adicional, contacta a nuestro equipo.
          </p>
        )}
      </div>
    </div>
  );
}