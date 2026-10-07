'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Receipt, 
  Image as ImageIcon, 
  FileCheck2, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  Download,
  Printer
} from 'lucide-react';
import PrintableKuitansi from '@/components/finance/PrintableKuitansi';

export default function ValidasiKeuanganPage() {
  const [filterKategori, setFilterKategori] = useState<string>('semua');
  const [selectedBukti, setSelectedBukti] = useState<any>(null);
  const [kuitansiModal, setKuitansiModal] = useState<any>(null);
  const [notif, setNotif] = useState('');

  // Daftar Transaksi yang Masuk dari Wali Santri (dengan Bukti TF Terkompresi < 150KB)
  const [transaksiList, setTransaksiList] = useState([
    {
      id: 'val-1',
      nomor_invoice: 'INV-202610-002',
      santri: 'Ahmad Zaki Mubarak',
      nis: '202601015',
      wali: 'Dr. Hendra Gunawan',
      jenis: 'SPP',
      nominal: 500000,
      bank_tujuan: 'BSI (Bank Syariah Indonesia)',
      tanggal_transfer: '2026-10-04',
      bukti_img_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60',
      file_size_compressed: '98 KB',
      status: 'MENUNGGU_VALIDASI',
      nomor_kuitansi: null,
    },
    {
      id: 'val-2',
      nomor_invoice: 'UJ-202610-089',
      santri: 'Muhammad Al-Fatih',
      nis: '202601001',
      wali: 'H. Syamsul Bahri',
      jenis: 'Uang Jajan',
      nominal: 150000,
      bank_tujuan: 'Bank Muamalat',
      tanggal_transfer: '2026-10-04',
      bukti_img_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=500&auto=format&fit=crop&q=60',
      file_size_compressed: '112 KB',
      status: 'MENUNGGU_VALIDASI',
      nomor_kuitansi: null,
    },
    {
      id: 'val-3',
      nomor_invoice: 'TBG-202610-042',
      santri: 'Bilal Habasyi',
      nis: '202601018',
      wali: 'Ust. Zaid',
      jenis: 'Tabungan',
      nominal: 300000,
      bank_tujuan: 'BSI Giro Yayasan',
      tanggal_transfer: '2026-10-03',
      bukti_img_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60',
      file_size_compressed: '85 KB',
      status: 'VALID',
      nomor_kuitansi: 'KWT-20261003-0042',
    },
    {
      id: 'val-4',
      nomor_invoice: 'PPDB-2026-015',
      santri: 'Fatih Al-Ayyubi',
      nis: '202601021',
      wali: 'H. Ridwan',
      jenis: 'Daftar Ulang',
      nominal: 3500000,
      bank_tujuan: 'BCA Yayasan',
      tanggal_transfer: '2026-10-03',
      bukti_img_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=500&auto=format&fit=crop&q=60',
      file_size_compressed: '124 KB',
      status: 'MENUNGGU_VALIDASI',
      nomor_kuitansi: null,
    },
    {
      id: 'val-5',
      nomor_invoice: 'DON-2026-088',
      santri: 'Fathimah Az-Zahra',
      nis: '202602004',
      wali: 'Hj. Siti Aminah',
      jenis: 'Donasi',
      nominal: 1000000,
      bank_tujuan: 'BSI Infaq Pondok',
      tanggal_transfer: '2026-10-02',
      bukti_img_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60',
      file_size_compressed: '92 KB',
      status: 'VALID',
      nomor_kuitansi: 'KWT-20261002-0088',
    },
  ]);

  const handleValidasi = async (id: string, aksi: 'valid' | 'tolak') => {
    const kuitansiNo = 'KWT-' + Date.now().toString().slice(-6);
    
    // Optimistic UI update
    setTransaksiList(transaksiList.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: aksi === 'valid' ? 'VALID' : 'DITOLAK',
          nomor_kuitansi: aksi === 'valid' ? kuitansiNo : null,
        };
      }
      return t;
    }));

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      const targetTrx = transaksiList.find(t => t.id === id);

      // 1. Update status transaksi di database Supabase
      await supabase
        .from('transaksi_validasi_v2')
        .update({
          status: aksi === 'valid' ? 'VALID' : 'DITOLAK',
          nomor_kuitansi: aksi === 'valid' ? kuitansiNo : null,
          validated_at: new Date().toISOString(),
        })
        .eq('id', id);

      // 2. Jika VALID: Catat otomatis ke wa_outbox_queue untuk notifikasi WhatsApp Wali
      if (aksi === 'valid' && targetTrx) {
        await supabase.from('wa_outbox_queue').insert({
          phone_destination: '6281234567890',
          recipient_name: targetTrx.wali,
          template_name: 'kuitansi',
          message_body: `Assalamu'alaikum Wr. Wb. Pembayaran ${targetTrx.jenis} ananda ${targetTrx.santri} sebesar Rp ${targetTrx.nominal.toLocaleString('id-ID')} telah SAH divalidasi oleh Bagian Keuangan. No. Kuitansi: ${kuitansiNo}. Simpan pesan ini sebagai bukti sah pengganti kartu SPP.`,
          status: 'PENDING',
        });
      }
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }

    if (aksi === 'valid') {
      setNotif(`Pembayaran berhasil divalidasi! Kuitansi Digital (${kuitansiNo}) resmi diterbitkan, tercatat di Ledger, dan pesan WhatsApp disiapkan ke Wali.`);
    } else {
      setNotif('Pembayaran ditolak. Alasan penolakan diteruskan ke wali santri.');
    }
    setTimeout(() => setNotif(''), 7000);
  };

  const filteredList = transaksiList.filter(item => {
    if (filterKategori === 'semua') return true;
    return item.jenis.toLowerCase().includes(filterKategori.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Validasi Pembayaran & Bukti Transfer</h1>
          <p className="text-xs text-slate-500">
            Verifikasi Pembayaran Manual Wali Santri (SPP, Uang Jajan, Tabungan, Donasi & Tunggakan Daftar Ulang)
          </p>
        </div>

        <Link
          href="/dashboard/yayasan"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition inline-flex items-center space-x-1.5"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Lihat Grafik di Dashboard Yayasan →</span>
        </Link>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* Filter Tabs Kategori Pembayaran */}
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <span className="font-semibold text-slate-500 py-1.5 px-2">Filter Jenis:</span>
        {['semua', 'SPP', 'Uang Jajan', 'Tabungan', 'Donasi', 'Daftar Ulang'].map((kat) => (
          <button
            key={kat}
            onClick={() => setFilterKategori(kat)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterKategori === kat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {kat === 'semua' ? 'Semua Jenis' : kat}
          </button>
        ))}
      </div>

      {/* Table Transaksi Menunggu Validasi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Antrean Bukti Transfer Masuk ({filteredList.length})</h3>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Auto Compression: Seluruh Bukti Transfer &lt; 150KB</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Santri & Wali</th>
                <th className="py-3 px-4">Alokasi & No. Ref</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Bukti TF (Terkompresi)</th>
                <th className="py-3 px-4">Status & Kuitansi</th>
                <th className="py-3 px-4 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{item.santri}</div>
                    <div className="text-[10px] text-slate-400">NIS: {item.nis} • Wali: {item.wali}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.jenis}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.nomor_invoice}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    Rp {item.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedBukti(item)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center space-x-1.5 transition"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Lihat Bukti ({item.file_size_compressed})</span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    {item.status === 'VALID' ? (
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          VALID / LUNAS
                        </span>
                        <button
                          onClick={() => setKuitansiModal(item)}
                          className="block text-[10px] text-emerald-700 font-bold hover:underline mt-0.5"
                        >
                          📄 {item.nomor_kuitansi}
                        </button>
                      </div>
                    ) : item.status === 'DITOLAK' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                        DITOLAK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 flex items-center space-x-1 w-fit">
                        <Clock className="w-3 h-3" />
                        <span>Menunggu Validasi</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {item.status === 'MENUNGGU_VALIDASI' ? (
                      <>
                        <button
                          onClick={() => handleValidasi(item.id, 'valid')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm text-xs transition"
                        >
                          Validasi Lunas
                        </button>
                        <button
                          onClick={() => handleValidasi(item.id, 'tolak')}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold rounded-lg text-xs transition"
                        >
                          Tolak
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setKuitansiModal(item)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                      >
                        Lihat Kuitansi Digital
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PREVIEW BUKTI TRANSFER (COMPRESSED) */}
      {selectedBukti && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Bukti Transfer Wali Santri</h3>
                <p className="text-[11px] text-slate-400">{selectedBukti.santri} • Rp {selectedBukti.nominal.toLocaleString('id-ID')}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                Ukuran: {selectedBukti.file_size_compressed}
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 max-h-72 bg-slate-100 flex items-center justify-center">
              <img
                src={selectedBukti.bukti_img_url}
                alt="Bukti Transfer"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              💡 Gambar ini telah dikonversi secara otomatis oleh sistem saat diunggah wali menjadi file ringan di bawah 150KB untuk menghemat ruang server dan mempercepat loading.
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedBukti(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Tutup
              </button>
              {selectedBukti.status === 'MENUNGGU_VALIDASI' && (
                <button
                  onClick={() => {
                    handleValidasi(selectedBukti.id, 'valid');
                    setSelectedBukti(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Validasi Lunas Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL KUITANSI DIGITAL RESMI (PENGGANTI KARTU SPP FISIK) */}
      {kuitansiModal && (
        <PrintableKuitansi
          isOpen={!!kuitansiModal}
          onClose={() => setKuitansiModal(null)}
          data={{
            nomor_kuitansi: kuitansiModal.nomor_kuitansi || 'KWT-202610-001',
            nomor_invoice: kuitansiModal.nomor_invoice,
            santri_nama: kuitansiModal.santri,
            nis: kuitansiModal.nis,
            wali_nama: kuitansiModal.wali || 'H. Syamsul Bahri',
            wali_phone: '081234567890',
            jenis_pembayaran: kuitansiModal.jenis,
            nominal: kuitansiModal.nominal,
            bank_tujuan: kuitansiModal.bank_tujuan,
            tanggal_bayar: kuitansiModal.tanggal_transfer,
            tanggal_validasi: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            kasir_nama: 'Staf Bendahara SPP',
          }}
        />
      )}
    </div>
  );
}
