import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from 'remotion';
import type { VlogPlan } from '@ai-vlog/shared';
import { SceneRenderer } from './SceneRenderer';
import type { SceneTiming } from '../utils/timing';

const SceneFadeWrapper: React.FC<{
  timing: SceneTiming;
  index: number;
  sceneCount: number;
  children: React.ReactNode;
}> = ({ timing, index, sceneCount, children }) => {
  const frame = useCurrentFrame();
  const fadeIn = index === 0 ? timing.fadeInFrames : Math.max(1, timing.fadeInFrames);
  const fadeOut = index === sceneCount - 1 ? 0 : Math.max(1, timing.fadeOutFrames);
  const inOpacity = fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  const outOpacity = fadeOut > 0 ? interpolate(frame, [timing.durationFrames - fadeOut, timing.durationFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  const opacity = Math.max(0, Math.min(1, Math.min(inOpacity, outOpacity)));
  return <AbsoluteFill style={{ opacity, willChange: 'opacity' }}>{children}</AbsoluteFill>;
};

export const SceneTimeline: React.FC<{ plan: VlogPlan; timings: SceneTiming[] }> = ({ plan, timings }) => (
  <>
    {plan.scenes.map((scene, index) => {
      const timing = timings[index];
      return (
        <Sequence key={`${scene.assetId}-${index}`} from={timing.from} durationInFrames={timing.durationFrames}>
          <SceneFadeWrapper timing={timing} index={index} sceneCount={plan.scenes.length}>
            <SceneRenderer scene={scene} plan={plan} index={index} durationFrames={timing.durationFrames} progress={(index + 1) / Math.max(1, plan.scenes.length)} />
          </SceneFadeWrapper>
        </Sequence>
      );
    })}
  </>
);
