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
  jenisKelaminDiampuAktif: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardMusyrif({
  namaAktif,
  pegawaiAktif,
  santriList,
  presensiSantri,
  presensiPegawai,
  nilaiAkhlakList,
  izinPulangList,
  jenisKelaminDiampuAktif,
  setActiveTab,
}: Props) {
  const hariIni = tanggalLokal();

  // Filter santri for Musyrif's dormitory gender scope
  const santriAsrama = santriList.filter(
    (s) =>
      !jenisKelaminDiampuAktif ||
      jenisKelaminDiampuAktif === 'Semua' ||
      s.jenisKelamin === jenisKelaminDiampuAktif
  );

  const totalSantriAsrama = santriAsrama.length;

  // Presensi Santri Asrama Hari Ini
  const presensiHariIniMap = new Map(
    presensiSantri
      .filter((p) => p.tanggal === hariIni)
      .map((p) => [p.santriId, p.status])
  );

  let countHadir = 0;
  let countSakit = 0;
  let countIzin = 0;
  let countAlfa = 0;

  santriAsrama.forEach((s) => {
    const st = presensiHariIniMap.get(s.id);
    if (st === 'Hadir') countHadir++;
    else if (st === 'Sakit') countSakit++;
    else if (st === 'Izin') countIzin++;
    else if (st === 'Alfa') countAlfa++;
  });

  // Pending Izin Pulang needing Musyrif ACC
  const santriAsramaIdsSet = new Set(santriAsrama.map((s) => s.id));
  const pendingIzinPulang = izinPulangList.filter(
    (i) => santriAsramaIdsSet.has(i.santriId) && i.status === 'Menunggu'
  );

  // Nilai Akhlak for santri in Asrama
  const akhlakAsrama = nilaiAkhlakList.filter((a) => santriAsramaIdsSet.has(a.santriId));
  const akhlakTerbaru = akhlakAsrama.slice(0, 5);

  const labelScopeAsrama =
    jenisKelaminDiampuAktif === 'L'
      ? 'Asrama Putra (Ikhwan)'
      : jenisKelaminDiampuAktif === 'P'
      ? 'Asrama Putri (Akhwat)'
      : 'Seluruh Asrama';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Card Musyrif */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-900 via-blue-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-cyan-950/20 border border-cyan-600/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cyan-400/20 text-cyan-200 text-xs px-3 py-1 rounded-full font-bold border border-cyan-300/30 uppercase tracking-wider">
                🕌 Dashboard Musyrif Asrama
              </span>
              <span className="bg-white/10 text-cyan-100 text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                Scope: {labelScopeAsrama}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Selamat datang kembali, Ust. {namaAktif}!
            </h1>
            <p className="text-cyan-100/90 text-xs sm:text-sm mt-1.5 font-normal max-w-2xl">
              Pantau ketertiban asrama, presensi santri, evaluasi adab/perilaku, dan persetujuan perizinan pulang ({tanggalLokal()}).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-left md:text-right shrink-0">
            <div className="text-[10px] text-cyan-200 uppercase tracking-wider font-semibold">Santri Asrama Diampu</div>
            <div className="text-2xl font-black text-amber-300 flex items-center gap-1.5 md:justify-end">
              🕌 {totalSantriAsrama} <span className="text-xs font-normal text-white">Santri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Presensi Saya (Pegawai Mandiri) */}
      <PresensiSaya pegawaiId={pegawaiAktif?.id ?? null} presensiPegawai={presensiPegawai} />

      {/* Stat Summary Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ikhtisar Aktivitas Asrama</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presensi Asrama</h3>
              <p className="text-3xl font-black text-emerald-600 mt-1">{countHadir} <span className="text-xs font-semibold text-slate-400">/ {totalSantriAsrama}</span></p>
              <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 mt-1">
                <span>✓</span> {countHadir} Hadir di Asrama
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-inner">
              📋
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Antrean ACC Izin</h3>
              <p className={`text-3xl font-black mt-1 ${pendingIzinPulang.length > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {pendingIzinPulang.length}
              </p>
              <span className={`text-[11px] font-semibold inline-flex items-center gap-1 mt-1 ${pendingIzinPulang.length > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                <span>🏠</span> {pendingIzinPulang.length > 0 ? 'Menunggu ACC Musyrif' : 'Semua Izin Diproses'}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-2xl font-bold flex items-center justify-center text-xl shadow-inner ${pendingIzinPulang.length > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
              🏠
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catatan Akhlak Asrama</h3>
              <p className="text-3xl font-black text-teal-600 mt-1">{akhlakAsrama.length}</p>
              <span className="text-[11px] font-semibold text-teal-600 inline-flex items-center gap-1 mt-1">
                <span>🌱</span> Kedisiplinan & Adab
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🌟
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Santri Sakit / Izin</h3>
              <p className="text-3xl font-black text-rose-600 mt-1">{countSakit + countIzin}</p>
              <span className="text-[11px] font-semibold text-rose-600 inline-flex items-center gap-1 mt-1">
                <span>🤒</span> Dalam Pemantauan
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🏥
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Aksi Cepat & Alur Kerja Musyrif</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('presensi')}
            className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-emerald-300 transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📋
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Presensi Asrama</div>
              <div className="text-[10px] text-slate-400">Absensi Harian / Malam</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tahfidz')}
            className="bg-white hover:bg-indigo-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-indigo-300 transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📖
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Setor Hafalan</div>
              <div className="text-[10px] text-slate-400">Tahfidz Asrama</div>
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
              <div className="text-[10px] text-slate-400">Kedisiplinan Asrama</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('izin-pulang')}
            className="bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-amber-300 transition-all text-left flex flex-col items-start gap-2 group relative"
          >
            {pendingIzinPulang.length > 0 && (
              <span className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                {pendingIzinPulang.length}
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🏠
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">ACC Izin Pulang</div>
              <div className="text-[10px] text-slate-400">Persetujuan Perizinan</div>
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
              <div className="text-xs font-bold text-slate-800 group-hover:text-rose-700 transition-colors">Reward &amp; Pelanggaran</div>
              <div className="text-[10px] text-slate-400">Prestasi &amp; Catatan</div>
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
              <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">Data Santri &amp; Asrama</div>
              <div className="text-[10px] text-slate-400">Kamar &amp; Kamar Santri</div>
            </div>
          </button>
        </div>
      </div>

      {/* Pending Approvals Queue & Akhlak Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antrean ACC Izin Pulang */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span>Antrean Persetujuan Izin Pulang</span>
                  {pendingIzinPulang.length > 0 && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      {pendingIzinPulang.length} Pengajuan
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">Permohonan izin dari santri asrama</p>
              </div>
              <button
                onClick={() => setActiveTab('izin-pulang')}
                className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 transition"
              >
                Modul Izin ➔
              </button>
            </div>

            {pendingIzinPulang.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-2">
                <span className="text-3xl">🎉</span>
                <p className="text-xs text-slate-500 font-medium mt-2">Tidak ada pengajuan izin pulang yang menunggu persetujuan Musyrif saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingIzinPulang.slice(0, 5).map((iz) => {
                  const s = santriList.find((x) => x.id === iz.santriId);
                  return (
                    <div key={iz.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">{s?.nama || `Santri #${iz.santriId}`} ({s?.asrama || 'Asrama'})</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          📅 Keluar: <span className="font-semibold text-slate-800">{iz.tanggalKeluar}</span> ➔ Kembali: <span className="font-semibold text-slate-800">{iz.tanggalKembali}</span>
                        </div>
                        <div className="text-[10px] text-amber-700 italic mt-0.5 truncate">Alasan: "{iz.alasan}"</div>
                      </div>
                      <button
                        onClick={() => setActiveTab('izin-pulang')}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition shrink-0"
                      >
                        Proses ACC ➔
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Evaluasi Akhlak & Kedisiplinan Terbaru */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Evaluasi Adab & Kedisiplinan</h3>
                <p className="text-xs text-slate-400">Catatan perilaku santri di asrama</p>
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
                <p className="text-xs text-slate-500 font-medium mt-2">Belum ada catatan evaluasi akhlak terdaftar di asrama.</p>
                <button
                  onClick={() => setActiveTab('akhlak')}
                  className="mt-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
                >
                  + Catat Kedisiplinan Santri
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

      {/* Presensi Santri Asrama Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Monitoring Kehadiran Santri Asrama Hari Ini</h3>
            <p className="text-xs text-slate-400">Daftar santri di {labelScopeAsrama} ({tanggalLokal()})</p>
          </div>
          <button
            onClick={() => setActiveTab('presensi')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition self-start sm:self-auto"
          >
            Presensi Asrama ➔
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Nama Santri</th>
                <th className="p-4 px-6">Asrama / Kamar</th>
                <th className="p-4 px-6">Kelas</th>
                <th className="p-4 px-6">Status Kehadiran Asrama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {santriAsrama.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-slate-400">
                    Belum ada santri terdaftar untuk asrama ini
                  </td>
                </tr>
              ) : (
                santriAsrama.map((s) => {
                  const status = presensiHariIniMap.get(s.id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 px-6 font-semibold text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {s.nama[0]}
                        </div>
                        {s.nama}
                      </td>
                      <td className="p-4 px-6 text-slate-600 text-xs font-medium">{s.asrama || 'Asrama Utama'}</td>
                      <td className="p-4 px-6 text-slate-600 text-xs font-medium">{s.kelas}</td>
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
