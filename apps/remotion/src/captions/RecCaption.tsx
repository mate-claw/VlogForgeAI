import React from 'react';
import { captionShell, normalizeCaptionText, renderHighlight, twoLineClamp, useTextEntrance, type CaptionProps } from './common';
export const RecCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance('slide');
  const text = normalizeCaptionText(scene.caption, 40);
  return <div style={captionShell(typography, visualStyle, { ...enter, left: 58, right: 58, bottom: 145, textAlign: 'left', fontSize: Math.min(34, Math.max(26, typography.captionFontSize - 10)), background: 'rgba(4,10,16,.68)', padding: '14px 20px', borderRadius: 16, border: `1px solid ${typography.accentColor}66`, fontFamily: 'Consolas, "Courier New", monospace', boxShadow: '0 12px 38px rgba(0,0,0,.42)', maxHeight: 116 }, scene.fontToken)}><span style={{ color: '#ff3b30' }}>●</span>&nbsp; <span style={twoLineClamp}>{renderHighlight(text, scene.highlightWords, typography.accentColor)}</span></div>;
};
