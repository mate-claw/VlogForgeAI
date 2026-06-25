import React from 'react';
import { captionShell, renderHighlight, useTextEntrance, type CaptionProps } from './common';
export const SpeechBubbleCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance('pop');
  return <div style={captionShell(typography, visualStyle, { ...enter, maxWidth: 760, left: 110, right: 110, bottom: 205, padding: '24px 32px', borderRadius: '38px 38px 38px 12px', background: 'rgba(255,255,255,.90)', color: '#2d2230', textShadow: 'none', boxShadow: '0 24px 70px rgba(0,0,0,.26)', border: `4px solid ${typography.accentColor}55` }, scene.fontToken)}>{renderHighlight(scene.caption, scene.highlightWords, typography.accentColor)}</div>;
};
