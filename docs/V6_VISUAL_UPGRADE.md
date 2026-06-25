# v6 视觉精修说明

v6 不是新增固定模板，而是增强 AI 可调用的 Remotion 组件库。

## AI 可控制字段

Qwen 需要为每个 scene 返回：

```json
{
  "transitionIn": "light_leak",
  "motion": "photo_ken_burns",
  "layout": "polaroid",
  "captionStyle": "speech_bubble",
  "stickers": ["paw", "emoji", "heart"],
  "overlays": ["cute_pastel", "bokeh"],
  "highlightWords": ["陪伴", "温暖"]
}
```

## 设计原则

- 程序不写固定故事。
- 程序只提供组件能力。
- AI 决定使用哪些组件。
- Remotion 根据 AI 参数组合出每次不同的视频。

## 推荐 AI 调用策略

- 宠物：paw、heart、emoji、cute_bounce、speech_bubble、cute_pastel。
- 亲子：star、heart、cute_short、photo_card、warm_glow。
- 城市：rec_frame、timecode、slide_left、rec_camera、clean_modern。
- 旅行：travel_label、cinematic_push、light_leak、film_grain、travel_postcard。
- 夜晚：dark_night、soft_vignette、cinematic_title、blur_crossfade。
- 动感：white_flash、beat_punch、progress_bar、audio_waveform、high_contrast。
- 朋友圈：social_post、good_day、date_caption、warm_sentence。
