import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
export const GentlePanMotion:React.FC<{durationFrames:number;intensity:number;children:React.ReactNode}> = ({durationFrames,intensity,children})=>{ const f=useCurrentFrame(); const x=interpolate(f,[0,durationFrames],[-26*intensity,26*intensity],{extrapolateRight:'clamp'}); const s=1+0.045*intensity; return <div style={{width:'100%',height:'100%',transform:`scale(${s}) translateX(${x}px)`}}>{children}</div>; };
