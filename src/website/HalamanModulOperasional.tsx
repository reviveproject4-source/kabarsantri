import React from 'react';

export const HalamanModulOperasional: React.FC = () => {
  const modulList = [
    {
      nama: 'Buku Induk & Multi-Tenant Santri',
      ikon: '📚',
      kategori: 'Administrasi Utama',
      deskripsi: 'Pencatatan data identitas santri, riwayat wali, foto, dokumen akta/KK, status kelas, dan penempatan asrama.',
      fitur: [
        'Multi-tenant unit (Pesantren, SMP, SMA, PAUD terisolasi)',
        'Buku induk digital yang dapat di-export ke Excel/PDF',
        'Pencarian kilat berdasarkan NIS, Nama, atau Wali',
      ],
    },
    {
      nama: 'Jurnal Tahfidz & Akademik Al-Qur\'an',
      ikon: '📖',
      kategori: 'Kurikulum & Hafalan',
      deskripsi: 'Pencatatan setoran ziyadah hafalan baru dan murajaah harian oleh ustadz penguji dalam hitungan detik.',
      fitur: [
        'Tracking per Surah, Juz, Halaman, dan Ayat',
        'Penilaian Makhraj, Tajwid, dan Kelancaran (A+/A/B)',
        'Grafik pertumbuhan juz hafalan santri',
      ],
    },
    {
      nama: 'Keuangan, SPP & Tabungan Multi-Kas',
      ikon: '💳',
      kategori: 'Finansial & Kas',
      deskripsi: 'Pengelolaan tagihan syahriah SPP, uang jajan santri, saldo tabungan, dan validasi resi transfer wali.',
      fitur: [
        'Validasi otomatis bukti transfer pembayaran SPP',
        'Pencairan uang jajan mingguan terkontrol',
        'Laporan penerimaan kas & tunggakan per unit',
      ],
    },
    {
      nama: 'Jurnal Adab & Akhlak Karakter',
      ikon: '🌟',
      kategori: 'Kesantrian & Asrama',
      deskripsi: 'Sistem pencatatan poin kebaikan, kedisiplinan shalat berjamaah, dan pembinaan kepribadian santri.',
      fitur: [
        'Reward poin positif untuk aktivitas terpuji',
        'Pencatatan pelanggaran & tingkat pembinaan',
        'Catatan perkembangan adab harian oleh musyrif',
      ],
    },
    {
      nama: 'Presensi Digital & Pos Kesehatan (Poskestren)',
      ikon: '📅',
      kategori: 'Kehadiran & Kesehatan',
      deskripsi: 'Absensi KBM kelas & diniyah, serta pencatatan kondisi fisik dan riwayat berobat di klinik pesantren.',
      fitur: [
        'Absensi 1-klik ustadz via smartphone',
        'Tracking santri sakit & resep obat klinik',
        'Rekap kehadiran bulanan otomatis',
      ],
    },
    {
      nama: 'Perizinan Pulang & Kiriman Paket',
      ikon: '🎒',
      kategori: 'Perizinan & Keamanan',
      deskripsi: 'Alur persetujuan perizinan keluar/pulang berjenjang dan serah terima paket wali santri.',
      fitur: [
        'Approval digital oleh Wali Kelas/Kesantrian',
        'Notifikasi status perizinan ke HP Wali Santri',
        'QR Code / Verifikasi saat santri dijemput',
      ],
    },
    {
      nama: 'Ruang Obrolan Google Chat & WhatsApp Notification',
      ikon: '💬',
      kategori: 'Komunikasi Direct',
      deskripsi: 'Integrasi ruang obrolan terisolasi per peran serta notifikasi otomatis WhatsApp.',
      fitur: [
        'Notifikasi WhatsApp otomatis saat ada laporan baru',
        'Google Chat Space per kelas & asrama',
        'Menghindari spam grup WhatsApp umum',
      ],
    },
    {
      nama: 'Executive Dashboard Yayasan',
      ikon: '📊',
      kategori: 'Pengawasan Pimpinan',
      deskripsi: 'Laporan konsolidasi otomatis seluruh unit sekolah untuk Ketua Yayasan dan Kepala Sekolah.',
      fitur: [
        'Ringkasan total santri, keuangan, & tahfidz 1-klik',
        'Siap dibawa ke rapat pengurus yayasan',
        'Hak akses berjenjang (RBAC/ABAC)',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
          Modul System Operation Pesantren
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Fitur Lengkap Dirancang Khusus Kebutuhan Pesantren
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Setiap modul saling terhubung secara otomatis tanpa perlu input ganda di tempat terpisah.
        </p>
      </div>

      {/* GRID MODUL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {modulList.map((m, i) => (
          <div key={i} className="bg-slate-900/70 border border-slate-800 p-8 rounded-3xl space-y-4 hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <div className="text-4xl">{m.ikon}</div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-[11px] font-bold border border-slate-700">
                {m.kategori}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">{m.nama}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{m.deskripsi}</p>
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 block mb-2">Keunggulan Modul:</span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {m.fitur.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
