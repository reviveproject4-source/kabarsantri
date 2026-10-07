/**
 * Core Type Definitions for KabarSantri ERP v2.0
 */

export type TenantType = 'production' | 'demo' | 'sandbox';
export type UserStatus = 'aktif' | 'nonaktif' | 'terkunci';
export type SantriStatus = 'aktif' | 'mutasi' | 'alumni' | 'dikeluarkan';
export type WaliHubungan = 'ayah' | 'ibu' | 'wali';
export type TransaksiTipe = 'kredit' | 'debet';
export type TagihanStatus = 'unpaid' | 'partial' | 'paid' | 'cancelled';

export interface Tenant {
  id: string;
  nama_yayasan: string;
  subdomain: string;
  custom_domain?: string | null;
  type: TenantType;
  feature_flags: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string;
  nama_lengkap: string;
  email?: string | null;
  no_hp?: string | null;
  avatar_url?: string | null;
  status: UserStatus;
}

export interface Jabatan {
  id: string;
  tenant_id: string;
  nama_jabatan: string;
  slug: 
    | 'yayasan' 
    | 'ketua_yayasan'
    | 'wakil_yayasan'
    | 'kepala_kepegawaian'
    | 'kepala_keuangan'
    | 'kepala_rumah_tangga'
    | 'kepala_kesantrian'
    | 'mudir' 
    | 'guru' 
    | 'kesantrian' 
    | 'musyrif' 
    | 'keuangan' 
    | 'teknisi_rt'
    | 'satpam_rt'
    | 'koki_rt'
    | 'laundry_rt'
    | 'admin';
  permissions: string[];
}

export interface Pegawai {
  id: string;
  tenant_id: string;
  profile_id: string;
  nip?: string | null;
  nik?: string | null;
  status: UserStatus;
  profile?: Profile;
  jabatan_list?: Jabatan[];
}

export interface UnitPendidikan {
  id: string;
  tenant_id: string;
  nama_unit: string;
  jenjang: string;
  is_active: boolean;
}

export interface Santri {
  id: string;
  tenant_id: string;
  unit_id: string;
  nis: string;
  nisn?: string | null;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir?: string | null;
  tanggal_lahir: string;
  status: SantriStatus;
  created_at: string;
  unit?: UnitPendidikan;
}

export interface Wali {
  id: string;
  tenant_id: string;
  nama_lengkap: string;
  no_whatsapp: string;
  email?: string | null;
  alamat?: string | null;
  has_pin: boolean;
  status: UserStatus;
}

export interface WaliSantriRelasi {
  id: string;
  tenant_id: string;
  wali_id: string;
  santri_id: string;
  hubungan: WaliHubungan;
  is_primary: boolean;
  santri?: Santri;
  wali?: Wali;
}

export interface Kelas {
  id: string;
  tenant_id: string;
  unit_id: string;
  tahun_ajaran_id: string;
  nama_kelas: string;
  tingkat: number;
  wali_kelas_id?: string | null;
  is_active: boolean;
}

export interface SantriKelasAssignment {
  id: string;
  tenant_id: string;
  santri_id: string;
  kelas_id: string;
  tahun_ajaran_id: string;
  is_active: boolean;
}

export interface TagihanSPP {
  id: string;
  tenant_id: string;
  santri_id: string;
  tahun_ajaran_id: string;
  bulan: number;
  tahun: number;
  nominal: number;
  nominal_terbayar: number;
  status: TagihanStatus;
  tanggal_jatuh_tempo: string;
}

export interface TabunganSantri {
  id: string;
  tenant_id: string;
  santri_id: string;
  nomor_rekening: string;
  saldo: number;
  is_active: boolean;
}

export interface TabunganTransaksi {
  id: string;
  tenant_id: string;
  tabungan_id: string;
  tipe: TransaksiTipe;
  nominal: number;
  saldo_akhir: number;
  keterangan: string;
  created_at: string;
}

/**
 * Uang Jajan E-Pocket Model
 * (Fitur lengkap terimplementasi di service & DB, tapi disembunyikan di UI sesuai konfigurasi)
 */
export interface UangJajanWallet {
  id: string;
  tenant_id: string;
  santri_id: string;
  saldo: number;
  limit_harian: number;
  pin_transaksi?: string | null;
  is_active: boolean;
}

export interface UangJajanTransaksi {
  id: string;
  tenant_id: string;
  wallet_id: string;
  tipe: TransaksiTipe;
  nominal: number;
  saldo_akhir: number;
  keterangan: string;
  kasir_pegawai_id?: string | null;
  created_at: string;
}

export interface LaporanRingkasanEksekutif {
  tenant_id: string;
  total_santri: number;
  total_pegawai: number;
  keuangan: {
    spp_terbayar: number;
    spp_tertunggak: number;
    total_tabungan_wadiah: number;
    total_saldo_uang_jajan: number; // Tetap dihitung di backend audit
  };
}
