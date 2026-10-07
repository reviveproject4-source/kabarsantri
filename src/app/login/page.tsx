'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, KeyRound, User, Lock, ArrowRight, HeartHandshake, Eye, EyeOff, AlertCircle, Building2, FlaskConical, CheckCircle2 } from 'lucide-react';
import { setAppMode, setActiveActorByRole } from '@/lib/sessionStore';

export default function LoginPage() {
  const router = useRouter();
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-700 p-6 text-white text-center">
          <img
            src="/images/app-logo.png"
            alt="KabarSantri v2.0"
            className="w-14 h-14 rounded-2xl object-contain shadow-lg mx-auto mb-3 bg-white p-1 border border-emerald-500/40"
          />
          <h2 className="text-xl font-bold">KabarSantri v2.0</h2>
          <p className="text-xs text-emerald-200 mt-1">Gerbang Akses Mandiri: Jalur Tenant & Jalur Demo</p>
        </div>

        {/* Tab Selector: 3 Pintu Masuk */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => { setTab('tenant'); setAuthError({ isError: false }); }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition ${
              tab === 'tenant'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Jalur Tenant</span>
          </button>
          <button
            onClick={() => { setTab('demo'); setAuthError({ isError: false }); }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition ${
              tab === 'demo'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Jalur Demo</span>
          </button>
          <button
            onClick={() => { setTab('wali'); setAuthError({ isError: false }); }}
            className={`flex-1 py-3 font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition ${
              tab === 'wali'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Wali Santri</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Kotak Merah Error Alert jika salah user atau kata sandi */}
          {authError.isError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border-2 border-red-500 text-red-700 text-xs shadow-sm flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-red-900 text-sm">
                  {authError.generalMessage || 'User salah dan kata sandi salah.'}
                </div>
                <div className="text-[11px] text-red-600">
                  Silakan periksa kembali email/NIP dan kata sandi Anda.
                </div>
              </div>
            </div>
          )}

          {tab === 'tenant' ? (
            <form onSubmit={handleLoginTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Administrator Tenant Pesantren
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@pesantren.kabarsantri.id"
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                      authError.isError 
                        ? 'border-red-500 bg-red-50/20 focus:ring-red-400' 
                        : 'border-slate-300 focus:ring-emerald-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi Portal Lembaga
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                      authError.isError 
                        ? 'border-red-500 bg-red-50/20 focus:ring-red-400' 
                        : 'border-slate-300 focus:ring-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition"
                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-600" />}
                  </button>
                </div>
              </div>

              {/* Tombol Cepat Uji Coba Tenant Rabu */}
              <div className="bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
                <span className="font-medium">🏛️ Tenant Siap Go-Live (Rabu):</span>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('admin@nurulhuda.kabarsantri.id');
                    setPassword('SantriBaru2026#');
                  }}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded shadow-xs transition"
                >
                  Gunakan Akun Nurul Huda
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-lg shadow-sm flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <span>{loading ? 'Menghubungkan ke Portal...' : 'Masuk Portal Tenant Resmi'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : tab === 'demo' ? (
            <div className="space-y-4 py-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-sm text-amber-800">
                  <FlaskConical className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Jalur Eksplorasi Demo & Evaluasi 6-Pilar</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Jalur ini diperuntukkan bagi presentasi manajemen yayasan, investor, dan pengujian internal.
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-2 text-[11px] font-medium text-slate-700">
                  <div className="flex items-center space-x-1.5 bg-white/80 p-1.5 rounded border border-amber-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>450 Santri Binaan</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/80 p-1.5 rounded border border-amber-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Switcher 12 Peran</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/80 p-1.5 rounded border border-amber-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Scanner Pos Satpam</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/80 p-1.5 rounded border border-amber-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Approval 6-Pilar</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEnterDemo}
                disabled={loading}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-lg shadow-sm flex items-center justify-center space-x-2 transition"
              >
                <FlaskConical className="w-4 h-4" />
                <span>{loading ? 'Menyiapkan Sesi Demo...' : 'Mulai Eksplorasi Demo 6-Pilar ➔'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleLoginWali} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-widest text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-600" />}
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                ✨ <strong>Akses Frictionless Wali:</strong> Cukup gunakan NIS santri dan PIN yang telah diaktivasi pondok.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <span>{loading ? 'Memverifikasi...' : 'Buka Portal Wali Santri'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
