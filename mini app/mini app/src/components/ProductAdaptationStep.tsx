import React, { useState } from 'react';
import { ProductDetails, ReStrategyOutput, ContentDeconstruction } from '../types';
import { Sparkles, Copy, Check, Play, Square, Download, Video, FileText, Code2, Volume2, Package } from 'lucide-react';

interface ProductAdaptationStepProps {
  product: ProductDetails;
  setProduct: React.Dispatch<React.SetStateAction<ProductDetails>>;
  reStrategy: ReStrategyOutput | null;
  onGenerateReStrategy: () => void;
  deconstruction: ContentDeconstruction;
  onSaveToDatabase: () => void;
}

export const ProductAdaptationStep: React.FC<ProductAdaptationStepProps> = ({
  product,
  setProduct,
  reStrategy,
  onGenerateReStrategy,
  onSaveToDatabase
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleInputChange = (field: keyof ProductDetails, value: string) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Live Browser Speech Synthesis for TTS Audio Playback
  const handlePlayTTS = () => {
    if (!reStrategy?.voiceoverText) return;

    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(reStrategy.voiceoverText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    } else {
      alert("Browser does not support Speech Synthesis API.");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>STEP 3: RE-STRATEGY & GENERATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Adapt Viral Master to <span className="gradient-text-purple">Your Product</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Enter your product details to generate tailored viral hooks, rewritten script, scene AI prompts, and TTS voiceover.
        </p>
      </div>

      {/* User Product Info Form */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
        <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
          <Package className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base">Your Product & Target Audience Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Product Name</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g. Ultra Noise-Cancelling Earbuds"
              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Product Niche</label>
            <input
              type="text"
              value={product.niche}
              onChange={(e) => handleInputChange('niche', e.target.value)}
              placeholder="e.g. Tech & Audio Accessories"
              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Target Audience</label>
            <input
              type="text"
              value={product.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              placeholder="e.g. Students, Travelers, Remote Workers"
              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-300 mb-1">Key Product Features / Benefits</label>
            <input
              type="text"
              value={product.keyFeatures}
              onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
              placeholder="e.g. 40hr battery life, active ANC, waterproof, fast wireless charging"
              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Custom Call-To-Action (CTA)</label>
            <input
              type="text"
              value={product.callToActionText}
              onChange={(e) => handleInputChange('callToActionText', e.target.value)}
              placeholder="e.g. Tap shop button below for 30% OFF!"
              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

        </div>

        <button
          type="button"
          onClick={onGenerateReStrategy}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Adapted Assets & Scripts</span>
        </button>
      </div>

      {/* Generated Results Section */}
      {reStrategy && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* 1. Viral Hook Options */}
          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Rewritten Viral Hook Variations</h3>
              </div>
              <span className="text-xs text-gray-400">4 Tailored Styles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reStrategy.hookOptions.map((hook, idx) => (
                <div key={idx} className="bg-gray-900/90 p-4 rounded-xl border border-gray-800 space-y-2 relative group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono font-bold border border-purple-800/40">
                      {hook.type}
                    </span>
                    <button
                      onClick={() => copyToClipboard(hook.headline, `hook_${idx}`)}
                      className="text-gray-400 hover:text-white p-1 rounded"
                      title="Copy Hook Text"
                    >
                      {copiedKey === `hook_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    "{hook.headline}"
                  </p>
                  <p className="text-[11px] text-gray-400 border-t border-gray-800 pt-2 italic">
                    🎥 Visual Cue: {hook.visualInstruction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Full Adapted Script & Voiceover TTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Adapted Script */}
            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Adapted Video Script & Cues</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(reStrategy.adaptedScript, 'script')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-200"
                >
                  {copiedKey === 'script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Script</span>
                </button>
              </div>

              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs font-mono text-gray-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {reStrategy.adaptedScript}
              </div>
            </div>

            {/* Voiceover TTS & SFX */}
            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-base">TTS Audio Synthesis & SFX</h3>
                </div>
                <button
                  onClick={handlePlayTTS}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isPlayingAudio ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-black hover:bg-emerald-400'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop TTS</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Preview TTS Audio</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800 text-xs font-mono text-purple-200 leading-relaxed">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">Voiceover Script Text:</span>
                "{reStrategy.voiceoverText}"
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 uppercase">Recommended Sound Effects (SFX):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  {reStrategy.sfxCues.map((sfx, i) => (
                    <div key={i} className="p-2 rounded bg-gray-900 border border-gray-800 text-gray-300">
                      🔊 {sfx}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* 3. Visual AI Prompts JSON Generator */}
          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Scene-by-Scene Visual AI Prompts (JSON)</h3>
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(reStrategy.scenePrompts, null, 2), 'prompts_json')}
                className="flex items-center space-x-1 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-200"
              >
                {copiedKey === 'prompts_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Prompts JSON</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reStrategy.scenePrompts.map((sp) => (
                <div key={sp.scene} className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-purple-400">Scene {sp.scene} ({sp.timeframe})</span>
                    <button
                      onClick={() => copyToClipboard(sp.visualPrompt, `sp_${sp.scene}`)}
                      className="text-gray-500 hover:text-white"
                      title="Copy Midjourney Prompt"
                    >
                      {copiedKey === `sp_${sp.scene}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-gray-300 bg-gray-900 p-2.5 rounded border border-gray-800/80 leading-relaxed">
                    {sp.visualPrompt}
                  </p>
                  <div className="text-[11px] font-mono text-gray-500 flex justify-between pt-1">
                    <span>Camera: {sp.cameraMotion}</span>
                    <span>Lighting: {sp.lightingStyle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database Save CTA */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-gray-900 to-purple-950/50 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white text-base">Ready for Video Render Pipeline?</h4>
              <p className="text-xs text-gray-400">Save output metadata to Data Logs (Supabase / Local DB schema).</p>
            </div>
            <button
              onClick={onSaveToDatabase}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Log Record to Database</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
