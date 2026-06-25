import React from 'react';
import { captionShell, normalizeCaptionText, renderHighlight, twoLineClamp, useTextEntrance, type CaptionProps } from './common';
export const WarmSentenceCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance(typography.textAnimation);
  const text = normalizeCaptionText(scene.caption, 40);
  return <div style={captionShell(typography, visualStyle, { ...enter, left: 82, right: 82, bottom: 170, padding: '18px 24px', borderRadius: 24, background: typography.captionBgColor || 'rgba(18,12,8,.54)', backdropFilter: 'blur(10px)', boxShadow: `0 16px 48px ${typography.accentColor}20`, border: '1px solid rgba(255,255,255,.16)', maxHeight: 132 }, scene.fontToken)}><span style={twoLineClamp}>{renderHighlight(text, scene.highlightWords, typography.accentColor)}</span></div>;
};
