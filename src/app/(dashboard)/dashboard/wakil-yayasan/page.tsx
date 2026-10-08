'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  Utensils, 
  FileText, 
  Check, 
  X,
  TrendingUp, 
  TrendingDown,
  Receipt,
  ArrowRight,
  Settings,
  Landmark,
  Sparkles,
  PieChart,
  Lightbulb,
  Plus,
  ChevronDown,
  ChevronUp,
  Users,
  GraduationCap,
  Wrench
} from 'lucide-react';
import { 
  getSharedThresholds, 
  saveSharedThresholds, 
  getSharedRekeningList, 
  saveSharedRekeningList,
  getSharedPengajuanList,
  updatePengajuanStatus,
  RekeningPesantren, 
  ThresholdSettings,
  PengajuanItem,
  DEFAULT_THRESHOLDS,
  DEFAULT_REKENING,
  isTenantMode,
  getSharedPermissionRequests
} from '@/lib/sharedDataStore';
import { getHrMetrics } from '@/lib/kepegawaianStore';
import { HrDashboardMetrics } from '@/types/kepegawaian';
import { getRtDashboardMetrics } from '@/lib/rumahTanggaStore';
import { RtDashboardMetrics } from '@/types/rumahtangga';
import Laporan6BulanChart from '@/components/finance/Laporan6BulanChart';

export default function DashboardWakilYayasanPage() {
  const [modalThreshold, setModalThreshold] = useState(false);
  const [modalRekening, setModalRekening] = useState(false);
  const [pengajuanOpen, setPengajuanOpen] = useState(true); // Terbuka secara default agar daftar persetujuan langsung terlihat
  const [filterDivisi, setFilterDivisi] = useState<'ALL' | 'RT' | 'MUDIR' | 'PENDING'>('ALL');
  const [hrMetrics, setHrMetrics] = useState<HrDashboardMetrics | null>(null);
  const [rtMetrics, setRtMetrics] = useState<RtDashboardMetrics | null>(null);
  const [notif, setNotif] = useState('');

  // 1. Threshold Mandiri dari Shared Store (SSR Safe)
  const [thresholds, setThresholds] = useState<ThresholdSettings>(DEFAULT_THRESHOLDS);
  const [formThresholds, setFormThresholds] = useState<ThresholdSettings>(DEFAULT_THRESHOLDS);

  // 2. Rekening Bank Yayasan (SSR Safe)
  const [rekeningList, setRekeningList] = useState<RekeningPesantren[]>(DEFAULT_REKENING);
  const [formRekening, setFormRekening] = useState({
    nama_bank: 'Bank Syariah Indonesia (BSI)',
    nomor_rekening: '',
    atas_nama: '',
    fungsi: 'operasional_spp' as RekeningPesantren['fungsi'],
    pengelola: 'Bagian Keuangan' as RekeningPesantren['pengelola'],
    keterangan: '',
  });

  // 3. Daftar Pengajuan yang Memerlukan ACC / Monitoring Wakil Ketua Yayasan (Live Shared Data)
  const [pengajuanList, setPengajuanList] = useState<PengajuanItem[]>([]);

  const [isTenant, setIsTenant] = useState(false);

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

  // Sinkronisasi Live Data
  useEffect(() => {
    setIsTenant(isTenantMode());
    setThresholds(getSharedThresholds());
    setFormThresholds(getSharedThresholds());
    setRekeningList(getSharedRekeningList());
    setPengajuanList(getSharedPengajuanList());
    try {
      setHrMetrics(getHrMetrics());
      setRtMetrics(getRtDashboardMetrics());
    } catch (e) {
      // fallback
    }

    const handleThresholdUpdate = () => {
      setThresholds(getSharedThresholds());
      setFormThresholds(getSharedThresholds());
    };
    const handleRekeningUpdate = () => {
      setRekeningList(getSharedRekeningList());
    };
    const handleExpenseUpdate = () => {
      setPengajuanList(getSharedPengajuanList());
    };

    window.addEventListener('ks_threshold_updated', handleThresholdUpdate);
    window.addEventListener('ks_rekening_updated', handleRekeningUpdate);
    window.addEventListener('ks_expense_updated', handleExpenseUpdate);

    return () => {
      window.removeEventListener('ks_threshold_updated', handleThresholdUpdate);
      window.removeEventListener('ks_rekening_updated', handleRekeningUpdate);
      window.removeEventListener('ks_expense_updated', handleExpenseUpdate);
    };
  }, []);

  const handleApprove = (id: string, nominal: number) => {
    // Section 4 & 14: Wakil Ketua Yayasan adalah Operational Approval Authority.
    // Ketua Yayasan tidak menjadi approver operasional (Information Only).
    updatePengajuanStatus(id, 'DISETUJUI', '✓ Selesai di-ACC Wakil Ketua Yayasan (Siap Dicairkan Bagian Keuangan)');
    if (nominal >= thresholds.min_yayasan_approval) {
      setNotif(`✓ Pengajuan Rp ${nominal.toLocaleString('id-ID')} disetujui penuh oleh Wakil Ketua Yayasan. Laporan pengeluaran material diteruskan ke Ketua Yayasan sebagai Executive Information.`);
    } else {
      setNotif(`✓ Pengajuan sebesar Rp ${nominal.toLocaleString('id-ID')} berhasil disetujui penuh oleh Wakil Ketua Yayasan!`);
    }
    setTimeout(() => setNotif(''), 6000);
  };

  const handleReject = (id: string) => {
    updatePengajuanStatus(id, 'DITOLAK', 'Ditolak oleh Wakil Ketua Yayasan');
    setNotif('⚠️ Pengajuan pengeluaran telah ditolak.');
    setTimeout(() => setNotif(''), 5000);
  };

  const handleSimpanThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    saveSharedThresholds(formThresholds);
    setModalThreshold(false);
    setNotif('✓ Pengaturan Batas Threshold Mandiri berhasil disimpan oleh Wakil Ketua Yayasan!');
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
      {/* Header Wakil Ketua Yayasan (TIDAK ADA ABSEN PRIBADI - SESUAI INSTRUKSI) */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-800 text-teal-200 border border-teal-600">
              Operasional & Fasilitas Pesantren
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Dashboard Wakil Ketua Yayasan</h1>
          <p className="text-xs text-teal-200 mt-1">
            Pengawasan Operasional Harian, Ringkasan Eksekutif, Analitik AI Margin Keuangan & Approval Anggaran
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Tombol Atur Batas Mandiri */}
          <button
            onClick={() => setModalThreshold(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-teal-500/40 text-teal-300 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 shadow-sm"
          >
            <Settings className="w-4 h-4 text-teal-400" />
            <span>Atur Batas Threshold Mandiri</span>
          </button>

          {/* Tombol Rekening Bank */}
          <button
            onClick={() => setModalRekening(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Landmark className="w-4 h-4" />
            <span>+ Kelola Rekening Bank</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2 shadow-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{notif}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧠 NOTIFIKASI INTELLIGENT AI ADVISORY */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white p-5 rounded-2xl border border-teal-500/30 shadow-lg space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-teal-300 flex items-center space-x-2">
              <span>Intelligent Operational Advisory (AI Engine)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-500/50">
                Live Analysis
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Monitoring real-time efisiensi logistik, dapur, dan alokasi kas pesantren</p>
          </div>
        </div>

        {isTenant ? (
          <div className="p-4 bg-slate-900/80 rounded-xl border border-teal-500/20 text-xs text-center text-slate-300">
            <Sparkles className="w-5 h-5 text-teal-400 mx-auto mb-1.5" />
            <p className="font-semibold text-slate-200">Belum Ada Aktivitas Riil untuk Analitik Operasional AI</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Monitoring efisiensi logistik, dapur, dan alokasi kas akan aktif otomatis saat ada kegiatan operasional riil dari tenant.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-emerald-500/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Margin Operasional Surplus</span>
                </span>
                <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded font-mono text-emerald-300 font-bold">
                  +{marginPercentage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Surplus bersih kas mencapai <strong>Rp {netMargin.toLocaleString('id-ID')}</strong>. Cadangan kas operasional mencukupi untuk 3.8 bulan ke depan.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-amber-500/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span className="flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Variable Cost Dapur & Logistik</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
                  Perlu Evaluasi
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Pengeluaran sembako dapur berada di angka Rp 38.4 Juta. Disarankan Wakil Ketua Yayasan mengecek faktur harga grosir dan stok beras di gudang logistik.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-blue-500/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span className="flex items-center space-x-1">
                  <Landmark className="w-4 h-4" />
                  <span>Pemisahan Rekening Tertib</span>
                </span>
                <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded text-blue-300">
                  Sesuai SOP
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Dana SPP/Pendidikan dikelola Bagian Keuangan, sedangkan Dana Uang Jajan & Tabungan dikelola Bagian Kesantrian secara transparan.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 📡 RADAR OPERASIONAL LINTAS UNIT (OPERATIONAL CONTROL TOWER) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Operational Control Tower (Pengawasan Lintas Divisi)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                LIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Pengawasan terpadu Wakil Ketua Yayasan terhadap seluruh denyut operasional: Kepegawaian, Fasilitas RT, Kesantrian, dan Keuangan.
            </p>
          </div>
          <span className="text-[11px] text-teal-300 bg-teal-950/60 border border-teal-800/40 px-3 py-1 rounded-lg">
            Kewenangan: Eskalasi SLA, Cross-Division Oversight, & Persetujuan Operasional
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Radar 1: Kepegawaian & SDM */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Users className="w-4 h-4" /> Kepegawaian (HRD)
                </span>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                  {isTenant ? (hrMetrics?.total_employees ?? 0) : (hrMetrics?.total_employees || 14)} Staf
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Pegawai Aktif:</span>
                  <span className="font-bold text-emerald-400">
                    {isTenant ? (hrMetrics?.active_employees ?? 0) : (hrMetrics?.active_employees || 13)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Cuti (Notif ke Atasan):</span>
                  <span className="font-bold text-amber-400">
                    {isTenant ? (hrMetrics?.on_leave_today ?? 0) : (hrMetrics?.on_leave_today || 1)} orang
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Kasus Disiplin Aktif:</span>
                  <span className="font-bold text-rose-400">
                    {isTenant ? (hrMetrics?.active_disciplinary_cases ?? 0) : (hrMetrics?.active_disciplinary_cases || 1)}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/kepegawaian"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-between pt-2 border-t border-slate-700/60"
            >
              <span>Buka Radar SDM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Radar 2: Rumah Tangga & Fasilitas */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <Wrench className="w-4 h-4" /> Fasilitas & RT
                </span>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                  Fasilitas Pondok
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Tiket Perbaikan Open:</span>
                  <span className="font-bold text-sky-400">
                    {isTenant ? (rtMetrics?.total_active_requests ?? 0) : (rtMetrics?.total_active_requests || 1)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Aset Maintenance:</span>
                  <span className="font-bold text-amber-400">
                    {isTenant ? (rtMetrics?.assets_under_maintenance_count ?? 0) : (rtMetrics?.assets_under_maintenance_count || 1)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Stok Kritis:</span>
                  <span className="font-bold text-rose-400">
                    {isTenant ? (rtMetrics?.low_stock_items_count ?? 0) : (rtMetrics?.low_stock_items_count || 1)} item
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/rumah-tangga"
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center justify-between pt-2 border-t border-slate-700/60"
            >
              <span>Buka Hub RT & Gudang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Radar 3: Kesantrian & Gerbang */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <GraduationCap className="w-4 h-4" /> Kesantrian & Izin
                </span>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                  Gerbang Pos
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Santri di Luar Kampus:</span>
                  <span className="font-bold text-purple-400">
                    {isTenant ? '0 Santri' : '2 Santri'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Status Overdue Gerbang:</span>
                  <span className="font-bold text-rose-400">
                    {isTenant ? '0 Kasus Review' : '1 Kasus Review'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">QR Gate Pass:</span>
                  <span className="font-bold text-emerald-400">
                    {isTenant ? 'Siap' : 'Aktif'}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/akademik/perizinan"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center justify-between pt-2 border-t border-slate-700/60"
            >
              <span>Buka Perizinan Gerbang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Radar 4: Keuangan & Approval Mandiri */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Receipt className="w-4 h-4" /> Keuangan Operasional
                </span>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                  Approval
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Antrean ACC Wakil Yayasan:</span>
                  <span className="font-bold text-amber-400">
                    {pengajuanList.filter(p => p.status === 'MENUNGGU_WAKIL_YAYASAN').length} Berkas
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Batas Threshold Mandiri:</span>
                  <span className="font-bold text-slate-200">Rp {(thresholds.max_keuangan_rumah_tangga/1000000).toFixed(0)} - {(thresholds.min_yayasan_approval/1000000).toFixed(0)} Jt</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Eskalasi ke Ketua:</span>
                  <span className="font-bold text-slate-200">&gt; Rp {(thresholds.min_yayasan_approval/1000000).toFixed(0)} Jt</span>
                </div>
              </div>
            </div>
            <Link
              href="/finance/pengeluaran"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center justify-between pt-2 border-t border-slate-700/60"
            >
              <span>Buka Pengajuan Dana</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 RINGKASAN EKSEKUTIF: PENDAPATAN, FIX COST, VARIABLE COST & MARGIN */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <span>Ringkasan Eksekutif Keuangan & Arus Kas</span>
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi kinerja anggaran: Pendapatan, Beban Tetap (Fix Cost), Operasional (Variable Cost), dan Margin
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

          {/* 2. FIX COST */}
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
                <span>Rasio Gaji terhadap Pendapatan</span>
                <span className="font-bold font-mono">{((totalFixCost / totalPendapatan) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* 3. VARIABLE COST */}
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
      {/* 🏦 KELOLA REKENING BANK PESANTREN */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              <span>Daftar Rekening Bank & Alokasi Pembayaran</span>
            </h2>
            <p className="text-xs text-slate-500">
              Rekening SPP/Operasional (Keuangan) dan Rekening Tabungan/Uang Jajan (Kesantrian)
            </p>
          </div>
          <button
            onClick={() => setModalRekening(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Rekening Bank</span>
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

      {/* ========================================================================= */}
      {/* 📋 DAFTAR PERSETUJUAN DANA OPERASIONAL (WAKIL KETUA YAYASAN) - KLIKABLE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        {/* Header Klikable (Toggle untuk membuka / menutup tabel agar layar tetap ringkas) */}
        <div 
          onClick={() => setPengajuanOpen(!pengajuanOpen)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition border-b border-slate-100 select-none"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <span>Daftar Pengajuan Anggaran Masuk (Persetujuan Yayasan)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                  {pengajuanList.filter(p => p.status.includes('MENUNGGU')).length} Menunggu Persetujuan
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                {pengajuanOpen 
                  ? 'Klik di sini untuk menutup tabel daftar pengajuan agar layar tetap ringkas ▲' 
                  : 'Klik di sini untuk membuka & meninjau daftar pengajuan dana yang memerlukan ACC ▼'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold hidden sm:inline-block">
              {pengajuanList.length} Total Pengajuan
            </span>
            <button
              type="button"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition flex items-center space-x-1 text-xs font-semibold"
            >
              <span>{pengajuanOpen ? 'Tutup' : 'Buka'}</span>
              {pengajuanOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tabel HANYA MUNCUL KETIKA KLIKABLE DIBUKA */}
        {pengajuanOpen && (() => {
          const isItemRt = (item: PengajuanItem) => {
            const div = item.divisi.toLowerCase();
            const pem = item.pemohon.toLowerCase();
            return div.includes('dapur') || div.includes('laundry') || div.includes('keamanan') || div.includes('rt') || div.includes('rumah tangga') || div.includes('sarpras') || pem.includes('subandi') || pem.includes('maryono') || pem.includes('sumiati');
          };

          const isItemMudir = (item: PengajuanItem) => {
            const div = item.divisi.toLowerCase();
            const pem = item.pemohon.toLowerCase();
            return div.includes('mudir') || div.includes('kbm') || div.includes('akademik') || pem.includes('mudir') || pem.includes('ahmad dahlan');
          };

          const rtCount = pengajuanList.filter(isItemRt).length;
          const rtPendingCount = pengajuanList.filter(item => isItemRt(item) && item.status.includes('MENUNGGU')).length;
          const mudirCount = pengajuanList.filter(isItemMudir).length;
          const pendingCount = pengajuanList.filter(item => item.status.includes('MENUNGGU')).length;

          const displayedList = pengajuanList.filter((item) => {
            if (filterDivisi === 'RT') return isItemRt(item);
            if (filterDivisi === 'MUDIR') return isItemMudir(item);
            if (filterDivisi === 'PENDING') return item.status.includes('MENUNGGU');
            return true;
          });

          return (
            <div className="border-t border-slate-100">
              {/* Quick Filter Pill Bar */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto -mx-1 px-1 sm:mx-0 sm:px-0">
                  <button
                    onClick={() => setFilterDivisi('ALL')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 whitespace-nowrap ${
                      filterDivisi === 'ALL'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Semua Pengajuan ({pengajuanList.length})
                  </button>

                  <button
                    onClick={() => setFilterDivisi('RT')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition shrink-0 whitespace-nowrap ${
                      filterDivisi === 'RT'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Khusus Bagian RT ({rtCount})</span>
                    {rtPendingCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-white text-amber-900 text-[10px] font-black">
                        {rtPendingCount} butuh ACC
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setFilterDivisi('MUDIR')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition shrink-0 whitespace-nowrap ${
                      filterDivisi === 'MUDIR'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
                    }`}
                  >
                    <span>Akademik / Mudir ({mudirCount})</span>
                  </button>

                  <button
                    onClick={() => setFilterDivisi('PENDING')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 whitespace-nowrap ${
                      filterDivisi === 'PENDING'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    Menunggu ACC ({pendingCount})
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Menampilkan <strong className="text-slate-800">{displayedList.length}</strong> pengajuan
                </div>
              </div>

              <div className="overflow-x-auto w-full -mx-1 px-1 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">No. Pengajuan</th>
                      <th className="p-3">Divisi & Pemohon</th>
                      <th className="p-3">Judul Pengeluaran</th>
                      <th className="p-3">Nominal</th>
                      <th className="p-3">Level Persetujuan</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Aksi Wakil Yayasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          Tidak ada pengajuan yang sesuai dengan filter ini.
                        </td>
                      </tr>
                    ) : (
                      displayedList.map((item) => {
                        const isRt = isItemRt(item);
                        const isMudir = isItemMudir(item);
                        return (
                          <tr key={item.id} className={`hover:bg-slate-50/70 transition ${isRt ? 'bg-amber-50/20' : ''}`}>
                            <td className="p-3 font-mono font-bold text-slate-800 text-[11px]">
                              {item.nomor}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-1.5">
                                {isRt && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[9px] border border-amber-300 shrink-0">
                                    RT
                                  </span>
                                )}
                                {isMudir && (
                                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[9px] border border-blue-300 shrink-0">
                                    KBM
                                  </span>
                                )}
                                <span className="font-bold text-slate-800">{item.divisi}</span>
                              </div>
                              <div className="text-[10px] text-slate-500">{item.pemohon}</div>
                            </td>
                            <td className="p-3 max-w-xs">
                              <div className="font-medium text-slate-800">{item.judul}</div>
                              {item.deskripsi && (
                                <div className="text-[10px] text-slate-400 truncate">{item.deskripsi}</div>
                              )}
                            </td>
                    <td className="p-3 font-bold font-mono text-emerald-700">
                      Rp {item.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-[11px] text-slate-600">
                      {item.level_approval}
                    </td>
                    <td className="p-3">
                      {item.status === 'DISETUJUI' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          ✓ Disetujui
                        </span>
                      ) : item.status === 'DITOLAK' ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                          Ditolak
                        </span>
                      ) : item.status === 'MENUNGGU_KEUANGAN' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                          Menunggu Keuangan
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                          Menunggu Wakil Yayasan
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {item.status === 'DISETUJUI' ? (
                        <span className="text-[11px] text-emerald-600 font-bold">Telah di-ACC</span>
                      ) : item.status === 'DITOLAK' ? (
                        <span className="text-[11px] text-rose-500">Dibatalkan</span>
                      ) : (
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApprove(item.id, item.nominal); }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition text-[11px] flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Setujui (ACC)</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReject(item.id); }}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-200 transition"
                            title="Tolak Pengajuan"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ATUR BATAS THRESHOLD MANDIRI (WAKIL KETUA YAYASAN) */}
      {/* ========================================================================= */}
      {modalThreshold && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  <span>Atur Batas Threshold Persetujuan Dana</span>
                </h3>
                <p className="text-xs text-slate-500">Ditetapkan mandiri oleh Pimpinan Yayasan</p>
              </div>
              <button onClick={() => setModalThreshold(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSimpanThreshold} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batas Maksimal Keuangan (Rumah Tangga: Dapur, Laundry, Satpam)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    required
                    step={100000}
                    value={formThresholds.max_keuangan_rumah_tangga}
                    onChange={(e) => setFormThresholds({ ...formThresholds, max_keuangan_rumah_tangga: Number(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Default: Rp 1.000.000 (Di bawah nominal ini, Keuangan bisa ACC langsung)</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batas Maksimal Keuangan (KBM Kepala Sekolah / Mudir)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    required
                    step={100000}
                    value={formThresholds.max_keuangan_kbm_mudir}
                    onChange={(e) => setFormThresholds({ ...formThresholds, max_keuangan_kbm_mudir: Number(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Default: Rp 3.000.000 (Kebutuhan KBM Mudir)</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batas Wajib Approval Yayasan (Wakil Ketua & Ketua Yayasan)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    required
                    step={100000}
                    value={formThresholds.min_yayasan_approval}
                    onChange={(e) => setFormThresholds({ ...formThresholds, min_yayasan_approval: Number(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Default: Rp 5.000.000 (Nominal di atas ini wajib persetujuan pimpinan)</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalThreshold(false)}
                  className="flex-1 py-2.5 font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition"
                >
                  Simpan Batas Threshold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: KELOLA REKENING BANK YAYASAN */}
      {/* ========================================================================= */}
      {modalRekening && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Tambah Rekening Bank Pesantren</h3>
                <p className="text-xs text-slate-500">Pilih dari template atau isi manual nomor rekening</p>
              </div>
              <button onClick={() => setModalRekening(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleTambahRekening} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Bank</label>
                <select
                  value={formRekening.nama_bank}
                  onChange={(e) => setFormRekening({ ...formRekening, nama_bank: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                  <option value="Bank Muamalat">Bank Muamalat</option>
                  <option value="BCA Syariah">BCA Syariah</option>
                  <option value="Bank Mega Syariah">Bank Mega Syariah</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="Bank BRI">Bank BRI</option>
                  <option value="Bank BNI">Bank BNI</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  required
                  value={formRekening.nomor_rekening}
                  onChange={(e) => setFormRekening({ ...formRekening, nomor_rekening: e.target.value })}
                  placeholder="Contoh: 7142098811"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Atas Nama Rekening</label>
                <input
                  type="text"
                  required
                  value={formRekening.atas_nama}
                  onChange={(e) => setFormRekening({ ...formRekening, atas_nama: e.target.value })}
                  placeholder="Contoh: Yayasan KabarSantri Peduli"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fungsi / Peruntukan Pembayaran</label>
                <select
                  value={formRekening.fungsi}
                  onChange={(e) => {
                    const f = e.target.value as RekeningPesantren['fungsi'];
                    const p = f === 'operasional_spp' ? 'Bagian Keuangan' : f === 'kantin_tabungan' ? 'Bagian Kesantrian' : 'Bendahara Yayasan';
                    setFormRekening({ ...formRekening, fungsi: f, pengelola: p });
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="operasional_spp">Rekening SPP, Tunggakan, Daftar Ulang, Pendaftaran & Laundry</option>
                  <option value="kantin_tabungan">Rekening Dompet Santri: Uang Jajan Kantin & Tabungan</option>
                  <option value="donasi_wakaf">Rekening Donasi Bebas, Infaq Pembangunan & Wakaf</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bagian Pengelola (Pilih Dropdown atau Isi Manual)
                </label>
                <div className="space-y-1.5">
                  <select
                    value={
                      ['Bagian Keuangan', 'Bagian Kesantrian', 'Bendahara Yayasan'].includes(formRekening.pengelola)
                        ? formRekening.pengelola
                        : 'Lainnya'
                    }
                    onChange={(e) => {
                      if (e.target.value !== 'Lainnya') {
                        setFormRekening({ ...formRekening, pengelola: e.target.value });
                      }
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="Bagian Keuangan">Bagian Keuangan (Pendidikan & Operasional)</option>
                    <option value="Bagian Kesantrian">Bagian Kesantrian (Dompet Santri & Kantin)</option>
                    <option value="Bendahara Yayasan">Bendahara Yayasan (Sosial, Infaq & Wakaf)</option>
                    <option value="Lainnya">Lainnya (Ketik Manual Sendiri di Bawah)...</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={formRekening.pengelola}
                    onChange={(e) => setFormRekening({ ...formRekening, pengelola: e.target.value })}
                    placeholder="Contoh: Koperasi Pondok / Panitia Pembangunan / Bagian Keuangan"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Bisa memilih opsi dari dropdown atau mengisi bebas secara manual sesuai struktur lembaga.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan / Keterangan</label>
                <textarea
                  rows={2}
                  value={formRekening.keterangan}
                  onChange={(e) => setFormRekening({ ...formRekening, keterangan: e.target.value })}
                  placeholder="Instruksi pembayaran khusus bagi wali santri..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalRekening(false)}
                  className="flex-1 py-2.5 font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition"
                >
                  Simpan Rekening Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
