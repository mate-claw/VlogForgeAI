import React from 'react';
import { useCurrentFrame } from 'remotion';
import { captionShell, useTextEntrance, type CaptionProps } from './common';
export const KaraokeCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => { const f=useCurrentFrame(); const enter=useTextEntrance('fade_up'); const chars=[...scene.caption]; const active=Math.min(chars.length,Math.floor(f/4)); return <div style={captionShell(typography, visualStyle, { ...enter, padding:'18px 26px' })}>{chars.map((c,i)=><span key={i} style={{color:i<=active?typography.accentColor:typography.textColor,opacity:i<=active?1:.72,textShadow:i<=active?`0 0 20px ${typography.accentColor}`:'inherit'}}>{c}</span>)}</div>; };
