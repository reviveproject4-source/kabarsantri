import React, { useMemo, useState } from 'react';
import { JenisTransaksi } from './types';
import { useSantriList } from './hooks/useSantri';
import {
  useTransaksiTabunganList,
  useTambahTransaksiTabungan,
} from './hooks/useKeuangan';

function hitungSaldo(
  transaksi: { santriId: number; jenis: JenisTransaksi; nominal: number }[],
  santriId: number
) {
  return transaksi
    .filter((t) => t.santriId === santriId)
    .reduce(
      (saldo, t) => saldo + (t.jenis === 'Setor' ? t.nominal : -t.nominal),
      0
    );
}

interface Props {
  bisaInput?: boolean;
}

export function ModulTabungan({ bisaInput = true }: Props) {
  const { data: santriList = [] } = useSantriList();
  const { data: transaksiTabunganList = [] } = useTransaksiTabunganList();
  const { mutateAsync: tambahTransaksiTabungan } =
    useTambahTransaksiTabungan();

  const [santriId, setSantriId] = useState('');
  const [jenis, setJenis] = useState<JenisTransaksi>('Setor');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const saldoPerSantri = useMemo(
    () =>
      santriList.map((santri: any) => ({
        id: santri.id,
        nama: santri.nama,
        kelas: santri.kelas,
        saldo: hitungSaldo(transaksiTabunganList, santri.id),
      })),
    [santriList, transaksiTabunganList]
  );

  const simpan = async () => {
    if (!santriId || !nominal) {
      alert('Pilih santri dan isi nominal');
      return;
    }

    const hasil = await tambahTransaksiTabungan({
      santriId: Number(santriId),
      jenis,
      nominal: Number(nominal),
      keterangan,
    });

    if (!hasil.berhasil) {
      alert(hasil.pesan ?? 'Gagal menyimpan transaksi');
      return;
    }

    setSantriId('');
    setJenis('Setor');
    setNominal('');
    setKeterangan('');
  };

  const riwayat = [...transaksiTabunganList]
    .sort((a, b) => b.id - a.id)
    .map((item) => ({
      ...item,
      namaSantri: santriList.find((s: any) => s.id === item.santriId)?.nama ?? '-',
    }));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tabungan Santri</h1>

      <div className="bg-white rounded-2xl border overflow-hidden mb-6">
        <h3 className="font-semibold p-4 border-b bg-slate-50">
          Saldo Tabungan per Santri
        </h3>
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Nama</th>
              <th className="p-4 text-left">Kelas</th>
              <th className="p-4 text-left">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {saldoPerSantri.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-6 text-gray-500">
                  Belum ada data santri
                </td>
              </tr>
            ) : (
              saldoPerSantri.map((s: any) => (
                <tr key={s.id} className="border-t">
                  <td className="p-4">{s.nama}</td>
                  <td className="p-4">{s.kelas}</td>
                  <td className="p-4">
                    Rp{s.saldo.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value as JenisTransaksi)}
            className="w-full border rounded-lg px-3 py-2 mb-3"
          >
            <option value="Setor">Setor</option>
            <option value="Tarik">Tarik</option>
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
              <th className="p-4 text-left">Santri</th>
              <th className="p-4 text-left">Jenis</th>
              <th className="p-4 text-left">Nominal</th>
              <th className="p-4 text-left">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  Belum ada transaksi
                </td>
              </tr>
            ) : (
              riwayat.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.tanggal}</td>
                  <td className="p-4">{item.namaSantri}</td>
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
