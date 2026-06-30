# Silk Road Drive

Tourist car-rental **marketplace** for Uzbekistan. Multi-vendor, self-drive & with-driver, EN/RU/UZ, UZS-settled.

- **Project guide:** [CLAUDE.md](CLAUDE.md) · **Current state:** [PROGRESS.md](PROGRESS.md) · **File map:** [FILEGUIDE.md](FILEGUIDE.md)

## Stack
- `apps/api` — NestJS 11 (Fastify) + Prisma 6 + PostgreSQL 16 + Redis/BullMQ
- `apps/web` — Next.js 15 (App Router, next-intl, Tailwind) — public storefront
- `apps/admin` — Vite + React + MUI — vendor/platform console
- `packages/*` — shared types, config

## Quick start
```bash
# 1. install
pnpm install

# 2. start infra (postgres + redis + minio)
docker compose up -d

# 3. env
cp .env.example .env            # then edit
cp .env apps/api/.env           # api reads its own .env

# 4. database
pnpm db:generate
pnpm db:migrate

# 5. run everything
pnpm dev
```
- Web → http://localhost:3000
- API → http://localhost:4000/api/v1 (Swagger at `/api/docs`)
- Admin → http://localhost:5173
- MinIO console → http://localhost:9001

## Useful
```bash
pnpm typecheck      # all workspaces
pnpm build          # all workspaces
pnpm db:studio      # prisma studio
```
