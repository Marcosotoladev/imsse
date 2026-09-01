// pages/api/users/create.js - Endpoint de creación de usuarios desde Admin
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { auth, firestore } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user } = req;

  // Solo admin puede crear usuarios directamente
  if (user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden crear usuarios.' });
  }

  try {
    const {
      nombre = '',
      apellido = '',
      email = '',
      empresa = '',
      telefono = '',
      fechaNacimiento = '',
      direccion = '',
      cargo = '',
      dni = '',
      empresaId = null,
      rol = ROLES.CLIENTE,
      password = '',
      esEmailFicticio = false
    } = req.body;

    if (!nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    let finalEmail = email.trim().toLowerCase();

    // Si es email ficticio o viene vacío, generar uno interno único y limpio (ej: juan.perez@imsse.app)
    if (esEmailFicticio || !finalEmail) {
      const cleanNombre = nombre.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanApellido = apellido.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const baseUser = cleanApellido ? `${cleanNombre}.${cleanApellido}` : cleanNombre;
      finalEmail = `${baseUser || 'usuario'}@imsse.app`;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(finalEmail)) {
      return res.status(400).json({ error: 'Formato de correo electrónico no válido' });
    }

    // 1. Crear usuario en Firebase Auth (con reintento si el email ficticio base ya existe)
    const nombreCompleto = `${nombre.trim()} ${apellido.trim()}`.trim();
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: finalEmail,
        password: password,
        displayName: nombreCompleto,
        disabled: false
      });
    } catch (authError) {
      if (authError.code === 'auth/email-already-exists' && (esEmailFicticio || !email)) {
        // Reintentar agregando un número corto si el email simple ya está tomado
        const randomNum = Math.floor(10 + Math.random() * 90);
        const parts = finalEmail.split('@');
        finalEmail = `${parts[0]}${randomNum}@${parts[1]}`;
        
        userRecord = await auth.createUser({
          email: finalEmail,
          password: password,
          displayName: nombreCompleto,
          disabled: false
        });
      } else {
        throw authError;
      }
    }

    // 2. Crear documento de perfil en Firestore (estado 'activo' por defecto)
    const userData = {
      uid: userRecord.uid,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      nombreCompleto,
      email: finalEmail,
      empresa: empresa.trim(),
      telefono: telefono.trim(),
      fechaNacimiento: fechaNacimiento.trim(),
      direccion: direccion.trim(),
      cargo: cargo.trim(),
      dni: dni.trim(),
      rol: rol || ROLES.CLIENTE,
      estado: 'activo', // Por defecto activo
      esEmailFicticio: !!esEmailFicticio || finalEmail.endsWith('@imsse.app'),
      metodoRegistro: 'admin_panel',
      creadoPor: user.uid,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
      permisos: {
        presupuestos: true,
        recibos: true,
        remitos: true,
        estados: true,
        recordatorios: true,
        inspecciones: true,
        planaccion: true
      }
    };

    if (userData.rol === ROLES.CLIENTE) {
      userData.clienteId = userRecord.uid;
      userData.empresaId = empresaId || null;
    }

    await firestore.collection('usuarios').doc(userRecord.uid).set(userData);

    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: userRecord.uid,
        ...userData,
        fechaCreacion: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error al crear usuario desde admin:', error);

    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado' });
    }

    return res.status(500).json({
      error: error.message || 'Error interno al crear usuario'
    });
  }
}

export default withAuth(handler);
