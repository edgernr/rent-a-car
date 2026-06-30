# CLAUDE.md — Silk Road Drive

> Project memory for Claude Code. Read this first every session. Companion docs: **[PROGRESS.md](PROGRESS.md)** (current state / roadmap), **[FILEGUIDE.md](FILEGUIDE.md)** (file map), and the full architecture plan at `C:\Users\ZEPHYRUS\.claude\plans\lets-make-a-project-iterative-nest.md`.

## What we're building

**Silk Road Drive** — an online **car-rental marketplace for tourists in Uzbekistan**. Multiple local rental companies (vendors) list cars; the platform takes a commission. Cars can be **self-drive** or **with a driver (chauffeur)**. Customers are mostly foreign tourists doing the Silk Road loop (Tashkent → Samarkand → Bukhara → Khiva).

The user owns **visual/UX design** (delivered as the `.dc.html` files — see Design System below). Claude owns **technical realization**.

### Locked product decisions
- **Multi-vendor marketplace** (not single operator) — vendor accounts, per-vendor inventory, commission, payouts.
- **Both self-drive & with-driver.**
- **Per-vendor payment policy** — each vendor picks pay-on-pickup / deposit-online / full-online.
- **Admin onboards vendors** (white-glove) for v1; self-service signup is a fast-follow.
- **Self-managed Tashkent hosting** (Docker Compose on a Tashkent Tier-III VPS/DC + Cloudflare).
- **UZ-only payments for now** — local bank acquirer for foreign cards; Stripe stubbed behind the interface (activates only if a foreign entity exists later).
- **MVP scope:** SEO public site + admin panel + multi-language (EN/RU/UZ) + online payments.

## Tech stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm + Turborepo |
| Backend | NestJS 11 on Fastify (TypeScript strict), modular monolith |
| ORM / DB | Prisma (pinned stable **6.x**, not 7) + PostgreSQL 16 |
| Async | BullMQ + Redis |
| Public web | Next.js 15 App Router (SSR/ISR for SEO) |
| Admin + vendor UI | Vite + React + MUI (login-walled, no SEO) |
| Auth | Better Auth, server-side sessions in Postgres, HttpOnly cookies |
| Web state | TanStack Query + Zustand + react-hook-form + Zod |
| Styling | Tailwind + shadcn/ui, themed to the design tokens below |
| i18n | next-intl (`/en`, `/ru`, `/uz`) |
| Storage | Self-hosted MinIO (S3-compatible) + Cloudflare CDN |
| Money / time | dinero.js (integer minor units) + Luxon (Asia/Tashkent) |
| Deploy | Docker Compose on a Tashkent Tier-III VPS/DC, Cloudflare in front |

## Design system (source of truth = the `.dc.html` files)

The uploaded designs are the **canonical UI reference**. When building React components, match these tokens, type, and layouts exactly. Two screens are designed:
- **`Silk Road Drive.dc.html`** → public storefront (`apps/web`).
- **`Vendor Dashboard.dc.html`** → vendor console (`apps/admin`, vendor-scoped surface).

> `.dc.html` is a "DesignCode" preview export: `<x-dc>` markup with `sc-for`/`sc-if`/`{{ }}` directives and a `DCLogic` class. `support.js` + `image-slot.js` are its **runtime/preview tooling — not app source**. Open the `.dc.html` files in a browser to preview. Port the markup + inline styles into real React/Tailwind components; do not ship the DesignCode runtime.

### Brand & tokens
Dark, premium, "Silk Road" feel. CSS custom properties (use these as Tailwind theme tokens):

```
--bg:    #0A1A24   /* page background (storefront)  */
--bg2:   #0C2029   /* alt background / sections      */
--surf:  #102C38   /* card / surface                */
--surf2: #163A47   /* raised surface                */
--gold:  #E0A93B   /* PRIMARY accent — CTAs, prices, active state */
--teal:  #2BB8AD   /* secondary accent              */
--blue:  #3AA0D6   /* tertiary accent               */
--cream: #F3EEE2   /* primary text                  */
--muted: #93A8B0   /* muted text (#8DA2AA in admin) */
--line:  rgba(226,221,206,.11)  /* borders          */
--rose:  #D98C6A   /* danger / maintenance / high-priority */
```
Status colors (vendor console): available=teal `#2BB8AD`, rented=blue `#3AA0D6`, cleaning/ending=gold `#E0A93B`, maintenance/high-priority=rose `#D98C6A`. Badges/pills = translucent bg (~15% alpha) + solid fg.

### Type
- **Display / headings:** `Bricolage Grotesque` (700/800), tight letter-spacing (`-.02em`), `text-wrap:balance`.
- **Body / UI:** `Manrope` (400–700).
- **Mono accents:** `ui-monospace` (eyebrows, plate numbers, image captions).

### Motifs & component patterns
- 45°-rotated **gold diamond** logo mark; diamond/square accents throughout.
- Repeating diagonal cross-hatch gradients as **image placeholders** (Silk Road map texture) — replace with real photos via `next/image` / MinIO.
- Rounded corners 11–22px; sticky headers with `backdrop-filter:blur`; glassy overlays.
- Pills for status/badges; chip-style filter toggles (active = gold fill).
- Right-side **booking drawer** (storefront) and centered **modals** (compare, add-car).
- Toasts bottom-center (teal).

### Storefront screens/flows (from `Silk Road Drive.dc.html`)
Header (logo · Fleet/Routes/Add-ons/Reviews · EN/RU/UZ switcher · Book now) → Hero + rating badge → **Search widget** (pickup city, return city, dates, car type) → Stats → **Fleet** (filter chips: All/Economy/Sedan/SUV/7-seater/Electric; car cards with price `$/day`, seats, transmission, bags, Reserve + Compare) → **Routes** (Samarkand/Bukhara/Khiva/Fergana/Nuratau/Aral with km + drive time) → **Add-ons** (driver, full insurance CDW, GPS, child seat, Wi-Fi, unlimited mileage) → Reviews → CTA → Footer. Plus **Compare bar + modal** and a **Booking drawer** (days stepper, add-on toggles, live totals, confirm).

### Vendor console screens (from `Vendor Dashboard.dc.html`)
Sidebar (Overview/Fleet/Bookings/Clients/Cleaning + vendor profile card) → topbar (search, notifications, **Add car**). Views: **Overview** (6 KPIs, weekly bookings bar chart, returns-ending-soon, fleet-status breakdown, cleaning queue), **Fleet** (status-filtered cards w/ plate, next-free, status badge), **Bookings** (table: client/car/dates/time-left/status/total), **Clients** (table), **Cleaning** (priority queue + mark-cleaned). Plus an **Add-car modal** (photos via `image-slot`, make/model, category, transmission, seats, year, plate, daily price, feature chips, availability/pickup-location) and toasts.

### Design details to fold into the data model
- **Vehicle categories** (canonical, from the design): `ECONOMY | SEDAN | SUV | SEVEN_SEATER | ELECTRIC`. (Supersedes the earlier plan's category list.)
- **Vehicle operational status**: `AVAILABLE | RENTED | CLEANING | MAINTENANCE` + a **cleaning queue** workflow with priority — this is a real vendor feature, add it to the model.
- **Add-ons** are catalog items: driver, CDW insurance, GPS, child seat, Wi-Fi, unlimited mileage.
- Sample fleet uses real UZ-market cars (UzAuto Chevrolet line + Chery Tiggo 8 Pro + BYD Song Plus EV) — good seed data.
- Pricing is shown **USD-forward** (`$/day`) in the design. **Compliance rule still holds:** store & charge canonical **UZS** (Article 9); USD is an indicative display value. Reconcile the design's USD display with UZS settlement (dual display, "charged in UZS" disclaimer).

## Uzbekistan rules that must not be violated (the gotchas)
- **Money:** integer **UZS minor units** everywhere; UZS is the only settlement currency. USD is display-only from a daily indicative rate.
- **Payments:** domestic = Click + Payme (PayTechUZ *protocol*, hand-built NestJS adapters); foreign Visa/MC = **bank acquirer**, not wallet brands. Stripe stays stubbed. Card deposit holds unconfirmed → **cash deposit is the default**.
- **Eligibility:** self-drive requires passport + licence + **IDP** (mandatory at data level); min age 21/25 + ~2-yr tenure per category. With-driver = passport only (the low-friction primary path).
- **i18n:** `en` (source of truth) + `ru` (Cyrillic) + `uz-Latn` (**never** uz-Cyrl). ICU plurals for RU/UZ. UZS rendered 0-decimal (`450 000 so'm`). Dates with **spelled-out month + Asia/Tashkent** label.
- **Tenancy:** `vendorId` on every operational row; isolation via `VendorScopeGuard` + Prisma `$extends` (not RLS for MVP). Cross-vendor access must return 404/empty — covered by contract tests.

## Conventions
- TypeScript strict end-to-end; Zod schemas shared via `packages/types`.
- Never floats for money — `dinero.js`, integer minor units, explicit currency.
- Never naive dates — `Luxon`, `Asia/Tashkent` (UTC+5, no DST).
- Bookings **snapshot** vendor commission + payment policy + price at quote/hold (history never mutates).
- Webhooks persisted to `WebhookInbox` before processing; idempotent; source of truth for payment state.
- API is REST under `/api/v1`, described by `@nestjs/swagger`, generating `packages/api-client`.

## Commands (fill in as the repo is scaffolded — see PROGRESS.md)
```
pnpm install
pnpm dev            # turbo: api + web + admin
pnpm --filter api prisma migrate dev
pnpm --filter api prisma db seed
pnpm test           # jest unit
pnpm test:e2e       # supertest + testcontainers
pnpm lint && pnpm typecheck
docker compose up   # postgres + redis + minio (+ api + web)
```

## Working agreement
- Build phase by phase per **[PROGRESS.md](PROGRESS.md)**; keep it updated as the single source of current state.
- The `.dc.html` designs are the visual contract — match them; flag any deviation.
- Surface UZ compliance/payment risks early; don't silently work around them.
