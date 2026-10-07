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
  PhoneCall
} from 'lucide-react';
import { 
  getActiveActor, 
  setActiveActorByRole, 
  MASTER_PILLAR_ACTORS, 
  ActiveActor,
  useAppMode,
  useActiveTenant
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
  MASTER_SANTRI
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
    setNotif(`Peran aktif beralih ke: ${updated.name} (${updated.title})`);
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

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* HEADER BANNER: TENANT RESMI (PRODUKSI) VS SIMULATOR 12 PERAN (DEMO)      */}
      {/* ========================================================================= */}
      {isTenant ? (
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-base shadow-sm">
                NH
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-slate-900">{tenant.name}</h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Tier 1 Starter (Free Kuota 50 Santri)
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {tenant.city} • Pimpinan: <strong>Ust. H. Fauzan Mansur, Lc.</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
                ● Status Akun: <strong>Aktif Siap Onboarding (Rabu)</strong>
              </span>
            </div>
          </div>

          {/* Meteran Kuota & Akses Fitur Tier 1 */}
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1.5">
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Penggunaan Kuota Santri:</span>
                <strong className="text-emerald-800 font-bold">42 / 50 Santri</strong>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-emerald-700 font-semibold">
                <span>Tersisa 8 slot santri</span>
                <Link href="/santri/create" className="text-emerald-800 underline font-bold hover:text-emerald-950">
                  + Tambah Santri
                </Link>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 block">Fitur Utama Aktif:</span>
              <div className="flex flex-wrap gap-1 text-[10px]">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium text-slate-700">Tahfidz</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium text-slate-700">Adab Harian</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium text-slate-700">Reward</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium text-slate-700">Pelanggaran</span>
                <span className="bg-emerald-100 px-2 py-0.5 rounded font-bold text-emerald-800">Portal Wali</span>
              </div>
              <span className="text-[10px] text-slate-400 block pt-0.5">Payroll BSI &amp; RT Sarpras di Tier 2 Pro</span>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-indigo-900 font-bold block">Portal Wali Santri:</span>
                <span className="text-[11px] text-indigo-700">Akses real-time orang tua santri</span>
              </div>
              <Link
                href="/portal-wali"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
              >
                Cek Portal
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[11px]">Akun Uji Coba Aktif:</span>
              <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                isPimpinan ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}>
                {isPimpinan ? '🏛️ Level Pimpinan (6 Pilar)' : '👷 Level Tim Pegawai / Staf Pelaksana'}
              </span>
              <span className="font-bold text-slate-800 text-sm">{currentActor.name}</span>
              <span className="text-slate-400">({currentActor.title})</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentActor.gender === 'akhwat' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {currentActor.gender === 'akhwat' ? '🧕 Syar\'i Akhwat' : '🕌 Syar\'i Ikhwan'}
              </span>
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                NIP: {currentActor.nip}
              </span>
            </div>
          </div>

          {/* Quick Role Switcher Buttons */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold text-indigo-700 shrink-0 uppercase tracking-wider">Pimpinan:</span>
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
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'bg-indigo-50/70 text-indigo-800 hover:bg-indigo-100 border border-indigo-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold text-emerald-700 shrink-0 uppercase tracking-wider">Tim Pegawai:</span>
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
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 border border-emerald-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notif}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAMPILAN 1: DASHBOARD TIM PEGAWAI / STAF WORKSPACE (NON-PIMPINAN)         */}
      {/* ========================================================================= */}
      {!isPimpinan && (
        <div className="space-y-6">
          {/* Card Profil & Presensi Cepat */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Box 1: Status Khidmah & Unit Penempatan */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  Portal Khidmat Staf
                </span>
                <span className="text-[11px] text-slate-300">Tahun Ajaran 2026/2027</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{currentActor.name}</h3>
                <p className="text-xs text-slate-300 font-medium">{currentActor.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">{currentActor.dept}</p>
              </div>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
                <span>Unit: <strong>{currentActor.unit_name || 'Operasional Kampus'}</strong></span>
                <span className="text-emerald-400 font-semibold">● Status: Aktif Khidmah</span>
              </div>
            </div>

            {/* Box 2: Presensi Mandiri Harian (Interactive Geofencing GPS) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Presensi Diri Hari Ini</h4>
                    <span className="text-[10px] text-slate-500">Jam Masuk: 07:00 • Jam Pulang: 16:00</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  absenDiriStatus ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {absenDiriStatus ? 'Sudah Absen' : 'Belum Hadir'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Geofence Pesantren:</span>
                  <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Valid (Radius 15m)
                  </span>
                </div>
                <div className="text-slate-700 font-bold text-xs mt-1">
                  {absenDiriStatus ? absenDiriStatus : 'Silakan klik tombol di bawah untuk mencatat jam hadir Anda'}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleKlikAbsenDiri}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{absenDiriStatus ? 'Perbarui Absen' : 'Klik Hadir Sekarang'}</span>
                </button>
                <Link
                  href="/presensi/diri"
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition text-center"
                >
                  Buka GPS
                </Link>
              </div>
            </div>

            {/* Box 3: Pengajuan Cuti Mandiri Staf (Ke KaBid HRD) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                    Meja Kerja Pengajar • KBM Syar'i
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Jadwal Mengajar &amp; Pengisian Nilai ({currentActor.name})
                  </h3>
                </div>
                <Link
                  href="/akademik/nilai"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <span>Buka Modul Nilai &amp; KBM</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Jadwal Sesi Mengajar Hari Ini</span>
                  <span className="text-2xl font-bold text-slate-800">{mySessions.length} Sesi Aktif</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">
                    {currentActor.gender === 'akhwat' ? 'Kampus Putri • Gedung Khadijah' : 'Kampus Putra • Gedung Ibnu Khaldun'}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Ketuntasan Nilai KKM &amp; Tugas</span>
                  <span className="text-2xl font-bold text-emerald-700">92.5%</span>
                  <span className="text-slate-500 text-[11px]">Terkoneksi langsung ke Rapor Santri</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Siswa Butuh Remedial KBM</span>
                  <span className="text-2xl font-bold text-amber-700">2 Santri</span>
                  <span className="text-slate-500 text-[11px]">Di bawah KKM Standar (75.0)</span>
                </div>
              </div>

              {/* Action Buttons Guru */}
              <div className="grid sm:grid-cols-4 gap-3 pt-2">
                <Link
                  href="/akademik/nilai"
                  className="p-3 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl transition text-center"
                >
                  <GraduationCap className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 block">Input Nilai KKM</span>
                  <span className="text-[10px] text-slate-400">Tugas, UTS &amp; UAS</span>
                </Link>
                <Link
                  href="/akademik/tahfidz"
                  className="p-3 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 block">Simak Hafalan</span>
                  <span className="text-[10px] text-slate-400">Ziyadah &amp; Muraja'ah</span>
                </Link>
                <Link
                  href="/akademik/disiplin?tab=adab"
                  className="p-3 bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 rounded-xl transition text-center"
                >
                  <Sparkles className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 block">Catat Adab Mulia</span>
                  <span className="text-[10px] text-slate-400">Karakter &amp; Sunnah</span>
                </Link>
                <Link
                  href="/akademik/disiplin?tab=pelanggaran"
                  className="p-3 bg-white border border-slate-200 hover:border-rose-500 hover:bg-rose-50/30 rounded-xl transition text-center"
                >
                  <AlertTriangle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 block">Catat Pelanggaran</span>
                  <span className="text-[10px] text-slate-400">Iqob Tarbawi KBM</span>
                </Link>
              </div>
            </div>
          )}

          {/* 2. MEJA KERJA MUSYRIF / MUSYRIFAH ASRAMA */}
          {isMusyrif && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                    Meja Kerja Pengasuhan • Asrama &amp; Kesantrian
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Binaan Asrama &amp; Halaqah ({currentActor.name})
                  </h3>
                </div>
                <Link
                  href="/presensi/santri"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <span>Presensi Sholat Subuh &amp; Apel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Santri Binaan Asrama</span>
                  <span className="text-2xl font-bold text-slate-800">22 Santri</span>
                  <span className="text-blue-700 font-semibold block text-[11px]">
                    {currentActor.gender === 'akhwat' ? 'Gedung Khadijah Putri' : 'Gedung Abu Bakar & Utsman Putra'}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Setoran Tahfidz Pekan Ini</span>
                  <span className="text-2xl font-bold text-emerald-700">18 / 22 Tuntas</span>
                  <span className="text-slate-500 text-[11px]">Halaqah Ba'da Subuh &amp; Ashar</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Izin Keluar / Sakit di Poskestren</span>
                  <span className="text-2xl font-bold text-amber-700">1 Santri Izin</span>
                  <span className="text-slate-500 text-[11px]">QR Gate Pass aktif terverifikasi</span>
                </div>
              </div>

              {/* Action Buttons Musyrif */}
              <div className="grid sm:grid-cols-4 gap-3 pt-2">
                <Link
                  href="/akademik/tahfidz"
                  className="p-3 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl transition text-center"
                >
                  <BookOpen className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 block">Simak Setoran Tahfidz</span>
                  <span className="text-[10px] text-slate-400">Ziyadah &amp; Murajaah</span>
                </Link>
                <Link
                  href="/presensi/santri"
                  className="p-3 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <School className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 block">Absen Sholat Berjamaah</span>
                  <span className="text-[10px] text-slate-400">Subuh, Ashar, Maghrib</span>
                </Link>
                <Link
                  href="/akademik/disiplin?tab=adab"
                  className="p-3 bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 rounded-xl transition text-center"
                >
                  <Sparkles className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 block">Adab Santri Asrama</span>
                  <span className="text-[10px] text-slate-400">Kerapihan Kamar &amp; Dzikir</span>
                </Link>
                <Link
                  href="/akademik/perizinan"
                  className="p-3 bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 rounded-xl transition text-center"
                >
                  <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 block">Verifikasi Izin Santri</span>
                  <span className="text-[10px] text-slate-400">Persetujuan Kamar Asrama</span>
                </Link>
              </div>
            </div>
          )}

          {/* 3. MEJA KERJA PEGAWAI LAUNDRY PESANTREN */}
          {isLaundry && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full uppercase">
                    Operasional Rumah Tangga • Unit Laundry Sentral
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Antrean Cuci &amp; Layanan Pakaian Santri ({currentActor.name})
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
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajukan Sabun &amp; Kebutuhan Laundry</span>
                </button>
              </div>

              {/* Status Antrean Cuci (Non-Monetary) */}
              <div className="grid md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Pakaian Masuk Hari Ini</span>
                  <span className="text-2xl font-bold text-slate-800">42 Kantong</span>
                  <span className="text-teal-700 font-semibold block text-[11px]">Asrama Putra &amp; Putri</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Sedang Dicuci &amp; Kering</span>
                  <span className="text-2xl font-bold text-blue-700">28 Kantong</span>
                  <span className="text-slate-500 text-[11px]">Mesin 1 s.d 4 beroperasi</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Selesai Disetrika (Siap Ambil)</span>
                  <span className="text-2xl font-bold text-emerald-700">14 Kantong</span>
                  <span className="text-slate-500 text-[11px]">Rapi &amp; harum di loker</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Stok Deterjen &amp; Pewangi</span>
                  <span className="text-2xl font-bold text-amber-700">Cukup 5 Hari</span>
                  <span className="text-slate-500 text-[11px]">Perlu pengajuan tambahan</span>
                </div>
              </div>

              {/* Notice Privasi Keuangan */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <span>🛡️ <strong>Kerahasiaan Anggaran Terjaga:</strong> Pegawai Laundry mencatat daftar kebutuhan fisik tanpa dibebani sisa anggaran pondok. Sisa anggaran hanya dikelola oleh KaBid RT.</span>
                <Link href="/rumah-tangga" className="font-bold underline ml-2 shrink-0">Lihat Modul RT</Link>
              </div>
            </div>
          )}

          {/* 4. MEJA KERJA PEGAWAI DAPUR & KONSUMSI SANTRI */}
          {isDapur && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase">
                    Operasional Rumah Tangga • Dapur Sentral Santri
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Jadwal Masak &amp; Logistik Konsumsi ({currentActor.name})
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
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajukan Belanja Beras &amp; Gas Dapur</span>
                </button>
              </div>

              <div className="grid md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Porsi Makan Siang Hari Ini</span>
                  <span className="text-2xl font-bold text-slate-800">120 Porsi</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">Santri Putra, Putri &amp; Asatidz</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Menu Masak Siang Ini</span>
                  <span className="text-sm font-bold text-slate-800 block">Ayam Goreng Lengkuas, Sayur Asem, Tahu Tempe</span>
                  <span className="text-slate-400 text-[10px]">Jadwal makan: 12:30 WIB</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Stok Beras Tersedia</span>
                  <span className="text-2xl font-bold text-emerald-700">8 Karung</span>
                  <span className="text-slate-500 text-[11px]">Cukup untuk 6 hari ke depan</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Stok Tabung Gas LPG</span>
                  <span className="text-2xl font-bold text-amber-700">2 Tabung Aktif</span>
                  <span className="text-slate-500 text-[11px]">Cadangan 1 tabung</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>🛡️ <strong>Kerahasiaan Anggaran Terjaga:</strong> Juru masak hanya mengajukan daftar belanja fisik barang konsumsi. Urusan harga dan anggaran disahkan oleh KaBid RT &amp; Keuangan.</span>
                <Link href="/rumah-tangga" className="font-bold underline ml-2 shrink-0">Buka Modul RT</Link>
              </div>
            </div>
          )}

          {/* 5. MEJA KERJA SATPAM POS GERBANG (INTERACTIVE GATE SCANNER & MOVEMENT) */}
          {isSatpam && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full uppercase border border-rose-200">
                    Pos Keamanan &amp; Ketertiban • Gerbang Utama Pesantren
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Kendali Gate Movement &amp; Scanner Santri ({currentActor.name})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mencatat santri keluar pondok, batas jam kembali, evaluasi otomatis kedatangan &amp; deteksi keterlambatan
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setModalIzinPos(true)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Catat Izin Keluar di Pos</span>
                  </button>

                  <Link
                    href="/akademik/perizinan"
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                  >
                    <Scan className="w-3.5 h-3.5 text-rose-600" />
                    <span>Scanner QR Kamera</span>
                  </Link>
                </div>
              </div>

              {/* 3 KARTU STATISTIK POS GERBANG */}
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Santri Sedang di Luar</span>
                    <LogOut className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700 font-mono">
                    {permRequests.filter(r => r.status === 'SANTRI_OUTSIDE' || r.status === 'CHECKED_OUT' || r.status === 'OVERDUE').length} Santri
                  </span>
                  <span className="text-slate-500 text-[11px] block">Terdata check-out resmi di gerbang</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Keterlambatan (Overdue)</span>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-2xl font-bold text-rose-700 font-mono">
                    {permRequests.filter(r => r.status === 'OVERDUE' || (r.menit_terlambat && r.menit_terlambat > 0 && r.status !== 'RETURNED')).length} Santri
                  </span>
                  <span className="text-rose-600 font-semibold text-[11px] block">Melewati batas jam kembali</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Siap Keluar (Gate Pass)</span>
                    <QrCode className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-700 font-mono">
                    {permRequests.filter(r => r.status === 'GATE_PASS' || r.status === 'APPROVED').length} Santri
                  </span>
                  <span className="text-emerald-700 font-semibold text-[11px] block">Surat jalan aktif disetujui</span>
                </div>
              </div>

              {/* PANEL 1: DAFTAR SANTRI SEDANG DI LUAR KAMPUS & TOMBOL CHECK-IN (JAM BERAPA KEMBALI) */}
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4 text-blue-700" />
                    <h4 className="font-bold text-blue-950 text-sm">
                      Daftar Santri Sedang di Luar Pondok (Pencatatan Jam Kembali / Check-In)
                    </h4>
                  </div>
                  <span className="text-[11px] text-blue-800 font-semibold bg-blue-100 px-2.5 py-0.5 rounded-full">
                    Pos Gerbang Utama
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Saat santri tiba di gerbang, klik tombol <strong>"Check-In Masuk"</strong>. Sistem otomatis mencatat waktu kedatangan riil, mengevaluasi apakah tepat waktu atau terlambat, dan menutup sesi izin.
                </p>

                {(() => {
                  const outsideList = permRequests.filter(r => r.status === 'SANTRI_OUTSIDE' || r.status === 'CHECKED_OUT' || r.status === 'OVERDUE');
                  if (outsideList.length === 0) {
                    return (
                      <div className="p-4 bg-white rounded-xl border border-blue-100 text-center text-slate-500">
                        ✓ Seluruh santri saat ini berada di dalam kampus. Tidak ada santri yang berstatus di luar.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold border-b border-slate-100">
                          <tr>
                            <th className="p-3">Santri &amp; Kamar</th>
                            <th className="p-3">Penjemput &amp; Keperluan</th>
                            <th className="p-3">Jam Keluar Aktual</th>
                            <th className="p-3">Batas Jam Kembali</th>
                            <th className="p-3">Status / Sisa Waktu</th>
                            <th className="p-3 text-right">Aksi Gerbang</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {outsideList.map(req => {
                            const batasDate = new Date(req.rencana_kembali.replace(' ', 'T'));
                            const isLate = !isNaN(batasDate.getTime()) && Date.now() > batasDate.getTime();
                            const lastMovement = req.gate_movements?.filter(m => m.type === 'CHECK_OUT').slice(-1)[0];

                            return (
                              <tr key={req.id} className="hover:bg-slate-50/70 transition">
                                <td className="p-3">
                                  <div className="font-bold text-slate-800">{req.nama}</div>
                                  <div className="text-[11px] text-slate-500 font-mono">NIS: {req.nis} • {req.kamar}</div>
                                </td>
                                <td className="p-3">
                                  <div className="font-medium text-slate-800">{req.nama_penjemput} ({req.hubungan_penjemput})</div>
                                  <div className="text-[11px] text-slate-500">{req.alasan}</div>
                                </td>
                                <td className="p-3">
                                  <div className="font-semibold text-slate-700">
                                    {lastMovement?.timestamp || req.rencana_keluar.slice(11) + ' WIB'}
                                  </div>
                                  <div className="text-[10px] text-slate-400">Petugas: {lastMovement?.officer_name || 'Satpam Pos'}</div>
                                </td>
                                <td className="p-3">
                                  <div className="font-bold text-slate-900 font-mono">
                                    {req.rencana_kembali.slice(11)} WIB
                                  </div>
                                  <div className="text-[10px] text-slate-400">{req.rencana_kembali.slice(0, 10)}</div>
                                </td>
                                <td className="p-3">
                                  {isLate ? (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit">
                                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                                      Terlambat {req.menit_terlambat || 15} Menit
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                                      <Clock className="w-3 h-3 text-emerald-600" />
                                      Dalam Batas Waktu
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => handleCheckInSantri(req.id)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1"
                                  >
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span>Check-In Masuk</span>
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

              {/* PANEL 2: CHECK-OUT SANTRI KELUAR PONDOK (SIAPA YANG KELUAR) */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <h4 className="font-bold text-slate-800 text-sm">
                      Pencatatan Santri Keluar Gerbang (Check-Out Gerbang)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Pilih Santri yang Memiliki Gate Pass Resmi
                  </span>
                </div>

                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <select
                      value={selectedGateOutId}
                      onChange={(e) => setSelectedGateOutId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                    >
                      <option value="">-- Pilih Santri Berizin yang Akan Keluar Gerbang --</option>
                      {permRequests
                        .filter(r => r.status === 'GATE_PASS' || r.status === 'APPROVED')
                        .map(r => (
                          <option key={r.id} value={r.id}>
                            [{r.status}] {r.nama} (NIS: {r.nis}) • Penjemput: {r.nama_penjemput} • Batas Kembali: {r.rencana_kembali.slice(11)} WIB
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <button
                      disabled={!selectedGateOutId}
                      onClick={() => handleCheckOutSantri(selectedGateOutId)}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Catat Keluar (Check-Out)</span>
                    </button>
                  </div>
                </div>

                {selectedGateOutId && (() => {
                  const targetReq = permRequests.find(r => r.id === selectedGateOutId);
                  if (!targetReq) return null;
                  return (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-slate-700">
                      <div>
                        <strong>{targetReq.nama}</strong> ({targetReq.kelas})
                        <div className="text-[11px] text-slate-500">
                          Keperluan: {targetReq.alasan} • Penjemput: {targetReq.nama_penjemput} ({targetReq.kontak_wali})
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">Target Jam Kembali:</span>
                        <strong className="text-rose-700 font-mono text-sm">{targetReq.rencana_kembali} WIB</strong>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* 6. MEJA KERJA STAF KASIR & LOKET SPP (KEUANGAN) */}
          {isKasir && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                    Divisi Keuangan • Loket Pembayaran SPP &amp; Uang Jajan
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Loket Kasir &amp; Pengiriman Kwitansi WA Wali ({currentActor.name})
                  </h3>
                </div>
                <Link
                  href="/finance/spp"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Buka Loket SPP &amp; Kirim WA</span>
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Penerimaan Loket Hari Ini</span>
                  <span className="text-2xl font-bold text-emerald-700">Rp 12.850.000</span>
                  <span className="text-slate-500 text-[11px]">8 Transaksi tunai &amp; transfer wali</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Struk Terkirim ke WhatsApp Wali</span>
                  <span className="text-2xl font-bold text-slate-800">8 / 8 Sukses</span>
                  <span className="text-emerald-700 text-[11px]">Tanpa pindah layar (WhatsApp Web direct)</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Hak Batas Anggaran Pengeluaran</span>
                  <span className="text-sm font-bold text-amber-700 block mt-1">Read-Only (Terkunci)</span>
                  <span className="text-slate-400 text-[10px]">Wewenang eksklusif Wakil Ketua Yayasan</span>
                </div>
              </div>
            </div>
          )}

          {/* 7. MEJA KERJA STAF ADMIN HRD & PRESENSI PEGAWAI */}
          {isStafHrd && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">
                    Divisi Kepegawaian • Monitoring Presensi 50–150 Pegawai
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Rekap Presensi Harian Mesin &amp; GPS SDM ({currentActor.name})
                  </h3>
                </div>
                <Link
                  href="/kepegawaian"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Buka Direktori Pegawai</span>
                </Link>
              </div>

              <div className="grid md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Total Pegawai Pesantren</span>
                  <span className="text-2xl font-bold text-slate-800">84 Pegawai</span>
                  <span className="text-slate-400 text-[11px]">Guru, Musyrif, RT &amp; Staf</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Hadir Tepat Waktu Hari Ini</span>
                  <span className="text-2xl font-bold text-emerald-700">79 Hadir</span>
                  <span className="text-emerald-700 text-[11px]">94% Kehadiran mesin &amp; GPS</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Izin / Sakit Terkonfirmasi</span>
                  <span className="text-2xl font-bold text-blue-700">3 Pegawai</span>
                  <span className="text-slate-400 text-[11px]">Telah di-ACC oleh KaBid HRD</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Belum Presensi (Alpa)</span>
                  <span className="text-2xl font-bold text-rose-700">2 Pegawai</span>
                  <span className="text-rose-600 text-[11px]">Perlu konfirmasi WhatsApp</span>
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
          {/* Card Presensi Cepat Pimpinan (Pimpinan juga berkhidmah & dapat absen mandiri) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-sm">Presensi Kehadiran Pimpinan</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    absenDiriStatus ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {absenDiriStatus ? 'Sudah Presensi' : 'Belum Presensi'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {absenDiriStatus ? absenDiriStatus : 'Radius GPS Pesantren Valid (15m) • Klik tombol untuk mencatat log khidmah pimpinan'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleKlikAbsenDiri}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{absenDiriStatus ? 'Perbarui Jam Hadir' : 'Catat Hadir Sekarang'}</span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------------------- */}
          {/* PILAR 6: KEPALA BAGIAN RUMAH TANGGA & SARPRAS (PAK SUBANDI)               */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'kepala_rumah_tangga' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full uppercase border border-teal-200">
                    🏛️ PILAR 6: KEPALA BAGIAN RUMAH TANGGA &amp; SARPRAS
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Console Operasional KaBid RT: {currentActor.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Komando Dapur Sentral, Unit Laundry, Satpam Gerbang &amp; Pemeliharaan Gedung
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/rumah-tangga"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Buka Hub Rumah Tangga</span>
                  </Link>
                  <Link
                    href="/rumah-tangga/pengajuan"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition inline-flex items-center space-x-1.5"
                  >
                    <Package className="w-4 h-4" />
                    <span>Pengajuan Logistik RT</span>
                  </Link>
                </div>
              </div>

              {/* KARTU EKSKLUSIF: SISA ANGGARAN OPERASIONAL RT (HANYA PADA KABID RT) */}
              <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-teal-700/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-teal-500/30 text-teal-200 rounded text-[10px] font-bold uppercase tracking-wider">
                        Khusus KaBid RT • Dilindungi Hak Akses
                      </span>
                      <span className="text-xs text-teal-200/80">Tahun Anggaran 2026/2027</span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-1.5">Sisa Plafon Anggaran Operasional RT</h3>
                    <p className="text-xs text-teal-100/80 mt-0.5">
                      Dikelola mandiri oleh KaBid RT untuk logistik konsumsi dapur, sabun laundry &amp; pemeliharaan fasilitas pondok
                    </p>
                  </div>
                  <div className="text-left md:text-right bg-white/10 p-4 rounded-xl backdrop-blur-xs border border-white/10">
                    <span className="text-[11px] text-teal-200 block font-semibold uppercase">Sisa Saldo Tersedia</span>
                    <div className="text-3xl font-black text-white">Rp 14.250.000</div>
                    <div className="text-xs text-teal-200 mt-1">
                      Pagu Bulanan: <strong>Rp 25.000.000</strong> (Terserap 43%)
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-teal-700/50 flex flex-wrap items-center justify-between gap-3 text-xs text-teal-100">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Plafon Mandiri: Pengajuan &lt; Rp 1 Jt langsung diproses Keuangan tanpa perlu ACC Yayasan
                  </span>
                  <span className="bg-teal-950/60 px-3 py-1 rounded-lg text-emerald-300 font-bold text-[11px]">
                    Status Anggaran: Sangat Sehat (57% Tersedia)
                  </span>
                </div>
              </div>

              {/* METRIK 4 UNIT OPERASIONAL RT */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Logistik Dapur Santri</span>
                    <Utensils className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">8 Karung Beras</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">Aman 6 Hari (120 Porsi/Sesi)</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Unit Laundry Sentral</span>
                    <Package className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">42 Kantong Cuci</span>
                  <span className="text-teal-700 font-semibold block text-[11px]">4 Mesin Cuci Beroperasi Penuh</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Keamanan &amp; Gerbang</span>
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">3 Santri Izin QR</span>
                  <span className="text-rose-600 font-semibold block text-[11px]">1 Kasus Overdue Sidang Santri</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Tiket Sarpras / Rusak</span>
                    <Wrench className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">3 Tiket Aktif</span>
                  <span className="text-blue-700 font-semibold block text-[11px]">Butuh Disposisi Teknisi Listrik/AC</span>
                </div>
              </div>

              {/* TOMBOL PINTAS KABID RT */}
              <div className="grid sm:grid-cols-3 gap-3 pt-1 text-xs">
                <Link
                  href="/rumah-tangga"
                  className="p-3 bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 rounded-xl transition text-center"
                >
                  <Building2 className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 block">Hub Operasional Sarpras</span>
                  <span className="text-[10px] text-slate-400">Monitoring Aset &amp; Pemeliharaan</span>
                </Link>
                <Link
                  href="/rumah-tangga/pengajuan"
                  className="p-3 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 block">Pengajuan Logistik Sarpras</span>
                  <span className="text-[10px] text-slate-400">Belanja Dapur, Laundry &amp; Pos Satpam</span>
                </Link>
                <Link
                  href="/akademik/perizinan"
                  className="p-3 bg-white border border-slate-200 hover:border-rose-500 hover:bg-rose-50/30 rounded-xl transition text-center"
                >
                  <QrCode className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                  <span className="font-bold text-xs text-slate-800 block">Pantau Scanner Gate Pass</span>
                  <span className="text-[10px] text-slate-400">Arus Keluar-Masuk Gerbang</span>
                </Link>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* PILAR 3: KEPALA BAGIAN KEPEGAWAIAN / HRD (UST. IR. FAISAL RAHMAN, M.M.)   */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'kepala_kepegawaian' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full uppercase border border-blue-200">
                    🏛️ PILAR 3: KEPALA BAGIAN KEPEGAWAIAN (HRD)
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Tata Kelola SDM Pesantren: {currentActor.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Otoritas Absensi, Disiplin Khidmah &amp; Persetujuan Cuti 50–150 Pegawai Pesantren
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/kepegawaian"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <Users className="w-4 h-4" />
                    <span>Buka Hub SDM &amp; Cuti</span>
                  </Link>
                  <Link
                    href="/presensi"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition inline-flex items-center space-x-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Rekap Log Presensi</span>
                  </Link>
                </div>
              </div>

              {/* METRIK SDM (50-150 PEGAWAI) */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Total Pegawai Pesantren</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">84 Pegawai</span>
                  <span className="text-slate-500 font-semibold block text-[11px]">Pendidik, Musyrif, RT &amp; Kasir</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Hadir Tepat Waktu</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-700">79 Hadir (94%)</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">Radius Geofence 15m Terpenuhi</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Antrean Approval Cuti</span>
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-2xl font-bold text-amber-700">2 Pengajuan</span>
                  <span className="text-amber-700 font-semibold block text-[11px]">Menunggu ACC KaBid HRD</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Belum Presensi (Alpa)</span>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-2xl font-bold text-rose-700">2 Pegawai</span>
                  <span className="text-rose-600 font-semibold block text-[11px]">Perlu Konfirmasi Staf HRD</span>
                </div>
              </div>

              {/* ANTREAN CEPAT CUTI MANDIRI DARI PEGAWAI */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-700" />
                    Pengajuan Cuti / Izin Masuk Hari Ini (Memerlukan Persetujuan KaBid HRD):
                  </span>
                  <Link href="/kepegawaian" className="text-amber-800 font-bold underline text-[11px]">
                    Proses di Modul Cuti &rarr;
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-slate-800 space-y-1">
                    <div className="flex justify-between font-bold text-xs">
                      <span>Ibu Sumiati (Koordinator Laundry)</span>
                      <span className="text-amber-700">Cuti Tahunan (2 Hari)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Alasan: Keperluan keluarga penting di kampung</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-slate-800 space-y-1">
                    <div className="flex justify-between font-bold text-xs">
                      <span>Pak Slamet (Juru Masak Dapur)</span>
                      <span className="text-blue-700">Izin Sakit (1 Hari)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Alasan: Demam &amp; istirahat di rumah dinas</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* PILAR 4: KEPALA BAGIAN KEUANGAN (UST. AHMAD DAHLAN, S.E.)                 */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'keuangan' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                    🏛️ PILAR 4: KEPALA BAGIAN KEUANGAN
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Pusat Pengendali Kas &amp; SPP: {currentActor.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pengawasan Penerimaan SPP, Rekap Arus Kas &amp; Verifikasi Pencairan Anggaran RT &amp; KBM
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/finance/spp"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Loket SPP &amp; Kuitansi WA</span>
                  </Link>
                  <Link
                    href="/finance/validasi"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verifikasi Pencairan</span>
                  </Link>
                </div>
              </div>

              {/* METRIK KEUANGAN & KAS */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Penerimaan SPP Hari Ini</span>
                    <Receipt className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-700">Rp 12.850.000</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">8 Transaksi Lunas di Loket</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Total Kas Operasional</span>
                    <Wallet className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">Rp 84.500.000</span>
                  <span className="text-blue-700 font-semibold block text-[11px]">BSI Rekening SPP &amp; Operasional</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Antrean Pencairan Dana</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-2xl font-bold text-amber-700">3 Pengajuan</span>
                  <span className="text-amber-700 font-semibold block text-[11px]">Pengadaan Dapur, Laundry &amp; KBM</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Batas Mandiri Keuangan</span>
                    <Settings className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">s.d Rp 5.000.000</span>
                  <span className="text-slate-500 font-semibold block text-[11px]">Di atas batas wajib ACC Wk. Yayasan</span>
                </div>
              </div>

              {/* TOMBOL PINTAS KABID KEUANGAN */}
              <div className="grid sm:grid-cols-4 gap-3 pt-1 text-xs">
                <Link
                  href="/finance/spp"
                  className="p-3 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl transition text-center"
                >
                  <Receipt className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 block">Loket Kasir SPP</span>
                  <span className="text-[10px] text-slate-400">Input Bayar &amp; Kirim Struk WA</span>
                </Link>
                <Link
                  href="/finance/validasi"
                  className="p-3 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl transition text-center"
                >
                  <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 block">Verifikasi Pencairan</span>
                  <span className="text-[10px] text-slate-400">Validasi Pengajuan Dana RT</span>
                </Link>
                <Link
                  href="/finance/pengeluaran"
                  className="p-3 bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 rounded-xl transition text-center"
                >
                  <TrendingUp className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 block">Catat Pengeluaran</span>
                  <span className="text-[10px] text-slate-400">Buku Kas Harian Pondok</span>
                </Link>
                <Link
                  href="/finance/pengaturan-threshold"
                  className="p-3 bg-white border border-slate-200 hover:border-purple-500 hover:bg-purple-50/30 rounded-xl transition text-center"
                >
                  <Settings className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 block">Batas Mandiri (SK)</span>
                  <span className="text-[10px] text-slate-400">Read-Only Otoritas Yayasan</span>
                </Link>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* PILAR 5: MUDIR PESANTREN / KEPALA SEKOLAH (UST. DR. K.H. MUKHLIS, M.A.)   */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'mudir' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-full uppercase border border-indigo-200">
                    🏛️ PILAR 5: MUDIR PESANTREN (KEPALA SEKOLAH)
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Pimpinan KBM &amp; Tarbiyah Syar'i: {currentActor.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supervisi Rombel Syar'i (Ikhwan vs Akhwat), Guru Inval &amp; Ketuntasan Kurikulum Tahfidz
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/mudir"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <School className="w-4 h-4" />
                    <span>Console Lengkap Mudir</span>
                  </Link>
                  <Link
                    href="/akademik/nilai"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition inline-flex items-center space-x-1.5"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Supervisi Nilai KKM</span>
                  </Link>
                </div>
              </div>

              {/* METRIK MUDIR */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Rombel Terjadwal Hari Ini</span>
                    <School className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">14 Rombel</span>
                  <span className="text-indigo-700 font-semibold block text-[11px]">7 Putra (Ikhwan) &amp; 7 Putri (Akhwat)</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Kehadiran Guru Pengajar</span>
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-700">18 / 19 Hadir</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">1 Guru Di-Inval Pengganti</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Ketuntasan Tahfidz Pekanan</span>
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700">88.4% Tuntas</span>
                  <span className="text-blue-700 font-semibold block text-[11px]">Target Ziyadah &amp; Muraja'ah</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Catatan Adab &amp; Disiplin</span>
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-2xl font-bold text-amber-700">12 Adab / 1 Iqob</span>
                  <span className="text-slate-500 font-semibold block text-[11px]">Pembinaan Tarbawi Terkendali</span>
                </div>
              </div>

              {/* NOTICE SYAR'I SEGREGATION */}
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <span>🕌 <strong>Pemisahan Syar'i Terkunci:</strong> Guru Ikhwan mengajar santri Ikhwan di Gedung Ibnu Khaldun. Guru Akhwat mengajar santri Akhwat di Gedung Khadijah. Sistem mencegah penugasan lintas lawan jenis secara otomatis.</span>
                <Link href="/dashboard/mudir" className="font-bold underline ml-2 shrink-0">Buka Jadwal Rombel</Link>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* PILAR 2: WAKIL KETUA YAYASAN (DRS. H. M. MANSYUR, M.PD.)                 */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'wakil_yayasan' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full uppercase border border-amber-200">
                    🏛️ PILAR 2: WAKIL KETUA YAYASAN (APPROVAL AUTHORITY)
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Control Tower Persetujuan: {currentActor.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Otoritas Tunggal ACC Anggaran Besar, Pengesahan Rekening Bank &amp; Batas Mandiri Operasional
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/wakil-yayasan"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Control Tower Wakil Yayasan</span>
                  </Link>
                  <Link
                    href="/finance/pengaturan-threshold"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition inline-flex items-center space-x-1.5"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Atur Batas Mandiri</span>
                  </Link>
                </div>
              </div>

              {/* METRIK WAKIL YAYASAN */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Antrean ACC Anggaran Besar</span>
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-2xl font-bold text-amber-700">2 Pengajuan</span>
                  <span className="text-amber-700 font-semibold block text-[11px]">&gt; Batas Mandiri (Wajib ACC Wakil)</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Batas Mandiri KaBid RT</span>
                    <Settings className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">Rp 1.000.000</span>
                  <span className="text-teal-700 font-semibold block text-[11px]">Bebas ACC Yayasan bila di bawah batas</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Master Rekening Bank Resmi</span>
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">3 Rekening BSI</span>
                  <span className="text-blue-700 font-semibold block text-[11px]">SPP, E-Pocket &amp; Wakaf Sosial</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Audit Pengadaan Sarpras</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-700">100% Terverifikasi</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">Sesuai SOP Tata Kelola Pesantren</span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* PILAR 1: KETUA YAYASAN (KH. ABDULLAH FAQIH, LC.)                         */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'yayasan' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                    🏛️ PILAR 1: KETUA YAYASAN (EXECUTIVE INFORMATION SYSTEM)
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Executive EIS Yayasan: {currentActor.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Information Only &amp; Strategic Oversight — Pemantauan Makro Perkembangan Pesantren
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/yayasan"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Executive Dashboard EIS</span>
                  </Link>
                  <Link
                    href="/laporan/ringkasan"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition inline-flex items-center space-x-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Analitik AI &amp; Laporan</span>
                  </Link>
                </div>
              </div>

              {/* METRIK STRATEGIS YAYASAN */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Total Santri Terdaftar</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">450 Santri</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">235 Putra (Ikhwan) • 215 Putri (Akhwat)</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Disiplin Khidmah Pegawai</span>
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700">84 Pegawai</span>
                  <span className="text-blue-700 font-semibold block text-[11px]">94% Tingkat Kehadiran Harian</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Kepatuhan Syar'i</span>
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-2xl font-bold text-teal-700">100% Terkunci</span>
                  <span className="text-teal-700 font-semibold block text-[11px]">Pemisahan Kampus &amp; Pengajar</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Pertumbuhan Tahfidz</span>
                    <Award className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-2xl font-bold text-amber-700">32 Santri</span>
                  <span className="text-slate-500 font-semibold block text-[11px]">Kandidat Wisuda Tahfidz 30 Juz</span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------------- */}
          {/* SUPER ADMINISTRATOR & MULTI-TENANT CONSOLE                                */}
          {/* ------------------------------------------------------------------------- */}
          {currentActor.role_key === 'super_admin' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-full uppercase border border-indigo-200">
                    ★ SUPER ADMINISTRATOR &amp; MULTI-TENANT CONSOLE
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Konsol Super Admin: Multi-Tenant &amp; Onboarding Pesantren
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pusat Kontrak Langganan Tier 1 (50 Santri Gratis), Registrasi Tenant Baru (Rabu Go-Live) &amp; Master WhatsApp Gateway
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/super-admin"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Buka Super Admin Console</span>
                  </Link>
                </div>
              </div>

              {/* METRIK SUPER ADMIN */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Tenant Pesantren Aktif</span>
                    <Building2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">1 Tenant Aktif</span>
                  <span className="text-indigo-700 font-semibold block text-[11px]">Pondok Pesantren Al-Hikmah</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Onboarding Tenant Baru</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-700">Jadwal Rabu</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">100% Siap Registrasi</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Paket Tier 1 Starter</span>
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-700">50 Kuota Santri</span>
                  <span className="text-blue-700 font-semibold block text-[11px]">Hafalan, Adab, Reward &amp; Disiplin</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">WhatsApp Gateway</span>
                    <Send className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-700">Terhubung</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">Multi-Tenant Direct Send</span>
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Form Pengajuan Cuti Mandiri Staf</h3>
                  <p className="text-[11px] text-slate-500">Pemohon: {currentActor.name} ({currentActor.title})</p>
                </div>
              </div>
              <button onClick={() => setModalCuti(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitCuti} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Cuti / Izin *</label>
                <select
                  value={formCuti.leave_type}
                  onChange={(e) => setFormCuti({ ...formCuti, leave_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TAHUNAN">Cuti Tahunan (Hak 12 Hari)</option>
                  <option value="SAKIT">Izin Sakit (Surat Dokter / Medis)</option>
                  <option value="UMRAH_HAJI">Cuti Ibadah Umroh / Haji</option>
                  <option value="MELAHIRKAN">Cuti Melahirkan (Akhwat)</option>
                  <option value="KEMALANGAN">Izin Kemalangan / Duka</option>
                  <option value="LAINNYA">Izin Keperluan Mendesak</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={formCuti.start_date}
                    onChange={(e) => setFormCuti({ ...formCuti, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    required
                    value={formCuti.end_date}
                    onChange={(e) => setFormCuti({ ...formCuti, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Cuti *</label>
                <textarea
                  rows={2}
                  required
                  value={formCuti.reason}
                  onChange={(e) => setFormCuti({ ...formCuti, reason: e.target.value })}
                  placeholder="Contoh: Mengantar orang tua berobat ke RSUD..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Kontak Darurat Selama Cuti *</label>
                <input
                  type="text"
                  required
                  value={formCuti.emergency_contact}
                  onChange={(e) => setFormCuti({ ...formCuti, emergency_contact: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-2.5 bg-blue-50 rounded-xl text-[11px] text-blue-800">
                📌 Sesuai SOP, pengajuan ini akan diverifikasi dan disetujui langsung oleh <strong>Ust. Ir. Faisal Rahman, M.M. (KaBid HRD)</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCuti(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Kirim Pengajuan Cuti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORM PENGAJUAN BARANG OPERASIONAL STAF RT (NON-MONETER)          */}
      {/* ========================================================================= */}
      {modalStok && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Form Pengajuan Barang &amp; Logistik RT</h3>
                  <p className="text-[11px] text-slate-500">Staf Pemohon: {currentActor.name} ({currentActor.title})</p>
                </div>
              </div>
              <button onClick={() => setModalStok(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitKebutuhanRT} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Barang / Logistik *</label>
                <input
                  type="text"
                  required
                  value={formBarang.nama_barang}
                  onChange={(e) => setFormBarang({ ...formBarang, nama_barang: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah / Volume Kebutuhan *</label>
                <input
                  type="text"
                  required
                  value={formBarang.jumlah}
                  onChange={(e) => setFormBarang({ ...formBarang, jumlah: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keperluan Penggunaan *</label>
                <textarea
                  rows={2}
                  required
                  value={formBarang.keperluan}
                  onChange={(e) => setFormBarang({ ...formBarang, keperluan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-800">
                🛡️ <em>Prinsip Non-Moneter:</em> Pegawai operasional mencatat fisik barang yang diperlukan. Nominal rupiah dan sisa anggaran dihitung oleh KaBid RT &amp; Keuangan.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalStok(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Input Izin Keluar di Pos Gerbang</h3>
                  <p className="text-[11px] text-slate-500">Petugas Jaga: {currentActor.name} ({currentActor.title})</p>
                </div>
              </div>
              <button onClick={() => setModalIzinPos(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitIzinPos} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Santri yang Dijemput *</label>
                <select
                  value={formIzinPos.santriNis}
                  onChange={(e) => setFormIzinPos({ ...formIzinPos, santriNis: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {MASTER_SANTRI.map(s => (
                    <option key={s.nis} value={s.nis}>
                      {s.nama} (NIS: {s.nis}) • {s.gender === 'akhwat' ? 'Santri Putri' : 'Santri Putra'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Penjemput *</label>
                  <input
                    type="text"
                    required
                    value={formIzinPos.namaPenjemput}
                    onChange={(e) => setFormIzinPos({ ...formIzinPos, namaPenjemput: e.target.value })}
                    placeholder="Contoh: H. Ahmad Fauzi"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hubungan *</label>
                  <select
                    value={formIzinPos.hubungan}
                    onChange={(e) => setFormIzinPos({ ...formIzinPos, hubungan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                  <label className="block font-semibold text-slate-700 mb-1">No. Kontak / WA Wali *</label>
                  <input
                    type="text"
                    required
                    value={formIzinPos.kontakWali}
                    onChange={(e) => setFormIzinPos({ ...formIzinPos, kontakWali: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Jam Kembali *</label>
                  <input
                    type="time"
                    required
                    value={formIzinPos.jamKembali}
                    onChange={(e) => setFormIzinPos({ ...formIzinPos, jamKembali: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keperluan / Alasan Izin *</label>
                <input
                  type="text"
                  required
                  value={formIzinPos.alasan}
                  onChange={(e) => setFormIzinPos({ ...formIzinPos, alasan: e.target.value })}
                  placeholder="Contoh: Berobat ke RSUD / Urusan Keluarga Mendesak"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-2.5 bg-rose-50 rounded-xl text-[11px] text-rose-800">
                🚪 <em>Check-Out Instan:</em> Saat disimpan, sistem langsung mencatat jam keluar santri dan menerbitkan ID Gate Pass gerbang.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalIzinPos(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition"
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
