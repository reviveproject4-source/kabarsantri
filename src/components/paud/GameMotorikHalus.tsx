import React, { useRef, useState, useEffect } from 'react';
import { BulanCurriculum, KategoriUsiaSpesifik, KategoriMateri } from '../../types/paudTypes';
import { soundFx } from '../../utils/soundEffects';

interface GameMotorikHalusProps {
  onScoreUpdate?: (game: 'tracingGaris' | 'puzzleBentuk' | 'bubblePopSensory', score: number) => void;
  usiaSpesifik?: KategoriUsiaSpesifik;
  materiKhusus?: KategoriMateri;
  bulan?: BulanCurriculum;
}

export const GameMotorikHalus: React.FC<GameMotorikHalusProps> = ({
  onScoreUpdate,
  usiaSpesifik = '3_tahun',
  materiKhusus = 'buah',
  bulan = 1
}) => {
  const [activeSubMode, setActiveSubMode] = useState<'tracing' | 'puzzle' | 'bubble'>('tracing');
  const [selectedTopic, setSelectedTopic] = useState<KategoriMateri>(materiKhusus);

  // TRACING CANVAS STATE
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tracingType, setTracingType] = useState<'lurus' | 'lengkung' | 'zigzag' | 'lingkaran'>('lurus');
  const [tracingProgress, setTracingProgress] = useState(0);

  // PUZZLE STATE (Tematik & Tingkat Kesulitan Berdasarkan Usia)
  const getPuzzlePiecesByTopic = (topic: KategoriMateri, age: KategoriUsiaSpesifik) => {
    if (topic === 'sayur') {
      return [
        { id: 'p1', name: 'Daun Brokoli 🥦', position: 'A' },
        { id: 'p2', name: 'Batang Brokoli 🥦', position: 'B' },
        { id: 'p3', name: 'Wortel Oranye 🥕', position: 'C' },
        { id: 'p4', name: 'Daun Wortel 🍃', position: 'D' }
      ];
    }
    if (topic === 'kendaraan') {
      return [
        { id: 'top-left', name: 'Atas Kiri 🚗', position: 'A' },
        { id: 'top-right', name: 'Atas Kanan 🛞', position: 'B' },
        { id: 'bottom-left', name: 'Bawah Kiri 🛣️', position: 'C' },
        { id: 'bottom-right', name: 'Bawah Kanan 🏁', position: 'D' }
      ];
    }
    if (topic === 'hewan') {
      return [
        { id: 'p1', name: 'Kepala Singa 🦁', position: 'A' },
        { id: 'p2', name: 'Badan Singa 🐾', position: 'B' },
        { id: 'p3', name: 'Telinga Kelinci 🐰', position: 'C' },
        { id: 'p4', name: 'Wajah Kelinci 🐰', position: 'D' }
      ];
    }
    return [
      { id: 'p1', name: 'Daun Apel 🍃', position: 'A' },
      { id: 'p2', name: 'Buah Apel 🍎', position: 'B' },
      { id: 'p3', name: 'Pisang Manis 🍌', position: 'C' },
      { id: 'p4', name: 'Jeruk Segar 🍊', position: 'D' }
    ];
  };

  const puzzlePieces = getPuzzlePiecesByTopic(selectedTopic, usiaSpesifik);
  const [placedPieces, setPlacedPieces] = useState<string[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  // BUBBLE POP SENSORY STATE
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);
  const [poppedCount, setPoppedCount] = useState(0);

  // Setup Canvas Drawing
  useEffect(() => {
    if (activeSubMode === 'tracing' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGuidePath(ctx, canvas.width, canvas.height, tracingType);
      }
    }
  }, [activeSubMode, tracingType]);

  const drawGuidePath = (ctx: CanvasRenderingContext2D, w: number, h: number, type: string) => {
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([15, 15]);

    ctx.beginPath();
    if (type === 'lurus') {
      ctx.moveTo(50, h / 2);
      ctx.lineTo(w - 50, h / 2);
    } else if (type === 'lengkung') {
      ctx.moveTo(50, h / 2);
      ctx.quadraticCurveTo(w / 2, 30, w - 50, h / 2);
    } else if (type === 'zigzag') {
      ctx.moveTo(50, h - 50);
      ctx.lineTo(w / 4, 40);
      ctx.lineTo(w / 2, h - 50);
      ctx.lineTo((3 * w) / 4, 40);
      ctx.lineTo(w - 50, h - 50);
    } else if (type === 'lingkaran') {
      ctx.arc(w / 2, h / 2, Math.min(w, h) / 3, 0, 2 * Math.PI);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    soundFx.playPop();
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setTracingProgress((prev) => {
        const next = Math.min(prev + 35, 100);
        if (next >= 100) {
          soundFx.playFanfare();
          if (onScoreUpdate) onScoreUpdate('tracingGaris', 100);
        } else {
          soundFx.playSuccess();
        }
        return next;
      });
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ec4899';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    setTracingProgress(0);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawGuidePath(ctx, canvasRef.current.width, canvasRef.current.height, tracingType);
      }
    }
  };

  // PUZZLE LOGIC
  const handleSelectPiece = (id: string) => {
    soundFx.playPop();
    setSelectedPiece(id);
  };

  const handlePlaceTarget = (position: string) => {
    const piece = puzzlePieces.find((p) => p.position === position);
    if (piece && selectedPiece === piece.id && !placedPieces.includes(position)) {
      soundFx.playSuccess();
      const updated = [...placedPieces, position];
      setPlacedPieces(updated);
      setSelectedPiece(null);

      if (updated.length === puzzlePieces.length) {
        soundFx.playFanfare();
        if (onScoreUpdate) onScoreUpdate('puzzleBentuk', 100);
      }
    } else {
      soundFx.playTryAgain();
    }
  };

  // BUBBLE POP LOGIC
  const generateBubbles = () => {
    const colors = ['bg-pink-400', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-purple-400'];
    const count = usiaSpesifik === '2_tahun' ? 5 : usiaSpesifik === '3_tahun' ? 8 : 10;
    const newBubbles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.floor(Math.random() * 70) + 15,
      y: Math.floor(Math.random() * 60) + 20,
      color: colors[i % colors.length],
      size: Math.floor(Math.random() * 30) + 50
    }));
    setBubbles(newBubbles);
    setPoppedCount(0);
  };

  useEffect(() => {
    if (activeSubMode === 'bubble') {
      generateBubbles();
    }
  }, [activeSubMode, usiaSpesifik]);

  const popBubble = (id: number) => {
    soundFx.playPop();
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setPoppedCount((prev) => {
      const updated = prev + 1;
      if (updated >= bubbles.length) {
        soundFx.playFanfare();
        if (onScoreUpdate) onScoreUpdate('bubblePopSensory', 100);
      }
      return updated;
    });
  };

  return (
    <div className="bg-gradient-to-b from-pink-50 to-rose-100 min-h-full p-4 rounded-3xl shadow-lg border-4 border-pink-200 space-y-4">
      {/* SELEKTOR MATERI KHUSUS (Buah, Sayur, Kendaraan, Hewan) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 p-3 rounded-2xl border border-pink-200">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-black text-pink-900 px-2">Topik Motorik:</span>
          {[
            { id: 'buah', label: '🍎 Buah' },
            { id: 'sayur', label: '🥦 Sayur' },
            { id: 'kendaraan', label: '🚗 Kendaraan' },
            { id: 'hewan', label: '🦁 Hewan' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { soundFx.playPop(); setSelectedTopic(t.id as KategoriMateri); setPlacedPieces([]); }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-transform active:scale-95 ${
                selectedTopic === t.id ? 'bg-pink-500 text-white shadow' : 'bg-pink-100 text-pink-900 hover:bg-pink-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-black bg-pink-200 text-pink-950 px-3 py-1 rounded-full">
          Presisi Jemari Usia {usiaSpesifik.replace('_tahun', ' Tahun')} • Bulan #{bulan}
        </span>
      </div>

      {/* Submode Switcher */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('tracing'); }}
          className={`px-4 py-2.5 rounded-2xl font-bold text-base shadow-md transition-transform active:scale-95 flex items-center gap-2 ${
            activeSubMode === 'tracing' ? 'bg-pink-500 text-white ring-4 ring-pink-300' : 'bg-white text-pink-600 hover:bg-pink-50'
          }`}
        >
          <span>✍️</span> Tracing Garis
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('puzzle'); }}
          className={`px-4 py-2.5 rounded-2xl font-bold text-base shadow-md transition-transform active:scale-95 flex items-center gap-2 ${
            activeSubMode === 'puzzle' ? 'bg-indigo-500 text-white ring-4 ring-indigo-300' : 'bg-white text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          <span>🧩</span> Puzzle {selectedTopic.toUpperCase()}
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('bubble'); }}
          className={`px-4 py-2.5 rounded-2xl font-bold text-base shadow-md transition-transform active:scale-95 flex items-center gap-2 ${
            activeSubMode === 'bubble' ? 'bg-emerald-500 text-white ring-4 ring-emerald-300' : 'bg-white text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <span>🫧</span> Pop Tap Presisi
        </button>
      </div>

      {/* MODE 1: TRACING */}
      {activeSubMode === 'tracing' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center">
          <h3 className="text-2xl font-black text-rose-900 mb-1">Tebalkan Garis Presisi!</h3>
          <p className="text-rose-700 text-sm mb-4">Latihan koordinasi tangan Usia {usiaSpesifik.replace('_tahun', ' Tahun')}.</p>

          {/* Type Selector */}
          <div className="flex justify-center gap-2 mb-4">
            {(['lurus', 'lengkung', 'zigzag', 'lingkaran'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { soundFx.playPop(); setTracingType(t); setTracingProgress(0); }}
                className={`px-3 py-1.5 rounded-xl font-bold text-sm capitalize ${
                  tracingType === t ? 'bg-pink-600 text-white shadow' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative inline-block border-4 border-dashed border-pink-300 rounded-3xl overflow-hidden bg-white shadow-lg">
            <canvas
              ref={canvasRef}
              width={340}
              height={200}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              className="cursor-crosshair touch-none"
            />
          </div>

          <div className="mt-4 flex justify-center gap-4 items-center">
            <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 rounded-xl shadow"
            >
              Hapus Kanvas 🔄
            </button>
            <div className="text-sm font-bold text-pink-700">Kemajuan: {tracingProgress}%</div>
          </div>
        </div>
      )}

      {/* MODE 2: PUZZLE */}
      {activeSubMode === 'puzzle' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center">
          <h3 className="text-2xl font-black text-rose-900 mb-2">Pasang Puzzle {selectedTopic.toUpperCase()}!</h3>
          <p className="text-rose-700 text-sm mb-6">Pilih kepingan di bawah, lalu pasang di kotak puzzle.</p>

          {/* Target Grid */}
          <div className="grid grid-cols-2 gap-3 w-64 h-64 mx-auto mb-6 bg-slate-100 p-3 rounded-2xl border-4 border-indigo-200 shadow-md">
            {puzzlePieces.map((piece) => {
              const isPlaced = placedPieces.includes(piece.position);
              return (
                <div
                  key={piece.position}
                  onClick={() => handlePlaceTarget(piece.position)}
                  className={`rounded-xl border-2 border-dashed flex items-center justify-center text-xl font-bold cursor-pointer transition-all ${
                    isPlaced ? 'bg-indigo-100 border-indigo-400 text-indigo-900 scale-100 shadow' : 'bg-white border-slate-300 text-slate-300 hover:bg-indigo-50'
                  }`}
                >
                  {isPlaced ? piece.name : '❓'}
                </div>
              );
            })}
          </div>

          {/* Sources */}
          <div className="flex justify-center gap-2 flex-wrap">
            {puzzlePieces.map((piece) => {
              const isPlaced = placedPieces.includes(piece.position);
              if (isPlaced) return null;
              const isSelected = selectedPiece === piece.id;
              return (
                <button
                  key={piece.id}
                  onClick={() => handleSelectPiece(piece.id)}
                  className={`px-4 py-3 rounded-xl font-bold text-sm shadow transition-transform active:scale-95 ${
                    isSelected ? 'bg-indigo-600 text-white ring-4 ring-indigo-300 scale-105' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  {piece.name}
                </button>
              );
            })}
          </div>

          {placedPieces.length === puzzlePieces.length && (
            <div className="mt-6 p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl">
              <span className="text-3xl">🧩 HEBAT! 🧩</span>
              <p className="text-emerald-800 font-bold">Puzzle {selectedTopic} berhasil terpasang sempurna!</p>
              <button
                onClick={() => { setPlacedPieces([]); setSelectedPiece(null); }}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow hover:bg-emerald-700"
              >
                Main Puzzle Lagi 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: BUBBLE POP */}
      {activeSubMode === 'bubble' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center relative overflow-hidden min-h-[320px]">
          <h3 className="text-2xl font-black text-rose-900 mb-1">Pop Tap Presisi Jemari!</h3>
          <p className="text-rose-700 text-sm mb-4">Sentuh gelembung {selectedTopic} untuk memecahkannya.</p>

          <div className="text-emerald-700 font-bold mb-4">Gelembung Pecah: {poppedCount} / {bubbles.length}</div>

          <div className="relative w-full h-60 bg-gradient-to-b from-sky-100 to-indigo-100 rounded-2xl border-4 border-sky-200 overflow-hidden shadow-inner">
            {bubbles.map((b) => (
              <button
                key={b.id}
                onClick={() => popBubble(b.id)}
                style={{
                  top: `${b.y}%`,
                  left: `${b.x}%`,
                  width: `${b.size}px`,
                  height: `${b.size}px`
                }}
                className={`absolute rounded-full shadow-lg border-2 border-white/80 animate-bounce transition-transform active:scale-125 flex items-center justify-center text-2xl ${b.color}`}
              >
                {selectedTopic === 'buah' ? '🍎' : selectedTopic === 'sayur' ? '🥦' : selectedTopic === 'kendaraan' ? '🚗' : '✨'}
              </button>
            ))}

            {bubbles.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <span className="text-4xl mb-2">🎉 SEMUA TERPETIK! 🎉</span>
                <button
                  onClick={generateBubbles}
                  className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700"
                >
                  Munculkan Lagi 🫧
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
