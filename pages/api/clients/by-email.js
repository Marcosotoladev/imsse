import { firestore } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    const query = await firestore
      .collection('clientes')
      .where('email', '==', email)
      .get();
    
    if (query.empty) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    const doc = query.docs[0];
    return res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}