import React from 'react';
import { useCurrentFrame } from 'remotion';
import { captionShell, normalizeCaptionText, renderHighlight, twoLineClamp, useTextEntrance, type CaptionProps } from './common';

export const CuteShortCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const f = useCurrentFrame();
  const enter = useTextEntrance('pop');
  const rot = visualStyle === 'beat' ? Math.sin(f / 12) * .6 : 0;
  const text = normalizeCaptionText(scene.caption, 30);
  return (
    <div
      style={captionShell(typography, visualStyle, {
        ...enter,
        transform: `${enter.transform || ''} rotate(${rot}deg)`,
        left: 112,
        right: 112,
        bottom: 205,
        padding: '16px 24px',
        borderRadius: 34,
        background: 'rgba(255,255,255,.82)',
        color: '#33223a',
        boxShadow: '0 18px 46px rgba(255,88,166,.20)',
        border: `3px solid ${typography.accentColor}55`,
        fontSize: Math.min(40, Math.max(30, typography.captionFontSize - 4)),
        maxHeight: 122,
      }, scene.fontToken)}
    >
      <span style={twoLineClamp}>✨ {renderHighlight(text, scene.highlightWords, typography.accentColor)} ♡</span>
    </div>
  );
};
