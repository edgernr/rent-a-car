# Deploy — Silk Road Drive (managed platforms)

Test deployment: **API + Postgres on [Render]**, **storefront + console on [Vercel]**. You run the platform clicks (I can't log in as you); the repo is already wired for it.

> Architecture note: each frontend calls the API through a **same-origin proxy**
> (`/api/*`), so the session cookie stays first-party (no third-party-cookie
> breakage). The storefront uses a Next.js rewrite; the console uses `vercel.json`.

Prerequisite: push this repo to GitHub (Render + Vercel deploy from a Git repo).

---

## 1. API + database → Render

1. **render.com** → **New → Blueprint** → connect this repo → it reads [`render.yaml`](render.yaml) and creates **`srd-db`** (Postgres) + **`srd-api`** (web service). Click **Apply**.
2. Wait for the first deploy. `prisma migrate deploy` runs automatically on start.
3. **Seed once** (for the demo data + logins): srd-api → **Shell** tab →
   ```
   pnpm --filter @srd/api exec prisma db seed
   ```
4. Note the API URL, e.g. `https://srd-api.onrender.com`. Check `https://srd-api.onrender.com/api/v1/health` → `{"status":"ok","db":"up"}`.

> Free tier sleeps after inactivity — the first request after idle takes ~30s. Fine for testing.

---

## 2. Storefront → Vercel

1. **vercel.com** → **Add New → Project** → import this repo.
2. **Root Directory:** `apps/web`  ·  **Framework:** Next.js (auto).
3. **Build & Output → Build Command** (so workspace packages build first):
   ```
   cd ../.. && pnpm --filter @srd/config build && pnpm --filter @srd/types build && pnpm --filter @srd/web build
   ```
   **Install Command:** `pnpm install --no-frozen-lockfile`
4. **Environment Variables:**
   - `API_ORIGIN` = `https://srd-api.onrender.com`  (your API URL, **no** `/api/v1`)
5. **Deploy.** Visit the Vercel URL → storefront loads; **Sign in** works (cookie is first-party via the `/api` rewrite).

---

## 3. Vendor console → Vercel (second project)

1. **Add New → Project** → same repo → **Root Directory:** `apps/admin`  ·  Framework: **Vite**.
2. **Build Command:**
   ```
   cd ../.. && pnpm --filter @srd/config build && pnpm --filter @srd/types build && pnpm --filter @srd/admin build
   ```
   **Install Command:** `pnpm install --no-frozen-lockfile`  ·  **Output Directory:** `dist`
3. Edit [`apps/admin/vercel.json`](apps/admin/vercel.json): replace `REPLACE_WITH_API_HOST` with your API host (e.g. `srd-api.onrender.com`), commit, push.
4. **Deploy.** Visit the console URL → log in as a vendor or platform admin.

---

## 4. Finish wiring

- On Render **srd-api**, set `CORS_ORIGINS` to your two Vercel URLs (comma-separated), e.g.
  `https://srd-web.vercel.app,https://srd-admin.vercel.app` → save (redeploys). *(Belt-and-suspenders; proxied calls don't trigger CORS.)*

## Test logins (from the seed)
- **Platform admin:** `admin@silkroad.drive` / `admin12345`
- **Vendor:** `owner@silkroad.auto` / `owner12345`

## Smoke test the live loop
1. Storefront → browse fleet, switch EN/RU/UZ, open the booking drawer.
2. Console → log in as the vendor → **Add car**.
3. Console → log in as the platform admin → **Approve** a pending vendor → its cars appear on the storefront.

## Not deployed yet (not needed for this test)
- **Redis / BullMQ** (no background jobs wired yet) and **MinIO** (no uploads yet). Add when those features land. For the Tashkent self-managed target later, see the plan + `docker-compose.yml`.
