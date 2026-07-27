import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Pelanggaran, Reward } from '../types';

function pemetaanPelanggaran(baris: any): Pelanggaran {
  return {
    id: baris.id,
    santriId: baris.santri_id,
    tanggal: baris.tanggal,
    kategori: baris.kategori,
    catatan: baris.catatan ?? '',
    dicatatOleh: baris.dicatat_oleh ?? '',
    status: baris.status ?? 'Disetujui',
  };
}

function pemetaanReward(baris: any): Reward {
  return {
    id: baris.id,
    santriId: baris.santri_id,
    tanggal: baris.tanggal,
    kategori: baris.kategori,
    catatan: baris.catatan ?? '',
    dicatatOleh: baris.dicatat_oleh ?? '',
  };
}

const KUNCI_PELANGGARAN = ['pelanggaran'];
const KUNCI_REWARD = ['reward'];

export function usePelanggaranList() {
  return useQuery({
    queryKey: KUNCI_PELANGGARAN,
    queryFn: async () => {
      const { data, error } = await supabase.from('pelanggaran').select('*');
      if (error) throw error;
      return (data ?? []).map(pemetaanPelanggaran);
    },
  });
}

export function useTambahPelanggaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Pelanggaran, 'id' | 'tanggal'>) => {
      const { error } = await supabase.from('pelanggaran').insert({
        santri_id: data.santriId,
        kategori: data.kategori,
        catatan: data.catatan,
        dicatat_oleh: data.dicatatOleh,
        status: data.status,
      });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_PELANGGARAN }),
  });
}

export function usePerbaruiStatusPelanggaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: Pelanggaran['status'];
    }) => {
      const { error } = await supabase
        .from('pelanggaran')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_PELANGGARAN }),
  });
}

export function useRewardList() {
  return useQuery({
    queryKey: KUNCI_REWARD,
    queryFn: async () => {
      const { data, error } = await supabase.from('reward').select('*');
      if (error) throw error;
      return (data ?? []).map(pemetaanReward);
    },
  });
}

export function useTambahReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Reward, 'id' | 'tanggal'>) => {
      const { error } = await supabase.from('reward').insert({
        santri_id: data.santriId,
        kategori: data.kategori,
        catatan: data.catatan,
        dicatat_oleh: data.dicatatOleh,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KUNCI_REWARD }),
  });
}
