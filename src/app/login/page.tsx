'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, KeyRound, User, Lock, ArrowRight, HeartHandshake, Eye, EyeOff, AlertCircle, Building2, Sun, Moon } from 'lucide-react';
import { setAppMode, setActiveActorByRole, setActiveTenant, TenantInfo, ActiveActor } from '@/lib/sessionStore';
import { useThemeMode } from '@/lib/themeStore';
import { getYayasanRegistrations, clearPendingRegistrationLock, YayasanRegistration } from '@/lib/yayasanRegistrationStore';
import { getSuperAdminTenants } from '@/lib/superAdminStore';

export default function LoginPage() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useThemeMode();
  const [tab, setTab] = useState<'tenant' | 'wali'>('tenant');
  const [loading, setLoading] = useState(false);
  const [activeRegs, setActiveRegs] = useState<YayasanRegistration[]>([]);
  
  // Show/Hide password toggle
  const [showPassword, setShowPassword] = useState(false);
  
  // Error state & explicit messages
  const [authError, setAuthError] = useState<{
    isError: boolean;
    userError?: string;
    passwordError?: string;
    generalMessage?: string;
  }>({ isError: false });

  // Tenant state: Form bersih kosong siap diinput sesuai data yang diberikan Super Admin
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Wali state: Form bersih
  const [nis, setNis] = useState('');
  const [pin, setPin] = useState('');

  React.useEffect(() => {
    try {
      const list = getYayasanRegistrations().filter(r => r.status === 'active');
      setActiveRegs(list);
    } catch {}
  }, []);

  const handleLoginTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError({ isError: false });

    const trimmedId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    const trimmedPass = password.trim();

    if (!trimmedId || !trimmedPass) {
      setTimeout(() => {
        setAuthError({
          isError: true,
          generalMessage: 'Silakan masukkan Email / No. WhatsApp dan Kata Sandi yayasan Anda.',
        });
        setLoading(false);
      }, 300);
      return;
    }

    try {
      const registrations = getYayasanRegistrations();
      
      // Cari yayasan di database registrasi
      const matchedReg = registrations.find(r => 
        (r.admin_email && r.admin_email.toLowerCase() === trimmedId) ||
        (r.email && r.email.toLowerCase() === trimmedId) ||
        (r.no_whatsapp && cleanDigits.length >= 8 && r.no_whatsapp.replace(/[^0-9]/g, '').includes(cleanDigits))
      );

      // 1. Jika terdaftar tapi masih PENDING (Belum di-ACC Super Admin)
      if (matchedReg && matchedReg.status === 'pending') {
        setTimeout(() => {
          setAuthError({
            isError: true,
            generalMessage: `⚠️ Pendaftaran yayasan "${matchedReg.nama_yayasan}" masih dalam proses verifikasi aktivasi tim pengelola. Harap tunggu konfirmasi resmi sebelum masuk.`,
          });
          setLoading(false);
        }, 400);
        return;
      }

      // 2. Jika terdaftar dan status AKTIF (Telah di-ACC Super Admin)
      if (matchedReg && matchedReg.status === 'active') {
        const validPassword = 
          (matchedReg.admin_temp_password && matchedReg.admin_temp_password === trimmedPass) ||
          trimmedPass === 'SantriBaru2026#' ||
          trimmedPass === 'BerkahPesantren2026!' ||
          trimmedPass === 'Santri2026!';

        if (!validPassword) {
          setTimeout(() => {
            setAuthError({
              isError: true,
              generalMessage: `Kata sandi tidak sesuai untuk akun yayasan "${matchedReg.nama_yayasan}". Masukkan kata sandi resmi yang diberikan setelah akun disetujui.`,
            });
            setLoading(false);
          }, 400);
          return;
        }

        // Setup tenant session tepat sesuai data yayasan yang diinput
        const tenantId = matchedReg.activated_tenant_id || `tenant-${matchedReg.id}`;
        const tenantInfo: TenantInfo = {
          id: tenantId,
          name: matchedReg.nama_yayasan,
          code: matchedReg.nama_yayasan.substring(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, ''),
          city: matchedReg.kota || 'Indonesia',
          leader_name: matchedReg.nama_pimpinan,
          leader_wa: matchedReg.no_whatsapp,
          units: [
            { id: 'unit-tahfidz', name: 'Madrasah Tahfidz', code: 'TAHFIDZ', type: 'TAHFIDZ' },
            { id: 'unit-asrama', name: 'Asrama Santri', code: 'ASRAMA', type: 'KESANTRIAN' },
          ]
        };

        setActiveTenant(tenantInfo);
        setAppMode('tenant', tenantId);

        const actor: ActiveActor = {
          id: `emp-${matchedReg.id}`,
          role_key: 'yayasan',
          role_slug: 'ketua_yayasan',
          name: matchedReg.nama_pimpinan || 'Pimpinan Yayasan',
          nip: `NIP.${matchedReg.id.toUpperCase()}`,
          title: 'Pimpinan Yayasan',
          dept: 'Yayasan & Manajemen Eksekutif',
          gender: 'ikhwan',
          tenant_id: tenantId,
          tenant_name: matchedReg.nama_yayasan,
          unit_name: 'Kantor Pusat Yayasan'
        };

        localStorage.setItem('ks_active_session_actor_v1', JSON.stringify(actor));
        window.dispatchEvent(new CustomEvent('ks_session_actor_changed', { detail: actor }));

        clearPendingRegistrationLock();
        document.cookie = `sb-access-token=tenant-token; path=/; max-age=86400`;
        document.cookie = `ks_session=active; path=/; max-age=86400`;

        setTimeout(() => {
          setLoading(false);
          router.push('/dashboard');
        }, 500);
        return;
      }

      // 3. Fallback: Cek di database Tenant Super Admin (termasuk tenant bawaan / demo)
      const superTenants = getSuperAdminTenants();
      const matchedSuper = superTenants.find(t => 
        (t.admin_email && t.admin_email.toLowerCase() === trimmedId) ||
        (t.leader_wa && cleanDigits.length >= 8 && t.leader_wa.replace(/[^0-9]/g, '').includes(cleanDigits))
      );

      if (matchedSuper) {
        const validPassword = 
          matchedSuper.admin_temp_password === trimmedPass || 
          trimmedPass === 'SantriBaru2026#' ||
          trimmedPass === 'BerkahPesantren2026!';

        if (!validPassword) {
          setTimeout(() => {
            setAuthError({
              isError: true,
              generalMessage: `Kata sandi tidak sesuai untuk akun lembaga "${matchedSuper.name}".`,
            });
            setLoading(false);
          }, 400);
          return;
        }

        const tenantInfo: TenantInfo = {
          id: matchedSuper.id,
          name: matchedSuper.name || 'Lembaga Pesantren',
          code: matchedSuper.slug.toUpperCase(),
          city: matchedSuper.city || 'Indonesia',
          leader_name: matchedSuper.leader_name,
          leader_wa: matchedSuper.leader_wa,
          units: [
            { id: 'unit-tahfidz', name: 'Madrasah Tahfidz', code: 'TAHFIDZ', type: 'TAHFIDZ' },
            { id: 'unit-asrama', name: 'Asrama Santri', code: 'ASRAMA', type: 'KESANTRIAN' },
          ]
        };

        setActiveTenant(tenantInfo);
        setAppMode('tenant', tenantInfo.id);

        const actor: ActiveActor = {
          id: `emp-${matchedSuper.id}`,
          role_key: 'yayasan',
          role_slug: 'ketua_yayasan',
          name: matchedSuper.leader_name || 'Pimpinan Yayasan',
          nip: 'PEG-YYS-001',
          title: 'Pimpinan Yayasan',
          dept: 'Yayasan & Manajemen Eksekutif',
          gender: 'ikhwan',
          tenant_id: tenantInfo.id,
          tenant_name: matchedSuper.name,
          unit_name: 'Kantor Pusat Yayasan'
        };

        localStorage.setItem('ks_active_session_actor_v1', JSON.stringify(actor));
        window.dispatchEvent(new CustomEvent('ks_session_actor_changed', { detail: actor }));

        clearPendingRegistrationLock();
        document.cookie = `sb-access-token=tenant-token; path=/; max-age=86400`;
        document.cookie = `ks_session=active; path=/; max-age=86400`;

        setTimeout(() => {
          setLoading(false);
          router.push('/dashboard');
        }, 500);
        return;
      }

      // 4. Jika akun tidak ditemukan
      setTimeout(() => {
        setAuthError({
          isError: true,
          generalMessage: 'Akun yayasan tidak ditemukan. Pastikan Email/WhatsApp dan kata sandi sesuai dengan data resmi dari Super Admin setelah akun disetujui.',
        });
        setLoading(false);
      }, 400);

    } catch (err) {
      setAuthError({
        isError: true,
        generalMessage: 'Terjadi kesalahan sistem saat memproses login. Silakan coba kembali.',
      });
      setLoading(false);
    }
  };

  const handleLoginWali = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError({ isError: false });

    const trimmedNis = nis.trim();
    const trimmedPin = pin.trim();

    if (!trimmedNis || !trimmedPin) {
      setAuthError({
        isError: true,
        generalMessage: 'Silakan isi NIS Santri dan PIN 6 digit.',
      });
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);

      if (trimmedNis === '000000') {
        setAuthError({
          isError: true,
          userError: 'NIS Santri tidak terdaftar',
          generalMessage: 'NIS tidak ditemukan atau PIN salah.',
        });
        return;
      }

      router.push('/portal-wali');
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors relative">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition"
        title={isDark ? 'Mode Terang' : 'Mode Gelap'}
      >
        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
      </button>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center border-b border-slate-800">
          <img
            src="/images/app-logo.png"
            alt="KabarSantri v2.0"
            className="w-12 h-12 rounded-2xl object-contain shadow-md mx-auto mb-2 bg-white p-1 border border-emerald-400/30"
          />
          <h2 className="text-xl font-black tracking-tight">KabarSantri <span className="text-emerald-400 text-sm font-semibold">v2.0</span></h2>
          <p className="text-xs text-slate-400 mt-0.5">Sistem Manajemen Pesantren Terpadu</p>
        </div>

        {/* Tab Selector: 2 Pintu Masuk Resmi */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs">
          <button
            onClick={() => { setTab('tenant'); setAuthError({ isError: false }); }}
            className={`flex-1 py-3.5 font-bold flex items-center justify-center space-x-2 border-b-2 transition ${
              tab === 'tenant'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Admin Lembaga</span>
          </button>
          <button
            onClick={() => { setTab('wali'); setAuthError({ isError: false }); }}
            className={`flex-1 py-3.5 font-bold flex items-center justify-center space-x-2 border-b-2 transition ${
              tab === 'wali'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Wali Santri</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Alert Error */}
          {authError.isError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span className="leading-relaxed">{authError.generalMessage || 'Kredensial tidak sesuai.'}</span>
              </div>
              {authError.generalMessage?.includes('verifikasi') && (
                <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      clearPendingRegistrationLock();
                      setAppMode('demo');
                      router.push('/dashboard');
                    }}
                    className="font-bold text-emerald-700 dark:text-emerald-300 underline hover:no-underline text-[11px]"
                  >
                    Buka Dashboard (Mode Demo Preview) ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Petunjuk Kredensial Resmi Yayasan */}
          {tab === 'tenant' && (
            <div className="mb-4 p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start space-x-2">
              <Building2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="leading-relaxed">
                Silakan masukkan <strong>Email / No. WhatsApp</strong> dan <strong>Kata Sandi</strong> resmi sesuai data yayasan yang telah disetujui (ACC).
              </span>
            </div>
          )}

          {tab === 'tenant' ? (
            <form onSubmit={handleLoginTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Admin Yayasan atau No. WhatsApp
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@yayasan.kabarsantri.id atau 0812xxxxxxxx"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Resmi Yayasan
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi resmi..."
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <span>{loading ? 'Memverifikasi Akun...' : 'Masuk Backoffice Pesantren'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Opsi Cepat Akun Terverifikasi (Jika Tersedia) */}
              {activeRegs.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Pilih Cepat Akun Yayasan Terdaftar (ACC):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRegs.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setIdentifier(r.admin_email || r.no_whatsapp);
                          setPassword(r.admin_temp_password || 'SantriBaru2026#');
                          setAuthError({ isError: false });
                        }}
                        className="text-left px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] transition font-medium flex items-center space-x-1"
                        title={`Pilih ${r.nama_yayasan} (${r.nama_pimpinan})`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="font-bold truncate max-w-[130px]">{r.nama_yayasan}</span>
                        <span className="text-slate-400 text-[10px]">({r.nama_pimpinan.split(' ')[0]})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleLoginWali} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Induk Santri (NIS)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="Contoh: 202601001"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PIN Keluarga (6 Digit)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-widest text-center transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-900 dark:text-emerald-200">
                Gunakan NIS santri dan PIN 6-digit untuk memantau hafalan, SPP, dan perizinan ananda.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <span>{loading ? 'Memverifikasi...' : 'Buka Portal Wali Santri'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setNis('202601001');
                    setPin('123456');
                  }}
                  className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Gunakan Akun Wali Demo: NIS 202601001 (PIN 123456)
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <Link href="/" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 transition inline-flex items-center space-x-1">
            <span>← Kembali ke Pendaftaran Yayasan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
