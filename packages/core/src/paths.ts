import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

function findRoot(startDir: string): string {
  let current = path.resolve(startDir);
  for (let i = 0; i < 10; i += 1) {
    const pkgPath = path.resolve(current, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { workspaces?: unknown; name?: string };
        if (Array.isArray(pkg.workspaces) || pkg.name === 'ai-vlog-h5-qwen-remotion-personalized-v12' || pkg.name === 'ai-vlog-h5-qwen-remotion-stability-v13') return current;
      } catch {}
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return path.resolve(startDir, '../..');
}

export const rootDir = path.resolve(process.env.PROJECT_ROOT || findRoot(process.cwd()));

dotenv.config({ path: path.resolve(rootDir, '.env') });
dotenv.config();

export const storageDir = path.resolve(process.env.STORAGE_DIR || path.resolve(rootDir, 'apps/api/storage'));
export const jobsDir = path.resolve(storageDir, 'jobs');
export const uploadsDir = path.resolve(storageDir, 'uploads');
export const bgmDir = path.resolve(storageDir, 'bgm');
export const queueDir = path.resolve(storageDir, 'queue');
export const dbDir = path.resolve(storageDir, 'db');
export const sharedDir = path.resolve(storageDir, 'shared');

export function ensureStorageDirs() {
  for (const dir of [storageDir, jobsDir, uploadsDir, bgmDir, queueDir, dbDir, sharedDir]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function publicUrlFor(relativePath: string) {
  const clean = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const storagePublicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL;
  const storageDriver = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
  if (storageDriver !== 'local' && storagePublicBaseUrl) return `${storagePublicBaseUrl.replace(/\/$/, '')}/${clean.replace(/^storage\//, '')}`;
  const publicBaseUrl = process.env.PUBLIC_BASE_URL;
  if (publicBaseUrl) return `${publicBaseUrl.replace(/\/$/, '')}/${clean}`;
  const port = Number(process.env.PORT || 8787);
  return `http://localhost:${port}/${clean}`;
}

export function assertInside(baseDir: string, targetPath: string) {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(targetPath);
  const relative = path.relative(base, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path escapes base directory: ${targetPath}`);
  }
  return resolved;
}
