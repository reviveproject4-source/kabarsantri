import React, { useState } from 'react';

export const HalamanPortalWaliSantri: React.FC = () => {
  const [santriAktif, setSantriAktif] = useState<'rayhan' | 'aisyah' | 'fateh'>('rayhan');
  const [subTab, setSubTab] = useState<'tahfidz' | 'akhlak' | 'presensi' | 'keuangan' | 'izin' | 'chat'>('tahfidz');

  const dataSantri = {
    rayhan: {
      nama: 'Ahmad Rayhan Pratama',
      nis: '2025-01042',
      kelas: 'Kelas X - SMA Islam Tahfidz',
      asrama: 'Asrama Al-Farabi (Kamar 04)',
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      musyrif: 'Ustd. M. Ridwan, S.Pd.I',
      tahfidz: {
        totalJuz: 8,
        targetJuzTahunIni: 10,
        surahSekarang: 'Surah Al-Mulk (Ayat 1-30)',
        kelancaran: 'Sangat Lancar (A+)',
        ziyadahTerakhir: 'Al-Mulk: 1-15 (Telah diuji pada 06 Aug 2026)',
        murajaahTerakhir: 'Juz 29 (Surah Nuh s/d Al-Haqqah)',
        catatanUstadz: 'Alhamdulillah makhraj tajwid sangat fasih. Ananda antusias menambah hafalan juz 30 & 29.',
        riwayatSetoran: [
          { tanggal: '06 Aug 2026', jenis: 'Ziyadah', surah: 'Al-Mulk: 1-15', nilai: 'Mumtaz (A+)', ustadz: 'Ustd. Ridwan' },
          { tanggal: '04 Aug 2026', jenis: 'Murajaah', surah: 'Juz 29 (Al-Qalam - Nuh)', nilai: 'Jayyid Jiddan (A)', ustadz: 'Ustd. Ridwan' },
          { tanggal: '02 Aug 2026', jenis: 'Ziyadah', surah: 'At-Tahrim: 1-12', nilai: 'Mumtaz (A+)', ustadz: 'Ustd. Ridwan' },
        ],
      },
      akhlak: {
        poinPlus: 125,
        poinMinus: 0,
        predikat: 'Mumtaz (Sangat Baik & Taat)',
        kedisiplinan: '100% Shalat 5 Waktu di Masjid',
        catatanMusyrif: 'Aktif menjadi imam shalat Subuh berjamaah di asrama & rajin membantu kebersihan masjid.',
        jurnalHarian: [
          { tanggal: '07 Aug 2026', aktivitas: 'Imam Shalat Subuh Asrama Al-Farabi', poin: '+15' },
          { tanggal: '05 Aug 2026', aktivitas: 'Membantu Merapikan Perpustakaan Pondok', poin: '+10' },
          { tanggal: '03 Aug 2026', aktivitas: 'Piket Kebersihan Masjid Utama', poin: '+10' },
        ],
      },
      presensi: {
        persentase: '98%',
        hadir: '48 hari',
        sakit: '1 hari (Flu ringan - Klinik Pondok)',
        izin: '0 hari',
        alpa: '0 hari',
        catatanKlinik: 'Pemeriksaan rutin klinik pada 01 Aug: Suhu 36.5°C, kondisi sehat bugar.',
      },
      keuangan: {
        sppStatus: 'LUNAS (Bulan Agustus 2026)',
        nominalSpp: 'Rp 1.200.000',
        saldoTabungan: 'Rp 450.000',
        uangJajanMingguan: 'Rp 75.000 / minggu',
        riwayatPenarikan: [
          { tanggal: '07 Aug 2026', keterangan: 'Uang Jajan Pekan I Agustus', jumlah: '- Rp 75.000', saldo: 'Rp 450.000' },
          { tanggal: '01 Aug 2026', keterangan: 'Top-up Tabungan via Transfer Wali', jumlah: '+ Rp 300.000', saldo: 'Rp 525.000' },
        ],
      },
      izin: {
        statusIzin: 'Tidak Ada Izin Keluar Aktif',
        riwayat: [
          { tanggal: '15-20 Juni 2026', alasan: 'Libur Idul Adha (Kembali Tepat Waktu)', status: 'Disetujui Ustd. Ridwan' },
        ],
        paketMasuk: '1 Paket Masuk dari Wali (Buku & Pakaian - Terverifikasi Asrama)',
      },
    },
    aisyah: {
      nama: 'Aisyah Humaira Azzahra',
      nis: '2025-02188',
      kelas: 'Kelas VIII - SMP IT Darus-Sunnah',
      asrama: 'Asrama Khadijah (Kamar 12)',
      foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      musyrif: 'Ustdzah Nabila, Lc',
      tahfidz: {
        totalJuz: 12,
        targetJuzTahunIni: 15,
        surahSekarang: 'Surah Yasin (Ayat 1-83)',
        kelancaran: 'Lancar & Fashih (A)',
        ziyadahTerakhir: 'Yasin: 40-60',
        murajaahTerakhir: 'Juz 1 & Juz 2',
        catatanUstadz: 'Hafalan sangat kuat. Suara lantang dan tajwidnya tajam.',
        riwayatSetoran: [
          { tanggal: '06 Aug 2026', jenis: 'Ziyadah', surah: 'Yasin: 1-40', nilai: 'Mumtaz (A+)', ustadz: 'Ustdzah Nabila' },
          { tanggal: '03 Aug 2026', jenis: 'Murajaah', surah: 'Juz 2 (Al-Baqarah: 142-252)', nilai: 'Mumtaz (A+)', ustadz: 'Ustdzah Nabila' },
        ],
      },
      akhlak: {
        poinPlus: 140,
        poinMinus: 0,
        predikat: 'Mumtaz (Teladan Asrama)',
        kedisiplinan: '100% Shalat Tepat Waktu',
        catatanMusyrif: 'Ketua kelompok kajian keputriaan asrama. Selalu menjaga kebersihan ruangan.',
        jurnalHarian: [
          { tanggal: '06 Aug 2026', aktivitas: 'Pemateri Halqah Akhlak Putri', poin: '+20' },
          { tanggal: '02 Aug 2026', aktivitas: 'Juara 1 Lomba Tilawah Internal', poin: '+25' },
        ],
      },
      presensi: {
        persentase: '100%',
        hadir: '50 hari',
        sakit: '0 hari',
        izin: '0 hari',
        alpa: '0 hari',
        catatanKlinik: 'Pemeriksaan rutin: Kondisi prima.',
      },
      keuangan: {
        sppStatus: 'LUNAS (Bulan Agustus 2026)',
        nominalSpp: 'Rp 1.100.000',
        saldoTabungan: 'Rp 620.000',
        uangJajanMingguan: 'Rp 60.000 / minggu',
        riwayatPenarikan: [
          { tanggal: '05 Aug 2026', keterangan: 'Uang Jajan Pekan I', jumlah: '- Rp 60.000', saldo: 'Rp 620.000' },
          { tanggal: '01 Aug 2026', keterangan: 'Top-up Tabungan Wali', jumlah: '+ Rp 400.000', saldo: 'Rp 680.000' },
        ],
      },
      izin: {
        statusIzin: 'Sedang Mengajukan Izin Berobat Gigi (Sabtu, 09 Aug)',
        riwayat: [
          { tanggal: '02 Juli 2026', alasan: 'Izin Sambangan Ortu', status: 'Disetujui' },
        ],
        paketMasuk: '2 Paket Terverifikasi Asrama Putri',
      },
    },
    fateh: {
      nama: 'Muhammad Fateh Al-Fatih',
      nis: '2025-03019',
      kelas: 'Kelas IV - SD IT KabarSantri (Fullday)',
      asrama: 'Non-Asrama (Fullday)',
      foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      musyrif: 'Ustd. Ahmad Zaki, S.Pd',
      tahfidz: {
        totalJuz: 3,
        targetJuzTahunIni: 4,
        surahSekarang: 'Surah An-Naba (Ayat 1-40)',
        kelancaran: 'Sangat Baik (A)',
        ziyadahTerakhir: 'An-Naba: 1-20',
        murajaahTerakhir: 'Juz 30 (Surah An-Nas s/d Al-A’la)',
        catatanUstadz: 'Fateh sangat ceria saat mengaji. Tajwid mad jaiz sudah difahami.',
        riwayatSetoran: [
          { tanggal: '05 Aug 2026', jenis: 'Ziyadah', surah: 'An-Naba: 1-20', nilai: 'Jayyid Jiddan (A)', ustadz: 'Ustd. Zaki' },
        ],
      },
      akhlak: {
        poinPlus: 90,
        poinMinus: 0,
        predikat: 'Baik & Santun',
        kedisiplinan: 'Shalat Dhuha & Dzuhur Berjamaah di Sekolah',
        catatanMusyrif: 'Suka berbagi bekal dengan teman dan rajin membantu merapikan kelas.',
        jurnalHarian: [
          { tanggal: '04 Aug 2026', aktivitas: 'Membantu Merapikan Alat Shalat', poin: '+10' },
        ],
      },
      presensi: {
        persentase: '96%',
        hadir: '46 hari',
        sakit: '1 hari',
        izin: '1 hari',
        alpa: '0 hari',
        catatanKlinik: 'Sehat wal afiat.',
      },
      keuangan: {
        sppStatus: 'LUNAS (Bulan Agustus 2026)',
        nominalSpp: 'Rp 750.000',
        saldoTabungan: 'Rp 210.000',
        uangJajanMingguan: 'Katering & Snack Sekolah',
        riwayatPenarikan: [
          { tanggal: '01 Aug 2026', keterangan: 'SPP Terbayar', jumlah: 'Lunas', saldo: 'Rp 210.000' },
        ],
      },
      izin: {
        statusIzin: 'Non-Asrama (Pulang Pergi Harian)',
        riwayat: [
          { tanggal: '22 Juli 2026', alasan: 'Izin Demam', status: 'Disetujui' },
        ],
        paketMasuk: '-',
      },
    },
  };

  const activeSantri = dataSantri[santriAktif];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* HEADER PAGE */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            Live Web App Demo
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-2">
            Portal Wali Santri — Laporan Kemajuan Ananda
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Simulasi penuh antarmuka khusus orang tua untuk memantau aktivitas & perkembangan santri.
          </p>
        </div>

        {/* SANTRI PICKER */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-bold px-2">Pilih Ananda:</span>
          <button
            onClick={() => setSantriAktif('rayhan')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              santriAktif === 'rayhan' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            👦 Rayhan (SMA)
          </button>
          <button
            onClick={() => setSantriAktif('aisyah')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              santriAktif === 'aisyah' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            👧 Aisyah (SMP)
          </button>
          <button
            onClick={() => setSantriAktif('fateh')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              santriAktif === 'fateh' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            👦 Fateh (SD IT)
          </button>
        </div>
      </div>

      {/* SANTRI PROFILE CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={activeSantri.foto}
            alt={activeSantri.nama}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-amber-500/60 shadow-xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{activeSantri.nama}</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                NIS: {activeSantri.nis}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              {activeSantri.kelas} · {activeSantri.asrama}
            </p>
            <p className="text-xs text-amber-400 font-semibold mt-1">
              👤 Musyrif / Pembina: {activeSantri.musyrif}
            </p>
          </div>
        </div>

        {/* METRICS SUMMARY BADGES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Capaian Quran</div>
            <div className="text-lg font-black text-amber-400">{activeSantri.tahfidz.totalJuz} Juz</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Predikat Akhlak</div>
            <div className="text-xs font-bold text-emerald-400 mt-1">{activeSantri.akhlak.predikat}</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-center col-span-2 sm:col-span-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Saldo Tabungan</div>
            <div className="text-base font-black text-blue-400">{activeSantri.keuangan.saldoTabungan}</div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="bg-slate-900/60 p-2 rounded-2xl border border-slate-800 flex overflow-x-auto gap-2">
        <button
          onClick={() => setSubTab('tahfidz')}
          className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
            subTab === 'tahfidz' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📖</span> Rapor Tahfidz & Quran
        </button>
        <button
          onClick={() => setSubTab('akhlak')}
          className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
            subTab === 'akhlak' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🌟</span> Jurnal Adab & Akhlak
        </button>
        <button
          onClick={() => setSubTab('presensi')}
          className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
            subTab === 'presensi' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📅</span> Presensi & Kesehatan
        </button>
        <button
          onClick={() => setSubTab('keuangan')}
          className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
            subTab === 'keuangan' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>💳</span> Transparansi SPP & Tabungan
        </button>
        <button
          onClick={() => setSubTab('izin')}
          className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
            subTab === 'izin' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🎒</span> Perizinan & Kiriman
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
        {subTab === 'tahfidz' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Target & Ziyadah Hafalan Baru</h3>
                <div className="text-xl font-black text-emerald-400">{activeSantri.tahfidz.ziyadahTerakhir}</div>
                <p className="text-xs text-slate-400 mt-2">
                  Target Tahun Ini: <strong className="text-white">{activeSantri.tahfidz.targetJuzTahunIni} Juz</strong> (Terlampaui {activeSantri.tahfidz.totalJuz} Juz)
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Status Kelancaran: <span className="text-amber-400 font-bold">{activeSantri.tahfidz.kelancaran}</span>
                </p>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Muraja'ah (Pengulangan)</h3>
                <div className="text-xl font-black text-blue-400">{activeSantri.tahfidz.murajaahTerakhir}</div>
                <p className="text-xs text-slate-400 mt-2">
                  Surah Diampu Sekarang: <strong className="text-white">{activeSantri.tahfidz.surahSekarang}</strong>
                </p>
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/30 p-5 rounded-2xl text-xs">
              <span className="font-bold text-amber-400 text-sm block mb-1">💬 Catatan Langsung Ustadz Pembina Tahfidz:</span>
              <p className="text-slate-200 italic text-sm">"{activeSantri.tahfidz.catatanUstadz}"</p>
            </div>

            {/* Riwayat Setoran */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3">Riwayat Setoran Hafalan Terbaru</h4>
              <div className="space-y-2">
                {activeSantri.tahfidz.riwayatSetoran.map((r, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block text-sm">{r.surah}</span>
                      <span className="text-slate-400">{r.tanggal} · {r.jenis}</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold block">
                        {r.nilai}
                      </span>
                      <span className="text-[10px] text-slate-500">{r.ustadz}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {subTab === 'akhlak' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-bold uppercase">Total Poin Kebaikan</div>
                <div className="text-4xl font-black text-emerald-400 mt-2">+{activeSantri.akhlak.poinPlus}</div>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-bold uppercase">Pelanggaran / Poin Minus</div>
                <div className="text-4xl font-black text-slate-500 mt-2">{activeSantri.akhlak.poinMinus}</div>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400 font-bold uppercase">Kedisiplinan Shalat</div>
                <div className="text-xs font-bold text-blue-300 mt-4">{activeSantri.akhlak.kedisiplinan}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs">
              <span className="font-bold text-white text-sm block mb-1">📝 Catatan Pembinaan Musyrif Asrama:</span>
              <p className="text-slate-300 text-sm leading-relaxed">{activeSantri.akhlak.catatanMusyrif}</p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">Jurnal Kebaikan & Prestasi Harian</h4>
              <div className="space-y-2">
                {activeSantri.akhlak.jurnalHarian.map((j, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white text-sm block">{j.aktivitas}</span>
                      <span className="text-slate-400">{j.tanggal}</span>
                    </div>
                    <span className="text-emerald-400 font-black text-base">{j.poin} Poin</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {subTab === 'presensi' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-emerald-950/30 border border-emerald-500/20 p-5 rounded-2xl">
                <div className="text-xs text-emerald-400 font-bold">Persentase Kehadiran</div>
                <div className="text-3xl font-black text-emerald-300 mt-1">{activeSantri.presensi.persentase}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs text-slate-400 font-bold">Hadir KBM/Diniyah</div>
                <div className="text-xl font-bold text-white mt-2">{activeSantri.presensi.hadir}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs text-slate-400 font-bold">Sakit (Klinik)</div>
                <div className="text-xl font-bold text-amber-400 mt-2">{activeSantri.presensi.sakit}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs text-slate-400 font-bold">Tanpa Alasan</div>
                <div className="text-xl font-bold text-emerald-400 mt-2">{activeSantri.presensi.alpa}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs">
              <span className="font-bold text-white text-sm block mb-1">🩺 Catatan Pos Kesehatan Santri (Poskestren):</span>
              <p className="text-slate-300 text-sm">{activeSantri.presensi.catatanKlinik}</p>
            </div>
          </div>
        )}

        {subTab === 'keuangan' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Status SPP Syahriah</span>
                <div className="text-xl font-black text-emerald-400 mt-1">{activeSantri.keuangan.sppStatus}</div>
                <p className="text-xs text-slate-400 mt-2">Nominal Bulanan: {activeSantri.keuangan.nominalSpp}</p>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Saldo Tabungan Santri</span>
                <div className="text-2xl font-black text-amber-400 mt-1">{activeSantri.keuangan.saldoTabungan}</div>
                <p className="text-xs text-slate-400 mt-2">Batas Jajan Mingguan: {activeSantri.keuangan.uangJajanMingguan}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">Riwayat Transaksi Tabungan & SPP Terbaru</h4>
              <div className="space-y-2">
                {activeSantri.keuangan.riwayatPenarikan.map((t, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white text-sm block">{t.keterangan}</span>
                      <span className="text-slate-400">{t.tanggal}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-sm block ${t.jumlah.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {t.jumlah}
                      </span>
                      <span className="text-[10px] text-slate-500">Sisa Saldo: {t.saldo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {subTab === 'izin' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-400 text-sm block mb-1">Status Perizinan Keluar/Pulang Aktif:</span>
              <p className="text-white text-base font-semibold">{activeSantri.izin.statusIzin}</p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-3">Riwayat Perizinan Terakhir</h4>
              <div className="space-y-2">
                {activeSantri.izin.riwayat.map((r, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">{r.alasan}</span>
                      <span className="text-slate-400">{r.tanggal}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <span className="font-bold text-blue-400 text-sm block mb-1">Tracking Paket Masuk dari Wali:</span>
              <p className="text-slate-200 text-sm">{activeSantri.izin.paketMasuk}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
