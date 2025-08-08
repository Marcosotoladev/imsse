// pages/api/documents/visitas/[id].js - API para operaciones CRUD de visita individual
import { db } from '../../../../../lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

// Verificar autenticación (mismo que en index.js)
const verificarAuth = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorización requerido');
  }
  return { uid: 'user-id', email: 'user@email.com' };
};

// Obtener usuario actual
const obtenerUsuarioActual = async (token) => {
  return {
    uid: 'user-123',
    email: 'admin@imsse.com',
    displayName: 'Admin IMSSE'
  };
};

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID de visita requerido' });
  }

  try {
    await verificarAuth(req);
    const token = req.headers.authorization?.replace('Bearer ', '');
    const usuario = await obtenerUsuarioActual(token);

    if (req.method === 'GET') {
      // Obtener visita específica
      const visitaRef = doc(db, 'visitas', id);
      const visitaSnap = await getDoc(visitaRef);

      if (!visitaSnap.exists()) {
        return res.status(404).json({ error: 'Visita no encontrada' });
      }

      const visita = {
        id: visitaSnap.id,
        ...visitaSnap.data()
      };

      return res.status(200).json({ 
        success: true, 
        visita 
      });
    }

    if (req.method === 'PUT') {
      // Actualizar visita
      const { fecha, hora, empresa, detalle } = req.body;

      // Validaciones
      if (!fecha || !hora || !empresa) {
        return res.status(400).json({ 
          error: 'Fecha, hora y empresa son campos requeridos' 
        });
      }

      // Validar formatos
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      const horaRegex = /^\d{2}:\d{2}$/;
      
      if (!fechaRegex.test(fecha)) {
        return res.status(400).json({ 
          error: 'Formato de fecha inválido. Use YYYY-MM-DD' 
        });
      }

      if (!horaRegex.test(hora)) {
        return res.status(400).json({ 
          error: 'Formato de hora inválido. Use HH:MM' 
        });
      }

      // Verificar que la visita existe
      const visitaRef = doc(db, 'visitas', id);
      const visitaSnap = await getDoc(visitaRef);

      if (!visitaSnap.exists()) {
        return res.status(404).json({ error: 'Visita no encontrada' });
      }

      const datosActualizacion = {
        fecha,
        hora,
        empresa: empresa.trim(),
        detalle: detalle?.trim() || '',
        fechaModificacion: serverTimestamp(),
        usuarioModificador: usuario.displayName || usuario.email
      };

      await updateDoc(visitaRef, datosActualizacion);

      return res.status(200).json({
        success: true,
        message: 'Visita actualizada exitosamente',
        id,
        datosActualizados: datosActualizacion
      });
    }

    if (req.method === 'DELETE') {
      // Eliminar visita
      const visitaRef = doc(db, 'visitas', id);
      const visitaSnap = await getDoc(visitaRef);

      if (!visitaSnap.exists()) {
        return res.status(404).json({ error: 'Visita no encontrada' });
      }

      await deleteDoc(visitaRef);

      return res.status(200).json({
        success: true,
        message: 'Visita eliminada exitosamente',
        id
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('Error en API de visita individual:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}