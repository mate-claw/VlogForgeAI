# V12 Personalized Learning

## 目标

让 AI Vlog 不是每次从零开始，而是根据用户真实行为持续学习。

## 用户行为信号

正向：

- like
- keep
- share
- download
- select
- save

负向：

- dislike
- delete
- too_many_effects
- too_fast
- too_slow

## 偏好画像字段

- preferredMoods
- preferredVisualStyles
- preferredPaces
- preferredBgms
- dislikedBgms
- likesCaptions
- likesStickers
- likesCinematic
- likesSocialNatural
- preferredDurationSeconds
- dislikedPatterns
- promptHint

## AI 导演如何使用

`apps/api/src/services/qwenService.ts` 的 `buildCommonPrompt()` 会加入：

```text
用户历史偏好画像
个性化导演要求
```

规则：偏好只影响表达风格，不能覆盖素材事实。素材里没有宠物，就不能因为用户喜欢宠物风而硬编宠物故事。

## 数据看板

`GET /api/analytics/summary` 返回：

- 生成任务数
- 完成数
- 失败数
- 反馈数
- 喜欢/不喜欢/保留/分享/下载
- 推荐版本被选择比例
- 平均最佳质量分
- Top BGM
- Top 风格
- 失败原因
