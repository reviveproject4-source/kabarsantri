import React, { useEffect, useMemo, useState } from 'react';
import { Santri } from './types';

interface Props {
  santriList: Santri[];
  value: string;
  onChange: (santriId: string) => void;
}

export function PemilihSantri({ santriList, value, onChange }: Props) {
  const [kelasDipilih, setKelasDipilih] = useState('');

  const daftarKelas = useMemo(
    () =>
      Array.from(new Set(santriList.map((s) => s.kelas).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [santriList]
  );

  const santriTersaring = kelasDipilih
    ? santriList.filter((s) => s.kelas === kelasDipilih)
    : [];

  // Kalau kelas dipilih ulang (atau daftar santri berubah, mis. filter
  // gender pegawai ganti), pastikan santri yang lagi dipilih masih valid.
  useEffect(() => {
    if (value && !santriTersaring.some((s) => String(s.id) === value)) {
      onChange('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kelasDipilih, santriList]);

  return (
    <>
      <select
        value={kelasDipilih}
        onChange={(e) => setKelasDipilih(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-3"
      >
        <option value="">Pilih Kelas</option>
        {daftarKelas.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!kelasDipilih}
        className="w-full border rounded-lg px-3 py-2 mb-3 disabled:bg-gray-100"
      >
        <option value="">
          {kelasDipilih ? 'Pilih Santri' : 'Pilih kelas dulu'}
        </option>
        {santriTersaring.map((santri) => (
          <option key={santri.id} value={santri.id}>
            {santri.nama}
          </option>
        ))}
      </select>
    </>
  );
}
