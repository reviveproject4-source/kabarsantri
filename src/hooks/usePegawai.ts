import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
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
  },
];

export function usePegawaiList() {
  return useQuery({
    queryKey: KUNCI_PEGAWAI,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('pegawai')
          .select('*')
          .order('nama');

        if (error || !data || data.length === 0) {
          return DEFAULT_PEGAWAI;
        }
        return data.map(pemetaanPegawai);
      } catch {
        return DEFAULT_PEGAWAI;
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
