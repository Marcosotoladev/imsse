// lib/imagenes.js - Conversión de fotos para el flujo offline: mientras no hay
// conexión se guardan como base64 en IndexedDB; al sincronizar se convierten de
// vuelta a Blob para subirlas recién ahí a Cloudinary.

export function archivoABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binario = atob(base64);
  const array = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    array[i] = binario.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}
