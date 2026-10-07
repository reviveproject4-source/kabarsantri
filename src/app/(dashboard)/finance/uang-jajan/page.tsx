'use client';

import React, { useState } from 'react';
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
  CreditCard
} from 'lucide-react';

export default function UangJajanSantriPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalTopUp, setModalTopUp] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState<any>(null);
  const [nominalTopUp, setNominalTopUp] = useState(50000);
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

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;

    setWallets(wallets.map(w => {
      if (w.id === selectedSantri.id) {
        return { ...w, saldo: w.saldo + Number(nominalTopUp) };
      }
      return w;
    }));

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.from('dompet_santri_v2').insert({
        santri_id: selectedSantri.id,
        jenis_transaksi: 'topup',
        nominal: Number(nominalTopUp),
        keterangan: 'Top-up Kasir Koperasi Santri',
      });
    } catch {
      // fallback
    }

    setModalTopUp(false);
    setNotif(`Top-up saldo e-Pocket ananda ${selectedSantri.santri} sebesar Rp ${Number(nominalTopUp).toLocaleString('id-ID')} berhasil dicatat!`);
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
                      onClick={() => {
                        setSelectedSantri(w);
                        setModalTopUp(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition"
                    >
                      + Top-Up Tunai
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Top Up Tunai */}
      {modalTopUp && selectedSantri && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Top-Up Saldo E-Pocket Tunai</h3>
              <p className="text-xs text-slate-500">Santri: <strong>{selectedSantri.santri}</strong> ({selectedSantri.nis})</p>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal Top-Up (Rp):</label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={5000}
                  value={nominalTopUp}
                  onChange={(e) => setNominalTopUp(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTopUp(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow"
                >
                  Simpan Top-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
