# v11：AI 质量评估 + 自动重导 + 推荐版本

## 目标

v10 解决“能上线”，v11 解决“生成得够不够好”。

核心目标：

```text
AI 不只是生成视频，还要判断自己生成得好不好。
如果不好，自动重导。
用户最终看到的是更值得保存/分享的一版。
```

## 质量评估流程

```text
create_vlog task
  → analyzeAssetsWithCache
  → createDirectorPlanWithQwen
  → renderPreviewVersion
  → evaluateVlogPlanWithQwen
  → 如果低于 QUALITY_THRESHOLD，则 improveDirectorPlanFromEvaluationWithQwen
  → renderPreviewVersion(qfix)
  → evaluateVlogPlanWithQwen(qfix)
  → summarizeQuality
  → renderHdForVersion
  → commercial variants
  → evaluate all versions
  → recommend best version
```

## 环境变量

```env
QUALITY_THRESHOLD=82
AUTO_REGENERATE_MAX=1
```

- `QUALITY_THRESHOLD`：低于该分数则允许 AI 自动重导。
- `AUTO_REGENERATE_MAX`：当前实现为是否允许自动重导一次；后续可扩展为多次。

## 评分维度

- overallScore
- storyScore
- emotionScore
- captionScore
- bgmMatchScore
- materialUseScore
- visualScore
- shareWorthinessScore

## 用户反馈

用户的这些动作会写入 job.feedback：

- select
- keep
- delete
- like
- dislike
- share
- download

后续可用于：

- 优化 prompt
- 统计用户保存率/分享率
- 分析哪类风格更受欢迎
- 做个性化推荐

## 不做固定兜底

v11 继续遵守：

```text
不保留固定故事文案
不保留固定字幕文案
不保留固定优化按钮
不保留假 mock 生成
```

如果 Qwen 没有返回完整字段，接口会失败，而不是用固定话术假装成功。
