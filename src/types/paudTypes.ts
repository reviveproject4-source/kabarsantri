export type KategoriUsiaSpesifik = '2_tahun' | '3_tahun' | '4_tahun' | '5_tahun';
export type KategoriUsia = KategoriUsiaSpesifik | '2-3_tahun' | '4-5_tahun';

export type BulanCurriculum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type KategoriMateri = 'buah' | 'sayur' | 'kendaraan' | 'hewan' | 'bentuk_warna' | 'angka' | 'motorik_halus' | 'motorik_kasar';

export type UserRole = 'guru' | 'kepala_sekolah' | 'yayasan';

export interface UserAccount {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  tenantId: string; // Yayasan
  schoolId?: string; // Unit Sekolah
  classId?: string; // Kelas (Khusus Guru & Murid)
  assignedMuridId?: string; // Khusus Wali Murid
  inviteToken?: string; // Khusus Wali Murid & Guru
  avatarEmoji?: string;
  lastInputDate?: string; // Tanggal terakhir input asesmen (untuk Guru)
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
  tanggalLahir?: string;
  namaAyah?: string;
  namaIbu?: string;
  kontakOrangTua?: string;
  inviteTokenWali?: string; // Token undangan wali murid
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

export type HariAktif = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat';
export type DomainUtamaKurikulum = 'logika' | 'motorik_halus' | 'motorik_kasar_olahraga' | 'sosial_bahasa' | 'agama_akhlak';
export type StatusObservasiAdab = 'belum_terlihat' | 'mulai_muncul' | 'muncul_sendiri';

export interface CatatanObservasiHarian {
  id: string;
  tenantId: string;
  sekolahId: string;
  kelasId: string;
  muridId: string;
  guruId: string;
  tanggal: string;
  hari: HariAktif;
  bulan: number;
  mingguKe: number;
  domainUtama: DomainUtamaKurikulum;
  kegiatanId: string;
  kegiatanJudul?: string;
  status: StatusObservasiAdab;
  catatanGuru?: string;
  fotoUrl?: string;
  jenisPenilaian: 'otomatis' | 'manual';
}

export interface CatatanAdabMingguan {
  id: string;
  tenantId: string;
  muridId: string;
  mingguKe: number;
  status: StatusObservasiAdab;
  catatanGuru?: string;
}

export interface KegiatanHarianKurikulum {
  id: string;
  bulan: number;
  mingguKe: number;
  hari: HariAktif;
  domainUtama: DomainUtamaKurikulum;
  isOutdoor: boolean;
  pembuka: { durasi: string; aktivitas: string };
  inti: {
    durasi: string;
    judul: string;
    deskripsi: string;
    alatAlat: string[];
    instruksiGuru: string[];
  };
  penutup: { durasi: string; aktivitas: string };
  alternatif: Array<{ judul: string; deskripsi: string; alasanDigunakan: string }>;
  cadanganIndoor?: { judul: string; deskripsi: string; instruksiGuru: string[] };
  variasiUsia: { usia2_3: string; usia4: string; usia5: string };
  gameIdRef?: string;
}

export interface KebiasaanAdabMingguan {
  mingguKe: number;
  judulAdab: string;
  deskripsi: string;
  indikator: string[];
  contohSituasi: string;
}
