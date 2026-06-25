import React from 'react';
import type { DirectorScene, FontToken, TypographyDecision, VisualStyle, VisualStylePack } from '@ai-vlog/shared';
import { entranceTransform } from '../utils/easing';
import { getFontTokenSpec } from '../styles/fontTokens';
import { useCurrentFrame } from 'remotion';

export function useTextEntrance(animation: string | undefined) {
  const f = useCurrentFrame();
  return entranceTransform(f, (animation as any) || 'fade_up');
}
export function captionPosition(typography: TypographyDecision) {
  return typography.captionPosition === 'top' ? { top: 148 } : typography.captionPosition === 'center' ? { top: 780 } : { bottom: 185 };
}
export function escapeRegExp(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export function renderHighlight(text: string, words: string[] | undefined, accent: string) {
  if (!words?.length) return text;
  const filtered = words.filter(Boolean);
  if (!filtered.length) return text;
  const set = new Set(filtered);
  const parts = text.split(new RegExp(`(${filtered.map(escapeRegExp).join('|')})`, 'g'));
  return parts.map((part, i) => set.has(part) ? <span key={i} style={{ color: accent, fontWeight: 950, textShadow: `0 0 22px ${accent}` }}>{part}</span> : part);
}
export function captionShell(typography: TypographyDecision, visualStyle: VisualStyle | undefined, extra?: React.CSSProperties, fontToken?: FontToken): React.CSSProperties {
  const fontSpec = getFontTokenSpec(fontToken || typography.captionFontToken || typography.fontToken);
  return {
    position: 'absolute',
    left: 70,
    right: 70,
    ...captionPosition(typography),
    textAlign: typography.captionPosition === 'top' ? 'left' : 'center',
    color: typography.captionColor || typography.textColor,
    fontFamily: fontSpec?.family || typography.fontFamily,
    fontSize: typography.captionFontSize,
    fontWeight: fontSpec?.weight || typography.fontWeight,
    lineHeight: 1.22,
    letterSpacing: typography.letterSpacing ?? fontSpec?.letterSpacing ?? (visualStyle === 'cinematic' ? 2 : 0),
    textShadow: '0 10px 32px rgba(0,0,0,.55)',
    zIndex: 20,
    ...extra,
  };
}
export type CaptionProps = { scene: DirectorScene; typography: TypographyDecision; visualStyle?: VisualStyle; visualStylePack?: VisualStylePack };
