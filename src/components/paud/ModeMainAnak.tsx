import React, { useState } from 'react';
import { MuridPaud, BulanCurriculum, KategoriUsiaSpesifik, KategoriMateri } from '../../types/paudTypes';
import { GameLogika } from './GameLogika';
import { GameMotorikHalus } from './GameMotorikHalus';
import { LIST_AKTIVITAS_KASAR, KURIKULUM_BULANAN_LIST } from './ModulMotorikKasar';
import { soundFx } from '../../utils/soundEffects';

interface ModeMainAnakProps {
  muridAktif: MuridPaud;
  onExitToTeacherDashboard: () => void;
  onScoreUpdate?: (domain: 'logika' | 'motorikHalus', subKey: string, score: number) => void;
}

export const ModeMainAnak: React.FC<ModeMainAnakProps> = ({
  muridAktif,
  onExitToTeacherDashboard,
  onScoreUpdate
}) => {
  const [selectedAge, setSelectedAge] = useState<KategoriUsiaSpesifik>(muridAktif.kategoriUsia || '3_tahun');
  const [selectedTopic, setSelectedTopic] = useState<KategoriMateri>('buah');
  const [selectedBulan, setSelectedBulan] = useState<BulanCurriculum>(1);
  const [activeArea, setActiveArea] = useState<'home' | 'logika' | 'halus' | 'kasar'>('home');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Motorik Kasar State Anak
  const [isGerakActive, setIsGerakActive] = useState(false);
  const [gerakSecLeft, setGerakSecLeft] = useState(30);

  const TEACHER_PIN = '1234';

  const currentTheme = KURIKULUM_BULANAN_LIST.find((k) => k.bulan === selectedBulan) || KURIKULUM_BULANAN_LIST[0];
  const currentKasarAkt = LIST_AKTIVITAS_KASAR.find((a) => a.bulan === selectedBulan) || LIST_AKTIVITAS_KASAR[0];

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === TEACHER_PIN) {
      soundFx.playSuccess();
      setShowPinModal(false);
      onExitToTeacherDashboard();
    } else {
      soundFx.playTryAgain();
      setPinError(true);
      setPinInput('');
    }
  };

  const startGerakAnak = () => {
    soundFx.playSuccess();
    setIsGerakActive(true);
    setGerakSecLeft(30);
    const interval = setInterval(() => {
      setGerakSecLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsGerakActive(false);
          soundFx.playFanfare();
          return 0;
        }
        soundFx.playCount((30 - prev) % 5 + 1);
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-b from-yellow-100 via-amber-50 to-orange-100 min-h-screen p-4 md:p-6 flex flex-col font-sans">
      {/* Top Kid Header Bar */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-md border-4 border-amber-200 flex flex-col space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2 bg-amber-100 rounded-2xl shadow-inner animate-bounce">{muridAktif.fotoEmoji}</span>
            <div>
              <span className="text-xs font-black uppercase text-amber-600 tracking-wider">Pemain Cilik:</span>
              <h2 className="text-2xl font-black text-amber-900">{muridAktif.panggilan}</h2>
            </div>
          </div>

          {/* PILIHAN USIA 2, 3, 4, 5 TAHUN */}
          <div className="flex items-center gap-1.5 bg-amber-100 p-1.5 rounded-2xl border-2 border-amber-300">
            <span className="text-xs font-black text-amber-900 px-2">Pilih Usia:</span>
            {[
              { id: '2_tahun', label: '2 Thn' },
              { id: '3_tahun', label: '3 Thn' },
              { id: '4_tahun', label: '4 Thn' },
              { id: '5_tahun', label: '5 Thn' }
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => { soundFx.playPop(); setSelectedAge(u.id as KategoriUsiaSpesifik); }}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-transform active:scale-90 ${
                  selectedAge === u.id ? 'bg-amber-500 text-white shadow-md scale-105' : 'bg-white text-amber-900 hover:bg-amber-200'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            {activeArea !== 'home' && (
              <button
                onClick={() => { soundFx.playPop(); setActiveArea('home'); }}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-2xl shadow-md transition-transform active:scale-95 flex items-center gap-2 text-sm"
              >
                <span>🏠</span> Menu Utama
              </button>
            )}

            <button
              onClick={() => { soundFx.playPop(); setShowPinModal(true); setPinError(false); }}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-2xl shadow-sm flex items-center gap-1"
            >
              🔒 Menu Guru
            </button>
          </div>
        </div>

        {/* SELECTOR MATERI TOPIK & BULAN 1-12 */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-amber-200 pt-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <span className="font-black text-amber-900">Materi:</span>
            {[
              { id: 'buah', label: '🍎 Buah' },
              { id: 'sayur', label: '🥦 Sayur' },
              { id: 'kendaraan', label: '🚗 Kendaraan' },
              { id: 'hewan', label: '🦁 Hewan' },
              { id: 'bentuk_warna', label: '⭐ Bentuk' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { soundFx.playPop(); setSelectedTopic(t.id as KategoriMateri); }}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  selectedTopic === t.id ? 'bg-amber-600 text-white shadow' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* BULAN 1-12 */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="font-black text-amber-900">Bulan:</span>
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((b) => (
              <button
                key={b}
                onClick={() => { soundFx.playPop(); setSelectedBulan(b); }}
                className={`w-7 h-7 rounded-lg font-black transition-transform active:scale-90 flex items-center justify-center shrink-0 ${
                  selectedBulan === b ? 'bg-amber-500 text-white shadow scale-110' : 'bg-white text-amber-800 hover:bg-amber-200'
                }`}
              >
                #{b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TEMA BULAN INI BANNER */}
      <div className="bg-amber-400 text-amber-950 font-black text-center py-2 px-4 rounded-2xl mb-6 shadow border-2 border-amber-300 flex justify-between items-center text-sm">
        <span>{currentTheme.ikon} Usia {selectedAge.replace('_tahun', ' Tahun')} • {currentTheme.judulTema}</span>
        <span className="text-xs font-bold bg-white/30 px-3 py-0.5 rounded-full">Topik: {selectedTopic.toUpperCase()} • Minggu #{(selectedBulan - 1) * 4 + 1} s/d #{selectedBulan * 4}</span>
      </div>

      {/* AREA 1: HOME SELECTION */}
      {activeArea === 'home' && (
        <div className="flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto w-full py-4 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-amber-900 tracking-tight">
              Petualangan Usia {selectedAge.replace('_tahun', ' Tahun')} (Bulan #{selectedBulan})! 🌟
            </h1>
            <p className="text-amber-700 font-bold text-sm">Pilih dunia permainan {selectedTopic.toUpperCase()} minggu ini:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* DUNIA LOGIKA */}
            <div
              onClick={() => { soundFx.playSuccess(); setActiveArea('logika'); }}
              className="bg-white p-6 rounded-3xl border-4 border-amber-300 shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-amber-50 flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-5xl shadow-inner mb-3 group-hover:rotate-12 transition-transform">
                🧠
              </div>
              <h3 className="text-2xl font-black text-amber-900 mb-1">Dunia Logika</h3>
              <p className="text-amber-700 font-semibold text-xs">
                Logika {selectedTopic.toUpperCase()}, Bentuk, Ukuran & Count.
              </p>
              <span className="mt-6 px-5 py-2.5 bg-amber-500 text-white font-black rounded-2xl shadow-lg group-hover:bg-amber-600 text-sm">
                Mulai Main 🚀
              </span>
            </div>

            {/* DUNIA JEMARI / MOTORIK HALUS */}
            <div
              onClick={() => { soundFx.playSuccess(); setActiveArea('halus'); }}
              className="bg-white p-6 rounded-3xl border-4 border-pink-300 shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-pink-50 flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-5xl shadow-inner mb-3 group-hover:-rotate-12 transition-transform">
                ✍️
              </div>
              <h3 className="text-2xl font-black text-pink-900 mb-1">Dunia Jemari</h3>
              <p className="text-pink-700 font-semibold text-xs">
                Tracing Garis, Puzzle {selectedTopic.toUpperCase()} & Pop Presisi.
              </p>
              <span className="mt-6 px-5 py-2.5 bg-pink-500 text-white font-black rounded-2xl shadow-lg group-hover:bg-pink-600 text-sm">
                Mulai Main 🚀
              </span>
            </div>

            {/* DUNIA GERAK / MOTORIK KASAR */}
            <div
              onClick={() => { soundFx.playSuccess(); setActiveArea('kasar'); }}
              className="bg-white p-6 rounded-3xl border-4 border-sky-300 shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-sky-50 flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center text-5xl shadow-inner mb-3 group-hover:bounce transition-transform">
                🏃
              </div>
              <h3 className="text-2xl font-black text-sky-900 mb-1">Dunia Gerak</h3>
              <p className="text-sky-700 font-semibold text-xs">
                Tantangan Gerak Fisik Usia {selectedAge.replace('_tahun', ' Tahun')}.
              </p>
              <span className="mt-6 px-5 py-2.5 bg-sky-500 text-white font-black rounded-2xl shadow-lg group-hover:bg-sky-600 text-sm">
                Ayo Bergerak 🎵
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AREA 2: LOGIKA */}
      {activeArea === 'logika' && (
        <div className="flex-1">
          <GameLogika
            usiaSpesifik={selectedAge}
            materiKhusus={selectedTopic}
            bulan={selectedBulan}
            onScoreUpdate={(key, val) => onScoreUpdate && onScoreUpdate('logika', key, val)}
          />
        </div>
      )}

      {/* AREA 3: MOTORIK HALUS */}
      {activeArea === 'halus' && (
        <div className="flex-1">
          <GameMotorikHalus
            usiaSpesifik={selectedAge}
            materiKhusus={selectedTopic}
            bulan={selectedBulan}
            onScoreUpdate={(key, val) => onScoreUpdate && onScoreUpdate('motorikHalus', key, val)}
          />
        </div>
      )}

      {/* AREA 4: MOTORIK KASAR / DUNIA GERAK */}
      {activeArea === 'kasar' && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border-4 border-sky-300 text-center max-w-2xl mx-auto space-y-6">
          <span className="text-xs font-black uppercase text-sky-700 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
            Tantangan Gerak Fisik Usia {selectedAge.replace('_tahun', ' Tahun')} • Bulan #{selectedBulan}
          </span>
          
          <div className="text-6xl animate-bounce my-4">{currentKasarAkt.ikon}</div>
          <h3 className="text-3xl font-black text-sky-900">{currentKasarAkt.judul}</h3>
          <p className="text-sky-800 font-bold text-base">{currentKasarAkt.deskripsi}</p>

          <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 text-left space-y-2">
            <h4 className="font-black text-sky-900 text-xs uppercase">Cara Bermain Bersama Guru:</h4>
            <ul className="text-xs text-slate-700 list-disc list-inside space-y-1">
              {currentKasarAkt.instruksiGuru.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>

          {isGerakActive ? (
            <div className="p-6 bg-emerald-100 border-4 border-emerald-400 rounded-3xl animate-pulse">
              <span className="text-5xl font-black text-emerald-800">{gerakSecLeft} DETIK</span>
              <p className="font-black text-emerald-900 mt-2">AYO BERGERAK BERSAMA KAWAN-KAWAN! 🎉</p>
            </div>
          ) : (
            <button
              onClick={startGerakAnak}
              className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-black text-xl rounded-2xl shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🎶</span> Mulai Musik & Senam 30 Detik!
            </button>
          )}
        </div>
      )}

      {/* MODAL PIN GURU */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleVerifyPin} className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-amber-300 max-w-sm w-full text-center space-y-4">
            <span className="text-4xl">🔐</span>
            <h3 className="text-xl font-black text-slate-800">Masukkan PIN Guru</h3>
            <p className="text-slate-500 text-xs">Keamanan agar murid tidak sengaja keluar. PIN default: <strong>1234</strong></p>

            <input
              type="password"
              maxLength={4}
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center text-3xl font-black tracking-widest p-3 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-amber-300"
            />

            {pinError && <p className="text-rose-600 text-xs font-bold animate-bounce">PIN salah! Coba 1234</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow hover:bg-indigo-700"
              >
                Masuk
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
