import { useEffect, useState } from 'react';
import { samaKelas } from '../kelasUtils';

export function useKelasAktif(kelasDiajar: string[]) {
  const [kelasAktif, setKelasAktif] = useState(kelasDiajar[0] ?? '');

  useEffect(() => {
    if (
      kelasDiajar.length > 0 &&
      !kelasDiajar.some((k) => samaKelas(k, kelasAktif))
    ) {
      setKelasAktif(kelasDiajar[0]);
    }
  }, [kelasDiajar, kelasAktif]);

  return [kelasAktif, setKelasAktif] as const;
}
