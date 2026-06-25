import React from 'react';
import { useCurrentFrame } from 'remotion';
import { captionShell, renderHighlight, type CaptionProps } from './common';
export const BeatPunchCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const f = useCurrentFrame();
  const hit = (f % 20) < 3;
  const scale = visualStyle === 'beat' && hit ? 1.035 : 1;
  return <div style={captionShell(typography, visualStyle, { bottom: 190, fontSize: typography.captionFontSize + 4, transform: `scale(${scale}) rotate(-.8deg)`, padding: '18px 28px', background: '#fff', color: '#111', textShadow: 'none', boxShadow: `8px 8px 0 ${typography.accentColor}`, textTransform: 'uppercase' }, scene.fontToken)}>{renderHighlight(scene.caption, scene.highlightWords, typography.accentColor)}</div>;
};
