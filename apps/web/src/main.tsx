import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { AuthSession, BgmItem, CommercialVlogVersion, DirectorRevisionSuggestion, ProductAnalytics, UserPreferenceProfile, VlogJob } from '@ai-vlog/shared';
import './styles.css';

type Lang = 'zh' | 'en';
type AiProvider = 'qwen' | 'gemini';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8787';
const BRAND = 'VlogForgeAI';

const copy = {
  zh: {
    brandSub: '上传素材，AI 自动剪成生活故事',
    login: '登录', register: '注册', goLogin: '去登录', logout: '退出', nickname: '昵称', email: '邮箱', password: '密码',
    language: '语言', chinese: '中文', english: 'English', model: '模型', qwen: '千问', gemini: 'Gemini',
    prefTitle: 'AI 导演偏好', noPref: '暂无偏好数据', works: '作品', likes: '喜欢', keeps: '保留', feedback: '反馈', style: '风格', pace: '节奏', duration: '片长', morePrefs: '个性化数据',
    uploadTitle: '1. 上传素材', uploadStrong: '上传视频/图片', uploadHint: '乱序也可以，AI 自动筛选排序。', material: '素材',
    bgmTitle: '2. BGM 库', bgmHint: 'AI 自动从你的 BGM 库里选。', importBgm: '导入 BGM MP3', bgmFileHint: '保持原文件名，AI 自动匹配。', importing: '导入中...', importCount: (n: number) => `导入 ${n} 个 BGM`, matched: (a: number, b: number) => `已匹配 ${a}/${b} 个 BGM 文件`,
    generateTitle: '3. 一键成片Vlog', generateBtn: '一键成片Vlog', uploading: '上传中...', ready: '准备就绪', status: '状态', queue: '渲染队列', running: '运行', pending: '等待', cacheHit: '素材分析缓存命中',
    stages: ['上传素材', 'AI 素材评分', '个性化导演', '极速预览', 'AI 质量评估', '推荐版本'],
    resultTitle: '4. 生成结果', resultEmptyTitle: '生成结果会显示在这里', waitingPreview: '等待极速预览...', resultEmptyHint: '上传素材后，一键成片Vlog', directorDecision: 'AI 导演决策', directing: 'AI 正在导演中...', noTask: '还没有生成任务', waiting: '等待生成', autoDesc: 'AI 会自动挑素材、讲故事、选 BGM', resultDesc: '结果、版本和优化按钮会直接显示在这里。',
    story: '故事', bgm: 'BGM', loadedAudio: '已加载音频', missingBgm: '未找到对应 MP3，视频无 BGM', recommendedVersion: 'AI 推荐版本', qualityEval: 'AI 质量评估', qualityDone: 'AI 已完成质量评分。', emotion: '情绪', captions: '字幕', share: '分享', todo: '待优化', storyLine: '故事线', directorNote: '导演说明',
    openDownload: '打开 / 下载当前版本', openShare: '打开分享页', openCover: '打开封面', keep: '保留这个版本', delete: '删除这个版本', square: '导出 1:1 方形版', like: '喜欢', dislike: '不喜欢', tooManyEffects: '特效太多', tooFast: '节奏太快', tooSlow: '节奏太慢', downloadSquare: '下载 1:1 方形版',
    reviseTitle: '继续优化：按钮由 AI 根据本次素材生成', generating: '生成中...', debug: '开发调试数据', assetScore: '素材评分', currentPlan: '当前版本 Director Plan', metricsHint: '观测接口', history: '5. 历史作品', noApi: '无法连接 API，请先启动 npm run dev', authFailed: '认证失败', createFailed: '创建任务失败', needMedia: '请先上传视频或图片素材', actionFailed: '操作失败', bgmFailed: 'BGM 导入失败',
    hdReady: '高清已完成', previewReady: '预览可看 · 高清生成中', versionPending: '生成中', kept: '已保留', aiRecommend: 'AI 推荐', qualityScore: 'AI 质量分', evaluating: 'AI 评估中', pendingEval: '待评估',
  },
  en: {
    brandSub: 'Upload clips and let AI turn them into a life story',
    login: 'Sign in', register: 'Sign up', goLogin: 'Sign in', logout: 'Sign out', nickname: 'Name', email: 'Email', password: 'Password',
    language: 'Language', chinese: '中文', english: 'English', model: 'Model', qwen: 'Qwen', gemini: 'Gemini',
    prefTitle: 'AI Director Profile', noPref: 'No preference data yet', works: 'Works', likes: 'Likes', keeps: 'Kept', feedback: 'Feedback', style: 'Style', pace: 'Pace', duration: 'Duration', morePrefs: 'Personalization data',
    uploadTitle: '1. Upload media', uploadStrong: 'Upload videos/images', uploadHint: 'Order does not matter. AI will select and sort the best moments.', material: 'Media',
    bgmTitle: '2. BGM Library', bgmHint: 'AI will choose from your BGM library automatically.', importBgm: 'Import BGM MP3', bgmFileHint: 'Keep original filenames for matching.', importing: 'Importing...', importCount: (n: number) => `Import ${n} BGM files`, matched: (a: number, b: number) => `${a}/${b} BGM files matched`,
    generateTitle: '3. One-click Vlog', generateBtn: 'Create Vlog', uploading: 'Uploading...', ready: 'Ready', status: 'Status', queue: 'Render queue', running: 'Running', pending: 'Pending', cacheHit: 'Analysis cache hit',
    stages: ['Upload media', 'AI scoring', 'AI directing', 'Fast preview', 'Quality check', 'Recommended version'],
    resultTitle: '4. Result', resultEmptyTitle: 'Generated result will appear here', waitingPreview: 'Waiting for fast preview...', resultEmptyHint: 'Upload media, then create a Vlog', directorDecision: 'AI Director Decision', directing: 'AI is directing...', noTask: 'No task yet', waiting: 'Waiting', autoDesc: 'AI will select clips, build a story, and choose BGM', resultDesc: 'Results, versions, and AI optimization buttons will appear here.',
    story: 'Story', bgm: 'BGM', loadedAudio: 'Audio loaded', missingBgm: 'Matching MP3 not found; video has no BGM', recommendedVersion: 'AI recommended', qualityEval: 'AI quality check', qualityDone: 'AI quality check completed.', emotion: 'Emotion', captions: 'Captions', share: 'Share', todo: 'Needs work', storyLine: 'Story arc', directorNote: 'Director note',
    openDownload: 'Open / Download version', openShare: 'Open share page', openCover: 'Open cover', keep: 'Keep this version', delete: 'Delete this version', square: 'Export 1:1 square', like: 'Like', dislike: 'Dislike', tooManyEffects: 'Too many effects', tooFast: 'Too fast', tooSlow: 'Too slow', downloadSquare: 'Download 1:1 square',
    reviseTitle: 'Optimize: buttons are generated by AI from this media', generating: 'Generating...', debug: 'Developer debug data', assetScore: 'Asset score', currentPlan: 'Current Director Plan', metricsHint: 'Metrics endpoint', history: '5. History', noApi: 'Cannot connect to API. Start npm run dev first.', authFailed: 'Authentication failed', createFailed: 'Failed to create task', needMedia: 'Please upload videos or images first', actionFailed: 'Action failed', bgmFailed: 'BGM import failed',
    hdReady: 'HD ready', previewReady: 'Preview ready · HD rendering', versionPending: 'Generating', kept: 'Kept', aiRecommend: 'AI recommended', qualityScore: 'AI quality', evaluating: 'Evaluating', pendingEval: 'Pending evaluation',
  },
} satisfies Record<Lang, Record<string, any>>;

function getInitialLang(): Lang {
  const saved = window.localStorage.getItem('vlogforgeai.lang');
  return saved === 'en' ? 'en' : 'zh';
}
function getInitialProvider(): AiProvider {
  const saved = window.localStorage.getItem('vlogforgeai.provider');
  return saved === 'gemini' ? 'gemini' : 'qwen';
}

function StepPill({ active, done, children }: { active?: boolean; done?: boolean; children: React.ReactNode }) {
  return <div className={`step ${active ? 'active' : ''} ${done ? 'done' : ''}`}>{children}</div>;
}

function useJobPolling(jobId: string | null, onJob: (job: VlogJob) => void, onError: (message: string) => void) {
  useEffect(() => {
    if (!jobId) return;
    let stopped = false;
    let timer: number | undefined;
    const tick = async () => {
      try {
        const res = await fetch(`${API}/api/jobs/${jobId}`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to query task');
        if (!stopped) {
          onJob(data.job);
          if (!['completed', 'failed'].includes(data.job.status)) timer = window.setTimeout(tick, 1500);
          else if (data.job.status === 'failed') onError(data.job.userFacingError || data.job.error || 'Task failed');
        }
      } catch (e) {
        if (!stopped) {
          onError(e instanceof Error ? e.message : String(e));
          timer = window.setTimeout(tick, 2500);
        }
      }
    };
    tick();
    return () => { stopped = true; if (timer) window.clearTimeout(timer); };
  }, [jobId]);
}

function stageIndex(job?: VlogJob | null) {
  if (!job) return 0;
  if (['queued', 'uploaded'].includes(job.status)) return 0;
  if (job.status === 'analyzing') return 1;
  if (job.status === 'directing') return 2;
  if (job.status === 'rendering_preview' || job.status === 'partial_ready') return 3;
  if (job.status === 'rendering_hd' || job.status === 'rendering_versions' || job.status === 'revising') return 4;
  if (job.status === 'completed') return 5;
  return 0;
}

function qualityClass(score?: number) {
  if (typeof score !== 'number') return 'unknown';
  if (score >= 88) return 'excellent';
  if (score >= 78) return 'good';
  return 'weak';
}

function VersionCard({ version, active, kept, deleted, onSelect, t }: { version: CommercialVlogVersion; active: boolean; kept?: boolean; deleted?: boolean; onSelect: () => void; t: Record<string, any> }) {
  const score = version.quality?.overallScore;
  return (
    <button className={`versionCard ${active ? 'active' : ''} ${deleted ? 'deleted' : ''} ${version.isRecommended ? 'recommended' : ''}`} onClick={onSelect}>
      <div className="versionVideoWrap">
        {version.coverUrl ? <img src={version.coverUrl} className="versionCover" /> : version.previewUrl || version.videoUrl ? <video src={version.previewUrl || version.videoUrl} muted playsInline className="versionVideo" /> : <div className="versionPending">{t.versionPending}</div>}
        {kept ? <span className="keptBadge">{t.kept}</span> : null}
        {version.isRecommended ? <span className="recommendBadge">{t.aiRecommend}</span> : null}
      </div>
      <div className="versionInfo">
        <strong>{version.label}</strong>
        <span>{version.hdStatus === 'ready' ? t.hdReady : version.previewUrl ? t.previewReady : `${version.progress}% · ${version.status}`}</span>
        <span className={`qualityMini ${qualityClass(score)}`}>{typeof score === 'number' ? `${t.qualityScore} ${score}` : version.qualityStatus === 'evaluating' ? t.evaluating : t.pendingEval}</span>
        {version.quality?.recommendationReason ? <small>{version.quality.recommendationReason}</small> : version.description ? <small>{version.description}</small> : null}
      </div>
    </button>
  );
}

function App() {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [aiProvider, setAiProvider] = useState<AiProvider>(getInitialProvider);
  const t = copy[lang];
  const [bgms, setBgms] = useState<BgmItem[]>([]);
  const [history, setHistory] = useState<VlogJob[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [libraryFiles, setLibraryFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<VlogJob | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingBgm, setUploadingBgm] = useState(false);
  const [revisionLoading, setRevisionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthSession | null>(null);
  const [preference, setPreference] = useState<UserPreferenceProfile | null>(null);
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('123456');
  const [displayName, setDisplayName] = useState('VlogForgeAI User');
  const playerRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    document.title = BRAND;
    window.localStorage.setItem('vlogforgeai.lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);
  useEffect(() => { window.localStorage.setItem('vlogforgeai.provider', aiProvider); }, [aiProvider]);

  const loadMe = () => fetch(`${API}/api/auth/me`, { credentials: 'include' })
    .then((r) => r.json())
    .then((data) => { if (data.ok) { setUser(data.user); loadPreference(); loadAnalytics(); } })
    .catch(() => undefined);
  const loadBgms = () => fetch(`${API}/api/bgms`, { credentials: 'include' }).then((r) => r.json()).then((data) => setBgms(data.bgms || [])).catch(() => setError(t.noApi));
  const loadHistory = () => fetch(`${API}/api/jobs`, { credentials: 'include' }).then((r) => r.json()).then((data) => setHistory(data.jobs || [])).catch(() => undefined);
  const loadPreference = () => fetch(`${API}/api/preferences/me`, { credentials: 'include' }).then((r) => r.json()).then((data) => { if (data.ok) setPreference(data.preference || null); }).catch(() => undefined);
  const loadAnalytics = () => fetch(`${API}/api/analytics/summary`, { credentials: 'include' }).then((r) => r.json()).then((data) => { if (data.ok) setAnalytics(data.analytics || null); }).catch(() => undefined);

  const submitAuth = async () => {
    setError(null);
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || t.authFailed);
      setUser(data.user);
      loadHistory(); loadPreference(); loadAnalytics();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };

  const logout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => undefined);
    setUser(null); setHistory([]); setPreference(null); setAnalytics(null); setJob(null); setJobId(null);
  };

  useEffect(() => {
    fetch(`${API}/api/health`, { credentials: 'include' }).catch(() => setError(t.noApi));
    loadMe(); loadBgms(); loadHistory(); loadPreference(); loadAnalytics();
  }, []);

  useJobPolling(jobId, (nextJob) => {
    setJob(nextJob);
    if (!selectedVersionId && nextJob.versions?.length) setSelectedVersionId(nextJob.activeVersionId || nextJob.versions[0].versionId);
    if (nextJob.activeVersionId && nextJob.activeVersionId !== selectedVersionId && ['completed', 'partial_ready'].includes(nextJob.status)) setSelectedVersionId(nextJob.activeVersionId);
    loadHistory(); loadPreference(); loadAnalytics();
  }, setError);

  const visibleVersions = useMemo(() => (job?.versions || []).filter((v) => !(job?.deletedVersionIds || []).includes(v.versionId)), [job]);
  const activeVersion = useMemo(() => {
    if (!visibleVersions.length) return null;
    return visibleVersions.find((item) => item.versionId === selectedVersionId) || visibleVersions[0];
  }, [visibleVersions, selectedVersionId]);

  const playableVersion = useMemo(() => {
    if (!visibleVersions.length) return null;
    const hasUrl = (item?: CommercialVlogVersion | null) => Boolean(item?.videoUrl || item?.previewUrl);
    if (hasUrl(activeVersion)) return activeVersion;
    const recommended = visibleVersions.find((item) => item.versionId === job?.recommendedVersionId && hasUrl(item));
    if (recommended) return recommended;
    const jobActive = visibleVersions.find((item) => item.versionId === job?.activeVersionId && hasUrl(item));
    if (jobActive) return jobActive;
    return visibleVersions.find((item) => hasUrl(item)) || activeVersion;
  }, [visibleVersions, activeVersion, job?.recommendedVersionId, job?.activeVersionId]);

  const displayVersion = playableVersion || activeVersion;
  const activePlan = displayVersion?.plan;
  const currentStageIndex = stageIndex(job);
  const existingBgmCount = bgms.filter((b) => b.exists).length;
  const playableUrl = displayVersion?.videoUrl || displayVersion?.previewUrl;

  const handleUploadBgms = async () => {
    if (!libraryFiles.length) return;
    setUploadingBgm(true); setError(null);
    const form = new FormData(); libraryFiles.forEach((file) => form.append('bgm', file));
    try {
      const res = await fetch(`${API}/api/bgm/upload`, { method: 'POST', body: form, credentials: 'include' });
      const data = await res.json(); if (!res.ok || !data.ok) throw new Error(data.error || t.bgmFailed);
      setBgms(data.bgms || []); setLibraryFiles([]);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setUploadingBgm(false); }
  };

  const handleCreate = async () => {
    if (!mediaFiles.length) { setError(t.needMedia); return; }
    setSubmitting(true); setJob(null); setJobId(null); setSelectedVersionId(null); setError(null);
    const form = new FormData();
    mediaFiles.forEach((file) => form.append('media', file));
    form.append('language', lang);
    form.append('aiProvider', aiProvider);
    try {
      const res = await fetch(`${API}/api/vlog/create`, { method: 'POST', body: form, credentials: 'include' });
      const data = await res.json(); if (!res.ok || !data.ok) throw new Error(data.error || t.createFailed);
      setJobId(data.jobId); setJob(data.job); loadBgms(); loadHistory();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSubmitting(false); }
  };

  const postAction = async (url: string, body: unknown) => {
    const res = await fetch(`${API}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' });
    const data = await res.json(); if (!res.ok || !data.ok) throw new Error(data.error || t.actionFailed);
    if (data.job) setJob(data.job);
    if (job?.jobId) { setJobId(null); window.setTimeout(() => setJobId(job.jobId), 300); }
    loadHistory(); loadPreference(); loadAnalytics();
  };

  const handleRevise = async (suggestion: DirectorRevisionSuggestion) => {
    if (!job?.jobId) return;
    const loadingKey = suggestion.id || suggestion.label; setRevisionLoading(loadingKey); setError(null);
    try { await postAction('/api/vlog/revise', { jobId: job.jobId, suggestion, language: lang, aiProvider }); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setRevisionLoading(null); }
  };

  const selectVersion = async (versionId: string) => {
    setSelectedVersionId(versionId);
    if (job?.jobId) await postAction('/api/vlog/select-version', { jobId: job.jobId, versionId }).catch(() => undefined);
  };

  return (
    <div className="page">
      <header className="topNav">
        <div className="brandBlock">
          <div className="brandLogo">VF</div>
          <div><strong>{BRAND}</strong><span>{t.brandSub}</span></div>
        </div>
        <div className="topControls">
          <label className="navSelect"><span>{t.language}</span><select value={lang} onChange={(e) => setLang(e.target.value as Lang)}><option value="zh">{t.chinese}</option><option value="en">{t.english}</option></select></label>
          <label className="navSelect"><span>{t.model}</span><select value={aiProvider} onChange={(e) => setAiProvider(e.target.value as AiProvider)}><option value="qwen">{t.qwen}</option><option value="gemini">{t.gemini}</option></select></label>
          {!user ? <div className="topAuth">
            {authMode === 'register' ? <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t.nickname} /> : null}
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.password} type="password" />
            <button className="primary smallPrimary" onClick={submitAuth}>{authMode === 'login' ? t.login : t.register}</button>
            <button className="navTextButton" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? t.register : t.goLogin}</button>
          </div> : <div className="topUser">
            <div className="avatar">{(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}</div>
            <div className="userText"><strong>{user.displayName}</strong><span>{user.email} · {user.role}</span></div>
            <button className="navTextButton" onClick={logout}>{t.logout}</button>
          </div>}
        </div>
      </header>

      <main className="grid">
        {user ? <section className="panel wide preferencePanel compactPreference">
          <div className="compactPrefHeader">
            <h2>{t.prefTitle}</h2>
            {analytics ? <div className="compactStats"><span>{t.works} {analytics.generatedJobs}</span><span>{t.likes} {analytics.likes}</span><span>{t.keeps} {analytics.keeps}</span></div> : null}
          </div>
          {preference ? <div className="prefChips">
            <span>{t.feedback} {preference.sampleSize}</span>
            <span>{t.style} {preference.preferredVisualStyles.slice(0, 2).join(' / ') || '-'}</span>
            <span>{t.pace} {preference.preferredPaces.slice(0, 2).join(' / ') || '-'}</span>
            <span>{t.duration} {preference.preferredDurationSeconds}s</span>
          </div> : <p className="hint">{t.noPref}</p>}
          {(preference?.promptHint || analytics) ? <details className="preferenceDetails"><summary>{t.morePrefs}</summary>
            {preference?.promptHint ? <p>{preference.promptHint}</p> : null}
            {analytics ? <div className="analyticsInline"><span>Completed {analytics.completedJobs}</span><span>{t.feedback} {analytics.feedbackCount}</span><span>{t.share} {analytics.shares}</span><span>Recommend {analytics.recommendedSelectedRate ?? 0}%</span><span>Best {analytics.averageBestQualityScore ?? '-'}</span></div> : null}
          </details> : null}
        </section> : null}

        <section className="panel compactFlowPanel">
          <h2>{t.uploadTitle}</h2>
          <label className="uploadBox"><input type="file" multiple accept="video/*,image/*" onChange={(e) => setMediaFiles(Array.from(e.target.files || []))} /><strong>{t.uploadStrong}</strong><span>{t.uploadHint}</span></label>
          <div className="fileList">{mediaFiles.map((file) => <div key={`${file.name}-${file.size}`}>{t.material}：{file.name}</div>)}</div>
        </section>

        <section className="panel compactFlowPanel">
          <h2>{t.bgmTitle}</h2>
          <p className="hint">{t.bgmHint}</p>
          <label className="uploadBox small"><input type="file" multiple accept="audio/mpeg,audio/mp3,audio/*" onChange={(e) => setLibraryFiles(Array.from(e.target.files || []))} /><strong>{t.importBgm}</strong><span>{t.bgmFileHint}</span></label>
          {libraryFiles.length ? <button className="secondary" onClick={handleUploadBgms} disabled={uploadingBgm}>{uploadingBgm ? t.importing : t.importCount(libraryFiles.length)}</button> : null}
          <div className="hint">{t.matched(existingBgmCount, bgms.length)}</div>
          <div className="bgmList">{bgms.map((bgm) => <span className={bgm.exists ? 'bgm exists' : 'bgm'} key={bgm.id}>{bgm.title}{bgm.exists ? ' ✓' : ''}</span>)}</div>
        </section>

        <section className="panel wide compactGeneratePanel">
          <h2>{t.generateTitle}</h2>
          <div className="steps">{t.stages.map((s: string, i: number) => <StepPill key={s} active={currentStageIndex === i} done={currentStageIndex > i}>{s}</StepPill>)}</div>
          <div className="progressTrack"><div className="progressFill" style={{ width: `${job?.progress || 0}%` }} /></div>
          <button className="primary" onClick={handleCreate} disabled={submitting || !mediaFiles.length || !user}>{submitting ? t.uploading : t.generateBtn}</button>
          <div className="status">{t.status}：{job ? (lang === 'zh' ? job.stage : job.status) : t.ready} {job ? `· ${job.progress}%` : ''}</div>
          {job?.renderQueue ? <div className="hint">{t.queue}：{t.running} {job.renderQueue.processing} · {t.pending} {job.renderQueue.pending}</div> : null}
          {job?.analysisCacheHits ? <div className="hint">{t.cacheHit}：{job.analysisCacheHits}/{job.assets?.length || 0}</div> : null}
          {job?.qualitySummary ? <div className="qualitySummary">AI {job.qualitySummary.evaluatedVersions} · Best {job.qualitySummary.bestScore} · Avg {job.qualitySummary.averageScore}</div> : null}
          {error ? <pre className="error">{error}</pre> : null}
          {job?.userFacingError ? <div className="friendlyError">{job.userFacingError}</div> : null}
        </section>

        <section className="panel wide result alwaysResult">
          <h2>{t.resultTitle}</h2>
          <div className="resultTop commercialResult">
            <div>
              {playableUrl ? <video ref={playerRef} src={playableUrl} controls playsInline className="video" poster={displayVersion?.coverUrl} /> : <div className="video emptyVideo"><strong>{t.resultEmptyTitle}</strong><span>{job ? t.waitingPreview : t.resultEmptyHint}</span></div>}
              <div className="versionStrip">{visibleVersions.map((version) => <VersionCard key={version.versionId} version={version} active={displayVersion?.versionId === version.versionId} kept={(job?.keptVersionIds || []).includes(version.versionId)} deleted={false} onSelect={() => selectVersion(version.versionId)} t={t} />)}</div>
            </div>
            <div className="summaryCard">
              <div className="eyebrow">{t.directorDecision}</div>
              <h3>{activePlan?.title || t.directing}</h3>
              <p>{activePlan?.subtitle || (job ? (lang === 'zh' ? job.stage : job.status) : t.noTask)}</p>
              {!activePlan ? <div className="resultPlaceholderInfo"><div className="eyebrow">{t.waiting}</div><h3>{t.autoDesc}</h3><p>{t.resultDesc}</p></div> : null}
              {activePlan ? <>
                <div className="meta"><span>{t.story}：{activePlan.storyType}</span><span>{t.style}：{activePlan.visualStyle}</span><span>{t.pace}：{activePlan.pace}</span></div>
                <div className="meta"><span>{t.bgm}：{displayVersion?.selectedBgm?.title || activePlan.bgmTitle || activePlan.bgmId}</span><span>{displayVersion?.bgmUrl ? t.loadedAudio : t.missingBgm}</span></div>
                {displayVersion?.quality ? <div className={`qualityBox ${qualityClass(displayVersion.quality.overallScore)}`}>
                  <div><strong>{displayVersion.isRecommended ? t.recommendedVersion : t.qualityEval}</strong><span>{displayVersion.quality.overallScore}</span></div>
                  <p>{displayVersion.quality.recommendationReason || t.qualityDone}</p>
                  <div className="qualityGrid"><span>{t.story} {displayVersion.quality.storyScore}</span><span>{t.emotion} {displayVersion.quality.emotionScore}</span><span>{t.captions} {displayVersion.quality.captionScore}</span><span>{t.bgm} {displayVersion.quality.bgmMatchScore}</span><span>{t.share} {displayVersion.quality.shareWorthinessScore}</span></div>
                  {displayVersion.quality.problems?.length ? <small>{t.todo}：{displayVersion.quality.problems.join('；')}</small> : null}
                </div> : null}
                <p className="director"><strong>{t.storyLine}：</strong>{activePlan.storyArc}</p>
                <p className="director"><strong>{t.directorNote}：</strong>{activePlan.directorComment}</p>
                <div className="actionRow">
                  {playableUrl ? <a className="download" href={playableUrl} target="_blank" rel="noreferrer" onClick={() => displayVersion && job && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: displayVersion.versionId, action: 'download' }).catch(() => undefined)}>{t.openDownload}</a> : null}
                  {job?.jobId ? <a className="download" href={`${API}/share/${job?.jobId}`} target="_blank" rel="noreferrer" onClick={() => displayVersion && job && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: displayVersion.versionId, action: 'share' }).catch(() => undefined)}>{t.openShare}</a> : null}
                  {displayVersion?.coverUrl ? <a className="download secondaryLink" href={displayVersion.coverUrl} target="_blank" rel="noreferrer">{t.openCover}</a> : null}
                </div>
                <div className="actionRow">
                  <button className="secondary" onClick={() => displayVersion && job && postAction('/api/vlog/keep-version', { jobId: job.jobId, versionId: displayVersion.versionId })}>{t.keep}</button>
                  <button className="secondary" onClick={() => displayVersion && job && postAction('/api/vlog/delete-version', { jobId: job.jobId, versionId: displayVersion.versionId })}>{t.delete}</button>
                  <button className="secondary" onClick={() => displayVersion && job && postAction('/api/vlog/export-square', { jobId: job.jobId, versionId: displayVersion.versionId })}>{t.square}</button>
                  <button className="secondary" onClick={() => displayVersion && job && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: displayVersion.versionId, action: 'like' })}>{t.like}</button>
                  <button className="secondary" onClick={() => displayVersion && job && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: displayVersion.versionId, action: 'dislike' })}>{t.dislike}</button>
                  <button className="secondary" onClick={() => displayVersion && job && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: displayVersion.versionId, action: 'too_many_effects' })}>{t.tooManyEffects}</button>
                  <button className="secondary" onClick={() => displayVersion && job && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: displayVersion.versionId, action: 'too_fast' })}>{t.tooFast}</button>
                  <button className="secondary" onClick={() => displayVersion && job && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: displayVersion.versionId, action: 'too_slow' })}>{t.tooSlow}</button>
                </div>
                {displayVersion?.squareVideoUrl ? <a className="download" href={displayVersion.squareVideoUrl} target="_blank" rel="noreferrer">{t.downloadSquare}</a> : null}
                <div className="revisionBlock"><div className="revisionTitle">{t.reviseTitle}</div><div className="revisionActions">
                  {(activePlan.revisionSuggestions || []).map((suggestion) => { const key = suggestion.id || suggestion.label; return <button key={key} className="revisionButton" onClick={() => handleRevise(suggestion)} disabled={Boolean(revisionLoading)} title={suggestion.instruction || suggestion.reason || ''}><strong>{revisionLoading === key ? t.generating : suggestion.label}</strong><span>{suggestion.reason || suggestion.expectedChange || suggestion.instruction}</span></button>; })}
                </div></div>
              </> : null}
            </div>
          </div>
          {job ? <details className="debugDetails"><summary>{t.debug}</summary><div className="columns"><div><h3>{t.assetScore}</h3><pre>{JSON.stringify(job.analysis || [], null, 2)}</pre></div><div><h3>{t.currentPlan}</h3><pre>{JSON.stringify(activePlan || {}, null, 2)}</pre></div></div></details> : null}
          {job ? <p className="hint">{t.metricsHint}：<code>/api/jobs/{job?.jobId}/metrics</code></p> : null}
        </section>

        <section className="panel wide historyPanel">
          <h2>{t.history}</h2>
          <div className="historyGrid">{history.map((item) => <button key={item.jobId} className="historyCard" onClick={() => { setJobId(item.jobId); setJob(item); setSelectedVersionId(item.activeVersionId || item.versions?.[0]?.versionId || null); }}><strong>{item.versions?.[0]?.plan?.title || item.jobId}</strong><span>{item.status} · {item.progress}%</span><small>{item.updatedAt}</small></button>)}</div>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
