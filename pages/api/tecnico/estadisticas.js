// pages/api/tecnico/estadisticas.js - Endpoint para estadísticas del técnico
import { verifyAuth, ROLES } from '../../../lib/auth-middleware';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar token y rol
    const user = await verifyAuth(req);
    
    // Solo técnicos y admins pueden acceder
    if (![ROLES.ADMIN, ROLES.TECNICO].includes(user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener estadísticas básicas
    const [ordenesSnapshot, recordatoriosSnapshot] = await Promise.all([
      getDocs(collection(db, 'ordenes-trabajo')),
      getDocs(collection(db, 'recordatorios'))
    ]);

    const ordenes = [];
    ordenesSnapshot.forEach(doc => ordenes.push({ id: doc.id, ...doc.data() }));

    const recordatorios = [];
    recordatoriosSnapshot.forEach(doc => recordatorios.push({ id: doc.id, ...doc.data() }));

    // Calcular estadísticas
    const stats = {
      ordenes: {
        total: ordenes.length,
        pendientes: ordenes.filter(o => o.estado === 'pendiente').length,
        enProceso: ordenes.filter(o => o.estado === 'en_proceso').length,
        completadas: ordenes.filter(o => o.estado === 'completada').length
      },
      recordatorios: {
        total: recordatorios.length,
        hoy: 0, // Se calculará en el frontend
        proximos: 0, // Se calculará en el frontend
        vencidos: 0 // Se calculará en el frontend
      }
    };

    res.status(200).json({
      success: true,
      estadisticas: stats
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}