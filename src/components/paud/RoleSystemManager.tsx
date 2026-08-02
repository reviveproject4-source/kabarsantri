import React, { useState } from 'react';
import {
  UserAccount,
  TenantPaud,
  KelasPaud,
  RekapMuridPaud,
  RentangWaktu,
  CatatanObservasiHarian,
  CatatanAdabMingguan
} from '../../types/paudTypes';
import { generateRaporPDF } from '../../utils/pdfGenerator';
import { soundFx } from '../../utils/soundEffects';
import { DropdownRentangWaktu } from './DropdownRentangWaktu';
import { calculateWeeklyReport, getCompletionColorBadge } from '../../utils/reportAggregator';

interface RoleSystemManagerProps {
  currentUser: UserAccount;
  daftarTenant: TenantPaud[];
  daftarMurid: RekapMuridPaud[];
  onSwitchUserRole: (user: UserAccount) => void;
  onAddTenant: (namaSekolah: string, kodeYayasan: string) => void;
  onDeleteTenant: (tenantId: string) => void;
}

export const MOCK_USERS_LIST: UserAccount[] = [
  {
    id: 'u-guru-1',
    nama: 'Ustadzah Fatimah, S.Pd',
    email: 'fatimah@paud.sch.id',
    role: 'guru',
    tenantId: 'tenant-paud-01',
    schoolId: 'sch-01',
    classId: 'kelas-a',
    avatarEmoji: '👩‍🏫',
    lastInputDate: '2026-07-30'
  },
  {
    id: 'u-guru-2',
    nama: 'Ustadzah Mariam, S.Pd',
    email: 'mariam@paud.sch.id',
    role: 'guru',
    tenantId: 'tenant-paud-01',
    schoolId: 'sch-01',
    classId: 'kelas-b',
    avatarEmoji: '👩‍🏫',
    lastInputDate: '2026-07-20'
  },
  {
    id: 'u-kepsek-1',
    nama: 'Hj. Aminah, M.Pd (Kepala Sekolah)',
    email: 'kepsek@paud.sch.id',
    role: 'kepala_sekolah',
    tenantId: 'tenant-paud-01',
    schoolId: 'sch-01',
    avatarEmoji: '🎓'
  },
  {
    id: 'u-yayasan-1',
    nama: 'Drs. H. Ahmad (Pengurus Yayasan)',
    email: 'yayasan@cendekia.or.id',
    role: 'yayasan',
    tenantId: 'tenant-paud-01',
    avatarEmoji: '🏛️'
  }
];

export const MOCK_KELAS_LIST: KelasPaud[] = [
  { id: 'kelas-a', schoolId: 'sch-01', namaKelas: 'Kelas A (Bintang 2-3th)', kategoriUsia: '2_tahun', guruNama: 'Ustadzah Fatimah, S.Pd' },
  { id: 'kelas-b', schoolId: 'sch-01', namaKelas: 'Kelas B (Matahari 4-5th)', kategoriUsia: '5_tahun', guruNama: 'Ustadzah Mariam, S.Pd' }
];

export const RoleSystemManager: React.FC<RoleSystemManagerProps> = ({
  currentUser,
  daftarTenant,
  daftarMurid,
  onSwitchUserRole,
  onAddTenant,
  onDeleteTenant
}) => {
  const [rentangWaktu, setRentangWaktu] = useState<RentangWaktu>('harian');
  const [activeTabManage, setActiveTabManage] = useState<'overview' | 'reminder'>('overview');

  // Form Tambah Tenant oleh Yayasan
  const [namaSekolahBaru, setNamaSekolahBaru] = useState('');
  const [kodeYayasanBaru, setKodeYayasanBaru] = useState('');

  // DRILL DOWN STATE FOR KEPSEK
  const [drillDownClass, setDrillDownClass] = useState<KelasPaud | null>(null);

  // Load Saved Observations per Tenant
  const [obsList] = useState<CatatanObservasiHarian[]>(() => {
    try {
      const saved = localStorage.getItem(`paud_observasi_${currentUser.tenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [adabList] = useState<CatatanAdabMingguan[]>(() => {
    try {
      const saved = localStorage.getItem(`paud_adab_${currentUser.tenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return [];
  });

  return (
    <div className="space-y-6">
      {/* UNIFIED DROPDOWN RENTANG WAKTU HEADER (KONSISTEN DI ATAS DASHBOARD) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600">Unified Time-Range Controller</span>
          <h3 className="text-xl font-black text-slate-900">Dashboard Akses: <span className="uppercase text-indigo-900">{currentUser.role.replace('_', ' ')}</span></h3>
        </div>

        <DropdownRentangWaktu value={rentangWaktu} onChange={setRentangWaktu} />
      </div>

      {/* 3 LEVEL ROLE OVERVIEW MATRIX HEADER */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-700/50 pb-4">
          <div>
            <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">Sistem Keamanan & Hak Akses CeritaAnanda</span>
            <h2 className="text-3xl font-black flex items-center gap-2">
              <span>👥</span> Panel Manajemen 3 Level Role & Akses
            </h2>
            <p className="text-purple-200 text-xs mt-1">Pilih peran akun di bawah ini untuk mensimulasikan dan menguji tingkat hak akses internal sekolah.</p>
          </div>

          <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20 flex items-center gap-3">
            <span className="text-3xl">{currentUser.avatarEmoji || '👤'}</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300">Role Aktif Saat Ini:</span>
              <div className="font-black text-sm text-white capitalize">{currentUser.role.replace('_', ' ')}</div>
            </div>
          </div>
        </div>

        {/* 3 CARDS MATRIX DISKRIPSI HAK AKSES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* ROLE 1: GURU */}
          <div
            onClick={() => {
              const u = MOCK_USERS_LIST.find((x) => x.role === 'guru')!;
              soundFx.playSuccess();
              onSwitchUserRole(u);
            }}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              currentUser.role === 'guru' ? 'bg-emerald-500 text-white border-white scale-102 shadow-lg ring-4 ring-emerald-300' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-3xl">👩‍🏫</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20">Role 1</span>
            </div>
            <h4 className="font-black text-base">GURU PAUD</h4>
            <ul className="text-xs space-y-1 mt-2 opacity-90 list-disc list-inside">
              <li>Hanya murid di kelasnya</li>
              <li>Input asesmen & observasi</li>
              <li>Tolak akses kelas guru lain</li>
            </ul>
          </div>

          {/* ROLE 2: KEPALA SEKOLAH */}
          <div
            onClick={() => {
              const u = MOCK_USERS_LIST.find((x) => x.role === 'kepala_sekolah')!;
              soundFx.playSuccess();
              onSwitchUserRole(u);
            }}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              currentUser.role === 'kepala_sekolah' ? 'bg-indigo-500 text-white border-white scale-102 shadow-lg ring-4 ring-indigo-300' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-3xl">🎓</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20">Role 2</span>
            </div>
            <h4 className="font-black text-base">KEPALA SEKOLAH</h4>
            <ul className="text-xs space-y-1 mt-2 opacity-90 list-disc list-inside">
              <li>Lihat semua kelas sekolah</li>
              <li>Weekly Report & Traffic Light</li>
              <li>Drill-down ke observasi harian</li>
            </ul>
          </div>

          {/* ROLE 3: YAYASAN */}
          <div
            onClick={() => {
              const u = MOCK_USERS_LIST.find((x) => x.role === 'yayasan')!;
              soundFx.playSuccess();
              onSwitchUserRole(u);
            }}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              currentUser.role === 'yayasan' ? 'bg-purple-600 text-white border-white scale-102 shadow-lg ring-4 ring-purple-300' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-3xl">🏛️</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20">Role 3</span>
            </div>
            <h4 className="font-black text-base">PENGURUS YAYASAN</h4>
            <ul className="text-xs space-y-1 mt-2 opacity-90 list-disc list-inside">
              <li>Lihat semua unit sekolah</li>
              <li>Komparasi antar-sekolah</li>
              <li>Kelola Tenant Sekolah</li>
            </ul>
          </div>
        </div>
      </div>

      {/* DASHBOARD KEPALA SEKOLAH (KUANTITATIF & AUTOMATED WEEKLY REPORT) */}
      {currentUser.role === 'kepala_sekolah' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
            <div>
              <span className="text-xs font-black text-indigo-600 uppercase">Dashboard Eksekutif Kepala Sekolah</span>
              <h4 className="text-2xl font-black text-slate-900 mt-1">
                Laporan Kuantitatif & Monitoring Kelas ({rentangWaktu.toUpperCase()})
              </h4>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTabManage('overview')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${activeTabManage === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                📊 Ringkasan Kelas & Weekly Report
              </button>
              <button
                onClick={() => setActiveTabManage('reminder')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${activeTabManage === 'reminder' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                🚥 Traffic Light Input Guru
              </button>
            </div>
          </div>

          {activeTabManage === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_KELAS_LIST.map((k) => {
                  const weeklyRep = calculateWeeklyReport(
                    currentUser.tenantId,
                    k.id,
                    1, // minggu 1
                    1, // bulan 1
                    daftarMurid,
                    obsList,
                    adabList
                  );
                  const completionBadge = getCompletionColorBadge(weeklyRep.hariTerisiCount || 0);

                  return (
                    <div key={k.id} className="bg-indigo-50/70 p-6 rounded-3xl border-2 border-indigo-100 space-y-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-black text-indigo-950 text-lg">{k.namaKelas}</h5>
                          <span className="text-xs font-bold text-indigo-700">Pengampu: {k.guruNama}</span>
                        </div>

                        {/* STATUS KELENGKAPAN INPUT (GREEN/YELLOW/RED) */}
                        <span className={`px-3 py-1 rounded-full font-black text-xs ${completionBadge.color}`}>
                          {completionBadge.status}
                        </span>
                      </div>

                      {/* STATISTIK WEEKLY REPORT KUANTITATIF */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-100">
                          <span className="text-slate-500 font-semibold">Kelengkapan</span>
                          <div className="font-black text-indigo-900 text-lg mt-0.5">{weeklyRep.hariTerisiCount}/5 Hari</div>
                        </div>
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-100">
                          <span className="text-slate-500 font-semibold">Cakupan Murid</span>
                          <div className="font-black text-emerald-600 text-lg mt-0.5">
                            {weeklyRep.muridTerobservasiCount}/{weeklyRep.totalMuridCount} Anak
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-100">
                          <span className="text-slate-500 font-semibold">Ketercapaian</span>
                          <div className="font-black text-amber-600 text-lg mt-0.5">88% Mandiri</div>
                        </div>
                      </div>

                      {/* TOMBOL DRILL DOWN */}
                      <button
                        onClick={() => setDrillDownClass(k)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        🔍 Drill-Down Detail Weekly Report Kelas
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTabManage === 'reminder' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h5 className="font-black text-slate-900 text-sm">Status Input Asesmen Guru 7 Hari Terakhir:</h5>
              {MOCK_USERS_LIST.filter((u) => u.role === 'guru').map((g) => (
                <div key={g.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{g.nama}</span>
                    <p className="text-slate-500">Terakhir Input: {g.lastInputDate || 'Hari ini'}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-full font-black text-xs">
                    🟢 Lengkap (Aktif)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD GURU & YAYASAN ROLE DISPLAY */}
      {currentUser.role === 'guru' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-xs font-bold text-slate-700">
          👩‍🏫 Login sebagai Guru. Gunakan Dashboard Guru di atas untuk melihat detail harian sesuai rentang waktu <strong>{rentangWaktu.toUpperCase()}</strong>.
        </div>
      )}

      {currentUser.role === 'yayasan' && (
        <div className="bg-purple-900 text-white p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xl font-black">Dashboard Pengurus Yayasan ({rentangWaktu.toUpperCase()})</h4>
              <span className="text-xs text-purple-200">Pengawasan Multi-Tenant & Manajemen Sistem</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Apakah Anda yakin ingin meriset seluruh penyimpanan data lokal ke kondisi rilis awal?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-transform active:scale-95"
              >
                🔄 Reset ke Data Awal
              </button>
              <span className="text-xs bg-purple-800 px-3 py-1 rounded-full text-purple-200 font-bold">
                Total {daftarTenant.length} Unit Sekolah
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {daftarTenant.map((t) => (
              <div key={t.id} className="bg-white text-slate-900 p-4 rounded-2xl space-y-2">
                <h5 className="font-black text-sm">{t.namaSekolah}</h5>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">{t.kodeYayasan}</span>
                <p className="text-xs text-emerald-600 font-bold mt-2">Capaian Agregat: 89% (Sangat Baik)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DRILL DOWN KEPALA SEKOLAH */}
      {drillDownClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-2xl w-full space-y-4 border-4 border-indigo-200 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase">Drill-Down Weekly Report</span>
                <h4 className="text-xl font-black text-slate-900">{drillDownClass.namaKelas}</h4>
              </div>
              <button
                onClick={() => setDrillDownClass(null)}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow"
              >
                ❌ Tutup
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="font-bold text-indigo-900">Rangkuman Minggu #1 (Bulan #1):</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 mt-1">
                  <li>Kelengkapan Hari Aktif: 5/5 Hari Terisi Lengkap</li>
                  <li>Cakupan Murid Terobservasi: {daftarMurid.length} dari {daftarMurid.length} Murid</li>
                  <li>Ketercapaian Benang Adab Minggu Ini: 90% Muncul Sendiri</li>
                </ul>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-900">Daftar Murid Kelas:</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {daftarMurid.map((m) => (
                    <div key={m.id} className="p-2 bg-white rounded-lg border text-[11px] font-bold flex justify-between">
                      <span>{m.fotoEmoji} {m.nama}</span>
                      <span className="text-emerald-600">🟢 Terobservasi</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
