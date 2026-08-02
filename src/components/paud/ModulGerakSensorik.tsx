import React, { useState, useEffect } from 'react';
import {
  MuridPaud,
  AktivitasSensorik,
  IndikatorObservasiSensorik,
  EvaluasiGerakSensorik,
  StatusPenilaianSensorik,
  KelompokUsiaSensorik
} from '../../types/paudTypes';
import {
  SEED_AKTIVITAS_SENSORIK,
  SEED_INDIKATOR_SENSORIK,
  hitungKelompokUsiaFromBirthdate
} from '../../data/gerakSensorikData';
import { soundFx } from '../../utils/soundEffects';

interface ModulGerakSensorikProps {
  daftarMurid: MuridPaud[];
  activeTenantId: string;
  onSaveEvaluasi?: (evaluasi: EvaluasiGerakSensorik) => void;
}

export const ModulGerakSensorik: React.FC<ModulGerakSensorikProps> = ({
  daftarMurid,
  activeTenantId,
  onSaveEvaluasi
}) => {
  const [selectedMuridId, setSelectedMuridId] = useState<string>(daftarMurid[0]?.id || '');
  const [overrideAgeGroup, setOverrideAgeGroup] = useState<KelompokUsiaSensorik | null>(null);
  const [activeKategori, setActiveKategori] = useState<string>('semua');
  const [filterIndoorOutdoor, setFilterIndoorOutdoor] = useState<'semua' | 'indoor' | 'outdoor'>('semua');

  // TIMER & SESI ACTIVE STATE
  const [selectedAktivitasId, setSelectedAktivitasId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // LOCAL PERSISTENCE RECORD PER TENANT
  const [evaluasiList, setEvaluasiList] = useState<EvaluasiGerakSensorik[]>(() => {
    try {
      const saved = localStorage.getItem(`paud_sensorik_${activeTenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(`paud_sensorik_${activeTenantId}`, JSON.stringify(evaluasiList));
    } catch {
      // Storage error
    }
  }, [evaluasiList, activeTenantId]);

  const selectedMurid = daftarMurid.find((m) => m.id === selectedMuridId) || daftarMurid[0];
  const autoAgeGroup = hitungKelompokUsiaFromBirthdate(selectedMurid?.tanggalLahir, selectedMurid?.kategoriUsia);
  const currentAgeGroup = overrideAgeGroup || autoAgeGroup;

  // URUTAN SESI SEIMBANG: Vestibular ➔ Visual-Motor ➔ Taktil ➔ Proprioseptif
  const getSessionOrderedActivities = (list: AktivitasSensorik[]) => {
    const orderMap: Record<string, number> = {
      'Vestibular': 1,
      'Visual-Motor': 2,
      'Taktil': 3,
      'Brain Gym': 4,
      'Proprioseptif': 5
    };
    return [...list].sort((a, b) => (orderMap[a.kategori] || 99) - (orderMap[b.kategori] || 99));
  };

  const filteredAktivitasList = getSessionOrderedActivities(
    SEED_AKTIVITAS_SENSORIK.filter((a) => {
      const matchAge = a.kelompokUsia === currentAgeGroup;
      const matchKat = activeKategori === 'semua' || a.kategori === activeKategori;
      const matchIn = filterIndoorOutdoor === 'semua' || (filterIndoorOutdoor === 'indoor' && a.bisaIndoor) || (filterIndoorOutdoor === 'outdoor' && a.bisaOutdoor);
      return matchAge && matchKat && matchIn;
    })
  );

  const filteredIndikatorList = SEED_INDIKATOR_SENSORIK.filter((i) => i.kelompokUsia === currentAgeGroup);

  const activeAktivitas = SEED_AKTIVITAS_SENSORIK.find((a) => a.id === selectedAktivitasId) || filteredAktivitasList[0] || SEED_AKTIVITAS_SENSORIK[0];

  useEffect(() => {
    if (activeAktivitas) {
      setTimeLeft(activeAktivitas.durasiDetik);
      setIsTimerRunning(false);
    }
  }, [activeAktivitas?.id]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      soundFx.playFanfare();
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const handleAssessmentSubmit = (indikatorId: string, status: StatusPenilaianSensorik) => {
    if (!selectedMuridId) return;
    soundFx.playSuccess();

    const newEval: EvaluasiGerakSensorik = {
      id: `eval-sens-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId: activeTenantId,
      muridId: selectedMuridId,
      indikatorId: indikatorId,
      status: status,
      tanggal: new Date().toISOString().split('T')[0]
    };

    const updatedList = [newEval, ...evaluasiList.filter((e) => !(e.muridId === selectedMuridId && e.indikatorId === indikatorId))];
    setEvaluasiList(updatedList);

    if (onSaveEvaluasi) onSaveEvaluasi(newEval);
  };

  const getStudentAssessmentStatus = (indikatorId: string): StatusPenilaianSensorik | null => {
    const found = evaluasiList.find((e) => e.muridId === selectedMuridId && e.indikatorId === indikatorId);
    return found ? (found.status as StatusPenilaianSensorik) : null;
  };

  // NIKLAI PERSENTASE (Opsi "Belum Waktunya" Dikeluarkan dari Perhitungan Penyebut)
  const calculateStudentScore = () => {
    const studentEvals = evaluasiList.filter((e) => e.muridId === selectedMuridId);
    const validEvals = studentEvals.filter((e) => e.status !== 'belum_waktunya');
    if (validEvals.length === 0) return { percent: 0, totalValid: 0, bisaCount: 0 };
    const bisaCount = validEvals.filter((e) => e.status === 'bisa').length;
    const percent = Math.round((bisaCount / validEvals.length) * 100);
    return { percent, totalValid: validEvals.length, bisaCount };
  };

  const scoreInfo = calculateStudentScore();

  return (
    <div className="bg-gradient-to-b from-teal-50 via-emerald-50 to-cyan-100 min-h-full p-4 md:p-6 rounded-3xl shadow-lg border-4 border-teal-200 space-y-6">
      {/* HEADER DAN SELEKTOR MURID */}
      <div className="bg-white/95 backdrop-blur p-5 rounded-3xl shadow-md border border-teal-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-black uppercase text-teal-700 tracking-wider bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
            Modul Pembelajaran & Asesmen Fisik
          </span>
          <h2 className="text-2xl font-black text-teal-950 mt-1 flex items-center gap-2">
            <span>🧘</span> Modul Gerak & Sensorik
          </h2>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">
            Melatih koordinasi tubuh, keseimbangan, serta kesiapan tumpuan jemari untuk menulis.
          </p>
        </div>

        {/* Pilihn Murid & Kelompok Usia */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Murid:</label>
            <select
              value={selectedMuridId}
              onChange={(e) => { soundFx.playPop(); setSelectedMuridId(e.target.value); setOverrideAgeGroup(null); }}
              className="p-2.5 rounded-2xl border-2 border-teal-200 text-sm font-bold text-teal-900 bg-teal-50/50 focus:ring-2 focus:ring-teal-400"
            >
              {daftarMurid.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fotoEmoji} {m.nama} ({m.kategoriUsia.replace('_tahun', ' Thn')})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-teal-600 text-white px-3 py-2 rounded-2xl shadow">
                Usia Terkunci: {currentAgeGroup} Tahun
              </span>
              <button
                onClick={() => {
                  soundFx.playPop();
                  const nextGroup = currentAgeGroup === '2-3' ? '3-4' : currentAgeGroup === '3-4' ? '4-5' : '2-3';
                  setOverrideAgeGroup(nextGroup);
                }}
                className="text-[11px] font-bold text-teal-800 bg-white border border-teal-300 hover:bg-teal-100 px-3 py-2 rounded-2xl shadow-sm"
              >
                🔄 Lihat kelompok usia lain
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BAGIAN 6 - RAMBU KESELAMATAN PERMANEN (TIDAK BISA DISEMBUNYIKAN) */}
      <div className="bg-rose-50 border-4 border-rose-300 p-5 rounded-3xl shadow-md space-y-2">
        <h3 className="text-sm font-black text-rose-950 uppercase tracking-wider flex items-center gap-2">
          <span>⚠️</span> RAMBU KESELAMATAN (Wajib Dipatuhi Guru):
        </h3>
        <ul className="text-xs text-rose-900 font-semibold space-y-1.5 list-disc list-inside">
          <li><strong>Jangan memaksa anak yang takut bergerak:</strong> Anak yang takut ketinggian atau gerakan sebaiknya memulai sambil duduk atau berbaring, bukan berdiri.</li>
          <li><strong>Berputar maksimal 3 kali lalu istirahat:</strong> Hentikan segera bila anak mengeluh pusing atau mual.</li>
          <li><strong>Hentikan aktivitas bila anak menangis, menegang, atau menolak:</strong> Selalu utamakan kenyamanan emosi anak.</li>
          <li><strong>Anak yang sering menggigit baju atau pensil:</strong> Biasanya sedang mencari rangsang sentuh. Berikan aktivitas taktil dan proprioseptif, bukan teguran.</li>
        </ul>
      </div>

      {/* RINCIAN AKTIVITAS & SESI SEIMBANG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI: LIST AKTIVITAS DENGAN FILTER & URUTAN SESI */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex justify-between items-center bg-white/90 p-3 rounded-2xl border border-teal-100">
            <span className="text-xs font-black text-teal-900">Urutan Sesi Seimbang ({filteredAktivitasList.length}):</span>
            <select
              value={filterIndoorOutdoor}
              onChange={(e) => setFilterIndoorOutdoor(e.target.value as any)}
              className="text-xs font-bold p-1.5 rounded-xl border border-teal-200 bg-teal-50"
            >
              <option value="semua">Semua Lokasi</option>
              <option value="indoor">🏠 Indoor Sahaja</option>
              <option value="outdoor">🌿 Outdoor Sahaja</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredAktivitasList.map((akt) => {
              const isSelected = activeAktivitas.id === akt.id;
              return (
                <div
                  key={akt.id}
                  onClick={() => { soundFx.playPop(); setSelectedAktivitasId(akt.id); }}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border-2 flex items-center justify-between ${
                    isSelected ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-102' : 'bg-white text-slate-800 border-teal-100 hover:bg-teal-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{akt.ikon || '🧘'}</span>
                    <div>
                      <h4 className="font-black text-xs">{akt.nama}</h4>
                      <div className="flex gap-1.5 items-center mt-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-900'
                        }`}>
                          {akt.kategori}
                        </span>
                        <span className="text-[9px] opacity-80">{akt.bisaIndoor ? '🏠 Indoor' : '🌿 Outdoor'}</span>
                      </div>
                    </div>
                  </div>
                  {akt.catatanKeamanan && <span className="text-base" title="Ada Catatan Keamanan">⚠️</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* KOLOM TENGAH & KANAN: DETAIL AKTIVITAS & INDIKATOR OBSERVASI */}
        <div className="lg:col-span-2 space-y-6">
          {/* DETAIL AKTIVITAS TERPILIH */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-teal-100 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-black uppercase bg-teal-100 text-teal-900 px-3 py-1 rounded-full border border-teal-200">
                  {activeAktivitas.kategori} • Usia {activeAktivitas.kelompokUsia} Tahun
                </span>
                <h3 className="text-2xl font-black text-teal-950 mt-2 flex items-center gap-2">
                  <span>{activeAktivitas.ikon || '🧘'}</span> {activeAktivitas.nama}
                </h3>
              </div>

              {/* TIMER INTERAKTIF */}
              <div className="bg-teal-50 p-3 rounded-2xl border border-teal-200 text-center min-w-[130px]">
                <div className="text-2xl font-black text-teal-900">
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
                <div className="flex justify-center gap-1 mt-1">
                  <button
                    onClick={() => { soundFx.playPop(); setIsTimerRunning(!isTimerRunning); }}
                    className={`px-2 py-1 text-[11px] font-bold text-white rounded-lg shadow ${
                      isTimerRunning ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                  >
                    {isTimerRunning ? 'Pause ⏸️' : 'Mulai ▶️'}
                  </button>
                  <button
                    onClick={() => { soundFx.playPop(); setIsTimerRunning(false); setTimeLeft(activeAktivitas.durasiDetik); }}
                    className="px-2 py-1 text-[11px] font-bold bg-slate-200 text-slate-700 rounded-lg"
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 space-y-2 text-xs">
              <h4 className="font-bold text-teal-900 uppercase">Cara Melakukan (Bahasa Guru):</h4>
              <p className="text-slate-700 font-semibold leading-relaxed">{activeAktivitas.caraMelakukan}</p>

              <div className="pt-2 flex flex-wrap gap-2 items-center">
                <span className="font-bold text-slate-700">Alat Dibutuhkan:</span>
                {activeAktivitas.alatDibutuhkan.map((alat, i) => (
                  <span key={i} className="bg-white border border-teal-200 text-teal-900 font-bold px-2 py-0.5 rounded-lg">
                    📦 {alat}
                  </span>
                ))}
              </div>
            </div>

            {/* RAMBU KEAMANAN SPESIFIK AKTIVITAS */}
            {activeAktivitas.catatanKeamanan && (
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center gap-2 text-xs text-amber-900 font-bold">
                <span className="text-xl">⚠️</span>
                <span>Catatan Keamanan: {activeAktivitas.catatanKeamanan}</span>
              </div>
            )}
          </div>

          {/* INDIKATOR OBSERVASI & PENILAIAN 3 OPSI (Bisa / Coba Lagi / Belum Waktunya) */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-teal-100 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h4 className="font-black text-teal-950 text-base flex items-center gap-2">
                  <span>📋</span> Lembar Observasi {selectedMurid?.nama} (Usia {currentAgeGroup} Tahun)
                </h4>
                <p className="text-xs text-slate-500">Pernyataan terukur yang diamati langsung oleh mata guru.</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  Capaian: {scoreInfo.percent}% ({scoreInfo.bisaCount}/{scoreInfo.totalValid} Indikator)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {filteredIndikatorList.map((ind) => {
                const currentStatus = getStudentAssessmentStatus(ind.id);
                return (
                  <div key={ind.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <span className="text-xs font-bold text-slate-800 flex-1">
                      🔹 {ind.pernyataan}
                    </span>

                    {/* 3 OPSI TOMBOL PENILAIAN */}
                    <div className="flex gap-1.5 w-full md:w-auto">
                      <button
                        onClick={() => handleAssessmentSubmit(ind.id, 'bisa')}
                        className={`flex-1 md:flex-none px-3 py-1.5 rounded-xl font-black text-xs transition-transform active:scale-95 border ${
                          currentStatus === 'bisa'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow ring-2 ring-emerald-300'
                            : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                        }`}
                      >
                        ✅ Bisa
                      </button>

                      <button
                        onClick={() => handleAssessmentSubmit(ind.id, 'coba_lagi')}
                        className={`flex-1 md:flex-none px-3 py-1.5 rounded-xl font-black text-xs transition-transform active:scale-95 border ${
                          currentStatus === 'coba_lagi'
                            ? 'bg-amber-500 text-white border-amber-600 shadow ring-2 ring-amber-300'
                            : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                        }`}
                      >
                        🔄 Coba Lagi
                      </button>

                      <button
                        onClick={() => handleAssessmentSubmit(ind.id, 'belum_waktunya')}
                        className={`flex-1 md:flex-none px-3 py-1.5 rounded-xl font-black text-xs transition-transform active:scale-95 border ${
                          currentStatus === 'belum_waktunya'
                            ? 'bg-slate-500 text-white border-slate-600 shadow ring-2 ring-slate-300'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        ⏳ Belum Waktunya
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
