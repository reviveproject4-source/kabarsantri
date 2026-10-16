'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ShoppingBag,
  CreditCard,
  Landmark,
  DollarSign,
  X
} from 'lucide-react';
import { 
  getSharedRekeningList, 
  saveSharedTransaksiKas, 
  RekeningPesantren 
} from '@/lib/sharedDataStore';

export default function UangJajanSantriPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalTopUp, setModalTopUp] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<any>(null);
  const [nominalTopUp, setNominalTopUp] = useState(50000);
  const [metodeTopUp, setMetodeTopUp] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [rekeningId, setRekeningId] = useState('');
  const [catatanTopUp, setCatatanTopUp] = useState('');
  const [rekeningList, setRekeningList] = useState<RekeningPesantren[]>([]);
  const [notif, setNotif] = useState('');

  const [wallets, setWallets] = useState([
    {
      id: 'w-1',
      santri: 'Muhammad Al-Fatih',
      nis: '202601001',
      kelas: '7A Tahfidz Sains',
      saldo: 65000,
      limit_harian: 20000,
      pengeluaran_hari_ini: 12000,
      status: 'Aktif',
    },
    {
      id: 'w-2',
      santri: 'Fathimah Az-Zahra',
      nis: '202602004',
      kelas: '7B Tahfidz Sains',
      saldo: 120000,
      limit_harian: 25000,
      pengeluaran_hari_ini: 5000,
      status: 'Aktif',
    },
    {
      id: 'w-3',
      santri: 'Ahmad Zaki Mubarak',
      nis: '202601015',
      kelas: '8A Unggulan',
      saldo: 45000,
      limit_harian: 20000,
      pengeluaran_hari_ini: 18000,
      status: 'Aktif',
    },
    {
      id: 'w-4',
      santri: 'Bilal Habasyi',
      nis: '202601018',
      kelas: '8B Unggulan',
      saldo: 15000,
      limit_harian: 20000,
      pengeluaran_hari_ini: 0,
      status: 'Aktif',
    },
    {
      id: 'w-5',
      santri: 'Fatih Al-Ayyubi',
      nis: '202601021',
      kelas: '9 Putra',
      saldo: 85000,
      limit_harian: 30000,
      pengeluaran_hari_ini: 15000,
      status: 'Aktif',
    },
  ]);

  useEffect(() => {
    const list = getSharedRekeningList();
    setRekeningList(list);
    // Prioritaskan rekening fungsi kantin_tabungan jika ada
    const tabBank = list.find(r => r.fungsi === 'kantin_tabungan') || list[0];
    if (tabBank) {
      setRekeningId(tabBank.id);
    }
  }, []);

  const handleBukaTopUp = (w: any) => {
    setSelectedSantri(w);
    setNominalTopUp(50000);
    setMetodeTopUp('CASH');
    setCatatanTopUp('');
    setModalTopUp(true);
  };

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;

    const nominal = Number(nominalTopUp);
    const rek = rekeningList.find(r => r.id === rekeningId);
    const labelMetode = metodeTopUp === 'CASH'
      ? 'Tunai Kasir (Cash)'
      : `Transfer ${rek?.nama_bank || 'Bank'}`;

    // 1. Update saldo lokal
    setWallets(wallets.map(w => {
      if (w.id === selectedSantri.id) {
        return { ...w, saldo: w.saldo + nominal };
      }
      return w;
    }));

    // 2. Simpan ke Unified Kas Ledger
    saveSharedTransaksiKas({
      nomor_transaksi: `TRX-${Date.now().toString().slice(-6)}`,
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      tipe: 'MASUK',
      kategori: 'TABUNGAN',
      kategori_label: 'Top-Up Tabungan Santri',
      nama_pihak: selectedSantri.santri,
      nis: selectedSantri.nis,
      nominal: nominal,
      metode: metodeTopUp,
      rekening_id: metodeTopUp === 'TRANSFER' ? rekeningId : undefined,
      rekening_nama: metodeTopUp === 'TRANSFER' ? `${rek?.nama_bank} - ${rek?.nomor_rekening}` : undefined,
      keterangan: catatanTopUp || `Top-up Tabungan/Uang Jajan an. ${selectedSantri.santri}`,
      petugas: 'Bagian Kesantrian / Kasir',
    });

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.from('dompet_santri_v2').insert({
        santri_id: selectedSantri.id,
        jenis_transaksi: 'topup',
        nominal: nominal,
        keterangan: `Top-up Saldo via ${labelMetode}`,
      });
    } catch {
      // fallback
    }

    setModalTopUp(false);
    setNotif(`✓ Top-up saldo Tabungan ${selectedSantri.santri} sebesar Rp ${nominal.toLocaleString('id-ID')} via ${labelMetode} berhasil dibukukan!`);
    setTimeout(() => setNotif(''), 6000);
  };

  const filteredWallets = wallets.filter(w => 
    w.santri.toLowerCase().includes(searchTerm.toLowerCase()) || w.nis.includes(searchTerm)
  );

  const totalSaldoBeredar = wallets.reduce((acc, curr) => acc + curr.saldo, 0);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Uang Jajan Santri (E-Pocket Kantin)</h1>
          <p className="text-xs text-slate-500">
            Sistem Dompet Digital Santri Non-Tunai (*Cashless*) untuk Belanja di Kantin &amp; Koperasi Pesantren
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/finance/validasi"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>Validasi Top-Up Transfer Wali</span>
          </Link>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block">Total Saldo E-Pocket Beredar</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
            Rp {totalSaldoBeredar.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-slate-400">Tersimpan di Rekening Amanah Yayasan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block">Transaksi Kantin Hari Ini</span>
          <span className="text-2xl font-bold text-slate-800 mt-1 block">42 Transaksi</span>
          <span className="text-[11px] text-emerald-600 font-semibold">Total Belanja: Rp 385.000</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block">Proteksi Limit Harian</span>
          <span className="text-2xl font-bold text-slate-800 mt-1 block">Aktif 100%</span>
          <span className="text-[11px] text-blue-600 font-semibold">Mencegah Santri Boros Belanja</span>
        </div>
      </div>

      {/* Table & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-800">Daftar Dompet Santri ({filteredWallets.length})</h3>
          
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari santri atau NIS..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Santri / NIS</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Saldo Dompet E-Pocket</th>
                <th className="py-3 px-4">Limit Belanja Harian</th>
                <th className="py-3 px-4">Belanja Hari Ini</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWallets.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{w.santri}</span>
                    <span className="font-mono text-[10px] text-slate-400">{w.nis}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{w.kelas}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-emerald-700">
                    Rp {w.saldo.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    Rp {w.limit_harian.toLocaleString('id-ID')} / hari
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    Rp {w.pengeluaran_hari_ini.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleBukaTopUp(w)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition flex items-center space-x-1 ml-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Top-Up Saldo</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Top Up Saldo (Pemisahan Cash vs Transfer Bank) */}
      {modalTopUp && selectedSantri && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Top-Up Saldo Tabungan Santri</h3>
                <p className="text-xs text-slate-500">Santri: <strong>{selectedSantri.santri}</strong> ({selectedSantri.nis})</p>
              </div>
              <button onClick={() => setModalTopUp(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nominal Top-Up (Rp):</label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={5000}
                  value={nominalTopUp}
                  onChange={(e) => setNominalTopUp(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* SALURAN PENERIMAAN: CASH VS TRANSFER */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Saluran Pembayaran (Wajib Dipilih Tanpa Tertukar):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodeTopUp('CASH')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      metodeTopUp === 'CASH'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="font-bold text-xs">💵 Tunai (Cash)</span>
                    <span className="text-[10px] text-slate-500 mt-1">Uang fisik diserahkan ke kasir kantin/pondok</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodeTopUp('TRANSFER')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      metodeTopUp === 'TRANSFER'
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="font-bold text-xs">🏦 Transfer Bank</span>
                    <span className="text-[10px] text-slate-500 mt-1">Transfer m-Banking orang tua ke rekening</span>
                  </button>
                </div>
              </div>

              {metodeTopUp === 'TRANSFER' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rekening Bank Tujuan:
                  </label>
                  <select
                    value={rekeningId}
                    onChange={(e) => setRekeningId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {rekeningList.map((rek) => (
                      <option key={rek.id} value={rek.id}>
                        {rek.nama_bank} - {rek.nomor_rekening} ({rek.fungsi_label || rek.pengelola})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan / Keterangan:</label>
                <input
                  type="text"
                  value={catatanTopUp}
                  onChange={(e) => setCatatanTopUp(e.target.value)}
                  placeholder="Contoh: Titipan uang saku bulanan dari orang tua..."
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTopUp(false)}
                  className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  Simpan Top-Up Tabungan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
