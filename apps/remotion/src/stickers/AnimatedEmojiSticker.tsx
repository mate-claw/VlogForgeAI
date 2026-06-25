import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { VisualStabilityMode, VisualStyle } from '@ai-vlog/shared';
export const AnimatedEmojiSticker: React.FC<{ visualStyle: VisualStyle; index?: number; visualStabilityMode?: VisualStabilityMode }> = ({ visualStyle, index = 0, visualStabilityMode = 'stable' }) => {
  const f = useCurrentFrame();
  const animated = visualStabilityMode === 'dynamic';
  const s = animated ? 1 + Math.sin((f + index * 13) / 16) * .05 : 1;
  const emoji = visualStyle === 'cute' ? '🥰' : visualStyle === 'food' ? '🍽️' : visualStyle === 'travel' ? '✈️' : visualStyle === 'night' ? '🌙' : visualStyle === 'beat' ? '⚡' : '✨';
  return <div style={{ position: 'absolute', right: 78 + index * 20, bottom: 288 + index * 24, fontSize: 56, transform: `scale(${s})`, filter: 'drop-shadow(0 10px 22px rgba(0,0,0,.36))' }}>{emoji}</div>;
};
