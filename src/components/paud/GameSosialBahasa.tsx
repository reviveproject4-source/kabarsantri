import React, { useState } from 'react';
import { soundFx } from '../../utils/soundEffects';

interface GameSosialBahasaProps {
  gameMode?: 'tebak_perasaan' | 'sambung_cerita';
  onScoreUpdate?: (game: 'tebakPerasaan' | 'sambungCerita', score: number) => void;
}

export const GameSosialBahasa: React.FC<GameSosialBahasaProps> = ({
  gameMode = 'tebak_perasaan',
  onScoreUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'tebak_perasaan' | 'sambung_cerita'>(gameMode);

  // TEBAK PERASAAN STATE
  const [currentEmosiIdx, setCurrentEmosiIdx] = useState(0);
  const [scoreTebak, setScoreTebak] = useState(0);
  const [feedbackMsgText, setFeedbackMsgText] = useState<string | null>(null);

  const LIST_EMOSI = [
    {
      id: 'senang',
      nama: 'Senang & Gembira 😃',
      emoji: '😃',
      deskripsi: 'Saat mendapat hadiah atau bermain bersama teman.',
      pilihan: ['Senang', 'Marah', 'Sedih'],
      jawabanBenar: 'Senang'
    },
    {
      id: 'sedih',
      nama: 'Sedih 😢',
      emoji: '😢',
      deskripsi: 'Saat es krim jatuh atau lutut terbentur.',
      pilihan: ['Kaget', 'Sedih', 'Gembira'],
      jawabanBenar: 'Sedih'
    },
    {
      id: 'marah',
      nama: 'Marah 😡',
      emoji: '😡',
      deskripsi: 'Saat mainan direbut kawan tanpa izin.',
      pilihan: ['Senang', 'Takut', 'Marah'],
      jawabanBenar: 'Marah'
    },
    {
      id: 'takut',
      nama: 'Kaget & Takut 😨',
      emoji: '😨',
      deskripsi: 'Saat mendengar suara petir keras di luar.',
      pilihan: ['Takut', 'Gembira', 'Sedih'],
      jawabanBenar: 'Takut'
    }
  ];

  const handlePilihEmosi = (jawaban: string) => {
    const current = LIST_EMOSI[currentEmosiIdx];
    if (jawaban === current.jawabanBenar) {
      soundFx.playSuccess();
      setFeedbackMsgText('Hebat! Tebakanmu Tepat Sekali! 🎉');
      const newScore = scoreTebak + 25;
      setScoreTebak(newScore);
      if (onScoreUpdate) onScoreUpdate('tebakPerasaan', newScore);
      setTimeout(() => {
        setFeedbackMsgText(null);
        setCurrentEmosiIdx((prev) => (prev + 1) % LIST_EMOSI.length);
      }, 1500);
    } else {
      soundFx.playTryAgain();
      setFeedbackMsgText('Hampir benar! Coba amati lagi ekspresinya ya 😊');
      setTimeout(() => setFeedbackMsgText(null), 1500);
    }
  };

  // SAMBUNG CERITA STATE
  const [ceritaStep, setCeritaStep] = useState(0);
  const [pilihanKisah, setPilihanKisah] = useState<string[]>([]);

  const ALUR_CERITA_LIST = [
    {
      step: 0,
      tanya: 'Pada suatu pagi yang cerah, Ananda Hafiz pergi ke taman bersama...',
      pilihan: [
        { teks: 'Kelinci Putih 🐰', ikon: '🐰' },
        { teks: 'Kucing Oren 🐱', ikon: '🐱' },
        { teks: 'Burung Merpati 🕊️', ikon: '🕊️' }
      ]
    },
    {
      step: 1,
      tanya: 'Di tengah jalan, mereka menemukan sebuah kotak misterius berwarna...',
      pilihan: [
        { teks: 'Merah Berbintang ⭐', ikon: '🎁' },
        { teks: 'Kuning Keemasan ✨', ikon: '📦' },
        { teks: 'Pelangi Indah 🌈', ikon: '🎨' }
      ]
    },
    {
      step: 2,
      tanya: 'Saat dibuka perlahan-lahan, isi di dalam kotak ternyata...',
      pilihan: [
        { teks: 'Buah-Buahan Manis 🍎🍌', ikon: '🍎' },
        { teks: 'Mainan Balok Kayu 🧱', ikon: '🧸' },
        { teks: 'Buku Cerita Bergambar 📚', ikon: '📖' }
      ]
    }
  ];

  const handlePilihCerita = (teksPilihan: string) => {
    soundFx.playPop();
    setPilihanKisah([...pilihanKisah, teksPilihan]);
    if (ceritaStep < ALUR_CERITA_LIST.length - 1) {
      setCeritaStep(ceritaStep + 1);
    } else {
      soundFx.playFanfare();
      setCeritaStep(99); // Selesai
      if (onScoreUpdate) onScoreUpdate('sambungCerita', 100);
    }
  };

  const handleResetCerita = () => {
    soundFx.playPop();
    setCeritaStep(0);
    setPilihanKisah([]);
  };

  const currentEmosi = LIST_EMOSI[currentEmosiIdx];
  const currentAlur = ALUR_CERITA_LIST[ceritaStep];

  return (
    <div className="bg-white rounded-3xl p-6 border-4 border-indigo-200 shadow-xl space-y-6 max-w-4xl mx-auto">
      {/* Header Selector Game */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-100 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider">Game Interaktif Domain Sosial-Emosional & Bahasa</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">Modul Pembelajaran Interaktif</h3>
        </div>

        <div className="flex gap-2 bg-indigo-50 p-1.5 rounded-2xl border border-indigo-200">
          <button
            onClick={() => { soundFx.playPop(); setActiveTab('tebak_perasaan'); }}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${
              activeTab === 'tebak_perasaan' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            😃 Tebak Perasaan
          </button>
          <button
            onClick={() => { soundFx.playPop(); setActiveTab('sambung_cerita'); }}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${
              activeTab === 'sambung_cerita' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            📖 Sambung Cerita
          </button>
        </div>
      </div>

      {/* GAME 1: TEBAK PERASAAN */}
      {activeTab === 'tebak_perasaan' && (
        <div className="bg-gradient-to-b from-amber-50 to-orange-50 p-6 rounded-3xl border-2 border-amber-200 text-center space-y-6">
          <span className="text-xs font-black uppercase bg-amber-200 text-amber-900 px-3 py-1 rounded-full">
            Soal #{currentEmosiIdx + 1} dari {LIST_EMOSI.length}
          </span>

          <div className="text-8xl animate-bounce my-2">{currentEmosi.emoji}</div>
          <h4 className="text-2xl font-black text-slate-900">{currentEmosi.nama}</h4>
          <p className="text-slate-600 text-sm max-w-md mx-auto">{currentEmosi.deskripsi}</p>

          {feedbackMsgText && (
            <div className="p-3 bg-emerald-100 text-emerald-900 font-black rounded-2xl border-2 border-emerald-400 animate-pulse text-sm">
              {feedbackMsgText}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
            {currentEmosi.pilihan.map((p, i) => (
              <button
                key={i}
                onClick={() => handlePilihEmosi(p)}
                className="py-3 px-4 bg-white hover:bg-amber-400 hover:text-amber-950 font-black text-slate-800 rounded-2xl border-2 border-amber-300 shadow-md transition-transform active:scale-95 text-base"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GAME 2: SAMBUNG CERITA */}
      {activeTab === 'sambung_cerita' && (
        <div className="bg-gradient-to-b from-sky-50 to-blue-50 p-6 rounded-3xl border-2 border-sky-200 text-center space-y-6">
          {ceritaStep !== 99 ? (
            <>
              <span className="text-xs font-black uppercase bg-sky-200 text-sky-900 px-3 py-1 rounded-full">
                Bagian Cerita #{ceritaStep + 1} dari {ALUR_CERITA_LIST.length}
              </span>

              <h4 className="text-xl font-black text-slate-900 leading-relaxed max-w-xl mx-auto">
                "{currentAlur.tanya}"
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto pt-4">
                {currentAlur.pilihan.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handlePilihCerita(p.teks)}
                    className="p-4 bg-white hover:bg-sky-400 hover:text-sky-950 font-black text-slate-800 rounded-2xl border-2 border-sky-300 shadow-lg transition-transform active:scale-95 flex flex-col items-center gap-2"
                  >
                    <span className="text-4xl">{p.ikon}</span>
                    <span className="text-xs text-center">{p.teks}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <span className="text-6xl">🎉📖</span>
              <h4 className="text-2xl font-black text-emerald-900">Kisah Petualangan Selesai!</h4>
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-300 text-left max-w-lg mx-auto space-y-2 text-sm text-slate-700 leading-relaxed shadow">
                <h5 className="font-black text-indigo-900 border-b pb-1">Kisah Hasil Karya Bersama:</h5>
                <p>
                  "Pada suatu pagi yang cerah, Ananda Hafiz pergi ke taman bersama <strong>{pilihanKisah[0]}</strong>. Di tengah jalan, mereka menemukan sebuah kotak misterius berwarna <strong>{pilihanKisah[1]}</strong>. Saat dibuka perlahan-lahan, isi di dalam kotak ternyata <strong>{pilihanKisah[2]}</strong>!"
                </p>
              </div>

              <button
                onClick={handleResetCerita}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95 text-sm"
              >
                🔄 Buat Cerita Baru Lagi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
