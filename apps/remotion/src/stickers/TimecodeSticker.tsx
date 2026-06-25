import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
export const TimecodeSticker=()=> { const f=useCurrentFrame(); const {fps}=useVideoConfig(); const s=Math.floor(f/fps); return <div style={{position:'absolute',top:84,right:72,color:'#fff',fontFamily:'monospace',fontSize:24,textShadow:'0 4px 12px #000'}}>00:{String(s).padStart(2,'0')}</div>; };
