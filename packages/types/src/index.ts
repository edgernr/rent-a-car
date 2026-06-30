/**
 * Silk Road Drive — shared domain types & Zod schemas.
 * Used by the API (DTO validation) and the React apps (forms, API client).
 * Keep enums in sync with `apps/api/prisma/schema.prisma`.
 */
import { z } from 'zod';

// ─── Locales ──────────────────────────────────────────────────
export const LOCALES = ['en', 'ru', 'uz'] as const;
export const DEFAULT_LOCALE = 'en';
export const localeSchema = z.enum(LOCALES);
export type Locale = (typeof LOCALES)[number];

// ─── Money ────────────────────────────────────────────────────
// Canonical currency is always UZS; amounts are integer minor units.
export const CURRENCY = 'UZS' as const;

// ─── Catalog enums (from the delivered design) ────────────────
export const vehicleCategorySchema = z.enum([
  'ECONOMY',
  'SEDAN',
  'SUV',
  'SEVEN_SEATER',
  'ELECTRIC',
]);
export type VehicleCategory = z.infer<typeof vehicleCategorySchema>;

export const transmissionSchema = z.enum(['AUTOMATIC', 'MANUAL']);
export type Transmission = z.infer<typeof transmissionSchema>;

export const fuelTypeSchema = z.enum(['PETROL', 'CNG', 'DIESEL', 'HYBRID', 'ELECTRIC']);
export type FuelType = z.infer<typeof fuelTypeSchema>;

// Operational status + cleaning workflow (from the vendor console design).
export const vehicleStatusSchema = z.enum(['AVAILABLE', 'RENTED', 'CLEANING', 'MAINTENANCE']);
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>;

export const moderationStatusSchema = z.enum([
  'DRAFT',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'DELISTED',
]);
export type ModerationStatus = z.infer<typeof moderationStatusSchema>;

// ─── Booking enums ────────────────────────────────────────────
export const bookingTypeSchema = z.enum(['SELF_DRIVE', 'WITH_DRIVER']);
export type BookingType = z.infer<typeof bookingTypeSchema>;

export const bookingStatusSchema = z.enum([
  'DRAFT',
  'PENDING_PAYMENT',
  'CONFIRMED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
]);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

export const vendorAcceptanceSchema = z.enum(['PENDING', 'ACCEPTED', 'DECLINED']);
export type VendorAcceptance = z.infer<typeof vendorAcceptanceSchema>;

// ─── Vendor / marketplace enums ───────────────────────────────
export const vendorStatusSchema = z.enum([
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'SUSPENDED',
  'REJECTED',
]);
export type VendorStatus = z.infer<typeof vendorStatusSchema>;

export const platformRoleSchema = z.enum(['NONE', 'PLATFORM_STAFF', 'PLATFORM_ADMIN']);
export type PlatformRole = z.infer<typeof platformRoleSchema>;

export const vendorRoleSchema = z.enum(['VENDOR_OWNER', 'VENDOR_STAFF']);
export type VendorRole = z.infer<typeof vendorRoleSchema>;

// ─── Payments enums ───────────────────────────────────────────
export const paymentModeSchema = z.enum(['PAY_ON_PICKUP', 'DEPOSIT_ONLINE', 'FULL_ONLINE']);
export type PaymentMode = z.infer<typeof paymentModeSchema>;

export const depositModeSchema = z.enum([
  'NONE',
  'ONLINE_HOLD',
  'ONLINE_CHARGE_REFUNDABLE',
  'CASH_ON_PICKUP',
]);
export type DepositMode = z.infer<typeof depositModeSchema>;

export const gatewaySchema = z.enum(['CLICK', 'PAYME', 'ACQUIRER_CARD', 'STRIPE', 'MANUAL_CASH']);
export type Gateway = z.infer<typeof gatewaySchema>;

export const addonTypeSchema = z.enum([
  'DRIVER',
  'CDW_INSURANCE',
  'GPS',
  'CHILD_SEAT',
  'WIFI',
  'UNLIMITED_MILEAGE',
]);
export type AddonType = z.infer<typeof addonTypeSchema>;

// ─── Example shared DTO: search query ─────────────────────────
export const searchQuerySchema = z.object({
  pickupLocationId: z.string().optional(),
  dropoffLocationId: z.string().optional(),
  pickupAt: z.string().datetime().optional(),
  dropoffAt: z.string().datetime().optional(),
  category: vehicleCategorySchema.optional(),
  bookingType: bookingTypeSchema.optional(),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

/** Format integer UZS minor units (tiyin) for display, e.g. 450000000 -> "4 500 000 so'm". */
export function formatUzs(minor: number): string {
  const soum = Math.round(minor / 100);
  return `${soum.toLocaleString('ru-RU').replace(/,/g, ' ')} so'm`;
}
