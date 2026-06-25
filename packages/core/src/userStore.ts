import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { nanoid } from 'nanoid';
import type { VlogUser } from '@ai-vlog/shared';
import { dbDir, ensureStorageDirs } from './paths';
import { nowIso } from './time';

const usersPath = path.resolve(dbDir, 'users.json');

function readUsers(): VlogUser[] {
  ensureStorageDirs();
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8')) as VlogUser[];
}

function writeUsers(users: VlogUser[]) {
  ensureStorageDirs();
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
}

function normalizeEmail(email: string) {
  return String(email || '').trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored?: string) {
  if (!stored) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(actual, 'hex'));
}

export function createUser(params: { email: string; password: string; displayName?: string; role?: 'user' | 'admin' }) {
  const email = normalizeEmail(params.email);
  if (!email || !email.includes('@')) throw new Error('请输入有效邮箱');
  if (!params.password || params.password.length < 6) throw new Error('密码至少 6 位');
  const users = readUsers();
  if (users.some((u) => normalizeEmail(u.email) === email)) throw new Error('邮箱已注册');
  const now = nowIso();
  const user: VlogUser = {
    userId: `user_${nanoid(12)}`,
    email,
    displayName: params.displayName?.trim() || email.split('@')[0],
    passwordHash: hashPassword(params.password),
    role: params.role || (users.length === 0 ? 'admin' : 'user'),
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  writeUsers(users);
  return user;
}

export function findUserByEmail(email: string) {
  return readUsers().find((u) => normalizeEmail(u.email) === normalizeEmail(email));
}

export function findUserById(userId: string) {
  return readUsers().find((u) => u.userId === userId);
}

export function listUsers() {
  return readUsers().map(({ passwordHash, ...safe }) => safe);
}

export function sanitizeUser(user: VlogUser) {
  const { passwordHash, ...safe } = user;
  return safe;
}
