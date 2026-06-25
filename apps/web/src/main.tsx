import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { AuthSession, BgmItem, CommercialVlogVersion, DirectorRevisionSuggestion, ProductAnalytics, UserPreferenceProfile, VlogJob } from '@ai-vlog/shared';
import './styles.css';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

const stageList = ['上传素材', 'AI 素材评分', '个性化导演', '极速预览', 'AI 质量评估', '推荐版本'];

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
        if (!res.ok || !data.ok) throw new Error(data.error || '查询任务失败');
        if (!stopped) {
          onJob(data.job);
          if (!['completed', 'failed'].includes(data.job.status)) timer = window.setTimeout(tick, 1500);
          else if (data.job.status === 'failed') onError(data.job.userFacingError || data.job.error || '任务失败');
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

function VersionCard({ version, active, kept, deleted, onSelect }: { version: CommercialVlogVersion; active: boolean; kept?: boolean; deleted?: boolean; onSelect: () => void }) {
  const score = version.quality?.overallScore;
  return (
    <button className={`versionCard ${active ? 'active' : ''} ${deleted ? 'deleted' : ''} ${version.isRecommended ? 'recommended' : ''}`} onClick={onSelect}>
      <div className="versionVideoWrap">
        {version.coverUrl ? <img src={version.coverUrl} className="versionCover" /> : version.previewUrl || version.videoUrl ? <video src={version.previewUrl || version.videoUrl} muted playsInline className="versionVideo" /> : <div className="versionPending">生成中</div>}
        {kept ? <span className="keptBadge">已保留</span> : null}
        {version.isRecommended ? <span className="recommendBadge">AI 推荐</span> : null}
      </div>
      <div className="versionInfo">
        <strong>{version.label}</strong>
        <span>{version.hdStatus === 'ready' ? '高清已完成' : version.previewUrl ? '预览可看 · 高清生成中' : `${version.progress}% · ${version.status}`}</span>
        <span className={`qualityMini ${qualityClass(score)}`}>{typeof score === 'number' ? `AI 质量分 ${score}` : version.qualityStatus === 'evaluating' ? 'AI 评估中' : '待评估'}</span>
        {version.quality?.recommendationReason ? <small>{version.quality.recommendationReason}</small> : version.description ? <small>{version.description}</small> : null}
      </div>
    </button>
  );
}

function App() {
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
  const [displayName, setDisplayName] = useState('AI Vlog 用户');
  const playerRef = useRef<HTMLVideoElement | null>(null);

  const loadMe = () => fetch(`${API}/api/auth/me`, { credentials: 'include' })
    .then((r) => r.json())
    .then((data) => { if (data.ok) { setUser(data.user); loadPreference(); loadAnalytics(); } })
    .catch(() => undefined);
  const loadBgms = () => fetch(`${API}/api/bgms`, { credentials: 'include' }).then((r) => r.json()).then((data) => setBgms(data.bgms || [])).catch(() => setError('无法连接 API，请先启动 npm run dev'));
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
      if (!res.ok || !data.ok) throw new Error(data.error || '认证失败');
      setUser(data.user);
      loadHistory(); loadPreference(); loadAnalytics();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const logout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => undefined);
    setUser(null); setHistory([]); setPreference(null); setAnalytics(null); setJob(null); setJobId(null);
  };

  useEffect(() => {
    fetch(`${API}/api/health`, { credentials: 'include' }).catch(() => setError('无法连接 API，请先启动 npm run dev'));
    loadMe();
    loadBgms();
    loadHistory();
    loadPreference();
    loadAnalytics();
  }, []);

  useJobPolling(jobId, (nextJob) => {
    setJob(nextJob);
    if (!selectedVersionId && nextJob.versions?.length) setSelectedVersionId(nextJob.activeVersionId || nextJob.versions[0].versionId);
    if (nextJob.activeVersionId && nextJob.activeVersionId !== selectedVersionId && ['completed', 'partial_ready'].includes(nextJob.status)) setSelectedVersionId(nextJob.activeVersionId);
    loadHistory();
    loadPreference();
    loadAnalytics();
  }, setError);

  const visibleVersions = useMemo(() => (job?.versions || []).filter((v) => !(job?.deletedVersionIds || []).includes(v.versionId)), [job]);
  const activeVersion = useMemo(() => {
    if (!visibleVersions.length) return null;
    return visibleVersions.find((item) => item.versionId === selectedVersionId) || visibleVersions[0];
  }, [visibleVersions, selectedVersionId]);

  const activePlan = activeVersion?.plan;
  const currentStageIndex = stageIndex(job);
  const existingBgmCount = bgms.filter((b) => b.exists).length;

  const handleUploadBgms = async () => {
    if (!libraryFiles.length) return;
    setUploadingBgm(true); setError(null);
    const form = new FormData(); libraryFiles.forEach((file) => form.append('bgm', file));
    try {
      const res = await fetch(`${API}/api/bgm/upload`, { method: 'POST', body: form, credentials: 'include' });
      const data = await res.json(); if (!res.ok || !data.ok) throw new Error(data.error || 'BGM 导入失败');
      setBgms(data.bgms || []); setLibraryFiles([]);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setUploadingBgm(false); }
  };

  const handleCreate = async () => {
    if (!mediaFiles.length) { setError('请先上传视频或图片素材'); return; }
    setSubmitting(true); setJob(null); setJobId(null); setSelectedVersionId(null); setError(null);
    const form = new FormData(); mediaFiles.forEach((file) => form.append('media', file));
    try {
      const res = await fetch(`${API}/api/vlog/create`, { method: 'POST', body: form, credentials: 'include' });
      const data = await res.json(); if (!res.ok || !data.ok) throw new Error(data.error || '创建任务失败');
      setJobId(data.jobId); setJob(data.job); loadBgms(); loadHistory();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSubmitting(false); }
  };

  const postAction = async (url: string, body: unknown) => {
    const res = await fetch(`${API}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' });
    const data = await res.json(); if (!res.ok || !data.ok) throw new Error(data.error || '操作失败');
    if (data.job) setJob(data.job);
    if (job?.jobId) { setJobId(null); window.setTimeout(() => setJobId(job.jobId), 300); }
    loadHistory(); loadPreference(); loadAnalytics();
  };

  const handleRevise = async (suggestion: DirectorRevisionSuggestion) => {
    if (!job?.jobId) return;
    const loadingKey = suggestion.id || suggestion.label; setRevisionLoading(loadingKey); setError(null);
    try { await postAction('/api/vlog/revise', { jobId: job.jobId, suggestion }); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setRevisionLoading(null); }
  };

  const selectVersion = async (versionId: string) => {
    setSelectedVersionId(versionId);
    if (job?.jobId) await postAction('/api/vlog/select-version', { jobId: job.jobId, versionId }).catch(() => undefined);
  };

  const playableUrl = activeVersion?.videoUrl || activeVersion?.previewUrl;

  return (
    <div className="page">
      <nav className="siteNav" aria-label="VlogForgeAI navigation">
        <a className="brand" href="#">
          <span className="brandMark">VF</span>
          <span>
            <strong>VlogForgeAI</strong>
            <small>AI Vlog Studio</small>
          </span>
        </a>
        <div className="navLinks">
          <a href="#create">开始生成</a>
          <a href="#features">功能</a>
          <a href="#workflow">流程</a>
          <a href="https://github.com/mate-claw/VlogForgeAI" target="_blank" rel="noreferrer">GitHub</a>
        </div>
        {user ? <div className="navUser">
          <div>
            <strong>{user.displayName}</strong>
            <span>{user.email} · {user.role}</span>
          </div>
          <button className="navLogout" onClick={logout}>退出登录</button>
        </div> : null}
      </nav>
      <header className="hero commercialHero">
        <div>
          <div className="eyebrow">Stability V13 · AI Vlog</div>
          <h1>上线前稳定验收版：更稳、更可测的 AI 生活 Vlog</h1>
          <p>系统会严格校验 Qwen 返回的 DirectorPlan，失败时自动请求 AI 自修复，并记录 Qwen 与 Remotion 的耗时日志。</p>
          <div className="heroActions"><span>Schema 校验</span><span>AI 自修复</span><span>耗时观测</span><span>QA 验收</span></div>
        </div>
        <div className="phoneMock"><div className="phoneBar" /><div className="phoneText">AI VLOG</div><div className="phoneCard">今日故事<br />已生成</div><div className="phoneSub">预览 · 高清 · 分享</div></div>
      </header>

      {!user ? <section className="authPanel">
        <div>
          <div className="eyebrow">账号系统</div>
          <h2>{authMode === 'login' ? '登录后生成你的作品' : '注册一个测试账号'}</h2>
          <p>v13 会严格校验 AI 导演方案，失败时让 AI 自修复，并记录任务耗时与错误，方便上线前验收。</p>
        </div>
        <div className="authForm">
          {authMode === 'register' ? <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="昵称" /> : null}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" type="password" />
          <button className="primary" onClick={submitAuth}>{authMode === 'login' ? '登录' : '注册并登录'}</button>
          <button className="secondary" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? '没有账号？注册' : '已有账号？登录'}</button>
        </div>
      </section> : null}

      <section className="tryHeader">
        <span>Try it now</span>
        <h2>上传今天的素材，测试生成一条 AI Vlog</h2>
        <p>不用先理解工作台配置。选择照片或视频，点击生成，VlogForgeAI 会自动完成素材分析、导演规划、配乐和预览渲染。</p>
      </section>

      <main className="grid productDemo" id="create">
        <section className="panel wide introPanel">
          <h2>v13 上线前稳定验收</h2>
          <div className="logicCards four">
            <div><strong>会校验</strong><span>Qwen 返回的 DirectorPlan 必须符合 schema。</span></div>
            <div><strong>会自修复</strong><span>字段不合法时，系统会让 Qwen 基于错误重新输出。</span></div>
            <div><strong>会观测</strong><span>记录 Qwen、Remotion、质量评估等耗时指标。</span></div>
            <div><strong>会友好失败</strong><span>用户看到产品语言，开发者仍能看到完整日志。</span></div>
          </div>
        </section>

        {user ? <section className="panel wide preferencePanel">
          <h2>你的 AI 导演偏好画像</h2>
          {preference ? <div className="prefGrid">
            <div><strong>{preference.sampleSize}</strong><span>反馈样本</span></div>
            <div><strong>{preference.preferredVisualStyles.join(' / ') || '待学习'}</strong><span>偏好风格</span></div>
            <div><strong>{preference.preferredPaces.join(' / ') || '待学习'}</strong><span>偏好节奏</span></div>
            <div><strong>{preference.preferredDurationSeconds}s</strong><span>偏好片长</span></div>
          </div> : <p className="hint">还没有足够反馈。生成后点击喜欢、保留、分享或不喜欢，AI 会开始学习。</p>}
          {preference?.promptHint ? <p className="director"><strong>下一次个性化提示：</strong>{preference.promptHint}</p> : null}
          {analytics ? <div className="analyticsGrid"><span>作品 {analytics.generatedJobs}</span><span>完成 {analytics.completedJobs}</span><span>反馈 {analytics.feedbackCount}</span><span>喜欢 {analytics.likes}</span><span>保留 {analytics.keeps}</span><span>分享 {analytics.shares}</span><span>推荐命中 {analytics.recommendedSelectedRate ?? 0}%</span><span>最佳均分 {analytics.averageBestQualityScore ?? '-'}</span></div> : null}
        </section> : null}

        <section className="panel">
          <h2>1. 上传今天的素材</h2>
          <label className="uploadBox"><input type="file" multiple accept="video/*,image/*" onChange={(e) => setMediaFiles(Array.from(e.target.files || []))} /><strong>上传视频/图片素材</strong><span>素材可以乱序，AI 会自动筛选和排序。建议 5–30 个短视频/图片。</span></label>
          <div className="fileList">{mediaFiles.map((file) => <div key={`${file.name}-${file.size}`}>素材：{file.name}</div>)}</div>
        </section>

        <section className="panel">
          <h2>2. BGM 库</h2>
          <p className="hint">BGM 不让用户选。AI 只会从你提供的 BGM 候选里自动选择。</p>
          <label className="uploadBox small"><input type="file" multiple accept="audio/mpeg,audio/mp3,audio/*" onChange={(e) => setLibraryFiles(Array.from(e.target.files || []))} /><strong>导入你的 BGM MP3</strong><span>文件名保持：温馨回忆.mp3、宠物可爱.mp3、城市日常.mp3 等。</span></label>
          {libraryFiles.length ? <button className="secondary" onClick={handleUploadBgms} disabled={uploadingBgm}>{uploadingBgm ? '导入中...' : `导入 ${libraryFiles.length} 个 BGM`}</button> : null}
          <div className="hint">已匹配 {existingBgmCount}/{bgms.length} 个 BGM 文件</div>
          <div className="bgmList">{bgms.map((bgm) => <span className={bgm.exists ? 'bgm exists' : 'bgm'} key={bgm.id}>{bgm.title}{bgm.exists ? ' ✓' : ''}</span>)}</div>
        </section>

        <section className="panel wide">
          <h2>3. 一键生成今日 Vlog</h2>
          <div className="steps">{stageList.map((s, i) => <StepPill key={s} active={currentStageIndex === i} done={currentStageIndex > i}>{s}</StepPill>)}</div>
          <div className="progressTrack"><div className="progressFill" style={{ width: `${job?.progress || 0}%` }} /></div>
          <button className="primary" onClick={handleCreate} disabled={submitting || !mediaFiles.length || !user}>{submitting ? '上传中...' : '一键生成今日 Vlog'}</button>
          <div className="status">状态：{job?.stage || '准备就绪'} {job ? `· ${job.progress}%` : ''}</div>
          {job?.renderQueue ? <div className="hint">渲染队列：运行 {job.renderQueue.processing} · 等待 {job.renderQueue.pending}</div> : null}
          {job?.analysisCacheHits ? <div className="hint">素材分析缓存命中：{job.analysisCacheHits}/{job.assets?.length || 0}</div> : null}
          {job?.qualitySummary ? <div className="qualitySummary">AI 已评估 {job.qualitySummary.evaluatedVersions} 个版本 · 最佳 {job.qualitySummary.bestScore} 分 · 平均 {job.qualitySummary.averageScore} 分</div> : null}
          {error ? <pre className="error">{error}</pre> : null}
          {job?.userFacingError ? <div className="friendlyError">{job.userFacingError}</div> : null}
        </section>

        {job ? <section className="panel wide result">
          <h2>4. 生成结果</h2>
          <div className="resultTop commercialResult">
            <div>
              {playableUrl ? <video ref={playerRef} src={playableUrl} controls playsInline className="video" poster={activeVersion?.coverUrl} /> : <div className="video emptyVideo">等待极速预览...</div>}
              <div className="versionStrip">
                {visibleVersions.map((version) => <VersionCard key={version.versionId} version={version} active={activeVersion?.versionId === version.versionId} kept={(job.keptVersionIds || []).includes(version.versionId)} deleted={false} onSelect={() => selectVersion(version.versionId)} />)}
              </div>
            </div>

            <div className="summaryCard">
              <div className="eyebrow">AI 导演决策</div>
              <h3>{activePlan?.title || 'AI 正在导演中...'}</h3>
              <p>{activePlan?.subtitle || job.stage}</p>
              {activePlan ? <>
                <div className="meta"><span>故事：{activePlan.storyType}</span><span>风格：{activePlan.visualStyle}</span><span>节奏：{activePlan.pace}</span></div>
                <div className="meta"><span>BGM：{activeVersion?.selectedBgm?.title || activePlan.bgmTitle || activePlan.bgmId}</span><span>{activeVersion?.bgmUrl ? '已加载音频' : '未找到对应 MP3，视频无 BGM'}</span></div>
                {activeVersion?.quality ? <div className={`qualityBox ${qualityClass(activeVersion.quality.overallScore)}`}>
                  <div><strong>{activeVersion.isRecommended ? 'AI 推荐版本' : 'AI 质量评估'}</strong><span>{activeVersion.quality.overallScore} 分</span></div>
                  <p>{activeVersion.quality.recommendationReason || 'AI 已完成质量评分。'}</p>
                  <div className="qualityGrid"><span>故事 {activeVersion.quality.storyScore}</span><span>情绪 {activeVersion.quality.emotionScore}</span><span>字幕 {activeVersion.quality.captionScore}</span><span>BGM {activeVersion.quality.bgmMatchScore}</span><span>分享 {activeVersion.quality.shareWorthinessScore}</span></div>
                  {activeVersion.quality.problems?.length ? <small>待优化：{activeVersion.quality.problems.join('；')}</small> : null}
                </div> : null}
                <p className="director"><strong>故事线：</strong>{activePlan.storyArc}</p>
                <p className="director"><strong>导演说明：</strong>{activePlan.directorComment}</p>
                <div className="actionRow">
                  {playableUrl ? <a className="download" href={playableUrl} target="_blank" rel="noreferrer" onClick={() => activeVersion && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: activeVersion.versionId, action: 'download' }).catch(() => undefined)}>打开 / 下载当前版本</a> : null}
                  {job?.jobId ? <a className="download" href={`${API}/share/${job.jobId}`} target="_blank" rel="noreferrer" onClick={() => activeVersion && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: activeVersion.versionId, action: 'share' }).catch(() => undefined)}>打开分享页</a> : null}
                  {activeVersion?.coverUrl ? <a className="download secondaryLink" href={activeVersion.coverUrl} target="_blank" rel="noreferrer">打开封面</a> : null}
                </div>
                <div className="actionRow">
                  <button className="secondary" onClick={() => activeVersion && postAction('/api/vlog/keep-version', { jobId: job.jobId, versionId: activeVersion.versionId })}>保留这个版本</button>
                  <button className="secondary" onClick={() => activeVersion && postAction('/api/vlog/delete-version', { jobId: job.jobId, versionId: activeVersion.versionId })}>删除这个版本</button>
                  <button className="secondary" onClick={() => activeVersion && postAction('/api/vlog/export-square', { jobId: job.jobId, versionId: activeVersion.versionId })}>导出 1:1 方形版</button>
                  <button className="secondary" onClick={() => activeVersion && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: activeVersion.versionId, action: 'like' })}>喜欢</button>
                  <button className="secondary" onClick={() => activeVersion && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: activeVersion.versionId, action: 'dislike' })}>不喜欢</button>
                  <button className="secondary" onClick={() => activeVersion && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: activeVersion.versionId, action: 'too_many_effects' })}>特效太多</button>
                  <button className="secondary" onClick={() => activeVersion && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: activeVersion.versionId, action: 'too_fast' })}>节奏太快</button>
                  <button className="secondary" onClick={() => activeVersion && postAction('/api/vlog/feedback', { jobId: job.jobId, versionId: activeVersion.versionId, action: 'too_slow' })}>节奏太慢</button>
                </div>
                {activeVersion?.squareVideoUrl ? <a className="download" href={activeVersion.squareVideoUrl} target="_blank" rel="noreferrer">下载 1:1 方形版</a> : null}
                <div className="revisionBlock"><div className="revisionTitle">继续优化：按钮由 AI 根据本次素材生成</div><div className="revisionActions">
                  {(activePlan.revisionSuggestions || []).map((suggestion) => { const key = suggestion.id || suggestion.label; return <button key={key} className="revisionButton" onClick={() => handleRevise(suggestion)} disabled={Boolean(revisionLoading)} title={suggestion.instruction || suggestion.reason || ''}><strong>{revisionLoading === key ? '生成中...' : suggestion.label}</strong><span>{suggestion.reason || suggestion.expectedChange || suggestion.instruction}</span></button>; })}
                </div></div>
              </> : null}
            </div>
          </div>

          <div className="columns"><div><h3>素材评分</h3><pre>{JSON.stringify(job.analysis || [], null, 2)}</pre></div><div><h3>当前版本 Director Plan</h3><pre>{JSON.stringify(activePlan || {}, null, 2)}</pre></div></div>
          <p className="hint">v13 观测接口：<code>/api/jobs/{job.jobId}/metrics</code> 可查看 Qwen 和 Remotion 的耗时日志。</p>
        </section> : null}

        <section className="panel wide">
          <h2>5. 历史作品</h2>
          <div className="historyGrid">
            {history.map((item) => <button key={item.jobId} className="historyCard" onClick={() => { setJobId(item.jobId); setJob(item); setSelectedVersionId(item.activeVersionId || item.versions?.[0]?.versionId || null); }}>
              <strong>{item.versions?.[0]?.plan?.title || item.jobId}</strong>
              <span>{item.status} · {item.progress}%</span>
              <small>{item.updatedAt}</small>
            </button>)}
          </div>
        </section>
      </main>

      <section className="siteSection" id="features">
        <div className="sectionHeader">
          <span>Product</span>
          <h2>一个面向生活素材的 AI Vlog 生成网站</h2>
          <p>上传今天拍到的照片和视频，系统会自动理解内容、挑选高光、规划镜头、匹配 BGM，并用 Remotion 渲染成可预览、可下载、可分享的视频。</p>
        </div>
        <div className="featureGrid">
          <article>
            <strong>多模态素材理解</strong>
            <p>识别人物、宠物、亲子、家庭吃饭、城市日常等生活场景，减少手动整理素材的时间。</p>
          </article>
          <article>
            <strong>AI 导演规划</strong>
            <p>自动生成故事线、字幕、节奏、转场和 BGM 方案，让普通素材也有完整叙事。</p>
          </article>
          <article>
            <strong>稳定渲染链路</strong>
            <p>DirectorPlan 校验、失败自修复、任务耗时记录和错误提示，适合持续迭代上线。</p>
          </article>
          <article>
            <strong>多版本与反馈学习</strong>
            <p>支持预览、推荐版本、保留、删除、分享和反馈，让后续生成越来越接近你的偏好。</p>
          </article>
        </div>
      </section>

      <section className="siteSection workflowSection" id="workflow">
        <div className="sectionHeader">
          <span>Workflow</span>
          <h2>从素材到成片，只保留三个动作</h2>
        </div>
        <div className="workflowCards">
          <div><b>01</b><strong>上传素材</strong><p>把今天的视频和照片一次丢进来，顺序不需要提前整理。</p></div>
          <div><b>02</b><strong>AI 生成</strong><p>AI 自动分析、导演、配乐、写字幕并渲染预览版本。</p></div>
          <div><b>03</b><strong>下载分享</strong><p>查看推荐版本，继续优化，或直接下载发布到短视频平台。</p></div>
        </div>
      </section>

      <footer className="siteFooter">
        <strong>VlogForgeAI</strong>
        <span>Open-source AI life vlog generator powered by multimodal AI, Remotion and FFmpeg.</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
