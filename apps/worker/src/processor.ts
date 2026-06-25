import fs from 'node:fs';
import path from 'node:path';
import type {
  AssetAnalysis,
  CommercialVlogVersion,
  DirectorRevisionSuggestion,
  UploadedAsset,
  VlogPlan,
  VlogRenderInput,
} from '@ai-vlog/shared';
import {
  config,
  failJob,
  getJobDir,
  readJob,
  readJsonFile,
  updateJob,
  getUserPreferenceProfile,
  timedJobStep,
  recordJobMetric,
} from '@ai-vlog/core';
import {
  createCommercialVariantPlanWithQwen,
  createDirectorPlanWithQwen,
  evaluateVlogPlanWithQwen,
  improveDirectorPlanFromEvaluationWithQwen,
  reviseDirectorPlanWithQwen,
} from '../../api/src/services/qwenService';
import { analyzeAssetsWithCache } from '../../api/src/services/analysisCache';
import { getBgmById, resolveBgmUrl } from '../../api/src/services/bgmCatalog';
import { renderWithRemotion } from '../../api/src/services/remotionRenderer';
import { RenderQueue } from '../../api/src/services/renderQueue';
import { generateSvgCover } from '../../api/src/services/coverService';
import { publishJobFile } from '../../api/src/services/objectStorage';

const renderQueue = new RenderQueue(Math.max(1, config.renderConcurrency));

function sanitizeRevisionForJob(value: unknown) {
  const text = String(value || 'ai-revise')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  return text || 'ai-revise';
}

function markVersion(jobId: string, version: CommercialVlogVersion) {
  const job = readJob(jobId);
  if (!job) throw new Error(`找不到任务：${jobId}`);
  const versions = [...job.versions.filter((item) => item.versionId !== version.versionId), version];
  updateJob(jobId, { versions, activeVersionId: job.activeVersionId || version.versionId }, `version ${version.versionId}`);
}


function summarizeQuality(jobId: string) {
  const job = readJob(jobId);
  if (!job) return;
  const evaluated = job.versions.filter((v) => v.quality && !(job.deletedVersionIds || []).includes(v.versionId));
  if (!evaluated.length) return;
  const best = [...evaluated].sort((a, b) => (b.quality?.overallScore || 0) - (a.quality?.overallScore || 0))[0];
  const versions = job.versions.map((version) => ({
    ...version,
    isRecommended: version.versionId === best.versionId,
  }));
  const averageScore = Math.round(evaluated.reduce((sum, item) => sum + (item.quality?.overallScore || 0), 0) / evaluated.length);
  updateJob(jobId, {
    versions,
    recommendedVersionId: best.versionId,
    activeVersionId: best.versionId,
    bestQualityScore: best.quality?.overallScore,
    qualitySummary: {
      evaluatedVersions: evaluated.length,
      recommendedVersionId: best.versionId,
      bestScore: best.quality?.overallScore,
      averageScore,
    },
  }, `quality recommended ${best.versionId}`);
}

async function evaluateAndMarkVersion(jobId: string, params: {
  versionId: string;
  assets: UploadedAsset[];
  analyses: AssetAnalysis[];
  plan: VlogPlan;
  label?: string;
}) {
  let job = readJob(jobId);
  if (!job) throw new Error(`找不到任务：${jobId}`);
  let version = job.versions.find((item) => item.versionId === params.versionId);
  if (!version) throw new Error(`找不到版本：${params.versionId}`);
  version.qualityStatus = 'evaluating';
  markVersion(jobId, version);

  const quality = await timedJobStep(jobId, `qwen_quality_${params.versionId}`, () => evaluateVlogPlanWithQwen({ assets: params.assets, analyses: params.analyses, plan: params.plan, versionLabel: params.label }), { versionId: params.versionId });
  job = readJob(jobId);
  version = job?.versions.find((item) => item.versionId === params.versionId);
  if (!version) throw new Error(`找不到版本：${params.versionId}`);
  version.quality = quality;
  version.qualityStatus = quality.shouldRegenerate || quality.overallScore < config.qualityThreshold ? 'needs_regeneration' : 'passed';
  version.description = quality.recommendationReason || version.description;
  markVersion(jobId, version);
  summarizeQuality(jobId);
  return quality;
}

async function renderEvaluateMaybeImprove(jobId: string, params: {
  versionId: string;
  label: string;
  description?: string;
  plan: VlogPlan;
  assets: UploadedAsset[];
  analyses: AssetAnalysis[];
  allowAutoRegenerate?: boolean;
}): Promise<CommercialVlogVersion> {
  const initial = await renderPreviewVersion(jobId, { versionId: params.versionId, label: params.label, description: params.description, plan: params.plan });
  const quality = await evaluateAndMarkVersion(jobId, { versionId: params.versionId, assets: params.assets, analyses: params.analyses, plan: params.plan, label: params.label });
  if (params.allowAutoRegenerate && config.autoRegenerateMax > 0 && (quality.shouldRegenerate || quality.overallScore < config.qualityThreshold)) {
    updateJob(jobId, { status: 'directing', stage: `AI 质量评估 ${quality.overallScore} 分，正在自动重导：${params.label}`, progress: 52 }, 'quality auto regenerate');
    const jobForPreference = readJob(jobId);
    const userPreference = getUserPreferenceProfile(jobForPreference?.userId);
    const improvedPlan = await timedJobStep(jobId, `qwen_quality_repair_${params.versionId}`, () => improveDirectorPlanFromEvaluationWithQwen({ assets: params.assets, analyses: params.analyses, currentPlan: params.plan, evaluation: quality, preference: userPreference }), { score: quality.overallScore });
    const improvedVersionId = `${params.versionId}-qfix1`;
    const improved = await renderPreviewVersion(jobId, { versionId: improvedVersionId, label: `${params.label} · AI重导`, description: quality.improvementInstruction || quality.problems.join('；'), plan: improvedPlan });
    improved.autoRegeneratedFrom = params.versionId;
    markVersion(jobId, improved);
    await evaluateAndMarkVersion(jobId, { versionId: improvedVersionId, assets: params.assets, analyses: params.analyses, plan: improvedPlan, label: improved.label });
    updateJob(jobId, { activeVersionId: improvedVersionId }, `auto regenerated active ${improvedVersionId}`);
    return improved;
  }
  return initial;
}

async function renderPreviewVersion(jobId: string, params: {
  versionId: string;
  label: string;
  description?: string;
  plan: VlogPlan;
  suggestion?: DirectorRevisionSuggestion;
}): Promise<CommercialVlogVersion> {
  const jobDir = getJobDir(jobId);
  const bgm = getBgmById(params.plan.bgmId);
  const bgmUrl = resolveBgmUrl(params.plan.bgmId);
  const input: VlogRenderInput = {
    plan: params.plan,
    bgm,
    bgmUrl,
    generatedAt: new Date().toISOString(),
    renderMode: 'preview',
    outputAspect: '9:16',
    maxDurationSeconds: config.previewDurationSeconds,
  };
  fs.writeFileSync(path.resolve(jobDir, `director-plan-${params.versionId}.json`), JSON.stringify(params.plan, null, 2), 'utf-8');

  const version: CommercialVlogVersion = {
    versionId: params.versionId,
    label: params.label,
    description: params.description,
    status: 'rendering',
    progress: 10,
    hdStatus: 'queued',
    plan: params.plan,
    selectedBgm: bgm,
    bgmUrl,
    qualityStatus: 'pending',
    createdAt: new Date().toISOString(),
  };
  markVersion(jobId, version);

  const previewName = `preview-${params.versionId}.mp4`;
  const preview = await timedJobStep(jobId, `remotion_${params.versionId}_preview`, () => renderQueue.run(() => renderWithRemotion({
    jobId,
    jobDir,
    input,
    outputFileName: previewName,
    renderMode: 'preview',
  })), { versionId: params.versionId, mode: 'preview' });
  const cover = generateSvgCover({ jobId, jobDir, versionId: params.versionId, plan: params.plan });

  version.previewUrl = await publishJobFile({ jobId, jobDir, fileName: previewName, contentType: 'video/mp4' });
  version.coverUrl = await publishJobFile({ jobId, jobDir, fileName: `cover-${params.versionId}.svg`, contentType: 'image/svg+xml; charset=utf-8' });
  version.videoUrl = version.previewUrl;
  version.renderLog = preview.renderLog;
  version.progress = 55;
  version.status = 'ready';
  markVersion(jobId, version);
  return version;
}

async function renderHdForVersion(jobId: string, versionId: string, aspect: '9:16' | '1:1' | '16:9' = '9:16') {
  const job = readJob(jobId);
  if (!job) throw new Error(`找不到任务：${jobId}`);
  const jobDir = getJobDir(jobId);
  const version = job.versions.find((item) => item.versionId === versionId);
  if (!version?.plan) throw new Error(`找不到版本或导演方案：${versionId}`);
  version.hdStatus = 'rendering';
  version.progress = Math.max(version.progress, 60);
  markVersion(jobId, version);

  const bgm = getBgmById(version.plan.bgmId);
  const bgmUrl = resolveBgmUrl(version.plan.bgmId);
  const input: VlogRenderInput = {
    plan: version.plan,
    bgm,
    bgmUrl,
    generatedAt: new Date().toISOString(),
    renderMode: 'final',
    outputAspect: aspect,
  };
  const suffix = aspect === '1:1' ? 'square' : aspect === '16:9' ? 'wide' : 'final';
  const finalName = `${suffix}-${version.versionId}.mp4`;
  const final = await timedJobStep(jobId, `remotion_${versionId}_${aspect}`, () => renderQueue.run(() => renderWithRemotion({
    jobId,
    jobDir,
    input,
    outputFileName: finalName,
    renderMode: 'final',
  })), { versionId, aspect, mode: 'final' });
  const publishedUrl = await publishJobFile({ jobId, jobDir, fileName: finalName, contentType: 'video/mp4' });
  if (aspect === '1:1') version.squareVideoUrl = publishedUrl;
  else version.videoUrl = publishedUrl;
  version.renderLog = [...(version.renderLog || []), ...final.renderLog];
  version.hdStatus = 'ready';
  version.progress = 100;
  version.status = 'ready';
  markVersion(jobId, version);
  return version;
}

export async function processCreateVlog(jobId: string, payload: { assets?: UploadedAsset[] }) {
  try {
    const jobDir = getJobDir(jobId);
    const assets = payload.assets || readJsonFile<UploadedAsset[]>(path.resolve(jobDir, 'assets.json'));
    updateJob(jobId, { status: 'analyzing', stage: 'Worker 正在分析素材并复用缓存', progress: 12, assets }, 'worker analysis');
    const { analyses, cacheHits } = await timedJobStep(jobId, 'qwen_vl_analysis_with_cache', () => analyzeAssetsWithCache(assets, jobDir), { assetCount: assets.length });
    fs.writeFileSync(path.resolve(jobDir, 'assets.json'), JSON.stringify(assets, null, 2), 'utf-8');
    fs.writeFileSync(path.resolve(jobDir, 'analysis.json'), JSON.stringify(analyses, null, 2), 'utf-8');
    updateJob(jobId, { analysis: analyses, analysisCacheHits: cacheHits, status: 'directing', stage: `AI 正在生成第一版故事和剪辑方案（缓存命中 ${cacheHits}/${assets.length}）`, progress: 30 }, 'analysis ready');

    const currentJob = readJob(jobId);
    const userPreference = getUserPreferenceProfile(currentJob?.userId);
    if (userPreference) {
      updateJob(jobId, { userPreferenceSnapshot: userPreference, personalizationHint: userPreference.promptHint }, 'personalization applied');
    }
    const basePlan = await timedJobStep(jobId, 'qwen_director_plan', () => createDirectorPlanWithQwen(assets, analyses, userPreference), { assetCount: assets.length });
    updateJob(jobId, { status: 'rendering_preview', stage: `正在生成 ${config.previewDurationSeconds} 秒极速预览`, progress: 44 }, 'preview v1');
    const firstVersion = await renderEvaluateMaybeImprove(jobId, { versionId: 'v1', label: 'AI 首选版', description: basePlan.directorComment, plan: basePlan, assets, analyses, allowAutoRegenerate: true });
    updateJob(jobId, { status: 'partial_ready', stage: '极速预览已可播放，AI 已完成质量评估，后台正在生成高清版和更多版本', progress: 58, activeVersionId: firstVersion.versionId }, 'preview quality ready');

    updateJob(jobId, { status: 'rendering_hd', stage: `正在生成推荐版本高清 MP4：${firstVersion.label}`, progress: 64 }, 'hd recommended');
    await renderHdForVersion(jobId, firstVersion.versionId, '9:16');
    updateJob(jobId, { status: 'rendering_versions', stage: 'AI 正在继续生成 2 个差异化版本', progress: 72 }, 'variants');

    const suggestions = (basePlan.revisionSuggestions || []).slice(0, 2);
    for (let i = 0; i < suggestions.length; i += 1) {
      const suggestion = suggestions[i];
      updateJob(jobId, { status: 'rendering_versions', stage: `正在生成第 ${i + 2} 个版本：${suggestion.label}`, progress: 74 + i * 10 }, 'variant directing');
      const plan = await timedJobStep(jobId, 'qwen_variant_plan', () => createCommercialVariantPlanWithQwen({ assets, analyses, basePlan, suggestion, preference: userPreference }), { suggestion: suggestion.label });
      const versionId = `v${i + 2}`;
      await renderEvaluateMaybeImprove(jobId, { versionId, label: suggestion.label, description: suggestion.reason || suggestion.expectedChange, plan, assets, analyses, allowAutoRegenerate: false });
      await renderHdForVersion(jobId, versionId, '9:16');
    }

    summarizeQuality(jobId);
    const finalJob = readJob(jobId);
    recordJobMetric(jobId, { name: 'job_completed', detail: { versionCount: finalJob?.versions.length || 0, cacheHits } });
    updateJob(jobId, { status: 'completed', stage: '已生成多版本，AI 已完成质量评估并推荐最佳版本', progress: 100, activeVersionId: finalJob?.recommendedVersionId || finalJob?.activeVersionId }, 'completed');
  } catch (error) {
    failJob(jobId, error);
    throw error;
  }
}

export async function processReviseVlog(jobId: string, payload: { suggestion: DirectorRevisionSuggestion }) {
  try {
    const job = readJob(jobId);
    if (!job) throw new Error(`找不到任务：${jobId}`);
    const jobDir = getJobDir(jobId);
    const assets = job.assets || readJsonFile<UploadedAsset[]>(path.resolve(jobDir, 'assets.json'));
    const analyses = job.analysis || readJsonFile<AssetAnalysis[]>(path.resolve(jobDir, 'analysis.json'));
    const baseVersion = job.versions.find((item) => item.versionId === job.activeVersionId) || job.versions[0];
    const currentPlan = baseVersion?.plan || readJsonFile<VlogPlan>(path.resolve(jobDir, 'director-plan-v1.json'));
    const suggestion = payload.suggestion;
    const versionId = `v${job.versions.length + 1}-${sanitizeRevisionForJob(suggestion.label)}`;
    updateJob(jobId, { status: 'revising', stage: `Worker 正在按「${suggestion.label}」重新导演`, progress: 70 }, 'revision');
    const userPreference = getUserPreferenceProfile(job.userId);
    if (userPreference) updateJob(jobId, { userPreferenceSnapshot: userPreference, personalizationHint: userPreference.promptHint }, 'personalization applied revision');
    const plan = await timedJobStep(jobId, 'qwen_revise_plan', () => reviseDirectorPlanWithQwen({ assets, analyses, currentPlan, revision: suggestion, preference: userPreference }), { suggestion: suggestion.label });
    const revisedVersion = await renderEvaluateMaybeImprove(jobId, { versionId, label: suggestion.label, description: suggestion.reason || suggestion.expectedChange, plan, assets, analyses, allowAutoRegenerate: true });
    updateJob(jobId, { status: 'partial_ready', stage: `新版本预览与质量评估已完成：${revisedVersion.label}，正在生成高清版`, progress: 84, activeVersionId: revisedVersion.versionId }, 'revision preview quality ready');
    await renderHdForVersion(jobId, revisedVersion.versionId, '9:16');
    summarizeQuality(jobId);
    const latestJob = readJob(jobId);
    updateJob(jobId, { status: 'completed', stage: `已生成新版本：${revisedVersion.label}，AI 已重新评估推荐版本`, progress: 100, activeVersionId: latestJob?.recommendedVersionId || revisedVersion.versionId }, 'revision completed');
  } catch (error) {
    failJob(jobId, error);
    throw error;
  }
}

export async function processExportSquare(jobId: string, payload: { versionId: string }) {
  try {
    updateJob(jobId, { status: 'rendering_hd', stage: `Worker 正在导出方形版：${payload.versionId}`, progress: 90 }, 'square export');
    await renderHdForVersion(jobId, payload.versionId, '1:1');
    updateJob(jobId, { status: 'completed', stage: '方形版已导出', progress: 100 }, 'square ready');
  } catch (error) {
    failJob(jobId, error);
    throw error;
  }
}
