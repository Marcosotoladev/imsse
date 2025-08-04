// pages/api/tecnico/ordenes/todas.js - Endpoint para obtener todas las órdenes
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

    // Obtener TODAS las órdenes de trabajo (sin filtrar por usuario)
    const ordenesRef = collection(db, 'ordenes-trabajo');
    const snapshot = await getDocs(ordenesRef);
    
    const ordenes = [];
    snapshot.forEach((doc) => {
      ordenes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Ordenar por fecha de creación (más recientes primero)
    ordenes.sort((a, b) => {
      const fechaA = a.fechaCreacion?.seconds || 0;
      const fechaB = b.fechaCreacion?.seconds || 0;
      return fechaB - fechaA;
    });

    res.status(200).json({
      success: true,
      documents: ordenes,
      total: ordenes.length
    });

  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}