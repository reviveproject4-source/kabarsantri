import React, { useState } from 'react';
import { Pegawai, PresensiPegawai, PresensiSantri, Santri, NilaiAkhlak, IzinPulang, StatusPresensi } from '../../types';
import { PresensiSaya } from '../../PresensiSaya';
import { tanggalLokal } from '../../tanggal';
import { useCatatPresensiSantri } from '../../hooks/usePresensi';
import { useTambahRiwayatTahfidz } from '../../hooks/useSantri';
import { useTambahNilaiAkhlak } from '../../hooks/useAkhlak';
import { useTambahPelanggaran, useTambahReward, useRewardList, usePelanggaranList } from '../../hooks/useRewardPelanggaran';
import { usePerbaruiStatusIzinPulang } from '../../hooks/useIzinPulang';

interface Props {
  namaAktif: string;
  pegawaiAktif?: Pegawai;
  santriList: Santri[];
  presensiSantri: PresensiSantri[];
  presensiPegawai: PresensiPegawai[];
  nilaiAkhlakList: NilaiAkhlak[];
  izinPulangList: IzinPulang[];
  jenisKelaminDiampuAktif: string;
  setActiveTab: (tab: string) => void;
}

const STATUS_OPTIONS: StatusPresensi[] = ['Hadir', 'Sakit', 'Izin', 'Alfa'];

export function DashboardMusyrif({
  namaAktif,
  pegawaiAktif,
  santriList,
  presensiSantri,
  presensiPegawai,
  nilaiAkhlakList,
  izinPulangList,
  jenisKelaminDiampuAktif,
  setActiveTab,
}: Props) {
  const hariIni = tanggalLokal();

  // Gender Filter State (default based on jenisKelaminDiampuAktif if present)
  const defaultGender = jenisKelaminDiampuAktif === 'P' || jenisKelaminDiampuAktif === 'Akhwat'
    ? 'Perempuan'
    : jenisKelaminDiampuAktif === 'L' || jenisKelaminDiampuAktif === 'Ikhwan'
    ? 'Laki-Laki'
    : 'Semua';

  const [genderFilter, setGenderFilter] = useState<'Semua' | 'Laki-Laki' | 'Perempuan'>(defaultGender);

  // Mutations & Queries
  const { mutate: catatPresensiSantri } = useCatatPresensiSantri();
  const { mutateAsync: tambahRiwayatTahfidz } = useTambahRiwayatTahfidz();
  const { mutateAsync: tambahNilaiAkhlak } = useTambahNilaiAkhlak();
  const { mutateAsync: tambahPelanggaran } = useTambahPelanggaran();
  const { mutateAsync: tambahReward } = useTambahReward();
  const { mutate: perbaruiStatusIzin } = usePerbaruiStatusIzinPulang();
  const { data: rewardList = [] } = useRewardList();
  const { data: pelanggaranList = [] } = usePelanggaranList();

  // Modals state
  const [showModalTahfidz, setShowModalTahfidz] = useState(false);
  const [showModalAkhlak, setShowModalAkhlak] = useState(false);
  const [showModalReward, setShowModalReward] = useState(false);

  // Form states Tahfidz
  const [tahfidzSantriId, setTahfidzSantriId] = useState('');
  const [kategoriHafalan, setKategoriHafalan] = useState<'Al-Qur\'an' | 'Hadits' | 'Kitab' | 'Lainnya'>('Al-Qur\'an');
  const [customHafalanJudul, setCustomHafalanJudul] = useState('');
  const [tahfidzJuz, setTahfidzJuz] = useState('');
  const [tahfidzSurat, setTahfidzSurat] = useState('');
  const [tahfidzAyat, setTahfidzAyat] = useState('');
  const [tahfidzNilai, setTahfidzNilai] = useState('Mumtaz');
  const [sedangSimpanTahfidz, setSedangSimpanTahfidz] = useState(false);

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

  // Filter santri for Musyrif's dormitory gender scope + Gender Filter
  const santriAsrama = santriList.filter((s) => {
    if (genderFilter === 'Semua') return true;
    if (genderFilter === 'Laki-Laki') return s.jenisKelamin === 'Laki-Laki' || s.jenisKelamin === 'L';
    if (genderFilter === 'Perempuan') return s.jenisKelamin === 'Perempuan' || s.jenisKelamin === 'P';
    return true;
  });

  const totalSantriAsrama = santriAsrama.length;

  // Presensi Santri Asrama Hari Ini
  const presensiHariIniMap = new Map(
    presensiSantri
      .filter((p) => p.tanggal === hariIni)
      .map((p) => [p.santriId, p.status])
  );

  let countHadir = 0;
  let countSakit = 0;
  let countIzin = 0;
  let countAlfa = 0;

  santriAsrama.forEach((s) => {
    const st = presensiHariIniMap.get(s.id);
    if (st === 'Hadir') countHadir++;
    else if (st === 'Sakit') countSakit++;
    else if (st === 'Izin') countIzin++;
    else if (st === 'Alfa') countAlfa++;
  });

  // Cumulative Hafalan Metrics
  const santriDenganHafalanCount = santriAsrama.filter(
    (s) => (s.riwayatTahfidz && s.riwayatTahfidz.length > 0) || s.juzTerakhir
  ).length;

  const rasioHafalanPersen = totalSantriAsrama > 0 ? Math.round((santriDenganHafalanCount / totalSantriAsrama) * 100) : 0;

  // Unique Santri Berprestasi & Melanggar
  const santriAsramaIdsSet = new Set(santriAsrama.map((s) => s.id));

  const uniqueSantriBerprestasi = new Set(
    rewardList.filter((r) => santriAsramaIdsSet.has(r.santriId)).map((r) => r.santriId)
  ).size;

  const uniqueSantriMelanggar = new Set(
    pelanggaranList.filter((p) => santriAsramaIdsSet.has(p.santriId)).map((p) => p.santriId)
  ).size;

  // Pending Izin Pulang needing Musyrif ACC
  const pendingIzinPulang = izinPulangList.filter(
    (i) => santriAsramaIdsSet.has(i.santriId) && i.status === 'Menunggu'
  );

  // Nilai Akhlak for santri in Asrama
  const akhlakAsrama = nilaiAkhlakList.filter((a) => santriAsramaIdsSet.has(a.santriId));
  const akhlakTerbaru = akhlakAsrama.slice(0, 5);

  const labelScopeAsrama =
    genderFilter === 'Laki-Laki'
      ? 'Asrama Putra (Ikhwan)'
      : genderFilter === 'Perempuan'
      ? 'Asrama Putri (Akhwat)'
      : 'Seluruh Asrama';

  // Handlers for Direct Presensi
  const handlePresensiStatus = (santriId: number, status: StatusPresensi) => {
    catatPresensiSantri(
      { santriId, status, dicatatOleh: namaAktif },
      {
        onError: (err: any) => {
          alert(`Gagal mencatat presensi: ${err?.message || err}`);
        },
      }
    );
  };

  // Handler for Direct ACC Izin Pulang (Disetujui / Ditolak)
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

  // Submitting Tahfidz Form with Custom Category
  const handleSimpanTahfidz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tahfidzSantriId) {
      alert('Pilih santri terlebih dahulu!');
      return;
    }

    let finalJuz = tahfidzJuz;
    let finalHadits = '';
    let finalKitab = '';

    if (kategoriHafalan === 'Al-Qur\'an') {
      if (!tahfidzJuz) {
        alert('Masukkan Juz Al-Qur\'an!');
        return;
      }
      finalJuz = tahfidzJuz.startsWith('Juz') ? tahfidzJuz : `Juz ${tahfidzJuz}`;
    } else if (kategoriHafalan === 'Hadits') {
      finalHadits = customHafalanJudul || tahfidzSurat || 'Hadits Arba\'in';
      finalJuz = 'Hadits';
    } else if (kategoriHafalan === 'Kitab') {
      finalKitab = customHafalanJudul || tahfidzSurat || 'Kitab Aqidatul Awam';
      finalJuz = 'Kitab';
    } else {
      finalJuz = customHafalanJudul || 'Hafalan Lainnya';
    }

    setSedangSimpanTahfidz(true);
    try {
      await tambahRiwayatTahfidz({
        santriId: Number(tahfidzSantriId),
        riwayat: {
          juz: finalJuz,
          surat: tahfidzSurat || '-',
          ayat: tahfidzAyat || '-',
          hadits: finalHadits,
          kitab: finalKitab,
          nilai: tahfidzNilai || 'Mumtaz',
          dicatatOleh: namaAktif,
        },
      });
      setShowModalTahfidz(false);
      setTahfidzSantriId('');
      setTahfidzJuz('');
      setTahfidzSurat('');
      setTahfidzAyat('');
      setCustomHafalanJudul('');
    } catch (err: any) {
      alert(`Gagal menyimpan setoran: ${err?.message || err}`);
    } finally {
      setSedangSimpanTahfidz(false);
    }
  };

  // Handler for Submitting Akhlak Rating
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

  // Handler for Submitting Reward / Pelanggaran
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
      {/* Welcome Banner Musyrif */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-900 via-blue-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-cyan-950/20 border border-cyan-600/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cyan-400/20 text-cyan-200 text-xs px-3 py-1 rounded-full font-bold border border-cyan-300/30 uppercase tracking-wider">
                🕌 Dashboard Operational Musyrif Asrama
              </span>
              <span className="bg-white/10 text-cyan-100 text-xs px-3 py-1 rounded-full font-medium border border-white/20">
                {labelScopeAsrama}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Selamat datang kembali, {namaAktif}!
            </h1>
            <p className="text-cyan-100/90 text-xs sm:text-sm mt-1.5 font-normal max-w-2xl">
              Pantau keaktifan santri asrama, setujui pengajuan izin pulang, catat adab sholat, dan pembinaan kedisiplinan ({tanggalLokal()}).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-left md:text-right shrink-0">
            <div className="text-[10px] text-cyan-200 uppercase tracking-wider font-semibold">Santri Asrama Diampu</div>
            <div className="text-2xl font-black text-amber-300 flex items-center gap-1.5 md:justify-end">
              🏠 {totalSantriAsrama} <span className="text-xs font-normal text-white">Santri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Presensi Saya (Musyrif Mandiri) */}
      <PresensiSaya pegawaiId={pegawaiAktif?.id ?? null} presensiPegawai={presensiPegawai} />

      {/* Gender Filter Controls Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">Scope Asrama &amp; Gender Santri:</span>
          <span className="text-xs text-slate-400 font-medium">(Ganti lingkup pemantauan asrama)</span>
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
              {g === 'Semua' ? '🌐 Semua Asrama' : g === 'Laki-Laki' ? '👦 Asrama Ikhwan' : '👧 Asrama Akhwat'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Summary Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ikhtisar Aktivitas &amp; Pengawasan Asrama</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presensi Asrama</h3>
              <p className="text-3xl font-black text-emerald-600 mt-1">{countHadir} <span className="text-xs font-semibold text-slate-400">/ {totalSantriAsrama}</span></p>
              <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 mt-1">
                <span>✓</span> {countHadir} Santri Hadir
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🕌
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending ACC Izin</h3>
              <p className="text-3xl font-black text-amber-600 mt-1">{pendingIzinPulang.length}</p>
              <span className="text-[11px] font-semibold text-amber-600 inline-flex items-center gap-1 mt-1">
                <span>⏳</span> Perlu Verifikasi
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🚪
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Santri Berprestasi</h3>
              <p className="text-3xl font-black text-teal-600 mt-1">{uniqueSantriBerprestasi}</p>
              <span className="text-[11px] font-semibold text-teal-600 inline-flex items-center gap-1 mt-1">
                <span>⭐</span> Teladan Asrama
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🏅
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Santri Melanggar</h3>
              <p className="text-3xl font-black text-rose-600 mt-1">{uniqueSantriMelanggar}</p>
              <span className="text-[11px] font-semibold text-rose-600 inline-flex items-center gap-1 mt-1">
                <span>⚠️</span> Pembinaan Asrama
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-xl shadow-inner">
              🚨
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Interactive Workflows Bar */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Aksi Cepat &amp; Alur Kerja Langsung Musyrif</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => setActiveTab('izin-pulang')}
            className="bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all text-left flex flex-col items-start gap-2 group border border-amber-400/30"
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
            onClick={() => setShowModalTahfidz(true)}
            className="bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all text-left flex flex-col items-start gap-2 group border border-indigo-400/30"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              📖
            </div>
            <div>
              <div className="text-xs font-bold text-white">+ Setoran Asrama</div>
              <div className="text-[10px] text-indigo-100">Tahfidz &amp; Kitab</div>
            </div>
          </button>

          <button
            onClick={() => setShowModalAkhlak(true)}
            className="bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all text-left flex flex-col items-start gap-2 group border border-teal-400/30"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🌱
            </div>
            <div>
              <div className="text-xs font-bold text-white">+ Catat Adab</div>
              <div className="text-[10px] text-teal-100">Evaluasi Shalat</div>
            </div>
          </button>

          <button
            onClick={() => setShowModalReward(true)}
            className="bg-gradient-to-br from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all text-left flex flex-col items-start gap-2 group border border-rose-400/30"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              🚨
            </div>
            <div>
              <div className="text-xs font-bold text-white">+ Catat Pelanggaran</div>
              <div className="text-[10px] text-rose-100">Pembinaan Disiplin</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('santri')}
            className="bg-white hover:bg-cyan-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-cyan-300 transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              👨‍🎓
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">Data Santri</div>
              <div className="text-[10px] text-slate-400">Daftar Kamar</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('google-chat')}
            className="bg-white hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-blue-300 transition-all text-left flex flex-col items-start gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
              💬
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Chat Ruang</div>
              <div className="text-[10px] text-slate-400">Komunikasi Musyrif</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Operational Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OPERATIONAL WORKFLOW: ACC Izin Pulang Santri */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Verifikasi &amp; ACC Izin Pulang Santri</h3>
                <p className="text-xs text-slate-400">Pengajuan izin kepulangan santri yang membutuhkan ACC Musyrif</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                {pendingIzinPulang.length} Menunggu ACC
              </span>
            </div>

            {pendingIzinPulang.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-2">
                <span className="text-3xl">✅</span>
                <p className="text-xs text-slate-500 font-medium mt-2">Semua pengajuan izin pulang santri sudah diproses.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingIzinPulang.slice(0, 4).map((i) => {
                  const santri = santriList.find((s) => s.id === i.santriId);
                  return (
                    <div key={i.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900">{santri?.nama || `Santri #${i.santriId}`}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                          Alasan: <span className="italic">{i.alasan}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          📅 Tanggal Pulang: {i.tanggalKeluar} s/d {i.tanggalKembali}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleACCStatus(i.id, 'Disetujui')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition flex items-center gap-1"
                        >
                          <span>✓</span> Setujui
                        </button>
                        <button
                          onClick={() => handleACCStatus(i.id, 'Ditolak')}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition flex items-center gap-1"
                        >
                          <span>✕</span> Tolak
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Catatan Adab & Evaluasi Akhlak Asrama Feed */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Evaluasi Adab &amp; Karakter Asrama</h3>
                <p className="text-xs text-slate-400">Catatan perkembangan sholat &amp; kedisiplinan asrama</p>
              </div>
              <button
                onClick={() => setShowModalAkhlak(true)}
                className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 rounded-xl shadow transition flex items-center gap-1"
              >
                <span>🌱</span> Catat Adab
              </button>
            </div>

            {akhlakTerbaru.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-2">
                <span className="text-3xl">🌱</span>
                <p className="text-xs text-slate-500 font-medium mt-2">Belum ada catatan evaluasi adab asrama terdaftar.</p>
                <button
                  onClick={() => setShowModalAkhlak(true)}
                  className="mt-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
                >
                  + Catat Evaluasi Adab Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {akhlakTerbaru.map((a) => {
                  const s = santriList.find((x) => x.id === a.santriId);
                  return (
                    <div key={a.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-800 truncate">{s?.nama || `Santri #${a.santriId}`}</div>
                        <div className="text-[11px] text-slate-500 italic truncate">{a.catatan || 'Evaluasi adab harian'}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {a.nilai}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{a.tanggal}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OPERATIONAL ATTENDANCE TABLE — Single-Click Attendance Direct on Dashboard */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Presensi Santri Asrama Hari Ini (Operasional Langsung)</h3>
            <p className="text-xs text-slate-400">Klik tombol status di bawah untuk langsung menyimpan presensi ke database ({tanggalLokal()})</p>
          </div>
          <button
            onClick={() => setActiveTab('presensi')}
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition self-start sm:self-auto"
          >
            Modul Presensi Lengkap ➔
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Nama Santri</th>
                <th className="p-4 px-6">NIS</th>
                <th className="p-4 px-6">Asrama / Kamar</th>
                <th className="p-4 px-6">Input Presensi Asrama Hari Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {santriAsrama.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-slate-400">
                    Belum ada santri terdaftar untuk asrama / filter gender ini
                  </td>
                </tr>
              ) : (
                santriAsrama.map((s) => {
                  const statusSaatIni = presensiHariIniMap.get(s.id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 px-6 font-semibold text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {s.nama[0]}
                        </div>
                        {s.nama}
                      </td>
                      <td className="p-4 px-6 text-slate-600 text-xs font-mono">{s.nis || '-'}</td>
                      <td className="p-4 px-6 text-slate-600 font-medium text-xs">{s.asrama || 'Kamar Utama'}</td>
                      <td className="p-4 px-6">
                        <div className="flex flex-wrap gap-1.5">
                          {STATUS_OPTIONS.map((st) => {
                            const isSelected = statusSaatIni === st;
                            return (
                              <button
                                key={st}
                                onClick={() => handlePresensiStatus(s.id, st)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                  isSelected
                                    ? st === 'Hadir'
                                      ? 'bg-emerald-600 text-white shadow'
                                      : st === 'Alfa'
                                      ? 'bg-rose-600 text-white shadow'
                                      : 'bg-amber-500 text-white shadow'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {isSelected && <span>✓</span>}
                                {st}
                              </button>
                            );
                          })}
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

      {/* MODAL 1: INPUT SETORAN HAFALAN ASRAMA */}
      {showModalTahfidz && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>📖</span> Input Setoran Hafalan Santri Asrama
              </h3>
              <button
                onClick={() => setShowModalTahfidz(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimpanTahfidz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Pilih Santri
                </label>
                <select
                  value={tahfidzSantriId}
                  onChange={(e) => setTahfidzSantriId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriAsrama.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.asrama || 'Kamar Utama'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Kategori Hafalan
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {(['Al-Qur\'an', 'Hadits', 'Kitab', 'Lainnya'] as const).map((kat) => (
                    <button
                      key={kat}
                      type="button"
                      onClick={() => setKategoriHafalan(kat)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                        kategoriHafalan === kat
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {kat}
                    </button>
                  ))}
                </div>
              </div>

              {kategoriHafalan === 'Al-Qur\'an' ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Juz *
                    </label>
                    <input
                      type="text"
                      placeholder="30"
                      value={tahfidzJuz}
                      onChange={(e) => setTahfidzJuz(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Surat
                    </label>
                    <input
                      type="text"
                      placeholder="An-Naba"
                      value={tahfidzSurat}
                      onChange={(e) => setTahfidzSurat(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Ayat
                    </label>
                    <input
                      type="text"
                      placeholder="1-40"
                      value={tahfidzAyat}
                      onChange={(e) => setTahfidzAyat(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Judul / Nama {kategoriHafalan} Custom
                    </label>
                    <input
                      type="text"
                      placeholder={
                        kategoriHafalan === 'Hadits'
                          ? 'Contoh: Hadits Arba\'in No. 1'
                          : kategoriHafalan === 'Kitab'
                          ? 'Contoh: Kitab Aqidatul Awam'
                          : 'Contoh: Matan Alfiyyah / Nazham'
                      }
                      value={customHafalanJudul}
                      onChange={(e) => setCustomHafalanJudul(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Keterangan / Bab / Bait
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Bait 1 - 20"
                      value={tahfidzSurat}
                      onChange={(e) => setTahfidzSurat(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nilai Evaluasi
                </label>
                <select
                  value={tahfidzNilai}
                  onChange={(e) => setTahfidzNilai(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Mumtaz (Sangat Baik)">Mumtaz (Sangat Baik)</option>
                  <option value="Jayyid Jiddan (Baik Sekali)">Jayyid Jiddan (Baik Sekali)</option>
                  <option value="Jayyid (Baik)">Jayyid (Baik)</option>
                  <option value="Maqbul (Cukup)">Maqbul (Cukup)</option>
                  <option value="Murojaah Ulang">Murojaah Ulang</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModalTahfidz(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={sedangSimpanTahfidz}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow disabled:opacity-50"
                >
                  {sedangSimpanTahfidz ? 'Simpan Database...' : 'Simpan Setoran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INPUT NILAI AKHLAK */}
      {showModalAkhlak && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>🌱</span> Catat Evaluasi Adab &amp; Karakter Asrama
              </h3>
              <button
                onClick={() => setShowModalAkhlak(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimpanAkhlak} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Pilih Santri
                </label>
                <select
                  value={akhlakSantriId}
                  onChange={(e) => setAkhlakSantriId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriAsrama.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.asrama || 'Kamar Utama'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nilai Adab / Karakter
                </label>
                <select
                  value={akhlakNilai}
                  onChange={(e) => setAkhlakNilai(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Sangat Baik">Sangat Baik (A)</option>
                  <option value="Baik">Baik (B)</option>
                  <option value="Cukup">Cukup (C)</option>
                  <option value="Perlu Bimbingan">Perlu Bimbingan (D)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Catatan Evaluasi Musyrif
                </label>
                <textarea
                  placeholder="Contoh: Disiplin shalat berjamaah 5 waktu di masjid asrama."
                  value={akhlakCatatan}
                  onChange={(e) => setAkhlakCatatan(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModalAkhlak(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={sedangSimpanAkhlak}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow disabled:opacity-50"
                >
                  {sedangSimpanAkhlak ? 'Simpan Database...' : 'Simpan Evaluasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INPUT REWARD / PELANGGARAN */}
      {showModalReward && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>🏅</span> Catat Prestasi / Pelanggaran Asrama
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
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
                  required
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriAsrama.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.asrama || 'Kamar Utama'})
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
                  placeholder={
                    rpJenis === 'reward'
                      ? 'Contoh: Juara Kebersihan Kamar / Shalat Tahajud Rajin'
                      : 'Contoh: Keluar Asrama Tanpa Izin / Terlambat Jamaah'
                  }
                  value={rpKategori}
                  onChange={(e) => setRpKategori(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Catatan Rincian
                </label>
                <textarea
                  placeholder="Penjelasan rincian kejadian di asrama..."
                  value={rpCatatan}
                  onChange={(e) => setRpCatatan(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
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
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow disabled:opacity-50 ${
                    rpJenis === 'reward' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
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
