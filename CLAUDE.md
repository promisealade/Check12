# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Afrione — regulated dual-stablecoin VASP platform for cross-border payments, savings, and business collections (AFRi USD-pegged + xGHS Cedi-pegged). Turborepo + pnpm workspace with two apps and one shared package.

- `apps/api` — NestJS 10 backend (port 3001), TypeORM + PostgreSQL, Redis, JWT auth
- `apps/web` — Next.js 14 App Router frontend (port 3000), TanStack Query, Zustand, React Hook Form + Zod
- `packages/shared-types` — TypeScript DTOs consumed by both apps via `@afrione/shared-types` (workspace dep)

`pnpm` is required (`pnpm@9.0.0`, Node ≥20). Tasks are orchestrated by Turborepo — run from the repo root.

## Commands

Root scripts (turbo fan-out):

```bash
pnpm dev              # both apps in watch mode
pnpm build            # build all (depends on ^build, so shared-types builds first)
pnpm test             # all jest suites
pnpm test:coverage
pnpm lint             # eslint --fix per package
pnpm type-check       # tsc --noEmit per package
pnpm format           # prettier write across repo
pnpm db:migrate       # runs only against `api`
pnpm db:seed
pnpm db:reset         # drop schema → migrate → seed
```

Single test (api): from `apps/api`, `pnpm jest path/to/file.spec.ts` or `-t "test name"`. Web uses the same pattern from `apps/web`. Jest configs are inline in each app's `package.json` — api enforces 80% line/function and 70% branch coverage.

DB migrations live in `apps/api/src/database/migrations/`. Generate a new one with `pnpm --filter api db:migrate:generate src/database/migrations/Name`. The DataSource (`apps/api/src/database/data-source.ts`) accepts either `DATABASE_URL` (Railway/Neon/Supabase) or discrete `DB_*` vars; `synchronize: false` always — schema changes go through migrations.

## Local infrastructure

```bash
docker compose up postgres redis -d   # required before db:migrate / dev
```

`docker-compose.yml` also defines `api` and `web` services with `develop.watch` sync if you want fully containerized dev. Env files are not committed — copy `apps/api/.env.example` → `apps/api/.env` and `apps/web/.env.example` → `apps/web/.env.local` before first run.

## Architecture

Backend is a **modular monolith**. `AppModule` (`apps/api/src/app.module.ts`) wires feature modules under `src/modules/`: `identity` (auth + users), `kyc`, `wallet`, `stablecoin`, `transfers`, `collections`, `funding`, `savings`, `notifications`, `admin`, `aml`, `redis`. Each module owns its controllers, services, and DTOs.

Cross-cutting concerns are registered globally in `AppModule`:

- `GlobalExceptionFilter` (APP_FILTER) — uniform error envelope
- `LoggingInterceptor` (APP_INTERCEPTOR)
- `IdempotencyInterceptor` (APP_INTERCEPTOR) — POSTs with an `Idempotency-Key` header are cached in Redis for 24h; replays return the cached body with `X-Idempotency-Replayed: true`. Any new POST endpoint that mutates money MUST be safe to receive an idempotency key.

`main.ts` sets a global `/api` prefix and URI-based versioning (`/api/v1/...`), enables a strict ValidationPipe (`whitelist`, `forbidNonWhitelisted`, `transform`), and mounts Swagger at `/api/docs` outside production.

### Money model (important)

The internal **double-entry ledger is the source of truth** for balances. Wallets aggregate `LedgerEvent` rows (debit/credit) — never mutate a balance column directly. `WalletService.appendLedgerEvent` is the canonical write path; transfers, funding, savings, etc. compose multiple ledger events inside a single flow (see `apps/api/src/modules/transfers/transfers.service.ts` for the pattern: debit sender total, credit recipient amount, record fee event). Amounts are stored as 8-decimal fixed-point strings (e.g. `'0.01000000'`) — convert with `parseFloat` only at the boundary and re-format with `.toFixed(8)`.

Currency codes are the literal strings `'AFRi'` and `'xGHS'`.

### Auth, KYC tiering, idempotency

- JWT (access + refresh) issued by `IdentityModule`. Access token in memory on the web client; refresh in `sessionStorage` (cleared on tab close) — `apps/web/src/lib/api/client.ts` is the only place that touches tokens and handles 401 → refresh → replay.
- `KycGuard` + `@KycTier(n)` decorator (`apps/api/src/common/`) gate endpoints by user tier. Apply to any controller method that requires verified identity; the guard reads `request.user.tier` populated by JWT strategy.
- For mutating POST endpoints, accept an `Idempotency-Key` header; the global interceptor handles caching.

### Frontend layout

`apps/web/src/app` uses Next.js route groups: `(auth)`, `(dashboard)`, `(admin)`. Each group has its own `layout.tsx`. API calls go through the shared `apiClient` axios instance — do not instantiate axios elsewhere or token refresh will be skipped. State: TanStack Query for server data, Zustand stores in `src/lib/stores/` for client-only state (e.g. `auth.store.ts`).

## Conventions

- Shared DTOs/types belong in `packages/shared-types/src/<domain>.ts` and re-exported from `index.ts`. If a type is used on both sides, add it there rather than duplicating.
- ESLint root config (`.eslintrc.js`) bans `console.log` (allows `warn`/`error`/`info`) and unused vars unless prefixed `_`. Husky `pre-commit` runs `lint-staged` (eslint --fix + prettier) — fix lint errors before committing rather than skipping the hook.
- TypeScript strict mode is on across the repo via `tsconfig.base.json` (includes `noUnusedLocals`, `noImplicitReturns`).

## Planning docs

Authoritative product/architecture context lives in `docs/`:

- `docs/architecture-afrione-2026-05-09.md` — full system design (read this before non-trivial backend changes)
- `docs/prd-afrione-2026-05-09.md`, `product-brief-...md`, `sprint-plan-...md`, `erd.md`

The `bmad/` directory and BMAD-prefixed skills are for the BMAD planning workflow that produced these docs; `docs/bmm-workflow-status.yaml` and `docs/sprint-status.yaml` track its state.

## Seed accounts (after `pnpm db:seed`)

`amara@example.com` (Tier 2), `kofi@example.com` (Tier 1), `akosua@sme.com` (approved business), `admin@afrione.com` — all `Password123!` except admin (`Admin@afrione!`). Mock integrations: Smile ID auto-approves unless ID ends in `FAIL`; mobile money succeeds unless phone ends in `000`; AFRi↔xGHS rate is 16.5 ± 0.2% drift.
