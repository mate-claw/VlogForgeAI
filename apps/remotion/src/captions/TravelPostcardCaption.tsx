import React from 'react';
import { captionShell, renderHighlight, useTextEntrance, type CaptionProps } from './common';
export const TravelPostcardCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance('fade_up');
  return <div style={captionShell(typography, visualStyle, { ...enter, left: 92, right: 92, bottom: 150, padding: '22px 28px', borderRadius: 8, background: 'rgba(255,248,224,.90)', color: '#273744', border: `3px solid ${typography.accentColor}`, boxShadow: '0 22px 70px rgba(0,0,0,.28)', textAlign: 'left', textShadow: 'none', fontSize: Math.max(30, typography.captionFontSize - 4) }, scene.fontToken)}><div style={{ fontSize: 18, letterSpacing: 5, color: typography.accentColor, marginBottom: 8, fontWeight: 950 }}>POSTCARD</div>{renderHighlight(scene.caption, scene.highlightWords, typography.accentColor)}</div>;
};
