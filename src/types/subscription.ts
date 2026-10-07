/**
 * Subscription Tier & Gating Configuration
 * Tier Gratis: Hanya fitur Laporan Hafalan Santri (Maksimal 50 Santri)
 * Tier Premium: Seluruh fitur ERP & Parental Engagement terbuka tanpa batas
 */

export type SubscriptionTier = 'gratis' | 'pro' | 'premium';

export interface TenantSubscriptionInfo {
  tier: SubscriptionTier;
  max_santri_quota: number; // 50 untuk gratis, 250 untuk pro, unlimited untuk premium
  current_santri_count: number;
  unlocked_features: string[];
}

export const TIER_CONFIG = {
  gratis: {
    name: 'Tier 1 - Paket Gratis Starter',
    max_santri: 50,
    allowed_features: [
      '/dashboard',
      '/akademik/tahfidz',
      '/akademik/disiplin',
      '/santri/list',
      '/wali/list',
      '/laporan/hafalan'
    ],
    message_locked: 'Fitur belum diaktifkan pada paket Anda. Pada Tier 1 (Paket Gratis 50 Santri), fitur yang aktif adalah Hafalan Al-Qur\'an (Tahfidz), Adab & Karakter Santri, Reward & Prestasi, serta Pelanggaran & Tarbiyah.',
  },
  pro: {
    name: 'Tier 2 - Paket Pro Pesantren',
    max_santri: 250,
    allowed_features: [
      '/dashboard',
      '/akademik/tahfidz',
      '/akademik/disiplin',
      '/akademik/nilai',
      '/presensi',
      '/santri',
      '/wali',
      '/finance/spp'
    ],
    message_locked: 'Fitur membutuhkan Paket Enterprise 6-Pilar.',
  },
  premium: {
    name: 'Tier 3 - Enterprise 6 Pilar Tata Kelola',
    max_santri: 999999,
    allowed_features: ['*'],
    message_locked: '',
  },
};

export function isFeatureLockedInTier(featureHref: string, tier: SubscriptionTier = 'gratis'): boolean {
  if (tier === 'premium') return false;
  
  // Jika tier gratis (Tier 1), izinkan tahfidz, adab, reward, pelanggaran, dan dashboard
  if (tier === 'gratis') {
    const allowed = ['/dashboard', '/akademik/tahfidz', '/akademik/disiplin', '/santri/list', '/wali/list'];
    return !allowed.some(path => featureHref.startsWith(path));
  }

  // Jika tier pro
  if (tier === 'pro') {
    const proBlocked = ['/finance/pengaturan-threshold', '/kepegawaian?tab=offboarding'];
    return proBlocked.some(path => featureHref.startsWith(path));
  }

  return false;
}
