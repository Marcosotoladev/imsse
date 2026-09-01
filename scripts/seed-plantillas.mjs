// scripts/seed-plantillas.mjs - Carga plantillas (JSON con el mismo shape que usa
// el constructor de /admin/plantillas) en la colección `plantillas_inspeccion` de IMSSE.
//
// Uso: node --env-file=.env.local scripts/seed-plantillas.mjs [archivo.json]
// Si no se pasa archivo, usa plantillas-aas-security-seed.json por defecto.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import admin from 'firebase-admin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  const archivo = process.argv[2] || 'plantillas-aas-security-seed.json';
  const raw = await readFile(path.join(__dirname, archivo), 'utf-8');
  const plantillas = JSON.parse(raw);

  console.log(`Cargando ${plantillas.length} plantilla(s) de ${archivo} en plantillas_inspeccion...`);

  for (const plantilla of plantillas) {
    // grupoIMSSE sólo existe en el seed de migración desde aas-security (mapeo de categoría);
    // si no está presente, se usa `grupo` tal cual (ya es una categoría de IMSSE).
    const { grupoIMSSE, grupo, ...resto } = plantilla;
    const grupoFinal = grupoIMSSE || grupo;

    const payload = {
      ...resto,
      grupo: grupoFinal,
      creadoPor: 'seed-script',
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      fechaModificacion: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await firestore.collection('plantillas_inspeccion').add(payload);
    console.log(`✔ "${plantilla.titulo}" (${grupoFinal}) creada con id ${docRef.id}`);
  }

  console.log('Listo.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error al cargar las plantillas:', error);
  process.exit(1);
});
