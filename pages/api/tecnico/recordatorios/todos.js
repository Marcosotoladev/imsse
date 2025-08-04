// pages/api/tecnico/recordatorios/todos.js - Endpoint para obtener todos los recordatorios
import { verifyAuth, ROLES } from '../../../../lib/auth-middleware';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar token y rol
    const user = await verifyAuth(req);
    
    // Solo admins y técnicos pueden acceder
    if (![ROLES.ADMIN, ROLES.TECNICO].includes(user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener TODOS los recordatorios (sin filtrar por usuario)
    const recordatoriosRef = collection(db, 'recordatorios');
    const snapshot = await getDocs(recordatoriosRef);
    
    const recordatorios = [];
    snapshot.forEach((doc) => {
      recordatorios.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Ordenar por fecha de recordatorio
    recordatorios.sort((a, b) => {
      const fechaA = a.fechaRecordatorio?.seconds || 0;
      const fechaB = b.fechaRecordatorio?.seconds || 0;  
      return fechaB - fechaA;
    });

    res.status(200).json({
      success: true,
      documents: recordatorios,
      total: recordatorios.length
    });

  } catch (error) {
    console.error('Error al obtener recordatorios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}