import { useState, useEffect } from 'react';
import { VideoMetrics, MetricEvaluation, ContentDeconstruction, ProductDetails, ReStrategyOutput, DatabaseRecord } from './types';
import { evaluateVirality } from './utils/viralityEngine';
import { deconstructVideo } from './utils/deconstructionEngine';
import { adaptToProduct } from './utils/adaptationEngine';
import { getStoredLogs, saveLogRecord, buildStandardApiResponse } from './utils/storage';
import { Header } from './components/Header';
import { MetricInputStep } from './components/MetricInputStep';
import { ViralityResultCard } from './components/ViralityResultCard';
import { DeconstructionStep } from './components/DeconstructionStep';
import { ProductAdaptationStep } from './components/ProductAdaptationStep';
import { MediaStudioStep } from './components/MediaStudioStep';
import { LogHistoryTable } from './components/LogHistoryTable';
import { JsonOutputModal } from './components/JsonOutputModal';
import { Tv, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);

  // Form & State Data
  const [metrics, setMetrics] = useState<VideoMetrics>({
    url: 'https://www.tiktok.com/@techguru/video/73289102910492',
    followers: 20000,
    views: 540000,
    likes: 12500,
    comments: 1800,
    platform: 'tiktok'
  });

  const [evaluation, setEvaluation] = useState<MetricEvaluation | null>(null);
  const [deconstruction, setDeconstruction] = useState<ContentDeconstruction | null>(null);

  const [product, setProduct] = useState<ProductDetails>({
    name: 'Noise-Cancelling Wireless Earbuds Pro',
    niche: 'Tech & Audio',
    targetAudience: 'Students & Remote Workers',
    keyFeatures: 'Active noise cancellation, 40hr battery life, IPX7 waterproof',
    callToActionText: 'Order now with 30% OFF today only!'
  });

  const [reStrategy, setReStrategy] = useState<ReStrategyOutput | null>(null);
  const [logs, setLogs] = useState<DatabaseRecord[]>([]);

  // Load database logs on init
  useEffect(() => {
    setLogs(getStoredLogs());
  }, []);

  const refreshLogs = () => {
    setLogs(getStoredLogs());
  };

  // Step 1: Run Virality Assessment Engine
  const handleAnalyzeVirality = () => {
    setIsLoading(true);
    setEvaluation(null);

    setTimeout(() => {
      const result = evaluateVirality(metrics);
      setEvaluation(result);
      setIsLoading(false);

      if (result.status === 'PASSED') {
        // Deconstruct content automatically for passed videos
        const deconstructResult = deconstructVideo(metrics.url, metrics.platform);
        setDeconstruction(deconstructResult);

        // Generate initial re-strategy output
        const adaptResult = adaptToProduct(product, deconstructResult);
        setReStrategy(adaptResult);
      } else {
        setDeconstruction(null);
        setReStrategy(null);

        // Automatically log rejected videos to database as specified
        saveLogRecord({
          video_url: metrics.url,
          followers_count: metrics.followers,
          views_count: metrics.views,
          total_engagement: result.totalEngagement,
          filter_status: 'REJECTED',
          original_transcript: 'N/A - Failed virality filter',
          adapted_script: 'N/A',
          visual_prompts_json: '[]',
          output_status: 'REJECTED',
          product_name: product.name
        });
        refreshLogs();
      }
    }, 600);
  };

  // Step 3: Trigger Re-Strategy Generator
  const handleGenerateReStrategy = () => {
    if (!deconstruction) return;
    const adaptResult = adaptToProduct(product, deconstruction);
    setReStrategy(adaptResult);
  };

  // Save to Database Action
  const handleSaveToDatabase = () => {
    if (!evaluation || evaluation.status !== 'PASSED' || !deconstruction || !reStrategy) return;

    saveLogRecord({
      video_url: metrics.url,
      followers_count: metrics.followers,
      views_count: metrics.views,
      total_engagement: evaluation.totalEngagement,
      filter_status: 'PASSED',
      original_transcript: deconstruction.audioTranscript,
      adapted_script: reStrategy.adaptedScript,
      visual_prompts_json: JSON.stringify(reStrategy.scenePrompts),
      output_status: 'READY_FOR_RENDER',
      product_name: product.name,
    });
    refreshLogs();
    alert("Record successfully saved to Database Logs!");
  };

  // Inspect log record from table
  const handleSelectLogRecord = (record: DatabaseRecord) => {
    setMetrics({
      url: record.video_url,
      followers: record.followers_count,
      views: record.views_count,
      likes: Math.round(record.total_engagement * 0.9),
      comments: Math.round(record.total_engagement * 0.1),
    });
    if (record.product_name) {
      setProduct(prev => ({ ...prev, name: record.product_name || '' }));
    }
    setActiveStep(1);
  };

  // Build current API Response object for JSON modal
  const currentApiResponse = buildStandardApiResponse(
    metrics,
    evaluation || {
      status: 'REJECTED',
      reason: 'Not yet evaluated',
      condition1Passed: false,
      condition2Passed: false,
      totalEngagement: 0,
      engagementRatio: 0,
      viewsMultiplier: 0,
      requiredViews: metrics.followers * 2,
      requiredEngagement: metrics.followers * 0.5
    },
    reStrategy || undefined
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans">
      
      {/* Top Header & Navigation */}
      <Header
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        logCount={logs.length}
        evaluationPassed={evaluation?.status === 'PASSED'}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Step 1: Metric Filtering & Assessment */}
        {activeStep === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <MetricInputStep
              metrics={metrics}
              setMetrics={setMetrics}
              onAnalyze={handleAnalyzeVirality}
              isLoading={isLoading}
            />

            {/* Evaluation Result Card */}
            {evaluation && (
              <ViralityResultCard
                evaluation={evaluation}
                metrics={metrics}
                onProceedToDeconstruction={() => setActiveStep(2)}
                onReset={() => {
                  setEvaluation(null);
                  setDeconstruction(null);
                  setReStrategy(null);
                }}
              />
            )}
          </div>
        )}

        {/* Step 2: Content Deconstruction */}
        {activeStep === 2 && (
          <div className="animate-fadeIn">
            {deconstruction ? (
              <DeconstructionStep
                deconstruction={deconstruction}
                onProceedToAdaptation={() => setActiveStep(3)}
              />
            ) : (
              <div className="text-center py-16 space-y-3">
                <p className="text-gray-400">Please run virality evaluation on a PASSED video first.</p>
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Go to Metric Filter Step
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Product Adaptation & Re-Strategy */}
        {activeStep === 3 && (
          <div className="animate-fadeIn space-y-6">
            {deconstruction ? (
              <>
                <ProductAdaptationStep
                  product={product}
                  setProduct={setProduct}
                  reStrategy={reStrategy}
                  onGenerateReStrategy={handleGenerateReStrategy}
                  deconstruction={deconstruction}
                  onSaveToDatabase={handleSaveToDatabase}
                />

                {reStrategy && (
                  <div className="glass-card p-6 rounded-2xl border border-purple-500/30 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">Want to preview Visual Storyboard & Teleprompter?</h4>
                      <p className="text-xs text-gray-400">Open Media Studio to customize aspect ratios, prompt presets, and multi-speed TTS.</p>
                    </div>
                    <button
                      onClick={() => setActiveStep(4)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2 transition"
                    >
                      <Tv className="w-4 h-4" />
                      <span>Open Media Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 space-y-3">
                <p className="text-gray-400">Please run virality evaluation on a PASSED video first.</p>
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Go to Metric Filter Step
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Advanced Media Studio & Storyboard Preview */}
        {activeStep === 4 && (
          <div className="animate-fadeIn">
            {reStrategy ? (
              <MediaStudioStep
                reStrategy={reStrategy}
                product={product}
              />
            ) : (
              <div className="text-center py-16 space-y-3">
                <p className="text-gray-400">Please run virality evaluation and generate product adaptation first.</p>
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Go to Metric Filter Step
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Database Logs & Export */}
        {activeStep === 5 && (
          <div className="animate-fadeIn">
            <LogHistoryTable
              logs={logs}
              onRefreshLogs={refreshLogs}
              onSelectLogRecord={handleSelectLogRecord}
            />
          </div>
        )}

      </main>

      {/* JSON Payload Modal */}
      <JsonOutputModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        apiResponse={currentApiResponse}
      />

      {/* Footer */}
      <footer className="border-t border-gray-800/80 py-6 text-center text-xs text-gray-500 font-mono">
        Viral Video Cloning Engine • Strict Outlier Virality Assessor & AI Script Re-Strategizer
      </footer>

    </div>
  );
}
