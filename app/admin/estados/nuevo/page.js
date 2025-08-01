// app/admin/estados/nuevo/page.jsx - CON SCROLL HORIZONTAL MÓVIL
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, ArrowLeft, Plus, Trash2, Calendar, DollarSign, User, Building2, FileText } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function CrearEstadoCuenta() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  // Estados para gestión de clientes
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [tipoCliente, setTipoCliente] = useState('existente');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Estado del formulario
  const [cliente, setCliente] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
    cuit: ''
  });

  const [estadoCuenta, setEstadoCuenta] = useState({
    numero: '',
    clienteId: '',
    periodo: {
      desde: '',
      hasta: ''
    },
    saldoAnterior: '',
    movimientos: [
      { 
        id: 1, 
        fecha: '', 
        concepto: '', 
        monto: ''
      }
    ],
    observaciones: ''
  });

  // FUNCIÓN SEGURA PARA PARSEAR NÚMEROS
  const parseSecureFloat = (value) => {
    if (value === '' || value === null || value === undefined) return 0;
    
    const cleanValue = String(value).replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    
    if (isNaN(parsed)) return 0;
    
    return Math.round(parsed * 100) / 100;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await generarNumeroEstado();
        cargarClientesDisponibles();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarClientesDisponibles = async () => {
    setCargandoClientes(true);
    try {
      const usuariosData = await apiService.obtenerUsuarios();
      const clientes = usuariosData.users.filter(u => 
        u.rol === 'cliente' && u.estado === 'activo'
      );
      setClientesDisponibles(clientes);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setCargandoClientes(false);
    }
  };

  const handleSeleccionarCliente = (clienteId) => {
    if (!clienteId) {
      setClienteSeleccionado(null);
      setEstadoCuenta({ ...estadoCuenta, clienteId: '' });
      setCliente({
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        direccion: '',
        cuit: ''
      });
      return;
    }

    const clienteEncontrado = clientesDisponibles.find(c => c.id === clienteId);
    if (clienteEncontrado) {
      setClienteSeleccionado(clienteEncontrado);
      setEstadoCuenta({ ...estadoCuenta, clienteId: clienteId });
      
      setCliente({
        nombre: clienteEncontrado.nombreCompleto || '',
        empresa: clienteEncontrado.empresa || '',
        email: clienteEncontrado.email || '',
        telefono: clienteEncontrado.telefono || '',
        direccion: '',
        cuit: ''
      });
    }
  };

  const handleCambiarTipoCliente = (tipo) => {
    setTipoCliente(tipo);
    if (tipo === 'manual') {
      setClienteSeleccionado(null);
      setEstadoCuenta({ ...estadoCuenta, clienteId: '' });
      setCliente({
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        direccion: '',
        cuit: ''
      });
    }
  };

  const generarNumeroEstado = async () => {
    try {
      const estadosData = await apiService.obtenerDocumentos('estados', { 
        ordenarPor: 'fechaCreacion', 
        limite: 1 
      });
      
      let nuevoNumero = 'EC-001-2025';
      
      if (estadosData && estadosData.length > 0) {
        const ultimoEstado = estadosData[0];
        const ultimoNumero = ultimoEstado.numero;
        const numeroActual = parseInt(ultimoNumero.split('-')[1]);
        const año = new Date().getFullYear();
        nuevoNumero = `EC-${String(numeroActual + 1).padStart(3, '0')}-${año}`;
      }
      
      setEstadoCuenta(prev => ({ ...prev, numero: nuevoNumero }));
    } catch (error) {
      console.error('Error al generar número:', error);
      const año = new Date().getFullYear();
      setEstadoCuenta(prev => ({ ...prev, numero: `EC-001-${año}` }));
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

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  // MANEJO MEJORADO DE CAMBIOS EN ESTADO
  const handleEstadoChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEstadoCuenta({
        ...estadoCuenta,
        [parent]: {
          ...estadoCuenta[parent],
          [child]: value
        }
      });
    } else {
      setEstadoCuenta({ ...estadoCuenta, [name]: value });
    }
  };

  // FUNCIÓN MEJORADA PARA MOVIMIENTOS
  const handleMovimientoChange = (id, field, value) => {
    const updatedMovimientos = estadoCuenta.movimientos.map(mov => {
      if (mov.id === id) {
        return { ...mov, [field]: value };
      }
      return mov;
    });

    setEstadoCuenta({
      ...estadoCuenta,
      movimientos: updatedMovimientos
    });
  };

  const addMovimiento = () => {
    const newId = Math.max(...estadoCuenta.movimientos.map(mov => mov.id), 0) + 1;
    setEstadoCuenta({
      ...estadoCuenta,
      movimientos: [
        ...estadoCuenta.movimientos,
        { 
          id: newId, 
          fecha: '', 
          concepto: '', 
          monto: ''
        }
      ]
    });
  };

  const removeMovimiento = (id) => {
    if (estadoCuenta.movimientos.length === 1) return;

    const updatedMovimientos = estadoCuenta.movimientos.filter(mov => mov.id !== id);
    setEstadoCuenta({
      ...estadoCuenta,
      movimientos: updatedMovimientos
    });
  };

  // CÁLCULOS MEJORADOS
  const calcularSaldoActual = () => {
    const saldoAnterior = parseSecureFloat(estadoCuenta.saldoAnterior);
    const totalMovimientos = estadoCuenta.movimientos.reduce((sum, mov) => {
      return sum + parseSecureFloat(mov.monto);
    }, 0);
    return Math.round((saldoAnterior + totalMovimientos) * 100) / 100;
  };

  const calcularTotales = () => {
    const totalCargos = estadoCuenta.movimientos.reduce((sum, mov) => {
      const monto = parseSecureFloat(mov.monto);
      return monto > 0 ? sum + monto : sum;
    }, 0);

    const totalAbonos = estadoCuenta.movimientos.reduce((sum, mov) => {
      const monto = parseSecureFloat(mov.monto);
      return monto < 0 ? sum + Math.abs(monto) : sum;
    }, 0);

    return { 
      totalCargos: Math.round(totalCargos * 100) / 100, 
      totalAbonos: Math.round(totalAbonos * 100) / 100 
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getTipoMovimiento = (monto) => {
    const valor = parseSecureFloat(monto);
    if (valor > 0) return { 
      tipo: 'Cargo', 
      color: 'text-red-600 bg-red-50 border-red-200', 
      icon: '+',
      textColor: 'text-red-600'
    };
    if (valor < 0) return { 
      tipo: 'Abono', 
      color: 'text-green-600 bg-green-50 border-green-200', 
      icon: '-',
      textColor: 'text-green-600'
    };
    return { 
      tipo: 'Neutro', 
      color: 'text-gray-600 bg-gray-50 border-gray-200', 
      icon: '=',
      textColor: 'text-gray-600'
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (tipoCliente === 'existente' && !estadoCuenta.clienteId) {
      alert('Por favor, selecciona un cliente del sistema.');
      return;
    }

    if (!estadoCuenta.numero || !cliente.nombre || !cliente.empresa) {
      alert('Por favor completa los campos obligatorios: Número, Cliente y Empresa');
      return;
    }

    if (!estadoCuenta.periodo.desde || !estadoCuenta.periodo.hasta) {
      alert('Por favor especifica el período del estado de cuenta');
      return;
    }

    if (estadoCuenta.movimientos.some(mov => !mov.fecha || !mov.concepto)) {
      alert('Por favor completa la fecha y concepto de todos los movimientos');
      return;
    }

    setGuardando(true);

    try {
      const estadoData = {
        numero: estadoCuenta.numero,
        cliente: cliente,
        clienteId: estadoCuenta.clienteId || null,
        tipoCliente: tipoCliente,
        periodo: estadoCuenta.periodo,
        saldoAnterior: parseSecureFloat(estadoCuenta.saldoAnterior),
        movimientos: estadoCuenta.movimientos.map(mov => ({
          ...mov,
          monto: parseSecureFloat(mov.monto)
        })),
        saldoActual: calcularSaldoActual(),
        observaciones: estadoCuenta.observaciones,
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        usuarioCreador: user.email,
        creadoPor: user.email,
        empresa: 'IMSSE INGENIERÍA S.A.S'
      };

      await apiService.crearDocumento('estados', estadoData);
      alert('Estado de cuenta IMSSE creado exitosamente');
      router.push('/admin/estados');
    } catch (error) {
      console.error('Error al crear estado de cuenta:', error);
      alert('Error al crear el estado de cuenta. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando formulario IMSSE...</p>
        </div>
      </div>
    );
  }

  const { totalCargos, totalAbonos } = calcularTotales();

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
            <div className="flex items-center">
              <Link href="/admin/panel-control" className="text-primary hover:underline">
                <Home size={16} className="inline mr-1" />
                Panel de Control
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <Link href="/admin/estados" className="text-primary hover:underline">
                Estados de Cuenta
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="font-medium text-gray-700">Nuevo Estado</span>
            </div>

            <div className="flex space-x-2">
              <Link
                href="/admin/estados"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" />
                Cancelar
              </Link>
              <button
                type="submit"
                form="estado-cuenta-form"
                disabled={guardando}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />
                {guardando ? 'Guardando...' : 'Crear Estado'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
            Crear Nuevo Estado de Cuenta
          </h2>

          <form id="estado-cuenta-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Información del Estado de Cuenta */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Estado de Cuenta</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Número *</label>
                  <input
                    type="text"
                    name="numero"
                    value={estadoCuenta.numero}
                    onChange={handleEstadoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Desde *</label>
                  <input
                    type="date"
                    name="periodo.desde"
                    value={estadoCuenta.periodo.desde}
                    onChange={handleEstadoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Hasta *</label>
                  <input
                    type="date"
                    name="periodo.hasta"
                    value={estadoCuenta.periodo.hasta}
                    onChange={handleEstadoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">Saldo Anterior</label>
                <input
                  type="number"
                  name="saldoAnterior"
                  value={estadoCuenta.saldoAnterior}
                  onChange={handleEstadoChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent md:w-1/3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                  onBlur={(e) => {
                    const value = parseSecureFloat(e.target.value);
                    setEstadoCuenta(prev => ({ ...prev, saldoAnterior: value }));
                  }}
                />
              </div>
            </div>

            {/* Selección de Cliente */}
            <div className="p-6 bg-white border-l-4 border-orange-500 rounded-lg shadow-md">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
                <User className="mr-2" size={20} />
                Selección de Cliente
              </h3>
              
              <div className="mb-6">
                <div className="flex mb-4 space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoCliente"
                      value="existente"
                      checked={tipoCliente === 'existente'}
                      onChange={() => handleCambiarTipoCliente('existente')}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">Cliente del sistema</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoCliente"
                      value="manual"
                      checked={tipoCliente === 'manual'}
                      onChange={() => handleCambiarTipoCliente('manual')}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">Cliente nuevo (manual)</span>
                  </label>
                </div>

                {tipoCliente === 'existente' && (
                  <div className="p-4 rounded-lg bg-orange-50">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Seleccionar cliente registrado *
                    </label>
                    <select
                      value={estadoCuenta.clienteId}
                      onChange={(e) => handleSeleccionarCliente(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                      disabled={cargandoClientes}
                    >
                      <option value="">
                        {cargandoClientes ? 'Cargando clientes...' : 'Seleccionar cliente...'}
                      </option>
                      {clientesDisponibles.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.empresa} - {cliente.nombreCompleto}
                        </option>
                      ))}
                    </select>
                    
                    {clienteSeleccionado && (
                      <div className="p-3 mt-3 bg-white border border-orange-200 rounded">
                        <div className="text-sm">
                          <p className="font-medium">{clienteSeleccionado.nombreCompleto}</p>
                          <p className="text-gray-600">{clienteSeleccionado.email}</p>
                          {clienteSeleccionado.telefono && (
                            <p className="text-gray-600">{clienteSeleccionado.telefono}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {clientesDisponibles.length === 0 && !cargandoClientes && (
                      <p className="mt-2 text-sm text-yellow-600">
                        No hay clientes activos en el sistema. 
                        <Link href="/admin/usuarios" className="underline hover:text-yellow-800">
                          Crear cliente aquí
                        </Link>
                      </p>
                    )}
                  </div>
                )}

                {tipoCliente === 'manual' && (
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="mb-3 text-sm text-gray-600">
                      Los datos se ingresarán manualmente y no se asignará a un usuario del sistema.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
                <Building2 className="mr-2" size={20} />
                Información del Cliente
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={cliente.nombre}
                    onChange={handleClienteChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nombre del contacto"
                    required
                    disabled={tipoCliente === 'existente' && clienteSeleccionado}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Empresa *</label>
                  <input
                    type="text"
                    name="empresa"
                    value={cliente.empresa}
                    onChange={handleClienteChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nombre de la empresa"
                    required
                    disabled={tipoCliente === 'existente' && clienteSeleccionado}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={cliente.email}
                    onChange={handleClienteChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="cliente@email.com"
                    disabled={tipoCliente === 'existente' && clienteSeleccionado}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={cliente.telefono}
                    onChange={handleClienteChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+54 351 123 4567"
                    disabled={tipoCliente === 'existente' && clienteSeleccionado}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">CUIT</label>
                  <input
                    type="text"
                    name="cuit"
                    value={cliente.cuit}
                    onChange={handleClienteChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="XX-XXXXXXXX-X"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={cliente.direccion}
                    onChange={handleClienteChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Dirección completa"
                  />
                </div>
              </div>
              
              {tipoCliente === 'existente' && clienteSeleccionado && (
                <div className="p-3 mt-4 border border-green-200 rounded-md bg-green-50">
                  <p className="text-sm text-green-800">
                    ✅ <strong>Estado de cuenta será asignado a:</strong> {clienteSeleccionado.empresa}
                    <br />
                    <span className="text-green-600">El cliente podrá ver este documento en su panel.</span>
                  </p>
                </div>
              )}
              
              {tipoCliente === 'manual' && (
                <div className="p-3 mt-4 border border-yellow-200 rounded-md bg-yellow-50">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Modo manual:</strong> Este estado de cuenta no estará visible para ningún cliente en el sistema.
                  </p>
                </div>
              )}
            </div>

            {/* TABLA DE MOVIMIENTOS CON SCROLL HORIZONTAL MEJORADO */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200 sm:p-6">
                <h3 className="flex items-center text-lg font-medium text-gray-900">
                  <FileText className="mr-2" size={20} />
                  Movimientos del Período
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Agrega los movimientos que corresponden a este período
                </p>
              </div>

              {/* CONTENEDOR CON SCROLL HORIZONTAL */}
              <div className="table-scroll-container">
                <div className="table-wrapper">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                          <Calendar size={16} className="inline mr-1" />
                          Fecha
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                          <FileText size={16} className="inline mr-1" />
                          Concepto
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase sm:px-6">
                          <DollarSign size={16} className="inline mr-1" />
                          Monto
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase sm:px-6">
                          Tipo
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase sm:px-6">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estadoCuenta.movimientos.map((movimiento) => {
                        const tipoInfo = getTipoMovimiento(movimiento.monto);
                        return (
                          <tr key={movimiento.id} className="hover:bg-gray-50">
                            <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                              <input
                                type="date"
                                value={movimiento.fecha}
                                onChange={(e) => handleMovimientoChange(movimiento.id, 'fecha', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                              />
                            </td>
                            <td className="px-3 py-4 sm:px-6">
                              <input
                                type="text"
                                value={movimiento.concepto}
                                onChange={(e) => handleMovimientoChange(movimiento.id, 'concepto', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Ej: Factura FC-001 - Servicios"
                                required
                              />
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                              <input
                                type="number"
                                value={movimiento.monto}
                                onChange={(e) => handleMovimientoChange(movimiento.id, 'monto', e.target.value)}
                                step="0.01"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="0.00"
                                onBlur={(e) => {
                                  const value = parseSecureFloat(e.target.value);
                                  handleMovimientoChange(movimiento.id, 'monto', value);
                                }}
                              />
                              <div className="mt-1 text-xs text-gray-500">
                                + suma | - resta
                              </div>
                            </td>
                            <td className="px-3 py-4 text-center whitespace-nowrap sm:px-6">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${tipoInfo.color}`}>
                                <span className="mr-1">{tipoInfo.icon}</span>
                                {tipoInfo.tipo}
                              </div>
                              <div className={`text-xs mt-1 font-medium ${tipoInfo.textColor}`}>
                                {formatCurrency(Math.abs(parseSecureFloat(movimiento.monto)))}
                              </div>
                            </td>
                            <td className="px-3 py-4 text-center whitespace-nowrap sm:px-6">
                              <button
                                type="button"
                                onClick={() => removeMovimiento(movimiento.id)}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                disabled={estadoCuenta.movimientos.length === 1}
                                title="Eliminar movimiento"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Indicador de scroll en móvil */}
              <div className="px-4 py-2 text-center border-t border-gray-200 bg-gray-50 sm:hidden">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <span>👈</span>
                  <span>Deslizá para ver más columnas</span>
                  <span>👉</span>
                </div>
              </div>

              {/* Botón agregar movimiento */}
              <div className="px-4 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={addMovimiento}
                  className="flex items-center px-4 py-2 text-blue-600 transition-colors border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100"
                >
                  <Plus size={18} className="mr-2" /> 
                  Agregar movimiento
                </button>
              </div>

              {/* Ejemplos de uso */}
              <div className="px-4 py-4 sm:px-6">
                <div className="p-3 text-sm border border-blue-200 rounded-md bg-blue-50">
                  <h4 className="font-medium text-blue-800">💡 Ejemplos de uso:</h4>
                  <ul className="mt-2 space-y-1 text-blue-700">
                    <li><strong>Factura:</strong> "Factura FC-001 - Mantenimiento" → Monto: <span className="text-red-600">50000</span></li>
                    <li><strong>Pago:</strong> "Pago recibido - Transferencia" → Monto: <span className="text-green-600">-30000</span></li>
                    <li><strong>Nota de crédito:</strong> "NC-001 - Descuento" → Monto: <span className="text-green-600">-5000</span></li>
                  </ul>
                </div>
              </div>

              {/* Resumen financiero */}
              <div className="px-4 py-6 border-t border-gray-200 sm:px-6 bg-gray-50">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">📊 Resumen del Estado de Cuenta</h4>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="p-3 bg-white border border-gray-200 rounded">
                    <span className="block text-xs text-gray-600">Saldo Anterior:</span>
                    <span className="text-sm font-bold text-gray-800">{formatCurrency(parseSecureFloat(estadoCuenta.saldoAnterior))}</span>
                  </div>
                  <div className="p-3 bg-white border border-red-200 rounded">
                    <span className="block text-xs text-gray-600">Total Cargos:</span>
                    <span className="text-sm font-bold text-red-600">
                      +{formatCurrency(totalCargos)}
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-green-200 rounded">
                    <span className="block text-xs text-gray-600">Total Abonos:</span>
                    <span className="text-sm font-bold text-green-600">
                      -{formatCurrency(totalAbonos)}
                    </span>
                  </div>
                  <div className="p-3 bg-white border-2 rounded border-primary">
                    <span className="block text-xs text-gray-600">Saldo Actual:</span>
                    <span className={`text-lg font-bold ${calcularSaldoActual() >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(calcularSaldoActual())}
                    </span>
                  </div>
                </div>
                
                {/* Indicador visual del estado */}
                <div className="mt-4 text-center">
                  {calcularSaldoActual() > 0 && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-800 bg-red-100 border border-red-200 rounded-full">
                      ⚠️ Cliente debe: {formatCurrency(calcularSaldoActual())}
                    </span>
                  )}
                  {calcularSaldoActual() < 0 && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 border border-green-200 rounded-full">
                      ✅ Saldo a favor: {formatCurrency(Math.abs(calcularSaldoActual()))}
                    </span>
                  )}
                  {calcularSaldoActual() === 0 && (
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-200 rounded-full">
                      ✅ Cuenta al día
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Observaciones</h3>
              <textarea
                name="observaciones"
                value={estadoCuenta.observaciones}
                onChange={handleEstadoChange}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Observaciones adicionales sobre el estado de cuenta..."
              />
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2">
              <Link
                href="/admin/estados"
                className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={guardando}
                className="flex items-center px-6 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />
                {guardando ? 'Creando...' : 'Crear Estado de Cuenta'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ESTILOS PARA EL SCROLL HORIZONTAL */}
      <style jsx>{`
        .table-scroll-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .table-wrapper {
          min-width: 800px;
        }
        
        @media (min-width: 768px) {
          .table-wrapper {
            min-width: 100%;
          }
        }
        
        /* Personalizar scrollbar */
        .table-scroll-container::-webkit-scrollbar {
          height: 8px;
        }
        
        .table-scroll-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        .table-scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .table-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}