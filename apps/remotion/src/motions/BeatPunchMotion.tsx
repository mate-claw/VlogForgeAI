import React from 'react';
import { useCurrentFrame } from 'remotion';
export const BeatPunchMotion:React.FC<{intensity:number;children:React.ReactNode}> = ({intensity,children})=>{const f=useCurrentFrame(); const hit=(f%18)<4 ? 1 : 0; const s=1+hit*.045*intensity; const rot=hit ? Math.sin(f)*0.25*intensity : 0; return <div style={{width:'100%',height:'100%',transform:`scale(${s}) rotate(${rot}deg)`,filter:`contrast(${1+hit*.08})`}}>{children}</div>};
