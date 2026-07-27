import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useSantriList } from './hooks/useSantri';
import { useKelasAktif } from './hooks/useKelasAktif';
import { samaKelas } from './kelasUtils';
import { PemilihSantri } from './PemilihSantri';
import {
  useNilaiAkhlakList,
  useTambahNilaiAkhlak,
  usePerbaruiStatusNilaiAkhlak,
} from './hooks/useAkhlak';

const PILIHAN_NILAI = ['Baik', 'Cukup', 'Kurang'];

interface Props {
  dicatatOleh: string;
  kelasDiajar: string[];
  bisaMemutuskan: boolean;
  perluAcc: boolean;
  jenisKelaminDiampu: string;
}

export function ModulAkhlak({
  dicatatOleh,
  kelasDiajar,
  bisaMemutuskan,
  perluAcc,
  jenisKelaminDiampu,
}: Props) {
  const { yayasan } = useAuth();
  const { data: santriListSemua = [] } = useSantriList();
  const [kelasAktif, setKelasAktif] = useKelasAktif(kelasDiajar);
  const santriList = (
    kelasDiajar.length > 0
      ? santriListSemua.filter((s) => samaKelas(s.kelas, kelasAktif))
      : santriListSemua
  ).filter(
    (s) => !jenisKelaminDiampu || s.jenisKelamin === jenisKelaminDiampu
  );
  const { data: nilaiAkhlakList = [] } = useNilaiAkhlakList();
  const { mutateAsync: tambahNilaiAkhlak } = useTambahNilaiAkhlak();
  const { mutate: perbaruiStatusNilaiAkhlak } = usePerbaruiStatusNilaiAkhlak();
  const paket = yayasan?.paket ?? 'Gratis';

  const [santriId, setSantriId] = useState('');
  const [nilai, setNilai] = useState('');
  const [catatan, setCatatan] = useState('');

  if (paket !== 'Premium') {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Nilai Akhlak</h1>
        <div className="bg-white rounded-2xl border p-10 text-center">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-semibold text-lg mb-2">
            Fitur Premium (Add-on)
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Pencatatan nilai karakter &amp; akhlak santri adalah fitur
            tambahan berbayar. Hubungi pihak Yayasan untuk mengaktifkan
            Paket Premium.
          </p>
        </div>
      </div>
    );
  }

  const simpan = async () => {
    if (!santriId || !nilai) {
      alert('Pilih santri dan nilai akhlak');
      return;
    }

    try {
      await tambahNilaiAkhlak({
        santriId: Number(santriId),
        nilai,
        catatan,
        dicatatOleh,
        status: perluAcc ? 'Menunggu' : 'Disetujui',
      });

      setSantriId('');
      setNilai('');
      setCatatan('');
    } catch (err) {
      const pesan =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : String(err);
      alert(`Gagal menyimpan nilai akhlak: ${pesan}`);
    }
  };

  const putuskan = (id: number, status: 'Disetujui' | 'Ditolak') => {
    perbaruiStatusNilaiAkhlak(
      { id, status },
      {
        onError: (err) => {
          const pesan =
            err instanceof Error
              ? err.message
              : err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : String(err);
          alert(`Gagal memperbarui status nilai akhlak: ${pesan}`);
        },
      }
    );
  };

  const riwayat = [...nilaiAkhlakList]
    .filter((item) => santriList.some((s) => s.id === item.santriId))
    .sort((a, b) => b.id - a.id)
    .map((item) => ({
      ...item,
      namaSantri: santriList.find((s) => s.id === item.santriId)?.nama ?? '-',
    }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Nilai Akhlak</h1>

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

        <select
          value={nilai}
          onChange={(e) => setNilai(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        >
          <option value="">Pilih Nilai</option>
          {PILIHAN_NILAI.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        <textarea
          placeholder="Catatan (opsional)"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <button
          onClick={simpan}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Simpan
        </button>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-left">Santri</th>
              <th className="p-4 text-left">Nilai</th>
              <th className="p-4 text-left">Catatan</th>
              <th className="p-4 text-left">Dicatat Oleh</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {riwayat.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-6 text-gray-500">
                  Belum ada data akhlak
                </td>
              </tr>
            ) : (
              riwayat.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.tanggal}</td>
                  <td className="p-4">{item.namaSantri}</td>
                  <td className="p-4">{item.nilai}</td>
                  <td className="p-4">{item.catatan || '-'}</td>
                  <td className="p-4">{item.dicatatOleh}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs ${
                        item.status === 'Disetujui'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'Ditolak'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.status === 'Menunggu' && bisaMemutuskan ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => putuskan(item.id, 'Disetujui')}
                          className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => putuskan(item.id, 'Ditolak')}
                          className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : item.status === 'Menunggu' ? (
                      <span className="text-xs text-gray-400">
                        Menunggu Kesantrian
                      </span>
                    ) : (
                      '-'
                    )}
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
