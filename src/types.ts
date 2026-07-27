export type StatusPresensi = 'Hadir' | 'Sakit' | 'Izin' | 'Alfa';
export type StatusPaket = 'Gratis' | 'Premium';
export type StatusIzinPulang = 'Menunggu' | 'Disetujui' | 'Ditolak';
export type JenisTransaksi = 'Setor' | 'Tarik';
export type StatusLunas = 'Lunas' | 'Belum Lunas';

export interface RiwayatTahfidz {
  id: number;
  tanggal: string;
  juz: string;
  surat: string;
  ayat: string;
  hadits: string;
  kitab: string;
  nilai: string;
  dicatatOleh: string;
}

export interface Santri {
  id: number;

  // Data Pribadi
  nama: string;
  nis: string;
  nisn: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  status: string;

  // Kelas & Asrama
  kelas: string;
  asrama: string;

  // Data Ayah
  namaAyah: string;
  pekerjaanAyah: string;
  noHpAyah: string;

  // Data Ibu
  namaIbu: string;
  pekerjaanIbu: string;
  noHpIbu: string;

  alamatWali: string;

  // Tahfidz Awal
  juzTerakhir: string;
  suratTerakhir: string;
  ayatTerakhir: string;
  nilaiTahfidz: string;

  riwayatTahfidz: RiwayatTahfidz[];
}

export type SantriInput = Omit<Santri, 'id' | 'riwayatTahfidz'>;

export interface Pegawai {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  hp: string;
  email: string;
  status: string;
  kelasDiajar: string[];
  aksesSemuaKelas: boolean;
  // '' berarti tidak dibatasi (bisa lihat santri Ikhwan & Akhwat).
  jenisKelaminDiampu: string;
}

export type PegawaiInput = Omit<Pegawai, 'id' | 'email'>;

export interface PresensiSantri {
  id: number;
  santriId: number;
  tanggal: string;
  status: StatusPresensi;
  dicatatOleh: string;
}

export interface PresensiPegawai {
  id: number;
  // null berarti presensi Yayasan sendiri (bukan pegawai biasa).
  pegawaiId: number | null;
  tanggal: string;
  status: StatusPresensi;
  dicatatPada: string | null;
  lokasiLat: number | null;
  lokasiLng: number | null;
}

export interface NilaiAkhlak {
  id: number;
  santriId: number;
  tanggal: string;
  nilai: string;
  catatan: string;
  dicatatOleh: string;
  status: StatusIzinPulang;
}

export interface Spp {
  id: number;
  santriId: number;
  periode: string;
  nominal: number;
  status: StatusLunas;
  tanggalBayar: string;
  keterangan: string;
}

export type SppInput = Omit<Spp, 'id'>;

export interface DaftarUlang {
  id: number;
  santriId: number;
  periode: string;
  nominal: number;
  status: StatusLunas;
  tanggalBayar: string;
  keterangan: string;
}

export type DaftarUlangInput = Omit<DaftarUlang, 'id'>;

export interface UangPendaftaran {
  id: number;
  santriId: number;
  nominal: number;
  status: StatusLunas;
  tanggalBayar: string;
  keterangan: string;
}

export type UangPendaftaranInput = Omit<UangPendaftaran, 'id'>;

export interface Pelanggaran {
  id: number;
  santriId: number;
  tanggal: string;
  kategori: string;
  catatan: string;
  dicatatOleh: string;
  status: StatusIzinPulang;
}

export interface Reward {
  id: number;
  santriId: number;
  tanggal: string;
  kategori: string;
  catatan: string;
  dicatatOleh: string;
}

export interface IzinPulang {
  id: number;
  santriId: number;
  tanggalKeluar: string;
  tanggalKembali: string;
  alasan: string;
  status: StatusIzinPulang;
  diajukanTanggal: string;
}

export interface Yayasan {
  id: string;
  namaYayasan: string;
  namaPenanggungJawab: string;
  jabatanPenanggungJawab: string;
  noHp: string;
  email: string;
  alamat: string;
  perkiraanJumlahSantri: string;
  sumberInformasi: string;
  paket: StatusPaket;
}

export type YayasanInput = Omit<Yayasan, 'id' | 'paket'>;

export interface TransaksiUangJajan {
  id: number;
  santriId: number;
  tanggal: string;
  jenis: JenisTransaksi;
  nominal: number;
  keterangan: string;
}

export type TransaksiUangJajanInput = Omit<
  TransaksiUangJajan,
  'id' | 'tanggal'
>;

export interface TransaksiTabungan {
  id: number;
  santriId: number;
  tanggal: string;
  jenis: JenisTransaksi;
  nominal: number;
  keterangan: string;
}

export type TransaksiTabunganInput = Omit<
  TransaksiTabungan,
  'id' | 'tanggal'
>;

export interface Donasi {
  id: number;
  tanggal: string;
  namaDonatur: string;
  jenis: string;
  nominal: number;
  keterangan: string;
}

export type DonasiInput = Omit<Donasi, 'id' | 'tanggal'>;

export interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  kelasTujuan: string[] | null;
  lampiranUrl: string | null;
  lampiranNama: string | null;
  dibuatOleh: string;
  createdAt: string;
}

export type PengumumanInput = Omit<Pengumuman, 'id' | 'createdAt'>;

export type Peran = 'yayasan' | 'pegawai' | 'wali';

export interface Profil {
  id: string;
  yayasanId: string;
  peran: Peran;
  pegawaiId: number | null;
  santriId: number | null;
}
