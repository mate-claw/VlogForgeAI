# VlogForgeAI

### 一站式 AI 生活 Vlog 自动生成工具

简体中文 | [English](#english)

VlogForgeAI 是一个基于多模态 AI 的生活 Vlog 自动生成工具。上传照片或视频素材后，AI 会自动分析画面内容、挑选高光片段、规划故事节奏、生成字幕、匹配 BGM，并通过 Remotion 与 FFmpeg 渲染出适合分享的短视频。

VlogForgeAI is an AI director for life vlogs. It turns daily photos and videos into cinematic short vlogs with multimodal AI, Remotion, and FFmpeg.

![GitHub stars](https://img.shields.io/github/stars/mate-claw/VlogForgeAI?style=social)
![GitHub forks](https://img.shields.io/github/forks/mate-claw/VlogForgeAI?style=social)
![License](https://img.shields.io/github/license/mate-claw/VlogForgeAI)
![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933)
![Remotion](https://img.shields.io/badge/render-Remotion-0b84ff)

## 界面预览

> 预览图和演示视频整理中。当前版本可本地启动 Web、API、Worker 后直接体验完整生成流程。

## 核心能力

- 多模态素材分析：自动理解图片、视频画面、人物、宠物、美食、城市、旅行等内容
- AI 导演方案：自动生成故事线、镜头顺序、字幕、转场、贴纸、滤镜和优化建议
- 视觉风格包：支持宠物、亲子/家庭、美食、城市、旅行、电影感、夜景、高光等风格
- 稳定渲染策略：减少 AI 生成视频中的人为抖动、强闪转场和不必要的镜头运动
- 多版本工作流：支持预览、终版、质量评估、自动改进和用户反馈
- 本地优先：开发环境可使用 file/json 存储，也预留 Redis、PostgreSQL、S3/OSS 等生产化驱动
- Web + API + Worker：前端上传素材，后端调度 AI 分析和 Remotion 渲染

## 技术栈

- TypeScript monorepo
- React + Vite
- Node.js API service
- Worker background jobs
- Remotion video rendering
- FFmpeg media processing
- Multimodal AI provider integration

## 最新进展

- 2026.06.25：项目开源为 VlogForgeAI，补充 README、MIT License 与第三方许可证说明
- 2026.06.25：新增视觉风格包与字体 token，提升宠物、家庭、美食、城市、旅行等场景的视觉差异
- 2026.06.24：增强稳定渲染策略，减少视频片段中的人为抖动和强闪转场
- 2026.06.24：优化预览渲染速度，加入自适应视频代理、超时降级和高运动安全播放

## 快速启动

### 方式一：本地运行

```powershell
# 1. 克隆项目
git clone https://github.com/mate-claw/VlogForgeAI.git
cd VlogForgeAI

# 2. 安装依赖
npm install

# 3. 复制环境变量
copy .env.example .env

# 4. 编辑 .env，配置你的 AI API Key

# 5. 启动 Web、API、Worker
npm run dev
```

启动后访问：

- Web: http://localhost:5173
- API: http://localhost:8787
- Static storage: http://localhost:8787/storage

### 方式二：Docker Compose

```powershell
copy .env.example .env
docker compose up --build
```

## AI Provider 配置

当前版本默认使用 OpenAI-compatible 的 Qwen/DashScope 接口。项目设计上不绑定单一模型，后续可以扩展 Gemini、OpenAI、DeepSeek、豆包等多模态模型。

```env
QWEN_API_KEY=your_api_key
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_VL_MODEL=qwen-vl-plus
QWEN_TEXT_MODEL=qwen-plus
MOCK_QWEN=false
```

## 常用命令

```powershell
# 启动开发环境
npm run dev

# 仅启动 API
npm run dev:api

# 仅启动 Worker
npm run dev:worker

# 类型检查
npm run typecheck

# 校验示例导演计划
npm run validate:sample-plan

# 渲染示例视频
npm run render:sample
```

## 配置要求

- Node.js 20+
- npm 10+
- FFmpeg（项目依赖中包含静态 FFmpeg，系统安装 FFmpeg 也可）
- Windows 10/11、macOS 或 Linux
- 推荐内存 8GB 以上

## 项目结构

```text
apps/
  api/        API 服务、AI 调用、素材分析、渲染调度
  web/        React + Vite 前端
  worker/     后台任务 Worker
  remotion/   Remotion 视频渲染工程
packages/
  core/       队列、路径、用户、偏好、指标等通用逻辑
  shared/     共享 TypeScript 类型
docs/         架构、组件库、QA 和版本说明
```

## 未来计划

- 支持 Gemini、OpenAI、DeepSeek、豆包等更多多模态模型
- 增加可视化模板/风格包管理
- 增加导出草稿、字幕文件和工程文件能力
- 增加更完整的 Docker 部署文档
- 增加界面截图、演示视频和示例素材包
- 增强用户偏好学习和多版本推荐

## 反馈建议

欢迎通过以下方式参与：

1. 提交 Issue 反馈 bug 或建议
2. 提交 Pull Request 改进代码和文档
3. 分享生成效果、失败案例和新的视觉风格需求

## 重要许可证说明

本项目使用 [Remotion](https://github.com/remotion-dev/remotion) 作为第三方渲染依赖。Remotion 拥有独立许可证，请在商业使用前阅读并遵守 [Remotion License](https://www.remotion.dev/docs/license)。

本仓库的许可证只覆盖 VlogForgeAI 项目代码，不会重新授权 Remotion 或其它第三方依赖。

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

## English

### AI Director for Life Vlogs

VlogForgeAI is an AI-powered life vlog generator. Upload photos or videos, and the AI director will analyze the material, select highlights, build a story arc, generate captions, choose visual styles, match BGM, and render a short video with Remotion and FFmpeg.

## Features

- Multimodal AI analysis for photos and videos
- AI-generated story arcs, captions, scene order, transitions, stickers, overlays, and revision suggestions
- Visual style packs for pets, family, food, city, travel, cinematic, night, and highlight videos
- Stability safeguards to reduce artificial shaking and aggressive transitions
- Web UI, API service, Worker, and Remotion renderer in one monorepo
- Local file/json mode for development, with production-oriented Redis/PostgreSQL/S3-style drivers available

## Quick Start

```powershell
git clone https://github.com/mate-claw/VlogForgeAI.git
cd VlogForgeAI
npm install
copy .env.example .env
npm run dev
```

## License Notice

This project uses Remotion as a third-party rendering dependency. Remotion is licensed separately. Please review and comply with the Remotion license before commercial use.

VlogForgeAI is released under the MIT License.
