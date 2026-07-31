export interface VideoMetrics {
  url: string;
  followers: number;
  views: number;
  likes: number;
  comments: number;
  platform?: 'tiktok' | 'reels' | 'shorts';
}

export interface MetricEvaluation {
  status: 'PASSED' | 'REJECTED';
  reason: string;
  condition1Passed: boolean; // Views >= Followers * 2
  condition2Passed: boolean; // (Likes + Comments) > Followers * 0.5
  totalEngagement: number;
  engagementRatio: number; // (Likes + Comments) / Followers
  viewsMultiplier: number; // Views / Followers
  requiredViews: number;
  requiredEngagement: number;
}

export interface ContentDeconstruction {
  audioTranscript: string;
  hook: {
    durationSec: number;
    verbalHook: string;
    visualStyle: string;
    hookType: string;
  };
  valueProposition: {
    coreMessage: string;
    emotionalTriggers: string[];
    copywritingFramework: string; // e.g. AIDA, PAS, BAB
    targetPainPoint: string;
  };
  sceneStructure: {
    sceneNumber: number;
    timeframe: string;
    description: string;
    cameraMotion: string;
    pacing: 'Fast' | 'Moderate' | 'Slow';
  }[];
}

export interface ProductDetails {
  name: string;
  niche: string;
  targetAudience: string;
  keyFeatures: string;
  callToActionText: string;
}

export interface SceneVisualPrompt {
  scene: number;
  timeframe: string;
  scriptLine: string;
  visualPrompt: string;
  cameraMotion: string;
  lightingStyle: string;
}

export interface ReStrategyOutput {
  hookOptions: {
    type: string;
    headline: string;
    visualInstruction: string;
  }[];
  adaptedScript: string;
  ctaText: string;
  scenePrompts: SceneVisualPrompt[];
  voiceoverText: string;
  sfxCues: string[];
}

export interface DatabaseRecord {
  id: string;
  timestamp: string;
  video_url: string;
  followers_count: number;
  views_count: number;
  total_engagement: number;
  filter_status: 'PASSED' | 'REJECTED';
  original_transcript: string;
  adapted_script: string;
  visual_prompts_json: string;
  output_status: 'READY_FOR_RENDER' | 'REJECTED';
  product_name?: string;
  metrics_json?: string;
}

export interface StandardApiResponse {
  status: 'PASSED' | 'REJECTED';
  reason: string;
  metrics: {
    views: number;
    followers: number;
    engagement_ratio: string;
  };
  generated_assets?: {
    hook_options: string[];
    adapted_script: string;
    scene_prompts: string[];
    voiceover_text: string;
  };
}
