'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, AlertTriangle, Plus, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink, Sparkles, HeartHandshake, BookOpen } from 'lucide-react';
import { 
  getSharedPermissionRequests, 
  getSharedDisciplineRecords, 
  addSharedDisciplineRecord,
  DisciplineRecord,
  MASTER_SANTRI,
  validateIslamicSegregation
} from '@/lib/sharedDataStore';
import { getActiveActor, MASTER_PILLAR_ACTORS, ActiveActor } from '@/lib/sessionStore';

export default function DisiplinRewardPage() {
  const [activeTab, setActiveTab] = useState<'adab' | 'reward' | 'pelanggaran'>('adab');
  const [genderFilter, setGenderFilter] = useState<'all' | 'ikhwan' | 'akhwat'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [notif, setNotif] = useState('');
  const [overdueCount, setOverdueCount] = useState(0);
  const [records, setRecords] = useState<DisciplineRecord[]>([]);
  const [currentActor, setCurrentActor] = useState<ActiveActor>(MASTER_PILLAR_ACTORS.yayasan);

  const refreshData = () => {
    setRecords(getSharedDisciplineRecords());
    const overdue = getSharedPermissionRequests().filter(r => r.status === 'OVERDUE' || r.status === 'CASE_REVIEW');
    setOverdueCount(overdue.length);
  };

  // Handle URL query parameters (?tab=adab|reward|pelanggaran&santri=...) & Realtime listener
  useEffect(() => {
    refreshData();
    const actor = getActiveActor();
    setCurrentActor(actor);

    if (actor.role_key === 'guru_akhwat' || actor.role_key === 'musyrifah' || actor.gender === 'akhwat') {
      setGenderFilter('akhwat');
      setFormData(prev => ({ ...prev, santri: 'Fathimah Az-Zahra' }));
    } else if (actor.role_key === 'guru' || actor.role_key === 'musyrif') {
      setGenderFilter('ikhwan');
      setFormData(prev => ({ ...prev, santri: 'Muhammad Al-Fatih' }));
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const santriParam = params.get('santri');

      if (tabParam === 'pelanggaran') {
        setActiveTab('pelanggaran');
      } else if (tabParam === 'reward') {
        setActiveTab('reward');
      } else if (tabParam === 'adab') {
        setActiveTab('adab');
      }

      if (santriParam) {
        setFormData(prev => ({
          ...prev,
          santri: santriParam,
          kategori: tabParam === 'adab' ? 'Penilaian Adab & Akhlaq Santri' : 'Pelanggaran Kedisiplinan / Perizinan',
          tindakan: tabParam === 'adab' ? 'Pemberian apresiasi adab islami' : 'Iqob Tarbawi: Piket Asrama & Murajaah Hafalan',
          poin: tabParam === 'adab' ? 5 : 10,
        }));
        setModalOpen(true);
      }

      const handleUpdate = () => {
        refreshData();
        setCurrentActor(getActiveActor());
      };
      window.addEventListener('ks_discipline_updated', handleUpdate);
      window.addEventListener('ks_permission_updated', handleUpdate);
      window.addEventListener('ks_session_actor_changed', handleUpdate);
      return () => {
        window.removeEventListener('ks_discipline_updated', handleUpdate);
        window.removeEventListener('ks_permission_updated', handleUpdate);
        window.removeEventListener('ks_session_actor_changed', handleUpdate);
      };
    }
  }, []);

  const [formData, setFormData] = useState({
    santri: 'Muhammad Al-Fatih',
    kategori: '',
    poin: 5,
    tindakan: '',
  });

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    
    const matchedSantri = MASTER_SANTRI.find(s => s.nama === formData.santri);
    if (matchedSantri && currentActor.gender) {
      const segValidation = validateIslamicSegregation(currentActor.gender, matchedSantri.gender);
      if (!segValidation.isValid) {
        setNotif(`❌ ${segValidation.message}`);
        setTimeout(() => setNotif(''), 8000);
        return;
      }
    }

    setModalOpen(false);
    
    const finalPoints = activeTab === 'pelanggaran' ? -Math.abs(formData.poin) : Math.abs(formData.poin);
    const nisToSave = matchedSantri?.nis || '202601001';

    addSharedDisciplineRecord({
      santri: formData.santri,
      nis: nisToSave,
      tipe: activeTab,
      kategori: formData.kategori,
      poin: finalPoints,
      tindakan: formData.tindakan,
      tanggal: new Date().toISOString().split('T')[0],
    });

    const labelMap = {
      adab: 'Adab & Karakter Santri',
      reward: 'Prestasi & Reward Santri',
      pelanggaran: 'Pelanggaran Disiplin Tarbawi'
    };

    setNotif(`Catatan ${labelMap[activeTab]} ananda ${formData.santri} berhasil dicatat oleh ${currentActor.name} dan disinkronkan ke profil santri.`);
    setTimeout(() => setNotif(''), 6000);
  };

  const filteredRecords = records.filter(r => {
    if (r.tipe !== activeTab) return false;
    if (genderFilter === 'all') return true;
    const sObj = MASTER_SANTRI.find(s => s.nama === r.santri || s.nis === r.nis);
    return sObj ? sObj.gender === genderFilter : true;
  });

  const adabCount = records.filter(r => {
    if (r.tipe !== 'adab') return false;
    if (genderFilter === 'all') return true;
    const sObj = MASTER_SANTRI.find(s => s.nama === r.santri || s.nis === r.nis);
    return sObj ? sObj.gender === genderFilter : true;
  }).length;

  const rewardCount = records.filter(r => {
    if (r.tipe !== 'reward') return false;
    if (genderFilter === 'all') return true;
    const sObj = MASTER_SANTRI.find(s => s.nama === r.santri || s.nis === r.nis);
    return sObj ? sObj.gender === genderFilter : true;
  }).length;

  const pelanggaranCount = records.filter(r => {
    if (r.tipe !== 'pelanggaran') return false;
    if (genderFilter === 'all') return true;
    const sObj = MASTER_SANTRI.find(s => s.nama === r.santri || s.nis === r.nis);
    return sObj ? sObj.gender === genderFilter : true;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Paket Tier 1 (Free 50 Santri Included)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Pilar Karakter & Asrama
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Tugas Guru & Musyrif: Adab, Reward & Disiplin Santri</h1>
          <p className="text-xs text-slate-500">Pencatatan Adab Harian (Sopan Santun, Dzikir, Sunnah), Prestasi (Reward), dan Kedisiplinan Tarbawi santri.</p>
        </div>

        <button
          onClick={() => {
            const defaultSantri = genderFilter === 'akhwat' || currentActor.gender === 'akhwat' 
              ? 'Fathimah Az-Zahra' 
              : 'Muhammad Al-Fatih';
            setFormData({
              santri: defaultSantri,
              kategori: activeTab === 'adab' ? 'Adab Sopan Santun kepada Guru & Musyrif' : activeTab === 'reward' ? 'Juara Lomba Tahfidz / Akademik' : 'Terlambat Masuk Halaqah',
              poin: activeTab === 'adab' ? 5 : activeTab === 'reward' ? 15 : 10,
              tindakan: activeTab === 'adab' ? 'Catatan Akhlak Mulia di Rapor' : activeTab === 'reward' ? 'Sertifikat & Apresiasi Dewan Asatidz' : 'Iqob Tarbawi: Murajaah & Piket',
            });
            setModalOpen(true);
          }}
          className={`px-4 py-2.5 text-white text-xs font-semibold rounded-xl shadow-sm transition inline-flex items-center space-x-1.5 ${
            activeTab === 'adab' 
              ? 'bg-teal-600 hover:bg-teal-700' 
              : activeTab === 'reward' 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-rose-600 hover:bg-rose-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>
            Tambah {activeTab === 'adab' ? 'Penilaian Adab' : activeTab === 'reward' ? 'Prestasi / Reward' : 'Catatan Pelanggaran'}
          </span>
        </button>
      </div>

      {notif && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {overdueCount > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Alert Kesantrian: Ditemukan {overdueCount} Santri Terlambat Kembali / Membutuhkan Case Review</span>
              <p className="text-[11px] text-rose-700">Sesuai SOP, keterlambatan perizinan tidak langsung diberi sanksi. Lakukan sidang Case Review untuk menentukan EXCUSED atau VIOLATION.</p>
            </div>
          </div>
          <Link
            href="/akademik/perizinan"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition inline-flex items-center space-x-1 shrink-0"
          >
            <span>Buka Sidang Perizinan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Banner Segregasi Syar'i Ikhwan vs Akhwat */}
      <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <span className="text-xl">🕌</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Sistem Pembinaan Syar'i: Pemisahan Kampus Ikhwan &amp; Akhwat</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentActor.gender === 'akhwat' ? 'bg-pink-100 text-pink-800 border border-pink-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                Pendidik: {currentActor.name} ({currentActor.gender === 'akhwat' ? 'Ustadzah / Musyrifah Akhwat' : 'Ustadz / Musyrif Ikhwan'})
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Guru &amp; Musyrif Ikhwan membina santri putra di Kampus Putra; Guru &amp; Musyrifah Akhwat membina santriwati di Kampus Putri.
            </p>
          </div>
        </div>

        {/* Kampus Filter Tabs */}
        <div className="flex bg-white/90 border border-slate-200 p-1 rounded-xl shadow-xs shrink-0">
          <button
            onClick={() => setGenderFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              genderFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Kampus
          </button>
          <button
            onClick={() => {
              setGenderFilter('ikhwan');
              setFormData(prev => ({ ...prev, santri: 'Muhammad Al-Fatih' }));
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
              genderFilter === 'ikhwan' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <span>🕌 Kampus Putra</span>
          </button>
          <button
            onClick={() => {
              setGenderFilter('akhwat');
              setFormData(prev => ({ ...prev, santri: 'Fathimah Az-Zahra' }));
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
              genderFilter === 'akhwat' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
            }`}
          >
            <span>🧕 Kampus Putri</span>
          </button>
        </div>
      </div>

      {/* 3-Tab Selector: Adab, Reward, Pelanggaran */}
      <div className="flex flex-wrap bg-slate-200/80 p-1.5 rounded-2xl text-xs w-fit gap-1 shadow-inner">
        <button
          onClick={() => setActiveTab('adab')}
          className={`px-4 py-2 font-bold rounded-xl transition flex items-center space-x-2 ${
            activeTab === 'adab' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1. Adab & Karakter Santri</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
            activeTab === 'adab' ? 'bg-teal-800 text-white' : 'bg-slate-300 text-slate-700'
          }`}>
            {adabCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reward')}
          className={`px-4 py-2 font-bold rounded-xl transition flex items-center space-x-2 ${
            activeTab === 'reward' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>2. Reward & Prestasi</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
            activeTab === 'reward' ? 'bg-emerald-800 text-white' : 'bg-slate-300 text-slate-700'
          }`}>
            {rewardCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pelanggaran')}
          className={`px-4 py-2 font-bold rounded-xl transition flex items-center space-x-2 ${
            activeTab === 'pelanggaran' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>3. Pelanggaran & Disiplin Tarbawi</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
            activeTab === 'pelanggaran' ? 'bg-rose-800 text-white' : 'bg-slate-300 text-slate-700'
          }`}>
            {pelanggaranCount}
          </span>
        </button>
      </div>

      {/* Table Records */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Santri</th>
                <th className="py-3 px-4">
                  {activeTab === 'adab' ? 'Adab / Karakter Mulia' : activeTab === 'reward' ? 'Prestasi / Capaian Santri' : 'Pelanggaran / Ketidakdisiplinan'}
                </th>
                <th className="py-3 px-4">
                  {activeTab === 'adab' ? 'Apresiasi & Pembinaan Karakter' : activeTab === 'reward' ? 'Bentuk Hadiah / Apresiasi' : 'Tindakan Sanksi Tarbiyah (Iqob)'}
                </th>
                <th className="py-3 px-4 text-center">Poin</th>
                <th className="py-3 px-4">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada data {activeTab === 'adab' ? 'adab & karakter santri' : activeTab === 'reward' ? 'prestasi' : 'pelanggaran'} tercatat.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{r.santri}</div>
                      <div className="text-[10px] text-slate-400">NIS: {r.nis}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{r.kategori}</span>
                        {r.permission_id && (
                          <Link
                            href={`/akademik/perizinan?highlight=${r.permission_id}`}
                            className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold bg-rose-100/90 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full hover:bg-rose-200 transition"
                            title="Lihat riwayat investigasi & putusan sidang Case Review"
                          >
                            <span>Sidang #{r.permission_id}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.tindakan}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                        activeTab === 'adab'
                          ? 'bg-teal-100 text-teal-800'
                          : r.poin > 0 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.poin > 0 ? `+${r.poin}` : r.poin}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{r.tanggal}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Adab / Reward / Pelanggaran */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base">
              {activeTab === 'adab' 
                ? 'Catat Adab & Karakter Santri' 
                : activeTab === 'reward' 
                  ? 'Catat Prestasi & Reward Santri' 
                  : 'Catat Pelanggaran Kedisiplinan'}
            </h3>

            <form onSubmit={handleSimpan} className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Nama Santri *</label>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    genderFilter === 'akhwat' || currentActor.gender === 'akhwat'
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {genderFilter === 'akhwat' || currentActor.gender === 'akhwat'
                      ? '🧕 Santriwati Putri (Akhwat)'
                      : '🕌 Santri Putra (Ikhwan)'}
                  </span>
                </div>
                <select
                  value={formData.santri}
                  onChange={(e) => setFormData({ ...formData, santri: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                >
                  {MASTER_SANTRI
                    .filter(s => {
                      if (currentActor.role_key === 'guru_akhwat' || currentActor.role_key === 'musyrifah' || currentActor.gender === 'akhwat') {
                        return s.gender === 'akhwat';
                      }
                      if (currentActor.role_key === 'guru' || currentActor.role_key === 'musyrif' || currentActor.gender === 'ikhwan') {
                        return s.gender === 'ikhwan';
                      }
                      return genderFilter === 'all' ? true : s.gender === genderFilter;
                    })
                    .map(s => (
                      <option key={s.nis} value={s.nama}>
                        {s.nama} ({s.gender === 'ikhwan' ? 'Putra' : 'Putri'} - {s.kelas_id})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {activeTab === 'adab' 
                    ? 'Jenis Adab / Akhlak Mulia:' 
                    : activeTab === 'reward' 
                      ? 'Nama Prestasi / Capaian:' 
                      : 'Kategori / Nama Pelanggaran:'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  placeholder={
                    activeTab === 'adab'
                      ? 'Contoh: Sopan santun kepada ustadz, adab makan sunnah'
                      : activeTab === 'reward' 
                        ? 'Contoh: Juara 1 Pidato Bahasa Arab' 
                        : 'Contoh: Terlambat Sholat Berjamaah'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bobot Poin {activeTab === 'pelanggaran' ? 'Pengurangan (-)' : 'Kebaikan (+)'}:
                </label>
                <input
                  type="number"
                  required
                  value={formData.poin}
                  onChange={(e) => setFormData({ ...formData, poin: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {activeTab === 'adab' 
                    ? 'Tindakan Penguatan Adab / Catatan Rapor:' 
                    : activeTab === 'reward' 
                      ? 'Bentuk Apresiasi / Hadiah:' 
                      : 'Tindakan Sanksi Edukatif (Iqob Tarbawi):'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.tindakan}
                  onChange={(e) => setFormData({ ...formData, tindakan: e.target.value })}
                  placeholder={
                    activeTab === 'adab'
                      ? 'Contoh: Catatan teladan adab di halaqah & asrama'
                      : activeTab === 'reward' 
                        ? 'Contoh: Sertifikat penghargaan & apresiasi' 
                        : 'Contoh: Menghafal Surah Al-Mulk ayat 1-10 & piket'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-semibold rounded-lg shadow-sm ${
                    activeTab === 'adab'
                      ? 'bg-teal-600 hover:bg-teal-700'
                      : activeTab === 'reward' 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
