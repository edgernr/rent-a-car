import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/** scrypt password hashing — `salt:derivedKey`, both hex. No native deps. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const dk = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${dk.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, keyHex] = stored.split(':');
  if (!saltHex || !keyHex) return false;
  const dk = scryptSync(password, Buffer.from(saltHex, 'hex'), 64);
  const key = Buffer.from(keyHex, 'hex');
  return dk.length === key.length && timingSafeEqual(dk, key);
}

/** Opaque session token (returned to the client in the cookie). */
export function newSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/** We store only the hash of the token, never the token itself. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export const SESSION_COOKIE = 'srd_session';
export const SESSION_TTL_DAYS = 30;

/** Minimal cookie-header parser (middleware sees the raw Node request). */
export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}
