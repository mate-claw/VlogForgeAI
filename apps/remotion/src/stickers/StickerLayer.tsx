import React from 'react';
import type { StickerType, TypographyDecision, VisualStabilityMode, VisualStyle, VisualStylePack } from '@ai-vlog/shared';
import { RecFrameSticker } from './RecFrameSticker';
import { ProgressBarSticker } from './ProgressBarSticker';
import { HeartSticker } from './HeartSticker';
import { StarSticker } from './StarSticker';
import { PawSticker } from './PawSticker';
import { SunCloudSticker } from './SunCloudSticker';
import { HomeLabelSticker } from './HomeLabelSticker';
import { FoodLabelSticker } from './FoodLabelSticker';
import { CafeLabelSticker } from './CafeLabelSticker';
import { TravelLabelSticker } from './TravelLabelSticker';
import { CityLabelSticker } from './CityLabelSticker';
import { WeekendSticker } from './WeekendSticker';
import { NightLabelSticker } from './NightLabelSticker';
import { GoodDaySticker } from './GoodDaySticker';
import { CuteLabelSticker } from './CuteLabelSticker';
import { AnimatedEmojiSticker } from './AnimatedEmojiSticker';
import { HandDrawnCircleSticker } from './HandDrawnCircleSticker';
import { ArrowPointerSticker } from './ArrowPointerSticker';
import { PolaroidFrameSticker } from './PolaroidFrameSticker';
import { TimecodeSticker } from './TimecodeSticker';
import { AudioWaveformSticker } from './AudioWaveformSticker';

function limitStickersForPack(stickers: StickerType[], pack?: VisualStylePack) {
  const allowedByPack: Partial<Record<VisualStylePack, StickerType[]>> = {
    cute_pet: ['paw', 'heart', 'star', 'cute_label', 'emoji'],
    kid_playful: ['star', 'sun_cloud', 'heart', 'emoji'],
    food_diary: ['food_label', 'cafe_label'],
    city_rec: ['rec_frame', 'timecode', 'city_label', 'progress_bar'],
    travel_postcard: ['travel_label', 'polaroid_frame'],
    cinematic_memory: ['progress_bar', 'audio_waveform'],
    night_mood: ['night_label', 'timecode'],
    warm_family: ['home_label', 'heart', 'weekend'],
    minimal_clean: ['progress_bar'],
    beat_highlight: ['progress_bar', 'audio_waveform', 'star'],
  };
  const allowed = pack ? allowedByPack[pack] : undefined;
  const filtered = allowed ? stickers.filter((s) => allowed.includes(s)) : stickers;
  return filtered.slice(0, pack === 'city_rec' ? 4 : 3);
}

export const StickerLayer: React.FC<{ stickers: StickerType[]; progress?: number; typography: TypographyDecision; visualStyle?: VisualStyle; visualStylePack?: VisualStylePack; visualStabilityMode?: VisualStabilityMode }> = ({ stickers, progress = 0, typography, visualStyle = 'warm', visualStylePack, visualStabilityMode = 'stable' }) => (
  <>
    {limitStickersForPack(stickers || [], visualStylePack).map((type, index) => {
      const key = `${type}-${index}`;
      switch (type) {
        case 'rec_frame': return <RecFrameSticker key={key} />;
        case 'progress_bar': return <ProgressBarSticker key={key} progress={progress} accent={typography.accentColor} />;
        case 'heart': return <HeartSticker key={key} index={index} color={typography.accentColor} visualStabilityMode={visualStabilityMode} />;
        case 'star': return <StarSticker key={key} index={index} color={typography.accentColor} visualStabilityMode={visualStabilityMode} />;
        case 'paw': return <PawSticker key={key} index={index} visualStabilityMode={visualStabilityMode} />;
        case 'sun_cloud': return <SunCloudSticker key={key} />;
        case 'home_label': return <HomeLabelSticker key={key} />;
        case 'food_label': return <FoodLabelSticker key={key} />;
        case 'cafe_label': return <CafeLabelSticker key={key} />;
        case 'travel_label': return <TravelLabelSticker key={key} />;
        case 'city_label': return <CityLabelSticker key={key} />;
        case 'weekend': return <WeekendSticker key={key} />;
        case 'night_label': return <NightLabelSticker key={key} />;
        case 'good_day': return visualStylePack === 'warm_family' ? <GoodDaySticker key={key} /> : null;
        case 'cute_label': return <CuteLabelSticker key={key} />;
        case 'emoji': return <AnimatedEmojiSticker key={key} visualStyle={visualStyle} index={index} visualStabilityMode={visualStabilityMode} />;
        case 'hand_drawn_circle': return <HandDrawnCircleSticker key={key} color={typography.accentColor} />;
        case 'arrow_pointer': return <ArrowPointerSticker key={key} color={typography.accentColor} />;
        case 'polaroid_frame': return <PolaroidFrameSticker key={key} />;
        case 'timecode': return <TimecodeSticker key={key} />;
        case 'audio_waveform': return <AudioWaveformSticker key={key} color={typography.accentColor} />;
        default: return null;
      }
    })}
  </>
);
