import React from 'react';
import { PresensiPegawai, StatusPresensi } from './types';
import { useCatatPresensiPegawai } from './hooks/usePresensi';
import { tanggalLokal as hariIni } from './tanggal';

const STATUS_OPTIONS: StatusPresensi[] = ['Hadir', 'Sakit', 'Izin', 'Alfa'];

interface Props {
  // null berarti ini Yayasan mencatat presensinya sendiri (bukan pegawai).
  pegawaiId: number | null;
  presensiPegawai: PresensiPegawai[];
}

export function PresensiSaya({ pegawaiId, presensiPegawai }: Props) {
  const { mutateAsync: catatPresensiPegawaiMutasi } = useCatatPresensiPegawai();

  const tanggal = hariIni();

  const presensiSayaHariIni = presensiPegawai.find(
    (p) => p.pegawaiId === pegawaiId && p.tanggal === tanggal
  );
  const statusSayaHariIni = presensiSayaHariIni?.status;

  const tampilkanError = (err: unknown) => {
    const pesan =
      err instanceof Error
        ? err.message
        : err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err);
    alert(`Gagal menyimpan presensi: ${pesan}`);
  };

  const catatPresensi = async (status: StatusPresensi) => {
    // Catat presensi LANGSUNG -- jangan sampai izin lokasi yang lambat/
    // ditolak bikin presensi jadi terasa tidak tercatat. Lokasi menyusul
    // di belakang layar sebagai tambahan opsional saja. Panggilan pertama
    // ini DITUNGGU dulu (await) sebelum memicu update lokasi, supaya
    // panggilan kedua pasti menemukan baris yang sama (tidak lomba/dobel).
    try {
      await catatPresensiPegawaiMutasi({
        pegawaiId,
        status,
        lokasiLat: null,
        lokasiLng: null,
      });
    } catch (err) {
      tampilkanError(err);
      return;
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (posisi) => {
          catatPresensiPegawaiMutasi({
            pegawaiId,
            status,
            lokasiLat: posisi.coords.latitude,
            lokasiLng: posisi.coords.longitude,
          }).catch(tampilkanError);
        },
        () => {},
        { timeout: 8000 }
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-6 mb-6">
      <h3 className="font-semibold mb-3">Presensi Saya Hari Ini</h3>

      <div className="flex flex-wrap gap-2 mb-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => catatPresensi(status)}
            className={`px-4 py-2 rounded-lg border ${
              statusSayaHariIni === status
                ? 'bg-blue-600 text-white border-blue-600'
                : 'hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {presensiSayaHariIni?.dicatatPada && (
        <p className="text-xs text-gray-500">
          Tercatat pukul{' '}
          {new Date(presensiSayaHariIni.dicatatPada).toLocaleTimeString(
            'id-ID',
            { hour: '2-digit', minute: '2-digit' }
          )}
          {presensiSayaHariIni.lokasiLat != null &&
            presensiSayaHariIni.lokasiLng != null && (
              <>
                {' · '}
                <a
                  href={`https://www.google.com/maps?q=${presensiSayaHariIni.lokasiLat},${presensiSayaHariIni.lokasiLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Lihat lokasi
                </a>
              </>
            )}
        </p>
      )}
    </div>
  );
}
