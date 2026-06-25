import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export const CameraShutterTransition: React.FC<{ durationFrames: number }> = ({ durationFrames }) => {
  const f = useCurrentFrame();
  const h = interpolate(f, [0, durationFrames*.45, durationFrames], [0, 960, 0], { extrapolateRight:'clamp' });
  const opacity = interpolate(f,[0,durationFrames*.5,durationFrames],[0,.75,0],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{pointerEvents:'none'}}><div style={{position:'absolute',left:0,right:0,top:0,height:h,background:'#000',opacity}}/><div style={{position:'absolute',left:0,right:0,bottom:0,height:h,background:'#000',opacity}}/><div style={{position:'absolute',inset:0,border:'4px solid rgba(255,255,255,.35)',opacity}}/></AbsoluteFill>;
};
