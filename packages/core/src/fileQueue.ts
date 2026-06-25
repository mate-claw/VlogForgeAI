import fs from 'node:fs';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { ensureStorageDirs, queueDir } from './paths';
import { nowIso } from './time';

export type QueueTaskType = 'create_vlog' | 'revise_vlog' | 'export_square' | 'render_hd';

export type QueueTask<T = unknown> = {
  taskId: string;
  type: QueueTaskType;
  jobId: string;
  payload: T;
  createdAt: string;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
};

function subdir(name: string) {
  ensureStorageDirs();
  const dir = path.resolve(queueDir, name);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function taskPath(state: 'pending' | 'processing' | 'done' | 'failed', taskId: string) {
  return path.resolve(subdir(state), `${taskId}.json`);
}

export function enqueueTask<T>(params: { type: QueueTaskType; jobId: string; payload: T; maxAttempts?: number }) {
  const task: QueueTask<T> = {
    taskId: `${Date.now()}-${nanoid(8)}`,
    type: params.type,
    jobId: params.jobId,
    payload: params.payload,
    createdAt: nowIso(),
    attempts: 0,
    maxAttempts: params.maxAttempts || 2,
  };
  fs.writeFileSync(taskPath('pending', task.taskId), JSON.stringify(task, null, 2), 'utf-8');
  return task;
}

export function takeNextTask(): QueueTask | undefined {
  const pending = subdir('pending');
  const processing = subdir('processing');
  const files = fs.readdirSync(pending).filter((file) => file.endsWith('.json')).sort();
  for (const file of files) {
    const from = path.resolve(pending, file);
    const to = path.resolve(processing, file);
    try {
      fs.renameSync(from, to);
      const task = JSON.parse(fs.readFileSync(to, 'utf-8')) as QueueTask;
      task.attempts += 1;
      fs.writeFileSync(to, JSON.stringify(task, null, 2), 'utf-8');
      return task;
    } catch {
      continue;
    }
  }
  return undefined;
}

export function completeTask(task: QueueTask) {
  const from = taskPath('processing', task.taskId);
  const to = taskPath('done', task.taskId);
  if (fs.existsSync(from)) fs.renameSync(from, to);
}

export function failTask(task: QueueTask, error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  task.lastError = detail;
  const processingPath = taskPath('processing', task.taskId);
  if (task.attempts < task.maxAttempts) {
    const pendingPath = taskPath('pending', task.taskId);
    fs.writeFileSync(processingPath, JSON.stringify(task, null, 2), 'utf-8');
    if (fs.existsSync(processingPath)) fs.renameSync(processingPath, pendingPath);
    else fs.writeFileSync(pendingPath, JSON.stringify(task, null, 2), 'utf-8');
    return 'retry' as const;
  }
  const failedPath = taskPath('failed', task.taskId);
  fs.writeFileSync(processingPath, JSON.stringify(task, null, 2), 'utf-8');
  fs.renameSync(processingPath, failedPath);
  return 'failed' as const;
}

export function queueStats() {
  return {
    pending: fs.existsSync(subdir('pending')) ? fs.readdirSync(subdir('pending')).filter((f) => f.endsWith('.json')).length : 0,
    processing: fs.existsSync(subdir('processing')) ? fs.readdirSync(subdir('processing')).filter((f) => f.endsWith('.json')).length : 0,
    done: fs.existsSync(subdir('done')) ? fs.readdirSync(subdir('done')).filter((f) => f.endsWith('.json')).length : 0,
    failed: fs.existsSync(subdir('failed')) ? fs.readdirSync(subdir('failed')).filter((f) => f.endsWith('.json')).length : 0,
  };
}
