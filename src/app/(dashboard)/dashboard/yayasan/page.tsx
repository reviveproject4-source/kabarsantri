'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building, 
  Crown, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  FileText, 
  Wallet, 
  Users, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  Settings,
  CreditCard,
  Plus,
  Landmark,
  Lightbulb,
  PieChart,
  Percent,
  Check
} from 'lucide-react';
import { 
  getSharedThresholds, 
  saveSharedThresholds, 
  getSharedRekeningList, 
  saveSharedRekeningList, 
  RekeningPesantren, 
  ThresholdSettings,
  DEFAULT_THRESHOLDS,
  DEFAULT_REKENING,
  isTenantMode
} from '@/lib/sharedDataStore';
import { supabase } from '@/lib/supabaseClient';
import Laporan6BulanChart from '@/components/finance/Laporan6BulanChart';

export default function DashboardKetuaYayasanPage() {
  const [tier, setTier] = useState<'gratis' | 'premium'>('premium');
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [modalThreshold, setModalThreshold] = useState(false);
  const [modalRekening, setModalRekening] = useState(false);
  const [notif, setNotif] = useState('');

  // 1. Threshold Mandiri (SSR Safe)
  const [thresholds, setThresholds] = useState<ThresholdSettings>(DEFAULT_THRESHOLDS);
  const [formThresholds, setFormThresholds] = useState<ThresholdSettings>(DEFAULT_THRESHOLDS);

  // 2. Master Rekening Bank Yayasan (SSR Safe)
  const [rekeningList, setRekeningList] = useState<RekeningPesantren[]>(DEFAULT_REKENING);
  const [formRekening, setFormRekening] = useState({
    nama_bank: 'Bank Syariah Indonesia (BSI)',
    nomor_rekening: '',
    atas_nama: '',
    fungsi: 'operasional_spp' as RekeningPesantren['fungsi'],
    pengelola: 'Bagian Keuangan' as RekeningPesantren['pengelola'],
    keterangan: '',
  });

  // 3. Tab Grafik
  const [activeGrafikTab, setActiveGrafikTab] = useState<'semua' | 'spp' | 'jajan' | 'tabungan' | 'donasi' | 'tunggakan'>('semua');

  const [isTenant, setIsTenant] = useState(false);

  useEffect(() => {
    setIsTenant(isTenantMode());
  }, []);

  // Ringkasan Eksekutif Keuangan & Margin (Zero Dummy Data on Tenant Live)
  const pendapatan = isTenant ? {
    spp: 0,
    daftar_ulang: 0,
    pendaftaran: 0,
    donasi: 0,
  } : {
    spp: 154200000,
    daftar_ulang: 65000000,
    pendaftaran: 32500000,
    donasi: 35000000,
  };
  const totalPendapatan = pendapatan.spp + pendapatan.daftar_ulang + pendapatan.pendaftaran + pendapatan.donasi;

  const fixCost = isTenant ? {
    gaji_pegawai: 0,
    tunjangan_musyrif: 0,
  } : {
    gaji_pegawai: 112000000,
    tunjangan_musyrif: 24500000,
  };
  const totalFixCost = fixCost.gaji_pegawai + fixCost.tunjangan_musyrif;

  const variableCost = isTenant ? {
    dapur_konsumsi: 0,
    laundry: 0,
    keamanan: 0,
    kbm_modul: 0,
    listrik_air_wifi: 0,
  } : {
    dapur_konsumsi: 38400000,
    laundry: 8900000,
    keamanan: 6200000,
    kbm_modul: 11500000,
    listrik_air_wifi: 14800000,
  };
  const totalVariableCost = 
    variableCost.dapur_konsumsi + 
    variableCost.laundry + 
    variableCost.keamanan + 
    variableCost.kbm_modul + 
    variableCost.listrik_air_wifi;

  const totalPengeluaran = totalFixCost + totalVariableCost;
  const netMargin = totalPendapatan - totalPengeluaran;
  const marginPercentage = totalPendapatan > 0 ? ((netMargin / totalPendapatan) * 100).toFixed(2) : '0.00';

  // Sinkronisasi Data
  useEffect(() => {
    setThresholds(getSharedThresholds());
    setFormThresholds(getSharedThresholds());
    setRekeningList(getSharedRekeningList());

    const handleThresholdUpdate = () => {
      setThresholds(getSharedThresholds());
      setFormThresholds(getSharedThresholds());
    };
    const handleRekeningUpdate = () => {
      setRekeningList(getSharedRekeningList());
    };

    window.addEventListener('ks_threshold_updated', handleThresholdUpdate);
    window.addEventListener('ks_rekening_updated', handleRekeningUpdate);

    return () => {
      window.removeEventListener('ks_threshold_updated', handleThresholdUpdate);
      window.removeEventListener('ks_rekening_updated', handleRekeningUpdate);
    };
  }, []);

  const handleSimpanThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    saveSharedThresholds(formThresholds);
    setModalThreshold(false);
    setNotif('✓ Pengaturan Batas Threshold Mandiri berhasil diperbarui oleh Ketua Yayasan!');
    setTimeout(() => setNotif(''), 6000);
  };

  const handleTambahRekening = (e: React.FormEvent) => {
    e.preventDefault();
    const newRek: RekeningPesantren = {
      id: `rek-${Date.now()}`,
      nama_bank: formRekening.nama_bank,
      nomor_rekening: formRekening.nomor_rekening,
      atas_nama: formRekening.atas_nama,
      fungsi: formRekening.fungsi,
      fungsi_label: 
        formRekening.fungsi === 'operasional_spp' ? 'Rekening SPP & Operasional' :
        formRekening.fungsi === 'kantin_tabungan' ? 'Rekening Dompet Santri & Kantin' :
        formRekening.fungsi === 'donasi_wakaf' ? 'Rekening Sosial & Wakaf' : 'Rekening Khusus',
      cakupan_pembayaran: 
        formRekening.fungsi === 'operasional_spp' ? ['SPP', 'Tunggakan', 'Daftar Ulang', 'Pendaftaran', 'Laundry'] :
        formRekening.fungsi === 'kantin_tabungan' ? ['Uang Jajan', 'Tabungan'] : ['Donasi', 'Infaq'],
      pengelola: formRekening.pengelola,
      keterangan: formRekening.keterangan || 'Rekening resmi terverifikasi yayasan',
      is_active: true,
    };

    const updated = [...rekeningList, newRek];
    saveSharedRekeningList(updated);
    setModalRekening(false);
    setFormRekening({
      nama_bank: 'Bank Syariah Indonesia (BSI)',
      nomor_rekening: '',
      atas_nama: '',
      fungsi: 'operasional_spp',
      pengelola: 'Bagian Keuangan',
      keterangan: '',
    });
    setNotif(`✓ Rekening bank ${newRek.nama_bank} (${newRek.fungsi_label}) berhasil didaftarkan dan tersinkronisasi ke Portal Wali Santri!`);
    setTimeout(() => setNotif(''), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header Ketua Yayasan (TIDAK ADA ABSEN PRIBADI - SESUAI INSTRUKSI) */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-600">
              Executive Board (Ketua Yayasan)
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Paket Premium Terbuka</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Dashboard Ketua Yayasan (Strategic EIS)</h1>
          <p className="text-xs text-slate-300 mt-1">
            Executive Information System: Ringkasan Konsolidasi, Analitik AI Margin Keuangan & Laporan Strategis Institusi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kewenangan: Information Only / Strategic Reporting</span>
          </div>
          <Link
            href="/laporan/ringkasan"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Laporan Konsolidasi</span>
          </Link>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2 shadow-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{notif}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧠 NOTIFIKASI INTELLIGENT AI ADVISORY (BERDASARKAN DASHBOARD KEUANGAN) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-300 flex items-center space-x-2">
              <span>Intelligent Financial Advisory (AI KabarSantri Engine)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-500/50">
                Live Analysis
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Analisis rasio likuiditas, surplus operasional, dan mitigasi anomali biaya</p>
          </div>
        </div>

        {isTenant ? (
          <div className="p-4 bg-slate-900/80 rounded-xl border border-emerald-500/20 text-xs text-center text-slate-300">
            <Sparkles className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <p className="font-semibold text-slate-200">Belum Ada Transaksi Riil untuk Rekomendasi AI</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rekomendasi optimasi keuangan dan deteksi anomali biaya akan otomatis muncul setelah ada pencatatan transaksi kas masuk atau pengeluaran operasional.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-3 pt-1">
            {/* Card 1: Margin & Surplus Operasional */}
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-emerald-500/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Margin Operasional Sehat</span>
                </span>
                <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded font-mono text-emerald-300 font-bold">
                  +{marginPercentage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Surplus bersih bulan ini mencapai <strong>Rp {netMargin.toLocaleString('id-ID')}</strong>. Rasio Gaji Pegawai (Fix Cost: 47.6%) berada dalam batas aman ideal yayasan (&lt; 55%).
              </p>
            </div>

            {/* Card 2: Anomali Variable Cost Dapur */}
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-amber-500/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span className="flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Peringatan Variable Cost Dapur</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
                  +8.3% Pekanan
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Belanja beras dan sembako dapur santri melonjak Rp 38.4 Juta. Rekomendasi AI: Bagian Keuangan disarankan membuat kontrak pasokan grosir bulanan dengan distributor.
              </p>
            </div>

            {/* Card 3: Optimasi Piutang SPP & Daftar Ulang */}
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-blue-500/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span className="flex items-center space-x-1">
                  <Lightbulb className="w-4 h-4" />
                  <span>Peluang Tagihan Piutang</span>
                </span>
                <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded text-blue-300">
                  Rp 18.5 Juta
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Terdapat tunggakan daftar ulang & SPP dari 14 santri. Kirimkan pesan pengingat sopan terotomasi via WhatsApp Gateway ke masing-masing wali santri.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 📊 RINGKASAN EKSEKUTIF: PENDAPATAN, PENGELUARAN (FIX + VARIABLE) & MARGIN */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <span>Ringkasan Eksekutif Keuangan Yayasan</span>
            </h2>
            <p className="text-xs text-slate-500">
              Kompilasi Arus Kas Riil: Pendapatan, Beban Tetap (Fix Cost), Beban Operasional (Variable Cost), dan Margin
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Surplus Bersih (Net Margin)</span>
            <div className="text-xl font-bold font-mono text-emerald-700">
              + Rp {netMargin.toLocaleString('id-ID')}
              <span className="text-xs font-normal text-slate-500 ml-1.5">({marginPercentage}%)</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 1. PENDAPATAN */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                Total Pendapatan
              </span>
              <span className="font-bold font-mono text-emerald-700 text-sm">
                Rp {totalPendapatan.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="divide-y divide-emerald-200/60 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-600">SPP Bulanan</span>
                <span className="font-semibold font-mono text-slate-800">Rp {pendapatan.spp.toLocaleString('id-ID')}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600">Daftar Ulang</span>
                <span className="font-semibold font-mono text-slate-800">Rp {pendapatan.daftar_ulang.toLocaleString('id-ID')}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600">Uang Pendaftaran (PPDB)</span>
                <span className="font-semibold font-mono text-slate-800">Rp {pendapatan.pendaftaran.toLocaleString('id-ID')}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600">Donasi & Infaq Yayasan</span>
                <span className="font-semibold font-mono text-slate-800">Rp {pendapatan.donasi.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* 2. FIX COST (GAJI PEGAWAI & ASATIDZ) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Fix Cost (Beban Tetap)
              </span>
              <span className="font-bold font-mono text-slate-800 text-sm">
                Rp {totalFixCost.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="divide-y divide-slate-200 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-600">Gaji Pegawai & Asatidz/Guru</span>
                <span className="font-semibold font-mono text-slate-800">Rp {fixCost.gaji_pegawai.toLocaleString('id-ID')}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-600">Tunjangan Musyrif & Rumah Tangga</span>
                <span className="font-semibold font-mono text-slate-800">Rp {fixCost.tunjangan_musyrif.toLocaleString('id-ID')}</span>
              </div>
              <div className="py-2 flex justify-between text-[11px] text-slate-500 italic">
                <span>Rasio Beban terhadap Pendapatan</span>
                <span className="font-bold font-mono">{((totalFixCost / totalPendapatan) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* 3. VARIABLE COST (OPERASIONAL DAPUR, LAUNDRY, LISTRIK, KBM) */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 text-xs uppercase tracking-wider">
                Variable Cost (Operasional)
              </span>
              <span className="font-bold font-mono text-amber-800 text-sm">
                Rp {totalVariableCost.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="divide-y divide-amber-200/60 text-xs">
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-600">Dapur & Konsumsi Santri</span>
                <span className="font-semibold font-mono text-slate-800">Rp {variableCost.dapur_konsumsi.toLocaleString('id-ID')}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-600">Laundry Asrama</span>
                <span className="font-semibold font-mono text-slate-800">Rp {variableCost.laundry.toLocaleString('id-ID')}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-600">Keamanan & Satpam</span>
                <span className="font-semibold font-mono text-slate-800">Rp {variableCost.keamanan.toLocaleString('id-ID')}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-600">KBM Pendidikan & Modul</span>
                <span className="font-semibold font-mono text-slate-800">Rp {variableCost.kbm_modul.toLocaleString('id-ID')}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-600">Listrik PLN, Air & Wifi</span>
                <span className="font-semibold font-mono text-slate-800">Rp {variableCost.listrik_air_wifi.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📈 GRAFIK PERBANDINGAN WAKTU KEUANGAN 6 BULAN (TREN MARGIN & KOMPARASI) */}
      {/* ========================================================================= */}
      <Laporan6BulanChart />

      {/* ========================================================================= */}
      {/* 🏦 KELOLA 2 ATAU 3 REKENING BERBEDA FUNGSI (PENGELOLA: KEUANGAN VS KESANTRIAN) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              <span>Rekening Bank Pesantren & Pengelola Resmi</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pemisahan Rekening SPP/Operasional (Keuangan) vs Rekening Tabungan & Uang Jajan (Kesantrian) vs Rekening Sosial
            </p>
          </div>
          <button
            onClick={() => setModalRekening(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Rekening Baru</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {rekeningList.map((rek) => (
            <div key={rek.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{rek.nama_bank}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    rek.pengelola === 'Bagian Keuangan' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : rek.pengelola === 'Bagian Kesantrian'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}>
                    {rek.pengelola}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-800 tracking-wider">
                  No. Rek: {rek.nomor_rekening}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  a.n. {rek.atas_nama}
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  {rek.keterangan}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Peruntukan Transaksi:
                </span>
                <div className="flex flex-wrap gap-1">
                  {rek.cakupan_pembayaran.map((c, cIdx) => (
                    <span key={cIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
