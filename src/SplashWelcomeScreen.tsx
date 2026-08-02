import React from 'react';

interface Props {
  onConfirm: () => void;
  onBukaPaud?: () => void;
  onBukaPendaftaranLembaga?: () => void;
}

export const SplashWelcomeScreen: React.FC<Props> = ({ onConfirm, onBukaPaud, onBukaPendaftaranLembaga }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md text-center border-4 border-amber-300 space-y-4">
        <span className="text-5xl">👋</span>
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border">
            Official System Access
          </span>
          <h2 className="text-2xl font-black text-amber-900 mt-2 mb-1">Selamat Datang di CeritaAnanda</h2>
          <p className="text-gray-600 text-xs leading-relaxed">
            Sistem Informasi Management Lembaga PAUD/TK, Pengawasan Yayasan, Akses Guru, & Modul Pembelajaran Anak (2-5 Tahun).
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {onBukaPaud && (
            <button
              onClick={onBukaPaud}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black py-3.5 px-6 rounded-2xl shadow-lg transition-transform active:scale-95 text-sm flex items-center justify-center gap-2 border-2 border-amber-300"
            >
              <span>🧸</span> Masuk ke Aplikasi CeritaAnanda PAUD
            </button>
          )}

          {onBukaPendaftaranLembaga && (
            <button
              onClick={onBukaPendaftaranLembaga}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-6 rounded-2xl shadow-md transition-transform active:scale-95 text-xs flex items-center justify-center gap-2"
            >
              <span>📝</span> Form Pendaftaran Lembaga Baru (Yayasan/Penanggung Jawab)
            </button>
          )}

          <button
            onClick={onConfirm}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl text-xs"
          >
            Lanjutkan ke Portal Manajemen Utama
          </button>
        </div>
      </div>
    </div>
  );
};