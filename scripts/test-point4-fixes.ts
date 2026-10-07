/**
 * TEST SUITE: POINT 4 FIXES VERIFICATION
 * 1. Item 4.1: Otomatisasi Inval Guru ke Sesi KBM Live
 * 2. Item 4.2: Pembersihan Residu MENUNGGU_KETUA_YAYASAN ke MENUNGGU_WAKIL_YAYASAN
 * 3. Item 4.3: Snapshot Engine & State Backup Integrity
 */

import { 
  getSharedLearningSessions, 
  saveSharedLearningSessions,
  syncSubstituteTeacherToSessions, 
  getSharedPengajuanList 
} from '../src/lib/sharedDataStore';

import { 
  assignSubstituteTeacherByMudir, 
  getLeaveRequests 
} from '../src/lib/kepegawaianStore';

import { 
  exportSystemState, 
  importSystemState 
} from '../src/lib/syncEngine';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failed++;
  }
}

console.log('================================================================');
console.log('🧪 RUNNING KABARSANTRI V2 POINT 4 VERIFICATION TESTS');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: ITEM 4.2 — Pembersihan Residu MENUNGGU_KETUA_YAYASAN
// -----------------------------------------------------------------------------
console.log('--- TEST 1: Item 4.2 (Status Pengajuan Dana & Governance Alignment) ---');
const pengajuanList = getSharedPengajuanList();

const hasKetuaYayasanPending = pengajuanList.some(
  (p: any) => p.status === 'MENUNGGU_KETUA_YAYASAN'
);
assert(!hasKetuaYayasanPending, 'Item 4.2: Tidak ada tiket pengajuan dana berstatus MENUNGGU_KETUA_YAYASAN');

const req3 = pengajuanList.find(p => p.id === 'req-3');
assert(
  req3 !== undefined && req3.status === 'MENUNGGU_WAKIL_YAYASAN',
  'Item 4.2: Tiket belanja besar (> 5 Jt) berstatus MENUNGGU_WAKIL_YAYASAN'
);
assert(
  req3?.level_approval.includes('Wakil Ketua Yayasan') === true,
  'Item 4.2: Level approval pengajuan belanja besar mencantumkan Wakil Ketua Yayasan'
);

// -----------------------------------------------------------------------------
// TEST 2: ITEM 4.1 — Sinkronisasi Otomatis Inval ke Jadwal KBM Live
// -----------------------------------------------------------------------------
console.log('\n--- TEST 2: Item 4.1 (Sinkronisasi Inval ke Jadwal KBM Live) ---');
const leaves = getLeaveRequests();
const fatimahLeave = leaves.find(l => l.employee_name.includes('Fatimah'));
assert(fatimahLeave !== undefined, 'Item 4.1: Data cuti Usth. Fatimah Az-Zahra ditemukan');

if (fatimahLeave) {
  const invalRes = assignSubstituteTeacherByMudir(
    fatimahLeave.id,
    'Ust. Lukman Hakim, M.Kom.',
    'Dr. KH. Mahmud Ridwan, M.A.'
  );
  assert(invalRes.success, 'Item 4.1: Mudir menugaskan Ust. Lukman Hakim sebagai Guru Pengganti (Inval)');

  const sessionsAfterInval = getSharedLearningSessions();
  const sessionTaught = sessionsAfterInval.find(
    s => s.inval_leave_id === fatimahLeave.id || s.guru_nama.includes('Lukman Hakim')
  );

  assert(sessionTaught !== undefined, 'Item 4.1: Sesi KBM guru cuti otomatis terhubung dengan penugasan Inval');
  assert(
    sessionTaught?.is_inval === true,
    'Item 4.1: Sesi KBM ditandai dengan flag is_inval = true'
  );
  assert(
    sessionTaught?.guru_nama.includes('[INVAL]') === true,
    'Item 4.1: Label guru di jadwal KBM live otomatis bertuliskan [INVAL]'
  );
  assert(
    sessionTaught?.guru_asli_nama?.includes('Fatimah') === true,
    'Item 4.1: Nama guru asli (sedang cuti) terekam di metadata sesi KBM'
  );
}

// -----------------------------------------------------------------------------
// TEST 3: ITEM 4.3 — Arsitektur Snapshot Multi-Device Sync Engine
// -----------------------------------------------------------------------------
console.log('\n--- TEST 3: Item 4.3 (Arsitektur Snapshot & Multi-Device Sync Engine) ---');
const snapshot = exportSystemState();
assert(snapshot.version === '2.0.0', 'Item 4.3: Snapshot terbit dengan version 2.0.0');
assert(snapshot.tenant_id === 'tenant-pesantren-001', 'Item 4.3: Tenant ID snapshot terisolasi per pesantren');
assert(snapshot.exported_at.length > 0, 'Item 4.3: Timestamp export snapshot valid');

const importRes = importSystemState(JSON.stringify(snapshot));
assert(importRes.success, 'Item 4.3: Snapshot JSON berhasil diimpor kembali dengan validitas 100%');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================');

if (failed === 0) {
  console.log('🎉 ALL POINT 4 SPECIFICATIONS VERIFIED 100% GREEN!\n');
} else {
  process.exit(1);
}
