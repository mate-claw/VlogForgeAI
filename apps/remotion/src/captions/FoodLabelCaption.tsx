import React from 'react';
import { captionShell, normalizeCaptionText, renderHighlight, twoLineClamp, useTextEntrance, type CaptionProps } from './common';
export const FoodLabelCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance('fade_up');
  const text = normalizeCaptionText(scene.caption, 36);
  return <div style={captionShell(typography, visualStyle, { ...enter, left: 86, right: 86, bottom: 168, padding: '16px 22px', borderRadius: 16, background: typography.captionBgColor || 'rgba(55,27,12,.66)', border: `2px solid ${typography.accentColor}AA`, boxShadow: `0 16px 42px ${typography.accentColor}2A`, textAlign: 'left', fontSize: Math.min(38, Math.max(28, typography.captionFontSize - 8)), maxHeight: 124 }, scene.fontToken)}><span style={{ marginRight: 12, color: typography.accentColor, fontWeight: 950, letterSpacing: 2 }}>TASTE</span><span style={twoLineClamp}>{renderHighlight(text, scene.highlightWords, typography.accentColor)}</span></div>;
};
