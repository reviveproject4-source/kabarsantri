'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  FileText,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  Search,
  Filter,
  Plus,
  Eye,
  EyeOff,
  Lock,
  ChevronRight,
  TrendingUp,
  UserX,
  ArrowRight,
  FileCheck,
  Award,
  Send,
  Building,
  Key,
  DollarSign,
  X
} from 'lucide-react';

import {
  Employee,
  DepartmentUnit,
  LeaveRequest,
  DisciplinaryCase,
  PerformanceEvaluation,
  OffboardingClearance,
  HrAuditEntry,
  HrDashboardMetrics,
  SanctionLevel
} from '@/types/kepegawaian';

import {
  getEmployees,
  getEmployeeById,
  registerEmployee,
  archiveEmployee,
  getLeaveRequests,
  submitLeaveRequest,
  approveLeaveByHrd,
  rejectLeaveByHrd,
  getPerformanceEvaluations,
  submitPerformanceEvaluation,
  executeMutation,
  getOffboardings,
  initiateOffboarding,
  signClearanceDoor,
  getEmployeeContract,
  getHrMetrics,
  getAuditLogs,
  getDisciplinaryCases
} from '@/lib/kepegawaianStore';

import { 
  useActiveActor, 
  setActiveActorByRole 
} from '@/lib/sessionStore';

export default function KepegawaianPage() {
  const activeActor = useActiveActor();

  const [activeTab, setActiveTab] = useState<'overview' | 'direktori' | 'cuti' | 'kinerja' | 'disiplin' | 'offboarding' | 'audit'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Two-way sync: Read ?tab= from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['overview', 'direktori', 'cuti', 'kinerja', 'disiplin', 'offboarding', 'audit'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  const handleSwitchTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    }
  };

  // Live state from store
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [performances, setPerformances] = useState<PerformanceEvaluation[]>([]);
  const [offboardings, setOffboardings] = useState<OffboardingClearance[]>([]);
  const [disciplineCases, setDisciplineCases] = useState<DisciplinaryCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<HrAuditEntry[]>([]);
  const [metrics, setMetrics] = useState<HrDashboardMetrics>({
    total_employees: 0,
    active_employees: 0,
    on_leave_today: 0,
    suspended_employees: 0,
    contracts_expiring_soon: 0,
    active_disciplinary_cases: 0,
    pending_leave_approvals: 0,
    pending_offboarding_clearances: 0
  });

  // Modal states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modalNewEmployee, setModalNewEmployee] = useState(false);
  const [modalNewLeave, setModalNewLeave] = useState(false);
  const [modalNewPerformance, setModalNewPerformance] = useState(false);
  const [modalNewMutation, setModalNewMutation] = useState(false);
  const [modalNewOffboarding, setModalNewOffboarding] = useState(false);

  // Deteksi profil pegawai pemohon "Yang Bersangkutan"
  const activeEmployee = employees.find(e => 
    e.full_name.toLowerCase().includes(activeActor.name.toLowerCase()) || 
    activeActor.name.toLowerCase().includes(e.full_name.toLowerCase()) ||
    (activeActor.role_key === 'guru' && e.current_role_slug === 'guru')
  ) || employees[0];

  const isKaBidHrd = activeActor.role_key === 'hrd' || 
    activeActor.role_key === 'kepala_kepegawaian' || 
    activeActor.role_slug === 'kepala_kepegawaian' || 
    activeActor.role_key === 'yayasan' || 
    activeActor.role_key === 'wakil_yayasan';

  const handleOpenLeaveModal = () => {
    if (activeEmployee) {
      setFormLeave(prev => ({
        ...prev,
        employee_id: activeEmployee.id
      }));
    }
    setModalNewLeave(true);
  };

  // Form states
  const [formEmp, setFormEmp] = useState({
    tenant_id: 'tenant-pesantren-001',
    nip: '',
    nik: '',
    full_name: '',
    email: '',
    phone_number: '',
    gender: 'L' as 'L' | 'P',
    date_of_birth: '1990-01-01',
    join_date: new Date().toISOString().split('T')[0],
    lifecycle_status: 'ACTIVE' as const,
    current_department: 'PENDIDIKAN_KBM' as DepartmentUnit,
    current_position: '',
    current_role_slug: 'guru',
    supervisor_id: 'emp-mdr-001',
    supervisor_name: 'Dr. KH. Mahmud Ridwan, M.A.',
    job_description: ['Mengajar santri sesuai kurikulum madrasah', 'Mengisi jurnal pembelajaran KBM'],
    user_account_id: '',
    user_account_active: true,
    leave_allowance_annual: 12
  });

  const [formLeave, setFormLeave] = useState({
    employee_id: '',
    leave_type: 'TAHUNAN' as LeaveRequest['leave_type'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    total_days: 1,
    reason: '',
    substitute_staff_name: ''
  });

  const [formPerf, setFormPerf] = useState({
    period_name: 'Semester Ganjil 2026/2027',
    employee_id: '',
    supervisor_id: 'emp-hrd-001',
    supervisor_name: activeActor.name,
    attendance_score: 90,
    task_execution_score: 85,
    attitude_score: 90,
    mandatory_evidence_url: '',
    evidence_description: '',
    supervisor_feedback: ''
  });

  const [formMut, setFormMut] = useState({
    employee_id: '',
    new_department: 'PENDIDIKAN_KBM' as DepartmentUnit,
    new_position: '',
    new_role_slug: 'guru',
    new_supervisor_id: 'emp-mdr-001',
    new_supervisor_name: 'Dr. KH. Mahmud Ridwan, M.A.',
    sk_number: 'SK/YYS/2026/088',
    reason: 'PROMOTION' as const,
    effective_date: new Date().toISOString().split('T')[0]
  });

  const [formOff, setFormOff] = useState({
    employee_id: '',
    resignation_reason: 'RESIGNATION' as OffboardingClearance['resignation_reason'],
    effective_end_date: new Date().toISOString().split('T')[0]
  });

  const refreshData = () => {
    setEmployees(getEmployees());
    setLeaves(getLeaveRequests());
    setPerformances(getPerformanceEvaluations());
    setOffboardings(getOffboardings());
    setDisciplineCases(getDisciplinaryCases());
    setAuditLogs(getAuditLogs());
    setMetrics(getHrMetrics());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handler Register Employee (BR-HRD-001)
  const handleRegisterEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerEmployee(formEmp);
    if (res.success) {
      showToast('success', res.message);
      setModalNewEmployee(false);
      refreshData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handler Soft Archive Employee (BR-HRD-002)
  const handleArchiveEmployee = (empId: string, name: string) => {
    const reason = prompt(`Masukkan alasan pengarsipan untuk ${name}:`, 'Pensiun / Tidak aktif');
    if (!reason) return;

    const res = archiveEmployee(empId, activeActor.name, reason);
    if (res.success) {
      showToast('success', res.message);
      refreshData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handler Submit Leave (Diisi oleh Yang Bersangkutan)
  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLeave.employee_id) {
      showToast('error', 'Data pegawai pemohon (yang bersangkutan) tidak terdeteksi.');
      return;
    }

    const res = submitLeaveRequest(formLeave);
    if (res.success) {
      showToast('success', '✓ Permohonan cuti mandiri berhasil diajukan! Notifikasi diteruskan ke KaBid. Kepegawaian/HRD untuk verifikasi dan persetujuan.');
      setModalNewLeave(false);
      refreshData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handler Approve Leave mutlak oleh KaBid. Kepegawaian / HRD
  const handleApproveLeave = (leaveId: string) => {
    const approverTitle = (activeActor.role_key === 'hrd' || activeActor.role_key === 'kepala_kepegawaian' || activeActor.role_slug === 'kepala_kepegawaian') 
      ? 'KaBid. Kepegawaian' 
      : activeActor.title || 'KaBid. Kepegawaian/HRD';
    const approverName = `${activeActor.name} (${approverTitle})`;
    const res = approveLeaveByHrd(leaveId, approverName, 'Disetujui sah oleh KaBid. Kepegawaian/HRD. Kuota cuti mencukupi.');
    if (res.success) {
      showToast('success', `✓ Permohonan cuti resmi disetujui (ACC) oleh ${approverTitle}!`);
      refreshData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handler Reject Leave by KaBid. HRD
  const handleRejectLeave = (leaveId: string) => {
    const reason = prompt('Masukkan alasan penolakan cuti:', 'Kebutuhan operasional mendesak di pondok');
    if (!reason) return;

    const approverTitle = (activeActor.role_key === 'hrd' || activeActor.role_key === 'kepala_kepegawaian' || activeActor.role_slug === 'kepala_kepegawaian') 
      ? 'KaBid. Kepegawaian' 
      : activeActor.title;
    const res = rejectLeaveByHrd(leaveId, `${activeActor.name} (${approverTitle})`, reason);
    if (res.success) {
      showToast('success', 'Permohonan cuti telah ditolak oleh KaBid. Kepegawaian.');
      refreshData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handler Submit Performance Evaluation (BR-HRD-006)
  const handleSubmitPerformance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPerf.employee_id) {
      showToast('error', 'Pilih pegawai yang akan dinilai.');
      return;
    }

    const res = submitPerformanceEvaluation({
      ...formPerf,
      supervisor_name: activeActor.name
    });

    if (res.success) {
      showToast('success', res.message);
      setModalNewPerformance(false);
      refreshData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handler Execute Mutation (BR-HRD-012)
  const handleExecuteMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMut.employee_id) {
      showToast('error', 'Pilih pegawai yang akan dimutasi/promosi.');
      return;
    }

    const res = executeMutation({
      ...formMut,
      actor_name: activeActor.name
    });

    if (res.success) {
      showToast('success', res.message);
      setModalNewMutation(false);
      refreshData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handler Initiate Offboarding
  const handleInitiateOffboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOff.employee_id) {
      showToast('error', 'Pilih pegawai yang akan di-offboard.');
      return;
    }

    const res = initiateOffboarding({
      employee_id: formOff.employee_id,
      resignation_reason: formOff.resignation_reason,
      effective_end_date: formOff.effective_end_date,
      actor_name: activeActor.name
    });

    if (res.success) {
      showToast('success', res.message);
      setModalNewOffboarding(false);
      refreshData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handler Sign Clearance Door
  const handleSignDoor = (offId: string, door: 'RT' | 'FINANCE' | 'HRD' | 'IT') => {
    let officerName = activeActor.name;
    let noteDefault = 'Clearance diverifikasi lengkap.';

    if (door === 'RT') {
      officerName = activeActor.role_slug === 'kepala_rumah_tangga' ? activeActor.name : 'Pak Subandi, S.T. (Kepala RT)';
      noteDefault = 'Aset fasilitas, kunci, dan inventaris diserahkan tanpa kekurangan.';
    } else if (door === 'FINANCE') {
      officerName = ['keuangan', 'kepala_keuangan'].includes(activeActor.role_slug) ? activeActor.name : 'Ust. Ahmad Dahlan, S.E. (Bendahara)';
      noteDefault = 'Bebas tunggakan kasbon dan pertanggungjawaban kasir selesai.';
    } else if (door === 'IT') {
      officerName = 'Tim IT Pesantren';
      noteDefault = 'Kredensial dan akun login backoffice dinonaktifkan.';
    }

    const notes = prompt(`Konfirmasi Clearance [Pintu ${door}]: Masukkan catatan verifikasi:`, noteDefault);
    if (!notes) return;

    const res = signClearanceDoor({
      offboarding_id: offId,
      door,
      officer_name: officerName,
      notes
    });

    if (res.success) {
      showToast('success', res.message);
      refreshData();
    }
  };

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const matchSearch =
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.current_position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = deptFilter === 'ALL' || emp.current_department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6 text-slate-800">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all ${
            notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header Banner - Pilar 3 Design System */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-500/40">
              PILAR 3: HRD & KEPEGAWAIAN
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-950/60 text-teal-200 border border-teal-500/30">
              Domain: People Management & Approval Cuti
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Pusat Kepegawaian & SDM Pesantren</h1>
          <p className="text-xs text-emerald-200 mt-1">
            Pengelolaan Siklus Hidup Pegawai: Rekrutmen, Presensi, Approval Cuti Ber-notifikasi, Kinerja berbasis Bukti & Clearance 4-Pintu
          </p>
          <div className="mt-2.5 flex items-center space-x-2 text-[11px] text-emerald-100 flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/30">
              ✓ Otoritas Tunggal: Approval Cuti Pegawai & Asatidz
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900/60 border border-slate-600/40 text-slate-300">
              🔒 Batas: Dilarang Melihat Nominal Gaji (Wewenang Keuangan)
            </span>
          </div>
        </div>

        {/* Simulator Aktor Sesi Terhubung ke Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 flex flex-col gap-1.5 text-xs text-white shrink-0">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              Aktor Sesi Aktif:
            </span>
            <span className="font-mono text-[11px] text-emerald-200 font-bold">{activeActor.name}</span>
          </div>
          <select
            value={activeActor.role_key}
            onChange={e => setActiveActorByRole(e.target.value)}
            className="bg-emerald-950/90 border border-emerald-500/50 text-xs rounded-lg px-2.5 py-1.5 text-emerald-100 font-medium focus:outline-none cursor-pointer"
          >
            <option value="kepala_kepegawaian">Kepala HRD (Dilarang Lihat Gaji)</option>
            <option value="keuangan">Kepala Keuangan (Boleh Lihat Gaji)</option>
            <option value="mudir">Mudir KBM (Dilarang Lihat Gaji)</option>
            <option value="kepala_rumah_tangga">Kepala RT (Dilarang Lihat Gaji)</option>
            <option value="yayasan">Ketua Yayasan (Information Only)</option>
          </select>
        </div>
      </div>

      {/* Kartu Metrik KPI SDM */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Total Pegawai</div>
          <div className="text-2xl font-bold font-mono text-slate-800">{metrics.total_employees}</div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> {metrics.active_employees} Aktif
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Cuti Hari Ini</div>
          <div className="text-2xl font-bold font-mono text-amber-600">{metrics.on_leave_today}</div>
          <div className="text-[11px] text-slate-500">Notifikasi ke Unit</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Antrean ACC Cuti</div>
          <div className="text-2xl font-bold font-mono text-blue-600">{metrics.pending_leave_approvals}</div>
          <div className="text-[11px] text-blue-600 font-semibold">Wewenang HRD</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Kasus Disiplin</div>
          <div className="text-2xl font-bold font-mono text-rose-600">{metrics.active_disciplinary_cases}</div>
          <div className="text-[11px] text-rose-600 font-semibold">Teguran Aktif</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Pending Clearance</div>
          <div className="text-2xl font-bold font-mono text-orange-600">{metrics.pending_offboarding_clearances}</div>
          <div className="text-[11px] text-orange-600 font-semibold">4-Pintu Resign</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Kontrak Expiring</div>
          <div className="text-2xl font-bold font-mono text-purple-600">{metrics.contracts_expiring_soon}</div>
          <div className="text-[11px] text-purple-600 font-semibold">Masa PKWT</div>
        </div>
      </div>

      {/* Tabs Navigation (Klikabel & Persisten via URL Query - Responsive Mobile Swipe) */}
      <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold -mx-1 px-1 sm:mx-0 sm:px-0 select-none">
        <button
          onClick={() => handleSwitchTab('overview')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
            activeTab === 'overview'
              ? 'bg-white border-emerald-600 shadow-sm text-emerald-800 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <Building className="w-4 h-4 text-emerald-600" />
          <span>Overview & Struktur</span>
        </button>

        <button
          onClick={() => handleSwitchTab('direktori')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
            activeTab === 'direktori'
              ? 'bg-white border-emerald-600 shadow-sm text-emerald-800 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Direktori Pegawai</span>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
            {employees.length}
          </span>
        </button>

        <button
          onClick={() => handleSwitchTab('cuti')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
            activeTab === 'cuti'
              ? 'bg-white border-emerald-600 shadow-sm text-emerald-800 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Manajemen Cuti & Izin</span>
          {metrics.pending_leave_approvals > 0 && (
            <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
              {metrics.pending_leave_approvals}
            </span>
          )}
        </button>

        <button
          onClick={() => handleSwitchTab('kinerja')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
            activeTab === 'kinerja'
              ? 'bg-white border-emerald-600 shadow-sm text-emerald-800 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Kinerja Berbasis Bukti</span>
        </button>

        <button
          onClick={() => handleSwitchTab('disiplin')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
            activeTab === 'disiplin'
              ? 'bg-white border-emerald-600 shadow-sm text-emerald-800 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Disiplin & Sanksi</span>
        </button>

        <button
          onClick={() => handleSwitchTab('offboarding')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
            activeTab === 'offboarding'
              ? 'bg-white border-emerald-600 shadow-sm text-emerald-800 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <UserX className="w-4 h-4 text-rose-500" />
          <span>4-Pintu Clearance</span>
        </button>

        <button
          onClick={() => handleSwitchTab('audit')}
          className={`px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
            activeTab === 'audit'
              ? 'bg-white border-emerald-600 shadow-sm text-emerald-800 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-500" />
          <span>Audit Trail SDM</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: OVERVIEW & STRUKTUR TATA KELOLA
      ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Pembagian Wewenang Non-Negotiable */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Prinsip Pemisahan Tugas Organisasi (Segregation of Duties)</span>
              </h3>
              <div className="space-y-2.5 text-xs leading-relaxed">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <span className="font-bold text-emerald-900">1. Bagian Kepegawaian (HRD):</span>
                  <p className="text-slate-700 mt-0.5">
                    Mengelola <strong>ORANG</strong> (Data Master, Rekrutmen, Kontrak, Approval Cuti, Disiplin, dan Portofolio SDM). HRD <em>bukan</em> pengatur pekerjaan teknis harian.
                  </p>
                </div>
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                  <span className="font-bold text-blue-900">2. Mudir & Kepala Bagian (KBM / RT / Kesantrian):</span>
                  <p className="text-slate-700 mt-0.5">
                    Mengelola <strong>PEKERJAAN</strong> (Penugasan guru KBM & inval, teknisi RT, piket asrama, dan verifikasi bukti kerja).
                  </p>
                </div>
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <span className="font-bold text-amber-900">3. Bagian Keuangan:</span>
                  <p className="text-slate-700 mt-0.5">
                    Mengelola <strong>TRANSAKSI FINANSIAL & GAJI</strong> (Pencairan payroll, verifikasi bukti transfer, dan kerahasiaan nominal gaji).
                  </p>
                </div>
                <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl">
                  <span className="font-bold text-purple-900">4. Wakil Ketua Yayasan:</span>
                  <p className="text-slate-700 mt-0.5">
                    <strong>OPERATIONAL APPROVAL & CONTROL TOWER</strong> (Mengawasi operasional lintas divisi, persetujuan belanja, dan eskalasi).
                  </p>
                </div>
              </div>
            </div>

            {/* Box 2: Aturan Bisnis & Kebijakan User */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>Implementasi Kebijakan Khusus Pesantren</span>
              </h3>
              <div className="space-y-2.5 text-xs leading-relaxed">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Kebijakan Kerahasiaan Gaji (Section 7 Lock)</span>
                  </div>
                  <p className="text-slate-600">
                    Nominal gaji dan insentif hanya dapat diakses oleh <strong>Bagian Keuangan dan Pegawai yang bersangkutan</strong>. HRD, Kepala RT, Mudir, dan Ketua Yayasan diblokir dari melihat nominal kompensasi.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-blue-800 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Alur Cuti Ber-Notifikasi & Inval (User Decision #2)</span>
                  </div>
                  <p className="text-slate-600">
                    Approval cuti berada di <strong>HRD</strong>. Setelah disetujui, sistem otomatis mengirimkan <strong>notifikasi operasional ke Mudir / RT</strong> agar Mudir dapat menugaskan Guru Pengganti (Inval).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-purple-800 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Kinerja Wajib Bukti Kerja (BR-HRD-006)</span>
                  </div>
                  <p className="text-slate-600">
                    Kehadiran fisik (Presensi) <em>tidak otomatis</em> berarti kinerja berstatus BAIK. Penilaian supervisor wajib melampirkan link laporan hasil kerja nyata.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: DIREKTORI PEGAWAI & MASTER DATA
      ===================================================================== */}
      {activeTab === 'direktori' && (
        <div className="space-y-4">
          {/* Actions & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari NIP, nama, jabatan..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="ALL">Semua Unit</option>
                <option value="YAYASAN">Yayasan</option>
                <option value="KEPEGAWAIAN">Kepegawaian</option>
                <option value="KEUANGAN">Keuangan</option>
                <option value="PENDIDIKAN_KBM">Pendidikan KBM</option>
                <option value="KESANTRIAN">Kesantrian</option>
                <option value="RUMAH_TANGGA">Rumah Tangga</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setModalNewMutation(true)}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold px-3.5 py-2 rounded-xl text-slate-700 transition flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>Mutasi / Promosi</span>
              </button>
              <button
                onClick={() => setModalNewEmployee(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold px-4 py-2 rounded-xl text-white transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pegawai</span>
              </button>
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Pegawai / NIP</th>
                    <th className="py-3 px-4">Unit & Jabatan</th>
                    <th className="py-3 px-4">Atasan Langsung</th>
                    <th className="py-3 px-4">Status & Akun</th>
                    <th className="py-3 px-4 text-center">Sisa Cuti</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{emp.full_name}</div>
                        <div className="text-[11px] text-emerald-700 font-mono">{emp.nip}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{emp.current_position}</div>
                        <div className="text-[11px] text-slate-500">{emp.current_department}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700">{emp.supervisor_name || '—'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              emp.lifecycle_status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : emp.lifecycle_status === 'OFFBOARDING_IN_PROGRESS'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {emp.lifecycle_status}
                          </span>
                          {emp.user_account_active ? (
                            <span className="text-[10px] text-emerald-700 font-mono font-semibold">[Akun Aktif]</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">[Akun Nonaktif]</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="font-bold text-slate-800">{emp.leave_balance}</span> / {emp.leave_allowance_annual} hari
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-semibold transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" /> Detail Profil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: MANAJEMEN CUTI & IZIN (USER DECISION #2)
      ===================================================================== */}
      {activeTab === 'cuti' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>Permohonan Cuti Pegawai (Otoritas Tunggal ACC HRD)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Persetujuan (ACC) cuti adalah wewenang HRD. Atasan (Kepala RT/Mudir) menerima notifikasi otomatis untuk penataan tugas & guru pengganti (Inval).
              </p>
            </div>
            <button
              onClick={handleOpenLeaveModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold px-4 py-2 rounded-xl text-white transition flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" /> Ajukan Cuti Mandiri
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {leaves.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">Belum Ada Pengajuan Cuti</h3>
                <p className="text-xs text-slate-500">Seluruh pegawai dan asatidz aktif bertugas dan tidak ada permohonan cuti tertunda.</p>
              </div>
            ) : (
              leaves.map(lv => (
              <div
                key={lv.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 text-sm">{lv.employee_name}</span>
                    <span className="text-xs font-mono text-emerald-700 font-semibold">({lv.employee_nip})</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                      {lv.department}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        lv.status === 'APPROVED_BY_HRD'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : lv.status === 'SUBMITTED'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {lv.status === 'APPROVED_BY_HRD' 
                        ? '✓ DISETUJUI OLEH KABID HRD' 
                        : lv.status === 'SUBMITTED' 
                        ? 'MENUNGGU ACC KABID HRD' 
                        : 'DITOLAK'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Cuti <strong>{lv.leave_type}</strong> selama <strong>{lv.total_days} hari kerja</strong> ({lv.start_date} s/d {lv.end_date})
                  </p>
                  <p className="text-xs text-slate-500 italic">Alasan: {lv.reason}</p>

                  {lv.substitute_staff_name && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block font-semibold">
                      Petugas Pengganti / Inval: <strong>{lv.substitute_staff_name}</strong>
                    </div>
                  )}

                  {lv.status === 'APPROVED_BY_HRD' && (
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ACC Resmi oleh: {lv.hrd_approver_name || 'Kepala Bidang Kepegawaian (HRD)'}</span>
                    </div>
                  )}

                  {lv.operational_notified && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Notifikasi operasional telah terkirim ke atasan ({lv.supervisor_name}).</span>
                    </div>
                  )}
                </div>

                {/* Otoritas Persetujuan Mutlak KaBid. Kepegawaian / HRD */}
                {lv.status === 'SUBMITTED' && (
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {isKaBidHrd ? (
                      <>
                        <button
                          onClick={() => handleRejectLeave(lv.id)}
                          className="bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 text-xs font-semibold px-3 py-1.5 rounded-xl transition"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => handleApproveLeave(lv.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
                          title="Setujui permohonan cuti secara sah selaku KaBid. Kepegawaian"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ACC Cuti (KaBid. HRD)</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl font-medium flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Menunggu ACC KaBid. Kepegawaian</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: KINERJA BERBASIS BUKTI (BR-HRD-006)
      ===================================================================== */}
      {activeTab === 'kinerja' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Evaluasi Kinerja Berbasis Bukti Nyata (BR-HRD-006)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Penilaian wajib menyertakan link bukti/eviden hasil kerja nyata (SLA Tiket RT, Jurnal KBM, Laporan Asrama).
              </p>
            </div>
            <button
              onClick={() => setModalNewPerformance(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold px-4 py-2 rounded-xl text-white transition flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" /> Input Nilai Kinerja
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performances.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2 col-span-2">
                <Award className="w-8 h-8 text-blue-600 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">Belum Ada Evaluasi Kinerja</h3>
                <p className="text-xs text-slate-500">Evaluasi kinerja pegawai berbasis bukti kerja nyata akan ditampilkan di sini.</p>
              </div>
            ) : (
              performances.map(p => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{p.employee_name}</h3>
                    <p className="text-xs text-slate-500">{p.department} &bull; {p.period_name}</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold font-mono ${
                      p.final_grade === 'A_SANGAT_BAIK'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : p.final_grade === 'B_BAIK'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    Grade {p.final_grade.replace('_', ' ')} (Skor: {p.total_score})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Kehadiran (25%)</span>
                    <span className="font-bold text-slate-800">{p.attendance_score}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tugas (50%)</span>
                    <span className="font-bold text-slate-800">{p.task_execution_score}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Sikap (25%)</span>
                    <span className="font-bold text-slate-800">{p.attitude_score}</span>
                  </div>
                </div>

                {/* Evidence Link Section */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Bukti Eviden Wajib:
                    </span>
                    <a
                      href={p.mandatory_evidence_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-bold underline text-[10px]"
                    >
                      Buka Dokumen Bukti ↗
                    </a>
                  </div>
                  <p className="text-slate-600 text-[11px] italic">{p.evidence_description}</p>
                </div>

                <p className="text-xs text-slate-600 italic">
                  &ldquo;{p.supervisor_feedback}&rdquo; &mdash;{' '}
                  <span className="text-slate-800 font-medium not-italic">{p.supervisor_name}</span>
                </p>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: DISIPLIN & SANKSI
      ===================================================================== */}
      {activeTab === 'disiplin' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Pencatatan Pelanggaran & Kasus Disiplin Pegawai</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap penjatuhan sanksi (Teguran, SP1, SP2, SP3, Skorsing) terdokumentasi lengkap dengan tanggal kedaluwarsa sanksi.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {disciplineCases.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Kasus Disiplin</h3>
                <p className="text-xs text-slate-500">Seluruh pegawai dan asatidz memiliki rekam kedisiplinan yang bersih tanpa sanksi.</p>
              </div>
            ) : (
              disciplineCases.map(c => (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{c.employee_name}</span>
                      <span className="text-xs font-mono text-emerald-700">({c.employee_nip})</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                        {c.department}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono mt-0.5 block">{c.case_number} &bull; Insiden: {c.incident_date}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {c.sanction_level}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {c.description}
                </p>

                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                  <span>Pelapor: <strong>{c.reporter_name}</strong></span>
                  <span className="font-mono text-rose-600 font-semibold">Masa Berlaku Sanksi s/d: {c.sanction_expiry_date}</span>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 6: 4-PINTU CLEARANCE OFFBOARDING
      ===================================================================== */}
      {activeTab === 'offboarding' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-600" />
                <span>Alur 4-Pintu Clearance Offboarding (Pegawai Resign)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Status resmi tidak berubah menjadi OFFBOARDED sampai seluruh 4 pintu (RT, Keuangan, HRD, IT) ditandatangani dan akun dicabut.
              </p>
            </div>
            <button
              onClick={() => setModalNewOffboarding(true)}
              className="bg-rose-600 hover:bg-rose-700 text-xs font-bold px-4 py-2 rounded-xl text-white transition flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <UserX className="w-4 h-4" /> Inisiasi Offboarding
            </button>
          </div>

          <div className="space-y-4">
            {offboardings.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <UserCheck className="w-8 h-8 text-blue-600 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Pegawai Dalam Proses Offboarding</h3>
                <p className="text-xs text-slate-500">Semua akun pegawai aktif bertugas dan tidak ada proses perpisahan/resign berjalan.</p>
              </div>
            ) : (
              offboardings.map(off => (
              <div
                key={off.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      {off.employee_name}
                      <span className="text-xs font-mono text-emerald-700 font-semibold">({off.employee_nip})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {off.department} &bull; Efektif Berakhir: <strong>{off.effective_end_date}</strong> &bull; Alasan: {off.resignation_reason}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      off.all_cleared
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {off.all_cleared ? '✓ SEMUA PINTU TUNTAS (OFFBOARDED)' : 'PROSES CLEARANCE BERJALAN'}
                  </span>
                </div>

                {/* 4 Pintu Verification Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Pintu 1: RT (Aset & Fasilitas) */}
                  <div className={`p-3 rounded-xl border ${off.clearance_rt_completed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">1. Pintu RT (Aset)</span>
                      {off.clearance_rt_completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <p className="text-[11px] text-slate-600 mb-2">{off.clearance_rt_notes || 'Kunci, seragam, inventaris fisik'}</p>
                    {!off.clearance_rt_completed ? (
                      <button
                        onClick={() => handleSignDoor(off.id, 'RT')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-1.5 rounded-lg transition"
                      >
                        Tanda Tangan RT
                      </button>
                    ) : (
                      <div className="text-[10px] text-emerald-700 font-semibold">Oleh: {off.clearance_rt_officer}</div>
                    )}
                  </div>

                  {/* Pintu 2: Keuangan */}
                  <div className={`p-3 rounded-xl border ${off.clearance_finance_completed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">2. Pintu Keuangan</span>
                      {off.clearance_finance_completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <p className="text-[11px] text-slate-600 mb-2">{off.clearance_finance_notes || 'Bebas kasbon & kas operasional'}</p>
                    {!off.clearance_finance_completed ? (
                      <button
                        onClick={() => handleSignDoor(off.id, 'FINANCE')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-1.5 rounded-lg transition"
                      >
                        Tanda Tangan Keuangan
                      </button>
                    ) : (
                      <div className="text-[10px] text-emerald-700 font-semibold">Oleh: {off.clearance_finance_officer}</div>
                    )}
                  </div>

                  {/* Pintu 3: HRD */}
                  <div className={`p-3 rounded-xl border ${off.clearance_hrd_completed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">3. Pintu HRD</span>
                      {off.clearance_hrd_completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <p className="text-[11px] text-slate-600 mb-2">{off.clearance_hrd_notes || 'Exit interview & surat kerja'}</p>
                    {!off.clearance_hrd_completed ? (
                      <button
                        onClick={() => handleSignDoor(off.id, 'HRD')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-1.5 rounded-lg transition"
                      >
                        Tanda Tangan HRD
                      </button>
                    ) : (
                      <div className="text-[10px] text-emerald-700 font-semibold">Oleh: {off.clearance_hrd_officer}</div>
                    )}
                  </div>

                  {/* Pintu 4: IT (Cabut Akses) */}
                  <div className={`p-3 rounded-xl border ${off.clearance_it_completed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">4. Pintu IT (Cabut Akun)</span>
                      {off.clearance_it_completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                    </div>
                    <p className="text-[11px] text-slate-600 mb-2">{off.clearance_it_notes || 'Revoke login backoffice'}</p>
                    {!off.clearance_it_completed ? (
                      <button
                        onClick={() => handleSignDoor(off.id, 'IT')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-1.5 rounded-lg transition"
                      >
                        Cabut Akses & Nonaktifkan
                      </button>
                    ) : (
                      <div className="text-[10px] text-emerald-700 font-semibold">Oleh: {off.clearance_it_officer}</div>
                    )}
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 7: AUDIT TRAIL SDM
      ===================================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Audit Trail Tata Kelola Kepegawaian (Immutable Log)</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Aktor & Peran</th>
                  <th className="py-3 px-4">Aksi / Event</th>
                  <th className="py-3 px-4">Rincian Keputusan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(a.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{a.actor_name}</div>
                      <div className="text-[10px] text-slate-500">{a.actor_role}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {a.action}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {a.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: DETAIL PROFIL & VERIFIKASI GAJI (USER DECISION #1)
      ===================================================================== */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl my-8 text-slate-800">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedEmployee.full_name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  NIP: {selectedEmployee.nip} &bull; {selectedEmployee.current_position} ({selectedEmployee.current_department})
                </p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profil Ringkas */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[10px]">Email & Kontak:</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.email} ({selectedEmployee.phone_number})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Tanggal Bergabung:</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.join_date}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Atasan Langsung:</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.supervisor_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Status Akun Login:</span>
                <span className={selectedEmployee.user_account_active ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                  {selectedEmployee.user_account_active ? 'Aktif' : 'Dinonaktifkan'}
                </span>
              </div>
            </div>

            {/* Job Description (BR-HRD-005) */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Job Description & Tanggung Jawab</h4>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedEmployee.job_description.map((desc, idx) => (
                  <li key={idx}>{desc}</li>
                ))}
              </ul>
            </div>

            {/* KERAHASIAAN GAJI & KOMPENSASI (SECTION 7 LOCK & USER DECISION #1) */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-600" /> Informasi Kompensasi & Gaji Pokok
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Dilihat Sebagai: <strong className="text-slate-800">{activeActor.title} ({activeActor.role_slug})</strong>
                </span>
              </div>

              {(() => {
                const contractAuth = getEmployeeContract(selectedEmployee.id, activeActor.role_slug, activeActor.id);
                if (contractAuth.isAuthorized && contractAuth.contract) {
                  return (
                    <div className="space-y-2 text-xs pt-1">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                        <span className="text-emerald-900 font-medium">Gaji Pokok Bulanan:</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          Rp {contractAuth.contract.basic_salary.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-700">Tunjangan:</span>{' '}
                        {contractAuth.contract.allowances.map(a => `${a.title} (Rp ${a.amount.toLocaleString('id-ID')})`).join(', ')}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                        <Lock className="w-4 h-4" /> AKSES DITOLAK (SECTION 7 BUSINESS RULE LOCK)
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Nominal gaji dan insentif adalah wewenang <strong>Bagian Keuangan dan Pegawai yang bersangkutan</strong>. HRD, Kepala RT, Mudir, dan Ketua Yayasan <strong>tidak diizinkan</strong> melihat nominal kompensasi pegawai.
                      </p>
                      <div className="font-mono text-rose-800 font-semibold text-xs mt-1">
                        Status Nominal: {contractAuth.maskedSalary}
                      </div>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Riwayat Mutasi Jabatan (BR-HRD-012) */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Histori Jabatan & Promosi</h4>
              <div className="space-y-2 text-xs">
                {selectedEmployee.position_history.map(pos => (
                  <div key={pos.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{pos.job_title} ({pos.department})</div>
                      <div className="text-[10px] text-slate-500">Alasan: {pos.reason} {pos.sk_number && `• SK: ${pos.sk_number}`}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono self-center">{pos.start_date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <button
                onClick={() => handleArchiveEmployee(selectedEmployee.id, selectedEmployee.full_name)}
                className="text-rose-600 hover:text-rose-700 text-xs font-semibold"
              >
                Arsipkan Pegawai Ini (Soft-Archive)
              </button>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: TAMBAH PEGAWAI BARU (BR-HRD-001)
      ===================================================================== */}
      {modalNewEmployee && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <span>Pendaftaran Pegawai Baru Pesantren</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  BR-HRD-001: NIP dan NIK wajib unik. Sistem akan memvalidasi duplikasi identitas secara otomatis.
                </p>
              </div>
              <button onClick={() => setModalNewEmployee(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold">NIP Yayasan (Unik) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: NIP.RT.2026.015"
                    value={formEmp.nip}
                    onChange={e => setFormEmp({ ...formEmp, nip: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold">NIK KTP</label>
                  <input
                    type="text"
                    placeholder="16 digit NIK"
                    value={formEmp.nik}
                    onChange={e => setFormEmp({ ...formEmp, nik: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd."
                  value={formEmp.full_name}
                  onChange={e => setFormEmp({ ...formEmp, full_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold">Unit Departemen</label>
                  <select
                    value={formEmp.current_department}
                    onChange={e => setFormEmp({ ...formEmp, current_department: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="RUMAH_TANGGA">Rumah Tangga</option>
                    <option value="PENDIDIKAN_KBM">Pendidikan KBM</option>
                    <option value="KESANTRIAN">Kesantrian</option>
                    <option value="KEUANGAN">Keuangan</option>
                    <option value="KEPEGAWAIAN">Kepegawaian</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 font-semibold">Jabatan Pekerjaan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Guru Fiqih Wustha"
                    value={formEmp.current_position}
                    onChange={e => setFormEmp({ ...formEmp, current_position: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold">Email Resmi</label>
                  <input
                    type="email"
                    placeholder="nama@pesantren.id"
                    value={formEmp.email}
                    onChange={e => setFormEmp({ ...formEmp, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold">Nomor WhatsApp</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={formEmp.phone_number}
                    onChange={e => setFormEmp({ ...formEmp, phone_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNewEmployee(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: AJUKAN CUTI BARU (USER DECISION #2)
      ===================================================================== */}
      {modalNewLeave && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>Pengajuan Permohonan Cuti Pegawai</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Persetujuan (ACC) mutlak oleh HRD. Notifikasi diteruskan ke atasan untuk penataan tugas.
                </p>
              </div>
              <button onClick={() => setModalNewLeave(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-3 text-xs">
              {/* KARTU IDENTITAS PEMOHON MANDIRI (YANG BERSANGKUTAN) */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wide flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pegawai Pemohon (Yang Bersangkutan):</span>
                  </span>
                  <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                    Sisa Kuota: {activeEmployee?.leave_balance ?? 12} Hari Kerja
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{activeEmployee?.full_name || activeActor.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      NIP: {activeEmployee?.nip || '1984021001'} • Unit: {activeEmployee?.current_department || 'PENDIDIKAN_KBM'} ({activeEmployee?.current_position || 'Guru Mapel'})
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    Otentikasi Mandiri
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700 italic pt-0.5">
                  ✓ Formulir permohonan cuti resmi diajukan atas nama akun pegawai yang bersangkutan.
                </p>
                <input type="hidden" value={formLeave.employee_id} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold">Jenis Cuti</label>
                  <select
                    value={formLeave.leave_type}
                    onChange={e => setFormLeave({ ...formLeave, leave_type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="TAHUNAN">Cuti Tahunan</option>
                    <option value="SAKIT">Sakit</option>
                    <option value="MELAHIRKAN">Melahirkan</option>
                    <option value="UMROH_HAJI">Umroh / Haji</option>
                    <option value="PENTING">Keperluan Penting</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 font-semibold">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={formLeave.start_date}
                    onChange={e => setFormLeave({ ...formLeave, start_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold">Durasi (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formLeave.total_days}
                    onChange={e => setFormLeave({ ...formLeave, total_days: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold">Alasan Cuti *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan alasan permohonan cuti..."
                  value={formLeave.reason}
                  onChange={e => setFormLeave({ ...formLeave, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold">Petugas Pengganti Sementara (Inval)</label>
                <input
                  type="text"
                  placeholder="Contoh: Ust. Lukman Hakim (Cover KBM)"
                  value={formLeave.substitute_staff_name}
                  onChange={e => setFormLeave({ ...formLeave, substitute_staff_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNewLeave(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Kirim Permohonan Cuti Mandiri ke KaBid. HRD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: INPUT NILAI KINERJA (BR-HRD-006)
      ===================================================================== */}
      {modalNewPerformance && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Input Evaluasi Kinerja Berbasis Eviden</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  BR-HRD-006: Wajib melampirkan link evidence nyata hasil kerja.
                </p>
              </div>
              <button onClick={() => setModalNewPerformance(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPerformance} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold">Pegawai yang Dinilai *</label>
                <select
                  required
                  value={formPerf.employee_id}
                  onChange={e => setFormPerf({ ...formPerf, employee_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="">-- Pilih Pegawai --</option>
                  {employees.filter(e => e.lifecycle_status === 'ACTIVE').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.nip}) - {emp.current_position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold">Skor Presensi (25%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formPerf.attendance_score}
                    onChange={e => setFormPerf({ ...formPerf, attendance_score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold">Skor Tugas (50%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formPerf.task_execution_score}
                    onChange={e => setFormPerf({ ...formPerf, task_execution_score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold">Skor Sikap (25%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formPerf.attitude_score}
                    onChange={e => setFormPerf({ ...formPerf, attitude_score: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold">Link URL Bukti Kerja Nyata (Mandatory BR-HRD-006) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://kabarsantri.id/docs/laporan-kbm-2026.pdf"
                  value={formPerf.mandatory_evidence_url}
                  onChange={e => setFormPerf({ ...formPerf, mandatory_evidence_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold">Deskripsi Bukti Kerja</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Menyelesaikan 45 jam KBM dan rekap nilai 100% tepat waktu"
                  value={formPerf.evidence_description}
                  onChange={e => setFormPerf({ ...formPerf, evidence_description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold">Catatan Evaluasi Supervisor</label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan catatan perbaikan dan apresiasi..."
                  value={formPerf.supervisor_feedback}
                  onChange={e => setFormPerf({ ...formPerf, supervisor_feedback: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNewPerformance(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Nilai Berbasis Bukti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: FORM MUTASI / PROMOSI (BR-HRD-012)
      ===================================================================== */}
      {modalNewMutation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  <span>Mutasi / Promosi Jabatan Pegawai</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  BR-HRD-012: ID dan NIP pegawai dipertahankan konsisten, riwayat jabatan dicatat.
                </p>
              </div>
              <button onClick={() => setModalNewMutation(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteMutation} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold">Pegawai yang Dimutasi / Promosi *</label>
                <select
                  required
                  value={formMut.employee_id}
                  onChange={e => setFormMut({ ...formMut, employee_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="">-- Pilih Pegawai --</option>
                  {employees.filter(e => e.lifecycle_status === 'ACTIVE').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.nip}) - Jabatan Sekarang: {emp.current_position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold">Departemen Baru</label>
                  <select
                    value={formMut.new_department}
                    onChange={e => setFormMut({ ...formMut, new_department: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="RUMAH_TANGGA">Rumah Tangga</option>
                    <option value="PENDIDIKAN_KBM">Pendidikan KBM</option>
                    <option value="KESANTRIAN">Kesantrian</option>
                    <option value="KEUANGAN">Keuangan</option>
                    <option value="KEPEGAWAIAN">Kepegawaian</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 font-semibold">Jabatan Baru *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Koordinator Lab & IT"
                    value={formMut.new_position}
                    onChange={e => setFormMut({ ...formMut, new_position: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold">Nomor SK Yayasan *</label>
                  <input
                    type="text"
                    required
                    value={formMut.sk_number}
                    onChange={e => setFormMut({ ...formMut, sk_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold">Tanggal Berlaku</label>
                  <input
                    type="date"
                    required
                    value={formMut.effective_date}
                    onChange={e => setFormMut({ ...formMut, effective_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNewMutation(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Terbitkan Mutasi / Promosi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: INISIASI OFFBOARDING (BR-HRD-013)
      ===================================================================== */}
      {modalNewOffboarding && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-rose-600" />
                  <span>Inisiasi Alur 4-Pintu Clearance Resign</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  BR-HRD-013: Status pegawai menjadi OFFBOARDING_IN_PROGRESS sampai 4 pintu ditandatangani.
                </p>
              </div>
              <button onClick={() => setModalNewOffboarding(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateOffboarding} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold">Pilih Pegawai Resign *</label>
                <select
                  required
                  value={formOff.employee_id}
                  onChange={e => setFormOff({ ...formOff, employee_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="">-- Pilih Pegawai --</option>
                  {employees.filter(e => e.lifecycle_status === 'ACTIVE').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.nip}) - {emp.current_department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-semibold">Alasan Berhenti</label>
                  <select
                    value={formOff.resignation_reason}
                    onChange={e => setFormOff({ ...formOff, resignation_reason: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="RESIGNATION">Pengunduran Diri (Resign Sukarela)</option>
                    <option value="CONTRACT_EXPIRY">Habis Masa Kontrak PKWT</option>
                    <option value="TERMINATION">Pemutusan Hubungan Kerja (PHK/Disiplin)</option>
                    <option value="RETIREMENT">Pensiun</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 font-semibold">Tanggal Efektif Berakhir</label>
                  <input
                    type="date"
                    required
                    value={formOff.effective_end_date}
                    onChange={e => setFormOff({ ...formOff, effective_end_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 mt-1 focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNewOffboarding(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Mulai Alur 4-Pintu Clearance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
