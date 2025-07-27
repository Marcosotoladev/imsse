import { firestore } from '../../../lib/firebase-admin';
import admin from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const docRef = await firestore.collection('clientes').add({
      ...req.body,
      fechaAlta: admin.firestore.FieldValue.serverTimestamp(),
      estado: 'activo'
    });
    
    return res.status(201).json({ id: docRef.id });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}