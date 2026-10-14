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
  Menu,
  Sun,
  Moon,
  MoreVertical,
  Check,
  Settings
} from 'lucide-react';

import { 
  getActiveActor, 
  setActiveActorByRole,
  ActiveActor,
  MASTER_PILLAR_ACTORS,
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
import { useThemeMode } from '@/lib/themeStore';
import { getSharedSantriList } from '@/lib/sharedDataStore';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export default function Header({ onToggleMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const tenant = useActiveTenant();
  const { mode: appMode, setMode: setAppModeState, isDemo, isTenant, mounted: modeMounted } = useAppMode();
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const isHydrated = mounted || modeMounted;
  const isTenantActive = isHydrated ? isTenant : false;
  const { theme, isDark, toggleTheme } = useThemeMode();

  const [activeRole, setActiveRole] = useState<string>('yayasan');
  const [currentActor, setCurrentActor] = useState<ActiveActor>(MASTER_PILLAR_ACTORS.yayasan);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [inputPesantrenLogo, setInputPesantrenLogo] = useState(tenant.logo_url || '');
  const [tenantSaveSuccess, setTenantSaveSuccess] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [santriCount, setSantriCount] = useState(0);

  React.useEffect(() => {
    const updateCount = () => {
      try {
        setSantriCount(getSharedSantriList().length);
      } catch {}
    };
    updateCount();
    window.addEventListener('ks_tenant_santri_updated', updateCount);
    return () => window.removeEventListener('ks_tenant_santri_updated', updateCount);
  }, []);

  React.useEffect(() => {
    const actor = getActiveActor();
    setCurrentActor(actor);
    setActiveRole(actor.role_key);
    if (typeof document !== 'undefined') {
      setIsSandbox(document.cookie.includes('ks_demo_mode=true'));
    }

    const handleActorChanged = () => {
      const updated = getActiveActor();
      setCurrentActor(updated);
      setActiveRole(updated.role_key);
    };

    window.addEventListener('ks_session_actor_changed', handleActorChanged);
    return () => window.removeEventListener('ks_session_actor_changed', handleActorChanged);
  }, []);

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

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      document.cookie = 'sb-access-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'ks_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'ks_app_mode=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'ks_active_tenant_id=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      try {
        localStorage.removeItem('ks_active_tenant_info_v1');
        localStorage.removeItem('ks_active_session_actor_v1');
        localStorage.removeItem('ks_active_tenant_id');
        localStorage.removeItem('ks_pending_registration_id');
        localStorage.removeItem('ks_pending_registration_status');
      } catch {}
      window.location.href = '/login?logout=1';
    }
  };

  // Cross-Tab Listener
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

  // Sinkronkan Peran Aktif dari Sesi Login yang Sah (Terkunci Sesuai Akun Login)
  React.useEffect(() => {
    const current = getActiveActor();
    setActiveRole(current.role_key);
  }, [pathname]);

  const toggleSandbox = () => {
    const nextVal = !isSandbox;
    setIsSandbox(nextVal);
    document.cookie = `ks_demo_mode=${nextVal}; path=/; max-age=86400`;
  };

  const roles = [
    {
      id: 'yayasan',
      label: 'Yayasan',
      title: 'Pimpinan Yayasan',
      name: '',
      nip: 'PEG-YYS-001',
      dept: 'Yayasan & Manajemen Eksekutif',
      icon: '🏛️'
    },
    {
      id: 'pegawai',
      label: 'Pegawai',
      title: 'Guru & Tenaga Kependidikan',
      name: '',
      nip: 'PEG-GRU-001',
      dept: 'KBM, Tahfidz & Kepegawaian',
      icon: '👨‍🏫'
    },
    {
      id: 'wali_santri',
      label: 'Wali Santri',
      title: 'Wali Santri / Orang Tua',
      name: '',
      nip: 'WALI-2026-001',
      dept: 'Portal Informasi Orang Tua',
      icon: '👨‍👩‍👧',
      href: '/portal-wali'
    },
  ];

  const handleSwitchRole = (roleId: string) => {
    setActiveRole(roleId);
    setActiveActorByRole(roleId);
    setDropdownOpen(false);
    if (roleId === 'wali_santri') {
      window.location.href = isTenant ? '/portal-wali?mode=tenant' : '/portal-wali';
    }
  };

  const currentRoleObj = roles.find(r => r.id === activeRole) || roles[0];

  return (
    <>
      {/* MAIN HEADER NAVBAR */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2.5 sm:px-6 flex items-center justify-between z-10 select-none w-full max-w-full overflow-hidden transition-colors">
        {/* Left: Hamburger, App Logo (Logo Resmi), & Tenant Badge */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo Resmi Aplikasi KabarSantri */}
          <Link href="/dashboard" className="flex items-center space-x-2 sm:pr-3 sm:border-r sm:border-slate-200 dark:sm:border-slate-800">
            <img
              src={APP_BRAND.logo_url}
              alt={APP_BRAND.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain shadow-xs border border-blue-200 dark:border-blue-900 bg-white shrink-0"
            />
            <div className="hidden lg:block leading-none">
              <span className="font-extrabold text-blue-900 dark:text-blue-100 text-sm tracking-tight block">
                {APP_BRAND.name} <span className="text-blue-600 dark:text-blue-400 text-[11px] font-semibold">{APP_BRAND.version}</span>
              </span>
            </div>
          </Link>

          {/* Desktop Institution Badge */}
          {isHydrated && tenant.name ? (
            <button
              onClick={() => setTenantModalOpen(true)}
              title="Klik untuk melihat Identitas Lembaga"
              className="hidden xl:flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition text-left shrink-0"
            >
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="w-4 h-4 rounded object-contain shrink-0" />
              ) : (
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
              <span className="truncate max-w-[240px]">
                <strong className="text-slate-800 dark:text-slate-100">{tenant.name.replace('Pondok Pesantren ', '')}</strong>
              </span>
            </button>
          ) : null}

          {/* Compact Institution Badge (Tablet / Mobile) */}
          {isHydrated && tenant.name ? (
            <button
              onClick={() => setTenantModalOpen(true)}
              title="Klik untuk Identitas Lembaga"
              className="xl:hidden flex items-center space-x-1.5 text-[11px] font-bold text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-900 transition shrink-0"
            >
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="w-3.5 h-3.5 rounded object-contain shrink-0" />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
              <span className="truncate max-w-[85px] sm:max-w-[130px]">{tenant.name.replace('Pondok Pesantren ', '')}</span>
            </button>
          ) : null}
        </div>

        {/* Right Controls: Role Switcher, Dark/Light Mode, & Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* User Profile Badge & Menu (Terkunci Sesuai Akun Login - Tidak Bisa Lintas Jabatan) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-200 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800 transition cursor-pointer"
              title="Profil Pengguna"
            >
              <span className="text-sm">
                {currentActor.role_key === 'yayasan' ? '🏛️' : currentActor.role_key === 'wali_santri' ? '👨‍👩‍👧' : '👨‍🏫'}
              </span>
              <span className="font-bold truncate max-w-[100px] sm:max-w-[140px]">
                {currentActor.name || (currentActor.role_key === 'yayasan' ? 'Pimpinan Yayasan' : 'Pegawai')}
              </span>
              <ChevronDown className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0 ml-0.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-20px)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {currentActor.role_key === 'yayasan' ? '🏛️' : currentActor.role_key === 'wali_santri' ? '👨‍👩‍👧' : '👨‍🏫'}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {currentActor.name || 'Pengguna Resmi'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {currentActor.nip || 'NIP Terdaftar'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg text-slate-600 dark:text-slate-300">
                    <div className="font-semibold">{currentActor.title || 'Akses Sistem'}</div>
                    <div className="text-[9px] text-slate-400 truncate">{currentActor.dept || 'Pesantren'}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/pengaturan"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full text-left p-2 rounded-xl flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium"
                  >
                    <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Pengaturan &amp; Ganti Password</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left p-2 rounded-xl flex items-center space-x-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Akun (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* THEME TOGGLE (DARK MODE / LIGHT MODE) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:px-2.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center space-x-1 transition shadow-2xs shrink-0"
            title={isDark ? 'Beralih ke Tampilan Terang (Light Mode)' : 'Beralih ke Tampilan Gelap (Dark Mode)'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline text-[11px]">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline text-[11px]">Gelap</span>
              </>
            )}
          </button>

          {/* Desktop-Only: Multi-Device Sync */}
          <button
            onClick={() => setSyncModalOpen(true)}
            className="hidden sm:flex p-1.5 sm:px-2.5 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold items-center space-x-1 transition shadow-2xs"
            title="Sinkronisasi Multi-Device & Cloud Backup"
          >
            <Laptop className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-[11px]">Sync</span>
          </button>

          {/* Mobile Clickable More Actions Menu */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setMobileActionsOpen(!mobileActionsOpen)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition"
              title="Menu Aksi Lainnya"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {mobileActionsOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1.5 z-50">
                <button
                  onClick={() => {
                    setMobileActionsOpen(false);
                    setSyncModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                >
                  <Laptop className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sinkronisasi Data</span>
                </button>
                <Link
                  href="/pengaturan"
                  onClick={() => setMobileActionsOpen(false)}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pengaturan &amp; Ganti Password</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800 mt-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            )}
          </div>

          {/* Settings Shortcut (Desktop) */}
          <Link
            href="/pengaturan"
            className="hidden sm:flex p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg transition"
            title="Pengaturan Akun & Ganti Password"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Profile Avatar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-[11px] sm:text-xs shadow-xs uppercase shrink-0">
              {currentRoleObj?.id === 'yayasan' ? 'YY' : currentRoleObj?.id === 'pegawai' ? 'PG' : 'WS'}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">{currentRoleObj?.title}</div>
              {currentRoleObj?.name ? (
                <div className="text-[10px] text-slate-400">
                  {currentRoleObj.name}
                </div>
              ) : null}
            </div>
            <button 
              type="button"
              onClick={handleLogout}
              className="hidden sm:flex p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer" 
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MODAL SINKRONISASI MULTI-DEVICE & BACKUP */}
      {syncModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Sinkronisasi Data Multi-Device</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Penyimpanan &amp; Cadangan Sistem</p>
                </div>
              </div>
              <button
                onClick={() => setSyncModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {syncMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
                syncMsg.type === 'success' 
                  ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-200' 
                  : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncMsg.text}</span>
              </div>
            )}

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">Real-Time Broadcast Antar-Tab</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  AKTIF
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mutasi data di satu tab disiarkan otomatis ke seluruh jendela browser yang terbuka.
              </p>
            </div>

            {/* Export & Import File */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold block">Cadangan File (JSON)</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={downloadSystemStateFile}
                  className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Unduh JSON</span>
                </button>

                <label className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <span>Unggah JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Cloud Supabase Sync */}
            <div className="p-3.5 bg-blue-950 dark:bg-slate-950 text-white rounded-xl space-y-2 border border-blue-900 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center space-x-1.5">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  <span>Cloud Database Sync</span>
                </span>
                <span className="text-[10px] text-blue-300 font-mono">Dual-Mode</span>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={isCloudLoading}
                  onClick={handleCloudUpload}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                >
                  <span>{isCloudLoading ? 'Proses...' : 'Kirim Cloud'}</span>
                </button>
                <button
                  disabled={isCloudLoading}
                  onClick={handleCloudPull}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                >
                  <span>{isCloudLoading ? 'Proses...' : 'Tarik Cloud'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSyncModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IDENTITAS LEMBAGA (TENANT) */}
      {tenantModalOpen && (
        <div 
          onClick={() => setTenantModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-200 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Identitas Lembaga &amp; Tenant</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Konfigurasi Lembaga Pesantren</p>
                </div>
              </div>
              <button
                onClick={() => setTenantModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {tenantSaveSuccess && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-800 dark:text-blue-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Konfigurasi logo dan lembaga berhasil disimpan.</span>
              </div>
            )}

            {/* Logo Resmi Aplikasi */}
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 dark:text-blue-200">
                  Logo Resmi Aplikasi (Platform ERP)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold tracking-wide">
                  SISTEM
                </span>
              </div>
              <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-blue-100 dark:border-slate-700">
                <img
                  src={APP_BRAND.logo_url}
                  alt={APP_BRAND.name}
                  className="w-10 h-10 rounded-xl object-contain border border-blue-200 dark:border-blue-900 bg-white shrink-0 p-0.5"
                />
                <div className="text-xs space-y-0.5">
                  <div className="font-extrabold">{APP_BRAND.name} {APP_BRAND.version}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{APP_BRAND.tagline}</div>
                </div>
              </div>
            </div>

            {/* Logo Pesantren Custom */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Logo Pesantren{tenant.name ? ` (${tenant.name.replace('Pondok Pesantren ', '')})` : ''}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputPesantrenLogo}
                    onChange={(e) => setInputPesantrenLogo(e.target.value)}
                    placeholder="URL logo lembaga..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg focus:outline-blue-600"
                  />
                  <button
                    onClick={() => handleSaveTenantLogo()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shrink-0"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={handleResetTenantLogo}
                    className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition shrink-0"
                    title="Reset ke logo bawaan"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setTenantModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition"
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
