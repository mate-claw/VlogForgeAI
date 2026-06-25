import React from 'react';
import { useCurrentFrame } from 'remotion';
export const CalmBreathingMotion:React.FC<{intensity:number;children:React.ReactNode}> = ({intensity,children})=>{const f=useCurrentFrame(); const s=1+Math.sin(f/38)*0.01*intensity; return <div style={{width:'100%',height:'100%',transform:`scale(${s})`,filter:'saturate(.98)'}}>{children}</div>};
