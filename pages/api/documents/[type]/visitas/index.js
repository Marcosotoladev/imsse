// pages/api/documents/visitas/index.js - API para gestión de visitas IMSSE
import { db } from '../../../../../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

// Verificar autenticación (reutilizar de recordatorios)
const verificarAuth = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorización requerido');
  }
  
  // Aquí iría la verificación del token Firebase
  // Por ahora, asumo que está autenticado
  return { uid: 'user-id', email: 'user@email.com' };
};

// Obtener usuario actual de Firebase Auth (simulado)
const obtenerUsuarioActual = async (token) => {
  // En producción, verificarías el token con Firebase Admin
  return {
    uid: 'user-123',
    email: 'admin@imsse.com',
    displayName: 'Admin IMSSE'
  };
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await verificarAuth(req);
    const token = req.headers.authorization?.replace('Bearer ', '');
    const usuario = await obtenerUsuarioActual(token);

    if (req.method === 'GET') {
      // Obtener todas las visitas
      const visitasRef = collection(db, 'visitas');
      let q = query(visitasRef, orderBy('fecha', 'asc'), orderBy('hora', 'asc'));
      
      // Filtros opcionales
      const { mes, año, empresa } = req.query;
      
      if (mes && año) {
        const inicioMes = `${año}-${mes.padStart(2, '0')}-01`;
        const siguienteMes = mes === '12' ? `${parseInt(año) + 1}-01-01` : `${año}-${(parseInt(mes) + 1).toString().padStart(2, '0')}-01`;
        q = query(
          visitasRef,
          where('fecha', '>=', inicioMes),
          where('fecha', '<', siguienteMes),
          orderBy('fecha', 'asc'),
          orderBy('hora', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      const visitas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return res.status(200).json({ 
        success: true, 
        documents: visitas,
        count: visitas.length 
      });
    }

    if (req.method === 'POST') {
      // Crear nueva visita
      const { fecha, hora, empresa, detalle } = req.body;

      // Validaciones
      if (!fecha || !hora || !empresa) {
        return res.status(400).json({ 
          error: 'Fecha, hora y empresa son campos requeridos' 
        });
      }

      // Validar formato de fecha
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        return res.status(400).json({ 
          error: 'Formato de fecha inválido. Use YYYY-MM-DD' 
        });
      }

      // Validar formato de hora
      const horaRegex = /^\d{2}:\d{2}$/;
      if (!horaRegex.test(hora)) {
        return res.status(400).json({ 
          error: 'Formato de hora inválido. Use HH:MM' 
        });
      }

      const nuevaVisita = {
        fecha,
        hora,
        empresa: empresa.trim(),
        detalle: detalle?.trim() || '',
        usuarioCreador: usuario.displayName || usuario.email,
        emailCreador: usuario.email,
        fechaCreacion: serverTimestamp(),
        fechaModificacion: null,
        usuarioModificador: null
      };

      const docRef = await addDoc(collection(db, 'visitas'), nuevaVisita);
      
      return res.status(201).json({
        success: true,
        message: 'Visita creada exitosamente',
        id: docRef.id,
        visita: { id: docRef.id, ...nuevaVisita }
      });
    }

  } catch (error) {
    console.error('Error en API de visitas:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}