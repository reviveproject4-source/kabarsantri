import React from 'react';
import { useAuth } from './AuthContext';
import { useSetPaket } from './hooks/useYayasan';

const NOMOR_WA_MINARA = '6281215566630';

export function ModulPaket() {
  const { yayasan, muatUlangYayasan } = useAuth();
  const { mutate: setPaket } = useSetPaket();

  const paket = yayasan?.paket ?? 'Gratis';

  const ubahPaket = (paketBaru: 'Gratis' | 'Premium') => {
    if (!yayasan) return;

    setPaket(
      { yayasanId: yayasan.id, paket: paketBaru },
      {
        onSuccess: () => muatUlangYayasan(),
        onError: (err) => {
          const pesan =
            err instanceof Error
              ? err.message
              : err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : String(err);
          alert(`Gagal mengubah status paket: ${pesan}`);
        },
      }
    );
  };

  const bukaWhatsApp = () => {
    const pesan = [
      "Assalamua'laikum Warahmatullahi Wabarakatuh,",
      '',
      `Nama: ${yayasan?.namaPenanggungJawab || '-'}`,
      `Yayasan: ${yayasan?.namaYayasan || '-'}`,
      `Email: ${yayasan?.email || '-'}`,
      `No Kontak: ${yayasan?.noHp || '-'}`,
      '',
      'Ingin aktivasi paket premium.',
      '',
      'Mohon Bantuannya',
      '',
      'Wassalam,',
    ].join('\n');

    window.open(
      `https://wa.me/${NOMOR_WA_MINARA}?text=${encodeURIComponent(pesan)}`,
      '_blank'
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Paket & Langganan</h1>
      <p className="text-sm text-gray-500 mb-6">
        Status paket ini menentukan fitur yang terbuka untuk Wali Santri.
      </p>

      <div className="bg-white rounded-2xl border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Paket Aktif</p>
            <p className="text-2xl font-bold">{paket}</p>
          </div>

          {paket === 'Premium' && (
            <button
              onClick={() => ubahPaket('Gratis')}
              className="border px-4 py-2 rounded-xl text-gray-600"
            >
              Turunkan ke Gratis
            </button>
          )}
        </div>

        {paket === 'Gratis' && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Untuk mengaktifkan Paket Premium, hubungi admin Minara via
              WhatsApp. Tim kami akan membantu proses aktivasinya.
            </p>

            <button
              onClick={bukaWhatsApp}
              className="bg-green-600 text-white px-4 py-2 rounded-xl mb-3"
            >
              💬 Hubungi Admin via WhatsApp
            </button>

            <div>
              <button
                onClick={() => ubahPaket('Premium')}
                className="text-xs text-gray-400 underline"
              >
                Sudah dikonfirmasi admin? Tandai sebagai Premium (simulasi
                demo)
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Fitur Wali Santri</th>
              <th className="p-4 text-left">Gratis</th>
              <th className="p-4 text-left">Premium</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-4">Presensi Ananda</td>
              <td className="p-4">✅</td>
              <td className="p-4">✅</td>
            </tr>
            <tr className="border-t">
              <td className="p-4">Hafalan Ananda</td>
              <td className="p-4">✅</td>
              <td className="p-4">✅</td>
            </tr>
            <tr className="border-t">
              <td className="p-4">Karakter & Akhlak</td>
              <td className="p-4">🔒</td>
              <td className="p-4">✅</td>
            </tr>
            <tr className="border-t">
              <td className="p-4">SPP</td>
              <td className="p-4">🔒</td>
              <td className="p-4">✅</td>
            </tr>
            <tr className="border-t">
              <td className="p-4">Izin Pulang</td>
              <td className="p-4">🔒</td>
              <td className="p-4">✅</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Catatan: tombol "Tandai sebagai Premium" adalah simulasi untuk
        kebutuhan demo, belum terhubung ke sistem pembayaran/aktivasi
        sungguhan.
      </p>
    </div>
  );
}
