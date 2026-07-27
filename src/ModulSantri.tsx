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

export function ModulSantri() {
  const { data: santriList = [] } = useSantriList();
  const { mutateAsync: tambahSantri } = useTambahSantri();
  const { mutateAsync: ubahSantri } = useUbahSantri();
  const { mutateAsync: buatAkun } = useBuatAkun();

  const [showForm, setShowForm] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [form, setForm] = useState<SantriInput>(FORM_KOSONG);
  const [pinWali, setPinWali] = useState('');

  const [santriDiedit, setSantriDiedit] = useState<number | null>(null);
  const [formEdit, setFormEdit] = useState<SantriInput>(FORM_KOSONG);
  const [menyimpanEdit, setMenyimpanEdit] = useState(false);

  const [santriAkunWali, setSantriAkunWali] = useState<{
    id: number;
    nama: string;
  } | null>(null);
  const [pinAkunWali, setPinAkunWali] = useState('');
  const [menyimpanAkunWali, setMenyimpanAkunWali] = useState(false);

  const kelasOptions = useMemo(
    () => Array.from(new Set(santriList.map((s) => s.kelas).filter(Boolean))),
    [santriList]
  );

  const asramaOptions = useMemo(
    () => Array.from(new Set(santriList.map((s) => s.asrama).filter(Boolean))),
    [santriList]
  );

  const rekapKelas = useMemo(
    () => hitungRekap(santriList.map((s) => s.kelas)),
    [santriList]
  );

  const rekapAsrama = useMemo(
    () => hitungRekap(santriList.map((s) => s.asrama)),
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
    const santri = santriList.find((s) => s.id === santriId);
    if (!santri) return;

    const { id, riwayatTahfidz, ...input } = santri;
    setFormEdit(input);
    setSantriDiedit(santriId);
  };

  const handleSimpanEdit = async () => {
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
    const santri = santriList.find((s) => s.id === santriId);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Data Master Santri</h1>

          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
            <p className="text-sm">
              Kuota Paket Gratis:
              <strong> {santriList.length} / {MAX_SANTRI} Santri</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          + Tambah Santri
        </button>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto mb-6">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-4">Nama</th>
              <th className="text-left p-4">NIS</th>
              <th className="text-left p-4">Kelas</th>
              <th className="text-left p-4">Asrama</th>
              <th className="text-left p-4">Ayah</th>
              <th className="text-left p-4">Ibu</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4"></th>
            </tr>
          </thead>

          <tbody>
            {santriList.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-8 text-gray-500">
                  Belum ada data santri
                </td>
              </tr>
            ) : (
              santriList.map((santri) => (
                <tr key={santri.id} className="border-t">
                  <td className="p-4">{santri.nama}</td>
                  <td className="p-4">{santri.nis}</td>
                  <td className="p-4">{santri.kelas}</td>
                  <td className="p-4">{santri.asrama}</td>
                  <td className="p-4">
                    <div>{santri.namaAyah || '-'}</div>
                    {santri.noHpAyah && (
                      <div className="text-xs text-gray-500">
                        {santri.noHpAyah}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div>{santri.namaIbu || '-'}</div>
                    {santri.noHpIbu && (
                      <div className="text-xs text-gray-500">
                        {santri.noHpIbu}
                      </div>
                    )}
                  </td>
                  <td className="p-4">{santri.status}</td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <button
                        onClick={() => bukaEdit(santri.id)}
                        className="text-sm text-blue-600 underline"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={() => bukaAkunWali(santri.id)}
                        className="text-sm text-blue-600 underline"
                      >
                        Buat/Reset Akun Wali
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
