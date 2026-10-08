'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  PieChart,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { isTenantMode } from '@/lib/sharedDataStore';

export interface DataBulanKeuangan {
  bulan: string; // "Mei 2026"
  pendapatan: number;
  pengeluaran: number;
  fix_cost: number;
  variable_cost: number;
  margin: number;
  margin_percent: number;
  catatan: string;
}

export const DATA_6_BULAN: DataBulanKeuangan[] = [
  {
    bulan: 'Mei 2026',
    pendapatan: 245000000,
    pengeluaran: 196000000,
    fix_cost: 132000000,
    variable_cost: 64000000,
    margin: 49000000,
    margin_percent: 20.0,
    catatan: 'Awal gelombang pendaftaran PPDB santri baru.',
  },
  {
    bulan: 'Juni 2026',
    pendapatan: 252000000,
    pengeluaran: 201000000,
    fix_cost: 133000000,
    variable_cost: 68000000,
    margin: 51000000,
    margin_percent: 20.24,
    catatan: 'Ujian akhir semester & persiapan tahun ajaran baru.',
  },
  {
    bulan: 'Juli 2026',
    pendapatan: 268500000,
    pengeluaran: 208200000,
    fix_cost: 135000000,
    variable_cost: 73200000,
    margin: 60300000,
    margin_percent: 22.46,
    catatan: 'Masa orientasi santri baru & pembayaran SPP perdana.',
  },
  {
    bulan: 'Agustus 2026',
    pendapatan: 295800000,
    pengeluaran: 224500000,
    fix_cost: 136500000,
    variable_cost: 88000000,
    margin: 71300000,
    margin_percent: 24.1,
    catatan: 'Puncak pelunasan daftar ulang santri lama & baru.',
  },
  {
    bulan: 'September 2026',
    pendapatan: 276400000,
    pengeluaran: 211800000,
    fix_cost: 136500000,
    variable_cost: 75300000,
    margin: 64600000,
    margin_percent: 23.37,
    catatan: 'Penerimaan SPP rutin & stabilitas logistik asrama.',
  },
  {
    bulan: 'Oktober 2026',
    pendapatan: 286700000,
    pengeluaran: 216300000,
    fix_cost: 136500000,
    variable_cost: 79800000,
    margin: 70400000,
    margin_percent: 24.55,
    catatan: 'Bulan berjalan: Peningkatan donasi & tertib SPP.',
  },
];

export default function Laporan6BulanChart() {
  const [viewMode, setViewMode] = useState<'grafik' | 'tabel'>('grafik');
  const [selectedBulanIdx, setSelectedBulanIdx] = useState(5); // Default Oktober
  const isTenant = typeof window !== 'undefined' && isTenantMode();

  if (isTenant) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Belum Ada Data Historis Keuangan (Tenant Live)</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Grafik komparasi pendapatan dan surplus 6 bulan akan terbentuk secara otomatis setelah tenant memiliki riwayat transaksi keuangan operasional riil.
          </p>
        </div>
      </div>
    );
  }

  const currentSelected = DATA_6_BULAN[selectedBulanIdx];
  const maxPendapatan = Math.max(...DATA_6_BULAN.map((d) => d.pendapatan));

  const totalPendapatan6Bulan = DATA_6_BULAN.reduce((acc, c) => acc + c.pendapatan, 0);
  const totalPengeluaran6Bulan = DATA_6_BULAN.reduce((acc, c) => acc + c.pengeluaran, 0);
  const totalSurplus6Bulan = totalPendapatan6Bulan - totalPengeluaran6Bulan;
  const avgMarginPercent = ((totalSurplus6Bulan / totalPendapatan6Bulan) * 100).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      {/* Header Komparasi 6 Bulan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
              Analitik Komparasi 6 Bulan
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Mei s.d Oktober 2026</span>
          </div>
          <h2 className="font-bold text-slate-900 text-base mt-1 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Grafik Perbandingan Keuangan & Tren Margin (6 Bulan)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Perbandingan dinamis pertumbuhan pendapatan, beban operasional, dan margin surplus per bulan
          </p>
        </div>

        {/* Toggle View Mode */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grafik')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'grafik' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Grafik Visual
          </button>
          <button
            onClick={() => setViewMode('tabel')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'tabel' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tabel Rinci
          </button>
        </div>
      </div>

      {/* Rangkuman 3 Indikator Tren 6 Bulan */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Omzet 6 Bulan</span>
          <span className="text-sm font-bold font-mono text-slate-800">
            Rp {(totalPendapatan6Bulan / 1000000).toFixed(1)} Juta
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">+17.0% Pertumbuhan</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Beban Pengeluaran</span>
          <span className="text-sm font-bold font-mono text-slate-800">
            Rp {(totalPengeluaran6Bulan / 1000000).toFixed(1)} Juta
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Fix + Variable Cost</span>
        </div>

        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
          <span className="text-[10px] text-emerald-900 font-semibold block uppercase">Total Akumulasi Surplus</span>
          <span className="text-sm font-bold font-mono text-emerald-800">
            + Rp {(totalSurplus6Bulan / 1000000).toFixed(1)} Juta
          </span>
          <span className="text-[10px] text-emerald-700 block mt-0.5">Cadangan Kas Aman</span>
        </div>

        <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200">
          <span className="text-[10px] text-teal-900 font-semibold block uppercase">Rata-rata Margin Bersih</span>
          <span className="text-sm font-bold font-mono text-teal-800">
            +{avgMarginPercent}%
          </span>
          <span className="text-[10px] text-teal-700 block mt-0.5">Ideal (&gt; 20% Target Yayasan)</span>
        </div>
      </div>

      {/* VIEW 1: GRAFIK VISUAL BATANG */}
      {viewMode === 'grafik' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span className="italic text-[11px]">
              Klik pada batang bulan tertentu untuk melihat rincian spesifik di bawah
            </span>
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span>
                <span>Pendapatan</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                <span>Pengeluaran</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                <span>Margin Bersih</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-6 pb-2 border-b border-slate-100">
            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-56 px-2">
              {DATA_6_BULAN.map((item, idx) => {
                const heightPendapatan = Math.round((item.pendapatan / maxPendapatan) * 100);
                const heightPengeluaran = Math.round((item.pengeluaran / maxPendapatan) * 100);
                const isSelected = selectedBulanIdx === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedBulanIdx(idx)}
                    className={`flex flex-col items-center justify-end h-full cursor-pointer transition p-1.5 rounded-xl ${
                      isSelected ? 'bg-emerald-50/80 ring-2 ring-emerald-500 shadow-sm' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Badge Margin di atas batang */}
                    <div className="mb-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs text-center font-mono">
                      +{item.margin_percent.toFixed(1)}%
                    </div>

                    {/* Dual Bars: Pendapatan vs Pengeluaran */}
                    <div className="w-full flex items-end justify-center space-x-1 sm:space-x-2 h-40">
                      {/* Bar Pendapatan */}
                      <div
                        style={{ height: `${heightPendapatan}%` }}
                        className="w-1/2 bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-md relative group transition-all"
                        title={`Pendapatan: Rp ${item.pendapatan.toLocaleString('id-ID')}`}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 transition">
                          Rp {(item.pendapatan / 1000000).toFixed(1)} Jt
                        </div>
                      </div>

                      {/* Bar Pengeluaran */}
                      <div
                        style={{ height: `${heightPengeluaran}%` }}
                        className="w-1/2 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md relative group transition-all"
                        title={`Pengeluaran: Rp ${item.pengeluaran.toLocaleString('id-ID')}`}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 transition">
                          Rp {(item.pengeluaran / 1000000).toFixed(1)} Jt
                        </div>
                      </div>
                    </div>

                    {/* Label Bulan */}
                    <span className={`text-[11px] font-semibold mt-2.5 truncate max-w-full text-center ${
                      isSelected ? 'text-emerald-800 font-bold' : 'text-slate-600'
                    }`}>
                      {item.bulan.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rincian Bulan Terpilih */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Fokus Analisis: {currentSelected.bulan}
              </span>
              <p className="text-slate-700 font-medium text-[11px] mt-0.5">
                {currentSelected.catatan}
              </p>
            </div>
            <div className="flex gap-4 self-start sm:self-auto font-mono text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 block">Pendapatan:</span>
                <span className="font-bold text-emerald-800">Rp {currentSelected.pendapatan.toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Pengeluaran:</span>
                <span className="font-bold text-amber-800">Rp {currentSelected.pengeluaran.toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Margin Bersih:</span>
                <span className="font-bold text-emerald-700">+Rp {currentSelected.margin.toLocaleString('id-ID')} ({currentSelected.margin_percent.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: TABEL KOMPARASI BULANAN */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-2.5">Periode Bulan</th>
                <th className="p-2.5">Pendapatan</th>
                <th className="p-2.5">Fix Cost (Gaji)</th>
                <th className="p-2.5">Variable Cost</th>
                <th className="p-2.5">Total Pengeluaran</th>
                <th className="p-2.5 text-right">Surplus Bersih</th>
                <th className="p-2.5 text-center">Margin %</th>
                <th className="p-2.5">Keterangan Dinamika</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DATA_6_BULAN.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="p-2.5 font-bold text-slate-800">
                    {row.bulan}
                  </td>
                  <td className="p-2.5 font-mono text-emerald-700 font-bold">
                    Rp {row.pendapatan.toLocaleString('id-ID')}
                  </td>
                  <td className="p-2.5 font-mono text-slate-700">
                    Rp {row.fix_cost.toLocaleString('id-ID')}
                  </td>
                  <td className="p-2.5 font-mono text-slate-700">
                    Rp {row.variable_cost.toLocaleString('id-ID')}
                  </td>
                  <td className="p-2.5 font-mono text-amber-700 font-bold">
                    Rp {row.pengeluaran.toLocaleString('id-ID')}
                  </td>
                  <td className="p-2.5 font-mono text-right font-bold text-emerald-800">
                    +Rp {row.margin.toLocaleString('id-ID')}
                  </td>
                  <td className="p-2.5 text-center font-bold text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      +{row.margin_percent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-500 text-[11px]">
                    {row.catatan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
