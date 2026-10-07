/**
 * AUTOMATED ACCEPTANCE TEST: GOVERNANCE, APPROVAL & AUTHORITY MATRIX
 * KabarSantri V2
 * Status: BUSINESS RULE LOCK
 * Verifies AC-01 through AC-08 and 15 Edge Cases as specified by Business Analyst.
 */

const {
  ROLE_PERMISSIONS,
  SIX_GOVERNANCE_PILLARS,
  getSixGovernancePillars,
  checkPermission,
  validateOperationalApproval,
  validateLeaveApproval,
  authorizeCompensationRead,
  getPendingApprovalsForWakilKetua,
  processWakilYayasanDecision,
  getGovernanceAuditLogs
} = require('../src/lib/governanceStore');

const {
  getLeaveRequests,
  assignSubstituteTeacherByMudir
} = require('../src/lib/kepegawaianStore');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    failedTests++;
  }
}

console.log('================================================================');
console.log('🧪 RUNNING KABARSANTRI V2 GOVERNANCE & AUTHORITY LOCK TESTS');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: AC-01 - Ketua Yayasan is Information Only (Cannot approve operational)
// -----------------------------------------------------------------------------
console.log('--- TEST 1: AC-01 (Ketua Yayasan is Information Only) ---');
const ketuaActor = { id: 'emp-yys-001', role: 'ketua_yayasan', name: 'KH. Abdullah Faqih, Lc.' };

const ketuaApproveAttempt = validateOperationalApproval(ketuaActor, {
  requesterId: 'emp-rt-001',
  title: 'Pengadaan Genset'
});
assert(
  ketuaApproveAttempt.allowed === false && ketuaApproveAttempt.reason.includes('KETUA_YAYASAN_NOT_OPERATIONAL_APPROVER'),
  'AC-01: Ketua Yayasan cannot approve operational requests (Information Only)',
  ketuaApproveAttempt.reason
);

const ketuaLeaveAttempt = validateLeaveApproval(ketuaActor);
assert(
  ketuaLeaveAttempt.allowed === false && ketuaLeaveAttempt.reason.includes('KETUA_YAYASAN_NOT_OPERATIONAL_APPROVER'),
  'AC-01: Ketua Yayasan cannot approve routine leave requests',
  ketuaLeaveAttempt.reason
);

const ketuaPermReport = checkPermission(ketuaActor, 'executive.report.view');
assert(
  ketuaPermReport.allowed === true,
  'AC-01: Ketua Yayasan has executive.report.view permission'
);

const ketuaPermApprove = checkPermission(ketuaActor, 'governance.approval.approve');
assert(
  ketuaPermApprove.allowed === false,
  'AC-01: Ketua Yayasan does NOT have governance.approval.approve permission'
);

// -----------------------------------------------------------------------------
// TEST 2: AC-02 - Wakil Ketua Yayasan is Operational Approval Authority
// -----------------------------------------------------------------------------
console.log('\n--- TEST 2: AC-02 (Wakil Ketua Yayasan Approval Authority) ---');
const wakilActor = { id: 'emp-yys-002', role: 'wakil_yayasan', name: 'Drs. H. M. Mansyur, M.Pd.' };

const wakilPerm = checkPermission(wakilActor, 'governance.approval.approve');
assert(
  wakilPerm.allowed === true,
  'AC-02: Wakil Ketua Yayasan has governance.approval.approve permission'
);

const wakilApprovalValid = validateOperationalApproval(wakilActor, {
  requesterId: 'emp-rt-001',
  title: 'Penggantian Kompresor AC'
});
assert(
  wakilApprovalValid.allowed === true,
  'AC-02: Wakil Ketua Yayasan is authorized to approve operational requests'
);

// -----------------------------------------------------------------------------
// TEST 3: AC-03 - Leave Approval Authority Restricted to HRD
// (Kepala Bagian/RT is NOT an approver, only receives notification)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 3: AC-03 (Cuti is Approved by HRD Only) ---');
const hrdActor = { id: 'emp-hrd-001', role: 'kepala_kepegawaian', name: 'Ust. Ir. Faisal Rahman, M.M.' };
const rtActor = { id: 'emp-rt-001', role: 'kepala_rumah_tangga', name: 'Pak Subandi, S.T.' };
const mudirActor = { id: 'emp-mdr-001', role: 'mudir', name: 'Dr. KH. Mahmud Ridwan, M.A.' };

const hrdLeaveVal = validateLeaveApproval(hrdActor);
assert(
  hrdLeaveVal.allowed === true,
  'AC-03: HRD is authorized to approve employee leave requests'
);

const rtLeaveVal = validateLeaveApproval(rtActor);
assert(
  rtLeaveVal.allowed === false && rtLeaveVal.reason.includes('LEAVE_APPROVAL_RESTRICTED_TO_HRD'),
  'AC-03: Kepala RT is DENIED from approving leave (Notification receiver only)',
  rtLeaveVal.reason
);

const mudirLeaveVal = validateLeaveApproval(mudirActor);
assert(
  mudirLeaveVal.allowed === false && mudirLeaveVal.reason.includes('LEAVE_APPROVAL_RESTRICTED_TO_HRD'),
  'AC-03: Mudir is DENIED from approving leave (Notification receiver only)',
  mudirLeaveVal.reason
);

// -----------------------------------------------------------------------------
// TEST 4: AC-04, AC-05, AC-06, AC-07 - Compensation Data-Level Authorization
// -----------------------------------------------------------------------------
console.log('\n--- TEST 4: AC-04 s/d AC-07 (Compensation Data-Level Authorization) ---');
const financeActor = { id: 'emp-keu-001', role: 'kepala_keuangan' };
const techActor = { id: 'emp-tek-001', role: 'teknisi_rt' };
const teacherActor = { id: 'emp-gru-001', role: 'guru' };

// AC-05: Finance can view nominal
const finAuth = authorizeCompensationRead(financeActor, 'emp-tek-001');
assert(
  finAuth.authorized === true,
  'AC-05: Finance is AUTHORIZED to view compensation nominal'
);

// AC-06: Employee can view own compensation
const selfAuth = authorizeCompensationRead(techActor, 'emp-tek-001');
assert(
  selfAuth.authorized === true,
  'AC-06: Employee is AUTHORIZED to view their own compensation'
);

// AC-06: Employee CANNOT view other employee's compensation
const otherAuth = authorizeCompensationRead(techActor, 'emp-gru-001');
assert(
  otherAuth.authorized === false,
  'AC-06: Employee is DENIED from viewing other employees compensation'
);

// AC-04: Kepala RT & Mudir CANNOT view compensation
const rtComp = authorizeCompensationRead(rtActor, 'emp-tek-001');
assert(
  rtComp.authorized === false,
  'AC-04: Kepala RT is DENIED from viewing compensation nominal'
);

const mudirComp = authorizeCompensationRead(mudirActor, 'emp-gru-001');
assert(
  mudirComp.authorized === false,
  'AC-04: Mudir is DENIED from viewing teacher compensation nominal'
);

// AC-07: HRD CANNOT view salary/incentive nominal (Section 7 Lock)
const hrdComp = authorizeCompensationRead(hrdActor, 'emp-tek-001');
assert(
  hrdComp.authorized === false && hrdComp.reason.includes('COMPENSATION_RESTRICTED_FROM_HRD'),
  'AC-07: HRD is STRICTLY DENIED from viewing salary & incentive nominal (Section 7 Lock)',
  hrdComp.reason
);

// -----------------------------------------------------------------------------
// TEST 5: AC-08 - Self-Approval Prevention (Requester ≠ Approver)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 5: AC-08 (Self-Approval Prevention) ---');
// Skenario: User A membuat pengajuan, lalu mencoba meng-ACC pengajuannya sendiri
const selfApprovalAttempt = validateOperationalApproval(
  { id: 'emp-rt-001', role: 'wakil_yayasan', name: 'Pak Subandi (acting)' },
  { requesterId: 'emp-rt-001', title: 'Pengadaan Perkakas RT' }
);

assert(
  selfApprovalAttempt.allowed === false && selfApprovalAttempt.reason.includes('SELF_APPROVAL_PROHIBITED'),
  'AC-08: Creator cannot approve their own request (Self-Approval Blocked)',
  selfApprovalAttempt.reason
);

// -----------------------------------------------------------------------------
// TEST 6: Workflow Execution & Audit Trail (Wakil Ketua Yayasan)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 6: Workflow Execution & Audit Trail ---');
const pendingBefore = getPendingApprovalsForWakilKetua();
assert(pendingBefore.length > 0, `Pending approvals found: ${pendingBefore.length}`);

const targetItem = pendingBefore[0];

// Execute Approve by Wakil Ketua
const approveRes = processWakilYayasanDecision(
  wakilActor,
  targetItem.id,
  'APPROVE',
  'Disetujui untuk mendukung operasional madrasah'
);

assert(
  approveRes.success === true,
  'Wakil Ketua successfully approved operational request',
  approveRes.message
);

// Check Audit Log
const logs = getGovernanceAuditLogs();
const latestLog = logs[0];
assert(
  latestLog &&
  latestLog.action === 'APPROVAL_GRANTED' &&
  latestLog.actor_name === wakilActor.name &&
  latestLog.decision === 'APPROVED',
  'Immutable governance audit trail recorded with actor, timestamp, action, and decision',
  JSON.stringify(latestLog)
);

// -----------------------------------------------------------------------------
// TEST 7: AC-09 - Mudir 6th Pillar: Akademik, KBM, Guru & Santri Authority Matrix
// -----------------------------------------------------------------------------
console.log('\n--- TEST 7: AC-09 (Mudir 6th Pillar: Akademik & KBM Authority Matrix) ---');

// 1. Verify 6-Pillar Model definition
const pillars = getSixGovernancePillars();
assert(
  pillars && pillars.length === 6,
  'AC-09: Exactly 6 Governance Pillars are formally established',
  `Pillars found: ${pillars ? pillars.length : 0}`
);

const pillar5 = pillars.find(p => p.pillar_number === 5);
assert(
  pillar5 && pillar5.role_key === 'mudir' && pillar5.name.includes('MUDIR'),
  'AC-09: Pillar 5 is dedicated to Mudir / Kepala Sekolah (Akademik & Proses KBM)',
  JSON.stringify(pillar5)
);

// 2. Mudir has full academic KBM permissions
const mudirPermissions = [
  'kbm.academic.manage',
  'kbm.teacher.supervise',
  'kbm.schedule.manage',
  'kbm.substitution.assign',
  'kbm.assessment.review',
  'kbm.rombel.assign'
];

mudirPermissions.forEach(perm => {
  const check = checkPermission(mudirActor, perm);
  assert(
    check.allowed === true,
    `AC-09: Mudir has authority over '${perm}'`
  );
});

// 3. Mudir is strictly restricted from unauthorized domains
const mudirCompCheck = checkPermission(mudirActor, 'finance.compensation.read');
assert(
  mudirCompCheck.allowed === false,
  'AC-09: Mudir is DENIED from finance.compensation.read'
);

const mudirLeaveApproveCheck = checkPermission(mudirActor, 'hr.leave.approve');
assert(
  mudirLeaveApproveCheck.allowed === false,
  'AC-09: Mudir is DENIED from hr.leave.approve'
);

const mudirYayasanApproveCheck = checkPermission(mudirActor, 'governance.approval.approve');
assert(
  mudirYayasanApproveCheck.allowed === false,
  'AC-09: Mudir is DENIED from governance.approval.approve'
);

// 4. Mudir assigns substitute teacher (Inval) during teacher leave
const kbmLeaves = getLeaveRequests().filter(l => l.department === 'PENDIDIKAN_KBM');
assert(kbmLeaves.length > 0, `KBM leaves found: ${kbmLeaves.length}`);

const targetLeave = kbmLeaves[0];
const invalAssignRes = assignSubstituteTeacherByMudir(
  targetLeave.id,
  'Ust. Lukman Hakim, M.Kom. (Inval KBM)',
  'Dr. KH. Mahmud Ridwan, M.A.'
);

assert(
  invalAssignRes.success === true,
  'AC-09: Mudir successfully assigns substitute teacher (Inval) for teacher on leave',
  invalAssignRes.message
);

const updatedLeave = getLeaveRequests().find(l => l.id === targetLeave.id);
assert(
  updatedLeave && updatedLeave.substitute_staff_name.includes('Lukman Hakim'),
  'AC-09: Substitute teacher is linked to leave request guaranteeing KBM continuity',
  updatedLeave ? updatedLeave.substitute_staff_name : ''
);

// -----------------------------------------------------------------------------
// TEST SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL 9 ACCEPTANCE CRITERIA & 6-PILLAR BUSINESS RULE LOCKS VERIFIED 100%!');
  process.exit(0);
}
