import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { Pegawai, PegawaiInput } from '../types';

function pemetaanPegawai(baris: any): Pegawai {
  return {
    id: baris.id,
    nama: baris.nama,
    nip: baris.nip ?? '',
    jabatan: baris.jabatan,
    hp: baris.hp ?? '',
    email: baris.email ?? '',
    status: baris.status ?? 'Aktif',
    kelasDiajar: baris.kelas_diajar ?? [],
    aksesSemuaKelas: baris.akses_semua_kelas ?? false,
    jenisKelaminDiampu: baris.jenis_kelamin_diampu ?? '',
    gajiPokok: baris.gaji_pokok ?? 3500000,
    tunjanganTetap: baris.tunjangan_tetap ?? 1000000,
  };
}

const KUNCI_PEGAWAI = ['pegawai'];

export const DEFAULT_PEGAWAI: Pegawai[] = [
  {
    id: 1,
    nama: 'Ust. Abdullah',
    nip: '19900101',
    jabatan: 'Guru',
    hp: '081234567890',
    email: 'guru@kabarsantri.id',
    status: 'Aktif',
    kelasDiajar: ['7A', '7B'],
    aksesSemuaKelas: false,
    jenisKelaminDiampu: 'L',
    gajiPokok: 3500000,
    tunjanganTetap: 1000000,
  },
  {
    id: 2,
    nama: 'Ust. Farhan',
    nip: '19900102',
    jabatan: 'Musyrif/Pembina Asrama',
    hp: '081234567891',
    email: 'musyrif@kabarsantri.id',
    status: 'Aktif',
    kelasDiajar: [],
    aksesSemuaKelas: true,
    jenisKelaminDiampu: 'L',
    gajiPokok: 3000000,
    tunjanganTetap: 800000,
  },
  {
    id: 3,
    nama: 'Ustadzah Fatimah',
    nip: '19900103',
    jabatan: 'Bendahara/Keuangan',
    hp: '081234567892',
    email: 'keuangan@kabarsantri.id',
    status: 'Aktif',
    kelasDiajar: [],
    aksesSemuaKelas: true,
    jenisKelaminDiampu: '',
    gajiPokok: 4000000,
    tunjanganTetap: 1200000,
  },
  {
    id: 4,
    nama: 'Drs. H. Ridwan, M.Pd',
    nip: '19900104',
    jabatan: 'Kepala Sekolah',
    hp: '081234567893',
    email: 'kepsek@kabarsantri.id',
    status: 'Aktif',
    kelasDiajar: [],
    aksesSemuaKelas: true,
    jenisKelaminDiampu: '',
    gajiPokok: 6000000,
    tunjanganTetap: 2000000,
  },
  {
    id: 5,
    nama: 'KH. Ahmad Dahlan, Lc',
    nip: '19900105',
    jabatan: 'Ketua Yayasan',
    hp: '081234567894',
    email: 'ketuayayasan@kabarsantri.id',
    status: 'Aktif',
    kelasDiajar: [],
    aksesSemuaKelas: true,
    jenisKelaminDiampu: '',
    gajiPokok: 8000000,
    tunjanganTetap: 3000000,
  },
  {
    id: 6,
    nama: 'Ust. Ahmad Kesantrian',
    nip: '19900106',
    jabatan: 'Kesantrian',
    hp: '081234567895',
    email: 'kesantrian@kabarsantri.id',
    status: 'Aktif',
    kelasDiajar: [],
    aksesSemuaKelas: true,
    jenisKelaminDiampu: '',
    gajiPokok: 3800000,
    tunjanganTetap: 1000000,
  },
];

export function usePegawaiList() {
  const { profil, session } = useAuth();
  return useQuery({
    queryKey: KUNCI_PEGAWAI,
    queryFn: async () => {
      try {
        let query = supabase.from('pegawai').select('*');
        if (profil?.yayasan_id && profil.yayasan_id !== 'demo-yayasan-01') {
          query = query.eq('yayasan_id', profil.yayasan_id);
        }
        const { data, error } = await query.order('nama');

        const isDemo =
          !profil ||
          profil.yayasan_id === 'demo-yayasan-01' ||
          (session?.user?.id && session.user.id.startsWith('demo-')) ||
          (session?.user?.email && session.user.email.includes('@kabarsantri.id'));

        if (error || !data || data.length === 0) {
          return isDemo ? DEFAULT_PEGAWAI : [];
        }
        return data.map(pemetaanPegawai);
      } catch {
        const isDemo =
          !profil ||
          profil.yayasan_id === 'demo-yayasan-01' ||
          (session?.user?.id && session.user.id.startsWith('demo-')) ||
          (session?.user?.email && session.user.email.includes('@kabarsantri.id'));
        return isDemo ? DEFAULT_PEGAWAI : [];
      }
    },
  });
}

export function useTambahPegawai() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PegawaiInput) => {
      const { data, error } = await supabase
        .from('pegawai')
        .insert({
          nama: input.nama,
          nip: input.nip || null,
          jabatan: input.jabatan,
          hp: input.hp,
          status: input.status,
          kelas_diajar: input.kelasDiajar ?? [],
          akses_semua_kelas: input.aksesSemuaKelas ?? false,
          jenis_kelamin_diampu: input.jenisKelaminDiampu || null,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id as number;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_PEGAWAI }),
  });
}

export function useUbahPegawai() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: number;
      input: PegawaiInput;
    }) => {
      const { error } = await supabase
        .from('pegawai')
        .update({
          nama: input.nama,
          nip: input.nip || null,
          jabatan: input.jabatan,
          hp: input.hp,
          status: input.status,
          kelas_diajar: input.kelasDiajar ?? [],
          akses_semua_kelas: input.aksesSemuaKelas ?? false,
          jenis_kelamin_diampu: input.jenisKelaminDiampu || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: KUNCI_PEGAWAI }),
  });
}
