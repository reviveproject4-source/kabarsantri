import React, { useMemo, useState } from 'react';
import {
  usePegawaiList,
  useTambahPegawai,
  useUbahPegawai,
} from './hooks/usePegawai';
import { useBuatAkun } from './hooks/useBuatAkun';
import { useSantriList } from './hooks/useSantri';
import { Pegawai } from './types';
import {
  tebakGenderDariJabatan,
  butuhGenderDiampu,
  nipValid,
  syaratPanjangNip,
  isJabatanMusyrif,
  isJabatanKesantrian,
} from './jabatanUtils';
import { InputPassword } from './InputPassword';
import { GrupKomunikasiCard } from './GrupKomunikasiCard';

const PANJANG_PASSWORD_PEGAWAI = 6;

function passwordPegawaiValid(password: string): boolean {
  return /^[0-9]+$/.test(password) && password.length === PANJANG_PASSWORD_PEGAWAI;
}

function hintPanjangNip(jabatan: string): string {
  const { min, max } = syaratPanjangNip(jabatan);
  return min === max ? `${min} digit` : `${min}-${max} digit`;
}

function pesanSyaratNip(jabatan: string): string {
  return `NIP harus angka, ${hintPanjangNip(jabatan)}.`;
}

function pesanError(err: unknown): string {
  return err instanceof Error
    ? err.message
    : err && typeof err === 'object' && 'message' in err
    ? String((err as { message: unknown }).message)
    : String(err);
}

const SARAN_JABATAN = [
  'Kepala Sekolah',
  'Guru',
  'Musyrif',
  'Musyrifah',
  'Kesantrian Ikhwan',
  'Kesantrian Banin',
  'Kesantrian Akhwat',
  'Kesantrian Banat',
  'Keuangan',
  'Dapur',
  'Keamanan',
  'Kesehatan',
];

function KelasDiajarEditor({
  kelasDiajar,
  setKelasDiajar,
  aksesSemuaKelas,
  setAksesSemuaKelas,
  saran,
}: {
  kelasDiajar: string[];
  setKelasDiajar: (kelas: string[]) => void;
  aksesSemuaKelas: boolean;
  setAksesSemuaKelas: (nilai: boolean) => void;
  saran: string[];
}) {
  const baris = kelasDiajar.length === 0 ? [''] : kelasDiajar;

  const ubahBaris = (index: number, nilai: string) => {
    const salinan = [...baris];
    salinan[index] = nilai;
    setKelasDiajar(salinan);
  };

  const hapusBaris = (index: number) => {
    setKelasDiajar(baris.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-3">
      <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={aksesSemuaKelas}
          onChange={(e) => setAksesSemuaKelas(e.target.checked)}
        />
        Guru ini bisa akses semua kelas (mis. Guru Konseling/BK)
      </label>

      {!aksesSemuaKelas && (
        <div>
          <p className="text-xs text-gray-500 mb-1">
            Kelas yang diajar (ketik nama kelas, boleh lebih dari satu)
          </p>

          {baris.map((kelas, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                list="daftar-kelas"
                placeholder="Nama kelas, mis. 7A"
                value={kelas}
                onChange={(e) => ubahBaris(index, e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              {baris.length > 1 && (
                <button
                  type="button"
                  onClick={() => hapusBaris(index)}
                  className="px-3 border rounded-lg text-gray-500"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          <datalist id="daftar-kelas">
            {saran.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>

          <button
            type="button"
            onClick={() => setKelasDiajar([...baris, ''])}
            className="text-sm text-blue-600 underline"
          >
            + Tambah Kelas
          </button>
        </div>
      )}
    </div>
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

export function ModulPegawai() {
  const { data: pegawaiList = [] } = usePegawaiList();
  const { data: santriList = [] } = useSantriList();
  const { mutateAsync: tambahPegawai } = useTambahPegawai();
  const { mutateAsync: buatAkun } = useBuatAkun();
  const { mutateAsync: ubahPegawai } = useUbahPegawai();

  const [showForm, setShowForm] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pegawaiDiedit, setPegawaiDiedit] = useState<Pegawai | null>(null);
  const [menyimpanEdit, setMenyimpanEdit] = useState(false);
  const [namaEdit, setNamaEdit] = useState('');
  const [nipEdit, setNipEdit] = useState('');
  const [jabatanEdit, setJabatanEdit] = useState('');
  const [hpEdit, setHpEdit] = useState('');
  const [statusEdit, setStatusEdit] = useState('Aktif');
  const [kelasDiajarEdit, setKelasDiajarEdit] = useState<string[]>([]);
  const [aksesSemuaKelasEdit, setAksesSemuaKelasEdit] = useState(false);
  const [jenisKelaminDiampuEdit, setJenisKelaminDiampuEdit] = useState('');

  const [pegawaiAkun, setPegawaiAkun] = useState<Pegawai | null>(null);
  const [emailAkun, setEmailAkun] = useState('');
  const [passwordAkun, setPasswordAkun] = useState('');
  const [menyimpanAkun, setMenyimpanAkun] = useState(false);

  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [hp, setHp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kelasDiajar, setKelasDiajar] = useState<string[]>([]);
  const [aksesSemuaKelas, setAksesSemuaKelas] = useState(false);
  const [jenisKelaminDiampu, setJenisKelaminDiampu] = useState('');

  const jabatanOptions = useMemo(() => {
    const dariData = pegawaiList.map((p: any) => p.jabatan).filter(Boolean);
    return Array.from(new Set([...SARAN_JABATAN, ...dariData]));
  }, [pegawaiList]);

  const daftarKelas = useMemo(() => {
    const dariData = santriList.map((s: any) => s.kelas).filter(Boolean);
    return (Array.from(new Set(dariData)) as string[]).sort((a: string, b: string) => a.localeCompare(b));
  }, [santriList]);

  const rekapJabatan = useMemo(
    () => hitungRekap(pegawaiList.map((p: any) => p.jabatan)),
    [pegawaiList]
  );

  const grupKesantrianMusyrif = useMemo(
    () =>
      pegawaiList.filter(
        (p: any) => isJabatanKesantrian(p.jabatan) || isJabatanMusyrif(p.jabatan)
      ),
    [pegawaiList]
  );

  const grupKepsekGuru = useMemo(
    () =>
      pegawaiList.filter((p: any) => {
        const j = p.jabatan.trim().toLowerCase();
        return j === 'kepala sekolah' || j === 'guru';
      }),
    [pegawaiList]
  );

  const isJabatanGuru = jabatan.trim().toLowerCase() === 'guru';
  const isJabatanGuruEdit = jabatanEdit.trim().toLowerCase() === 'guru';

  const bersihkanKelas = (daftar: string[]) =>
    daftar.map((k) => k.trim()).filter((k) => k !== '');

  const resetForm = () => {
    setNama('');
    setNip('');
    setJabatan('');
    setHp('');
    setEmail('');
    setPassword('');
    setKelasDiajar([]);
    setAksesSemuaKelas(false);
    setJenisKelaminDiampu('');
  };

  const handleTambahPegawai = async () => {
    if (!nama || !jabatan) {
      alert('Lengkapi data pegawai');
      return;
    }

    if (!email || !password) {
      alert('Isi email dan password untuk akun login pegawai');
      return;
    }

    if (!passwordPegawaiValid(password)) {
      alert(`Password harus angka, ${PANJANG_PASSWORD_PEGAWAI} digit.`);
      return;
    }

    if (!nipValid(jabatan, nip)) {
      alert(pesanSyaratNip(jabatan));
      return;
    }

    if (nip && pegawaiList.some((p: any) => p.nip === nip)) {
      alert('NIP ini sudah dipakai pegawai lain. Gunakan NIP yang berbeda.');
      return;
    }

    if (butuhGenderDiampu(jabatan) && !jenisKelaminDiampu) {
      alert(
        'Jabatan ini wajib pilih "Santri Diampu" (Ikhwan/Akhwat) -- tidak boleh "Semua", supaya data santri tidak tercampur antar asrama/kelas.'
      );
      return;
    }

    setMenyimpan(true);

    try {
      const pegawaiId = await tambahPegawai({
        nama,
        nip,
        jabatan,
        hp,
        status: 'Aktif',
        kelasDiajar: isJabatanGuru ? bersihkanKelas(kelasDiajar) : [],
        aksesSemuaKelas: isJabatanGuru ? aksesSemuaKelas : false,
        jenisKelaminDiampu,
      });

      try {
        await buatAkun({ email, password, peran: 'pegawai', pegawaiId });
      } catch (err) {
        alert(`Pegawai tersimpan, tapi akun login gagal dibuat: ${pesanError(err)}`);
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      alert(`Gagal menyimpan data pegawai: ${pesanError(err)}`);
    } finally {
      setMenyimpan(false);
    }
  };

  const bukaEditPegawai = (pegawai: Pegawai) => {
    setPegawaiDiedit(pegawai);
    setNamaEdit(pegawai.nama);
    setNipEdit(pegawai.nip);
    setJabatanEdit(pegawai.jabatan);
    setHpEdit(pegawai.hp);
    setStatusEdit(pegawai.status);
    setKelasDiajarEdit(pegawai.kelasDiajar);
    setAksesSemuaKelasEdit(pegawai.aksesSemuaKelas);
    setJenisKelaminDiampuEdit(pegawai.jenisKelaminDiampu);
  };

  const handleSimpanPegawai = async () => {
    if (!pegawaiDiedit) return;

    if (!namaEdit || !jabatanEdit) {
      alert('Lengkapi data pegawai');
      return;
    }

    if (!nipValid(jabatanEdit, nipEdit)) {
      alert(pesanSyaratNip(jabatanEdit));
      return;
    }

    if (
      nipEdit &&
      pegawaiList.some((p: any) => p.nip === nipEdit && p.id !== pegawaiDiedit.id)
    ) {
      alert('NIP ini sudah dipakai pegawai lain. Gunakan NIP yang berbeda.');
      return;
    }

    if (butuhGenderDiampu(jabatanEdit) && !jenisKelaminDiampuEdit) {
      alert(
        'Jabatan ini wajib pilih "Santri Diampu" (Ikhwan/Akhwat) -- tidak boleh "Semua", supaya data santri tidak tercampur antar asrama/kelas.'
      );
      return;
    }

    setMenyimpanEdit(true);

    try {
      await ubahPegawai({
        id: pegawaiDiedit.id,
        input: {
          nama: namaEdit,
          nip: nipEdit,
          jabatan: jabatanEdit,
          hp: hpEdit,
          status: statusEdit,
          kelasDiajar: isJabatanGuruEdit ? bersihkanKelas(kelasDiajarEdit) : [],
          aksesSemuaKelas: isJabatanGuruEdit ? aksesSemuaKelasEdit : false,
          jenisKelaminDiampu: jenisKelaminDiampuEdit,
        },
      });
      setPegawaiDiedit(null);
    } catch (err) {
      alert(`Gagal menyimpan perubahan data pegawai: ${pesanError(err)}`);
    } finally {
      setMenyimpanEdit(false);
    }
  };

  const bukaAkunPegawai = (pegawai: Pegawai) => {
    setPegawaiAkun(pegawai);
    setEmailAkun(pegawai.email);
    setPasswordAkun('');
  };

  const handleBuatAkunPegawai = async () => {
    if (!pegawaiAkun) return;

    if (!emailAkun) {
      alert('Isi email untuk akun login pegawai');
      return;
    }

    if (!pegawaiAkun.email && !passwordAkun) {
      alert('Password wajib diisi untuk akun baru');
      return;
    }

    if (passwordAkun && !passwordPegawaiValid(passwordAkun)) {
      alert(`Password harus angka, ${PANJANG_PASSWORD_PEGAWAI} digit.`);
      return;
    }

    setMenyimpanAkun(true);

    try {
      await buatAkun({
        email: emailAkun,
        password: passwordAkun || undefined,
        peran: 'pegawai',
        pegawaiId: pegawaiAkun.id,
      });
      setPegawaiAkun(null);
    } catch (err) {
      alert(`Gagal membuat akun login: ${pesanError(err)}`);
    } finally {
      setMenyimpanAkun(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Pegawai</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          + Tambah Pegawai
        </button>
      </div>

      <div className="bg-white rounded-2xl border overflow-x-auto mb-6">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Nama</th>
              <th className="p-4 text-left">NIP</th>
              <th className="p-4 text-left">Jabatan</th>
              <th className="p-4 text-left">No HP</th>
              <th className="p-4 text-left">Email Login</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Kelas Diajar</th>
              <th className="p-4 text-left">Santri Diampu</th>
              <th className="p-4 text-left"></th>
            </tr>
          </thead>

          <tbody>
            {pegawaiList.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500">
                  Belum ada data pegawai
                </td>
              </tr>
            ) : (
              pegawaiList.map((pegawai: any) => {
                const jabatanGuru =
                  pegawai.jabatan.trim().toLowerCase() === 'guru';

                return (
                  <tr key={pegawai.id} className="border-t">
                    <td className="p-4">{pegawai.nama}</td>
                    <td className="p-4">{pegawai.nip || '-'}</td>
                    <td className="p-4">{pegawai.jabatan}</td>
                    <td className="p-4">{pegawai.hp}</td>
                    <td className="p-4">{pegawai.email || '-'}</td>
                    <td className="p-4">{pegawai.status}</td>
                    <td className="p-4">
                      {jabatanGuru
                        ? pegawai.aksesSemuaKelas
                          ? 'Semua Kelas'
                          : pegawai.kelasDiajar.length > 0
                          ? pegawai.kelasDiajar.join(', ')
                          : '-'
                        : '-'}
                    </td>
                    <td className="p-4">
                      {pegawai.jenisKelaminDiampu || 'Semua'}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <button
                          onClick={() => bukaEditPegawai(pegawai)}
                          className="text-sm text-blue-600 underline"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => bukaAkunPegawai(pegawai)}
                          className="text-sm text-blue-600 underline"
                        >
                          Buat/Reset Akun Login
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

      <div className="mb-6">
        <h3 className="font-semibold mb-1">
          Grup Komunikasi Internal (Google Chat)
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Daftar ini otomatis mengikuti jabatan pegawai. Salin email lalu
          tambahkan manual ke space Google Chat yang sesuai.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GrupKomunikasiCard
            judul="Kesantrian ↔ Musyrif & Musyrifah"
            deskripsi="Koordinasi harian seputar santri"
            anggota={grupKesantrianMusyrif}
          />
          <GrupKomunikasiCard
            judul="Kepala Sekolah ↔ Guru"
            deskripsi="Urusan akademik & kurikulum"
            anggota={grupKepsekGuru}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-x-auto">
        <h3 className="font-semibold p-4 border-b bg-slate-50">
          Rekap per Jabatan
        </h3>
        <table className="w-full">
          <tbody>
            {rekapJabatan.length === 0 ? (
              <tr>
                <td className="text-center p-6 text-gray-500">
                  Belum ada data jabatan
                </td>
              </tr>
            ) : (
              rekapJabatan.map(([nama, jumlah]) => (
                <tr key={nama} className="border-t">
                  <td className="p-3 pl-4">{nama}</td>
                  <td className="p-3 pr-4 text-right">{jumlah} pegawai</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tambah Pegawai</h2>

            <input
              type="text"
              placeholder="Nama Pegawai"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <input
              type="text"
              inputMode="numeric"
              maxLength={syaratPanjangNip(jabatan).max}
              placeholder={`NIP (opsional, ${hintPanjangNip(jabatan)})`}
              value={nip}
              onChange={(e) => setNip(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <input
              list="daftar-jabatan"
              placeholder="Pilih atau ketik Jabatan baru"
              value={jabatan}
              onChange={(e) => {
                setJabatan(e.target.value);
                const tebakan = tebakGenderDariJabatan(e.target.value);
                if (tebakan) setJenisKelaminDiampu(tebakan);
              }}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <datalist id="daftar-jabatan">
              {jabatanOptions.map((j) => (
                <option key={j} value={j} />
              ))}
            </datalist>

            {isJabatanGuru && (
              <KelasDiajarEditor
                kelasDiajar={kelasDiajar}
                setKelasDiajar={setKelasDiajar}
                aksesSemuaKelas={aksesSemuaKelas}
                setAksesSemuaKelas={setAksesSemuaKelas}
                saran={daftarKelas}
              />
            )}

            <select
              value={jenisKelaminDiampu}
              onChange={(e) => setJenisKelaminDiampu(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            >
              <option value="">Santri Diampu: Semua (Ikhwan & Akhwat)</option>
              <option value="Ikhwan">Santri Diampu: Ikhwan saja</option>
              <option value="Akhwat">Santri Diampu: Akhwat saja</option>
            </select>

            <input
              type="text"
              placeholder="Nomor HP"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <p className="text-xs text-gray-500 mb-2">
              Akun login pegawai (dipakai untuk masuk ke KabarSantri)
            </p>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <InputPassword
              placeholder={`Password (${PANJANG_PASSWORD_PEGAWAI} digit angka)`}
              value={password}
              onChange={(e) =>
                setPassword(e.target.value.replace(/[^0-9]/g, ''))
              }
              inputMode="numeric"
              maxLength={PANJANG_PASSWORD_PEGAWAI}
              className="mb-4"
            />

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
                onClick={handleTambahPegawai}
                disabled={menyimpan}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {menyimpan ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pegawaiDiedit && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ubah Pegawai</h2>

            <input
              type="text"
              placeholder="Nama Pegawai"
              value={namaEdit}
              onChange={(e) => setNamaEdit(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <input
              type="text"
              inputMode="numeric"
              maxLength={syaratPanjangNip(jabatanEdit).max}
              placeholder={`NIP (opsional, ${hintPanjangNip(jabatanEdit)})`}
              value={nipEdit}
              onChange={(e) => setNipEdit(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <input
              list="daftar-jabatan"
              placeholder="Pilih atau ketik Jabatan baru"
              value={jabatanEdit}
              onChange={(e) => {
                setJabatanEdit(e.target.value);
                const tebakan = tebakGenderDariJabatan(e.target.value);
                if (tebakan) setJenisKelaminDiampuEdit(tebakan);
              }}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <input
              type="text"
              placeholder="Nomor HP"
              value={hpEdit}
              onChange={(e) => setHpEdit(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <select
              value={statusEdit}
              onChange={(e) => setStatusEdit(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>

            {isJabatanGuruEdit && (
              <KelasDiajarEditor
                kelasDiajar={kelasDiajarEdit}
                setKelasDiajar={setKelasDiajarEdit}
                aksesSemuaKelas={aksesSemuaKelasEdit}
                setAksesSemuaKelas={setAksesSemuaKelasEdit}
                saran={daftarKelas}
              />
            )}

            <select
              value={jenisKelaminDiampuEdit}
              onChange={(e) => setJenisKelaminDiampuEdit(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            >
              <option value="">Santri Diampu: Semua (Ikhwan & Akhwat)</option>
              <option value="Ikhwan">Santri Diampu: Ikhwan saja</option>
              <option value="Akhwat">Santri Diampu: Akhwat saja</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPegawaiDiedit(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={handleSimpanPegawai}
                disabled={menyimpanEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {menyimpanEdit ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pegawaiAkun && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-1">Buat/Reset Akun Login</h2>
            <p className="text-sm text-gray-500 mb-4">{pegawaiAkun.nama}</p>
            <p className="text-xs text-gray-500 mb-2">
              Kalau akun dengan email ini sudah pernah ada, gunakan email
              yang berbeda (tiap akun login harus punya email unik).
            </p>

            <input
              type="email"
              placeholder="Email"
              value={emailAkun}
              onChange={(e) => setEmailAkun(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            <InputPassword
              placeholder={`Password baru (${PANJANG_PASSWORD_PEGAWAI} digit angka -- kosongkan jika tidak ingin mengubah)`}
              value={passwordAkun}
              onChange={(e) =>
                setPasswordAkun(e.target.value.replace(/[^0-9]/g, ''))
              }
              inputMode="numeric"
              maxLength={PANJANG_PASSWORD_PEGAWAI}
              className="mb-1"
            />
            <p className="text-xs text-gray-400 mb-4">
              Untuk akun yang belum pernah dibuat sama sekali, password wajib
              diisi.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPegawaiAkun(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={handleBuatAkunPegawai}
                disabled={menyimpanAkun}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {menyimpanAkun ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
