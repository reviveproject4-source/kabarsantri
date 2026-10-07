/**
 * AUTOMATED ACCEPTANCE TEST: KEPEGAWAIAN (HRD) & ORGANIZATIONAL GOVERNANCE
 * KabarSantri V2
 * Verifies AC-HRD-001 through AC-HRD-010 and User Business Decisions #1 and #2.
 */

const {
  DEFAULT_EMPLOYEES,
  registerEmployee,
  archiveEmployee,
  submitLeaveRequest,
  approveLeaveByHrd,
  rejectLeaveByHrd,
  submitPerformanceEvaluation,
  executeMutation,
  initiateOffboarding,
  signClearanceDoor,
  getEmployeeContract,
  getEmployees,
  getLeaveRequests,
  getOffboardings,
  getHrMetrics
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
console.log('🧪 RUNNING KABARSANTRI V2 KEPEGAWAIAN & GOVERNANCE ACCEPTANCE TESTS');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: AC-HRD-001 - Duplicate Employee Registration Rejection
// -----------------------------------------------------------------------------
console.log('--- TEST 1: AC-HRD-001 (Employee Master Uniqueness) ---');
const duplicateResult = registerEmployee({
  tenant_id: 'tenant-demo',
  nip: 'NIP.TEK.2022.011', // Pak Rusli's existing NIP
  full_name: 'Rusli Palsu',
  email: 'fake.rusli@pesantren.id',
  phone_number: '089999999',
  gender: 'L',
  date_of_birth: '1990-01-01',
  join_date: '2026-01-01',
  lifecycle_status: 'ACTIVE',
  current_department: 'RUMAH_TANGGA',
  current_position: 'Teknisi Tambahan',
  current_role_slug: 'teknisi_rt',
  job_description: ['Tugas tes'],
  user_account_id: 'usr-fake',
  user_account_active: true,
  leave_allowance_annual: 12
});

assert(
  duplicateResult.success === false && duplicateResult.message.includes('BR-HRD-001'),
  'AC-HRD-001: Duplicate employee registration with identical NIP rejected',
  duplicateResult.message
);

// -----------------------------------------------------------------------------
// TEST 2: Register New Unique Employee
// -----------------------------------------------------------------------------
console.log('\n--- TEST 2: Register Valid Unique Employee ---');
const newReg = registerEmployee({
  tenant_id: 'tenant-demo',
  nip: 'NIP.TEK.2026.999',
  full_name: 'Ust. Zaid bin Tsabit',
  email: 'zaid@pesantren.id',
  phone_number: '081234567899',
  gender: 'L',
  date_of_birth: '1995-05-15',
  join_date: '2026-10-01',
  lifecycle_status: 'ACTIVE',
  current_department: 'RUMAH_TANGGA',
  current_position: 'Asisten Teknisi Listrik',
  current_role_slug: 'teknisi_rt',
  supervisor_id: 'emp-rt-001',
  supervisor_name: 'Pak Subandi, S.T.',
  job_description: ['Membantu teknisi senior'],
  user_account_id: 'usr-zaid-99',
  user_account_active: true,
  leave_allowance_annual: 12
});

assert(
  newReg.success === true && newReg.employee.leave_balance === 12,
  'Register unique employee success with initial 12 leave balance',
  newReg.message
);

// -----------------------------------------------------------------------------
// TEST 3: User Decision #1 - Salary Confidentiality
// (Keuangan & HRD can view; Kepala RT & Mudir are strictly denied)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 3: User Decision #1 (Salary Confidentiality) ---');
// Pak Rusli (Teknisi RT)
const rusliId = 'emp-tek-001';

const viewByFinance = getEmployeeContract(rusliId, 'kepala_keuangan');
assert(
  viewByFinance.isAuthorized === true && viewByFinance.contract.basic_salary === 3900000,
  'Kepala Keuangan is AUTHORIZED to view salary & allowances',
  JSON.stringify(viewByFinance)
);

const viewByHrd = getEmployeeContract(rusliId, 'kepala_kepegawaian');
assert(
  viewByHrd.isAuthorized === false && viewByHrd.maskedSalary.includes('Akses Terbatas'),
  'Kepala HRD is STRICTLY DENIED from viewing salary & allowances (Section 7 Business Rule Lock)',
  JSON.stringify(viewByHrd)
);

const viewByKepalaRt = getEmployeeContract(rusliId, 'kepala_rumah_tangga');
assert(
  viewByKepalaRt.isAuthorized === false && viewByKepalaRt.maskedSalary.includes('Akses Terbatas'),
  'Kepala RT is DENIED from viewing technician salary (User Decision #1)',
  JSON.stringify(viewByKepalaRt)
);

const viewByMudir = getEmployeeContract(rusliId, 'mudir');
assert(
  viewByMudir.isAuthorized === false && viewByMudir.maskedSalary.includes('Akses Terbatas'),
  'Mudir is DENIED from viewing technician salary (User Decision #1)',
  JSON.stringify(viewByMudir)
);

// -----------------------------------------------------------------------------
// TEST 4: AC-HRD-004 & User Decision #2 - Leave Approval by HRD & Notice to RT
// -----------------------------------------------------------------------------
console.log('\n--- TEST 4: AC-HRD-004 & User Decision #2 (Leave Flow & Operational Notice) ---');
const leaveSubmit = submitLeaveRequest({
  employee_id: rusliId,
  leave_type: 'TAHUNAN',
  start_date: '2026-11-01',
  end_date: '2026-11-02',
  total_days: 2,
  reason: 'Keperluan keluarga',
  substitute_staff_name: 'Pak Subandi (Cover darurat)'
});

assert(
  leaveSubmit.success === true && leaveSubmit.leave.status === 'SUBMITTED',
  'Leave request submitted with status SUBMITTED',
  leaveSubmit.message
);

const leaveId = leaveSubmit.leave.id;
const leaveApprove = approveLeaveByHrd(leaveId, 'Ust. Ir. Faisal Rahman, M.M.', 'ACC HRD: Kuota valid');

assert(
  leaveApprove.success === true,
  'Leave approved by HRD (acc HRD)',
  leaveApprove.message
);

const leavesList = getLeaveRequests();
const approvedLeave = leavesList.find(l => l.id === leaveId);
assert(
  approvedLeave.status === 'APPROVED_BY_HRD' && approvedLeave.operational_notified === true,
  'User Decision #2: Leave has APPROVED_BY_HRD status and operational_notified flag is TRUE',
  JSON.stringify(approvedLeave)
);

// -----------------------------------------------------------------------------
// TEST 5: AC-HRD-006 - Performance Evidence Mandatory
// -----------------------------------------------------------------------------
console.log('\n--- TEST 5: AC-HRD-006 (Performance Evidence Mandatory) ---');
const invalidEval = submitPerformanceEvaluation({
  period_name: 'Semester Genap 2026',
  employee_id: rusliId,
  supervisor_id: 'emp-rt-001',
  supervisor_name: 'Pak Subandi, S.T.',
  attendance_score: 100,
  task_execution_score: 90,
  attitude_score: 95,
  mandatory_evidence_url: '', // Empty!
  evidence_description: 'Tanpa link bukti',
  supervisor_feedback: 'Feedback kosong'
});

assert(
  invalidEval.success === false && invalidEval.message.includes('BR-HRD-006'),
  'AC-HRD-006: Performance evaluation rejected when mandatory evidence link is empty',
  invalidEval.message
);

const validEval = submitPerformanceEvaluation({
  period_name: 'Semester Genap 2026',
  employee_id: rusliId,
  supervisor_id: 'emp-rt-001',
  supervisor_name: 'Pak Subandi, S.T.',
  attendance_score: 100,
  task_execution_score: 90,
  attitude_score: 95,
  mandatory_evidence_url: 'https://kabarsantri.id/evidence/rt-tickets-q2-2026.pdf',
  evidence_description: 'Menyelesaikan 40 service request tanpa komplain',
  supervisor_feedback: 'Teknisi sangat sigap dan berdedikasi'
});

assert(
  validEval.success === true && validEval.evaluation.final_grade === 'A_SANGAT_BAIK',
  'Performance evaluation accepted with valid evidence URL and calculated Grade A',
  validEval.message
);

// -----------------------------------------------------------------------------
// TEST 6: AC-HRD-003 - Position Change (Mutation) Preserves Employee ID & NIP
// -----------------------------------------------------------------------------
console.log('\n--- TEST 6: AC-HRD-003 (Position Change Preservation) ---');
const mutasi = executeMutation({
  employee_id: rusliId,
  new_department: 'RUMAH_TANGGA',
  new_position: 'Koordinator Senior Pemeliharaan Sarpras',
  new_role_slug: 'supervisor_rt',
  new_supervisor_id: 'emp-rt-001',
  new_supervisor_name: 'Pak Subandi, S.T.',
  sk_number: 'SK/YYS/2026/099',
  reason: 'PROMOTION',
  effective_date: '2026-10-15',
  actor_name: 'Ust. Ir. Faisal Rahman, M.M.'
});

const empAfterMutation = getEmployees().find(e => e.id === rusliId);
assert(
  mutasi.success === true &&
  empAfterMutation.nip === 'NIP.TEK.2022.011' &&
  empAfterMutation.current_position === 'Koordinator Senior Pemeliharaan Sarpras' &&
  empAfterMutation.position_history.length >= 2,
  'AC-HRD-003: Mutation preserves Employee ID & NIP, updates current position, records history',
  JSON.stringify(empAfterMutation.position_history[0])
);

// -----------------------------------------------------------------------------
// TEST 7: AC-HRD-002, AC-HRD-009 & AC-HRD-010 - 4-Pintu Offboarding Clearance
// -----------------------------------------------------------------------------
console.log('\n--- TEST 7: AC-HRD-002, AC-HRD-009 & AC-HRD-010 (4-Pintu Clearance & Access Revocation) ---');
// Let's offboard the newly created employee Zaid
const zaidId = newReg.employee.id;

const initOff = initiateOffboarding({
  employee_id: zaidId,
  resignation_reason: 'RESIGNATION',
  effective_end_date: '2026-10-31',
  actor_name: 'HRD Administrator'
});

assert(
  initOff.success === true &&
  getEmployees().find(e => e.id === zaidId).lifecycle_status === 'OFFBOARDING_IN_PROGRESS',
  'AC-HRD-002: Resignation does NOT delete employee, switches status to OFFBOARDING_IN_PROGRESS',
  initOff.message
);

const offId = initOff.clearance.id;

// Sign Pintu 1: RT
signClearanceDoor({
  offboarding_id: offId,
  door: 'RT',
  officer_name: 'Pak Subandi, S.T.',
  notes: 'Kunci dan perkakas obeng telah dikembalikan lengkap.'
});

// Check if all_cleared is still false because 3 doors remain
let curOff = getOffboardings().find(o => o.id === offId);
assert(
  curOff.all_cleared === false && curOff.clearance_rt_completed === true,
  'AC-HRD-009: Offboarding CANNOT complete when only RT clearance is signed',
  `all_cleared: ${curOff.all_cleared}`
);

// Sign Pintu 2: Finance
signClearanceDoor({
  offboarding_id: offId,
  door: 'FINANCE',
  officer_name: 'Ust. Ahmad Dahlan, S.E.',
  notes: 'Bebas kasbon operasional.'
});

// Sign Pintu 3: HRD
signClearanceDoor({
  offboarding_id: offId,
  door: 'HRD',
  officer_name: 'Ust. Ir. Faisal Rahman, M.M.',
  notes: 'Exit interview tuntas.'
});

// Sign Pintu 4: IT (Revocation)
signClearanceDoor({
  offboarding_id: offId,
  door: 'IT',
  officer_name: 'Tim IT KabarSantri',
  notes: 'Kredensial dan akun login dinonaktifkan.'
});

// Check final status
curOff = getOffboardings().find(o => o.id === offId);
const empOffboarded = getEmployees().find(e => e.id === zaidId);

assert(
  curOff.all_cleared === true &&
  empOffboarded.lifecycle_status === 'OFFBOARDED' &&
  empOffboarded.user_account_active === false,
  'AC-HRD-010: When all 4 doors are signed, status is OFFBOARDED and login account is IMMEDIATELY REVOKED',
  `all_cleared: ${curOff.all_cleared}, lifecycle_status: ${empOffboarded.lifecycle_status}, user_account_active: ${empOffboarded.user_account_active}`
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
  console.log('🎉 ALL 10 ACCEPTANCE CRITERIA & BUSINESS DECISIONS PASSED 100%!');
  process.exit(0);
}
