import React from 'react';
import { useCurrentFrame } from 'remotion';
export const FilmGrainLayer = () => { const f=useCurrentFrame(); const pos = `${f%7}px ${(f*3)%11}px`; return <div style={{ position:'absolute', inset:0, opacity:.15, backgroundImage:'radial-gradient(rgba(255,255,255,.38) 1px, transparent 1px), radial-gradient(rgba(0,0,0,.28) 1px, transparent 1px)', backgroundPosition:pos, backgroundSize:'6px 6px, 9px 9px', mixBlendMode:'overlay', pointerEvents:'none' }} />; };
