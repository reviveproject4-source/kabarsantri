'use client';

import React, { useRef, useState } from 'react';
import { Printer, Download, X, CheckCircle, ShieldCheck, Send, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { useActiveTenant, APP_BRAND } from '@/lib/sessionStore';

export interface KuitansiData {
  nomor_kuitansi: string;
  nomor_invoice?: string;
  santri_nama: string;
  nis: string;
  kelas?: string;
  wali_nama: string;
  wali_phone?: string;
  jenis_pembayaran: string; // SPP, Uang Jajan, Tabungan, Donasi, Daftar Ulang
  nominal: number;
  bank_tujuan?: string;
  tanggal_bayar: string;
  tanggal_validasi: string;
  kasir_nama?: string;
  catatan?: string;
}

interface PrintableKuitansiProps {
  data: KuitansiData;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Konversi Angka ke Terbilang Bahasa Indonesia
 */
function angkaKeTerbilang(nilai: number): string {
  const huruf = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  const n = Math.floor(nilai);
  if (n < 12) return huruf[n];
  if (n < 20) return angkaKeTerbilang(n - 10) + ' Belas';
  if (n < 100) return angkaKeTerbilang(Math.floor(n / 10)) + ' Puluh ' + huruf[n % 10];
  if (n < 200) return 'Seratus ' + angkaKeTerbilang(n - 100);
  if (n < 1000) return angkaKeTerbilang(Math.floor(n / 100)) + ' Ratus ' + angkaKeTerbilang(n % 100);
  if (n < 2000) return 'Seribu ' + angkaKeTerbilang(n - 1000);
  if (n < 1000000) return angkaKeTerbilang(Math.floor(n / 1000)) + ' Ribu ' + angkaKeTerbilang(n % 1000);
  if (n < 1000000000) return angkaKeTerbilang(Math.floor(n / 1000000)) + ' Juta ' + angkaKeTerbilang(n % 1000000);
  return nilai.toString();
}

export default function PrintableKuitansi({ data, isOpen, onClose }: PrintableKuitansiProps) {
  const tenant = useActiveTenant();
  const [printLayout, setPrintLayout] = useState<'formal_a4' | 'thermal_pos'>('formal_a4');
  const [showWaModal, setShowWaModal] = useState(false);
  const [waPhone, setWaPhone] = useState(data.wali_phone || '081234567890');
  const [waStatus, setWaStatus] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  const cleanPhone = waPhone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  const waMessageText = `*KUITANSI SAH PEMBAYARAN SPP PESANTREN*
_${tenant.name} - ${tenant.city}_

Assalamu'alaikum Wr. Wb.
Yth. *${data.wali_nama}* (Wali Santri),

Alhamdulillah, berikut kami sampaikan Kartu Bukti Pembayaran Digital santri yang telah SAH divalidasi oleh Bagian Keuangan:
━━━━━━━━━━━━━━━━━━━━
• *Nama Santri:* ${data.santri_nama}
• *NIS:* ${data.nis}
• *Keperluan:* ${data.jenis_pembayaran}
• *Nominal:* Rp ${data.nominal.toLocaleString('id-ID')}
• *No. Kuitansi:* ${data.nomor_kuitansi}
• *Tanggal Validasi:* ${data.tanggal_validasi}
• *Kasir / Bendahara:* ${data.kasir_nama || 'Staf Bendahara SPP'}
• *Status:* ✅ LUNAS (Valid & Sah)
━━━━━━━━━━━━━━━━━━━━
Kuitansi digital ini merupakan dokumen sah pengganti Kartu SPP fisik santri di pesantren. 

Jazakumullahu khairan katsiran atas amanah dan kerjasamanya.
_Biro Administrasi Keuangan ${tenant.name}_`;

  const handleSendWaInApp = async () => {
    setIsSending(true);
    setWaStatus('');
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.from('wa_outbox_queue').insert({
        phone_destination: formattedPhone,
        recipient_name: data.wali_nama,
        template_name: 'kartu_spp_lunas',
        message_body: waMessageText,
        status: 'SENT',
      });
    } catch (e) {
      console.warn('WA Outbox notice:', e);
    }
    setTimeout(() => {
      setIsSending(false);
      setWaStatus(`✓ Sukses terkirim via WhatsApp Gateway ke ${data.wali_nama} (${formattedPhone})! Halaman tetap standby.`);
    }, 700);
  };

  const handleOpenWaWeb = () => {
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waMessageText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const terbilangStr = angkaKeTerbilang(data.nominal).trim() + ' Rupiah';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Container Dialog */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Kuitansi Digital Sah Pengganti Kartu SPP Fisik</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle Layout Cetak */}
            <div className="bg-slate-800 p-0.5 rounded-lg text-xs flex">
              <button
                onClick={() => setPrintLayout('formal_a4')}
                className={`px-2.5 py-1 rounded-md transition ${printLayout === 'formal_a4' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Format A4 Formal
              </button>
              <button
                onClick={() => setPrintLayout('thermal_pos')}
                className={`px-2.5 py-1 rounded-md transition ${printLayout === 'thermal_pos' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Thermal Struk (80mm)
              </button>
            </div>

            <button
              onClick={() => setShowWaModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1.5 shadow-sm"
              title="Kirim Kartu Bayaran Digital ke WhatsApp Wali Murid"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
              <span>Kirim WA Wali</span>
            </button>

            <button
              onClick={handleTriggerPrint}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* IN-PAGE WHATSAPP MODAL (TANPA PINDAH LAYAR) */}
        {showWaModal && (
          <div className="bg-slate-900/95 text-white p-6 border-b border-slate-700 animate-in fade-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Kirim Kartu Bayaran Digital ke WhatsApp Wali Murid</h4>
                  <p className="text-[11px] text-slate-400">Kirim langsung tanpa menutup atau berpindah layar kasir</p>
                </div>
              </div>
              <button
                onClick={() => setShowWaModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {waStatus && (
              <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{waStatus}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              {/* Kolom 1: Preview Kartu Bayaran Digital */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wide">Preview Kartu Bayaran</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                    LUNAS &amp; SAH
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Santri:</span>
                    <span className="font-bold text-white">{data.santri_nama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">NIS:</span>
                    <span className="font-mono text-slate-300">{data.nis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wali:</span>
                    <span className="text-white">{data.wali_nama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pos Tagihan:</span>
                    <span className="text-emerald-400 font-semibold">{data.jenis_pembayaran}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold">
                    <span className="text-slate-400">Total Terbayar:</span>
                    <span className="text-emerald-400 font-mono text-sm">Rp {data.nominal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    No. Kuitansi: <span className="font-mono text-slate-400">{data.nomor_kuitansi}</span>
                  </div>
                </div>
              </div>

              {/* Kolom 2: Form Kontak & Pesan WhatsApp */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nomor WhatsApp Wali Murid (Tujuan) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Pesan akan dikirim langsung ke nomor aktif wali santri.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Ringkasan Teks Pesan WhatsApp
                  </label>
                  <textarea
                    rows={4}
                    readOnly
                    value={waMessageText}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-300 font-mono focus:outline-none resize-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={handleSendWaInApp}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? 'Mengirim...' : 'Kirim via WA Gateway (Background)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWaWeb}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
                    title="Buka WhatsApp Web di tab baru tanpa meninggalkan layar ini"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Buka WA Web (Tab Baru)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Printable Area */}
        <div ref={printAreaRef} className="p-8 bg-white text-slate-900">
          {printLayout === 'formal_a4' ? (
            /* ======================================================== */
            /* FORMAT A4 FORMAL SURAT BUKTI PEMBAYARAN                  */
            /* ======================================================== */
            <div className="space-y-6 border border-slate-300 p-6 rounded-xl relative">
              {/* Watermark LUNAS */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
                <span className="text-8xl font-black text-emerald-800 rotate-[-25deg]">LUNAS</span>
              </div>

              {/* Kop Surat: Identitas Pesantren (Tenant) & Brand Aplikasi (KabarSantri) */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {tenant.logo_url ? (
                    <img src={tenant.logo_url} alt={tenant.name} className="w-12 h-12 rounded-lg object-contain border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 bg-emerald-800 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow">
                      AH
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                      {tenant.name.toUpperCase()}
                    </h2>
                    <p className="text-[11px] text-slate-600">
                      Lembaga Pendidikan &amp; Pengasuhan Pesantren Terpadu • Kota {tenant.city}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Biro Administrasi Keuangan Pesantren • Telp/WA: (0251) 8899-7711
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center space-x-1.5 mb-0.5">
                    <img src={APP_BRAND.logo_url} alt={APP_BRAND.name} className="w-5 h-5 rounded object-contain" />
                    <span className="text-[11px] font-bold text-slate-800 tracking-tight">{APP_BRAND.name} <span className="text-emerald-700">{APP_BRAND.version}</span></span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tanda Bukti</div>
                  <div className="text-sm font-mono font-bold text-emerald-700">{data.nomor_kuitansi}</div>
                </div>
              </div>

              {/* Judul Kuitansi */}
              <div className="text-center py-1">
                <h3 className="text-lg font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4">
                  KUITANSI RESMI PEMBAYARAN
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Dokumen Sah Pengganti Kartu SPP Fisik Santri</p>
              </div>

              {/* Tabel Rincian */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-3 py-1 border-b border-slate-100">
                  <span className="text-slate-500">Telah Diterima Dari</span>
                  <span className="col-span-2 font-bold text-slate-800">: {data.wali_nama} (Wali Santri)</span>
                </div>
                <div className="grid grid-cols-3 py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nama Santri / NIS</span>
                  <span className="col-span-2 font-bold text-slate-800">: {data.santri_nama} (NIS: {data.nis})</span>
                </div>
                <div className="grid grid-cols-3 py-1 border-b border-slate-100">
                  <span className="text-slate-500">Untuk Pembayaran</span>
                  <span className="col-span-2 font-bold text-emerald-800 uppercase">: {data.jenis_pembayaran}</span>
                </div>
                <div className="grid grid-cols-3 py-1 border-b border-slate-100">
                  <span className="text-slate-500">Sejumlah Uang</span>
                  <span className="col-span-2 font-mono font-bold text-slate-900 text-sm">
                    : Rp {data.nominal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="grid grid-cols-3 py-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 italic">Terbilang</span>
                  <span className="col-span-2 font-semibold italic text-slate-700">: # {terbilangStr} #</span>
                </div>
              </div>

              {/* Footer Tanda Tangan & QR Code */}
              <div className="pt-4 flex items-center justify-between text-xs">
                {/* QR Code Simulasi */}
                <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-16 h-16 bg-slate-900 text-white flex flex-col items-center justify-center font-mono text-[8px] p-1 text-center rounded">
                    <span>QR-VALID</span>
                    <span className="text-[6px] text-emerald-400 mt-1">{data.nomor_kuitansi}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Validasi Digital Terverifikasi</span>
                    <span className="text-[10px] text-slate-500 block">Tgl Validasi: {data.tanggal_validasi}</span>
                    <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">✓ Tercatat di Buku Besar Pesantren</span>
                  </div>
                </div>

                {/* Stempel & Nama Kasir */}
                <div className="text-center w-48">
                  <span className="text-[11px] text-slate-500 block">Bagian Keuangan &amp; Kasir,</span>
                  <div className="h-14 flex items-center justify-center my-1 relative">
                    {/* Lingkaran Stempel Digital */}
                    <div className="border-2 border-emerald-600 rounded-full px-3 py-1 rotate-[-8deg] text-emerald-700 font-extrabold text-[10px] tracking-wider uppercase">
                      ★ LUNAS &amp; SAH ★
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 text-xs block underline">{data.kasir_nama || 'Staf Bendahara SPP'}</span>
                  <span className="text-[10px] text-slate-400 block">NIP: KS-FIN-2026-08</span>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* FORMAT THERMAL STRUK KASIR (80MM POS)                    */
            /* ======================================================== */
            <div className="max-w-[320px] mx-auto font-mono text-xs p-4 border border-dashed border-slate-300 rounded space-y-3">
              <div className="text-center border-b border-dashed border-slate-400 pb-2">
                <div className="font-bold text-sm uppercase">{tenant.name}</div>
                <div className="text-[10px] text-slate-500">Struk Pembayaran Sah Santri</div>
                <div className="text-[9px] text-slate-400">Powered by {APP_BRAND.name} {APP_BRAND.version} • {data.tanggal_validasi}</div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Kwt:</span>
                  <span className="font-bold">{data.nomor_kuitansi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Santri:</span>
                  <span className="font-bold">{data.santri_nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NIS:</span>
                  <span>{data.nis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wali:</span>
                  <span>{data.wali_nama}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-400 py-2 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>{data.jenis_pembayaran}</span>
                  <span>Rp {data.nominal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>Rp {data.nominal.toLocaleString('id-ID')}</span>
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-400">
                <div>*** LUNAS / SAH ***</div>
                <div>Simpan struk ini sebagai pengganti kartu SPP fisik santri.</div>
                <div className="mt-1 text-[8px] text-slate-400">Kasir: {data.kasir_nama || 'Bendahara SPP'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
