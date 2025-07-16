// app/client/page.js
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Calendar, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Phone,
  Mail,
  MapPin,
  Settings,
  Star,
  BarChart3
} from 'lucide-react';

export default function ClientDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Información del cliente logueado
  const clientInfo = {
    name: "Centro Comercial Norte S.A.",
    contactPerson: "Juan Carlos Mendez",
    email: "jmendez@centronorte.com.ar",
    phone: "+54 9 351 456-7890",
    address: "Av. Rafael Núñez 4850, Córdoba Capital",
    clientSince: "2019",
    contractType: "Mantenimiento + Proyectos"
  };

  // Órdenes de trabajo del cliente
  const clientOrders = [
    {
      id: "ORD-2024-015",
      type: "mantenimiento",
      date: "2024-01-15",
      technician: "Téc. Rodriguez",
      service: "Mantenimiento Preventivo Trimestral",
      equipment: "Central Notifier NFW2-100 - Planta Baja",
      status: "Completado",
      priority: "Media",
      startTime: "09:00",
      endTime: "11:30",
      rating: 5,
      observations: "Sistema funcionando correctamente. Se reemplazaron 2 detectores defectuosos."
    },
    {
      id: "ORD-2024-012",
      type: "obra", 
      date: "2024-01-10",
      technician: "Ing. Martinez",
      service: "Instalación Detectores Planta 3",
      equipment: "15 Detectores Ópticos Bosch FAP-325",
      status: "Completado",
      priority: "Alta",
      startTime: "14:00",
      endTime: "18:00",
      rating: 5,
      observations: "Instalación completa según planos. Certificación entregada."
    },
    {
      id: "ORD-2024-008",
      type: "mantenimiento",
      date: "2024-01-05",
      technician: "Téc. Lopez",
      service: "Revisión Sistema Extinción",
      equipment: "Sistema FM-200 - Sala de Servidores",
      status: "Completado", 
      priority: "Alta",
      startTime: "10:00",
      endTime: "12:00",
      rating: 4,
      observations: "Presión verificada. Se recomienda cambio de mangueras en próximo mantenimiento."
    },
    {
      id: "ORD-2024-020",
      type: "mantenimiento",
      date: "2024-01-18",
      technician: "Téc. Rodriguez",
      service: "Mantenimiento Programado Mensual",
      equipment: "Sistema Alarma General",
      status: "Programado",
      priority: "Media",
      startTime: "08:00",
      endTime: "10:00",
      rating: null,
      observations: null
    }
  ];

  const documents = [
    {
      id: "DOC-2024-001",
      type: "presupuesto",
      title: "Presupuesto Ampliación Sistema Planta 4",
      date: "2024-01-12",
      amount: "$850,000",
      status: "Pendiente Aprobación"
    },
    {
      id: "DOC-2024-002", 
      type: "recibo",
      title: "Recibo Mantenimiento Enero 2024",
      date: "2024-01-15",
      amount: "$125,000",
      status: "Pagado"
    },
    {
      id: "DOC-2023-045",
      type: "certificado",
      title: "Certificado Anual Sistema Contra Incendios",
      date: "2023-12-15",
      amount: "-",
      status: "Vigente"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado': return 'bg-status-success text-white';
      case 'Programado': return 'bg-status-info text-white';
      case 'En progreso': return 'bg-status-warning text-white';
      case 'Cancelado': return 'bg-neutral-400 text-white';
      default: return 'bg-neutral-400 text-white';
    }
  };

  const getTypeColor = (type) => {
    return type === 'mantenimiento' ? 'bg-client text-white' : 'bg-primary text-white';
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'presupuesto': return <FileText size={16} className="text-primary" />;
      case 'recibo': return <BarChart3 size={16} className="text-status-success" />;
      case 'certificado': return <Shield size={16} className="text-status-info" />;
      default: return <FileText size={16} className="text-neutral-400" />;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'}
          />
        ))}
      </div>
    );
  };

  const completedOrders = clientOrders.filter(order => order.status === 'Completado');
  const programmedOrders = clientOrders.filter(order => order.status === 'Programado');
  const averageRating = completedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / completedOrders.length;

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      {/* Header del Dashboard */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 font-montserrat">
                Portal del Cliente
              </h1>
              <p className="text-neutral-600">
                {clientInfo.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">Cliente desde:</p>
                <p className="text-sm text-client">{clientInfo.clientSince}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-client to-client-dark rounded-full flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas del Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-elegant border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Órdenes Completadas</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{completedOrders.length}</p>
              </div>
              <div className="bg-status-success/10 p-3 rounded-lg">
                <CheckCircle size={24} className="text-status-success" />
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Este año</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-elegant border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Próximas Visitas</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{programmedOrders.length}</p>
              </div>
              <div className="bg-status-info/10 p-3 rounded-lg">
                <Calendar size={24} className="text-status-info" />
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Programadas</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-elegant border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Satisfacción</p>
                <div className="flex items-center mt-1">
                  <p className="text-3xl font-bold text-neutral-900 mr-2">{averageRating.toFixed(1)}</p>
                  <Star size={24} className="text-yellow-400 fill-current" />
                </div>
              </div>
              <div className="bg-yellow-400/10 p-3 rounded-lg">
                <Star size={24} className="text-yellow-400" />
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Promedio servicios</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-elegant border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Documentos</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{documents.length}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <FileText size={24} className="text-primary" />
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">Disponibles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Historial de Órdenes */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-elegant border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900 font-montserrat">
                    Historial de Servicios
                  </h2>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-client focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="month">Este mes</option>
                    <option value="quarter">Este trimestre</option>
                    <option value="year">Este año</option>
                  </select>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {clientOrders.map((order) => (
                  <div key={order.id} className="border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(order.type)}`}>
                          {order.type === 'mantenimiento' ? 'Mantenimiento' : 'Proyecto'}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-neutral-600">{order.date}</div>
                        <div className="text-xs text-neutral-500">
                          {order.startTime} - {order.endTime}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{order.service}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-600 mb-1">Técnico asignado:</p>
                        <p className="text-sm text-neutral-900">{order.technician}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-600 mb-1">Equipo/Sistema:</p>
                        <p className="text-sm text-neutral-900">{order.equipment}</p>
                      </div>
                    </div>

                    {order.observations && (
                      <div className="bg-neutral-50 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium text-neutral-900 mb-1">Observaciones del técnico:</p>
                        <p className="text-sm text-neutral-700">{order.observations}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {order.rating && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-neutral-600">Su valoración:</span>
                            {renderStars(order.rating)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center px-3 py-2 border border-neutral-300 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                          <Eye size={16} className="mr-2" />
                          Ver Detalles
                        </button>
                        {order.status === 'Completado' && (
                          <button className="flex items-center px-3 py-2 bg-client text-white rounded-lg hover:opacity-90 transition-opacity text-sm">
                            <Download size={16} className="mr-2" />
                            Descargar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="xl:col-span-1 space-y-6">
            {/* Información del Cliente */}
            <div className="bg-white rounded-xl shadow-elegant border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900 font-montserrat">
                  Información de Contacto
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-neutral-600 mb-1">Persona de contacto:</p>
                  <p className="text-sm text-neutral-900">{clientInfo.contactPerson}</p>
                </div>
                <div className="flex items-center">
                  <Mail size={16} className="text-neutral-400 mr-3" />
                  <span className="text-sm text-neutral-700">{clientInfo.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone size={16} className="text-neutral-400 mr-3" />
                  <span className="text-sm text-neutral-700">{clientInfo.phone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin size={16} className="text-neutral-400 mr-3 mt-1" />
                  <span className="text-sm text-neutral-700">{clientInfo.address}</span>
                </div>
                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-sm font-medium text-neutral-600 mb-1">Tipo de contrato:</p>
                  <p className="text-sm text-client font-medium">{clientInfo.contractType}</p>
                </div>
              </div>
            </div>

            {/* Documentos Disponibles */}
            <div className="bg-white rounded-xl shadow-elegant border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900 font-montserrat">
                  Documentos
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      {getDocumentIcon(doc.type)}
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{doc.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-neutral-500">{doc.date}</span>
                          {doc.amount !== '-' && (
                            <span className="text-xs text-neutral-600">• {doc.amount}</span>
                          )}
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          doc.status === 'Pagado' || doc.status === 'Vigente' ? 'bg-status-success/10 text-status-success' :
                          doc.status === 'Pendiente Aprobación' ? 'bg-status-warning/10 text-status-warning' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                    <button className="text-client hover:text-client-dark transition-colors">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white rounded-xl shadow-elegant border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900 font-montserrat">
                  Soporte
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href="/client/solicitar-servicio"
                  className="flex items-center w-full p-3 bg-gradient-to-r from-client to-client-dark text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Settings size={20} className="mr-3" />
                  Solicitar Servicio
                </Link>
                <Link
                  href="/contacto"
                  className="flex items-center w-full p-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <Mail size={20} className="mr-3" />
                  Contactar IMSSE
                </Link>
                <button className="flex items-center w-full p-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Phone size={20} className="mr-3" />
                  Llamar Soporte
                </button>
                <button className="flex items-center w-full p-3 border border-status-emergency text-status-emergency rounded-lg hover:bg-status-emergency/5 transition-colors">
                  <AlertTriangle size={20} className="mr-3" />
                  Reportar Emergencia
                </button>
              </div>
            </div>

            {/* Próximo Mantenimiento */}
            <div className="bg-gradient-to-r from-primary to-primary-700 text-white rounded-xl p-6">
              <h3 className="font-bold mb-4 flex items-center">
                <Calendar size={20} className="mr-2" />
                Próximo Mantenimiento
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span className="font-medium">18 Enero 2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Horario:</span>
                  <span className="font-medium">08:00 - 10:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Técnico:</span>
                  <span className="font-medium">Téc. Rodriguez</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs text-white/80">
                  Le notificaremos 24hs antes de la visita programada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}