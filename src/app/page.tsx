'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Send,
  BookOpen,
  ChevronRight,
  Clock
} from 'lucide-react';
import { submitYayasanRegistration } from '@/lib/yayasanRegistrationStore';

export default function WelcomeScreenYayasanPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    nama_yayasan: '',
    nama_pimpinan: '',
    no_whatsapp: '',
    email: '',
    kota: '',
    estimasi_santri: '50 - 200 Santri',
    paket_pilihan: 'Standar Pro Pesantren',
    catatan: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_yayasan || !formData.nama_pimpinan || !formData.no_whatsapp) {
      alert('Mohon lengkapi Nama Yayasan, Nama Pimpinan, dan No. WhatsApp.');
      return;
    }

    setLoading(true);
    try {
      const result = await submitYayasanRegistration({
        nama_yayasan: formData.nama_yayasan,
        nama_pimpinan: formData.nama_pimpinan,
        no_whatsapp: formData.no_whatsapp,
        email: formData.email,
        kota: formData.kota,
        estimasi_santri: formData.estimasi_santri,
        paket_pilihan: formData.paket_pilihan,
        catatan: formData.catatan,
      });

      setRegisteredData(result);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header Bersih & Elegan */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/images/app-logo.png"
              alt="KabarSantri"
              className="w-9 h-9 rounded-xl object-contain border border-emerald-100 shadow-xs"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">KabarSantri</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">v2.0</span>
              </div>
              <p className="text-[10px] text-slate-600 hidden sm:block">Sistem Manajemen Pesantren Terpadu</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200 shadow-2xs"
            >
              <span>Masuk Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {submitted ? (
          /* Konfirmasi Sukses Pendaftaran */
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 inline-block">
                Pendaftaran Berhasil Diterima
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Alhamdulillah!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Data pendaftaran <strong>{registeredData?.nama_yayasan}</strong> telah kami terima sebagai bahan referensi resmi bagi <strong>Super Admin</strong>.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600 font-medium">Pimpinan Yayasan:</span>
                <span className="font-semibold text-slate-800">{registeredData?.nama_pimpinan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600 font-medium">Kontak WhatsApp:</span>
                <span className="font-semibold text-emerald-700">{registeredData?.no_whatsapp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600 font-medium">Paket Langganan:</span>
                <span className="font-semibold text-slate-800">{registeredData?.paket_pilihan}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 font-medium">Status Pengajuan:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Menunggu Aktivasi Super Admin</span>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-900 rounded-2xl p-4 text-xs text-left border border-blue-200/80 space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Langkah Selanjutnya:</span>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Super Admin akan memeriksa data lembaga Anda dan mengirimkan pesan aktivasi beserta kredensial akun administrator resmi ke nomor WhatsApp di atas.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                <span>Sudah Punya Akun? Masuk Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    nama_yayasan: '',
                    nama_pimpinan: '',
                    no_whatsapp: '',
                    email: '',
                    kota: '',
                    estimasi_santri: '50 - 200 Santri',
                    paket_pilihan: 'Standar Pro Pesantren',
                    catatan: '',
                  });
                }}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition"
              >
                Daftarkan Lembaga Lain
              </button>
            </div>
          </div>
        ) : (
          /* Formulir Onboarding Yayasan */
          <div className="space-y-6 sm:space-y-8">
            {/* Hero / Sambutan */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Portal Registrasi & Aktivasi Yayasan</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Selamat Datang di KabarSantri
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Lengkapi formulir di bawah ini sebagai bahan referensi resmi bagi Super Admin untuk proses aktivasi sistem dan pengelolaan langganan pesantren Anda.
              </p>
            </div>

            {/* Kartu Formulir Pendaftaran */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">
              {/* Seksi 1: Identitas Lembaga */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Identitas Yayasan / Pesantren</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Nama Yayasan / Pondok Pesantren <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Yayasan Pondok Pesantren Al-Hikmah"
                      value={formData.nama_yayasan}
                      onChange={(e) => setFormData({ ...formData, nama_yayasan: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm transition outline-hidden bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Kota / Domisili Lembaga <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Malang, Jawa Timur"
                        value={formData.kota}
                        onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm transition outline-hidden bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Email Resmi Lembaga
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="Contoh: info@pesantren.sch.id"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm transition outline-hidden bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seksi 2: Kontak Pimpinan */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Kontak Pimpinan / Pengasuh</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Nama Pimpinan / Ketua Yayasan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: KH. Abdullah Syukri / Ustadz Hasan"
                      value={formData.nama_pimpinan}
                      onChange={(e) => setFormData({ ...formData, nama_pimpinan: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm transition outline-hidden bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      No. WhatsApp Aktif <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 081234567890"
                        value={formData.no_whatsapp}
                        onChange={(e) => setFormData({ ...formData, no_whatsapp: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm transition outline-hidden bg-slate-50/50 focus:bg-white font-medium"
                      />
                    </div>
                    <p className="text-[10px] text-slate-600">Super Admin akan menghubungi via WhatsApp ini untuk aktivasi.</p>
                  </div>
                </div>
              </div>

              {/* Seksi 3: Kebutuhan Sistem & Paket Langganan */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Kapasitas & Paket Langganan</h3>
                </div>

                {/* Estimasi Santri (Pills) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Perkiraan Jumlah Santri Binaan:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['< 50 Santri', '50 - 200 Santri', '200 - 500 Santri', '> 500 Santri'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setFormData({ ...formData, estimasi_santri: item })}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                          formData.estimasi_santri === item
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pilihan Paket Langganan */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-700">Pilihan Paket Berlangganan:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Paket Starter */}
                    <div
                      onClick={() => setFormData({ ...formData, paket_pilihan: 'Starter (Gratis 50 Santri)' })}
                      className={`cursor-pointer p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                        formData.paket_pilihan.includes('Starter')
                          ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Starter
                          </span>
                          <span className="text-xs font-bold text-emerald-600">Gratis</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-2">Kapasitas 50 Santri</h4>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Fokus Tahfidz, Pembinaan Adab, Poin Reward, & Portal Transparansi Wali Santri.
                        </p>
                      </div>
                    </div>

                    {/* Paket Standar Pro */}
                    <div
                      onClick={() => setFormData({ ...formData, paket_pilihan: 'Standar Pro Pesantren' })}
                      className={`cursor-pointer p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                        formData.paket_pilihan.includes('Standar Pro')
                          ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            Populer
                          </span>
                          <span className="text-xs font-bold text-blue-600">Pro</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-2">Standar Pro Pesantren</h4>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Modul Akademik Lengkap, Tagihan SPP Digital, Presensi GPS Guru, & WhatsApp Blast.
                        </p>
                      </div>
                    </div>

                    {/* Paket Enterprise */}
                    <div
                      onClick={() => setFormData({ ...formData, paket_pilihan: 'Enterprise Yayasan' })}
                      className={`cursor-pointer p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                        formData.paket_pilihan.includes('Enterprise')
                          ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            Lengkap
                          </span>
                          <span className="text-xs font-bold text-purple-600">Custom</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-2">Enterprise Yayasan</h4>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Multi-Cabang, Double-Entry General Ledger Akuntansi, Sarpras, & Kuota Santri Tak Terbatas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Catatan Tambahan */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Catatan Khusus atau Kebutuhan Tambahan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Kami ingin pelatihan teknis untuk 10 guru dan migrasi data santri awal."
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm transition outline-hidden bg-slate-50/50 focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Tombol Kirim Pendaftaran */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-slate-600 text-center sm:text-left flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Data Anda aman dan terisolasi khusus untuk referensi aktivasi.</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  {loading ? (
                    <span>Memproses Pendaftaran...</span>
                  ) : (
                    <>
                      <span>Kirim Pendaftaran Yayasan</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer Bersih */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-600">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 KabarSantri v2.0 Platform. Solusi Digital Terpadu Pesantren Indonesia.</span>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-emerald-700 transition">
              Masuk Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
