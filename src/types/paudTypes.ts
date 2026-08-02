export type KategoriUsiaSpesifik = '2_tahun' | '3_tahun' | '4_tahun' | '5_tahun';
export type KategoriUsia = KategoriUsiaSpesifik | '2-3_tahun' | '4-5_tahun';

export type BulanCurriculum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type HariAktif = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat';
export type StatusObservasiAdab = 'belum_terbiasa' | 'dengan_bimbingan' | 'terbiasa_mandiri' | 'muncul_sendiri' | 'mulai_muncul' | 'belum_terlihat' | string;
export type DomainUtamaKurikulum = 'agama_moral' | 'motorik' | 'kognitif' | 'bahasa' | 'sosial_emosional' | 'seni' | 'logika' | 'motorik_halus' | 'motorik_kasar_olahraga' | 'sosial_bahasa' | 'agama_akhlak' | 'gerak_sensorik' | string;
export type RentangWaktu = 'mingguan' | 'bulanan' | 'semester' | 'tahunan' | 'harian' | string;

export type KategoriMateri =
  | 'buah'
  | 'sayur'
  | 'kendaraan'
  | 'hewan'
  | 'bentuk_warna'
  | 'angka'
  | 'suku_kata'
  | 'cocok_angka'
  | 'cocok_huruf'
  | 'matematika_belasan'
  | 'tracing_huruf'
  | 'brain_gym'
  | 'motorik_halus'
  | 'motorik_kasar'
  | 'gerak_sensorik';

export type UserRole = 'guru' | 'kepala_sekolah' | 'yayasan' | 'wali_murid';

export interface UserAccount {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  tenantId: string;
  schoolId?: string;
  classId?: string;
  assignedMuridId?: string;
  inviteToken?: string;
  avatarEmoji?: string;
  lastInputDate?: string;
}

export interface TenantPaud {
  id: string;
  namaSekolah: string;
  kodeYayasan: string;
  alamat?: string;
  unitSekolahList?: Array<{ id: string; namaUnit: string; kepalaSekolah?: string }>;
}

export interface KelasPaud {
  id: string;
  schoolId: string;
  namaKelas: string;
  kategoriUsia: KategoriUsiaSpesifik;
  guruId?: string;
  guruNama?: string;
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
  schoolId?: string;
  classId?: string;
  namaSekolah?: string;
  nama: string;
  panggilan: string;
  kategoriUsia: KategoriUsiaSpesifik;
  fotoEmoji: string;
  catatanGuru?: string;
  tanggalLahir?: string; // Format YYYY-MM-DD
  inviteTokenWali?: string;
  namaAyah?: string;
  namaIbu?: string;
  kontakOrangTua?: string;
}

export interface SkorLogika {
  pencocokanBentuk: number;
  mengurutkanUkuran: number;
  menghitungBenda: number;
  polaWarna: number;
  cocokJumlahAngka?: number;
  cocokGambarHuruf?: number;
  bacaSukuKata?: number;
  matematikaBelasan?: number;
}

export interface SkorMotorikHalus {
  tracingGaris: number;
  puzzleBentuk: number;
  bubblePopSensory: number;
  tracingHuruf?: number;
  bilateralTracing2Jari?: number;
}

export type StatusCapaian = 'belum_berkembang' | 'mulai_berkembang' | 'berkembang_sesuai_harapan' | 'sangat_baik';

export interface EvaluasiMotorikKasar {
  tenantId?: string;
  schoolId?: string;
  classId?: string;
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
  otakTarget?: 'Kanan' | 'Kiri' | 'Bilateral (Kanan-Kiri)';
}

// STRUKTUR DATA PROMPT 10: GERAK & SENSORIK
export type KelompokUsiaSensorik = '2-3' | '3-4' | '4-5';
export type KategoriSensorik = 'Vestibular' | 'Proprioseptif' | 'Taktil' | 'Visual-Motor' | 'Brain Gym';
export type StatusPenilaianSensorik = 'bisa' | 'coba_lagi' | 'belum_waktunya';

export interface AktivitasSensorik {
  id: string;
  nama: string;
  kelompokUsia: KelompokUsiaSensorik;
  kategori: KategoriSensorik;
  caraMelakukan: string;
  alatDibutuhkan: string[];
  durasiDetik: number;
  bisaIndoor: boolean;
  bisaOutdoor: boolean;
  catatanKeamanan: string | null;
  ikon?: string;
}

export interface IndikatorObservasiSensorik {
  id: string;
  kelompokUsia: KelompokUsiaSensorik;
  pernyataan: string;
  aktivitasTerkait: string[];
}

export interface EvaluasiGerakSensorik {
  id: string;
  tenantId?: string;
  muridId: string;
  aktivitasId?: string;
  indikatorId?: string;
  status: StatusPenilaianSensorik;
  tanggal: string;
  catatanGuru?: string;
}

export interface NotifikasiApp {
  id: string;
  userId: string;
  judul: string;
  pesan: string;
  tanggal: string;
  dibaca: boolean;
  tipe: 'reminder' | 'info' | 'warning';
}

export interface KegiatanHarianKurikulum {
  id?: string;
  bulan?: BulanCurriculum;
  mingguKe?: number;
  hari?: HariAktif;
  judul?: string;
  deskripsi?: string;
  domainUtama?: DomainUtamaKurikulum;
  [key: string]: any;
}

export interface KebiasaanAdabMingguan {
  id?: string;
  mingguKe?: number;
  judulAdab?: string;
  deskripsi?: string;
  pilarCharacter?: string;
  indikator?: string | string[];
  [key: string]: any;
}

export interface CatatanObservasiHarian {
  id?: string;
  tenantId?: string;
  muridId?: string;
  bulan?: BulanCurriculum;
  mingguKe?: number;
  hari?: HariAktif;
  tanggal?: string;
  domainUtama?: DomainUtamaKurikulum;
  status?: StatusObservasiAdab | string;
  catatan?: string;
  catatanGuru?: string;
  kegiatanJudul?: string;
  fotoUrl?: string;
  [key: string]: any;
}

export interface CatatanAdabMingguan {
  id?: string;
  tenantId?: string;
  muridId?: string;
  mingguKe?: number;
  status?: StatusObservasiAdab | string;
  [key: string]: any;
}

export interface LaporanMingguanOtomatis {
  id?: string;
  tenantId?: string;
  kelasId?: string;
  muridId?: string;
  mingguKe?: number;
  muridTerobservasiCount?: number;
  totalMuridCount?: number;
  hariTerisiCount?: number;
  ringkasan?: string;
  statusDominanAdab?: string;
  [key: string]: any;
}
