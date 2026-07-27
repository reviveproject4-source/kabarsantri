import React, { useEffect, useState } from 'react';
import { Santri } from './types';
import { supabase, supabaseAktif } from './supabaseClient';
import { kompresGambar } from './kompresGambar';
import { JenisPembayaran, PembayaranSubmission } from './pembayaranTypes';

interface Props {
  santri: Santri;
}

const KOLOM_PEMBAYARAN: { jenis: JenisPembayaran; label: string }[] = [
  { jenis: 'SPP', label: 'SPP' },
  { jenis: 'Tunggakan SPP', label: 'Tunggakan SPP' },
  { jenis: 'Tunggakan Daftar Ulang', label: 'Tunggakan Daftar Ulang' },
  { jenis: 'Tunggakan Uang Pendaftaran', label: 'Uang Pendaftaran' },
  { jenis: 'Donasi', label: 'Donasi' },
];

const NOMINAL_KOSONG: Record<JenisPembayaran, string> = {
  SPP: '',
  'Tunggakan SPP': '',
  'Tunggakan Daftar Ulang': '',
  'Tunggakan Uang Pendaftaran': '',
  Donasi: '',
};

export function ModulSubmitPembayaran({ santri }: Props) {
  const [nominalPerJenis, setNominalPerJenis] =
    useState<Record<JenisPembayaran, string>>(NOMINAL_KOSONG);
  const [keterangan, setKeterangan] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const [riwayat, setRiwayat] = useState<PembayaranSubmission[]>([]);
  const [memuat, setMemuat] = useState(true);

  const totalNominal = KOLOM_PEMBAYARAN.reduce(
    (total, k) => total + (Number(nominalPerJenis[k.jenis]) || 0),
    0
  );

  const muatRiwayat = async () => {
    if (!supabaseAktif) {
      setMemuat(false);
      return;
    }

    const { data } = await supabase
      .from('pembayaran_submission')
      .select('*')
      .eq('santri_id', santri.id)
      .order('created_at', { ascending: false });

    setRiwayat((data as PembayaranSubmission[]) ?? []);
    setMemuat(false);
  };

  useEffect(() => {
    muatRiwayat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [santri.id]);

  const ubahNominal = (jenis: JenisPembayaran, value: string) => {
    setNominalPerJenis((prev) => ({ ...prev, [jenis]: value }));
  };

  const kirim = async () => {
    if (totalNominal <= 0) {
      alert('Isi minimal satu jumlah pembayaran');
      return;
    }

    if (!file) {
      alert('Unggah bukti transfer');
      return;
    }

    setMengirim(true);

    try {
      const fileTerkompresi = await kompresGambar(file);
      const namaFile = `${santri.id}-${Date.now()}-${fileTerkompresi.name}`;

      const { error: errorUpload } = await supabase.storage
        .from('bukti-bayar')
        .upload(namaFile, fileTerkompresi);

      if (errorUpload) {
        alert(`Gagal mengunggah bukti bayar: ${errorUpload.message}`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('bukti-bayar')
        .getPublicUrl(namaFile);

      const baris = KOLOM_PEMBAYARAN.filter(
        (k) => Number(nominalPerJenis[k.jenis]) > 0
      ).map((k) => ({
        santri_id: santri.id,
        nama_santri: santri.nama,
        jenis: k.jenis,
        nominal: Number(nominalPerJenis[k.jenis]),
        keterangan: keterangan || null,
        bukti_url: urlData.publicUrl,
        status: 'Menunggu',
        dikirim_oleh: `Wali ${santri.nama}`,
      }));

      const { error: errorInsert } = await supabase
        .from('pembayaran_submission')
        .insert(baris);

      if (errorInsert) {
        alert(`Gagal mengirim data pembayaran: ${errorInsert.message}`);
        return;
      }

      setNominalPerJenis(NOMINAL_KOSONG);
      setKeterangan('');
      setFile(null);
      await muatRiwayat();
      alert('Pembayaran berhasil dikirim, menunggu verifikasi Keuangan.');
    } finally {
      setMengirim(false);
    }
  };

  if (!supabaseAktif) {
    return (
      <div className="bg-white rounded-2xl border p-10 text-center">
        <div className="text-3xl mb-3">⚙️</div>
        <h3 className="font-semibold text-lg mb-2">Belum Terhubung</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Fitur pengajuan pembayaran belum aktif. Hubungi pihak Yayasan.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-2xl border mb-6">
        <h3 className="font-semibold mb-1">Ajukan Pembayaran</h3>
        <p className="text-xs text-gray-500 mb-3">
          Isi nominal sesuai yang ditransfer untuk masing-masing pos.
          Kosongkan pos yang tidak ikut dibayar kali ini.
        </p>

        {KOLOM_PEMBAYARAN.map((k) => (
          <div key={k.jenis} className="mb-3">
            <label className="text-xs text-gray-500 block mb-1">
              {k.label}
            </label>
            <input
              type="number"
              placeholder="0"
              value={nominalPerJenis[k.jenis]}
              onChange={(e) => ubahNominal(k.jenis, e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        ))}

        <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
          <span className="text-sm text-gray-600">Total</span>
          <span className="font-semibold">
            Rp{totalNominal.toLocaleString('id-ID')}
          </span>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />
        <p className="text-xs text-gray-400 mb-3">
          Unggah bukti transfer senilai total di atas (Rp
          {totalNominal.toLocaleString('id-ID')}). Foto akan otomatis
          dikompres sebelum diunggah.
        </p>

        <textarea
          placeholder="Keterangan (opsional)"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <button
          onClick={kirim}
          disabled={mengirim}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {mengirim ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
        <h3 className="font-semibold p-4 border-b bg-slate-50">
          Riwayat Pengajuan Saya
        </h3>
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-left">Jenis</th>
              <th className="p-4 text-left">Nominal</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Bukti</th>
            </tr>
          </thead>
          <tbody>
            {memuat ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500">
                  Memuat...
                </td>
              </tr>
            ) : riwayat.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500">
                  Belum ada pengajuan pembayaran
                </td>
              </tr>
            ) : (
              riwayat.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-4">{r.created_at.slice(0, 10)}</td>
                  <td className="p-4">{r.jenis}</td>
                  <td className="p-4">
                    Rp{r.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4">{r.status}</td>
                  <td className="p-4">
                    <a
                      href={r.bukti_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      Lihat
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
