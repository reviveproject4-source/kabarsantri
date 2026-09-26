import React, { useState } from 'react';
import { Pegawai, PresensiPegawai, Santri, Yayasan } from '../../types';
import { PresensiSaya } from '../../PresensiSaya';
import { tanggalLokal } from '../../tanggal';
import { isJabatanMusyrif } from '../../jabatanUtils';
import { GrafikGaris, WARNA_STATUS } from '../../Grafik';

interface Props {
  namaAktif: string;
  yayasan?: Yayasan;
  santriList: Santri[];
  pegawaiList: Pegawai[];
  presensiPegawaiList: PresensiPegawai[];
  totalPemasukan: number;
  totalDonasi: number;
  totalDaftarUlang: number;
  totalUangPendaftaran: number;
  trenPerBulan: Array<{ total: number }>;
  kategoriBulanKeuangan: string[];
  setActiveTab: (tab: string) => void;
}

export function DashboardYayasan({
  namaAktif,
  yayasan,
  santriList,
  pegawaiList,
  presensiPegawaiList,
  totalPemasukan,
  totalDonasi,
  totalDaftarUlang,
  totalUangPendaftaran,
  trenPerBulan,
  kategoriBulanKeuangan,
  setActiveTab,
}: Props) {
  const hariIni = tanggalLokal();

  // Filters
  const [genderFilter, setGenderFilter] = useState<'Semua' | 'Laki-Laki' | 'Perempuan'>('Semua');
  const [jabatanFilter, setJabatanFilter] = useState<string>('Semua');

  // Filtered Santri by Gender
  const santriTerfilter = santriList.filter((s) => {
    if (genderFilter === 'Semua') return true;
    if (genderFilter === 'Laki-Laki') return s.jenisKelamin === 'Laki-Laki' || s.jenisKelamin === 'L';
    if (genderFilter === 'Perempuan') return s.jenisKelamin === 'Perempuan' || s.jenisKelamin === 'P';
    return true;
  });

  const jumlahGuru = pegawaiList.filter(
    (p) => p.jabatan.trim().toLowerCase() === 'guru'
  ).length;

  const jumlahMusyrif = pegawaiList.filter((p) =>
    isJabatanMusyrif(p.jabatan)
  ).length;

  const jumlahWali = santriList.filter(
    (s) => s.namaAyah || s.namaIbu
  ).length;

  const statusPegawaiHariIni = new Map(
    presensiPegawaiList
      .filter((p) => p.tanggal === hariIni)
      .map((p) => [String(p.pegawaiId), p.status])
  );

  const jumlahHadirHariIni = pegawaiList.filter(
    (p) => statusPegawaiHariIni.get(String(p.id)) === 'Hadir'
  ).length;

  const pegawaiTerfilter = pegawaiList.filter((p) => {
    if (jabatanFilter === 'Semua') return true;
    if (jabatanFilter === 'Guru') return p.jabatan === 'Guru';
    if (jabatanFilter === 'Musyrif') return isJabatanMusyrif(p.jabatan);
    if (jabatanFilter === 'Keuangan') return p.jabatan.toLowerCase() === 'keuangan';
    return p.jabatan === jabatanFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Gradient Banner Multi-tenant */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0A4ABF] via-blue-800 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/20 border border-blue-600/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-cyan-100 text-xs px-3 py-1 rounded-full font-bold border border-white/30 tracking-wide uppercase">
                Yayasan Operasional
              </span>
              <span className="bg-white/10 text-sky-100 text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                Multi-tenant Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {yayasan?.namaYayasan || 'Dashboard Yayasan KabarSantri'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 font-normal max-w-2xl">
              Selamat datang kembali, <span className="font-semibold text-white">{namaAktif}</span>! Berikut adalah ikhtisar terkini perkembangan santri, keuangan, dan aktivitas SDM lembaga hari ini ({tanggalLokal()}).
            </p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-right">
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Paket System</div>
              <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <span>👑</span> {yayasan?.paket || 'Gratis'}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('profil-yayasan')}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-3.5 py-2 rounded-xl text-xs border border-white/30 backdrop-blur-md transition flex items-center gap-1.5"
            >
              <span>⚙️</span> Edit Logo &amp; Alamat Lembaga
            </button>
          </div>
        </div>
      </div>

      {/* Presensi Saya Yayasan */}
      <PresensiSaya pegawaiId={null} presensiPegawai={presensiPegawaiList} />

      {/* Gender Filter Controls Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">Filter Demografi Santri:</span>
          <span className="text-xs text-slate-400 font-medium">(Pilih filter gender santri)</span>
        </div>
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          {(['Semua', 'Laki-Laki', 'Perempuan'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                genderFilter === g
                  ? 'bg-[#0A4ABF] text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {g === 'Semua' ? '🌐 Semua Santri' : g === 'Laki-Laki' ? '👦 Santri Ikhwan' : '👧 Santri Akhwat'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Aksi Cepat &amp; Navigasi Direct</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('santri')}
            className="bg-white hover:bg-emerald-50/50 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-emerald-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
              ➕
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Santri Baru</div>
              <div className="text-[10px] text-slate-400">Input Data</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('validasi-pembayaran')}
            className="bg-white hover:bg-teal-50/50 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-teal-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
              ✅
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">Validasi Keuangan</div>
              <div className="text-[10px] text-slate-400">Bukti Transfer</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('pengumuman')}
            className="bg-white hover:bg-cyan-50/50 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-cyan-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
              📢
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">Pengumuman</div>
              <div className="text-[10px] text-slate-400">Broadcast WA</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('laporan')}
            className="bg-white hover:bg-indigo-50/50 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-indigo-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
              📑
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Laporan Exec</div>
              <div className="text-[10px] text-slate-400">Rekap Bulanan</div>
            </div>
          </button>
        </div>
      </div>

      {/* Demografi & SDM Master Stats */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Statistik Demografi &amp; SDM</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Santri</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">{santriTerfilter.length}</p>
              <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 mt-1">
                <span>✓</span> Santri Terdaftar
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🎓
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guru / Pengajar</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">{jumlahGuru}</p>
              <span className="text-[11px] font-semibold text-teal-600 inline-flex items-center gap-1 mt-1">
                <span>✓</span> Tenaga Pendidik
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-xl shadow-inner">
              👨‍🏫
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Musyrif Asrama</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">{jumlahMusyrif}</p>
              <span className="text-[11px] font-semibold text-cyan-600 inline-flex items-center gap-1 mt-1">
                <span>✓</span> Pembina Asrama
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🕌
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wali Santri</h3>
              <p className="text-3xl font-black text-slate-900 mt-1">{jumlahWali}</p>
              <span className="text-[11px] font-semibold text-indigo-600 inline-flex items-center gap-1 mt-1">
                <span>✓</span> Akun Terhubung
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl shadow-inner">
              👨‍👩‍👧
            </div>
          </div>
        </div>
      </div>

      {/* Keuangan Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ringkasan Pemasukan Keuangan</h2>
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

      {/* Presensi Pegawai Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Presensi &amp; Kehadiran Pegawai Hari Ini</h3>
            <p className="text-xs text-slate-400">Monitoring kedatangan pengajar &amp; staf lembaga</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={jabatanFilter}
              onChange={(e) => setJabatanFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Jabatan</option>
              <option value="Guru">Guru</option>
              <option value="Musyrif">Musyrif / Musyrifah</option>
              <option value="Keuangan">Keuangan</option>
            </select>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
              {jumlahHadirHariIni} / {pegawaiList.length} Hadir
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Nama Pegawai</th>
                <th className="p-4 px-6">Jabatan</th>
                <th className="p-4 px-6">Status Hari Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pegawaiTerfilter.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-slate-400">
                    Belum ada data pegawai terdaftar untuk kategori ini
                  </td>
                </tr>
              ) : (
                pegawaiTerfilter.map((p) => {
                  const status = statusPegawaiHariIni.get(String(p.id));
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 px-6 font-semibold text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                          {p.nama[0]}
                        </div>
                        {p.nama}
                      </td>
                      <td className="p-4 px-6 text-slate-600 font-medium">{p.jabatan}</td>
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
