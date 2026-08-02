import React, { useState, useEffect } from 'react';
import { KartuAktivitasKasar, MuridPaud, StatusCapaian, BulanCurriculum, KategoriUsiaSpesifik } from '../../types/paudTypes';
import { soundFx } from '../../utils/soundEffects';

interface ModulMotorikKasarProps {
  daftarMurid: MuridPaud[];
  onSaveEvaluasi?: (muridId: string, evaluasi: { bulan: BulanCurriculum; mingguKe: number; aktivitasId: string; namaAktivitas: string; status: StatusCapaian; catatan?: string }) => void;
}

export const KURIKULUM_BULANAN_LIST: { bulan: BulanCurriculum; semester: 1 | 2; judulTema: string; ikon: string; deskripsi: string }[] = [
  { bulan: 1, semester: 1, judulTema: 'Bulan 1: Aku & Brain Gym Bilateral 👶', ikon: '🧠', deskripsi: 'Pengenalan gerak silang Cross Crawl & keseimbangan otak kanan-kiri.' },
  { bulan: 2, semester: 1, judulTema: 'Bulan 2: Lingkungan Rumahku & Bola 🏀', ikon: '🏠', deskripsi: 'Drible bola kanan-kiri & Keseimbangan berjalan garis lakban.' },
  { bulan: 3, semester: 1, judulTema: 'Bulan 3: Dunia Binatang & Lazy 8 ♾️', ikon: '🦁', deskripsi: 'Gerakan angka 8 tidur di udara & lompat katak/bangau.' },
  { bulan: 4, semester: 1, judulTema: 'Bulan 4: Tanaman & Kebun Buah 🍎', ikon: '🍎', deskripsi: 'Berlari mengambil buah & senam pohon ditiup angin.' },
  { bulan: 5, semester: 1, judulTema: 'Bulan 5: Transportasi & Kendaraan 🚗', ikon: '🚗', deskripsi: 'Keseimbangan berdiri 1 kaki (pesawat) & lari irama.' },
  { bulan: 6, semester: 1, judulTema: 'Bulan 6: Halang Rintang Evaluasi Sem 1 🏆', ikon: '🏆', deskripsi: 'Kombinasi rintangan fisik, lompat, jinjit, & lempar.' },
  { bulan: 7, semester: 2, judulTema: 'Bulan 7: Alam Semesta & Cuaca ☀️', ikon: '☀️', deskripsi: 'Senam hujan & melompat genangan air, lari teduh.' },
  { bulan: 8, semester: 2, judulTema: 'Bulan 8: Profesi & Cita-Citaku 👮', ikon: '👮', deskripsi: 'Baris-berbaris polisi cilik & lari cepat pemadam kebakaran.' },
  { bulan: 9, semester: 2, judulTema: 'Bulan 9: Makanan Sehat & Gizi 🥦', ikon: '🥦', deskripsi: 'Lari membawa nampan sehat & lompat tangkap buah.' },
  { bulan: 10, semester: 2, judulTema: 'Bulan 10: Seni, Musik & Warna 🎨', ikon: '🎨', deskripsi: 'Senam irama musik ceria & menari melingkar.' },
  { bulan: 11, semester: 2, judulTema: 'Bulan 11: Cinta Lingkungan 🧹', ikon: '🧹', deskripsi: 'Estafet membuang sampah pada tempatnya & jemur pakaian.' },
  { bulan: 12, semester: 2, judulTema: 'Bulan 12: Wisuda PAUD & Pentas 🎓', ikon: '🎓', deskripsi: 'Pentas seni, rintangan wisuda juara & estafet toga.' }
];

export const LIST_AKTIVITAS_KASAR: KartuAktivitasKasar[] = [
  // BRAIN GYM & BILATERAL INTEGRATION CARDS
  {
    id: 'b1-cross-crawl',
    bulan: 1,
    mingguKe: 1,
    judul: 'Gerak Silang Brain Gym (Cross Crawl) 🧠',
    kategoriUsia: '4_tahun',
    kategoriMateri: 'brain_gym',
    otakTarget: 'Bilateral (Kanan-Kiri)',
    deskripsi: 'Sentuhkan Tangan/Siku Kanan ke Lutut Kiri, lalu Tangan Kiri ke Lutut Kanan.',
    instruksiGuru: [
      'Anak berdiri tegap di tempat.',
      'Angkat lutut kiri, sentuhkan dengan tangan/siku kanan.',
      'Ganti angkat lutut kanan, sentuhkan dengan tangan/siku kiri.',
      'Ulangi 10 kali secara perlahan dan berirama.'
    ],
    manfaat: 'Menyeimbangkan fungsi korteks motorik otak kanan dan otak kiri (Corpus Callosum).',
    durasiDetik: 45,
    ikon: '🧠',
    tingkatKesulitan: 'Sedang',
    variasiGerak: ['Sambil menyanyi irama', 'Sentuh tumit silang di belakang']
  },
  {
    id: 'b2-drible-silang',
    bulan: 2,
    mingguKe: 5,
    judul: 'Oper Bola Tangan Kanan-Kiri 🏀',
    kategoriUsia: '4_tahun',
    kategoriMateri: 'brain_gym',
    otakTarget: 'Bilateral (Kanan-Kiri)',
    deskripsi: 'Memindahkan atau memantulkan bola kecil dari Tangan Kanan ke Tangan Kiri.',
    instruksiGuru: [
      'Berikan bola plastik/karet kecil kepada anak.',
      'Minta anak memantulkan atau mengoper bola dari Tangan Kanan ke Tangan Kiri.',
      'Lakukan 10 kali operan tanpa menjatuhkan bola.'
    ],
    manfaat: 'Melatih koordinasi bilateral mata-tangan dan kelincahan refleks.',
    durasiDetik: 60,
    ikon: '🏀',
    tingkatKesulitan: 'Sedang',
    variasiGerak: ['Sambil melangkah pelan', 'Oper bola pasangan']
  },
  {
    id: 'b3-lazy-8',
    bulan: 3,
    mingguKe: 9,
    judul: 'Angka 8 Tidur di Udara (Lazy 8) ♾️',
    kategoriUsia: '3_tahun',
    kategoriMateri: 'brain_gym',
    otakTarget: 'Bilateral (Kanan-Kiri)',
    deskripsi: 'Menggambar simbol 8 horizontal di udara dengan kedua tangan saling mengunci.',
    instruksiGuru: [
      'Genggam kedua tangan di depan dada dengan ibu jari menunjuk ke atas.',
      'Buat gerakan meliuk membentuk angka 8 horizontal di udara.',
      'Mata anak mengikuti gerak ibu jari dari kiri ke kanan.'
    ],
    manfaat: 'Melatih otot mata menyeberangi garis tengah tubuh (Midline Integration).',
    durasiDetik: 45,
    ikon: '♾️',
    tingkatKesulitan: 'Mudah',
    variasiGerak: ['Menggambar di papan tulis', 'Menggambar di udara dengan mata tertutup']
  },
  {
    id: 'b5-bangau-tutup-mata',
    bulan: 5,
    mingguKe: 17,
    judul: 'Keseimbangan Bangau Tutup Mata 🦩',
    kategoriUsia: '5_tahun',
    kategoriMateri: 'motorik_kasar',
    otakTarget: 'Kanan',
    deskripsi: 'Berdiri 1 kaki dengan kedua mata terpejam selama 5 detik.',
    instruksiGuru: [
      'Peragakan posisi berdiri 1 kaki.',
      'Minta anak memejamkan mata rapat-rapat.',
      'Hitung bersama 1.. 2.. 3.. 4.. 5!'
    ],
    manfaat: 'Melatih kesadaran proprioseptif dalam dan keseimbangan vestibular mendalam.',
    durasiDetik: 30,
    ikon: '🦩',
    tingkatKesulitan: 'Tantangan',
    variasiGerak: ['Berdiri 1 kaki tangan di dada', 'Berdiri jinjit']
  },
  {
    id: 'b1-tepuk-irama',
    bulan: 1,
    mingguKe: 1,
    judul: 'Tepuk Irama & Melangkah 👏',
    kategoriUsia: '2_tahun',
    kategoriMateri: 'motorik_kasar',
    deskripsi: 'Menepuk tangan sesuai irama musik sambil melangkah pelan.',
    instruksiGuru: [
      'Minta anak berbaris membuat lingkaran.',
      'Guru menepuk tangan 3x (Prok! Prok! Prok!) diikuti langkah 3x.',
      'Ajak anak menirukan tempo cepat dan lambat.'
    ],
    manfaat: 'Melatih ritme kesadaran tubuh dan respon pendengaran.',
    durasiDetik: 45,
    ikon: '👏',
    tingkatKesulitan: 'Mudah',
    variasiGerak: ['Tepuk di atas kepala', 'Tepuk paha']
  },
  {
    id: 'b1-lompat-dua-kaki',
    bulan: 1,
    mingguKe: 3,
    judul: 'Lompat Kelinci Ceria 🐰',
    kategoriUsia: '3_tahun',
    kategoriMateri: 'hewan',
    deskripsi: 'Melompat dengan 2 kaki bersamaan di tempat dan ke depan.',
    instruksiGuru: [
      'Posisikan tangan di samping kepala seperti telinga kelinci.',
      'Tekuk lutut sedikit dan tekankan melompat ke depan 30 cm.',
      'Ulangi 5 kali lompatan.'
    ],
    manfaat: 'Memperkuat otot tungkai bawah dan dorongan kaki.',
    durasiDetik: 60,
    ikon: '🐰',
    tingkatKesulitan: 'Mudah',
    variasiGerak: ['Lompat mundur', 'Lompat masuk lingkaran']
  },
  {
    id: 'b2-jalan-garis-lurus',
    bulan: 2,
    mingguKe: 5,
    judul: 'Berjalan di Garis Lakban 👣',
    kategoriUsia: '3_tahun',
    kategoriMateri: 'motorik_kasar',
    deskripsi: 'Berjalan menelusuri garis lakban lurus di lantai tanpa jatuh.',
    instruksiGuru: [
      'Buat garis lakban warna-warni 3 meter di lantai kelas.',
      'Minta anak menempatkan tumit di depan jari kaki.',
      'Rentangkan kedua tangan ke samping seperti sayap pesawat.'
    ],
    manfaat: 'Melatih keseimbangan vestibular & fokus penglihatan.',
    durasiDetik: 60,
    ikon: '👣',
    tingkatKesulitan: 'Mudah',
    variasiGerak: ['Berjalan jinjit', 'Berjalan membawa mangkuk']
  },
  {
    id: 'b2-merayap-terowongan',
    bulan: 2,
    mingguKe: 7,
    judul: 'Merayap Terowongan Rumah 🛖',
    kategoriUsia: '2_tahun',
    kategoriMateri: 'motorik_kasar',
    deskripsi: 'Merangkak dan merayap melewati kolong kursi/terowongan kain.',
    instruksiGuru: [
      'Susun kursi atau terowongan kain anak di matras.',
      'Bimbing anak merangkak siku & lutut menyentuh matras.',
      'Beri sorakan gembira saat anak berhasil keluar dari terowongan.'
    ],
    manfaat: 'Melatih otot punggung, leher, dan integrasi proprioseptif.',
    durasiDetik: 45,
    ikon: '🛖',
    tingkatKesulitan: 'Sedang',
    variasiGerak: ['Merayap mundur', 'Membawa mainan di punggung']
  },
  {
    id: 'b3-lompat-katak',
    bulan: 3,
    mingguKe: 9,
    judul: 'Lompat Katak di Danau 🐸',
    kategoriUsia: '3_tahun',
    kategoriMateri: 'hewan',
    deskripsi: 'Jongkok rendah dan melompat maju menirukan gerakan katak.',
    instruksiGuru: [
      'Ajak anak posisi jongkok dengan kedua tangan di antara kaki.',
      'Ucapkan "1.. 2.. 3.. KWOAK!" dan melompat sejauh mungkin.',
      'Lakukan 4-5 lompatan maju.'
    ],
    manfaat: 'Melatih kekuatan otot paha, lutut, dan keberanian anak.',
    durasiDetik: 45,
    ikon: '🐸',
    tingkatKesulitan: 'Sedang',
    variasiGerak: ['Lompat miring', 'Lompat tinggi']
  },
  {
    id: 'b6-halang-rintang',
    bulan: 6,
    mingguKe: 21,
    judul: 'Halang Rintang Juara Sem 1 🏆',
    kategoriUsia: '5_tahun',
    kategoriMateri: 'motorik_kasar',
    deskripsi: 'Kombinasi 4 rintangan: Melompati kardus, berjalan jinjit, merangkak, & melempar bola.',
    instruksiGuru: [
      'Susun jalur rintangan di aula/halaman sekolah.',
      'Post 1: Melompati 2 blok busa.',
      'Post 2: Berjalan di garis lengkung.',
      'Post 3: Melempar bola ke sasaran keranjang.'
    ],
    manfaat: 'Evaluasi komprehensif seluruh fungsi motorik kasar semester 1.',
    durasiDetik: 90,
    ikon: '🏆',
    tingkatKesulitan: 'Tantangan',
    variasiGerak: ['Tim relay pasangan', 'Membawa tongkat estafet']
  }
];

export const ModulMotorikKasar: React.FC<ModulMotorikKasarProps> = ({ daftarMurid, onSaveEvaluasi }) => {
  const [selectedBulan, setSelectedBulan] = useState<BulanCurriculum>(1);
  const [selectedAktivitas, setSelectedAktivitas] = useState<KartuAktivitasKasar>(LIST_AKTIVITAS_KASAR[0]);
  const [filterUsia, setFilterUsia] = useState<'semua' | KategoriUsiaSpesifik>('semua');

  // TIMER STATE
  const [timeLeft, setTimeLeft] = useState<number>(LIST_AKTIVITAS_KASAR[0].durasiDetik);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // EVALUASI STATE
  const [selectedMuridId, setSelectedMuridId] = useState<string>(daftarMurid[0]?.id || '');
  const [selectedStatus, setSelectedStatus] = useState<StatusCapaian>('berkembang_sesuai_harapan');
  const [catatanGuru, setCatatanGuru] = useState<string>('');

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      soundFx.playFanfare();
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const handleSelectBulan = (bln: BulanCurriculum) => {
    soundFx.playPop();
    setSelectedBulan(bln);
    const firstAktivitasBulan = LIST_AKTIVITAS_KASAR.find((a) => a.bulan === bln) || LIST_AKTIVITAS_KASAR[0];
    setSelectedAktivitas(firstAktivitasBulan);
    setTimeLeft(firstAktivitasBulan.durasiDetik);
    setIsTimerRunning(false);
  };

  const handleSelectAktivitas = (akt: KartuAktivitasKasar) => {
    soundFx.playPop();
    setSelectedAktivitas(akt);
    setTimeLeft(akt.durasiDetik);
    setIsTimerRunning(false);
  };

  const toggleTimer = () => {
    soundFx.playPop();
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    soundFx.playPop();
    setIsTimerRunning(false);
    setTimeLeft(selectedAktivitas.durasiDetik);
  };

  const handleSimpanEvaluasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMuridId) return;
    soundFx.playSuccess();
    if (onSaveEvaluasi) {
      onSaveEvaluasi(selectedMuridId, {
        bulan: selectedAktivitas.bulan,
        mingguKe: selectedAktivitas.mingguKe,
        aktivitasId: selectedAktivitas.id,
        namaAktivitas: selectedAktivitas.judul,
        status: selectedStatus,
        catatan: catatanGuru
      });
    }
    setCatatanGuru('');
    alert(`Evaluasi ${selectedAktivitas.judul} (Bulan ${selectedAktivitas.bulan}) berhasil disimpan!`);
  };

  const filteredList = LIST_AKTIVITAS_KASAR.filter(
    (a) => a.bulan === selectedBulan && (filterUsia === 'semua' || a.kategoriUsia === filterUsia)
  );

  return (
    <div className="bg-gradient-to-b from-sky-50 to-blue-100 min-h-full p-4 md:p-6 rounded-3xl shadow-lg border-4 border-sky-200 space-y-6">
      {/* Header & Selector Bulan Kurikulum 12 Bulan */}
      <div className="bg-white/90 backdrop-blur p-5 rounded-3xl shadow-md border border-sky-100 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold text-sky-600 tracking-wider">Kurikulum Motorik Kasar & Brain Gym Bilateral (48 Minggu)</span>
            <h2 className="text-2xl font-black text-sky-900 flex items-center gap-2">
              <span>🧠🏃</span> Panduan & Jurnal Stimulasi Keseimbangan Otak Guru
            </h2>
          </div>

          <div className="flex gap-2">
            {(['semua', '2_tahun', '3_tahun', '4_tahun', '5_tahun'] as const).map((u) => (
              <button
                key={u}
                onClick={() => { soundFx.playPop(); setFilterUsia(u); }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs capitalize ${
                  filterUsia === u ? 'bg-sky-600 text-white shadow' : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                }`}
              >
                {u === 'semua' ? 'Semua Usia' : u.replace('_tahun', ' Thn')}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Switcher 12 Bulan */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 pt-2 border-t border-sky-100">
          {KURIKULUM_BULANAN_LIST.map((k) => {
            const isSelected = selectedBulan === k.bulan;
            return (
              <button
                key={k.bulan}
                onClick={() => handleSelectBulan(k.bulan)}
                className={`p-2.5 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-700 shadow-md scale-102 ring-2 ring-sky-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                }`}
              >
                <span className="text-xl">{k.ikon}</span>
                <div className="mt-1">
                  <div className="text-[10px] font-black">Bln #{k.bulan}</div>
                  <div className="text-[9px] opacity-80 truncate">Sem {k.semester}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LIST KARTU AKTIVITAS BULAN INI */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="font-bold text-sky-900 text-sm px-1">Aktivitas Bulan #{selectedBulan}:</h3>
          {filteredList.length === 0 ? (
            <div className="bg-white p-4 rounded-2xl text-xs text-slate-500 text-center italic">Tidak ada aktivitas untuk filter usia ini di Bulan #{selectedBulan}.</div>
          ) : (
            filteredList.map((akt) => (
              <div
                key={akt.id}
                onClick={() => handleSelectAktivitas(akt)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border-2 flex items-center justify-between ${
                  selectedAktivitas.id === akt.id
                    ? 'bg-sky-600 text-white border-sky-700 shadow-md scale-102'
                    : 'bg-white text-slate-800 border-sky-100 hover:bg-sky-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{akt.ikon}</span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-white/20 rounded-full">Minggu #{akt.mingguKe}</span>
                    <h4 className="font-black text-sm mt-0.5">{akt.judul}</h4>
                    <div className="flex gap-1.5 items-center mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedAktivitas.id === akt.id ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-800'
                      }`}>
                        Usia: {akt.kategoriUsia.replace('_tahun', ' Thn')}
                      </span>
                      {akt.otakTarget && (
                        <span className="text-[9px] font-black bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                          Otak: {akt.otakTarget}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded-lg">{akt.tingkatKesulitan}</span>
              </div>
            ))
          )}
        </div>

        {/* DETAIL AKTIVITAS & TIMER */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-sky-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-extrabold text-sky-600 uppercase bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                    Bulan #{selectedAktivitas.bulan} • Minggu Ke-{selectedAktivitas.mingguKe}
                  </span>
                  {selectedAktivitas.otakTarget && (
                    <span className="text-xs font-black bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-200">
                      🧠 Otak: {selectedAktivitas.otakTarget}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-sky-900 mt-2">{selectedAktivitas.judul}</h3>
                <p className="text-slate-600 text-sm mt-1">{selectedAktivitas.deskripsi}</p>
              </div>

              {/* TIMER INTERAKTIF */}
              <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 text-center min-w-[140px]">
                <div className="text-3xl font-black text-sky-700 mb-1">
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={toggleTimer}
                    className={`px-3 py-1 text-xs font-bold text-white rounded-lg shadow ${
                      isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isTimerRunning ? 'Pause ⏸️' : 'Mulai ▶️'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="px-2 py-1 text-xs font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>

            {/* INSTRUKSI GURU */}
            <div className="mb-4 bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
              <h4 className="font-bold text-sky-900 text-sm mb-2 flex items-center gap-1">
                <span>📋</span> Panduan Langkah Guru:
              </h4>
              <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                {selectedAktivitas.instruksiGuru.map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl text-xs text-amber-900 font-medium mb-6 border border-amber-200">
              💡 <strong>Manfaat Perkembangan Otak:</strong> {selectedAktivitas.manfaat}
            </div>

            {/* FORM EVALUASI SISWA */}
            <form onSubmit={handleSimpanEvaluasi} className="border-t pt-4 border-slate-200">
              <h4 className="font-bold text-sky-900 text-sm mb-3 flex items-center gap-1">
                <span>✍️</span> Catat Evaluasi Anak pada Aktivitas Bulan #{selectedAktivitas.bulan}:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Murid:</label>
                  <select
                    value={selectedMuridId}
                    onChange={(e) => setSelectedMuridId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:ring-2 focus:ring-sky-400"
                  >
                    {daftarMurid.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fotoEmoji} {m.nama} (Usia {m.kategoriUsia.replace('_tahun', ' Thn')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Capaian Perkembangan STPPA:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as StatusCapaian)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm bg-white font-bold text-emerald-700 focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="belum_berkembang">Belum Berkembang (BB)</option>
                    <option value="mulai_berkembang">Mulai Berkembang (MB)</option>
                    <option value="berkembang_sesuai_harapan">Berkembang Sesuai Harapan (BSH)</option>
                    <option value="sangat_baik">Berkembang Sangat Baik (BSB)</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Observasi Guru:</label>
                <input
                  type="text"
                  placeholder="Contoh: Gerakan silang lancar dan seimbang..."
                  value={catatanGuru}
                  onChange={(e) => setCatatanGuru(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg hover:bg-sky-700 transition-transform active:scale-98 flex items-center justify-center gap-2"
              >
                <span>💾</span> Simpan Hasil Evaluasi Motorik & Brain Gym (Bulan #{selectedAktivitas.bulan})
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
