import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { VisualStyle } from '@ai-vlog/shared';
export const FadeTransition: React.FC<{ durationFrames: number; visualStyle?: VisualStyle }> = ({ durationFrames, visualStyle = 'warm' }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationFrames], [0.78, 0], { extrapolateRight: 'clamp' });
  const color = visualStyle === 'cinematic' || visualStyle === 'night' ? '#050505' : visualStyle === 'cute' ? '#fff3fa' : '#111';
  return <AbsoluteFill style={{ opacity, background: color, pointerEvents: 'none' }} />;
};
