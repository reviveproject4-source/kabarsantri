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
  { id: 'spp', name: 'Keuangan & SPP Digital', desc: 'Tagihan SPP, validasi transfer & kuitansi WhatsApp', category: 'Keuangan' },
  { id: 'presensi', name: 'Presensi Mandiri GPS', desc: 'Presensi guru KBM, staf asrama & pos gerbang', category: 'Operasional' },
  { id: 'wali', name: 'Portal Transparansi Wali', desc: 'Akses wali murid via NIS+PIN pantau mutaba\'ah & izin', category: 'Kemitraan' },
  { id: 'rumah_tangga', name: 'Rumah Tangga & Sarpras', desc: 'Pengajuan belanja dapur, laundry, & poskestren', category: 'Fasilitas' },
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

const STORAGE_KEY = 'ks_yayasan_registrations_v3';
const EVENT_NAME = 'ks_yayasan_registered';

const DEFAULT_REGISTRATIONS: YayasanRegistration[] = [
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REGISTRATIONS));
      // Trigger background sync dari API server
      syncRegistrationsFromServer();
      return DEFAULT_REGISTRATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_REGISTRATIONS;
  } catch {
    return DEFAULT_REGISTRATIONS;
  }
}

export function saveYayasanRegistrations(list: YayasanRegistration[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
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
      
      // Gabungkan berdasarkan id
      const map = new Map<string, YayasanRegistration>();
      localList.forEach(item => map.set(item.id, item));
      serverList.forEach(item => map.set(item.id, item));
      
      const merged = Array.from(map.values());
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
    created_at: new Date().toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const updated = [newReg, ...current];
  saveYayasanRegistrations(updated);

  // Simpan ke API Server terpusat
  try {
    await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReg),
    });
  } catch {}

  // Simpan ke Supabase jika tabel sudah dibuat
  try {
    await supabase.from('yayasan_registrations').insert({
      id: newReg.id,
      nama_yayasan: newReg.nama_yayasan,
      nama_pimpinan: newReg.nama_pimpinan,
      no_whatsapp: newReg.no_whatsapp,
      email: newReg.email,
      kota: newReg.kota,
      estimasi_santri: newReg.estimasi_santri,
      paket_pilihan: newReg.paket_pilihan,
      catatan: newReg.catatan,
      status: 'pending',
      features: newReg.features,
      created_at: new Date().toISOString(),
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
