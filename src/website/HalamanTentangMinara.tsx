import React from 'react';

export const HalamanTentangMinara: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
          Tentang Minara & KabarSantri
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          "See Clearly. Decide Confidently."
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Mitra Transformasi Digital Pesantren Indonesia yang Berorientasi pada Keberkahan & Kedaulatan Lembaga.
        </p>
      </div>

      {/* PHILOSOPHY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/70 border border-slate-800 p-8 rounded-3xl space-y-4">
          <div className="text-4xl">🌱</div>
          <h3 className="text-xl font-bold text-white">Prinsip Kedaulatan Data</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Data santri, wali santri, dan laporan keuangan adalah amanah berharga milik pesantren. Minara memastikan 100% kepemilikan dan kendali data berada di tangan yayasan, tidak pernah dijual atau dimanfaatkan untuk kepentingan lain.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-8 rounded-3xl space-y-4">
          <div className="text-4xl">🤝</div>
          <h3 className="text-xl font-bold text-white">Budaya Pendampingan Berkelanjutan</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Kami memahami bahwa banyak pengurus senior di pesantren tidak terbiasa dengan kerumitan aplikasi digital. Oleh karena itu, KabarSantri dirancang sangat sederhana, dan tim kami ikut duduk bersama melatih ustadz sampai terbiasa.
          </p>
        </div>
      </div>

      {/* ALUR 3 TAHAP PENDAMPINGAN */}
      <div className="bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white">3 Tahap Proses Pendampingan KabarSantri</h2>
          <p className="text-xs text-slate-400 mt-1">Langkah nyata merapikan sistem operasional pesantren tanpa mengganggu kegiatan KBM</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-amber-400 font-black text-2xl">01</span>
            <h4 className="text-lg font-bold text-white">Tahap Peninjauan</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memetakan alur yang sudah berjalan di pesantren — siapa yang mencatat hafalan, bagaimana perizinan dilakukan, dan bagian mana yang sering menghambat.
            </p>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-blue-400 font-black text-2xl">02</span>
            <h4 className="text-lg font-bold text-white">Penyesuaian & Migrasi Data</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem disesuaikan dengan aturan pesantren. Data santri & buku induk lama dipindahkan bersama ke database digital secara aman.
            </p>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-emerald-400 font-black text-2xl">03</span>
            <h4 className="text-lg font-bold text-white">Pelatihan & Pendampingan</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pelatihan langsung ustadz, musyrif, dan wali santri. Tim pendamping mendampingi hingga sistem benar-benar dipakai sehari-hari secara alami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
