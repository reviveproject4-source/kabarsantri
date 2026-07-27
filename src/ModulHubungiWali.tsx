import React, { useState } from 'react';
import { Santri } from './types';
import { useSantriList } from './hooks/useSantri';
import { PemilihSantri } from './PemilihSantri';
import { normalisasiNomorHp } from './teleponUtils';

interface Props {
  jenisKelaminDiampu: string;
}

function bukaWhatsApp(nomor: string, santri: Santri, pesan: string) {
  const nomorRapi = normalisasiNomorHp(nomor);
  const teks = [
    "Assalamua'laikum Warahmatullahi Wabarakatuh,",
    '',
    `Yth. Bapak/Ibu Wali dari ananda ${santri.nama},`,
    '',
    pesan,
    '',
    'Wassalam,',
    'Kesantrian',
  ].join('\n');

  window.open(
    `https://wa.me/${nomorRapi}?text=${encodeURIComponent(teks)}`,
    '_blank'
  );
}

export function ModulHubungiWali({ jenisKelaminDiampu }: Props) {
  const { data: santriListSemua = [] } = useSantriList();
  const santriList = santriListSemua.filter(
    (s) => !jenisKelaminDiampu || s.jenisKelamin === jenisKelaminDiampu
  );

  const [santriId, setSantriId] = useState('');
  const [pesan, setPesan] = useState('');

  const santriDipilih = santriList.find((s) => String(s.id) === santriId);

  const kirim = (nomor: string) => {
    if (!santriDipilih) {
      alert('Pilih santri dulu');
      return;
    }
    if (!pesan) {
      alert('Tulis pesan dulu');
      return;
    }
    bukaWhatsApp(nomor, santriDipilih, pesan);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Hubungi Wali Santri</h1>
      <p className="text-sm text-gray-500 mb-6">
        Kirim pesan langsung ke wali santri lewat WhatsApp -- misalnya untuk
        hal seputar kesehatan santri, atau hal lain yang perlu dibicarakan.
      </p>

      <div className="bg-white p-6 rounded-2xl border">
        <PemilihSantri
          santriList={santriList}
          value={santriId}
          onChange={setSantriId}
        />

        <textarea
          placeholder="Tulis pesan untuk wali santri..."
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          rows={5}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        {santriDipilih && (
          <div className="flex flex-wrap gap-2">
            {santriDipilih.noHpAyah && (
              <button
                onClick={() => kirim(santriDipilih.noHpAyah)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                💬 Kirim ke Ayah ({santriDipilih.noHpAyah})
              </button>
            )}
            {santriDipilih.noHpIbu && (
              <button
                onClick={() => kirim(santriDipilih.noHpIbu)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                💬 Kirim ke Ibu ({santriDipilih.noHpIbu})
              </button>
            )}
            {!santriDipilih.noHpAyah && !santriDipilih.noHpIbu && (
              <p className="text-sm text-gray-400">
                Nomor HP Ayah/Ibu belum diisi di Data Master Santri.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
