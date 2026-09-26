import React, { useState } from 'react';

export const HalamanSkemaBiaya: React.FC = () => {
  const [jumlahSantri, setJumlahSantri] = useState<number>(200);
  const [jumlahUnit, setJumlahUnit] = useState<number>(2);

  // Estimasi kasar sederhana untuk membantu simulasi yayasan
  const estimasiHematJamPerBulan = Math.round(jumlahSantri * 1.5);
  const estimasiHematKertasPerTahun = (jumlahSantri * 25000).toLocaleString('id-ID');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
          Skema Layanan & Pendampingan
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Terjangkau, Transparan, & Tanpa Biaya Tersembunyi
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          KabarSantri dikembangkan khusus untuk pesantren di Indonesia dengan skema yang adil dan disesuaikan skala lembaga Anda.
        </p>
      </div>

      {/* KALKULATOR ESTIMASI KEMUDAHAN */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-8 sm:p-12 rounded-3xl space-y-8 shadow-2xl max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">🧮 Simulasi Estimasi Manfaat Pesantren Anda</h2>
          <p className="text-xs text-slate-400 mt-1">Geser slider di bawah ini sesuai jumlah santri & unit di lembaga Anda</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Input Jumlah Santri */}
          <div className="space-y-3 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-300">Jumlah Santri:</span>
              <span className="text-amber-400 text-lg">{jumlahSantri} Santri</span>
            </div>
            <input
              type="range"
              min={30}
              max={2000}
              step={10}
              value={jumlahSantri}
              onChange={(e) => setJumlahSantri(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>30 Santri</span>
              <span>1.000 Santri</span>
              <span>2.000+ Santri</span>
            </div>
          </div>

          {/* Input Jumlah Unit */}
          <div className="space-y-3 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-300">Jumlah Unit Sekolah:</span>
              <span className="text-blue-400 text-lg">{jumlahUnit} Unit</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={jumlahUnit}
              onChange={(e) => setJumlahUnit(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 Unit (SMP IT)</span>
              <span>5 Unit</span>
              <span>10 Unit (Yayasan)</span>
            </div>
          </div>
        </div>

        {/* Output Estimasi Dampak */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-bold">Estimasi Waktu Administrasi Dihemat</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">± {estimasiHematJamPerBulan} Jam / bulan</div>
            <p className="text-[11px] text-slate-500 mt-1">Ustadz bisa lebih fokus pada kualitas hafalan & adab santri</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-bold">Estimasi Penghematan Kertas & Cetak</div>
            <div className="text-2xl font-black text-amber-400 mt-1">± Rp {estimasiHematKertasPerTahun} / tahun</div>
            <p className="text-[11px] text-slate-500 mt-1">Tanpa perlu mencetak buku saku & rapot kertas berulang kali</p>
          </div>
        </div>
      </div>

      {/* PRICING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900/70 border border-slate-800 p-8 rounded-3xl space-y-6">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Pesantren Perintis</span>
            <h3 className="text-2xl font-bold text-white mt-1">Skala Kecil</h3>
            <p className="text-xs text-slate-400 mt-1">Cocok untuk rumah tahfidz & pesantren &lt; 100 santri.</p>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Portal Wali Santri Lengkap</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Modul Tahfidz & Akhlak</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Pendampingan Onboarding Online</li>
          </ul>
        </div>

        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/80 p-8 rounded-3xl space-y-6 relative shadow-2xl">
          <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
            Paling Banyak Dipilih
          </span>
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Pesantren Menengah</span>
            <h3 className="text-2xl font-bold text-white mt-1">Skala 100 - 500 Santri</h3>
            <p className="text-xs text-slate-400 mt-1">Solusi terpadu untuk SMP IT / SMA IT / Pesantren Asrama.</p>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Semua Fitur Pesantren Perintis</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Modul Keuangan & Validasi Transfer</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Pendampingan Onsite / Tatap Muka</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Migrasi Data Buku Lama Dibantu</li>
          </ul>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-8 rounded-3xl space-y-6">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Yayasan Besar</span>
            <h3 className="text-2xl font-bold text-white mt-1">Multi-Unit &gt; 500 Santri</h3>
            <p className="text-xs text-slate-400 mt-1">Yayasan yang mengelola beberapa sekolah & cabang.</p>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Multi-Tenant Isolation per Unit</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Executive Dashboard Yayasan</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Google Chat Space & Custom Roles</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Prioritas Pendampingan Dedicated</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
