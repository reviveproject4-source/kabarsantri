'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Copy, 
  Check, 
  User, 
  Phone, 
  FileText, 
  Receipt, 
  BookOpen, 
  ShieldAlert, 
  Megaphone, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useActiveTenant } from '@/lib/sessionStore';

export interface WhatsAppQuickPayload {
  phone?: string;
  recipientName?: string;
  templateKey?: 'spp_tagihan' | 'kuitansi' | 'tahfidz' | 'izin' | 'pengumuman' | 'custom';
  params?: {
    santriNama?: string;
    nis?: string;
    kelas?: string;
    periode?: string;
    nominal?: number | string;
    rekeningTujuan?: string;
    kuitansiNo?: string;
    keperluan?: string;
    metodeBayar?: string;
    tanggal?: string;
    materiHafalan?: string;
    juz?: string | number;
    halamanSurah?: string;
    nilaiKelancaran?: string | number;
    statusLulus?: string;
    namaGuru?: string;
    catatanGuru?: string;
    jenisIzin?: string;
    alasanIzin?: string;
    waktuKembali?: string;
    isiPengumuman?: string;
    pesanKustom?: string;
  };
  defaultMessage?: string;
  directLaunch?: boolean;
}

export function formatWhatsAppNumber(num: string): string {
  let clean = (num || '').replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }
  return clean;
}

export function openDirectWhatsApp(phone: string, message: string): string {
  const clean = formatWhatsAppNumber(phone);
  if (!clean || clean.length < 9) {
    if (typeof window !== 'undefined') {
      alert('Silakan periksa nomor WhatsApp tujuan (minimal 9 digit).');
    }
    return '';
  }
  const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  if (typeof window !== 'undefined') {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }
  return waUrl;
}

export function openWhatsAppQuickModal(payload: WhatsAppQuickPayload) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ks_open_wa_quick', { detail: payload }));
  }
}

export default function WhatsAppQuickModal() {
  const tenant = useActiveTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [templateKey, setTemplateKey] = useState<'spp_tagihan' | 'kuitansi' | 'tahfidz' | 'izin' | 'pengumuman' | 'custom'>('spp_tagihan');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [params, setParams] = useState<Record<string, any>>({});

  const formatPhoneNumber = (num: string): string => {
    let clean = num.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (clean.startsWith('8')) {
      clean = '62' + clean;
    }
    return clean;
  };

  const generateTemplateMessage = (
    key: typeof templateKey, 
    p: Record<string, any>, 
    pesantrenName: string,
    recName: string
  ): string => {
    const santri = p.santriNama || recName || 'Santri';
    const nominalStr = typeof p.nominal === 'number' 
      ? p.nominal.toLocaleString('id-ID') 
      : (p.nominal || '500.000');

    switch (key) {
      case 'spp_tagihan':
        return `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. Bapak/Ibu Wali dari ananda *${santri}*,
Semoga Bapak/Ibu senantiasa dalam limpahan taufiq dan kesehatan dari Allah SWT.

Kami dari Bagian Keuangan *${pesantrenName}* bermaksud menyampaikan pengingat administrasi iuran pendidikan / SPP santri:
━━━━━━━━━━━━━━━━━━━━
• *Nama Santri:* ${santri}${p.nis ? ` (NIS: ${p.nis})` : ''}
• *Kelas / Rombel:* ${p.kelas || 'Madrasah Pondok'}
• *Periode:* ${p.periode || 'Bulan Berjalan'}
• *Kewajiban SPP:* Rp ${nominalStr}
• *Rekening Resmi:* ${p.rekeningTujuan || 'Bank Syariah Indonesia (BSI) - Rekening Resmi Yayasan'}
━━━━━━━━━━━━━━━━━━━━
Pembayaran dapat dilakukan melalui transfer rekening di atas atau setor tunai di kantor pesantren. Jika Bapak/Ibu telah menunaikan pembayaran, mohon konfirmasikan bukti transfer atau abaikan pesan pengingat ini.

Jazakumullahu khairan katsiran atas perhatian dan kerjasamanya.
Wassalamu'alaikum Warahmatullahi Wabarakatuh.
_Biro Keuangan ${pesantrenName}_`;

      case 'kuitansi':
        return `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. Bapak/Ibu Wali dari ananda *${santri}*,
Alhamdulillah, pembayaran berikut telah kami terima dan tervalidasi SAH:
━━━━━━━━━━━━━━━━━━━━
• *No. Kuitansi:* ${p.kuitansiNo || `KWT-${Date.now().toString().slice(-6)}`}
• *Santri:* ${santri}${p.kelas ? ` (${p.kelas})` : ''}
• *Jenis Pembayaran:* ${p.keperluan || 'SPP Santri Bulanan'}
• *Nominal Diterima:* Rp ${nominalStr}
• *Metode:* ${p.metodeBayar || 'Transfer Bank Terverifikasi'}
• *Waktu Sah:* ${p.tanggal || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
• *Status:* ✅ LUNAS (Valid & Sah)
━━━━━━━━━━━━━━━━━━━━
Kuitansi digital ini merupakan dokumen sah pengganti Kartu SPP fisik santri di pesantren. Riwayat lengkap dapat dicek di Portal Wali Santri.

Jazakumullahu khairan katsiran.
_Biro Administrasi Keuangan ${pesantrenName}_`;

      case 'tahfidz':
        return `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. Bapak/Ibu Wali dari ananda *${santri}*,
Alhamdulillah, ananda telah menyelesaikan setoran hafalan Al-Qur'an pada halaqah tahfidz:
━━━━━━━━━━━━━━━━━━━━
• *Santri:* ${santri}${p.kelas ? ` (${p.kelas})` : ''}
• *Materi:* ${p.materiHafalan || "Tahfidz Al-Qur'an"}
• *Capaian:* Juz ${p.juz || '30'} • ${p.halamanSurah || 'Halaman Mutabaah'}
• *Nilai Kelancaran:* ${p.nilaiKelancaran || '85'} / 100
• *Predikat:* ${p.statusLulus || 'Mutqin / Lulus'}
• *Musyrif Pengampu:* ${p.namaGuru || 'Ustadz Pembimbing Halaqah'}
• *Catatan:* "${p.catatanGuru || 'Alhamdulillah bacaan lancar, terus tingkatkan muraja\'ah di waktu luang.'}"
━━━━━━━━━━━━━━━━━━━━
Mohon doa dan motivasi senantiasa dari orang tua di rumah agar ananda istiqomah menjaga hafalan kalamullah.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.
_Koordinator Tahfidz & KBM ${pesantrenName}_`;

      case 'izin':
        return `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. Bapak/Ibu Wali dari ananda *${santri}*,
Kami dari Bagian Kesantrian *${pesantrenName}* menginformasikan mengenai perizinan santri:
━━━━━━━━━━━━━━━━━━━━
• *Nama Santri:* ${santri}${p.kelas ? ` (${p.kelas})` : ''}
• *Jenis Perizinan:* ${p.jenisIzin || 'Izin Keluar / Kepulangan'}
• *Keperluan:* ${p.alasanIzin || 'Kepentingan Keluarga Mendesak'}
• *Batas Waktu Kembali:* ${p.waktuKembali || 'Ahad, Pukul 17:00 WIB'}
━━━━━━━━━━━━━━━━━━━━
Mohon bantuan Bapak/Ibu untuk memastikan ananda kembali ke asrama tepat waktu sesuai jadwal demi kedisiplinan dan keamanan ananda di pondok.

Jazakumullahu khairan katsiran.
_Bagian Kesantrian & Pengasuhan ${pesantrenName}_`;

      case 'pengumuman':
        return `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. Bapak/Ibu Wali Santri *${pesantrenName}*,
Sehubungan dengan agenda kegiatan pesantren, kami menginformasikan maklumat penting berikut:
━━━━━━━━━━━━━━━━━━━━
${p.isiPengumuman || 'Diberitahukan kepada seluruh wali santri bahwa kegiatan belajar mengajar dan penjemputan santri libur semester akan dilaksanakan sesuai kalender pendidikan pondok.'}
━━━━━━━━━━━━━━━━━━━━
Demikian maklumat ini kami sampaikan. Atas perhatian dan kerjasamanya, kami haturkan terima kasih.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.
_Sekretariat Pimpinan ${pesantrenName}_`;

      case 'custom':
      default:
        return p.pesanKustom || `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nYth. Bapak/Ibu ${recName || 'Wali Santri'},\n\n[Tuliskan pesan Anda di sini]\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.\n_${pesantrenName}_`;
    }
  };

  useEffect(() => {
    const handleOpen = (e: any) => {
      const payload: WhatsAppQuickPayload = e.detail || {};
      const newPhone = payload.phone || '';
      const newName = payload.recipientName || '';
      const newKey = payload.templateKey || 'spp_tagihan';
      const newParams = payload.params || {};

      setPhone(newPhone);
      setRecipientName(newName);
      setTemplateKey(newKey);
      setParams(newParams);

      if (payload.directLaunch && newPhone) {
        const textToSend = payload.defaultMessage || generateTemplateMessage(newKey, newParams, tenant.name || 'Pesantren', newName);
        openDirectWhatsApp(newPhone, textToSend);
        return;
      }

      if (payload.defaultMessage) {
        setMessage(payload.defaultMessage);
      } else {
        const generated = generateTemplateMessage(newKey, newParams, tenant.name || 'Pesantren', newName);
        setMessage(generated);
      }

      setIsOpen(true);
      setCopied(false);
    };

    window.addEventListener('ks_open_wa_quick', handleOpen);
    return () => window.removeEventListener('ks_open_wa_quick', handleOpen);
  }, [tenant.name]);

  const handleTemplateChange = (newKey: typeof templateKey) => {
    setTemplateKey(newKey);
    const generated = generateTemplateMessage(newKey, params, tenant.name || 'Pesantren', recipientName);
    setMessage(generated);
  };

  const handleSendWa = () => {
    const formatted = formatPhoneNumber(phone);
    if (!formatted || formatted.length < 9) {
      alert('Silakan masukkan nomor WhatsApp tujuan yang valid (minimal 9 digit).');
      return;
    }
    const waUrl = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">WA Cepat KabarSantri</h3>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                  1-Klik Kirim
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 leading-tight mt-0.5">
                Kirim pesan langsung via WhatsApp Web / App tanpa harus simpan kontak
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Baris Input Identitas Penerima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold flex items-center gap-1.5 mb-1 text-[11px]">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nomor WhatsApp Tujuan *</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Format: 08xx atau 628xx (otomatis disesuaikan)
              </span>
            </div>

            <div>
              <label className="text-slate-700 font-bold flex items-center gap-1.5 mb-1 text-[11px]">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Nama Penerima (Wali / Pegawai)</span>
              </label>
              <input
                type="text"
                placeholder="Nama Bapak / Ibu Wali"
                value={recipientName}
                onChange={(e) => {
                  setRecipientName(e.target.value);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Penerima pesan WhatsApp
              </span>
            </div>
          </div>

          {/* Pemilihan Template Pesan Siap Kirim */}
          <div>
            <label className="text-slate-700 font-bold flex items-center gap-1.5 mb-2 text-[11px]">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pilih Template Pesan Siap Kirim:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { key: 'spp_tagihan', label: 'Pengingat SPP', icon: Receipt },
                { key: 'kuitansi', label: 'Kuitansi Lunas', icon: ShieldAlert },
                { key: 'tahfidz', label: 'Progres Tahfidz', icon: BookOpen },
                { key: 'izin', label: 'Izin Santri', icon: FileText },
                { key: 'pengumuman', label: 'Pengumuman', icon: Megaphone },
                { key: 'custom', label: 'Pesan Bebas', icon: Sparkles },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = templateKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleTemplateChange(item.key as any)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="truncate text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Area Teks Pesan (Dapat Diedit Langsung) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold flex items-center gap-1.5 text-[11px]">
                <span>Teks Pesan (Dapat Diedit Bebas):</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {message.length} Karakter
                </span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-600" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={9}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ketik isi pesan WhatsApp di sini..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-sans text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400">
              Tips WhatsApp: Gunakan <code className="text-emerald-700 font-mono">*kata*</code> untuk tebal dan <code className="text-emerald-700 font-mono">_kata_</code> untuk miring.
            </p>
          </div>
        </div>

        {/* Footer Tombol Eksekusi */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>Nomor: </span>
            <strong className="text-slate-800 font-mono">
              {phone ? formatPhoneNumber(phone) : 'Belum diisi'}
            </strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer flex-1 sm:flex-initial"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleSendWa}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer flex-1 sm:flex-initial"
              title="Langsung berpindah ke layar chat nomor tujuan WhatsApp dengan teks terformat"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
