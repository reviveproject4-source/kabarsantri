import React, { useState } from 'react';
import { BulanCurriculum, KategoriUsiaSpesifik, KategoriMateri } from '../../types/paudTypes';
import { soundFx } from '../../utils/soundEffects';

interface GameLogikaProps {
  onScoreUpdate?: (game: 'pencocokanBentuk' | 'mengurutkanUkuran' | 'menghitungBenda' | 'polaWarna', score: number) => void;
  usiaSpesifik?: KategoriUsiaSpesifik;
  materiKhusus?: KategoriMateri;
  bulan?: BulanCurriculum;
}

export const GameLogika: React.FC<GameLogikaProps> = ({
  onScoreUpdate,
  usiaSpesifik = '3_tahun',
  materiKhusus = 'buah',
  bulan = 1
}) => {
  const [activeSubMode, setActiveSubMode] = useState<
    'bentuk' | 'ukuran' | 'hitung' | 'pola' | 'labirin' | 'memori' | 'klasifikasi' | 'refleks'
  >('bentuk');
  const [selectedTopic, setSelectedTopic] = useState<KategoriMateri>(materiKhusus);

  // DATA ITEM GAMBAR SESUAI TOPIK
  const getTopicItems = (topic: KategoriMateri) => {
    switch (topic) {
      case 'buah':
        return [
          { id: 'apel', name: 'Apel', symbol: '🍎' },
          { id: 'pisang', name: 'Pisang', symbol: '🍌' },
          { id: 'jeruk', name: 'Jeruk', symbol: '🍊' },
          { id: 'semangka', name: 'Semangka', symbol: '🍉' }
        ];
      case 'sayur':
        return [
          { id: 'wortel', name: 'Wortel', symbol: '🥕' },
          { id: 'brokoli', name: 'Brokoli', symbol: '🥦' },
          { id: 'jagung', name: 'Jagung', symbol: '🌽' },
          { id: 'terong', name: 'Terong', symbol: '🍆' }
        ];
      case 'kendaraan':
        return [
          { id: 'mobil', name: 'Mobil', symbol: '🚗' },
          { id: 'pesawat', name: 'Pesawat', symbol: '✈️' },
          { id: 'sepeda', name: 'Sepeda', symbol: '🚲' },
          { id: 'truk', name: 'Truk', symbol: '🚚' }
        ];
      case 'hewan':
        return [
          { id: 'singa', name: 'Singa', symbol: '🦁' },
          { id: 'katak', name: 'Katak', symbol: '🐸' },
          { id: 'kelinci', name: 'Kelinci', symbol: '🐰' },
          { id: 'burung', name: 'Burung', symbol: '🦜' }
        ];
      default:
        return [
          { id: 'bintang', name: 'Bintang', symbol: '⭐' },
          { id: 'lingkaran', name: 'Lingkaran', symbol: '🔴' },
          { id: 'persegi', name: 'Persegi', symbol: '🟦' },
          { id: 'segitiga', name: 'Segitiga', symbol: '🔺' }
        ];
    }
  };

  const shapesList = getTopicItems(selectedTopic);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [matchedShapes, setMatchedShapes] = useState<string[]>([]);

  // SIZE SORTING TEMATIK
  const getSizeItemsByTopic = (topic: KategoriMateri) => {
    if (topic === 'buah') {
      return [
        { id: 3, label: 'Besar 🍉', sizeClass: 'text-6xl p-6', order: 3 },
        { id: 1, label: 'Kecil 🍓', sizeClass: 'text-2xl p-2', order: 1 },
        { id: 2, label: 'Sedang 🍎', sizeClass: 'text-4xl p-4', order: 2 }
      ];
    }
    if (topic === 'sayur') {
      return [
        { id: 3, label: 'Besar 🎃', sizeClass: 'text-6xl p-6', order: 3 },
        { id: 1, label: 'Kecil 🍄', sizeClass: 'text-2xl p-2', order: 1 },
        { id: 2, label: 'Sedang 🥕', sizeClass: 'text-4xl p-4', order: 2 }
      ];
    }
    if (topic === 'kendaraan') {
      return [
        { id: 3, label: 'Besar ✈️', sizeClass: 'text-6xl p-6', order: 3 },
        { id: 1, label: 'Kecil 🚲', sizeClass: 'text-2xl p-2', order: 1 },
        { id: 2, label: 'Sedang 🚗', sizeClass: 'text-4xl p-4', order: 2 }
      ];
    }
    return [
      { id: 3, label: 'Besar 🐘', sizeClass: 'text-6xl p-6', order: 3 },
      { id: 1, label: 'Kecil 🐭', sizeClass: 'text-2xl p-2', order: 1 },
      { id: 2, label: 'Sedang 🐱', sizeClass: 'text-4xl p-4', order: 2 }
    ];
  };

  const sizeItems = getSizeItemsByTopic(selectedTopic);
  const [userSizeOrder, setUserSizeOrder] = useState<number[]>([]);
  const [sizeCompleted, setSizeCompleted] = useState(false);

  // TARGET HITUNG SESUAI UMUR
  const getTargetCountByAge = (age: KategoriUsiaSpesifik) => {
    switch (age) {
      case '2_tahun': return 3;
      case '3_tahun': return 5;
      case '4_tahun': return 8;
      case '5_tahun': return 10;
      default: return 5;
    }
  };

  const targetCount = getTargetCountByAge(usiaSpesifik);
  const [countedItems, setCountedItems] = useState<number[]>([]);
  const countingIcon = selectedTopic === 'buah' ? '🍎' : selectedTopic === 'sayur' ? '🥕' : selectedTopic === 'kendaraan' ? '🚗' : selectedTopic === 'hewan' ? '🐰' : '⭐';

  // POLA URUTAN
  const [patternIndex, setPatternIndex] = useState(0);
  const patternsByTopic = [
    { sequence: ['🍎', '🍌', '🍎'], answer: '🍌', options: ['🍎', '🍌', '🍊'] },
    { sequence: ['🥦', '🥕', '🥦'], answer: '🥕', options: ['🥦', '🥕', '🌽'] },
    { sequence: ['🚗', '✈️', '🚗'], answer: '✈️', options: ['🚗', '✈️', '🚲'] },
    { sequence: ['🦁', '🐰', '🦁'], answer: '🐰', options: ['🦁', '🐰', '🐸'] }
  ];
  const [polaSuccess, setPolaSuccess] = useState(false);

  // 🧭 NEW MODUL 1: LABIRIN ARAH & PATHFINDING
  const [mazePos, setMazePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mazeTarget = { x: 2, y: 2 };
  const playerIcon = selectedTopic === 'kendaraan' ? '🚗' : selectedTopic === 'sayur' ? '🐰' : '👦';
  const targetGoalIcon = selectedTopic === 'kendaraan' ? '🏠' : selectedTopic === 'sayur' ? '🥕' : '⭐';
  const [mazeCompleted, setMazeCompleted] = useState(false);

  const moveMaze = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (mazeCompleted) return;
    soundFx.playPop();
    let { x, y } = mazePos;
    if (dir === 'UP' && y > 0) y -= 1;
    if (dir === 'DOWN' && y < 2) y += 1;
    if (dir === 'LEFT' && x > 0) x -= 1;
    if (dir === 'RIGHT' && x < 2) x += 1;

    setMazePos({ x, y });
    if (x === mazeTarget.x && y === mazeTarget.y) {
      soundFx.playFanfare();
      setMazeCompleted(true);
      if (onScoreUpdate) onScoreUpdate('pencocokanBentuk', 100);
    }
  };

  const resetMaze = () => {
    setMazePos({ x: 0, y: 0 });
    setMazeCompleted(false);
  };

  // 🔊 NEW MODUL 2: KARTU MEMORI FLIP (PAIR CARDS)
  const initialMemoryCards = [
    { id: 1, symbol: '🍎', flipped: false, matched: false },
    { id: 2, symbol: '🍌', flipped: false, matched: false },
    { id: 3, symbol: '🍎', flipped: false, matched: false },
    { id: 4, symbol: '🍌', flipped: false, matched: false }
  ];
  const [memoryCards, setMemoryCards] = useState(initialMemoryCards);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);

  const handleCardClick = (id: number) => {
    if (flippedIds.length === 2) return;
    const card = memoryCards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    soundFx.playPop();
    const updatedCards = memoryCards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    setMemoryCards(updatedCards);
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = updatedCards.find((c) => c.id === newFlipped[0])!;
      const card2 = updatedCards.find((c) => c.id === newFlipped[1])!;
      if (card1.symbol === card2.symbol) {
        soundFx.playSuccess();
        setMemoryCards((prev) =>
          prev.map((c) => (c.symbol === card1.symbol ? { ...c, matched: true } : c))
        );
        setFlippedIds([]);
      } else {
        soundFx.playTryAgain();
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c) => (newFlipped.includes(c.id) ? { ...c, flipped: false } : c))
          );
          setFlippedIds([]);
        }, 1000);
      }
    }
  };

  const resetMemory = () => {
    setMemoryCards(initialMemoryCards);
    setFlippedIds([]);
  };

  // ⚖️ NEW MODUL 3: TIMBANGAN & KLASIFIKASI KERANJANG
  const [basketFruit, setBasketFruit] = useState<string[]>([]);
  const [basketVeggie, setBasketVeggie] = useState<string[]>([]);
  const itemsToClassify = [
    { id: 'i1', name: 'Apel', symbol: '🍎', type: 'buah' },
    { id: 'i2', name: 'Wortel', symbol: '🥕', type: 'sayur' },
    { id: 'i3', name: 'Pisang', symbol: '🍌', type: 'buah' },
    { id: 'i4', name: 'Brokoli', symbol: '🥦', type: 'sayur' }
  ];
  const [classifiedIds, setClassifiedIds] = useState<string[]>([]);

  const handleClassifyItem = (itemId: string, targetType: 'buah' | 'sayur') => {
    const item = itemsToClassify.find((i) => i.id === itemId);
    if (!item || classifiedIds.includes(itemId)) return;

    if (item.type === targetType) {
      soundFx.playSuccess();
      setClassifiedIds([...classifiedIds, itemId]);
      if (targetType === 'buah') setBasketFruit([...basketFruit, item.symbol]);
      else setBasketVeggie([...basketVeggie, item.symbol]);

      if (classifiedIds.length + 1 === itemsToClassify.length) {
        soundFx.playFanfare();
      }
    } else {
      soundFx.playTryAgain();
    }
  };

  // 🎯 NEW MODUL 4: REFLEKS KETUK SASARAN KECEPATAN
  const [refleksTarget, setRefleksTarget] = useState<number>(0);
  const [refleksScore, setRefleksScore] = useState<number>(0);
  const [refleksActive, setRefleksActive] = useState<boolean>(false);

  const startRefleksGame = () => {
    soundFx.playSuccess();
    setRefleksScore(0);
    setRefleksActive(true);
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setRefleksTarget(Math.floor(Math.random() * 4));
      if (count >= 10) {
        clearInterval(interval);
        setRefleksActive(false);
        soundFx.playFanfare();
      }
    }, 1200);
  };

  const handleTapRefleksTarget = (index: number) => {
    if (!refleksActive) return;
    if (index === refleksTarget) {
      soundFx.playPop();
      setRefleksScore((prev) => prev + 10);
    } else {
      soundFx.playTryAgain();
    }
  };

  // HANDLERS UMUM
  const handleSelectShape = (id: string) => {
    soundFx.playPop();
    setSelectedShape(id);
  };

  const handleTargetClick = (targetId: string) => {
    if (selectedShape === targetId && !matchedShapes.includes(targetId)) {
      soundFx.playSuccess();
      const updated = [...matchedShapes, targetId];
      setMatchedShapes(updated);
      setSelectedShape(null);
      if (updated.length === shapesList.length) {
        soundFx.playFanfare();
        if (onScoreUpdate) onScoreUpdate('pencocokanBentuk', 100);
      }
    } else {
      soundFx.playTryAgain();
    }
  };

  const handleTapSize = (item: { id: number; order: number }) => {
    soundFx.playPop();
    const expectedNext = userSizeOrder.length + 1;
    if (item.order === expectedNext) {
      soundFx.playSuccess();
      const newOrder = [...userSizeOrder, item.id];
      setUserSizeOrder(newOrder);
      if (newOrder.length === sizeItems.length) {
        soundFx.playFanfare();
        setSizeCompleted(true);
        if (onScoreUpdate) onScoreUpdate('mengurutkanUkuran', 100);
      }
    } else {
      soundFx.playTryAgain();
    }
  };

  const resetSizeGame = () => {
    setUserSizeOrder([]);
    setSizeCompleted(false);
  };

  const handleCountItem = (index: number) => {
    if (countedItems.includes(index)) return;
    const nextCount = countedItems.length + 1;
    soundFx.playCount(nextCount);
    const updated = [...countedItems, index];
    setCountedItems(updated);
    if (updated.length === targetCount) {
      setTimeout(() => soundFx.playFanfare(), 300);
      if (onScoreUpdate) onScoreUpdate('menghitungBenda', 100);
    }
  };

  const resetCountGame = () => {
    setCountedItems([]);
  };

  const handleChoosePatternAnswer = (choice: string) => {
    const currentPattern = patternsByTopic[patternIndex % patternsByTopic.length];
    if (choice === currentPattern.answer) {
      soundFx.playSuccess();
      setPolaSuccess(true);
      if (onScoreUpdate) onScoreUpdate('polaWarna', 100);
    } else {
      soundFx.playTryAgain();
    }
  };

  const nextPattern = () => {
    setPolaSuccess(false);
    setPatternIndex((prev) => (prev + 1) % patternsByTopic.length);
  };

  return (
    <div className="bg-gradient-to-b from-amber-50 to-orange-100 min-h-full p-4 rounded-3xl shadow-lg border-4 border-amber-200 space-y-4">
      {/* SELEKTOR MATERI KHUSUS */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 p-3 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-black text-amber-900 px-2">Topik:</span>
          {[
            { id: 'buah', label: '🍎 Buah' },
            { id: 'sayur', label: '🥦 Sayur' },
            { id: 'kendaraan', label: '🚗 Kendaraan' },
            { id: 'hewan', label: '🦁 Hewan' },
            { id: 'bentuk_warna', label: '⭐ Bentuk' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { soundFx.playPop(); setSelectedTopic(t.id as KategoriMateri); setMatchedShapes([]); }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-transform active:scale-95 ${
                selectedTopic === t.id ? 'bg-amber-500 text-white shadow' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-black bg-amber-200 text-amber-950 px-3 py-1 rounded-full">
          Level Usia {usiaSpesifik.replace('_tahun', ' Tahun')} • Bulan #{bulan}
        </span>
      </div>

      {/* 8 SUBMODE / JENIS MODUL MAINAN */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('bentuk'); }}
          className={`px-3 py-2.5 rounded-2xl font-bold text-xs shadow transition-transform active:scale-95 flex items-center justify-center gap-1 ${
            activeSubMode === 'bentuk' ? 'bg-red-500 text-white ring-4 ring-red-300' : 'bg-white text-red-600 hover:bg-red-50'
          }`}
        >
          <span>🧩</span> Cocokkan
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('ukuran'); }}
          className={`px-3 py-2.5 rounded-2xl font-bold text-xs shadow transition-transform active:scale-95 flex items-center justify-center gap-1 ${
            activeSubMode === 'ukuran' ? 'bg-amber-500 text-white ring-4 ring-amber-300' : 'bg-white text-amber-600 hover:bg-amber-50'
          }`}
        >
          <span>📏</span> Ukuran
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('hitung'); }}
          className={`px-3 py-2.5 rounded-2xl font-bold text-xs shadow transition-transform active:scale-95 flex items-center justify-center gap-1 ${
            activeSubMode === 'hitung' ? 'bg-emerald-500 text-white ring-4 ring-emerald-300' : 'bg-white text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <span>🔢</span> Hitung (1-{targetCount})
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('pola'); }}
          className={`px-3 py-2.5 rounded-2xl font-bold text-xs shadow transition-transform active:scale-95 flex items-center justify-center gap-1 ${
            activeSubMode === 'pola' ? 'bg-purple-500 text-white ring-4 ring-purple-300' : 'bg-white text-purple-600 hover:bg-purple-50'
          }`}
        >
          <span>🎨</span> Pola Urutan
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('labirin'); }}
          className={`px-3 py-2.5 rounded-2xl font-bold text-xs shadow transition-transform active:scale-95 flex items-center justify-center gap-1 ${
            activeSubMode === 'labirin' ? 'bg-blue-600 text-white ring-4 ring-blue-300' : 'bg-white text-blue-700 hover:bg-blue-50'
          }`}
        >
          <span>🧭</span> Labirin Arah (NEW!)
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('memori'); }}
          className={`px-3 py-2.5 rounded-2xl font-bold text-xs shadow transition-transform active:scale-95 flex items-center justify-center gap-1 ${
            activeSubMode === 'memori' ? 'bg-rose-600 text-white ring-4 ring-rose-300' : 'bg-white text-rose-700 hover:bg-rose-50'
          }`}
        >
          <span>🃏</span> Memori Kartu (NEW!)
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('klasifikasi'); }}
          className={`px-3 py-2.5 rounded-2xl font-bold text-xs shadow transition-transform active:scale-95 flex items-center justify-center gap-1 ${
            activeSubMode === 'klasifikasi' ? 'bg-teal-600 text-white ring-4 ring-teal-300' : 'bg-white text-teal-700 hover:bg-teal-50'
          }`}
        >
          <span>⚖️</span> Klasifikasi (NEW!)
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('refleks'); }}
          className={`px-3 py-2.5 rounded-2xl font-bold text-xs shadow transition-transform active:scale-95 flex items-center justify-center gap-1 ${
            activeSubMode === 'refleks' ? 'bg-orange-600 text-white ring-4 ring-orange-300' : 'bg-white text-orange-700 hover:bg-orange-50'
          }`}
        >
          <span>🎯</span> Refleks Tap (NEW!)
        </button>
      </div>

      {/* GAME 1: SHAPE/ITEM MATCHING */}
      {activeSubMode === 'bentuk' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center">
          <h3 className="text-2xl font-black text-amber-900 mb-1">Pilih Gambar {selectedTopic.toUpperCase()} & Sentuh Bayangannya!</h3>
          <p className="text-amber-700 text-sm mb-6">Cocokkan gambar untuk Usia {usiaSpesifik.replace('_tahun', ' Tahun')}.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {shapesList.map((shape) => {
              const isMatched = matchedShapes.includes(shape.id);
              return (
                <div
                  key={shape.id}
                  onClick={() => handleTargetClick(shape.id)}
                  className={`h-36 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    isMatched
                      ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-md'
                      : 'border-slate-300 bg-slate-100/70 hover:bg-slate-200'
                  }`}
                >
                  {isMatched ? (
                    <div className="text-6xl animate-bounce">{shape.symbol}</div>
                  ) : (
                    <div className="text-5xl opacity-20 filter grayscale">❓</div>
                  )}
                  <span className="mt-2 text-xs font-bold text-slate-500">{isMatched ? shape.name : 'Bayangan'}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            {shapesList.map((shape) => {
              const isMatched = matchedShapes.includes(shape.id);
              const isSelected = selectedShape === shape.id;
              if (isMatched) return null;
              return (
                <button
                  key={shape.id}
                  onClick={() => handleSelectShape(shape.id)}
                  className={`px-6 py-4 rounded-2xl text-4xl shadow-lg transition-transform active:scale-95 ${
                    isSelected ? 'ring-8 ring-amber-400 scale-110 bg-amber-100' : 'bg-amber-200 hover:bg-amber-300'
                  }`}
                >
                  {shape.symbol}
                </button>
              );
            })}
          </div>

          {matchedShapes.length === shapesList.length && (
            <div className="mt-6 p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl animate-pulse">
              <span className="text-3xl">🎉 HEBAT SEKALI! 🎉</span>
              <p className="text-emerald-800 font-bold mt-1">Semua gambar {selectedTopic} sudah cocok!</p>
              <button
                onClick={() => { setMatchedShapes([]); setSelectedShape(null); }}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow hover:bg-emerald-700"
              >
                Main Lagi 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: SIZE SORTING */}
      {activeSubMode === 'ukuran' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center">
          <h3 className="text-2xl font-black text-amber-900 mb-2">Urutkan dari Paling KECIL ke BESAR!</h3>
          <p className="text-amber-700 text-sm mb-6">Tekan benda yang paling kecil terlebih dahulu.</p>

          <div className="flex flex-wrap items-end justify-center gap-6 min-h-[160px] mb-6">
            {sizeItems.map((item) => {
              const isTapped = userSizeOrder.includes(item.id);
              return (
                <button
                  key={item.id}
                  disabled={isTapped}
                  onClick={() => handleTapSize(item)}
                  className={`rounded-2xl border-4 transition-all duration-300 active:scale-90 ${
                    isTapped
                      ? 'border-emerald-500 bg-emerald-100 opacity-60 grayscale'
                      : 'border-amber-300 bg-amber-50 hover:bg-amber-100 hover:scale-105 shadow-lg'
                  }`}
                >
                  <div className={item.sizeClass}>{item.label}</div>
                  {isTapped && <div className="text-xs font-bold text-emerald-700 pb-1">Urutan #{userSizeOrder.indexOf(item.id) + 1}</div>}
                </button>
              );
            })}
          </div>

          {sizeCompleted && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl">
              <span className="text-3xl">🌟 PINTAR! 🌟</span>
              <p className="text-emerald-800 font-bold">Kamu berhasil mengurutkannya dengan benar!</p>
              <button
                onClick={resetSizeGame}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow hover:bg-emerald-700"
              >
                Ulangi Urutan 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 3: COUNTING 1-10 */}
      {activeSubMode === 'hitung' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center">
          <h3 className="text-2xl font-black text-amber-900 mb-1">Hitung {countingIcon} (Target Usia {usiaSpesifik.replace('_tahun', ' Tahun')})</h3>
          <p className="text-amber-700 text-sm mb-4">Sentuh setiap {countingIcon} sampai hitungan {targetCount}.</p>

          <div className="text-5xl font-black text-emerald-600 mb-6 h-12">
            {countedItems.length > 0 ? `Hitungan: ${countedItems.length} / ${targetCount}` : 'Mulai Sentuh!'}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {Array.from({ length: targetCount }).map((_, idx) => {
              const isCounted = countedItems.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleCountItem(idx)}
                  className={`w-16 h-16 rounded-2xl text-3xl shadow-xl flex items-center justify-center transition-transform active:scale-90 ${
                    isCounted
                      ? 'bg-yellow-400 border-4 border-yellow-200 scale-110 animate-bounce'
                      : 'bg-slate-100 border-4 border-slate-300 hover:bg-yellow-100'
                  }`}
                >
                  {isCounted ? countingIcon : '✨'}
                </button>
              );
            })}
          </div>

          {countedItems.length === targetCount && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl">
              <span className="text-3xl">🎈 LUAR BIASA! 🎈</span>
              <p className="text-emerald-800 font-bold">Kamu menghitung sampai {targetCount}!</p>
              <button
                onClick={resetCountGame}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow hover:bg-emerald-700"
              >
                Hitung Lagi 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 4: COLOR PATTERN */}
      {activeSubMode === 'pola' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center">
          <h3 className="text-2xl font-black text-amber-900 mb-2">Lengkapi Pola {selectedTopic.toUpperCase()}!</h3>
          <p className="text-amber-700 text-sm mb-6">Pilih gambar berikutnya yang cocok dengan urutan di bawah.</p>

          <div className="flex justify-center items-center gap-4 mb-8">
            {patternsByTopic[patternIndex % patternsByTopic.length].sequence.map((item, idx) => (
              <div key={idx} className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl border-2 border-slate-300 shadow">
                {item}
              </div>
            ))}
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-4xl border-4 border-dashed border-purple-400 animate-pulse">
              ❓
            </div>
          </div>

          <p className="font-bold text-slate-700 mb-4">Pilih Jawaban:</p>
          <div className="flex justify-center gap-4 mb-6">
            {patternsByTopic[patternIndex % patternsByTopic.length].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleChoosePatternAnswer(option)}
                className="w-16 h-16 bg-purple-200 hover:bg-purple-300 rounded-2xl text-4xl shadow-lg transition-transform active:scale-90 flex items-center justify-center border-2 border-purple-400"
              >
                {option}
              </button>
            ))}
          </div>

          {polaSuccess && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl">
              <span className="text-3xl">👏 TEPAT SEKALI! 👏</span>
              <p className="text-emerald-800 font-bold mb-2">Pola berhasil kamu selesaikan!</p>
              <button
                onClick={nextPattern}
                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow hover:bg-purple-700"
              >
                Soal Berikutnya ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🧭 GAME 5 (NEW!): LABIRIN ARAH & PATHFINDING */}
      {activeSubMode === 'labirin' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <h3 className="text-2xl font-black text-blue-900">🧭 Labirin Arah & Jalan Pintu</h3>
          <p className="text-blue-700 text-sm">Gunakan tombol panah untuk mengarahkan {playerIcon} menuju {targetGoalIcon}!</p>

          <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto bg-blue-50 p-3 rounded-2xl border-4 border-blue-200 shadow-md">
            {[0, 1, 2].map((y) =>
              [0, 1, 2].map((x) => {
                const isPlayer = mazePos.x === x && mazePos.y === y;
                const isGoal = mazeTarget.x === x && mazeTarget.y === y;
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`rounded-xl border-2 border-dashed flex items-center justify-center text-3xl font-black transition-all ${
                      isPlayer ? 'bg-blue-500 border-blue-600 text-white scale-105 shadow animate-bounce' : isGoal ? 'bg-amber-100 border-amber-400' : 'bg-white border-slate-200'
                    }`}
                  >
                    {isPlayer ? playerIcon : isGoal ? targetGoalIcon : ''}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <button onClick={() => moveMaze('UP')} className="w-14 h-14 bg-blue-500 text-white text-2xl font-bold rounded-2xl shadow active:scale-90">⬆️</button>
            <div className="flex gap-4">
              <button onClick={() => moveMaze('LEFT')} className="w-14 h-14 bg-blue-500 text-white text-2xl font-bold rounded-2xl shadow active:scale-90">⬅️</button>
              <button onClick={() => moveMaze('DOWN')} className="w-14 h-14 bg-blue-500 text-white text-2xl font-bold rounded-2xl shadow active:scale-90">⬇️</button>
              <button onClick={() => moveMaze('RIGHT')} className="w-14 h-14 bg-blue-500 text-white text-2xl font-bold rounded-2xl shadow active:scale-90">➡️</button>
            </div>
          </div>

          {mazeCompleted && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl">
              <span className="text-3xl">🎉 KAMU SAMPAI TUJUAN! 🎉</span>
              <button onClick={resetMaze} className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">Main Lagi 🔄</button>
            </div>
          )}
        </div>
      )}

      {/* 🃏 GAME 6 (NEW!): MEMORI KARTU FLIP (PAIR CARDS) */}
      {activeSubMode === 'memori' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <h3 className="text-2xl font-black text-rose-900">🃏 Tebak & Ingat Pasangan Kartu!</h3>
          <p className="text-rose-700 text-sm">Buka 2 kartu dan temukan gambar yang sama.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-72 mx-auto">
            {memoryCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`h-24 rounded-2xl border-4 flex items-center justify-center text-4xl cursor-pointer transition-all duration-300 shadow ${
                  card.flipped || card.matched ? 'bg-rose-100 border-rose-400 scale-105' : 'bg-rose-500 border-rose-600 text-white'
                }`}
              >
                {card.flipped || card.matched ? card.symbol : '❓'}
              </div>
            ))}
          </div>

          {memoryCards.every((c) => c.matched) && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl">
              <span className="text-3xl">👏 INGATAN HEBAT! 👏</span>
              <button onClick={resetMemory} className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">Ulangi Kartu 🔄</button>
            </div>
          )}
        </div>
      )}

      {/* ⚖️ GAME 7 (NEW!): KLASIFIKASI KERANJANG CATEGORY */}
      {activeSubMode === 'klasifikasi' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <h3 className="text-2xl font-black text-teal-900">⚖️ Pisahkan Buah & Sayur!</h3>
          <p className="text-teal-700 text-sm">Tekan makanan di atas lalu pilih keranjang yang tepat.</p>

          <div className="flex justify-center gap-4 my-4">
            {itemsToClassify.map((item) => {
              const isClassified = classifiedIds.includes(item.id);
              if (isClassified) return null;
              return (
                <div key={item.id} className="p-4 bg-amber-100 border-2 border-amber-300 rounded-2xl text-4xl shadow animate-bounce">
                  {item.symbol}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div
              onClick={() => {
                const remaining = itemsToClassify.find((i) => !classifiedIds.includes(i.id));
                if (remaining) handleClassifyItem(remaining.id, 'buah');
              }}
              className="p-4 bg-red-100 border-4 border-red-300 rounded-3xl cursor-pointer hover:bg-red-200 shadow"
            >
              <span className="text-4xl">🧺🍎</span>
              <h4 className="font-black text-red-900 text-sm mt-1">Keranjang BUAH</h4>
              <div className="flex justify-center gap-1 mt-2 text-2xl">{basketFruit.map((s, i) => <span key={i}>{s}</span>)}</div>
            </div>

            <div
              onClick={() => {
                const remaining = itemsToClassify.find((i) => !classifiedIds.includes(i.id));
                if (remaining) handleClassifyItem(remaining.id, 'sayur');
              }}
              className="p-4 bg-emerald-100 border-4 border-emerald-300 rounded-3xl cursor-pointer hover:bg-emerald-200 shadow"
            >
              <span className="text-4xl">🧺🥦</span>
              <h4 className="font-black text-emerald-900 text-sm mt-1">Keranjang SAYUR</h4>
              <div className="flex justify-center gap-1 mt-2 text-2xl">{basketVeggie.map((s, i) => <span key={i}>{s}</span>)}</div>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 GAME 8 (NEW!): REFLEKS KETUK SASARAN KECEPATAN */}
      {activeSubMode === 'refleks' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <h3 className="text-2xl font-black text-orange-900">🎯 Ketuk Sasaran Cepat!</h3>
          <p className="text-orange-700 text-sm">Ketuk sasaran yang muncul secepat mungkin!</p>

          <div className="text-xl font-black text-amber-700">Skor Refleks: {refleksScore}</div>

          <div className="grid grid-cols-2 gap-4 w-64 mx-auto my-4">
            {[0, 1, 2, 3].map((idx) => {
              const isTarget = refleksActive && refleksTarget === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleTapRefleksTarget(idx)}
                  className={`h-24 rounded-2xl border-4 text-4xl shadow transition-transform active:scale-90 flex items-center justify-center ${
                    isTarget ? 'bg-orange-400 border-orange-600 animate-ping scale-110' : 'bg-slate-100 border-slate-300'
                  }`}
                >
                  {isTarget ? countingIcon : '🕳️'}
                </button>
              );
            })}
          </div>

          {!refleksActive && (
            <button onClick={startRefleksGame} className="px-6 py-3 bg-orange-600 text-white font-black text-lg rounded-2xl shadow hover:bg-orange-700">
              Mulai Tantangan Refleks! 🚀
            </button>
          )}
        </div>
      )}
    </div>
  );
};
