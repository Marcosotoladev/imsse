// app/cliente/panel-control/page.jsx - Panel de Control para Clientes IMSSE (con APIs)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FilePlus,
  FileText,
  CreditCard,
  Receipt,
  FileCheck,
  Shield,
  Bell,
  Settings,
  Clock,
  Building,
  User,
  Eye
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { obtenerPerfilUsuario } from '../../lib/firestore';
import ClienteLayout from '../../components/cliente/ClienteLayout';
import clienteService from '../../lib/services/ClienteService';

export default function ClienteDashboard() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [datosCliente, setDatosCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    presupuestos: 0,
    recibos: 0,
    remitos: 0,
    estadosCuenta: 0,
    ordenesTrabajo: 0,
    recordatorios: 0
  });
  const [modulosPermitidos, setModulosPermitidos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const perfilUsuario = await obtenerPerfilUsuario(currentUser.uid);
          
          // Verificar que sea cliente
          if (perfilUsuario.rol !== 'cliente') {
            router.push('/admin');
            return;
          }
          
          setUser(currentUser);
          setPerfil(perfilUsuario);
          
          // Usar API para obtener datos del cliente
          const authData = await clienteService.verificarAuth();
          setDatosCliente(authData.user.cliente);
          
          // Cargar estadísticas del cliente via API
          await cargarEstadisticasCliente();
          
          // Determinar módulos permitidos
          await cargarModulosPermitidos(authData.user.cliente);
          
        } catch (error) {
          console.error('Error al cargar datos del cliente:', error);
          setLoading(false);
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarEstadisticasCliente = async () => {
    try {
      const response = await clienteService.obtenerEstadisticas();
      setEstadisticas(response.estadisticas);
    } catch (error) {
      console.error('Error al cargar estadísticas del cliente:', error);
    }
  };

  const cargarModulosPermitidos = async (clienteData) => {
    try {
      const todosLosModulos = [
        {
          id: 'presupuestos',
          titulo: 'Presupuestos',
          icono: FileText,
          color: 'bg-red-600',
          colorHover: 'hover:bg-red-700',
          descripcion: 'Cotizaciones recibidas',
          permiso: 'presupuestos',
          rutas: {
            historial: '/cliente/presupuestos'
          }
        },
        {
          id: 'estadosCuenta',
          titulo: 'Estados de Cuenta',
          icono: CreditCard,
          color: 'bg-indigo-600',
          colorHover: 'hover:bg-indigo-700',
          descripcion: 'Resúmenes financieros',
          permiso: 'estadosCuenta',
          rutas: {
            historial: '/cliente/estados-cuenta'
          }
        },
        {
          id: 'recibos',
          titulo: 'Recibos',
          icono: Receipt,
          color: 'bg-green-600',
          colorHover: 'hover:bg-green-700',
          descripcion: 'Comprobantes de pago',
          permiso: 'recibos',
          rutas: {
            historial: '/cliente/recibos'
          }
        },
        {
          id: 'remitos',
          titulo: 'Remitos',
          icono: FileCheck,
          color: 'bg-blue-600',
          colorHover: 'hover:bg-blue-700',
          descripcion: 'Comprobantes de entrega',
          permiso: 'remitos',
          rutas: {
            historial: '/cliente/remitos'
          }
        },
        {
          id: 'ordenes',
          titulo: 'Órdenes de Trabajo',
          icono: Shield,
          color: 'bg-purple-600',
          colorHover: 'hover:bg-purple-700',
          descripcion: 'Trabajos realizados',
          permiso: 'ordenesTrabajo',
          rutas: {
            historial: '/cliente/ordenes'
          }
        },
        {
          id: 'recordatorios',
          titulo: 'Recordatorios',
          icono: Bell,
          color: 'bg-yellow-600',
          colorHover: 'hover:bg-yellow-700',
          descripcion: 'Vencimientos y alertas',
          permiso: 'recordatorios',
          rutas: {
            historial: '/cliente/recordatorios'
          }
        }
      ];

      // Filtrar módulos según permisos del cliente
      const modulosConPermiso = todosLosModulos.filter(modulo => {
        return clienteData.permisos?.[modulo.permiso] === true;
      });

      // Agregar estadísticas a cada módulo
      modulosConPermiso.forEach(modulo => {
        modulo.total = estadisticas[modulo.permiso] || 0;
      });

      setModulosPermitidos(modulosConPermiso);
      setLoading(false);
      
    } catch (error) {
      console.error('Error al cargar módulos permitidos:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClienteLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
            <p className="mt-4">Cargando portal del cliente...</p>
          </div>
        </div>
      </ClienteLayout>
    );
  }

  // Si no hay datos del cliente
  if (!datosCliente) {
    return (
      <ClienteLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md text-center">
            <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">Acceso no autorizado</h3>
            <p className="text-gray-600">
              Su cuenta no está registrada como cliente en nuestro sistema. 
              Contacte al administrador para obtener acceso.
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                📧 info@imsseingenieria.com
              </p>
            </div>
          </div>
        </div>
      </ClienteLayout>
    );
  }

  return (
    <ClienteLayout>
      <div className="p-6">
        {/* Título y bienvenida personalizada */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold md:text-3xl font-montserrat text-primary">
            ¡Bienvenido, {datosCliente.nombreCompleto}!
          </h2>
          <p className="text-gray-600">
            Portal del Cliente - {datosCliente.empresa}
          </p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Building className="w-4 h-4 mr-1" />
            {datosCliente.cargo && `${datosCliente.cargo} • `}
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Información del cliente */}
        <div className="p-4 mb-8 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-start">
            <User className="w-5 h-5 mt-1 mr-3 text-blue-600" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">{datosCliente.empresa}</h4>
              <p className="text-sm text-blue-700">{datosCliente.nombreCompleto}</p>
              {datosCliente.cargo && (
                <p className="text-sm text-blue-600">{datosCliente.cargo}</p>
              )}
              <div className="mt-2 text-xs text-blue-600">
                <p>📧 {datosCliente.email}</p>
                {datosCliente.telefono && <p>📞 {datosCliente.telefono}</p>}
                {datosCliente.direccion && <p>📍 {datosCliente.direccion}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Módulos disponibles para el cliente */}
        {modulosPermitidos.length > 0 ? (
          <>
            <h3 className="flex items-center mb-6 text-xl font-bold text-gray-800">
              <Settings size={20} className="mr-2 text-primary" />
              Sus Documentos
            </h3>

            {/* Cards de módulos permitidos */}
            <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-6">
              {modulosPermitidos.map(modulo => {
                const Icono = modulo.icono;
                return (
                  <Link
                    key={modulo.id}
                    href={modulo.rutas.historial}
                    className="block p-4 transition-all bg-white border-2 border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-lg hover:border-gray-300 group"
                  >
                    <div className="text-center">
                      <div className={`mx-auto w-12 h-12 rounded-lg ${modulo.color} ${modulo.colorHover} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                        <Icono size={24} className="text-white" />
                      </div>
                      <h4 className="mb-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-primary">
                        {modulo.titulo}
                      </h4>
                      <p className="mb-2 text-xs text-gray-600">
                        {modulo.descripcion}
                      </p>
                      <div className="text-lg font-bold text-primary">
                        {modulo.total}
                      </div>
                      <p className="text-xs text-gray-500">documentos</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Accesos rápidos */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
              <h3 className="flex items-center mb-4 text-lg font-bold text-gray-800">
                <Clock size={20} className="mr-2 text-primary" />
                Accesos Rápidos
              </h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                {modulosPermitidos.map(modulo => {
                  const Icono = modulo.icono;
                  return (
                    <Link
                      key={`quick-${modulo.id}`}
                      href={modulo.rutas.historial}
                      className={`flex flex-col items-center p-3 text-center transition-colors border border-gray-200 rounded-lg cursor-pointer hover:shadow-md group`}
                      style={{
                        '--hover-bg': modulo.color.replace('bg-', '').replace('-600', '-50'),
                        '--hover-border': modulo.color.replace('bg-', '').replace('-600', '-300')
                      }}
                    >
                      <Icono size={20} className={`mb-2 transition-transform group-hover:scale-110 ${modulo.color.replace('bg-', 'text-')}`} />
                      <span className={`text-xs font-medium text-gray-900 group-hover:${modulo.color.replace('bg-', 'text-').replace('-600', '-700')}`}>
                        Ver {modulo.titulo}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Si no tiene permisos para ningún módulo */
          <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-md">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">Sin documentos disponibles</h3>
            <p className="text-gray-600">
              Actualmente no tiene permisos para ver documentos. 
              Contacte al administrador si necesita acceso.
            </p>
          </div>
        )}

        {/* Información de contacto IMSSE */}
        <div className="p-6 mt-8 text-center bg-white border border-red-200 rounded-lg shadow-md">
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
            <p>Portal del Cliente - Sistemas de protección contra incendios</p>
            <div className="grid grid-cols-1 gap-2 mt-3 md:grid-cols-3">
              <p>📧 info@imsseingenieria.com</p>
              <p>🌐 www.imsseingenieria.com</p>
              <p>📍 Córdoba, Argentina</p>
            </div>
            <p className="mt-3 text-xs">
              <span className="font-medium">Certificaciones:</span> Notifier | Mircom | Inim | Secutron | Bosch
            </p>
          </div>
        </div>
      </div>
    </ClienteLayout>
  );
}