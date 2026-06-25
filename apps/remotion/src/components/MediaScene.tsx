import React from 'react';
import { AbsoluteFill, Img, Video, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { DirectorScene, VisualStyle, VlogPace } from '@ai-vlog/shared';

type Props = {
  scene: DirectorScene;
  durationFrames: number;
  visualStyle: VisualStyle;
  pace: VlogPace;
};

function transitionOpacity(frame: number, durationFrames: number, scene: DirectorScene) {
  if (scene.transitionIn === 'hard_cut') return 1;
  const fade = scene.transitionIn === 'soft_flash' ? 10 : 16;
  const inOpacity = interpolate(frame, [0, fade], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const outOpacity = interpolate(frame, [Math.max(0, durationFrames - fade), durationFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return Math.min(inOpacity, outOpacity);
}

function motionTransform(frame: number, durationFrames: number, scene: DirectorScene, visualStyle: VisualStyle) {
  const progress = frame / Math.max(1, durationFrames);
  if (scene.motion === 'beat_punch') {
    const punch = Math.sin(progress * Math.PI * 6) * 0.018;
    const zoom = interpolate(frame, [0, durationFrames], [1.04, 1.14], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) + punch;
    const rotate = interpolate(frame, [0, durationFrames], [-0.5, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return `scale(${zoom}) rotate(${rotate}deg)`;
  }
  if (scene.motion === 'handheld_rec') {
    const x = Math.sin(progress * Math.PI * 2) * 8;
    const y = Math.cos(progress * Math.PI * 2.4) * 6;
    const zoom = interpolate(frame, [0, durationFrames], [1.04, 1.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return `translate(${x}px, ${y}px) scale(${zoom})`;
  }
  if (scene.motion === 'gentle_pan') {
    const x = interpolate(frame, [0, durationFrames], [-28, 28], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const zoom = interpolate(frame, [0, durationFrames], [1.07, 1.11], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return `translateX(${x}px) scale(${zoom})`;
  }
  if (scene.motion === 'focus_zoom') {
    const zoom = interpolate(frame, [0, durationFrames], [1.02, visualStyle === 'cute' ? 1.14 : 1.1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return `scale(${zoom})`;
  }
  if (scene.motion === 'still') return 'scale(1.03)';
  const zoom = interpolate(frame, [0, durationFrames], [1.02, 1.075], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return `scale(${zoom})`;
}

export const MediaScene: React.FC<Props> = ({ scene, durationFrames, visualStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = transitionOpacity(frame, durationFrames, scene);
  const transform = motionTransform(frame, durationFrames, scene, visualStyle);

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform,
  };

  const sourceStart = Math.max(0, Math.round((scene.sourceStart || 0) * fps));

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: '#111', overflow: 'hidden' }}>
      {scene.type === 'video' ? (
        <Video src={scene.src} startFrom={sourceStart} volume={visualStyle === 'cinematic' ? 0.14 : visualStyle === 'beat' ? 0.12 : 0.2} style={mediaStyle} />
      ) : (
        <Img src={scene.src} style={mediaStyle} />
      )}

      <AbsoluteFill
        style={{
          background: visualStyle === 'cinematic'
            ? 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,.72) 100%)'
            : visualStyle === 'cute'
              ? 'linear-gradient(180deg, rgba(255,155,190,.14) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,.38) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,.50) 100%)',
        }}
      />

      {scene.transitionIn === 'soft_flash' ? (
        <AbsoluteFill style={{ background: '#fff', opacity: interpolate(frame, [0, 4, 12], [0.7, 0.25, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }} />
      ) : null}
    </AbsoluteFill>
  );
};
