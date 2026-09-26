import React, { useMemo, useState } from 'react';
import { SantriInput } from './types';
import { useSantriList, useTambahSantri, useUbahSantri } from './hooks/useSantri';
import { useBuatAkun } from './hooks/useBuatAkun';
import { normalisasiNomorHp } from './teleponUtils';

function pesanError(err: unknown): string {
  return err instanceof Error
    ? err.message
    : err && typeof err === 'object' && 'message' in err
    ? String((err as { message: unknown }).message)
    : String(err);
}

const FORM_KOSONG: SantriInput = {
  nama: '',
  nis: '',
  nisn: '',
  jenisKelamin: '',
  tempatLahir: '',
  tanggalLahir: '',
  status: 'Aktif',

  kelas: '',
  asrama: '',

  namaAyah: '',
  pekerjaanAyah: '',
  noHpAyah: '',

  namaIbu: '',
  pekerjaanIbu: '',
  noHpIbu: '',

  alamatWali: '',

  juzTerakhir: '',
  suratTerakhir: '',
  ayatTerakhir: '',
  nilaiTahfidz: '',
};

const MAX_SANTRI = 50;
const PANJANG_PIN_WALI = 8;

function pinWaliValid(pin: string): boolean {
  return /^[0-9]+$/.test(pin) && pin.length === PANJANG_PIN_WALI;
}

function SantriFormFields({
  form,
  ubah,
  kelasOptions,
  asramaOptions,
  idPrefix,
}: {
  form: SantriInput;
  ubah: (field: keyof SantriInput, value: string) => void;
  kelasOptions: string[];
  asramaOptions: string[];
  idPrefix: string;
}) {
  return (
    <>
      {/* Data Pribadi Santri */}
      <h3 className="font-semibold text-sm text-blue-700 mb-2 mt-2">
        Data Pribadi Santri
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          type="text"
          placeholder="Nama Santri"
          value={form.nama}
          onChange={(e) => ubah('nama', e.target.value)}
          className="col-span-2 border rounded-lg px-3 py-2"
        />

        <input
          type="text"
          placeholder="NIS"
          value={form.nis}
          onChange={(e) => ubah('nis', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="text"
          placeholder="NISN"
          value={form.nisn}
          onChange={(e) => ubah('nisn', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <select
          value={form.jenisKelamin}
          onChange={(e) => ubah('jenisKelamin', e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Jenis Kelamin</option>
          <option value="Ikhwan">Ikhwan</option>
          <option value="Akhwat">Akhwat</option>
        </select>

        <select
          value={form.status}
          onChange={(e) => ubah('status', e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="Aktif">Aktif</option>
          <option value="Alumni">Alumni</option>
          <option value="Pindah">Pindah</option>
        </select>

        <input
          type="text"
          placeholder="Tempat Lahir"
          value={form.tempatLahir}
          onChange={(e) => ubah('tempatLahir', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="date"
          placeholder="Tanggal Lahir"
          value={form.tanggalLahir}
          onChange={(e) => ubah('tanggalLahir', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      {/* Kelas & Asrama */}
      <h3 className="font-semibold text-sm text-blue-700 mb-2">
        Kelas &amp; Asrama
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <input
            list={`${idPrefix}-daftar-kelas`}
            placeholder="Pilih atau ketik Kelas baru"
            value={form.kelas}
            onChange={(e) => ubah('kelas', e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
          <datalist id={`${idPrefix}-daftar-kelas`}>
            {kelasOptions.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        </div>

        <div>
          <input
            list={`${idPrefix}-daftar-asrama`}
            placeholder="Pilih atau ketik Asrama baru"
            value={form.asrama}
            onChange={(e) => ubah('asrama', e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
          <datalist id={`${idPrefix}-daftar-asrama`}>
            {asramaOptions.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Data Ayah */}
      <h3 className="font-semibold text-sm text-blue-700 mb-2">Data Ayah</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          type="text"
          placeholder="Nama Ayah"
          value={form.namaAyah}
          onChange={(e) => ubah('namaAyah', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="text"
          placeholder="Pekerjaan Ayah"
          value={form.pekerjaanAyah}
          onChange={(e) => ubah('pekerjaanAyah', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="text"
          inputMode="numeric"
          placeholder="No Kontak Ayah (08xxx)"
          value={form.noHpAyah}
          onChange={(e) =>
            ubah('noHpAyah', e.target.value.replace(/[^0-9]/g, ''))
          }
          className="border rounded-lg px-3 py-2 col-span-2"
        />
      </div>

      {/* Data Ibu */}
      <h3 className="font-semibold text-sm text-blue-700 mb-2">Data Ibu</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          type="text"
          placeholder="Nama Ibu"
          value={form.namaIbu}
          onChange={(e) => ubah('namaIbu', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="text"
          placeholder="Pekerjaan Ibu"
          value={form.pekerjaanIbu}
          onChange={(e) => ubah('pekerjaanIbu', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="text"
          inputMode="numeric"
          placeholder="No Kontak Ibu (08xxx)"
          value={form.noHpIbu}
          onChange={(e) =>
            ubah('noHpIbu', e.target.value.replace(/[^0-9]/g, ''))
          }
          className="border rounded-lg px-3 py-2 col-span-2"
        />

        <textarea
          placeholder="Alamat Orang Tua / Wali"
          value={form.alamatWali}
          onChange={(e) => ubah('alamatWali', e.target.value)}
          className="border rounded-lg px-3 py-2 col-span-2"
        />
      </div>

      {/* Tahfidz Awal */}
      <h3 className="font-semibold text-sm text-blue-700 mb-2">
        Data Tahfidz Awal (opsional)
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          type="text"
          placeholder="Juz Terakhir"
          value={form.juzTerakhir}
          onChange={(e) => ubah('juzTerakhir', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="text"
          placeholder="Surat Terakhir"
          value={form.suratTerakhir}
          onChange={(e) => ubah('suratTerakhir', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="text"
          placeholder="Ayat Terakhir"
          value={form.ayatTerakhir}
          onChange={(e) => ubah('ayatTerakhir', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="text"
          placeholder="Nilai"
          value={form.nilaiTahfidz}
          onChange={(e) => ubah('nilaiTahfidz', e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>
    </>
  );
}

function hitungRekap(nilaiList: string[]) {
  const rekap = new Map<string, number>();

  nilaiList
    .filter((nilai) => nilai.trim() !== '')
    .forEach((nilai) => {
      rekap.set(nilai, (rekap.get(nilai) ?? 0) + 1);
    });

  return Array.from(rekap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
}

interface ModulSantriProps {
  isReadOnly?: boolean;
}

export function ModulSantri({ isReadOnly = false }: ModulSantriProps = {}) {
  const { data: santriList = [] } = useSantriList();
  const { mutateAsync: tambahSantri } = useTambahSantri();
  const { mutateAsync: ubahSantri } = useUbahSantri();
  const { mutateAsync: buatAkun } = useBuatAkun();

  const [showForm, setShowForm] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [form, setForm] = useState<SantriInput>(FORM_KOSONG);
  const [pinWali, setPinWali] = useState('');

  const [cariNama, setCariNama] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterAsrama, setFilterAsrama] = useState('');

  const [santriDiedit, setSantriDiedit] = useState<number | null>(null);
  const [formEdit, setFormEdit] = useState<SantriInput>(FORM_KOSONG);
  const [menyimpanEdit, setMenyimpanEdit] = useState(false);

  const [santriAkunWali, setSantriAkunWali] = useState<{
    id: number;
    nama: string;
  } | null>(null);
  const [pinAkunWali, setPinAkunWali] = useState('');
  const [menyimpanAkunWali, setMenyimpanAkunWali] = useState(false);

  const santriFiltered = useMemo(() => {
    return santriList.filter((s: any) => {
      const matchCari =
        !cariNama ||
        s.nama.toLowerCase().includes(cariNama.toLowerCase()) ||
        s.nis.toLowerCase().includes(cariNama.toLowerCase());
      const matchKelas = !filterKelas || s.kelas === filterKelas;
      const matchAsrama = !filterAsrama || s.asrama === filterAsrama;
      return matchCari && matchKelas && matchAsrama;
    });
  }, [santriList, cariNama, filterKelas, filterAsrama]);

  const jumlahIkhwan = useMemo(
    () => santriList.filter((s: any) => s.jenisKelamin === 'Ikhwan').length,
    [santriList]
  );
  const jumlahAkhwat = useMemo(
    () => santriList.filter((s: any) => s.jenisKelamin === 'Akhwat').length,
    [santriList]
  );

  const kelasOptions = useMemo(
    () => Array.from(new Set(santriList.map((s: any) => s.kelas).filter(Boolean))) as string[],
    [santriList]
  );

  const asramaOptions = useMemo(
    () => Array.from(new Set(santriList.map((s: any) => s.asrama).filter(Boolean))) as string[],
    [santriList]
  );

  const rekapKelas = useMemo(
    () => hitungRekap(santriList.map((s: any) => s.kelas)),
    [santriList]
  );

  const rekapAsrama = useMemo(
    () => hitungRekap(santriList.map((s: any) => s.asrama)),
    [santriList]
  );

  const ubah = (field: keyof SantriInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(FORM_KOSONG);
    setPinWali('');
  };

  const handleSimpan = async () => {
    if (isReadOnly) {
      alert('Akses ditolak: Master Data Santri bersifat READ ONLY untuk peran Anda.');
      return;
    }

    if (santriList.length >= MAX_SANTRI) {
      alert('Kuota Paket Gratis maksimal 50 santri');
      return;
    }

    if (!form.nama || !form.nis || !form.kelas) {
      alert('Lengkapi minimal Nama, NIS, dan Kelas');
      return;
    }

    if (pinWali && !pinWaliValid(pinWali)) {
      alert(`PIN Wali harus angka, ${PANJANG_PIN_WALI} digit.`);
      return;
    }

    setMenyimpan(true);

    try {
      const santriId = await tambahSantri({
        ...form,
        noHpAyah: normalisasiNomorHp(form.noHpAyah),
        noHpIbu: normalisasiNomorHp(form.noHpIbu),
      });

      if (pinWali) {
        try {
          await buatAkun({
            password: pinWali,
            peran: 'wali',
            santriId,
          });
        } catch (err) {
          alert(
            `Santri tersimpan, tapi akun wali gagal dibuat: ${pesanError(
              err
            )}. Anda bisa buat akunnya lagi nanti.`
          );
        }
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      alert(`Gagal menyimpan data santri: ${pesanError(err)}`);
    } finally {
      setMenyimpan(false);
    }
  };

  const ubahEdit = (field: keyof SantriInput, value: string) => {
    setFormEdit((prev) => ({ ...prev, [field]: value }));
  };

  const bukaEdit = (santriId: number) => {
    const santri = santriList.find((s: any) => s.id === santriId);
    if (!santri) return;

    const { id, riwayatTahfidz, ...input } = santri;
    setFormEdit(input);
    setSantriDiedit(santriId);
  };

  const handleSimpanEdit = async () => {
    if (isReadOnly) {
      alert('Akses ditolak: Master Data Santri bersifat READ ONLY untuk peran Anda.');
      return;
    }

    if (santriDiedit === null) return;

    if (!formEdit.nama || !formEdit.nis || !formEdit.kelas) {
      alert('Lengkapi minimal Nama, NIS, dan Kelas');
      return;
    }

    setMenyimpanEdit(true);

    try {
      await ubahSantri({
        id: santriDiedit,
        input: {
          ...formEdit,
          noHpAyah: normalisasiNomorHp(formEdit.noHpAyah),
          noHpIbu: normalisasiNomorHp(formEdit.noHpIbu),
        },
      });
      setSantriDiedit(null);
    } catch (err) {
      alert(`Gagal menyimpan perubahan data santri: ${pesanError(err)}`);
    } finally {
      setMenyimpanEdit(false);
    }
  };

  const bukaAkunWali = (santriId: number) => {
    const santri = santriList.find((s: any) => s.id === santriId);
    if (!santri) return;

    setSantriAkunWali({ id: santriId, nama: santri.nama });
    setPinAkunWali('');
  };

  const handleBuatAkunWali = async () => {
    if (!santriAkunWali) return;

    if (!pinAkunWali) {
      alert('Isi PIN untuk akun wali');
      return;
    }

    if (!pinWaliValid(pinAkunWali)) {
      alert(`PIN Wali harus angka, ${PANJANG_PIN_WALI} digit.`);
      return;
    }

    setMenyimpanAkunWali(true);

    try {
      await buatAkun({
        password: pinAkunWali,
        peran: 'wali',
        santriId: santriAkunWali.id,
      });
      setSantriAkunWali(null);
    } catch (err) {
      alert(`Gagal membuat akun wali: ${pesanError(err)}`);
    } finally {
      setMenyimpanAkunWali(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Data Master Santri</h1>
            <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200">
              {santriList.length} Santri
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola data biodata, rombel kelas, kamar asrama, dan akun login wali santri.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs text-slate-700 font-medium flex items-center gap-2">
              <span>📊 Kuota Paket:</span>
              <span className="font-bold text-emerald-700">{santriList.length} / {MAX_SANTRI}</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-lg border border-cyan-200/60 font-semibold">♂ {jumlahIkhwan} Ikhwan</span>
              <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-200/60 font-semibold">♀ {jumlahAkhwat} Akhwat</span>
            </div>
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition-transform active:scale-95 flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <span className="text-lg">➕</span> Tambah Santri Baru
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Cari Santri / NIS</label>
          <input
            type="text"
            placeholder="🔍 Cari nama atau NIS..."
            value={cariNama}
            onChange={(e) => setCariNama(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Filter Kelas</label>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            <option value="">Semua Kelas</option>
            {kelasOptions.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Filter Asrama</label>
          <select
            value={filterAsrama}
            onChange={(e) => setFilterAsrama(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            <option value="">Semua Asrama</option>
            {asramaOptions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="p-4 px-6">Identitas Santri</th>
                <th className="p-4 px-6">NIS / NISN</th>
                <th className="p-4 px-6">Kelas & Asrama</th>
                <th className="p-4 px-6">Orang Tua / Wali</th>
                <th className="p-4 px-6">Status</th>
                <th className="p-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {santriFiltered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-slate-400">
                    Tidak ada santri yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                santriFiltered.map((santri: any) => {
                  const isIkhwan = santri.jenisKelamin === 'Ikhwan';
                  return (
                    <tr key={santri.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-sm ${
                            isIkhwan ? 'bg-cyan-100 text-cyan-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {santri.nama[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{santri.nama}</div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                              isIkhwan ? 'bg-cyan-50 text-cyan-700 border border-cyan-200/50' : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                            }`}>
                              {santri.jenisKelamin || 'Belum diisi'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 px-6 font-mono text-xs">
                        <div className="font-bold text-slate-700">{santri.nis || '-'}</div>
                        <div className="text-[11px] text-slate-400">{santri.nisn || 'No NISN'}</div>
                      </td>

                      <td className="p-4 px-6">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                            🏫 {santri.kelas || 'Belum ada kelas'}
                          </span>
                          {santri.asrama && (
                            <span className="bg-amber-50 text-amber-800 text-[11px] font-medium px-2.5 py-0.5 rounded-lg border border-amber-200/60">
                              🛖 {santri.asrama}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 px-6 text-xs">
                        {santri.namaAyah ? (
                          <div className="font-medium text-slate-800">
                            Ayah: <span className="font-semibold">{santri.namaAyah}</span> {santri.noHpAyah && <span className="text-emerald-600 font-mono">({santri.noHpAyah})</span>}
                          </div>
                        ) : null}
                        {santri.namaIbu ? (
                          <div className="text-slate-600">
                            Ibu: <span className="font-semibold">{santri.namaIbu}</span> {santri.noHpIbu && <span className="text-emerald-600 font-mono">({santri.noHpIbu})</span>}
                          </div>
                        ) : null}
                        {!santri.namaAyah && !santri.namaIbu && <span className="text-slate-400 italic">Belum diisi</span>}
                      </td>

                      <td className="p-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          santri.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            santri.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`} />
                          {santri.status}
                        </span>
                      </td>

                      <td className="p-4 px-6 text-right">
                        {!isReadOnly ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => bukaEdit(santri.id)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => bukaAkunWali(santri.id)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold px-3 py-1.5 rounded-xl text-xs transition"
                            >
                              🔑 Akun Wali
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            👁️ Read Only
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border overflow-hidden">
          <h3 className="font-semibold p-4 border-b bg-slate-50">
            Rekap per Kelas
          </h3>
          <table className="w-full">
            <tbody>
              {rekapKelas.length === 0 ? (
                <tr>
                  <td className="text-center p-6 text-gray-500">
                    Belum ada data kelas
                  </td>
                </tr>
              ) : (
                rekapKelas.map(([kelas, jumlah]) => (
                  <tr key={kelas} className="border-t">
                    <td className="p-3 pl-4">{kelas}</td>
                    <td className="p-3 pr-4 text-right">{jumlah} santri</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <h3 className="font-semibold p-4 border-b bg-slate-50">
            Rekap per Asrama
          </h3>
          <table className="w-full">
            <tbody>
              {rekapAsrama.length === 0 ? (
                <tr>
                  <td className="text-center p-6 text-gray-500">
                    Belum ada data asrama
                  </td>
                </tr>
              ) : (
                rekapAsrama.map(([asrama, jumlah]) => (
                  <tr key={asrama} className="border-t">
                    <td className="p-3 pl-4">{asrama}</td>
                    <td className="p-3 pr-4 text-right">{jumlah} santri</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-1">Tambah Santri</h2>
            <p className="text-sm text-gray-500 mb-4">
              Satu form untuk data santri, wali (ayah &amp; ibu), kelas,
              asrama, dan tahfidz.
            </p>

            <SantriFormFields
              form={form}
              ubah={ubah}
              kelasOptions={kelasOptions}
              asramaOptions={asramaOptions}
              idPrefix="tambah"
            />

            {/* Akun Login Wali Santri */}
            <h3 className="font-semibold text-sm text-blue-700 mb-2">
              Akun Login Wali Santri (opsional)
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              Wali login pakai Nama Santri + NIS + PIN ini (tanpa email). Isi
              untuk langsung membuatkan akunnya. Bisa juga dikosongkan dan
              dibuat belakangan.
            </p>
            <div className="mb-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={PANJANG_PIN_WALI}
                placeholder={`PIN Wali (${PANJANG_PIN_WALI} digit)`}
                value={pinWali}
                onChange={(e) => setPinWali(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={handleSimpan}
                disabled={menyimpan}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {menyimpan ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {santriDiedit !== null && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-1">Ubah Data Santri</h2>
            <p className="text-sm text-gray-500 mb-4">
              Perbaiki data yang salah tulis, atau perbarui data seperti no
              kontak wali.
            </p>

            <SantriFormFields
              form={formEdit}
              ubah={ubahEdit}
              kelasOptions={kelasOptions}
              asramaOptions={asramaOptions}
              idPrefix="ubah"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSantriDiedit(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={handleSimpanEdit}
                disabled={menyimpanEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {menyimpanEdit ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {santriAkunWali && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-1">Buat/Reset Akun Wali</h2>
            <p className="text-sm text-gray-500 mb-4">
              {santriAkunWali.nama}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Wali login pakai Nama Santri + NIS + PIN ini (tanpa email).
              Kalau akunnya sudah ada, PIN lama akan diganti PIN baru ini.
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={PANJANG_PIN_WALI}
              placeholder={`PIN Wali (${PANJANG_PIN_WALI} digit)`}
              value={pinAkunWali}
              onChange={(e) => setPinAkunWali(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSantriAkunWali(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={handleBuatAkunWali}
                disabled={menyimpanAkunWali}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {menyimpanAkunWali ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
