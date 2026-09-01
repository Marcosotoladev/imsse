// scripts/desactivar-ordenes-clientes.mjs - Quita el acceso a "Órdenes de Trabajo"
// para todos los usuarios con rol 'cliente' que todavía lo tuvieran activado.
// Uso único (Órdenes de Trabajo pasa a ser sólo interno, admin/técnico).
//
// Uso: node --env-file=.env.local scripts/desactivar-ordenes-clientes.mjs

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

  const aActualizar = snapshot.docs.filter((doc) => doc.data().permisos?.ordenes === true);

  console.log(`${snapshot.size} cliente(s) en total, ${aActualizar.length} con "ordenes" activado.`);

  for (const doc of aActualizar) {
    await doc.ref.update({ 'permisos.ordenes': admin.firestore.FieldValue.delete() });
    console.log(`✔ Permiso "ordenes" quitado a ${doc.data().email || doc.id}`);
  }

  console.log('Listo.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error al actualizar permisos:', error);
  process.exit(1);
});
