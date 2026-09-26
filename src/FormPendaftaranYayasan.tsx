import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { YayasanInput } from './types';
import { InputPassword } from './InputPassword';

const SUMBER_INFORMASI = [
  'Sosial Media',
  'Rekomendasi Teman/Kolega',
  'Website/Google',
  'Event/Pelatihan',
  'Lainnya',
];

interface Props {
  onKembali: () => void;
  onKeLogin?: () => void;
  onKeWebsite?: () => void;
}

export function FormPendaftaranYayasan({ onKembali, onKeLogin, onKeWebsite }: Props) {
  const { daftarYayasan } = useAuth();

  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [memproses, setMemproses] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<YayasanInput>({
    namaYayasan: '',
    namaPenanggungJawab: '',
    jabatanPenanggungJawab: '',
    noHp: '',
    email: '',
    alamat: '',
    perkiraanJumlahSantri: '',
    sumberInformasi: '',
  });

  const ubah = (field: keyof YayasanInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const daftar = async () => {
    if (
      !form.namaYayasan ||
      !form.namaPenanggungJawab ||
      !form.noHp ||
      !form.alamat ||
      !form.email
    ) {
      setError(
        'Lengkapi minimal Nama Yayasan, Nama Penanggung Jawab, No HP, Email, dan Alamat'
      );
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== konfirmasiPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setMemproses(true);
    setError('');

    const pesanError = await daftarYayasan(form.email, password, form);

    if (pesanError) {
      setError(pesanError);
      setMemproses(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl border p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-1">Pendaftaran Yayasan</h1>
        <p className="text-sm text-gray-500 mb-6">
          Lengkapi data berikut untuk membuat akun Yayasan di KabarSantri.
          Email &amp; password ini yang akan Anda pakai untuk masuk
          selanjutnya.
        </p>

        <input
          type="text"
          placeholder="Nama Yayasan / Pondok Pesantren"
          value={form.namaYayasan}
          onChange={(e) => ubah('namaYayasan', e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Nama Penanggung Jawab"
            value={form.namaPenanggungJawab}
            onChange={(e) => ubah('namaPenanggungJawab', e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="Jabatan (contoh: Ketua Yayasan)"
            value={form.jabatanPenanggungJawab}
            onChange={(e) =>
              ubah('jabatanPenanggungJawab', e.target.value)
            }
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="No HP / WhatsApp"
            value={form.noHp}
            onChange={(e) => ubah('noHp', e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          <input
            type="email"
            placeholder="Email (dipakai untuk login)"
            value={form.email}
            onChange={(e) => ubah('email', e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <InputPassword
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <InputPassword
            placeholder="Konfirmasi Password"
            value={konfirmasiPassword}
            onChange={(e) => setKonfirmasiPassword(e.target.value)}
          />
        </div>

        <textarea
          placeholder="Alamat / Kota"
          value={form.alamat}
          onChange={(e) => ubah('alamat', e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            placeholder="Perkiraan Jumlah Santri"
            value={form.perkiraanJumlahSantri}
            onChange={(e) =>
              ubah('perkiraanJumlahSantri', e.target.value)
            }
            className="border rounded-lg px-3 py-2"
          />

          <select
            value={form.sumberInformasi}
            onChange={(e) => ubah('sumberInformasi', e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Tahu KabarSantri dari mana?</option>
            {SUMBER_INFORMASI.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          onClick={daftar}
          disabled={memproses}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl disabled:opacity-50"
        >
          {memproses ? 'Memproses...' : 'Daftar & Lanjutkan'}
        </button>

        <div className="text-center mt-5 space-y-2">
          <button
            type="button"
            onClick={onKeLogin || onKembali}
            className="text-xs sm:text-sm font-bold text-[#0A4ABF] hover:underline block w-full text-center"
          >
            Sudah punya akun? Kembali ke halaman masuk (Login)
          </button>

          {onKeWebsite && (
            <button
              type="button"
              onClick={onKeWebsite}
              className="text-xs text-slate-400 hover:text-slate-600 block w-full text-center mt-1"
            >
              ← Kembali ke Website Utama
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
