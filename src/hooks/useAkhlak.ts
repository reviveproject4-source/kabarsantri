import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { NilaiAkhlak } from '../types';

function pemetaanAkhlak(baris: any): NilaiAkhlak {
  return {
    id: baris.id,
    santriId: baris.santri_id,
    tanggal: baris.tanggal,
    nilai: baris.nilai,
    catatan: baris.catatan ?? '',
    dicatatOleh: baris.dicatat_oleh ?? '',
    status: baris.status ?? 'Disetujui',
  };
}

const KUNCI_AKHLAK = ['nilaiAkhlak'];

export function useNilaiAkhlakList() {
  return useQuery({
    queryKey: KUNCI_AKHLAK,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nilai_akhlak')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return (data ?? []).map(pemetaanAkhlak);
    },
  });
}

export function useTambahNilaiAkhlak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<NilaiAkhlak, 'id' | 'tanggal'>) => {
      const { error } = await supabase.from('nilai_akhlak').insert({
        santri_id: data.santriId,
        nilai: data.nilai,
        catatan: data.catatan,
        dicatat_oleh: data.dicatatOleh,
        status: data.status,
      });

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KUNCI_AKHLAK }),
  });
}

export function usePerbaruiStatusNilaiAkhlak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: NilaiAkhlak['status'];
    }) => {
      const { error } = await supabase
        .from('nilai_akhlak')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KUNCI_AKHLAK }),
  });
}
