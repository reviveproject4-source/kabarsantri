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
    'bentuk' | 'ukuran' | 'hitung' | 'pola' | 'labirin' | 'memori' | 'klasifikasi' | 'refleks' | 'cocok_angka' | 'cocok_huruf' | 'suku_kata' | 'matematika_belasan'
  >('bentuk');
  const [selectedTopic, setSelectedTopic] = useState<KategoriMateri>(materiKhusus);

  // INDEKS VARIASI GAME (ROTASI 3 VARIASI: 0, 1, 2)
  const [shapesVariationIndex, setShapesVariationIndex] = useState<number>(0);
  const [sizeVariationIndex, setSizeVariationIndex] = useState<number>(0);
  const [memoryVariationIndex, setMemoryVariationIndex] = useState<number>(0);
  const [patternVariationIndex, setPatternVariationIndex] = useState<number>(0);
  const [classifyVariationIndex, setClassifyVariationIndex] = useState<number>(0);
  const [matchNumberVarIndex, setMatchNumberVarIndex] = useState<number>(0);
  const [matchWordVarIndex, setMatchWordVarIndex] = useState<number>(0);
  const [sukuKataVarIndex, setSukuKataVarIndex] = useState<number>(0);
  const [mathBelasanVarIndex, setMathBelasanVarIndex] = useState<number>(0);

  // 1. DATA SHAPE MATCHING (3 VARIASI)
  const getTopicItemsWithVariations = (topic: KategoriMateri, variation: number) => {
    const varIdx = variation % 3;
    if (topic === 'buah') {
      const sets = [
        [
          { id: 'apel', name: 'Apel', symbol: '🍎' },
          { id: 'pisang', name: 'Pisang', symbol: '🍌' },
          { id: 'jeruk', name: 'Jeruk', symbol: '🍊' },
          { id: 'semangka', name: 'Semangka', symbol: '🍉' }
        ],
        [
          { id: 'nanas', name: 'Nanas', symbol: '🍍' },
          { id: 'pir', name: 'Pir', symbol: '🍐' },
          { id: 'stroberi', name: 'Stroberi', symbol: '🍓' },
          { id: 'anggur', name: 'Anggur', symbol: '🍇' }
        ],
        [
          { id: 'mangga', name: 'Mangga', symbol: '🥭' },
          { id: 'melon', name: 'Melon', symbol: '🍈' },
          { id: 'alpukat', name: 'Alpukat', symbol: '🥑' },
          { id: 'ceri', name: 'Ceri', symbol: '🍒' }
        ]
      ];
      return sets[varIdx];
    }
    const sets = [
      [
        { id: 'mobil', name: 'Mobil', symbol: '🚗' },
        { id: 'pesawat', name: 'Pesawat', symbol: '✈️' },
        { id: 'sepeda', name: 'Sepeda', symbol: '🚲' },
        { id: 'truk', name: 'Truk', symbol: '🚚' }
      ],
      [
        { id: 'kapal', name: 'Kapal', symbol: '🚢' },
        { id: 'kereta', name: 'Kereta', symbol: '🚂' },
        { id: 'helikopter', name: 'Helikopter', symbol: '🚁' },
        { id: 'bus', name: 'Bus', symbol: '🚌' }
      ],
      [
        { id: 'roket', name: 'Roket', symbol: '🚀' },
        { id: 'motor', name: 'Motor', symbol: '🛵' },
        { id: 'taksi', name: 'Taksi', symbol: '🚕' },
        { id: 'pemadam', name: 'Pemadam', symbol: '🚒' }
      ]
    ];
    return sets[varIdx];
  };

  const shapesList = getTopicItemsWithVariations(selectedTopic, shapesVariationIndex);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [matchedShapes, setMatchedShapes] = useState<string[]>([]);

  const resetShapesGame = () => {
    soundFx.playPop();
    setShapesVariationIndex((prev) => (prev + 1) % 3);
    setMatchedShapes([]);
    setSelectedShape(null);
  };

  // 2. SIZE SORTING
  const getSizeItemsWithVariations = (topic: KategoriMateri, variation: number) => {
    const varIdx = variation % 3;
    const sets = [
      [
        { id: 3, label: 'Besar 🍉', sizeClass: 'text-6xl p-6', order: 3 },
        { id: 1, label: 'Kecil 🍓', sizeClass: 'text-2xl p-2', order: 1 },
        { id: 2, label: 'Sedang 🍎', sizeClass: 'text-4xl p-4', order: 2 }
      ],
      [
        { id: 3, label: 'Besar 🎃', sizeClass: 'text-6xl p-6', order: 3 },
        { id: 1, label: 'Kecil 🍄', sizeClass: 'text-2xl p-2', order: 1 },
        { id: 2, label: 'Sedang 🥕', sizeClass: 'text-4xl p-4', order: 2 }
      ],
      [
        { id: 3, label: 'Besar ✈️', sizeClass: 'text-6xl p-6', order: 3 },
        { id: 1, label: 'Kecil 🚲', sizeClass: 'text-2xl p-2', order: 1 },
        { id: 2, label: 'Sedang 🚗', sizeClass: 'text-4xl p-4', order: 2 }
      ]
    ];
    return sets[varIdx];
  };

  const sizeItems = getSizeItemsWithVariations(selectedTopic, sizeVariationIndex);
  const [userSizeOrder, setUserSizeOrder] = useState<number[]>([]);
  const [sizeCompleted, setSizeCompleted] = useState(false);

  const resetSizeGame = () => {
    soundFx.playPop();
    setSizeVariationIndex((prev) => (prev + 1) % 3);
    setUserSizeOrder([]);
    setSizeCompleted(false);
  };

  // 3. TARGET HITUNG SESUAI UMUR
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

  // 4. MEMORI KARTU FLIP
  const getMemoryCardsSet = (variation: number) => {
    const varIdx = variation % 3;
    const sets = [
      [
        { id: 1, symbol: '🍎', flipped: false, matched: false },
        { id: 2, symbol: '🍌', flipped: false, matched: false },
        { id: 3, symbol: '🍎', flipped: false, matched: false },
        { id: 4, symbol: '🍌', flipped: false, matched: false }
      ],
      [
        { id: 1, symbol: '🍍', flipped: false, matched: false },
        { id: 2, symbol: '🍐', flipped: false, matched: false },
        { id: 3, symbol: '🍐', flipped: false, matched: false },
        { id: 4, symbol: '🍍', flipped: false, matched: false }
      ],
      [
        { id: 1, symbol: '🥭', flipped: false, matched: false },
        { id: 2, symbol: '🍉', flipped: false, matched: false },
        { id: 3, symbol: '🥭', flipped: false, matched: false },
        { id: 4, symbol: '🍉', flipped: false, matched: false }
      ]
    ];
    return sets[varIdx];
  };

  const [memoryCards, setMemoryCards] = useState(() => getMemoryCardsSet(0));
  const [flippedIds, setFlippedIds] = useState<number[]>([]);

  const resetMemoryGame = () => {
    soundFx.playPop();
    const nextVar = (memoryVariationIndex + 1) % 3;
    setMemoryVariationIndex(nextVar);
    setMemoryCards(getMemoryCardsSet(nextVar));
    setFlippedIds([]);
  };

  // 5. POLA URUTAN
  const patternsByTopic = [
    { sequence: ['🍎', '🍌', '🍎'], answer: '🍌', options: ['🍎', '🍌', '🍊'] },
    { sequence: ['🍍', '🍐', '🍍'], answer: '🍐', options: ['🍍', '🍐', '🍓'] },
    { sequence: ['🥦', '🥕', '🥦'], answer: '🥕', options: ['🥦', '🥕', '🌽'] }
  ];
  const [polaSuccess, setPolaSuccess] = useState(false);

  const nextPattern = () => {
    soundFx.playPop();
    setPolaSuccess(false);
    setPatternVariationIndex((prev) => (prev + 1) % 3);
  };

  // 6. KLASIFIKASI KERANJANG
  const getClassificationSet = (variation: number) => {
    const varIdx = variation % 3;
    const sets = [
      [
        { id: 'i1', name: 'Apel', symbol: '🍎', type: 'buah' },
        { id: 'i2', name: 'Wortel', symbol: '🥕', type: 'sayur' },
        { id: 'i3', name: 'Pisang', symbol: '🍌', type: 'buah' },
        { id: 'i4', name: 'Brokoli', symbol: '🥦', type: 'sayur' }
      ],
      [
        { id: 'i1', name: 'Nanas', symbol: '🍍', type: 'buah' },
        { id: 'i2', name: 'Terong', symbol: '🍆', type: 'sayur' },
        { id: 'i3', name: 'Pir', symbol: '🍐', type: 'buah' },
        { id: 'i4', name: 'Jagung', symbol: '🌽', type: 'sayur' }
      ],
      [
        { id: 'i1', name: 'Semangka', symbol: '🍉', type: 'buah' },
        { id: 'i2', name: 'Jamur', symbol: '🍄', type: 'sayur' },
        { id: 'i3', name: 'Mangga', symbol: '🥭', type: 'buah' },
        { id: 'i4', name: 'Labu', symbol: '🎃', type: 'sayur' }
      ]
    ];
    return sets[varIdx];
  };

  const itemsToClassify = getClassificationSet(classifyVariationIndex);
  const [classifiedIds, setClassifiedIds] = useState<string[]>([]);
  const [basketFruit, setBasketFruit] = useState<string[]>([]);
  const [basketVeggie, setBasketVeggie] = useState<string[]>([]);

  const resetClassifyGame = () => {
    soundFx.playPop();
    setClassifyVariationIndex((prev) => (prev + 1) % 3);
    setClassifiedIds([]);
    setBasketFruit([]);
    setBasketVeggie([]);
  };

  // 7. COCOK JUMLAH GAMBAR ➔ ANGKA ACAK (Usia 3th Sem 2 & Usia 4th Sem 1)
  const matchNumberSets = [
    {
      gambarCount: 4,
      gambarIcon: '🍎🍎🍎🍎',
      correctNumber: 4,
      options: [
        { label: '2', val: 2 },
        { label: '5', val: 5 },
        { label: '4', val: 4 }
      ]
    },
    {
      gambarCount: 6,
      gambarIcon: '🍌🍌🍌🍌🍌🍌',
      correctNumber: 6,
      options: [
        { label: '6', val: 6 },
        { label: '3', val: 3 },
        { label: '8', val: 8 }
      ]
    },
    {
      gambarCount: 3,
      gambarIcon: '🚗🚗🚗',
      correctNumber: 3,
      options: [
        { label: '7', val: 7 },
        { label: '3', val: 3 },
        { label: '4', val: 4 }
      ]
    }
  ];

  const currentMatchNumSet = matchNumberSets[matchNumberVarIndex % matchNumberSets.length];
  const [selectedNumAnswer, setSelectedNumAnswer] = useState<number | null>(null);
  const [matchNumSuccess, setMatchNumSuccess] = useState(false);

  const handleChooseNumMatch = (val: number) => {
    soundFx.playPop();
    setSelectedNumAnswer(val);
    if (val === currentMatchNumSet.correctNumber) {
      soundFx.playSuccess();
      setMatchNumSuccess(true);
      if (onScoreUpdate) onScoreUpdate('menghitungBenda', 100);
    } else {
      soundFx.playTryAgain();
    }
  };

  const resetMatchNumGame = () => {
    soundFx.playPop();
    setMatchNumberVarIndex((prev) => (prev + 1) % 3);
    setSelectedNumAnswer(null);
    setMatchNumSuccess(false);
  };

  // 8. COCOK GAMBAR ➔ HURUF AWAL / KATA UTUH (Usia 5th / TK B)
  const matchWordSets = [
    {
      gambarSymbol: '🚗',
      namaBenda: 'Mobil',
      correctWord: 'Mobil',
      correctHuruf: 'M',
      options: ['Mobil', 'Apel', 'Sepeda']
    },
    {
      gambarSymbol: '🍎',
      namaBenda: 'Apel',
      correctWord: 'Apel',
      correctHuruf: 'A',
      options: ['Pisang', 'Apel', 'Jeruk']
    },
    {
      gambarSymbol: '🐰',
      namaBenda: 'Kelinci',
      correctWord: 'Kelinci',
      correctHuruf: 'K',
      options: ['Kucing', 'Singa', 'Kelinci']
    }
  ];

  const currentMatchWordSet = matchWordSets[matchWordVarIndex % matchWordSets.length];
  const [selectedWordAnswer, setSelectedWordAnswer] = useState<string | null>(null);
  const [matchWordSuccess, setMatchWordSuccess] = useState(false);

  const handleChooseWordMatch = (word: string) => {
    soundFx.playPop();
    setSelectedWordAnswer(word);
    if (word === currentMatchWordSet.correctWord) {
      soundFx.playSuccess();
      setMatchWordSuccess(true);
      if (onScoreUpdate) onScoreUpdate('pencocokanBentuk', 100);
    } else {
      soundFx.playTryAgain();
    }
  };

  const resetMatchWordGame = () => {
    soundFx.playPop();
    setMatchWordVarIndex((prev) => (prev + 1) % 3);
    setSelectedWordAnswer(null);
    setMatchWordSuccess(false);
  };

  // 9. TEBAK & SUSUN SUKU KATA (2-3 Suku Kata & Imbuhan)
  const sukuKataSets = [
    {
      gambarSymbol: '⚽',
      fullWord: 'BOLA',
      sukuAwal: 'BO',
      correctMissing: 'LA',
      options: ['LA', 'KU', 'PA']
    },
    {
      gambarSymbol: '🚲',
      fullWord: 'SEPEDA',
      sukuAwal: 'SE-PE',
      correctMissing: 'DA',
      options: ['DA', 'RI', 'KO']
    },
    {
      gambarSymbol: '🍚',
      fullWord: 'MAKAN',
      sukuAwal: 'MA',
      correctMissing: 'KAN',
      options: ['KAN', 'RUNG', 'BANG']
    }
  ];

  const currentSukuKataSet = sukuKataSets[sukuKataVarIndex % sukuKataSets.length];
  const [selectedSukuAnswer, setSelectedSukuAnswer] = useState<string | null>(null);
  const [sukuKataSuccess, setSukuKataSuccess] = useState(false);

  const handleChooseSukuKata = (missing: string) => {
    soundFx.playPop();
    setSelectedSukuAnswer(missing);
    if (missing === currentSukuKataSet.correctMissing) {
      soundFx.playSuccess();
      setSukuKataSuccess(true);
    } else {
      soundFx.playTryAgain();
    }
  };

  const resetSukuKataGame = () => {
    soundFx.playPop();
    setSukuKataVarIndex((prev) => (prev + 1) % 3);
    setSelectedSukuAnswer(null);
    setSukuKataSuccess(false);
  };

  // 10. MATEMATIKA PENJUMLAHAN & PENGURANGAN BELASAN (11-30)
  const mathBelasanSets = [
    {
      soalText: '8 + 5 = ❓',
      visualText: '🍎 (8) + 🍎 (5)',
      correctAnswer: 13,
      options: [11, 13, 15]
    },
    {
      soalText: '12 + 6 = ❓',
      visualText: '🍌 (12) + 🍌 (6)',
      correctAnswer: 18,
      options: [16, 18, 20]
    },
    {
      soalText: '20 - 5 = ❓',
      visualText: '🚗 (20) dikurangi (5)',
      correctAnswer: 15,
      options: [12, 15, 17]
    }
  ];

  const currentMathBelasanSet = mathBelasanSets[mathBelasanVarIndex % mathBelasanSets.length];
  const [selectedMathAnswer, setSelectedMathAnswer] = useState<number | null>(null);
  const [mathSuccess, setMathSuccess] = useState(false);

  const handleChooseMathAnswer = (val: number) => {
    soundFx.playPop();
    setSelectedMathAnswer(val);
    if (val === currentMathBelasanSet.correctAnswer) {
      soundFx.playSuccess();
      setMathSuccess(true);
      if (onScoreUpdate) onScoreUpdate('menghitungBenda', 100);
    } else {
      soundFx.playTryAgain();
    }
  };

  const resetMathBelasanGame = () => {
    soundFx.playPop();
    setMathBelasanVarIndex((prev) => (prev + 1) % 3);
    setSelectedMathAnswer(null);
    setMathSuccess(false);
  };

  // 11. LABIRIN & PATHFINDING
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
    }
  };

  const resetMaze = () => {
    soundFx.playPop();
    setMazePos({ x: 0, y: 0 });
    setMazeCompleted(false);
  };

  // 12. MEMORI KARTU FLIP
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
    soundFx.playPop();
    setCountedItems([]);
  };

  const handleChoosePatternAnswer = (choice: string) => {
    const currentPattern = patternsByTopic[patternVariationIndex % patternsByTopic.length];
    if (choice === currentPattern.answer) {
      soundFx.playSuccess();
      setPolaSuccess(true);
      if (onScoreUpdate) onScoreUpdate('polaWarna', 100);
    } else {
      soundFx.playTryAgain();
    }
  };

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

  // REFLEKS KETUK
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

  return (
    <div className="bg-gradient-to-b from-amber-50 to-orange-100 min-h-full p-4 rounded-3xl shadow-lg border-4 border-amber-200 space-y-4">
      {/* SELEKTOR TOPIK MATERI */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 p-3 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-black text-amber-900 px-2">Topik:</span>
          {[
            { id: 'buah', label: '🍎 Buah' },
            { id: 'sayur', label: '🥦 Sayur' },
            { id: 'kendaraan', label: '🚗 Kendaraan' },
            { id: 'hewan', label: '🦁 Hewan' },
            { id: 'suku_kata', label: '🔤 Calistung' },
            { id: 'matematika_belasan', label: '➕ Matematika (11-30)' }
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

      {/* MODUL SELEKTOR GAME (12 MODUL LENGKAP) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('bentuk'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'bentuk' ? 'bg-red-500 text-white ring-2 ring-red-300' : 'bg-white text-red-600 hover:bg-red-50'
          }`}
        >
          <span>🧩</span> Cocok Bentuk
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('ukuran'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'ukuran' ? 'bg-amber-500 text-white ring-2 ring-amber-300' : 'bg-white text-amber-600 hover:bg-amber-50'
          }`}
        >
          <span>📏</span> Ukuran
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('hitung'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'hitung' ? 'bg-emerald-500 text-white ring-2 ring-emerald-300' : 'bg-white text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <span>🔢</span> Hitung (1-{targetCount})
        </button>
        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('pola'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'pola' ? 'bg-purple-500 text-white ring-2 ring-purple-300' : 'bg-white text-purple-600 hover:bg-purple-50'
          }`}
        >
          <span>🎨</span> Pola Urutan
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('cocok_angka'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'cocok_angka' ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-white text-blue-700 hover:bg-blue-50'
          }`}
        >
          <span>🔢</span> Gambar ➔ Angka Acak
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('cocok_huruf'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'cocok_huruf' ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-white text-indigo-700 hover:bg-indigo-50'
          }`}
        >
          <span>🔤</span> Gambar ➔ Kata
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('suku_kata'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'suku_kata' ? 'bg-rose-600 text-white ring-2 ring-rose-300' : 'bg-white text-rose-700 hover:bg-rose-50'
          }`}
        >
          <span>📖</span> Suku Kata (bo-la)
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('matematika_belasan'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'matematika_belasan' ? 'bg-teal-600 text-white ring-2 ring-teal-300' : 'bg-white text-teal-700 hover:bg-teal-50'
          }`}
        >
          <span>➕</span> Matematika (11-30)
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('labirin'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'labirin' ? 'bg-sky-600 text-white ring-2 ring-sky-300' : 'bg-white text-sky-700 hover:bg-sky-50'
          }`}
        >
          <span>🧭</span> Labirin Arah
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('memori'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'memori' ? 'bg-pink-600 text-white ring-2 ring-pink-300' : 'bg-white text-pink-700 hover:bg-pink-50'
          }`}
        >
          <span>🃏</span> Memori Kartu
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('klasifikasi'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'klasifikasi' ? 'bg-orange-600 text-white ring-2 ring-orange-300' : 'bg-white text-orange-700 hover:bg-orange-50'
          }`}
        >
          <span>⚖️</span> Klasifikasi
        </button>

        <button
          onClick={() => { soundFx.playPop(); setActiveSubMode('refleks'); }}
          className={`px-2.5 py-2 rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1 transition-transform active:scale-95 ${
            activeSubMode === 'refleks' ? 'bg-yellow-600 text-white ring-2 ring-yellow-300' : 'bg-white text-yellow-700 hover:bg-yellow-50'
          }`}
        >
          <span>🎯</span> Refleks Tap
        </button>
      </div>

      {/* GAME 1: SHAPE MATCHING */}
      {activeSubMode === 'bentuk' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-black text-amber-900">Cocokkan Gambar (Variasi #{shapesVariationIndex + 1} dari 3)</h3>
            <button onClick={resetShapesGame} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow">
              🔄 Ulangi
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {shapesList.map((shape) => {
              const isMatched = matchedShapes.includes(shape.id);
              return (
                <div
                  key={shape.id}
                  onClick={() => handleTargetClick(shape.id)}
                  className={`h-36 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isMatched ? 'border-emerald-500 bg-emerald-50 scale-105 shadow' : 'border-slate-300 bg-slate-100/70 hover:bg-slate-200'
                  }`}
                >
                  {isMatched ? <div className="text-6xl animate-bounce">{shape.symbol}</div> : <div className="text-5xl opacity-20">❓</div>}
                  <span className="mt-2 text-xs font-bold text-slate-500">{isMatched ? shape.name : 'Bayangan'}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {shapesList.map((shape) => {
              const isMatched = matchedShapes.includes(shape.id);
              if (isMatched) return null;
              return (
                <button key={shape.id} onClick={() => handleSelectShape(shape.id)} className="px-6 py-4 rounded-2xl text-4xl shadow bg-amber-200 hover:bg-amber-300 transition-transform active:scale-95">
                  {shape.symbol}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GAME 2: SIZE SORTING */}
      {activeSubMode === 'ukuran' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-black text-amber-900">Urutkan Ukuran (Variasi #{sizeVariationIndex + 1} dari 3)</h3>
            <button onClick={resetSizeGame} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow">
              🔄 Ulangi
            </button>
          </div>
          <p className="text-amber-700 text-xs mb-6">Tekan benda dari yang paling KECIL ke BESAR.</p>
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
              <p className="text-emerald-800 font-bold">Kamu berhasil mengurutkannya!</p>
              <button onClick={resetSizeGame} className="mt-3 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">
                Ulangi 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 3: HITUNG 1-10 */}
      {activeSubMode === 'hitung' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <h3 className="text-2xl font-black text-amber-900 mb-1">Hitung {countingIcon} (Target Usia {usiaSpesifik.replace('_tahun', ' Tahun')})</h3>
          <p className="text-amber-700 text-xs">Sentuh setiap {countingIcon} sampai hitungan {targetCount}.</p>

          <div className="text-4xl font-black text-emerald-600 h-10">
            {countedItems.length > 0 ? `Hitungan: ${countedItems.length} / ${targetCount}` : 'Mulai Sentuh! ✨'}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {Array.from({ length: targetCount }).map((_, idx) => {
              const isCounted = countedItems.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleCountItem(idx)}
                  className={`w-16 h-16 rounded-2xl text-3xl shadow-lg flex items-center justify-center transition-transform active:scale-90 border-4 ${
                    isCounted ? 'bg-yellow-400 border-yellow-200 scale-110 animate-bounce' : 'bg-slate-100 border-slate-300 hover:bg-yellow-100'
                  }`}
                >
                  {isCounted ? countingIcon : '✨'}
                </button>
              );
            })}
          </div>

          {countedItems.length === targetCount && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl animate-pulse">
              <span className="text-3xl">🎈 LUAR BIASA! 🎈</span>
              <p className="text-emerald-800 font-bold">Kamu menghitung sampai {targetCount}!</p>
              <button onClick={resetCountGame} className="mt-3 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">
                Hitung Lagi 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 4: POLA URUTAN */}
      {activeSubMode === 'pola' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-purple-900">Lengkapi Pola (Variasi #{patternVariationIndex + 1} dari 3)</h3>
            <button onClick={nextPattern} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl shadow">
              🔄 Ulangi
            </button>
          </div>

          <div className="flex justify-center items-center gap-4 mb-6">
            {patternsByTopic[patternVariationIndex % patternsByTopic.length].sequence.map((item, idx) => (
              <div key={idx} className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl border border-slate-300 shadow">
                {item}
              </div>
            ))}
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-4xl border-4 border-dashed border-purple-400 animate-pulse">
              ❓
            </div>
          </div>

          <p className="font-bold text-slate-700 text-xs">Pilih Gambar Berikutnya:</p>
          <div className="flex justify-center gap-4">
            {patternsByTopic[patternVariationIndex % patternsByTopic.length].options.map((opt, idx) => (
              <button key={idx} onClick={() => handleChoosePatternAnswer(opt)} className="w-16 h-16 bg-purple-200 hover:bg-purple-300 text-4xl rounded-2xl shadow active:scale-95 flex items-center justify-center border-2 border-purple-400">
                {opt}
              </button>
            ))}
          </div>

          {polaSuccess && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl">
              <span className="text-3xl">👏 TEPAT SEKALI! 👏</span>
              <p className="text-emerald-800 font-bold mb-2">Pola berhasil diselesaikan!</p>
              <button onClick={nextPattern} className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow">
                Ulangi Pola Baru ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 5: GAMBAR ➔ ANGKA ACAK */}
      {activeSubMode === 'cocok_angka' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-blue-900">🔢 Hitung Gambar & Pilih Angka (Variasi #{matchNumberVarIndex + 1})</h3>
            <button onClick={resetMatchNumGame} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow">
              🔄 Ulangi Soal
            </button>
          </div>
          <p className="text-blue-700 text-xs">Hitung jumlah gambar di kiri, lalu sentuh angka yang tepat di kanan.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center max-w-lg mx-auto bg-blue-50 p-6 rounded-3xl border-4 border-blue-200">
            {/* Sisi Kiri: Gambar Benda */}
            <div className="p-4 bg-white rounded-2xl border-2 border-blue-300 text-4xl tracking-widest shadow flex flex-wrap justify-center items-center gap-2 min-h-[120px]">
              {currentMatchNumSet.gambarIcon}
            </div>

            {/* Sisi Kanan: Deretan Angka Acak */}
            <div className="flex flex-col gap-3">
              {currentMatchNumSet.options.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleChooseNumMatch(opt.val)}
                  className={`p-3.5 rounded-2xl font-black text-lg shadow-md transition-transform active:scale-95 border-2 cursor-pointer ${
                    selectedNumAnswer === opt.val
                      ? opt.val === currentMatchNumSet.correctNumber
                        ? 'bg-emerald-500 text-white border-emerald-600 scale-105 ring-4 ring-emerald-300'
                        : 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-300'
                      : 'bg-white text-blue-900 border-blue-300 hover:bg-blue-100 hover:scale-102'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {matchNumSuccess && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl animate-pulse">
              <span className="text-3xl">🎉 JAWABAN BENAR! 🎉</span>
              <p className="text-emerald-800 font-bold mt-1">Jumlah benda cocok dengan angka {currentMatchNumSet.correctNumber}!</p>
              <button onClick={resetMatchNumGame} className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">
                Soal Angka Berikutnya ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 6: GAMBAR ➔ HURUF / KATA UTUH */}
      {activeSubMode === 'cocok_huruf' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-indigo-900">🔤 Cocok Gambar ke Kata / Huruf Awal (Variasi #{matchWordVarIndex + 1})</h3>
            <button onClick={resetMatchWordGame} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow">
              🔄 Ulangi Soal
            </button>
          </div>
          <p className="text-indigo-700 text-xs">Pilih kata atau huruf awal yang sesuai dengan gambar.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center max-w-lg mx-auto bg-indigo-50 p-6 rounded-3xl border-4 border-indigo-200">
            <div className="p-6 bg-white rounded-2xl border-2 border-indigo-300 text-6xl shadow flex items-center justify-center">
              {currentMatchWordSet.gambarSymbol}
            </div>

            <div className="flex flex-col gap-3">
              {currentMatchWordSet.options.map((w) => (
                <button
                  key={w}
                  onClick={() => handleChooseWordMatch(w)}
                  className={`p-3.5 rounded-2xl font-black text-lg shadow transition-transform active:scale-95 border-2 cursor-pointer ${
                    selectedWordAnswer === w
                      ? w === currentMatchWordSet.correctWord
                        ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                        : 'bg-rose-500 text-white border-rose-600'
                      : 'bg-white text-indigo-900 border-indigo-300 hover:bg-indigo-100'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {matchWordSuccess && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl animate-pulse">
              <span className="text-3xl">👏 HEBAT! 👏</span>
              <p className="text-emerald-800 font-bold mt-1">Gambar {currentMatchWordSet.gambarSymbol} cocok dengan kata "{currentMatchWordSet.correctWord}"!</p>
              <button onClick={resetMatchWordGame} className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">
                Soal Kata Berikutnya ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 7: TEBAK SUKU KATA */}
      {activeSubMode === 'suku_kata' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-rose-900">📖 Menyusun Suku Kata (Variasi #{sukuKataVarIndex + 1})</h3>
            <button onClick={resetSukuKataGame} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow">
              🔄 Ulangi Kata
            </button>
          </div>
          <p className="text-rose-700 text-xs">Pilih suku kata sambungan untuk melengkapi nama benda.</p>

          <div className="max-w-md mx-auto bg-rose-50 p-6 rounded-3xl border-4 border-rose-200 space-y-4">
            <div className="text-6xl">{currentSukuKataSet.gambarSymbol}</div>
            <div className="text-2xl font-black text-slate-800 flex justify-center items-center gap-2">
              <span className="p-2 bg-white rounded-xl border border-rose-300">{currentSukuKataSet.sukuAwal}</span>
              <span>+</span>
              <span className="p-2 bg-rose-200 rounded-xl border border-dashed border-rose-400 text-rose-800">
                {selectedSukuAnswer || '❓'}
              </span>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              {currentSukuKataSet.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChooseSukuKata(opt)}
                  className="px-5 py-3 bg-white hover:bg-rose-100 text-rose-900 font-black text-xl rounded-2xl border-2 border-rose-300 shadow active:scale-95"
                >
                  -{opt}
                </button>
              ))}
            </div>
          </div>

          {sukuKataSuccess && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl animate-pulse">
              <span className="text-3xl">🌟 PINTAR MEMBACA! 🌟</span>
              <p className="text-emerald-800 font-bold mt-1">Kata lengkap: "{currentSukuKataSet.fullWord}"!</p>
              <button onClick={resetSukuKataGame} className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">
                Kata Suku Kata Berikutnya ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 8: MATEMATIKA BELASAN (11-30) */}
      {activeSubMode === 'matematika_belasan' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-teal-900">➕ Matematika Belasan & Puluhan (Usia 5th / TK B)</h3>
            <button onClick={resetMathBelasanGame} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-xl shadow">
              🔄 Soal Matematika Baru
            </button>
          </div>
          <p className="text-teal-700 text-xs">Hitung penjumlahan atau pengurangan belasan berikut.</p>

          <div className="max-w-md mx-auto bg-teal-50 p-6 rounded-3xl border-4 border-teal-200 space-y-4">
            <div className="text-3xl font-black text-teal-950">{currentMathBelasanSet.soalText}</div>
            <div className="text-sm font-bold text-slate-600">{currentMathBelasanSet.visualText}</div>

            <div className="flex justify-center gap-4 pt-2">
              {currentMathBelasanSet.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChooseMathAnswer(opt)}
                  className={`px-6 py-3 font-black text-2xl rounded-2xl border-2 shadow active:scale-95 ${
                    selectedMathAnswer === opt
                      ? opt === currentMathBelasanSet.correctAnswer
                        ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                        : 'bg-rose-500 text-white border-rose-600'
                      : 'bg-white text-teal-900 border-teal-300 hover:bg-teal-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {mathSuccess && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl animate-pulse">
              <span className="text-3xl">🎉 MATEMATIKA HEBAT! 🎉</span>
              <p className="text-emerald-800 font-bold mt-1">Hasil hitungan benar = {currentMathBelasanSet.correctAnswer}!</p>
              <button onClick={resetMathBelasanGame} className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">
                Soal Belasan Berikutnya ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 9: LABIRIN ARAH & PATHFINDING (3x3 GRID LENGKAP & PANAH LENGKAP) */}
      {activeSubMode === 'labirin' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-blue-900">🧭 Labirin Arah & Pathfinding</h3>
            <button onClick={resetMaze} className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">
              🔄 Reset Labirin
            </button>
          </div>
          <p className="text-blue-700 text-xs">Gunakan tombol panah untuk mengarahkan {playerIcon} menuju {targetGoalIcon}!</p>

          {/* PETAK LABIRIN 3x3 */}
          <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto bg-blue-50 p-3 rounded-2xl border-4 border-blue-200 shadow-md">
            {[0, 1, 2].map((y) =>
              [0, 1, 2].map((x) => {
                const isPlayer = mazePos.x === x && mazePos.y === y;
                const isGoal = mazeTarget.x === x && mazeTarget.y === y;
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`rounded-xl border-2 border-dashed flex items-center justify-center text-3xl font-black transition-all ${
                      isPlayer
                        ? 'bg-blue-500 border-blue-600 text-white scale-105 shadow animate-bounce'
                        : isGoal
                        ? 'bg-amber-100 border-amber-400'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {isPlayer ? playerIcon : isGoal ? targetGoalIcon : ''}
                  </div>
                );
              })
            )}
          </div>

          {/* 4 TOMBOL PANAH LENGKAP: ⬆️ ⬇️ ⬅️ ➡️ */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <button onClick={() => moveMaze('UP')} className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold rounded-2xl shadow active:scale-90">
              ⬆️
            </button>
            <div className="flex gap-3">
              <button onClick={() => moveMaze('LEFT')} className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold rounded-2xl shadow active:scale-90">
                ⬅️
              </button>
              <button onClick={() => moveMaze('DOWN')} className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold rounded-2xl shadow active:scale-90">
                ⬇️
              </button>
              <button onClick={() => moveMaze('RIGHT')} className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold rounded-2xl shadow active:scale-90">
                ➡️
              </button>
            </div>
          </div>

          {mazeCompleted && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl animate-pulse">
              <span className="text-3xl">🎉 KAMU SAMPAI TUJUAN! 🎉</span>
              <p className="text-emerald-800 font-bold mt-1">Luar biasa! Berhasil menelusuri labirin!</p>
              <button onClick={resetMaze} className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">
                Main Lagi 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 10: MEMORI KARTU FLIP */}
      {activeSubMode === 'memori' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-rose-900">🃏 Memori Kartu (Variasi #{memoryVariationIndex + 1} dari 3)</h3>
            <button onClick={resetMemoryGame} className="px-3 py-1.5 bg-rose-500 text-white font-bold text-xs rounded-xl shadow">
              🔄 Ulangi Kartu
            </button>
          </div>
          <p className="text-rose-700 text-xs">Buka 2 kartu dan temukan gambar yang sama.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-72 mx-auto">
            {memoryCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`h-24 rounded-2xl border-4 flex items-center justify-center text-4xl cursor-pointer transition-all duration-300 shadow ${
                  card.flipped || card.matched ? 'bg-rose-100 border-rose-400 scale-105' : 'bg-rose-500 border-rose-600 text-white hover:bg-rose-600'
                }`}
              >
                {card.flipped || card.matched ? card.symbol : '❓'}
              </div>
            ))}
          </div>

          {memoryCards.every((c) => c.matched) && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl animate-pulse">
              <span className="text-3xl">👏 INGATAN HEBAT! 👏</span>
              <p className="text-emerald-800 font-bold mt-1">Kartu berhasil dipasangkan!</p>
              <button onClick={resetMemoryGame} className="mt-3 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">
                Main Lagi dengan Gambar Baru 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 11: KLASIFIKASI KERANJANG */}
      {activeSubMode === 'klasifikasi' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-teal-900">⚖️ Klasifikasi Makanan (Variasi #{classifyVariationIndex + 1} dari 3)</h3>
            <button onClick={resetClassifyGame} className="px-3 py-1.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow">
              🔄 Ulangi
            </button>
          </div>
          <p className="text-teal-700 text-xs">Tekan makanan di atas lalu pilih keranjang yang tepat.</p>

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

          {classifiedIds.length === itemsToClassify.length && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-2xl animate-pulse">
              <span className="text-3xl">🎉 SEMUA PISAH DENGAN BENAR! 🎉</span>
              <button onClick={resetClassifyGame} className="mt-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">
                Ulangi dengan Makanan Baru 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 12: REFLEKS TAP SASARAN */}
      {activeSubMode === 'refleks' && (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center space-y-4">
          <h3 className="text-2xl font-black text-orange-900">🎯 Refleks Ketuk Sasaran Cepat!</h3>
          <p className="text-orange-700 text-xs">Ketuk sasaran yang muncul secepat mungkin!</p>

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
