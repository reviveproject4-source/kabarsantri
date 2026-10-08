'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Search,
  Scan,
  AlertTriangle,
  Plus,
  ArrowRight,
  PhoneCall,
  UserCheck,
  Calendar,
  MapPin,
  ExternalLink,
  MessageCircle,
  FileText,
  User,
  AlertCircle,
  X,
  Sparkles,
  RefreshCw,
  LogOut,
  LogIn,
  Check,
  Printer,
  History,
  Scale,
  ShieldAlert,
  HelpCircle,
  Award,
  Layers,
  FileSearch
} from 'lucide-react';
import { 
  getSharedPermissionRequests, 
  createPermissionRequest, 
  startReviewPermission,
  verifyPermissionRequest, 
  issueGatePass,
  checkOutSantri, 
  checkInSantri,
  startCaseReview,
  submitCaseReview,
  PermissionRequest,
  PermissionStatus,
  GateMovement,
  CaseReviewRecord,
  AuditLogEntry,
  MASTER_SANTRI,
  MASTER_KELAS,
  isTenantMode,
  getSharedSantriList
} from '@/lib/sharedDataStore';

export default function PerizinanSantriPage() {
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'daftar' | 'scan_satpam' | 'alert_kesantrian'>('daftar');
  const [filterGroup, setFilterGroup] = useState<'ALL' | 'REVIEW' | 'GATE_PASS' | 'OUTSIDE' | 'CASE_REVIEW' | 'FINISHED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notif, setNotif] = useState('');

  // Modals
  const [modalCreate, setModalCreate] = useState(false);
  const [modalVerify, setModalVerify] = useState<PermissionRequest | null>(null);
  const [modalGatePass, setModalGatePass] = useState<PermissionRequest | null>(null);
  const [modalDetail, setModalDetail] = useState<PermissionRequest | null>(null);
  const [modalAuditTrail, setModalAuditTrail] = useState<PermissionRequest | null>(null);
  const [modalCaseReview, setModalCaseReview] = useState<PermissionRequest | null>(null);

  // Form State: Pengajuan Baru
  const [formSantriNis, setFormSantriNis] = useState(() => {
    if (typeof window !== 'undefined' && isTenantMode()) {
      return getSharedSantriList()[0]?.nis || '';
    }
    return MASTER_SANTRI[0]?.nis || '';
  });
  const [formAlasan, setFormAlasan] = useState('Pemeriksaan Kesehatan Spesialis di Rumah Sakit');
  const [formTujuan, setFormTujuan] = useState('RSUD Dr. Saiful Anwar Malang');
  const [formRencanaKeluar, setFormRencanaKeluar] = useState(
    new Date().toISOString().slice(0, 10) + ' 08:00'
  );
  const [formRencanaKembali, setFormRencanaKembali] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10) + ' 17:00'
  );
  const [formNamaPenjemput, setFormNamaPenjemput] = useState('H. Ahmad Fauzi');
  const [formHubunganPenjemput, setFormHubunganPenjemput] = useState('Ayah Kandung');
  const [formKontakWali, setFormKontakWali] = useState('081234567890');

  // Form State: Verifikasi Petugas
  const [verifyPetugasNama, setVerifyPetugasNama] = useState('Ust. Rahmat, S.Pd (Kesantrian)');
  const [verifyAlasanTolak, setVerifyAlasanTolak] = useState('');

  // Form State: Case Review
  const [crCategory, setCrCategory] = useState<'KENDARAAN_MOGOK_MACET' | 'DARURAT_MEDIS_KELUARGA' | 'CUACA_BENCANA' | 'KELALAIAN_SANTRI' | 'LAINNYA'>('KENDARAAN_MOGOK_MACET');
  const [crExplanation, setCrExplanation] = useState('');
  const [crEvidence, setCrEvidence] = useState('');
  const [crDecision, setCrDecision] = useState<'EXCUSED' | 'VIOLATION'>('EXCUSED');
  const [crRationale, setCrRationale] = useState('');
  const [crDisciplinePoints, setCrDisciplinePoints] = useState(10);
  const [crSanctionAction, setCrSanctionAction] = useState('Iqob Tarbawi: Piket Kebersihan Asrama & Hafalan Al-Qur\'an');
  const [crReviewerName, setCrReviewerName] = useState('Ust. Rahmat, S.Pd');
  const [crReviewerRole, setCrReviewerRole] = useState('Kepala Bagian Kesantrian');

  // Scanner State
  const [scannerSelectedId, setScannerSelectedId] = useState('');
  const [scannerOfficer, setScannerOfficer] = useState('Pak Subandi (Satpam Gerbang Utama)');
  const [scannerLocation, setScannerLocation] = useState('Gerbang Utama & Portal Pos Satpam');
  const [scannerNotes, setScannerNotes] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    type: 'keluar' | 'kembali';
    santri: string;
    nis: string;
    waktu: string;
    status: string;
    pesan: string;
    diffMinutes?: number;
  } | null>(null);

  // Sinkronisasi data real-time
  const refreshData = () => {
    const list = getSharedPermissionRequests();
    setRequests(list);
    if (!scannerSelectedId && list.length > 0) {
      const activeOrPass = list.find(r => r.status === 'GATE_PASS' || r.status === 'APPROVED' || r.status === 'SANTRI_OUTSIDE' || r.status === 'CHECKED_OUT' || r.status === 'OVERDUE');
      if (activeOrPass) setScannerSelectedId(activeOrPass.id);
    }
  };

  useEffect(() => {
    refreshData();

    // Handle deep link highlight parameter (?highlight=pr-7)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hlId = params.get('highlight');
      if (hlId) {
        const found = getSharedPermissionRequests().find(r => r.id === hlId);
        if (found) {
          setModalDetail(found);
        }
      }
    }

    const handleUpdate = () => refreshData();
    window.addEventListener('ks_permission_updated', handleUpdate);
    return () => window.removeEventListener('ks_permission_updated', handleUpdate);
  }, []);

  // Filter list by target lifecycle groups
  const filteredList = requests.filter(item => {
    let matchGroup = true;
    if (filterGroup === 'REVIEW') {
      matchGroup = item.status === 'DRAFT' || item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW';
    } else if (filterGroup === 'GATE_PASS') {
      matchGroup = item.status === 'APPROVED' || item.status === 'GATE_PASS';
    } else if (filterGroup === 'OUTSIDE') {
      matchGroup = item.status === 'CHECKED_OUT' || item.status === 'SANTRI_OUTSIDE';
    } else if (filterGroup === 'CASE_REVIEW') {
      matchGroup = item.status === 'OVERDUE' || item.status === 'CASE_REVIEW';
    } else if (filterGroup === 'FINISHED') {
      matchGroup = item.status === 'RETURNED' || item.status === 'EXCUSED' || item.status === 'VIOLATION' || item.status === 'REJECTED';
    }

    const q = searchQuery.toLowerCase();
    const matchQuery = 
      item.nama.toLowerCase().includes(q) ||
      item.nis.includes(q) ||
      item.alasan.toLowerCase().includes(q) ||
      item.tujuan.toLowerCase().includes(q);

    return matchGroup && matchQuery;
  });

  // Metrik Statistik Lifecycle
  const totalCount = requests.length;
  const reviewCount = requests.filter(r => r.status === 'DRAFT' || r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
  const gatePassCount = requests.filter(r => r.status === 'APPROVED' || r.status === 'GATE_PASS').length;
  const outsideCount = requests.filter(r => r.status === 'CHECKED_OUT' || r.status === 'SANTRI_OUTSIDE').length;
  const overdueOrReviewCount = requests.filter(r => r.status === 'OVERDUE' || r.status === 'CASE_REVIEW').length;
  const overdueList = requests.filter(r => r.status === 'OVERDUE' || r.status === 'CASE_REVIEW');

  // Handler: Buat Permission Request Baru (DRAFT -> SUBMITTED)
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const santriObj = MASTER_SANTRI.find(s => s.nis === formSantriNis) || MASTER_SANTRI[0];
    const kelasObj = MASTER_KELAS.find(k => k.id === santriObj.kelas_id);

    const newReq = createPermissionRequest({
      santri_id: santriObj.nis,
      nis: santriObj.nis,
      nama: santriObj.nama,
      kelas: kelasObj?.nama_kelas || 'Kelas 7A Tahfidz Sains',
      kamar: 'Kamar Asrama Ibnu Khaldun',
      alasan: formAlasan,
      tujuan: formTujuan,
      rencana_keluar: formRencanaKeluar,
      rencana_kembali: formRencanaKembali,
      nama_penjemput: formNamaPenjemput,
      kontak_wali: formKontakWali,
      hubungan_penjemput: formHubunganPenjemput,
    });

    setModalCreate(false);
    setNotif(`✓ Permission Request berhasil diajukan untuk ${newReq.nama}. Status: SUBMITTED (Tercatat dalam audit trail).`);
    setTimeout(() => setNotif(''), 6000);
  };

  // Handler: Mulai Review
  const handleStartReview = (id: string) => {
    const res = startReviewPermission(id, 'Ust. Hamzah, Lc. (Musyrif)');
    if (res) {
      setNotif(`✓ Izin ${res.nama} masuk tahap UNDER_REVIEW oleh Musyrif.`);
      setTimeout(() => setNotif(''), 6000);
    }
  };

  // Handler: Verifikasi Petugas (UNDER_REVIEW -> APPROVED / REJECTED)
  const handleVerify = (action: 'APPROVE' | 'REJECT') => {
    if (!modalVerify) return;
    const res = verifyPermissionRequest(modalVerify.id, action, verifyPetugasNama, verifyAlasanTolak);
    setModalVerify(null);
    if (action === 'APPROVE') {
      setNotif(`✓ Kebijakan izin ${res?.nama} telah DISETUJUI (APPROVED). Menunggu penerbitan QR Gate Pass.`);
    } else {
      setNotif(`ℹ Permohonan izin ${res?.nama} DITOLAK (REJECTED).`);
    }
    setTimeout(() => setNotif(''), 6000);
  };

  // Handler: Terbitkan Gate Pass (APPROVED -> GATE_PASS)
  const handleIssueGatePass = (id: string) => {
    const res = issueGatePass(id, 'Ust. Rahmat, S.Pd (Kesantrian)');
    if (res) {
      setNotif(`✓ QR Gate Pass resmi diterbitkan (${res.qr_code}) untuk ${res.nama}. Status: GATE_PASS.`);
      setModalGatePass(res);
      setTimeout(() => setNotif(''), 6000);
    }
  };

  // Handler: Check-out di Pos Gerbang (GATE_PASS -> SANTRI_OUTSIDE)
  const handleCheckOut = (id: string, notes?: string) => {
    const res = checkOutSantri(id, {
      officer_name: scannerOfficer,
      gate_location: scannerLocation,
      condition_notes: notes || scannerNotes || 'Santri berpakaian seragam rapi dan membawa surat jalan resmi pondok.',
    });
    if (res) {
      setScanResult({
        success: true,
        type: 'keluar',
        santri: res.nama,
        nis: res.nis,
        waktu: new Date().toLocaleTimeString('id-ID'),
        status: 'SANTRI_OUTSIDE (Di Luar Kampus)',
        pesan: 'Santri tercatat keluar gerbang oleh petugas pos. Status izin beralih ke SANTRI_OUTSIDE. Pergerakan gerbang tersimpan.',
      });
      setNotif(`✓ Santri ${res.nama} tercatat KELUAR GERBANG (SANTRI_OUTSIDE). Gerbang dibuka.`);
      setTimeout(() => setNotif(''), 6000);
    }
  };

  // Handler: Check-in saat Kembali (SANTRI_OUTSIDE -> RETURNED / CASE_REVIEW)
  const handleCheckIn = (id: string, notes?: string) => {
    const res = checkInSantri(id, {
      officer_name: scannerOfficer,
      gate_location: scannerLocation,
      condition_notes: notes || scannerNotes,
    });
    if (res) {
      const isLate = res.status === 'CASE_REVIEW' || res.status === 'OVERDUE';
      setScanResult({
        success: true,
        type: 'kembali',
        santri: res.nama,
        nis: res.nis,
        waktu: new Date().toLocaleTimeString('id-ID'),
        status: isLate ? 'CASE_REVIEW (Terlambat - Perlu Klarifikasi)' : 'RETURNED (Tepat Waktu)',
        pesan: isLate 
          ? `Santri kembali lewat batas waktu (+${res.menit_terlambat || 30} menit). Status dialihkan ke CASE_REVIEW untuk investigasi kesantrian (Bukan langsung vonis pelanggaran).`
          : 'Santri kembali tepat waktu. Sesi perizinan resmi dinyatakan SELESAI (RETURNED).',
        diffMinutes: res.menit_terlambat,
      });
      setNotif(
        isLate 
          ? `⚠️ PERHATIAN: ${res.nama} terlambat ${res.menit_terlambat} menit. Kasus dialihkan ke CASE_REVIEW untuk sidang klarifikasi.`
          : `✓ Alhamdulillah! ${res.nama} kembali tepat waktu (RETURNED). Izin selesai sempurna.`
      );
      setTimeout(() => setNotif(''), 7000);
    }
  };

  // Handler: Buka Sidang Case Review
  const handleOpenCaseReviewModal = (item: PermissionRequest) => {
    startCaseReview(item.id, 'Ust. Rahmat, S.Pd (Kesantrian)');
    setCrExplanation(item.case_review?.explanation || '');
    setCrEvidence(item.case_review?.supporting_evidence || '');
    setCrCategory(item.case_review?.category || 'KENDARAAN_MOGOK_MACET');
    setCrDecision(item.case_review?.decision || 'EXCUSED');
    setCrRationale(item.case_review?.decision_rationale || '');
    setCrDisciplinePoints(Math.abs(item.case_review?.discipline_points || 10));
    setCrSanctionAction(item.case_review?.sanction_action || 'Iqob Tarbawi: Piket Kebersihan Asrama & Hafalan Al-Qur\'an');
    setModalCaseReview(item);
  };

  // Handler: Simpan Putusan Case Review
  const handleSubmitCaseReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCaseReview) return;

    const res = submitCaseReview(modalCaseReview.id, {
      reviewer_name: crReviewerName,
      reviewer_role: crReviewerRole,
      category: crCategory,
      explanation: crExplanation,
      supporting_evidence: crEvidence,
      decision: crDecision,
      decision_rationale: crRationale,
      discipline_points: crDecision === 'VIOLATION' ? crDisciplinePoints : 0,
      sanction_action: crDecision === 'VIOLATION' ? crSanctionAction : undefined,
    });

    setModalCaseReview(null);
    if (crDecision === 'EXCUSED') {
      setNotif(`✓ Putusan Sidang: EXCUSED (Dispensasi sah diterima, 0 sanksi). Kasus perizinan ${res?.nama} ditutup damai.`);
    } else {
      setNotif(`⚠️ Putusan Sidang: VIOLATION. Poin sanksi (-${crDisciplinePoints}) otomatis tercatat dan tersinkronisasi ke Modul Disiplin Tarbawi.`);
    }
    setTimeout(() => setNotif(''), 7000);
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman Perizinan */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-500/40">
              Kesantrian & Keamanan Gerbang
            </span>
            {overdueOrReviewCount > 0 && (
              <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{overdueOrReviewCount} Kasus Butuh Klarifikasi</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold mt-2">Perizinan Santri & Digital Gate Pass</h1>
          <p className="text-xs text-emerald-200 mt-1 max-w-3xl">
            Siklus FSM Lengkap: <strong>SUBMITTED</strong> ➔ <strong>UNDER_REVIEW</strong> ➔ <strong>APPROVED</strong> ➔ <strong>GATE_PASS</strong> ➔ <strong>CHECKED_OUT</strong> (SANTRI_OUTSIDE) ➔ <strong>RETURNED</strong> atau <strong>OVERDUE</strong> ➔ <strong>CASE_REVIEW</strong> ➔ (<strong>EXCUSED</strong> / <strong>VIOLATION</strong>)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refreshData}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center space-x-1"
            title="Segarkan data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setModalCreate(true)}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>+ Buat Permohonan Izin (Permission Request)</span>
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center space-x-2 shadow-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚠️ ALERT KESANTRIAN & KASUS OVERDUE (PRINSIP: OVERDUE != VIOLATION) */}
      {/* ========================================================================= */}
      {overdueList.length > 0 && (
        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 border-2 border-rose-300 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-bounce">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-rose-950 text-sm flex items-center space-x-2">
                  <span>ALERT KESANTRIAN: {overdueList.length} Santri Melewati Batas Izin / Sedang Dalam Case Review</span>
                  <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-mono">SOP Terpadu</span>
                </h3>
                <p className="text-xs text-rose-800 mt-0.5">
                  <strong>Prinsip Inti:</strong> <code className="bg-rose-100 px-1 py-0.5 rounded">OVERDUE ≠ VIOLATION</code>. Keterlambatan harus melalui sidang klarifikasi (<strong>CASE_REVIEW</strong>) untuk memeriksa alasan objektif sebelum vonis sanksi.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-600 text-white font-mono font-bold text-xs rounded-full shadow-xs self-start sm:self-auto">
                Tahap: Investigasi & Sidang
              </span>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-rose-200 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-100/70 text-rose-900 uppercase text-[10px] tracking-wider border-b border-rose-200">
                <tr>
                  <th className="p-3">Santri & Kamar</th>
                  <th className="p-3">Keperluan Izin</th>
                  <th className="p-3">Target vs Aktual</th>
                  <th className="p-3 text-center">Durasi Terlambat</th>
                  <th className="p-3 text-center">Status Saat Ini</th>
                  <th className="p-3 text-right">Aksi Sidang Kesantrian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100">
                {overdueList.map((item) => (
                  <tr key={item.id} className="hover:bg-rose-50/60 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{item.nama}</div>
                      <div className="text-[10px] text-slate-500 font-mono">NIS: {item.nis} • {item.kamar}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{item.alasan}</div>
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.tujuan}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      <div>Target: <strong>{item.rencana_kembali}</strong></div>
                      <span className="text-[10px] text-rose-600 font-bold">Terlampaui</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-1 rounded-full font-bold font-mono text-xs bg-rose-100 text-rose-800 border border-rose-300">
                        +{item.menit_terlambat || 45} Menit
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        item.status === 'CASE_REVIEW' 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <a
                          href={`https://wa.me/${item.kontak_wali.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=Assalamu'alaikum%20Bapak/Ibu%20wali%20dari%20ananda%20${encodeURIComponent(item.nama)},%20kami%20dari%20Kesantrian%20KabarSantri%20menginformasikan%20mengenai%20sidang%20klarifikasi%20keterlambatan%20izin.`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition inline-flex items-center space-x-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Hubungi Wali</span>
                        </a>

                        <button
                          onClick={() => handleOpenCaseReviewModal(item)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition inline-flex items-center space-x-1"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>Sidang Case Review</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5 Metrik Ringkasan Lifecycle Status */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Total Izin</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-800">{totalCount} Sesi</div>
          <span className="text-[10px] text-slate-400 block">Siklus lifecycle</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-amber-800 font-semibold">1. Pengajuan / Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700">{reviewCount} Santri</div>
          <span className="text-[10px] text-amber-600 block">SUBMITTED & REVIEW</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-emerald-800 font-semibold">2. Gate Pass Siap</span>
            <QrCode className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">{gatePassCount} Santri</div>
          <span className="text-[10px] text-emerald-600 block">APPROVED & GATE_PASS</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-semibold">3. Di Luar Pondok</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
          </div>
          <div className="text-xl font-bold font-mono text-blue-700">{outsideCount} Santri</div>
          <span className="text-[10px] text-blue-600 block">SANTRI_OUTSIDE</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-rose-800 font-semibold">4. Case Review</span>
            <Scale className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-700">{overdueOrReviewCount} Kasus</div>
          <span className="text-[10px] text-rose-600 font-bold block">OVERDUE / REVIEW</span>
        </div>
      </div>

      {/* Tab Navigasi Utama */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 gap-1 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setActiveTab('daftar')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition ${
            activeTab === 'daftar'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Siklus Perizinan (Permission Lifecycle)</span>
        </button>

        <button
          onClick={() => setActiveTab('scan_satpam')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition ${
            activeTab === 'scan_satpam'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>2. Pos Keamanan & Gate Movement (Check-Out / Check-In)</span>
        </button>

        <button
          onClick={() => setActiveTab('alert_kesantrian')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition ${
            activeTab === 'alert_kesantrian'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>3. Kesantrian Alert & Sidang Kasus ({overdueOrReviewCount})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SIKLUS PERIZINAN (PERMISSION LIFECYCLE) */}
      {/* ========================================================================= */}
      {activeTab === 'daftar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Alur Bisnis Perizinan Santri & Digital Gate Pass</h3>
              <p className="text-xs text-slate-500">
                Lacak seluruh status FSM, verifikasi kebijakan musyrif/kesantrian, terbitkan pass, dan telaah riwayat audit
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari santri / NIS / keperluan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56"
                />
              </div>

              <button
                onClick={() => setModalCreate(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Buat Izin Baru</span>
              </button>
            </div>
          </div>

          {/* Filter Status Lifecycle Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600 mr-1 text-[11px]">Filter Lifecycle:</span>
            {[
              { id: 'ALL', label: `Semua (${totalCount})` },
              { id: 'REVIEW', label: `Tahap Review (${reviewCount})` },
              { id: 'GATE_PASS', label: `Gate Pass Aktif (${gatePassCount})` },
              { id: 'OUTSIDE', label: `Di Luar Kampus (${outsideCount})` },
              { id: 'CASE_REVIEW', label: `Sidang Kasus / Overdue (${overdueOrReviewCount})` },
              { id: 'FINISHED', label: `Selesai / Arsip` },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setFilterGroup(p.id as any)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  filterGroup === p.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Tabel Permintaan Izin */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Santri & Kamar</th>
                  <th className="p-3">Alasan & Tujuan Izin</th>
                  <th className="p-3">Rencana Waktu (Keluar - Kembali)</th>
                  <th className="p-3">Penjemput & Mahrom</th>
                  <th className="p-3 text-center">Status FSM</th>
                  <th className="p-3 text-right">Aksi Alur Kerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length > 0 ? (
                  filteredList.map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{item.nama}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            NIS: {item.nis} • {item.kelas}
                          </div>
                          <div className="text-[10px] text-slate-500">{item.kamar}</div>
                        </td>

                        <td className="p-3 max-w-xs">
                          <div className="font-bold text-slate-800">{item.alasan}</div>
                          <div className="text-[11px] text-slate-600 flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{item.tujuan}</span>
                          </div>
                        </td>

                        <td className="p-3 font-mono text-slate-700">
                          <div>Keluar: <strong>{item.rencana_keluar}</strong></div>
                          <div>Kembali: <strong>{item.rencana_kembali}</strong></div>
                          {item.gate_pass_issued_at && (
                            <div className="text-[10px] text-teal-600 font-semibold mt-0.5">
                              Pass: {item.qr_code}
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-800">{item.nama_penjemput}</div>
                          <div className="text-[10px] text-slate-500">
                            {item.hubungan_penjemput} • <span className="font-mono">{item.kontak_wali}</span>
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          {item.status === 'SUBMITTED' && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>SUBMITTED</span>
                            </span>
                          )}
                          {item.status === 'UNDER_REVIEW' && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-500 text-slate-950 font-mono inline-flex items-center space-x-1">
                              <UserCheck className="w-3 h-3" />
                              <span>UNDER_REVIEW</span>
                            </span>
                          )}
                          {item.status === 'APPROVED' && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>APPROVED</span>
                            </span>
                          )}
                          {item.status === 'GATE_PASS' && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-teal-100 text-teal-800 border border-teal-300 inline-flex items-center space-x-1 shadow-2xs">
                              <QrCode className="w-3 h-3 text-teal-700" />
                              <span>GATE_PASS</span>
                            </span>
                          )}
                          {(item.status === 'SANTRI_OUTSIDE' || item.status === 'CHECKED_OUT') && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-blue-100 text-blue-800 border border-blue-300 inline-flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                              <span>SANTRI_OUTSIDE</span>
                            </span>
                          )}
                          {item.status === 'RETURNED' && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-300 inline-flex items-center space-x-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>RETURNED (On-Time)</span>
                            </span>
                          )}
                          {item.status === 'OVERDUE' && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center space-x-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>OVERDUE (+{item.menit_terlambat || 30}m)</span>
                            </span>
                          )}
                          {item.status === 'CASE_REVIEW' && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center space-x-1">
                              <Scale className="w-3 h-3 text-amber-700" />
                              <span>CASE_REVIEW</span>
                            </span>
                          )}
                          {item.status === 'EXCUSED' && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>EXCUSED (Dispensasi)</span>
                            </span>
                          )}
                          {item.status === 'VIOLATION' && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-rose-100 text-rose-900 border border-rose-400 inline-flex items-center space-x-1">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              <span>VIOLATION (Sanksi)</span>
                            </span>
                          )}
                          {item.status === 'REJECTED' && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-slate-100 text-slate-500 border border-slate-300">
                              REJECTED
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Aksi SUBMITTED: Mulai Review atau Verifikasi Langsung */}
                            {item.status === 'SUBMITTED' && (
                              <>
                                <button
                                  onClick={() => handleStartReview(item.id)}
                                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold text-xs rounded-lg transition"
                                >
                                  Mulai Review
                                </button>
                                <button
                                  onClick={() => setModalVerify(item)}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition"
                                >
                                  Verifikasi
                                </button>
                              </>
                            )}

                            {/* Aksi UNDER_REVIEW: Putusan Musyrif / Kesantrian */}
                            {item.status === 'UNDER_REVIEW' && (
                              <button
                                onClick={() => setModalVerify(item)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                              >
                                Putuskan Izin
                              </button>
                            )}

                            {/* Aksi APPROVED: Terbitkan Gate Pass (Prinsip: APPROVED != SANTRI_OUTSIDE) */}
                            {item.status === 'APPROVED' && (
                              <button
                                onClick={() => handleIssueGatePass(item.id)}
                                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Terbitkan Gate Pass</span>
                              </button>
                            )}

                            {/* Aksi GATE_PASS: Tampilkan Surat Jalan QR Pass */}
                            {item.status === 'GATE_PASS' && (
                              <>
                                <button
                                  onClick={() => setModalGatePass(item)}
                                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-semibold text-xs rounded-lg transition flex items-center space-x-1"
                                >
                                  <QrCode className="w-3.5 h-3.5 text-teal-600" />
                                  <span>QR Pass</span>
                                </button>
                                <button
                                  onClick={() => handleCheckOut(item.id)}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center space-x-1"
                                >
                                  <LogOut className="w-3.5 h-3.5" />
                                  <span>Check-Out</span>
                                </button>
                              </>
                            )}

                            {/* Aksi SANTRI_OUTSIDE / CHECKED_OUT: Check-in Kembali */}
                            {(item.status === 'SANTRI_OUTSIDE' || item.status === 'CHECKED_OUT') && (
                              <button
                                onClick={() => handleCheckIn(item.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1"
                              >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Check-In</span>
                              </button>
                            )}

                            {/* Aksi OVERDUE & CASE_REVIEW: Sidang Kasus */}
                            {(item.status === 'OVERDUE' || item.status === 'CASE_REVIEW') && (
                              <button
                                onClick={() => handleOpenCaseReviewModal(item)}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1"
                              >
                                <Scale className="w-3.5 h-3.5" />
                                <span>Sidang Kasus</span>
                              </button>
                            )}

                            {/* Aksi Putusan EXCUSED / VIOLATION */}
                            {(item.status === 'EXCUSED' || item.status === 'VIOLATION') && item.case_review && (
                              <button
                                onClick={() => handleOpenCaseReviewModal(item)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                                title="Lihat Putusan Sidang"
                              >
                                Putusan
                              </button>
                            )}

                            {/* Tombol Audit Trail Timeline */}
                            <button
                              onClick={() => setModalAuditTrail(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                              title="Lihat Riwayat Lengkap (Audit Trail)"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            {/* Tombol Detail Lengkap */}
                            <button
                              onClick={() => setModalDetail(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                              title="Lihat Rincian Izin"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="font-semibold">Tidak ada permohonan izin dalam kategori filter ini.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: POS KEAMANAN & GATE MOVEMENT (CHECK-OUT / CHECK-IN) */}
      {/* ========================================================================= */}
      {activeTab === 'scan_satpam' && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Card Simulator Scanner Satpam */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="text-center space-y-2 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Scan className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Pos Keamanan Gerbang & Barcode Scanner</h2>
              <p className="text-xs text-slate-500">
                Pindai Digital Gate Pass santri saat <strong>KELUAR</strong> (CHECK_OUT ➔ SANTRI_OUTSIDE) atau <strong>KEMBALI</strong> (CHECK_IN ➔ RETURNED / CASE_REVIEW).
              </p>
            </div>

            {/* Konfigurasi Petugas Pos */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nama Petugas Satpam:</label>
                <input
                  type="text"
                  value={scannerOfficer}
                  onChange={(e) => setScannerOfficer(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Lokasi Gerbang:</label>
                <input
                  type="text"
                  value={scannerLocation}
                  onChange={(e) => setScannerLocation(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold"
                />
              </div>
            </div>

            {/* Pilihan Cepat Santri Berizin */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Pilih Santri yang Memiliki Surat Izin / Gate Pass Aktif:</label>
              <select
                value={scannerSelectedId}
                onChange={(e) => setScannerSelectedId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
              >
                <option value="">-- Pilih Santri Berdasarkan Dokumen Izin --</option>
                {requests
                  .filter(r => r.status === 'GATE_PASS' || r.status === 'APPROVED' || r.status === 'SANTRI_OUTSIDE' || r.status === 'CHECKED_OUT' || r.status === 'OVERDUE')
                  .map(r => (
                    <option key={r.id} value={r.id}>
                      [{r.status}] {r.nama} (NIS: {r.nis}) - {r.alasan}
                    </option>
                  ))}
              </select>
            </div>

            {/* Info Santri Terpilih */}
            {(() => {
              const selectedReq = requests.find(r => r.id === scannerSelectedId);
              if (!selectedReq) {
                return (
                  <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                    Silakan pilih santri berizin di atas atau pindaikan QR Code Gate Pass resmi.
                  </div>
                );
              }

              return (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        selectedReq.status === 'GATE_PASS'
                          ? 'bg-teal-100 text-teal-800'
                          : selectedReq.status === 'SANTRI_OUTSIDE'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedReq.status === 'OVERDUE'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Status Izin: {selectedReq.status}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">{selectedReq.nama}</h4>
                      <p className="text-slate-500 font-mono text-[11px]">NIS: {selectedReq.nis} • {selectedReq.kelas}</p>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-300 text-center">
                      <QrCode className="w-10 h-10 text-slate-800 mx-auto" />
                      <span className="font-mono text-[9px] font-bold text-slate-600 block mt-1">{selectedReq.qr_code || 'GP-VALID'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Keperluan / Alasan:</span>
                      <span className="font-bold text-slate-800">{selectedReq.alasan}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Target Batas Kembali:</span>
                      <span className="font-mono font-bold text-slate-800">{selectedReq.rencana_kembali}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Mahrom Penjemput:</span>
                      <span className="font-semibold text-slate-800">{selectedReq.nama_penjemput} ({selectedReq.hubungan_penjemput})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">Kontak Wali:</span>
                      <span className="font-mono font-semibold text-emerald-700">{selectedReq.kontak_wali}</span>
                    </div>
                  </div>

                  {/* Catatan Pos Satpam */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Catatan Kondisi Barang / Pembawaan Santri:</label>
                    <input
                      type="text"
                      placeholder="Contoh: Membawa ransel seragam, didampingi ayah kandung, kendaraan Avanza B 1234 CD"
                      value={scannerNotes}
                      onChange={(e) => setScannerNotes(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs"
                    />
                  </div>

                  {/* Tombol Aksi Check-out & Check-in */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleCheckOut(selectedReq.id)}
                      disabled={selectedReq.status === 'SANTRI_OUTSIDE'}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Check-Out (Santri Keluar)</span>
                    </button>

                    <button
                      onClick={() => handleCheckIn(selectedReq.id)}
                      disabled={selectedReq.status === 'GATE_PASS' || selectedReq.status === 'APPROVED'}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Check-In (Santri Kembali)</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Hasil Pindai Terakhir */}
            {scanResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                scanResult.status.includes('CASE_REVIEW') || scanResult.status.includes('OVERDUE')
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}>
                <div className="flex items-center space-x-2 font-bold text-sm">
                  {scanResult.status.includes('CASE_REVIEW') || scanResult.status.includes('OVERDUE') ? (
                    <Scale className="w-5 h-5 text-rose-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  <span>Pindai Gerbang: {scanResult.santri}</span>
                </div>
                <p className="leading-relaxed">{scanResult.pesan}</p>
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-200">
                  <span>Waktu Pindai: <strong>{scanResult.waktu}</strong></span>
                  <span className="font-bold">{scanResult.status}</span>
                </div>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Log Pergerakan Fisik Gerbang (Gate Movement) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Riwayat Pergerakan Fisik Gerbang (Gate Movements)</h3>
                <p className="text-xs text-slate-500">Pencatatan aktual saat santri melewati pos gerbang (Check-Out & Check-In)</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-lg">
                Pos Satpam Utama
              </span>
            </div>

            <div className="space-y-3">
              {requests
                .flatMap(r => (r.gate_movements || []).map(gm => ({ ...gm, santriNama: r.nama, santriNis: r.nis, reqId: r.id })))
                .slice(-6)
                .reverse()
                .map(m => (
                  <div key={m.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.type === 'CHECK_OUT' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {m.type === 'CHECK_OUT' ? 'OUT (Keluar)' : 'IN (Kembali)'}
                        </span>
                        <span className="font-bold text-slate-900">{m.santriNama}</span>
                        <span className="text-slate-400 font-mono text-[10px]">({m.santriNis})</span>
                      </div>
                      <span className="font-mono text-slate-500 text-[10px]">{m.timestamp}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pt-1">
                      <div>Petugas: <strong>{m.officer_name}</strong></div>
                      <div>Lokasi: <strong>{m.gate_location}</strong></div>
                    </div>

                    {m.condition_notes && (
                      <p className="text-slate-500 text-[11px] italic bg-white p-2 rounded border border-slate-200">
                        "{m.condition_notes}"
                      </p>
                    )}

                    {m.late_minutes !== undefined && m.late_minutes > 0 && (
                      <span className="text-rose-700 font-bold text-[10px] block">
                        ⚠️ Terlambat {m.late_minutes} menit saat lapor pos kembali
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ALERT & SIDANG KASUS KESANTRIAN (CASE REVIEW) */}
      {/* ========================================================================= */}
      {activeTab === 'alert_kesantrian' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Kesantrian Case Review Center & Manajemen Keterlambatan</h3>
                <p className="text-xs text-slate-500">
                  Sidang evaluasi kasus keterlambatan izin: Menguji alasan darurat, verifikasi bukti, dan menetapkan EXCUSED atau VIOLATION
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {overdueOrReviewCount} Kasus Butuh Sidang
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  {outsideCount} Masih di Luar
                </span>
              </div>
            </div>

            {/* List Detail Kasus yang Membutuhkan Sidang */}
            <div className="space-y-3">
              {requests
                .filter(r => r.status === 'OVERDUE' || r.status === 'CASE_REVIEW' || r.status === 'EXCUSED' || r.status === 'VIOLATION')
                .map(r => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border text-xs space-y-3 ${
                      r.status === 'OVERDUE'
                        ? 'bg-rose-50/50 border-rose-300'
                        : r.status === 'CASE_REVIEW'
                        ? 'bg-amber-50/50 border-amber-300'
                        : r.status === 'EXCUSED'
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : 'bg-rose-50/40 border-rose-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            r.status === 'OVERDUE'
                              ? 'bg-rose-600 text-white animate-pulse'
                              : r.status === 'CASE_REVIEW'
                              ? 'bg-amber-600 text-white'
                              : r.status === 'EXCUSED'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-700 text-white'
                          }`}>
                            {r.status}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">{r.nama}</span>
                          <span className="text-slate-400 font-mono">({r.nis})</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">{r.kelas} • {r.kamar}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <a
                          href={`https://wa.me/${r.kontak_wali.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Hubungi Wali</span>
                        </a>

                        <button
                          onClick={() => handleOpenCaseReviewModal(r)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>{r.case_review ? 'Lihat / Edit Sidang' : 'Mulai Sidang Case Review'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-slate-700">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Alasan & Tujuan Izin:</span>
                        <p className="font-bold text-slate-800">{r.alasan}</p>
                        <p className="text-[11px] text-slate-500">{r.tujuan}</p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Target vs Keterlambatan:</span>
                        <p className="font-mono text-slate-800">Batas: {r.rencana_kembali}</p>
                        <p className="font-bold text-rose-700">Terlambat: +{r.menit_terlambat || 30} menit</p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px]">Hasil Sidang Terakhir:</span>
                        {r.case_review ? (
                          <div className="text-[11px]">
                            <span className="font-bold block text-slate-900">
                              Putusan: {r.case_review.decision} ({r.case_review.category})
                            </span>
                            <span className="text-slate-500 italic block">{r.case_review.decision_rationale}</span>
                          </div>
                        ) : (
                          <span className="text-amber-800 font-semibold italic text-[11px]">
                            Menunggu sidang klarifikasi musyrif / kesantrian
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORM PENGAJUAN PERMISSION REQUEST BARU */}
      {/* ========================================================================= */}
      {modalCreate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Pengajuan Permission Request Baru</h3>
                <p className="text-xs text-slate-500">Mencatat pemohon, alasan, tujuan, waktu keluar, dan waktu kembali.</p>
              </div>
              <button
                onClick={() => setModalCreate(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Santri Pemohon *</label>
                <select
                  value={formSantriNis}
                  onChange={(e) => setFormSantriNis(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                >
                  {((isTenantMode() ? getSharedSantriList() : MASTER_SANTRI)).length === 0 ? (
                    <option value="">-- Belum ada santri terdaftar --</option>
                  ) : (
                    (isTenantMode() ? getSharedSantriList() : MASTER_SANTRI).map((s) => (
                      <option key={s.nis} value={s.nis}>
                        {s.nama} (NIS: {s.nis})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan / Keperluan Izin *</label>
                <select
                  value={formAlasan}
                  onChange={(e) => setFormAlasan(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 mb-2"
                >
                  <option value="Berobat ke Dokter Spesialis (Pemeriksaan Kesehatan)">Berobat ke Dokter Spesialis (Pemeriksaan Kesehatan)</option>
                  <option value="Izin Pulang (Pernikahan Kakak Kandung)">Izin Pulang (Pernikahan Kakak Kandung)</option>
                  <option value="Takziyah Keluarga Dekat / Kakek Nenek">Takziyah Keluarga Dekat / Kakek Nenek</option>
                  <option value="Mengikuti Lomba / Delegasi Prestasi Pesantren">Mengikuti Lomba / Delegasi Prestasi Pesantren</option>
                  <option value="Pengurusan Dokumen Resmi (Paspor / KTP / Ijazah)">Pengurusan Dokumen Resmi (Paspor / KTP / Ijazah)</option>
                  <option value="Keperluan Pribadi Mendesak Lainnya">Keperluan Pribadi Mendesak Lainnya</option>
                </select>
                <input
                  type="text"
                  required
                  placeholder="Atau tuliskan alasan spesifik di sini..."
                  value={formAlasan}
                  onChange={(e) => setFormAlasan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kota & Alamat Tujuan *</label>
                <input
                  type="text"
                  required
                  value={formTujuan}
                  onChange={(e) => setFormTujuan(e.target.value)}
                  placeholder="Contoh: RSUD Dr. Saiful Anwar Malang / Surabaya"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rencana Waktu Keluar *</label>
                  <input
                    type="text"
                    required
                    value={formRencanaKeluar}
                    onChange={(e) => setFormRencanaKeluar(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rencana Waktu Kembali *</label>
                  <input
                    type="text"
                    required
                    value={formRencanaKembali}
                    onChange={(e) => setFormRencanaKembali(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Mahrom Penjemput *</label>
                  <input
                    type="text"
                    required
                    value={formNamaPenjemput}
                    onChange={(e) => setFormNamaPenjemput(e.target.value)}
                    placeholder="Nama orang tua / mahrom"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hubungan dengan Santri *</label>
                  <select
                    value={formHubunganPenjemput}
                    onChange={(e) => setFormHubunganPenjemput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Ayah Kandung">Ayah Kandung</option>
                    <option value="Ibu Kandung">Ibu Kandung</option>
                    <option value="Wali Mahrom Resmi">Wali Mahrom Resmi</option>
                    <option value="Kakak Kandung">Kakak Kandung</option>
                    <option value="Pendamping Resmi Pesantren">Pendamping Resmi Pesantren</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / Telepon Wali Aktif *</label>
                <input
                  type="text"
                  required
                  value={formKontakWali}
                  onChange={(e) => setFormKontakWali(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalCreate(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Kirim Permission Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VERIFIKASI KEBIJAKAN (PETUGAS APPROVE / REJECT) */}
      {/* ========================================================================= */}
      {modalVerify && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Verifikasi Kebijakan Izin
                </span>
                <h3 className="font-bold text-slate-800 text-base mt-1">Verifikasi Permohonan Izin</h3>
              </div>
              <button
                onClick={() => setModalVerify(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] font-semibold block">Santri Pemohon:</span>
                <span className="font-bold text-slate-800 text-sm">{modalVerify.nama}</span>
                <span className="text-slate-500 font-mono block">NIS: {modalVerify.nis} • {modalVerify.kelas}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-semibold block">Keperluan:</span>
                <span className="font-semibold text-slate-800">{modalVerify.alasan}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tujuan:</span>
                  <span className="font-semibold text-slate-800">{modalVerify.tujuan}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Penjemput:</span>
                  <span className="font-semibold text-slate-800">{modalVerify.nama_penjemput} ({modalVerify.hubungan_penjemput})</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700 pt-1 border-t border-slate-200">
                <div>Keluar: {modalVerify.rencana_keluar}</div>
                <div>Kembali: {modalVerify.rencana_kembali}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">Nama Petugas Verifikator *</label>
              <input
                type="text"
                value={verifyPetugasNama}
                onChange={(e) => setVerifyPetugasNama(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">Catatan / Alasan Penolakan (Jika Ditolak)</label>
              <input
                type="text"
                placeholder="Isi jika permohonan tidak disetujui..."
                value={verifyAlasanTolak}
                onChange={(e) => setVerifyAlasanTolak(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleVerify('REJECT')}
                className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition"
              >
                ✕ Tolak Izin (REJECT)
              </button>

              <button
                type="button"
                onClick={() => handleVerify('APPROVE')}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                ✓ Setujui (APPROVED)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SURAT JALAN & DIGITAL GATE PASS QR */}
      {/* ========================================================================= */}
      {modalGatePass && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
                Digital Gate Pass Resmi
              </span>
              <button
                onClick={() => setModalGatePass(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">{modalGatePass.nama}</h3>
              <p className="text-xs text-slate-500 font-mono">NIS: {modalGatePass.nis} • {modalGatePass.kelas}</p>
              <p className="text-xs text-slate-600 font-semibold mt-1">{modalGatePass.alasan}</p>
            </div>

            <div className="w-48 h-48 bg-slate-50 border-2 border-dashed border-teal-500 rounded-2xl mx-auto flex flex-col items-center justify-center p-3 shadow-inner">
              <QrCode className="w-28 h-28 text-slate-900" />
              <span className="font-mono text-xs text-teal-800 font-bold mt-2">
                {modalGatePass.qr_code || 'GP-VALID-2026'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-[11px] space-y-1">
              <div>Tujuan: <strong>{modalGatePass.tujuan}</strong></div>
              <div>Batas Kembali: <strong className="text-rose-700 font-mono">{modalGatePass.rencana_kembali}</strong></div>
              <div>Mahrom Penjemput: <strong>{modalGatePass.nama_penjemput}</strong> ({modalGatePass.hubungan_penjemput})</div>
              <div>Verifikator: <strong>{modalGatePass.petugas_verifikasi || 'Bagian Kesantrian'}</strong></div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tunjukkan QR Code ini kepada petugas pos keamanan saat keluar dan saat kembali ke lingkungan pondok.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Pass</span>
              </button>
              <button
                onClick={() => setModalGatePass(null)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SIDANG CASE REVIEW (INVESTIGASI KETERLAMBATAN SANTRI) */}
      {/* ========================================================================= */}
      {modalCaseReview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Sidang Investigasi Kasus Keterlambatan
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  Case Review: {modalCaseReview.nama}
                </h3>
              </div>
              <button
                onClick={() => setModalCaseReview(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informasi Kasus */}
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Keterlambatan: +{modalCaseReview.menit_terlambat || 30} Menit</span>
                <span className="font-mono text-slate-600">Target: {modalCaseReview.rencana_kembali}</span>
              </div>
              <p className="text-slate-600">Keperluan: <strong>{modalCaseReview.alasan}</strong> ({modalCaseReview.tujuan})</p>
              <p className="text-slate-500 text-[11px]">Penjemput: {modalCaseReview.nama_penjemput} ({modalCaseReview.hubungan_penjemput}) • HP: {modalCaseReview.kontak_wali}</p>
            </div>

            <form onSubmit={handleSubmitCaseReview} className="space-y-3.5 text-xs">
              {/* Kategori Alasan Keterlambatan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Klasifikasi Alasan Keterlambatan *</label>
                <select
                  value={crCategory}
                  onChange={(e) => setCrCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                >
                  <option value="KENDARAAN_MOGOK_MACET">Kendaraan Mogok / Kendala Teknis Transportasi</option>
                  <option value="DARURAT_MEDIS_KELUARGA">Darurat Medis / Anggota Keluarga Masuk RS</option>
                  <option value="CUACA_BENCANA">Cuaca Ekstrem / Banjir / Bencana Alam</option>
                  <option value="KELALAIAN_SANTRI">Kelalaian / Kesengajaan Santri (Mampir/Nongkrong)</option>
                  <option value="LAINNYA">Lainnya (Memerlukan telaah khusus)</option>
                </select>
              </div>

              {/* Kronologi & Penjelasan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kronologi & Penjelasan Klarifikasi Santri / Wali *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tuliskan kronologi hasil wawancara musyrif/kesantrian terhadap santri dan konfirmasi wali..."
                  value={crExplanation}
                  onChange={(e) => setCrExplanation(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Bukti Pendukung */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bukti Pendukung yang Dilampirkan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Surat Keterangan KAI No. SK/02/X/2026 / Foto ban mobil robek / Surat dokter"
                  value={crEvidence}
                  onChange={(e) => setCrEvidence(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Pilihan Putusan: EXCUSED vs VIOLATION */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800 mb-1.5">Putusan Hasil Sidang Kesantrian *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCrDecision('EXCUSED')}
                    className={`p-3 rounded-xl border text-left transition ${
                      crDecision === 'EXCUSED'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>EXCUSED (Dispensasi)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Alasan sah & terbukti musibah di luar kendali. <strong>0 Poin Pelanggaran</strong>.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCrDecision('VIOLATION')}
                    className={`p-3 rounded-xl border text-left transition ${
                      crDecision === 'VIOLATION'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>VIOLATION (Pelanggaran)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Kelalaian santri. Otomatis tercatat di Modul Disiplin Pesantren.
                    </p>
                  </button>
                </div>
              </div>

              {/* Detail Sanksi jika Putusan VIOLATION */}
              {crDecision === 'VIOLATION' && (
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-rose-900 mb-1">Bobot Poin Pelanggaran (-):</label>
                      <input
                        type="number"
                        min="1"
                        value={crDisciplinePoints}
                        onChange={(e) => setCrDisciplinePoints(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-rose-300 rounded-lg font-mono font-bold text-rose-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-rose-900 mb-1">Tindakan Sanksi Tarbawi:</label>
                      <input
                        type="text"
                        value={crSanctionAction}
                        onChange={(e) => setCrSanctionAction(e.target.value)}
                        className="w-full p-2 bg-white border border-rose-300 rounded-lg text-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pertimbangan Sidang (Rationale) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pertimbangan & Dasar Putusan Sidang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Keterlambatan terbukti murni musibah teknis KAI, wali proaktif konfirmasi sebelum batas waktu."
                  value={crRationale}
                  onChange={(e) => setCrRationale(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalCaseReview(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs transition ${
                    crDecision === 'EXCUSED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Simpan Putusan Sidang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RIWAYAT LENGKAP AUDIT TRAIL */}
      {/* ========================================================================= */}
      {modalAuditTrail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-800 text-base">Audit Trail Timeline: {modalAuditTrail.nama}</h3>
              </div>
              <button
                onClick={() => setModalAuditTrail(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {(modalAuditTrail.audit_trail || []).map((log, idx) => (
                <div key={log.id || idx} className="relative pl-6 pb-2 border-l-2 border-slate-200 text-xs">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono text-[11px]">{log.action}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    Oleh: {log.actor_name} ({log.actor_role})
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setModalAuditTrail(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DETAIL RINCIAN PERIZINAN */}
      {/* ========================================================================= */}
      {modalDetail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-slate-400 font-bold">ID: {modalDetail.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  modalDetail.status === 'OVERDUE'
                    ? 'bg-rose-100 text-rose-800'
                    : modalDetail.status === 'CASE_REVIEW'
                    ? 'bg-amber-100 text-amber-800'
                    : modalDetail.status === 'SANTRI_OUTSIDE'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {modalDetail.status}
                </span>
              </div>
              <button
                onClick={() => setModalDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 text-base">{modalDetail.nama}</h4>
                <p className="text-slate-500 font-mono">NIS: {modalDetail.nis} • {modalDetail.kelas} • {modalDetail.kamar}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block">Alasan Izin:</span>
                    <span className="font-bold text-slate-800">{modalDetail.alasan}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block">Tujuan:</span>
                    <span className="font-bold text-slate-800">{modalDetail.tujuan}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block">Rencana Keluar:</span>
                    <span className="font-mono font-semibold text-slate-800">{modalDetail.rencana_keluar}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block">Rencana Kembali:</span>
                    <span className="font-mono font-bold text-rose-700">{modalDetail.rencana_kembali}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block">Penjemput:</span>
                    <span className="font-semibold text-slate-800">{modalDetail.nama_penjemput} ({modalDetail.hubungan_penjemput})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-semibold block">Kontak Wali:</span>
                    <span className="font-mono font-semibold text-slate-800">{modalDetail.kontak_wali}</span>
                  </div>
                </div>
              </div>

              {/* Rincian Case Review jika ada */}
              {modalDetail.case_review && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">Putusan Sidang: {modalDetail.case_review.decision}</span>
                    <span className="font-mono text-amber-800 text-[10px]">{modalDetail.case_review.reviewed_at}</span>
                  </div>
                  <p className="text-slate-700">Kronologi: {modalDetail.case_review.explanation}</p>
                  <p className="text-slate-600 italic">Pertimbangan: {modalDetail.case_review.decision_rationale}</p>
                  {modalDetail.case_review.linked_discipline_id && (
                    <div className="pt-1">
                      <Link
                        href={`/akademik/disiplin?tab=pelanggaran`}
                        className="text-rose-700 font-bold hover:underline inline-flex items-center space-x-1"
                      >
                        <span>Terhubung ke Modul Disiplin (#{modalDetail.case_review.linked_discipline_id})</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setModalDetail(null);
                  setModalAuditTrail(modalDetail);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center space-x-1"
              >
                <History className="w-4 h-4" />
                <span>Lihat Audit Trail Lengkap</span>
              </button>

              <button
                onClick={() => setModalDetail(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
