// scripts/set-superadmin.js
// Marca (o desmarca) la cuenta de un usuario existente como Superadmin.
// Uso: node scripts/set-superadmin.js correo@ejemplo.com
//      node scripts/set-superadmin.js correo@ejemplo.com --quitar
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// lib/firebase-admin.js usa ESM (import/export), por eso este script CommonJS
// no puede requerirlo directo; se repite acá la misma inicialización mínima.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
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
    }),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const firestore = admin.firestore();

async function main() {
  const email = process.argv[2];
  const quitar = process.argv.includes('--quitar');

  if (!email) {
    console.error('Uso: node scripts/set-superadmin.js correo@ejemplo.com [--quitar]');
    process.exit(1);
  }

  const snapshot = await firestore
    .collection('usuarios')
    .where('email', '==', email.toLowerCase().trim())
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.error(`No se encontró ningún usuario con el email ${email}`);
    process.exit(1);
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  if (data.rol !== 'admin') {
    console.error(`El usuario ${email} tiene rol "${data.rol}", debe ser "admin" antes de convertirlo en Superadmin.`);
    process.exit(1);
  }

  await doc.ref.update({ superAdmin: !quitar });

  console.log(
    quitar
      ? `✅ ${email} ya no es Superadmin.`
      : `✅ ${email} ahora es Superadmin (invisible para el resto de los admins, bypass total del modo mantenimiento).`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error('Error ejecutando el script:', error);
  process.exit(1);
});
