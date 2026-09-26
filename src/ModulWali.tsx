import React, { useState } from 'react';
import { Santri } from './types';
import { useAuth } from './AuthContext';
import { usePresensiSantriList } from './hooks/usePresensi';
import { useNilaiAkhlakList } from './hooks/useAkhlak';
import { useIzinPulangList, useAjukanIzinPulang } from './hooks/useIzinPulang';
import { usePengumumanList } from './hooks/usePengumuman';
import { ModulSubmitPembayaran } from './ModulSubmitPembayaran';
import { GantiPassword } from './GantiPassword';

type TabWali =
  | 'presensi'
  | 'hafalan'
  | 'akhlak'
  | 'izin'
  | 'pembayaran'
  | 'pengumuman';

const MENU: { key: TabWali; label: string; premium: boolean }[] = [
  { key: 'presensi', label: '✅ Presensi', premium: false },
  { key: 'hafalan', label: '📖 Hafalan', premium: false },
  { key: 'akhlak', label: '🌱 Karakter & Akhlak', premium: true },
  { key: 'izin', label: '🏠 Izin Pulang', premium: true },
  { key: 'pembayaran', label: '💳 Bukti Pembayaran', premium: false },
  { key: 'pengumuman', label: '📢 Pengumuman', premium: false },
];

interface Props {
  santri: Santri;
  onKeluar: () => void;
}

function KuncinPremium({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-2xl border p-10 text-center">
      <div className="text-3xl mb-3">🔒</div>
      <h3 className="font-semibold text-lg mb-2">{label} — Fitur Premium</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        Fitur ini akan aktif setelah pihak Yayasan mengaktifkan Paket
        Premium. Silakan hubungi pihak Yayasan/pesantren untuk mengaktifkan.
      </p>
    </div>
  );
}

export function ModulWali({ santri, onKeluar }: Props) {
  const { yayasan } = useAuth();
  const { data: presensiSantri = [] } = usePresensiSantriList();
  const { data: nilaiAkhlakList = [] } = useNilaiAkhlakList();
  const { data: izinPulangList = [] } = useIzinPulangList();
  const { mutate: ajukanIzinPulang } = useAjukanIzinPulang();
  const { data: pengumumanList = [] } = usePengumumanList();

  const [tab, setTab] = useState<TabWali>('presensi');
  const [showGantiPin, setShowGantiPin] = useState(false);
  const [tanggalKeluar, setTanggalKeluar] = useState('');
  const [tanggalKembali, setTanggalKembali] = useState('');
  const [alasan, setAlasan] = useState('');

  const isPremium = yayasan?.paket === 'Premium';

  const presensiAnak = presensiSantri
    .filter((p: any) => p.santriId === santri.id)
    .sort((a: any, b: any) => b.tanggal.localeCompare(a.tanggal));

  const hafalanAnak = [...santri.riwayatTahfidz].sort((a: any, b: any) => b.id - a.id);

  const akhlakAnak = nilaiAkhlakList
    .filter((a: any) => a.santriId === santri.id)
    .sort((a: any, b: any) => b.id - a.id);

  const izinAnak = izinPulangList
    .filter((i: any) => i.santriId === santri.id)
    .sort((a: any, b: any) => b.id - a.id);

  const ajukanIzin = () => {
    if (!tanggalKeluar || !tanggalKembali || !alasan) {
      alert('Lengkapi tanggal keluar, tanggal kembali, dan alasan');
      return;
    }

    ajukanIzinPulang(
      {
        santriId: santri.id,
        tanggalKeluar,
        tanggalKembali,
        alasan,
      },
      {
        onSuccess: () => {
          setTanggalKeluar('');
          setTanggalKembali('');
          setAlasan('');
        },
        onError: (err: any) => {
          const pesan =
            err instanceof Error
              ? err.message
              : err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : String(err);
          alert(`Gagal mengajukan izin pulang: ${pesan}`);
        },
      }
    );
  };

  const presensiTerakhir = presensiAnak[0];
  const hafalanTerakhir = hafalanAnak[0];
  const akhlakTerakhir = akhlakAnak[0];
  const izinTerakhir = izinAnak[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar Header */}
      <header className="bg-slate-900 text-white p-4 px-6 border-b border-slate-800 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo-kabarsantri.png" alt="Logo KabarSantri" className="w-9 h-9 rounded-xl object-cover shrink-0" />
          {yayasan?.logoUrl && (
            <img
              src={yayasan.logoUrl}
              alt="Logo Lembaga"
              className="w-8 h-8 rounded-xl object-cover border border-amber-400/40 shrink-0 bg-white/10"
            />
          )}
          <div>
            <p className="font-black text-amber-400 text-base leading-none tracking-tight">
              {yayasan?.namaYayasan || 'KABARSANTRI'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Portal Wali Santri &amp; Perkembangan Anak</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{santri.nama}</p>
            <p className="text-[11px] text-slate-400">NIS: {santri.nis || '-'} · Kelas {santri.kelas}</p>
          </div>

          <button
            onClick={() => setShowGantiPin(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 transition"
          >
            🔑 Ganti PIN
          </button>

          <button
            onClick={onKeluar}
            className="bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-800/50 transition flex items-center gap-1"
          >
            <span>🔄</span> Keluar
          </button>
        </div>
      </header>

      {showGantiPin && (
        <GantiPassword mode="pin" onTutup={() => setShowGantiPin(false)} />
      )}

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Student Profile Identity Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0A4ABF] via-blue-950 to-slate-950 rounded-3xl p-6 text-white shadow-xl shadow-blue-950/20 border border-blue-600/30">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-amber-300 shrink-0">
                {santri.nama[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-300/30 uppercase tracking-wider">
                    Santri Aktif
                  </span>
                  <span className="bg-white/10 text-slate-200 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-medium border border-white/20">
                    {santri.asrama || 'Asrama Utama'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white">{santri.nama}</h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">
                  NIS: <span className="font-mono text-amber-300">{santri.nis || '-'}</span> · NISN: <span className="font-mono">{santri.nisn || '-'}</span> · Kelas: <span className="font-semibold text-white">{santri.kelas}</span>
                </p>
                {(santri.namaAyah || santri.namaIbu) && (
                  <p className="text-slate-400 text-xs mt-1">
                    Orang Tua / Wali: <span className="text-slate-200">{santri.namaAyah || santri.namaIbu}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-left md:text-right shrink-0">
              <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Capaian Terakhir Tahfidz</div>
              <div className="text-sm font-bold text-amber-300 mt-0.5">
                {hafalanTerakhir ? `Surat ${hafalanTerakhir.surat || '-'} (Juz ${hafalanTerakhir.juz || '-'})` : 'Juz ' + (santri.juzTerakhir || '-')}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">Nilai: {hafalanTerakhir?.nilai || santri.nilaiTahfidz || 'Mumtaz'}</div>
            </div>
          </div>
        </div>

        {/* Ringkasan Status Anak Terkini (4 Cards) */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ikhtisar Perkembangan Harian Santri</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Presensi */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presensi Hari Ini</span>
                <span className="text-lg">✅</span>
              </div>
              {presensiTerakhir ? (
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                    presensiTerakhir.status === 'Hadir' ? 'bg-emerald-100 text-emerald-800' :
                    presensiTerakhir.status === 'Alfa' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {presensiTerakhir.status}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1.5">{presensiTerakhir.tanggal}</p>
                </div>
              ) : (
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                    Belum Presensi
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1.5">Hari ini</p>
                </div>
              )}
            </div>

            {/* Setoran Hafalan */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Setoran Terakhir</span>
                <span className="text-lg">📖</span>
              </div>
              {hafalanTerakhir ? (
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate">Surat {hafalanTerakhir.surat}</p>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">Juz {hafalanTerakhir.juz} (Ayat {hafalanTerakhir.ayat})</p>
                  <p className="text-[10px] text-slate-400 mt-1">{hafalanTerakhir.tanggal}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-slate-500">Belum Ada Setoran</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">Riwayat awal</p>
                </div>
              )}
            </div>

            {/* Karakter & Akhlak */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Karakter &amp; Adab</span>
                <span className="text-lg">🌱</span>
              </div>
              {akhlakTerakhir ? (
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 text-xs font-bold">
                    {akhlakTerakhir.nilai}
                  </span>
                  <p className="text-[11px] text-slate-500 italic mt-1 truncate">{akhlakTerakhir.catatan || 'Baik'}</p>
                </div>
              ) : (
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Baik &amp; Disiplin
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Evaluasi harian</p>
                </div>
              )}
            </div>

            {/* Status Perizinan */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perizinan Pulang</span>
                <span className="text-lg">🏠</span>
              </div>
              {izinTerakhir ? (
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
                    izinTerakhir.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                    izinTerakhir.status === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {izinTerakhir.status}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">Kembali: {izinTerakhir.tanggalKembali}</p>
                </div>
              ) : (
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-xs font-semibold">
                    Di Pesantren
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Tidak ada izin aktif</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
          {MENU.map((m) => (
            <button
              key={m.key}
              onClick={() => setTab(m.key)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                tab === m.key
                  ? 'bg-[#0A4ABF] text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{m.label}</span>
              {m.premium && !isPremium ? <span className="text-xs">🔒</span> : null}
            </button>
          ))}
        </div>

        {tab === 'presensi' && (
          <div className="bg-white rounded-2xl border overflow-hidden">
            <h3 className="font-semibold p-4 border-b bg-slate-50">
              Presensi {santri.nama}
            </h3>
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-4">Tanggal</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Dicatat Oleh</th>
                </tr>
              </thead>
              <tbody>
                {presensiAnak.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-gray-500">
                      Belum ada data presensi
                    </td>
                  </tr>
                ) : (
                  presensiAnak.map((p: any) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-4">{p.tanggal}</td>
                      <td className="p-4">{p.status}</td>
                      <td className="p-4">{p.dicatatOleh}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'hafalan' && (
          <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
            <h3 className="font-semibold p-4 border-b bg-slate-50">
              Hafalan {santri.nama}
            </h3>
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-4">Tanggal</th>
                  <th className="text-left p-4">Juz</th>
                  <th className="text-left p-4">Surat</th>
                  <th className="text-left p-4">Ayat</th>
                  <th className="text-left p-4">Hadits</th>
                  <th className="text-left p-4">Kitab</th>
                  <th className="text-left p-4">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {hafalanAnak.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-500">
                      Belum ada data hafalan
                    </td>
                  </tr>
                ) : (
                  hafalanAnak.map((h) => (
                    <tr key={h.id} className="border-t">
                      <td className="p-4">{h.tanggal}</td>
                      <td className="p-4">{h.juz}</td>
                      <td className="p-4">{h.surat}</td>
                      <td className="p-4">{h.ayat}</td>
                      <td className="p-4">{h.hadits}</td>
                      <td className="p-4">{h.kitab}</td>
                      <td className="p-4">{h.nilai}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'akhlak' &&
          (isPremium ? (
            <div className="bg-white rounded-2xl border overflow-hidden">
              <h3 className="font-semibold p-4 border-b bg-slate-50">
                Karakter & Akhlak {santri.nama}
              </h3>
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left p-4">Tanggal</th>
                    <th className="text-left p-4">Nilai</th>
                    <th className="text-left p-4">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {akhlakAnak.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-8 text-gray-500">
                        Belum ada data akhlak
                      </td>
                    </tr>
                  ) : (
                    akhlakAnak.map((a: any) => (
                      <tr key={a.id} className="border-t">
                        <td className="p-4">{a.tanggal}</td>
                        <td className="p-4">{a.nilai}</td>
                        <td className="p-4">{a.catatan || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <KuncinPremium label="Karakter & Akhlak" />
          ))}

        {tab === 'izin' &&
          (isPremium ? (
            <div>
              <div className="bg-white p-6 rounded-2xl border mb-6">
                <h3 className="font-semibold mb-3">
                  Ajukan Izin Pulang untuk {santri.nama}
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-gray-500">
                      Tanggal Keluar
                    </label>
                    <input
                      type="date"
                      value={tanggalKeluar}
                      onChange={(e) => setTanggalKeluar(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Tanggal Kembali
                    </label>
                    <input
                      type="date"
                      value={tanggalKembali}
                      onChange={(e) => setTanggalKembali(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <textarea
                  placeholder="Alasan izin pulang"
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                />

                <button
                  onClick={ajukanIzin}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Ajukan ke Kesantrian
                </button>
              </div>

              <div className="bg-white rounded-2xl border overflow-hidden">
                <h3 className="font-semibold p-4 border-b bg-slate-50">
                  Riwayat Pengajuan
                </h3>
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left p-4">Keluar</th>
                      <th className="text-left p-4">Kembali</th>
                      <th className="text-left p-4">Alasan</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {izinAnak.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center p-8 text-gray-500">
                          Belum ada pengajuan izin pulang
                        </td>
                      </tr>
                    ) : (
                      izinAnak.map((i: any) => (
                        <tr key={i.id} className="border-t">
                          <td className="p-4">{i.tanggalKeluar}</td>
                          <td className="p-4">{i.tanggalKembali}</td>
                          <td className="p-4">{i.alasan}</td>
                          <td className="p-4">{i.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <KuncinPremium label="Izin Pulang" />
          ))}

        {tab === 'pembayaran' && <ModulSubmitPembayaran santri={santri} />}

        {tab === 'pengumuman' && (
          <div className="bg-white rounded-2xl border overflow-hidden">
            <h3 className="font-semibold p-4 border-b bg-slate-50">
              Pengumuman
            </h3>

            {pengumumanList.length === 0 ? (
              <p className="text-center p-8 text-gray-500">
                Belum ada pengumuman
              </p>
            ) : (
              <div className="divide-y">
                {pengumumanList.map((p: any) => (
                  <div key={p.id} className="p-4">
                    <h4 className="font-semibold">{p.judul}</h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(p.createdAt).toLocaleString('id-ID')} ·{' '}
                      {p.dibuatOleh}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {p.isi}
                    </p>
                    {p.lampiranUrl && (
                      <a
                        href={p.lampiranUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-sm text-blue-600 underline"
                      >
                        📎 {p.lampiranNama || 'Lihat Lampiran'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
