import React from 'react';
import { RentangWaktu } from '../../types/paudTypes';
import { soundFx } from '../../utils/soundEffects';

interface DropdownRentangWaktuProps {
  value: RentangWaktu;
  onChange: (value: RentangWaktu) => void;
  className?: string;
}

export const DropdownRentangWaktu: React.FC<DropdownRentangWaktuProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-bold text-slate-600">Rentang Waktu:</span>
      <select
        value={value}
        onChange={(e) => {
          soundFx.playPop();
          onChange(e.target.value as RentangWaktu);
        }}
        className="bg-white border-2 border-indigo-300 text-indigo-950 font-black text-xs rounded-xl px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-amber-400 cursor-pointer"
      >
        <option value="harian">📅 PILIHAN 1 — HARIAN (Fokus Hari Ini)</option>
        <option value="bulanan">🗓️ PILIHAN 2 — BULANAN (4 Minggu / 20 Hari Aktif)</option>
        <option value="semester">🏆 PILIHAN 3 — 6 BULANAN / SEMESTER (120 Hari Aktif)</option>
      </select>
    </div>
  );
};
