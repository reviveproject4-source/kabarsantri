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
  const [activeSubMode, setActiveSubMode] = useState<'tracing' | 'puzzle' | 'bubble' | 'tracing_huruf' | 'bilateral_2jari'>('tracing');
  const [selectedTopic, setSelectedTopic] = useState<KategoriMateri>(materiKhusus);

  // TRACING CANVAS STATE
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tracingType, setTracingType] = useState<'lurus' | 'lengkung' | 'zigzag' | 'lingkaran'>('lurus');
  const [tracingProgress, setTracingProgress] = useState(0);

  // TRACING HURUF & ANGKA PUTUS-PUTUS STATE (Persiapan Menulis Usia 4-5th)
  const [selectedHuruf, setSelectedHuruf] = useState<string>('A');
  const [selectedAngka, setSelectedAngka] = useState<string>('1');

  // BILATERAL TRACING 2 JARI SERENTAK STATE (Brain Balance)
  const [leftTouchPos, setLeftTouchPos] = useState({ x: 20, y: 50 });
  const [rightTouchPos, setRightTouchPos] = useState({ x: 80, y: 50 });
  const [bilateralCompleted, setBilateralCompleted] = useState(false);

  // Setup Canvas Drawing
  useEffect(() => {
    if ((activeSubMode === 'tracing' || activeSubMode === 'tracing_huruf') && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (activeSubMode === 'tracing_huruf') {
          drawDashedGlyph(ctx, canvas.width, canvas.height, selectedHuruf);
        } else {
          drawGuidePath(ctx, canvas.width, canvas.height, tracingType);
        }
      }
    }
  }, [activeSubMode, tracingType, selectedHuruf]);

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

  const drawDashedGlyph = (ctx: CanvasRenderingContext2D, w: number, h: number, glyph: string) => {
    ctx.font = '900 130px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([8, 8]);
    ctx.strokeText(glyph, w / 2, h / 2 + 10);
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
        if (activeSubMode === 'tracing_huruf') {
          drawDashedGlyph(ctx, canvasRef.current.width, canvasRef.current.height, selectedHuruf);
        } else {
          drawGuidePath(ctx, canvasRef.current.width, canvasRef.current.height, tracingType);
        }
      }
    }
  };

  // PUZZLE STATE
  const puzzlePieces = [
    { id: 'p1', name: 'Daun Apel 🍃', position: 'A' },
    { id: 'p2', name: 'Buah Apel 🍎', position: 'B' },
    { id: 'p3', name: 'Pisang Manis 🍌', position: 'C' },
    { id: 'p4', name: 'Jeruk Segar 🍊', position: 'D' }
  ];
  const [placedPieces, setPlacedPieces] = useState<string[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

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

  // BUBBLE POP SENSORY
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);
  const [poppedCount, setPoppedCount] = useState(0);

  const generateBubbles = () => {
    const colors = ['bg-pink-400', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-purple-400'];
    const count = 8;
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
  }, [activeSubMode]);

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

  // HANDLER BILATERAL TRACING 2 JARI SERENTAK
  const handleMoveBilateral = (side: 'left' | 'right', deltaY: number) => {
    soundFx.playPop();
    if (side === 'left') {
      setLeftTouchPos((prev) => ({ ...prev, y: Math.min(Math.max(prev.y + deltaY, 20), 80) }));
    } else {
      setRightTouchPos((prev) => ({ ...prev, y: Math.min(Math.max(prev.y + deltaY, 20), 80) }));
    }
    if (leftTouchPos.y >= 70 && rightTouchPos.y >= 70) {
      soundFx.playFanfare();
      setBilateralCompleted(true);
    }
  };

  const resetBilateral = () => {
    soundFx.playPop();
    setLeftTouchPos({ x: 20, y: 20 });
    setRightTouchPos({ x: 80, y: 20 });
    setBilateralCompleted(false);
  };

  return (
    <div className="bg-gradient-to-b from-pink-50 to-rose-100 min-h-full p-4 rounded-3xl shadow-lg border-4 border-pink-200 space-y-4">
      {/* SELEKTOR SUBMODE MOTORIK HALUS */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('tracing'); }}
          className={`px-3 py-2 rounded-2xl font-bold text-xs shadow flex items-center gap-1 ${
            activeSubMode === 'tracing' ? 'bg-pink-500 text-white ring-4 ring-pink-300' : 'bg-white text-pink-600'
          }`}
        >
          <span>✍️</span> Tracing Garis
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('tracing_huruf'); }}
          className={`px-3 py-2 rounded-2xl font-bold text-xs shadow flex items-center gap-1 ${
            activeSubMode === 'tracing_huruf' ? 'bg-purple-600 text-white ring-4 ring-purple-300' : 'bg-white text-purple-700'
          }`}
        >
          <span>🔤</span> Tracing Huruf & Angka (A-Z, 0-9)
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('bilateral_2jari'); }}
          className={`px-3 py-2 rounded-2xl font-bold text-xs shadow flex items-center gap-1 ${
            activeSubMode === 'bilateral_2jari' ? 'bg-indigo-600 text-white ring-4 ring-indigo-300' : 'bg-white text-indigo-700'
          }`}
        >
          <span>🖐️🖐️</span> Tracing 2 Jari (Otak Kanan-Kiri)
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('puzzle'); }}
          className={`px-3 py-2 rounded-2xl font-bold text-xs shadow flex items-center gap-1 ${
            activeSubMode === 'puzzle' ? 'bg-emerald-500 text-white ring-4 ring-emerald-300' : 'bg-white text-emerald-600'
          }`}
        >
          <span>🧩</span> Puzzle
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('bubble'); }}
          className={`px-3 py-2 rounded-2xl font-bold text-xs shadow flex items-center gap-1 ${
            activeSubMode === 'bubble' ? 'bg-amber-500 text-white ring-4 ring-amber-300' : 'bg-white text-amber-600'
          }`}
        >
          <span>🫧</span> Pop Bubble
        </button>
      </div>

      {/* MODE 1: TRACING GARIS */}
      {activeSubMode === 'tracing' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center">
          <h3 className="text-2xl font-black text-rose-900 mb-1">Tebalkan Garis Dasar!</h3>
          <div className="flex justify-center gap-2 mb-4">
            {(['lurus', 'lengkung', 'zigzag', 'lingkaran'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { soundFx.playPop(); setTracingType(t); setTracingProgress(0); }}
                className={`px-3 py-1 rounded-xl font-bold text-xs capitalize ${
                  tracingType === t ? 'bg-pink-600 text-white shadow' : 'bg-pink-100 text-pink-700'
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
            <button onClick={clearCanvas} className="px-4 py-2 bg-slate-200 font-bold text-slate-700 text-xs rounded-xl shadow">
              Hapus Kanvas 🔄
            </button>
            <div className="text-xs font-bold text-pink-700">Kemajuan: {tracingProgress}%</div>
          </div>
        </div>
      )}

      {/* MODE BARU: TRACING HURUF (A-Z) & ANGKA (0-9) PUTUS-PUTUS (PERSIS USA 4-5th) */}
      {activeSubMode === 'tracing_huruf' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <h3 className="text-2xl font-black text-purple-900">🔤 Menebalkan Huruf Putus-Putus (A-Z & 0-9)</h3>
          <p className="text-purple-700 text-xs">Pilih huruf atau angka di bawah, lalu tebalkan dengan jarimu!</p>

          <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '1', '2', '3', '4', '5'].map((h) => (
              <button
                key={h}
                onClick={() => { soundFx.playPop(); setSelectedHuruf(h); setTracingProgress(0); }}
                className={`w-9 h-9 rounded-xl font-black text-sm transition-transform active:scale-90 ${
                  selectedHuruf === h ? 'bg-purple-600 text-white scale-110 shadow-md ring-2 ring-purple-300' : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          <div className="relative inline-block border-4 border-dashed border-purple-300 rounded-3xl overflow-hidden bg-white shadow-lg">
            <canvas
              ref={canvasRef}
              width={340}
              height={220}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              className="cursor-crosshair touch-none"
            />
          </div>

          <div className="flex justify-center gap-4 items-center">
            <button onClick={clearCanvas} className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs rounded-xl shadow">
              Hapus Huruf "{selectedHuruf}" 🔄
            </button>
            <div className="text-xs font-bold text-purple-700">Tebal: {tracingProgress}%</div>
          </div>
        </div>
      )}

      {/* MODE BARU: BILATERAL TRACING 2 JARI SERENTAK (BRAIN BALANCE) */}
      {activeSubMode === 'bilateral_2jari' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <h3 className="text-2xl font-black text-indigo-900">🖐️🖐️ Tracing 2 Jari Serentak (Keseimbangan Otak Kanan & Kiri)</h3>
          <p className="text-indigo-700 text-xs">Geser tombol **Telunjuk Kiri 🔴** dan **Telunjuk Kanan 🔵** ke bawah secara **SERENTAK**!</p>

          <div className="relative w-full h-64 bg-indigo-50 rounded-3xl border-4 border-indigo-200 overflow-hidden flex justify-around items-center p-4">
            {/* Jalur Kanan & Kiri */}
            <div className="w-16 h-full bg-indigo-100 rounded-2xl border-2 border-dashed border-indigo-300 relative flex flex-col justify-between items-center py-4">
              <span className="text-xs font-bold text-indigo-700">Tangan Kiri 👈</span>
              <button
                onClick={() => handleMoveBilateral('left', 15)}
                style={{ top: `${leftTouchPos.y}%` }}
                className="absolute w-12 h-12 bg-rose-500 text-white font-black rounded-full shadow-lg border-2 border-white animate-bounce flex items-center justify-center text-xs"
              >
                🔴 Kiri
              </button>
            </div>

            <div className="w-16 h-full bg-indigo-100 rounded-2xl border-2 border-dashed border-indigo-300 relative flex flex-col justify-between items-center py-4">
              <span className="text-xs font-bold text-indigo-700">Tangan Kanan 👉</span>
              <button
                onClick={() => handleMoveBilateral('right', 15)}
                style={{ top: `${rightTouchPos.y}%` }}
                className="absolute w-12 h-12 bg-blue-500 text-white font-black rounded-full shadow-lg border-2 border-white animate-bounce flex items-center justify-center text-xs"
              >
                🔵 Kanan
              </button>
            </div>
          </div>

          {bilateralCompleted && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl animate-pulse">
              <span className="text-3xl">🎉 KEDUA OTAK SEIMBANG! 🎉</span>
              <p className="text-emerald-800 font-bold mt-1">Berhasil menelusuri dengan 2 tangan bersamaan!</p>
              <button onClick={resetBilateral} className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">
                Ulangi Tracing 2 Jari 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* PUZZLE */}
      {activeSubMode === 'puzzle' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center">
          <h3 className="text-2xl font-black text-rose-900 mb-2">Puzzle Benda</h3>
          <div className="grid grid-cols-2 gap-3 w-64 h-64 mx-auto mb-6 bg-slate-100 p-3 rounded-2xl border-4 border-indigo-200 shadow">
            {puzzlePieces.map((piece) => {
              const isPlaced = placedPieces.includes(piece.position);
              return (
                <div
                  key={piece.position}
                  onClick={() => handlePlaceTarget(piece.position)}
                  className={`rounded-xl border-2 border-dashed flex items-center justify-center text-xl font-bold ${
                    isPlaced ? 'bg-indigo-100 border-indigo-400 text-indigo-900' : 'bg-white border-slate-300 text-slate-300'
                  }`}
                >
                  {isPlaced ? piece.name : '❓'}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            {puzzlePieces.map((piece) => {
              const isPlaced = placedPieces.includes(piece.position);
              if (isPlaced) return null;
              const isSelected = selectedPiece === piece.id;
              return (
                <button
                  key={piece.id}
                  onClick={() => handleSelectPiece(piece.id)}
                  className={`px-4 py-3 rounded-xl font-bold text-xs shadow ${
                    isSelected ? 'bg-indigo-600 text-white ring-4 ring-indigo-300' : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {piece.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BUBBLE POP */}
      {activeSubMode === 'bubble' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center">
          <h3 className="text-2xl font-black text-rose-900 mb-1">Pop Tap Presisi</h3>
          <div className="relative w-full h-60 bg-sky-100 rounded-2xl border-4 border-sky-200 overflow-hidden shadow-inner">
            {bubbles.map((b) => (
              <button
                key={b.id}
                onClick={() => popBubble(b.id)}
                style={{ top: `${b.y}%`, left: `${b.x}%`, width: `${b.size}px`, height: `${b.size}px` }}
                className={`absolute rounded-full shadow border-2 border-white animate-bounce flex items-center justify-center text-2xl ${b.color}`}
              >
                ✨
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
