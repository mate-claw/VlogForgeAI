import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
export const LightLeakTransition: React.FC<{ durationFrames: number; accentColor: string }> = ({ durationFrames, accentColor }) => {
  const frame=useCurrentFrame();
  const opacity=interpolate(frame,[0,durationFrames*.5,durationFrames],[.65,.42,0],{extrapolateRight:'clamp'});
  const x=interpolate(frame,[0,durationFrames],[-260,520],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{opacity,mixBlendMode:'screen',pointerEvents:'none'}}><div style={{position:'absolute',left:x,top:-140,width:560,height:2200,background:`linear-gradient(90deg, transparent, ${accentColor}, rgba(255,245,190,.8), transparent)`,filter:'blur(32px)',transform:'rotate(18deg)'}}/></AbsoluteFill>;
};
