import imageCompression from 'https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/+esm';

const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: 0.8 };

export async function compressImage(file) {
  try {
    return await imageCompression(file, options);
  } catch (error) {
    throw new Error(`We could not compress ${file.name}. Please try another image.`);
  }
}
