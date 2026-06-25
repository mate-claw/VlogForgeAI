import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
export const ParallaxPhotoMotion:React.FC<{durationFrames:number;intensity:number;children:React.ReactNode}> = ({durationFrames,intensity,children})=>{const f=useCurrentFrame(); const x=interpolate(f,[0,durationFrames],[-24*intensity,24*intensity],{extrapolateRight:'clamp'}); const s=1.08+intensity*.04; return <div style={{width:'100%',height:'100%',transform:`perspective(1100px) rotateY(${x/18}deg) scale(${s})`,transformOrigin:'50% 50%'}}>{children}</div>};
