import type { DirectorScene, VlogPlan, VlogRenderInput } from '@ai-vlog/shared';

export const DEFAULT_FPS = 60;
export function resolveFps(fps?: number) {
  const value = Number(fps || DEFAULT_FPS);
  return Number.isFinite(value) && value >= 1 ? Math.round(value) : DEFAULT_FPS;
}
export function secondsToFrames(seconds: number, fps = DEFAULT_FPS) { return Math.max(1, Math.round(seconds * resolveFps(fps))); }

function sceneTransitionFrames(scene?: Pick<DirectorScene, 'transitionDuration'>) {
  const raw = Number(scene?.transitionDuration || 10);
  return Math.max(6, Math.min(14, Math.round(raw)));
}

export function openingOverlapFrames(plan: VlogPlan, fps = DEFAULT_FPS) {
  if (!plan.scenes?.length) return 0;
  const scale = resolveFps(fps) / DEFAULT_FPS;
  return Math.max(1, Math.round(Math.min(10, sceneTransitionFrames(plan.scenes[0])) * scale));
}

export type SceneTiming = {
  from: number;
  durationFrames: number;
  fadeInFrames: number;
  fadeOutFrames: number;
};

export function sceneTimings(plan: VlogPlan, fps = DEFAULT_FPS): SceneTiming[] {
  const frameRate = resolveFps(fps);
  const openingFrames = secondsToFrames(plan.opening?.duration || 0, frameRate);
  const firstOverlap = openingOverlapFrames(plan, frameRate);
  let from = Math.max(0, openingFrames - firstOverlap);
  const durations = plan.scenes.map((s) => secondsToFrames(s.duration || 3, frameRate));
  const transitionScale = frameRate / DEFAULT_FPS;
  const overlaps = plan.scenes.map((s, index) => index === 0 ? firstOverlap : Math.max(1, Math.round(sceneTransitionFrames(s) * transitionScale))); 

  return plan.scenes.map((scene, index) => {
    const fadeInFrames = index === 0 ? firstOverlap : overlaps[index];
    if (index > 0) from -= fadeInFrames;
    const durationFrames = durations[index];
    const nextOverlap = index < plan.scenes.length - 1 ? overlaps[index + 1] : Math.max(1, Math.round(Math.min(10, sceneTransitionFrames(scene)) * (frameRate / DEFAULT_FPS))); 
    const item = { from, durationFrames, fadeInFrames, fadeOutFrames: nextOverlap };
    from += durationFrames;
    return item;
  });
}

export function endingStartFrame(plan: VlogPlan, fps = DEFAULT_FPS) {
  const frameRate = resolveFps(fps);
  const timings = sceneTimings(plan, frameRate);
  const last = timings[timings.length - 1];
  if (!last) return secondsToFrames(plan.opening?.duration || 0, frameRate);
  const overlap = Math.min(Math.round(10 * (frameRate / DEFAULT_FPS)), last.fadeOutFrames || Math.round(10 * (frameRate / DEFAULT_FPS))); 
  return Math.max(0, last.from + last.durationFrames - overlap);
}

export function totalDurationFrames(plan: VlogPlan, fps = DEFAULT_FPS) {
  const frameRate = resolveFps(fps);
  const endingFrames = secondsToFrames(plan.ending?.duration || 0, frameRate);
  const endingFrom = endingStartFrame(plan, frameRate);
  return Math.max(secondsToFrames(15, frameRate), endingFrom + endingFrames);
}
export function totalDurationFramesForInput(input: VlogRenderInput) {
  const frameRate = resolveFps(input.renderFps);
  const full = totalDurationFrames(input.plan, frameRate);
  if (input.renderMode === 'preview' && input.maxDurationSeconds) {
    return Math.min(full, secondsToFrames(input.maxDurationSeconds, frameRate));
  }
  return full;
}
export function dimensionsForAspect(aspect?: '9:16' | '1:1' | '16:9') {
  if (aspect === '1:1') return { width: 1080, height: 1080 };
  if (aspect === '16:9') return { width: 1920, height: 1080 };
  return { width: 1080, height: 1920 };
}
export function sceneStarts(plan: VlogPlan, fps = DEFAULT_FPS) {
  return sceneTimings(plan, fps).map(({ from, durationFrames }) => ({ from, durationFrames }));
}
