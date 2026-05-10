# Entity Relationship Diagram — Check12

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              USERS                                            │
│  id (PK, UUID)  phone (UNIQUE)  email (UNIQUE)  passwordHash                │
│  type (individual|business)  role  tier (0|1|2)                              │
│  kycStatus  kybStatus  businessName  registrationNumber                       │
│  phoneVerified  mfaEnabled  totpSecret  deletedAt                             │
└────────┬────────────────────────────────────────────────────────────────────-─┘
         │ 1
         │ has many
         ├──────────────────────────────────────────────────────────────┐
         │                                                              │
         ▼ N                                                            ▼ N
┌──────────────────┐     ┌──────────────────────────────────────────────────┐
│  KYC_DOCUMENTS   │     │  WALLETS                                          │
│  id (PK)         │     │  id (PK)                                          │
│  userId (FK)     │     │  userId (FK)                                      │
│  documentType    │     │  currency (AFRi|xGHS)                             │
│  status          │     │  UNIQUE(userId, currency)                         │
│  filePath        │     └──────────────┬────────────────────────────────────┘
│  providerRef     │                    │ 1
│  reviewerId      │                    │ has many
│  submittedAt     │                    ▼ N
└──────────────────┘     ┌──────────────────────────────────────────────────┐
                         │  LEDGER_EVENTS (append-only, immutable)           │
                         │  id (PK)                                          │
                         │  walletId (FK)                                    │
                         │  type (credit|debit)                              │
                         │  amount DECIMAL(18,8)                             │
                         │  currency                                         │
                         │  referenceId  referenceType                       │
                         │  idempotencyKey (UNIQUE)                          │
                         │  metadata JSONB                                   │
                         │  createdAt                                        │
                         │                                                   │
                         │  Balance = SUM(credits) - SUM(debits)             │
                         │  [TRIGGERS prevent UPDATE/DELETE]                 │
                         └──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  TRANSACTIONS                                                                 │
│  id (PK)  userId (FK)  type  status  amount  currency  fee                   │
│  exchangeRate  counterpartyId  counterpartyDisplay                            │
│  idempotencyKey (UNIQUE)  amlStatus  travelRuleData JSONB                    │
│  settledAt  createdAt  updatedAt                                              │
└──────┬───────────────────────────────────────────────────────────────────────┘
       │ 1
       │ may have
       ▼ N
┌─────────────────────┐
│  AML_ALERTS          │
│  id (PK)             │
│  transactionId (FK)  │
│  userId (FK)         │
│  ruleTriggered       │
│  amount  currency    │
│  status              │
│  officerId           │
│  sarFiled            │
│  reviewedAt          │
└─────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  PAYMENT_LINKS                                                                │
│  id (PK)  shortCode (UNIQUE)  merchantWalletId (FK)  merchantUserId (FK)    │
│  amount  currency  description  status  expiresAt  paidAt  payerReference    │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  SAVINGS_ACCOUNTS                                                             │
│  id (PK)  userId (FK)  walletId (FK)  label  targetAmount                   │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  NOTIFICATIONS                                                                │
│  id (PK)  userId (FK)  type  message  read  actionUrl  metadata JSONB        │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  STABLECOIN_RESERVES (daily reconciliation audit log)                        │
│  id (PK)  date  currency  circulatingSupply  goldOz  goldPriceUsd            │
│  reserveValueUsd  backingRatioPct  discrepancyPct  withinTolerance           │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  API_KEYS                                                                     │
│  id (PK)  userId (FK)  keyPrefix  keyHash  permissions JSONB                 │
│  lastUsedAt  revokedAt                                                        │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  WEBHOOK_ENDPOINTS                                                            │
│  id (PK)  userId (FK)  url  events JSONB  secretHash  active                 │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  AUDIT_LOGS (immutable admin action trail)                                   │
│  id (PK)  actorId (FK)  action  targetId  targetType  metadata JSONB         │
│  ipAddress  createdAt                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

| Decision | Detail |
|----------|--------|
| **Append-only ledger** | `ledger_events` has DB triggers preventing UPDATE/DELETE. Balance = SUM query. |
| **UNIQUE idempotency** | Both `ledger_events` and `transactions` have DB-level UNIQUE on `idempotencyKey`. |
| **No balance field** | `wallets` table has no `balance` column — always computed from `ledger_events`. |
| **DECIMAL(18,8)** | All financial amounts use fixed-precision decimal, never FLOAT. |
| **Soft deletes** | `users.deletedAt` — no hard deletes for regulatory audit trail. |
| **JSONB metadata** | Flexible fields for travel rule data, notification metadata, API key permissions. |
| **Wallet uniqueness** | `UNIQUE(userId, currency)` — one AFRi wallet and one xGHS wallet per user. |
