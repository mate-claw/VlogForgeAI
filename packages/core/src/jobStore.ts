import fs from 'node:fs';
import path from 'node:path';
import type { JobEvent, VlogJob, VlogJobStatus } from '@ai-vlog/shared';
import { assertInside, ensureStorageDirs, jobsDir } from './paths';
import { nowIso } from './time';
import { toUserFriendlyError } from './friendlyError';

export type JobPatch = Partial<VlogJob> & { status?: VlogJobStatus };

export function getJobDir(jobId: string) {
  const clean = String(jobId || '').trim();
  if (!clean || !/^[a-zA-Z0-9_-]+$/.test(clean)) throw new Error('非法 jobId');
  return assertInside(jobsDir, path.resolve(jobsDir, clean));
}

export function jobStatusPath(jobId: string) {
  return path.resolve(getJobDir(jobId), 'job-status.json');
}

export function jobEventsPath(jobId: string) {
  return path.resolve(getJobDir(jobId), 'events.json');
}

export function readJsonFile<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) throw new Error(`找不到文件：${filePath}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

export function readJob(jobId: string): VlogJob | undefined {
  ensureStorageDirs();
  const statusPath = jobStatusPath(jobId);
  if (!fs.existsSync(statusPath)) return undefined;
  return readJsonFile<VlogJob>(statusPath);
}

export function writeJob(job: VlogJob, detail?: string) {
  ensureStorageDirs();
  const jobDir = getJobDir(job.jobId);
  fs.mkdirSync(jobDir, { recursive: true });
  const next: VlogJob = { ...job, updatedAt: nowIso() };
  fs.writeFileSync(path.resolve(jobDir, 'job-status.json'), JSON.stringify(next, null, 2), 'utf-8');
  appendJobEvent(next, detail);
  return next;
}

export function createJob(job: VlogJob, detail?: string) {
  ensureStorageDirs();
  const jobDir = getJobDir(job.jobId);
  fs.mkdirSync(jobDir, { recursive: true });
  fs.writeFileSync(path.resolve(jobDir, 'job-status.json'), JSON.stringify(job, null, 2), 'utf-8');
  appendJobEvent(job, detail);
  return job;
}

export function updateJob(jobId: string, patch: JobPatch, detail?: string) {
  const existing = readJob(jobId);
  if (!existing) throw new Error(`找不到任务：${jobId}`);
  const next = { ...existing, ...patch, updatedAt: nowIso() } as VlogJob;
  return writeJob(next, detail);
}

export function appendJobEvent(job: VlogJob, detail?: string) {
  const event: JobEvent = {
    time: nowIso(),
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    detail,
  };
  const file = jobEventsPath(job.jobId);
  const events = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) as JobEvent[] : [];
  events.push(event);
  fs.writeFileSync(file, JSON.stringify(events.slice(-200), null, 2), 'utf-8');
}

export function failJob(jobId: string, error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  const existing = readJob(jobId);
  if (!existing) return;
  return writeJob({ ...existing, status: 'failed', stage: toUserFriendlyError(error), progress: Math.max(existing.progress, 1), error: detail, userFacingError: toUserFriendlyError(error) } as any, detail);
}

export function listJobs(limit = 100): VlogJob[] {
  ensureStorageDirs();
  if (!fs.existsSync(jobsDir)) return [];
  return fs.readdirSync(jobsDir)
    .map((jobId) => {
      try { return readJob(jobId); } catch { return undefined; }
    })
    .filter(Boolean)
    .sort((a, b) => String((b as VlogJob).updatedAt).localeCompare(String((a as VlogJob).updatedAt)))
    .slice(0, limit) as VlogJob[];
}

export function readJobEvents(jobId: string): JobEvent[] {
  const file = jobEventsPath(jobId);
  return fs.existsSync(file) ? readJsonFile<JobEvent[]>(file) : [];
}
