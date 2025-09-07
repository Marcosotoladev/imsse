// app/api/documents/marcaciones/[id]/route.js
import { auth } from '../../../../../lib/firebase-admin';
import { db } from '../../../../../lib/firebase-admin';

export async function DELETE(request, { params }) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Token requerido' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await auth.verifyIdToken(token);
    
    // Verificar permisos
    const userDoc = await db.collection('usuarios').doc(decodedToken.uid).get();
    const userRole = userDoc.data()?.rol;
    
    if (!['admin', 'tecnico'].includes(userRole)) {
      return Response.json({ error: 'Sin permisos' }, { status: 403 });
    }
    
    const marcacionId = params.id;
    const marcacionRef = db.collection('marcaciones').doc(marcacionId);
    const marcacion = await marcacionRef.get();
    
    if (!marcacion.exists) {
      return Response.json({ error: 'Marcación no encontrada' }, { status: 404 });
    }
    
    // Si es técnico, verificar que sea su marcación
    if (userRole === 'tecnico' && marcacion.data().tecnicoId !== decodedToken.uid) {
      return Response.json({ error: 'Sin permisos para eliminar esta marcación' }, { status: 403 });
    }
    
    // Eliminar
    await marcacionRef.delete();
    
    return Response.json({ 
      message: 'Marcación eliminada correctamente',
      id: marcacionId 
    });
    
  } catch (error) {
    console.error('Error al eliminar marcación:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}