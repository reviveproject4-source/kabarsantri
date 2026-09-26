import React, { useEffect, useState } from 'react';
import { Pegawai, PresensiPegawai, TipeBiaya } from '../../types';
import { PresensiSaya } from '../../PresensiSaya';
import { GrafikGaris, WARNA_STATUS } from '../../Grafik';
import { tanggalLokal } from '../../tanggal';
import { supabase, supabaseAktif } from '../../supabaseClient';
import { PembayaranSubmission } from '../../pembayaranTypes';
import { useLunaskanSppTertua, useLunaskanDaftarUlangTertua, useLunaskanUangPendaftaran } from '../../hooks/useTagihan';
import { useTambahDonasi } from '../../hooks/useKeuangan';
import { useSantriList } from '../../hooks/useSantri';
import { usePegawaiList } from '../../hooks/usePegawai';
import { useSppList } from '../../hooks/useTagihan';
import { usePengeluaranList, useTambahPengeluaran } from '../../hooks/usePengeluaran';
import { usePotonganPayrollList, useTambahPotonganPayroll } from '../../hooks/usePotonganPayroll';
import { useLogKomunikasiWaliList, useTambahLogKomunikasiWali } from '../../hooks/useLogKomunikasiWali';
import { openDirectWA } from '../../teleponUtils';

interface Props {
  namaAktif: string;
  pegawaiAktif?: Pegawai;
  presensiPegawaiList?: PresensiPegawai[];
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
  presensiPegawaiList,
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

  const { data: santriList = [] } = useSantriList();
  const { data: pegawaiList = [] } = usePegawaiList();
  const { data: sppList = [] } = useSppList();
  const { data: pengeluaranList = [] } = usePengeluaranList();
  const { mutateAsync: tambahPengeluaran } = useTambahPengeluaran();
  const { data: potonganList = [] } = usePotonganPayrollList();
  const { mutateAsync: tambahPotongan } = useTambahPotonganPayroll();
  const { data: logKomunikasiList = [] } = useLogKomunikasiWaliList();
  const { mutateAsync: tambahLogKomunikasi } = useTambahLogKomunikasiWali();

  const [submissions, setSubmissions] = useState<PembayaranSubmission[]>([]);
  const [memuatSubmission, setMemuatSubmission] = useState(true);
  const [sedangProses, setSedangProses] = useState<string | null>(null);

  // Modals & Form State for Communication
  const [showModalTagihan, setShowModalTagihan] = useState(false);
  const [santriIdTagihan, setSantriIdTagihan] = useState<number | ''>('');
  const [jenisTagihan, setJenisTagihan] = useState('SPP');
  const [periodeTagihan, setPeriodeTagihan] = useState('September 2026');
  const [nominalTagihan, setNominalTagihan] = useState<number>(500000);
  const [pesanTagihan, setPesanTagihan] = useState('');

  const [showModalBuktiSpp, setShowModalBuktiSpp] = useState(false);
  const [sppIdBukti, setSppIdBukti] = useState<number | ''>('');

  // Form State for Expense
  const [showFormPengeluaran, setShowFormPengeluaran] = useState(false);
  const [kategoriPengeluaran, setKategoriPengeluaran] = useState('Consumable / Operasional');
  const [nominalPengeluaran, setNominalPengeluaran] = useState<number>(500000);
  const [tipeBiayaPengeluaran, setTipeBiayaPengeluaran] = useState<TipeBiaya>('VARIABLE');
  const [sumberDanaPengeluaran, setSumberDanaPengeluaran] = useState('Kas Utama');
  const [keteranganPengeluaran, setKeteranganPengeluaran] = useState('');

  // Form State for Payroll Deduction
  const [showFormPotongan, setShowFormPotongan] = useState(false);
  const [pegawaiIdPotongan, setPegawaiIdPotongan] = useState<number | ''>('');
  const [periodePotongan, setPeriodePotongan] = useState('September 2026');
  const [jenisPotongan, setJenisPotongan] = useState('Ketidakhadiran');
  const [nominalPotongan, setNominalPotongan] = useState<number>(100000);
  const [keteranganPotongan, setKeteranganPotongan] = useState('');

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

  // Workflow Handlers
  const handleKirimTagihanWA = async () => {
    if (!santriIdTagihan) {
      alert('Pilih Santri / Wali terlebih dahulu');
      return;
    }

    const santri = santriList.find((s) => s.id === Number(santriIdTagihan));
    if (!santri) return;

    const noHpTarget = santri.noHpAyah || santri.noHpIbu || '081234567890';
    const namaWali = santri.namaAyah || santri.namaIbu || `Wali ${santri.nama}`;

    const tatananPesan = `Assalamu'alaikum Wr. Wb.\nBapak/Ibu *${namaWali}* (Wali dari *${santri.nama}* - Kelas ${santri.kelas}).\n\nPemberitahuan Tagihan *${jenisTagihan}* Periode *${periodeTagihan}*:\nNominal: *Rp${nominalTagihan.toLocaleString('id-ID')}*\n${pesanTagihan ? `Keterangan: ${pesanTagihan}\n` : ''}\nMohon melakukan pembayaran melalui Portal Aplikasi KabarSantri atau via Transfer. Terima kasih.\n\n_Bagian Keuangan Pesantren KabarSantri_`;

    openDirectWA(noHpTarget, tatananPesan);

    await tambahLogKomunikasi({
      petugasKeuangan: namaAktif,
      santriId: santri.id,
      waliNama: namaWali,
      noHpWali: noHpTarget,
      jenisPesan: 'Tagihan',
      referensiTransaksi: `${jenisTagihan} ${periodeTagihan}`,
      isiPesan: tatananPesan,
    });

    setShowModalTagihan(false);
    alert('Aplikasi WhatsApp dibuka. Protokol WA telah dicatat di sistem (WA PROTOCOL INVOKED).');
  };

  const handleKirimBuktiSppWA = async () => {
    if (!sppIdBukti) {
      alert('Pilih Transaksi SPP terlebih dahulu');
      return;
    }

    const itemSpp = sppList.find((s: any) => s.id === Number(sppIdBukti));
    if (!itemSpp) return;

    const santri = santriList.find((st: any) => st.id === itemSpp.santriId);
    const namaSantri = santri?.nama || 'Santri';
    const nisSantri = santri?.nis || '-';
    const noHpTarget = santri?.noHpAyah || santri?.noHpIbu || '081234567890';
    const namaWali = santri?.namaAyah || santri?.namaIbu || `Wali ${namaSantri}`;

    const tatananPesan = `*BUKTI PEMBAYARAN SPP RESMI - KABARSANTRI*\n\nNomor Bukti: #SPP-${itemSpp.id}\nSantri: *${namaSantri}* (NIS: ${nisSantri})\nPeriode SPP: *${itemSpp.periode}*\nNominal: *Rp${itemSpp.nominal.toLocaleString('id-ID')}*\nStatus: *${itemSpp.status.toUpperCase()}*\nTanggal Bayar: ${itemSpp.tanggalBayar || tanggalLokal()}\nPetugas Keuangan: ${namaAktif}\n\nTerima kasih atas Pembayaran SPP Tepat Waktu. Jazakumullah Khairan.`;

    openDirectWA(noHpTarget, tatananPesan);

    await tambahLogKomunikasi({
      petugasKeuangan: namaAktif,
      santriId: itemSpp.santriId,
      waliNama: namaWali,
      noHpWali: noHpTarget,
      jenisPesan: 'Bukti SPP',
      referensiTransaksi: `SPP #${itemSpp.id} (${itemSpp.periode})`,
      isiPesan: tatananPesan,
    });

    setShowModalBuktiSpp(false);
    alert('Bukti SPP WhatsApp dibuka & dicatat di sistem (WA PROTOCOL INVOKED).');
  };

  const handleSimpanPengeluaran = async () => {
    if (!nominalPengeluaran || nominalPengeluaran <= 0) {
      alert('Isi nominal pengeluaran dengan benar');
      return;
    }

    await tambahPengeluaran({
      tanggal: tanggalLokal(),
      kategori: kategoriPengeluaran,
      nominal: nominalPengeluaran,
      tipeBiaya: tipeBiayaPengeluaran,
      sumberDana: sumberDanaPengeluaran,
      keterangan: keteranganPengeluaran || 'Pengeluaran operasional',
      dicatatOleh: namaAktif,
    });

    setShowFormPengeluaran(false);
    setKeteranganPengeluaran('');
    alert('Pengeluaran berhasil disimpan ke database sistem.');
  };

  const handleSimpanPotongan = async () => {
    if (!pegawaiIdPotongan) {
      alert('Pilih pegawai terlebih dahulu');
      return;
    }
    if (!nominalPotongan || nominalPotongan <= 0) {
      alert('Isi nominal potongan');
      return;
    }

    await tambahPotongan({
      pegawaiId: Number(pegawaiIdPotongan),
      periode: periodePotongan,
      jenisPotongan: jenisPotongan,
      nominal: nominalPotongan,
      keterangan: keteranganPotongan || 'Potongan payroll',
      petugasKeuangan: namaAktif,
    });

    setShowFormPotongan(false);
    setKeteranganPotongan('');
    alert('Potongan payroll berhasil dicatat.');
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
              Proses validasi pembayaran online wali santri, kelola kas SPP, daftar ulang, donasi, pengeluaran, serta potongan payroll ({tanggalLokal()}).
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

      {/* Absen Pribadi Staf Keuangan */}
      <PresensiSaya pegawaiId={pegawaiAktif?.id ?? null} presensiPegawai={presensiPegawaiList ?? []} />

      {/* QUICK OPERATIONAL WORKFLOW ACTION BUTTONS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Aksi Operasional Keuangan Instant</h3>
            <p className="text-xs text-slate-400">Kirim tagihan, bukti SPP, input pengeluaran &amp; potongan payroll</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowModalTagihan(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
          >
            <span>📱</span> Kirim Tagihan WA
          </button>
          <button
            onClick={() => setShowModalBuktiSpp(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
          >
            <span>🧾</span> Kirim Bukti SPP WA
          </button>
          <button
            onClick={() => setShowFormPengeluaran(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
          >
            <span>💸</span> Input Pengeluaran
          </button>
          <button
            onClick={() => setShowFormPotongan(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
          >
            <span>✂️</span> Input Potongan Payroll
          </button>
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
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pengeluaran</h3>
              <span className="text-base">💸</span>
            </div>
            <p className="text-2xl font-black text-rose-700 tracking-tight mt-2">
              Rp{pengeluaranList.reduce((acc, p) => acc + p.nominal, 0).toLocaleString('id-ID')}
            </p>
            <div className="text-[11px] text-rose-600 font-medium mt-1">Total Biaya Operasional</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Potongan Payroll</h3>
              <span className="text-base">✂️</span>
            </div>
            <p className="text-2xl font-black text-purple-700 tracking-tight mt-2">
              Rp{potonganList.reduce((acc, p) => acc + p.nominal, 0).toLocaleString('id-ID')}
            </p>
            <div className="text-[11px] text-purple-600 font-medium mt-1">Total Potongan Gaji Staf</div>
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

      {/* PENGELUARAN & POTONGAN PAYROLL SUMMARY TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Pengeluaran */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>💸 Daftar Pengeluaran Operasional</span>
            </h3>
            <button
              onClick={() => setShowFormPengeluaran(true)}
              className="text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 hover:bg-amber-100 transition"
            >
              + Input Pengeluaran
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b">
                <tr>
                  <th className="p-2.5">Kategori</th>
                  <th className="p-2.5">Tipe Biaya</th>
                  <th className="p-2.5">Nominal</th>
                  <th className="p-2.5">Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pengeluaranList.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2.5 font-medium">{p.kategori}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${p.tipeBiaya === 'FIXED' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}`}>
                        {p.tipeBiaya}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">Rp{p.nominal.toLocaleString('id-ID')}</td>
                    <td className="p-2.5 text-slate-500">{p.sumberDana}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Log Komunikasi WA */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>📱 Riwayat WhatsApp Wali Santri</span>
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Protocol Invoked
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b">
                <tr>
                  <th className="p-2.5">Wali / Santri</th>
                  <th className="p-2.5">Jenis</th>
                  <th className="p-2.5">Status Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logKomunikasiList.map((log) => (
                  <tr key={log.id}>
                    <td className="p-2.5">
                      <div className="font-bold text-slate-800">{log.waliNama}</div>
                      <div className="text-[10px] text-slate-400">{log.tanggalWaktu}</div>
                    </td>
                    <td className="p-2.5">
                      <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded">
                        {log.jenisPesan}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[10px] text-emerald-700 font-bold">
                      {log.statusDelivery}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL INPUT TAGIHAN WA */}
      {showModalTagihan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg">📱 Kirim Tagihan WhatsApp Wali</h3>
              <button onClick={() => setShowModalTagihan(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Santri / Wali</label>
              <select
                value={santriIdTagihan}
                onChange={(e) => setSantriIdTagihan(e.target.value ? Number(e.target.value) : '')}
                className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="">-- Pilih Santri --</option>
                {santriList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} (Kelas {s.kelas}) - Wali: {s.namaAyah || s.namaIbu || 'Wali'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jenis Tagihan</label>
                <select
                  value={jenisTagihan}
                  onChange={(e) => setJenisTagihan(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="SPP">SPP Bulanan</option>
                  <option value="Daftar Ulang">Daftar Ulang</option>
                  <option value="Uang Pendaftaran">Uang Pendaftaran</option>
                  <option value="Tunggakan">Tunggakan Pembayaran</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Periode</label>
                <input
                  type="text"
                  value={periodeTagihan}
                  onChange={(e) => setPeriodeTagihan(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
              <input
                type="number"
                value={nominalTagihan}
                onChange={(e) => setNominalTagihan(Number(e.target.value))}
                className="w-full border rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pesan Tambahan (Opsional)</label>
              <textarea
                value={pesanTagihan}
                onChange={(e) => setPesanTagihan(e.target.value)}
                placeholder="Misal: Harap transfer sebelum tanggal 10..."
                className="w-full border rounded-xl px-3 py-2 text-xs h-16"
              />
            </div>

            <button
              onClick={handleKirimTagihanWA}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
            >
              📱 Buka WhatsApp &amp; Kirim Tagihan
            </button>
          </div>
        </div>
      )}

      {/* MODAL INPUT BUKTI SPP WA */}
      {showModalBuktiSpp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg">🧾 Kirim Bukti SPP WhatsApp</h3>
              <button onClick={() => setShowModalBuktiSpp(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Transaksi SPP</label>
              <select
                value={sppIdBukti}
                onChange={(e) => setSppIdBukti(e.target.value ? Number(e.target.value) : '')}
                className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="">-- Pilih Transaksi SPP --</option>
                {sppList.map((s: any) => {
                  const santri = santriList.find((st) => st.id === s.santriId);
                  return (
                    <option key={s.id} value={s.id}>
                      #{s.id} - {santri?.nama || 'Santri'} - {s.periode} (Rp{s.nominal.toLocaleString('id-ID')}) - {s.status}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={handleKirimBuktiSppWA}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
            >
              🧾 Kirim Bukti SPP via WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* MODAL INPUT PENGELUARAN */}
      {showFormPengeluaran && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg">💸 Input Pengeluaran Operasional</h3>
              <button onClick={() => setShowFormPengeluaran(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori Pengeluaran</label>
              <select
                value={kategoriPengeluaran}
                onChange={(e) => setKategoriPengeluaran(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="Listrik & Air">Listrik &amp; Air (Fixed)</option>
                <option value="Konsumsi Santri">Konsumsi Santri (Variable)</option>
                <option value="Kegiatan Santri">Kegiatan Santri (Variable)</option>
                <option value="Perbaikan Infrastruktur">Perbaikan Infrastruktur (Variable)</option>
                <option value="Operasional Kantor">Operasional Kantor (Fixed)</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipe Biaya (Fixed vs Variable)</label>
              <select
                value={tipeBiayaPengeluaran}
                onChange={(e) => setTipeBiayaPengeluaran(e.target.value as TipeBiaya)}
                className="w-full border rounded-xl px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50"
              >
                <option value="FIXED">FIXED COST (Biaya Tetap Berulang)</option>
                <option value="VARIABLE">VARIABLE COST (Biaya Variabel Operasional)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
              <input
                type="number"
                value={nominalPengeluaran}
                onChange={(e) => setNominalPengeluaran(Number(e.target.value))}
                className="w-full border rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sumber Dana / Kas</label>
              <input
                type="text"
                value={sumberDanaPengeluaran}
                onChange={(e) => setSumberDanaPengeluaran(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan</label>
              <input
                type="text"
                value={keteranganPengeluaran}
                onChange={(e) => setKeteranganPengeluaran(e.target.value)}
                placeholder="Keterangan pengeluaran..."
                className="w-full border rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <button
              onClick={handleSimpanPengeluaran}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
            >
              💾 Simpan Pengeluaran Keuangan
            </button>
          </div>
        </div>
      )}

      {/* MODAL INPUT POTONGAN PAYROLL */}
      {showFormPotongan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg">✂️ Input Potongan Payroll Staf</h3>
              <button onClick={() => setShowFormPotongan(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Pegawai / Staf</label>
              <select
                value={pegawaiIdPotongan}
                onChange={(e) => setPegawaiIdPotongan(e.target.value ? Number(e.target.value) : '')}
                className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="">-- Pilih Pegawai --</option>
                {pegawaiList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.jabatan}) - NIP: {p.nip || '-'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Periode</label>
                <input
                  type="text"
                  value={periodePotongan}
                  onChange={(e) => setPeriodePotongan(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jenis Potongan</label>
                <select
                  value={jenisPotongan}
                  onChange={(e) => setJenisPotongan(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="Ketidakhadiran">Ketidakhadiran / Keterlambatan</option>
                  <option value="Pinjaman / Kasbon">Pinjaman / Kasbon</option>
                  <option value="Koreksi Payroll">Koreksi Payroll</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nominal Potongan (Rp)</label>
              <input
                type="number"
                value={nominalPotongan}
                onChange={(e) => setNominalPotongan(Number(e.target.value))}
                className="w-full border rounded-xl px-3 py-2 text-xs font-bold text-purple-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan</label>
              <input
                type="text"
                value={keteranganPotongan}
                onChange={(e) => setKeteranganPotongan(e.target.value)}
                placeholder="Alasan potongan..."
                className="w-full border rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <button
              onClick={handleSimpanPotongan}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
            >
              ✂️ Catat Potongan Payroll
            </button>
          </div>
        </div>
      )}

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
