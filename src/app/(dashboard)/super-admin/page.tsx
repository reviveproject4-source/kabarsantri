'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Layers, 
  Wallet, 
  Activity, 
  FileText, 
  Settings, 
  LayoutGrid, 
  Shield, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Search, 
  Send, 
  Copy, 
  Check, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  MessageCircle, 
  X, 
  Plus, 
  Database, 
  ExternalLink, 
  Menu,
  ChevronRight,
  Terminal,
  Zap
} from 'lucide-react';
import { 
  getYayasanRegistrations, 
  activateYayasanRegistration, 
  updateYayasanFeatures, 
  updateYayasanPaket, 
  deleteYayasanRegistration, 
  submitYayasanRegistration, 
  YayasanRegistration, 
  AVAILABLE_YAYASAN_FEATURES, 
  ALL_YAYASAN_FEATURE_IDS,
  unlockAllFeaturesForTenant,
  unlockAllFeaturesForAllTenants,
  PaketType, 
  syncRegistrationsFromServer 
} from '@/lib/yayasanRegistrationStore';
import { getWhatsAppWebUrl } from '@/lib/superAdminStore';
import { supabase } from '@/lib/supabaseClient';

export type SuperAdminNavMenu = 
  | 'dashboard' 
  | 'tenants' 
  | 'users' 
  | 'subscriptions' 
  | 'modules' 
  | 'billing' 
  | 'usage' 
  | 'audit' 
  | 'settings';

const SQL_SCRIPT = `-- ==============================================================================
-- KABARSANTRI v2.0 - TABEL REGISTRASI YAYASAN DARI WELCOME SCREEN
-- Jalankan skrip ini langsung di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fugqdiuxnjwfgxpvxqsy/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.yayasan_registrations (
    id VARCHAR(64) PRIMARY KEY,
    nama_yayasan VARCHAR(255) NOT NULL,
    nama_pimpinan VARCHAR(255) NOT NULL,
    no_whatsapp VARCHAR(64) NOT NULL,
    email VARCHAR(255),
    kota VARCHAR(255),
    estimasi_santri VARCHAR(64),
    paket_pilihan VARCHAR(64) NOT NULL DEFAULT 'Gratis',
    catatan TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    features JSONB NOT NULL DEFAULT '["tahfidz", "wali"]'::jsonb,
    activated_tenant_id VARCHAR(128),
    admin_email VARCHAR(255),
    admin_temp_password VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.yayasan_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_public_all_yayasan_registrations 
ON public.yayasan_registrations 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);
`;

export default function SuperAdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState<SuperAdminNavMenu>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [registrations, setRegistrations] = useState<YayasanRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tenantFilter, setTenantFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [subFilter, setSubFilter] = useState<'all' | 'pending' | 'active'>('all');
  
  // Simulation vs Live Mode toggle
  const [isSimulasiMode, setIsSimulasiMode] = useState(true);
  
  // Timer Sesi (format hh:mm:ss)
  const [sessionSeconds, setSessionSeconds] = useState(7);

  // Cloud Sync Status
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'not_found'>('checking');
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Tambah Yayasan Manual
  const [addForm, setAddForm] = useState({
    nama_yayasan: '',
    nama_pimpinan: '',
    no_whatsapp: '',
    email: '',
    kota: '',
    estimasi_santri: '50 - 200 Santri',
    paket_pilihan: 'Gratis' as PaketType,
    catatan: '',
  });

  // State Tab Modules
  const [selectedModuleRegId, setSelectedModuleRegId] = useState<string>('');
  const [currentSelectedFeatures, setCurrentSelectedFeatures] = useState<string[]>([]);

  // Modal Aktivasi & Kredensial
  const [activeModalData, setActiveModalData] = useState<{
    registration: YayasanRegistration;
    credentials: { email: string; pass: string; tenantId: string };
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [notif, setNotif] = useState('');

  const checkSupabaseStatus = async () => {
    try {
      const res = await fetch('/api/registrations');
      const json = await res.json();
      if (json.source === 'supabase') {
        setSupabaseStatus('connected');
      } else {
        setSupabaseStatus('not_found');
      }
    } catch {
      setSupabaseStatus('not_found');
    }
  };

  const loadData = async () => {
    let list = getYayasanRegistrations();
    setRegistrations(list);
    if (!selectedModuleRegId && list.length > 0) {
      setSelectedModuleRegId(list[0].id);
      setCurrentSelectedFeatures(list[0].features || []);
    }
    checkSupabaseStatus();

    // 1. Sync dari API Server
    try {
      const serverSynced = await syncRegistrationsFromServer();
      if (serverSynced && serverSynced.length > 0) {
        list = serverSynced;
        setRegistrations(list);
      }
    } catch {}

    // 2. Direct Sync dari Supabase (Cloud First)
    try {
      const { data: supaRows, error } = await supabase
        .from('yayasan_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(supaRows)) {
        setSupabaseStatus('connected');
        if (supaRows.length > 0) {
          const map = new Map<string, YayasanRegistration>();
          list.forEach(item => map.set(item.id, item));
          supaRows.forEach((row: any) => {
            map.set(row.id, {
              id: row.id,
              nama_yayasan: row.nama_yayasan,
              nama_pimpinan: row.nama_pimpinan,
              no_whatsapp: row.no_whatsapp,
              email: row.email || '',
              kota: row.kota || 'Indonesia',
              estimasi_santri: row.estimasi_santri || '< 50 Santri',
              paket_pilihan: row.paket_pilihan || 'Gratis',
              catatan: row.catatan || '',
              status: row.status || 'pending',
              features: row.features || ['tahfidz', 'wali'],
              created_at: row.created_at || new Date().toISOString(),
              activated_tenant_id: row.activated_tenant_id,
              admin_email: row.admin_email,
              admin_temp_password: row.admin_temp_password,
            });
          });

          const merged = Array.from(map.values());
          merged.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            const timeA = new Date(a.created_at || 0).getTime() || 0;
            const timeB = new Date(b.created_at || 0).getTime() || 0;
            if (timeA !== timeB) return timeB - timeA;
            return (b.id || '').localeCompare(a.id || '');
          });

          setRegistrations(merged);
        } else if (list.length > 0) {
          // Jika Supabase kosong tetapi local ada data pendaftaran, dorong langsung ke Supabase
          try {
            const pushItems = list.map(item => ({
              id: item.id,
              nama_yayasan: item.nama_yayasan,
              nama_pimpinan: item.nama_pimpinan,
              no_whatsapp: item.no_whatsapp,
              email: item.email || null,
              kota: item.kota || 'Indonesia',
              estimasi_santri: item.estimasi_santri || '< 50 Santri',
              paket_pilihan: item.paket_pilihan || 'Gratis',
              catatan: item.catatan || null,
              status: item.status || 'pending',
              features: item.features || ['tahfidz', 'wali'],
              created_at: item.created_at?.includes('T') ? item.created_at : new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
            await supabase.from('yayasan_registrations').upsert(pushItems);
          } catch {}
        }
      }
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      document.title = 'Super Admin KabarSantri - Pusat Lisensi & Tenant';
    }
    loadData();

    // Sesi clock timer
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);

    const handleUpdate = () => {
      const list = getYayasanRegistrations();
      setRegistrations(list);
    };

    window.addEventListener('ks_yayasan_registered', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      clearInterval(timer);
      window.removeEventListener('ks_yayasan_registered', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Update modul saat yayasan yang dipilih berubah
  useEffect(() => {
    if (selectedModuleRegId) {
      const target = registrations.find(r => r.id === selectedModuleRegId);
      if (target) {
        setCurrentSelectedFeatures(target.features || []);
      }
    }
  }, [selectedModuleRegId, registrations]);

  const formatTimer = (totalSec: number) => {
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const showNotification = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(''), 4000);
  };

  // 1. Aksi ACC & Aktivasi Tenant
  const handleAktivasi = async (reg: YayasanRegistration) => {
    const result = await activateYayasanRegistration(reg.id);
    if (result) {
      setActiveModalData(result);
      loadData();
      showNotification(`Yayasan "${reg.nama_yayasan}" berhasil di-ACC.`);
    }
  };

  // 2. Aksi WhatsApp Blast
  const handleKirimWA = (reg: YayasanRegistration, email?: string, pass?: string) => {
    const adminEmail = email || reg.admin_email || `admin@${reg.nama_yayasan.toLowerCase().replace(/[^a-z0-9]/g, '')}.kabarsantri.id`;
    const adminPass = pass || reg.admin_temp_password || 'Santri2026!';
    
    const pesan = `*Assalamu'alaikum Warahmatullahi Wabarakatuh*

Yth. *${reg.nama_pimpinan}*
Pimpinan *${reg.nama_yayasan}* (${reg.kota})

Alhamdulillah, pendaftaran yayasan Anda di *KabarSantri v2.0* telah kami verifikasi dan *RESMI DISETUJUI (DI-ACC)*.

📋 *DATA LAYANAN PESANTREN:*
• Nama Lembaga: *${reg.nama_yayasan}*
• Paket Langganan: *Paket ${reg.paket_pilihan}*
• Estimasi Santri: *${reg.estimasi_santri}*
• Status Akun: *Aktif & Siap Digunakan*

🔑 *KREDENSIAL LOGIN RESMI:*
• Link Masuk Resmi: https://kabarsantri.vercel.app/login
• Email / No. WhatsApp: *${adminEmail}* / *${reg.no_whatsapp}*
• Password Resmi: *${adminPass}*

📲 *PANDUAN MASUK AKUN:*
1. Buka website KabarSantri lalu klik *Masuk Akun Resmi* di pojok kanan atas (atau akses https://kabarsantri.vercel.app/login).
2. Masukkan Email atau No. WhatsApp Anda beserta Password resmi di atas.
3. Anda dapat langsung mengelola database santri, pencatatan hafalan Al-Qur'an (Tahfidz), hingga pembinaan adab santri.

Jika Anda membutuhkan bantuan teknis atau panduan, hubungi WhatsApp Layanan Resmi KabarSantri:
📲 *0812 1556 6630*

_Jazakumullahu Khairan Katsiran._
Wassalamu'alaikum Warahmatullahi Wabarakatuh.

*Super Admin KabarSantri Platform*
Official WA: 0812 1556 6630`;

    const url = getWhatsAppWebUrl(reg.no_whatsapp, pesan);
    window.open(url, '_blank');
  };

  // 3. Aksi Hapus Registrasi
  const handleHapus = async (id: string, nama: string) => {
    if (confirm(`Hapus data pengajuan "${nama}"?`)) {
      await deleteYayasanRegistration(id);
      loadData();
      showNotification(`Data "${nama}" dihapus.`);
    }
  };

  // 4. Toggle Modul
  const handleToggleFeature = (featureId: string) => {
    let next: string[];
    if (currentSelectedFeatures.includes(featureId)) {
      next = currentSelectedFeatures.filter(f => f !== featureId);
    } else {
      next = [...currentSelectedFeatures, featureId];
    }
    setCurrentSelectedFeatures(next);
  };

  // 5. Simpan Modul
  const handleSimpanModul = async () => {
    if (!selectedModuleRegId) return;
    const target = registrations.find(r => r.id === selectedModuleRegId);
    if (!target) return;

    await updateYayasanFeatures(selectedModuleRegId, currentSelectedFeatures);
    loadData();
    showNotification(`Modul "${target.nama_yayasan}" berhasil disimpan.`);
  };

  // 5b. Buka Semua Fitur Cepat untuk Satu Yayasan
  const handleBukaSemuaFiturTenant = async (reg: YayasanRegistration) => {
    await unlockAllFeaturesForTenant(reg.id);
    loadData();
    showNotification(`Seluruh 15 modul untuk "${reg.nama_yayasan}" berhasil dibuka.`);
  };

  // 5c. Buka Semua Fitur Cepat untuk Seluruh Tenant Platform
  const handleBukaSemuaFiturSeluruhTenant = async () => {
    if (confirm('Buka seluruh 15 modul untuk SEMUA yayasan/tenant di platform?')) {
      await unlockAllFeaturesForAllTenants();
      loadData();
      showNotification('Seluruh 15 modul telah dibuka untuk SEMUA tenant platform.');
    }
  };

  // 6. Ubah Paket (Gratis ↔ Enterprise)
  const handleUbahPaket = async (regId: string, paketBaru: PaketType) => {
    const target = registrations.find(r => r.id === regId);
    if (!target) return;

    await updateYayasanPaket(regId, paketBaru);
    loadData();
    showNotification(`Paket "${target.nama_yayasan}" diubah ke Paket ${paketBaru}.`);
  };

  // 7. Input Manual Yayasan
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.nama_yayasan || !addForm.nama_pimpinan || !addForm.no_whatsapp) {
      alert('Nama Yayasan, Pimpinan, dan WhatsApp wajib diisi.');
      return;
    }
    await submitYayasanRegistration(addForm);
    setShowAddModal(false);
    setAddForm({
      nama_yayasan: '',
      nama_pimpinan: '',
      no_whatsapp: '',
      email: '',
      kota: '',
      estimasi_santri: '50 - 200 Santri',
      paket_pilihan: 'Gratis',
      catatan: '',
    });
    loadData();
    showNotification(`Yayasan berhasil ditambahkan ke antrean.`);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Metrik Platform
  const totalTenants = registrations.length;
  const activeTenants = registrations.filter(r => r.status === 'active').length;
  const pendingTenants = registrations.filter(r => r.status === 'pending').length;
  const activeSubscriptions = activeTenants;

  // Filter Tenants
  const filteredTenants = registrations.filter(r => {
    const matchStatus = tenantFilter === 'all' ? true : r.status === tenantFilter;
    const matchSearch = 
      r.nama_yayasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nama_pimpinan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.kota.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.no_whatsapp.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  // Filter Subscriptions
  const filteredSubs = registrations.filter(r => {
    if (subFilter === 'all') return true;
    return r.status === subFilter;
  });

  const selectedYayasanForModule = registrations.find(r => r.id === selectedModuleRegId);

  // Navigasi Menu Items (Sesuai Tampilan PILIN PLATFORM pada Foto Monitor)
  interface NavItem {
    id: SuperAdminNavMenu;
    label: string;
    icon: any;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'tenants', label: 'Tenants', icon: Building2, badge: pendingTenants > 0 ? String(pendingTenants) : undefined },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'modules', label: 'Modules', icon: Layers },
    { id: 'billing', label: 'Billing & Balance', icon: Wallet },
    { id: 'usage', label: 'Usage', icon: Activity },
    { id: 'audit', label: 'Audit Log', icon: FileText },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-rose-500 selection:text-white">
      {/* Toast Notifikasi Terapung */}
      {notif && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SIDEBAR KIRI (SEPERTI PILIN PLATFORM PADA FOTO PENGGUNA)                  */}
      {/* ========================================================================= */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0a1226] border-r border-[#19243e] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'}
      `}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-[#19243e] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-extrabold text-sm tracking-wider text-white uppercase block leading-none">
                  KABARSANTRI
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">SUPER ADMIN v2.0</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id as SuperAdminNavMenu);
                    setMobileSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left
                    ${isActive 
                      ? 'border border-rose-500/80 bg-rose-500/10 text-white shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Mode Simulasi & Keluar Sesi) */}
        <div className="p-3 border-t border-[#19243e] space-y-2 bg-[#091022]">
          <button
            onClick={() => {
              setIsSimulasiMode(!isSimulasiMode);
              showNotification(isSimulasiMode ? 'Beralih ke Mode Live Platform' : 'Beralih ke Mode Simulasi');
            }}
            className={`
              w-full py-2 px-3 rounded-xl text-xs font-semibold border text-center transition
              ${isSimulasiMode 
                ? 'border-rose-900/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40' 
                : 'border-emerald-900/60 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40'
              }
            `}
          >
            {isSimulasiMode ? 'Mode Simulasi Aktif' : 'Mode Live Aktif'}
          </button>

          <div className="flex items-center justify-between px-1 pt-1 text-xs text-slate-400 font-mono">
            <span>{formatTimer(sessionSeconds)}</span>
            <Link
              href="/login"
              className="flex items-center space-x-1.5 text-slate-300 hover:text-rose-400 transition"
              title="Keluar Sesi"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="font-sans text-[11px]">Keluar Sesi</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Backdrop Mobile Drawer */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* KONTEN UTAMA (HEADER ATAS + PANEL AKTIF)                                  */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-8 border-b border-[#19243e] bg-[#091124] flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-lg border border-slate-700 bg-slate-800/60"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-sm sm:text-base text-white tracking-tight">
              Super Admin KabarSantri
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition hidden sm:inline-block"
            >
              ← Welcome Screen
            </Link>

            <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-wider text-rose-300 border border-rose-800/80 bg-rose-950/40 uppercase">
              ROLE: PLATFORM_SUPER_ADMIN
            </span>
          </div>
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
          {/* ===================================================================== */}
          {/* 1. VIEW DASHBOARD (IKHTISAR PLATFORM - IDENTIK FOTO MONITOR USER)     */}
          {/* ===================================================================== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Ikhtisar Platform
                </h3>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tenant Baru</span>
                  </button>
                </div>
              </div>

              {/* 5 Metric Cards (Persis Tata Letak Foto Monitor) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {/* 1. TOTAL TENANTS */}
                <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-4 sm:p-5 space-y-1.5">
                  <div className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                    TOTAL TENANTS
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {totalTenants > 0 ? totalTenants : '—'}
                  </div>
                </div>

                {/* 2. ACTIVE TENANTS */}
                <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-4 sm:p-5 space-y-1.5">
                  <div className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                    ACTIVE TENANTS
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {activeTenants > 0 ? activeTenants : '—'}
                  </div>
                </div>

                {/* 3. ACTIVE SUBSCRIPTIONS */}
                <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-4 sm:p-5 space-y-1.5">
                  <div className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                    ACTIVE SUBSCRIPTIONS
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {activeSubscriptions > 0 ? activeSubscriptions : '—'}
                  </div>
                </div>

                {/* 4. MONTHLY REVENUE */}
                <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-4 sm:p-5 space-y-1.5">
                  <div className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                    MONTHLY REVENUE
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white truncate">
                    {activeTenants > 0 ? `Rp ${(activeTenants * 1500000).toLocaleString('id-ID')}` : '—'}
                  </div>
                </div>

                {/* 5. PLATFORM USAGE */}
                <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-4 sm:p-5 space-y-1.5 col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                    PLATFORM USAGE
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {totalTenants > 0 ? '98.4%' : '—'}
                  </div>
                </div>
              </div>

              {/* Card Informasi Sistem (Sesuai Foto Monitor) */}
              <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">Informasi Sistem</h4>
                  <div className="flex items-center space-x-2">
                    {supabaseStatus === 'connected' ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Supabase Live Connected</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowSqlModal(true)}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800 hover:text-white"
                      >
                        <Database className="w-3 h-3 text-amber-400" />
                        <span>Skrip SQL Supabase</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-[#091122] border border-[#1e2c4d] rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2">
                  <p>
                    Dashboard Super Admin KabarSantri berhasil diinisialisasi. Hubungkan API / database trigger untuk mulai mempopulasikan metrik secara real-time.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                    <span className="text-slate-400">Status Platform: <strong className="text-white">Siap Beroperasi</strong></span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Antrean Verifikasi: <strong className="text-amber-400">{pendingTenants} Lembaga</strong></span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Lisensi Aktif: <strong className="text-emerald-400">{activeTenants} Tenant</strong></span>
                  </div>
                </div>
              </div>

              {/* Antrean Pendaftaran Yayasan Terbaru (Menunggu ACC) */}
              <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-white">
                      Antrean Pendaftaran Yayasan Terbaru ({pendingTenants} Menunggu ACC)
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveMenu('tenants')}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center space-x-1"
                  >
                    <span>Buka Semua di Menu Tenants</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {registrations.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="bg-[#091122] border border-[#1e2c4d] rounded-xl p-4 text-center text-xs text-slate-400">
                    Tidak ada antrean tertunda. Seluruh pendaftaran telah disetujui (di-ACC).
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {registrations.filter(r => r.status === 'pending').slice(0, 5).map((reg) => (
                      <div
                        key={reg.id}
                        className="bg-[#091122] border border-[#1e2c4d] hover:border-slate-600 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <strong className="text-white text-sm">{reg.nama_yayasan}</strong>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Paket {reg.paket_pilihan}
                            </span>
                          </div>
                          <div className="text-slate-400 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
                            <span>Pimpinan: <strong className="text-slate-200">{reg.nama_pimpinan}</strong></span>
                            <span>•</span>
                            <span>WA: <strong className="text-emerald-400 font-mono">{reg.no_whatsapp}</strong></span>
                            <span>•</span>
                            <span>Kota: <strong className="text-slate-200">{reg.kota || 'Indonesia'}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleAktivasi(reg)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center space-x-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ACC &amp; Aktivasi</span>
                          </button>

                          <button
                            onClick={() => handleKirimWA(reg)}
                            className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-semibold rounded-xl text-xs transition flex items-center space-x-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WA</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pintasan Aksi Cepat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setActiveMenu('tenants')}
                  className="bg-[#0f1a35] hover:bg-[#142347] border border-[#1e2c4d] p-4 rounded-2xl text-left transition flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-white flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>Kelola Antrean Pendaftaran Tenant</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Verifikasi pendaftaran yayasan baru dari Welcome Screen &amp; ACC langsung.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
                </button>

                <button
                  onClick={() => setActiveMenu('modules')}
                  className="bg-[#0f1a35] hover:bg-[#142347] border border-[#1e2c4d] p-4 rounded-2xl text-left transition flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-white flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Kustomisasi Modul Pesantren</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Atur aktivasi fitur Tahfidz, SPP, Presensi GPS, Sarpras per yayasan.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 2. VIEW TENANTS (DAFTAR YAYASAN & PERSETUJUAN ACC)                    */}
          {/* ===================================================================== */}
          {activeMenu === 'tenants' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Manajemen Tenants
                  </h3>
                  <p className="text-xs text-slate-400">
                    Daftar pendaftaran yayasan dari Welcome Screen &amp; persetujuan lisensi.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Input Yayasan Manual</span>
                </button>
              </div>

              {/* Filter & Pencarian */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Cari nama yayasan, pimpinan, kota, nomor WA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#0f1a35] border border-[#1e2c4d] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="flex rounded-xl bg-[#0f1a35] border border-[#1e2c4d] p-1 text-xs">
                  <button
                    onClick={() => setTenantFilter('all')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${tenantFilter === 'all' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Semua ({registrations.length})
                  </button>
                  <button
                    onClick={() => setTenantFilter('pending')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${tenantFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Menunggu ACC ({pendingTenants})
                  </button>
                  <button
                    onClick={() => setTenantFilter('active')}
                    className={`px-3 py-1 rounded-lg font-medium transition ${tenantFilter === 'active' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Aktif ({activeTenants})
                  </button>
                </div>
              </div>

              {/* List Tenant Cards */}
              <div className="space-y-3">
                {filteredTenants.length === 0 ? (
                  <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan data pendaftaran yang sesuai kriteria pencarian.
                  </div>
                ) : (
                  filteredTenants.map((reg) => (
                    <div
                      key={reg.id}
                      className="bg-[#0f1a35] border border-[#1e2c4d] hover:border-slate-600 rounded-2xl p-4 sm:p-5 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#19243e]">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm sm:text-base text-white">
                              {reg.nama_yayasan}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#142347] text-slate-300 border border-[#21345e]">
                              Paket {reg.paket_pilihan}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                            <span>Pimpinan: <strong className="text-slate-200">{reg.nama_pimpinan}</strong></span>
                            <span>•</span>
                            <span>Kota: <strong className="text-slate-200">{reg.kota || 'Indonesia'}</strong></span>
                            <span>•</span>
                            <span>Estimasi: <strong className="text-slate-200">{reg.estimasi_santri}</strong></span>
                          </div>
                        </div>

                        <div>
                          {reg.status === 'pending' ? (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800 text-xs font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Menunggu ACC</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aktif Berlangganan</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detail Kontak & Aksi */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400">
                          <span>WhatsApp: <strong className="text-emerald-400 font-mono">{reg.no_whatsapp}</strong></span>
                          {reg.email && <span>Email: <strong className="text-slate-300 font-mono">{reg.email}</strong></span>}
                          {reg.admin_email && <span>Login Admin: <strong className="text-amber-300 font-mono">{reg.admin_email}</strong></span>}
                        </div>

                        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                          {/* Tombol Cepat Buka Seluruh Fitur */}
                          <button
                            onClick={() => handleBukaSemuaFiturTenant(reg)}
                            className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 font-bold rounded-xl text-xs transition flex items-center space-x-1"
                            title="Buka seluruh 15 fitur untuk yayasan ini"
                          >
                            <span>🔓 Buka Semua Fitur</span>
                          </button>

                          {/* Tombol Masuk ke Pusat Kendali Modul */}
                          <button
                            onClick={() => {
                              setSelectedModuleRegId(reg.id);
                              setActiveMenu('modules');
                            }}
                            className="px-2.5 py-1.5 bg-[#142347] hover:bg-[#1a2f60] text-blue-300 border border-[#21345e] font-semibold rounded-xl text-xs transition flex items-center space-x-1"
                            title="Atur hak akses modul secara terpusat"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Pusat Kendali ({reg.features?.length || 0}/15)</span>
                          </button>

                          {reg.status === 'pending' && (
                            <button
                              onClick={() => handleAktivasi(reg)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center space-x-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>ACC &amp; Aktivasi</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleKirimWA(reg)}
                            className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-semibold rounded-xl text-xs transition flex items-center space-x-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Kirim WA</span>
                          </button>

                          <button
                            onClick={() => handleHapus(reg.id, reg.nama_yayasan)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 3. VIEW SUBSCRIPTIONS (STANDAR 2 PAKET: GRATIS & ENTERPRISE)          */}
          {/* ===================================================================== */}
          {activeMenu === 'subscriptions' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Subscriptions &amp; Lisensi
                </h3>
                <p className="text-xs text-slate-400">
                  Paket resmi KabarSantri: <strong>Paket Gratis (50 Santri)</strong> dan <strong>Paket Enterprise (Skala Penuh)</strong>.
                </p>
              </div>

              {/* Filter Subscriptions */}
              <div className="flex rounded-xl bg-[#0f1a35] border border-[#1e2c4d] p-1 text-xs w-fit">
                <button
                  onClick={() => setSubFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${subFilter === 'all' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Semua ({registrations.length})
                </button>
                <button
                  onClick={() => setSubFilter('pending')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${subFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Menunggu Aktivasi ({pendingTenants})
                </button>
                <button
                  onClick={() => setSubFilter('active')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${subFilter === 'active' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Aktif Berlangganan ({activeTenants})
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSubs.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-4 sm:p-5 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#19243e]">
                      <div>
                        <h4 className="font-bold text-sm text-white">{reg.nama_yayasan}</h4>
                        <p className="text-slate-400 text-[11px]">{reg.nama_pimpinan} &bull; {reg.kota}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${reg.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                        {reg.status === 'active' ? 'Status: Aktif' : 'Menunggu ACC'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-[#091122] border border-[#19243e] p-3 rounded-xl">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Paket Saat Ini:</span>
                        <strong className="text-white text-sm font-black">Paket {reg.paket_pilihan}</strong>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleUbahPaket(reg.id, 'Gratis')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${reg.paket_pilihan === 'Gratis' ? 'bg-slate-700 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
                        >
                          Set Gratis
                        </button>
                        <button
                          onClick={() => handleUbahPaket(reg.id, 'Enterprise')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${reg.paket_pilihan === 'Enterprise' ? 'bg-rose-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
                        >
                          Set Enterprise
                        </button>
                      </div>
                    </div>

                    <div className="text-slate-400 text-[11px] flex justify-between">
                      <span>Estimasi Santri: <strong className="text-slate-200">{reg.estimasi_santri}</strong></span>
                      <span>Modul Aktif: <strong className="text-emerald-400">{reg.features?.length || 2} Fitur</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 4. VIEW MODULES (PUSAT KENDALI MODUL & FITUR PER YAYASAN)             */}
          {/* ===================================================================== */}
          {activeMenu === 'modules' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[11px] font-bold border border-rose-500/20 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span>Pusat Kendali Terpusat Tenant</span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Pusat Kendali Modul &amp; Fitur Tenant ({AVAILABLE_YAYASAN_FEATURES.length} Modul)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Super Admin mengendalikan seluruh fitur yang aktif pada dashboard yayasan/tenant secara terpusat &amp; real-time.
                  </p>
                </div>

                <button
                  onClick={handleBukaSemuaFiturSeluruhTenant}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow transition shrink-0"
                  title="Buka seluruh 15 fitur untuk SEMUA tenant di platform"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buka Semua Fitur Seluruh Tenant</span>
                </button>
              </div>

              {/* Selector Yayasan & Quick Actions */}
              <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#19243e]">
                  <div className="space-y-1 flex-1 max-w-md">
                    <label className="text-xs font-bold text-slate-300">Pilih Yayasan / Pesantren Binaan:</label>
                    <select
                      value={selectedModuleRegId}
                      onChange={(e) => setSelectedModuleRegId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#091122] border border-[#1e2c4d] rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                    >
                      {registrations.map((reg) => (
                        <option key={reg.id} value={reg.id}>
                          {reg.nama_yayasan} ({reg.kota}) - Paket {reg.paket_pilihan} ({reg.features?.length || 0} Fitur Aktif)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedYayasanForModule && (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-400">Status Modul:</span>
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-xs border ${
                        currentSelectedFeatures.length === AVAILABLE_YAYASAN_FEATURES.length
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      }`}>
                        {currentSelectedFeatures.length} / {AVAILABLE_YAYASAN_FEATURES.length} Fitur Terbuka
                      </span>
                    </div>
                  )}
                </div>

                {selectedYayasanForModule && (
                  <div className="space-y-4 pt-1">
                    {/* Toolbar Cepat: Buka Semua, Kunci Semua, Reset */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#091122] border border-[#1e2c4d] rounded-xl text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentSelectedFeatures([...ALL_YAYASAN_FEATURE_IDS])}
                          className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-lg transition flex items-center space-x-1"
                        >
                          <span>🔓 Buka Semua Fitur (Centang 15 Modul)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentSelectedFeatures(['dashboard', 'pengaturan'])}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        >
                          <span>🔒 Kunci Semua Fitur</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedYayasanForModule.paket_pilihan === 'Enterprise') {
                              setCurrentSelectedFeatures([...ALL_YAYASAN_FEATURE_IDS]);
                            } else {
                              setCurrentSelectedFeatures(['dashboard', 'tahfidz', 'kesiswaan', 'adab', 'wali', 'pengaturan']);
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        >
                          <span>📦 Reset ke Paket {selectedYayasanForModule.paket_pilihan}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Klik kartu untuk centang / batalkan modul
                      </div>
                    </div>

                    {/* Grid 15 Modul Pesantren */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {AVAILABLE_YAYASAN_FEATURES.map((feat) => {
                        const checked = currentSelectedFeatures.includes(feat.id);
                        return (
                          <div
                            key={feat.id}
                            onClick={() => handleToggleFeature(feat.id)}
                            className={`
                              p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-2 select-none relative
                              ${checked 
                                ? 'bg-rose-500/10 border-rose-500/80 text-white shadow-sm ring-1 ring-rose-500/30' 
                                : 'bg-[#091122] border-[#1e2c4d] text-slate-400 hover:border-slate-500 opacity-75'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                                  checked ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {feat.category}
                                </span>
                                <span className="font-bold text-white text-xs truncate">{feat.name}</span>
                              </div>

                              <div className="flex items-center space-x-1.5 shrink-0">
                                <span className={`text-[10px] font-bold ${checked ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  {checked ? 'Aktif' : 'Terkunci'}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {}}
                                  className="rounded text-rose-500 focus:ring-rose-500 shrink-0 w-4 h-4 cursor-pointer"
                                />
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {feat.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Sticky Action Bar */}
                    <div className="pt-3 border-t border-[#19243e] flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs text-slate-400 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Perubahan modul akan langsung tercermin pada dashboard Yayasan <strong>{selectedYayasanForModule.nama_yayasan}</strong>.
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentSelectedFeatures([...ALL_YAYASAN_FEATURE_IDS]);
                            handleSimpanModul();
                          }}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          🔓 Buka Semua &amp; Simpan
                        </button>
                        <button
                          type="button"
                          onClick={handleSimpanModul}
                          className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          Simpan Pengaturan Modul ({currentSelectedFeatures.length}/15)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 5. VIEW USERS & ROLES                                                 */}
          {/* ===================================================================== */}
          {activeMenu === 'users' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Users &amp; Roles</h3>
                <p className="text-xs text-slate-400">Akun kredensial administrator resmi per tenant pesantren.</p>
              </div>

              <div className="space-y-3">
                {registrations.map((reg) => (
                  <div key={reg.id} className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{reg.nama_yayasan}</h4>
                      <p className="text-slate-400">Pimpinan: {reg.nama_pimpinan} &bull; WA: {reg.no_whatsapp}</p>
                    </div>
                    <div className="bg-[#091122] border border-[#19243e] p-2.5 rounded-xl font-mono text-[11px] space-y-0.5">
                      <div>Login Email: <strong className="text-amber-300">{reg.admin_email || `admin@${reg.id}.kabarsantri.id`}</strong></div>
                      <div>Password Sementara: <strong className="text-emerald-400">{reg.admin_temp_password || 'Santri2026!'}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 6. VIEW BILLING & BALANCE                                             */}
          {/* ===================================================================== */}
          {activeMenu === 'billing' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Billing &amp; Balance</h3>
                <p className="text-xs text-slate-400">Ikhtisar tagihan langganan SaaS dan pembayaran lisensi pesantren.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-4 space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">Total Tagihan Terbit</div>
                  <div className="text-2xl font-black text-white">Rp {(activeTenants * 1500000).toLocaleString('id-ID')}</div>
                </div>
                <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-4 space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">Status Pembayaran</div>
                  <div className="text-2xl font-black text-emerald-400">Lunas</div>
                </div>
                <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-4 space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">Siklus Periode</div>
                  <div className="text-2xl font-black text-white">Bulanan (30 Hari)</div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 7. VIEW USAGE                                                         */}
          {/* ===================================================================== */}
          {activeMenu === 'usage' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Platform Usage</h3>
                <p className="text-xs text-slate-400">Metrik operasional dan beban server platform KabarSantri.</p>
              </div>

              <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-5 space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-[#19243e]">
                  <span className="text-slate-400">API Response Latency:</span>
                  <span className="text-emerald-400 font-bold">18 ms</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#19243e]">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="text-white">PostgreSQL (Supabase fugqdiuxnjwfgxpvxqsy)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#19243e]">
                  <span className="text-slate-400">Uptime Serverless:</span>
                  <span className="text-emerald-400 font-bold">99.98%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Active WebSocket / Push WA:</span>
                  <span className="text-white font-bold">Online</span>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 8. VIEW AUDIT LOG                                                     */}
          {/* ===================================================================== */}
          {activeMenu === 'audit' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Audit Log</h3>
                <p className="text-xs text-slate-400">Catatan aktivitas pendaftaran, persetujuan ACC, dan kustomisasi lisensi.</p>
              </div>

              <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-5 space-y-3 font-mono text-xs">
                {registrations.slice(0, 8).map((reg, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-[#19243e] last:border-b-0 gap-1">
                    <div>
                      <span className="text-emerald-400 font-bold">[{reg.created_at || 'Baru'}]</span>{' '}
                      <span className="text-white">Pendaftaran {reg.nama_yayasan} ({reg.kota})</span> &bull;{' '}
                      <span className="text-slate-400">Status: {reg.status === 'active' ? 'ACC Disetujui' : 'Menunggu Verifikasi'}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans">Super Admin Log</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 9. VIEW SYSTEM SETTINGS                                               */}
          {/* ===================================================================== */}
          {activeMenu === 'settings' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">System Settings</h3>
                <p className="text-xs text-slate-400">Koneksi database Supabase dan integrasi cloud platform.</p>
              </div>

              <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-2xl p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#19243e]">
                  <div>
                    <h4 className="font-bold text-white text-sm">Supabase Database Connection</h4>
                    <p className="text-slate-400 text-[11px]">Proyek: fugqdiuxnjwfgxpvxqsy</p>
                  </div>
                  <button
                    onClick={() => {
                      checkSupabaseStatus();
                      showNotification('Memeriksa status tabel Supabase...');
                    }}
                    className="px-3 py-1.5 bg-[#142347] hover:bg-[#1a2d59] border border-[#21345e] rounded-xl text-white text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Cek Koneksi</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status Tabel `yayasan_registrations`:</span>
                    <strong className={supabaseStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}>
                      {supabaseStatus === 'connected' ? '✓ Tabel Cloud Terhubung' : 'Belum Dibuat di Supabase'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Supabase URL:</span>
                    <span className="font-mono text-slate-300">https://fugqdiuxnjwfgxpvxqsy.supabase.co</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setShowSqlModal(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <Database className="w-4 h-4" />
                    <span>Buka Skrip SQL 1-Klik Supabase</span>
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/fugqdiuxnjwfgxpvxqsy/sql"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Supabase SQL Editor</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: KREDENSIAL AKTIVASI & WHATSAPP BLAST                             */}
      {/* ========================================================================= */}
      {activeModalData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#19243e]">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">Yayasan Berhasil Di-ACC</h3>
              </div>
              <button
                onClick={() => setActiveModalData(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Lembaga <strong>"{activeModalData.registration.nama_yayasan}"</strong> telah resmi diaktifkan. Kredensial administrator:
            </p>

            <div className="bg-[#091122] border border-[#19243e] rounded-2xl p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-[#19243e]">
                <span className="text-slate-400 font-sans">Email Login:</span>
                <span className="font-bold text-amber-300">{activeModalData.credentials.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#19243e]">
                <span className="text-slate-400 font-sans">Password Sementara:</span>
                <span className="font-bold text-emerald-400">{activeModalData.credentials.pass}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-sans">WhatsApp Pimpinan:</span>
                <span className="text-white">{activeModalData.registration.no_whatsapp}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => handleKirimWA(activeModalData.registration, activeModalData.credentials.email, activeModalData.credentials.pass)}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim via WhatsApp Pimpinan</span>
              </button>

              <button
                onClick={() => handleCopyText(`Email: ${activeModalData.credentials.email}\nPass: ${activeModalData.credentials.pass}`)}
                className="py-2.5 px-4 bg-[#142347] hover:bg-[#1a2d59] border border-[#21345e] text-slate-200 font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin Kredensial'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SKRIP SQL 1-KLIK SUPABASE                                       */}
      {/* ========================================================================= */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#19243e]">
              <div className="flex items-center space-x-2 text-amber-400">
                <Database className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">Skrip SQL Supabase 1-Klik</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Salin skrip berikut lalu jalankan di <strong>Supabase SQL Editor</strong> untuk membuat tabel registrasi:
            </p>

            <div className="relative">
              <pre className="bg-[#070d1e] border border-[#19243e] rounded-2xl p-4 text-[11px] font-mono text-slate-300 max-h-56 overflow-y-auto">
                {SQL_SCRIPT}
              </pre>
              <button
                onClick={handleCopySql}
                className="absolute top-3 right-3 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow transition flex items-center space-x-1"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href="https://supabase.com/dashboard/project/fugqdiuxnjwfgxpvxqsy/sql"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl text-center transition flex items-center justify-center space-x-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Supabase SQL Editor</span>
              </a>

              <button
                onClick={() => {
                  checkSupabaseStatus();
                  showNotification('Memeriksa status tabel Supabase...');
                }}
                className="py-2.5 px-4 bg-[#142347] hover:bg-[#1a2d59] border border-[#21345e] text-slate-200 font-semibold text-xs rounded-xl transition"
              >
                Periksa Status Ulang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INPUT YAYASAN MANUAL DI SUPER ADMIN                             */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0f1a35] border border-[#1e2c4d] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#19243e]">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Plus className="w-5 h-5" />
                <h3 className="font-bold text-base text-white">Input Yayasan / Lembaga Baru</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Nama Yayasan / Pesantren <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pondok Pesantren Al-Falah"
                  value={addForm.nama_yayasan}
                  onChange={(e) => setAddForm({ ...addForm, nama_yayasan: e.target.value })}
                  className="w-full px-3 py-2 bg-[#091122] border border-[#1e2c4d] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Nama Pimpinan <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: KH. Ahmad Dahlan"
                    value={addForm.nama_pimpinan}
                    onChange={(e) => setAddForm({ ...addForm, nama_pimpinan: e.target.value })}
                    className="w-full px-3 py-2 bg-[#091122] border border-[#1e2c4d] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    WhatsApp Pimpinan <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={addForm.no_whatsapp}
                    onChange={(e) => setAddForm({ ...addForm, no_whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-[#091122] border border-[#1e2c4d] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kota / Domisili</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jombang, Jawa Timur"
                    value={addForm.kota}
                    onChange={(e) => setAddForm({ ...addForm, kota: e.target.value })}
                    className="w-full px-3 py-2 bg-[#091122] border border-[#1e2c4d] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email Lembaga</label>
                  <input
                    type="email"
                    placeholder="info@pesantren.id"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#091122] border border-[#1e2c4d] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Paket Layanan</label>
                  <select
                    value={addForm.paket_pilihan}
                    onChange={(e) => setAddForm({ ...addForm, paket_pilihan: e.target.value as PaketType })}
                    className="w-full px-3 py-2 bg-[#091122] border border-[#1e2c4d] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="Gratis">Paket Gratis (50 Santri)</option>
                    <option value="Enterprise">Paket Enterprise (Skala Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Estimasi Santri</label>
                  <select
                    value={addForm.estimasi_santri}
                    onChange={(e) => setAddForm({ ...addForm, estimasi_santri: e.target.value })}
                    className="w-full px-3 py-2 bg-[#091122] border border-[#1e2c4d] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="< 50 Santri">&lt; 50 Santri</option>
                    <option value="50 - 200 Santri">50 - 200 Santri</option>
                    <option value="200 - 500 Santri">200 - 500 Santri</option>
                    <option value="> 500 Santri">&gt; 500 Santri</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Simpan &amp; Tampilkan di Daftar Tenant
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 px-4 bg-[#142347] hover:bg-[#1a2d59] border border-[#21345e] text-slate-300 font-semibold text-xs rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
