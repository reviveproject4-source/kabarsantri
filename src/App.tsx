import React, { useState } from 'react';
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
import { FormPendaftaranYayasan } from './FormPendaftaranYayasan';
import { PilihPeran } from './PilihPeran';
import { useAuth } from './AuthContext';
import { useSantriList, useSantriById } from './hooks/useSantri';
import { usePegawaiList } from './hooks/usePegawai';
import { usePresensiPegawaiList } from './hooks/usePresensi';
import { useRingkasanKeuangan } from './hooks/useRingkasanKeuangan';
import { bulanEnamTerakhir, GrafikGaris, WARNA_STATUS } from './Grafik';
import ModulPaudUtama from './ModulPaudUtama';

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
  const [modePaudDirect, setModePaudDirect] = useState(true);

  const { memuat, session, profil, yayasan, peran, keluar, modePemulihanPassword } =
    useAuth();

  if (modePaudDirect) {
    return <ModulPaudUtama onKembaliKeUtama={() => setModePaudDirect(false)} />;
  }

  if (!isAllowed) {
    return (
      <SplashWelcomeScreen
        onConfirm={() => setIsAllowed(true)}
        onBukaPaud={() => setModePaudDirect(true)}
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
      return <FormPendaftaranYayasan onKembali={() => setModeDaftar(false)} />;
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

  return (
    <div className="flex min-h-screen bg-gray-50">
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
      />

      <main className="flex-1 p-8">

        {activeTab === 'dashboard' && isYayasan && (
          <div>
            <h1 className="text-3xl font-bold mb-6">
              Dashboard Yayasan
            </h1>

            <PresensiSaya pegawaiId={null} presensiPegawai={presensiPegawaiList} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border">
                <h3 className="text-sm text-gray-500">
                  Jumlah Santri
                </h3>
                <p className="text-2xl font-bold">
                {santriList.length}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border">
                <h3 className="text-sm text-gray-500">
                  Guru
                </h3>
                <p className="text-2xl font-bold">{jumlahGuru}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border">
                <h3 className="text-sm text-gray-500">
                  Musyrif
                </h3>
                <p className="text-2xl font-bold">{jumlahMusyrif}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border">
                <h3 className="text-sm text-gray-500">
                  Wali Santri
                </h3>
                <p className="text-2xl font-bold">{jumlahWali}</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold mt-8 mb-3">Ringkasan Keuangan</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border">
                <h3 className="text-sm text-gray-500">Total Pemasukan</h3>
                <p className="text-2xl font-bold">
                  Rp{totalPemasukan.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border">
                <h3 className="text-sm text-gray-500">Donasi</h3>
                <p className="text-2xl font-bold">
                  Rp{totalDonasi.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border">
                <h3 className="text-sm text-gray-500">Daftar Ulang</h3>
                <p className="text-2xl font-bold">
                  Rp{totalDaftarUlang.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border">
                <h3 className="text-sm text-gray-500">Uang Pendaftaran</h3>
                <p className="text-2xl font-bold">
                  Rp{totalUangPendaftaran.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4 mt-6">
              <h3 className="font-semibold mb-1">Tren Penerimaan</h3>
              <p className="text-xs text-gray-500 mb-2">
                Total seluruh kategori, 6 bulan terakhir
              </p>
              <GrafikGaris
                kategori={kategoriBulanKeuangan}
                nilai={trenPerBulan.map((b) => b.total)}
                warna={WARNA_STATUS.baik}
              />
            </div>

            <div className="bg-white rounded-2xl border overflow-hidden mt-6">
              <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold">Presensi Pegawai Hari Ini</h3>
                <span className="text-sm text-gray-500">
                  {jumlahHadirHariIni} / {pegawaiList.length} Hadir
                </span>
              </div>

              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left p-3 px-4">Nama</th>
                    <th className="text-left p-3 px-4">Jabatan</th>
                    <th className="text-left p-3 px-4">Status Hari Ini</th>
                  </tr>
                </thead>
                <tbody>
                  {pegawaiList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-6 text-gray-500">
                        Belum ada data pegawai
                      </td>
                    </tr>
                  ) : (
                    pegawaiList.map((p) => {
                      const status = statusPegawaiHariIni.get(String(p.id));
                      return (
                        <tr key={p.id} className="border-t">
                          <td className="p-3 px-4">{p.nama}</td>
                          <td className="p-3 px-4">{p.jabatan}</td>
                          <td className="p-3 px-4">
                            {status ? (
                              <span
                                className={`px-2 py-1 rounded-lg text-xs ${
                                  status === 'Hadir'
                                    ? 'bg-green-100 text-green-700'
                                    : status === 'Alfa'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {status}
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-500">
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
        )}

        {activeTab === 'dashboard' && !isYayasan && (
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Selamat datang, {namaAktif}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {pegawaiAktif?.jabatan ?? ''}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('presensi')}
                className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
              >
                <div className="text-2xl mb-2">✅</div>
                <div className="font-semibold">Presensi</div>
              </button>

              {isGuru && (
                <>
                  <button
                    onClick={() => setActiveTab('akhlak')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">🌱</div>
                    <div className="font-semibold">Nilai Akhlak</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('tahfidz')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">📖</div>
                    <div className="font-semibold">Hafalan</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('izin-pulang')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="font-semibold">Izin Pulang</div>
                  </button>
                </>
              )}

              {(isGuru || isMusyrif || isKesantrian) && (
                <button
                  onClick={() => setActiveTab('reward-pelanggaran')}
                  className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                >
                  <div className="text-2xl mb-2">🏅</div>
                  <div className="font-semibold">Reward & Pelanggaran</div>
                </button>
              )}

              {isKesantrian && (
                <>
                  <button
                    onClick={() => setActiveTab('izin-pulang')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="font-semibold">Izin Pulang</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('akhlak')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">🌱</div>
                    <div className="font-semibold">Nilai Akhlak</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('pengumuman')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">📢</div>
                    <div className="font-semibold">Pengumuman</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('hubungi-wali')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">💬</div>
                    <div className="font-semibold">Hubungi Wali Santri</div>
                  </button>
                </>
              )}

              {isKeuangan && (
                <>
                  <button
                    onClick={() => setActiveTab('validasi-pembayaran')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">✅</div>
                    <div className="font-semibold">Validasi Keuangan</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('spp')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">💳</div>
                    <div className="font-semibold">SPP</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('uang-jajan')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">🪙</div>
                    <div className="font-semibold">Uang Jajan</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('tabungan')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">🏦</div>
                    <div className="font-semibold">Tabungan</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('donasi')}
                    className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                  >
                    <div className="text-2xl mb-2">🤲</div>
                    <div className="font-semibold">Donasi</div>
                  </button>
                </>
              )}

              {isKepsek && (
                <button
                  onClick={() => setActiveTab('kepsek-progres')}
                  className="bg-white p-6 rounded-xl border text-left hover:border-blue-400"
                >
                  <div className="text-2xl mb-2">📈</div>
                  <div className="font-semibold">Progres Santri</div>
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

        {activeTab === 'paud' && <ModulPaudUtama />}

      </main>
    </div>
  );
}
