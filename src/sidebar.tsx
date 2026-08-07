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
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  logoYayasanUrl?: string;
  namaYayasan?: string;
  alamatYayasan?: string;
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
  isOpenMobile = false,
  onCloseMobile,
  logoYayasanUrl,
  namaYayasan,
  alamatYayasan,
}: SidebarProps) => {
  const [showGantiPassword, setShowGantiPassword] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const menuClass = (tab: string) =>
    `w-full text-left px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-between ${
      activeTab === tab
        ? 'bg-[#0A4ABF] text-white shadow-lg shadow-blue-600/30 font-semibold translate-x-1'
        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col p-4 h-full border-r border-slate-800/80 shadow-2xl transition-transform duration-300 md:static md:translate-x-0 select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Logo & Brand */}
        <div className="mb-6 pt-2 px-2 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={logoYayasanUrl || '/logo-kabarsantri.png'}
              alt="Logo Lembaga"
              className="w-10 h-10 rounded-2xl shadow-lg shadow-blue-600/40 object-cover border border-white/20 shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-black tracking-tight text-white text-sm sm:text-base leading-tight truncate">
                {namaYayasan || 'KABARSANTRI'}
              </h2>
              {alamatYayasan ? (
                <p className="text-[10px] text-slate-400 truncate max-w-[140px] mt-0.5" title={alamatYayasan}>
                  📍 {alamatYayasan}
                </p>
              ) : (
                <p className="text-[10px] uppercase tracking-wider font-bold text-blue-400 mt-0.5">
                  {isYayasan ? 'Yayasan & Unit' : labelPeran || 'Portal Staff'}
                </p>
              )}
            </div>
          </div>

          {/* Close Mobile Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg text-lg font-bold"
          >
            ✕
          </button>
        </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar text-xs">
        <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Utama
        </div>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={menuClass('dashboard')}
        >
          <span className="flex items-center gap-2.5">
            <span>📊</span> Dashboard
          </span>
        </button>

        <button
          onClick={() => setActiveTab('google-chat')}
          className={menuClass('google-chat')}
        >
          <span className="flex items-center gap-2.5">
            <span>💬</span> Google Chat Ruang
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bantuan')}
          className={menuClass('bantuan')}
        >
          <span className="flex items-center gap-2.5">
            <span>📖</span> Panduan & Bantuan
          </span>
        </button>

        {(isYayasan || isKepsek) && (
          <button
            onClick={() => setActiveTab('profil-yayasan')}
            className={menuClass('profil-yayasan')}
          >
            <span className="flex items-center gap-2.5">
              <span>⚙️</span> Identitas & Logo
            </span>
          </button>
        )}

        {isYayasan && (
          <>
            <div className="px-3 pt-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Data Master
            </div>
            <button
              onClick={() => setActiveTab('santri')}
              className={menuClass('santri')}
            >
              <span className="flex items-center gap-2.5">
                <span>👨‍🎓</span> Master Santri
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pegawai')}
              className={menuClass('pegawai')}
            >
              <span className="flex items-center gap-2.5">
                <span>👨‍💼</span> Data Pegawai
              </span>
            </button>

            <button
              onClick={() => setActiveTab('wali-master')}
              className={menuClass('wali-master')}
            >
              <span className="flex items-center gap-2.5">
                <span>👨‍👩‍👧</span> Master Wali Santri
              </span>
            </button>

            <div className="px-3 pt-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Keuangan & Laporan
            </div>
            <button
              onClick={() => setActiveTab('validasi-pembayaran')}
              className={menuClass('validasi-pembayaran')}
            >
              <span className="flex items-center gap-2.5">
                <span>✅</span> Validasi Keuangan
              </span>
            </button>

            <button
              onClick={() => setActiveTab('daftar-ulang')}
              className={menuClass('daftar-ulang')}
            >
              <span className="flex items-center gap-2.5">
                <span>📝</span> Daftar Ulang
              </span>
            </button>

            <button
              onClick={() => setActiveTab('uang-pendaftaran')}
              className={menuClass('uang-pendaftaran')}
            >
              <span className="flex items-center gap-2.5">
                <span>🧾</span> Uang Pendaftaran
              </span>
            </button>

            <button
              onClick={() => setActiveTab('laporan')}
              className={menuClass('laporan')}
            >
              <span className="flex items-center gap-2.5">
                <span>📑</span> Laporan Executive
              </span>
            </button>

            <button
              onClick={() => setActiveTab('paket')}
              className={menuClass('paket')}
            >
              <span className="flex items-center gap-2.5">
                <span>🎁</span> Paket Langganan
              </span>
            </button>
          </>
        )}

        {(isGuru || isMusyrif) && (
          <>
            <div className="px-3 pt-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Karakter & Presensi
            </div>
            <button
              onClick={() => setActiveTab('presensi')}
              className={menuClass('presensi')}
            >
              <span className="flex items-center gap-2.5">
                <span>✅</span> Presensi Santri
              </span>
            </button>
          </>
        )}

        {(isGuru || isMusyrif || isKesantrian) && (
          <button
            onClick={() => setActiveTab('akhlak')}
            className={menuClass('akhlak')}
          >
            <span className="flex items-center gap-2.5">
              <span>🌱</span> Nilai Akhlak
            </span>
          </button>
        )}

        {isGuru && (
          <button
            onClick={() => setActiveTab('tahfidz')}
            className={menuClass('tahfidz')}
          >
            <span className="flex items-center gap-2.5">
              <span>📖</span> Catatan Hafalan
            </span>
          </button>
        )}

        {(isGuru || isKesantrian) && (
          <button
            onClick={() => setActiveTab('izin-pulang')}
            className={menuClass('izin-pulang')}
          >
            <span className="flex items-center gap-2.5">
              <span>🏠</span> Izin Pulang
            </span>
          </button>
        )}

        {isKesantrian && (
          <>
            <div className="px-3 pt-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Komunikasi
            </div>
            <button
              onClick={() => setActiveTab('pengumuman')}
              className={menuClass('pengumuman')}
            >
              <span className="flex items-center gap-2.5">
                <span>📢</span> Pengumuman
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hubungi-wali')}
              className={menuClass('hubungi-wali')}
            >
              <span className="flex items-center gap-2.5">
                <span>💬</span> Hubungi Wali
              </span>
            </button>
          </>
        )}

        {(isGuru || isMusyrif || isKesantrian) && (
          <button
            onClick={() => setActiveTab('reward-pelanggaran')}
            className={menuClass('reward-pelanggaran')}
          >
            <span className="flex items-center gap-2.5">
              <span>🏅</span> Reward & Pelanggaran
            </span>
          </button>
        )}

        {isKeuangan && (
          <>
            <div className="px-3 pt-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Keuangan & Tabungan
            </div>
            <button
              onClick={() => setActiveTab('validasi-pembayaran')}
              className={menuClass('validasi-pembayaran')}
            >
              <span className="flex items-center gap-2.5">
                <span>✅</span> Validasi Pembayaran
              </span>
            </button>

            <button
              onClick={() => setActiveTab('spp')}
              className={menuClass('spp')}
            >
              <span className="flex items-center gap-2.5">
                <span>💳</span> SPP Santri
              </span>
            </button>

            <button
              onClick={() => setActiveTab('daftar-ulang')}
              className={menuClass('daftar-ulang')}
            >
              <span className="flex items-center gap-2.5">
                <span>📝</span> Daftar Ulang
              </span>
            </button>

            <button
              onClick={() => setActiveTab('uang-pendaftaran')}
              className={menuClass('uang-pendaftaran')}
            >
              <span className="flex items-center gap-2.5">
                <span>🧾</span> Uang Pendaftaran
              </span>
            </button>

            <button
              onClick={() => setActiveTab('uang-jajan')}
              className={menuClass('uang-jajan')}
            >
              <span className="flex items-center gap-2.5">
                <span>🪙</span> Uang Jajan
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tabungan')}
              className={menuClass('tabungan')}
            >
              <span className="flex items-center gap-2.5">
                <span>🏦</span> Tabungan Santri
              </span>
            </button>

            <button
              onClick={() => setActiveTab('donasi')}
              className={menuClass('donasi')}
            >
              <span className="flex items-center gap-2.5">
                <span>🤲</span> Donasi Lembaga
              </span>
            </button>
          </>
        )}

        {isKepsek && (
          <button
            onClick={() => setActiveTab('kepsek-progres')}
            className={menuClass('kepsek-progres')}
          >
            <span className="flex items-center gap-2.5">
              <span>📈</span> Progres Santri
            </span>
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
            <span className="flex items-center gap-2.5">
              <span>✅</span> Presensi
            </span>
          </button>
        )}
      </nav>

      {/* User Profile Card */}
      <div className="border-t border-slate-800/80 pt-3 mt-3">
        <div className="bg-slate-800/50 rounded-xl p-3 backdrop-blur-sm border border-slate-700/50 flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#00A3C4]/20 text-[#00A3C4] font-bold flex items-center justify-center border border-[#00A3C4]/30 text-xs shrink-0">
              {namaAktif ? namaAktif[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{namaAktif}</p>
              <p className="text-[10px] text-[#00A3C4] truncate">{labelPeran}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            onClick={() => setShowGantiPassword(true)}
            className="w-full text-center px-2 py-1.5 rounded-lg text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-white transition"
          >
            🔑 Password
          </button>
          <button
            onClick={onGantiPeran}
            className="w-full text-center px-2 py-1.5 rounded-lg text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 hover:text-rose-200 transition"
          >
            🔄 Keluar
          </button>
        </div>
      </div>

      {showGantiPassword && (
        <GantiPassword
          mode="password"
          onTutup={() => setShowGantiPassword(false)}
        />
      )}
    </aside>
    </>
  );
};
