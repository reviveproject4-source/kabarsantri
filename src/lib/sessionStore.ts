/**
 * KABARSANTRI V2 — GLOBAL SESSION & ACTIVE ACTOR STORE
 * Single Source of Truth for current user actor across all modules.
 * Connects Header.tsx role switcher with page-level authorization,
 * salary masking, and approval validation.
 */

'use client';

import { useState, useEffect } from 'react';

export interface TenantUnit {
  id: string;
  name: string;
  code: string;
  type: 'FORMAL_SCHOOL' | 'TAHFIDZ' | 'KESANTRIAN' | 'YAYASAN_OFFICE';
}

/**
 * BRAND APLIKASI KABARSANTRI (PERMANEN / TERKUNCI)
 * Sesuai aturan bisnis: Logo dan identitas aplikasi KabarSantri v2.0
 * tidak dapat ditimpa atau diganti oleh tenant.
 */
export const APP_BRAND = {
  name: 'KabarSantri',
  version: 'v2.0',
  logo_url: '/images/app-logo.png',
  tagline: 'Platform ERP & Parental Engagement Pesantren Modern',
  is_locked: true,
} as const;

export interface TenantInfo {
  id: string;
  name: string;
  code: string;
  city: string;
  units: TenantUnit[];
  logo_url?: string; // Logo Pesantren kustom milik tenant (bisa diganti oleh pesantren)
}

export const DEFAULT_TENANT: TenantInfo = {
  id: 'tenant-pesantren-001',
  name: 'Pondok Pesantren Al-Hikmah Terpadu',
  code: 'ALHIKMAH',
  city: 'Bogor',
  logo_url: '', // Default menggunakan badge/emblem pesantren bawaan
  units: [
    { id: 'unit-mts', name: 'MTs Pesantren Putra', code: 'MTS-PUTRA', type: 'FORMAL_SCHOOL' },
    { id: 'unit-ma', name: 'MA Pesantren Aliyah', code: 'MA-ALIYAH', type: 'FORMAL_SCHOOL' },
    { id: 'unit-tahfidz', name: 'Madrasah Tahfidzul Qur\'an', code: 'TAHFIDZ', type: 'TAHFIDZ' },
    { id: 'unit-asrama', name: 'Pengasuhan & Asrama Santri', code: 'ASRAMA', type: 'KESANTRIAN' },
  ]
};

export const DEMO_TENANT = DEFAULT_TENANT;

export const NURUL_HUDA_TENANT: TenantInfo = {
  id: 'tenant-rabu-001',
  name: 'Pesantren Tahfidz Nurul Huda',
  code: 'NURULHUDA',
  city: 'Kediri, Jawa Timur',
  logo_url: '',
  units: [
    { id: 'unit-tahfidz-nh', name: 'Madrasah Tahfidz Nurul Huda', code: 'TAHFIDZ-NH', type: 'TAHFIDZ' },
    { id: 'unit-asrama-nh', name: 'Asrama Santri Nurul Huda', code: 'ASRAMA-NH', type: 'KESANTRIAN' },
  ]
};

export interface ActiveActor {
  id: string;
  role_key: string;      // Key used in Header switcher (e.g. 'keuangan', 'mudir')
  role_slug: string;     // Canonical role slug in governanceStore (e.g. 'kepala_kepegawaian')
  name: string;
  nip: string;
  title: string;
  dept: string;
  gender: 'ikhwan' | 'akhwat'; // Prinsip Pemisahan Syar'i Pesantren (Ikhwan vs Akhwat)
  tenant_id: string;
  tenant_name: string;
  unit_name?: string;
}

export const MASTER_PILLAR_ACTORS: Record<string, ActiveActor> = {
  yayasan: {
    id: 'emp-yys-001',
    role_key: 'yayasan',
    role_slug: 'ketua_yayasan',
    name: 'KH. Abdullah Faqih, Lc.',
    nip: 'PEG-YYS-001',
    title: 'Ketua Yayasan',
    dept: 'Dewan Pembina / Yayasan (Information Only)',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Kantor Pusat Yayasan'
  },
  wakil_yayasan: {
    id: 'emp-yys-002',
    role_key: 'wakil_yayasan',
    role_slug: 'wakil_yayasan',
    name: 'Drs. H. M. Mansyur, M.Pd.',
    nip: 'PEG-YYS-002',
    title: 'Wakil Ketua Yayasan',
    dept: 'Operasional Yayasan (Approval Authority)',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Kantor Pusat Yayasan'
  },
  kepala_kepegawaian: {
    id: 'emp-hrd-001',
    role_key: 'kepala_kepegawaian',
    role_slug: 'kepala_kepegawaian',
    name: 'Ust. Ir. Faisal Rahman, M.M.',
    nip: 'PEG-HRD-001',
    title: 'Kepala Bagian Kepegawaian (HRD)',
    dept: 'Kepegawaian & SDM (Kelola Orang & Cuti)',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Divisi SDM & Kepegawaian'
  },
  keuangan: {
    id: 'emp-keu-001',
    role_key: 'keuangan',
    role_slug: 'keuangan',
    name: 'Ust. Ahmad Dahlan, S.E.',
    nip: 'PEG-KEU-001',
    title: 'Kepala Bagian Keuangan',
    dept: 'Keuangan & Kompensasi (Nominal Rahasia)',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Biro Keuangan & Akuntansi'
  },
  mudir: {
    id: 'emp-mdr-001',
    role_key: 'mudir',
    role_slug: 'mudir',
    name: 'Dr. KH. Mahmud Ridwan, M.A.',
    nip: 'PEG-MDR-001',
    title: 'Mudir Pesantren / Kepala Madrasah',
    dept: 'Pendidikan & KBM (Guru, Santri & Inval)',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'MTs Pesantren Putra'
  },
  kepala_rumah_tangga: {
    id: 'emp-rt-001',
    role_key: 'kepala_rumah_tangga',
    role_slug: 'kepala_rumah_tangga',
    name: 'Pak Subandi, S.T.',
    nip: 'PEG-RT-001',
    title: 'Kepala Bagian Rumah Tangga',
    dept: 'Rumah Tangga & Sarpras (Fasilitas & Logistik)',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Unit Sarpras & Pemeliharaan'
  },
  guru: {
    id: 'emp-gru-001',
    role_key: 'guru',
    role_slug: 'guru',
    name: 'Ust. Lukman Hakim, M.Kom.',
    nip: 'PEG-GRU-001',
    title: 'Guru TIK & Pengampu Inval KBM Putra',
    dept: 'Pendidikan & KBM (Kampus Putra)',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'MTs Pesantren Putra'
  },
  guru_akhwat: {
    id: 'emp-gru-002',
    role_key: 'guru_akhwat',
    role_slug: 'guru',
    name: 'Usth. Fatimah Az-Zahra, S.Pd.',
    nip: 'PEG-GRU-002',
    title: 'Guru Bahasa Arab & Pembina KBM Putri',
    dept: 'Pendidikan & KBM (Kampus Putri)',
    gender: 'akhwat',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'MTs Pesantren Putri'
  },
  musyrif: {
    id: 'emp-msr-001',
    role_key: 'musyrif',
    role_slug: 'musyrif',
    name: 'Ust. Hamzah al-Bantani',
    nip: 'PEG-MSR-001',
    title: 'Musyrif Asrama Putra Utsman',
    dept: 'Kesantrian & Asrama Putra',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Pengasuhan Asrama Putra'
  },
  musyrifah: {
    id: 'emp-msr-002',
    role_key: 'musyrifah',
    role_slug: 'musyrif',
    name: 'Usth. Siti Khadijah, S.Pd.I.',
    nip: 'PEG-MSR-002',
    title: 'Musyrifah Asrama Putri Khadijah',
    dept: 'Kesantrian & Asrama Putri',
    gender: 'akhwat',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Pengasuhan Asrama Putri'
  },
  laundry: {
    id: 'emp-lnd-001',
    role_key: 'laundry',
    role_slug: 'laundry_rt',
    name: 'Ibu Sumiati',
    nip: 'NIP.LND.2021.013',
    title: 'Koordinator Unit Laundry Pesantren',
    dept: 'Rumah Tangga & Operasional Sarpras',
    gender: 'akhwat',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Unit Laundry Sentral'
  },
  dapur: {
    id: 'emp-dpr-001',
    role_key: 'dapur',
    role_slug: 'dapur_rt',
    name: 'Pak Slamet',
    nip: 'NIP.DPR.2022.019',
    title: 'Staf Juru Masak & Dapur Santri',
    dept: 'Rumah Tangga & Logistik Konsumsi',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Dapur Sentral Pesantren'
  },
  satpam: {
    id: 'emp-sec-001',
    role_key: 'satpam',
    role_slug: 'satpam_rt',
    name: 'Pak Subandi (Satpam)',
    nip: 'NIP.SEC.2020.005',
    title: 'Komandan Regu Satpam & Pos Gerbang',
    dept: 'Keamanan, Ketertiban & Pos Gerbang',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Pos Keamanan Gerbang Utama'
  },
  kasir: {
    id: 'emp-ksr-001',
    role_key: 'kasir',
    role_slug: 'kasir_keuangan',
    name: 'Mbak Anisa, A.Md.',
    nip: 'NIP.KEU.2023.041',
    title: 'Staf Kasir & Loket Pembayaran SPP',
    dept: 'Keuangan & Loket Administrasi SPP',
    gender: 'akhwat',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Loket Pelayanan Keuangan'
  },
  staf_hrd: {
    id: 'emp-hrd-002',
    role_key: 'staf_hrd',
    role_slug: 'staf_hrd',
    name: 'Ust. Wildan Pratama',
    nip: 'NIP.HRD.2024.055',
    title: 'Staf Administrasi & Rekap Presensi SDM',
    dept: 'Kepegawaian & Rekap Presensi Pegawai',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Divisi SDM & Administrasi Pegawai'
  },
  super_admin: {
    id: 'emp-root-001',
    role_key: 'super_admin',
    role_slug: 'super_admin',
    name: 'Super Admin KabarSantri',
    nip: 'ROOT-SYS-001',
    title: 'Super Administrator & Multi-Tenant Console',
    dept: 'Pusat Tata Kelola Multi-Tenant & Kuota',
    gender: 'ikhwan',
    tenant_id: 'tenant-pesantren-001',
    tenant_name: 'Pondok Pesantren Al-Hikmah Terpadu',
    unit_name: 'Pusat Layanan KabarSantri'
  },
  tenant_admin_nh: {
    id: 'emp-nh-001',
    role_key: 'tenant_admin_nh',
    role_slug: 'tenant_admin',
    name: 'Ust. H. Fauzan Mansur, Lc.',
    nip: 'NIP.NH.2026.001',
    title: 'Pengasuh & Administrator Lembaga',
    dept: 'Pimpinan Pesantren Tahfidz Nurul Huda (Tier 1)',
    gender: 'ikhwan',
    tenant_id: 'tenant-rabu-001',
    tenant_name: 'Pesantren Tahfidz Nurul Huda',
    unit_name: 'Pusat Manajemen Pesantren'
  }
};

export function isLeaderActor(roleKey: string): boolean {
  return ['yayasan', 'wakil_yayasan', 'kepala_kepegawaian', 'keuangan', 'mudir', 'kepala_rumah_tangga', 'super_admin', 'tenant_admin_nh'].includes(roleKey);
}

export function isStaffActor(roleKey: string): boolean {
  return ['guru', 'guru_akhwat', 'musyrif', 'musyrifah', 'laundry', 'dapur', 'satpam', 'kasir', 'staf_hrd'].includes(roleKey);
}

const SESSION_ACTOR_STORAGE_KEY = 'ks_active_session_actor_v1';
const SESSION_EVENT_NAME = 'ks_session_actor_changed';

export function getActiveActor(): ActiveActor {
  if (typeof window === 'undefined') return MASTER_PILLAR_ACTORS.yayasan;
  try {
    const mode = getAppMode();
    if (mode === 'tenant') {
      return MASTER_PILLAR_ACTORS.tenant_admin_nh;
    }
    const raw = localStorage.getItem(SESSION_ACTOR_STORAGE_KEY);
    if (!raw) {
      return MASTER_PILLAR_ACTORS.yayasan;
    }
    const parsed = JSON.parse(raw);
    return parsed.role_key && MASTER_PILLAR_ACTORS[parsed.role_key]
      ? MASTER_PILLAR_ACTORS[parsed.role_key]
      : MASTER_PILLAR_ACTORS.yayasan;
  } catch {
    return MASTER_PILLAR_ACTORS.yayasan;
  }
}

export function setActiveActorByRole(roleKey: string): ActiveActor {
  const actor = MASTER_PILLAR_ACTORS[roleKey] || MASTER_PILLAR_ACTORS.yayasan;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SESSION_ACTOR_STORAGE_KEY, JSON.stringify(actor));
      window.dispatchEvent(new CustomEvent(SESSION_EVENT_NAME, { detail: actor }));
    } catch {
      // ignore localstorage errors
    }
  }
  return actor;
}

const TENANT_STORAGE_KEY = 'ks_active_tenant_info_v1';
const TENANT_EVENT_NAME = 'ks_tenant_changed';

export function getActiveTenant(): TenantInfo {
  if (typeof window === 'undefined') return DEFAULT_TENANT;
  try {
    const mode = getAppMode();
    if (mode === 'tenant') {
      const raw = localStorage.getItem(TENANT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.id === 'tenant-rabu-001') return parsed;
      }
      return NURUL_HUDA_TENANT;
    }

    const activeTid = localStorage.getItem('ks_active_tenant_id');
    if (activeTid === 'tenant-rabu-001') {
      const raw = localStorage.getItem(TENANT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.id === 'tenant-rabu-001') return parsed;
      }
      return NURUL_HUDA_TENANT;
    }
    const raw = localStorage.getItem(TENANT_STORAGE_KEY);
    if (!raw) return DEFAULT_TENANT;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TENANT;
  }
}

export function setActiveTenant(tenant: TenantInfo): TenantInfo {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(tenant));
      window.dispatchEvent(new CustomEvent(TENANT_EVENT_NAME, { detail: tenant }));
    } catch {}
  }
  return tenant;
}

/**
 * Update logo khusus pesantren tanpa mengubah logo aplikasi KabarSantri.
 * Aturan Bisnis: Logo aplikasi (APP_BRAND.logo_url) tidak dapat diubah oleh fungsi ini.
 */
export function updateTenantPesantrenLogo(logoUrl: string): TenantInfo {
  const current = getActiveTenant();
  const updated: TenantInfo = {
    ...current,
    logo_url: logoUrl
  };
  return setActiveTenant(updated);
}

export function resetTenantPesantrenLogo(): TenantInfo {
  const current = getActiveTenant();
  const updated: TenantInfo = {
    ...current,
    logo_url: ''
  };
  return setActiveTenant(updated);
}

/**
 * React Hook: useActiveTenant
 * Komponen otomatis re-render saat identitas atau logo pesantren diubah oleh tenant
 */
export function useActiveTenant(): TenantInfo {
  const [tenant, setTenant] = useState<TenantInfo>(DEFAULT_TENANT);

  useEffect(() => {
    setTenant(getActiveTenant());

    const handleTenantChanged = (e: Event) => {
      const custom = e as CustomEvent<TenantInfo>;
      if (custom.detail) {
        setTenant(custom.detail);
      } else {
        setTenant(getActiveTenant());
      }
    };

    window.addEventListener(TENANT_EVENT_NAME, handleTenantChanged);
    return () => {
      window.removeEventListener(TENANT_EVENT_NAME, handleTenantChanged);
    };
  }, []);

  return tenant;
}

/**
 * React Hook: useActiveActor
 * Automatically updates component when active actor changes in Header
 */
export function useActiveActor(): ActiveActor {
  const [actor, setActor] = useState<ActiveActor>(MASTER_PILLAR_ACTORS.yayasan);

  useEffect(() => {
    // Initial sync
    setActor(getActiveActor());

    const handleActorChanged = (e: Event) => {
      const custom = e as CustomEvent<ActiveActor>;
      if (custom.detail) {
        setActor(custom.detail);
      } else {
        setActor(getActiveActor());
      }
    };

    window.addEventListener(SESSION_EVENT_NAME, handleActorChanged);
    return () => {
      window.removeEventListener(SESSION_EVENT_NAME, handleActorChanged);
    };
  }, []);

  return actor;
}

// ============================================================================
// PEMISAHAN JALUR DEMO VS JALUR TENANT
// ============================================================================

export type AppMode = 'demo' | 'tenant';

const APP_MODE_KEY = 'ks_app_mode_v2';
const APP_MODE_EVENT = 'ks_app_mode_changed';

export function getAppMode(): AppMode {
  if (typeof window === 'undefined') return 'demo';
  try {
    // 1. Prioritize URL query parameter (?mode=tenant / ?mode=demo)
    if (typeof window.location !== 'undefined' && window.location.search) {
      if (window.location.search.includes('mode=tenant')) {
        if (localStorage.getItem(APP_MODE_KEY) !== 'tenant') {
          localStorage.setItem(APP_MODE_KEY, 'tenant');
          localStorage.setItem('ks_active_tenant_id', 'tenant-rabu-001');
          document.cookie = 'ks_app_mode=tenant; path=/; max-age=864000';
          document.cookie = 'ks_active_tenant_id=tenant-rabu-001; path=/; max-age=864000';
        }
        return 'tenant';
      }
      if (window.location.search.includes('mode=demo')) {
        if (localStorage.getItem(APP_MODE_KEY) !== 'demo') {
          localStorage.setItem(APP_MODE_KEY, 'demo');
          localStorage.setItem('ks_active_tenant_id', 'tenant-pesantren-001');
          document.cookie = 'ks_app_mode=demo; path=/; max-age=864000';
          document.cookie = 'ks_active_tenant_id=tenant-pesantren-001; path=/; max-age=864000';
        }
        return 'demo';
      }
    }

    const raw = localStorage.getItem(APP_MODE_KEY);
    if (raw === 'tenant' || raw === 'demo') return raw;
    if (document.cookie.includes('ks_app_mode=tenant')) return 'tenant';
    return 'demo';
  } catch {
    return 'demo';
  }
}

export function setAppMode(mode: AppMode, tenantId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APP_MODE_KEY, mode);
    document.cookie = `ks_app_mode=${mode}; path=/; max-age=864000`;
    if (mode === 'tenant') {
      const tid = tenantId || 'tenant-rabu-001';
      localStorage.setItem('ks_active_tenant_id', tid);
      document.cookie = `ks_active_tenant_id=${tid}; path=/; max-age=864000`;
    } else {
      localStorage.setItem('ks_active_tenant_id', 'tenant-pesantren-001');
      document.cookie = `ks_active_tenant_id=tenant-pesantren-001; path=/; max-age=864000`;
    }
    window.dispatchEvent(new CustomEvent(APP_MODE_EVENT, { detail: mode }));
  } catch {}
}

export function useAppMode(): {
  mode: AppMode;
  setMode: (m: AppMode, tenantId?: string) => void;
  isDemo: boolean;
  isTenant: boolean;
} {
  const [mode, setModeState] = useState<AppMode>('demo');

  useEffect(() => {
    setModeState(getAppMode());
    const handler = (e: Event) => {
      const custom = e as CustomEvent<AppMode>;
      setModeState(custom.detail || getAppMode());
    };
    window.addEventListener(APP_MODE_EVENT, handler);
    return () => window.removeEventListener(APP_MODE_EVENT, handler);
  }, []);

  const setMode = (newMode: AppMode, tenantId?: string) => {
    setAppMode(newMode, tenantId);
    setModeState(newMode);
  };

  return {
    mode,
    setMode,
    isDemo: mode === 'demo',
    isTenant: mode === 'tenant'
  };
}
