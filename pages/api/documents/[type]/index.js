// pages/api/documents/[type]/index.js - Listado y alta de documentos (cliente: por accesos a
// Empresa/Sede; técnico/secretaria: por la grilla de permisos por rol; admin: todo)
import { withAuth, ROLES } from '../../../../lib/auth-middleware';
import { permisoParaUsuario } from '../../../../lib/permisosRolesServer';
import { firestore } from '../../../../lib/firebase-admin';
import admin from '../../../../lib/firebase-admin';
import { obtenerDocumentosCliente } from '../../../../lib/documentosCliente';
import { resolverEmpresaSede } from '../../../../lib/empresaSede';

const COLLECTIONS = {
  presupuestos: 'presupuestos',
  recibos: 'recibos',
  remitos: 'remitos',
  estados: 'estados_cuenta',
  ordenes: 'ordenes_trabajo',
  recordatorios: 'recordatorios',
  visitas: 'visitas',
  inspecciones: 'inspecciones_tecnicas',
  plantillas: 'plantillas_inspeccion',
  planaccion: 'plan_accion'
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
      // Cliente: los documentos de las Empresas/Sedes a las que tiene acceso para este tipo
      const userProfile = await firestore.collection('usuarios').doc(user.uid).get();
      const perfilData = userProfile.data() || {};

      const visibles = await obtenerDocumentosCliente({ coleccion: collection, tipo: type, perfil: perfilData, uid: user.uid });
      if (visibles === null) {
        return res.status(403).json({ error: 'Access denied to this document type' });
      }
      documents = visibles;

      // Observaciones internas: comunicación técnico-admin, nunca visible para el cliente
      documents = documents.map(({ observacionesImsse, ...doc }) => doc);

    } else if (user.role !== ROLES.ADMIN) {
      // Técnico / Secretaria: según la grilla de permisos por rol (todos, solo los propios o ninguno)
      const permiso = await permisoParaUsuario(user, type);
      if (permiso.ver === 'no') {
        return res.status(403).json({ error: 'Access denied' });
      }

      try {
        // "Propios" = los que creó este usuario. Igualdad sola (sin orderBy) no necesita índice compuesto.
        const snapshot = permiso.ver === 'propios'
          ? await query.where('creadoPor', '==', user.uid).get()
          : await query.orderBy('fechaCreacion', 'desc').limit(100).get();
        
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
        console.warn(`Error en consulta de ${user.role}, fallback:`, error.message);

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
          .filter(doc => permiso.ver === 'todos' || doc.creadoPor === user.uid);
      }

      documents = documents
        .sort((a, b) => new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0))
        .slice(0, 100);

    } else {
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
      userRole: user.role, // Para debugging
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

    if (!(await permisoParaUsuario(user, type)).crear) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // El formulario elige Empresa + Sede (empresaId/sedeId): eso decide qué contactos lo ven, según
    // sus accesos. Si solo viene clienteId (documentos cargados offline antes de este cambio), la
    // Empresa se toma de la del contacto.
    const vinculo = await resolverEmpresaSede(data);
    if (vinculo.error) {
      return res.status(400).json({ error: vinculo.error });
    }
    let empresaId = vinculo.empresaId;
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

        if (!empresaId) empresaId = clienteData.empresaId || null;

        console.log(`Documento ${type} será asignado al cliente: ${clienteData.empresa} (${data.clienteId})`);
      } catch (error) {
        console.warn('Error al validar cliente:', error);
        // Continuar sin validación estricta para no bloquear
      }
    }

    // Preparar datos del documento
    const docData = {
      ...data,
      empresaId,
      sedeId: empresaId ? vinculo.sedeId : null,
      creadoPor: user.uid,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
      estado: data.estado || 'pendiente'
    };

    // Para visitas, agregar campos específicos de auditoría
    if (type === 'visitas') {
      docData.usuarioCreador = user.displayName || user.email || 'Usuario IMSSE';
      docData.emailCreador = user.email || 'admin@imsse.com';
    }

    // Log para debugging
    console.log(`Creando ${type} con datos:`, {
      clienteId: docData.clienteId,
      numero: docData.numero,
      creadoPor: docData.creadoPor,
      tipo: type
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