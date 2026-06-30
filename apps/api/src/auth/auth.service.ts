import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestContext } from '../common/request-context/request-context';
import { RegisterDto, VendorRegisterDto } from './dto';
import {
  SESSION_TTL_DAYS,
  hashPassword,
  hashToken,
  newSessionToken,
  verifyPassword,
} from './crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Registration ──────────────────────────────────────────
  async registerCustomer(dto: RegisterDto) {
    await this.ensureEmailFree(dto.email);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: hashPassword(dto.password),
        name: dto.name,
        phone: dto.phone,
        platformRole: 'NONE',
      },
    });
    const token = await this.createSession(user.id);
    return { token, user: this.publicUser(user) };
  }

  async registerVendor(dto: VendorRegisterDto) {
    await this.ensureEmailFree(dto.email);
    const slug = await this.uniqueSlug(dto.displayName);
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash: hashPassword(dto.password),
          name: dto.name,
          phone: dto.phone,
          platformRole: 'NONE',
        },
      });
      const vendor = await tx.vendor.create({
        data: {
          slug,
          legalName: dto.legalName,
          displayName: dto.displayName,
          city: dto.city,
          status: 'PENDING_REVIEW',
        },
      });
      await tx.vendorMembership.create({
        data: { vendorId: vendor.id, userId: user.id, role: 'VENDOR_OWNER' },
      });
      return { user, vendor };
    });
    const token = await this.createSession(result.user.id);
    return { token, user: this.publicUser(result.user), vendor: result.vendor };
  }

  // ── Login / logout ────────────────────────────────────────
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    const token = await this.createSession(user.id);
    return { token, user: this.publicUser(user) };
  }

  async logout(token: string | undefined): Promise<void> {
    if (!token) return;
    await this.prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  // ── Sessions ──────────────────────────────────────────────
  async createSession(userId: string): Promise<string> {
    const token = newSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.session.create({
      data: { tokenHash: hashToken(token), userId, expiresAt },
    });
    return token;
  }

  /** Resolve the per-request principal from a session token (used by middleware). */
  async resolveContext(token: string): Promise<RequestContext | null> {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { include: { memberships: true } } },
    });
    if (!session || session.expiresAt < new Date()) return null;
    const membership = session.user.memberships[0];
    return {
      userId: session.user.id,
      platformRole: session.user.platformRole,
      activeVendorId: membership?.vendorId ?? null,
      vendorRole: membership?.role ?? null,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { memberships: { include: { vendor: true } } },
    });
    if (!user) throw new UnauthorizedException();
    const membership = user.memberships[0];
    return {
      user: this.publicUser(user),
      vendor: membership
        ? { ...membership.vendor, role: membership.role }
        : null,
    };
  }

  // ── helpers ───────────────────────────────────────────────
  private async ensureEmailFree(email: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) throw new ConflictException('An account with that email already exists.');
  }

  private async uniqueSlug(displayName: string): Promise<string> {
    const base =
      displayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'vendor';
    let slug = base;
    while (await this.prisma.vendor.findUnique({ where: { slug } })) {
      slug = `${base}-${randomBytes(2).toString('hex')}`;
    }
    return slug;
  }

  private publicUser(u: { id: string; email: string; name: string | null; platformRole: string }) {
    return { id: u.id, email: u.email, name: u.name, platformRole: u.platformRole };
  }
}
