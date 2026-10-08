/**
 * KABARSANTRI V2 — TENANT PRODUCT ENTITLEMENT ENGINE & STORE
 * 
 * Manages modular product entitlements for tenants.
 * Enforces:
 * 1. Product Entitlement Separation (Tenant A vs Tenant B).
 * 2. KabarSantri Free — Zakat Package (Hafalan + Presensi, Max 50 Active Students).
 * 3. 50 Active Students Quota (Archived students excluded from quota).
 * 4. Route & Action Protection (Feature Visibility != Feature Authorization).
 * 5. Safe Upgrade / Downgrade (Data preservation with zero loss).
 * 6. Product Entitlement != Role Permission.
 */

import { ProductCode, MODULAR_PRODUCT_CATALOG, getProductCodeByRoute } from './productCatalog';

export const FREE_PACKAGE_MAX_ACTIVE_STUDENTS = 50;

export type EntitlementStatus = 'ACTIVE' | 'INACTIVE';
export type EntitlementSource = 'ZAKAT' | 'COMMERCIAL' | 'ADDON';

export interface TenantEntitlement {
  tenant_id: string;
  product_code: ProductCode;
  status: EntitlementStatus;
  activated_at: string;
  expires_at: string | null;
  source: EntitlementSource;
}

export interface TenantPackageProfile {
  name: string;
  isFreeZakat: boolean;
  maxActiveStudents: number;
  entitlements: Record<ProductCode, EntitlementStatus>;
}

const STORAGE_KEY = 'ks_tenant_entitlements_v2';

/**
 * DEFAULT SEED ENTITLEMENTS FOR KEY TENANTS:
 * 1. tenant-rabu-001 (Pesantren Tahfidz Nurul Huda) -> KABARSANTRI FREE — ZAKAT
 *    Hafalan (ACTIVE), Presensi (ACTIVE), Other 6 products (INACTIVE).
 * 2. tenant-pesantren-001 (Pondok Al-Hikmah Demo) -> FULL BOS (All 8 Products ACTIVE).
 */
const INITIAL_ENTITLEMENTS: TenantEntitlement[] = [
  // Tenant Target Live: Pesantren Tahfidz Nurul Huda (Paket Zakat)
  { tenant_id: 'tenant-rabu-001', product_code: 'hafalan', status: 'ACTIVE', activated_at: '2026-10-01T00:00:00Z', expires_at: null, source: 'ZAKAT' },
  { tenant_id: 'tenant-rabu-001', product_code: 'presensi', status: 'ACTIVE', activated_at: '2026-10-01T00:00:00Z', expires_at: null, source: 'ZAKAT' },
  { tenant_id: 'tenant-rabu-001', product_code: 'rapot', status: 'INACTIVE', activated_at: '2026-10-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-rabu-001', product_code: 'adab', status: 'INACTIVE', activated_at: '2026-10-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-rabu-001', product_code: 'izin', status: 'INACTIVE', activated_at: '2026-10-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-rabu-001', product_code: 'hrd', status: 'INACTIVE', activated_at: '2026-10-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-rabu-001', product_code: 'finance', status: 'INACTIVE', activated_at: '2026-10-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-rabu-001', product_code: 'rumah_tangga', status: 'INACTIVE', activated_at: '2026-10-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },

  // Tenant Demo: Pondok Pesantren Al-Hikmah (Full Modular BOS 12 Peran)
  { tenant_id: 'tenant-pesantren-001', product_code: 'hafalan', status: 'ACTIVE', activated_at: '2026-09-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-pesantren-001', product_code: 'presensi', status: 'ACTIVE', activated_at: '2026-09-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-pesantren-001', product_code: 'rapot', status: 'ACTIVE', activated_at: '2026-09-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-pesantren-001', product_code: 'adab', status: 'ACTIVE', activated_at: '2026-09-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-pesantren-001', product_code: 'izin', status: 'ACTIVE', activated_at: '2026-09-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-pesantren-001', product_code: 'hrd', status: 'ACTIVE', activated_at: '2026-09-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-pesantren-001', product_code: 'finance', status: 'ACTIVE', activated_at: '2026-09-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
  { tenant_id: 'tenant-pesantren-001', product_code: 'rumah_tangga', status: 'ACTIVE', activated_at: '2026-09-01T00:00:00Z', expires_at: null, source: 'COMMERCIAL' },
];

let inMemoryEntitlements: TenantEntitlement[] = [...INITIAL_ENTITLEMENTS];

function loadEntitlements(): TenantEntitlement[] {
  if (typeof window === 'undefined') {
    return inMemoryEntitlements;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ENTITLEMENTS));
      return INITIAL_ENTITLEMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return inMemoryEntitlements;
  }
}

function saveEntitlements(list: TenantEntitlement[]): void {
  inMemoryEntitlements = list;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('ks_entitlements_updated', { detail: list }));
    } catch (e) {
      console.warn('Failed to save entitlements to localStorage:', e);
    }
  }
}

/**
 * 1. CHECK IF TENANT HAS PRODUCT (hasProduct)
 */
export function hasProduct(tenantId: string, productCode: ProductCode): boolean {
  const all = loadEntitlements();
  const match = all.find(e => e.tenant_id === tenantId && e.product_code === productCode);
  if (!match) {
    // Default fallback: if tenant is Free Zakat, only hafalan & presensi are active
    const isZakatTenant = tenantId === 'tenant-rabu-001' || tenantId.includes('zakat') || tenantId.includes('free');
    if (isZakatTenant) {
      return productCode === 'hafalan' || productCode === 'presensi';
    }
    return true; // Default for demo/unconfigured
  }
  return match.status === 'ACTIVE';
}

/**
 * 2. GET ALL ENTITLEMENTS FOR A TENANT
 */
export function getTenantEntitlements(tenantId: string): TenantEntitlement[] {
  const all = loadEntitlements();
  const list = all.filter(e => e.tenant_id === tenantId);
  if (list.length === 0) {
    // Generate default template for this tenant
    const isZakat = tenantId === 'tenant-rabu-001' || tenantId.includes('zakat') || tenantId.includes('free');
    const codes: ProductCode[] = ['hafalan', 'presensi', 'rapot', 'adab', 'izin', 'hrd', 'finance', 'rumah_tangga'];
    const generated: TenantEntitlement[] = codes.map(code => ({
      tenant_id: tenantId,
      product_code: code,
      status: (isZakat ? (code === 'hafalan' || code === 'presensi') : true) ? 'ACTIVE' : 'INACTIVE',
      activated_at: new Date().toISOString(),
      expires_at: null,
      source: isZakat ? 'ZAKAT' : 'COMMERCIAL'
    }));
    const updated = [...all, ...generated];
    saveEntitlements(updated);
    return generated;
  }
  return list;
}

/**
 * 3. SET PRODUCT ENTITLEMENT
 */
export function setProductEntitlement(
  tenantId: string,
  productCode: ProductCode,
  status: EntitlementStatus,
  source: EntitlementSource = 'COMMERCIAL'
): TenantEntitlement {
  const all = loadEntitlements();
  const index = all.findIndex(e => e.tenant_id === tenantId && e.product_code === productCode);
  const now = new Date().toISOString();

  let updatedEntitlement: TenantEntitlement;

  if (index >= 0) {
    updatedEntitlement = {
      ...all[index],
      status,
      source,
      activated_at: status === 'ACTIVE' ? now : all[index].activated_at
    };
    all[index] = updatedEntitlement;
  } else {
    updatedEntitlement = {
      tenant_id: tenantId,
      product_code: productCode,
      status,
      activated_at: now,
      expires_at: null,
      source
    };
    all.push(updatedEntitlement);
  }

  saveEntitlements([...all]);
  return updatedEntitlement;
}

/**
 * 4. UPGRADE PRODUCT (ACTIVATE AN ADDON WITHOUT TOUCHING OTHER DATA)
 */
export function upgradeProduct(tenantId: string, productCode: ProductCode): {
  success: boolean;
  message: string;
  entitlement: TenantEntitlement;
} {
  const res = setProductEntitlement(tenantId, productCode, 'ACTIVE', 'ADDON');
  const catalog = MODULAR_PRODUCT_CATALOG[productCode];
  return {
    success: true,
    message: `Produk "${catalog.name}" berhasil diaktifkan untuk tenant! Seluruh fitur sekarang dapat diakses.`,
    entitlement: res
  };
}

/**
 * 5. DOWNGRADE PRODUCT (INACTIVATE AN ADDON SAFELY WITHOUT DELETING DATA)
 */
export function downgradeProduct(tenantId: string, productCode: ProductCode): {
  success: boolean;
  message: string;
  entitlement: TenantEntitlement;
} {
  const res = setProductEntitlement(tenantId, productCode, 'INACTIVE', 'COMMERCIAL');
  const catalog = MODULAR_PRODUCT_CATALOG[productCode];
  return {
    success: true,
    message: `Produk "${catalog.name}" dinonaktifkan. Seluruh data historis tetap tersimpan aman di database dan siap digunakan kembali jika di-upgrade di kemudian hari.`,
    entitlement: res
  };
}

/**
 * 6. CHECK STUDENT QUOTA (FREE ZAKAT = MAX 50 ACTIVE STUDENTS)
 * Business Rule Section 8: Only ACTIVE students are counted. Archived students are excluded.
 */
export function checkStudentQuota(
  tenantId: string,
  santriList?: Array<{ status?: string; lifecycle_status?: string }>
): {
  currentActive: number;
  currentArchived: number;
  maxAllowed: number;
  canAdd: boolean;
  isFreeZakat: boolean;
  message?: string;
} {
  // Determine if tenant is on Free Zakat package
  const entitlements = getTenantEntitlements(tenantId);
  const isFreeZakat = 
    entitlements.some(e => e.source === 'ZAKAT' && e.status === 'ACTIVE') &&
    entitlements.every(e => (e.product_code === 'hafalan' || e.product_code === 'presensi') || e.status === 'INACTIVE');

  const maxAllowed = isFreeZakat ? FREE_PACKAGE_MAX_ACTIVE_STUDENTS : 500;

  // Retrieve santri list if not provided
  let list = santriList;
  if (!list && typeof window !== 'undefined') {
    const raw = localStorage.getItem('ks_tenant_santri_list_v1');
    list = raw ? JSON.parse(raw) : [];
  } else if (!list) {
    list = [];
  }

  // Count active vs archived students
  let activeCount = 0;
  let archivedCount = 0;

  for (const s of list) {
    const st = (s.status || s.lifecycle_status || '').toLowerCase();
    if (st === 'archived' || st === 'alumni' || st === 'keluar' || st === 'non-aktif') {
      archivedCount++;
    } else {
      activeCount++;
    }
  }

  const canAdd = activeCount < maxAllowed;
  const message = canAdd
    ? undefined
    : `Kuota paket gratis maksimal ${maxAllowed} santri telah tercapai. Silakan upgrade paket atau hubungi KabarSantri.`;

  return {
    currentActive: activeCount,
    currentArchived: archivedCount,
    maxAllowed,
    canAdd,
    isFreeZakat,
    message
  };
}

/**
 * 7. CHECK ROUTE ACCESS PERMISSIONS
 * Verifies if the requested route is permitted by the tenant's product entitlements.
 */
export function canAccessRoute(
  tenantId: string,
  pathname: string
): {
  allowed: boolean;
  requiredProduct?: ProductCode;
  productName?: string;
  isCoreRoute: boolean;
} {
  const productCode = getProductCodeByRoute(pathname);

  // If route is part of core platform, it's always allowed
  if (!productCode) {
    return { allowed: true, isCoreRoute: true };
  }

  const allowed = hasProduct(tenantId, productCode);
  const catalog = MODULAR_PRODUCT_CATALOG[productCode];

  return {
    allowed,
    requiredProduct: productCode,
    productName: catalog.name,
    isCoreRoute: false
  };
}

/**
 * 8. CHECK ACTION PERMISSION (PRODUCT ENTITLEMENT != ROLE PERMISSION)
 * Validates BOTH Product Entitlement AND Role Authority.
 */
export function canAccessAction(
  tenantId: string,
  actionName: string,
  roleKey?: string
): {
  allowed: boolean;
  reason?: string;
} {
  // Map actions to required products
  const ACTION_PRODUCT_MAP: Record<string, { product: ProductCode; requiredRoles?: string[] }> = {
    'SUBMIT_HAFALAN': { product: 'hafalan', requiredRoles: ['guru', 'guru_akhwat', 'mudir', 'musyrif'] },
    'INPUT_ABSEN_SANTRI': { product: 'presensi', requiredRoles: ['guru', 'guru_akhwat', 'musyrif', 'musyrifah', 'mudir'] },
    'INPUT_NILAI_KBM': { product: 'rapot', requiredRoles: ['guru', 'guru_akhwat', 'mudir'] },
    'CATAT_PELANGGARAN': { product: 'adab', requiredRoles: ['musyrif', 'musyrifah', 'guru', 'mudir'] },
    'CHECKOUT_GATE_PASS': { product: 'izin', requiredRoles: ['satpam', 'mudir'] },
    'AJUKAN_CUTI_HRD': { product: 'hrd' },
    'APPROVE_PENGELUARAN_DANA': { product: 'finance', requiredRoles: ['keuangan', 'wakil_yayasan'] },
    'SUBMIT_LOGISTIK_RT': { product: 'rumah_tangga', requiredRoles: ['kepala_rumah_tangga', 'dapur', 'laundry'] },
  };

  const rule = ACTION_PRODUCT_MAP[actionName];
  if (!rule) {
    return { allowed: true };
  }

  // 1. Layer Product Entitlement: Apakah tenant membeli/memiliki produk ini?
  const hasEntitlement = hasProduct(tenantId, rule.product);
  if (!hasEntitlement) {
    const catalog = MODULAR_PRODUCT_CATALOG[rule.product];
    return {
      allowed: false,
      reason: `Aksi ditolak: Tenant belum memiliki lisensi produk "${catalog.name}". Silakan upgrade paket langganan.`
    };
  }

  // 2. Layer Role Permission: Apakah user ini berwenang melakukan aksi ini?
  if (rule.requiredRoles && roleKey && !rule.requiredRoles.includes(roleKey)) {
    return {
      allowed: false,
      reason: `Aksi ditolak: Peran "${roleKey}" tidak memiliki izin operasional untuk aksi "${actionName}". (Role Permission Required)`
    };
  }

  return { allowed: true };
}
