import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseAktif } from '../supabaseClient';
import { LogKomunikasiWali } from '../types';

const KUNCI_LOG_KOMUNIKASI = ['log_komunikasi_wali'];

export const DEFAULT_LOG_KOMUNIKASI: LogKomunikasiWali[] = [
  {
    id: 1,
    petugasKeuangan: 'Ustadzah Fatimah',
    santriId: 1,
    waliNama: 'H. Abdullah',
    noHpWali: '081234567890',
    jenisPesan: 'Tagihan',
    referensiTransaksi: 'SPP September 2026',
    tanggalWaktu: '2026-09-24 10:15',
    statusDelivery: 'WA PROTOCOL INVOKED',
    isiPesan: 'Pemberitahuan tagihan SPP September 2026 sebesar Rp500.000 untuk santri Ahmad Santri',
  },
];

export function useLogKomunikasiWaliList() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: KUNCI_LOG_KOMUNIKASI,
    queryFn: async () => {
      if (!supabaseAktif) {
        const cached = queryClient.getQueryData<LogKomunikasiWali[]>(KUNCI_LOG_KOMUNIKASI);
        return cached ?? DEFAULT_LOG_KOMUNIKASI;
      }

      const { data, error } = await supabase
        .from('log_komunikasi_wali')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        const cached = queryClient.getQueryData<LogKomunikasiWali[]>(KUNCI_LOG_KOMUNIKASI);
        return cached ?? DEFAULT_LOG_KOMUNIKASI;
      }

      return (data as any[]).map((row) => ({
        id: row.id,
        petugasKeuangan: row.petugas_keuangan,
        santriId: row.santri_id,
        waliNama: row.wali_nama,
        noHpWali: row.no_hp_wali,
        jenisPesan: row.jenis_pesan,
        referensiTransaksi: row.referensi_transaksi,
        tanggalWaktu: row.tanggal_waktu,
        statusDelivery: row.status_delivery ?? 'WA PROTOCOL INVOKED',
        isiPesan: row.isi_pesan,
      }));
    },
    initialData: DEFAULT_LOG_KOMUNIKASI,
  });
}

export function useTambahLogKomunikasiWali() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<LogKomunikasiWali, 'id' | 'tanggalWaktu' | 'statusDelivery'>) => {
      const skrg = new Date();
      const formatWaktu = `${skrg.toISOString().split('T')[0]} ${skrg.toTimeString().substring(0, 5)}`;

      const barisBaru: LogKomunikasiWali = {
        id: Date.now(),
        ...input,
        tanggalWaktu: formatWaktu,
        statusDelivery: 'WA PROTOCOL INVOKED',
      };

      if (supabaseAktif) {
        await supabase
          .from('log_komunikasi_wali')
          .insert({
            petugas_keuangan: input.petugasKeuangan,
            santri_id: input.santriId,
            wali_nama: input.waliNama,
            no_hp_wali: input.noHpWali,
            jenis_pesan: input.jenisPesan,
            referensi_transaksi: input.referensiTransaksi,
            tanggal_waktu: formatWaktu,
            status_delivery: 'WA PROTOCOL INVOKED',
            isi_pesan: input.isiPesan,
          });
      }

      return barisBaru;
    },
    onSuccess: (barisBaru) => {
      queryClient.setQueryData<LogKomunikasiWali[]>(KUNCI_LOG_KOMUNIKASI, (lama) => {
        const daftar = lama ?? DEFAULT_LOG_KOMUNIKASI;
        return [barisBaru, ...daftar];
      });
    },
  });
}
