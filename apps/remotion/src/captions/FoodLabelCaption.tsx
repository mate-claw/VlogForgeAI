import React from 'react';
import { captionShell, renderHighlight, useTextEntrance, type CaptionProps } from './common';
export const FoodLabelCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance('fade_up');
  return <div style={captionShell(typography, visualStyle, { ...enter, left: 76, right: 76, bottom: 172, padding: '20px 28px', borderRadius: 14, background: typography.captionBgColor || 'rgba(55,27,12,.66)', border: `2px solid ${typography.accentColor}`, boxShadow: `0 18px 50px ${typography.accentColor}33`, textAlign: 'left', fontSize: Math.max(30, typography.captionFontSize - 4) }, scene.fontToken)}><span style={{ marginRight: 14, color: typography.accentColor, fontWeight: 950, letterSpacing: 3 }}>TASTE</span>{renderHighlight(scene.caption, scene.highlightWords, typography.accentColor)}</div>;
};
