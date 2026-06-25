import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export const BlurCrossfadeTransition: React.FC<{ durationFrames: number; accent?: string }> = ({ durationFrames, accent='#fff' }) => {
  const f=useCurrentFrame();
  const opacity=interpolate(f,[0,durationFrames],[.46,0],{extrapolateRight:'clamp'});
  const blur=interpolate(f,[0,durationFrames],[22,0],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{opacity,backdropFilter:`blur(${blur}px)`,background:`radial-gradient(circle at 50% 50%, ${accent}33, transparent 60%)`,pointerEvents:'none'}}/>;
};
