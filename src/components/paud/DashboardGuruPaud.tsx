import React, { useState, useEffect } from 'react';
import {
  MuridPaud,
  RekapMuridPaud,
  BulanCurriculum,
  KategoriUsiaSpesifik,
  HariAktif,
  StatusObservasiAdab,
  CatatanObservasiHarian,
  CatatanAdabMingguan
} from '../../types/paudTypes';
import { KEBIASAAN_ADAB_LIST, KURIKULUM_BULAN_1_LIST } from '../../data/kurikulum5HariData';
import { soundFx } from '../../utils/soundEffects';
import { GameSosialBahasa } from './GameSosialBahasa';
import { GaleriPerkembanganAnak } from './GaleriPerkembanganAnak';

interface DashboardGuruPaudProps {
  daftarRekapMurid: RekapMuridPaud[];
  activeTenantId?: string;
  initialTab?: 'rapor' | 'kurikulum' | 'harian';
  onAddMurid?: (murid: MuridPaud) => void;
  onSelectChildForPlay?: (murid: MuridPaud) => void;
}

export const DashboardGuruPaud: React.FC<DashboardGuruPaudProps> = ({
  daftarRekapMurid,
  activeTenantId = 'tenant-paud-01',
  initialTab = 'harian',
  onAddMurid,
  onSelectChildForPlay
}) => {
  const [activeTabGuru, setActiveTabGuru] = useState<'rapor' | 'kurikulum' | 'harian'>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTabGuru(initialTab);
  }, [initialTab]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMuridId, setSelectedMuridId] = useState<string | null>(daftarRekapMurid[0]?.id || null);
  const [selectedSemesterPlan, setSelectedSemesterPlan] = useState<1 | 2>(1);
  const [selectedBulanPlan, setSelectedBulanPlan] = useState<BulanCurriculum>(1);

  // KURIKULUM 5 HARI HARIAN STATE
  const [activeHari, setActiveHari] = useState<HariAktif>('senin');
  const [activeMinggu, setActiveMinggu] = useState<number>(1);
  const [selectedAgeLevel, setSelectedAgeLevel] = useState<'usia2_3' | 'usia4' | 'usia5'>('usia4');
  const [showAlternatives, setShowAlternatives] = useState<boolean>(false);
  const [showIndoorRain, setShowIndoorRain] = useState<boolean>(false);
  const [showGameModal, setShowGameModal] = useState<'tebak_perasaan' | 'sambung_cerita' | null>(null);

  // FORM TAMBAH MURID STATE
  const [namaMurid, setNamaMurid] = useState('');
  const [panggilan, setPanggilan] = useState('');
  const [kategoriUsia, setKategoriUsia] = useState<KategoriUsiaSpesifik>('3_tahun');
  const [fotoEmoji, setFotoEmoji] = useState('👶');
  const [namaAyah, setNamaAyah] = useState('');
  const [namaIbu, setNamaIbu] = useState('');
  const [kontakOrangTua, setKontakOrangTua] = useState('');

  // OBSERVASILOGS & TENANT ISOLATION PERSISTENCE
  const [catatanObservasiList, setCatatanObservasiList] = useState<CatatanObservasiHarian[]>(() => {
    try {
      const saved = localStorage.getItem(`paud_observasi_${activeTenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Storage fallback
    }
    return [];
  });

  const [catatanAdabList, setCatatanAdabList] = useState<CatatanAdabMingguan[]>(() => {
    try {
      const saved = localStorage.getItem(`paud_adab_${activeTenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Storage fallback
    }
    return [];
  });

  // Save LocalStorage per tenantId
  useEffect(() => {
    try {
      localStorage.setItem(`paud_observasi_${activeTenantId}`, JSON.stringify(catatanObservasiList));
    } catch {
      // Storage fallback
    }
  }, [catatanObservasiList, activeTenantId]);

  useEffect(() => {
    try {
      localStorage.setItem(`paud_adab_${activeTenantId}`, JSON.stringify(catatanAdabList));
    } catch {
      // Storage fallback
    }
  }, [catatanAdabList, activeTenantId]);

  const selectedChild = daftarRekapMurid.find((m) => m.id === selectedMuridId) || daftarRekapMurid[0];
  const adabMingguIni = KEBIASAAN_ADAB_LIST.find((a) => a.mingguKe === activeMinggu) || KEBIASAAN_ADAB_LIST[0];
  const kegiatanHariIni = KURIKULUM_BULAN_1_LIST.find(
    (k) => k.bulan === 1 && k.mingguKe === activeMinggu && k.hari === activeHari
  ) || KURIKULUM_BULAN_1_LIST[0];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMurid.trim()) return;
    soundFx.playSuccess();
    const newChild: MuridPaud = {
      id: `m-${Date.now()}`,
      nama: namaMurid,
      panggilan: panggilan || namaMurid,
      kategoriUsia,
      fotoEmoji,
      namaAyah: namaAyah.trim() || undefined,
      namaIbu: namaIbu.trim() || undefined,
      kontakOrangTua: kontakOrangTua.trim() || undefined
    };
    if (onAddMurid) onAddMurid(newChild);
    setNamaMurid('');
    setPanggilan('');
    setNamaAyah('');
    setNamaIbu('');
    setKontakOrangTua('');
    setShowAddForm(false);
  };

  // Handler Simpan Observasi Harian Per Murid (Isolasi Tenant)
  const handleLogObservasiHarian = (
    muridId: string,
    status: StatusObservasiAdab,
    catatan?: string,
    fotoBase64?: string
  ) => {
    soundFx.playPop();
    const existing = catatanObservasiList.find((x) => x.muridId === muridId && x.kegiatanId === kegiatanHariIni.id);
    const newObs: CatatanObservasiHarian = {
      id: existing?.id || `obs-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      tenantId: activeTenantId,
      sekolahId: 'sch-01',
      kelasId: 'kelas-a',
      muridId,
      guruId: 'u-guru-1',
      tanggal: new Date().toISOString().split('T')[0],
      hari: activeHari,
      bulan: 1,
      mingguKe: activeMinggu,
      domainUtama: kegiatanHariIni.domainUtama,
      kegiatanId: kegiatanHariIni.id,
      kegiatanJudul: kegiatanHariIni.inti.judul,
      status,
      catatanGuru: catatan !== undefined ? catatan : existing?.catatanGuru,
      fotoUrl: fotoBase64 !== undefined ? fotoBase64 : existing?.fotoUrl,
      jenisPenilaian: 'manual'
    };
    setCatatanObservasiList((prev) => [newObs, ...prev.filter((x) => !(x.muridId === muridId && x.kegiatanId === kegiatanHariIni.id))]);
  };

  // Handler Simpan Observasi Adab Mingguan (Benang Harian)
  const handleLogAdabMingguan = (muridId: string, status: StatusObservasiAdab) => {
    soundFx.playPop();
    const newAdab: CatatanAdabMingguan = {
      id: `adab-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      tenantId: activeTenantId,
      muridId,
      mingguKe: activeMinggu,
      status
    };
    setCatatanAdabList((prev) => [newAdab, ...prev.filter((x) => !(x.muridId === muridId && x.mingguKe === activeMinggu))]);
  };

  const getPercentageColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500 text-white';
    if (score >= 60) return 'bg-blue-500 text-white';
    if (score >= 40) return 'bg-amber-500 text-white';
    return 'bg-rose-500 text-white';
  };

  return (
    <div className="bg-slate-50 min-h-full p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      {/* Header Panel Guru */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-indigo-900 text-white p-6 rounded-3xl shadow-lg gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300">
            Kurikulum 5 Hari Per Minggu (Senin–Jumat) • Tenant: {activeTenantId}
          </span>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <span>👩‍🏫</span> Evaluasi & Pembelajaran CeritaAnanda PAUD
          </h2>
          <p className="text-indigo-200 text-sm mt-1">Panduan kegiatan harian lengkap, benang adab, & observasi perkembangan anak.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { soundFx.playPop(); setActiveTabGuru('harian'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeTabGuru === 'harian' ? 'bg-amber-400 text-indigo-950 shadow' : 'bg-indigo-800 text-indigo-200 hover:bg-indigo-700'
            }`}
          >
            <span>📅</span> Kurikulum 5 Hari Harian
          </button>

          <button
            onClick={() => { soundFx.playPop(); setActiveTabGuru('rapor'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeTabGuru === 'rapor' ? 'bg-amber-400 text-indigo-950 shadow' : 'bg-indigo-800 text-indigo-200 hover:bg-indigo-700'
            }`}
          >
            <span>📊</span> Rapor Siswa
          </button>

          <button
            onClick={() => { soundFx.playPop(); setActiveTabGuru('kurikulum'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              activeTabGuru === 'kurikulum' ? 'bg-amber-400 text-indigo-950 shadow' : 'bg-indigo-800 text-indigo-200 hover:bg-indigo-700'
            }`}
          >
            <span>🗓️</span> Peta 12 Bulan
          </button>

          <button
            onClick={() => { soundFx.playPop(); setShowAddForm(!showAddForm); }}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl shadow text-xs flex items-center gap-1.5 text-white"
          >
            <span>➕</span> {showAddForm ? 'Tutup' : 'Tambah Murid'}
          </button>
        </div>
      </div>

      {/* FORM TAMBAH MURID BARU */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-md space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">Tambah Profil Anak Didik Baru</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap Murid:</label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Bintang"
                value={namaMurid}
                onChange={(e) => setNamaMurid(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Panggilan:</label>
              <input
                type="text"
                placeholder="Contoh: Bintang"
                value={panggilan}
                onChange={(e) => setPanggilan(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Kategori Usia Spesifik:</label>
              <select
                value={kategoriUsia}
                onChange={(e) => setKategoriUsia(e.target.value as KategoriUsiaSpesifik)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-400"
              >
                <option value="2_tahun">Usia 2 Tahun</option>
                <option value="3_tahun">Usia 3 Tahun</option>
                <option value="4_tahun">Usia 4 Tahun</option>
                <option value="5_tahun">Usia 5 Tahun</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Avatar Emoji:</label>
              <div className="flex gap-2">
                {['👶', '👦', '👧', '🧸', '🦁', '🐰'].map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setFotoEmoji(e)}
                    className={`p-2 rounded-xl text-xl border ${fotoEmoji === e ? 'bg-indigo-100 border-indigo-500 scale-110' : 'bg-slate-50'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Ayah:</label>
              <input
                type="text"
                placeholder="Contoh: Abdullah"
                value={namaAyah}
                onChange={(e) => setNamaAyah(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Ibu:</label>
              <input
                type="text"
                placeholder="Contoh: Khadijah"
                value={namaIbu}
                onChange={(e) => setNamaIbu(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">No. WhatsApp / Kontak Orang Tua:</label>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={kontakOrangTua}
                onChange={(e) => setKontakOrangTua(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700">
            Simpan Murid 💾
          </button>
        </form>
      )}

      {/* TAB HARIAN: KURIKULUM 5 HARI & BENANG ADAB (MENONJOL) */}
      {activeTabGuru === 'harian' && (
        <div className="space-y-6">
          {/* BENANG ADAB HARIAN (CARD MENONJOL DI ATAS DASHBOARD GURU) */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-6 rounded-3xl shadow-xl space-y-4 border-4 border-amber-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-300/40 pb-3">
              <div>
                <span className="text-[11px] uppercase font-black tracking-widest bg-amber-900/40 px-3 py-1 rounded-full text-amber-200">
                  Benang Adab Harian (Minggu #{activeMinggu})
                </span>
                <h3 className="text-2xl font-black mt-1 flex items-center gap-2">
                  <span>✨</span> Kebiasaan Adab Minggu Ini: {adabMingguIni.judulAdab}
                </h3>
              </div>

              {/* Selector Minggu 1-4 */}
              <div className="flex items-center gap-1.5 bg-amber-950/30 p-1.5 rounded-2xl border border-amber-200/30">
                <span className="text-xs font-bold px-2 text-amber-200">Pilih Minggu:</span>
                {[1, 2, 3, 4].map((m) => (
                  <button
                    key={m}
                    onClick={() => { soundFx.playPop(); setActiveMinggu(m); }}
                    className={`w-8 h-8 rounded-xl font-black text-xs transition-transform active:scale-95 ${
                      activeMinggu === m ? 'bg-white text-amber-950 shadow scale-105' : 'text-amber-100 hover:bg-amber-800/50'
                    }`}
                  >
                    #{m}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm font-semibold text-amber-50 leading-relaxed">{adabMingguIni.deskripsi}</p>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-xs space-y-2">
              <h4 className="font-black text-amber-200 uppercase tracking-wider">Contoh Situasi Pengamatan Guru:</h4>
              <p className="italic text-white">"{adabMingguIni.contohSituasi}"</p>
            </div>

            {/* QUICK OBSERVATION BENANG ADAB PER MURID */}
            <div className="bg-white/95 text-slate-900 p-4 rounded-2xl space-y-3 shadow-inner">
              <h4 className="font-black text-amber-950 text-xs uppercase tracking-wider flex justify-between items-center">
                <span>Catat Perkembangan Kebiasaan Adab Minggu Ini Per Anak:</span>
                <span className="text-[10px] text-slate-500 font-normal">Tersimpan Otomatis per Tenant ({activeTenantId})</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {daftarRekapMurid.map((m) => {
                  const adabLog = catatanAdabList.find((a) => a.muridId === m.id && a.mingguKe === activeMinggu);
                  return (
                    <div key={m.id} className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.fotoEmoji}</span>
                        <span className="font-bold text-slate-800">{m.panggilan}</span>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLogAdabMingguan(m.id, 'belum_terlihat')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            adabLog?.status === 'belum_terlihat' ? 'bg-rose-600 text-white' : 'bg-white border text-slate-700 hover:bg-rose-50'
                          }`}
                        >
                          Belum
                        </button>
                        <button
                          onClick={() => handleLogAdabMingguan(m.id, 'mulai_muncul')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            adabLog?.status === 'mulai_muncul' ? 'bg-amber-600 text-white' : 'bg-white border text-slate-700 hover:bg-amber-50'
                          }`}
                        >
                          Mulai
                        </button>
                        <button
                          onClick={() => handleLogAdabMingguan(m.id, 'muncul_sendiri')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            adabLog?.status === 'muncul_sendiri' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700 hover:bg-emerald-50'
                          }`}
                        >
                          Sendiri
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PEMILIH HARI AKTIF (SENIN - JUMAT) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>🗓️</span> Pilih Hari Kegiatan Aktif (Minggu #{activeMinggu}):
              </h3>

              {/* Selector Usia Difficulty Level */}
              <div className="flex items-center gap-1.5 bg-indigo-50 p-1.5 rounded-2xl border border-indigo-100 text-xs">
                <span className="font-bold text-indigo-900 px-2">Tingkat Usia:</span>
                {[
                  { id: 'usia2_3', label: '2-3 Thn' },
                  { id: 'usia4', label: '4 Thn' },
                  { id: 'usia5', label: '5 Thn' }
                ].map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { soundFx.playPop(); setSelectedAgeLevel(u.id as 'usia2_3' | 'usia4' | 'usia5'); }}
                    className={`px-3 py-1 rounded-xl font-bold transition-all ${
                      selectedAgeLevel === u.id ? 'bg-indigo-600 text-white shadow' : 'bg-white text-indigo-800 hover:bg-indigo-100'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB HARI SENIN-JUMAT */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { hari: 'senin', label: 'SENIN', domain: 'Logika & Kognitif', ikon: '🧠', color: 'border-amber-400' },
                { hari: 'selasa', label: 'SELASA', domain: 'Motorik Halus', ikon: '✍️', color: 'border-pink-400' },
                { hari: 'rabu', label: 'RABU (OUTDOOR)', domain: 'Motorik Kasar & Olahraga', ikon: '🏃‍♂️', color: 'border-sky-400' },
                { hari: 'kamis', label: 'KAMIS', domain: 'Sosial-Emosional & Bahasa', ikon: '💬', color: 'border-purple-400' },
                { hari: 'jumat', label: 'JUMAT', domain: 'Nilai Agama & Akhlak', ikon: '🤲', color: 'border-emerald-400' }
              ].map((h) => (
                <button
                  key={h.hari}
                  onClick={() => {
                    soundFx.playPop();
                    setActiveHari(h.hari as HariAktif);
                    setShowAlternatives(false);
                    setShowIndoorRain(false);
                  }}
                  className={`p-3 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                    activeHari === h.hari
                      ? 'bg-indigo-900 text-white border-indigo-900 shadow-lg scale-102 ring-2 ring-indigo-300'
                      : `bg-slate-50 text-slate-800 hover:bg-indigo-50 ${h.color}`
                  }`}
                >
                  <div className="text-[10px] font-black uppercase opacity-75">{h.label}</div>
                  <div className="font-black text-sm mt-1 flex items-center gap-1">
                    <span>{h.ikon}</span> {h.domain}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DISPLAY CARD KEGIATAN HARIAN (PEMBUKA, INTI, PENUTUP) */}
          <div className="bg-white p-6 rounded-3xl border-2 border-indigo-100 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full border border-indigo-200">
                    Hari {activeHari.toUpperCase()} • Domain {kegiatanHariIni.domainUtama.replace('_', ' ').toUpperCase()}
                  </span>
                  {kegiatanHariIni.isOutdoor && (
                    <span className="text-xs font-black uppercase bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                      🌿 KHUSUS LUAR RUANGAN / OUTDOOR
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-2">{kegiatanHariIni.inti.judul}</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {kegiatanHariIni.isOutdoor && kegiatanHariIni.cadanganIndoor && (
                  <button
                    onClick={() => { soundFx.playPop(); setShowIndoorRain(!showIndoorRain); }}
                    className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
                  >
                    <span>🌧️</span> {showIndoorRain ? 'Tutup Cadangan Hujan' : 'Cadangan Indoor Hujan'}
                  </button>
                )}

                <button
                  onClick={() => { soundFx.playPop(); setShowAlternatives(!showAlternatives); }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
                >
                  <span>🔄</span> {showAlternatives ? 'Sembunyikan Alternatif' : 'Lihat 2 Kegiatan Alternatif'}
                </button>

                {kegiatanHariIni.gameIdRef && (
                  <button
                    onClick={() => {
                      soundFx.playSuccess();
                      if (kegiatanHariIni.gameIdRef === 'tebak_perasaan') setShowGameModal('tebak_perasaan');
                      else if (kegiatanHariIni.gameIdRef === 'sambung_cerita') setShowGameModal('sambung_cerita');
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs rounded-xl shadow flex items-center gap-1"
                  >
                    <span>🎮</span> Main Game Pendukung Layar
                  </button>
                )}
              </div>
            </div>

            {/* CADANGAN INDOOR SAAT HUJAN (KHUSUS HARI RABU) */}
            {showIndoorRain && kegiatanHariIni.cadanganIndoor && (
              <div className="bg-sky-50 p-5 rounded-2xl border-2 border-sky-300 space-y-2 animate-fadeIn">
                <span className="text-xs font-black uppercase text-sky-900 bg-sky-200 px-2.5 py-0.5 rounded-full">
                  🌧️ Versi Cadangan Dalam Ruangan (Jika Hujan Berlangsung)
                </span>
                <h4 className="text-lg font-black text-sky-950">{kegiatanHariIni.cadanganIndoor.judul}</h4>
                <p className="text-xs text-sky-800 font-semibold">{kegiatanHariIni.cadanganIndoor.deskripsi}</p>
                <div className="pt-2">
                  <h5 className="text-xs font-bold text-sky-900 uppercase">Instruksi Guru Saat Hujan:</h5>
                  <ul className="text-xs text-slate-700 list-disc list-inside space-y-1 mt-1">
                    {kegiatanHariIni.cadanganIndoor.instruksiGuru.map((ins, i) => (
                      <li key={i}>{ins}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TOGGLE 2 KEGIATAN ALTERNATIF */}
            {showAlternatives && (
              <div className="bg-purple-50 p-5 rounded-2xl border-2 border-purple-200 space-y-3 animate-fadeIn">
                <h4 className="text-sm font-black text-purple-950 uppercase tracking-wider flex items-center gap-2">
                  <span>🔄</span> 2 Kegiatan Alternatif (Jika Alat/Cuaca/Kondisi Berbeda):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {kegiatanHariIni.alternatif.map((alt, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-purple-200 space-y-1 text-xs">
                      <span className="font-bold text-purple-900">Alternatif #{idx + 1}: {alt.judul}</span>
                      <p className="text-slate-600">{alt.deskripsi}</p>
                      <span className="text-[10px] text-purple-700 font-semibold italic block pt-1">
                        Alasan Digunakan: {alt.alasanDigunakan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STRUKTUR HARIAN 3 BAGIAN: PEMBUKA, INTI, PENUTUP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* BAGIAN 1: PEMBUKA */}
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                    1. PEMBUKA
                  </span>
                  <span className="text-xs font-bold text-amber-800">{kegiatanHariIni.pembuka.durasi}</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-semibold">{kegiatanHariIni.pembuka.aktivitas}</p>
              </div>

              {/* BAGIAN 2: INTI */}
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-200 space-y-3 md:col-span-2">
                <div className="flex justify-between items-center border-b border-indigo-200 pb-2">
                  <span className="text-xs font-black uppercase text-indigo-900 bg-indigo-200 px-2.5 py-0.5 rounded-full">
                    2. KEGIATAN INTI
                  </span>
                  <span className="text-xs font-bold text-indigo-800">Durasi: {kegiatanHariIni.inti.durasi}</span>
                </div>

                <p className="text-xs text-indigo-950 leading-relaxed font-bold">{kegiatanHariIni.inti.deskripsi}</p>

                <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-1 text-xs">
                  <span className="font-bold text-indigo-900 uppercase text-[11px]">Alat & Bahan Yang Dibutuhkan:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {kegiatanHariIni.inti.alatAlat.map((a, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-lg border border-indigo-200 text-[11px] font-semibold">
                        🛠️ {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-indigo-950 uppercase text-[11px]">Langkah & Instruksi Guru:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                    {kegiatanHariIni.inti.instruksiGuru.map((ins, i) => (
                      <li key={i}>{ins}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* BAGIAN 3: PENUTUP */}
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-2 md:col-span-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-full">
                    3. PENUTUP
                  </span>
                  <span className="text-xs font-bold text-emerald-800">{kegiatanHariIni.penutup.durasi}</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-semibold">{kegiatanHariIni.penutup.aktivitas}</p>
              </div>
            </div>

            {/* TINGKAT KESULITAN USIA TERPILIH */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="font-black text-slate-900 uppercase text-[11px]">
                Adaptasi Tingkat Kesulitan ({selectedAgeLevel.replace('usia', 'Usia ').replace('_', '-') + ' Tahun'}):
              </span>
              <p className="text-slate-700 font-semibold leading-relaxed">
                {kegiatanHariIni.variasiUsia[selectedAgeLevel]}
              </p>
            </div>

            {/* LEMBAR OBSERVASI HARIAN GURU PER MURID */}
            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-black text-slate-900 text-sm">
                  Lembar Pencatatan Observasi Guru Harian ({kegiatanHariIni.domainUtama.toUpperCase()})
                </h4>
                <span className="text-xs text-indigo-600 font-bold">Terisolasi per Tenant ({activeTenantId})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {daftarRekapMurid.map((m) => {
                  const obsLog = catatanObservasiList.find(
                    (o) => o.muridId === m.id && o.kegiatanId === kegiatanHariIni.id
                  );
                  return (
                    <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{m.fotoEmoji}</span>
                          <span className="font-bold text-slate-900">{m.nama}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Usia {m.kategoriUsia.replace('_tahun', 'Thn')}</span>
                      </div>

                      {/* INDIKATOR STATUS */}
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => handleLogObservasiHarian(m.id, 'belum_terlihat')}
                          className={`py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            obsLog?.status === 'belum_terlihat' ? 'bg-rose-600 text-white' : 'bg-white border text-slate-700 hover:bg-rose-50'
                          }`}
                        >
                          Belum
                        </button>
                        <button
                          onClick={() => handleLogObservasiHarian(m.id, 'mulai_muncul')}
                          className={`py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            obsLog?.status === 'mulai_muncul' ? 'bg-amber-600 text-white' : 'bg-white border text-slate-700 hover:bg-amber-50'
                          }`}
                        >
                          Mulai
                        </button>
                        <button
                          onClick={() => handleLogObservasiHarian(m.id, 'muncul_sendiri')}
                          className={`py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            obsLog?.status === 'muncul_sendiri' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700 hover:bg-emerald-50'
                          }`}
                        >
                          Sendiri
                        </button>
                      </div>

                      {/* CATATAN TEKS BEBAS */}
                      <input
                        type="text"
                        placeholder="Catatan pengamatan guru..."
                        value={obsLog?.catatanGuru || ''}
                        onChange={(e) => handleLogObservasiHarian(m.id, obsLog?.status || 'mulai_muncul', e.target.value)}
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 text-[11px] focus:ring-1 focus:ring-indigo-400"
                      />

                      {/* LAMPIRAN FOTO MODAL / INPUT FILE */}
                      <div className="flex items-center justify-between pt-1">
                        <label className="cursor-pointer text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                          <span>📷</span> {obsLog?.fotoUrl ? 'Ganti Foto' : 'Lampirkan Foto HP'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleLogObservasiHarian(
                                    m.id,
                                    obsLog?.status || 'mulai_muncul',
                                    obsLog?.catatanGuru,
                                    reader.result as string
                                  );
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        {obsLog?.fotoUrl && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            ✓ Ada Foto
                          </span>
                        )}
                      </div>

                      {obsLog?.fotoUrl && (
                        <img src={obsLog.fotoUrl} alt="Dokumentasi HP" className="w-full h-20 object-cover rounded-lg border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB RAPOR INDIVIDU MURID */}
      {activeTabGuru === 'rapor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* DAFTAR MURID */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 lg:col-span-1">
            <h3 className="font-bold text-slate-800 text-sm">Daftar Murid ({daftarRekapMurid.length}):</h3>
            {daftarRekapMurid.map((m) => {
              const isSelected = selectedChild?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => { soundFx.playPop(); setSelectedMuridId(m.id); }}
                  className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                    isSelected ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-1 bg-white rounded-xl shadow-sm">{m.fotoEmoji}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{m.nama}</h4>
                      <span className="text-xs text-slate-500">Usia {m.kategoriUsia.replace('_tahun', ' Tahun')}</span>
                    </div>
                  </div>
                  {onSelectChildForPlay && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectChildForPlay(m);
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                      Main 🎮
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* RAPOR INDIVIDU MURID */}
          {selectedChild && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl p-2 bg-indigo-50 rounded-2xl">{selectedChild.fotoEmoji}</span>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{selectedChild.nama}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        Kategori Usia: {selectedChild.kategoriUsia.replace('_tahun', ' Tahun')}
                      </span>
                      {selectedChild.kontakOrangTua && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          📱 {selectedChild.kontakOrangTua}
                        </span>
                      )}
                    </div>

                    {(selectedChild.namaAyah || selectedChild.namaIbu) && (
                      <div className="flex flex-wrap gap-3 text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        {selectedChild.namaAyah && <div>👨 Ayah: <strong className="text-slate-800">{selectedChild.namaAyah}</strong></div>}
                        {selectedChild.namaIbu && <div>👩 Ibu: <strong className="text-slate-800">{selectedChild.namaIbu}</strong></div>}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm"
                >
                  🖨️ Cetak Ringkasan
                </button>
              </div>

              {/* LOG ADAB MINGGUAN PER MURID */}
              <div className="space-y-2">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1">
                  <span>✨</span> Capaian Benang Adab Harian (Tenant: {activeTenantId}):
                </h4>
                {catatanAdabList.filter((a) => a.muridId === selectedChild.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">Belum ada catatan adab yang dicatat.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {catatanAdabList.filter((a) => a.muridId === selectedChild.id).map((ad) => (
                      <div key={ad.id} className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
                        <span className="font-bold text-amber-950">Minggu #{ad.mingguKe}</span>
                        <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-amber-200 text-amber-900 capitalize">
                          {ad.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DOMAIN 1: LOGIKA & KOGNITIF */}
              <div className="space-y-3">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1">
                  <span>🧠</span> Domain Logika & Kognitif:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Cocok Bentuk', val: selectedChild.skorLogika.pencocokanBentuk },
                    { label: 'Urutan Ukuran', val: selectedChild.skorLogika.mengurutkanUkuran },
                    { label: 'Menghitung', val: selectedChild.skorLogika.menghitungBenda },
                    { label: 'Pola Warna', val: selectedChild.skorLogika.polaWarna }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                      <div className={`mt-1 text-sm font-black py-1 px-2 rounded-lg ${getPercentageColor(item.val)}`}>
                        {item.val}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DOMAIN 2: MOTORIK HALUS */}
              <div className="space-y-3">
                <h4 className="font-bold text-pink-900 text-sm flex items-center gap-1">
                  <span>✍️</span> Domain Motorik Halus:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Tracing Garis & Bentuk', val: selectedChild.skorMotorikHalus.tracingGaris },
                    { label: 'Puzzle Kepingan', val: selectedChild.skorMotorikHalus.puzzleBentuk },
                    { label: 'Pop Bubble Sensory', val: selectedChild.skorMotorikHalus.bubblePopSensory }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                      <div className={`mt-1 text-sm font-black py-1 px-2 rounded-lg ${getPercentageColor(item.val)}`}>
                        {item.val}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GALERI PERKEMBANGAN & DOKUMENTASI FOTO */}
              <GaleriPerkembanganAnak murid={selectedChild} catatanObservasiList={catatanObservasiList} />
            </div>
          )}
        </div>
      )}

      {/* TAB PETA 12 BULAN */}
      {activeTabGuru === 'kurikulum' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider">Peta Pembelajaran 12 Bulan (48 Minggu)</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Struktur Kurikulum PAUD Spesifik Usia</h3>
            </div>

            <div className="flex gap-2 bg-indigo-50 p-1.5 rounded-2xl border border-indigo-100">
              <button
                onClick={() => { soundFx.playPop(); setSelectedSemesterPlan(1); setSelectedBulanPlan(1); }}
                className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${
                  selectedSemesterPlan === 1 ? 'bg-indigo-600 text-white shadow' : 'text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                Semester 1 (Bulan 1–6)
              </button>
              <button
                onClick={() => { soundFx.playPop(); setSelectedSemesterPlan(2); setSelectedBulanPlan(7); }}
                className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${
                  selectedSemesterPlan === 2 ? 'bg-indigo-600 text-white shadow' : 'text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                Semester 2 (Bulan 7–12)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GAME PENDUKUNG */}
      {showGameModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowGameModal(null)}
              className="absolute top-4 right-4 z-10 px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow hover:bg-rose-700"
            >
              ❌ Tutup Game
            </button>
            <GameSosialBahasa gameMode={showGameModal} />
          </div>
        </div>
      )}
    </div>
  );
};
