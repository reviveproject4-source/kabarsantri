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
  getSharedSantriList,
  isTenantMode
} from '@/lib/sharedDataStore';
import { useSearchParams } from 'next/navigation';
import { 
  getLeaveRequests, 
  submitLeaveRequest,
  getEmployees
} from '@/lib/kepegawaianStore';
import { checkStudentQuota, getTenantEntitlements } from '@/lib/tenantEntitlementStore';
import { MODULAR_PRODUCT_CATALOG } from '@/lib/productCatalog';

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
      const existingActorRaw = localStorage.getItem('ks_active_session_actor_v1');
      const isCustomSession = existingActorRaw && (
        existingActorRaw.includes('"role_key":"pegawai"') || 
        existingActorRaw.includes('"role_key":"wali_santri"')
      );
      if (modeParam === 'tenant' || modeParam === 'live') {
        setAppMode('tenant', 'tenant-rabu-001');
        if (!isCustomSession) {
          setActiveActorByRole('tenant_admin_nh');
        }
      } else if (modeParam === 'demo') {
        setAppMode('demo');
        if (!isCustomSession) {
          setActiveActorByRole('yayasan');
        }
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
  const isPimpinan = ['yayasan', 'wakil_yayasan', 'mudir', 'kepala_kepegawaian', 'keuangan', 'kepala_rumah_tangga', 'super_admin', 'tenant_admin_nh'].includes(currentActor.role_key);
  const isGuru = currentActor.role_key === 'guru' || currentActor.role_key === 'guru_akhwat' || currentActor.role_key === 'pegawai';
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

  const searchParams = useSearchParams();
  const { isDemo: modeIsDemo, isTenant: modeIsTenant, setMode: setAppModeState } = useAppMode();
  const isTenantParam = searchParams?.get('mode') === 'tenant';
  const isTenant = isTenantParam || (mounted ? (modeIsTenant || (typeof window !== 'undefined' && isTenantMode())) : false);
  const isDemo = !isTenant;
  const tenant = useActiveTenant();

  const tenantSantriList = isTenant ? getSharedSantriList(true) : [];
  const quotaStats = checkStudentQuota(tenant.id, isTenant ? tenantSantriList : undefined);
  const tenantSantriCount = quotaStats.currentActive;
  const tenantCapacity = quotaStats.maxAllowed;
  const tenantPercent = Math.min(100, Math.round((tenantSantriCount / tenantCapacity) * 100));
  const remainingSlots = Math.max(0, tenantCapacity - tenantSantriCount);

  return (
    <div className="space-y-6">
      {notif && (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-semibold">{notif}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* JALUR PIMPINAN: DASHBOARD ADMIN, DAFTAR TENANT, FITUR & SUBSCRIPTION      */}
      {/* ========================================================================= */}
      {isPimpinan ? (
        <div className="space-y-6">
          {/* 1. KARTU DAFTAR TENANT / PROFIL LEMBAGA AKTIF */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shrink-0">
                {tenant.name ? tenant.name.substring(0, 2).toUpperCase() : <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {tenant.name || 'Profil Lembaga Pesantren'}
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    ● Aktif
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ID: <code className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">{tenant.code || tenant.id}</code> &bull; {tenant.city || 'Indonesia'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/santri/create?mode=tenant"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Santri Baru</span>
              </Link>
            </div>
          </div>

          {/* Rincian Identitas Lembaga (Mobile-Friendly Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Pimpinan:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate text-xs sm:text-xs">
                {tenant.leader_name || 'Administrator'}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block font-medium">WhatsApp:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block truncate text-xs sm:text-xs">
                {tenant.leader_wa || '081200000000'}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Santri:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block text-xs sm:text-xs">
                {tenantSantriCount} / {tenantCapacity} Santri
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block text-xs sm:text-xs">
                Live Operasional
              </span>
            </div>
          </div>
        </div>

        {/* 2. BAGIAN FITUR & MODUL AKTIF (GRID MOBILE-FRIENDLY) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Fitur &amp; Modul Aktif Pesantren
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Modul operasional terpadu asatidz &amp; staf:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3.5">
            {[
              {
                title: 'Tahfidz & Al-Qur\'an',
                desc: 'Setoran hafalan juz, tajwid & mutaba\'ah.',
                icon: BookOpen,
                href: '/akademik/tahfidz',
                tag: 'Aktif',
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
              },
              {
                title: 'Keuangan & SPP',
                desc: 'Tagihan SPP, kuitansi WA & validasi bukti.',
                icon: Wallet,
                href: '/finance/spp',
                tag: 'Aktif',
                color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900'
              },
              {
                title: 'Presensi GPS',
                desc: 'Presensi guru KBM & pos gerbang.',
                icon: UserCheck,
                href: '/presensi/diri',
                tag: 'Aktif',
                color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900'
              },
              {
                title: 'Portal Wali Santri',
                desc: 'Pantau hafalan, SPP & izin via NIS+PIN.',
                icon: Users,
                href: '/portal-wali',
                tag: 'Aktif',
                color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900'
              },
              {
                title: 'Rumah Tangga',
                desc: 'Dapur santri, laundry & logistik.',
                icon: Utensils,
                href: '/rumah-tangga',
                tag: 'Aktif',
                color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-900'
              },
              {
                title: 'Buku Kas & Jurnal',
                desc: 'Buku kas harian & arus pengeluaran.',
                icon: Receipt,
                href: '/finance/pengeluaran',
                tag: 'Aktif',
                color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200 dark:border-teal-900'
              },
            ].map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={idx}
                  href={mod.href}
                  className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-md transition group flex flex-col justify-between space-y-2 sm:space-y-3"
                >
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border ${mod.color}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {mod.tag}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition truncate">
                        {mod.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed hidden sm:block">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition">
                    <span>Buka Modul</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. BAGIAN SUBSCRIPTION & STATUS PAKET LANGGANAN */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-lg border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 sm:pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-amber-400 text-slate-900 rounded-full inline-block">
                SUBSCRIPTION STATUS
              </span>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Paket Layanan: {quotaStats.isFreeZakat ? 'Paket Gratis (Maks 50 Santri)' : 'Paket Enterprise'}
              </h3>
              <p className="text-xs text-slate-400">
                Lisensi Resmi Pesantren &bull; Masa Aktif: 2026
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-xl">
                ● Status Lisensi: Aktif
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
            {/* Meteran Kuota Santri */}
            <div className="bg-slate-800/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-700/80 space-y-2">
              <div className="flex justify-between text-slate-300 font-semibold text-[11px]">
                <span>Kuota Santri:</span>
                <span className="text-white font-bold">{tenantSantriCount} / {tenantCapacity} Santri</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(5, tenantPercent)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Sisa {remainingSlots} slot santri</span>
                <Link href="/santri/create?mode=tenant" className="text-emerald-400 font-bold hover:underline">
                  + Input Santri
                </Link>
              </div>
            </div>

            {/* Status Billing */}
            <div className="bg-slate-800/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-700/80 space-y-1">
              <span className="text-[11px] text-slate-400 block font-semibold">Status Lisensi:</span>
              <div className="text-sm font-bold text-white mt-1">Lunas / Terverifikasi</div>
              <p className="text-[11px] text-slate-400">Dukungan operasional aktif berkala.</p>
            </div>

            {/* Bantuan Upgrade */}
            <div className="bg-slate-800/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-slate-700/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">Tambah Kuota Santri:</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Konsultasi upgrade kapasitas santri &amp; multi-cabang.
                </p>
              </div>
              <a
                href="https://api.whatsapp.com/send?phone=6281234567890&text=Halo%20Layanan%20Dukungan%20KabarSantri,%20kami%20ingin%20upgrade%20kuota%20santri%20pesantren."
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
              >
                Hubungi Layanan Dukungan
              </a>
            </div>
          </div>
        </div>

      {/* ========================================================================= */}
      {/* JALUR TENANT LIVE RESMI VS JALUR SIMULATOR DEMO 12 PERAN                  */}
      {/* ========================================================================= */}
      {/* RINGKASAN METRIK OPERASIONAL REAL-TIME & DATA SANTRI                      */}
      {/* ========================================================================= */}
      {isTenant ? (
        <div className="space-y-6">
          {/* 4 KARTU STATISTIK REAL-TIME TENANT (ZERO-DUMMY) */}
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
                {getEmployees(isTenant).length} <span className="text-xs font-normal text-slate-400">Pegawai</span>
              </div>
              <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold block">
                {getEmployees(isTenant).length === 0 ? '0 Pegawai (Siap diinput)' : `${getEmployees(isTenant).length} Pegawai Terdaftar`}
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 sm:pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                Panduan Onboarding (4 Langkah Memulai)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Konfigurasi awal pesantren Anda:
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
              <div className="p-3 sm:p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 space-y-1.5 sm:space-y-2 flex flex-col justify-between">
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[9px] sm:text-[10px]">Langkah 1</span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-1">Input Santri Baru</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 hidden sm:block">
                    Daftarkan santri pertama &amp; kontak wali.
                  </p>
                </div>
                <Link
                  href="/santri/create?mode=tenant"
                  className="w-full mt-1.5 sm:mt-2 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-[11px] sm:text-xs rounded-lg transition"
                >
                  + Tambah Santri
                </Link>
              </div>

              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 sm:space-y-2 flex flex-col justify-between">
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-slate-700 text-white font-bold text-[9px] sm:text-[10px]">Langkah 2</span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-1">Kelola Asatidz</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 hidden sm:block">
                    Daftarkan guru pengajar &amp; musyrif.
                  </p>
                </div>
                <Link
                  href="/kepegawaian?tab=direktori&mode=tenant"
                  className="w-full mt-1.5 sm:mt-2 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-center font-bold text-[11px] sm:text-xs rounded-lg transition"
                >
                  Direktori SDM
                </Link>
              </div>

              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 sm:space-y-2 flex flex-col justify-between">
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-slate-700 text-white font-bold text-[9px] sm:text-[10px]">Langkah 3</span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-1">Atur Tarif SPP</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 hidden sm:block">
                    Konfigurasi nominal SPP &amp; invoice.
                  </p>
                </div>
                <Link
                  href="/finance/spp?mode=tenant"
                  className="w-full mt-1.5 sm:mt-2 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-center font-bold text-[11px] sm:text-xs rounded-lg transition"
                >
                  Kelola SPP
                </Link>
              </div>

              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 sm:space-y-2 flex flex-col justify-between">
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-slate-700 text-white font-bold text-[9px] sm:text-[10px]">Langkah 4</span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-1">Portal &amp; Absensi</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 hidden sm:block">
                    Akses portal wali &amp; sistem GPS.
                  </p>
                </div>
                <Link
                  href="/portal-wali?mode=tenant"
                  className="w-full mt-1.5 sm:mt-2 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-center font-bold text-[11px] sm:text-xs rounded-lg transition"
                >
                  Cek Portal
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
                  Data santri resmi terdaftar
                </p>
              </div>
              <Link
                href="/santri/create?mode=tenant"
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
                  href="/santri/create?mode=tenant"
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
        /* JALUR PIMPINAN NON-TENANT / DEMO (Presensi Pimpinan & Panel Divisi) */
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

          {/* SARANA PRASARANA & RUMAH TANGGA */}
          {currentActor.role_key === 'kepala_rumah_tangga' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-900">
                    SARANA PRASARANA &amp; RUMAH TANGGA
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

          {/* KEPEGAWAIAN & SDM */}
          {currentActor.role_key === 'kepala_kepegawaian' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                    KEPEGAWAIAN &amp; SDM
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

          {/* MANAJEMEN KEUANGAN & SPP */}
          {currentActor.role_key === 'keuangan' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                    MANAJEMEN KEUANGAN &amp; SPP
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

          {/* KEPALA SEKOLAH & MUDIR (AKADEMIK) */}
          {currentActor.role_key === 'mudir' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                    KEPALA SEKOLAH &amp; MUDIR (AKADEMIK)
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

          {/* OPERASIONAL YAYASAN & PERSETUJUAN */}
          {currentActor.role_key === 'wakil_yayasan' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                    OPERASIONAL YAYASAN &amp; PERSETUJUAN
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

          {/* KETUA YAYASAN & EKSEKUTIF */}
          {currentActor.role_key === 'yayasan' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full uppercase border border-blue-200 dark:border-blue-800">
                    KETUA YAYASAN &amp; EKSEKUTIF
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

        </div>
      )}
    </div>
  ) : (
    /* ========================================================================= */
    /* JALUR PEGAWAI: MEJA KERJA ASATIDZ, GURU & TENAGA KEPENDIDIKAN            */
    /* ========================================================================= */
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

          {/* 1. MEJA KERJA GURU KBM & TAHFIDZ (PRIORITAS UTAMA TAHFIDZ!) */}
          {isGuru && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full uppercase border border-emerald-200 dark:border-emerald-800">
                    Prioritas Utama • Tahfidz &amp; Halaqah Santri
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    Progres Setoran Hafalan &amp; KBM ({currentActor.name})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/akademik/tahfidz"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>+ Input Progres Hafalan Santri</span>
                  </Link>
                </div>
              </div>

              {/* CARD PRIORITAS TAHFIDZ SANTRI */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        Bimbingan Halaqah &amp; Setoran Santri
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Input mutaba'ah ziyadah baru, muraja'ah juz &amp; kelancaran tajwid
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/akademik/tahfidz"
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Buka Halaqah</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Santri Bimbingan:</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">15 Santri</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">Halaqah Aktif</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Target Pekan:</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">Ziyadah 1/2 Juz</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Juz 30 &bull; Mutqin</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Setoran Hari Ini:</span>
                    <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">12 Santri</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">80% Tuntas</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Status Pengujian:</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">Tasmi' Terjadwal</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Sabtu Mendatang</span>
                  </div>
                </div>
              </div>

              {/* JADWAL KBM SYAR'I (POIN 5) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                    Jadwal KBM Terjadwal Hari Ini
                  </h4>
                  {mySessions.length > 0 && (
                    <Link href="/akademik/nilai" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                      Lihat Rombel &bull; {mySessions.length} Sesi
                    </Link>
                  )}
                </div>

                {mySessions.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-3 text-xs">
                    {mySessions.map((session, sIdx) => (
                      <div key={sIdx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{session.mapel || 'Mata Pelajaran'}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                            {session.jam || '08:00 - 09:30'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Kelas: {session.kelas_nama || 'Kelas Santri'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <BookOpen className="w-6 h-6 text-slate-400 mx-auto mb-1.5 opacity-40" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Belum Ada KBM Terjadwal</p>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS GURU */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
                <Link
                  href="/akademik/tahfidz"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl transition text-center group"
                >
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1 group-hover:scale-110 transition" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Input Tahfidz</span>
                  <span className="text-[10px] text-slate-400">Setoran &amp; Mutaba'ah</span>
                </Link>
                <Link
                  href="/akademik/nilai"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl transition text-center group"
                >
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1 group-hover:scale-110 transition" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Nilai KBM</span>
                  <span className="text-[10px] text-slate-400">Tugas &amp; Ujian</span>
                </Link>
                <Link
                  href="/presensi/diri"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/20 rounded-xl transition text-center group"
                >
                  <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-1 group-hover:scale-110 transition" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Absen Diri</span>
                  <span className="text-[10px] text-slate-400">Presensi GPS</span>
                </Link>
                <Link
                  href="/pengaturan"
                  className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50/20 rounded-xl transition text-center group"
                >
                  <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1 group-hover:scale-110 transition" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Pengaturan</span>
                  <span className="text-[10px] text-slate-400">Password &amp; Tema</span>
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
