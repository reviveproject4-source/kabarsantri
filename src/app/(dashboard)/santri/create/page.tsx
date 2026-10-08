'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Users, 
  Lock 
} from 'lucide-react';
import { saveTenantSantri, getSharedSantriList, isTenantMode } from '@/lib/sharedDataStore';
import { checkStudentQuota, upgradeProduct, FREE_PACKAGE_MAX_ACTIVE_STUDENTS } from '@/lib/tenantEntitlementStore';
import { useActiveTenant } from '@/lib/sessionStore';

export default function TambahSantriPage() {
  const router = useRouter();
  const tenant = useActiveTenant();
  const isTenant = typeof window !== 'undefined' ? isTenantMode() : false;
  const listUrl = isTenant ? '/santri/list?mode=tenant' : '/santri/list';
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quotaExceededError, setQuotaExceededError] = useState<string | null>(null);
  const [quotaStats, setQuotaStats] = useState({
    currentActive: 0,
    currentArchived: 0,
    maxAllowed: 50,
    canAdd: true,
    isFreeZakat: true,
  });

  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    nama_lengkap: '',
    gender: 'L',
    tempat_lahir: '',
    tanggal_lahir: '',
    unit_id: 'unit-tahfidz-nh',
    kamar_id: 'kamar-asrama-nh',
    wali_nama: '',
    wali_kontak: '',
  });

  const refreshQuota = () => {
    const list = getSharedSantriList();
    const stats = checkStudentQuota(tenant.id, list);
    setQuotaStats({
      currentActive: stats.currentActive,
      currentArchived: stats.currentArchived,
      maxAllowed: stats.maxAllowed,
      canAdd: stats.canAdd,
      isFreeZakat: stats.isFreeZakat,
    });
    if (!stats.canAdd) {
      setQuotaExceededError(
        stats.message || `Kuota paket gratis maksimal ${stats.maxAllowed} santri telah tercapai. Silakan upgrade paket atau hubungi KabarSantri.`
      );
    } else {
      setQuotaExceededError(null);
    }
  };

  useEffect(() => {
    refreshQuota();
    const handler = () => refreshQuota();
    window.addEventListener('ks_tenant_santri_updated', handler);
    window.addEventListener('ks_entitlements_updated', handler);
    return () => {
      window.removeEventListener('ks_tenant_santri_updated', handler);
      window.removeEventListener('ks_entitlements_updated', handler);
    };
  }, [tenant.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const list = getSharedSantriList();
    const stats = checkStudentQuota(tenant.id, list);

    // Business Rule Section 9: Perilaku saat melebihi 50 santri
    if (!stats.canAdd) {
      setLoading(false);
      const errMsg = `Kuota paket gratis maksimal ${stats.maxAllowed} santri telah tercapai. Silakan upgrade paket atau hubungi KabarSantri.`;
      setQuotaExceededError(errMsg);
      return;
    }

    saveTenantSantri({
      nis: formData.nis,
      nama: formData.nama_lengkap,
      kelas_id: formData.unit_id,
      kelas: formData.unit_id === 'unit-mts-putra' ? 'Kelas 7A Tahfidz Putra' : 'Kelas Tahfidz Nurul Huda',
      kamar: formData.kamar_id === 'kamar-101' ? 'Kamar 101 - Asrama' : 'Kamar Asrama Santri',
      gender: formData.gender === 'P' ? 'akhwat' : 'ikhwan',
      wali_nama: formData.wali_nama || 'Wali Santri',
      wali_kontak: formData.wali_kontak || '-',
      status: 'active'
    });

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      refreshQuota();
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link 
            href={listUrl} 
            className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tambah Santri Baru</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pendaftaran Data Pokok Santri ({tenant.name})
            </p>
          </div>
        </div>

        {/* Quota Meter Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right">
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            {quotaStats.isFreeZakat ? 'Kuota Paket Zakat' : 'Kapasitas Santri'}
          </div>
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {quotaStats.currentActive} / {quotaStats.maxAllowed} Santri Aktif
            {quotaStats.currentArchived > 0 && (
              <span className="text-[10px] text-slate-400 ml-1 font-normal">
                (+{quotaStats.currentArchived} arsip)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quota Exceeded Block Banner */}
      {quotaExceededError && (
        <div className="p-4 md:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3 animate-in fade-in">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold">Batas Kuota Santri Tercapai</h3>
              <p className="text-xs leading-relaxed font-medium">
                {quotaExceededError}
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Sistem tidak menghapus data Anda. Santri aktif saat ini ({quotaStats.currentActive}) tetap dapat menggunakan fitur Laporan Hafalan dan Absensi Santri.
              </p>
            </div>
          </div>
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                // Quick test toggle: upgrade to commercial
                upgradeProduct(tenant.id, 'rapot');
                refreshQuota();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade Paket KabarSantri</span>
            </button>
            <Link
              href={listUrl}
              className="px-4 py-2 border border-amber-300 dark:border-amber-700 bg-white/60 dark:bg-slate-900 text-xs font-semibold rounded-xl text-amber-900 dark:text-amber-200 hover:bg-white transition"
            >
              Kembali ke Daftar Santri
            </Link>
          </div>
        </div>
      )}

      {success ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800 shadow-inner">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Santri Berhasil Didaftarkan!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Data santri <strong>{formData.nama_lengkap}</strong> (NIS: {formData.nis}) telah aktif di database tenant Anda.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href={listUrl}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              Lihat Daftar Santri →
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({
                  ...formData,
                  nis: String(Number(formData.nis) + 1),
                  nama_lengkap: ''
                });
                refreshQuota();
              }}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition"
            >
              Tambah Santri Lain
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Induk Santri (NIS) *
              </label>
              <input
                type="text"
                required
                disabled={!quotaStats.canAdd}
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                placeholder="Contoh: 202601001"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NISN (Kemenag / Kemdikbud)
              </label>
              <input
                type="text"
                disabled={!quotaStats.canAdd}
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                placeholder="Contoh: 0089283741"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Santri *
            </label>
            <input
              type="text"
              required
              disabled={!quotaStats.canAdd}
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
              placeholder="Masukkan nama lengkap santri..."
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Kelamin *
              </label>
              <select
                disabled={!quotaStats.canAdd}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
              >
                <option value="L">Laki-laki (Putra)</option>
                <option value="P">Perempuan (Putri)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                disabled={!quotaStats.canAdd}
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                placeholder="Kota / Kabupaten"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Lahir *
              </label>
              <input
                type="date"
                required
                disabled={!quotaStats.canAdd}
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit / Lembaga Pendidikan *
              </label>
              <select
                disabled={!quotaStats.canAdd}
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
              >
                <option value="unit-tahfidz-nh">Madrasah Tahfidz Nurul Huda</option>
                <option value="unit-mts-putra">MTs Tahfidz Sains (Putra)</option>
                <option value="unit-ma-putra">MA Unggulan Al-Qur'an (Putra)</option>
                <option value="unit-pondok-salaf">Pondok Pesantren Salafiyah</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Penempatan Kamar Asrama
              </label>
              <select
                disabled={!quotaStats.canAdd}
                value={formData.kamar_id}
                onChange={(e) => setFormData({ ...formData, kamar_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
              >
                <option value="kamar-asrama-nh">Gedung Asrama Santri</option>
                <option value="kamar-101">Kamar 101 - Gedung Abu Bakar</option>
                <option value="kamar-102">Kamar 102 - Gedung Abu Bakar</option>
                <option value="kamar-201">Kamar 201 - Gedung Umar bin Khattab</option>
              </select>
            </div>
          </div>

          {/* Data Kontak Orang Tua / Wali */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
              Informasi Kontak Orang Tua / Wali Santri (Portal Wali)
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Orang Tua / Wali
                </label>
                <input
                  type="text"
                  disabled={!quotaStats.canAdd}
                  value={formData.wali_nama}
                  onChange={(e) => setFormData({ ...formData, wali_nama: e.target.value })}
                  placeholder="Nama orang tua / wali santri"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp Wali
                </label>
                <input
                  type="text"
                  disabled={!quotaStats.canAdd}
                  value={formData.wali_kontak}
                  onChange={(e) => setFormData({ ...formData, wali_kontak: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Data terlindungi multi-tenant isolation dan dihitung terhadap kuota {quotaStats.maxAllowed} santri aktif.</span>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Link
              href={listUrl}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || !quotaStats.canAdd}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Data Santri'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
