import { VideoMetrics, MetricEvaluation } from '../types';

export function evaluateVirality(metrics: VideoMetrics): MetricEvaluation {
  const { followers, views, likes, comments } = metrics;
  
  const totalEngagement = likes + comments;
  const requiredViews = followers * 2;
  const requiredEngagement = followers * 0.5;

  const condition1Passed = views >= requiredViews;
  const condition2Passed = totalEngagement > requiredEngagement;

  const viewsMultiplier = followers > 0 ? Number((views / followers).toFixed(2)) : 0;
  const engagementRatioNum = followers > 0 ? (totalEngagement / followers) : 0;
  const engagementRatio = Number((engagementRatioNum * 100).toFixed(1));

  let status: 'PASSED' | 'REJECTED' = 'REJECTED';
  let reason = '';

  if (condition1Passed && condition2Passed) {
    status = 'PASSED';
    reason = `Video meets Outlier Virality Threshold! Views are ${viewsMultiplier}x followers (min 2x) and Total Engagement is ${(engagementRatioNum * 100).toFixed(1)}% of followers (min 50%).`;
  } else if (!condition1Passed && !condition2Passed) {
    reason = `Rejected: Failed both conditions. Views (${views.toLocaleString()}) < required (${requiredViews.toLocaleString()}) and Total Engagement (${totalEngagement.toLocaleString()}) <= required (${requiredEngagement.toLocaleString()}).`;
  } else if (!condition1Passed) {
    reason = `Rejected: Condition 1 Failed (Views Outlier Threshold). Video has ${views.toLocaleString()} views, but requires at least ${requiredViews.toLocaleString()} views (2x Followers of ${followers.toLocaleString()}).`;
  } else {
    reason = `Rejected: Condition 2 Failed (Engagement Threshold). Total Engagement (${totalEngagement.toLocaleString()}) must be strictly greater than ${requiredEngagement.toLocaleString()} (50% of ${followers.toLocaleString()} Followers).`;
  }

  return {
    status,
    reason,
    condition1Passed,
    condition2Passed,
    totalEngagement,
    engagementRatio,
    viewsMultiplier,
    requiredViews,
    requiredEngagement
  };
}
