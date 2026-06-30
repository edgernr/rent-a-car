import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Per-request principal + active tenant context.
 *
 * The principal is currently populated from dev headers (see ContextMiddleware).
 * When Better Auth lands, only that middleware changes — everything downstream
 * (guards, the Prisma tenancy extension) depends on this shape, not on how it
 * was resolved.
 */
export type PlatformRole = 'NONE' | 'PLATFORM_STAFF' | 'PLATFORM_ADMIN';
export type VendorRole = 'VENDOR_OWNER' | 'VENDOR_STAFF';

export interface RequestContext {
  userId: string | null;
  platformRole: PlatformRole;
  /** The vendor the request is acting as (tenant key), if any. */
  activeVendorId: string | null;
  vendorRole: VendorRole | null;
}

const storage = new AsyncLocalStorage<RequestContext>();

const EMPTY: RequestContext = {
  userId: null,
  platformRole: 'NONE',
  activeVendorId: null,
  vendorRole: null,
};

export const RequestContextStore = {
  run<T>(ctx: RequestContext, fn: () => T): T {
    return storage.run(ctx, fn);
  },
  /** Current context, or an empty (anonymous) context outside a request. */
  get(): RequestContext {
    return storage.getStore() ?? EMPTY;
  },
  isPlatformStaff(): boolean {
    const r = this.get().platformRole;
    return r === 'PLATFORM_STAFF' || r === 'PLATFORM_ADMIN';
  },
};
