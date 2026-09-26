import React from 'react';
import { Pegawai } from '../../types';
import { GrafikGaris, WARNA_STATUS } from '../../Grafik';
import { tanggalLokal } from '../../tanggal';

interface Props {
  namaAktif: string;
  pegawaiAktif?: Pegawai;
  setActiveTab: (tab: string) => void;
  totalPemasukan: number;
  totalDonasi: number;
  totalDaftarUlang: number;
  totalUangPendaftaran: number;
  trenPerBulan: Array<{ total: number }>;
  kategoriBulanKeuangan: string[];
}

export function DashboardKeuangan({
  namaAktif,
  pegawaiAktif,
  setActiveTab,
  totalPemasukan,
  totalDonasi,
  totalDaftarUlang,
  totalUangPendaftaran,
  trenPerBulan,
  kategoriBulanKeuangan,
}: Props) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Card Keuangan */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20 border border-blue-600/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-400/20 text-blue-200 text-xs px-3 py-1 rounded-full font-bold border border-blue-300/30 uppercase tracking-wider">
                💰 Dashboard Bendahara / Keuangan
              </span>
              <span className="bg-white/10 text-blue-100 text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                Manajemen Keuangan Lembaga
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Selamat datang kembali, {namaAktif}!
            </h1>
            <p className="text-blue-100/90 text-xs sm:text-sm mt-1.5 font-normal max-w-2xl">
              Kelola pembayaran SPP, daftar ulang, uang pendaftaran, tabungan &amp; uang jajan santri, serta validasi bukti transfer ({tanggalLokal()}).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-left md:text-right shrink-0">
            <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Total Pemasukan Lembaga</div>
            <div className="text-2xl font-black text-amber-300 flex items-center gap-1.5 md:justify-end">
              💰 Rp{totalPemasukan.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Summary Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ringkasan Penerimaan Kas &amp; Keuangan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#0A4ABF] to-blue-900 p-5 rounded-2xl text-white shadow-lg shadow-blue-900/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wider">Total Pemasukan</h3>
              <span className="text-base">💰</span>
            </div>
            <p className="text-2xl font-black tracking-tight mt-2">
              Rp{totalPemasukan.toLocaleString('id-ID')}
            </p>
            <div className="text-[11px] text-blue-200 mt-1">Akumulasi Seluruh Pembayaran</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Donasi Lembaga</h3>
              <span className="text-base">🤲</span>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-2">
              Rp{totalDonasi.toLocaleString('id-ID')}
            </p>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Wakaf &amp; Infaq</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Ulang</h3>
              <span className="text-base">📝</span>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-2">
              Rp{totalDaftarUlang.toLocaleString('id-ID')}
            </p>
            <div className="text-[11px] text-teal-600 font-medium mt-1">Registrasi Ulang</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uang Pendaftaran</h3>
              <span className="text-base">🧾</span>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-2">
              Rp{totalUangPendaftaran.toLocaleString('id-ID')}
            </p>
            <div className="text-[11px] text-indigo-600 font-medium mt-1">Santri Baru</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Modul &amp; Layanan Keuangan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('spp')}
            className="bg-white hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-blue-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              💳
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Pembayaran SPP</div>
              <div className="text-[10px] text-slate-400">Syahriah Harian/Bulan</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('daftar-ulang')}
            className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-emerald-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📝
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Daftar Ulang</div>
              <div className="text-[10px] text-slate-400">Registrasi Tahunan</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('uang-pendaftaran')}
            className="bg-white hover:bg-cyan-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-cyan-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🧾
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">Uang Pendaftaran</div>
              <div className="text-[10px] text-slate-400">Biaya Masuk Santri</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('uang-jajan')}
            className="bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-amber-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              💵
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Uang Jajan Santri</div>
              <div className="text-[10px] text-slate-400">Setor &amp; Tarik Jajan</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tabungan')}
            className="bg-white hover:bg-teal-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-teal-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🏦
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">Tabungan Santri</div>
              <div className="text-[10px] text-slate-400">Simpanan Santri</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('donasi')}
            className="bg-white hover:bg-rose-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-rose-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🤲
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-rose-700 transition-colors">Donasi &amp; Wakaf</div>
              <div className="text-[10px] text-slate-400">Infaq Lembaga</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('validasi-pembayaran')}
            className="bg-white hover:bg-indigo-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-indigo-300 transition-all text-left flex items-center gap-3 group col-span-2"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              ✅
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Validasi Pembayaran Online</div>
              <div className="text-[10px] text-slate-400">Verifikasi Bukti Transfer Wali Santri</div>
            </div>
          </button>
        </div>
      </div>

      {/* Financial Trend Analytics Chart */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Grafik Tren Penerimaan Keuangan</h3>
            <p className="text-xs text-slate-400">
              Kilas balik total penerimaan 6 bulan terakhir
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full border border-slate-200">
            6 Bulan Terakhir
          </span>
        </div>
        <div className="pt-2">
          <GrafikGaris
            kategori={kategoriBulanKeuangan}
            nilai={trenPerBulan.map((b) => b.total)}
            warna={WARNA_STATUS.baik}
          />
        </div>
      </div>
    </div>
  );
}
