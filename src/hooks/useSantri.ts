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

export const DEFAULT_SANTRI: Santri[] = [
  {
    id: 1,
    nama: 'Ahmad Santri',
    nis: '12345',
    nisn: '9988776611',
    jenisKelamin: 'L',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2010-05-15',
    status: 'Aktif',
    kelas: '7A',
    asrama: 'Asrama Al-Ghozali',
    namaAyah: 'Bapak H. Abdullah',
    pekerjaanAyah: 'Wiraswasta',
    noHpAyah: '081234567890',
    namaIbu: 'Ibu Siti Khadijah',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    noHpIbu: '081234567891',
    alamatWali: 'Jl. Pesantren No. 10, Depok',
    juzTerakhir: '30',
    suratTerakhir: 'An-Naba',
    ayatTerakhir: '1-40',
    nilaiTahfidz: 'Mumtaz (Sangat Baik)',
    riwayatTahfidz: [
      {
        id: 101,
        tanggal: '2026-09-25',
        juz: '30',
        surat: 'An-Naba',
        ayat: '1-40',
        hadits: '',
        kitab: '',
        nilai: 'Mumtaz (Sangat Baik)',
        dicatatOleh: 'Ust. Abdullah',
      },
    ],
  },
  {
    id: 2,
    nama: 'Muhammad Rizky',
    nis: '12346',
    nisn: '9988776622',
    jenisKelamin: 'L',
    tempatLahir: 'Bandung',
    tanggalLahir: '2010-08-20',
    status: 'Aktif',
    kelas: '7A',
    asrama: 'Asrama Al-Ghozali',
    namaAyah: 'Bapak Ahmad',
    pekerjaanAyah: 'PNS',
    noHpAyah: '081298765432',
    namaIbu: 'Ibu Aminah',
    pekerjaanIbu: 'Guru',
    noHpIbu: '081298765433',
    alamatWali: 'Jl. Merdeka No. 5, Bandung',
    juzTerakhir: '29',
    suratTerakhir: 'Al-Mulk',
    ayatTerakhir: '1-30',
    nilaiTahfidz: 'Jayyid Jiddan',
    riwayatTahfidz: [],
  },
  {
    id: 3,
    nama: 'Fatimah Az-Zahra',
    nis: '12347',
    nisn: '9988776633',
    jenisKelamin: 'P',
    tempatLahir: 'Surakarta',
    tanggalLahir: '2011-01-10',
    status: 'Aktif',
    kelas: '7B',
    asrama: 'Asrama Khadijah',
    namaAyah: 'Bapak Umar',
    pekerjaanAyah: 'Pedagang',
    noHpAyah: '081311223344',
    namaIbu: 'Ibu Mariam',
    pekerjaanIbu: 'Karyawan',
    noHpIbu: '081311223345',
    alamatWali: 'Jl. Solo No. 12, Surakarta',
    juzTerakhir: '1',
    suratTerakhir: 'Al-Baqarah',
    ayatTerakhir: '1-100',
    nilaiTahfidz: 'Mumtaz',
    riwayatTahfidz: [],
  },
  {
    id: 4,
    nama: 'Siti Aisyah',
    nis: '12348',
    nisn: '9988776644',
    jenisKelamin: 'P',
    tempatLahir: 'Bogor',
    tanggalLahir: '2011-03-25',
    status: 'Aktif',
    kelas: '7B',
    asrama: 'Asrama Khadijah',
    namaAyah: 'Bapak Usman',
    pekerjaanAyah: 'Dosen',
    noHpAyah: '081455667788',
    namaIbu: 'Ibu Ruqayyah',
    pekerjaanIbu: 'Dokter',
    noHpIbu: '081455667789',
    alamatWali: 'Jl. Pajajaran No. 8, Bogor',
    juzTerakhir: '30',
    suratTerakhir: 'An-Nas',
    ayatTerakhir: '1-6',
    nilaiTahfidz: 'Mumtaz',
    riwayatTahfidz: [],
  },
];

export function useSantriList() {
  return useQuery({
    queryKey: KUNCI_SANTRI,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('santri')
          .select('*, riwayat_tahfidz(*)')
          .order('nama');

        if (error || !data || data.length === 0) {
          return DEFAULT_SANTRI;
        }
        return data.map(pemetaanSantri);
      } catch {
        return DEFAULT_SANTRI;
      }
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
