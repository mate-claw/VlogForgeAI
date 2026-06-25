import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
export const CuteBounceMotion:React.FC<{intensity:number;children:React.ReactNode}> = ({intensity,children})=>{const f=useCurrentFrame(); const {fps}=useVideoConfig(); const b=spring({frame:f,fps,config:{damping:8,mass:.6,stiffness:120}}); const y=Math.sin(f/10)*6*intensity; const s=1+(b*.035*intensity); return <div style={{width:'100%',height:'100%',transform:`translateY(${y}px) scale(${s})`}}>{children}</div>};
