import React, { useState } from 'react';
import { useSantriList } from './hooks/useSantri';
import {
  useUangPendaftaranList,
  useTambahUangPendaftaran,
} from './hooks/useTagihan';

interface Props {
  bisaInput?: boolean;
}

export function ModulUangPendaftaran({ bisaInput = true }: Props) {
  const { data: santriList = [] } = useSantriList();
  const { data: uangPendaftaranList = [] } = useUangPendaftaranList();
  const { mutateAsync: tambahUangPendaftaran } = useTambahUangPendaftaran();

  const [santriId, setSantriId] = useState('');
  const [nominal, setNominal] = useState('');
  const [status, setStatus] = useState<'Lunas' | 'Belum Lunas'>(
    'Belum Lunas'
  );
  const [tanggalBayar, setTanggalBayar] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const simpan = async () => {
    if (!santriId || !nominal) {
      alert('Lengkapi santri dan nominal');
      return;
    }

    try {
      await tambahUangPendaftaran({
        santriId: Number(santriId),
        nominal: Number(nominal),
        status,
        tanggalBayar,
        keterangan,
      });

      setSantriId('');
      setNominal('');
      setStatus('Belum Lunas');
      setTanggalBayar('');
      setKeterangan('');
    } catch (err) {
      const pesan =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : String(err);
      alert(`Gagal menyimpan Uang Pendaftaran: ${pesan}`);
    }
  };

  const riwayat = [...uangPendaftaranList]
    .sort((a, b) => b.id - a.id)
    .map((item) => ({
      ...item,
      namaSantri: santriList.find((s: any) => s.id === item.santriId)?.nama ?? '-',
    }));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Uang Pendaftaran Santri</h1>

      {bisaInput && (
        <div className="bg-white p-6 rounded-2xl border mb-6">
          <select
            value={santriId}
            onChange={(e) => setSantriId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3"
          >
            <option value="">Pilih Santri</option>
            {santriList.map((santri: any) => (
              <option key={santri.id} value={santri.id}>
                {santri.nama} {santri.kelas ? `- ${santri.kelas}` : ''}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Nominal"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3"
          />

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as 'Lunas' | 'Belum Lunas')
            }
            className="w-full border rounded-lg px-3 py-2 mb-3"
          >
            <option value="Belum Lunas">Belum Lunas</option>
            <option value="Lunas">Lunas</option>
          </select>

          <input
            type="date"
            placeholder="Tanggal Bayar"
            value={tanggalBayar}
            onChange={(e) => setTanggalBayar(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3"
          />

          <textarea
            placeholder="Keterangan (opsional, mis. hal yang perlu ditindaklanjuti)"
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
              <th className="p-4 text-left">Santri</th>
              <th className="p-4 text-left">Nominal</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Tanggal Bayar</th>
              <th className="p-4 text-left">Keterangan</th>
            </tr>
          </thead>

          <tbody>
            {riwayat.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  Belum ada data uang pendaftaran
                </td>
              </tr>
            ) : (
              riwayat.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.namaSantri}</td>
                  <td className="p-4">
                    Rp{item.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4">{item.status}</td>
                  <td className="p-4">{item.tanggalBayar || '-'}</td>
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
