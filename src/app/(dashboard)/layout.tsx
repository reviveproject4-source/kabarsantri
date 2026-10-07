'use client';

import React, { useState } from 'react';
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
  Laptop,
  Briefcase,
  Award,
  Sparkles,
  MapPin,
  ChevronRight
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useActiveTenant, APP_BRAND } from '@/lib/sessionStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const pathname = usePathname();
  const tenant = useActiveTenant();

  // Dynamic Dashboard route according to current section
  const getDashboardHref = () => {
    if (pathname?.includes('/wakil-yayasan')) return '/dashboard/wakil-yayasan';
    if (pathname?.includes('/yayasan')) return '/dashboard/yayasan';
    return '/dashboard/mudir';
  };

  const dashboardHref = getDashboardHref();

  // Primary 5 Quick Mobile Bottom Tabs (Optimized for Small Screens)
  const mobileBottomTabs = [
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
      badge: 'GPS'
    },
    { 
      href: '/kepegawaian', 
      label: 'HRD / Cuti', 
      icon: Users,
      isActive: Boolean(pathname?.startsWith('/kepegawaian'))
    },
  ];

  // All 6 Pillars & Modules for the Mobile Bottom Sheet (Semua Side Tab Pindah ke Bawah)
  const allPillars = [
    {
      title: 'Pilar 1: Yayasan (Information Only)',
      desc: 'Executive Information System & Ringkasan Strategis',
      color: 'from-blue-600 to-indigo-700',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      items: [
        { href: '/dashboard/yayasan', label: 'Dashboard Ketua Yayasan', icon: Building2 },
        { href: '/laporan/ringkasan', label: 'Ringkasan Eksekutif & AI Analitik', icon: FileText },
      ]
    },
    {
      title: 'Pilar 2: Wakil Ketua Yayasan (Approval)',
      desc: 'Otoritas Persetujuan Anggaran, Sarpras & Rekening Bank',
      color: 'from-teal-600 to-emerald-700',
      textColor: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      items: [
        { href: '/dashboard/wakil-yayasan', label: 'Dashboard Control Tower (Approval)', icon: ShieldCheck },
        { href: '/finance/pengaturan-threshold', label: 'Atur Batas Threshold Persetujuan', icon: Wallet },
      ]
    },
    {
      title: 'Pilar 3: HRD & Kepegawaian',
      desc: 'Manajemen SDM, Persetujuan Cuti & Absen GPS Pegawai',
      color: 'from-emerald-600 to-teal-700',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      items: [
        { href: '/kepegawaian', label: 'Pusat Kepegawaian & Approval Cuti', icon: Users },
        { href: '/presensi/diri', label: 'Absensi Diri Sendiri (Live GPS)', icon: MapPin },
        { href: '/presensi/santri', label: 'Presensi Santri Berjamaah & Kelas', icon: CheckCircle2 },
      ]
    },
    {
      title: 'Pilar 4: Keuangan Pesantren (Finance)',
      desc: 'Kompensasi Gaji, Rekonsiliasi SPP, Uang Jajan & Pengeluaran',
      color: 'from-amber-600 to-orange-700',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      items: [
        { href: '/finance', label: 'Dashboard Keuangan Pondok', icon: Wallet },
        { href: '/finance/spp', label: 'Pembayaran SPP Santri', icon: FileText },
        { href: '/finance/uang-jajan', label: 'Uang Saku & Tabungan Wadiah', icon: Wallet },
        { href: '/finance/pengeluaran', label: 'Pengajuan Biaya & Realisasi Dana', icon: ArrowRight },
      ]
    },
    {
      title: 'Pilar 5: Mudir / Akademik KBM',
      desc: 'Kurikulum Mapel, Guru Inval, Rombel, Jurnal KBM & Nilai',
      color: 'from-emerald-700 to-teal-800',
      textColor: 'text-emerald-800',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      items: [
        { href: '/dashboard/mudir', label: 'Dashboard Mudir (Kepala Sekolah)', icon: School },
        { href: '/akademik/nilai', label: 'Ruang Guru (KBM, Jurnal & Nilai)', icon: BookOpen },
        { href: '/akademik/perizinan', label: 'Perizinan Santri & Gate Pass QR', icon: Clock },
        { href: '/akademik/disiplin', label: 'Buku Kedisiplinan & Poin Pelanggaran', icon: ShieldCheck },
        { href: '/akademik/tahfidz', label: 'Setoran Tahfidz Al-Qur\'an', icon: Award },
        { href: '/santri/list', label: 'Direktori Santri & Rombel', icon: Users },
      ]
    },
    {
      title: 'Pilar 6: Rumah Tangga & Sarpras',
      desc: 'Fasilitas, Pemeliharaan Aset, Gudang & Pengajuan Belanja RT',
      color: 'from-slate-700 to-slate-900',
      textColor: 'text-slate-800',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-300',
      items: [
        { href: '/rumah-tangga', label: 'Dashboard Logistik & Fasilitas RT', icon: Home },
        { href: '/rumah-tangga/pengajuan', label: 'Pengajuan Sarpras ke Yayasan', icon: FileText },
      ]
    },
    {
      title: 'Portal Terkait & Multi-Perangkat',
      desc: 'Layanan Eksternal Terhubung',
      color: 'from-purple-600 to-indigo-800',
      textColor: 'text-purple-800',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      items: [
        { href: '/portal-wali', label: 'Portal Wali Santri (Digital Pass & SPP)', icon: ExternalLink },
        { href: '/login', label: 'Ganti Akun / Logout', icon: ArrowRight },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden w-full max-w-full">
      {/* Sidebar with Desktop & Mobile Drawer mode */}
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onMobileClose={() => setMobileMenuOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full max-w-full">
        {/* Top Header with Hamburger for Mobile */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Main Content Area - Mobile Padding Friendly, Zero Horizontal Wobble */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-8 pb-24 md:pb-8 bg-slate-50 w-full max-w-full">
          <div className="max-w-7xl mx-auto space-y-5 w-full min-w-0">
            {children}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* 📱 DEDICATED MOBILE BOTTOM NAVIGATION BAR (SEKUMPULAN SIDE TAB PINDAH KE BAWAH) */}
        {/* ========================================================================= */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-around px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none">
          {mobileBottomTabs.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-all duration-150 ${
                  isActive
                    ? 'text-emerald-700 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition ${
                  isActive 
                    ? 'bg-emerald-100 text-emerald-800 shadow-2xs' 
                    : 'hover:bg-slate-100'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[64px]">
                  {item.label}
                </span>

                {item.badge && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </Link>
            );
          })}

          {/* Tombol "Semua Tab" (Membuka Bottom Sheet Lengkap 6 Pilar & Fitur Sidebar) */}
          <button
            onClick={() => setBottomDrawerOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 ${
              bottomDrawerOpen 
                ? 'text-emerald-700 font-bold scale-105' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${
              bottomDrawerOpen 
                ? 'bg-emerald-100 text-emerald-800 shadow-2xs' 
                : 'hover:bg-slate-100'
            }`}>
              <Grid className="w-5 h-5 text-slate-700" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold text-slate-700">
              Semua Tab
            </span>
          </button>
        </nav>

        {/* ========================================================================= */}
        {/* 📋 MOBILE BOTTOM SHEET: SELURUH SIDE TAB TERPINDAH RAPI KE BAWAH */}
        {/* ========================================================================= */}
        {bottomDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
            {/* Backdrop Dismiss Area */}
            <div 
              className="flex-1 w-full" 
              onClick={() => setBottomDrawerOpen(false)} 
            />

            {/* Bottom Sheet Drawer Container */}
            <div className="w-full bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-300">
              {/* Drawer Drag Pill Handle */}
              <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={() => setBottomDrawerOpen(false)}>
                <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
              </div>

              {/* Drawer Header */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Semua Tab Navigasi &amp; 6 Pilar</h3>
                    <p className="text-[11px] text-slate-500">Akses seluruh modul operasional pesantren</p>
                  </div>
                </div>

                <button
                  onClick={() => setBottomDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition"
                  title="Tutup Menu Bawah"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-4 space-y-4 overflow-y-auto pb-24 text-xs">
                {/* Info Tenant / Pesantren Aktif */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    {tenant.logo_url ? (
                      <img src={tenant.logo_url} alt={tenant.name} className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                        KS
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs">{tenant.name}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">{APP_BRAND.name} {APP_BRAND.version} • Backoffice</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                    Online
                  </span>
                </div>

                {/* 6 Pilar Cards Accordion / List */}
                <div className="space-y-3">
                  {allPillars.map((pillar, idx) => (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-2xl border ${pillar.borderColor} ${pillar.bgColor} space-y-2.5 transition`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`font-extrabold text-xs tracking-tight ${pillar.textColor}`}>
                            {pillar.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {pillar.desc}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5">
                        {pillar.items.map((sub, sIdx) => {
                          const SubIcon = sub.icon;
                          const isSubActive = pathname === sub.href;

                          return (
                            <Link
                              key={sIdx}
                              href={sub.href}
                              onClick={() => setBottomDrawerOpen(false)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
                                isSubActive
                                  ? 'bg-white border-emerald-500 text-emerald-900 shadow-xs'
                                  : 'bg-white/80 hover:bg-white border-slate-200/80 text-slate-700 hover:text-slate-900'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                                <span>{sub.label}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
