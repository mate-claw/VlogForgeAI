import fs from 'node:fs';
import path from 'node:path';
import type { VlogPlan } from '@ai-vlog/shared';
import { publicUrlFor } from '../config';

function escapeXml(text: string) {
  return text.replace(/[<>&'"]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[ch] || ch));
}

export function generateSvgCover(params: { jobId: string; jobDir: string; versionId: string; plan: VlogPlan }): { coverPath: string; coverUrl: string } {
  const coverName = `cover-${params.versionId}.svg`;
  const coverPath = path.resolve(params.jobDir, coverName);
  const title = escapeXml(params.plan.title || 'VlogForgeAI');
  const subtitle = escapeXml(params.plan.subtitle || params.plan.storyType || '');
  const bg = params.plan.typography?.accentColor || '#f3b26b';
  const text = params.plan.typography?.textColor || '#ffffff';
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="#141414"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000" flood-opacity="0.35"/></filter>
  </defs>
  <rect width="1080" height="1920" fill="url(#g)"/>
  <circle cx="920" cy="220" r="180" fill="#fff" opacity="0.16"/>
  <circle cx="180" cy="1540" r="260" fill="#fff" opacity="0.08"/>
  <rect x="80" y="1040" width="920" height="560" rx="56" fill="#000" opacity="0.26" filter="url(#shadow)"/>
  <text x="120" y="1220" font-size="84" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Microsoft YaHei', sans-serif" font-weight="800" fill="${text}">${title}</text>
  <text x="120" y="1325" font-size="40" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Microsoft YaHei', sans-serif" fill="${text}" opacity="0.88">${subtitle}</text>
  <text x="120" y="1490" font-size="30" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Microsoft YaHei', sans-serif" fill="${text}" opacity="0.7">AI 生活 Vlog · ${escapeXml(params.plan.visualStyle)} · ${escapeXml(params.plan.pace)}</text>
</svg>`;
  fs.writeFileSync(coverPath, svg, 'utf-8');
  return { coverPath, coverUrl: publicUrlFor(`storage/jobs/${params.jobId}/${encodeURIComponent(coverName)}`) };
}
