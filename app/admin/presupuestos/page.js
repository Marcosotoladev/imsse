// app/admin/presupuestos/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FilePlus, FileText, Home, LogOut, Search, Download, Edit, Trash, Eye, Filter } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, deleteDoc, query, orderBy, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PresupuestoPDF from '../../components/pdf/PresupuestoPDF';

export default function HistorialPresupuestos() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [presupuestos, setPresupuestos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación con Firebase
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarPresupuestos();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarPresupuestos = async () => {
    try {
      const presupuestosRef = collection(db, 'presupuestos');
      const q = query(presupuestosRef, orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);

      const presupuestosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("Presupuestos cargados:", presupuestosData.length);
      setPresupuestos(presupuestosData);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
      setPresupuestos([]);
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

  const handleDeletePresupuesto = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este presupuesto?')) {
      try {
        await deleteDoc(doc(db, 'presupuestos', id));
        setPresupuestos(presupuestos.filter(p => p.id !== id));
        alert('Presupuesto eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
        alert('Error al eliminar el presupuesto. Inténtelo de nuevo más tarde.');
      }
    }
  };

  // Función para cambiar estado del presupuesto
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'presupuestos', id), {
        estado: nuevoEstado,
        fechaModificacion: new Date()
      });

      // Actualizar lista local
      setPresupuestos(presupuestos.map(p => 
        p.id === id ? { ...p, estado: nuevoEstado } : p
      ));

      console.log(`Estado cambiado a: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del presupuesto.');
    }
  };

  // Función para formatear moneda estilo argentino
  const formatCurrency = (amount) => {
    if (!amount) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Función para formatear fecha
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('es-AR');
    } catch (e) {
      return 'N/A';
    }
  };

  // Función para obtener color del estado (solo 3 estados)
  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'aprobado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendiente':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Filtros combinados
  const presupuestosFiltrados = presupuestos.filter((presupuesto) => {
    // Filtro por texto
    const cumpleFiltroTexto = !filtro || [
      presupuesto.numero,
      presupuesto.cliente?.nombre,
      presupuesto.cliente?.empresa
    ].some(campo => campo?.toLowerCase().includes(filtro.toLowerCase()));

    // Filtro por estado
    const cumpleFiltroEstado = filtroEstado === 'todos' || 
      presupuesto.estado?.toLowerCase() === filtroEstado.toLowerCase();

    return cumpleFiltroTexto && cumpleFiltroEstado;
  });

  // Estadísticas simplificadas (solo 3 estados)
  const estadisticas = {
    total: presupuestos.length,
    pendientes: presupuestos.filter(p => !p.estado || p.estado.toLowerCase() === 'pendiente').length,
    aprobados: presupuestos.filter(p => p.estado?.toLowerCase() === 'aprobado').length,
    rechazados: presupuestos.filter(p => p.estado?.toLowerCase() === 'rechazado').length,
    montoTotal: presupuestos
      .filter(p => p.estado?.toLowerCase() === 'aprobado')
      .reduce((sum, p) => sum + (p.total || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando presupuestos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header IMSSE */}
      <header className="text-white shadow bg-primary">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="flex items-center">
            <img 
              src="/logo/imsse-logo.png" 
              alt="IMSSE Logo" 
              className="w-8 h-8 mr-3"
            />
            <h1 className="text-xl font-bold font-montserrat">IMSSE - Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-red-700"
            >
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto">
        {/* Breadcrumb y acciones */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              <Home size={16} className="mr-1" /> Dashboard
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Gestión de Presupuestos</span>
          </div>

          <Link
            href="/admin/presupuestos/nuevo"
            className="flex items-center px-4 py-2 mb-4 text-white transition-colors rounded-md bg-primary hover:bg-red-700"
          >
            <FilePlus size={18} className="mr-2" /> Nuevo Presupuesto
          </Link>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Gestión de Presupuestos IMSSE
        </h2>

        {/* Estadísticas simplificadas */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-4">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
            <div className="text-sm text-gray-600">Total Presupuestos</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="text-2xl font-bold text-green-600">{estadisticas.aprobados}</div>
            <div className="text-sm text-gray-600">Aprobados</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="text-lg font-bold text-green-600">{formatCurrency(estadisticas.montoTotal)}</div>
            <div className="text-sm text-gray-600">Monto Aprobado</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative flex items-center">
              <Search size={18} className="absolute text-gray-400 left-3" />
              <input
                type="text"
                placeholder="Buscar por número, cliente o empresa..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center">
              <Filter size={18} className="mr-2 text-gray-400" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              Mostrando {presupuestosFiltrados.length} de {presupuestos.length} presupuestos
            </div>
          </div>
        </div>

        {/* Tabla de presupuestos */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Número
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {presupuestosFiltrados.length > 0 ? (
                  presupuestosFiltrados.map((presupuesto) => (
                    <tr key={presupuesto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{presupuesto.numero}</div>
                        <div className="text-xs text-gray-500">
                          {presupuesto.items?.length || 0} item{(presupuesto.items?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(presupuesto.fechaCreacion || presupuesto.fecha)}
                        </div>

                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {presupuesto.cliente?.empresa || 'Sin empresa'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {presupuesto.cliente?.nombre || 'Sin contacto'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {formatCurrency(presupuesto.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            value={presupuesto.estado || 'pendiente'}
                            onChange={(e) => handleCambiarEstado(presupuesto.id, e.target.value)}
                            className={`px-3 py-1 pr-8 text-xs font-semibold rounded-full border cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none ${getStatusColor(presupuesto.estado)}`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="aprobado">Aprobado</option>
                            <option value="rechazado">Rechazado</option>
                          </select>
                          {/* Flecha del dropdown */}
{/*                           <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div> */}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-3">
                          <Link
                            href={`/admin/presupuestos/${presupuesto.id}`}
                            title="Ver detalles"
                            className="text-gray-600 transition-colors hover:text-primary"
                          >
                            <Eye size={18} />
                          </Link>

                          <PDFDownloadLink
                            document={<PresupuestoPDF presupuesto={presupuesto} />}
                            fileName={`${presupuesto.numero}.pdf`}
                            className="text-blue-600 transition-colors hover:text-blue-800"
                            title="Descargar PDF"
                          >
                            {({ blob, url, loading, error }) =>
                              <Download size={18} className={loading ? "animate-pulse" : ""} />
                            }
                          </PDFDownloadLink>

                          <Link
                            href={`/admin/presupuestos/editar/${presupuesto.id}`}
                            title="Editar"
                            className="text-yellow-600 transition-colors hover:text-yellow-800"
                          >
                            <Edit size={18} />
                          </Link>

                          <button
                            onClick={() => handleDeletePresupuesto(presupuesto.id)}
                            title="Eliminar"
                            className="text-red-500 transition-colors cursor-pointer hover:text-red-700"
                           
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="mb-2 text-gray-500">
                        {filtro || filtroEstado !== 'todos' 
                          ? 'No hay presupuestos que coincidan con los filtros'
                          : 'No hay presupuestos creados aún'
                        }
                      </p>
                      <p className="text-sm text-gray-400">
                        {filtro || filtroEstado !== 'todos' 
                          ? 'Intente ajustar los filtros de búsqueda'
                          : 'Cree su primer presupuesto para comenzar'
                        }
                      </p>
                      {!filtro && filtroEstado === 'todos' && (
                        <Link
                          href="/admin/presupuestos/nuevo"
                          className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors rounded-md bg-primary hover:bg-red-700"
                        >
                          <FilePlus size={16} className="mr-2" />
                          Crear Primer Presupuesto
                        </Link>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}