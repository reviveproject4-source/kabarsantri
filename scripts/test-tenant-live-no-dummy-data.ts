/**
 * TEST SUITE: TENANT LIVE CLEANUP — ZERO DUMMY / MOCK / DEMO DATA VERIFICATION
 * Specification: CLEAN TENANT LIVE — REMOVE ALL DUMMY / MOCK / DEMO DATA
 * Method: AS-IS -> TO-BE -> THEN
 */

// Setup browser globals for Node.js environment
const store: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, val: string) => { store[key] = val; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};
(global as any).window = {
  location: { search: '?mode=tenant' },
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {}
};
(global as any).document = {
  cookie: 'ks_app_mode=tenant'
};

import { 
  isTenantMode, 
  getSharedSantriList, 
  saveTenantSantri, 
  getSharedMasterKelas, 
  addNewMasterKelas,
  getSharedTahfidzSetoran,
  addSharedTahfidzSetoran,
  getSharedPengajuanList,
  getSharedDisciplineRecords,
  getSharedPermissionRequests,
  getSharedLearningSessions
} from '../src/lib/sharedDataStore';

import { 
  getAppMode, 
  getActiveTenant, 
  getActiveActor,
  NURUL_HUDA_TENANT,
  DEMO_TENANT
} from '../src/lib/sessionStore';

import { getEmployees } from '../src/lib/kepegawaianStore';
import { getRtDashboardMetrics, EMPTY_TENANT_RT_DATA } from '../src/lib/rumahTanggaStore';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
  }
}

console.log('\n================================================================');
console.log('🧪 RUNNING TENANT LIVE ZERO DUMMY DATA VERIFICATION (14 TEST CASES)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: App Mode Detection
// -----------------------------------------------------------------------------
console.log('--- Test 1 - 3: Tenant Mode & Session Identification ---');
assert(
  isTenantMode() === true,
  'Test 1: isTenantMode() returns true when ?mode=tenant is present'
);
assert(
  getAppMode() === 'tenant',
  'Test 2: getAppMode() returns "tenant" in tenant mode'
);

// -----------------------------------------------------------------------------
// TEST 3: Active Tenant Context (Nurul Huda)
// -----------------------------------------------------------------------------
const activeTenant = getActiveTenant();
assert(
  activeTenant.id === 'tenant-rabu-001' && activeTenant.name.includes('Nurul Huda'),
  'Test 3: getActiveTenant() returns Nurul Huda (tenant-rabu-001), not Al-Hikmah demo'
);

// -----------------------------------------------------------------------------
// TEST 4: Active Actor is Tenant Admin
// -----------------------------------------------------------------------------
console.log('\n--- Test 4 - 6: Actor & Master Santri Zero Dummy ---');
const activeActor = getActiveActor();
assert(
  activeActor.role_key === 'tenant_admin_nh' && activeActor.name === 'Ust. H. Fauzan Mansur, Lc.',
  'Test 4: getActiveActor() returns Tenant Admin (Ust. H. Fauzan Mansur, Lc.)'
);

// -----------------------------------------------------------------------------
// TEST 5: Zero Dummy Data on Master Santri List
// -----------------------------------------------------------------------------
const santriList = getSharedSantriList();
assert(
  Array.isArray(santriList) && santriList.length === 0,
  'Test 5: Empty tenant has 0 santri initially (zero dummy rule: no Muhammad Al-Fatih, etc.)'
);
assert(
  !santriList.some(s => s.nama.includes('Al-Fatih') || s.nama.includes('Zaki')),
  'Test 6: Absolutely no demo santri names leak into tenant live mode'
);

// -----------------------------------------------------------------------------
// TEST 7: Zero Dummy Data on Master Kelas
// -----------------------------------------------------------------------------
console.log('\n--- Test 7 - 10: Academic & Operational Store Isolation ---');
const masterKelas = getSharedMasterKelas();
assert(
  Array.isArray(masterKelas) && masterKelas.length === 0,
  'Test 7: Empty tenant has 0 master kelas (no demo classes like 7A Tahfidz Sains)'
);

// -----------------------------------------------------------------------------
// TEST 8: Zero Dummy Data on Tahfidz Setoran
// -----------------------------------------------------------------------------
const setoranList = getSharedTahfidzSetoran();
assert(
  Array.isArray(setoranList) && setoranList.length === 0,
  'Test 8: Empty tenant has 0 setoran tahfidz records'
);

// -----------------------------------------------------------------------------
// TEST 9: Zero Dummy Data on Pengajuan Dana
// -----------------------------------------------------------------------------
const pengajuanList = getSharedPengajuanList();
assert(
  Array.isArray(pengajuanList) && pengajuanList.length === 0,
  'Test 9: Empty tenant has 0 pengajuan dana (no fake kitchen / laundry requests)'
);

// -----------------------------------------------------------------------------
// TEST 10: Zero Dummy Data on Learning Sessions (KBM)
// -----------------------------------------------------------------------------
const learningSessions = getSharedLearningSessions();
assert(
  Array.isArray(learningSessions) && learningSessions.length === 0,
  'Test 10: Empty tenant has 0 learning sessions (no fake KBM schedules)'
);

// -----------------------------------------------------------------------------
// TEST 11: HRD Kepegawaian Store Isolation
// -----------------------------------------------------------------------------
console.log('\n--- Test 11 - 13: HRD & Rumah Tangga Isolation ---');
const employees = getEmployees();
assert(
  employees.length === 1 && employees[0].full_name === 'Ust. H. Fauzan Mansur, Lc.',
  'Test 11: Tenant employees store contains only the official tenant administrator (0 fake teachers)'
);

// -----------------------------------------------------------------------------
// TEST 12: Rumah Tangga Store Isolation
// -----------------------------------------------------------------------------
const rtMetrics = getRtDashboardMetrics();
assert(
  rtMetrics.total_active_requests === 0 &&
  rtMetrics.assets_under_maintenance_count === 0 &&
  rtMetrics.low_stock_items_count === 0,
  'Test 12: Empty tenant RT metrics return 0 active requests, 0 maintenance assets, 0 low stock'
);

// -----------------------------------------------------------------------------
// TEST 13: Real Data Persistence in Tenant Live Mode
// -----------------------------------------------------------------------------
console.log('\n--- Test 13 & 14: Data Creation & Demo Mode Isolation ---');
saveTenantSantri({
  nis: 'NH-2026-001',
  nama: 'Aisyah Putri Rahma',
  kelas_id: 'Rombel 1A',
  gender: 'akhwat',
  wali_nama: 'Bambang Rahma',
  wali_kontak: '081233445566',
  status: 'Aktif'
});

const updatedSantri = getSharedSantriList();
assert(
  updatedSantri.length === 1 && updatedSantri[0].nama === 'Aisyah Putri Rahma',
  'Test 13: Newly registered tenant santri persists cleanly in tenant storage'
);

// -----------------------------------------------------------------------------
// TEST 14: Demo Mode Remains Intact (Clean Separation)
// -----------------------------------------------------------------------------
(global as any).window.location.search = '?mode=demo';
(global as any).document.cookie = 'ks_app_mode=demo';
store['ks_app_mode_v2'] = 'demo';

assert(
  isTenantMode() === false,
  'Test 14: Switching to demo mode returns isTenantMode() === false with simulation available'
);

console.log('\n================================================================');
console.log(`🏁 TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
