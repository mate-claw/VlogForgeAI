import React from 'react';
import { Audio, interpolate, useCurrentFrame } from 'remotion';
export const AudioFadeInOut: React.FC<{ src: string; totalFrames: number; volume?: number }> = ({ src, totalFrames, volume = .35 }) => { const f=useCurrentFrame(); const v=Math.min(interpolate(f,[0,30],[0,volume],{extrapolateRight:'clamp'}),interpolate(f,[Math.max(0,totalFrames-60),totalFrames],[volume,0],{extrapolateLeft:'clamp'})); return <Audio src={src} volume={v}/>; };
