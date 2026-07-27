import React from 'react';
import { useAuth } from './AuthContext';
import { StatusIzinPulang } from './types';
import { useSantriList } from './hooks/useSantri';
import { useKelasAktif } from './hooks/useKelasAktif';
import { samaKelas } from './kelasUtils';
import {
  useIzinPulangList,
  usePerbaruiStatusIzinPulang,
} from './hooks/useIzinPulang';

const WARNA_STATUS: Record<StatusIzinPulang, string> = {
  Menunggu: 'bg-amber-100 text-amber-700',
  Disetujui: 'bg-green-100 text-green-700',
  Ditolak: 'bg-red-100 text-red-700',
};

interface Props {
  kelasDiajar: string[];
  bisaMemutuskan: boolean;
  jenisKelaminDiampu: string;
}

export function ModulIzinPulang({
  kelasDiajar,
  bisaMemutuskan,
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
  const { data: izinPulangList = [] } = useIzinPulangList();
  const { mutate: perbaruiStatusIzinPulangMutasi } =
    usePerbaruiStatusIzinPulang();
  const paket = yayasan?.paket ?? 'Gratis';

  const perbaruiStatusIzinPulang = (data: {
    id: number;
    status: StatusIzinPulang;
  }) => {
    perbaruiStatusIzinPulangMutasi(data, {
      onError: (err) => {
        const pesan =
          err instanceof Error
            ? err.message
            : err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : String(err);
        alert(`Gagal memperbarui status izin pulang: ${pesan}`);
      },
    });
  };

  if (paket !== 'Premium') {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Izin Pulang</h1>
        <div className="bg-white rounded-2xl border p-10 text-center">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-semibold text-lg mb-2">
            Fitur Premium (Add-on)
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Persetujuan izin pulang santri adalah fitur tambahan berbayar.
            Hubungi pihak Yayasan untuk mengaktifkan Paket Premium.
          </p>
        </div>
      </div>
    );
  }

  const riwayat = [...izinPulangList]
    .filter((item) => santriList.some((s) => s.id === item.santriId))
    .sort((a, b) => b.id - a.id)
    .map((item) => ({
      ...item,
      namaSantri: santriList.find((s) => s.id === item.santriId)?.nama ?? '-',
    }));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold">Izin Pulang</h1>

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
      <p className="text-sm text-gray-500 mb-6">
        Pengajuan izin pulang dari wali santri, menunggu persetujuan
        Kesantrian.
      </p>

      <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Santri</th>
              <th className="p-4 text-left">Keluar</th>
              <th className="p-4 text-left">Kembali</th>
              <th className="p-4 text-left">Alasan</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {riwayat.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  Belum ada pengajuan izin pulang
                </td>
              </tr>
            ) : (
              riwayat.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.namaSantri}</td>
                  <td className="p-4">{item.tanggalKeluar}</td>
                  <td className="p-4">{item.tanggalKembali}</td>
                  <td className="p-4">{item.alasan}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs ${
                        WARNA_STATUS[item.status]
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.status === 'Menunggu' && bisaMemutuskan ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            perbaruiStatusIzinPulang({
                              id: item.id,
                              status: 'Disetujui',
                            })
                          }
                          className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() =>
                            perbaruiStatusIzinPulang({
                              id: item.id,
                              status: 'Ditolak',
                            })
                          }
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
