/**
 * KABARSANTRI v2.0 - YAYASAN REGISTRATION & ONBOARDING STORE
 * Menyimpan data pendaftaran yayasan/pesantren dari Welcome Screen
 * sebagai bahan referensi Super Admin untuk aktivasi lisensi & langganan.
 */

import { supabase } from './supabaseClient';
import { createNewTenant, SubscriptionTier } from './superAdminStore';

export interface YayasanRegistration {
  id: string;
  nama_yayasan: string;
  nama_pimpinan: string;
  no_whatsapp: string;
  email: string;
  kota: string;
  estimasi_santri: string;
  paket_pilihan: string;
  catatan?: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  activated_tenant_id?: string;
  admin_email?: string;
  admin_temp_password?: string;
}

const STORAGE_KEY = 'ks_yayasan_registrations_v2';
const EVENT_NAME = 'ks_yayasan_registered';

// Default data contoh awal jika belum ada pendaftaran (dapat dihapus/di-clear oleh Super Admin)
const DEFAULT_REGISTRATIONS: YayasanRegistration[] = [
  {
    id: 'reg-001',
    nama_yayasan: 'Yayasan Pondok Pesantren Bina Insan Qurani',
    nama_pimpinan: 'KH. Dr. Muhammad Syamsul Ma\'arif',
    no_whatsapp: '081234567890',
    email: 'sekretariat@binainsan.sch.id',
    kota: 'Bandung, Jawa Barat',
    estimasi_santri: '100 - 300 Santri',
    paket_pilihan: 'Standar Pro Pesantren',
    catatan: 'Prioritas aktivasi modul SPP online dan mutaba\'ah tahfidz asrama.',
    status: 'pending',
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
    paket_pilihan: 'Starter (Gratis 50 Santri)',
    catatan: 'Pesantren baru rintisan, fokus 30 juz dan adab santri.',
    status: 'active',
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
      return DEFAULT_REGISTRATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
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
 * Mendaftarkan Yayasan Baru dari Welcome Screen
 */
export async function submitYayasanRegistration(data: {
  nama_yayasan: string;
  nama_pimpinan: string;
  no_whatsapp: string;
  email: string;
  kota: string;
  estimasi_santri: string;
  paket_pilihan: string;
  catatan?: string;
}): Promise<YayasanRegistration> {
  const current = getYayasanRegistrations();

  const newReg: YayasanRegistration = {
    id: 'reg-' + Date.now().toString().slice(-6),
    nama_yayasan: data.nama_yayasan.trim(),
    nama_pimpinan: data.nama_pimpinan.trim(),
    no_whatsapp: data.no_whatsapp.trim(),
    email: data.email.trim(),
    kota: data.kota.trim(),
    estimasi_santri: data.estimasi_santri,
    paket_pilihan: data.paket_pilihan,
    catatan: data.catatan?.trim() || '',
    status: 'pending',
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

  // Sync ke Supabase secara background (graceful fallback)
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
      created_at: new Date().toISOString(),
    });
  } catch {
    // Graceful offline fallback
  }

  return newReg;
}

/**
 * Super Admin: Aktivasi Yayasan menjadi Tenant Resmi
 */
export function activateYayasanRegistration(regId: string, customTier?: SubscriptionTier): {
  registration: YayasanRegistration;
  credentials: { email: string; pass: string; tenantId: string };
} | null {
  const current = getYayasanRegistrations();
  const target = current.find(r => r.id === regId);
  if (!target) return null;

  // Map paket pilihan to subscription tier
  const tier: SubscriptionTier = 
    customTier || 
    (target.paket_pilihan.toLowerCase().includes('gratis') || target.paket_pilihan.toLowerCase().includes('starter')
      ? 'tier1_free'
      : target.paket_pilihan.toLowerCase().includes('enterprise')
        ? 'tier3_enterprise'
        : 'tier2_pro');

  // Buat tenant baru di superAdminStore
  const newTenant = createNewTenant({
    name: target.nama_yayasan,
    leader_name: target.nama_pimpinan,
    leader_wa: target.no_whatsapp,
    city: target.kota,
    tier,
    target_launch_date: 'Segera Aktif',
    notes: `Diaktivasi dari Welcome Screen (Paket: ${target.paket_pilihan}). ${target.catatan || ''}`,
  });

  // Update status registrasi
  const updatedRegistration: YayasanRegistration = {
    ...target,
    status: 'active',
    activated_tenant_id: newTenant.id,
    admin_email: newTenant.admin_email,
    admin_temp_password: newTenant.admin_temp_password,
  };

  const updatedList = current.map(r => r.id === regId ? updatedRegistration : r);
  saveYayasanRegistrations(updatedList);

  // Background update ke Supabase
  try {
    supabase.from('yayasan_registrations')
      .update({
        status: 'active',
        activated_tenant_id: newTenant.id,
      })
      .eq('id', regId)
      .then();
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
 * Super Admin: Ubah Status Yayasan (Trial, Active, Rejected)
 */
export function updateYayasanStatus(regId: string, status: YayasanRegistration['status']): boolean {
  const current = getYayasanRegistrations();
  const exists = current.some(r => r.id === regId);
  if (!exists) return false;

  const updatedList = current.map(r => r.id === regId ? { ...r, status } : r);
  saveYayasanRegistrations(updatedList);
  return true;
}

/**
 * Super Admin: Hapus Data Pendaftaran
 */
export function deleteYayasanRegistration(regId: string): boolean {
  const current = getYayasanRegistrations();
  const updatedList = current.filter(r => r.id !== regId);
  saveYayasanRegistrations(updatedList);
  return true;
}
