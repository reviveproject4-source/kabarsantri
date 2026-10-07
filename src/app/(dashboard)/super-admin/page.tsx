'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Plus, 
  Building2, 
  Users, 
  CheckCircle2, 
  Send, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Award, 
  AlertTriangle, 
  BookOpen, 
  Check, 
  Search, 
  Filter, 
  RefreshCw,
  PhoneCall,
  KeyRound,
  Eye,
  LogIn
} from 'lucide-react';
import { 
  getSuperAdminTenants, 
  saveSuperAdminTenants, 
  createNewTenant, 
  formatWhatsAppWelcomeMessage, 
  getWhatsAppWebUrl, 
  markWelcomeWASent, 
  setActiveTenantId, 
  getActiveTenantId,
  TenantRecord, 
  SubscriptionTier 
} from '@/lib/superAdminStore';

export default function SuperAdminOnboardingPage() {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'tier1_free' | 'tier2_pro'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [waModalTenant, setWaModalTenant] = useState<TenantRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTenant, setActiveTenant] = useState<string>('tenant-pesantren-001');
  const [notif, setNotif] = useState('');

  // Form Onboarding State
  const [formData, setFormData] = useState({
    name: '',
    leader_name: '',
    leader_wa: '',
    city: '',
    tier: 'tier1_free' as SubscriptionTier,
    target_launch_date: 'Rabu, 07 Oktober 2026',
    notes: 'Tenant perdana paket Starter 50 Santri.',
  });

  const refreshTenants = () => {
    setTenants(getSuperAdminTenants());
    setActiveTenant(getActiveTenantId());
  };

  useEffect(() => {
    refreshTenants();
    const handleUpdate = () => refreshTenants();
    window.addEventListener('ks_tenants_updated', handleUpdate);
    window.addEventListener('ks_active_tenant_changed', handleUpdate);
    return () => {
      window.removeEventListener('ks_tenants_updated', handleUpdate);
      window.removeEventListener('ks_active_tenant_changed', handleUpdate);
    };
  }, []);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.leader_name || !formData.leader_wa) {
      alert('Mohon lengkapi Nama Pesantren, Nama Pimpinan, dan No. WhatsApp.');
      return;
    }

    const created = createNewTenant({
      name: formData.name,
      leader_name: formData.leader_name,
      leader_wa: formData.leader_wa,
      city: formData.city || 'Indonesia',
      tier: formData.tier,
      target_launch_date: formData.target_launch_date,
      notes: formData.notes,
    });

    setModalOpen(false);
    refreshTenants();
    setNotif(`Tenant "${created.name}" berhasil didaftarkan! Kredensial login otomatis di-generate.`);
    setTimeout(() => setNotif(''), 6000);

    // Langsung buka modal WhatsApp Blast untuk review & kirim kredensial
    setWaModalTenant(created);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendWA = (tenant: TenantRecord) => {
    markWelcomeWASent(tenant.id);
    const msg = formatWhatsAppWelcomeMessage(tenant);
    const url = getWhatsAppWebUrl(tenant.leader_wa, msg);
    refreshTenants();
    window.open(url, '_blank');
  };

  const handleSwitchTenant = (tenant: TenantRecord) => {
    setActiveTenantId(tenant.id);
    setActiveTenant(tenant.id);
    setNotif(`Sistem beralih mengaktifkan workspace tenant: "${tenant.name}" (${tenant.tier === 'tier1_free' ? 'Tier 1 Gratis' : 'Pro'})`);
    setTimeout(() => setNotif(''), 6000);
  };

  // Filter & Search
  const filteredTenants = tenants.filter(t => {
    const matchFilter = activeFilter === 'all' ? true : t.tier === activeFilter;
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.leader_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalTenants = tenants.length;
  const tier1Count = tenants.filter(t => t.tier === 'tier1_free').length;
  const totalSantriManaged = tenants.reduce((acc, t) => acc + (t.current_santri || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-lg border border-indigo-900/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 uppercase tracking-wide">
              SUPER ADMIN CONSOLE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Multi-Tenant Architecture Ready
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Onboarding Tenant Baru & Manajemen Kuota</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Pusat kendali pendaftaran mitra pesantren perdana (Rabu), alokasi kuota <strong>Tier 1 Gratis (50 Santri: Hafalan + Adab + Reward + Pelanggaran)</strong>, dan generator pengiriman kredensial instan via WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setFormData({
                name: 'Pesantren Tahfidz Nurul Huda',
                leader_name: 'Ust. H. Fauzan Mansur, Lc.',
                leader_wa: '081389012345',
                city: 'Kediri, Jawa Timur',
                tier: 'tier1_free',
                target_launch_date: 'Rabu, 07 Oktober 2026',
                notes: 'Tenant perdana paket Starter 50 Santri - Onboarding Rabu.',
              });
              setModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Onboarding Tenant Baru (Rabu)</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{notif}</span>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-semibold block">Total Tenant Pesantren</span>
          <span className="text-2xl font-black text-slate-800 block">{totalTenants} Lembaga</span>
          <span className="text-[11px] text-emerald-600 font-medium">100% Aktif & Berjalan</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold block">Paket Tier 1 (Free 50)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Gratis</span>
          </div>
          <span className="text-2xl font-black text-emerald-700 block">{tier1Count} Pesantren</span>
          <span className="text-[11px] text-slate-500">Hafalan + Adab + Disiplin</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-semibold block">Santri Terkelola</span>
          <span className="text-2xl font-black text-blue-700 block">{totalSantriManaged} Santri</span>
          <span className="text-[11px] text-slate-500">Akumulasi seluruh tenant</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-500 font-semibold block">Active Workspace (Uji Coba)</span>
          <span className="text-xs font-bold text-indigo-700 truncate block mt-1">
            {tenants.find(t => t.id === activeTenant)?.name || 'Pondok Al-Hikmah'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{activeTenant}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
              activeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Tenant ({totalTenants})
          </button>
          <button
            onClick={() => setActiveFilter('tier1_free')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 ${
              activeFilter === 'tier1_free' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tier 1: Starter Gratis 50 Santri ({tier1Count})</span>
          </button>
          <button
            onClick={() => setActiveFilter('tier2_pro')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
              activeFilter === 'tier2_pro' ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Tier 2 & 3: Pro Enterprise
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pesantren / pimpinan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Tenant Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Pesantren & Subdomain</th>
                <th className="py-3 px-4">Pimpinan & No. WhatsApp</th>
                <th className="py-3 px-4">Paket Tier & Fitur</th>
                <th className="py-3 px-4 text-center">Kuota Santri</th>
                <th className="py-3 px-4 text-center">Status Onboarding</th>
                <th className="py-3 px-4 text-right">Aksi Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data tenant yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => {
                  const isCurrentActive = activeTenant === t.id;
                  const isTier1 = t.tier === 'tier1_free';
                  const usagePercent = Math.round((t.current_santri / t.quota_santri) * 100);

                  return (
                    <tr key={t.id} className={`hover:bg-slate-50/70 transition ${isCurrentActive ? 'bg-indigo-50/30' : ''}`}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isTier1 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{t.name}</span>
                              {isCurrentActive && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-600 text-white">
                                  Workspace Aktif
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <span className="font-mono">{t.portal_subdomain}</span>
                              <span>•</span>
                              <span>{t.city}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{t.leader_name}</div>
                        <div className="text-[11px] text-emerald-700 font-mono flex items-center gap-1">
                          <span>WA: {t.leader_wa}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isTier1 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            {isTier1 ? 'Tier 1 Starter Gratis' : 'Tier 2 Pro Pesantren'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isTier1 
                            ? '✓ Hafalan + Adab + Reward + Pelanggaran + Wali' 
                            : '✓ Full 6-Pilar (KBM, HRD, Keuangan, RT)'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-block min-w-28 text-left">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                            <span>{t.current_santri} Santri</span>
                            <span className="text-slate-400">/ {t.quota_santri}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${usagePercent > 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Aktif
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Launch: {t.target_launch_date || t.created_at}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setWaModalTenant(t)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] rounded-lg transition inline-flex items-center space-x-1"
                            title="Kirim pesan selamat datang & kredensial login via WA"
                          >
                            <Send className="w-3 h-3 text-emerald-600" />
                            <span>Kirim WA</span>
                          </button>

                          <button
                            onClick={() => handleSwitchTenant(t)}
                            className={`px-2.5 py-1.5 font-bold text-[11px] rounded-lg transition inline-flex items-center space-x-1 ${
                              isCurrentActive 
                                ? 'bg-indigo-600 text-white shadow-xs cursor-default' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                            title="Ganti workspace aktif untuk menguji coba tampilan tenant ini"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>{isCurrentActive ? 'Aktif' : 'Pilih'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ONBOARDING TENANT BARU (WIZARD)                                 */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                  Formulir Onboarding Tenant
                </span>
                <h3 className="font-bold text-slate-800 text-base mt-1">Daftarkan Pesantren Baru (Target: Rabu)</h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Pondok Pesantren / Lembaga:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Pesantren Tahfidz Nurul Huda"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pimpinan / Pengasuh:</label>
                  <input
                    type="text"
                    required
                    value={formData.leader_name}
                    onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                    placeholder="Contoh: KH. Fauzan Mansur, Lc."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Pimpinan:</label>
                  <input
                    type="tel"
                    required
                    value={formData.leader_wa}
                    onChange={(e) => setFormData({ ...formData, leader_wa: e.target.value })}
                    placeholder="Contoh: 081389012345"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kota / Kabupaten & Provinsi:</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Contoh: Kediri, Jawa Timur"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Pilihan Paket Tier */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Pilih Paket Layanan (Subscription Tier):</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setFormData({ ...formData, tier: 'tier1_free' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition space-y-1 ${
                      formData.tier === 'tier1_free'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-800">Tier 1: Starter Gratis</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-600 text-white rounded">GRATIS</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700">Kuota: 50 Santri</div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Fitur: Hafalan Al-Qur'an, Adab, Reward, dan Pelanggaran Santri.
                    </p>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, tier: 'tier2_pro' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition space-y-1 ${
                      formData.tier === 'tier2_pro'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-950'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-800">Tier 2: Pro Pesantren</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-600 text-white rounded">PRO</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700">Kuota: 250 Santri</div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Fitur: 6 Pilar Lengkap (KBM, HRD, Keuangan, dan Rumah Tangga).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Launching:</label>
                  <input
                    type="text"
                    value={formData.target_launch_date}
                    onChange={(e) => setFormData({ ...formData, target_launch_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan:</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">⚡ Otomatisasi Sistem:</span>
                <p>• Akun Administrator & password sementara acak akan otomatis dibuatkan.</p>
                <p>• Teks ucapan WhatsApp resmi dapat langsung disalin atau dikirim dengan 1 klik.</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Simpan & Generate Kredensial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: WHATSAPP WELCOME BLAST & KREDENSIAL VIEW                         */}
      {/* ========================================================================= */}
      {waModalTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Kirim Kredensial Onboarding via WhatsApp</h3>
                  <p className="text-[11px] text-slate-500">Tujuan: {waModalTenant.leader_name} ({waModalTenant.leader_wa})</p>
                </div>
              </div>
              <button 
                onClick={() => setWaModalTenant(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Credentials Info Box */}
            <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs space-y-1.5">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                <span>Kredensial Akses Backoffice:</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-500 block">Link Backoffice:</span>
                  <span className="font-mono font-bold text-slate-800">http://localhost:3001</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Username / Email:</span>
                  <span className="font-mono font-bold text-slate-800">{waModalTenant.admin_email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Password Sementara:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                    {waModalTenant.admin_temp_password}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Paket Layanan:</span>
                  <span className="font-bold text-slate-800">
                    {waModalTenant.tier === 'tier1_free' ? 'Tier 1 Gratis (50 Santri)' : 'Tier 2 Pro'}
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp Text Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700">Preview Pesan WhatsApp Resmi:</label>
                <button
                  onClick={() => handleCopyText(formatWhatsAppWelcomeMessage(waModalTenant))}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Teks'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={12}
                value={formatWhatsAppWelcomeMessage(waModalTenant)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Otomatis redirect ke WhatsApp Web / App
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setWaModalTenant(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 text-xs"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleSendWA(waModalTenant)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition text-xs flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim via WhatsApp Web</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
