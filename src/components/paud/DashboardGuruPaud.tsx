import React, { useState } from 'react';
import { MuridPaud, RekapMuridPaud, BulanCurriculum, KategoriUsiaSpesifik } from '../../types/paudTypes';
import { KURIKULUM_BULANAN_LIST } from './ModulMotorikKasar';
import { soundFx } from '../../utils/soundEffects';

interface DashboardGuruPaudProps {
  daftarRekapMurid: RekapMuridPaud[];
  initialTab?: 'rapor' | 'kurikulum';
  onAddMurid?: (murid: MuridPaud) => void;
  onSelectChildForPlay?: (murid: MuridPaud) => void;
}

export const DashboardGuruPaud: React.FC<DashboardGuruPaudProps> = ({
  daftarRekapMurid,
  initialTab = 'rapor',
  onAddMurid,
  onSelectChildForPlay
}) => {
  const [activeTabGuru, setActiveTabGuru] = useState<'rapor' | 'kurikulum'>(initialTab);

  React.useEffect(() => {
    if (initialTab) setActiveTabGuru(initialTab);
  }, [initialTab]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMuridId, setSelectedMuridId] = useState<string | null>(daftarRekapMurid[0]?.id || null);
  const [selectedSemesterPlan, setSelectedSemesterPlan] = useState<1 | 2>(1);
  const [selectedBulanPlan, setSelectedBulanPlan] = useState<BulanCurriculum>(1);

  // Form state
  const [namaMurid, setNamaMurid] = useState('');
  const [panggilan, setPanggilan] = useState('');
  const [kategoriUsia, setKategoriUsia] = useState<KategoriUsiaSpesifik>('3_tahun');
  const [fotoEmoji, setFotoEmoji] = useState('👶');
  const [namaAyah, setNamaAyah] = useState('');
  const [namaIbu, setNamaIbu] = useState('');
  const [kontakOrangTua, setKontakOrangTua] = useState('');

  const selectedChild = daftarRekapMurid.find((m) => m.id === selectedMuridId) || daftarRekapMurid[0];

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

  const getPercentageColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500 text-white';
    if (score >= 60) return 'bg-blue-500 text-white';
    if (score >= 40) return 'bg-amber-500 text-white';
    return 'bg-rose-500 text-white';
  };

  const RENCANA_KURIKULUM_DETAILS = [
    // SEMESTER 1
    {
      bulan: 1,
      semester: 1,
      tema: 'Aku & Anggota Tubuhku 👶',
      logika: 'Pengenalan bentuk dasar (Lingkaran, Persegi) & Menghitung 1-3 benda.',
      motorikHalus: 'Tracing garis lurus mendatar & tegak, meremas kertas.',
      motorikKasar: 'Lompat 2 kaki bersamaan & tepuk irama melangkah.'
    },
    {
      bulan: 2,
      semester: 1,
      tema: 'Lingkungan Rumahku 🏠',
      logika: 'Pengelompokan warna primer (Merah, Biru, Kuning) & Urutkan ukuran sendok.',
      motorikHalus: 'Tracing garis lengkung, memasang 2 kepingan puzzle perabot.',
      motorikKasar: 'Berjalan di atas garis lakban (Keseimbangan) & merayap kolong.'
    },
    {
      bulan: 3,
      semester: 1,
      tema: 'Dunia Binatang Ceria 🦁',
      logika: 'Pencocokan bayangan binatang & Menghitung 1-5 item bintang/bebek.',
      motorikHalus: 'Tracing garis zig-zag jalur ulat, sensory bubble pop.',
      motorikKasar: 'Lompat katak 🐸, jalan kepiting 🦀, & gerak burung terbang.'
    },
    {
      bulan: 4,
      semester: 1,
      tema: 'Tanaman & Kebun Buah 🍎',
      logika: 'Pola warna buah (Merah-Kuning-Merah-?) & Klasifikasi buah besar vs kecil.',
      motorikHalus: 'Petik buah tap presisi & tracing lingkaran apel.',
      motorikKasar: 'Senam pohon ditiup angin 🌳 & lari mengambil buah 🍎.'
    },
    {
      bulan: 5,
      semester: 1,
      tema: 'Transportasi & Kendaraan 🚗',
      logika: 'Urutkan 3-5 ukuran kendaraan (Sepeda, Mobil, Pesawat) & pencocokan bentuk.',
      motorikHalus: 'Puzzle mobil 4 keping & tracing jalur jalan raya.',
      motorikKasar: 'Keseimbangan berdiri 1 kaki 🦩 & menyetir mobil irama 🚗.'
    },
    {
      bulan: 6,
      semester: 1,
      tema: 'Halang Rintang & Evaluasi Sem 1 🏆',
      logika: 'Grand Quiz Logika (Kombinasi Pola, Hitung, & Bentuk).',
      motorikHalus: 'Master Tracing Bentuk Kompleks & Puzzle 6 Keping.',
      motorikKasar: 'Halang Rintang 🏆 (Lompat + Jinjit + Keseimbangan + Lempar).'
    },

    // SEMESTER 2
    {
      bulan: 7,
      semester: 2,
      tema: 'Alam Semesta & Cuaca ☀️🌧️',
      logika: 'Pengenalan simbol cuaca (Matahari, Awan, Hujan) & Menghitung 1-7.',
      motorikHalus: 'Tracing tetes air hujan & Puzzle Awan Pelangi.',
      motorikKasar: 'Senam Hujan 🌧️ & Melompat Genangan Air.'
    },
    {
      bulan: 8,
      semester: 2,
      tema: 'Profesi & Cita-Citaku 👨‍✈️👩‍⚕️',
      logika: 'Pencocokan alat profesi (Dokter, Polisi, Koki) & Urutkan ukuran topi.',
      motorikHalus: 'Tracing silang bintang & Puzzle Polisi 6 Keping.',
      motorikKasar: 'Baris-Berbaris Polisi Cilik 👮 & Lari Pemadam Kebakaran.'
    },
    {
      bulan: 9,
      semester: 2,
      tema: 'Makanan Sehat & Gizi 🥦🍎',
      logika: 'Klasifikasi makanan sehat vs junkfood & Pola warna sayuran.',
      motorikHalus: 'Petik sayur tap presisi & Tracing bentuk wortel.',
      motorikKasar: 'Estafet Nampan Makanan Sehat 🥦 & Lompat Tangkap Buah.'
    },
    {
      bulan: 10,
      semester: 2,
      tema: 'Seni, Musik & Warna 🎨🎵',
      logika: 'Pencocokan alat musik (Gitar, Drum, Seruling) & Gradasi warna.',
      motorikHalus: 'Tracing not musik & Tap irama drum sensory.',
      motorikKasar: 'Senam Irama Musik Ceria 🎵 & Menari Melingkar.'
    },
    {
      bulan: 11,
      semester: 2,
      tema: 'Cinta Lingkungan & Kebersihan 🧹♻️',
      logika: 'Pemilahan sampah organik vs anorganik & Urutkan kotor -> bersih.',
      motorikHalus: 'Tracing garis sapu & Puzzle Tong Sampah Kategori.',
      motorikKasar: 'Estafet Kebersihan Sampah 🧹 & Menjemur Baju.'
    },
    {
      bulan: 12,
      semester: 2,
      tema: 'Wisuda PAUD & Pentas Akhir 🎓🎉',
      logika: 'Grand Championship Quiz 1 Tahun Penuh (Bentuk, Size, Count 1-10).',
      motorikHalus: 'Master Tracing Sertifikat/Topi Toga 🎓 & Puzzle Wisuda.',
      motorikKasar: 'Pentas Seni & Rintangan Wisuda Juara 🏆.'
    }
  ];

  const currentPlanList = RENCANA_KURIKULUM_DETAILS.filter((r) => r.semester === selectedSemesterPlan);

  return (
    <div className="bg-slate-50 min-h-full p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
      {/* Header Panel Guru */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-indigo-900 text-white p-6 rounded-3xl shadow-lg gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300">Dashboard & Kurikulum Spesifik Usia 2, 3, 4, 5 Tahun</span>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <span>👩‍🏫</span> Evaluasi Perkembangan Logika & Motorik
          </h2>
          <p className="text-indigo-200 text-sm mt-1">Pantau indikator kognitif, motorik halus, dan kasar sesuai STPPA PAUD.</p>
        </div>

        <div className="flex gap-2">
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
            <span>📅</span> Kurikulum 12 Bulan
          </button>
          <button
            onClick={() => { soundFx.playPop(); setShowAddForm(!showAddForm); }}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl shadow text-xs flex items-center gap-1.5 text-white"
          >
            <span>➕</span> {showAddForm ? 'Tutup' : 'Tambah Murid'}
          </button>
        </div>
      </div>

      {/* FORM TAMBAH MURID */}
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

      {/* TAB 1: RAPOR INDIVIDU & DAFTAR MURID */}
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

              {/* DOMAIN 3: MOTORIK KASAR */}
              <div className="space-y-3">
                <h4 className="font-bold text-sky-900 text-sm flex items-center gap-1">
                  <span>🏃</span> Catatan Motorik Kasar (Hasil Observasi Physical Activity):
                </h4>
                {selectedChild.evaluasiMotorikKasar.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">Belum ada evaluasi aktivitas fisik yang dicatat guru.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedChild.evaluasiMotorikKasar.map((ev, idx) => (
                      <div key={idx} className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-sky-900">Bulan #{ev.bulan} • Minggu #{ev.mingguKe} • {ev.namaAktivitas}</span>
                          {ev.catatanGuru && <p className="text-slate-600 mt-0.5">{ev.catatanGuru}</p>}
                        </div>
                        <span className="font-bold px-2 py-1 bg-sky-200 text-sky-900 rounded-lg capitalize">
                          {ev.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KURIKULUM 12 BULAN (SEMESTER 1 & 2) */}
      {activeTabGuru === 'kurikulum' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider">Pemetaan Pembelajaran Usia 2, 3, 4, 5 Tahun (48 Minggu)</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Struktur Kurikulum PAUD Spesifik Usia</h3>
            </div>

            {/* Semester Switcher */}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {currentPlanList.map((r) => {
              const isSelected = selectedBulanPlan === r.bulan;
              return (
                <button
                  key={r.bulan}
                  onClick={() => { soundFx.playPop(); setSelectedBulanPlan(r.bulan as BulanCurriculum); }}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    isSelected ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-102 ring-2 ring-indigo-300' : 'bg-slate-50 text-slate-800 hover:bg-indigo-50 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-black uppercase opacity-80">Bulan #{r.bulan}</div>
                  <h4 className="font-black text-sm mt-1">{r.tema}</h4>
                </button>
              );
            })}
          </div>

          {/* Rincian Target Bulan Terpilih */}
          {(() => {
            const currentPlan = RENCANA_KURIKULUM_DETAILS.find((r) => r.bulan === selectedBulanPlan) || RENCANA_KURIKULUM_DETAILS[0];
            return (
              <div className="bg-indigo-50/70 p-6 rounded-3xl border-2 border-indigo-100 space-y-4">
                <div className="flex justify-between items-center border-b border-indigo-200 pb-3">
                  <h4 className="text-xl font-black text-indigo-950">
                    Rincian Pembelajaran Bulan #{currentPlan.bulan}: {currentPlan.tema}
                  </h4>
                  <span className="text-xs font-bold bg-indigo-200 text-indigo-900 px-3 py-1 rounded-full">
                    Target 4 Minggu (Minggu #{ (currentPlan.bulan - 1) * 4 + 1 } s/d #{ currentPlan.bulan * 4 })
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
                    <span className="text-2xl">🧠</span>
                    <h5 className="font-black text-amber-900 text-sm">Target Logika & Kognitif:</h5>
                    <p className="text-xs text-amber-800 leading-relaxed">{currentPlan.logika}</p>
                  </div>

                  <div className="bg-pink-50 p-4 rounded-2xl border border-pink-200 space-y-2">
                    <span className="text-2xl">✍️</span>
                    <h5 className="font-black text-pink-900 text-sm">Target Motorik Halus:</h5>
                    <p className="text-xs text-pink-800 leading-relaxed">{currentPlan.motorikHalus}</p>
                  </div>

                  <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 space-y-2">
                    <span className="text-2xl">🏃</span>
                    <h5 className="font-black text-sky-900 text-sm">Target Motorik Kasar:</h5>
                    <p className="text-xs text-sky-800 leading-relaxed">{currentPlan.motorikKasar}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
