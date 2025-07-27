// pages/api/cliente/documentos/[tipo].js - API para obtener documentos filtrados por cliente
import { auth } from '../../../../lib/firebase-admin';
import { 
  obtenerPerfilUsuario, 
  obtenerClientePorEmail,
  obtenerDocumentosCliente,
  verificarPermisoCliente 
} from '../../../../lib/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { tipo } = req.query;
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

    // Verificar permisos para el tipo de documento
    const tienePermiso = await verificarPermisoCliente(datosCliente.id, tipo);
    if (!tienePermiso) {
      return res.status(403).json({ error: `Sin permisos para ver ${tipo}` });
    }

    // Obtener documentos filtrados
    const documentos = await obtenerDocumentosCliente(datosCliente.id, tipo);

    return res.status(200).json({
      success: true,
      documentos,
      cliente: {
        id: datosCliente.id,
        empresa: datosCliente.empresa,
        nombreCompleto: datosCliente.nombreCompleto
      },
      total: documentos.length
    });

  } catch (error) {
    console.error(`Error al obtener ${req.query.tipo}:`, error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}