import React, { useState } from 'react';
import { openDirectWA } from './teleponUtils';

interface LandingPageProps {
  onBukaLogin: () => void;
  onBukaPendaftaranLembaga: () => void;
  onBukaSuperAdmin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onBukaLogin,
  onBukaPendaftaranLembaga,
  onBukaSuperAdmin,
}) => {
  // State Simulasi Interactive Portal Wali Santri
  const [santriAktif, setSantriAktif] = useState<'rayhan' | 'aisyah' | 'fateh'>('rayhan');
  const [tabSimulasi, setTabSimulasi] = useState<'tahfidz' | 'akhlak' | 'presensi' | 'keuangan' | 'izin'>('tahfidz');

  // State FAQ Accordion
  const [faqBuka, setFaqBuka] = useState<number | null>(0);

  // Data Santri Sampel untuk Simulasi Wali Santri
  const dataSantri = {
    rayhan: {
      nama: 'Ahmad Rayhan Pratama',
      kelas: 'Kelas X - SMA Islam Tahfidz',
      asrama: 'Asrama Al-Farabi (Kamar 04)',
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      musyrif: 'Ustd. M. Ridwan, S.Pd.I',
      tahfidz: {
        totalJuz: 8,
        surahSekarang: 'Surah Al-Mulk (Ayat 1-30)',
        kelancaran: 'Sangat Lancar (A+)',
        ziyadahTerakhir: 'Al-Mulk: 1-15 (Lulus Test)',
        murajaahTerakhir: 'Juz 29 (Surah Nuh - Al-Haqqah)',
        catatanUstadz: 'Alhamdulillah makhraj tajwid sangat baik. Ananda antusias menambah hafalan juz 30 & 29.',
      },
      akhlak: {
        poinPlus: 125,
        poinMinus: 0,
        predikat: 'Mumtaz (Sangat Baik)',
        catatan: 'Aktif menjadi imam shalat Subuh berjamaah & rajin membantu kebersihan masjid.',
        kedisiplinan: '100% Shalat 5 Waktu di Masjid',
      },
      presensi: {
        persentase: '98%',
        sakit: '1 hari (Flu ringan - Klinik Pesantren)',
        izin: '0 hari',
        alpa: '0 hari',
      },
      keuangan: {
        sppStatus: 'LUNAS (Bulan Ini)',
        nominalSpp: 'Rp 1.200.000',
        saldoTabungan: 'Rp 450.000',
        uangJajanMingguan: 'Rp 75.000 / minggu',
        riwayatTerakhir: 'Pencairan Uang Jajan Rp 75.000 (07 Aug 2026)',
      },
      izin: {
        statusIzin: 'Tidak Ada Izin Aktif',
        riwayatPulang: 'Izin Pulang Idul Adha (15-20 Juni) - Tepat Waktu',
        paketMasuk: '1 Paket Masuk dari Wali (Pakaian & Buku - 04 Aug)',
      },
    },
    aisyah: {
      nama: 'Aisyah Humaira Azzahra',
      kelas: 'Kelas VIII - SMP IT Darus-Sunnah',
      asrama: 'Asrama Khadijah (Kamar 12)',
      foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      musyrif: 'Ustdzah Nabila, Lc',
      tahfidz: {
        totalJuz: 12,
        surahSekarang: 'Surah Yasin (Ayat 1-83)',
        kelancaran: 'Lancar & Fashih (A)',
        ziyadahTerakhir: 'Yasin: 40-60',
        murajaahTerakhir: 'Juz 1 & Juz 2',
        catatanUstadz: 'Hafalan sangat kuat. Suara lantang dan tajwidnya tajam.',
      },
      akhlak: {
        poinPlus: 140,
        poinMinus: 0,
        predikat: 'Mumtaz (Teladan)',
        catatan: 'Ketua kelompok kajian keputriaan asrama. Selalu menjaga kebersihan ruangan.',
        kedisiplinan: '100% Shalat Tepat Waktu',
      },
      presensi: {
        persentase: '100%',
        sakit: '0 hari',
        izin: '0 hari',
        alpa: '0 hari',
      },
      keuangan: {
        sppStatus: 'LUNAS (Bulan Ini)',
        nominalSpp: 'Rp 1.100.000',
        saldoTabungan: 'Rp 620.000',
        uangJajanMingguan: 'Rp 60.000 / minggu',
        riwayatTerakhir: 'Top-up Tabungan Rp 300.000 via Transfer (01 Aug 2026)',
      },
      izin: {
        statusIzin: 'Sedang Mengajukan Izin Berobat Gigi (Sabtu)',
        riwayatPulang: 'Izin Sambangan Ortu (02 Juli) - Kembali Sesuai Jadwal',
        paketMasuk: '2 Paket Terverifikasi Asrama',
      },
    },
    fateh: {
      nama: 'Muhammad Fateh Al-Fatih',
      kelas: 'Kelas IV - SD IT KabarSantri (Fullday)',
      asrama: 'Non-Asrama (Fullday)',
      foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      musyrif: 'Ustd. Ahmad Zaki, S.Pd',
      tahfidz: {
        totalJuz: 3,
        surahSekarang: 'Surah An-Naba (Ayat 1-40)',
        kelancaran: 'Sangat Baik (A)',
        ziyadahTerakhir: 'An-Naba: 1-20',
        murajaahTerakhir: 'Juz 30 (Surah An-Nas s/d Al-A’la)',
        catatanUstadz: 'Fateh sangat ceria saat mengaji. Tajwid mad jaiz sudah difahami.',
      },
      akhlak: {
        poinPlus: 90,
        poinMinus: 0,
        predikat: 'Baik & Santun',
        catatan: 'Suka berbagi bekal dengan teman dan rajin membantu merapikan kelas.',
        kedisiplinan: 'Shalat Dhuha & Dzuhur Berjamaah di Sekolah',
      },
      presensi: {
        persentase: '96%',
        sakit: '1 hari',
        izin: '1 hari (Acara Keluarga)',
        alpa: '0 hari',
      },
      keuangan: {
        sppStatus: 'LUNAS (Bulan Ini)',
        nominalSpp: 'Rp 750.000',
        saldoTabungan: 'Rp 210.000',
        uangJajanMingguan: 'Tabungan Katering & Snack',
        riwayatTerakhir: 'Pembayaran SPP Bulan Agustus Terverifikasi',
      },
      izin: {
        statusIzin: 'Non-Asrama (Pulang Pergi Harian)',
        riwayatPulang: 'Izin Sakit Demam (22 Juli)',
        paketMasuk: '-',
      },
    },
  };

  const santriDipilih = dataSantri[santriAktif];

  const faqs = [
    {
      q: 'Apakah Wali Santri perlu menginstal aplikasi rumit di Smartphone?',
      a: 'Tidak perlu rumit! Wali Santri dapat mengakses portal KabarSantri secara langsung via browser di Smartphone (Android/iPhone) atau menerima pembaruan otomatis via WhatsApp. Tampilannya sangat ramah pengguna, bahkan untuk orang tua yang belum terbiasa dengan aplikasi digital.',
    },
    {
      q: 'Apa saja kemudahan yang didapatkan Wali Santri?',
      a: 'Wali Santri bisa memantau perkembangan hafalan Al-Qur\'an (Tahfidz) per surah/juz, catatan adab & akhlak harian, presensi kehadiran, riwayat kesehatan di klinik pondok, rincian pembayaran SPP, sisa saldo tabungan santri, hingga pengajuan perizinan pulang santri secara resmi.',
    },
    {
      q: 'Bagaimana KabarSantri membantu Ustadz, Musyrif, dan Pengurus Pesantren?',
      a: 'Ustadz dan Musyrif tidak perlu lagi mencatat hafalan dan presensi di buku kertas yang berisiko hilang. Cukup 1-2 klik di HP saat mendampingi santri, data langsung terorganisir otomatis dan rekap laporan untuk Pimpinan Yayasan tersusun secara realtime.',
    },
    {
      q: 'Apakah KabarSantri cocok untuk Pesantren yang memiliki banyak unit sekolah?',
      a: 'Sangat cocok! KabarSantri dirancang sebagai System Operation Multi-Tenant. Yayasan yang mengelola Pesantren, SMP IT, SMA IT, Madrasah, hingga PAUD/TK dapat melihat seluruh unit dalam 1 Dashboard Konsolidasi Yayasan.',
    },
    {
      q: 'Bagaimana keamanan data santri dan wali?',
      a: 'Data sepenuhnya milik Pesantren/Yayasan dan dilindungi dengan enkripsi standar enterprise. Data tidak pernah dibagikan atau diperjualbelikan kepada pihak ketiga.',
    },
    {
      q: 'Bagaimana prosedur jika Pesantren kami ingin mengadopsi KabarSantri?',
      a: 'Tim pendamping KabarSantri by Minara akan datang/mendampingi secara langsung: mulai dari pemetaan alur pesantren, migrasi data lama dari buku/Excel, hingga pelatihan ustadz & pengurus sampai sistem benar-benar berjalan lancar.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* BACKGROUND GRADIENT & PATTERN */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        ></div>
      </div>

      {/* STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="/logo-kabarsantri.png"
              alt="Logo KabarSantri"
              className="w-11 h-11 rounded-2xl shadow-lg shadow-blue-600/20 object-cover border border-white/20"
            />
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                KabarSantri
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  by Minara
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                System Operation Pesantren & Yayasan
              </p>
            </div>
          </div>

          {/* Navigasi Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#simulasi-wali" className="hover:text-amber-400 transition-colors">
              Simulasi Wali Santri
            </a>
            <a href="#tiga-pilar" className="hover:text-amber-400 transition-colors">
              Keunggulan
            </a>
            <a href="#modul-fitur" className="hover:text-amber-400 transition-colors">
              Fitur Operasional
            </a>
            <a href="#pendampingan" className="hover:text-amber-400 transition-colors">
              Pendampingan
            </a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openDirectWA('6281215566630', 'Assalamualaikum, saya tertarik dengan KabarSantri System Operation Pesantren.')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 text-xs font-bold transition shadow-sm"
            >
              <span>💬</span> Hubungi WA
            </button>

            <button
              onClick={onBukaLogin}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition transform active:scale-95 flex items-center gap-2"
            >
              <span>🔑</span> Portal App
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-12 pb-20 lg:pt-20 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-amber-400 text-xs font-bold mb-8 shadow-xl shadow-amber-500/5 backdrop-blur-sm animate-pulse">
          <span>✨</span> System Operation Pesantren & Yayasan #1 Indonesia
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Wali Santri <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">Tenang</span>, Pesantren <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">Rapi</span>, Yayasan Berdaya
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          KabarSantri menghubungkan <strong className="text-white font-semibold">Orang Tua/Wali Santri</strong> dengan aktivitas harian ananda di pondok. Pantau hafalan Al-Qur'an, kedisiplinan adab, kesehatan, presensi, & keuangan secara real-time dari genggaman.
        </p>

        {/* CTA Button Group */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#simulasi-wali"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5"
          >
            <span>📱</span> Coba Simulasi Portal Wali Santri
          </a>

          <button
            onClick={onBukaPendaftaranLembaga}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base border border-slate-700/80 shadow-xl transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5"
          >
            <span>📝</span> Daftarkan Pesantren / Yayasan
          </button>
        </div>

        {/* Sub-note */}
        <p className="mt-4 text-xs text-slate-400 font-medium">
          🔒 Bebas biaya konsultasi · Tanpa komitmen di awal · Pendampingan penuh tim Minara
        </p>

        {/* METRICS COUNTER BAR */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">50+</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Pesantren & Sekolah Islam</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80">
            <div className="text-2xl sm:text-3xl font-black text-blue-400">15.000+</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Wali Santri Terhubung</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Transparansi Laporan</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80">
            <div className="text-2xl sm:text-3xl font-black text-purple-400">24/7</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Ketenangan Batin Wali</div>
          </div>
        </div>
      </section>

      {/* CORE HIGHLIGHT: INTERACTIVE SIMULATOR "PORTAL WALI SANTRI" */}
      <section id="simulasi-wali" className="relative z-10 py-16 bg-slate-900/70 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold tracking-widest uppercase">
              Uji Coba Langsung
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
              Bagaimana Wali Santri Melihat Kemajuan Ananda?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Klik nama santri dan tab laporan di bawah ini untuk mensimulasikan pengalaman langsung orang tua saat membuka aplikasi KabarSantri.
            </p>
          </div>

          {/* SIMULATOR CONTAINER */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden max-w-5xl mx-auto">
            {/* Header Simulator: Santri Selector */}
            <div className="bg-slate-900 p-4 sm:p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                <span className="text-xs text-slate-400 font-mono ml-2">portal-wali.kabarsantri.id/ananda</span>
              </div>

              {/* Selector Santri Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs text-slate-400 font-semibold mr-1">Pilih Ananda:</span>
                <button
                  onClick={() => setSantriAktif('rayhan')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    santriAktif === 'rayhan'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  👦 Ahmad Rayhan (SMA)
                </button>
                <button
                  onClick={() => setSantriAktif('aisyah')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    santriAktif === 'aisyah'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  👧 Aisyah Humaira (SMP)
                </button>
                <button
                  onClick={() => setSantriAktif('fateh')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    santriAktif === 'fateh'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  👦 M. Fateh (SD IT)
                </button>
              </div>
            </div>

            {/* Profile Info Bar */}
            <div className="bg-slate-900/40 p-4 sm:p-6 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={santriDipilih.foto}
                  alt={santriDipilih.nama}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                />
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {santriDipilih.nama}
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Santri Aktif
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {santriDipilih.kelas} · {santriDipilih.asrama}
                  </p>
                  <p className="text-[11px] text-amber-400 font-medium mt-1">
                    👤 Musyrif / Wali Kelas: {santriDipilih.musyrif}
                  </p>
                </div>
              </div>

              {/* Quick Badge */}
              <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl text-right">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Capaian Tahfidz</div>
                <div className="text-lg font-black text-amber-400">{santriDipilih.tahfidz.totalJuz} Juz Al-Qur'an</div>
              </div>
            </div>

            {/* Navigation Sub-Tabs Simulasi */}
            <div className="flex border-b border-slate-800 overflow-x-auto bg-slate-900/20">
              <button
                onClick={() => setTabSimulasi('tahfidz')}
                className={`px-5 py-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  tabSimulasi === 'tahfidz'
                    ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📖</span> Tahfidz & Quran
              </button>
              <button
                onClick={() => setTabSimulasi('akhlak')}
                className={`px-5 py-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  tabSimulasi === 'akhlak'
                    ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌟</span> Akhlak & Character
              </button>
              <button
                onClick={() => setTabSimulasi('presensi')}
                className={`px-5 py-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  tabSimulasi === 'presensi'
                    ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📅</span> Presensi & Kesehatan
              </button>
              <button
                onClick={() => setTabSimulasi('keuangan')}
                className={`px-5 py-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  tabSimulasi === 'keuangan'
                    ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>💳</span> SPP & Tabungan
              </button>
              <button
                onClick={() => setTabSimulasi('izin')}
                className={`px-5 py-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  tabSimulasi === 'izin'
                    ? 'border-amber-400 text-amber-400 bg-amber-400/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🎒</span> Perizinan & Paket
              </button>
            </div>

            {/* TAB CONTENT SIMULASI */}
            <div className="p-6 sm:p-8 min-h-[280px]">
              {tabSimulasi === 'tahfidz' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                      <div className="text-xs text-slate-400 font-bold mb-1">Setoran Hafalan Baru (Ziyadah)</div>
                      <div className="text-base font-bold text-emerald-400">{santriDipilih.tahfidz.ziyadahTerakhir}</div>
                      <div className="text-xs text-slate-400 mt-2">
                        Status Kelancaran: <span className="text-amber-400 font-semibold">{santriDipilih.tahfidz.kelancaran}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                      <div className="text-xs text-slate-400 font-bold mb-1">Pengulangan Hafalan (Muraja'ah)</div>
                      <div className="text-base font-bold text-blue-400">{santriDipilih.tahfidz.murajaahTerakhir}</div>
                      <div className="text-xs text-slate-400 mt-2">Target Surah Saat Ini: <span className="text-white font-semibold">{santriDipilih.tahfidz.surahSekarang}</span></div>
                    </div>
                  </div>

                  <div className="bg-amber-950/20 p-4 rounded-2xl border border-amber-500/20 text-xs">
                    <span className="font-bold text-amber-400 block mb-1">💬 Catatan Langsung Ustadz Tahfidz:</span>
                    <p className="text-slate-300 italic">"{santriDipilih.tahfidz.catatanUstadz}"</p>
                  </div>
                </div>
              )}

              {tabSimulasi === 'akhlak' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 text-center">
                      <div className="text-xs text-slate-400 font-bold">Total Poin Kebaikan</div>
                      <div className="text-3xl font-black text-emerald-400 mt-1">+{santriDipilih.akhlak.poinPlus}</div>
                    </div>
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 text-center">
                      <div className="text-xs text-slate-400 font-bold">Predikat Akhlak</div>
                      <div className="text-lg font-bold text-amber-400 mt-2">{santriDipilih.akhlak.predikat}</div>
                    </div>
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 text-center">
                      <div className="text-xs text-slate-400 font-bold">Kedisiplinan Shalat</div>
                      <div className="text-xs font-bold text-blue-300 mt-3">{santriDipilih.akhlak.kedisiplinan}</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 text-xs">
                    <span className="font-bold text-slate-300 block mb-1">📝 Jurnal Perkembangan Karaktrer & Adab:</span>
                    <p className="text-slate-300">{santriDipilih.akhlak.catatan}</p>
                  </div>
                </div>
              )}

              {tabSimulasi === 'presensi' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-emerald-950/30 border border-emerald-500/20 p-4 rounded-2xl">
                      <div className="text-xs text-emerald-400 font-bold">Tingkat Kehadiran</div>
                      <div className="text-2xl font-black text-emerald-300 mt-1">{santriDipilih.presensi.persentase}</div>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
                      <div className="text-xs text-slate-400 font-bold">Riwayat Sakit</div>
                      <div className="text-xs font-semibold text-slate-200 mt-2">{santriDipilih.presensi.sakit}</div>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
                      <div className="text-xs text-slate-400 font-bold">Izin Resmi</div>
                      <div className="text-xs font-semibold text-slate-200 mt-2">{santriDipilih.presensi.izin}</div>
                    </div>
                    <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
                      <div className="text-xs text-slate-400 font-bold">Tanpa Keterangan</div>
                      <div className="text-xs font-semibold text-emerald-400 mt-2">{santriDipilih.presensi.alpa}</div>
                    </div>
                  </div>
                </div>
              )}

              {tabSimulasi === 'keuangan' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                      <div className="text-xs text-slate-400 font-bold">Status SPP / Syahriah</div>
                      <div className="text-lg font-black text-emerald-400 mt-1">{santriDipilih.keuangan.sppStatus}</div>
                      <div className="text-xs text-slate-400 mt-1">Nominal per bulan: {santriDipilih.keuangan.nominalSpp}</div>
                    </div>

                    <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                      <div className="text-xs text-slate-400 font-bold">Saldo Tabungan Santri</div>
                      <div className="text-lg font-black text-amber-400 mt-1">{santriDipilih.keuangan.saldoTabungan}</div>
                      <div className="text-xs text-slate-400 mt-1">Batas Jajan: {santriDipilih.keuangan.uangJajanMingguan}</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Transparansi Terakhir:</span>
                    <span className="font-semibold text-slate-200">{santriDipilih.keuangan.riwayatTerakhir}</span>
                  </div>
                </div>
              )}

              {tabSimulasi === 'izin' && (
                <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                    <div className="font-bold text-amber-400 mb-1">Status Perizinan Keluar/Pulang:</div>
                    <div className="text-slate-200 text-sm font-semibold">{santriDipilih.izin.statusIzin}</div>
                    <div className="text-slate-400 mt-2">Riwayat: {santriDipilih.izin.riwayatPulang}</div>
                  </div>

                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                    <div className="font-bold text-blue-400 mb-1">Tracking Paket Wali Santri:</div>
                    <div className="text-slate-200">{santriDipilih.izin.paketMasuk}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3 PILAR KEUNGGULAN SYSTEM OPERATION */}
      <section id="tiga-pilar" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold tracking-widest uppercase">
            3 Pilar Utama
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
            Sistem Operasional yang Menghubungkan Semua Pihak
          </h2>
          <p className="text-slate-400 text-base mt-2">
            Bukan sekadar aplikasi pencatatan, melainkan ekosistem pendampingan yang membuat seluruh stakeholder tersenyum lega.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pilar 1: Wali Santri */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 p-8 rounded-3xl transition duration-300 relative group">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
              ❤️
            </div>
            <h3 className="text-xl font-bold text-white mb-3">1. Ketenangan Batin Wali Santri</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Wali tidak lagi merasa khawatir atau menduga-duga kondisi ananda di pondok. Setiap progres hafalan, adab, kesehatan, hingga uang jajan terpantau transparan dan akurat.
            </p>

            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Laporan Hafalan Al-Qur'an Real-time
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Notifikasi SPP & Saldo Tabungan
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Pengajuan Izin Pulang Digital
              </li>
            </ul>
          </div>

          {/* Pilar 2: Ustadz & Musyrif */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 p-8 rounded-3xl transition duration-300 relative group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white mb-3">2. Kemudahan Ustadz & Musyrif</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Pangkas waktu administrasi hingga 80%. Ustadz bisa fokus mendidik dan membimbing santri, sementara pencatatan ziyadah dan absensi dapat diinput dari HP dalam hitungan detik.
            </p>

            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-blue-400">✓</span> Input Ziyadah & Muraja'ah 1-Klik
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">✓</span> Jurnal Akhlak & Catatan Kesehatan
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">✓</span> Ruang Diskusi Google Chat per Kelas
              </li>
            </ul>
          </div>

          {/* Pilar 3: Yayasan & Pimpinan */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 p-8 rounded-3xl transition duration-300 relative group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
              📊
            </div>
            <h3 className="text-xl font-bold text-white mb-3">3. Kendali Penuh Pimpinan Yayasan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Pimpinan tidak perlu menunggu rekap manual di akhir bulan. Semua data unit sekolah/asrama terkonsolidasi dalam satu Executive Dashboard yang siap diaudit.
            </p>

            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Multi-Tenant Isolation per Unit
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Validasi Keuangan & Kas Otomatis
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Laporan Konsolidasi 1-Klik
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SHOWCASE MODUL FITUR OPERASIONAL */}
      <section id="modul-fitur" className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold tracking-widest uppercase">
              Kelengkapan Modul
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
              Semua Kebutuhan Pesantren Modern dalam 1 Platform
            </h2>
            <p className="text-slate-400 text-base mt-2">
              Dirancang sesuai tradisi dan alur kerja pesantren Indonesia, tanpa memaksa perubahan aturan yang sudah berlaku.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Modul 1 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
              <div className="text-3xl mb-3">📖</div>
              <h4 className="text-lg font-bold text-white mb-2">Buku Induk & Modul Santri</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pencatatan data santri lengkap, riwayat kelas, kamar asrama, orang tua, hingga dokumen pendukung dalam 1 database aman.
              </p>
            </div>

            {/* Modul 2 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
              <div className="text-3xl mb-3">🕌</div>
              <h4 className="text-lg font-bold text-white mb-2">Jurnal Tahfidz & Quran</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tracking ziyadah hafalan baru, murajaah, penilaian makhraj/tajwid, dan grafik kenaikan juz per santri.
              </p>
            </div>

            {/* Modul 3 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
              <div className="text-3xl mb-3">💳</div>
              <h4 className="text-lg font-bold text-white mb-2">Keuangan, SPP & Tabungan</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Validasi pembayaran syahriah SPP, uang jajan santri, saldo tabungan, donasi, serta laporan penerimaan kas.
              </p>
            </div>

            {/* Modul 4 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
              <div className="text-3xl mb-3">🌟</div>
              <h4 className="text-lg font-bold text-white mb-2">Akhlak & Pembinaan Karakter</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sistem reward poin kebaikan, pencatatan kedisiplinan shalat berjamaah, dan bimbingan adab harian.
              </p>
            </div>

            {/* Modul 5 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
              <div className="text-3xl mb-3">🎒</div>
              <h4 className="text-lg font-bold text-white mb-2">Perizinan Pulang & Kiriman</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pengajuan izin pulang santri berjenjang (Ustadz/Kesantrian) & serah terima paket wali santri terverifikasi.
              </p>
            </div>

            {/* Modul 6 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
              <div className="text-3xl mb-3">💬</div>
              <h4 className="text-lg font-bold text-white mb-2">Google Chat & WhatsApp Alert</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ruang obrolan terisolasi per pengurus/wali serta notifikasi otomatis perkembangan ananda via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PENDAMPINGAN MINARA */}
      <section id="pendampingan" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 sm:p-12 rounded-3xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl relative z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              Komitmen Pendampingan Minara
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-4 leading-tight">
              Bukan Cuma Jualan Software, Kami Mendampingi Sampai Terbiasa
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
              Banyak aplikasi gagal digunakan karena ustadz dan pengurus merasa tidak dibantu saat peralihan. Tim Minara hadir duduk bersama pengurus pesantren untuk memindahkan data buku lama, menyesuaikan alur, dan melatih staf hingga 100% lancar.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-200">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 flex items-center gap-3">
                <span className="text-xl">🤝</span>
                <span>Pendampingan Onsite / Online</span>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 flex items-center gap-3">
                <span className="text-xl">📂</span>
                <span>Bantu Migrasi Data Lama</span>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <span>Data 100% Milik Yayasan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUARA WALI SANTRI & PENGURUS */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Apa Kata Wali Santri & Pengurus Pesantren?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                "Dulu saya sering cemas di rumah kepikiran ananda di pondok. Sekarang tiap sore saya bisa buka KabarSantri dan lihat ananda baru tambah setoran surah Al-Mulk. Hati rasanya tenang dan bahagia sekali!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-base border border-amber-500/30">
                  BF
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Bunda Fatimah Z.</h4>
                  <p className="text-xs text-slate-400">Wali Santri — SMA IT Tahfidz</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                "Laporan keuangan SPP dan rekapan jumlah hafalan santri dari 3 unit sekolah kami sekarang langsung rekap otomatis di laptop saya. Tidak perlu lagi bongkar-bongkar buku besar di akhir bulan."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-base border border-blue-500/30">
                  KD
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">KH. Ahmad Dahlan, M.Ag</h4>
                  <p className="text-xs text-slate-400">Ketua Yayasan Pesantren Bina Ummah</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION ACCORDION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-wider">
            Pertanyaan Umum
          </span>
          <h2 className="text-3xl font-black text-white mt-3">
            Sering Ditanyakan Seputar KabarSantri
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = faqBuka === index;
            return (
              <div
                key={index}
                className="bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setFaqBuka(isOpen ? null : index)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:bg-slate-800/50 transition"
                >
                  <span>{faq.q}</span>
                  <span className={`text-xl text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-slate-300 border-t border-slate-800/60 leading-relaxed bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA CLOSING BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-8 sm:p-14 rounded-3xl text-slate-950 text-center shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight max-w-2xl mx-auto">
            Siap Menghadirkan Ketenangan Bagi Wali Santri & Efisiensi Bagi Pesantren?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-900 max-w-xl mx-auto font-medium">
            Jadwalkan sesi peninjauan gratis bersama tim pendamping KabarSantri. Kami siap mendengarkan alur dan kebutuhan khas pesantren Anda.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openDirectWA('6281215566630', 'Assalamualaikum, saya pengurus pesantren dan ingin menjadwalkan sesi peninjauan KabarSantri.')}
              className="px-8 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm shadow-xl transition transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              <span>💬</span> Jadwalkan Sesi via WhatsApp
            </button>

            <button
              onClick={onBukaLogin}
              className="px-8 py-4 rounded-2xl bg-white/90 hover:bg-white text-slate-950 font-bold text-sm shadow-lg transition transform hover:-translate-y-0.5 active:scale-95"
            >
              🔑 Masuk Portal Utama
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo-kabarsantri.png"
              alt="Logo KabarSantri"
              className="w-8 h-8 rounded-xl object-cover"
            />
            <div>
              <span className="text-white font-bold text-sm">KabarSantri by Minara</span>
              <p className="text-[11px] text-slate-500">Mitra Transformasi Digital Pesantren Indonesia</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => openDirectWA('6281215566630')} className="hover:text-amber-400">
              WhatsApp: 0812 1556 6630
            </button>
            <button onClick={onBukaSuperAdmin} className="hover:text-amber-400 opacity-60 hover:opacity-100">
              Portal Admin
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} KabarSantri by Minara. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
