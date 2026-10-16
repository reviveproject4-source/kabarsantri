/**
 * KabarSantri v2.0 - Unified Shared Data Store
 * Menyinkronkan data antar-halaman secara reaktif via localStorage,
 * Supabase DB, dan Custom Browser Events.
 */

export function isTenantMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (typeof window.location !== 'undefined' && window.location.search) {
      if (window.location.search.includes('mode=tenant')) return true;
      if (window.location.search.includes('mode=demo')) return false;
    }
    const mode = localStorage.getItem('ks_app_mode_v2');
    if (mode === 'tenant') return true;
    if (document.cookie.includes('ks_app_mode=tenant')) return true;
    return false;
  } catch {
    return false;
  }
}

// Automatic one-time purge of residual mock data in browser storage
if (typeof window !== 'undefined') {
  try {
    const isTenant = isTenantMode();
    const PURGE_FLAG = 'ks_tenant_live_clean_v7';
    if (isTenant && !localStorage.getItem(PURGE_FLAG)) {
      // 1. Purge legacy mock santri from tenant storage
      const rawSantri = localStorage.getItem('ks_tenant_santri_list_v1');
      if (rawSantri) {
        const parsed = JSON.parse(rawSantri);
        const demoKeywords = ['hasan', 'usamah', 'salman', 'fatih', 'zaki', 'bilal', 'fathimah', 'al-fatih'];
        const cleaned = (parsed || []).filter((s: any) => {
          const nameLower = (s.nama || '').toLowerCase();
          return !demoKeywords.some(kw => nameLower.includes(kw)) && !s.nis?.startsWith('202601') && !s.nis?.startsWith('202602');
        });
        localStorage.setItem('ks_tenant_santri_list_v1', JSON.stringify(cleaned));
      }
      // 2. Purge legacy mock employee from tenant storage
      const rawEmp = localStorage.getItem('ks_tenant_kepegawaian_store_v1');
      if (rawEmp) {
        const parsed = JSON.parse(rawEmp);
        if (parsed.employees) {
          parsed.employees = parsed.employees.filter((e: any) => 
            !e.id?.startsWith('emp-00')
          );
          localStorage.setItem('ks_tenant_kepegawaian_store_v1', JSON.stringify(parsed));
        }
      }
      // 3. Purge legacy mock learning sessions (3 mata pelajaran) from tenant storage
      const rawSessions = localStorage.getItem('ks_tenant_learning_sessions_v1');
      if (rawSessions) {
        try {
          const parsed = JSON.parse(rawSessions);
          const demoKeywords = ['bahasa arab', 'fiqih muamalah', 'aqidah akhlak', 'tahfidz al-qur\'an & tajwid putri', 'fiqih nisa', 'al-fatih', 'zaki', 'hasan'];
          const cleaned = (parsed || []).filter((s: any) => {
            const mapelLower = (s.mata_pelajaran || '').toLowerCase();
            const guruLower = (s.guru_nama || '').toLowerCase();
            return !demoKeywords.some(kw => mapelLower.includes(kw) || guruLower.includes(kw)) && !s.id?.startsWith('ls-');
          });
          localStorage.setItem('ks_tenant_learning_sessions_v1', JSON.stringify(cleaned));
        } catch {
          localStorage.setItem('ks_tenant_learning_sessions_v1', JSON.stringify([]));
        }
      } else {
        localStorage.setItem('ks_tenant_learning_sessions_v1', JSON.stringify([]));
      }
      // 4. Purge legacy mock tahfidz records from tenant storage
      localStorage.setItem('ks_tenant_tahfidz_records_v1', JSON.stringify([]));
      // 5. Purge legacy mock kategori hafalan from tenant storage
      localStorage.setItem('ks_tenant_kategori_hafalan_v1', JSON.stringify([]));

      localStorage.setItem(PURGE_FLAG, 'true');
    }
  } catch {}
}

// ============================================================================
// 1. PENGAJUAN DANA RUMAH TANGGA & KBM
// ============================================================================

export interface PengajuanItem {
  id: string;
  nomor: string;
  divisi: 'Dapur' | 'Laundry' | 'Keamanan' | 'Mudir KBM';
  pemohon: string;
  judul: string;
  nominal: number;
  tanggal: string;
  status: 'MENUNGGU_KEUANGAN' | 'MENUNGGU_WAKIL_YAYASAN' | 'DISETUJUI' | 'DITOLAK';
  level_approval: string;
  deskripsi?: string;
}

export const DEFAULT_PENGAJUAN: PengajuanItem[] = [
  {
    id: 'req-1',
    nomor: 'REQ-202610-001',
    divisi: 'Dapur',
    pemohon: 'Pak Maryono (Koki Dapur)',
    judul: 'Belanja Sayur, Minyak & Bumbu Dapur Pekanan',
    nominal: 750000,
    tanggal: '2026-10-04',
    status: 'MENUNGGU_KEUANGAN',
    level_approval: 'Cukup Bagian Keuangan (< 1 Jt)',
    deskripsi: 'Pengadaan bumbu dapur, sayuran segar, dan minyak goreng untuk 450 santri.',
  },
  {
    id: 'req-2',
    nomor: 'REQ-202610-002',
    divisi: 'Laundry',
    pemohon: 'Ibu Sumiati (Koordinator Laundry)',
    judul: 'Pengadaan Deterjen Matic & Pewangi Pakaian 2 Drum',
    nominal: 2400000,
    tanggal: '2026-10-04',
    status: 'MENUNGGU_WAKIL_YAYASAN',
    level_approval: 'Butuh ACC Keuangan & Notif Wakil Ketua Yayasan',
    deskripsi: 'Stok deterjen laundry asrama santri menipis untuk 2 hari kedepan.',
  },
  {
    id: 'req-3',
    nomor: 'REQ-202610-003',
    divisi: 'Dapur',
    pemohon: 'Pak Maryono (Koki Dapur)',
    judul: 'Pembelian 10 Karung Beras Pandan Wangi (Bulanan)',
    nominal: 7200000,
    tanggal: '2026-10-03',
    status: 'MENUNGGU_WAKIL_YAYASAN',
    level_approval: 'Wajib ACC Wakil Ketua Yayasan (> 5 Jt) & Notifikasi Info Ketua Yayasan',
    deskripsi: 'Pasokan beras pokok bulanan untuk dapur umum asrama.',
  },
  {
    id: 'req-4',
    nomor: 'REQ-202610-004',
    divisi: 'Mudir KBM',
    pemohon: 'Ust. Ahmad Dahlan (Kepala Sekolah)',
    judul: 'Pengadaan Buku Pelajaran Bahasa Arab & Kertas Ujian',
    nominal: 2800000,
    tanggal: '2026-10-03',
    status: 'MENUNGGU_KEUANGAN',
    level_approval: 'Cukup Bagian Keuangan (< 3 Jt)',
    deskripsi: 'Buku matan pegangan santri dan modul KBM semester ganjil.',
  },
  {
    id: 'req-5',
    nomor: 'REQ-202610-005',
    divisi: 'Keamanan',
    pemohon: 'Pak Subandi (Danru Satpam)',
    judul: 'Pengadaan Handy Talkie (HT) & Lampu Senter Patroli',
    nominal: 850000,
    tanggal: '2026-10-02',
    status: 'DISETUJUI',
    level_approval: 'Telah di-ACC Keuangan',
    deskripsi: 'Perlengkapan ronda malam santri dan pos jaga gerbang barat.',
  },
];

export function getSharedPengajuanList(): PengajuanItem[] {
  if (isTenantMode()) {
    try {
      const raw = localStorage.getItem('ks_tenant_pengajuan_dana_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  if (typeof window === 'undefined') return DEFAULT_PENGAJUAN;
  try {
    const raw = localStorage.getItem('ks_pengajuan_dana_v2');
    if (!raw) {
      localStorage.setItem('ks_pengajuan_dana_v2', JSON.stringify(DEFAULT_PENGAJUAN));
      return DEFAULT_PENGAJUAN;
    }
    const parsed: PengajuanItem[] = JSON.parse(raw);
    let hasMigrated = false;
    const migrated = parsed.map(item => {
      if ((item.status as any) === 'MENUNGGU_KETUA_YAYASAN') {
        hasMigrated = true;
        return {
          ...item,
          status: 'MENUNGGU_WAKIL_YAYASAN' as const,
          level_approval: 'Wajib ACC Wakil Ketua Yayasan (> 5 Jt) & Notifikasi Info Ketua Yayasan'
        };
      }
      return item;
    });
    if (hasMigrated) {
      localStorage.setItem('ks_pengajuan_dana_v2', JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return DEFAULT_PENGAJUAN;
  }
}

export function saveSharedPengajuan(item: Omit<PengajuanItem, 'id' | 'nomor' | 'tanggal'>): PengajuanItem {
  const current = getSharedPengajuanList();
  const newItem: PengajuanItem = {
    ...item,
    id: `req-${Date.now()}`,
    nomor: `REQ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(100 + Math.random() * 900))}`,
    tanggal: new Date().toISOString().split('T')[0],
  };

  const updated = [newItem, ...current];
  if (typeof window !== 'undefined') {
    if (isTenantMode()) {
      localStorage.setItem('ks_tenant_pengajuan_dana_v1', JSON.stringify(updated));
    } else {
      localStorage.setItem('ks_pengajuan_dana_v2', JSON.stringify(updated));
    }
    window.dispatchEvent(new CustomEvent('ks_expense_updated', { detail: newItem }));
  }
  return newItem;
}

export function updatePengajuanStatus(id: string, status: PengajuanItem['status'], level_approval?: string) {
  const current = getSharedPengajuanList();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        status,
        ...(level_approval ? { level_approval } : {}),
      };
    }
    return item;
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem('ks_pengajuan_dana_v2', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ks_expense_updated'));
  }
  return updated;
}


// ============================================================================
// 2. ATUR BATAS THRESHOLD MANDIRI (KETUA & WAKIL KETUA YAYASAN)
// ============================================================================

export interface ThresholdSettings {
  max_keuangan_rumah_tangga: number; // Default: 1.000.000 (Dapur, Laundry, Keamanan)
  max_keuangan_kbm_mudir: number;    // Default: 3.000.000 (Mudir KBM)
  min_yayasan_approval: number;      // Default: 5.000.000 (Wakil & Ketua Yayasan)
}

export const DEFAULT_THRESHOLDS: ThresholdSettings = {
  max_keuangan_rumah_tangga: 1000000,
  max_keuangan_kbm_mudir: 3000000,
  min_yayasan_approval: 5000000,
};

export function getSharedThresholds(): ThresholdSettings {
  if (typeof window === 'undefined') return DEFAULT_THRESHOLDS;
  try {
    const raw = localStorage.getItem('ks_threshold_settings_v2');
    if (!raw) {
      localStorage.setItem('ks_threshold_settings_v2', JSON.stringify(DEFAULT_THRESHOLDS));
      return DEFAULT_THRESHOLDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_THRESHOLDS;
  }
}

export function saveSharedThresholds(settings: ThresholdSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ks_threshold_settings_v2', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('ks_threshold_updated', { detail: settings }));
  }
}


// ============================================================================
// 3. MASTER REKENING BANK PESANTREN (2 ATAU 3 REKENING BERBEDA FUNGSI)
// ============================================================================

export interface RekeningPesantren {
  id: string;
  nama_bank: string;
  nomor_rekening: string;
  atas_nama: string;
  fungsi: 'operasional_spp' | 'kantin_tabungan' | 'donasi_wakaf' | 'custom';
  fungsi_label?: string;
  cakupan_pembayaran: string[];
  pengelola: string; // 'Bagian Keuangan' | 'Bagian Kesantrian' | 'Bendahara Yayasan' | custom manual input
  keterangan: string;
  is_active: boolean;
}

export const DEFAULT_REKENING: RekeningPesantren[] = [
  {
    id: 'rek-1',
    nama_bank: 'Bank Syariah Indonesia (BSI)',
    nomor_rekening: '7142098811',
    atas_nama: 'Yayasan Pondok Pesantren KabarSantri (Keuangan)',
    fungsi: 'operasional_spp',
    fungsi_label: 'Rekening Pendidikan, SPP & Operasional',
    cakupan_pembayaran: ['SPP Bulanan', 'Tunggakan', 'Daftar Ulang', 'Uang Pendaftaran (PPDB)', 'Biaya Laundry'],
    pengelola: 'Bagian Keuangan',
    keterangan: 'Rekening penerimaan resmi kas pendidikan & operasional kampus, dikelola Bagian Keuangan.',
    is_active: true,
  },
  {
    id: 'rek-2',
    nama_bank: 'Bank Muamalat',
    nomor_rekening: '1098445521',
    atas_nama: 'Pengelola Uang Jajan & Tabungan Santri',
    fungsi: 'kantin_tabungan',
    fungsi_label: 'Rekening Dompet Santri & E-Pocket Kantin',
    cakupan_pembayaran: ['Uang Jajan Santri', 'Tabungan Santri'],
    pengelola: 'Bagian Kesantrian',
    keterangan: 'Rekening khusus simpanan santri dan top-up e-pocket kantin asrama, dikelola Bagian Kesantrian.',
    is_active: true,
  },
  {
    id: 'rek-3',
    nama_bank: 'Bank Mandiri Syariah / BSI Infaq',
    nomor_rekening: '8899002233',
    atas_nama: 'Lazis & Wakaf Yayasan KabarSantri',
    fungsi: 'donasi_wakaf',
    fungsi_label: 'Rekening Sosial, Wakaf & Donasi',
    cakupan_pembayaran: ['Donasi Bebas', 'Infaq Gedung', 'Zakat & Wakaf Produktif'],
    pengelola: 'Bendahara Yayasan',
    keterangan: 'Rekening penghimpunan dana sosial umat & pembangunan pondok, diawasi langsung oleh Yayasan.',
    is_active: true,
  },
];

export function getSharedRekeningList(): RekeningPesantren[] {
  if (typeof window === 'undefined') return DEFAULT_REKENING;
  try {
    const raw = localStorage.getItem('ks_rekening_yayasan_v2');
    if (!raw) {
      localStorage.setItem('ks_rekening_yayasan_v2', JSON.stringify(DEFAULT_REKENING));
      return DEFAULT_REKENING;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_REKENING;
  }
}

export function saveSharedRekeningList(list: RekeningPesantren[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ks_rekening_yayasan_v2', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('ks_rekening_updated', { detail: list }));
  }
}


// ============================================================================
// 4. PRESENSI SEMUA PEGAWAI (GURU, MUSYRIF, RUMAH TANGGA: DAPUR, LAUNDRY, SATPAM)
// Status: Masuk, Pulang, Ijin, Sakit, Cuti
// Guru: Tercatat Tempat, Tanggal, dan Waktu Presisi
// ============================================================================

export interface PresensiPegawaiRecord {
  id: string;
  pegawai_nama: string;
  nip: string;
  jabatan: 'Guru KBM' | 'Musyrif Asrama' | 'Koki Dapur' | 'Staf Laundry' | 'Satpam / Keamanan' | 'Staf Keuangan';
  divisi: 'Akademik' | 'Kesantrian' | 'Rumah Tangga' | 'Keuangan';
  status: 'masuk' | 'pulang' | 'ijin' | 'sakit' | 'cuti';
  tempat: string; // Tempat/Ruang/Lokasi geofence (khususnya untuk Guru KBM)
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:MM:SS WIB
  keterangan?: string;
  lampiran?: string;
}

const DEFAULT_PRESENSI_HISTORY: PresensiPegawaiRecord[] = [
  {
    id: 'pr-1',
    pegawai_nama: 'Ust. Ahmad Dahlan, S.Pd.I',
    nip: '1984021001',
    jabatan: 'Guru KBM',
    divisi: 'Akademik',
    status: 'masuk',
    tempat: 'Ruang Kelas 7A - Gedung Ibnu Khaldun',
    tanggal: '2026-10-04',
    waktu: '06:45:12 WIB',
    keterangan: 'Mengajar Fiqih Muamalah Jam ke-1',
  },
  {
    id: 'pr-2',
    pegawai_nama: 'Pak Maryono',
    nip: '1989052002',
    jabatan: 'Koki Dapur',
    divisi: 'Rumah Tangga',
    status: 'masuk',
    tempat: 'Dapur Utama & Gudang Logistik Santri',
    tanggal: '2026-10-04',
    waktu: '05:30:20 WIB',
    keterangan: 'Persiapan sarapan pagi 450 santri',
  },
  {
    id: 'pr-3',
    pegawai_nama: 'Pak Subandi',
    nip: '1978031503',
    jabatan: 'Satpam / Keamanan',
    divisi: 'Rumah Tangga',
    status: 'masuk',
    tempat: 'Pos Jaga Gerbang Utama & Portal QR',
    tanggal: '2026-10-04',
    waktu: '06:00:00 WIB',
    keterangan: 'Serah terima dinas shift pagi',
  },
  {
    id: 'pr-4',
    pegawai_nama: 'Ibu Sumiati',
    nip: '1987111004',
    jabatan: 'Staf Laundry',
    divisi: 'Rumah Tangga',
    status: 'masuk',
    tempat: 'Ruang Laundry Gedung Khodijah',
    tanggal: '2026-10-04',
    waktu: '07:05:44 WIB',
    keterangan: 'Pencucian seragam santri asrama putra',
  },
  {
    id: 'pr-5',
    pegawai_nama: 'Ust. Hamzah, Lc.',
    nip: '1985091205',
    jabatan: 'Musyrif Asrama',
    divisi: 'Kesantrian',
    status: 'masuk',
    tempat: 'Masjid Jami\' Kampus - Sesi Subuh',
    tanggal: '2026-10-04',
    waktu: '04:20:15 WIB',
    keterangan: 'Imam & presensi sholat subuh berjamaah',
  },
  {
    id: 'pr-6',
    pegawai_nama: 'Usth. Maryam S.Pd',
    nip: '1992010406',
    jabatan: 'Guru KBM',
    divisi: 'Akademik',
    status: 'ijin',
    tempat: 'Rumah (Surat Ijin Terlampir)',
    tanggal: '2026-10-04',
    waktu: '07:00:00 WIB',
    keterangan: 'Ijin menghadiri seminar pendidikan Kemenag',
  },
];

export function getSharedPresensiList(forceTenantMode?: boolean): PresensiPegawaiRecord[] {
  const isTenant = forceTenantMode ?? isTenantMode();
  if (isTenant) {
    try {
      const raw = localStorage.getItem('ks_tenant_presensi_pegawai_v1');
      if (!raw) return [];
      const parsed: PresensiPegawaiRecord[] = JSON.parse(raw);
      // Sanitasi ketat: Data dummy demo sama sekali dilarang ada di tenant live
      const DEMO_STAFF_NAMES = [
        'Ust. Lukman Hakim, S.Pd.I.', 'Pak Maryono', 'Pak Subandi', 
        'Ibu Sumiati', 'Ust. Hamzah, Lc.', 'Usth. Maryam S.Pd', 
        'KH. Abdullah Faqih, Lc.', 'Ust. H. Fauzan Mansur, Lc.'
      ];
      const cleaned = parsed.filter(p => !DEMO_STAFF_NAMES.includes(p.pegawai_nama));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem('ks_tenant_presensi_pegawai_v1', JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  }
  if (typeof window === 'undefined') return DEFAULT_PRESENSI_HISTORY;
  try {
    const raw = localStorage.getItem('ks_presensi_pegawai_v2');
    if (!raw) {
      localStorage.setItem('ks_presensi_pegawai_v2', JSON.stringify(DEFAULT_PRESENSI_HISTORY));
      return DEFAULT_PRESENSI_HISTORY;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRESENSI_HISTORY;
  }
}

export function saveSharedPresensi(record: Omit<PresensiPegawaiRecord, 'id'>): PresensiPegawaiRecord {
  const current = getSharedPresensiList();
  const newRec: PresensiPegawaiRecord = {
    ...record,
    id: `pr-${Date.now()}`,
  };

  const updated = [newRec, ...current];
  if (typeof window !== 'undefined') {
    if (isTenantMode()) {
      localStorage.setItem('ks_tenant_presensi_pegawai_v1', JSON.stringify(updated));
    } else {
      localStorage.setItem('ks_presensi_pegawai_v2', JSON.stringify(updated));
    }
    window.dispatchEvent(new CustomEvent('ks_presensi_updated', { detail: newRec }));
  }
  return newRec;
}


// ============================================================================
// 5. MASTER KELAS, SANTRI & KATEGORI HAFALAN (AL-QUR'AN, HADIS, KITAB, KUSTOM)
// ============================================================================

export interface KelasItem {
  id: string;
  nama_kelas: string;
  wali_kelas: string;
  jumlah_santri: number;
  gender: 'ikhwan' | 'akhwat';
  kampus: 'Kampus Putra (Ikhwan)' | 'Kampus Putri (Akhwat)';
}

export interface SantriOption {
  nis: string;
  nama: string;
  kelas_id: string;
  gender: 'ikhwan' | 'akhwat';
  id?: string;
  kelas?: string;
  kamar?: string;
  wali_nama?: string;
  wali_kontak?: string;
  status?: string;
  lifecycle_status?: string;
}

export const MASTER_KELAS: KelasItem[] = [
  { id: 'k-7a', nama_kelas: 'Kelas 7A Tahfidz Putra', wali_kelas: 'Ust. Ahmad Dahlan, S.Pd.I', jumlah_santri: 30, gender: 'ikhwan', kampus: 'Kampus Putra (Ikhwan)' },
  { id: 'k-7b', nama_kelas: 'Kelas 7B Tahfidz Putra', wali_kelas: 'Ust. Hamzah, Lc.', jumlah_santri: 30, gender: 'ikhwan', kampus: 'Kampus Putra (Ikhwan)' },
  { id: 'k-8a', nama_kelas: 'Kelas 8A Unggulan Putra', wali_kelas: 'Ust. Bilal Habasyi', jumlah_santri: 28, gender: 'ikhwan', kampus: 'Kampus Putra (Ikhwan)' },
  { id: 'k-8b', nama_kelas: 'Kelas 8B Unggulan Putri', wali_kelas: 'Usth. Fatimah Az-Zahra, S.Pd.', jumlah_santri: 28, gender: 'akhwat', kampus: 'Kampus Putri (Akhwat)' },
  { id: 'k-9a', nama_kelas: 'Kelas 9A Putra Al-Qur\'an', wali_kelas: 'Ust. Lukman Hakim, M.Kom.', jumlah_santri: 26, gender: 'ikhwan', kampus: 'Kampus Putra (Ikhwan)' },
  { id: 'k-9b', nama_kelas: 'Kelas 9B Putri Al-Qur\'an', wali_kelas: 'Usth. Maryam, S.Pd.', jumlah_santri: 26, gender: 'akhwat', kampus: 'Kampus Putri (Akhwat)' },
];

export function getSharedMasterKelas(): KelasItem[] {
  if (isTenantMode()) {
    try {
      const raw = localStorage.getItem('ks_tenant_master_kelas_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  if (typeof window === 'undefined') return MASTER_KELAS;
  try {
    const raw = localStorage.getItem('ks_master_kelas_v3');
    if (!raw) {
      localStorage.setItem('ks_master_kelas_v3', JSON.stringify(MASTER_KELAS));
      return MASTER_KELAS;
    }
    return JSON.parse(raw);
  } catch {
    return MASTER_KELAS;
  }
}

export function addNewMasterKelas(kelas: Omit<KelasItem, 'id'>): KelasItem {
  const current = getSharedMasterKelas();
  const newKelas: KelasItem = {
    ...kelas,
    id: `k-${Date.now()}`
  };
  const updated = [...current, newKelas];
  if (typeof window !== 'undefined') {
    const key = isTenantMode() ? 'ks_tenant_master_kelas_v1' : 'ks_master_kelas_v3';
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ks_master_kelas_updated', { detail: updated }));
  }
  return newKelas;
}

export const MASTER_SANTRI: SantriOption[] = [
  // Santri Ikhwan (Putra) - Diajar & Dibimbing oleh Asatidz Ikhwan
  { nis: '202601001', nama: 'Muhammad Al-Fatih', kelas_id: 'k-7a', gender: 'ikhwan' },
  { nis: '202601015', nama: 'Ahmad Zaki Mubarak', kelas_id: 'k-7a', gender: 'ikhwan' },
  { nis: '202601022', nama: 'Hasan Al-Banna', kelas_id: 'k-7a', gender: 'ikhwan' },
  { nis: '202601031', nama: 'Umar Faruq', kelas_id: 'k-7a', gender: 'ikhwan' },

  { nis: '202601018', nama: 'Bilal Habasyi', kelas_id: 'k-7b', gender: 'ikhwan' },
  { nis: '202601025', nama: 'Usamah bin Zaid', kelas_id: 'k-7b', gender: 'ikhwan' },
  { nis: '202601034', nama: 'Ali Zainal Abidin', kelas_id: 'k-7b', gender: 'ikhwan' },
  { nis: '202601040', nama: 'Salman Al-Farisi', kelas_id: 'k-7b', gender: 'ikhwan' },

  { nis: '202601021', nama: 'Fatih Al-Ayyubi', kelas_id: 'k-8a', gender: 'ikhwan' },
  { nis: '202601050', nama: 'Thoriq bin Ziyad', kelas_id: 'k-8a', gender: 'ikhwan' },
  { nis: '202601055', nama: 'Khalid bin Walid', kelas_id: 'k-8a', gender: 'ikhwan' },

  { nis: '202601060', nama: 'Abdullah bin Mas\'ud', kelas_id: 'k-9a', gender: 'ikhwan' },
  { nis: '202601065', nama: 'Mu\'adz bin Jabal', kelas_id: 'k-9a', gender: 'ikhwan' },
  { nis: '202601070', nama: 'Zaid bin Tsabit', kelas_id: 'k-9a', gender: 'ikhwan' },

  // Santri Akhwat (Putri) - Diajar & Dibimbing oleh Ustadzah Akhwat
  { nis: '202602004', nama: 'Fathimah Az-Zahra', kelas_id: 'k-8b', gender: 'akhwat' },
  { nis: '202602012', nama: 'Maryam Al-Batul', kelas_id: 'k-8b', gender: 'akhwat' },
  { nis: '202602019', nama: 'Aisyah Humaira', kelas_id: 'k-8b', gender: 'akhwat' },
  { nis: '202602025', nama: 'Hafshah binti Umar', kelas_id: 'k-8b', gender: 'akhwat' },
  { nis: '202602030', nama: 'Zainab Al-Kubra', kelas_id: 'k-9b', gender: 'akhwat' },
  { nis: '202602035', nama: 'Khadijah Al-Kubro', kelas_id: 'k-9b', gender: 'akhwat' },
];

export function getSharedSantriList(forceTenantMode?: boolean): SantriOption[] {
  const isTenant = forceTenantMode ?? isTenantMode();
  if (isTenant) {
    try {
      const raw = localStorage.getItem('ks_tenant_santri_list_v1');
      if (!raw) return [];
      const parsed: SantriOption[] = JSON.parse(raw);
      // Sanitasi ketat: Seluruh 20 data dummy nama & NIS santri demo sama sekali dilarang ada di tenant live
      const demoNames = MASTER_SANTRI.map(s => s.nama.toLowerCase());
      const demoNis = MASTER_SANTRI.map(s => s.nis);
      const cleaned = parsed.filter(s => {
        const nameLower = (s.nama || '').trim().toLowerCase();
        const isMasterName = demoNames.includes(nameLower);
        const isMasterNis = demoNis.includes(s.nis);
        const isDemoKeyword = nameLower.includes('al-fatih') || 
          nameLower.includes('hasan al-banna') || 
          nameLower.includes('usamah bin zaid') || 
          nameLower.includes('salman al-farisi') ||
          nameLower.includes('zaki') ||
          nameLower.includes('bilal') ||
          nameLower.includes('fathimah');
        return !isMasterName && !isMasterNis && !isDemoKeyword;
      });
      if (cleaned.length !== parsed.length) {
        localStorage.setItem('ks_tenant_santri_list_v1', JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  }
  return MASTER_SANTRI;
}

export function resetTenantStorageData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ks_tenant_santri_list_v1');
    localStorage.removeItem('ks_tenant_presensi_pegawai_v1');
    localStorage.removeItem('ks_tenant_master_kelas_v1');
    localStorage.removeItem('ks_tenant_tahfidz_records_v1');
    localStorage.removeItem('ks_tenant_kepegawaian_store_v1');
    window.dispatchEvent(new CustomEvent('ks_tenant_santri_updated', { detail: [] }));
    window.dispatchEvent(new CustomEvent('ks_presensi_updated', { detail: null }));
  }
}

export function saveTenantSantri(santri: SantriOption): SantriOption[] {
  const current = getSharedSantriList();
  const updated = [santri, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem('ks_tenant_santri_list_v1', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ks_tenant_santri_updated', { detail: updated }));
  }
  return updated;
}

export interface KategoriHafalan {
  id: string;
  tipe: 'quran' | 'hadis' | 'kitab' | 'custom_yayasan';
  tipe_label: string;
  nama_materi: string;
  sub_materi: string;
}

const DEFAULT_KATEGORI_HAFALAN: KategoriHafalan[] = [
  { id: 'kh-1', tipe: 'quran', tipe_label: "Al-Qur'an", nama_materi: "Juz 30 (Juz 'Amma)", sub_materi: "Surah An-Naba s.d An-Nas" },
  { id: 'kh-2', tipe: 'quran', tipe_label: "Al-Qur'an", nama_materi: "Juz 29 (Tabarak)", sub_materi: "Surah Al-Mulk s.d Al-Mursalat" },
  { id: 'kh-3', tipe: 'quran', tipe_label: "Al-Qur'an", nama_materi: "Juz 1 s.d 5 (Baqarah - Nisa)", sub_materi: "Surah Al-Baqarah" },
  { id: 'kh-4', tipe: 'hadis', tipe_label: 'Hadis Nabawi', nama_materi: "Arba'in An-Nawawi (42 Hadis)", sub_materi: "Hadis 1 s.d 10 (Niat - Ihsan)" },
  { id: 'kh-5', tipe: 'hadis', tipe_label: 'Hadis Nabawi', nama_materi: 'Bulughul Maram', sub_materi: 'Kitab Thaharah & Shalat' },
  { id: 'kh-6', tipe: 'hadis', tipe_label: 'Hadis Nabawi', nama_materi: 'Riyadhus Shalihin', sub_materi: 'Bab Ikhlas & Sabar' },
  { id: 'kh-7', tipe: 'kitab', tipe_label: 'Kitab Kuning / Matan', nama_materi: 'Matan Al-Jurumiyah (Nahwu)', sub_materi: 'Bab Kalam s.d I\'rab' },
  { id: 'kh-8', tipe: 'kitab', tipe_label: 'Kitab Kuning / Matan', nama_materi: 'Matan Safinatun Najah (Fiqih)', sub_materi: 'Fasal Rukun Islam & Syarat Sholat' },
  { id: 'kh-9', tipe: 'kitab', tipe_label: 'Kitab Kuning / Matan', nama_materi: 'Aqidatul Awam (Tauhid)', sub_materi: 'Bait 1 s.d 57 (Sifat Wajib Allah & Rasul)' },
  { id: 'kh-10', tipe: 'kitab', tipe_label: 'Kitab Kuning / Matan', nama_materi: 'Tuhfatul Athfal (Tajwid)', sub_materi: 'Ahkamun Nun Sakinah & Tanwin' },
  { id: 'kh-11', tipe: 'custom_yayasan', tipe_label: 'Kustom Yayasan', nama_materi: 'Dzikir Pagi Petang & Doa Ma\'tsurat', sub_materi: 'Hafalan Wajib Santri Asrama' },
];

export function getSharedKategoriHafalan(): KategoriHafalan[] {
  if (isTenantMode()) {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('ks_tenant_kategori_hafalan_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  if (typeof window === 'undefined') return DEFAULT_KATEGORI_HAFALAN;
  try {
    const raw = localStorage.getItem('ks_kategori_hafalan_v2');
    if (!raw) {
      localStorage.setItem('ks_kategori_hafalan_v2', JSON.stringify(DEFAULT_KATEGORI_HAFALAN));
      return DEFAULT_KATEGORI_HAFALAN;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_KATEGORI_HAFALAN;
  }
}

export function addSharedKategoriHafalan(item: Omit<KategoriHafalan, 'id'>): KategoriHafalan {
  const current = getSharedKategoriHafalan();
  const newItem: KategoriHafalan = {
    ...item,
    id: `kh-${Date.now()}`,
  };

  const updated = [...current, newItem];
  if (typeof window !== 'undefined') {
    const key = isTenantMode() ? 'ks_tenant_kategori_hafalan_v1' : 'ks_kategori_hafalan_v2';
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ks_hafalan_updated', { detail: newItem }));
  }
  return newItem;
}

export interface SetoranTahfidzRecord {
  id: string;
  santri: string;
  nis: string;
  kelas_id: string;
  kelas_nama: string;
  gender: 'ikhwan' | 'akhwat';
  tipe_hafalan: 'quran' | 'hadis' | 'kitab' | 'custom_yayasan';
  kategori_label: string;
  nama_materi: string;
  rincian_hafalan: string;
  kelancaran: number;
  tajwid: number;
  makhraj: number;
  is_lulus: boolean;
  musyrif: string;
  tanggal: string;
  catatan?: string;
  juz?: number;
  halaman?: string;
  jenis_setoran?: 'ZIYADAH' | 'MURAJAAH';
}

const DEFAULT_SETORAN_RECORDS: SetoranTahfidzRecord[] = [
  {
    id: 'st-1',
    santri: 'Muhammad Al-Fatih',
    nis: '202601001',
    kelas_id: 'k-7a',
    kelas_nama: 'Kelas 7A Tahfidz Putra',
    gender: 'ikhwan',
    tipe_hafalan: 'quran',
    kategori_label: "Al-Qur'an",
    nama_materi: "Juz 30 (Juz 'Amma)",
    rincian_hafalan: 'Surah An-Naba: Ayat 1 - 40',
    kelancaran: 95,
    tajwid: 92,
    makhraj: 94,
    is_lulus: true,
    musyrif: 'Ust. Ahmad Dahlan, S.Pd.I',
    tanggal: '2026-10-04',
    catatan: 'Tartil & mutqin, makharijul huruf fasih santri putra.',
  },
  {
    id: 'st-2',
    santri: 'Fathimah Az-Zahra',
    nis: '202602004',
    kelas_id: 'k-8b',
    kelas_nama: 'Kelas 8B Putri (Akhwat)',
    gender: 'akhwat',
    tipe_hafalan: 'quran',
    kategori_label: "Al-Qur'an",
    nama_materi: 'Juz 29 (Tabarak)',
    rincian_hafalan: 'Surah Al-Mulk: Ayat 1 - 30',
    kelancaran: 98,
    tajwid: 96,
    makhraj: 97,
    is_lulus: true,
    musyrif: 'Usth. Maryam, S.Pd.',
    tanggal: '2026-10-04',
    catatan: 'Mumtazah, tajwid sempurna tanpa salah.',
  },
];

export function getSharedTahfidzSetoran(): SetoranTahfidzRecord[] {
  if (isTenantMode()) {
    try {
      const raw = localStorage.getItem('ks_tenant_tahfidz_records_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  if (typeof window === 'undefined') return DEFAULT_SETORAN_RECORDS;
  try {
    const raw = localStorage.getItem('ks_tahfidz_records_v1');
    if (!raw) {
      localStorage.setItem('ks_tahfidz_records_v1', JSON.stringify(DEFAULT_SETORAN_RECORDS));
      return DEFAULT_SETORAN_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SETORAN_RECORDS;
  }
}

export function addSharedTahfidzSetoran(record: Omit<SetoranTahfidzRecord, 'id'>): SetoranTahfidzRecord {
  const current = getSharedTahfidzSetoran();
  const newRec: SetoranTahfidzRecord = {
    ...record,
    id: `st-${Date.now()}`
  };
  const updated = [newRec, ...current];
  if (typeof window !== 'undefined') {
    const key = isTenantMode() ? 'ks_tenant_tahfidz_records_v1' : 'ks_tahfidz_records_v1';
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ks_tahfidz_setoran_updated', { detail: updated }));
  }
  return newRec;
}

// ============================================================================
// 6. LEARNING SESSION & KBM ACADEMIC ENGINE (LIFECYCLE TERPADU GURU & MUDIR)
// Alur TO-BE: Jadwal -> Session IN_PROGRESS -> Presensi Santri -> Learning Activity
// -> Assessment Result -> ACHIEVED/NOT_ACHIEVED -> REMEDIAL/ENRICHMENT -> COMPLETED -> Reporting Mudir
// ============================================================================

export interface SantriPresensiSession {
  santri_id: string;
  nis: string;
  nama: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';
  keterangan?: string;
}

export interface SantriAssessmentResult {
  santri_id: string;
  nis: string;
  nama: string;
  nilai: number;
  nilai_remedial?: number;
  nilai_akhir?: number;
  status_remedial?: 'TIDAK_REMEDIAL' | 'PERLU_REMEDIAL' | 'SUDAH_REMEDIAL';
  capaian: 'ACHIEVED' | 'NOT_ACHIEVED';
  rekomendasi: 'ENRICHMENT_ELIGIBLE' | 'REMEDIAL_REQUIRED';
  catatan?: string;
}

export interface LearningSession {
  id: string;
  jadwal_id: string;
  mata_pelajaran: string;
  kelas_id: string;
  kelas_nama: string;
  gender_target: 'ikhwan' | 'akhwat';
  guru_nama: string;
  guru_nip?: string;
  guru_gender: 'ikhwan' | 'akhwat';
  hari?: string;
  ruang_kelas: string;
  jam_jadwal: string; // "07:00 - 08:30 WIB"
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  waktu_mulai_aktual?: string;
  waktu_selesai_aktual?: string;

  // 1. Presensi Santri dalam Sesi Ini
  presensi: SantriPresensiSession[];

  // 2. Learning Activity (Catatan Jurnal Mengajar)
  activity: {
    topik_materi: string;
    bab_pembahasan: string;
    metode_pembelajaran: string; // 'Ceramah & Tanya Jawab' | 'Halaqah Diskusi' | 'Praktik Muamalah' | 'Talaqqi & Qira\'ah'
    catatan_kbm: string;
  };

  // 3. Integrated Assessment (Penilaian & Evaluasi Capaian)
  assessment: {
    judul_tugas: string;
    tipe: 'Tugas Harian' | 'Kuis Formatif' | 'Praktik Muamalah' | 'Ujian Sumatif';
    target_kkm: number; // Default KKM: 75
    results: SantriAssessmentResult[];
  };

  // 4. Inval & Substitution Metadata (Item 4.1)
  is_inval?: boolean;
  guru_asli_nama?: string;
  substitute_teacher_name?: string;
  inval_leave_id?: string;
}

/**
 * Validasi Syar'i: Guru Ikhwan HANYA mengajar Santri Ikhwan,
 * Guru Akhwat HANYA mengajar Santri Akhwat.
 */
export function validateIslamicSegregation(
  teacherGender: 'ikhwan' | 'akhwat',
  classGender: 'ikhwan' | 'akhwat'
): { isValid: boolean; message?: string } {
  if (teacherGender !== classGender) {
    return {
      isValid: false,
      message: `Peringatan Syar'i: Guru ${teacherGender === 'ikhwan' ? 'Laki-laki (Ustadz)' : 'Perempuan (Ustadzah)'} tidak diperkenankan mengajar kelas santri ${classGender === 'ikhwan' ? 'Putra (Ikhwan)' : 'Putri (Akhwat)'}. Pesantren menerapkan pemisahan gender secara ketat.`
    };
  }
  return { isValid: true };
}

export const DEFAULT_SESSIONS: LearningSession[] = [
  {
    id: 'ls-1',
    jadwal_id: 'jdw-1',
    mata_pelajaran: 'Bahasa Arab (Muhadatsah & Nahwu)',
    kelas_id: 'k-7a',
    kelas_nama: 'Kelas 7A Tahfidz Putra',
    gender_target: 'ikhwan',
    guru_nama: 'Ust. Ahmad Dahlan, S.Pd.I',
    guru_gender: 'ikhwan',
    ruang_kelas: 'Ruang Kelas 7A - Gedung Ibnu Khaldun (Kampus Putra)',
    jam_jadwal: '07:00 - 08:30 WIB',
    status: 'IN_PROGRESS',
    waktu_mulai_aktual: '06:58:12 WIB',
    presensi: [
      { santri_id: 's-1', nis: '202601001', nama: 'Muhammad Al-Fatih', status: 'HADIR' },
      { santri_id: 's-2', nis: '202601015', nama: 'Ahmad Zaki Mubarak', status: 'HADIR' },
      { santri_id: 's-3', nis: '202601022', nama: 'Hasan Al-Banna', status: 'HADIR' },
      { santri_id: 's-4', nis: '202601031', nama: 'Umar Faruq', status: 'SAKIT', keterangan: 'Istirahat di Poskestren' },
    ],
    activity: {
      topik_materi: 'Bab At-Ta\'aruf wal Hiwar fil Fashli (Percakapan di Kelas)',
      bab_pembahasan: 'Struktur Jumlah Ismiyyah & Dhomir Munfashil',
      metode_pembelajaran: 'Ceramah & Tanya Jawab',
      catatan_kbm: 'Santri antusias mempraktikkan dialog percakapan berpasangan di depan kelas.',
    },
    assessment: {
      judul_tugas: 'Latihan Hiwar & Tashrif Dhomir (Formatif)',
      tipe: 'Kuis Formatif',
      target_kkm: 75,
      results: [
        { santri_id: 's-1', nis: '202601001', nama: 'Muhammad Al-Fatih', nilai: 92, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE', catatan: 'Mampu menyusun kalimat sempurna.' },
        { santri_id: 's-2', nis: '202601015', nama: 'Ahmad Zaki Mubarak', nilai: 84, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE', catatan: 'Pelafalan makhraj huruf arab jelas.' },
        { santri_id: 's-3', nis: '202601022', nama: 'Hasan Al-Banna', nilai: 68, capaian: 'NOT_ACHIEVED', rekomendasi: 'REMEDIAL_REQUIRED', catatan: 'Perlu bimbingan ulang kaidah dhomir jamak.' },
        { santri_id: 's-4', nis: '202601031', nama: 'Umar Faruq', nilai: 0, capaian: 'NOT_ACHIEVED', rekomendasi: 'REMEDIAL_REQUIRED', catatan: 'Belum mengikuti kuis (sakit).' },
      ],
    },
  },
  {
    id: 'ls-2',
    jadwal_id: 'jdw-2',
    mata_pelajaran: 'Fiqih Muamalah',
    kelas_id: 'k-8a',
    kelas_nama: 'Kelas 8A Unggulan Putra',
    gender_target: 'ikhwan',
    guru_nama: 'Ust. Hamzah, Lc.',
    guru_gender: 'ikhwan',
    ruang_kelas: 'Ruang Kelas 8A - Gedung Ibnu Rusyd (Kampus Putra)',
    jam_jadwal: '08:45 - 10:15 WIB',
    status: 'NOT_STARTED',
    presensi: [
      { santri_id: 's-5', nis: '202601021', nama: 'Fatih Al-Ayyubi', status: 'HADIR' },
      { santri_id: 's-6', nis: '202601050', nama: 'Thoriq bin Ziyad', status: 'HADIR' },
      { santri_id: 's-7', nis: '202601055', nama: 'Khalid bin Walid', status: 'HADIR' },
    ],
    activity: {
      topik_materi: 'Rukun & Syarat Sah Akad Jual Beli (Al-Bai\')',
      bab_pembahasan: 'Larangan Riba, Gharar, dan Maisir dalam Perniagaan Kontemporer',
      metode_pembelajaran: 'Halaqah Diskusi',
      catatan_kbm: 'Kajian studi kasus transaksi digital & e-wallet menurut syariat Islam.',
    },
    assessment: {
      judul_tugas: 'Analisis Studi Kasus Transaksi Jual Beli Online',
      tipe: 'Tugas Harian',
      target_kkm: 75,
      results: [
        { santri_id: 's-5', nis: '202601021', nama: 'Fatih Al-Ayyubi', nilai: 88, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
        { santri_id: 's-6', nis: '202601050', nama: 'Thoriq bin Ziyad', nilai: 82, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
        { santri_id: 's-7', nis: '202601055', nama: 'Khalid bin Walid', nilai: 85, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
      ],
    },
  },
  {
    id: 'ls-3',
    jadwal_id: 'jdw-3',
    mata_pelajaran: 'Aqidah Akhlak',
    kelas_id: 'k-7b',
    kelas_nama: 'Kelas 7B Tahfidz Putra',
    gender_target: 'ikhwan',
    guru_nama: 'Ust. Bilal Habasyi',
    guru_gender: 'ikhwan',
    ruang_kelas: 'Ruang Kelas 7B - Gedung Ibnu Khaldun (Kampus Putra)',
    jam_jadwal: '10:30 - 12:00 WIB',
    status: 'COMPLETED',
    waktu_mulai_aktual: '10:28:00 WIB',
    waktu_selesai_aktual: '12:00:15 WIB',
    presensi: [
      { santri_id: 's-8', nis: '202601018', nama: 'Bilal Habasyi (Santri)', status: 'HADIR' },
      { santri_id: 's-9', nis: '202601025', nama: 'Usamah bin Zaid', status: 'HADIR' },
      { santri_id: 's-10', nis: '202601034', nama: 'Ali Zainal Abidin', status: 'HADIR' },
    ],
    activity: {
      topik_materi: 'Makna Dua Kalimat Syahadat & Konsekuensi Tauhid',
      bab_pembahasan: 'Urgensi Menjauhi Syirik Akbar dan Syirik Ashghar',
      metode_pembelajaran: 'Ceramah & Tanya Jawab',
      catatan_kbm: 'Pembelajaran selesai tuntas. Santri hafal dalil naqli dari Al-Qur\'an.',
    },
    assessment: {
      judul_tugas: 'Hafalan Dalil & Rukun Iman',
      tipe: 'Kuis Formatif',
      target_kkm: 75,
      results: [
        { santri_id: 's-8', nis: '202601018', nama: 'Bilal Habasyi (Santri)', nilai: 95, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
        { santri_id: 's-9', nis: '202601025', nama: 'Usamah bin Zaid', nilai: 90, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
        { santri_id: 's-10', nis: '202601034', nama: 'Ali Zainal Abidin', nilai: 88, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
      ],
    },
  },
  {
    id: 'ls-4',
    jadwal_id: 'jdw-4',
    mata_pelajaran: 'Tahfidz Al-Qur\'an & Tajwid Putri',
    kelas_id: 'k-8b',
    kelas_nama: 'Kelas 8B Unggulan Putri',
    gender_target: 'akhwat',
    guru_nama: 'Usth. Fatimah Az-Zahra, S.Pd.',
    guru_gender: 'akhwat',
    ruang_kelas: 'Ruang Kelas 8B - Gedung Khadijah (Kampus Putri)',
    jam_jadwal: '13:00 - 14:30 WIB',
    status: 'IN_PROGRESS',
    waktu_mulai_aktual: '13:02:10 WIB',
    presensi: [
      { santri_id: 's-11', nis: '202602004', nama: 'Fathimah Az-Zahra', status: 'HADIR' },
      { santri_id: 's-12', nis: '202602012', nama: 'Maryam Al-Batul', status: 'HADIR' },
      { santri_id: 's-13', nis: '202602019', nama: 'Aisyah Humaira', status: 'HADIR' },
      { santri_id: 's-14', nis: '202602025', nama: 'Hafshah binti Umar', status: 'HADIR' },
    ],
    activity: {
      topik_materi: 'Makhorijul Huruf & Hukum Nun Sukun / Tanwin',
      bab_pembahasan: 'Idzhar Halqi dan Idgham Bighunnah',
      metode_pembelajaran: 'Talaqqi & Qira\'ah',
      catatan_kbm: 'Setoran hafalan juz 30 dan bimbingan makhraj huruf santriwati halaqah putri.',
    },
    assessment: {
      judul_tugas: 'Setoran Surah An-Naba Ayat 1-20',
      tipe: 'Praktik Muamalah',
      target_kkm: 75,
      results: [
        { santri_id: 's-11', nis: '202602004', nama: 'Fathimah Az-Zahra', nilai: 96, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
        { santri_id: 's-12', nis: '202602012', nama: 'Maryam Al-Batul', nilai: 92, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
        { santri_id: 's-13', nis: '202602019', nama: 'Aisyah Humaira', nilai: 88, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
        { santri_id: 's-14', nis: '202602025', nama: 'Hafshah binti Umar', nilai: 84, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
      ],
    },
  },
  {
    id: 'ls-5',
    jadwal_id: 'jdw-5',
    mata_pelajaran: 'Fiqih Nisa & Ibadah Putri',
    kelas_id: 'k-9b',
    kelas_nama: 'Kelas 9B Putri Al-Qur\'an',
    gender_target: 'akhwat',
    guru_nama: 'Usth. Maryam, S.Pd.',
    guru_gender: 'akhwat',
    ruang_kelas: 'Ruang Kelas 9B - Gedung Khadijah (Kampus Putri)',
    jam_jadwal: '14:45 - 16:15 WIB',
    status: 'NOT_STARTED',
    presensi: [
      { santri_id: 's-15', nis: '202602030', nama: 'Zainab Al-Kubra', status: 'HADIR' },
      { santri_id: 's-16', nis: '202602035', nama: 'Khadijah Al-Kubro', status: 'HADIR' },
    ],
    activity: {
      topik_materi: 'Kajian Fiqih Wanita (Thaharah, Haid & Sholat)',
      bab_pembahasan: 'Tanda Suci dan Mandi Wajib Menurut Madzhab Syafi\'i',
      metode_pembelajaran: 'Kajian Halaqah Putri',
      catatan_kbm: 'Penjelasan fiqih khusus santriwati dengan sesi tanya jawab intensif.',
    },
    assessment: {
      judul_tugas: 'Kuis Kaidah Praktik Thaharah Santriwati',
      tipe: 'Kuis Formatif',
      target_kkm: 75,
      results: [
        { santri_id: 's-15', nis: '202602030', nama: 'Zainab Al-Kubra', nilai: 94, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
        { santri_id: 's-16', nis: '202602035', nama: 'Khadijah Al-Kubro', nilai: 90, capaian: 'ACHIEVED', rekomendasi: 'ENRICHMENT_ELIGIBLE' },
      ],
    },
  },
];

let memorySessions: LearningSession[] = [...DEFAULT_SESSIONS];

export function getSharedLearningSessions(): LearningSession[] {
  if (isTenantMode()) {
    try {
      const raw = localStorage.getItem('ks_tenant_learning_sessions_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  if (typeof window === 'undefined') return memorySessions;
  try {
    const raw = localStorage.getItem('ks_learning_sessions_v3');
    if (!raw) {
      localStorage.setItem('ks_learning_sessions_v3', JSON.stringify(DEFAULT_SESSIONS));
      return DEFAULT_SESSIONS;
    }
    const parsed: LearningSession[] = JSON.parse(raw);
    return parsed;
  } catch {
    return DEFAULT_SESSIONS;
  }
}

export function saveSharedLearningSessions(sessions: LearningSession[]) {
  if (isTenantMode()) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ks_tenant_learning_sessions_v1', JSON.stringify(sessions));
      window.dispatchEvent(new CustomEvent('ks_kbm_session_updated', { detail: sessions }));
    }
    return;
  }
  memorySessions = sessions;
  if (typeof window !== 'undefined') {
    localStorage.setItem('ks_learning_sessions_v3', JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent('ks_kbm_session_updated', { detail: sessions }));
  }
}

/**
 * Menambahkan Mata Pelajaran / Jadwal Sesi KBM baru oleh Mudir (Academic Authority)
 */
export function addNewLearningSession(newSession: Omit<LearningSession, 'id'>): LearningSession {
  const current = getSharedLearningSessions();
  const created: LearningSession = {
    ...newSession,
    id: `ls-${Date.now()}`
  };
  const updated = [created, ...current];
  saveSharedLearningSessions(updated);
  return created;
}

/**
 * Sinkronisasi Otomatis Guru Inval ke Jadwal Sesi KBM Aktual (Item 4.1)
 */
export function syncSubstituteTeacherToSessions(
  leaveId: string,
  teacherName: string,
  substituteTeacherName: string
): LearningSession[] {
  const sessions = getSharedLearningSessions();
  const cleanTeacherName = teacherName.toLowerCase().replace(/ustadzah|usth\.|ust\.|s\.pd\.|m\.pd\.|,/gi, '').trim();

  const updated = sessions.map(s => {
    const cleanSessionTeacher = s.guru_nama.toLowerCase().replace(/ustadzah|usth\.|ust\.|s\.pd\.|m\.pd\.|,/gi, '').trim();
    const isMatch = cleanSessionTeacher.includes(cleanTeacherName) || 
                    (s.guru_asli_nama && s.guru_asli_nama.toLowerCase().includes(cleanTeacherName)) ||
                    s.inval_leave_id === leaveId;

    if (isMatch) {
      return {
        ...s,
        is_inval: true,
        guru_asli_nama: s.guru_asli_nama || s.guru_nama.replace(/\s*\[INVAL\]/g, ''),
        substitute_teacher_name: substituteTeacherName,
        guru_nama: `${substituteTeacherName} [INVAL]`,
        inval_leave_id: leaveId
      };
    }
    return s;
  });

  saveSharedLearningSessions(updated);
  return updated;
}

export function startLearningSession(sessionId: string): LearningSession[] {
  const sessions = getSharedLearningSessions();
  const now = new Date().toLocaleTimeString('id-ID', { hour12: false }) + ' WIB';
  const updated = sessions.map(s => {
    if (s.id === sessionId) {
      return {
        ...s,
        status: 'IN_PROGRESS' as const,
        waktu_mulai_aktual: now,
      };
    }
    return s;
  });
  saveSharedLearningSessions(updated);
  return updated;
}

export function updateSessionPresensi(sessionId: string, presensiList: SantriPresensiSession[]): LearningSession[] {
  const sessions = getSharedLearningSessions();
  const updated = sessions.map(s => {
    if (s.id === sessionId) {
      return {
        ...s,
        presensi: presensiList,
      };
    }
    return s;
  });
  saveSharedLearningSessions(updated);
  return updated;
}

export function updateSessionActivity(sessionId: string, activityData: LearningSession['activity']): LearningSession[] {
  const sessions = getSharedLearningSessions();
  const updated = sessions.map(s => {
    if (s.id === sessionId) {
      return {
        ...s,
        activity: activityData,
      };
    }
    return s;
  });
  saveSharedLearningSessions(updated);
  return updated;
}

export function updateSessionAssessment(
  sessionId: string, 
  judul_tugas: string, 
  tipe: LearningSession['assessment']['tipe'], 
  target_kkm: number, 
  scores: { santri_id: string; nis: string; nama: string; nilai: number; catatan?: string }[]
): LearningSession[] {
  const sessions = getSharedLearningSessions();
  
  // Sistem mengevaluasi capaian: ACHIEVED / NOT_ACHIEVED, REMEDIAL_REQUIRED / ENRICHMENT_ELIGIBLE
  const evaluatedResults: SantriAssessmentResult[] = scores.map(sc => {
    const isAchieved = sc.nilai >= target_kkm;
    return {
      santri_id: sc.santri_id,
      nis: sc.nis,
      nama: sc.nama,
      nilai: sc.nilai,
      nilai_akhir: sc.nilai,
      status_remedial: isAchieved ? 'TIDAK_REMEDIAL' : 'PERLU_REMEDIAL',
      capaian: isAchieved ? 'ACHIEVED' : 'NOT_ACHIEVED',
      rekomendasi: isAchieved ? 'ENRICHMENT_ELIGIBLE' : 'REMEDIAL_REQUIRED',
      catatan: sc.catatan || (isAchieved ? 'Tuntas memenuhi KKM.' : `Nilai di bawah KKM (${target_kkm}), wajib remedial.`),
    };
  });

  const updated = sessions.map(s => {
    if (s.id === sessionId) {
      return {
        ...s,
        assessment: {
          judul_tugas,
          tipe,
          target_kkm,
          results: evaluatedResults,
        },
      };
    }
    return s;
  });
  saveSharedLearningSessions(updated);
  return updated;
}

export function updateSessionRemedial(
  sessionId: string,
  santriId: string,
  nilaiRemedial: number
): LearningSession[] {
  const sessions = getSharedLearningSessions();
  const updated = sessions.map(s => {
    if (s.id === sessionId && s.assessment?.results) {
      const targetKkm = s.assessment.target_kkm || 75;
      const updatedResults = s.assessment.results.map(r => {
        if (r.santri_id === santriId) {
          const isLulus = nilaiRemedial >= targetKkm;
          const nilaiAkhir = Math.max(r.nilai, nilaiRemedial);
          return {
            ...r,
            nilai_remedial: nilaiRemedial,
            nilai_akhir: nilaiAkhir,
            status_remedial: 'SUDAH_REMEDIAL' as const,
            capaian: isLulus ? ('ACHIEVED' as const) : ('NOT_ACHIEVED' as const),
            rekomendasi: isLulus ? ('ENRICHMENT_ELIGIBLE' as const) : ('REMEDIAL_REQUIRED' as const),
            catatan: isLulus
              ? `Tuntas pasca-remedial (Nilai Remedial: ${nilaiRemedial}, KKM: ${targetKkm}).`
              : `Hasil remedial ${nilaiRemedial} masih di bawah KKM (${targetKkm}), perlu pembinaan guru.`,
          };
        }
        return r;
      });

      return {
        ...s,
        assessment: {
          ...s.assessment,
          results: updatedResults,
        },
      };
    }
    return s;
  });

  saveSharedLearningSessions(updated);
  return updated;
}

export function completeLearningSession(sessionId: string): LearningSession[] {
  const sessions = getSharedLearningSessions();
  const now = new Date().toLocaleTimeString('id-ID', { hour12: false }) + ' WIB';
  const updated = sessions.map(s => {
    if (s.id === sessionId) {
      return {
        ...s,
        status: 'COMPLETED' as const,
        waktu_selesai_aktual: now,
      };
    }
    return s;
  });
  saveSharedLearningSessions(updated);
  return updated;
}


// ============================================================================
// 7. PERMISSION REQUEST & KESANTRIAN GATE PASS (TARGET STATE MACHINE)
// DRAFT -> SUBMITTED -> UNDER_REVIEW -> (APPROVED/REJECTED) -> GATE_PASS ->
// CHECKED_OUT -> SANTRI_OUTSIDE -> (RETURNED / OVERDUE -> CASE_REVIEW -> EXCUSED / VIOLATION)
// ============================================================================

export type PermissionStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'GATE_PASS'
  | 'CHECKED_OUT'
  | 'SANTRI_OUTSIDE'
  | 'RETURNED'
  | 'OVERDUE'
  | 'CASE_REVIEW'
  | 'EXCUSED'
  | 'VIOLATION';

export interface GateMovement {
  id: string;
  type: 'CHECK_OUT' | 'CHECK_IN';
  timestamp: string;
  date: string;
  officer_name: string;
  gate_location: string;
  companion_name?: string;
  companion_phone?: string;
  condition_notes?: string;
  late_minutes?: number;
}

export interface CaseReviewRecord {
  id: string;
  reviewed_at: string;
  reviewer_name: string;
  reviewer_role: string;
  category: 'KENDARAAN_MOGOK_MACET' | 'DARURAT_MEDIS_KELUARGA' | 'CUACA_BENCANA' | 'KELALAIAN_SANTRI' | 'LAINNYA';
  explanation: string;
  supporting_evidence?: string;
  decision: 'EXCUSED' | 'VIOLATION';
  decision_rationale: string;
  discipline_points?: number;
  sanction_action?: string;
  linked_discipline_id?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor_name: string;
  actor_role: string;
  details: string;
}

export interface PermissionRequest {
  id: string;
  santri_id: string;
  nis: string;
  nama: string;
  kelas: string;
  kamar: string;
  alasan: string;
  tujuan: string;
  rencana_keluar: string;
  rencana_kembali: string;
  nama_penjemput: string;
  kontak_wali: string;
  hubungan_penjemput: string;
  status: PermissionStatus;
  petugas_verifikasi?: string;
  waktu_verifikasi?: string;
  alasan_penolakan?: string;
  qr_code?: string;
  gate_pass_issued_at?: string;
  gate_movements: GateMovement[];
  case_review?: CaseReviewRecord;
  audit_trail: AuditLogEntry[];
  menit_terlambat?: number;
  created_at: string;
}

export const DEFAULT_PERMISSION_REQUESTS: PermissionRequest[] = [
  {
    id: 'pr-1',
    santri_id: 's-1',
    nis: '202601001',
    nama: 'Muhammad Al-Fatih',
    kelas: 'Kelas 7A Tahfidz Sains',
    kamar: 'Kamar 101 - Gedung Abu Bakar',
    alasan: 'Izin Pulang (Pernikahan Kakak Kandung)',
    tujuan: 'Surabaya (Jl. Darmo No. 45)',
    rencana_keluar: '2026-10-04 08:00',
    rencana_kembali: '2026-10-06 17:00',
    nama_penjemput: 'Ir. H. Ahmad Fauzi',
    kontak_wali: '081234567890',
    hubungan_penjemput: 'Ayah Kandung',
    status: 'SANTRI_OUTSIDE',
    petugas_verifikasi: 'Ust. Rahmat, S.Pd (Kesantrian)',
    waktu_verifikasi: '04/10/2026 07:30 WIB',
    qr_code: 'GP-20261004-FATH',
    gate_pass_issued_at: '04/10/2026 07:35 WIB',
    gate_movements: [
      {
        id: 'gm-1',
        type: 'CHECK_OUT',
        timestamp: '08:05:12 WIB',
        date: '2026-10-04',
        officer_name: 'Pak Subandi (Satpam Gerbang Utama)',
        gate_location: 'Gerbang Utama & Portal Kendaraan',
        companion_name: 'Ir. H. Ahmad Fauzi (Ayah Kandung)',
        companion_phone: '081234567890',
        condition_notes: 'Seragam rapi, membawa surat izin resmi dan dijemput mobil keluarga plat L 1234 AB.',
      }
    ],
    audit_trail: [
      { id: 'aud-1', timestamp: '2026-10-03 20:15 WIB', action: 'SUBMITTED', actor_name: 'Wali Santri via Portal', actor_role: 'Wali Santri', details: 'Pengajuan izin kepulangan pernikahan kakak kandung.' },
      { id: 'aud-2', timestamp: '2026-10-04 07:15 WIB', action: 'UNDER_REVIEW', actor_name: 'Ust. Hamzah, Lc.', actor_role: 'Musyrif Kamar', details: 'Musyrif memverifikasi kelayakan izin santri.' },
      { id: 'aud-3', timestamp: '2026-10-04 07:30 WIB', action: 'APPROVED', actor_name: 'Ust. Rahmat, S.Pd', actor_role: 'Kesantrian', details: 'Persetujuan kebijakan perizinan disahkan.' },
      { id: 'aud-4', timestamp: '2026-10-04 07:35 WIB', action: 'GATE_PASS_ISSUED', actor_name: 'Sistem Kesantrian', actor_role: 'System', details: 'QR Gate Pass resmi diterbitkan: GP-20261004-FATH.' },
      { id: 'aud-5', timestamp: '2026-10-04 08:05 WIB', action: 'CHECKED_OUT', actor_name: 'Pak Subandi', actor_role: 'Satpam Gerbang', details: 'Santri keluar gerbang, status beralih ke SANTRI_OUTSIDE.' },
    ],
    created_at: '2026-10-03 20:15',
  },
  {
    id: 'pr-2',
    santri_id: 's-2',
    nis: '202601015',
    nama: 'Ahmad Zaki Mubarak',
    kelas: 'Kelas 7A Tahfidz Sains',
    kamar: 'Kamar 101 - Gedung Abu Bakar',
    alasan: 'Berobat ke Dokter Spesialis Mata (Keluhan Iritasi Kornea)',
    tujuan: 'RSUD Dr. Saiful Anwar Malang',
    rencana_keluar: '2026-10-04 08:30',
    rencana_kembali: '2026-10-04 11:00',
    nama_penjemput: 'Ust. Bilal (Pendamping Poskestren)',
    kontak_wali: '081298765432',
    hubungan_penjemput: 'Pendamping Resmi Pesantren',
    status: 'CASE_REVIEW',
    petugas_verifikasi: 'Ust. Hamzah, Lc. (Musyrif)',
    waktu_verifikasi: '04/10/2026 08:10 WIB',
    qr_code: 'GP-20261004-ZAKI',
    gate_pass_issued_at: '04/10/2026 08:15 WIB',
    menit_terlambat: 75,
    gate_movements: [
      {
        id: 'gm-2a',
        type: 'CHECK_OUT',
        timestamp: '08:35:00 WIB',
        date: '2026-10-04',
        officer_name: 'Pak Subandi (Satpam Gerbang Utama)',
        gate_location: 'Gerbang Utama',
        companion_name: 'Ust. Bilal',
        condition_notes: 'Berangkat menggunakan mobil operasional ambulans poskestren.',
      },
      {
        id: 'gm-2b',
        type: 'CHECK_IN',
        timestamp: '12:15:00 WIB',
        date: '2026-10-04',
        officer_name: 'Pak Subandi (Satpam Gerbang Utama)',
        gate_location: 'Gerbang Utama',
        companion_name: 'Ust. Bilal',
        condition_notes: 'Santri kembali terlambat 75 menit karena antrean poliklinik RSUD membludak.',
        late_minutes: 75,
      }
    ],
    audit_trail: [
      { id: 'aud-21', timestamp: '2026-10-04 07:45 WIB', action: 'SUBMITTED', actor_name: 'Ust. Bilal (Poskestren)', actor_role: 'Petugas Medis', details: 'Rujukan dokter spesialis mata RSUD.' },
      { id: 'aud-22', timestamp: '2026-10-04 08:10 WIB', action: 'APPROVED', actor_name: 'Ust. Hamzah, Lc.', actor_role: 'Musyrif', details: 'Izin darurat medis disetujui.' },
      { id: 'aud-23', timestamp: '2026-10-04 08:15 WIB', action: 'GATE_PASS_ISSUED', actor_name: 'Sistem Kesantrian', actor_role: 'System', details: 'QR Gate Pass diterbitkan.' },
      { id: 'aud-24', timestamp: '2026-10-04 08:35 WIB', action: 'CHECKED_OUT', actor_name: 'Pak Subandi', actor_role: 'Satpam Gerbang', details: 'Santri keluar gerbang menuju RSUD.' },
      { id: 'aud-25', timestamp: '2026-10-04 11:01 WIB', action: 'OVERDUE_FLAGGED', actor_name: 'Sistem Scheduler', actor_role: 'System', details: 'Batas kembali pk 11:00 terlampaui saat masih di luar.' },
      { id: 'aud-26', timestamp: '2026-10-04 12:15 WIB', action: 'CHECKED_IN_LATE', actor_name: 'Pak Subandi', actor_role: 'Satpam Gerbang', details: 'Santri kembali terlambat 75 menit. Status dialihkan ke CASE_REVIEW.' },
    ],
    created_at: '2026-10-04 07:45',
  },
  {
    id: 'pr-3',
    santri_id: 's-3',
    nis: '202601022',
    nama: 'Hasan Al-Banna',
    kelas: 'Kelas 7A Tahfidz Sains',
    kamar: 'Kamar 103 - Gedung Umar',
    alasan: 'Takziyah Nenek Kandung Meninggal Dunia',
    tujuan: 'Pasuruan (Kec. Bangil)',
    rencana_keluar: '2026-10-04 13:00',
    rencana_kembali: '2026-10-05 18:00',
    nama_penjemput: 'H. M. Banna',
    kontak_wali: '081345678901',
    hubungan_penjemput: 'Paman Kandung (Mahrom)',
    status: 'GATE_PASS',
    petugas_verifikasi: 'Ust. Rahmat, S.Pd (Kesantrian)',
    waktu_verifikasi: '04/10/2026 09:15 WIB',
    qr_code: 'GP-20261004-BANN',
    gate_pass_issued_at: '04/10/2026 09:20 WIB',
    gate_movements: [],
    audit_trail: [
      { id: 'aud-31', timestamp: '2026-10-04 08:50 WIB', action: 'SUBMITTED', actor_name: 'Hasan Al-Banna', actor_role: 'Santri', details: 'Pengajuan takziyah keluarga dekat.' },
      { id: 'aud-32', timestamp: '2026-10-04 09:15 WIB', action: 'APPROVED', actor_name: 'Ust. Rahmat, S.Pd', actor_role: 'Kesantrian', details: 'Disetujui setelah konfirmasi telepon dengan paman penjemput.' },
      { id: 'aud-33', timestamp: '2026-10-04 09:20 WIB', action: 'GATE_PASS_ISSUED', actor_name: 'Sistem Kesantrian', actor_role: 'System', details: 'Gate Pass terbit, menunggu dijemput di pos satpam.' },
    ],
    created_at: '2026-10-04 08:50',
  },
  {
    id: 'pr-4',
    santri_id: 's-4',
    nis: '202601031',
    nama: 'Umar Faruq',
    kelas: 'Kelas 7A Tahfidz Sains',
    kamar: 'Kamar 104 - Gedung Umar',
    alasan: 'Pengurusan Perpanjangan Paspor Umroh Bersama Keluarga',
    tujuan: 'Kantor Imigrasi Kelas I Malang',
    rencana_keluar: '2026-10-05 08:30',
    rencana_kembali: '2026-10-05 15:00',
    nama_penjemput: 'Ibu Siti Maryam',
    kontak_wali: '081277889900',
    hubungan_penjemput: 'Ibu Kandung',
    status: 'SUBMITTED',
    gate_movements: [],
    audit_trail: [
      { id: 'aud-41', timestamp: '2026-10-04 10:20 WIB', action: 'SUBMITTED', actor_name: 'Ibu Siti Maryam (Wali)', actor_role: 'Wali Santri', details: 'Pengajuan pengurusan paspor imigrasi.' },
    ],
    created_at: '2026-10-04 10:20',
  },
  {
    id: 'pr-5',
    santri_id: 's-5',
    nis: '202601018',
    nama: 'Bilal Habasyi',
    kelas: 'Kelas 7B Tahfidz Sains',
    kamar: 'Kamar 201 - Gedung Utsman',
    alasan: 'Mengikuti Lomba MHQ 5 Juz Tingkat Provinsi Jawa Timur',
    tujuan: 'Masjid Agung Jawa Timur Surabaya',
    rencana_keluar: '2026-10-03 07:00',
    rencana_kembali: '2026-10-03 17:00',
    nama_penjemput: 'Ust. Lukman (Pembina Tahfidz)',
    kontak_wali: '081566778899',
    hubungan_penjemput: 'Pembina Resmi Pesantren',
    status: 'RETURNED',
    petugas_verifikasi: 'Ust. Rahmat, S.Pd (Kesantrian)',
    waktu_verifikasi: '02/10/2026 15:00 WIB',
    qr_code: 'GP-20261003-BLLH',
    gate_movements: [
      {
        id: 'gm-5a',
        type: 'CHECK_OUT',
        timestamp: '07:12:00 WIB',
        date: '2026-10-03',
        officer_name: 'Pak Subandi (Satpam Gerbang Utama)',
        gate_location: 'Gerbang Utama',
        companion_name: 'Ust. Lukman',
        condition_notes: 'Membawa berkas pendaftaran lomba dan seragam resmi kafilah pondok.',
      },
      {
        id: 'gm-5b',
        type: 'CHECK_IN',
        timestamp: '16:45:10 WIB',
        date: '2026-10-03',
        officer_name: 'Pak Subandi (Satpam Gerbang Utama)',
        gate_location: 'Gerbang Utama',
        companion_name: 'Ust. Lukman',
        condition_notes: 'Kembali tepat waktu sebelum batas pk 17:00. Membawa piala Juara 1 MHQ.',
        late_minutes: 0,
      }
    ],
    audit_trail: [
      { id: 'aud-51', timestamp: '2026-10-02 14:00 WIB', action: 'SUBMITTED', actor_name: 'Pembina Tahfidz', actor_role: 'Staf Pesantren', details: 'Delegasi perlombaan provinsi.' },
      { id: 'aud-52', timestamp: '2026-10-02 15:00 WIB', action: 'APPROVED', actor_name: 'Ust. Rahmat, S.Pd', actor_role: 'Kesantrian', details: 'Disetujui sebagai dinas lomba.' },
      { id: 'aud-53', timestamp: '2026-10-03 07:12 WIB', action: 'CHECKED_OUT', actor_name: 'Pak Subandi', actor_role: 'Satpam Gerbang', details: 'Berangkat ke lokasi lomba.' },
      { id: 'aud-54', timestamp: '2026-10-03 16:45 WIB', action: 'RETURNED_ON_TIME', actor_name: 'Pak Subandi', actor_role: 'Satpam Gerbang', details: 'Kembali tepat waktu. Izin selesai sempurna.' },
    ],
    created_at: '2026-10-02 14:00',
  },
  {
    id: 'pr-6',
    santri_id: 's-6',
    nis: '202601040',
    nama: 'Salman Al-Farisi',
    kelas: 'Kelas 7B Tahfidz Sains',
    kamar: 'Kamar 202 - Gedung Utsman',
    alasan: 'Pemeriksaan Gigi & Bedah Odontotomi',
    tujuan: 'Klinik Spesialis Bedah Mulut Surabaya',
    rencana_keluar: '2026-10-02 08:00',
    rencana_kembali: '2026-10-02 14:00',
    nama_penjemput: 'Bpk. Hendra Gunawan',
    kontak_wali: '081299887766',
    hubungan_penjemput: 'Ayah Kandung',
    status: 'EXCUSED',
    petugas_verifikasi: 'Ust. Rahmat, S.Pd (Kesantrian)',
    waktu_verifikasi: '02/10/2026 07:30 WIB',
    qr_code: 'GP-20261002-SLMN',
    menit_terlambat: 85,
    gate_movements: [
      {
        id: 'gm-6a',
        type: 'CHECK_OUT',
        timestamp: '08:10:00 WIB',
        date: '2026-10-02',
        officer_name: 'Pak Subandi (Satpam Gerbang Utama)',
        gate_location: 'Gerbang Utama',
      },
      {
        id: 'gm-6b',
        type: 'CHECK_IN',
        timestamp: '15:25:00 WIB',
        date: '2026-10-02',
        officer_name: 'Pak Subandi (Satpam Gerbang Utama)',
        gate_location: 'Gerbang Utama',
        late_minutes: 85,
        condition_notes: 'Kembali lewat batas waktu karena kereta api lokal mengalami anjlok/kendala teknis di stasiun.',
      }
    ],
    case_review: {
      id: 'cr-6',
      reviewed_at: '2026-10-02 16:30 WIB',
      reviewer_name: 'Ust. Rahmat, S.Pd',
      reviewer_role: 'Kepala Bagian Kesantrian',
      category: 'KENDARAAN_MOGOK_MACET',
      explanation: 'Kereta api Penataran relasi Surabaya-Malang mengalami mogok mesin di Stasiun Bangil selama 1.5 jam.',
      supporting_evidence: 'Surat Keterangan Keterlambatan Perjalanan Kereta Api PT KAI No. SK/02/X/2026 terlampir.',
      decision: 'EXCUSED',
      decision_rationale: 'Keterlambatan terbukti murni musibah teknis transportasi massal, bukan kelalaian santri. Wali proaktif konfirmasi.',
      discipline_points: 0,
      sanction_action: 'Dispensasi penuh, santri dipersilakan istirahat di kamar asrama.',
    },
    audit_trail: [
      { id: 'aud-61', timestamp: '2026-10-02 07:30 WIB', action: 'APPROVED', actor_name: 'Ust. Rahmat', actor_role: 'Kesantrian', details: 'Izin dokter gigi disetujui.' },
      { id: 'aud-62', timestamp: '2026-10-02 08:10 WIB', action: 'CHECKED_OUT', actor_name: 'Pak Subandi', actor_role: 'Satpam Gerbang', details: 'Santri keluar gerbang.' },
      { id: 'aud-63', timestamp: '2026-10-02 15:25 WIB', action: 'CHECKED_IN_LATE', actor_name: 'Pak Subandi', actor_role: 'Satpam Gerbang', details: 'Kembali terlambat 85 menit. Dialihkan ke Case Review.' },
      { id: 'aud-64', timestamp: '2026-10-02 16:30 WIB', action: 'CASE_RESOLVED_EXCUSED', actor_name: 'Ust. Rahmat', actor_role: 'Kesantrian', details: 'Sidang menetapkan status EXCUSED (Dispensasi alasan sah, 0 poin sanksi).' },
    ],
    created_at: '2026-10-01 19:00',
  },
  {
    id: 'pr-7',
    santri_id: 's-7',
    nis: '202601034',
    nama: 'Ali Zainal Abidin',
    kelas: 'Kelas 7B Tahfidz Sains',
    kamar: 'Kamar 203 - Gedung Utsman',
    alasan: 'Membeli Buku Teks & Kitab Kuning di Toko Buku',
    tujuan: 'Kecamatan Lawang, Malang',
    rencana_keluar: '2026-10-01 13:00',
    rencana_kembali: '2026-10-01 16:00',
    nama_penjemput: 'Mandiri / Izin Keluar Siang',
    kontak_wali: '081322334455',
    hubungan_penjemput: 'Mandiri / Dinas Belanja Santri',
    status: 'VIOLATION',
    petugas_verifikasi: 'Ust. Hamzah, Lc. (Musyrif)',
    waktu_verifikasi: '01/10/2026 12:30 WIB',
    qr_code: 'GP-20261001-ALIZ',
    menit_terlambat: 150,
    gate_movements: [
      {
        id: 'gm-7a',
        type: 'CHECK_OUT',
        timestamp: '13:05:00 WIB',
        date: '2026-10-01',
        officer_name: 'Pak Subandi (Satpam Gerbang Utama)',
        gate_location: 'Gerbang Utama',
      },
      {
        id: 'gm-7b',
        type: 'CHECK_IN',
        timestamp: '18:30:00 WIB',
        date: '2026-10-01',
        officer_name: 'Pak Subandi (Satpam Gerbang Utama)',
        gate_location: 'Gerbang Utama',
        late_minutes: 150,
        condition_notes: 'Kembali terlambat 2.5 jam setelah maghrib, baju santri kotor dan tidak membawa kitab.',
      }
    ],
    case_review: {
      id: 'cr-7',
      reviewed_at: '2026-10-01 19:30 WIB',
      reviewer_name: 'Ust. Rahmat, S.Pd',
      reviewer_role: 'Kepala Bagian Kesantrian',
      category: 'KELALAIAN_SANTRI',
      explanation: 'Santri mengaku mampir ke rental game online dan nongkrong di warung kopi bersama alumni.',
      supporting_evidence: 'Pengakuan langsung santri dan laporan pengawas keamanan pos gerbang.',
      decision: 'VIOLATION',
      decision_rationale: 'Keterlambatan disengaja tanpa izin wali dan melanggar adab perizinan santri.',
      discipline_points: -10,
      sanction_action: 'Iqob Tarbawi: Piket pembersihan masjid pondok selama 3 hari dan hafalan Surah Al-Mulk.',
      linked_discipline_id: 'rec-violation-01',
    },
    audit_trail: [
      { id: 'aud-71', timestamp: '2026-10-01 12:30 WIB', action: 'APPROVED', actor_name: 'Ust. Hamzah', actor_role: 'Musyrif', details: 'Izin beli kitab disetujui.' },
      { id: 'aud-72', timestamp: '2026-10-01 13:05 WIB', action: 'CHECKED_OUT', actor_name: 'Pak Subandi', actor_role: 'Satpam Gerbang', details: 'Santri keluar gerbang.' },
      { id: 'aud-73', timestamp: '2026-10-01 18:30 WIB', action: 'CHECKED_IN_LATE', actor_name: 'Pak Subandi', actor_role: 'Satpam Gerbang', details: 'Terlambat 150 menit. Dialihkan ke Case Review.' },
      { id: 'aud-74', timestamp: '2026-10-01 19:30 WIB', action: 'CASE_RESOLVED_VIOLATION', actor_name: 'Ust. Rahmat', actor_role: 'Kesantrian', details: 'Sidang menetapkan VIOLATION (Poin -10 tercatat di Modul Disiplin Tarbawi).' },
    ],
    created_at: '2026-10-01 11:30',
  },
  {
    id: 'pr-8',
    santri_id: 's-15',
    nis: '202602001',
    nama: 'Fathimah Az-Zahra',
    kelas: 'Kelas 8B Putri (Akhwat)',
    kamar: 'Kamar 201 - Gedung Khadijah',
    alasan: 'Izin Pulang Pemulihan Pasca Sakit di Rumah',
    tujuan: 'Kediri (Jl. Hayam Wuruk No. 12)',
    rencana_keluar: '2026-10-04 14:00',
    rencana_kembali: '2026-10-07 17:00',
    nama_penjemput: 'Ibu Hj. Aminah',
    kontak_wali: '081399887766',
    hubungan_penjemput: 'Ibu Kandung (Mahrom)',
    status: 'SANTRI_OUTSIDE',
    petugas_verifikasi: 'Usth. Siti Khadijah, S.Pd.I. (Musyrifah Putri)',
    waktu_verifikasi: '04/10/2026 13:30 WIB',
    qr_code: 'GP-20261004-FATM',
    gate_pass_issued_at: '04/10/2026 13:35 WIB',
    gate_movements: [
      {
        id: 'gm-8',
        type: 'CHECK_OUT',
        timestamp: '14:15:00 WIB',
        date: '2026-10-04',
        officer_name: 'Pak Subandi (Satpam Gerbang Utama)',
        gate_location: 'Gerbang Khusus Putri',
        companion_name: 'Ibu Hj. Aminah (Ibu Kandung)',
        companion_phone: '081399887766',
        condition_notes: 'Dijemput ibu kandung mahrom, surat izin asrama putri dan resep poskestren lengkap.',
      }
    ],
    audit_trail: [
      { id: 'aud-81', timestamp: '2026-10-04 12:00 WIB', action: 'SUBMITTED', actor_name: 'Ibu Hj. Aminah', actor_role: 'Wali Santri', details: 'Pengajuan perizinan istirahat di rumah.' },
      { id: 'aud-82', timestamp: '2026-10-04 13:30 WIB', action: 'APPROVED', actor_name: 'Usth. Siti Khadijah, S.Pd.I.', actor_role: 'Musyrifah Putri', details: 'Verifikasi pembina asrama putri disetujui.' },
      { id: 'aud-83', timestamp: '2026-10-04 13:35 WIB', action: 'GATE_PASS_ISSUED', actor_name: 'Sistem Kesantrian', actor_role: 'System', details: 'Gate Pass resmi santriwati terbit.' },
      { id: 'aud-84', timestamp: '2026-10-04 14:15 WIB', action: 'CHECKED_OUT', actor_name: 'Pak Subandi', actor_role: 'Satpam Gerbang', details: 'Santriwati keluar gerbang dijemput mahrom.' },
    ],
    created_at: '2026-10-04 12:00',
  }
];

export function getSharedPermissionRequests(): PermissionRequest[] {
  if (isTenantMode()) {
    try {
      const raw = localStorage.getItem('ks_tenant_permission_requests_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  if (typeof window === 'undefined') return DEFAULT_PERMISSION_REQUESTS;
  try {
    const raw = localStorage.getItem('ks_permission_requests_v3');
    let list: PermissionRequest[] = raw ? JSON.parse(raw) : DEFAULT_PERMISSION_REQUESTS;

    // Evaluasi otomatis keterlambatan (OVERDUE check) untuk santri yang sedang berada di luar
    const now = new Date();
    let hasChanges = false;
    list = list.map(item => {
      if (item.status === 'SANTRI_OUTSIDE' || item.status === 'CHECKED_OUT') {
        const batasKembali = new Date(item.rencana_kembali.replace(' ', 'T'));
        if (!isNaN(batasKembali.getTime()) && now.getTime() > batasKembali.getTime()) {
          const diffMinutes = Math.round((now.getTime() - batasKembali.getTime()) / 60000);
          hasChanges = true;
          return {
            ...item,
            status: 'OVERDUE' as const,
            menit_terlambat: diffMinutes > 0 ? diffMinutes : 15,
            audit_trail: [
              ...item.audit_trail,
              {
                id: `aud-overdue-${Date.now()}`,
                timestamp: `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`,
                action: 'OVERDUE_FLAGGED',
                actor_name: 'Sistem Scheduler',
                actor_role: 'System',
                details: `Batas waktu kembali pk ${item.rencana_kembali} telah terlampaui saat santri masih di luar pondok. Membutuhkan Case Review.`,
              }
            ]
          };
        }
      }
      return item;
    });

    if (hasChanges || !raw) {
      localStorage.setItem('ks_permission_requests_v3', JSON.stringify(list));
    }
    return list;
  } catch {
    return DEFAULT_PERMISSION_REQUESTS;
  }
}

export function saveSharedPermissionRequests(list: PermissionRequest[]): void {
  if (typeof window !== 'undefined') {
    if (isTenantMode()) {
      localStorage.setItem('ks_tenant_permission_requests_v1', JSON.stringify(list));
    } else {
      localStorage.setItem('ks_permission_requests_v3', JSON.stringify(list));
    }
    window.dispatchEvent(new CustomEvent('ks_permission_updated', { detail: list }));
  }
}

export function createPermissionRequest(
  data: Omit<PermissionRequest, 'id' | 'status' | 'qr_code' | 'gate_movements' | 'audit_trail' | 'created_at'>
): PermissionRequest {
  const current = getSharedPermissionRequests();
  const now = new Date();
  const nowStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;

  const newReq: PermissionRequest = {
    ...data,
    id: `pr-${Date.now()}`,
    status: 'SUBMITTED',
    gate_movements: [],
    audit_trail: [
      {
        id: `aud-init-${Date.now()}`,
        timestamp: nowStr,
        action: 'SUBMITTED',
        actor_name: data.nama_penjemput || 'Santri / Wali',
        actor_role: data.hubungan_penjemput || 'Pemohon',
        details: `Permintaan izin diajukan: ${data.alasan} ke ${data.tujuan}.`,
      }
    ],
    created_at: now.toISOString().slice(0, 16).replace('T', ' '),
  };

  const updated = [newReq, ...current];
  saveSharedPermissionRequests(updated);
  return newReq;
}

export function startReviewPermission(id: string, reviewer: string = 'Ust. Hamzah, Lc. (Musyrif)'): PermissionRequest | null {
  const current = getSharedPermissionRequests();
  let target: PermissionRequest | null = null;
  const now = new Date();
  const nowStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;

  const updated = current.map(item => {
    if (item.id === id) {
      target = {
        ...item,
        status: 'UNDER_REVIEW' as const,
        audit_trail: [
          ...item.audit_trail,
          {
            id: `aud-rev-${Date.now()}`,
            timestamp: nowStr,
            action: 'UNDER_REVIEW',
            actor_name: reviewer,
            actor_role: 'Musyrif / Kesantrian',
            details: `Permohonan izin sedang diperiksa dan diverifikasi oleh ${reviewer}.`,
          }
        ]
      };
      return target;
    }
    return item;
  });

  saveSharedPermissionRequests(updated);
  return target;
}

export function verifyPermissionRequest(
  id: string,
  action: 'APPROVE' | 'REJECT',
  petugas: string,
  alasanTolak?: string
): PermissionRequest | null {
  const current = getSharedPermissionRequests();
  let target: PermissionRequest | null = null;
  const now = new Date();
  const waktuStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;

  const updated = current.map(item => {
    if (item.id === id) {
      if (action === 'APPROVE') {
        target = {
          ...item,
          status: 'APPROVED' as const,
          petugas_verifikasi: petugas,
          waktu_verifikasi: waktuStr,
          audit_trail: [
            ...item.audit_trail,
            {
              id: `aud-appr-${Date.now()}`,
              timestamp: waktuStr,
              action: 'APPROVED',
              actor_name: petugas,
              actor_role: 'Kesantrian',
              details: `Izin resmi disetujui. Menunggu penerbitan QR Gate Pass sebelum check-out.`,
            }
          ]
        };
        return target;
      } else {
        target = {
          ...item,
          status: 'REJECTED' as const,
          petugas_verifikasi: petugas,
          waktu_verifikasi: waktuStr,
          alasan_penolakan: alasanTolak || 'Pengajuan ditolak oleh petugas kesantrian.',
          audit_trail: [
            ...item.audit_trail,
            {
              id: `aud-rej-${Date.now()}`,
              timestamp: waktuStr,
              action: 'REJECTED',
              actor_name: petugas,
              actor_role: 'Kesantrian',
              details: `Izin ditolak: ${alasanTolak || 'Tidak memenuhi kriteria perizinan santri.'}`,
            }
          ]
        };
        return target;
      }
    }
    return item;
  });

  saveSharedPermissionRequests(updated);
  return target;
}

export function issueGatePass(id: string, petugas: string = 'Bagian Kesantrian'): PermissionRequest | null {
  const current = getSharedPermissionRequests();
  let target: PermissionRequest | null = null;
  const now = new Date();
  const waktuStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;

  const updated = current.map(item => {
    if (item.id === id) {
      const qr = `GP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${item.nis.slice(-4)}`;
      target = {
        ...item,
        status: 'GATE_PASS' as const,
        qr_code: qr,
        gate_pass_issued_at: waktuStr,
        audit_trail: [
          ...item.audit_trail,
          {
            id: `aud-pass-${Date.now()}`,
            timestamp: waktuStr,
            action: 'GATE_PASS_ISSUED',
            actor_name: petugas,
            actor_role: 'Kesantrian',
            details: `Surat jalan digital dan QR Gate Pass (${qr}) resmi diterbitkan. Siap dipindai di pos gerbang.`,
          }
        ]
      };
      return target;
    }
    return item;
  });

  saveSharedPermissionRequests(updated);
  return target;
}

export function checkOutSantri(
  id: string, 
  movementData: {
    officer_name?: string;
    gate_location?: string;
    companion_name?: string;
    companion_phone?: string;
    condition_notes?: string;
  } = {}
): PermissionRequest | null {
  const current = getSharedPermissionRequests();
  let target: PermissionRequest | null = null;
  const now = new Date();
  const waktuStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;
  const timeOnly = now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB';
  const dateOnly = now.toISOString().slice(0, 10);

  const officer = movementData.officer_name || 'Pak Subandi (Satpam Gerbang Utama)';
  const location = movementData.gate_location || 'Gerbang Utama & Portal Pos Satpam';

  const updated = current.map(item => {
    if (item.id === id) {
      const newMovement: GateMovement = {
        id: `gm-out-${Date.now()}`,
        type: 'CHECK_OUT',
        timestamp: timeOnly,
        date: dateOnly,
        officer_name: officer,
        gate_location: location,
        companion_name: movementData.companion_name || item.nama_penjemput,
        companion_phone: movementData.companion_phone || item.kontak_wali,
        condition_notes: movementData.condition_notes || 'Santri berpakaian rapi, membawa surat izin dan dijemput mahrom.',
      };

      target = {
        ...item,
        status: 'SANTRI_OUTSIDE' as const,
        gate_movements: [...item.gate_movements, newMovement],
        audit_trail: [
          ...item.audit_trail,
          {
            id: `aud-out-${Date.now()}`,
            timestamp: waktuStr,
            action: 'CHECKED_OUT',
            actor_name: officer,
            actor_role: 'Satpam Gerbang',
            details: `Santri keluar gerbang pada ${timeOnly}. Status: SANTRI_OUTSIDE.`,
          }
        ]
      };
      return target;
    }
    return item;
  });

  saveSharedPermissionRequests(updated);
  return target;
}

export function checkInSantri(
  id: string,
  movementData: {
    officer_name?: string;
    gate_location?: string;
    condition_notes?: string;
  } = {}
): PermissionRequest | null {
  const current = getSharedPermissionRequests();
  let target: PermissionRequest | null = null;
  const now = new Date();
  const waktuStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;
  const timeOnly = now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB';
  const dateOnly = now.toISOString().slice(0, 10);

  const officer = movementData.officer_name || 'Pak Subandi (Satpam Gerbang Utama)';
  const location = movementData.gate_location || 'Gerbang Utama & Portal Pos Satpam';

  const updated = current.map(item => {
    if (item.id === id) {
      const batasKembali = new Date(item.rencana_kembali.replace(' ', 'T'));
      const isLate = !isNaN(batasKembali.getTime()) && now.getTime() > batasKembali.getTime();
      const diffMinutes = isLate ? Math.round((now.getTime() - batasKembali.getTime()) / 60000) : 0;

      const newMovement: GateMovement = {
        id: `gm-in-${Date.now()}`,
        type: 'CHECK_IN',
        timestamp: timeOnly,
        date: dateOnly,
        officer_name: officer,
        gate_location: location,
        condition_notes: movementData.condition_notes || (isLate ? `Kembali terlambat ${diffMinutes} menit.` : 'Kembali tepat waktu dengan selamat.'),
        late_minutes: isLate ? diffMinutes : 0,
      };

      const newStatus = isLate ? ('CASE_REVIEW' as const) : ('RETURNED' as const);

      target = {
        ...item,
        status: newStatus,
        menit_terlambat: isLate ? diffMinutes : 0,
        gate_movements: [...item.gate_movements, newMovement],
        audit_trail: [
          ...item.audit_trail,
          {
            id: `aud-in-${Date.now()}`,
            timestamp: waktuStr,
            action: isLate ? 'CHECKED_IN_LATE' : 'RETURNED_ON_TIME',
            actor_name: officer,
            actor_role: 'Satpam Gerbang',
            details: isLate 
              ? `Santri kembali terlambat ${diffMinutes} menit pada ${timeOnly}. Status dialihkan ke CASE_REVIEW untuk investigasi kesantrian.`
              : `Santri kembali tepat waktu pada ${timeOnly}. Sesi izin ditutup sempurna (RETURNED).`,
          }
        ]
      };
      return target;
    }
    return item;
  });

  saveSharedPermissionRequests(updated);
  return target;
}

export function startCaseReview(id: string, reviewer: string = 'Ust. Rahmat, S.Pd (Kesantrian)'): PermissionRequest | null {
  const current = getSharedPermissionRequests();
  let target: PermissionRequest | null = null;
  const now = new Date();
  const waktuStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;

  const updated = current.map(item => {
    if (item.id === id) {
      target = {
        ...item,
        status: 'CASE_REVIEW' as const,
        audit_trail: [
          ...item.audit_trail,
          {
            id: `aud-cr-start-${Date.now()}`,
            timestamp: waktuStr,
            action: 'CASE_REVIEW_OPENED',
            actor_name: reviewer,
            actor_role: 'Kesantrian',
            details: `Kasus keterlambatan dibuka untuk sidang/peninjauan klarifikasi alasan.`,
          }
        ]
      };
      return target;
    }
    return item;
  });

  saveSharedPermissionRequests(updated);
  return target;
}

export function submitCaseReview(
  id: string,
  review: {
    reviewer_name: string;
    reviewer_role: string;
    category: 'KENDARAAN_MOGOK_MACET' | 'DARURAT_MEDIS_KELUARGA' | 'CUACA_BENCANA' | 'KELALAIAN_SANTRI' | 'LAINNYA';
    explanation: string;
    supporting_evidence?: string;
    decision: 'EXCUSED' | 'VIOLATION';
    decision_rationale: string;
    discipline_points?: number;
    sanction_action?: string;
  }
): PermissionRequest | null {
  const current = getSharedPermissionRequests();
  let target: PermissionRequest | null = null;
  const now = new Date();
  const waktuStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour12: false })} WIB`;

  const updated = current.map(item => {
    if (item.id === id) {
      let linkedDisciplineId: string | undefined = undefined;

      // JIKA PUTUSAN VIOLATION -> OTOMATIS CATAT KE MODUL DISIPLIN PESANTREN
      if (review.decision === 'VIOLATION') {
        const points = review.discipline_points ? -Math.abs(review.discipline_points) : -10;
        const newDiscipline = addSharedDisciplineRecord({
          santri: item.nama,
          nis: item.nis,
          tipe: 'pelanggaran',
          kategori: `Pelanggaran Perizinan (OVERDUE +${item.menit_terlambat || 30}m)`,
          poin: points,
          tindakan: review.sanction_action || 'Iqob Tarbawi: Piket Kebersihan Asrama & Hafalan Al-Qur\'an',
          tanggal: now.toISOString().split('T')[0],
          permission_id: item.id,
        });
        linkedDisciplineId = newDiscipline.id;
      }

      const caseReviewRecord: CaseReviewRecord = {
        id: `cr-${Date.now()}`,
        reviewed_at: waktuStr,
        reviewer_name: review.reviewer_name,
        reviewer_role: review.reviewer_role,
        category: review.category,
        explanation: review.explanation,
        supporting_evidence: review.supporting_evidence,
        decision: review.decision,
        decision_rationale: review.decision_rationale,
        discipline_points: review.decision === 'VIOLATION' ? (review.discipline_points || -10) : 0,
        sanction_action: review.sanction_action,
        linked_discipline_id: linkedDisciplineId,
      };

      const finalStatus: PermissionStatus = review.decision === 'EXCUSED' ? 'EXCUSED' : 'VIOLATION';

      target = {
        ...item,
        status: finalStatus,
        case_review: caseReviewRecord,
        audit_trail: [
          ...item.audit_trail,
          {
            id: `aud-cr-res-${Date.now()}`,
            timestamp: waktuStr,
            action: review.decision === 'EXCUSED' ? 'CASE_RESOLVED_EXCUSED' : 'CASE_RESOLVED_VIOLATION',
            actor_name: review.reviewer_name,
            actor_role: review.reviewer_role,
            details: review.decision === 'EXCUSED'
              ? `Sidang Kesantrian memutuskan: EXCUSED (Dispensasi alasan sah diterima, 0 poin sanksi). Catatan: ${review.decision_rationale}`
              : `Sidang Kesantrian memutuskan: VIOLATION (${review.discipline_points || -10} poin pelanggaran tercatat). Tindakan: ${review.sanction_action}`,
          }
        ]
      };
      return target;
    }
    return item;
  });

  saveSharedPermissionRequests(updated);
  return target;
}


// ============================================================================
// 8. DISCIPLINE & REWARD STORE (TERINTEGRASI DENGAN CASE REVIEW PERIZINAN)
// ============================================================================

export interface DisciplineRecord {
  id: string;
  santri: string;
  nis: string;
  tipe: 'reward' | 'pelanggaran' | 'adab';
  kategori: string;
  poin: number;
  tindakan: string;
  tanggal: string;
  permission_id?: string;
}

const DEFAULT_DISCIPLINE_RECORDS: DisciplineRecord[] = [
  {
    id: 'rec-adab-1',
    santri: 'Muhammad Al-Fatih',
    nis: '202601001',
    tipe: 'adab',
    kategori: 'Adab Berbicara Sopan & Tawadhu kepada Asatidz',
    poin: +5,
    tindakan: 'Catatan Karakter Mulia: Santri berakhlak terpuji di kelas & asrama',
    tanggal: '2026-10-04',
  },
  {
    id: 'rec-adab-2',
    santri: 'Bilal Habasyi',
    nis: '202601018',
    tipe: 'adab',
    kategori: 'Adab Sunnah: Menjaga Ketenangan & Dzikir di Masjid Sebelum Iqamah',
    poin: +5,
    tindakan: 'Teladan ketenangan ibadah di barisan shaf terdepan',
    tanggal: '2026-10-03',
  },
  {
    id: 'rec-1',
    santri: 'Muhammad Al-Fatih',
    nis: '202601001',
    tipe: 'reward',
    kategori: 'Juara 1 MHQ 5 Juz Tingkat Provinsi',
    poin: +25,
    tindakan: 'Apresiasi Piagam & Hadiah Khusus Pondok',
    tanggal: '2026-10-02',
  },
  {
    id: 'rec-2',
    santri: 'Bilal Habasyi',
    nis: '202601018',
    tipe: 'reward',
    kategori: 'Santri Teladan Disiplin Sholat Subuh',
    poin: +10,
    tindakan: 'Bebas Antrean Laundry 1 Pekan',
    tanggal: '2026-10-01',
  },
  {
    id: 'rec-3',
    santri: 'Ahmad Zaki Mubarak',
    nis: '202601015',
    tipe: 'pelanggaran',
    kategori: 'Terlambat Masuk Masjid Sholat Ashar',
    poin: -5,
    tindakan: 'Iqob Tarbawi: Murajaah Surah Al-Waqiah 1x',
    tanggal: '2026-10-03',
  },
  {
    id: 'rec-violation-01',
    santri: 'Ali Zainal Abidin',
    nis: '202601034',
    tipe: 'pelanggaran',
    kategori: 'Pelanggaran Perizinan (OVERDUE +150m)',
    poin: -10,
    tindakan: 'Iqob Tarbawi: Piket pembersihan masjid pondok selama 3 hari dan hafalan Surah Al-Mulk',
    tanggal: '2026-10-01',
    permission_id: 'pr-7',
  },
  {
    id: 'rec-adab-3',
    santri: 'Fathimah Az-Zahra',
    nis: '202602001',
    tipe: 'adab',
    kategori: 'Adab Hijab Syar\'i & Hafizhah Teladan Asrama Putri',
    poin: +5,
    tindakan: 'Teladan busana syar\'i & kerapihan kamar Asrama Khadijah',
    tanggal: '2026-10-04',
  },
  {
    id: 'rec-4',
    santri: 'Maryam Al-Batul',
    nis: '202602002',
    tipe: 'reward',
    kategori: 'Juara 1 Kaligrafi Arab & Mushaf Al-Qur\'an Tingkat Kota',
    poin: +20,
    tindakan: 'Piagam Penghargaan & Karya Dipajang di Gedung Khadijah Putri',
    tanggal: '2026-10-03',
  },
  {
    id: 'rec-5',
    santri: 'Aisyah Humaira',
    nis: '202602003',
    tipe: 'pelanggaran',
    kategori: 'Terlambat Masuk Halaqah Sore Putri',
    poin: -5,
    tindakan: 'Iqob Tarbawi: Murajaah Juz 30 di Musholla Gedung Khadijah',
    tanggal: '2026-10-02',
  },
];

export function getSharedDisciplineRecords(): DisciplineRecord[] {
  if (isTenantMode()) {
    try {
      const raw = localStorage.getItem('ks_tenant_discipline_records_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  if (typeof window === 'undefined') return DEFAULT_DISCIPLINE_RECORDS;
  try {
    const raw = localStorage.getItem('ks_discipline_records_v2');
    if (!raw) {
      localStorage.setItem('ks_discipline_records_v2', JSON.stringify(DEFAULT_DISCIPLINE_RECORDS));
      return DEFAULT_DISCIPLINE_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DISCIPLINE_RECORDS;
  }
}

export function saveSharedDisciplineRecords(list: DisciplineRecord[]): void {
  if (typeof window !== 'undefined') {
    if (isTenantMode()) {
      localStorage.setItem('ks_tenant_discipline_records_v1', JSON.stringify(list));
    } else {
      localStorage.setItem('ks_discipline_records_v2', JSON.stringify(list));
    }
    window.dispatchEvent(new CustomEvent('ks_discipline_updated', { detail: list }));
  }
}

export function addSharedDisciplineRecord(record: Omit<DisciplineRecord, 'id'>): DisciplineRecord {
  const current = getSharedDisciplineRecords();
  const newRec: DisciplineRecord = {
    ...record,
    id: `rec-${Date.now()}`,
  };
  const updated = [newRec, ...current];
  saveSharedDisciplineRecords(updated);
  return newRec;
}

// ============================================================================
// WALI SANTRI PIN MANAGEMENT (Default: 4 digit terakhir nomor HP)
// ============================================================================

export function getWaliDefaultPin(phoneNumber?: string): string {
  if (!phoneNumber) return '1234';
  const digits = phoneNumber.replace(/[^0-9]/g, '');
  if (digits.length >= 4) {
    return digits.slice(-4);
  }
  return digits.padStart(4, '0');
}

export function getWaliCustomPin(nis: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ks_wali_custom_pins_v1');
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[nis.trim()] || null;
  } catch {
    return null;
  }
}

export function saveWaliCustomPin(nis: string, newPin: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('ks_wali_custom_pins_v1');
    const map = raw ? JSON.parse(raw) : {};
    map[nis.trim()] = newPin.trim();
    localStorage.setItem('ks_wali_custom_pins_v1', JSON.stringify(map));
  } catch {}
}

// ============================================================================
// 12. UNIFIED ARUS KAS & LEDGER (PEMISAHAN TEGAS CASH VS TRANSFER BANK)
// Kategori Masuk: SPP, INFAQ, TABUNGAN (Uang Jajan)
// Kategori Keluar: PENGELUARAN_OPERASIONAL (Rumah Tangga & KBM)
// ============================================================================

export interface TransaksiKasRecord {
  id: string;
  nomor_transaksi: string;
  tanggal: string; // YYYY-MM-DD
  waktu?: string; // HH:MM
  tipe: 'MASUK' | 'KELUAR';
  kategori: 'SPP' | 'INFAQ' | 'TABUNGAN' | 'PENGELUARAN_OPERASIONAL';
  kategori_label: string;
  nama_pihak: string; // Santri, Donatur, atau Vendor/Penerima
  nis?: string;
  nominal: number;
  metode: 'CASH' | 'TRANSFER'; // IMMUTABLE: Pembeda tegas Kas Tunai (Cash) vs Rekening Bank
  rekening_id?: string;
  rekening_nama?: string;
  keterangan: string;
  petugas: string;
  created_at: string;
}

export const DEFAULT_TRANSAKSI_KAS: TransaksiKasRecord[] = [
  // --- SPP (Transfer & Cash) ---
  {
    id: 'trx-spp-1',
    nomor_transaksi: 'TRX-202610-SPP01',
    tanggal: '2026-10-02',
    waktu: '09:15',
    tipe: 'MASUK',
    kategori: 'SPP',
    kategori_label: 'SPP Santri Bulanan',
    nama_pihak: 'Muhammad Al-Fatih',
    nis: '202601001',
    nominal: 500000,
    metode: 'TRANSFER',
    rekening_id: 'rek-1',
    rekening_nama: 'Bank Syariah Indonesia (BSI) - 7142098811',
    keterangan: 'SPP Bulan Oktober 2026 via BSI Virtual Account',
    petugas: 'Staf Keuangan',
    created_at: '2026-10-02T09:15:00Z',
  },
  {
    id: 'trx-spp-2',
    nomor_transaksi: 'TRX-202610-SPP02',
    tanggal: '2026-10-01',
    waktu: '14:02',
    tipe: 'MASUK',
    kategori: 'SPP',
    kategori_label: 'SPP Santri Bulanan',
    nama_pihak: 'Fathimah Az-Zahra',
    nis: '202602004',
    nominal: 600000,
    metode: 'TRANSFER',
    rekening_id: 'rek-1',
    rekening_nama: 'Bank Syariah Indonesia (BSI) - 7142098811',
    keterangan: 'SPP Bulan Oktober 2026 via Transfer BSI',
    petugas: 'Staf Keuangan',
    created_at: '2026-10-01T14:02:00Z',
  },
  {
    id: 'trx-spp-3',
    nomor_transaksi: 'TRX-202610-SPP03',
    tanggal: '2026-10-03',
    waktu: '11:20',
    tipe: 'MASUK',
    kategori: 'SPP',
    kategori_label: 'SPP Santri Bulanan',
    nama_pihak: 'Bilal Habasyi',
    nis: '202601018',
    nominal: 250000,
    metode: 'CASH',
    keterangan: 'Pembayaran sebagian SPP tunai langsung di kasir pondok',
    petugas: 'Staf Keuangan',
    created_at: '2026-10-03T11:20:00Z',
  },
  {
    id: 'trx-spp-4',
    nomor_transaksi: 'TRX-202610-SPP04',
    tanggal: '2026-10-04',
    waktu: '10:05',
    tipe: 'MASUK',
    kategori: 'SPP',
    kategori_label: 'SPP Santri Bulanan',
    nama_pihak: 'Salman Al-Farisi',
    nis: '202601025',
    nominal: 500000,
    metode: 'CASH',
    keterangan: 'Pelunasan SPP tunai di loket bendahara pesantren',
    petugas: 'Staf Keuangan',
    created_at: '2026-10-04T10:05:00Z',
  },

  // --- INFAQ / DONASI (Transfer & Cash) ---
  {
    id: 'trx-inf-1',
    nomor_transaksi: 'TRX-202610-INF01',
    tanggal: '2026-10-02',
    waktu: '13:40',
    tipe: 'MASUK',
    kategori: 'INFAQ',
    kategori_label: 'Infaq & Shadaqah Pembangunan',
    nama_pihak: 'H. Syamsul Bahri',
    nominal: 5000000,
    metode: 'TRANSFER',
    rekening_id: 'rek-3',
    rekening_nama: 'Bank Mandiri Syariah / BSI Infaq - 8899002233',
    keterangan: 'Infaq donasi pembangunan asrama tahfidz baru',
    petugas: 'Bendahara Yayasan',
    created_at: '2026-10-02T13:40:00Z',
  },
  {
    id: 'trx-inf-2',
    nomor_transaksi: 'TRX-202610-INF02',
    tanggal: '2026-10-03',
    waktu: '16:00',
    tipe: 'MASUK',
    kategori: 'INFAQ',
    kategori_label: 'Infaq Pengembangan Pendidikan',
    nama_pihak: 'Hamba Allah (Alumni)',
    nominal: 2500000,
    metode: 'TRANSFER',
    rekening_id: 'rek-3',
    rekening_nama: 'Bank Mandiri Syariah / BSI Infaq - 8899002233',
    keterangan: 'Donasi buku perpustakaan & operasional KBM',
    petugas: 'Bendahara Yayasan',
    created_at: '2026-10-03T16:00:00Z',
  },
  {
    id: 'trx-inf-3',
    nomor_transaksi: 'TRX-202610-INF03',
    tanggal: '2026-10-03',
    waktu: '12:30',
    tipe: 'MASUK',
    kategori: 'INFAQ',
    kategori_label: 'Infaq Jumat Masjid Pesantren',
    nama_pihak: 'Jamaah Shalat Jumat',
    nominal: 1850000,
    metode: 'CASH',
    keterangan: 'Penghitungan fisik tromol/kotak infaq shalat Jumat',
    petugas: 'Staf Keuangan',
    created_at: '2026-10-03T12:30:00Z',
  },
  {
    id: 'trx-inf-4',
    nomor_transaksi: 'TRX-202610-INF04',
    tanggal: '2026-10-04',
    waktu: '09:00',
    tipe: 'MASUK',
    kategori: 'INFAQ',
    kategori_label: 'Sedekah Makan Santri',
    nama_pihak: 'Ibu Hj. Aminah',
    nominal: 1000000,
    metode: 'CASH',
    keterangan: 'Titipan sedekah makan siang santri penghafal Al-Qur\'an',
    petugas: 'Staf Keuangan',
    created_at: '2026-10-04T09:00:00Z',
  },

  // --- TABUNGAN SANTRI (Transfer & Cash) ---
  {
    id: 'trx-tab-1',
    nomor_transaksi: 'TRX-202610-TAB01',
    tanggal: '2026-10-01',
    waktu: '08:30',
    tipe: 'MASUK',
    kategori: 'TABUNGAN',
    kategori_label: 'Top-Up Tabungan Santri',
    nama_pihak: 'Muhammad Al-Fatih',
    nis: '202601001',
    nominal: 200000,
    metode: 'TRANSFER',
    rekening_id: 'rek-2',
    rekening_nama: 'Bank Muamalat - 1098445521',
    keterangan: 'Top-up saldo e-Pocket via transfer m-Banking wali',
    petugas: 'Bagian Kesantrian',
    created_at: '2026-10-01T08:30:00Z',
  },
  {
    id: 'trx-tab-2',
    nomor_transaksi: 'TRX-202610-TAB02',
    tanggal: '2026-10-02',
    waktu: '10:15',
    tipe: 'MASUK',
    kategori: 'TABUNGAN',
    kategori_label: 'Top-Up Tabungan Santri',
    nama_pihak: 'Fathimah Az-Zahra',
    nis: '202602004',
    nominal: 300000,
    metode: 'TRANSFER',
    rekening_id: 'rek-2',
    rekening_nama: 'Bank Muamalat - 1098445521',
    keterangan: 'Top-up saldo tabungan santri transfer rekening',
    petugas: 'Bagian Kesantrian',
    created_at: '2026-10-02T10:15:00Z',
  },
  {
    id: 'trx-tab-3',
    nomor_transaksi: 'TRX-202610-TAB03',
    tanggal: '2026-10-03',
    waktu: '15:20',
    tipe: 'MASUK',
    kategori: 'TABUNGAN',
    kategori_label: 'Setor Tunai Tabungan Santri',
    nama_pihak: 'Bilal Habasyi',
    nis: '202601018',
    nominal: 50000,
    metode: 'CASH',
    keterangan: 'Setoran uang saku titipan orang tua tunai ke kasir pondok',
    petugas: 'Bagian Kesantrian',
    created_at: '2026-10-03T15:20:00Z',
  },
  {
    id: 'trx-tab-4',
    nomor_transaksi: 'TRX-202610-TAB04',
    tanggal: '2026-10-04',
    waktu: '11:45',
    tipe: 'MASUK',
    kategori: 'TABUNGAN',
    kategori_label: 'Setor Tunai Tabungan Santri',
    nama_pihak: 'Fatih Al-Ayyubi',
    nis: '202601021',
    nominal: 100000,
    metode: 'CASH',
    keterangan: 'Setor tunai tabungan mingguan santri di loket kantor',
    petugas: 'Bagian Kesantrian',
    created_at: '2026-10-04T11:45:00Z',
  },

  // --- PENGELUARAN OPERASIONAL (Transfer & Cash) ---
  {
    id: 'trx-kel-1',
    nomor_transaksi: 'TRX-202610-EXP01',
    tanggal: '2026-10-03',
    waktu: '14:00',
    tipe: 'KELUAR',
    kategori: 'PENGELUARAN_OPERASIONAL',
    kategori_label: 'Belanja Pokok Dapur (Beras)',
    nama_pihak: 'Toko Beras Barokah Jaya',
    nominal: 7200000,
    metode: 'TRANSFER',
    rekening_id: 'rek-1',
    rekening_nama: 'Bank Syariah Indonesia (BSI) - 7142098811',
    keterangan: 'Pembelian 10 Karung Beras Pandan Wangi Bulanan Santri',
    petugas: 'Bagian Keuangan',
    created_at: '2026-10-03T14:00:00Z',
  },
  {
    id: 'trx-kel-2',
    nomor_transaksi: 'TRX-202610-EXP02',
    tanggal: '2026-10-03',
    waktu: '15:30',
    tipe: 'KELUAR',
    kategori: 'PENGELUARAN_OPERASIONAL',
    kategori_label: 'Buku & Modul KBM Mudir',
    nama_pihak: 'Penerbit CV Pustaka Mulia',
    nominal: 2800000,
    metode: 'TRANSFER',
    rekening_id: 'rek-1',
    rekening_nama: 'Bank Syariah Indonesia (BSI) - 7142098811',
    keterangan: 'Pengadaan Buku Pelajaran Bahasa Arab & Kertas Ujian Semester Ganjil',
    petugas: 'Bagian Keuangan',
    created_at: '2026-10-03T15:30:00Z',
  },
  {
    id: 'trx-kel-3',
    nomor_transaksi: 'TRX-202610-EXP03',
    tanggal: '2026-10-04',
    waktu: '07:30',
    tipe: 'KELUAR',
    kategori: 'PENGELUARAN_OPERASIONAL',
    kategori_label: 'Belanja Sayur & Bumbu Dapur',
    nama_pihak: 'Pasar Tradisional / Pak Maryono',
    nominal: 750000,
    metode: 'CASH',
    keterangan: 'Belanja sayur segar, minyak & bumbu dapur pekanan santri',
    petugas: 'Bagian Keuangan',
    created_at: '2026-10-04T07:30:00Z',
  },
  {
    id: 'trx-kel-4',
    nomor_transaksi: 'TRX-202610-EXP04',
    tanggal: '2026-10-02',
    waktu: '16:00',
    tipe: 'KELUAR',
    kategori: 'PENGELUARAN_OPERASIONAL',
    kategori_label: 'Logistik Keamanan & Patroli',
    nama_pihak: 'Toko Elektronik Sentosa',
    nominal: 850000,
    metode: 'CASH',
    keterangan: 'Pengadaan Handy Talkie (HT) & Lampu Senter Patroli Satpam',
    petugas: 'Bagian Keuangan',
    created_at: '2026-10-02T16:00:00Z',
  },
  {
    id: 'trx-kel-5',
    nomor_transaksi: 'TRX-202610-EXP05',
    tanggal: '2026-10-04',
    waktu: '13:00',
    tipe: 'KELUAR',
    kategori: 'PENGELUARAN_OPERASIONAL',
    kategori_label: 'Token Listrik Darurat Asrama',
    nama_pihak: 'Loket PLN / Kasir Mandiri',
    nominal: 200000,
    metode: 'CASH',
    keterangan: 'Pembelian token darurat gardu asrama santri putra',
    petugas: 'Bagian Keuangan',
    created_at: '2026-10-04T13:00:00Z',
  },
];

export function getSharedTransaksiKasList(): TransaksiKasRecord[] {
  if (isTenantMode()) {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('ks_tenant_transaksi_kas_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  if (typeof window === 'undefined') return DEFAULT_TRANSAKSI_KAS;
  try {
    const raw = localStorage.getItem('ks_transaksi_kas_v2');
    if (!raw) {
      localStorage.setItem('ks_transaksi_kas_v2', JSON.stringify(DEFAULT_TRANSAKSI_KAS));
      return DEFAULT_TRANSAKSI_KAS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TRANSAKSI_KAS;
  }
}

export function saveSharedTransaksiKas(
  transaksi: Omit<TransaksiKasRecord, 'id' | 'created_at'>
): TransaksiKasRecord {
  const current = getSharedTransaksiKasList();
  const newRecord: TransaksiKasRecord = {
    ...transaksi,
    id: `trx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
  };

  const updated = [newRecord, ...current];
  if (typeof window !== 'undefined') {
    if (isTenantMode()) {
      localStorage.setItem('ks_tenant_transaksi_kas_v1', JSON.stringify(updated));
    } else {
      localStorage.setItem('ks_transaksi_kas_v2', JSON.stringify(updated));
    }
    window.dispatchEvent(new CustomEvent('ks_kas_updated', { detail: newRecord }));
  }
  return newRecord;
}

export function deleteSharedTransaksiKas(id: string): void {
  const current = getSharedTransaksiKasList();
  const updated = current.filter(t => t.id !== id);
  if (typeof window !== 'undefined') {
    if (isTenantMode()) {
      localStorage.setItem('ks_tenant_transaksi_kas_v1', JSON.stringify(updated));
    } else {
      localStorage.setItem('ks_transaksi_kas_v2', JSON.stringify(updated));
    }
    window.dispatchEvent(new CustomEvent('ks_kas_updated'));
  }
}

export interface KasRekonsiliasiSummary {
  totalMasukCash: number;
  totalMasukTransfer: number;
  totalMasuk: number;
  totalKeluarCash: number;
  totalKeluarTransfer: number;
  totalKeluar: number;
  saldoCash: number;
  saldoTransfer: number;
  saldoTotal: number;
  byKategori: {
    spp: { cash: number; transfer: number; total: number };
    infaq: { cash: number; transfer: number; total: number };
    tabungan: { cash: number; transfer: number; total: number };
    pengeluaran: { cash: number; transfer: number; total: number };
  };
}

export function getKasSummary(records?: TransaksiKasRecord[]): KasRekonsiliasiSummary {
  const list = records || getSharedTransaksiKasList();

  const summary: KasRekonsiliasiSummary = {
    totalMasukCash: 0,
    totalMasukTransfer: 0,
    totalMasuk: 0,
    totalKeluarCash: 0,
    totalKeluarTransfer: 0,
    totalKeluar: 0,
    saldoCash: 0,
    saldoTransfer: 0,
    saldoTotal: 0,
    byKategori: {
      spp: { cash: 0, transfer: 0, total: 0 },
      infaq: { cash: 0, transfer: 0, total: 0 },
      tabungan: { cash: 0, transfer: 0, total: 0 },
      pengeluaran: { cash: 0, transfer: 0, total: 0 },
    },
  };

  list.forEach(tx => {
    const isMasuk = tx.tipe === 'MASUK';
    const isCash = tx.metode === 'CASH';
    const nominal = Number(tx.nominal) || 0;

    if (isMasuk) {
      if (isCash) {
        summary.totalMasukCash += nominal;
      } else {
        summary.totalMasukTransfer += nominal;
      }
      summary.totalMasuk += nominal;

      if (tx.kategori === 'SPP') {
        if (isCash) summary.byKategori.spp.cash += nominal;
        else summary.byKategori.spp.transfer += nominal;
        summary.byKategori.spp.total += nominal;
      } else if (tx.kategori === 'INFAQ') {
        if (isCash) summary.byKategori.infaq.cash += nominal;
        else summary.byKategori.infaq.transfer += nominal;
        summary.byKategori.infaq.total += nominal;
      } else if (tx.kategori === 'TABUNGAN') {
        if (isCash) summary.byKategori.tabungan.cash += nominal;
        else summary.byKategori.tabungan.transfer += nominal;
        summary.byKategori.tabungan.total += nominal;
      }
    } else {
      // KELUAR
      if (isCash) {
        summary.totalKeluarCash += nominal;
      } else {
        summary.totalKeluarTransfer += nominal;
      }
      summary.totalKeluar += nominal;

      if (tx.kategori === 'PENGELUARAN_OPERASIONAL') {
        if (isCash) summary.byKategori.pengeluaran.cash += nominal;
        else summary.byKategori.pengeluaran.transfer += nominal;
        summary.byKategori.pengeluaran.total += nominal;
      }
    }
  });

  // Saldo Akhir Kas = Total Penerimaan - Total Pengeluaran
  summary.saldoCash = summary.totalMasukCash - summary.totalKeluarCash;
  summary.saldoTransfer = summary.totalMasukTransfer - summary.totalKeluarTransfer;
  summary.saldoTotal = summary.saldoCash + summary.saldoTransfer;

  return summary;
}


