import { ForbiddenException, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestContextStore } from '../request-context/request-context';
import { vendorScopedClient } from './vendor-scoped-prisma';

/**
 * Resolves the right Prisma client for the current request:
 *   - `forCurrentVendor()` — vendor-scoped (deny-by-default isolation)
 *   - `asPlatform()` — unscoped, for platform staff/admin operations only
 */
@Injectable()
export class TenantPrisma {
  constructor(private readonly prisma: PrismaService) {}

  forCurrentVendor(): PrismaClient {
    const { activeVendorId } = RequestContextStore.get();
    if (!activeVendorId) {
      throw new ForbiddenException('No active vendor context for this request.');
    }
    return vendorScopedClient(this.prisma, activeVendorId);
  }

  forVendor(vendorId: string): PrismaClient {
    return vendorScopedClient(this.prisma, vendorId);
  }

  /** Unscoped client — only for platform-plane code paths. */
  asPlatform(): PrismaService {
    return this.prisma;
  }
}
