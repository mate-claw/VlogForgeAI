import React from 'react';
import { useCurrentFrame } from 'remotion';
import { captionShell, renderHighlight, useTextEntrance, type CaptionProps } from './common';
export const CuteShortCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => { const f=useCurrentFrame(); const enter=useTextEntrance('pop'); const rot=Math.sin(f/12)*1.2; return <div style={captionShell(typography, visualStyle, { ...enter, transform: `${enter.transform} rotate(${rot}deg)`, display:'inline-block', left:90,right:90,padding:'22px 30px',borderRadius:42,background:'rgba(255,255,255,.72)',color:'#33223a',boxShadow:'0 24px 80px rgba(255,88,166,.28)',border:`3px solid ${typography.accentColor}` })}>✨ {renderHighlight(scene.caption,scene.highlightWords,typography.accentColor)} ♡</div>; };
