// pages/api/users/change-password.js - Restablecimiento de contraseña por Administrador
import { withAuth, ROLES } from '../../../lib/auth-middleware';
import { auth, firestore } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';

async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user } = req;

  // Solo un administrador puede cambiar contraseñas directamente
  if (user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden restablecer contraseñas.' });
  }

  try {
    const { targetUid, newPassword } = req.body;

    if (!targetUid) {
      return res.status(400).json({ error: 'Se requiere el ID de usuario (targetUid)' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // 1. Actualizar contraseña en Firebase Auth usando Firebase Admin SDK
    await auth.updateUser(targetUid, {
      password: newPassword
    });

    // 2. Registrar timestamp de modificación en Firestore
    await firestore.collection('usuarios').doc(targetUid).update({
      fechaUltimoCambioPassword: admin.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp(),
      modificadoPor: user.uid
    }).catch(err => {
      console.warn('No se pudo actualizar metadata en Firestore, pero Auth se actualizó:', err);
    });

    return res.status(200).json({
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña de usuario:', error);
    return res.status(500).json({
      error: error.message || 'Error interno al cambiar la contraseña'
    });
  }
}

export default withAuth(handler);
