import React, { useState } from 'react';
import { ProductDetails, ReStrategyOutput } from '../types';
import { Sparkles, Monitor, Smartphone, Square, Play, Pause, Copy, Check, Tv, Download, Palette, Volume2, FileText } from 'lucide-react';
import { TeleprompterModal } from './TeleprompterModal';

interface MediaStudioStepProps {
  reStrategy: ReStrategyOutput;
  product: ProductDetails;
}

export const MediaStudioStep: React.FC<MediaStudioStepProps> = ({
  reStrategy,
  product
}) => {
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [selectedStyle, setSelectedStyle] = useState<string>('Cinematic Photorealistic');
  const [selectedPlatform, setSelectedPlatform] = useState<'midjourney' | 'luma' | 'runway' | 'sora'>('midjourney');
  
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const [isPlayingTts, setIsPlayingTts] = useState(false);

  const stylePresets = [
    { id: 'Cinematic Photorealistic', label: '🎬 Cinematic Photorealistic', promptTag: 'hyper-realistic 8k shot, cinematic lighting, shallow depth of field' },
    { id: 'Commercial Tech', label: '⚡ Commercial Tech', promptTag: 'sleek studio lighting, floating product render, high-tech metallic reflections' },
    { id: 'Warm UGC Lifestyle', label: '📱 Warm UGC Lifestyle', promptTag: 'authentic smartphone camera footage, warm ambient natural lighting, casual aesthetic' },
    { id: 'Cyberpunk Dark', label: '🌃 Cyberpunk Dark', promptTag: 'neon cyan and magenta volumetric lights, rainy dark city street reflection' },
    { id: 'Minimalist Studio', label: '✨ Minimalist Studio', promptTag: 'clean pastel backdrop, soft diffused shadows, Scandinavian product photography' },
  ];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Format prompt based on platform selected
  const formatPlatformPrompt = (basePrompt: string, sceneNum: number) => {
    const activeStyleObj = stylePresets.find(s => s.id === selectedStyle);
    const styleModifier = activeStyleObj ? activeStyleObj.promptTag : '';

    if (selectedPlatform === 'midjourney') {
      return `${basePrompt}, ${styleModifier} --ar ${aspectRatio} --v 6.0 --style raw`;
    } else if (selectedPlatform === 'luma') {
      return `Luma Dream Machine: [Scene ${sceneNum}] ${basePrompt}. ${styleModifier}. Camera movement: Smooth tracking dolly shot. Aspect ratio: ${aspectRatio}`;
    } else if (selectedPlatform === 'runway') {
      return `Runway Gen-3: ${basePrompt}. ${styleModifier}. Motion Scale: 5, Camera Motion: Zoom In, FPS: 24, Ratio: ${aspectRatio}`;
    } else {
      return `Sora / Kling AI Prompt: A high detail video clip showing ${basePrompt}. Photorealistic style with ${styleModifier}, 60fps, ${aspectRatio} frame.`;
    }
  };

  // Browser SpeechSynthesis with custom speed
  const handlePlayMultiSpeedTTS = () => {
    if (!reStrategy.voiceoverText) return;

    if ('speechSynthesis' in window) {
      if (isPlayingTts) {
        window.speechSynthesis.cancel();
        setIsPlayingTts(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(reStrategy.voiceoverText);
      utterance.rate = ttsSpeed;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingTts(false);
      utterance.onerror = () => setIsPlayingTts(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingTts(true);
    } else {
      alert("Browser does not support Speech Synthesis.");
    }
  };

  // Export full Storyboard Bundle file
  const handleDownloadBundle = () => {
    const bundleContent = `# Production Storyboard & Script Package
Product: ${product.name}
Niche: ${product.niche}
Target Audience: ${product.targetAudience}
Date: ${new Date().toLocaleDateString()}

---

## 🎬 Master Voiceover Script
${reStrategy.voiceoverText}

---

## 📸 Scene-by-Scene AI Video Prompts (${selectedPlatform.toUpperCase()} Format)

${reStrategy.scenePrompts.map(sp => `
### Scene ${sp.scene} (${sp.timeframe})
- **Script Line**: "${sp.scriptLine}"
- **Camera**: ${sp.cameraMotion}
- **Lighting**: ${sp.lightingStyle}
- **Formatted AI Prompt**: 
\`\`\`
${formatPlatformPrompt(sp.visualPrompt, sp.scene)}
\`\`\`
`).join('\n')}

---
Generated with Viral Video Cloning Mini App (100% Free Studio Engine)
`;

    const blob = new Blob([bundleContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyboard_${product.name.toLowerCase().replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>STEP 4: ADVANCED MEDIA STUDIO & STORYBOARD PREVIEW</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Visual Storyboard <span className="gradient-text-purple">& Teleprompter Studio</span>
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          
          <button
            onClick={() => setIsTeleprompterOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center space-x-2 transition"
          >
            <Tv className="w-4 h-4" />
            <span>Launch Teleprompter Mode</span>
          </button>

          <button
            onClick={handleDownloadBundle}
            className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs border border-gray-700 flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Storyboard Bundle</span>
          </button>

        </div>
      </div>

      {/* Control Studio Bar: Aspect Ratio, Style Presets, Platform Selector */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Aspect Ratio Switcher */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-purple-400" />
              Target Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                  aspectRatio === '9:16' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 TikTok</span>
              </button>

              <button
                onClick={() => setAspectRatio('16:9')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                  aspectRatio === '16:9' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9 Youtube</span>
              </button>

              <button
                onClick={() => setAspectRatio('1:1')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                  aspectRatio === '1:1' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>1:1 Feed</span>
              </button>
            </div>
          </div>

          {/* AI Visual Style Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-emerald-400" />
              AI Visual Style Aesthetic
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {stylePresets.map(preset => (
                <option key={preset.id} value={preset.id}>{preset.label}</option>
              ))}
            </select>
          </div>

          {/* Target Video Platform Exporter */}
          <div>
            <label className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Format Prompts For Platform
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['midjourney', 'luma', 'runway', 'sora'] as const).map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`py-2 px-2.5 rounded-xl border font-bold uppercase transition text-[11px] ${
                    selectedPlatform === platform
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Multi-Speed Audio Synthesis Box */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Multi-Speed Audio Voiceover Simulator</h3>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 font-mono">Speed Rate:</span>
            {[0.8, 1.0, 1.25].map((rate) => (
              <button
                key={rate}
                onClick={() => setTtsSpeed(rate)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition ${
                  ttsSpeed === rate ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {rate}x {rate === 1.25 ? '(Viral)' : rate === 0.8 ? '(Slow)' : '(Normal)'}
              </button>
            ))}

            <button
              onClick={handlePlayMultiSpeedTTS}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                isPlayingTts ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-black hover:bg-emerald-400'
              }`}
            >
              {isPlayingTts ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlayingTts ? 'Stop Voiceover' : `Play Voiceover (${ttsSpeed}x)`}</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs font-mono text-emerald-200/90 leading-relaxed">
          "{reStrategy.voiceoverText}"
        </div>
      </div>

      {/* Storyboard Visual Scene Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Interactive Visual Storyboard Cards</span>
          </h3>
          <span className="text-xs text-gray-400 font-mono">Formated for {selectedPlatform.toUpperCase()} ({aspectRatio})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reStrategy.scenePrompts.map((sp) => {
            const formattedPrompt = formatPlatformPrompt(sp.visualPrompt, sp.scene);

            return (
              <div
                key={sp.scene}
                className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4 relative group hover:border-purple-500/40 transition"
              >
                
                {/* Scene Header */}
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                      #{sp.scene}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white">Scene {sp.scene}</span>
                      <span className="text-[11px] text-gray-400 ml-2 font-mono">({sp.timeframe})</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded bg-gray-900 text-purple-300 text-[10px] font-mono border border-gray-800">
                    {aspectRatio} Frame
                  </span>
                </div>

                {/* Script Line */}
                <div className="bg-purple-950/20 border border-purple-800/30 p-3 rounded-xl">
                  <span className="text-[10px] text-purple-400 font-mono font-bold uppercase block mb-0.5">Dialogue / Audio Script:</span>
                  <p className="text-xs font-semibold text-purple-100 italic">
                    "{sp.scriptLine}"
                  </p>
                </div>

                {/* Formatted AI Prompt */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] text-gray-400 font-mono uppercase font-bold">Target AI Prompt ({selectedPlatform.toUpperCase()}):</span>
                    <button
                      onClick={() => copyToClipboard(formattedPrompt, `studio_sp_${sp.scene}`)}
                      className="flex items-center space-x-1 text-[11px] text-purple-400 hover:text-white font-mono"
                    >
                      {copiedKey === `studio_sp_${sp.scene}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === `studio_sp_${sp.scene}` ? 'Copied!' : 'Copy Prompt'}</span>
                    </button>
                  </div>
                  <pre className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-[11px] font-mono text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {formattedPrompt}
                  </pre>
                </div>

                {/* Camera & Motion Meta */}
                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>🎥 {sp.cameraMotion}</span>
                  <span>💡 {sp.lightingStyle}</span>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Teleprompter Fullscreen Modal */}
      <TeleprompterModal
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
        scriptText={reStrategy.adaptedScript}
        productName={product.name}
      />

    </div>
  );
};
