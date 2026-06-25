import fs from 'node:fs';
import path from 'node:path';
import type { CommercialVlogVersion, UserPreferenceProfile, VisualStyle, VlogJob, VlogPace, VlogVersionFeedback } from '@ai-vlog/shared';
import { dbDir, ensureStorageDirs } from './paths';
import { nowIso } from './time';

const preferencePath = path.resolve(dbDir, 'user-preferences.json');

function readAll(): Record<string, UserPreferenceProfile> {
  ensureStorageDirs();
  if (!fs.existsSync(preferencePath)) return {};
  return JSON.parse(fs.readFileSync(preferencePath, 'utf-8')) as Record<string, UserPreferenceProfile>;
}

function writeAll(data: Record<string, UserPreferenceProfile>) {
  ensureStorageDirs();
  fs.writeFileSync(preferencePath, JSON.stringify(data, null, 2), 'utf-8');
}

function uniq<T>(items: T[], limit = 8): T[] {
  return Array.from(new Set(items.filter(Boolean))).slice(0, limit);
}

function emptyProfile(userId: string): UserPreferenceProfile {
  return {
    userId,
    updatedAt: nowIso(),
    sampleSize: 0,
    preferredMoods: [],
    preferredVisualStyles: [],
    preferredPaces: [],
    preferredBgms: [],
    dislikedBgms: [],
    likesCaptions: true,
    likesStickers: true,
    likesCinematic: false,
    likesSocialNatural: false,
    preferredDurationSeconds: 42,
    dislikedPatterns: [],
    promptHint: '暂无历史偏好。请优先根据本次素材自然导演，不要套固定模板。',
    recentPositiveSignals: [],
    recentNegativeSignals: [],
  };
}

export function getUserPreferenceProfile(userId?: string): UserPreferenceProfile | undefined {
  if (!userId || userId === 'anonymous') return undefined;
  return readAll()[userId] || emptyProfile(userId);
}

function isPositive(action: VlogVersionFeedback['action']) {
  return ['like', 'keep', 'share', 'download', 'select', 'save'].includes(action);
}

function isNegative(action: VlogVersionFeedback['action']) {
  return ['dislike', 'delete', 'too_many_effects', 'too_slow', 'too_fast'].includes(action);
}

function styleSignals(version?: CommercialVlogVersion): {
  moods: string[];
  styles: VisualStyle[];
  paces: VlogPace[];
  bgms: string[];
  duration?: number;
  negative: string[];
} {
  const plan = version?.plan;
  if (!plan) return { moods: [], styles: [], paces: [], bgms: [], duration: undefined, negative: [] as string[] };
  const stickerCount = plan.scenes?.reduce((sum, scene) => sum + (scene.stickers?.length || 0), 0) || 0;
  const overlays = plan.scenes?.flatMap((scene) => scene.overlays || []) || [];
  const negative: string[] = [];
  if (stickerCount > 12) negative.push('too_many_stickers');
  if (overlays.includes('flash') || overlays.includes('flash_overlay')) negative.push('too_flashy');
  return {
    moods: [plan.mood, plan.storyType].filter(Boolean),
    styles: [plan.visualStyle].filter(Boolean),
    paces: [plan.pace].filter(Boolean),
    bgms: [plan.bgmId].filter(Boolean),
    duration: plan.duration,
    negative,
  };
}

export function updatePreferenceFromFeedback(params: { userId?: string; job: VlogJob; feedback: VlogVersionFeedback }): UserPreferenceProfile | undefined {
  const userId = params.userId || params.feedback.userId || params.job.userId;
  if (!userId || userId === 'anonymous') return undefined;
  const all = readAll();
  const current = all[userId] || emptyProfile(userId);
  const version = params.job.versions.find((item) => item.versionId === params.feedback.versionId);
  const signals = styleSignals(version);
  const positive = isPositive(params.feedback.action);
  const negative = isNegative(params.feedback.action);

  const next: UserPreferenceProfile = {
    ...current,
    updatedAt: nowIso(),
    sampleSize: current.sampleSize + 1,
  };

  if (positive) {
    next.preferredMoods = uniq([...signals.moods, ...current.preferredMoods], 8);
    next.preferredVisualStyles = uniq([...signals.styles, ...current.preferredVisualStyles], 6) as UserPreferenceProfile['preferredVisualStyles'];
    next.preferredPaces = uniq([...signals.paces, ...current.preferredPaces], 6) as UserPreferenceProfile['preferredPaces'];
    next.preferredBgms = uniq([...signals.bgms, ...current.preferredBgms], 8);
    if (signals.duration) next.preferredDurationSeconds = Math.round((current.preferredDurationSeconds * Math.max(1, current.sampleSize) + signals.duration) / (Math.max(1, current.sampleSize) + 1));
    next.likesCinematic = current.likesCinematic || signals.styles.includes('cinematic');
    next.likesSocialNatural = current.likesSocialNatural || signals.styles.includes('social');
    next.recentPositiveSignals = uniq([`${params.feedback.action}:${version?.label || version?.plan?.title || params.feedback.versionId}`, ...current.recentPositiveSignals], 10);
  }

  if (negative) {
    if (signals.bgms.length) next.dislikedBgms = uniq([...signals.bgms, ...current.dislikedBgms], 8);
    next.dislikedPatterns = uniq([params.feedback.action, ...(signals.negative || []), ...(params.feedback.reason ? [params.feedback.reason] : []), ...current.dislikedPatterns], 12);
    if (params.feedback.action === 'too_many_effects') next.likesStickers = false;
    if (params.feedback.action === 'too_fast') next.preferredPaces = uniq(['slow', 'medium_slow', ...current.preferredPaces], 6) as UserPreferenceProfile['preferredPaces'];
    if (params.feedback.action === 'too_slow') next.preferredPaces = uniq(['medium_fast', 'fast', ...current.preferredPaces], 6) as UserPreferenceProfile['preferredPaces'];
    next.recentNegativeSignals = uniq([`${params.feedback.action}:${version?.label || params.feedback.versionId}`, ...current.recentNegativeSignals], 10);
  }

  next.promptHint = buildPreferencePromptHint(next);
  all[userId] = next;
  writeAll(all);
  return next;
}

export function buildPreferencePromptHint(profile?: UserPreferenceProfile): string {
  if (!profile || profile.sampleSize === 0) return '暂无用户历史偏好。请完全根据本次素材自然导演。';
  const parts = [
    `用户历史反馈样本数：${profile.sampleSize}`,
    profile.preferredVisualStyles.length ? `偏好风格：${profile.preferredVisualStyles.join('、')}` : '',
    profile.preferredPaces.length ? `偏好节奏：${profile.preferredPaces.join('、')}` : '',
    profile.preferredBgms.length ? `偏好BGM：${profile.preferredBgms.join('、')}` : '',
    profile.dislikedBgms.length ? `尽量避免BGM：${profile.dislikedBgms.join('、')}` : '',
    `偏好片长约 ${profile.preferredDurationSeconds} 秒`,
    profile.likesStickers ? '可以使用贴纸，但要服务故事' : '用户不喜欢过多贴纸和花哨特效，请克制',
    profile.likesSocialNatural ? '用户倾向自然朋友圈感，字幕要像本人生活记录' : '',
    profile.likesCinematic ? '用户接受电影感包装，但不要牺牲真实生活感' : '',
    profile.dislikedPatterns.length ? `负面反馈：${profile.dislikedPatterns.join('、')}` : '',
  ].filter(Boolean);
  return parts.join('；');
}

export function listPreferenceProfiles() {
  return Object.values(readAll()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
