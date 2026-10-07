/**
 * KABARSANTRI V2 — GOVERNANCE, APPROVAL & AUTHORITY STORE
 * Status: BUSINESS RULE LOCK
 * Source of Truth for:
 * 1. Ketua Yayasan = INFORMATION ONLY / STRATEGIC REPORTING (Not an operational approver)
 * 2. Wakil Ketua Yayasan = OPERATIONAL APPROVAL AUTHORITY (Approval ≠ Execution)
 * 3. HRD = People Management & Leave Approval (CANNOT view nominal salary/incentives)
 * 4. Finance = Financial Transactions & Compensation Nominals (Only Finance & Employee can view)
 * 5. Kepala Bagian = Operational Work Execution (Cannot approve leave, cannot view salary)
 * 6. Segregation of Duties: Strict Self-Approval Prevention (Requester ≠ Approver)
 */

export type PermissionToken =
  | 'governance.approval.view'
  | 'governance.approval.approve'
  | 'governance.approval.reject'
  | 'governance.strategic.view'
  | 'executive.report.view'
  | 'executive.report.strategic'
  | 'controltower.view'
  | 'hr.employee.read'
  | 'hr.employee.write'
  | 'hr.leave.approve'
  | 'hr.discipline.manage'
  | 'hr.performance.calibrate'
  | 'hr.offboarding.manage'
  | 'finance.compensation.read'
  | 'finance.compensation.write'
  | 'finance.payment.execute'
  | 'finance.transaction.manage'
  | 'rt.request.create'
  | 'rt.request.assign'
  | 'rt.request.verify'
  | 'rt.inventory.manage'
  | 'kbm.academic.manage'
  | 'kbm.teacher.supervise'
  | 'kbm.schedule.manage'
  | 'kbm.substitution.assign'
  | 'kbm.assessment.review'
  | 'kbm.rombel.assign'
  | 'kesantrian.gatepass.manage'
  | 'kesantrian.discipline.manage'
  | 'staff.profile.view_self'
  | 'staff.leave.request';

export interface GovernancePillar {
  id: string;
  pillar_number: number;
  name: string;
  leader_title: string;
  role_key: string;
  scope: string;
  primary_authority: string;
  key_responsibilities: string[];
  strict_prohibitions: string[];
}

export const SIX_GOVERNANCE_PILLARS: GovernancePillar[] = [
  {
    id: 'pilar-1',
    pillar_number: 1,
    name: 'PILAR 1: KETUA YAYASAN',
    leader_title: 'Ketua Yayasan',
    role_key: 'ketua_yayasan',
    scope: 'Strategic Governance & Executive Oversight',
    primary_authority: 'INFORMATION ONLY (Strategic EIS & Consolidated Reports)',
    key_responsibilities: [
      'Menerima laporan strategis dan ringkasan eksekutif seluruh unit',
      'Memantau tren margin keuangan konsolidasian dan rasio kepatuhan',
      'Mengawasi risiko makro dan arah kebijakan jangka panjang pesantren'
    ],
    strict_prohibitions: [
      'DILARANG melakukan approval operasional harian atau tiket permohonan belanja rutin',
      'DILARANG melakukan approval permohonan cuti pegawai',
      'DILARANG melakukan assignment pekerjaan harian staf'
    ]
  },
  {
    id: 'pilar-2',
    pillar_number: 2,
    name: 'PILAR 2: WAKIL KETUA YAYASAN',
    leader_title: 'Wakil Ketua Yayasan',
    role_key: 'wakil_yayasan',
    scope: 'Operational Control Tower & Cross-Domain Oversight',
    primary_authority: 'OPERATIONAL APPROVAL (Central Decision Authority)',
    key_responsibilities: [
      'Memvalidasi dan memberikan keputusan ACC/REJECT atas permohonan belanja & operasional lintas pilar',
      'Memantau 4 radar operasional (Kepegawaian, Sarpras RT, Kesantrian/Gerbang, Keuangan)',
      'Menegakkan Segregation of Duties (BR-GOV-008 Anti-Self-Approval)'
    ],
    strict_prohibitions: [
      'DILARANG mengambil alih eksekusi teknis operasional (Approval ≠ Execution)',
      'DILARANG meng-ACC pengajuan yang diajukan oleh dirinya sendiri'
    ]
  },
  {
    id: 'pilar-3',
    pillar_number: 3,
    name: 'PILAR 3: KEPALA BAGIAN KEPEGAWAIAN (HRD)',
    leader_title: 'Kepala Bagian Kepegawaian',
    role_key: 'kepala_kepegawaian',
    scope: 'People Management & Employee Governance',
    primary_authority: 'APPROVAL CUTI & PEOPLE GOVERNANCE',
    key_responsibilities: [
      'Mengelola Employee Lifecycle (Master, Kontrak, Mutasi, Disiplin, 4-Pintu Offboarding)',
      'Otoritas tunggal approval permohonan cuti pegawai & asatidz',
      'Mengirimkan notifikasi informasi cuti ke atasan unit (Kepala RT / Mudir / Kesantrian)'
    ],
    strict_prohibitions: [
      'STRICTLY DILARANG melihat nominal gaji dan insentif pegawai (Section 7 Business Rule Lock)',
      'DILARANG mengintervensi substansi teknis KBM atau teknis sarpras'
    ]
  },
  {
    id: 'pilar-4',
    pillar_number: 4,
    name: 'PILAR 4: KEPALA BAGIAN KEUANGAN (FINANCE)',
    leader_title: 'Kepala Bagian Keuangan',
    role_key: 'keuangan',
    scope: 'Financial Ledger, Cashflow & Compensation Execution',
    primary_authority: 'KOMPENSASI & TRANSAKSI KEUANGAN',
    key_responsibilities: [
      'Mengelola buku besar, arus kas, dan eksekusi pembayaran terverifikasi',
      'Mengelola data payroll, slip gaji, dan nominal kompensasi rahasia',
      'Verifikasi bebas kasbon pada tahap offboarding'
    ],
    strict_prohibitions: [
      'DILARANG bertindak sebagai atasan operasional unit non-keuangan',
      'DILARANG mengeksekusi pembayaran tanpa approval resmi dari Wakil Ketua Yayasan'
    ]
  },
  {
    id: 'pilar-5',
    pillar_number: 5,
    name: 'PILAR 5: MUDIR / KEPALA SEKOLAH',
    leader_title: 'Mudir Pesantren / Kepala Madrasah',
    role_key: 'mudir',
    scope: 'Akademik, Proses KBM, Guru & Santri',
    primary_authority: 'AKADEMIK & PROSES KBM (Guru, Santri, Kurikulum, Jadwal & Evaluasi Belajar)',
    key_responsibilities: [
      'Memimpin dan memonitor seluruh proses KBM yang sedang berlangsung di kelas',
      'Supervisi guru (jadwal mengajar, kehadiran di kelas, pengisian jurnal silabus)',
      'Menugaskan Guru Pengganti (Inval) saat menerima notifikasi guru cuti dari HRD',
      'Memantau capaian santri (tuntas vs remedial KKM 75, rapor, hafalan tahfidz)',
      'Menetapkan rombel dan penempatan kelas santri baru'
    ],
    strict_prohibitions: [
      'STRICTLY DILARANG melihat nominal gaji dan tunjangan guru/staf (Section 7 Lock)',
      'DILARANG meng-ACC cuti pegawai (cuti adalah wewenang HRD; Mudir hanya penerima notifikasi untuk menunjuk guru pengganti)'
    ]
  },
  {
    id: 'pilar-6',
    pillar_number: 6,
    name: 'PILAR 6: KEPALA BAGIAN RUMAH TANGGA',
    leader_title: 'Kepala Bagian Rumah Tangga',
    role_key: 'kepala_rumah_tangga',
    scope: 'Operasional Fasilitas, Sarpras, Aset & Logistik',
    primary_authority: 'OPERASIONAL / EKSEKUSI (Sarpras, Dapur, Laundry, Kebersihan, Keamanan)',
    key_responsibilities: [
      'Mengelola pemeliharaan fisik gedung, AC, listrik, genset, dan fasilitas pesantren',
      'Mengkoordinasikan operasional dapur sentral santri dan unit laundry',
      'Menugaskan teknisi dan satpam untuk penyelesaian tiket service request',
      'Melakukan clearance fisik aset pesantren saat pegawai offboarding'
    ],
    strict_prohibitions: [
      'STRICTLY DILARANG melihat nominal gaji karyawan (Section 7 Lock)',
      'DILARANG meng-ACC cuti staf teknis (cuti di-ACC oleh HRD)'
    ]
  }
];

export function getSixGovernancePillars(): GovernancePillar[] {
  return SIX_GOVERNANCE_PILLARS;
}

export interface GovernanceAuditEntry {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: 'APPROVAL_GRANTED' | 'APPROVAL_REJECTED' | 'ACCESS_DENIED' | 'SOD_VIOLATION_BLOCKED';
  target_entity: string;
  target_id: string;
  decision: 'APPROVED' | 'REJECTED' | 'BLOCKED';
  reason: string;
}

export interface OperationalApprovalItem {
  id: string;
  request_number: string;
  domain: 'RUMAH_TANGGA' | 'PENDIDIKAN_KBM' | 'KESANTRIAN' | 'KEUANGAN' | 'KEPEGAWAIAN';
  requester_id: string;
  requester_name: string;
  requester_role: string;
  title: string;
  description: string;
  nominal?: number;
  evidence_url?: string;
  status: 'PENDING_WAKIL_YAYASAN' | 'APPROVED' | 'REJECTED';
  created_at: string;
  approved_by_id?: string;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
}

// ============================================================================
// ROLE PERMISSION MATRIX (SECTION 15)
// ============================================================================

export const ROLE_PERMISSIONS: Record<string, PermissionToken[]> = {
  // 1. Ketua Yayasan: INFORMATION ONLY / STRATEGIC
  ketua_yayasan: [
    'executive.report.view',
    'executive.report.strategic',
    'governance.strategic.view'
    // NO operational approvals, NO HR leave, NO finance payments!
  ],

  // 2. Wakil Ketua Yayasan: OPERATIONAL APPROVAL AUTHORITY
  wakil_yayasan: [
    'governance.approval.view',
    'governance.approval.approve',
    'governance.approval.reject',
    'controltower.view',
    'executive.report.view'
  ],

  // 3. Kepala Bagian Kepegawaian (HRD): ORANG & CUTI APPROVAL
  kepala_kepegawaian: [
    'hr.employee.read',
    'hr.employee.write',
    'hr.leave.approve',
    'hr.discipline.manage',
    'hr.performance.calibrate',
    'hr.offboarding.manage'
    // STRICTLY NO finance.compensation.read!
  ],

  // 4. Bagian Keuangan: TRANSAKSI KEUANGAN & KOMPENSASI
  kepala_keuangan: [
    'finance.compensation.read',
    'finance.compensation.write',
    'finance.payment.execute',
    'finance.transaction.manage'
  ],
  keuangan: [
    'finance.compensation.read',
    'finance.compensation.write',
    'finance.payment.execute',
    'finance.transaction.manage'
  ],

  // 5. Kepala Bagian Rumah Tangga: OPERASIONAL FASILITAS
  kepala_rumah_tangga: [
    'rt.request.create',
    'rt.request.assign',
    'rt.request.verify',
    'rt.inventory.manage'
    // NO hr.leave.approve, NO finance.compensation.read!
  ],

  // 5. Mudir (Pilar 5): PENDIDIKAN & PROSES KBM (GURU & SANTRI)
  mudir: [
    'kbm.academic.manage',
    'kbm.teacher.supervise',
    'kbm.schedule.manage',
    'kbm.substitution.assign',
    'kbm.assessment.review',
    'kbm.rombel.assign'
    // STRICTLY NO hr.leave.approve!
    // STRICTLY NO finance.compensation.read!
    // STRICTLY NO governance.approval.approve!
  ],

  // 7. Kepala Kesantrian: SANTRI & ASRAMA
  kepala_kesantrian: [
    'kesantrian.gatepass.manage',
    'kesantrian.discipline.manage'
    // NO hr.leave.approve, NO finance.compensation.read!
  ],

  // 8. Staff Operasional / Guru / Musyrif
  guru: ['staff.profile.view_self', 'staff.leave.request'],
  musyrif: ['staff.profile.view_self', 'staff.leave.request'],
  teknisi_rt: ['staff.profile.view_self', 'staff.leave.request'],
  satpam_rt: ['staff.profile.view_self', 'staff.leave.request'],
  koki_rt: ['staff.profile.view_self', 'staff.leave.request'],
  laundry_rt: ['staff.profile.view_self', 'staff.leave.request'],

  // 9. Technical Admin
  admin: [
    'governance.approval.view',
    'controltower.view',
    'hr.employee.read',
    'hr.employee.write',
    'executive.report.view'
  ]
};

// ============================================================================
// SEED OPERATIONAL APPROVAL ITEMS (FOR WAKIL KETUA YAYASAN)
// ============================================================================

export const DEFAULT_APPROVAL_ITEMS: OperationalApprovalItem[] = [
  {
    id: 'app-001',
    request_number: 'REQ-RT-202610-001',
    domain: 'RUMAH_TANGGA',
    requester_id: 'emp-rt-001',
    requester_name: 'Pak Subandi, S.T.',
    requester_role: 'kepala_rumah_tangga',
    title: 'Penggantian Kompresor AC Aula Utama & Pengadaan Sparepart Genset',
    description: 'Perbaikan darurat kompresor Daikin 2 PK aula santri sebelum agenda wisuda tahfidz pekanan.',
    nominal: 4750000,
    evidence_url: 'https://kabarsantri.id/docs/sph-ac-daikin-aula.pdf',
    status: 'PENDING_WAKIL_YAYASAN',
    created_at: '2026-10-04T09:00:00Z'
  },
  {
    id: 'app-002',
    request_number: 'REQ-MDR-202610-002',
    domain: 'PENDIDIKAN_KBM',
    requester_id: 'emp-mdr-001',
    requester_name: 'Dr. KH. Mahmud Ridwan, M.A.',
    requester_role: 'mudir',
    title: 'Pengadaan Modul Pembelajaran Kitab Kuning Semester Genap',
    description: 'Pencetakan 450 eksemplar modul Fathul Qorib dan Jurumiyah untuk santri tingkat wustha.',
    nominal: 6200000,
    evidence_url: 'https://kabarsantri.id/docs/rincian-biaya-cetak-kitab.pdf',
    status: 'PENDING_WAKIL_YAYASAN',
    created_at: '2026-10-04T10:30:00Z'
  }
];

// ============================================================================
// STORAGE HELPERS (LOCALSTORAGE + IN-MEMORY)
// ============================================================================

const GOV_STORAGE_KEY = 'ks_governance_store_v1';

let inMemoryGovState = {
  approvals: DEFAULT_APPROVAL_ITEMS,
  auditLogs: [] as GovernanceAuditEntry[]
};

function loadGovState() {
  if (typeof window === 'undefined') return inMemoryGovState;
  try {
    const raw = localStorage.getItem(GOV_STORAGE_KEY);
    if (!raw) {
      saveGovState(inMemoryGovState);
      return inMemoryGovState;
    }
    return JSON.parse(raw);
  } catch (e) {
    return inMemoryGovState;
  }
}

function saveGovState(state: typeof inMemoryGovState) {
  inMemoryGovState = state;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GOV_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }
}

// ============================================================================
// PERMISSION CHECKER AT APPLICATION LAYER (SECTION 15)
// ============================================================================

export function checkPermission(
  actor: { id: string; role: string },
  permission: PermissionToken
): { allowed: boolean; reason?: string } {
  const allowedPermissions = ROLE_PERMISSIONS[actor.role] || [];
  if (allowedPermissions.includes(permission)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `PERMISSION_DENIED: Role '${actor.role}' tidak memiliki kewenangan untuk aksi '${permission}'.`
  };
}

// ============================================================================
// SEGREGATION OF DUTIES (SOD) & OPERATIONAL APPROVAL (SECTION 4, 13, 14, 16)
// ============================================================================

/**
 * Validasi hak approval operasional (AC-01, AC-02, AC-08)
 */
export function validateOperationalApproval(
  actor: { id: string; role: string; name: string },
  request: { requesterId: string; title: string }
): { allowed: boolean; reason?: string } {
  // 1. AC-08: Self-Approval Prevention (Requester ≠ Approver)
  if (actor.id === request.requesterId) {
    return {
      allowed: false,
      reason: 'SELF_APPROVAL_PROHIBITED: Pemohon tidak boleh menyetujui pengajuannya sendiri (Segregation of Duties BR-GOV-008).'
    };
  }

  // 2. AC-01: Ketua Yayasan is Information Only (Cannot approve operational requests)
  if (actor.role === 'ketua_yayasan') {
    return {
      allowed: false,
      reason: 'KETUA_YAYASAN_NOT_OPERATIONAL_APPROVER: Ketua Yayasan bersifat Information Only / Strategic, bukan operational approver.'
    };
  }

  // 3. AC-02: Wakil Ketua Yayasan is the Operational Approval Authority
  if (actor.role === 'wakil_yayasan') {
    return { allowed: true };
  }

  // Role lain (Kepala Bagian, Mudir, Staff) bukan approver lintas divisi
  return {
    allowed: false,
    reason: `ROLE_NOT_AUTHORIZED_AS_APPROVER: Role '${actor.role}' bukan Operational Approval Authority yayasan.`
  };
}

// ============================================================================
// CUTI APPROVAL VALIDATION (SECTION 6 & 10, AC-03)
// ============================================================================

export function validateLeaveApproval(
  actor: { id: string; role: string; name: string }
): { allowed: boolean; reason?: string } {
  // AC-03: Cuti HANYA di-approve HRD. Kepala Bagian/Mudir/RT bukan approver.
  if (actor.role === 'kepala_kepegawaian') {
    return { allowed: true };
  }

  if (['kepala_rumah_tangga', 'mudir', 'kepala_kesantrian'].includes(actor.role)) {
    return {
      allowed: false,
      reason: 'LEAVE_APPROVAL_RESTRICTED_TO_HRD: Kepala Bagian / Mudir / RT bukan approver cuti. Cuti di-ACC oleh HRD, dan Kepala Bagian hanya menerima notifikasi informasi.'
    };
  }

  if (actor.role === 'ketua_yayasan') {
    return {
      allowed: false,
      reason: 'KETUA_YAYASAN_NOT_OPERATIONAL_APPROVER: Ketua Yayasan tidak menangani permohonan cuti rutin.'
    };
  }

  return {
    allowed: false,
    reason: `ROLE_NOT_AUTHORIZED_FOR_LEAVE_APPROVAL: Role '${actor.role}' tidak berwenang meng-ACC cuti.`
  };
}

// ============================================================================
// COMPENSATION DATA-LEVEL AUTHORIZATION (SECTION 7, AC-04, AC-05, AC-06, AC-07)
// ============================================================================

export function authorizeCompensationRead(
  actor: { id: string; role: string },
  targetEmployeeId: string
): { authorized: boolean; reason?: string } {
  // AC-05: Bagian Keuangan AUTHORIZED
  if (['keuangan', 'kepala_keuangan'].includes(actor.role)) {
    return { authorized: true };
  }

  // AC-06: Pegawai bersangkutan AUTHORIZED
  if (actor.id === targetEmployeeId) {
    return { authorized: true };
  }

  // AC-07: HRD DILARANG MELIHAT NOMINAL GAJI (Section 7)
  if (actor.role === 'kepala_kepegawaian') {
    return {
      authorized: false,
      reason: 'COMPENSATION_RESTRICTED_FROM_HRD: HRD mengelola administrasi pegawai, namun tidak memiliki akses terhadap nominal gaji dan insentif (Section 7 Business Rule Lock).'
    };
  }

  // AC-04: Mudir, Kepala RT, dan role lain DILARANG MELIHAT NOMINAL GAJI
  if (['mudir', 'kepala_rumah_tangga', 'kepala_kesantrian', 'guru', 'teknisi_rt', 'ketua_yayasan'].includes(actor.role)) {
    return {
      authorized: false,
      reason: 'COMPENSATION_RESTRICTED: Nominal gaji dan insentif hanya dapat diakses oleh Bagian Keuangan dan pegawai yang bersangkutan.'
    };
  }

  return {
    authorized: false,
    reason: 'COMPENSATION_RESTRICTED: Akses ditolak.'
  };
}

// ============================================================================
// WAKIL KETUA OPERATIONAL APPROVAL WORKFLOW (SECTION 4 & 13)
// ============================================================================

export function getPendingApprovalsForWakilKetua(): OperationalApprovalItem[] {
  return loadGovState().approvals.filter(a => a.status === 'PENDING_WAKIL_YAYASAN');
}

export function getAllApprovals(): OperationalApprovalItem[] {
  return loadGovState().approvals;
}

export function processWakilYayasanDecision(
  actor: { id: string; role: string; name: string },
  approvalId: string,
  decision: 'APPROVE' | 'REJECT',
  notes: string
): { success: boolean; message: string } {
  const state = loadGovState();
  const item = state.approvals.find(a => a.id === approvalId);
  if (!item) return { success: false, message: 'Berkas pengajuan tidak ditemukan.' };

  // Validate authority & SoD
  const val = validateOperationalApproval(actor, {
    requesterId: item.requester_id,
    title: item.title
  });

  if (!val.allowed) {
    // Record SoD violation or access denial attempt
    state.auditLogs.unshift({
      id: `gov-aud-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor_id: actor.id,
      actor_name: actor.name,
      actor_role: actor.role,
      action: 'SOD_VIOLATION_BLOCKED',
      target_entity: 'OperationalApprovalItem',
      target_id: approvalId,
      decision: 'BLOCKED',
      reason: val.reason || 'Ditolak sistem tata kelola'
    });
    saveGovState(state);
    return { success: false, message: val.reason || 'Aksi ditolak sistem.' };
  }

  const now = new Date().toISOString();
  if (decision === 'APPROVE') {
    item.status = 'APPROVED';
    item.approved_by_id = actor.id;
    item.approved_by_name = actor.name;
    item.approved_at = now;
  } else {
    item.status = 'REJECTED';
    item.rejection_reason = notes || 'Ditolak oleh Wakil Ketua Yayasan';
  }

  state.auditLogs.unshift({
    id: `gov-aud-${Date.now().toString(36)}`,
    timestamp: now,
    actor_id: actor.id,
    actor_name: actor.name,
    actor_role: actor.role,
    action: decision === 'APPROVE' ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED',
    target_entity: 'OperationalApprovalItem',
    target_id: approvalId,
    decision: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
    reason: notes || `Keputusan ${decision} oleh Wakil Ketua Yayasan`
  });

  saveGovState(state);
  return {
    success: true,
    message: `Pengajuan '${item.title}' berhasil di-${decision === 'APPROVE' ? 'ACC' : 'TOLAK'} oleh Wakil Ketua Yayasan.`
  };
}

export function getGovernanceAuditLogs(): GovernanceAuditEntry[] {
  return loadGovState().auditLogs;
}
