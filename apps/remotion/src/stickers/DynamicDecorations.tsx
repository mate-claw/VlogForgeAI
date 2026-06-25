import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { VlogPlan } from '@ai-vlog/shared';
import { getStyleTokens } from '../utils/styleTokens';
import { getStabilityMode } from '../utils/stability';
export const DynamicDecorations: React.FC<{ plan: VlogPlan; totalFrames: number }> = ({ plan, totalFrames }) => {
  const f = useCurrentFrame();
  const mode = getStabilityMode(plan);
  const t = getStyleTokens(plan.visualStyle, plan.typography, plan.visualStylePack);
  // Decorative rings were the main source of perceived jitter in stable Vlog scenes.
  // Keep them static and very subtle unless this is a dynamic beat video.
  const opacity = mode === 'dynamic' ? (f < 40 || f > totalFrames - 70 ? .34 : .12) : .08;
  const animated = mode === 'dynamic';
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>{[0, 1].map(i => <div key={i} style={{ position: 'absolute', left: 72 + i * 680 + (animated ? Math.sin((f + i * 18) / 80) * 16 : 0), top: 140 + i * 1060 + (animated ? Math.cos((f + i * 12) / 76) * 12 : 0), width: 128 + i * 40, height: 128 + i * 40, borderRadius: '50%', border: `2px solid ${t.accent}3a`, filter: 'blur(.2px)' }} />)}<div style={{ position: 'absolute', right: 54, bottom: 54, fontSize: 18, letterSpacing: 3, color: 'rgba(255,255,255,.36)', fontFamily: t.fontFamily }}>AI LIFE VLOG</div></div>;
};
