import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { VisualStabilityMode } from '@ai-vlog/shared';
export const HeartSticker: React.FC<{ index: number; color: string; visualStabilityMode?: VisualStabilityMode }> = ({ index, color, visualStabilityMode = 'stable' }) => {
  const f = useCurrentFrame();
  const animated = visualStabilityMode === 'dynamic';
  const s = animated ? 1 + Math.sin((f + index * 11) / 14) * .04 : 1;
  const y = animated ? Math.sin((f + index * 18) / 34) * 5 : 0;
  return <div style={{ position: 'absolute', right: 58 + index * 42, top: 128 + index * 74 + y, fontSize: 50, transform: `scale(${s})`, color, textShadow: '0 10px 30px rgba(0,0,0,.32)', filter: `drop-shadow(0 0 14px ${color}88)` }}>♡</div>;
};
