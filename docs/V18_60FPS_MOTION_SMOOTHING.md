# v18：60fps 运动平滑版

## 修复的问题

用户反馈 00:07-00:08 仍然有“抖动”。这次不是转场，也不是 23.976fps 单个素材的问题，而是源素材中存在快速手部/刀具运动：30fps 输出在快速近景运动下会产生明显 stutter 感。

## 本版策略

1. Remotion Composition 支持动态 fps，不再把时间线写死为 30fps。
2. `.env.example` 默认 `RENDER_FPS=60`。
3. 渲染前会把视频素材统一生成 60fps CFR proxy。
4. 代理使用 ffmpeg `minterpolate` 做轻量 blend 插帧，减少快动作顿挫。
5. SceneTimeline / opening / ending / preview duration 都按实际 `renderFps` 计算，避免 60fps 时视频时长变短。
6. 转场 overlay 时长按 fps 自动缩放。

## 需要重新生成

旧视频不会自动修复。请重新上传素材或重新创建任务生成新版本。

## 调试文件

生成后查看：

- `fps-normalization-report.json`
- `preview-*-input.json`

确认其中：

```json
{
  "targetFps": 60,
  "rewrittenScenes": [ ... ]
}
```

## 注意

60fps + minterpolate 会增加代理生成和渲染耗时。如果后续上线，可以提供：

- preview 使用 30fps
- 用户保存/高清版使用 60fps

当前版本为了验证视觉稳定，默认先用 60fps。
