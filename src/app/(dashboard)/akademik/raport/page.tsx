'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Printer, 
  ArrowLeft, 
  Award, 
  BookOpen, 
  Search, 
  CheckCircle2, 
  Download, 
  MessageCircle, 
  User, 
  Calendar, 
  School,
  Building2,
  Lock,
  FileText
} from 'lucide-react';
import { 
  getSharedSantriList, 
  getSharedTahfidzSetoran, 
  MASTER_SANTRI, 
  MASTER_KELAS,
  isTenantMode 
} from '@/lib/sharedDataStore';
import { useActiveTenant } from '@/lib/sessionStore';
import { openWhatsAppQuickModal } from '@/components/common/WhatsAppQuickModal';
import { isERaportFeatureEnabled, isWhatsAppFeatureEnabled } from '@/lib/yayasanRegistrationStore';

interface MapelNilai {
  nama: string;
  kategori: 'Agama & Bahasa' | 'Umum & Sains';
  kkm: number;
  nilai: number;
  grade: 'A' | 'B' | 'C' | 'D';
  deskripsi: string;
}

const DEFAULT_MAPEL_LIST: MapelNilai[] = [
  { nama: "Al-Qur'an & Tajwid", kategori: 'Agama & Bahasa', kkm: 75, nilai: 92, grade: 'A', deskripsi: 'Sangat menguasai makhorijul huruf dan kaidah mad.' },
  { nama: 'Aqidah & Akhlaq', kategori: 'Agama & Bahasa', kkm: 75, nilai: 90, grade: 'A', deskripsi: 'Menunjukkan pemahaman rukun iman dan adab yang santun.' },
  { nama: 'Fiqih Ibadah', kategori: 'Agama & Bahasa', kkm: 75, nilai: 88, grade: 'A', deskripsi: 'Praktik thaharah dan sholat fardhu sangat baik.' },
  { nama: 'Bahasa Arab & Nahwu', kategori: 'Agama & Bahasa', kkm: 70, nilai: 85, grade: 'B', deskripsi: 'Mampu menyusun kalimat dasar dan kaidah isim-fiil.' },
  { nama: 'Hadits Nabawi', kategori: 'Agama & Bahasa', kkm: 75, nilai: 89, grade: 'A', deskripsi: 'Hafal 20 Hadits Arbain Nawawiyah dengan maknanya.' },
  { nama: 'Matematika', kategori: 'Umum & Sains', kkm: 70, nilai: 84, grade: 'B', deskripsi: 'Mampu menyelesaikan soal aljabar dan aritmatika.' },
  { nama: 'Ilmu Pengetahuan Alam (IPA)', kategori: 'Umum & Sains', kkm: 70, nilai: 87, grade: 'A', deskripsi: 'Sangat baik dalam memahami sistem biologi dan tata surya.' },
  { nama: 'Bahasa Indonesia', kategori: 'Umum & Sains', kkm: 75, nilai: 88, grade: 'A', deskripsi: 'Terampil menulis resensi buku dan berbicara di depan umum.' },
  { nama: 'Bahasa Inggris', kategori: 'Umum & Sains', kkm: 70, nilai: 82, grade: 'B', deskripsi: 'Percakapan harian (daily conversation) berkembang baik.' },
  { nama: 'Teknologi Informasi & Komputer', kategori: 'Umum & Sains', kkm: 70, nilai: 90, grade: 'A', deskripsi: 'Terampil mengoperasikan komputer dan aplikasi digital santri.' }
];

export default function CetakRaportSantriPage() {
  const tenant = useActiveTenant();
  const [mounted, setMounted] = useState(false);
  const [santriList, setSantriList] = useState<any[]>([]);
  const [selectedNis, setSelectedNis] = useState<string>('');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [tahunAjaran, setTahunAjaran] = useState<string>('2025/2026');
  const [tanggalCetak, setTanggalCetak] = useState<string>('16 Oktober 2026');

  useEffect(() => {
    setMounted(true);
    let list = getSharedSantriList();
    if (!list || list.length === 0) {
      list = MASTER_SANTRI;
    }
    setSantriList(list);
    if (list.length > 0) {
      setSelectedNis(list[0].nis);
    }
  }, []);

  const currentSantri = santriList.find(s => s.nis === selectedNis) || santriList[0] || {
    nis: '202601001',
    nama: 'Muhammad Al-Fatih',
    kelas: 'Kelas VII-A (MTs Tahfidz)',
    wali_nama: 'H. Syamsul Bahri',
    wali_kontak: '081234567890',
  };

  const allSetorans = mounted ? getSharedTahfidzSetoran() : [];
  const santriSetoran = allSetorans.filter(st => 
    (st.nis && currentSantri.nis && st.nis.trim() === currentSantri.nis.trim()) ||
    (st.santri && currentSantri.nama && st.santri.trim().toLowerCase() === currentSantri.nama.trim().toLowerCase())
  );

  const latestSetoran = santriSetoran[0];
  const totalRataRata = Math.round(DEFAULT_MAPEL_LIST.reduce((acc, m) => acc + m.nilai, 0) / DEFAULT_MAPEL_LIST.length);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWaRaport = () => {
    openWhatsAppQuickModal({
      phone: currentSantri.wali_kontak || '081234567890',
      recipientName: currentSantri.wali_nama || `Wali dari ${currentSantri.nama}`,
      templateKey: 'custom',
      defaultMessage: `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. Bapak/Ibu Wali dari ananda *${currentSantri.nama}*,
Alhamdulillah, berikut adalah Ringkasan Nilai Raport Semester ${semester} T.A. ${tahunAjaran}:
━━━━━━━━━━━━━━━━━━━━
• *Nama Santri:* ${currentSantri.nama} (NIS: ${currentSantri.nis})
• *Rombel / Kelas:* ${currentSantri.kelas || 'MTs Tahfidz'}
• *Rata-Rata Nilai KBM:* ${totalRataRata} (Predikat A - Amat Baik)
• *Capaian Tahfidz:* ${latestSetoran ? `Juz ${latestSetoran.juz || '30'} (${latestSetoran.rincian_hafalan || 'Selesai'})` : 'Juz 30 (Mutqin)'}
• *Nilai Kelancaran:* ${latestSetoran ? latestSetoran.kelancaran : 90} / 100
• *Kedisiplinan & Adab:* Sangat Baik (A)
━━━━━━━━━━━━━━━━━━━━
Buku Raport digital fisik resmi telah disahkan oleh Mudir Pesantren. Dokumen lengkap dapat dicek di Buku Pantau Portal Wali Santri.

Jazakumullahu khairan katsiran.
Wassalamu'alaikum Warahmatullahi Wabarakatuh.
_Pimpinan ${tenant.name || 'Pesantren'}_`
    });
  };

  if (!mounted) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Memuat data raport santri...
      </div>
    );
  }

  // Cek apakah Fitur E-Raport telah di-ACC / dicentang oleh Super Admin untuk Tenant ini
  if (!isERaportFeatureEnabled(tenant.id)) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800">Fitur E-Raport Digital Santri Belum Diaktifkan</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              Modul Cetak Raport Digital Santri &amp; Evaluasi Semesteran merupakan fitur modular mandiri yang memerlukan aktivasi lisensi dari <strong>Dashboard Super Admin</strong>.
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 max-w-md mx-auto">
            Lembaga: <strong>{tenant.name}</strong> • Silakan hubungi Super Admin untuk mencentang modul <strong>E-Raport Digital Santri</strong>.
          </div>
          <div className="pt-2">
            <Link
              href="/akademik/nilai"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Penilaian KBM</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Selector Bar (Disembunyikan saat print) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <Link 
              href="/akademik/nilai"
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition"
              title="Kembali ke Penilaian KBM"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base sm:text-lg">
                  Cetak Raport Digital &amp; Mutaba'ah Santri
                </h1>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  Format Resmi Pesantren
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Laporan Hasil Belajar Semesteran, Capaian Tahfidz Al-Qur'an, Nilai Akademik, dan Karakter Adab Santri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isWhatsAppFeatureEnabled(tenant.id) && (
              <button
                onClick={handleSendWaRaport}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Kirim Ringkasan Raport ke WhatsApp Wali"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Kirim Ringkasan WA</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-600 font-bold block mb-1 text-[11px]">Pilih Santri *</label>
            <select
              value={selectedNis}
              onChange={(e) => setSelectedNis(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {santriList.map((s) => (
                <option key={s.nis} value={s.nis}>
                  {s.nama} ({s.nis})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1 text-[11px]">Semester *</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1 text-[11px]">Tahun Ajaran *</label>
            <input
              type="text"
              value={tahunAjaran}
              onChange={(e) => setTahunAjaran(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1 text-[11px]">Tanggal Pengesahan *</label>
            <input
              type="text"
              value={tanggalCetak}
              onChange={(e) => setTanggalCetak(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📄 DOKUMEN RAPORT FISIK RESMI SIAP CETAK (A4 STANDARD SHEET) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-md max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-slate-900 font-serif leading-relaxed">
        
        {/* KOP SURAT PESANTREN */}
        <div className="border-b-4 border-double border-slate-800 pb-4 mb-6 flex items-center justify-between">
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="w-16 h-16 object-contain" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xl">
                KS
              </div>
            )}
          </div>

          <div className="text-center flex-1 px-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-600 font-sans">
              YAYASAN PONDOK PESANTREN
            </h3>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 font-serif tracking-tight mt-0.5">
              {tenant.name || 'PONDOK PESANTREN TAHFIDZ AL-QUR\'AN'}
            </h1>
            <p className="text-[11px] font-sans text-slate-600 font-medium">
              Satuan Pendidikan Muadalah / Madrasah Tsanawiyah &bull; NSM: 121232040019 &bull; NPSN: 69982341
            </p>
            <p className="text-[10px] font-sans text-slate-500 mt-0.5">
              Jl. Pesantren No. 01, Kompleks Kampus Putra & Putri &bull; WhatsApp: {tenant.leader_wa || '0812-8032-0505'} &bull; Website: www.kabarsantri.id
            </p>
          </div>

          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-emerald-800 rounded-full flex flex-col items-center justify-center text-center p-1 font-sans">
              <span className="text-[8px] font-bold text-emerald-800 leading-none">TERAKREDITASI</span>
              <span className="text-base font-black text-emerald-900 leading-none mt-0.5">A</span>
              <span className="text-[7px] text-slate-600 leading-none">UNGGUL</span>
            </div>
          </div>
        </div>

        {/* JUDUL DOKUMEN */}
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 underline decoration-slate-400 underline-offset-4">
            LAPORAN CAPAIAN HASIL BELAJAR &amp; MUTABA'AH SANTRI
          </h2>
          <p className="text-xs font-sans text-slate-600 font-medium">
            Semester {semester} &bull; Tahun Ajaran {tahunAjaran}
          </p>
        </div>

        {/* IDENTITAS SANTRI */}
        <div className="bg-slate-50/70 border border-slate-300 rounded-xl p-4 mb-6 font-sans text-xs">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex">
              <span className="w-36 text-slate-600">Nama Lengkap Santri</span>
              <span className="font-bold text-slate-900">: {currentSantri.nama}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-600">Nomor Induk (NIS)</span>
              <span className="font-bold font-mono text-slate-900">: {currentSantri.nis}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-600">Rombel / Kelas</span>
              <span className="font-semibold text-slate-900">: {currentSantri.kelas || 'VII-A (MTs Tahfidz)'}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-600">Nama Orang Tua / Wali</span>
              <span className="font-semibold text-slate-900">: {currentSantri.wali_nama || 'H. Syamsul Bahri'}</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-600">Program Pembelajaran</span>
              <span className="font-semibold text-slate-900">: Reguler Tahfidz 30 Juz &amp; Formal</span>
            </div>
            <div className="flex">
              <span className="w-36 text-slate-600">Kamar Asrama</span>
              <span className="font-semibold text-slate-900">: Gedung Abu Bakar Ash-Shiddiq</span>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* BAGIAN A: CAPAIAN TAHFIDZ AL-QUR'AN & ILMU AGAMA */}
        {/* ===================================================================== */}
        <div className="mb-6 space-y-2">
          <h3 className="font-sans font-bold text-xs uppercase text-emerald-950 flex items-center gap-1.5 border-b border-emerald-300 pb-1">
            <span>A. Capaian Program Tahfidz Al-Qur'an &amp; Mutaba'ah Halaqah</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border border-slate-300">
              <thead className="bg-emerald-50 text-emerald-950 font-bold border-b border-slate-300 text-[11px]">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-300">Materi Setoran</th>
                  <th className="py-2 px-3 border-r border-slate-300">Capaian Terakhir (Juz / Hal)</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Tajwid</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Kelancaran</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Makhraj</th>
                  <th className="py-2 px-3 text-center border-r border-slate-300">Status Kelulusan</th>
                  <th className="py-2 px-3">Musyrif Pembimbing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 font-semibold border-r border-slate-300">
                    {latestSetoran?.nama_materi || "Hafalan Al-Qur'an (Ziyadah & Muraja'ah)"}
                  </td>
                  <td className="py-2 px-3 font-mono border-r border-slate-300">
                    Juz {latestSetoran?.juz || '30'} &bull; {latestSetoran?.rincian_hafalan || 'Hal. 582 - 604 (Surah An-Naba s.d An-Nas)'}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800 border-r border-slate-300">
                    {latestSetoran?.tajwid || 90}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800 border-r border-slate-300">
                    {latestSetoran?.kelancaran || 92}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-emerald-800 border-r border-slate-300">
                    {latestSetoran?.makhraj || 88}
                  </td>
                  <td className="py-2 px-3 text-center border-r border-slate-300">
                    <span className="font-bold text-emerald-800">MUTQIN / LULUS</span>
                  </td>
                  <td className="py-2 px-3 text-slate-700">
                    {latestSetoran?.musyrif || 'Ust. Ahmad Zaki, Al-Hafidz'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* BAGIAN B: PENILAIAN KBM MATA PELAJARAN (KURIKULUM FORMAL & PESANTREN) */}
        {/* ===================================================================== */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1">
            <h3 className="font-sans font-bold text-xs uppercase text-slate-900">
              B. Capaian Hasil Belajar Mata Pelajaran (KBM)
            </h3>
            <span className="font-sans text-[11px] text-slate-600">
              Rata-rata: <strong className="text-slate-900 font-mono text-xs">{totalRataRata}</strong> (Predikat A)
            </span>
          </div>

          <table className="w-full text-left font-sans text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
              <tr>
                <th className="py-2 px-2.5 text-center border-r border-slate-300 w-10">No</th>
                <th className="py-2 px-3 border-r border-slate-300">Mata Pelajaran</th>
                <th className="py-2 px-2 text-center border-r border-slate-300 w-14">KKM</th>
                <th className="py-2 px-2 text-center border-r border-slate-300 w-16">Nilai</th>
                <th className="py-2 px-2 text-center border-r border-slate-300 w-14">Predikat</th>
                <th className="py-2 px-3">Capaian Kompetensi &amp; Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {DEFAULT_MAPEL_LIST.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-1.5 px-2.5 text-center border-r border-slate-300 text-slate-500 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800 border-r border-slate-300">
                    {m.nama}
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono text-slate-600 border-r border-slate-300">
                    {m.kkm}
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-900 border-r border-slate-300">
                    {m.nilai}
                  </td>
                  <td className="py-1.5 px-2 text-center font-bold border-r border-slate-300">
                    <span className={m.grade === 'A' ? 'text-emerald-800' : 'text-blue-800'}>
                      {m.grade}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-slate-600 text-[11px]">
                    {m.deskripsi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===================================================================== */}
        {/* BAGIAN C & D: ADAB, KARAKTER & KEHADIRAN */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-2 gap-4 mb-6 font-sans text-xs">
          {/* C. Penilaian Adab & Karakter */}
          <div className="border border-slate-300 rounded-xl p-3 space-y-2">
            <h4 className="font-bold text-xs uppercase text-slate-900 border-b border-slate-200 pb-1">
              C. Penilaian Adab, Akhlaq &amp; Kedisiplinan
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>1. Sholat Berjamaah 5 Waktu &amp; Qiyamul Lail:</span>
                <strong className="text-emerald-800">A (Sangat Baik)</strong>
              </div>
              <div className="flex justify-between">
                <span>2. Akhlaq kepada Asatidz &amp; Teman:</span>
                <strong className="text-emerald-800">A (Sangat Baik)</strong>
              </div>
              <div className="flex justify-between">
                <span>3. Kebersihan Diri &amp; Kamar Asrama:</span>
                <strong className="text-blue-800">B+ (Baik Sekali)</strong>
              </div>
              <div className="flex justify-between">
                <span>4. Kedisiplinan Halaqah &amp; Masuk Kelas:</span>
                <strong className="text-emerald-800">A (Sangat Disiplin)</strong>
              </div>
            </div>
          </div>

          {/* D. Rekapitulasi Kehadiran */}
          <div className="border border-slate-300 rounded-xl p-3 space-y-2">
            <h4 className="font-bold text-xs uppercase text-slate-900 border-b border-slate-200 pb-1">
              D. Catatan Kehadiran &amp; Absensi
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>1. Sakit (dengan Surat Keterangan):</span>
                <strong className="font-mono">1 Hari</strong>
              </div>
              <div className="flex justify-between">
                <span>2. Izin Kepulangan Resmi:</span>
                <strong className="font-mono">2 Hari</strong>
              </div>
              <div className="flex justify-between">
                <span>3. Alpa / Tanpa Keterangan:</span>
                <strong className="font-mono text-emerald-800">0 Hari (Nihil)</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span className="font-bold text-slate-700">Persentase Kehadiran Belajar:</span>
                <strong className="font-mono text-emerald-800 font-bold">98.5% (Tinggi)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* CATATAN WALI KELAS */}
        <div className="border border-slate-300 rounded-xl p-3 mb-8 font-sans text-xs space-y-1">
          <span className="font-bold text-slate-800 uppercase block text-[11px]">
            E. Catatan &amp; Rekomendasi Wali Kelas / Musyrif
          </span>
          <p className="text-slate-700 italic leading-relaxed text-[11px]">
            "Alhamdulillah, ananda {currentSantri.nama} menunjukkan komitmen yang sangat membanggakan dalam menghafal Al-Qur'an serta aktif mengikuti kegiatan KBM formal. Ananda senantiasa menjaga adab sopan santun kepada para asatidz dan gemar membantu teman seasrama. Pertahankan istiqomah dan terus tingkatkan muraja'ah mandiri di waktu luang."
          </p>
        </div>

        {/* PENGESAHAN TANDA TANGAN (KOLOM 3 TTD) */}
        <div className="grid grid-cols-3 gap-4 font-sans text-xs text-center pt-2">
          <div className="space-y-16">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-semibold text-slate-800">Orang Tua / Wali Santri</p>
            </div>
            <div>
              <p className="font-bold underline decoration-slate-400 text-slate-900">
                {currentSantri.wali_nama || 'H. Syamsul Bahri'}
              </p>
              <p className="text-[10px] text-slate-500">Wali Santri</p>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <p className="text-slate-600">Pondok Pesantren, {tanggalCetak}</p>
              <p className="font-semibold text-slate-800">Wali Kelas / Musyrif</p>
            </div>
            <div>
              <p className="font-bold underline decoration-slate-400 text-slate-900">
                {latestSetoran?.musyrif || 'Ust. Ahmad Zaki, S.Pd.I'}
              </p>
              <p className="text-[10px] text-slate-500">NIP. 19930415202601004</p>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <p className="text-slate-600">Menyetujui &amp; Mengesahkan,</p>
              <p className="font-bold text-slate-900">Mudir Pesantren / Kepala Madrasah</p>
            </div>
            <div>
              <p className="font-bold underline decoration-slate-400 text-slate-900">
                {tenant.leader_name || 'Dr. H. M. Mansyur, Lc., M.A.'}
              </p>
              <p className="text-[10px] text-slate-500">NIP. 198205122010011002</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
