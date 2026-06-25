# v13：上线前稳定验收 + AI 输出校验版

v13 的目标不是继续堆功能，而是让项目更适合真实试用：能安装、能检查、能发现 AI 输出问题、能记录成本耗时、能给用户友好错误。

## 新增能力

1. **DirectorPlan 严格校验**：Qwen 返回的标题、字幕、素材顺序、BGM、字体、转场、贴纸、滤镜、优化按钮都必须符合 schema。
2. **AI 自我修复**：第一次 DirectorPlan 校验失败时，系统会把错误原因和非法 JSON 发回 Qwen，让 Qwen 重新输出合法 JSON。仍失败才返回错误。
3. **任务耗时日志**：记录 Qwen-VL 分析、Qwen 导演、质量评估、Remotion 预览/高清渲染等耗时。
4. **友好失败提示**：用户看到产品语言，开发者仍能在 error/metrics/events 里看到完整技术错误。
5. **Demo 素材脚本**：可生成宠物、家庭、城市占位素材，用于本地流程验证。
6. **上线前检查脚本**：Doctor 检查项目结构、Node 版本、关键目录。
7. **QA 文档和检查清单**：方便每次改动后回归测试。

## 新增脚本

```bash
npm run demo:doctor
npm run demo:prepare
npm run demo:pet
npm run demo:family
npm run demo:city
npm run validate:sample-plan
npm run render:sample
npm run typecheck
```

## 新增接口

```http
GET /api/jobs/:jobId/metrics
```

返回每个 job 的耗时、阶段、错误等观测数据。

## AI 输出校验原则

v13 没有固定兜底文案。校验失败时不会偷偷套默认故事。系统只会做两件事：

1. 请求 Qwen 基于真实素材重新输出合法 JSON。
2. 如果仍不合法，任务失败并显示友好错误。

## 上线前 QA 流程

```bash
copy .env.example .env
npm install
npm run demo:doctor
npm run validate:sample-plan
npm run typecheck
npm run render:sample
npm run dev
```

然后在 H5 里上传 3-8 个真实素材，检查：

- 能否创建任务
- Worker 是否消费任务
- Qwen-VL 是否分析素材
- Qwen 是否返回合法 DirectorPlan
- 是否生成 18 秒预览
- 是否生成高清版
- 是否生成多个版本
- 是否显示质量评分
- `/api/jobs/:jobId/events` 是否有任务事件
- `/api/jobs/:jobId/metrics` 是否有耗时日志

## 建议的真实素材回归集

- 宠物：3-8 个短视频，包含宠物靠近、玩耍、安静陪伴
- 家庭：家人互动、饭桌、孩子笑脸
- 城市：走路、车窗、街景、夜景
- 食物：餐桌、餐厅环境、食物近景
- 旅行：路上、风景、人物剪影
- 夜晚：弱光、灯光、安静片段

## 常见问题

### Qwen 返回字段不合法

v13 会自动触发一次自修复。如果自修复仍失败，说明 prompt 或素材信息不足，需要查看 job metrics 和后端日志。

### Remotion 渲染失败

检查素材格式、路径、文件是否存在；先跑 `npm run render:sample`，确认 Remotion 本身可用。

### 生成太慢

查看 `/api/jobs/:jobId/metrics`，定位是视频理解慢、导演慢、质量评估慢，还是 Remotion 渲染慢。

### 用户看到技术错误

v13 会用友好错误展示给用户，完整技术错误仍保存在 job-status.json 的 `error` 字段和 events/metrics 里。
