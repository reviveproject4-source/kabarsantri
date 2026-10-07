import { 
  PermissionLifecycleStatus, 
  GateMovementRecord, 
  CaseReviewRecord, 
  AuditTrailRecord,
  PerizinanSantri 
} from '../types/kesantrian';
import { 
  getSharedPermissionRequests, 
  createPermissionRequest, 
  startReviewPermission,
  verifyPermissionRequest, 
  issueGatePass,
  checkOutSantri, 
  checkInSantri,
  startCaseReview,
  submitCaseReview,
  PermissionRequest 
} from '../lib/sharedDataStore';

export interface AjukanIzinDTO {
  santri_id: string;
  nis: string;
  nama: string;
  kelas: string;
  kamar: string;
  alasan: string;
  tujuan: string;
  rencana_keluar: string;
  rencana_kembali: string;
  nama_penjemput: string;
  kontak_wali: string;
  hubungan_penjemput: string;
}

export class PerizinanService {
  /**
   * 1. Pengajuan Izin Baru (DRAFT ➔ SUBMITTED)
   */
  async ajukanIzin(dto: AjukanIzinDTO): Promise<PermissionRequest> {
    return createPermissionRequest(dto);
  }

  /**
   * 2. Mulai Pemeriksaan Dokumen (SUBMITTED ➔ UNDER_REVIEW)
   */
  async mulaiReview(izin_id: string, reviewer: string = 'Ust. Hamzah, Lc. (Musyrif)'): Promise<PermissionRequest | null> {
    return startReviewPermission(izin_id, reviewer);
  }

  /**
   * 3. Verifikasi Kebijakan Izin (UNDER_REVIEW ➔ APPROVED atau REJECTED)
   */
  async verifikasiIzin(
    izin_id: string, 
    action: 'APPROVE' | 'REJECT', 
    petugas: string = 'Ust. Rahmat, S.Pd (Kesantrian)',
    alasanTolak?: string
  ): Promise<PermissionRequest | null> {
    return verifyPermissionRequest(izin_id, action, petugas, alasanTolak);
  }

  /**
   * 4. Penerbitan Digital Gate Pass & QR Code (APPROVED ➔ GATE_PASS)
   * Catatan Bisnis: APPROVED bukan berarti santri sudah di luar kampus.
   * Gate Pass harus diterbitkan terlebih dahulu sebelum santri check-out di pos.
   */
  async terbitkanGatePass(izin_id: string, petugas: string = 'Bagian Kesantrian'): Promise<PermissionRequest | null> {
    return issueGatePass(izin_id, petugas);
  }

  /**
   * 5. Scan Check-Out di Pos Satpam (GATE_PASS ➔ CHECKED_OUT / SANTRI_OUTSIDE)
   * Mencatat pergerakan fisik gerbang (GateMovement): nama satpam, penjemput, kondisi barang.
   */
  async scanKeluarGate(
    izin_id: string, 
    movementData: {
      officer_name?: string;
      gate_location?: string;
      companion_name?: string;
      companion_phone?: string;
      condition_notes?: string;
    } = {}
  ): Promise<PermissionRequest | null> {
    return checkOutSantri(izin_id, movementData);
  }

  /**
   * 6. Scan Check-In saat Kembali ke Pesantren (SANTRI_OUTSIDE ➔ RETURNED atau OVERDUE / CASE_REVIEW)
   * JANGAN MENGANGGAP: OVERDUE = VIOLATION.
   * Jika terlambat, sistem mengalihkan status ke CASE_REVIEW untuk investigasi klarifikasi alasan.
   */
  async scanKembaliGate(
    izin_id: string,
    movementData: {
      officer_name?: string;
      gate_location?: string;
      condition_notes?: string;
    } = {}
  ): Promise<PermissionRequest | null> {
    return checkInSantri(izin_id, movementData);
  }

  /**
   * 7. Mulai Sidang Investigasi Keterlambatan (OVERDUE ➔ CASE_REVIEW)
   */
  async bukaCaseReview(izin_id: string, reviewer: string = 'Ust. Rahmat, S.Pd (Kesantrian)'): Promise<PermissionRequest | null> {
    return startCaseReview(izin_id, reviewer);
  }

  /**
   * 8. Putusan Sidang Kasus (CASE_REVIEW ➔ EXCUSED atau VIOLATION)
   * - EXCUSED: Dispensasi alasan sah (musibah teknis/keluarga), 0 poin pelanggaran.
   * - VIOLATION: Pelanggaran nyata, otomatis terhubung dan tercatat ke Modul Disiplin Pesantren.
   */
  async putuskanCaseReview(
    izin_id: string,
    review: {
      reviewer_name: string;
      reviewer_role: string;
      category: 'KENDARAAN_MOGOK_MACET' | 'DARURAT_MEDIS_KELUARGA' | 'CUACA_BENCANA' | 'KELALAIAN_SANTRI' | 'LAINNYA';
      explanation: string;
      supporting_evidence?: string;
      decision: 'EXCUSED' | 'VIOLATION';
      decision_rationale: string;
      discipline_points?: number;
      sanction_action?: string;
    }
  ): Promise<PermissionRequest | null> {
    return submitCaseReview(izin_id, review);
  }

  /**
   * Ambil seluruh data perizinan aktif
   */
  getAll(): PermissionRequest[] {
    return getSharedPermissionRequests();
  }
}

export const perizinanService = new PerizinanService();

