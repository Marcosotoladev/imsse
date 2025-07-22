// app/admin/estados-cuenta/page.jsx - Lista Estados de Cuenta IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Calendar,
  DollarSign,
  Building,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, deleteDoc, doc, where } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

export default function EstadosCuenta() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estados, setEstados] = useState([]);
  const [filteredEstados, setFilteredEstados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarEstados();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarEstados = async () => {
    try {
      const estadosRef = collection(db, 'estados_cuenta');
      const q = query(estadosRef, orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const estadosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEstados(estadosData);
      setFilteredEstados(estadosData);
    } catch (error) {
      console.error('Error al cargar estados de cuenta:', error);
      alert('Error al cargar los estados de cuenta');
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

  const handleDelete = async (id, numero) => {
    if (confirm(`¿Está seguro de que desea eliminar el estado de cuenta ${numero}?`)) {
      try {
        await deleteDoc(doc(db, 'estados_cuenta', id));
        alert('Estado de cuenta eliminado exitosamente');
        await cargarEstados();
      } catch (error) {
        console.error('Error al eliminar estado de cuenta:', error);
        alert('Error al eliminar el estado de cuenta');
      }
    }
  };

  // Efectos para filtros y búsqueda
  useEffect(() => {
    let result = estados;

    // Filtro por búsqueda
    if (searchTerm) {
      result = result.filter(estado =>
        estado.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estado.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estado.cliente?.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por período
    if (filterPeriodo) {
      result = result.filter(estado => {
        const year = filterPeriodo;
        const estadoYear = estado.periodo?.desde?.substring(0, 4);
        return estadoYear === year;
      });
    }

    setFilteredEstados(result);
    setCurrentPage(1);
  }, [searchTerm, filterPeriodo, estados]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEstados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEstados.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getSaldoColor = (saldo) => {
    if (saldo > 0) return 'text-red-600'; // Debe
    if (saldo < 0) return 'text-green-600'; // A favor
    return 'text-gray-600'; // Sin saldo
  };

  const getSaldoText = (saldo) => {
    if (saldo > 0) return 'Debe';
    if (saldo < 0) return 'A favor';
    return 'Sin saldo';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando estados de cuenta IMSSE...</p>
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

      {/* Navegación */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/admin/panel-control" className="text-primary hover:underline">
                <Home size={16} className="inline mr-1" />
                Panel de Control
              </Link>
              <span className="text-gray-500">/</span>
              <span className="font-medium text-gray-700">Estados de Cuenta</span>
            </div>

            {/* Botón crear nuevo */}
            <Link
              href="/admin/estados-cuenta/nuevo"
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700"
            >
              <Plus size={18} className="mr-2" />
              Nuevo Estado de Cuenta
            </Link>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        {/* Título y estadísticas */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold font-montserrat text-primary">
            Estados de Cuenta
          </h2>
          <p className="text-gray-600">
            Gestión de estados de cuenta para clientes IMSSE
          </p>
          
          <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-4">
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center">
                <BarChart3 size={24} className="mr-3 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Estados</p>
                  <p className="text-xl font-bold text-gray-900">{estados.length}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center">
                <DollarSign size={24} className="mr-3 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Saldos Pendientes</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(estados.reduce((sum, estado) => sum + (estado.saldoActual > 0 ? estado.saldoActual : 0), 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Building size={24} className="mr-3 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Clientes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {new Set(estados.map(e => e.cliente?.empresa)).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Calendar size={24} className="mr-3 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Este Mes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {estados.filter(e => {
                      const mesActual = new Date().getMonth() + 1;
                      const añoActual = new Date().getFullYear();
                      const fechaEstado = new Date(e.periodo?.desde);
                      return fechaEstado.getMonth() + 1 === mesActual && fechaEstado.getFullYear() === añoActual;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Filtros de Búsqueda</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative">
              <Search size={20} className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Buscar por número, cliente o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter size={20} className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <select
                value={filterPeriodo}
                onChange={(e) => setFilterPeriodo(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Todos los períodos</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                {filteredEstados.length} de {estados.length} estados
              </span>
            </div>
          </div>
        </div>

        {/* Tabla de estados de cuenta */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Lista de Estados de Cuenta</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Estado de Cuenta
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Período
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Saldo Actual
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((estado) => (
                    <tr key={estado.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{estado.numero}</div>
                          <div className="text-sm text-gray-500">
                            {estado.fechaCreacion && estado.fechaCreacion.toDate 
                              ? formatDate(estado.fechaCreacion.toDate())
                              : 'Fecha no disponible'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {estado.cliente?.nombre || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {estado.cliente?.empresa || 'Sin empresa'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(estado.periodo?.desde)} - {formatDate(estado.periodo?.hasta)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${getSaldoColor(estado.saldoActual)}`}>
                          {formatCurrency(Math.abs(estado.saldoActual || 0))}
                        </div>
                        <div className={`text-xs ${getSaldoColor(estado.saldoActual)}`}>
                          {getSaldoText(estado.saldoActual)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          estado.saldoActual > 0 
                            ? 'bg-red-100 text-red-800' 
                            : estado.saldoActual < 0 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {estado.saldoActual > 0 ? 'Pendiente' : estado.saldoActual < 0 ? 'A favor' : 'Al día'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/estados-cuenta/${estado.id}`}
                            className="text-blue-600 transition-colors hover:text-blue-900"
                            title="Ver estado"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            href={`/admin/estados-cuenta/editar/${estado.id}`}
                            className="text-green-600 transition-colors hover:text-green-900"
                            title="Editar estado"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(estado.id, estado.numero)}
                            className="text-red-600 transition-colors hover:text-red-900"
                            title="Eliminar estado"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No hay estados de cuenta</p>
                        <p className="mt-1">Comienza creando tu primer estado de cuenta</p>
                        <Link
                          href="/admin/estados-cuenta/nuevo"
                          className="inline-flex items-center px-4 py-2 mt-4 text-white transition-colors rounded-md bg-primary hover:bg-red-700"
                        >
                          <Plus size={18} className="mr-2" />
                          Crear Estado de Cuenta
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredEstados.length)} de {filteredEstados.length} resultados
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}