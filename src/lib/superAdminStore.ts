/**
 * KabarSantri v2.0 - Super Admin & Multi-Tenant Onboarding Store
 * Manajemen Pendaftaran Tenant Baru, Pengaturan Kuota & Tier (Free 50 vs Pro),
 * Generator Kredensial Administrator, dan WhatsApp Welcome Generator.
 */

export type SubscriptionTier = 'tier1_free' | 'tier2_pro' | 'tier3_enterprise';

export interface TenantRecord {
  id: string;
  slug: string;
  name: string;
  leader_name: string;
  leader_wa: string;
  city: string;
  tier: SubscriptionTier;
  quota_santri: number;
  current_santri: number;
  status: 'active' | 'trial' | 'pending' | 'suspended';
  created_at: string;
  target_launch_date?: string;
  admin_email: string;
  admin_temp_password: string;
  portal_subdomain: string;
  allowed_features: string[];
  notes?: string;
  welcome_wa_sent?: boolean;
}

const DEFAULT_SUPER_TENANTS: TenantRecord[] = [
  {
    id: 'tenant-pesantren-001',
    slug: 'al-hikmah',
    name: 'Pondok Pesantren Al-Hikmah',
    leader_name: 'Dr. KH. Abdullah Syukri, M.A.',
    leader_wa: '081234567890',
    city: 'Malang, Jawa Timur',
    tier: 'tier2_pro',
    quota_santri: 500,
    current_santri: 450,
    status: 'active',
    created_at: '2026-09-01',
    target_launch_date: '2026-09-01',
    admin_email: 'admin@alhikmah.kabarsantri.id',
    admin_temp_password: 'BerkahPesantren2026!',
    portal_subdomain: 'alhikmah.kabarsantri.id',
    allowed_features: ['tahfidz', 'adab', 'reward', 'pelanggaran', 'kbm', 'keuangan', 'rumah_tangga', 'kepegawaian'],
    notes: 'Tenant Induk Demo (Semua 6 Pilar Lengkap Aktif).',
    welcome_wa_sent: true,
  },
  {
    id: 'tenant-rabu-001',
    slug: 'nurul-huda',
    name: 'Pesantren Tahfidz Nurul Huda',
    leader_name: 'Ust. H. Fauzan Mansur, Lc.',
    leader_wa: '081389012345',
    city: 'Kediri, Jawa Timur',
    tier: 'tier1_free',
    quota_santri: 50,
    current_santri: 42,
    status: 'active',
    created_at: '2026-10-05',
    target_launch_date: '2026-10-07 (Rabu Lusa)',
    admin_email: 'admin@nurulhuda.kabarsantri.id',
    admin_temp_password: 'SantriBaru2026#',
    portal_subdomain: 'nurulhuda.kabarsantri.id',
    allowed_features: ['tahfidz', 'adab', 'reward', 'pelanggaran', 'santri_50', 'wali_portal'],
    notes: 'Tenant Perdana Paket Tier 1 (Free Kuota 50 Santri) - Siap onboarding hari Rabu.',
    welcome_wa_sent: false,
  }
];

const STORAGE_KEY = 'ks_super_admin_tenants_v1';
const ACTIVE_TENANT_KEY = 'ks_active_tenant_id';

export function getSuperAdminTenants(): TenantRecord[] {
  if (typeof window === 'undefined') return DEFAULT_SUPER_TENANTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUPER_TENANTS));
      return DEFAULT_SUPER_TENANTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SUPER_TENANTS;
  }
}

export function saveSuperAdminTenants(tenants: TenantRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
    window.dispatchEvent(new CustomEvent('ks_tenants_updated', { detail: tenants }));
  } catch (err) {
    console.error('Failed to save tenants:', err);
  }
}

export function createNewTenant(data: {
  name: string;
  leader_name: string;
  leader_wa: string;
  city: string;
  tier: SubscriptionTier;
  target_launch_date?: string;
  notes?: string;
}): TenantRecord {
  const current = getSuperAdminTenants();
  
  // Format slug
  const slug = data.name
    .toLowerCase()
    .replace(/pondok|pesantren|tahfidz/gi, '')
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-') || 'pesantren-baru';

  const newId = `tenant-${slug}-${Date.now().toString().slice(-4)}`;
  const quota = data.tier === 'tier1_free' ? 50 : data.tier === 'tier2_pro' ? 250 : 1000;
  
  // Generate random safe temp password
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const cleanLeaderFirstName = data.leader_name.replace(/dr\.|kh\.|ust\.|h\./gi, '').trim().split(' ')[0] || 'Santri';
  const tempPassword = `${cleanLeaderFirstName}${randomNum}!`;

  const newTenant: TenantRecord = {
    id: newId,
    slug,
    name: data.name,
    leader_name: data.leader_name,
    leader_wa: data.leader_wa,
    city: data.city,
    tier: data.tier,
    quota_santri: quota,
    current_santri: 0,
    status: 'active',
    created_at: new Date().toISOString().split('T')[0],
    target_launch_date: data.target_launch_date || 'Segera (Rabu)',
    admin_email: `admin@${slug}.kabarsantri.id`,
    admin_temp_password: tempPassword,
    portal_subdomain: `${slug}.kabarsantri.id`,
    allowed_features: data.tier === 'tier1_free' 
      ? ['tahfidz', 'adab', 'reward', 'pelanggaran', 'santri_50', 'wali_portal']
      : ['tahfidz', 'adab', 'reward', 'pelanggaran', 'kbm', 'keuangan', 'rumah_tangga', 'kepegawaian'],
    notes: data.notes || 'Tenant baru didaftarkan via Super Admin Onboarding.',
    welcome_wa_sent: false,
  };

  const updated = [newTenant, ...current];
  saveSuperAdminTenants(updated);
  return newTenant;
}

export function updateTenantStatus(id: string, status: TenantRecord['status']): TenantRecord | null {
  const current = getSuperAdminTenants();
  let updatedTenant: TenantRecord | null = null;
  const updated = current.map(t => {
    if (t.id === id) {
      updatedTenant = { ...t, status };
      return updatedTenant;
    }
    return t;
  });
  if (updatedTenant) saveSuperAdminTenants(updated);
  return updatedTenant;
}

export function markWelcomeWASent(id: string): void {
  const current = getSuperAdminTenants();
  const updated = current.map(t => {
    if (t.id === id) {
      return { ...t, welcome_wa_sent: true };
    }
    return t;
  });
  saveSuperAdminTenants(updated);
}

/**
 * Format Pesan WhatsApp Selamat Datang & Kredensial untuk Pimpinan Pesantren
 */
export function formatWhatsAppWelcomeMessage(tenant: TenantRecord): string {
  const tierName = tenant.tier === 'tier1_free' 
    ? 'Tier 1 Starter (Gratis Kuota 50 Santri)' 
    : tenant.tier === 'tier2_pro' 
      ? 'Tier 2 Pro Pesantren' 
      : 'Tier 3 Enterprise';

  const fiturList = tenant.tier === 'tier1_free'
    ? `✅ Setoran & Mutaba'ah Hafalan Al-Qur'an (Tahfidz)
✅ Pembinaan Adab Harian Santri (Sopan Santun & Sunnah)
✅ Poin Reward & Prestasi Santri
✅ Catatan Pelanggaran & Disiplin Tarbawi
✅ Kuota Santri: Hingga ${tenant.quota_santri} Santri
✅ Portal Transparansi Wali Santri (Web & Mobile)`
    : `✅ Seluruh Fitur 6-Pilar Lengkap (Tahfidz, KBM, Keuangan, Kepegawaian, Rumah Tangga, Konsolidasi)`;

  return `*Assalamu'alaikum Warahmatullahi Wabarakatuh*

Yth. *${tenant.leader_name}*
Pimpinan / Pengasuh *${tenant.name}* (${tenant.city})

Alhamdulillah, akun sistem *KabarSantri v2.0* untuk pondok pesantren Anda telah resmi aktif dan siap digunakan!

📋 *INFORMASI TENANT & LAYANAN:*
• Nama Lembaga: *${tenant.name}*
• Paket Layanan: *${tierName}*
• Kuota Santri: *${tenant.quota_santri} Santri*
• Status Akun: *Aktif (Siap Go-Live)*

✨ *FITUR YANG LANGSUNG BISA DIAKSES:*
${fiturList}

🔑 *KREDENSIAL AKSES ADMINISTRATOR:*
• Link Portal Backoffice: http://localhost:3001
• Username / Email: *${tenant.admin_email}*
• Password Sementara: *${tenant.admin_temp_password}*

📲 *PANDUAN LANGKAH PERTAMA (ONBOARDING):*
1. Login menggunakan link dan password di atas.
2. Masukkan data 50 santri binaan pertama Anda di menu *Kesiswaan > Data Santri*.
3. Guru & Musyrif langsung dapat mencatat hafalan, adab, reward, dan pelanggaran dari HP/Laptop.
4. Bagikan PIN Wali Santri agar orang tua santri dapat memantau capaian anaknya secara real-time.

Jika ada kendala teknis atau membutuhkan pendampingan pelatihan tim asatidz, kami siap membantu melalui nomor ini.

_Jazakumullahu Khairan Katsiran._
Wassalamu'alaikum Warahmatullahi Wabarakatuh.

*Tim Layanan KabarSantri Indonesia*
🌐 https://kabarsantri.id`;
}

/**
 * Buat Direct Link WhatsApp Web / App
 */
export function getWhatsAppWebUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
}

/**
 * Switch Active Tenant (Simulasi Impersonasi untuk Uji Coba Multi-Tenant)
 */
export function setActiveTenantId(tenantId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
  window.dispatchEvent(new CustomEvent('ks_active_tenant_changed', { detail: tenantId }));
}

export function getActiveTenantId(): string {
  if (typeof window === 'undefined') return 'tenant-pesantren-001';
  return localStorage.getItem(ACTIVE_TENANT_KEY) || 'tenant-pesantren-001';
}
