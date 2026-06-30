# FILEGUIDE — Silk Road Drive

> Where everything lives and where it will live. See **[CLAUDE.md](CLAUDE.md)** (project guide) and **[PROGRESS.md](PROGRESS.md)** (current state).

> **Status:** the monorepo below is now **scaffolded and building** (Phase 0). The "target layout" section is now the actual layout (apps may still be shells). Design files remain at the repo root as the visual reference.

## Current files (repo today)

| File | Role | Keep / port? |
|---|---|---|
| `package.json` · `pnpm-workspace.yaml` · `turbo.json` | Monorepo root (pnpm + Turborepo) | Keep |
| `tsconfig.base.json` · `.prettierrc` · `.npmrc` · `.gitignore` | Shared tooling config | Keep |
| `docker-compose.yml` · `.env.example` | Local infra (pg/redis/minio) + env template | Keep |
| `apps/` · `packages/` | The actual code (see layout below) | Keep |
| `CLAUDE.md` | Project guide + design-system reference | Keep |
| `PROGRESS.md` | Current state + roadmap checklist | Keep |
| `FILEGUIDE.md` | This file map | Keep |
| `Silk Road Drive.dc.html` | **Design — public storefront** (DesignCode export) | **Port to `apps/web`** |
| `Vendor Dashboard.dc.html` | **Design — vendor console** (DesignCode export) | **Port to `apps/admin`** |
| `support.js` | DesignCode runtime (interprets `<x-dc>`, `sc-for`, `DCLogic`) | Preview tooling only — **do not ship** |
| `image-slot.js` | `<image-slot>` web component used by the design | Preview tooling only — **do not ship** |
| `download` | Stray binary/asset | Inspect; likely removable |

> The `.dc.html` files are the **visual contract**. Open them in a browser to preview (they self-load `support.js`/`image-slot.js`). Reimplement their markup + inline styles as React + Tailwind; keep the tokens/type/layout, drop the DesignCode runtime.
>
> Suggested cleanup (not yet done — ask before moving): collect design assets under `design/` (`design/storefront.dc.html`, `design/vendor-dashboard.dc.html`, `design/runtime/`).

## Monorepo layout (scaffolded)

```
rent-a-car/
├─ CLAUDE.md · PROGRESS.md · FILEGUIDE.md
├─ design/                          # the .dc.html references (after cleanup)
├─ apps/
│  ├─ api/                          # NestJS 11 (Fastify) modular monolith
│  │  ├─ src/modules/               # auth · tenancy · vendors · catalog · availability ·
│  │  │                             #   pricing · booking · payments · deposits · ledger ·
│  │  │                             #   documents · content · admin · notifications
│  │  ├─ src/jobs/                  # BullMQ processors (expiry, hold-sweep, FX, payouts)
│  │  ├─ src/common/                # DTOs, VendorScopeGuard, filters, money/time utils
│  │  ├─ prisma/                    # schema.prisma + migrations + seed
│  │  └─ test/                      # Jest unit + Supertest/Testcontainers e2e
│  ├─ web/                          # Next.js 15 — public storefront (← Silk Road Drive.dc.html)
│  │  ├─ app/[locale]/(marketing)/  # ISR city/route/car-class landing + guides
│  │  ├─ app/[locale]/(booking)/    # search → results → detail → drawer → voucher
│  │  ├─ app/[locale]/(account)/    # customer account, my bookings
│  │  ├─ components/                # shadcn/ui, themed to design tokens
│  │  ├─ lib/                       # api-client hooks, Intl format utils
│  │  └─ messages/                  # en / ru / uz JSON namespaces
│  └─ admin/                        # Vite + React + MUI (← Vendor Dashboard.dc.html)
│                                   #   platform-staff + vendor-scoped (role-gated)
├─ packages/
│  ├─ api-client/                   # openapi-typescript client (from @nestjs/swagger)
│  ├─ types/                        # shared Zod schemas / domain types
│  ├─ i18n-messages/                # shared catalogs + ICU helpers
│  └─ config/                       # eslint / ts / tailwind / env (zod-validated)
├─ docker-compose.yml               # postgres + redis + minio (+ api + web)
├─ turbo.json
└─ pnpm-workspace.yaml
```

## Design → React component mapping

### Storefront (`Silk Road Drive.dc.html` → `apps/web`)
| Design block | Target |
|---|---|
| Header + lang switcher (EN/RU/UZ) | `components/site-header.tsx` + next-intl locale switch |
| Hero + rating badge | `app/[locale]/(marketing)/page.tsx` |
| Search widget (pickup/return city, dates, type) | `components/search-widget.tsx` → `/quotes` |
| Stats strip | `components/stats.tsx` |
| Fleet grid + filter chips + car card | `components/fleet/*` → `GET /vehicles`, `GET /search` |
| Routes grid (Samarkand…Aral) | `components/routes.tsx` → ContentPage (ROUTE) |
| Add-ons grid | `components/addons.tsx` → BookingExtra catalog |
| Reviews | `components/reviews.tsx` |
| Compare bar + modal | `components/compare/*` (client/Zustand) |
| Booking drawer (days, add-ons, totals, confirm) | `components/booking-drawer.tsx` → `POST /bookings` |
| Footer | `components/site-footer.tsx` |

### Vendor console (`Vendor Dashboard.dc.html` → `apps/admin`)
| Design view | Target |
|---|---|
| Sidebar + vendor profile card | `layouts/vendor-shell.tsx` (active-vendor context) |
| Overview (KPIs, chart, ending-soon, fleet status, cleaning) | `pages/overview.tsx` |
| Fleet (status-filtered cards) | `pages/fleet.tsx` → vendor-scoped `GET /vendor/vehicles` |
| Bookings table | `pages/bookings.tsx` → `GET /vendor/bookings` (+ accept/decline) |
| Clients table | `pages/clients.tsx` |
| Cleaning queue (priority, mark cleaned) | `pages/cleaning.tsx` → Vehicle status workflow |
| Add-car modal (photos, details, features, availability) | `components/add-car-modal.tsx` → `POST /vendor/vehicles` + MinIO upload |
| Toasts | shared toast util |

## Where to find / put things
- **Design tokens & type** → defined in CLAUDE.md "Design system"; implemented as the Tailwind theme in `packages/config` (web) and the MUI theme in `apps/admin`.
- **i18n strings** → the `.dc.html` `TR` objects (EN/RU/UZ) are ready-made seed copy → `apps/web/messages/*` + `packages/i18n-messages`.
- **Seed data** → the `.dc.html` `FLEET` / `ROUTES` / `ADDONS` / `REVIEWS` arrays → `apps/api/prisma/seed`.
- **Data model & API surface** → CLAUDE.md + the full plan file.
- **Domain rules (UZ payments, currency, eligibility, tenancy)** → CLAUDE.md "Uzbekistan rules" + the plan file.
- **Multi-tenant isolation (security-critical)** → `apps/api/src/common/`: `request-context/` (per-request principal via AsyncLocalStorage; swap dev headers for Better Auth here), `tenancy/` (`tenant-models.ts` registry — **add new vendor-scoped models here** — and `vendor-scoped-prisma.ts` `$extends`), `auth/guards.ts` (platform/vendor guards). Vendor endpoints live in `apps/api/src/vendors/`.
