// app/admin/estados-cuenta/nuevo/page.jsx - CON SELECTOR DE CLIENTE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, ArrowLeft, Plus, Trash2, Calendar, DollarSign, User, Building2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';

export default function CrearEstadoCuenta() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  // NUEVO: Estados para gestión de clientes
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [tipoCliente, setTipoCliente] = useState('existente'); // 'existente' | 'manual'
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
    clienteId: '', // ← NUEVO CAMPO CRÍTICO
    periodo: {
      desde: '',
      hasta: ''
    },
    saldoAnterior: 0,
    movimientos: [
      { 
        id: 1, 
        fecha: '', 
        tipo: 'factura', 
        concepto: '', 
        numero: '', 
        debe: 0, 
        haber: 0 
      }
    ],
    observaciones: ''
  });

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

  // NUEVA FUNCIÓN: Cargar clientes activos del sistema
  const cargarClientesDisponibles = async () => {
    setCargandoClientes(true);
    try {
      const usuariosData = await apiService.obtenerUsuarios();
      const clientes = usuariosData.users.filter(u => 
        u.rol === 'cliente' && u.estado === 'activo'
      );
      setClientesDisponibles(clientes);
      console.log('Clientes disponibles:', clientes);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setCargandoClientes(false);
    }
  };

  // NUEVA FUNCIÓN: Manejar selección de cliente existente
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
      
      // Llenar automáticamente los datos del cliente
      setCliente({
        nombre: clienteEncontrado.nombreCompleto || '',
        empresa: clienteEncontrado.empresa || '',
        email: clienteEncontrado.email || '',
        telefono: clienteEncontrado.telefono || '',
        direccion: '', // Se puede llenar manualmente
        cuit: '' // Se puede llenar manualmente
      });
    }
  };

  // FUNCIÓN MODIFICADA: Cambiar tipo de cliente
  const handleCambiarTipoCliente = (tipo) => {
    setTipoCliente(tipo);
    if (tipo === 'manual') {
      // Limpiar selección y permitir edición manual
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
      // Usar la API en lugar de Firestore directo
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

  const handleMovimientoChange = (id, field, value) => {
    const updatedMovimientos = estadoCuenta.movimientos.map(mov => {
      if (mov.id === id) {
        const updatedMov = { ...mov, [field]: value };
        
        // Recalcular saldo automáticamente
        if (field === 'debe' || field === 'haber') {
          updatedMov.debe = field === 'debe' ? parseFloat(value) || 0 : mov.debe;
          updatedMov.haber = field === 'haber' ? parseFloat(value) || 0 : mov.haber;
        }
        
        return updatedMov;
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
          tipo: 'factura', 
          concepto: '', 
          numero: '', 
          debe: 0, 
          haber: 0 
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

  // Calcular saldo actual
  const calcularSaldoActual = () => {
    const saldoAnterior = parseFloat(estadoCuenta.saldoAnterior) || 0;
    const totalDebe = estadoCuenta.movimientos.reduce((sum, mov) => sum + (parseFloat(mov.debe) || 0), 0);
    const totalHaber = estadoCuenta.movimientos.reduce((sum, mov) => sum + (parseFloat(mov.haber) || 0), 0);
    return saldoAnterior + totalDebe - totalHaber;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDACIÓN: Verificar que hay cliente asignado para clientes existentes
    if (tipoCliente === 'existente' && !estadoCuenta.clienteId) {
      alert('Por favor, selecciona un cliente del sistema.');
      return;
    }

    // Validaciones
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
        clienteId: estadoCuenta.clienteId || null, // ← CAMPO CRÍTICO
        tipoCliente: tipoCliente, // Para referencia
        periodo: estadoCuenta.periodo,
        saldoAnterior: parseFloat(estadoCuenta.saldoAnterior) || 0,
        movimientos: estadoCuenta.movimientos.map(mov => ({
          ...mov,
          debe: parseFloat(mov.debe) || 0,
          haber: parseFloat(mov.haber) || 0
        })),
        saldoActual: calcularSaldoActual(),
        observaciones: estadoCuenta.observaciones,
        fechaCreacion: new Date(),
        fechaModificacion: new Date(),
        usuarioCreador: user.email,
        creadoPor: user.email,
        empresa: 'IMSSE INGENIERÍA S.A.S'
      };

      console.log('Guardando estado de cuenta con datos:', estadoData);

      // Usar apiService en lugar de addDoc
      await apiService.crearDocumento('estados', estadoData);
      alert('Estado de cuenta IMSSE creado exitosamente');
      router.push('/admin/estados-cuenta');
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
            <div className="flex items-center">
              <Link href="/admin/panel-control" className="text-primary hover:underline">
                <Home size={16} className="inline mr-1" />
                Panel de Control
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <Link href="/admin/estados-cuenta" className="text-primary hover:underline">
                Estados de Cuenta
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="font-medium text-gray-700">Nuevo Estado</span>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-2">
              <Link
                href="/admin/estados-cuenta"
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
                  value={estadoCuenta.saldoAnterior || ''}
                  onChange={handleEstadoChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent md:w-1/3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* NUEVA SECCIÓN: Selección de Cliente */}
            <div className="p-6 bg-white border-l-4 border-orange-500 rounded-lg shadow-md">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
                <User className="mr-2" size={20} />
                Selección de Cliente
              </h3>
              
              {/* Toggle entre cliente existente y manual */}
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

                {/* Selector de cliente existente */}
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
                    
                    {/* Información del cliente seleccionado */}
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

                {/* Modo manual */}
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
              
              {/* Indicador de asignación */}
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

            {/* Movimientos */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Movimientos del Período</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Fecha</th>
                      <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Tipo</th>
                      <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Número</th>
                      <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Concepto</th>
                      <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Debe</th>
                      <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Haber</th>
                      <th className="w-16 px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estadoCuenta.movimientos.map((movimiento) => (
                      <tr key={movimiento.id}>
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={movimiento.fecha}
                            onChange={(e) => handleMovimientoChange(movimiento.id, 'fecha', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={movimiento.tipo}
                            onChange={(e) => handleMovimientoChange(movimiento.id, 'tipo', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="factura">Factura</option>
                            <option value="pago">Pago</option>
                            <option value="nota_credito">Nota Crédito</option>
                            <option value="nota_debito">Nota Débito</option>
                            <option value="ajuste">Ajuste</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={movimiento.numero}
                            onChange={(e) => handleMovimientoChange(movimiento.id, 'numero', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Número"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={movimiento.concepto}
                            onChange={(e) => handleMovimientoChange(movimiento.id, 'concepto', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Concepto del movimiento"
                            required
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={movimiento.debe || ''}
                            onChange={(e) => handleMovimientoChange(movimiento.id, 'debe', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={movimiento.haber || ''}
                            onChange={(e) => handleMovimientoChange(movimiento.id, 'haber', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeMovimiento(movimiento.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={estadoCuenta.movimientos.length === 1}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={addMovimiento}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <Plus size={18} className="mr-1" /> Agregar movimiento
                </button>
              </div>

              {/* Resumen */}
              <div className="p-4 mt-6 rounded-lg bg-gray-50">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Resumen del Estado de Cuenta</h4>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <span className="block text-xs text-gray-600">Saldo Anterior:</span>
                    <span className="font-bold">{formatCurrency(estadoCuenta.saldoAnterior)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-600">Total Debe:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(estadoCuenta.movimientos.reduce((sum, mov) => sum + (parseFloat(mov.debe) || 0), 0))}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-600">Total Haber:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(estadoCuenta.movimientos.reduce((sum, mov) => sum + (parseFloat(mov.haber) || 0), 0))}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-600">Saldo Actual:</span>
                    <span className={`font-bold text-lg ${calcularSaldoActual() >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(calcularSaldoActual())}
                    </span>
                  </div>
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
                href="/admin/estados-cuenta"
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
    </div>
  );
}