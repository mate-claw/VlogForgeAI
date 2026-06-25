import type { DirectorScene, SceneMotion, SceneTransition, VisualStabilityMode, VlogPlan } from '@ai-vlog/shared';

const unstableMotions: SceneMotion[] = ['micro_shake', 'handheld_rec', 'beat_punch', 'freeze_pulse'];
const transitionSensitiveMotions: SceneMotion[] = [...unstableMotions, 'cute_bounce'];

export function getStabilityMode(plan?: Pick<VlogPlan, 'visualStabilityMode' | 'visualStyle' | 'pace'>): VisualStabilityMode {
  if (plan?.visualStabilityMode) return plan.visualStabilityMode;
  if (plan?.visualStyle === 'beat' || plan?.pace === 'fast' || plan?.pace === 'medium_fast') return 'balanced';
  return 'stable';
}

export function sanitizeMotionForRender(params: {
  motion?: SceneMotion;
  intensity?: number;
  mode?: VisualStabilityMode;
  isVideo?: boolean;
  localFrame?: number;
  durationFrames?: number;
}): { motion: SceneMotion; intensity: number } {
  const mode = params.mode || 'stable';
  const localFrame = params.localFrame ?? 999;
  const durationFrames = Math.max(1, params.durationFrames ?? 999);
  const guard = mode === 'dynamic' ? 10 : 18;
  const nearTransition = localFrame < guard || localFrame > durationFrames - guard;
  let motion: SceneMotion = params.motion || 'calm_breathing';
  let intensity = Math.max(0, Math.min(1, params.intensity ?? 0.22));

  if (mode === 'stable') {
    if (params.isVideo) {
      motion = 'still';
      intensity = 0;
    } else if (unstableMotions.includes(motion)) {
      motion = 'calm_breathing';
      intensity = Math.min(intensity, 0.16);
    } else {
      intensity = Math.min(intensity, 0.2);
    }
  } else if (mode === 'balanced') {
    if (unstableMotions.includes(motion)) {
      motion = params.isVideo ? 'still' : 'calm_breathing';
      intensity = Math.min(intensity, 0.2);
    } else {
      intensity = Math.min(intensity, 0.28);
    }
  } else {
    intensity = Math.min(intensity, 0.48);
  }

  if (nearTransition) {
    intensity = Math.min(intensity, mode === 'dynamic' ? 0.18 : 0.06);
    if (transitionSensitiveMotions.includes(motion)) motion = params.isVideo ? 'still' : 'calm_breathing';
  }

  return { motion, intensity };
}

export function sanitizeTransitionForRender(type: SceneTransition, durationFrames: number | undefined, mode: VisualStabilityMode): { type: SceneTransition; durationFrames: number } {
  let safeType = type || 'crossfade';
  let duration = durationFrames ?? 10;
  const clamp = (min: number, max: number) => Math.max(min, Math.min(max, duration));

  if (mode === 'stable') {
    const fallback: Partial<Record<SceneTransition, SceneTransition>> = {
      white_flash: 'soft_flash',
      camera_shutter: 'fade',
      film_burn: 'light_leak',
      zoom_in: 'crossfade',
      hard_cut: 'crossfade',
      wipe: 'crossfade',
      swipe_card: 'slide_left',
    };
    safeType = fallback[safeType] || safeType;
    duration = clamp(8, 12);
  } else if (mode === 'balanced') {
    if (safeType === 'camera_shutter') safeType = 'fade';
    if (safeType === 'film_burn') safeType = 'light_leak';
    duration = clamp(8, 14);
  } else {
    duration = clamp(6, 16);
  }

  return { type: safeType, durationFrames: duration };
}

export function shouldUseVideoBackground(scene: DirectorScene, mode: VisualStabilityMode): boolean {
  // Decoding the same video twice (foreground + blurred background) can create preview stutter on local machines.
  // Use blurred video background only for images or explicitly dynamic non-stable scenes.
  if (scene.type === 'image') return true;
  return mode === 'dynamic' && scene.layout !== 'vertical_crop';
}
