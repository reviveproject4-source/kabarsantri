import React from 'react';

interface Props {
  onConfirm: () => void;
  onBukaPaud?: () => void;
}

export const SplashWelcomeScreen: React.FC<Props> = ({ onConfirm, onBukaPaud }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md text-center border-4 border-amber-300">
        <span className="text-5xl">👋</span>
        <h2 className="text-2xl font-black text-amber-900 mt-2 mb-3">Selamat Datang di KabarSantri</h2>
        
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Sistem Terpadu Yayasan, Pegawai, Wali Santri, dan Modul Interaktif PAUD.
        </p>

        <div className="space-y-3">
          {onBukaPaud && (
            <button
              onClick={onBukaPaud}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black py-3.5 px-6 rounded-2xl shadow-lg transition-transform active:scale-95 text-base flex items-center justify-center gap-2"
            >
              <span>🧸</span> Buka Modul PAUD (Usia 2–5 Tahun)
            </button>
          )}

          <button
            onClick={onConfirm}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl text-sm"
          >
            Lanjutkan ke Halaman Masuk Utama
          </button>
        </div>
      </div>
    </div>
  );
};