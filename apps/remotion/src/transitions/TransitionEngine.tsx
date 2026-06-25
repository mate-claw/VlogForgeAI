import React from 'react';
import { useVideoConfig } from 'remotion';
import type { SceneTransition, TypographyDecision, VisualStabilityMode, VisualStyle } from '@ai-vlog/shared';
import { FadeTransition } from './FadeTransition';
import { SlideTransition } from './SlideTransition';
import { WipeTransition } from './WipeTransition';
import { WhiteFlashTransition } from './WhiteFlashTransition';
import { BlurCrossfadeTransition } from './BlurCrossfadeTransition';
import { LightLeakTransition } from './LightLeakTransition';
import { FilmBurnTransition } from './FilmBurnTransition';
import { CameraShutterTransition } from './CameraShutterTransition';
import { ZoomTransition } from './ZoomTransition';
import { HardCutTransition } from './HardCutTransition';
import { SwipeCardTransition } from './SwipeCardTransition';
import { sanitizeTransitionForRender } from '../utils/stability';

export const TransitionEngine: React.FC<{ type: SceneTransition; durationFrames: number; visualStyle: VisualStyle; typography: TypographyDecision; visualStabilityMode?: VisualStabilityMode }> = ({ type, durationFrames, visualStyle, typography, visualStabilityMode = 'stable' }) => {
  const { fps } = useVideoConfig();
  const scaledDuration = Math.max(1, Math.round(durationFrames * (fps / 30)));
  const safe = sanitizeTransitionForRender(type, scaledDuration, visualStabilityMode);
  // Actual cross-scene dissolve is handled by SceneTimeline overlap fades.
  // In stable mode, don't add extra overlay for fade/crossfade because that can look like a jitter or flash.
  if (visualStabilityMode === 'stable' && (safe.type === 'fade' || safe.type === 'crossfade')) return null;
  switch (safe.type) {
    case 'fade':
    case 'crossfade': return <FadeTransition durationFrames={safe.durationFrames} visualStyle={visualStyle} />;
    case 'slide_left':
    case 'slide_right': return <SlideTransition direction={safe.type === 'slide_left' ? 'left' : 'right'} durationFrames={safe.durationFrames} accent={typography.accentColor} />;
    case 'wipe': return <WipeTransition durationFrames={safe.durationFrames} accentColor={typography.accentColor} />;
    case 'white_flash':
    case 'soft_flash': return <WhiteFlashTransition durationFrames={safe.durationFrames} soft={safe.type === 'soft_flash'} accent={typography.accentColor} />;
    case 'blur_crossfade': return <BlurCrossfadeTransition durationFrames={safe.durationFrames} accent={typography.accentColor} />;
    case 'light_leak': return <LightLeakTransition durationFrames={safe.durationFrames} accentColor={typography.accentColor} />;
    case 'film_burn': return <FilmBurnTransition durationFrames={safe.durationFrames} accent={typography.accentColor} />;
    case 'camera_shutter': return <CameraShutterTransition durationFrames={safe.durationFrames} />;
    case 'zoom_in': return <ZoomTransition durationFrames={safe.durationFrames} accent={typography.accentColor} />;
    case 'swipe_card': return <SwipeCardTransition durationFrames={safe.durationFrames} accent={typography.accentColor} />;
    case 'hard_cut':
    default: return <HardCutTransition visualStyle={visualStyle} />;
  }
};
