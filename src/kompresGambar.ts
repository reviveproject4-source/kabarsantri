import imageCompression from 'browser-image-compression';

export async function kompresGambar(file: File): Promise<File> {
  try {
    return await imageCompression(file, {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      initialQuality: 0.75,
    });
  } catch {
    return file;
  }
}
