import React from 'react';
import { openDirectWA } from '../teleponUtils';

interface Props {
  onBukaPortalWali: () => void;
  onBukaModul: () => void;
  onBukaSkemaBiaya: () => void;
  onBukaPendaftaran: () => void;
  onBukaLogin: () => void;
}

export const HalamanBeranda: React.FC<Props> = ({
  onBukaPortalWali,
  onBukaModul,
  onBukaSkemaBiaya,
  onBukaPendaftaran,
  onBukaLogin,
}) => {
  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-amber-400 text-xs font-bold mb-8 shadow-xl backdrop-blur-sm animate-pulse">
          <span>✨</span> Website Resmi System Operation Pesantren & Yayasan
        </div>

        {/* Headline Utama */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Wali Santri <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">Tenang</span>, Pesantren <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">Rapi</span>, Yayasan Berdaya
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          KabarSantri menghubungkan <strong className="text-white font-semibold">Orang Tua/Wali Santri</strong> dengan aktivitas harian ananda di pondok. Pantau hafalan Al-Qur'an, kedisiplinan adab, kesehatan, presensi, & keuangan secara real-time dari genggaman.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onBukaPortalWali}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5"
          >
            <span>📱</span> Buka Demo Portal Wali Santri
          </button>

          <button
            onClick={onBukaPendaftaran}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base border border-slate-700/80 shadow-xl transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5"
          >
            <span>📝</span> Daftarkan Pesantren / Yayasan
          </button>
        </div>

        {/* Counter Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">50+</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Pesantren & Sekolah Islam</div>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
            <div className="text-2xl sm:text-3xl font-black text-blue-400">15.000+</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Wali Santri Terhubung</div>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Transparansi Laporan</div>
          </div>
          <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
            <div className="text-2xl sm:text-3xl font-black text-purple-400">24/7</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Ketenangan Batin Wali</div>
          </div>
        </div>
      </section>

      {/* BANNER HIGHLIGHT PORTAL WALI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 sm:p-12 rounded-3xl border border-blue-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              Fitur Andalan Wali Santri
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Tidak Ada Lagi Kekhawatiran Wali Santri di Rumah
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Dengan Portal Wali Santri KabarSantri, orang tua bisa secara berkala memeriksa juz dan surah yang dihafal ananda, nilai tajwid, catatan adab dari musyrif, hingga sisa tabungan jajan secara realtime.
            </p>
          </div>

          <button
            onClick={onBukaPortalWali}
            className="w-full md:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm whitespace-nowrap shadow-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>📱</span> Uji Coba Portal Wali Now
          </button>
        </div>
      </section>

      {/* 3 PILAR SYSTEM OPERATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold tracking-widest uppercase">
            Solusi Terpadu
          </span>
          <h2 className="text-3xl font-black text-white mt-3">
            Tiga Pilar Utama Ekosistem KabarSantri
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/70 border border-slate-800 p-8 rounded-3xl hover:border-amber-500/40 transition">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-bold text-white mb-2">1. Bagi Wali Santri</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Akses laporan perkembangan ananda kapan pun dari HP. Melihat pencapaian hafalan Al-Qur'an, adab, SPP, dan kesehatan secara transparan.
            </p>
            <button onClick={onBukaPortalWali} className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
              Lihat Portal Wali →
            </button>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/40 transition">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">2. Bagi Ustadz & Staf</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Input hafalan ziyadah/muraja'ah dan presensi 1-klik di HP. Menghemat 80% waktu administrasi kertas manual.
            </p>
            <button onClick={onBukaModul} className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
              Pelajari Fitur Staf →
            </button>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/40 transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">3. Bagi Yayasan & Pimpinan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Dashboard konsolidasi otomatis seluruh unit sekolah (Pesantren, SMP, SMA, PAUD) & validasi keuangan yang terpercaya.
            </p>
            <button onClick={onBukaSkemaBiaya} className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
              Cek Skema & Biaya →
            </button>
          </div>
        </div>
      </section>

      {/* QUICK CTA SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-800">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ingin Melihat Bagaimana KabarSantri Bekerja di Pesantren Anda?
          </h2>
          <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto">
            Tim pendamping Minara siap hadir mendampingi pesantren Bapak/Ibu. Tanpa komitmen di awal dan bebas konsultasi.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openDirectWA('6281215566630', 'Assalamualaikum, saya pengurus pesantren dan ingin berdiskusi tentang KabarSantri.')}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center gap-2"
            >
              <span>💬</span> Chat via WhatsApp Direct
            </button>
            <button
              onClick={onBukaLogin}
              className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700"
            >
              🔑 Masuk Portal Login App
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
