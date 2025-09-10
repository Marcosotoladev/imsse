// app/admin/presupuestos/editar/[id]/page.jsx - CON CAMPO DESCUENTO
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, Download, Eye, PlusCircle, Trash2, Percent, DollarSign } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../../../lib/firebase';
import apiService from '../../../../../lib/services/apiService';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PresupuestoPDF from '../../../../components/pdf/PresupuestoPDF';

export default function EditarPresupuesto({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarPDF, setMostrarPDF] = useState(false);
  const [presupuestoOriginal, setPresupuestoOriginal] = useState(null);

  // Estado para el modal de descripción
  const [modalDescripcion, setModalDescripcion] = useState({
    isOpen: false,
    itemId: null,
    value: ''
  });

  // Estado del formulario
  const [cliente, setCliente] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
    cuit: ''
  });

  const [presupuesto, setPresupuesto] = useState({
    numero: '',
    fecha: '',
    items: [
      { id: 1, descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0, categoria: 'deteccion' }
    ],
    observaciones: '',
    subtotal: 0,
    iva: 0,
    // NUEVOS CAMPOS PARA DESCUENTO
    tipoDescuento: 'porcentaje',
    valorDescuento: 0,
    montoDescuento: 0,
    total: 0,
    mostrarIva: false
  });

  // FUNCIÓN: Calcular totales con descuento
  const calcularTotales = (items, mostrarIva, tipoDescuento, valorDescuento) => {
    const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const iva = mostrarIva ? Math.round(subtotal * 0.21) : 0;
    const totalAntesDescuento = subtotal + iva;

    let montoDescuento = 0;
    if (valorDescuento > 0) {
      if (tipoDescuento === 'porcentaje') {
        const porcentajeValido = Math.min(valorDescuento, 100);
        montoDescuento = Math.round(totalAntesDescuento * (porcentajeValido / 100));
      } else {
        montoDescuento = Math.min(valorDescuento, totalAntesDescuento);
      }
    }

    const total = totalAntesDescuento - montoDescuento;

    return {
      subtotal,
      iva,
      montoDescuento,
      total: Math.max(total, 0)
    };
  };

  // Función para formatear moneda estilo argentino
  const formatMoney = (amount) => {
    if (!amount) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const presupuestoData = await apiService.obtenerPresupuestoPorId(id);
          setPresupuestoOriginal(presupuestoData);

          const procesarFecha = (fecha) => {
            if (!fecha) return '';
            if (fecha._seconds) {
              const date = new Date(fecha._seconds * 1000);
              return date.toISOString().split('T')[0];
            }
            if (typeof fecha === 'string') {
              return new Date(fecha).toISOString().split('T')[0];
            }
            if (fecha.toDate) {
              return fecha.toDate().toISOString().split('T')[0];
            }
            return new Date(fecha).toISOString().split('T')[0];
          };

          // CARGAR DATOS CON SOPORTE PARA DESCUENTO
          setPresupuesto({
            numero: presupuestoData.numero || '',
            fecha: procesarFecha(presupuestoData.fecha),
            items: presupuestoData.items || [],
            observaciones: presupuestoData.observaciones || '',
            subtotal: presupuestoData.subtotal || 0,
            iva: presupuestoData.iva || 0,
            // CAMPOS DE DESCUENTO (con valores por defecto si no existen)
            tipoDescuento: presupuestoData.tipoDescuento || 'porcentaje',
            valorDescuento: presupuestoData.valorDescuento || 0,
            montoDescuento: presupuestoData.montoDescuento || 0,
            total: presupuestoData.total || 0,
            mostrarIva: presupuestoData.mostrarIva || false
          });

          setCliente(presupuestoData.cliente || {});
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar presupuesto:', error);
          alert('Error al cargar los datos del presupuesto.');
          router.push('/admin/presupuestos');
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

  const adaptarDatosParaPDF = (presupuesto, cliente) => {
    return {
      ...presupuesto,
      fecha: new Date(presupuesto.fecha),
      fechaVencimiento: new Date(presupuesto.fechaVencimiento),
      cliente: cliente,
      items: presupuesto.items || [],
      subtotal: presupuesto.subtotal || 0,
      iva: presupuesto.iva || 0,
      // INCLUIR CAMPOS DE DESCUENTO EN PDF
      tipoDescuento: presupuesto.tipoDescuento || 'porcentaje',
      valorDescuento: presupuesto.valorDescuento || 0,
      montoDescuento: presupuesto.montoDescuento || 0,
      total: presupuesto.total || 0,
      validez: presupuesto.validez || '30 días',
      estado: presupuestoOriginal?.estado || 'pendiente',
      mostrarIva: presupuesto.mostrarIva || false
    };
  };

  const abrirModalDescripcion = (itemId, descripcion) => {
    setModalDescripcion({
      isOpen: true,
      itemId: itemId,
      value: descripcion
    });
  };

  const guardarDescripcion = () => {
    handleItemChange(modalDescripcion.itemId, 'descripcion', modalDescripcion.value);
    setModalDescripcion({
      isOpen: false,
      itemId: null,
      value: ''
    });
  };

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = presupuesto.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'cantidad' || field === 'precioUnitario') {
          const cantidad = parseFloat(updatedItem.cantidad || 0);
          const precio = parseFloat(updatedItem.precioUnitario || 0);
          updatedItem.subtotal = cantidad * precio;
        }
        return updatedItem;
      }
      return item;
    });

    // Recalcular totales con descuento
    const totales = calcularTotales(
      updatedItems,
      presupuesto.mostrarIva,
      presupuesto.tipoDescuento,
      presupuesto.valorDescuento
    );

    setPresupuesto({
      ...presupuesto,
      items: updatedItems,
      ...totales
    });
  };

  // FUNCIÓN: Manejar cambios en el descuento
  const handleDescuentoChange = (field, value) => {
    let updatedPresupuesto = { ...presupuesto };

    if (field === 'tipoDescuento') {
      updatedPresupuesto.tipoDescuento = value;
      updatedPresupuesto.valorDescuento = 0;
    } else if (field === 'valorDescuento') {
      const numValue = parseFloat(value) || 0;
      if (presupuesto.tipoDescuento === 'porcentaje') {
        updatedPresupuesto.valorDescuento = Math.min(Math.max(numValue, 0), 100);
      } else {
        updatedPresupuesto.valorDescuento = Math.max(numValue, 0);
      }
    }

    // Recalcular totales
    const totales = calcularTotales(
      presupuesto.items,
      presupuesto.mostrarIva,
      updatedPresupuesto.tipoDescuento,
      updatedPresupuesto.valorDescuento
    );

    setPresupuesto({
      ...updatedPresupuesto,
      ...totales
    });
  };

  const addItem = () => {
    const newId = Math.max(...presupuesto.items.map(item => item.id), 0) + 1;
    const updatedItems = [
      ...presupuesto.items,
      { id: newId, descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0, categoria: 'deteccion' }
    ];

    const totales = calcularTotales(
      updatedItems,
      presupuesto.mostrarIva,
      presupuesto.tipoDescuento,
      presupuesto.valorDescuento
    );

    setPresupuesto({
      ...presupuesto,
      items: updatedItems,
      ...totales
    });
  };

  const removeItem = (id) => {
    if (presupuesto.items.length === 1) return;

    const updatedItems = presupuesto.items.filter(item => item.id !== id);
    const totales = calcularTotales(
      updatedItems,
      presupuesto.mostrarIva,
      presupuesto.tipoDescuento,
      presupuesto.valorDescuento
    );

    setPresupuesto({
      ...presupuesto,
      items: updatedItems,
      ...totales
    });
  };

  const handleGuardarPresupuesto = async () => {
    setGuardando(true);
    try {
      const presupuestoData = {
        numero: presupuesto.numero,
        fecha: new Date(presupuesto.fecha),
        cliente: cliente,
        items: presupuesto.items,
        observaciones: presupuesto.observaciones,
        subtotal: presupuesto.subtotal,
        iva: presupuesto.iva,
        // INCLUIR CAMPOS DE DESCUENTO AL GUARDAR
        tipoDescuento: presupuesto.tipoDescuento,
        valorDescuento: presupuesto.valorDescuento,
        montoDescuento: presupuesto.montoDescuento,
        total: presupuesto.total,
        mostrarIva: presupuesto.mostrarIva,
        estado: presupuestoOriginal.estado || 'pendiente',
        fechaModificacion: new Date()
      };

      await apiService.actualizarPresupuesto(id, presupuestoData);
      alert('Presupuesto actualizado exitosamente');
      router.push('/admin/presupuestos');
    } catch (error) {
      console.error('Error al actualizar el presupuesto:', error);
      alert('Error al actualizar el presupuesto. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando presupuesto IMSSE...</p>
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
              href="/admin/panel-control"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              <Home size={16} className="mr-1" /> Panel de Control
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link
              href="/admin/presupuestos"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              Presupuestos
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Editar Presupuesto</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Link
              href={`/admin/presupuestos/${id}`}
              className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Eye size={18} className="mr-2" /> Ver
            </Link>
            <button
              onClick={() => setMostrarPDF(true)}
              className="flex items-center px-4 py-2 text-white transition-colors bg-purple-600 rounded-md hover:bg-purple-700"
            >
              <Download size={18} className="mr-2" /> Descargar PDF
            </button>

            {/* PDF solo se renderiza cuando se necesita */}
            {mostrarPDF && (
              <div style={{ position: 'absolute', left: '-9999px' }}>
                <PDFDownloadLink
                  document={<PresupuestoPDF presupuesto={{
                    ...presupuesto,
                    cliente,
                    mostrarIva: Boolean(presupuesto.mostrarIva),
                    subtotal: parseFloat(presupuesto.subtotal) || 0,
                    iva: parseFloat(presupuesto.iva) || 0,
                    total: parseFloat(presupuesto.total) || 0
                  }} />}
                  fileName={`${presupuesto.numero}.pdf`}
                >
                  {({ blob, url, loading, error }) => {
                    if (url) {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${presupuesto.numero}.pdf`;
                      link.click();
                      setMostrarPDF(false);
                    }
                    return null;
                  }}
                </PDFDownloadLink>
              </div>
            )}
            <button
              onClick={handleGuardarPresupuesto}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Editar Presupuesto IMSSE {presupuesto.numero}
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Información del presupuesto */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Presupuesto</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Número</label>
                <input
                  type="text"
                  value={presupuesto.numero}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={presupuesto.fecha}
                  onChange={(e) => setPresupuesto({ ...presupuesto, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="p-6 text-gray-700 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Cliente</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Empresa *</label>
                <input
                  type="text"
                  name="empresa"
                  value={cliente.empresa || ''}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Persona de Contacto *</label>
                <input
                  type="text"
                  name="nombre"
                  value={cliente.nombre || ''}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={cliente.email || ''}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={cliente.telefono || ''}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">CUIT</label>
                <input
                  type="text"
                  name="cuit"
                  value={cliente.cuit || ''}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="30-12345678-9"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={cliente.direccion || ''}
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Items del presupuesto */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Detalle de Servicios y Productos</h3>

            <div className="table-scroll-container">
              <div className="table-wrapper">
                <table className="w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase sm:px-4">
                        Descripción
                      </th>
                      <th className="w-20 px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase sm:w-24 sm:px-4">
                        Cantidad
                      </th>
                      <th className="px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase w-28 sm:w-32 sm:px-4">
                        Precio Unit.
                      </th>
                      <th className="px-3 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase w-28 sm:w-32 sm:px-4">
                        Subtotal
                      </th>
                      <th className="w-12 px-3 py-2 sm:w-16 sm:px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {presupuesto.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 sm:px-4">
                          {/* Vista móvil - Botón que abre modal */}
                          <div className="md:hidden">
                            <div
                              onClick={() => abrirModalDescripcion(item.id, item.descripcion)}
                              className="min-h-[60px] p-3 border border-gray-300 rounded-md bg-gray-50 cursor-pointer flex items-center justify-between transition-colors hover:bg-gray-100"
                            >
                              <span className={`text-sm flex-1 ${item.descripcion ? 'text-gray-800' : 'text-gray-400'}`}>
                                {item.descripcion || 'Toca para agregar descripción'}
                              </span>
                              <svg className="w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </div>
                            {item.descripcion && (
                              <div className="mt-2 text-xs text-gray-500">
                                {item.descripcion.length > 50
                                  ? `${item.descripcion.substring(0, 50)}...`
                                  : item.descripcion
                                }
                              </div>
                            )}
                          </div>

                          {/* Vista desktop - Textarea normal */}
                          <div className="hidden md:block">
                            <textarea
                              value={item.descripcion}
                              onChange={(e) => handleItemChange(item.id, 'descripcion', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md min-h-[80px] resize-y"
                              placeholder="Ej: Detector de humo óptico Bosch FAP-325 con certificación..."
                              rows={4}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-4">
                          <input
                            type="text"
                            value={item.cantidad}
                            onChange={(e) => handleItemChange(item.id, 'cantidad', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            placeholder="1"
                          />
                        </td>
                        <td className="px-3 py-2 sm:px-4">
                          <input
                            type="text"
                            value={item.precioUnitario}
                            onChange={(e) => handleItemChange(item.id, 'precioUnitario', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-700 sm:px-4">
                          {formatMoney(item.subtotal)}
                        </td>
                        <td className="px-3 py-2 sm:px-4">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            disabled={presupuesto.items.length === 1}
                            title="Eliminar item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-4 py-2 text-center border-t border-gray-200 bg-gray-50 md:hidden">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <span>👈</span>
                <span>Deslizá para ver más columnas</span>
                <span>👉</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={addItem}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <PlusCircle size={18} className="mr-1" /> Agregar ítem
              </button>
            </div>

            {/* Totales con IVA y DESCUENTO */}
            <div className="w-full mt-6 ml-auto md:w-80">
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">{formatMoney(presupuesto.subtotal)}</span>
                </div>
                {presupuesto.mostrarIva && (
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-700">IVA (21%):</span>
                    <span className="font-medium">{formatMoney(presupuesto.iva)}</span>
                  </div>
                )}

                {/* SECCIÓN DE DESCUENTO */}
                {presupuesto.montoDescuento > 0 && (
                  <div className="flex justify-between py-2 text-sm text-red-600 border-b border-gray-300">
                    <span>
                      Descuento ({presupuesto.tipoDescuento === 'porcentaje'
                        ? `${presupuesto.valorDescuento}%`
                        : 'Monto fijo'}):
                    </span>
                    <span className="font-medium">-{formatMoney(presupuesto.montoDescuento)}</span>
                  </div>
                )}

                <div className="flex justify-between py-3 text-lg font-bold text-primary">
                  <span>TOTAL:</span>
                  <span>{formatMoney(presupuesto.total)}</span>
                </div>

                {/* Controles */}
                <div className="pt-3 mt-3 space-y-3 border-t border-gray-300">
                  {/* Checkbox IVA */}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={presupuesto.mostrarIva}
                      onChange={(e) => {
                        const mostrarIva = e.target.checked;
                        const totales = calcularTotales(
                          presupuesto.items,
                          mostrarIva,
                          presupuesto.tipoDescuento,
                          presupuesto.valorDescuento
                        );

                        setPresupuesto({
                          ...presupuesto,
                          mostrarIva,
                          ...totales
                        });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Incluir IVA (21%)</span>
                  </label>

                  {/* CONTROLES DE DESCUENTO */}
                  <div className="p-3 border border-orange-200 rounded-md bg-orange-50">
                    <h4 className="mb-3 text-sm font-medium text-orange-800">Descuento</h4>

                    {/* Tipo de descuento */}
                    <div className="flex mb-3 space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="tipoDescuento"
                          value="porcentaje"
                          checked={presupuesto.tipoDescuento === 'porcentaje'}
                          onChange={(e) => handleDescuentoChange('tipoDescuento', e.target.value)}
                          className="mr-2"
                        />
                        <Percent size={16} className="mr-1" />
                        <span className="text-sm">Porcentaje</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="tipoDescuento"
                          value="monto"
                          checked={presupuesto.tipoDescuento === 'monto'}
                          onChange={(e) => handleDescuentoChange('tipoDescuento', e.target.value)}
                          className="mr-2"
                        />
                        <DollarSign size={16} className="mr-1" />
                        <span className="text-sm">Monto fijo</span>
                      </label>
                    </div>

                    {/* Input de valor */}
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={presupuesto.valorDescuento}
                        onChange={(e) => handleDescuentoChange('valorDescuento', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                        placeholder={presupuesto.tipoDescuento === 'porcentaje' ? '0-100' : '0.00'}
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {presupuesto.tipoDescuento === 'porcentaje' ? '%' : '$'}
                      </span>
                    </div>

                    {/* Información del descuento */}
                    {presupuesto.valorDescuento > 0 && (
                      <div className="mt-2 text-xs text-orange-700">
                        Descuento aplicado: {formatMoney(presupuesto.montoDescuento)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Observaciones</h3>
            <textarea
              value={presupuesto.observaciones}
              onChange={(e) => setPresupuesto({ ...presupuesto, observaciones: e.target.value })}
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Observaciones adicionales, condiciones especiales, garantías, plazos de entrega, etc."
            ></textarea>
            <p className="mt-2 text-xs text-gray-500">
              Estas observaciones aparecerán en el PDF del presupuesto (opcional)
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push('/admin/presupuestos')}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarPresupuesto}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal para editar descripción */}
      {modalDescripcion.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col w-full h-full bg-white md:w-11/12 md:h-5/6 md:rounded-lg md:max-w-4xl">
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 md:rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Descripción del servicio/producto IMSSE</h3>
              <button
                onClick={() => setModalDescripcion({ isOpen: false, itemId: null, value: '' })}
                className="p-2 text-gray-500 transition-colors hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col flex-1 p-4 bg-white md:rounded-b-lg">
              <textarea
                value={modalDescripcion.value}
                onChange={(e) => setModalDescripcion({ ...modalDescripcion, value: e.target.value })}
                className="flex-1 w-full p-4 text-base border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe detalladamente el servicio o producto...

Ejemplo:
• Detector de humo óptico Bosch FAP-325
• Certificado para uso industrial
• Incluye base y cableado
• Instalación y programación
• Pruebas funcionales
• Documentación técnica"
                autoFocus
                style={{ minHeight: '300px' }}
              />

              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>{modalDescripcion.value.length} caracteres</span>
                <span className="text-xs text-gray-400">Tip: Usa viñetas (•) para mejor legibilidad</span>
              </div>

              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setModalDescripcion({ isOpen: false, itemId: null, value: '' })}
                  className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarDescripcion}
                  className="px-6 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}