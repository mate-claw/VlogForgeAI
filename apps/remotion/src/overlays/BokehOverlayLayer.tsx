import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { VisualStabilityMode } from '@ai-vlog/shared';
export const BokehOverlayLayer: React.FC<{ accent: string; visualStabilityMode?: VisualStabilityMode }> = ({ accent, visualStabilityMode = 'stable' }) => {
  const f = useCurrentFrame();
  const move = visualStabilityMode === 'dynamic';
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen', opacity: visualStabilityMode === 'stable' ? .26 : .42 }}>{[0, 1, 2, 3].map(i => <div key={i} style={{ position: 'absolute', left: 120 + i * 205 + (move ? Math.sin((f + i * 13) / 60) * 16 : 0), top: 180 + i * 300 + (move ? Math.cos((f + i * 9) / 55) * 14 : 0), width: 70 + i * 16, height: 70 + i * 16, borderRadius: '50%', background: accent, filter: 'blur(18px)', opacity: .13 }} />)}</div>;
};
