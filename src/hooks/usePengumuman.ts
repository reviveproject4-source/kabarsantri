import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Pengumuman, PengumumanInput } from '../types';

function pemetaanPengumuman(baris: any): Pengumuman {
  return {
    id: baris.id,
    judul: baris.judul,
    isi: baris.isi,
    kelasTujuan: baris.kelas_tujuan ?? null,
    lampiranUrl: baris.lampiran_url ?? null,
    lampiranNama: baris.lampiran_nama ?? null,
    dibuatOleh: baris.dibuat_oleh ?? '',
    createdAt: baris.created_at,
  };
}

const KUNCI_PENGUMUMAN = ['pengumuman'];

export function usePengumumanList() {
  return useQuery({
    queryKey: KUNCI_PENGUMUMAN,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pengumuman')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map(pemetaanPengumuman);
    },
  });
}

export function useTambahPengumuman() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PengumumanInput) => {
      const { error } = await supabase.from('pengumuman').insert({
        judul: input.judul,
        isi: input.isi,
        kelas_tujuan:
          input.kelasTujuan && input.kelasTujuan.length > 0
            ? input.kelasTujuan
            : null,
        lampiran_url: input.lampiranUrl,
        lampiran_nama: input.lampiranNama,
        dibuat_oleh: input.dibuatOleh,
      });

      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_PENGUMUMAN }),
  });
}

export function useHapusPengumuman() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('pengumuman')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_PENGUMUMAN }),
  });
}
