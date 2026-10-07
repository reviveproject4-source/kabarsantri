import { TenantFeatureFlags, isFeatureActive } from './features';

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string;
  permission?: string;
  featureFlag?: keyof TenantFeatureFlags;
  isLockedInFreeTier?: boolean; // Dikunci jika akun di Tier Gratis (hanya hafalan yang terbuka)
  children?: NavItem[];
}

/**
 * Master Navigation Tree KabarSantri v2.0
 * Seluruh Role memiliki: Halaman Utama, Navigasi, Absen (Diri & Santri), dan Tugas Utama (Hafalan, Reward, Pelanggaran, Nilai)
 */
export const BACKOFFICE_NAVIGATION: NavItem[] = [
  {
    title: 'Halaman Utama',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    children: [
      { title: 'Overview Backoffice (Semua Role)', href: '/dashboard' },
      { title: 'Dashboard Ketua Yayasan', href: '/dashboard/yayasan', badge: 'Executive' },
      { title: 'Dashboard Wakil Ketua Yayasan', href: '/dashboard/wakil-yayasan', badge: 'Operasional' },
      { title: 'Dashboard Kepala Sekolah (Mudir)', href: '/dashboard/mudir', badge: 'KBM' },
    ],
  },
  {
    title: 'Absensi & Presensi (Klikabel)',
    href: '/presensi',
    icon: 'UserCheck',
    children: [
      { title: 'Absen Diri Pribadi', href: '/presensi/diri', isLockedInFreeTier: true },
      { title: 'Absen Santri (Guru / Musyrif)', href: '/presensi/santri', isLockedInFreeTier: true },
    ],
  },
  {
    title: 'Tugas Utama Jabatan (Klikabel)',
    href: '/tugas-utama',
    icon: 'BookOpen',
    children: [
      // Fitur Utama Paket Tier 1 (Free Kuota 50 Santri): Hafalan, Adab, Reward, Pelanggaran
      { title: 'Hafalan Santri (Tahfidz)', href: '/akademik/tahfidz', isLockedInFreeTier: false, badge: 'Tier 1' },
      { title: 'Adab & Karakter Santri', href: '/akademik/disiplin?tab=adab', isLockedInFreeTier: false, badge: 'Tier 1' },
      { title: 'Reward & Prestasi Santri', href: '/akademik/disiplin?tab=reward', isLockedInFreeTier: false, badge: 'Tier 1' },
      { title: 'Pelanggaran & Disiplin Tarbawi', href: '/akademik/disiplin?tab=pelanggaran', isLockedInFreeTier: false, badge: 'Tier 1' },
      { title: 'Nilai Pelajaran KBM (Guru)', href: '/akademik/nilai', isLockedInFreeTier: true },
    ],
  },
  {
    title: 'Rumah Tangga & Fasilitas',
    href: '/rumah-tangga',
    icon: 'Utensils',
    children: [
      { title: 'Hub Fasilitas & Gudang RT', href: '/rumah-tangga', isLockedInFreeTier: true, badge: 'Operasional' },
      { title: 'Pengajuan Kebutuhan Dana RT', href: '/rumah-tangga/pengajuan', isLockedInFreeTier: true, badge: 'Keuangan' },
    ],
  },
  {
    title: 'Kepegawaian & SDM (HRD)',
    href: '/kepegawaian',
    icon: 'Users',
    children: [
      { title: 'Pusat Kepegawaian & Direktori', href: '/kepegawaian', isLockedInFreeTier: true, badge: 'HRD' },
      { title: 'Manajemen Cuti & Izin', href: '/kepegawaian?tab=cuti', isLockedInFreeTier: true },
      { title: 'Evaluasi Kinerja & Eviden', href: '/kepegawaian?tab=kinerja', isLockedInFreeTier: true },
      { title: 'Disiplin & Berita Acara', href: '/kepegawaian?tab=disiplin', isLockedInFreeTier: true },
      { title: 'Clearance 4-Pintu (Offboarding)', href: '/kepegawaian?tab=offboarding', isLockedInFreeTier: true },
    ],
  },
  {
    title: 'Kesiswaan & Asrama',
    href: '/santri',
    icon: 'GraduationCap',
    children: [
      { title: 'Data Induk Santri (Maks 50)', href: '/santri/list', isLockedInFreeTier: false, badge: 'Tier 1' },
      { title: 'Tambah Santri Baru', href: '/santri/create', isLockedInFreeTier: false },
      { title: 'Wali Santri & Akun PIN', href: '/wali/list', isLockedInFreeTier: false, badge: 'Tier 1' },
      { title: 'Assign Kelas & Rombel (Mudir)', href: '/dashboard/mudir?tab=assign_kelas', isLockedInFreeTier: true },
      { title: 'Perizinan & QR Gate Pass', href: '/akademik/perizinan', isLockedInFreeTier: true },
    ],
  },
  {
    title: 'Keuangan & Pengeluaran',
    href: '/finance',
    icon: 'Wallet',
    children: [
      { title: 'Validasi Bukti Transfer', href: '/finance/validasi', isLockedInFreeTier: true, badge: 'Verifikasi' },
      { title: 'Pengeluaran & Approval Dana', href: '/finance/pengeluaran', isLockedInFreeTier: true, badge: 'Pengeluaran' },
      { title: 'Atur Batas Threshold Mandiri', href: '/finance/pengaturan-threshold', isLockedInFreeTier: true },
      { title: 'Tagihan & SPP', href: '/finance/spp', isLockedInFreeTier: true },
      // Uang jajan disembunyikan via feature flag enable_uang_jajan: false
      { 
        title: 'Uang Jajan Santri (Kantin)', 
        href: '/finance/uang-jajan', 
        featureFlag: 'enable_uang_jajan',
        isLockedInFreeTier: true 
      },
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
      { title: 'Ringkasan Eksekutif', href: '/laporan/ringkasan', isLockedInFreeTier: true },
    ],
  },
];

/**
 * Filter navigasi secara dinamis berdasarkan Feature Flags tenant.
 */
export function getFilteredNavigation(customFlags?: Partial<TenantFeatureFlags>): NavItem[] {
  return BACKOFFICE_NAVIGATION.filter(item => {
    if (item.featureFlag && !isFeatureActive(item.featureFlag, customFlags)) {
      return false;
    }
    return true;
  }).map(item => {
    if (!item.children) return item;
    return {
      ...item,
      children: item.children.filter(child => {
        if (child.featureFlag && !isFeatureActive(child.featureFlag, customFlags)) {
          return false;
        }
        return true;
      }),
    };
  });
}
