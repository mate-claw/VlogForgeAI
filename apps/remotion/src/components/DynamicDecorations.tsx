import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { VisualStyle } from '@ai-vlog/shared';

export const DynamicDecorations: React.FC<{ visualStyle: VisualStyle; totalFrames: number; bgmTitle?: string; directorComment?: string }> = ({ visualStyle, totalFrames, bgmTitle }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const progress = Math.min(1, frame / Math.max(1, totalFrames));

  if (visualStyle === 'rec') {
    return (
      <>
        <div style={{ position: 'absolute', top: 70, left: 56, color: '#fff', fontSize: 34, fontWeight: 900, letterSpacing: 2, textShadow: '0 3px 12px #000' }}>
          <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 999, background: '#ff3b30', marginRight: 14 }} /> REC
        </div>
        <div style={{ position: 'absolute', top: 76, right: 56, color: 'rgba(255,255,255,.86)', fontSize: 23, letterSpacing: 2 }}>AI LIFE LOG</div>
        <div style={{ position: 'absolute', left: 54, right: 54, bottom: 72, height: 8, borderRadius: 999, background: 'rgba(255,255,255,.22)' }}>
          <div style={{ width: `${progress * 100}%`, height: '100%', borderRadius: 999, background: 'rgba(255,255,255,.95)' }} />
        </div>
      </>
    );
  }

  if (visualStyle === 'cute') {
    return (
      <>
        <div style={{ position: 'absolute', top: 78, right: 62, fontSize: 54, color: '#ff6fae' }}>♡</div>
        <div style={{ position: 'absolute', top: 138, left: 70, fontSize: 42, color: '#ffbd59' }}>✦</div>
        <div style={{ position: 'absolute', bottom: 92, right: 70, fontSize: 46, color: '#7ecbff' }}>✧</div>
      </>
    );
  }

  if (visualStyle === 'cinematic') {
    return (
      <>
        <div style={{ position: 'absolute', top: 0, left: 0, width, height: 132, background: 'rgba(0,0,0,.88)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width, height: 132, background: 'rgba(0,0,0,.88)' }} />
        <div style={{ position: 'absolute', top: 52, left: 66, color: 'rgba(255,255,255,.72)', letterSpacing: 5, fontSize: 22 }}>AI CINEMATIC DAILY</div>
      </>
    );
  }

  if (visualStyle === 'beat') {
    return (
      <>
        <div style={{ position: 'absolute', top: 72, left: 60, color: '#fff', fontSize: 28, fontWeight: 950, letterSpacing: 3 }}>TODAY HIGHLIGHT</div>
        <div style={{ position: 'absolute', left: 52, right: 52, bottom: 72, height: 12, background: 'rgba(255,255,255,.18)' }}>
          <div style={{ width: `${progress * 100}%`, height: '100%', background: '#fff' }} />
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ position: 'absolute', top: 76, left: 64, color: 'rgba(255,255,255,.86)', fontSize: 26, letterSpacing: 3 }}>GOOD DAY</div>
      <div style={{ position: 'absolute', top: 118, left: 64, width: 120, height: 2, background: 'rgba(255,255,255,.65)' }} />
      {bgmTitle ? <div style={{ position: 'absolute', right: 64, bottom: 78, color: 'rgba(255,255,255,.58)', fontSize: 22 }}>BGM · {bgmTitle}</div> : null}
    </>
  );
};
