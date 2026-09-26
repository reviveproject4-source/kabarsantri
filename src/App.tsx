import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { ModulSantri } from './ModulSantri';
import { SplashWelcomeScreen } from './SplashWelcomeScreen';
import { ModulPegawai } from './ModulPegawai';
import { ModulWaliSantri } from './ModulWaliSantri';
import { ModulTahfidz } from './ModulTahfidz';
import { ModulPresensi } from './ModulPresensi';
import { ModulAkhlak } from './ModulAkhlak';
import { ModulSpp } from './ModulSpp';
import { ModulDaftarUlang } from './ModulDaftarUlang';
import { ModulUangPendaftaran } from './ModulUangPendaftaran';
import { ModulUangJajan } from './ModulUangJajan';
import { ModulTabungan } from './ModulTabungan';
import { ModulDonasi } from './ModulDonasi';
import { ModulPaket } from './ModulPaket';
import { ModulIzinPulang } from './ModulIzinPulang';
import { ModulRewardPelanggaran } from './ModulRewardPelanggaran';
import { ModulValidasiPembayaran } from './ModulValidasiPembayaran';
import { ModulWali } from './ModulWali';
import { ModulPengumuman } from './ModulPengumuman';
import { ModulHubungiWali } from './ModulHubungiWali';
import { PresensiSaya } from './PresensiSaya';
import { isJabatanMusyrif, isJabatanKesantrian } from './jabatanUtils';
import { AturPasswordBaru } from './AturPasswordBaru';
import { tanggalLokal } from './tanggal';
import { ModulKepsek } from './ModulKepsek';
import { ModulLaporan } from './ModulLaporan';
import { ModulGoogleChat } from './ModulGoogleChat';
import { ModulProfilYayasan } from './ModulProfilYayasan';
import { ModulSuperAdmin } from './ModulSuperAdmin';
import { ModulBantuan } from './ModulBantuan';
import { FormPendaftaranYayasan } from './FormPendaftaranYayasan';
import { PilihPeran } from './PilihPeran';
import { useAuth } from './AuthContext';
import { useSantriList, useSantriById } from './hooks/useSantri';
import { usePegawaiList } from './hooks/usePegawai';
import { usePresensiPegawaiList } from './hooks/usePresensi';
import { useRingkasanKeuangan } from './hooks/useRingkasanKeuangan';
import { bulanEnamTerakhir, GrafikGaris, WARNA_STATUS } from './Grafik';
import { WebsiteKabarSantri } from './website/WebsiteKabarSantri';
import ModulPaudUtama from './ModulPaudUtama';
import { ModulPendaftaranLembaga } from './components/paud/ModulPendaftaranLembaga';

function Memuat() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Memuat...
    </div>
  );
}

export default function App() {
  const [isAllowed, setIsAllowed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modeDaftar, setModeDaftar] = useState(false);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);

  const { memuat, session, profil, yayasan, peran, keluar, modePemulihanPassword } =
    useAuth();

  const [showPendaftaranLembagaPublik, setShowPendaftaranLembagaPublik] = useState(false);

  const bukaPortalSuperAdminWithPin = () => {
    const inputPin = prompt('🔒 Masukkan PIN Rahasia Super Admin Pusat KabarSantri:');
    if (inputPin === '8888' || inputPin === '9999') {
      setShowSuperAdmin(true);
    } else if (inputPin !== null) {
      alert('❌ PIN Salah! Akses Portal Super Admin Ditolak.');
    }
  };

  useEffect(() => {
    // Standalone URL check: http://localhost:5184/?admin=true
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('superadmin') === '1') {
      bukaPortalSuperAdminWithPin();
    }

    // Secret Hotkey: Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        bukaPortalSuperAdminWithPin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (showSuperAdmin) {
    return <ModulSuperAdmin onKembali={() => setShowSuperAdmin(false)} />;
  }

  if (showPendaftaranLembagaPublik) {
    return (
      <ModulPendaftaranLembaga
        onBackToLogin={() => setShowPendaftaranLembagaPublik(false)}
      />
    );
  }

  if (!isAllowed) {
    return (
      <WebsiteKabarSantri
        onBukaLogin={() => {
          setIsAllowed(true);
          setModeDaftar(false);
        }}
        onBukaPendaftaranLembaga={() => {
          setIsAllowed(true);
          setModeDaftar(true);
        }}
        onBukaSuperAdmin={bukaPortalSuperAdminWithPin}
      />
    );
  }

  if (memuat) {
    return <Memuat />;
  }

  if (modePemulihanPassword) {
    return <AturPasswordBaru />;
  }

  if (!session) {
    if (modeDaftar) {
      return (
        <FormPendaftaranYayasan
          onKembali={() => {
            setModeDaftar(false);
            setIsAllowed(false);
          }}
        />
      );
    }
    return <PilihPeran onDaftarBaru={() => setModeDaftar(true)} />;
  }

  if (!profil || !yayasan) {
    return <Memuat />;
  }

  if (peran === 'wali') {
    return (
      <RuteWali santriId={profil.santri_id} onKeluar={keluar} />
    );
  }

  return (
    <RuteStaff
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onKeluar={keluar}
    />
  );
}

function RuteWali({
  santriId,
  onKeluar,
}: {
  santriId: number | null;
  onKeluar: () => void;
}) {
  const { data: santri, isLoading } = useSantriById(santriId);

  if (isLoading || !santri) {
    return <Memuat />;
  }

  return <ModulWali santri={santri} onKeluar={onKeluar} />;
}

function RuteStaff({
  activeTab,
  setActiveTab,
  onKeluar,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onKeluar: () => void;
}) {
  const { profil, yayasan } = useAuth();
  const { data: santriList = [] } = useSantriList();
  const { data: pegawaiList = [] } = usePegawaiList();
  const { data: presensiPegawaiList = [] } = usePresensiPegawaiList();

  const isYayasan = profil?.peran === 'yayasan';
  const pegawaiAktif = pegawaiList.find((p) => p.id === profil?.pegawai_id);
  const namaAktif = isYayasan
    ? yayasan?.namaPenanggungJawab || 'Yayasan'
    : pegawaiAktif?.nama || '';
  const jabatanAktif = (pegawaiAktif?.jabatan ?? '').trim().toLowerCase();
  const isGuru = jabatanAktif === 'guru';
  const isMusyrif = isJabatanMusyrif(jabatanAktif);
  const isKeuangan = jabatanAktif === 'keuangan';
  const isKepsek = jabatanAktif === 'kepala sekolah';
  const isKesantrian = isJabatanKesantrian(jabatanAktif);

  const kelasDiajarAktif =
    isGuru && !pegawaiAktif?.aksesSemuaKelas
      ? pegawaiAktif?.kelasDiajar ?? []
      : [];
  const jenisKelaminDiampuAktif = pegawaiAktif?.jenisKelaminDiampu ?? '';

  const jumlahGuru = pegawaiList.filter(
    (p) => p.jabatan.trim().toLowerCase() === 'guru'
  ).length;

  const jumlahMusyrif = pegawaiList.filter((p) =>
    isJabatanMusyrif(p.jabatan)
  ).length;

  const jumlahWali = santriList.filter(
    (s) => s.namaAyah || s.namaIbu
  ).length;

  const hariIni = tanggalLokal();
  const statusPegawaiHariIni = new Map(
    presensiPegawaiList
      .filter((p) => p.tanggal === hariIni)
      .map((p) => [String(p.pegawaiId), p.status])
  );
  const jumlahHadirHariIni = pegawaiList.filter(
    (p) => statusPegawaiHariIni.get(String(p.id)) === 'Hadir'
  ).length;

  const {
    totalDaftarUlang,
    totalUangPendaftaran,
    totalDonasi,
    totalPemasukan,
    trenPerBulan,
  } = useRingkasanKeuangan();
  const kategoriBulanKeuangan = bulanEnamTerakhir().map((b) => b.label);

  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isYayasan={isYayasan}
        isGuru={isGuru}
        isMusyrif={isMusyrif}
        isKeuangan={isKeuangan}
        isKepsek={isKepsek}
        isKesantrian={isKesantrian}
        namaAktif={namaAktif}
        labelPeran={isYayasan ? 'Operator' : pegawaiAktif?.jabatan ?? ''}
        onGantiPeran={onKeluar}
        isOpenMobile={sidebarMobileOpen}
        onCloseMobile={() => setSidebarMobileOpen(false)}
        logoYayasanUrl={yayasan?.logoUrl}
        namaYayasan={yayasan?.namaYayasan}
        alamatYayasan={yayasan?.alamat}
      />

      <main className="flex-1 p-4 sm:p-8 bg-slate-50/50 overflow-y-auto">
        {/* Sticky Mobile Navbar */}
        <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-3 px-4 rounded-2xl mb-4 shadow-md border border-slate-800">
          <div className="flex items-center gap-2.5">
            <img src="/logo-kabarsantri.png" alt="Logo KabarSantri" className="w-8 h-8 rounded-xl object-cover" />
            <span className="font-black text-sm tracking-tight text-white">KABARSANTRI</span>
          </div>

          <button
            onClick={() => setSidebarMobileOpen(true)}
            className="bg-[#0A4ABF] hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition active:scale-95"
          >
            <span>☰</span> Menu
          </button>
        </div>
        {activeTab === 'dashboard' && isYayasan && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Welcome Gradient Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#0A4ABF] via-blue-800 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/20 border border-blue-600/30">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 text-cyan-100 text-xs px-3 py-1 rounded-full font-bold border border-white/30 tracking-wide uppercase">
                      Yayasan Operasional
                    </span>
                    <span className="bg-white/10 text-sky-100 text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                      Multi-tenant Active
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                    {yayasan?.namaYayasan || 'Dashboard Yayasan KabarSantri'}
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1.5 font-normal max-w-2xl">
                    Selamat datang kembali, <span className="font-semibold text-white">{namaAktif}</span>! Berikut adalah ikhtisar terkini perkembangan santri, keuangan, dan aktivitas SDM lembaga hari ini ({tanggalLokal()}).
                  </p>
                </div>
                
                <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-right">
                    <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Paket System</div>
                    <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <span>👑</span> {yayasan?.paket || 'Gratis'}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('profil-yayasan')}
                    className="bg-white/20 hover:bg-white/30 text-white font-bold px-3.5 py-2 rounded-xl text-xs border border-white/30 backdrop-blur-md transition flex items-center gap-1.5"
                  >
                    <span>⚙️</span> Edit Logo & Alamat Lembaga
                  </button>
                </div>
              </div>
            </div>

            {/* Presensi Widget for Current User */}
            <PresensiSaya pegawaiId={null} presensiPegawai={presensiPegawaiList} />

            {/* Quick Action Shortcuts Bar */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Aksi Cepat & Navigasi Direct</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('santri')}
                  className="bg-white hover:bg-emerald-50/50 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-emerald-300 transition-all text-left flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
                    ➕
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Santri Baru</div>
                    <div className="text-[10px] text-slate-400">Input Data</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('validasi-pembayaran')}
                  className="bg-white hover:bg-teal-50/50 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-teal-300 transition-all text-left flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
                    ✅
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">Validasi Keuangan</div>
                    <div className="text-[10px] text-slate-400">Bukti Transfer</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('pengumuman')}
                  className="bg-white hover:bg-cyan-50/50 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-cyan-300 transition-all text-left flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
                    📢
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">Pengumuman</div>
                    <div className="text-[10px] text-slate-400">Broadcast WA</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('laporan')}
                  className="bg-white hover:bg-indigo-50/50 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-indigo-300 transition-all text-left flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
                    📑
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Laporan Exec</div>
                    <div className="text-[10px] text-slate-400">Rekap Bulanan</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Demografi & SDM Master Stats */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Statistik Demografi & SDM</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Santri</h3>
                    <p className="text-3xl font-black text-slate-900 mt-1">{santriList.length}</p>
                    <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 mt-1">
                      <span>✓</span> Santri Terdaftar
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-inner">
                    🎓
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guru / Pengajar</h3>
                    <p className="text-3xl font-black text-slate-900 mt-1">{jumlahGuru}</p>
                    <span className="text-[11px] font-semibold text-teal-600 inline-flex items-center gap-1 mt-1">
                      <span>✓</span> Tenaga Pendidik
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-xl shadow-inner">
                    👨‍🏫
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Musyrif Asrama</h3>
                    <p className="text-3xl font-black text-slate-900 mt-1">{jumlahMusyrif}</p>
                    <span className="text-[11px] font-semibold text-cyan-600 inline-flex items-center gap-1 mt-1">
                      <span>✓</span> Pembina Asrama
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 font-bold flex items-center justify-center text-xl shadow-inner">
                    🕌
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wali Santri</h3>
                    <p className="text-3xl font-black text-slate-900 mt-1">{jumlahWali}</p>
                    <span className="text-[11px] font-semibold text-indigo-600 inline-flex items-center gap-1 mt-1">
                      <span>✓</span> Akun Terhubung
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl shadow-inner">
                    👨‍👩‍👧
                  </div>
                </div>
              </div>
            </div>

            {/* Keuangan Cards */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ringkasan Pemasukan Keuangan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#0A4ABF] to-blue-900 p-5 rounded-2xl text-white shadow-lg shadow-blue-900/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wider">Total Pemasukan</h3>
                    <span className="text-base">💰</span>
                  </div>
                  <p className="text-2xl font-black tracking-tight mt-2">
                    Rp{totalPemasukan.toLocaleString('id-ID')}
                  </p>
                  <div className="text-[11px] text-blue-200 mt-1">Akumulasi Seluruh Pembayaran</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Donasi Lembaga</h3>
                    <span className="text-base">🤲</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800 tracking-tight mt-2">
                    Rp{totalDonasi.toLocaleString('id-ID')}
                  </p>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">Wakaf & Infaq</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Ulang</h3>
                    <span className="text-base">📝</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800 tracking-tight mt-2">
                    Rp{totalDaftarUlang.toLocaleString('id-ID')}
                  </p>
                  <div className="text-[11px] text-teal-600 font-medium mt-1">Registrasi Ulang</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uang Pendaftaran</h3>
                    <span className="text-base">🧾</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800 tracking-tight mt-2">
                    Rp{totalUangPendaftaran.toLocaleString('id-ID')}
                  </p>
                  <div className="text-[11px] text-indigo-600 font-medium mt-1">Santri Baru</div>
                </div>
              </div>
            </div>

            {/* Financial Trend Analytics Chart */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Grafik Tren Penerimaan Keuangan</h3>
                  <p className="text-xs text-slate-400">
                    Kilas balik total penerimaan 6 bulan terakhir
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full border border-slate-200">
                  6 Bulan Terakhir
                </span>
              </div>
              <div className="pt-2">
                <GrafikGaris
                  kategori={kategoriBulanKeuangan}
                  nilai={trenPerBulan.map((b) => b.total)}
                  warna={WARNA_STATUS.baik}
                />
              </div>
            </div>

            {/* Presensi Pegawai Activity Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Presensi & Kehadiran Pegawai Hari Ini</h3>
                  <p className="text-xs text-slate-400">Monitoring kedatangan pengajar & staf lembaga</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
                    {jumlahHadirHariIni} / {pegawaiList.length} Hadir
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
                    <tr>
                      <th className="p-4 px-6">Nama Pegawai</th>
                      <th className="p-4 px-6">Jabatan</th>
                      <th className="p-4 px-6">Status Hari Ini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {pegawaiList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center p-8 text-slate-400">
                          Belum ada data pegawai terdaftar
                        </td>
                      </tr>
                    ) : (
                      pegawaiList.map((p) => {
                        const status = statusPegawaiHariIni.get(String(p.id));
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 px-6 font-semibold text-slate-800 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                                {p.nama[0]}
                              </div>
                              {p.nama}
                            </td>
                            <td className="p-4 px-6 text-slate-600 font-medium">{p.jabatan}</td>
                            <td className="p-4 px-6">
                              {status ? (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                    status === 'Hadir'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : status === 'Alfa'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    status === 'Hadir' ? 'bg-emerald-500' : status === 'Alfa' ? 'bg-rose-500' : 'bg-amber-500'
                                  }`} />
                                  {status}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  Belum Presensi
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && !isYayasan && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Welcome Card Staff */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10">
              <span className="bg-emerald-400/20 text-emerald-200 text-xs px-3 py-1 rounded-full font-bold border border-emerald-300/30 uppercase tracking-wider">
                {pegawaiAktif?.jabatan ?? 'Staf Lembaga'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Selamat datang kembali, {namaAktif}!
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Silakan pilih modul di bawah atau navigasi sidebar untuk mulai mencatat aktivitas & progres santri.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('presensi')}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 text-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  ✅
                </div>
                <h3 className="font-bold text-slate-800 text-base group-hover:text-emerald-700 transition-colors">Presensi Santri</h3>
                <p className="text-xs text-slate-400 mt-1">Catat kehadiran santri harian</p>
              </button>

              {isGuru && (
                <>
                  <button
                    onClick={() => setActiveTab('akhlak')}
                    className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 text-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      🌱
                    </div>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-teal-700 transition-colors">Nilai Akhlak</h3>
                    <p className="text-xs text-slate-400 mt-1">Evaluasi karakter & kedisiplinan</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('tahfidz')}
                    className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 text-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      📖
                    </div>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors">Hafalan Al-Qur'an</h3>
                    <p className="text-xs text-slate-400 mt-1">Setoran juz, surat, & ayat</p>
                  </button>
                </>
              )}

              {isKesantrian && (
                <button
                  onClick={() => setActiveTab('pengumuman')}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 text-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    📢
                  </div>
                  <h3 className="font-bold text-slate-800 text-base group-hover:text-cyan-700 transition-colors">Pengumuman & WA</h3>
                  <p className="text-xs text-slate-400 mt-1">Kirim berita ke wali santri</p>
                </button>
              )}
            </div>
          </div>
        )}

        {isYayasan && activeTab === 'santri' && <ModulSantri />}

        {isYayasan && activeTab === 'pegawai' && <ModulPegawai />}

        {isYayasan && activeTab === 'wali-master' && <ModulWaliSantri />}

        {isKeuangan && activeTab === 'spp' && <ModulSpp bisaInput={false} />}

        {isYayasan && activeTab === 'daftar-ulang' && <ModulDaftarUlang />}

        {isKeuangan && activeTab === 'daftar-ulang' && (
          <ModulDaftarUlang bisaInput={false} />
        )}

        {isYayasan && activeTab === 'uang-pendaftaran' && (
          <ModulUangPendaftaran />
        )}

        {isKeuangan && activeTab === 'uang-pendaftaran' && (
          <ModulUangPendaftaran bisaInput={false} />
        )}

        {isKeuangan && activeTab === 'uang-jajan' && <ModulUangJajan />}

        {isKeuangan && activeTab === 'tabungan' && <ModulTabungan />}

        {isKeuangan && activeTab === 'donasi' && <ModulDonasi />}

        {(isKeuangan || isYayasan) && activeTab === 'validasi-pembayaran' && (
          <ModulValidasiPembayaran />
        )}

        {isYayasan && activeTab === 'paket' && <ModulPaket />}

        {isYayasan && activeTab === 'laporan' && <ModulLaporan />}

        {!isYayasan && activeTab === 'presensi' && (
          <ModulPresensi
            isGuru={isGuru}
            isMusyrif={isMusyrif}
            namaAktif={namaAktif}
            pegawaiId={profil?.pegawai_id ?? null}
            kelasDiajar={kelasDiajarAktif}
            jenisKelaminDiampu={jenisKelaminDiampuAktif}
          />
        )}

        {(isGuru || isMusyrif || isKesantrian) && activeTab === 'akhlak' && (
          <ModulAkhlak
            dicatatOleh={namaAktif}
            kelasDiajar={kelasDiajarAktif}
            bisaMemutuskan={isKesantrian}
            perluAcc={isMusyrif}
            jenisKelaminDiampu={jenisKelaminDiampuAktif}
          />
        )}

        {isGuru && activeTab === 'tahfidz' && (
          <ModulTahfidz
            dicatatOleh={namaAktif}
            kelasDiajar={kelasDiajarAktif}
            jenisKelaminDiampu={jenisKelaminDiampuAktif}
          />
        )}

        {(isGuru || isKesantrian) && activeTab === 'izin-pulang' && (
          <ModulIzinPulang
            kelasDiajar={kelasDiajarAktif}
            bisaMemutuskan={isKesantrian}
            jenisKelaminDiampu={jenisKelaminDiampuAktif}
          />
        )}

        {isKesantrian && activeTab === 'pengumuman' && (
          <ModulPengumuman
            dicatatOleh={namaAktif}
            jenisKelaminDiampu={jenisKelaminDiampuAktif}
          />
        )}

        {isKesantrian && activeTab === 'hubungi-wali' && (
          <ModulHubungiWali jenisKelaminDiampu={jenisKelaminDiampuAktif} />
        )}

        {(isGuru || isMusyrif || isKesantrian) &&
          activeTab === 'reward-pelanggaran' && (
            <ModulRewardPelanggaran
              dicatatOleh={namaAktif}
              kelasDiajar={kelasDiajarAktif}
              bisaMemutuskan={isKesantrian}
              perluAcc={isMusyrif}
              jenisKelaminDiampu={jenisKelaminDiampuAktif}
            />
          )}

        {isKepsek && activeTab === 'kepsek-progres' && <ModulKepsek />}

        {activeTab === 'google-chat' && (
          <ModulGoogleChat
            isYayasan={isYayasan}
            isKepsek={isKepsek}
            labelPeran={isYayasan ? 'Operator Yayasan' : pegawaiAktif?.jabatan ?? ''}
            namaAktif={namaAktif}
            peranAktif={profil?.peran ?? 'pegawai'}
          />
        )}

        {activeTab === 'profil-yayasan' && (
          <ModulProfilYayasan onTutup={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'bantuan' && (
          <ModulBantuan
            peran={isYayasan ? 'yayasan' : pegawaiAktif?.jabatan || profil?.peran || 'pengguna'}
            namaAktif={yayasan?.namaYayasan || namaAktif}
            onTutup={() => setActiveTab('dashboard')}
          />
        )}

      </main>
    </div>
  );
}
