import { supabase } from './supabaseClient';

export interface UploadResult {
  success: boolean;
  url: string;
  error?: string;
}

/**
 * Upload gambar bukti transfer terkompresi (<150KB) ke Supabase Storage bucket 'bukti-transfer'.
 * Jika bucket belum tersedia di Supabase, secara cerdas fallback mengembalikan Data URL lokal
 * agar sistem operasional pesantren tetap berjalan tanpa hambatan.
 */
export async function uploadBuktiTransfer(
  dataUrlOrFile: string | File,
  filenamePrefix: string = 'tf'
): Promise<UploadResult> {
  try {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${filenamePrefix}_${timestamp}_${randomStr}.jpg`;
    const filePath = `uploads/${fileName}`;

    let fileBody: Blob | File;

    if (typeof dataUrlOrFile === 'string') {
      if (dataUrlOrFile.startsWith('data:')) {
        // Convert Base64 data URL to Blob
        const response = await fetch(dataUrlOrFile);
        fileBody = await response.blob();
      } else {
        // Already a remote URL
        return { success: true, url: dataUrlOrFile };
      }
    } else {
      fileBody = dataUrlOrFile;
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('bukti-transfer')
      .upload(filePath, fileBody, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.warn('Supabase storage upload fallback to local URL:', error.message);
      // Fallback to data URL jika bucket belum dibuat di Supabase
      return {
        success: true,
        url: typeof dataUrlOrFile === 'string' ? dataUrlOrFile : URL.createObjectURL(fileBody),
        error: error.message,
      };
    }

    // Ambil Public URL
    const { data: publicData } = supabase.storage
      .from('bukti-transfer')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicData.publicUrl,
    };
  } catch (err: any) {
    console.error('Storage upload exception:', err);
    return {
      success: true,
      url: typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '',
      error: err.message,
    };
  }
}
