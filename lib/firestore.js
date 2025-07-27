/* // lib/firestore.js - Funciones Firebase adaptadas para IMSSE
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Colecciones para IMSSE
const presupuestosCollection = collection(db, 'presupuestos');
const clientesCollection = collection(db, 'clientes');
const ordenesTrabajoCollection = collection(db, 'ordenes_trabajo');
const recordatoriosCollection = collection(db, 'recordatorios');
const recibosCollection = collection(db, 'recibos');
const remitosCollection = collection(db, 'remitos');
const usuariosCollection = collection(db, 'usuarios'); 
const estadosCuentaCollection = collection(db, 'estados_cuenta');

// ========== FUNCIONES PARA PRESUPUESTOS ==========

// Crear un nuevo presupuesto
export const crearPresupuesto = async (presupuestoData) => {
  try {
    const docRef = await addDoc(presupuestosCollection, {
      ...presupuestoData,
      fechaCreacion: serverTimestamp(),
      fechaModificacion: serverTimestamp()
    });
    console.log('Presupuesto IMSSE creado con ID:', docRef.id);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear presupuesto IMSSE:', error);
    throw error;
  }
};

// Obtener todos los presupuestos
export const obtenerPresupuestos = async () => {
  try {
    const q = query(presupuestosCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener presupuestos IMSSE:', error);
    throw error;
  }
};

// Obtener un presupuesto por ID
export const obtenerPresupuestoPorId = async (id) => {
  try {
    const docRef = doc(db, 'presupuestos', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Presupuesto no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener presupuesto IMSSE:', error);
    throw error;
  }
};

// Actualizar un presupuesto
export const actualizarPresupuesto = async (id, datosActualizados) => {
  try {
    const docRef = doc(db, 'presupuestos', id);
    await updateDoc(docRef, {
      ...datosActualizados,
      fechaModificacion: serverTimestamp()
    });
    return { id };
  } catch (error) {
    console.error('Error al actualizar presupuesto IMSSE:', error);
    throw error;
  }
};

// Eliminar un presupuesto
export const eliminarPresupuesto = async (id) => {
  try {
    const docRef = doc(db, 'presupuestos', id);
    await deleteDoc(docRef);
    return { id };
  } catch (error) {
    console.error('Error al eliminar presupuesto IMSSE:', error);
    throw error;
  }
};

// Obtener presupuestos por estado
export const obtenerPresupuestosPorEstado = async (estado) => {
  try {
    const q = query(
      presupuestosCollection, 
      where('estado', '==', estado),
      orderBy('fechaCreacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener presupuestos por estado:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA CLIENTES ==========

// Crear un nuevo cliente
export const crearCliente = async (clienteData) => {
  try {
    const docRef = await addDoc(clientesCollection, {
      ...clienteData,
      fechaAlta: serverTimestamp(),
      fechaModificacion: serverTimestamp(),
      estado: 'activo'
    });
    console.log('Cliente IMSSE creado con ID:', docRef.id);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear cliente IMSSE:', error);
    throw error;
  }
};

// Obtener todos los clientes
export const obtenerClientes = async () => {
  try {
    const q = query(clientesCollection, orderBy('fechaAlta', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener clientes IMSSE:', error);
    throw error;
  }
};

// Obtener un cliente por ID
export const obtenerClientePorId = async (id) => {
  try {
    const docRef = doc(db, 'clientes', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Cliente no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener cliente IMSSE:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA ÓRDENES DE TRABAJO ==========

// Crear una nueva orden de trabajo
export const crearOrdenTrabajo = async (ordenData) => {
  try {
    const docRef = await addDoc(ordenesTrabajoCollection, {
      ...ordenData,
      fechaCreacion: serverTimestamp(),
      fechaModificacion: serverTimestamp()
    });
    console.log('Orden de trabajo IMSSE creada con ID:', docRef.id);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear orden de trabajo IMSSE:', error);
    throw error;
  }
};

// Obtener todas las órdenes de trabajo
export const obtenerOrdenesTrabajo = async () => {
  try {
    const q = query(ordenesTrabajoCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener órdenes de trabajo IMSSE:', error);
    throw error;
  }
};

// Obtener una orden de trabajo por ID
export const obtenerOrdenTrabajoPorId = async (id) => {
  try {
    const docRef = doc(db, 'ordenes_trabajo', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Orden de trabajo no encontrada');
    }
  } catch (error) {
    console.error('Error al obtener orden de trabajo IMSSE:', error);
    throw error;
  }
};

// Actualizar una orden de trabajo
export const actualizarOrdenTrabajo = async (id, ordenData) => {
  try {
    const docRef = doc(db, 'ordenes_trabajo', id);
    await updateDoc(docRef, {
      ...ordenData,
      fechaModificacion: serverTimestamp()
    });
    console.log('Orden de trabajo IMSSE actualizada');
  } catch (error) {
    console.error('Error al actualizar orden de trabajo IMSSE:', error);
    throw error;
  }
};

// Eliminar una orden de trabajo
export const eliminarOrdenTrabajo = async (id) => {
  try {
    const docRef = doc(db, 'ordenes_trabajo', id);
    await deleteDoc(docRef);
    console.log('Orden de trabajo IMSSE eliminada');
    return { id };
  } catch (error) {
    console.error('Error al eliminar orden de trabajo IMSSE:', error);
    throw error;
  }
};

// Obtener órdenes de trabajo por técnico
export const obtenerOrdenesPorTecnico = async (tecnicoId) => {
  try {
    const q = query(
      ordenesTrabajoCollection,
      where('tecnicoAsignado.id', '==', tecnicoId),
      orderBy('fecha', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener órdenes por técnico:', error);
    throw error;
  }
};

// Obtener órdenes de trabajo por fecha
export const obtenerOrdenesTrabajoEntreFechas = async (fechaInicio, fechaFin) => {
  try {
    const q = query(
      ordenesTrabajoCollection,
      where('fechaTrabajo', '>=', fechaInicio),
      where('fechaTrabajo', '<=', fechaFin),
      orderBy('fechaTrabajo', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener órdenes de trabajo por fecha:', error);
    throw error;
  }
};

// Obtener órdenes de trabajo por nombre de empresa (ORIGINAL)
export const obtenerOrdenesTrabajoEmpresa = async (nombreEmpresa) => {
  try {
    const q = query(
      ordenesTrabajoCollection,
      where('cliente.empresa', '==', nombreEmpresa),
      orderBy('fechaCreacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener órdenes de trabajo por empresa:', error);
    throw error;
  }
};

// ========== FUNCIONES NUEVAS PARA CLIENTES (AGREGAR AL FINAL) ==========

// Definir permisos según tipo de cliente
const obtenerPermisosPorTipo = (tipoCliente) => {
  const permisosPorTipo = {
    completo: {
      presupuestos: true,
      recibos: true,
      remitos: true,
      ordenesTrabajo: true,
      recordatorios: true,
      estadosCuenta: true
    },
    administrativo: {
      presupuestos: true,
      recibos: true,
      remitos: true,
      ordenesTrabajo: false,
      recordatorios: false,
      estadosCuenta: true
    },
    mantenimiento: {
      presupuestos: false,
      recibos: false,
      remitos: false,
      ordenesTrabajo: true,
      recordatorios: true,
      estadosCuenta: false
    }
  };
  
  return permisosPorTipo[tipoCliente] || permisosPorTipo.completo;
};

// Crear un nuevo cliente con ID único
export const crearClienteCompleto = async (datosCliente) => {
  try {
    const docRef = await addDoc(clientesCollection, {
      ...datosCliente,
      fechaAlta: serverTimestamp(),
      fechaModificacion: serverTimestamp(),
      estado: 'activo',
      // Permisos por defecto según tipo
      permisos: obtenerPermisosPorTipo(datosCliente.tipoCliente)
    });
    
    console.log('Cliente IMSSE creado con ID:', docRef.id);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear cliente IMSSE:', error);
    throw error;
  }
};

// Obtener cliente por email (para login de clientes)
export const obtenerClientePorEmail = async (email) => {
  try {
    const q = query(
      clientesCollection,
      where('email', '==', email),
      where('estado', '==', 'activo')
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Cliente no encontrado con ese email');
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener cliente por email:', error);
    throw error;
  }
};

// Obtener documentos específicos del cliente logueado
export const obtenerDocumentosCliente = async (clienteId, tipoDocumento) => {
  try {
    let collection;
    
    switch (tipoDocumento) {
      case 'presupuestos':
        collection = presupuestosCollection;
        break;
      case 'recibos':
        collection = recibosCollection;
        break;
      case 'remitos':
        collection = remitosCollection;
        break;
      case 'ordenesTrabajo':
        collection = ordenesTrabajoCollection;
        break;
      case 'recordatorios':
        collection = recordatoriosCollection;
        break;
      case 'estadosCuenta':
        collection = estadosCuentaCollection;
        break;
      default:
        throw new Error('Tipo de documento no válido');
    }
    
    const q = query(
      collection,
      where('clienteId', '==', clienteId), // Filtro por ID del cliente
      orderBy('fechaCreacion', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
  } catch (error) {
    console.error(`Error al obtener ${tipoDocumento} del cliente:`, error);
    throw error;
  }
};

// Obtener estadísticas del cliente
export const obtenerEstadisticasCliente = async (clienteId) => {
  try {
    const [presupuestos, recibos, remitos, ordenes, recordatorios, estadosCuenta] = await Promise.all([
      obtenerDocumentosCliente(clienteId, 'presupuestos'),
      obtenerDocumentosCliente(clienteId, 'recibos'),
      obtenerDocumentosCliente(clienteId, 'remitos'),
      obtenerDocumentosCliente(clienteId, 'ordenesTrabajo'),
      obtenerDocumentosCliente(clienteId, 'recordatorios'),
      obtenerDocumentosCliente(clienteId, 'estadosCuenta')
    ]);
    
    return {
      presupuestos: presupuestos.length,
      recibos: recibos.length,
      remitos: remitos.length,
      ordenesTrabajo: ordenes.length,
      recordatorios: recordatorios.length,
      estadosCuenta: estadosCuenta.length,
      // Estadísticas adicionales
      presupuestosAprobados: presupuestos.filter(p => p.estado === 'aprobado').length,
      ordenesCompletadas: ordenes.filter(o => o.estado === 'completada').length
    };
  } catch (error) {
    console.error('Error al obtener estadísticas del cliente:', error);
    throw error;
  }
};

// Verificar permisos del cliente para un módulo específico
export const verificarPermisoCliente = async (clienteId, modulo) => {
  try {
    const cliente = await obtenerClientePorId(clienteId);
    return cliente.permisos?.[modulo] || false;
  } catch (error) {
    console.error('Error al verificar permisos del cliente:', error);
    return false;
  }
};

// ========== FUNCIONES PARA RECORDATORIOS ==========

// Crear un nuevo recordatorio
export const crearRecordatorio = async (recordatorioData) => {
  try {
    const docRef = await addDoc(recordatoriosCollection, {
      ...recordatorioData,
      fechaCreacion: serverTimestamp(),
      estado: 'pendiente'
    });
    console.log('Recordatorio IMSSE creado con ID:', docRef.id);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear recordatorio IMSSE:', error);
    throw error;
  }
};

// Obtener recordatorios pendientes
export const obtenerRecordatoriosPendientes = async () => {
  try {
    const q = query(
      recordatoriosCollection,
      where('estado', '==', 'pendiente'),
      orderBy('fechaVencimiento', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener recordatorios pendientes:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA RECIBOS ==========

// Crear un nuevo recibo
export const crearRecibo = async (reciboData) => {
  try {
    const docRef = await addDoc(recibosCollection, {
      ...reciboData,
      fechaCreacion: serverTimestamp(),
      fechaModificacion: serverTimestamp()
    });
    console.log('Recibo IMSSE creado con ID:', docRef.id);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear recibo IMSSE:', error);
    throw error;
  }
};

// Obtener todos los recibos
export const obtenerRecibos = async () => {
  try {
    const q = query(recibosCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener recibos IMSSE:', error);
    throw error;
  }
};

// Obtener un recibo por ID
export const obtenerReciboPorId = async (id) => {
  try {
    const docRef = doc(db, 'recibos', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Recibo no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener recibo IMSSE:', error);
    throw error;
  }
};

// Actualizar un recibo
export const actualizarRecibo = async (id, reciboData) => {
  try {
    const docRef = doc(db, 'recibos', id);
    await updateDoc(docRef, {
      ...reciboData,
      fechaModificacion: serverTimestamp()
    });
    console.log('Recibo IMSSE actualizado');
  } catch (error) {
    console.error('Error al actualizar recibo IMSSE:', error);
    throw error;
  }
};

// Eliminar un recibo  
export const eliminarRecibo = async (id) => {
  try {
    await deleteDoc(doc(db, 'recibos', id));
    console.log('Recibo IMSSE eliminado');
  } catch (error) {
    console.error('Error al eliminar recibo IMSSE:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA REMITOS ==========

// Crear un nuevo remito
export const crearRemito = async (remitoData) => {
  try {
    const docRef = await addDoc(remitosCollection, {
      ...remitoData,
      fechaCreacion: serverTimestamp(),
      fechaModificacion: serverTimestamp()
    });
    console.log('Remito IMSSE creado con ID:', docRef.id);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear remito IMSSE:', error);
    throw error;
  }
};

// Obtener todos los remitos
export const obtenerRemitos = async () => {
  try {
    const q = query(remitosCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener remitos IMSSE:', error);
    throw error;
  }
};

// Obtener un remito por ID
export const obtenerRemitoPorId = async (id) => {
  try {
    const docRef = doc(db, 'remitos', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Remito no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener remito IMSSE:', error);
    throw error;
  }
};

// Actualizar un remito
export const actualizarRemito = async (id, remitoData) => {
  try {
    const docRef = doc(db, 'remitos', id);
    await updateDoc(docRef, {
      ...remitoData,
      fechaModificacion: serverTimestamp()
    });
    console.log('Remito IMSSE actualizado');
  } catch (error) {
    console.error('Error al actualizar remito IMSSE:', error);
    throw error;
  }
};

// Eliminar un remito
export const eliminarRemito = async (id) => {
  try {
    const docRef = doc(db, 'remitos', id);
    await deleteDoc(docRef);
    console.log('Remito IMSSE eliminado');
    return { id };
  } catch (error) {
    console.error('Error al eliminar remito IMSSE:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA ESTADÍSTICAS ==========

// Obtener estadísticas del dashboard
export const obtenerEstadisticasDashboard = async () => {
  try {
    // Obtener presupuestos
    const presupuestos = await obtenerPresupuestos();
    
    // Calcular estadísticas
    const totalPresupuestos = presupuestos.length;
    const presupuestosAprobados = presupuestos.filter(p => p.estado === 'aprobado').length;
    const presupuestosPendientes = presupuestos.filter(p => p.estado === 'enviado').length;
    const montoTotalAprobado = presupuestos
      .filter(p => p.estado === 'aprobado')
      .reduce((sum, p) => sum + (p.total || 0), 0);

    // Obtener recordatorios pendientes
    const recordatoriosPendientes = await obtenerRecordatoriosPendientes();

    return {
      totalPresupuestos,
      presupuestosAprobados,
      presupuestosPendientes,
      montoTotalAprobado,
      recordatoriosPendientes: recordatoriosPendientes.length
    };
  } catch (error) {
    console.error('Error al obtener estadísticas dashboard:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA USUARIOS Y ROLES ==========

// Crear perfil de usuario después del registro
export const crearPerfilUsuario = async (uid, datosUsuario) => {
  try {
    await setDoc(doc(db, 'usuarios', uid), {
      ...datosUsuario,
      fechaCreacion: serverTimestamp(),
      fechaModificacion: serverTimestamp(),
      estado: 'pendiente', // pendiente, activo, inactivo
      rol: 'cliente' // Por defecto es cliente, admin cambia después
    });
    console.log('Perfil de usuario IMSSE creado');
  } catch (error) {
    console.error('Error al crear perfil de usuario IMSSE:', error);
    throw error;
  }
};

// Obtener perfil de usuario por UID
export const obtenerPerfilUsuario = async (uid) => {
  try {
    const docRef = doc(db, 'usuarios', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Usuario no encontrado en IMSSE');
    }
  } catch (error) {
    console.error('Error al obtener perfil de usuario IMSSE:', error);
    throw error;
  }
};

// Obtener todos los usuarios (solo admin)
export const obtenerTodosLosUsuarios = async () => {
  try {
    const q = query(usuariosCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener usuarios IMSSE:', error);
    throw error;
  }
};

// Actualizar rol de usuario (solo admin)
export const actualizarRolUsuario = async (uid, nuevoRol) => {
  try {
    const docRef = doc(db, 'usuarios', uid);
    await updateDoc(docRef, {
      rol: nuevoRol,
      fechaModificacion: serverTimestamp()
    });
    console.log(`Rol de usuario actualizado a: ${nuevoRol}`);
  } catch (error) {
    console.error('Error al actualizar rol de usuario:', error);
    throw error;
  }
};

// Actualizar estado de usuario (solo admin)
export const actualizarEstadoUsuario = async (uid, nuevoEstado) => {
  try {
    const docRef = doc(db, 'usuarios', uid);
    await updateDoc(docRef, {
      estado: nuevoEstado,
      fechaModificacion: serverTimestamp()
    });
    console.log(`Estado de usuario actualizado a: ${nuevoEstado}`);
  } catch (error) {
    console.error('Error al actualizar estado de usuario:', error);
    throw error;
  }
};

// Obtener usuarios por rol
export const obtenerUsuariosPorRol = async (rol) => {
  try {
    const q = query(
      usuariosCollection,
      where('rol', '==', rol),
      where('estado', '==', 'activo'),
      orderBy('fechaCreacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    throw error;
  }
};

// Obtener usuarios pendientes de aprobación
export const obtenerUsuariosPendientes = async () => {
  try {
    const q = query(
      usuariosCollection,
      where('estado', '==', 'pendiente'),
      orderBy('fechaCreacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener usuarios pendientes:', error);
    throw error;
  }
};

// ========== FUNCIONES PARA FILTROS POR USUARIO ==========

// Obtener órdenes de trabajo por cliente EMAIL (NUEVA - para filtros)
export const obtenerOrdenesTrabajoCliente = async (clienteEmail) => {
  try {
    const q = query(
      ordenesTrabajoCollection,
      where('cliente.email', '==', clienteEmail),
      orderBy('fechaCreacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener órdenes de trabajo del cliente:', error);
    throw error;
  }
};

// Obtener recibos por cliente
export const obtenerRecibosCliente = async (clienteEmail) => {
  try {
    const q = query(
      recibosCollection,
      where('recibiDe', '==', clienteEmail),
      orderBy('fechaCreacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener recibos del cliente:', error);
    throw error;
  }
};

// Obtener presupuestos por cliente
export const obtenerPresupuestosCliente = async (clienteEmail) => {
  try {
    const q = query(
      presupuestosCollection,
      where('cliente.email', '==', clienteEmail),
      orderBy('fechaCreacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener presupuestos del cliente:', error);
    throw error;
  }
};

// Obtener remitos por cliente
export const obtenerRemitosCliente = async (clienteEmail) => {
  try {
    const q = query(
      remitosCollection,
      where('cliente.email', '==', clienteEmail),
      orderBy('fechaCreacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener remitos del cliente:', error);
    throw error;
  }
};

// Obtener todas las fotos de órdenes de trabajo
export const obtenerTodasLasFotos = async () => {
  try {
    const ordenes = await obtenerOrdenesTrabajo();
    
    let todasLasFotos = [];
    ordenes.forEach(orden => {
      if (orden.fotos && orden.fotos.length > 0) {
        orden.fotos.forEach(foto => {
          todasLasFotos.push({
            ...foto,
            ordenId: orden.id,
            ordenNumero: orden.numero,
            cliente: orden.cliente,
            fechaTrabajo: orden.fechaTrabajo,
            fechaCreacion: orden.fechaCreacion
          });
        });
      }
    });

    // Ordenar por fecha de creación más reciente
    todasLasFotos.sort((a, b) => {
      const fechaA = a.fechaCreacion?.toDate ? a.fechaCreacion.toDate() : new Date(a.fechaSubida);
      const fechaB = b.fechaCreacion?.toDate ? b.fechaCreacion.toDate() : new Date(b.fechaSubida);
      return fechaB - fechaA;
    });

    return todasLasFotos;
  } catch (error) {
    console.error('Error al obtener todas las fotos:', error);
    throw error;
  }
};

// Obtener fotos por cliente
export const obtenerFotosCliente = async (clienteEmail) => {
  try {
    const ordenesCliente = await obtenerOrdenesTrabajoCliente(clienteEmail);
    
    let fotosCliente = [];
    ordenesCliente.forEach(orden => {
      if (orden.fotos && orden.fotos.length > 0) {
        orden.fotos.forEach(foto => {
          fotosCliente.push({
            ...foto,
            ordenId: orden.id,
            ordenNumero: orden.numero,
            cliente: orden.cliente,
            fechaTrabajo: orden.fechaTrabajo,
            fechaCreacion: orden.fechaCreacion
          });
        });
      }
    });

    // Ordenar por fecha más reciente
    fotosCliente.sort((a, b) => {
      const fechaA = a.fechaCreacion?.toDate ? a.fechaCreacion.toDate() : new Date(a.fechaSubida);
      const fechaB = b.fechaCreacion?.toDate ? b.fechaCreacion.toDate() : new Date(b.fechaSubida);
      return fechaB - fechaA;
    });

    return fotosCliente;
  } catch (error) {
    console.error('Error al obtener fotos del cliente:', error);
    throw error;
  }
};

// Verificar permisos de usuario
export const verificarPermisos = async (uid, permisoRequerido) => {
  try {
    const perfil = await obtenerPerfilUsuario(uid);
    
    const permisos = {
      admin: ['admin'],
      tecnico: ['admin', 'tecnico'],
      cliente: ['admin', 'tecnico', 'cliente']
    };

    return permisos[permisoRequerido]?.includes(perfil.rol) || false;
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return false;
  }
};


// ========== FUNCIONES ADICIONALES PARA GOOGLE SIGN-IN ==========
// Agregar estas funciones al final de lib/firestore.js

// Crear perfil automático para usuarios de Google (con estado activo)
export const crearPerfilUsuarioGoogle = async (uid, datosUsuario) => {
  try {
    await setDoc(doc(db, 'usuarios', uid), {
      ...datosUsuario,
      fechaCreacion: serverTimestamp(),
      fechaModificacion: serverTimestamp(),
      estado: 'activo', // ← Google users get immediate access
      rol: 'cliente', // Default role
      metodoBegistro: 'google'
    });
    console.log('Perfil de usuario Google IMSSE creado con acceso inmediato');
  } catch (error) {
    console.error('Error al crear perfil de usuario Google IMSSE:', error);
    throw error;
  }
};

// Verificar si un usuario existe y está activo
export const verificarUsuarioActivo = async (uid) => {
  try {
    const perfil = await obtenerPerfilUsuario(uid);
    return {
      existe: true,
      activo: perfil.estado === 'activo',
      rol: perfil.rol,
      perfil: perfil
    };
  } catch (error) {
    return {
      existe: false,
      activo: false,
      rol: null,
      perfil: null
    };
  }
};

// Actualizar datos adicionales de usuario (para el modal)
export const actualizarDatosUsuario = async (uid, datosAdicionales) => {
  try {
    const docRef = doc(db, 'usuarios', uid);
    await updateDoc(docRef, {
      ...datosAdicionales,
      fechaModificacion: serverTimestamp()
    });
    console.log('Datos adicionales de usuario actualizados');
  } catch (error) {
    console.error('Error al actualizar datos adicionales:', error);
    throw error;
  }
};

// Obtener estadísticas de usuarios para admin
export const obtenerEstadisticasUsuarios = async () => {
  try {
    const usuarios = await obtenerTodosLosUsuarios();
    
    const estadisticas = {
      total: usuarios.length,
      admins: usuarios.filter(u => u.rol === 'admin').length,
      tecnicos: usuarios.filter(u => u.rol === 'tecnico').length,
      clientes: usuarios.filter(u => u.rol === 'cliente').length,
      activos: usuarios.filter(u => u.estado === 'activo').length,
      pendientes: usuarios.filter(u => u.estado === 'pendiente').length,
      inactivos: usuarios.filter(u => u.estado === 'inactivo').length,
      google: usuarios.filter(u => u.metodoBegistro === 'google').length,
      email: usuarios.filter(u => u.metodoBegistro !== 'google').length
    };
    
    return estadisticas;
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    throw error;
  }
}; */