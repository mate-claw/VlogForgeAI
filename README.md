# VlogForgeAI

**Turn daily photos and videos into cinematic AI vlogs with multimodal AI.**

**基于多模态 AI，一键把生活照片和视频生成有故事感的 Vlog。**

VlogForgeAI is an AI director workflow for life vlogs. It analyzes uploaded photos and videos, picks usable highlights, designs the story arc, selects visual styles, generates captions, matches background music, and renders short videos with Remotion and FFmpeg.

VlogForgeAI 是一个 AI 生活 Vlog 导演工具：上传照片或视频后，系统会自动分析素材、选择高光片段、规划故事节奏、生成字幕、匹配 BGM，并用 Remotion 与 FFmpeg 渲染成短视频。

## Features

- Multimodal AI asset analysis for photos and videos
- AI-generated director plans, story arcs, captions, scene order, and revision suggestions
- Visual style packs for pet, family, food, city, travel, cinematic, night, and highlight videos
- Stable rendering safeguards to reduce artificial shaking and aggressive transitions
- Remotion-based rendering pipeline with FFmpeg media processing
- Web UI, API service, and background worker in one monorepo
- Local file/json mode for development, with Redis/PostgreSQL/S3-style drivers available for production-style setups

## 功能亮点

- 多模态 AI 自动分析图片和视频素材
- 自动生成导演方案、故事线、字幕、镜头顺序和优化建议
- 支持宠物、亲子/家庭、美食、城市、旅行、电影感、夜景、高光等视觉风格包
- 内置稳定性策略，减少生成视频中的人为抖动和强闪转场
- 基于 Remotion 渲染视频，使用 FFmpeg 处理媒体素材
- 包含 Web 前端、API 服务和 Worker 后台任务
- 本地开发可使用 file/json 模式，也预留 Redis、PostgreSQL、S3/OSS 等生产化驱动

## Tech Stack

- TypeScript monorepo
- React + Vite web app
- Node.js API and worker services
- Remotion renderer
- FFmpeg media processing
- Multimodal AI provider integration

## Quick Start

```powershell
git clone https://github.com/mate-claw/VlogForgeAI.git
cd VlogForgeAI
copy .env.example .env
npm install
npm run dev
```

Default local services:

- Web: http://localhost:5173
- API: http://localhost:8787
- Static storage: http://localhost:8787/storage

## Environment

Configure your AI provider key and model names in `.env`.

```env
QWEN_API_KEY=your_api_key
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_VL_MODEL=qwen-vl-plus
QWEN_TEXT_MODEL=qwen-plus
MOCK_QWEN=false
```

The current implementation uses Qwen-compatible APIs, but the project is designed to support other multimodal AI providers such as Gemini or OpenAI in the future.

## Scripts

```powershell
npm run dev
npm run typecheck
npm run validate:sample-plan
npm run render:sample
```

## Important License Notice

This project uses [Remotion](https://github.com/remotion-dev/remotion) as a third-party rendering dependency. Remotion is licensed separately. Please review and comply with the [Remotion License](https://www.remotion.dev/docs/license) before commercial use.

The license of this repository only applies to the VlogForgeAI project code. It does not relicense Remotion or any other third-party dependency.

## License

MIT
