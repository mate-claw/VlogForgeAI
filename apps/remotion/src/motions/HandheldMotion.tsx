import React from 'react';
import { useCurrentFrame } from 'remotion';
export const HandheldMotion:React.FC<{intensity:number;children:React.ReactNode}> = ({intensity,children})=>{const f=useCurrentFrame(); const x=Math.sin(f/3.7)*3.5*intensity+Math.cos(f/11)*2*intensity; const y=Math.cos(f/5.1)*3*intensity; const r=Math.sin(f/17)*.35*intensity; return <div style={{width:'100%',height:'100%',transform:`scale(1.025) translate(${x}px,${y}px) rotate(${r}deg)`}}>{children}</div>};
