'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  School, 
  BookOpen, 
  Users, 
  Building2, 
  CheckCircle2, 
  LayoutDashboard, 
  UserCheck, 
  Grid, 
  X, 
  Layers, 
  ShieldCheck, 
  Wallet, 
  Home, 
  FileText, 
  Clock, 
  ArrowRight, 
  ExternalLink, 
  Award, 
  MapPin, 
  ChevronRight,
  Lock
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useActiveTenant, APP_BRAND } from '@/lib/sessionStore';
import { getYayasanRegistrations, clearPendingRegistrationLock } from '@/lib/yayasanRegistrationStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [pendingRegData, setPendingRegData] = useState<any>(null);
  const pathname = usePathname();
  const tenant = useActiveTenant();

  const checkApprovalStatus = () => {
    if (typeof window !== 'undefined') {
      const pendingId = localStorage.getItem('ks_pending_registration_id');
      if (pendingId) {
        const list = getYayasanRegistrations();
        const found = list.find(r => r.id === pendingId);
        if (found && found.status === 'pending') {
          setIsPendingApproval(true);
          setPendingRegData(found);
          return;
        }
      }
      setIsPendingApproval(false);
      setPendingRegData(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkApprovalStatus();

    const handleUpdate = () => checkApprovalStatus();
    window.addEventListener('ks_yayasan_registered', handleUpdate);
    return () => window.removeEventListener('ks_yayasan_registered', handleUpdate);
  }, [pathname]);

  // ISOLASI KETAT SUPER ADMIN: SESUAI TAMPILAN PILIN PLATFORM (BEBAS HEADER LOGO GANDA)
  if (pathname?.startsWith('/super-admin') || pathname?.includes('/super-admin')) {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-100 antialiased selection:bg-rose-500 selection:text-white">
        <Suspense fallback={<div className="p-10 text-center text-slate-400">Memuat Konsol Super Admin...</div>}>
          {children}
        </Suspense>
      </div>
    );
  }

  // PENGAWAL PERSETUJUAN (APPROVAL GUARD): PETUNJUK SINGKAT PADAT TANPA KALIMAT PANJANG
  if (mounted && isPendingApproval && pendingRegData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 p-4 sm:p-6">
        <header className="max-w-md w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">KabarSantri</span>
            <span className="text-[10px] text-emerald-400 font-mono">v2.0</span>
          </div>
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition"
          >
            ← Kembali
          </Link>
        </header>

        <main className="max-w-md w-full mx-auto my-auto bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mx-auto border border-amber-500/20">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30 inline-block">
              MENUNGGU ACC
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Akses Menunggu Persetujuan
            </h2>
            <p className="text-xs text-slate-300">
              Pendaftaran <strong>{pendingRegData.nama_yayasan}</strong> telah kami terima. Menu aktif setelah disetujui Super Admin.
            </p>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-3 text-left border border-slate-800 space-y-1 text-xs text-slate-300">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Pimpinan:</span>
              <span className="font-medium text-white">{pendingRegData.nama_pimpinan}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">WhatsApp:</span>
              <span className="font-medium text-emerald-400">{pendingRegData.no_whatsapp}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Paket:</span>
              <span className="font-bold text-amber-300">Paket {pendingRegData.paket_pilihan}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/super-admin"
              className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Buka Super Admin untuk ACC ➔</span>
            </Link>

            <button
              type="button"
              onClick={checkApprovalStatus}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-700 transition"
            >
              Periksa Status Ulang
            </button>
          </div>
        </main>

        <footer className="text-center text-[10px] text-slate-600 py-3">
          © 2026 KabarSantri v2.0 Platform
        </footer>
      </div>
    );
  }

  // Dynamic Dashboard route according to current section
  const getDashboardHref = () => {
    if (pathname?.includes('/wakil-yayasan')) return '/dashboard/wakil-yayasan';
    if (pathname?.includes('/yayasan')) return '/dashboard/yayasan';
    return '/dashboard/mudir';
  };

  const dashboardHref = getDashboardHref();

  interface MobileTabItem {
    href: string;
    label: string;
    icon: any;
    isActive: boolean;
    badge?: string;
  }

  // Primary Quick Mobile Bottom Tabs (Optimized for Small Screens)
  const mobileBottomTabs: MobileTabItem[] = [
    { 
      href: dashboardHref, 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      isActive: Boolean(pathname?.startsWith('/dashboard'))
    },
    { 
      href: '/akademik/nilai', 
      label: 'KBM Guru', 
      icon: BookOpen,
      isActive: Boolean(pathname?.startsWith('/akademik') && !pathname?.includes('/perizinan'))
    },
    { 
      href: '/presensi/diri', 
      label: 'Absen Diri', 
      icon: UserCheck,
      isActive: Boolean(pathname?.startsWith('/presensi')),
    },
    { 
      href: '/kepegawaian', 
      label: 'HRD / Cuti', 
      icon: Users,
      isActive: Boolean(pathname?.startsWith('/kepegawaian'))
    },
  ];

  // Modul untuk Mobile Bottom Sheet
  const allPillars = [
    {
      title: 'Yayasan & Pimpinan',
      desc: 'Ringkasan Eksekutif & Informasi Strategis',
      items: [
        { href: '/dashboard/yayasan', label: 'Dashboard Yayasan', icon: Building2 },
        { href: '/laporan/ringkasan', label: 'Ringkasan Eksekutif & Analitik', icon: FileText },
      ]
    },
    {
      title: 'Operasional & Persetujuan',
      desc: 'Persetujuan Anggaran & Kebijakan',
      items: [
        { href: '/dashboard/wakil-yayasan', label: 'Dashboard Persetujuan', icon: ShieldCheck },
        { href: '/finance/pengaturan-threshold', label: 'Batas Mandiri Persetujuan', icon: Wallet },
      ]
    },
    {
      title: 'Kepegawaian & SDM',
      desc: 'Pusat Kepegawaian, Cuti & Presensi',
      items: [
        { href: '/kepegawaian', label: 'Pusat Kepegawaian & Cuti', icon: Users },
        { href: '/presensi/diri', label: 'Presensi Diri Pegawai', icon: MapPin },
        { href: '/presensi/santri', label: 'Presensi Santri Berjamaah & Kelas', icon: CheckCircle2 },
      ]
    },
    {
      title: 'Keuangan & SPP',
      desc: 'SPP, Uang Saku & Pengeluaran Kas',
      items: [
        { href: '/finance', label: 'Dashboard Keuangan', icon: Wallet },
        { href: '/finance/spp', label: 'Pembayaran SPP Santri', icon: FileText },
        { href: '/finance/uang-jajan', label: 'Uang Saku Santri', icon: Wallet },
        { href: '/finance/pengeluaran', label: 'Pengajuan Biaya & Realisasi', icon: ArrowRight },
      ]
    },
    {
      title: 'Akademik & Kesantrian',
      desc: 'KBM Guru, Tahfidz & Kesiswaan',
      items: [
        { href: '/dashboard/mudir', label: 'Dashboard Akademik', icon: School },
        { href: '/akademik/nilai', label: 'Ruang Guru (KBM & Nilai)', icon: BookOpen },
        { href: '/akademik/perizinan', label: 'Perizinan Santri', icon: Clock },
        { href: '/akademik/disiplin', label: 'Kedisiplinan & Pelanggaran', icon: ShieldCheck },
        { href: '/akademik/tahfidz', label: 'Setoran Tahfidz Al-Qur\'an', icon: Award },
        { href: '/santri/list', label: 'Direktori Santri & Rombel', icon: Users },
      ]
    },
    {
      title: 'Sarana & Prasarana',
      desc: 'Fasilitas, Pemeliharaan & Logistik',
      items: [
        { href: '/rumah-tangga', label: 'Dashboard Logistik & Sarpras', icon: Home },
        { href: '/rumah-tangga/pengajuan', label: 'Pengajuan Pengadaan Fasilitas', icon: FileText },
      ]
    },
    {
      title: 'Portal Orang Tua',
      desc: 'Akses Portal Wali Murid',
      items: [
        { href: '/portal-wali', label: 'Portal Wali Santri', icon: ExternalLink },
        { href: '/login', label: 'Ganti Akun / Logout', icon: ArrowRight },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden w-full max-w-full">
      {/* Sidebar with Desktop & Mobile Drawer mode */}
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onMobileClose={() => setMobileMenuOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full max-w-full">
        {/* Top Header with Hamburger for Mobile */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-8 pb-24 md:pb-8 bg-slate-50 dark:bg-slate-950 w-full max-w-full transition-colors">
          <div className="max-w-7xl mx-auto space-y-5 w-full min-w-0">
            <Suspense fallback={<div className="p-4 text-xs text-slate-400">Memuat modul...</div>}>
              {children}
            </Suspense>
          </div>
        </main>

        {/* 📱 MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 flex items-center justify-around px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none">
          {mobileBottomTabs.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-all duration-150 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition ${
                  isActive 
                    ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 shadow-2xs' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[64px]">
                  {item.label}
                </span>

                {item.badge && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                )}
              </Link>
            );
          })}

          {/* Tombol "Semua Tab" (Clickable Bottom Drawer) */}
          <button
            onClick={() => setBottomDrawerOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 ${
              bottomDrawerOpen 
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105' 
                : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${
              bottomDrawerOpen 
                ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 shadow-2xs' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}>
              <Grid className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">
              Semua Menu
            </span>
          </button>
        </nav>

        {/* 📋 MOBILE BOTTOM SHEET */}
        {bottomDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
            <div 
              className="flex-1 w-full" 
              onClick={() => setBottomDrawerOpen(false)} 
            />

            <div className="w-full bg-white dark:bg-slate-900 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom duration-300">
              {/* Drawer Drag Pill */}
              <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={() => setBottomDrawerOpen(false)}>
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>

              {/* Drawer Header */}
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Semua Modul KabarSantri</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Navigasi terpadu pesantren</p>
                  </div>
                </div>

                <button
                  onClick={() => setBottomDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
                  title="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-4 space-y-3.5 overflow-y-auto pb-24 text-xs">
                {/* Info Tenant Aktif */}
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    {tenant.logo_url ? (
                      <img src={tenant.logo_url} alt={tenant.name} className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                        KS
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{tenant.name || 'Portal Lembaga'}</div>
                      <div className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold">{APP_BRAND.name} {APP_BRAND.version}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                    Online
                  </span>
                </div>

                {/* Modul Cards */}
                <div className="space-y-2.5">
                  {allPillars.map((pillar, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-2 transition"
                    >
                      <div>
                        <span className="font-extrabold text-xs text-blue-900 dark:text-blue-300 block">
                          {pillar.title}
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {pillar.desc}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-1">
                        {pillar.items.map((sub, sIdx) => {
                          const SubIcon = sub.icon;
                          const isSubActive = pathname === sub.href;

                          return (
                            <Link
                              key={sIdx}
                              href={sub.href}
                              onClick={() => setBottomDrawerOpen(false)}
                              className={`p-2 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
                                isSubActive
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                                <span>{sub.label}</span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 ${isSubActive ? 'text-white/70' : 'text-slate-400'}`} />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
