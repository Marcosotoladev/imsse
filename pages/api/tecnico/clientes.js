// pages/api/tecnico/clientes.js - VERSIÓN CORREGIDA PARA FIREBASE ADMIN
import { verifyAuth, ROLES } from '../../../lib/auth-middleware';
import { db } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Iniciando obtención de clientes para técnico...');
    
    // Verificar token y rol
    const user = await verifyAuth(req);
    console.log('✅ Usuario autenticado:', user.uid, 'Rol:', user.role);

    // Solo admins y técnicos pueden acceder
    if (![ROLES.ADMIN, ROLES.TECNICO].includes(user.role)) {
      console.log('❌ Acceso denegado para rol:', user.role);
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Verificar que db esté inicializado
    if (!db) {
      console.error('❌ Base de datos no inicializada');
      return res.status(500).json({ error: 'Base de datos no disponible' });
    }

    console.log('🔄 Consultando base de datos...');
    
    // ✅ SINTAXIS CORRECTA PARA FIREBASE ADMIN (no client SDK)
    const usuariosRef = db.collection('usuarios');
    
    // Query para obtener solo clientes activos
    const clientesQuery = usuariosRef
      .where('rol', '==', 'cliente')
      .where('estado', '==', 'activo');
    
    const clientesSnap = await clientesQuery.get();
    console.log('📊 Documentos encontrados:', clientesSnap.size);

    const clientes = [];

    clientesSnap.forEach((doc) => {
      try {
        const data = doc.data();
        console.log('📄 Procesando cliente:', doc.id, data.empresa);
        
        clientes.push({
          id: doc.id,
          uid: doc.id,
          nombre: data.nombre || '',
          nombreCompleto: data.nombreCompleto || data.nombre || '',
          empresa: data.empresa || 'Sin empresa',
          empresaId: data.empresaId || null,
          email: data.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          estado: data.estado || 'activo',
          rol: data.rol || 'cliente',
          fechaCreacion: data.fechaCreacion || null
        });
      } catch (error) {
        console.error('❌ Error procesando documento:', doc.id, error);
      }
    });

    // Si no hay clientes, también buscar técnicos (para casos especiales)
    if (clientes.length === 0) {
      console.log('🔄 No se encontraron clientes, buscando técnicos...');
      
      const tecnicosQuery = usuariosRef
        .where('rol', '==', 'tecnico')
        .where('estado', '==', 'activo');
      
      const tecnicosSnap = await tecnicosQuery.get();
      
      tecnicosSnap.forEach((doc) => {
        try {
          const data = doc.data();
          clientes.push({
            id: doc.id,
            uid: doc.id,
            nombre: data.nombre || '',
            nombreCompleto: data.nombreCompleto || data.nombre || '',
            empresa: data.empresa || 'Técnico IMSSE',
            email: data.email || '',
            telefono: data.telefono || '',
            direccion: data.direccion || '',
            estado: data.estado || 'activo',
            rol: data.rol || 'tecnico',
            fechaCreacion: data.fechaCreacion || null
          });
        } catch (error) {
          console.error('❌ Error procesando técnico:', doc.id, error);
        }
      });
    }

    // Ordenar por empresa
    clientes.sort((a, b) => {
      const empresaA = (a.empresa || '').toLowerCase();
      const empresaB = (b.empresa || '').toLowerCase();
      return empresaA.localeCompare(empresaB);
    });

    console.log('✅ Clientes procesados exitosamente:', clientes.length);

    res.status(200).json({
      success: true,
      users: clientes,
      clientes: clientes,
      total: clientes.length,
      message: `${clientes.length} clientes encontrados`
    });

  } catch (error) {
    console.error('❌ Error al obtener clientes:', error);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}