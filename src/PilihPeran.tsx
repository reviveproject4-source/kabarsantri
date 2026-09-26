import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { InputPassword } from './InputPassword';

interface Props {
  onDaftarBaru: () => void;
  onBukaWelcomeScreen?: () => void;
  onBukaSuperAdmin?: () => void;
  onKeWebsite?: () => void;
}

export function PilihPeran({
  onDaftarBaru,
  onBukaWelcomeScreen,
  onBukaSuperAdmin,
  onKeWebsite,
}: Props) {
  const { masuk, masukPegawaiNip, masukWali, kirimResetPassword } = useAuth();

  const [tab, setTab] = useState<'staf' | 'wali'>('staf');
  const [identitasStaf, setIdentitasStaf] = useState<'email' | 'nip'>('email');

  const [email, setEmail] = useState('');
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');

  const [modeLupaPassword, setModeLupaPassword] = useState(false);
  const [emailLupaPassword, setEmailLupaPassword] = useState('');
  const [memprosesLupaPassword, setMemprosesLupaPassword] = useState(false);
  const [pesanLupaPassword, setPesanLupaPassword] = useState('');

  const [namaSantri, setNamaSantri] = useState('');
  const [nis, setNis] = useState('');
  const [pin, setPin] = useState('');

  const [memproses, setMemproses] = useState(false);
  const [error, setError] = useState('');

  const kirimStaf = async () => {
    if (identitasStaf === 'email') {
      if (!email || !password) {
        setError('Isi email dan password');
        return;
      }

      setMemproses(true);
      setError('');

      const pesanError = await masuk(email, password);

      if (pesanError) {
        setError(pesanError);
      }

      setMemproses(false);
      return;
    }

    if (!nip || !password) {
      setError('Isi NIP dan password');
      return;
    }

    setMemproses(true);
    setError('');

    const pesanError = await masukPegawaiNip(nip, password);

    if (pesanError) {
      setError(pesanError);
    }

    setMemproses(false);
  };

  const kirimWali = async () => {
    if (!namaSantri || !nis || !pin) {
      setError('Isi Nama Santri, NIS, dan PIN');
      return;
    }

    setMemproses(true);
    setError('');

    const pesanError = await masukWali(namaSantri, nis, pin);

    if (pesanError) {
      setError(pesanError);
    }

    setMemproses(false);
  };

  const gantiTab = (tabBaru: 'staf' | 'wali') => {
    setTab(tabBaru);
    setError('');
  };

  const kirimLupaPassword = async () => {
    if (!emailLupaPassword) {
      setPesanLupaPassword('Isi email akun Anda dulu');
      return;
    }

    setMemprosesLupaPassword(true);
    setPesanLupaPassword('');

    const pesanError = await kirimResetPassword(emailLupaPassword);

    setPesanLupaPassword(
      pesanError
        ? pesanError
        : 'Tautan reset password sudah dikirim ke email Anda. Cek inbox/spam, lalu klik tautannya.'
    );

    setMemprosesLupaPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 w-full max-w-md shadow-lg">
        {onKeWebsite && (
          <button
            onClick={onKeWebsite}
            className="text-xs text-slate-400 hover:text-slate-700 font-semibold mb-4 flex items-center gap-1 transition"
          >
            ← Kembali ke Website Utama
          </button>
        )}

        <div className="flex items-center gap-3 mb-1">
          <img
            src="/logo-kabarsantri.png"
            alt="Logo KabarSantri"
            className="w-10 h-10 rounded-2xl object-cover shadow-sm border border-slate-200"
          />
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Portal Aplikasi</h1>
            <p className="text-[11px] text-slate-500 font-medium">KabarSantri System Operation</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 mb-6">
          <button
            onClick={() => gantiTab('staf')}
            className={`flex-1 px-4 py-2 rounded-xl text-sm border ${
              tab === 'staf'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white hover:bg-slate-50'
            }`}
          >
            Yayasan / Pegawai
          </button>
          <button
            onClick={() => gantiTab('wali')}
            className={`flex-1 px-4 py-2 rounded-xl text-sm border ${
              tab === 'wali'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white hover:bg-slate-50'
            }`}
          >
            Wali Santri
          </button>
        </div>

        {tab === 'staf' ? (
          modeLupaPassword ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Masukkan email akun Anda, kami kirimkan tautan untuk atur
                password baru.
              </p>

              <input
                type="email"
                placeholder="Email"
                value={emailLupaPassword}
                onChange={(e) => {
                  setEmailLupaPassword(e.target.value);
                  setPesanLupaPassword('');
                }}
                className="w-full border rounded-lg px-3 py-2 mb-3"
                onKeyDown={(e) => e.key === 'Enter' && kirimLupaPassword()}
              />

              {pesanLupaPassword && (
                <p className="text-sm text-gray-600 mb-3">
                  {pesanLupaPassword}
                </p>
              )}

              <button
                onClick={kirimLupaPassword}
                disabled={memprosesLupaPassword}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl disabled:opacity-50"
              >
                {memprosesLupaPassword ? 'Mengirim...' : 'Kirim Tautan Reset'}
              </button>

              <button
                onClick={() => {
                  setModeLupaPassword(false);
                  setPesanLupaPassword('');
                }}
                className="w-full text-sm text-gray-400 mt-3"
              >
                Kembali ke halaman Masuk
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Gunakan email atau NIP, dan password akun Anda.
              </p>

              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setIdentitasStaf('email');
                    setError('');
                  }}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs border ${
                    identitasStaf === 'email'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  Login pakai Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIdentitasStaf('nip');
                    setError('');
                  }}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs border ${
                    identitasStaf === 'nip'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  Login pakai NIP
                </button>
              </div>

              {identitasStaf === 'email' ? (
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                />
              ) : (
                <input
                  type="text"
                  placeholder="NIP / Nomor Induk Pegawai"
                  value={nip}
                  onChange={(e) => {
                    setNip(e.target.value);
                    setError('');
                  }}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                />
              )}

              <InputPassword
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="mb-3"
                onKeyDown={(e) => e.key === 'Enter' && kirimStaf()}
              />

              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

              <button
                onClick={kirimStaf}
                disabled={memproses}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl disabled:opacity-50"
              >
                {memproses ? 'Memproses...' : 'Masuk'}
              </button>

              <div className="text-center mt-3">
                <button
                  onClick={() => {
                    setModeLupaPassword(true);
                    setEmailLupaPassword(email);
                  }}
                  className="text-sm text-blue-600 underline"
                >
                  Lupa Password?
                </button>
              </div>

              <div className="border-t mt-6 pt-4 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Yayasan/Pondok Pesantren baru?
                </p>
                <button
                  onClick={onDaftarBaru}
                  className="text-sm text-blue-600 underline"
                >
                  Daftarkan Yayasan Anda
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Akun Pegawai dibuatkan oleh pihak Yayasan.
              </p>
            </>
          )
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Masukkan Nama Santri, NIS, dan PIN yang diberikan pihak
              Yayasan/pesantren.
            </p>

            <input
              type="text"
              placeholder="Nama Santri"
              value={namaSantri}
              onChange={(e) => {
                setNamaSantri(e.target.value);
                setError('');
              }}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <input
              type="text"
              placeholder="NIS"
              value={nis}
              onChange={(e) => {
                setNis(e.target.value);
                setError('');
              }}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              className="w-full border rounded-lg px-3 py-2 mb-3"
              onKeyDown={(e) => e.key === 'Enter' && kirimWali()}
            />

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <button
              onClick={kirimWali}
              disabled={memproses}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl disabled:opacity-50"
            >
              {memproses ? 'Memproses...' : 'Masuk'}
            </button>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Akun Wali Santri (Nama, NIS, PIN) dibuatkan oleh pihak Yayasan.
            </p>
          </>
        )}

        {onKeWebsite && (
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={onKeWebsite}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              🌐 Kunjungi Website Profil & Informasi KabarSantri
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
