import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
import type { UploadedAsset } from '@ai-vlog/shared';
import { publicUrlFor } from '../config';


export function sha256File(filePath: string): string {
  const hash = crypto.createHash('sha256');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest('hex');
}

export function fileSizeBytes(filePath: string): number {
  try { return fs.statSync(filePath).size; } catch { return 0; }
}

export function detectMediaType(mimeType: string): 'video' | 'image' {
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  throw new Error(`不支持的素材类型：${mimeType}`);
}

export async function runProcess(command: string, args: string[], cwd?: string, timeoutMs?: number): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: false, windowsHide: true });
    let stdout = '';
    let stderr = '';
    const timer = timeoutMs && timeoutMs > 0 ? setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Command timed out: ${command} after ${timeoutMs}ms`));
    }, timeoutMs) : undefined;
    const clearTimer = () => {
      if (timer) clearTimeout(timer);
    };
    child.stdout?.on('data', (chunk) => (stdout += chunk.toString()));
    child.stderr?.on('data', (chunk) => (stderr += chunk.toString()));
    child.on('error', (error) => {
      clearTimer();
      reject(error);
    });
    child.on('close', (code) => {
      clearTimer();
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`命令失败：${command} ${args.join(' ')}\nexit=${code}\n${stderr}`));
    });
  });
}

export async function probeDurationSeconds(filePath: string): Promise<number | undefined> {
  try {
    const probePath = ffprobe.path;
    const { stdout } = await runProcess(probePath, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath,
    ]);
    const value = Number(stdout.trim());
    return Number.isFinite(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export async function extractVideoFrames(inputPath: string, outputDir: string, count = 3): Promise<string[]> {
  if (!ffmpegPath) return [];
  fs.mkdirSync(outputDir, { recursive: true });
  // 抽几张均匀间隔的关键帧供 Qwen-VL 理解素材，不用于最终视频渲染。
  const pattern = path.resolve(outputDir, 'frame-%02d.jpg');
  try {
    await runProcess(ffmpegPath, [
      '-y',
      '-i', inputPath,
      '-vf', `fps=1/${Math.max(1, count)},scale=640:-1`,
      '-frames:v', String(count),
      pattern,
    ]);
    return fs.readdirSync(outputDir)
      .filter((file) => file.endsWith('.jpg'))
      .sort()
      .map((file) => path.resolve(outputDir, file));
  } catch {
    return [];
  }
}

export function toDataUrl(filePath: string, mime = 'image/jpeg'): string {
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

export function makeUploadedAsset(params: {
  id: string;
  file: Express.Multer.File;
  relativeStoragePath: string;
  durationSeconds?: number;
  assetHash?: string;
  metadata?: VideoMetadata;
}): UploadedAsset {
  const type = detectMediaType(params.file.mimetype);
  return {
    id: params.id,
    originalName: params.file.originalname,
    filename: params.file.filename,
    mimeType: params.file.mimetype,
    type,
    absolutePath: params.file.path,
    url: publicUrlFor(params.relativeStoragePath),
    durationSeconds: params.durationSeconds,
    assetHash: params.assetHash,
    fileSizeBytes: fileSizeBytes(params.file.path),
    width: params.metadata?.width,
    height: params.metadata?.height,
    fps: params.metadata?.avgFps || params.metadata?.rFps,
    avgFps: params.metadata?.avgFps,
    rFps: params.metadata?.rFps,
    isLikelyVfr: params.metadata?.isLikelyVfr,
  };
}

export type VideoMetadata = {
  width?: number;
  height?: number;
  durationSeconds?: number;
  rFps?: number;
  avgFps?: number;
  nbFrames?: number;
  isLikelyVfr?: boolean;
};

function parseFraction(value?: string): number | undefined {
  if (!value || value === '0/0') return undefined;
  const [a, b] = value.split('/').map(Number);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return undefined;
  return a / b;
}

export async function probeVideoMetadata(filePath: string): Promise<VideoMetadata | undefined> {
  try {
    const probePath = ffprobe.path;
    const { stdout } = await runProcess(probePath, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,r_frame_rate,avg_frame_rate,duration,nb_frames',
      '-of', 'json',
      filePath,
    ]);
    const parsed = JSON.parse(stdout);
    const stream = parsed.streams?.[0] || {};
    const durationSeconds = Number(stream.duration);
    const nbFrames = Number(stream.nb_frames);
    const rFps = parseFraction(stream.r_frame_rate);
    const avgFps = parseFraction(stream.avg_frame_rate);
    const isLikelyVfr = Boolean(rFps && avgFps && Math.abs(rFps - avgFps) > 0.02);
    return {
      width: Number(stream.width) || undefined,
      height: Number(stream.height) || undefined,
      durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : undefined,
      nbFrames: Number.isFinite(nbFrames) ? nbFrames : undefined,
      rFps,
      avgFps,
      isLikelyVfr,
    };
  } catch {
    return undefined;
  }
}

export async function normalizeVideoForRender(params: { inputPath: string; outputPath: string; targetFps: number; interpolation?: string }): Promise<void> {
  if (!ffmpegPath) throw new Error('ffmpeg-static 不可用，无法生成稳定帧率代理视频');
  fs.mkdirSync(path.dirname(params.outputPath), { recursive: true });
  const fps = Math.max(1, Math.round(params.targetFps));
  const interpolation = (params.interpolation || process.env.VIDEO_PROXY_INTERPOLATION || 'fps').toLowerCase();
  const preset = process.env.VIDEO_PROXY_PRESET || 'veryfast';
  const crf = process.env.VIDEO_PROXY_CRF || '20';
  const timeoutMs = Number(process.env.VIDEO_PROXY_TIMEOUT_MS || 120000);
  const ffmpegExecutable = String(ffmpegPath);

  const vfMci = `minterpolate=fps=${fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,setpts=N/(${fps}*TB),format=yuv420p`;
  const vfBlend = `minterpolate=fps=${fps}:mi_mode=blend,setpts=N/(${fps}*TB),format=yuv420p`;
  const vfFpsOnly = `fps=${fps},setpts=N/(${fps}*TB),format=yuv420p`;

  const run = async (vf: string): Promise<void> => {
    await runProcess(ffmpegExecutable, [
    '-y',
    '-i', params.inputPath,
    '-vf', vf,
    '-r', String(fps),
    '-fps_mode', 'cfr',
    '-c:v', 'libx264',
    '-preset', preset,
    '-crf', crf,
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '48000',
    '-af', 'aresample=async=1:first_pts=0',
    '-movflags', '+faststart',
      params.outputPath,
    ], undefined, timeoutMs);
  };

  try {
    if (interpolation === 'none' || interpolation === 'fps') return await run(vfFpsOnly);
    if (interpolation === 'blend') return await run(vfBlend);
    return await run(vfMci);
  } catch (error) {
    // mci 插帧在 Windows/普通电脑上可能非常慢，超时或失败时优先降级，保证先出预览。
    if (interpolation === 'mci') {
      try { return await run(vfBlend); } catch {}
      try { return await run(vfFpsOnly); } catch {}
    }
    if (interpolation === 'blend') {
      try { return await run(vfFpsOnly); } catch {}
    }
    throw error;
  }
}
