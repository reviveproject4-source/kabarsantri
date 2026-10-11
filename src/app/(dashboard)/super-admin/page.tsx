'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Search, 
  Send, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Sparkles,
  MessageCircle,
  X
} from 'lucide-react';
import { 
  getYayasanRegistrations, 
  activateYayasanRegistration, 
  updateYayasanStatus, 
  deleteYayasanRegistration, 
  YayasanRegistration 
} from '@/lib/yayasanRegistrationStore';
import { getWhatsAppWebUrl } from '@/lib/superAdminStore';

export default function SuperAdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [registrations, setRegistrations] = useState<YayasanRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active'>('all');
  const [selectedReg, setSelectedReg] = useState<YayasanRegistration | null>(null);
  const [activeModalData, setActiveModalData] = useState<{
    registration: YayasanRegistration;
    credentials: { email: string; pass: string; tenantId: string };
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [notif, setNotif] = useState('');

  const loadData = () => {
    setRegistrations(getYayasanRegistrations());
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('ks_yayasan_registered', handleUpdate);
    return () => window.removeEventListener('ks_yayasan_registered', handleUpdate);
  }, []);

  const handleAktivasi = (reg: YayasanRegistration) => {
    const result = activateYayasanRegistration(reg.id);
    if (result) {
      setActiveModalData(result);
      loadData();
      setNotif(`Yayasan "${reg.nama_yayasan}" berhasil diaktivasi! Kredensial akun siap dikirimkan.`);
      setTimeout(() => setNotif(''), 6000);
    }
  };

  const handleKirimWA = (reg: YayasanRegistration, email?: string, pass?: string) => {
    const adminEmail = email || reg.admin_email || `admin@${reg.nama_yayasan.toLowerCase().replace(/[^a-z0-9]/g, '')}.kabarsantri.id`;
    const adminPass = pass || reg.admin_temp_password || 'Santri2026!';
    
    const pesan = `*Assalamu'alaikum Warahmatullahi Wabarakatuh*

Yth. *${reg.nama_pimpinan}*
Pimpinan *${reg.nama_yayasan}* (${reg.kota})

Alhamdulillah, pendaftaran lembaga Anda di *KabarSantri v2.0* telah kami verifikasi dan *RESMI DIAKTIVASI*.

📋 *DATA LAYANAN PESANTREN:*
• Nama Lembaga: *${reg.nama_yayasan}*
• Paket Langganan: *${reg.paket_pilihan}*
• Estimasi Santri: *${reg.estimasi_santri}*
• Status: *Aktif & Berlangganan*

🔑 *KREDENSIAL LOGIN ADMINISTRATOR:*
• Link Portal: https://app.kabarsantri.id (atau localhost)
• Email Login: *${adminEmail}*
• Password Sementara: *${adminPass}*

Silakan login dan lengkapi data profil santri & asatidz perdana Anda. Tim kami siap mendampingi proses adaptasi sistem di pondok Anda.

_Jazakumullahu Khairan Katsiran._
Wassalamu'alaikum Warahmatullahi Wabarakatuh.

*Super Admin KabarSantri Indonesia*`;

    const url = getWhatsAppWebUrl(reg.no_whatsapp, pesan);
    window.open(url, '_blank');
  };

  const handleHapus = (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pengajuan "${nama}"?`)) {
      deleteYayasanRegistration(id);
      loadData();
      setNotif(`Data pengajuan "${nama}" telah dihapus.`);
      setTimeout(() => setNotif(''), 5000);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filtered = registrations.filter(r => {
    const matchStatus = filterStatus === 'all' ? true : r.status === filterStatus;
    const matchSearch = 
      r.nama_yayasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nama_pimpinan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.kota.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.no_whatsapp.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const totalPending = registrations.filter(r => r.status === 'pending').length;
  const totalActive = registrations.filter(r => r.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Notifikasi Terapung */}
      {notif && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white text-xs font-bold py-3 px-5 rounded-2xl shadow-xl flex items-center space-x-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* Header Dashboard Super Admin */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 uppercase tracking-wider">
                SUPER ADMIN
              </span>
              <span className="text-xs text-slate-400">• Pusat Kendali Pendaftaran Yayasan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Data Registrasi Yayasan (Welcome Screen)
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Memverifikasi dan mengaktivasi data pendaftaran yayasan baru yang masuk dari formulir Welcome Screen untuk penyerahan lisensi, akun administrator, dan paket langganan.
            </p>
          </div>

          <button
            onClick={loadData}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang</span>
          </button>
        </div>
      </div>

      {/* 3 Kartu Metrik Ringkas & Elegan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Total Pengajuan</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{registrations.length}</h3>
            <p className="text-[11px] text-slate-600 mt-0.5">Seluruh yayasan terdaftar</p>
          </div>
          <div className="w-11 h-11 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Menunggu Aktivasi</p>
            <h3 className="text-2xl font-black text-amber-700 mt-1">{totalPending}</h3>
            <p className="text-[11px] text-slate-600 mt-0.5">Membutuhkan tindakan</p>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Aktif & Berlangganan</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{totalActive}</h3>
            <p className="text-[11px] text-slate-600 mt-0.5">Tenant telah aktif</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Pencarian Sederhana */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari yayasan, pimpinan, kota..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({registrations.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Menunggu Aktivasi ({totalPending})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Aktif ({totalActive})
          </button>
        </div>
      </div>

      {/* Daftar Pengajuan Yayasan (Mobile Friendly Cards) */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">Belum Ada Data Pendaftaran</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Yayasan yang mengisi formulir di Welcome Screen akan otomatis muncul di sini untuk aktivasi lisensi.
            </p>
          </div>
        ) : (
          filtered.map((reg) => (
            <div
              key={reg.id}
              className={`bg-white rounded-2xl p-5 border transition shadow-xs space-y-4 ${
                reg.status === 'pending' ? 'border-amber-300/80 bg-amber-50/10' : 'border-slate-200'
              }`}
            >
              {/* Baris Atas: Info Yayasan & Badge Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 tracking-tight">
                      {reg.nama_yayasan}
                    </span>
                    {reg.status === 'pending' ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Menunggu Aktivasi
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                        <Check className="w-3 h-3 inline mr-0.5" />
                        <span>Aktif & Berlangganan</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{reg.kota}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mendaftar: {reg.created_at}</span>
                    </span>
                  </div>
                </div>

                {/* Paket Langganan Pill */}
                <div className="self-start sm:self-auto text-left sm:text-right">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200">
                    {reg.paket_pilihan}
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Kapasitas: {reg.estimasi_santri}</p>
                </div>
              </div>

              {/* Rincian Pimpinan & Kontak */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 text-xs">
                <div>
                  <span className="text-[11px] text-slate-600 block">Pimpinan Lembaga:</span>
                  <span className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{reg.nama_pimpinan}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-600 block">WhatsApp Pimpinan:</span>
                  <span className="font-bold text-emerald-700 flex items-center space-x-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{reg.no_whatsapp}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-600 block">Email Yayasan:</span>
                  <span className="font-medium text-slate-700 flex items-center space-x-1 mt-0.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{reg.email || '-'}</span>
                  </span>
                </div>
              </div>

              {/* Catatan Kebutuhan Khusus jika ada */}
              {reg.catatan && (
                <div className="text-xs text-slate-600 bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/50">
                  <strong className="text-slate-700">Catatan Yayasan:</strong> {reg.catatan}
                </div>
              )}

              {/* Action Buttons: Bersih & Fungsional */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleKirimWA(reg)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chat WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleHapus(reg.id, reg.nama_yayasan)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus Data Pengajuan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {reg.status === 'pending' ? (
                    <button
                      onClick={() => handleAktivasi(reg)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aktivasi Tenant Sekarang</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-medium text-slate-600">
                        ID: <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">{reg.activated_tenant_id || 'tenant-active'}</code>
                      </span>
                      <button
                        onClick={() => handleKirimWA(reg)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>Kirim Ulang Kredensial</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Aktivasi & WhatsApp Blast Kredensial */}
      {activeModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">Tenant Berhasil Diaktivasi!</h3>
              </div>
              <button
                onClick={() => setActiveModalData(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Akun tenant untuk <strong>{activeModalData.registration.nama_yayasan}</strong> telah dibuat di sistem. Kredensial login berikut siap diserahkan kepada pimpinan yayasan:
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">ID Tenant:</span>
                <span className="font-mono font-bold text-slate-900">{activeModalData.credentials.tenantId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Email Administrator:</span>
                <span className="font-mono font-bold text-emerald-700">{activeModalData.credentials.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Password Sementara:</span>
                <span className="font-mono font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {activeModalData.credentials.pass}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  handleKirimWA(
                    activeModalData.registration,
                    activeModalData.credentials.email,
                    activeModalData.credentials.pass
                  );
                }}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Kredensial via WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  handleCopyText(
                    `Email: ${activeModalData.credentials.email}\nPassword: ${activeModalData.credentials.pass}`
                  );
                }}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kredensial'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
