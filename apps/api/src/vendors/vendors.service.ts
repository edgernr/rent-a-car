import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantPrisma } from '../common/tenancy/tenant-prisma.service';
import { RequestContextStore } from '../common/request-context/request-context';
import type { CreateVehicleDto, CreateVendorDto } from './dto';

@Injectable()
export class VendorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantPrisma,
  ) {}

  // ── Platform plane (unscoped) ──────────────────────────────
  createVendor(dto: CreateVendorDto) {
    return this.prisma.vendor.create({
      data: {
        legalName: dto.legalName,
        displayName: dto.displayName,
        slug: dto.slug,
        city: dto.city,
        commissionBps: dto.commissionBps ?? 1500,
        status: 'PENDING_REVIEW',
      },
    });
  }

  listVendors() {
    return this.prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { vehicles: true } } },
    });
  }

  /** Approve a vendor and auto-publish its pending cars (graduated moderation). */
  async approveVendor(id: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    const [updated] = await this.prisma.$transaction([
      this.prisma.vendor.update({ where: { id }, data: { status: 'APPROVED' } }),
      this.prisma.vehicle.updateMany({
        where: { vendorId: id, moderationStatus: { in: ['DRAFT', 'PENDING'] } },
        data: { moderationStatus: 'APPROVED', publishedAt: new Date() },
      }),
    ]);
    return updated;
  }

  async suspendVendor(id: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return this.prisma.vendor.update({ where: { id }, data: { status: 'SUSPENDED' } });
  }

  // ── Vendor plane (tenant-scoped) ───────────────────────────
  // These use the vendor-scoped client: vendorId is injected/stamped
  // automatically, so a vendor can only ever touch its own rows.
  listMyVehicles() {
    return this.tenant.forCurrentVendor().vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createMyVehicle(dto: CreateVehicleDto) {
    const { activeVendorId } = RequestContextStore.get();
    if (!activeVendorId) throw new ForbiddenException('No active vendor context.');
    // Established (APPROVED) vendors auto-publish; others stay DRAFT until approved.
    const vendor = await this.prisma.vendor.findUnique({ where: { id: activeVendorId } });
    const published = vendor?.status === 'APPROVED';
    return this.tenant.forCurrentVendor().vehicle.create({
      data: {
        make: dto.make,
        model: dto.model,
        year: dto.year,
        category: dto.category,
        transmission: dto.transmission ?? 'AUTOMATIC',
        fuelType: dto.fuelType ?? 'PETROL',
        seats: dto.seats ?? 5,
        bags: dto.bags ?? 3,
        plate: dto.plate,
        dailyRateUzs: dto.dailyRateUzs,
        popular: dto.popular ?? false,
        moderationStatus: published ? 'APPROVED' : 'DRAFT',
        publishedAt: published ? new Date() : null,
        // The tenancy extension also stamps vendorId; we set it here so the
        // create input is type-safe (and it's asserted to match the scope).
        vendorId: activeVendorId,
      },
    });
  }
}
