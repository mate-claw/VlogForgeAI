import type { CaptionStyle, FontToken, OverlayType, SceneLayout, SceneTransition, SceneMotion, StickerType, VisualStyle, VisualStylePack } from '@ai-vlog/shared';

export type VisualStylePackSpec = {
  visualStyle: VisualStyle;
  fontToken: FontToken;
  titleFontToken: FontToken;
  captionFontToken: FontToken;
  accent: string;
  text: string;
  muted: string;
  captionBg: string;
  background: string;
  sceneBackdrop: string;
  openingVariant: 'warm' | 'cute' | 'rec' | 'cinematic' | 'food' | 'travel' | 'social' | 'minimal' | 'beat' | 'night';
  endingVariant: 'warm' | 'cute' | 'rec' | 'cinematic' | 'food' | 'travel' | 'social' | 'beat' | 'night';
  layouts: SceneLayout[];
  captionStyles: CaptionStyle[];
  stickers: StickerType[];
  overlays: OverlayType[];
  preferredMotions: SceneMotion[];
  preferredTransitions: SceneTransition[];
};

export const visualStylePacks: Record<VisualStylePack, VisualStylePackSpec> = {
  warm_family: {
    visualStyle: 'warm',
    fontToken: 'clean_sans',
    titleFontToken: 'rounded_cute',
    captionFontToken: 'clean_sans',
    accent: '#ffd39d',
    text: '#fff7ec',
    muted: 'rgba(255,244,232,.76)',
    captionBg: 'rgba(42,24,15,.56)',
    background: 'radial-gradient(circle at 22% 20%, rgba(255,204,141,.35), transparent 32%), linear-gradient(135deg,#24140f,#5b3425 50%,#a06b43)',
    sceneBackdrop: 'linear-gradient(180deg, rgba(0,0,0,.08), transparent 45%, rgba(0,0,0,.36))',
    openingVariant: 'warm',
    endingVariant: 'warm',
    layouts: ['vertical_crop', 'photo_card', 'memory_album'],
    captionStyles: ['warm_sentence', 'social_diary', 'date_caption'],
    stickers: ['home_label', 'heart'],
    overlays: ['warm_glow', 'soft_vignette'],
    preferredMotions: ['slow_zoom', 'calm_breathing'],
    preferredTransitions: ['fade', 'crossfade', 'soft_flash'],
  },
  cute_pet: {
    visualStyle: 'cute',
    fontToken: 'rounded_cute',
    titleFontToken: 'rounded_cute',
    captionFontToken: 'rounded_cute',
    accent: '#ff72b5',
    text: '#fff8fc',
    muted: 'rgba(67,43,75,.76)',
    captionBg: 'rgba(255,255,255,.88)',
    background: 'radial-gradient(circle at 18% 18%, rgba(255,255,255,.64), transparent 25%), radial-gradient(circle at 85% 72%, rgba(255,224,128,.40), transparent 34%), linear-gradient(135deg,#ffc1df,#a9e1ff 48%,#ffe8b7)',
    sceneBackdrop: 'linear-gradient(180deg, rgba(255,142,198,.18), transparent 50%, rgba(0,0,0,.25))',
    openingVariant: 'cute',
    endingVariant: 'cute',
    layouts: ['photo_card', 'polaroid', 'vertical_crop'],
    captionStyles: ['cute_bubble', 'speech_bubble', 'cute_short'],
    stickers: ['paw', 'heart', 'star', 'cute_label'],
    overlays: ['cute_pastel', 'soft_vignette'],
    preferredMotions: ['slow_zoom', 'gentle_pan'],
    preferredTransitions: ['soft_flash', 'crossfade', 'slide_left'],
  },
  kid_playful: {
    visualStyle: 'cute',
    fontToken: 'rounded_cute',
    titleFontToken: 'handwritten',
    captionFontToken: 'rounded_cute',
    accent: '#ffd45c',
    text: '#ffffff',
    muted: 'rgba(55,52,72,.76)',
    captionBg: 'rgba(255,255,255,.84)',
    background: 'radial-gradient(circle at 16% 15%, rgba(255,255,255,.70), transparent 25%), linear-gradient(135deg,#ffe2a8,#bfeeff 48%,#ffd1e5)',
    sceneBackdrop: 'linear-gradient(180deg, rgba(255,218,96,.15), transparent 50%, rgba(0,0,0,.26))',
    openingVariant: 'cute',
    endingVariant: 'cute',
    layouts: ['photo_card', 'vertical_crop', 'social_post'],
    captionStyles: ['cute_bubble', 'highlight_word', 'speech_bubble'],
    stickers: ['star', 'sun_cloud', 'heart'],
    overlays: ['bright_summer', 'cute_pastel'],
    preferredMotions: ['slow_zoom', 'gentle_pan'],
    preferredTransitions: ['crossfade', 'soft_flash'],
  },
  food_diary: {
    visualStyle: 'food',
    fontToken: 'food_label',
    titleFontToken: 'editorial',
    captionFontToken: 'food_label',
    accent: '#ffb15f',
    text: '#fff7ec',
    muted: 'rgba(255,234,210,.76)',
    captionBg: 'rgba(58,31,16,.62)',
    background: 'radial-gradient(circle at 72% 18%, rgba(255,196,121,.32), transparent 31%), linear-gradient(135deg,#2b1209,#6f3f2a 56%,#b7774c)',
    sceneBackdrop: 'linear-gradient(180deg, rgba(55,26,12,.22), transparent 45%, rgba(40,18,10,.48))',
    openingVariant: 'food',
    endingVariant: 'food',
    layouts: ['food_card', 'photo_card', 'vertical_crop'],
    captionStyles: ['food_label', 'warm_sentence', 'highlight_word'],
    stickers: ['food_label', 'cafe_label'],
    overlays: ['warm_glow', 'film_grain', 'soft_vignette'],
    preferredMotions: ['calm_breathing', 'cinematic_push'],
    preferredTransitions: ['blur_crossfade', 'fade', 'crossfade'],
  },
  city_rec: {
    visualStyle: 'city',
    fontToken: 'mono_rec',
    titleFontToken: 'mono_rec',
    captionFontToken: 'mono_rec',
    accent: '#9ecbff',
    text: '#f4f9ff',
    muted: 'rgba(232,243,255,.72)',
    captionBg: 'rgba(8,16,24,.64)',
    background: 'linear-gradient(135deg,#071018,#1c2935 50%,#53616f)',
    sceneBackdrop: 'linear-gradient(180deg, rgba(0,0,0,.22), transparent 48%, rgba(0,0,0,.54))',
    openingVariant: 'rec',
    endingVariant: 'rec',
    layouts: ['rec_camera', 'social_post', 'vertical_crop'],
    captionStyles: ['rec_bar', 'simple_record', 'location_caption'],
    stickers: ['rec_frame', 'timecode', 'city_label', 'progress_bar'],
    overlays: ['clean_modern', 'noise_texture', 'soft_vignette'],
    preferredMotions: ['gentle_pan', 'calm_breathing'],
    preferredTransitions: ['slide_left', 'crossfade', 'fade'],
  },
  travel_postcard: {
    visualStyle: 'travel',
    fontToken: 'travel_stamp',
    titleFontToken: 'editorial',
    captionFontToken: 'travel_stamp',
    accent: '#ffe19a',
    text: '#ffffff',
    muted: 'rgba(255,250,226,.76)',
    captionBg: 'rgba(21,45,54,.58)',
    background: 'radial-gradient(circle at 80% 16%, rgba(255,225,146,.28), transparent 35%), linear-gradient(135deg,#183748,#517867 48%,#c4aa72)',
    sceneBackdrop: 'linear-gradient(180deg, rgba(0,0,0,.10), transparent 50%, rgba(5,18,26,.46))',
    openingVariant: 'travel',
    endingVariant: 'travel',
    layouts: ['travel_postcard', 'cinematic_frame', 'vertical_crop'],
    captionStyles: ['travel_postcard', 'location_caption', 'cinematic_subtitle'],
    stickers: ['travel_label', 'polaroid_frame'],
    overlays: ['film_grain', 'light_leak', 'soft_vignette'],
    preferredMotions: ['cinematic_push', 'slow_zoom'],
    preferredTransitions: ['fade', 'blur_crossfade', 'light_leak'],
  },
  cinematic_memory: {
    visualStyle: 'cinematic',
    fontToken: 'cinematic_serif',
    titleFontToken: 'cinematic_serif',
    captionFontToken: 'clean_sans',
    accent: '#d8b987',
    text: '#fff8eb',
    muted: 'rgba(255,245,230,.70)',
    captionBg: 'rgba(0,0,0,.58)',
    background: 'radial-gradient(circle at 80% 18%, rgba(255,203,124,.20), transparent 34%), linear-gradient(135deg,#050505,#14110f 58%,#3d3023)',
    sceneBackdrop: 'linear-gradient(180deg, rgba(0,0,0,.50), transparent 36%, rgba(0,0,0,.74))',
    openingVariant: 'cinematic',
    endingVariant: 'cinematic',
    layouts: ['cinematic_frame', 'vertical_crop', 'memory_album'],
    captionStyles: ['cinematic_subtitle', 'cinematic_title', 'reflective'],
    stickers: ['audio_waveform', 'progress_bar'],
    overlays: ['cinematic_letterbox', 'film_grain', 'soft_vignette'],
    preferredMotions: ['cinematic_push', 'slow_zoom'],
    preferredTransitions: ['fade', 'blur_crossfade'],
  },
  minimal_clean: {
    visualStyle: 'minimal',
    fontToken: 'clean_sans',
    titleFontToken: 'clean_sans',
    captionFontToken: 'clean_sans',
    accent: '#e7e7e7',
    text: '#ffffff',
    muted: 'rgba(255,255,255,.68)',
    captionBg: 'rgba(0,0,0,.42)',
    background: 'linear-gradient(135deg,#0c0c0c,#2a2a2a)',
    sceneBackdrop: 'linear-gradient(180deg, rgba(0,0,0,.08), transparent 55%, rgba(0,0,0,.46))',
    openingVariant: 'minimal',
    endingVariant: 'social',
    layouts: ['vertical_crop', 'photo_card', 'social_post'],
    captionStyles: ['warm_sentence', 'social_caption', 'date_caption'],
    stickers: ['progress_bar'],
    overlays: ['clean_modern', 'soft_vignette'],
    preferredMotions: ['calm_breathing'],
    preferredTransitions: ['fade', 'crossfade'],
  },
  beat_highlight: {
    visualStyle: 'beat',
    fontToken: 'clean_sans',
    titleFontToken: 'clean_sans',
    captionFontToken: 'clean_sans',
    accent: '#ff3d8b',
    text: '#ffffff',
    muted: 'rgba(255,255,255,.75)',
    captionBg: 'rgba(0,0,0,.50)',
    background: 'radial-gradient(circle at 30% 10%, rgba(93,95,239,.45), transparent 28%), radial-gradient(circle at 85% 80%, rgba(255,64,129,.34), transparent 30%), linear-gradient(135deg,#050505,#161616)',
    sceneBackdrop: 'linear-gradient(180deg, rgba(0,0,0,.12), transparent 40%, rgba(0,0,0,.55))',
    openingVariant: 'beat',
    endingVariant: 'beat',
    layouts: ['split_screen', 'rec_camera', 'vertical_crop'],
    captionStyles: ['beat_punch', 'short_punchy', 'highlight_word'],
    stickers: ['progress_bar', 'audio_waveform', 'star'],
    overlays: ['high_contrast', 'noise_texture'],
    preferredMotions: ['beat_punch', 'focus_zoom'],
    preferredTransitions: ['white_flash', 'hard_cut', 'slide_left'],
  },
  night_mood: {
    visualStyle: 'night',
    fontToken: 'clean_sans',
    titleFontToken: 'cinematic_serif',
    captionFontToken: 'clean_sans',
    accent: '#b8c7ff',
    text: '#f3f5ff',
    muted: 'rgba(220,228,255,.72)',
    captionBg: 'rgba(5,8,28,.62)',
    background: 'radial-gradient(circle at 25% 12%, rgba(100,139,255,.28), transparent 32%), linear-gradient(135deg,#030514,#141a35 58%,#28305d)',
    sceneBackdrop: 'linear-gradient(180deg, rgba(0,0,0,.48), transparent 44%, rgba(0,0,0,.72))',
    openingVariant: 'night',
    endingVariant: 'night',
    layouts: ['cinematic_frame', 'vertical_crop', 'rec_camera'],
    captionStyles: ['cinematic_subtitle', 'reflective', 'location_caption'],
    stickers: ['night_label', 'timecode'],
    overlays: ['dark_night', 'film_grain', 'soft_vignette'],
    preferredMotions: ['calm_breathing', 'slow_zoom'],
    preferredTransitions: ['fade', 'blur_crossfade'],
  },
};

export function getVisualStylePackSpec(pack?: VisualStylePack): VisualStylePackSpec | undefined {
  return pack ? visualStylePacks[pack] : undefined;
}

export function pickStylePackForStyle(style: VisualStyle): VisualStylePack {
  switch (style) {
    case 'cute': return 'cute_pet';
    case 'food': return 'food_diary';
    case 'city':
    case 'rec': return 'city_rec';
    case 'travel': return 'travel_postcard';
    case 'cinematic': return 'cinematic_memory';
    case 'beat': return 'beat_highlight';
    case 'night': return 'night_mood';
    case 'minimal': return 'minimal_clean';
    case 'warm':
    case 'social':
    default: return 'warm_family';
  }
}
