// pages/api/notificaciones/index.js - Notificaciones (recordatorios de cliente para la próxima visita)
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { firestore } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';

const COLLECTION = 'notificaciones';
const MENSAJE_MAX_LENGTH = 1500;

function mapDoc(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
    fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion,
    fechaRespuesta: data.fechaRespuesta?.toDate?.() || data.fechaRespuesta || null
  };
}

async function handler(req, res) {
  const { user } = req;

  switch (req.method) {
    case 'GET':
      return await listarNotificaciones(req, res, user);
    case 'POST':
      return await crearNotificacion(req, res, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function listarNotificaciones(req, res, user) {
  try {
    const query = firestore.collection(COLLECTION);
    let notificaciones = [];

    if (user.role === ROLES.CLIENTE) {
      const perfilDoc = await firestore.collection('usuarios').doc(user.uid).get();
      const perfilData = perfilDoc.data() || {};
      const empresaId = perfilData.empresaId || null;

      try {
        const snapshot = empresaId
          ? await query.where('empresaId', '==', empresaId).orderBy('fechaCreacion', 'desc').limit(50).get()
          : await query.where('clienteId', '==', user.uid).orderBy('fechaCreacion', 'desc').limit(50).get();
        notificaciones = snapshot.docs.map(mapDoc);
      } catch (indexError) {
        console.warn('Índice compuesto no disponible para notificaciones (cliente), usando filtro en memoria:', indexError.message);
        const snapshot = await query.get();
        notificaciones = snapshot.docs
          .map(mapDoc)
          .filter(n => (empresaId ? n.empresaId === empresaId : n.clienteId === user.uid))
          .sort((a, b) => new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0))
          .slice(0, 50);
      }
    } else {
      // Admin y técnico ven todas las notificaciones de todos los clientes
      const { estado } = req.query;

      const snapshot = await query.orderBy('fechaCreacion', 'desc').limit(100).get();
      notificaciones = snapshot.docs.map(mapDoc);

      if (estado) {
        notificaciones = notificaciones.filter(n => n.estado === estado);
      }
    }

    return res.status(200).json({
      notificaciones,
      success: true,
      count: notificaciones.length
    });
  } catch (error) {
    console.error('Error al listar notificaciones:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function crearNotificacion(req, res, user) {
  try {
    if (user.role !== ROLES.CLIENTE) {
      return res.status(403).json({ error: 'Solo un cliente puede dejar una notificación' });
    }

    const mensaje = (req.body?.mensaje || '').trim();
    if (!mensaje) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }
    if (mensaje.length > MENSAJE_MAX_LENGTH) {
      return res.status(400).json({ error: `El mensaje no puede superar los ${MENSAJE_MAX_LENGTH} caracteres` });
    }

    const perfilDoc = await firestore.collection('usuarios').doc(user.uid).get();
    const perfilData = perfilDoc.data() || {};

    const docData = {
      mensaje,
      empresaId: perfilData.empresaId || null,
      empresaNombre: perfilData.empresa || '',
      clienteId: user.uid,
      clienteNombre: perfilData.nombreCompleto || user.email || 'Cliente',
      estado: 'pendiente',
      respuesta: null,
      respondidoPor: null,
      respondidoPorNombre: null,
      fechaRespuesta: null,
      leidoPorAdmin: false,
      leidoPorCliente: true,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await firestore.collection(COLLECTION).add(docData);

    return res.status(201).json({
      id: docRef.id,
      message: 'Notificación creada correctamente',
      success: true
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
