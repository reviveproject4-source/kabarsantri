import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { StatusPaket } from '../types';

// Data yayasan (termasuk status paket) dimuat lewat AuthContext, bukan
// react-query -- pemanggil harus panggil useAuth().muatUlangYayasan() sendiri
// di onSuccess supaya AuthContext ambil status paket terbaru.
export function useSetPaket() {
  return useMutation({
    mutationFn: async ({
      yayasanId,
      paket,
    }: {
      yayasanId: string;
      paket: StatusPaket;
    }) => {
      const { error } = await supabase
        .from('yayasan')
        .update({ paket })
        .eq('id', yayasanId);

      if (error) throw error;
    },
  });
}
