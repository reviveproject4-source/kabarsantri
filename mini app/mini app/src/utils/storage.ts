import { DatabaseRecord, StandardApiResponse, VideoMetrics, MetricEvaluation, ReStrategyOutput } from '../types';

const STORAGE_KEY = 'viral_video_cloning_logs_v1';

export function getStoredLogs(): DatabaseRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getInitialDefaultLogs();
  } catch (e) {
    console.error("Failed to load logs", e);
    return getInitialDefaultLogs();
  }
}

export function saveLogRecord(record: Omit<DatabaseRecord, 'id' | 'timestamp'>): DatabaseRecord {
  const logs = getStoredLogs();
  const newRecord: DatabaseRecord = {
    ...record,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
  };

  const updatedLogs = [newRecord, ...logs];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.error("Failed to save log", e);
  }
  return newRecord;
}

export function clearLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear logs", e);
  }
}

export function buildStandardApiResponse(
  metrics: VideoMetrics,
  evaluation: MetricEvaluation,
  reStrategy?: ReStrategyOutput
): StandardApiResponse {
  if (evaluation.status === 'REJECTED' || !reStrategy) {
    return {
      status: 'REJECTED',
      reason: evaluation.reason,
      metrics: {
        views: metrics.views,
        followers: metrics.followers,
        engagement_ratio: `${evaluation.engagementRatio}%`
      }
    };
  }

  return {
    status: 'PASSED',
    reason: evaluation.reason,
    metrics: {
      views: metrics.views,
      followers: metrics.followers,
      engagement_ratio: `${evaluation.engagementRatio}%`
    },
    generated_assets: {
      hook_options: reStrategy.hookOptions.map(h => `${h.type}: "${h.headline}"`),
      adapted_script: reStrategy.adaptedScript,
      scene_prompts: reStrategy.scenePrompts.map(s => `[Scene ${s.scene}] ${s.visualPrompt}`),
      voiceover_text: reStrategy.voiceoverText
    }
  };
}

export function downloadJsonFile(filename: string, data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportLogsToCSV(logs: DatabaseRecord[]) {
  if (logs.length === 0) return;
  const headers = ['timestamp', 'video_url', 'followers_count', 'views_count', 'total_engagement', 'filter_status', 'output_status', 'product_name'];
  const rows = logs.map(l => [
    `"${l.timestamp}"`,
    `"${l.video_url}"`,
    l.followers_count,
    l.views_count,
    l.total_engagement,
    `"${l.filter_status}"`,
    `"${l.output_status}"`,
    `"${l.product_name || 'N/A'}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `viral_video_cloning_logs_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getInitialDefaultLogs(): DatabaseRecord[] {
  return [
    {
      id: 'log_seed_1',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      video_url: 'https://www.tiktok.com/@techguru/video/73289102910492',
      followers_count: 20000,
      views_count: 540000,
      total_engagement: 14300,
      filter_status: 'PASSED',
      original_transcript: 'If you still carry around 3 different chargers in your bag...',
      adapted_script: 'If you are still relying on old solutions for Lifestyle & Tech...',
      visual_prompts_json: '[{"scene":1,"prompt":"Cinematic shot..."}]',
      output_status: 'READY_FOR_RENDER',
      product_name: 'Noise-Cancelling Wireless Earbuds Pro'
    },
    {
      id: 'log_seed_2',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      video_url: 'https://www.instagram.com/reel/C19xAA9pQ77/',
      followers_count: 50000,
      views_count: 65000,
      total_engagement: 3350,
      filter_status: 'REJECTED',
      original_transcript: 'N/A - Video did not pass Virality threshold',
      adapted_script: 'N/A',
      visual_prompts_json: '[]',
      output_status: 'REJECTED',
      product_name: 'Ergonomic Desk Chair'
    }
  ];
}
