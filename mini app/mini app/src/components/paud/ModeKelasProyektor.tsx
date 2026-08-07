import React, { useState } from 'react';
import { RekapMuridPaud } from '../../types/paudTypes';
import { soundFx } from '../../utils/soundEffects';

interface ModeKelasProyektorProps {
  daftarMurid: RekapMuridPaud[];
  judulMateri: string;
  gameId: 'logika' | 'halus' | 'sosial_bahasa';
  onExit: () => void;
  onAutoScoreLogged?: (muridId: string, domain: string, score: number) => void;
}

export const ModeKelasProyektor: React.FC<ModeKelasProyektorProps> = ({
  daftarMurid,
  judulMateri,
  gameId,
  onExit,
  onAutoScoreLogged
}) => {
  const [selectedMuridIndex, setSelectedMuridIndex] = useState<number>(0);
  const [stage, setStage] = useState<'pilih_murid' | 'pengumuman_giliran' | 'soal_proyektor'>('pilih_murid');
  const [completedMuridIds, setCompletedMuridIds] = useState<string[]>([]);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);

  const activeMurid = daftarMurid[selectedMuridIndex] || daftarMurid[0];

  const handleStartGiliran = (idx: number) => {
    soundFx.playSuccess();
    setSelectedMuridIndex(idx);
    setStage('pengumuman_giliran');
  };

  const handleMulaiSoal = () => {
    soundFx.playPop();
    setStage('soal_proyektor');
  };

  // ATURAN MUTLAK TOMBOL: BISA & COBA LAGI (TANPA TANDA SALAH/GAGAL)
  const handleTombolBisa = () => {
    soundFx.playFanfare();
    const namaAnak = activeMurid.panggilan;
    setCelebrationMsg(`Hore! ${namaAnak} Bisa! 👏 Star Super Bintang! ⭐⭐⭐`);

    // Auto-record score into student record
    if (onAutoScoreLogged) {
      onAutoScoreLogged(activeMurid.id, gameId, 100);
    }

    if (!completedMuridIds.includes(activeMurid.id)) {
      setCompletedMuridIds([...completedMuridIds, activeMurid.id]);
    }

    setTimeout(() => {
      setCelebrationMsg(null);
      // Auto-advance to next student
      const nextIdx = (selectedMuridIndex + 1) % daftarMurid.length;
      setSelectedMuridIndex(nextIdx);
      setStage('pengumuman_giliran');
    }, 2000);
  };

  const handleTombolCobaLagi = () => {
    soundFx.playPop();
    // Smooth next question without error signs or negative feedback
    setCelebrationMsg(`Ayo ${activeMurid.panggilan}, coba tebak yang ini ya! 😊`);
    setTimeout(() => {
      setCelebrationMsg(null);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen p-4 md:p-6 flex flex-col font-sans select-none">
      {/* Top Header Mode Kelas Proyektor */}
      <div className="bg-indigo-950 p-4 rounded-3xl border-2 border-indigo-500/50 flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 bg-amber-400 text-indigo-950 rounded-2xl font-black animate-pulse">📺</span>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-widest bg-amber-950/60 px-2.5 py-0.5 rounded-full">
              Mode Proyektor HP (Mirror Screen)
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">{judulMateri}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-indigo-200 bg-indigo-900 px-3 py-1.5 rounded-xl border border-indigo-700">
            Giliran Selesai: {completedMuridIds.length}/{daftarMurid.length} Anak
          </span>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow"
          >
            ❌ Keluar Mode Kelas
          </button>
        </div>
      </div>

      {/* STAGE 1: PILIH MURID YANG MAJU */}
      {stage === 'pilih_murid' && (
        <div className="flex-1 max-w-4xl mx-auto w-full space-y-6 flex flex-col justify-center">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-amber-400">Pilih Giliran Murid Yang Maju 🙋‍♀️🙋‍♂️</h1>
            <p className="text-slate-300 text-sm">Klik nama anak di bawah ini untuk memulai giliran giliran di depan kelas proyektor.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {daftarMurid.map((m, idx) => {
              const isDone = completedMuridIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => handleStartGiliran(idx)}
                  className={`p-4 rounded-3xl border-4 cursor-pointer transition-all duration-300 flex flex-col items-center text-center space-y-2 ${
                    isDone
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 hover:bg-emerald-900/80'
                      : 'bg-indigo-900/60 border-indigo-400 text-white hover:bg-indigo-800/80 hover:scale-105 shadow-xl'
                  }`}
                >
                  <span className="text-5xl p-2 bg-white/10 rounded-2xl shadow-inner">{m.fotoEmoji}</span>
                  <h4 className="font-black text-lg">{m.nama}</h4>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${isDone ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-indigo-950'}`}>
                    {isDone ? '✓ Sudah Maju' : 'Belum Maju'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAGE 2: PENGUMUMAN GILIRAN ANANDA HAFIS (TEKS RAKSASA PROYEKTOR) */}
      {stage === 'pengumuman_giliran' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-3xl mx-auto py-8">
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300 bg-amber-950/80 px-4 py-1.5 rounded-full border border-amber-400">
            Ayo Seluruh Kelas Tepuk Tangan! 👏
          </span>

          <div className="space-y-4">
            <span className="text-9xl p-4 bg-white/10 rounded-full border-4 border-amber-400 shadow-2xl inline-block animate-bounce">
              {activeMurid.fotoEmoji}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-amber-300 tracking-tight leading-tight">
              Giliran Ananda {activeMurid.panggilan}! 🎉
            </h1>
            <p className="text-xl font-bold text-slate-200">
              Kategori Usia {activeMurid.kategoriUsia.replace('_tahun', ' Tahun')}
            </p>
          </div>

          <button
            onClick={handleMulaiSoal}
            className="w-full max-w-md py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-2xl rounded-3xl shadow-2xl transition-transform active:scale-95 border-4 border-emerald-300 flex items-center justify-center gap-3"
          >
            <span>🚀</span> Mulai Tantangan Proyektor!
          </button>
        </div>
      )}

      {/* STAGE 3: SOAL PROYEKTOR DENGAN KENDALI GURU (TOMBOL BISA & COBA LAGI) */}
      {stage === 'soal_proyektor' && (
        <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full space-y-6">
          {/* BANNER NAMA ANAK AKTIF PROYEKTOR */}
          <div className="bg-amber-400 text-indigo-950 font-black p-4 rounded-3xl shadow-xl flex justify-between items-center text-lg md:text-xl border-4 border-amber-300">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-1 bg-white rounded-2xl">{activeMurid.fotoEmoji}</span>
              <span>Ananda: <strong>{activeMurid.nama}</strong></span>
            </div>
            <span className="text-xs bg-indigo-950 text-white px-3 py-1 rounded-full font-bold">
              Menjawab Secara Lisan / Menunjuk Layar Proyektor
            </span>
          </div>

          {/* CELEBRATION POPUP IF PRESSED BISA */}
          {celebrationMsg && (
            <div className="p-6 bg-emerald-500 text-white font-black text-2xl md:text-3xl text-center rounded-3xl border-4 border-emerald-300 shadow-2xl animate-bounce">
              {celebrationMsg}
            </div>
          )}

          {/* TAMPILAN SOAL GAMBAR RAKSASA BORKONTRAS TINGGI */}
          <div className="bg-white text-slate-900 p-8 rounded-3xl border-4 border-indigo-400 shadow-2xl space-y-6 text-center">
            <h3 className="text-3xl md:text-4xl font-black text-indigo-950 leading-relaxed">
              Manakah Gambar Apel Merah Berbentuk Lingkaran? 🍎
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-amber-50 p-6 rounded-3xl border-4 border-amber-300 flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                <span className="text-7xl">🍎</span>
                <span className="text-xl font-black text-slate-900">Apel Merah (A)</span>
              </div>
              <div className="bg-amber-50 p-6 rounded-3xl border-4 border-amber-300 flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                <span className="text-7xl">🍌</span>
                <span className="text-xl font-black text-slate-900">Pisang (B)</span>
              </div>
              <div className="bg-amber-50 p-6 rounded-3xl border-4 border-amber-300 flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                <span className="text-7xl">🍊</span>
                <span className="text-xl font-black text-slate-900">Jeruk (C)</span>
              </div>
            </div>
          </div>

          {/* ATURAN MUTLAK BARISAN TOMBOL KENDALI GURU (TEPI BAWAH LAYAR HP, KECIL & DISKRET) */}
          <div className="bg-indigo-950 p-4 rounded-3xl border-2 border-indigo-700 flex justify-between items-center gap-4">
            <span className="text-xs font-bold text-indigo-300 hidden sm:inline">
              🕹️ Tombol Kendali Guru (Hanya Umpan Balik Positif di Proyektor):
            </span>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  soundFx.playPop();
                  setCelebrationMsg(`Hebat Ananda ${activeMurid.panggilan}, yuk kita lanjut gerakan seru lainnya! 😊`);
                  setTimeout(() => setCelebrationMsg(null), 1500);
                }}
                className="flex-1 sm:flex-initial px-3 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-black text-xs rounded-2xl shadow flex items-center justify-center gap-1"
              >
                <span>⏳</span> Belum Waktunya
              </button>

              <button
                onClick={handleTombolCobaLagi}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-2xl shadow flex items-center justify-center gap-1"
              >
                <span>🔄</span> Coba Lagi
              </button>

              <button
                onClick={handleTombolBisa}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-xl border-2 border-emerald-300 flex items-center justify-center gap-1"
              >
                <span>👏</span> Bisa! (Selebrasi ⭐)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
