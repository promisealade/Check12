# Sprint Plan: Afrione (Prototype)

**Date:** 2026-05-09
**Scrum Master:** PromiseAlade
**Project Level:** 2 (Medium)
**Scope:** Full-stack prototype with mock backend integrations
**Total Stories:** 17
**Total Points:** 71
**Planned Sprints:** 3 (6 weeks)
**Team:** 2 developers
**Sprint Capacity:** 40 points (target 32 committed)
**Target Completion:** End of Week 6

---

## Executive Summary

This sprint plan delivers a fully functional Afrione prototype across three 2-week sprints. Sprint 1 establishes the foundation — project infrastructure, authentication, tiered KYC simulation, and the core event-sourced wallet. Sprint 2 delivers the full stablecoin operations layer (conversion, transfers, merchant collections). Sprint 3 completes the admin dashboard, reserve reconciliation, third-party API demo, and polishes the prototype to demo-ready state.

All external integrations (Smile ID, Paystack, Celo, Fireblocks, ComplyAdvantage) are mocked with realistic simulated behaviour. Core architectural patterns (event-sourced ledger, JWT auth, idempotency keys, circuit breaker interfaces) are implemented correctly — making the prototype a genuine foundation for production development.

**Key Metrics:**
- Total Stories: 17
- Total Points: 71
- Sprints: 3
- Team Capacity: 40 points/sprint (32 committed)
- Target Completion: Week 6 (2026-06-20)

---

## Story Inventory

---

### STORY-INF-001: Project Setup

**Epic:** Infrastructure
**Priority:** Must Have
**Points:** 5

**User Story:**
As a developer,
I want a fully configured monorepo with Next.js frontend and NestJS backend running in Docker Compose,
So that the team has a consistent local development environment from day one.

**Acceptance Criteria:**
- [ ] Monorepo structure: `apps/web` (Next.js 14), `apps/api` (NestJS 10), `packages/shared-types`
- [ ] `docker-compose.yml` spins up web, api, PostgreSQL, and Redis with a single command
- [ ] TypeScript configured end-to-end with shared `tsconfig.base.json`
- [ ] ESLint + Prettier configured with pre-commit hooks (Husky)
- [ ] Environment variable management via `.env.example` files for each app
- [ ] README with local setup instructions (< 5 commands to running state)
- [ ] GitHub repository initialized with `main` branch protection

**Technical Notes:**
- Use Turborepo for monorepo task orchestration
- Next.js App Router with Tailwind CSS
- NestJS with TypeORM configured for PostgreSQL
- Shared types package for DTOs shared between web and api
- `pnpm` as package manager for workspace support

**Dependencies:** None — first story

---

### STORY-INF-002: Database Schema & Seed Data

**Epic:** Infrastructure
**Priority:** Must Have
**Points:** 3

**User Story:**
As a developer,
I want the full database schema created with migrations and realistic seed data,
So that all subsequent stories have a consistent data foundation to build on.

**Acceptance Criteria:**
- [ ] TypeORM migrations created for all entities: User, KycDocument, Wallet, LedgerEvent, Transaction, PaymentLink, SavingsAccount, AmlAlert, StablecoinReserve, ApiKey, WebhookEndpoint
- [ ] Seed script populates: 3 individual users (Tier 0, 1, 2), 2 business users (pending + approved KYB), 1 admin user, sample wallet balances, 10 sample transactions
- [ ] `LedgerEvent` table has UNIQUE constraint on `idempotency_key`
- [ ] All financial amounts stored as `DECIMAL(18, 8)`
- [ ] `npm run db:migrate` and `npm run db:seed` scripts working
- [ ] Entity relationship diagram in `docs/erd.md`

**Technical Notes:**
- LedgerEvent is append-only — add DB trigger to prevent UPDATE/DELETE
- Use `uuid_generate_v4()` for all primary keys
- Seed data should reflect realistic AFRi/xGHS amounts (e.g. AFRi 150.00, xGHS 2500.00)
- Include indexes: `(wallet_id, created_at)` on LedgerEvent, `(user_id, status)` on KycDocument

**Dependencies:** STORY-INF-001

---

### STORY-S001: User Registration & Login

**Epic:** EPIC-001 — Identity & Compliance
**Priority:** Must Have
**Points:** 5

**User Story:**
As an individual or business user,
I want to register with my phone number and email, then log in securely with JWT and MFA,
So that I can access the Afrione platform with my account protected.

**Acceptance Criteria:**
- [ ] Registration form collects: phone, email, password, account type (individual/business)
- [ ] Phone OTP verification step (mock SMS — log OTP to console in dev)
- [ ] Password hashed with bcrypt (12 rounds)
- [ ] JWT issued on successful login: 15-min access token + 7-day refresh token
- [ ] Mock MFA: TOTP entry screen (accept any 6-digit code in prototype for demo)
- [ ] Refresh token endpoint extends session
- [ ] Logout blacklists refresh token in Redis
- [ ] New device alert shown in UI (mock — always trigger on first login in prototype)
- [ ] Form validation with clear error messages

**Technical Notes:**
- NestJS Identity module: `AuthController`, `AuthService`, `UserRepository`
- `@nestjs/passport` with `passport-jwt` strategy
- `@nestjs/jwt` for token signing (HS256 for prototype, RS256 in production)
- Redis store for refresh token tracking (key: `refresh:{userId}`, value: token hash)
- Next.js: store access token in memory (zustand), refresh token in httpOnly cookie

**Dependencies:** STORY-INF-001, STORY-INF-002

---

### STORY-S002: KYC Tier Simulation

**Epic:** EPIC-001 — Identity & Compliance
**Priority:** Must Have
**Points:** 5

**User Story:**
As an individual user,
I want to progress through KYC tiers by uploading my ID and completing a liveness check,
So that I can unlock higher transaction limits on the platform.

**Acceptance Criteria:**
- [ ] KYC status banner visible on dashboard showing current tier (0, 1, 2) and limits
- [ ] Tier 0 → Tier 1: Upload ID document (Ghana Card or passport); mock Smile ID returns "approved" after 3-second delay
- [ ] Tier 1 → Tier 2: Liveness check UI (webcam capture or photo upload); mock approval after 5-second delay
- [ ] Admin can see KYC submissions in review queue and manually approve/reject (used in STORY-S013)
- [ ] Tier limits enforced: Tier 0 = no transactions, Tier 1 = $200/day, Tier 2 = unlimited
- [ ] Email notification shown (mock — toast notification) on KYC status change
- [ ] KYC status persists across sessions

**Technical Notes:**
- `SmileIdAdapter` returns mock response with configurable delay (use `setTimeout` in dev)
- Store tier in `User.tier` field; update on KYC approval
- `@KycGuard(minTier: number)` NestJS decorator applied to all transaction endpoints
- Daily limit tracking: sum LedgerEvents for user wallet within current UTC day
- Upload to S3 (or local `uploads/` folder in prototype) with multer

**Dependencies:** STORY-S001

---

### STORY-S003: Business Registration & KYB

**Epic:** EPIC-001 — Identity & Compliance
**Priority:** Must Have
**Points:** 3

**User Story:**
As a business owner,
I want to register my business with company documents and director details,
So that my SME can access merchant collections and cross-border payment features.

**Acceptance Criteria:**
- [ ] Business registration form: company name, registration number, director name, director ID, business type
- [ ] Document upload: business registration certificate (mock storage)
- [ ] KYB submission enters pending state; admin can approve in review queue
- [ ] Mock auto-approval after 10-second delay for prototype demo purposes
- [ ] Business accounts get separate wallet set and collections dashboard access
- [ ] KYB status badge shown on business dashboard

**Technical Notes:**
- Extend `User` entity with `businessName`, `registrationNumber`, `kybStatus` fields
- KYB review queue shares admin UI with KYC queue (STORY-S013)
- Business account type unlocks Collections module routes

**Dependencies:** STORY-S001, STORY-INF-002

---

### STORY-S004: Wallet Dashboard

**Epic:** EPIC-002 — Wallet & Stablecoin Operations
**Priority:** Must Have
**Points:** 5

**User Story:**
As a verified user,
I want to see my AFRi and xGHS wallet balances on a clear dashboard with recent activity,
So that I have an immediate overview of my financial position.

**Acceptance Criteria:**
- [ ] Dashboard shows AFRi balance with USD equivalent and xGHS balance with GHS equivalent
- [ ] Balances computed from `LedgerEvent` sum (not stored field) — verified by test
- [ ] Balances cached in Redis with 5-second TTL; cache invalidated on any LedgerEvent write
- [ ] Recent transactions list (last 5) with type icon, amount, date, and status
- [ ] Quick-action buttons: Fund, Convert, Send, Save
- [ ] Savings account balance shown separately if exists
- [ ] Mobile-responsive layout (375px, 768px, 1280px breakpoints)
- [ ] Loading skeleton shown during data fetch

**Technical Notes:**
- `WalletService.getBalance(walletId)`: check Redis → if miss, `SELECT SUM(amount) FROM ledger_events WHERE wallet_id = $1 AND type = 'credit' MINUS debits`
- Balance formatted with `Intl.NumberFormat` (AFRi as USD format, xGHS as GHS format)
- Use React Query for data fetching with 30-second stale time
- Wallet created automatically on KYC Tier 1 approval

**Dependencies:** STORY-S001, STORY-S002, STORY-INF-002

---

### STORY-S005: Mock Fiat On-ramp

**Epic:** EPIC-002 — Wallet & Stablecoin Operations
**Priority:** Must Have
**Points:** 5

**User Story:**
As a verified user,
I want to fund my wallet by simulating a mobile money transfer from MTN, Vodafone, or AirtelTigo,
So that I can load GHS and receive xGHS in my wallet.

**Acceptance Criteria:**
- [ ] Funding flow: select provider (MTN/Vodafone/AirtelTigo) → enter amount → enter mock phone → confirm → processing screen (3s delay) → success
- [ ] Preview shows: GHS amount entered, conversion rate (1 GHS = 1 xGHS), fee (0.5% mock), xGHS to receive
- [ ] On success: LedgerEvent created (credit xGHS), wallet balance updates, success toast shown
- [ ] Idempotency key sent with request; duplicate clicks do not double-credit
- [ ] Mock failure mode: entering phone number ending in `000` triggers a failed payment (for demo)
- [ ] Funding history visible in transaction list
- [ ] Tier 1 daily limit enforced ($200 equivalent)

**Technical Notes:**
- `MobileMoneyAdapter` mock: `async fundWallet(params)` → `await sleep(3000)` → return success/fail based on phone
- `FundingController` → `FundingService` → `MobileMoneyAdapter` → `WalletService.credit()`
- Idempotency interceptor: check Redis for key → if exists return cached response → else process and cache
- Transaction record created with `type: 'funding'`, `status: 'completed'`

**Dependencies:** STORY-S004

---

### STORY-S006: Stablecoin Conversion

**Epic:** EPIC-002 — Wallet & Stablecoin Operations
**Priority:** Must Have
**Points:** 5

**User Story:**
As a verified user,
I want to convert between AFRi and xGHS at the current rate with full fee transparency,
So that I can switch between a stable dollar-denominated asset and local currency as needed.

**Acceptance Criteria:**
- [ ] Conversion UI: select from-currency → enter amount → see rate, fee (spread), and to-amount before confirming
- [ ] Live rate displayed: mock oracle returns AFRi/xGHS rate (e.g. 1 AFRi = 16.5 xGHS based on mock GHS/USD 16.5)
- [ ] Rate refreshes every 30 seconds (cached in Redis)
- [ ] On confirm: debit source wallet, credit destination wallet, both via atomic DB transaction
- [ ] Idempotency key prevents double conversion on retry
- [ ] Circuit breaker simulation: toggle in admin to simulate "oracle unavailable" — conversion paused with user message
- [ ] Conversion recorded in transaction history with rate and fee breakdown

**Technical Notes:**
- `StablecoinService.getRate()`: check Redis (30s TTL) → if miss, call `OracleAdapter.getRate()` (mock returns hardcoded rate ± random ±0.2% drift)
- Conversion uses DB transaction: `BEGIN` → debit LedgerEvent → credit LedgerEvent → `COMMIT`
- Fee = 0.8% spread on from-amount; displayed as "Conversion fee: X AFRi"
- `OracleAdapter` mock: rate = `16.5 + (Math.random() - 0.5) * 0.4` updated every 30s

**Dependencies:** STORY-S004, STORY-S005

---

### STORY-S007: Digital Savings Accounts

**Epic:** EPIC-002 — Wallet & Stablecoin Operations
**Priority:** Should Have
**Points:** 3

**User Story:**
As a verified user,
I want to create an AFRi savings account with a goal label,
So that I can set aside funds protected from cedi devaluation.

**Acceptance Criteria:**
- [ ] Create savings account: name/label, optional target amount (AFRi)
- [ ] Deposit AFRi from main wallet to savings (Idempotency-Key required)
- [ ] Withdraw AFRi from savings back to main wallet at any time
- [ ] Savings balance displayed separately from main wallet on dashboard
- [ ] Progress bar shown if target amount set
- [ ] Savings transactions appear in history with type "savings_deposit" / "savings_withdrawal"
- [ ] Multiple savings accounts supported

**Technical Notes:**
- `SavingsAccount` entity linked to user's AFRi wallet
- Deposit/withdraw are LedgerEvents on the main wallet (debit/credit) with reference to savings account
- Savings balance = sum of savings-tagged LedgerEvents

**Dependencies:** STORY-S004, STORY-S006

---

### STORY-S008: Transaction History & Statement Export

**Epic:** EPIC-002 — Wallet & Stablecoin Operations
**Priority:** Must Have
**Points:** 5

**User Story:**
As a user,
I want to view, filter, and export my complete transaction history,
So that I can track my activity and reconcile my accounts.

**Acceptance Criteria:**
- [ ] Paginated transaction list (20 per page, cursor-based pagination)
- [ ] Filter by: type (funding, conversion, transfer, collection, withdrawal, savings), date range, currency
- [ ] Each row shows: date/time, type icon, description, amount, currency, fee, status badge
- [ ] Transaction detail view on click: full breakdown including counterparty, reference ID, exchange rate (if conversion)
- [ ] Export to CSV: all filtered transactions in selected date range
- [ ] Export to PDF: formatted statement with logo, user details, date range, transaction table, closing balance
- [ ] Business accounts see collections separately in a "Collections" tab

**Technical Notes:**
- Cursor-based pagination: `WHERE created_at < :cursor ORDER BY created_at DESC LIMIT 21` (21 to detect next page)
- PDF generation: `pdfkit` or `@react-pdf/renderer` for formatted statements
- CSV: `fast-csv` or manual string construction
- Date range filter: validate max range of 12 months to prevent excessive queries

**Dependencies:** STORY-S004, STORY-S005, STORY-S006

---

### STORY-S009: Cross-border Transfer

**Epic:** EPIC-003 — Transfers & Payments
**Priority:** Must Have
**Points:** 5

**User Story:**
As a verified user,
I want to send AFRi or xGHS to another Afrione user by phone number or username,
So that I can remit money across African borders quickly and cheaply.

**Acceptance Criteria:**
- [ ] Recipient lookup: search by phone number or username — show name and avatar on match
- [ ] Transfer preview: amount, currency, fee (0.5% mock), recipient name, estimated arrival ("Instant")
- [ ] Idempotency-Key required; duplicate submission returns cached result with "Already processed" message
- [ ] On confirm: debit sender wallet → credit recipient wallet (atomic DB transaction) → both LedgerEvents created
- [ ] KYC tier check: Tier 1 enforces $200/day limit
- [ ] Failed transfer (mock: recipient phone ending `999`) → full reversal within 500ms, error shown
- [ ] Both sender and recipient see transaction in history
- [ ] In-app notification shown to recipient (mock — toast on next page load)
- [ ] FATF Travel Rule UI: for amounts > $100 mock equivalent, show "Regulatory disclosure" field (free text, stored in transaction metadata)

**Technical Notes:**
- `TransferService.send()`: validate → check idempotency → begin DB transaction → debit → credit → commit → emit notification event to SQS (mock: add to in-memory notification queue)
- Reversal: if credit fails, debit event is offset by a credit event (never deleted) — event log stays clean
- Recipient lookup: `UserRepository.findByPhoneOrUsername(query)` — debounced search, 300ms

**Dependencies:** STORY-S004, STORY-S005, STORY-S006

---

### STORY-S010: Merchant Payment Link & QR Code

**Epic:** EPIC-003 — Transfers & Payments
**Priority:** Must Have
**Points:** 5

**User Story:**
As a verified merchant,
I want to generate a payment link and QR code for a specific amount,
So that my customers can pay me in xGHS or AFRi online or in-store.

**Acceptance Criteria:**
- [ ] Merchant creates payment link: amount, currency (AFRi or xGHS), description, expiry (1h / 24h / 7d)
- [ ] System generates unique short URL (e.g. `pay.afrione.com/p/abc123`) and QR code
- [ ] QR code downloadable as PNG
- [ ] Payment link shareable via copy-to-clipboard
- [ ] Payment page (no login required for guest): shows merchant name, amount, currency, description
- [ ] Guest payment: enter phone number → mock MoMo charge → 3s delay → success
- [ ] On payment: funds credited to merchant wallet; merchant sees collection in dashboard
- [ ] Payment link status: active → paid / expired
- [ ] Merchant can view all payment links and their status in Collections tab

**Technical Notes:**
- Short URL: generate 8-char random alphanumeric ID, store in `PaymentLink` table
- QR code: `qrcode` npm package — generate as PNG buffer, return as base64 data URL
- Guest payment flow uses mock `MobileMoneyAdapter` (same as on-ramp)
- Webhook delivery: if merchant has registered webhook, emit to `webhook-delivery-queue` (mock: HTTP POST with 2s delay, log result)

**Dependencies:** STORY-S003, STORY-S004, STORY-S005

---

### STORY-S011: Guest Payment Flow

**Epic:** EPIC-003 — Transfers & Payments
**Priority:** Should Have
**Points:** 3

**User Story:**
As a customer without a Afrione account,
I want to pay a merchant via a payment link using my mobile money,
So that I can pay without needing to sign up for the platform.

**Acceptance Criteria:**
- [ ] Payment link page accessible without login
- [ ] Guest enters: mobile number and mobile money provider (MTN/Vodafone/AirtelTigo)
- [ ] Processing screen with 3-second mock delay
- [ ] Success screen: payment confirmation, amount paid, merchant name, reference number
- [ ] Failure screen: clear error message, retry option
- [ ] Merchant wallet credited on success (LedgerEvent created)
- [ ] Payment link marked as "paid" and no longer accessible

**Technical Notes:**
- Public route: `/pay/:linkId` — no JWT required
- Rate limited: 5 attempts per IP per link to prevent abuse (Redis counter)
- Guest payment creates a `Transaction` record with `payer_reference` = phone number (masked in display)

**Dependencies:** STORY-S010

---

### STORY-S012: In-App Notifications

**Epic:** EPIC-003 — Transfers & Payments
**Priority:** Should Have
**Points:** 3

**User Story:**
As a user,
I want to receive in-app notifications for transactions, KYC updates, and security events,
So that I am always aware of activity on my account.

**Acceptance Criteria:**
- [ ] Notification bell icon in header with unread count badge
- [ ] Notification types: transfer received, payment collected, KYC approved/rejected, login from new device, conversion completed
- [ ] Clicking notification marks it as read and navigates to relevant page
- [ ] Notification list shows: icon, message, timestamp, read/unread state
- [ ] Toast notification appears for real-time events (polling every 10s in prototype; WebSocket in production)
- [ ] Mock email notification: log to console with formatted email template
- [ ] Mock SMS notification: log to console with message text

**Technical Notes:**
- `Notification` entity: `(id, user_id, type, message, read, created_at, metadata JSONB)`
- Polling: Next.js `useEffect` with `setInterval(10000)` calling `GET /api/v1/notifications?unread=true`
- Notification worker: reads from in-memory queue (prototype) and inserts `Notification` records
- Mark all read: `PATCH /api/v1/notifications/read-all`

**Dependencies:** STORY-S001, STORY-S009, STORY-S010

---

### STORY-S013: Admin Dashboard

**Epic:** EPIC-004 — Platform & Integrations
**Priority:** Must Have
**Points:** 5

**User Story:**
As an admin or compliance officer,
I want a dashboard to review KYC/KYB submissions, view platform metrics, and manage AML alerts,
So that I can operate Afrione compliantly and monitor platform health.

**Acceptance Criteria:**
- [ ] Admin login (separate route `/admin/login`) with hardcoded admin credentials in dev
- [ ] KYC review queue: list of pending submissions with user details, uploaded document preview, approve/reject/request-more-info actions
- [ ] KYB review queue: same as KYC but for business submissions
- [ ] Platform metrics dashboard: total registered users, MAU (mock), total transaction volume (calculated from LedgerEvents), total collections
- [ ] AML alerts queue: list of mock-flagged transactions with details; mark as cleared or escalated
- [ ] Admin actions logged to `AuditLog` table with timestamp and actor
- [ ] Role guard: only `admin` and `compliance_officer` roles can access admin routes

**Technical Notes:**
- Admin routes: `/admin/*` — separate Next.js route group with layout
- Mock metrics: MAU = seed data count × random factor; volume = SUM of all LedgerEvents
- AML alerts: seed 3 mock flagged transactions (amounts > $500) pre-populated
- Audit log: `(id, actor_id, action, target_id, target_type, metadata JSONB, created_at)`

**Dependencies:** STORY-S001, STORY-S002, STORY-S003, STORY-INF-002

---

### STORY-S014: Reserve Reconciliation Display

**Epic:** EPIC-004 — Platform & Integrations
**Priority:** Should Have
**Points:** 3

**User Story:**
As a treasury team member,
I want to see the daily AFRi gold reserve reconciliation report,
So that I can verify that circulating AFRi is fully backed by physical gold reserves.

**Acceptance Criteria:**
- [ ] Admin dashboard "Reserves" tab showing: AFRi circulating supply, gold reserve value (USD), backing ratio %, last reconciliation timestamp
- [ ] Mock gold custodian data: hardcoded JSON file simulating daily feed (gold oz, gold price USD)
- [ ] Reconciliation worker: can be triggered manually via admin button (runs instantly in prototype)
- [ ] Result written to `StablecoinReserve` table and displayed
- [ ] Discrepancy > 0.01%: shown with red warning badge (simulate by reducing mock gold value by 0.1%)
- [ ] Historical reconciliation reports: table of last 7 days
- [ ] "Within tolerance" shown in green when backing ratio ≥ 100%

**Technical Notes:**
- Mock custodian data: `integrations/gold-custodian/mock-feed.json` with `{ gold_oz: 52.3, gold_price_usd: 2340.50 }`
- Reconciliation: `circulating_supply` = SUM of AFRi credit LedgerEvents - debit LedgerEvents
- Backing ratio = `(gold_oz × gold_price_usd) / (circulating_afri × afri_usd_rate)`
- Manual trigger: `POST /api/v1/admin/reserves/reconcile` (admin-only)

**Dependencies:** STORY-S013, STORY-INF-002

---

### STORY-S015: Third-party API Demo

**Epic:** EPIC-004 — Platform & Integrations
**Priority:** Could Have
**Points:** 3

**User Story:**
As a business developer,
I want to generate an API key and register a webhook endpoint,
So that I can integrate Afrione payment collections into my own application.

**Acceptance Criteria:**
- [ ] Business dashboard "API" tab: generate API key (shown once, then masked)
- [ ] API key stored as HMAC-SHA256 hash in DB; full key returned only at creation
- [ ] Revoke API key action (soft delete)
- [ ] Register webhook URL: enter endpoint URL, select events (payment.completed, payment.failed)
- [ ] Test webhook button: sends mock `payment.completed` event to registered URL
- [ ] Swagger UI accessible at `/api/docs` (NestJS auto-generated)
- [ ] Demo page showing example API request (curl command) and expected response

**Technical Notes:**
- API key generation: `crypto.randomBytes(32).toString('hex')` — prefix with `ck_live_` for visual clarity
- Key hash: `crypto.createHmac('sha256', process.env.API_KEY_SECRET).update(rawKey).digest('hex')`
- Webhook test: HTTP POST to registered URL with mock payload, log status code response
- Swagger: `@nestjs/swagger` with `DocumentBuilder` — auto-generated from decorators

**Dependencies:** STORY-S003, STORY-S010

---

## Sprint Allocation

---

### Sprint 1 (Weeks 1–2) — 31 / 40 points

**Goal:** Deliver a working foundation with authentication, tiered KYC, business registration, and a live event-sourced wallet that users can fund.

**Stories:**

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-INF-001 | Project setup (monorepo, Docker Compose, shared types) | 5 | Must |
| STORY-INF-002 | DB schema, migrations & seed data | 3 | Must |
| STORY-S001 | User registration & login (JWT, bcrypt, mock MFA) | 5 | Must |
| STORY-S002 | KYC tier simulation | 5 | Must |
| STORY-S003 | Business registration & KYB (mock) | 3 | Must |
| STORY-S004 | Wallet dashboard (event-sourced ledger) | 5 | Must |
| STORY-S005 | Mock fiat on-ramp (simulate MoMo funding) | 5 | Must |

**Total:** 31 points / 40 capacity (78% utilization — 9 points buffer for unknowns)

**Suggested Split (2 devs):**
- Dev A: INF-001, INF-002, S-001 (infrastructure + auth foundation)
- Dev B: S-002, S-003, S-004, S-005 (KYC flows + wallet — after INF-001 complete)

**Sprint 1 Risks:**
- Project setup (INF-001) is the critical path — both devs blocked until it's done; target Day 1–2
- Wallet ledger event sourcing is a new pattern — allocate extra review time for S-004

**Sprint 1 Dependencies:**
- GitHub repo access for both developers
- PostgreSQL and Redis available locally via Docker

---

### Sprint 2 (Weeks 3–4) — 26 / 40 points

**Goal:** Deliver the full stablecoin operations layer — conversion, cross-border transfers, merchant payment collections, and complete transaction history with export.

**Stories:**

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-S006 | Stablecoin conversion (mock oracle) | 5 | Must |
| STORY-S007 | Digital savings accounts (AFRi) | 3 | Should |
| STORY-S008 | Transaction history & statement export | 5 | Must |
| STORY-S009 | Cross-border transfer (mock settlement, idempotency) | 5 | Must |
| STORY-S010 | Merchant payment link & QR code | 5 | Must |
| STORY-S011 | Guest payment flow (mock MoMo) | 3 | Should |

**Total:** 26 points / 40 capacity (65% utilization — 14 points buffer to absorb Sprint 1 overflow and complexity)

**Suggested Split (2 devs):**
- Dev A: S-006, S-008, S-009 (conversion + transfer flows)
- Dev B: S-007, S-010, S-011 (savings + merchant collections)

**Sprint 2 Risks:**
- Idempotency implementation in S-009 needs careful testing — budget extra day
- PDF statement generation (S-008) can be deferred to Sprint 3 if Sprint 2 is tight

**Sprint 2 Dependencies:**
- Sprint 1 fully complete (wallet and auth must be stable)

---

### Sprint 3 (Weeks 5–6) — 14 / 40 points + polish

**Goal:** Complete admin operations, reserve reconciliation, API demo, in-app notifications — then polish the prototype to demo-ready state with end-to-end flow testing.

**Stories:**

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-S012 | In-app notifications (polling + mock email/SMS) | 3 | Should |
| STORY-S013 | Admin dashboard (KYC queue, metrics, AML alerts) | 5 | Must |
| STORY-S014 | Reserve reconciliation display (mock gold data) | 3 | Should |
| STORY-S015 | Third-party API demo (API keys + webhook demo) | 3 | Could |

**Committed:** 14 points / 40 capacity

**Remaining 26 points allocated to:**
- Bug fixes and edge cases from Sprints 1–2
- UI polish (loading states, error states, empty states throughout)
- End-to-end demo flow preparation (scripted demo walkthroughs)
- Cross-browser testing (Chrome, Safari, Firefox)
- Mobile responsiveness audit
- Performance baseline (ensure wallet balance loads < 500ms)
- Seed data refinement for demo

**Suggested Split (2 devs):**
- Dev A: S-012, S-013 + E2E flow testing
- Dev B: S-014, S-015 + UI polish and bug fixes

**Sprint 3 Dependencies:**
- Sprint 2 complete
- Demo environment provisioned (if needed beyond localhost)

---

## Epic Traceability

| Epic ID | Epic Name | Stories | Total Points | Sprints |
|---------|-----------|---------|--------------|---------|
| Infra | Infrastructure | INF-001, INF-002 | 8 | Sprint 1 |
| EPIC-001 | Identity & Compliance | S-001, S-002, S-003 | 13 | Sprint 1 |
| EPIC-002 | Wallet & Stablecoin Ops | S-004, S-005, S-006, S-007, S-008 | 23 | Sprint 1–2 |
| EPIC-003 | Transfers & Payments | S-009, S-010, S-011, S-012 | 16 | Sprint 2–3 |
| EPIC-004 | Platform & Integrations | S-013, S-014, S-015 | 11 | Sprint 3 |

---

## Functional Requirements Coverage

| FR ID | FR Name | Story | Sprint |
|-------|---------|-------|--------|
| FR-001 | Individual KYC | S-001, S-002 | 1 |
| FR-002 | Business KYB | S-003 | 1 |
| FR-003 | Multi-currency Wallet | S-004 | 1 |
| FR-004 | Local Fiat On-ramp | S-005 | 1 |
| FR-005 | Stablecoin Conversion | S-006 | 2 |
| FR-006 | Cross-border Transfer | S-009 | 2 |
| FR-007 | Digital Savings | S-007 | 2 |
| FR-008 | Business Collections | S-010, S-011 | 2 |
| FR-009 | Fiat Off-ramp | S-005 (mock withdrawal path) | 1 |
| FR-010 | Transaction History | S-008 | 2 |
| FR-011 | Notifications | S-012 | 3 |
| FR-012 | Third-party API | S-015 | 3 |
| FR-013 | AML Monitoring | S-013 (mock alerts) | 3 |
| FR-014 | Admin Dashboard | S-013, S-014 | 3 |

**All 14 FRs covered. ✓**

---

## Risks and Mitigation

**High:**
- **Project setup delay (INF-001):** Both developers blocked if setup takes > 2 days. Mitigation: Designate Dev A as lead on setup; Dev B starts on UI mockups and DB schema design in parallel.
- **Event sourcing unfamiliarity:** If neither developer has implemented event-sourced ledgers before, S-004 may take longer. Mitigation: Timebox to 1 day; if stuck, simplify to balance field for prototype and add event sourcing as a Sprint 3 polish item.

**Medium:**
- **Sprint 1 overflow into Sprint 2:** 7 stories in Sprint 1 is ambitious. Mitigation: Sprint 2 has 14-point buffer specifically to absorb overflow.
- **PDF generation complexity (S-008):** PDF libraries can be fiddly. Mitigation: Start with CSV export; add PDF as enhancement if time allows.
- **Cross-browser issues (Sprint 3):** Safari and Firefox may surface layout bugs. Mitigation: Test on all browsers from Sprint 1 rather than leaving to Sprint 3.

**Low:**
- **Scope creep:** Stakeholders may request additional prototype features. Mitigation: Direct all requests through sprint planning; nothing added mid-sprint.

---

## Dependencies

**External:**
- GitHub repository set up before Day 1 Sprint 1
- Docker Desktop installed on both developers' machines
- Node.js 20 LTS installed locally
- AWS account (if deploying prototype to cloud — optional for localhost-only demo)

**Internal:**
- INF-001 must complete before any other story begins
- INF-002 must complete before S-001, S-002, S-003
- S-001 must complete before S-002, S-003, S-004
- S-004 must complete before S-005, S-006, S-007, S-008, S-009
- S-003 must complete before S-010
- S-010 must complete before S-011

---

## Definition of Done

For a story to be considered complete:

- [ ] Feature implemented and committed to `main` (via PR)
- [ ] Unit tests written and passing (≥ 80% coverage for service layer)
- [ ] Integration tests passing for API endpoints
- [ ] Code reviewed and approved by the other developer
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] ESLint passes with no warnings
- [ ] Acceptance criteria manually verified (developer self-tests)
- [ ] Mobile layout verified at 375px viewport
- [ ] Story marked completed in sprint status

---

## Mock Integration Reference

| Real Integration | Prototype Mock | Behaviour |
|-----------------|----------------|-----------|
| Smile ID KYC | `SmileIdAdapter` mock | 3–5s delay → always approve (except blocked test IDs) |
| Paystack/MoMo | `MobileMoneyAdapter` mock | 3s delay → success (fail if phone ends in `000`) |
| Celo Network | Internal ledger only | No blockchain calls; batch settlement skipped |
| Fireblocks MPC | No-op adapter | Treasury operations logged to console |
| ComplyAdvantage | `AmlAdapter` mock | Flag transactions > $500 equivalent |
| Chainlink Oracle | `OracleAdapter` mock | 1 AFRi = 16.5 xGHS ± 0.2% random drift, 30s refresh |
| Gold Custodian | `mock-feed.json` | Static file: 52.3 oz gold @ $2,340.50/oz |
| SendGrid Email | Console logger | Log formatted email template to console |
| Firebase Push | Console logger | Log notification payload to console |
| AWS SNS SMS | Console logger | Log SMS text to console |

---

## Sprint Cadence

- **Sprint length:** 2 weeks
- **Sprint planning:** Monday, Week 1 of each sprint
- **Daily standup:** 15 minutes — what did I do, what am I doing, any blockers
- **Sprint review:** Friday, Week 2 — demo to stakeholders
- **Sprint retrospective:** Friday, Week 2 (after review) — what worked, what didn't

**Sprint dates:**
- Sprint 1: 2026-05-12 → 2026-05-22
- Sprint 2: 2026-05-25 → 2026-06-05
- Sprint 3: 2026-06-08 → 2026-06-19

---

## Next Steps

**Immediate:** Begin Sprint 1

1. Run `/dev-story STORY-INF-001` to start project setup
2. Or run `/create-story STORY-INF-001` to generate a detailed story document first

**Implementation order for Sprint 1:**
```
INF-001 (both devs) → INF-002 (Dev A) + S-002 design (Dev B) → S-001 → S-002 → S-003 → S-004 → S-005
```

---

**This plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**

*Run `/workflow-status` to check progress. Run `/dev-story {STORY-ID}` to begin implementing a story.*
