import React, { useState } from 'react';
import {
  UserAccount,
  UserRole,
  TenantPaud,
  KelasPaud,
  RekapMuridPaud,
  NotifikasiApp
} from '../../types/paudTypes';
import { generateRaporPDF } from '../../utils/pdfGenerator';
import { soundFx } from '../../utils/soundEffects';

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
    lastInputDate: '2026-07-20' // >7 hari -> Lampu Merah (Reminder Active!)
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
  },
  {
    id: 'u-wali-1',
    nama: 'Bunda Hafiz (Wali Murid)',
    email: 'bunda.hafiz@gmail.com',
    role: 'wali_murid',
    tenantId: 'tenant-paud-01',
    schoolId: 'sch-01',
    assignedMuridId: 'm-1',
    inviteToken: 'token-hafiz-99',
    avatarEmoji: '🏡'
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
  const [activeTabManage, setActiveTabManage] = useState<'overview' | 'users' | 'reminder' | 'invite'>('overview');

  // Form Tambah Tenant oleh Yayasan
  const [namaSekolahBaru, setNamaSekolahBaru] = useState('');
  const [kodeYayasanBaru, setKodeYayasanBaru] = useState('');

  // Form Undangan Wali Murid oleh Kepsek
  const [selectedMuridForInvite, setSelectedMuridForInvite] = useState<string>(daftarMurid[0]?.id || '');
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string>('');

  // Notifications State
  const [notifikasiList] = useState<NotifikasiApp[]>([
    {
      id: 'n-1',
      userId: 'u-guru-2',
      judul: '⚠️ Reminder Asesmen Mingguan',
      pesan: 'Ustadzah Mariam, Anda belum menginput asesmen dalam 7 hari terakhir. Silakan lengkapi asesmen Kelas B.',
      tanggal: '2026-07-31',
      dibaca: false,
      tipe: 'reminder'
    }
  ]);

  // Traffic Light Indicator untuk Kepsek
  const getTeacherTrafficLight = (lastDateStr?: string) => {
    if (!lastDateStr) return { status: '🔴 Belum Ada Input', color: 'bg-rose-500 text-white' };
    const lastDate = new Date(lastDateStr).getTime();
    const now = new Date('2026-07-31').getTime();
    const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return { status: '🟢 Lengkap (Aktif)', color: 'bg-emerald-500 text-white' };
    if (diffDays <= 7) return { status: '🟡 Sebagian (3-7 Hari)', color: 'bg-amber-500 text-white' };
    return { status: '🔴 Belum Input (>7 Hari)', color: 'bg-rose-500 text-white' };
  };

  const handleGenerateInvite = () => {
    soundFx.playSuccess();
    const targetM = daftarMurid.find((m) => m.id === selectedMuridForInvite);
    const token = `invite-${targetM?.panggilan.toLowerCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    const link = `${window.location.origin}/?token=${token}&muridId=${selectedMuridForInvite}`;
    setGeneratedInviteLink(link);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
      {/* Switcher Account Bar */}
      <div className="bg-indigo-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-1 bg-white/10 rounded-xl">{currentUser.avatarEmoji || '👤'}</span>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">Role Aktif: {currentUser.role.replace('_', ' ').toUpperCase()}</span>
            <h3 className="text-lg font-black">{currentUser.nama}</h3>
            <p className="text-xs text-indigo-200">{currentUser.email} • Tenant ID: {currentUser.tenantId}</p>
          </div>
        </div>

        {/* MOCK LOGIN SWITCHER */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-200">Ganti Role:</span>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const u = MOCK_USERS_LIST.find((x) => x.id === e.target.value);
              if (u) {
                soundFx.playPop();
                onSwitchUserRole(u);
              }
            }}
            className="bg-indigo-950 border border-indigo-700 text-amber-300 font-bold text-xs p-2 rounded-xl"
          >
            {MOCK_USERS_LIST.map((u) => (
              <option key={u.id} value={u.id}>
                {u.avatarEmoji} {u.nama} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ROLE 1: DASHBOARD GURU */}
      {currentUser.role === 'guru' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase">Akses Guru Kelas</span>
              <h4 className="text-xl font-black text-emerald-950">Ruang Kelas A (Anak Didik Saya)</h4>
              <p className="text-xs text-emerald-700">Menampilkan murid di kelas yang Anda ampu saja.</p>
            </div>
            <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full">
              Terakhir Input: {currentUser.lastInputDate || 'Hari ini'}
            </span>
          </div>

          {/* Notifikasi In-App Reminder Guru */}
          {notifikasiList.filter((n) => n.userId === currentUser.id).map((n) => (
            <div key={n.id} className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between animate-pulse">
              <div>
                <h5 className="font-black text-amber-950 text-sm">{n.judul}</h5>
                <p className="text-xs text-amber-800">{n.pesan}</p>
              </div>
              <span className="text-2xl">🔔</span>
            </div>
          ))}

          {/* List Murid Kelas Guru & Export PDF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daftarMurid.map((m) => (
              <div key={m.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-1 bg-white rounded-xl shadow-sm">{m.fotoEmoji}</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{m.nama}</h5>
                    <span className="text-xs text-slate-500">Usia {m.kategoriUsia.replace('_tahun', ' Tahun')}</span>
                  </div>
                </div>

                <button
                  onClick={() => generateRaporPDF(m, 'CeritaAnanda PAUD')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
                >
                  📄 Cetak PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROLE 2: DASHBOARD KEPALA SEKOLAH */}
      {currentUser.role === 'kepala_sekolah' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <span className="text-xs font-black text-indigo-600 uppercase">Dashboard Eksekutif Kepala Sekolah</span>
              <h4 className="text-2xl font-black text-slate-900">Monitoring Asesmen & Kelola Akun</h4>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTabManage('overview')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${activeTabManage === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
              >
                📊 Agregat Kelas
              </button>
              <button
                onClick={() => setActiveTabManage('reminder')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${activeTabManage === 'reminder' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
              >
                🚥 Traffic Light Guru
              </button>
              <button
                onClick={() => setActiveTabManage('invite')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${activeTabManage === 'invite' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
              >
                🎟️ Link Wali Murid
              </button>
            </div>
          </div>

          {activeTabManage === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_KELAS_LIST.map((k) => (
                <div key={k.id} className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-black text-indigo-950 text-base">{k.namaKelas}</h5>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-200 px-2.5 py-0.5 rounded-full">{k.guruNama}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <span className="text-slate-500">Rata Logika</span>
                      <div className="font-black text-emerald-600 text-base">88%</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <span className="text-slate-500">Rata Halus</span>
                      <div className="font-black text-blue-600 text-base">92%</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <span className="text-slate-500">Rata Kasar</span>
                      <div className="font-black text-purple-600 text-base">85%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTabManage === 'reminder' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h5 className="font-black text-slate-900 text-sm">Status Kelengkapan Input Asesmen Guru (Traffic Light):</h5>
              {MOCK_USERS_LIST.filter((u) => u.role === 'guru').map((g) => {
                const tf = getTeacherTrafficLight(g.lastInputDate);
                return (
                  <div key={g.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{g.nama}</span>
                      <p className="text-slate-500">Terakhir Input: {g.lastInputDate || 'Belum pernah'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-black text-xs ${tf.color}`}>{tf.status}</span>
                  </div>
                );
              })}
            </div>
          )}

          {activeTabManage === 'invite' && (
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-4">
              <h5 className="font-black text-amber-950 text-base">Buat Link Undangan Bertoken Unik untuk Wali Murid:</h5>
              <div className="flex gap-2">
                <select
                  value={selectedMuridForInvite}
                  onChange={(e) => setSelectedMuridForInvite(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-amber-300 text-xs font-bold"
                >
                  {daftarMurid.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fotoEmoji} {m.nama} (Usia {m.kategoriUsia.replace('_tahun', ' Thn')})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleGenerateInvite}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black rounded-xl text-xs shadow"
                >
                  Generate Link 🎟️
                </button>
              </div>

              {generatedInviteLink && (
                <div className="p-3 bg-white rounded-xl border border-amber-300 text-xs text-slate-800 break-all space-y-1">
                  <span className="font-bold text-amber-900">Link Undangan Akses Wali Murid:</span>
                  <div className="p-2 bg-slate-100 rounded font-mono text-[11px] select-all">{generatedInviteLink}</div>
                  <p className="text-[10px] text-slate-500">Kirimkan link ini ke WhatsApp Wali Murid. Akses hanya khusus untuk anak tersebut.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ROLE 3: DASHBOARD YAYASAN */}
      {currentUser.role === 'yayasan' && (
        <div className="space-y-6">
          <div className="bg-purple-900 text-white p-5 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-xs font-black uppercase text-purple-300">Dashboard Pengurus Yayasan</span>
              <h4 className="text-2xl font-black">Komparasi Unit Sekolah & Management Tenant</h4>
            </div>
            <span className="text-xs font-bold bg-purple-800 px-3 py-1.5 rounded-full text-purple-200">Total: {daftarTenant.length} Unit Sekolah</span>
          </div>

          {/* Form Tambah Tenant / Unit Sekolah */}
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-3">
            <h5 className="font-black text-purple-950 text-sm">Tambah Unit Sekolah / Tenant Baru:</h5>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Nama Sekolah PAUD Baru..."
                value={namaSekolahBaru}
                onChange={(e) => setNamaSekolahBaru(e.target.value)}
                className="flex-1 p-2.5 rounded-xl border border-purple-300 text-xs font-bold"
              />
              <input
                type="text"
                placeholder="Kode Yayasan (contoh: YYS-04)..."
                value={kodeYayasanBaru}
                onChange={(e) => setKodeYayasanBaru(e.target.value)}
                className="w-full sm:w-48 p-2.5 rounded-xl border border-purple-300 text-xs font-bold"
              />
              <button
                onClick={() => {
                  if (namaSekolahBaru.trim()) {
                    onAddTenant(namaSekolahBaru, kodeYayasanBaru || 'YYS-NEW');
                    setNamaSekolahBaru('');
                    setKodeYayasanBaru('');
                  }
                }}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Tambah Unit ➕
              </button>
            </div>
          </div>

          {/* List Tenant Komparasi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {daftarTenant.map((t) => (
              <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-black text-slate-900 text-sm">{t.namaSekolah}</h5>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">{t.kodeYayasan}</span>
                  </div>
                  <button
                    onClick={() => onDeleteTenant(t.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                  >
                    Hapus 🗑️
                  </button>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>Alamat: {t.alamat || 'Jl. Pendidikan No. 1'}</p>
                  <p className="font-bold text-emerald-600">Status Capaian: Sangat Baik (89%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROLE 4: TAMPILAN KHUSUS WALI MURID */}
      {currentUser.role === 'wali_murid' && (
        <div className="bg-gradient-to-b from-rose-50 to-amber-50 p-6 rounded-3xl border-4 border-rose-200 space-y-6">
          {(() => {
            const childM = daftarMurid.find((m) => m.id === (currentUser.assignedMuridId || 'm-1')) || daftarMurid[0];
            return (
              <>
                <div className="text-center space-y-2">
                  <span className="text-5xl p-2 bg-white rounded-full shadow inline-block">{childM.fotoEmoji}</span>
                  <h3 className="text-3xl font-black text-rose-950">Jurnal Tumbuh Kembang {childM.nama} ❤️</h3>
                  <p className="text-rose-700 font-bold text-sm max-w-md mx-auto">
                    Selamat datang Ayah & Bunda! Berikut adalah rangkuman ceria aktivitas & capaian Ananda di sekolah.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-4 rounded-2xl shadow border border-amber-200">
                    <span className="text-3xl">🧠</span>
                    <h5 className="font-black text-amber-900 text-sm mt-1">Dunia Berpikir & Logika</h5>
                    <div className="text-2xl font-black text-amber-600 mt-1">{childM.skorLogika.pencocokanBentuk}%</div>
                    <p className="text-[11px] text-slate-500 mt-1">Sangat pintar mengenali bentuk & warna!</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow border border-pink-200">
                    <span className="text-3xl">✍️</span>
                    <h5 className="font-black text-pink-900 text-sm mt-1">Kreativitas Jemari</h5>
                    <div className="text-2xl font-black text-pink-600 mt-1">{childM.skorMotorikHalus.tracingGaris}%</div>
                    <p className="text-[11px] text-slate-500 mt-1">Mulai terampil menebalkan garis & puzzle.</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow border border-sky-200">
                    <span className="text-3xl">🏃</span>
                    <h5 className="font-black text-sky-900 text-sm mt-1">Keaktifan Fisik</h5>
                    <div className="text-2xl font-black text-sky-600 mt-1">Sangat Ceria</div>
                    <p className="text-[11px] text-slate-500 mt-1">Aktif bergerak & melompat ikuti irama.</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-rose-200 text-xs text-rose-900">
                  💖 <strong>Pesan Hangat Ustadzah:</strong> Ananda {childM.panggilan} anak yang periang dan suka menolong teman di kelas. Tetap dukung Ananda di rumah ya Ayah & Bunda!
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
