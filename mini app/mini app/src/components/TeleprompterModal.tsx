import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Type, Gauge, FlipHorizontal } from 'lucide-react';

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptText: string;
  productName: string;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  isOpen,
  onClose,
  scriptText,
  productName
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(2); // 1 (slow) to 5 (fast)
  const [fontSize, setFontSize] = useState<number>(28); // px
  const [isMirrored, setIsMirrored] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      scrollIntervalRef.current = window.setInterval(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop += speed * 0.8;
          // Stop if reached bottom
          if (
            containerRef.current.scrollTop + containerRef.current.clientHeight >=
            containerRef.current.scrollHeight - 10
          ) {
            setIsPlaying(false);
          }
        }
      }, 30);
    } else if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }

    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isPlaying, speed]);

  const handleResetScroll = () => {
    setIsPlaying(false);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fadeIn select-none">
      
      {/* Top Teleprompter Controls Toolbar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between z-10 text-xs">
        
        {/* Title */}
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
          <div>
            <h3 className="font-bold text-white text-sm">TELEPROMPTER STUDIO MODE</h3>
            <p className="text-gray-400 text-[11px]">{productName || 'Adapted Creator Script'}</p>
          </div>
        </div>

        {/* Play / Speed / Font Size Controls */}
        <div className="flex items-center space-x-4">
          
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition ${
              isPlaying ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black hover:bg-emerald-400'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'PAUSE SCROLL' : 'START SCROLL'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleResetScroll}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
            title="Reset to Top"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700">
            <Gauge className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400">Speed:</span>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-20 accent-purple-500 cursor-pointer"
            />
            <span className="font-bold font-mono text-purple-300 w-4">{speed}x</span>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700">
            <Type className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400">Size:</span>
            <button
              onClick={() => setFontSize(prev => Math.max(18, prev - 4))}
              className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold"
            >
              -
            </button>
            <span className="font-mono text-white w-6 text-center">{fontSize}</span>
            <button
              onClick={() => setFontSize(prev => Math.min(48, prev + 4))}
              className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-white font-bold"
            >
              +
            </button>
          </div>

          {/* Mirror Mode (For camera prompter glass rigs) */}
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-2 rounded-lg border transition ${
              isMirrored ? 'bg-purple-900 border-purple-500 text-purple-200' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
            title="Toggle Glass Mirror Flip"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

      </div>

      {/* Main Teleprompter Text Display Container */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto px-8 sm:px-24 py-32 text-center text-white font-sans font-bold leading-relaxed scroll-smooth transition-transform ${
          isMirrored ? 'scale-x-[-1]' : ''
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Eyeline Indicator Guide Line */}
          <div className="fixed left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-b-2 border-red-500/30 pointer-events-none flex justify-between items-center px-4">
            <span className="text-[10px] text-red-400 uppercase font-mono tracking-widest bg-black/80 px-2 py-1 rounded">◄ READ EYELINE</span>
            <span className="text-[10px] text-red-400 uppercase font-mono tracking-widest bg-black/80 px-2 py-1 rounded">READ EYELINE ►</span>
          </div>

          <div className="text-gray-500 text-sm font-mono tracking-widest uppercase">
            === START OF RECORDING ===
          </div>

          <div className="whitespace-pre-wrap leading-loose tracking-wide font-extrabold text-amber-200">
            {scriptText}
          </div>

          <div className="text-gray-500 text-sm font-mono tracking-widest uppercase py-24">
            === END OF SCRIPT ===
          </div>

        </div>
      </div>

    </div>
  );
};
