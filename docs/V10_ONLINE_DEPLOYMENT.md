# v10 真正线上部署版

v10 的目标是把 v9 的本地 API/Worker 架构扩展为可部署形态：用户登录、作品归属、分享权限、Docker、Redis、PostgreSQL、S3/OSS/MinIO 配置都已经放入项目。

## 本地快速启动

```powershell
copy .env.example .env
npm install
npm run dev
```

打开：`http://localhost:5173`

第一个注册的账号会自动成为 admin。

## Docker 启动

```bash
cp .env.example .env
# 填入 QWEN_API_KEY 和 JWT_SECRET
docker compose up --build
```

服务：

- Web: http://localhost:5173
- API: http://localhost:8787
- MinIO: http://localhost:9001
- Redis: localhost:6379
- PostgreSQL: localhost:5432

## 线上部署建议

生产环境建议：

- API：独立 Node 服务
- Worker：独立 Node 服务，可横向扩展
- Redis：任务队列
- PostgreSQL：用户、任务、版本、事件
- OSS/S3：视频、封面、BGM
- CDN：分发 mp4/svg
- HTTPS + 域名 + 反向代理

当前代码保留 local/file/json 默认驱动，方便本地跑通；线上可按 `.env.example` 切换到 Redis/PostgreSQL/S3，并以 `prisma/schema.prisma` 作为数据库结构基准继续落库。

## 权限

新增接口：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/vlog/share-settings`

作品默认 `unlisted`，可以改为：

- `private`：仅自己可见
- `unlisted`：有链接可见
- `public`：公开可见

## BGM

BGM 仍然只从你提供的那批候选中由 AI 自动选择。真实 MP3 放到：

`apps/api/storage/bgm/`
