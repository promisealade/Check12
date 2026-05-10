# Product Brief: Check12

**Date:** 2026-05-09
**Author:** PromiseAlade
**Version:** 1.0
**Project Type:** Web Application
**Project Level:** 2 (Medium)

---

## Executive Summary

Check12 is a regulated Virtual Asset Service Provider (VASP) building a dual-stablecoin platform for cross-border payments, digital savings, and business collections across Africa. The platform will issue two stablecoins: AFRi, pegged to the US dollar and backed by physical gold, and xGHS, pegged to the Ghana Cedi at 1:1. By combining regulatory compliance with blockchain-native settlement, Check12 makes intra-Africa value transfer fast, affordable, and stable.

---

## Problem Statement

### The Problem

Cross-border payments in Africa are slow, expensive, and unreliable. Currency volatility compounds the cost — Ghana's cedi has devalued by at least 50% over the last three years, meaning users lose significant value simply in the process of sending money. Individuals remitting funds, SMEs paying cross-border suppliers, and merchants receiving payments all bear this cost with no reliable alternative.

### Why Now?

Stablecoins and blockchain technology now make programmable, low-cost settlement possible at scale. Stablecoin adoption is increasing across Africa, and the regulatory environment is beginning to accommodate digital asset providers, creating a narrow window to establish a trusted, licensed platform.

### Impact if Unsolved

Without a solution, cross-border payments within Africa will remain prohibitively expensive, intra-Africa trade will remain stunted, and the friction of doing business across borders will continue to disadvantage African individuals and businesses.

---

## Target Audience

### Primary Users

- **Individual Ghanaians** — Sending money to other African countries, hedging savings against cedi devaluation, and receiving remittances from diaspora. Smartphone users with mobile internet access.
- **SMEs (Multi-sector)** — Businesses paying suppliers across borders, managing multi-currency exposure, needing reliable and affordable cross-border settlement.
- **Merchants (Online and Physical)** — Accepting payments from customers locally and across borders without conversion friction or high fees.

### Secondary Users

- **Liquidity Providers** — Supplying liquidity to support stablecoin operations
- **Treasury Teams** — Managing reserves, liquidity, and stablecoin backing
- **Compliance Officers** — Ensuring adherence to regulatory requirements

### User Needs

- **Cost reduction** — Lower fees on transfers and conversions compared to traditional channels
- **Currency stability** — Protection from devaluation through gold-backed and pegged stablecoins
- **Fast settlement** — Near-instant cross-border transfers vs. days via legacy systems

---

## Solution Overview

### Proposed Solution

A dual-stablecoin platform built on blockchain infrastructure, licensed as a VASP, offering wallets, cross-border transfers, savings, and business payment collections — designed for African users and compliant with local regulations.

### Key Features

- **AFRi stablecoin** — USD-pegged, backed by physical gold (inflation and devaluation hedge)
- **xGHS stablecoin** — Ghana Cedi-pegged at 1:1 (removes local conversion friction)
- **Multi-currency wallet** — Hold, send, and receive AFRi and xGHS
- **Cross-border transfers** — Fast, low-cost settlement across African markets
- **Savings** — Digital savings in stable-value assets
- **Business collections** — Merchant and SME payment acceptance (online and physical)
- **Onboarding & verification** — KYC (individuals) and KYB (businesses)
- **Local funding** — On-ramp from local fiat methods
- **Conversion** — Seamless exchange between AFRi, xGHS, and local currencies
- **Third-party integrations** — API access for partners and ecosystem connectivity

### Value Proposition

Gold-backed AFRi gives users a credible hedge against African currency devaluation — something USDC and USDT do not offer natively. xGHS eliminates conversion friction for local Ghanaians, making stablecoins accessible without requiring dollar-denominated thinking. Together, they serve both the stability-seeking saver and the friction-avoiding transactor.

---

## Business Objectives

### Goals

- Onboard **10,000 users** within Year 1 of launch
- Achieve **$5M in transaction volume** in Year 1
- Establish a sustainable, fee-based revenue model from launch
- Obtain VASP licensing and full regulatory compliance before launch
- Expand to **3 African markets** within the product lifecycle

### Success Metrics

- Total registered users (target: 10,000 by end of Year 1)
- Monthly active users (MAU)
- Total transaction volume ($5M Year 1 target)
- Revenue from conversion spread and transaction fees
- Number of markets with regulatory clearance
- User retention rate (Month 1 → Month 3)

### Business Value

Check12 generates revenue through two streams: a spread on currency conversions and per-transaction fees. This dual model captures value on both stablecoin adoption (conversions) and ongoing usage (transfers), aligning revenue with platform activity.

---

## Scope

### In Scope (v1)

- AFRi and xGHS stablecoin issuance and wallet
- Cross-border transfer functionality
- Digital savings accounts
- Business payment collections (online and physical merchants)
- Individual onboarding with KYC verification
- Business onboarding with KYB verification
- Local fiat funding (on-ramp)
- Stablecoin conversion engine
- Third-party API integrations

### Out of Scope (v1)

- Lending and credit products
- Debit or physical payment cards
- USDC / USDT wallet support

### Future Considerations (v2+)

- USDC wallet integration
- USDT wallet integration
- Broader multi-stablecoin support for increased coverage and transaction volume

---

## Key Stakeholders

- **Founders (High influence)** — Core decision makers driving product vision, strategy, and execution
- **Bank of Ghana / Regulators (High influence)** — VASP licensing authority; compliance with their requirements is a hard prerequisite for launch
- **Banking Partners (High influence)** — Provide fiat on/offramp infrastructure and settlement rails; critical for local funding features
- **Investors (High influence)** — Funding and strategic support; influence roadmap prioritization
- **Liquidity Providers (Medium influence)** — Ensure stablecoin liquidity and peg stability
- **Treasury Team (Medium influence)** — Manage gold reserves (AFRi backing) and operational liquidity
- **Compliance Officers (Medium influence)** — Ensure ongoing regulatory adherence post-launch

---

## Constraints and Assumptions

### Constraints

- Must comply with Bank of Ghana regulations throughout development and at launch
- VASP licensing must be obtained before operating commercially
- Gold reserve custody arrangements required for AFRi issuance

### Assumptions

- Target users have access to smartphones and mobile internet
- Banking partners will integrate via standard APIs
- Regulatory approval is achievable within the timeline given early engagement

---

## Success Criteria

- Check12 is **fully licensed** as a VASP under applicable regulations
- The platform is **operationally profitable** within a defined post-launch window
- Check12 is **trusted and actively used across 3 African markets**
- AFRi and xGHS maintain their pegs reliably
- No material regulatory sanctions or peg failures within the first operating year

---

## Timeline and Milestones

### Target Launch

**Q1 2027**

### Key Milestones

- **Regulatory engagement & VASP license application** — Initiate as early as possible; longest lead-time item
- **Banking partner onboarding** — Secure at least one primary banking partner before beta
- **Beta launch** — Limited user testing prior to public launch; validate KYC/KYB flows, transfers, and conversions
- **Public launch** — Q1 2027, Ghana market first

---

## Risks and Mitigation

- **Risk: Regulatory approval delays**
  - **Likelihood:** High
  - **Mitigation:** Engage Bank of Ghana and legal advisors early; design compliance architecture before development begins; maintain transparent dialogue with regulators throughout

- **Risk: Low user adoption / trust in stablecoins**
  - **Likelihood:** Medium
  - **Mitigation:** Education campaigns targeting primary user segments; partnership with trusted local brands; transparent communication about gold backing and peg mechanisms; focus on UX simplicity to lower barriers to entry

---

## Next Steps

1. Create Product Requirements Document (PRD) — `/prd`
2. Define system architecture — `/architecture`
3. Conduct user research (optional) — `/research`

---

**This document was created using BMAD Method v6 - Phase 1 (Analysis)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*
