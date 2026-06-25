import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { VisualStabilityMode } from '@ai-vlog/shared';
import { LayoutFrame, blurredBg } from './BaseLayouts';
export const PolaroidLayout: React.FC<{ children: React.ReactNode; background?: React.ReactNode; visualStabilityMode?: VisualStabilityMode }> = ({ children, background, visualStabilityMode = 'stable' }) => {
  const f = useCurrentFrame();
  const r = visualStabilityMode === 'dynamic' ? -2 + Math.sin(f / 60) * 0.2 : -1.2;
  return <>{blurredBg(background, .45)}<LayoutFrame style={{ left: 70, right: 70, top: 160, bottom: 235, border: '20px solid rgba(255,255,255,.96)', borderBottomWidth: 105, boxShadow: '0 34px 110px rgba(0,0,0,.42)', transform: `rotate(${r}deg)`, background: '#fff' }}>{children}</LayoutFrame><div style={{ position: 'absolute', left: 125, right: 125, bottom: 250, height: 40, borderRadius: 20, background: 'rgba(0,0,0,.10)', filter: 'blur(18px)' }} /></>;
};
