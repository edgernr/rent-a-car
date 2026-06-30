/**
 * Seed — uses the delivered design's sample data (fleet, routes, add-ons).
 * USD design prices are converted to UZS minor units at the indicative rate.
 * Idempotent: safe to re-run.
 */
import { PrismaClient, type VehicleCategory, type FuelType } from '@prisma/client';
import { hashPassword } from '../src/auth/crypto';

const prisma = new PrismaClient();

// Dev login credentials (printed at the end of seeding).
const ADMIN_PW = 'admin12345';
const OWNER_PW = 'owner12345';

const RATE = Number(process.env.USD_INDICATIVE_RATE_UZS ?? 12600);
const usdToUzsMinor = (usd: number): number => Math.round(usd * RATE * 100);

type Cat = 'economy' | 'sedan' | 'suv' | 'seven' | 'electric';
const CAT: Record<Cat, VehicleCategory> = {
  economy: 'ECONOMY',
  sedan: 'SEDAN',
  suv: 'SUV',
  seven: 'SEVEN_SEATER',
  electric: 'ELECTRIC',
};

const FLEET = [
  { make: 'Chevrolet', model: 'Spark', cat: 'economy', seats: 4, auto: false, bags: 2, usd: 22, popular: false },
  { make: 'Chevrolet', model: 'Cobalt', cat: 'sedan', seats: 5, auto: true, bags: 3, usd: 28, popular: true },
  { make: 'Chevrolet', model: 'Gentra', cat: 'sedan', seats: 5, auto: true, bags: 3, usd: 32, popular: false },
  { make: 'Chevrolet', model: 'Malibu', cat: 'sedan', seats: 5, auto: true, bags: 4, usd: 55, popular: false },
  { make: 'Chevrolet', model: 'Tracker', cat: 'suv', seats: 5, auto: true, bags: 4, usd: 48, popular: true },
  { make: 'Chevrolet', model: 'Equinox', cat: 'suv', seats: 5, auto: true, bags: 5, usd: 60, popular: false },
  { make: 'Chevrolet', model: 'Captiva', cat: 'seven', seats: 7, auto: true, bags: 5, usd: 65, popular: false },
  { make: 'Chevrolet', model: 'Tahoe', cat: 'seven', seats: 7, auto: true, bags: 6, usd: 120, popular: false },
  { make: 'Chery', model: 'Tiggo 8 Pro', cat: 'seven', seats: 7, auto: true, bags: 5, usd: 54, popular: false },
  { make: 'BYD', model: 'Song Plus EV', cat: 'electric', seats: 5, auto: true, bags: 4, usd: 58, popular: true },
] as const;

const ROUTES = [
  { slug: 'samarkand', km: 280, h: 4, en: 'Samarkand', ru: 'Самарканд', uz: 'Samarqand', ten: 'Registan & the Timurid heart', tru: 'Регистан и сердце Тимуридов', tuz: 'Registon va Temuriylar yuragi' },
  { slug: 'bukhara', km: 600, h: 7, en: 'Bukhara', ru: 'Бухара', uz: 'Buxoro', ten: 'Holy city of the Silk Road', tru: 'Священный город Шёлкового пути', tuz: 'Ipak yo‘lining muqaddas shahri' },
  { slug: 'khiva', km: 1000, h: 12, en: 'Khiva', ru: 'Хива', uz: 'Xiva', ten: 'Walled desert citadel', tru: 'Крепость посреди пустыни', tuz: 'Cho‘l qa’lasi' },
  { slug: 'fergana', km: 320, h: 5, en: 'Fergana Valley', ru: 'Ферганская долина', uz: 'Farg‘ona vodiysi', ten: 'Silk, ceramics & orchards', tru: 'Шёлк, керамика и сады', tuz: 'Ipak, sopol va bog‘lar' },
  { slug: 'nuratau', km: 250, h: 4, en: 'Nuratau Mountains', ru: 'Горы Нуратау', uz: 'Nurota tog‘lari', ten: 'Yurt camps & village trails', tru: 'Юрты и горные сёла', tuz: 'O‘tov lagerlari va tog‘ qishloqlari' },
  { slug: 'aral', km: 1100, h: 14, en: 'Aral Sea', ru: 'Аральское море', uz: 'Orol dengizi', ten: 'Ships stranded in the desert', tru: 'Корабли посреди пустыни', tuz: 'Cho‘ldagi kemalar' },
] as const;

const ADDONS = [
  { type: 'DRIVER', usd: 35 },
  { type: 'CDW_INSURANCE', usd: 12 },
  { type: 'GPS', usd: 5 },
  { type: 'CHILD_SEAT', usd: 4 },
  { type: 'WIFI', usd: 6 },
  { type: 'UNLIMITED_MILEAGE', usd: 9 },
] as const;

async function main(): Promise<void> {
  // Platform admin (can log into the console's platform view to approve vendors)
  await prisma.user.upsert({
    where: { email: 'admin@silkroad.drive' },
    update: { passwordHash: hashPassword(ADMIN_PW) },
    create: {
      email: 'admin@silkroad.drive',
      name: 'Platform Admin',
      platformRole: 'PLATFORM_ADMIN',
      passwordHash: hashPassword(ADMIN_PW),
    },
  });

  // Demo vendor (from the vendor-console design). The dev console resolves this
  // vendor by slug (see apps/admin/src/lib/api.ts) until Better Auth lands.
  const vendor = await prisma.vendor.upsert({
    where: { slug: 'silk-road-auto' },
    update: { status: 'APPROVED' },
    create: {
      slug: 'silk-road-auto',
      legalName: 'Silk Road Auto LLC',
      displayName: 'Silk Road Auto',
      city: 'Tashkent',
      status: 'APPROVED',
      commissionBps: 1500,
    },
  });

  // Vendor owner (log into the console as this vendor — owns the 10 seeded cars)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@silkroad.auto' },
    update: { passwordHash: hashPassword(OWNER_PW) },
    create: { email: 'owner@silkroad.auto', name: 'Vendor Owner', passwordHash: hashPassword(OWNER_PW) },
  });
  await prisma.vendorMembership.upsert({
    where: { vendorId_userId: { vendorId: vendor.id, userId: owner.id } },
    update: {},
    create: { vendorId: vendor.id, userId: owner.id, role: 'VENDOR_OWNER' },
  });

  // Pickup location
  await prisma.location.upsert({
    where: { id: `${vendor.id}-tas` },
    update: {},
    create: {
      id: `${vendor.id}-tas`,
      vendorId: vendor.id,
      type: 'AIRPORT',
      iata: 'TAS',
      name: 'Tashkent International Airport',
      city: 'Tashkent',
      lat: 41.2579,
      lng: 69.2812,
    },
  });

  // Fleet
  for (const c of FLEET) {
    const id = `${vendor.id}-${c.model.toLowerCase().replace(/\s+/g, '-')}`;
    const fuel: FuelType = c.cat === 'electric' ? 'ELECTRIC' : 'PETROL';
    await prisma.vehicle.upsert({
      where: { id },
      update: { dailyRateUzs: usdToUzsMinor(c.usd), popular: c.popular },
      create: {
        id,
        vendorId: vendor.id,
        make: c.make,
        model: c.model,
        year: 2024,
        category: CAT[c.cat],
        transmission: c.auto ? 'AUTOMATIC' : 'MANUAL',
        fuelType: fuel,
        seats: c.seats,
        bags: c.bags,
        dailyRateUzs: usdToUzsMinor(c.usd),
        status: 'AVAILABLE',
        moderationStatus: 'APPROVED',
        publishedAt: new Date(),
        popular: c.popular,
      },
    });
  }

  // Add-ons
  for (const a of ADDONS) {
    await prisma.addon.upsert({
      where: { type: a.type },
      update: { priceUzs: usdToUzsMinor(a.usd) },
      create: { type: a.type, priceUzs: usdToUzsMinor(a.usd) },
    });
  }

  // Routes
  for (let i = 0; i < ROUTES.length; i++) {
    const r = ROUTES[i]!;
    await prisma.route.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        slug: r.slug,
        km: r.km,
        durationHrs: r.h,
        sortOrder: i,
        nameI18n: { en: r.en, ru: r.ru, uz: r.uz },
        taglineI18n: { en: r.ten, ru: r.tru, uz: r.tuz },
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded vendor "${vendor.displayName}" with ${FLEET.length} cars, ${ROUTES.length} routes, ${ADDONS.length} add-ons.`);
  // eslint-disable-next-line no-console
  console.log(`Logins → platform admin: admin@silkroad.drive / ${ADMIN_PW}  ·  vendor: owner@silkroad.auto / ${OWNER_PW}`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
