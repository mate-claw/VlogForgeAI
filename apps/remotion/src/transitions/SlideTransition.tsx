import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export const SlideTransition: React.FC<{ direction: 'left' | 'right'; durationFrames: number; accent?: string }> = ({ direction, durationFrames, accent = '#fff' }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, durationFrames], [direction === 'left' ? -1080 : 1080, direction === 'left' ? 1080 : -1080], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, durationFrames * 0.5, durationFrames], [0, 0.6, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ pointerEvents: 'none' }}><div style={{ position:'absolute', top:0, bottom:0, width:280, left: x, background:`linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity, filter:'blur(22px)' }}/></AbsoluteFill>;
};
