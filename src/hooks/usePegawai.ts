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

export function usePegawaiList() {
  return useQuery({
    queryKey: KUNCI_PEGAWAI,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pegawai')
        .select('*')
        .order('nama');

      if (error) throw error;
      return (data ?? []).map(pemetaanPegawai);
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
