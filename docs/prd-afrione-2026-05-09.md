# Product Requirements Document: Afrione

**Date:** 2026-05-09
**Author:** PromiseAlade
**Version:** 1.0
**Project Type:** Web Application
**Project Level:** 2 (Medium)
**Status:** Draft

---

## Document Overview

This Product Requirements Document (PRD) defines the functional and non-functional requirements for Afrione. It serves as the source of truth for what will be built and provides traceability from requirements through implementation.

**Related Documents:**
- Product Brief: `docs/product-brief-afrione-2026-05-09.md`

---

## Executive Summary

Afrione is a regulated Virtual Asset Service Provider (VASP) building a dual-stablecoin platform for cross-border payments, digital savings, and business collections across Africa. The platform issues two stablecoins: AFRi (USD-pegged, gold-backed) and xGHS (Ghana Cedi-pegged 1:1). By combining regulatory compliance with blockchain-native settlement, Afrione makes intra-Africa value transfer fast, affordable, and stable for individuals, SMEs, and merchants.

---

## Product Goals

### Business Objectives

- Onboard **10,000 users** within Year 1 of launch
- Achieve **$5M in transaction volume** in Year 1
- Establish sustainable fee-based revenue from launch (conversion spread + transaction fees)
- Obtain VASP licensing and full regulatory compliance before commercial launch
- Expand to **3 African markets** within the product lifecycle

### Success Metrics

- Total registered users — target: 10,000 by end of Year 1
- Monthly active users (MAU)
- Total transaction volume — target: $5M in Year 1
- Revenue from conversion spread and per-transaction fees
- Number of markets with regulatory clearance
- User retention rate (Month 1 → Month 3)

---

## Functional Requirements

Functional Requirements (FRs) define **what** the system does — specific features and behaviors. Each requirement includes a unique ID, MoSCoW priority, description, and testable acceptance criteria.

---

### FR-001: Individual Registration & KYC

**Priority:** Must Have

**Description:**
Users register via phone number or email address and complete identity verification through document submission (government-issued ID) and biometric check (selfie/liveness). Account access is restricted until KYC is approved.

**Acceptance Criteria:**
- [ ] User can register with phone or email and create a secure password
- [ ] User can upload a government-issued ID document
- [ ] User can complete a selfie/liveness check
- [ ] System submits documents to KYC provider and returns a pass/fail status
- [ ] User receives notification when KYC is approved or rejected
- [ ] Unverified users cannot initiate transactions

**Dependencies:** NFR-005 (MFA), NFR-006 (Compliance)

---

### FR-002: Business Registration & KYB

**Priority:** Must Have

**Description:**
Business accounts register with company details, submit registration documents, and provide director/beneficial owner information for KYB verification. Full transaction access requires KYB approval.

**Acceptance Criteria:**
- [ ] Business can register with company name, registration number, and contact details
- [ ] Business can upload company registration certificate and director identification
- [ ] System submits documents for KYB review and returns approval status
- [ ] Business receives notification when KYB is approved or rejected
- [ ] Unverified businesses cannot initiate collections or cross-border transfers

**Dependencies:** FR-001, NFR-006 (Compliance)

---

### FR-003: Multi-currency Wallet

**Priority:** Must Have

**Description:**
All verified users have a wallet that holds AFRi and xGHS balances. Users can view balances, see full transaction history, and access account details from a single dashboard.

**Acceptance Criteria:**
- [ ] User can view AFRi and xGHS balances on a unified dashboard
- [ ] User can view a paginated, filterable transaction history (by type, date, amount)
- [ ] Wallet displays the USD equivalent of AFRi balance and GHS equivalent of xGHS balance
- [ ] Wallet state is consistent and accurate within 5 seconds of any transaction event

**Dependencies:** FR-001 (verified user)

---

### FR-004: Local Fiat On-ramp

**Priority:** Must Have

**Description:**
Users fund their wallets from Ghanaian mobile money providers (MTN, Vodafone, AirtelTigo) and local bank transfers. Fiat received is converted to xGHS or AFRi at the prevailing rate.

**Acceptance Criteria:**
- [ ] User can initiate a funding request via MTN, Vodafone, or AirtelTigo Mobile Money
- [ ] User can initiate a funding request via bank transfer
- [ ] System confirms receipt of fiat and credits the equivalent stablecoin to wallet within 5 minutes
- [ ] User sees the conversion rate and expected amount before confirming
- [ ] User receives a push/SMS notification upon successful funding

**Dependencies:** FR-003 (wallet), NFR-002 (settlement time)

---

### FR-005: Stablecoin Conversion

**Priority:** Must Have

**Description:**
Users convert between AFRi and xGHS within the platform. The system displays the current exchange rate, conversion fee (spread), and resulting amount before the user confirms.

**Acceptance Criteria:**
- [ ] User can initiate a conversion from AFRi to xGHS or xGHS to AFRi
- [ ] System displays exchange rate, spread fee, and expected output amount before confirmation
- [ ] Conversion executes and wallet balances update within 30 seconds of confirmation
- [ ] Conversion is recorded in transaction history with full rate and fee detail
- [ ] User is prevented from converting more than their available balance

**Dependencies:** FR-003 (wallet), NFR-001 (performance)

---

### FR-006: Cross-border Transfer

**Priority:** Must Have

**Description:**
Verified users send AFRi or xGHS to other Afrione users or external wallet addresses across supported African markets. Transfers complete near-instantly with transparent fee disclosure upfront.

**Acceptance Criteria:**
- [ ] User can search for a recipient by phone number, username, or wallet address
- [ ] User sees transfer fee and estimated settlement time before confirming
- [ ] Transfer settles to recipient wallet within 30 seconds for on-platform transfers
- [ ] Both sender and recipient receive transaction notifications
- [ ] Failed transfers revert to sender balance within 60 seconds with an error message
- [ ] Transfer is recorded in both sender and recipient transaction histories

**Dependencies:** FR-003 (wallet), FR-001/FR-002 (verified users), NFR-002 (settlement)

---

### FR-007: Digital Savings

**Priority:** Should Have

**Description:**
Users create savings accounts denominated in AFRi to hold value against inflation and currency devaluation. Users can set savings goals, make deposits, and withdraw to their main wallet.

**Acceptance Criteria:**
- [ ] User can create one or more AFRi savings accounts with an optional goal label and target amount
- [ ] User can deposit AFRi from their main wallet to savings account
- [ ] User can withdraw AFRi from savings back to main wallet at any time
- [ ] Savings balance is displayed separately from the main wallet balance
- [ ] Savings account history shows all deposits and withdrawals

**Dependencies:** FR-003 (wallet), FR-005 (conversion)

---

### FR-008: Business Payment Collections

**Priority:** Must Have

**Description:**
Verified merchants and SMEs create payment links and QR codes to accept AFRi and xGHS payments from customers online and at physical point of sale. Collections are credited to the business wallet.

**Acceptance Criteria:**
- [ ] Business can generate a payment link with a specified amount and currency (AFRi or xGHS)
- [ ] Business can generate a QR code for physical point-of-sale use
- [ ] Customer can complete payment via link or QR code without a Afrione account (guest pay via mobile money)
- [ ] Collected funds are credited to business wallet within 30 seconds of payment confirmation
- [ ] Business receives a notification for each successful collection
- [ ] Business can view all collections in transaction history with payer reference

**Dependencies:** FR-002 (KYB), FR-003 (wallet), NFR-002 (settlement)

---

### FR-009: Fiat Off-ramp

**Priority:** Should Have

**Description:**
Users convert AFRi or xGHS to GHS and withdraw to a registered mobile money wallet or bank account.

**Acceptance Criteria:**
- [ ] User can initiate a withdrawal specifying amount, stablecoin, and destination (mobile money or bank)
- [ ] System displays conversion rate, fee, and expected GHS amount before confirmation
- [ ] Funds arrive at mobile money or bank destination within 1 business day
- [ ] User receives confirmation notification when withdrawal is initiated and when it completes
- [ ] Withdrawal is recorded in transaction history

**Dependencies:** FR-003 (wallet), FR-004 (banking partner integration)

---

### FR-010: Transaction History & Reporting

**Priority:** Must Have

**Description:**
All users can view, filter, and export their transaction history. Business accounts can download formal statements for accounting and reconciliation.

**Acceptance Criteria:**
- [ ] User can view paginated transaction history sorted by date (newest first)
- [ ] User can filter history by transaction type (transfer, conversion, funding, withdrawal, collection)
- [ ] User can filter history by date range and amount range
- [ ] Business accounts can download a PDF or CSV statement for any date range
- [ ] Each transaction record shows: date/time, type, amount, currency, fee, status, and counterparty

**Dependencies:** FR-003 (wallet)

---

### FR-011: Notifications

**Priority:** Should Have

**Description:**
Users receive real-time push notifications, SMS, and email alerts for key events including transactions, balance changes, KYC/KYB status updates, and security events.

**Acceptance Criteria:**
- [ ] User receives a push notification within 10 seconds of any completed transaction
- [ ] User receives an SMS confirmation for transactions above a configurable threshold
- [ ] User receives email notification for KYC/KYB approval or rejection
- [ ] User receives an alert for login from a new device
- [ ] User can manage notification preferences from account settings

**Dependencies:** FR-001 (account), NFR-005 (security)

---

### FR-012: Third-party API & Webhooks

**Priority:** Should Have

**Description:**
Businesses and developers access Afrione payment functionality via a REST API. API key management and webhook subscriptions allow third parties to embed collections into external applications.

**Acceptance Criteria:**
- [ ] Business admin can generate and revoke API keys from the dashboard
- [ ] API supports payment link creation, collection status queries, and balance queries
- [ ] Webhooks deliver payment event notifications (paid, failed, refunded) to registered endpoints within 5 seconds
- [ ] API returns standardised error codes and messages for all failure states
- [ ] All API endpoints are documented in OpenAPI/Swagger format

**Dependencies:** FR-002 (KYB), NFR-012 (documentation)

---

### FR-013: Compliance & AML Monitoring

**Priority:** Must Have

**Description:**
The system performs automated transaction monitoring for anti-money laundering (AML) compliance. Suspicious activity is flagged for review, and regulatory reports are generated as required by the Bank of Ghana.

**Acceptance Criteria:**
- [ ] All transactions are screened against configurable AML rules (velocity, amount thresholds, watchlist)
- [ ] Transactions triggering rules are automatically flagged and queued for compliance officer review
- [ ] Compliance officers can review flagged transactions and mark as cleared or escalated
- [ ] System generates Suspicious Activity Reports (SARs) in the format required by Bank of Ghana
- [ ] Audit trail of all compliance actions is immutable and exportable

**Dependencies:** NFR-006 (regulatory compliance)

---

### FR-014: Admin Dashboard

**Priority:** Must Have

**Description:**
Internal operations team uses an admin dashboard to manage users, review KYC/KYB submissions, monitor platform transaction volumes, and verify AFRi gold reserve reconciliation.

**Acceptance Criteria:**
- [ ] Admins can view, search, and filter all user accounts with KYC/KYB status
- [ ] Admins can approve, reject, or request additional information for KYC/KYB submissions
- [ ] Dashboard displays real-time metrics: total users, MAU, transaction volume, revenue
- [ ] Admins can view daily gold reserve reconciliation reports for AFRi backing
- [ ] Admin actions (approvals, rejections) are logged with timestamp and actor ID
- [ ] Admin roles and permissions are configurable (e.g. separate KYC reviewer vs. super-admin)

**Dependencies:** FR-013 (compliance), NFR-004 (data security)

---

## Non-Functional Requirements

Non-Functional Requirements (NFRs) define **how** the system performs — quality attributes, constraints, and measurable standards.

---

### NFR-001: Performance — API Response Time

**Priority:** Must Have

**Description:**
The system must respond to API requests within defined latency targets under normal operating load.

**Acceptance Criteria:**
- [ ] 95th percentile API response time < 500ms under expected load (10,000 concurrent users)
- [ ] 99th percentile API response time < 2,000ms
- [ ] Performance benchmarks validated via load testing before launch

**Rationale:** Slow responses degrade trust in a financial application; users will abandon if transfers feel unreliable.

---

### NFR-002: Performance — Transaction Settlement

**Priority:** Must Have

**Description:**
On-platform stablecoin transfers and conversions must settle within a defined time window.

**Acceptance Criteria:**
- [ ] On-platform transfers (user-to-user) settle within 30 seconds end-to-end
- [ ] Stablecoin conversions (AFRi↔xGHS) complete within 30 seconds
- [ ] Settlement SLA breaches are logged and alerted to the operations team

**Rationale:** Speed is a core value proposition vs. legacy cross-border payment rails (1–5 days).

---

### NFR-003: Security — Data in Transit

**Priority:** Must Have

**Description:**
All data transmitted between clients, APIs, and internal services must be encrypted.

**Acceptance Criteria:**
- [ ] All endpoints enforce TLS 1.3 minimum; TLS 1.2 or lower connections are rejected
- [ ] HTTP connections are redirected to HTTPS automatically
- [ ] Certificate validity and renewal are monitored with automated alerts

**Rationale:** Financial data in transit is a primary attack surface; regulatory compliance requires encryption.

---

### NFR-004: Security — Data at Rest

**Priority:** Must Have

**Description:**
All sensitive data stored by the platform must be encrypted at rest.

**Acceptance Criteria:**
- [ ] Databases and file storage encrypted using AES-256
- [ ] Encryption keys managed via a dedicated key management service (KMS)
- [ ] KYC document storage uses separate encrypted storage with access logging

**Rationale:** Protects user PII and financial data in the event of infrastructure compromise.

---

### NFR-005: Security — Multi-Factor Authentication

**Priority:** Must Have

**Description:**
All user accounts must use MFA to prevent unauthorised access.

**Acceptance Criteria:**
- [ ] MFA (SMS OTP or authenticator app) is required for all accounts at login
- [ ] MFA is required to confirm high-value transactions (threshold configurable)
- [ ] Users are notified of login attempts from new devices
- [ ] MFA bypass is not available to end users (admin override requires dual approval)

**Rationale:** Credential theft is a primary vector for financial fraud; MFA is a minimum standard for VASP operations.

---

### NFR-006: Compliance — Regulatory & AML

**Priority:** Must Have

**Description:**
The platform must be fully compliant with Bank of Ghana VASP regulations and applicable AML/KYC requirements from day one of commercial operation.

**Acceptance Criteria:**
- [ ] VASP licence obtained before any commercial transactions are processed
- [ ] All users complete KYC (individuals) or KYB (businesses) before transacting
- [ ] Transaction monitoring rules are configurable to meet current regulatory thresholds
- [ ] Regulatory reports (SARs, transaction reports) can be generated on demand
- [ ] Data retention policies meet Bank of Ghana requirements (minimum 5 years)

**Rationale:** Operating without compliance exposes the business to licence revocation and criminal liability.

---

### NFR-007: Reliability — Uptime

**Priority:** Must Have

**Description:**
The platform must maintain high availability to support financial transactions that users depend on.

**Acceptance Criteria:**
- [ ] 99.9% uptime measured monthly (< 43.8 minutes unplanned downtime per month)
- [ ] Planned maintenance windows communicated 48 hours in advance
- [ ] Automated alerting triggers within 2 minutes of any service degradation
- [ ] Incident post-mortems published internally within 48 hours of major outages

**Rationale:** Financial services are time-sensitive; downtime directly costs users and revenue.

---

### NFR-008: Scalability — Concurrent Users

**Priority:** Must Have

**Description:**
The system must handle launch-day load and be architected to scale with user growth.

**Acceptance Criteria:**
- [ ] System handles 10,000 concurrent users without performance degradation at launch
- [ ] Architecture supports horizontal scaling to 100,000 concurrent users without re-architecture
- [ ] Auto-scaling is configured to respond to load spikes within 2 minutes
- [ ] Load testing at 1.5× expected peak load passes before launch

**Rationale:** Viral adoption or partner integrations can cause sudden traffic spikes in fintech; the architecture must absorb them.

---

### NFR-009: Data Integrity — Reserve Reconciliation

**Priority:** Must Have

**Description:**
The AFRi stablecoin requires daily proof that gold reserves match circulating supply. All stablecoin balances must be fully reconcilable at all times.

**Acceptance Criteria:**
- [ ] Daily automated reconciliation report confirms total AFRi in circulation matches gold reserve value
- [ ] Reconciliation discrepancies above 0.01% trigger an automated alert to treasury team
- [ ] Gold reserve custody data is imported from custodian via API or daily file
- [ ] Reconciliation audit trail is immutable and retained for regulatory purposes

**Rationale:** AFRi's value proposition depends on verifiable gold backing; any discrepancy undermines user trust and regulatory standing.

---

### NFR-010: Usability — Device & Browser Support

**Priority:** Should Have

**Description:**
The web application must be accessible on the devices and browsers used by the target audience.

**Acceptance Criteria:**
- [ ] Fully functional and responsive on mobile browsers (iOS Safari, Android Chrome)
- [ ] Fully functional on desktop: Chrome, Safari, Firefox (latest 2 major versions)
- [ ] UI renders correctly at common viewport sizes: 375px, 768px, 1280px+
- [ ] Core user flows (fund, convert, send) complete without error on all supported browsers

**Rationale:** African users primarily access the internet via mobile; mobile-first design is essential.

---

### NFR-011: Usability — Localisation Architecture

**Priority:** Should Have

**Description:**
The UI must support English at launch and be architecturally ready for additional local languages.

**Acceptance Criteria:**
- [ ] All UI strings externalised into a localisation file (i18n)
- [ ] English is the default language at launch
- [ ] Adding a new language requires only a new translation file, no code changes
- [ ] Date, time, and currency formatting adapts to locale

**Rationale:** Expanding to 3 African markets requires language support; retrofitting i18n is expensive — build it in from the start.

---

### NFR-012: Maintainability — API Documentation

**Priority:** Should Have

**Description:**
All public-facing API endpoints must be documented to support third-party integrations and internal development.

**Acceptance Criteria:**
- [ ] OpenAPI/Swagger specification maintained for all public API endpoints
- [ ] Documentation hosted at a stable URL and kept in sync with deployed API
- [ ] Each endpoint documents: method, path, parameters, request body, response schema, error codes
- [ ] API changelog maintained for breaking changes

**Rationale:** Third-party integrations (FR-012) depend on reliable documentation; poor docs increase support burden.

---

## Epics

Epics group related functional requirements into logical bodies of work that will be broken into detailed stories during sprint planning (Phase 4).

---

### EPIC-001: Identity & Compliance

**Description:**
Establishes the foundation for user trust and regulatory operation. Covers individual KYC, business KYB, and automated AML monitoring. Nothing on the platform can function without this epic complete.

**Functional Requirements:**
- FR-001 (Individual KYC)
- FR-002 (Business KYB)
- FR-013 (AML Monitoring)

**Story Count Estimate:** 5–7

**Priority:** Must Have

**Business Value:**
Regulatory prerequisite for all commercial operations. Without verified users and AML monitoring, the platform cannot legally process a single transaction.

---

### EPIC-002: Wallet & Stablecoin Operations

**Description:**
Delivers the core financial infrastructure: wallets, fiat on-ramp, stablecoin conversion, savings, and off-ramp. This epic is the platform's engine — all other features depend on it.

**Functional Requirements:**
- FR-003 (Multi-currency Wallet)
- FR-004 (Local Fiat On-ramp)
- FR-005 (Stablecoin Conversion)
- FR-007 (Digital Savings)
- FR-009 (Fiat Off-ramp)

**Story Count Estimate:** 6–8

**Priority:** Must Have (FR-003, FR-004, FR-005) / Should Have (FR-007, FR-009)

**Business Value:**
Directly addresses the two core user needs: cost reduction (low-fee on/off-ramp) and currency stability (AFRi savings). Conversion spread is also the primary revenue stream.

---

### EPIC-003: Transfers & Payments

**Description:**
Delivers the primary use cases for all three user segments: cross-border remittances for individuals, supplier payments for SMEs, and payment collections for merchants. This is the visible face of Afrione.

**Functional Requirements:**
- FR-006 (Cross-border Transfer)
- FR-008 (Business Payment Collections)
- FR-010 (Transaction History & Reporting)
- FR-011 (Notifications)

**Story Count Estimate:** 6–8

**Priority:** Must Have (FR-006, FR-008, FR-010) / Should Have (FR-011)

**Business Value:**
Transaction fees are the second revenue stream. Cross-border transfers and merchant collections are the primary acquisition drivers — the features users come for and tell others about.

---

### EPIC-004: Platform & Integrations

**Description:**
Enables Afrione to operate and scale as a business: internal admin tooling for compliance operations, and external API access for third-party ecosystem growth.

**Functional Requirements:**
- FR-012 (Third-party API & Webhooks)
- FR-014 (Admin Dashboard)

**Story Count Estimate:** 4–6

**Priority:** Must Have (FR-014) / Should Have (FR-012)

**Business Value:**
Admin dashboard is required for day-to-day compliance operations. Third-party API multiplies platform reach without direct user acquisition cost.

---

## User Stories (High-Level)

High-level stories per epic. Detailed stories with estimates will be created during sprint planning (Phase 4).

---

### EPIC-001: Identity & Compliance

- As an individual user, I want to register and complete KYC verification so that I can access the platform and transact within regulatory limits.
- As a business owner, I want to complete KYB verification so that my SME can send and receive cross-border payments legally.
- As a compliance officer, I want the system to automatically flag suspicious transactions so that I can meet AML reporting obligations to the Bank of Ghana.

### EPIC-002: Wallet & Stablecoin Operations

- As an individual user, I want to fund my wallet from MTN Mobile Money so that I can convert GHS to xGHS without visiting a bank.
- As an individual user, I want to convert my xGHS to AFRi so that I can protect my savings against cedi devaluation.
- As an individual user, I want to withdraw my AFRi or xGHS back to my bank account so that I can access my funds in local currency when needed.
- As a saver, I want to create a savings account in AFRi so that my money holds value over time against inflation.

### EPIC-003: Transfers & Payments

- As an individual user, I want to send AFRi to a recipient in another African country so that I can remit money quickly and cheaply without using a bank.
- As a merchant, I want to generate a payment link or QR code so that my customers can pay me in xGHS or AFRi online or in-store.
- As an SME, I want to view and export my transaction history so that I can reconcile payments with my accounting system.

### EPIC-004: Platform & Integrations

- As an admin, I want to review and approve KYC/KYB submissions so that only verified users can access full platform functionality.
- As a third-party developer, I want to integrate Afrione payments via REST API so that I can embed collections into my own application.
- As an admin, I want to view daily reserve reconciliation reports so that I can verify AFRi gold backing remains fully collateralised.

---

## User Personas

### Individual User — "The Ghanaian Sender/Saver"
Mobile-first smartphone user. Sends money to family in other African countries, receives remittances from diaspora, and holds savings in AFRi to hedge against cedi devaluation. Values simplicity, low fees, and fast confirmation.

### SME Owner — "The Cross-border Trader"
Multi-sector business owner paying suppliers in other African markets. Needs reliable settlement, clear transaction records for accounting, and predictable fees. Values business-grade reporting and API access.

### Merchant — "The Collections Operator"
Online or physical merchant accepting customer payments. Needs fast collection confirmation, simple payment link generation, and easy reconciliation. Values reliability and real-time notification of received funds.

### Secondary: Compliance Officer
Reviews flagged transactions, manages KYC/KYB approvals, generates regulatory reports. Needs a clear queue-based workflow, audit trails, and configurable monitoring rules.

---

## User Flows

### Flow 1: Individual On-ramp & Cross-border Transfer
Register → KYC verification → Fund wallet via Mobile Money → Convert GHS → xGHS → Send xGHS cross-border → Recipient receives funds

### Flow 2: Merchant Collections Setup & Payment Receipt
Register business → KYB verification → Generate payment link/QR → Share with customer → Customer pays via mobile money → Funds credited to business wallet → Merchant notified

### Flow 3: Admin KYC Review & Compliance Monitoring
Admin logs in → Reviews KYC queue → Approves or requests more info → Compliance system flags suspicious transaction → Officer reviews → Files SAR if required

---

## Dependencies

### Internal Dependencies

- Stablecoin smart contract / ledger must be deployed before wallet and conversion features
- Admin dashboard depends on user management and KYC systems being operational
- AML monitoring depends on transaction data from wallet and transfer systems

### External Dependencies

- **Mobile Money APIs** — MTN, Vodafone, AirtelTigo for GHS on-ramp and off-ramp
- **KYC/Identity Verification Provider** — Third-party for document verification and liveness checks
- **Blockchain Network** — For stablecoin issuance and settlement
- **Banking Partner APIs** — Fiat settlement rails for bank transfer funding and withdrawals
- **Gold Custodian** — Custody of physical gold backing AFRi; daily reserve data feed for reconciliation

---

## Assumptions

- Target users have access to smartphones and mobile internet
- Banking partners will integrate via standard REST APIs
- Regulatory approval (VASP licence) is achievable before Q1 2027 given early engagement
- Gold custody arrangements are in place before AFRi is issued to the public
- At least one mobile money provider API is available for integration at launch

---

## Out of Scope

- Lending and credit products
- Debit or physical payment cards
- USDC and USDT wallet support (planned for v2+)
- DeFi/yield products
- Fiat-only accounts (non-stablecoin)

---

## Open Questions

None outstanding at time of PRD creation.

---

## Approval & Sign-off

### Stakeholders

- **Founders (High influence)** — Core decision makers; primary approvers
- **Bank of Ghana / Regulators (High influence)** — VASP licensing authority
- **Banking Partners (High influence)** — Fiat rail and settlement infrastructure
- **Investors (High influence)** — Funding and strategic alignment
- **Liquidity Providers (Medium influence)** — Stablecoin liquidity and peg stability
- **Treasury Team (Medium influence)** — Reserve management and reconciliation
- **Compliance Officers (Medium influence)** — Regulatory adherence

### Approval Status

- [ ] Product Owner
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] QA Lead

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-09 | PromiseAlade | Initial PRD |

---

## Next Steps

### Phase 3: Architecture

Run `/architecture` to create system architecture based on these requirements.

The architecture will address:
- All functional requirements (FRs)
- All non-functional requirements (NFRs)
- Technical stack decisions
- Data models and APIs
- System components

### Phase 4: Sprint Planning

After architecture is complete, run `/sprint-planning` to:
- Break epics into detailed user stories
- Estimate story complexity
- Plan sprint iterations
- Begin implementation

---

**This document was created using BMAD Method v6 - Phase 2 (Planning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*

---

## Appendix A: Requirements Traceability Matrix

| Epic ID | Epic Name | Functional Requirements | Story Count (Est.) |
|---------|-----------|-------------------------|-------------------|
| EPIC-001 | Identity & Compliance | FR-001, FR-002, FR-013 | 5–7 |
| EPIC-002 | Wallet & Stablecoin Operations | FR-003, FR-004, FR-005, FR-007, FR-009 | 6–8 |
| EPIC-003 | Transfers & Payments | FR-006, FR-008, FR-010, FR-011 | 6–8 |
| EPIC-004 | Platform & Integrations | FR-012, FR-014 | 4–6 |

**Total estimated stories: 21–29**

---

## Appendix B: Prioritization Details

### Functional Requirements

| Priority | Count | IDs |
|----------|-------|-----|
| Must Have | 10 | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-008, FR-010, FR-013, FR-014 |
| Should Have | 4 | FR-007, FR-009, FR-011, FR-012 |
| Could Have | 0 | — |
| Won't Have (v1) | — | Lending, cards, USDC/USDT wallets |

### Non-Functional Requirements

| Priority | Count | IDs |
|----------|-------|-----|
| Must Have | 9 | NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-006, NFR-007, NFR-008, NFR-009 |
| Should Have | 3 | NFR-010, NFR-011, NFR-012 |
