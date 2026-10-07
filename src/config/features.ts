/**
 * Feature Flags Configuration for KabarSantri v2.0
 * 
 * Aturan Bisnis:
 * "uang jajan, pada modul finance, tetap dibuat implementasi, tapi disembunyikan dahulu."
 */

export interface TenantFeatureFlags {
  enable_uang_jajan: boolean;
  enable_tahfidz: boolean;
  enable_perizinan: boolean;
  enable_pelanggaran_reward: boolean;
}

export const DEFAULT_FEATURE_FLAGS: TenantFeatureFlags = {
  // Mode Uji Coba: Uang Jajan dibuka untuk pengujian modul finansial
  enable_uang_jajan: true,
  enable_tahfidz: true,
  enable_perizinan: true,
  enable_pelanggaran_reward: true,
};

export function isFeatureActive(
  flagName: keyof TenantFeatureFlags,
  tenantCustomFlags?: Partial<TenantFeatureFlags>
): boolean {
  if (!tenantCustomFlags) {
    return DEFAULT_FEATURE_FLAGS[flagName];
  }
  return tenantCustomFlags[flagName] ?? DEFAULT_FEATURE_FLAGS[flagName];
}
