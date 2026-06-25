import React from 'react';
import { captionShell, normalizeCaptionText, renderHighlight, twoLineClamp, useTextEntrance, type CaptionProps } from './common';

export const SpeechBubbleCaption: React.FC<CaptionProps> = ({ scene, typography, visualStyle }) => {
  const enter = useTextEntrance('pop');
  const text = normalizeCaptionText(scene.caption, 34);
  return (
    <div
      style={captionShell(
        typography,
        visualStyle,
        {
          ...enter,
          left: 118,
          right: 118,
          bottom: 205,
          padding: '18px 24px',
          borderRadius: '30px 30px 30px 12px',
          background: 'rgba(255,255,255,.88)',
          color: '#2d2230',
          textShadow: 'none',
          boxShadow: '0 18px 46px rgba(0,0,0,.22)',
          border: `3px solid ${typography.accentColor}44`,
          fontSize: Math.min(40, Math.max(30, typography.captionFontSize - 4)),
          lineHeight: 1.16,
          maxHeight: 126,
        },
        scene.fontToken,
      )}
    >
      <span style={twoLineClamp}>{renderHighlight(text, scene.highlightWords, typography.accentColor)}</span>
    </div>
  );
};
