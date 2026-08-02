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
import { soundFx } from '../../utils/soundEffects';
import { DropdownRentangWaktu } from './DropdownRentangWaktu';
import { calculateWeeklyReport, getCompletionColorBadge, hitungUsiaDetail, formatPercentageHonest } from '../../utils/reportAggregator';
import { dataService } from '../../services/dataService';

// RECHARTS FOR YAYASAN DASHBOARD
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

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

export const RoleSystemManager: React.FC<RoleSystemManagerProps> = ({
  currentUser,
  daftarTenant,
  daftarMurid,
  onSwitchUserRole,
  onAddTenant,
  onDeleteTenant
}) => {
  const [rentangWaktu, setRentangWaktu] = useState<RentangWaktu>('harian');
  const [activeTabManage, setActiveTabManage] = useState<'overview' | 'daftar_murid' | 'manajemen_kelas' | 'pegawai' | 'reminder'>('overview');

  // MODE PERANGKAP: KETUA YAYASAN MERANGKAP KEPALA SEKOLAH
  const [isMerangkapKepsek, setIsMerangkapKepsek] = useState<boolean>(true);

  // MANAJEMEN PEGAWAI & GURU OLEH YAYASAN
  const [daftarPegawai, setDaftarPegawai] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(`paud_daftar_pegawai_${currentUser.tenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return MOCK_USERS_LIST.filter((u) => u.tenantId === currentUser.tenantId);
  });

  // State Form Tambah Pegawai oleh Yayasan
  const [namaPegawaiBaru, setNamaPegawaiBaru] = useState('');
  const [emailPegawaiBaru, setEmailPegawaiBaru] = useState('');
  const [rolePegawaiBaru, setRolePegawaiBaru] = useState<'guru' | 'kepala_sekolah'>('guru');
  const [classIdPegawaiBaru, setClassIdPegawaiBaru] = useState('kelas-a');

  // MANAJEMEN KELAS
  const [daftarKelas, setDaftarKelas] = useState<KelasPaud[]>(() => {
    try {
      const saved = localStorage.getItem(`paud_daftar_kelas_${currentUser.tenantId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return [
      { id: 'kelas-a', schoolId: currentUser.tenantId, namaKelas: 'Kelompok Bermain Mawar (2-3th)', kategoriUsia: '2_tahun', guruNama: 'Ustadzah Fatimah, S.Pd' },
      { id: 'kelas-b', schoolId: currentUser.tenantId, namaKelas: 'TK A Melati (4th)', kategoriUsia: '4_tahun', guruNama: 'Ustadzah Mariam, S.Pd' },
      { id: 'kelas-c', schoolId: currentUser.tenantId, namaKelas: 'TK B Anggrek (5th)', kategoriUsia: '5_tahun', guruNama: 'Ustadzah Mariam, S.Pd' }
    ];
  });

  // Form Tambah Kelas
  const [namaKelasBaru, setNamaKelasBaru] = useState('');
  const [kategoriUsiaBaru, setKategoriUsiaBaru] = useState<'2_tahun' | '3_tahun' | '4_tahun' | '5_tahun'>('4_tahun');
  const [guruPengampuBaru, setGuruPengampuBaru] = useState('Ustadzah Fatimah, S.Pd');

  // Search & Edit States
  const [searchQuery, setSearchQuery] = useState('');
  const [drillDownClass, setDrillDownClass] = useState<KelasPaud | null>(null);
  const [editingMuridId, setEditingMuridId] = useState<string | null>(null);
  const [editBirthdateInput, setEditBirthdateInput] = useState('');

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

  // Handler Tambah Pegawai oleh Yayasan
  const handleAddPegawaiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPegawaiBaru.trim() || !emailPegawaiBaru.trim()) return;
    soundFx.playSuccess();
    const newPegawai: UserAccount = {
      id: `u-peg-${Date.now()}`,
      nama: namaPegawaiBaru.trim(),
      email: emailPegawaiBaru.trim(),
      role: rolePegawaiBaru,
      tenantId: currentUser.tenantId,
      classId: classIdPegawaiBaru,
      avatarEmoji: rolePegawaiBaru === 'kepala_sekolah' ? '🎓' : '👩‍🏫',
      lastInputDate: new Date().toISOString().split('T')[0]
    };
    const updated = [...daftarPegawai, newPegawai];
    setDaftarPegawai(updated);
    try {
      localStorage.setItem(`paud_daftar_pegawai_${currentUser.tenantId}`, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }

    dataService.catatAuditLog(currentUser.tenantId, currentUser.id, 'tambah', 'pengguna', newPegawai.id, {
      nama: newPegawai.nama,
      role: newPegawai.role
    });

    setNamaPegawaiBaru('');
    setEmailPegawaiBaru('');
  };

  // Handler Tambah Kelas
  const handleAddKelasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelasBaru.trim()) return;
    soundFx.playSuccess();
    const newK: KelasPaud = {
      id: `kelas-${Date.now()}`,
      schoolId: currentUser.tenantId,
      namaKelas: namaKelasBaru.trim(),
      kategoriUsia: kategoriUsiaBaru,
      guruNama: guruPengampuBaru
    };
    const updated = [...daftarKelas, newK];
    setDaftarKelas(updated);
    try {
      localStorage.setItem(`paud_daftar_kelas_${currentUser.tenantId}`, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
    setNamaKelasBaru('');
  };

  const handleDeleteKelas = (kelasId: string) => {
    const activeStudentsInClass = daftarMurid.filter((m) => m.classId === kelasId);
    if (activeStudentsInClass.length > 0) {
      soundFx.playTryAgain();
      alert(`Tidak bisa menghapus kelas. Terdapat ${activeStudentsInClass.length} murid aktif di kelas ini. Pindahkan murid ke kelas lain terlebih dahulu.`);
      return;
    }

    soundFx.playPop();
    const updated = daftarKelas.filter((k) => k.id !== kelasId);
    setDaftarKelas(updated);
    try {
      localStorage.setItem(`paud_daftar_kelas_${currentUser.tenantId}`, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
  };

  const filteredMuridKepsek = daftarMurid.filter((m) =>
    m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.panggilan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMuridCount = daftarMurid.length;
  const muridObservedCount = daftarMurid.filter((m) => obsList.some((o) => o.muridId === m.id)).length;
  const honestObservedKepsek = formatPercentageHonest(muridObservedCount, totalMuridCount);

  // DATA MOCK RECHARTS
  const dataTrenBulanan = [
    { bulan: 'Bln 1', capaian: 65 },
    { bulan: 'Bln 2', capaian: 72 },
    { bulan: 'Bln 3', capaian: 78 },
    { bulan: 'Bln 4', capaian: 84 },
    { bulan: 'Bln 5', capaian: 89 }
  ];

  const dataPerbandinganUnit = daftarTenant.map((t) => {
    const muridUnit = daftarMurid.filter((m) => m.tenantId === t.id);
    const obsUnitCount = muridUnit.filter((m) => obsList.some((o) => o.muridId === m.id)).length;
    const pct = muridUnit.length > 0 ? Math.round((obsUnitCount / muridUnit.length) * 100) : 75;
    return {
      namaSekolah: t.namaSekolah,
      jumlahMurid: muridUnit.length || 20,
      capaianPct: pct
    };
  });

  const dataAspekPerkembangan = [
    { aspek: 'Logika & Numerasi', capaian: 88 },
    { aspek: 'Motorik Halus', capaian: 82 },
    { aspek: 'Gerak & Sensorik', capaian: 90 },
    { aspek: 'Sosial & Bahasa', capaian: 85 },
    { aspek: 'Agama & Akhlak', capaian: 92 }
  ];

  const isKepsekOrMerangkap = currentUser.role === 'kepala_sekolah' || (currentUser.role === 'yayasan' && isMerangkapKepsek);

  return (
    <div className="space-y-6">
      {/* UNIFIED CONTROLLER HEADER */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600">Unified Controller</span>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Peran Aktif:</span>
            <span className="uppercase text-indigo-900 bg-indigo-100 px-3 py-1 rounded-xl">
              {currentUser.role.replace('_', ' ')}
            </span>
          </h3>
        </div>

        <DropdownRentangWaktu value={rentangWaktu} onChange={setRentangWaktu} />
      </div>

      {/* DASHBOARD YAYASAN WITH RECHARTS & MANAJEMEN PEGAWAI */}
      {currentUser.role === 'yayasan' && (
        <div className="bg-purple-950 text-white p-6 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-800 pb-4">
            <div>
              <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">Dashboard Pengawas Eksekutif Yayasan</span>
              <h4 className="text-2xl font-black mt-1">Monitoring & Manajemen Pegawai Lembaga</h4>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* TOGGLE MODE PERANGKAP YAYASAN KEPSEK */}
              <button
                onClick={() => {
                  soundFx.playPop();
                  setIsMerangkapKepsek(!isMerangkapKepsek);
                }}
                className={`px-3.5 py-2 rounded-xl font-black text-xs shadow border transition-all flex items-center gap-1.5 ${
                  isMerangkapKepsek ? 'bg-amber-400 text-purple-950 border-amber-300' : 'bg-purple-900 text-purple-200 border-purple-700'
                }`}
              >
                <span>⚡</span> {isMerangkapKepsek ? 'Mode Perangkap Kepsek: AKTIF' : 'Mode Perangkap Kepsek: NONAKTIF'}
              </button>

              <button
                onClick={() => {
                  soundFx.playSuccess();
                  const dataToExport = {
                    sekolah: currentUser.tenantId,
                    tanggalEkspor: new Date().toISOString(),
                    totalMurid: daftarMurid.length,
                    daftarMurid: daftarMurid
                  };
                  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Backup_Data_Sekolah_${currentUser.tenantId}_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center gap-1"
              >
                <span>📥</span> Unduh Data (Backup)
              </button>
            </div>
          </div>

          {/* TAB NAVIGASI YAYASAN */}
          <div className="flex gap-2 border-b border-purple-800 pb-3">
            <button
              onClick={() => setActiveTabManage('overview')}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs ${activeTabManage === 'overview' ? 'bg-amber-400 text-purple-950' : 'bg-purple-900 text-purple-200'}`}
            >
              📊 Grafik Analisis Yayasan
            </button>
            <button
              onClick={() => setActiveTabManage('pegawai')}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs ${activeTabManage === 'pegawai' ? 'bg-amber-400 text-purple-950' : 'bg-purple-900 text-purple-200'}`}
            >
              👩‍🏫 Input & Manajemen Pegawai ({daftarPegawai.length})
            </button>
          </div>

          {activeTabManage === 'pegawai' && (
            <div className="bg-white text-slate-900 p-6 rounded-3xl space-y-6">
              <form onSubmit={handleAddPegawaiSubmit} className="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl space-y-3">
                <h5 className="font-black text-purple-950 text-sm">👩‍🏫 Tambah Data Pegawai / Guru Baru (Input oleh Yayasan)</h5>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Pegawai:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ustadzah Salma, S.Pd"
                      value={namaPegawaiBaru}
                      onChange={(e) => setNamaPegawaiBaru(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Pegawai:</label>
                    <input
                      type="email"
                      required
                      placeholder="salma@paud.sch.id"
                      value={emailPegawaiBaru}
                      onChange={(e) => setEmailPegawaiBaru(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jabatan / Peran:</label>
                    <select
                      value={rolePegawaiBaru}
                      onChange={(e) => setRolePegawaiBaru(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
                    >
                      <option value="guru">Guru Kelas</option>
                      <option value="kepala_sekolah">Kepala Sekolah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pilih Rombel/Kelas:</label>
                    <select
                      value={classIdPegawaiBaru}
                      onChange={(e) => setClassIdPegawaiBaru(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
                    >
                      {daftarKelas.map((k) => (
                        <option key={k.id} value={k.id}>{k.namaKelas}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow"
                >
                  ➕ Simpan Pegawai Baru
                </button>
              </form>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-purple-900 text-white uppercase text-[10px] font-black tracking-wider">
                      <th className="p-3">Nama Pegawai</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Jabatan</th>
                      <th className="p-3">Rombel Kelas</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                    {daftarPegawai.map((p) => {
                      const k = daftarKelas.find((kls) => kls.id === p.classId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 flex items-center gap-2 font-black">
                            <span className="text-xl">{p.avatarEmoji || '👩‍🏫'}</span>
                            <span>{p.nama}</span>
                          </td>
                          <td className="p-3 text-slate-600">{p.email}</td>
                          <td className="p-3 capitalize font-bold text-purple-900">{p.role.replace('_', ' ')}</td>
                          <td className="p-3 font-bold">{k?.namaKelas || '-'}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-[10px]">
                              🟢 Aktif
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTabManage === 'overview' && (
            <div className="space-y-6">
              {/* 4 KARTU RINGKASAN DI ATAS GRAFIK */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white/10 p-4 rounded-2xl border border-purple-700/50">
                  <span className="text-xs text-purple-200 font-bold uppercase">Jumlah Unit Sekolah</span>
                  <div className="text-3xl font-black text-amber-300 mt-1">{daftarTenant.length} Unit</div>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-purple-700/50">
                  <span className="text-xs text-purple-200 font-bold uppercase">Jumlah Murid Seluruh Yayasan</span>
                  <div className="text-3xl font-black text-amber-300 mt-1">{totalMuridCount} Murid</div>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-purple-700/50">
                  <span className="text-xs text-purple-200 font-bold uppercase">Jumlah Guru & Pegawai</span>
                  <div className="text-3xl font-black text-amber-300 mt-1">{daftarPegawai.length} Orang</div>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-purple-700/50">
                  <span className="text-xs text-purple-200 font-bold uppercase">Murid Diamati Bulan Ini</span>
                  <div className="text-lg font-black text-emerald-300 mt-1">
                    {honestObservedKepsek.hasData ? honestObservedKepsek.displayText : 'Belum ada data'}
                  </div>
                </div>
              </div>

              {/* GRAFIK 1: GRAFIK TREN BULANAN */}
              <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-xl space-y-4">
                <h5 className="font-black text-lg text-slate-900">📈 Grafik Tren Bulanan Capaian Perkembangan</h5>
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataTrenBulanan}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bulan" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="capaian" name="Capaian Agregat (%)" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GRAFIK 2 & 3 GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-xl space-y-4">
                  <h5 className="font-black text-lg text-slate-900">🏫 Perbandingan Capaian Antar Unit Sekolah</h5>
                  <div className="h-60 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataPerbandinganUnit}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="namaSekolah" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="capaianPct" name="Capaian (%)" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-xl space-y-4">
                  <h5 className="font-black text-lg text-slate-900">🧩 Capaian Per Aspek Perkembangan (STTPA)</h5>
                  <div className="h-60 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataAspekPerkembangan} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="aspek" type="category" width={110} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="capaian" name="Ketercapaian (%)" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD KEPALA SEKOLAH & MODE PERANGKAP YAYASAN */}
      {isKepsekOrMerangkap && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
            <div>
              <span className="text-xs font-black text-indigo-600 uppercase">Dashboard Eksekutif Kepala Sekolah</span>
              <h4 className="text-2xl font-black text-slate-900 mt-1">
                Laporan Kuantitatif & Monitoring Kelas ({rentangWaktu.toUpperCase()})
              </h4>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTabManage('overview')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${activeTabManage === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                📊 Ringkasan Kelas
              </button>
              <button
                onClick={() => setActiveTabManage('daftar_murid')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${activeTabManage === 'daftar_murid' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                👶 Daftar Murid ({totalMuridCount})
              </button>
              <button
                onClick={() => setActiveTabManage('manajemen_kelas')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${activeTabManage === 'manajemen_kelas' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                🏫 Manajemen Rombel Kelas ({daftarKelas.length})
              </button>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <div>
              <span className="font-extrabold text-indigo-900 text-sm">📈 Status Observasi Minggu Ini:</span>
              <p className="font-bold text-slate-700 mt-0.5">
                {honestObservedKepsek.hasData ? (
                  <span>
                    <strong>{honestObservedKepsek.observedCount} dari {honestObservedKepsek.totalCount} murid</strong> sudah diamati minggu ini ({honestObservedKepsek.displayText})
                  </span>
                ) : (
                  <span className="text-rose-600">Belum ada data observasi minggu ini.</span>
                )}
              </p>
            </div>

            {honestObservedKepsek.isPartial && (
              <span className="px-3 py-1.5 bg-amber-100 text-amber-900 font-extrabold rounded-xl border border-amber-300">
                ⚠️ Data belum lengkap, baru sebagian murid yang diamati
              </span>
            )}
          </div>

          {activeTabManage === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-6 rounded-3xl shadow-lg space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black uppercase bg-white/20 px-3 py-1 rounded-full text-white">
                      📊 Capaian Perkembangan Anak
                    </span>
                    <h5 className="text-xl font-black mt-1">Gerak & Sensorik ({rentangWaktu.toUpperCase()})</h5>
                  </div>
                  <span className="text-4xl bg-white/10 p-3 rounded-2xl">🧘</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center text-xs">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur">
                    <span className="font-bold">Vestibular</span>
                    <div className="text-xl font-black mt-1">88%</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur">
                    <span className="font-bold">Proprioseptif</span>
                    <div className="text-xl font-black mt-1">92%</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur">
                    <span className="font-bold">Taktil</span>
                    <div className="text-xl font-black mt-1">85%</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur">
                    <span className="font-bold">Visual-Motor</span>
                    <div className="text-xl font-black mt-1">90%</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur">
                    <span className="font-bold">Brain Gym</span>
                    <div className="text-xl font-black mt-1">95%</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {daftarKelas.map((k) => {
                  const weeklyRep = calculateWeeklyReport(
                    currentUser.tenantId,
                    k.id,
                    1,
                    1,
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
                          <span className="text-xs font-bold text-indigo-700">Pengampu: {k.guruNama || 'Guru Pembimbing'}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full font-black text-xs ${completionBadge.color}`}>
                          {completionBadge.status}
                        </span>
                      </div>

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
                          <div className="font-black text-amber-600 text-lg mt-0.5">
                            {weeklyRep.muridTerobservasiCount > 0 ? `${Math.round((weeklyRep.muridTerobservasiCount / (weeklyRep.totalMuridCount || 1)) * 100)}%` : 'Belum ada data'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setDrillDownClass(k)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        🔍 Drill-Down Detail Rombel Kelas
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB DAFTAR MURID LENGKAP KEPSEK (PENAMBAHAN BOLEH, HAPUS DILARANG) */}
          {activeTabManage === 'daftar_murid' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 p-4 rounded-2xl border">
                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="🔍 Cari nama murid..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div className="text-xs font-black text-slate-700">
                  Total {filteredMuridKepsek.length} Murid Terdaftar (Hak Tambah Murid Aktif)
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-indigo-900 text-white uppercase text-[10px] font-black tracking-wider">
                      <th className="p-3">Profil Murid</th>
                      <th className="p-3">Rombel Kelas</th>
                      <th className="p-3">Usia (Tahun & Bulan)</th>
                      <th className="p-3">Status Kelengkapan Data</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                    {filteredMuridKepsek.map((m) => {
                      const ageDetail = hitungUsiaDetail(m.tanggalLahir);
                      const assignedClass = daftarKelas.find((k) => k.id === m.classId);

                      return (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-3 flex items-center gap-2">
                            <span className="text-xl">{m.fotoEmoji}</span>
                            <div>
                              <div className="font-black text-slate-900">{m.nama}</div>
                              <span className="text-[10px] text-slate-500">Panggilan: {m.panggilan}</span>
                            </div>
                          </td>

                          <td className="p-3">
                            {assignedClass ? (
                              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 rounded-lg font-bold">
                                {assignedClass.namaKelas}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg font-bold border border-amber-300">
                                ⚠️ Belum ada kelas
                              </span>
                            )}
                          </td>

                          <td className="p-3 font-black">
                            {ageDetail ? (
                              <span className="text-emerald-700">{ageDetail.formatted}</span>
                            ) : (
                              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-bold">
                                ⚠️ Tanggal lahir belum diisi
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            {ageDetail && assignedClass ? (
                              <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-full font-black text-[10px]">
                                🟢 Lengkap
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-rose-500 text-white rounded-full font-black text-[10px]">
                                🔴 Data Belum Lengkap
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                setEditingMuridId(m.id);
                                setEditBirthdateInput(m.tanggalLahir || '');
                              }}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] shadow"
                            >
                              ✏️ Lengkapi Tanggal Lahir
                            </button>
                            {/* KEPALA SEKOLAH BISA MENAMBAH TAPI TIDAK BISA MENGHAPUS (NO DELETE BUTTON) */}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTabManage === 'manajemen_kelas' && (
            <div className="space-y-6">
              <form onSubmit={handleAddKelasSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h5 className="font-black text-slate-900 text-sm">➕ Tambah Rombongan Belajar (Kelas) Baru</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Kelas / Group:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: KB Mawar 1"
                      value={namaKelasBaru}
                      onChange={(e) => setNamaKelasBaru(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori Usia Target:</label>
                    <select
                      value={kategoriUsiaBaru}
                      onChange={(e) => setKategoriUsiaBaru(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
                    >
                      <option value="2_tahun">Usia 2 Tahun</option>
                      <option value="3_tahun">Usia 3 Tahun</option>
                      <option value="4_tahun">Usia 4 Tahun (TK A)</option>
                      <option value="5_tahun">Usia 5 Tahun (TK B)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Guru Pengampu:</label>
                    <input
                      type="text"
                      placeholder="Ustadzah Fatimah, S.Pd"
                      value={guruPengampuBaru}
                      onChange={(e) => setGuruPengampuBaru(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  Simpan Kelas Baru
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {daftarKelas.map((k) => {
                  const muridInK = daftarMurid.filter((m) => m.classId === k.id);
                  return (
                    <div key={k.id} className="p-4 bg-white rounded-2xl border-2 border-indigo-100 shadow-sm space-y-2">
                      <div className="flex justify-between items-start">
                        <h6 className="font-black text-indigo-950 text-sm">{k.namaKelas}</h6>
                        <button
                          onClick={() => handleDeleteKelas(k.id)}
                          className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                        >
                          ❌ Hapus
                        </button>
                      </div>
                      <p className="text-slate-600">Guru: {k.guruNama}</p>
                      <span className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-900 rounded-lg font-bold">
                        {muridInK.length} Murid Terdaftar
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL EDIT TANGGAL LAHIR */}
      {editingMuridId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 border-4 border-indigo-200 shadow-2xl">
            <h4 className="text-lg font-black text-slate-900">✏️ Lengkapi Tanggal Lahir Murid</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir (YYYY-MM-DD):</label>
              <input
                type="date"
                value={editBirthdateInput}
                onChange={(e) => setEditBirthdateInput(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingMuridId(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  soundFx.playSuccess();
                  const target = daftarMurid.find((m) => m.id === editingMuridId);
                  if (target) {
                    target.tanggalLahir = editBirthdateInput;
                  }
                  setEditingMuridId(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Simpan Tanggal Lahir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
