# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Afrione — frontend prototype of a regulated dual-stablecoin VASP for Africa (AFRi USD-pegged + xGHS Cedi-pegged). Originally a NestJS+Next.js app; the backend has been removed and the web UI now runs against an in-browser mock backend so the full feature set can be demoed without infrastructure.

- `apps/web` — Next.js 14 App Router frontend (port 3000), TanStack Query, Zustand, React Hook Form + Zod
- `bmad/`, `docs/` — BMAD planning workflow + product/architecture docs from the original design phase

`pnpm` is required (`pnpm@9.0.0`, Node ≥20). Tasks are orchestrated by Turborepo — run from the repo root.

## Commands

Root scripts (turbo fan-out):

```bash
pnpm dev              # Next.js dev server on :3000
pnpm build            # next build
pnpm test             # jest
pnpm lint             # next lint
pnpm type-check       # tsc --noEmit
pnpm format           # prettier write
```

Single test (web): from `apps/web`, `pnpm jest path/to/file.spec.ts` or `-t "test name"`. Jest config is inline in `apps/web/package.json`.

No infrastructure to start — no Postgres, no Redis, no Docker. Just `pnpm dev`.

## Mock backend

All API calls funnel through `apps/web/src/lib/api/client.ts`, which exposes the same `apiClient.{get,post,patch,delete}` shape the original axios instance had. Every request is dispatched to handlers in `apps/web/src/lib/api/mock.ts`, which owns:

- A typed in-memory store (`Db`) covering users, wallets, an event-sourced ledger, transactions, savings, notifications, payment links, KYC docs, AML alerts, and reserve snapshots.
- Persistence to `localStorage` under the key `afrione_mock_db_v1` — reloading the tab keeps your wallet state. To wipe, call `resetMockDb()` from the module or clear that localStorage key.
- Stub JWTs (base64-encoded `{userId, exp}`) returned by `/auth/login`. The access token lives in memory; refresh token in `sessionStorage` (so a hard refresh in the same tab silently re-authenticates via `/auth/refresh`, exactly like the original flow).
- ~38 routes covering auth, wallet/dashboard, transactions, funding (mock MoMo: phone ending in `000` declines), stablecoin rate/preview/convert, transfers (≥1000 AFRi or ≥16500 xGHS auto-flags AML), KYC/KYB submission (auto-approve), savings, notifications, payment-link collections, and admin (metrics/KYC queue/AML alerts/reserves).

Page components are unaware of the swap — they still call `apiClient.get('/wallets/dashboard')` etc. When adding a new endpoint:

1. Add the route in the dispatch table in `mock.ts` (`handleRequest`).
2. Add a handler that mutates `db()` and calls `persist()` after writes.
3. Throw `MockHttpError(status, message)` for failures — pages read `err.response?.data?.detail`.

The wallet **double-entry ledger** is preserved as the source of truth: balances are computed from `db().ledger` (`balanceOf(walletId)`), not stored on the wallet. Mutating money? Append a `LedgerEvent` plus a `Transaction` row, then `persist()`.

## Demo accounts (seeded on first load)

| Email | Password | Notes |
|-------|----------|-------|
| `amara@example.com` | `Password123!` | Tier 2 individual, wallets pre-funded |
| `kofi@example.com` | `Password123!` | Tier 1 individual |
| `yaa@example.com` | `Password123!` | Tier 0, phone unverified |
| `akosua@sme.com` | `Password123!` | Approved business — see `/collections` |
| `kwaben@sme.com` | `Password123!` | Pending business |
| `admin@afrione.com` | `Admin@afrione!` | Admin — `/admin/metrics`, `/admin/kyc`, `/admin/aml`, `/admin/reserves` |

After login the dashboard layout fetches `/users/me` to hydrate the Zustand auth store. Hard refresh works in the same tab (refresh token in sessionStorage); closing the tab logs you out.

## Frontend layout

`apps/web/src/app` uses Next.js route groups: `(auth)`, `(dashboard)`, `(admin)`, plus a public `pay/[shortCode]` page for payment-link recipients. Server data via TanStack Query, client-only state via Zustand stores in `src/lib/stores/`.

## Conventions

- ESLint root config (`.eslintrc.js`) bans `console.log` (allows `warn`/`error`/`info`) and unused vars unless prefixed `_`. Husky `pre-commit` runs `lint-staged` (eslint --fix + prettier).
- TypeScript strict mode is on across the repo via `tsconfig.base.json` (`noUnusedLocals`, `noImplicitReturns`).

## Planning docs

Background context (from the original full-stack design phase) lives in `docs/`:

- `docs/architecture-afrione-2026-05-09.md` — full system design (production architecture as originally planned)
- `docs/prd-afrione-2026-05-09.md`, `product-brief-...md`, `sprint-plan-...md`, `erd.md`

These describe what a real backend would look like; they are not what's running today. The prototype mock approximates that behavior just well enough to drive the UI.
