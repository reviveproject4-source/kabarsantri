'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Send,
  Clock,
  Lock
} from 'lucide-react';
import { submitYayasanRegistration, PaketType } from '@/lib/yayasanRegistrationStore';

export default function WelcomeScreenYayasanPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);

  // Form State: Paket HANYA 2 (Gratis dan Enterprise)
  const [formData, setFormData] = useState<{
    nama_yayasan: string;
    nama_pimpinan: string;
    no_whatsapp: string;
    email: string;
    kota: string;
    estimasi_santri: string;
    paket_pilihan: PaketType;
    catatan: string;
  }>({
    nama_yayasan: '',
    nama_pimpinan: '',
    no_whatsapp: '',
    email: '',
    kota: '',
    estimasi_santri: '50 - 200 Santri',
    paket_pilihan: 'Gratis',
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('ks_pending_registration_id', result.id);
        localStorage.setItem('ks_pending_registration_nama', result.nama_yayasan);
        localStorage.setItem('ks_pending_registration_status', 'pending');
      }
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
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 rounded-xl transition border border-slate-200 shadow-2xs"
            >
              <span>Masuk Akun Resmi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {submitted ? (
          /* Konfirmasi Pendaftaran: Wajib ACC Super Admin */
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-300 inline-block">
                Menunggu Persetujuan
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Pendaftaran Terkirim
              </h2>
              <p className="text-xs text-slate-600">
                Data lembaga <strong>{registeredData?.nama_yayasan}</strong> telah kami terima.
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
                <span className="text-slate-600 font-medium">Paket Dipilih:</span>
                <span className="font-bold text-slate-900">Paket {registeredData?.paket_pilihan}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 font-medium">Status Akun:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  ⏳ Menunggu ACC Super Admin
                </span>
              </div>
            </div>

            {/* Petunjuk Singkat Aktivasi */}
            <div className="bg-amber-50 text-amber-900 rounded-2xl p-3 text-xs text-left border border-amber-300 space-y-1">
              <div className="font-bold flex items-center space-x-1.5 text-amber-900">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Petunjuk Akses:</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Akses menu terbuka setelah di-ACC Super Admin. Kredensial login dikirimkan ke WhatsApp pimpinan.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href="/super-admin"
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition"
              >
                <span>Buka Konsol Super Admin (Verifikasi / ACC Lembaga) ➔</span>
              </Link>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  <span>Cek Halaman Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
                      paket_pilihan: 'Gratis',
                      catatan: '',
                    });
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition"
                >
                  Daftarkan Lembaga Lain
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Formulir Onboarding Yayasan */
          <div className="space-y-6 sm:space-y-8">
            {/* Hero / Sambutan Singkat */}
            <div className="text-center space-y-1.5 max-w-xl mx-auto">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pendaftaran Lembaga &amp; Pesantren</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Formulir Pendaftaran Yayasan
              </h1>
              <p className="text-xs text-slate-600">
                Lengkapi data di bawah ini untuk verifikasi dan aktivasi paket layanan pesantren Anda.
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
                    <p className="text-[10px] text-slate-600">Super Admin akan mengirim kredensial ke nomor WhatsApp ini setelah di-ACC.</p>
                  </div>
                </div>
              </div>

              {/* Seksi 3: Kebutuhan Sistem & Paket Langganan (HANYA 2 PAKET: GRATIS & ENTERPRISE) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Kapasitas &amp; Pilihan Paket Langganan</h3>
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

                {/* Pilihan Paket Langganan: HANYA 2 PAKET (GRATIS & ENTERPRISE) */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-700">Pilih Paket Layanan:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Paket 1: GRATIS */}
                    <div
                      onClick={() => setFormData({ ...formData, paket_pilihan: 'Gratis' })}
                      className={`cursor-pointer p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                        formData.paket_pilihan === 'Gratis'
                          ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            PAKET GRATIS
                          </span>
                          <span className="text-sm font-black text-emerald-700">Rp 0 / Selamanya</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900">Kapasitas 50 Santri</h4>
                        <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                          <li className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Setoran &amp; Mutaba'ah Tahfidz Al-Qur'an</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Pembinaan Adab &amp; Reward Prestasi</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Portal Transparansi Wali Santri Mandiri</span>
                          </li>
                        </ul>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-emerald-700">
                        {formData.paket_pilihan === 'Gratis' ? '✓ Paket Terpilih' : 'Pilih Paket Ini'}
                      </div>
                    </div>

                    {/* Paket 2: ENTERPRISE */}
                    <div
                      onClick={() => setFormData({ ...formData, paket_pilihan: 'Enterprise' })}
                      className={`cursor-pointer p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                        formData.paket_pilihan === 'Enterprise'
                          ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                            PAKET ENTERPRISE
                          </span>
                          <span className="text-sm font-black text-purple-700">Solusi Lengkap</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900">Pesantren Skala Penuh</h4>
                        <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                          <li className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>Seluruh Fitur Akademik, KBM &amp; Tahfidz</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>Tagihan SPP Digital &amp; Kuitansi WhatsApp</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>Presensi Mandiri GPS, Rumah Tangga &amp; Akuntansi</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>Kuota Santri Penuh &amp; Multi-Cabang</span>
                          </li>
                        </ul>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-purple-700">
                        {formData.paket_pilihan === 'Enterprise' ? '✓ Paket Terpilih' : 'Pilih Paket Ini'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Catatan Tambahan */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Catatan Kebutuhan Khusus Lembaga (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Mohon aktivasi fitur SPP dan pelatihan untuk bendahara pondok."
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs sm:text-sm transition outline-hidden bg-slate-50/50 focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Tombol Kirim Pendaftaran */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-slate-600 text-center sm:text-left flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Akses sistem dibuka setelah disetujui (ACC) oleh Super Admin.</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  {loading ? (
                    <span>Mengirim Pendaftaran...</span>
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
              Masuk Akun Resmi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
