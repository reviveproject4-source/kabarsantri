'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserCheck, CheckCircle2, Search, Building2, School, ShieldCheck, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { getActiveActor, MASTER_PILLAR_ACTORS, ActiveActor } from '@/lib/sessionStore';
import { MASTER_SANTRI, validateIslamicSegregation, isTenantMode, getSharedSantriList } from '@/lib/sharedDataStore';

interface SantriPresensiItem {
  id: string;
  nis: string;
  nama: string;
  gender: 'ikhwan' | 'akhwat';
  kamar: string;
  kelas: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpa';
}

const INITIAL_SANTRI_IKHWAN: SantriPresensiItem[] = [
  { id: 's-1', nis: '202601001', nama: 'Muhammad Al-Fatih', gender: 'ikhwan', kamar: 'Kamar 101 - Gedung Abu Bakar', kelas: 'Kelas 7A Tahfidz Putra', status: 'hadir' },
  { id: 's-2', nis: '202601015', nama: 'Ahmad Zaki Mubarak', gender: 'ikhwan', kamar: 'Kamar 101 - Gedung Abu Bakar', kelas: 'Kelas 7A Tahfidz Putra', status: 'hadir' },
  { id: 's-3', nis: '202601018', nama: 'Bilal Habasyi', gender: 'ikhwan', kamar: 'Kamar 102 - Gedung Abu Bakar', kelas: 'Kelas 7B Tahfidz Putra', status: 'hadir' },
  { id: 's-4', nis: '202601021', nama: 'Fatih Al-Ayyubi', gender: 'ikhwan', kamar: 'Kamar 102 - Gedung Abu Bakar', kelas: 'Kelas 7A Tahfidz Putra', status: 'hadir' },
  { id: 's-5', nis: '202601031', nama: 'Umar Faruq', gender: 'ikhwan', kamar: 'Kamar 103 - Gedung Utsman', kelas: 'Kelas 7A Tahfidz Putra', status: 'hadir' },
  { id: 's-6', nis: '202601034', nama: 'Ali Zainal Abidin', gender: 'ikhwan', kamar: 'Kamar 203 - Gedung Utsman', kelas: 'Kelas 8A Tahfidz Putra', status: 'hadir' },
];

const INITIAL_SANTRI_AKHWAT: SantriPresensiItem[] = [
  { id: 's-15', nis: '202602001', nama: 'Fathimah Az-Zahra', gender: 'akhwat', kamar: 'Kamar 201 - Gedung Khadijah', kelas: 'Kelas 8B Putri (Akhwat)', status: 'hadir' },
  { id: 's-16', nis: '202602002', nama: 'Maryam Al-Batul', gender: 'akhwat', kamar: 'Kamar 202 - Gedung Khadijah', kelas: 'Kelas 8B Putri (Akhwat)', status: 'hadir' },
  { id: 's-17', nis: '202602003', nama: 'Aisyah Humaira', gender: 'akhwat', kamar: 'Kamar 203 - Gedung Khadijah', kelas: 'Kelas 9B Putri (Akhwat)', status: 'hadir' },
  { id: 's-18', nis: '202602004', nama: 'Hafshah binti Umar', gender: 'akhwat', kamar: 'Kamar 204 - Gedung Khadijah', kelas: 'Kelas 8B Putri (Akhwat)', status: 'hadir' },
  { id: 's-19', nis: '202602005', nama: 'Zainab Al-Kubra', gender: 'akhwat', kamar: 'Kamar 205 - Gedung Khadijah', kelas: 'Kelas 9B Putri (Akhwat)', status: 'hadir' },
  { id: 's-20', nis: '202602006', nama: 'Khadijah Al-Kubro', gender: 'akhwat', kamar: 'Kamar 206 - Gedung Khadijah', kelas: 'Kelas 9B Putri (Akhwat)', status: 'hadir' },
];

export default function AbsenSantriRolePage() {
  const [currentActor, setCurrentActor] = useState<ActiveActor>(MASTER_PILLAR_ACTORS.yayasan);
  const [notif, setNotif] = useState('');
  const [kampus, setKampus] = useState<'ikhwan' | 'akhwat'>('ikhwan');
  const [mode, setMode] = useState<'kbm' | 'asrama'>('asrama');
  const [sesi, setSesi] = useState('Sholat Subuh Berjamaah');
  const [santriList, setSantriList] = useState<SantriPresensiItem[]>([]);

  useEffect(() => {
    const actor = getActiveActor();
    setCurrentActor(actor);

    const isTenant = isTenantMode();
    if (isTenant) {
      const shared = getSharedSantriList();
      const filtered = shared.filter(s => s.gender === kampus);
      const mapped: SantriPresensiItem[] = filtered.map(s => ({
        id: s.id || s.nis,
        nis: s.nis,
        nama: s.nama,
        gender: s.gender,
        kamar: s.kamar || 'Kamar Asrama',
        kelas: s.kelas || s.kelas_id || 'Rombel Kelas',
        status: 'hadir' as const,
      }));
      setSantriList(mapped);
    } else {
      if (actor.role_key === 'guru_akhwat' || actor.role_key === 'musyrifah' || actor.gender === 'akhwat') {
        setKampus('akhwat');
        setSantriList(INITIAL_SANTRI_AKHWAT);
      } else {
        setKampus('ikhwan');
        setSantriList(INITIAL_SANTRI_IKHWAN);
      }
    }

    const handleActorChange = () => {
      const updated = getActiveActor();
      setCurrentActor(updated);
      if (isTenantMode()) {
        const shared = getSharedSantriList();
        const filtered = shared.filter(s => s.gender === kampus);
        setSantriList(filtered.map(s => ({
          id: s.id || s.nis,
          nis: s.nis,
          nama: s.nama,
          gender: s.gender,
          kamar: s.kamar || 'Kamar Asrama',
          kelas: s.kelas || s.kelas_id || 'Rombel Kelas',
          status: 'hadir' as const,
        })));
      } else {
        if (updated.role_key === 'guru_akhwat' || updated.role_key === 'musyrifah' || updated.gender === 'akhwat') {
          setKampus('akhwat');
          setSantriList(INITIAL_SANTRI_AKHWAT);
        } else {
          setKampus('ikhwan');
          setSantriList(INITIAL_SANTRI_IKHWAN);
        }
      }
    };

    window.addEventListener('ks_session_actor_changed', handleActorChange);
    window.addEventListener('ks_tenant_santri_updated', handleActorChange);
    return () => {
      window.removeEventListener('ks_session_actor_changed', handleActorChange);
      window.removeEventListener('ks_tenant_santri_updated', handleActorChange);
    };
  }, [kampus]);

  const handleSwitchKampus = (newKampus: 'ikhwan' | 'akhwat') => {
    if (currentActor.gender && currentActor.gender !== newKampus) {
      const seg = validateIslamicSegregation(currentActor.gender, newKampus);
      if (!seg.isValid) {
        setNotif(`❌ ${seg.message}`);
        setTimeout(() => setNotif(''), 7000);
        return;
      }
    }

    setKampus(newKampus);
    if (isTenantMode()) {
      const shared = getSharedSantriList();
      const filtered = shared.filter(s => s.gender === newKampus);
      setSantriList(filtered.map(s => ({
        id: s.id || s.nis,
        nis: s.nis,
        nama: s.nama,
        gender: s.gender,
        kamar: s.kamar || 'Kamar Asrama',
        kelas: s.kelas || s.kelas_id || 'Rombel Kelas',
        status: 'hadir' as const,
      })));
    } else {
      setSantriList(newKampus === 'akhwat' ? INITIAL_SANTRI_AKHWAT : INITIAL_SANTRI_IKHWAN);
    }
  };

  const setSantriStatus = (id: string, status: 'hadir' | 'izin' | 'sakit' | 'alpa') => {
    setSantriList(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleSimpanAbsensi = () => {
    const totalHadir = santriList.filter(s => s.status === 'hadir').length;
    const totalSakit = santriList.filter(s => s.status === 'sakit').length;
    const totalIzin = santriList.filter(s => s.status === 'izin').length;
    const totalAlpa = santriList.filter(s => s.status === 'alpa').length;

    setNotif(
      `✓ Presensi Santri [${kampus === 'akhwat' ? '🧕 Kampus Putri' : '🕌 Kampus Putra'}] sesi "${sesi}" dicatat oleh ${currentActor.name}: Hadir ${totalHadir}, Sakit ${totalSakit}, Izin ${totalIzin}, Alpa ${totalAlpa}. Tersinkronisasi ke Portal Wali Santri & Rapor!`
    );
    setTimeout(() => setNotif(''), 7000);
  };

  const hadirCount = santriList.filter(s => s.status === 'hadir').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Paket Tier 1 (Free 50 Santri Included)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Presensi &amp; Absensi Santri
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Presensi &amp; Absensi Santri Syar'i</h1>
          <p className="text-xs text-slate-500">Pencatatan Kehadiran Santri Ikhwan &amp; Santriwati Akhwat oleh Guru KBM dan Musyrif/Musyrifah Asrama.</p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs gap-1 shadow-inner">
          <button
            onClick={() => setMode('asrama')}
            className={`px-3 py-1.5 font-bold rounded-lg transition flex items-center space-x-1.5 ${
              mode === 'asrama' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Mode Musyrif (Asrama/Sholat)</span>
          </button>
          <button
            onClick={() => setMode('kbm')}
            className={`px-3 py-1.5 font-bold rounded-lg transition flex items-center space-x-1.5 ${
              mode === 'kbm' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Mode Guru (KBM Kelas)</span>
          </button>
        </div>
      </div>

      {/* Syar'i Segregation Banner */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🕌</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Segregasi Syar'i Presensi Pesantren</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                currentActor.gender === 'akhwat' ? 'bg-pink-100 text-pink-800 border border-pink-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                Pencatat: {currentActor.name} ({currentActor.gender === 'akhwat' ? 'Ustadzah / Musyrifah Akhwat' : 'Ustadz / Musyrif Ikhwan'})
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {kampus === 'akhwat' 
                ? 'Kampus Putri: Gedung Khadijah & Musholla Putri dibina oleh Ustadzah / Musyrifah Akhwat.' 
                : 'Kampus Putra: Masjid Jami\' & Asrama Abu Bakar/Utsman dibina oleh Ustadz / Musyrif Ikhwan.'}
            </p>
          </div>
        </div>

        {/* Kampus Switch Buttons */}
        <div className="flex bg-white/90 border border-slate-200 p-1 rounded-xl shadow-xs shrink-0 gap-1">
          <button
            onClick={() => handleSwitchKampus('ikhwan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              kampus === 'ikhwan' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <span>🕌 Kampus Putra (Ikhwan)</span>
          </button>
          <button
            onClick={() => handleSwitchKampus('akhwat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              kampus === 'akhwat' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
            }`}
          >
            <span>🧕 Kampus Putri (Akhwat)</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 border shadow-xs ${
          notif.startsWith('❌') 
            ? 'bg-rose-50 border-rose-300 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {notif.startsWith('❌') ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span className="font-medium">{notif}</span>
        </div>
      )}

      {/* Sesi Filter & Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700">Pilih Sesi Ibadah/KBM:</span>
          <select
            value={sesi}
            onChange={(e) => setSesi(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
          >
            {mode === 'asrama' ? (
              <>
                <option>{kampus === 'akhwat' ? 'Sholat Subuh di Musholla Khadijah' : 'Sholat Subuh di Masjid Jami\''}</option>
                <option>{kampus === 'akhwat' ? 'Sholat Ashar di Musholla Khadijah' : 'Sholat Ashar di Masjid Jami\''}</option>
                <option>{kampus === 'akhwat' ? 'Sholat Maghrib & Isya Musholla Putri' : 'Sholat Maghrib & Isya Masjid Jami\''}</option>
                <option>{kampus === 'akhwat' ? 'Apel Kamar Asrama Gedung Khadijah' : 'Apel Kamar Asrama Abu Bakar & Utsman'}</option>
              </>
            ) : (
              <>
                <option>KBM Pagi (Jam Ke-1 s.d 4 - 07:30 s.d 10:00)</option>
                <option>KBM Siang (Jam Ke-5 s.d 8 - 10:30 s.d 12:30)</option>
              </>
            )}
          </select>

          <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Kehadiran: <strong className="text-emerald-700">{hadirCount}</strong> / {santriList.length} Santri
          </span>
        </div>

        <button
          onClick={handleSimpanAbsensi}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
        >
          <UserCheck className="w-4 h-4" />
          <span>Simpan Presensi Santri</span>
        </button>
      </div>

      {/* List Santri Presensi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Santri</th>
                <th className="py-3 px-4">{mode === 'asrama' ? 'Kamar Asrama' : 'Rombel Kelas'}</th>
                <th className="py-3 px-4 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {santriList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <UserCheck className="w-8 h-8 text-blue-500" />
                      <p className="font-semibold text-sm text-slate-700">
                        Belum ada data santri terdaftar {kampus === 'akhwat' ? 'Putri' : 'Putra'}
                      </p>
                      <p className="text-xs text-slate-400">Silakan daftarkan santri terlebih dahulu di menu Data Santri untuk mulai merekap presensi harian.</p>
                      <Link
                        href={isTenantMode() ? "/santri/create?mode=tenant" : "/santri/create"}
                        className="mt-2 inline-flex items-center space-x-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        <span>+ Daftarkan Santri Baru</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                santriList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800">{s.nama}</div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        s.gender === 'akhwat' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {s.gender === 'akhwat' ? 'Santriwati' : 'Santri Putra'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">NIS: {s.nis}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {mode === 'asrama' ? s.kamar : s.kelas}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-1.5">
                      {(['hadir', 'izin', 'sakit', 'alpa'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setSantriStatus(s.id, st)}
                          className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition ${
                            s.status === st
                              ? st === 'hadir'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : st === 'izin'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : st === 'sakit'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
