import React from 'react';
import { VideoMetrics } from '../types';
import { PRESET_SAMPLES } from '../utils/sampleData';
import { Link2, Users, Eye, ThumbsUp, MessageSquare, Play, Sparkles, AlertCircle } from 'lucide-react';

interface MetricInputStepProps {
  metrics: VideoMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<VideoMetrics>>;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const MetricInputStep: React.FC<MetricInputStepProps> = ({
  metrics,
  setMetrics,
  onAnalyze,
  isLoading
}) => {

  const handleInputChange = (field: keyof VideoMetrics, value: string | number) => {
    setMetrics(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = PRESET_SAMPLES.find(p => p.id === presetId);
    if (preset) {
      setMetrics(preset.metrics);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Evaluate Video <span className="gradient-text-purple">Virality Metrics</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Enter TikTok or Instagram Reels metadata. The engine applies strict Outlier Virality formulas before unlocking content cloning.
        </p>
      </div>

      {/* Quick Test Preset Loaders */}
      <div className="glass-card p-4 rounded-2xl border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Quick Test Demo Presets:
          </span>
          <span className="text-[11px] text-gray-500">Click to autofill sample data</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_SAMPLES.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset.id)}
              className={`p-3 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                preset.expectedStatus === 'PASSED'
                  ? 'bg-emerald-950/20 border-emerald-800/40 hover:bg-emerald-900/30 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-800/40 hover:bg-rose-900/30 text-rose-300'
              }`}
            >
              <div className="font-semibold line-clamp-1 mb-1">{preset.title}</div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-1">
                <span>{preset.metrics.views.toLocaleString()} vws</span>
                <span className={`px-1.5 py-0.5 rounded font-bold ${
                  preset.expectedStatus === 'PASSED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {preset.expectedStatus}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6 shadow-xl">
        
        {/* Video URL Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-purple-400" />
              Target Video URL (TikTok / IG Reels)
            </span>
            <span className="text-[11px] text-gray-500">Required</span>
          </label>
          <input
            type="url"
            value={metrics.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            placeholder="https://www.tiktok.com/@username/video/123456789 or IG Reel URL..."
            className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-sm transition"
          />
        </div>

        {/* Metrics Grid Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Account Followers */}
          <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800/80">
            <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Account Followers
            </label>
            <input
              type="number"
              min="0"
              value={metrics.followers || ''}
              onChange={(e) => handleInputChange('followers', parseInt(e.target.value) || 0)}
              placeholder="e.g. 20000"
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-white font-mono text-base font-semibold focus:outline-none focus:border-blue-500"
            />
            <div className="text-[10px] text-gray-500 mt-1">Base threshold multiplier</div>
          </div>

          {/* Views Count */}
          <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800/80">
            <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              Views Count
            </label>
            <input
              type="number"
              min="0"
              value={metrics.views || ''}
              onChange={(e) => handleInputChange('views', parseInt(e.target.value) || 0)}
              placeholder="e.g. 540000"
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-white font-mono text-base font-semibold focus:outline-none focus:border-purple-500"
            />
            <div className="text-[10px] text-emerald-400/90 mt-1 font-mono">Min req: &gt;= {(metrics.followers * 2).toLocaleString()} (2x)</div>
          </div>

          {/* Likes Count */}
          <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800/80">
            <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-pink-400" />
              Likes Count
            </label>
            <input
              type="number"
              min="0"
              value={metrics.likes || ''}
              onChange={(e) => handleInputChange('likes', parseInt(e.target.value) || 0)}
              placeholder="e.g. 12500"
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-white font-mono text-base font-semibold focus:outline-none focus:border-pink-500"
            />
            <div className="text-[10px] text-gray-500 mt-1">Used for engagement sum</div>
          </div>

          {/* Comments Count */}
          <div className="bg-gray-900/70 p-4 rounded-xl border border-gray-800/80">
            <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              Comments Count
            </label>
            <input
              type="number"
              min="0"
              value={metrics.comments || ''}
              onChange={(e) => handleInputChange('comments', parseInt(e.target.value) || 0)}
              placeholder="e.g. 1800"
              className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-white font-mono text-base font-semibold focus:outline-none focus:border-amber-500"
            />
            <div className="text-[10px] text-emerald-400/90 mt-1 font-mono">Eng sum req: &gt; {(metrics.followers * 0.5).toLocaleString()} (50%)</div>
          </div>

        </div>

        {/* Math Rules Info Notice */}
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/30 text-xs text-purple-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-purple-300">Strict Virality Rules Applied:</span>
            <p className="text-purple-300/80">
              Condition 1: <code className="bg-purple-900/50 px-1 rounded">Views &gt;= Followers * 2</code> | Condition 2: <code className="bg-purple-900/50 px-1 rounded">(Likes + Comments) &gt; Followers * 0.5</code>. Both conditions MUST be true to pass.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || !metrics.url || metrics.followers <= 0}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-bold text-base shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Evaluate Virality & Run Pipeline</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
