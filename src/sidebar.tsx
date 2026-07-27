import React, { useState } from 'react';
import { GantiPassword } from './GantiPassword';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isYayasan: boolean;
  isGuru: boolean;
  isMusyrif: boolean;
  isKeuangan: boolean;
  isKepsek: boolean;
  isKesantrian: boolean;
  namaAktif: string;
  labelPeran: string;
  onGantiPeran: () => void;
}

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isYayasan,
  isGuru,
  isMusyrif,
  isKeuangan,
  isKepsek,
  isKesantrian,
  namaAktif,
  labelPeran,
  onGantiPeran,
}: SidebarProps) => {
  const [showGantiPassword, setShowGantiPassword] = useState(false);

  const menuClass = (tab: string) =>
    `w-full text-left px-4 py-3 rounded-xl text-sm transition ${
      activeTab === tab
        ? 'bg-[#00A3C4]'
        : 'hover:bg-slate-800'
    }`;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col p-4">
      <div className="text-center mb-8">
        <h2 className="font-black text-amber-500 text-xl">
          KABARSANTRI
        </h2>

        <p className="text-xs text-slate-400 mt-2">
          Dashboard Yayasan
        </p>
      </div>

      <nav className="flex-1 space-y-2">

        <button
          onClick={() => setActiveTab('dashboard')}
          className={menuClass('dashboard')}
        >
          📊 Dashboard
        </button>

        {isYayasan && (
          <>
            <button
              onClick={() => setActiveTab('santri')}
              className={menuClass('santri')}
            >
              👨‍🎓 Data Master Santri
            </button>

            <button
              onClick={() => setActiveTab('pegawai')}
              className={menuClass('pegawai')}
            >
              👨‍💼 Data Pegawai
            </button>

            <button
              onClick={() => setActiveTab('wali-master')}
              className={menuClass('wali-master')}
            >
              👨‍👩‍👧 Master Wali Santri
            </button>

            <button
              onClick={() => setActiveTab('validasi-pembayaran')}
              className={menuClass('validasi-pembayaran')}
            >
              ✅ Validasi Keuangan
            </button>

            <button
              onClick={() => setActiveTab('daftar-ulang')}
              className={menuClass('daftar-ulang')}
            >
              📝 Daftar Ulang
            </button>

            <button
              onClick={() => setActiveTab('uang-pendaftaran')}
              className={menuClass('uang-pendaftaran')}
            >
              🧾 Uang Pendaftaran
            </button>

            <button
              onClick={() => setActiveTab('laporan')}
              className={menuClass('laporan')}
            >
              📑 Laporan
            </button>

            <button
              onClick={() => setActiveTab('paket')}
              className={menuClass('paket')}
            >
              🎁 Paket & Langganan
            </button>
          </>
        )}

        {(isGuru || isMusyrif) && (
          <button
            onClick={() => setActiveTab('presensi')}
            className={menuClass('presensi')}
          >
            ✅ Presensi
          </button>
        )}

        {(isGuru || isMusyrif || isKesantrian) && (
          <button
            onClick={() => setActiveTab('akhlak')}
            className={menuClass('akhlak')}
          >
            🌱 Nilai Akhlak
          </button>
        )}

        {isGuru && (
          <button
            onClick={() => setActiveTab('tahfidz')}
            className={menuClass('tahfidz')}
          >
            📖 Hafalan
          </button>
        )}

        {(isGuru || isKesantrian) && (
          <button
            onClick={() => setActiveTab('izin-pulang')}
            className={menuClass('izin-pulang')}
          >
            🏠 Izin Pulang
          </button>
        )}

        {isKesantrian && (
          <>
            <button
              onClick={() => setActiveTab('pengumuman')}
              className={menuClass('pengumuman')}
            >
              📢 Pengumuman
            </button>

            <button
              onClick={() => setActiveTab('hubungi-wali')}
              className={menuClass('hubungi-wali')}
            >
              💬 Hubungi Wali Santri
            </button>
          </>
        )}

        {(isGuru || isMusyrif || isKesantrian) && (
          <button
            onClick={() => setActiveTab('reward-pelanggaran')}
            className={menuClass('reward-pelanggaran')}
          >
            🏅 Reward & Pelanggaran
          </button>
        )}

        {isKeuangan && (
          <>
            <button
              onClick={() => setActiveTab('validasi-pembayaran')}
              className={menuClass('validasi-pembayaran')}
            >
              ✅ Validasi Keuangan
            </button>

            <button
              onClick={() => setActiveTab('spp')}
              className={menuClass('spp')}
            >
              💳 SPP
            </button>

            <button
              onClick={() => setActiveTab('daftar-ulang')}
              className={menuClass('daftar-ulang')}
            >
              📝 Daftar Ulang
            </button>

            <button
              onClick={() => setActiveTab('uang-pendaftaran')}
              className={menuClass('uang-pendaftaran')}
            >
              🧾 Uang Pendaftaran
            </button>

            <button
              onClick={() => setActiveTab('uang-jajan')}
              className={menuClass('uang-jajan')}
            >
              🪙 Uang Jajan
            </button>

            <button
              onClick={() => setActiveTab('tabungan')}
              className={menuClass('tabungan')}
            >
              🏦 Tabungan
            </button>

            <button
              onClick={() => setActiveTab('donasi')}
              className={menuClass('donasi')}
            >
              🤲 Donasi
            </button>
          </>
        )}

        {isKepsek && (
          <button
            onClick={() => setActiveTab('kepsek-progres')}
            className={menuClass('kepsek-progres')}
          >
            📈 Progres Santri
          </button>
        )}

        {!isYayasan &&
          !isGuru &&
          !isMusyrif &&
          !isKeuangan &&
          !isKepsek &&
          !isKesantrian && (
          <button
            onClick={() => setActiveTab('presensi')}
            className={menuClass('presensi')}
          >
            ✅ Presensi
          </button>
        )}

      </nav>

      <div className="border-t border-slate-800 pt-4 mt-4">
        <p className="text-sm font-semibold">{namaAktif}</p>
        <p className="text-xs text-slate-400 mb-3">{labelPeran}</p>

        <button
          onClick={() => setShowGantiPassword(true)}
          className="w-full text-left px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-slate-800"
        >
          🔑 Ganti Password
        </button>

        <button
          onClick={onGantiPeran}
          className="w-full text-left px-4 py-2 rounded-xl text-sm text-slate-400 hover:bg-slate-800"
        >
          🔄 Keluar
        </button>
      </div>

      {showGantiPassword && (
        <GantiPassword
          mode="password"
          onTutup={() => setShowGantiPassword(false)}
        />
      )}
    </aside>
  );
}
