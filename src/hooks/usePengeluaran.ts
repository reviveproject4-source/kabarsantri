import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseAktif } from '../supabaseClient';
import { Pengeluaran, PengeluaranInput } from '../types';

const KUNCI_PENGELUARAN = ['pengeluaran'];

export const DEFAULT_PENGELUARAN: Pengeluaran[] = [
  {
    id: 1,
    tanggal: '2026-09-10',
    kategori: 'Listrik & Air',
    nominal: 4500000,
    tipeBiaya: 'FIXED',
    sumberDana: 'Bank Syariah Indonesia',
    keterangan: 'Pembayaran tagihan listrik & PDAM kampus utama',
    dicatatOleh: 'Ustadzah Fatimah',
  },
  {
    id: 2,
    tanggal: '2026-09-15',
    kategori: 'Konsumsi Santri',
    nominal: 12500000,
    tipeBiaya: 'VARIABLE',
    sumberDana: 'Kas Utama',
    keterangan: 'Belanja bahan dapur & katering mingguan santri',
    dicatatOleh: 'Ustadzah Fatimah',
  },
  {
    id: 3,
    tanggal: '2026-09-20',
    kategori: 'Kegiatan Santri',
    nominal: 3200000,
    tipeBiaya: 'VARIABLE',
    sumberDana: 'Kas Utama',
    keterangan: 'Perlengkapan lomba MQK & PHBI santri',
    dicatatOleh: 'Ustadzah Fatimah',
  },
];

export function usePengeluaranList() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: KUNCI_PENGELUARAN,
    queryFn: async () => {
      if (!supabaseAktif) {
        const cached = queryClient.getQueryData<Pengeluaran[]>(KUNCI_PENGELUARAN);
        return cached ?? DEFAULT_PENGELUARAN;
      }

      const { data, error } = await supabase
        .from('pengeluaran')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) {
        const cached = queryClient.getQueryData<Pengeluaran[]>(KUNCI_PENGELUARAN);
        return cached ?? DEFAULT_PENGELUARAN;
      }

      return (data as any[]).map((row) => ({
        id: row.id,
        tanggal: row.tanggal,
        kategori: row.kategori,
        nominal: Number(row.nominal),
        tipeBiaya: row.tipe_biaya ?? 'VARIABLE',
        sumberDana: row.sumber_dana ?? 'Kas Utama',
        keterangan: row.keterangan ?? '',
        buktiUrl: row.bukti_url,
        dicatatOleh: row.dicatat_oleh ?? 'Keuangan',
      }));
    },
    initialData: DEFAULT_PENGELUARAN,
  });
}

export function useTambahPengeluaran() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PengeluaranInput) => {
      if (supabaseAktif) {
        const { data, error } = await supabase
          .from('pengeluaran')
          .insert({
            tanggal: input.tanggal,
            kategori: input.kategori,
            nominal: input.nominal,
            tipe_biaya: input.tipeBiaya,
            sumber_dana: input.sumberDana,
            keterangan: input.keterangan,
            bukti_url: input.buktiUrl,
            dicatat_oleh: input.dicatatOleh,
          })
          .select('*')
          .single();

        if (!error && data) {
          return {
            id: data.id,
            ...input,
          } as Pengeluaran;
        }
      }

      const listLama = queryClient.getQueryData<Pengeluaran[]>(KUNCI_PENGELUARAN) ?? DEFAULT_PENGELUARAN;
      const barisBaru: Pengeluaran = {
        id: Date.now(),
        ...input,
      };
      return barisBaru;
    },
    onSuccess: (barisBaru) => {
      queryClient.setQueryData<Pengeluaran[]>(KUNCI_PENGELUARAN, (lama) => {
        const daftar = lama ?? DEFAULT_PENGELUARAN;
        return [barisBaru, ...daftar];
      });
    },
  });
}
