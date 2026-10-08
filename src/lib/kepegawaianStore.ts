/**
 * DOMAIN STORE: KEPEGAWAIAN (HRD) & EMPLOYEE GOVERNANCE
 * KabarSantri V2
 * Single Source of Truth for employees, contracts, leave, discipline,
 * evidence-based performance appraisals, and 4-way offboarding clearance.
 */

import {
  Employee,
  EmployeeLifecycleStatus,
  DepartmentUnit,
  EmploymentContract,
  LeaveRequest,
  DisciplinaryCase,
  PerformanceEvaluation,
  OffboardingClearance,
  HrAuditEntry,
  HrDashboardMetrics,
  PositionHistory,
  SanctionLevel
} from '../types/kepegawaian';
import { syncSubstituteTeacherToSessions, isTenantMode } from './sharedDataStore';

export type { LeaveRequest, Employee, DepartmentUnit, EmploymentContract } from '../types/kepegawaian';

// ============================================================================
// DEFAULT SEED EMPLOYEES (14 REALISTIC PESANTREN STAFF)
// ============================================================================

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-yys-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.YYS.2015.001',
    nik: '3201011001700001',
    full_name: 'KH. Abdullah Faqih, Lc.',
    email: 'kh.faqih@pesantren.id',
    phone_number: '08112233001',
    gender: 'L',
    date_of_birth: '1970-01-10',
    join_date: '2015-07-01',
    lifecycle_status: 'ACTIVE',
    current_department: 'YAYASAN',
    current_position: 'Ketua Yayasan Pesantren',
    current_role_slug: 'ketua_yayasan',
    job_description: [
      'Menetapkan kebijakan strategis institusi pesantren',
      'Mengawasi keselarasan visi dakwah dan tata kelola yayasan',
      'Menerima laporan konsolidasi eksekutif'
    ],
    user_account_id: 'usr-yys-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 12,
    position_history: [
      {
        id: 'pos-001',
        employee_id: 'emp-yys-001',
        department: 'YAYASAN',
        job_title: 'Ketua Yayasan Pesantren',
        role_slug: 'ketua_yayasan',
        start_date: '2015-07-01',
        reason: 'INITIAL_APPOINTMENT',
        sk_number: 'SK/YYS/2015/001'
      }
    ],
    created_at: '2015-07-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-yys-002',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.YYS.2018.002',
    nik: '3201011503750002',
    full_name: 'Drs. H. M. Mansyur, M.Pd.',
    email: 'mansyur@pesantren.id',
    phone_number: '08112233002',
    gender: 'L',
    date_of_birth: '1975-03-15',
    join_date: '2018-01-15',
    lifecycle_status: 'ACTIVE',
    current_department: 'YAYASAN',
    current_position: 'Wakil Ketua Yayasan (Pengawas Operasional)',
    current_role_slug: 'wakil_yayasan',
    supervisor_id: 'emp-yys-001',
    supervisor_name: 'KH. Abdullah Faqih, Lc.',
    job_description: [
      'Mengawasi operasional harian seluruh unit pesantren (Control Tower)',
      'Menangani eskalasi SLA dan konflik lintas divisi',
      'Menyetujui perizinan dan usulan belanja di atas batas wewenang unit'
    ],
    user_account_id: 'usr-yys-02',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 10,
    position_history: [
      {
        id: 'pos-002',
        employee_id: 'emp-yys-002',
        department: 'YAYASAN',
        job_title: 'Wakil Ketua Yayasan',
        role_slug: 'wakil_yayasan',
        supervisor_id: 'emp-yys-001',
        supervisor_name: 'KH. Abdullah Faqih, Lc.',
        start_date: '2018-01-15',
        reason: 'INITIAL_APPOINTMENT',
        sk_number: 'SK/YYS/2018/010'
      }
    ],
    created_at: '2018-01-15T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-hrd-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.HRD.2019.003',
    nik: '3201012005820003',
    full_name: 'Ust. Ir. Faisal Rahman, M.M.',
    email: 'faisal.hrd@pesantren.id',
    phone_number: '08112233003',
    gender: 'L',
    date_of_birth: '1982-05-20',
    join_date: '2019-06-01',
    lifecycle_status: 'ACTIVE',
    current_department: 'KEPEGAWAIAN',
    current_position: 'Kepala Bagian Kepegawaian & SDM (HRD)',
    current_role_slug: 'kepala_kepegawaian',
    supervisor_id: 'emp-yys-002',
    supervisor_name: 'Drs. H. M. Mansyur, M.Pd.',
    job_description: [
      'Mengelola siklus hidup pegawai (rekrutmen hingga offboarding)',
      'Memvalidasi dan memberikan ACC permohonan cuti pegawai',
      'Melakukan investigasi disiplin dan kalibrasi penilaian kinerja pegawai'
    ],
    user_account_id: 'usr-hrd-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 9,
    position_history: [
      {
        id: 'pos-003',
        employee_id: 'emp-hrd-001',
        department: 'KEPEGAWAIAN',
        job_title: 'Kepala Bagian Kepegawaian',
        role_slug: 'kepala_kepegawaian',
        supervisor_id: 'emp-yys-002',
        supervisor_name: 'Drs. H. M. Mansyur, M.Pd.',
        start_date: '2019-06-01',
        reason: 'INITIAL_APPOINTMENT',
        sk_number: 'SK/YYS/2019/045'
      }
    ],
    created_at: '2019-06-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-keu-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.KEU.2018.004',
    nik: '3201011212850004',
    full_name: 'Ust. Ahmad Dahlan, S.E.',
    email: 'dahlan.keuangan@pesantren.id',
    phone_number: '08112233004',
    gender: 'L',
    date_of_birth: '1985-12-12',
    join_date: '2018-08-01',
    lifecycle_status: 'ACTIVE',
    current_department: 'KEUANGAN',
    current_position: 'Kepala Bagian Keuangan & Bendahara',
    current_role_slug: 'kepala_keuangan',
    supervisor_id: 'emp-yys-002',
    supervisor_name: 'Drs. H. M. Mansyur, M.Pd.',
    job_description: [
      'Mengelola kas operasional dan rekening bank yayasan',
      'Melakukan verifikasi bukti pembayaran dan eksekusi transfer dana',
      'Memproses pencairan gaji (payroll) dan verifikasi bebas kasbon offboarding'
    ],
    user_account_id: 'usr-keu-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 11,
    position_history: [
      {
        id: 'pos-004',
        employee_id: 'emp-keu-001',
        department: 'KEUANGAN',
        job_title: 'Kepala Bagian Keuangan',
        role_slug: 'kepala_keuangan',
        supervisor_id: 'emp-yys-002',
        supervisor_name: 'Drs. H. M. Mansyur, M.Pd.',
        start_date: '2018-08-01',
        reason: 'INITIAL_APPOINTMENT',
        sk_number: 'SK/YYS/2018/088'
      }
    ],
    created_at: '2018-08-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-mdr-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.MDR.2017.005',
    nik: '3201010508780005',
    full_name: 'Dr. KH. Mahmud Ridwan, M.A.',
    email: 'mudir@pesantren.id',
    phone_number: '08112233005',
    gender: 'L',
    date_of_birth: '1978-08-05',
    join_date: '2017-07-01',
    lifecycle_status: 'ACTIVE',
    current_department: 'PENDIDIKAN_KBM',
    current_position: 'Mudir Pesantren & Kepala Madrasah Formal',
    current_role_slug: 'mudir',
    supervisor_id: 'emp-yys-002',
    supervisor_name: 'Drs. H. M. Mansyur, M.Pd.',
    job_description: [
      'Memimpin kurikulum dan seluruh proses KBM madrasah formal',
      'Mengawasi jam mengajar dan evaluasi kinerja guru',
      'Menerima notifikasi ketidakhadiran/cuti guru untuk penataan guru pengganti'
    ],
    user_account_id: 'usr-mdr-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 8,
    position_history: [
      {
        id: 'pos-005',
        employee_id: 'emp-mdr-001',
        department: 'PENDIDIKAN_KBM',
        job_title: 'Mudir Pesantren',
        role_slug: 'mudir',
        supervisor_id: 'emp-yys-002',
        supervisor_name: 'Drs. H. M. Mansyur, M.Pd.',
        start_date: '2017-07-01',
        reason: 'INITIAL_APPOINTMENT',
        sk_number: 'SK/YYS/2017/021'
      }
    ],
    created_at: '2017-07-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-kes-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.KES.2019.006',
    nik: '3201011804830006',
    full_name: 'Ust. Hasan Basri, S.Pd.I.',
    email: 'hasan.kesantrian@pesantren.id',
    phone_number: '08112233006',
    gender: 'L',
    date_of_birth: '1983-04-18',
    join_date: '2019-07-01',
    lifecycle_status: 'ACTIVE',
    current_department: 'KESANTRIAN',
    current_position: 'Kepala Bagian Kesantrian & Asrama',
    current_role_slug: 'kepala_kesantrian',
    supervisor_id: 'emp-yys-002',
    supervisor_name: 'Drs. H. M. Mansyur, M.Pd.',
    job_description: [
      'Mengawasi kedisiplinan santri, kamar asrama, dan perizinan gerbang',
      'Mengawasi jadwal piket musyrif asrama',
      'Menerima notifikasi cuti musyrif untuk jadwal rotasi jaga malam'
    ],
    user_account_id: 'usr-kes-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 10,
    position_history: [
      {
        id: 'pos-006',
        employee_id: 'emp-kes-001',
        department: 'KESANTRIAN',
        job_title: 'Kepala Bagian Kesantrian',
        role_slug: 'kepala_kesantrian',
        supervisor_id: 'emp-yys-002',
        supervisor_name: 'Drs. H. M. Mansyur, M.Pd.',
        start_date: '2019-07-01',
        reason: 'INITIAL_APPOINTMENT',
        sk_number: 'SK/YYS/2019/077'
      }
    ],
    created_at: '2019-07-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-rt-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.RT.2020.007',
    nik: '3201012209800007',
    full_name: 'Pak Subandi, S.T.',
    email: 'subandi.rt@pesantren.id',
    phone_number: '08112233007',
    gender: 'L',
    date_of_birth: '1980-09-22',
    join_date: '2020-02-01',
    lifecycle_status: 'ACTIVE',
    current_department: 'RUMAH_TANGGA',
    current_position: 'Kepala Bagian Rumah Tangga & Sarpras',
    current_role_slug: 'kepala_rumah_tangga',
    supervisor_id: 'emp-yys-002',
    supervisor_name: 'Drs. H. M. Mansyur, M.Pd.',
    job_description: [
      'Mengatur penugasan teknisi, dapur sentral, laundry, dan satpam',
      'Memantau penyelesaian tiket service request dan perawatan preventif fasilitas',
      'Menerima notifikasi cuti staf RT untuk re-alokasi jadwal piket teknis',
      'Melakukan clearance fisik aset pesantren saat staf resign'
    ],
    user_account_id: 'usr-rt-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 7,
    position_history: [
      {
        id: 'pos-007',
        employee_id: 'emp-rt-001',
        department: 'RUMAH_TANGGA',
        job_title: 'Kepala Bagian Rumah Tangga',
        role_slug: 'kepala_rumah_tangga',
        supervisor_id: 'emp-yys-002',
        supervisor_name: 'Drs. H. M. Mansyur, M.Pd.',
        start_date: '2020-02-01',
        reason: 'INITIAL_APPOINTMENT',
        sk_number: 'SK/YYS/2020/014'
      }
    ],
    created_at: '2020-02-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-msr-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.MSR.2021.008',
    nik: '3201011406930008',
    full_name: 'Ust. Hamzah al-Bantani',
    email: 'hamzah.musyrif@pesantren.id',
    phone_number: '08112233008',
    gender: 'L',
    date_of_birth: '1993-06-14',
    join_date: '2021-08-01',
    lifecycle_status: 'ACTIVE',
    current_department: 'KESANTRIAN',
    current_position: 'Musyrif Asrama Putra Utsman & Pembimbing Tahfidz',
    current_role_slug: 'musyrif',
    supervisor_id: 'emp-kes-001',
    supervisor_name: 'Ust. Hasan Basri, S.Pd.I.',
    job_description: [
      'Membina santri asrama putra dan memandu setoran tahfidz Al-Qur’an',
      'Menjaga ketertiban shalat berjamaah 5 waktu di masjid'
    ],
    user_account_id: 'usr-msr-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 10,
    position_history: [
      {
        id: 'pos-008',
        employee_id: 'emp-msr-001',
        department: 'KESANTRIAN',
        job_title: 'Musyrif Asrama Putra',
        role_slug: 'musyrif',
        supervisor_id: 'emp-kes-001',
        supervisor_name: 'Ust. Hasan Basri, S.Pd.I.',
        start_date: '2021-08-01',
        reason: 'INITIAL_APPOINTMENT'
      }
    ],
    created_at: '2021-08-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-gru-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.GRU.2021.009',
    nik: '3201012511900009',
    full_name: 'Ust. Lukman Hakim, M.Kom.',
    email: 'lukman.guru@pesantren.id',
    phone_number: '08112233009',
    gender: 'L',
    date_of_birth: '1990-11-25',
    join_date: '2021-07-15',
    lifecycle_status: 'ACTIVE',
    current_department: 'PENDIDIKAN_KBM',
    current_position: 'Guru TIK & Penanggung Jawab Lab Komputer',
    current_role_slug: 'guru',
    supervisor_id: 'emp-mdr-001',
    supervisor_name: 'Dr. KH. Mahmud Ridwan, M.A.',
    job_description: [
      'Melaksanakan pembelajaran TIK untuk kelas X, XI, XII',
      'Menginput rekap nilai ujian KBM ke sistem akademik',
      'Merawat laboratorium komputer madrasah'
    ],
    user_account_id: 'usr-gru-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 12,
    position_history: [
      {
        id: 'pos-009',
        employee_id: 'emp-gru-001',
        department: 'PENDIDIKAN_KBM',
        job_title: 'Guru TIK',
        role_slug: 'guru',
        supervisor_id: 'emp-mdr-001',
        supervisor_name: 'Dr. KH. Mahmud Ridwan, M.A.',
        start_date: '2021-07-15',
        reason: 'INITIAL_APPOINTMENT'
      }
    ],
    created_at: '2021-07-15T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-gru-002',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.GRU.2022.010',
    nik: '3201010307940010',
    full_name: 'Usth. Fatimah Az-Zahra, S.Pd.',
    email: 'fatimah.guru@pesantren.id',
    phone_number: '08112233010',
    gender: 'P',
    date_of_birth: '1994-07-03',
    join_date: '2022-01-10',
    lifecycle_status: 'ACTIVE',
    current_department: 'PENDIDIKAN_KBM',
    current_position: 'Guru Bahasa Arab & Pembina Bahasa Asrama Putri',
    current_role_slug: 'guru',
    supervisor_id: 'emp-mdr-001',
    supervisor_name: 'Dr. KH. Mahmud Ridwan, M.A.',
    job_description: [
      'Mengajar Bahasa Arab dan Nahwu-Shorof tingkat tsanawiyah/aliyah',
      'Mengelola program pekan muhadatsah bahasa Arab'
    ],
    user_account_id: 'usr-gru-02',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 6,
    position_history: [
      {
        id: 'pos-010',
        employee_id: 'emp-gru-002',
        department: 'PENDIDIKAN_KBM',
        job_title: 'Guru Bahasa Arab',
        role_slug: 'guru',
        supervisor_id: 'emp-mdr-001',
        supervisor_name: 'Dr. KH. Mahmud Ridwan, M.A.',
        start_date: '2022-01-10',
        reason: 'INITIAL_APPOINTMENT'
      }
    ],
    created_at: '2022-01-10T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-tek-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.TEK.2022.011',
    nik: '3201011910880011',
    full_name: 'Pak Rusli Effendi',
    email: 'rusli.teknisi@pesantren.id',
    phone_number: '08112233011',
    gender: 'L',
    date_of_birth: '1988-10-19',
    join_date: '2022-03-01',
    lifecycle_status: 'ACTIVE',
    current_department: 'RUMAH_TANGGA',
    current_position: 'Teknisi Listrik & Pendingin AC',
    current_role_slug: 'teknisi_rt',
    supervisor_id: 'emp-rt-001',
    supervisor_name: 'Pak Subandi, S.T.',
    job_description: [
      'Menangani tiket perbaikan listrik, genset, dan AC ruangan pesantren',
      'Melakukan inspeksi pemeliharaan rutin mingguan fasilitas fisik'
    ],
    user_account_id: 'usr-tek-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 11,
    position_history: [
      {
        id: 'pos-011',
        employee_id: 'emp-tek-001',
        department: 'RUMAH_TANGGA',
        job_title: 'Teknisi Listrik & AC',
        role_slug: 'teknisi_rt',
        supervisor_id: 'emp-rt-001',
        supervisor_name: 'Pak Subandi, S.T.',
        start_date: '2022-03-01',
        reason: 'INITIAL_APPOINTMENT'
      }
    ],
    created_at: '2022-03-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-dpr-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.DPR.2020.012',
    nik: '3201011102760012',
    full_name: 'Pak Maryono',
    email: 'maryono.dapur@pesantren.id',
    phone_number: '08112233012',
    gender: 'L',
    date_of_birth: '1976-02-11',
    join_date: '2020-06-01',
    lifecycle_status: 'ACTIVE',
    current_department: 'RUMAH_TANGGA',
    current_position: 'Kepala Koki Dapur Sentral Santri',
    current_role_slug: 'koki_rt',
    supervisor_id: 'emp-rt-001',
    supervisor_name: 'Pak Subandi, S.T.',
    job_description: [
      'Mengolah konsumsi makan 3 kali sehari bagi 500 santri & asatidz',
      'Mengawasi standar sanitasi dan pengeluaran bahan pangan gudang dapur'
    ],
    user_account_id: 'usr-dpr-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 8,
    position_history: [
      {
        id: 'pos-012',
        employee_id: 'emp-dpr-001',
        department: 'RUMAH_TANGGA',
        job_title: 'Kepala Koki Dapur Sentral',
        role_slug: 'koki_rt',
        supervisor_id: 'emp-rt-001',
        supervisor_name: 'Pak Subandi, S.T.',
        start_date: '2020-06-01',
        reason: 'INITIAL_APPOINTMENT'
      }
    ],
    created_at: '2020-06-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-lnd-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.LND.2021.013',
    nik: '3201010408840013',
    full_name: 'Ibu Sumiati',
    email: 'sumiati.laundry@pesantren.id',
    phone_number: '08112233013',
    gender: 'P',
    date_of_birth: '1984-08-04',
    join_date: '2021-02-01',
    lifecycle_status: 'ACTIVE',
    current_department: 'RUMAH_TANGGA',
    current_position: 'Koordinator Unit Laundry Sentral Pesantren',
    current_role_slug: 'laundry_rt',
    supervisor_id: 'emp-rt-001',
    supervisor_name: 'Pak Subandi, S.T.',
    job_description: [
      'Mengelola alur cuci, jemur, dan setrika seragam santri per asrama',
      'Memantau stok deterjen, pelembut pakaian, dan perawatan mesin cuci'
    ],
    user_account_id: 'usr-lnd-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 10,
    position_history: [
      {
        id: 'pos-013',
        employee_id: 'emp-lnd-001',
        department: 'RUMAH_TANGGA',
        job_title: 'Koordinator Laundry',
        role_slug: 'laundry_rt',
        supervisor_id: 'emp-rt-001',
        supervisor_name: 'Pak Subandi, S.T.',
        start_date: '2021-02-01',
        reason: 'INITIAL_APPOINTMENT'
      }
    ],
    created_at: '2021-02-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'emp-sec-001',
    tenant_id: 'tenant-pesantren-001',
    nip: 'NIP.SEC.2020.014',
    nik: '3201011505860014',
    full_name: 'Pak Bambang Sutrisno',
    email: 'bambang.satpam@pesantren.id',
    phone_number: '08112233014',
    gender: 'L',
    date_of_birth: '1986-05-15',
    join_date: '2020-09-01',
    lifecycle_status: 'ACTIVE',
    current_department: 'RUMAH_TANGGA',
    current_position: 'Komandan Regu Keamanan & Penjaga Pos Gerbang',
    current_role_slug: 'satpam_rt',
    supervisor_id: 'emp-rt-001',
    supervisor_name: 'Pak Subandi, S.T.',
    job_description: [
      'Menjaga keamanan pos gerbang utama 24 jam (pembagian 3 shift)',
      'Memeriksa QR Gate Pass santri yang keluar/masuk pesantren',
      'Melakukan patroli keliling lingkungan asrama dan gedung'
    ],
    user_account_id: 'usr-sec-01',
    user_account_active: true,
    leave_allowance_annual: 12,
    leave_balance: 9,
    position_history: [
      {
        id: 'pos-014',
        employee_id: 'emp-sec-001',
        department: 'RUMAH_TANGGA',
        job_title: 'Komandan Regu Keamanan',
        role_slug: 'satpam_rt',
        supervisor_id: 'emp-rt-001',
        supervisor_name: 'Pak Subandi, S.T.',
        start_date: '2020-09-01',
        reason: 'INITIAL_APPOINTMENT'
      }
    ],
    created_at: '2020-09-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  }
];

// ============================================================================
// DEFAULT SEED EMPLOYMENT CONTRACTS (STRICTLY CONFIDENTIAL)
// ============================================================================

export const DEFAULT_CONTRACTS: EmploymentContract[] = [
  {
    id: 'ctr-001',
    employee_id: 'emp-hrd-001',
    contract_number: 'PKWT/HRD/2024/001',
    type: 'TETAP',
    start_date: '2019-06-01',
    end_date: null,
    basic_salary: 7500000,
    allowances: [
      { title: 'Tunjangan Jabatan Struktural', amount: 2000000 },
      { title: 'Tunjangan Transport & Komunikasi', amount: 750000 }
    ],
    is_active: true
  },
  {
    id: 'ctr-002',
    employee_id: 'emp-gru-001',
    contract_number: 'PKWT/GRU/2024/015',
    type: 'TETAP',
    start_date: '2021-07-15',
    end_date: null,
    basic_salary: 4800000,
    allowances: [
      { title: 'Tunjangan Penanggung Jawab Lab', amount: 800000 },
      { title: 'Tunjangan Pengabdian', amount: 500000 }
    ],
    is_active: true
  },
  {
    id: 'ctr-003',
    employee_id: 'emp-tek-001',
    contract_number: 'PKWT/RT/2025/030',
    type: 'KONTRAK',
    start_date: '2025-01-01',
    end_date: '2026-12-31',
    basic_salary: 3900000,
    allowances: [
      { title: 'Tunjangan Resiko Bahaya Listrik (K3)', amount: 600000 }
    ],
    is_active: true
  }
];

// ============================================================================
// DEFAULT SEED LEAVE REQUESTS
// ============================================================================

export const DEFAULT_LEAVES: LeaveRequest[] = [
  {
    id: 'lv-001',
    employee_id: 'emp-tek-001',
    employee_name: 'Pak Rusli Effendi',
    employee_nip: 'NIP.TEK.2022.011',
    department: 'RUMAH_TANGGA',
    supervisor_id: 'emp-rt-001',
    supervisor_name: 'Pak Subandi, S.T.',
    leave_type: 'TAHUNAN',
    start_date: '2026-10-10',
    end_date: '2026-10-12',
    total_days: 3,
    reason: 'Keperluan keluarga di luar kota',
    substitute_staff_name: 'Pak Subandi (Cover tugas darurat)',
    status: 'APPROVED_BY_HRD',
    hrd_approver_id: 'emp-hrd-001',
    hrd_approver_name: 'Ust. Ir. Faisal Rahman, M.M.',
    hrd_approval_date: '2026-10-02T10:00:00Z',
    hrd_notes: 'Disetujui. Kuota cuti mencukupi.',
    operational_notified: true,
    operational_notified_at: '2026-10-02T10:01:00Z',
    created_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'lv-002',
    employee_id: 'emp-gru-002',
    employee_name: 'Usth. Fatimah Az-Zahra, S.Pd.',
    employee_nip: 'NIP.GRU.2022.010',
    department: 'PENDIDIKAN_KBM',
    supervisor_id: 'emp-mdr-001',
    supervisor_name: 'Dr. KH. Mahmud Ridwan, M.A.',
    leave_type: 'TAHUNAN',
    start_date: '2026-10-15',
    end_date: '2026-10-16',
    total_days: 2,
    reason: 'Menghadiri pernikahan adik kandung',
    substitute_staff_name: 'Ust. Lukman Hakim (Menggantikan jam KBM)',
    status: 'SUBMITTED',
    operational_notified: false,
    created_at: '2026-10-04T08:30:00Z'
  }
];

// ============================================================================
// DEFAULT SEED DISCIPLINARY CASES
// ============================================================================

export const DEFAULT_DISCIPLINE_CASES: DisciplinaryCase[] = [
  {
    id: 'dsp-001',
    case_number: 'CASE/SDM/2026/001',
    employee_id: 'emp-sec-001',
    employee_name: 'Pak Bambang Sutrisno',
    employee_nip: 'NIP.SEC.2020.014',
    department: 'RUMAH_TANGGA',
    reporter_name: 'Pak Subandi, S.T. (Kepala RT)',
    incident_date: '2026-09-18',
    incident_category: 'SOP_OPERASIONAL',
    description: 'Meninggalkan pos gerbang utama selama 45 menit tanpa izin pengganti saat jam santri keluar.',
    evidence_urls: ['https://cctv.pesantren.id/log/gate-pos1-20260918.mp4'],
    status: 'SANKSI_DITERBITKAN',
    sanction_level: 'TEGURAN_TERTULIS',
    sanction_expiry_date: '2026-12-18',
    handled_by_hrd_id: 'emp-hrd-001',
    handled_by_hrd_name: 'Ust. Ir. Faisal Rahman, M.M.',
    notes: 'Telah diberikan surat teguran tertulis. Pegawai berjanji mematuhi SOP jadwal pos.',
    created_at: '2026-09-19T09:00:00Z',
    updated_at: '2026-09-20T11:00:00Z'
  }
];

// ============================================================================
// DEFAULT SEED PERFORMANCE EVALUATION
// ============================================================================

export const DEFAULT_PERFORMANCES: PerformanceEvaluation[] = [
  {
    id: 'kpi-001',
    period_name: 'Semester Genap 2025/2026',
    employee_id: 'emp-tek-001',
    employee_name: 'Pak Rusli Effendi',
    department: 'RUMAH_TANGGA',
    supervisor_id: 'emp-rt-001',
    supervisor_name: 'Pak Subandi, S.T.',
    attendance_score: 95,
    task_execution_score: 88,
    attitude_score: 90,
    total_score: 91,
    final_grade: 'A_SANGAT_BAIK',
    mandatory_evidence_url: 'https://kabarsantri.id/evidence/rt-tickets-rusli-q1-2026.pdf',
    evidence_description: 'Menyelesaikan 42 tiket perbaikan fasilitas AC & listrik dengan kepuasan santri 98%.',
    supervisor_feedback: 'Kinerja sangat handal, responsif terhadap keluhan mendesak di asrama.',
    hrd_calibrated: true,
    hrd_calibration_notes: 'Nilai telah dikalibrasi sesuai laporan SLA Rumah Tangga.',
    created_at: '2026-09-30T14:00:00Z'
  },
  {
    id: 'kpi-002',
    period_name: 'Semester Genap 2025/2026',
    employee_id: 'emp-gru-001',
    employee_name: 'Ust. Lukman Hakim, M.Kom.',
    department: 'PENDIDIKAN_KBM',
    supervisor_id: 'emp-mdr-001',
    supervisor_name: 'Dr. KH. Mahmud Ridwan, M.A.',
    attendance_score: 92,
    task_execution_score: 90,
    attitude_score: 94,
    total_score: 92,
    final_grade: 'A_SANGAT_BAIK',
    mandatory_evidence_url: 'https://kabarsantri.id/evidence/kbm-log-lukman-2026.pdf',
    evidence_description: 'Tuntas mengajar 100% jam kurikulum TIK dan menginput nilai siswa tepat waktu.',
    supervisor_feedback: 'Pengelolaan lab komputer sangat rapi dan santri sangat antusias.',
    hrd_calibrated: true,
    created_at: '2026-09-30T15:00:00Z'
  }
];

// ============================================================================
// DEFAULT SEED OFFBOARDING CLEARANCES
// ============================================================================

export const DEFAULT_OFFBOARDINGS: OffboardingClearance[] = [
  {
    id: 'off-001',
    employee_id: 'emp-old-001',
    employee_name: 'Ust. Zulkifli Marwah (Eks Guru Fiqih)',
    employee_nip: 'NIP.GRU.2019.099',
    department: 'PENDIDIKAN_KBM',
    resignation_reason: 'RESIGNATION',
    effective_end_date: '2026-09-15',
    clearance_rt_completed: true,
    clearance_rt_officer: 'Pak Subandi, S.T.',
    clearance_rt_notes: 'Kunci ruang guru & buku perpustakaan telah diserahkan lengkap.',
    clearance_rt_date: '2026-09-10T10:00:00Z',
    clearance_finance_completed: true,
    clearance_finance_officer: 'Ust. Ahmad Dahlan, S.E.',
    clearance_finance_notes: 'Bebas kasbon, simpanan koperasi telah dikembalikan.',
    clearance_finance_date: '2026-09-12T11:00:00Z',
    clearance_hrd_completed: true,
    clearance_hrd_officer: 'Ust. Ir. Faisal Rahman, M.M.',
    clearance_hrd_notes: 'Exit interview selesai, surat pengalaman kerja diserahkan.',
    clearance_hrd_date: '2026-09-14T09:00:00Z',
    clearance_it_completed: true,
    clearance_it_officer: 'Tim IT KabarSantri',
    clearance_it_notes: 'Akun login dinonaktifkan permanen.',
    clearance_it_date: '2026-09-15T12:00:00Z',
    all_cleared: true,
    final_offboarded_date: '2026-09-15T12:00:00Z',
    created_at: '2026-09-01T08:00:00Z'
  }
];

// ============================================================================
// DEFAULT SEED AUDIT LOGS
// ============================================================================

export const DEFAULT_AUDIT_LOGS: HrAuditEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-02T10:01:00Z',
    actor_name: 'Ust. Ir. Faisal Rahman, M.M.',
    actor_role: 'Kepala Bagian Kepegawaian',
    action: 'LEAVE_APPROVED_HRD',
    details: 'Menyetujui pengajuan cuti tahunan Pak Rusli Effendi (3 hari). Notifikasi operasional dikirim ke Kepala RT (Pak Subandi).'
  },
  {
    id: 'aud-002',
    timestamp: '2026-09-20T11:00:00Z',
    actor_name: 'Ust. Ir. Faisal Rahman, M.M.',
    actor_role: 'Kepala Bagian Kepegawaian',
    action: 'SANCTION_ISSUED',
    details: 'Menerbitkan Teguran Tertulis untuk Pak Bambang Sutrisno atas kelalaian pos gerbang.'
  }
];

// ============================================================================
// STORAGE HELPERS (LOCALSTORAGE + IN-MEMORY FALLBACK)
// ============================================================================

const STORAGE_KEY = 'ks_kepegawaian_store_v2';
const TENANT_STORAGE_KEY = 'ks_tenant_kepegawaian_store_v1';

const INITIAL_TENANT_STATE = {
  employees: [],
  contracts: [],
  leaves: [],
  disciplineCases: [],
  performances: [],
  offboardings: [],
  auditLogs: []
};

let inMemoryState = {
  employees: DEFAULT_EMPLOYEES,
  contracts: DEFAULT_CONTRACTS,
  leaves: DEFAULT_LEAVES,
  disciplineCases: DEFAULT_DISCIPLINE_CASES,
  performances: DEFAULT_PERFORMANCES,
  offboardings: DEFAULT_OFFBOARDINGS,
  auditLogs: DEFAULT_AUDIT_LOGS
};

function loadState() {
  if (typeof window === 'undefined') return inMemoryState;
  try {
    const key = isTenantMode() ? TENANT_STORAGE_KEY : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) {
      const defaultState = isTenantMode() ? INITIAL_TENANT_STATE : inMemoryState;
      saveState(defaultState as any);
      return defaultState as any;
    }
    return JSON.parse(raw);
  } catch (e) {
    return isTenantMode() ? INITIAL_TENANT_STATE : inMemoryState;
  }
}

function saveState(state: typeof inMemoryState) {
  inMemoryState = state;
  if (typeof window !== 'undefined') {
    try {
      const key = isTenantMode() ? TENANT_STORAGE_KEY : STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      // ignore localstorage errors
    }
  }
}

// ============================================================================
// PUBLIC STORE APIS
// ============================================================================

export function getEmployees(): Employee[] {
  return loadState().employees;
}

export function getEmployeeById(id: string): Employee | undefined {
  return loadState().employees.find(e => e.id === id);
}

export function getEmployeeByNip(nip: string): Employee | undefined {
  return loadState().employees.find(e => e.nip.toLowerCase() === nip.trim().toLowerCase());
}

/**
 * BR-HRD-001: Unique Employee ID & NIP.
 * Rejects duplicate registration.
 */
export function registerEmployee(
  employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'position_history' | 'leave_balance'>
): { success: boolean; message: string; employee?: Employee } {
  const state = loadState();

  // 1. Uniqueness check
  const duplicate = state.employees.find(
    e => e.nip.toLowerCase() === employeeData.nip.trim().toLowerCase() ||
         (employeeData.nik && e.nik && e.nik === employeeData.nik.trim())
  );
  if (duplicate) {
    return {
      success: false,
      message: `Gagal! NIP (${employeeData.nip}) atau NIK sudah terdaftar atas nama ${duplicate.full_name}. (BR-HRD-001: Uniqueness Required)`
    };
  }

  const newId = `emp-${Date.now().toString(36)}`;
  const initialPosition: PositionHistory = {
    id: `pos-${Date.now().toString(36)}`,
    employee_id: newId,
    department: employeeData.current_department,
    job_title: employeeData.current_position,
    role_slug: employeeData.current_role_slug,
    supervisor_id: employeeData.supervisor_id,
    supervisor_name: employeeData.supervisor_name,
    start_date: employeeData.join_date,
    reason: 'INITIAL_APPOINTMENT'
  };

  const newEmployee: Employee = {
    ...employeeData,
    id: newId,
    leave_balance: employeeData.leave_allowance_annual || 12,
    position_history: [initialPosition],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  state.employees.unshift(newEmployee);
  
  // Audit log
  state.auditLogs.unshift({
    id: `aud-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    actor_name: 'Bagian Kepegawaian (HRD)',
    actor_role: 'Kepala Bagian Kepegawaian',
    action: 'EMPLOYEE_CREATED',
    details: `Mendaftarkan pegawai baru: ${newEmployee.full_name} (${newEmployee.nip}) unit ${newEmployee.current_department}.`
  });

  saveState(state);
  return { success: true, message: 'Pegawai berhasil didaftarkan.', employee: newEmployee };
}

/**
 * BR-HRD-002: Non-destructive, Soft Delete / Archive
 */
export function archiveEmployee(employeeId: string, actorName: string, reason: string): { success: boolean; message: string } {
  const state = loadState();
  const emp = state.employees.find(e => e.id === employeeId);
  if (!emp) return { success: false, message: 'Pegawai tidak ditemukan.' };

  emp.lifecycle_status = 'ARCHIVED';
  emp.user_account_active = false;
  emp.archived_at = new Date().toISOString();
  emp.updated_at = new Date().toISOString();

  state.auditLogs.unshift({
    id: `aud-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    actor_name: actorName,
    actor_role: 'HR Governance',
    action: 'ACCESS_REVOKED',
    details: `Mengarsipkan pegawai ${emp.full_name} (${emp.nip}). Alasan: ${reason}. Akses akun dicabut permanen.`
  });

  saveState(state);
  return { success: true, message: 'Pegawai berhasil diarsipkan (soft-archive, data historis tetap terjaga).' };
}

// ============================================================================
// CUTI / LEAVE FLOW
// Sesuai Arahan Bisnis User:
// 1. Acc cuti adalah kewenangan HRD.
// 2. Info / Notifikasi dikirimkan ke Kepala Bagian / RT untuk coverage pekerjaan.
// ============================================================================

export function getLeaveRequests(): LeaveRequest[] {
  return loadState().leaves;
}

export function submitLeaveRequest(data: {
  employee_id: string;
  leave_type: LeaveRequest['leave_type'];
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  substitute_staff_name?: string;
}): { success: boolean; message: string; leave?: LeaveRequest } {
  const state = loadState();
  const emp = state.employees.find(e => e.id === data.employee_id);
  if (!emp) return { success: false, message: 'Data pegawai tidak ditemukan.' };

  if (emp.lifecycle_status !== 'ACTIVE') {
    return { success: false, message: `Pegawai dengan status ${emp.lifecycle_status} tidak dapat mengajukan cuti.` };
  }

  // Validasi kuota jika cuti tahunan
  if (data.leave_type === 'TAHUNAN' && emp.leave_balance < data.total_days) {
    return {
      success: false,
      message: `Sisa kuota cuti tahunan tidak mencukupi (Sisa: ${emp.leave_balance} hari, Diajukan: ${data.total_days} hari).`
    };
  }

  const newLeave: LeaveRequest = {
    id: `lv-${Date.now().toString(36)}`,
    employee_id: emp.id,
    employee_name: emp.full_name,
    employee_nip: emp.nip,
    department: emp.current_department,
    supervisor_id: emp.supervisor_id || '',
    supervisor_name: emp.supervisor_name || 'Kepala Unit',
    leave_type: data.leave_type,
    start_date: data.start_date,
    end_date: data.end_date,
    total_days: data.total_days,
    reason: data.reason,
    substitute_staff_name: data.substitute_staff_name,
    status: 'SUBMITTED',
    operational_notified: false,
    created_at: new Date().toISOString()
  };

  state.leaves.unshift(newLeave);

  state.auditLogs.unshift({
    id: `aud-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    actor_name: emp.full_name,
    actor_role: emp.current_role_slug,
    action: 'LEAVE_SUBMITTED',
    details: `Mengajukan permohonan cuti ${data.leave_type} selama ${data.total_days} hari (${data.start_date} s/d ${data.end_date}).`
  });

  saveState(state);
  return { success: true, message: 'Permohonan cuti berhasil diajukan ke HRD.', leave: newLeave };
}

/**
 * Persetujuan Cuti oleh HRD
 * Menghitung kuota dan mengirimkan notifikasi informasi ke Kepala Bagian / RT
 */
export function approveLeaveByHrd(
  leaveId: string,
  hrdApproverName: string,
  hrdNotes?: string
): { success: boolean; message: string } {
  const state = loadState();
  const leave = state.leaves.find(l => l.id === leaveId);
  if (!leave) return { success: false, message: 'Permohonan cuti tidak ditemukan.' };

  const emp = state.employees.find(e => e.id === leave.employee_id);
  if (!emp) return { success: false, message: 'Data pegawai tidak ditemukan.' };

  // Potong kuota cuti jika tahunan
  if (leave.leave_type === 'TAHUNAN') {
    emp.leave_balance = Math.max(0, emp.leave_balance - leave.total_days);
    emp.updated_at = new Date().toISOString();
  }

  leave.status = 'APPROVED_BY_HRD';
  leave.hrd_approver_id = 'emp-hrd-001';
  leave.hrd_approver_name = hrdApproverName;
  leave.hrd_approval_date = new Date().toISOString();
  leave.hrd_notes = hrdNotes || 'Disetujui oleh HRD.';
  
  // Kirim notifikasi info ke Kepala Unit (Kepala RT / Mudir / Kesantrian)
  leave.operational_notified = true;
  leave.operational_notified_at = new Date().toISOString();

  state.auditLogs.unshift({
    id: `aud-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    actor_name: hrdApproverName,
    actor_role: 'Kepala Bagian Kepegawaian',
    action: 'LEAVE_APPROVED_HRD',
    details: `ACC Cuti: ${leave.employee_name} (${leave.total_days} hari). Notifikasi operasional diteruskan ke ${leave.supervisor_name} (${leave.department}).`
  });

  saveState(state);
  return {
    success: true,
    message: `Permohonan cuti telah di-ACC oleh HRD. Notifikasi informasi telah dikirimkan ke atasan (${leave.supervisor_name}) untuk penataan pekerjaan.`
  };
}

export function rejectLeaveByHrd(
  leaveId: string,
  hrdApproverName: string,
  reason: string
): { success: boolean; message: string } {
  const state = loadState();
  const leave = state.leaves.find(l => l.id === leaveId);
  if (!leave) return { success: false, message: 'Permohonan cuti tidak ditemukan.' };

  leave.status = 'REJECTED_BY_HRD';
  leave.hrd_approver_name = hrdApproverName;
  leave.hrd_notes = reason;

  state.auditLogs.unshift({
    id: `aud-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    actor_name: hrdApproverName,
    actor_role: 'Kepala Bagian Kepegawaian',
    action: 'LEAVE_REJECTED_HRD',
    details: `Menolak permohonan cuti ${leave.employee_name}. Alasan: ${reason}`
  });

  saveState(state);
  return { success: true, message: 'Permohonan cuti ditolak.' };
}

/**
 * Penugasan Guru Pengganti (Inval) oleh Mudir / Kepala Sekolah
 * Menjamin proses KBM santri tidak kosong ketika guru izin/cuti
 */
export function assignSubstituteTeacherByMudir(
  leaveId: string,
  substituteTeacherName: string,
  mudirName: string
): { success: boolean; message: string } {
  const state = loadState();
  const leave = state.leaves.find(l => l.id === leaveId);
  if (!leave) return { success: false, message: 'Permohonan cuti tidak ditemukan.' };

  leave.substitute_staff_name = substituteTeacherName;

  state.auditLogs.unshift({
    id: `aud-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    actor_name: mudirName,
    actor_role: 'Mudir Pesantren',
    action: 'TEACHER_SUBSTITUTE_ASSIGNED',
    details: `Mudir menugaskan Guru Pengganti (Inval): ${substituteTeacherName} untuk menggantikan ${leave.employee_name} (${leave.total_days} hari KBM).`
  });

  saveState(state);

  // Item 4.1: Otomatis sinkronkan nama guru inval ke sesi pembelajaran KBM
  syncSubstituteTeacherToSessions(leave.id, leave.employee_name, substituteTeacherName);

  return {
    success: true,
    message: `Guru Pengganti (Inval) berhasil ditugaskan: ${substituteTeacherName} menggantikan ${leave.employee_name}. Sesi KBM santri tertanggulangi.`
  };
}

// ============================================================================
// KINERJA BERBASIS EVIDENCE / PERFORMANCE EVALUATION
// BR-HRD-006: Wajib melampirkan evidence link
// ============================================================================

export function getPerformanceEvaluations(): PerformanceEvaluation[] {
  return loadState().performances;
}

export function submitPerformanceEvaluation(data: {
  period_name: string;
  employee_id: string;
  supervisor_id: string;
  supervisor_name: string;
  attendance_score: number;
  task_execution_score: number;
  attitude_score: number;
  mandatory_evidence_url: string;
  evidence_description: string;
  supervisor_feedback: string;
}): { success: boolean; message: string; evaluation?: PerformanceEvaluation } {
  const state = loadState();
  const emp = state.employees.find(e => e.id === data.employee_id);
  if (!emp) return { success: false, message: 'Data pegawai tidak ditemukan.' };

  // BR-HRD-006: Enforce Mandatory Evidence
  if (!data.mandatory_evidence_url || data.mandatory_evidence_url.trim().length < 5) {
    return {
      success: false,
      message: 'Penilaian ditolak! Wajib melampirkan link evidence kerja (Log KBM / SLA Tiket RT / Laporan). (BR-HRD-006: Evidence Mandatory)'
    };
  }

  // Hitung total score (Bobot: Kehadiran 25%, Eksekusi Tugas 50%, Sikap/Etika 25%)
  const totalScore = Math.round(
    data.attendance_score * 0.25 +
    data.task_execution_score * 0.50 +
    data.attitude_score * 0.25
  );

  let finalGrade: PerformanceEvaluation['final_grade'] = 'B_BAIK';
  if (totalScore >= 90) finalGrade = 'A_SANGAT_BAIK';
  else if (totalScore >= 75) finalGrade = 'B_BAIK';
  else if (totalScore >= 60) finalGrade = 'C_CUKUP';
  else finalGrade = 'D_KURANG';

  const newEval: PerformanceEvaluation = {
    id: `kpi-${Date.now().toString(36)}`,
    period_name: data.period_name,
    employee_id: emp.id,
    employee_name: emp.full_name,
    department: emp.current_department,
    supervisor_id: data.supervisor_id,
    supervisor_name: data.supervisor_name,
    attendance_score: data.attendance_score,
    task_execution_score: data.task_execution_score,
    attitude_score: data.attitude_score,
    total_score: totalScore,
    final_grade: finalGrade,
    mandatory_evidence_url: data.mandatory_evidence_url,
    evidence_description: data.evidence_description,
    supervisor_feedback: data.supervisor_feedback,
    hrd_calibrated: false,
    created_at: new Date().toISOString()
  };

  state.performances.unshift(newEval);

  state.auditLogs.unshift({
    id: `aud-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    actor_name: data.supervisor_name,
    actor_role: 'Supervisor Penilai',
    action: 'PERFORMANCE_SUBMITTED',
    details: `Submit evaluasi kinerja ${emp.full_name} (${data.period_name}): Skor ${totalScore} (Grade ${finalGrade}) dengan bukti kerja.`
  });

  saveState(state);
  return { success: true, message: 'Evaluasi kinerja berhasil disimpan dengan bukti kerja valid.', evaluation: newEval };
}

// ============================================================================
// MUTASI / PROMOSI JABATAN
// BR-HRD-012: Perubahan jabatan TIDAK mengubah NIP & ID Pegawai
// ============================================================================

export function executeMutation(data: {
  employee_id: string;
  new_department: DepartmentUnit;
  new_position: string;
  new_role_slug: string;
  new_supervisor_id?: string;
  new_supervisor_name?: string;
  sk_number: string;
  reason: PositionHistory['reason'];
  effective_date: string;
  actor_name: string;
}): { success: boolean; message: string } {
  const state = loadState();
  const emp = state.employees.find(e => e.id === data.employee_id);
  if (!emp) return { success: false, message: 'Pegawai tidak ditemukan.' };

  const historyEntry: PositionHistory = {
    id: `pos-${Date.now().toString(36)}`,
    employee_id: emp.id,
    department: data.new_department,
    job_title: data.new_position,
    role_slug: data.new_role_slug,
    supervisor_id: data.new_supervisor_id,
    supervisor_name: data.new_supervisor_name,
    start_date: data.effective_date,
    sk_number: data.sk_number,
    reason: data.reason
  };

  // Close previous position end_date
  if (emp.position_history.length > 0) {
    emp.position_history[0].end_date = data.effective_date;
  }

  // Update current
  emp.current_department = data.new_department;
  emp.current_position = data.new_position;
  emp.current_role_slug = data.new_role_slug;
  emp.supervisor_id = data.new_supervisor_id;
  emp.supervisor_name = data.new_supervisor_name;
  emp.position_history.unshift(historyEntry);
  emp.updated_at = new Date().toISOString();

  state.auditLogs.unshift({
    id: `aud-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    actor_name: data.actor_name,
    actor_role: 'HR Governance',
    action: 'MUTATION_EXECUTED',
    details: `Mutasi/Promosi: ${emp.full_name} berpindah ke ${data.new_position} (${data.new_department}) berdasarkan SK ${data.sk_number}. NIP tetap: ${emp.nip}.`
  });

  saveState(state);
  return { success: true, message: `Mutasi pegawai ${emp.full_name} berhasil dicatat. NIP & ID tetap konsisten.` };
}

// ============================================================================
// OFFBOARDING & 4-PINTU CLEARANCE
// BR-HRD-013: Inactive ≠ Fully Offboarded
// AC-HRD-009: Asset return mandatory
// AC-HRD-010: Access revocation mandatory
// ============================================================================

export function getOffboardings(): OffboardingClearance[] {
  return loadState().offboardings;
}

export function initiateOffboarding(data: {
  employee_id: string;
  resignation_reason: OffboardingClearance['resignation_reason'];
  effective_end_date: string;
  actor_name: string;
}): { success: boolean; message: string; clearance?: OffboardingClearance } {
  const state = loadState();
  const emp = state.employees.find(e => e.id === data.employee_id);
  if (!emp) return { success: false, message: 'Pegawai tidak ditemukan.' };

  emp.lifecycle_status = 'OFFBOARDING_IN_PROGRESS';
  emp.updated_at = new Date().toISOString();

  const newClearance: OffboardingClearance = {
    id: `off-${Date.now().toString(36)}`,
    employee_id: emp.id,
    employee_name: emp.full_name,
    employee_nip: emp.nip,
    department: emp.current_department,
    resignation_reason: data.resignation_reason,
    effective_end_date: data.effective_end_date,
    clearance_rt_completed: false,
    clearance_finance_completed: false,
    clearance_hrd_completed: false,
    clearance_it_completed: false,
    all_cleared: false,
    created_at: new Date().toISOString()
  };

  state.offboardings.unshift(newClearance);

  state.auditLogs.unshift({
    id: `aud-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    actor_name: data.actor_name,
    actor_role: 'HRD',
    action: 'CLEARANCE_STEP_SIGNED',
    details: `Memulai alur offboarding 4-pintu untuk ${emp.full_name} (${emp.nip}). Status berubah menjadi OFFBOARDING_IN_PROGRESS.`
  });

  saveState(state);
  return { success: true, message: 'Alur offboarding dan 4-pintu clearance berhasil diinisiasi.', clearance: newClearance };
}

/**
 * Menandatangani salah satu pintu clearance:
 * 1. RT (Aset & Fasilitas)
 * 2. Keuangan (Kasbon & Kasir)
 * 3. HRD (Exit Interview)
 * 4. IT (Pencabutan Akses)
 */
export function signClearanceDoor(data: {
  offboarding_id: string;
  door: 'RT' | 'FINANCE' | 'HRD' | 'IT';
  officer_name: string;
  notes: string;
}): { success: boolean; message: string } {
  const state = loadState();
  const off = state.offboardings.find(o => o.id === data.offboarding_id);
  if (!off) return { success: false, message: 'Data offboarding tidak ditemukan.' };

  const now = new Date().toISOString();

  if (data.door === 'RT') {
    off.clearance_rt_completed = true;
    off.clearance_rt_officer = data.officer_name;
    off.clearance_rt_notes = data.notes;
    off.clearance_rt_date = now;
  } else if (data.door === 'FINANCE') {
    off.clearance_finance_completed = true;
    off.clearance_finance_officer = data.officer_name;
    off.clearance_finance_notes = data.notes;
    off.clearance_finance_date = now;
  } else if (data.door === 'HRD') {
    off.clearance_hrd_completed = true;
    off.clearance_hrd_officer = data.officer_name;
    off.clearance_hrd_notes = data.notes;
    off.clearance_hrd_date = now;
  } else if (data.door === 'IT') {
    off.clearance_it_completed = true;
    off.clearance_it_officer = data.officer_name;
    off.clearance_it_notes = data.notes;
    off.clearance_it_date = now;

    // AC-HRD-010: Immediately revoke user account
    const emp = state.employees.find(e => e.id === off.employee_id);
    if (emp) {
      emp.user_account_active = false;
      emp.updated_at = now;
    }
  }

  // Check if all 4 doors are cleared
  if (
    off.clearance_rt_completed &&
    off.clearance_finance_completed &&
    off.clearance_hrd_completed &&
    off.clearance_it_completed
  ) {
    off.all_cleared = true;
    off.final_offboarded_date = now;

    const emp = state.employees.find(e => e.id === off.employee_id);
    if (emp) {
      emp.lifecycle_status = 'OFFBOARDED';
      emp.user_account_active = false;
      emp.updated_at = now;
    }
  }

  state.auditLogs.unshift({
    id: `aud-${Date.now().toString(36)}`,
    timestamp: now,
    actor_name: data.officer_name,
    actor_role: `Clearance Officer (${data.door})`,
    action: 'CLEARANCE_STEP_SIGNED',
    details: `Tanda tangan clearance pintu [${data.door}] untuk ${off.employee_name}. Catatan: ${data.notes}`
  });

  saveState(state);
  return {
    success: true,
    message: `Clearance pintu [${data.door}] berhasil ditandatangani.${off.all_cleared ? ' Seluruh 4 pintu clearance telah tuntas! Status resmi: OFFBOARDED.' : ''}`
  };
}

// ============================================================================
// DATA PRIVACY: SECTION 7 BUSINESS RULE LOCK
// Nominal gaji & insentif HANYA dapat dilihat oleh Finance dan pegawai ybs.
// HRD, Mudir, Kepala RT, dan role lain DILARANG melihat nominal kompensasi.
// ============================================================================

export function getEmployeeContract(
  employeeId: string,
  requesterRole: string,
  requesterEmployeeId?: string
): { isAuthorized: boolean; contract?: EmploymentContract; maskedSalary?: string } {
  const state = loadState();
  const contract = state.contracts.find(c => c.employee_id === employeeId);

  // Authorized roles: ONLY Keuangan and the employee themselves (ybs)
  const isFinance = ['keuangan', 'kepala_keuangan'].includes(requesterRole);
  const isSelf = requesterEmployeeId && requesterEmployeeId === employeeId;

  if (isFinance || isSelf) {
    return {
      isAuthorized: true,
      contract: contract
    };
  }

  // Not authorized: HRD, Mudir, Kepala RT, Staff umum
  return {
    isAuthorized: false,
    maskedSalary: 'Rp •••••••• (Akses Terbatas: Hanya Keuangan & Pegawai ybs)'
  };
}

// ============================================================================
// HR DASHBOARD METRICS
// ============================================================================

export function getHrMetrics(): HrDashboardMetrics {
  const state = loadState();
  const employees = state.employees;
  const leaves = state.leaves;
  const disc = state.disciplineCases;
  const off = state.offboardings;

  return {
    total_employees: employees.length,
    active_employees: employees.filter(e => e.lifecycle_status === 'ACTIVE').length,
    on_leave_today: leaves.filter(l => l.status === 'APPROVED_BY_HRD').length,
    suspended_employees: employees.filter(e => e.lifecycle_status === 'SUSPENDED').length,
    contracts_expiring_soon: 2, // 2 PKWT nearing end
    active_disciplinary_cases: disc.filter(d => !['KASUS_SELESAI', 'DITOLAK_TIDAK_TERBUKTI'].includes(d.status)).length,
    pending_leave_approvals: leaves.filter(l => l.status === 'SUBMITTED').length,
    pending_offboarding_clearances: off.filter(o => !o.all_cleared).length
  };
}

export function getDisciplinaryCases(): DisciplinaryCase[] {
  return loadState().disciplineCases;
}

export function getAuditLogs(): HrAuditEntry[] {
  return loadState().auditLogs;
}
