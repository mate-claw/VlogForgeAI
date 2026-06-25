import type { ProductAnalytics, VlogJob } from '@ai-vlog/shared';
import { listJobs } from './jobStore';

function inc(map: Map<string, number>, key?: string) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function top(map: Map<string, number>, limit = 8) {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([key, count]) => ({ key, count }));
}

export function buildProductAnalytics(userId?: string): ProductAnalytics {
  const jobs = listJobs(1000).filter((job) => !userId || job.userId === userId);
  const bgm = new Map<string, number>();
  const styles = new Map<string, number>();
  const failures = new Map<string, number>();
  let versions = 0;
  let feedbackCount = 0;
  let likes = 0;
  let dislikes = 0;
  let keeps = 0;
  let shares = 0;
  let downloads = 0;
  const bestScores: number[] = [];
  let recommendedSelected = 0;
  let selectedCount = 0;

  for (const job of jobs as VlogJob[]) {
    if (job.error) inc(failures, job.error.slice(0, 80));
    versions += job.versions?.length || 0;
    if (typeof job.bestQualityScore === 'number') bestScores.push(job.bestQualityScore);
    for (const version of job.versions || []) {
      inc(bgm, version.plan?.bgmId);
      inc(styles, version.plan?.visualStyle);
    }
    for (const fb of job.feedback || []) {
      feedbackCount += 1;
      if (fb.action === 'like') likes += 1;
      if (fb.action === 'dislike') dislikes += 1;
      if (fb.action === 'keep') keeps += 1;
      if (fb.action === 'share') shares += 1;
      if (fb.action === 'download') downloads += 1;
      if (fb.action === 'select') {
        selectedCount += 1;
        if (fb.versionId === job.recommendedVersionId) recommendedSelected += 1;
      }
    }
  }
  return {
    generatedJobs: jobs.length,
    completedJobs: jobs.filter((j) => j.status === 'completed').length,
    failedJobs: jobs.filter((j) => j.status === 'failed').length,
    totalVersions: versions,
    feedbackCount,
    likes,
    dislikes,
    keeps,
    shares,
    downloads,
    averageBestQualityScore: bestScores.length ? Math.round(bestScores.reduce((a, b) => a + b, 0) / bestScores.length) : undefined,
    recommendedSelectedRate: selectedCount ? Math.round((recommendedSelected / selectedCount) * 100) : undefined,
    topBgms: top(bgm).map((x) => ({ bgmId: x.key, count: x.count })),
    topStyles: top(styles).map((x) => ({ style: x.key, count: x.count })),
    failureReasons: top(failures, 6).map((x) => ({ reason: x.key, count: x.count })),
  };
}
