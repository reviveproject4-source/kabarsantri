import React from 'react';
import { useSantriList } from './hooks/useSantri';
import { useNilaiAkhlakList } from './hooks/useAkhlak';
import { usePelanggaranList, useRewardList } from './hooks/useRewardPelanggaran';
import { usePegawaiList } from './hooks/usePegawai';
import { useAuth } from './AuthContext';
import { GrupKomunikasiCard, AnggotaGrupKomunikasi } from './GrupKomunikasiCard';

export function ModulKepsek() {
  const { data: santriList = [] } = useSantriList();
  const { data: nilaiAkhlakList = [] } = useNilaiAkhlakList();
  const { data: pelanggaranList = [] } = usePelanggaranList();
  const { data: rewardList = [] } = useRewardList();
  const { data: pegawaiList = [] } = usePegawaiList();
  const { yayasan } = useAuth();

  const grupYayasanPengurus: AnggotaGrupKomunikasi[] = [
    ...(yayasan
      ? [
          {
            id: 'yayasan',
            nama: yayasan.namaPenanggungJawab || yayasan.namaYayasan,
            jabatan: 'Yayasan',
            email: yayasan.email,
          },
        ]
      : []),
    ...pegawaiList
      .filter((p) => p.jabatan.trim().toLowerCase() === 'keuangan')
      .map((p) => ({ id: p.id, nama: p.nama, jabatan: p.jabatan, email: p.email })),
  ];

  const ringkasan = santriList.map((santri) => {
    const hafalanTerbaru = [...santri.riwayatTahfidz].sort(
      (a, b) => b.id - a.id
    )[0];

    const akhlakTerbaru = nilaiAkhlakList
      .filter((a) => a.santriId === santri.id)
      .sort((a, b) => b.id - a.id)[0];

    return {
      id: santri.id,
      nama: santri.nama,
      kelas: santri.kelas,
      juzTerakhir: hafalanTerbaru?.juz || santri.juzTerakhir || '-',
      tanggalHafalan: hafalanTerbaru?.tanggal || '-',
      nilaiAkhlakTerakhir: akhlakTerbaru?.nilai || '-',
      tanggalAkhlak: akhlakTerbaru?.tanggal || '-',
    };
  });

  const riwayatHafalanSemua = santriList.flatMap((s) =>
    s.riwayatTahfidz.map((r) => ({ ...r, namaSantri: s.nama }))
  );

  const riwayatHafalan = [...riwayatHafalanSemua]
    .sort((a, b) => b.id - a.id)
    .slice(0, 20);

  const riwayatAkhlak = [...nilaiAkhlakList]
    .sort((a, b) => b.id - a.id)
    .map((a) => ({
      ...a,
      namaSantri: santriList.find((s) => s.id === a.santriId)?.nama ?? '-',
    }))
    .slice(0, 20);

  const riwayatReward = [...rewardList]
    .sort((a, b) => b.id - a.id)
    .map((r) => ({
      ...r,
      namaSantri: santriList.find((s) => s.id === r.santriId)?.nama ?? '-',
    }))
    .slice(0, 20);

  const riwayatPelanggaran = [...pelanggaranList]
    .sort((a, b) => b.id - a.id)
    .map((p) => ({
      ...p,
      namaSantri: santriList.find((s) => s.id === p.santriId)?.nama ?? '-',
    }))
    .slice(0, 20);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Progres Santri</h1>
      <p className="text-sm text-gray-500 mb-6">
        Ringkasan hafalan, karakter, reward, dan pelanggaran seluruh santri
        (khusus lihat).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <h3 className="text-sm text-gray-500">Jumlah Santri</h3>
          <p className="text-2xl font-bold">{santriList.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <h3 className="text-sm text-gray-500">Entri Hafalan</h3>
          <p className="text-2xl font-bold">{riwayatHafalanSemua.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <h3 className="text-sm text-gray-500">Total Reward</h3>
          <p className="text-2xl font-bold">{rewardList.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <h3 className="text-sm text-gray-500">Total Pelanggaran</h3>
          <p className="text-2xl font-bold">{pelanggaranList.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto mb-6">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Nama</th>
              <th className="p-4 text-left">Kelas</th>
              <th className="p-4 text-left">Juz Terakhir</th>
              <th className="p-4 text-left">Tgl Hafalan Terakhir</th>
              <th className="p-4 text-left">Akhlak Terakhir</th>
              <th className="p-4 text-left">Tgl Akhlak Terakhir</th>
            </tr>
          </thead>

          <tbody>
            {ringkasan.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  Belum ada data santri
                </td>
              </tr>
            ) : (
              ringkasan.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-4">{r.nama}</td>
                  <td className="p-4">{r.kelas}</td>
                  <td className="p-4">{r.juzTerakhir}</td>
                  <td className="p-4">{r.tanggalHafalan}</td>
                  <td className="p-4">{r.nilaiAkhlakTerakhir}</td>
                  <td className="p-4">{r.tanggalAkhlak}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border overflow-hidden">
          <h3 className="font-semibold p-4 border-b bg-slate-50">
            Riwayat Hafalan Terbaru
          </h3>
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left text-sm">Tanggal</th>
                <th className="p-3 text-left text-sm">Santri</th>
                <th className="p-3 text-left text-sm">Juz</th>
                <th className="p-3 text-left text-sm">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {riwayatHafalan.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">
                    Belum ada data
                  </td>
                </tr>
              ) : (
                riwayatHafalan.map((r) => (
                  <tr key={r.id} className="border-t text-sm">
                    <td className="p-3">{r.tanggal}</td>
                    <td className="p-3">{r.namaSantri}</td>
                    <td className="p-3">{r.juz}</td>
                    <td className="p-3">{r.nilai}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <h3 className="font-semibold p-4 border-b bg-slate-50">
            Riwayat Karakter & Akhlak Terbaru
          </h3>
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left text-sm">Tanggal</th>
                <th className="p-3 text-left text-sm">Santri</th>
                <th className="p-3 text-left text-sm">Nilai</th>
                <th className="p-3 text-left text-sm">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {riwayatAkhlak.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">
                    Belum ada data
                  </td>
                </tr>
              ) : (
                riwayatAkhlak.map((a) => (
                  <tr key={a.id} className="border-t text-sm">
                    <td className="p-3">{a.tanggal}</td>
                    <td className="p-3">{a.namaSantri}</td>
                    <td className="p-3">{a.nilai}</td>
                    <td className="p-3">{a.catatan || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <h3 className="font-semibold p-4 border-b bg-slate-50">
            Riwayat Reward Terbaru
          </h3>
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left text-sm">Tanggal</th>
                <th className="p-3 text-left text-sm">Santri</th>
                <th className="p-3 text-left text-sm">Kategori</th>
                <th className="p-3 text-left text-sm">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {riwayatReward.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">
                    Belum ada data
                  </td>
                </tr>
              ) : (
                riwayatReward.map((r) => (
                  <tr key={r.id} className="border-t text-sm">
                    <td className="p-3">{r.tanggal}</td>
                    <td className="p-3">{r.namaSantri}</td>
                    <td className="p-3">{r.kategori}</td>
                    <td className="p-3">{r.catatan || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <h3 className="font-semibold p-4 border-b bg-slate-50">
            Riwayat Pelanggaran Terbaru
          </h3>
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left text-sm">Tanggal</th>
                <th className="p-3 text-left text-sm">Santri</th>
                <th className="p-3 text-left text-sm">Kategori</th>
                <th className="p-3 text-left text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {riwayatPelanggaran.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">
                    Belum ada data
                  </td>
                </tr>
              ) : (
                riwayatPelanggaran.map((p) => (
                  <tr key={p.id} className="border-t text-sm">
                    <td className="p-3">{p.tanggal}</td>
                    <td className="p-3">{p.namaSantri}</td>
                    <td className="p-3">{p.kategori}</td>
                    <td className="p-3">{p.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <GrupKomunikasiCard
          judul="Kepala Sekolah ↔ Yayasan & Pengurus"
          deskripsi="Untuk Google Chat -- salin email, tambahkan manual ke space"
          anggota={grupYayasanPengurus}
        />
      </div>
    </div>
  );
}
