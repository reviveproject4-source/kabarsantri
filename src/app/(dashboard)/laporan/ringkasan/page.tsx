'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileBarChart2, 
  Users, 
  Wallet, 
  BookOpen, 
  ArrowLeft, 
  Printer, 
  Download,
  Building2,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { isTenantMode, getSharedSantriList } from '@/lib/sharedDataStore';
import { getEmployees } from '@/lib/kepegawaianStore';
import { useActiveTenant } from '@/lib/sessionStore';

export default function LaporanRingkasanEksekutifPage() {
  const tenant = useActiveTenant();
  const [isTenant, setIsTenant] = useState(false);
  const [santriCount, setSantriCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    const tenantActive = isTenantMode();
    setIsTenant(tenantActive);
    if (tenantActive) {
      setSantriCount(getSharedSantriList().length);
      setEmployeeCount(getEmployees().length);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href={isTenant ? "/dashboard?mode=tenant" : "/dashboard"} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Laporan Ringkasan Eksekutif</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isTenant ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'
              }`}>
                {isTenant ? 'Jalur Tenant Live (0 Dummy)' : 'Jalur Demo Simulasi'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isTenant 
                ? `Konsolidasi Data Pokok, SDM, dan Posisi Kas Resmi: ${tenant.name}` 
                : 'Konsolidasi Data Akademik, Santri, dan Posisi Keuangan Pesantren (Simulasi)'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition inline-flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
          <button 
            className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition inline-flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel / PDF</span>
          </button>
        </div>
      </div>

      {/* Rangkuman Matriks */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Total Santri Aktif</span>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {isTenant ? `${santriCount} Santri` : '324 Santri'}
          </h3>
          <p className="text-[11px] text-slate-400">
            {isTenant ? (santriCount === 0 ? 'Belum ada santri terdaftar' : `${santriCount} santri terdata`) : 'MTs: 180 • MA: 144'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Total Asatidz & SDM</span>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {isTenant ? `${employeeCount} Staf` : '42 Staf'}
          </h3>
          <p className="text-[11px] text-slate-400">
            {isTenant ? (employeeCount === 0 ? 'Belum ada pegawai terdaftar' : `${employeeCount} pegawai aktif`) : 'Guru KBM: 28 • Musyrif: 14'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">SPP Terbayar (Bulan Berjalan)</span>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {isTenant ? 'Rp 0' : 'Rp 154.200.000'}
          </h3>
          <p className="text-[11px] text-slate-400">
            {isTenant ? '0 Transaksi tagihan SPP' : 'Tingkat Penagihan: 89.2%'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Saldo Tabungan Wadiah</span>
          <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {isTenant ? 'Rp 0' : 'Rp 48.950.000'}
          </h3>
          <p className="text-[11px] text-slate-400">
            {isTenant ? '0 Rekening wadiah santri' : 'Dana Amanah Titipan Santri'}
          </p>
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Distribusi Keasramaan & Kamar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Kapasitas Asrama & Kamar Santri</span>
          </h3>

          {isTenant ? (
            <div className="py-8 px-4 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">Belum Ada Pembagian Kamar Asrama</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Kapasitas asrama dan plotting kamar santri akan ditampilkan di sini setelah santri didaftarkan dan ditempatkan ke kamar asrama.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100">Gedung Abu Bakar Ash-Shiddiq (Putra)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">8 Kamar • Musyrif Koordinator: Ust. Bilal</p>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">76 / 80 Santri (95%)</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100">Gedung Umar bin Khattab (Putra)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">10 Kamar • Musyrif Koordinator: Ust. Salman</p>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">92 / 100 Santri (92%)</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100">Gedung Khodijah Al-Kubra (Putri)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">14 Kamar • Musyrifah Koordinator: Usth. Maryam</p>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">138 / 140 Santri (98%)</span>
              </div>
            </div>
          )}
        </div>

        {/* Ringkasan Keuangan Buku Besar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Ringkasan Buku Besar & Kas Pesantren</span>
          </h3>

          {isTenant ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Total Kas di Bank (Rekening Resmi)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Rp 0</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Total Kas Tunai di Bendahara</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Rp 0</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Piutang Tagihan SPP Santri</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Rp 0</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Kewajiban Tabungan Santri (Wadiah)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Rp 0</span>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-[11px] flex justify-between items-center">
                <span>Status Buku Besar:</span>
                <strong className="font-semibold text-blue-700 dark:text-blue-300">Database Kasir Bersih Siap Pakai</strong>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Total Kas di Bank (BSI & Muamalat)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Rp 412.800.000</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Total Kas Tunai di Bendahara</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Rp 18.450.000</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Piutang Tagihan SPP Santri</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">Rp 18.500.000</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Kewajiban Tabungan Santri (Wadiah)</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">Rp 48.950.000</span>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-[11px] flex justify-between items-center">
                <span>Status Keseimbangan Jurnal (Debet = Kredit):</span>
                <strong className="font-semibold text-emerald-900 dark:text-emerald-100">BALANCE 100%</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
