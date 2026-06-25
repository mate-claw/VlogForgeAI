import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { DirectorScene, VisualStabilityMode } from '@ai-vlog/shared';
import { SlowZoomMotion } from './SlowZoomMotion';
import { GentlePanMotion } from './GentlePanMotion';
import { FocusZoomMotion } from './FocusZoomMotion';
import { CuteBounceMotion } from './CuteBounceMotion';
import { BeatPunchMotion } from './BeatPunchMotion';
import { CinematicPushMotion } from './CinematicPushMotion';
import { HandheldMotion } from './HandheldMotion';
import { PhotoKenBurnsMotion } from './PhotoKenBurnsMotion';
import { FreezeFramePulseMotion } from './FreezeFramePulseMotion';
import { ParallaxPhotoMotion } from './ParallaxPhotoMotion';
import { MicroShakeMotion } from './MicroShakeMotion';
import { CalmBreathingMotion } from './CalmBreathingMotion';
import { sanitizeMotionForRender } from '../utils/stability';

export const MotionEngine: React.FC<{ scene: DirectorScene; durationFrames: number; visualStabilityMode?: VisualStabilityMode; children: React.ReactNode }> = ({ scene, durationFrames, visualStabilityMode = 'stable', children }) => {
  const localFrame = useCurrentFrame();
  const { motion, intensity } = sanitizeMotionForRender({
    motion: scene.motion,
    intensity: scene.motionIntensity ?? 0.22,
    mode: visualStabilityMode,
    isVideo: scene.type === 'video',
    localFrame,
    durationFrames,
  });
  switch (motion) {
    case 'slow_zoom': return <SlowZoomMotion durationFrames={durationFrames} intensity={intensity}>{children}</SlowZoomMotion>;
    case 'gentle_pan': return <GentlePanMotion durationFrames={durationFrames} intensity={intensity}>{children}</GentlePanMotion>;
    case 'focus_zoom': return <FocusZoomMotion durationFrames={durationFrames} intensity={intensity}>{children}</FocusZoomMotion>;
    case 'cute_bounce': return <CuteBounceMotion intensity={intensity}>{children}</CuteBounceMotion>;
    case 'beat_punch': return <BeatPunchMotion intensity={intensity}>{children}</BeatPunchMotion>;
    case 'cinematic_push': return <CinematicPushMotion durationFrames={durationFrames} intensity={intensity}>{children}</CinematicPushMotion>;
    case 'handheld_rec': return <HandheldMotion intensity={intensity}>{children}</HandheldMotion>;
    case 'photo_ken_burns': return <PhotoKenBurnsMotion durationFrames={durationFrames} intensity={intensity}>{children}</PhotoKenBurnsMotion>;
    case 'freeze_pulse': return <FreezeFramePulseMotion durationFrames={durationFrames} intensity={intensity}>{children}</FreezeFramePulseMotion>;
    case 'parallax_photo': return <ParallaxPhotoMotion durationFrames={durationFrames} intensity={intensity}>{children}</ParallaxPhotoMotion>;
    case 'micro_shake': return <MicroShakeMotion intensity={intensity}>{children}</MicroShakeMotion>;
    case 'calm_breathing': return <CalmBreathingMotion intensity={intensity}>{children}</CalmBreathingMotion>;
    case 'still':
    default: return <>{children}</>;
  }
};
