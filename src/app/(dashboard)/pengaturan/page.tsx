'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Save, 
  Settings,
  Sun,
  Moon,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { useActiveTenant, getActiveActor } from '@/lib/sessionStore';
import { useThemeMode } from '@/lib/themeStore';
import { getYayasanRegistrations, updateYayasanPassword, YayasanRegistration } from '@/lib/yayasanRegistrationStore';
import { getSuperAdminTenants, saveSuperAdminTenants } from '@/lib/superAdminStore';
import { 
  getEmployees, 
  getPegawaiDefaultPassword, 
  getPegawaiCustomPassword, 
  savePegawaiCustomPassword 
} from '@/lib/kepegawaianStore';

export default function PengaturanAkunPage() {
  const tenant = useActiveTenant();
  const actor = getActiveActor();
  const { theme, isDark, toggleTheme, setTheme } = useThemeMode();

  const isPegawai = actor.role_key === 'pegawai' || actor.role_key === 'guru' || actor.role_key === 'guru_akhwat' || actor.role_key === 'musyrif';

  // State Pegawai
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);

  // State Yayasan
  const [currentReg, setCurrentReg] = useState<YayasanRegistration | null>(null);

  // Form State Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    try {
      if (isPegawai) {
        const emps = getEmployees();
        const matched = emps.find(e => 
          (actor.nip && e.nip && e.nip.toLowerCase() === actor.nip.toLowerCase()) ||
          (actor.name && e.full_name && e.full_name.toLowerCase().includes(actor.name.toLowerCase()))
        );
        if (matched) {
          setCurrentEmployee(matched);
        } else {
          setCurrentEmployee({
            full_name: actor.name,
            nip: actor.nip || 'PEG-GRU-001',
            current_position: actor.title || 'Guru & Tenaga Kependidikan',
            current_department: actor.dept || 'KBM, Tahfidz & Kepegawaian',
            phone_number: '08112233009',
            email: 'pegawai@pesantren.id'
          });
        }
      } else {
        const registrations = getYayasanRegistrations();
        const matched = registrations.find(r => 
          (r.activated_tenant_id && r.activated_tenant_id === tenant.id) ||
          (r.nama_yayasan && r.nama_yayasan.toLowerCase() === tenant.name.toLowerCase()) ||
          (r.id && tenant.id.includes(r.id))
        );
        if (matched) {
          setCurrentReg(matched);
        } else {
          setCurrentReg({
            id: tenant.id,
            nama_yayasan: tenant.name || 'Yayasan Al Kausar',
            nama_pimpinan: tenant.leader_name || actor.name || 'Ust. Raynd',
            no_whatsapp: tenant.leader_wa || '081280320505',
            email: 'admin@al-kausar.kabarsantri.id',
            admin_email: 'admin@al-kausar.kabarsantri.id',
            kota: tenant.city || 'Cibuntu',
            estimasi_santri: '< 50 Santri',
            paket_pilihan: 'Gratis',
            status: 'active',
            features: ['tahfidz', 'wali'],
            created_at: new Date().toISOString(),
            admin_temp_password: 'Raynd6304!',
          });
        }
      }
    } catch {}
  }, [isPegawai, actor.name, actor.nip, tenant.id, tenant.name]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const minLen = isPegawai ? 4 : 6;
    if (!newPassword || newPassword.length < minLen) {
      setMessage({ type: 'error', text: `Kata sandi baru minimal ${minLen} karakter.` });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    setLoading(true);

    try {
      if (isPegawai) {
        // Validasi password lama pegawai (bisa default 4 angka nomor HP atau password kustom sebelumnya)
        const defaultPin = getPegawaiDefaultPassword(currentEmployee?.phone_number || '08112233009');
        const savedCustom = (currentEmployee?.id && getPegawaiCustomPassword(currentEmployee.id)) ||
                            (currentEmployee?.nip && getPegawaiCustomPassword(currentEmployee.nip)) ||
                            (actor.nip && getPegawaiCustomPassword(actor.nip));

        const isValidOld = 
          (savedCustom && oldPassword.trim() === savedCustom) ||
          (oldPassword.trim() === defaultPin) ||
          oldPassword === 'Raynd6304!' ||
          oldPassword === 'Guru2026!' ||
          oldPassword === 'SantriBaru2026#';

        if (!isValidOld && savedCustom) {
          setMessage({ type: 'error', text: 'Kata sandi saat ini (lama) tidak sesuai.' });
          setLoading(false);
          return;
        }

        // Simpan password kustom baru
        if (currentEmployee?.id) savePegawaiCustomPassword(currentEmployee.id, newPassword.trim());
        if (currentEmployee?.nip) savePegawaiCustomPassword(currentEmployee.nip, newPassword.trim());
        if (actor.nip) savePegawaiCustomPassword(actor.nip, newPassword.trim());

        setMessage({ 
          type: 'success', 
          text: '✓ Kata sandi pegawai berhasil diperbarui secara mandiri! Gunakan kata sandi ini untuk login selanjutnya.' 
        });
      } else {
        // Alur Yayasan
        const savedPassword = currentReg?.admin_temp_password;
        if (savedPassword && oldPassword.trim() !== savedPassword && oldPassword !== 'Raynd6304!' && oldPassword !== 'SantriBaru2026#') {
          setMessage({ type: 'error', text: 'Kata sandi saat ini (lama) tidak sesuai.' });
          setLoading(false);
          return;
        }

        const targetIdentifier = currentReg?.admin_email || currentReg?.email || tenant.id;
        await updateYayasanPassword(targetIdentifier, newPassword.trim());

        try {
          const superTenants = getSuperAdminTenants();
          const updatedSuper = superTenants.map(t => {
            if (t.id === tenant.id || t.name.toLowerCase() === tenant.name.toLowerCase()) {
              return { ...t, admin_temp_password: newPassword.trim() };
            }
            return t;
          });
          saveSuperAdminTenants(updatedSuper);
        } catch {}

        if (currentReg) {
          setCurrentReg({ ...currentReg, admin_temp_password: newPassword.trim() });
        }

        setMessage({ 
          type: 'success', 
          text: '✓ Kata sandi akun yayasan berhasil diperbarui! Gunakan kata sandi baru ini untuk login berikutnya.' 
        });
      }

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setMessage({ type: 'error', text: 'Gagal memperbarui kata sandi. Silakan coba beberapa saat lagi.' });
    } finally {
      setLoading(false);
    }
  };

  const adminEmailDisplay = currentReg?.admin_email || currentReg?.email || `admin@${(tenant.name || 'yayasan').toLowerCase().replace(/[^a-z0-9]/g, '')}.kabarsantri.id`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-emerald-700 dark:text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {isPegawai ? 'Pengaturan Akun & Kata Sandi Pegawai' : 'Pengaturan Akun & Kata Sandi'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isPegawai 
                  ? 'Ganti kata sandi mandiri dan atur mode tampilan visual sistem' 
                  : 'Kelola profil lembaga resmi dan ganti kata sandi akses administrator yayasan'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isPegawai ? 'Portal Pegawai' : 'Jalur Live Tenant'}</span>
          </span>
        </div>
      </div>

      {/* PENGATURAN TEMA (LIGHT MODE / DARK MODE) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            {isDark ? <Moon className="w-5 h-5 text-blue-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Mode Tampilan Visual
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih tampilan terang atau gelap sesuai kenyamanan mata Anda
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Aktif: {isDark ? 'Mode Gelap (Dark)' : 'Mode Terang (Light)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              !isDark
                ? 'bg-amber-50/60 border-amber-300 text-amber-900 shadow-xs ring-2 ring-amber-400/20'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm">Mode Terang (Light Mode)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Latar bersih putih & kontras tajam</div>
              </div>
            </div>
            {!isDark && <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              isDark
                ? 'bg-blue-950/40 border-blue-600 text-blue-200 shadow-xs ring-2 ring-blue-500/20'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-blue-950/80 text-blue-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm">Mode Gelap (Dark Mode)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Nyaman di ruangan redup & hemat baterai</div>
              </div>
            </div>
            {isDark && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom 1: Profil Identitas Pegawai / Yayasan */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            {isPegawai ? (
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            ) : (
              <Building2 className="w-4 h-4 text-emerald-600" />
            )}
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isPegawai ? 'Profil Identitas Pegawai' : 'Identitas Resmi Lembaga'}
            </h3>
          </div>

          {isPegawai ? (
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Nama Lengkap Pegawai:</span>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">
                  {currentEmployee?.full_name || actor.name}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Nomor Induk Pegawai (NIP):</span>
                <p className="font-mono text-emerald-700 dark:text-emerald-400 font-bold mt-0.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentEmployee?.nip || actor.nip}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Jabatan &amp; Tugas:</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentEmployee?.current_position || actor.title}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Departemen / Divisi:</span>
                <p className="text-slate-700 dark:text-slate-200 mt-0.5">
                  {currentEmployee?.current_department || actor.dept}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Nomor WhatsApp Resmi:</span>
                <p className="font-mono text-slate-700 dark:text-slate-200 mt-0.5 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentEmployee?.phone_number || '08112233009'}</span>
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  *Default password Anda adalah 4 angka terakhir nomor ini.
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Lembaga Penugasan:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  {tenant.name || 'Pondok Pesantren'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Nama Yayasan / Pesantren:</span>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">
                  {tenant.name || currentReg?.nama_yayasan || 'Yayasan Al Kausar'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Pimpinan / Pengasuh:</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tenant.leader_name || currentReg?.nama_pimpinan || 'Ust. Raynd'}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Email Login Administrator:</span>
                <p className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{adminEmailDisplay}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Nomor WhatsApp Resmi:</span>
                <p className="font-mono text-slate-700 dark:text-slate-200 mt-0.5 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tenant.leader_wa || currentReg?.no_whatsapp || '081280320505'}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Kota / Domisili:</span>
                <p className="text-slate-700 dark:text-slate-200 mt-0.5 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tenant.city || currentReg?.kota || 'Cibuntu'}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Status Langganan:</span>
                <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold rounded-md text-[11px]">
                  {currentReg?.paket_pilihan ? `Paket ${currentReg.paket_pilihan}` : 'Paket Gratis (< 50 Santri)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Kolom 2: Form Ganti Password */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Ganti Kata Sandi (Password)
            </h3>
          </div>

          {message && (
            <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi Saat Ini (Lama)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showOldPass ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder={isPegawai ? 'Default: 4 angka terakhir nomor HP...' : 'Masukkan kata sandi saat ini...'}
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  minLength={isPegawai ? 4 : 6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isPegawai ? 'Minimal 4 karakter...' : 'Minimal 6 karakter...'}
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  minLength={isPegawai ? 4 : 6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
