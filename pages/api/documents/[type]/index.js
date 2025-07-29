// pages/api/documents/[type]/index.js - OPTIMIZADA PARA clienteId
import { withAuth, PERMISSIONS, ROLES } from '../../../../lib/auth-middleware';
import { firestore } from '../../../../lib/firebase-admin';
import admin from '../../../../lib/firebase-admin';

const COLLECTIONS = {
  presupuestos: 'presupuestos',
  recibos: 'recibos',
  remitos: 'remitos',
  estados: 'estados_cuenta',
  ordenes: 'ordenes_trabajo',
  recordatorios: 'recordatorios'
};

async function handler(req, res) {
  const { type } = req.query;
  const { user } = req;

  if (!COLLECTIONS[type]) {
    return res.status(400).json({ error: 'Invalid document type' });
  }

  switch (req.method) {
    case 'GET':
      return await getDocuments(req, res, type, user);
    case 'POST':
      return await createDocument(req, res, type, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getDocuments(req, res, type, user) {
  try {
    const collection = COLLECTIONS[type];
    let query = firestore.collection(collection);
    let documents = [];

    // Aplicar filtros según el rol
    if (user.role === ROLES.CLIENTE) {
      // Cliente: solo sus documentos y verificar permisos
      const userProfile = await firestore.collection('usuarios').doc(user.uid).get();
      const permisos = userProfile.data()?.permisos || {};
      
      if (!permisos[type]) {
        return res.status(403).json({ error: 'Access denied to this document type' });
      }
      
      // FILTRO CRÍTICO: Solo documentos asignados al cliente
      try {
        // Intentar con índice optimizado
        const snapshot = await query
          .where('clienteId', '==', user.uid)
          .orderBy('fechaCreacion', 'desc')
          .limit(50)
          .get();
          
        documents = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
            fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
          };
        });
        
      } catch (indexError) {
        console.warn(`Índice compuesto no disponible para ${type}, usando filtro en memoria:`, indexError.message);
        
        // Fallback: Obtener todos y filtrar en memoria
        const snapshot = await query.get();
        
        documents = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
              fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
            };
          })
          .filter(doc => doc.clienteId === user.uid) // Filtrar por cliente
          .sort((a, b) => {
            const fechaA = new Date(a.fechaCreacion || 0);
            const fechaB = new Date(b.fechaCreacion || 0);
            return fechaB - fechaA;
          })
          .slice(0, 50); // Limitar resultados
      }
      
    } else if (user.role === ROLES.TECNICO) {
      // Técnico: solo órdenes y recordatorios
      if (!['ordenes', 'recordatorios'].includes(type)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      try {
        let tecnicoQuery = query;
        
        if (type === 'ordenes') {
          tecnicoQuery = query.where('tecnicoAsignado.id', '==', user.uid);
        } else if (type === 'recordatorios') {
          tecnicoQuery = query.where('asignadoA', '==', user.uid);
        }
        
        const snapshot = await tecnicoQuery.orderBy('fechaCreacion', 'desc').limit(50).get();
        
        documents = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
            fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
          };
        });
        
      } catch (error) {
        console.warn(`Error en consulta técnico, fallback:`, error.message);
        
        const snapshot = await query.get();
        
        documents = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
              fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
            };
          })
          .filter(doc => {
            if (type === 'ordenes') {
              return doc.tecnicoAsignado?.id === user.uid;
            } else if (type === 'recordatorios') {
              return doc.asignadoA === user.uid;
            }
            return false;
          })
          .sort((a, b) => {
            const fechaA = new Date(a.fechaCreacion || 0);
            const fechaB = new Date(b.fechaCreacion || 0);
            return fechaB - fechaA;
          })
          .slice(0, 50);
      }
      
    } else if (user.role === ROLES.ADMIN) {
      // ADMIN: acceso completo
      const { status, clientId, dateFrom, dateTo } = req.query;
      
      try {
        // Aplicar filtros opcionales para admin
        if (clientId) {
          query = query.where('clienteId', '==', clientId);
        }
        
        if (status) {
          query = query.where('estado', '==', status);
        }
        
        const snapshot = await query.orderBy('fechaCreacion', 'desc').limit(100).get();
        
        documents = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
            fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
          };
        });
        
      } catch (error) {
        console.warn(`Error en consulta admin, fallback:`, error.message);
        
        const snapshot = await query.get();
        
        documents = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
              fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
            };
          })
          .sort((a, b) => {
            const fechaA = new Date(a.fechaCreacion || 0);
            const fechaB = new Date(b.fechaCreacion || 0);
            return fechaB - fechaA;
          });
          
        // Aplicar filtros en memoria si es necesario
        if (clientId) {
          documents = documents.filter(doc => doc.clienteId === clientId);
        }
        
        if (status) {
          documents = documents.filter(doc => doc.estado === status);
        }
        
        documents = documents.slice(0, 100);
      }
    }

    // Filtros de fecha en memoria (para todos los roles)
    const { dateFrom, dateTo } = req.query;
    if (dateFrom || dateTo) {
      documents = documents.filter(doc => {
        const docDate = new Date(doc.fechaCreacion);
        let incluir = true;
        
        if (dateFrom) {
          incluir = incluir && docDate >= new Date(dateFrom);
        }
        
        if (dateTo) {
          incluir = incluir && docDate <= new Date(dateTo);
        }
        
        return incluir;
      });
    }

    return res.status(200).json({ 
      documents,
      success: true,
      count: documents.length,
      type: type,
      message: documents.length === 0 ? 'No documents found' : undefined
    });
    
  } catch (error) {
    console.error('Error getting documents:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createDocument(req, res, type, user) {
  try {
    const collection = COLLECTIONS[type];
    const data = req.body;

    // Validaciones según el tipo y rol
    if (user.role === ROLES.CLIENTE) {
      return res.status(403).json({ error: 'Clients cannot create documents' });
    }

    if (user.role === ROLES.TECNICO && !['recordatorios'].includes(type)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // VALIDACIÓN CRÍTICA: Verificar clienteId si se proporciona
    if (data.clienteId) {
      try {
        const clienteRef = await firestore.collection('usuarios').doc(data.clienteId).get();
        if (!clienteRef.exists) {
          return res.status(400).json({ error: 'Cliente no encontrado' });
        }
        
        const clienteData = clienteRef.data();
        if (clienteData.rol !== 'cliente') {
          return res.status(400).json({ error: 'El ID proporcionado no corresponde a un cliente' });
        }
        
        console.log(`Documento ${type} será asignado al cliente: ${clienteData.empresa} (${data.clienteId})`);
      } catch (error) {
        console.warn('Error al validar cliente:', error);
        // Continuar sin validación estricta para no bloquear
      }
    }

    // Preparar datos del documento
    const docData = {
      ...data,
      creadoPor: user.uid,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
      estado: data.estado || 'pendiente' // Cambio: 'pendiente' por defecto, no 'borrador'
    };

    // Log para debugging
    console.log(`Creando ${type} con datos:`, {
      clienteId: docData.clienteId,
      numero: docData.numero,
      creadoPor: docData.creadoPor
    });

    const docRef = await firestore.collection(collection).add(docData);
    
    return res.status(201).json({
      id: docRef.id,
      message: 'Document created successfully',
      success: true,
      clienteAsignado: data.clienteId ? true : false
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);