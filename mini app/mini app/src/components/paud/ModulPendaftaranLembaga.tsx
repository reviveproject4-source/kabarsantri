import React, { useState } from 'react';
import { dataService, PendaftaranLembagaPayload } from '../../services/dataService';
import { soundFx } from '../../utils/soundEffects';

interface ModulPendaftaranLembagaProps {
  onBackToLogin: () => void;
}

export const ModulPendaftaranLembaga: React.FC<ModulPendaftaranLembagaProps> = ({ onBackToLogin }) => {
  const [namaYayasan, setNamaYayasan] = useState('');
  const [namaUnit, setNamaUnit] = useState('');
  const [jenisUnit, setJenisUnit] = useState<'KB' | 'TPA' | 'SPS' | 'TK' | 'RA'>('TK');
  const [npsn, setNpsn] = useState('');
  const [alamat, setAlamat] = useState('');
  const [namaPenanggungJawab, setNamaPenanggungJawab] = useState('');
  const [jabatanPenanggungJawab, setJabatanPenanggungJawab] = useState('');
  const [kontak, setKontak] = useState('');
  const [perkiraanJumlahMurid, setPerkiraanJumlahMurid] = useState(30);
  const [setujuPersetujuanWali, setSetujuPersetujuanWali] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ isSuccess: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaYayasan || !namaUnit || !namaPenanggungJawab || !jabatanPenanggungJawab || !kontak) {
      soundFx.playTryAgain();
      setResultMessage({ isSuccess: false, text: 'Mohon lengkapi seluruh field wajib.' });
      return;
    }

    if (!setujuPersetujuanWali) {
      soundFx.playTryAgain();
      setResultMessage({ isSuccess: false, text: 'Anda wajib menyetujui pernyataan persetujuan wali murid.' });
      return;
    }

    setLoading(true);
    setResultMessage(null);

    const payload: PendaftaranLembagaPayload = {
      namaYayasan,
      namaUnit,
      jenisUnit,
      npsn: npsn.trim() || undefined,
      alamat: alamat.trim() || undefined,
      namaPenanggungJawab,
      jabatanPenanggungJawab,
      kontak,
      perkiraanJumlahMurid,
      setujuPersetujuanWali
    };

    const res = await dataService.daftarLembagaPublik(payload);
    setLoading(false);

    if (res.success) {
      soundFx.playSuccess();
      setResultMessage({ isSuccess: true, text: res.message });
      // Reset Form
      setNamaYayasan('');
      setNamaUnit('');
      setNpsn('');
      setAlamat('');
      setNamaPenanggungJawab('');
      setJabatanPenanggungJawab('');
      setKontak('');
      setSetujuPersetujuanWali(false);
    } else {
      soundFx.playTryAgain();
      setResultMessage({ isSuccess: false, text: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="max-w-2xl w-full bg-white text-slate-900 rounded-3xl shadow-2xl p-6 md:p-8 border-4 border-indigo-300 space-y-6">
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
              Form Resmi Pendaftaran Lembaga PAUD / TK
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-indigo-950 mt-2">
              Aktivasi CeritaAnanda PAUD
            </h2>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              Diisi oleh Pihak Yayasan atau Penanggung Jawab Lembaga yang berwenang.
            </p>
          </div>
          <button
            onClick={onBackToLogin}
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl shadow border"
          >
            ⬅️ Kembali ke Login
          </button>
        </div>

        {resultMessage && (
          <div className={`p-4 rounded-2xl border-2 font-bold text-xs ${
            resultMessage.isSuccess ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            {resultMessage.isSuccess ? '✅ ' : '⚠️ '} {resultMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-slate-800 mb-1">Nama Yayasan / Pengelola *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Yayasan Cendekia Mulia"
                value={namaYayasan}
                onChange={(e) => setNamaYayasan(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block font-black text-slate-800 mb-1">Nama Unit Sekolah *</label>
              <input
                type="text"
                required
                placeholder="Contoh: TK Islam Cendekia"
                value={namaUnit}
                onChange={(e) => setNamaUnit(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-black text-slate-800 mb-1">Jenis Jenjang *</label>
              <select
                value={jenisUnit}
                onChange={(e) => setJenisUnit(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold bg-slate-50"
              >
                <option value="TK">TK (Taman Kanak-Kanak)</option>
                <option value="KB">KB (Kelompok Bermain)</option>
                <option value="RA">RA (Raudhatul Athfal)</option>
                <option value="TPA">TPA (Penitipan Anak)</option>
                <option value="SPS">SPS (Satuan PAUD Sejenis)</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-800 mb-1">NPSN (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: 69823456"
                value={npsn}
                onChange={(e) => setNpsn(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-black text-slate-800 mb-1">Perkiraan Jumlah Murid</label>
              <input
                type="number"
                min="5"
                max="500"
                value={perkiraanJumlahMurid}
                onChange={(e) => setPerkiraanJumlahMurid(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-slate-800 mb-1">Alamat Lembaga</label>
            <input
              type="text"
              placeholder="Jl. Utama Pendidikan No. 12"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-black text-slate-800 mb-1">Nama Penanggung Jawab *</label>
              <input
                type="text"
                required
                placeholder="Drs. H. Ahmad"
                value={namaPenanggungJawab}
                onChange={(e) => setNamaPenanggungJawab(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-black text-slate-800 mb-1">Jabatan Penandatangan *</label>
              <input
                type="text"
                required
                placeholder="Ketua Yayasan / Kepala Sekolah"
                value={jabatanPenanggungJawab}
                onChange={(e) => setJabatanPenanggungJawab(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-black text-slate-800 mb-1">Kontak (No HP/WhatsApp) *</label>
              <input
                type="text"
                required
                placeholder="08123456789"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>
          </div>

          {/* PERNYATAAN PERSETUJUAN WALI MURID (BAGIAN 1 & 5 PROMPT 13) */}
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2 mt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={setujuPersetujuanWali}
                onChange={(e) => setSetujuPersetujuanWali(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-400"
              />
              <span className="text-amber-950 font-extrabold text-xs leading-relaxed">
                "Kami menyatakan telah memperoleh persetujuan orang tua atau wali murid untuk pencatatan data anak, dan bertanggung jawab penuh atas hal tersebut." *
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base rounded-2xl shadow-xl transition-transform active:scale-95 border-2 border-indigo-400"
          >
            {loading ? 'Mengirim Pendaftaran...' : '🚀 Kirim Permohonan Aktivasi Lembaga'}
          </button>
        </form>
      </div>
    </div>
  );
};
