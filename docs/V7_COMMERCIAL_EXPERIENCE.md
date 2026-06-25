# v7 商业化体验版设计

## 产品目标

用户只做一件事：上传今天的素材。系统完成：

1. 分析素材
2. 给素材评分
3. 自动找故事线
4. 自动选 BGM
5. 自动生成第一版可播放视频
6. 自动生成另外 2 个差异版本
7. 根据这次素材生成二次优化按钮
8. 用户点击后继续重新导演

## 任务状态

- `uploaded`：素材已上传
- `analyzing`：Qwen-VL 分析和评分
- `directing`：Qwen 生成导演方案
- `rendering_preview`：生成第一版预览
- `partial_ready`：第一版可播放，继续生成其他版本
- `rendering_versions`：生成多版本
- `completed`：完成
- `revising`：按 AI 按钮重新导演
- `failed`：失败

## 素材评分

每个素材必须返回：

- `highlightScore`
- `qualityScore`
- `stabilityScore`
- `emotionScore`
- `storyValue`
- `badReasons`
- `suggestedRole`

## 多版本策略

第一版：AI 首选版。

第二、三版：使用第一版 `revisionSuggestions` 里的前两个 AI 动态建议自动生成，不使用固定按钮。

## 不做固定兜底

如果 Qwen 没有返回完整字段，后端直接报错。不会套固定模板文案，也不会生成假视频。
