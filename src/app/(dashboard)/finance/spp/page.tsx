'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  CreditCard, 
  CheckCircle2, 
  Search, 
  FileText, 
  RefreshCw,
  Plus,
  MessageCircle,
  Printer
} from 'lucide-react';
import PrintableKuitansi, { KuitansiData } from '@/components/finance/PrintableKuitansi';

export default function SPPBillingPage() {
  const [selectedBulan, setSelectedBulan] = useState('10');
  const [notif, setNotif] = useState('');
  const [selectedKuitansi, setSelectedKuitansi] = useState<KuitansiData | null>(null);

  const [tagihanList, setTagihanList] = useState([
    {
      id: 'inv-1',
      nomor_invoice: 'INV-202610-001',
      santri: 'Muhammad Al-Fatih',
      nis: '202601001',
      wali: 'H. Syamsul Bahri',
      wali_phone: '081234567891',
      unit: 'MTs Tahfidz Sains',
      nominal: 500000,
      terbayar: 500000,
      status: 'PAID',
      metode: 'BSI Virtual Account',
      waktu_lunas: '2026-10-02 09:15',
    },
    {
      id: 'inv-2',
      nomor_invoice: 'INV-202610-002',
      santri: 'Ahmad Zaki Mubarak',
      nis: '202601015',
      wali: 'Dr. Hendra Gunawan',
      wali_phone: '081234567892',
      unit: 'MTs Tahfidz Sains',
      nominal: 500000,
      terbayar: 0,
      status: 'UNPAID',
      metode: '-',
      waktu_lunas: '-',
    },
    {
      id: 'inv-3',
      nomor_invoice: 'INV-202610-003',
      santri: 'Bilal Habasyi',
      nis: '202601018',
      wali: 'Ust. Zaid',
      wali_phone: '081234567893',
      unit: 'MTs Tahfidz Sains',
      nominal: 500000,
      terbayar: 250000,
      status: 'PARTIAL',
      metode: 'Tunai Kasir',
      waktu_lunas: '2026-10-03 11:20',
    },
    {
      id: 'inv-4',
      nomor_invoice: 'INV-202610-004',
      santri: 'Fathimah Az-Zahra',
      nis: '202602004',
      wali: 'Hj. Siti Aminah',
      wali_phone: '081234567894',
      unit: 'MA Unggulan Al-Qur\'an',
      nominal: 600000,
      terbayar: 600000,
      status: 'PAID',
      metode: 'QRIS Dinamis',
      waktu_lunas: '2026-10-01 14:02',
    },
  ]);

  const handleSimulasiLunas = (id: string) => {
    setTagihanList(tagihanList.map(t => {
      if (t.id === id) {
        return {
          ...t,
          terbayar: t.nominal,
          status: 'PAID',
          metode: 'Simulasi VA Sukses',
          waktu_lunas: new Date().toLocaleString('id-ID'),
        };
      }
      return t;
    }));
    setNotif('Pembayaran lunas tercatat! Jurnal umum double-entry (Debet Kas, Kredit Pendapatan SPP) otomatis dibukukan.');
    setTimeout(() => setNotif(''), 6000);
  };

  const handleGenerateBatch = () => {
    setNotif(`Berhasil men-generate tagihan SPP rutin Bulan ${selectedBulan}/2026 untuk seluruh santri aktif!`);
    setTimeout(() => setNotif(''), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tagihan & Pembayaran SPP Pesantren</h1>
          <p className="text-xs text-slate-500">Otomatisasi Invoice Bulanan, Virtual Account, QRIS & Pembukuan Buku Besar</p>
        </div>

        <button
          onClick={handleGenerateBatch}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition inline-flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Tagihan SPP Massal (Bulan {selectedBulan})</span>
        </button>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* KPI SPP */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Tagihan Terbit</span>
          <h3 className="text-xl font-bold text-slate-800 mt-1">Rp 2.100.000</h3>
          <p className="text-[11px] text-slate-400 mt-1">4 Invoice Terbit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Sudah Terbayar</span>
          <h3 className="text-xl font-bold text-emerald-600 mt-1">Rp 1.350.000</h3>
          <p className="text-[11px] text-emerald-700 mt-1">64.3% Lunas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Piutang Belum Terbayar</span>
          <h3 className="text-xl font-bold text-rose-600 mt-1">Rp 750.000</h3>
          <p className="text-[11px] text-rose-500 mt-1">1 Tertunggak, 1 Cicilan</p>
        </div>
      </div>

      {/* Table Tagihan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor invoice, santri, atau NIS..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400">Periode: Oktober 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Invoice & Tanggal</th>
                <th className="py-3 px-4">Santri & Lembaga</th>
                <th className="py-3 px-4">Nominal Tagihan</th>
                <th className="py-3 px-4">Terbayar</th>
                <th className="py-3 px-4">Status & Metode</th>
                <th className="py-3 px-4 text-right">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tagihanList.map((tagihan) => (
                <tr key={tagihan.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-800">{tagihan.nomor_invoice}</div>
                    <div className="text-[10px] text-slate-400">Jatuh Tempo: 10 Okt 2026</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{tagihan.santri}</div>
                    <div className="text-[10px] text-slate-400">NIS: {tagihan.nis} • {tagihan.unit}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    Rp {tagihan.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                    Rp {tagihan.terbayar.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      tagihan.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tagihan.status === 'PARTIAL'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {tagihan.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{tagihan.metode}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {tagihan.status === 'PAID' ? (
                        <button
                          onClick={() => setSelectedKuitansi({
                            nomor_kuitansi: `KWT-${tagihan.nomor_invoice.replace('INV-', '')}`,
                            nomor_invoice: tagihan.nomor_invoice,
                            santri_nama: tagihan.santri,
                            nis: tagihan.nis,
                            kelas: tagihan.unit,
                            wali_nama: tagihan.wali || 'Wali Santri ' + tagihan.santri,
                            wali_phone: tagihan.wali_phone || '081234567890',
                            jenis_pembayaran: `SPP Bulan ${selectedBulan}/2026`,
                            nominal: tagihan.terbayar || tagihan.nominal,
                            tanggal_bayar: tagihan.waktu_lunas || '2026-10-02',
                            tanggal_validasi: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                            kasir_nama: 'Staf Bendahara SPP'
                          })}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-xs flex items-center space-x-1 shadow-xs transition"
                          title="Cetak Kuitansi Resmi atau Kirim Kartu Bayaran ke WhatsApp Wali Murid (In-Page)"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Kuitansi &amp; WA</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSimulasiLunas(tagihan.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm text-xs transition"
                        >
                          Validasi Lunas
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL KUITANSI & WHATSAPP KARTU BAYARAN (IN-PAGE TANPA PINDAH LAYAR) */}
      {selectedKuitansi && (
        <PrintableKuitansi
          isOpen={!!selectedKuitansi}
          onClose={() => setSelectedKuitansi(null)}
          data={selectedKuitansi}
        />
      )}
    </div>
  );
}
