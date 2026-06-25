import React from 'react';
import { captionShell, renderHighlight, useTextEntrance, type CaptionProps } from './common';
export const WarmSentenceCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance(typography.textAnimation);
  return <div style={captionShell(typography, visualStyle, { ...enter, left: 78, right: 78, bottom: 165, padding: '22px 28px', borderRadius: 26, background: typography.captionBgColor || 'rgba(18,12,8,.54)', backdropFilter: 'blur(10px)', boxShadow: `0 18px 70px ${typography.accentColor}22`, border: '1px solid rgba(255,255,255,.16)' }, scene.fontToken)}>{renderHighlight(scene.caption, scene.highlightWords, typography.accentColor)}</div>;
};
