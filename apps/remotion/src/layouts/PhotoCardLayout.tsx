import React from 'react';
import type { VisualStyle, VisualStylePack } from '@ai-vlog/shared';
import { LayoutFrame, blurredBg, softShadow, glassBorder } from './BaseLayouts';
export const PhotoCardLayout: React.FC<{ children: React.ReactNode; background?: React.ReactNode; visualStyle?: VisualStyle; visualStylePack?: VisualStylePack }> = ({ children, background, visualStyle = 'warm', visualStylePack }) => {
  const isCute = visualStylePack === 'cute_pet' || visualStylePack === 'kid_playful';
  const isFood = visualStylePack === 'food_diary';
  return <>{blurredBg(background, .42)}<LayoutFrame style={{ left: isCute ? 72 : 62, right: isCute ? 72 : 62, top: isFood ? 210 : 170, bottom: isFood ? 315 : 270, borderRadius: visualStyle === 'cinematic' ? 22 : isCute ? 56 : 42, boxShadow: softShadow, border: isCute ? '10px solid rgba(255,255,255,.55)' : glassBorder, background: 'rgba(255,255,255,.08)' }}>{children}</LayoutFrame></>;
};
