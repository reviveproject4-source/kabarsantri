import React, { useState } from 'react';
import { Pegawai, PresensiPegawai, PresensiSantri, Santri, NilaiAkhlak, Yayasan } from '../../types';
import { tanggalLokal } from '../../tanggal';
import { GrafikGaris, WARNA_STATUS } from '../../Grafik';
import { useRewardList, usePelanggaranList } from '../../hooks/useRewardPelanggaran';

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
              Portal pengawasan eksekutif Ketua Yayasan: Analisis perkembangan santri, tingkat kehadiran SDM, kedisiplinan, dan ringkasan keuangan ({tanggalLokal()}).
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
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Gender Santri</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="Semua">Semua (Ikhwan &amp; Akhwat)</option>
              <option value="Laki-Laki">👦 Laki-laki / Ikhwan</option>
              <option value="Perempuan">👧 Perempuan / Akhwat</option>
            </select>
          </div>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY INSIGHT CARDS */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ringkasan Indikator Kinerja Utama (KPI)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Santri Terdaftar</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalSantri}</p>
              <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 mt-1">
                <span>🎓</span> Santri Aktif
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🎓
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tingkat Kehadiran Santri</h3>
              <p className="text-3xl font-black text-emerald-600 mt-1">{persenKehadiranSantri}%</p>
              <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 mt-1">
                <span>✓</span> Presensi Santri Hari Ini
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-inner">
              ✅
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tingkat Kehadiran SDM</h3>
              <p className="text-3xl font-black text-indigo-600 mt-1">{persenKehadiranPegawai}%</p>
              <span className="text-[11px] font-semibold text-indigo-600 inline-flex items-center gap-1 mt-1">
                <span>👨‍💼</span> {totalHadirPegawai} / {pegawaiList.length} Staf Hadir
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl shadow-inner">
              👨‍🏫
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pemasukan</h3>
              <p className="text-2xl font-black text-amber-600 mt-1">Rp{totalPemasukan.toLocaleString('id-ID')}</p>
              <span className="text-[11px] font-semibold text-amber-600 inline-flex items-center gap-1 mt-1">
                <span>💰</span> Akumulasi Penerimaan
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-xl shadow-inner">
              💵
            </div>
          </div>
        </div>
      </div>

      {/* FINANCIAL & ACADEMIC VISUAL CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Trend */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Grafik Tren Penerimaan Keuangan Eksekutif</h3>
              <p className="text-xs text-slate-400">Penerimaan 6 bulan terakhir</p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-200">
              Pemasukan
            </span>
          </div>
          <GrafikGaris
            kategori={kategoriBulanKeuangan}
            nilai={trenPerBulan.map((b) => b.total)}
            warna={WARNA_STATUS.baik}
          />
        </div>

        {/* Academic & Morals Overview */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Ringkasan Capaian Tahfidz &amp; Karakter</h3>
                <p className="text-xs text-slate-400">Rasio setoran hafalan &amp; kedisiplinan</p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-800 font-bold px-3 py-1 rounded-full border border-indigo-200">
                Perkembangan Santri
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">Rasio Catatan Hafalan Santri</div>
                  <div className="text-sm font-black text-indigo-700 mt-0.5">
                    {santriDenganHafalan} / {totalSantri} Santri ({persenHafalan}%)
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  📖
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">Santri Berprestasi (Reward)</div>
                  <div className="text-sm font-black text-teal-700 mt-0.5">
                    {uniqueRewardCount} Santri Teladan
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  🏆
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">Santri Terbina Pelanggaran</div>
                  <div className="text-sm font-black text-rose-700 mt-0.5">
                    {uniquePelanggaranCount} Santri Dalam Pembinaan
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  🚨
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* READ-ONLY TABLE: REKAPITULASI SDM & PEGAWAI */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Rekapitulasi Kehadiran SDM Pegawai Today (Read-Only Report)</h3>
            <p className="text-xs text-slate-400">Monitoring kehadiran pengajar &amp; pengasuh asrama ({tanggalLokal()})</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full border border-slate-200">
            {totalHadirPegawai} / {pegawaiList.length} Hadir
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Nama Pegawai</th>
                <th className="p-4 px-6">NIP</th>
                <th className="p-4 px-6">Jabatan</th>
                <th className="p-4 px-6">Status Presensi Today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pegawaiList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-slate-400">
                    Belum ada data pegawai terdaftar
                  </td>
                </tr>
              ) : (
                pegawaiList.map((p) => {
                  const status = statusPegawaiMap.get(String(p.id));
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 px-6 font-semibold text-slate-800">{p.nama}</td>
                      <td className="p-4 px-6 text-slate-500 font-mono text-xs">{p.nip || '-'}</td>
                      <td className="p-4 px-6 text-slate-600 font-medium text-xs">{p.jabatan}</td>
                      <td className="p-4 px-6">
                        {status ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              status === 'Hadir'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : status === 'Alfa'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              status === 'Hadir' ? 'bg-emerald-500' : status === 'Alfa' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            {status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Belum Presensi
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
