/**
 * KABARSANTRI V2 — MODULAR PRODUCT CATALOG
 * 
 * Defines the modular business capabilities of the KabarSantri BOS.
 * Products can be licensed and enabled independently per tenant.
 * 
 * Architecture Layer:
 * LAYER 1 — GOVERNANCE: Siapa yang berwenang? (6 Pilar Tata Kelola - LOCKED)
 * LAYER 2 — PRODUCT: Apa produk/capability yang dilisensikan? (Catalog & Entitlement)
 * LAYER 3 — FEATURE: Apa fungsi teknis di dalam produk?
 */

export type ProductCode = 
  | 'hafalan'
  | 'presensi'
  | 'rapot'
  | 'adab'
  | 'izin'
  | 'hrd'
  | 'finance'
  | 'rumah_tangga';

export type ProductCategory = 
  | 'CORE'
  | 'AKADEMIK'
  | 'KESANTRIAN'
  | 'KEAMANAN'
  | 'ORGANISASI'
  | 'FINANSIAL'
  | 'OPERASIONAL';

export interface ModularProduct {
  code: ProductCode;
  name: string;
  category: ProductCategory;
  description: string;
  includedInFreeZakat: boolean;
  pricingType: 'FREE_ZAKAT' | 'COMMERCIAL_ADDON' | 'ENTERPRISE';
  maxStudentsFreeZakat?: number;
  routes: string[];
  features: string[];
  governancePillarRole: string; // Pilar yang menaungi produk ini
}

/**
 * MASTER PRODUCT CATALOG (8 MODULAR PRODUCTS)
 */
export const MODULAR_PRODUCT_CATALOG: Record<ProductCode, ModularProduct> = {
  hafalan: {
    code: 'hafalan',
    name: 'Laporan Hafalan Santri (Tahfidz)',
    category: 'AKADEMIK',
    description: 'Pencatatan target, capaian, dan progres hafalan Al-Qur\'an, Hadits, & Matan Kitab santri.',
    includedInFreeZakat: true,
    pricingType: 'FREE_ZAKAT',
    maxStudentsFreeZakat: 50,
    routes: ['/akademik/tahfidz'],
    features: [
      'Daftar Santri & Mutaba\'ah Hafalan',
      'Target & Capaian Juz / Surah',
      'Progres Hafalan Real-Time',
      'Riwayat Setoran & Nilai Tajwid',
      'Laporan Hasil Hafalan per Santri',
      'Laporan Kelompok / Halaqah'
    ],
    governancePillarRole: 'mudir' // Pilar 5: Mudir KBM & Tahfidz
  },

  presensi: {
    code: 'presensi',
    name: 'Absensi & Presensi Santri',
    category: 'KESANTRIAN',
    description: 'Pencatatan kehadiran santri di asrama, sholat berjamaah 5 waktu, dan kegiatan KBM.',
    includedInFreeZakat: true,
    pricingType: 'FREE_ZAKAT',
    maxStudentsFreeZakat: 50,
    routes: ['/presensi/santri', '/presensi'],
    features: [
      'Daftar Santri per Rombel / Kamar',
      'Input Absensi Harian Santri (Hadir/Izin/Sakit/Alpa)',
      'Status Kehadiran Sholat Berjamaah & Apel',
      'Riwayat & Rekapitulasi Presensi',
      'Laporan Kehadiran Santri Bulanan'
    ],
    governancePillarRole: 'mudir' // Pilar 5: Mudir / Kesantrian
  },

  rapot: {
    code: 'rapot',
    name: 'e-Rapot & Penilaian KBM',
    category: 'AKADEMIK',
    description: 'Jurnal mengajar guru, nilai harian, ulangan, tugas, remedial, dan cetak rapot digital.',
    includedInFreeZakat: false,
    pricingType: 'COMMERCIAL_ADDON',
    routes: ['/akademik/nilai'],
    features: [
      'Jurnal Mengajar Guru KBM',
      'Penilaian Harian & Formatif',
      'Penilaian Sumatif & Ujian',
      'Evaluasi Remedial KBM',
      'Rekapitulasi Nilai & e-Rapot Santri'
    ],
    governancePillarRole: 'mudir' // Pilar 5: Mudir
  },

  adab: {
    code: 'adab',
    name: 'e-Adab & Kedisiplinan Tarbawi',
    category: 'KESANTRIAN',
    description: 'Pencatatan adab harian santri, poin reward prestasi mulia, dan pelanggaran tarbawi.',
    includedInFreeZakat: false,
    pricingType: 'COMMERCIAL_ADDON',
    routes: ['/akademik/disiplin'],
    features: [
      'Pencatatan Poin Karakter & Adab Sunnah',
      'Reward & Prestasi Mulia Santri',
      'Pelanggaran Disiplin & Poin Tarbawi',
      'Rekomendasi Tindakan & Iqob Edukatif',
      'Laporan Perkembangan Akhlak Santri'
    ],
    governancePillarRole: 'mudir' // Pilar 5: Mudir / Kesantrian
  },

  izin: {
    code: 'izin',
    name: 'e-Izin Santri & Gerbang Scanner',
    category: 'KEAMANAN',
    description: 'Manajemen perizinan santri pulang/keluar kampus, QR Gate Pass, scanner satpam, & case review keterlambatan.',
    includedInFreeZakat: false,
    pricingType: 'COMMERCIAL_ADDON',
    routes: ['/akademik/perizinan'],
    features: [
      'Formulir Pengajuan Izin Keluar / Pulang',
      'Verifikasi Izin oleh Kesantrian',
      'Penerbitan Digital QR Gate Pass',
      'Scanner Check-Out & Check-In Pos Satpam',
      'Deteksi Terlambat & Case Review Keterlambatan'
    ],
    governancePillarRole: 'mudir' // Pilar 5: Mudir / Kesantrian & RT
  },

  hrd: {
    code: 'hrd',
    name: 'Tata Kelola SDM & Kepegawaian (HRD)',
    category: 'ORGANISASI',
    description: 'Direktori dewan asatidz & staf, cuti mandiri, penilaian kinerja berbasis eviden, & 4-pintu clearance offboarding.',
    includedInFreeZakat: false,
    pricingType: 'COMMERCIAL_ADDON',
    routes: ['/kepegawaian'],
    features: [
      'Direktori Asatidz, Musyrif, & Pegawai',
      'Pengajuan & Approval Cuti Mandiri Staf',
      'Penilaian Kinerja Berbasis Eviden (SLA/Log)',
      'Penjatuhan Sanksi Disiplin Pegawai (SP1-3)',
      'Alur 4-Pintu Clearance Offboarding (RT, Keuangan, HRD, IT)',
      'Enforcement Section 7 Gaji Terkunci (Zero Leakage)'
    ],
    governancePillarRole: 'kepala_kepegawaian' // Pilar 3: Ka. HRD
  },

  finance: {
    code: 'finance',
    name: 'Keuangan & SPP Pesantren',
    category: 'FINANSIAL',
    description: 'Tagihan SPP bulanan, validasi bukti transfer wali santri, approval pengeluaran bertingkat, & pagu threshold.',
    includedInFreeZakat: false,
    pricingType: 'COMMERCIAL_ADDON',
    routes: [
      '/finance',
      '/finance/spp',
      '/finance/validasi',
      '/finance/pengeluaran',
      '/finance/pengaturan-threshold',
      '/finance/uang-jajan'
    ],
    features: [
      'Tagihan & Invoice SPP Santri Massal',
      'Validasi Bukti Transfer Wali & Kuitansi WA',
      'Persetujuan Pengeluaran Bertingkat (Threshold Matrix)',
      'Batas Kewenangan Pengeluaran Dana Yayasan',
      'Buku Besar Double-Entry Kas & Pendapatan SPP'
    ],
    governancePillarRole: 'keuangan' // Pilar 4: Ka. Keuangan & Pilar 2: Wakil Yayasan
  },

  rumah_tangga: {
    code: 'rumah_tangga',
    name: 'Rumah Tangga & Sarpras Operasional',
    category: 'OPERASIONAL',
    description: 'Manajemen fasilitas, logistik dapur umum 450 santri, sentral laundry, gudang inventaris, & pengajuan kebutuhan.',
    includedInFreeZakat: false,
    pricingType: 'COMMERCIAL_ADDON',
    routes: ['/rumah-tangga', '/rumah-tangga/pengajuan'],
    features: [
      'Hub Fasilitas & Gudang Sarpras',
      'Monitoring Stok Dapur Umum & Logistik Konsumsi',
      'Sentral Laundry & Sanitasi Pakaian Santri',
      'Pengajuan Kebutuhan Operasional Non-Moneter',
      'Plafon Anggaran Operasional Bulanan KaBid RT'
    ],
    governancePillarRole: 'kepala_rumah_tangga' // Pilar 6: Ka. Rumah Tangga
  }
};

/**
 * CORE PLATFORM FOUNDATION
 * Fondasi bersama yang selalu aktif untuk setiap tenant.
 */
export const CORE_PLATFORM_CAPABILITIES = {
  name: 'Core Platform KabarSantri v2.0',
  description: 'Fondasi bersama multi-tenant yang mendasari seluruh produk modular.',
  modules: [
    'Tenant Master & Multi-Tenant Isolation',
    'User Management & Authentication',
    'Role & Permission Authorization',
    'Santri Master Data (Sesuai Batas Kuota)',
    'Wali Santri & Portal Akses Wali',
    'Sistem Notifikasi & WhatsApp Queue',
    'Audit Trail & Immutable Governance Logs',
    'Tenant Feature Entitlement Engine'
  ],
  routes: [
    '/',
    '/login',
    '/dashboard',
    '/santri',
    '/santri/list',
    '/santri/create',
    '/wali/list',
    '/portal-wali',
    '/super-admin'
  ]
} as const;

/**
 * Get product code from a requested URL route
 */
export function getProductCodeByRoute(routePath: string): ProductCode | null {
  for (const product of Object.values(MODULAR_PRODUCT_CATALOG)) {
    if (product.routes.some(r => routePath === r || routePath.startsWith(r + '/') || routePath.startsWith(r + '?'))) {
      return product.code;
    }
  }
  return null;
}
