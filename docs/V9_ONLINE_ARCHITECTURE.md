# v9 上线架构说明

## 目标

v9 的目标是把 v8 从“本地生产化演示”升级为“可迁移到线上服务”的架构。

## 架构

```text
Web H5
  | create job / poll status
API Server
  | write job-status.json
  | enqueue queue/pending/*.json
File Queue
  | worker rename pending -> processing
Worker
  | Qwen-VL analysis
  | Qwen director plan
  | Remotion render preview/final/square
  | write job-status.json
Storage
  | jobs/media/videos/covers
```

## 为什么先用 file queue

本地开发最容易跑，Windows 也不需要 Redis。后续替换 Redis/BullMQ 时，只需要替换 `packages/core/src/fileQueue.ts` 的实现即可。

## 为什么 API 不再直接渲染

Remotion 渲染吃 CPU 和内存。如果 API 直接渲染，请求会阻塞，也很难扩容。拆出 Worker 后：

- API 只处理轻请求
- Worker 可单独部署
- 渲染并发可控
- 失败任务可重试

## 线上推荐结构

```text
Nginx / CDN
  ├─ Web 静态资源
  └─ API Node 服务
Redis / BullMQ
Worker Pool
PostgreSQL
OSS / S3
```

## 当前本地目录

```text
apps/api/storage/jobs       job 数据和输出
apps/api/storage/queue      file queue
apps/api/storage/bgm        BGM 库
apps/api/storage/uploads    临时上传
```
