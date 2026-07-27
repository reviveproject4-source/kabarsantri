import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Pelanggaran } from './types';
import { useSantriList } from './hooks/useSantri';
import { useKelasAktif } from './hooks/useKelasAktif';
import { samaKelas } from './kelasUtils';
import { PemilihSantri } from './PemilihSantri';
import {
  usePelanggaranList,
  useTambahPelanggaran,
  usePerbaruiStatusPelanggaran,
  useRewardList,
  useTambahReward,
} from './hooks/useRewardPelanggaran';

const KATEGORI_PELANGGARAN = [
  'Kerapihan Tempat Tidur',
  'Jam Malam',
  'Shalat',
  'Kebersihan',
  'Berkelahi',
];

const KATEGORI_REWARD = ['Ikut Lomba', 'Kepengurusan Organisasi'];

interface Props {
  dicatatOleh: string;
  kelasDiajar: string[];
  bisaMemutuskan: boolean;
  perluAcc: boolean;
  jenisKelaminDiampu: string;
}

export function ModulRewardPelanggaran({
  dicatatOleh,
  kelasDiajar,
  bisaMemutuskan,
  perluAcc,
  jenisKelaminDiampu,
}: Props) {
  const { yayasan } = useAuth();
  const { data: santriListSemua = [] } = useSantriList();
  const [kelasAktif, setKelasAktif] = useKelasAktif(kelasDiajar);
  const santriList = (
    kelasDiajar.length > 0
      ? santriListSemua.filter((s) => samaKelas(s.kelas, kelasAktif))
      : santriListSemua
  ).filter(
    (s) => !jenisKelaminDiampu || s.jenisKelamin === jenisKelaminDiampu
  );
  const { data: pelanggaranList = [] } = usePelanggaranList();
  const { mutateAsync: tambahPelanggaran } = useTambahPelanggaran();
  const { mutate: perbaruiStatusPelanggaran } = usePerbaruiStatusPelanggaran();
  const { data: rewardList = [] } = useRewardList();
  const { mutateAsync: tambahReward } = useTambahReward();
  const paket = yayasan?.paket ?? 'Gratis';

  const [tab, setTab] = useState<'pelanggaran' | 'reward'>('pelanggaran');

  const [santriId, setSantriId] = useState('');
  const [kategori, setKategori] = useState('');
  const [catatan, setCatatan] = useState('');

  if (paket !== 'Premium') {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Reward & Pelanggaran</h1>
        <div className="bg-white rounded-2xl border p-10 text-center">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-semibold text-lg mb-2">
            Fitur Premium (Add-on)
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Pencatatan reward &amp; pelanggaran santri adalah fitur tambahan
            berbayar. Hubungi pihak Yayasan untuk mengaktifkan Paket Premium.
          </p>
        </div>
      </div>
    );
  }

  const kategoriOptions =
    tab === 'pelanggaran' ? KATEGORI_PELANGGARAN : KATEGORI_REWARD;

  const simpan = async () => {
    if (!santriId || !kategori) {
      alert('Pilih santri dan kategori');
      return;
    }

    try {
      if (tab === 'pelanggaran') {
        await tambahPelanggaran({
          santriId: Number(santriId),
          kategori,
          catatan,
          dicatatOleh,
          status: perluAcc ? 'Menunggu' : 'Disetujui',
        });
      } else {
        await tambahReward({
          santriId: Number(santriId),
          kategori,
          catatan,
          dicatatOleh,
        });
      }

      setSantriId('');
      setKategori('');
      setCatatan('');
    } catch (err) {
      const pesan =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : String(err);
      alert(`Gagal menyimpan data: ${pesan}`);
    }
  };

  const putuskanPelanggaran = (
    id: number,
    status: 'Disetujui' | 'Ditolak'
  ) => {
    perbaruiStatusPelanggaran(
      { id, status },
      {
        onError: (err) => {
          const pesan =
            err instanceof Error
              ? err.message
              : err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : String(err);
          alert(`Gagal memperbarui status pelanggaran: ${pesan}`);
        },
      }
    );
  };

  const daftar = (tab === 'pelanggaran' ? pelanggaranList : rewardList)
    .slice()
    .filter((item) => santriList.some((s) => s.id === item.santriId))
    .sort((a, b) => b.id - a.id)
    .map((item) => ({
      ...item,
      namaSantri: santriList.find((s) => s.id === item.santriId)?.nama ?? '-',
    }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reward & Pelanggaran</h1>

        {kelasDiajar.length > 1 && (
          <select
            value={kelasAktif}
            onChange={(e) => setKelasAktif(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            {kelasDiajar.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setTab('pelanggaran');
            setKategori('');
          }}
          className={`px-4 py-2 rounded-xl text-sm border ${
            tab === 'pelanggaran'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white hover:bg-slate-50'
          }`}
        >
          Pelanggaran
        </button>

        <button
          onClick={() => {
            setTab('reward');
            setKategori('');
          }}
          className={`px-4 py-2 rounded-xl text-sm border ${
            tab === 'reward'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white hover:bg-slate-50'
          }`}
        >
          Reward
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border mb-6">
        <PemilihSantri
          santriList={santriList}
          value={santriId}
          onChange={setSantriId}
        />

        {tab === 'reward' ? (
          <>
            <input
              type="text"
              list="daftar-kategori-reward"
              placeholder="Pilih atau ketik Kategori Reward"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <datalist id="daftar-kategori-reward">
              {kategoriOptions.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </>
        ) : (
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3"
          >
            <option value="">Pilih Kategori</option>
            {kategoriOptions.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        )}

        <textarea
          placeholder="Catatan (opsional)"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <button
          onClick={simpan}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Simpan
        </button>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-left">Santri</th>
              <th className="p-4 text-left">Kategori</th>
              <th className="p-4 text-left">Catatan</th>
              <th className="p-4 text-left">Dicatat Oleh</th>
              {tab === 'pelanggaran' && (
                <>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Aksi</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {daftar.length === 0 ? (
              <tr>
                <td
                  colSpan={tab === 'pelanggaran' ? 7 : 5}
                  className="text-center p-6 text-gray-500"
                >
                  Belum ada data {tab === 'pelanggaran' ? 'pelanggaran' : 'reward'}
                </td>
              </tr>
            ) : (
              daftar.map((item) => {
                const statusItem =
                  tab === 'pelanggaran'
                    ? (item as unknown as Pelanggaran).status
                    : null;

                return (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.tanggal}</td>
                  <td className="p-4">{item.namaSantri}</td>
                  <td className="p-4">{item.kategori}</td>
                  <td className="p-4">{item.catatan || '-'}</td>
                  <td className="p-4">{item.dicatatOleh}</td>
                  {tab === 'pelanggaran' && statusItem && (
                    <>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs ${
                            statusItem === 'Disetujui'
                              ? 'bg-green-100 text-green-700'
                              : statusItem === 'Ditolak'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {statusItem}
                        </span>
                      </td>
                      <td className="p-4">
                        {statusItem === 'Menunggu' && bisaMemutuskan ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                putuskanPelanggaran(item.id, 'Disetujui')
                              }
                              className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() =>
                                putuskanPelanggaran(item.id, 'Ditolak')
                              }
                              className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : statusItem === 'Menunggu' ? (
                          <span className="text-xs text-gray-400">
                            Menunggu Kesantrian
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </>
                  )}
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
