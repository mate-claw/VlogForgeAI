import React from 'react';
import type { DirectorScene, TypographyDecision, VisualStyle, VisualStylePack } from '@ai-vlog/shared';
import { WarmSentenceCaption } from './WarmSentenceCaption';
import { CuteShortCaption } from './CuteShortCaption';
import { CinematicTitleCaption } from './CinematicTitleCaption';
import { BeatPunchCaption } from './BeatPunchCaption';
import { SocialCaption } from './SocialCaption';
import { RecCaption } from './RecCaption';
import { SpeechBubbleCaption } from './SpeechBubbleCaption';
import { KaraokeCaption } from './KaraokeCaption';
import { HighlightWordCaption } from './HighlightWordCaption';
import { EndingQuoteCaption } from './EndingQuoteCaption';
import { DateCaption } from './DateCaption';
import { LocationCaption } from './LocationCaption';
import { FoodLabelCaption } from './FoodLabelCaption';
import { TravelPostcardCaption } from './TravelPostcardCaption';

export const CaptionLayer: React.FC<{ scene: DirectorScene; typography: TypographyDecision; visualStyle?: VisualStyle; visualStylePack?: VisualStylePack }> = ({ scene, typography, visualStyle, visualStylePack }) => {
  const props = { scene, typography, visualStyle, visualStylePack };
  switch (scene.captionStyle) {
    case 'cute_short': return <CuteShortCaption {...props} />;
    case 'cute_bubble': return <SpeechBubbleCaption {...props} />;
    case 'cinematic_title': return <CinematicTitleCaption {...props} />;
    case 'cinematic_subtitle': return <CinematicTitleCaption {...props} />;
    case 'short_punchy': return <BeatPunchCaption {...props} />;
    case 'beat_punch': return <BeatPunchCaption {...props} />;
    case 'social_caption': return <SocialCaption {...props} />;
    case 'social_diary': return <SocialCaption {...props} />;
    case 'simple_record': return <RecCaption {...props} />;
    case 'rec_bar': return <RecCaption {...props} />;
    case 'speech_bubble': return <SpeechBubbleCaption {...props} />;
    case 'karaoke_caption': return <KaraokeCaption {...props} />;
    case 'highlight_word': return <HighlightWordCaption {...props} />;
    case 'food_label': return <FoodLabelCaption {...props} />;
    case 'travel_postcard': return <TravelPostcardCaption {...props} />;
    case 'reflective': return <EndingQuoteCaption text={scene.caption} typography={typography} />;
    case 'date_caption': return <DateCaption text={scene.caption} typography={typography} />;
    case 'location_caption': return <LocationCaption text={scene.caption} typography={typography} />;
    case 'warm_sentence':
    default: return <WarmSentenceCaption {...props} />;
  }
};
