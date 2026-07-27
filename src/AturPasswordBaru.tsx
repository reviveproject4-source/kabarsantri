import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { InputPassword } from './InputPassword';

export function AturPasswordBaru() {
  const { aturPasswordBaru, batalkanPemulihanPassword, keluar } = useAuth();

  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [memproses, setMemproses] = useState(false);
  const [error, setError] = useState('');
  const [berhasil, setBerhasil] = useState(false);

  const simpan = async () => {
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== konfirmasi) {
      setError('Konfirmasi password tidak sama');
      return;
    }

    setMemproses(true);
    setError('');

    const pesanError = await aturPasswordBaru(password);

    if (pesanError) {
      setError(pesanError);
    } else {
      setBerhasil(true);
    }

    setMemproses(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">Atur Password Baru</h1>

        {berhasil ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Password berhasil diganti. Silakan lanjut masuk ke KabarSantri.
            </p>
            <button
              onClick={keluar}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl"
            >
              Lanjut ke Halaman Masuk
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Masukkan password baru untuk akun Anda.
            </p>

            <InputPassword
              placeholder="Password Baru"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="mb-3"
            />

            <InputPassword
              placeholder="Konfirmasi Password Baru"
              value={konfirmasi}
              onChange={(e) => {
                setKonfirmasi(e.target.value);
                setError('');
              }}
              className="mb-3"
              onKeyDown={(e) => e.key === 'Enter' && simpan()}
            />

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <button
              onClick={simpan}
              disabled={memproses}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl disabled:opacity-50"
            >
              {memproses ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>

            <button
              onClick={batalkanPemulihanPassword}
              className="w-full text-sm text-gray-400 mt-3"
            >
              Batal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
