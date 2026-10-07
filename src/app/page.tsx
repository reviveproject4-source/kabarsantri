import Link from 'next/link';
import { School, ShieldCheck, HeartHandshake, ArrowRight, UserCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 md:p-12 max-w-6xl mx-auto">
      <header className="flex justify-between items-center py-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <img
            src="/images/app-logo.png"
            alt="KabarSantri v2.0"
            className="w-11 h-11 rounded-xl object-contain shadow-md border border-blue-200 bg-white"
          />
          <div>
            <h1 className="font-bold text-xl text-slate-800">KabarSantri <span className="text-emerald-600 text-sm font-semibold ml-1 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">v2.0</span></h1>
            <p className="text-xs text-slate-500">Edu-Management & Parental Engagement Ekosistem Pesantren</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
          >
            Masuk Portal
          </Link>
        </div>
      </header>

      <section className="my-16 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Multi-Tenant & Strict RLS Data Isolation</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Menghubungkan Pesantren, Santri, & Orang Tua dalam <span className="text-emerald-600">Satu Ekosistem</span>
        </h2>
        <p className="max-w-2xl mx-auto text-slate-600 text-base md:text-lg">
          Platform manajemen komprehensif: Keasramaan, KBM, Tahfidz Al-Qur'an, Perizinan QR Gate Pass, Akuntansi Buku Besar, serta Portal Pemantauan Wali Santri.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <Link
            href="/login"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition"
          >
            <span>Masuk Backoffice ERP</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/portal-wali"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white text-slate-800 font-medium rounded-xl border border-slate-300 hover:bg-slate-50 transition"
          >
            <HeartHandshake className="w-4 h-4 text-amber-600" />
            <span>Portal Wali Santri (Demo)</span>
          </Link>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-6 my-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Keasramaan & Tahfidz</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Presensi sholat subuh/isya berbasis asrama, mutaba'ah ziyadah & muraja'ah, perizinan berjenjang QR Gate Pass, dan Poskestren.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Financial & Double-Entry</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Tagihan SPP otomatis, Payment Gateway VA/QRIS dengan Idempotency, Tabungan Wadiah, Donasi, dan Jurnal Umum General Ledger.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Parental Engagement</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Akses frictionless wali via NIS+PIN, WhatsApp Outbox Queue dengan rate limit anti-banned, dan notifikasi kedatangan santri.
          </p>
        </div>
      </div>

      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400">
        © 2026 KabarSantri v2.0 Platform. Dikembangkan untuk kemajuan ekosistem pesantren Indonesia.
      </footer>
    </main>
  );
}
