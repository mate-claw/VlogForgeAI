import React from 'react';
import type { DirectorScene, FontToken, TypographyDecision, VisualStyle, VisualStylePack } from '@ai-vlog/shared';
import { entranceTransform } from '../utils/easing';
import { getFontTokenSpec } from '../styles/fontTokens';
import { useCurrentFrame } from 'remotion';

export function useTextEntrance(animation: string | undefined) {
  const f = useCurrentFrame();
  return entranceTransform(f, (animation as any) || 'fade_up');
}

/**
 * Keep captions product-safe: no multiline whitespace from LLM output, no giant panels,
 * and no subtitles that cover the main subject. This is render-side protection only;
 * Qwen still owns the actual wording.
 */
export function normalizeCaptionText(value: string | undefined, maxChars = 42) {
  const raw = String(value || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (raw.length <= maxChars) return raw;
  return `${raw.slice(0, Math.max(1, maxChars - 1))}…`;
}

export function captionPosition(typography: TypographyDecision) {
  // For commercial Vlog output, center captions caused giant cards covering subjects.
  // Keep center only for explicit title-like caption styles; normal captions stay lower.
  if (typography.captionPosition === 'top') return { top: 148 };
  if (typography.captionPosition === 'center') return { bottom: 330 };
  return { bottom: 185 };
}

export function escapeRegExp(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export function renderHighlight(text: string, words: string[] | undefined, accent: string) {
  const safeText = normalizeCaptionText(text, 46);
  if (!words?.length) return safeText;
  const filtered = words.filter(Boolean).map((w) => normalizeCaptionText(w, 12)).filter(Boolean);
  if (!filtered.length) return safeText;
  const set = new Set(filtered);
  const parts = safeText.split(new RegExp(`(${filtered.map(escapeRegExp).join('|')})`, 'g'));
  return parts.map((part, i) => set.has(part) ? <span key={i} style={{ color: accent, fontWeight: 950, textShadow: `0 0 16px ${accent}` }}>{part}</span> : part);
}

export function captionShell(
  typography: TypographyDecision,
  visualStyle: VisualStyle | undefined,
  extra?: React.CSSProperties,
  fontToken?: FontToken,
): React.CSSProperties {
  const fontSpec = getFontTokenSpec(fontToken || typography.captionFontToken || typography.fontToken);
  return {
    position: 'absolute',
    left: 78,
    right: 78,
    ...captionPosition(typography),
    boxSizing: 'border-box',
    overflow: 'hidden',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    textAlign: typography.captionPosition === 'top' ? 'left' : 'center',
    color: typography.captionColor || typography.textColor,
    fontFamily: fontSpec?.family || typography.fontFamily,
    fontSize: Math.min(46, Math.max(28, typography.captionFontSize || 38)),
    fontWeight: fontSpec?.weight || typography.fontWeight,
    lineHeight: 1.18,
    letterSpacing: typography.letterSpacing ?? fontSpec?.letterSpacing ?? (visualStyle === 'cinematic' ? 1.6 : 0),
    textShadow: '0 8px 22px rgba(0,0,0,.48)',
    zIndex: 20,
    pointerEvents: 'none',
    ...(extra || {}),
    // Final guard: even if a specific caption component passes large padding/size,
    // never allow a caption container to occupy a big empty white block.
    maxHeight: Math.min(Number((extra as any)?.maxHeight || 168), 168),
  } as React.CSSProperties;
}

export const twoLineClamp: React.CSSProperties = {
  display: '-webkit-box' as any,
  WebkitLineClamp: 2 as any,
  WebkitBoxOrient: 'vertical' as any,
  overflow: 'hidden',
};

export type CaptionProps = { scene: DirectorScene; typography: TypographyDecision; visualStyle?: VisualStyle; visualStylePack?: VisualStylePack };
