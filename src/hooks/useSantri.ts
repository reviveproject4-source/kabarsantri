import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { RiwayatTahfidz, Santri, SantriInput } from '../types';

function pemetaanTahfidz(baris: any): RiwayatTahfidz {
  return {
    id: baris.id,
    tanggal: baris.tanggal,
    juz: baris.juz ?? '',
    surat: baris.surat ?? '',
    ayat: baris.ayat ?? '',
    hadits: baris.hadits ?? '',
    kitab: baris.kitab ?? '',
    nilai: baris.nilai ?? '',
    dicatatOleh: baris.dicatat_oleh ?? '',
  };
}

function pemetaanSantri(baris: any): Santri {
  return {
    id: baris.id,
    nama: baris.nama,
    nis: baris.nis,
    nisn: baris.nisn ?? '',
    jenisKelamin: baris.jenis_kelamin ?? '',
    tempatLahir: baris.tempat_lahir ?? '',
    tanggalLahir: baris.tanggal_lahir ?? '',
    status: baris.status ?? 'Aktif',
    kelas: baris.kelas ?? '',
    asrama: baris.asrama ?? '',
    namaAyah: baris.nama_ayah ?? '',
    pekerjaanAyah: baris.pekerjaan_ayah ?? '',
    noHpAyah: baris.no_hp_ayah ?? '',
    namaIbu: baris.nama_ibu ?? '',
    pekerjaanIbu: baris.pekerjaan_ibu ?? '',
    noHpIbu: baris.no_hp_ibu ?? '',
    alamatWali: baris.alamat_wali ?? '',
    juzTerakhir: baris.juz_terakhir ?? '',
    suratTerakhir: baris.surat_terakhir ?? '',
    ayatTerakhir: baris.ayat_terakhir ?? '',
    nilaiTahfidz: baris.nilai_tahfidz ?? '',
    riwayatTahfidz: (baris.riwayat_tahfidz ?? []).map(pemetaanTahfidz),
  };
}

const KUNCI_SANTRI = ['santri'];

export function useSantriList() {
  return useQuery({
    queryKey: KUNCI_SANTRI,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('santri')
        .select('*, riwayat_tahfidz(*)')
        .order('nama');

      if (error) throw error;
      return (data ?? []).map(pemetaanSantri);
    },
  });
}

export function useSantriById(id: number | null) {
  return useQuery({
    queryKey: [...KUNCI_SANTRI, id],
    enabled: id !== null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('santri')
        .select('*, riwayat_tahfidz(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return pemetaanSantri(data);
    },
  });
}

export function useTambahSantri() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SantriInput) => {
      const { data, error } = await supabase
        .from('santri')
        .insert({
          nama: input.nama,
          nis: input.nis,
          nisn: input.nisn,
          jenis_kelamin: input.jenisKelamin,
          tempat_lahir: input.tempatLahir,
          tanggal_lahir: input.tanggalLahir || null,
          status: input.status,
          kelas: input.kelas,
          asrama: input.asrama,
          nama_ayah: input.namaAyah,
          pekerjaan_ayah: input.pekerjaanAyah,
          no_hp_ayah: input.noHpAyah,
          nama_ibu: input.namaIbu,
          pekerjaan_ibu: input.pekerjaanIbu,
          no_hp_ibu: input.noHpIbu,
          alamat_wali: input.alamatWali,
          juz_terakhir: input.juzTerakhir,
          surat_terakhir: input.suratTerakhir,
          ayat_terakhir: input.ayatTerakhir,
          nilai_tahfidz: input.nilaiTahfidz,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id as number;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KUNCI_SANTRI }),
  });
}

export function useUbahSantri() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: SantriInput }) => {
      const { error } = await supabase
        .from('santri')
        .update({
          nama: input.nama,
          nis: input.nis,
          nisn: input.nisn,
          jenis_kelamin: input.jenisKelamin,
          tempat_lahir: input.tempatLahir,
          tanggal_lahir: input.tanggalLahir || null,
          status: input.status,
          kelas: input.kelas,
          asrama: input.asrama,
          nama_ayah: input.namaAyah,
          pekerjaan_ayah: input.pekerjaanAyah,
          no_hp_ayah: input.noHpAyah,
          nama_ibu: input.namaIbu,
          pekerjaan_ibu: input.pekerjaanIbu,
          no_hp_ibu: input.noHpIbu,
          alamat_wali: input.alamatWali,
          juz_terakhir: input.juzTerakhir,
          surat_terakhir: input.suratTerakhir,
          ayat_terakhir: input.ayatTerakhir,
          nilai_tahfidz: input.nilaiTahfidz,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KUNCI_SANTRI }),
  });
}

export function useTambahRiwayatTahfidz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      santriId,
      riwayat,
    }: {
      santriId: number;
      riwayat: Omit<RiwayatTahfidz, 'id' | 'tanggal'>;
    }) => {
      const { error } = await supabase.from('riwayat_tahfidz').insert({
        santri_id: santriId,
        juz: riwayat.juz,
        surat: riwayat.surat,
        ayat: riwayat.ayat,
        hadits: riwayat.hadits,
        kitab: riwayat.kitab,
        nilai: riwayat.nilai,
        dicatat_oleh: riwayat.dicatatOleh,
      });

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KUNCI_SANTRI }),
  });
}
