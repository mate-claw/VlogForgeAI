import React from 'react';
import { captionShell, renderHighlight, useTextEntrance, type CaptionProps } from './common';
export const CinematicTitleCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance('fade_up');
  return <div style={captionShell(typography, visualStyle, { ...enter, left: 100, right: 100, bottom: 180, textAlign: 'center', fontSize: Math.max(28, typography.captionFontSize - 6), letterSpacing: 2.2, background: 'transparent', padding: '0 20px', color: typography.captionColor || '#f4ead8', textShadow: '0 3px 12px rgba(0,0,0,.86)' }, scene.fontToken)}>{renderHighlight(scene.caption, scene.highlightWords, typography.accentColor)}</div>;
};
