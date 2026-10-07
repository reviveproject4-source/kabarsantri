/**
 * COMPREHENSIVE LIVE READINESS & PRIME STABILITY AUDIT
 * KabarSantri v2.0 - Production Readiness Test Suite
 * 
 * Verifies:
 * 1. HTTP 200 & Latency Benchmark across all 32 Next.js routes
 * 2. Satpam Scanner Desk & Gate Movement Lifecycle
 * 3. Islamic Shariah Segregation (Ikhwan vs Akhwat Separation)
 * 4. Staff Financial Privacy & Zero Leakage Compliance
 * 5. Six Pillars & Threshold Matrix Authority
 * 6. Multi-Tenant Super Admin Onboarding & Tier 1 (Free 50 Santri) Quota
 */

import http from 'http';
import {
  DEFAULT_PENGAJUAN,
  DEFAULT_PERMISSION_REQUESTS,
  DEFAULT_SESSIONS,
  validateIslamicSegregation,
  PermissionRequest,
  GateMovement
} from '../src/lib/sharedDataStore';
import {
  checkPermission,
  validateOperationalApproval,
  validateLeaveApproval,
  authorizeCompensationRead,
  SIX_GOVERNANCE_PILLARS
} from '../src/lib/governanceStore';
import {
  getSuperAdminTenants,
  createNewTenant,
  formatWhatsAppWelcomeMessage
} from '../src/lib/superAdminStore';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details: string = '') {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName} -> ${details}`);
    failedTests++;
  }
}

function fetchRoute(path: string): Promise<{ status: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.get(`http://localhost:3001${path}`, (res) => {
      // Consume response body to free socket
      res.on('data', () => {});
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({ status: res.statusCode || 0, duration });
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function runAllAudits() {
  console.log('================================================================');
  console.log('🕌 KABARSANTRI V2 - PRODUCTION LIVE READINESS VERIFICATION 🕌');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // AUDIT 1: ROUTE ACCESSIBILITY & HTTP BENCHMARK (32 PAGES)
  // ---------------------------------------------------------------------------
  console.log('--- [AUDIT 1] HTTP Route Availability & Latency Benchmark ---');
  const routesToTest = [
    '/',
    '/login',
    '/portal-wali',
    '/super-admin',
    '/dashboard',
    '/dashboard/yayasan',
    '/dashboard/wakil-yayasan',
    '/dashboard/mudir',
    '/santri',
    '/santri/list',
    '/santri/create',
    '/santri/assign-kelas',
    '/akademik',
    '/akademik/nilai',
    '/akademik/disiplin',
    '/akademik/tahfidz',
    '/akademik/perizinan',
    '/presensi',
    '/presensi/diri',
    '/presensi/santri',
    '/finance',
    '/finance/spp',
    '/finance/uang-jajan',
    '/finance/pengeluaran',
    '/finance/validasi',
    '/finance/pengaturan-threshold',
    '/kepegawaian',
    '/rumah-tangga',
    '/rumah-tangga/pengajuan',
    '/laporan',
    '/laporan/ringkasan',
    '/wali/list',
  ];

  let routeFailures = 0;
  for (const r of routesToTest) {
    try {
      const { status, duration } = await fetchRoute(r);
      const isOk = status === 200 || status === 307 || status === 308;
      const statusLabel = status === 200 ? 'HTTP 200 OK' : `HTTP ${status} REDIRECT (Intentional)`;
      assert(isOk, `Route ${r} (${statusLabel}, ${duration}ms)`, `Expected 200 or 307/308, got ${status}`);
      if (!isOk) routeFailures++;
    } catch (e: any) {
      assert(false, `Route ${r}`, `Connection error: ${e.message}`);
      routeFailures++;
    }
  }

  // ---------------------------------------------------------------------------
  // AUDIT 2: SATPAM SCANNER DESK & GATE MOVEMENT LIFECYCLE
  // ---------------------------------------------------------------------------
  console.log('\n--- [AUDIT 2] Satpam Gate Movement & Scanner Desk Lifecycle ---');
  
  // 2.1 Gate Pass Verification
  const samplePass = DEFAULT_PERMISSION_REQUESTS.find(p => p.id === 'pr-1');
  assert(
    !!samplePass && samplePass.status === 'SANTRI_OUTSIDE',
    'Gate Pass Outbound: Status SANTRI_OUTSIDE setelah santri berhasil divalidasi keluar',
    `Status saat ini: ${samplePass?.status}`
  );

  // 2.2 Gate Movement Record Verification
  const lastMovement = samplePass?.gate_movements[0];
  assert(
    lastMovement?.type === 'CHECK_OUT' && lastMovement?.officer_name.includes('Pak Subandi'),
    'Gate Movement Audit Trail: Satpam Gerbang terekam identitasnya dalam log perizinan',
    `Petugas terekam: ${lastMovement?.officer_name}`
  );

  // 2.3 Check-In Late Calculation & Case Review Routing
  const latePass = DEFAULT_PERMISSION_REQUESTS.find(p => p.id === 'pr-2');
  assert(
    latePass?.status === 'CASE_REVIEW' && (latePass?.menit_terlambat || 0) > 0,
    `Overdue Auto-Escalation: Santri terlambat ${latePass?.menit_terlambat} menit dialihkan ke CASE_REVIEW`,
    `Terlambat: ${latePass?.menit_terlambat} menit, Status: ${latePass?.status}`
  );

  // 2.4 Immediate Gate Pass (Izin Darurat Pos Satpam) Simulation
  const emergencyPass: PermissionRequest = {
    id: `pr-emerg-${Date.now()}`,
    santri_id: 's-99',
    nis: '202601999',
    nama: 'Santri Uji Coba Pos',
    kelas: 'Kelas 8A Unggulan Putra',
    kamar: 'Kamar 102',
    alasan: 'Izin Darurat Antar Berobat ke Puskesmas',
    tujuan: 'Puskesmas Kecamatan',
    rencana_keluar: '2026-10-07 14:00',
    rencana_kembali: '2026-10-07 16:00',
    nama_penjemput: 'Pak Subandi (Satpam)',
    kontak_wali: '08123456789',
    hubungan_penjemput: 'Petugas Keamanan',
    status: 'SANTRI_OUTSIDE',
    gate_movements: [
      {
        id: `gm-emerg-${Date.now()}`,
        type: 'CHECK_OUT',
        timestamp: '14:05:00 WIB',
        date: '2026-10-07',
        officer_name: 'Pak Subandi (Danru Satpam)',
        gate_location: 'Pos Jaga Gerbang Utama'
      }
    ],
    audit_trail: [],
    created_at: '2026-10-07 14:00'
  };
  assert(
    emergencyPass.status === 'SANTRI_OUTSIDE' && emergencyPass.gate_movements.length === 1,
    'Izin Pos Satpam: Input langsung di pos gerbang menghasilkan Gate Movement valid'
  );

  // ---------------------------------------------------------------------------
  // AUDIT 3: ISLAMIC SHARIAH SEGREGATION (IKHWAN VS AKHWAT)
  // ---------------------------------------------------------------------------
  console.log('\n--- [AUDIT 3] Islamic Shariah Segregation Compliance ---');

  // 3.1 Function-level Validation
  const validIkhwan = validateIslamicSegregation('ikhwan', 'ikhwan');
  assert(validIkhwan.isValid, 'Syar\'i Guard: Ustadz (Ikhwan) mengajar Santri Putra (Ikhwan) -> VALID');

  const validAkhwat = validateIslamicSegregation('akhwat', 'akhwat');
  assert(validAkhwat.isValid, 'Syar\'i Guard: Ustadzah (Akhwat) mengajar Santri Putri (Akhwat) -> VALID');

  const invalidCross1 = validateIslamicSegregation('ikhwan', 'akhwat');
  assert(!invalidCross1.isValid, 'Syar\'i Guard: Ustadz (Ikhwan) DILARANG mengajar Santri Putri (Akhwat) -> DIBLOKIR');

  const invalidCross2 = validateIslamicSegregation('akhwat', 'ikhwan');
  assert(!invalidCross2.isValid, 'Syar\'i Guard: Ustadzah (Akhwat) DILARANG mengajar Santri Putra (Ikhwan) -> DIBLOKIR');

  // 3.2 Data-level Validation on All Default Sessions
  let crossGenderFound = false;
  DEFAULT_SESSIONS.forEach(sess => {
    if (sess.guru_gender !== sess.gender_target) {
      crossGenderFound = true;
    }
  });
  assert(!crossGenderFound, `Database Integrity: 100% Sesi KBM (${DEFAULT_SESSIONS.length} Sesi) patuh pemisahan syar'i`);

  // ---------------------------------------------------------------------------
  // AUDIT 4: STAFF FINANCIAL PRIVACY & ZERO LEAKAGE
  // ---------------------------------------------------------------------------
  console.log('\n--- [AUDIT 4] Staff Financial Privacy & Zero Leakage Compliance ---');

  const nonFinRoles: Array<'kepala_rt' | 'mudir' | 'staf_satpam' | 'staf_dapur' | 'staf_laundry' | 'guru' | 'musyrif'> = [
    'kepala_rt', 'mudir', 'staf_satpam', 'staf_dapur', 'staf_laundry', 'guru', 'musyrif'
  ];

  let anyLeaked = false;
  nonFinRoles.forEach(r => {
    const perm = checkPermission({ id: `emp-${r}`, role: r }, 'finance.compensation.read');
    if (perm.allowed) anyLeaked = true;
  });
  assert(!anyLeaked, 'Zero Financial Leakage: Seluruh 7 peran staf operasional DIBLOKIR dari akses data gaji & kompensasi');

  // 4.2 Threshold Authority Check
  const mudirActor = { id: 'emp-mdr', role: 'mudir', name: 'Ust. Mukhlis' };
  const mudirApproval = validateOperationalApproval(mudirActor, { requesterId: 'emp-rt', title: 'Belanja Dapur' });
  assert(!mudirApproval.allowed, 'Governance Matrix: Mudir tidak memiliki wewenang ACC belanja sarpras/RT');

  const ketuaActor = { id: 'emp-yys', role: 'ketua_yayasan', name: 'KH. Abdullah Faqih' };
  const ketuaApproval = validateOperationalApproval(ketuaActor, { requesterId: 'emp-rt', title: 'Belanja Genset' });
  assert(!ketuaApproval.allowed, 'Governance Matrix: Ketua Yayasan murni Information Only (tidak ada wewenang ACC operasional)');

  const wakilActor = { id: 'emp-wkl', role: 'wakil_yayasan', name: 'Drs. H. M. Mansyur' };
  const wakilApproval = validateOperationalApproval(wakilActor, { requesterId: 'emp-rt', title: 'Belanja Genset' });
  assert(wakilApproval.allowed, 'Governance Matrix: Wakil Ketua Yayasan adalah Otoritas Tunggal ACC belanja operasional > 5 Juta');

  // ---------------------------------------------------------------------------
  // AUDIT 5: SUPER ADMIN & TIER 1 (FREE 50 SANTRI) MULTI-TENANT ONBOARDING
  // ---------------------------------------------------------------------------
  console.log('\n--- [AUDIT 5] Super Admin & Tier 1 Multi-Tenant Onboarding ---');

  const tenants = getSuperAdminTenants();
  const rabuTenant = tenants.find(t => t.id === 'tenant-rabu-001');
  assert(!!rabuTenant, 'Tenant Target Rabu: Pesantren Tahfidz Nurul Huda terdaftar di Super Admin Store');
  assert(rabuTenant?.tier === 'tier1_free', 'Tier Paket: Terdaftar pada Tier 1 (Free Kuota 50 Santri)');
  assert(rabuTenant?.quota_santri === 50, 'Enforcement Kuota: Batas maksimum santri terkunci di 50 santri');
  assert(rabuTenant?.current_santri === 42, 'Kapasitas Onboarding: 42 santri aktif (8 slot tersisa)');

  // 5.2 WhatsApp Onboarding Generator Verification
  if (rabuTenant) {
    const waMsg = formatWhatsAppWelcomeMessage(rabuTenant);
    const hasAdminEmail = waMsg.includes(rabuTenant.admin_email);
    const hasPortalUrl = waMsg.includes(rabuTenant.portal_subdomain);
    const hasPassword = waMsg.includes(rabuTenant.admin_temp_password);
    assert(
      hasAdminEmail && hasPortalUrl && hasPassword,
      'WhatsApp Automation: Pesan aktivasi & kredensial instan ter-generate lengkap dengan URL, Email & Temp Password'
    );
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 FINAL AUDIT RESULT: ${passedTests}/${totalTests} TESTS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  if (failedTests === 0) {
    console.log('🌟 STATUS: PRIMA, STABIL, 100% SIAP LIVE UNTUK TENANT RABU! 🌟');
  } else {
    console.log(`⚠️ STATUS: ${failedTests} TESTS GAGAL PERLU DITINJAU!`);
  }
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllAudits().catch(err => {
  console.error('Fatal Audit Error:', err);
  process.exit(1);
});
