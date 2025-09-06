// app/api/documents/marcaciones/route.js - API para marcaciones de asistencia
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Inicializar Firebase Admin
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } catch (error) {
    console.error('Error inicializando Firebase Admin:', error);
  }
}

const db = getFirestore();
const auth = getAuth();

// Verificar autenticación
async function verificarAuth(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorización requerido');
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verificando token:', error);
    throw new Error('Token inválido');
  }
}

// GET - Obtener marcaciones
export async function GET(request) {
  try {
    const user = await verificarAuth(request);
    const { searchParams } = new URL(request.url);
    
    // Filtros desde query params
    const tecnicoId = searchParams.get('tecnicoId');
    const fecha = searchParams.get('fecha');
    const ultima = searchParams.get('ultima');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let query = db.collection('marcaciones');

    // Filtro por técnico
    if (tecnicoId) {
      query = query.where('tecnicoId', '==', tecnicoId);
    }

    // Filtro por fecha específica
    if (fecha) {
      const fechaInicio = new Date(fecha);
      const fechaFin = new Date(fecha);
      fechaFin.setDate(fechaFin.getDate() + 1);
      
      query = query
        .where('timestamp', '>=', fechaInicio.toISOString())
        .where('timestamp', '<', fechaFin.toISOString());
    }

    // Ordenar por timestamp descendente
    query = query.orderBy('timestamp', 'desc');

    // Limit
    if (ultima === 'true') {
      query = query.limit(1);
    } else {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    const marcaciones = [];

    snapshot.forEach(doc => {
      marcaciones.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({
      success: true,
      documents: marcaciones,
      total: marcaciones.length
    });

  } catch (error) {
    console.error('Error en GET marcaciones:', error);
    
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Crear nueva marcación
export async function POST(request) {
  try {
    const user = await verificarAuth(request);
    const body = await request.json();

    // Validaciones básicas
    const { tecnicoId, tipo, timestamp, coordenadas } = body;

    if (!tecnicoId || !tipo || !timestamp || !coordenadas) {
      return NextResponse.json({ 
        error: 'Campos requeridos: tecnicoId, tipo, timestamp, coordenadas' 
      }, { status: 400 });
    }

    if (!['ingreso', 'salida'].includes(tipo)) {
      return NextResponse.json({ 
        error: 'Tipo debe ser "ingreso" o "salida"' 
      }, { status: 400 });
    }

    if (!coordenadas.latitud || !coordenadas.longitud) {
      return NextResponse.json({ 
        error: 'Coordenadas incompletas' 
      }, { status: 400 });
    }

    // Verificar que el técnico solo marque para sí mismo
    if (tecnicoId !== user.uid) {
      return NextResponse.json({ 
        error: 'Solo puedes marcar tu propia asistencia' 
      }, { status: 403 });
    }

    // Validar que no haga doble marcación del mismo tipo
    const hoy = new Date(timestamp);
    const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 1);

    const marcacionesHoy = await db.collection('marcaciones')
      .where('tecnicoId', '==', tecnicoId)
      .where('timestamp', '>=', fechaInicio.toISOString())
      .where('timestamp', '<', fechaFin.toISOString())
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!marcacionesHoy.empty) {
      const ultimaMarcacion = marcacionesHoy.docs[0].data();
      
      if (tipo === 'ingreso' && ultimaMarcacion.tipo === 'ingreso') {
        return NextResponse.json({ 
          error: 'Ya tienes un ingreso registrado. Marca salida primero.' 
        }, { status: 400 });
      }
      
      if (tipo === 'salida' && ultimaMarcacion.tipo === 'salida') {
        return NextResponse.json({ 
          error: 'Ya tienes una salida registrada. Marca ingreso primero.' 
        }, { status: 400 });
      }
    } else if (tipo === 'salida') {
      return NextResponse.json({ 
        error: 'Debes marcar ingreso antes de marcar salida.' 
      }, { status: 400 });
    }

    // Crear el documento
    const marcacionData = {
      tecnicoId,
      tecnicoNombre: body.tecnicoNombre || user.name || user.email,
      tipo,
      timestamp,
      coordenadas: {
        latitud: parseFloat(coordenadas.latitud),
        longitud: parseFloat(coordenadas.longitud)
      },
      precision: body.precision || null,
      direccion: body.direccion || null,
      observaciones: body.observaciones || '',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      creadoPor: user.uid
    };

    const docRef = await db.collection('marcaciones').add(marcacionData);

    return NextResponse.json({
      success: true,
      message: `${tipo === 'ingreso' ? 'Ingreso' : 'Salida'} registrado correctamente`,
      id: docRef.id,
      marcacion: {
        id: docRef.id,
        ...marcacionData
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error en POST marcaciones:', error);
    
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Actualizar marcación (solo admin)
export async function PUT(request) {
  try {
    const user = await verificarAuth(request);
    const body = await request.json();
    
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de marcación requerido' }, { status: 400 });
    }

    const docRef = db.collection('marcaciones').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Marcación no encontrada' }, { status: 404 });
    }

    const datosActualizacion = {
      ...updateData,
      fechaActualizacion: new Date().toISOString(),
      modificadoPor: user.uid
    };

    await docRef.update(datosActualizacion);

    return NextResponse.json({
      success: true,
      message: 'Marcación actualizada correctamente',
      id
    });

  } catch (error) {
    console.error('Error en PUT marcaciones:', error);
    
    if (error.message === 'Token de autorización requerido' || error.message === 'Token inválido') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}