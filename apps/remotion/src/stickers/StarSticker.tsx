import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { VisualStabilityMode } from '@ai-vlog/shared';
export const StarSticker: React.FC<{ index: number; color: string; visualStabilityMode?: VisualStabilityMode }> = ({ index, color, visualStabilityMode = 'stable' }) => {
  const f = useCurrentFrame();
  const animated = visualStabilityMode === 'dynamic';
  const s = animated ? 1 + Math.sin((f + index * 7) / 14) * .05 : 1;
  const r = animated ? Math.sin(f / 60) * 8 : -8 + index * 6;
  return <div style={{ position: 'absolute', left: 70 + index * 58, top: 145 + index * 82, fontSize: 42, transform: `scale(${s}) rotate(${r}deg)`, color, filter: `drop-shadow(0 0 16px ${color})` }}>✦</div>;
};
