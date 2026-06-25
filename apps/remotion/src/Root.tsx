import React from 'react';
import { Composition } from 'remotion';
import { DynamicLifeVlog } from './templates/DynamicLifeVlog';
import { sampleInput } from './sampleInput';
import { dimensionsForAspect, totalDurationFramesForInput } from './utils/timing';
export const RemotionRoot: React.FC = () => (
  <Composition
    id="DynamicLifeVlog"
    component={DynamicLifeVlog}
    durationInFrames={totalDurationFramesForInput(sampleInput)}
    fps={60}
    width={1080}
    height={1920}
    defaultProps={sampleInput}
    calculateMetadata={({ props }) => {
      const input = props as typeof sampleInput;
      const dimensions = dimensionsForAspect(input.outputAspect);
      return { durationInFrames: totalDurationFramesForInput(input), fps: input.renderFps || 60, ...dimensions };
    }}
  />
);
