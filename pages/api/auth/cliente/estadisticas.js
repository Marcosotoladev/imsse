// pages/api/cliente/estadisticas.js - API para estadísticas del cliente
import { auth } from '../../../lib/firebase-admin';
import { 
  obtenerPerfilUsuario, 
  obtenerClientePorEmail,
  obtenerEstadisticasCliente 
} from '../../../lib/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authorization.split('Bearer ')[1];
    
    // Verificar token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // Verificar que sea cliente
    const perfil = await obtenerPerfilUsuario(uid);
    if (perfil.rol !== 'cliente') {
      return res.status(403).json({ error: 'Acceso denegado: solo clientes' });
    }

    // Obtener datos del cliente
    const datosCliente = await obtenerClientePorEmail(email);

    // Obtener estadísticas
    const estadisticas = await obtenerEstadisticasCliente(datosCliente.id);

    return res.status(200).json({
      success: true,
      estadisticas,
      cliente: {
        id: datosCliente.id,
        empresa: datosCliente.empresa,
        nombreCompleto: datosCliente.nombreCompleto,
        permisos: datosCliente.permisos
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del cliente:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}