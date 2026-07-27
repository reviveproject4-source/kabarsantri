import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { InputPassword } from './InputPassword';

const PANJANG_PIN = 8;

interface Props {
  onTutup: () => void;
  mode?: 'password' | 'pin';
}

export function GantiPassword({ onTutup, mode = 'password' }: Props) {
  const { aturPasswordBaru } = useAuth();
  const [nilai, setNilai] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [memproses, setMemproses] = useState(false);
  const [error, setError] = useState('');
  const [berhasil, setBerhasil] = useState(false);

  const label = mode === 'pin' ? 'PIN' : 'Password';

  const valid = (v: string) =>
    mode === 'pin' ? /^[0-9]{8}$/.test(v) : v.length >= 6;

  const simpan = async () => {
    if (!valid(nilai)) {
      setError(
        mode === 'pin'
          ? `PIN harus angka, ${PANJANG_PIN} digit.`
          : 'Password minimal 6 karakter.'
      );
      return;
    }

    if (nilai !== konfirmasi) {
      setError(`Konfirmasi ${label.toLowerCase()} tidak sama`);
      return;
    }

    setMemproses(true);
    setError('');

    const pesanError = await aturPasswordBaru(nilai);

    if (pesanError) {
      setError(pesanError);
    } else {
      setBerhasil(true);
    }

    setMemproses(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-1">Ganti {label}</h2>

        {berhasil ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {label} berhasil diganti.
            </p>
            <button
              onClick={onTutup}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl"
            >
              Tutup
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Masukkan {label.toLowerCase()} baru untuk akun Anda.
            </p>

            {mode === 'pin' ? (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={PANJANG_PIN}
                  placeholder={`PIN Baru (${PANJANG_PIN} digit)`}
                  value={nilai}
                  onChange={(e) => {
                    setNilai(e.target.value.replace(/[^0-9]/g, ''));
                    setError('');
                  }}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={PANJANG_PIN}
                  placeholder="Konfirmasi PIN Baru"
                  value={konfirmasi}
                  onChange={(e) => {
                    setKonfirmasi(e.target.value.replace(/[^0-9]/g, ''));
                    setError('');
                  }}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                  onKeyDown={(e) => e.key === 'Enter' && simpan()}
                />
              </>
            ) : (
              <>
                <InputPassword
                  placeholder="Password Baru"
                  value={nilai}
                  onChange={(e) => {
                    setNilai(e.target.value);
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
              </>
            )}

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={onTutup}
                className="flex-1 border px-4 py-3 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={simpan}
                disabled={memproses}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl disabled:opacity-50"
              >
                {memproses ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
