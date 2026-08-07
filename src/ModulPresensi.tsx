import React, { useMemo } from 'react';
import { StatusPresensi } from './types';
import { useSantriList } from './hooks/useSantri';
import { useKelasAktif } from './hooks/useKelasAktif';
import { samaKelas } from './kelasUtils';
import {
  useCatatPresensiSantri,
  usePresensiPegawaiList,
  usePresensiSantriList,
} from './hooks/usePresensi';
import { PresensiSaya } from './PresensiSaya';
import { tanggalLokal as hariIni } from './tanggal';

const STATUS_OPTIONS: StatusPresensi[] = ['Hadir', 'Sakit', 'Izin', 'Alfa'];

interface Props {
  isGuru: boolean;
  isMusyrif: boolean;
  namaAktif: string;
  pegawaiId: number | null;
  kelasDiajar: string[];
  jenisKelaminDiampu: string;
}

export function ModulPresensi({
  isGuru,
  isMusyrif,
  namaAktif,
  pegawaiId,
  kelasDiajar,
  jenisKelaminDiampu,
}: Props) {
  const { data: santriListSemua = [] } = useSantriList();
  const [kelasAktif, setKelasAktif] = useKelasAktif(kelasDiajar);
  const santriList = (
    isGuru && kelasDiajar.length > 0
      ? santriListSemua.filter((s: any) => samaKelas(s.kelas, kelasAktif))
      : santriListSemua
  ).filter(
    (s: any) => !jenisKelaminDiampu || s.jenisKelamin === jenisKelaminDiampu
  );
  const { data: presensiSantri = [] } = usePresensiSantriList();
  const { mutate: catatPresensiSantriMutasi } = useCatatPresensiSantri();
  const { data: presensiPegawai = [] } = usePresensiPegawaiList();

  const tampilkanError = (err: unknown) => {
    const pesan =
      err instanceof Error
        ? err.message
        : err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err);

    alert(`Gagal menyimpan presensi: ${pesan}`);
  };

  const catatPresensiSantri = (data: {
    santriId: number;
    status: StatusPresensi;
    dicatatOleh: string;
  }) => {
    catatPresensiSantriMutasi(data, { onError: tampilkanError });
  };

  const tanggal = hariIni();
  const bisaPresensiSantri = isGuru || isMusyrif;

  const statusSantriHariIni = useMemo(() => {
    const map = new Map<number, StatusPresensi>();
    presensiSantri
      .filter((p: any) => p.tanggal === tanggal)
      .forEach((p: any) => map.set(p.santriId, p.status));
    return map;
  }, [presensiSantri, tanggal]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Presensi</h1>
      <p className="text-sm text-gray-500 mb-6">{tanggal}</p>

      {pegawaiId !== null && (
        <PresensiSaya pegawaiId={pegawaiId} presensiPegawai={presensiPegawai} />
      )}

      {bisaPresensiSantri && (
        <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
          <div className="flex items-center justify-between p-4 border-b bg-slate-50">
            <h3 className="font-semibold">Presensi Santri</h3>

            {isGuru && kelasDiajar.length > 1 && (
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

          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-4">Nama</th>
                <th className="text-left p-4">Kelas</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {santriList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-gray-500">
                    Belum ada data santri
                  </td>
                </tr>
              ) : (
                santriList.map((santri: any) => (
                  <tr key={santri.id} className="border-t">
                    <td className="p-4">{santri.nama}</td>
                    <td className="p-4">{santri.kelas}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {STATUS_OPTIONS.map((status) => (
                          <button
                            key={status}
                            onClick={() =>
                              catatPresensiSantri({
                                santriId: santri.id,
                                status,
                                dicatatOleh: namaAktif,
                              })
                            }
                            className={`px-3 py-1 rounded-lg border text-sm ${
                              statusSantriHariIni.get(santri.id) === status
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
