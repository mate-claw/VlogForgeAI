import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export const FilmBurnTransition: React.FC<{ durationFrames: number; accent?: string }> = ({ durationFrames, accent='#ffb067' }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationFrames*.4, durationFrames], [.74,.54,0], { extrapolateRight: 'clamp' });
  const x = interpolate(frame, [0,durationFrames], [-180, 820], { extrapolateRight:'clamp' });
  return <AbsoluteFill style={{ opacity, mixBlendMode: 'screen', pointerEvents: 'none' }}><div style={{position:'absolute',left:x,top:-200,width:520,height:2300,background:`linear-gradient(90deg,#ff4300,${accent},rgba(255,245,190,.8),transparent)`,filter:'blur(18px)',transform:'rotate(-12deg)'}}/><div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 30% 50%, rgba(255,255,255,.45), transparent 44%)'}}/></AbsoluteFill>;
};
