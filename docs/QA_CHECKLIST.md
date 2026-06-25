# 上线前 QA 检查清单

## 安装检查

- [ ] Node >= 20
- [ ] `npm install` 成功
- [ ] `.env` 已复制并配置 Qwen Key
- [ ] `npm run demo:doctor` 通过
- [ ] `npm run typecheck` 通过
- [ ] `npm run render:sample` 生成 MP4

## AI 链路检查

- [ ] Qwen-VL 能分析图片
- [ ] Qwen-VL 能分析视频关键帧
- [ ] DirectorPlan 第一次合法时直接通过
- [ ] DirectorPlan 非法时触发自修复
- [ ] 自修复仍失败时任务失败但提示友好
- [ ] BGM 只从候选列表里选
- [ ] revisionSuggestions 是 AI 根据本次素材生成

## 渲染检查

- [ ] 图片素材可渲染
- [ ] 视频素材可渲染
- [ ] 横屏素材可渲染
- [ ] 竖屏素材可渲染
- [ ] 中英文路径可渲染
- [ ] BGM 缺失时不阻塞视频生成
- [ ] 9:16 高清版可播放
- [ ] 1:1 方形版可导出

## 产品体验检查

- [ ] H5 上传进度清楚
- [ ] 任务状态轮询正常
- [ ] 失败提示不是技术栈错误
- [ ] 版本卡片展示质量评分
- [ ] AI 推荐版本高亮
- [ ] 用户反馈能更新偏好画像
- [ ] 分享页权限生效

## 观测检查

- [ ] `/api/jobs/:jobId/events` 有事件
- [ ] `/api/jobs/:jobId/metrics` 有耗时
- [ ] 失败任务记录 error 和 userFacingError
- [ ] 质量评分记录在 version.quality
