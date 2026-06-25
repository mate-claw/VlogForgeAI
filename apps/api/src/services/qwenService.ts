import fs from 'node:fs';
import path from 'node:path';
import type {
  AssetAnalysis,
  CaptionStyle,
  DirectorRevisionSuggestion,
  DirectorScene,
  EndingDecision,
  EndingType,
  FontToken,
  OpeningDecision,
  OpeningType,
  OverlayType,
  SceneLayout,
  SceneMotion,
  SceneRole,
  SceneTransition,
  StickerType,
  TypographyDecision,
  UploadedAsset,
  VisualStyle,
  VisualStylePack,
  VisualStabilityMode,
  VlogPace,
  VlogPlan,
  VlogQualityEvaluation,
  UserPreferenceProfile,
} from '@ai-vlog/shared';
import { config } from '../config';
import { extractVideoFrames, toDataUrl } from '../utils/mediaUtils';
import { getBgmById, listBgms } from './bgmCatalog';

type QwenMessage = { role: 'system' | 'user' | 'assistant'; content: any };
type RevisionRequest = DirectorRevisionSuggestion | string;

const visualStyles: VisualStyle[] = ['warm', 'rec', 'cute', 'cinematic', 'beat', 'social', 'food', 'night', 'travel', 'city', 'minimal'];
const visualStylePacks: VisualStylePack[] = ['warm_family', 'cute_pet', 'kid_playful', 'food_diary', 'city_rec', 'travel_postcard', 'cinematic_memory', 'minimal_clean', 'beat_highlight', 'night_mood'];
const fontTokens: FontToken[] = ['rounded_cute', 'clean_sans', 'cinematic_serif', 'handwritten', 'mono_rec', 'editorial', 'food_label', 'travel_stamp'];
const paces: VlogPace[] = ['slow', 'medium_slow', 'slow_medium', 'medium', 'medium_fast', 'fast'];
const roles: SceneRole[] = ['opening', 'context', 'build', 'detail', 'interaction', 'highlight', 'emotion_peak', 'funny', 'quiet', 'travel', 'food', 'pet', 'kid', 'city', 'night', 'ending'];
const transitions: SceneTransition[] = ['hard_cut', 'fade', 'crossfade', 'soft_flash', 'white_flash', 'slide_left', 'slide_right', 'wipe', 'zoom_in', 'blur_crossfade', 'film_burn', 'light_leak', 'camera_shutter', 'swipe_card'];
const motions: SceneMotion[] = ['still', 'slow_zoom', 'gentle_pan', 'focus_zoom', 'handheld_rec', 'beat_punch', 'cute_bounce', 'cinematic_push', 'photo_ken_burns', 'freeze_pulse', 'parallax_photo', 'micro_shake', 'calm_breathing'];
const captionStyles: CaptionStyle[] = ['warm_sentence', 'simple_record', 'cute_short', 'cute_bubble', 'cinematic_title', 'cinematic_subtitle', 'short_punchy', 'beat_punch', 'reflective', 'social_caption', 'social_diary', 'speech_bubble', 'karaoke_caption', 'highlight_word', 'date_caption', 'location_caption', 'food_label', 'travel_postcard', 'rec_bar'];
const layouts: SceneLayout[] = ['vertical_crop', 'blur_background', 'photo_card', 'polaroid', 'split_screen', 'mosaic_grid', 'picture_in_picture', 'social_post', 'cinematic_frame', 'rec_camera', 'food_card', 'travel_postcard', 'memory_album'];
const stickerTypes: StickerType[] = ['rec_frame', 'progress_bar', 'heart', 'star', 'paw', 'sun_cloud', 'home_label', 'food_label', 'cafe_label', 'travel_label', 'city_label', 'weekend', 'night_label', 'good_day', 'cute_label', 'emoji', 'hand_drawn_circle', 'arrow_pointer', 'polaroid_frame', 'timecode', 'audio_waveform'];
const overlays: OverlayType[] = ['warm_glow', 'soft_vignette', 'cinematic_letterbox', 'film_grain', 'light_leak', 'bokeh', 'dark_night', 'bright_summer', 'cute_pastel', 'high_contrast', 'clean_modern', 'blur_backdrop', 'noise_texture', 'flash_overlay', 'flash', 'gradient_mood'];

const emotions = ['warm', 'cute', 'dynamic', 'cinematic', 'calm', 'food', 'city', 'night', 'pet', 'family', 'travel', 'unknown'] as const;
const titlePositions = ['top', 'center', 'bottom'] as const;
const textAnimations = ['fade_up', 'typewriter', 'pop', 'slide', 'none'] as const;
const openingTypes: OpeningType[] = ['title_card', 'photo_cover', 'blur_video_cover', 'minimal_text', 'rec_opening', 'date_opening', 'warm_title', 'cute_pop', 'cinematic_credit', 'social_story', 'travel_stamp', 'food_menu', 'city_flash', 'beat_flash'];
const endingStyles: EndingType[] = ['warm_quote', 'cinematic_credit', 'cute_card', 'social_note', 'rec_done', 'beat_end', 'memory_saved', 'hashtag_end', 'travel_stamp', 'food_receipt', 'city_signoff'];
const sceneTypes = ['life', 'pet', 'kid', 'family', 'food', 'city', 'travel', 'night', 'home', 'outdoor', 'unknown'] as const;
const emphasisTypes = ['normal', 'soft', 'strong'] as const;
const visualStabilityModes: VisualStabilityMode[] = ['stable', 'balanced', 'dynamic'];
const unstableMotions: SceneMotion[] = ['micro_shake', 'handheld_rec', 'beat_punch', 'freeze_pulse'];

const packVisualRules: Record<VisualStylePack, {
  layouts: SceneLayout[];
  captionStyles: CaptionStyle[];
  stickers: StickerType[];
  overlays: OverlayType[];
  motions: SceneMotion[];
  transitions: SceneTransition[];
}> = {
  warm_family: { layouts: ['vertical_crop', 'photo_card', 'memory_album'], captionStyles: ['warm_sentence', 'social_diary', 'date_caption'], stickers: ['home_label', 'heart', 'weekend'], overlays: ['warm_glow', 'soft_vignette'], motions: ['slow_zoom', 'calm_breathing'], transitions: ['fade', 'crossfade', 'soft_flash'] },
  cute_pet: { layouts: ['photo_card', 'polaroid', 'vertical_crop'], captionStyles: ['cute_bubble', 'speech_bubble', 'cute_short'], stickers: ['paw', 'heart', 'star', 'cute_label'], overlays: ['cute_pastel', 'soft_vignette'], motions: ['slow_zoom', 'gentle_pan'], transitions: ['soft_flash', 'crossfade', 'slide_left'] },
  kid_playful: { layouts: ['photo_card', 'vertical_crop', 'social_post'], captionStyles: ['cute_bubble', 'highlight_word', 'speech_bubble'], stickers: ['star', 'sun_cloud', 'heart'], overlays: ['bright_summer', 'cute_pastel'], motions: ['slow_zoom', 'gentle_pan'], transitions: ['crossfade', 'soft_flash'] },
  food_diary: { layouts: ['food_card', 'photo_card', 'vertical_crop'], captionStyles: ['food_label', 'warm_sentence', 'highlight_word'], stickers: ['food_label', 'cafe_label'], overlays: ['warm_glow', 'film_grain', 'soft_vignette'], motions: ['calm_breathing', 'cinematic_push'], transitions: ['blur_crossfade', 'fade', 'crossfade'] },
  city_rec: { layouts: ['rec_camera', 'social_post', 'vertical_crop'], captionStyles: ['rec_bar', 'simple_record', 'location_caption'], stickers: ['rec_frame', 'timecode', 'city_label', 'progress_bar'], overlays: ['clean_modern', 'noise_texture', 'soft_vignette'], motions: ['gentle_pan', 'calm_breathing'], transitions: ['slide_left', 'crossfade', 'fade'] },
  travel_postcard: { layouts: ['travel_postcard', 'cinematic_frame', 'vertical_crop'], captionStyles: ['travel_postcard', 'location_caption', 'cinematic_subtitle'], stickers: ['travel_label', 'polaroid_frame'], overlays: ['film_grain', 'light_leak', 'soft_vignette'], motions: ['cinematic_push', 'slow_zoom'], transitions: ['fade', 'blur_crossfade', 'light_leak'] },
  cinematic_memory: { layouts: ['cinematic_frame', 'vertical_crop', 'memory_album'], captionStyles: ['cinematic_subtitle', 'cinematic_title', 'reflective'], stickers: ['audio_waveform', 'progress_bar'], overlays: ['cinematic_letterbox', 'film_grain', 'soft_vignette'], motions: ['cinematic_push', 'slow_zoom'], transitions: ['fade', 'blur_crossfade'] },
  minimal_clean: { layouts: ['vertical_crop', 'photo_card', 'social_post'], captionStyles: ['warm_sentence', 'social_caption', 'date_caption'], stickers: ['progress_bar'], overlays: ['clean_modern', 'soft_vignette'], motions: ['calm_breathing'], transitions: ['fade', 'crossfade'] },
  beat_highlight: { layouts: ['split_screen', 'rec_camera', 'vertical_crop'], captionStyles: ['beat_punch', 'short_punchy', 'highlight_word'], stickers: ['progress_bar', 'audio_waveform', 'star'], overlays: ['high_contrast', 'noise_texture'], motions: ['beat_punch', 'focus_zoom'], transitions: ['white_flash', 'hard_cut', 'slide_left'] },
  night_mood: { layouts: ['cinematic_frame', 'vertical_crop', 'rec_camera'], captionStyles: ['cinematic_subtitle', 'reflective', 'location_caption'], stickers: ['night_label', 'timecode'], overlays: ['dark_night', 'film_grain', 'soft_vignette'], motions: ['calm_breathing', 'slow_zoom'], transitions: ['fade', 'blur_crossfade'] },
};

function requireQwenKey() {
  if (!config.qwenApiKey || config.mockQwen) {
    throw new Error('当前版本已移除固定兜底文案和 MOCK 生成。请在 .env 配置 QWEN_API_KEY，并设置 MOCK_QWEN=false。');
  }
}

async function qwenChat(params: {
  model: string;
  messages: QwenMessage[];
  temperature?: number;
  responseFormatJson?: boolean;
}) {
  requireQwenKey();
  const url = `${config.qwenBaseUrl.replace(/\/$/, '')}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.qwenApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.5,
      ...(params.responseFormatJson ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Qwen API 调用失败 ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}


function removeDanglingStringTail(text: string): string {
  let inString = false;
  let escaped = false;
  let lastStringStart = -1;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      if (inString) lastStringStart = i;
    }
  }
  return inString && lastStringStart >= 0 ? text.slice(0, lastStringStart).replace(/,?\s*$/, '') : text;
}

function closeOpenJsonStructures(text: string): string {
  let inString = false;
  let escaped = false;
  const stack: string[] = [];
  for (const char of text) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === '{') stack.push('}');
    else if (char === '[') stack.push(']');
    else if ((char === '}' || char === ']') && stack[stack.length - 1] === char) stack.pop();
  }
  let repaired = text;
  while (stack.length) repaired += stack.pop();
  return repaired;
}

function looksLikeObjectKey(text: string, index: number): boolean {
  if (text[index] !== '"') return false;
  let escaped = false;
  for (let i = index + 1; i < text.length; i += 1) {
    const char = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') return /^\s*:/.test(text.slice(i + 1));
  }
  return false;
}

function repairAtParseError(text: string, error: unknown): string | undefined {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/position\s+(\d+)/i);
  if (!match) return undefined;
  const position = Number(match[1]);
  if (!Number.isFinite(position) || position <= 0 || position >= text.length) return undefined;
  const nextOffset = text.slice(position).search(/\S/);
  if (nextOffset < 0) return undefined;
  const insertAt = position + nextOffset;
  const prevMatch = text.slice(0, insertAt).match(/\S(?=\s*$)/);
  const previous = prevMatch?.[0];
  const next = text[insertAt];
  if (!previous) return undefined;
  if ((previous === '}' || previous === ']' || previous === '"' || /\d/.test(previous)) && next === '{') {
    return text.slice(0, insertAt) + ',' + text.slice(insertAt);
  }
  if ((previous === '}' || previous === ']') && looksLikeObjectKey(text, insertAt)) {
    return text.slice(0, insertAt) + '],' + text.slice(insertAt);
  }
  if ((previous === '"' || /\d/.test(previous)) && looksLikeObjectKey(text, insertAt)) {
    return text.slice(0, insertAt) + ',' + text.slice(insertAt);
  }
  return undefined;
}

function repairModelJson(text: string): string {
  return closeOpenJsonStructures(removeDanglingStringTail(text.trim())
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/}\s*{/g, '},{')
    .replace(/]\s*\[/g, '],[')
    .replace(/("[^"]+"\s*:\s*\[[\s\S]*?\})(\s*"[^"]+"\s*:)/g, '$1],$2')
    .replace(/("[^"]+"\s*:\s*\[[\s\S]*?")(\s*"[^"]+"\s*:)/g, '$1],$2')
    .replace(/("[^"]+"\s*:\s*\[[\s\S]*?\})(\s*"(?:captions|tags|ending|hashtags|directorComment|revisionSuggestions)"\s*:)/g, '$1],$2')
    .replace(/("[^"]+"\s*:\s*\[[\s\S]*?")(\s*"(?:tags|directorComment|revisionSuggestions)"\s*:)/g, '$1],$2')
    .replace(/([}\]"0-9])\s+("[^"]+"\s*:)/g, '$1,$2'));
}

function parsePossiblyMalformedJson<T>(jsonText: string): T {
  try {
    return JSON.parse(jsonText) as T;
  } catch (firstError) {
    const repaired = repairModelJson(jsonText);
    try {
      return JSON.parse(repaired) as T;
    } catch (secondError) {
      const targetedRepair = repairAtParseError(repaired, secondError);
      if (targetedRepair) {
        try {
          return JSON.parse(closeOpenJsonStructures(targetedRepair)) as T;
        } catch {}
      }
      throw firstError;
    }
  }
}

function parseJsonFromText<T>(text: string): T {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {}
  const match = trimmed.match(/```json\s*([\s\S]*?)```/) || trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`无法解析模型 JSON：${trimmed.slice(0, 300)}`);
  return parsePossiblyMalformedJson<T>(match[1] || match[0]);
}

function mustText(value: unknown, fieldName: string, maxLength: number): string {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`AI 返回缺少字段：${fieldName}`);
  return text.slice(0, maxLength);
}

function optionalText(value: unknown, maxLength: number): string | undefined {
  const text = String(value ?? '').trim();
  return text ? text.slice(0, maxLength) : undefined;
}

function mustNumber(value: unknown, fieldName: string, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`AI 返回字段不是数字：${fieldName}`);
  return Math.min(max, Math.max(min, n));
}

function optionalNumber(value: unknown, min: number, max: number): number | undefined {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, n));
}

function enumValue<T extends string>(value: unknown, list: readonly T[], fieldName: string): T {
  const text = String(value ?? '').trim();
  if (!list.includes(text as T)) {
    throw new Error(`AI 返回字段 ${fieldName} 不合法：${text || '空'}；允许值：${list.join(', ')}`);
  }
  return text as T;
}

function optionalEnum<T extends string>(value: unknown, list: readonly T[]): T | undefined {
  const text = String(value ?? '').trim();
  return list.includes(text as T) ? (text as T) : undefined;
}

function stringArray(value: unknown, fieldName: string, maxItems: number, maxLength: number, required = true): string[] {
  if (!Array.isArray(value)) {
    if (required) throw new Error(`AI 返回字段 ${fieldName} 必须是数组`);
    return [];
  }
  const arr = value.map((item) => String(item ?? '').trim().slice(0, maxLength)).filter(Boolean).slice(0, maxItems);
  if (required && !arr.length) throw new Error(`AI 返回字段 ${fieldName} 不能为空`);
  return arr;
}

function enumArray<T extends string>(value: unknown, list: readonly T[], maxItems: number): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => optionalEnum(item, list))
    .filter(Boolean)
    .slice(0, maxItems) as T[];
}

function slugify(value: string, defaultValue = 'ai-revise') {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  return normalized || defaultValue;
}

function getFirstUsableSegment(analysis: AssetAnalysis, asset: UploadedAsset) {
  const seg = analysis.usableSegments[0];
  if (seg) return seg;
  if (asset.type === 'image') return { start: 0, end: 4, reason: '图片素材' };
  throw new Error(`素材 ${asset.id} 没有 Qwen-VL 返回的 usableSegments`);
}

function normalizeAnalysis(raw: any, asset: UploadedAsset): AssetAnalysis {
  const duration = asset.durationSeconds || (asset.type === 'image' ? 4 : 8);
  const rawSegments = Array.isArray(raw?.usableSegments) ? raw.usableSegments : [];
  if (!rawSegments.length) throw new Error(`Qwen-VL 没有为素材 ${asset.originalName} 返回 usableSegments`);

  const usableSegments = rawSegments.slice(0, 3).map((seg: any, index: number) => {
    const start = mustNumber(seg?.start, `usableSegments[${index}].start`, 0, duration);
    const end = mustNumber(seg?.end, `usableSegments[${index}].end`, start + 0.5, duration);
    return {
      start,
      end: Math.max(start + 0.5, end),
      reason: mustText(seg?.reason, `usableSegments[${index}].reason`, 120),
    };
  });

  return {
    assetId: asset.id,
    summary: mustText(raw?.summary, 'summary', 220),
    emotion: enumValue(raw?.emotion, emotions, 'emotion'),
    scene: mustText(raw?.scene, 'scene', 60),
    highlightScore: mustNumber(raw?.highlightScore, 'highlightScore', 0, 1),
    qualityScore: mustNumber(raw?.qualityScore, 'qualityScore', 0, 1),
    stabilityScore: mustNumber(raw?.stabilityScore, 'stabilityScore', 0, 1),
    emotionScore: mustNumber(raw?.emotionScore, 'emotionScore', 0, 1),
    storyValue: mustNumber(raw?.storyValue, 'storyValue', 0, 1),
    detectedSubjects: stringArray(raw?.detectedSubjects, 'detectedSubjects', 8, 30, false),
    badReasons: stringArray(raw?.badReasons, 'badReasons', 8, 60, false),
    suggestedRole: optionalEnum(raw?.suggestedRole, roles),
    usableSegments,
    captions: stringArray(raw?.captions, 'captions', 5, 80, false),
    tags: stringArray(raw?.tags, 'tags', 8, 30, false),
  };
}

function textFieldFromMalformedJson(text: string, fieldName: string): string | undefined {
  const match = text.match(new RegExp(`"${fieldName}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, 's'));
  return match?.[1]?.replace(/\\"/g, '"').trim();
}

function numberFieldFromMalformedJson(text: string, fieldName: string): number | undefined {
  const match = text.match(new RegExp(`"${fieldName}"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`, 's'));
  const value = match ? Number(match[1]) : NaN;
  return Number.isFinite(value) ? value : undefined;
}

function segmentsFromMalformedJson(text: string, duration: number) {
  const segments: Array<{ start: number; end: number; reason: string }> = [];
  const segmentPattern = /\{\s*"start"\s*:\s*(-?\d+(?:\.\d+)?)\s*,\s*"end"\s*:\s*(-?\d+(?:\.\d+)?)\s*,\s*"reason"\s*:\s*"((?:\\.|[^"\\])*)"/gs;
  for (const match of text.matchAll(segmentPattern)) {
    const start = Math.max(0, Math.min(duration, Number(match[1])));
    const end = Math.max(start + 0.5, Math.min(duration, Number(match[2])));
    segments.push({ start, end, reason: (match[3] || '素材可用片段').slice(0, 120) });
    if (segments.length >= 3) break;
  }
  return segments;
}

function fallbackAnalysisFromMalformedText(text: string, asset: UploadedAsset): AssetAnalysis {
  const duration = asset.durationSeconds || (asset.type === 'image' ? 4 : 8);
  const summary = textFieldFromMalformedJson(text, 'summary') || `${asset.originalName} 的素材画面`;
  const emotion = optionalEnum(textFieldFromMalformedJson(text, 'emotion'), emotions) || 'unknown';
  const usableSegments = segmentsFromMalformedJson(text, duration);
  if (!usableSegments.length) {
    usableSegments.push({
      start: 0,
      end: Math.min(duration, asset.type === 'image' ? 4 : 5),
      reason: 'Qwen-VL 返回 JSON 格式不完整，使用素材开头稳定片段',
    });
  }
  return {
    assetId: asset.id,
    summary: summary.slice(0, 220),
    emotion,
    scene: (textFieldFromMalformedJson(text, 'scene') || 'unknown').slice(0, 60),
    highlightScore: optionalNumber(numberFieldFromMalformedJson(text, 'highlightScore'), 0, 1) ?? 0.5,
    qualityScore: optionalNumber(numberFieldFromMalformedJson(text, 'qualityScore'), 0, 1) ?? 0.7,
    stabilityScore: optionalNumber(numberFieldFromMalformedJson(text, 'stabilityScore'), 0, 1) ?? 0.7,
    emotionScore: optionalNumber(numberFieldFromMalformedJson(text, 'emotionScore'), 0, 1) ?? 0.5,
    storyValue: optionalNumber(numberFieldFromMalformedJson(text, 'storyValue'), 0, 1) ?? 0.5,
    detectedSubjects: [],
    badReasons: ['qwen_json_repaired_with_fallback'],
    suggestedRole: undefined,
    usableSegments,
    captions: [],
    tags: [],
  };
}

function detectPackFromText(haystack: string, visualStyle: VisualStyle): VisualStylePack | undefined {
  if (/(pet|dog|cat|paw|宠物|小狗|狗|猫|小动物)/i.test(haystack)) return 'cute_pet';
  if (/(kid|child|baby|娃|孩子|儿童|亲子|宝宝|家庭亲子)/i.test(haystack)) return 'kid_playful';
  if (/(food|meal|cafe|restaurant|coffee|breakfast|lunch|dinner|吃|饭|餐|咖啡|美食|厨房|餐厅)/i.test(haystack)) return 'food_diary';
  if (/(city|street|urban|building|subway|commute|城市|街|楼|地铁|通勤|人行道|脚步|车站)/i.test(haystack)) return 'city_rec';
  if (/(travel|trip|beach|mountain|river|waterfall|boat|landscape|scenery|旅行|旅游|风景|户外|山|海|河|瀑布|船|湖|景区)/i.test(haystack)) return 'travel_postcard';
  if (/(night|bar|dark|neon|夜|晚上|霓虹|深夜)/i.test(haystack)) return 'night_mood';
  if (visualStyle === 'cinematic') return 'cinematic_memory';
  if (visualStyle === 'beat') return 'beat_highlight';
  if (visualStyle === 'minimal') return 'minimal_clean';
  if (visualStyle === 'city' || visualStyle === 'rec') return 'city_rec';
  if (visualStyle === 'food') return 'food_diary';
  if (visualStyle === 'travel') return 'travel_postcard';
  if (visualStyle === 'cute') return 'cute_pet';
  if (visualStyle === 'night') return 'night_mood';
  return undefined;
}

function inferVisualStylePack(raw: any, analyses: AssetAnalysis[], visualStyle: VisualStyle): VisualStylePack {
  const requested = optionalEnum(raw?.visualStylePack, visualStylePacks);
  const rawHaystack = [raw?.visualStylePack, raw?.storyType, raw?.mood, raw?.title, raw?.subtitle].join(' ').toLowerCase();
  const score: Record<VisualStylePack, number> = {
    warm_family: 0,
    cute_pet: 0,
    kid_playful: 0,
    food_diary: 0,
    city_rec: 0,
    travel_postcard: 0,
    cinematic_memory: 0,
    minimal_clean: 0,
    beat_highlight: 0,
    night_mood: 0,
  };

  const addTextScore = (text: string, weight = 1) => {
    const h = text.toLowerCase();
    if (/(pet|dog|cat|paw|宠物|小狗|狗|猫|小动物)/i.test(h)) score.cute_pet += 5 * weight;
    if (/(kid|child|baby|娃|孩子|儿童|亲子|宝宝|小朋友)/i.test(h)) score.kid_playful += 4 * weight;
    if (/(food|meal|cafe|restaurant|coffee|breakfast|lunch|dinner|salad|kitchen|吃|饭|餐|咖啡|美食|厨房|餐厅|切菜|砧板|沙拉)/i.test(h)) score.food_diary += 5 * weight;
    if (/(city|street|urban|building|subway|commute|walking|城市|街|楼|地铁|通勤|人行道|脚步|车站)/i.test(h)) score.city_rec += 5 * weight;
    if (/(travel|trip|beach|mountain|river|waterfall|boat|landscape|scenery|旅行|旅游|风景|户外|山|海|河|瀑布|船|湖|景区)/i.test(h)) score.travel_postcard += 5 * weight;
    if (/(night|bar|dark|neon|夜|晚上|霓虹|深夜)/i.test(h)) score.night_mood += 5 * weight;
    if (/(family|home|家人|家庭|居家|周末)/i.test(h)) score.warm_family += 2 * weight;
  };

  addTextScore(rawHaystack, 0.7);
  for (const a of analyses) {
    const text = [a.emotion, a.scene, a.summary, ...(a.detectedSubjects || []), ...(a.tags || [])].join(' ');
    const assetWeight = 1 + Math.max(a.highlightScore || 0, a.storyValue || 0, a.emotionScore || 0);
    addTextScore(text, assetWeight);
  }

  if (visualStyle === 'cinematic') score.cinematic_memory += 2;
  if (visualStyle === 'beat') score.beat_highlight += 3;
  if (visualStyle === 'minimal') score.minimal_clean += 2;
  if (visualStyle === 'city' || visualStyle === 'rec') score.city_rec += 3;
  if (visualStyle === 'food') score.food_diary += 3;
  if (visualStyle === 'travel') score.travel_postcard += 3;
  if (visualStyle === 'cute') score.cute_pet += 1;
  if (visualStyle === 'night') score.night_mood += 3;
  if (requested) score[requested] += 1; // AI request is only a weak hint; content evidence wins.

  const best = (Object.entries(score) as Array<[VisualStylePack, number]>).sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] > 0) return best[0];
  return requested || 'warm_family';
}



const packDefaults: Record<VisualStylePack, {
  visualStyle: VisualStyle;
  fontToken: FontToken;
  titleFontToken: FontToken;
  captionFontToken: FontToken;
  accentColor: string;
  textColor: string;
  captionBgColor: string;
}> = {
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

export async function analyzeAssetsWithQwen(assets: UploadedAsset[], jobDir: string): Promise<AssetAnalysis[]> {
  requireQwenKey();
  const results: AssetAnalysis[] = [];
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const content: any[] = [
      {
        type: 'text',
        text: `你是生活 Vlog AI 导演的素材分析员。请只根据用户真实素材本身分析，不要套模板，不要写固定文案，不要编造画面中没有的事。\n\n输出严格 JSON：{"summary":"","emotion":"warm|cute|dynamic|cinematic|calm|food|city|night|pet|family|travel|unknown","scene":"","highlightScore":0.0,"qualityScore":0.0,"stabilityScore":0.0,"emotionScore":0.0,"storyValue":0.0,"detectedSubjects":["人/宠物/食物/城市/家庭等主体"],"badReasons":["模糊/太暗/重复/无意义/晃动等，没有则空数组"],"suggestedRole":"opening|context|build|detail|interaction|highlight|emotion_peak|funny|quiet|travel|food|pet|kid|city|night|ending","usableSegments":[{"start":0,"end":5,"reason":"为什么这段可用"}],"captions":["根据该素材画面可写的候选字幕，可为空"],"tags":[""]}`,
      },
    ];

    if (asset.type === 'image') {
      content.push({ type: 'image_url', image_url: { url: toDataUrl(asset.absolutePath, asset.mimeType) } });
    } else {
      const frameDir = path.resolve(jobDir, 'frames', asset.id);
      const frames = await extractVideoFrames(asset.absolutePath, frameDir, 5);
      if (!frames.length) throw new Error(`无法抽取视频关键帧：${asset.originalName}`);
      for (const frame of frames) {
        content.push({ type: 'image_url', image_url: { url: toDataUrl(frame, 'image/jpeg') } });
      }
    }

    const text = await qwenChat({
      model: config.qwenVlModel,
      messages: [{ role: 'user', content }],
      temperature: 0.18,
      responseFormatJson: true,
    });
    fs.mkdirSync(jobDir, { recursive: true });
    fs.writeFileSync(path.resolve(jobDir, `${asset.id}-qwen-vl-raw.txt`), text, 'utf-8');
    try {
      const parsed = parseJsonFromText<any>(text);
      results.push(normalizeAnalysis(parsed, asset));
    } catch (error) {
      fs.writeFileSync(path.resolve(jobDir, `${asset.id}-qwen-vl-parse-error.txt`), error instanceof Error ? `${error.message}\n${error.stack || ''}` : String(error), 'utf-8');
      results.push(fallbackAnalysisFromMalformedText(text, asset));
    }
  }
  return results;
}

function normalizeTypography(raw: any, visualStylePack: VisualStylePack): TypographyDecision {
  const defaults = packDefaults[visualStylePack];
  return {
    fontToken: optionalEnum(raw?.fontToken, fontTokens) || defaults.fontToken,
    titleFontToken: optionalEnum(raw?.titleFontToken, fontTokens) || defaults.titleFontToken,
    captionFontToken: optionalEnum(raw?.captionFontToken, fontTokens) || defaults.captionFontToken,
    fontFamily: optionalText(raw?.fontFamily, 80) || 'Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    titleFontSize: mustNumber(raw?.titleFontSize, 'typography.titleFontSize', 40, 116),
    subtitleFontSize: mustNumber(raw?.subtitleFontSize, 'typography.subtitleFontSize', 22, 58),
    captionFontSize: mustNumber(raw?.captionFontSize, 'typography.captionFontSize', 24, 72),
    endingFontSize: mustNumber(raw?.endingFontSize, 'typography.endingFontSize', 30, 80),
    fontWeight: mustNumber(raw?.fontWeight, 'typography.fontWeight', 300, 950),
    letterSpacing: optionalNumber(raw?.letterSpacing, 0, 6),
    textColor: optionalText(raw?.textColor, 20) || defaults.textColor,
    accentColor: optionalText(raw?.accentColor, 20) || defaults.accentColor,
    titleColor: optionalText(raw?.titleColor, 20),
    captionColor: optionalText(raw?.captionColor, 20),
    captionBgColor: optionalText(raw?.captionBgColor, 40) || defaults.captionBgColor,
    titlePosition: optionalEnum(raw?.titlePosition, titlePositions) || 'center',
    captionPosition: optionalEnum(raw?.captionPosition, titlePositions) || 'bottom',
    textAnimation: optionalEnum(raw?.textAnimation, textAnimations) || 'fade_up',
  };
}

function normalizeOpening(raw: any): OpeningDecision {
  return {
    type: enumValue(raw?.type, openingTypes, 'opening.type'),
    assetId: optionalText(raw?.assetId, 80),
    duration: mustNumber(raw?.duration, 'opening.duration', 1.5, 6),
    title: mustText(raw?.title, 'opening.title', 40),
    subtitle: optionalText(raw?.subtitle, 70),
    motion: optionalEnum(raw?.motion, motions),
    layout: optionalEnum(raw?.layout, layouts),
    stickers: enumArray(raw?.stickers, stickerTypes, 6),
    overlays: enumArray(raw?.overlays, overlays, 5),
  };
}

function normalizeEnding(raw: any): EndingDecision {
  const style = enumValue(raw?.style || raw?.type, endingStyles, 'ending.style');
  return {
    text: mustText(raw?.text, 'ending.text', 90),
    duration: mustNumber(raw?.duration, 'ending.duration', 2, 7),
    style,
    type: optionalEnum(raw?.type, endingStyles) || style,
    stickers: enumArray(raw?.stickers, stickerTypes, 6),
    overlays: enumArray(raw?.overlays, overlays, 5),
  };
}

function sanitizeSceneStability(scene: DirectorScene, mode: VisualStabilityMode): DirectorScene {
  let transitionIn = scene.transitionIn;
  let transitionDuration = scene.transitionDuration;
  let motion = scene.motion;
  let motionIntensity = scene.motionIntensity ?? 0.25;

  if (mode === 'stable') {
    const transitionFallback: Partial<Record<SceneTransition, SceneTransition>> = {
      white_flash: 'soft_flash',
      camera_shutter: 'fade',
      film_burn: 'light_leak',
      zoom_in: 'crossfade',
      hard_cut: 'crossfade',
      wipe: 'crossfade',
      swipe_card: 'slide_left',
    };
    transitionIn = transitionFallback[transitionIn] || transitionIn;
    transitionDuration = Math.min(12, Math.max(8, transitionDuration ?? 10));
    motion = scene.type === 'video' ? 'still' : (unstableMotions.includes(motion) ? 'calm_breathing' : motion);
    motionIntensity = scene.type === 'video' ? 0 : Math.min(motionIntensity, 0.25);
  } else if (mode === 'balanced') {
    if (transitionIn === 'camera_shutter') transitionIn = 'fade';
    if (transitionIn === 'film_burn') transitionIn = 'light_leak';
    transitionDuration = Math.min(16, Math.max(10, transitionDuration ?? 12));
    motionIntensity = Math.min(motionIntensity, unstableMotions.includes(motion) ? 0.25 : 0.35);
  } else {
    transitionDuration = Math.min(18, Math.max(8, transitionDuration ?? 12));
    motionIntensity = Math.min(motionIntensity, 0.55);
  }

  return { ...scene, transitionIn, transitionDuration, motion, motionIntensity };
}


function enforcePackVisual(scene: DirectorScene, visualStylePack: VisualStylePack, index: number): DirectorScene {
  const rules = packVisualRules[visualStylePack];
  const pick = <T,>(items: T[], fallback: T): T => items[index % Math.max(1, items.length)] || fallback;
  const layout = rules.layouts.includes(scene.layout) ? scene.layout : pick(rules.layouts, scene.layout);
  const captionStyle = rules.captionStyles.includes(scene.captionStyle) ? scene.captionStyle : pick(rules.captionStyles, scene.captionStyle);
  const motion = rules.motions.includes(scene.motion) ? scene.motion : pick(rules.motions, scene.motion);
  const transitionIn = rules.transitions.includes(scene.transitionIn) ? scene.transitionIn : pick(rules.transitions, scene.transitionIn);
  let stickers = scene.stickers.filter((s) => rules.stickers.includes(s)).slice(0, 3);
  if (!stickers.length) stickers = rules.stickers.slice(0, Math.min(2, rules.stickers.length));
  let overlays = scene.overlays.filter((o) => rules.overlays.includes(o)).slice(0, 4);
  if (!overlays.length) overlays = rules.overlays.slice(0, Math.min(3, rules.overlays.length));
  return { ...scene, layout, captionStyle, motion, transitionIn, stickers, overlays };
}

function normalizeScene(scene: any, assets: UploadedAsset[], analyses: AssetAnalysis[], index: number, visualStabilityMode: VisualStabilityMode, visualStylePack: VisualStylePack): DirectorScene {
  const assetId = mustText(scene?.assetId, `scenes[${index}].assetId`, 80);
  const asset = assets.find((item) => item.id === assetId);
  if (!asset) throw new Error(`AI 返回了不存在的 assetId：${assetId}`);
  const analysis = analyses.find((item) => item.assetId === assetId);
  if (!analysis) throw new Error(`找不到 assetId 对应分析结果：${assetId}`);
  const firstSeg = getFirstUsableSegment(analysis, asset);
  const duration = mustNumber(scene?.duration, `scenes[${index}].duration`, 1.6, 9);
  const sourceStart = asset.type === 'video'
    ? optionalNumber(scene?.sourceStart, 0, asset.durationSeconds || firstSeg.end) ?? firstSeg.start
    : 0;
  const sourceEnd = asset.type === 'video'
    ? optionalNumber(scene?.sourceEnd, sourceStart + 0.5, asset.durationSeconds || firstSeg.end) ?? Math.min(firstSeg.end, sourceStart + duration)
    : undefined;

  const normalizedScene: DirectorScene = {
    assetId,
    type: asset.type,
    src: asset.url,
    sourceStart,
    sourceEnd,
    duration,
    caption: mustText(scene?.caption, `scenes[${index}].caption`, 80),
    fontToken: optionalEnum(scene?.fontToken, fontTokens) || packDefaults[visualStylePack].captionFontToken,
    role: enumValue(scene?.role, roles, `scenes[${index}].role`),
    sceneType: optionalEnum(scene?.sceneType, sceneTypes),
    transitionIn: enumValue(scene?.transitionIn, transitions, `scenes[${index}].transitionIn`),
    transitionDuration: optionalNumber(scene?.transitionDuration, 4, 30),
    motion: enumValue(scene?.motion, motions, `scenes[${index}].motion`),
    motionIntensity: optionalNumber(scene?.motionIntensity, 0, 1),
    playbackRate: optionalNumber(scene?.playbackRate, 0.65, 1.25),
    layout: enumValue(scene?.layout, layouts, `scenes[${index}].layout`),
    captionStyle: enumValue(scene?.captionStyle, captionStyles, `scenes[${index}].captionStyle`),
    emphasis: optionalEnum(scene?.emphasis, emphasisTypes) || 'normal',
    stickers: enumArray(scene?.stickers, stickerTypes, 8),
    overlays: enumArray(scene?.overlays, overlays, 8),
    highlightWords: stringArray(scene?.highlightWords, `scenes[${index}].highlightWords`, 5, 12, false),
  };
  return sanitizeSceneStability(enforcePackVisual(normalizedScene, visualStylePack, index), visualStabilityMode);
}

function normalizeRevisionSuggestions(raw: unknown): DirectorRevisionSuggestion[] {
  if (!Array.isArray(raw)) throw new Error('AI 返回缺少 revisionSuggestions 数组');
  const suggestions = raw.slice(0, 5).map((item: any, index): DirectorRevisionSuggestion => {
    const label = mustText(item?.label, `revisionSuggestions[${index}].label`, 16);
    const instruction = mustText(item?.instruction, `revisionSuggestions[${index}].instruction`, 240);
    return {
      id: slugify(String(item?.id || label || `ai-${index + 1}`), `ai-${index + 1}`),
      label,
      instruction,
      reason: optionalText(item?.reason, 140),
      expectedChange: optionalText(item?.expectedChange, 140),
    };
  });
  if (suggestions.length < 3) throw new Error('AI 返回的 revisionSuggestions 少于 3 个');
  return suggestions;
}

function normalizeDirectorPlan(raw: any, assets: UploadedAsset[], analyses: AssetAnalysis[], revision?: DirectorRevisionSuggestion): VlogPlan {
  const bgmId = mustText(raw?.bgmId, 'bgmId', 80);
  const bgm = getBgmById(bgmId);
  if (!bgm) throw new Error(`AI 返回了不在候选列表中的 bgmId：${bgmId}`);

  const rawScenes = Array.isArray(raw?.scenes) ? raw.scenes : [];
  if (!rawScenes.length) throw new Error('AI 返回缺少 scenes 数组');
  const visualStabilityMode = optionalEnum(raw?.visualStabilityMode, visualStabilityModes) || 'stable';
  const rawVisualStyle = optionalEnum(raw?.visualStyle, visualStyles) || 'warm';
  const visualStylePack = inferVisualStylePack(raw, analyses, rawVisualStyle);
  const visualStyle = packDefaults[visualStylePack].visualStyle || rawVisualStyle;
  const scenes = rawScenes.slice(0, 10).map((scene: any, index: number) => normalizeScene(scene, assets, analyses, index, visualStabilityMode, visualStylePack));
  if (scenes.length < 1) throw new Error('AI 没有返回任何有效场景');

  const opening = normalizeOpening(raw?.opening);
  const ending = normalizeEnding(raw?.ending);
  const duration = mustNumber(raw?.duration, 'duration', 15, 60);

  return {
    mode: 'ai_director_dynamic',
    title: mustText(raw?.title, 'title', 40),
    subtitle: mustText(raw?.subtitle, 'subtitle', 70),
    storyType: mustText(raw?.storyType, 'storyType', 60),
    storyArc: mustText(raw?.storyArc, 'storyArc', 180),
    mood: mustText(raw?.mood, 'mood', 80),
    visualStyle,
    visualStylePack,
    visualStabilityMode,
    pace: enumValue(raw?.pace, paces, 'pace'),
    duration,
    bgmId,
    bgmTitle: bgm.title,
    bgmMood: mustText(raw?.bgmMood, 'bgmMood', 80),
    typography: normalizeTypography(raw?.typography, visualStylePack),
    opening,
    scenes,
    clips: scenes,
    ending,
    endingText: ending.text,
    hashtags: stringArray(raw?.hashtags, 'hashtags', 6, 20, true),
    directorComment: optionalText(raw?.directorComment, 180),
    revisionSuggestions: normalizeRevisionSuggestions(raw?.revisionSuggestions),
    revisionFrom: revision?.id,
    revisionLabel: revision?.label,
    revisionInstruction: revision?.instruction,
  };
}

function schemaGuide() {
  return `Output strict JSON only, no Markdown.
Allowed visualStylePack: ${visualStylePacks.join('|')}
Allowed fontToken: ${fontTokens.join('|')}
Allowed opening.type: ${openingTypes.join('|')}
Allowed ending.style and ending.type: ${endingStyles.join('|')}
Allowed visualStyle: ${visualStyles.join('|')}
Allowed visualStabilityMode: stable|balanced|dynamic
Allowed pace: ${paces.join('|')}
Allowed scene.role: ${roles.join('|')}
Allowed scene.transitionIn: ${transitions.join('|')}
Allowed scene.motion: ${motions.join('|')}
Allowed scene.layout: ${layouts.join('|')}
Allowed scene.captionStyle: ${captionStyles.join('|')}
Allowed scene.stickers: ${stickerTypes.join('|')}
Allowed scene.overlays: ${overlays.join('|')}

Visual differentiation rules:
1. Choose exactly one visualStylePack from the real content. Pet/cat/dog -> cute_pet. Kid/parent-child -> kid_playful. Meal/cafe/food -> food_diary. Street/building/city/commute/feet/walking -> city_rec. Travel/scenery/waterfall/river/mountain/boat/outdoor -> travel_postcard. Night/neon/dark -> night_mood.
2. visualStyle must match the pack family. Use different opening.type, ending.type, captionStyle, stickers, overlays, layout, and fontToken for different content categories.
3. Pet/family/food/city/travel MUST NOT look the same. Do not reuse warm_family for travel/city/food/pet unless the materials are truly generic family home memories.
4. For city_rec use mono_rec, rec_bar/simple_record, rec_camera/social_post, rec_frame/timecode/progress_bar/city_label. Do not use cute_bubble/paw/good_day.
5. For travel_postcard use travel_stamp/editorial, travel_postcard/cinematic_subtitle, travel_postcard/cinematic_frame, travel_label/polaroid_frame, film_grain/light_leak. Do not use good_day/cute_bubble/paw.
6. For food_diary use editorial/food_label fonts, food_label/warm_sentence captions, food_card/photo_card layouts, food_label/cafe_label stickers.
7. For cute_pet/kid_playful use rounded/handwritten fonts, cute_bubble/speech_bubble captions, paw/heart/star/sun_cloud stickers, but keep sticker count low.
8. Do not reuse the same component combination for every scene. At least two scene.captionStyle values and two scene.layout values should appear when there are 3+ scenes.
9. Keep visualStabilityMode stable by default. Stable video scenes should avoid micro_shake, handheld_rec, beat_punch, freeze_pulse, and strong flashes.
10. Text must describe the uploaded materials. Do not output fixed template copy.

JSON shape:
{"title":"","subtitle":"","storyType":"","storyArc":"","mood":"","visualStyle":"","visualStylePack":"","visualStabilityMode":"stable","pace":"","duration":45,"bgmId":"","bgmMood":"","typography":{"fontToken":"clean_sans","titleFontToken":"clean_sans","captionFontToken":"clean_sans","fontFamily":"Inter, PingFang SC, Microsoft YaHei, Arial, sans-serif","titleFontSize":82,"subtitleFontSize":34,"captionFontSize":46,"endingFontSize":54,"fontWeight":800,"letterSpacing":0,"textColor":"#ffffff","accentColor":"#ffe1bd","titleColor":"#ffffff","captionColor":"#ffffff","captionBgColor":"rgba(0,0,0,.42)","titlePosition":"top|center|bottom","captionPosition":"top|center|bottom","textAnimation":"fade_up|typewriter|pop|slide|none"},"opening":{"type":"","assetId":"","duration":3,"title":"","subtitle":"","motion":"slow_zoom","layout":"vertical_crop","stickers":["heart"],"overlays":["warm_glow"]},"scenes":[{"assetId":"","type":"video|image","sourceStart":0,"sourceEnd":5,"duration":5,"caption":"","fontToken":"clean_sans","role":"","sceneType":"life|pet|kid|family|food|city|travel|night|home|outdoor|unknown","transitionIn":"","transitionDuration":12,"motion":"","motionIntensity":0.2,"layout":"","captionStyle":"","emphasis":"normal|soft|strong","stickers":["heart"],"overlays":["soft_vignette"],"highlightWords":[""]}],"ending":{"text":"","duration":4,"style":"","type":"","stickers":["heart"],"overlays":["soft_vignette"]},"hashtags":[""],"directorComment":"","revisionSuggestions":[{"id":"","label":"","instruction":"","reason":"","expectedChange":""}]}`;
  return `输出严格 JSON，不要 Markdown。所有标题、字幕、结尾、字体、字号、颜色、镜头顺序、转场、贴纸、布局、动效、优化按钮都必须由你根据本次素材决定，程序不再提供固定兜底文案。\n\n字段说明：\nopening.type: ${openingTypes.join('|')}\nending.style: ${endingStyles.join('|')}\nvisualStyle: ${visualStyles.join('|')}\nvisualStabilityMode: stable|balanced|dynamic\npace: ${paces.join('|')}\nscene.role: ${roles.join('|')}\nscene.transitionIn: ${transitions.join('|')}\nscene.motion: ${motions.join('|')}\nscene.layout: ${layouts.join('|')}\nscene.captionStyle: ${captionStyles.join('|')}\nscene.stickers: ${stickerTypes.join('|')}\nscene.overlays: ${overlays.join('|')}\n\nJSON 格式：{"title":"","subtitle":"","storyType":"","storyArc":"按开头-铺垫-高光-收尾描述完整故事线","mood":"","visualStyle":"从 visualStyle 允许值中选择","visualStabilityMode":"stable|balanced|dynamic","pace":"从 pace 允许值中选择","duration":45,"bgmId":"必须来自BGM候选id","bgmMood":"","typography":{"fontFamily":"字体栈，例如 Arial, Microsoft YaHei, PingFang SC, sans-serif","titleFontSize":82,"subtitleFontSize":34,"captionFontSize":46,"endingFontSize":54,"fontWeight":800,"textColor":"#ffffff","accentColor":"#ffe1bd","captionBgColor":"rgba(0,0,0,.42)","titlePosition":"top|center|bottom","captionPosition":"top|center|bottom","textAnimation":"fade_up|typewriter|pop|slide|none"},"opening":{"type":"从 opening.type 允许值中选择","assetId":"可选，从素材里选封面","duration":3,"title":"","subtitle":"","motion":"slow_zoom","layout":"vertical_crop","stickers":["heart"],"overlays":["warm_glow"]},"scenes":[{"assetId":"","type":"video|image","sourceStart":0,"sourceEnd":5,"duration":5,"caption":"","role":"从 scene.role 允许值中选择","sceneType":"life|pet|kid|family|food|city|travel|night|home|outdoor|unknown","transitionIn":"从 scene.transitionIn 允许值中选择","transitionDuration":12,"motion":"从 scene.motion 允许值中选择","motionIntensity":0.6,"layout":"从 scene.layout 允许值中选择","captionStyle":"从 scene.captionStyle 允许值中选择","emphasis":"normal|soft|strong","stickers":["heart"],"overlays":["soft_vignette"],"highlightWords":[""]}],"ending":{"text":"","duration":4,"style":"从 ending.style 允许值中选择","stickers":["heart"],"overlays":["soft_vignette"]},"hashtags":[""],"directorComment":"解释为什么这样编排","revisionSuggestions":[{"id":"短英文或拼音id","label":"按钮文案","instruction":"点击后重新导演的具体指令","reason":"为什么适合这批素材","expectedChange":"重新生成后会怎么变"}]}`;
}

function buildCommonPrompt(assets: UploadedAsset[], analyses: AssetAnalysis[], preference?: UserPreferenceProfile) {
  const availableBgms = listBgms().map((b) => ({ id: b.id, title: b.title, mood: b.mood, bpm: b.bpm, fileNames: b.fileNames, exists: b.exists }));
  return `用户上传素材是乱序的，你要自己把素材编排成有序故事。用户不挑素材、不选模板、不写故事，BGM 也只能从给定列表里自动选。

要求：
1. 必须根据素材分析自动选择镜头和顺序，形成开头、铺垫、情绪高光、收尾；上传素材是乱序的，你必须重新编排。
2. 必须优先使用 highlightScore、qualityScore、stabilityScore、emotionScore、storyValue 综合选择高光；主动丢弃 badReasons 明显的素材。
3. 必须自己决定所有屏幕字体、字号、颜色、标题位置、字幕位置、文本动画。
4. 必须自己决定每个 scene 的 transitionIn、motion、layout、captionStyle、stickers、overlays；这些字段就是你调用 Remotion 组件库的方式。
5. 不要每个 scene 都用同样组件。你必须先选 visualStylePack，再让 opening、ending、captionStyle、layout、stickers、overlays、fontToken 与该风格包一致：宠物 cute_pet；亲子 kid_playful；吃饭/咖啡 food_diary；城市通勤 city_rec；旅行/风景 travel_postcard；夜晚 night_mood。
6. 宠物/亲子/吃饭/城市/旅行必须生成明显不同的视觉语言。禁止所有视频都用渐变开头、白色圆角字幕卡、GOOD DAY 标签、爱心贴纸。
7. 城市通勤优先 mono_rec、rec_bar、rec_camera、rec_frame/timecode/progress_bar/city_label；旅行优先 editorial/travel_stamp、travel_postcard、cinematic_frame、travel_label/film_grain；吃饭优先 food_card、food_label/cafe_label、elegant/food 字体；宠物亲子优先 rounded/handwritten、cute_bubble、paw/heart/star，但不要过量。
6. 可以丢弃无意义素材，不必全部使用；但不能使用不存在的 assetId。
7. 字幕、标题、结尾必须和素材有关，不能写固定模板话术。
8. revisionSuggestions 也必须根据这批素材动态生成 3-5 个，不要每次都一样。
9. bgmId 必须来自 BGM 候选 id。即使对应 MP3 还没上传，也要按情绪选择最合适的候选 id。

素材列表：${JSON.stringify(assets.map((a) => ({ id: a.id, name: a.originalName, type: a.type, duration: a.durationSeconds, url: a.url })))}
素材分析：${JSON.stringify(analyses)}
BGM候选：${JSON.stringify(availableBgms)}
用户历史偏好画像：${JSON.stringify(preference || null)}
个性化导演要求：${preference?.promptHint || '暂无用户历史偏好。请完全根据本次素材自然导演。'}

重要：个性化偏好只能作为风格倾向，不能覆盖本次素材事实。用户喜欢的东西如果本次素材没有，不要硬编。

生活 Vlog 默认要稳定自然。除非素材明显是运动/舞蹈/派对/卡点，否则 visualStabilityMode 必须是 stable。stable 下禁止 micro_shake、handheld_rec、beat_punch、freeze_pulse 作用于画面主体；优先 still、slow_zoom、gentle_pan、calm_breathing、cinematic_push。转场不能过强，white_flash 只能短暂使用；stable 下 motionIntensity <= 0.25，transitionDuration 建议 8-12 帧。

禁止虚构数据：没有后端提供真实音频波形/用户实验/留存/跳出率数据时，不能写“实测、数据显示、跳出率、主频、ASMR 峰值、用户历史行为下降百分比”等说法。

多版本建议规则：不要生成“强化 ASMR/切菜声/声音校准”这类版本方向，除非输入中提供了真实 audioMetrics。当前系统没有 audioMetrics，所以 revisionSuggestions 不允许以 ASMR、音频频率、切菜声对齐作为主要卖点；若素材包含快速切菜/刀具近景，只能作为短暂细节镜头，不能作为长段高光。\n${schemaGuide()}`;
}

async function normalizeDirectorPlanWithSelfRepair(params: {
  rawText: string;
  assets: UploadedAsset[];
  analyses: AssetAnalysis[];
  originalPrompt: string;
  systemPrompt: string;
  revision?: DirectorRevisionSuggestion;
  contextLabel: string;
}): Promise<VlogPlan> {
  let parsed: any;
  try {
    parsed = parseJsonFromText<any>(params.rawText);
    return normalizeDirectorPlan(parsed, params.assets, params.analyses, params.revision);
  } catch (firstError) {
    const validationError = firstError instanceof Error ? firstError.message : String(firstError);
    const repairPrompt = `${params.originalPrompt}\n\n你刚才输出的 DirectorPlan 没有通过 v13 严格 schema 校验。\n校验错误：${validationError}\n\n请基于同一批真实素材重新输出一个合法 JSON。\n要求：\n1. 不要解释，不要 Markdown，只输出 JSON。\n2. 不要使用固定兜底文案。所有标题、字幕、结尾、优化按钮仍然必须基于素材。\n3. assetId 必须来自素材列表。\n4. bgmId 必须来自 BGM 候选 id。\n5. 所有枚举字段必须从 schema 允许值中选择。\n6. scenes 至少 3 个，除非用户素材少于 3 个；每个 scene 必须有非空 caption。\n7. revisionSuggestions 至少 3 个，且必须根据本次素材动态生成。\n\n上一轮非法输出：${params.rawText.slice(0, 12000)}`;
    const repairedText = await qwenChat({
      model: config.qwenTextModel,
      messages: [
        { role: 'system', content: `${params.systemPrompt}\n你现在还负责修复非法 JSON，使其严格符合 DirectorPlan schema。` },
        { role: 'user', content: repairPrompt },
      ],
      temperature: 0.35,
      responseFormatJson: true,
    });
    try {
      const repaired = parseJsonFromText<any>(repairedText);
      return normalizeDirectorPlan(repaired, params.assets, params.analyses, params.revision);
    } catch (secondError) {
      const second = secondError instanceof Error ? secondError.message : String(secondError);
      throw new Error(`[${params.contextLabel}] AI DirectorPlan 两次校验失败。首次错误：${validationError}；自修复后错误：${second}`);
    }
  }
}

export async function createDirectorPlanWithQwen(assets: UploadedAsset[], analyses: AssetAnalysis[], preference?: UserPreferenceProfile): Promise<VlogPlan> {
  requireQwenKey();
  const prompt = buildCommonPrompt(assets, analyses, preference);
  const systemPrompt = '你是专业生活 Vlog AI 导演。你负责从真实素材中建立故事、选择镜头、设计字体，并调用 AI 可用的 Remotion 组件库参数。禁止输出固定模板话术。你还要参考用户历史偏好，让成片越来越像用户喜欢的样子。';
  const text = await qwenChat({
    model: config.qwenTextModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.78,
    responseFormatJson: true,
  });
  return normalizeDirectorPlanWithSelfRepair({ rawText: text, assets, analyses, originalPrompt: prompt, systemPrompt, contextLabel: 'createDirectorPlan' });
}

function normalizeRevisionRequest(revision: RevisionRequest): DirectorRevisionSuggestion {
  if (typeof revision === 'string') {
    throw new Error('当前版本不接受固定字符串优化方向；revision 必须来自上一次 AI 返回的 revisionSuggestions。');
  }
  return {
    id: slugify(String(revision?.id || revision?.label || 'ai-revise')),
    label: mustText(revision?.label, 'revision.label', 20),
    instruction: mustText(revision?.instruction, 'revision.instruction', 260),
    reason: optionalText(revision?.reason, 160),
    expectedChange: optionalText(revision?.expectedChange, 160),
  };
}

export async function reviseDirectorPlanWithQwen(params: {
  assets: UploadedAsset[];
  analyses: AssetAnalysis[];
  currentPlan: VlogPlan;
  revision: RevisionRequest;
  preference?: UserPreferenceProfile;
}): Promise<VlogPlan> {
  requireQwenKey();
  const revision = normalizeRevisionRequest(params.revision);
  const prompt = `${buildCommonPrompt(params.assets, params.analyses, params.preference)}\n\n用户点击了上一次由 AI 根据素材生成的优化按钮：${JSON.stringify(revision)}\n上一版导演方案：${JSON.stringify(params.currentPlan)}\n\n请重新导演一版。必须重新决定镜头顺序、故事节奏、字幕、字体、转场、贴纸、覆盖层、BGM 和新的 revisionSuggestions。不要只改标题。`;
  const systemPrompt = '你是生活 Vlog 的二次导演。你必须按用户点击的 AI 优化建议重新组合 Remotion 组件，而不是套固定模板。';
  const text = await qwenChat({
    model: config.qwenTextModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.82,
    responseFormatJson: true,
  });
  return normalizeDirectorPlanWithSelfRepair({ rawText: text, assets: params.assets, analyses: params.analyses, originalPrompt: prompt, systemPrompt, revision, contextLabel: 'reviseDirectorPlan' });
}


export async function createCommercialVariantPlanWithQwen(params: {
  assets: UploadedAsset[];
  analyses: AssetAnalysis[];
  basePlan: VlogPlan;
  suggestion: DirectorRevisionSuggestion;
  preference?: UserPreferenceProfile;
}): Promise<VlogPlan> {
  requireQwenKey();
  const prompt = `${buildCommonPrompt(params.assets, params.analyses, params.preference)}\n\n这是商业化多版本生成，不是用户手动选择。请根据上一次 AI 生成的建议自动生成一个差异明显的新版本。\n基础版导演方案：${JSON.stringify(params.basePlan)}\n本次版本方向：${JSON.stringify(params.suggestion)}\n\n要求：这个版本要和基础版在故事重点、节奏、组件组合、字幕表达、BGM 选择上有明显差异，但仍然必须真实基于素材。`;
  const systemPrompt = '你是商业化生活 Vlog 多版本导演。你必须为同一批真实素材生成差异明显、可供用户选择的一版视频方案。';
  const text = await qwenChat({
    model: config.qwenTextModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.84,
    responseFormatJson: true,
  });
  return normalizeDirectorPlanWithSelfRepair({ rawText: text, assets: params.assets, analyses: params.analyses, originalPrompt: prompt, systemPrompt, revision: params.suggestion, contextLabel: 'commercialVariantPlan' });
}

export function listRevisionPresets() {
  return {
    usage: 'dynamic_from_ai_plan_only',
    message: '本版本没有固定优化按钮。请读取 /api/vlog/create 或 /api/vlog/revise 返回的 plan.revisionSuggestions。',
  };
}


function normalizeQualityEvaluation(raw: any): Omit<VlogQualityEvaluation, 'evaluatedAt'> {
  const problems = stringArray(raw?.problems, 'quality.problems', 8, 120, false);
  const strengths = stringArray(raw?.strengths, 'quality.strengths', 8, 120, false);
  return {
    overallScore: mustNumber(raw?.overallScore, 'quality.overallScore', 0, 100),
    storyScore: mustNumber(raw?.storyScore, 'quality.storyScore', 0, 100),
    emotionScore: mustNumber(raw?.emotionScore, 'quality.emotionScore', 0, 100),
    captionScore: mustNumber(raw?.captionScore, 'quality.captionScore', 0, 100),
    bgmMatchScore: mustNumber(raw?.bgmMatchScore, 'quality.bgmMatchScore', 0, 100),
    materialUseScore: mustNumber(raw?.materialUseScore, 'quality.materialUseScore', 0, 100),
    visualScore: mustNumber(raw?.visualScore, 'quality.visualScore', 0, 100),
    shareWorthinessScore: mustNumber(raw?.shareWorthinessScore, 'quality.shareWorthinessScore', 0, 100),
    problems,
    strengths,
    improvementInstruction: optionalText(raw?.improvementInstruction, 360),
    shouldRegenerate: Boolean(raw?.shouldRegenerate),
    recommendationReason: optionalText(raw?.recommendationReason, 220),
  };
}

export async function evaluateVlogPlanWithQwen(params: {
  assets: UploadedAsset[];
  analyses: AssetAnalysis[];
  plan: VlogPlan;
  versionLabel?: string;
}): Promise<VlogQualityEvaluation> {
  requireQwenKey();
  const prompt = `你是商业化生活 Vlog 的质量评审，不是导演。请严格评估这版视频是否值得用户保存/分享。不要安慰性打高分。\n\n素材列表：${JSON.stringify(params.assets.map((a) => ({ id: a.id, name: a.originalName, type: a.type, durationSeconds: a.durationSeconds })))}\n素材分析：${JSON.stringify(params.analyses)}\n当前导演方案：${JSON.stringify(params.plan)}\n\n请从以下维度打 0-100 分：故事连贯、情绪价值、字幕自然度、BGM 匹配、素材使用、视觉风格、分享价值。\n如果 overallScore 低于 ${config.qualityThreshold}，或问题会明显影响用户保存/分享，请 shouldRegenerate=true，并给出 improvementInstruction，让导演下一次重新编排。\n\n输出严格 JSON：{"overallScore":86,"storyScore":90,"emotionScore":88,"captionScore":82,"bgmMatchScore":85,"materialUseScore":88,"visualScore":84,"shareWorthinessScore":87,"problems":["具体问题"],"strengths":["具体优点"],"improvementInstruction":"如果需要重导，给导演的明确修改要求；不需要则可为空","shouldRegenerate":false,"recommendationReason":"为什么这版适合推荐给用户"}`;
  const text = await qwenChat({
    model: config.qwenTextModel,
    messages: [
      { role: 'system', content: '你是短视频商业化质量评审。你只做评估和改进建议，不能生成固定文案，不能无依据打高分。' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.25,
    responseFormatJson: true,
  });
  const parsed = parseJsonFromText<any>(text);
  const normalized = normalizeQualityEvaluation(parsed);
  return { ...normalized, evaluatedAt: new Date().toISOString() };
}

export async function improveDirectorPlanFromEvaluationWithQwen(params: {
  assets: UploadedAsset[];
  analyses: AssetAnalysis[];
  currentPlan: VlogPlan;
  evaluation: VlogQualityEvaluation;
  preference?: UserPreferenceProfile;
}): Promise<VlogPlan> {
  requireQwenKey();
  if (!params.evaluation.improvementInstruction) {
    throw new Error('质量评估要求重导，但没有返回 improvementInstruction');
  }
  const aiSuggestion: DirectorRevisionSuggestion = {
    id: slugify(`quality-fix-${Date.now()}`),
    label: 'AI 质量重导',
    instruction: params.evaluation.improvementInstruction,
    reason: params.evaluation.problems.join('；'),
    expectedChange: '提升故事连贯性、情绪价值、字幕自然度和分享价值',
  };
  const prompt = `${buildCommonPrompt(params.assets, params.analyses, params.preference)}\n\n上一版导演方案：${JSON.stringify(params.currentPlan)}\nAI 质量评估：${JSON.stringify(params.evaluation)}\n\n请根据 quality.improvementInstruction 重新导演一版。必须明显修复 problems 中的问题；可以重新排序素材、删除弱素材、改字幕、改 BGM、改转场/贴纸/滤镜/字体。不要只小幅修改标题。`;
  const systemPrompt = '你是生活 Vlog 质量改进导演。你必须根据质量评估结果重新编排素材和 Remotion 组件，目标是让用户更愿意保存和分享。';
  const text = await qwenChat({
    model: config.qwenTextModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.78,
    responseFormatJson: true,
  });
  return normalizeDirectorPlanWithSelfRepair({ rawText: text, assets: params.assets, analyses: params.analyses, originalPrompt: prompt, systemPrompt, revision: aiSuggestion, contextLabel: 'qualityImprovePlan' });
}
