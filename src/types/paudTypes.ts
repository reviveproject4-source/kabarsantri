export type KategoriUsiaSpesifik = '2_tahun' | '3_tahun' | '4_tahun' | '5_tahun';
export type KategoriUsia = KategoriUsiaSpesifik | '2-3_tahun' | '4-5_tahun';

export type BulanCurriculum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type KategoriMateri = 'buah' | 'sayur' | 'kendaraan' | 'hewan' | 'bentuk_warna' | 'angka' | 'motorik_halus' | 'motorik_kasar';

export interface TenantPaud {
  id: string;
  namaSekolah: string;
  kodeYayasan: string;
  alamat?: string;
}

export interface TemaBulanan {
  bulan: BulanCurriculum;
  semester: 1 | 2;
  judulTema: string;
  deskripsi: string;
  subTemaMingguan: string[];
  ikonTema: string;
}

export interface MuridPaud {
  id: string;
  tenantId?: string;
  namaSekolah?: string;
  nama: string;
  panggilan: string;
  kategoriUsia: KategoriUsiaSpesifik;
  fotoEmoji: string;
  catatanGuru?: string;
  tanggalLahir?: string;
}

export interface SkorLogika {
  pencocokanBentuk: number; // 0-100
  mengurutkanUkuran: number; // 0-100
  menghitungBenda: number; // 0-100
  polaWarna: number; // 0-100
  klasifikasiKategori?: number; // 0-100
}

export interface SkorMotorikHalus {
  tracingGaris: number; // 0-100
  puzzleBentuk: number; // 0-100
  bubblePopSensory: number; // 0-100
  presisiPetikBuah?: number; // 0-100
}

export type StatusCapaian = 'belum_berkembang' | 'mulai_berkembang' | 'berkembang_sesuai_harapan' | 'sangat_baik';

export interface EvaluasiMotorikKasar {
  tenantId?: string;
  bulan: BulanCurriculum;
  mingguKe: number;
  aktivitasId: string;
  namaAktivitas: string;
  status: StatusCapaian;
  tanggal: string;
  catatanGuru?: string;
}

export interface RekapMuridPaud extends MuridPaud {
  skorLogika: SkorLogika;
  skorMotorikHalus: SkorMotorikHalus;
  evaluasiMotorikKasar: EvaluasiMotorikKasar[];
}

export interface KartuAktivitasKasar {
  id: string;
  bulan: BulanCurriculum;
  mingguKe: number;
  judul: string;
  kategoriUsia: KategoriUsiaSpesifik;
  kategoriMateri: KategoriMateri;
  deskripsi: string;
  instruksiGuru: string[];
  manfaat: string;
  durasiDetik: number;
  ikon: string;
  tingkatKesulitan: 'Sangat Mudah' | 'Mudah' | 'Sedang' | 'Tantangan';
  variasiGerak: string[];
}
