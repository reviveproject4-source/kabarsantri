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

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Validasi Keuangan & Transfer Wali</h1>
            <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200">
              {menunggu.length} Menunggu Verifikasi
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verifikasi pengajuan pembayaran SPP, Daftar Ulang, dan Donasi dari wali santri beserta bukti transfer.
          </p>
        </div>
      </div>

      {/* Menunggu Verifikasi Card Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-amber-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              ⏳
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Menunggu Verifikasi Staf Keuangan</h3>
              <p className="text-xs text-slate-500">Periksa kesesuaian nominal dan keabsahan foto resi transfer</p>
            </div>
          </div>
          <span className="bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1 rounded-full border border-amber-200">
            {menunggu.length} Antrean
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Waktu Pengajuan</th>
                <th className="p-4 px-6">Nama Santri</th>
                <th className="p-4 px-6">Kategori Tagihan</th>
                <th className="p-4 px-6">Nominal Transfer</th>
                <th className="p-4 px-6">Bukti Transfer</th>
                <th className="p-4 px-6 text-right">Tindakan Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {memuat ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-slate-400">
                    Memuat daftar pengajuan pembayaran...
                  </td>
                </tr>
              ) : menunggu.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-slate-400">
                    🎉 Tidak ada antrean pembayaran yang menunggu verifikasi.
                  </td>
                </tr>
              ) : (
                menunggu.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 px-6 text-slate-500 text-xs font-medium">
                      {new Date(row.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="p-4 px-6 font-bold text-slate-800 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                        {row.nama_santri[0]}
                      </div>
                      {row.nama_santri}
                    </td>

                    <td className="p-4 px-6">
                      <span className="bg-teal-50 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-teal-200/60">
                        {row.jenis}
                      </span>
                      {row.keterangan && (
                        <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">{row.keterangan}</div>
                      )}
                    </td>

                    <td className="p-4 px-6 font-black text-emerald-700 text-base">
                      Rp{row.nominal.toLocaleString('id-ID')}
                    </td>

                    <td className="p-4 px-6">
                      <button
                        onClick={() => setPreviewImage(row.bukti_url)}
                        className="group relative block overflow-hidden rounded-xl border border-slate-200 shadow-sm transition hover:shadow-md"
                      >
                        <img
                          src={row.bukti_url}
                          alt="Bukti transfer"
                          className="w-14 h-14 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold">
                          Zoom 🔍
                        </div>
                      </button>
                    </td>

                    <td className="p-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setujui(row)}
                          disabled={sedangProses !== null}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm disabled:opacity-50 transition-transform active:scale-95 flex items-center gap-1"
                        >
                          {sedangProses === row.id ? 'Memproses...' : '✓ Setujui'}
                        </button>
                        <button
                          onClick={() => tolak(row)}
                          disabled={sedangProses !== null}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-2 rounded-xl text-xs disabled:opacity-50 transition"
                        >
                          ✕ Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Riwayat Verifikasi Card Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">Riwayat Hasil Verifikasi</h3>
          <span className="text-xs text-slate-500 font-medium">Total: {riwayat.length} Transaksi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Tanggal Verifikasi</th>
                <th className="p-4 px-6">Nama Santri</th>
                <th className="p-4 px-6">Kategori</th>
                <th className="p-4 px-6">Nominal</th>
                <th className="p-4 px-6">Status Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {riwayat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-400">
                    Belum ada riwayat verifikasi pembayaran.
                  </td>
                </tr>
              ) : (
                riwayat.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 px-6 text-slate-500 text-xs font-medium">
                      {row.diverifikasi_pada
                        ? new Date(row.diverifikasi_pada).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : row.created_at.slice(0, 10)}
                    </td>
                    <td className="p-4 px-6 font-bold text-slate-800">{row.nama_santri}</td>
                    <td className="p-4 px-6 text-slate-600 font-medium">{row.jenis}</td>
                    <td className="p-4 px-6 font-mono font-bold text-slate-800">
                      Rp{row.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        row.status === 'Disetujui'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.status === 'Disetujui' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Pratinjau Bukti Transfer</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-100 rounded-2xl overflow-hidden max-h-[70vh] flex items-center justify-center border">
              <img src={previewImage} alt="Bukti Transfer" className="max-h-[65vh] w-auto object-contain" />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setPreviewImage(null)}
                className="bg-slate-900 text-white font-semibold px-5 py-2.5 rounded-xl text-xs"
              >
                Tutup Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
