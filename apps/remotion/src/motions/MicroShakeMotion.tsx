import React from 'react';
import { useCurrentFrame } from 'remotion';
export const MicroShakeMotion:React.FC<{intensity:number;children:React.ReactNode}> = ({intensity,children})=>{const f=useCurrentFrame(); const x=Math.sin(f*1.7)*3*intensity; const y=Math.cos(f*1.3)*2.5*intensity; return <div style={{width:'100%',height:'100%',transform:`scale(1.03) translate(${x}px,${y}px)`}}>{children}</div>};
