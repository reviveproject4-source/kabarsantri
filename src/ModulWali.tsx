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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <div>
          <p className="font-black text-amber-500 text-lg leading-none">
            KABARSANTRI
          </p>
          <p className="text-xs text-slate-400 mt-1">Portal Wali Santri</p>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold">{santri.nama}</p>
          <p className="text-xs text-slate-400">{santri.kelas}</p>
        </div>

        <button
          onClick={() => setShowGantiPin(true)}
          className="text-sm text-slate-300 hover:text-white ml-4"
        >
          🔑 Ganti PIN
        </button>

        <button
          onClick={onKeluar}
          className="text-sm text-slate-300 hover:text-white ml-4"
        >
          🔄 Keluar
        </button>
      </header>

      {showGantiPin && (
        <GantiPassword mode="pin" onTutup={() => setShowGantiPin(false)} />
      )}

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          {MENU.map((m) => (
            <button
              key={m.key}
              onClick={() => setTab(m.key)}
              className={`px-4 py-2 rounded-xl text-sm border ${
                tab === m.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              {m.label} {m.premium && !isPremium ? '🔒' : ''}
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
