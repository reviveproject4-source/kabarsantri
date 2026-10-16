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
  Printer,
  Landmark,
  DollarSign,
  ArrowRight,
  X
} from 'lucide-react';
import PrintableKuitansi, { KuitansiData } from '@/components/finance/PrintableKuitansi';
import { 
  isTenantMode, 
  getSharedRekeningList, 
  saveSharedTransaksiKas, 
  RekeningPesantren 
} from '@/lib/sharedDataStore';

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
    metode: 'Transfer BSI',
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
    metode: 'Tunai Kasir (Cash)',
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
    metode: 'Transfer BSI',
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

  // Rekening Bank Pesantren
  const [rekeningList, setRekeningList] = useState<RekeningPesantren[]>([]);

  // Modal Input Kasir (SPP & Infaq)
  const [modalInputKasir, setModalInputKasir] = useState(false);
  const [formKasir, setFormKasir] = useState({
    jenis: 'SPP' as 'SPP' | 'INFAQ',
    santriNama: '',
    nis: '',
    donaturNama: '',
    kategoriInfaq: 'Infaq Pembangunan Gedung & Fasilitas',
    nominal: 500000,
    metode: 'TRANSFER' as 'CASH' | 'TRANSFER',
    rekeningId: '',
    keterangan: '',
    petugas: 'Staf Keuangan'
  });

  // Modal Validasi Lunas Per Tagihan (Cash vs Transfer)
  const [modalValidasi, setModalValidasi] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState<any | null>(null);
  const [formValidasi, setFormValidasi] = useState({
    metode: 'TRANSFER' as 'CASH' | 'TRANSFER',
    rekeningId: '',
    nominal: 0,
    keterangan: ''
  });

  useEffect(() => {
    const tenant = isTenantMode();
    setIsTenant(tenant);
    const rek = getSharedRekeningList();
    setRekeningList(rek);

    if (rek.length > 0) {
      setFormKasir(prev => ({ ...prev, rekeningId: rek[0].id }));
      setFormValidasi(prev => ({ ...prev, rekeningId: rek[0].id }));
    }

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

  const handleBukaValidasi = (tagihan: any) => {
    const sisa = (tagihan.nominal || 0) - (tagihan.terbayar || 0);
    setSelectedTagihan(tagihan);
    setFormValidasi({
      metode: 'TRANSFER',
      rekeningId: rekeningList[0]?.id || '',
      nominal: sisa > 0 ? sisa : tagihan.nominal,
      keterangan: `Pelunasan ${tagihan.nomor_invoice} an. ${tagihan.santri}`
    });
    setModalValidasi(true);
  };

  const handleSimpanValidasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTagihan) return;

    const rek = rekeningList.find(r => r.id === formValidasi.rekeningId);
    const labelMetode = formValidasi.metode === 'CASH'
      ? 'Tunai Kasir (Cash)'
      : `Transfer ${rek?.nama_bank || 'Bank'}`;

    // 1. Update status tagihan
    const nominalBayar = Number(formValidasi.nominal);
    const newTerbayar = (selectedTagihan.terbayar || 0) + nominalBayar;
    const isLunas = newTerbayar >= selectedTagihan.nominal;

    const updated = tagihanList.map(t => {
      if (t.id === selectedTagihan.id) {
        return {
          ...t,
          terbayar: newTerbayar,
          status: isLunas ? 'PAID' : 'PARTIAL',
          metode: labelMetode,
          waktu_lunas: new Date().toLocaleString('id-ID'),
        };
      }
      return t;
    });
    saveTagihan(updated);

    // 2. Simpan ke Unified Ledger Kasir (Single Source of Truth)
    saveSharedTransaksiKas({
      nomor_transaksi: `TRX-${Date.now().toString().slice(-6)}`,
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      tipe: 'MASUK',
      kategori: 'SPP',
      kategori_label: 'SPP Santri Bulanan',
      nama_pihak: selectedTagihan.santri,
      nis: selectedTagihan.nis,
      nominal: nominalBayar,
      metode: formValidasi.metode,
      rekening_id: formValidasi.metode === 'TRANSFER' ? formValidasi.rekeningId : undefined,
      rekening_nama: formValidasi.metode === 'TRANSFER' ? `${rek?.nama_bank} - ${rek?.nomor_rekening}` : undefined,
      keterangan: formValidasi.keterangan || `Pembayaran SPP ${selectedTagihan.nomor_invoice}`,
      petugas: 'Staf Keuangan',
    });

    setModalValidasi(false);
    setSelectedTagihan(null);
    setNotif(`✓ Pembayaran SPP ${selectedTagihan.santri} via ${labelMetode} sebesar Rp ${nominalBayar.toLocaleString('id-ID')} berhasil dicatat & masuk pembukuan kas!`);
    setTimeout(() => setNotif(''), 6000);
  };

  const handleSimpanKasirBaru = (e: React.FormEvent) => {
    e.preventDefault();
    const rek = rekeningList.find(r => r.id === formKasir.rekeningId);
    const labelMetode = formKasir.metode === 'CASH'
      ? 'Tunai Kasir (Cash)'
      : `Transfer ${rek?.nama_bank || 'Bank'}`;

    const isSPP = formKasir.jenis === 'SPP';
    const namaPihak = isSPP ? formKasir.santriNama : (formKasir.donaturNama || 'Hamba Allah');
    const nominal = Number(formKasir.nominal);

    // 1. Simpan ke unified ledger
    saveSharedTransaksiKas({
      nomor_transaksi: `TRX-${Date.now().toString().slice(-6)}`,
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      tipe: 'MASUK',
      kategori: isSPP ? 'SPP' : 'INFAQ',
      kategori_label: isSPP ? 'SPP Santri Bulanan' : formKasir.kategoriInfaq,
      nama_pihak: namaPihak,
      nis: isSPP ? formKasir.nis : undefined,
      nominal: nominal,
      metode: formKasir.metode,
      rekening_id: formKasir.metode === 'TRANSFER' ? formKasir.rekeningId : undefined,
      rekening_nama: formKasir.metode === 'TRANSFER' ? `${rek?.nama_bank} - ${rek?.nomor_rekening}` : undefined,
      keterangan: formKasir.keterangan || (isSPP ? `SPP Santri an. ${namaPihak}` : formKasir.kategoriInfaq),
      petugas: formKasir.petugas || 'Staf Keuangan',
    });

    // 2. Jika SPP dan ada santri cocok di tagihan list, perbarui juga tagihannya
    if (isSPP && formKasir.santriNama) {
      const matchTagihan = tagihanList.find(t => 
        (formKasir.nis && t.nis === formKasir.nis) ||
        t.santri?.toLowerCase().includes(formKasir.santriNama.toLowerCase())
      );
      if (matchTagihan) {
        const newTerbayar = (matchTagihan.terbayar || 0) + nominal;
        const updated = tagihanList.map(t => {
          if (t.id === matchTagihan.id) {
            return {
              ...t,
              terbayar: newTerbayar,
              status: newTerbayar >= t.nominal ? 'PAID' : 'PARTIAL',
              metode: labelMetode,
              waktu_lunas: new Date().toLocaleString('id-ID'),
            };
          }
          return t;
        });
        saveTagihan(updated);
      }
    }

    setModalInputKasir(false);
    setNotif(`✓ Penerimaan kasir ${isSPP ? 'SPP' : 'Infaq'} an. ${namaPihak} sebesar Rp ${nominal.toLocaleString('id-ID')} via ${labelMetode} berhasil dibukukan!`);
    setFormKasir({
      jenis: 'SPP',
      santriNama: '',
      nis: '',
      donaturNama: '',
      kategoriInfaq: 'Infaq Pembangunan Gedung & Fasilitas',
      nominal: 500000,
      metode: 'TRANSFER',
      rekeningId: rekeningList[0]?.id || '',
      keterangan: '',
      petugas: 'Staf Keuangan'
    });
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

  // Breakdown Terbayar: Cash vs Transfer
  const terbayarCash = tagihanList
    .filter(t => t.metode?.toLowerCase().includes('tunai') || t.metode?.toLowerCase().includes('cash'))
    .reduce((acc, t) => acc + (t.terbayar || 0), 0);
  const terbayarTransfer = totalTerbayar - terbayarCash;

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
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tagihan &amp; Penerimaan Kasir SPP / Infaq</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pemisahan Tegas Pembayaran Cash (Kas Tunai Kasir) vs Transfer Rekening Bank Resmi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Input Kasir Terpadu */}
          <button
            onClick={() => setModalInputKasir(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Kasir (SPP &amp; Infaq)</span>
          </button>

          {/* Tombol Generate Tagihan */}
          <button
            onClick={handleGenerateBatch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Tagihan (Bulan {selectedBulan})</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* KPI SPP DENGAN PEMISAHAN TEGAS CASH VS TRANSFER */}
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
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sudah Terbayar ({persenLunas}%)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Lunas
            </span>
          </div>
          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Rp {totalTerbayar.toLocaleString('id-ID')}
          </h3>
          {/* Breakdown Cash vs Transfer */}
          <div className="pt-1.5 flex flex-wrap gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold">
              💵 Kasir Cash: Rp {terbayarCash.toLocaleString('id-ID')}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-semibold">
              🏦 Transfer Bank: Rp {terbayarTransfer.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Piutang Belum Terbayar</span>
          <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">
            Rp {totalPiutang.toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-slate-400">
            {tagihanList.filter(t => t.status !== 'PAID').length} Santri Tertunggak
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
                <th className="py-3 px-4">Status &amp; Saluran Bayar</th>
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
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          tagihan.status === 'PAID'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : tagihan.status === 'PARTIAL'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        }`}>
                          {tagihan.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1 flex items-center space-x-1">
                        {tagihan.metode?.toLowerCase().includes('tunai') || tagihan.metode?.toLowerCase().includes('cash') ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">💵 {tagihan.metode}</span>
                        ) : tagihan.metode && tagihan.metode !== '-' ? (
                          <span className="text-blue-700 dark:text-blue-400 font-semibold">🏦 {tagihan.metode}</span>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
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
                            onClick={() => handleBukaValidasi(tagihan)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs text-xs transition flex items-center space-x-1"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Validasi Lunas</span>
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

      {/* ========================================================================= */}
      {/* MODAL 1: VALIDASI LUNAS TAGIHAN DENGAN PEMILIHAN CASH VS TRANSFER        */}
      {/* ========================================================================= */}
      {modalValidasi && selectedTagihan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Validasi Pelunasan Tagihan SPP</h3>
                <p className="text-xs text-slate-500">Santri: <strong>{selectedTagihan.santri}</strong> ({selectedTagihan.nomor_invoice})</p>
              </div>
              <button onClick={() => setModalValidasi(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimpanValidasi} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nominal Pembayaran (Rp):</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={formValidasi.nominal}
                  onChange={(e) => setFormValidasi({ ...formValidasi, nominal: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* PEMILIHAN METODE MUTLAK: CASH VS TRANSFER */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Saluran Pembayaran (Wajib Dipilih Tanpa Tertukar):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormValidasi({ ...formValidasi, metode: 'CASH' })}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      formValidasi.metode === 'CASH'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center space-x-1">
                      <span>💵 Tunai (Cash)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">Uang fisik diterima di kasir pesantren</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormValidasi({ ...formValidasi, metode: 'TRANSFER' })}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      formValidasi.metode === 'TRANSFER'
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center space-x-1">
                      <span>🏦 Transfer Bank</span>
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">Masuk ke rekening resmi bank yayasan</span>
                  </button>
                </div>
              </div>

              {formValidasi.metode === 'TRANSFER' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rekening Bank Tujuan:
                  </label>
                  <select
                    value={formValidasi.rekeningId}
                    onChange={(e) => setFormValidasi({ ...formValidasi, rekeningId: e.target.value })}
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Kasir / Keterangan:</label>
                <input
                  type="text"
                  value={formValidasi.keterangan}
                  onChange={(e) => setFormValidasi({ ...formValidasi, keterangan: e.target.value })}
                  placeholder="Contoh: Titipan via musyrif / m-Banking BSI wali..."
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalValidasi(false)}
                  className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  Simpan Pelunasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INPUT KASIR TERPADU (SPP SANTRI & INFAQ / DONASI YAYASAN)        */}
      {/* ========================================================================= */}
      {modalInputKasir && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Input Kasir: Penerimaan Dana</h3>
                <p className="text-xs text-slate-500">Pencatatan SPP Santri atau Infaq/Donasi Yayasan</p>
              </div>
              <button onClick={() => setModalInputKasir(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimpanKasirBaru} className="space-y-4 text-xs">
              {/* Pilihan Jenis: SPP Santri vs Infaq */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Jenis Transaksi Kas Masuk:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormKasir({ ...formKasir, jenis: 'SPP' })}
                    className={`p-2.5 rounded-xl border font-bold text-xs text-center transition ${
                      formKasir.jenis === 'SPP'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    🎓 SPP Santri Bulanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormKasir({ ...formKasir, jenis: 'INFAQ' })}
                    className={`p-2.5 rounded-xl border font-bold text-xs text-center transition ${
                      formKasir.jenis === 'INFAQ'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    🤲 Infaq &amp; Donasi
                  </button>
                </div>
              </div>

              {formKasir.jenis === 'SPP' ? (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Santri:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Muhammad Al-Fatih"
                      value={formKasir.santriNama}
                      onChange={(e) => setFormKasir({ ...formKasir, santriNama: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">NIS (Opsional):</label>
                    <input
                      type="text"
                      placeholder="Contoh: 202601001"
                      value={formKasir.nis}
                      onChange={(e) => setFormKasir({ ...formKasir, nis: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Donatur / Muhsinin:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: H. Syamsul Bahri / Hamba Allah"
                      value={formKasir.donaturNama}
                      onChange={(e) => setFormKasir({ ...formKasir, donaturNama: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Peruntukan Infaq:</label>
                    <select
                      value={formKasir.kategoriInfaq}
                      onChange={(e) => setFormKasir({ ...formKasir, kategoriInfaq: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Infaq Pembangunan Gedung & Fasilitas">Infaq Pembangunan Gedung &amp; Fasilitas</option>
                      <option value="Infaq Pengembangan Pendidikan & Guru">Infaq Pengembangan Pendidikan &amp; Guru</option>
                      <option value="Sedekah Makan & Santri Yatim/Dhuafa">Sedekah Makan Santri &amp; Dhuafa</option>
                      <option value="Infaq Jumat Masjid Pesantren">Infaq Jumat Tromol Masjid Pesantren</option>
                      <option value="Donasi Bebas / Wakaf Produktif">Donasi Bebas / Wakaf Produktif</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nominal Penerimaan (Rp):</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={5000}
                  value={formKasir.nominal}
                  onChange={(e) => setFormKasir({ ...formKasir, nominal: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* PEMILIHAN METODE: CASH VS TRANSFER */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Saluran Pembayaran (Wajib Dipilih Tanpa Tertukar):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormKasir({ ...formKasir, metode: 'CASH' })}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      formKasir.metode === 'CASH'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="font-bold text-xs">💵 Tunai (Cash)</span>
                    <span className="text-[10px] text-slate-500 mt-1">Diterima fisik di loket bendahara</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormKasir({ ...formKasir, metode: 'TRANSFER' })}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                      formKasir.metode === 'TRANSFER'
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="font-bold text-xs">🏦 Transfer Bank</span>
                    <span className="text-[10px] text-slate-500 mt-1">Diterima di rekening bank pesantren</span>
                  </button>
                </div>
              </div>

              {formKasir.metode === 'TRANSFER' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rekening Bank Tujuan:
                  </label>
                  <select
                    value={formKasir.rekeningId}
                    onChange={(e) => setFormKasir({ ...formKasir, rekeningId: e.target.value })}
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Rincian:</label>
                <input
                  type="text"
                  value={formKasir.keterangan}
                  onChange={(e) => setFormKasir({ ...formKasir, keterangan: e.target.value })}
                  placeholder="Contoh: Bukti transfer m-Banking / titipan amplop..."
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalInputKasir(false)}
                  className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  Simpan Transaksi Kasir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

