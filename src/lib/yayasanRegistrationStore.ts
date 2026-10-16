/**
 * KABARSANTRI v2.0 - YAYASAN REGISTRATION & ONBOARDING STORE
 * Menyimpan data pendaftaran yayasan/pesantren dari Welcome Screen
 * sebagai bahan referensi Super Admin untuk aktivasi lisensi & langganan.
 * Paket HANYA 2: 'Gratis' dan 'Enterprise'.
 */

import { supabase } from './supabaseClient';
import { createNewTenant, SubscriptionTier } from './superAdminStore';

export type PaketType = 'Gratis' | 'Enterprise';

export interface YayasanFeature {
  id: string;
  name: string;
  desc: string;
  category: string;
}

export const AVAILABLE_YAYASAN_FEATURES: YayasanFeature[] = [
  { id: 'tahfidz', name: 'Tahfidz Al-Qur\'an & Hadis', desc: 'Setoran juz, mutaba\'ah, kelancaran & makhraj', category: 'Akademik' },
  { id: 'spp', name: 'Keuangan & SPP Digital', desc: 'Tagihan SPP, validasi transfer, kas pengeluaran & threshold', category: 'Keuangan' },
  { id: 'e_raport', name: 'E-Raport Digital Santri', desc: 'Cetak raport semesteran resmi A4/PDF, penilaian akademik & adab (Add-on Mandiri)', category: 'Akademik' },
  { id: 'wa_gateway', name: 'WhatsApp Notifikasi & Pengingat SPP', desc: 'Fitur WA Cepat & pengingat tagihan SPP ke wali santri (Add-on Berbayar / Non-Free)', category: 'Integrasi' },
  { id: 'wali', name: 'Portal Transparansi Wali', desc: 'Akses wali murid via NIS+PIN pantau mutaba\'ah & izin', category: 'Kemitraan' },
  { id: 'kepegawaian', name: 'Kepegawaian & SDM (HRD)', desc: 'Direktori pegawai, perizinan cuti & struktur pimpinan', category: 'Tata Kelola' },
  { id: 'kbm', name: 'Penilaian KBM & Kurikulum', desc: 'Jadwal belajar, penilaian nilai KBM & ruang guru', category: 'Akademik' },
  { id: 'presensi', name: 'Presensi Mandiri GPS', desc: 'Presensi guru KBM, staf asrama & pos gerbang', category: 'Operasional' },
  { id: 'rumah_tangga', name: 'Rumah Tangga & Sarpras', desc: 'Pengajuan belanja dapur, laundry, & poskestren', category: 'Fasilitas' },
  { id: 'adab', name: 'Kedisiplinan, Adab & Izin', desc: 'Catatan kedisiplinan, reward prestasi & perizinan santri', category: 'Kesantrian' },
  { id: 'akuntansi', name: 'Akuntansi & Buku Besar', desc: 'Double-entry general ledger & laporan konsolidasi', category: 'Keuangan' },
];

export interface YayasanRegistration {
  id: string;
  nama_yayasan: string;
  nama_pimpinan: string;
  no_whatsapp: string;
  email: string;
  kota: string;
  estimasi_santri: string;
  paket_pilihan: PaketType; // 'Gratis' atau 'Enterprise'
  catatan?: string;
  status: 'pending' | 'active' | 'rejected'; // 'pending' = Menunggu ACC Super Admin
  features: string[]; // List ID fitur yang di-ACC oleh Super Admin
  created_at: string;
  activated_tenant_id?: string;
  admin_email?: string;
  admin_temp_password?: string;
}

const PRIMARY_STORAGE_KEY = 'ks_yayasan_registrations_v3';
const ALL_STORAGE_KEYS = [
  'ks_yayasan_registrations_v3',
  'ks_yayasan_registrations_v2',
  'ks_yayasan_registrations_v1',
  'ks_yayasan_registrations',
];
const EVENT_NAME = 'ks_yayasan_registered';

const DEFAULT_REGISTRATIONS: YayasanRegistration[] = [
  {
    id: 'reg-498363',
    nama_yayasan: 'Yayasan Al Kausar',
    nama_pimpinan: 'Ust. Raynd',
    no_whatsapp: '081280320505',
    email: 'admin@al-kausar.kabarsantri.id',
    kota: 'Cibuntu',
    estimasi_santri: '< 50 Santri',
    paket_pilihan: 'Gratis',
    catatan: 'Tenant live resmi teraktivasi (Paket Free + Keuangan & Kepegawaian).',
    status: 'active',
    features: ['tahfidz', 'spp', 'wali', 'kepegawaian'],
    created_at: '2026-10-12 02:01',
    activated_tenant_id: 'tenant-al-kausar-9033',
    admin_email: 'admin@al-kausar.kabarsantri.id',
    admin_temp_password: 'Raynd6304!',
  },
  {
    id: 'reg-001',
    nama_yayasan: 'Yayasan Pondok Pesantren Bina Insan Qurani',
    nama_pimpinan: 'KH. Dr. Muhammad Syamsul Ma\'arif',
    no_whatsapp: '081234567890',
    email: 'sekretariat@binainsan.sch.id',
    kota: 'Bandung, Jawa Barat',
    estimasi_santri: '100 - 300 Santri',
    paket_pilihan: 'Enterprise',
    catatan: 'Prioritas aktivasi modul SPP online dan mutaba\'ah tahfidz asrama.',
    status: 'pending',
    features: ['tahfidz', 'spp', 'presensi', 'wali', 'rumah_tangga', 'akuntansi'],
    created_at: '2026-10-10 14:30',
  },
  {
    id: 'reg-002',
    nama_yayasan: 'Pesantren Tahfidz Darul Hikmah',
    nama_pimpinan: 'Ustadz Ahmad Fauzan, Lc.',
    no_whatsapp: '085712345678',
    email: 'info@darulhikmah.id',
    kota: 'Sleman, D.I. Yogyakarta',
    estimasi_santri: '< 50 Santri',
    paket_pilihan: 'Gratis',
    catatan: 'Pesantren baru rintisan, fokus 30 juz dan adab santri.',
    status: 'active',
    features: ['tahfidz', 'wali'],
    created_at: '2026-10-09 09:15',
    activated_tenant_id: 'tenant-darul-hikmah-001',
    admin_email: 'admin@darulhikmah.kabarsantri.id',
    admin_temp_password: 'Fauzan2026!',
  }
];

export function getYayasanRegistrations(): YayasanRegistration[] {
  if (typeof window === 'undefined') return DEFAULT_REGISTRATIONS;
  try {
    const map = new Map<string, YayasanRegistration>();

    // 1. Masukkan default registrations sebagai baseline
    DEFAULT_REGISTRATIONS.forEach(item => map.set(item.id, item));

    // 2. Scan SEMUA versi key localStorage (v3, v2, v1, legacy) agar input yayasan tidak pernah hilang!
    for (const key of ALL_STORAGE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: YayasanRegistration) => {
              if (item && item.id && item.nama_yayasan) {
                map.set(item.id, item);
              }
            });
          }
        }
      } catch {}
    }

    // 3. Cek cadangan data registrasi tersimpan di perangkat
    try {
      const backupRaw = localStorage.getItem('ks_pending_registration_data');
      if (backupRaw) {
        const backupItem = JSON.parse(backupRaw);
        if (backupItem && backupItem.id && backupItem.nama_yayasan) {
          map.set(backupItem.id, backupItem);
        }
      }
    } catch {}

    const list = Array.from(map.values());

    // Urutkan: Yayasan yang statusnya pending atau baru mendaftar tampil di PALING ATAS!
    list.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      const timeA = new Date(a.created_at || 0).getTime() || 0;
      const timeB = new Date(b.created_at || 0).getTime() || 0;
      if (timeA !== timeB) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });

    // Sinkronkan kembali ke semua key
    try {
      const payload = JSON.stringify(list);
      for (const key of ALL_STORAGE_KEYS) {
        localStorage.setItem(key, payload);
      }
    } catch {}

    return list;
  } catch {
    return DEFAULT_REGISTRATIONS;
  }
}

export function saveYayasanRegistrations(list: YayasanRegistration[]): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify(list);
    for (const key of ALL_STORAGE_KEYS) {
      localStorage.setItem(key, payload);
    }
    // Ping cross-tab / cross-window storage event
    localStorage.setItem('ks_reg_timestamp', Date.now().toString());
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: list }));
  } catch (err) {
    console.error('Failed to save yayasan registrations:', err);
  }
}

/**
 * Sinkronisasi otomatis data pendaftaran dari server API / Supabase
 */
export async function syncRegistrationsFromServer(): Promise<YayasanRegistration[]> {
  try {
    const res = await fetch('/api/registrations');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const serverList: YayasanRegistration[] = json.data;
      const localList = getYayasanRegistrations();
      
      const map = new Map<string, YayasanRegistration>();
      // Baseline default
      DEFAULT_REGISTRATIONS.forEach(item => map.set(item.id, item));
      // Server list
      serverList.forEach(item => map.set(item.id, item));
      // Local list (INPUT USER DI WELCOME SCREEN) MENDAPAT PRIORITAS UTAMA DAN TIDAK BOLEH TERTELAN!
      localList.forEach(item => map.set(item.id, item));
      
      const merged = Array.from(map.values());
      merged.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        const timeA = new Date(a.created_at || 0).getTime() || 0;
        const timeB = new Date(b.created_at || 0).getTime() || 0;
        if (timeA !== timeB) return timeB - timeA;
        return (b.id || '').localeCompare(a.id || '');
      });

      saveYayasanRegistrations(merged);
      return merged;
    }
  } catch {}
  return getYayasanRegistrations();
}

/**
 * Mendaftarkan Yayasan Baru dari Welcome Screen (Wajib status 'pending' menunggu ACC)
 */
export async function submitYayasanRegistration(data: {
  nama_yayasan: string;
  nama_pimpinan: string;
  no_whatsapp: string;
  email: string;
  kota: string;
  estimasi_santri: string;
  paket_pilihan: PaketType;
  catatan?: string;
}): Promise<YayasanRegistration> {
  const current = getYayasanRegistrations();

  const paket: PaketType = data.paket_pilihan === 'Enterprise' ? 'Enterprise' : 'Gratis';
  const defaultFeatures = paket === 'Enterprise'
    ? ['tahfidz', 'spp', 'presensi', 'wali', 'rumah_tangga', 'akuntansi']
    : ['tahfidz', 'wali'];

  const nowIso = new Date().toISOString();

  const newReg: YayasanRegistration = {
    id: 'reg-' + Date.now().toString().slice(-6),
    nama_yayasan: data.nama_yayasan.trim(),
    nama_pimpinan: data.nama_pimpinan.trim(),
    no_whatsapp: data.no_whatsapp.trim(),
    email: data.email.trim(),
    kota: data.kota.trim(),
    estimasi_santri: data.estimasi_santri,
    paket_pilihan: paket,
    catatan: data.catatan?.trim() || '',
    status: 'pending', // WAJIB PENDING MENUNGGU ACC SUPER ADMIN
    features: defaultFeatures,
    created_at: nowIso,
  };

  // Tambahkan pendaftaran baru di baris PALING DEPAN
  const updated = [newReg, ...current.filter(r => r.id !== newReg.id)];
  saveYayasanRegistrations(updated);

  // Simpan slot cadangan di perangkat
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('ks_pending_registration_data', JSON.stringify(newReg));
      localStorage.setItem('ks_pending_registration_id', newReg.id);
      localStorage.setItem('ks_pending_registration_nama', newReg.nama_yayasan);
      localStorage.setItem('ks_pending_registration_status', 'pending');
      localStorage.setItem('ks_reg_timestamp', Date.now().toString());
    } catch {}
  }

  // Simpan ke API Server terpusat
  try {
    await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReg),
    });
  } catch {}

  // Simpan ke Supabase jika tabel sudah dibuat (Gunakan UPSERT)
  try {
    await supabase.from('yayasan_registrations').upsert({
      id: newReg.id,
      nama_yayasan: newReg.nama_yayasan,
      nama_pimpinan: newReg.nama_pimpinan,
      no_whatsapp: newReg.no_whatsapp,
      email: newReg.email || null,
      kota: newReg.kota || 'Indonesia',
      estimasi_santri: newReg.estimasi_santri,
      paket_pilihan: newReg.paket_pilihan,
      catatan: newReg.catatan || null,
      status: 'pending',
      features: newReg.features,
      created_at: nowIso,
      updated_at: nowIso,
    });
  } catch {}

  return newReg;
}

/**
 * Super Admin: ACC & Aktivasi Yayasan menjadi Tenant Resmi
 */
export async function activateYayasanRegistration(
  regId: string, 
  customTier?: SubscriptionTier,
  selectedFeatures?: string[]
): Promise<{
  registration: YayasanRegistration;
  credentials: { email: string; pass: string; tenantId: string };
} | null> {
  const current = getYayasanRegistrations();
  const target = current.find(r => r.id === regId);
  if (!target) return null;

  const tier: SubscriptionTier = 
    customTier || (target.paket_pilihan === 'Enterprise' ? 'tier3_enterprise' : 'tier1_free');

  const activeFeatures = selectedFeatures || target.features || (target.paket_pilihan === 'Enterprise'
    ? ['tahfidz', 'spp', 'presensi', 'wali', 'rumah_tangga', 'akuntansi']
    : ['tahfidz', 'wali']);

  // Buat tenant baru di superAdminStore
  const newTenant = createNewTenant({
    name: target.nama_yayasan,
    leader_name: target.nama_pimpinan,
    leader_wa: target.no_whatsapp,
    city: target.kota,
    tier,
    target_launch_date: 'Segera Aktif',
    notes: `Di-ACC oleh Super Admin. Paket: ${target.paket_pilihan}. Fitur: ${activeFeatures.join(', ')}`,
  });

  // Update status registrasi menjadi 'active' (TELAH DI-ACC)
  const updatedRegistration: YayasanRegistration = {
    ...target,
    status: 'active',
    features: activeFeatures,
    activated_tenant_id: newTenant.id,
    admin_email: newTenant.admin_email,
    admin_temp_password: newTenant.admin_temp_password,
  };

  const updatedList = current.map(r => r.id === regId ? updatedRegistration : r);
  saveYayasanRegistrations(updatedList);

  if (typeof window !== 'undefined') {
    if (localStorage.getItem('ks_pending_registration_id') === regId) {
      localStorage.setItem('ks_pending_registration_status', 'active');
    }
  }

  // Sync update ke API server
  try {
    await fetch('/api/registrations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: regId,
        status: 'active',
        features: activeFeatures,
        activated_tenant_id: newTenant.id,
        admin_email: newTenant.admin_email,
        admin_temp_password: newTenant.admin_temp_password,
      }),
    });
  } catch {}

  // Update di Supabase
  try {
    await supabase.from('yayasan_registrations')
      .update({
        status: 'active',
        features: activeFeatures,
        activated_tenant_id: newTenant.id,
        admin_email: newTenant.admin_email,
        admin_temp_password: newTenant.admin_temp_password,
      })
      .eq('id', regId);
  } catch {}

  return {
    registration: updatedRegistration,
    credentials: {
      email: newTenant.admin_email,
      pass: newTenant.admin_temp_password,
      tenantId: newTenant.id,
    },
  };
}

/**
 * Super Admin: Ubah Fitur yang Diberikan ke Yayasan
 */
export async function updateYayasanFeatures(regId: string, features: string[]): Promise<boolean> {
  const current = getYayasanRegistrations();
  const target = current.find(r => r.id === regId);
  if (!target) return false;

  const updated = current.map(r => r.id === regId ? { ...r, features } : r);
  saveYayasanRegistrations(updated);

  try {
    await fetch('/api/registrations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regId, features }),
    });
  } catch {}

  return true;
}

/**
 * Super Admin: Ubah Paket Langganan Yayasan ('Gratis' vs 'Enterprise')
 */
export async function updateYayasanPaket(regId: string, paket: PaketType): Promise<boolean> {
  const current = getYayasanRegistrations();
  const target = current.find(r => r.id === regId);
  if (!target) return false;

  const updated = current.map(r => r.id === regId ? { ...r, paket_pilihan: paket } : r);
  saveYayasanRegistrations(updated);

  try {
    await fetch('/api/registrations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regId, paket_pilihan: paket }),
    });
  } catch {}

  return true;
}

/**
 * Super Admin: Ubah Status Yayasan (pending, active, rejected)
 */
export async function updateYayasanStatus(regId: string, status: YayasanRegistration['status']): Promise<boolean> {
  const current = getYayasanRegistrations();
  const target = current.find(r => r.id === regId);
  if (!target) return false;

  const updated = current.map(r => r.id === regId ? { ...r, status } : r);
  saveYayasanRegistrations(updated);

  try {
    await fetch('/api/registrations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: regId, status }),
    });
  } catch {}

  return true;
}

/**
 * Super Admin: Hapus Data Pendaftaran
 */
export async function deleteYayasanRegistration(regId: string): Promise<boolean> {
  const current = getYayasanRegistrations();
  const updatedList = current.filter(r => r.id !== regId);
  saveYayasanRegistrations(updatedList);

  try {
    await fetch(`/api/registrations?id=${encodeURIComponent(regId)}`, {
      method: 'DELETE',
    });
  } catch {}

  try {
    await supabase.from('yayasan_registrations').delete().eq('id', regId);
  } catch {}

  return true;
}

/**
 * Cek apakah sebuah yayasan / email sudah disetujui oleh Super Admin
 */
export function isYayasanApproved(emailOrTenantId?: string): boolean {
  if (typeof window !== 'undefined') {
    const pendingId = localStorage.getItem('ks_pending_registration_id');
    if (pendingId) {
      const list = getYayasanRegistrations();
      const found = list.find(r => r.id === pendingId);
      if (found && found.status === 'pending') {
        return false;
      }
    }
  }

  if (!emailOrTenantId) return true;
  const list = getYayasanRegistrations();
  const found = list.find(r => 
    r.email?.toLowerCase() === emailOrTenantId.toLowerCase() ||
    r.admin_email?.toLowerCase() === emailOrTenantId.toLowerCase() ||
    r.no_whatsapp === emailOrTenantId ||
    r.activated_tenant_id === emailOrTenantId
  );
  if (found) {
    return found.status === 'active';
  }
  return true;
}

/**
 * Mengambil data pendaftaran yang masih pending di perangkat ini
 */
export function getPendingRegistrationForCurrentDevice(): YayasanRegistration | null {
  if (typeof window === 'undefined') return null;
  const pendingId = localStorage.getItem('ks_pending_registration_id');
  if (!pendingId) return null;
  const list = getYayasanRegistrations();
  const found = list.find(r => r.id === pendingId);
  return found || null;
}

/**
 * Reset kunci pendaftaran di perangkat
 */
export function clearPendingRegistrationLock(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ks_pending_registration_id');
  localStorage.removeItem('ks_pending_registration_nama');
  localStorage.removeItem('ks_pending_registration_status');
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

/**
 * Ganti Password Yayasan (Digunakan di Menu Pengaturan Akun)
 */
export async function updateYayasanPassword(tenantIdOrEmail: string, newPassword: string): Promise<boolean> {
  const current = getYayasanRegistrations();
  const cleanKey = tenantIdOrEmail.toLowerCase().trim();
  let found = false;

  const updated = current.map(r => {
    if (
      (r.activated_tenant_id && r.activated_tenant_id.toLowerCase() === cleanKey) ||
      (r.admin_email && r.admin_email.toLowerCase() === cleanKey) ||
      (r.email && r.email.toLowerCase() === cleanKey) ||
      (r.id && r.id.toLowerCase() === cleanKey)
    ) {
      found = true;
      return {
        ...r,
        admin_temp_password: newPassword,
      };
    }
    return r;
  });

  if (found) {
    saveYayasanRegistrations(updated);
    try {
      await fetch('/api/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: cleanKey,
          admin_temp_password: newPassword,
        }),
      });
    } catch {}
    return true;
  }
  return false;
}

/**
 * Mendapatkan paket dan fitur aktif yang di-ACC Super Admin untuk tenant
 */
export function getActiveTenantPackageAndFeatures(tenantId?: string): {
  paket: PaketType;
  features: string[];
  isEnterprise: boolean;
  isFeatureUnlocked: (featureKey: string) => boolean;
} {
  const registrations = getYayasanRegistrations();
  
  // Cari registrasi tenant berdasarkan tenant_id atau fallback ke Al Kausar (reg-498363)
  const reg = registrations.find(r => 
    (tenantId && (r.activated_tenant_id === tenantId || r.id === tenantId)) ||
    (r.id === 'reg-498363') ||
    (r.status === 'active')
  ) || registrations[0];

  const paket: PaketType = reg?.paket_pilihan || 'Gratis';
  const isEnterprise = paket === 'Enterprise';
  const features = reg?.features || ['tahfidz', 'spp', 'wali', 'kepegawaian'];

  const isFeatureUnlocked = (featureKey: string): boolean => {
    const key = (featureKey || '').toLowerCase();

    // 0. FITUR ADD-ON SPESIFIK: WA GATEWAY & E-RAPORT (Wajib Dicentang Manual oleh Super Admin)
    // Fitur ini tidak diberikan untuk paket Free dan berdiri sendiri di Super Admin
    if (['wa_gateway', 'whatsapp', 'wa'].includes(key)) {
      return features.includes('wa_gateway') || features.includes('whatsapp');
    }
    if (['e_raport', 'raport', 'eraport'].includes(key)) {
      return features.includes('e_raport') || features.includes('raport');
    }

    if (isEnterprise) return true;
    
    // 1. Fitur Standar Dasar Pesantren (Wajib selalu TERBUKA untuk semua yayasan & tenant)
    // Mencakup: Data Santri, Data Pegawai & Kehadiran, Kedisiplinan & Adab/Akhlak, Tahfidz, Dashboard & Pengaturan
    const standardBaselineFeatures = [
      'dashboard', 'yayasan', 'pengaturan', 'laporan', 'ringkasan', 'overview',
      'santri', 'kesiswaan', 'siswa',
      'hrd', 'kepegawaian', 'pegawai',
      'adab', 'disiplin', 'akhlak', 'reward', 'pelanggaran',
      'hafalan', 'tahfidz'
    ];
    if (standardBaselineFeatures.includes(key)) return true;

    // 2. Fitur Tambahan yang Diaktifkan / di-ACC Super Admin
    if (features.includes(key)) return true;

    // 3. Modul Keuangan & SPP (Terbuka penuh jika Super Admin mengaktifkan 'spp' atau 'keuangan')
    if (['finance', 'spp', 'keuangan', 'uang-jajan'].includes(key)) {
      return features.includes('spp') || features.includes('keuangan') || features.includes('finance');
    }

    // 4. Modul Tambahan Lainnya (KBM, Sarpras, Presensi Standalone, Akuntansi)
    if (['kbm', 'nilai'].includes(key) && features.includes('kbm')) return true;
    if (['wali', 'portal-wali'].includes(key) && features.includes('wali')) return true;
    if (['presensi', 'absen'].includes(key) && features.includes('presensi')) return true;
    if (['rumah_tangga', 'sarpras'].includes(key) && features.includes('rumah_tangga')) return true;
    if (['akuntansi'].includes(key) && features.includes('akuntansi')) return true;
    
    return false;
  };

  return {
    paket,
    features,
    isEnterprise,
    isFeatureUnlocked
  };
}

/**
 * Helper untuk mengecek apakah fitur WhatsApp Cepat / Pengingat SPP diaktifkan oleh Super Admin
 */
export function isWhatsAppFeatureEnabled(tenantId?: string): boolean {
  const { isFeatureUnlocked } = getActiveTenantPackageAndFeatures(tenantId);
  return isFeatureUnlocked('wa_gateway');
}

/**
 * Helper untuk mengecek apakah fitur E-Raport Digital Santri diaktifkan oleh Super Admin
 */
export function isERaportFeatureEnabled(tenantId?: string): boolean {
  const { isFeatureUnlocked } = getActiveTenantPackageAndFeatures(tenantId);
  return isFeatureUnlocked('e_raport');
}
