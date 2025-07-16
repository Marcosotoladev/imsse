// app/admin/page.js
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Shield,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Datos simulados para el dashboard
  const stats = {
    totalClients: 142,
    activeProjects: 28,
    pendingQuotes: 15,
    monthlyRevenue: 1250000,
    emergencyCalls: 3,
    completedJobs: 89,
    maintenanceOrders: 45,
    workOrders: 23,
    pendingReminders: 8
  };

  const recentProjects = [
    {
      id: 1,
      client: "Centro Comercial Norte",
      type: "Detección de Incendios",
      status: "En progreso",
      technician: "Ing. Martinez",
      deadline: "2024-01-15",
      priority: "Alta"
    },
    {
      id: 2,
      client: "Industria Metalúrgica SA",
      type: "Mantenimiento Preventivo",
      status: "Completado",
      technician: "Téc. Rodriguez",
      deadline: "2024-01-10",
      priority: "Media"
    },
    {
      id: 3,
      client: "Hospital Provincial",
      type: "Sistema de Extinción",
      status: "Pendiente",
      technician: "Ing. Lopez",
      deadline: "2024-01-20",
      priority: "Crítica"
    }
  ];

  const alerts = [
    {
      id: 1,
      type: "emergency",
      message: "Mantenimiento de emergencia requerido - Edificio Gobierno",
      time: "Hace 2 horas"
    },
    {
      id: 2,
      type: "warning",
      message: "Vencimiento de certificación - Cliente XYZ",
      time: "Hace 1 día"
    },
    {
      id: 3,
      type: "info",
      message: "Nuevo presupuesto solicitado - Empresa ABC",
      time: "Hace 3 horas"
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Crítica': return 'bg-status-emergency text-white';
      case 'Alta': return 'bg-status-warning text-white';
      case 'Media': return 'bg-status-info text-white';
      default: return 'bg-neutral-400 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado': return 'bg-status-success text-white';
      case 'En progreso': return 'bg-status-info text-white';
      case 'Pendiente': return 'bg-status-warning text-white';
      default: return 'bg-neutral-400 text-white';
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
                Panel de Administración
              </h1>
              <p className="text-neutral-600">
                Vista completa del sistema IMSSE
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar proyectos, clientes..."
                  className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button className="relative p-2 text-neutral-600 hover:text-primary transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-status-emergency text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <Link
                href="/admin/settings"
                className="p-2 text-neutral-600 hover:text-primary transition-colors"
              >
                <Settings size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros y Acciones Rápidas */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este año</option>
            </select>
            <button className="flex items-center px-3 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors">
              <Filter size={16} className="mr-2" />
              Filtros
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors">
              <Download size={16} className="mr-2" />
              Exportar
            </button>
            <button className="flex items-center px-4 py-2 bg-gradient-admin text-white rounded-lg hover:opacity-90 transition-opacity">
              <Plus size={16} className="mr-2" />
              Nuevo Proyecto
            </button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Total Clientes</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.totalClients}</p>
              </div>
              <div className="bg-admin/10 p-3 rounded-lg">
                <Users size={24} className="text-admin" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp size={16} className="text-status-success mr-1" />
              <span className="text-status-success text-sm font-medium">+12%</span>
              <span className="text-neutral-500 text-sm ml-2">vs mes anterior</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Proyectos Activos</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.activeProjects}</p>
              </div>
              <div className="bg-technician/10 p-3 rounded-lg">
                <Shield size={24} className="text-technician" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Clock size={16} className="text-status-info mr-1" />
              <span className="text-neutral-500 text-sm">8 por vencer esta semana</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Órdenes Mantenimiento</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.maintenanceOrders}</p>
              </div>
              <div className="bg-status-info/10 p-3 rounded-lg">
                <Settings size={24} className="text-status-info" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-neutral-500 text-sm">15 programadas esta semana</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Órdenes de Obra</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.workOrders}</p>
              </div>
              <div className="bg-status-warning/10 p-3 rounded-lg">
                <Calendar size={24} className="text-status-warning" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-neutral-500 text-sm">6 en progreso hoy</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  ${stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-status-success/10 p-3 rounded-lg">
                <BarChart3 size={24} className="text-status-success" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp size={16} className="text-status-success mr-1" />
              <span className="text-status-success text-sm font-medium">+8%</span>
              <span className="text-neutral-500 text-sm ml-2">vs mes anterior</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Recordatorios</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.pendingReminders}</p>
              </div>
              <div className="bg-status-emergency/10 p-3 rounded-lg">
                <Bell size={24} className="text-status-emergency" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-neutral-500 text-sm">3 vencen hoy</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Proyectos Recientes */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-corporate border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900 font-montserrat">
                    Proyectos Recientes
                  </h2>
                  <Link
                    href="/admin/projects"
                    className="text-primary hover:text-primary-700 text-sm font-medium transition-colors"
                  >
                    Ver todos
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Técnico
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Vencimiento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {recentProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-neutral-900">{project.client}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {project.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {project.technician}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {project.deadline}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-primary hover:text-primary-700 transition-colors">
                              <Eye size={16} />
                            </button>
                            <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                              <Edit size={16} />
                            </button>
                            <button className="text-status-emergency hover:text-red-700 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Panel de Alertas */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-corporate border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900 font-montserrat">
                  Alertas y Notificaciones
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      alert.type === 'emergency' ? 'bg-status-emergency/10' :
                      alert.type === 'warning' ? 'bg-status-warning/10' :
                      'bg-status-info/10'
                    }`}>
                      <AlertTriangle size={16} className={
                        alert.type === 'emergency' ? 'text-status-emergency' :
                        alert.type === 'warning' ? 'text-status-warning' :
                        'text-status-info'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900 font-medium">
                        {alert.message}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-neutral-200">
                <Link
                  href="/admin/notifications"
                  className="text-primary hover:text-primary-700 text-sm font-medium transition-colors"
                >
                  Ver todas las notificaciones
                </Link>
              </div>
            </div>

            {/* Accesos Rápidos */}
            <div className="bg-white rounded-xl shadow-corporate border border-neutral-200 mt-6">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900 font-montserrat">
                  Accesos Rápidos
                </h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <Link
                  href="/admin/presupuestos"
                  className="flex flex-col items-center p-4 text-center border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <FileText size={24} className="text-primary mb-2" />
                  <span className="text-sm font-medium text-neutral-900">Presupuestos</span>
                </Link>
                <Link
                  href="/admin/recibos"
                  className="flex flex-col items-center p-4 text-center border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <BarChart3 size={24} className="text-technician mb-2" />
                  <span className="text-sm font-medium text-neutral-900">Recibos</span>
                </Link>
                <Link
                  href="/admin/remitos"
                  className="flex flex-col items-center p-4 text-center border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <Calendar size={24} className="text-status-warning mb-2" />
                  <span className="text-sm font-medium text-neutral-900">Remitos</span>
                </Link>
                <Link
                  href="/admin/mantenimiento"
                  className="flex flex-col items-center p-4 text-center border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <Settings size={24} className="text-status-info mb-2" />
                  <span className="text-sm font-medium text-neutral-900">Órd. Mantenimiento</span>
                </Link>
                <Link
                  href="/admin/obras"
                  className="flex flex-col items-center p-4 text-center border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <Shield size={24} className="text-admin mb-2" />
                  <span className="text-sm font-medium text-neutral-900">Órd. de Obra</span>
                </Link>
                <Link
                  href="/admin/recordatorios"
                  className="flex flex-col items-center p-4 text-center border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <Bell size={24} className="text-status-emergency mb-2" />
                  <span className="text-sm font-medium text-neutral-900">Recordatorios</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}