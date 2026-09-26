import React from 'react';
import { Pegawai, PresensiPegawai, PresensiSantri, Santri, NilaiAkhlak, IzinPulang } from '../../types';
import { PresensiSaya } from '../../PresensiSaya';
import { tanggalLokal } from '../../tanggal';

interface Props {
  namaAktif: string;
  pegawaiAktif?: Pegawai;
  santriList: Santri[];
  presensiSantri: PresensiSantri[];
  presensiPegawai: PresensiPegawai[];
  nilaiAkhlakList: NilaiAkhlak[];
  izinPulangList: IzinPulang[];
  kelasDiajarAktif: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardGuru({
  namaAktif,
  pegawaiAktif,
  santriList,
  presensiSantri,
  presensiPegawai,
  nilaiAkhlakList,
  izinPulangList,
  kelasDiajarAktif,
  setActiveTab,
}: Props) {
  const hariIni = tanggalLokal();

  // Filter santri for Guru's class scope
  const kelasArray = pegawaiAktif?.kelasDiajar || [];
  const santriKelas = santriList.filter((s) => {
    if (!kelasDiajarAktif || kelasDiajarAktif === 'Semua') return true;
    if (kelasArray.length > 0) return kelasArray.includes(s.kelas);
    return s.kelas === kelasDiajarAktif;
  });

  const totalSantriKelas = santriKelas.length;

  // Presensi Santri Hari Ini
  const presensiHariIniMap = new Map(
    presensiSantri
      .filter((p) => p.tanggal === hariIni)
      .map((p) => [p.santriId, p.status])
  );

  let countHadir = 0;
  let countSakit = 0;
  let countIzin = 0;
  let countAlfa = 0;

  santriKelas.forEach((s) => {
    const st = presensiHariIniMap.get(s.id);
    if (st === 'Hadir') countHadir++;
    else if (st === 'Sakit') countSakit++;
    else if (st === 'Izin') countIzin++;
    else if (st === 'Alfa') countAlfa++;
  });

  const countBelum = totalSantriKelas - (countHadir + countSakit + countIzin + countAlfa);

  // Flatten riwayat tahfidz from santri in class
  const listTahfidzKelas: Array<{
    santriNama: string;
    kelas: string;
    tanggal: string;
    surat: string;
    juz: string;
    ayat: string;
    nilai: string;
    dicatatOleh: string;
  }> = [];

  santriKelas.forEach((s) => {
    (s.riwayatTahfidz || []).forEach((t) => {
      listTahfidzKelas.push({
        santriNama: s.nama,
        kelas: s.kelas,
        tanggal: t.tanggal,
        surat: t.surat,
        juz: t.juz,
        ayat: t.ayat,
        nilai: t.nilai,
        dicatatOleh: t.dicatatOleh,
      });
    });
  });

  // Sort latest first
  listTahfidzKelas.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
  const tahfidzTerbaru = listTahfidzKelas.slice(0, 5);

  // Nilai Akhlak for santri in class
  const santriIdsKelasSet = new Set(santriKelas.map((s) => s.id));
  const akhlakKelas = nilaiAkhlakList.filter((a) => santriIdsKelasSet.has(a.santriId));
  const akhlakTerbaru = akhlakKelas.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Card Guru */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 border border-emerald-600/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-400/20 text-emerald-200 text-xs px-3 py-1 rounded-full font-bold border border-emerald-300/30 uppercase tracking-wider">
                👨‍🏫 Dashboard Guru Pengajar
              </span>
              <span className="bg-white/10 text-emerald-100 text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                Kelas: {kelasDiajarAktif}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Selamat datang kembali, {namaAktif}!
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1.5 font-normal max-w-2xl">
              Kelola presensi harian, setoran hafalan Al-Qur'an, dan evaluasi karakter/adab santri kelas Anda ({tanggalLokal()}).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-left md:text-right shrink-0">
            <div className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">Total Santri Diampu</div>
            <div className="text-2xl font-black text-amber-300 flex items-center gap-1.5 md:justify-end">
              🎓 {totalSantriKelas} <span className="text-xs font-normal text-white">Santri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Presensi Saya (Pegawai Mandiri) */}
      <PresensiSaya pegawaiId={pegawaiAktif?.id ?? null} presensiPegawai={presensiPegawai} />

      {/* Stat Summary Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ikhtisar Kelas & Perkembangan Santri</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presensi Hari Ini</h3>
              <p className="text-3xl font-black text-emerald-600 mt-1">{countHadir} <span className="text-xs font-semibold text-slate-400">/ {totalSantriKelas}</span></p>
              <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 mt-1">
                <span>✓</span> {countHadir} Santri Hadir
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-inner">
              ✅
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Izin & Sakit</h3>
              <p className="text-3xl font-black text-amber-600 mt-1">{countIzin + countSakit}</p>
              <span className="text-[11px] font-semibold text-amber-600 inline-flex items-center gap-1 mt-1">
                <span>ℹ️</span> {countIzin} Izin, {countSakit} Sakit
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🤒
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Setoran Hafalan</h3>
              <p className="text-3xl font-black text-indigo-600 mt-1">{listTahfidzKelas.length}</p>
              <span className="text-[11px] font-semibold text-indigo-600 inline-flex items-center gap-1 mt-1">
                <span>📖</span> Riwayat Tahfidz
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl shadow-inner">
              📚
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluasi Akhlak</h3>
              <p className="text-3xl font-black text-teal-600 mt-1">{akhlakKelas.length}</p>
              <span className="text-[11px] font-semibold text-teal-600 inline-flex items-center gap-1 mt-1">
                <span>🌱</span> Catatan Adab
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🌟
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Aksi Cepat & Alur Kerja Utama Guru</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('tahfidz')}
            className="bg-white hover:bg-indigo-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-indigo-300 transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📖
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Setor Hafalan</div>
              <div className="text-[10px] text-slate-400">Tahfidz Al-Qur'an</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('presensi')}
            className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-emerald-300 transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              ✅
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Presensi Santri</div>
              <div className="text-[10px] text-slate-400">Absensi Harian</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('akhlak')}
            className="bg-white hover:bg-teal-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-teal-300 transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🌱
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">Nilai Akhlak</div>
              <div className="text-[10px] text-slate-400">Evaluasi Karakter</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('reward-pelanggaran')}
            className="bg-white hover:bg-rose-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-rose-300 transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🏅
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-rose-700 transition-colors">Prestasi & Warning</div>
              <div className="text-[10px] text-slate-400">Reward / Catatan</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('santri')}
            className="bg-white hover:bg-cyan-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-cyan-300 transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              👨‍🎓
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">Data Santri</div>
              <div className="text-[10px] text-slate-400">Daftar Santri Kelas</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('izin-pulang')}
            className="bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-amber-300 transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🏠
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Izin Pulang</div>
              <div className="text-[10px] text-slate-400">Rekap Perizinan</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Workspace Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Setoran Hafalan Terbaru */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Setoran Hafalan Terbaru</h3>
                <p className="text-xs text-slate-400">Aktivitas hafalan Al-Qur'an santri kelas ini</p>
              </div>
              <button
                onClick={() => setActiveTab('tahfidz')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition"
              >
                Lihat Semua ➔
              </button>
            </div>

            {tahfidzTerbaru.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-2">
                <span className="text-3xl">📖</span>
                <p className="text-xs text-slate-500 font-medium mt-2">Belum ada setoran hafalan terbaru untuk kelas ini.</p>
                <button
                  onClick={() => setActiveTab('tahfidz')}
                  className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
                >
                  + Tambah Setoran Hafalan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tahfidzTerbaru.map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-800 truncate">{t.santriNama}</div>
                      <div className="text-[11px] text-slate-500">
                        Juz {t.juz || '-'} · Surat {t.surat || '-'} (Ayat {t.ayat || '-'})
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Nilai: {t.nilai || 'Mumtaz'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{t.tanggal}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Catatan Karakter & Akhlak Terbaru */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Evaluasi Adab & Karakter</h3>
                <p className="text-xs text-slate-400">Catatan perkembangan akhlak harian</p>
              </div>
              <button
                onClick={() => setActiveTab('akhlak')}
                className="text-xs font-bold text-teal-600 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100 transition"
              >
                Lihat Semua ➔
              </button>
            </div>

            {akhlakTerbaru.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-2">
                <span className="text-3xl">🌱</span>
                <p className="text-xs text-slate-500 font-medium mt-2">Belum ada catatan evaluasi akhlak terdaftar.</p>
                <button
                  onClick={() => setActiveTab('akhlak')}
                  className="mt-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
                >
                  + Catat Evaluasi Akhlak
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {akhlakTerbaru.map((a) => {
                  const s = santriList.find((x) => x.id === a.santriId);
                  return (
                    <div key={a.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-800 truncate">{s?.nama || `Santri #${a.santriId}`}</div>
                        <div className="text-[11px] text-slate-500 italic truncate">{a.catatan || 'Evaluasi adab harian'}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {a.nilai}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{a.tanggal}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Presensi Santri Kelas Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Monitoring Kehadiran Santri Kelas Hari Ini</h3>
            <p className="text-xs text-slate-400">Daftar santri di kelas {kelasDiajarAktif} ({tanggalLokal()})</p>
          </div>
          <button
            onClick={() => setActiveTab('presensi')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition self-start sm:self-auto"
          >
            Input Presensi Harian ➔
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Nama Santri</th>
                <th className="p-4 px-6">NIS</th>
                <th className="p-4 px-6">Kelas</th>
                <th className="p-4 px-6">Status Kehadiran Hari Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {santriKelas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-slate-400">
                    Belum ada santri terdaftar untuk kelas ini
                  </td>
                </tr>
              ) : (
                santriKelas.map((s) => {
                  const status = presensiHariIniMap.get(s.id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 px-6 font-semibold text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {s.nama[0]}
                        </div>
                        {s.nama}
                      </td>
                      <td className="p-4 px-6 text-slate-600 text-xs font-mono">{s.nis || '-'}</td>
                      <td className="p-4 px-6 text-slate-600 font-medium text-xs">{s.kelas}</td>
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
