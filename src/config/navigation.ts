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
  superAdminOnly?: boolean; // Khusus konsol internal platform (terlarang untuk tenant live)
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
      { title: 'Dashboard Utama', href: '/dashboard' },
      { title: 'Dashboard Yayasan', href: '/dashboard/yayasan' },
      { title: 'Persetujuan & Kebijakan', href: '/dashboard/wakil-yayasan' },
      { title: 'Dashboard Akademik', href: '/dashboard/mudir' },
    ],
  },
  {
    title: 'Laporan Hafalan Santri',
    href: '/akademik/tahfidz',
    icon: 'BookOpen',
    productCode: 'hafalan',
    children: [
      { title: 'Mutaba\'ah & Setoran Tahfidz', href: '/akademik/tahfidz', productCode: 'hafalan' },
    ],
  },
  {
    title: 'Absensi & Presensi',
    href: '/presensi',
    icon: 'UserCheck',
    productCode: 'presensi',
    children: [
      { title: 'Absen Santri', href: '/presensi/santri', productCode: 'presensi' },
      { title: 'Absen Diri Pegawai', href: '/presensi/diri', productCode: 'presensi' },
    ],
  },
  {
    title: 'Penilaian KBM',
    href: '/akademik/nilai',
    icon: 'GraduationCap',
    productCode: 'rapot',
    children: [
      { title: 'Nilai Pelajaran KBM', href: '/akademik/nilai', productCode: 'rapot' },
      { title: 'Cetak Raport Santri', href: '/akademik/raport', productCode: 'rapot' },
    ],
  },
  {
    title: 'Kedisiplinan & Adab',
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
      { title: 'Data Induk Santri', href: '/santri/list' },
      { title: 'Tambah Santri Baru', href: '/santri/create' },
      { title: 'Wali Santri & Akun PIN', href: '/wali/list' },
      { title: 'Rombel & Kelas Santri', href: '/dashboard/mudir?tab=assign_kelas' },
      { title: 'Perizinan Santri', href: '/akademik/perizinan', productCode: 'izin' },
    ],
  },
  {
    title: 'Kepegawaian & SDM',
    href: '/kepegawaian',
    icon: 'Users',
    productCode: 'hrd',
    children: [
      { title: 'Direktori Kepegawaian', href: '/kepegawaian', productCode: 'hrd' },
      { title: 'Manajemen Cuti & Izin', href: '/kepegawaian?tab=cuti', productCode: 'hrd' },
      { title: 'Evaluasi Kinerja', href: '/kepegawaian?tab=kinerja', productCode: 'hrd' },
      { title: 'Disiplin & Berita Acara', href: '/kepegawaian?tab=disiplin', productCode: 'hrd' },
      { title: 'Offboarding Pegawai', href: '/kepegawaian?tab=offboarding', productCode: 'hrd' },
    ],
  },
  {
    title: 'Keuangan & SPP',
    href: '/finance',
    icon: 'Wallet',
    productCode: 'finance',
    children: [
      { title: 'Validasi Pembayaran SPP', href: '/finance/validasi', productCode: 'finance' },
      { title: 'Pengeluaran & Anggaran', href: '/finance/pengeluaran', productCode: 'finance' },
      { title: 'Batas Mandiri Persetujuan', href: '/finance/pengaturan-threshold', productCode: 'finance' },
      { title: 'Tagihan & SPP Santri', href: '/finance/spp', productCode: 'finance' },
      { 
        title: 'Uang Saku Santri', 
        href: '/finance/uang-jajan', 
        productCode: 'finance',
        featureFlag: 'enable_uang_jajan',
      },
    ],
  },
  {
    title: 'Sarana & Prasarana',
    href: '/rumah-tangga',
    icon: 'Utensils',
    productCode: 'rumah_tangga',
    children: [
      { title: 'Fasilitas & Gudang Logistik', href: '/rumah-tangga', productCode: 'rumah_tangga' },
      { title: 'Pengajuan Fasilitas', href: '/rumah-tangga/pengajuan', productCode: 'rumah_tangga' },
    ],
  },
  {
    title: 'Portal Wali Santri',
    href: '/portal-wali',
    icon: 'Users',
    children: [
      { title: 'Portal Wali Santri', href: '/portal-wali' },
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
  {
    title: 'Pengaturan & Kata Sandi',
    href: '/pengaturan',
    icon: 'Settings',
    children: [
      { title: 'Pengaturan & Ganti Password', href: '/pengaturan' },
    ],
  },
  {
    title: 'Konsol Super Admin',
    href: '/super-admin',
    icon: 'ShieldCheck',
    superAdminOnly: true,
    children: [
      { title: 'Data Registrasi Yayasan', href: '/super-admin' },
    ],
  },
];

/**
 * Filter navigasi secara dinamis berdasarkan Feature Flags, Entitlement, dan Peran Aktif.
 * Mendukung 3 Peran Komersial Utama: Yayasan, Pegawai, dan Wali Santri.
 */
export function getFilteredNavigation(
  tenantId?: string,
  customFlags?: Partial<TenantFeatureFlags>,
  activeRole?: string,
  isTenant?: boolean
): NavItem[] {
  const isTenantActive = isTenant ?? (typeof window !== 'undefined' ? (window.location.search.includes('mode=tenant') || document.cookie.includes('ks_app_mode=tenant')) : false);

  // Khusus peran Wali Santri: langsung fokus ke Portal Wali Santri
  if (activeRole === 'wali_santri') {
    return [
      {
        title: 'Portal Orang Tua',
        href: '/portal-wali',
        icon: 'Users',
        children: [
          { title: 'Portal Wali Santri', href: '/portal-wali' },
        ],
      },
    ];
  }

  // Khusus peran Pegawai: fokus ke operasional Tahfidz, KBM, Presensi Diri, Cuti, & Pengaturan
  if (activeRole === 'pegawai') {
    return BACKOFFICE_NAVIGATION.filter(item => {
      const allowed = ['/dashboard', '/akademik/tahfidz', '/akademik/nilai', '/presensi', '/akademik/disiplin', '/kepegawaian', '/pengaturan'];
      return allowed.includes(item.href);
    }).map(item => {
      if (item.href === '/dashboard' && item.children) {
        return {
          ...item,
          children: [{ title: 'Dashboard Pegawai & Guru', href: '/dashboard' }]
        };
      }
      if (item.href === '/presensi' && item.children) {
        return {
          ...item,
          children: [{ title: 'Absen Diri Pegawai', href: '/presensi/diri', productCode: 'presensi' }]
        };
      }
      if (item.href === '/kepegawaian' && item.children) {
        return {
          ...item,
          children: [{ title: 'Permohonan Cuti Mandiri', href: '/kepegawaian?tab=cuti', productCode: 'hrd' }]
        };
      }
      return item;
    });
  }

  return BACKOFFICE_NAVIGATION
    .filter(item => {
      // 0. Super Admin Isolation: Terlarang di Jalur Tenant Live
      if (item.superAdminOnly) {
        if (isTenantActive || tenantId) {
          return false;
        }
        if (activeRole && activeRole !== 'super_admin') {
          return false;
        }
      }

      // Khusus Peran Yayasan: Hapus Portal Orang Tua & Absen Diri (Kehadiran terpusat di HRD)
      if (activeRole === 'yayasan' || activeRole === 'pimpinan_yayasan') {
        if (item.href === '/portal-wali' || item.href === '/presensi') {
          return false;
        }
      }

      // 1. Feature flag check
      if (item.featureFlag && !isFeatureActive(item.featureFlag, customFlags)) {
        return false;
      }

      // 2. Product entitlement check
      // Seluruh fitur dashboard tenant ditampilkan selaras dengan Pusat Kendali Super Admin.
      // Status aktif vs terkunci dikendalikan langsung oleh Super Admin via checkIsItemLocked di Sidebar.
      return true;
    })
    .map(item => {
      if (!item.children) return item;
      const filteredChildren = item.children.filter(child => {
        // Child super admin check
        if (child.superAdminOnly && (isTenantActive || tenantId || (activeRole && activeRole !== 'super_admin'))) {
          return false;
        }
        // Child feature flag
        if (child.featureFlag && !isFeatureActive(child.featureFlag, customFlags)) {
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
      if (item.children && item.children.length === 0) {
        return false;
      }
      return true;
    });
}
