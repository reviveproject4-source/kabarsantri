/**
 * Kesantrian, Tahfidz, Presensi, Perizinan, & Disiplin Types (Fase 3)
 */

export type PresensiStatus = 'hadir' | 'izin' | 'sakit' | 'alpa' | 'terlambat' | 'tugas_pondok';
export type TahfidzJenisSetoran = 'ziyadah' | 'murajaah_harian' | 'murajaah_akbar' | 'tasmi_sekali_duduk';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type GatePassStatus = 
  | 'draft' 
  | 'waiting_musyrif' 
  | 'waiting_kesantrian' 
  | 'active_gatepass' 
  | 'out_of_campus' 
  | 'completed_ontime' 
  | 'completed_late' 
  | 'cancelled';
export type RawatStatus = 'kamar_santri' | 'ruang_isolasi_poskestren' | 'rujukan_puskesmas' | 'rawat_inap_rs' | 'sembuh';

export interface PresensiSesi {
  id: string;
  tenant_id: string;
  kode_sesi: string;
  nama_sesi: string;
  kategori: 'asrama_ibadah' | 'kbm_formal' | 'kegiatan_ekstrakurikuler';
  jam_mulai: string;
  jam_selesai: string;
}

export interface PresensiSantriLog {
  id: string;
  tenant_id: string;
  santri_id: string;
  sesi_id: string;
  tanggal: string;
  status: PresensiStatus;
  kamar_id?: string;
  kelas_id?: string;
  catatan?: string;
}

export interface TahfidzSetoranLog {
  id: string;
  tenant_id: string;
  santri_id: string;
  halaqah_id?: string;
  penyimak_pegawai_id: string;
  jenis_setoran: TahfidzJenisSetoran;
  juz: number;
  surah_awal: number;
  ayat_awal: number;
  surah_akhir: number;
  ayat_akhir: number;
  skor_kelancaran?: number;
  skor_tajwid?: number;
  skor_makhraj?: number;
  is_lulus: boolean;
  catatan_musyrif?: string;
  tanggal_setoran: string;
}

export interface KesantrianKesehatan {
  id: string;
  tenant_id: string;
  santri_id: string;
  tanggal_mulai_sakit: string;
  keluhan_gejala: string;
  diagnosa?: string;
  terapi_obat?: string;
  status_rawat: RawatStatus;
  is_notif_wali_sent: boolean;
  tanggal_sembuh?: string;
}

export interface KesantrianKunjunganWali {
  id: string;
  tenant_id: string;
  santri_id: string;
  wali_id?: string;
  nama_pengunjung: string;
  hubungan_dengan_santri: string;
  is_terverifikasi_mahrom: boolean;
  tanggal_kunjungan_rencana: string;
  waktu_check_in_pos?: string;
  waktu_check_out_pos?: string;
  status: ApprovalStatus;
}

export type PermissionLifecycleStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'GATE_PASS'
  | 'CHECKED_OUT'
  | 'SANTRI_OUTSIDE'
  | 'RETURNED'
  | 'OVERDUE'
  | 'CASE_REVIEW'
  | 'EXCUSED'
  | 'VIOLATION';

export interface GateMovementRecord {
  id: string;
  movement_type: 'CHECK_OUT' | 'CHECK_IN';
  timestamp: string;
  officer_name: string;
  gate_location: string;
  companion_name?: string;
  companion_phone?: string;
  condition_notes?: string;
  late_minutes?: number;
}

export interface CaseReviewRecord {
  id: string;
  reviewed_at: string;
  reviewer_name: string;
  reviewer_role: string;
  category: 'KENDARAAN_MOGOK_MACET' | 'DARURAT_MEDIS_KELUARGA' | 'CUACA_BENCANA' | 'KELALAIAN_SANTRI' | 'LAINNYA';
  explanation: string;
  supporting_evidence?: string;
  decision: 'EXCUSED' | 'VIOLATION';
  decision_rationale: string;
  discipline_points?: number;
  sanction_action?: string;
  linked_discipline_id?: string;
}

export interface AuditTrailRecord {
  id: string;
  timestamp: string;
  action: string;
  actor_name: string;
  actor_role: string;
  details: string;
}

export interface PerizinanSantri {
  id: string;
  tenant_id: string;
  santri_id: string;
  wali_id?: string;
  jenis_izin: string;
  alasan: string;
  rencana_keluar: string;
  rencana_kembali: string;
  musyrif_approval: ApprovalStatus;
  kesantrian_approval: ApprovalStatus;
  status_gatepass: GatePassStatus | PermissionLifecycleStatus;
  qr_gate_pass?: string;
  aktual_keluar?: string;
  aktual_kembali?: string;
  selisih_menit_keterlambatan: number;
  gate_movements?: GateMovementRecord[];
  case_review?: CaseReviewRecord;
  audit_trail?: AuditTrailRecord[];
}

export interface SantriPoinLog {
  id: string;
  tenant_id: string;
  santri_id: string;
  kategori_id: string;
  poin: number;
  keterangan_kejadian: string;
  tanggal_kejadian: string;
  tindakan_tarbiyah?: string;
  bukti_foto_url?: string;
  is_sanksi_selesai: boolean;
  pencatat_pegawai_id: string;
}
