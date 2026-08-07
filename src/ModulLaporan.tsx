import React from 'react';
import { useSantriList } from './hooks/useSantri';
import { usePegawaiList } from './hooks/usePegawai';
import { usePresensiSantriList, usePresensiPegawaiList } from './hooks/usePresensi';
import { useNilaiAkhlakList } from './hooks/useAkhlak';
import { useRingkasanKeuangan } from './hooks/useRingkasanKeuangan';
import {
  bulanDariTanggal,
  bulanEnamTerakhir,
  GrafikBar,
  GrafikGaris,
  WARNA_SERI,
  WARNA_STATUS,
} from './Grafik';
import { tanggalLokal } from './tanggal';

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <h3 className="text-sm text-gray-500">{label}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function PanelGrafik({
  judul,
  keterangan,
  children,
}: {
  judul: string;
  keterangan?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border p-4">
      <h3 className="font-semibold mb-1">{judul}</h3>
      {keterangan && (
        <p className="text-xs text-gray-500 mb-2">{keterangan}</p>
      )}
      {children}
    </div>
  );
}

function hitungPerBulanKategori<T>(
  data: T[],
  ambilTanggal: (item: T) => string,
  ambilKategori: (item: T) => string,
  bulanList: { key: string }[],
  kategoriDaftar: string[]
): number[][] {
  return kategoriDaftar.map((kategori) =>
    bulanList.map(
      (bulan) =>
        data.filter(
          (item) =>
            bulanDariTanggal(ambilTanggal(item)) === bulan.key &&
            ambilKategori(item) === kategori
        ).length
    )
  );
}

export function ModulLaporan() {
  const { data: santriList = [] } = useSantriList();
  const { data: pegawaiList = [] } = usePegawaiList();
  const { data: presensiSantri = [] } = usePresensiSantriList();
  const { data: presensiPegawai = [] } = usePresensiPegawaiList();
  const { data: nilaiAkhlakList = [] } = useNilaiAkhlakList();

  const {
    totalSpp,
    totalDaftarUlang,
    totalUangPendaftaran,
    totalDonasi,
    totalPemasukan,
    trenPerBulan,
  } = useRingkasanKeuangan();

  const bulanList = bulanEnamTerakhir();
  const kategoriBulan = bulanList.map((b) => b.label);

  // Presensi Santri per bulan
  const [hadirSantri, sakitSantri, izinSantri, alfaSantri] =
    hitungPerBulanKategori(
      presensiSantri,
      (p) => p.tanggal,
      (p) => p.status,
      bulanList,
      ['Hadir', 'Sakit', 'Izin', 'Alfa']
    );

  // Presensi Pegawai per bulan
  const [hadirPegawai, sakitPegawai, izinPegawai, alfaPegawai] =
    hitungPerBulanKategori(
      presensiPegawai,
      (p) => p.tanggal,
      (p) => p.status,
      bulanList,
      ['Hadir', 'Sakit', 'Izin', 'Alfa']
    );

  // Hafalan per bulan (jumlah entri)
  const semuaHafalan = santriList.flatMap((s) => s.riwayatTahfidz);
  const hafalanPerBulan = bulanList.map(
    (b) =>
      semuaHafalan.filter((h) => bulanDariTanggal(h.tanggal) === b.key).length
  );

  // Nilai Akhlak per bulan
  const [akhlakBaik, akhlakCukup, akhlakKurang] = hitungPerBulanKategori(
    nilaiAkhlakList,
    (a) => a.tanggal,
    (a) => a.nilai,
    bulanList,
    ['Baik', 'Cukup', 'Kurang']
  );

  // Detail presensi pegawai hari ini (jam & lokasi)
  const tanggalHariIni = tanggalLokal();
  const presensiPegawaiHariIni = presensiPegawai
    .filter((p: any) => p.tanggal === tanggalHariIni)
    .map((p: any) => ({
      ...p,
      namaPegawai:
        pegawaiList.find((peg: any) => peg.id === p.pegawaiId)?.nama ?? '-',
    }))
    .sort((a: any, b: any) => (b.dicatatPada ?? '').localeCompare(a.dicatatPada ?? ''));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Laporan Yayasan</h1>
      <p className="text-sm text-gray-500 mb-6">
        Ringkasan aktivitas seluruh santri dan pegawai, tren 6 bulan terakhir.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Jumlah Santri" value={santriList.length} />
        <StatCard label="Jumlah Pegawai" value={pegawaiList.length} />
        <StatCard
          label="Total Pemasukan"
          value={`Rp${totalPemasukan.toLocaleString('id-ID')}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="SPP" value={`Rp${totalSpp.toLocaleString('id-ID')}`} />
        <StatCard
          label="Daftar Ulang"
          value={`Rp${totalDaftarUlang.toLocaleString('id-ID')}`}
        />
        <StatCard
          label="Uang Pendaftaran"
          value={`Rp${totalUangPendaftaran.toLocaleString('id-ID')}`}
        />
        <StatCard
          label="Donasi"
          value={`Rp${totalDonasi.toLocaleString('id-ID')}`}
        />
      </div>

      <div className="mb-6">
        <PanelGrafik
          judul="Tren Penerimaan"
          keterangan="Total SPP + Daftar Ulang + Uang Pendaftaran + Donasi, 6 bulan terakhir"
        >
          <GrafikGaris
            kategori={kategoriBulan}
            nilai={trenPerBulan.map((b) => b.total)}
            warna={WARNA_STATUS.baik}
          />
        </PanelGrafik>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <PanelGrafik judul="Presensi Santri per Bulan" keterangan="6 bulan terakhir">
          <GrafikBar
            kategori={kategoriBulan}
            seri={[
              { nama: 'Hadir', warna: WARNA_STATUS.baik, nilai: hadirSantri },
              { nama: 'Sakit', warna: WARNA_STATUS.peringatan, nilai: sakitSantri },
              { nama: 'Izin', warna: WARNA_STATUS.serius, nilai: izinSantri },
              { nama: 'Alfa', warna: WARNA_STATUS.kritis, nilai: alfaSantri },
            ]}
          />
        </PanelGrafik>

        <PanelGrafik judul="Presensi Pegawai per Bulan" keterangan="6 bulan terakhir">
          <GrafikBar
            kategori={kategoriBulan}
            seri={[
              { nama: 'Hadir', warna: WARNA_STATUS.baik, nilai: hadirPegawai },
              { nama: 'Sakit', warna: WARNA_STATUS.peringatan, nilai: sakitPegawai },
              { nama: 'Izin', warna: WARNA_STATUS.serius, nilai: izinPegawai },
              { nama: 'Alfa', warna: WARNA_STATUS.kritis, nilai: alfaPegawai },
            ]}
          />
        </PanelGrafik>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto mb-6">
        <h3 className="font-semibold p-4 border-b bg-slate-50">
          Detail Presensi Pegawai Hari Ini ({tanggalHariIni})
        </h3>
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Nama</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Jam</th>
              <th className="p-4 text-left">Lokasi</th>
            </tr>
          </thead>
          <tbody>
            {presensiPegawaiHariIni.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500">
                  Belum ada pegawai yang presensi hari ini
                </td>
              </tr>
            ) : (
              presensiPegawaiHariIni.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="p-4">{p.namaPegawai}</td>
                  <td className="p-4">{p.status}</td>
                  <td className="p-4">
                    {p.dicatatPada
                      ? new Date(p.dicatatPada).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="p-4">
                    {p.lokasiLat != null && p.lokasiLng != null ? (
                      <a
                        href={`https://www.google.com/maps?q=${p.lokasiLat},${p.lokasiLng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        Lihat lokasi
                      </a>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <PanelGrafik
          judul="Progres Hafalan"
          keterangan="Jumlah entri hafalan tercatat per bulan, 6 bulan terakhir"
        >
          <GrafikGaris
            kategori={kategoriBulan}
            nilai={hafalanPerBulan}
            warna={WARNA_SERI.biru}
          />
        </PanelGrafik>

        <PanelGrafik judul="Nilai Akhlak per Bulan" keterangan="6 bulan terakhir">
          <GrafikBar
            kategori={kategoriBulan}
            seri={[
              { nama: 'Baik', warna: WARNA_STATUS.baik, nilai: akhlakBaik },
              { nama: 'Cukup', warna: WARNA_STATUS.peringatan, nilai: akhlakCukup },
              { nama: 'Kurang', warna: WARNA_STATUS.kritis, nilai: akhlakKurang },
            ]}
          />
        </PanelGrafik>
      </div>
    </div>
  );
}
