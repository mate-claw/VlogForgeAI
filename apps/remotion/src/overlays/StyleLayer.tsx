import React from 'react';
import type { OverlayType, TypographyDecision, VisualStabilityMode, VisualStyle, VisualStylePack } from '@ai-vlog/shared';
import { WarmGlowLayer } from './WarmGlowLayer';
import { SoftVignetteLayer } from './SoftVignetteLayer';
import { CinematicLetterboxLayer } from './CinematicLetterboxLayer';
import { FilmGrainLayer } from './FilmGrainLayer';
import { LightLeakLayer } from './LightLeakLayer';
import { BokehOverlayLayer } from './BokehOverlayLayer';
import { DarkNightOverlayLayer } from './DarkNightOverlayLayer';
import { BrightSummerLayer } from './BrightSummerLayer';
import { CutePastelLayer } from './CutePastelLayer';
import { HighContrastBeatLayer } from './HighContrastBeatLayer';
import { CleanModernLayer } from './CleanModernLayer';
import { BlurBackdropLayer } from './BlurBackdropLayer';
import { NoiseTextureLayer } from './NoiseTextureLayer';
import { FlashOverlayLayer } from './FlashOverlayLayer';
import { GradientMoodLayer } from './GradientMoodLayer';

export const StyleLayer: React.FC<{
  overlays: OverlayType[];
  visualStyle: VisualStyle;
  typography: TypographyDecision;
  visualStylePack?: VisualStylePack;
  visualStabilityMode?: VisualStabilityMode;
}> = ({ overlays, visualStyle, typography, visualStabilityMode = 'stable' }) => (
  <>
    {overlays.slice(0, 5).map((o, i) => {
      const key = `${o}-${i}`;
      switch (o) {
        case 'warm_glow': return <WarmGlowLayer key={key} accent={typography.accentColor} />;
        case 'soft_vignette': return <SoftVignetteLayer key={key} />;
        case 'cinematic_letterbox': return <CinematicLetterboxLayer key={key} />;
        case 'film_grain': return <FilmGrainLayer key={key} />;
        case 'light_leak': return <LightLeakLayer key={key} accent={typography.accentColor} visualStabilityMode={visualStabilityMode} />;
        case 'bokeh': return <BokehOverlayLayer key={key} accent={typography.accentColor} visualStabilityMode={visualStabilityMode} />;
        case 'dark_night': return <DarkNightOverlayLayer key={key} />;
        case 'bright_summer': return <BrightSummerLayer key={key} />;
        case 'cute_pastel': return <CutePastelLayer key={key} />;
        case 'high_contrast': return <HighContrastBeatLayer key={key} />;
        case 'clean_modern': return <CleanModernLayer key={key} />;
        case 'blur_backdrop': return <BlurBackdropLayer key={key} />;
        case 'noise_texture': return <NoiseTextureLayer key={key} />;
        case 'flash_overlay':
        case 'flash': return visualStabilityMode === 'dynamic' ? <FlashOverlayLayer key={key} /> : null;
        case 'gradient_mood': return <GradientMoodLayer key={key} visualStyle={visualStyle} />;
        default: return null;
      }
    })}
  </>
);
