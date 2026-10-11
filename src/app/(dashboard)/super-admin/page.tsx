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
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  MessageCircle, 
  X,
  Sliders,
  CreditCard,
  Layers,
  BookOpen,
  Wallet,
  UserCheck,
  HeartHandshake,
  Home,
  FileSpreadsheet
} from 'lucide-react';
import { 
  getYayasanRegistrations, 
  activateYayasanRegistration, 
  updateYayasanFeatures,
  updateYayasanPaket,
  deleteYayasanRegistration, 
  YayasanRegistration,
  AVAILABLE_YAYASAN_FEATURES,
  PaketType,
  syncRegistrationsFromServer
} from '@/lib/yayasanRegistrationStore';
import { getWhatsAppWebUrl } from '@/lib/superAdminStore';

type SuperAdminTab = 'tenants' | 'fitur' | 'subscription';

export default function SuperAdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('tenants');
  const [registrations, setRegistrations] = useState<YayasanRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active'>('all');
  
  // State untuk Tab Fitur
  const [selectedFeatureRegId, setSelectedFeatureRegId] = useState<string>('');
  const [currentSelectedFeatures, setCurrentSelectedFeatures] = useState<string[]>([]);
  
  // State untuk Tab Subscription
  const [subFilterStatus, setSubFilterStatus] = useState<'all' | 'pending' | 'active'>('all');

  // Modal Aktivasi
  const [activeModalData, setActiveModalData] = useState<{
    registration: YayasanRegistration;
    credentials: { email: string; pass: string; tenantId: string };
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [notif, setNotif] = useState('');

  const loadData = async () => {
    const list = getYayasanRegistrations();
    setRegistrations(list);
    if (!selectedFeatureRegId && list.length > 0) {
      setSelectedFeatureRegId(list[0].id);
      setCurrentSelectedFeatures(list[0].features || []);
    }
    // Lakukan background sync dari server
    try {
      const serverSynced = await syncRegistrationsFromServer();
      setRegistrations(serverSynced);
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    loadData();

    const handleUpdate = () => {
      const list = getYayasanRegistrations();
      setRegistrations(list);
    };

    window.addEventListener('ks_yayasan_registered', handleUpdate);
    return () => window.removeEventListener('ks_yayasan_registered', handleUpdate);
  }, []);

  // Update selected features ketika yayasan yang dipilih di tab Fitur berubah
  useEffect(() => {
    if (selectedFeatureRegId) {
      const target = registrations.find(r => r.id === selectedFeatureRegId);
      if (target) {
        setCurrentSelectedFeatures(target.features || []);
      }
    }
  }, [selectedFeatureRegId, registrations]);

  const showNotification = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(''), 5000);
  };

  // 1. Aksi Aktivasi Tenant (ACC Super Admin)
  const handleAktivasi = async (reg: YayasanRegistration) => {
    const result = await activateYayasanRegistration(reg.id);
    if (result) {
      setActiveModalData(result);
      loadData();
      showNotification(`✓ Yayasan "${reg.nama_yayasan}" berhasil di-ACC & diaktivasi!`);
    }
  };

  // 2. Aksi WhatsApp Blast
  const handleKirimWA = (reg: YayasanRegistration, email?: string, pass?: string) => {
    const adminEmail = email || reg.admin_email || `admin@${reg.nama_yayasan.toLowerCase().replace(/[^a-z0-9]/g, '')}.kabarsantri.id`;
    const adminPass = pass || reg.admin_temp_password || 'Santri2026!';
    
    const pesan = `*Assalamu'alaikum Warahmatullahi Wabarakatuh*

Yth. *${reg.nama_pimpinan}*
Pimpinan *${reg.nama_yayasan}* (${reg.kota})

Alhamdulillah, pendaftaran yayasan Anda di *KabarSantri v2.0* telah kami verifikasi dan *RESMI DISETUJUI (DI-ACC)*.

📋 *DATA LAYANAN PESANTREN:*
• Nama Lembaga: *${reg.nama_yayasan}*
• Paket Langganan: *Paket ${reg.paket_pilihan}*
• Estimasi Santri: *${reg.estimasi_santri}*
• Status Akun: *Aktif & Berlangganan*

🔑 *KREDENSIAL LOGIN ADMINISTRATOR:*
• Link Portal: https://app.kabarsantri.id (atau localhost)
• Email Login: *${adminEmail}*
• Password Sementara: *${adminPass}*

Silakan login dan mulai kelola data profil santri & asatidz perdana Anda. Tim kami siap mendampingi adaptasi sistem di pesantren Anda.

_Jazakumullahu Khairan Katsiran._
Wassalamu'alaikum Warahmatullahi Wabarakatuh.

*Super Admin KabarSantri Indonesia*`;

    const url = getWhatsAppWebUrl(reg.no_whatsapp, pesan);
    window.open(url, '_blank');
  };

  // 3. Aksi Hapus Registrasi
  const handleHapus = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pengajuan "${nama}"?`)) {
      await deleteYayasanRegistration(id);
      loadData();
      showNotification(`Data pengajuan "${nama}" telah dihapus.`);
    }
  };

  // 4. Toggle Fitur Modul
  const handleToggleFeature = (featureId: string) => {
    let next: string[];
    if (currentSelectedFeatures.includes(featureId)) {
      next = currentSelectedFeatures.filter(f => f !== featureId);
    } else {
      next = [...currentSelectedFeatures, featureId];
    }
    setCurrentSelectedFeatures(next);
  };

  // 5. Simpan Konfigurasi Fitur
  const handleSimpanFitur = async () => {
    if (!selectedFeatureRegId) return;
    const target = registrations.find(r => r.id === selectedFeatureRegId);
    if (!target) return;

    await updateYayasanFeatures(selectedFeatureRegId, currentSelectedFeatures);
    loadData();
    showNotification(`✓ Fitur berhasil diperbarui untuk "${target.nama_yayasan}"!`);
  };

  // 6. Ganti Paket Langganan (Gratis ↔ Enterprise)
  const handleUbahPaket = async (regId: string, paketBaru: PaketType) => {
    const target = registrations.find(r => r.id === regId);
    if (!target) return;

    await updateYayasanPaket(regId, paketBaru);
    loadData();
    showNotification(`✓ Paket langganan "${target.nama_yayasan}" diubah menjadi Paket ${paketBaru}!`);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Filter List Tenant
  const filteredTenants = registrations.filter(r => {
    const matchStatus = filterStatus === 'all' ? true : r.status === filterStatus;
    const matchSearch = 
      r.nama_yayasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nama_pimpinan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.kota.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.no_whatsapp.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  // Filter List Subscription
  const filteredSubscriptions = registrations.filter(r => {
    if (subFilterStatus === 'all') return true;
    return r.status === subFilterStatus;
  });

  const totalPending = registrations.filter(r => r.status === 'pending').length;
  const totalActive = registrations.filter(r => r.status === 'active').length;

  const selectedYayasanData = registrations.find(r => r.id === selectedFeatureRegId);

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi Terapung */}
      {notif && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white text-xs font-bold py-3 px-5 rounded-2xl shadow-xl flex items-center space-x-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* Header Utama Super Admin */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                SUPER ADMIN
              </span>
              <span className="text-xs text-slate-400">• Pusat Kendali Lisensi &amp; Tenant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Konsol Manajemen Tenant KabarSantri
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Verifikasi pendaftaran yayasan baru dari Welcome Screen, sesuaikan modul fitur per lembaga, dan kelola status langganan pesantren (Gratis &amp; Enterprise).
            </p>
          </div>

          <button
            onClick={loadData}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang Data</span>
          </button>
        </div>

        {/* 3 TAB UTAMA SUPER ADMIN (HANYA DAFTAR TENANT, FITUR, SUBSCRIPTION) */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
              activeTab === 'tenants'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Daftar Tenant</span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] ${
              activeTab === 'tenants' ? 'bg-slate-900 text-amber-300' : 'bg-slate-700 text-slate-300'
            }`}>
              {registrations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fitur')}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
              activeTab === 'fitur'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Fitur (Seleksi Modul)</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
              activeTab === 'subscription'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscription (Langganan)</span>
            {totalPending > 0 && (
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black animate-pulse">
                {totalPending} Menunggu
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB DAFTAR TENANT                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'tenants' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Metrik Ringkas Tenant */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Lembaga Terdaftar</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{registrations.length}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Pendaftar dari Welcome Screen</p>
              </div>
              <div className="w-11 h-11 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Menunggu Aktivasi (ACC)</p>
                <h3 className="text-2xl font-black text-amber-700 mt-1">{totalPending}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Membutuhkan persetujuan</p>
              </div>
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Status Aktif (Telah Di-ACC)</p>
                <h3 className="text-2xl font-black text-emerald-700 mt-1">{totalActive}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Tenant aktif &amp; memiliki akses</p>
              </div>
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari yayasan, pimpinan, kota, WA..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

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
                Menunggu ACC ({totalPending})
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

          {/* Daftar Kartu Tenant */}
          <div className="space-y-4">
            {filteredTenants.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Data Tenant</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Data pendaftaran yayasan baru dari formulir Welcome Screen akan otomatis masuk ke sini untuk verifikasi &amp; aktivasi.
                </p>
              </div>
            ) : (
              filteredTenants.map((reg) => (
                <div
                  key={reg.id}
                  className={`bg-white rounded-2xl p-5 border transition shadow-xs space-y-4 ${
                    reg.status === 'pending' ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                  }`}
                >
                  {/* Baris Atas Info Yayasan */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900 tracking-tight">
                          {reg.nama_yayasan}
                        </span>
                        {reg.status === 'pending' ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            ⏳ Menunggu ACC Super Admin
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                            <Check className="w-3 h-3 inline mr-0.5" />
                            <span>Aktif &amp; Berlangganan</span>
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

                    <div className="self-start sm:self-auto text-left sm:text-right">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-xl border ${
                        reg.paket_pilihan === 'Enterprise'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        Paket {reg.paket_pilihan}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Estimasi: {reg.estimasi_santri}</p>
                    </div>
                  </div>

                  {/* Profil Kontak Pimpinan */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Pimpinan Lembaga:</span>
                      <span className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{reg.nama_pimpinan}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">WhatsApp Pimpinan:</span>
                      <span className="font-bold text-emerald-700 flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{reg.no_whatsapp}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Email Lembaga:</span>
                      <span className="font-medium text-slate-700 flex items-center space-x-1 mt-0.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{reg.email || '-'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Catatan Kebutuhan Khusus jika ada */}
                  {reg.catatan && (
                    <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                      <strong className="text-slate-800">Catatan Yayasan:</strong> {reg.catatan}
                    </div>
                  )}

                  {/* Tombol Aksi */}
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
                        onClick={() => {
                          setSelectedFeatureRegId(reg.id);
                          setActiveTab('fitur');
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-500" />
                        <span>Atur Fitur ({reg.features?.length || 0})</span>
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
                          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ACC &amp; Aktivasi Tenant Sekarang</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-medium text-slate-600">
                            ID: <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">{reg.activated_tenant_id || 'active'}</code>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB FITUR (BISA DIPILIH SESUAI DENGAN KEBUTUHAN YAYASAN)              */}
      {/* ========================================================================= */}
      {activeTab === 'fitur' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Seleksi Fitur */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full inline-block">
                  KUSTOMISASI FITUR PER YAYASAN
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Pilih Modul Sesuai Kebutuhan Yayasan
                </h2>
                <p className="text-xs text-slate-600">
                  Super Admin dapat mencentang atau menonaktifkan fitur modul KabarSantri sesuai kebutuhan masing-masing lembaga.
                </p>
              </div>

              {/* Selector Yayasan */}
              <div className="min-w-[280px]">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Pilih Yayasan / Pondok:
                </label>
                <select
                  value={selectedFeatureRegId}
                  onChange={(e) => setSelectedFeatureRegId(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {registrations.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nama_yayasan} ({r.kota}) - [{r.status === 'active' ? 'Aktif' : 'Pending'}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ringkasan Yayasan Terpilih */}
            {selectedYayasanData && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-900 text-sm">{selectedYayasanData.nama_yayasan}</span>
                  <div className="text-slate-600 flex items-center space-x-3">
                    <span>Pimpinan: <strong>{selectedYayasanData.nama_pimpinan}</strong></span>
                    <span>&bull;</span>
                    <span>Paket: <strong className="text-emerald-700">Paket {selectedYayasanData.paket_pilihan}</strong></span>
                    <span>&bull;</span>
                    <span>Status: <strong>{selectedYayasanData.status === 'active' ? 'Aktif' : 'Menunggu ACC'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setCurrentSelectedFeatures(['tahfidz', 'wali'])}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-xl text-xs transition"
                  >
                    Preset Gratis (2 Modul)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentSelectedFeatures(['tahfidz', 'spp', 'presensi', 'wali', 'rumah_tangga', 'akuntansi'])}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded-xl text-xs transition"
                  >
                    Preset Enterprise (Semua Modul)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Grid 6 Modul Fitur KabarSantri */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_YAYASAN_FEATURES.map((feature) => {
              const isChecked = currentSelectedFeatures.includes(feature.id);

              return (
                <div
                  key={feature.id}
                  onClick={() => handleToggleFeature(feature.id)}
                  className={`cursor-pointer p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-400 shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 opacity-70'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {feature.category}
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                      {feature.name}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
                    <span className={isChecked ? 'text-emerald-700' : 'text-slate-400'}>
                      {isChecked ? '✓ Modul Aktif' : '○ Modul Dinonaktifkan'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isChecked ? 'Dapat Diakses' : 'Terkunci'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tombol Simpan Modul Fitur */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Total <strong>{currentSelectedFeatures.length} dari 6 modul</strong> aktif untuk lembaga ini.
            </div>

            <button
              onClick={handleSimpanFitur}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pengaturan Fitur Lembaga</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB SUBSCRIPTION (MENUNGGU AKTIVASI, STATUS AKTIF)                    */}
      {/* ========================================================================= */}
      {activeTab === 'subscription' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Subscription */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full inline-block">
                  MANAJEMEN PAKET &amp; STATUS LANGGANAN
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Status Berlangganan &amp; Lisensi Tenant
                </h2>
                <p className="text-xs text-slate-600">
                  Pantau status aktivasi langganan (Menunggu Aktivasi vs Status Aktif) dengan 2 paket resmi: Gratis dan Enterprise.
                </p>
              </div>

              {/* Filter Status Subscription */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setSubFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    subFilterStatus === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({registrations.length})
                </button>
                <button
                  onClick={() => setSubFilterStatus('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    subFilterStatus === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Menunggu Aktivasi ({totalPending})
                </button>
                <button
                  onClick={() => setSubFilterStatus('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    subFilterStatus === 'active'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Status Aktif ({totalActive})
                </button>
              </div>
            </div>

            {/* Penjelasan 2 Paket Resmi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-900 text-xs">PAKET GRATIS (STARTER)</span>
                  <span className="font-bold text-emerald-700">Rp 0 / Selamanya</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Kapasitas 50 santri, modul Tahfidz &amp; Portal Wali Santri, lisensi tanpa batas waktu untuk pondok rintisan.
                </p>
              </div>

              <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-purple-900 text-xs">PAKET ENTERPRISE (SKALA PENUH)</span>
                  <span className="font-bold text-purple-700">Solusi Terpadu</span>
                </div>
                <p className="text-[11px] text-purple-800">
                  Seluruh modul (Tahfidz, SPP, Presensi, HRD, Sarpras, Akuntansi), kuota santri penuh &amp; dukungan prioritas.
                </p>
              </div>
            </div>
          </div>

          {/* Daftar Langganan Tenant */}
          <div className="space-y-4">
            {filteredSubscriptions.map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-slate-900">{reg.nama_yayasan}</span>
                      {reg.status === 'pending' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          ⏳ Menunggu Aktivasi
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ Status Aktif &amp; Berlangganan
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center space-x-3">
                      <span>Pimpinan: <strong>{reg.nama_pimpinan}</strong></span>
                      <span>&bull;</span>
                      <span>Domisili: {reg.kota}</span>
                      <span>&bull;</span>
                      <span>ID Tenant: <code>{reg.activated_tenant_id || 'Belum diaktivasi'}</code></span>
                    </div>
                  </div>

                  {/* Switcher 2 Paket Langganan */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-slate-500">Pilihan Paket:</span>
                    <button
                      type="button"
                      onClick={() => handleUbahPaket(reg.id, 'Gratis')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        reg.paket_pilihan === 'Gratis'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Gratis (50 Santri)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUbahPaket(reg.id, 'Enterprise')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        reg.paket_pilihan === 'Enterprise'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Enterprise (Full)
                    </button>
                  </div>
                </div>

                {/* Rincian Kuota & Akses */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Kapasitas Santri:</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {reg.paket_pilihan === 'Gratis' ? '50 Santri Binaan' : 'Kapasitas Penuh (Unlimited)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Masa Berlaku Lisensi:</span>
                    <span className="font-bold text-emerald-700 mt-0.5 block">
                      {reg.status === 'active' ? 'Aktif Hingga 31 Des 2026' : 'Menunggu ACC'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Modul Terbuka:</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {reg.features?.length || 2} Modul Sistem Aktif
                    </span>
                  </div>
                </div>

                {/* Action Row */}
                {reg.status === 'pending' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-amber-700">
                      Lembaga ini belum dapat membuka menu dashboard sebelum Super Admin menyetujui (ACC).
                    </span>
                    <button
                      onClick={() => handleAktivasi(reg)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACC &amp; Aktivasi Lisensi</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL AKTIVASI & KREDENSIAL AKUN                                          */}
      {/* ========================================================================= */}
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
