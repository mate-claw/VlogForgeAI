import React from 'react';
import { captionShell, renderHighlight, useTextEntrance, type CaptionProps } from './common';
export const RecCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance('slide');
  return <div style={captionShell(typography, visualStyle, { ...enter, left: 58, right: 58, bottom: 145, textAlign: 'left', fontSize: Math.max(28, typography.captionFontSize - 8), background: 'rgba(4,10,16,.68)', padding: '18px 24px', borderRadius: 16, border: `1px solid ${typography.accentColor}66`, fontFamily: 'Consolas, "Courier New", monospace', boxShadow: '0 12px 38px rgba(0,0,0,.42)' }, scene.fontToken)}><span style={{ color: '#ff3b30' }}>●</span>&nbsp; {renderHighlight(scene.caption, scene.highlightWords, typography.accentColor)}</div>;
};
