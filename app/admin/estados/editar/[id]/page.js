// app/admin/estados/editar/[id]/page.jsx - NÚMEROS CORREGIDOS COMPLETO
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, ArrowLeft, Plus, Trash2, Download, Calendar, DollarSign, FileText } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../../../lib/firebase';
import apiService from '../../../../../lib/services/apiService';
import { use } from 'react';

export default function EditarEstadoCuenta({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [estadoOriginal, setEstadoOriginal] = useState(null);

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

  // FUNCIÓN MEJORADA PARA PARSEAR NÚMEROS COMO STRINGS
  const parseSecureNumber = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    
    // Convertir a string y limpiar
    const stringValue = String(value).trim();
    
    // Si está vacío después del trim, devolver vacío
    if (stringValue === '') return '';
    
    // Remover caracteres no numéricos excepto . y -
    const cleanValue = stringValue.replace(/[^\d.-]/g, '');
    
    // Validar que sea un número válido
    if (!/^-?\d*\.?\d*$/.test(cleanValue)) return '';
    
    return cleanValue; // Devolver como string, no como número
  };

  // FUNCIÓN PARA CONVERTIR A NÚMERO SOLO PARA CÁLCULOS
  const toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const estadoData = await apiService.obtenerEstadoCuentaPorId(id);
          setEstadoOriginal(estadoData);

          // MIGRAR DATOS SI VIENEN EN FORMATO ANTIGUO (debe/haber)
          let movimientosMigrados = estadoData.movimientos || [];

          if (movimientosMigrados.length > 0 && movimientosMigrados[0].hasOwnProperty('debe')) {
            // Convertir formato antiguo a nuevo
            movimientosMigrados = movimientosMigrados.map(mov => {
              let monto = '';
              let concepto = mov.concepto || 'Sin concepto';

              // Convertir debe/haber a monto único
              if (mov.debe && mov.debe > 0) {
                monto = String(mov.debe);
              } else if (mov.haber && mov.haber > 0) {
                monto = String(-mov.haber);
              }

              // Agregar información del tipo y número si existe
              if (mov.tipo && mov.numero) {
                const tipoTexto = mov.tipo.replace('_', ' ').toUpperCase();
                concepto = `${tipoTexto} ${mov.numero} - ${concepto}`;
              } else if (mov.tipo) {
                const tipoTexto = mov.tipo.replace('_', ' ').toUpperCase();
                concepto = `${tipoTexto} - ${concepto}`;
              }

              return {
                id: mov.id,
                fecha: mov.fecha,
                concepto: concepto,
                monto: monto
              };
            });
          } else {
            // Convertir números existentes a strings
            movimientosMigrados = movimientosMigrados.map(mov => ({
              ...mov,
              monto: String(mov.monto || '')
            }));
          }

          setEstadoCuenta({
            numero: estadoData.numero || '',
            periodo: {
              desde: estadoData.periodo?.desde || '',
              hasta: estadoData.periodo?.hasta || ''
            },
            saldoAnterior: String(estadoData.saldoAnterior || ''),
            movimientos: movimientosMigrados.length > 0 ? movimientosMigrados : [
              {
                id: 1,
                fecha: '',
                concepto: '',
                monto: ''
              }
            ],
            observaciones: estadoData.observaciones || ''
          });

          setCliente(estadoData.cliente || {
            nombre: '',
            empresa: '',
            email: '',
            telefono: '',
            direccion: '',
            cuit: ''
          });

          setLoading(false);
        } catch (error) {
          console.error('Error al cargar estado de cuenta IMSSE:', error);
          alert('Error al cargar los datos del estado de cuenta.');
          router.push('/admin/estados');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [id, router]);

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

  // MANEJO MEJORADO DE SALDO ANTERIOR
  const handleSaldoAnteriorChange = (e) => {
    const cleanValue = parseSecureNumber(e.target.value);
    setEstadoCuenta(prev => ({ ...prev, saldoAnterior: cleanValue }));
  };

  // FUNCIÓN MEJORADA PARA MOVIMIENTOS
  const handleMovimientoChange = (id, field, value) => {
    const updatedMovimientos = estadoCuenta.movimientos.map(mov => {
      if (mov.id === id) {
        if (field === 'monto') {
          const cleanValue = parseSecureNumber(value);
          return { ...mov, [field]: cleanValue };
        }
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
    const saldoAnterior = toNumber(estadoCuenta.saldoAnterior);
    const totalMovimientos = estadoCuenta.movimientos.reduce((sum, mov) => sum + toNumber(mov.monto), 0);
    return Math.round((saldoAnterior + totalMovimientos) * 100) / 100;
  };

  const calcularTotales = () => {
    const totalCargos = estadoCuenta.movimientos.reduce((sum, mov) => {
      const monto = toNumber(mov.monto);
      return monto > 0 ? sum + monto : sum;
    }, 0);

    const totalAbonos = estadoCuenta.movimientos.reduce((sum, mov) => {
      const monto = toNumber(mov.monto);
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
    const valor = toNumber(monto);
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

  const handleDescargarPDF = async () => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: EstadoCuentaPDF } = await import('../../../../components/pdf/EstadoCuentaPDF');

      const estadoActualizado = {
        ...estadoOriginal,
        ...estadoCuenta,
        cliente: cliente,
        saldoActual: calcularSaldoActual(),
        // Convertir movimientos de vuelta a números para el PDF
        movimientos: estadoCuenta.movimientos.map(mov => ({
          ...mov,
          monto: toNumber(mov.monto)
        })),
        saldoAnterior: toNumber(estadoCuenta.saldoAnterior)
      };

      const blob = await pdf(<EstadoCuentaPDF estadoCuenta={estadoActualizado} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${estadoCuenta.numero}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
      alert(`✅ Estado de cuenta ${estadoCuenta.numero} descargado exitosamente`);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        periodo: estadoCuenta.periodo,
        saldoAnterior: toNumber(estadoCuenta.saldoAnterior),
        movimientos: estadoCuenta.movimientos.map(mov => ({
          ...mov,
          monto: toNumber(mov.monto)
        })),
        saldoActual: calcularSaldoActual(),
        observaciones: estadoCuenta.observaciones,
        fechaModificacion: new Date(),
        empresa: 'IMSSE INGENIERÍA S.A.S'
      };

      await apiService.actualizarEstadoCuenta(id, estadoData);
      alert('Estado de cuenta IMSSE actualizado exitosamente');
      router.push('/admin/estados');
    } catch (error) {
      console.error('Error al actualizar estado de cuenta:', error);
      alert('Error al actualizar el estado de cuenta. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando estado de cuenta IMSSE...</p>
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
              <span className="font-medium text-gray-700">Editar {estadoCuenta.numero}</span>
            </div>

            <div className="flex space-x-2">
              <Link
                href="/admin/estados"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" />
                Cancelar
              </Link>
              {estadoCuenta.numero && (
                <button
                  onClick={handleDescargarPDF}
                  className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                >
                  <Download size={18} className="mr-2" />
                  Descargar PDF
                </button>
              )}
              <button
                type="submit"
                form="estado-cuenta-form"
                disabled={guardando}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700 disabled:opacity-50"
              >
                <Save size={18} className="mr-2" />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
            Editar Estado de Cuenta {estadoCuenta.numero}
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
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
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
                  type="text"
                  name="saldoAnterior"
                  value={estadoCuenta.saldoAnterior}
                  onChange={handleSaldoAnteriorChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent md:w-1/3"
                  placeholder="0.00"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                />
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="p-6 text-gray-700 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Cliente</h3>
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
            </div>

            {/* TABLA DE MOVIMIENTOS CON NÚMEROS CORREGIDOS */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
                <FileText className="mr-2" size={20} />
                Movimientos del Período
              </h3>

              <div className="table-scroll-container">
                <div className="table-wrapper">
                  <table className="w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-700 uppercase sm:px-4">
                          <Calendar size={16} className="inline mr-1" />
                          Fecha
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-700 uppercase sm:px-4">
                          <FileText size={16} className="inline mr-1" />
                          Concepto
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-center text-gray-700 uppercase sm:px-4">
                          <DollarSign size={16} className="inline mr-1" />
                          Monto
                        </th>
                        <th className="px-3 py-3 text-xs font-medium tracking-wider text-center text-gray-700 uppercase sm:px-4">
                          Tipo
                        </th>
                        <th className="w-12 px-3 py-3 sm:w-16 sm:px-4"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estadoCuenta.movimientos.map((movimiento) => {
                        const tipoInfo = getTipoMovimiento(movimiento.monto);
                        return (
                          <tr key={movimiento.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 sm:px-4">
                              <input
                                type="date"
                                value={movimiento.fecha}
                                onChange={(e) => handleMovimientoChange(movimiento.id, 'fecha', e.target.value)}
                                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent sm:px-3"
                                required
                              />
                            </td>
                            <td className="px-3 py-3 sm:px-4">
                              <input
                                type="text"
                                value={movimiento.concepto}
                                onChange={(e) => handleMovimientoChange(movimiento.id, 'concepto', e.target.value)}
                                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent sm:px-3"
                                placeholder="Ej: Factura FC-001 - Servicios de mantenimiento"
                                required
                              />
                            </td>
                            <td className="px-3 py-3 sm:px-4">
                              <input
                                type="text"
                                value={movimiento.monto}
                                onChange={(e) => handleMovimientoChange(movimiento.id, 'monto', e.target.value)}
                                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent sm:px-3"
                                placeholder="0.00"
                                inputMode="decimal"
                                pattern="-?[0-9]*\.?[0-9]*"
                              />
                              <div className="mt-1 text-xs text-gray-500">
                                Positivo: suma | Negativo: resta
                              </div>
                            </td>
                            <td className="px-3 py-3 sm:px-4">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${tipoInfo.color}`}>
                                <span className="mr-1">{tipoInfo.icon}</span>
                                {tipoInfo.tipo}
                              </div>
                              <div className={`text-xs mt-1 font-medium ${tipoInfo.textColor}`}>
                                {formatCurrency(Math.abs(toNumber(movimiento.monto)))}
                              </div>
                            </td>
                            <td className="px-3 py-3 sm:px-4">
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

              <div className="px-4 py-2 text-center border-t border-gray-200 bg-gray-50 sm:hidden">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <span>👈</span>
                  <span>Deslizá para ver más columnas</span>
                  <span>👉</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={addMovimiento}
                  className="flex items-center px-4 py-2 text-blue-600 transition-colors border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100"
                >
                  <Plus size={18} className="mr-2" />
                  Agregar movimiento
                </button>
              </div>

              {/* Resumen financiero */}
              <div className="p-4 mt-6 rounded-lg bg-gray-50">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">📊 Resumen del Estado de Cuenta</h4>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="p-3 bg-white border border-gray-200 rounded">
                    <span className="block text-xs text-gray-600">Saldo Anterior:</span>
                    <span className="text-sm font-bold text-gray-800">{formatCurrency(toNumber(estadoCuenta.saldoAnterior))}</span>
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
                <div className="mt-3 text-center">
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
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}