import React from 'react';
import { MetricEvaluation, VideoMetrics } from '../types';
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, ShieldAlert, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface ViralityResultCardProps {
  evaluation: MetricEvaluation;
  metrics: VideoMetrics;
  onProceedToDeconstruction: () => void;
  onReset: () => void;
}

export const ViralityResultCard: React.FC<ViralityResultCardProps> = ({
  evaluation,
  metrics,
  onProceedToDeconstruction,
  onReset
}) => {
  const isPassed = evaluation.status === 'PASSED';

  return (
    <div className={`rounded-2xl p-6 border transition-all duration-300 ${
      isPassed
        ? 'bg-gradient-to-b from-emerald-950/40 via-gray-900 to-gray-900 border-emerald-500/40 shadow-2xl shadow-emerald-500/10'
        : 'bg-gradient-to-b from-rose-950/40 via-gray-900 to-gray-900 border-rose-500/40 shadow-2xl shadow-rose-500/10'
    }`}>
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          {isPassed ? (
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <XCircle className="w-7 h-7" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider ${
                isPassed ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
              }`}>
                STATUS: {evaluation.status}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {isPassed ? 'Outlier Virality Confirmed' : 'Pipeline Halted'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {isPassed ? '🎉 Video Approved for Content Cloning' : '⛔ Outlier Virality Threshold Not Met'}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {isPassed ? (
            <button
              onClick={onProceedToDeconstruction}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition"
            >
              <span>Deconstruct Video</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition"
            >
              Try Another Video
            </button>
          )}
        </div>
      </div>

      {/* Math & Rule Breakdown */}
      <div className="py-6 space-y-4">
        
        <p className={`text-sm p-4 rounded-xl font-medium border ${
          isPassed ? 'bg-emerald-950/30 text-emerald-200 border-emerald-800/30' : 'bg-rose-950/30 text-rose-200 border-rose-800/30'
        }`}>
          {evaluation.reason}
        </p>

        {/* Conditions Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Condition 1: Views >= Followers * 2 */}
          <div className={`p-4 rounded-xl border ${
            evaluation.condition1Passed ? 'bg-gray-900/90 border-emerald-500/30' : 'bg-gray-900/90 border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                CONDITION 1: Views Outlier Threshold
              </span>
              {evaluation.condition1Passed ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="text-xs space-y-1 font-mono text-gray-400">
              <div className="flex justify-between">
                <span>Actual Views:</span>
                <span className="text-white font-bold">{metrics.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Required (2x Followers):</span>
                <span className="text-gray-300">{evaluation.requiredViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-800 pt-1 text-[11px]">
                <span>Views Multiplier:</span>
                <span className={evaluation.condition1Passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {evaluation.viewsMultiplier}x Followers {evaluation.condition1Passed ? '✓ (>= 2.0x)' : '✗ (< 2.0x)'}
                </span>
              </div>
            </div>
          </div>

          {/* Condition 2: (Likes + Comments) > Followers * 0.5 */}
          <div className={`p-4 rounded-xl border ${
            evaluation.condition2Passed ? 'bg-gray-900/90 border-emerald-500/30' : 'bg-gray-900/90 border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                CONDITION 2: Engagement Outlier Threshold
              </span>
              {evaluation.condition2Passed ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="text-xs space-y-1 font-mono text-gray-400">
              <div className="flex justify-between">
                <span>Total Engagement (Likes+Comments):</span>
                <span className="text-white font-bold">{evaluation.totalEngagement.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Required (&gt; 0.5x Followers):</span>
                <span className="text-gray-300">&gt; {evaluation.requiredEngagement.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-800 pt-1 text-[11px]">
                <span>Engagement Ratio:</span>
                <span className={evaluation.condition2Passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {evaluation.engagementRatio}% {evaluation.condition2Passed ? '✓ (> 50.0%)' : '✗ (<= 50.0%)'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Warning hint for rejected videos */}
        {!isPassed && (
          <div className="p-3 bg-rose-950/20 border border-rose-800/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Process halted according to workflow rules. You cannot generate scripts or visual prompts for videos that fail virality metrics.</span>
          </div>
        )}

      </div>
    </div>
  );
};
