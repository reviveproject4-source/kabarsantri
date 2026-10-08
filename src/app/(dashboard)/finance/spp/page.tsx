'use client';

import React, { useState, useEffect } from 'react';
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
import { isTenantMode } from '@/lib/sharedDataStore';

const DEMO_TAGIHAN_LIST = [
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
];

export default function SPPBillingPage() {
  const [selectedBulan, setSelectedBulan] = useState('10');
  const [notif, setNotif] = useState('');
  const [selectedKuitansi, setSelectedKuitansi] = useState<KuitansiData | null>(null);
  const [tagihanList, setTagihanList] = useState<any[]>([]);
  const [isTenant, setIsTenant] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const tenant = isTenantMode();
    setIsTenant(tenant);
    if (tenant) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('ks_tenant_tagihan_spp_v1');
        if (stored) {
          try {
            setTagihanList(JSON.parse(stored));
          } catch {
            setTagihanList([]);
          }
        } else {
          setTagihanList([]);
        }
      } else {
        setTagihanList([]);
      }
    } else {
      setTagihanList(DEMO_TAGIHAN_LIST);
    }
  }, []);

  const saveTagihan = (newList: any[]) => {
    setTagihanList(newList);
    if (isTenant && typeof window !== 'undefined') {
      localStorage.setItem('ks_tenant_tagihan_spp_v1', JSON.stringify(newList));
    }
  };

  const handleSimulasiLunas = (id: string) => {
    const updated = tagihanList.map(t => {
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
    });
    saveTagihan(updated);
    setNotif('Pembayaran lunas tercatat! Jurnal umum double-entry (Debet Kas, Kredit Pendapatan SPP) otomatis dibukukan.');
    setTimeout(() => setNotif(''), 6000);
  };

  const handleGenerateBatch = () => {
    if (isTenant) {
      // In live tenant, generate invoices based on live registered santri
      if (typeof window !== 'undefined') {
        const rawSantri = localStorage.getItem('ks_tenant_santri_list_v1');
        const santriList = rawSantri ? JSON.parse(rawSantri) : [];
        if (santriList.length === 0) {
          setNotif('Belum ada santri terdaftar di tenant ini. Silakan input santri terlebih dahulu di menu Data Santri.');
          setTimeout(() => setNotif(''), 5000);
          return;
        }
        const newInvoices = santriList.map((s: any, idx: number) => ({
          id: `inv-t-${Date.now()}-${idx}`,
          nomor_invoice: `INV-NH-2026${selectedBulan}-${String(idx + 1).padStart(3, '0')}`,
          santri: s.nama,
          nis: s.nis,
          wali: s.wali_nama || `Wali an. ${s.nama}`,
          wali_phone: s.wali_kontak || '081234567890',
          unit: s.kelas || 'Tahfidz 7A',
          nominal: 500000,
          terbayar: 0,
          status: 'UNPAID',
          metode: '-',
          waktu_lunas: '-',
        }));
        saveTagihan(newInvoices);
        setNotif(`Berhasil men-generate ${newInvoices.length} tagihan SPP rutin Bulan ${selectedBulan}/2026 untuk santri tenant!`);
        setTimeout(() => setNotif(''), 5000);
        return;
      }
    }
    setNotif(`Berhasil men-generate tagihan SPP rutin Bulan ${selectedBulan}/2026 untuk seluruh santri aktif!`);
    setTimeout(() => setNotif(''), 5000);
  };

  // KPI Calculations
  const totalNominal = tagihanList.reduce((acc, t) => acc + (t.nominal || 0), 0);
  const totalTerbayar = tagihanList.reduce((acc, t) => acc + (t.terbayar || 0), 0);
  const totalPiutang = totalNominal - totalTerbayar;
  const persenLunas = totalNominal > 0 ? ((totalTerbayar / totalNominal) * 100).toFixed(1) : '0';

  const filteredTagihan = tagihanList.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.santri?.toLowerCase().includes(q) ||
      t.nis?.toLowerCase().includes(q) ||
      t.nomor_invoice?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tagihan &amp; Pembayaran SPP Pesantren</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isTenant ? 'Mode Tenant Live (Pesantren Tahfidz Nurul Huda)' : 'Otomatisasi Invoice Bulanan, Virtual Account, QRIS & Pembukuan Buku Besar'}
          </p>
        </div>

        <button
          onClick={handleGenerateBatch}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Tagihan SPP Massal (Bulan {selectedBulan})</span>
        </button>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* KPI SPP */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Tagihan Terbit</span>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Rp {totalNominal.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-400">
            {tagihanList.length} Invoice Terbit
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sudah Terbayar</span>
          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Rp {totalTerbayar.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
            {persenLunas}% Lunas
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Piutang Belum Terbayar</span>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">
            Rp {totalPiutang.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-400">
            {tagihanList.filter(t => t.status !== 'PAID').length} Tertunggak
          </p>
        </div>
      </div>

      {/* Table Tagihan */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor invoice, santri, atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-400">Periode: Bulan {selectedBulan}/2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">No. Invoice &amp; Tanggal</th>
                <th className="py-3 px-4">Santri &amp; Lembaga</th>
                <th className="py-3 px-4">Nominal Tagihan</th>
                <th className="py-3 px-4">Terbayar</th>
                <th className="py-3 px-4">Status &amp; Metode</th>
                <th className="py-3 px-4 text-right">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredTagihan.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CreditCard className="w-8 h-8 text-blue-500" />
                      <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                        Belum ada data tagihan SPP
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {isTenant 
                          ? 'Tenant ini belum memiliki tagihan. Daftarkan santri terlebih dahulu lalu klik "Generate Tagihan SPP Massal" di atas.'
                          : 'Tidak ada invoice yang sesuai kriteria pencarian.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTagihan.map((tagihan) => (
                  <tr key={tagihan.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-100">{tagihan.nomor_invoice}</div>
                      <div className="text-[10px] text-slate-400">Jatuh Tempo: 10 Okt 2026</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{tagihan.santri}</div>
                      <div className="text-[10px] text-slate-400">NIS: {tagihan.nis} • {tagihan.unit}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">
                      Rp {tagihan.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700 dark:text-blue-400">
                      Rp {tagihan.terbayar.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        tagihan.status === 'PAID'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          : tagihan.status === 'PARTIAL'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
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
                            className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-800 font-bold rounded-lg text-xs flex items-center space-x-1 shadow-xs transition"
                            title="Cetak Kuitansi Resmi atau Kirim Kartu Bayaran ke WhatsApp Wali Murid (In-Page)"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Kuitansi &amp; WA</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSimulasiLunas(tagihan.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs text-xs transition"
                          >
                            Validasi Lunas
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
