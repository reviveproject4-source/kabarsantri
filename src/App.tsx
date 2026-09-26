import React, { useState, useEffect } from 'react';
import { Santri } from './types';
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
import { isJabatanMusyrif, isJabatanKesantrian, isJabatanKeuangan } from './jabatanUtils';
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
import { usePegawaiList, DEFAULT_PEGAWAI } from './hooks/usePegawai';
import { usePresensiPegawaiList, usePresensiSantriList } from './hooks/usePresensi';
import { useNilaiAkhlakList } from './hooks/useAkhlak';
import { useIzinPulangList } from './hooks/useIzinPulang';
import { useRingkasanKeuangan } from './hooks/useRingkasanKeuangan';
import { bulanEnamTerakhir, GrafikGaris, WARNA_STATUS } from './Grafik';
import { WebsiteKabarSantri } from './website/WebsiteKabarSantri';
import ModulPaudUtama from './ModulPaudUtama';
import { ModulPendaftaranLembaga } from './components/paud/ModulPendaftaranLembaga';
import { DashboardGuru } from './components/dashboards/DashboardGuru';
import { DashboardMusyrif } from './components/dashboards/DashboardMusyrif';
import { DashboardKepsek } from './components/dashboards/DashboardKepsek';
import { DashboardKeuangan } from './components/dashboards/DashboardKeuangan';
import { DashboardYayasan } from './components/dashboards/DashboardYayasan';
import { DashboardKesantrian } from './components/dashboards/DashboardKesantrian';
import { DashboardKetuaYayasan } from './components/dashboards/DashboardKetuaYayasan';

function Memuat() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Memuat...
    </div>
  );
}

export default function App() {
  const [isAllowed, setIsAllowed] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('website') === 'true' || window.location.hash === '#website') {
        return false;
      }
    }
    return true;
  });
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
    if (session) {
      setIsAllowed(true);
      setActiveTab('dashboard');
    }
  }, [session?.user?.id, profil?.id]);

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

  if (!isAllowed && !session) {
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
            setIsAllowed(true);
          }}
          onKeLogin={() => {
            setModeDaftar(false);
            setIsAllowed(true);
          }}
          onKeWebsite={() => {
            setModeDaftar(false);
            setIsAllowed(false);
          }}
        />
      );
    }
    return (
      <PilihPeran
        onDaftarBaru={() => setModeDaftar(true)}
        onKeWebsite={() => setIsAllowed(false)}
      />
    );
  }

  if (!profil) {
    return <Memuat />;
  }

  if (peran === 'wali' || profil.peran === 'wali') {
    return (
      <RuteWali santriId={profil.santri_id} onKeluar={keluar} />
    );
  }

  if (!yayasan) {
    return <Memuat />;
  }

  return (
    <RuteStaff
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onKeluar={keluar}
    />
  );
}

const DEFAULT_SANTRI_WALI: Santri = {
  id: 1,
  nama: 'Ahmad Santri',
  nis: '12345',
  nisn: '3174001234',
  jenisKelamin: 'Laki-Laki',
  tempatLahir: 'Jakarta',
  tanggalLahir: '2010-05-15',
  status: 'Aktif',
  kelas: '7A',
  asrama: 'Kamar Abu Bakar 01',
  namaAyah: 'H. Abdullah',
  pekerjaanAyah: 'Wiraswasta',
  noHpAyah: '081234567890',
  namaIbu: 'Hj. Aminah',
  pekerjaanIbu: 'Ibu Rumah Tangga',
  noHpIbu: '081234567891',
  alamatWali: 'Jl. Margonda Raya No. 45, Depok',
  juzTerakhir: 'Juz 30',
  suratTerakhir: 'An-Naba',
  ayatTerakhir: '1-40',
  nilaiTahfidz: 'A (Lancar)',
  riwayatTahfidz: [
    {
      id: 1,
      tanggal: '2026-09-20',
      juz: 'Juz 30',
      surat: 'An-Naba',
      ayat: '1-40',
      hadits: "Hadits Arba'in No. 1",
      kitab: 'Aqidatul Awam',
      nilai: 'Mumtaz (A)',
      dicatatOleh: 'Ust. Abdullah',
    },
  ],
};

function RuteWali({
  santriId,
  onKeluar,
}: {
  santriId: number | null;
  onKeluar: () => void;
}) {
  const { data: santriList = [], isLoading: loadingList } = useSantriList();
  const { data: santriById, isLoading: loadingById } = useSantriById(santriId);

  const santriAktif =
    santriById ||
    (santriId ? santriList.find((s) => s.id === santriId) : null) ||
    santriList[0] ||
    DEFAULT_SANTRI_WALI;

  if (loadingById && loadingList && !santriAktif) {
    return <Memuat />;
  }

  return <ModulWali santri={santriAktif} onKeluar={onKeluar} />;
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
  const { data: presensiSantriList = [] } = usePresensiSantriList();
  const { data: nilaiAkhlakList = [] } = useNilaiAkhlakList();
  const { data: izinPulangList = [] } = useIzinPulangList();

  const isYayasan = profil?.peran === 'yayasan';
  const pegawaiAktif = pegawaiList.find((p) => p.id === profil?.pegawai_id);
  const namaAktif = isYayasan
    ? yayasan?.namaPenanggungJawab || 'Yayasan'
    : pegawaiAktif?.nama || '';
  const jabatanAktif = (pegawaiAktif?.jabatan ?? '').trim().toLowerCase();
  const isGuru = jabatanAktif === 'guru';
  const isMusyrif = isJabatanMusyrif(jabatanAktif);
  const isKeuangan = isJabatanKeuangan(jabatanAktif);
  const isKepsek = jabatanAktif === 'kepala sekolah';
  const isKesantrian = isJabatanKesantrian(jabatanAktif);
  const isKetuaYayasan = jabatanAktif.includes('ketua') || (profil?.peran as string) === 'ketua_yayasan';

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
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/logo-kabarsantri.png" alt="Logo KabarSantri" className="w-8 h-8 rounded-xl object-cover shrink-0" />
            {yayasan?.logoUrl && (
              <img
                src={yayasan.logoUrl}
                alt="Logo Lembaga Tenant"
                className="w-7 h-7 rounded-xl object-cover border border-amber-400/40 shrink-0 bg-white/10"
                title={yayasan.namaYayasan}
              />
            )}
            <span className="font-black text-sm tracking-tight text-white truncate">
              {yayasan?.namaYayasan || 'KABARSANTRI'}
            </span>
          </div>

          <button
            onClick={() => setSidebarMobileOpen(true)}
            className="bg-[#0A4ABF] hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition active:scale-95"
          >
            <span>☰</span> Menu
          </button>
        </div>
        {activeTab === 'dashboard' && isKetuaYayasan && (
          <DashboardKetuaYayasan
            namaAktif={namaAktif}
            yayasan={yayasan ?? undefined}
            santriList={santriList}
            pegawaiList={pegawaiList}
            presensiPegawaiList={presensiPegawaiList}
            presensiSantriList={presensiSantriList}
            nilaiAkhlakList={nilaiAkhlakList}
            totalPemasukan={totalPemasukan}
            totalDonasi={totalDonasi}
            totalDaftarUlang={totalDaftarUlang}
            totalUangPendaftaran={totalUangPendaftaran}
            trenPerBulan={trenPerBulan}
            kategoriBulanKeuangan={kategoriBulanKeuangan}
          />
        )}

        {activeTab === 'dashboard' && isYayasan && !isKetuaYayasan && (
          <DashboardYayasan
            namaAktif={namaAktif}
            yayasan={yayasan ?? undefined}
            santriList={santriList}
            pegawaiList={pegawaiList}
            presensiPegawaiList={presensiPegawaiList}
            totalPemasukan={totalPemasukan}
            totalDonasi={totalDonasi}
            totalDaftarUlang={totalDaftarUlang}
            totalUangPendaftaran={totalUangPendaftaran}
            trenPerBulan={trenPerBulan}
            kategoriBulanKeuangan={kategoriBulanKeuangan}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'dashboard' && !isYayasan && !isKetuaYayasan && (
          <>
            {isGuru && (
              <DashboardGuru
                namaAktif={namaAktif}
                pegawaiAktif={pegawaiAktif}
                santriList={santriList}
                presensiSantri={presensiSantriList}
                presensiPegawai={presensiPegawaiList}
                nilaiAkhlakList={nilaiAkhlakList}
                izinPulangList={izinPulangList}
                kelasDiajarAktif={
                  Array.isArray(kelasDiajarAktif) && kelasDiajarAktif.length > 0
                    ? kelasDiajarAktif.join(', ')
                    : 'Semua'
                }
                setActiveTab={setActiveTab}
              />
            )}

            {!isGuru && isMusyrif && (
              <DashboardMusyrif
                namaAktif={namaAktif}
                pegawaiAktif={pegawaiAktif}
                santriList={santriList}
                presensiSantri={presensiSantriList}
                presensiPegawai={presensiPegawaiList}
                nilaiAkhlakList={nilaiAkhlakList}
                izinPulangList={izinPulangList}
                jenisKelaminDiampuAktif={jenisKelaminDiampuAktif}
                setActiveTab={setActiveTab}
              />
            )}

            {!isGuru && !isMusyrif && isKepsek && (
              <DashboardKepsek
                namaAktif={namaAktif}
                pegawaiAktif={pegawaiAktif}
                santriList={santriList}
                pegawaiList={pegawaiList}
                presensiPegawaiList={presensiPegawaiList}
                presensiSantri={presensiSantriList}
                nilaiAkhlakList={nilaiAkhlakList}
                setActiveTab={setActiveTab}
              />
            )}

            {!isGuru && !isMusyrif && !isKepsek && isKeuangan && (
              <DashboardKeuangan
                namaAktif={namaAktif}
                pegawaiAktif={pegawaiAktif}
                presensiPegawaiList={presensiPegawaiList}
                setActiveTab={setActiveTab}
                totalPemasukan={totalPemasukan}
                totalDonasi={totalDonasi}
                totalDaftarUlang={totalDaftarUlang}
                totalUangPendaftaran={totalUangPendaftaran}
                trenPerBulan={trenPerBulan}
                kategoriBulanKeuangan={kategoriBulanKeuangan}
              />
            )}

            {!isGuru && !isMusyrif && !isKepsek && !isKeuangan && isKesantrian && (
              <DashboardKesantrian
                namaAktif={namaAktif}
                pegawaiAktif={pegawaiAktif}
                santriList={santriList}
                presensiPegawaiList={presensiPegawaiList}
                nilaiAkhlakList={nilaiAkhlakList}
                izinPulangList={izinPulangList}
                jenisKelaminDiampuAktif={jenisKelaminDiampuAktif}
                setActiveTab={setActiveTab}
              />
            )}

            {!isGuru && !isMusyrif && !isKepsek && !isKeuangan && !isKesantrian && (
              <DashboardGuru
                namaAktif={namaAktif}
                pegawaiAktif={pegawaiAktif}
                santriList={santriList}
                presensiSantri={presensiSantriList}
                presensiPegawai={presensiPegawaiList}
                nilaiAkhlakList={nilaiAkhlakList}
                izinPulangList={izinPulangList}
                kelasDiajarAktif="Semua"
                setActiveTab={setActiveTab}
              />
            )}
          </>
        )}

        {(isYayasan || isKepsek || isGuru || isMusyrif || isKesantrian || isKetuaYayasan) && activeTab === 'santri' && (
          <ModulSantri isReadOnly={!isYayasan && !isKepsek} />
        )}

        {(isYayasan || isKepsek || isKesantrian || isKetuaYayasan) && activeTab === 'pegawai' && <ModulPegawai />}

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

        {(isYayasan || isKepsek || isKetuaYayasan) && activeTab === 'laporan' && <ModulLaporan />}

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

        {(isGuru || isMusyrif || isKesantrian || isKepsek || isKetuaYayasan) && activeTab === 'akhlak' && (
          <ModulAkhlak
            dicatatOleh={namaAktif}
            kelasDiajar={kelasDiajarAktif}
            bisaMemutuskan={isKesantrian || isKepsek}
            perluAcc={isMusyrif}
            jenisKelaminDiampu={jenisKelaminDiampuAktif}
          />
        )}

        {(isGuru || isMusyrif || isKepsek || isKesantrian || isKetuaYayasan) && activeTab === 'tahfidz' && (
          <ModulTahfidz
            dicatatOleh={namaAktif}
            kelasDiajar={kelasDiajarAktif}
            jenisKelaminDiampu={jenisKelaminDiampuAktif}
          />
        )}

        {(isGuru || isMusyrif || isKesantrian || isKepsek || isKetuaYayasan) && activeTab === 'izin-pulang' && (
          <ModulIzinPulang
            kelasDiajar={kelasDiajarAktif}
            bisaMemutuskan={isKesantrian || isKepsek}
            jenisKelaminDiampu={jenisKelaminDiampuAktif}
          />
        )}

        {(isYayasan || isKesantrian || isKepsek) && activeTab === 'pengumuman' && (
          <ModulPengumuman
            dicatatOleh={namaAktif}
            jenisKelaminDiampu={jenisKelaminDiampuAktif}
          />
        )}

        {(isKesantrian || isYayasan || isKepsek) && activeTab === 'hubungi-wali' && (
          <ModulHubungiWali jenisKelaminDiampu={jenisKelaminDiampuAktif} />
        )}

        {(isGuru || isMusyrif || isKesantrian || isKepsek || isKetuaYayasan) &&
          activeTab === 'reward-pelanggaran' && (
            <ModulRewardPelanggaran
              dicatatOleh={namaAktif}
              kelasDiajar={kelasDiajarAktif}
              bisaMemutuskan={isKesantrian}
              perluAcc={isMusyrif}
              jenisKelaminDiampu={jenisKelaminDiampuAktif}
            />
          )}

        {(isKepsek || isKetuaYayasan) && activeTab === 'kepsek-progres' && <ModulKepsek />}

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
