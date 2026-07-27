import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { IzinPulang, StatusIzinPulang } from '../types';

function pemetaanIzinPulang(baris: any): IzinPulang {
  return {
    id: baris.id,
    santriId: baris.santri_id,
    tanggalKeluar: baris.tanggal_keluar,
    tanggalKembali: baris.tanggal_kembali,
    alasan: baris.alasan ?? '',
    status: baris.status,
    diajukanTanggal: baris.diajukan_tanggal,
  };
}

const KUNCI_IZIN_PULANG = ['izinPulang'];

export function useIzinPulangList() {
  return useQuery({
    queryKey: KUNCI_IZIN_PULANG,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('izin_pulang')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      return (data ?? []).map(pemetaanIzinPulang);
    },
  });
}

export function useAjukanIzinPulang() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Omit<IzinPulang, 'id' | 'status' | 'diajukanTanggal'>
    ) => {
      const { error } = await supabase.from('izin_pulang').insert({
        santri_id: data.santriId,
        tanggal_keluar: data.tanggalKeluar,
        tanggal_kembali: data.tanggalKembali,
        alasan: data.alasan,
      });

      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_IZIN_PULANG }),
  });
}

export function usePerbaruiStatusIzinPulang() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: StatusIzinPulang;
    }) => {
      const { error } = await supabase
        .from('izin_pulang')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_IZIN_PULANG }),
  });
}
