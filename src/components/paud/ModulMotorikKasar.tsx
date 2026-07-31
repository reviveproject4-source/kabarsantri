import React, { useState, useEffect } from 'react';
import { KartuAktivitasKasar, MuridPaud, StatusCapaian, BulanCurriculum, KategoriUsiaSpesifik } from '../../types/paudTypes';
import { soundFx } from '../../utils/soundEffects';

interface ModulMotorikKasarProps {
  daftarMurid: MuridPaud[];
  onSaveEvaluasi?: (muridId: string, evaluasi: { bulan: BulanCurriculum; mingguKe: number; aktivitasId: string; namaAktivitas: string; status: StatusCapaian; catatan?: string }) => void;
}

export const KURIKULUM_BULANAN_LIST: { bulan: BulanCurriculum; semester: 1 | 2; judulTema: string; ikon: string; deskripsi: string }[] = [
  // SEMESTER 1 (BULAN 1 - 6)
  { bulan: 1, semester: 1, judulTema: 'Bulan 1: Aku & Anggota Tubuhku', ikon: '👶', deskripsi: 'Pengenalan gerak dasar tubuh, koordinasi tangan & kaki.' },
  { bulan: 2, semester: 1, judulTema: 'Bulan 2: Lingkungan Rumahku', ikon: '🏠', deskripsi: 'Keseimbangan berjalan di garis lakban & merayap.' },
  { bulan: 3, semester: 1, judulTema: 'Bulan 3: Dunia Binatang Ceria', ikon: '🦁', deskripsi: 'Menirukan lompatan katak, senam kepiting, & burung terbang.' },
  { bulan: 4, semester: 1, judulTema: 'Bulan 4: Tanaman & Kebun Buah', ikon: '🍎', deskripsi: 'Berlari mengambil buah & gerakan pohon ditiup angin.' },
  { bulan: 5, semester: 1, judulTema: 'Bulan 5: Transportasi & Kendaraan', ikon: '🚗', deskripsi: 'Keseimbangan berdiri 1 kaki (pesawat) & lari irama.' },
  { bulan: 6, semester: 1, judulTema: 'Bulan 6: Halang Rintang Evaluasi Sem 1', ikon: '🏆', deskripsi: 'Kombinasi rintangan fisik, lompat, jinjit, & lempar.' },

  // SEMESTER 2 (BULAN 7 - 12)
  { bulan: 7, semester: 2, judulTema: 'Bulan 7: Alam Semesta & Cuaca', ikon: '☀️', deskripsi: 'Senam hujan & melompat genangan air, lari teduh.' },
  { bulan: 8, semester: 2, judulTema: 'Bulan 8: Profesi & Cita-Citaku', ikon: '👮', deskripsi: 'Baris-berbaris polisi cilik & lari cepat pemadam kebakaran.' },
  { bulan: 9, semester: 2, judulTema: 'Bulan 9: Makanan Sehat & Gizi', ikon: '🥦', deskripsi: 'Lari membawa nampan sehat & lompat tangkap buah.' },
  { bulan: 10, semester: 2, judulTema: 'Bulan 10: Seni, Musik & Warna', ikon: '🎨', deskripsi: 'Senam irama musik ceria & menari melingkar.' },
  { bulan: 11, semester: 2, judulTema: 'Bulan 11: Cinta Lingkungan', ikon: '🧹', deskripsi: 'Estafet membuang sampah pada tempatnya & jemur pakaian.' },
  { bulan: 12, semester: 2, judulTema: 'Bulan 12: Wisuda PAUD & Pentas', ikon: '🎓', deskripsi: 'Pentas seni, rintangan wisuda juara & estafet toga.' }
];

export const LIST_AKTIVITAS_KASAR: KartuAktivitasKasar[] = [
  // SEMESTER 1 (BULAN 1-6)
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
    id: 'b3-jalan-kepiting',
    bulan: 3,
    mingguKe: 11,
    judul: 'Jalan Kepiting Pantai 🦀',
    kategoriUsia: '4_tahun',
    kategoriMateri: 'hewan',
    deskripsi: 'Berjalan miring ke samping dengan lutut ditekuk.',
    instruksiGuru: [
      'Buka kedua kaki selebar bahu dan tekuk lutut 40 derajat.',
      'Buka kedua tangan seperti capit kepiting.',
      'Melangkah ke kanan 5 langkah, lalu ke kiri 5 langkah.'
    ],
    manfaat: 'Melatih koordinasi lateral panggul & ketahanan otot abduktor.',
    durasiDetik: 60,
    ikon: '🦀',
    tingkatKesulitan: 'Sedang',
    variasiGerak: ['Merayap telentang (Crab Walk)', 'Jalan kepiting cepat']
  },
  {
    id: 'b4-pohon-angin',
    bulan: 4,
    mingguKe: 13,
    judul: 'Senam Pohon Ditiup Angin 🌳',
    kategoriUsia: '3_tahun',
    kategoriMateri: 'sayur',
    deskripsi: 'Menjulurkan kedua tangan ke atas dan meliukkan badan.',
    instruksiGuru: [
      'Anak berdiri tegak melambaikan tangan tinggi-tinggi.',
      'Guru berakting sebagai angin sepoi-sepoi (liuk pelan) dan angin kencang (liuk cepat).',
      'Sentuh ujung kaki kiri dan kanan secara bergantian.'
    ],
    manfaat: 'Melatih kelenturan tulang belakang dan fleksibilitas pinggang.',
    durasiDetik: 45,
    ikon: '🌳',
    tingkatKesulitan: 'Mudah',
    variasiGerak: ['Meliuk memutar', 'Berputar di tempat']
  },
  {
    id: 'b4-petik-buah-lari',
    bulan: 4,
    mingguKe: 15,
    judul: 'Berlari Ambil Apel 🍎',
    kategoriUsia: '4_tahun',
    kategoriMateri: 'buah',
    deskripsi: 'Berlari zigzag memindahkan bola/buah dari titik A ke keranjang B.',
    instruksiGuru: [
      'Letakkan 5 bola plastik di ujung ruangan.',
      'Anak berlari 5 meter, mengambil 1 bola, lalu membawa kembali ke keranjang.',
      'Hitung total waktu tempuh bersama.'
    ],
    manfaat: 'Melatih kelincahan lari (agility), ketahanan jantung, dan koordinasi.',
    durasiDetik: 60,
    ikon: '🍎',
    tingkatKesulitan: 'Tantangan',
    variasiGerak: ['Lari sambil memegang mangkuk', 'Lari jinjit']
  },
  {
    id: 'b5-burung-bangau',
    bulan: 5,
    mingguKe: 17,
    judul: 'Keseimbangan Bangau & Pesawat 🦩',
    kategoriUsia: '5_tahun',
    kategoriMateri: 'kendaraan',
    deskripsi: 'Berdiri angkat 1 kaki selama 5-8 detik.',
    instruksiGuru: [
      'Peragakan angkat kaki kanan setinggi lutut.',
      'Rentangkan tangan ke samping untuk menjaga Keseimbangan.',
      'Hitung bersama guru: 1.. 2.. 3.. 4.. 5.. 6.. 7.. 8!',
      'Ganti dengan kaki kiri.'
    ],
    manfaat: 'Memperkuat engsel pergelangan kaki dan kontrol postur tubuh.',
    durasiDetik: 45,
    ikon: '🦩',
    tingkatKesulitan: 'Sedang',
    variasiGerak: ['Tutup mata 3 detik', 'Pukulkan tangan di atas kepala']
  },
  {
    id: 'b5-setir-mobil',
    bulan: 5,
    mingguKe: 19,
    judul: 'Menyetir Mobil Irama 🚗',
    kategoriUsia: '4_tahun',
    kategoriMateri: 'kendaraan',
    deskripsi: 'Berlari kecil memegang piringan setir sambil merespon sinyal "Maju/Rem".',
    instruksiGuru: [
      'Berikan piring plastik/papan kecil sebagai setir.',
      'Saat guru katakan "HIJAU", lari maju pelan. Saat "MERAH", berhenti mendadak.',
      'Saat "KUNING", jalan jinjit.'
    ],
    manfaat: 'Melatih kontrol dorongan impuls (inhibitory control) dan refleks.',
    durasiDetik: 60,
    ikon: '🚗',
    tingkatKesulitan: 'Tantangan',
    variasiGerak: ['Belok kanan/kiri mendadak', 'Lari mundur pelan']
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
  },

  // SEMESTER 2 (BULAN 7-12)
  {
    id: 'b7-senam-hujan',
    bulan: 7,
    mingguKe: 25,
    judul: 'Senam Hujan & Lompat Genangan 🌧️',
    kategoriUsia: '2_tahun',
    kategoriMateri: 'motorik_kasar',
    deskripsi: 'Menepukkan tangan ke atas menirukan tetes hujan & melompati lingkaran genangan.',
    instruksiGuru: [
      'Gunakan lingkaran hulahoop atau cetakan lingkaran kertas di lantai sebagai genangan.',
      'Anak melompat dari genangan ke genangan.',
      'Tepukkan jemari tinggi-tinggi "Tik.. Tik.. Tik.."'
    ],
    manfaat: 'Melatih koordinasi motorik kasar melompat dengan estimasi sasaran.',
    durasiDetik: 45,
    ikon: '🌧️',
    tingkatKesulitan: 'Mudah',
    variasiGerak: ['Lompat 1 kaki ke genangan', 'Lari teduh di bawah payung']
  },
  {
    id: 'b8-baris-polisi',
    bulan: 8,
    mingguKe: 29,
    judul: 'Baris-Berbaris Polisi Cilik 👮',
    kategoriUsia: '5_tahun',
    kategoriMateri: 'motorik_kasar',
    deskripsi: 'Berjalan tegap dengan irama "Kiri-Kanan" dan hormon siap grak.',
    instruksiGuru: [
      'Minta anak berbaris rapi di tempat.',
      'Ucapkan aba-aba "SIAP GRAK!", "SIAP GRAK!", "JALAN DI TEMPAT GRAK!"',
      'Ajak anak mengayunkan lengan setinggi dada.'
    ],
    manfaat: 'Melatih kedisiplinan postur tubuh dan koordinasi tangan-kaki serentak.',
    durasiDetik: 60,
    ikon: '👮',
    tingkatKesulitan: 'Sedang',
    variasiGerak: ['Hormat grak 3 detik', 'Lari siap siaga']
  },
  {
    id: 'b9-nampan-sehat',
    bulan: 9,
    mingguKe: 33,
    judul: 'Estafet Nampan Makanan Sehat 🥦',
    kategoriUsia: '4_tahun',
    kategoriMateri: 'sayur',
    deskripsi: 'Berjalan membawa nampan berisi buah plastik tanpa terjatuh.',
    instruksiGuru: [
      'Berikan nampan plastik dengan 2 buah mainan di atasnya.',
      'Minta anak berjalan 4 meter menuju meja penerima.',
      'Jagalah agar nampan tetap sejajar dada.'
    ],
    manfaat: 'Melatih kestabilan siku, pundak, dan kontrol gerak halus-kasar gabungan.',
    durasiDetik: 60,
    ikon: '🥦',
    tingkatKesulitan: 'Sedang',
    variasiGerak: ['Berjalan cepat', 'Melangkah melewatu garis']
  },
  {
    id: 'b10-senam-musik',
    bulan: 10,
    mingguKe: 37,
    judul: 'Senam Irama Musik Ceria 🎵',
    kategoriUsia: '3_tahun',
    kategoriMateri: 'motorik_kasar',
    deskripsi: 'Mengoyangkan pinggul dan mengangkat kedua tangan sesuai tempo drum.',
    instruksiGuru: [
      'Putar musik berirama riang.',
      'Minta anak bergoyang ke kiri 2x dan ke kanan 2x.',
      'Putar badan 360 derajat di akhir irama.'
    ],
    manfaat: 'Ekspresi kesenian diri dan fleksibilitas fisik anak.',
    durasiDetik: 60,
    ikon: '🎵',
    tingkatKesulitan: 'Mudah',
    variasiGerak: ['Tepuk tangan di belakang', 'Lompat mengikuti simbal']
  },
  {
    id: 'b11-estafet-sampah',
    bulan: 11,
    mingguKe: 41,
    judul: 'Estafet Kebersihan Lingkungan 🧹',
    kategoriUsia: '5_tahun',
    kategoriMateri: 'motorik_kasar',
    deskripsi: 'Berlari mengambil bola kotor dan membuang ke tong sampah warna.',
    instruksiGuru: [
      'Sebarkan 6 bola plastik warna merah (organik) dan hijau (anorganik).',
      'Bimbing anak berlari, memilah warna, lalu memasukannya ke keranjang yang sesuai.'
    ],
    manfaat: 'Melatih pemahaman kategori logika + kelincahan fisik anak.',
    durasiDetik: 60,
    ikon: '🧹',
    tingkatKesulitan: 'Tantangan',
    variasiGerak: ['Menjepit baju dengan jepitan jemuran', 'Menyapu bola']
  },
  {
    id: 'b12-wisuda-juara',
    bulan: 12,
    mingguKe: 45,
    judul: 'Rintangan Wisuda Juara 🎓',
    kategoriUsia: '5_tahun',
    kategoriMateri: 'motorik_kasar',
    deskripsi: 'Pentas rintangan puncak tahunan: Melompat, Berlari, & Berdiri Keseimbangan Toga.',
    instruksiGuru: [
      'Susun karpet merah wisuda dengan 3 post tantangan.',
      'Post 1: Melompat 3 lingkaran emas.',
      'Post 2: Berdiri 1 kaki 5 detik.',
      'Post 3: Menerima sertifikat dan membungkuk hormat.'
    ],
    manfaat: 'Evaluasi puncak seluruh perkembangan motorik kasar 1 tahun penuh.',
    durasiDetik: 90,
    ikon: '🎓',
    tingkatKesulitan: 'Tantangan',
    variasiGerak: ['Parade wisuda bersama', 'Foto pose kelulusan']
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
            <span className="text-xs uppercase font-extrabold text-sky-600 tracking-wider">Kurikulum Motorik Kasar 1 Tahun Penuh (48 Minggu / Semester 1 & 2)</span>
            <h2 className="text-2xl font-black text-sky-900 flex items-center gap-2">
              <span>🏃</span> Panduan & Jurnal Aktivitas Fisik Guru
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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      selectedAktivitas.id === akt.id ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-800'
                    }`}>
                      Usia: {akt.kategoriUsia.replace('_tahun', ' Tahun')}
                    </span>
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
                <span className="text-xs font-extrabold text-sky-600 uppercase bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                  Bulan #{selectedAktivitas.bulan} • Minggu Ke-{selectedAktivitas.mingguKe}
                </span>
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
                <span>📋</span> Panduan Instruksi Langkah-demi-Langkah Guru:
              </h4>
              <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                {selectedAktivitas.instruksiGuru.map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl text-xs text-amber-900 font-medium mb-6 border border-amber-200">
              💡 <strong>Manfaat Stimulasi Motorik Kasar:</strong> {selectedAktivitas.manfaat}
            </div>

            {/* FORM EVALUASI SISWA */}
            <form onSubmit={handleSimpanEvaluasi} className="border-t pt-4 border-slate-200">
              <h4 className="font-bold text-sky-900 text-sm mb-3 flex items-center gap-1">
                <span>✍️</span> Catat Evaluasi Anak pada Aktivitas Bulan #{selectedAktivitas.bulan} (Minggu #{selectedAktivitas.mingguKe}):
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
                        {m.fotoEmoji} {m.nama} (Usia {m.kategoriUsia.replace('_tahun', ' Tahun')})
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
                  placeholder="Contoh: Menyeimbangkan badan 5 detik dengan semangat..."
                  value={catatanGuru}
                  onChange={(e) => setCatatanGuru(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg hover:bg-sky-700 transition-transform active:scale-98 flex items-center justify-center gap-2"
              >
                <span>💾</span> Simpan Hasil Evaluasi Motorik Kasar (Bulan #{selectedAktivitas.bulan})
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
