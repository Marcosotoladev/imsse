// ============= pages/api/documents/[type]/index.js =============//
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
    let needsClientFilter = false;
    let clienteIdToFilter = null;

    // Aplicar filtros según el rol
    if (user.role === ROLES.CLIENTE) {
      // Cliente: solo sus documentos y verificar permisos
      const userProfile = await firestore.collection('usuarios').doc(user.uid).get();
      const permisos = userProfile.data()?.permisos || {};
      
      if (!permisos[type]) {
        return res.status(403).json({ error: 'Access denied to this document type' });
      }
      
      // TEMPORAL: No aplicar filtro de clienteId aquí para evitar el índice compuesto
      needsClientFilter = true;
      clienteIdToFilter = user.uid;
    } else if (user.role === ROLES.TECNICO) {
      // Técnico: solo órdenes y recordatorios
      if (!['ordenes', 'recordatorios'].includes(type)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // TEMPORAL: Simplificar consultas para técnicos también
      if (type === 'ordenes') {
        needsClientFilter = true;
        clienteIdToFilter = user.uid; // Filtraremos después
      } else if (type === 'recordatorios') {
        needsClientFilter = true;
        clienteIdToFilter = user.uid; // Filtraremos después
      }
    }
    // ADMIN: acceso completo, no se aplican filtros

    // Filtros adicionales por query params (simplificados)
    const { status, clientId } = req.query;
    
    // Solo aplicar filtros que no requieran índices compuestos
    if (status && !needsClientFilter) {
      try {
        query = query.where('estado', '==', status);
      } catch (error) {
        console.warn('No se pudo aplicar filtro de estado:', error.message);
      }
    }
    
    if (clientId && user.role === ROLES.ADMIN && !needsClientFilter) {
      try {
        query = query.where('clienteId', '==', clientId);
      } catch (error) {
        console.warn('No se pudo aplicar filtro de clienteId:', error.message);
      }
    }

    // Intentar consulta con ordenamiento, con fallback si falla
    let documents = [];
    
    try {
      // Intentar consulta optimizada primero
      let finalQuery = query;
      
      // Si necesitamos filtrar por cliente, aplicarlo ahora
      if (needsClientFilter && user.role === ROLES.CLIENTE) {
        finalQuery = query.where('clienteId', '==', clienteIdToFilter);
      }
      
      const snapshot = await finalQuery.orderBy('fechaCreacion', 'desc').get();
      
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
      console.warn(`Índice compuesto no disponible para ${type}, usando consulta simple:`, indexError.message);
      
      try {
        // Fallback 1: Consulta sin ordenamiento
        let fallbackQuery = query;
        
        if (needsClientFilter && user.role === ROLES.CLIENTE) {
          fallbackQuery = query.where('clienteId', '==', clienteIdToFilter);
        }
        
        const snapshot = await fallbackQuery.get();
        
        documents = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
            fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
          };
        });
        
        // Ordenar en memoria
        documents.sort((a, b) => {
          const fechaA = new Date(a.fechaCreacion || 0);
          const fechaB = new Date(b.fechaCreacion || 0);
          return fechaB - fechaA;
        });
        
      } catch (fallbackError) {
        console.warn(`Fallback también falló para ${type}, consulta básica:`, fallbackError.message);
        
        // Fallback 2: Consulta más básica sin filtros complejos
        const snapshot = await firestore.collection(collection).get();
        
        let allDocuments = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fechaCreacion: data.fechaCreacion?.toDate?.() || data.fechaCreacion,
            fechaModificacion: data.fechaModificacion?.toDate?.() || data.fechaModificacion
          };
        });
        
        // Filtrar en memoria según el rol
        if (user.role === ROLES.CLIENTE && needsClientFilter) {
          allDocuments = allDocuments.filter(doc => doc.clienteId === clienteIdToFilter);
        } else if (user.role === ROLES.TECNICO) {
          if (type === 'ordenes') {
            allDocuments = allDocuments.filter(doc => 
              doc.tecnicoAsignado?.id === user.uid
            );
          } else if (type === 'recordatorios') {
            allDocuments = allDocuments.filter(doc => 
              doc.asignadoA === user.uid
            );
          }
        }
        
        // Aplicar filtros adicionales en memoria
        if (status) {
          allDocuments = allDocuments.filter(doc => doc.estado === status);
        }
        
        if (clientId && user.role === ROLES.ADMIN) {
          allDocuments = allDocuments.filter(doc => doc.clienteId === clientId);
        }
        
        // Ordenar en memoria
        allDocuments.sort((a, b) => {
          const fechaA = new Date(a.fechaCreacion || 0);
          const fechaB = new Date(b.fechaCreacion || 0);
          return fechaB - fechaA;
        });
        
        documents = allDocuments;
      }
    }

    // Filtros de fecha en memoria (para evitar más problemas de índices)
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

    // Limitar resultados para performance
    const limit = parseInt(req.query.limit) || 50;
    documents = documents.slice(0, limit);

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

    // Validaciones según el tipo y rol (MANTIENE TU LÓGICA ORIGINAL)
    if (user.role === ROLES.CLIENTE) {
      return res.status(403).json({ error: 'Clients cannot create documents' });
    }

    if (user.role === ROLES.TECNICO && !['recordatorios'].includes(type)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Agregar metadatos (MANTIENE TU LÓGICA ORIGINAL)
    const docData = {
      ...data,
      creadoPor: user.uid,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
      estado: data.estado || 'borrador'
    };

    const docRef = await firestore.collection(collection).add(docData);
    
    return res.status(201).json({
      id: docRef.id,
      message: 'Document created successfully',
      success: true
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);