# Afrione (frontend prototype)

Regulated dual-stablecoin VASP concept for cross-border payments, digital savings, and business collections across Africa.

**Stablecoins:** AFRi (USD-pegged, gold-backed) · xGHS (Ghana Cedi-pegged 1:1)

This repo contains the Next.js web UI only — the original NestJS backend has been removed and replaced with an in-browser mock that persists to `localStorage`. Everything works offline; no Docker, no Postgres, no Redis.

---

## Quick start

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

Requires Node 20+ and pnpm 9+ (`corepack enable && corepack prepare pnpm@9.0.0 --activate`).

## Project structure

```
afrione/
├── apps/web/          # Next.js 14 frontend (port 3000)
│   └── src/lib/api/
│       ├── client.ts  # apiClient surface — same shape as the original axios client
│       └── mock.ts    # in-memory backend (~38 routes, persists to localStorage)
├── docs/              # original PRD, architecture, sprint plan (full-stack design)
├── bmad/              # BMAD workflow config
└── turbo.json
```

## Common commands

```bash
pnpm dev          # Next.js dev server
pnpm build        # next build
pnpm lint         # next lint
pnpm type-check   # tsc --noEmit
pnpm test         # jest
pnpm format       # prettier --write
```

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Individual (Tier 2) | amara@example.com | Password123! |
| Individual (Tier 1) | kofi@example.com | Password123! |
| Business (approved) | akosua@sme.com | Password123! |
| Admin | admin@afrione.com | Admin@afrione! |

To wipe demo data: clear `localStorage` for `localhost:3000` (the key is `afrione_mock_db_v1`).

## What the mock simulates

- **Auth** — register, login (any 6-digit MFA code passes), refresh, `/users/me`
- **Wallet** — AFRi + xGHS balances computed from an event-sourced ledger
- **Funding** — mock MoMo / bank on-ramp (phone ending `000` declines)
- **Transfers** — peer-to-peer with 0.5% fee; ≥1000 AFRi or ≥16500 xGHS auto-flags AML
- **Conversion** — AFRi ↔ xGHS at ~16.5 with small drift, 0.8% fee
- **KYC / KYB** — submission auto-approves and updates tier
- **Savings** — goals, deposit, withdraw
- **Collections** — payment links with public `/pay/<code>` page
- **Notifications** — generated for every meaningful action
- **Admin** — metrics, KYC review queue, AML alerts (clear / escalate / file SAR), reserve reconciliation history

## Original architecture

The PRD and architecture documents in `docs/` describe the production system as originally planned (NestJS modular monolith, PostgreSQL ledger, Redis idempotency, Celo settlement, Smile ID/Paystack/Fireblocks integrations). None of that is running here — it's reference material for what a real implementation would look like.
