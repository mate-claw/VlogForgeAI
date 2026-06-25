import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export const WipeTransition: React.FC<{ durationFrames: number; accentColor: string }> = ({ durationFrames, accentColor }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [0, durationFrames], [1080, 0], { extrapolateRight: 'clamp' });
  const glow = interpolate(frame, [0, durationFrames], [0.55, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ pointerEvents:'none' }}><div style={{ position:'absolute', right:0, top:0, bottom:0, width:w, background:'rgba(255,255,255,.08)', backdropFilter:'blur(12px)' }}/><div style={{ position:'absolute', right:w-8, top:0, bottom:0, width:22, background:accentColor, opacity:glow, filter:'blur(8px)' }}/></AbsoluteFill>;
};
