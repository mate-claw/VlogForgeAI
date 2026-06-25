import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
export const CinematicPushMotion:React.FC<{durationFrames:number;intensity:number;children:React.ReactNode}> = ({durationFrames,intensity,children})=>{const f=useCurrentFrame(); const s=interpolate(f,[0,durationFrames],[1,1+0.08*intensity],{extrapolateRight:'clamp'}); const y=interpolate(f,[0,durationFrames],[4*intensity,-5*intensity],{extrapolateRight:'clamp'}); return <div style={{width:'100%',height:'100%',transform:`scale(${s}) translateY(${y}px)`,filter:'contrast(1.03) saturate(.94)'}}>{children}</div>};
