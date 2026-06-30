import { Injectable, NestMiddleware } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { AuthService } from '../../auth/auth.service';
import { SESSION_COOKIE, parseCookies } from '../../auth/crypto';
import {
  RequestContextStore,
  type PlatformRole,
  type RequestContext,
  type VendorRole,
} from './request-context';

/**
 * Establishes the per-request principal and runs the request inside it.
 *
 * Primary source: the HttpOnly session cookie (real auth).
 * Fallback (NON-production only): `x-srd-*` dev headers, so isolation tests and
 * tooling keep working without a login.
 */
@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(private readonly auth: AuthService) {}

  async use(
    req: IncomingMessage,
    _res: ServerResponse,
    next: (err?: unknown) => void,
  ): Promise<void> {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];

    let ctx: RequestContext | null = null;
    if (token) {
      ctx = await this.auth.resolveContext(token);
    }
    if (!ctx && process.env.NODE_ENV !== 'production') {
      ctx = fromDevHeaders(req.headers);
    }

    RequestContextStore.run(
      ctx ?? { userId: null, platformRole: 'NONE', activeVendorId: null, vendorRole: null },
      () => next(),
    );
  }
}

function header(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v && v.length > 0 ? v : undefined;
}

function fromDevHeaders(h: IncomingMessage['headers']): RequestContext | null {
  const userId = header(h['x-srd-user-id']);
  if (!userId) return null;
  const pr = header(h['x-srd-platform-role']);
  const vr = header(h['x-srd-vendor-role']);
  return {
    userId,
    platformRole: pr === 'PLATFORM_ADMIN' || pr === 'PLATFORM_STAFF' ? (pr as PlatformRole) : 'NONE',
    activeVendorId: header(h['x-srd-vendor-id']) ?? null,
    vendorRole: vr === 'VENDOR_OWNER' || vr === 'VENDOR_STAFF' ? (vr as VendorRole) : null,
  };
}
