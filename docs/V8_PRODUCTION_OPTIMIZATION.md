# V8 Production Optimization

本版目标：把 v7 的商业体验闭环升级为真实用户试用版。

## 已实现

1. **素材分析缓存**
   - 上传文件后计算 `sha256`。
   - 同一素材再次上传，读取 `apps/api/storage/analysis-cache/<hash>.json`。
   - 缓存只保存视觉分析，不保存 job 专属 URL。

2. **渲染队列**
   - `RenderQueue` 限制 Remotion 并发。
   - `.env` 可配置 `RENDER_CONCURRENCY=1`。

3. **极速预览 + 高清后台**
   - 预览输入传 `renderMode=preview` 与 `maxDurationSeconds=18`。
   - Remotion `calculateMetadata` 根据输入裁短预览时长。
   - 预览可播放后继续渲染高清版。

4. **自动封面**
   - 每个版本生成 `cover-<versionId>.svg`。
   - 前端版本卡片优先显示封面。

5. **多版本历史与版本管理**
   - `/api/jobs` 从磁盘读取最近任务。
   - 支持选择、保留、删除版本。

6. **方形导出**
   - `/api/vlog/export-square` 可把任意版本导出为 1:1。
   - Remotion `calculateMetadata` 根据 `outputAspect` 动态改变尺寸。

## 未做但建议 v9 做

- Redis + BullMQ，把 API 与 Worker 拆开。
- 数据库持久化 job/version/asset/analysis。
- OSS/S3 直传与 CDN 回源。
- 真正的音频 ducking 与原声保留策略。
- 封面导出 JPG/PNG，而不是 SVG。
