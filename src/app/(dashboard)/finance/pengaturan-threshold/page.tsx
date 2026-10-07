'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Save, CheckCircle2, ArrowLeft, ShieldCheck, DollarSign, Lock, AlertCircle } from 'lucide-react';
import { getSharedThresholds, saveSharedThresholds, DEFAULT_THRESHOLDS } from '@/lib/sharedDataStore';
import { useActiveActor } from '@/lib/sessionStore';

export default function PengaturanThresholdTenantPage() {
  const activeActor = useActiveActor();
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [notif, setNotif] = useState('');

  // Wakil Ketua Yayasan (dan Yayasan) memiliki otoritas ubah; Bagian Keuangan adalah READ-ONLY
  const isAuthorizedWakil = activeActor.role_key === 'wakil_yayasan' || activeActor.role_key === 'yayasan';
  const isReadOnly = !isAuthorizedWakil;

  useEffect(() => {
    setThresholds(getSharedThresholds());
  }, []);

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      alert('Akses Ditolak: Anda sedang dalam mode Bagian Keuangan (Read-Only). Otoritas pengaturan batas pengeluaran yayasan berada di bawah Wakil Ketua Yayasan.');
      return;
    }
    saveSharedThresholds(thresholds);
    setNotif('✓ Batas pengeluaran mandiri tenant berhasil disimpan! Matriks approval berjenjang otomatis diperbarui di seluruh sistem.');
    setTimeout(() => setNotif(''), 6000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link href="/finance/pengeluaran" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Kebijakan Batas Pengeluaran Mandiri Tenant</h1>
          <p className="text-xs text-slate-500">Ambang Batas Nominal Persetujuan Keuangan vs Pimpinan Yayasan</p>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* BANNER KEWENANGAN WAKIL YAYASAN VS READ-ONLY KEUANGAN */}
      {isReadOnly ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-sm text-amber-950">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mode Baca Saja (Read-Only) - Hak Akses Bagian Keuangan</span>
          </div>
          <p className="leading-relaxed text-amber-800">
            Berdasarkan tata kelola 6 Pilar Pesantren, wewenang penetapan dan pengubahan ambang batas pengeluaran mandiri tenant berada sepenuhnya di tangan <strong>Wakil Ketua Yayasan</strong>. Bagian Keuangan hanya memiliki hak akses baca (Read-Only) untuk memantau batas nominal yang telah ditetapkan dan menjalankan verifikasi pencairan anggaran.
          </p>
          <div className="pt-1">
            <Link
              href="/dashboard/wakil-yayasan"
              className="inline-flex items-center space-x-1.5 font-bold text-amber-950 underline hover:text-amber-700"
            >
              <span>Buka Dashboard Wakil Ketua Yayasan untuk mengubah batasan →</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold text-sm text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Otoritas Penuh: {activeActor.title} ({activeActor.name})</span>
          </div>
          <p className="text-emerald-800">
            Anda memiliki hak wewenang resmi untuk menetapkan dan menyimpan ambang batas nominal pengeluaran bagi tenant pesantren ini.
          </p>
        </div>
      )}

      <form onSubmit={handleSimpan} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 text-xs">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 leading-relaxed">
          💡 <strong>Fleksibilitas Kebijakan Tenant:</strong> Setiap pesantren memiliki kebijakan keuangan yang berbeda. Tentukan batas nominal pengeluaran yang boleh diputuskan langsung oleh Bagian Keuangan atau yang wajib dilaporkan dan disetujui oleh Wakil & Ketua Yayasan.
        </div>

        {/* 1. Threshold Rumah Tangga */}
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">
            1. Batas Maksimal Kebutuhan Rumah Tangga (Dapur, Laundry, Keamanan) untuk ACC Langsung Keuangan:
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 font-bold text-slate-400">Rp</span>
            <input
              type="number"
              required
              disabled={isReadOnly}
              value={thresholds.max_keuangan_rumah_tangga}
              onChange={(e) => setThresholds({ ...thresholds, max_keuangan_rumah_tangga: Number(e.target.value) })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg font-mono font-bold text-sm ${
                isReadOnly 
                  ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed' 
                  : 'bg-white border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Pengajuan dari dapur/laundry/satpam di bawah nominal ini cukup di-ACC oleh Bagian Keuangan.
          </p>
        </div>

        {/* 2. Threshold Mudir KBM */}
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">
            2. Batas Maksimal Kebutuhan KBM Kepala Sekolah (Mudir) untuk ACC Langsung Keuangan:
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 font-bold text-slate-400">Rp</span>
            <input
              type="number"
              required
              disabled={isReadOnly}
              value={thresholds.max_keuangan_kbm_mudir}
              onChange={(e) => setThresholds({ ...thresholds, max_keuangan_kbm_mudir: Number(e.target.value) })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg font-mono font-bold text-sm ${
                isReadOnly 
                  ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed' 
                  : 'bg-white border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Pengajuan kebutuhan KBM oleh Kepala Sekolah di bawah nominal ini bisa di-ACC langsung oleh Bagian Keuangan.
          </p>
        </div>

        {/* 3. Threshold Wajib Yayasan */}
        <div className="space-y-1.5">
          <label className="block font-bold text-slate-800">
            3. Batas Minimal Pengeluaran Skala Besar yang WAJIB Disetujui Wakil &amp; Ketua Yayasan:
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 font-bold text-slate-400">Rp</span>
            <input
              type="number"
              required
              disabled={isReadOnly}
              value={thresholds.min_yayasan_approval}
              onChange={(e) => setThresholds({ ...thresholds, min_yayasan_approval: Number(e.target.value) })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg font-mono font-bold text-sm ${
                isReadOnly 
                  ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed' 
                  : 'bg-white border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-rose-700'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Semua pengajuan yang sama atau melebihi nominal ini wajib mendapatkan persetujuan digital dari Wakil Ketua dan Ketua Yayasan.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <Link
            href="/finance/pengeluaran"
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 text-center w-full sm:w-auto"
          >
            ← Kembali ke Kas Keuangan
          </Link>

          {isReadOnly ? (
            <div className="flex items-center space-x-2 text-slate-400 italic text-[11px]">
              <Lock className="w-3.5 h-3.5" />
              <span>Pengaturan terkunci bagi Bagian Keuangan (Wewenang Wakil Yayasan)</span>
            </div>
          ) : (
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center space-x-1.5 w-full sm:w-auto justify-center"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Batas Threshold Yayasan</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
