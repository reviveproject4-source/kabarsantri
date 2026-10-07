'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  ChevronDown, 
  RefreshCw, 
  Bell, 
  LogOut,
  Building2,
  FlaskConical,
  ShieldCheck,
  Laptop,
  Download,
  Upload,
  Cloud,
  CheckCircle2,
  X,
  Menu
} from 'lucide-react';

import { 
  getActiveActor, 
  setActiveActorByRole,
  APP_BRAND,
  useActiveTenant,
  updateTenantPesantrenLogo,
  resetTenantPesantrenLogo,
  useAppMode
} from '@/lib/sessionStore';
import {
  downloadSystemStateFile,
  importSystemState,
  syncStateToSupabase,
  pullStateFromSupabase,
  initCrossTabSyncListener
} from '@/lib/syncEngine';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export default function Header({ onToggleMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const tenant = useActiveTenant();
  const { mode: appMode, setMode: setAppModeState, isDemo, isTenant } = useAppMode();
  const [activeRole, setActiveRole] = useState<string>('yayasan');

  React.useEffect(() => {
    setActiveRole(getActiveActor().role_key);
    if (typeof document !== 'undefined') {
      setIsSandbox(document.cookie.includes('ks_demo_mode=true'));
    }
  }, []);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [inputPesantrenLogo, setInputPesantrenLogo] = useState(tenant.logo_url || '');
  const [tenantSaveSuccess, setTenantSaveSuccess] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCloudLoading, setIsCloudLoading] = useState(false);

  React.useEffect(() => {
    setInputPesantrenLogo(tenant.logo_url || '');
  }, [tenant.logo_url]);

  const handleSaveTenantLogo = (urlToSave?: string) => {
    const finalUrl = urlToSave !== undefined ? urlToSave : inputPesantrenLogo;
    updateTenantPesantrenLogo(finalUrl);
    setTenantSaveSuccess(true);
    setTimeout(() => setTenantSaveSuccess(false), 2500);
  };

  const handleResetTenantLogo = () => {
    resetTenantPesantrenLogo();
    setInputPesantrenLogo('');
    setTenantSaveSuccess(true);
    setTimeout(() => setTenantSaveSuccess(false), 2500);
  };

  // Cross-Tab Listener (Item 4.3)
  React.useEffect(() => {
    const unsub = initCrossTabSyncListener((store) => {
      if (store === 'ks_active_actor_v2' || store === 'ALL_STORES') {
        const actor = getActiveActor();
        setActiveRole(actor.role_key);
      }
    });
    return unsub;
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importSystemState(content);
        if (res.success) {
          setSyncMsg({ type: 'success', text: res.message });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setSyncMsg({ type: 'error', text: res.message });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCloudUpload = async () => {
    setIsCloudLoading(true);
    setSyncMsg(null);
    const res = await syncStateToSupabase();
    setIsCloudLoading(false);
    setSyncMsg({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleCloudPull = async () => {
    setIsCloudLoading(true);
    setSyncMsg(null);
    const res = await pullStateFromSupabase();
    setIsCloudLoading(false);
    setSyncMsg({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) {
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  // Sinkronkan Peran Aktif sesuai Rute Halaman Dashboard yang dibuka,
  // TETAPI JANGAN timpa aktor jika user sedang aktif sebagai Staf/Pegawai Pelaksana!
  React.useEffect(() => {
    const current = getActiveActor();
    const currentKey = current.role_key;

    // Jika user sedang aktif sebagai staf departemen terkait, pertahankan perannya!
    if (pathname.startsWith('/rumah-tangga') && ['laundry', 'dapur', 'satpam', 'kepala_rumah_tangga'].includes(currentKey)) {
      return;
    }
    if (pathname.startsWith('/finance') && ['kasir', 'keuangan'].includes(currentKey)) {
      return;
    }
    if (pathname.startsWith('/kepegawaian') && ['staf_hrd', 'kepala_kepegawaian'].includes(currentKey)) {
      return;
    }
    if (pathname.startsWith('/akademik') && ['guru', 'guru_akhwat', 'musyrif', 'musyrifah', 'mudir'].includes(currentKey)) {
      return;
    }
    if (pathname.startsWith('/presensi') && ['guru', 'guru_akhwat', 'musyrif', 'musyrifah', 'laundry', 'dapur', 'satpam', 'kasir', 'staf_hrd', 'kepala_kepegawaian', 'kepala_rumah_tangga', 'mudir'].includes(currentKey)) {
      return;
    }
    if (pathname === '/dashboard') {
      // Di dashboard, pertahankan peran aktif apa pun yang dipilih user!
      return;
    }

    let targetRole: string | null = null;
    if (pathname.includes('/yayasan')) {
      targetRole = 'yayasan';
    } else if (pathname.includes('/wakil-yayasan')) {
      targetRole = 'wakil_yayasan';
    } else if (pathname.includes('/kepegawaian')) {
      targetRole = 'kepala_kepegawaian';
    } else if (pathname.includes('/mudir')) {
      targetRole = 'mudir';
    } else if (pathname.startsWith('/finance')) {
      targetRole = 'keuangan';
    } else if (pathname.startsWith('/rumah-tangga')) {
      targetRole = 'kepala_rumah_tangga';
    } else if (pathname.startsWith('/akademik/nilai')) {
      targetRole = 'guru';
    } else if (pathname.startsWith('/super-admin')) {
      targetRole = 'super_admin';
    }

    if (targetRole && targetRole !== currentKey) {
      setActiveRole(targetRole);
      setActiveActorByRole(targetRole);
    }
  }, [pathname]);

  const toggleSandbox = () => {
    const nextVal = !isSandbox;
    setIsSandbox(nextVal);
    document.cookie = `ks_demo_mode=${nextVal}; path=/; max-age=86400`;
  };

  const roles = [
    // --- KELOMPOK PIMPINAN (6 PILAR UTAMA) ---
    { id: 'yayasan', category: 'PIMPINAN', label: '1. Ketua Yayasan', dept: 'INFORMATION ONLY (Strategic EIS)', name: 'KH. Abdullah Faqih, Lc.', nip: 'PEG-YYS-001' },
    { id: 'wakil_yayasan', category: 'PIMPINAN', label: '2. Wakil Ketua Yayasan', dept: 'OPERATIONAL APPROVAL (Control Tower)', name: 'Drs. H. M. Mansyur, M.Pd.', nip: 'PEG-YYS-002' },
    { id: 'kepala_kepegawaian', category: 'PIMPINAN', label: '3. Kepala HRD', dept: 'APPROVAL CUTI & People Governance', name: 'Ust. Ir. Faisal Rahman, M.M.', nip: 'PEG-HRD-001' },
    { id: 'keuangan', category: 'PIMPINAN', label: '4. Kepala Keuangan', dept: 'KOMPENSASI & TRANSAKSI KEUANGAN', name: 'Ust. Ahmad Dahlan, S.E.', nip: 'PEG-KEU-001' },
    { id: 'mudir', category: 'PIMPINAN', label: '5. Mudir / Kepala Madrasah', dept: 'AKADEMIK & PROSES KBM (Guru & Santri)', name: 'Dr. KH. Mahmud Ridwan, M.A.', nip: 'PEG-MDR-001' },
    { id: 'kepala_rumah_tangga', category: 'PIMPINAN', label: '6. Kepala Bagian RT & Sarpras', dept: 'OPERASIONAL / SARPRAS (Fasilitas & Logistik)', name: 'Pak Subandi, S.T.', nip: 'PEG-RT-001' },
    
    // --- KELOMPOK TIM PEGAWAI / STAF OPERASIONAL ---
    { id: 'guru', category: 'PEGAWAI', label: '7a. Guru Putra (Ustadz Ikhwan)', dept: 'PENGAJARAN KBM PUTRA', name: 'Ust. Lukman Hakim, M.Kom.', nip: 'PEG-GRU-001' },
    { id: 'guru_akhwat', category: 'PEGAWAI', label: '7b. Guru Putri (Ustadzah Akhwat)', dept: 'PENGAJARAN KBM PUTRI', name: 'Usth. Fatimah Az-Zahra, S.Pd.', nip: 'PEG-GRU-002' },
    { id: 'musyrif', category: 'PEGAWAI', label: '8a. Musyrif Asrama Putra', dept: 'PENGASUHAN SANTRI PUTRA', name: 'Ust. Hamzah al-Bantani', nip: 'PEG-MSR-001' },
    { id: 'musyrifah', category: 'PEGAWAI', label: '8b. Musyrifah Asrama Putri', dept: 'PENGASUHAN SANTRI PUTRI', name: 'Usth. Siti Khadijah, S.Pd.I.', nip: 'PEG-MSR-002' },
    { id: 'laundry', category: 'PEGAWAI', label: '9a. Pegawai Laundry Pesantren', dept: 'OPERASIONAL UNIT LAUNDRY (RT)', name: 'Ibu Sumiati', nip: 'NIP.LND.2021.013' },
    { id: 'dapur', category: 'PEGAWAI', label: '9b. Pegawai Dapur & Konsumsi', dept: 'LOGISTIK MASAK SANTRI (RT)', name: 'Pak Slamet', nip: 'NIP.DPR.2022.019' },
    { id: 'satpam', category: 'PEGAWAI', label: '9c. Satpam Pos Gerbang', dept: 'KEAMANAN & SCAN GATE PASS (RT)', name: 'Pak Subandi', nip: 'NIP.SEC.2020.005' },
    { id: 'kasir', category: 'PEGAWAI', label: '10. Staf Kasir & Loket SPP', dept: 'LOKET SPP & WA STRUK WALI (KEUANGAN)', name: 'Mbak Anisa, A.Md.', nip: 'NIP.KEU.2023.041' },
    { id: 'staf_hrd', category: 'PEGAWAI', label: '11. Staf Admin HRD & Presensi', dept: 'REKAP MESIN & GPS SDM (HRD)', name: 'Ust. Wildan Pratama', nip: 'NIP.HRD.2024.055' },

    // --- SUPER ADMIN ---
    { id: 'super_admin', category: 'SYSTEM', label: '★ Super Admin (Owner Console)', dept: 'ONBOARDING TENANT & KUOTA TIER 1', name: 'Super Admin KabarSantri', nip: 'ROOT-SYS-001' },
  ];

  const handleSwitchRole = (roleId: any) => {
    setActiveRole(roleId);
    setActiveActorByRole(roleId);
    setDropdownOpen(false);
  };

  const currentRoleObj = roles.find(r => r.id === activeRole) || roles[0];

  return (
    <>
      {/* JALUR BANNER: Pemisahan Jelas antara Jalur Demo dan Jalur Tenant */}
      {isDemo ? (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white px-3 sm:px-6 py-1.5 text-xs font-semibold flex items-center justify-between shadow-xs z-20">
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span className="truncate">
              <span className="bg-amber-950/60 text-amber-200 px-1.5 py-0.5 rounded text-[10px] font-black mr-1 uppercase">Jalur Demo</span>
              Simulasi 6-Pilar Terpadu (Pondok Al-Hikmah • 450 Santri • Switcher 12 Peran Aktif).
            </span>
          </div>
          <button 
            onClick={() => {
              setAppModeState('tenant', 'tenant-rabu-001');
              window.location.reload();
            }}
            className="ml-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-[11px] font-bold px-2 py-0.5 rounded transition shrink-0 whitespace-nowrap"
            title="Beralih ke Jalur Tenant Lembaga Resmi (Nurul Huda)"
          >
            Masuk Jalur Tenant Resmi ➔
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-3 sm:px-6 py-1.5 text-xs font-semibold flex items-center justify-between shadow-xs z-20">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="truncate">
              <span className="bg-emerald-950/60 text-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-black mr-1 uppercase">Jalur Tenant</span>
              {tenant.name} • {tenant.id === 'tenant-rabu-001' ? 'Tier 1 Starter (Free Kuota 50 Santri) • Mode Produksi Lembaga' : 'Portal Resmi Tenant'}
            </span>
          </div>
          <button 
            onClick={() => {
              setAppModeState('demo');
              window.location.reload();
            }}
            className="ml-2 bg-emerald-700/60 hover:bg-emerald-700/90 border border-emerald-400/40 text-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded transition shrink-0 whitespace-nowrap"
            title="Beralih ke Jalur Demo Sistem (6 Pilar)"
          >
            Beralih ke Demo 6-Pilar ➔
          </button>
        </div>
      )}
      <header className="h-16 bg-white border-b border-slate-200 px-2.5 sm:px-6 flex items-center justify-between z-10 select-none w-full max-w-full overflow-hidden">
        {/* Left: Mobile Hamburger, Logo Aplikasi KabarSantri (Permanen), & Tenant/Pesantren Badge */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          {/* Logo Resmi Aplikasi KabarSantri (Permanen & Tidak Ditimpa) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 sm:pr-3 sm:border-r sm:border-slate-200">
            <img
              src={APP_BRAND.logo_url}
              alt={APP_BRAND.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shadow-xs border border-blue-200 bg-white shrink-0"
            />
            <div className="hidden lg:block leading-none">
              <span className="font-extrabold text-slate-800 text-sm tracking-tight block">
                {APP_BRAND.name} <span className="text-emerald-600 text-[11px] font-semibold">{APP_BRAND.version}</span>
              </span>
            </div>
          </div>

          {/* Desktop Institution & Unit Badge (Large screens only) */}
          <button
            onClick={() => setTenantModalOpen(true)}
            title="Klik untuk melihat / mengatur Identitas Pesantren (Tenant)"
            className="hidden xl:flex items-center space-x-2 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg border border-slate-200 transition text-left shrink-0"
          >
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="w-4 h-4 rounded object-contain shrink-0" />
            ) : (
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="truncate max-w-[260px]">
              <span className="text-slate-500">Pesantren: </span>
              <strong className="text-slate-800">{tenant.name.replace('Pondok Pesantren ', '')}</strong>
              <span className="text-slate-400 mx-1">•</span>
              <span className="text-emerald-700 font-semibold">{currentRoleObj?.dept?.split('(')[0]?.trim() || 'MTs Putra'}</span>
            </span>
          </button>

          {/* Compact Institution Badge (Tablet, Mobile, & Half-Screen Split View) */}
          <button
            onClick={() => setTenantModalOpen(true)}
            title="Klik untuk Identitas Pesantren"
            className="xl:hidden flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 transition shrink-0"
          >
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="w-3.5 h-3.5 rounded object-contain shrink-0" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span className="truncate max-w-[80px] sm:max-w-[120px]">{tenant.name.replace('Pondok Pesantren ', '')}</span>
          </button>

          {/* Tombol Pemisah Mode Sandbox vs Production (Desktop only) */}
          <button
            onClick={toggleSandbox}
            title="Klik untuk beralih antara Mode Produksi Riil dan Sandbox Uji Coba"
            className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              isSandbox
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isSandbox ? (
              <>
                <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
                <span>Mode: Sandbox (Demo)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mode: Production (Live)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Controls: Role Switcher & Profile */}
        <div className="flex items-center space-x-1 sm:space-x-2.5 shrink-0">
          {/* Point 2: Role Switcher Context (Demo) OR Tenant Badge (Tenant) */}
          {isTenant ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-extrabold leading-tight">Admin Lembaga</span>
                <span className="text-[9px] text-emerald-700 font-semibold leading-tight">{tenant.id === 'tenant-rabu-001' ? 'Tier 1 • 42/50 Santri' : 'Tenant Aktif'}</span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1 px-1.5 sm:px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-semibold rounded-lg border border-emerald-200 transition"
              >
                <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                <span className="max-w-[65px] sm:max-w-none truncate">{currentRoleObj?.label.split('(')[0].replace(/^\d+\.\s*/, '')}</span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-20px)] bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                    <span>Pilih Peran Uji Coba:</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">12 Akun Aktif</span>
                  </div>
                  <div className="space-y-1 max-h-80 overflow-y-auto divide-y divide-slate-100/60">
                    {/* Kelompok 1: Pimpinan */}
                    <div className="pt-1">
                      <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider px-2 py-1 block">
                        🏛️ KELOMPOK PIMPINAN (6 PILAR)
                      </span>
                      {roles.filter(r => r.category === 'PIMPINAN').map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleSwitchRole(r.id)}
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl flex flex-col transition my-0.5 ${
                            activeRole === r.id
                              ? 'bg-indigo-600 text-white font-medium shadow-xs'
                              : 'text-slate-700 hover:bg-indigo-50/70'
                          }`}
                        >
                          <span className="font-bold text-[11px]">{r.label}</span>
                          <span className={`text-[10px] ${activeRole === r.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {r.name} • {r.dept.split('(')[0].trim()}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Kelompok 2: Tim Pegawai / Staf */}
                    <div className="pt-2">
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider px-2 py-1 block">
                        👷 KELOMPOK TIM PEGAWAI / STAF
                      </span>
                      {roles.filter(r => r.category === 'PEGAWAI').map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleSwitchRole(r.id)}
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl flex flex-col transition my-0.5 ${
                            activeRole === r.id
                              ? 'bg-emerald-600 text-white font-medium shadow-xs'
                              : 'text-slate-700 hover:bg-emerald-50/70'
                          }`}
                        >
                          <span className="font-bold text-[11px]">{r.label}</span>
                          <span className={`text-[10px] ${activeRole === r.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {r.name} • {r.dept.split('(')[0].trim()}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Kelompok 3: Super Admin */}
                    <div className="pt-2">
                      {roles.filter(r => r.category === 'SYSTEM').map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleSwitchRole(r.id)}
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl flex flex-col transition my-0.5 ${
                            activeRole === r.id
                              ? 'bg-slate-900 text-white font-medium shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-bold text-[11px]">{r.label}</span>
                          <span className={`text-[10px] ${activeRole === r.id ? 'text-slate-300' : 'text-slate-400'}`}>
                            {r.dept}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Super Admin Console Link (Tenant Onboarding) */}
          <Link
            href="/super-admin"
            className="p-1.5 sm:px-2.5 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 text-xs font-bold flex items-center space-x-1 transition shadow-2xs shrink-0"
            title="Super Admin: Onboarding Tenant Baru & Kuota Santri (Rabu)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="hidden sm:inline text-[11px]">Super Admin</span>
          </Link>

          {/* Multi-Device & Cross-Tab Sync (Item 4.3) */}
          <button
            onClick={() => setSyncModalOpen(true)}
            className="p-1.5 sm:px-2.5 text-slate-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 rounded-lg border border-slate-200 text-xs font-semibold flex items-center space-x-1 transition shadow-2xs"
            title="Sinkronisasi Multi-Device, Cross-Tab & Cloud Backup"
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline text-[11px]">Sync</span>
          </button>

          {/* Notifications (Hidden on small mobile to preserve header spacing) */}
          <button className="hidden sm:flex p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-1.5 right-1.5"></span>
          </button>

          {/* Profile Avatar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 pl-1.5 sm:pl-2 border-l border-slate-200">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] sm:text-xs shadow-sm uppercase shrink-0">
              {isTenant ? 'NH' : currentRoleObj.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-bold text-slate-800">{isTenant ? 'Ust. H. Fauzan Mansur, Lc.' : currentRoleObj.name}</div>
              <div className="text-[10px] text-slate-400">
                {isTenant ? 'Admin Lembaga • Nurul Huda' : `NIP. ${currentRoleObj.nip} • ${currentRoleObj.label}`}
              </div>
            </div>
            <Link 
              href="/login" 
              onClick={() => {
                if (isTenant) setAppModeState('demo');
              }}
              className="hidden sm:flex p-1.5 text-slate-400 hover:text-rose-600 transition" 
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

    {/* MODAL SINKRONISASI MULTI-DEVICE & BACKUP STATE (ITEM 4.3) */}
    {syncModalOpen && (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <Laptop className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Sinkronisasi Multi-Device & State Snapshot</h3>
                <p className="text-[11px] text-slate-500">6-Pilar Pesantren Data Persistence (Item 4.3)</p>
              </div>
            </div>
            <button
              onClick={() => setSyncModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notification message */}
          {syncMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
              syncMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncMsg.text}</span>
            </div>
          )}

          {/* Status 1: Cross-Tab Realtime Sync */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Real-Time Cross-Tab Broadcast</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                AKTIF & TERHUBUNG
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Setiap mutasi data (ACC Cuti HRD, Inval Mudir, Tiket Belanja) otomatis disiarkan seketika ke seluruh tab dan jendela browser lainnya.
            </p>
          </div>

          {/* Status 2: Export & Import File (Untuk Pindah Laptop saat UAT) */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-700 block">Snapshot Data Antar-Laptop (JSON)</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={downloadSystemStateFile}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unduh Snapshot (.json)</span>
              </button>

              <label className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-white" />
                <span>Unggah Snapshot</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[10px] text-slate-400">
              Unduh file snapshot di Laptop A lalu unggah di Laptop B untuk sinkronisasi instan saat uji coba offline.
            </p>
          </div>

          {/* Status 3: Cloud Supabase Sync */}
          <div className="p-3.5 bg-emerald-900 text-white rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center space-x-1.5">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Supabase Cloud Sync</span>
              </span>
              <span className="text-[10px] text-emerald-300 font-mono">Dual-Mode</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={isCloudLoading}
                onClick={handleCloudUpload}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
              >
                <span>{isCloudLoading ? 'Menyinkronkan...' : 'Kirim ke Cloud'}</span>
              </button>
              <button
                disabled={isCloudLoading}
                onClick={handleCloudPull}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
              >
                <span>{isCloudLoading ? 'Menarik...' : 'Tarik dari Cloud'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setSyncModalOpen(false)}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal Identitas Lembaga & Multi-Tenant (Item Logo Pemisahan) */}
    {tenantModalOpen && (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Identitas Lembaga & Multi-Tenant</h3>
                <p className="text-[11px] text-slate-500">Pemisahan Logo Aplikasi (Platform) dan Logo Pesantren (Tenant)</p>
              </div>
            </div>
            <button
              onClick={() => setTenantModalOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {tenantSaveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Konfigurasi logo dan identitas pesantren berhasil diperbarui!</span>
            </div>
          )}

          {/* Section 1: Logo Aplikasi (Platform ERP - Terkunci) */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 flex items-center space-x-1.5">
                <span>1. Logo Resmi Aplikasi (Platform ERP)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold tracking-wide">
                TERKUNCI / SISTEM
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-white p-2.5 rounded-lg border border-blue-100">
              <img
                src={APP_BRAND.logo_url}
                alt={APP_BRAND.name}
                className="w-12 h-12 rounded-xl object-contain shadow-xs border border-blue-200 bg-white shrink-0"
              />
              <div className="text-xs space-y-0.5">
                <div className="font-extrabold text-slate-900">{APP_BRAND.name} {APP_BRAND.version}</div>
                <div className="text-[11px] text-slate-500">{APP_BRAND.tagline}</div>
                <div className="text-[10px] text-blue-700 font-medium">
                  🔒 Identitas SaaS Platform: Permanen dan tidak dapat diganti atau ditimpa oleh tenant.
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Logo Pesantren (Tenant Identity - Customizable) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <span>2. Logo Pesantren (Identitas Lembaga Tenant)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                BISA DIKUSTOMISASI
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Tenant dapat menggunakan logo pesantrennya sendiri untuk kuitansi, kop surat, dan rapot santri tanpa mempengaruhi logo aplikasi.
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-700">
                URL Logo Pesantren:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputPesantrenLogo}
                  onChange={(e) => setInputPesantrenLogo(e.target.value)}
                  placeholder="https://pesantren.sch.id/logo.png atau pilih preset..."
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
                <button
                  onClick={() => handleSaveTenantLogo()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shrink-0"
                >
                  Simpan
                </button>
              </div>

              {/* Preset Pilihan Cepat Logo Pesantren */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Pilihan Preset Logo Pesantren (Uji Coba Cepat):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      const url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=60';
                      setInputPesantrenLogo(url);
                      handleSaveTenantLogo(url);
                    }}
                    className="px-2 py-1 text-[10px] font-medium bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 rounded-md transition"
                  >
                    🏛️ Logo Lambang Al-Hikmah
                  </button>
                  <button
                    onClick={() => {
                      const url = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=100&auto=format&fit=crop&q=60';
                      setInputPesantrenLogo(url);
                      handleSaveTenantLogo(url);
                    }}
                    className="px-2 py-1 text-[10px] font-medium bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 rounded-md transition"
                  >
                    📖 Logo Madrasah Qurani
                  </button>
                  <button
                    onClick={handleResetTenantLogo}
                    className="px-2 py-1 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition"
                  >
                    ↺ Reset ke Default
                  </button>
                </div>
              </div>
            </div>

            {/* Live Dual-Brand Preview */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pratinjau Dual-Brand (Harmonis Berdampingan):
              </span>
              <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <img
                  src={APP_BRAND.logo_url}
                  alt="App Logo"
                  className="w-8 h-8 rounded-lg object-contain shadow-xs border border-blue-200 bg-white shrink-0"
                />
                <span className="text-slate-300 text-sm font-light">✕</span>
                {tenant.logo_url ? (
                  <img
                    src={tenant.logo_url}
                    alt="Pesantren Logo"
                    className="w-8 h-8 rounded-lg object-cover shadow-xs border border-emerald-200 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">
                    AH
                  </div>
                )}
                <div className="text-left leading-tight truncate">
                  <div className="text-[11px] font-bold text-slate-800 truncate">{tenant.name}</div>
                  <div className="text-[10px] text-slate-500">Didukung oleh KabarSantri v2.0 ERP</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Status Sinkronisasi Jalur Tenant (6 Pilar Produksi) */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>3. Status Jalur Tenant & 6 Pilar Terpadu</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold tracking-wide">
                TERHUBUNG PRODUKSI
              </span>
            </div>
            
            <div className="text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Tenant ID & Kode:</span>
                <span className="font-mono font-bold text-slate-800">{tenant.id} ({tenant.code})</span>
              </div>
              <div className="flex justify-between">
                <span>Status 6 Pilar Uji Coba:</span>
                <span className="font-bold text-emerald-700">✓ 6 Pilar + Multi-Pos Presensi + Read-Only Threshold</span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200/80 flex items-center gap-2">
              <button
                onClick={handleCloudUpload}
                disabled={isCloudLoading}
                className="flex-1 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{isCloudLoading ? 'Menyinkronkan...' : 'Sinkronkan ke Cloud Supabase'}</span>
              </button>
              <button
                onClick={downloadSystemStateFile}
                className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                title="Unduh Snapshot JSON Tenant"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh JSON</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setTenantModalOpen(false)}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}
