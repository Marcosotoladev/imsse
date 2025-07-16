// app/admin/presupuestos/page.js
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Send, 
  Copy,
  Calendar,
  User,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3
} from 'lucide-react';
import { usePresupuestos } from '../../../hooks/usePresupuestos';
import PresupuestoPDF from '../../components/pdf/PresupuestoPDF';

export default function PresupuestosPage() {
  const {
    presupuestos,
    loading,
    error,
    updatePresupuesto,
    deletePresupuesto,
    duplicatePresupuesto,
    getEstadisticas
  } = usePresupuestos();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  const estadisticas = getEstadisticas();

  // Filtrar presupuestos
  const filteredPresupuestos = presupuestos.filter(presupuesto => {
    const matchesSearch = 
      presupuesto.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presupuesto.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presupuesto.cliente.contacto.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || presupuesto.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-600 text-white';
      case 'enviado':
        return 'bg-yellow-600 text-white';
      case 'borrador':
        return 'bg-gray-500 text-white';
      case 'rechazado':
        return 'bg-red-600 text-white';
      case 'vencido':
        return 'bg-gray-700 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'APROBADO';
      case 'enviado':
        return 'ENVIADO';
      case 'borrador':
        return 'BORRADOR';
      case 'rechazado':
        return 'RECHAZADO';
      case 'vencido':
        return 'VENCIDO';
      default:
        return estado.toUpperCase();
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircle size={16} />;
      case 'enviado':
        return <Clock size={16} />;
      case 'borrador':
        return <Edit size={16} />;
      case 'rechazado':
        return <XCircle size={16} />;
      case 'vencido':
        return <Clock size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updatePresupuesto(id, { estado: newStatus });
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este presupuesto?')) {
      try {
        await deletePresupuesto(id);
      } catch (err) {
        console.error('Error al eliminar presupuesto:', err);
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicatePresupuesto(id);
    } catch (err) {
      console.error('Error al duplicar presupuesto:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-AR').format(new Date(date));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando presupuestos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 font-montserrat">
                Gestión de Presupuestos
              </h1>
              <p className="text-neutral-600 mt-1">
                Administre todos los presupuestos de IMSSE
              </p>
            </div>
            <Link
              href="/admin/presupuestos/nuevo"
              className="flex items-center px-6 py-3 bg-gradient-admin text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
            >
              <Plus size={20} className="mr-2" />
              Nuevo Presupuesto
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Total Presupuestos</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{estadisticas.total}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <FileText size={24} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{estadisticas.pendientes}</p>
              </div>
              <div className="bg-status-warning/10 p-3 rounded-lg">
                <Clock size={24} className="text-status-warning" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Aprobados</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{estadisticas.aprobados}</p>
              </div>
              <div className="bg-status-success/10 p-3 rounded-lg">
                <CheckCircle size={24} className="text-status-success" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Tasa Aprobación</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{estadisticas.tasaAprobacion}%</p>
              </div>
              <div className="bg-technician/10 p-3 rounded-lg">
                <BarChart3 size={24} className="text-technician" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm font-medium">Monto Aprobado</p>
                <p className="text-lg font-bold text-neutral-900 mt-1">
                  {formatCurrency(estadisticas.montoTotal)}
                </p>
              </div>
              <div className="bg-status-success/10 p-3 rounded-lg">
                <DollarSign size={24} className="text-status-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white p-6 rounded-xl shadow-corporate border border-neutral-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar por número, cliente o contacto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="borrador">Borrador</option>
                <option value="enviado">Enviado</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
                <option value="vencido">Vencido</option>
              </select>
              <button className="flex items-center px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                <Filter size={20} className="mr-2" />
                Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de presupuestos */}
        <div className="bg-white rounded-xl shadow-corporate border border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Presupuesto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredPresupuestos.map((presupuesto) => (
                  <tr key={presupuesto.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-neutral-900">{presupuesto.numero}</div>
                        <div className="text-sm text-neutral-500">
                          {presupuesto.items.length} item{presupuesto.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-neutral-900">{presupuesto.cliente.nombre}</div>
                        <div className="text-sm text-neutral-500">{presupuesto.cliente.contacto}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {formatDate(presupuesto.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {formatDate(presupuesto.fechaVencimiento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-900">
                        {formatCurrency(presupuesto.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative group">
                        <div className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full cursor-pointer ${getStatusColor(presupuesto.estado)}`}>
                          {getStatusIcon(presupuesto.estado)}
                          <span className="ml-1">{getStatusText(presupuesto.estado)}</span>
                        </div>
                        {/* Dropdown que aparece al hacer hover */}
                        <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <button
                            onClick={() => handleStatusChange(presupuesto.id, 'borrador')}
                            className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-lg"
                          >
                            Borrador
                          </button>
                          <button
                            onClick={() => handleStatusChange(presupuesto.id, 'enviado')}
                            className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                          >
                            Enviado
                          </button>
                          <button
                            onClick={() => handleStatusChange(presupuesto.id, 'aprobado')}
                            className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                          >
                            Aprobado
                          </button>
                          <button
                            onClick={() => handleStatusChange(presupuesto.id, 'rechazado')}
                            className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                          >
                            Rechazado
                          </button>
                          <button
                            onClick={() => handleStatusChange(presupuesto.id, 'vencido')}
                            className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 last:rounded-b-lg"
                          >
                            Vencido
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPresupuesto(presupuesto);
                            setShowPDFModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Ver PDF"
                        >
                          <Eye size={16} />
                        </button>
                        
                        <PDFDownloadLink
                          document={<PresupuestoPDF presupuesto={presupuesto} />}
                          fileName={`${presupuesto.numero}.pdf`}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Descargar PDF"
                        >
                          <Download size={16} />
                        </PDFDownloadLink>

                        <Link
                          href={`/admin/presupuestos/${presupuesto.id}/editar`}
                          className="text-neutral-400 hover:text-neutral-600 transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Link>

                        <button
                          onClick={() => handleDuplicate(presupuesto.id)}
                          className="text-status-info hover:text-blue-700 transition-colors"
                          title="Duplicar"
                        >
                          <Copy size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(presupuesto.id)}
                          className="text-status-emergency hover:text-red-700 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPresupuestos.length === 0 && (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                No se encontraron presupuestos
              </h3>
              <p className="text-neutral-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intente ajustar los filtros de búsqueda'
                  : 'Comience creando su primer presupuesto'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  href="/admin/presupuestos/nuevo"
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Crear Presupuesto
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de vista de detalles (simplificado) */}
      {showPDFModal && selectedPresupuesto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Detalles - {selectedPresupuesto.numero}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedPresupuesto.cliente.nombre}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <PDFDownloadLink
                  document={<PresupuestoPDF presupuesto={selectedPresupuesto} />}
                  fileName={`${selectedPresupuesto.numero}.pdf`}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  Descargar PDF
                </PDFDownloadLink>
                <button
                  onClick={() => {
                    setShowPDFModal(false);
                    setSelectedPresupuesto(null);
                  }}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Vista previa de detalles del presupuesto */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Información del Presupuesto</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Número:</strong> {selectedPresupuesto.numero}</div>
                      <div><strong>Fecha:</strong> {formatDate(selectedPresupuesto.fecha)}</div>
                      <div><strong>Vencimiento:</strong> {formatDate(selectedPresupuesto.fechaVencimiento)}</div>
                      <div><strong>Validez:</strong> {selectedPresupuesto.validez}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Cliente</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Empresa:</strong> {selectedPresupuesto.cliente.nombre}</div>
                      <div><strong>Contacto:</strong> {selectedPresupuesto.cliente.contacto}</div>
                      <div><strong>Email:</strong> {selectedPresupuesto.cliente.email}</div>
                      <div><strong>Teléfono:</strong> {selectedPresupuesto.cliente.telefono}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Items del Presupuesto</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedPresupuesto.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm">{item.descripcion}</td>
                            <td className="px-4 py-2 text-sm">{item.cantidad} {item.unidad}</td>
                            <td className="px-4 py-2 text-sm">{formatCurrency(item.precioUnitario)}</td>
                            <td className="px-4 py-2 text-sm">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedPresupuesto.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>IVA (21%):</span>
                    <span>{formatCurrency(selectedPresupuesto.iva)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(selectedPresupuesto.total)}</span>
                  </div>
                </div>
                
                {selectedPresupuesto.observaciones && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Observaciones</h4>
                    <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                      {selectedPresupuesto.observaciones}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-status-emergency text-white p-4 rounded-lg shadow-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}