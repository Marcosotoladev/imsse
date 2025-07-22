// app/admin/estados-cuenta/editar/[id]/page.jsx - Editar Estado de Cuenta IMSSE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, ArrowLeft, Plus, Trash2, Download } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../../lib/firebase';

export default function EditarEstadoCuenta() {
  const router = useRouter();
  const params = useParams();
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
    if (!params.id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const docRef = doc(db, 'estados_cuenta', params.id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const estadoData = { id: docSnap.id, ...docSnap.data() };
            setEstadoOriginal(estadoData);

            setEstadoCuenta({
              numero: estadoData.numero || '',
              periodo: {
                desde: estadoData.periodo?.desde || '',
                hasta: estadoData.periodo?.hasta || ''
              },
              saldoAnterior: estadoData.saldoAnterior || 0,
              movimientos: estadoData.movimientos || [
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
            
          } else {
            alert('Estado de cuenta no encontrado.');
            router.push('/admin/estados-cuenta');
          }
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar estado de cuenta:', error);
          alert('Error al cargar los datos del estado de cuenta.');
          router.push('/admin/estados-cuenta');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [params.id, router]);

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

  const handleDescargarPDF = async () => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: EstadoCuentaPDF } = await import('../../../../components/pdf/EstadoCuentaPDF');
      
      const estadoActualizado = {
        ...estadoOriginal,
        ...estadoCuenta,
        cliente: cliente,
        saldoActual: calcularSaldoActual()
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
        periodo: estadoCuenta.periodo,
        saldoAnterior: parseFloat(estadoCuenta.saldoAnterior) || 0,
        movimientos: estadoCuenta.movimientos.map(mov => ({
          ...mov,
          debe: parseFloat(mov.debe) || 0,
          haber: parseFloat(mov.haber) || 0
        })),
        saldoActual: calcularSaldoActual(),
        observaciones: estadoCuenta.observaciones,
        fechaModificacion: serverTimestamp(),
        empresa: 'IMSSE INGENIERÍA S.A.S'
      };

      await updateDoc(doc(db, 'estados_cuenta', params.id), estadoData);
      alert('Estado de cuenta actualizado exitosamente');
      router.push('/admin/estados-cuenta');
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
              <span className="font-medium text-gray-700">Editar {estadoCuenta.numero}</span>
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

            {/* Información del Cliente */}
            <div className="p-6 bg-white rounded-lg shadow-md">
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
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}