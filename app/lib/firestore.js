// lib/firestore.js - Funciones Firebase adaptadas para IMSSE
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
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