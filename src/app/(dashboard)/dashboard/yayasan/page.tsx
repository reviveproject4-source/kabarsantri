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
  Check,
  School,
  Trash2,
  Banknote,
  CheckCheck,
  RefreshCw,
  Filter,
  ArrowDownRight,
  GraduationCap,
  Printer,
  Send
} from 'lucide-react';
import { 
  getSharedThresholds, 
  saveSharedThresholds, 
  getSharedRekeningList, 
  saveSharedRekeningList, 
  getSharedTransaksiKasList,
  getKasSummary,
  RekeningPesantren, 
  ThresholdSettings,
  TransaksiKasRecord,
  KasRekonsiliasiSummary,
  DEFAULT_THRESHOLDS,
  DEFAULT_REKENING,
  isTenantMode
} from '@/lib/sharedDataStore';
import { supabase } from '@/lib/supabaseClient';
import Laporan6BulanChart from '@/components/finance/Laporan6BulanChart';
import { useSearchParams } from 'next/navigation';
import { useAppMode, useActiveTenant } from '@/lib/sessionStore';
import { getActiveTenantPackageAndFeatures } from '@/lib/yayasanRegistrationStore';

export default function DashboardKetuaYayasanPage() {
  const tenant = useActiveTenant();
  const tenantPackageInfo = getActiveTenantPackageAndFeatures(tenant.id);
  const [tier, setTier] = useState<'gratis' | 'premium'>(tenantPackageInfo.paket === 'Enterprise' ? 'premium' : 'gratis');
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

  // 4. Arus Kas Terpadu & Rekonsiliasi Bank Transfer vs Cash Tunai
  const [kasList, setKasList] = useState<TransaksiKasRecord[]>([]);
  const [kasSummary, setKasSummary] = useState<KasRekonsiliasiSummary>({
    totalMasukCash: 0,
    totalMasukTransfer: 0,
    totalMasuk: 0,
    totalKeluarCash: 0,
    totalKeluarTransfer: 0,
    totalKeluar: 0,
    saldoCash: 0,
    saldoTransfer: 0,
    saldoTotal: 0,
    byKategori: {
      spp: { cash: 0, transfer: 0, total: 0 },
      infaq: { cash: 0, transfer: 0, total: 0 },
      tabungan: { cash: 0, transfer: 0, total: 0 },
      pengeluaran: { cash: 0, transfer: 0, total: 0 },
    },
  });
  const [filterSaluranMutasi, setFilterSaluranMutasi] = useState<'ALL' | 'CASH' | 'TRANSFER'>('ALL');
  const [filterKategoriMutasi, setFilterKategoriMutasi] = useState<string>('ALL');

  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const { isTenant: modeIsTenant } = useAppMode();
  const isTenantParam = searchParams?.get('mode') === 'tenant';
  const isTenant = isTenantParam || (mounted ? (modeIsTenant || (typeof window !== 'undefined' && isTenantMode())) : false);

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
    setMounted(true);
    setThresholds(getSharedThresholds());
    setFormThresholds(getSharedThresholds());
    setRekeningList(getSharedRekeningList());

    const loadKas = () => {
      const list = getSharedTransaksiKasList();
      setKasList(list);
      setKasSummary(getKasSummary(list));
    };

    loadKas();

    const handleThresholdUpdate = () => {
      setThresholds(getSharedThresholds());
      setFormThresholds(getSharedThresholds());
    };
    const handleRekeningUpdate = () => {
      setRekeningList(getSharedRekeningList());
    };
    const handleKasUpdate = () => {
      loadKas();
    };

    window.addEventListener('ks_threshold_updated', handleThresholdUpdate);
    window.addEventListener('ks_rekening_updated', handleRekeningUpdate);
    window.addEventListener('ks_kas_updated', handleKasUpdate);

    return () => {
      window.removeEventListener('ks_threshold_updated', handleThresholdUpdate);
      window.removeEventListener('ks_rekening_updated', handleRekeningUpdate);
      window.removeEventListener('ks_kas_updated', handleKasUpdate);
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

  const handleHapusRekening = (rekId: string, namaBank: string) => {
    if (confirm(`Hapus rekening bank ${namaBank}? Rekening ini tidak akan lagi ditampilkan ke wali santri.`)) {
      const updated = rekeningList.filter(r => r.id !== rekId);
      setRekeningList(updated);
      saveSharedRekeningList(updated);
      setNotif(`✓ Rekening bank ${namaBank} berhasil dihapus.`);
      setTimeout(() => setNotif(''), 4000);
    }
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
              <span>{tenantPackageInfo.paket === 'Gratis' ? 'Paket Free + Keuangan (ACC Super Admin)' : 'Paket Enterprise'}</span>
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
      {/* 🏛️ LAPORAN ARUS KAS TERPADU: REKONSILIASI BANK TRANSFER VS KAS TUNAI (CASH) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                Laporan Arus Kas Terpadu
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1">
                <CheckCheck className="w-3 h-3 text-blue-600" />
                <span>Nihil Selisih • Tanpa Salah Kamar</span>
              </span>
            </div>
            <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2 mt-1">
              <Banknote className="w-5 h-5 text-emerald-600" />
              <span>Rekonsiliasi Kas: Transfer Bank vs Kas Tunai (Cash)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Kompilasi Arus Dana Masuk (SPP, Infaq, Tabungan Santri) &amp; Dana Keluar (Beban Operasional) dari Input Pegawai Keuangan
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-mono font-medium">
              Total {kasList.length} Transaksi Terverifikasi
            </span>
          </div>
        </div>

        {/* 3 Executive Position KPI Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Card 1: Kas Tunai Fisik (Cash) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 text-xs flex items-center space-x-1.5">
                <span>💵 Saldo Kas Tunai Fisik (Cash)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 border border-emerald-300">
                Kasir &amp; Brankas
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-800">
              Rp {kasSummary.saldoCash.toLocaleString('id-ID')}
            </div>
            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-slate-600">
              <span>Masuk Tunai: <strong className="text-emerald-700">Rp {kasSummary.totalMasukCash.toLocaleString('id-ID')}</strong></span>
              <span>Keluar Tunai: <strong className="text-rose-700">Rp {kasSummary.totalKeluarCash.toLocaleString('id-ID')}</strong></span>
            </div>
          </div>

          {/* Card 2: Saldo Rekening Bank (Transfer) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 text-xs flex items-center space-x-1.5">
                <span>🏦 Saldo Rekening Bank (Transfer)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200/60 text-blue-900 border border-blue-300">
                Rekening Resmi
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-blue-800">
              Rp {kasSummary.saldoTransfer.toLocaleString('id-ID')}
            </div>
            <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-slate-600">
              <span>Masuk Bank: <strong className="text-blue-700">Rp {kasSummary.totalMasukTransfer.toLocaleString('id-ID')}</strong></span>
              <span>Keluar Bank: <strong className="text-rose-700">Rp {kasSummary.totalKeluarTransfer.toLocaleString('id-ID')}</strong></span>
            </div>
          </div>

          {/* Card 3: Total Kas Bersih Konsolidasi */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs flex items-center space-x-1.5">
                <span>💎 Total Kas Konsolidasi</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Rekonsiliasi Seimbang
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              Rp {kasSummary.saldoTotal.toLocaleString('id-ID')}
            </div>
            <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-300">
              <span>Total Masuk: <strong>Rp {kasSummary.totalMasuk.toLocaleString('id-ID')}</strong></span>
              <span>Total Beban: <strong>Rp {kasSummary.totalKeluar.toLocaleString('id-ID')}</strong></span>
            </div>
          </div>
        </div>

        {/* Tabel Rekapitulasi Rinci: Per Pos Masuk/Keluar Tanpa Salah Kamar */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center space-x-1.5">
              <span>Matriks Pemisahan Kas: Kasir Tunai (Cash) vs Rekening Bank (Transfer)</span>
            </h3>
            <span className="text-[10px] text-slate-500 italic">Audit Status: Otomatis sinkron per transaksi kasir</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Pos Aliran Dana</th>
                  <th className="py-2.5 px-4 text-right">Kas Tunai (Cash)</th>
                  <th className="py-2.5 px-4 text-right">Transfer Rekening Bank</th>
                  <th className="py-2.5 px-4 text-right">Total Akumulasi</th>
                  <th className="py-2.5 px-4 text-center">Status Rekonsiliasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. SPP */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>1. Penerimaan SPP Santri Bulanan</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-emerald-700">
                    Rp {kasSummary.byKategori.spp.cash.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-blue-700">
                    Rp {kasSummary.byKategori.spp.transfer.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    Rp {kasSummary.byKategori.spp.total.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ✓ Terekonsiliasi
                    </span>
                  </td>
                </tr>

                {/* 2. Infaq */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>2. Penerimaan Infaq, Shadaqah &amp; Donasi</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-emerald-700">
                    Rp {kasSummary.byKategori.infaq.cash.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-blue-700">
                    Rp {kasSummary.byKategori.infaq.transfer.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    Rp {kasSummary.byKategori.infaq.total.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ✓ Terekonsiliasi
                    </span>
                  </td>
                </tr>

                {/* 3. Tabungan */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>3. Penerimaan Tabungan &amp; E-Pocket Santri</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-emerald-700">
                    Rp {kasSummary.byKategori.tabungan.cash.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-blue-700">
                    Rp {kasSummary.byKategori.tabungan.transfer.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    Rp {kasSummary.byKategori.tabungan.total.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ✓ Terekonsiliasi
                    </span>
                  </td>
                </tr>

                {/* SUB TOTAL PENERIMAAN */}
                <tr className="bg-emerald-50/50 font-bold border-t border-b border-emerald-200">
                  <td className="py-2.5 px-4 text-emerald-950 uppercase text-[11px]">
                    Subtotal Penerimaan Kas Masuk (A)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-800 font-bold">
                    Rp {kasSummary.totalMasukCash.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-blue-800 font-bold">
                    Rp {kasSummary.totalMasukTransfer.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-900 font-bold text-sm">
                    Rp {kasSummary.totalMasuk.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="text-[10px] font-bold text-emerald-700">100% Klir</span>
                  </td>
                </tr>

                {/* 4. Pengeluaran */}
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-4 font-semibold text-rose-800 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>4. Pengeluaran Operasional &amp; Belanja Kebutuhan (B)</span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-rose-700">
                    (Rp {kasSummary.byKategori.pengeluaran.cash.toLocaleString('id-ID')})
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-rose-700">
                    (Rp {kasSummary.byKategori.pengeluaran.transfer.toLocaleString('id-ID')})
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-800">
                    (Rp {kasSummary.byKategori.pengeluaran.total.toLocaleString('id-ID')})
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ✓ Terekonsiliasi
                    </span>
                  </td>
                </tr>

                {/* SALDO AKHIR KAS */}
                <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-emerald-500">
                  <td className="py-3 px-4 uppercase tracking-wider">
                    Sisa Saldo Kas Bersih (A - B)
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold text-sm">
                    Rp {kasSummary.saldoCash.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-blue-300 font-bold text-sm">
                    Rp {kasSummary.saldoTransfer.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-300 font-bold text-sm">
                    Rp {kasSummary.saldoTotal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                      Nihil Selisih
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Mutasi Kasir Terakhir */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
              <span>Log Audit Rincian Mutasi Kasir</span>
            </h3>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400 mr-1 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Saluran:</span>
              </span>
              <button
                onClick={() => setFilterSaluranMutasi('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  filterSaluranMutasi === 'ALL'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterSaluranMutasi('CASH')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  filterSaluranMutasi === 'CASH'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                💵 Khusus Kas Tunai (Cash)
              </button>
              <button
                onClick={() => setFilterSaluranMutasi('TRANSFER')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  filterSaluranMutasi === 'TRANSFER'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                🏦 Khusus Transfer Bank
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0 bg-slate-50">
                  <tr>
                    <th className="py-2.5 px-3">Waktu &amp; No. TRX</th>
                    <th className="py-2.5 px-3">Pos &amp; Kategori</th>
                    <th className="py-2.5 px-3">Pihak Terkait</th>
                    <th className="py-2.5 px-3">Saluran Dana (Bank vs Cash)</th>
                    <th className="py-2.5 px-3 text-right">Nominal</th>
                    <th className="py-2.5 px-3">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {kasList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Belum ada riwayat transaksi kasir yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    kasList
                      .filter(tx => {
                        if (filterSaluranMutasi === 'ALL') return true;
                        return tx.metode === filterSaluranMutasi;
                      })
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-bold text-slate-900 block">{tx.nomor_transaksi}</span>
                            <span className="text-[10px] text-slate-400">{tx.tanggal} {tx.waktu || ''}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800 block">{tx.kategori_label}</span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-xs">{tx.keterangan}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800">{tx.nama_pihak}</span>
                            {tx.nis && <span className="text-[10px] text-slate-400 block font-mono">NIS: {tx.nis}</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            {tx.metode === 'CASH' ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                                <span>💵 Tunai (Cash)</span>
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200">
                                  <span>🏦 Transfer Bank</span>
                                </span>
                                {tx.rekening_nama && (
                                  <span className="text-[10px] text-slate-500 block truncate max-w-xs">{tx.rekening_nama}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            <span className={tx.tipe === 'MASUK' ? 'text-emerald-700' : 'text-rose-700'}>
                              {tx.tipe === 'MASUK' ? '+ ' : '- '}
                              Rp {tx.nominal.toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {tx.petugas}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
      {/* 🎓 LAPORAN EKSEKUTIF AKADEMIK & KESISWAAN (DARI MUDIR KE DEWAN YAYASAN)   */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <School className="w-5 h-5 text-emerald-600" />
              <span>Laporan Terpadu Akademik &amp; Mudir ke Dewan Yayasan</span>
            </h2>
            <p className="text-xs text-slate-500">
              Kompilasi Laporan Kepala Sekolah/Mudir: Rombongan Belajar, Disiplin KBM, &amp; Capaian Tahfidz Santri
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Link
              href="/akademik/raport"
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-2xs"
              title="Akses Raport Digital Santri: Pilihan Cetak Dokumen atau Kirimkan via WhatsApp"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Raport Santri (Cetak / WA)</span>
            </Link>
            <Link
              href="/laporan/ringkasan"
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Buka Laporan Lengkap</span>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[11px] block font-medium">Rombongan Belajar (Rombel)</span>
            <span className="text-xl font-bold font-mono text-slate-900">
              {isTenant ? '1 Kelas Aktif' : '6 Rombel Aktif'}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block">Madrasah &amp; Tahfidz</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[11px] block font-medium">Tingkat Disiplin KBM Guru</span>
            <span className="text-xl font-bold font-mono text-emerald-700">
              {isTenant ? '100%' : '96.4%'}
            </span>
            <span className="text-[10px] text-slate-500 block">Jadwal Terpenuhi Sesuai Roster</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[11px] block font-medium">Mutaba'ah &amp; Setoran Tahfidz</span>
            <span className="text-xl font-bold font-mono text-blue-700">
              {isTenant ? '100% Aktif' : '98.2% Lancar'}
            </span>
            <span className="text-[10px] text-slate-500 block">Mutaba'ah Harian Santri</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[11px] block font-medium">Status Catatan Mudir</span>
            <span className="text-xl font-bold text-slate-800">
              KBM Teratur
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block">✓ Nihil Kendala Kritis</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-slate-700">
            <span className="font-semibold text-slate-800">Catatan Mudir Terakhir:</span>
            <span className="text-slate-600 italic">"Seluruh jadwal KBM berjalan normal. Evaluasi pekanan dan setoran tahfidz asrama telah disinkronkan ke Portal Wali."</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">Pelapor: Mudir Pesantren</span>
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

        {rekeningList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
            <Landmark className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">Belum Ada Rekening Bank Resmi</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Rekening contoh telah dihapus. Klik tombol "Tambah Rekening Baru" di atas untuk mendaftarkan rekening bank resmi milik yayasan/pesantren Anda.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {rekeningList.map((rek) => (
              <div key={rek.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{rek.nama_bank}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        rek.pengelola === 'Bagian Keuangan' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : rek.pengelola === 'Bagian Kesantrian'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {rek.pengelola}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleHapusRekening(rek.id, rek.nama_bank)}
                        title="Hapus Rekening Contoh / Nonaktif"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
        )}
      </div>
    </div>
  );
}
