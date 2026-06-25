import type { VlogRenderInput } from '@ai-vlog/shared';

const svg = (label: string, a: string, b: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${a}"/>
        <stop offset="100%" stop-color="${b}"/>
      </linearGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="36"/></filter>
    </defs>
    <rect width="1080" height="1920" fill="url(#g)"/>
    <circle cx="260" cy="360" r="190" fill="rgba(255,255,255,.25)" filter="url(#blur)"/>
    <circle cx="860" cy="1280" r="260" fill="rgba(255,255,255,.18)" filter="url(#blur)"/>
    <rect x="120" y="520" width="840" height="760" rx="64" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.45)" stroke-width="4"/>
    <text x="540" y="905" text-anchor="middle" font-size="88" font-family="Arial, Microsoft YaHei" font-weight="800" fill="white">${label}</text>
    <text x="540" y="1010" text-anchor="middle" font-size="34" font-family="Arial, Microsoft YaHei" fill="rgba(255,255,255,.8)">AI Director Demo Asset</text>
  </svg>`)}`;

export const sampleInput: VlogRenderInput = {
  generatedAt: new Date().toISOString(),
  bgmUrl: undefined,
  plan: {
    mode: 'ai_director_dynamic',
    title: '今天的生活被 AI 剪成了故事',
    subtitle: '素材乱序上传，AI 自动编排镜头、组件和情绪',
    storyType: 'demo_life_story',
    storyArc: '开场建立今日情绪，随后用生活片段铺垫，再用高光镜头推进情绪，最后以一句生活金句收尾。',
    mood: '温暖、轻快、真实',
    visualStyle: 'warm',
    visualStabilityMode: 'stable',
    pace: 'medium',
    duration: 42,
    bgmId: 'bgm_warm_memory_soft_72bpm_01',
    bgmTitle: '温馨回忆',
    bgmMood: '温暖慢生活',
    typography: {
      fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      titleFontSize: 78,
      subtitleFontSize: 34,
      captionFontSize: 44,
      endingFontSize: 56,
      fontWeight: 850,
      textColor: '#ffffff',
      accentColor: '#ffd39d',
      captionBgColor: 'rgba(0,0,0,.42)',
      titlePosition: 'center',
      captionPosition: 'bottom',
      textAnimation: 'fade_up',
    },
    opening: { type: 'title_card', duration: 3, title: '今天的生活被 AI 剪成了故事', subtitle: '每个组件都由 AI 调用', motion: 'slow_zoom', layout: 'vertical_crop', stickers: ['heart','star'], overlays: ['warm_glow','bokeh','soft_vignette'] },
    scenes: [
      { assetId: 'demo1', type:'image', src: svg('生活开场', '#8c5b3a', '#ffc089'), duration: 5.2, caption:'先从一个很普通的生活瞬间开始', role:'opening', sceneType:'home', transitionIn:'fade', transitionDuration:14, motion:'photo_ken_burns', motionIntensity:.62, layout:'photo_card', captionStyle:'warm_sentence', emphasis:'soft', stickers:['good_day','heart'], overlays:['warm_glow','soft_vignette','film_grain'], highlightWords:['生活瞬间'] },
      { assetId: 'demo2', type:'image', src: svg('治愈互动', '#ff9acb', '#95d9ff'), duration: 5.0, caption:'有些画面，不用解释也很治愈', role:'interaction', sceneType:'pet', transitionIn:'light_leak', transitionDuration:18, motion:'calm_breathing', motionIntensity:.55, layout:'polaroid', captionStyle:'speech_bubble', emphasis:'normal', stickers:['paw','emoji','star'], overlays:['cute_pastel','bokeh'], highlightWords:['治愈'] },
      { assetId: 'demo3', type:'image', src: svg('AI 高光', '#171717', '#6c63ff'), duration: 4.8, caption:'镜头顺序、字幕、贴纸和转场都可以由 AI 决定', role:'highlight', sceneType:'life', transitionIn:'white_flash', transitionDuration:24, motion:'micro_shake', motionIntensity:.8, layout:'blur_background', captionStyle:'highlight_word', emphasis:'strong', stickers:['progress_bar','hand_drawn_circle'], overlays:['high_contrast','flash_overlay'], highlightWords:['AI','决定'] },
      { assetId: 'demo4', type:'image', src: svg('故事收尾', '#17384a', '#caa978'), duration: 5.4, caption:'把今天收藏起来，明天继续好好生活', role:'ending', sceneType:'travel', transitionIn:'blur_crossfade', transitionDuration:16, motion:'cinematic_push', motionIntensity:.6, layout:'cinematic_frame', captionStyle:'cinematic_title', emphasis:'soft', stickers:['travel_label'], overlays:['cinematic_letterbox','film_grain','light_leak'], highlightWords:['今天'] }
    ],
    clips: [] as any,
    ending: { text:'普通的一天，也可以被认真剪成故事。', duration: 4, style:'memory_saved', stickers:['heart','star'], overlays:['warm_glow','soft_vignette'] },
    endingText: '普通的一天，也可以被认真剪成故事。',
    hashtags: ['AI生活Vlog','Remotion','今日记录'],
    directorComment: '这是组件库示例：展示转场、贴纸、字幕、滤镜、版式、动效如何被 AI 参数调用。',
    revisionSuggestions: [
      { id:'more-cinematic', label:'更电影感', instruction:'改成更慢的电影节奏，使用 cinematic_frame、film_grain、letterbox 和低饱和字幕。', reason:'示例素材里有风景和情绪画面。' },
      { id:'more-cute', label:'更可爱', instruction:'使用 cute_bounce、speech_bubble、emoji、heart、star，字幕更轻快。', reason:'示例素材可以做可爱生活记录。' },
      { id:'more-social', label:'更像朋友圈', instruction:'使用 social_post、date_caption、自然短句和轻量贴纸。', reason:'更适合用户分享。' }
    ]
  }
};
sampleInput.plan.clips = sampleInput.plan.scenes;
