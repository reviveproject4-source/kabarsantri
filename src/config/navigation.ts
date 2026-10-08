import { TenantFeatureFlags, isFeatureActive } from './features';
import { ProductCode } from '@/lib/productCatalog';
import { hasProduct } from '@/lib/tenantEntitlementStore';

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string;
  permission?: string;
  featureFlag?: keyof TenantFeatureFlags;
  productCode?: ProductCode; // Modular Product Entitlement
  isLockedInFreeTier?: boolean;
  children?: NavItem[];
}

/**
 * Master Navigation Tree KabarSantri v2.0
 * Modular Navigation with Product Entitlements
 */
export const BACKOFFICE_NAVIGATION: NavItem[] = [
  {
    title: 'Halaman Utama',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    children: [
      { title: 'Overview Backoffice', href: '/dashboard' },
      { title: 'Dashboard Ketua Yayasan', href: '/dashboard/yayasan', badge: 'Executive' },
      { title: 'Dashboard Wakil Ketua Yayasan', href: '/dashboard/wakil-yayasan', badge: 'Operasional' },
      { title: 'Dashboard Kepala Sekolah (Mudir)', href: '/dashboard/mudir', badge: 'KBM' },
    ],
  },
  {
    title: 'Laporan Hafalan Santri',
    href: '/akademik/tahfidz',
    icon: 'BookOpen',
    productCode: 'hafalan',
    children: [
      { title: 'Mutaba\'ah & Setoran Tahfidz', href: '/akademik/tahfidz', productCode: 'hafalan', badge: 'Zakat' },
    ],
  },
  {
    title: 'Absensi & Presensi Santri',
    href: '/presensi',
    icon: 'UserCheck',
    productCode: 'presensi',
    children: [
      { title: 'Absen Santri (Musyrif/Guru)', href: '/presensi/santri', productCode: 'presensi', badge: 'Zakat' },
      { title: 'Absen Diri Pribadi', href: '/presensi/diri', productCode: 'presensi' },
    ],
  },
  {
    title: 'e-Rapot & Penilaian KBM',
    href: '/akademik/nilai',
    icon: 'GraduationCap',
    productCode: 'rapot',
    children: [
      { title: 'Nilai Pelajaran KBM (Guru)', href: '/akademik/nilai', productCode: 'rapot' },
    ],
  },
  {
    title: 'e-Adab & Kedisiplinan',
    href: '/akademik/disiplin',
    icon: 'BookOpen',
    productCode: 'adab',
    children: [
      { title: 'Adab & Karakter Santri', href: '/akademik/disiplin?tab=adab', productCode: 'adab' },
      { title: 'Reward & Prestasi Santri', href: '/akademik/disiplin?tab=reward', productCode: 'adab' },
      { title: 'Pelanggaran & Disiplin Tarbawi', href: '/akademik/disiplin?tab=pelanggaran', productCode: 'adab' },
    ],
  },
  {
    title: 'Kesiswaan & Asrama',
    href: '/santri',
    icon: 'GraduationCap',
    children: [
      { title: 'Data Induk Santri (Maks 50)', href: '/santri/list' },
      { title: 'Tambah Santri Baru', href: '/santri/create' },
      { title: 'Wali Santri & Akun PIN', href: '/wali/list' },
      { title: 'Assign Kelas & Rombel (Mudir)', href: '/dashboard/mudir?tab=assign_kelas' },
      { title: 'Perizinan & QR Gate Pass', href: '/akademik/perizinan', productCode: 'izin' },
    ],
  },
  {
    title: 'Kepegawaian & SDM (HRD)',
    href: '/kepegawaian',
    icon: 'Users',
    productCode: 'hrd',
    children: [
      { title: 'Pusat Kepegawaian & Direktori', href: '/kepegawaian', productCode: 'hrd', badge: 'HRD' },
      { title: 'Manajemen Cuti & Izin', href: '/kepegawaian?tab=cuti', productCode: 'hrd' },
      { title: 'Evaluasi Kinerja & Eviden', href: '/kepegawaian?tab=kinerja', productCode: 'hrd' },
      { title: 'Disiplin & Berita Acara', href: '/kepegawaian?tab=disiplin', productCode: 'hrd' },
      { title: 'Clearance 4-Pintu (Offboarding)', href: '/kepegawaian?tab=offboarding', productCode: 'hrd' },
    ],
  },
  {
    title: 'Keuangan & SPP',
    href: '/finance',
    icon: 'Wallet',
    productCode: 'finance',
    children: [
      { title: 'Validasi Bukti Transfer', href: '/finance/validasi', productCode: 'finance', badge: 'Verifikasi' },
      { title: 'Pengeluaran & Approval Dana', href: '/finance/pengeluaran', productCode: 'finance', badge: 'Pengeluaran' },
      { title: 'Atur Batas Threshold Mandiri', href: '/finance/pengaturan-threshold', productCode: 'finance' },
      { title: 'Tagihan & SPP Santri', href: '/finance/spp', productCode: 'finance' },
      { 
        title: 'Uang Jajan Santri (Kantin)', 
        href: '/finance/uang-jajan', 
        productCode: 'finance',
        featureFlag: 'enable_uang_jajan',
      },
    ],
  },
  {
    title: 'Rumah Tangga & Sarpras',
    href: '/rumah-tangga',
    icon: 'Utensils',
    productCode: 'rumah_tangga',
    children: [
      { title: 'Hub Fasilitas & Gudang RT', href: '/rumah-tangga', productCode: 'rumah_tangga', badge: 'Operasional' },
      { title: 'Pengajuan Kebutuhan Dana RT', href: '/rumah-tangga/pengajuan', productCode: 'rumah_tangga', badge: 'Keuangan' },
    ],
  },
  {
    title: 'Super Admin Onboarding',
    href: '/super-admin',
    icon: 'ShieldCheck',
    children: [
      { title: 'Onboarding Tenant Baru (Rabu)', href: '/super-admin', badge: 'Super Admin' },
      { title: 'Daftar Tenant & Kuota Santri', href: '/super-admin?tab=tenants' },
      { title: 'Kirim Kredensial via WA', href: '/super-admin?tab=broadcast' },
    ],
  },
  {
    title: 'Laporan Konsolidasi',
    href: '/laporan',
    icon: 'FileBarChart2',
    children: [
      { title: 'Ringkasan Eksekutif', href: '/laporan/ringkasan' },
    ],
  },
];

/**
 * Filter navigasi secara dinamis berdasarkan Feature Flags dan Tenant Product Entitlements.
 */
export function getFilteredNavigation(
  tenantId?: string,
  customFlags?: Partial<TenantFeatureFlags>
): NavItem[] {
  return BACKOFFICE_NAVIGATION
    .filter(item => {
      // 1. Feature flag check
      if (item.featureFlag && !isFeatureActive(item.featureFlag, customFlags)) {
        return false;
      }
      // 2. Product entitlement check
      if (tenantId && item.productCode && !hasProduct(tenantId, item.productCode)) {
        return false;
      }
      return true;
    })
    .map(item => {
      if (!item.children) return item;
      const filteredChildren = item.children.filter(child => {
        // Child feature flag
        if (child.featureFlag && !isFeatureActive(child.featureFlag, customFlags)) {
          return false;
        }
        // Child product entitlement
        if (tenantId && child.productCode && !hasProduct(tenantId, child.productCode)) {
          return false;
        }
        return true;
      });

      return {
        ...item,
        children: filteredChildren,
      };
    })
    .filter(item => {
      // Remove group if all its children were filtered out
      if (item.children && item.children.length === 0) {
        return false;
      }
      return true;
    });
}
