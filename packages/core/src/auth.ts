import crypto from 'node:crypto';
import type { AuthSession, VlogUser } from '@ai-vlog/shared';
import { config } from './config';
import { findUserById } from './userStore';

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function unbase64url(input: string) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) input += '=';
  return Buffer.from(input, 'base64').toString('utf-8');
}

export function createJwt(user: VlogUser, expiresInSeconds = 60 * 60 * 24 * 30) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: user.userId, email: user.email, name: user.displayName, role: user.role, iat: now, exp: now + expiresInSeconds };
  const encoded = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = crypto.createHmac('sha256', config.jwtSecret).update(encoded).digest();
  return `${encoded}.${base64url(signature)}`;
}

export function verifyJwt(token?: string): AuthSession | undefined {
  if (!token) return undefined;
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return undefined;
  const encoded = `${header}.${payload}`;
  const expected = base64url(crypto.createHmac('sha256', config.jwtSecret).update(encoded).digest());
  if (expected !== signature) return undefined;
  const data = JSON.parse(unbase64url(payload)) as { sub: string; email: string; name: string; role: 'user' | 'admin'; exp: number };
  if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return undefined;
  const user = findUserById(data.sub);
  if (!user) return undefined;
  return { userId: user.userId, email: user.email, displayName: user.displayName, role: user.role };
}

export function parseCookie(header?: string) {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    out[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return out;
}
