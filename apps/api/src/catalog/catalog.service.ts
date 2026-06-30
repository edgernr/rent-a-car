import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private get rate(): number {
    return Number(this.config.get('USD_INDICATIVE_RATE_UZS') ?? 12600);
  }

  /** Published vehicles from APPROVED vendors only (public storefront feed). */
  async vehicles() {
    const rows = await this.prisma.vehicle.findMany({
      where: {
        moderationStatus: 'APPROVED',
        vendor: { status: 'APPROVED' },
      },
      include: { vendor: { select: { displayName: true, slug: true, city: true } } },
      orderBy: [{ popular: 'desc' }, { dailyRateUzs: 'asc' }],
    });
    return rows.map((v) => ({
      id: v.id,
      make: v.make,
      model: v.model,
      name: `${v.make} ${v.model}`,
      year: v.year,
      category: v.category,
      transmission: v.transmission,
      fuelType: v.fuelType,
      seats: v.seats,
      bags: v.bags,
      dailyRateUzs: v.dailyRateUzs,
      dailyRateUsd: Math.round(v.dailyRateUzs / 100 / this.rate),
      status: v.status,
      popular: v.popular,
      photoKeys: v.photoKeys,
      vendor: v.vendor,
    }));
  }

  async routes() {
    return this.prisma.route.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async addons() {
    const rows = await this.prisma.addon.findMany();
    return rows.map((a) => ({
      type: a.type,
      priceUzs: a.priceUzs,
      priceUsd: Math.round(a.priceUzs / 100 / this.rate),
    }));
  }
}
