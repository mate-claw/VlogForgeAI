import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { VisualStyle } from '@ai-vlog/shared';

const accent: Record<VisualStyle, string> = {
  warm: '#ffe1bd',
  rec: '#e9f5ff',
  cute: '#ff6fae',
  cinematic: '#d8b987',
  beat: '#ffffff',
  social: '#d7ecff',
  food: '#ffd18a',
  night: '#b8c7ff',
  travel: '#b8f0da',
  city: '#d9e2ec',
  minimal: '#f4f4f5',
};

export const TitleCard: React.FC<{ title: string; subtitle: string; visualStyle: VisualStyle; storyType?: string }> = ({ title, subtitle, visualStyle, storyType }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18, 78, 105], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 105], [0.96, visualStyle === 'beat' ? 1.06 : 1.02], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const isBeat = visualStyle === 'beat';
  const isCinema = visualStyle === 'cinematic';
  const isCute = visualStyle === 'cute';

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `scale(${scale})`,
        background: isCinema ? 'rgba(0,0,0,.48)' : isCute ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.2)',
      }}
    >
      <div style={{ textAlign: isCinema ? 'left' : 'center', width: isCinema ? 850 : 920, padding: '0 60px', color: '#fff', textShadow: '0 10px 44px rgba(0,0,0,.58)' }}>
        <div style={{ fontSize: 24, letterSpacing: 5, fontWeight: 800, color: accent[visualStyle], marginBottom: 26 }}>{storyType || 'AI LIFE VLOG'}</div>
        <div style={{ fontSize: isBeat ? 98 : isCinema ? 82 : 78, fontWeight: 950, lineHeight: 1.1, letterSpacing: isBeat ? 4 : 2 }}>{title}</div>
        <div style={{ marginTop: 28, fontSize: 34, lineHeight: 1.38, opacity: 0.92 }}>{subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

export const EndingCard: React.FC<{ text: string; visualStyle: VisualStyle; hashtags?: string[] }> = ({ text, visualStyle, hashtags = [] }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 24, 116, 150], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const isCinema = visualStyle === 'cinematic';
  const isCute = visualStyle === 'cute';
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        background: isCinema
          ? 'linear-gradient(135deg, #070707 0%, #2a241e 100%)'
          : isCute
            ? 'linear-gradient(135deg, #ffe0ef 0%, #fff7eb 100%)'
            : 'linear-gradient(135deg, rgba(30,23,20,.96) 0%, rgba(86,64,46,.92) 100%)',
      }}
    >
      <div style={{ maxWidth: 850, color: isCute ? '#5b2d3f' : '#fff', fontSize: isCinema ? 54 : 56, fontWeight: 850, lineHeight: 1.35, textAlign: 'center', textShadow: isCute ? 'none' : '0 10px 40px rgba(0,0,0,.55)' }}>
        {text}
      </div>
      <div style={{ position: 'absolute', bottom: 150, left: 70, right: 70, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        {hashtags.slice(0, 4).map((tag) => (
          <span key={tag} style={{ color: isCute ? '#8f4b66' : 'rgba(255,255,255,.76)', fontSize: 26, letterSpacing: 1 }}>#{tag.replace(/^#/, '')}</span>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 95, fontSize: 24, letterSpacing: 5, color: isCute ? 'rgba(91,45,63,.55)' : 'rgba(255,255,255,.58)' }}>AI DIRECTOR</div>
    </AbsoluteFill>
  );
};
