import type { CaptionStyle, FontToken, OverlayType, SceneLayout, SceneMotion, SceneTransition, StickerType, VisualStyle, VisualStylePack, VlogPlan } from '@ai-vlog/shared';

const packDefaults: Record<VisualStylePack, { visualStyle: VisualStyle; fontToken: FontToken; titleFontToken: FontToken; captionFontToken: FontToken; accentColor: string; textColor: string; captionBgColor: string }> = {
  warm_family: { visualStyle: 'warm', fontToken: 'clean_sans', titleFontToken: 'rounded_cute', captionFontToken: 'clean_sans', accentColor: '#ffd39d', textColor: '#ffffff', captionBgColor: 'rgba(42,24,15,.46)' },
  cute_pet: { visualStyle: 'cute', fontToken: 'rounded_cute', titleFontToken: 'rounded_cute', captionFontToken: 'rounded_cute', accentColor: '#ff6fae', textColor: '#fff8fc', captionBgColor: 'rgba(255,255,255,.30)' },
  kid_playful: { visualStyle: 'cute', fontToken: 'rounded_cute', titleFontToken: 'handwritten', captionFontToken: 'rounded_cute', accentColor: '#ffd45c', textColor: '#ffffff', captionBgColor: 'rgba(255,255,255,.26)' },
  food_diary: { visualStyle: 'food', fontToken: 'food_label', titleFontToken: 'editorial', captionFontToken: 'food_label', accentColor: '#ffb15f', textColor: '#fff7ec', captionBgColor: 'rgba(55,27,12,.50)' },
  city_rec: { visualStyle: 'city', fontToken: 'mono_rec', titleFontToken: 'mono_rec', captionFontToken: 'mono_rec', accentColor: '#9ecbff', textColor: '#f4f9ff', captionBgColor: 'rgba(8,16,24,.50)' },
  travel_postcard: { visualStyle: 'travel', fontToken: 'travel_stamp', titleFontToken: 'editorial', captionFontToken: 'travel_stamp', accentColor: '#ffe19a', textColor: '#ffffff', captionBgColor: 'rgba(21,45,54,.48)' },
  cinematic_memory: { visualStyle: 'cinematic', fontToken: 'cinematic_serif', titleFontToken: 'cinematic_serif', captionFontToken: 'clean_sans', accentColor: '#d8b987', textColor: '#fff8eb', captionBgColor: 'rgba(0,0,0,.50)' },
  minimal_clean: { visualStyle: 'minimal', fontToken: 'clean_sans', titleFontToken: 'clean_sans', captionFontToken: 'clean_sans', accentColor: '#e7e7e7', textColor: '#ffffff', captionBgColor: 'rgba(0,0,0,.36)' },
  beat_highlight: { visualStyle: 'beat', fontToken: 'clean_sans', titleFontToken: 'clean_sans', captionFontToken: 'clean_sans', accentColor: '#ff3d8b', textColor: '#ffffff', captionBgColor: 'rgba(0,0,0,.42)' },
  night_mood: { visualStyle: 'night', fontToken: 'clean_sans', titleFontToken: 'cinematic_serif', captionFontToken: 'clean_sans', accentColor: '#b8c7ff', textColor: '#f3f5ff', captionBgColor: 'rgba(5,8,28,.52)' },
};

const packRules: Record<VisualStylePack, { layouts: SceneLayout[]; captionStyles: CaptionStyle[]; stickers: StickerType[]; overlays: OverlayType[]; motions: SceneMotion[]; transitions: SceneTransition[] }> = {
  warm_family: { layouts: ['vertical_crop', 'photo_card', 'memory_album'], captionStyles: ['warm_sentence', 'social_diary', 'date_caption'], stickers: ['home_label', 'heart', 'weekend'], overlays: ['warm_glow', 'soft_vignette'], motions: ['slow_zoom', 'calm_breathing', 'still'], transitions: ['fade', 'crossfade', 'soft_flash'] },
  cute_pet: { layouts: ['photo_card', 'polaroid', 'vertical_crop'], captionStyles: ['cute_bubble', 'speech_bubble', 'cute_short'], stickers: ['paw', 'heart', 'star', 'cute_label'], overlays: ['cute_pastel', 'soft_vignette'], motions: ['slow_zoom', 'gentle_pan', 'still'], transitions: ['soft_flash', 'crossfade', 'slide_left'] },
  kid_playful: { layouts: ['photo_card', 'vertical_crop', 'social_post'], captionStyles: ['cute_bubble', 'highlight_word', 'speech_bubble'], stickers: ['star', 'sun_cloud', 'heart'], overlays: ['bright_summer', 'cute_pastel'], motions: ['slow_zoom', 'gentle_pan', 'still'], transitions: ['crossfade', 'soft_flash'] },
  food_diary: { layouts: ['food_card', 'photo_card', 'vertical_crop'], captionStyles: ['food_label', 'warm_sentence', 'highlight_word'], stickers: ['food_label', 'cafe_label'], overlays: ['warm_glow', 'film_grain', 'soft_vignette'], motions: ['calm_breathing', 'cinematic_push', 'still'], transitions: ['blur_crossfade', 'fade', 'crossfade'] },
  city_rec: { layouts: ['rec_camera', 'social_post', 'vertical_crop'], captionStyles: ['rec_bar', 'simple_record', 'location_caption'], stickers: ['rec_frame', 'timecode', 'city_label', 'progress_bar'], overlays: ['clean_modern', 'noise_texture', 'soft_vignette'], motions: ['gentle_pan', 'calm_breathing', 'still'], transitions: ['slide_left', 'crossfade', 'fade'] },
  travel_postcard: { layouts: ['travel_postcard', 'cinematic_frame', 'vertical_crop'], captionStyles: ['travel_postcard', 'location_caption', 'cinematic_subtitle'], stickers: ['travel_label', 'polaroid_frame'], overlays: ['film_grain', 'light_leak', 'soft_vignette'], motions: ['cinematic_push', 'slow_zoom', 'still'], transitions: ['fade', 'blur_crossfade', 'light_leak'] },
  cinematic_memory: { layouts: ['cinematic_frame', 'vertical_crop', 'memory_album'], captionStyles: ['cinematic_subtitle', 'cinematic_title', 'reflective'], stickers: ['audio_waveform', 'progress_bar'], overlays: ['cinematic_letterbox', 'film_grain', 'soft_vignette'], motions: ['cinematic_push', 'slow_zoom', 'still'], transitions: ['fade', 'blur_crossfade'] },
  minimal_clean: { layouts: ['vertical_crop', 'photo_card', 'social_post'], captionStyles: ['warm_sentence', 'social_caption', 'date_caption'], stickers: ['progress_bar'], overlays: ['clean_modern', 'soft_vignette'], motions: ['calm_breathing', 'still'], transitions: ['fade', 'crossfade'] },
  beat_highlight: { layouts: ['split_screen', 'rec_camera', 'vertical_crop'], captionStyles: ['beat_punch', 'short_punchy', 'highlight_word'], stickers: ['progress_bar', 'audio_waveform', 'star'], overlays: ['high_contrast', 'noise_texture'], motions: ['beat_punch', 'focus_zoom', 'still'], transitions: ['white_flash', 'hard_cut', 'slide_left'] },
  night_mood: { layouts: ['cinematic_frame', 'vertical_crop', 'rec_camera'], captionStyles: ['cinematic_subtitle', 'reflective', 'location_caption'], stickers: ['night_label', 'timecode'], overlays: ['dark_night', 'film_grain', 'soft_vignette'], motions: ['calm_breathing', 'slow_zoom', 'still'], transitions: ['fade', 'blur_crossfade'] },
};

function inferPackFromScenes(plan: VlogPlan): VisualStylePack {
  const score: Record<VisualStylePack, number> = Object.fromEntries(Object.keys(packDefaults).map((k) => [k, 0])) as Record<VisualStylePack, number>;
  const add = (pack: VisualStylePack, n = 1) => { score[pack] += n; };
  for (const scene of plan.scenes) {
    const h = [scene.sceneType, scene.role, scene.caption, ...(scene.stickers || []), ...(scene.overlays || [])].join(' ').toLowerCase();
    if (/(pet|dog|cat|paw|宠物|狗|猫)/.test(h)) add('cute_pet', 5);
    if (/(kid|child|baby|娃|孩子|亲子|宝宝|儿童)/.test(h)) add('kid_playful', 4);
    if (/(food|meal|cafe|coffee|restaurant|kitchen|吃|饭|餐|咖啡|厨房|切菜|沙拉)/.test(h)) add('food_diary', 5);
    if (/(city|street|commute|urban|城市|街|通勤|脚步|地铁)/.test(h)) add('city_rec', 5);
    if (/(travel|trip|river|boat|mountain|waterfall|旅行|风景|河|船|山|瀑布|湖)/.test(h)) add('travel_postcard', 5);
    if (/(night|dark|neon|夜|霓虹)/.test(h)) add('night_mood', 5);
    if (/(family|home|家|周末)/.test(h)) add('warm_family', 2);
  }
  if (plan.visualStylePack) score[plan.visualStylePack] += 1;
  return (Object.entries(score) as Array<[VisualStylePack, number]>).sort((a, b) => b[1] - a[1])[0][0] || plan.visualStylePack || 'warm_family';
}

export function sanitizeVisualStyleForRender(plan: VlogPlan): { plan: VlogPlan; report: { originalPack?: VisualStylePack; resolvedPack: VisualStylePack; changed: boolean } } {
  const resolvedPack = inferPackFromScenes(plan);
  const defaults = packDefaults[resolvedPack];
  const rules = packRules[resolvedPack];
  const choose = <T,>(items: T[], current: T, index: number) => items.includes(current) ? current : (items[index % items.length] || current);
  const scenes = plan.scenes.map((scene, index) => ({
    ...scene,
    layout: choose(rules.layouts, scene.layout, index),
    captionStyle: choose(rules.captionStyles, scene.captionStyle, index),
    fontToken: defaults.captionFontToken,
    stickers: (scene.stickers || []).filter((s) => rules.stickers.includes(s)).slice(0, 3).length
      ? (scene.stickers || []).filter((s) => rules.stickers.includes(s)).slice(0, 3)
      : rules.stickers.slice(0, Math.min(2, rules.stickers.length)),
    overlays: (scene.overlays || []).filter((o) => rules.overlays.includes(o)).slice(0, 4).length
      ? (scene.overlays || []).filter((o) => rules.overlays.includes(o)).slice(0, 4)
      : rules.overlays.slice(0, Math.min(3, rules.overlays.length)),
    motion: choose(rules.motions, scene.motion, index),
    transitionIn: choose(rules.transitions, scene.transitionIn, index),
  }));
  return {
    plan: {
      ...plan,
      visualStyle: defaults.visualStyle,
      visualStylePack: resolvedPack,
      typography: {
        ...plan.typography,
        fontToken: defaults.fontToken,
        titleFontToken: defaults.titleFontToken,
        captionFontToken: defaults.captionFontToken,
        accentColor: plan.typography.accentColor || defaults.accentColor,
        textColor: plan.typography.textColor || defaults.textColor,
        captionBgColor: plan.typography.captionBgColor || defaults.captionBgColor,
      },
      opening: { ...plan.opening, stickers: (plan.opening.stickers || []).filter((s) => rules.stickers.includes(s)).slice(0, 3), overlays: (plan.opening.overlays || []).filter((o) => rules.overlays.includes(o)).slice(0, 3) },
      ending: { ...plan.ending, stickers: (plan.ending.stickers || []).filter((s) => rules.stickers.includes(s)).slice(0, 3), overlays: (plan.ending.overlays || []).filter((o) => rules.overlays.includes(o)).slice(0, 3) },
      scenes,
      clips: scenes,
    },
    report: { originalPack: plan.visualStylePack, resolvedPack, changed: plan.visualStylePack !== resolvedPack },
  };
}
