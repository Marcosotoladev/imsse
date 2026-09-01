// scripts/activar-planaccion-clientes.mjs - Activa el permiso "planaccion" para
// todos los usuarios con rol 'cliente' que todavía no lo tengan.
// Uso: node --env-file=.env.local scripts/activar-planaccion-clientes.mjs

import admin from 'firebase-admin';

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const firestore = admin.firestore();

async function main() {
  const snapshot = await firestore.collection('usuarios').where('rol', '==', 'cliente').get();
  const aActualizar = snapshot.docs.filter((doc) => doc.data().permisos?.planaccion !== true);

  console.log(`${snapshot.size} cliente(s) en total, ${aActualizar.length} sin "planaccion" activado.`);

  for (const doc of aActualizar) {
    await doc.ref.update({ 'permisos.planaccion': true });
    console.log(`Permiso "planaccion" activado para ${doc.data().email || doc.id}`);
  }

  console.log('Listo.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error al actualizar permisos:', error);
  process.exit(1);
});
