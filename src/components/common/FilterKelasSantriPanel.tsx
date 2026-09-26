import React from 'react';
import { Santri, StatusPresensi } from '../../types';

interface FilterKelasSantriPanelProps {
  roleTitle: string; // e.g. "Guru", "Kesantrian", "Musyrif"
  labelScope?: string; // e.g. "Pilih Kelas" or "Pilih Scope / Asrama"
  labelSantri?: string; // default "Pilih Santri"
  availableScopes: string[];
  selectedScope: string;
  onScopeChange: (scope: string) => void;
  santriInScope: Santri[];
  selectedSantriId: string;
  onSantriChange: (santriId: string) => void;
  genderFilter?: 'Semua' | 'Laki-Laki' | 'Perempuan';
  onGenderFilterChange?: (gender: 'Semua' | 'Laki-Laki' | 'Perempuan') => void;
  showGenderFilter?: boolean;
  presensiHariIniMap?: Map<number, StatusPresensi>;
  onDirectPresensi?: (santriId: number, status: StatusPresensi) => void;
  onOpenTahfidzModal?: (santriId: string) => void;
  onOpenAkhlakModal?: (santriId: string) => void;
  onOpenRewardModal?: (santriId: string) => void;
}

export function FilterKelasSantriPanel({
  roleTitle,
  labelScope = 'Pilih Kelas',
  labelSantri = 'Pilih Santri',
  availableScopes,
  selectedScope,
  onScopeChange,
  santriInScope,
  selectedSantriId,
  onSantriChange,
  genderFilter = 'Semua',
  onGenderFilterChange,
  showGenderFilter = true,
  presensiHariIniMap,
  onDirectPresensi,
  onOpenTahfidzModal,
  onOpenAkhlakModal,
  onOpenRewardModal,
}: FilterKelasSantriPanelProps) {
  const selectedSantri = santriInScope.find((s) => String(s.id) === String(selectedSantriId));

  const handleScopeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newScope = e.target.value;
    onScopeChange(newScope);
    // DEPENDENT FILTER RULE: Reset santri selection when class/scope changes!
    onSantriChange('');
  };

  const handleSantriSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSantriChange(e.target.value);
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
      {/* Header & Optional Gender Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Filter Dependent Kelas &amp; Santri ({roleTitle})</h3>
            <p className="text-xs text-slate-400">Pilih kelas terlebih dahulu untuk memuat santri sesuai scope permission</p>
          </div>
        </div>

        {showGenderFilter && onGenderFilterChange && (
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto">
            {(['Semua', 'Laki-Laki', 'Perempuan'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onGenderFilterChange(g)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  genderFilter === g
                    ? 'bg-[#0A4ABF] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g === 'Semua' ? '🌐 Semua' : g === 'Laki-Laki' ? '👦 Laki-laki' : '👧 Perempuan'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dependent Dropdowns Container: Vertical on mobile, Horizontal on desktop */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Dropdown 1: Pilih Kelas / Scope */}
        <div className="flex-1 space-y-1">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
            1. {labelScope}
          </label>
          <select
            value={selectedScope}
            onChange={handleScopeSelect}
            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all"
          >
            {availableScopes.length === 0 ? (
              <option value="">Belum ada kelas yang tersedia.</option>
            ) : (
              <>
                <option value="">-- {labelScope} --</option>
                {availableScopes.map((scope) => (
                  <option key={scope} value={scope}>
                    {scope}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Arrow Separator for Desktop */}
        <div className="hidden md:flex items-center justify-center text-slate-300 font-bold text-xl pt-5">
          ➔
        </div>

        {/* Dropdown 2: Pilih Santri */}
        <div className="flex-1 space-y-1">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
            2. {labelSantri}
          </label>
          <select
            value={selectedSantriId}
            onChange={handleSantriSelect}
            disabled={!selectedScope || availableScopes.length === 0}
            className={`w-full border rounded-2xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all ${
              !selectedScope || availableScopes.length === 0
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-slate-50 text-slate-800 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          >
            {!selectedScope ? (
              <option value="">Pilih kelas terlebih dahulu</option>
            ) : santriInScope.length === 0 ? (
              <option value="">Belum ada santri pada kelas ini.</option>
            ) : (
              <>
                <option value="">-- {labelSantri} --</option>
                {santriInScope.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nis || s.kelas})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      {/* Santri Status / Empty State Prompt Banner */}
      <div className="pt-2">
        {!selectedScope ? (
          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-center">
            <p className="text-xs font-semibold text-amber-800 flex items-center justify-center gap-1.5">
              <span>⚠️</span> Pilih kelas terlebih dahulu
            </p>
          </div>
        ) : santriInScope.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
            <p className="text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5">
              <span>ℹ️</span> Belum ada santri pada kelas ini.
            </p>
          </div>
        ) : !selectedSantri ? (
          <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-base">🎓</span>
              <div>
                <p className="text-xs font-bold text-blue-900">
                  Pilih santri untuk melihat detail.
                </p>
                <p className="text-[11px] text-blue-700">
                  Menampilkan total <span className="font-bold">{santriInScope.length} santri</span> pada kelas{' '}
                  <span className="font-bold text-blue-950">{selectedScope}</span>.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-white px-3 py-1 rounded-xl border border-blue-200 shadow-sm self-start sm:self-auto">
              {santriInScope.length} Santri Terdaftar
            </span>
          </div>
        ) : (
          /* ACTIVE SELECTED SANTRI FOCUS CARD */
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-lg shadow-md shrink-0">
                  {selectedSantri.nama[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-900 text-base">{selectedSantri.nama}</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      Aktif Focus
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium flex flex-wrap items-center gap-2 mt-0.5">
                    <span>NIS: <strong className="font-mono">{selectedSantri.nis || '-'}</strong></span>
                    <span>•</span>
                    <span>Kelas: <strong>{selectedSantri.kelas}</strong></span>
                    {selectedSantri.asrama && (
                      <>
                        <span>•</span>
                        <span>Asrama: <strong>{selectedSantri.asrama}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Presensi Badge if available */}
              {presensiHariIniMap && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-slate-500 font-medium">Presensi Hari Ini:</span>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                      presensiHariIniMap.get(selectedSantri.id) === 'Hadir'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : presensiHariIniMap.get(selectedSantri.id) === 'Sakit'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : presensiHariIniMap.get(selectedSantri.id) === 'Izin'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : presensiHariIniMap.get(selectedSantri.id) === 'Alfa'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {presensiHariIniMap.get(selectedSantri.id) || 'Belum Diabsen'}
                  </span>
                </div>
              )}
            </div>

            {/* Direct Activity Action Buttons for Selected Santri */}
            <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Aksi Langsung Santri Ini:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* Direct Presensi Toggle Buttons */}
                {onDirectPresensi && (
                  <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm gap-1">
                    {(['Hadir', 'Sakit', 'Izin', 'Alfa'] as const).map((st) => {
                      const isSelected = presensiHariIniMap?.get(selectedSantri.id) === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => onDirectPresensi(selectedSantri.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            isSelected
                              ? st === 'Hadir'
                                ? 'bg-emerald-600 text-white shadow'
                                : st === 'Alfa'
                                ? 'bg-rose-600 text-white shadow'
                                : 'bg-amber-500 text-white shadow'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                )}

                {onOpenTahfidzModal && (
                  <button
                    type="button"
                    onClick={() => onOpenTahfidzModal(String(selectedSantri.id))}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition flex items-center gap-1"
                  >
                    <span>📖</span> + Setoran
                  </button>
                )}

                {onOpenAkhlakModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAkhlakModal(String(selectedSantri.id))}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition flex items-center gap-1"
                  >
                    <span>🌱</span> + Adab
                  </button>
                )}

                {onOpenRewardModal && (
                  <button
                    type="button"
                    onClick={() => onOpenRewardModal(String(selectedSantri.id))}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition flex items-center gap-1"
                  >
                    <span>🏅</span> + Reward/Pelanggaran
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
