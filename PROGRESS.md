# PROGRESS — Silk Road Drive

> Single source of truth for current state. Update at the end of every working session. See **[CLAUDE.md](CLAUDE.md)** for the project guide and **[FILEGUIDE.md](FILEGUIDE.md)** for the file map.

**Last updated:** 2026-06-30
**Current stage:** **Phase 0 scaffold built & verified.** Monorepo compiles end-to-end; backend runtime pending a local database.

## Current state

- ✅ Architecture & domain research done (UZ payments, currency law, eligibility, modern stack, marketplace layer). Full plan: `C:\Users\ZEPHYRUS\.claude\plans\lets-make-a-project-iterative-nest.md`.
- ✅ Product decisions locked (see Decision Log).
- ✅ Design received: `Silk Road Drive.dc.html` (storefront) + `Vendor Dashboard.dc.html` (vendor console) — design system extracted into CLAUDE.md.
- ✅ Project docs created (CLAUDE.md, PROGRESS.md, FILEGUIDE.md).
- ✅ **Monorepo scaffolded** (pnpm + Turborepo): `apps/api`, `apps/web`, `apps/admin`, `packages/config`, `packages/types`.
- ✅ **Verified (build):** `pnpm install` OK · all packages + 3 apps **build** OK · **typecheck** clean · storefront prerenders /en /ru /uz.
- ✅ **Verified (runtime):** `docker compose up` (pg/redis/minio) OK · `prisma migrate dev` (init migration) OK · `db:seed` loaded 10 cars / 6 routes / 6 add-ons · API live: `/health` → `{status:"ok",db:"up"}`, `/vehicles` returns 10 with dual UZS/USD pricing.
- ✅ **Tenancy spine built & verified (Phase 1 start):** AsyncLocalStorage request context + Prisma `$extends` vendor-scoping + RBAC guards + vendors module. Curl test proved: vendor A sees only its cars (not B's, not seeded), `vendorId` auto-stamped on create, 403 without the right role/context.
- ✅ **Auth & registration built & verified (native session auth):** scrypt password hashing + Postgres-backed sessions + HttpOnly cookie (`srd_session`, SameSite=Lax). Endpoints: `/auth/register` (customer), `/auth/vendor/register` (creates user+vendor+owner membership, PENDING_REVIEW), `/auth/login|logout|me`. `ContextMiddleware` now resolves the principal (incl. active vendor) **from the session cookie**; dev `x-srd-*` headers remain only as a non-prod fallback. Verified via curl + CORS/cookie preflight for both origins.
- ✅ **Vendor console gated by real login** (`apps/admin`): sign-in / register-company screen, cookie-based API client (no dev headers), vendor identity + sign-out in the sidebar. **Storefront** has customer Sign in/Register (header + modal, EN/RU/UZ).
- ✅ **Marketplace loop closed:** platform-admin console (login as `admin@silkroad.drive`) lists vendors and **approves** them; approving a vendor auto-publishes its pending cars to the storefront. New cars from an already-APPROVED vendor auto-publish. Verified: register → add car (DRAFT, hidden) → admin approves → car appears on storefront; non-admins get 403. **Dev logins:** `admin@silkroad.drive / admin12345` (platform), `owner@silkroad.auto / owner12345` (vendor w/ 10 cars).
- ⚠️ **Deviation:** implemented native session auth instead of Better Auth (the planned lib) — same security model, fully verifiable, no fiddly NestJS+Fastify integration. Behind `AuthModule`, so Better Auth can replace it later if desired. Cross-vendor **Jest** contract tests still pending.

### What's runnable now
- API: NestJS (Fastify) with `/api/v1/health`, `/api/v1/vehicles`, `/api/v1/routes`, `/api/v1/addons`, Swagger at `/api/docs`.
- Web: Next.js storefront (header, hero, search, fleet, routes, footer) in EN/RU/UZ, themed to the design, fetching the catalog (graceful fallback when API is down).
- Admin: Vite + MUI vendor console shell (sidebar, Overview KPIs, Fleet table from the API).
- DB: Prisma schema (tenancy + catalog + minimal booking) + seed using the design's fleet/routes/add-ons.

### Deployment (managed — ready to ship)
- **Target:** API + Postgres on **Render** ([`render.yaml`](render.yaml)); storefront + console on **Vercel**. Full runbook: [`DEPLOY.md`](DEPLOY.md).
- **Cross-origin cookie solution:** each frontend calls the API via a **same-origin `/api` proxy** (Next.js rewrite for web; [`apps/admin/vercel.json`](apps/admin/vercel.json) for admin) → session cookie stays first-party. Verified locally (login through `:3000/api` → cookie on storefront origin → `/auth/me` OK). Dev now uses the same proxies (Vite `server.proxy`).
- API is managed-host ready: listens on `PORT`, Fastify `trustProxy`, prod cookies `Secure`, CORS from env.
- **I can't click-deploy** (no access to your Vercel/Render) — you run the runbook; env URLs are filled at deploy time. Redis/MinIO not needed yet (no jobs/uploads), so not provisioned.

### Toolchain notes (this machine)
- `pnpm` 9.15.0 was installed to `%APPDATA%\npm-global` (corepack couldn't write to the read-only Program Files node dir). If `pnpm` isn't found in a new shell, prepend that dir to PATH.
- `turbo run` hits a Windows DLL error (`0xC0000135`) on this box — use per-app `pnpm --filter <app> <script>` until resolved (likely a missing VC++ runtime for turbo's native binary).
- Shared `@srd/*` packages are ESM (so Vite/Next consume them natively; Node 24 handles `require()` from the CJS API).

### To run locally (next step)
1. Start **Docker Desktop**, then `docker compose up -d`
2. `cp .env.example .env` and `cp .env apps/api/.env`
3. `pnpm db:generate && pnpm db:migrate && pnpm db:seed`
4. `pnpm --filter @srd/api dev` · `pnpm --filter @srd/web dev` · `pnpm --filter @srd/admin dev`
5. Verify: http://localhost:4000/api/v1/health → `{status:"ok",db:"up"}`, then the storefront at :3000 and console at :5173.

## Roadmap & checklist

> Tenancy is built **first** — retrofitting multi-vendor later is the #1 rewrite trap. First end-to-end bookable build = end of Phase 2 (pay-on-pickup). Online money = Phase 3.

### Phase 0 — Foundations & tenancy spine  🟡 In progress
- [x] pnpm + Turborepo monorepo; `apps/api` (NestJS+Fastify), `apps/web` (Next.js 15), `apps/admin` (Vite) scaffolds
- [x] `packages/`: `config`, `types` (api-client + i18n-messages packages deferred until needed)
- [x] Docker Compose: Postgres 16 + Redis + MinIO
- [x] Prisma 6.x wired + schema + seed script (migration to be run once DB is up)
- [x] `@nestjs/swagger` exposed at `/api/docs` (typed `packages/api-client` generation pipeline still TODO)
- [ ] CI (GitHub Actions: lint, typecheck, test)
- [x] **Auth foundation:** native session `AuthModule` (NestJS+Fastify, HttpOnly cookie) — customer + vendor registration, login/logout/me, session-based request context. *(Chose native sessions over Better Auth — see deviation note above.)*
- [ ] **De-risk spike B:** Cloudflare reachability from Tashkent host + MinIO wiring
- [x] **Tenancy:** two RBAC planes + guards + Prisma `$extends` vendorId injection + tenant-model registry  *(active-vendor from dev header until Better Auth; isolation verified via curl — Jest contract tests still TODO)*
- [ ] Provision Tashkent VPS/DC
- [ ] Resolve `turbo` native DLL error on Windows (use per-app filters meanwhile)

### Phase 1 — Vendors + catalog + i18n  🟡 In progress
- [~] Vendor onboarding: **self-service registration + platform-admin approval (with auto-publish) done** · KYB `VendorDocument` upload/review + encrypted `VendorPayout` (TODO)
- [~] Vendor status state machine (statuses + approve **done**) · BullMQ events + audit log (TODO)
- [~] Vendor-scoped CRUD: Vehicle (create + list **done**, wired to console) / PricingRule / AvailabilityBlock / PickupLocation (TODO)
- [ ] Vehicle operational status (Available/Rented/Cleaning/Maintenance) + cleaning queue
- [ ] Graduated listing moderation (first-N pre-approval → auto-publish + spot-review)
- [ ] next-intl (en/ru/uz-Latn) + central Intl format utils (UZS currency, spelled-month dates)
- [ ] Photo upload → MinIO + CDN
- [ ] Public ISR listing + vehicle-detail pages (APPROVED vendors only), dual UZS/USD display
- [x] Storefront matching `Silk Road Drive.dc.html` — header, hero, search, **stats, fleet (filter + cards), routes, add-ons, reviews, CTA, footer**, plus interactive **compare bar/modal** and **booking drawer** (day stepper, add-on toggles, live totals, confirm + toast). EN/RU/UZ. Data from API w/ fallback.
- [x] Vendor console matching `Vendor Dashboard.dc.html` — sidebar + badges, Overview (KPIs, weekly chart, returns-ending-soon, **fleet status from live data**, cleaning queue), **Fleet (live vendor-scoped + status filter)**, Bookings/Clients/Cleaning (design sample data), **Add-car modal → POST /vendor/vehicles → refetch + toast**. Dev vendor context via headers (Better Auth TODO).

### Phase 2 — Availability, pricing, booking + PAY_ON_PICKUP  ⬜ Not started
- [ ] Availability service (transactional double-booking prevention)
- [ ] Pricing engine → signed short-TTL quote token
- [ ] Policy-parameterized booking-payment state machine + BullMQ auto-expiry
- [ ] `resolve-payment` snapshotting (commission/policy/price/mor/gateway/depositMode)
- [ ] Vendor accept/decline (request + pay-on-pickup)
- [ ] Self-drive document capture (IDP/age/tenure validation) + with-driver itinerary
- [ ] Cash/manual deposit
- [ ] Storefront booking drawer + compare (full funnel) ← **first bookable build**

### Phase 3 — Online rails + ledger + Platform-as-MoR  ⬜ Not started
- [ ] Click + Payme adapters (PayTechUZ protocol) + bank acquirer (foreign Visa/MC)
- [ ] Gateway-capability gating + downgrade-to-pay-on-pickup
- [ ] Platform-as-MoR capture netting commission at source
- [ ] Typed append-only UZS ledger + derived VendorBalance
- [ ] Idempotent signed webhooks → WebhookInbox → reconciliation + per-adapter contract tests
- [ ] Deposit state machine (cash + best-effort online hold/charge) + partial capture + release
- [ ] Refunds + pro-rata commission clawback
- [ ] Manual payout CSV export + monthly commission invoices/accruals
- [ ] Stripe adapter stubbed behind the interface

### Phase 4 — SEO, content, notifications  ⬜ Not started
- [ ] ISR city/route/car-class landing pages + guides (docs/IDP/deposit/insurance)
- [ ] JSON-LD (Product/Offer/BreadcrumbList/FAQ/Review) + multilingual sitemap + hreflang + robots
- [ ] Core Web Vitals pass (next/image + CDN)
- [ ] Email vouchers + Telegram/WhatsApp deep links
- [ ] Human-reviewed legal copy per locale; AuditLog; rate limiting + 2FA; FX-refresh job

### Phase 5 — Hardening & pre-launch  ⬜ Not started
- [ ] Postgres RLS defense-in-depth
- [ ] e2e (Supertest + Testcontainers) + load test booking+payment
- [ ] Nightly Postgres backups + PITR verified on Tashkent host
- [ ] Staging UAT: Click/Payme sandbox + (if available) acquirer foreign-card test
- [ ] Security review (auth, webhook signatures, quote tampering, deposit authz, cross-vendor isolation)
- [ ] Monitoring/alerting + reconciliation runbook

## Decision log
| Date | Decision | Notes |
|---|---|---|
| 2026-06-30 | Multi-vendor marketplace | Vendor accounts, commission, payouts in scope for MVP |
| 2026-06-30 | Both self-drive & with-driver | With-driver = low-friction primary path |
| 2026-06-30 | Per-vendor payment policy | pay-on-pickup / deposit-online / full-online, vendor picks |
| 2026-06-30 | Admin onboards vendors (white-glove) | Self-service signup deferred to fast-follow |
| 2026-06-30 | Self-managed Tashkent hosting | Docker Compose + Cloudflare; validate CF reachability early |
| 2026-06-30 | UZ-only payments for now | Local acquirer for foreign cards; Stripe stubbed |
| 2026-06-30 | Vehicle categories = Economy/Sedan/SUV/7-seater/Electric | Aligned to the delivered design |
| 2026-06-30 | Prisma pinned to 6.x | Avoid Prisma 7 breaking changes on self-managed runtime |
| 2026-06-30 | Native session auth instead of Better Auth | Avoids fiddly NestJS+Fastify integration; same model (Postgres sessions + HttpOnly cookie, scrypt). Behind `AuthModule` — swappable. |
| 2026-06-30 | Self-service vendor registration enabled | User asked for full vendor/client registration (supersedes the earlier admin-only onboarding for v1); new vendors start `PENDING_REVIEW`. |

## Open questions (resolve before launch — don't block scaffolding)
1. Legal/tax sign-off on Platform-as-MoR (VAT / agent-vs-principal / fund custody) — required before FULL_ONLINE.
2. Bank acquirer choice (Uzum/Kapitalbank/Octobank) + written confirmation of foreign-card 3DS + two-stage PREAUTH_HOLD.
3. Deposit-escrow / vendor-fund custody — escrow/custody-license question in UZ?
4. Commission enforcement for pure pay-on-pickup vendors (no online volume to net against).
5. Checkout price-lock policy for USD-display vs UZS-settlement drift.
6. Production legal numbers (deposit ranges, mileage caps, age, CDW excess, fines, IDP rules) — verify vs official sources.
7. Tier-2 language priority (zh-Hans/tr/ko/de/fr).

## Next actions
1. **Better Auth** as a NestJS+Fastify `AuthModule` (HttpOnly sessions in Postgres) → replace the dev `x-srd-*` header principal in `ContextMiddleware` with the real session + membership lookup. Share the cookie with web/admin.
2. Add **Jest cross-vendor contract tests** (Supertest + Testcontainers) to lock the isolation guarantee in CI.
3. Flesh out vendor management: KYB `VendorDocument` upload (MinIO), encrypted `VendorPayout`, vendor status events/audit; then wire the admin console's vehicle CRUD + Add-car modal to `/vendor/vehicles`.
4. De-risk spike B (Cloudflare/MinIO from Tashkent) before the storefront photo pipeline.
