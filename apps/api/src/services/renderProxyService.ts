import fs from 'node:fs';
import path from 'node:path';
import type { UploadedAsset, VlogRenderInput } from '@ai-vlog/shared';
import { config, publicUrlFor } from '../config';
import { normalizeVideoForRender, probeVideoMetadata } from '../utils/mediaUtils';
import { sanitizeVisualStyleForRender } from './renderVisualSanitizer';

export type RenderProxyReport = {
  targetFps: number;
  enabled: boolean;
  policy: {
    minRenderFps: number;
    alwaysNormalizeVideoProxies: boolean;
    interpolation: string;
    strategy: string;
    usedAssetOnly: boolean;
    mciEnabled: boolean;
    proxyTimeoutMs: number;
  };
  usedAssetIds: string[];
  rewrittenScenes: Array<{ assetId: string; originalSrc: string; proxySrc: string; reason: string; sourceFps?: number; interpolation?: string }>;
  skipped: Array<{ assetId: string; reason: string; sourceFps?: number }>;
  renderAdjustments: Array<{ assetId: string; reason: string; playbackRate?: number; duration?: number }>;
  warnings: string[];
};

function readAssets(jobDir: string): UploadedAsset[] {
  const assetsPath = path.resolve(jobDir, 'assets.json');
  if (!fs.existsSync(assetsPath)) return [];
  return JSON.parse(fs.readFileSync(assetsPath, 'utf-8')) as UploadedAsset[];
}

function assetLocalPath(jobDir: string, asset: UploadedAsset): string | undefined {
  const candidates = [
    asset.absolutePath,
    path.resolve(jobDir, 'media', asset.filename),
    path.resolve(jobDir, 'uploads', asset.filename),
  ].filter(Boolean) as string[];
  return candidates.find((file) => fs.existsSync(file));
}

function proxyFileName(asset: UploadedAsset, targetFps: number, interpolation: string) {
  const base = path.basename(asset.filename, path.extname(asset.filename)).replace(/[^a-z0-9_-]+/gi, '-');
  return `${asset.id}-${base}-cfr-${targetFps}-${interpolation}.mp4`;
}

function getUsedAssetIds(input: VlogRenderInput): Set<string> {
  const ids = new Set<string>();
  for (const scene of input.plan.scenes || []) {
    if (scene?.type === 'video' && scene.assetId) ids.add(scene.assetId);
  }
  return ids;
}

function isHighMotionScene(input: VlogRenderInput, assetId: string) {
  return (input.plan.scenes || []).some((scene: any) => {
    if (scene.assetId !== assetId || scene.type !== 'video') return false;
    const text = [scene.caption, scene.role, scene.sceneType, input.plan.revisionLabel, input.plan.revisionInstruction, input.plan.storyArc]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return /asmr|切菜|刀|砧板|咔嚓|切|slice|knife|chop|快速|晃|运动|跑|走/.test(text);
  });
}

function shouldCreateProxy(params: {
  meta: Awaited<ReturnType<typeof probeVideoMetadata>>;
  targetFps: number;
  alwaysNormalize: boolean;
  highMotion: boolean;
  highMotionProxy: boolean;
}): { ok: boolean; reason: string } {
  const { meta, targetFps, alwaysNormalize, highMotion, highMotionProxy } = params;
  if (!meta) return { ok: false, reason: 'metadata unavailable' };
  const fps = meta.avgFps || meta.rFps;
  if (!fps || !Number.isFinite(fps)) return { ok: true, reason: 'unknown fps, normalize defensively' };
  if (alwaysNormalize) return { ok: true, reason: `all used video sources are normalized to ${targetFps}fps CFR` };
  const mismatch = Math.abs(fps - targetFps);
  if (mismatch > 0.35) return { ok: true, reason: `source fps ${fps.toFixed(3)} differs from render fps ${targetFps}` };
  if (meta.isLikelyVfr) return { ok: true, reason: 'source looks variable-frame-rate or has non-uniform timestamps' };
  if (highMotion && highMotionProxy) return { ok: true, reason: 'high-motion selected scene normalized with proxy' };
  return { ok: false, reason: `source fps ${fps.toFixed(3)} already close to render fps ${targetFps}` };
}

function chooseInterpolation(params: { base: string; fps?: number; highMotion: boolean }) {
  const enableMci = (process.env.VIDEO_PROXY_ENABLE_MCI || 'false').toLowerCase() === 'true';
  if (!enableMci) return params.base === 'mci' ? 'fps' : params.base;
  const maxMciFps = Number(process.env.VIDEO_PROXY_MCI_MAX_SOURCE_FPS || 24.5);
  // 只在低帧率/VFR 需要补帧时使用 mci；30fps 高运动素材默认不做 mci，避免卡在预览前。
  if (params.fps && params.fps <= maxMciFps) return 'mci';
  return params.base === 'mci' ? 'fps' : params.base;
}

function writeProgressFile(jobDir: string, report: RenderProxyReport) {
  fs.writeFileSync(path.resolve(jobDir, 'fps-normalization-report.json'), JSON.stringify(report, null, 2), 'utf-8');
}

export async function prepareStableRenderInput(params: {
  jobId: string;
  jobDir: string;
  input: VlogRenderInput;
}): Promise<{ input: VlogRenderInput; report: RenderProxyReport }> {
  const enabled = (process.env.NORMALIZE_VIDEO_PROXIES || 'true').toLowerCase() !== 'false';
  const requestedFps = Number(process.env.RENDER_FPS || config.fps || 30);
  const minRenderFps = Number(process.env.MIN_RENDER_FPS || 30);
  const targetFps = Math.max(minRenderFps, requestedFps);
  const alwaysNormalizeVideoProxies = (process.env.ALWAYS_NORMALIZE_VIDEO_PROXIES || 'false').toLowerCase() === 'true';
  const interpolation = (process.env.VIDEO_PROXY_INTERPOLATION || 'fps').toLowerCase();
  const strategy = process.env.VIDEO_PROXY_STRATEGY || 'adaptive-fast-preview';
  const highMotionProxy = (process.env.HIGH_MOTION_PROXY || 'false').toLowerCase() === 'true';
  const proxyTimeoutMs = Number(process.env.VIDEO_PROXY_TIMEOUT_MS || 120000);
  const report: RenderProxyReport = {
    targetFps,
    enabled,
    policy: {
      minRenderFps,
      alwaysNormalizeVideoProxies,
      interpolation,
      strategy,
      usedAssetOnly: true,
      mciEnabled: (process.env.VIDEO_PROXY_ENABLE_MCI || 'false').toLowerCase() === 'true',
      proxyTimeoutMs,
    },
    usedAssetIds: [],
    rewrittenScenes: [],
    skipped: [],
    renderAdjustments: [],
    warnings: [],
  };

  const visuallySanitized = sanitizeVisualStyleForRender(params.input.plan);
  if (!enabled) {
    fs.writeFileSync(path.resolve(params.jobDir, 'render-visual-style-report.json'), JSON.stringify(visuallySanitized.report, null, 2), 'utf-8');
    return { input: { ...params.input, plan: visuallySanitized.plan, renderFps: targetFps }, report };
  }

  const assets = readAssets(params.jobDir);
  const usedAssetIds = getUsedAssetIds(params.input);
  report.usedAssetIds = [...usedAssetIds];
  const proxyDir = path.resolve(params.jobDir, 'proxies');
  fs.mkdirSync(proxyDir, { recursive: true });
  writeProgressFile(params.jobDir, report);

  const proxyByAssetId = new Map<string, { url: string; reason: string; fps?: number; interpolation?: string }>();

  for (const asset of assets) {
    if (asset.type !== 'video') continue;
    if (!usedAssetIds.has(asset.id)) {
      report.skipped.push({ assetId: asset.id, reason: 'asset not used by this render plan' });
      writeProgressFile(params.jobDir, report);
      continue;
    }
    const sourcePath = assetLocalPath(params.jobDir, asset);
    if (!sourcePath) {
      report.skipped.push({ assetId: asset.id, reason: 'local source file not found' });
      writeProgressFile(params.jobDir, report);
      continue;
    }
    const meta = await probeVideoMetadata(sourcePath);
    const highMotion = isHighMotionScene(params.input, asset.id);
    const decision = shouldCreateProxy({ meta, targetFps, alwaysNormalize: alwaysNormalizeVideoProxies, highMotion, highMotionProxy });
    if (!decision.ok) {
      report.skipped.push({ assetId: asset.id, reason: decision.reason, sourceFps: meta?.avgFps || meta?.rFps });
      writeProgressFile(params.jobDir, report);
      continue;
    }
    const selectedInterpolation = chooseInterpolation({ base: interpolation, fps: meta?.avgFps || meta?.rFps, highMotion });
    const fileName = proxyFileName(asset, targetFps, selectedInterpolation);
    const outputPath = path.resolve(proxyDir, fileName);
    try {
      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 1024) {
        report.warnings.push(`creating proxy for ${asset.id}: ${decision.reason}, interpolation=${selectedInterpolation}`);
        writeProgressFile(params.jobDir, report);
        await normalizeVideoForRender({ inputPath: sourcePath, outputPath, targetFps, interpolation: selectedInterpolation });
      }
      const url = publicUrlFor(`storage/jobs/${params.jobId}/proxies/${encodeURIComponent(fileName)}`);
      proxyByAssetId.set(asset.id, { url, reason: decision.reason, fps: meta?.avgFps || meta?.rFps, interpolation: selectedInterpolation });
      writeProgressFile(params.jobDir, report);
    } catch (error) {
      // 代理失败不能让极速预览无限卡住；降级回原视频，后续稳定性评估/重导再处理。
      const message = error instanceof Error ? error.message : String(error);
      report.warnings.push(`proxy failed for ${asset.id}, fallback to original: ${message.slice(0, 300)}`);
      report.skipped.push({ assetId: asset.id, reason: 'proxy failed and fell back to original', sourceFps: meta?.avgFps || meta?.rFps });
      writeProgressFile(params.jobDir, report);
    }
  }

  const needsSlowSafePlayback = (scene: any) => {
    const text = [scene.caption, scene.role, scene.sceneType, params.input.plan.revisionLabel, params.input.plan.revisionInstruction, params.input.plan.storyArc].filter(Boolean).join(' ').toLowerCase();
    return /asmr|切菜|刀|砧板|咔嚓|切|slice|knife|chop/.test(text);
  };

  const rewriteScene = (scene: any) => {
    const proxy = proxyByAssetId.get(scene.assetId);
    let next = scene;
    if (proxy && scene.type === 'video') {
      report.rewrittenScenes.push({ assetId: scene.assetId, originalSrc: scene.src, proxySrc: proxy.url, reason: proxy.reason, sourceFps: proxy.fps, interpolation: proxy.interpolation });
      next = { ...next, originalSrc: scene.src, src: proxy.url, renderProxyApplied: true };
    }
    if (next.type === 'video' && params.input.plan.visualStabilityMode !== 'dynamic' && needsSlowSafePlayback(next)) {
      const playbackRate = Number(process.env.HIGH_MOTION_PLAYBACK_RATE || 0.82);
      const durationBoost = Number(process.env.HIGH_MOTION_DURATION_BOOST || 1.15);
      const duration = Math.min(8, Math.max(Number(next.duration || 4), Number(next.duration || 4) * durationBoost));
      report.renderAdjustments.push({ assetId: next.assetId, reason: 'high-motion food/detail scene uses safe slow playback in stable mode', playbackRate, duration });
      next = { ...next, playbackRate, duration, motion: 'still', motionIntensity: 0, transitionIn: next.transitionIn === 'hard_cut' ? 'crossfade' : next.transitionIn };
    }
    return next;
  };

  const proxyRewrittenScenes = visuallySanitized.plan.scenes.map(rewriteScene);
  const proxyRewrittenPlan = {
    ...visuallySanitized.plan,
    scenes: proxyRewrittenScenes,
    clips: proxyRewrittenScenes,
  };
  const nextInput: VlogRenderInput = { ...params.input, plan: proxyRewrittenPlan, renderFps: targetFps };
  writeProgressFile(params.jobDir, report);
  fs.writeFileSync(path.resolve(params.jobDir, 'render-visual-style-report.json'), JSON.stringify(visuallySanitized.report, null, 2), 'utf-8');
  return { input: nextInput, report };
}
