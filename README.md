# Afrione

Regulated dual-stablecoin VASP platform for cross-border payments, digital savings, and business collections across Africa.

**Stablecoins:** AFRi (USD-pegged, gold-backed) · xGHS (Ghana Cedi-pegged 1:1)

---

## Quick Start

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [pnpm 9+](https://pnpm.io/installation) — `npm install -g pnpm`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone and install

```bash
git clone <repo-url> afrione
cd afrione
pnpm install
```

### 2. Set up environment files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 3. Start infrastructure (PostgreSQL + Redis)

```bash
docker compose up postgres redis -d
```

### 4. Run database migrations and seed

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Start development servers

```bash
pnpm dev
```

- **Web app:** http://localhost:3000
- **API:** http://localhost:3001
- **Swagger docs:** http://localhost:3001/api/docs

---

## Project Structure

```
afrione/
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   └── web/          # Next.js frontend (port 3000)
├── packages/
│   └── shared-types/ # Shared TypeScript types (DTOs)
├── docs/             # BMAD planning documents
├── docker-compose.yml
├── turbo.json        # Turborepo task config
└── pnpm-workspace.yaml
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| Backend | NestJS 10 (TypeScript, TypeORM) |
| Database | PostgreSQL 16 + Redis 7 |
| Monorepo | Turborepo + pnpm workspaces |

## Common Commands

```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm test             # Run all tests
pnpm test:coverage    # Run tests with coverage report
pnpm lint             # Lint all packages
pnpm format           # Format all files with Prettier
pnpm type-check       # TypeScript check all packages
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with demo data
pnpm db:reset         # Drop, migrate, and re-seed database
```

## Seed Accounts (after `pnpm db:seed`)

| Role | Email | Password | Tier |
|------|-------|----------|------|
| Individual (Tier 2) | amara@example.com | Password123! | 2 |
| Individual (Tier 1) | kofi@example.com | Password123! | 1 |
| Business (approved) | akosua@sme.com | Password123! | 2 |
| Admin | admin@afrione.com | Admin@afrione! | — |

## Mock Integration Behaviour

| Integration | Mock Behaviour |
|-------------|---------------|
| Smile ID KYC | 3s delay → auto-approve (reject if ID ends with `FAIL`) |
| Mobile Money | 3s delay → success (fail if phone ends with `000`) |
| Exchange Rate | 1 AFRi = 16.5 xGHS ± 0.2% drift, refreshes every 30s |
| Gold Custodian | Static: 52.3 oz gold @ $2,340.50/oz |
| Email/SMS | Logged to console in development |

## Architecture

See [`docs/architecture-afrione-2026-05-09.md`](docs/architecture-afrione-2026-05-09.md) for the full system design.

## Planning Documents

| Document | Path |
|----------|------|
| Product Brief | `docs/product-brief-afrione-2026-05-09.md` |
| PRD | `docs/prd-afrione-2026-05-09.md` |
| Architecture | `docs/architecture-afrione-2026-05-09.md` |
| Sprint Plan | `docs/sprint-plan-afrione-2026-05-09.md` |
