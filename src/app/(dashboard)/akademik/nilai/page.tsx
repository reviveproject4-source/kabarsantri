'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowLeft, 
  Save, 
  GraduationCap, 
  Play, 
  Check, 
  Users, 
  Clock, 
  MapPin, 
  FileText, 
  Award, 
  AlertCircle, 
  CheckSquare, 
  Sparkles,
  School,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { 
  getSharedLearningSessions, 
  startLearningSession, 
  updateSessionPresensi, 
  updateSessionActivity, 
  updateSessionAssessment, 
  updateSessionRemedial,
  completeLearningSession,
  LearningSession,
  SantriPresensiSession,
  validateIslamicSegregation
} from '@/lib/sharedDataStore';
import { getActiveActor, MASTER_PILLAR_ACTORS, ActiveActor } from '@/lib/sessionStore';

export default function LearningSessionKBMPage() {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('ls-1');
  const [genderFilter, setGenderFilter] = useState<'all' | 'ikhwan' | 'akhwat'>('all');
  const [activeStep, setActiveStep] = useState<'jadwal' | 'presensi' | 'activity' | 'assessment' | 'summary'>('jadwal');
  const [notif, setNotif] = useState('');
  const [currentActor, setCurrentActor] = useState<ActiveActor>(MASTER_PILLAR_ACTORS.yayasan);

  // Sinkronisasi data sesi KBM & Otomatis sesuaikan gender filter dengan Pengampu yang Login
  useEffect(() => {
    const actor = getActiveActor();
    setCurrentActor(actor);
    const loadedSessions = getSharedLearningSessions();
    setSessions(loadedSessions);

    if (actor.role_key === 'guru_akhwat' || actor.gender === 'akhwat') {
      setGenderFilter('akhwat');
      const firstAkhwat = loadedSessions.find(s => s.gender_target === 'akhwat');
      if (firstAkhwat) setSelectedSessionId(firstAkhwat.id);
    } else if (actor.role_key === 'guru') {
      setGenderFilter('ikhwan');
      const firstIkhwan = loadedSessions.find(s => s.gender_target === 'ikhwan');
      if (firstIkhwan) setSelectedSessionId(firstIkhwan.id);
    }

    const handleUpdate = () => {
      setSessions(getSharedLearningSessions());
      setCurrentActor(getActiveActor());
    };
    window.addEventListener('ks_kbm_session_updated', handleUpdate);
    window.addEventListener('ks_session_actor_changed', handleUpdate);
    return () => {
      window.removeEventListener('ks_kbm_session_updated', handleUpdate);
      window.removeEventListener('ks_session_actor_changed', handleUpdate);
    };
  }, []);

  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  // Form Activity Local State
  const [activityForm, setActivityForm] = useState({
    topik_materi: currentSession?.activity?.topik_materi || '',
    bab_pembahasan: currentSession?.activity?.bab_pembahasan || '',
    metode_pembelajaran: currentSession?.activity?.metode_pembelajaran || 'Ceramah & Tanya Jawab',
    catatan_kbm: currentSession?.activity?.catatan_kbm || '',
  });

  // Form Assessment Local State
  const [assessmentForm, setAssessmentForm] = useState({
    judul_tugas: currentSession?.assessment?.judul_tugas || '',
    tipe: currentSession?.assessment?.tipe || ('Kuis Formatif' as const),
    target_kkm: currentSession?.assessment?.target_kkm || 75,
  });

  const [scoresState, setScoresState] = useState<Record<string, number>>({});
  const [remedialInputState, setRemedialInputState] = useState<Record<string, number>>({});

  useEffect(() => {
    if (currentSession) {
      setActivityForm({
        topik_materi: currentSession.activity?.topik_materi || '',
        bab_pembahasan: currentSession.activity?.bab_pembahasan || '',
        metode_pembelajaran: currentSession.activity?.metode_pembelajaran || 'Ceramah & Tanya Jawab',
        catatan_kbm: currentSession.activity?.catatan_kbm || '',
      });

      setAssessmentForm({
        judul_tugas: currentSession.assessment?.judul_tugas || '',
        tipe: currentSession.assessment?.tipe || 'Kuis Formatif',
        target_kkm: currentSession.assessment?.target_kkm || 75,
      });

      const initialScores: Record<string, number> = {};
      const initialRemedials: Record<string, number> = {};
      const targetKkm = currentSession.assessment?.target_kkm || 75;

      currentSession.assessment?.results?.forEach(r => {
        initialScores[r.santri_id] = r.nilai;
        initialRemedials[r.santri_id] = r.nilai_remedial ?? (r.nilai < targetKkm ? targetKkm : r.nilai);
      });
      setScoresState(initialScores);
      setRemedialInputState(initialRemedials);
    }
  }, [selectedSessionId, sessions]);

  // ACTION: Simpan Nilai Remedial Santri Terhubung
  const handleSaveRemedial = (santriId: string) => {
    const targetKkm = currentSession.assessment?.target_kkm || 75;
    const score = Number(remedialInputState[santriId] ?? targetKkm);
    const updated = updateSessionRemedial(currentSession.id, santriId, score);
    setSessions(updated);
    const santriObj = currentSession.assessment?.results?.find(r => r.santri_id === santriId);
    setNotif(`✓ Nilai Remedial santri ${santriObj?.nama || ''} (${score}) berhasil disimpan! Nilai akhir dan status capaian KKM otomatis terhubung & terupdate.`);
    setTimeout(() => setNotif(''), 6000);
  };

  // ACTION 1: Guru Masuk Kelas & Memulai Sesi Pembelajaran (Status -> IN_PROGRESS)
  const handleStartSession = () => {
    const updated = startLearningSession(currentSession.id);
    setSessions(updated);
    setActiveStep('presensi');
    setNotif(`✓ Sesi Pembelajaran ${currentSession.mata_pelajaran} (${currentSession.kelas_nama}) DIMULAI! Status kini IN_PROGRESS.`);
    setTimeout(() => setNotif(''), 7000);
  };

  // ACTION 2: Presensi Santri dalam Sesi Ini
  const handleStatusPresensiChange = (santriId: string, status: SantriPresensiSession['status']) => {
    const updatedList = currentSession.presensi.map(p => p.santri_id === santriId ? { ...p, status } : p);
    const updated = updateSessionPresensi(currentSession.id, updatedList);
    setSessions(updated);
  };

  // ACTION 3: Simpan Jurnal & Aktivitas Pembelajaran
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateSessionActivity(currentSession.id, activityForm);
    setSessions(updated);
    setActiveStep('assessment');
    setNotif('✓ Jurnal aktivitas pembelajaran (Learning Activity) berhasil disimpan & tercatat ke sistem KBM!');
    setTimeout(() => setNotif(''), 7000);
  };

  // ACTION 4: Guru Input Nilai -> Evaluasi Otomatis (ACHIEVED/NOT_ACHIEVED, REMEDIAL/ENRICHMENT)
  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const scoresPayload = currentSession.presensi.map(p => ({
      santri_id: p.santri_id,
      nis: p.nis,
      nama: p.nama,
      nilai: Number(scoresState[p.santri_id] ?? 80),
    }));

    const updated = updateSessionAssessment(
      currentSession.id,
      assessmentForm.judul_tugas,
      assessmentForm.tipe,
      Number(assessmentForm.target_kkm),
      scoresPayload
    );
    setSessions(updated);
    setActiveStep('summary');
    setNotif('✓ Penilaian assessment terintegrasi berhasil diproses! Sistem otomatis mengidentifikasi status ACHIEVED / REMEDIAL_REQUIRED / ENRICHMENT_ELIGIBLE.');
    setTimeout(() => setNotif(''), 7000);
  };

  // ACTION 5: Guru Menutup KBM (Status -> COMPLETED & Terlapor ke Mudir)
  const handleCompleteSession = () => {
    const updated = completeLearningSession(currentSession.id);
    setSessions(updated);
    setNotif(`✓ Sesi KBM ${currentSession.mata_pelajaran} RESMI DISELESAIKAN (COMPLETED)! Laporan lengkap otomatis masuk ke Dashboard Mudir / Kepala Sekolah.`);
    setTimeout(() => setNotif(''), 8000);
  };

  if (!currentSession) {
    return <div className="p-8 text-center text-xs text-slate-500">Memuat Sesi Pembelajaran...</div>;
  }

  // Hitung metrik evaluasi assessment terkini
  const results = currentSession.assessment?.results || [];
  const countAchieved = results.filter(r => r.capaian === 'ACHIEVED').length;
  const countRemedial = results.filter(r => r.rekomendasi === 'REMEDIAL_REQUIRED').length;
  const countEnrichment = results.filter(r => r.rekomendasi === 'ENRICHMENT_ELIGIBLE').length;

  return (
    <div className="space-y-6">
      {/* Header Info Alur KBM Terpadu (TO-BE Specification) */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-500/40 uppercase">
            KBM Learning Session Engine (TO-BE)
          </span>
          <h1 className="text-xl font-bold mt-2">Sesi Pembelajaran & Penilaian Akademik Guru</h1>
          <p className="text-xs text-emerald-200 mt-1">
            Alur Terintegrasi: Jadwal ➔ Sesi IN_PROGRESS ➔ Presensi Santri ➔ Learning Activity ➔ Assessment ➔ Evaluasi Capaian (Remedial / Pengayaan) ➔ COMPLETED
          </p>
        </div>

        {/* Status Sesi Aktif */}
        <div className="bg-slate-950/60 border border-emerald-500/40 px-4 py-3 rounded-xl flex items-center space-x-3 self-start md:self-auto">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Status Sesi KBM:</span>
            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md inline-block mt-0.5 ${
              currentSession.status === 'IN_PROGRESS'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 animate-pulse'
                : currentSession.status === 'COMPLETED'
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {currentSession.status}
            </span>
          </div>

          {currentSession.status === 'NOT_STARTED' && (
            <button
              onClick={handleStartSession}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Mulai Sesi (IN_PROGRESS)</span>
            </button>
          )}

          {currentSession.status === 'IN_PROGRESS' && (
            <button
              onClick={handleCompleteSession}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Selesaikan Sesi (COMPLETED)</span>
            </button>
          )}
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2.5 shadow-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{notif}</span>
        </div>
      )}

      {/* Banner Pemisahan Syar'i (Ikhwan vs Akhwat) */}
      <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-teal-200 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            🕌
          </div>
          <div>
            <div className="font-bold text-teal-950 flex items-center gap-2">
              <span>Pemisahan Syar'i Terverifikasi (Ikhwan &amp; Akhwat)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentActor.gender === 'akhwat' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
              }`}>
                Pengampu Aktif: {currentActor.name} ({currentActor.gender === 'akhwat' ? 'Ustadzah / Akhwat' : 'Ustadz / Ikhwan'})
              </span>
            </div>
            <p className="text-[11px] text-teal-800">
              Guru Ikhwan hanya mengajar santri laki-laki di Kampus Putra. Guru Akhwat hanya mengajar santriwati di Kampus Putri.
            </p>
          </div>
        </div>

        {/* Filter Toggle Kampus (Bisa diakses Pimpinan / Mudir / Yayasan) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-teal-200 shrink-0">
          <button
            onClick={() => setGenderFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              genderFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => {
              setGenderFilter('ikhwan');
              const first = sessions.find(s => s.gender_target === 'ikhwan');
              if (first) setSelectedSessionId(first.id);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ${
              genderFilter === 'ikhwan' ? 'bg-blue-600 text-white' : 'text-blue-800 hover:bg-blue-50'
            }`}
          >
            <span>🕌 Kampus Putra</span>
          </button>
          <button
            onClick={() => {
              setGenderFilter('akhwat');
              const first = sessions.find(s => s.gender_target === 'akhwat');
              if (first) setSelectedSessionId(first.id);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ${
              genderFilter === 'akhwat' ? 'bg-rose-600 text-white' : 'text-rose-800 hover:bg-rose-50'
            }`}
          >
            <span>🧕 Kampus Putri</span>
          </button>
        </div>
      </div>

      {/* Pilihan Jadwal / Learning Session (Jadwal Terhubung dengan KBM) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold text-slate-800">
            Jadwal Sesi KBM ({genderFilter === 'all' ? 'Seluruh Kampus' : genderFilter === 'ikhwan' ? 'Khusus Putra (Ikhwan)' : 'Khusus Putri (Akhwat)'}):
          </span>
        </div>

        <div className="flex flex-wrap gap-2 flex-1 sm:justify-end">
          {sessions
            .filter(s => genderFilter === 'all' || s.gender_target === genderFilter)
            .map((s) => {
              const isTargetAkhwat = s.gender_target === 'akhwat';
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    const validation = validateIslamicSegregation(currentActor.gender, s.gender_target);
                    if (!validation.isValid && (currentActor.role_key === 'guru' || currentActor.role_key === 'guru_akhwat')) {
                      setNotif(validation.message || 'Pelanggaran kebijakan segregasi syar\'i');
                      setTimeout(() => setNotif(''), 6000);
                      return;
                    }
                    setSelectedSessionId(s.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2 ${
                    selectedSessionId === s.id
                      ? isTargetAkhwat 
                        ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold shadow-xs' 
                        : 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    s.status === 'IN_PROGRESS' ? 'bg-amber-500 animate-ping' : s.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}></span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">{s.mata_pelajaran}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        isTargetAkhwat ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isTargetAkhwat ? 'Putri' : 'Putra'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">{s.kelas_nama} • {s.guru_nama}</div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Detail Informasi Sesi Terpilih */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Mata Pelajaran &amp; Kelas</span>
          <span className="font-bold text-slate-800 text-sm block mt-0.5">{currentSession.mata_pelajaran}</span>
          <span className="text-[11px] text-emerald-700 font-medium">{currentSession.kelas_nama}</span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Guru Pengampu</span>
          <span className="font-bold text-slate-800 text-sm block mt-0.5">{currentSession.guru_nama}</span>
          <span className="text-[11px] text-slate-500">NIP. 1984021001</span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Ruang Kelas &amp; Waktu</span>
          <span className="font-bold text-slate-800 block mt-0.5">{currentSession.ruang_kelas}</span>
          <span className="text-[11px] text-slate-500 font-mono">{currentSession.jam_jadwal}</span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Waktu Sesi Aktual</span>
          <div className="font-mono text-[11px] text-slate-700 mt-0.5">
            <div>Mulai: <strong>{currentSession.waktu_mulai_aktual || '-'}</strong></div>
            <div>Selesai: <strong>{currentSession.waktu_selesai_aktual || '-'}</strong></div>
          </div>
        </div>
      </div>

      {/* Step Tabs Navigasi Alur KBM (Langkah Pembelajaran Terpadu) */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-2 sm:px-3 pt-2 gap-1 overflow-x-auto text-xs font-semibold no-scrollbar select-none">
        {[
          { id: 'jadwal', label: '1. Sesi & Jadwal', icon: Calendar },
          { id: 'presensi', label: '2. Presensi Kelas', icon: CheckSquare },
          { id: 'activity', label: '3. Jurnal Belajar', icon: FileText },
          { id: 'assessment', label: '4. Penilaian & KKM', icon: Award },
          { id: 'summary', label: '5. Evaluasi & Remedial', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStep === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStep(tab.id as any)}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 flex items-center space-x-1.5 sm:space-x-2 border-b-2 transition whitespace-nowrap shrink-0 text-xs ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 font-bold bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: JADWAL & STATUS SESI */}
      {/* ========================================================================= */}
      {activeStep === 'jadwal' && (
        <div className="bg-white rounded-b-2xl p-6 border border-t-0 border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="max-w-2xl space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Langkah 1: Guru Masuk Kelas & Memulai Sesi</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Jadwal terhubung langsung dengan sistem KBM. Ketika guru tiba di ruang kelas, klik tombol di bawah untuk mengubah status sesi menjadi <strong>IN_PROGRESS</strong>. Waktu mulai akan tercatat otomatis.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800">Checklist Kesiapan Sesi:</div>
              <ul className="space-y-1.5 text-slate-600 list-disc pl-4 text-[11px]">
                <li>Ruang kelas: <strong>{currentSession.ruang_kelas}</strong></li>
                <li>Rombel santri: <strong>{currentSession.kelas_nama} ({currentSession.presensi.length} Santri Terdaftar)</strong></li>
                <li>Materi: <strong>{currentSession.mata_pelajaran}</strong></li>
              </ul>
            </div>

            {currentSession.status === 'NOT_STARTED' ? (
              <button
                onClick={handleStartSession}
                className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition flex items-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Sesi Pembelajaran Sekarang (Status ➔ IN_PROGRESS)</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-emerald-700 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Sesi Pembelajaran Telah Berjalan (IN_PROGRESS sejak {currentSession.waktu_mulai_aktual})</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: PRESENSI SANTRI TERINTEGRASI */}
      {/* ========================================================================= */}
      {activeStep === 'presensi' && (
        <div className="bg-white rounded-b-2xl p-6 border border-t-0 border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Langkah 2: Presensi Santri dalam Sesi KBM</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Kehadiran santri dicatat langsung sebagai bagian dari Learning Session {currentSession.mata_pelajaran}
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {currentSession.presensi.filter(p => p.status === 'HADIR').length} / {currentSession.presensi.length} Santri Hadir
            </span>
          </div>

          {/* Mobile Touch Cards for Phones */}
          <div className="sm:hidden space-y-2.5">
            {currentSession.presensi.map((p) => (
              <div key={p.santri_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{p.nama}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">NIS: {p.nis}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' :
                    p.status === 'IZIN' ? 'bg-blue-100 text-blue-800' :
                    p.status === 'SAKIT' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {p.status}
                  </span>
                </div>

                {/* 4 Large Touch Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {(['HADIR', 'IZIN', 'SAKIT', 'ALPA'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusPresensiChange(p.santri_id, st)}
                      className={`py-2 text-[11px] font-bold rounded-lg transition text-center shadow-2xs ${
                        p.status === st
                          ? st === 'HADIR'
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/20'
                            : st === 'IZIN'
                            ? 'bg-blue-600 text-white ring-2 ring-blue-500/20'
                            : st === 'SAKIT'
                            ? 'bg-amber-500 text-white ring-2 ring-amber-500/20'
                            : 'bg-rose-600 text-white ring-2 ring-rose-500/20'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Santri</th>
                  <th className="p-3">NIS</th>
                  <th className="p-3 text-center">Status Kehadiran</th>
                  <th className="p-3">Keterangan Khusus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentSession.presensi.map((p) => (
                  <tr key={p.santri_id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-bold text-slate-800">
                      {p.nama}
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {p.nis}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                        {(['HADIR', 'IZIN', 'SAKIT', 'ALPA'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleStatusPresensiChange(p.santri_id, st)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                              p.status === st
                                ? st === 'HADIR'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : st === 'IZIN'
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : st === 'SAKIT'
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'bg-rose-600 text-white shadow-2xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {p.keterangan || (p.status === 'HADIR' ? 'Hadir di kelas' : '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setActiveStep('activity')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center space-x-1.5"
            >
              <span>Lanjut: Catat Learning Activity →</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: LEARNING ACTIVITY (JURNAL MENGAJAR GURU) */}
      {/* ========================================================================= */}
      {activeStep === 'activity' && (
        <div className="bg-white rounded-b-2xl p-6 border border-t-0 border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Langkah 3: Pencatatan Aktivitas Pembelajaran (Learning Activity)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Guru mencatat topik materi yang diajarkan, metode pembelajaran, dan dinamika KBM di kelas
            </p>
          </div>

          <form onSubmit={handleSaveActivity} className="space-y-4 max-w-2xl">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Topik Materi Pembelajaran Hari Ini *</label>
              <input
                type="text"
                required
                value={activityForm.topik_materi}
                onChange={(e) => setActivityForm({ ...activityForm, topik_materi: e.target.value })}
                placeholder="Contoh: Bab At-Ta'aruf wal Hiwar fil Fashli"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bab / Sub-Pembahasan Spesifik</label>
              <input
                type="text"
                value={activityForm.bab_pembahasan}
                onChange={(e) => setActivityForm({ ...activityForm, bab_pembahasan: e.target.value })}
                placeholder="Contoh: Struktur Jumlah Ismiyyah & Dhomir Munfashil"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Metode Pembelajaran</label>
              <select
                value={activityForm.metode_pembelajaran}
                onChange={(e) => setActivityForm({ ...activityForm, metode_pembelajaran: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              >
                <option value="Ceramah & Tanya Jawab">Ceramah Interaktif & Tanya Jawab</option>
                <option value="Halaqah Diskusi">Halaqah Diskusi Kelompok</option>
                <option value="Praktik Muamalah">Praktik Lapangan / Roleplay</option>
                <option value="Talaqqi & Qira'ah">Talaqqi & Qira'ah Berantai</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan KBM & Dinamika Kelas (Jurnal Guru)</label>
              <textarea
                rows={3}
                required
                value={activityForm.catatan_kbm}
                onChange={(e) => setActivityForm({ ...activityForm, catatan_kbm: e.target.value })}
                placeholder="Catatan guru mengenai keaktifan santri, kendala pemahaman, atau penguasaan materi..."
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Learning Activity & Lanjut ke Assessment</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: INTEGRATED ASSESSMENT & SISTEM EVALUASI NILAI */}
      {/* ========================================================================= */}
      {activeStep === 'assessment' && (
        <div className="bg-white rounded-b-2xl p-6 border border-t-0 border-slate-200 shadow-sm space-y-5 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Langkah 4: Integrated Assessment (Tugas / Ujian & Input Nilai)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Guru memasukkan nilai santri. Sistem secara otomatis mengevaluasi capaian: <strong>ACHIEVED</strong> (Tuntas) atau <strong>NOT_ACHIEVED</strong> (Belum Tuntas)
            </p>
          </div>

          <form onSubmit={handleSaveAssessment} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Tugas / Assessment *</label>
                <input
                  type="text"
                  required
                  value={assessmentForm.judul_tugas}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, judul_tugas: e.target.value })}
                  placeholder="Contoh: Latihan Hiwar & Tashrif Dhomir"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Assessment</label>
                <select
                  value={assessmentForm.tipe}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, tipe: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Kuis Formatif">Kuis Formatif Harian</option>
                  <option value="Tugas Harian">Tugas Terstruktur / PR</option>
                  <option value="Praktik Muamalah">Penilaian Praktik / Unjuk Kerja</option>
                  <option value="Ujian Sumatif">Ujian Sumatif Tengah/Akhir Semester</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target KKM (Batas Ketuntasan Minimal)</label>
                <input
                  type="number"
                  required
                  min={50}
                  max={100}
                  value={assessmentForm.target_kkm}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, target_kkm: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none text-emerald-800"
                />
              </div>
            </div>

            {/* Input Nilai Santri */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                Input Nilai Santri Kelas {currentSession.kelas_nama} (Skala 0 - 100):
              </div>
              {/* Mobile Touch Cards for Assessment Score Input */}
              <div className="sm:hidden p-3 space-y-3">
                {currentSession.presensi.map((s) => {
                  const currentVal = scoresState[s.santri_id] ?? 80;
                  const isAchieved = currentVal >= assessmentForm.target_kkm;

                  return (
                    <div key={s.santri_id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{s.nama}</div>
                          <div className="text-[10px] text-slate-400 font-mono">NIS: {s.nis}</div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-slate-600">Nilai:</span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={currentVal}
                            onChange={(e) => setScoresState({ ...scoresState, [s.santri_id]: Number(e.target.value) })}
                            className={`w-20 p-2 border rounded-xl text-center font-bold font-mono text-base focus:outline-none focus:ring-2 ${
                              isAchieved 
                                ? 'border-emerald-300 text-emerald-800 bg-emerald-50/30 focus:ring-emerald-500' 
                                : 'border-rose-300 text-rose-700 bg-rose-50/30 focus:ring-rose-500'
                            }`}
                          />
                        </div>

                        <div>
                          {isAchieved ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                              ✓ TUNTAS
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                              ⚠ REMEDIAL
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Santri</th>
                      <th className="p-3">Status Presensi</th>
                      <th className="p-3 text-center w-32">Input Nilai</th>
                      <th className="p-3">Evaluasi Sistem (Real-Time)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentSession.presensi.map((s) => {
                      const currentVal = scoresState[s.santri_id] ?? 80;
                      const isAchieved = currentVal >= assessmentForm.target_kkm;

                      return (
                        <tr key={s.santri_id} className="hover:bg-slate-50/60">
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{s.nama}</div>
                            <div className="text-[10px] text-slate-400 font-mono">NIS: {s.nis}</div>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              s.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={currentVal}
                              onChange={(e) => setScoresState({ ...scoresState, [s.santri_id]: Number(e.target.value) })}
                              className={`w-20 p-2 border rounded-lg text-center font-bold font-mono text-sm focus:outline-none focus:ring-2 ${
                                isAchieved ? 'border-emerald-300 text-emerald-800 focus:ring-emerald-500' : 'border-rose-300 text-rose-700 focus:ring-rose-500'
                              }`}
                            />
                          </td>
                          <td className="p-3">
                            {isAchieved ? (
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold text-[10px]">
                                  ACHIEVED
                                </span>
                                <span className="text-[11px] text-emerald-800 font-medium">
                                  ➔ Siap Pengayaan (ENRICHMENT_ELIGIBLE)
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-300 text-rose-700 font-bold text-[10px]">
                                  NOT_ACHIEVED
                                </span>
                                <span className="text-[11px] text-rose-700 font-medium">
                                  ➔ Wajib Remedial (REMEDIAL_REQUIRED)
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Hasil Assessment & Lihat Matriks Remedial</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: EVALUASI KEBUTUHAN (REMEDIAL_REQUIRED VS ENRICHMENT_ELIGIBLE) & COMPLETED */}
      {/* ========================================================================= */}
      {activeStep === 'summary' && (
        <div className="bg-white rounded-b-2xl p-6 border border-t-0 border-slate-200 shadow-sm space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Langkah 5: Matriks Rekomendasi Akademik (Remedial & Pengayaan)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Sistem otomatis mengelompokkan santri untuk tindakan tindak lanjut KBM guru
              </p>
            </div>

            {currentSession.status === 'IN_PROGRESS' && (
              <button
                onClick={handleCompleteSession}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <Check className="w-4 h-4" />
                <span>Tutup & Selesaikan KBM (COMPLETED)</span>
              </button>
            )}
          </div>

          {/* Info KKM & Keterhubungan Nilai */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold">Siklus Penilaian Terhubung (Closed-Loop Assessment):</span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Target KKM: <strong>{currentSession.assessment?.target_kkm || 75}</strong> • Nilai remedial langsung terhubung memperbarui nilai akhir KBM santri dan rekapitulasi kelulusan.
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 bg-white border border-emerald-300 rounded-lg font-bold text-emerald-800 self-start sm:self-auto shadow-2xs">
              Target KKM: {currentSession.assessment?.target_kkm || 75}
            </span>
          </div>

          {/* 3 Kartu Klasifikasi Capaian */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider">Capaian Target KKM</span>
              <div className="text-xl font-bold font-mono text-emerald-800">{countAchieved} / {results.length} Santri</div>
              <span className="text-[11px] text-emerald-700 block">Status: ACHIEVED (Tuntas)</span>
            </div>

            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
              <span className="text-[10px] text-rose-900 font-bold uppercase tracking-wider">Perlu Pendampingan</span>
              <div className="text-xl font-bold font-mono text-rose-700">{countRemedial} Santri</div>
              <span className="text-[11px] text-rose-800 block">Status: REMEDIAL_REQUIRED</span>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
              <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wider">Pengayaan Lanjutan</span>
              <div className="text-xl font-bold font-mono text-blue-700">{countEnrichment} Santri</div>
              <span className="text-[11px] text-blue-800 block">Status: ENRICHMENT_ELIGIBLE</span>
            </div>
          </div>

          {/* Mobile Touch Cards View: Keterhubungan Nilai & Remedial */}
          <div className="sm:hidden space-y-3">
            {results.map((res) => {
              const targetKkm = currentSession.assessment?.target_kkm || 75;
              const isRemedialNeeded = res.nilai < targetKkm;
              const hasRemedial = res.nilai_remedial !== undefined;
              const currentRemedialInput = remedialInputState[res.santri_id] ?? (res.nilai_remedial ?? targetKkm);

              return (
                <div key={res.santri_id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{res.nama}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NIS: {res.nis}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      res.capaian === 'ACHIEVED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}>
                      {res.capaian === 'ACHIEVED' ? '✓ TUNTAS KKM' : '⚠ REMEDIAL'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Nilai Asli KBM:</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">{res.nilai}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Nilai Akhir Rapor:</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">{res.nilai_akhir ?? res.nilai}</span>
                    </div>
                  </div>

                  {/* Form Input Remedial di Mobile jika perlu */}
                  {isRemedialNeeded ? (
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-rose-800">Input Nilai Ujian Remedial:</label>
                        {hasRemedial && (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Tersimpan: {res.nilai_remedial}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={currentRemedialInput}
                          onChange={(e) => setRemedialInputState({ ...remedialInputState, [res.santri_id]: Number(e.target.value) })}
                          className="w-20 p-2 bg-white border border-rose-300 rounded-lg text-center font-bold font-mono text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRemedial(res.santri_id)}
                          className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-2xs transition"
                        >
                          Simpan Remedial
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-700 font-medium bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                      ✓ Nilai asli santri telah melampaui target KKM ({targetKkm}). Tidak memerlukan ujian remedial.
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500 italic pt-0.5">
                    {res.catatan || '-'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View: Matriks Keterhubungan Nilai & Remedial */}
          <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Santri &amp; NIS</th>
                  <th className="p-3 text-center">Nilai Awal</th>
                  <th className="p-3 text-center">Evaluasi KKM</th>
                  <th className="p-3">Nilai Ujian Remedial (Input &amp; Hubungkan)</th>
                  <th className="p-3 text-center">Nilai Akhir KBM</th>
                  <th className="p-3">Status Capaian &amp; Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((res) => {
                  const targetKkm = currentSession.assessment?.target_kkm || 75;
                  const isRemedialNeeded = res.nilai < targetKkm;
                  const hasRemedial = res.nilai_remedial !== undefined;
                  const currentRemedialInput = remedialInputState[res.santri_id] ?? (res.nilai_remedial ?? targetKkm);

                  return (
                    <tr key={res.santri_id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-slate-800">
                        {res.nama}
                        <div className="text-[10px] text-slate-400 font-mono font-normal">NIS: {res.nis}</div>
                      </td>
                      <td className="p-3 text-center font-bold font-mono text-sm">
                        <span className={res.nilai >= targetKkm ? 'text-emerald-700' : 'text-rose-700'}>
                          {res.nilai}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                          res.nilai >= targetKkm
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}>
                          {res.nilai >= targetKkm ? 'ACHIEVED' : 'NOT_ACHIEVED'}
                        </span>
                        <div className="text-[9px] text-slate-400 mt-0.5">KKM: {targetKkm}</div>
                      </td>

                      {/* KOLOM INTERAKTIF: INPUT NILAI REMEDIAL TERHUBUNG */}
                      <td className="p-3">
                        {isRemedialNeeded ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={currentRemedialInput}
                              onChange={(e) => setRemedialInputState({ ...remedialInputState, [res.santri_id]: Number(e.target.value) })}
                              className="w-16 p-1.5 border border-rose-300 rounded-lg text-center font-mono font-bold text-xs bg-rose-50/30 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              title="Masukkan nilai ujian perbaikan / remedial santri"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRemedial(res.santri_id)}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition"
                            >
                              Simpan Remedial
                            </button>
                            {hasRemedial && (
                              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                ✓ Nilai: {res.nilai_remedial}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            ✓ Tidak perlu remedial (Nilai &gt;= KKM)
                          </span>
                        )}
                      </td>

                      {/* NILAI AKHIR TERHUBUNG PASCA REMEDIAL */}
                      <td className="p-3 text-center font-bold font-mono text-sm">
                        <span className={res.capaian === 'ACHIEVED' ? 'text-emerald-700' : 'text-rose-700'}>
                          {res.nilai_akhir ?? res.nilai}
                        </span>
                        {hasRemedial && (
                          <div className="text-[9px] text-emerald-700 font-semibold">(Pasca-Remedial)</div>
                        )}
                      </td>

                      <td className="p-3">
                        {res.rekomendasi === 'ENRICHMENT_ELIGIBLE' ? (
                          <span className="font-semibold text-emerald-800 flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>TUNTAS (Siap Pengayaan)</span>
                          </span>
                        ) : (
                          <span className="font-semibold text-rose-700 flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>BELUM TUNTAS (Perlu Bimbingan)</span>
                          </span>
                        )}
                        <div className="text-[10px] text-slate-500 mt-0.5">{res.catatan || '-'}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Banner Integrasi ke Mudir */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-slate-700">
              <School className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Integrasi Real-Time:</strong> Seluruh hasil sesi pembelajaran, jurnal mengajar, dan data remedial ini langsung masuk ke Dashboard Kepala Sekolah / Mudir.
              </span>
            </div>
            <Link
              href="/dashboard/mudir"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 underline shrink-0"
            >
              <span>Lihat Laporan Aktual di Dashboard Mudir ➔</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
