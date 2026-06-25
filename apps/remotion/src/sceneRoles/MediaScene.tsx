import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { DirectorScene, VlogPlan } from '@ai-vlog/shared';
import { AssetRenderer } from '../runtime/AssetRenderer';
import { MotionEngine } from '../motions/MotionEngine';
import { LayoutEngine } from '../layouts/LayoutEngine';
import { StyleLayer } from '../overlays/StyleLayer';
import { StickerLayer } from '../stickers/StickerLayer';
import { CaptionLayer } from '../captions/CaptionLayer';
import { TransitionEngine } from '../transitions/TransitionEngine';
import { Layer, LayerStack } from '../runtime/LayerStack';
import { getStyleTokens } from '../utils/styleTokens';
import { getVisualStylePackSpec } from '../styles/visualStylePacks';
import { getStabilityMode, shouldUseVideoBackground } from '../utils/stability';
import { resolveSceneForRender } from '../utils/renderScene';

export type MediaSceneProps = { scene: DirectorScene; plan: VlogPlan; index: number; durationFrames: number; progress: number };

export const MediaScene: React.FC<MediaSceneProps> = ({ scene, plan, durationFrames, progress }) => {
  const mode = getStabilityMode(plan);
  const renderScene = resolveSceneForRender(scene, plan.visualStylePack, mode);
  const t = getStyleTokens(plan.visualStyle, plan.typography, plan.visualStylePack);
  const pack = getVisualStylePackSpec(plan.visualStylePack);
  const useMovingBg = shouldUseVideoBackground(renderScene, mode);
  const background = useMovingBg ? <AssetRenderer scene={renderScene} volume={0} /> : null;
  const mediaVolume = renderScene.emphasis === 'strong' ? 0.22 : plan.visualStyle === 'beat' ? 0.12 : 0.16;
  const media = <AssetRenderer scene={renderScene} volume={mediaVolume} />;
  const baseOverlays = renderScene.overlays?.length ? renderScene.overlays : (pack?.overlays || []);

  return (
    <AbsoluteFill style={{ background: t.bg, overflow: 'hidden' }}>
      <LayerStack>
        <Layer z={0}>
          <AbsoluteFill style={{ background: pack?.sceneBackdrop || 'linear-gradient(180deg, rgba(0,0,0,.10), transparent 45%, rgba(0,0,0,.42))' }} />
        </Layer>
        <Layer z={2}>
          <LayoutEngine scene={renderScene} background={background} visualStyle={plan.visualStyle} visualStylePack={plan.visualStylePack} visualStabilityMode={mode}>
            <MotionEngine scene={renderScene} durationFrames={durationFrames} visualStabilityMode={mode}>{media}</MotionEngine>
          </LayoutEngine>
        </Layer>
        <Layer z={3}>
          <StyleLayer overlays={baseOverlays} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
        </Layer>
        <Layer z={4}>
          <StickerLayer stickers={renderScene.stickers} progress={progress} typography={plan.typography} visualStyle={plan.visualStyle} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
        </Layer>
        <Layer z={5}>
          <CaptionLayer scene={renderScene} typography={plan.typography} visualStyle={plan.visualStyle} visualStylePack={plan.visualStylePack} />
        </Layer>
        <Layer z={8}>
          <TransitionEngine type={renderScene.transitionIn} durationFrames={renderScene.transitionDuration || 10} visualStyle={plan.visualStyle} typography={plan.typography} visualStabilityMode={mode} />
        </Layer>
      </LayerStack>
    </AbsoluteFill>
  );
};
