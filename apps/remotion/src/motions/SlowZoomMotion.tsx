import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
export const SlowZoomMotion: React.FC<{durationFrames:number;intensity:number;children:React.ReactNode}> = ({durationFrames,intensity,children}) => { const f=useCurrentFrame(); const s=interpolate(f,[0,durationFrames],[1,1+0.08*intensity],{extrapolateRight:'clamp'}); return <div style={{width:'100%',height:'100%',transform:`scale(${s})`,transformOrigin:'50% 48%'}}>{children}</div>; };
