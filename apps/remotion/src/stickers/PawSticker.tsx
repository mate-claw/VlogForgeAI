import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { VisualStabilityMode } from '@ai-vlog/shared';
export const PawSticker: React.FC<{ index: number; visualStabilityMode?: VisualStabilityMode }> = ({ index, visualStabilityMode = 'stable' }) => {
  const f = useCurrentFrame();
  const y = visualStabilityMode === 'dynamic' ? Math.sin((f + index * 10) / 24) * 5 : 0;
  return <div style={{ position: 'absolute', right: 95 + index * 55, bottom: 300 + index * 60 + y, fontSize: 42, opacity: .9, filter: 'drop-shadow(0 8px 18px rgba(0,0,0,.32))' }}>🐾</div>;
};
