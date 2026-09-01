// lib/cloudinary.js - Subida de imágenes a Cloudinary (compartido entre el flujo
// online de creación y el worker de sincronización offline)

export async function uploadToCloudinary(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error('Error al subir la imagen');
  }

  const data = await response.json();
  return {
    id: Date.now() + Math.random(),
    url: data.secure_url,
    nombre: file.name || 'foto.jpg',
    fechaSubida: new Date().toISOString()
  };
}
