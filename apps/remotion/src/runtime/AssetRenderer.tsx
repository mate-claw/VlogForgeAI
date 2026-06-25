import React from 'react';
import { Img, Video, useVideoConfig } from 'remotion';
import type { DirectorScene } from '@ai-vlog/shared';
import { sourceStartFrame } from '../utils/asset';

export const AssetRenderer: React.FC<{ scene: DirectorScene; volume?: number; style?: React.CSSProperties }> = ({ scene, volume = 0.18, style }) => {
  const { fps } = useVideoConfig();
  const mediaStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', ...style };
  return scene.type === 'video'
    ? <Video src={scene.src} startFrom={sourceStartFrame(scene, fps)} playbackRate={(scene as any).playbackRate || 1} volume={volume} style={mediaStyle} />
    : <Img src={scene.src} style={mediaStyle} />;
};
