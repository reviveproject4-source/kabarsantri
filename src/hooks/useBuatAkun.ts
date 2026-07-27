import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface BuatAkunInput {
  email?: string;
  // Opsional saat reset akun pegawai (kosongkan supaya password lama tidak
  // ikut berubah). Tetap wajib untuk akun baru dan akun Wali.
  password?: string;
  peran: 'pegawai' | 'wali';
  pegawaiId?: number;
  santriId?: number;
}

// Memanggil Edge Function `buat-akun` (butuh service_role, jadi harus lewat
// server, bukan langsung dari client) -- dipakai Yayasan untuk membuatkan
// login Pegawai atau Wali Santri.
export function useBuatAkun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BuatAkunInput) => {
      const { data, error } = await supabase.functions.invoke('buat-akun', {
        body: input,
      });

      if (error) {
        // Saat Edge Function mengembalikan status non-2xx, pesan aslinya
        // (JSON { error: "..." } yang kita kirim dari server) ada di
        // error.context (Response mentah), bukan di `data` -- perlu dibaca
        // manual supaya pesan errornya jelas, bukan cuma "non-2xx".
        if (error instanceof FunctionsHttpError) {
          let pesan = error.message;

          try {
            const isi = await error.context.json();
            if (isi?.error) pesan = isi.error;
          } catch {
            // respons bukan JSON valid, pakai pesan default di atas
          }

          throw new Error(pesan);
        }
        throw error;
      }

      if (data?.error) throw new Error(data.error);
      return data as { ok: true; userId: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pegawai'] });
      queryClient.invalidateQueries({ queryKey: ['santri'] });
    },
  });
}
