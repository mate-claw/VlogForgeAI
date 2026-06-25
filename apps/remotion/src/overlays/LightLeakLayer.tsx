import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { VisualStabilityMode } from '@ai-vlog/shared';
export const LightLeakLayer: React.FC<{ accent: string; visualStabilityMode?: VisualStabilityMode }> = ({ accent, visualStabilityMode = 'stable' }) => {
  const f = useCurrentFrame();
  const x = visualStabilityMode === 'dynamic' ? -220 + Math.sin(f / 62) * 80 : -120;
  const opacity = visualStabilityMode === 'stable' ? .22 : .34;
  return <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', pointerEvents: 'none', overflow: 'hidden', opacity }}><div style={{ position: 'absolute', left: x, top: -120, width: 360, height: 2300, transform: 'rotate(18deg)', background: `linear-gradient(90deg, transparent, ${accent}55, rgba(255,246,204,.38), transparent)`, filter: 'blur(28px)' }} /></div>;
};
