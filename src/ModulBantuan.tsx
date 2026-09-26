import React from 'react';
import { openDirectWA } from './teleponUtils';

interface ModulBantuanProps {
  peran: string; // 'yayasan' | 'kepsek' | 'guru' | 'musyrif' | 'keuangan' | 'kesantrian' | 'wali' | string;
  namaAktif?: string;
  onTutup?: () => void;
}

const NOMOR_WA_SUPPORT = '6281215566630';

export function ModulBantuan({ peran, namaAktif, onTutup }: ModulBantuanProps) {
  const isYayasan = peran.toLowerCase().includes('yayasan') || peran.toLowerCase().includes('operator');
  const isKepsek = peran.toLowerCase().includes('kepsek') || peran.toLowerCase().includes('kepala');
  const isGuru = peran.toLowerCase().includes('guru');
  const isMusyrif = peran.toLowerCase().includes('musyrif') || peran.toLowerCase().includes('kesantrian');
  const isKeuangan = peran.toLowerCase().includes('keuangan') || peran.toLowerCase().includes('bendahara');
  const isWali = peran.toLowerCase().includes('wali');

  const hubungiWaSupport = () => {
    const pesan = `Assalamu'alaikum Warahmatullahi Wabarakatuh,\nSaya dari Yayasan/Lembaga *${namaAktif || '-'}* membutuhkan bantuan terkait penggunaan sistem KabarSantri.\nMohon bantuannya, terima kasih.`;
    openDirectWA(NOMOR_WA_SUPPORT, pesan);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-blue-800/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#0A4ABF] text-white text-[10px] uppercase font-black px-3 py-1 rounded-full border border-blue-400/30 tracking-wider">
              📖 PUSAT PANDUAN PENGGUNA
            </span>
            <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-400/20">
              Peran: {peran.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Panduan Fitur & Bantuan Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Panduan langkah demi langkah khusus disesuaikan untuk tugas & wewenang akun {peran}.
          </p>
        </div>

        {onTutup && (
          <button
            onClick={onTutup}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-2xl text-xs backdrop-blur-md border border-white/20 transition active:scale-95 shrink-0"
          >
            ✕ Tutup
          </button>
        )}
      </div>

      {/* Main Content Guide tailored strictly by Role */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        {/* 🏢 1. PANDUAN YAYASAN */}
        {isYayasan && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <h2 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
                <span>🏫</span> Panduan Utama Pengurus Yayasan
              </h2>
              <p className="text-slate-600 text-xs">
                Sebagai pengurus Yayasan, Anda memegang hak penuh dalam pengawasan seluruh unit lembaga, manajemen staf, dan pengaturan identitas sistem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span>1️⃣</span> Pengaturan Identitas & Logo Pesantren
                </h3>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Buka menu <b>Identitas & Logo</b> di sidebar untuk mengunggah logo resmi pesantren Anda (PNG/JPG) dan memperbarui alamat lengkap lembaga yang tampil pada header aplikasi dan kop surat cetakan.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span>2️⃣</span> Manajemen Pegawai & Guru (Password 6 Angka)
                </h3>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Buka menu <b>Pegawai</b> untuk mendaftarkan akun Guru, Musyrif, dan Staf. Setiap akun Guru/Pegawai dibuatkan NIP &amp; <b>Password yang terdiri dari 6 angka/karakter (6 digit)</b>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span>🔑</span> Akun &amp; PIN Wali Santri (Password 8 Angka)
                </h3>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Akun Wali Santri dibuatkan oleh pihak Yayasan/Sekolah dengan <b>Password / PIN keamanan yang terdiri dari 8 angka (8 digit)</b> untuk masuk ke portal orang tua.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span>3️⃣</span> Monitoring Ringkasan Keuangan & SPP
                </h3>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Pantau rekapitulasi pemasukan SPP, donasi lembaga, dan riwayat validasi pembayaran wali santri melalui Dashboard & Modul Laporan.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span>4️⃣</span> Google Chat Space Terkelompok
                </h3>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Masuk ke menu <b>Google Chat Ruang</b> untuk mengatur ruang diskusi khusus yayasan, majelis guru, musyrif, maupun wali santri.
                </p>
              </div>
            </div>

            {/* WA Support Button ONLY for Yayasan */}
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div>
                <h3 className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                  <span>💬</span> Layanan Bantuan Langsung Pengelola (Khusus Yayasan)
                </h3>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  Butuh bantuan teknis atau konsultasi penambahan kuota & fitur modular? Hubungi Customer Care kami via WhatsApp.
                </p>
              </div>
              <button
                onClick={hubungiWaSupport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition active:scale-95 shrink-0 text-xs flex items-center gap-2"
              >
                <span>💬</span> Hubungi Support Pusat via WA
              </button>
            </div>
          </div>
        )}

        {/* 🎓 2. PANDUAN KEPALA SEKOLAH */}
        {isKepsek && (
          <div className="space-y-4">
            <div className="bg-[#0A4ABF]/10 p-4 rounded-2xl border border-[#0A4ABF]/30">
              <h2 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
                <span>🎓</span> Panduan Utama Kepala Sekolah / Pengasuh
              </h2>
              <p className="text-slate-600 text-xs">
                Sebagai Kepala Sekolah, fokus utama Anda adalah mengawasi perkembangan akademik santri, jurnal hafalan Tahfidz, dan keaktifan presensi guru/santri.
              </p>
            </div>

            <div className="space-y-3 text-[11px] text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">📖 Monitoring Hafalan Tahfidz:</span>
                Lihat rekapitulasi capaian hafalan juz & surah santri harian melalui menu <b>Tahfidz</b>.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">📊 Evaluasi Presensi & SDM:</span>
                Pantau kedisiplinan kehadiran guru & santri harian dari menu <b>Presensi</b>.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">💬 Komunikasi Ruang Guru:</span>
                Gunakan menu <b>Google Chat Ruang</b> untuk berkoordinasi langsung dengan Majelis Guru.
              </div>
            </div>
          </div>
        )}

        {/* 📖 3. PANDUAN GURU */}
        {isGuru && (
          <div className="space-y-4">
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200">
              <h2 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
                <span>📖</span> Panduan Utama Guru / Pengajar
              </h2>
              <p className="text-slate-600 text-xs">
                Fokus tugas Anda adalah mengisikan presensi santri di kelas dan mencatat perkembangan hafalan Tahfidz harian.
              </p>
            </div>

            <div className="space-y-3 text-[11px] text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">✅ Input Presensi Santri Harian:</span>
                Buka menu <b>Presensi</b> setiap awal jam pelajaran untuk menandai santri Hadir, Izin, Sakit, atau Alpa.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">📖 Input Setoran Hafalan Tahfidz:</span>
                Buka menu <b>Tahfidz</b> untuk mencatat juz, surah, ayat, dan nilai kelancaran hafidz/hafidzah ananda.
              </div>
            </div>
          </div>
        )}

        {/* 🚪 4. PANDUAN MUSYRIF / KESANTRIAN */}
        {isMusyrif && (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <h2 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
                <span>🚪</span> Panduan Utama Musyrif Asrama & Kesantrian
              </h2>
              <p className="text-slate-600 text-xs">
                Fokus tugas Anda adalah mengelola perizinan keluar-masuk santri dan mencatat poin kedisiplinan/akhlak.
              </p>
            </div>

            <div className="space-y-3 text-[11px] text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">🚪 Input Perizinan Pulang Santri:</span>
                Buka menu <b>Izin Pulang</b> untuk mencatat tanggal keluar, estimasi kembali, & alasan kepulangan santri.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">⭐ Catatan Reward & Pelanggaran:</span>
                Buka menu <b>Karakter & Pelanggaran</b> untuk mencatat poin kebaikan/apresiasi serta rekap pelanggaran disiplin.
              </div>
            </div>
          </div>
        )}

        {/* 💳 5. PANDUAN STAF KEUANGAN */}
        {isKeuangan && (
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <h2 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
                <span>💳</span> Panduan Utama Staf Keuangan & Bendahara
              </h2>
              <p className="text-slate-600 text-xs">
                Fokus tugas Anda adalah memvalidasi resi pembukti transfer SPP, tabungan, dan pembukuan keuangan santri.
              </p>
            </div>

            <div className="space-y-3 text-[11px] text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">💳 Validasi Transfer SPP Wali Santri:</span>
                Buka menu <b>Validasi Pembayaran</b> untuk mengecek foto resi transfer yang diunggah wali santri dan mengubah statusnya menjadi Lunas.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">💰 Pengelolaan Tabungan & Uang Jajan:</span>
                Buka menu <b>Tabungan</b> atau <b>Uang Jajan</b> untuk mencatat mutasi setoran & penarikan harian santri.
              </div>
            </div>
          </div>
        )}

        {/* 👨‍👩‍👧 6. PANDUAN WALI SANTRI */}
        {isWali && (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <h2 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
                <span>👨‍👩‍👧</span> Panduan Utama Wali Santri
              </h2>
              <p className="text-slate-600 text-xs">
                Selamat datang Ayah/Bunda! Portal ini membantu Anda memantau perkembangan hafalan, kedisiplinan, dan pembayaran SPP ananda secara transparan.
              </p>
            </div>

            <div className="space-y-3 text-[11px] text-slate-600 leading-relaxed">
              <div className="p-3 bg-indigo-100/50 rounded-xl border border-indigo-200">
                <span className="font-bold text-indigo-950 block mb-0.5">🔑 Ketentuan Password / PIN Akun Wali Santri:</span>
                Password / PIN akun Wali Santri terdiri dari <b>8 angka (8 digit)</b> yang dibuatkan dan didaftarkan oleh pihak Yayasan/Sekolah.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">📖 Cek Capaian Hafalan Ananda:</span>
                Buka menu <b>Tahfidz</b> untuk melihat laporan hafalan juz & surah yang telah disetorkan ananda kepada Ustadz/Ustadzah.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">💳 Upload Bukti Bayar SPP:</span>
                Buka menu <b>Pembayaran SPP</b> untuk melihat rincian tagihan dan mengunggah foto resi bukti transfer bank/e-wallet.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="font-bold text-slate-900 block mb-0.5">🚪 Pengajuan Izin Pulang:</span>
                Lihat status perizinan pulang ananda di menu <b>Perizinan</b>.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
