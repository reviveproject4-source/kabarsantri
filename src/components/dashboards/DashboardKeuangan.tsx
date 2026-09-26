import React, { useEffect, useState } from 'react';
import { Pegawai } from '../../types';
import { GrafikGaris, WARNA_STATUS } from '../../Grafik';
import { tanggalLokal } from '../../tanggal';
import { supabase, supabaseAktif } from '../../supabaseClient';
import { PembayaranSubmission } from '../../pembayaranTypes';
import { useLunaskanSppTertua, useLunaskanDaftarUlangTertua, useLunaskanUangPendaftaran } from '../../hooks/useTagihan';
import { useTambahDonasi } from '../../hooks/useKeuangan';

interface Props {
  namaAktif: string;
  pegawaiAktif?: Pegawai;
  setActiveTab: (tab: string) => void;
  totalPemasukan: number;
  totalDonasi: number;
  totalDaftarUlang: number;
  totalUangPendaftaran: number;
  trenPerBulan: Array<{ total: number }>;
  kategoriBulanKeuangan: string[];
}

export function DashboardKeuangan({
  namaAktif,
  pegawaiAktif,
  setActiveTab,
  totalPemasukan,
  totalDonasi,
  totalDaftarUlang,
  totalUangPendaftaran,
  trenPerBulan,
  kategoriBulanKeuangan,
}: Props) {
  const { mutateAsync: lunaskanSppTertua } = useLunaskanSppTertua();
  const { mutateAsync: lunaskanDaftarUlangTertua } = useLunaskanDaftarUlangTertua();
  const { mutateAsync: lunaskanUangPendaftaran } = useLunaskanUangPendaftaran();
  const { mutateAsync: tambahDonasi } = useTambahDonasi();

  const [submissions, setSubmissions] = useState<PembayaranSubmission[]>([]);
  const [memuatSubmission, setMemuatSubmission] = useState(true);
  const [sedangProses, setSedangProses] = useState<string | null>(null);

  const muatSubmissions = async () => {
    if (!supabaseAktif) {
      setMemuatSubmission(false);
      return;
    }

    const { data } = await supabase
      .from('pembayaran_submission')
      .select('*')
      .order('created_at', { ascending: false });

    setSubmissions((data as PembayaranSubmission[]) ?? []);
    setMemuatSubmission(false);
  };

  useEffect(() => {
    muatSubmissions();
  }, []);

  const terapkanKeLedger = async (row: PembayaranSubmission) => {
    const tanggal = tanggalLokal();

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

  const handleSetujui = async (row: PembayaranSubmission) => {
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
      await muatSubmissions();
    } catch (err: any) {
      alert(`Gagal memproses validasi: ${err?.message || err}`);
    } finally {
      setSedangProses(null);
    }
  };

  const handleTolak = async (id: string) => {
    if (sedangProses !== null) return;
    setSedangProses(id);

    try {
      const { error } = await supabase
        .from('pembayaran_submission')
        .update({
          status: 'Ditolak',
          diverifikasi_pada: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await muatSubmissions();
    } catch (err: any) {
      alert(`Gagal menolak pengajuan: ${err?.message || err}`);
    } finally {
      setSedangProses(null);
    }
  };

  const pendingSubmissions = submissions.filter((s) => s.status === 'Menunggu');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Card Keuangan */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20 border border-blue-600/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-400/20 text-blue-200 text-xs px-3 py-1 rounded-full font-bold border border-blue-300/30 uppercase tracking-wider">
                💰 Dashboard Bendahara &amp; Keuangan
              </span>
              <span className="bg-white/10 text-blue-100 text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                Operational Financial Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Selamat datang kembali, {namaAktif}!
            </h1>
            <p className="text-blue-100/90 text-xs sm:text-sm mt-1.5 font-normal max-w-2xl">
              Proses validasi pembayaran online wali santri, kelola kas SPP, daftar ulang, donasi, dan pembukuan lembaga ({tanggalLokal()}).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-left md:text-right shrink-0">
            <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Total Pemasukan Kas</div>
            <div className="text-2xl font-black text-amber-300 flex items-center gap-1.5 md:justify-end">
              💰 Rp{totalPemasukan.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Summary Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ringkasan Penerimaan Kas &amp; Keuangan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#0A4ABF] to-blue-900 p-5 rounded-2xl text-white shadow-lg shadow-blue-900/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wider">Total Pemasukan</h3>
              <span className="text-base">💰</span>
            </div>
            <p className="text-2xl font-black tracking-tight mt-2">
              Rp{totalPemasukan.toLocaleString('id-ID')}
            </p>
            <div className="text-[11px] text-blue-200 mt-1">Akumulasi Seluruh Pembayaran</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Validasi Menunggu</h3>
              <span className="text-base">⏳</span>
            </div>
            <p className={`text-2xl font-black tracking-tight mt-2 ${pendingSubmissions.length > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {pendingSubmissions.length} <span className="text-xs font-normal text-slate-400">Bukti</span>
            </p>
            <div className="text-[11px] text-amber-600 font-medium mt-1">Bukti Transfer Wali</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Ulang</h3>
              <span className="text-base">📝</span>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-2">
              Rp{totalDaftarUlang.toLocaleString('id-ID')}
            </p>
            <div className="text-[11px] text-teal-600 font-medium mt-1">Registrasi Ulang</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Donasi &amp; Wakaf</h3>
              <span className="text-base">🤲</span>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-2">
              Rp{totalDonasi.toLocaleString('id-ID')}
            </p>
            <div className="text-[11px] text-indigo-600 font-medium mt-1">Infaq Lembaga</div>
          </div>
        </div>
      </div>

      {/* OPERATIONAL VALIDATION WORKFLOW TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>Validasi Bukti Pembayaran Online (Operasional Langsung)</span>
              {pendingSubmissions.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                  {pendingSubmissions.length} Menunggu Verifikasi
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Verifikasi bukti transfer dari Wali Santri langsung ke ledger keuangan</p>
          </div>
          <button
            onClick={() => setActiveTab('validasi-pembayaran')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition self-start sm:self-auto"
          >
            Modul Validasi Full ➔
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Nama Santri</th>
                <th className="p-4 px-6">Jenis Pembayaran</th>
                <th className="p-4 px-6">Nominal</th>
                <th className="p-4 px-6">Status</th>
                <th className="p-4 px-6">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {memuatSubmission ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-400">
                    Memuat data pembayaran...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-400">
                    Belum ada pengajuan bukti pembayaran dari Wali Santri
                  </td>
                </tr>
              ) : (
                submissions.slice(0, 8).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 px-6 font-semibold text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                        💳
                      </div>
                      <div>
                        <div>{row.nama_santri}</div>
                        <div className="text-[10px] text-slate-400">{new Date(row.created_at).toLocaleString('id-ID')}</div>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-slate-600 font-medium text-xs">{row.jenis}</td>
                    <td className="p-4 px-6 text-slate-900 font-bold text-xs">
                      Rp{row.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          row.status === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : row.status === 'Ditolak'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 px-6">
                      {row.status === 'Menunggu' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSetujui(row)}
                            disabled={sedangProses === row.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition disabled:opacity-50"
                          >
                            ✓ Verifikasi &amp; Cetak
                          </button>
                          <button
                            onClick={() => handleTolak(row.id)}
                            disabled={sedangProses === row.id}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition disabled:opacity-50"
                          >
                            ✕ Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Telah diproses</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modul Shortcuts Bar */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Modul &amp; Pembukuan Keuangan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('spp')}
            className="bg-white hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-blue-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              💳
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Pembayaran SPP</div>
              <div className="text-[10px] text-slate-400">Modul SPP</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('daftar-ulang')}
            className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-emerald-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📝
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Daftar Ulang</div>
              <div className="text-[10px] text-slate-400">Registrasi Tahunan</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('uang-pendaftaran')}
            className="bg-white hover:bg-cyan-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-cyan-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🧾
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">Uang Pendaftaran</div>
              <div className="text-[10px] text-slate-400">Santri Baru</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('uang-jajan')}
            className="bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-amber-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              💵
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Uang Jajan Santri</div>
              <div className="text-[10px] text-slate-400">Kas Kantin Santri</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tabungan')}
            className="bg-white hover:bg-teal-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-teal-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🏦
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">Tabungan Santri</div>
              <div className="text-[10px] text-slate-400">Simpanan Santri</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('donasi')}
            className="bg-white hover:bg-rose-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-rose-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🤲
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-rose-700 transition-colors">Donasi &amp; Wakaf</div>
              <div className="text-[10px] text-slate-400">Infaq Lembaga</div>
            </div>
          </button>
        </div>
      </div>

      {/* Financial Trend Analytics Chart */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Grafik Tren Penerimaan Keuangan</h3>
            <p className="text-xs text-slate-400">
              Kilas balik total penerimaan 6 bulan terakhir
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full border border-slate-200">
            6 Bulan Terakhir
          </span>
        </div>
        <div className="pt-2">
          <GrafikGaris
            kategori={kategoriBulanKeuangan}
            nilai={trenPerBulan.map((b) => b.total)}
            warna={WARNA_STATUS.baik}
          />
        </div>
      </div>
    </div>
  );
}
