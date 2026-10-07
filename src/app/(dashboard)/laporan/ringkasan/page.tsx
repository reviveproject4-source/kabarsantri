'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileBarChart2, 
  Users, 
  Wallet, 
  BookOpen, 
  ArrowLeft, 
  Printer, 
  Download,
  Building2
} from 'lucide-react';

export default function LaporanRingkasanEksekutifPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Laporan Ringkasan Eksekutif</h1>
            <p className="text-xs text-slate-500">Langkah 8: Konsolidasi Data Akademik, Santri, dan Posisi Keuangan Pesantren</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition inline-flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
          <button 
            className="px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition inline-flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel / PDF</span>
          </button>
        </div>
      </div>

      {/* Rangkuman Matriks */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Santri Aktif</span>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">324 Santri</h3>
          <p className="text-[11px] text-slate-400 mt-1">MTs: 180 • MA: 144</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Asatidz & Musyrif</span>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">42 Staf</h3>
          <p className="text-[11px] text-slate-400 mt-1">Guru KBM: 28 • Musyrif: 14</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">SPP Terbayar (Bulan Berjalan)</span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">Rp 154.200.000</h3>
          <p className="text-[11px] text-slate-400 mt-1">Tingkat Penagihan: 89.2%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Saldo Tabungan Wadiah</span>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">Rp 48.950.000</h3>
          <p className="text-[11px] text-slate-400 mt-1">Dana Amanah Titipan Santri</p>
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Distribusi Keasramaan & Kamar (Point 1) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Kapasitas Asrama & Kamar Santri</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">Gedung Abu Bakar Ash-Shiddiq (Putra)</h4>
                <p className="text-[11px] text-slate-500">8 Kamar • Musyrif Koordinator: Ust. Bilal</p>
              </div>
              <span className="font-bold text-emerald-700">76 / 80 Santri (95%)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">Gedung Umar bin Khattab (Putra)</h4>
                <p className="text-[11px] text-slate-500">10 Kamar • Musyrif Koordinator: Ust. Salman</p>
              </div>
              <span className="font-bold text-emerald-700">92 / 100 Santri (92%)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">Gedung Khodijah Al-Kubra (Putri)</h4>
                <p className="text-[11px] text-slate-500">14 Kamar • Musyrifah Koordinator: Usth. Maryam</p>
              </div>
              <span className="font-bold text-emerald-700">138 / 140 Santri (98%)</span>
            </div>
          </div>
        </div>

        {/* Ringkasan Keuangan Buku Besar (Point 4) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>Ringkasan Buku Besar & Kas Pesantren</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Kas di Bank (BSI & Muamalat)</span>
              <span className="font-mono font-bold text-slate-800">Rp 412.800.000</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Kas Tunai di Bendahara</span>
              <span className="font-mono font-bold text-slate-800">Rp 18.450.000</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Piutang Tagihan SPP Santri</span>
              <span className="font-mono font-bold text-rose-600">Rp 18.500.000</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Kewajiban Tabungan Santri (Wadiah)</span>
              <span className="font-mono font-bold text-blue-600">Rp 48.950.000</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] flex justify-between items-center">
              <span>Status Keseimbangan Jurnal (Debet = Kredit):</span>
              <strong className="font-semibold text-emerald-900">BALANCE 100%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
