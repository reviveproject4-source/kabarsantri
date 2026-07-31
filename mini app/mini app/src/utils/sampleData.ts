import { VideoMetrics } from '../types';

export interface PresetSample {
  id: string;
  title: string;
  platform: 'tiktok' | 'reels';
  metrics: VideoMetrics;
  productSuggestion: string;
  expectedStatus: 'PASSED' | 'REJECTED';
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'sample-1',
    title: '🔥 Ultra Viral Gadget Review (500k Views / 20k Followers)',
    platform: 'tiktok',
    expectedStatus: 'PASSED',
    productSuggestion: 'Noise-Cancelling Wireless Earbuds Pro',
    metrics: {
      url: 'https://www.tiktok.com/@techguru/video/73289102910492',
      followers: 20000,
      views: 540000,
      likes: 12500,
      comments: 1800,
      platform: 'tiktok'
    }
  },
  {
    id: 'sample-2',
    title: '⚡ Viral Skincare Transformation (2.4M Views / 100k Followers)',
    platform: 'reels',
    expectedStatus: 'PASSED',
    productSuggestion: 'Hydrating Vitamin C Glow Serum',
    metrics: {
      url: 'https://www.instagram.com/reel/C38xLKspO89/',
      followers: 100000,
      views: 2400000,
      likes: 58000,
      comments: 4200,
      platform: 'reels'
    }
  },
  {
    id: 'sample-3',
    title: '⚠️ Average Performance Reel (Failed Virality Filter)',
    platform: 'reels',
    expectedStatus: 'REJECTED',
    productSuggestion: 'Ergonomic Desk Chair',
    metrics: {
      url: 'https://www.instagram.com/reel/C19xAA9pQ77/',
      followers: 50000,
      views: 65000, // < 100,000 (2x followers)
      likes: 3200,
      comments: 150, // Total 3,350 < 25,000 (50% followers)
      platform: 'reels'
    }
  },
  {
    id: 'sample-4',
    title: '🚀 High View Low Engagement Outlier (Failed Condition 2)',
    platform: 'tiktok',
    expectedStatus: 'REJECTED',
    productSuggestion: 'Portable Espresso Maker',
    metrics: {
      url: 'https://www.tiktok.com/@coffeevibe/video/7192830192',
      followers: 10000,
      views: 35000, // Passed condition 1 (>= 20k)
      likes: 800,
      comments: 50, // Total 850 < 5,000 (50% followers -> failed condition 2)
      platform: 'tiktok'
    }
  }
];
