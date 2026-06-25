import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { VisualStabilityMode, VlogPace, VisualStyle } from '@ai-vlog/shared';
export const BeatPulseController: React.FC<{ pace: VlogPace; visualStyle: VisualStyle; visualStabilityMode?: VisualStabilityMode }> = ({ pace, visualStyle, visualStabilityMode = 'stable' }) => {
  const f = useCurrentFrame();
  if (visualStabilityMode !== 'dynamic') return null;
  if (!(pace === 'fast' || pace === 'medium_fast' || visualStyle === 'beat')) return null;
  const hit = (f % 18) < 3;
  return <div style={{ position: 'absolute', inset: 0, opacity: hit ? .12 : 0, background: 'white', mixBlendMode: 'overlay', pointerEvents: 'none' }} />;
};
