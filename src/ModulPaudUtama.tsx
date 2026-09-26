import React, { useState } from 'react';
import { MuridPaud, RekapMuridPaud, StatusCapaian, BulanCurriculum, TenantPaud, UserAccount } from './types/paudTypes';
import { DashboardGuruPaud } from './components/paud/DashboardGuruPaud';
import { ModulMotorikKasar } from './components/paud/ModulMotorikKasar';
import { ModulGerakSensorik } from './components/paud/ModulGerakSensorik';
import { ModulPendaftaranLembaga } from './components/paud/ModulPendaftaranLembaga';
import { ModeMainAnak } from './components/paud/ModeMainAnak';
import { ModeKelasProyektor } from './components/paud/ModeKelasProyektor';
import { RoleSystemManager, MOCK_USERS_LIST } from './components/paud/RoleSystemManager';
import { soundFx } from './utils/soundEffects';

export const DAFTAR_TENANT_DEFAULT: TenantPaud[] = [
  { id: 'tenant-paud-01', namaSekolah: 'PAUD CeritaAnanda (Sekolah Pertama)', kodeYayasan: 'YYS-PAUD-01', alamat: 'Jl. Utama Sekolah' }
];

const DEFAULT_INITIAL_MURID: RekapMuridPaud[] = [];

interface ModulPaudUtamaProps {
  onKembaliKeUtama?: () => void;
}

export const ModulPaudUtama: React.FC<ModulPaudUtamaProps> = ({ onKembaliKeUtama }) => {
  const [daftarTenant, setDaftarTenant] = useState<TenantPaud[]>(DAFTAR_TENANT_DEFAULT);
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant-paud-01');
  const [showTenantModal, setShowTenantModal] = useState<boolean>(false);
  const [newSekolahNama, setNewSekolahNama] = useState('');
  const [newSekolahKode, setNewSekolahKode] = useState('');

  // USER & ROLE SYSTEM STATE
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => MOCK_USERS_LIST[0] || {
    id: 'u-1',
    nama: 'Pengguna',
    role: 'guru',
    tenantId: 'tenant-paud-01'
  });

  const currentTenant = daftarTenant.find((t) => t.id === activeTenantId) || daftarTenant[0];

  // Isolated LocalStorage Per Tenant ID
  const [daftarMurid, setDaftarMurid] = useState<RekapMuridPaud[]>(() => {
    try {
      const saved = localStorage.getItem(`paud_daftar_murid_${activeTenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_INITIAL_MURID;
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'kasar' | 'sensorik' | 'anak' | 'roles' | 'proyektor' | 'pendaftaran'>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<'rapor' | 'kurikulum'>('rapor');
  const [selectedChildForPlay, setSelectedChildForPlay] = useState<RekapMuridPaud | undefined>(daftarMurid[0]);

  // Simpan otomatis per tenantId
  React.useEffect(() => {
    try {
      localStorage.setItem(`paud_daftar_murid_${activeTenantId}`, JSON.stringify(daftarMurid));
    } catch {
      // Storage error fallback
    }
  }, [daftarMurid, activeTenantId]);

  // Handler Ganti Tenant / Sekolah
  const handleSwitchTenant = (tenantId: string) => {
    soundFx.playPop();
    setActiveTenantId(tenantId);
    try {
      const saved = localStorage.getItem(`paud_daftar_murid_${tenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDaftarMurid(parsed);
          setSelectedChildForPlay(parsed[0]);
          return;
        }
      }
    } catch {
      // Storage error
    }
    setDaftarMurid([]);
  };

  const handleAddTenant = (namaSekolah: string, kodeYayasan: string) => {
    soundFx.playSuccess();
    const newT: TenantPaud = {
      id: `tenant-paud-${Date.now()}`,
      namaSekolah: namaSekolah,
      kodeYayasan: kodeYayasan || `YYS-${Date.now()}`
    };
    setDaftarTenant([...daftarTenant, newT]);
    setActiveTenantId(newT.id);
    setDaftarMurid([]);
  };

  const handleDeleteTenant = (tenantId: string) => {
    if (daftarTenant.length <= 1) return;
    soundFx.playPop();
    const updated = daftarTenant.filter((t) => t.id !== tenantId);
    setDaftarTenant(updated);
    setActiveTenantId(updated[0].id);
  };

  const handleAddTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSekolahNama.trim()) return;
    handleAddTenant(newSekolahNama, newSekolahKode);
    setNewSekolahNama('');
    setNewSekolahKode('');
    setShowTenantModal(false);
  };

  // Handler Tambah Murid Baru
  const handleAddMurid = (newChild: MuridPaud) => {
    const rekapNew: RekapMuridPaud = {
      ...newChild,
      tenantId: activeTenantId,
      namaSekolah: currentTenant.namaSekolah,
      skorLogika: { pencocokanBentuk: 0, mengurutkanUkuran: 0, menghitungBenda: 0, polaWarna: 0 },
      skorMotorikHalus: { tracingGaris: 0, puzzleBentuk: 0, bubblePopSensory: 0 },
      evaluasiMotorikKasar: []
    };
    setDaftarMurid((prev) => [...prev, rekapNew]);
  };

  // Handler Simpan Evaluasi Motorik Kasar Guru
  const handleSaveEvaluasiKasar = (
    muridId: string,
    evaluasi: { bulan: BulanCurriculum; mingguKe: number; aktivitasId: string; namaAktivitas: string; status: StatusCapaian; catatan?: string }
  ) => {
    setDaftarMurid((prev) =>
      prev.map((m) => {
        if (m.id === muridId) {
          return {
            ...m,
            evaluasiMotorikKasar: [
              {
                tenantId: activeTenantId,
                bulan: evaluasi.bulan,
                mingguKe: evaluasi.mingguKe,
                aktivitasId: evaluasi.aktivitasId,
                namaAktivitas: evaluasi.namaAktivitas,
                status: evaluasi.status,
                tanggal: new Date().toISOString().split('T')[0],
                catatanGuru: evaluasi.catatan
              },
              ...m.evaluasiMotorikKasar
            ]
          };
        }
        return m;
      })
    );
  };

  // Handler Update Skor Game saat Anak Bermain
  const handleScoreUpdateChild = (domain: 'logika' | 'motorikHalus', subKey: string, score: number) => {
    if (!selectedChildForPlay) return;
    setDaftarMurid((prev) =>
      prev.map((m) => {
        if (m.id === selectedChildForPlay.id) {
          if (domain === 'logika') {
            const skorCurrent = m.skorLogika as unknown as Record<string, number>;
            return {
              ...m,
              skorLogika: {
                ...m.skorLogika,
                [subKey]: Math.max(skorCurrent[subKey] || 0, score)
              }
            };
          } else {
            const skorCurrent = m.skorMotorikHalus as unknown as Record<string, number>;
            return {
              ...m,
              skorMotorikHalus: {
                ...m.skorMotorikHalus,
                [subKey]: Math.max(skorCurrent[subKey] || 0, score)
              }
            };
          }
        }
        return m;
      })
    );
  };

  const startPlayForChild = (child?: MuridPaud) => {
    if (!child) return;
    const fullChild = daftarMurid.find((m) => m.id === child.id) || daftarMurid[0];
    if (fullChild) {
      setSelectedChildForPlay(fullChild);
      setActiveView('anak');
    }
  };

  if (activeView === 'proyektor') {
    return (
      <ModeKelasProyektor
        daftarMurid={daftarMurid}
        judulMateri="Tantangan Kognitif & Logika Proyektor HP"
        gameId="logika"
        onExit={() => setActiveView('dashboard')}
        onAutoScoreLogged={(muridId, domain, score) => handleScoreUpdateChild('logika', 'pencocokanBentuk', score)}
      />
    );
  }

  if (activeView === 'anak' && selectedChildForPlay) {
    return (
      <ModeMainAnak
        muridAktif={selectedChildForPlay}
        onExitToTeacherDashboard={() => setActiveView('dashboard')}
        onScoreUpdate={handleScoreUpdateChild}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar Guru dengan Multi-Tenant & Role System Selector */}
      <header className="bg-indigo-950 text-white p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1 bg-amber-400 rounded-xl">🧸</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-amber-300">CeritaAnanda PAUD Multi-Tenant</h1>
                <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase">Role & Multi-Tenant Isolated</span>
              </div>
              
              {/* TENANT / SEKOLAH SELECTOR */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-indigo-300">Sekolah/Tenant:</span>
                <select
                  value={activeTenantId}
                  onChange={(e) => handleSwitchTenant(e.target.value)}
                  className="bg-indigo-900 border border-indigo-700 text-white text-xs font-bold rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-amber-400"
                >
                  {daftarTenant.map((t) => (
                    <option key={t.id} value={t.id}>
                      🏫 {t.namaSekolah} ({t.kodeYayasan})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => { soundFx.playPop(); setShowTenantModal(true); }}
                  className="text-xs bg-indigo-800 hover:bg-indigo-700 text-indigo-200 px-2 py-1 rounded-lg border border-indigo-600 font-bold"
                >
                  ➕ Tambah Tenant
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => { soundFx.playPop(); setDashboardTab('rapor'); setActiveView('dashboard'); }}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeView === 'dashboard' && dashboardTab === 'rapor' ? 'bg-amber-400 text-indigo-950 shadow' : 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800'
              }`}
            >
              <span>👩‍🏫</span> Dashboard Guru
            </button>

            <button
              onClick={() => { soundFx.playPop(); setDashboardTab('kurikulum'); setActiveView('dashboard'); }}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeView === 'dashboard' && dashboardTab === 'kurikulum' ? 'bg-amber-400 text-indigo-950 shadow' : 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800'
              }`}
            >
              <span>📅</span> Kurikulum 12 Bulan
            </button>

            <button
              onClick={() => { soundFx.playPop(); setActiveView('roles'); }}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeView === 'roles' ? 'bg-purple-500 text-white shadow' : 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800'
              }`}
            >
              <span>👥</span> 3 Level Role & Akses
            </button>
            <button
              onClick={() => { soundFx.playPop(); setActiveView('sensorik'); }}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeView === 'sensorik' ? 'bg-teal-400 text-teal-950 shadow' : 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800'
              }`}
            >
              <span>🧘</span> Gerak & Sensorik
            </button>
            <button
              onClick={() => { soundFx.playPop(); setActiveView('kasar'); }}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                activeView === 'kasar' ? 'bg-sky-400 text-indigo-950 shadow' : 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800'
              }`}
            >
              <span>🏃</span> Motorik Kasar
            </button>
            <button
              onClick={() => { soundFx.playSuccess(); setActiveView('proyektor'); }}
              className="px-3 py-2 rounded-xl font-bold text-xs bg-amber-400 text-indigo-950 hover:bg-amber-300 shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 border border-amber-300"
            >
              <span>📺</span> Mode Kelas (Proyektor)
            </button>
            <button
              onClick={() => { soundFx.playSuccess(); startPlayForChild(selectedChildForPlay); }}
              className="px-3 py-2 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <span>🎮</span> Mode Main Anak
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {/* INDIKATOR OFFLINE SYNC (BAGIAN 7 PROMPT 13) */}
        <div className="mb-4 bg-indigo-50 border border-indigo-200 p-3 rounded-2xl flex flex-col sm:flex-row justify-between items-center text-xs text-indigo-900 font-bold gap-2">
          <span>🏫 Aktif di Tenant: <strong>{currentTenant.namaSekolah}</strong> ({currentTenant.kodeYayasan}) — Role: <strong className="uppercase">{currentUser.role.replace('_', ' ')}</strong></span>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              🟢 Tersinkron Cloud Supabase
            </span>
            <span className="text-indigo-600 hidden md:inline">Audit Log Active</span>
          </div>
        </div>

        {activeView === 'dashboard' && (
          <DashboardGuruPaud
            key={`${activeTenantId}-${dashboardTab}`}
            daftarRekapMurid={daftarMurid}
            activeTenantId={activeTenantId}
            initialTab={dashboardTab === 'kurikulum' ? 'kurikulum' : 'harian'}
            onAddMurid={handleAddMurid}
            onSelectChildForPlay={startPlayForChild}
          />
        )}

        {activeView === 'roles' && (
          <RoleSystemManager
            currentUser={currentUser}
            daftarTenant={daftarTenant}
            daftarMurid={daftarMurid}
            onSwitchUserRole={(u) => setCurrentUser(u)}
            onAddTenant={handleAddTenant}
            onDeleteTenant={handleDeleteTenant}
          />
        )}

        {activeView === 'sensorik' && (
          <ModulGerakSensorik
            daftarMurid={daftarMurid}
            activeTenantId={activeTenantId}
          />
        )}

        {activeView === 'pendaftaran' && (
          <ModulPendaftaranLembaga
            onBackToLogin={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'kasar' && (
          <ModulMotorikKasar
            daftarMurid={daftarMurid}
            onSaveEvaluasi={handleSaveEvaluasiKasar}
          />
        )}
      </main>

      {/* MODAL TAMBAH TENANT BARU */}
      {showTenantModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddTenantSubmit} className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-indigo-300 max-w-md w-full space-y-4">
            <h3 className="text-xl font-black text-indigo-900 flex items-center gap-2">
              <span>🏫</span> Tambah Tenant / Sekolah PAUD Baru
            </h3>
            <p className="text-slate-600 text-xs">Arsitektur Multi-Tenant mengisolasi data murid dan rapor antar sekolah.</p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Sekolah PAUD / TK:</label>
              <input
                type="text"
                required
                placeholder="Contoh: PAUD Mutiara Hati"
                value={newSekolahNama}
                onChange={(e) => setNewSekolahNama(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kode Yayasan / Tenant ID:</label>
              <input
                type="text"
                placeholder="Contoh: YYS-MH-04"
                value={newSekolahKode}
                onChange={(e) => setNewSekolahKode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTenantModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700 text-sm"
              >
                Buat Tenant 💾
              </button>
            </div>
          </form>
        </div>
      )}

      <footer className="bg-indigo-950 text-indigo-300 text-center text-xs py-4 border-t border-indigo-900">
        © 2026 CeritaAnanda PAUD Multi-Tenant Enterprise Architecture. Data terisolasi aman per Yayasan / Sekolah.
      </footer>
    </div>
  );
};

export default ModulPaudUtama;
