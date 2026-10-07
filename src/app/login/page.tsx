'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, KeyRound, User, Lock, ArrowRight, HeartHandshake, Eye, EyeOff, AlertCircle, Building2, FlaskConical, CheckCircle2, Sun, Moon } from 'lucide-react';
import { setAppMode, setActiveActorByRole } from '@/lib/sessionStore';
import { useThemeMode } from '@/lib/themeStore';

export default function LoginPage() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useThemeMode();
  const [tab, setTab] = useState<'tenant' | 'demo' | 'wali'>('tenant');
  const [loading, setLoading] = useState(false);
  
  // Show/Hide password toggle
  const [showPassword, setShowPassword] = useState(false);
  
  // Error state & explicit messages
  const [authError, setAuthError] = useState<{
    isError: boolean;
    userError?: string;
    passwordError?: string;
    generalMessage?: string;
  }>({ isError: false });

  // Tenant state
  const [identifier, setIdentifier] = useState('admin@nurulhuda.kabarsantri.id');
  const [password, setPassword] = useState('SantriBaru2026#');

  // Wali state
  const [nis, setNis] = useState('202601001');
  const [pin, setPin] = useState('123456');

  const handleLoginTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError({ isError: false });

    // Deteksi jika pengguna sengaja menguji input salah
    const isExplicitlyWrong = 
      identifier.toLowerCase().includes('salah') || 
      password.toLowerCase() === 'salah' || 
      password.length < 5;

    if (isExplicitlyWrong) {
      setTimeout(() => {
        setAuthError({
          isError: true,
          generalMessage: 'User salah dan kata sandi salah.',
        });
        setLoading(false);
      }, 400);
      return;
    }

    setTimeout(() => {
      // Set Mode Tenant
      const isNurulHuda = identifier.includes('nurulhuda');
      const tenantId = isNurulHuda ? 'tenant-rabu-001' : 'tenant-pesantren-001';
      setAppMode('tenant', tenantId);
      
      if (isNurulHuda) {
        setActiveActorByRole('tenant_admin_nh');
      } else {
        setActiveActorByRole('yayasan');
      }

      document.cookie = `sb-access-token=tenant-token; path=/; max-age=86400`;
      document.cookie = `ks_session=active; path=/; max-age=86400`;
      setLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  const handleEnterDemo = () => {
    setLoading(true);
    setTimeout(() => {
      setAppMode('demo');
      setActiveActorByRole('yayasan');
      document.cookie = `sb-access-token=demo-token; path=/; max-age=86400`;
      document.cookie = `ks_session=active; path=/; max-age=86400`;
      setLoading(false);
      router.push('/dashboard');
    }, 400);
  };

  const handleLoginWali = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError({ isError: false });

    setTimeout(() => {
      setLoading(false);

      if (nis === '000000') {
        setAuthError({
          isError: true,
          userError: 'NIS Santri tidak terdaftar',
          generalMessage: 'User salah dan PIN salah.',
        });
        return;
      }

      router.push('/portal-wali');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950 transition-colors relative">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 transition"
        title={isDark ? 'Mode Terang' : 'Mode Gelap'}
      >
        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
      </button>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header (Logo Blue) */}
        <div className="bg-blue-800 dark:bg-slate-900 p-6 text-white text-center border-b border-blue-700 dark:border-slate-800">
          <img
            src="/images/app-logo.png"
            alt="KabarSantri v2.0"
            className="w-14 h-14 rounded-2xl object-contain shadow-md mx-auto mb-3 bg-white p-1 border border-blue-300/40"
          />
          <h2 className="text-xl font-bold tracking-tight">KabarSantri v2.0</h2>
          <p className="text-xs text-blue-200 mt-1">Sistem Manajemen Pesantren Terpadu</p>
        </div>

        {/* Tab Selector: 3 Pintu Masuk */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs">
          <button
            onClick={() => { setTab('tenant'); setAuthError({ isError: false }); }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition ${
              tab === 'tenant'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Jalur Tenant</span>
          </button>
          <button
            onClick={() => { setTab('demo'); setAuthError({ isError: false }); }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition ${
              tab === 'demo'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Jalur Demo</span>
          </button>
          <button
            onClick={() => { setTab('wali'); setAuthError({ isError: false }); }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition ${
              tab === 'wali'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Wali Santri</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Alert Error */}
          {authError.isError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{authError.generalMessage || 'User salah dan kata sandi salah.'}</span>
            </div>
          )}

          {tab === 'tenant' ? (
            <form onSubmit={handleLoginTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Admin Pesantren
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@pesantren.sch.id"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Preset Akun Nurul Huda */}
              <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-lg border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200 flex items-center justify-between">
                <span>Contoh Akun Resmi:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('admin@nurulhuda.kabarsantri.id');
                    setPassword('SantriBaru2026#');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-0.5 rounded transition text-[10px]"
                >
                  Gunakan Nurul Huda
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <span>{loading ? 'Menghubungkan...' : 'Masuk Portal Tenant'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : tab === 'demo' ? (
            <div className="space-y-4 py-2">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 text-blue-950 dark:text-blue-200 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-sm text-blue-900 dark:text-blue-300">
                  <FlaskConical className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Simulasi Lengkap 6-Pilar Pesantren</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Akses langsung seluruh fitur backoffice dengan 12 peran aktif tanpa login kata sandi.
                </p>

                <div className="grid grid-cols-2 gap-1.5 pt-2 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 p-1.5 rounded border border-blue-100 dark:border-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>450 Santri</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 p-1.5 rounded border border-blue-100 dark:border-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>12 Peran Aktif</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 p-1.5 rounded border border-blue-100 dark:border-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Scanner Gerbang</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 p-1.5 rounded border border-blue-100 dark:border-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Approval 6-Pilar</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEnterDemo}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm flex items-center justify-center space-x-2 transition"
              >
                <FlaskConical className="w-4 h-4" />
                <span>{loading ? 'Menyiapkan Demo...' : 'Mulai Demo 6-Pilar ➔'}</span>
              </button>
            </div>
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
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-lg border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200">
                Gunakan NIS santri dan PIN 6-digit untuk memantau tabungan dan izin santri.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <span>{loading ? 'Memverifikasi...' : 'Buka Portal Wali'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 border-t border-slate-200 dark:border-slate-800 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-blue-600">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
