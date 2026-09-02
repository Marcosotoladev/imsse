// lib/cloudinary.js - Subida de imágenes a Cloudinary (compartido entre el flujo
// online de creación y el worker de sincronización offline)

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.8;
const OMITIR_COMPRESION_DEBAJO_DE = 500 * 1024; // no vale la pena comprimir archivos ya chicos
const UPLOAD_TIMEOUT_MS = 25000;
const UPLOAD_MAX_REINTENTOS = 2;

// Redimensiona/recomprime la foto en el propio celular antes de subirla: una foto de
// cámara moderna pesa 3-8MB, esto la deja habitualmente por debajo de 1MB. Si algo
// falla (formato no soportado, etc.) se sigue con el archivo original sin bloquear.
async function comprimirImagen(file) {
  if (!file.type?.startsWith('image/') || file.type === 'image/svg+xml') return file;
  if (file.size <= OMITIR_COMPRESION_DEBAJO_DE) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * escala);
    const height = Math.round(bitmap.height * escala);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name || 'foto.jpg', { type: 'image/jpeg' });
  } catch (error) {
    console.warn('No se pudo comprimir la imagen, se sube el archivo original:', error.message);
    return file;
  }
}

async function subirUnaVez(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData, signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error('Error al subir la imagen');
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// Sube una foto con compresión previa, timeout (para que señal mala falle en vez de
// colgar el spinner para siempre) y un par de reintentos con backoff corto.
export async function uploadToCloudinary(file, folder) {
  const archivo = await comprimirImagen(file);

  let ultimoError;
  for (let intento = 0; intento <= UPLOAD_MAX_REINTENTOS; intento++) {
    try {
      const data = await subirUnaVez(archivo, folder);
      return {
        id: Date.now() + Math.random(),
        url: data.secure_url,
        nombre: file.name || 'foto.jpg',
        fechaSubida: new Date().toISOString()
      };
    } catch (error) {
      ultimoError = error;
      if (intento < UPLOAD_MAX_REINTENTOS) {
        await new Promise((resolve) => setTimeout(resolve, 800 * (intento + 1)));
      }
    }
  }

  throw ultimoError;
}

// Sube varias fotos con concurrencia limitada (en vez de todas en paralelo, que con
// señal mala satura la conexión). Fail-fast: si una foto del lote actual falla, no se
// procesan los lotes siguientes — el error se propaga para que el llamador decida
// mandar todo al camino offline en vez de mezclar éxitos parciales.
export async function subirFotos(files, folder, concurrency = 2) {
  const resultados = [];
  for (let i = 0; i < files.length; i += concurrency) {
    const lote = files.slice(i, i + concurrency);
    const subidos = await Promise.all(lote.map((file) => uploadToCloudinary(file, folder)));
    resultados.push(...subidos);
  }
  return resultados;
}
