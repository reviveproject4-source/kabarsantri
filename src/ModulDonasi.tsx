import React, { useState } from 'react';
import { useDonasiList, useTambahDonasi } from './hooks/useKeuangan';

const JENIS_DONASI = ['Zakat', 'Infaq', 'Wakaf', 'Umum'];

interface Props {
  bisaInput?: boolean;
}

export function ModulDonasi({ bisaInput = true }: Props) {
  const { data: donasiList = [] } = useDonasiList();
  const { mutateAsync: tambahDonasi } = useTambahDonasi();

  const [namaDonatur, setNamaDonatur] = useState('');
  const [jenis, setJenis] = useState('');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const totalDonasi = donasiList.reduce((total, d) => total + d.nominal, 0);

  const simpan = async () => {
    if (!namaDonatur || !jenis || !nominal) {
      alert('Lengkapi nama donatur, jenis, dan nominal');
      return;
    }

    try {
      await tambahDonasi({
        namaDonatur,
        jenis,
        nominal: Number(nominal),
        keterangan,
      });

      setNamaDonatur('');
      setJenis('');
      setNominal('');
      setKeterangan('');
    } catch (err) {
      const pesan =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : String(err);
      alert(`Gagal menyimpan donasi: ${pesan}`);
    }
  };

  const riwayat = [...donasiList].sort((a, b) => b.id - a.id);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Donasi</h1>
      <p className="text-sm text-gray-500 mb-6">
        Total donasi diterima: Rp{totalDonasi.toLocaleString('id-ID')}
      </p>

      {bisaInput && (
        <div className="bg-white p-6 rounded-2xl border mb-6">
          <input
            type="text"
            placeholder="Nama Donatur"
            value={namaDonatur}
            onChange={(e) => setNamaDonatur(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3"
          />

          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3"
          >
            <option value="">Pilih Jenis Donasi</option>
            {JENIS_DONASI.map((j) => (
              <option key={j}>{j}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Nominal"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3"
          />

          <input
            type="text"
            placeholder="Keterangan (opsional)"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4"
          />

          <button
            onClick={simpan}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Simpan
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-left">Donatur</th>
              <th className="p-4 text-left">Jenis</th>
              <th className="p-4 text-left">Nominal</th>
              <th className="p-4 text-left">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  Belum ada data donasi
                </td>
              </tr>
            ) : (
              riwayat.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.tanggal}</td>
                  <td className="p-4">{item.namaDonatur}</td>
                  <td className="p-4">{item.jenis}</td>
                  <td className="p-4">
                    Rp{item.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4">{item.keterangan || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
