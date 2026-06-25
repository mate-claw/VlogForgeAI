import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export const WhiteFlashTransition: React.FC<{ durationFrames: number; soft?: boolean; accent?: string }> = ({ durationFrames, soft=false, accent='#fff' }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationFrames * .35, durationFrames], [soft ? .38 : .85, soft ? .28 : .65, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ opacity, background:`radial-gradient(circle at 55% 44%, #fff, ${accent} 42%, transparent 72%)`, mixBlendMode:'screen', pointerEvents:'none' }} />;
};
