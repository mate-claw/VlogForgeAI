import fs from 'node:fs';
import path from 'node:path';
import { getJobDir, readJsonFile } from './jobStore';
import { nowIso } from './time';

export type JobMetricEvent = {
  time: string;
  name: string;
  durationMs?: number;
  detail?: Record<string, unknown>;
};

export function jobMetricsPath(jobId: string) {
  return path.resolve(getJobDir(jobId), 'metrics.json');
}

export function readJobMetrics(jobId: string): JobMetricEvent[] {
  const file = jobMetricsPath(jobId);
  return fs.existsSync(file) ? readJsonFile<JobMetricEvent[]>(file) : [];
}

export function recordJobMetric(jobId: string, metric: Omit<JobMetricEvent, 'time'>) {
  const file = jobMetricsPath(jobId);
  const list = fs.existsSync(file) ? readJsonFile<JobMetricEvent[]>(file) : [];
  list.push({ time: nowIso(), ...metric });
  fs.writeFileSync(file, JSON.stringify(list.slice(-500), null, 2), 'utf-8');
}

export async function timedJobStep<T>(jobId: string, name: string, fn: () => Promise<T>, detail?: Record<string, unknown>): Promise<T> {
  const started = Date.now();
  try {
    const result = await fn();
    recordJobMetric(jobId, { name, durationMs: Date.now() - started, detail: { ...(detail || {}), ok: true } });
    return result;
  } catch (error) {
    recordJobMetric(jobId, { name, durationMs: Date.now() - started, detail: { ...(detail || {}), ok: false, error: error instanceof Error ? error.message : String(error) } });
    throw error;
  }
}
