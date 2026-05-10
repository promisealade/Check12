import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1715299200000 implements MigrationInterface {
  name = 'InitialSchema1715299200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ─── users ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE user_type_enum AS ENUM ('individual', 'business');
      CREATE TYPE user_role_enum AS ENUM ('user', 'business', 'compliance_officer', 'kyc_reviewer', 'admin', 'super_admin');
      CREATE TYPE kyc_status_enum AS ENUM ('pending', 'approved', 'rejected', 'requires_more_info');
      CREATE TYPE kyb_status_enum AS ENUM ('not_started', 'pending', 'approved', 'rejected');

      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        phone VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        "passwordHash" VARCHAR NOT NULL,
        type user_type_enum NOT NULL DEFAULT 'individual',
        role user_role_enum NOT NULL DEFAULT 'user',
        tier SMALLINT NOT NULL DEFAULT 0,
        "kycStatus" kyc_status_enum NOT NULL DEFAULT 'pending',
        "businessName" VARCHAR,
        "registrationNumber" VARCHAR,
        "kybStatus" kyb_status_enum NOT NULL DEFAULT 'not_started',
        "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
        "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
        "totpSecret" VARCHAR,
        "dailyLimitUsd" DECIMAL(10,2),
        "deletedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE UNIQUE INDEX idx_users_phone ON users(phone);
      CREATE UNIQUE INDEX idx_users_email ON users(email);
    `);

    // ─── kyc_documents ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE kyc_doc_status_enum AS ENUM ('pending', 'approved', 'rejected', 'requires_more_info');

      CREATE TABLE kyc_documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id),
        "documentType" VARCHAR NOT NULL,
        status kyc_doc_status_enum NOT NULL DEFAULT 'pending',
        "filePath" VARCHAR,
        "providerRef" VARCHAR,
        "reviewerId" UUID,
        "reviewNotes" VARCHAR,
        "reviewedAt" TIMESTAMP,
        "submittedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_kyc_docs_user_status ON kyc_documents("userId", status);
    `);

    // ─── wallets ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE currency_enum AS ENUM ('AFRi', 'xGHS');

      CREATE TABLE wallets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id),
        currency currency_enum NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE("userId", currency)
      );

      CREATE INDEX idx_wallets_user ON wallets("userId");
    `);

    // ─── ledger_events (append-only) ─────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE ledger_event_type_enum AS ENUM ('credit', 'debit');
      CREATE TYPE ledger_ref_type_enum AS ENUM (
        'transfer', 'conversion', 'funding', 'withdrawal',
        'collection', 'savings_deposit', 'savings_withdrawal', 'reversal'
      );

      CREATE TABLE ledger_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "walletId" UUID NOT NULL REFERENCES wallets(id),
        type ledger_event_type_enum NOT NULL,
        amount DECIMAL(18,8) NOT NULL,
        currency VARCHAR NOT NULL,
        "referenceId" UUID,
        "referenceType" ledger_ref_type_enum,
        "idempotencyKey" VARCHAR NOT NULL,
        metadata JSONB,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE UNIQUE INDEX idx_ledger_idempotency ON ledger_events("idempotencyKey");
      CREATE INDEX idx_ledger_wallet_created ON ledger_events("walletId", "createdAt" DESC);

      -- Prevent UPDATE and DELETE on ledger_events (append-only enforcement)
      CREATE OR REPLACE FUNCTION prevent_ledger_mutation()
        RETURNS TRIGGER LANGUAGE plpgsql AS $$
      BEGIN
        RAISE EXCEPTION 'ledger_events is append-only: % operations are not allowed', TG_OP;
      END;
      $$;

      CREATE TRIGGER ledger_no_update
        BEFORE UPDATE ON ledger_events
        FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();

      CREATE TRIGGER ledger_no_delete
        BEFORE DELETE ON ledger_events
        FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();
    `);

    // ─── transactions ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE tx_type_enum AS ENUM (
        'funding', 'withdrawal', 'conversion',
        'transfer_sent', 'transfer_received',
        'collection', 'savings_deposit', 'savings_withdrawal'
      );
      CREATE TYPE tx_status_enum AS ENUM ('pending', 'completed', 'failed', 'reversed');
      CREATE TYPE aml_status_enum AS ENUM ('pending', 'cleared', 'flagged', 'escalated');

      CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id),
        type tx_type_enum NOT NULL,
        status tx_status_enum NOT NULL DEFAULT 'pending',
        amount DECIMAL(18,8) NOT NULL,
        currency VARCHAR NOT NULL,
        fee DECIMAL(18,8) NOT NULL DEFAULT 0,
        "exchangeRate" DECIMAL(18,8),
        "counterpartyId" UUID,
        "counterpartyDisplay" VARCHAR,
        "payerReference" VARCHAR,
        "idempotencyKey" VARCHAR NOT NULL,
        "amlStatus" aml_status_enum NOT NULL DEFAULT 'pending',
        "travelRuleData" JSONB,
        metadata JSONB,
        "settledAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE UNIQUE INDEX idx_tx_idempotency ON transactions("idempotencyKey");
      CREATE INDEX idx_tx_user_created ON transactions("userId", "createdAt" DESC);
      CREATE INDEX idx_tx_aml_status ON transactions("amlStatus") WHERE "amlStatus" = 'flagged';
    `);

    // ─── payment_links ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE payment_link_status_enum AS ENUM ('active', 'paid', 'expired');

      CREATE TABLE payment_links (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "shortCode" VARCHAR(12) NOT NULL,
        "merchantWalletId" UUID NOT NULL REFERENCES wallets(id),
        "merchantUserId" UUID NOT NULL REFERENCES users(id),
        amount DECIMAL(18,8) NOT NULL,
        currency VARCHAR NOT NULL,
        description VARCHAR,
        status payment_link_status_enum NOT NULL DEFAULT 'active',
        "expiresAt" TIMESTAMP NOT NULL,
        "paidAt" TIMESTAMP,
        "payerReference" VARCHAR,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE UNIQUE INDEX idx_payment_links_short_code ON payment_links("shortCode");
      CREATE INDEX idx_payment_links_merchant ON payment_links("merchantUserId");
    `);

    // ─── savings_accounts ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE savings_accounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id),
        "walletId" UUID NOT NULL REFERENCES wallets(id),
        label VARCHAR NOT NULL,
        "targetAmount" DECIMAL(18,8),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_savings_user ON savings_accounts("userId");
    `);

    // ─── notifications ───────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id),
        type VARCHAR NOT NULL,
        message VARCHAR NOT NULL,
        read BOOLEAN NOT NULL DEFAULT false,
        "actionUrl" VARCHAR,
        metadata JSONB,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_notifications_user_unread ON notifications("userId", read);
    `);

    // ─── stablecoin_reserves ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE stablecoin_reserves (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        date DATE NOT NULL,
        currency VARCHAR NOT NULL,
        "circulatingSupply" DECIMAL(18,8) NOT NULL,
        "goldOz" DECIMAL(10,4) NOT NULL,
        "goldPriceUsd" DECIMAL(10,2) NOT NULL,
        "reserveValueUsd" DECIMAL(18,2) NOT NULL,
        "backingRatioPct" DECIMAL(8,4) NOT NULL,
        "discrepancyPct" DECIMAL(8,6) NOT NULL,
        "withinTolerance" BOOLEAN NOT NULL,
        "custodianRef" VARCHAR,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // ─── aml_alerts ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE aml_alert_status_enum AS ENUM ('pending', 'cleared', 'escalated');

      CREATE TABLE aml_alerts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "transactionId" UUID NOT NULL REFERENCES transactions(id),
        "userId" UUID NOT NULL REFERENCES users(id),
        "ruleTriggered" VARCHAR NOT NULL,
        amount DECIMAL(18,8) NOT NULL,
        currency VARCHAR NOT NULL,
        status aml_alert_status_enum NOT NULL DEFAULT 'pending',
        "officerId" UUID,
        notes VARCHAR,
        "sarFiled" BOOLEAN NOT NULL DEFAULT false,
        "reviewedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_aml_alerts_status ON aml_alerts(status);
      CREATE INDEX idx_aml_alerts_user ON aml_alerts("userId");
    `);

    // ─── api_keys ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE api_keys (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id),
        "keyPrefix" VARCHAR(12) NOT NULL,
        "keyHash" VARCHAR NOT NULL,
        permissions JSONB NOT NULL DEFAULT '[]',
        "lastUsedAt" TIMESTAMP,
        "revokedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_api_keys_user ON api_keys("userId");
    `);

    // ─── webhook_endpoints ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE webhook_endpoints (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id),
        url VARCHAR NOT NULL,
        events JSONB NOT NULL DEFAULT '[]',
        "secretHash" VARCHAR NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_webhooks_user ON webhook_endpoints("userId");
    `);

    // ─── audit_logs ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "actorId" UUID NOT NULL REFERENCES users(id),
        action VARCHAR NOT NULL,
        "targetId" UUID,
        "targetType" VARCHAR,
        metadata JSONB,
        "ipAddress" VARCHAR,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_audit_logs_actor ON audit_logs("actorId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS webhook_endpoints CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS api_keys CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS aml_alerts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS stablecoin_reserves CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS savings_accounts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS payment_links CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS transactions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS ledger_events CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS wallets CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS kyc_documents CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS aml_alert_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_link_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS aml_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS tx_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS tx_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS ledger_ref_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS ledger_event_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS currency_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS kyc_doc_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS kyb_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS kyc_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_type_enum`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
