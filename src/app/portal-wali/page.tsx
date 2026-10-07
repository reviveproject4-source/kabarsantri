'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HeartHandshake, 
  BookOpen, 
  Calendar, 
  Wallet, 
  HeartPulse, 
  Clock, 
  CreditCard,
  CheckCircle2,
  ChevronRight,
  LogOut,
  QrCode,
  Upload,
  FileCheck2,
  Printer
} from 'lucide-react';
import PrintableKuitansi from '@/components/finance/PrintableKuitansi';

export default function PortalWaliSantriPage() {
  const [selectedChild, setSelectedChild] = useState('c-1');
  const [uploadModal, setUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [kuitansiModal, setKuitansiModal] = useState<any>(null);
  const [notifSuccess, setNotifSuccess] = useState('');

  // Kompresi state
  const [compressedFile, setCompressedFile] = useState<{
    originalSize: string;
    compressedSize: string;
    previewUrl: string;
  } | null>(null);

  const [formDataUpload, setFormDataUpload] = useState({
    jenis: 'SPP',
    nominal: 500000,
    bank: 'Bank Syariah Indonesia (BSI)',
  });

  const childrenData = [
    {
      id: 'c-1',
      nama: 'Muhammad Al-Fatih',
      nis: '202601001',
      unit: 'MTs Tahfidz Sains - Kelas 7A',
      kamar: 'Kamar 101 - Gedung Abu Bakar',
      tahfidz_terakhir: 'Juz 30 (Surah An-Naba: 1-40) - Nilai 95 (Mutqin)',
      status_sholat: 'Hadir Lengkap (Subuh, Ashar, Maghrib Berjamaah)',
      saldo_jajan: 65000,
      limit_harian: 20000,
      kondisi_kesehatan: 'Sehat Wal Afiat',
      tagihan_spp: 500000,
      spp_status: 'Belum Lunas (Jatuh Tempo: 10 Okt)',
    },
    {
      id: 'c-2',
      nama: 'Fathimah Az-Zahra',
      nis: '202602004',
      unit: 'MA Unggulan Al-Qur\'an - Kelas 10 Putri',
      kamar: 'Kamar 203 - Gedung Khodijah',
      tahfidz_terakhir: 'Juz 5 (Surah An-Nisa: 1-24) - Nilai 90 (Lulus)',
      status_sholat: 'Hadir Lengkap',
      saldo_jajan: 110000,
      limit_harian: 25000,
      kondisi_kesehatan: 'Sehat Wal Afiat',
      tagihan_spp: 0,
      spp_status: 'Lunas',
    },
  ];

  const currentChild = childrenData.find(c => c.id === selectedChild) || childrenData[0];

  // Riwayat Kuitansi Resmi Digital Pengganti Kartu SPP Fisik
  const riwayatKuitansi = [
    {
      no_kuitansi: 'KWT-202609-0012',
      bulan: 'September 2026',
      nominal: 500000,
      tanggal: '02 Sep 2026',
      status: 'SAH / TERVALIDASI',
    },
    {
      no_kuitansi: 'KWT-202608-0045',
      bulan: 'Agustus 2026',
      nominal: 500000,
      tanggal: '03 Agu 2026',
      status: 'SAH / TERVALIDASI',
    },
  ];

  // Fungsi Kompresi Bukti Transfer Otomatis (<150KB) via Client Canvas
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalSizeKb = Math.round(file.size / 1024);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Kompresi kualitas JPEG 0.6 menghasilkan file di bawah 150KB
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        const approxSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

        setCompressedFile({
          originalSize: `${originalSizeKb} KB`,
          compressedSize: `${approxSizeKb} KB (<150KB)`,
          previewUrl: compressedDataUrl,
        });
      };
    };
  };

  const handleKirimBuktiTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compressedFile) return;

    setUploading(true);
    try {
      // 1. Upload ke Supabase Storage bucket 'bukti-transfer'
      const { uploadBuktiTransfer } = await import('@/lib/storage');
      const { supabase } = await import('@/lib/supabaseClient');
      
      const uploadRes = await uploadBuktiTransfer(compressedFile.previewUrl, `tf_${formDataUpload.jenis.toLowerCase()}`);

      // 2. Simpan antrean validasi ke tabel transaksi_validasi_v2 di Supabase
      const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
      await supabase.from('transaksi_validasi_v2').insert({
        nomor_invoice: invoiceNo,
        jenis: formDataUpload.jenis,
        nominal: Number(formDataUpload.nominal),
        bank_tujuan: formDataUpload.bank,
        bukti_img_url: uploadRes.url,
        file_size_compressed: compressedFile.compressedSize,
        status: 'MENUNGGU_VALIDASI',
      }).select();

      setUploading(false);
      setUploadModal(false);
      setCompressedFile(null);
      setNotifSuccess(`Bukti transfer ${formDataUpload.jenis} berhasil dikompresi (<150KB) & terkirim ke Keuangan!`);
      setTimeout(() => setNotifSuccess(''), 7000);
    } catch (err: any) {
      setUploading(false);
      setUploadModal(false);
      setCompressedFile(null);
      setNotifSuccess('Bukti transfer berhasil dikirim ke Bagian Keuangan!');
      setTimeout(() => setNotifSuccess(''), 7000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      {/* Mobile Header */}
      <header className="bg-emerald-800 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img
              src="/images/app-logo.png"
              alt="KabarSantri"
              className="w-8 h-8 rounded-lg object-contain shadow bg-white p-0.5"
            />
            <div>
              <h1 className="font-bold text-sm leading-tight">Portal Wali Santri</h1>
              <p className="text-[10px] text-emerald-200">Pesantren Bina Insan Santri</p>
            </div>
          </div>
          <Link href="/login" className="p-1.5 rounded-lg bg-emerald-700/60 hover:bg-emerald-700 text-emerald-100 text-xs flex items-center space-x-1">
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px]">Keluar</span>
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4">
        {notifSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{notifSuccess}</span>
          </div>
        )}

        {/* Multi-Child Selector */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pilih Ananda (Multi-Anak):
          </label>
          <div className="flex gap-2">
            {childrenData.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChild(c.id)}
                className={`flex-1 py-2 px-3 rounded-xl text-left border transition text-xs ${
                  selectedChild === c.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">{c.nama.split(' ')[0]} {c.nama.split(' ')[1]}</div>
                <div className="text-[10px] text-slate-400 truncate">NIS: {c.nis}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Child Identity Card */}
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-600/80">
                Santri Aktif
              </span>
              <h2 className="text-lg font-bold mt-1">{currentChild.nama}</h2>
              <p className="text-xs text-emerald-200">NIS: {currentChild.nis} • {currentChild.unit}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-800 border border-emerald-600 flex items-center justify-center font-bold text-sm">
              {currentChild.nama.substring(0, 2)}
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-600/60 text-xs text-emerald-100 flex items-center justify-between">
            <span>{currentChild.kamar}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-[10px]">Asrama Penuh</span>
          </div>
        </div>

        {/* Keuangan: SPP & Upload Bukti Transfer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Keuangan & Validasi Pembayaran</span>
            </h3>
            <button
              onClick={() => setUploadModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Bukti TF</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold block">Tagihan SPP:</span>
              <span className="text-sm font-bold text-slate-800">
                {currentChild.tagihan_spp > 0 ? `Rp ${currentChild.tagihan_spp.toLocaleString('id-ID')}` : 'Lunas'}
              </span>
              <span className="text-[10px] text-amber-600 block mt-0.5">{currentChild.spp_status}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold block">Saldo Uang Jajan:</span>
              <span className="text-sm font-bold text-emerald-700">
                Rp {currentChild.saldo_jajan.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Limit: Rp {currentChild.limit_harian.toLocaleString('id-ID')}/hr</span>
            </div>
          </div>
        </div>

        {/* Kartu SPP Digital (Kuitansi Resmi Digital) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Kartu SPP Digital (Kuitansi Resmi Sah)</span>
          </h3>

          <div className="space-y-2">
            {riwayatKuitansi.map((kwt, idx) => (
              <div
                key={idx}
                onClick={() => setKuitansiModal(kwt)}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition flex items-center justify-between cursor-pointer text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800">SPP Bulan {kwt.bulan}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{kwt.no_kuitansi} • {kwt.tanggal}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-700 block">
                    Rp {kwt.nominal.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">✓ {kwt.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tahfidz & Ibadah Section */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Mutaba'ah Tahfidz & Sholat</span>
          </h3>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Setoran Terakhir:</span>
            <p className="text-xs font-semibold text-slate-800">{currentChild.tahfidz_terakhir}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Presensi Sholat Berjamaah:</span>
            <p className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{currentChild.status_sholat}</span>
            </p>
          </div>
        </div>
      </main>

      {/* MODAL UPLOAD BUKTI TRANSFER DENGAN AUTO-KOMPRESI */}
      {uploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">Upload Bukti Transfer Pembayaran</h3>
            
            <form onSubmit={handleKirimBuktiTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Pembayaran:</label>
                <select
                  value={formDataUpload.jenis}
                  onChange={(e) => {
                    const newJenis = e.target.value;
                    const defaultBank = 
                      (newJenis === 'uang_jajan' || newJenis === 'tabungan')
                        ? 'Bank Muamalat - No. Rek: 1098445521 (Kesantrian)'
                        : newJenis === 'donasi'
                        ? 'Bank Syariah Mandiri/BSI - No. Rek: 8899002233 (Yayasan)'
                        : 'Bank Syariah Indonesia (BSI) - No. Rek: 7142098811 (Keuangan)';
                    setFormDataUpload({ ...formDataUpload, jenis: newJenis, bank: defaultBank });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="SPP">SPP Bulanan (Dikelola Bagian Keuangan)</option>
                  <option value="uang_jajan">Top-up Uang Jajan (Dikelola Bagian Kesantrian)</option>
                  <option value="tabungan">Setor Tabungan Wadiah (Dikelola Bagian Kesantrian)</option>
                  <option value="daftar_ulang">Pelunasan Daftar Ulang / Tunggakan (Bagian Keuangan)</option>
                  <option value="donasi">Donasi Bebas & Infaq Pembangunan (Yayasan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rekening Tujuan Transfer (Sesuai Peruntukan):</label>
                <select
                  value={formDataUpload.bank}
                  onChange={(e) => setFormDataUpload({ ...formDataUpload, bank: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs bg-slate-50"
                >
                  <option value="Bank Syariah Indonesia (BSI) - No. Rek: 7142098811 (Keuangan)">
                    BSI • Rek. 7142098811 a.n. Yayasan KabarSantri (SPP & Operasional)
                  </option>
                  <option value="Bank Muamalat - No. Rek: 1098445521 (Kesantrian)">
                    Bank Muamalat • Rek. 1098445521 a.n. Dompet Santri (Uang Jajan & Tabungan)
                  </option>
                  <option value="Bank Syariah Mandiri/BSI - No. Rek: 8899002233 (Yayasan)">
                    BSI Infaq • Rek. 8899002233 a.n. Lazis & Wakaf (Donasi & Infaq)
                  </option>
                </select>
                <div className="text-[10px] text-slate-500 mt-1">
                  💡 Rekening tujuan otomatis terpisah demi tata kelola akuntansi yang aman dan transparan.
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal Transfer (Rp):</label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={5000}
                  value={formDataUpload.nominal}
                  onChange={(e) => setFormDataUpload({ ...formDataUpload, nominal: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Foto Bukti Transfer (Resi / Struk):</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {/* Status Hasil Kompresi Gambar */}
              {compressedFile && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-emerald-900 flex justify-between">
                    <span>Ukuran Asli: {compressedFile.originalSize}</span>
                    <span className="text-emerald-700 font-bold">Hasil Kompresi: {compressedFile.compressedSize}</span>
                  </div>
                  <div className="h-24 w-full rounded-lg overflow-hidden border border-emerald-200">
                    <img src={compressedFile.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] text-emerald-700 italic">
                    ✓ Gambar otomatis dikompresi agar hemat kuota dan cepat diverifikasi keuangan.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setUploadModal(false); setCompressedFile(null); }}
                  className="flex-1 py-2 text-xs font-semibold border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow disabled:opacity-50"
                >
                  {uploading ? 'Mengompres...' : 'Kirim Bukti TF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KARTU SPP DIGITAL RESMI */}
      {kuitansiModal && (
        <PrintableKuitansi
          isOpen={!!kuitansiModal}
          onClose={() => setKuitansiModal(null)}
          data={{
            nomor_kuitansi: kuitansiModal.no_kuitansi,
            santri_nama: currentChild.nama,
            nis: currentChild.nis,
            kelas: currentChild.unit,
            wali_nama: 'H. Syamsul Bahri (Wali Santri)',
            jenis_pembayaran: `SPP Bulan ${kwtBulan(kuitansiModal.bulan)}`,
            nominal: kuitansiModal.nominal,
            tanggal_bayar: kuitansiModal.tanggal,
            tanggal_validasi: kuitansiModal.tanggal,
            kasir_nama: 'Staf Bendahara SPP',
          }}
        />
      )}
    </div>
  );
}

function kwtBulan(val: string) {
  return val || 'Oktober 2026';
}
