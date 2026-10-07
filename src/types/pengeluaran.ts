/**
 * Tipe Data Pengeluaran & Approval Berjenjang
 */

export type DivisiPemohon = 'dapur' | 'laundry' | 'keamanan' | 'mudir_kbm' | 'keuangan' | 'sarpras';
export type StatusApprovalPengeluaran = 
  | 'menunggu_keuangan'
  | 'menunggu_wakil_yayasan'
  | 'disetujui'
  | 'ditolak'
  | 'dicairkan';

export interface TenantPengeluaranThresholds {
  tenant_id: string;
  max_keuangan_rumah_tangga: number; // default: 1000000 (< 1 Jt)
  max_keuangan_kbm_mudir: number;   // default: 3000000 (< 3 Jt)
  min_yayasan_approval: number;     // default: 5000000 (> 5 Jt)
  is_custom_configured: boolean;
}

export interface PengeluaranPengajuan {
  id: string;
  tenant_id: string;
  nomor_pengajuan: string;
  pemohon_pegawai_id: string;
  pemohon_nama?: string;
  divisi_pemohon: DivisiPemohon;
  judul_keperluan: string;
  deskripsi_rincian: string;
  nominal_diajukan: number;
  target_approval_level: 'keuangan_only' | 'keuangan_dan_wakil' | 'keuangan_dan_yayasan';
  status: StatusApprovalPengeluaran;
  acc_keuangan_status: 'pending' | 'approved' | 'rejected';
  acc_wakil_yayasan_status: 'none' | 'pending' | 'approved' | 'rejected';
  acc_ketua_yayasan_status: 'none' | 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface KeuanganPengeluaranManual {
  id: string;
  tenant_id: string;
  nomor_transaksi: string;
  nominal: number;
  tanggal_transaksi: string;
  penerima: string;
  keterangan: string;
  coa_beban_nama?: string;
  coa_kas_nama?: string;
}
