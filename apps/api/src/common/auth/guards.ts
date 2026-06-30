import { CanActivate, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestContextStore } from '../request-context/request-context';

/** Allows only platform admins (the platform plane). */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(): boolean {
    const ctx = RequestContextStore.get();
    if (ctx.platformRole !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException('Platform admin role required.');
    }
    return true;
  }
}

/** Allows platform staff or admins (read-level platform access). */
@Injectable()
export class PlatformStaffGuard implements CanActivate {
  canActivate(): boolean {
    if (!RequestContextStore.isPlatformStaff()) {
      throw new ForbiddenException('Platform staff role required.');
    }
    return true;
  }
}

/** Requires an active vendor context (the vendor plane). */
@Injectable()
export class VendorContextGuard implements CanActivate {
  canActivate(): boolean {
    const ctx = RequestContextStore.get();
    if (!ctx.userId) {
      throw new UnauthorizedException('Authentication required.');
    }
    if (!ctx.activeVendorId) {
      throw new ForbiddenException('No active vendor selected for this request.');
    }
    return true;
  }
}
