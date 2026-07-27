import React from 'react';

interface Props {
  onConfirm: () => void;
}

export const SplashWelcomeScreen: React.FC<Props> = ({ onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">👋 Selamat Datang di KabarSantri</h2>
        <p className="text-gray-700 mb-6">
          Aplikasi ini digunakan oleh pihak <strong>Yayasan</strong>,{' '}
          <strong>Pegawai</strong> (Guru, Musyrif, Keuangan, dll), dan{' '}
          <strong>Wali Santri</strong> — masing-masing masuk memakai akunnya sendiri
          sesuai peran yang diberikan pihak Yayasan.
        </p>
        <button
          onClick={onConfirm}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Lanjutkan ke Halaman Masuk
        </button>
      </div>
    </div>
  );
};