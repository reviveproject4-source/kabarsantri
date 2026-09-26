import React, { useState } from 'react';
import { Pegawai, PresensiPegawai, Santri, NilaiAkhlak, IzinPulang } from '../../types';
import { PresensiSaya } from '../../PresensiSaya';
import { tanggalLokal } from '../../tanggal';
import { usePerbaruiStatusIzinPulang } from '../../hooks/useIzinPulang';
import { useRewardList, usePelanggaranList, useTambahPelanggaran, useTambahReward } from '../../hooks/useRewardPelanggaran';
import { useTambahNilaiAkhlak } from '../../hooks/useAkhlak';

interface Props {
  namaAktif: string;
  pegawaiAktif?: Pegawai;
  santriList: Santri[];
  presensiPegawaiList: PresensiPegawai[];
  nilaiAkhlakList: NilaiAkhlak[];
  izinPulangList: IzinPulang[];
  jenisKelaminDiampuAktif: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardKesantrian({
  namaAktif,
  pegawaiAktif,
  santriList,
  presensiPegawaiList,
  nilaiAkhlakList,
  izinPulangList,
  jenisKelaminDiampuAktif,
  setActiveTab,
}: Props) {
  const hariIni = tanggalLokal();

  // Gender Filter
  const defaultGender = jenisKelaminDiampuAktif === 'P' || jenisKelaminDiampuAktif === 'Akhwat'
    ? 'Perempuan'
    : jenisKelaminDiampuAktif === 'L' || jenisKelaminDiampuAktif === 'Ikhwan'
    ? 'Laki-Laki'
    : 'Semua';

  const [genderFilter, setGenderFilter] = useState<'Semua' | 'Laki-Laki' | 'Perempuan'>(defaultGender);

  // Mutations
  const { mutate: perbaruiStatusIzin } = usePerbaruiStatusIzinPulang();
  const { mutateAsync: tambahNilaiAkhlak } = useTambahNilaiAkhlak();
  const { mutateAsync: tambahPelanggaran } = useTambahPelanggaran();
  const { mutateAsync: tambahReward } = useTambahReward();

  const { data: rewardList = [] } = useRewardList();
  const { data: pelanggaranList = [] } = usePelanggaranList();

  // Modals state
  const [showModalAkhlak, setShowModalAkhlak] = useState(false);
  const [showModalReward, setShowModalReward] = useState(false);

  // Form states Akhlak
  const [akhlakSantriId, setAkhlakSantriId] = useState('');
  const [akhlakNilai, setAkhlakNilai] = useState('Baik');
  const [akhlakCatatan, setAkhlakCatatan] = useState('');
  const [sedangSimpanAkhlak, setSedangSimpanAkhlak] = useState(false);

  // Form states Reward/Pelanggaran
  const [rpSantriId, setRpSantriId] = useState('');
  const [rpJenis, setRpJenis] = useState<'reward' | 'pelanggaran'>('reward');
  const [rpKategori, setRpKategori] = useState('');
  const [rpCatatan, setRpCatatan] = useState('');
  const [sedangSimpanRp, setSedangSimpanRp] = useState(false);

  // Filter santri by Gender
  const santriKesantrian = santriList.filter((s) => {
    if (genderFilter === 'Semua') return true;
    if (genderFilter === 'Laki-Laki') return s.jenisKelamin === 'Laki-Laki' || s.jenisKelamin === 'L';
    if (genderFilter === 'Perempuan') return s.jenisKelamin === 'Perempuan' || s.jenisKelamin === 'P';
    return true;
  });

  const totalSantri = santriKesantrian.length;
  const santriIdsSet = new Set(santriKesantrian.map((s) => s.id));

  // Pending Izin Pulang needing ACC
  const pendingIzinPulang = izinPulangList.filter(
    (i) => santriIdsSet.has(i.santriId) && i.status === 'Menunggu'
  );

  // Unique Santri metrics
  const uniqueSantriBerprestasi = new Set(
    rewardList.filter((r) => santriIdsSet.has(r.santriId)).map((r) => r.santriId)
  ).size;

  const uniqueSantriMelanggar = new Set(
    pelanggaranList.filter((p) => santriIdsSet.has(p.santriId)).map((p) => p.santriId)
  ).size;

  // Handlers
  const handleACCStatus = (id: number, status: 'Disetujui' | 'Ditolak') => {
    perbaruiStatusIzin(
      { id, status },
      {
        onError: (err: any) => {
          alert(`Gagal memperbarui status izin: ${err?.message || err}`);
        },
      }
    );
  };

  const handleSimpanAkhlak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!akhlakSantriId || !akhlakNilai) {
      alert('Pilih santri dan nilai akhlak!');
      return;
    }

    setSedangSimpanAkhlak(true);
    try {
      await tambahNilaiAkhlak({
        santriId: Number(akhlakSantriId),
        nilai: akhlakNilai,
        catatan: akhlakCatatan,
        dicatatOleh: namaAktif,
        status: 'Disetujui',
      });
      setShowModalAkhlak(false);
      setAkhlakSantriId('');
      setAkhlakCatatan('');
    } catch (err: any) {
      alert(`Gagal menyimpan nilai akhlak: ${err?.message || err}`);
    } finally {
      setSedangSimpanAkhlak(false);
    }
  };

  const handleSimpanReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rpSantriId || !rpKategori) {
      alert('Pilih santri dan kategori!');
      return;
    }

    setSedangSimpanRp(true);
    try {
      if (rpJenis === 'pelanggaran') {
        await tambahPelanggaran({
          santriId: Number(rpSantriId),
          kategori: rpKategori,
          catatan: rpCatatan,
          dicatatOleh: namaAktif,
          status: 'Disetujui',
        });
      } else {
        await tambahReward({
          santriId: Number(rpSantriId),
          kategori: rpKategori,
          catatan: rpCatatan,
          dicatatOleh: namaAktif,
        });
      }
      setShowModalReward(false);
      setRpSantriId('');
      setRpKategori('');
      setRpCatatan('');
    } catch (err: any) {
      alert(`Gagal menyimpan catatan: ${err?.message || err}`);
    } finally {
      setSedangSimpanRp(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner Kesantrian */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-950/20 border border-purple-600/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-400/20 text-purple-200 text-xs px-3 py-1 rounded-full font-bold border border-purple-300/30 uppercase tracking-wider">
                🛡️ Dashboard Operational Kesantrian
              </span>
              <span className="bg-white/10 text-purple-100 text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                Pengasuhan &amp; Kedisiplinan
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Selamat datang kembali, Ust. {namaAktif}!
            </h1>
            <p className="text-purple-100/90 text-xs sm:text-sm mt-1.5 font-normal max-w-2xl">
              Manajemen perizinan santri, sidang kedisiplinan, catatan adab karakter, dan pengumuman kesantrian ({tanggalLokal()}).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-left md:text-right shrink-0">
            <div className="text-[10px] text-purple-200 uppercase tracking-wider font-semibold">Total Santri Dipantau</div>
            <div className="text-2xl font-black text-amber-300 flex items-center gap-1.5 md:justify-end">
              🎓 {totalSantri} <span className="text-xs font-normal text-white">Santri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Presensi Saya */}
      <PresensiSaya pegawaiId={pegawaiAktif?.id ?? null} presensiPegawai={presensiPegawaiList} />

      {/* Gender Filter Controls Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">Filter Gender Santri:</span>
          <span className="text-xs text-slate-400 font-medium">(Ganti ruang pemantauan kesantrian)</span>
        </div>
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          {(['Semua', 'Laki-Laki', 'Perempuan'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                genderFilter === g
                  ? 'bg-[#0A4ABF] text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {g === 'Semua' ? '🌐 Semua Santri' : g === 'Laki-Laki' ? '👦 Santri Ikhwan' : '👧 Santri Akhwat'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Summary Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ikhtisar Ketertiban &amp; Kedisiplinan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending ACC Izin</h3>
              <p className="text-3xl font-black text-amber-600 mt-1">{pendingIzinPulang.length}</p>
              <span className="text-[11px] font-semibold text-amber-600 inline-flex items-center gap-1 mt-1">
                <span>🚪</span> Izin Pulang Santri
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-xl shadow-inner">
              ⏳
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Santri Berprestasi</h3>
              <p className="text-3xl font-black text-emerald-600 mt-1">{uniqueSantriBerprestasi}</p>
              <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 mt-1">
                <span>🏆</span> Memiliki Reward
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-inner">
              ⭐
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Santri Melanggar</h3>
              <p className="text-3xl font-black text-rose-600 mt-1">{uniqueSantriMelanggar}</p>
              <span className="text-[11px] font-semibold text-rose-600 inline-flex items-center gap-1 mt-1">
                <span>🚨</span> Memiliki Pelanggaran
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-xl shadow-inner">
              ⚠️
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluasi Akhlak</h3>
              <p className="text-3xl font-black text-purple-600 mt-1">{nilaiAkhlakList.length}</p>
              <span className="text-[11px] font-semibold text-purple-600 inline-flex items-center gap-1 mt-1">
                <span>🌱</span> Catatan Karakter
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-xl shadow-inner">
              📜
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Aksi Cepat &amp; Operasional Kesantrian</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('izin-pulang')}
            className="bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all text-left flex items-center gap-3 group border border-amber-400/30"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🚪
            </div>
            <div>
              <div className="text-xs font-bold text-white">ACC Izin Pulang</div>
              <div className="text-[10px] text-amber-100">{pendingIzinPulang.length} Pengajuan</div>
            </div>
          </button>

          <button
            onClick={() => setShowModalReward(true)}
            className="bg-gradient-to-br from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all text-left flex items-center gap-3 group border border-rose-400/30"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🏅
            </div>
            <div>
              <div className="text-xs font-bold text-white">+ Reward / Pelanggaran</div>
              <div className="text-[10px] text-rose-100">Sidang Kedisiplinan</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('pengumuman')}
            className="bg-white hover:bg-cyan-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-cyan-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📢
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">Broadcast Pengumuman</div>
              <div className="text-[10px] text-slate-400">Pengumuman Kesantrian</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('hubungi-wali')}
            className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-emerald-300 transition-all text-left flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📞
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Hubungi Wali Santri</div>
              <div className="text-[10px] text-slate-400">Kontak Direct WA</div>
            </div>
          </button>
        </div>
      </div>

      {/* OPERATIONAL TABLE: ACC IZIN PULANG KESANTRIAN */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Verifikasi &amp; Keputusan Izin Pulang Santri (Kesantrian)</h3>
            <p className="text-xs text-slate-400">Sumber pengajuan izin: Wali Santri &amp; Musyrif Asrama</p>
          </div>
          <button
            onClick={() => setActiveTab('izin-pulang')}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition self-start sm:self-auto"
          >
            Modul Izin Pulang Lengkap ➔
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Nama Santri</th>
                <th className="p-4 px-6">Sumber Pengajuan</th>
                <th className="p-4 px-6">Alasan &amp; Durasi Tanggal</th>
                <th className="p-4 px-6">Keputusan Kesantrian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pendingIzinPulang.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-slate-400">
                    Belum ada pengajuan izin pulang santri yang menunggu verifikasi saat ini
                  </td>
                </tr>
              ) : (
                pendingIzinPulang.map((i) => {
                  const s = santriList.find((x) => x.id === i.santriId);
                  return (
                    <tr key={i.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 px-6 font-semibold text-slate-800">
                        {s?.nama || `Santri #${i.santriId}`}
                        <div className="text-[11px] text-slate-400 font-normal">Kelas {s?.kelas || '-'}</div>
                      </td>
                      <td className="p-4 px-6">
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-200">
                          👨‍👩‍👧 Wali Santri / Musyrif
                        </span>
                      </td>
                      <td className="p-4 px-6 text-slate-600 text-xs">
                        <div className="font-semibold text-slate-800">{i.alasan}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          📅 {i.tanggalKeluar} s/d {i.tanggalKembali}
                        </div>
                      </td>
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleACCStatus(i.id, 'Disetujui')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
                          >
                            ✓ Setujui
                          </button>
                          <button
                            onClick={() => handleACCStatus(i.id, 'Ditolak')}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
                          >
                            ✕ Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT REWARD / PELANGGARAN */}
      {showModalReward && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>🏅</span> Catat Prestasi / Pelanggaran Kesantrian
              </h3>
              <button
                onClick={() => setShowModalReward(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimpanReward} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Jenis Record
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRpJenis('reward')}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      rpJenis === 'reward'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    🏆 Reward / Prestasi
                  </button>
                  <button
                    type="button"
                    onClick={() => setRpJenis('pelanggaran')}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      rpJenis === 'pelanggaran'
                        ? 'bg-rose-600 text-white border-rose-600 shadow'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    ⚠️ Pelanggaran / Warning
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Pilih Santri
                </label>
                <select
                  value={rpSantriId}
                  onChange={(e) => setRpSantriId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriKesantrian.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.kelas})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Judul Kategori
                </label>
                <input
                  type="text"
                  placeholder="Kategori Prestasi / Pelanggaran"
                  value={rpKategori}
                  onChange={(e) => setRpKategori(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Catatan Rincian
                </label>
                <textarea
                  placeholder="Penjelasan rincian kejadian..."
                  value={rpCatatan}
                  onChange={(e) => setRpCatatan(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModalReward(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={sedangSimpanRp}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow disabled:opacity-50"
                >
                  {sedangSimpanRp ? 'Simpan Database...' : 'Simpan Catatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
