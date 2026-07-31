import React from 'react';
import { ContentDeconstruction } from '../types';
import { Video, Mic, Flame, Layers, ArrowRight, Camera, Clock, Sparkles } from 'lucide-react';

interface DeconstructionStepProps {
  deconstruction: ContentDeconstruction;
  onProceedToAdaptation: () => void;
}

export const DeconstructionStep: React.FC<DeconstructionStepProps> = ({
  deconstruction,
  onProceedToAdaptation
}) => {
  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Video className="w-4 h-4" />
            <span>STEP 2: CONTENT DECONSTRUCTION</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Deconstructing <span className="gradient-text-emerald">Viral Video Blueprint</span>
          </h2>
        </div>

        <button
          onClick={onProceedToAdaptation}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition self-start sm:self-auto"
        >
          <span>Proceed to Product Adaptation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Hook (0-3s) & Audio Transcript */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hook Breakdown Card */}
        <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">First 3-Second Viral Hook Breakdown</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-amber-950/20 border border-amber-800/30 p-3.5 rounded-xl">
              <span className="text-[11px] font-bold text-amber-400 uppercase block mb-1">Verbal Hook (Speech)</span>
              <p className="text-sm font-semibold text-amber-100 italic">
                "{deconstruction.hook.verbalHook}"
              </p>
            </div>

            <div className="bg-gray-900 p-3.5 rounded-xl border border-gray-800">
              <span className="text-[11px] font-bold text-purple-400 uppercase block mb-1">Visual Hook Style & Cue</span>
              <p className="text-xs text-gray-300">
                {deconstruction.hook.visualStyle}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 font-mono bg-gray-950 px-3 py-2 rounded-lg">
              <span>Hook Pattern:</span>
              <span className="text-purple-300 font-bold">{deconstruction.hook.hookType}</span>
            </div>
          </div>
        </div>

        {/* Audio Transcript Card */}
        <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
            <Mic className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Full Speech-To-Text Audio Transcript</h3>
          </div>

          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 max-h-48 overflow-y-auto font-mono text-xs text-emerald-200/90 leading-relaxed">
            "{deconstruction.audioTranscript}"
          </div>

          {/* Copywriting Framework */}
          <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between font-mono">
              <span className="text-purple-300 font-semibold">Framework Detected:</span>
              <span className="text-white font-bold">{deconstruction.valueProposition.copywritingFramework}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-purple-300 font-semibold">Core Target Pain Point:</span>
              <span className="text-gray-300">{deconstruction.valueProposition.targetPainPoint}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Copywriting Emotional Triggers */}
      <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Emotional Psychological Triggers Identified:
        </span>
        <div className="flex flex-wrap gap-2">
          {deconstruction.valueProposition.emotionalTriggers.map((trigger, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/30 text-emerald-300 border border-emerald-800/40 text-xs font-semibold"
            >
              🔥 {trigger}
            </span>
          ))}
        </div>
      </div>

      {/* Scene Structure & Camera Motions */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
          <Layers className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white text-base">Scene Pacing & Camera Motion Timeline</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deconstruction.sceneStructure.map((scene) => (
            <div key={scene.sceneNumber} className="bg-gray-900/90 p-4 rounded-xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold">
                  Scene {scene.sceneNumber}
                </span>
                <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  {scene.timeframe}
                </span>
              </div>

              <p className="text-xs text-gray-200 font-medium">
                {scene.description}
              </p>

              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span className="flex items-center gap-1 text-blue-400">
                  <Camera className="w-3.5 h-3.5" />
                  {scene.cameraMotion}
                </span>
                <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-semibold">
                  Pacing: {scene.pacing}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
