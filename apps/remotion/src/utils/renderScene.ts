import type { CaptionStyle, DirectorScene, OverlayType, SceneLayout, StickerType, VisualStabilityMode, VisualStylePack } from '@ai-vlog/shared';

const limit = <T,>(items: T[] | undefined, max = 3) => (items || []).filter(Boolean).slice(0, max);
const prefer = <T extends string>(value: T | undefined, allowed: readonly T[], fallback: T): T => value && allowed.includes(value) ? value : fallback;

const packLayouts: Record<VisualStylePack, readonly SceneLayout[]> = {
  food_diary: ['food_card', 'vertical_crop'],
  city_rec: ['rec_camera', 'vertical_crop'],
  travel_postcard: ['cinematic_frame', 'travel_postcard', 'vertical_crop'],
  kid_playful: ['photo_card', 'vertical_crop'],
  cute_pet: ['photo_card', 'vertical_crop'],
  warm_family: ['vertical_crop', 'photo_card'],
  night_mood: ['cinematic_frame', 'vertical_crop'],
  cinematic_memory: ['cinematic_frame', 'vertical_crop'],
  minimal_clean: ['vertical_crop', 'social_post'],
  beat_highlight: ['vertical_crop', 'rec_camera'],
};

const packCaptions: Record<VisualStylePack, readonly CaptionStyle[]> = {
  food_diary: ['food_label', 'warm_sentence', 'cinematic_subtitle'],
  city_rec: ['rec_bar', 'simple_record', 'social_diary'],
  travel_postcard: ['travel_postcard', 'cinematic_subtitle'],
  kid_playful: ['cute_bubble', 'cute_short', 'warm_sentence'],
  cute_pet: ['cute_bubble', 'cute_short'],
  warm_family: ['warm_sentence', 'social_diary'],
  night_mood: ['cinematic_subtitle', 'reflective'],
  cinematic_memory: ['cinematic_subtitle', 'warm_sentence'],
  minimal_clean: ['social_diary', 'warm_sentence'],
  beat_highlight: ['beat_punch', 'short_punchy'],
};

const packStickers: Record<VisualStylePack, readonly StickerType[]> = {
  food_diary: ['food_label', 'cafe_label', 'heart', 'hand_drawn_circle'],
  city_rec: ['rec_frame', 'timecode', 'progress_bar', 'city_label'],
  travel_postcard: ['travel_label', 'polaroid_frame', 'heart'],
  kid_playful: ['heart', 'star', 'sun_cloud', 'emoji'],
  cute_pet: ['paw', 'heart', 'star', 'cute_label'],
  warm_family: ['heart', 'home_label', 'good_day'],
  night_mood: ['night_label'],
  cinematic_memory: ['travel_label', 'heart'],
  minimal_clean: ['good_day'],
  beat_highlight: ['progress_bar', 'audio_waveform', 'star'],
};

const packOverlays: Record<VisualStylePack, readonly OverlayType[]> = {
  food_diary: ['warm_glow', 'soft_vignette'],
  city_rec: ['clean_modern'],
  travel_postcard: ['cinematic_letterbox', 'film_grain', 'soft_vignette'],
  kid_playful: ['bright_summer', 'warm_glow'],
  cute_pet: ['cute_pastel', 'warm_glow'],
  warm_family: ['warm_glow', 'soft_vignette'],
  night_mood: ['dark_night', 'film_grain'],
  cinematic_memory: ['cinematic_letterbox', 'film_grain'],
  minimal_clean: ['clean_modern'],
  beat_highlight: ['high_contrast'],
};

export function resolveSceneForRender(scene: DirectorScene, pack: VisualStylePack | undefined, mode: VisualStabilityMode): DirectorScene {
  if (!pack) return scene;
  const allowedLayouts = packLayouts[pack];
  const allowedCaptions = packCaptions[pack];
  const allowedStickers = packStickers[pack];
  const allowedOverlays = packOverlays[pack];
  const next: DirectorScene = { ...scene };

  if (mode === 'stable') {
    next.layout = prefer(next.layout, allowedLayouts, allowedLayouts[0]);
    next.captionStyle = prefer(next.captionStyle, allowedCaptions, allowedCaptions[0]);
    next.stickers = limit((next.stickers || []).filter((s) => allowedStickers.includes(s)), 2);
    if (!next.stickers.length) next.stickers = limit([...allowedStickers], 2);
    next.overlays = limit((next.overlays || []).filter((o) => allowedOverlays.includes(o)), 2);
    if (!next.overlays.length) next.overlays = limit([...allowedOverlays], 2);
  }

  if (pack === 'food_diary' && mode === 'stable') {
    // Food/cafe videos should not jump between social cards and photo cards scene-to-scene.
    // Keep a consistent food-card language; the AI still controls the story and captions.
    next.layout = 'food_card';
    next.captionStyle = next.captionStyle === 'cinematic_subtitle' ? 'cinematic_subtitle' : 'food_label';
  }

  if (pack === 'city_rec' && mode === 'stable') {
    next.layout = 'rec_camera';
    next.captionStyle = 'rec_bar';
  }

  if (pack === 'travel_postcard' && mode === 'stable') {
    next.layout = next.sceneType === 'travel' ? 'cinematic_frame' : prefer(next.layout, allowedLayouts, 'cinematic_frame');
    next.captionStyle = next.captionStyle === 'cinematic_subtitle' ? 'cinematic_subtitle' : 'travel_postcard';
  }

  return next;
}
