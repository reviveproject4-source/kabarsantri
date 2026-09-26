import React from 'react';
import { useAuth } from './AuthContext';
import { useSetPaket } from './hooks/useYayasan';
import { openDirectWA } from './teleponUtils';

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
        onError: (err: any) => {
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

    openDirectWA(NOMOR_WA_MINARA, pesan);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Paket & Langganan</h1>
      <p className="text-sm text-gray-500 mb-6">
        Status paket ini menentukan fitur yang terbuka untuk Wali Santri.
      </p>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status Paket Aktif</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{paket}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                paket === 'Premium' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {paket === 'Premium' ? '👑 Mode White-Label Active' : 'Gratis'}
              </span>
            </div>
          </div>

          {paket === 'Premium' && (
            <button
              onClick={() => ubahPaket('Gratis')}
              className="border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-xl text-slate-600 font-semibold text-xs transition"
            >
              Simulasikan Turun ke Gratis
            </button>
          )}
        </div>

        {paket === 'Gratis' && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-600 mb-3">
              Untuk mengaktifkan Paket Premium & membuka fitur **White-Label Logo Custom + Alamat Lembaga**, hubungi admin via WhatsApp.
            </p>

            <button
              onClick={bukaWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 mb-3 transition active:scale-95"
            >
              <span>💬</span> Hubungi Admin via WhatsApp
            </button>

            <div>
              <button
                onClick={() => ubahPaket('Premium')}
                className="text-xs text-[#0A4ABF] hover:underline font-semibold"
              >
                Aktivasi Langsung Mode Premium (Simulasi Demo Custom Logo)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* White-Label Settings Panel (Khusus Premium) */}
      {paket === 'Premium' && (
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 mb-6 shadow-lg border border-blue-600/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#0A4ABF] flex items-center justify-center text-xl font-bold border border-white/20">
              🎨
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Pengaturan Branding & Custom Logo (White-Label)</h2>
              <p className="text-xs text-blue-200">
                Fitur eksklusif Paket Premium: Ganti logo KabarSantri dengan Logo Resmi Yayasan & Alamat Lembaga Anda sendiri.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('✅ Branding Logo & Alamat Yayasan berhasil diperbarui di seluruh aplikasi!');
            }}
            className="space-y-4 text-xs pt-2"
          >
            <div>
              <label className="font-bold text-slate-300 block mb-1">URL Logo Resmi Yayasan / Sekolah (Link Gambar PNG/JPG)</label>
              <input
                type="text"
                placeholder="https://domain-yayasan.id/logo.png"
                defaultValue={yayasan?.logoUrl || ''}
                onChange={(e) => {
                  if (yayasan) {
                    yayasan.logoUrl = e.target.value;
                    muatUlangYayasan();
                  }
                }}
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 font-mono text-xs focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Contoh: Masukkan link gambar logo yayasan Anda. Jika dikosongkan, akan memakai Logo Default KabarSantri.
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Alamat Lengkap Lembaga / Pesantren</label>
              <textarea
                rows={2}
                placeholder="Jl. Pesantren No. 1, Kota / Kabupaten..."
                defaultValue={yayasan?.alamat || ''}
                onChange={(e) => {
                  if (yayasan) {
                    yayasan.alamat = e.target.value;
                    muatUlangYayasan();
                  }
                }}
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#0A4ABF] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#0A4ABF] hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition active:scale-95"
              >
                💾 Simpan Branding Lembaga
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Perbandingan Fitur */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/60">
            <tr>
              <th className="p-4 px-6">Fitur & Fasilitas</th>
              <th className="p-4 px-6">Paket Gratis</th>
              <th className="p-4 px-6">Paket Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            <tr className="hover:bg-slate-50">
              <td className="p-4 px-6 font-bold text-slate-800">Custom Logo Yayasan (White-Label)</td>
              <td className="p-4 px-6 text-slate-400">🔒 (Logo Default)</td>
              <td className="p-4 px-6 font-bold text-emerald-600">✅ Bebas Custom Logo Yayasan</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-4 px-6 font-bold text-slate-800">Alamat & Kop Surat Lembaga</td>
              <td className="p-4 px-6 text-slate-400">Standard</td>
              <td className="p-4 px-6 font-bold text-emerald-600">✅ Kop Surat Resmi Lembaga</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-4 px-6 font-bold text-slate-800">Google Chat Space Integration</td>
              <td className="p-4 px-6 text-emerald-600 font-bold">✅</td>
              <td className="p-4 px-6 text-emerald-600 font-bold">✅</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-4 px-6 font-bold text-slate-800">Presensi & Hafalan Santri</td>
              <td className="p-4 px-6 text-emerald-600 font-bold">✅</td>
              <td className="p-4 px-6 text-emerald-600 font-bold">✅</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-4 px-6 font-bold text-slate-800">Pembayaran SPP & Validasi Bukti Transfer</td>
              <td className="p-4 px-6 text-slate-400">🔒 Terkunci</td>
              <td className="p-4 px-6 text-emerald-600 font-bold">✅ Terbuka Akses Full</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
