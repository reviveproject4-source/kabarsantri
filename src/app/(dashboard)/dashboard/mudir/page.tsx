'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  School, 
  UserCheck, 
  BookOpen, 
  FileText, 
  Calendar, 
  Send, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Users, 
  Building2,
  Upload,
  GraduationCap,
  Check,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertCircle,
  AlertTriangle,
  Play,
  Sparkles,
  Eye,
  X,
  ExternalLink,
  RefreshCw,
  Search,
  CheckSquare,
  UserPlus,
  ShieldAlert,
  BadgeCheck,
  Briefcase,
  MapPin
} from 'lucide-react';
import { 
  MASTER_KELAS, 
  MASTER_SANTRI, 
  getSharedLearningSessions, 
  LearningSession,
  getSharedPresensiList,
  PresensiPegawaiRecord,
  getSharedPermissionRequests,
  addNewLearningSession,
  addNewMasterKelas,
  getSharedMasterKelas,
  syncSubstituteTeacherToSessions,
  saveSharedPresensi,
  validateIslamicSegregation,
  isTenantMode,
  getSharedSantriList
} from '@/lib/sharedDataStore';
import { 
  getLeaveRequests, 
  assignSubstituteTeacherByMudir, 
  LeaveRequest 
} from '@/lib/kepegawaianStore';

export default function DashboardKepalaSekolahPage() {
  const [activeTab, setActiveTab] = useState<'kbm' | 'inval' | 'absen' | 'hafalan' | 'dokumentasi' | 'assign_kelas'>('kbm');
  const [modalDokumentasi, setModalDokumentasi] = useState(false);
  const [notif, setNotif] = useState('');

  // Modals Baru Sesuai Feedback BA & Developer Refinement
  const [modalIzinDinas, setModalIzinDinas] = useState(false);
  const [formIzinDinas, setFormIzinDinas] = useState({
    keperluan: 'Rapat Koordinasi Kemenag & Pokjawas Jawa Barat',
    tujuan: 'Kantor Kemenag Kota Bogor',
    tglMulai: '2026-10-06',
    tglSelesai: '2026-10-07',
    plh: 'Ust. Ahmad Dahlan, S.Pd.I',
    nomorSurat: 'ST-MDR/X/2026/012',
    catatan: 'Sinkronisasi Kurikulum Merdeka & Data EMIS Pesantren',
  });

  const [modalTambahMapel, setModalTambahMapel] = useState(false);
  const [formMapel, setFormMapel] = useState({
    namaMapel: 'Hadits Arba\'in An-Nawawiyah',
    kodeMapel: 'MP-HDT-01',
    kelasId: 'k-7a',
    guruPengampu: 'Ust. Lukman Hakim, M.Kom.',
    guruNip: '1984021001',
    hari: 'Selasa',
    jamMulai: '07:30',
    jamSelesai: '09:00',
    ruang: 'Ruang Kelas 7A - Gedung Ibnu Khaldun',
  });

  const [modalInvalMandiri, setModalInvalMandiri] = useState(false);
  const [formInvalMandiri, setFormInvalMandiri] = useState({
    guruAsli: 'Usth. Maryam, S.Pd.',
    guruInval: 'Usth. Fatimah Az-Zahra, S.Pd.',
    mapel: 'Aqidah Akhlak',
    kelasId: 'k-8b',
    tanggal: '2026-10-05',
    alasan: 'Sakit mendadak / izin darurat pagi hari',
    catatan: 'Pengampu pengganti telah menerima silabus dan modul tugas',
  });

  const [modalTambahRombel, setModalTambahRombel] = useState(false);
  const [formRombel, setFormRombel] = useState({
    namaRombel: 'Kelas 8C Tahfidz Sains',
    waliKelas: 'Ust. Bilal Habasyi',
    jumlahSantri: 28,
  });

  // State KBM & Presensi Pegawai Aktual
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>([]);
  const [selectedDetailSession, setSelectedDetailSession] = useState<LearningSession | null>(null);
  const [filterSessionStatus, setFilterSessionStatus] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED'>('ALL');
  const [staffPresensiList, setStaffPresensiList] = useState<PresensiPegawaiRecord[]>([]);
  const [overduePermissionCount, setOverduePermissionCount] = useState(0);

  // State Guru & Penugasan Guru Pengganti (Inval dari Notifikasi HRD)
  const [teacherLeaves, setTeacherLeaves] = useState<LeaveRequest[]>([]);
  const [selectedLeaveForInval, setSelectedLeaveForInval] = useState<LeaveRequest | null>(null);
  const [inputSubTeacher, setInputSubTeacher] = useState('');

  // Sinkronisasi data sesi KBM & Presensi Pegawai & Cuti Guru
  const refreshKbmData = () => {
    setLearningSessions(getSharedLearningSessions());
    setStaffPresensiList(getSharedPresensiList());
    const overduePerms = getSharedPermissionRequests().filter(p => p.status === 'OVERDUE' || p.status === 'CASE_REVIEW');
    setOverduePermissionCount(overduePerms.length);

    // Filter cuti khusus asatidz / guru KBM
    const allLeaves = getLeaveRequests();
    const kbmLeaves = allLeaves.filter(
      l => l.department === 'PENDIDIKAN_KBM' || (l.supervisor_name && l.supervisor_name.includes('Mahmud'))
    );
    setTeacherLeaves(kbmLeaves);
  };

  useEffect(() => {
    refreshKbmData();

    const handleKbmUpdated = () => {
      refreshKbmData();
    };

    const handlePresensiUpdated = () => {
      refreshKbmData();
    };

    const handlePermUpdated = () => {
      refreshKbmData();
    };

    window.addEventListener('ks_kbm_session_updated', handleKbmUpdated);
    window.addEventListener('ks_presensi_updated', handlePresensiUpdated);
    window.addEventListener('ks_permission_updated', handlePermUpdated);

    return () => {
      window.removeEventListener('ks_kbm_session_updated', handleKbmUpdated);
      window.removeEventListener('ks_presensi_updated', handlePresensiUpdated);
      window.removeEventListener('ks_permission_updated', handlePermUpdated);
    };
  }, []);

  // Handle URL query parameter ?tab=assign_kelas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'assign_kelas' || tabParam === 'kbm' || tabParam === 'inval' || tabParam === 'absen' || tabParam === 'hafalan' || tabParam === 'dokumentasi') {
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

  const handleAssignInval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveForInval || !inputSubTeacher.trim()) return;

    const teacherLeaveGender = (selectedLeaveForInval.employee_name.toLowerCase().includes('usth') || selectedLeaveForInval.employee_name.toLowerCase().includes('fatimah') || selectedLeaveForInval.employee_name.toLowerCase().includes('maryam')) ? 'akhwat' : 'ikhwan';
    const subTeacherGender = (inputSubTeacher.toLowerCase().includes('usth') || inputSubTeacher.toLowerCase().includes('fatimah') || inputSubTeacher.toLowerCase().includes('maryam') || inputSubTeacher.toLowerCase().includes('khadijah')) ? 'akhwat' : 'ikhwan';

    if (teacherLeaveGender !== subTeacherGender) {
      setNotif(`❌ Pelanggaran Syar'i: Guru pengganti (${inputSubTeacher}) harus berjenis kelamin sama (${teacherLeaveGender === 'akhwat' ? 'Ustadzah / Akhwat' : 'Ustadz / Ikhwan'}) untuk mengajar rombel yang bersangkutan.`);
      setTimeout(() => setNotif(''), 8000);
      return;
    }

    const res = assignSubstituteTeacherByMudir(
      selectedLeaveForInval.id,
      inputSubTeacher.trim(),
      'Dr. KH. Mahmud Ridwan, M.A.'
    );
    if (res.success) {
      setNotif(`✓ ${res.message}`);
      setSelectedLeaveForInval(null);
      setInputSubTeacher('');
      refreshKbmData();
      setTimeout(() => setNotif(''), 7000);
    }
  };

  const handleSubmitIzinDinas = (e: React.FormEvent) => {
    e.preventDefault();
    saveSharedPresensi({
      pegawai_nama: 'Dr. KH. Mahmud Ridwan, M.A.',
      nip: 'PEG-MDR-001',
      jabatan: 'Guru KBM' as any,
      divisi: 'Akademik',
      status: 'ijin',
      tempat: `Dinas Luar: ${formIzinDinas.tujuan}`,
      tanggal: formIzinDinas.tglMulai,
      waktu: '08:00:00 WIB',
      keterangan: `[IZIN DINAS LUAR MUDIR] ${formIzinDinas.keperluan} (${formIzinDinas.tglMulai} s.d ${formIzinDinas.tglSelesai}). Plh: ${formIzinDinas.plh}. No. Surat: ${formIzinDinas.nomorSurat}.`,
    });

    setNotif(`✓ Pengajuan Izin Tugas Luar / Dinas Mudir (${formIzinDinas.keperluan}) berhasil dikirimkan ke Wakil Ketua Yayasan & HRD!`);
    setModalIzinDinas(false);
    setTimeout(() => setNotif(''), 7000);
  };

  const handleSimpanMapelBaru = (e: React.FormEvent) => {
    e.preventDefault();
    const allKelas = getSharedMasterKelas();
    const targetKelas = allKelas.find(k => k.id === formMapel.kelasId) || allKelas[0];

    const classGender: 'ikhwan' | 'akhwat' = targetKelas.gender || (targetKelas.nama_kelas.toLowerCase().includes('putri') ? 'akhwat' : 'ikhwan');
    const teacherGender: 'ikhwan' | 'akhwat' = (formMapel.guruPengampu.toLowerCase().includes('usth') || formMapel.guruPengampu.toLowerCase().includes('fatimah') || formMapel.guruPengampu.toLowerCase().includes('maryam') || formMapel.guruPengampu.toLowerCase().includes('khadijah')) ? 'akhwat' : 'ikhwan';

    const segCheck = validateIslamicSegregation(teacherGender, classGender);
    if (!segCheck.isValid) {
      setNotif(`❌ ${segCheck.message}`);
      setTimeout(() => setNotif(''), 8000);
      return;
    }

    const santriDiKelas = MASTER_SANTRI.filter(s => s.kelas_id === formMapel.kelasId);
    const santriListSession = santriDiKelas.map((s, idx) => ({
      santri_id: `s-${idx + 1}`,
      nis: s.nis,
      nama: s.nama,
      status: 'HADIR' as const
    }));

    const finalPresensi = santriListSession.length > 0 ? santriListSession : (
      classGender === 'akhwat' 
        ? [
            { santri_id: 's-15', nis: '202602001', nama: 'Fathimah Az-Zahra', status: 'HADIR' as const },
            { santri_id: 's-16', nis: '202602002', nama: 'Maryam Al-Batul', status: 'HADIR' as const }
          ]
        : [
            { santri_id: 's-1', nis: '202601001', nama: 'Muhammad Al-Fatih', status: 'HADIR' as const },
            { santri_id: 's-2', nis: '202601015', nama: 'Ahmad Zaki Mubarak', status: 'HADIR' as const }
          ]
    );

    addNewLearningSession({
      jadwal_id: `jdw-${Date.now()}`,
      kelas_id: formMapel.kelasId,
      kelas_nama: targetKelas.nama_kelas,
      mata_pelajaran: formMapel.namaMapel,
      guru_nama: formMapel.guruPengampu,
      guru_nip: formMapel.guruNip,
      gender_target: classGender,
      guru_gender: teacherGender,
      hari: formMapel.hari,
      ruang_kelas: formMapel.ruang,
      jam_jadwal: `${formMapel.jamMulai} - ${formMapel.jamSelesai} WIB`,
      status: 'NOT_STARTED',
      presensi: finalPresensi,
      activity: {
        topik_materi: `Pengantar Materi: ${formMapel.namaMapel}`,
        bab_pembahasan: 'Bab 1: Silabus Kurikulum & Kontrak Pembelajaran',
        metode_pembelajaran: 'Ceramah & Tanya Jawab',
        catatan_kbm: 'Direncanakan dan diinput resmi oleh Mudir Pondok Pesantren.'
      },
      assessment: {
        judul_tugas: `Diagnostik Awal ${formMapel.namaMapel}`,
        tipe: 'Tugas Harian',
        target_kkm: 75,
        results: finalPresensi.map(s => ({
          santri_id: s.santri_id,
          nis: s.nis,
          nama: s.nama,
          nilai: 80,
          capaian: 'ACHIEVED',
          rekomendasi: 'ENRICHMENT_ELIGIBLE',
          catatan: 'Tuntas pengenalan materi kurikulum.'
        }))
      }
    });

    setNotif(`✓ Mata Pelajaran "${formMapel.namaMapel}" untuk ${targetKelas.nama_kelas} (${classGender === 'akhwat' ? 'Kampus Putri' : 'Kampus Putra'}) berhasil ditambahkan oleh Mudir ke Jadwal KBM Guru!`);
    setModalTambahMapel(false);
    refreshKbmData();
    setTimeout(() => setNotif(''), 7000);
  };

  const handleSubmitInvalMandiri = (e: React.FormEvent) => {
    e.preventDefault();
    const guruAsliGender = (formInvalMandiri.guruAsli.toLowerCase().includes('usth') || formInvalMandiri.guruAsli.toLowerCase().includes('fatimah') || formInvalMandiri.guruAsli.toLowerCase().includes('maryam')) ? 'akhwat' : 'ikhwan';
    const guruInvalGender = (formInvalMandiri.guruInval.toLowerCase().includes('usth') || formInvalMandiri.guruInval.toLowerCase().includes('fatimah') || formInvalMandiri.guruInval.toLowerCase().includes('maryam') || formInvalMandiri.guruInval.toLowerCase().includes('khadijah')) ? 'akhwat' : 'ikhwan';
    
    if (guruAsliGender !== guruInvalGender) {
      setNotif(`❌ Pelanggaran Syar'i: Guru pengganti (${formInvalMandiri.guruInval}) harus berjenis kelamin sama dengan guru asli (${formInvalMandiri.guruAsli}). Guru ikhwan tidak boleh mengajar kelas akhwat atau sebaliknya!`);
      setTimeout(() => setNotif(''), 8000);
      return;
    }

    syncSubstituteTeacherToSessions('inval-manual-' + Date.now(), formInvalMandiri.guruAsli, formInvalMandiri.guruInval);
    setNotif(`✓ Penugasan Guru Inval Mandiri (${formInvalMandiri.guruInval} menggantikan ${formInvalMandiri.guruAsli}) berhasil ditetapkan oleh Mudir!`);
    setModalInvalMandiri(false);
    refreshKbmData();
    setTimeout(() => setNotif(''), 7000);
  };

  const handleSubmitTambahRombel = (e: React.FormEvent) => {
    e.preventDefault();
    const rombelGender: 'ikhwan' | 'akhwat' = (formRombel.namaRombel.toLowerCase().includes('putri') || formRombel.namaRombel.toLowerCase().includes('akhwat') || formRombel.waliKelas.toLowerCase().includes('usth')) ? 'akhwat' : 'ikhwan';

    addNewMasterKelas({
      nama_kelas: formRombel.namaRombel,
      wali_kelas: formRombel.waliKelas,
      jumlah_santri: formRombel.jumlahSantri,
      gender: rombelGender,
      kampus: rombelGender === 'akhwat' ? 'Kampus Putri (Akhwat)' : 'Kampus Putra (Ikhwan)'
    });
    setNotif(`✓ Rombongan Belajar baru "${formRombel.namaRombel}" (${rombelGender === 'akhwat' ? 'Kampus Putri' : 'Kampus Putra'}) dengan Wali Kelas ${formRombel.waliKelas} berhasil dibuka oleh Mudir!`);
    setModalTambahRombel(false);
    setTimeout(() => setNotif(''), 7000);
  };

  // Form input dokumentasi manual oleh Mudir
  const [formDataDok, setFormDataDok] = useState({
    judul: '',
    jenis: 'tugas_luar',
    tanggal: new Date().toISOString().split('T')[0],
    mitra: '',
    notulensi: '',
    tindak_lanjut: '',
  });

  // State absen pribadi Mudir
  const [absenPribadiDone, setAbsenPribadiDone] = useState(false);

  // Progres Hafalan per Kelas (Demo Data vs Tenant Data)
  const DEMO_PROGRES_HAFALAN = [
    { kelas: '7A Tahfidz Sains', jumlah_santri: 30, target_juz: 2, capaian_rata: 2.4, status: 'Melampaui Target' },
    { kelas: '7B Tahfidz Sains', jumlah_santri: 30, target_juz: 2, capaian_rata: 2.1, status: 'Sesuai Target' },
    { kelas: '8A Unggulan', jumlah_santri: 28, target_juz: 5, capaian_rata: 4.8, status: 'Sesuai Target' },
    { kelas: '8B Unggulan', jumlah_santri: 28, target_juz: 5, capaian_rata: 3.4, status: 'Perlu Pendampingan' },
    { kelas: '9 Putra', jumlah_santri: 26, target_juz: 10, capaian_rata: 10.2, status: 'Selesai 30 Juz (7 Santri)' },
  ];

  const progresHafalanKelas = (typeof window !== 'undefined' && isTenantMode()) ? [] : DEMO_PROGRES_HAFALAN;

  // =========================================================================
  // STATE ASSIGN KELAS & ROMBEL (PINDAH KE DASHBOARD MUDIR - REVISI 3)
  // =========================================================================
  const [selectedTahun, setSelectedTahun] = useState('2026/2027 Ganjil');
  const [selectedUnit, setSelectedUnit] = useState('MTs Tahfidz Sains');
  const [selectedKelasTarget, setSelectedKelasTarget] = useState('k-7a');
  const [filterStatusSantri, setFilterStatusSantri] = useState<'ALL' | 'BARU' | 'PINDAHAN' | 'ACARA_LUAR'>('ALL');

  const DEMO_UNASSIGNED_SANTRI = [
    { 
      id: 's-1', 
      nis: '202601015', 
      nama: 'Ahmad Zaki Mubarak', 
      gender: 'L', 
      asal: 'Surabaya', 
      kategori: 'BARU' as const,
      kategori_label: 'Santri Baru (PSB)',
      detail: 'Santri Baru Angkatan 2026/2027 • Lolos Seleksi Gelombang 1 (Jalur Beasiswa Tahfidz 10 Juz)',
      selected: false 
    },
    { 
      id: 's-2', 
      nis: '202601018', 
      nama: 'Bilal Habasyi', 
      gender: 'L', 
      asal: 'Malang', 
      kategori: 'PINDAHAN' as const,
      kategori_label: 'Santri Pindahan (Mutasi Masuk)',
      detail: 'Pindahan dari Pondok Modern Gontor Darussalam Ponorogo • Rapor & Surat Mutasi Resmi Lengkap',
      selected: false 
    },
    { 
      id: 's-3', 
      nis: '202601021', 
      nama: 'Fatih Al-Ayyubi', 
      gender: 'L', 
      asal: 'Sidoarjo', 
      kategori: 'ACARA_LUAR' as const,
      kategori_label: 'Sedang Acara di Luar Sekolah',
      detail: 'Izin Tugas: Utusan Kafilah Musabaqah Qira\'atil Kutub (MQK) Kemenag RI (Kembali: 12 Okt 2026)',
      selected: false 
    },
    { 
      id: 's-4', 
      nis: '202601022', 
      nama: 'Hasan Al-Banna', 
      gender: 'L', 
      asal: 'Pasuruan', 
      kategori: 'PINDAHAN' as const,
      kategori_label: 'Santri Pindahan (Mutasi Masuk)',
      detail: 'Pindahan dari MTs Negeri 1 Kota Malang • Penyetaraan Mapel Diniyah & Muatan Lokal Pesantren',
      selected: false 
    },
    { 
      id: 's-5', 
      nis: '202601031', 
      nama: 'Umar Faruq', 
      gender: 'L', 
      asal: 'Gresik', 
      kategori: 'BARU' as const,
      kategori_label: 'Santri Baru (PSB)',
      detail: 'Santri Baru Jalur Reguler MTs • Selesai Masa Orientasi Santri Baru (Khutbatul Arsy)',
      selected: false 
    },
    { 
      id: 's-6', 
      nis: '202602004', 
      nama: 'Fathimah Az-Zahra', 
      gender: 'P', 
      asal: 'Kediri', 
      kategori: 'ACARA_LUAR' as const,
      kategori_label: 'Sedang Acara di Luar Sekolah',
      detail: 'Izin Khusus: Dampingi Orang Tua Tugas Khidmat Dakwah & Umroh di Tanah Suci (Kembali: 18 Okt 2026)',
      selected: false 
    },
  ];

  function loadUnassignedSantri() {
    if (typeof window !== 'undefined' && isTenantMode()) {
      const realSantri = getSharedSantriList();
      return realSantri.filter(s => !s.kelas_id || s.kelas_id === '').map(s => ({
        id: s.id || s.nis,
        nis: s.nis,
        nama: s.nama,
        gender: s.gender === 'akhwat' ? 'P' : 'L',
        asal: '-',
        kategori: 'BARU' as const,
        kategori_label: 'Santri Baru (PSB)',
        detail: `Santri Terdaftar: ${s.nama} • NIS: ${s.nis}`,
        selected: false,
      }));
    }
    return DEMO_UNASSIGNED_SANTRI;
  }

  const [unassignedSantri, setUnassignedSantri] = useState<any[]>(() => loadUnassignedSantri());

  useEffect(() => {
    if (isTenantMode()) {
      setUnassignedSantri(loadUnassignedSantri());
      const handleSync = () => setUnassignedSantri(loadUnassignedSantri());
      window.addEventListener('ks_tenant_santri_updated', handleSync);
      return () => window.removeEventListener('ks_tenant_santri_updated', handleSync);
    }
  }, []);

  const toggleSelectSantri = (id: string) => {
    setUnassignedSantri(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  const handleAssignRombel = () => {
    const selected = unassignedSantri.filter(s => s.selected);
    if (selected.length === 0) return;

    const targetKelasObj = MASTER_KELAS.find(k => k.id === selectedKelasTarget) || MASTER_KELAS[0];

    // Enforce Syar'i Segregation for Santri placement
    for (const s of selected) {
      const santriGender: 'ikhwan' | 'akhwat' = s.gender === 'P' ? 'akhwat' : 'ikhwan';
      if (santriGender !== targetKelasObj.gender) {
        setNotif(`❌ Pelanggaran Syar'i: Santri ${s.nama} (${s.gender === 'P' ? 'Santriwati Putri / Akhwat' : 'Santri Putra / Ikhwan'}) TIDAK BOLEH dimasukkan ke ${targetKelasObj.nama_kelas} (${targetKelasObj.kampus})! Pesantren memisahkan rombel ikhwan dan akhwat secara ketat.`);
        setTimeout(() => setNotif(''), 9000);
        return;
      }
    }

    setUnassignedSantri(prev => prev.filter(s => !s.selected));
    setNotif(`✓ Berhasil! Sebanyak ${selected.length} santri berhasil ditempatkan oleh Mudir ke ${targetKelasObj.nama_kelas} (${selectedTahun}).`);
    setTimeout(() => setNotif(''), 7000);
  };

  const handleSimpanDokumentasi = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalDokumentasi(false);

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.from('dokumentasi_mudir_yayasan').insert({
        judul: formDataDok.judul,
        jenis: formDataDok.jenis,
        tanggal: formDataDok.tanggal,
        mitra: formDataDok.mitra,
        notulensi: formDataDok.notulensi,
        tindak_lanjut: formDataDok.tindak_lanjut,
      });
    } catch (err) {
      console.warn('Supabase mudir dok sync notice:', err);
    }

    setNotif('✓ Laporan Tugas Luar & Notulensi tersimpan di database dan LANGSUNG TERLAPOR ke Ketua Yayasan!');
    setTimeout(() => setNotif(''), 6000);
  };

  const handleAbsenPribadi = async () => {
    setAbsenPribadiDone(true);
    const timeStr = new Date().toLocaleTimeString('id-ID');

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.from('presensi_sesi_harian').insert({
        tipe_presensi: 'guru_kbm',
        status_kehadiran: 'hadir',
        keterangan: 'Presensi Mandiri Mudir / Kepala Sekolah',
        waktu_scan: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase presensi mudir sync notice:', err);
    }

    setNotif('✓ Presensi Hadir Mudir berhasil dicatat ke database pada jam ' + timeStr);
    setTimeout(() => setNotif(''), 5000);
  };

  // =========================================================================
  // KALKULASI METRIK & EVALUASI AKADEMIK KBM REAL-TIME
  // =========================================================================
  const totalSesi = learningSessions.length;
  const inProgressSesi = learningSessions.filter(s => s.status === 'IN_PROGRESS').length;
  const completedSesi = learningSessions.filter(s => s.status === 'COMPLETED').length;
  const notStartedSesi = learningSessions.filter(s => s.status === 'NOT_STARTED').length;
  const jurnalTerisiCount = learningSessions.filter(s => s.activity?.topik_materi && s.activity.topik_materi.trim() !== '').length;

  let totalSantriAssessed = 0;
  let totalAchieved = 0;
  let totalRemedial = 0;
  let totalEnrichment = 0;
  const allRemedialSantri: {
    sessionId: string;
    mapel: string;
    kelas: string;
    guru: string;
    santri: { nis: string; nama: string; nilai: number; catatan?: string };
  }[] = [];

  learningSessions.forEach(session => {
    session.assessment?.results?.forEach(res => {
      totalSantriAssessed++;
      if (res.capaian === 'ACHIEVED') {
        totalAchieved++;
      }
      if (res.rekomendasi === 'REMEDIAL_REQUIRED') {
        totalRemedial++;
        allRemedialSantri.push({
          sessionId: session.id,
          mapel: session.mata_pelajaran,
          kelas: session.kelas_nama,
          guru: session.guru_nama,
          santri: { nis: res.nis, nama: res.nama, nilai: res.nilai, catatan: res.catatan },
        });
      } else if (res.rekomendasi === 'ENRICHMENT_ELIGIBLE') {
        totalEnrichment++;
      }
    });
  });

  const filteredSessions = learningSessions.filter(s => {
    if (filterSessionStatus === 'ALL') return true;
    return s.status === filterSessionStatus;
  });

  // Statistik Presensi Pegawai
  const hadirPegawaiCount = staffPresensiList.filter(p => p.status === 'masuk').length;
  const izinPegawaiCount = staffPresensiList.filter(p => p.status === 'ijin' || p.status === 'cuti').length;
  const sakitPegawaiCount = staffPresensiList.filter(p => p.status === 'sakit').length;

  return (
    <div className="space-y-6">
      {/* Header Mudir - Pilar 5 Governance */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-500/40">
              PILAR 5: MUDIR / KEPALA SEKOLAH
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-950/60 text-teal-200 border border-teal-500/30">
              Domain: Akademik & Proses KBM (Guru & Santri)
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Pusat Kendali Akademik Pesantren</h1>
          <p className="text-xs text-emerald-200 mt-1">
            Supervisi KBM Live di Kelas, Pemantauan Guru & Santri, Penugasan Guru Pengganti (Inval), Capaian Belajar & Rombel
          </p>
          <div className="mt-2.5 flex items-center space-x-2 text-[11px] text-emerald-100 flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/30">
              ✓ Otoritas Penuh: KBM, Silabus, Evaluasi KKM, Inval & Rombel
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900/60 border border-slate-600/40 text-slate-300">
              🔒 Batas: Bukan Approver Cuti (Otoritas HRD)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900/60 border border-slate-600/40 text-slate-300">
              🔒 Batas: Gaji Guru Terenkripsi (Otoritas Keuangan)
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          {!absenPribadiDone ? (
            <button
              onClick={handleAbsenPribadi}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Absen Mandiri Mudir</span>
            </button>
          ) : (
            <span className="w-full sm:w-auto px-3 py-2 bg-emerald-950/60 border border-emerald-500 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mudir Sudah Absen Hadir</span>
            </span>
          )}

          <button
            onClick={() => setModalDokumentasi(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Input Dokumentasi Rapat/Tugas Luar</span>
          </button>

          <button
            onClick={() => setModalIzinDinas(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
            title="Mudir mengajukan izin tugas dinas ke luar pesantren"
          >
            <Briefcase className="w-4 h-4 text-slate-950" />
            <span>+ Ajukan Izin Tugas Keluar (Dinas)</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notif}</span>
        </div>
      )}

      {/* ALERT KESANTRIAN DI DASHBOARD MUDIR */}
      {overduePermissionCount > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">
                Alert Kesantrian: Ditemukan {overduePermissionCount} Kasus Perizinan Terlambat / Membutuhkan Case Review
              </span>
              <p className="text-[11px] text-rose-700">
                Santri melampaui batas waktu izin. Sistem menerapkan alur Case Review untuk memeriksa alasan sah sebelum vonis sanksi disiplin.
              </p>
            </div>
          </div>
          <Link
            href="/akademik/perizinan"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1 shrink-0 self-start sm:self-auto"
          >
            <span>Tinjau Perizinan Santri ➔</span>
          </Link>
        </div>
      )}

      {/* 6 Tab Navigasi Mudir (Mobile Friendly: Swipe Horizontal di Layar HP, Grid di Layar Lebar) */}
      <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 select-none">
        <button
          onClick={() => handleSwitchTab('kbm')}
          className={`min-w-[135px] sm:min-w-0 shrink-0 sm:shrink p-3 rounded-xl text-left border transition ${
            activeTab === 'kbm'
              ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <School className={`w-5 h-5 mb-1.5 ${activeTab === 'kbm' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <h4 className="font-bold text-xs text-slate-800">1. Proses KBM</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Sesi Live & Jurnal</p>
        </button>

        <button
          onClick={() => handleSwitchTab('inval')}
          className={`min-w-[135px] sm:min-w-0 shrink-0 sm:shrink p-3 rounded-xl text-left border transition ${
            activeTab === 'inval'
              ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <UserPlus className={`w-5 h-5 mb-1.5 ${activeTab === 'inval' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <h4 className="font-bold text-xs text-slate-800">2. Guru & Inval</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Guru Pengganti Cuti</p>
        </button>

        <button
          onClick={() => handleSwitchTab('absen')}
          className={`min-w-[135px] sm:min-w-0 shrink-0 sm:shrink p-3 rounded-xl text-left border transition ${
            activeTab === 'absen'
              ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <UserCheck className={`w-5 h-5 mb-1.5 ${activeTab === 'absen' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <h4 className="font-bold text-xs text-slate-800">3. Absen Staf</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Guru & Musyrif</p>
        </button>

        <button
          onClick={() => handleSwitchTab('hafalan')}
          className={`min-w-[135px] sm:min-w-0 shrink-0 sm:shrink p-3 rounded-xl text-left border transition ${
            activeTab === 'hafalan'
              ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <BookOpen className={`w-5 h-5 mb-1.5 ${activeTab === 'hafalan' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <h4 className="font-bold text-xs text-slate-800">4. Hafalan Kelas</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Target Juz Santri</p>
        </button>

        <button
          onClick={() => handleSwitchTab('assign_kelas')}
          className={`min-w-[135px] sm:min-w-0 shrink-0 sm:shrink p-3 rounded-xl text-left border transition ${
            activeTab === 'assign_kelas'
              ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <GraduationCap className={`w-5 h-5 mb-1.5 ${activeTab === 'assign_kelas' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <h4 className="font-bold text-xs text-slate-800">5. Assign Rombel</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Penempatan Santri</p>
        </button>

        <button
          onClick={() => handleSwitchTab('dokumentasi')}
          className={`min-w-[135px] sm:min-w-0 shrink-0 sm:shrink p-3 rounded-xl text-left border transition ${
            activeTab === 'dokumentasi'
              ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
          }`}
        >
          <FileText className={`w-5 h-5 mb-1.5 ${activeTab === 'dokumentasi' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <h4 className="font-bold text-xs text-slate-800">6. Dokumentasi</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Laporan ke Yayasan</p>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* KONTEN TAB 1: KBM (REPORTING AKTUAL SESUAI ALUR TO-BE & THEN) */}
      {/* ========================================================================= */}
      {activeTab === 'kbm' && (
        <div className="space-y-5">
          {/* Header Monitoring KBM Aktual */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <School className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Pelaporan & Monitoring KBM Aktual (Learning Sessions)</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Laporan aktual langsung dari sesi belajar mengajar: Jadwal, Presensi, Jurnal Guru, dan Hasil Evaluasi Remedial / Pengayaan
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={refreshKbmData}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center space-x-1"
                  title="Segarkan data KBM"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setModalTambahMapel(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                  title="Mudir menambahkan mata pelajaran dan jadwal KBM baru ke kurikulum"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Mata Pelajaran &amp; Jadwal KBM</span>
                </button>
                <Link
                  href="/akademik/nilai"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Buka Ruang KBM Guru ➔</span>
                </Link>
              </div>
            </div>

            {/* 4 Kartu KPI Metrik KBM Aktual */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Total Sesi KBM Hari Ini</span>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-xl font-bold text-slate-800 font-mono">{totalSesi} Sesi</div>
                <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <span className="text-emerald-600 font-semibold">{inProgressSesi} Berlangsung</span>
                  <span>•</span>
                  <span className="text-blue-600 font-semibold">{completedSesi} Selesai</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-900 font-semibold">Sesi Berlangsung (Live)</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
                <div className="text-xl font-bold text-emerald-800 font-mono flex items-center space-x-1.5">
                  <span>{inProgressSesi} Sesi Aktif</span>
                </div>
                <span className="text-[11px] text-emerald-700 block">
                  {inProgressSesi > 0 ? 'Guru sedang aktif mengajar di kelas' : 'Tidak ada sesi KBM aktif saat ini'}
                </span>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-blue-900 font-semibold">Jurnal Guru Terisi</span>
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xl font-bold text-blue-800 font-mono">{jurnalTerisiCount} / {totalSesi} Jurnal</div>
                <span className="text-[11px] text-blue-700 block">
                  {totalSesi > 0 ? Math.round((jurnalTerisiCount / totalSesi) * 100) : 0}% Realisasi Silabus & Topik
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-amber-900 font-semibold">Evaluasi Capaian Santri</span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xl font-bold text-amber-900 font-mono">
                  {totalAchieved} <span className="text-xs font-normal text-slate-500">Tuntas</span> / {totalRemedial} <span className="text-xs font-normal text-rose-600">Remedial</span>
                </div>
                <span className="text-[11px] text-amber-800 block">
                  {totalRemedial > 0 ? `⚠️ ${totalRemedial} santri butuh bimbingan remedial` : '✓ Seluruh capaian santri tuntas KKM'}
                </span>
              </div>
            </div>
          </div>

          {/* PERHATIAN AKADEMIK MUDIR: DAFTAR SANTRI REMEDIAL_REQUIRED */}
          {allRemedialSantri.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-300 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-xs sm:text-sm">
                      Perhatian Akademik Mudir: Ditemukan {allRemedialSantri.length} Santri Memerlukan Bimbingan Remedial (REMEDIAL_REQUIRED)
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      Sistem otomatis mengidentifikasi santri dengan nilai di bawah KKM 75 dari hasil asesmen terpadu guru.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-200 text-amber-900 font-mono font-bold text-xs rounded-full border border-amber-300">
                  Target KKM: 75
                </span>
              </div>

              <div className="overflow-x-auto bg-white rounded-xl border border-amber-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-100/60 text-amber-900 uppercase text-[10px] tracking-wider border-b border-amber-200">
                    <tr>
                      <th className="p-2.5">NIS</th>
                      <th className="p-2.5">Nama Santri</th>
                      <th className="p-2.5">Kelas & Rombel</th>
                      <th className="p-2.5">Mata Pelajaran</th>
                      <th className="p-2.5">Guru Pengampu</th>
                      <th className="p-2.5 text-center">Nilai Aktual</th>
                      <th className="p-2.5">Status Evaluasi Sistem</th>
                      <th className="p-2.5">Catatan Diagnostik Guru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {allRemedialSantri.map((item, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/50">
                        <td className="p-2.5 font-mono text-slate-600">{item.santri.nis}</td>
                        <td className="p-2.5 font-bold text-slate-800">{item.santri.nama}</td>
                        <td className="p-2.5 text-slate-700">{item.kelas}</td>
                        <td className="p-2.5 text-slate-700 font-semibold">{item.mapel}</td>
                        <td className="p-2.5 text-slate-600">{item.guru}</td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-rose-100 text-rose-800 border border-rose-200">
                            {item.santri.nilai}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-200">
                            REMEDIAL_REQUIRED
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 text-[11px] italic">
                          {item.santri.catatan || 'Perlu bimbingan ulang konsep materi'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Filter Status Sesi & Daftar Sesi KBM */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Filter Status Sesi:</span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    onClick={() => setFilterSessionStatus('ALL')}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      filterSessionStatus === 'ALL'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Semua Sesi ({totalSesi})
                  </button>
                  <button
                    onClick={() => setFilterSessionStatus('IN_PROGRESS')}
                    className={`px-3 py-1 rounded-lg font-semibold transition flex items-center space-x-1 ${
                      filterSessionStatus === 'IN_PROGRESS'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Sedang Berlangsung ({inProgressSesi})</span>
                  </button>
                  <button
                    onClick={() => setFilterSessionStatus('COMPLETED')}
                    className={`px-3 py-1 rounded-lg font-semibold transition flex items-center space-x-1 ${
                      filterSessionStatus === 'COMPLETED'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selesai ({completedSesi})</span>
                  </button>
                  <button
                    onClick={() => setFilterSessionStatus('NOT_STARTED')}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      filterSessionStatus === 'NOT_STARTED'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Belum Dimulai ({notStartedSesi})
                  </button>
                </div>
              </div>

              <span className="text-[11px] text-slate-500">
                Menampilkan <strong>{filteredSessions.length}</strong> sesi pembelajaran
              </span>
            </div>

            {/* List Sesi KBM Terdaftar */}
            <div className="space-y-3">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => {
                  const hadir = session.presensi.filter(p => p.status === 'HADIR').length;
                  const sakit = session.presensi.filter(p => p.status === 'SAKIT').length;
                  const izin = session.presensi.filter(p => p.status === 'IZIN').length;
                  const alpa = session.presensi.filter(p => p.status === 'ALPA').length;

                  const passCount = session.assessment.results.filter(r => r.capaian === 'ACHIEVED').length;
                  const remCount = session.assessment.results.filter(r => r.rekomendasi === 'REMEDIAL_REQUIRED').length;

                  return (
                    <div
                      key={session.id}
                      className={`p-4 rounded-xl border transition space-y-3 ${
                        session.status === 'IN_PROGRESS'
                          ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                          : session.status === 'COMPLETED'
                          ? 'border-blue-200 bg-blue-50/10'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center flex-wrap gap-2">
                          {session.status === 'IN_PROGRESS' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1.5 shadow-xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                              <span>SEDANG BERLANGSUNG (IN_PROGRESS)</span>
                            </span>
                          )}
                          {session.status === 'COMPLETED' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>SELESAI (COMPLETED)</span>
                            </span>
                          )}
                          {session.status === 'NOT_STARTED' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                              TERJADWAL (NOT_STARTED)
                            </span>
                          )}

                          {session.is_inval && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                              <span>🔄 GURU PENGGANTI (INVAL)</span>
                            </span>
                          )}

                          <span className="text-xs font-mono font-semibold text-slate-600 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Jadwal: {session.jam_jadwal}</span>
                          </span>

                          {session.waktu_mulai_aktual && (
                            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono border border-emerald-200">
                              Mulai Aktual: {session.waktu_mulai_aktual}
                            </span>
                          )}
                          {session.waktu_selesai_aktual && (
                            <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono border border-blue-200">
                              Selesai Aktual: {session.waktu_selesai_aktual}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedDetailSession(session)}
                            className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-2xs transition flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Lihat Laporan Detail</span>
                          </button>
                          <Link
                            href={`/akademik/nilai?session=${session.id}`}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Buka di Ruang Guru</span>
                          </Link>
                        </div>
                      </div>

                      {/* Info Guru, Mapel, Kelas */}
                      <div className="grid md:grid-cols-3 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Mata Pelajaran & Kelas</span>
                          <h4 className="font-bold text-slate-800 text-sm">{session.mata_pelajaran}</h4>
                          <p className="text-slate-600 font-semibold">{session.kelas_nama}</p>
                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            <div className="flex items-center space-x-1 flex-wrap">
                              <span>Guru: <strong className={session.is_inval ? "text-amber-800 font-bold" : "text-slate-700"}>{session.guru_nama}</strong></span>
                              {session.is_inval && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  INVAL KBM
                                </span>
                              )}
                            </div>
                            {session.guru_asli_nama && session.is_inval && (
                              <p className="text-[10px] text-amber-700 italic">
                                Menggantikan: {session.guru_asli_nama} (sedang cuti)
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400">{session.ruang_kelas}</p>
                          </div>
                        </div>

                        {/* Presensi Sesi */}
                        <div className="space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Presensi Sesi ({session.presensi.length} Santri)</span>
                            <span className="text-[10px] font-bold text-emerald-700">{hadir} Hadir</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">{hadir} Hadir</span>
                            {sakit > 0 && <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">{sakit} Sakit</span>}
                            {izin > 0 && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">{izin} Izin</span>}
                            {alpa > 0 && <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">{alpa} Alpa</span>}
                          </div>
                          <p className="text-[10px] text-slate-500 italic mt-1 truncate">
                            {session.presensi.find(p => p.keterangan)?.nama}: {session.presensi.find(p => p.keterangan)?.keterangan || 'Presensi lengkap tercatat'}
                          </p>
                        </div>

                        {/* Jurnal & Evaluasi Asesmen */}
                        <div className="space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Aktivitas Jurnal & Asesmen</span>
                          <p className="text-slate-800 font-medium truncate">
                            📝 {session.activity.topik_materi || 'Jurnal materi belum diisi'}
                          </p>
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                            <span className="text-slate-600">KKM: <strong>{session.assessment.target_kkm}</strong></span>
                            <div className="flex items-center space-x-1.5 font-bold">
                              <span className="text-emerald-700">{passCount} Tuntas</span>
                              {remCount > 0 && (
                                <span className="text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                  {remCount} Remedial
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-2">
                  <School className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="font-semibold text-xs">Tidak ada sesi pembelajaran dengan status terpilih.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KONTEN TAB 2: GURU & PENUGASAN INVAL (NOTIFIKASI CUTI DARI HRD) */}
      {/* ========================================================================= */}
      {activeTab === 'inval' && (
        <div className="space-y-5">
          {/* Header Supervisi Guru & Penugasan Inval */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Supervisi Asatidz & Penugasan Guru Pengganti (Inval)</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sesuai 6-Pilar Governance: Cuti di-ACC oleh HRD. Mudir menerima notifikasi untuk menugaskan Guru Pengganti (Inval) agar KBM santri tidak kosong.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Otoritas KBM: Mudir Pesantren
                </span>
                <button
                  onClick={() => setModalInvalMandiri(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                  title="Mudir menugaskan guru pengganti (inval) darurat/mandiri"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tugaskan Guru Inval Mandiri</span>
                </button>
              </div>
            </div>

            {/* Metric KPI Inval & Asatidz */}
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold block">Total Guru Terdaftar</span>
                <span className="text-xl font-bold font-mono text-slate-800">
                  2 Guru Pengampu & Wali Kelas
                </span>
                <span className="text-[10px] text-slate-500 block">Unit MTs & MA Takhasus</span>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
                <span className="text-amber-900 font-semibold block">Guru Mengajukan / Cuti Aktif</span>
                <span className="text-xl font-bold font-mono text-amber-800">
                  {teacherLeaves.length} Pengajuan Cuti
                </span>
                <span className="text-[10px] text-amber-700 block">
                  {teacherLeaves.filter(l => l.substitute_staff_name).length} dari {teacherLeaves.length} telah ditugaskan Inval
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-emerald-900 font-semibold block">Integritas Proses KBM Santri</span>
                <span className="text-xl font-bold font-mono text-emerald-700">100% Tercover</span>
                <span className="text-[10px] text-emerald-600 block">Nol Jam Pelajaran Kosong</span>
              </div>
            </div>
          </div>

          {/* Daftar Notifikasi Cuti Guru & Penugasan Inval */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                  <span>Notifikasi Cuti Guru dari HRD & Status Guru Pengganti (Inval)</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {teacherLeaves.length} Berkas
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Pastikan setiap guru yang izin cuti telah memiliki guru pengganti yang siap mengajar di kelas santri.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Guru Pemohon Cuti</th>
                    <th className="p-3">Tanggal & Durasi Cuti</th>
                    <th className="p-3">Alasan Cuti</th>
                    <th className="p-3">Status Otoritas HRD</th>
                    <th className="p-3">Guru Pengganti (Inval)</th>
                    <th className="p-3 text-center">Status KBM Santri</th>
                    <th className="p-3 text-center">Aksi Mudir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherLeaves.map((leave) => {
                    const hasSubstitute = !!leave.substitute_staff_name && leave.substitute_staff_name.trim().length > 0;
                    return (
                      <tr key={leave.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{leave.employee_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{leave.employee_nip} • Guru KBM</div>
                        </td>
                        <td className="p-3 font-mono text-slate-700">
                          <div>{leave.start_date} s/d {leave.end_date}</div>
                          <span className="text-[10px] font-bold text-slate-500">{leave.total_days} Hari Kerja</span>
                        </td>
                        <td className="p-3 text-slate-600 text-xs max-w-xs truncate">
                          {leave.reason}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            leave.status === 'APPROVED_BY_HRD'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : leave.status === 'SUBMITTED'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {leave.status === 'APPROVED_BY_HRD' ? '✓ DI-ACC HRD' : leave.status === 'SUBMITTED' ? 'MENUNGGU ACC HRD' : 'DITOLAK HRD'}
                          </span>
                        </td>
                        <td className="p-3">
                          {hasSubstitute ? (
                            <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{leave.substitute_staff_name}</span>
                            </div>
                          ) : (
                            <span className="text-rose-600 italic text-[11px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              ⚠️ Belum ada guru pengganti
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {hasSubstitute ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              TERTANGGULANGI
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              KELAS KOSONG!
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedLeaveForInval(leave);
                              setInputSubTeacher(leave.substitute_staff_name || 'Ust. Lukman Hakim, M.Kom.');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                          >
                            {hasSubstitute ? 'Ganti Inval' : 'Tugaskan Inval'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KONTEN TAB 3: ABSENSI ASATIDZ & PEGAWAI (TERMASUK RUMAH TANGGA) */}
      {/* ========================================================================= */}
      {activeTab === 'absen' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Monitoring Absensi Pegawai & Asatidz Hari Ini</h3>
              <p className="text-xs text-slate-500">
                Pencatatan kehadiran Guru KBM, Musyrif Asrama, Tata Usaha, dan Bagian Rumah Tangga (Sesuai Revisi)
              </p>
            </div>
            <Link
              href="/presensi"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Buka Formulir Presensi Pegawai ➔</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-900 font-semibold block">Hadir / Masuk Kerja</span>
              <span className="text-xl font-bold font-mono text-emerald-700">{hadirPegawaiCount} Pegawai</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Tercatat di lokasi tugas</span>
            </div>
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-blue-900 font-semibold block">Izin / Cuti Dinas</span>
              <span className="text-xl font-bold font-mono text-blue-700">{izinPegawaiCount} Pegawai</span>
              <span className="text-[10px] text-blue-600 block mt-0.5">Seminar & Izin resmi</span>
            </div>
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-rose-900 font-semibold block">Sakit</span>
              <span className="text-xl font-bold font-mono text-rose-700">{sakitPegawaiCount} Pegawai</span>
              <span className="text-[10px] text-rose-600 block mt-0.5">Surat dokter terlampir</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-semibold block">Total Log Tercatat</span>
              <span className="text-xl font-bold font-mono text-slate-800">{staffPresensiList.length} Log</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sinkronisasi real-time</span>
            </div>
          </div>

          {/* Tabel Log Presensi Aktual */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Pegawai</th>
                  <th className="p-3">Jabatan & Divisi</th>
                  <th className="p-3">Lokasi / Tempat Scan</th>
                  <th className="p-3">Tanggal & Waktu</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffPresensiList.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-bold text-slate-800">{log.pegawai_nama}</td>
                    <td className="p-3">
                      <span className="text-slate-700 font-medium">{log.jabatan}</span>
                      <span className="text-[10px] text-slate-400 block">{log.divisi}</span>
                    </td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">{log.tempat}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      <div>{log.tanggal}</div>
                      <div className="text-[10px] text-slate-400">{log.waktu}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        log.status === 'masuk'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : log.status === 'pulang'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : log.status === 'ijin' || log.status === 'cuti'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px] italic">
                      {log.keterangan || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KONTEN TAB 3: HAFALAN KELAS */}
      {/* ========================================================================= */}
      {activeTab === 'hafalan' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Progres Capaian Hafalan per Kelas</h3>
              <p className="text-xs text-slate-500">Monitoring target juz vs realisasi capaian rata-rata tiap rombel</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Kelas / Rombel</th>
                  <th className="p-3 text-center">Jumlah Santri</th>
                  <th className="p-3 text-center">Target (Juz)</th>
                  <th className="p-3 text-center">Capaian Rata-Rata</th>
                  <th className="p-3">Status Evaluasi Mudir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {progresHafalanKelas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                      Belum ada data capaian hafalan per kelas.
                    </td>
                  </tr>
                ) : (
                  progresHafalanKelas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-bold text-slate-800">{item.kelas}</td>
                    <td className="p-3 text-center font-mono">{item.jumlah_santri}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-700">{item.target_juz} Juz</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-700">{item.capaian_rata} Juz</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        item.status.includes('Melampaui')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.status.includes('Selesai')
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : item.status.includes('Perlu')
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KONTEN TAB 4: DOKUMENTASI TUGAS LUAR */}
      {/* ========================================================================= */}
      {activeTab === 'dokumentasi' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Dokumentasi Tugas Luar & Notulensi Rapat Mudir</h3>
              <p className="text-xs text-slate-500">Laporan otomatis diteruskan langsung ke Dashboard Ketua Yayasan</p>
            </div>
            <button
              onClick={() => setModalDokumentasi(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Notulensi Baru</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[10px] uppercase">Rapat Eksternal</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1">Rapat Koordinasi Ujian Bersama Kemenag Kab. Malang</h4>
                  <p className="text-slate-400 text-[11px]">Tanggal: 02 Oktober 2026 • Instansi: Kemenag Seksi Pendidikan Madrasah</p>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  ✓ Dilaporkan ke Yayasan
                </span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Pembahasan jadwal Asesmen Sumatif Akhir Jenjang dan pembagian zonasi pengawas silang antar-madrasah.
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-emerald-800 font-medium">
                📌 Tindak Lanjut: Mempersiapkan SK Panitia Ujian dan mengunggah bank soal sebelum 15 Oktober 2026.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KONTEN TAB 5: ASSIGN KELAS & ROMBEL (PINDAH KE DASHBOARD MUDIR) */}
      {/* ========================================================================= */}
      {activeTab === 'assign_kelas' && (
        <div className="space-y-5">
          {/* Header Panel Assign Kelas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                  <span>Assign Kelas & Penempatan Rombongan Belajar (Rombel)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Wewenang Kepala Sekolah / Mudir dalam menetapkan santri ke dalam rombongan belajar dan wali kelas
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Otoritas: Mudir Pesantren
                </span>
                <button
                  onClick={() => setModalTambahRombel(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                  title="Mendirikan atau membuka rombel kelas baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Buka Rombel Baru</span>
                </button>
              </div>
            </div>

            {/* Filter Rombel & Tahun Ajaran */}
            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran Aktif</label>
                <select
                  value={selectedTahun}
                  onChange={(e) => setSelectedTahun(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                >
                  <option>2026/2027 Ganjil</option>
                  <option>2026/2027 Genap</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenjang / Unit Pendidikan</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                >
                  <option>MTs Tahfidz Sains</option>
                  <option>MA Unggulan Al-Qur'an</option>
                  <option>Pondok Pesantren Takhasus</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Kelas / Rombel Tujuan</label>
                <select
                  value={selectedKelasTarget}
                  onChange={(e) => setSelectedKelasTarget(e.target.value)}
                  className="w-full p-2.5 bg-emerald-50/60 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-900"
                >
                  {((typeof window !== 'undefined' && isTenantMode()) ? getSharedMasterKelas() : (getSharedMasterKelas().length > 0 ? getSharedMasterKelas() : MASTER_KELAS)).length === 0 ? (
                    <option value="">-- Belum ada rombel dibuka --</option>
                  ) : (
                    ((typeof window !== 'undefined' && isTenantMode()) ? getSharedMasterKelas() : (getSharedMasterKelas().length > 0 ? getSharedMasterKelas() : MASTER_KELAS)).map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kelas} (Wali: {k.wali_kelas})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Daftar Santri Belum Memiliki Kelas dengan Penjelasan Status Eksplisit */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                  <span>Daftar Santri Belum Ditempatkan ke Kelas (Rombel)</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    {unassignedSantri.length} Santri
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Transparansi status: Membedakan santri baru, santri mutasi pindahan, dan santri yang sedang berhalangan hadir / acara dinas di luar sekolah
                </p>
              </div>

              <button
                onClick={handleAssignRombel}
                disabled={unassignedSantri.filter(s => s.selected).length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <Check className="w-4 h-4" />
                <span>
                  Tempatkan {unassignedSantri.filter(s => s.selected).length} Santri Terpilih ke Kelas
                </span>
              </button>
            </div>

            {/* Filter Pills Kategori Status */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-500">Filter Status:</span>
              <button
                onClick={() => setFilterStatusSantri('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterStatusSantri === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua ({unassignedSantri.length})
              </button>
              <button
                onClick={() => setFilterStatusSantri('BARU')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center space-x-1 ${
                  filterStatusSantri === 'BARU'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span>🌱 Santri Baru ({unassignedSantri.filter(s => s.kategori === 'BARU').length})</span>
              </button>
              <button
                onClick={() => setFilterStatusSantri('PINDAHAN')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center space-x-1 ${
                  filterStatusSantri === 'PINDAHAN'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-blue-800 hover:bg-blue-50'
                }`}
              >
                <span>🔄 Santri Pindahan ({unassignedSantri.filter(s => s.kategori === 'PINDAHAN').length})</span>
              </button>
              <button
                onClick={() => setFilterStatusSantri('ACARA_LUAR')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center space-x-1 ${
                  filterStatusSantri === 'ACARA_LUAR'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span>🎪 Sedang Acara Luar ({unassignedSantri.filter(s => s.kategori === 'ACARA_LUAR').length})</span>
              </button>
            </div>

            {unassignedSantri.filter(s => filterStatusSantri === 'ALL' || s.kategori === filterStatusSantri).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-10 text-center">Pilih</th>
                      <th className="p-3">Santri &amp; NIS</th>
                      <th className="p-3">Status Kategori</th>
                      <th className="p-3">Penjelasan &amp; Detail Kondisi Santri</th>
                      <th className="p-3">Asal &amp; Gender</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unassignedSantri
                      .filter(s => filterStatusSantri === 'ALL' || s.kategori === filterStatusSantri)
                      .map((santri) => (
                      <tr 
                        key={santri.id} 
                        onClick={() => toggleSelectSantri(santri.id)}
                        className={`cursor-pointer transition ${santri.selected ? 'bg-emerald-50/70' : 'hover:bg-slate-50'}`}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={santri.selected}
                            onChange={() => toggleSelectSantri(santri.id)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800 text-xs">{santri.nama}</div>
                          <div className="text-[10px] font-mono text-slate-400">NIS: {santri.nis}</div>
                        </td>
                        <td className="p-3">
                          {santri.kategori === 'BARU' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center space-x-1">
                              <span>🌱 Santri Baru (PSB)</span>
                            </span>
                          )}
                          {santri.kategori === 'PINDAHAN' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 inline-flex items-center space-x-1">
                              <span>🔄 Santri Pindahan</span>
                            </span>
                          )}
                          {santri.kategori === 'ACARA_LUAR' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center space-x-1">
                              <span>🎪 Acara Luar Sekolah</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 max-w-md">
                          <p className="text-slate-700 text-[11px] font-medium leading-relaxed">
                            {santri.detail}
                          </p>
                        </td>
                        <td className="p-3 text-[11px] text-slate-600">
                          <div>{santri.asal}</div>
                          <span className={`text-[10px] font-semibold ${santri.gender === 'L' ? 'text-blue-700' : 'text-pink-700'}`}>
                            {santri.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                          </span>
                        </td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              const targetKelasObj = MASTER_KELAS.find(k => k.id === selectedKelasTarget) || MASTER_KELAS[0];
                              setUnassignedSantri(prev => prev.filter(s => s.id !== santri.id));
                              setNotif(`✓ Santri ${santri.nama} (${santri.kategori_label}) berhasil ditempatkan ke ${targetKelasObj.nama_kelas}!`);
                              setTimeout(() => setNotif(''), 6000);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-semibold rounded-lg text-[11px] transition shadow-2xs"
                            title="Tempatkan santri ini langsung ke kelas target"
                          >
                            + Tempatkan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h5 className="font-bold text-slate-800 text-sm">Tidak Ada Santri Belum Terassign pada Kategori Ini!</h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Semua santri pada kategori yang dipilih telah berhasil ditempatkan ke dalam rombongan belajar.
                </p>
              </div>
            )}
          </div>

          {/* Ringkasan Distribusi Kelas yang Ada */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Daftar Rombel & Keterisian Kelas Terdaftar</h4>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              {((typeof window !== 'undefined' && isTenantMode()) ? getSharedMasterKelas() : (getSharedMasterKelas().length > 0 ? getSharedMasterKelas() : MASTER_KELAS)).length === 0 ? (
                <div className="col-span-3 p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600 text-xs">Belum ada rombel kelas terdaftar</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Klik "+ Buka Rombel Baru" di atas untuk menambahkan rombongan belajar.</p>
                </div>
              ) : (
                ((typeof window !== 'undefined' && isTenantMode()) ? getSharedMasterKelas() : (getSharedMasterKelas().length > 0 ? getSharedMasterKelas() : MASTER_KELAS)).map((k) => (
                  <div key={k.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{k.nama_kelas}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {k.jumlah_santri} Santri
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">Wali Kelas: {k.wali_kelas}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT DOKUMENTASI MANUAL */}
      {modalDokumentasi && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base">Input Laporan Tugas Luar / Rapat Mudir</h3>
            <p className="text-xs text-slate-500">Laporan ini akan langsung tampil di dashboard Ketua Yayasan.</p>

            <form onSubmit={handleSimpanDokumentasi} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Kegiatan / Agenda Rapat *</label>
                <input
                  type="text"
                  required
                  value={formDataDok.judul}
                  onChange={(e) => setFormDataDok({ ...formDataDok, judul: e.target.value })}
                  placeholder="Contoh: Rapat Koordinasi Kurikulum Kemenag"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kegiatan *</label>
                  <select
                    value={formDataDok.jenis}
                    onChange={(e) => setFormDataDok({ ...formDataDok, jenis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="tugas_luar">Tugas Dinas Luar</option>
                    <option value="rapat_eksternal">Rapat Eksternal</option>
                    <option value="kunjungan_dinas">Kunjungan Tamu / Dinas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instansi / Pihak Luar *</label>
                  <input
                    type="text"
                    required
                    value={formDataDok.mitra}
                    onChange={(e) => setFormDataDok({ ...formDataDok, mitra: e.target.value })}
                    placeholder="Contoh: Kemenag / Disdik"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hasil Rapat & Notulensi *</label>
                <textarea
                  rows={3}
                  required
                  value={formDataDok.notulensi}
                  onChange={(e) => setFormDataDok({ ...formDataDok, notulensi: e.target.value })}
                  placeholder="Tuliskan poin-poin keputusan dan hasil penting..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tindak Lanjut yang Harus Dilakukan Pondok</label>
                <input
                  type="text"
                  value={formDataDok.tindak_lanjut}
                  onChange={(e) => setFormDataDok({ ...formDataDok, tindak_lanjut: e.target.value })}
                  placeholder="Contoh: Persiapan berkas akreditasi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalDokumentasi(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Kirim Laporan ke Ketua Yayasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL LAPORAN SESI KBM AKTUAL */}
      {selectedDetailSession && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedDetailSession.status === 'IN_PROGRESS'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : selectedDetailSession.status === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedDetailSession.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Sesi ID: {selectedDetailSession.id}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mt-1">{selectedDetailSession.mata_pelajaran}</h3>
                <p className="text-xs text-slate-500">
                  {selectedDetailSession.kelas_nama} • {selectedDetailSession.ruang_kelas}
                </p>
              </div>

              <button
                onClick={() => setSelectedDetailSession(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sesi Metadata Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px]">Guru Pengampu</span>
                <span className="font-bold text-slate-800">{selectedDetailSession.guru_nama}</span>
                {selectedDetailSession.is_inval && (
                  <span className="text-[10px] text-amber-700 block font-medium">
                    (Inval: {selectedDetailSession.guru_asli_nama})
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px]">Jadwal KBM</span>
                <span className="font-bold font-mono text-slate-800">{selectedDetailSession.jam_jadwal}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px]">Waktu Mulai Aktual</span>
                <span className="font-bold font-mono text-emerald-700">{selectedDetailSession.waktu_mulai_aktual || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px]">Waktu Selesai Aktual</span>
                <span className="font-bold font-mono text-blue-700">{selectedDetailSession.waktu_selesai_aktual || '-'}</span>
              </div>
            </div>

            {/* Bagian 1: Data Presensi Santri */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>1. Presensi Santri ({selectedDetailSession.presensi.length} Terdaftar)</span>
                </h4>
                <div className="flex gap-1.5 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {selectedDetailSession.presensi.filter(p => p.status === 'HADIR').length} Hadir
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {selectedDetailSession.presensi.filter(p => p.status === 'SAKIT').length} Sakit
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {selectedDetailSession.presensi.filter(p => p.status === 'IZIN').length} Izin
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    {selectedDetailSession.presensi.filter(p => p.status === 'ALPA').length} Alpa
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2.5">NIS</th>
                      <th className="p-2.5">Nama Santri</th>
                      <th className="p-2.5 text-center">Status</th>
                      <th className="p-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedDetailSession.presensi.map((santri) => (
                      <tr key={santri.santri_id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-600">{santri.nis}</td>
                        <td className="p-2.5 font-bold text-slate-800">{santri.nama}</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            santri.status === 'HADIR'
                              ? 'bg-emerald-100 text-emerald-800'
                              : santri.status === 'SAKIT'
                              ? 'bg-amber-100 text-amber-800'
                              : santri.status === 'IZIN'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {santri.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 text-[11px] italic">
                          {santri.keterangan || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bagian 2: Jurnal Mengajar & Learning Activity */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>2. Jurnal Pembelajaran Guru (Learning Activity)</span>
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Topik Materi Pembelajaran</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedDetailSession.activity.topik_materi || 'Belum diisi'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Bab / Sub-Bab Pembahasan</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedDetailSession.activity.bab_pembahasan || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Metode Pembelajaran</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{selectedDetailSession.activity.metode_pembelajaran || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Catatan KBM & Situasi Kelas</span>
                  <p className="text-slate-600 text-[11px] italic mt-0.5">{selectedDetailSession.activity.catatan_kbm || '-'}</p>
                </div>
              </div>
            </div>

            {/* Bagian 3: Assessment & Evaluasi Capaian */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>3. Hasil Penilaian & Evaluasi Capaian Sistem</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedDetailSession.assessment.judul_tugas} • Tipe: {selectedDetailSession.assessment.tipe}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-mono font-bold text-xs rounded-full border border-amber-300">
                  Target KKM: {selectedDetailSession.assessment.target_kkm}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2.5">NIS</th>
                      <th className="p-2.5">Nama Santri</th>
                      <th className="p-2.5 text-center">Nilai</th>
                      <th className="p-2.5 text-center">Capaian</th>
                      <th className="p-2.5">Rekomendasi Sistem</th>
                      <th className="p-2.5">Catatan Evaluasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedDetailSession.assessment.results.map((res) => (
                      <tr key={res.santri_id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-600">{res.nis}</td>
                        <td className="p-2.5 font-bold text-slate-800">{res.nama}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-sm">
                          <span className={res.nilai >= selectedDetailSession.assessment.target_kkm ? 'text-emerald-700' : 'text-rose-600'}>
                            {res.nilai}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            res.capaian === 'ACHIEVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {res.capaian}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            res.rekomendasi === 'ENRICHMENT_ELIGIBLE'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {res.rekomendasi}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 text-[11px] italic">
                          {res.catatan || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <Link
                href={`/akademik/nilai?session=${selectedDetailSession.id}`}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center space-x-1.5"
              >
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                <span>Buka Ruang Guru untuk Sesi Ini</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedDetailSession(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Tutup Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENUGASAN GURU PENGGANTI (INVAL) */}
      {selectedLeaveForInval && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Penugasan Guru Pengganti (Inval)</h3>
                <p className="text-xs text-slate-500">Mudir menentukan guru yang menggantikan jam KBM santri</p>
              </div>
              <button
                onClick={() => setSelectedLeaveForInval(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignInval} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[11px] block">Guru yang Cuti:</span>
                <span className="font-bold text-slate-800 block text-sm">{selectedLeaveForInval.employee_name}</span>
                <span className="text-[11px] text-slate-600 block">
                  Jadwal: {selectedLeaveForInval.start_date} s/d {selectedLeaveForInval.end_date} ({selectedLeaveForInval.total_days} hari)
                </span>
                <span className="text-[11px] text-slate-500 italic block mt-1">Alasan: {selectedLeaveForInval.reason}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih / Tuliskan Nama Guru Pengganti (Inval) *
                </label>
                <input
                  type="text"
                  required
                  value={inputSubTeacher}
                  onChange={(e) => setInputSubTeacher(e.target.value)}
                  placeholder="Contoh: Ust. Lukman Hakim, M.Kom."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Guru ini akan menerima tugas mengajar di ruang kelas selama masa cuti berlangsung.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeaveForInval(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Tetapkan Guru Pengganti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: AJUKAN IZIN TUGAS KELUAR / DINAS MUDIR */}
      {modalIzinDinas && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Permohonan Izin Tugas Keluar (Dinas Mudir)</h3>
                  <p className="text-xs text-slate-500">Diajukan kepada Wakil Ketua Yayasan &amp; Tembusan HRD</p>
                </div>
              </div>
              <button onClick={() => setModalIzinDinas(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIzinDinas} className="space-y-3.5 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="font-bold text-slate-900">Dr. KH. Mahmud Ridwan, M.A.</div>
                <div className="text-[11px] text-slate-500 font-mono">NIP: PEG-MDR-001 • Mudir Pesantren / Kepala Madrasah</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keperluan Tugas Dinas *</label>
                <input
                  type="text"
                  required
                  value={formIzinDinas.keperluan}
                  onChange={(e) => setFormIzinDinas({ ...formIzinDinas, keperluan: e.target.value })}
                  placeholder="Contoh: Rapat Koordinasi Kemenag / Pokjawas / KKM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai Dinas *</label>
                  <input
                    type="date"
                    required
                    value={formIzinDinas.tglMulai}
                    onChange={(e) => setFormIzinDinas({ ...formIzinDinas, tglMulai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    required
                    value={formIzinDinas.tglSelesai}
                    onChange={(e) => setFormIzinDinas({ ...formIzinDinas, tglSelesai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kota &amp; Instansi Tujuan *</label>
                <input
                  type="text"
                  required
                  value={formIzinDinas.tujuan}
                  onChange={(e) => setFormIzinDinas({ ...formIzinDinas, tujuan: e.target.value })}
                  placeholder="Contoh: Kantor Kemenag Kota Bogor / Hotel Savoy Homann Bandung"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pelaksana Harian (Plh.) *</label>
                  <input
                    type="text"
                    required
                    value={formIzinDinas.plh}
                    onChange={(e) => setFormIzinDinas({ ...formIzinDinas, plh: e.target.value })}
                    placeholder="Contoh: Ust. Ahmad Dahlan, S.Pd.I"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Surat Undangan / Tugas</label>
                  <input
                    type="text"
                    value={formIzinDinas.nomorSurat}
                    onChange={(e) => setFormIzinDinas({ ...formIzinDinas, nomorSurat: e.target.value })}
                    placeholder="Contoh: ST-MDR/X/2026/012"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Pengarahan Operasional KBM</label>
                <textarea
                  rows={2}
                  value={formIzinDinas.catatan}
                  onChange={(e) => setFormIzinDinas({ ...formIzinDinas, catatan: e.target.value })}
                  placeholder="Catatan pelimpahan tugas kepada Plh. dan guru piket..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalIzinDinas(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Kirim Pengajuan Izin Dinas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH MATA PELAJARAN & JADWAL KBM (OTORITAS MUDIR) */}
      {modalTambahMapel && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <School className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Tambah Mata Pelajaran &amp; Jadwal KBM Baru</h3>
                  <p className="text-xs text-slate-500">Mudir menetapkan kurikulum yang otomatis tersinkron ke Ruang Guru</p>
                </div>
              </div>
              <button onClick={() => setModalTambahMapel(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimpanMapelBaru} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                  <input
                    type="text"
                    required
                    value={formMapel.namaMapel}
                    onChange={(e) => setFormMapel({ ...formMapel, namaMapel: e.target.value })}
                    placeholder="Contoh: Hadits Arba'in / Nahwu Wadih / Matematika"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Mapel</label>
                  <input
                    type="text"
                    value={formMapel.kodeMapel}
                    onChange={(e) => setFormMapel({ ...formMapel, kodeMapel: e.target.value })}
                    placeholder="MP-HDT-01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas / Rombel Target *</label>
                  <select
                    value={formMapel.kelasId}
                    onChange={(e) => setFormMapel({ ...formMapel, kelasId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                  >
                    {MASTER_KELAS.map(k => (
                      <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hari KBM *</label>
                  <select
                    value={formMapel.hari}
                    onChange={(e) => setFormMapel({ ...formMapel, hari: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guru Pengampu (Asatidz) *</label>
                  <input
                    type="text"
                    required
                    value={formMapel.guruPengampu}
                    onChange={(e) => setFormMapel({ ...formMapel, guruPengampu: e.target.value })}
                    placeholder="Ust. Lukman Hakim, M.Kom."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Guru</label>
                  <input
                    type="text"
                    value={formMapel.guruNip}
                    onChange={(e) => setFormMapel({ ...formMapel, guruNip: e.target.value })}
                    placeholder="1984021001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Mulai *</label>
                  <input
                    type="time"
                    required
                    value={formMapel.jamMulai}
                    onChange={(e) => setFormMapel({ ...formMapel, jamMulai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Selesai *</label>
                  <input
                    type="time"
                    required
                    value={formMapel.jamSelesai}
                    onChange={(e) => setFormMapel({ ...formMapel, jamSelesai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ruang / Lab *</label>
                  <input
                    type="text"
                    required
                    value={formMapel.ruang}
                    onChange={(e) => setFormMapel({ ...formMapel, ruang: e.target.value })}
                    placeholder="Ruang 7A"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900">
                💡 <strong>Tersinkronisasi Otomatis:</strong> Setelah disimpan, mata pelajaran ini akan langsung muncul di Dashboard Ruang Guru (<code className="font-mono">/akademik/nilai</code>) untuk pengisian presensi dan nilai KBM santri.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTambahMapel(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Simpan Mata Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PENUGASAN GURU INVAL MANDIRI OLEH MUDIR */}
      {modalInvalMandiri && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Tugaskan Guru Inval Mandiri</h3>
                  <p className="text-xs text-slate-500">Mudir menetapkan guru pengganti untuk KBM mendadak / darurat</p>
                </div>
              </div>
              <button onClick={() => setModalInvalMandiri(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInvalMandiri} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guru yang Berhalangan Hadir *</label>
                <input
                  type="text"
                  required
                  value={formInvalMandiri.guruAsli}
                  onChange={(e) => setFormInvalMandiri({ ...formInvalMandiri, guruAsli: e.target.value })}
                  placeholder="Contoh: Usth. Maryam, S.Pd."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guru Pengganti (Inval) yang Ditugaskan *</label>
                <input
                  type="text"
                  required
                  value={formInvalMandiri.guruInval}
                  onChange={(e) => setFormInvalMandiri({ ...formInvalMandiri, guruInval: e.target.value })}
                  placeholder="Contoh: Ust. Lukman Hakim, M.Kom."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran *</label>
                  <input
                    type="text"
                    required
                    value={formInvalMandiri.mapel}
                    onChange={(e) => setFormInvalMandiri({ ...formInvalMandiri, mapel: e.target.value })}
                    placeholder="Contoh: Aqidah Akhlak"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal KBM *</label>
                  <input
                    type="date"
                    required
                    value={formInvalMandiri.tanggal}
                    onChange={(e) => setFormInvalMandiri({ ...formInvalMandiri, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Berhalangan *</label>
                <input
                  type="text"
                  required
                  value={formInvalMandiri.alasan}
                  onChange={(e) => setFormInvalMandiri({ ...formInvalMandiri, alasan: e.target.value })}
                  placeholder="Sakit mendadak / izin darurat pagi hari"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tugas &amp; Modul KBM</label>
                <textarea
                  rows={2}
                  value={formInvalMandiri.catatan}
                  onChange={(e) => setFormInvalMandiri({ ...formInvalMandiri, catatan: e.target.value })}
                  placeholder="Instruksi materi pengajaran pengganti..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalInvalMandiri(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Tetapkan Inval Mandiri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: BUKA / TAMBAH ROMBEL KELAS BARU OLEH MUDIR */}
      {modalTambahRombel && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Buka Rombongan Belajar (Rombel) Baru</h3>
                  <p className="text-xs text-slate-500">Mendirikan kelas baru dan menunjuk Wali Kelas pembimbing</p>
                </div>
              </div>
              <button onClick={() => setModalTambahRombel(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTambahRombel} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Rombel / Kelas Baru *</label>
                <input
                  type="text"
                  required
                  value={formRombel.namaRombel}
                  onChange={(e) => setFormRombel({ ...formRombel, namaRombel: e.target.value })}
                  placeholder="Contoh: Kelas 8C Tahfidz Sains / Kelas 11 MA Takhasus"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Wali Kelas yang Ditugaskan *</label>
                <input
                  type="text"
                  required
                  value={formRombel.waliKelas}
                  onChange={(e) => setFormRombel({ ...formRombel, waliKelas: e.target.value })}
                  placeholder="Contoh: Ust. Bilal Habasyi / Ust. Hamzah"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Kapasitas Santri (Orang)</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={formRombel.jumlahSantri}
                  onChange={(e) => setFormRombel({ ...formRombel, jumlahSantri: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTambahRombel(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
                >
                  Buka Rombel Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
