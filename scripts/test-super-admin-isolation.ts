import { getFilteredNavigation, BACKOFFICE_NAVIGATION } from '../src/config/navigation';
import { getActiveActor, setActiveActorByRole } from '../src/lib/sessionStore';

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
console.log('🧪 RUNNING SUPER ADMIN ISOLATION TEST (5 TEST CASES)');
console.log('================================================================\n');

// 1. Super Admin Menu is marked superAdminOnly in BACKOFFICE_NAVIGATION
const superAdminItem = BACKOFFICE_NAVIGATION.find(item => item.href === '/super-admin');
assert(
  Boolean(superAdminItem && superAdminItem.superAdminOnly === true),
  'Test 1: Super Admin Onboarding menu is marked with superAdminOnly: true'
);

// 2. In Tenant Live mode, getFilteredNavigation strictly EXCLUDES super-admin
const tenantNav = getFilteredNavigation('tenant-rabu-001', undefined, 'tenant_admin_nh', true);
const hasSuperAdminInTenant = tenantNav.some(
  item => item.href.startsWith('/super-admin') || item.superAdminOnly === true
);
assert(
  !hasSuperAdminInTenant,
  'Test 2: getFilteredNavigation() strictly EXCLUDES /super-admin for Tenant Live'
);

// 3. Child items in Tenant Live navigation also do not contain any /super-admin
const hasSuperAdminChildren = tenantNav.some(
  item => item.children?.some(c => c.href.startsWith('/super-admin'))
);
assert(
  !hasSuperAdminChildren,
  'Test 3: No child navigation items point to /super-admin in Tenant Live'
);

// 4. In Demo mode with standard pesantren roles (e.g. yayasan), super-admin is EXCLUDED
const yayasanNav = getFilteredNavigation(undefined, undefined, 'yayasan', false);
const hasSuperAdminInYayasan = yayasanNav.some(
  item => item.href.startsWith('/super-admin') || item.superAdminOnly === true
);
assert(
  !hasSuperAdminInYayasan,
  'Test 4: Regular pesantren executive (Yayasan) does NOT see Super Admin console'
);

// 5. In Demo mode ONLY when role is super_admin, super-admin IS accessible
const superAdminNav = getFilteredNavigation(undefined, undefined, 'super_admin', false);
const hasSuperAdminInRoot = superAdminNav.some(
  item => item.href === '/super-admin'
);
assert(
  hasSuperAdminInRoot,
  'Test 5: Platform Super Admin role alone sees Super Admin Onboarding console'
);

console.log('\n================================================================');
console.log(`🏁 HASIL TEST: ${passed} PASSED / ${failed} FAILED (${passed + failed} TOTAL)`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
