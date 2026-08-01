import React, { useState } from 'react';
import { CatatanObservasiHarian, DomainUtamaKurikulum, RekapMuridPaud } from '../../types/paudTypes';
import { soundFx } from '../../utils/soundEffects';

interface GaleriPerkembanganAnakProps {
  murid: RekapMuridPaud;
  catatanObservasiList: CatatanObservasiHarian[];
}

export const GaleriPerkembanganAnak: React.FC<GaleriPerkembanganAnakProps> = ({
  murid,
  catatanObservasiList
}) => {
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<DomainUtamaKurikulum | 'semua'>('semua');
  const [previewFotoUrl, setPreviewFotoUrl] = useState<string | null>(null);

  // Filter observations for this student
  const studentObsList = catatanObservasiList.filter((o) => o.muridId === murid.id);

  const filteredObsList = selectedDomainFilter === 'semua'
    ? studentObsList
    : studentObsList.filter((o) => o.domainUtama === selectedDomainFilter);

  const getStatusBadge = (status: string) => {
    if (status === 'muncul_sendiri') return { label: '🟢 Muncul Sendiri (Mandiri)', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    if (status === 'mulai_muncul') return { label: '🟡 Mulai Muncul (Dengan Diingatkan)', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    return { label: '🔴 Belum Terlihat', color: 'bg-rose-100 text-rose-900 border-rose-300' };
  };

  const getDomainLabel = (domain: string) => {
    if (domain === 'logika') return { label: '🧠 Logika & Kognitif', color: 'bg-amber-500 text-white' };
    if (domain === 'motorik_halus') return { label: '✍️ Motorik Halus', color: 'bg-pink-500 text-white' };
    if (domain === 'motorik_kasar_olahraga') return { label: '🏃‍♂️ Motorik Kasar & Olahraga', color: 'bg-sky-500 text-white' };
    if (domain === 'sosial_bahasa') return { label: '💬 Sosial-Emosional & Bahasa', color: 'bg-purple-500 text-white' };
    return { label: '🤲 Nilai Agama & Akhlak', color: 'bg-emerald-500 text-white' };
  };

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-sm space-y-6">
      {/* Header Galeri & Student Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl p-2 bg-indigo-50 rounded-2xl">{murid.fotoEmoji}</span>
          <div>
            <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider">Jurnal & Dokumentasi Foto</span>
            <h3 className="text-2xl font-black text-slate-900">Galeri Tumbuh Kembang {murid.nama}</h3>
            <p className="text-xs text-slate-500">Rekam jejak observasi harian, capaian indikator, dan foto kegiatan di sekolah.</p>
          </div>
        </div>

        {/* DOMAIN FILTER TABS */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
          {[
            { id: 'semua', label: 'Semua Domain' },
            { id: 'logika', label: '🧠 Logika' },
            { id: 'motorik_halus', label: '✍️ Halus' },
            { id: 'motorik_kasar_olahraga', label: '🏃‍♂️ Kasar' },
            { id: 'sosial_bahasa', label: '💬 Sos-Bahasa' },
            { id: 'agama_akhlak', label: '🤲 Agama' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { soundFx.playPop(); setSelectedDomainFilter(tab.id as DomainUtamaKurikulum | 'semua'); }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedDomainFilter === tab.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TIMELINE RIWAYAT OBSERVASI */}
      {filteredObsList.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
          <span className="text-5xl">📷</span>
          <h4 className="font-bold text-slate-700">Belum Ada Dokumentasi / Catatan Observasi</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Gunakan lembar observasi harian di Dashboard Guru untuk menginput pengamatan dan mencantumkan foto kegiatan murid.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total {filteredObsList.length} Catatan Observasi Tersimpan:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredObsList.map((obs) => {
              const badge = getStatusBadge(obs.status);
              const domainInfo = getDomainLabel(obs.domainUtama);
              return (
                <div key={obs.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${domainInfo.color}`}>
                      {domainInfo.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      🗓️ {obs.tanggal} • Bulan #{obs.bulan} Mg #{obs.mingguKe}
                    </span>
                  </div>

                  {obs.kegiatanJudul && (
                    <h4 className="font-black text-slate-900 text-sm">{obs.kegiatanJudul}</h4>
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {obs.catatanGuru && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                      💬 <strong>Catatan Guru:</strong> "{obs.catatanGuru}"
                    </div>
                  )}

                  {/* LAMPIRAN FOTO DOKUMENTASI */}
                  {obs.fotoUrl && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">📷 Dokumentasi Foto:</span>
                      <img
                        src={obs.fotoUrl}
                        alt="Foto Observasi Kegiatan"
                        onClick={() => setPreviewFotoUrl(obs.fotoUrl || null)}
                        className="w-full h-44 object-cover rounded-xl border-2 border-indigo-200 cursor-pointer hover:opacity-90 transition-opacity shadow-inner"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL PREVIEW FOTO UUKURAN BESAR */}
      {previewFotoUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-white p-4 rounded-3xl space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-slate-800 text-sm">Pratinjau Foto Kegiatan</span>
              <button
                onClick={() => setPreviewFotoUrl(null)}
                className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Tutup ❌
              </button>
            </div>
            <img src={previewFotoUrl} alt="Preview Foto Besar" className="w-full max-h-[75vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
