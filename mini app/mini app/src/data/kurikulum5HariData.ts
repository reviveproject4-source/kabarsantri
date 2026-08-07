import { KegiatanHarianKurikulum, KebiasaanAdabMingguan } from '../types/paudTypes';

// BENANG ADAB HARIAN (48 MINGGU UNTUK 12 BULAN)
export const KEBIASAAN_ADAB_LIST: KebiasaanAdabMingguan[] = [
  {
    mingguKe: 1,
    judulAdab: 'Mengembalikan Mainan ke Tempat Semula 🧸',
    deskripsi: 'Melatih kerapian, rasa tanggung jawab, dan disiplin setelah selesai bermain.',
    indikator: [
      'Menaruh mainan ke kotak penyimpanan tanpa diperintah 2 kali',
      'Merapikan alat tulis/krayon setelah mewarnai',
      'Membantu teman merapikan arena kelas'
    ],
    contohSituasi: 'Setelah jam main bebas, guru menyanyikan lagu "Beres-beres", anak melangkah mengambil mainannya dan memasukkannya ke ranjang sesuai label.'
  },
  {
    mingguKe: 2,
    judulAdab: 'Mengucapkan Terima Kasih Tanpa Diingatkan 🤝',
    deskripsi: 'Menanamkan rasa syukur dan apresiasi atas kebaikan orang lain.',
    indikator: [
      'Ucap "terima kasih" saat menerima makanan/alat dari guru atau teman',
      'Mengangguk dan tersenyum ramah',
      'Merasa senang ketika diberi bantuan'
    ],
    contohSituasi: 'Saat membagikan kertas gambar atau snack pagi, anak spontan mengucap "Terima kasih Ustadzah".'
  },
  {
    mingguKe: 3,
    judulAdab: 'Menunggu Giliran Tanpa Merebut ⏳',
    deskripsi: 'Melatih kontrol diri, kesabaran, dan menghargai hak teman.',
    indikator: [
      'Berdiri dalam antrean dengan tenang',
      'Tidak menarik barang yang sedang dipegang teman',
      'Menggunakan kata "setelah kamu, aku ya"'
    ],
    contohSituasi: 'Saat hendak mencuci tangan sebelum makan atau giliran maju ke depan proyektor.'
  },
  {
    mingguKe: 4,
    judulAdab: 'Mengucap Salam Saat Masuk & Keluar Kelas 🚪',
    deskripsi: 'Membangun kebiasaan santun dan menyebarkan kedamaian.',
    indikator: [
      'Mengucap "Assalamu\'alaikum" atau salam hangat saat mengetuk pintu',
      'Menjawab salam dari teman atau guru',
      'Melambaikan tangan santun saat pulang'
    ],
    contohSituasi: 'Pagi hari saat anak melangkah melewati pintu kelas dan sore hari saat dijemput orang tua.'
  },
  {
    mingguKe: 5,
    judulAdab: 'Meminta Izin Sebelum Memakai Barang Orang Lain ✏️',
    deskripsi: 'Menghargai kepemilikan orang lain dan tata krama berinteraksi.',
    indikator: [
      'Menanyakan "Boleh aku pinjam?" sebelum mengambil barang',
      'Menunggu jawaban "Boleh" sebelum menyentuh',
      'Mengembalikan barang dalam keadaan baik'
    ],
    contohSituasi: 'Ketika melihat krayon warna merah milik teman di meja sebelah.'
  },
  {
    mingguKe: 6,
    judulAdab: 'Mengucap Maaf Saat Berbuat Salah 🙇',
    deskripsi: 'Menumbuhkan kebesaran jiwa, kejujuran, dan empati sosial.',
    indikator: [
      'Mengakui kesalahan tanpa bersikap galak/menangis',
      'Mengucap "Maaf ya" dengan ikhlas',
      'Bersalaman atau memeluk teman setelah memaafkan'
    ],
    contohSituasi: 'Saat tidak sengaja menyenggol susunan balok teman hingga roboh.'
  },
  {
    mingguKe: 7,
    judulAdab: 'Menghormati Yang Lebih Tua (Salim & Menunduk) 🧕',
    deskripsi: 'Menanamkan rasa hormat kepada guru, orang tua, dan pengasuh.',
    indikator: [
      'Mencium tangan (salim) guru saat menyambut di pagi hari',
      'Menundukkan badan sedikit saat melintas di depan guru',
      'Berbicara dengan nada suara lembut'
    ],
    contohSituasi: 'Ketika berjalan melintasi Ustadzah yang sedang duduk di karpet.'
  },
  {
    mingguKe: 8,
    judulAdab: 'Berbicara Santun (Gunakan Permisi & Tolong) 🗣️',
    deskripsi: 'Membiasakan kata ajaib dalam komunikasi harian.',
    indikator: [
      'Menggunakan kata "Tolong" saat butuh bantuan',
      'Mengucapkan "Permisi" saat ingin lewat',
      'Tidak memotong pembicaraan orang lain'
    ],
    contohSituasi: 'Anak kesulitan membuka tutup botol minum dan meminta bantuan guru.'
  }
];

// BANK KURIKULUM BULAN 1 FULL (20 KEGIATAN UTAMA + 40 ALTERNATIF + CADANGAN INDOOR RABU)
export const KURIKULUM_BULAN_1_LIST: KegiatanHarianKurikulum[] = [
  // ==========================================
  // MINGGU 1 (HARI 1 - 5)
  // ==========================================
  {
    id: 'm1-senin',
    bulan: 1,
    mingguKe: 1,
    hari: 'senin',
    domainUtama: 'logika',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Doa pembuka bersama, salam hangat, dan lagu pemanasan otak "Dua Mata Saya".'
    },
    inti: {
      durasi: '25 Menit',
      judul: 'Cocok Bentuk Geometri & Bayangan Buah 🍎',
      deskripsi: 'Anak mengamati kartu/benda buah berbentuk lingkaran (apel), lonjong (pisang), dan segitiga (potongan semangka) lalu mencocokkannya ke pola bayangan.',
      alatAlat: ['Kartu bentuk buah berwarna', 'Papan bayangan geometri', 'Buah tiruan plastik'],
      instruksiGuru: [
        'Tunjukkan buah tiruan apel dan tanya: "Bentuknya bulat seperti apa?"',
        'Minta anak menempatkan buah di atas papan bayangan yang sesuai.',
        'Puji setiap anak yang berhasil meletakkan dengan tepat.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Refleksi singkat menyebut nama buah & mencatat observasi kemandirian anak.'
    },
    alternatif: [
      {
        judul: 'Pencocokan Bentuk Wadah Makan 🍱',
        deskripsi: 'Mengelompokkan kotak makan berdasarkan bentuk penutupnya (Persegi vs Lingkaran).',
        alasanDigunakan: 'Digunakan jika kartu gambar buah belum tercetak.'
      },
      {
        judul: 'Tebak Bayangan Benda Kelas 🪑',
        deskripsi: 'Mencocokkan bayangan kursi dan bola kertas menggunakan lampu senter.',
        alasanDigunakan: 'Digunakan jika ingin suasana kelas redup/sensorik.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Mencocokkan 2 bentuk dasar (Lingkaran & Persegi).',
      usia4: 'Mencocokkan 3 bentuk (Lingkaran, Persegi, Segitiga).',
      usia5: 'Mencocokkan 4 bentuk termasuk Bintang & Oval secara mandiri.'
    },
    gameIdRef: 'bentuk'
  },
  {
    id: 'm1-selasa',
    bulan: 1,
    mingguKe: 1,
    hari: 'selasa',
    domainUtama: 'motorik_halus',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Senam jemari "Buka Tutup Tangan" dan doa sebelum belajar.'
    },
    inti: {
      durasi: '20 Menit',
      judul: 'Tracing Garis Lurus Jalan Kelinci 🐰',
      deskripsi: 'Anak menarik garis lurus menghubungkan wortel ke kelinci di kertas/papan tulis.',
      alatAlat: ['Lembar kerja tracing lurus bertema kelinci', 'Krayon tebal berujung tumpul', 'Spidol papan'],
      instruksiGuru: [
        'Demokan cara memegang krayon dengan jepitan tiga jari (tripod grip).',
        'Bimbing tangan anak meluncur dari titik start wortel ke garis finish kelinci.',
        'Beri dorongan semangat tanpa memaksa garis harus 100% lurus.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Pajang hasil karya di papan kelas dan guru mencatat keluwesan jemari anak.'
    },
    alternatif: [
      {
        judul: 'Meremas Kertas Warna-Warni 📜',
        deskripsi: 'Meremas kertas bekas menjadi bola-bola kecil untuk menguatkan genggaman.',
        alasanDigunakan: 'Digunakan jika krayon/spidol habis.'
      },
      {
        judul: 'Menebalkan Lakban di Meja 🖊️',
        deskripsi: 'Menelusuri lakban warna-warni yang ditempel di atas meja menggunakan jari telunjuk.',
        alasanDigunakan: 'Digunakan untuk anak usia 2 tahun yang belum mau memegang krayon.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Menarik garis lurus pendek 5 cm dengan bimbingan genggaman.',
      usia4: 'Menarik garis lurus mendatar & tegak sepanjang 15 cm.',
      usia5: 'Menarik garis lurus putus-putus dan mewarnai gambar kelinci.'
    },
    gameIdRef: 'tracing'
  },
  {
    id: 'm1-rabu',
    bulan: 1,
    mingguKe: 1,
    hari: 'rabu',
    domainUtama: 'motorik_kasar_olahraga',
    isOutdoor: true,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Pemanasan fisik di halaman sekolah: senam melompat & memutar lengan.'
    },
    inti: {
      durasi: '30 Menit',
      judul: 'Lari Rintangan Corong & Lompat Kaki Dua 🏃‍♂️',
      deskripsi: 'Kegiatan luar ruangan: lari zig-zag melepasi corong plastik lalu melompati lakban dengan dua kaki bersamaan.',
      alatAlat: ['6 buah corong/cone plastik', 'Lakban warna untuk garis melompat', 'Peluit guru'],
      instruksiGuru: [
        'Susun corong berjarak 1 meter di halaman.',
        'Contohkan gerakan lari pelan mengitari corong lalu mendarat dengan 2 kaki mengeper.',
        'Minta anak bergiliran melangkah antre menunggu giliran.'
      ]
    },
    cadanganIndoor: {
      judul: 'Senam Hewan Hutan di Atas Matras 🧘‍♀️ (Cadangan Hujan)',
      deskripsi: 'Merangkak seperti kucing, melompat seperti katak, dan berdiri bangau di dalam ruang kelas beralas matras.',
      instruksiGuru: [
        'Geser meja ke pinggir kelas dan bentangkan matras.',
        'Putar musik instrumental riang dan pandu anak menirukan gerakan hewan.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Pendinginan, minum air putih bersama, dan guru mencatat keseimbangan anak.'
    },
    alternatif: [
      {
        judul: 'Estafet Memindahkan Bola Plastik ⚽',
        deskripsi: 'Lari lurus membawa bola dari ember A ke ember B di lapangan.',
        alasanDigunakan: 'Digunakan jika jumlah anak cukup banyak (>10 anak).'
      },
      {
        judul: 'Permainan Ikuti Jejak Kaki 🐾',
        deskripsi: 'Melangkah menapak gambar telapak kaki di lantai outdoor.',
        alasanDigunakan: 'Digunakan jika area halaman terbatas.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Berlari lurus 3 meter dan melompati 1 garis lantai.',
      usia4: 'Lari zig-zag 4 corong dan melompat 2 garis berurutan.',
      usia5: 'Lari zig-zag cepat, melompat 3 rintangan, dan berdiri 1 kaki 3 detik.'
    }
  },
  {
    id: 'm1-kamis',
    bulan: 1,
    mingguKe: 1,
    hari: 'kamis',
    domainUtama: 'sosial_bahasa',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Salam manis, nyanyian emosi "Kalau Kau Suka Hati Tepuk Tangan".'
    },
    inti: {
      durasi: '25 Menit',
      judul: 'Game Tebak Perasaan & Berbagi Mainan 😃😢',
      deskripsi: 'Anak mengenal 4 emosi dasar (Senang, Sedih, Marah, Takut) lewat kartu ilustrasi wajah dan berlatih menawarkan mainan ke teman.',
      alatAlat: ['Kartu emoticon besar', 'Cermin plastik aman', '3 buah boneka/mainan kelas'],
      instruksiGuru: [
        'Tunjukkan gambar wajah tersenyum: "Ini ekspresi apa ya?"',
        'Minta anak menirukan wajah tersenyum di cermin.',
        'Simulasikan adegan: "Kalau teman sedih, kita kasih mainan atau hibur ya."'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Ulas perasaan hari ini ("Siapa yang bahagia?") dan catat kepekaan sosial anak.'
    },
    alternatif: [
      {
        judul: 'Lingkaran Berbagi Bekal Pagi 🍎',
        deskripsi: 'Duduk melingkar dan saling menawarkan snack ke teman di sebelah.',
        alasanDigunakan: 'Digunakan saat jam makan snack bersama.'
      },
      {
        judul: 'Tebak Suara Ekspresi Wajah 🔊',
        deskripsi: 'Guru mendengarkan suara tertawa/menangis, anak menunjuk gambar emosi.',
        alasanDigunakan: 'Digunakan untuk melatih respon pendengaran.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Mengenali 2 emosi dasar (Senang vs Sedih).',
      usia4: 'Mengenali 4 emosi (Senang, Sedih, Marah, Takut) & menirukan ekspresi.',
      usia5: 'Menceritakan alasan kenapa orang bisa sedih atau gembira.'
    },
    gameIdRef: 'tebak_perasaan'
  },
  {
    id: 'm1-jumat',
    bulan: 1,
    mingguKe: 1,
    hari: 'jumat',
    domainUtama: 'agama_akhlak',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Doa sebelum belajar dengan posisi tangan menengadah santun.'
    },
    inti: {
      durasi: '20 Menit',
      judul: 'Adab Berdoa & Merapikan Alat Sholat/Belajar 🤲',
      deskripsi: 'Praktik langsung adab berdoa yang baik (duduk tenang, tidak bercanda) dan sikap menyayangi fasilitas kelas.',
      alatAlat: ['Sajadah kecil / alas duduk', 'Buku doa harian anak', 'Poster adab berdoa'],
      instruksiGuru: [
        'Duduk bersama melingkar di atas sajadah/karpet.',
        'Peragakan menengadahkan kedua telapak tangan di depan dada.',
        'Lafalkan doa sebelum makan/belajar secara pelan dan diikuti anak.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Mencium tangan guru (salim) sebelum pulang dan mencatat adab anak.'
    },
    alternatif: [
      {
        judul: 'Adab Mengucap Salam Sebelum Masuk 🚪',
        deskripsi: 'Praktik mengetuk pintu 3 kali dan mengucapkan Assalamu\'alaikum.',
        alasanDigunakan: 'Digunakan jika ingin fokus pada pembentukan karakter salam.'
      },
      {
        judul: 'Menyayangi Tanaman Hias Kelas 🪴',
        deskripsi: 'Menyiram vas tanaman kecil di jendela kelas bersama-sama.',
        alasanDigunakan: 'Digunakan untuk pengenalan cinta makhluk ciptaan Tuhan.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Duduk tenang selama 1 menit saat berdoa bersama.',
      usia4: 'Mengikuti ucapan doa pendek dan menengadahkan tangan.',
      usia5: 'Menghafal doa pendek dan memimpin doa giliran.'
    }
  },

  // ==========================================
  // MINGGU 2 (HARI 6 - 10)
  // ==========================================
  {
    id: 'm2-senin',
    bulan: 1,
    mingguKe: 2,
    hari: 'senin',
    domainUtama: 'logika',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Salam hangat, tepuk semangat, dan bernyanyi "Satu-Satu Aku Sayang Ibu".'
    },
    inti: {
      durasi: '25 Menit',
      judul: 'Pengelompokan Warna Primer (Merah, Kuning, Biru) 🎨',
      deskripsi: 'Anak memilah bola/kancing plastik ke dalam mangkuk berwarna senada.',
      alatAlat: ['3 Mangkuk plastik (Merah, Kuning, Biru)', '30 Bola warna-warni', 'Sendok besar plastik'],
      instruksiGuru: [
        'Tunjukkan bola merah: "Bola ini warnanya apa? Masukkan ke wadah merah ya!"',
        'Minta anak mengambil 1 bola dan menaruhnya di mangkuk yang cocok.',
        'Bantu anak yang masih bingung membedakan kuning dan biru.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Hitung bersama jumlah bola di mangkuk merah dan guru mencatat pengenalan warna.'
    },
    alternatif: [
      {
        judul: 'Pengelompokan Balok Warna 🧱',
        deskripsi: 'Menyusun balok kayu berdasarkan warnanya membentuk menara.',
        alasanDigunakan: 'Digunakan jika tidak ada bola plastik.'
      },
      {
        judul: 'Klasifikasi Tutup Botol Warna 🍼',
        deskripsi: 'Memasukkan tutup botol ke dalam botol transparan berdinding warna.',
        alasanDigunakan: 'Digunakan menggunakan bahan daur ulang.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Memisahkan 2 warna primer (Merah vs Biru).',
      usia4: 'Memisahkan 3 warna primer (Merah, Kuning, Biru).',
      usia5: 'Memisahkan 4 warna termasuk Hijau dan menyebutkan namanya.'
    },
    gameIdRef: 'klasifikasi'
  },
  {
    id: 'm2-selasa',
    bulan: 1,
    mingguKe: 2,
    hari: 'selasa',
    domainUtama: 'motorik_halus',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Latihan meremas jemari dan nyanyian "Lima Jari Kanan".'
    },
    inti: {
      durasi: '20 Menit',
      judul: 'Puzzle Kepingan Gambar Makanan Sehat 🍕🍎',
      deskripsi: 'Menyusun 2-4 kepingan puzzle bergambar buah apel dan roti rotian.',
      alatAlat: ['Set Puzzle kayu 2-4 kepingan', 'Alas papan kayu'],
      instruksiGuru: [
        'Bongkar puzzle di atas meja.',
        'Minta anak mencari bagian kepala atau daun buah terlebih dahulu.',
        'Dukung anak saat memutar kepingan hingga pas di celahnya.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Tepuk tangan atas keberhasilan puzzle dan catat spasial motorik halus anak.'
    },
    alternatif: [
      {
        judul: 'Memasangkan Tutup Toples 🫙',
        deskripsi: 'Memutar dan menutup 3 jajaran toples plastik kecil.',
        alasanDigunakan: 'Digunakan jika papan puzzle sedang dipakai kelas lain.'
      },
      {
        judul: 'Merangkai Manik-Manik Besar 📿',
        deskripsi: 'Memasukkan benang wol tebal ke dalam manik-manik kayu berlubang besar.',
        alasanDigunakan: 'Digunakan untuk melatih koordinasi mata-tangan presisi.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Menyusun 2 kepingan puzzle bergambar utuh.',
      usia4: 'Menyusun 4 kepingan puzzle bingkai.',
      usia5: 'Menyusun 6 kepingan puzzle tanpa bantuan.'
    },
    gameIdRef: 'puzzle'
  },
  {
    id: 'm2-rabu',
    bulan: 1,
    mingguKe: 2,
    hari: 'rabu',
    domainUtama: 'motorik_kasar_olahraga',
    isOutdoor: true,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Pemanasan luar ruangan: lari tempat dan gerakan melompat bintang.'
    },
    inti: {
      durasi: '30 Menit',
      judul: 'Berjalan di Garis Lakban Keseimbangan 👣',
      deskripsi: 'Berjalan meniti garis lakban lurus dan melengkung di semen halaman tanpa kakinya melenceng keluar.',
      alatAlat: ['Lakban warna 4 meter di lantai outdoor', 'Kapuk/bantal kecil untuk ditaruh di atas kepala'],
      instruksiGuru: [
        'Tempel lakban lurus di halaman.',
        'Rentangkan kedua tangan anak seperti sayap burung.',
        'Tantang anak melangkah tumit menyentuh jari kaki secara perlahan.'
      ]
    },
    cadanganIndoor: {
      judul: 'Keseimbangan Meniti Titian Karpet 🪜 (Cadangan Hujan)',
      deskripsi: 'Berjalan di atas lipatan karpet tebal di dalam kelas dengan bimbingan guru.',
      instruksiGuru: [
        'Gulung karpet menjadi jalur sempit di dalam kelas.',
        'Pegang satu tangan anak saat mencoba meniti karpet.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Minum air putih, seka keringat, dan catat refleks vestibular anak.'
    },
    alternatif: [
      {
        judul: 'Jalan Jinjit Di Garis Lurus 🦶',
        deskripsi: 'Berjalan jinjit mengangkat tumit menelusuri tembok kelas outdoor.',
        alasanDigunakan: 'Digunakan jika lakban mengelupas.'
      },
      {
        judul: 'Jalan Engklek 1 Kaki Sederhana 🦩',
        deskripsi: 'Lompat 1 kaki melompati kotak kapur di halaman.',
        alasanDigunakan: 'Digunakan untuk kelompok usia 4-5 tahun.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Berjalan di atas lakban lebar 10 cm dengan dipegangi 1 tangan.',
      usia4: 'Berjalan mandiri di atas lakban lurus 3 meter.',
      usia5: 'Berjalan meniti garis lengkung sambil menyeimbangkan bantal kecil di kepala.'
    }
  },
  {
    id: 'm2-kamis',
    bulan: 1,
    mingguKe: 2,
    hari: 'kamis',
    domainUtama: 'sosial_bahasa',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Salam hangat dan bercakap-cakap tentang nama panggilan teman.'
    },
    inti: {
      durasi: '25 Menit',
      judul: 'Game Sambung Cerita Gambar Binatang 🦁🐰',
      deskripsi: 'Guru memulai satu kalimat awal cerita, lalu anak melanjutkan dengan memilih gambar binatang di papan.',
      alatAlat: ['Kartu cerita berurutan (Flashcard)', 'Papan selip kartu'],
      instruksiGuru: [
        'Guru mulai: "Pada suatu hari, ada Kelinci melompat..."',
        'Gilirkan anak menunjuk gambar berikutnya: "Lalu Kelinci ketemu siapa?"',
        'Dukung anak mengucap kata sederhana meski baru 2-3 kata.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Beri tepuk tangan cerita bersama dan catat kosa kata ucapan anak.'
    },
    alternatif: [
      {
        judul: 'Menceritakan Foto Keluarga / Diri 🖼️',
        deskripsi: 'Anak berdiri menunjukkan foto diri dan menyebutkan "Ini aku".',
        alasanDigunakan: 'Digunakan untuk melatih keberanian tampil di depan kelas.'
      },
      {
        judul: 'Mendengarkan Dongeng Boneka Tangan 🎭',
        deskripsi: 'Guru memainkan boneka tangan, anak merespon dengan menjawab pertanyaan.',
        alasanDigunakan: 'Digunakan jika anak-anak sedang kurang fokus.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Menunjuk gambar dan menyebutkan nama binatang (1 kata).',
      usia4: 'Melanjutkan kalimat cerita pendek (2-3 kata).',
      usia5: 'Menceritakan kembali alur cerita sederhana dari awal sampai akhir.'
    },
    gameIdRef: 'sambung_cerita'
  },
  {
    id: 'm2-jumat',
    bulan: 1,
    mingguKe: 2,
    hari: 'jumat',
    domainUtama: 'agama_akhlak',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Doa pembuka dan nyanyian adab makan "Sebelum Makan Bismillah".'
    },
    inti: {
      durasi: '20 Menit',
      judul: 'Simulasi Adab Makan (Duduk, Tangan Kanan, Bersih) 🍱',
      deskripsi: 'Praktik langsung adab makan dan minum yang santun di meja kelas.',
      alatAlat: ['Piring & cangkir plastik anak', 'Serbet kain', 'Air minum'],
      instruksiGuru: [
        'Ajak anak duduk tegak di kursi meja makan.',
        'Ingatkan untuk memegang cangkir/sendok dengan tangan kanan.',
        'Minta anak tidak bersuara keras saat sedang mengunyah makanan.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Membaca doa sesudah makan bersama dan mencatat kemandirian adab anak.'
    },
    alternatif: [
      {
        judul: 'Mencuci Tangan Pakai Sabun 🧼',
        deskripsi: 'Praktik 6 langkah mencuci tangan bersih sebelum dan sesudah makan.',
        alasanDigunakan: 'Digunakan untuk integrasi kebersihan diri.'
      },
      {
        judul: 'Merapikan Alat Makan Sendiri 🥣',
        deskripsi: 'Membawa piring plastik bekas ke tempat pencucian.',
        alasanDigunakan: 'Digunakan untuk melatih rasa tanggung jawab.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Makan duduk manis di kursi dan memegang cangkir dengan 2 tangan.',
      usia4: 'Makan menggunakan tangan kanan dan membaca doa sebelum makan.',
      usia5: 'Makan rapi tanpa tercecer dan merapikan piring sendiri.'
    }
  },

  // ==========================================
  // MINGGU 3 (HARI 11 - 15)
  // ==========================================
  {
    id: 'm3-senin',
    bulan: 1,
    mingguKe: 3,
    hari: 'senin',
    domainUtama: 'logika',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Doa pembuka dan tepuk angka "Satu Dua Tiga Empat".'
    },
    inti: {
      durasi: '25 Menit',
      judul: 'Urutan Ukuran Benda (Kecil ke Besar) 📏',
      deskripsi: 'Anak menyusun 3-4 cangkir/balok dari ukuran paling kecil hingga paling besar.',
      alatAlat: ['Set cangkir bertingkat (Stacking Cups)', 'Balok kayu bertingkat'],
      instruksiGuru: [
        'Tunjukkan cangkir paling kecil dan paling besar.',
        'Minta anak membandingkan: "Mana yang lebih besar?"',
        'Bimbing anak menyusun berurutan dari kiri ke kanan.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Tumpuk cangkir menjadi menara dan catat pemahaman ukuran anak.'
    },
    alternatif: [
      {
        judul: 'Urutan Ukuran Sendok Plastik 🥄',
        deskripsi: 'Mengurutkan sendok teh, sendok makan, dan sendok sayur.',
        alasanDigunakan: 'Digunakan jika alat stacking cup belum tersedia.'
      },
      {
        judul: 'Urutan Ukuran Bola Plastik ⚽',
        deskripsi: 'Mengurutkan bola pingpong, bola kasti, dan bola basket plastik.',
        alasanDigunakan: 'Digunakan untuk konsep visual nyata.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Membedakan 2 ukuran (Kecil vs Besar).',
      usia4: 'Mengurutkan 3 tingkat ukuran (Kecil, Sedang, Besar).',
      usia5: 'Mengurutkan 5 tingkat ukuran berurutan presisi.'
    },
    gameIdRef: 'ukuran'
  },
  {
    id: 'm3-selasa',
    bulan: 1,
    mingguKe: 3,
    hari: 'selasa',
    domainUtama: 'motorik_halus',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Doa belajar dan gerakan pemanasan jemari "Meremas Gelembung".'
    },
    inti: {
      durasi: '20 Menit',
      judul: 'Sensory Pop Bubble Wrap & Tekan Tombol Presisi 🫧',
      deskripsi: 'Menekan gelembung plastik pembungkus (bubble wrap) menggunakan jari telunjuk dan ibu jari.',
      alatAlat: ['Lembaran bubble wrap tebal berwarna', 'Papan sensorik tombol pop-it'],
      instruksiGuru: [
        'Bagikan potongan bubble wrap 10x10 cm ke tiap anak.',
        'Instruksikan anak memencet satu per satu hingga berbunyi "POP!".',
        'Amati otot motorik halus telunjuk anak saat menekan.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Kumpulkan lembaran bubble wrap dan catat kekuatan tekanan jari anak.'
    },
    alternatif: [
      {
        judul: 'Menancapkan Pasak Plastik 📌',
        deskripsi: 'Menancapkan pasak mainan ke papan berlubang (pegboard).',
        alasanDigunakan: 'Digunakan jika bubble wrap habis.'
      },
      {
        judul: 'Menjepit Jepitan Baju Plastik 🗂️',
        deskripsi: 'Menjepitkan jepitan jemuran di pinggiran piring kertas.',
        alasanDigunakan: 'Digunakan untuk menguatkan otot jepit jemari.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Memencet gelembung bebas menggunakan telapak/jempol.',
      usia4: 'Memencet gelembung satu per satu menggunakan telunjuk presisi.',
      usia5: 'Memencet gelembung mengikuti pola warna yang ditentukan.'
    },
    gameIdRef: 'bubble'
  },
  {
    id: 'm3-rabu',
    bulan: 1,
    mingguKe: 3,
    hari: 'rabu',
    domainUtama: 'motorik_kasar_olahraga',
    isOutdoor: true,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Pemanasan fisik di lapangan: senam lari tempat & memutar lengan.'
    },
    inti: {
      durasi: '30 Menit',
      judul: 'Estafet Bola Pasir & Tangkap Bola Empuk 🏐',
      deskripsi: 'Anak berlari membawa bola ke dalam ember lalu melempar-menangkap bola kain di halaman.',
      alatAlat: ['10 Bola kain/plastik empuk', '2 Ember plastik', 'Peluit'],
      instruksiGuru: [
        'Bagi anak menjadi 2 barisan antrean.',
        'Anak paling depan berlari mengambil bola dan memasukkannya ke ember.',
        'Lakukan pelemparan bola empuk berjarak 1 meter dari guru.'
      ]
    },
    cadanganIndoor: {
      judul: 'Lempar Bola Kertas ke Keranjang 🗑️ (Cadangan Hujan)',
      deskripsi: 'Melempar bola-bola kertas ke dalam keranjang sampah bersih di dalam kelas.',
      instruksiGuru: [
        'Buat bola dari remasan kertas bekas.',
        'Atur jarak keranjang 1-2 meter dari anak.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Pendinginan, tarik napas dalam, minum air putih, dan catat motorik kasar.'
    },
    alternatif: [
      {
        judul: 'Permainan Lempar Tangkap Kantong Biji 🫘',
        deskripsi: 'Melempar dan menangkap kantong kain berisi biji kacang hijau.',
        alasanDigunakan: 'Digunakan jika angin di luar terlalu kencang.'
      },
      {
        judul: 'Menggulirkan Bola Ke Sasaran 🎳',
        deskripsi: 'Menggulirkan bola menyusur tanah mengenai botol plastik bekas.',
        alasanDigunakan: 'Digunakan untuk koordinasi tangan-mata.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Melempar bola ke dalam ember berjarak 50 cm.',
      usia4: 'Melempar dan menangkap bola dua tangan dari jarak 1 meter.',
      usia5: 'Estafet lari cepat membawa bola dan melempar ke sasaran tepat.'
    }
  },
  {
    id: 'm3-kamis',
    bulan: 1,
    mingguKe: 3,
    hari: 'kamis',
    domainUtama: 'sosial_bahasa',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Salam hangat, bernyanyi bersama lagu "Kawan Baik".'
    },
    inti: {
      durasi: '25 Menit',
      judul: 'Lingkaran Menunggu Giliran & Menolong Teman 🤝',
      deskripsi: 'Bermain melingkar memindahkan mainan satu per satu sambil mengucapkan kata santun "Ini buat kamu".',
      alatAlat: ['Boneka kesayangan kelas', 'Musik pengiring instrumen'],
      instruksiGuru: [
        'Duduk melingkar bersama anak-anak di karpet.',
        'Alirkan boneka saat musik berputar.',
        'Saat musik berhenti, anak yang memegang boneka mengucapkan kalimat santun ke teman di sebelahnya.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Pukulan tepuk apresiasi dan catat kesabaran menunggu giliran anak.'
    },
    alternatif: [
      {
        judul: 'Simulasi Menawarkan Bantuan 🆘',
        deskripsi: 'Adegan memperagakan teman yang mainannya terjatuh dan menolong mengambilkannya.',
        alasanDigunakan: 'Digunakan untuk fokus pada empati rasa menolong.'
      },
      {
        judul: 'Bermain Peran Kasir & Pembeli 🛒',
        deskripsi: 'Bermain peran sederhana menggunakan buah plastik dan uang kertas mainan.',
        alasanDigunakan: 'Digunakan untuk interaksi bahasa sosial.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Menyerahkan mainan ke teman tanpa memeluk/merebutnya.',
      usia4: 'Mengucapkan "Ini untukmu" saat menyerahkan mainan.',
      usia5: 'Menawarkan bantuan dengan kalimat utuh "Mau aku bantu ambilkan?"'
    }
  },
  {
    id: 'm3-jumat',
    bulan: 1,
    mingguKe: 3,
    hari: 'jumat',
    domainUtama: 'agama_akhlak',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Doa pagi dan salam hangat hari Jumat berkah.'
    },
    inti: {
      durasi: '20 Menit',
      judul: 'Adab Mengucap & Menjawab Salam Saat Berjumpa 🙋‍♂️',
      deskripsi: 'Latihan mengucapkan Assalamu\'alaikum dan menjawab Wa\'alaikumussalam saat bertemu guru dan teman.',
      alatAlat: ['Gambar poster ramah anak mengucap salam', 'Boneka tangan'],
      instruksiGuru: [
        'Peragakan boneka tangan yang masuk kelas sambil mengucap salam.',
        'Minta seluruh anak menjawab salam dengan nada ceria.',
        'Simulasikan berpasangan dengan teman di sebelahnya.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Mencium tangan guru (salim) dan guru mencatat kesantunan salam anak.'
    },
    alternatif: [
      {
        judul: 'Mengenal Kata-Kata Baik (Kalimat Thayibah) 💬',
        deskripsi: 'Menyanyikan lagu "Subhanallah, Alhamdulillah, Allahu Akbar".',
        alasanDigunakan: 'Digunakan untuk pengenalan kalimat pujian.'
      },
      {
        judul: 'Praktek Sedekah Senyum & Salam 💖',
        deskripsi: 'Tersenyum ramah dan menyapa teman di sekeliling karpet.',
        alasanDigunakan: 'Digunakan untuk penanaman karakter positif.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Menjawab "Salam" atau tersenyum saat disapa.',
      usia4: 'Mengucapkan "Assalamu\'alaikum" saat masuk kelas.',
      usia5: 'Mengucapkan salam lengkap dan menjawab salam teman secara santun.'
    }
  },

  // ==========================================
  // MINGGU 4 (HARI 16 - 20)
  // ==========================================
  {
    id: 'm4-senin',
    bulan: 1,
    mingguKe: 4,
    hari: 'senin',
    domainUtama: 'logika',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Doa pembuka dan bernyanyi lagu "Dua Mata Saya" dengan gerakan hitung.'
    },
    inti: {
      durasi: '25 Menit',
      judul: 'Menghitung Benda Manipulatif (1 sampai 5) 🔢',
      deskripsi: 'Anak menghitung jumlah buah/batu warna plastik 1 hingga 5 dan mencocokkan ke kartu angka.',
      alatAlat: ['Kartu angka 1-5', 'Batu warna/buah plastik', 'Piring kecil bernomor'],
      instruksiGuru: [
        'Tunjukkan piring berangka 3: "Yuk kita taruh 3 buah di piring ini!"',
        'Ajak anak menghitung bersuara: "Satu... dua... tiga!"',
        'Bantu anak memegang benda satu per satu (one-to-one correspondence).'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Tepuk angka bersama dan catat kemampuan berhitung dasar anak.'
    },
    alternatif: [
      {
        judul: 'Menghitung Jari Tangan Sendiri 🖐️',
        deskripsi: 'Menghitung jari tangan kanan dan kiri sambil menyanyi.',
        alasanDigunakan: 'Digunakan jika tidak ada media fisik batu warna.'
      },
      {
        judul: 'Menghitung Langkah Kaki Di Karpet 👣',
        deskripsi: 'Melangkah 1-5 langkah sambil berhitung bersuara nyaring.',
        alasanDigunakan: 'Digunakan untuk pembelajaran kinestetik.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Menghitung 1 sampai 2 benda sederhana.',
      usia4: 'Menghitung 1 sampai 5 benda dengan menunjuk tepat.',
      usia5: 'Menghitung 1 sampai 10 benda dan mengenali bentuk angkanya.'
    },
    gameIdRef: 'hitung'
  },
  {
    id: 'm4-selasa',
    bulan: 1,
    mingguKe: 4,
    hari: 'selasa',
    domainUtama: 'motorik_halus',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Doa sebelum belajar dan senam fleksibilitas jemari.'
    },
    inti: {
      durasi: '20 Menit',
      judul: 'Menggunting Kertas Pola Aman & Meremas Clay ✂️',
      deskripsi: 'Anak berlatih memotong rumbai kertas menggunakan gunting plastik tumpul dan membentuk bola dari adonan clay/plastisin.',
      alatAlat: ['Gunting plastik khusus anak (tumpul)', 'Kertas rumbai', 'Plastisin/Clay aman'],
      instruksiGuru: [
        'Demokan cara memasukkan jempol dan jari tengah ke lubang gunting.',
        'Bimbing tangan anak memotong pinggiran rumbai kertas.',
        'Minta anak meremas plastisin menjadi bentuk bulatan kecil.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Simpan hasil olahan plastisin di kotak karya dan catat kekuatan genggaman anak.'
    },
    alternatif: [
      {
        judul: 'Menyobek Kertas Warna-Warni 📄',
        deskripsi: 'Menyobek kertas menjadi serpihan kecil untuk penempelan kolase.',
        alasanDigunakan: 'Digunakan jika anak berusia 2-3 tahun yang belum siap menggunting.'
      },
      {
        judul: 'Menempel Stiker Emoji Ke Kertas 🏷️',
        deskripsi: 'Kupas stiker dari kertasnya dan tempelkan di dalam lingkaran.',
        alasanDigunakan: 'Digunakan untuk melatih presisi ujung jari.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Meremas plastisin menjadi bulatan dan menyobek kertas bebas.',
      usia4: 'Menggunting kertas garis lurus pendek 3 cm dengan gunting aman.',
      usia5: 'Menggunting pola lingkaran dan membentuk plastisin menjadi buah.'
    }
  },
  {
    id: 'm4-rabu',
    bulan: 1,
    mingguKe: 4,
    hari: 'rabu',
    domainUtama: 'motorik_kasar_olahraga',
    isOutdoor: true,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Pemanasan luar ruangan: senam melompat & gerakan meregangkan badan.'
    },
    inti: {
      durasi: '30 Menit',
      judul: 'Permainan Lompat Katak & Tangkap Bayangan 🐸',
      deskripsi: 'Kegiatan luar ruangan: melompat dengan jongkok seperti katak lalu berlari mengejar bayangan teman di bawah sinar matahari.',
      alatAlat: ['Matras rumput outdoor', 'Kapur tulis lapangan'],
      instruksiGuru: [
        'Minta anak menirukan posisi jongkok dan tangan di antara dua kaki.',
        'Beri aba-aba: "Lompat Katak... 1, 2, 3!"',
        'Ajak anak berlari di lapangan terbuka sambil menginjak bayangan teman.'
      ]
    },
    cadanganIndoor: {
      judul: 'Senam Irama Lompat Angka di Karpet 🎵 (Cadangan Hujan)',
      deskripsi: 'Melompat di atas angka-angka warna yang ditempel di karpet kelas diiringi lagu riang.',
      instruksiGuru: [
        'Tempel kertas angka 1-5 di lantai kelas.',
        'Minta anak melompat ke angka yang disebutkan guru.'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Pendinginan meluruskan kaki, minum air putih, dan catat kekuatan tungkai kaki.'
    },
    alternatif: [
      {
        judul: 'Berlari Mengelilingi Lingkaran ⭕',
        deskripsi: 'Berlari melingkar di atas garis kapur halaman outdoor.',
        alasanDigunakan: 'Digunakan jika cuaca panas teduh.'
      },
      {
        judul: 'Menirukan Gerakan Pohon Ditiup Angkin 🌳',
        deskripsi: 'Melambai-lambaikan kedua tangan tinggi ke atas sambil meliuk.',
        alasanDigunakan: 'Digunakan untuk kelenturan tubuh.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Melompat 2 kaki ke depan sejauh 20 cm.',
      usia4: 'Lompat katak 3 kali berturut-turut.',
      usia5: 'Lompat katak 5 kali dan berlari tangkap bayangan secara lincah.'
    }
  },
  {
    id: 'm4-kamis',
    bulan: 1,
    mingguKe: 4,
    hari: 'kamis',
    domainUtama: 'sosial_bahasa',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Salam manis dan lagu kata ajaib "Tolong, Maaf, Terima Kasih".'
    },
    inti: {
      durasi: '25 Menit',
      judul: 'Menceritakan Kejadian Sederhana & Kata Santun 🗣️',
      deskripsi: 'Anak berlatih menceritakan apa yang dimakan pagi ini atau mainan kesukaannya dengan kata-kata santun.',
      alatAlat: ['Mikrofon mainan/plastik', 'Kartu ilustrasi kegiatan harian'],
      instruksiGuru: [
        'Pegang mikrofon mainan dan bertanya dengan ramah: "Siapa mau cerita tadi pagi sarapan apa?"',
        'Beri kesempatan anak memegang mikrofon dan mengucap 1-2 kalimat.',
        'Ingatkan selalu menyelipkan kata "Permisi" atau "Terima kasih".'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Tepuk tangan apresiasi cerita dan catat keberanian berbahasa anak.'
    },
    alternatif: [
      {
        judul: 'Mendengarkan Cerita Gambar Berseri 📚',
        deskripsi: 'Melihat buku cerita besar dan menjawab pertanyaan guru tentang alur gambar.',
        alasanDigunakan: 'Digunakan jika anak pemalu menggunakan mikrofon.'
      },
      {
        judul: 'Bermain Telepon Kaleng Sederhana 📞',
        deskripsi: 'Berbicara berpasangan menggunakan 2 gelas plastik disambung benang.',
        alasanDigunakan: 'Digunakan untuk permainan bahasa interaktif.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Menjawab pertanyaan guru dengan 1 kata sederhana.',
      usia4: 'Menceritakan pengalamannya dalam 1 kalimat lengkap.',
      usia5: 'Menceritakan alur sederhana dengan percaya diri di depan teman.'
    }
  },
  {
    id: 'm4-jumat',
    bulan: 1,
    mingguKe: 4,
    hari: 'jumat',
    domainUtama: 'agama_akhlak',
    isOutdoor: false,
    pembuka: {
      durasi: '5 Menit',
      aktivitas: 'Doa pembuka dan nyanyian anak jujur disayang Tuhan.'
    },
    inti: {
      durasi: '20 Menit',
      judul: 'Karakter Jujur Mengakui Kesalahan & Meminta Maaf 🙇‍♂️',
      deskripsi: 'Simulasi cerita pendek tentang anak yang tidak sengaja merusak mainan dan berani jujur melapor ke guru.',
      alatAlat: ['Papan cerita berilustrasi anak jujur', 'Mainan yang bisa dilepas-pasang'],
      instruksiGuru: [
        'Ceritakan ilustrasi: "Budi tidak sengaja menjatuhkan pot bunga, lalu Budi minta maaf ke Ibu Guru."',
        'Tanya anak: "Budi anak yang hebat kan? Karena jujur tidak berbohong."',
        'Ajak anak berlatih bersalaman dan mengucap "Maaf ya Ustadzah/teman".'
      ]
    },
    penutup: {
      durasi: '5 Menit',
      aktivitas: 'Membaca doa penutup majelis dan catat kejujuran & keberanian emosi anak.'
    },
    alternatif: [
      {
        judul: 'Adab Mengembalikan Barang Teman 🎒',
        deskripsi: 'Simulasi menyerahkan kembali pensil yang jatuh ke pemiliknya.',
        alasanDigunakan: 'Digunakan untuk karakter amanah.'
      },
      {
        judul: 'Mendengarkan Kisah Teladan Anak Santun 📖',
        deskripsi: 'Mendengarkan kisah anak yang suka membantu orang tua di rumah.',
        alasanDigunakan: 'Digunakan untuk refleksi hari Jumat.'
      }
    ],
    variasiUsia: {
      usia2_3: 'Mengangguk saat ditanya dan berani bersalaman maaf.',
      usia4: 'Mengucapkan "Maaf aku tidak sengaja" saat salah.',
      usia5: 'Jujur menceritakan kejadian dan berjanji lebih berhati-hati.'
    }
  }
];
