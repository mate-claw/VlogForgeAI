import React from 'react';
import { Audio, interpolate, useCurrentFrame } from 'remotion';
import type { VlogPace } from '@ai-vlog/shared';
export const BgmController: React.FC<{ src: string; title?: string; pace: VlogPace; totalFrames: number }> = ({ src, pace, totalFrames }) => {
  const frame = useCurrentFrame();
  const base = pace === 'fast' || pace === 'medium_fast' ? 0.44 : pace === 'slow' ? 0.27 : 0.34;
  const fadeIn = interpolate(frame, [0, 36], [0, base], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [Math.max(0, totalFrames - 72), totalFrames], [base, 0], { extrapolateLeft: 'clamp' });
  const duck = pace === 'fast' && frame % 18 < 4 ? .92 : 1;
  const volume = Math.min(fadeIn, fadeOut) * duck;
  return <Audio src={src} volume={volume} />;
};
