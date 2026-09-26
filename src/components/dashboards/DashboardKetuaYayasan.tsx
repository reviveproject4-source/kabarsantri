import React, { useState } from 'react';
import { Pegawai, PresensiPegawai, PresensiSantri, Santri, NilaiAkhlak, Yayasan } from '../../types';
import { tanggalLokal } from '../../tanggal';
import { GrafikGaris, WARNA_STATUS } from '../../Grafik';
import { useRewardList, usePelanggaranList } from '../../hooks/useRewardPelanggaran';
import { usePengeluaranList } from '../../hooks/usePengeluaran';
import { useSppList, useDaftarUlangList, useUangPendaftaranList } from '../../hooks/useTagihan';

interface Props {
  namaAktif: string;
  yayasan?: Yayasan;
  santriList: Santri[];
  pegawaiList: Pegawai[];
  presensiPegawaiList: PresensiPegawai[];
  presensiSantriList: PresensiSantri[];
  nilaiAkhlakList: NilaiAkhlak[];
  totalPemasukan: number;
  totalDonasi: number;
  totalDaftarUlang: number;
  totalUangPendaftaran: number;
  trenPerBulan: Array<{ total: number }>;
  kategoriBulanKeuangan: string[];
}

export function DashboardKetuaYayasan({
  namaAktif,
  yayasan,
  santriList,
  pegawaiList,
  presensiPegawaiList,
  presensiSantriList,
  nilaiAkhlakList,
  totalPemasukan,
  totalDonasi,
  totalDaftarUlang,
  totalUangPendaftaran,
  trenPerBulan,
  kategoriBulanKeuangan,
}: Props) {
  const hariIni = tanggalLokal();

  // Filters (Executive Read-only Filters)
  const [periodeFilter, setPeriodeFilter] = useState<string>('Bulan Ini');
  const [unitFilter, setUnitFilter] = useState<string>('Semua Unit');
  const [kelasFilter, setKelasFilter] = useState<string>('Semua Kelas');
  const [genderFilter, setGenderFilter] = useState<'Semua' | 'Laki-Laki' | 'Perempuan'>('Semua');

  const { data: rewardList = [] } = useRewardList();
  const { data: pelanggaranList = [] } = usePelanggaranList();
  const { data: pengeluaranList = [] } = usePengeluaranList();
  const { data: sppList = [] } = useSppList();
  const { data: daftarUlangList = [] } = useDaftarUlangList();
  const { data: uangPendaftaranList = [] } = useUangPendaftaranList();

  // Filtered Santri
  const santriTerfilter = santriList.filter((s) => {
    if (genderFilter !== 'Semua') {
      const matchGender = genderFilter === 'Laki-Laki'
        ? s.jenisKelamin === 'Laki-Laki' || s.jenisKelamin === 'L'
        : s.jenisKelamin === 'Perempuan' || s.jenisKelamin === 'P';
      if (!matchGender) return false;
    }
    if (kelasFilter !== 'Semua Kelas' && s.kelas !== kelasFilter) return false;
    return true;
  });

  const totalSantri = santriTerfilter.length;
  const santriIdsSet = new Set(santriTerfilter.map((s) => s.id));

  // Attendance Metrics
  const statusPegawaiMap = new Map(
    presensiPegawaiList
      .filter((p) => p.tanggal === hariIni)
      .map((p) => [String(p.pegawaiId), p.status])
  );

  const totalHadirPegawai = pegawaiList.filter(
    (p) => statusPegawaiMap.get(String(p.id)) === 'Hadir'
  ).length;

  const persenKehadiranPegawai = pegawaiList.length > 0
    ? Math.round((totalHadirPegawai / pegawaiList.length) * 100)
    : 100;

  const presensiSantriHariIni = presensiSantriList.filter(
    (p) => p.tanggal === hariIni && santriIdsSet.has(p.santriId)
  );

  const countSantriHadir = presensiSantriHariIni.filter((p) => p.status === 'Hadir').length;
  const persenKehadiranSantri = totalSantri > 0
    ? Math.round((countSantriHadir / totalSantri) * 100)
    : 100;

  // Academic & Tahfidz Metrics
  const santriDenganHafalan = santriTerfilter.filter(
    (s) => (s.riwayatTahfidz && s.riwayatTahfidz.length > 0) || s.juzTerakhir
  ).length;

  const persenHafalan = totalSantri > 0 ? Math.round((santriDenganHafalan / totalSantri) * 100) : 0;

  // Reward & Pelanggaran Metrics
  const uniqueRewardCount = new Set(
    rewardList.filter((r) => santriIdsSet.has(r.santriId)).map((r) => r.santriId)
  ).size;

  const uniquePelanggaranCount = new Set(
    pelanggaranList.filter((p) => santriIdsSet.has(p.santriId)).map((p) => p.santriId)
  ).size;

  // -------------------------------------------------------------
  // EXECUTIVE FINANCIAL AGGREGATIONS (DATABASE ACTUAL)
  // -------------------------------------------------------------
  // 1. PENDAPATAN TEREALISASI (Verified Realized Revenue)
  const sppLunasTotal = sppList
    .filter((s) => s.status === 'Lunas' && (santriIdsSet.size === 0 || santriIdsSet.has(s.santriId)))
    .reduce((acc, s) => acc + s.nominal, 0);

  const daftarUlangLunasTotal = daftarUlangList
    .filter((d) => d.status === 'Lunas' && (santriIdsSet.size === 0 || santriIdsSet.has(d.santriId)))
    .reduce((acc, d) => acc + d.nominal, 0);

  const uangPendaftaranLunasTotal = uangPendaftaranList
    .filter((u) => u.status === 'Lunas' && (santriIdsSet.size === 0 || santriIdsSet.has(u.santriId)))
    .reduce((acc, u) => acc + u.nominal, 0);

  const totalPendapatanTerealisasi = sppLunasTotal + daftarUlangLunasTotal + uangPendaftaranLunasTotal + totalDonasi;

  // 2. TUNGGAKAN (Total Unpaid Receivables)
  const sppBelumLunasTotal = sppList
    .filter((s) => s.status === 'Belum Lunas' && (santriIdsSet.size === 0 || santriIdsSet.has(s.santriId)))
    .reduce((acc, s) => acc + s.nominal, 0);

  const daftarUlangBelumLunasTotal = daftarUlangList
    .filter((d) => d.status === 'Belum Lunas' && (santriIdsSet.size === 0 || santriIdsSet.has(d.santriId)))
    .reduce((acc, d) => acc + d.nominal, 0);

  const uangPendaftaranBelumLunasTotal = uangPendaftaranList
    .filter((u) => u.status === 'Belum Lunas' && (santriIdsSet.size === 0 || santriIdsSet.has(u.santriId)))
    .reduce((acc, u) => acc + u.nominal, 0);

  const totalTunggakan = sppBelumLunasTotal + daftarUlangBelumLunasTotal + uangPendaftaranBelumLunasTotal;

  // 3. FIXED COST (Biaya Tetap: Gaji Pokok + Tunjangan + Fixed Expenses)
  const totalPayrollFixedCost = pegawaiList.reduce(
    (acc, p) => acc + (p.gajiPokok ?? 3500000) + (p.tunjanganTetap ?? 1000000),
    0
  );

  const fixedExpensesTotal = pengeluaranList
    .filter((p) => p.tipeBiaya === 'FIXED')
    .reduce((acc, p) => acc + p.nominal, 0);

  const totalFixedCost = totalPayrollFixedCost + fixedExpensesTotal;

  // 4. VARIABLE COST (Biaya Variabel Operasional)
  const totalVariableCost = pengeluaranList
    .filter((p) => p.tipeBiaya === 'VARIABLE')
    .reduce((acc, p) => acc + p.nominal, 0);

  // Extract unique classes for filter
  const daftarKelas = Array.from(new Set(santriList.map((s) => s.kelas))).filter(Boolean);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-950/20 border border-amber-500/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400/20 text-amber-200 text-xs px-3 py-1 rounded-full font-bold border border-amber-300/30 uppercase tracking-wider">
                👑 Dashboard Ketua Yayasan (Read-Only Executive Reporting)
              </span>
              <span className="bg-white/10 text-amber-100 text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                Laporan &amp; Pengawasan Tertinggi
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {yayasan?.namaYayasan || 'Laporan Eksekutif Yayasan KabarSantri'}
            </h1>
            <p className="text-amber-100/90 text-xs sm:text-sm mt-1.5 font-normal max-w-2xl">
              Portal pengawasan eksekutif Ketua Yayasan: Laporan Keuangan (Pendapatan, Tunggakan, Fixed &amp; Variable Cost), Kehadiran SDM, dan Progres Akademis ({tanggalLokal()}).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-left md:text-right shrink-0">
            <div className="text-[10px] text-amber-200 uppercase tracking-wider font-semibold">Pengawas Utama</div>
            <div className="text-lg font-black text-amber-300 flex items-center gap-1.5 md:justify-end">
              <span>👤</span> {namaAktif}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">Mode: Strictly Read-Only Reporting</div>
          </div>
        </div>
      </div>

      {/* EXECUTIVE FINANCIAL REPORT CARDS (4 CORE METRICS) */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Laporan Keuangan Eksekutif (4 Metrik Utama)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metrik 1: PENDAPATAN */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 p-5 rounded-3xl text-white shadow-lg shadow-emerald-950/20 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">1. Pendapatan</span>
              <span className="text-lg">💰</span>
            </div>
            <div className="text-2xl font-black text-emerald-300 tracking-tight mt-2">
              Rp{totalPendapatanTerealisasi.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-1 font-medium">
              Realized Revenue (SPP, Reg, Donasi)
            </div>
          </div>

          {/* Metrik 2: TUNGGAKAN */}
          <div className="bg-gradient-to-br from-rose-900 to-amber-950 p-5 rounded-3xl text-white shadow-lg shadow-rose-950/20 border border-rose-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">2. Tunggakan</span>
              <span className="text-lg">⚠️</span>
            </div>
            <div className="text-2xl font-black text-amber-300 tracking-tight mt-2">
              Rp{totalTunggakan.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-rose-200/80 mt-1 font-medium">
              Total Kewajiban Belum Lunas
            </div>
          </div>

          {/* Metrik 3: FIXED COST */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-950 p-5 rounded-3xl text-white shadow-lg shadow-indigo-950/20 border border-indigo-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">3. Fixed Cost</span>
              <span className="text-lg">🏛️</span>
            </div>
            <div className="text-2xl font-black text-indigo-200 tracking-tight mt-2">
              Rp{totalFixedCost.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-indigo-200/80 mt-1 font-medium">
              Payroll (Gaji+Tunjangan) + Biaya Tetap
            </div>
          </div>

          {/* Metrik 4: VARIABLE COST */}
          <div className="bg-gradient-to-br from-purple-900 to-slate-950 p-5 rounded-3xl text-white shadow-lg shadow-purple-950/20 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">4. Variable Cost</span>
              <span className="text-lg">📊</span>
            </div>
            <div className="text-2xl font-black text-purple-200 tracking-tight mt-2">
              Rp{totalVariableCost.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-purple-200/80 mt-1 font-medium">
              Pengeluaran Operasional Variabel
            </div>
          </div>
        </div>
      </div>

      {/* EXECUTIVE FILTER BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔍</span> Filter &amp; Parameter Laporan Eksekutif
          </h3>
          <span className="text-[11px] bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-200">
            Data Terhubung Realtime Supabase
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filter Periode */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Periode Laporan</label>
            <select
              value={periodeFilter}
              onChange={(e) => setPeriodeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="Bulan Ini">Bulan Ini ({tanggalLokal().substring(0, 7)})</option>
              <option value="3 Bulan Terakhir">3 Bulan Terakhir</option>
              <option value="Tahun Ini">Tahun 2026</option>
              <option value="Semua Periode">Semua Periode</option>
            </select>
          </div>

          {/* Filter Unit */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unit Lembaga</label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="Semua Unit">Semua Unit</option>
              <option value="SD / Paud">PAUD &amp; SD/MI</option>
              <option value="SMP / MTs">SMP / MTs</option>
              <option value="SMA / MA">SMA / MA</option>
              <option value="Takhassus">Takhassus Tahfidz</option>
            </select>
          </div>

          {/* Filter Kelas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Filter Kelas</label>
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="Semua Kelas">Semua Kelas</option>
              {daftarKelas.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Gender */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Segment Gender Santri</label>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setGenderFilter('Semua')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${genderFilter === 'Semua' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('Laki-Laki')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${genderFilter === 'Laki-Laki' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                ♂ Laki-Laki
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('Perempuan')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${genderFilter === 'Perempuan' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                ♀ Perempuan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EXECUTIVE FINANCIAL CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Pendapatan vs Pengeluaran */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Grafik Pendapatan vs Total Pengeluaran</h3>
              <p className="text-xs text-slate-400">Analisis arus kas penerimaan vs total biaya operasional</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              Database Actual
            </span>
          </div>
          {kategoriBulanKeuangan.length > 0 ? (
            <GrafikGaris
              kategori={kategoriBulanKeuangan}
              nilai={trenPerBulan.map((b) => b.total)}
              warna={WARNA_STATUS.baik}
            />
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm italic">Belum ada data</div>
          )}
        </div>

        {/* Chart 2: Composition Fixed Cost vs Variable Cost */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Komposisi Biaya (Fixed Cost vs Variable Cost)</h3>
              <p className="text-xs text-slate-400">Perbandingan struktur beban tetap dan beban variabel</p>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full border border-indigo-200">
              Fixed &amp; Variable
            </span>
          </div>
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-indigo-900">Fixed Cost (Biaya Tetap &amp; Gaji Staf)</span>
                <span className="text-indigo-900">Rp{totalFixedCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalFixedCost + totalVariableCost > 0 ? Math.round((totalFixedCost / (totalFixedCost + totalVariableCost)) * 100) : 50}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-purple-900">Variable Cost (Biaya Variabel Operasional)</span>
                <span className="text-purple-900">Rp{totalVariableCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalFixedCost + totalVariableCost > 0 ? Math.round((totalVariableCost / (totalFixedCost + totalVariableCost)) * 100) : 50}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KETUA YAYASAN OPERATIONAL & KEHADIRAN REPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b pb-3 flex items-center justify-between">
            <span>👥 Laporan SDM &amp; Kehadiran Staf Pegawai</span>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full border border-blue-200">
              {persenKehadiranPegawai}% Hadir
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Total Pegawai</div>
              <div className="text-xl font-black text-slate-800 mt-1">{pegawaiList.length} Staf</div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <div className="text-emerald-700 font-semibold uppercase text-[10px]">Pegawai Hadir Hari Ini</div>
              <div className="text-xl font-black text-emerald-800 mt-1">{totalHadirPegawai} Staf</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base border-b pb-3 flex items-center justify-between">
            <span>🎓 Laporan Kedisiplinan &amp; Reward Santri</span>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-full border border-amber-200">
              Scope: {genderFilter}
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <div className="text-emerald-700 font-semibold uppercase text-[10px]">Santri Penerima Reward</div>
              <div className="text-xl font-black text-emerald-800 mt-1">{uniqueRewardCount} Santri</div>
            </div>
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
              <div className="text-rose-700 font-semibold uppercase text-[10px]">Santri Tercatat Pelanggaran</div>
              <div className="text-xl font-black text-rose-800 mt-1">{uniquePelanggaranCount} Santri</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
