import { AktivitasSensorik, IndikatorObservasiSensorik } from '../types/paudTypes';

// ============================================================================
// DATA SEED 45 AKTIVITAS GERAK & SENSORIK (BAGIAN 3 PROMPT 10)
// Seluruh bahasa mematuhi Bagian 1: Tanpa klaim kecerdasan/IQ/otak kiri-kanan.
// Bahasa terfokus pada: Melatih koordinasi, keseimbangan, kesadaran posisi tubuh, & siap belajar.
// ============================================================================

export const SEED_AKTIVITAS_SENSORIK: AktivitasSensorik[] = [
  // --------------------------------------------------------------------------
  // KELOMPOK USIA 2-3 TAHUN (Tema: "Merasakan Tubuh", Maks: 5 Menit)
  // --------------------------------------------------------------------------
  // VESTIBULAR
  {
    id: 's-23-01',
    nama: 'Ayunan Pelan',
    kelompokUsia: '2-3',
    kategori: 'Vestibular',
    caraMelakukan: 'Dudukkan anak di ayunan, dorong pelan setinggi lutut guru. Berhenti bila anak menegang atau menangis.',
    alatDibutuhkan: ['Ayunan'],
    durasiDetik: 60,
    bisaIndoor: false,
    bisaOutdoor: true,
    catatanKeamanan: 'Jangan didorong tinggi. Ikuti reaksi dan rasa nyaman anak.',
    ikon: '🛝'
  },
  {
    id: 's-23-02',
    nama: 'Berguling di Matras',
    kelompokUsia: '2-3',
    kategori: 'Vestibular',
    caraMelakukan: 'Anak berbaring lalu berguling ke samping sepanjang matras. Guru mendampingi di sisi melatih kelenturan posisi tubuh.',
    alatDibutuhkan: ['Matras'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🥋'
  },
  {
    id: 's-23-03',
    nama: 'Duduk di Bola Besar',
    kelompokUsia: '2-3',
    kategori: 'Vestibular',
    caraMelakukan: 'Anak duduk di atas bola besar, guru memegang pinggangnya lalu memantulkan pelan untuk melatih keseimbangan tubuh.',
    alatDibutuhkan: ['Bola gym'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: 'Guru tidak boleh melepas pegangan pada pinggang anak.',
    ikon: '⚽'
  },
  {
    id: 's-23-04',
    nama: 'Naik Turun Anak Tangga Rendah',
    kelompokUsia: '2-3',
    kategori: 'Vestibular',
    caraMelakukan: 'Anak naik dan turun 3 anak tangga rendah, boleh berpegangan tangan guru atau pegangan tangga.',
    alatDibutuhkan: ['Anak tangga rendah'],
    durasiDetik: 90,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🪜'
  },
  // PROPRIOSEPTIF
  {
    id: 's-23-05',
    nama: 'Gulung Lumpia',
    kelompokUsia: '2-3',
    kategori: 'Proprioseptif',
    caraMelakukan: 'Anak digulung selimut lembut sampai bahu, ditepuk pelan melatih kesadaran posisi tubuh, lalu dibuka kembali.',
    alatDibutuhkan: ['Selimut'],
    durasiDetik: 45,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: 'Kepala dan wajah tidak boleh tertutup selimut.',
    ikon: '🛏️'
  },
  {
    id: 's-23-06',
    nama: 'Merangkak Terowongan',
    kelompokUsia: '2-3',
    kategori: 'Proprioseptif',
    caraMelakukan: 'Anak merangkak melewati terowongan kardus atau kain untuk melatih tumpuan lengan dan lutut.',
    alatDibutuhkan: ['Kardus', 'Terowongan kain'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '🛖'
  },
  {
    id: 's-23-07',
    nama: 'Pindahkan Ember Bola',
    kelompokUsia: '2-3',
    kategori: 'Proprioseptif',
    caraMelakukan: 'Anak mengangkat ember berisi beberapa bola dari titik A ke B untuk melatih kesiapan tumpuan otot tangan.',
    alatDibutuhkan: ['Ember', 'Bola plastik'],
    durasiDetik: 90,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🪣'
  },
  {
    id: 's-23-08',
    nama: 'Peluk Beruang',
    kelompokUsia: '2-3',
    kategori: 'Proprioseptif',
    caraMelakukan: 'Guru memeluk anak erat namun nyaman selama 10 detik, atau anak memeluk bantal besar agar membantu tenang.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 10,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '🧸'
  },
  // TAKTIL
  {
    id: 's-23-09',
    nama: 'Bak Beras',
    kelompokUsia: '2-3',
    kategori: 'Taktil',
    caraMelakukan: 'Anak menyendok, menuang, dan mencari benda tersembunyi di dalam bak beras atau pasir halus.',
    alatDibutuhkan: ['Bak', 'Beras/pasir', 'Sendok'],
    durasiDetik: 120,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🌾'
  },
  {
    id: 's-23-10',
    nama: 'Remas Playdough',
    kelompokUsia: '2-3',
    kategori: 'Taktil',
    caraMelakukan: 'Anak meremas, memipihkan, dan membentuk playdough melatih kesiapan jemari tangan untuk memegang pensil.',
    alatDibutuhkan: ['Playdough'],
    durasiDetik: 120,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '🎨'
  },
  {
    id: 's-23-11',
    nama: 'Jalan Tanpa Alas Kaki',
    kelompokUsia: '2-3',
    kategori: 'Taktil',
    caraMelakukan: 'Anak berjalan di atas rumput, keset, dan matras secara bergantian melatih kepekaan sentuhan telapak kaki.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 90,
    bisaIndoor: false,
    bisaOutdoor: true,
    catatanKeamanan: 'Periksa lintasan dari benda tajam atau basah licin terlebih dahulu.',
    ikon: '👣'
  },
  // BRAIN GYM
  {
    id: 's-23-12',
    nama: 'Minum Air',
    kelompokUsia: '2-3',
    kategori: 'Brain Gym',
    caraMelakukan: 'Ajak anak minum air secukupnya sebelum aktivitas dimulai agar tubuh terhidrasi dan siap belajar.',
    alatDibutuhkan: ['Air minum'],
    durasiDetik: 30,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '💧'
  },
  {
    id: 's-23-13',
    nama: 'Sakelar Otak (duduk)',
    kelompokUsia: '2-3',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak memijat pelan area bawah tulang selangka dengan satu tangan, tangan lain diletakkan di pusar sambil bernapas tenang.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 30,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🔘'
  },
  {
    id: 's-23-14',
    nama: 'Gerakan Silang Duduk',
    kelompokUsia: '2-3',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak duduk, menepuk lutut kanan dengan tangan kiri lalu lutut kiri dengan tangan kanan secara bergantian (menyeberangi garis tengah tubuh).',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 45,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🚸'
  },

  // --------------------------------------------------------------------------
  // KELOMPOK USIA 3-4 TAHUN (Tema: "Mengendalikan Tubuh", Maks: 8 Menit)
  // --------------------------------------------------------------------------
  // VESTIBULAR
  {
    id: 's-34-15',
    nama: 'Berdiri Satu Kaki',
    kelompokUsia: '3-4',
    kategori: 'Vestibular',
    caraMelakukan: 'Anak berdiri satu kaki selama 3 detik, boleh berpegangan pada sandaran kursi untuk melatih keseimbangan posisi tubuh.',
    alatDibutuhkan: ['Kursi (opsional)'],
    durasiDetik: 30,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🦩'
  },
  {
    id: 's-34-16',
    nama: 'Lompat Dua Kaki di Tempat',
    kelompokUsia: '3-4',
    kategori: 'Vestibular',
    caraMelakukan: 'Anak melompat dengan dua kaki bersamaan di tempat sebanyak 10 kali melatih koordinasi pendaratan kaki.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 45,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🐰'
  },
  {
    id: 's-34-17',
    nama: 'Titian Balok Rendah',
    kelompokUsia: '3-4',
    kategori: 'Vestibular',
    caraMelakukan: 'Anak berjalan di atas balok keseimbangan rendah atau garis lakban lurus melatih kontrol tumpuan kaki.',
    alatDibutuhkan: ['Balok rendah / lakban'],
    durasiDetik: 90,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🪵'
  },
  {
    id: 's-34-18',
    nama: 'Putar Tiga Kali',
    kelompokUsia: '3-4',
    kategori: 'Vestibular',
    caraMelakukan: 'Anak berputar 3 kali lalu berhenti dan berdiri diam menenangkan tumpuan tubuh.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 30,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: 'Maksimal 3 putaran lalu istirahat. Hentikan bila anak mengeluh pusing atau mual.',
    ikon: '🌀'
  },
  // PROPRIOSEPTIF
  {
    id: 's-34-19',
    nama: 'Gerobak Dorong',
    kelompokUsia: '3-4',
    kategori: 'Proprioseptif',
    caraMelakukan: 'Guru memegang kedua paha/kaki anak, anak berjalan melangkah dengan kedua tangannya di matras sejauh 2 meter.',
    alatDibutuhkan: ['Matras'],
    durasiDetik: 45,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🛒'
  },
  {
    id: 's-34-20',
    nama: 'Dorong Dinding',
    kelompokUsia: '3-4',
    kategori: 'Proprioseptif',
    caraMelakukan: 'Anak mendorong dinding sekuat tenaga selama 10 detik, diulang 3 kali untuk melatih tumpuan otot dada dan lengan.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 45,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '🧱'
  },
  {
    id: 's-34-21',
    nama: 'Lompat ke Tumpukan Bantal',
    kelompokUsia: '3-4',
    kategori: 'Proprioseptif',
    caraMelakukan: 'Anak melompat dari ketinggian rendah (setinggi lutut) ke tumpukan bantal empuk di lantai.',
    alatDibutuhkan: ['Bantal / matras tebal'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: 'Tinggi lompatan maksimal setinggi lutut anak.',
    ikon: '🛋️'
  },
  // TAKTIL & VISUAL
  {
    id: 's-34-22',
    nama: 'Tebak Benda dalam Kantong',
    kelompokUsia: '3-4',
    kategori: 'Taktil',
    caraMelakukan: 'Anak memasukkan tangan ke kantong dan menebak bentuk benda hanya dengan rabaan jari tanpa melihat.',
    alatDibutuhkan: ['Kantong kain', '5 benda'],
    durasiDetik: 90,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '🛍️'
  },
  {
    id: 's-34-23',
    nama: 'Meronce Manik Besar',
    kelompokUsia: '3-4',
    kategori: 'Taktil',
    caraMelakukan: 'Anak memasukkan manik-manik berukuran besar ke dalam tali melatih koordinasi mata dan tangan.',
    alatDibutuhkan: ['Manik besar', 'Tali'],
    durasiDetik: 120,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: 'Gunakan manik berukuran besar agar aman. Guru mendampingi terus.',
    ikon: '📿'
  },
  {
    id: 's-34-24',
    nama: 'Jepit Pom-Pom',
    kelompokUsia: '3-4',
    kategori: 'Visual-Motor',
    caraMelakukan: 'Anak memindahkan bola pom-pom memakai jepitan jemuran dari wadah A ke wadah B melatih otot genggaman jemari.',
    alatDibutuhkan: ['Jepitan jemuran', 'Pom-pom', '2 wadah'],
    durasiDetik: 120,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '🧺'
  },
  // BRAIN GYM
  {
    id: 's-34-25',
    nama: 'Gerakan Silang Berdiri',
    kelompokUsia: '3-4',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak berdiri, mengangkat lutut kanan menyentuh siku atau tangan kiri, lalu bergantian secara perlahan (menyeberangi garis tengah tubuh).',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🚸'
  },
  {
    id: 's-34-26',
    nama: 'Burung Hantu',
    kelompokUsia: '3-4',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak memegang bahu satu sisi, menoleh pelan ke kiri dan kanan sambil menarik napas dalam membantu anak lebih tenang.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 45,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🦉'
  },
  {
    id: 's-34-27',
    nama: 'Coret Ganda di Udara',
    kelompokUsia: '3-4',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak menggerakkan kedua tangan bersamaan membuat bentuk cermin yang sama di udara melatih koordinasi mata dan tangan.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '✍️'
  },
  {
    id: 's-34-28',
    nama: 'Kait Relaks',
    kelompokUsia: '3-4',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak menyilangkan kaki, menyilangkan tangan di depan dada, memejamkan mata, dan menarik napas pelan untuk menenangkan diri.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🧘'
  },

  // --------------------------------------------------------------------------
  // KELOMPOK USIA 4-5 TAHUN (Tema: "Menyiapkan Tangan untuk Menulis", Maks: 10 Menit)
  // --------------------------------------------------------------------------
  // VESTIBULAR
  {
    id: 's-45-29',
    nama: 'Berdiri Satu Kaki Mata Tertutup',
    kelompokUsia: '4-5',
    kategori: 'Vestibular',
    caraMelakukan: 'Anak berdiri satu kaki 8 detik, lalu diulang dengan mata tertutup melatih kesadaran posisi tubuh yang mendalam.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🦩'
  },
  {
    id: 's-45-30',
    nama: 'Jalan Tumit Jari Kaki',
    kelompokUsia: '4-5',
    kategori: 'Vestibular',
    caraMelakukan: 'Anak berjalan di atas garis lakban dengan tumit depan menempel ujung jari kaki belakang secara presisi.',
    alatDibutuhkan: ['Lakban garis'],
    durasiDetik: 90,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '👟'
  },
  {
    id: 's-45-31',
    nama: 'Lompat Tali Ular',
    kelompokUsia: '4-5',
    kategori: 'Vestibular',
    caraMelakukan: 'Guru menggoyang tali rendah di lantai, anak melompat atau melangkahinya tanpa menyentuh tali melatih ritme pergerakan.',
    alatDibutuhkan: ['Tali'],
    durasiDetik: 90,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🐍'
  },
  {
    id: 's-45-32',
    nama: 'Sirkuit Empat Pos',
    kelompokUsia: '4-5',
    kategori: 'Vestibular',
    caraMelakukan: 'Anak menyelesaikan empat pos berurutan: merangkak, meniti balok, melompat, dan melempar bola.',
    alatDibutuhkan: ['Perlengkapan pos'],
    durasiDetik: 180,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🏆'
  },
  // PROPRIOSEPTIF
  {
    id: 's-45-33',
    nama: 'Pose Hewan',
    kelompokUsia: '4-5',
    kategori: 'Proprioseptif',
    caraMelakukan: 'Anak menahan pose pohon, bangau, atau kucing selama 10 detik per pose untuk melatih tumpuan tensional otot.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🧘‍♀️'
  },
  {
    id: 's-45-34',
    nama: 'Tarik Tambang Berpasangan',
    kelompokUsia: '4-5',
    kategori: 'Proprioseptif',
    caraMelakukan: 'Dua anak saling menarik tali dengan posisi duduk melatih kekuatan tarikan bahu dan lengan.',
    alatDibutuhkan: ['Tali tebal'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: 'Lakukan dalam posisi duduk di matras, bukan berdiri. Guru mendampingi rapat.',
    ikon: '🪢'
  },
  {
    id: 's-45-35',
    nama: 'Angkat Pindah Kursi Kecil',
    kelompokUsia: '4-5',
    kategori: 'Proprioseptif',
    caraMelakukan: 'Anak mengangkat kursi kecil plastik dan memindahkannya ke tempat yang ditentukan melatih kontrol daya angkat.',
    alatDibutuhkan: ['Kursi anak'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '🪑'
  },
  // VISUAL-MOTOR
  {
    id: 's-45-36',
    nama: 'Ikuti Cahaya Senter',
    kelompokUsia: '4-5',
    kategori: 'Visual-Motor',
    caraMelakukan: 'Anak mengikuti gerak titik cahaya senter di dinding hanya dengan gerakan mata, posisi kepala tetap diam.',
    alatDibutuhkan: ['Senter'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '🔦'
  },
  {
    id: 's-45-37',
    nama: 'Lempar ke Sasaran',
    kelompokUsia: '4-5',
    kategori: 'Visual-Motor',
    caraMelakukan: 'Anak melempar bola kecil ke keranjang berjarak 2 meter melatih koordinasi ketepatan mata dan tangan.',
    alatDibutuhkan: ['Bola kecil', 'Keranjang'],
    durasiDetik: 120,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🎯'
  },
  {
    id: 's-45-38',
    nama: 'Jiplak Pola Bertingkat',
    kelompokUsia: '4-5',
    kategori: 'Visual-Motor',
    caraMelakukan: 'Anak menjiplak bentuk berurutan: lingkaran, silang, kotak, dan segitiga untuk menyiapkan kesiapan tangan menulis.',
    alatDibutuhkan: ['Kertas', 'Krayon'],
    durasiDetik: 180,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '📐'
  },
  {
    id: 's-45-39',
    nama: 'Gunting Garis',
    kelompokUsia: '4-5',
    kategori: 'Visual-Motor',
    caraMelakukan: 'Anak menggunting kertas mengikuti garis lurus lalu garis lengkung melatih otot genggaman halus jemari.',
    alatDibutuhkan: ['Gunting anak', 'Kertas bergaris'],
    durasiDetik: 180,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: 'Gunakan gunting khusus anak dengan ujung tumpul. Guru mendampingi terus.',
    ikon: '✂️'
  },
  // BRAIN GYM
  {
    id: 's-45-40',
    nama: 'Angka 8 Malas di Udara',
    kelompokUsia: '4-5',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak menjulurkan satu tangan ke depan, membuat bentuk angka 8 tidur di udara, mata mengikuti arah tangan. 3 putaran tiap tangan.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '♾️'
  },
  {
    id: 's-45-41',
    nama: 'Angka 8 Malas di Kertas',
    kelompokUsia: '4-5',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak menggambar angka 8 tidur berulang di kertas besar, bergantian tangan kanan dan kiri melatih kelenturan genggaman.',
    alatDibutuhkan: ['Kertas besar', 'Krayon'],
    durasiDetik: 120,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '🖍️'
  },
  {
    id: 's-45-42',
    nama: 'Coret Ganda Simetris',
    kelompokUsia: '4-5',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak menggambar bentuk cermin yang sama dengan kedua tangan bersamaan di atas kertas melatih koordinasi kedua tangan.',
    alatDibutuhkan: ['Kertas', '2 krayon'],
    durasiDetik: 120,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '🖌️'
  },
  {
    id: 's-45-43',
    nama: 'Gerakan Gajah',
    kelompokUsia: '4-5',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak menempelkan telinga ke bahu, tangan lurus ke depan, lalu menggambar angka 8 tidur dengan seluruh ayunan badan.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '🐘'
  },
  {
    id: 's-45-44',
    nama: 'Gerakan Silang Lambat Mata Tertutup',
    kelompokUsia: '4-5',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak melakukan gerakan menepuk siku ke lutut silang secara perlahan sambil memejamkan mata.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: false,
    catatanKeamanan: null,
    ikon: '🧘‍♂️'
  },
  {
    id: 's-45-45',
    nama: 'Putar Leher dan Topi Berpikir',
    kelompokUsia: '4-5',
    kategori: 'Brain Gym',
    caraMelakukan: 'Anak memutar leher pelan, lalu memijat dan menarik pelan daun telinga dari atas ke bawah membantu anak tenang dan fokus.',
    alatDibutuhkan: ['Tanpa alat'],
    durasiDetik: 60,
    bisaIndoor: true,
    bisaOutdoor: true,
    catatanKeamanan: null,
    ikon: '👂'
  }
];

// ============================================================================
// DATA SEED 18 INDIKATOR OBSERVASI SENSORIK (BAGIAN 3 PROMPT 10)
// ============================================================================

export const SEED_INDIKATOR_SENSORIK: IndikatorObservasiSensorik[] = [
  // USIA 2-3 TAHUN
  {
    id: 'ind-23-01',
    kelompokUsia: '2-3',
    pernyataan: 'Mau naik ayunan tanpa menangis',
    aktivitasTerkait: ['s-23-01']
  },
  {
    id: 'ind-23-02',
    kelompokUsia: '2-3',
    pernyataan: 'Berjalan 3 langkah di garis lurus',
    aktivitasTerkait: ['s-23-04', 's-23-11']
  },
  {
    id: 'ind-23-03',
    kelompokUsia: '2-3',
    pernyataan: 'Merangkak masuk terowongan sendiri',
    aktivitasTerkait: ['s-23-06']
  },
  {
    id: 'ind-23-04',
    kelompokUsia: '2-3',
    pernyataan: 'Mau menyentuh tekstur baru',
    aktivitasTerkait: ['s-23-09', 's-23-10', 's-23-11']
  },
  {
    id: 'ind-23-05',
    kelompokUsia: '2-3',
    pernyataan: 'Menendang bola ke arah depan',
    aktivitasTerkait: ['s-23-07']
  },
  {
    id: 'ind-23-06',
    kelompokUsia: '2-3',
    pernyataan: 'Menepuk lutut menyilang 5 kali',
    aktivitasTerkait: ['s-23-14']
  },

  // USIA 3-4 TAHUN
  {
    id: 'ind-34-07',
    kelompokUsia: '3-4',
    pernyataan: 'Berdiri satu kaki 3 detik',
    aktivitasTerkait: ['s-34-15']
  },
  {
    id: 'ind-34-08',
    kelompokUsia: '3-4',
    pernyataan: 'Melompat dengan dua kaki bersamaan',
    aktivitasTerkait: ['s-34-16', 's-34-21']
  },
  {
    id: 'ind-34-09',
    kelompokUsia: '3-4',
    pernyataan: 'Melakukan gerakan silang 5 kali tanpa bingung sisi',
    aktivitasTerkait: ['s-34-25']
  },
  {
    id: 'ind-34-10',
    kelompokUsia: '3-4',
    pernyataan: 'Berjalan di garis 2 meter tanpa keluar',
    aktivitasTerkait: ['s-34-17']
  },
  {
    id: 'ind-34-11',
    kelompokUsia: '3-4',
    pernyataan: 'Menangkap bola besar dengan dua tangan',
    aktivitasTerkait: ['s-34-19', 's-34-21']
  },
  {
    id: 'ind-34-12',
    kelompokUsia: '3-4',
    pernyataan: 'Memindahkan 5 pom-pom dengan jepitan',
    aktivitasTerkait: ['s-34-24']
  },

  // USIA 4-5 TAHUN
  {
    id: 'ind-45-13',
    kelompokUsia: '4-5',
    pernyataan: 'Berdiri satu kaki 8 detik',
    aktivitasTerkait: ['s-45-29']
  },
  {
    id: 'ind-45-14',
    kelompokUsia: '4-5',
    pernyataan: 'Menjiplak bentuk silang dan kotak',
    aktivitasTerkait: ['s-45-38']
  },
  {
    id: 'ind-45-15',
    kelompokUsia: '4-5',
    pernyataan: 'Membuat angka 8 tidur 3 putaran tanpa terputus',
    aktivitasTerkait: ['s-45-40', 's-45-41']
  },
  {
    id: 'ind-45-16',
    kelompokUsia: '4-5',
    pernyataan: 'Menangkap bola sedang dengan telapak tangan',
    aktivitasTerkait: ['s-45-37']
  },
  {
    id: 'ind-45-17',
    kelompokUsia: '4-5',
    pernyataan: 'Menggunting mengikuti garis',
    aktivitasTerkait: ['s-45-39']
  },
  {
    id: 'ind-45-18',
    kelompokUsia: '4-5',
    pernyataan: 'Menyelesaikan sirkuit 4 pos secara berurutan',
    aktivitasTerkait: ['s-45-32']
  }
];

// UTILITY PEMBANTU PERHITUNGAN KELOMPOK USIA DARI TANGGAL LAHIR
export function hitungKelompokUsiaFromBirthdate(tanggalLahir?: string, fallbackUsiaSpesifik?: string): '2-3' | '3-4' | '4-5' {
  if (!tanggalLahir) {
    if (fallbackUsiaSpesifik === '2_tahun') return '2-3';
    if (fallbackUsiaSpesifik === '3_tahun') return '2-3';
    if (fallbackUsiaSpesifik === '4_tahun') return '3-4';
    if (fallbackUsiaSpesifik === '5_tahun') return '4-5';
    return '3-4';
  }

  const birth = new Date(tanggalLahir);
  const now = new Date();
  let diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());

  if (diffMonths < 36) return '2-3';
  if (diffMonths < 48) return '3-4';
  return '4-5';
}
