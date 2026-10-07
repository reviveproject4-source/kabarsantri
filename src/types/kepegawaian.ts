/**
 * KABARSANTRI V2 — DOMAIN TYPES: KEPEGAWAIAN (HRD) & EMPLOYEE GOVERNANCE
 * Single Source of Truth for Employee Lifecycle, Contracts, Attendance,
 * Leave Requests, Disciplinary Cases, Performance Appraisals, and Offboarding Clearance.
 */

export type EmployeeLifecycleStatus =
  | 'CANDIDATE'
  | 'ONBOARDING'
  | 'PROBATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'NOTICE_PERIOD'
  | 'OFFBOARDING_IN_PROGRESS'
  | 'OFFBOARDED'
  | 'ARCHIVED';

export type EmploymentType =
  | 'TETAP'          // Pegawai Tetap Yayasan
  | 'KONTRAK'        // PKWT (Perjanjian Kerja Waktu Tertentu)
  | 'HONORER'        // Guru/Musyrif Honorer Per Jam/Sesi
  | 'MAGANG'         // Guru/Staf Pengabdian / Magang
  | 'OUTSOURCING';    // Tenaga Alih Daya (Keamanan/Kebersihan Luar)

export type DepartmentUnit =
  | 'YAYASAN'        // Dewan Pembina & Pengurus Yayasan
  | 'KEPEGAWAIAN'    // HRD & People Governance
  | 'KEUANGAN'       // Bendahara & Akuntansi
  | 'PENDIDIKAN_KBM' // Madrasah / Sekolah / Akademik Formal
  | 'KESANTRIAN'     // Pengasuhan Santri & Asrama
  | 'RUMAH_TANGGA'   // Sarana Prasarana, Teknisi, Dapur, Logistik
  | 'IT_SISTEM';     // Pengelola Teknologi Informasi

export interface EmploymentContract {
  id: string;
  employee_id: string;
  contract_number: string;
  type: EmploymentType;
  start_date: string;
  end_date?: string | null; // null if TETAP
  basic_salary: number;      // STRICTLY CONFIDENTIAL: Hanya Keuangan, HRD, dan ybs
  allowances: {
    title: string;
    amount: number;
  }[];
  document_url?: string;
  is_active: boolean;
  notes?: string;
}

export interface PositionHistory {
  id: string;
  employee_id: string;
  department: DepartmentUnit;
  job_title: string;
  role_slug: string;
  supervisor_id?: string;
  supervisor_name?: string;
  start_date: string;
  end_date?: string;
  sk_number?: string;
  reason: 'INITIAL_APPOINTMENT' | 'PROMOTION' | 'LATERAL_MUTATION' | 'DEMOTION';
}

export interface Employee {
  id: string;                         // Unique System UUID (BR-HRD-001)
  tenant_id: string;
  nip: string;                        // Nomor Induk Pegawai Yayasan (Unique)
  nik?: string;                       // NIK KTP
  full_name: string;
  email: string;
  phone_number: string;
  gender: 'L' | 'P';
  date_of_birth: string;
  join_date: string;
  lifecycle_status: EmployeeLifecycleStatus; // State Machine
  current_department: DepartmentUnit;
  current_position: string;
  current_role_slug: string;
  supervisor_id?: string;             // Direct Superior / Reporting Line (BR-HRD-004)
  supervisor_name?: string;
  job_description: string[];          // List of key responsibilities (BR-HRD-005)
  user_account_id?: string | null;    // Linked User Authentication Account (BR-HRD-003)
  user_account_active: boolean;       // System access indicator
  leave_allowance_annual: number;     // Jatah cuti tahunan (default 12 hari)
  leave_balance: number;              // Sisa cuti aktif
  position_history: PositionHistory[];
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

// ============================================================================
// CUTI / LEAVE
// ============================================================================

export type LeaveStatus =
  | 'SUBMITTED'
  | 'APPROVED_BY_HRD'                 // Business Rule: acc HRD
  | 'REJECTED_BY_HRD'
  | 'ACTIVE_LEAVE'
  | 'COMPLETED'
  | 'CANCELLED';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_nip: string;
  department: DepartmentUnit;
  supervisor_id: string;
  supervisor_name: string;
  leave_type: 'TAHUNAN' | 'SAKIT' | 'MELAHIRKAN' | 'UMRAH_HAJI' | 'KEMALANGAN' | 'LAINNYA';
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  substitute_staff_name?: string;
  attachment_url?: string;
  status: LeaveStatus;
  hrd_approver_id?: string;
  hrd_approver_name?: string;
  hrd_approval_date?: string;
  hrd_notes?: string;
  operational_notified: boolean;      // Info / Notif terkirim ke atasan (Kepala RT/Mudir)
  operational_notified_at?: string;
  created_at: string;
}

// ============================================================================
// DISIPLIN & SANKSI / DISCIPLINARY CASES
// ============================================================================

export type SanctionLevel =
  | 'TEGURAN_LISAN'
  | 'TEGURAN_TERTULIS'
  | 'SP1'
  | 'SP2'
  | 'SP3'
  | 'SKORSING'
  | 'PEMBERHENTIAN_TIDAK_HORMAT';

export type DisciplineCaseStatus =
  | 'LAPORAN_MASUK'
  | 'INVESTIGASI_HRD'
  | 'SIDANG_ETIK'
  | 'SANKSI_DITERBITKAN'
  | 'DITOLAK_TIDAK_TERBUKTI'
  | 'DALAM_BANDING'
  | 'KASUS_SELESAI';

export interface DisciplinaryCase {
  id: string;
  case_number: string;
  employee_id: string;
  employee_name: string;
  employee_nip: string;
  department: DepartmentUnit;
  reporter_name: string;
  incident_date: string;
  incident_category: 'PRESENSI_ALPA' | 'PELANGGARAN_KODE_ETIK' | 'SOP_OPERASIONAL' | 'INTEGRITAS' | 'LAINNYA';
  description: string;
  evidence_urls: string[];
  status: DisciplineCaseStatus;
  sanction_level?: SanctionLevel;
  sanction_expiry_date?: string;
  berita_acara_url?: string;
  handled_by_hrd_id?: string;
  handled_by_hrd_name?: string;
  wakil_ketua_approval?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// KINERJA BERBASIS EVIDENCE / PERFORMANCE EVALUATION
// ============================================================================

export type PerformanceGrade = 'A_SANGAT_BAIK' | 'B_BAIK' | 'C_CUKUP' | 'D_KURANG';

export interface PerformanceEvaluation {
  id: string;
  period_name: string;                // e.g. "Semester Ganjil 2025/2026"
  employee_id: string;
  employee_name: string;
  department: DepartmentUnit;
  supervisor_id: string;
  supervisor_name: string;
  attendance_score: number;           // 0 - 100
  task_execution_score: number;       // 0 - 100
  attitude_score: number;             // 0 - 100
  total_score: number;                // 0 - 100
  final_grade: PerformanceGrade;
  mandatory_evidence_url: string;     // BR-HRD-006: Wajib ada link bukti (Log KBM / SLA Tiket RT)
  evidence_description: string;
  supervisor_feedback: string;
  hrd_calibrated: boolean;
  hrd_calibration_notes?: string;
  created_at: string;
}

// ============================================================================
// OFFBOARDING & 4-PINTU CLEARANCE
// ============================================================================

export interface OffboardingClearance {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_nip: string;
  department: DepartmentUnit;
  resignation_reason: 'RESIGNATION' | 'CONTRACT_EXPIRED' | 'RETIREMENT' | 'TERMINATION';
  effective_end_date: string;
  
  // Pintu 1: Rumah Tangga (Pengembalian Aset, Kunci, Fasilitas)
  clearance_rt_completed: boolean;
  clearance_rt_officer?: string;
  clearance_rt_notes?: string;
  clearance_rt_date?: string;

  // Pintu 2: Keuangan (Bebas Kasbon, Pinjaman Koperasi, Pertanggungjawaban Petty Cash)
  clearance_finance_completed: boolean;
  clearance_finance_officer?: string;
  clearance_finance_notes?: string;
  clearance_finance_date?: string;

  // Pintu 3: HRD (Exit Interview, Dokumen Administrasi)
  clearance_hrd_completed: boolean;
  clearance_hrd_officer?: string;
  clearance_hrd_notes?: string;
  clearance_hrd_date?: string;

  // Pintu 4: IT & Sistem (Pencabutan Akses Login & Akun)
  clearance_it_completed: boolean;
  clearance_it_officer?: string;
  clearance_it_notes?: string;
  clearance_it_date?: string;

  all_cleared: boolean;
  final_offboarded_date?: string;
  created_at: string;
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export interface HrAuditEntry {
  id: string;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  action: 
    | 'EMPLOYEE_CREATED'
    | 'CONTRACT_REGISTERED'
    | 'LEAVE_SUBMITTED'
    | 'LEAVE_APPROVED_HRD'
    | 'LEAVE_REJECTED_HRD'
    | 'OPERATIONAL_NOTIFIED'
    | 'DISCIPLINE_REPORTED'
    | 'SANCTION_ISSUED'
    | 'PERFORMANCE_SUBMITTED'
    | 'MUTATION_EXECUTED'
    | 'CLEARANCE_STEP_SIGNED'
    | 'OFFBOARDING_COMPLETED'
    | 'ACCESS_REVOKED';
  details: string;
}

// ============================================================================
// HR DASHBOARD METRICS
// ============================================================================

export interface HrDashboardMetrics {
  total_employees: number;
  active_employees: number;
  on_leave_today: number;
  suspended_employees: number;
  contracts_expiring_soon: number;
  active_disciplinary_cases: number;
  pending_leave_approvals: number;
  pending_offboarding_clearances: number;
}
