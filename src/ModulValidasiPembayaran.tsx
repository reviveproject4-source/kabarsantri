import React, { useEffect, useState } from 'react';
import { supabase, supabaseAktif } from './supabaseClient';
import { PembayaranSubmission } from './pembayaranTypes';
import { useLunaskanSppTertua, useLunaskanDaftarUlangTertua, useLunaskanUangPendaftaran } from './hooks/useTagihan';
import { useTambahDonasi } from './hooks/useKeuangan';
import { tanggalLokal as hariIni } from './tanggal';

export function ModulValidasiPembayaran() {
  const { mutateAsync: lunaskanSppTertua } = useLunaskanSppTertua();
  const { mutateAsync: lunaskanDaftarUlangTertua } =
    useLunaskanDaftarUlangTertua();
  const { mutateAsync: lunaskanUangPendaftaran } =
    useLunaskanUangPendaftaran();
  const { mutateAsync: tambahDonasi } = useTambahDonasi();

  const [daftar, setDaftar] = useState<PembayaranSubmission[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [sedangProses, setSedangProses] = useState<string | null>(null);

  const muat = async () => {
    if (!supabaseAktif) {
      setMemuat(false);
      return;
    }

    const { data } = await supabase
      .from('pembayaran_submission')
      .select('*')
      .order('created_at', { ascending: false });

    setDaftar((data as PembayaranSubmission[]) ?? []);
    setMemuat(false);
  };

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const terapkanKeLedger = async (row: PembayaranSubmission) => {
    const tanggal = hariIni();

    switch (row.jenis) {
      case 'SPP':
      case 'Tunggakan SPP':
        await lunaskanSppTertua({
          santriId: row.santri_id,
          tanggalBayar: tanggal,
          nominal: row.nominal,
        });
        break;
      case 'Tunggakan Daftar Ulang':
        await lunaskanDaftarUlangTertua({
          santriId: row.santri_id,
          tanggalBayar: tanggal,
          nominal: row.nominal,
        });
        break;
      case 'Tunggakan Uang Pendaftaran':
        await lunaskanUangPendaftaran({
          santriId: row.santri_id,
          tanggalBayar: tanggal,
          nominal: row.nominal,
        });
        break;
      case 'Donasi':
        await tambahDonasi({
          namaDonatur: `Wali ${row.nama_santri}`,
          jenis: 'Umum',
          nominal: row.nominal,
          keterangan: 'Dari pengajuan pembayaran Wali Santri',
        });
        break;
    }
  };

  const tampilkanError = (err: unknown) => {
    const pesan =
      err instanceof Error
        ? err.message
        : err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err);

    alert(`Gagal memproses pengajuan: ${pesan}`);
  };

  const setujui = async (row: PembayaranSubmission) => {
    if (sedangProses !== null) return;
    setSedangProses(row.id);

    try {
      await terapkanKeLedger(row);

      const { error } = await supabase
        .from('pembayaran_submission')
        .update({
          status: 'Disetujui',
          diverifikasi_pada: new Date().toISOString(),
        })
        .eq('id', row.id);

      if (error) throw error;

      await muat();
    } catch (err) {
      tampilkanError(err);
    } finally {
      setSedangProses(null);
    }
  };

  const tolak = async (row: PembayaranSubmission) => {
    if (sedangProses !== null) return;
    setSedangProses(row.id);

    try {
      const { error } = await supabase
        .from('pembayaran_submission')
        .update({
          status: 'Ditolak',
          diverifikasi_pada: new Date().toISOString(),
        })
        .eq('id', row.id);

      if (error) throw error;

      await muat();
    } catch (err) {
      tampilkanError(err);
    } finally {
      setSedangProses(null);
    }
  };

  if (!supabaseAktif) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Validasi Keuangan</h1>
        <div className="bg-white rounded-2xl border p-10 text-center">
          <div className="text-3xl mb-3">⚙️</div>
          <h3 className="font-semibold text-lg mb-2">
            Supabase Belum Dikonfigurasi
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file
            .env.local, lalu restart aplikasi.
          </p>
        </div>
      </div>
    );
  }

  const menunggu = daftar.filter((d) => d.status === 'Menunggu');
  const riwayat = daftar.filter((d) => d.status !== 'Menunggu');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Validasi Keuangan</h1>
      <p className="text-sm text-gray-500 mb-6">
        Pengajuan pembayaran dari wali santri, lengkap dengan bukti transfer.
      </p>

      <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto mb-6">
        <h3 className="font-semibold p-4 border-b bg-slate-50">
          Menunggu Verifikasi ({menunggu.length})
        </h3>
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-left">Santri</th>
              <th className="p-4 text-left">Jenis</th>
              <th className="p-4 text-left">Nominal</th>
              <th className="p-4 text-left">Bukti</th>
              <th className="p-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {memuat ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  Memuat...
                </td>
              </tr>
            ) : menunggu.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  Tidak ada pengajuan yang menunggu
                </td>
              </tr>
            ) : (
              menunggu.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-4">{row.created_at.slice(0, 10)}</td>
                  <td className="p-4">{row.nama_santri}</td>
                  <td className="p-4">{row.jenis}</td>
                  <td className="p-4">
                    Rp{row.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4">
                    <a href={row.bukti_url} target="_blank" rel="noreferrer">
                      <img
                        src={row.bukti_url}
                        alt="Bukti bayar"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    </a>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setujui(row)}
                        disabled={sedangProses !== null}
                        className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs disabled:opacity-50"
                      >
                        {sedangProses === row.id ? 'Memproses...' : 'Setujui'}
                      </button>
                      <button
                        onClick={() => tolak(row)}
                        disabled={sedangProses !== null}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
        <h3 className="font-semibold p-4 border-b bg-slate-50">
          Riwayat Verifikasi
        </h3>
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-left">Santri</th>
              <th className="p-4 text-left">Jenis</th>
              <th className="p-4 text-left">Nominal</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  Belum ada riwayat
                </td>
              </tr>
            ) : (
              riwayat.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-4">{row.created_at.slice(0, 10)}</td>
                  <td className="p-4">{row.nama_santri}</td>
                  <td className="p-4">{row.jenis}</td>
                  <td className="p-4">
                    Rp{row.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4">{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
