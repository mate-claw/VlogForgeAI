import React from 'react';
import { captionShell, normalizeCaptionText, renderHighlight, twoLineClamp, useTextEntrance, type CaptionProps } from './common';
export const TravelPostcardCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance('fade_up');
  const text = normalizeCaptionText(scene.caption, 34);
  return <div style={captionShell(typography, visualStyle, { ...enter, left: 100, right: 100, bottom: 152, padding: '16px 22px', borderRadius: 10, background: 'rgba(255,248,224,.88)', color: '#273744', border: `2px solid ${typography.accentColor}`, boxShadow: '0 16px 42px rgba(0,0,0,.22)', textAlign: 'left', textShadow: 'none', fontSize: Math.min(36, Math.max(26, typography.captionFontSize - 10)), maxHeight: 132 }, scene.fontToken)}><div style={{ fontSize: 16, letterSpacing: 4, color: typography.accentColor, marginBottom: 6, fontWeight: 950 }}>POSTCARD</div><span style={twoLineClamp}>{renderHighlight(text, scene.highlightWords, typography.accentColor)}</span></div>;
};
