import React from 'react';
import { captionShell, renderHighlight, useTextEntrance, type CaptionProps } from './common';
export const SocialCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance('fade_up');
  return <div style={captionShell(typography, visualStyle, { ...enter, left: 86, right: 86, bottom: 172, padding: '20px 24px', borderRadius: 24, background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,.30)', textAlign: 'left', fontSize: Math.max(30, typography.captionFontSize - 6), boxShadow: '0 18px 54px rgba(0,0,0,.30)' }, scene.fontToken)}>{renderHighlight(scene.caption, scene.highlightWords, typography.accentColor)}</div>;
};
