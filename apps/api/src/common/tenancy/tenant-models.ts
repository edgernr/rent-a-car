/**
 * Central registry of every Prisma model that carries a `vendorId` (tenant key).
 *
 * The vendor-scoping extension only filters/stamps models listed here, so this
 * list is security-critical: if you add a tenant-scoped model to the schema,
 * add it here too. A unit test asserts every model with a `vendorId` column is
 * registered (TODO: wire that test alongside the e2e harness).
 */
export const TENANT_MODELS = new Set<string>([
  'Vehicle',
  'Location',
  'Booking',
  // Future tenant-scoped models (PricingRule, AvailabilityBlock, Payment,
  // DepositRecord, PayoutLedgerEntry, …) get added here as they land.
]);

export function isTenantModel(model: string | undefined): boolean {
  return !!model && TENANT_MODELS.has(model);
}
