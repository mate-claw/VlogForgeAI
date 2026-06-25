import React from 'react';
import { captionShell, normalizeCaptionText, renderHighlight, twoLineClamp, useTextEntrance, type CaptionProps } from './common';
export const SocialCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance('fade_up');
  const text = normalizeCaptionText(scene.caption, 36);
  return <div style={captionShell(typography, visualStyle, { ...enter, left: 92, right: 92, bottom: 172, padding: '16px 22px', borderRadius: 22, background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,.30)', textAlign: 'left', fontSize: Math.min(38, Math.max(28, typography.captionFontSize - 8)), boxShadow: '0 14px 40px rgba(0,0,0,.26)', maxHeight: 122 }, scene.fontToken)}><span style={twoLineClamp}>{renderHighlight(text, scene.highlightWords, typography.accentColor)}</span></div>;
};
