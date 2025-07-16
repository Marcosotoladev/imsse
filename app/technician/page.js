// app/technician/page.js
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  User,
  Settings,
  Phone,
  FileText,
  PenTool,
  Navigation,
  Timer,
  CheckSquare,
  Bell
} from 'lucide-react';

export default function TechnicianDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Datos simulados del técnico logueado
  const technicianInfo = {
    name: "Carlos Rodriguez",
    id: "TEC-001",
    certification: "Bosch, Mircom",
    phone: "+54 9 351 123-4567",
    todayTasks: 4,
    completedThisWeek: 12,
    pendingReports: 2
  };

  // Órdenes asignadas al técnico
  const todayOrders = [
    {
      id: "ORD-2024-001",
      type: "mantenimiento",
      client: "Hospital Provincial",
      address: "Av. Colón 1250, Córdoba",
      time: "09:00",
      duration: "2 horas",
      priority: "Alta",
      status: "Pendiente",
      equipment: "Central Notifier NFW2-100",
      description: "Mantenimiento preventivo trimestral - Revisión general de sistema"
    },
    {
      id: "ORD-2024-002", 
      type: "obra",
      client: "Centro Comercial Norte",
      address: "Av. Rafael Núñez 4850, Córdoba",
      time: "14:00",
      duration: "4 horas",
      priority: "Media",
      status: "En progreso",
      equipment: "Instalación detectores de humo - Planta 3",
      description: "Instalación de 15 detectores ópticos en sector comercial"
    },
    {
      id: "ORD-2024-003",
      type: "mantenimiento", 
      client: "Industria Metalúrgica SA",
      address: "Zona Industrial Norte, Córdoba",
      time: "16:30",
      duration: "1.5 horas",
      priority: "Media",
      status: "Completado",
      equipment: "Sistema extinción FM-200",
      description: "Verificación de presión en cilindros y pruebas funcionales"
    }
  ];

  const reminders = [
    {
      id: 1,
      title: "Llamar cliente Hospital Provincial",
      description: "Confirmar horario para próximo mantenimiento",
      dueDate: "2024-01-16",
      priority: "Alta",
      createdBy: "Yo"
    },
    {
      id: 2,
      title: "Solicitar repuestos Mircom",
      description: "Detectores de humo modelo FD-851 (cantidad: 5)",
      dueDate: "2024-01-17",
      priority: "Media",
      createdBy: "Admin"
    }
  ];

  const getTypeColor = (type) => {
    return type === 'mantenimiento' ? 'bg-technician text-white' : 'bg-admin text-white';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado': return 'bg-status-success text-white';
      case 'En progreso': return 'bg-status-info text-white';
      case 'Pendiente': return 'bg-status-warning text-white';
      default: return 'bg-neutral-400 text-white';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'text-status-emergency';
      case 'Media': return 'text-status-warning';
      case 'Baja': return 'text-technician';
      default: return 'text-neutral-400';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      {/* Header del Dashboard */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 font-montserrat">
                Panel de Técnico
              </h1>
              <p className="text-neutral-600">
                Bienvenido, {technicianInfo.name} - {technicianInfo.id}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">Certificado en:</p>
                <p className="text-sm text-technician">{technicianInfo.certification}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-tech rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas del Técnico */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-tech border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Tareas de Hoy</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{technicianInfo.todayTasks}</p>
              </div>
              <div className="bg-technician/10 p-3 rounded-lg">
                <Calendar size={24} className="text-technician" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-tech border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Completadas Semana</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{technicianInfo.completedThisWeek}</p>
              </div>
              <div className="bg-status-success/10 p-3 rounded-lg">
                <CheckCircle size={24} className="text-status-success" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-tech border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Reportes Pendientes</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{technicianInfo.pendingReports}</p>
              </div>
              <div className="bg-status-warning/10 p-3 rounded-lg">
                <FileText size={24} className="text-status-warning" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-tech border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Recordatorios</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{reminders.length}</p>
              </div>
              <div className="bg-status-emergency/10 p-3 rounded-lg">
                <Bell size={24} className="text-status-emergency" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Órdenes del Día */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-tech border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900 font-montserrat">
                    Mis Órdenes de Trabajo - Hoy
                  </h2>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-technician focus:border-transparent"
                  />
                </div>
              </div>

              <div className="p-6 space-y-4">
                {todayOrders.map((order) => (
                  <div key={order.id} className="border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(order.type)}`}>
                          {order.type === 'mantenimiento' ? 'Mantenimiento' : 'Obra'}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-neutral-400" />
                        <span className="text-sm text-neutral-600">{order.time} - {order.duration}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{order.client}</h3>
                    <div className="flex items-center text-neutral-600 mb-2">
                      <MapPin size={16} className="mr-2" />
                      <span className="text-sm">{order.address}</span>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium text-neutral-900 mb-1">Equipo/Sistema:</p>
                      <p className="text-sm text-neutral-700">{order.equipment}</p>
                    </div>

                    <p className="text-sm text-neutral-600 mb-4">{order.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-neutral-600 mr-2">Prioridad:</span>
                        <span className={`text-sm font-bold ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {order.status === 'Pendiente' && (
                          <button className="flex items-center px-3 py-2 bg-technician text-white rounded-lg hover:bg-technician-dark transition-colors text-sm">
                            <Timer size={16} className="mr-2" />
                            Iniciar
                          </button>
                        )}
                        {order.status === 'En progreso' && (
                          <>
                            <button className="flex items-center px-3 py-2 bg-status-info text-white rounded-lg hover:opacity-90 transition-opacity text-sm">
                              <Camera size={16} className="mr-2" />
                              Fotos
                            </button>
                            <button className="flex items-center px-3 py-2 bg-status-success text-white rounded-lg hover:opacity-90 transition-opacity text-sm">
                              <CheckSquare size={16} className="mr-2" />
                              Finalizar
                            </button>
                          </>
                        )}
                        {order.status === 'Completado' && (
                          <button className="flex items-center px-3 py-2 bg-neutral-400 text-white rounded-lg text-sm">
                            <PenTool size={16} className="mr-2" />
                            Ver Reporte
                          </button>
                        )}
                        <button className="flex items-center px-3 py-2 border border-neutral-300 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                          <Navigation size={16} className="mr-2" />
                          Ubicación
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="xl:col-span-1 space-y-6">
            {/* Acciones Rápidas */}
            <div className="bg-white rounded-xl shadow-tech border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900 font-montserrat">
                  Acciones Rápidas
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href="/technician/nueva-orden"
                  className="flex items-center w-full p-3 bg-gradient-tech text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <FileText size={20} className="mr-3" />
                  Nueva Orden de Trabajo
                </Link>
                <Link
                  href="/technician/reportes"
                  className="flex items-center w-full p-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <CheckCircle size={20} className="mr-3" />
                  Mis Reportes
                </Link>
                <Link
                  href="/technician/horarios"
                  className="flex items-center w-full p-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <Calendar size={20} className="mr-3" />
                  Ver Calendario
                </Link>
                <button className="flex items-center w-full p-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
                  <Phone size={20} className="mr-3" />
                  Llamar Emergencia
                </button>
              </div>
            </div>

            {/* Recordatorios */}
            <div className="bg-white rounded-xl shadow-tech border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900 font-montserrat">
                    Recordatorios
                  </h2>
                  <Link
                    href="/technician/recordatorios"
                    className="text-technician hover:text-technician-dark text-sm font-medium transition-colors"
                  >
                    Ver todos
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="border-l-4 border-status-warning pl-4">
                    <h4 className="font-medium text-neutral-900 text-sm">{reminder.title}</h4>
                    <p className="text-xs text-neutral-600 mt-1">{reminder.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-neutral-500">Vence: {reminder.dueDate}</span>
                      <span className="text-xs text-neutral-500">Por: {reminder.createdBy}</span>
                    </div>
                  </div>
                ))}
                
                <Link
                  href="/technician/nuevo-recordatorio"
                  className="flex items-center w-full p-3 border-2 border-dashed border-neutral-300 text-neutral-500 rounded-lg hover:border-technician hover:text-technician transition-colors text-sm"
                >
                  <Bell size={16} className="mr-2" />
                  Crear Recordatorio
                </Link>
              </div>
            </div>

            {/* Info de Contacto */}
            <div className="bg-gradient-tech text-white rounded-xl p-6">
              <h3 className="font-bold mb-4">Información de Contacto</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Phone size={16} className="mr-2" />
                  <span>{technicianInfo.phone}</span>
                </div>
                <div className="flex items-center">
                  <Settings size={16} className="mr-2" />
                  <span>ID: {technicianInfo.id}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs text-white/80">
                  Para emergencias llame inmediatamente a administración
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}