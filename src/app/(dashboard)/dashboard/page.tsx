'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCheck, 
  BookOpen, 
  Award, 
  AlertTriangle, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Utensils, 
  Settings, 
  Plus,
  ArrowRight, 
  TrendingUp, 
  Receipt, 
  GraduationCap, 
  Users, 
  School, 
  FileText, 
  Sparkles, 
  HeartHandshake,
  ShieldCheck,
  Send,
  Calendar,
  MapPin,
  QrCode,
  Package,
  Wrench,
  Check,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Phone,
  Flame,
  AlertCircle,
  LogIn,
  LogOut,
  Scan,
  Search,
  PhoneCall,
  X,
  ChevronDown
} from 'lucide-react';
import { 
  getActiveActor, 
  setActiveActorByRole, 
  MASTER_PILLAR_ACTORS, 
  ActiveActor,
  useAppMode,
  useActiveTenant,
  setAppMode
} from '@/lib/sessionStore';
import { 
  getSharedPresensiList, 
  saveSharedPresensi, 
  getSharedLearningSessions,
  getSharedPermissionRequests,
  getSharedDisciplineRecords,
  checkOutSantri,
  checkInSantri,
  createPermissionRequest,
  issueGatePass,
  PermissionRequest,
  MASTER_SANTRI,
  getSharedSantriList
} from '@/lib/sharedDataStore';
import { 
  getLeaveRequests, 
  submitLeaveRequest 
} from '@/lib/kepegawaianStore';

export default function UnifiedRoleDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [currentActor, setCurrentActor] = useState<ActiveActor>(MASTER_PILLAR_ACTORS.yayasan);
  const [absenDiriStatus, setAbsenDiriStatus] = useState<string | null>(null);
  const [notif, setNotif] = useState('');
  const [modalCuti, setModalCuti] = useState(false);
  const [modalStok, setModalStok] = useState(false);
  const [rolePickerModalOpen, setRolePickerModalOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  // State Perizinan Gerbang & Scanner Satpam
  const [permRequests, setPermRequests] = useState<PermissionRequest[]>([]);
  const [selectedGateOutId, setSelectedGateOutId] = useState<string>('');
  const [modalIzinPos, setModalIzinPos] = useState(false);
  const [formIzinPos, setFormIzinPos] = useState({
    santriNis: MASTER_SANTRI[0]?.nis || '202601001',
    namaPenjemput: 'H. Ahmad Fauzi',
    hubungan: 'Ayah Kandung',
    kontakWali: '081234567890',
    alasan: 'Pemeriksaan Kesehatan / Berobat ke RS',
    tujuan: 'RSUD Kota / Klinik Terdekat',
    jamKembali: '17:00'
  });
  
  // Form Pengajuan Cuti Mandiri Staf
  const [formCuti, setFormCuti] = useState({
    leave_type: 'TAHUNAN' as 'TAHUNAN' | 'SAKIT' | 'MELAHIRKAN' | 'UMRAH_HAJI' | 'KEMALANGAN' | 'LAINNYA',
    start_date: '2026-10-07',
    end_date: '2026-10-08',
    reason: 'Keperluan keluarga penting di kampung',
    emergency_contact: '081234567890'
  });

  // Form Pengajuan Kebutuhan Non-Moneter (Laundry / Dapur)
  const [formBarang, setFormBarang] = useState({
    nama_barang: 'Deterjen Bubuk Matic 20 Kg & Pewangi Pakaian',
    jumlah: '3 Sak',
    keperluan: 'Stok operasional cucian santri pekan ini'
  });

  // Sinkronisasi Actor & Data dengan Event Listener (Hydration-Safe)
  useEffect(() => {
    setMounted(true);

    // Auto-switch mode jika ada URL query parameter ?mode=tenant / ?mode=live / ?mode=demo
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      if (modeParam === 'tenant' || modeParam === 'live') {
        setAppMode('tenant', 'tenant-rabu-001');
        setActiveActorByRole('tenant_admin_nh');
      } else if (modeParam === 'demo') {
        setAppMode('demo');
        setActiveActorByRole('yayasan');
      }
    }

    const actor = getActiveActor();
    setCurrentActor(actor);
    setSessions(getSharedLearningSessions());
    setPermRequests(getSharedPermissionRequests());
    
    // Cek status absen hari ini dari shared presensi
    const today = new Date().toISOString().split('T')[0];
    const presensiList = getSharedPresensiList();
    const myPresensi = presensiList.find(p => p.tanggal === today && (p.pegawai_nama === actor.name || p.nip === actor.nip));
    if (myPresensi) {
      setAbsenDiriStatus(`Hadir pukul ${myPresensi.waktu}`);
    }

    const handleActorChange = () => {
      const updated = getActiveActor();
      setCurrentActor(updated);
      setSessions(getSharedLearningSessions());
      setPermRequests(getSharedPermissionRequests());
      const list = getSharedPresensiList();
      const myP = list.find(p => p.tanggal === today && (p.pegawai_nama === updated.name || p.nip === updated.nip));
      if (myP) {
        setAbsenDiriStatus(`Hadir pukul ${myP.waktu}`);
      } else {
        setAbsenDiriStatus(null);
      }
    };

    const handlePermUpdate = () => {
      setPermRequests(getSharedPermissionRequests());
    };

    window.addEventListener('ks_session_actor_changed', handleActorChange);
    window.addEventListener('ks_permission_updated', handlePermUpdate);
    return () => {
      window.removeEventListener('ks_session_actor_changed', handleActorChange);
      window.removeEventListener('ks_permission_updated', handlePermUpdate);
    };
  }, []);

  // Handler Ganti Role dari Simulator Bar Dashboard
  const handleSwitchRole = (roleKey: string) => {
    const updated = setActiveActorByRole(roleKey);
    setCurrentActor(updated);
    setRolePickerModalOpen(false);
    setNotif(`Peran beralih ke: ${updated.name} (${updated.title})`);
    setTimeout(() => setNotif(''), 4000);
  };

  // Handler Satpam: Check-Out Santri Keluar Gerbang (Siapa yang keluar)
  const handleCheckOutSantri = (id: string) => {
    const res = checkOutSantri(id, {
      officer_name: currentActor.name,
      gate_location: 'Gerbang Utama & Portal Pos Satpam'
    });
    if (res) {
      setPermRequests(getSharedPermissionRequests());
      setSelectedGateOutId('');
      setNotif(`🚪 Santri ${res.nama} (${res.nis}) resmi CHECK-OUT keluar gerbang pada ${new Date().toLocaleTimeString('id-ID')} WIB.`);
      setTimeout(() => setNotif(''), 6000);
    }
  };

  // Handler Satpam: Check-In Santri Kembali Masuk (Jam berapa kembali & evaluasi tepat waktu/terlambat)
  const handleCheckInSantri = (id: string) => {
    const res = checkInSantri(id, {
      officer_name: currentActor.name,
      gate_location: 'Gerbang Utama & Portal Pos Satpam'
    });
    if (res) {
      setPermRequests(getSharedPermissionRequests());
      if (res.status === 'CASE_REVIEW' || (res.menit_terlambat && res.menit_terlambat > 0)) {
        setNotif(`⚠️ PERINGATAN: Santri ${res.nama} CHECK-IN TERLAMBAT ${res.menit_terlambat} MENIT! Sistem otomatis menjadwalkan Sidang Kasus Kesantrian.`);
      } else {
        setNotif(`✓ Santri an. ${res.nama} (${res.nis}) CHECK-IN kembali ke pondok TEPAT WAKTU.`);
      }
      setTimeout(() => setNotif(''), 7000);
    }
  };

  // Handler Satpam: Form Input Izin Darurat Langsung di Pos Gerbang
  const handleSubmitIzinPos = (e: React.FormEvent) => {
    e.preventDefault();
    const santriObj = MASTER_SANTRI.find(s => s.nis === formIzinPos.santriNis) || MASTER_SANTRI[0];
    const today = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 5);
    
    // 1. Buat izin
    const newReq = createPermissionRequest({
      santri_id: santriObj.nis,
      nis: santriObj.nis,
      nama: santriObj.nama,
      kelas: santriObj.kelas_id === 'k-7a' ? 'Kelas 7A Tahfidz Putra' : 'Kelas Asrama Santri',
      kamar: santriObj.gender === 'akhwat' ? 'Gedung Khadijah Putri' : 'Gedung Abu Bakar Putra',
      alasan: formIzinPos.alasan,
      tujuan: formIzinPos.tujuan,
      rencana_keluar: `${today} ${nowTime}`,
      rencana_kembali: `${today} ${formIzinPos.jamKembali}`,
      nama_penjemput: formIzinPos.namaPenjemput,
      hubungan_penjemput: formIzinPos.hubungan,
      kontak_wali: formIzinPos.kontakWali,
    });

    // 2. Terbitkan gate pass
    issueGatePass(newReq.id, currentActor.name);

    // 3. Langsung check-out
    checkOutSantri(newReq.id, {
      officer_name: currentActor.name,
      companion_name: formIzinPos.namaPenjemput,
      companion_phone: formIzinPos.kontakWali,
      condition_notes: 'Izin darurat pos gerbang dicatat langsung oleh regu Satpam.'
    });

    setPermRequests(getSharedPermissionRequests());
    setModalIzinPos(false);
    setNotif(`🚪 Izin darurat pos berhasil dicatat! Santri ${santriObj.nama} resmi CHECK-OUT keluar gerbang dengan batas kembali pk ${formIzinPos.jamKembali} WIB.`);
    setTimeout(() => setNotif(''), 7000);
  };

  // Handler Absen Mandiri Staf & Pimpinan (GPS Geofencing)
  const handleKlikAbsenDiri = () => {
    const waktu = new Date().toLocaleTimeString('id-ID') + ' WIB';
    const tanggal = new Date().toISOString().split('T')[0];

    const divisiNormalized: 'Akademik' | 'Kesantrian' | 'Rumah Tangga' | 'Keuangan' = 
      isGuru ? 'Akademik' :
      isMusyrif ? 'Kesantrian' :
      (isLaundry || isDapur || isSatpam || currentActor.role_key === 'kepala_rumah_tangga') ? 'Rumah Tangga' : 'Keuangan';

    saveSharedPresensi({
      pegawai_nama: currentActor.name,
      nip: currentActor.nip,
      jabatan: currentActor.title as any,
      divisi: divisiNormalized,
      status: 'masuk',
      tempat: 'Kampus Pesantren (Geofence Radius 15m)',
      tanggal: tanggal,
      waktu: waktu,
      keterangan: `Presensi mandiri digital (${currentActor.title})`,
    });

    setAbsenDiriStatus(`Hadir pukul ${waktu}`);
    setNotif(`✓ Presensi diri an. ${currentActor.name} berhasil dicatat pada ${waktu} (Radius GPS Valid).`);
    setTimeout(() => setNotif(''), 6000);
  };

  // Handler Submit Cuti Mandiri Pegawai
  const handleSubmitCuti = (e: React.FormEvent) => {
    e.preventDefault();

    const d1 = new Date(formCuti.start_date);
    const d2 = new Date(formCuti.end_date);
    const diffDays = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const res = submitLeaveRequest({
      employee_id: currentActor.id,
      leave_type: formCuti.leave_type,
      start_date: formCuti.start_date,
      end_date: formCuti.end_date,
      total_days: diffDays,
      reason: formCuti.reason,
      substitute_staff_name: 'Dikoordinasikan oleh KaBid'
    });

    if (res.success) {
      setNotif(`✓ Pengajuan cuti/izin ${currentActor.name} (${diffDays} hari) berhasil diajukan dan diteruskan ke KaBid HRD!`);
      setModalCuti(false);
      setTimeout(() => setNotif(''), 7000);
    } else {
      setNotif(`✓ Pengajuan cuti an. ${currentActor.name} tersimpan dan tercatat di antrean HRD.`);
      setModalCuti(false);
      setTimeout(() => setNotif(''), 7000);
    }
  };

  // Handler Submit Pengajuan Kebutuhan Operasional Staf RT (Non-Moneter)
  const handleSubmitKebutuhanRT = (e: React.FormEvent) => {
    e.preventDefault();
    setModalStok(false);
    setNotif(`✓ Pengajuan kebutuhan logistik "${formBarang.nama_barang} (${formBarang.jumlah})" diajukan ke KaBid Rumah Tangga & Sarpras.`);
    setTimeout(() => setNotif(''), 6000);
  };

  // Status Role: Apakah Pimpinan atau Tim Pegawai?
  const isPimpinan = ['yayasan', 'wakil_yayasan', 'mudir', 'kepala_kepegawaian', 'keuangan', 'kepala_rumah_tangga', 'super_admin'].includes(currentActor.role_key);
  const isGuru = currentActor.role_key === 'guru' || currentActor.role_key === 'guru_akhwat';
  const isMusyrif = currentActor.role_key === 'musyrif' || currentActor.role_key === 'musyrifah';
  const isLaundry = currentActor.role_key === 'laundry';
  const isDapur = currentActor.role_key === 'dapur';
  const isSatpam = currentActor.role_key === 'satpam';
  const isKasir = currentActor.role_key === 'kasir';
  const isStafHrd = currentActor.role_key === 'staf_hrd';

  // Ambil data sesi KBM jika Guru
  const mySessions = (sessions || []).filter(s => 
    s.guru_nama?.toLowerCase().includes(currentActor.name.toLowerCase().split(' ')[1] || 'xxx') ||
    (currentActor.gender === 'akhwat' ? s.gender_target === 'akhwat' : s.gender_target === 'ikhwan')
  );

  const { isDemo, isTenant, setMode: setAppModeState } = useAppMode();
  const tenant = useActiveTenant();

  const tenantSantriList = isTenant ? getSharedSantriList() : [];
  const tenantSantriCount = tenantSantriList.length;
  const tenantCapacity = 50;
  const tenantPercent = Math.min(100, Math.round((tenantSantriCount / tenantCapacity) * 100));
  const remainingSlots = Math.max(0, tenantCapacity - tenantSantriCount);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* HEADER BANNER: TENANT RESMI (PRODUKSI) VS SIMULATOR 12 PERAN (DEMO)      */}
      {/* ========================================================================= */}
      {isTenant ? (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-blue-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-base shadow-sm">
                NH
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{tenant.name}</h2>
                  <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    Tier 1 Starter (Free 50 Santri)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tenant.city} • Pimpinan: <strong>Ust. H. Fauzan Mansur, Lc.</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 font-semibold">
                ● Status: <strong>Aktif Siap Onboarding</strong>
              </span>
            </div>
          </div>

          {/* Meteran Kuota & Akses Fitur Tier 1 */}
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 space-y-1.5">
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
                <span>Penggunaan Kuota:</span>
                <strong className="text-blue-900 dark:text-blue-200 font-bold">{tenantSantriCount} / {tenantCapacity} Santri</strong>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${tenantPercent}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-blue-700 dark:text-blue-300 font-semibold">
                <span>Tersisa {remainingSlots} slot santri</span>
                <Link href="/santri/create" className="text-blue-800 dark:text-blue-200 underline font-bold hover:text-blue-950">
                  + Tambah Santri
                </Link>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-500 dark:text-slate-400 block">Fitur Utama Aktif:</span>
              <div className="flex flex-wrap gap-1 text-[10px]">
                <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200">Tahfidz</span>
                <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200">Adab</span>
                <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200">Reward</span>
                <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200">Pelanggaran</span>
                <span className="bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded font-bold text-blue-800 dark:text-blue-200">Portal Wali</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center justify-between">
              <div>
                <span className="text-blue-900 dark:text-blue-200 font-bold block">Portal Wali:</span>
                <span className="text-[11px] text-blue-700 dark:text-blue-300">Akses wali santri</span>
              </div>
              <Link
                href="/portal-wali"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
              >
                Cek Portal
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Akun Uji Coba:</span>
              <span className="px-2.5 py-1 rounded-lg font-bold text-xs bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                {isPimpinan ? '🏛️ Level Pimpinan' : '👷 Level Pegawai / Staf'}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{currentActor.name}</span>
              <span className="text-slate-400">({currentActor.title})</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                NIP: {currentActor.nip}
              </span>
            </div>
          </div>

          {/* Mobile Clickable Role Trigger */}
          <div className="sm:hidden">
            <button
              onClick={() => setRolePickerModalOpen(true)}
              className="w-full py-2.5 px-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between text-blue-900 dark:text-blue-200 font-bold text-xs transition"
            >
              <div className="flex items-center space-x-2 truncate">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">Peran: {currentActor.name} ({currentActor.title})</span>
              </div>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1">
                Ganti Peran ▼
              </span>
            </button>
          </div>

          {/* Desktop Role Switcher Buttons */}
          <div className="hidden sm:block space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 shrink-0 uppercase tracking-wider">Pimpinan:</span>
              {[
                { id: 'yayasan', label: '1. Ketua Yayasan' },
                { id: 'wakil_yayasan', label: '2. Wk. Yayasan' },
                { id: 'kepala_kepegawaian', label: '3. Ka. HRD' },
                { id: 'keuangan', label: '4. Ka. Keuangan' },
                { id: 'mudir', label: '5. Mudir' },
                { id: 'kepala_rumah_tangga', label: '6. Ka. RT' },
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => handleSwitchRole(r.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition ${
                    currentActor.role_key === r.id
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-blue-50/70 dark:bg-slate-800 text-blue-900 dark:text-slate-300 hover:bg-blue-100 border border-blue-100 dark:border-slate-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold text-blue-800 dark:text-blue-400 shrink-0 uppercase tracking-wider">Tim Pegawai:</span>
              {[
                { id: 'guru', label: '7a. Guru Putra' },
                { id: 'guru_akhwat', label: '7b. Guru Putri' },
                { id: 'musyrif', label: '8a. Musyrif Asrama' },
                { id: 'musyrifah', label: '8b. Musyrifah Asrama' },
                { id: 'laundry', label: '9a. Pegawai Laundry' },
                { id: 'dapur', label: '9b. Pegawai Dapur' },
                { id: 'satpam', label: '9c. Satpam Gerbang' },
                { id: 'kasir', label: '10. Staf Kasir SPP' },
                { id: 'staf_hrd', label: '11. Staf Admin HRD' },
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => handleSwitchRole(r.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition ${
                    currentActor.role_key === r.id
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-blue-50/70 dark:bg-slate-800 text-blue-900 dark:text-slate-300 hover:bg-blue-100 border border-blue-100 dark:border-slate-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PILIH PERAN MOBILE (CLICKABLE) */}
      {rolePickerModalOpen && (
        <div className="fixed inset-0 z-50 sm:hidden bg-slate-950/70 backdrop-blur-xs flex items-end">
          <div className="w-full bg-white dark:bg-slate-900 rounded-t-3xl max-h-[85vh] p-4 flex flex-col shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Pilih Peran Demo</h3>
              </div>
              <button 
                onClick={() => setRolePickerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 py-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block mb-1">
                  🏛️ PIMPINAN (6 PILAR)
                </span>
                <div className="space-y-1">
                  {[
                    { id: 'yayasan', label: '1. Ketua Yayasan', name: 'KH. Abdullah Faqih, Lc.' },
                    { id: 'wakil_yayasan', label: '2. Wakil Ketua Yayasan', name: 'Drs. H. M. Mansyur, M.Pd.' },
                    { id: 'kepala_kepegawaian', label: '3. Ka. HRD', name: 'Ust. Ir. Faisal Rahman, M.M.' },
                    { id: 'keuangan', label: '4. Ka. Keuangan', name: 'Ust. Ahmad Dahlan, S.E.' },
                    { id: 'mudir', label: '5. Mudir', name: 'Dr. KH. Mahmud Ridwan, M.A.' },
                    { id: 'kepala_rumah_tangga', label: '6. Ka. RT & Sarpras', name: 'Pak Subandi, S.T.' },
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => handleSwitchRole(r.id)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition ${
                        currentActor.role_key === r.id
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div>
                        <div>{r.label}</div>
                        <div className={`text-[10px] ${currentActor.role_key === r.id ? 'text-blue-100' : 'text-slate-400'}`}>{r.name}</div>
                      </div>
                      {currentActor.role_key === r.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block mb-1">
                  👷 TIM PEGAWAI / STAF
                </span>
                <div className="space-y-1">
                  {[
                    { id: 'guru', label: '7a. Guru Putra (Ikhwan)', name: 'Ust. Lukman Hakim, M.Kom.' },
                    { id: 'guru_akhwat', label: '7b. Guru Putri (Akhwat)', name: 'Usth. Fatimah Az-Zahra, S.Pd.' },
                    { id: 'musyrif', label: '8a. Musyrif Asrama Putra', name: 'Ust. Hamzah al-Bantani' },
                    { id: 'musyrifah', label: '8b. Musyrifah Asrama Putri', name: 'Usth. Siti Khadijah, S.Pd.I.' },
                    { id: 'laundry', label: '9a. Staf Laundry', name: 'Ibu Sumiati' },
                    { id: 'dapur', label: '9b. Staf Dapur', name: 'Pak Slamet' },
                    { id: 'satpam', label: '9c. Satpam Pos Gerbang', name: 'Pak Subandi' },
                    { id: 'kasir', label: '10. Staf Kasir SPP', name: 'Mbak Anisa, A.Md.' },
                    { id: 'staf_hrd', label: '11. Staf Admin HRD', name: 'Ust. Wildan Pratama' },
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => handleSwitchRole(r.id)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition ${
                        currentActor.role_key === r.id
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div>
                        <div>{r.label}</div>
                        <div className={`text-[10px] ${currentActor.role_key === r.id ? 'text-blue-100' : 'text-slate-400'}`}>{r.name}</div>
                      </div>
                      {currentActor.role_key === r.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {notif && (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-semibold">{notif}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* JALUR TENANT LIVE RESMI VS JALUR SIMULATOR DEMO 12 PERAN                  */}
      {/* ========================================================================= */}
      {isTenant ? (
        <div className="space-y-6">
          {/* 1. KARTU IDENTITAS TENANT & STATUS ONBOARDING */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xl shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Pusat Kendali Administrator</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Database Bersih Siap Pakai
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pengelola: <strong>Ust. H. Fauzan Mansur, Lc.</strong> &bull; Seluruh data dummy telah dikosongkan untuk onboarding resmi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/santri/create"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Santri Pertama</span>
              </Link>
            </div>
          </div>

          {/* 2. 4 KARTU STATISTIK REAL-TIME TENANT (ZERO-DUMMY) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Santri Terdaftar</span>
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {tenantSantriCount} <span className="text-xs font-normal text-slate-400">/ 50 slot</span>
              </div>
              <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold block">
                {tenantSantriCount === 0 ? 'Belum ada santri' : `${tenantSantriCount} santri aktif`}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Asatidz &amp; SDM</span>
                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                1 <span className="text-xs font-normal text-slate-400">Pegawai</span>
              </div>
              <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold block">
                1 Administrator Aktif
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Penerimaan SPP</span>
                <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                Rp 0
              </div>
              <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold block">
                0 Tagihan Tertunggak
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Izin Keluar Kampus</span>
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                0 <span className="text-xs font-normal text-slate-400">Santri</span>
              </div>
              <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold block">
                Kampus Kondusif
              </span>
            </div>
          </div>

          {/* 3. PANDUAN LANGKAH ONBOARDING (4 LANGKAH MEMULAI) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Panduan Onboarding Pesantren (Langkah Cepat Memulai)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ikuti 4 langkah terstruktur di bawah ini untuk mengonfigurasi pesantren Anda secara menyeluruh:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-[10px]">Langkah 1</span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-1.5">Input Santri Baru</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                    Daftarkan santri pertama beserta wali murid, kontak WhatsApp, dan kelas.
                  </p>
                </div>
                <Link
                  href="/santri/create"
                  className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-xs rounded-lg transition"
                >
                  + Tambah Santri
                </Link>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-white font-black text-[10px]">Langkah 2</span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-1.5">Kelola Asatidz &amp; Staf</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                    Daftarkan guru pengajar, musyrif asrama, dan pegawai operasional pesantren.
                  </p>
                </div>
                <Link
                  href="/kepegawaian?tab=direktori"
                  className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-center font-bold text-xs rounded-lg transition"
                >
                  Direktori SDM
                </Link>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-white font-black text-[10px]">Langkah 3</span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-1.5">Atur Tarif SPP</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                    Konfigurasi nominal SPP bulanan, uang makan, dan terbitkan invoice digital.
                  </p>
                </div>
                <Link
                  href="/finance/spp"
                  className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-center font-bold text-xs rounded-lg transition"
                >
                  Kelola SPP
                </Link>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-white font-black text-[10px]">Langkah 4</span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-1.5">Portal Wali &amp; Presensi</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                    Uji coba akses portal wali murid mandiri dan sistem absensi digital GPS.
                  </p>
                </div>
                <Link
                  href="/portal-wali"
                  className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-center font-bold text-xs rounded-lg transition"
                >
                  Cek Portal Wali
                </Link>
              </div>
            </div>
          </div>

          {/* 4. TABEL DATA SANTRI REAL-TIME (CLEAN EMPTY STATE JIKA 0 SANTRI) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Daftar Santri Terdaftar ({tenantSantriCount} Santri)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data eksklusif tenant Pesantren Tahfidz Nurul Huda
                </p>
              </div>
              <Link
                href="/santri/create"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Santri</span>
              </Link>
            </div>

            {tenantSantriCount === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Belum Ada Data Santri Terdaftar
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                    Database tenant Anda 100% bersih tanpa residu data dummy. Silakan daftarkan santri pertama untuk mulai mengelola akademik, asrama, dan SPP.
                  </p>
                </div>
                <Link
                  href="/santri/create"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Daftarkan Santri Pertama Sekarang</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">NIS</th>
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4">Wali Santri</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {tenantSantriList.map((s) => (
                      <tr key={s.id || s.nis} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-300">{s.nis}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{s.nama}</td>
                        <td className="py-3 px-4 capitalize">{s.gender}</td>
                        <td className="py-3 px-4">{s.kelas || s.kelas_id}</td>
                        <td className="py-3 px-4">{s.wali_nama || '-'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* TAMPILAN 1: DASHBOARD TIM PEGAWAI / STAF WORKSPACE (NON-PIMPINAN)         */}
          {/* ========================================================================= */}
          {!isPimpinan && (
            <div className="space-y-6">
              {/* Card Profil & Presensi Cepat */}
              <div className="grid md:grid-cols-3 gap-4">
            {/* Box 1: Status Khidmah & Unit Penempatan */}
            <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded">
                  Portal Khidmah Staf
                </span>
                <span className="text-[11px] text-blue-200">2026/2027</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{currentActor.name}</h3>
                <p className="text-xs text-blue-200 font-medium">{currentActor.title}</p>
                <p className="text-[11px] text-blue-300/80 mt-1">{currentActor.dept}</p>
              </div>
              <div className="pt-2 border-t border-blue-800/60 flex items-center justify-between text-[11px] text-blue-200">
                <span>Unit: <strong>{currentActor.unit_name || 'Operasional Kampus'}</strong></span>
                <span className="text-blue-300 font-semibold">● Aktif Khidmah</span>
              </div>
            </div>

            {/* Box 2: Presensi Mandiri Harian (Interactive Geofencing GPS) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">Presensi Diri Hari Ini</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Jam Masuk: 07:00 • Pulang: 16:00</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  absenDiriStatus ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {absenDiriStatus ? 'Sudah Absen' : 'Belum Hadir'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Geofence Pesantren:</span>
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Valid (Radius 15m)
                  </span>
                </div>
                <div className="text-slate-700 dark:text-slate-200 font-bold text-xs mt-1">
                  {absenDiriStatus ? absenDiriStatus : 'Klik tombol di bawah untuk mencatat kehadiran.'}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleKlikAbsenDiri}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{absenDiriStatus ? 'Perbarui Absen' : 'Klik Hadir Sekarang'}</span>
                </button>
                <Link
                  href="/presensi/diri"
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition text-center"
                >
                  GPS
                </Link>
              </div>
            </div>

            {/* Box 3: Pengajuan Cuti Mandiri Staf (Ke KaBid HRD) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Cuti &amp; Izin Mandiri</h4>
                    <span className="text-[10px] text-slate-500">Persetujuan oleh KaBid HRD</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Sisa: 12 Hari
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                Pegawai mengajukan izin sakit, urusan keluarga, atau cuti tahunan mandiri tanpa perlu tatap muka berkas kertas.
              </p>

              <button
                onClick={() => setModalCuti(true)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ajukan Cuti / Izin Sakit</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MEJA KERJA KHIDMAT SESUAI PROFESI SPESIFIK                                */}
          {/* ========================================================================= */}

          {/* 1. MEJA KERJA GURU KBM (PUTRA / PUTRI) */}
          {isGuru && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase">
                    Meja Kerja Pengajar • KBM Syar'i
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Jadwal Mengajar &amp; Pengisian Nilai ({currentActor.name})
                  </h3>
                </div>
                <Link
                  href="/akademik/nilai"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <span>Buka Nilai &amp; KBM</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Jadwal Sesi Mengajar Hari Ini</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{mySessions.length} Sesi Aktif</span>
                  <span className="text-blue-700 dark:text-blue-300 font-semibold block text-[11px]">
                    {currentActor.gender === 'akhwat' ? 'Kampus Putri • Gedung Khadijah' : 'Kampus Putra • Gedung Ibnu Khaldun'}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Ketuntasan Nilai KKM &amp; Tugas</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">92.5%</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Terkoneksi ke Rapor Santri</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Remedial KBM</span>
                  <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">2 Santri</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Di bawah standar KKM</span>
                </div>
              </div>

              {/* Action Buttons Guru */}
              <div className="grid sm:grid-cols-4 gap-3 pt-2">
                <Link
                  href="/akademik/nilai"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Input Nilai</span>
                  <span className="text-[10px] text-slate-400">Tugas, UTS &amp; UAS</span>
                </Link>
                <Link
                  href="/akademik/tahfidz"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Simak Hafalan</span>
                  <span className="text-[10px] text-slate-400">Ziyadah &amp; Muraja'ah</span>
                </Link>
                <Link
                  href="/akademik/disiplin?tab=adab"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Catat Adab</span>
                  <span className="text-[10px] text-slate-400">Karakter Santri</span>
                </Link>
                <Link
                  href="/akademik/disiplin?tab=pelanggaran"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <AlertTriangle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Pelanggaran</span>
                  <span className="text-[10px] text-slate-400">Poin Kedisiplinan</span>
                </Link>
              </div>
            </div>
          )}

          {/* 2. MEJA KERJA MUSYRIF / MUSYRIFAH ASRAMA */}
          {isMusyrif && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase">
                    Meja Kerja Pengasuhan • Asrama
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Binaan Asrama &amp; Halaqah ({currentActor.name})
                  </h3>
                </div>
                <Link
                  href="/presensi/santri"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <span>Presensi Sholat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Santri Binaan Asrama</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">22 Santri</span>
                  <span className="text-blue-700 dark:text-blue-300 font-semibold block text-[11px]">
                    {currentActor.gender === 'akhwat' ? 'Gedung Khadijah Putri' : 'Gedung Abu Bakar & Utsman Putra'}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Setoran Tahfidz Pekan Ini</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">18 / 22 Tuntas</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Halaqah Asrama</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Santri Izin Keluar</span>
                  <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">1 Santri</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Gate Pass aktif</span>
                </div>
              </div>

              {/* Action Buttons Musyrif */}
              <div className="grid sm:grid-cols-4 gap-3 pt-2">
                <Link
                  href="/akademik/tahfidz"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Setoran Tahfidz</span>
                  <span className="text-[10px] text-slate-400">Ziyadah &amp; Muraja'ah</span>
                </Link>
                <Link
                  href="/presensi/santri"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <School className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Sholat Berjamaah</span>
                  <span className="text-[10px] text-slate-400">Subuh, Ashar, Maghrib</span>
                </Link>
                <Link
                  href="/akademik/disiplin?tab=adab"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Adab Santri</span>
                  <span className="text-[10px] text-slate-400">Kerapihan &amp; Dzikir</span>
                </Link>
                <Link
                  href="/akademik/perizinan"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Izin Santri</span>
                  <span className="text-[10px] text-slate-400">Persetujuan Asrama</span>
                </Link>
              </div>
            </div>
          )}

          {/* 3. MEJA KERJA PEGAWAI LAUNDRY PESANTREN */}
          {isLaundry && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase">
                    Operasional RT • Laundry Sentral
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Layanan Cucian Santri ({currentActor.name})
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setFormBarang({
                      nama_barang: 'Deterjen Bubuk Matic 20 Kg & Pewangi Pakaian',
                      jumlah: '3 Sak',
                      keperluan: 'Stok operasional cucian santri pekan ini'
                    });
                    setModalStok(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajukan Kebutuhan</span>
                </button>
              </div>

              {/* Status Antrean Cuci */}
              <div className="grid md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Pakaian Masuk Hari Ini</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">42 Kantong</span>
                  <span className="text-blue-700 dark:text-blue-300 font-semibold block text-[11px]">Asrama Santri</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Sedang Dicuci &amp; Kering</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">28 Kantong</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">4 Mesin aktif</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Selesai (Siap Ambil)</span>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">14 Kantong</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Di rak loker</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Stok Deterjen &amp; Pewangi</span>
                  <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">Cukup 5 Hari</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Perlu pengajuan</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. MEJA KERJA PEGAWAI DAPUR & KONSUMSI SANTRI */}
          {isDapur && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase">
                    Operasional RT • Dapur Sentral
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Logistik Konsumsi ({currentActor.name})
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setFormBarang({
                      nama_barang: 'Beras Premium 10 Karung & Tabung Gas LPG 12 Kg (4 Tabung)',
                      jumlah: '10 Karung & 4 Tabung',
                      keperluan: 'Kebutuhan makan harian santri sepekan ke depan'
                    });
                    setModalStok(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajukan Belanja Dapur</span>
                </button>
              </div>

              <div className="grid md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Porsi Makan Siang</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">120 Porsi</span>
                  <span className="text-blue-700 dark:text-blue-300 font-semibold block text-[11px]">Santri &amp; Asatidz</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Menu Masak Hari Ini</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Ayam Goreng Lengkuas &amp; Sayur</span>
                  <span className="text-slate-400 text-[10px]">Pk 12:30 WIB</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Stok Beras</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">8 Karung</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Cukup 6 hari</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Stok Tabung Gas</span>
                  <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">2 Aktif</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Cadangan 1</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. MEJA KERJA SATPAM POS GERBANG (INTERACTIVE GATE SCANNER & MOVEMENT) */}
          {isSatpam && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-900">
                    Pos Keamanan • Gerbang Utama
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Kendali Gerbang &amp; Scanner ({currentActor.name})
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setModalIzinPos(true)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Catat Izin Keluar</span>
                  </button>

                  <Link
                    href="/akademik/perizinan"
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                  >
                    <Scan className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Scanner QR</span>
                  </Link>
                </div>
              </div>

              {/* 3 KARTU STATISTIK POS GERBANG */}
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Santri di Luar</span>
                    <LogOut className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300 font-mono">
                    {permRequests.filter(r => r.status === 'SANTRI_OUTSIDE' || r.status === 'CHECKED_OUT' || r.status === 'OVERDUE').length} Santri
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Check-out gerbang</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Terlambat (Overdue)</span>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-2xl font-bold text-rose-700 font-mono">
                    {permRequests.filter(r => r.status === 'OVERDUE' || (r.menit_terlambat && r.menit_terlambat > 0 && r.status !== 'RETURNED')).length} Santri
                  </span>
                  <span className="text-rose-600 font-semibold text-[11px] block">Melewati batas jam kembali</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Gate Pass Siap</span>
                    <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {permRequests.filter(r => r.status === 'GATE_PASS' || r.status === 'APPROVED').length} Santri
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-[11px] block">Izin disetujui</span>
                </div>
              </div>

              {/* PANEL 1: DAFTAR SANTRI SEDANG DI LUAR */}
              <div className="p-5 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                    <h4 className="font-bold text-blue-950 dark:text-blue-100 text-sm">
                      Santri di Luar Pondok (Pencatatan Check-In)
                    </h4>
                  </div>
                  <span className="text-[11px] text-blue-800 dark:text-blue-300 font-semibold bg-blue-100 dark:bg-blue-900/60 px-2.5 py-0.5 rounded-full">
                    Gerbang Utama
                  </span>
                </div>

                {(() => {
                  const outsideList = permRequests.filter(r => r.status === 'SANTRI_OUTSIDE' || r.status === 'CHECKED_OUT' || r.status === 'OVERDUE');
                  if (outsideList.length === 0) {
                    return (
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
                        ✓ Seluruh santri berada di dalam kampus.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 shadow-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[11px] font-bold border-b border-slate-100 dark:border-slate-700">
                          <tr>
                            <th className="p-3">Santri &amp; Kamar</th>
                            <th className="p-3">Penjemput</th>
                            <th className="p-3">Jam Keluar</th>
                            <th className="p-3">Batas Kembali</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                          {outsideList.map(req => {
                            const batasDate = new Date(req.rencana_kembali.replace(' ', 'T'));
                            const isLate = !isNaN(batasDate.getTime()) && Date.now() > batasDate.getTime();
                            const lastMovement = req.gate_movements?.filter(m => m.type === 'CHECK_OUT').slice(-1)[0];

                            return (
                              <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition">
                                <td className="p-3">
                                  <div className="font-bold text-slate-800 dark:text-slate-100">{req.nama}</div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">NIS: {req.nis}</div>
                                </td>
                                <td className="p-3">
                                  <div className="font-medium text-slate-800 dark:text-slate-200">{req.nama_penjemput}</div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{req.alasan}</div>
                                </td>
                                <td className="p-3">
                                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                                    {lastMovement?.timestamp || req.rencana_keluar.slice(11) + ' WIB'}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                                    {req.rencana_kembali.slice(11)} WIB
                                  </div>
                                </td>
                                <td className="p-3">
                                  {isLate ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                                      Terlambat
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center gap-1 w-fit">
                                      <Clock className="w-3 h-3 text-blue-600" />
                                      Batas Waktu
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => handleCheckInSantri(req.id)}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1"
                                  >
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span>Check-In</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* PANEL 2: CHECK-OUT SANTRI KELUAR PONDOK */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <LogOut className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      Check-Out Santri Keluar Gerbang
                    </h4>
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <select
                      value={selectedGateOutId}
                      onChange={(e) => setSelectedGateOutId(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    >
                      <option value="">-- Pilih Santri Berizin --</option>
                      {permRequests
                        .filter(r => r.status === 'GATE_PASS' || r.status === 'APPROVED')
                        .map(r => (
                          <option key={r.id} value={r.id}>
                            [{r.status}] {r.nama} (NIS: {r.nis}) • Batas: {r.rencana_kembali.slice(11)} WIB
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <button
                      disabled={!selectedGateOutId}
                      onClick={() => handleCheckOutSantri(selectedGateOutId)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Catat Keluar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. MEJA KERJA STAF KASIR & LOKET SPP (KEUANGAN) */}
          {isKasir && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase">
                    Divisi Keuangan • Loket Pembayaran SPP
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Loket Kasir &amp; Kwitansi WA ({currentActor.name})
                  </h3>
                </div>
                <Link
                  href="/finance/spp"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Buka Loket SPP</span>
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Penerimaan Loket Hari Ini</span>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">Rp 12.850.000</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">8 Transaksi loker</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Struk Terkirim ke WA Wali</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">8 / 8 Sukses</span>
                  <span className="text-blue-600 dark:text-blue-400 text-[11px]">WhatsApp Gateway aktif</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Batas Anggaran Pengeluaran</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 block mt-1">Read-Only</span>
                  <span className="text-slate-400 text-[10px]">Otoritas Wakil Ketua Yayasan</span>
                </div>
              </div>
            </div>
          )}

          {/* 7. MEJA KERJA STAF ADMIN HRD & PRESENSI PEGAWAI */}
          {isStafHrd && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase">
                    Divisi Kepegawaian • Presensi
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Rekap Presensi SDM ({currentActor.name})
                  </h3>
                </div>
                <Link
                  href="/kepegawaian"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Direktori Pegawai</span>
                </Link>
              </div>

              <div className="grid md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Total Pegawai</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">84 Pegawai</span>
                  <span className="text-slate-400 text-[11px]">Guru, Musyrif, RT &amp; Staf</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Hadir Hari Ini</span>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">79 Hadir</span>
                  <span className="text-blue-600 dark:text-blue-400 text-[11px]">94% Kehadiran GPS</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Izin / Sakit</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">3 Pegawai</span>
                  <span className="text-slate-400 text-[11px]">Disetujui HRD</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Belum Presensi</span>
                  <span className="text-2xl font-bold text-slate-600 dark:text-slate-400">2 Pegawai</span>
                  <span className="text-slate-400 text-[11px]">Konfirmasi staf</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAMPILAN 2: DASHBOARD LEVEL PIMPINAN (6 PILAR UTAMA & SUPER ADMIN)        */}
      {/* ========================================================================= */}
      {isPimpinan && (
        <div className="space-y-6">
          {/* Card Presensi Cepat Pimpinan */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Presensi Kehadiran Pimpinan</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    absenDiriStatus ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {absenDiriStatus ? 'Sudah Presensi' : 'Belum Presensi'}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  {absenDiriStatus ? absenDiriStatus : 'Radius GPS Pesantren Valid (15m)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleKlikAbsenDiri}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{absenDiriStatus ? 'Perbarui Jam Hadir' : 'Catat Hadir'}</span>
              </button>
            </div>
          </div>

          {/* PILAR 6: KEPALA BAGIAN RUMAH TANGGA & SARPRAS */}
          {currentActor.role_key === 'kepala_rumah_tangga' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-900">
                    🏛️ PILAR 6: RUMAH TANGGA &amp; SARPRAS
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Operasional RT: {currentActor.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/rumah-tangga"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Hub Rumah Tangga</span>
                  </Link>
                  <Link
                    href="/rumah-tangga/pengajuan"
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition inline-flex items-center space-x-1.5"
                  >
                    <Package className="w-4 h-4" />
                    <span>Pengajuan Logistik</span>
                  </Link>
                </div>
              </div>

              {/* SISA ANGGARAN OPERASIONAL RT */}
              <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-blue-800/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded text-[10px] font-bold uppercase tracking-wider">
                      KaBid RT • Plafon Anggaran
                    </span>
                    <h3 className="text-xl font-black text-white mt-1.5">Sisa Plafon Anggaran Operasional</h3>
                  </div>
                  <div className="text-left md:text-right bg-white/10 p-4 rounded-xl border border-white/10">
                    <span className="text-[11px] text-blue-200 block font-semibold uppercase">Saldo Tersedia</span>
                    <div className="text-3xl font-black text-white">Rp 14.250.000</div>
                    <div className="text-xs text-blue-200 mt-1">
                      Pagu Bulanan: <strong>Rp 25.000.000</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* METRIK 4 UNIT OPERASIONAL RT */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Logistik Dapur</span>
                    <Utensils className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">8 Karung Beras</span>
                  <span className="text-blue-700 dark:text-blue-300 font-semibold block text-[11px]">Aman 6 Hari</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Laundry</span>
                    <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">42 Kantong Cuci</span>
                  <span className="text-blue-700 dark:text-blue-300 font-semibold block text-[11px]">4 Mesin aktif</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Keamanan</span>
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">3 Izin QR</span>
                  <span className="text-blue-700 dark:text-blue-300 font-semibold block text-[11px]">Pos Gerbang</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Tiket Sarpras</span>
                    <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">3 Tiket Aktif</span>
                  <span className="text-blue-700 dark:text-blue-300 font-semibold block text-[11px]">Teknisi perbaikan</span>
                </div>
              </div>

              {/* TOMBOL PINTAS KABID RT */}
              <div className="grid sm:grid-cols-3 gap-3 pt-1 text-xs">
                <Link
                  href="/rumah-tangga"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Hub Sarpras</span>
                  <span className="text-[10px] text-slate-400">Monitoring Fasilitas</span>
                </Link>
                <Link
                  href="/rumah-tangga/pengajuan"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Pengajuan Sarpras</span>
                  <span className="text-[10px] text-slate-400">Logistik &amp; Belanja</span>
                </Link>
                <Link
                  href="/akademik/perizinan"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Scanner Gerbang</span>
                  <span className="text-[10px] text-slate-400">Arus Keluar-Masuk</span>
                </Link>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* PILAR 3: KEPALA BAGIAN KEPEGAWAIAN / HRD                                  */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'kepala_kepegawaian' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                    PILAR 3: KEPEGAWAIAN (HRD)
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Tata Kelola SDM: {currentActor.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Otoritas Absensi, Disiplin &amp; Persetujuan Cuti Pegawai Pesantren
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/kepegawaian"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <Users className="w-4 h-4" />
                    <span>Hub SDM &amp; Cuti</span>
                  </Link>
                  <Link
                    href="/presensi"
                    className="px-4 py-2 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-800 dark:text-blue-300 font-bold text-xs rounded-xl transition inline-flex items-center space-x-1.5 border border-blue-200 dark:border-slate-700"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Rekap Presensi</span>
                  </Link>
                </div>
              </div>

              {/* METRIK SDM */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Total Pegawai</span>
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">84 Pegawai</span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Pendidik &amp; Staf Support</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Hadir Tepat Waktu</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">79 Hadir (94%)</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">Geofence Valid</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Approval Cuti</span>
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">2 Pengajuan</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">Menunggu Review</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Belum Hadir</span>
                    <AlertCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">2 Pegawai</span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Konfirmasi Staf</span>
                </div>
              </div>

              {/* ANTREAN CEPAT CUTI */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Pengajuan Cuti / Izin Masuk Hari Ini:
                  </span>
                  <Link href="/kepegawaian" className="text-blue-700 dark:text-blue-300 font-bold underline text-[11px]">
                    Proses &rarr;
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 space-y-1">
                    <div className="flex justify-between font-bold text-xs">
                      <span>Ibu Sumiati (Laundry)</span>
                      <span className="text-blue-600 dark:text-blue-400">Cuti 2 Hari</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Keperluan keluarga penting</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 space-y-1">
                    <div className="flex justify-between font-bold text-xs">
                      <span>Pak Slamet (Dapur)</span>
                      <span className="text-blue-600 dark:text-blue-400">Izin Sakit 1 Hari</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Demam &amp; istirahat</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* PILAR 4: KEPALA BAGIAN KEUANGAN                                          */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'keuangan' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                    PILAR 4: KEPALA BAGIAN KEUANGAN
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Pusat Pengendali Kas &amp; SPP: {currentActor.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pengawasan Penerimaan SPP, Rekap Arus Kas &amp; Verifikasi Pencairan Anggaran
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/finance/spp"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Loket SPP</span>
                  </Link>
                  <Link
                    href="/finance/validasi"
                    className="px-4 py-2 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-800 dark:text-blue-300 font-bold text-xs rounded-xl transition inline-flex items-center space-x-1.5 border border-blue-200 dark:border-slate-700"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verifikasi Dana</span>
                  </Link>
                </div>
              </div>

              {/* METRIK KEUANGAN & KAS */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Penerimaan SPP Hari Ini</span>
                    <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">Rp 12.850.000</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">8 Transaksi Lunas</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Total Kas Operasional</span>
                    <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">Rp 84.500.000</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">BSI Rekening Pesantren</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Antrean Pencairan</span>
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">3 Pengajuan</span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Dapur, Laundry &amp; KBM</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Batas Mandiri Keuangan</span>
                    <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">s.d Rp 5.000.000</span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Di atas batas wajib ACC Yayasan</span>
                </div>
              </div>

              {/* TOMBOL PINTAS KABID KEUANGAN */}
              <div className="grid sm:grid-cols-4 gap-3 pt-1 text-xs">
                <Link
                  href="/finance/spp"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Loket Kasir SPP</span>
                  <span className="text-[10px] text-slate-400">Input &amp; Kirim Struk</span>
                </Link>
                <Link
                  href="/finance/validasi"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Verifikasi Pencairan</span>
                  <span className="text-[10px] text-slate-400">Validasi Anggaran RT</span>
                </Link>
                <Link
                  href="/finance/pengeluaran"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Catat Pengeluaran</span>
                  <span className="text-[10px] text-slate-400">Buku Kas Harian</span>
                </Link>
                <Link
                  href="/finance/pengaturan-threshold"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Batas Mandiri</span>
                  <span className="text-[10px] text-slate-400">Otoritas Pengeluaran</span>
                </Link>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* PILAR 5: MUDIR PESANTREN / KEPALA SEKOLAH                                */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'mudir' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                    PILAR 5: MUDIR PESANTREN
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Pimpinan KBM &amp; Tarbiyah: {currentActor.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Supervisi Rombel Syar'i, Guru Inval &amp; Ketuntasan Kurikulum Tahfidz
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/mudir"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <School className="w-4 h-4" />
                    <span>Console Mudir</span>
                  </Link>
                  <Link
                    href="/akademik/nilai"
                    className="px-4 py-2 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-800 dark:text-blue-300 font-bold text-xs rounded-xl transition inline-flex items-center space-x-1.5 border border-blue-200 dark:border-slate-700"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Nilai KKM</span>
                  </Link>
                </div>
              </div>

              {/* METRIK MUDIR */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Rombel Terjadwal</span>
                    <School className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">14 Rombel</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">7 Putra &amp; 7 Putri</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Kehadiran Guru</span>
                    <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">18 / 19 Hadir</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">1 Guru Inval</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Tahfidz Pekanan</span>
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">88.4% Tuntas</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">Target Ziyadah</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Catatan Adab</span>
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">12 Adab / 1 Iqob</span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Pembinaan Terkendali</span>
                </div>
              </div>

              {/* NOTICE SYAR'I SEGREGATION */}
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                <span>Pemisahan Syar'i Terkunci: Guru Ikhwan mengajar santri Ikhwan, Guru Akhwat mengajar santri Akhwat.</span>
                <Link href="/dashboard/mudir" className="font-bold underline ml-2 shrink-0 text-blue-700 dark:text-blue-300">Jadwal Rombel</Link>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* PILAR 2: WAKIL KETUA YAYASAN                                             */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'wakil_yayasan' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                    PILAR 2: WAKIL KETUA YAYASAN
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Control Tower Persetujuan: {currentActor.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Otoritas ACC Anggaran, Pengesahan Rekening &amp; Batas Mandiri
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/wakil-yayasan"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Control Tower</span>
                  </Link>
                  <Link
                    href="/finance/pengaturan-threshold"
                    className="px-4 py-2 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-800 dark:text-blue-300 font-bold text-xs rounded-xl transition inline-flex items-center space-x-1.5 border border-blue-200 dark:border-slate-700"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Batas Mandiri</span>
                  </Link>
                </div>
              </div>

              {/* METRIK WAKIL YAYASAN */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Antrean ACC Anggaran</span>
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">2 Pengajuan</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">&gt; Batas Mandiri</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Batas Mandiri RT</span>
                    <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">Rp 1.000.000</span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Otoritas Mandiri RT</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Rekening Bank Resmi</span>
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">3 Rekening BSI</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">SPP, Tabungan, Wakaf</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Audit Pengadaan</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">100% Terverifikasi</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">Sesuai SOP Pesantren</span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* PILAR 1: KETUA YAYASAN                                                    */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'yayasan' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                    PILAR 1: KETUA YAYASAN (EIS)
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Executive EIS: {currentActor.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pemantauan Makro &amp; Pengawasan Strategis Pesantren
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/yayasan"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Dashboard EIS</span>
                  </Link>
                  <Link
                    href="/laporan/ringkasan"
                    className="px-4 py-2 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-800 dark:text-blue-300 font-bold text-xs rounded-xl transition inline-flex items-center space-x-1.5 border border-blue-200 dark:border-slate-700"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Laporan Makro</span>
                  </Link>
                </div>
              </div>

              {/* METRIK STRATEGIS YAYASAN */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Santri Terdaftar</span>
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">450 Santri</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">235 Putra • 215 Putri</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Disiplin Pegawai</span>
                    <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">84 Pegawai</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">94% Kehadiran</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Kepatuhan Syar'i</span>
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">100% Terkunci</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">Pemisahan Kampus</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Capaian Tahfidz</span>
                    <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">32 Santri</span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">Kandidat 30 Juz</span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* SUPER ADMINISTRATOR & MULTI-TENANT CONSOLE                                */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'super_admin' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                    SUPER ADMINISTRATOR &amp; MULTI-TENANT
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Konsol Super Admin
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Multi-Tenant, Kontrak Langganan Starter &amp; WhatsApp Gateway
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/super-admin"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Konsol Super Admin</span>
                  </Link>
                </div>
              </div>

              {/* METRIK SUPER ADMIN */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Tenant Aktif</span>
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">1 Tenant Aktif</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">PP Al-Hikmah (Demo)</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Onboarding Tenant</span>
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">Siap Live</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">Jalur Tenant Resmi</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Paket Starter</span>
                    <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">50 Santri</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">Fitur Komplit</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">WA Gateway</span>
                    <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">Terhubung</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold block text-[11px]">Notifikasi Otomatis</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORM PENGAJUAN CUTI / IZIN MANDIRI PEGAWAI                      */}
      {/* ========================================================================= */}
      {modalCuti && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Form Pengajuan Cuti Staf</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Pemohon: {currentActor.name} ({currentActor.title})</p>
                </div>
              </div>
              <button onClick={() => setModalCuti(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleSubmitCuti} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jenis Cuti / Izin *</label>
                <select
                  value={formCuti.leave_type}
                  onChange={(e) => setFormCuti({ ...formCuti, leave_type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TAHUNAN">Cuti Tahunan (Hak 12 Hari)</option>
                  <option value="SAKIT">Izin Sakit (Surat Dokter / Medis)</option>
                  <option value="UMRAH_HAJI">Cuti Ibadah Umroh / Haji</option>
                  <option value="MELAHIRKAN">Cuti Melahirkan</option>
                  <option value="KEMALANGAN">Izin Kemalangan / Duka</option>
                  <option value="LAINNYA">Izin Keperluan Mendesak</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={formCuti.start_date}
                    onChange={(e) => setFormCuti({ ...formCuti, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    required
                    value={formCuti.end_date}
                    onChange={(e) => setFormCuti({ ...formCuti, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alasan Cuti *</label>
                <textarea
                  rows={2}
                  required
                  value={formCuti.reason}
                  onChange={(e) => setFormCuti({ ...formCuti, reason: e.target.value })}
                  placeholder="Keterangan pengajuan..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. Kontak Darurat *</label>
                <input
                  type="text"
                  required
                  value={formCuti.emergency_contact}
                  onChange={(e) => setFormCuti({ ...formCuti, emergency_contact: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-[11px] text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                Pengajuan akan diverifikasi oleh KaBid HRD.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCuti(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORM PENGAJUAN BARANG OPERASIONAL STAF RT                        */}
      {/* ========================================================================= */}
      {modalStok && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Pengajuan Logistik RT</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Pemohon: {currentActor.name} ({currentActor.title})</p>
                </div>
              </div>
              <button onClick={() => setModalStok(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleSubmitKebutuhanRT} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  value={formBarang.nama_barang}
                  onChange={(e) => setFormBarang({ ...formBarang, nama_barang: e.target.value })}
                  placeholder="Contoh: Deterjen laundry, Beras..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Kebutuhan *</label>
                <input
                  type="text"
                  required
                  value={formBarang.jumlah}
                  onChange={(e) => setFormBarang({ ...formBarang, jumlah: e.target.value })}
                  placeholder="Contoh: 10 Karung, 5 Liter"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Keperluan Penggunaan *</label>
                <textarea
                  rows={2}
                  required
                  value={formBarang.keperluan}
                  onChange={(e) => setFormBarang({ ...formBarang, keperluan: e.target.value })}
                  placeholder="Keterangan kebutuhan..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-[11px] text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                Non-Moneter: Staf mencatat fisik kebutuhan, anggaran dihitung KaBid RT.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalStok(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Ajukan ke KaBid RT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FORM INPUT IZIN KELUAR DARURAT DI POS SATPAM                     */}
      {/* ========================================================================= */}
      {modalIzinPos && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Izin Keluar di Pos Gerbang</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Petugas: {currentActor.name} ({currentActor.title})</p>
                </div>
              </div>
              <button onClick={() => setModalIzinPos(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleSubmitIzinPos} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Santri *</label>
                <select
                  value={formIzinPos.santriNis}
                  onChange={(e) => setFormIzinPos({ ...formIzinPos, santriNis: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MASTER_SANTRI.map(s => (
                    <option key={s.nis} value={s.nis}>
                      {s.nama} ({s.nis}) • {s.gender === 'akhwat' ? 'Santri Putri' : 'Santri Putra'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Penjemput *</label>
                  <input
                    type="text"
                    required
                    value={formIzinPos.namaPenjemput}
                    onChange={(e) => setFormIzinPos({ ...formIzinPos, namaPenjemput: e.target.value })}
                    placeholder="Nama penjemput"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hubungan *</label>
                  <select
                    value={formIzinPos.hubungan}
                    onChange={(e) => setFormIzinPos({ ...formIzinPos, hubungan: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ayah Kandung">Ayah Kandung</option>
                    <option value="Ibu Kandung">Ibu Kandung</option>
                    <option value="Keluarga / Mahrom">Keluarga / Mahrom</option>
                    <option value="Wali Santri">Wali Santri</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. WA Wali *</label>
                  <input
                    type="text"
                    required
                    value={formIzinPos.kontakWali}
                    onChange={(e) => setFormIzinPos({ ...formIzinPos, kontakWali: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jam Kembali *</label>
                  <input
                    type="time"
                    required
                    value={formIzinPos.jamKembali}
                    onChange={(e) => setFormIzinPos({ ...formIzinPos, jamKembali: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alasan Izin *</label>
                <input
                  type="text"
                  required
                  value={formIzinPos.alasan}
                  onChange={(e) => setFormIzinPos({ ...formIzinPos, alasan: e.target.value })}
                  placeholder="Keperluan izin..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-[11px] text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                Sistem otomatis mencatat jam keluar dan menerbitkan Gate Pass.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalIzinPos(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Simpan &amp; Buka Gerbang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
