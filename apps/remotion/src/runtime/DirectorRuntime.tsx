import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion';
import type { VlogRenderInput } from '@ai-vlog/shared';
import { BgmController } from '../audio/BgmController';
import { OriginalAudioMixer } from '../audio/OriginalAudioMixer';
import { BeatPulseController } from '../audio/BeatPulseController';
import { SfxLayer } from '../audio/SfxLayer';
import { OpeningCard } from '../openings/OpeningCard';
import { EndingCard } from '../endings/EndingCard';
import { SceneTimeline } from './SceneTimeline';
import { DynamicDecorations } from '../stickers/DynamicDecorations';
import { endingStartFrame, openingOverlapFrames, sceneTimings, secondsToFrames, totalDurationFramesForInput, resolveFps } from '../utils/timing';
import { StyleLayer } from '../overlays/StyleLayer';
import { getStyleTokens } from '../utils/styleTokens';
import { getStabilityMode } from '../utils/stability';
import { getVisualStylePackSpec } from '../styles/visualStylePacks';

const OpeningFadeOut: React.FC<{ durationFrames: number; fadeOutFrames: number; children: React.ReactNode }> = ({ durationFrames, fadeOutFrames, children }) => {
  const frame = useCurrentFrame();
  const opacity = fadeOutFrames > 0
    ? interpolate(frame, [durationFrames - fadeOutFrames, durationFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const EndingFadeIn: React.FC<{ fadeInFrames: number; children: React.ReactNode }> = ({ fadeInFrames, children }) => {
  const frame = useCurrentFrame();
  const opacity = fadeInFrames > 0
    ? interpolate(frame, [0, fadeInFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const DirectorRuntime: React.FC<VlogRenderInput> = (input) => {
  const { plan, bgmUrl, bgm } = input;
  const mode = getStabilityMode(plan);
  const t = getStyleTokens(plan.visualStyle, plan.typography, plan.visualStylePack);
  const pack = getVisualStylePackSpec(plan.visualStylePack);
  const frameRate = resolveFps(input.renderFps);
  const openingFrames = secondsToFrames(plan.opening.duration, frameRate);
  const timings = sceneTimings(plan, frameRate);
  const endingFrames = secondsToFrames(plan.ending.duration, frameRate);
  const totalFrames = totalDurationFramesForInput(input);
  const endingFrom = endingStartFrame(plan, frameRate);
  const firstOverlap = openingOverlapFrames(plan, frameRate);

  return (
    <AbsoluteFill style={{ background: t.bg, overflow: 'hidden', fontFamily: t.fontFamily }}>
      <StyleLayer overlays={pack?.overlays?.slice(0, 2) || ['soft_vignette']} visualStyle={plan.visualStyle} typography={plan.typography} visualStylePack={plan.visualStylePack} visualStabilityMode={mode} />
      {bgmUrl ? <BgmController src={bgmUrl} title={bgm?.title || plan.bgmTitle} pace={plan.pace} totalFrames={totalFrames} /> : null}
      <OriginalAudioMixer plan={plan} />
      <BeatPulseController pace={plan.pace} visualStyle={plan.visualStyle} visualStabilityMode={mode} />
      <Sequence from={0} durationInFrames={openingFrames}>
        <OpeningFadeOut durationFrames={openingFrames} fadeOutFrames={firstOverlap}>
          <OpeningCard plan={plan} />
        </OpeningFadeOut>
      </Sequence>
      <SceneTimeline plan={plan} timings={timings} />
      <Sequence from={endingFrom} durationInFrames={endingFrames}>
        <EndingFadeIn fadeInFrames={10}>
          <EndingCard plan={plan} />
        </EndingFadeIn>
      </Sequence>
      <DynamicDecorations plan={plan} totalFrames={totalFrames} />
      <SfxLayer plan={plan} />
    </AbsoluteFill>
  );
};
