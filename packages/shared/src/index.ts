export type MediaType = 'video' | 'image';
export type UiLanguage = 'zh' | 'en';
export type AiModelProvider = 'qwen' | 'gemini';
export type AiRuntimeOptions = { language?: UiLanguage; aiProvider?: AiModelProvider };


export type VisualStyle =
  | 'warm'
  | 'rec'
  | 'cute'
  | 'cinematic'
  | 'beat'
  | 'social'
  | 'food'
  | 'night'
  | 'travel'
  | 'city'
  | 'minimal';

export type VisualStabilityMode = 'stable' | 'balanced' | 'dynamic';

export type VisualStylePack =
  | 'warm_family'
  | 'cute_pet'
  | 'kid_playful'
  | 'food_diary'
  | 'city_rec'
  | 'travel_postcard'
  | 'cinematic_memory'
  | 'minimal_clean'
  | 'beat_highlight'
  | 'night_mood';

export type FontToken =
  | 'rounded_cute'
  | 'clean_sans'
  | 'cinematic_serif'
  | 'handwritten'
  | 'mono_rec'
  | 'editorial'
  | 'food_label'
  | 'travel_stamp';

export type VlogPace = 'slow' | 'medium_slow' | 'slow_medium' | 'medium' | 'medium_fast' | 'fast';

export type SceneRole =
  | 'opening'
  | 'context'
  | 'build'
  | 'detail'
  | 'interaction'
  | 'highlight'
  | 'emotion_peak'
  | 'funny'
  | 'quiet'
  | 'travel'
  | 'food'
  | 'pet'
  | 'kid'
  | 'city'
  | 'night'
  | 'ending';

export type SceneMotion =
  | 'still'
  | 'slow_zoom'
  | 'gentle_pan'
  | 'focus_zoom'
  | 'handheld_rec'
  | 'beat_punch'
  | 'cute_bounce'
  | 'cinematic_push'
  | 'photo_ken_burns'
  | 'freeze_pulse'
  | 'parallax_photo'
  | 'micro_shake'
  | 'calm_breathing';

export type SceneTransition =
  | 'hard_cut'
  | 'fade'
  | 'crossfade'
  | 'soft_flash'
  | 'white_flash'
  | 'slide_left'
  | 'slide_right'
  | 'wipe'
  | 'zoom_in'
  | 'blur_crossfade'
  | 'film_burn'
  | 'light_leak'
  | 'camera_shutter'
  | 'swipe_card';

export type CaptionStyle =
  | 'warm_sentence'
  | 'simple_record'
  | 'cute_short'
  | 'cute_bubble'
  | 'cinematic_title'
  | 'cinematic_subtitle'
  | 'short_punchy'
  | 'beat_punch'
  | 'reflective'
  | 'social_caption'
  | 'social_diary'
  | 'speech_bubble'
  | 'karaoke_caption'
  | 'highlight_word'
  | 'date_caption'
  | 'location_caption'
  | 'food_label'
  | 'travel_postcard'
  | 'rec_bar';

export type SceneLayout =
  | 'vertical_crop'
  | 'blur_background'
  | 'photo_card'
  | 'polaroid'
  | 'split_screen'
  | 'mosaic_grid'
  | 'picture_in_picture'
  | 'social_post'
  | 'cinematic_frame'
  | 'rec_camera'
  | 'food_card'
  | 'travel_postcard'
  | 'memory_album';

export type StickerType =
  | 'rec_frame'
  | 'progress_bar'
  | 'heart'
  | 'star'
  | 'paw'
  | 'sun_cloud'
  | 'home_label'
  | 'food_label'
  | 'cafe_label'
  | 'travel_label'
  | 'city_label'
  | 'weekend'
  | 'night_label'
  | 'good_day'
  | 'cute_label'
  | 'emoji'
  | 'hand_drawn_circle'
  | 'arrow_pointer'
  | 'polaroid_frame'
  | 'timecode'
  | 'audio_waveform';

export type OverlayType =
  | 'warm_glow'
  | 'soft_vignette'
  | 'cinematic_letterbox'
  | 'film_grain'
  | 'light_leak'
  | 'bokeh'
  | 'dark_night'
  | 'bright_summer'
  | 'cute_pastel'
  | 'high_contrast'
  | 'clean_modern'
  | 'blur_backdrop'
  | 'noise_texture'
  | 'flash_overlay'
  | 'flash'
  | 'gradient_mood';

export type TextAnimation = 'fade_up' | 'typewriter' | 'pop' | 'slide' | 'none';
export type TextPosition = 'top' | 'center' | 'bottom';

export type OpeningType =
  | 'title_card'
  | 'photo_cover'
  | 'blur_video_cover'
  | 'minimal_text'
  | 'rec_opening'
  | 'date_opening'
  | 'warm_title'
  | 'cute_pop'
  | 'cinematic_credit'
  | 'social_story'
  | 'travel_stamp'
  | 'food_menu'
  | 'city_flash'
  | 'beat_flash';

export type EndingType =
  | 'warm_quote'
  | 'cinematic_credit'
  | 'cute_card'
  | 'social_note'
  | 'rec_done'
  | 'beat_end'
  | 'memory_saved'
  | 'hashtag_end'
  | 'travel_stamp'
  | 'food_receipt'
  | 'city_signoff';

export type DirectorRevisionId = string;
export type DirectorRevisionSuggestion = {
  id: string;
  label: string;
  instruction: string;
  reason?: string;
  expectedChange?: string;
  visualStyleHint?: VisualStyle;
  paceHint?: VlogPace;
  bgmHint?: string;
};

export type DirectorRevisionPreset = DirectorRevisionSuggestion & {
  description?: string;
};

export type TemplatePace = VlogPace;

export type TemplatePreset = {
  templateId: string;
  name: string;
  description: string;
  sceneIds: string[];
  remotionVariant: VisualStyle;
  defaultBgmId: string;
  defaultBgmFileNames: string[];
  transitions: string[];
  stickers: string[];
  style: {
    color: string;
    pace: TemplatePace;
    captionStyle: string;
  };
};

export type BgmItem = {
  id: string;
  title: string;
  fileNames: string[];
  mood: string;
  bpm?: number;
  url?: string;
  exists: boolean;
};

export type UploadedAsset = {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  type: MediaType;
  absolutePath: string;
  url: string;
  durationSeconds?: number;
  assetHash?: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  fps?: number;
  avgFps?: number;
  rFps?: number;
  isLikelyVfr?: boolean;
};

export type AssetAnalysis = {
  assetId: string;
  summary: string;
  emotion: 'warm' | 'cute' | 'dynamic' | 'cinematic' | 'calm' | 'food' | 'city' | 'night' | 'pet' | 'family' | 'travel' | 'unknown';
  scene: string;
  highlightScore: number;
  qualityScore: number;
  stabilityScore: number;
  emotionScore: number;
  storyValue: number;
  detectedSubjects: string[];
  badReasons: string[];
  suggestedRole?: SceneRole;
  usableSegments: Array<{
    start: number;
    end: number;
    reason: string;
  }>;
  captions: string[];
  tags?: string[];
};

export type TypographyDecision = {
  fontToken?: FontToken;
  titleFontToken?: FontToken;
  captionFontToken?: FontToken;
  fontFamily: string;
  titleFontSize: number;
  subtitleFontSize: number;
  captionFontSize: number;
  endingFontSize: number;
  fontWeight: number;
  letterSpacing?: number;
  textColor: string;
  accentColor: string;
  titleColor?: string;
  captionColor?: string;
  captionBgColor?: string;
  titlePosition?: TextPosition;
  captionPosition?: TextPosition;
  textAnimation?: TextAnimation;
};

export type OpeningDecision = {
  type: OpeningType;
  assetId?: string;
  duration: number;
  title: string;
  subtitle?: string;
  motion?: SceneMotion;
  layout?: SceneLayout;
  stickers?: StickerType[];
  overlays?: OverlayType[];
};

export type EndingDecision = {
  text: string;
  duration: number;
  style: EndingType;
  type?: EndingType;
  stickers?: StickerType[];
  overlays?: OverlayType[];
};

export type DirectorScene = {
  assetId: string;
  type: MediaType;
  src: string;
  sourceStart?: number;
  sourceEnd?: number;
  duration: number;
  caption: string;
  fontToken?: FontToken;
  role: SceneRole;
  sceneType?: 'life' | 'pet' | 'kid' | 'family' | 'food' | 'city' | 'travel' | 'night' | 'home' | 'outdoor' | 'unknown';
  transitionIn: SceneTransition;
  transitionDuration?: number;
  motion: SceneMotion;
  motionIntensity?: number;
  playbackRate?: number;
  layout: SceneLayout;
  captionStyle: CaptionStyle;
  emphasis?: 'normal' | 'soft' | 'strong';
  stickers: StickerType[];
  overlays: OverlayType[];
  highlightWords?: string[];
};

export type VlogClip = DirectorScene;

export type VlogPlan = {
  mode: 'ai_director_dynamic';
  title: string;
  subtitle: string;
  storyType: string;
  storyArc: string;
  mood: string;
  visualStyle: VisualStyle;
  visualStylePack?: VisualStylePack;
  visualStabilityMode?: VisualStabilityMode;
  pace: VlogPace;
  duration: number;
  bgmId: string;
  bgmTitle?: string;
  bgmMood: string;
  typography: TypographyDecision;
  opening: OpeningDecision;
  scenes: DirectorScene[];
  clips: DirectorScene[];
  ending: EndingDecision;
  endingText: string;
  hashtags: string[];
  directorComment?: string;
  revisionSuggestions: DirectorRevisionSuggestion[];
  revisionFrom?: DirectorRevisionId;
  revisionLabel?: string;
  revisionInstruction?: string;
};

export type VlogRenderInput = {
  plan: VlogPlan;
  bgmUrl?: string;
  bgm?: BgmItem;
  generatedAt: string;
  renderMode?: 'preview' | 'final' | 'cover';
  outputAspect?: '9:16' | '1:1' | '16:9';
  maxDurationSeconds?: number;
  renderFps?: number;
};


export type VlogQualityEvaluation = {
  overallScore: number;
  storyScore: number;
  emotionScore: number;
  captionScore: number;
  bgmMatchScore: number;
  materialUseScore: number;
  visualScore: number;
  shareWorthinessScore: number;
  problems: string[];
  strengths: string[];
  improvementInstruction?: string;
  shouldRegenerate: boolean;
  recommendationReason?: string;
  evaluatedAt: string;
};

export type VlogVersionFeedback = {
  userId?: string;
  versionId: string;
  action: 'like' | 'dislike' | 'keep' | 'share' | 'download' | 'delete' | 'select' | 'save' | 'hide_captions' | 'change_bgm' | 'too_many_effects' | 'too_slow' | 'too_fast';
  note?: string;
  reason?: string;
  createdAt: string;
};

export type UserPreferenceProfile = {
  userId: string;
  updatedAt: string;
  sampleSize: number;
  preferredMoods: string[];
  preferredVisualStyles: VisualStyle[];
  preferredPaces: VlogPace[];
  preferredBgms: string[];
  dislikedBgms: string[];
  likesCaptions: boolean;
  likesStickers: boolean;
  likesCinematic: boolean;
  likesSocialNatural: boolean;
  preferredDurationSeconds: number;
  dislikedPatterns: string[];
  promptHint: string;
  recentPositiveSignals: string[];
  recentNegativeSignals: string[];
};

export type ProductAnalytics = {
  generatedJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalVersions: number;
  feedbackCount: number;
  likes: number;
  dislikes: number;
  keeps: number;
  shares: number;
  downloads: number;
  averageBestQualityScore?: number;
  recommendedSelectedRate?: number;
  topBgms: Array<{ bgmId: string; count: number }>;
  topStyles: Array<{ style: string; count: number }>;
  failureReasons: Array<{ reason: string; count: number }>;
};

export type CommercialVlogVersion = {
  versionId: string;
  label: string;
  description?: string;
  status: 'queued' | 'directing' | 'rendering' | 'ready' | 'failed';
  progress: number;
  videoUrl?: string;
  previewUrl?: string;
  coverUrl?: string;
  squareVideoUrl?: string;
  hdStatus?: 'queued' | 'rendering' | 'ready' | 'failed';
  plan?: VlogPlan;
  selectedBgm?: BgmItem;
  bgmUrl?: string;
  renderLog?: string[];
  quality?: VlogQualityEvaluation;
  qualityStatus?: 'pending' | 'evaluating' | 'passed' | 'needs_regeneration' | 'regenerated' | 'failed';
  autoRegeneratedFrom?: string;
  isRecommended?: boolean;
  error?: string;
  createdAt: string;
};

export type VlogJobStatus =
  | 'queued'
  | 'uploaded'
  | 'analyzing'
  | 'directing'
  | 'rendering_preview'
  | 'rendering_hd'
  | 'rendering_versions'
  | 'partial_ready'
  | 'completed'
  | 'revising'
  | 'failed';

export type ShareVisibility = 'private' | 'unlisted' | 'public';

export type VlogJob = {
  jobId: string;
  userId?: string;
  shareVisibility?: ShareVisibility;
  shareSlug?: string;
  language?: UiLanguage;
  aiProvider?: AiModelProvider;
  status: VlogJobStatus;
  stage: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  assets?: UploadedAsset[];
  analysis?: AssetAnalysis[];
  versions: CommercialVlogVersion[];
  activeVersionId?: string;
  recommendedVersionId?: string;
  bestQualityScore?: number;
  keptVersionIds?: string[];
  deletedVersionIds?: string[];
  analysisCacheHits?: number;
  renderQueue?: { pending: number; processing: number; done: number; failed: number };
  qualitySummary?: { evaluatedVersions: number; recommendedVersionId?: string; bestScore?: number; averageScore?: number };
  userPreferenceSnapshot?: UserPreferenceProfile;
  personalizationHint?: string;
  feedback?: VlogVersionFeedback[];
  error?: string;
  userFacingError?: string;
  metrics?: Record<string, unknown>;
};

export type VlogUser = {
  userId: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  userId: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
};

export type JobEvent = {
  time: string;
  status: VlogJobStatus;
  stage: string;
  progress: number;
  detail?: string;
};
