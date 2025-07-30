// app/admin/remitos/nuevo/page.jsx - CON SELECTOR DE CLIENTE
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, Download, Eye, PlusCircle, Trash2, RefreshCw, ArrowLeft, User, Building2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import apiService from '../../../lib/services/apiService';
import SignatureCanvas from 'react-signature-canvas';

export default function NuevoRemito() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [showCanvas, setShowCanvas] = useState(true);
    const [descargando, setDescargando] = useState(false);
    const sigCanvas = useRef({});

    // NUEVO: Estados para gestión de clientes
    const [clientesDisponibles, setClientesDisponibles] = useState([]);
    const [cargandoClientes, setCargandoClientes] = useState(false);
    const [tipoCliente, setTipoCliente] = useState('existente'); // 'existente' | 'manual'
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

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
        direccion: ''
    });

    const [remito, setRemito] = useState({
        numero: `REM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        fecha: new Date().toISOString().split('T')[0],
        clienteId: '', // ← NUEVO CAMPO CRÍTICO
        items: [
            { id: 1, descripcion: '', cantidad: '', unidad: 'unidad' }
        ],
        observaciones: '',
        firma: null,
        aclaracionFirma: '',
        estado: 'pendiente',
        destino: '',
        transportista: ''
    });

    useEffect(() => {
        // Verificar autenticación con Firebase
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                cargarClientesDisponibles(); // ← Agregar carga de clientes
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
            setRemito({ ...remito, clienteId: '' });
            setCliente({ nombre: '', empresa: '', email: '', telefono: '', direccion: '' });
            return;
        }

        const clienteEncontrado = clientesDisponibles.find(c => c.id === clienteId);
        if (clienteEncontrado) {
            setClienteSeleccionado(clienteEncontrado);
            setRemito({ ...remito, clienteId: clienteId });
            // Auto-llenar datos del cliente
            setCliente({
                nombre: clienteEncontrado.nombreCompleto || '',
                empresa: clienteEncontrado.empresa || '',
                email: clienteEncontrado.email || '',
                telefono: clienteEncontrado.telefono || '',
                direccion: clienteEncontrado.direccion || ''
            });
        }
    };

    // FUNCIÓN MODIFICADA: Cambiar tipo de cliente
    const handleCambiarTipoCliente = (tipo) => {
        setTipoCliente(tipo);
        if (tipo === 'manual') {
            // Limpiar selección y permitir edición manual
            setClienteSeleccionado(null);
            setRemito({ ...remito, clienteId: '' });
            setCliente({ nombre: '', empresa: '', email: '', telefono: '', direccion: '' });
        }
    };

    // Función para abrir el modal de descripción
    const abrirModalDescripcion = (itemId, descripcion) => {
        setModalDescripcion({
            isOpen: true,
            itemId: itemId,
            value: descripcion
        });
    };

    // Función para guardar y cerrar el modal
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

    const handleRemitoChange = (e) => {
        const { name, value } = e.target;
        setRemito({ ...remito, [name]: value });
    };

    const handleItemChange = (id, field, value) => {
        const updatedItems = remito.items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });

        setRemito({
            ...remito,
            items: updatedItems
        });
    };

    const addItem = () => {
        const newId = Math.max(...remito.items.map(item => item.id), 0) + 1;
        setRemito({
            ...remito,
            items: [
                ...remito.items,
                { id: newId, descripcion: '', cantidad: '', unidad: 'unidad' }
            ]
        });
    };

    const removeItem = (id) => {
        if (remito.items.length === 1) return;

        const updatedItems = remito.items.filter(item => item.id !== id);
        setRemito({
            ...remito,
            items: updatedItems
        });
    };

    const clearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        setRemito({ ...remito, firma: null });
        setShowCanvas(true);
    };

    const saveSignature = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            try {
                const firmaData = sigCanvas.current.toDataURL('image/png');
                setRemito({ ...remito, firma: firmaData });
                setShowCanvas(false);
                alert('Firma guardada exitosamente');
            } catch (error) {
                console.error('Error al guardar firma:', error);
                alert('Error al guardar la firma');
            }
        } else {
            alert('Por favor, firme antes de guardar');
        }
    };

    const handleDescargarPDF = async () => {
        if (descargando) return;

        setDescargando(true);

        try {
            const { pdf } = await import('@react-pdf/renderer');
            const { default: RemitoPDF } = await import('../../../components/pdf/RemitoPDF');

            const remitoData = { ...remito, cliente, firma: remito.firma || null };
            const blob = await pdf(<RemitoPDF remito={remitoData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${remito.numero}.pdf`;
            link.click();

            URL.revokeObjectURL(url);
            setDescargando(false);
            alert(`✅ Remito ${remito.numero} descargado exitosamente`);

        } catch (error) {
            console.error('Error al generar PDF:', error);
            setDescargando(false);
            alert('❌ Error al generar el PDF. Inténtalo de nuevo.');
        }
    };

    const handleGuardarRemito = async () => {
        // VALIDACIÓN: Verificar que hay cliente asignado para clientes existentes
        if (tipoCliente === 'existente' && !remito.clienteId) {
            alert('Por favor, selecciona un cliente del sistema.');
            return;
        }

        // Validaciones básicas
        if (!remito.numero || !cliente.nombre || !cliente.empresa) {
            alert('Por favor completa los campos obligatorios: Número, Cliente y Empresa');
            return;
        }

        if (remito.items.some(item => !item.descripcion || !item.cantidad)) {
            alert('Por favor completa la descripción y cantidad de todos los items');
            return;
        }

        setGuardando(true);

        try {
            const remitoData = {
                numero: remito.numero,
                fecha: remito.fecha,
                clienteId: remito.clienteId || null, // ← CAMPO CRÍTICO
                tipoCliente: tipoCliente, // Para referencia
                estado: remito.estado,
                destino: remito.destino,
                transportista: remito.transportista,
                cliente: cliente,
                items: remito.items,
                observaciones: remito.observaciones,
                firma: remito.firma,
                aclaracionFirma: remito.aclaracionFirma,
                totalItems: remito.items.reduce((sum, item) => sum + Number(item.cantidad || 0), 0),
                empresa: 'IMSSE INGENIERÍA S.A.S',
                tipo: 'remito_entrega',
                usuarioCreador: user.email,
                creadoPor: user.email,
                fechaCreacion: new Date(),
                fechaModificacion: new Date()
            };

            console.log('Guardando remito con datos:', remitoData);

            await apiService.crearRemito(remitoData);
            alert('Remito guardado exitosamente');
            router.push('/admin/remitos');
        } catch (error) {
            console.error('Error al guardar el remito:', error);
            alert('Error al guardar el remito. Inténtelo de nuevo más tarde.');
        } finally {
            setGuardando(false);
        }
    };

    // Unidades disponibles para equipos contra incendios
    const unidades = [
        'unidad',
        'metro',
        'metro lineal',
        'metro cuadrado',
        'kilogramo',
        'litro',
        'caja',
        'paquete',
        'rollo',
        'juego',
        'par'
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
                    <p className="mt-4">Cargando sistema IMSSE...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container px-4 py-8 mx-auto">
                {/* Header con navegación */}
                <div className="flex flex-wrap items-center justify-between mb-8">
                    <div className="flex items-center mb-4">
                        <Link
                            href="/admin/remitos"
                            className="flex items-center p-2 mr-4 text-gray-600 rounded-md hover:bg-gray-100"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold font-montserrat text-primary">
                                Nuevo Remito IMSSE
                            </h1>
                            <p className="text-gray-600">
                                Sistema de entregas - Equipos contra incendios
                            </p>
                        </div>
                    </div>

                    <div className="flex mb-4 space-x-2">
                        <button
                            onClick={handleGuardarRemito}
                            disabled={guardando}
                            className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" />
                            {guardando ? 'Guardando...' : 'Guardar'}
                        </button>

                        {remito.items[0].descripcion && (
                            <button
                                onClick={handleDescargarPDF}
                                disabled={descargando}
                                className={`flex items-center px-4 py-2 text-white transition-colors rounded-md ${descargando
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {descargando ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} className="mr-2" />
                                        Descargar PDF
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Información del remito */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-primary">Información del Remito</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Número de Remito</label>
                                <input
                                    type="text"
                                    value={remito.numero}
                                    onChange={(e) => setRemito({ ...remito, numero: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="REM-2024-XXXX"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                                <input
                                    type="date"
                                    value={remito.fecha}
                                    onChange={(e) => setRemito({ ...remito, fecha: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Estado</label>
                                <select
                                    name="estado"
                                    value={remito.estado}
                                    onChange={handleRemitoChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="en_transito">En Tránsito</option>
                                    <option value="entregado">Entregado</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Destino</label>
                                <input
                                    type="text"
                                    name="destino"
                                    value={remito.destino}
                                    onChange={handleRemitoChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Lugar de entrega"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">Transportista</label>
                                <input
                                    type="text"
                                    name="transportista"
                                    value={remito.transportista}
                                    onChange={handleRemitoChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Empresa o persona"
                                />
                            </div>
                        </div>
                    </div>

                    {/* NUEVA SECCIÓN: Selección de Cliente */}
                    <div className="p-6 bg-white border-l-4 border-green-500 rounded-lg shadow-md">
                        <h3 className="flex items-center mb-4 text-lg font-semibold text-primary">
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
                                <div className="p-4 rounded-lg bg-green-50">
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Seleccionar cliente registrado *
                                    </label>
                                    <select
                                        value={remito.clienteId}
                                        onChange={(e) => handleSeleccionarCliente(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
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
                                        <div className="p-3 mt-3 bg-white border border-green-200 rounded">
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

                    {/* Información del cliente */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="flex items-center mb-4 text-lg font-semibold text-primary">
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
                                {tipoCliente === 'existente' && clienteSeleccionado && (
                                    <p className="mt-1 text-xs text-green-600">
                                        ✅ Auto-completado desde el cliente seleccionado
                                    </p>
                                )}
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
                                {tipoCliente === 'existente' && clienteSeleccionado && (
                                    <p className="mt-1 text-xs text-green-600">
                                        ✅ Auto-completado desde el cliente seleccionado
                                    </p>
                                )}
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
                                {tipoCliente === 'existente' && clienteSeleccionado && (
                                    <p className="mt-1 text-xs text-green-600">
                                        ✅ Auto-completado desde el cliente seleccionado
                                    </p>
                                )}
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
                                {tipoCliente === 'existente' && clienteSeleccionado && (
                                    <p className="mt-1 text-xs text-green-600">
                                        ✅ Auto-completado desde el cliente seleccionado
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Dirección</label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={cliente.direccion}
                                    onChange={handleClienteChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Dirección completa"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    💡 La dirección siempre es editable (no se guarda en el registro del cliente)
                                </p>
                            </div>
                        </div>
                        
                        {/* Indicadores de asignación */}
                        {tipoCliente === 'existente' && clienteSeleccionado && (
                            <div className="p-3 mt-4 border border-green-200 rounded-md bg-green-50">
                                <p className="text-sm text-green-800">
                                    ✅ <strong>Remito será asignado a:</strong> {clienteSeleccionado.empresa}
                                    <br />
                                    <span className="text-green-600">El cliente podrá ver este remito en su panel.</span>
                                </p>
                            </div>
                        )}
                        
                        {tipoCliente === 'manual' && (
                            <div className="p-3 mt-4 border border-yellow-200 rounded-md bg-yellow-50">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ <strong>Modo manual:</strong> Este remito no estará visible para ningún cliente en el sistema.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Items del remito */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-primary">Equipos Contra Incendios</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Descripción</th>
                                        <th className="w-24 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Cantidad</th>
                                        <th className="w-32 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Unidad</th>
                                        <th className="w-16 px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {remito.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2">
                                                {/* Vista móvil - Botón que abre modal */}
                                                <div className="md:hidden">
                                                    <div
                                                        onClick={() => abrirModalDescripcion(item.id, item.descripcion)}
                                                        className="min-h-[60px] p-3 border border-gray-300 rounded-md bg-gray-50 cursor-pointer flex items-center justify-between transition-colors hover:bg-gray-100"
                                                    >
                                                        <span className={`text-sm flex-1 ${item.descripcion ? 'text-gray-800' : 'text-gray-400'}`}>
                                                            {item.descripcion || 'Toca para agregar descripción del equipo'}
                                                        </span>
                                                        <svg className="w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </div>
                                                    {/* Preview del texto si existe */}
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
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md min-h-[60px] resize-y focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="Ej: Detector de humo óptico convencional, Extintor polvo químico 5kg, Central de alarma..."
                                                        rows={2}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.cantidad}
                                                    onChange={(e) => handleItemChange(item.id, 'cantidad', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    value={item.unidad}
                                                    onChange={(e) => handleItemChange(item.id, 'unidad', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                                >
                                                    {unidades.map(unidad => (
                                                        <option key={unidad} value={unidad}>
                                                            {unidad}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1 text-red-500 transition-colors rounded hover:text-red-700"
                                                    disabled={remito.items.length === 1}
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

                        <div className="mt-4">
                            <button
                                onClick={addItem}
                                className="flex items-center transition-colors text-primary hover:text-primary/80"
                            >
                                <PlusCircle size={18} className="mr-1" /> Agregar equipo
                            </button>
                        </div>
                    </div>

                    {/* Firma Digital */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-primary">Firma de Recepción</h3>

                        {remito.firma && !showCanvas ? (
                            <div className="text-center">
                                <img
                                    src={remito.firma}
                                    alt="Firma"
                                    className="mx-auto mb-2 border border-gray-300 rounded"
                                    style={{ maxWidth: '300px', height: '150px', objectFit: 'contain' }}
                                />
                                <p className="mb-4 text-sm font-medium text-gray-700">
                                    {remito.aclaracionFirma || 'Sin aclaración'}
                                </p>
                                <button
                                    onClick={() => setShowCanvas(true)}
                                    className="flex items-center px-4 py-2 mx-auto transition-colors border rounded-md text-primary border-primary hover:bg-primary hover:text-white"
                                >
                                    <RefreshCw size={16} className="mr-2" />
                                    Cambiar firma
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4 overflow-hidden border-2 border-gray-300 rounded-md" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        canvasProps={{
                                            width: 500,
                                            height: 200,
                                            className: 'signature-canvas',
                                            style: { width: '100%', height: 'auto' }
                                        }}
                                        backgroundColor="#f9f9f9"
                                    />
                                </div>

                                {/* Campo de aclaración */}
                                <div className="mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Aclaración de firma
                                    </label>
                                    <input
                                        type="text"
                                        value={remito.aclaracionFirma}
                                        onChange={(e) => setRemito({ ...remito, aclaracionFirma: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Nombre y apellido de quien recibe"
                                    />
                                </div>

                                <div className="flex justify-center space-x-2">
                                    <button
                                        onClick={saveSignature}
                                        type="button"
                                        className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                                    >
                                        <Save size={18} className="mr-2" /> Guardar firma
                                    </button>
                                    <button
                                        onClick={() => {
                                            clearSignature();
                                            setRemito({ ...remito, aclaracionFirma: '' });
                                        }}
                                        type="button"
                                        className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        <RefreshCw size={18} className="mr-2" /> Limpiar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Observaciones */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="mb-4 text-lg font-semibold text-primary">Observaciones</h3>
                        <textarea
                            value={remito.observaciones}
                            onChange={(e) => setRemito({ ...remito, observaciones: e.target.value })}
                            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Instrucciones especiales, condiciones de entrega, comentarios adicionales..."
                        />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-2">
                        <Link
                            href="/admin/remitos"
                            className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                            Cancelar
                        </Link>
                        <button
                            onClick={handleGuardarRemito}
                            disabled={guardando}
                            className="flex items-center px-6 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" />
                            {guardando ? 'Guardando...' : 'Guardar Remito'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal para editar descripción */}
            {modalDescripcion.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="flex flex-col w-full h-full bg-white md:w-11/12 md:h-5/6 md:rounded-lg md:max-w-4xl">
                        {/* Header del modal */}
                        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 md:rounded-t-lg">
                            <h3 className="text-lg font-semibold text-primary">Descripción del Equipo Contra Incendios</h3>
                            <button
                                onClick={() => setModalDescripcion({ isOpen: false, itemId: null, value: '' })}
                                className="p-2 text-gray-500 transition-colors hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido del modal */}
                        <div className="flex flex-col flex-1 p-4 bg-white md:rounded-b-lg">
                            <textarea
                                value={modalDescripcion.value}
                                onChange={(e) => setModalDescripcion({ ...modalDescripcion, value: e.target.value })}
                                className="flex-1 w-full p-4 text-base border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Describe detalladamente el equipo contra incendios...

Ejemplos:
- Detector de humo óptico convencional marca Notifier modelo FSI-851
- Extintor polvo químico ABC 5kg marca Mircom con soporte de pared
- Central de alarma direccionable 2 lazos con fuente respaldo
- Rociador automático sprinkler 68°C estándar 1/2 pulgada
- Sirena estroboscópica 24V para montaje en pared"
                                autoFocus
                                style={{ minHeight: '200px' }}
                            />

                            {/* Contador de caracteres y tips */}
                            <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                                <span>{modalDescripcion.value.length} caracteres</span>
                                <span className="text-xs text-gray-400">
                                    Incluye marca, modelo y especificaciones técnicas
                                </span>
                            </div>

                            {/* Botones del modal */}
                            <div className="flex justify-end mt-4 space-x-3">
                                <button
                                    onClick={() => setModalDescripcion({ isOpen: false, itemId: null, value: '' })}
                                    className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={guardarDescripcion}
                                    className="px-6 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary/90"
                                >
                                    Guardar Descripción
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer con información IMSSE */}
            <div className="p-6 mt-8 text-center bg-white rounded-lg shadow-md">
                <div className="text-sm text-gray-600">
                    <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
                    <p>Sistema de entrega de equipos contra incendios</p>
                    <p className="mt-2">
                        <span className="font-medium">Especialistas en:</span> Detección | Supresión | Rociadores | Alarmas
                    </p>
                    <p className="mt-2">
                        📧 info@imsseingenieria.com | 🌐 www.imsseingenieria.com | 📍 Córdoba, Argentina
                    </p>
                </div>
            </div>
        </div>
    );
}