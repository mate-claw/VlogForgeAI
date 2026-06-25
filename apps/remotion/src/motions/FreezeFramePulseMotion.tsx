import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
export const FreezeFramePulseMotion:React.FC<{durationFrames:number;intensity:number;children:React.ReactNode}> = ({durationFrames,intensity,children})=>{const f=useCurrentFrame(); const s=interpolate(f,[0,8,16,durationFrames],[1,1.08+intensity*.05,1.03,1.05],{extrapolateRight:'clamp'}); return <div style={{width:'100%',height:'100%',transform:`scale(${s})`,filter:`brightness(${1+Math.max(0,16-f)/16*.18})`}}>{children}</div>};
