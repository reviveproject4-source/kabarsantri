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
  Lock,
  Settings
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useActiveTenant, APP_BRAND, getActiveActor } from '@/lib/sessionStore';
import { getActiveTenantPackageAndFeatures } from '@/lib/yayasanRegistrationStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const tenant = useActiveTenant();
  const tenantPackageInfo = getActiveTenantPackageAndFeatures(tenant.id);

  useEffect(() => {
    setMounted(true);
  }, [pathname]);

  const activeActor = mounted && typeof window !== 'undefined' ? getActiveActor() : { role_key: 'yayasan' };
  const isPegawai = activeActor.role_key === 'pegawai' || activeActor.role_key === 'guru' || activeActor.role_key === 'guru_akhwat' || activeActor.role_key === 'musyrif';

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

  // Dynamic Dashboard route according to current section & actor
  const getDashboardHref = () => {
    if (activeActor.role_key === 'yayasan' || pathname?.includes('/yayasan')) return '/dashboard/yayasan';
    if (pathname?.includes('/wakil-yayasan')) return '/dashboard/wakil-yayasan';
    return '/dashboard'; // Pegawai goes to /dashboard, NEVER to /dashboard/mudir!
  };

  const dashboardHref = getDashboardHref();

  interface MobileTabItem {
    href: string;
    label: string;
    icon: any;
    isActive: boolean;
    badge?: string;
  }

  const isYayasan = activeActor.role_key === 'yayasan' || activeActor.role_key === 'pimpinan_yayasan';

  // Primary Quick Mobile Bottom Tabs
  // Untuk Pegawai: Dashboard, Tahfidz (Prioritas), KBM Guru, Absen Diri, Pengaturan (Ganti Password & Mode)
  // Untuk Yayasan: Dashboard Yayasan, Tahfidz, Keuangan / SPP, HRD / Kehadiran Pegawai, Pengaturan
  const mobileBottomTabs: MobileTabItem[] = isPegawai ? [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard'
    },
    { 
      href: '/akademik/tahfidz', 
      label: 'Tahfidz', 
      icon: Award,
      isActive: Boolean(pathname?.startsWith('/akademik/tahfidz'))
    },
    { 
      href: '/akademik/nilai', 
      label: 'KBM Guru', 
      icon: BookOpen,
      isActive: Boolean(pathname?.startsWith('/akademik/nilai'))
    },
    { 
      href: '/presensi/diri', 
      label: 'Absen Diri', 
      icon: UserCheck,
      isActive: Boolean(pathname?.startsWith('/presensi/diri'))
    },
    { 
      href: '/pengaturan', 
      label: 'Pengaturan', 
      icon: Settings,
      isActive: Boolean(pathname?.startsWith('/pengaturan'))
    },
  ] : isYayasan ? [
    { 
      href: '/dashboard/yayasan', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      isActive: Boolean(pathname?.startsWith('/dashboard/yayasan'))
    },
    { 
      href: '/akademik/tahfidz', 
      label: 'Tahfidz', 
      icon: Award,
      isActive: Boolean(pathname?.startsWith('/akademik/tahfidz'))
    },
    { 
      href: '/finance', 
      label: 'Keuangan', 
      icon: Wallet,
      isActive: Boolean(pathname?.startsWith('/finance'))
    },
    { 
      href: '/kepegawaian', 
      label: 'Kehadiran HRD', 
      icon: Users,
      isActive: Boolean(pathname?.startsWith('/kepegawaian'))
    },
    { 
      href: '/pengaturan', 
      label: 'Pengaturan', 
      icon: Settings,
      isActive: Boolean(pathname?.startsWith('/pengaturan'))
    },
  ] : [
    { 
      href: dashboardHref, 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      isActive: Boolean(pathname?.startsWith('/dashboard'))
    },
    { 
      href: '/akademik/tahfidz', 
      label: 'Tahfidz', 
      icon: Award,
      isActive: Boolean(pathname?.startsWith('/akademik/tahfidz'))
    },
    { 
      href: '/kepegawaian', 
      label: 'Kepegawaian', 
      icon: Users,
      isActive: Boolean(pathname?.startsWith('/kepegawaian'))
    },
    { 
      href: '/pengaturan', 
      label: 'Pengaturan', 
      icon: Settings,
      isActive: Boolean(pathname?.startsWith('/pengaturan'))
    },
  ];

  // Modul untuk Mobile Bottom Sheet yang disesuaikan dengan Paket & Fitur dari Super Admin
  const rawPillars = [
    {
      title: 'Yayasan & Pimpinan',
      desc: 'Ringkasan Eksekutif & Informasi Strategis',
      featureKey: 'dashboard',
      items: [
        { href: '/dashboard/yayasan', label: 'Dashboard Yayasan', icon: Building2 },
        { href: '/laporan/ringkasan', label: 'Ringkasan Eksekutif & Analitik', icon: FileText },
      ]
    },
    {
      title: 'Operasional & Persetujuan',
      desc: 'Persetujuan Anggaran & Kebijakan',
      featureKey: 'spp',
      items: [
        { href: '/dashboard/wakil-yayasan', label: 'Dashboard Persetujuan', icon: ShieldCheck },
        { href: '/finance/pengaturan-threshold', label: 'Batas Mandiri Persetujuan', icon: Wallet },
      ]
    },
    {
      title: 'Kepegawaian & SDM',
      desc: 'Pusat Kepegawaian, Cuti & Presensi',
      featureKey: 'kepegawaian',
      items: [
        { href: '/kepegawaian', label: 'Direktori & Status Kehadiran Pegawai', icon: Users },
        ...(!isYayasan ? [{ href: '/presensi/diri', label: 'Presensi Diri Pegawai', icon: MapPin }] : []),
        { href: '/presensi/santri', label: 'Presensi Santri Berjamaah & Kelas', icon: CheckCircle2 },
      ]
    },
    {
      title: 'Keuangan & SPP',
      desc: 'SPP, Uang Saku & Pengeluaran Kas',
      featureKey: 'spp',
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
      featureKey: 'tahfidz',
      items: [
        activeActor.role_key === 'mudir'
          ? { href: '/dashboard/mudir', label: 'Console Operasional Mudir', icon: School }
          : { href: '/laporan/ringkasan', label: 'Laporan Konsolidasi Akademik', icon: School },
        { href: '/akademik/tahfidz', label: 'Setoran Tahfidz Al-Qur\'an', icon: Award },
        { href: '/santri/list', label: 'Direktori Santri & Rombel', icon: Users },
        ...(tenantPackageInfo.isFeatureUnlocked('kbm') ? [{ href: '/akademik/nilai', label: 'Ruang Guru (KBM & Nilai)', icon: BookOpen }] : []),
        ...(tenantPackageInfo.isFeatureUnlocked('adab') ? [
          { href: '/akademik/perizinan', label: 'Perizinan Santri', icon: Clock },
          { href: '/akademik/disiplin', label: 'Kedisiplinan & Pelanggaran', icon: ShieldCheck }
        ] : []),
      ]
    },
    {
      title: 'Sarana & Prasarana',
      desc: 'Fasilitas, Pemeliharaan & Logistik',
      featureKey: 'rumah_tangga',
      items: [
        { href: '/rumah-tangga', label: 'Dashboard Logistik & Sarpras', icon: Home },
        { href: '/rumah-tangga/pengajuan', label: 'Pengajuan Pengadaan Fasilitas', icon: FileText },
      ]
    },
    {
      title: 'Portal Orang Tua',
      desc: 'Akses Portal Wali Murid',
      featureKey: 'wali',
      items: [
        { href: '/portal-wali', label: 'Portal Wali Santri', icon: ExternalLink },
        { href: '/login', label: 'Ganti Akun / Logout', icon: ArrowRight },
      ]
    }
  ];

  // Filter pillar sesuai lisensi yang diberikan oleh Super Admin dan peran Yayasan
  const allPillars = rawPillars
    .filter(p => tenantPackageInfo.isFeatureUnlocked(p.featureKey))
    .filter(p => {
      // Hapus Portal Orang Tua dari Dashboard Yayasan
      if (isYayasan && p.title === 'Portal Orang Tua') return false;
      return true;
    });

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

          {/* Tombol "Semua Tab" (Clickable Bottom Drawer - Hanya untuk Non-Pegawai / Eksekutif Yayasan) */}
          {!isPegawai && (
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
          )}
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
