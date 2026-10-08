'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  Award, 
  Search, 
  ScrollText, 
  Library, 
  Sparkles,
  Filter,
  Users
} from 'lucide-react';
import { 
  MASTER_KELAS, 
  MASTER_SANTRI, 
  getSharedKategoriHafalan, 
  addSharedKategoriHafalan, 
  KategoriHafalan,
  validateIslamicSegregation,
  getSharedTahfidzSetoran,
  addSharedTahfidzSetoran,
  getSharedSantriList,
  getSharedMasterKelas,
  isTenantMode
} from '@/lib/sharedDataStore';
import { getActiveActor, MASTER_PILLAR_ACTORS, ActiveActor } from '@/lib/sessionStore';

interface SetoranRecord {
  id: string;
  santri: string;
  nis: string;
  kelas_id: string;
  kelas_nama: string;
  gender: 'ikhwan' | 'akhwat';
  tipe_hafalan: 'quran' | 'hadis' | 'kitab' | 'custom_yayasan';
  kategori_label: string;
  nama_materi: string;
  rincian_hafalan: string;
  kelancaran: number;
  tajwid: number;
  makhraj: number;
  is_lulus: boolean;
  musyrif: string;
  tanggal: string;
  catatan?: string;
}

export default function TahfidzManagementPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKurikulumOpen, setModalKurikulumOpen] = useState(false);
  const [notif, setNotif] = useState('');
  const [currentActor, setCurrentActor] = useState<ActiveActor>(MASTER_PILLAR_ACTORS.yayasan);

  // Filter list
  const [filterKelas, setFilterKelas] = useState('semua');
  const [filterTipe, setFilterTipe] = useState('semua');
  const [filterKampus, setFilterKampus] = useState<'all' | 'ikhwan' | 'akhwat'>('all');

  // Kategori Hafalan dari Shared Store
  const [kategoriList, setKategoriList] = useState<KategoriHafalan[]>([]);

  // Daftar Riwayat Setoran Hafalan (Tergantung Jalur Demo vs Tenant Live)
  const [setoranList, setSetoranList] = useState<SetoranRecord[]>([]);

  // Form State Input Setoran Guru:
  // Step 1: Pilih Kelas Dulu
  const [selectedKelasId, setSelectedKelasId] = useState('k-7a');
  // Step 2: Pilih Santri (Filtered by Kelas)
  const [selectedSantriNis, setSelectedSantriNis] = useState('');
  // Step 3: Tipe Hafalan
  const [tipeHafalan, setTipeHafalan] = useState<'quran' | 'hadis' | 'kitab' | 'custom_yayasan'>('quran');
  const [selectedMateriId, setSelectedMateriId] = useState('');
  const [rincianHafalan, setRincianHafalan] = useState('Surah An-Nazi\'at (1 - 46)');
  // Step 4: Nilai
  const [skorKelancaran, setSkorKelancaran] = useState(90);
  const [skorTajwid, setSkorTajwid] = useState(90);
  const [skorMakhraj, setSkorMakhraj] = useState(90);
  const [catatan, setCatatan] = useState('Bacaan tartil, dengung makhraj diperhatikan.');

  // Form State Tambah Kurikulum Kustom oleh Yayasan
  const [formKurikulum, setFormKurikulum] = useState({
    tipe: 'custom_yayasan' as 'quran' | 'hadis' | 'kitab' | 'custom_yayasan',
    nama_materi: '',
    sub_materi: '',
  });

  // Sinkronisasi data kurikulum hafalan & setoran
  useEffect(() => {
    const list = getSharedKategoriHafalan();
    setKategoriList(list);
    setSetoranList(getSharedTahfidzSetoran() as SetoranRecord[]);

    const actor = getActiveActor();
    setCurrentActor(actor);
    const classes = isTenantMode() ? getSharedMasterKelas() : MASTER_KELAS;
    if (classes.length > 0) {
      setSelectedKelasId(classes[0].id);
    }

    if (actor.role_key === 'guru_akhwat' || actor.role_key === 'musyrifah' || actor.gender === 'akhwat') {
      setFilterKampus('akhwat');
      const firstAkhwatKelas = classes.find(k => k.gender === 'akhwat');
      if (firstAkhwatKelas) setSelectedKelasId(firstAkhwatKelas.id);
    } else if (actor.role_key === 'guru' || actor.role_key === 'musyrif') {
      setFilterKampus('ikhwan');
      const firstIkhwanKelas = classes.find(k => k.gender === 'ikhwan');
      if (firstIkhwanKelas) setSelectedKelasId(firstIkhwanKelas.id);
    }

    const handleUpdate = () => {
      setKategoriList(getSharedKategoriHafalan());
      setSetoranList(getSharedTahfidzSetoran() as SetoranRecord[]);
      setCurrentActor(getActiveActor());
    };
    window.addEventListener('ks_hafalan_updated', handleUpdate);
    window.addEventListener('ks_tahfidz_setoran_updated', handleUpdate);
    window.addEventListener('ks_session_actor_changed', handleUpdate);
    return () => {
      window.removeEventListener('ks_hafalan_updated', handleUpdate);
      window.removeEventListener('ks_tahfidz_setoran_updated', handleUpdate);
      window.removeEventListener('ks_session_actor_changed', handleUpdate);
    };
  }, []);

  // Update default santri when selected kelas changes
  useEffect(() => {
    const students = isTenantMode() ? getSharedSantriList() : MASTER_SANTRI;
    const santriInKelas = students.filter(s => s.kelas_id === selectedKelasId);
    if (santriInKelas.length > 0) {
      setSelectedSantriNis(santriInKelas[0].nis);
    } else {
      setSelectedSantriNis('');
    }
  }, [selectedKelasId]);

  // Filtered santri options for current selected class
  const currentSantriList = isTenantMode() ? getSharedSantriList() : MASTER_SANTRI;
  const currentKelasList = isTenantMode() ? getSharedMasterKelas() : MASTER_KELAS;
  const availableSantri = currentSantriList.filter(s => s.kelas_id === selectedKelasId);

  // Filtered materi options for current selected tipe hafalan
  const availableMateri = kategoriList.filter(k => k.tipe === tipeHafalan);

  const handleSimpanSetoran = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(false);

    const santriSource = isTenantMode() ? getSharedSantriList() : MASTER_SANTRI;
    const kelasSource = isTenantMode() ? getSharedMasterKelas() : MASTER_KELAS;
    const selectedSantriObj = santriSource.find(s => s.nis === selectedSantriNis);
    const selectedKelasObj = kelasSource.find(k => k.id === selectedKelasId);
    const selectedMateriObj = kategoriList.find(k => k.id === selectedMateriId) || availableMateri[0];

    const santriNama = selectedSantriObj ? selectedSantriObj.nama : 'Santri';
    const kelasNama = selectedKelasObj ? selectedKelasObj.nama_kelas : 'Kelas';
    const materiNama = selectedMateriObj ? selectedMateriObj.nama_materi : 'Materi Hafalan';

    const newRecord: SetoranRecord = {
      id: `st-${Date.now()}`,
      santri: santriNama,
      nis: selectedSantriNis,
      kelas_id: selectedKelasId,
      kelas_nama: kelasNama,
      gender: selectedKelasObj?.gender || (selectedSantriObj?.gender || 'ikhwan'),
      tipe_hafalan: tipeHafalan,
      kategori_label: 
        tipeHafalan === 'quran' ? "Al-Qur'an" :
        tipeHafalan === 'hadis' ? 'Hadis Nabawi' :
        tipeHafalan === 'kitab' ? 'Kitab Kuning / Matan' : 'Kustom Yayasan',
      nama_materi: materiNama,
      rincian_hafalan: rincianHafalan,
      kelancaran: Number(skorKelancaran),
      tajwid: Number(skorTajwid),
      makhraj: Number(skorMakhraj),
      is_lulus: Number(skorKelancaran) >= 75,
      musyrif: currentActor.name,
      tanggal: new Date().toISOString().split('T')[0],
      catatan,
    };

    setSetoranList([newRecord, ...setoranList]);

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.from('tahfidz_setoran_v2').insert({
        jenis_setoran: tipeHafalan,
        juz: tipeHafalan === 'quran' ? 30 : null,
        halaman_mulai: 1,
        halaman_selesai: 1,
        skor_tajwid: Number(skorTajwid),
        skor_kelancaran: Number(skorKelancaran),
        skor_makhraj: Number(skorMakhraj),
        catatan_musyrif: `[${kelasNama}] ${materiNama}: ${rincianHafalan} - ${catatan}`,
        status_kelulusan: Number(skorKelancaran) >= 75 ? 'lulus' : 'belum_lulus',
      });
    } catch (err) {
      console.warn('Supabase setoran hafalan notice:', err);
    }

    setNotif(`✓ Setoran hafalan ${newRecord.kategori_label} ananda ${santriNama} (${kelasNama}) materi "${materiNama}" berhasil disimpan oleh ${currentActor.name}!`);
    setTimeout(() => setNotif(''), 7000);
  };

  const handleTambahKurikulumYayasan = (e: React.FormEvent) => {
    e.preventDefault();
    setModalKurikulumOpen(false);

    const tipeLabel = 
      formKurikulum.tipe === 'quran' ? "Al-Qur'an" :
      formKurikulum.tipe === 'hadis' ? 'Hadis Nabawi' :
      formKurikulum.tipe === 'kitab' ? 'Kitab Kuning / Matan' : 'Kustom Yayasan';

    addSharedKategoriHafalan({
      tipe: formKurikulum.tipe,
      tipe_label: tipeLabel,
      nama_materi: formKurikulum.nama_materi,
      sub_materi: formKurikulum.sub_materi || 'Target Hafalan Santri',
    });

    setNotif(`✓ Kurikulum materi hafalan baru "${formKurikulum.nama_materi}" (${tipeLabel}) berhasil ditambahkan oleh Yayasan!`);
    setFormKurikulum({ tipe: 'custom_yayasan', nama_materi: '', sub_materi: '' });
    setTimeout(() => setNotif(''), 7000);
  };

  const filteredSetoran = setoranList.filter(item => {
    if (filterKampus !== 'all' && item.gender !== filterKampus) return false;
    if (filterKelas !== 'semua' && item.kelas_id !== filterKelas) return false;
    if (filterTipe !== 'semua' && item.tipe_hafalan !== filterTipe) return false;
    return true;
  });

  const getTipeBadge = (tipe: SetoranRecord['tipe_hafalan']) => {
    switch (tipe) {
      case 'quran':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">Al-Qur'an</span>;
      case 'hadis':
        return <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px] border border-purple-300">Hadis</span>;
      case 'kitab':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-300">Kitab Kuning</span>;
      case 'custom_yayasan':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">Kustom Yayasan</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-500/40 uppercase">
            Kurikulum Tahfidz & Keislaman
          </span>
          <h1 className="text-xl font-bold mt-2">Mutaba'ah & Setoran Hafalan Santri</h1>
          <p className="text-xs text-emerald-200 mt-1">
            Mencakup Hafalan Al-Qur'an, Hadis Nabawi, Kitab Kuning/Matan, serta Kurikulum Kustom Yayasan
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Tombol Tambah Kurikulum Kustom oleh Yayasan */}
          <button
            onClick={() => setModalKurikulumOpen(true)}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 border border-emerald-500/30 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1.5"
          >
            <Library className="w-4 h-4 text-emerald-400" />
            <span>+ Kurikulum Hafalan Yayasan</span>
          </button>

          {/* Tombol Input Setoran Guru */}
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Input Setoran Guru</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start space-x-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{notif}</span>
        </div>
      )}

      {/* Banner Pemisahan Syar'i Halaqah Tahfidz */}
      <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-teal-200 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            📖
          </div>
          <div>
            <div className="font-bold text-emerald-950 flex items-center gap-2">
              <span>Halaqah Tahfidz Terpisah Syar'i (Putra vs Putri)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentActor.gender === 'akhwat' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
              }`}>
                Penyimak: {currentActor.name} ({currentActor.gender === 'akhwat' ? 'Ustadzah / Akhwat' : 'Ustadz / Ikhwan'})
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Ustadz/Musyrif membina santri putra di Kampus Putra (Masjid). Ustadzah/Musyrifah membina santriwati di Kampus Putri (Asrama Putri).
            </p>
          </div>
        </div>

        {/* Toggle Kampus Putra vs Putri */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-teal-200 shrink-0">
          <button
            onClick={() => setFilterKampus('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              filterKampus === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterKampus('ikhwan')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ${
              filterKampus === 'ikhwan' ? 'bg-blue-600 text-white' : 'text-blue-800 hover:bg-blue-50'
            }`}
          >
            <span>🕌 Kampus Putra</span>
          </button>
          <button
            onClick={() => setFilterKampus('akhwat')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ${
              filterKampus === 'akhwat' ? 'bg-rose-600 text-white' : 'text-rose-800 hover:bg-rose-50'
            }`}
          >
            <span>🧕 Kampus Putri</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Kelas & Tipe Hafalan */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold text-slate-700">Filter Data:</span>
        </div>

        <div className="flex flex-wrap gap-2 flex-1 sm:justify-end">
          {/* Filter Kelas */}
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="p-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="semua">Semua Kelas / Rombel</option>
            {MASTER_KELAS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama_kelas}
              </option>
            ))}
          </select>

          {/* Filter Tipe Hafalan */}
          <select
            value={filterTipe}
            onChange={(e) => setFilterTipe(e.target.value)}
            className="p-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="semua">Semua Kategori Hafalan</option>
            <option value="quran">Al-Qur'an</option>
            <option value="hadis">Hadis Nabawi</option>
            <option value="kitab">Kitab Kuning / Matan</option>
            <option value="custom_yayasan">Kustom Yayasan</option>
          </select>
        </div>
      </div>

      {/* Tabel Riwayat Setoran Hafalan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Catatan Setoran Hafalan Santri</span>
          </h2>
          <span className="text-[11px] text-slate-500">
            Menampilkan {filteredSetoran.length} catatan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Santri & Kelas</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Materi & Rincian Hafalan</th>
                <th className="p-3 text-center">Kelancaran</th>
                <th className="p-3 text-center">Tajwid</th>
                <th className="p-3 text-center">Makhraj</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Musyrif & Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSetoran.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <BookOpen className="w-8 h-8 text-blue-500" />
                      <p className="font-semibold text-sm text-slate-700">Belum ada laporan hafalan</p>
                      <p className="text-xs text-slate-400">Pencatatan setoran hafalan Al-Qur'an, Hadits, atau Matan santri akan muncul di sini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSetoran.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-800">{item.santri}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      NIS: {item.nis} • <span className="text-emerald-700 font-semibold">{item.kelas_nama}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {getTipeBadge(item.tipe_hafalan)}
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="font-bold text-slate-800">{item.nama_materi}</div>
                    <div className="text-[11px] text-slate-600 leading-snug">{item.rincian_hafalan}</div>
                    {item.catatan && (
                      <div className="text-[10px] text-slate-400 italic mt-0.5">"{item.catatan}"</div>
                    )}
                  </td>
                  <td className="p-3 text-center font-bold font-mono text-emerald-700">
                    {item.kelancaran}
                  </td>
                  <td className="p-3 text-center font-bold font-mono text-blue-700">
                    {item.tajwid}
                  </td>
                  <td className="p-3 text-center font-bold font-mono text-purple-700">
                    {item.makhraj}
                  </td>
                  <td className="p-3 text-center">
                    {item.is_lulus ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        Mutqin / Lulus
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                        Perlu Mengulang
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-800">{item.musyrif}</div>
                    <div className="text-[10px] text-slate-500">{item.tanggal}</div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: INPUT SETORAN GURU (PILIH KELAS DULU -> PILIH SANTRI) */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>Formulir Setoran Hafalan Guru</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Guru wajib memilih kelas terlebih dahulu, kemudian memilih santri
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimpanSetoran} className="space-y-4 text-xs">
              {/* STEP 1: PILIH KELAS DULU */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <label className="block font-bold text-emerald-950 mb-1">
                  1. Pilih Kelas Dulu (Wajib Pertama)
                </label>
                <select
                  value={selectedKelasId}
                  onChange={(e) => setSelectedKelasId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                >
                  {MASTER_KELAS.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kelas} (Wali: {k.wali_kelas} • {k.jumlah_santri} Santri)
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP 2: PILIH SANTRI (TERFILTER SESUAI KELAS) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Pilih Santri di Kelas Tersebut
                </label>
                {availableSantri.length > 0 ? (
                  <select
                    value={selectedSantriNis}
                    onChange={(e) => setSelectedSantriNis(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                  >
                    {availableSantri.map((s) => (
                      <option key={s.nis} value={s.nis}>
                        {s.nama} (NIS: {s.nis})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[11px]">
                    Belum ada santri terdaftar pada kelas ini.
                  </div>
                )}
              </div>

              {/* STEP 3: PILIH KATEGORI HAFALAN (AL-QUR'AN, HADIS, KITAB, KUSTOM YAYASAN) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  3. Kategori Hafalan
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'quran', label: "Al-Qur'an" },
                    { id: 'hadis', label: 'Hadis Nabawi' },
                    { id: 'kitab', label: 'Kitab Kuning' },
                    { id: 'custom_yayasan', label: 'Kustom Yayasan' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTipeHafalan(cat.id as any)}
                      className={`py-2 text-[11px] font-bold rounded-lg transition border text-center ${
                        tipeHafalan === cat.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 4: PILIH MATERI & RINCIAN */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Materi / Kitab / Bab
                  </label>
                  <select
                    value={selectedMateriId}
                    onChange={(e) => setSelectedMateriId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                  >
                    {availableMateri.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama_materi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rincian (Surah/Ayat/Hadis ke-/Bait)
                  </label>
                  <input
                    type="text"
                    required
                    value={rincianHafalan}
                    onChange={(e) => setRincianHafalan(e.target.value)}
                    placeholder="Contoh: An-Naba: 1-40 / Hadis 1-5"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* STEP 5: PENILAIAN */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-700">Penilaian Penguji (Skala 0 - 100)</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Kelancaran</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={skorKelancaran}
                      onChange={(e) => setSkorKelancaran(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Tajwid / Kaidah</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={skorTajwid}
                      onChange={(e) => setSkorTajwid(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Makhraj / Fashahah</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={skorMakhraj}
                      onChange={(e) => setSkorMakhraj(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Catatan Evaluasi Guru */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Evaluasi Musyrif / Guru
                </label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Catatan kelebihan atau perbaikan bacaan santri..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition"
                >
                  Simpan Setoran Hafalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TAMBAH KURIKULUM HAFALAN YAYASAN (DIISI MANUAL OLEH YAYASAN) */}
      {/* ========================================================================= */}
      {modalKurikulumOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <Library className="w-5 h-5 text-emerald-600" />
                  <span>Tambah Kurikulum Hafalan (Yayasan)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Yayasan dapat menambahkan materi Hadis, Kitab Kuning, atau Kustom
                </p>
              </div>
              <button
                onClick={() => setModalKurikulumOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTambahKurikulumYayasan} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori Materi
                </label>
                <select
                  value={formKurikulum.tipe}
                  onChange={(e) => setFormKurikulum({ ...formKurikulum, tipe: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="custom_yayasan">Kustom Yayasan (Doa, Dzikir, dsb)</option>
                  <option value="hadis">Hadis Nabawi (Kitab Hadis Baru)</option>
                  <option value="kitab">Kitab Kuning / Matan Ilmiah</option>
                  <option value="quran">Al-Qur'an (Juz / Surah Pilihan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Materi / Kitab Baru
                </label>
                <input
                  type="text"
                  required
                  value={formKurikulum.nama_materi}
                  onChange={(e) => setFormKurikulum({ ...formKurikulum, nama_materi: e.target.value })}
                  placeholder="Contoh: Matan Al-Bayanuni / Riyadhus Shalihin Juz 2"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi / Target Capaian
                </label>
                <input
                  type="text"
                  value={formKurikulum.sub_materi}
                  onChange={(e) => setFormKurikulum({ ...formKurikulum, sub_materi: e.target.value })}
                  placeholder="Contoh: Target semester genap kelas 8 santri asrama"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalKurikulumOpen(false)}
                  className="flex-1 py-2.5 font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition"
                >
                  Simpan ke Kurikulum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
