import { AppDataSource } from './data-source';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const BCRYPT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Password123!';
const ADMIN_PASSWORD = 'Admin@check12!';

async function seed() {
  await AppDataSource.initialize();
  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    console.info('🌱 Seeding Check12 database...');

    const pwHash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);
    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

    // ─── Users ──────────────────────────────────────────────────────────────
    const amaraId = uuidv4();   // Tier 2 individual
    const kofiId = uuidv4();    // Tier 1 individual
    const yaaId = uuidv4();     // Tier 0 individual
    const akosuaId = uuidv4(); // Approved business
    const kwabenId = uuidv4(); // Pending business
    const adminId = uuidv4();  // Admin

    await qr.query(`
      INSERT INTO users (id, phone, email, "passwordHash", type, role, tier, "kycStatus", "kybStatus", "phoneVerified")
      VALUES
        ('${amaraId}', '+233244000001', 'amara@example.com', '${pwHash}', 'individual', 'user', 2, 'approved', 'not_started', true),
        ('${kofiId}',  '+233244000002', 'kofi@example.com',  '${pwHash}', 'individual', 'user', 1, 'pending',  'not_started', true),
        ('${yaaId}',   '+233244000003', 'yaa@example.com',   '${pwHash}', 'individual', 'user', 0, 'pending',  'not_started', false),
        ('${akosuaId}','+233244000004', 'akosua@sme.com',    '${pwHash}', 'business',   'business', 2, 'approved', 'approved', true),
        ('${kwabenId}','+233244000005', 'kwaben@sme.com',    '${pwHash}', 'business',   'business', 0, 'pending',  'pending',  true),
        ('${adminId}', '+233244000099', 'admin@check12.com', '${adminHash}', 'individual', 'admin', 2, 'approved', 'not_started', true)
    `);

    await qr.query(`
      UPDATE users SET "businessName" = 'Akosua Textiles Ltd', "registrationNumber" = 'GH-BIZ-20241001'
      WHERE id = '${akosuaId}';
      UPDATE users SET "businessName" = 'Kwaben Imports Co', "registrationNumber" = 'GH-BIZ-20241205'
      WHERE id = '${kwabenId}';
    `);

    // ─── KYC Documents ──────────────────────────────────────────────────────
    await qr.query(`
      INSERT INTO kyc_documents (id, "userId", "documentType", status, "providerRef", "reviewedAt")
      VALUES
        ('${uuidv4()}', '${amaraId}', 'national_id', 'approved', 'SMILEID-001', now()),
        ('${uuidv4()}', '${amaraId}', 'selfie',       'approved', 'SMILEID-002', now()),
        ('${uuidv4()}', '${kofiId}',  'national_id', 'pending',  'SMILEID-003', null),
        ('${uuidv4()}', '${akosuaId}','business_registration', 'approved', 'SMILEID-004', now()),
        ('${uuidv4()}', '${kwabenId}','business_registration', 'pending',  'SMILEID-005', null)
    `);

    // ─── Wallets ────────────────────────────────────────────────────────────
    const amaraAfriWalletId = uuidv4();
    const amaraXghsWalletId = uuidv4();
    const kofiAfriWalletId  = uuidv4();
    const kofiXghsWalletId  = uuidv4();
    const akosuaAfriWalletId= uuidv4();
    const akosuaXghsWalletId= uuidv4();

    await qr.query(`
      INSERT INTO wallets (id, "userId", currency)
      VALUES
        ('${amaraAfriWalletId}', '${amaraId}',  'AFRi'),
        ('${amaraXghsWalletId}', '${amaraId}',  'xGHS'),
        ('${kofiAfriWalletId}',  '${kofiId}',   'AFRi'),
        ('${kofiXghsWalletId}',  '${kofiId}',   'xGHS'),
        ('${akosuaAfriWalletId}','${akosuaId}', 'AFRi'),
        ('${akosuaXghsWalletId}','${akosuaId}', 'xGHS')
    `);

    // ─── Ledger Events (balances via event sourcing) ─────────────────────────
    // Amara: 150 AFRi, 2500 xGHS
    // Kofi:  30 AFRi, 800 xGHS
    // Akosua business: 500 AFRi, 8250 xGHS
    const ledgerRows = [
      // Amara AFRi
      [amaraAfriWalletId, 'credit', '200.00000000', 'AFRi', 'funding',    'seed-amara-afri-fund-1'],
      [amaraAfriWalletId, 'debit',  '50.00000000',  'AFRi', 'transfer',   'seed-amara-afri-send-1'],
      // Amara xGHS
      [amaraXghsWalletId, 'credit', '3000.00000000','xGHS', 'funding',    'seed-amara-xghs-fund-1'],
      [amaraXghsWalletId, 'debit',  '500.00000000', 'xGHS', 'transfer',   'seed-amara-xghs-send-1'],
      // Kofi AFRi
      [kofiAfriWalletId, 'credit',  '30.00000000',  'AFRi', 'funding',    'seed-kofi-afri-fund-1'],
      // Kofi xGHS
      [kofiXghsWalletId, 'credit',  '1000.00000000','xGHS', 'funding',    'seed-kofi-xghs-fund-1'],
      [kofiXghsWalletId, 'debit',   '200.00000000', 'xGHS', 'conversion', 'seed-kofi-xghs-conv-1'],
      // Akosua business AFRi
      [akosuaAfriWalletId,'credit', '600.00000000', 'AFRi', 'collection', 'seed-akosua-afri-coll-1'],
      [akosuaAfriWalletId,'debit',  '100.00000000', 'AFRi', 'withdrawal', 'seed-akosua-afri-with-1'],
      // Akosua business xGHS
      [akosuaXghsWalletId,'credit', '9000.00000000','xGHS', 'collection', 'seed-akosua-xghs-coll-1'],
      [akosuaXghsWalletId,'debit',  '750.00000000', 'xGHS', 'withdrawal', 'seed-akosua-xghs-with-1'],
    ];

    for (const [walletId, type, amount, currency, refType, idempKey] of ledgerRows) {
      await qr.query(`
        INSERT INTO ledger_events (id, "walletId", type, amount, currency, "referenceType", "idempotencyKey")
        VALUES ('${uuidv4()}', '${walletId}', '${type}', '${amount}', '${currency}', '${refType}', '${idempKey}')
      `);
    }

    // ─── Transactions ────────────────────────────────────────────────────────
    const tx1 = uuidv4(); const tx2 = uuidv4(); const tx3 = uuidv4();
    const tx4 = uuidv4(); const tx5 = uuidv4(); const tx6 = uuidv4();
    const tx7 = uuidv4(); const tx8 = uuidv4(); const tx9 = uuidv4();
    const tx10 = uuidv4();

    await qr.query(`
      INSERT INTO transactions (id, "userId", type, status, amount, currency, fee, "amlStatus", "idempotencyKey", "settledAt", "createdAt")
      VALUES
        ('${tx1}',  '${amaraId}',  'funding',          'completed', '200.00000000', 'AFRi', '1.00000000', 'cleared',  'tx-seed-001', now() - interval '10 days', now() - interval '10 days'),
        ('${tx2}',  '${amaraId}',  'funding',          'completed', '3000.00000000','xGHS', '5.00000000', 'cleared',  'tx-seed-002', now() - interval '9 days',  now() - interval '9 days'),
        ('${tx3}',  '${amaraId}',  'transfer_sent',    'completed', '50.00000000',  'AFRi', '0.25000000', 'cleared',  'tx-seed-003', now() - interval '7 days',  now() - interval '7 days'),
        ('${tx4}',  '${kofiId}',   'transfer_received','completed', '50.00000000',  'AFRi', '0.00000000', 'cleared',  'tx-seed-004', now() - interval '7 days',  now() - interval '7 days'),
        ('${tx5}',  '${amaraId}',  'conversion',       'completed', '500.00000000', 'xGHS', '4.00000000', 'cleared',  'tx-seed-005', now() - interval '5 days',  now() - interval '5 days'),
        ('${tx6}',  '${kofiId}',   'funding',          'completed', '1000.00000000','xGHS', '2.00000000', 'cleared',  'tx-seed-006', now() - interval '8 days',  now() - interval '8 days'),
        ('${tx7}',  '${kofiId}',   'conversion',       'completed', '200.00000000', 'xGHS', '1.60000000', 'cleared',  'tx-seed-007', now() - interval '3 days',  now() - interval '3 days'),
        ('${tx8}',  '${akosuaId}', 'collection',       'completed', '600.00000000', 'AFRi', '3.00000000', 'cleared',  'tx-seed-008', now() - interval '6 days',  now() - interval '6 days'),
        ('${tx9}',  '${akosuaId}', 'withdrawal',       'completed', '100.00000000', 'AFRi', '0.50000000', 'cleared',  'tx-seed-009', now() - interval '2 days',  now() - interval '2 days'),
        ('${tx10}', '${amaraId}',  'transfer_sent',    'completed', '750.00000000', 'xGHS', '3.75000000', 'flagged',  'tx-seed-010', now() - interval '1 days',  now() - interval '1 days')
    `);

    // ─── AML Alerts (tx10 is flagged for demo) ───────────────────────────────
    await qr.query(`
      INSERT INTO aml_alerts (id, "transactionId", "userId", "ruleTriggered", amount, currency, status)
      VALUES
        ('${uuidv4()}', '${tx10}', '${amaraId}', 'VELOCITY_THRESHOLD_USD_500', '750.00000000', 'xGHS', 'pending')
    `);

    // ─── Savings Account ────────────────────────────────────────────────────
    await qr.query(`
      INSERT INTO savings_accounts (id, "userId", "walletId", label, "targetAmount")
      VALUES ('${uuidv4()}', '${amaraId}', '${amaraAfriWalletId}', 'Emergency Fund', '500.00000000')
    `);

    // ─── Payment Link (Akosua merchant demo) ─────────────────────────────────
    await qr.query(`
      INSERT INTO payment_links (id, "shortCode", "merchantWalletId", "merchantUserId", amount, currency, description, status, "expiresAt")
      VALUES ('${uuidv4()}', 'DEMO001234', '${akosuaXghsWalletId}', '${akosuaId}', '250.00000000', 'xGHS', 'Invoice #INV-2024-001', 'active', now() + interval '7 days')
    `);

    // ─── Reserve Reconciliation (7-day history) ──────────────────────────────
    for (let i = 6; i >= 0; i--) {
      const discrepancy = i === 2 ? '0.00150000' : '0.00002000';
      const withinTolerance = i !== 2;
      await qr.query(`
        INSERT INTO stablecoin_reserves (id, date, currency, "circulatingSupply", "goldOz", "goldPriceUsd", "reserveValueUsd", "backingRatioPct", "discrepancyPct", "withinTolerance")
        VALUES (
          '${uuidv4()}',
          (now() - interval '${i} days')::date,
          'AFRi',
          '150.00000000',
          '52.30000',
          '2340.50',
          '122406.15',
          '100.0200',
          '${discrepancy}',
          ${withinTolerance}
        )
      `);
    }

    // ─── Notifications ───────────────────────────────────────────────────────
    await qr.query(`
      INSERT INTO notifications (id, "userId", type, message, read, "actionUrl")
      VALUES
        ('${uuidv4()}', '${amaraId}', 'kyc_approved',       'Your identity verification was approved. You now have full access.', true, '/wallet'),
        ('${uuidv4()}', '${amaraId}', 'transfer_received',  'You received 50 AFRi from Kofi.', true, '/wallet'),
        ('${uuidv4()}', '${amaraId}', 'funding_complete',   'Your wallet was funded with 200 AFRi via Mobile Money.', true, '/wallet'),
        ('${uuidv4()}', '${kofiId}',  'transfer_received',  'You received 50 AFRi from Amara.', false, '/wallet'),
        ('${uuidv4()}', '${akosuaId}','payment_collected',  'Payment of 600 AFRi received for Invoice #INV-2024-001.', false, '/collections')
    `);

    await qr.commitTransaction();
    console.info('✅ Seed complete!');
    console.info('');
    console.info('Seed accounts:');
    console.info('  Individual (Tier 2): amara@example.com  / Password123!');
    console.info('  Individual (Tier 1): kofi@example.com   / Password123!');
    console.info('  Individual (Tier 0): yaa@example.com    / Password123!');
    console.info('  Business (approved): akosua@sme.com     / Password123!');
    console.info('  Business (pending):  kwaben@sme.com     / Password123!');
    console.info('  Admin:               admin@check12.com  / Admin@check12!');

  } catch (err) {
    await qr.rollbackTransaction();
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await qr.release();
    await AppDataSource.destroy();
  }
}

seed();
