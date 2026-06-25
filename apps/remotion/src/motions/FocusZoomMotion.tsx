import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
export const FocusZoomMotion:React.FC<{durationFrames:number;intensity:number;children:React.ReactNode}> = ({durationFrames,intensity,children})=>{const f=useCurrentFrame(); const s=interpolate(f,[0,durationFrames*.28,durationFrames],[1,1+0.09*intensity,1+0.05*intensity],{extrapolateRight:'clamp'}); return <div style={{width:'100%',height:'100%',transform:`scale(${s})`,filter:`contrast(${1+0.06*intensity}) saturate(${1+0.08*intensity})`}}>{children}</div>};
