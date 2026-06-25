import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { nanoid } from 'nanoid';
import type { AuthSession, DirectorRevisionSuggestion, UploadedAsset, VlogJob, VlogVersionFeedback } from '@ai-vlog/shared';
import {
  bgmDir,
  config,
  createJwt,
  createUser,
  findUserByEmail,
  parseCookie,
  createJob,
  enqueueTask,
  ensureStorageDirs,
  getJobDir,
  jobsDir,
  listJobs,
  publicUrlFor,
  queueStats,
  sanitizeUser,
  readJob,
  readJobEvents,
  updateJob,
  verifyJwt,
  verifyPassword,
  uploadsDir,
  getUserPreferenceProfile,
  updatePreferenceFromFeedback,
  listPreferenceProfiles,
  buildProductAnalytics,
  readJobMetrics,
} from '@ai-vlog/core';
import { listTemplates } from './services/templateService';
import { listBgms } from './services/bgmCatalog';
import { detectMediaType, makeUploadedAsset, probeDurationSeconds, probeVideoMetadata, sha256File } from './utils/mediaUtils';

ensureStorageDirs();
for (const dir of [jobsDir, uploadsDir, bgmDir]) fs.mkdirSync(dir, { recursive: true });

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 1024 * 1024 * 600, files: 100 },
});

const app = express();
app.use(cors({ origin: config.webOrigin, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use('/storage', express.static(config.storageDir, {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', config.webOrigin);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

function getFilesByField(files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined, field: string): Express.Multer.File[] {
  if (!files) return [];
  if (Array.isArray(files)) return files.filter((file) => file.fieldname === field);
  return files[field] || [];
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>\"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[ch] || ch));
}

function sanitizeVersionId(value: unknown) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
}

function createPublicJob(job: VlogJob): VlogJob {
  return { ...job, renderQueue: queueStats() };
}

function appendFeedback(job: VlogJob, feedback: VlogVersionFeedback) {
  const feedbackList = [...(job.feedback || []), feedback].slice(-500);
  const preference = updatePreferenceFromFeedback({ userId: feedback.userId || job.userId, job, feedback });
  return updateJob(job.jobId, { feedback: feedbackList, userPreferenceSnapshot: preference || job.userPreferenceSnapshot, personalizationHint: preference?.promptHint || job.personalizationHint }, `feedback ${feedback.action} ${feedback.versionId}`);
}

function getSession(req: express.Request): AuthSession | undefined {
  const authHeader = req.headers.authorization || '';
  const bearer = String(authHeader).startsWith('Bearer ') ? String(authHeader).slice(7) : undefined;
  const cookieToken = parseCookie(req.headers.cookie).ai_vlog_token;
  return verifyJwt(bearer || cookieToken);
}

function getCurrentUser(req: express.Request): AuthSession | undefined {
  return getSession(req);
}

function requireUser(req: express.Request, res: express.Response): AuthSession | undefined {
  const session = getCurrentUser(req);
  if (session) return session;
  if (config.allowAnonymous) {
    return { userId: 'anonymous', email: 'anonymous@local', displayName: 'Anonymous', role: 'user' };
  }
  res.status(401).json({ ok: false, error: '请先登录后再生成 Vlog' });
  return undefined;
}

function canAccessJob(session: AuthSession | undefined, job: VlogJob, _mode: 'read' | 'write' = 'read') {
  if (session?.role === 'admin') return true;
  return Boolean(session && job.userId === session.userId);
}

function setAuthCookie(res: express.Response, token: string) {
  const secure = config.env === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `ai_vlog_token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${secure}`);
}

function clearAuthCookie(res: express.Response) {
  res.setHeader('Set-Cookie', 'ai_vlog_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'VlogForgeAI API running',
    architecture: 'v13 stability QA: strict DirectorPlan validation + AI self-repair + demo scripts + observability',
    mockQwen: config.mockQwen,
    port: config.port,
    queue: queueStats(),
    storageDriver: config.storageDriver,
    queueDriver: config.queueDriver,
    databaseDriver: config.databaseDriver,
  });
});


app.post('/api/auth/register', (req, res) => {
  try {
    const user = createUser({ email: req.body?.email, password: req.body?.password, displayName: req.body?.displayName });
    const token = createJwt(user);
    setAuthCookie(res, token);
    res.json({ ok: true, user: sanitizeUser(user), token });
  } catch (error) {
    res.status(400).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const user = findUserByEmail(String(req.body?.email || ''));
    if (!user || !verifyPassword(String(req.body?.password || ''), user.passwordHash)) {
      return res.status(401).json({ ok: false, error: '邮箱或密码错误' });
    }
    const token = createJwt(user);
    setAuthCookie(res, token);
    return res.json({ ok: true, user: sanitizeUser(user), token });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const session = getCurrentUser(req);
  if (!session) return res.status(401).json({ ok: false, error: '未登录' });
  return res.json({ ok: true, user: session });
});



app.get('/api/preferences/me', (req, res) => {
  const session = getCurrentUser(req);
  if (!session) return res.status(401).json({ ok: false, error: '未登录' });
  return res.json({ ok: true, preference: getUserPreferenceProfile(session.userId) });
});

app.get('/api/analytics/summary', (req, res) => {
  const session = getCurrentUser(req);
  if (!session) return res.status(401).json({ ok: false, error: '未登录' });
  const userScoped = req.query.scope !== 'all' || session.role !== 'admin';
  return res.json({ ok: true, analytics: buildProductAnalytics(userScoped ? session.userId : undefined), profiles: session.role === 'admin' && !userScoped ? listPreferenceProfiles().slice(0, 50) : undefined });
});

app.get('/api/templates', (_req, res) => {
  res.json({ templates: listTemplates(), usage: 'style_reference_only' });
});

app.get('/api/bgms', (_req, res) => {
  res.json({ bgms: listBgms(), note: 'AI 只会从这些 BGM 候选中自动选择。把对应 MP3 放到 apps/api/storage/bgm/ 即可生效。' });
});

app.get('/api/queue/stats', (_req, res) => res.json({ ok: true, queue: queueStats() }));

app.get('/api/jobs', (req, res) => {
  const session = getCurrentUser(req);
  const jobs = listJobs(100).filter((job) => canAccessJob(session, job, 'read'));
  res.json({ ok: true, jobs: jobs.map(createPublicJob) });
});

app.get('/api/jobs/:jobId', (req, res) => {
  try {
    const job = readJob(String(req.params.jobId || ''));
    if (!job) return res.status(404).json({ ok: false, error: '任务不存在' });
    if (!canAccessJob(getCurrentUser(req), job, 'read')) return res.status(403).json({ ok: false, error: '无权访问该作品' });
    return res.json({ ok: true, job: createPublicJob(job) });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get('/api/jobs/:jobId/metrics', (req, res) => {
  try {
    const job = readJob(String(req.params.jobId || ''));
    if (!job) return res.status(404).json({ ok: false, error: '任务不存在' });
    if (!canAccessJob(getCurrentUser(req), job, 'read')) return res.status(403).json({ ok: false, error: '无权访问该作品' });
    return res.json({ ok: true, metrics: readJobMetrics(job.jobId) });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get('/api/jobs/:jobId/events', (req, res) => {
  try {
    const job = readJob(String(req.params.jobId || ''));
    if (!job) return res.status(404).json({ ok: false, error: '任务不存在' });
    if (!canAccessJob(getCurrentUser(req), job, 'read')) return res.status(403).json({ ok: false, error: '无权访问该作品' });
    res.json({ ok: true, events: readJobEvents(job.jobId) });
  } catch (error) {
    res.status(400).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get('/share/:jobId', (req, res) => {
  const job = readJob(String(req.params.jobId || ''));
  if (!job) return res.status(404).send('作品不存在');
  if (job.shareVisibility === 'private') return res.status(403).send('该作品未公开分享');
  const version = job.versions.find((item) => item.versionId === job.activeVersionId) || job.versions.find((item) => !job.deletedVersionIds?.includes(item.versionId));
  const video = version?.videoUrl || version?.previewUrl || '';
  const cover = version?.coverUrl || '';
  const title = escapeHtml(version?.plan?.title || 'VlogForgeAI');
  const subtitle = escapeHtml(version?.plan?.subtitle || 'Generated by AI Director');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const pageLang = job.language === 'en' ? 'en' : 'zh-CN';
  res.end(`<!doctype html><html lang="${pageLang}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title><meta property="og:title" content="${title}"/><meta property="og:description" content="${subtitle}"/>${cover ? `<meta property="og:image" content="${cover}"/>` : ''}<style>body{margin:0;background:#111;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center}.card{width:min(420px,100vw);padding:20px}video,img{width:100%;border-radius:24px;background:#222;box-shadow:0 18px 60px rgba(0,0,0,.45)}h1{font-size:24px;margin:18px 0 8px}p{color:#bbb;line-height:1.6}.brand{margin-top:16px;color:#777;font-size:13px}</style></head><body><main class="card">${video ? `<video controls playsinline poster="${cover}"><source src="${video}" type="video/mp4"/></video>` : cover ? `<img src="${cover}"/>` : ''}<h1>${title}</h1><p>${subtitle}</p><div class="brand">VlogForgeAI · Generated by AI Director</div></main></body></html>`);
});

app.post('/api/bgm/upload', upload.array('bgm', 30), (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];
  if (!files.length) return res.status(400).json({ error: '请上传 MP3 BGM 文件' });
  for (const file of files) {
    const safeName = file.originalname.replace(/[\\/:*?"<>|]/g, '_');
    const target = path.resolve(bgmDir, safeName);
    fs.renameSync(file.path, target);
  }
  res.json({ ok: true, bgms: listBgms() });
});

app.post('/api/vlog/create', upload.fields([{ name: 'media', maxCount: 80 }]), async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const language = String(req.body?.language || 'zh') === 'en' ? 'en' : 'zh';
  const aiProvider = String(req.body?.aiProvider || config.defaultAiProvider || 'qwen') === 'gemini' ? 'gemini' : 'qwen';
  const jobId = nanoid(10);
  const jobDir = getJobDir(jobId);
  const mediaDir = path.resolve(jobDir, 'media');
  fs.mkdirSync(mediaDir, { recursive: true });

  try {
    const mediaFiles = getFilesByField(req.files, 'media');
    if (!mediaFiles.length) return res.status(400).json({ ok: false, error: '请至少上传 1 个视频或图片素材' });

    const assets: UploadedAsset[] = [];
    for (let index = 0; index < mediaFiles.length; index += 1) {
      const file = mediaFiles[index];
      detectMediaType(file.mimetype);
      const ext = path.extname(file.originalname) || (file.mimetype.startsWith('image/') ? '.jpg' : '.mp4');
      const fileName = `${String(index + 1).padStart(2, '0')}-${nanoid(6)}${ext}`;
      const target = path.resolve(mediaDir, fileName);
      fs.renameSync(file.path, target);
      file.path = target;
      file.filename = fileName;
      const assetHash = sha256File(target);
      const metadata = file.mimetype.startsWith('video/') ? await probeVideoMetadata(target) : undefined;
      const durationSeconds = metadata?.durationSeconds ?? (file.mimetype.startsWith('video/') ? await probeDurationSeconds(target) : undefined);
      assets.push(makeUploadedAsset({
        id: `asset_${index + 1}`,
        file,
        relativeStoragePath: `storage/jobs/${jobId}/media/${encodeURIComponent(fileName)}`,
        durationSeconds,
        assetHash,
        metadata,
      }));
    }

    const now = new Date().toISOString();
    const job: VlogJob = {
      jobId,
      userId: session.userId,
      shareVisibility: 'unlisted',
      shareSlug: nanoid(12),
      language,
      aiProvider,
      status: 'queued',
      stage: '素材已上传，任务已进入 AI 导演队列',
      progress: 6,
      createdAt: now,
      updatedAt: now,
      assets,
      versions: [],
      keptVersionIds: [],
      deletedVersionIds: [],
      analysisCacheHits: 0,
      personalizationHint: getUserPreferenceProfile(session.userId)?.promptHint,
      userPreferenceSnapshot: getUserPreferenceProfile(session.userId),
    };
    createJob(job, 'created');
    fs.writeFileSync(path.resolve(jobDir, 'assets.json'), JSON.stringify(assets, null, 2), 'utf-8');
    const task = enqueueTask({ type: 'create_vlog', jobId, payload: { assets, language, aiProvider } });
    res.json({ ok: true, jobId, taskId: task.taskId, statusUrl: `/api/jobs/${jobId}`, job: createPublicJob(job) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    res.status(500).json({ ok: false, jobId, error: detail });
  }
});

app.post('/api/vlog/revise', (req, res) => {
  const jobId = String(req.body?.jobId || '').trim();
  const suggestion = req.body?.suggestion as DirectorRevisionSuggestion | undefined;
  const language = String(req.body?.language || '') === 'en' ? 'en' : undefined;
  const aiProvider = String(req.body?.aiProvider || '') === 'gemini' ? 'gemini' : undefined;
  if (!jobId) return res.status(400).json({ ok: false, error: '缺少 jobId' });
  if (!suggestion || typeof suggestion !== 'object') return res.status(400).json({ ok: false, error: '缺少 AI 动态优化方向 suggestion' });
  const job = readJob(jobId);
  if (!job) return res.status(404).json({ ok: false, error: '任务不存在' });
  if (!canAccessJob(getCurrentUser(req), job, 'write')) return res.status(403).json({ ok: false, error: '无权修改该作品' });
  updateJob(jobId, { status: 'queued', stage: `已加入重新导演队列：${suggestion.label}`, progress: Math.max(job.progress, 60) }, 'revision queued');
  const task = enqueueTask({ type: 'revise_vlog', jobId, payload: { suggestion, language: language || job.language, aiProvider: aiProvider || job.aiProvider } });
  return res.json({ ok: true, jobId, taskId: task.taskId, message: `已加入重新导演队列：${suggestion.label}` });
});

app.post('/api/vlog/select-version', (req, res) => {
  const jobId = String(req.body?.jobId || '').trim();
  const versionId = sanitizeVersionId(req.body?.versionId);
  const job = readJob(jobId);
  if (!job) return res.status(404).json({ ok: false, error: '任务不存在' });
  if (!canAccessJob(getCurrentUser(req), job, 'write')) return res.status(403).json({ ok: false, error: '无权修改该作品' });
  if (!job.versions.some((v) => v.versionId === versionId)) return res.status(404).json({ ok: false, error: '版本不存在' });
  let next = updateJob(jobId, { activeVersionId: versionId }, `active ${versionId}`);
  next = appendFeedback(next, { userId: getCurrentUser(req)?.userId, versionId, action: 'select', createdAt: new Date().toISOString() });
  return res.json({ ok: true, job: createPublicJob(next) });
});

app.post('/api/vlog/keep-version', (req, res) => {
  const jobId = String(req.body?.jobId || '').trim();
  const versionId = sanitizeVersionId(req.body?.versionId);
  const job = readJob(jobId);
  if (!job) return res.status(404).json({ ok: false, error: '任务不存在' });
  if (!canAccessJob(getCurrentUser(req), job, 'write')) return res.status(403).json({ ok: false, error: '无权修改该作品' });
  const keptVersionIds = Array.from(new Set([...(job.keptVersionIds || []), versionId]));
  let next = updateJob(jobId, { keptVersionIds }, `keep ${versionId}`);
  next = appendFeedback(next, { userId: getCurrentUser(req)?.userId, versionId, action: 'keep', createdAt: new Date().toISOString() });
  return res.json({ ok: true, job: createPublicJob(next) });
});

app.post('/api/vlog/delete-version', (req, res) => {
  const jobId = String(req.body?.jobId || '').trim();
  const versionId = sanitizeVersionId(req.body?.versionId);
  const job = readJob(jobId);
  if (!job) return res.status(404).json({ ok: false, error: '任务不存在' });
  if (!canAccessJob(getCurrentUser(req), job, 'write')) return res.status(403).json({ ok: false, error: '无权修改该作品' });
  const deletedVersionIds = Array.from(new Set([...(job.deletedVersionIds || []), versionId]));
  const activeVersionId = job.activeVersionId === versionId ? job.versions.find((v) => v.versionId !== versionId)?.versionId : job.activeVersionId;
  let next = updateJob(jobId, { deletedVersionIds, activeVersionId }, `delete ${versionId}`);
  next = appendFeedback(next, { userId: getCurrentUser(req)?.userId, versionId, action: 'delete', createdAt: new Date().toISOString() });
  return res.json({ ok: true, job: createPublicJob(next) });
});

app.post('/api/vlog/export-square', (req, res) => {
  const jobId = String(req.body?.jobId || '').trim();
  const versionId = sanitizeVersionId(req.body?.versionId);
  const job = readJob(jobId);
  if (!job) return res.status(404).json({ ok: false, error: '任务不存在' });
  if (!canAccessJob(getCurrentUser(req), job, 'write')) return res.status(403).json({ ok: false, error: '无权修改该作品' });
  if (!job.versions.some((v) => v.versionId === versionId)) return res.status(404).json({ ok: false, error: '版本不存在' });
  updateJob(jobId, { status: 'queued', stage: `已加入方形版导出队列：${versionId}`, progress: Math.max(job.progress, 90) }, 'square queued');
  const task = enqueueTask({ type: 'export_square', jobId, payload: { versionId } });
  return res.json({ ok: true, taskId: task.taskId, message: '已加入 1:1 方形版导出队列' });
});



app.post('/api/vlog/feedback', (req, res) => {
  const jobId = String(req.body?.jobId || '').trim();
  const versionId = sanitizeVersionId(req.body?.versionId);
  const action = String(req.body?.action || '').trim() as VlogVersionFeedback['action'];
  const note = String(req.body?.note || '').trim().slice(0, 500) || undefined;
  if (!['like', 'dislike', 'keep', 'share', 'download', 'delete', 'select', 'save', 'hide_captions', 'change_bgm', 'too_many_effects', 'too_slow', 'too_fast'].includes(action)) return res.status(400).json({ ok: false, error: '非法反馈类型' });
  const job = readJob(jobId);
  if (!job) return res.status(404).json({ ok: false, error: '任务不存在' });
  if (!canAccessJob(getCurrentUser(req), job, 'write')) return res.status(403).json({ ok: false, error: '无权修改该作品' });
  if (!job.versions.some((v) => v.versionId === versionId)) return res.status(404).json({ ok: false, error: '版本不存在' });
  const next = appendFeedback(job, { userId: getCurrentUser(req)?.userId, versionId, action, note, createdAt: new Date().toISOString() });
  return res.json({ ok: true, job: createPublicJob(next) });
});

app.post('/api/vlog/share-settings', (req, res) => {
  const jobId = String(req.body?.jobId || '').trim();
  const visibility = String(req.body?.visibility || 'unlisted') as VlogJob['shareVisibility'];
  if (!['private', 'unlisted', 'public'].includes(String(visibility))) return res.status(400).json({ ok: false, error: '非法分享权限' });
  const job = readJob(jobId);
  if (!job) return res.status(404).json({ ok: false, error: '任务不存在' });
  if (!canAccessJob(getCurrentUser(req), job, 'write')) return res.status(403).json({ ok: false, error: '无权修改该作品' });
  const next = updateJob(jobId, { shareVisibility: visibility }, `share ${visibility}`);
  return res.json({ ok: true, job: createPublicJob(next), shareUrl: `${config.publicBaseUrl || `http://localhost:${config.port}`}/share/${jobId}` });
});

app.listen(config.port, () => {
  console.log(`VlogForgeAI API: http://localhost:${config.port}`);
  console.log(`Static storage: http://localhost:${config.port}/storage`);
  console.log(`Share page: http://localhost:${config.port}/share/:jobId`);
  console.log(`Queue stats:`, queueStats());
  console.log(`BGM library: ${bgmDir}`);
});
