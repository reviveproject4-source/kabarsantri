import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseAktif } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { PotonganPayroll, PotonganPayrollInput } from '../types';

const KUNCI_POTONGAN = ['potongan_payroll'];

export const DEFAULT_POTONGAN: PotonganPayroll[] = [
  {
    id: 1,
    pegawaiId: 1,
    periode: 'September 2026',
    jenisPotongan: 'Ketidakhadiran',
    nominal: 150000,
    keterangan: 'Potongan keterlambatan 2 kali rapat guru',
    tanggalInput: '2026-09-22',
    petugasKeuangan: 'Ustadzah Fatimah',
  },
];

export function usePotonganPayrollList() {
  const queryClient = useQueryClient();
  const { profil, session } = useAuth();

  return useQuery({
    queryKey: KUNCI_POTONGAN,
    queryFn: async () => {
      const isDemo =
        !profil ||
        profil.yayasan_id === 'demo-yayasan-01' ||
        (session?.user?.id && session.user.id.startsWith('demo-')) ||
        (session?.user?.email && session.user.email.includes('@kabarsantri.id'));

      if (!supabaseAktif) {
        const cached = queryClient.getQueryData<PotonganPayroll[]>(KUNCI_POTONGAN);
        return cached ?? (isDemo ? DEFAULT_POTONGAN : []);
      }

      let query = supabase.from('potongan_payroll').select('*');
      if (profil?.yayasan_id && profil.yayasan_id !== 'demo-yayasan-01') {
        query = query.eq('yayasan_id', profil.yayasan_id);
      }

      const { data, error } = await query.order('tanggal_input', { ascending: false });

      if (error || !data || data.length === 0) {
        const cached = queryClient.getQueryData<PotonganPayroll[]>(KUNCI_POTONGAN);
        return cached ?? (isDemo ? DEFAULT_POTONGAN : []);
      }

      return (data as any[]).map((row) => ({
        id: row.id,
        pegawaiId: row.pegawai_id,
        periode: row.periode,
        jenisPotongan: row.jenis_potongan,
        nominal: Number(row.nominal),
        keterangan: row.keterangan ?? '',
        tanggalInput: row.tanggal_input,
        petugasKeuangan: row.petugas_keuangan ?? 'Keuangan',
      }));
    },
  });
}

export function useTambahPotonganPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PotonganPayrollInput) => {
      const tanggalHariIni = new Date().toISOString().split('T')[0];

      if (supabaseAktif) {
        const { data, error } = await supabase
          .from('potongan_payroll')
          .insert({
            pegawai_id: input.pegawaiId,
            periode: input.periode,
            jenis_potongan: input.jenisPotongan,
            nominal: input.nominal,
            keterangan: input.keterangan,
            tanggal_input: tanggalHariIni,
            petugas_keuangan: input.petugasKeuangan,
          })
          .select('*')
          .single();

        if (!error && data) {
          return {
            id: data.id,
            ...input,
            tanggalInput: tanggalHariIni,
          } as PotonganPayroll;
        }
      }

      const listLama = queryClient.getQueryData<PotonganPayroll[]>(KUNCI_POTONGAN) ?? DEFAULT_POTONGAN;
      const barisBaru: PotonganPayroll = {
        id: Date.now(),
        ...input,
        tanggalInput: tanggalHariIni,
      };
      return barisBaru;
    },
    onSuccess: (barisBaru) => {
      queryClient.setQueryData<PotonganPayroll[]>(KUNCI_POTONGAN, (lama) => {
        const daftar = lama ?? DEFAULT_POTONGAN;
        return [barisBaru, ...daftar];
      });
    },
  });
}
