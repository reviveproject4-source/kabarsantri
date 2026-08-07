import React, { useState } from 'react';
import { useSantriList, useTambahRiwayatTahfidz } from './hooks/useSantri';
import { useKelasAktif } from './hooks/useKelasAktif';
import { samaKelas } from './kelasUtils';
import { PemilihSantri } from './PemilihSantri';

interface Props {
  dicatatOleh: string;
  kelasDiajar: string[];
  jenisKelaminDiampu: string;
}

export function ModulTahfidz({
  dicatatOleh,
  kelasDiajar,
  jenisKelaminDiampu,
}: Props) {
  const { data: santriListSemua = [] } = useSantriList();
  const [kelasAktif, setKelasAktif] = useKelasAktif(kelasDiajar);
  const santriList = (
    kelasDiajar.length > 0
      ? santriListSemua.filter((s: any) => samaKelas(s.kelas, kelasAktif))
      : santriListSemua
  ).filter(
    (s: any) => !jenisKelaminDiampu || s.jenisKelamin === jenisKelaminDiampu
  );
  const { mutateAsync: tambahRiwayatTahfidz } = useTambahRiwayatTahfidz();

  const [santriId, setSantriId] = useState('');
  const [juz, setJuz] = useState('');
  const [surat, setSurat] = useState('');
  const [ayat, setAyat] = useState('');
  const [hadits, setHadits] = useState('');
  const [kitab, setKitab] = useState('');
  const [nilai, setNilai] = useState('');

  const simpanTahfidz = async () => {
    if (!santriId || !juz) {
      alert('Pilih santri dan isi minimal Juz');
      return;
    }

    try {
      await tambahRiwayatTahfidz({
        santriId: Number(santriId),
        riwayat: { juz, surat, ayat, hadits, kitab, nilai, dicatatOleh },
      });

      setSantriId('');
      setJuz('');
      setSurat('');
      setAyat('');
      setHadits('');
      setKitab('');
      setNilai('');
    } catch (err) {
      const pesan =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : String(err);
      alert(`Gagal menyimpan hafalan: ${pesan}`);
    }
  };

  const riwayatGabungan = santriList
    .flatMap((santri: any) =>
      santri.riwayatTahfidz.map((r: any) => ({ ...r, namaSantri: santri.nama }))
    )
    .sort((a: any, b: any) => b.id - a.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Hafalan Santri</h1>

        {kelasDiajar.length > 1 && (
          <select
            value={kelasAktif}
            onChange={(e) => setKelasAktif(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            {kelasDiajar.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border mb-6">
        <PemilihSantri
          santriList={santriList}
          value={santriId}
          onChange={setSantriId}
        />

        <input
          type="text"
          placeholder="Juz"
          value={juz}
          onChange={(e) => setJuz(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <input
          type="text"
          placeholder="Surat"
          value={surat}
          onChange={(e) => setSurat(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <input
          type="text"
          placeholder="Ayat"
          value={ayat}
          onChange={(e) => setAyat(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <input
          type="text"
          placeholder="Hadits"
          value={hadits}
          onChange={(e) => setHadits(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <input
          type="text"
          placeholder="Kitab"
          value={kitab}
          onChange={(e) => setKitab(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <input
          type="text"
          placeholder="Nilai"
          value={nilai}
          onChange={(e) => setNilai(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <button
          onClick={simpanTahfidz}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Simpan
        </button>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-left">Santri</th>
              <th className="p-4 text-left">Juz</th>
              <th className="p-4 text-left">Surat</th>
              <th className="p-4 text-left">Ayat</th>
              <th className="p-4 text-left">Hadits</th>
              <th className="p-4 text-left">Kitab</th>
              <th className="p-4 text-left">Nilai</th>
            </tr>
          </thead>

          <tbody>
            {riwayatGabungan.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-6 text-gray-500">
                  Belum ada data hafalan
                </td>
              </tr>
            ) : (
              riwayatGabungan.map((item: any) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.tanggal}</td>
                  <td className="p-4">{item.namaSantri}</td>
                  <td className="p-4">{item.juz}</td>
                  <td className="p-4">{item.surat}</td>
                  <td className="p-4">{item.ayat}</td>
                  <td className="p-4">{item.hadits}</td>
                  <td className="p-4">{item.kitab}</td>
                  <td className="p-4">{item.nilai}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
