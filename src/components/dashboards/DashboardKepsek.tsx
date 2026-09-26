import React from 'react';
import { Pegawai, PresensiPegawai, PresensiSantri, Santri, NilaiAkhlak } from '../../types';
import { PresensiSaya } from '../../PresensiSaya';
import { tanggalLokal } from '../../tanggal';
import { isJabatanMusyrif } from '../../jabatanUtils';

interface Props {
  namaAktif: string;
  pegawaiAktif?: Pegawai;
  santriList: Santri[];
  pegawaiList: Pegawai[];
  presensiPegawaiList: PresensiPegawai[];
  presensiSantri: PresensiSantri[];
  nilaiAkhlakList: NilaiAkhlak[];
  setActiveTab: (tab: string) => void;
}

export function DashboardKepsek({
  namaAktif,
  pegawaiAktif,
  santriList,
  pegawaiList,
  presensiPegawaiList,
  presensiSantri,
  nilaiAkhlakList,
  setActiveTab,
}: Props) {
  const hariIni = tanggalLokal();

  const jumlahGuru = pegawaiList.filter((p) => p.jabatan === 'Guru').length;
  const jumlahMusyrif = pegawaiList.filter((p) => isJabatanMusyrif(p.jabatan)).length;

  const statusPegawaiHariIni = new Map(
    presensiPegawaiList
      .filter((p) => p.tanggal === hariIni)
      .map((p) => [String(p.pegawaiId), p.status])
  );

  const jumlahHadirHariIni = pegawaiList.filter(
    (p) => statusPegawaiHariIni.get(String(p.id)) === 'Hadir'
  ).length;

  // Santri setoran stats
  const santriDenganSetoran = santriList.filter(
    (s) => s.riwayatTahfidz && s.riwayatTahfidz.length > 0
  ).length;

  // Flatten latest setoran
  const listTahfidz: Array<{
    santriNama: string;
    kelas: string;
    tanggal: string;
    surat: string;
    juz: string;
    nilai: string;
  }> = [];

  santriList.forEach((s) => {
    (s.riwayatTahfidz || []).forEach((t) => {
      listTahfidz.push({
        santriNama: s.nama,
        kelas: s.kelas,
        tanggal: t.tanggal,
        surat: t.surat,
        juz: t.juz,
        nilai: t.nilai,
      });
    });
  });

  listTahfidz.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
  const tahfidzTerbaru = listTahfidz.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Card Kepsek */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20 border border-blue-600/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-400/20 text-blue-200 text-xs px-3 py-1 rounded-full font-bold border border-blue-300/30 uppercase tracking-wider">
                🎓 Dashboard Kepala Sekolah
              </span>
              <span className="bg-white/10 text-blue-100 text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                Manajer Operasional &amp; Akademik
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Selamat datang kembali, Ust. {namaAktif}!
            </h1>
            <p className="text-blue-100/90 text-xs sm:text-sm mt-1.5 font-normal max-w-2xl">
              Monitoring eksekutif perkembangan akademik santri, presensi tenaga pendidik, dan kinerja operasional lembaga ({tanggalLokal()}).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-left md:text-right shrink-0">
            <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Total Santri Terdaftar</div>
            <div className="text-2xl font-black text-amber-300 flex items-center gap-1.5 md:justify-end">
              🎓 {santriList.length} <span className="text-xs font-normal text-white">Santri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Presensi Saya (Pegawai Mandiri) */}
      <PresensiSaya pegawaiId={pegawaiAktif?.id ?? null} presensiPegawai={presensiPegawaiList} />

      {/* Stat Summary Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ikhtisar Kinerja &amp; Kepegawaian</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kehadiran Staf Today</h3>
              <p className="text-3xl font-black text-emerald-600 mt-1">{jumlahHadirHariIni} <span className="text-xs font-semibold text-slate-400">/ {pegawaiList.length}</span></p>
              <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 mt-1">
                <span>✓</span> Staf/Guru Hadir
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-inner">
              👨‍💼
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guru &amp; Musyrif</h3>
              <p className="text-3xl font-black text-teal-600 mt-1">{jumlahGuru + jumlahMusyrif}</p>
              <span className="text-[11px] font-semibold text-teal-600 inline-flex items-center gap-1 mt-1">
                <span>👨‍🏫</span> {jumlahGuru} Guru, {jumlahMusyrif} Musyrif
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🕌
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Santri Aktif Setoran</h3>
              <p className="text-3xl font-black text-indigo-600 mt-1">{santriDenganSetoran}</p>
              <span className="text-[11px] font-semibold text-indigo-600 inline-flex items-center gap-1 mt-1">
                <span>📖</span> Capaian Tahfidz
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl shadow-inner">
              📚
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluasi Karakter</h3>
              <p className="text-3xl font-black text-purple-600 mt-1">{nilaiAkhlakList.length}</p>
              <span className="text-[11px] font-semibold text-purple-600 inline-flex items-center gap-1 mt-1">
                <span>🌱</span> Evaluasi Akhlak
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🌟
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Aksi Cepat &amp; Modul Eksekutif Kepala Sekolah</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('kepsek-progres')}
            className="bg-white hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-blue-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📈
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Progres Santri</div>
              <div className="text-[10px] text-slate-400">Monitoring Akademik</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('santri')}
            className="bg-white hover:bg-cyan-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-cyan-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              👨‍🎓
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">Master Santri</div>
              <div className="text-[10px] text-slate-400">Database Santri</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('pegawai')}
            className="bg-white hover:bg-teal-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-teal-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              👨‍💼
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">Data Pegawai</div>
              <div className="text-[10px] text-slate-400">Guru &amp; Staf Pendidik</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('laporan')}
            className="bg-white hover:bg-purple-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-purple-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📑
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">Laporan Executive</div>
              <div className="text-[10px] text-slate-400">Rekap Bulanan Lembaga</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('presensi')}
            className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-emerald-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              ✅
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Presensi Santri</div>
              <div className="text-[10px] text-slate-400">Monitoring Absensi</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tahfidz')}
            className="bg-white hover:bg-indigo-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-indigo-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📖
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Hafalan Al-Qur'an</div>
              <div className="text-[10px] text-slate-400">Tahfidz Santri</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('google-chat')}
            className="bg-white hover:bg-sky-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-sky-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              💬
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors">Google Chat Room</div>
              <div className="text-[10px] text-slate-400">Diskusi Internal</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('bantuan')}
            className="bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-amber-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              ❓
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Pusat Bantuan</div>
              <div className="text-[10px] text-slate-400">Panduan Operasional</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Table: Kehadiran Pegawai Hari Ini */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Presensi &amp; Kehadiran Staf / Pendidik Hari Ini</h3>
            <p className="text-xs text-slate-400">Monitoring kedatangan tenaga pendidik ({tanggalLokal()})</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
              {jumlahHadirHariIni} / {pegawaiList.length} Staf Hadir
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Nama Pegawai</th>
                <th className="p-4 px-6">Jabatan</th>
                <th className="p-4 px-6">Status Kehadiran Hari Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pegawaiList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-slate-400">
                    Belum ada data pegawai terdaftar
                  </td>
                </tr>
              ) : (
                pegawaiList.map((p) => {
                  const status = statusPegawaiHariIni.get(String(p.id));
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 px-6 font-semibold text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                          {p.nama[0]}
                        </div>
                        {p.nama}
                      </td>
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
