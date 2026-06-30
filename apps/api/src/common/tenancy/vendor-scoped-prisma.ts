import type { PrismaClient } from '@prisma/client';
import { isTenantModel } from './tenant-models';

/**
 * Returns a Prisma client bound to a single vendor. For every tenant-scoped
 * model it:
 *   - injects `where: { vendorId }` on reads, counts, aggregates and *Many mutations
 *     (Prisma 4.5+ allows extra non-unique filters on findUnique too)
 *   - stamps `vendorId` on create / createMany
 *   - blocks single-record update/delete/upsert (use updateMany/deleteMany, which
 *     are scoped) so a vendor can never mutate another vendor's row by id
 *
 * Deny-by-default for the registered models. Platform-wide access uses the
 * unscoped base client explicitly (TenantPrisma.asPlatform()).
 */
export function vendorScopedClient(base: PrismaClient, vendorId: string): PrismaClient {
  return base.$extends({
    query: {
      $allModels: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async $allOperations({ model, operation, args, query }: any) {
          if (!isTenantModel(model)) {
            return query(args);
          }

          switch (operation) {
            case 'findUnique':
            case 'findUniqueOrThrow':
            case 'findFirst':
            case 'findFirstOrThrow':
            case 'findMany':
            case 'count':
            case 'aggregate':
            case 'groupBy':
            case 'updateMany':
            case 'deleteMany':
              args.where = { ...(args.where ?? {}), vendorId };
              return query(args);

            case 'create':
              args.data = { ...(args.data ?? {}), vendorId };
              return query(args);

            case 'createMany': {
              const rows = Array.isArray(args.data) ? args.data : [args.data];
              args.data = rows.map((d: Record<string, unknown>) => ({ ...d, vendorId }));
              return query(args);
            }

            // Single-record mutations by unique id can't carry the vendor filter
            // safely — force vendor code to use the scoped *Many variants.
            case 'update':
            case 'delete':
            case 'upsert':
              throw new Error(
                `Tenant-scoped ${model}.${operation} is not allowed on a vendor client; use updateMany/deleteMany.`,
              );

            default:
              return query(args);
          }
        },
      },
    },
  }) as unknown as PrismaClient;
}
