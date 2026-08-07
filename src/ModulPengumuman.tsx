import React, { useMemo, useState } from 'react';
import { useSantriList } from './hooks/useSantri';
import { supabase } from './supabaseClient';
import {
  usePengumumanList,
  useTambahPengumuman,
  useHapusPengumuman,
} from './hooks/usePengumuman';

interface Props {
  dicatatOleh: string;
  jenisKelaminDiampu: string;
}

export function ModulPengumuman({ dicatatOleh, jenisKelaminDiampu }: Props) {
  const { data: santriListSemua = [] } = useSantriList();
  const santriList = santriListSemua.filter(
    (s: any) => !jenisKelaminDiampu || s.jenisKelamin === jenisKelaminDiampu
  );
  const { data: pengumumanList = [] } = usePengumumanList();
  const { mutateAsync: tambahPengumuman } = useTambahPengumuman();
  const { mutateAsync: hapusPengumuman } = useHapusPengumuman();

  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [semuaKelas, setSemuaKelas] = useState(true);
  const [kelasDipilih, setKelasDipilih] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [mengirim, setMengirim] = useState(false);

  const daftarKelas = useMemo(
    () =>
      (Array.from(new Set(santriList.map((s: any) => s.kelas).filter(Boolean))) as string[]).sort(
        (a: string, b: string) => a.localeCompare(b)
      ),
    [santriList]
  );

  const toggleKelas = (kelas: string) => {
    setKelasDipilih((prev) =>
      prev.includes(kelas) ? prev.filter((k) => k !== kelas) : [...prev, kelas]
    );
  };

  const kirim = async () => {
    if (!judul || !isi) {
      alert('Lengkapi judul dan isi pengumuman');
      return;
    }

    if (!semuaKelas && kelasDipilih.length === 0) {
      alert('Pilih minimal satu kelas, atau centang "Semua Kelas"');
      return;
    }

    setMengirim(true);

    try {
      let lampiranUrl: string | null = null;
      let lampiranNama: string | null = null;

      if (file) {
        const namaFile = `${Date.now()}-${file.name}`;
        const { error: errorUpload } = await supabase.storage
          .from('lampiran-pengumuman')
          .upload(namaFile, file);

        if (errorUpload) {
          alert(`Gagal mengunggah lampiran: ${errorUpload.message}`);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('lampiran-pengumuman')
          .getPublicUrl(namaFile);

        lampiranUrl = urlData.publicUrl;
        lampiranNama = file.name;
      }

      // Kalau akses Kesantrian ini dibatasi gender tertentu, "Semua Kelas"
      // tidak boleh benar-benar mengirim ke SELURUH kelas (termasuk gender
      // lain) -- diarahkan ke daftar kelas gender yang diampu saja.
      const kelasTujuan = semuaKelas
        ? jenisKelaminDiampu
          ? daftarKelas
          : null
        : kelasDipilih;

      await tambahPengumuman({
        judul,
        isi,
        kelasTujuan,
        lampiranUrl,
        lampiranNama,
        dibuatOleh: dicatatOleh,
      });

      setJudul('');
      setIsi('');
      setSemuaKelas(true);
      setKelasDipilih([]);
      setFile(null);
    } catch (err) {
      const pesan =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : String(err);
      alert(`Gagal mengirim pengumuman: ${pesan}`);
    } finally {
      setMengirim(false);
    }
  };

  const hapus = async (id: number) => {
    if (!confirm('Hapus pengumuman ini?')) return;

    try {
      await hapusPengumuman(id);
    } catch (err) {
      const pesan =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : String(err);
      alert(`Gagal menghapus pengumuman: ${pesan}`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Pengumuman</h1>
      <p className="text-sm text-gray-500 mb-6">
        Broadcast pengumuman ke wali santri -- ke semua kelas, atau kelas
        tertentu saja.
      </p>

      <div className="bg-white p-6 rounded-2xl border mb-6">
        <input
          type="text"
          placeholder="Judul Pengumuman"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <textarea
          placeholder="Isi pengumuman"
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={semuaKelas}
            onChange={(e) => setSemuaKelas(e.target.checked)}
          />
          {jenisKelaminDiampu
            ? `Kirim ke Semua Kelas ${jenisKelaminDiampu}`
            : 'Kirim ke Semua Kelas'}
        </label>

        {!semuaKelas && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">
              Pilih kelas tujuan (boleh lebih dari satu)
            </p>
            <div className="flex flex-wrap gap-2">
              {daftarKelas.length === 0 ? (
                <p className="text-xs text-gray-400">Belum ada data kelas</p>
              ) : (
                daftarKelas.map((kelas) => (
                  <button
                    key={kelas}
                    type="button"
                    onClick={() => toggleKelas(kelas)}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${
                      kelasDipilih.includes(kelas)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {kelas}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="text-xs text-gray-500 block mb-1">
            Lampiran (opsional) — surat resmi, undangan, PDF, gambar, dll
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full border rounded-lg px-3 py-2"
          />
          {file && (
            <p className="text-xs text-gray-500 mt-1">
              File dipilih: {file.name}
            </p>
          )}
        </div>

        <button
          onClick={kirim}
          disabled={mengirim}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {mengirim ? 'Mengirim...' : 'Kirim Pengumuman'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <h3 className="font-semibold p-4 border-b bg-slate-50">
          Riwayat Pengumuman
        </h3>

        {pengumumanList.length === 0 ? (
          <p className="text-center p-8 text-gray-500">
            Belum ada pengumuman
          </p>
        ) : (
          <div className="divide-y">
            {pengumumanList.map((p: any) => (
              <div key={p.id} className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="font-semibold">{p.judul}</h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(p.createdAt).toLocaleString('id-ID')} ·{' '}
                      {p.kelasTujuan && p.kelasTujuan.length > 0
                        ? `Kelas: ${p.kelasTujuan.join(', ')}`
                        : 'Semua Kelas'}{' '}
                      · {p.dibuatOleh}
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
                  <button
                    onClick={() => hapus(p.id)}
                    className="text-xs text-red-600 underline shrink-0"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
