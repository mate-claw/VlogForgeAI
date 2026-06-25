import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import type { DirectorScene, VisualStyle } from '@ai-vlog/shared';

type Props = {
  text: string;
  visualStyle: VisualStyle;
  scene: DirectorScene;
};

export const DynamicCaption: React.FC<Props> = ({ text, visualStyle, scene }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 18], [32, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const isBeat = visualStyle === 'beat';
  const isCute = visualStyle === 'cute';
  const isCinema = visualStyle === 'cinematic';
  const strong = scene.emphasis === 'strong';

  const fontSize = isBeat ? 56 : strong ? 54 : isCute ? 50 : isCinema ? 44 : 46;
  const bottom = isCinema ? 250 : isBeat ? 220 : 210;

  return (
    <div
      style={{
        position: 'absolute',
        left: isCinema ? 86 : 70,
        right: isCinema ? 86 : 70,
        bottom,
        opacity,
        transform: `translateY(${y}px)`,
        textAlign: isCinema ? 'left' : 'center',
        color: '#fff',
        fontSize,
        lineHeight: 1.25,
        fontWeight: isBeat || strong ? 900 : 750,
        letterSpacing: isBeat ? 2.5 : isCinema ? 2 : 1,
        textShadow: '0 5px 24px rgba(0,0,0,.72)',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          padding: isBeat ? '18px 32px' : isCute ? '18px 34px' : isCinema ? '14px 0' : '18px 30px',
          borderRadius: isCute ? 34 : 24,
          background: isCinema ? 'transparent' : isBeat ? 'rgba(0,0,0,.55)' : 'rgba(0,0,0,.38)',
          border: isBeat ? '3px solid rgba(255,255,255,.82)' : isCinema ? '0' : '1px solid rgba(255,255,255,.22)',
          backdropFilter: isCinema ? 'none' : 'blur(14px)',
        }}
      >
        {text}
      </span>
    </div>
  );
};
