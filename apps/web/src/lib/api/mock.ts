'use client';

// Self-contained in-memory backend for the Afrione prototype.
// Persists to localStorage so reloads keep your wallet state.

const STORAGE_KEY = 'afrione_mock_db_v1';

type Currency = 'AFRi' | 'xGHS';

export interface MockUser {
  id: string;
  phone: string;
  email: string;
  passwordHash: string;
  type: 'individual' | 'business';
  role: 'user' | 'business' | 'admin';
  tier: 0 | 1 | 2;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'requires_more_info';
  kybStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  phoneVerified: boolean;
  businessName?: string;
  registrationNumber?: string;
  createdAt: string;
}

interface Wallet {
  id: string;
  userId: string;
  currency: Currency;
  createdAt: string;
}

interface LedgerEvent {
  walletId: string;
  direction: 'credit' | 'debit';
  amount: number;
}

interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type:
    | 'funding'
    | 'withdrawal'
    | 'conversion'
    | 'transfer_sent'
    | 'transfer_received'
    | 'collection'
    | 'savings_deposit'
    | 'savings_withdrawal';
  status: 'pending' | 'completed' | 'failed';
  amount: string;
  currency: Currency;
  fee: string;
  counterpartyDisplay: string | null;
  amlStatus: 'clean' | 'flagged';
  settledAt: string | null;
  createdAt: string;
}

interface SavingsAccount {
  id: string;
  userId: string;
  label: string;
  targetAmount: string | null;
  balance: string;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

interface PaymentLink {
  id: string;
  userId: string;
  shortCode: string;
  amount: string;
  currency: Currency;
  description: string | null;
  status: 'active' | 'paid' | 'expired';
  expiresAt: string;
  paidAt: string | null;
}

interface KycDoc {
  id: string;
  userId: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt: string | null;
}

interface AmlAlert {
  id: string;
  transactionId: string;
  userId: string;
  ruleTriggered: string;
  amount: string;
  currency: Currency;
  status: 'pending' | 'cleared' | 'escalated';
  sarFiled: boolean;
  notes: string | null;
  createdAt: string;
}

interface ReserveRecord {
  id: string;
  date: string;
  currency: Currency;
  circulatingSupply: string;
  goldOz: string;
  goldPriceUsd: string;
  reserveValueUsd: string;
  backingRatioPct: string;
  discrepancyPct: string;
  withinTolerance: boolean;
}

interface Db {
  users: MockUser[];
  wallets: Wallet[];
  ledger: LedgerEvent[];
  transactions: Transaction[];
  savings: SavingsAccount[];
  notifications: Notification[];
  paymentLinks: PaymentLink[];
  kycDocs: KycDoc[];
  amlAlerts: AmlAlert[];
  reserves: ReserveRecord[];
  rateBase: number;
}

function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nowISO(): string {
  return new Date().toISOString();
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400_000).toISOString();
}

function shortCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function seed(): Db {
  const amara: MockUser = {
    id: uid(), phone: '+233244000001', email: 'amara@example.com',
    passwordHash: 'Password123!', type: 'individual', role: 'user', tier: 2,
    kycStatus: 'approved', kybStatus: 'not_started', phoneVerified: true,
    createdAt: daysAgo(60),
  };
  const kofi: MockUser = {
    id: uid(), phone: '+233244000002', email: 'kofi@example.com',
    passwordHash: 'Password123!', type: 'individual', role: 'user', tier: 1,
    kycStatus: 'pending', kybStatus: 'not_started', phoneVerified: true,
    createdAt: daysAgo(30),
  };
  const yaa: MockUser = {
    id: uid(), phone: '+233244000003', email: 'yaa@example.com',
    passwordHash: 'Password123!', type: 'individual', role: 'user', tier: 0,
    kycStatus: 'pending', kybStatus: 'not_started', phoneVerified: false,
    createdAt: daysAgo(2),
  };
  const akosua: MockUser = {
    id: uid(), phone: '+233244000004', email: 'akosua@sme.com',
    passwordHash: 'Password123!', type: 'business', role: 'business', tier: 2,
    kycStatus: 'approved', kybStatus: 'approved', phoneVerified: true,
    businessName: 'Akosua Textiles Ltd', registrationNumber: 'GH-BIZ-20241001',
    createdAt: daysAgo(45),
  };
  const kwaben: MockUser = {
    id: uid(), phone: '+233244000005', email: 'kwaben@sme.com',
    passwordHash: 'Password123!', type: 'business', role: 'business', tier: 0,
    kycStatus: 'pending', kybStatus: 'pending', phoneVerified: true,
    businessName: 'Kwaben Imports Co', registrationNumber: 'GH-BIZ-20241205',
    createdAt: daysAgo(10),
  };
  const admin: MockUser = {
    id: uid(), phone: '+233244000099', email: 'admin@afrione.com',
    passwordHash: 'Admin@afrione!', type: 'individual', role: 'admin', tier: 2,
    kycStatus: 'approved', kybStatus: 'not_started', phoneVerified: true,
    createdAt: daysAgo(90),
  };

  const users = [amara, kofi, yaa, akosua, kwaben, admin];

  const wallets: Wallet[] = [];
  const ledger: LedgerEvent[] = [];
  const transactions: Transaction[] = [];
  const notifications: Notification[] = [];

  for (const u of users) {
    for (const c of ['AFRi', 'xGHS'] as Currency[]) {
      const w: Wallet = { id: uid(), userId: u.id, currency: c, createdAt: u.createdAt };
      wallets.push(w);
    }
  }

  function walletFor(userId: string, currency: Currency): Wallet {
    return wallets.find((w) => w.userId === userId && w.currency === currency)!;
  }

  function fund(userId: string, currency: Currency, amount: number, when: string, label: string) {
    const w = walletFor(userId, currency);
    ledger.push({ walletId: w.id, direction: 'credit', amount });
    transactions.push({
      id: uid(), userId, walletId: w.id, type: 'funding', status: 'completed',
      amount: amount.toFixed(8), currency, fee: '0.00000000',
      counterpartyDisplay: label, amlStatus: 'clean',
      settledAt: when, createdAt: when,
    });
  }

  function transfer(
    fromId: string, toId: string, currency: Currency, amount: number, when: string,
  ) {
    const fromW = walletFor(fromId, currency);
    const toW = walletFor(toId, currency);
    const fee = Math.max(0.01, amount * 0.005);
    ledger.push({ walletId: fromW.id, direction: 'debit', amount: amount + fee });
    ledger.push({ walletId: toW.id, direction: 'credit', amount });
    const fromUser = users.find((u) => u.id === fromId)!;
    const toUser = users.find((u) => u.id === toId)!;
    const txn: Transaction = {
      id: uid(), userId: fromId, walletId: fromW.id, type: 'transfer_sent',
      status: 'completed', amount: amount.toFixed(8), currency, fee: fee.toFixed(8),
      counterpartyDisplay: toUser.email, amlStatus: 'clean',
      settledAt: when, createdAt: when,
    };
    transactions.push(txn);
    transactions.push({
      id: uid(), userId: toId, walletId: toW.id, type: 'transfer_received',
      status: 'completed', amount: amount.toFixed(8), currency, fee: '0.00000000',
      counterpartyDisplay: fromUser.email, amlStatus: 'clean',
      settledAt: when, createdAt: when,
    });
  }

  fund(amara.id, 'AFRi', 250, daysAgo(20), 'MTN Mobile Money');
  fund(amara.id, 'xGHS', 1500, daysAgo(15), 'MTN Mobile Money');
  fund(kofi.id, 'AFRi', 12, daysAgo(10), 'MTN Mobile Money');
  fund(kofi.id, 'xGHS', 80, daysAgo(8), 'Vodafone Cash');
  fund(akosua.id, 'AFRi', 800, daysAgo(25), 'Bank Transfer');
  fund(akosua.id, 'xGHS', 8000, daysAgo(20), 'Bank Transfer');
  fund(admin.id, 'AFRi', 50, daysAgo(30), 'Bank Transfer');

  transfer(amara.id, kofi.id, 'xGHS', 50, daysAgo(7));
  transfer(akosua.id, amara.id, 'AFRi', 25, daysAgo(5));
  transfer(amara.id, akosua.id, 'xGHS', 200, daysAgo(3));

  // Notifications
  notifications.push({
    id: uid(), userId: amara.id, type: 'transfer_received',
    message: 'You received 25 AFRi from akosua@sme.com', read: false,
    actionUrl: '/wallet/history', createdAt: daysAgo(5),
  });
  notifications.push({
    id: uid(), userId: amara.id, type: 'kyc_approved',
    message: 'Your KYC verification has been approved. You are now Tier 2.',
    read: true, actionUrl: '/kyc', createdAt: daysAgo(20),
  });
  notifications.push({
    id: uid(), userId: kofi.id, type: 'funding_complete',
    message: 'Wallet funded with 12 AFRi via MTN Mobile Money', read: false,
    actionUrl: '/wallet', createdAt: daysAgo(10),
  });
  notifications.push({
    id: uid(), userId: akosua.id, type: 'payment_collected',
    message: 'Customer paid 50 AFRi for invoice INV-001', read: false,
    actionUrl: '/collections', createdAt: daysAgo(2),
  });

  // Payment links (akosua business)
  const paymentLinks: PaymentLink[] = [
    {
      id: uid(), userId: akosua.id, shortCode: 'INV001', amount: '50.00000000',
      currency: 'AFRi', description: 'Invoice INV-001 — Cotton fabric order',
      status: 'paid', expiresAt: daysAgo(-10), paidAt: daysAgo(2),
    },
    {
      id: uid(), userId: akosua.id, shortCode: 'INV002', amount: '120.00000000',
      currency: 'AFRi', description: 'Invoice INV-002 — Wholesale order',
      status: 'active', expiresAt: daysAgo(-5), paidAt: null,
    },
    {
      id: uid(), userId: akosua.id, shortCode: 'INV003', amount: '800.00000000',
      currency: 'xGHS', description: 'Service fee — March', status: 'expired',
      expiresAt: daysAgo(3), paidAt: null,
    },
  ];

  // KYC docs
  const kycDocs: KycDoc[] = [
    { id: uid(), userId: amara.id, documentType: 'national_id', status: 'approved',
      submittedAt: daysAgo(45), reviewedAt: daysAgo(44) },
    { id: uid(), userId: amara.id, documentType: 'selfie', status: 'approved',
      submittedAt: daysAgo(45), reviewedAt: daysAgo(44) },
    { id: uid(), userId: kofi.id, documentType: 'national_id', status: 'pending',
      submittedAt: daysAgo(2), reviewedAt: null },
    { id: uid(), userId: akosua.id, documentType: 'business_registration', status: 'approved',
      submittedAt: daysAgo(40), reviewedAt: daysAgo(39) },
    { id: uid(), userId: akosua.id, documentType: 'director_id', status: 'approved',
      submittedAt: daysAgo(40), reviewedAt: daysAgo(39) },
    { id: uid(), userId: kwaben.id, documentType: 'business_registration', status: 'pending',
      submittedAt: daysAgo(5), reviewedAt: null },
  ];

  // AML alerts
  const amlAlerts: AmlAlert[] = [
    {
      id: uid(), transactionId: uid(), userId: kwaben.id,
      ruleTriggered: 'velocity_high_amount', amount: '4500.00000000', currency: 'xGHS',
      status: 'pending', sarFiled: false, notes: null, createdAt: daysAgo(1),
    },
    {
      id: uid(), transactionId: uid(), userId: kofi.id,
      ruleTriggered: 'unusual_pattern', amount: '750.00000000', currency: 'AFRi',
      status: 'pending', sarFiled: false, notes: null, createdAt: daysAgo(2),
    },
    {
      id: uid(), transactionId: uid(), userId: amara.id,
      ruleTriggered: 'sanctions_lookup', amount: '300.00000000', currency: 'AFRi',
      status: 'cleared', sarFiled: false, notes: 'Manual review — clean', createdAt: daysAgo(8),
    },
  ];

  // Reserve records (last 7 days)
  const reserves: ReserveRecord[] = [];
  const goldPrice = 2340.50;
  for (let i = 0; i < 7; i++) {
    const supply = 1500 + i * 35 + Math.random() * 50;
    const goldOz = supply / goldPrice * 1.001 + (Math.random() - 0.5) * 0.05;
    const reserveUsd = goldOz * goldPrice;
    const backing = (reserveUsd / supply) * 100;
    const discrepancy = (reserveUsd - supply) / supply;
    reserves.push({
      id: uid(),
      date: new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10),
      currency: 'AFRi',
      circulatingSupply: supply.toFixed(8),
      goldOz: goldOz.toFixed(4),
      goldPriceUsd: goldPrice.toFixed(2),
      reserveValueUsd: reserveUsd.toFixed(2),
      backingRatioPct: backing.toFixed(4),
      discrepancyPct: discrepancy.toFixed(6),
      withinTolerance: Math.abs(discrepancy) < 0.005,
    });
  }

  return {
    users, wallets, ledger, transactions,
    savings: [], notifications, paymentLinks, kycDocs, amlAlerts, reserves,
    rateBase: 16.5,
  };
}

let _db: Db | null = null;

function loadDb(): Db {
  if (typeof window === 'undefined') return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    /* fall through */
  }
  const fresh = seed();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function persist(): void {
  if (typeof window === 'undefined' || !_db) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(_db));
}

function db(): Db {
  if (!_db) _db = loadDb();
  return _db;
}

export function resetMockDb(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  _db = null;
}

// ─── Auth tokens (stub JWTs — JSON-encoded { userId, exp }) ────────────────

export function makeToken(userId: string, ttlSec: number): string {
  return btoa(JSON.stringify({ userId, exp: Math.floor(Date.now() / 1000) + ttlSec }));
}

export function decodeToken(token: string | null | undefined): { userId: string; exp: number } | null {
  if (!token) return null;
  try {
    const obj = JSON.parse(atob(token));
    if (typeof obj.userId !== 'string' || typeof obj.exp !== 'number') return null;
    if (obj.exp * 1000 < Date.now()) return null;
    return obj;
  } catch {
    return null;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function balanceOf(walletId: string): number {
  const events = db().ledger.filter((e) => e.walletId === walletId);
  return events.reduce(
    (acc, e) => (e.direction === 'credit' ? acc + e.amount : acc - e.amount),
    0,
  );
}

function walletByCurrency(userId: string, currency: Currency): Wallet | undefined {
  return db().wallets.find((w) => w.userId === userId && w.currency === currency);
}

function userPublic(u: MockUser) {
  const { passwordHash: _ph, ...rest } = u;
  return rest;
}

function pendingKycCount(): number {
  return db().kycDocs.filter((d) => d.status === 'pending').length;
}

function pendingAmlCount(): number {
  return db().amlAlerts.filter((a) => a.status === 'pending').length;
}

class MockHttpError extends Error {
  response: { status: number; data: { detail: string; message: string } };
  constructor(status: number, detail: string) {
    super(detail);
    this.response = { status, data: { detail, message: detail } };
  }
}

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireUser(authUserId: string | null): MockUser {
  if (!authUserId) throw new MockHttpError(401, 'Authentication required');
  const u = db().users.find((x) => x.id === authUserId);
  if (!u) throw new MockHttpError(401, 'User not found');
  return u;
}

function requireAdmin(authUserId: string | null): MockUser {
  const u = requireUser(authUserId);
  if (u.role !== 'admin') throw new MockHttpError(403, 'Admin access required');
  return u;
}

// ─── Route table ───────────────────────────────────────────────────────────

interface MockResponse {
  data: unknown;
}

export async function handleRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',
  fullPath: string,
  body: Record<string, unknown> | undefined,
  authUserId: string | null,
): Promise<MockResponse> {
  await delay(120 + Math.random() * 180);

  const [path, qs] = fullPath.split('?');
  const query = new URLSearchParams(qs ?? '');
  const m = method.toUpperCase();

  // ── auth ────────────────────────────────────────────────────────────────
  if (m === 'POST' && path === '/auth/register') return register(body as any);
  if (m === 'POST' && path === '/auth/verify-phone') return verifyPhone(body as any);
  if (m === 'POST' && path === '/auth/resend-otp') return { data: { sent: true } };
  if (m === 'POST' && path === '/auth/login') return login(body as any);
  if (m === 'POST' && path === '/auth/verify-mfa') return verifyMfa(body as any);
  if (m === 'POST' && path === '/auth/logout') return { data: { loggedOut: true } };
  if (m === 'POST' && path === '/auth/refresh') return refreshSession(body as any);

  // ── users ───────────────────────────────────────────────────────────────
  if (m === 'GET' && path === '/users/me') return { data: userPublic(requireUser(authUserId)) };

  // ── wallets ─────────────────────────────────────────────────────────────
  if (m === 'GET' && path === '/wallets/dashboard') return walletDashboard(authUserId);
  if (m === 'GET' && path === '/wallets') return walletsList(authUserId);

  // ── transactions ────────────────────────────────────────────────────────
  if (m === 'GET' && path === '/transactions') return transactionsList(authUserId, query);

  // ── funding ─────────────────────────────────────────────────────────────
  if (m === 'POST' && path === '/funding/onramp') return funding(authUserId, body as any);

  // ── stablecoin ──────────────────────────────────────────────────────────
  if (m === 'GET' && path === '/stablecoin/rate') return rate();
  if (m === 'POST' && path === '/stablecoin/preview') return convertPreview(body as any);
  if (m === 'POST' && path === '/stablecoin/convert') return convert(authUserId, body as any);

  // ── transfers ───────────────────────────────────────────────────────────
  if (m === 'POST' && path === '/transfers/lookup') return lookupRecipient(authUserId, body as any);
  if (m === 'POST' && path === '/transfers/send') return sendTransfer(authUserId, body as any);
  if (m === 'POST' && path === '/transfers/send-external') return sendExternal(authUserId, body as any);

  // ── kyc / kyb ──────────────────────────────────────────────────────────
  if (m === 'GET' && path === '/kyc/status') return kycStatus(authUserId);
  if (m === 'POST' && path === '/kyc/submit') return kycSubmit(authUserId, body as any);
  if (m === 'GET' && path === '/kyb/status') return kybStatus(authUserId);
  if (m === 'POST' && path === '/kyb/submit') return kybSubmit(authUserId, body as any);

  // ── savings ─────────────────────────────────────────────────────────────
  if (m === 'GET' && path === '/savings') return savingsList(authUserId);
  if (m === 'POST' && path === '/savings') return savingsCreate(authUserId, body as any);
  if (m === 'POST' && path === '/savings/deposit') return savingsDeposit(authUserId, body as any);
  if (m === 'POST' && path === '/savings/withdraw') return savingsWithdraw(authUserId, body as any);

  // ── notifications ───────────────────────────────────────────────────────
  if (m === 'GET' && path === '/notifications') return notificationsList(authUserId);
  if (m === 'POST' && path === '/notifications/read-all') return notificationsReadAll(authUserId);
  {
    const match = path.match(/^\/notifications\/([^/]+)\/read$/);
    if (m === 'PATCH' && match) return notificationMarkRead(authUserId, match[1]);
  }

  // ── collections ─────────────────────────────────────────────────────────
  if (m === 'GET' && path === '/collections/links') return paymentLinksList(authUserId);
  if (m === 'POST' && path === '/collections/links') return createPaymentLink(authUserId, body as any);
  if (m === 'POST' && path === '/collections/pay') return payPaymentLink(body as any);
  {
    const match = path.match(/^\/collections\/links\/([^/]+)$/);
    if (m === 'GET' && match) return paymentLinkInfo(match[1]);
  }

  // ── admin ───────────────────────────────────────────────────────────────
  if (m === 'GET' && path === '/admin/metrics') return adminMetrics(authUserId);
  if (m === 'GET' && path === '/admin/kyc-queue') return adminKycQueue(authUserId);
  if (m === 'GET' && path === '/admin/aml-alerts') return adminAmlAlerts(authUserId, query);
  if (m === 'GET' && path === '/admin/reserves') return adminReserves(authUserId);
  {
    const kycReview = path.match(/^\/admin\/kyc\/([^/]+)\/review$/);
    if (m === 'POST' && kycReview) return adminKycReview(authUserId, kycReview[1], body as any);
    const amlReview = path.match(/^\/admin\/aml-alerts\/([^/]+)\/review$/);
    if (m === 'POST' && amlReview) return adminAmlReview(authUserId, amlReview[1], body as any);
  }

  throw new MockHttpError(404, `Mock route not implemented: ${m} ${path}`);
}

// ─── Auth handlers ─────────────────────────────────────────────────────────

function register(body: { phone: string; email: string; password: string; accountType: 'individual' | 'business'; businessName?: string; registrationNumber?: string }): MockResponse {
  const d = db();
  if (d.users.find((u) => u.email === body.email)) {
    throw new MockHttpError(409, 'An account with this email already exists');
  }
  if (d.users.find((u) => u.phone === body.phone)) {
    throw new MockHttpError(409, 'An account with this phone already exists');
  }
  const newUser: MockUser = {
    id: uid(),
    phone: body.phone,
    email: body.email,
    passwordHash: body.password,
    type: body.accountType,
    role: body.accountType === 'business' ? 'business' : 'user',
    tier: 0,
    kycStatus: 'pending',
    kybStatus: body.accountType === 'business' ? 'pending' : 'not_started',
    phoneVerified: false,
    businessName: body.businessName,
    registrationNumber: body.registrationNumber,
    createdAt: nowISO(),
  };
  d.users.push(newUser);
  for (const c of ['AFRi', 'xGHS'] as Currency[]) {
    d.wallets.push({ id: uid(), userId: newUser.id, currency: c, createdAt: nowISO() });
  }
  persist();
  return { data: { userId: newUser.id, message: 'Account created. Check your phone for the verification code.' } };
}

function verifyPhone(body: { phone: string; otp: string }): MockResponse {
  if (!/^\d{6}$/.test(body.otp)) throw new MockHttpError(400, 'OTP must be 6 digits');
  const d = db();
  const user = d.users.find((u) => u.phone === body.phone);
  if (!user) throw new MockHttpError(404, 'No account with that phone');
  user.phoneVerified = true;
  persist();
  return { data: { verified: true } };
}

function login(body: { identifier: string; password: string }): MockResponse {
  const d = db();
  const user = d.users.find((u) => u.email === body.identifier || u.phone === body.identifier);
  if (!user || user.passwordHash !== body.password) {
    throw new MockHttpError(401, 'Invalid credentials');
  }
  // No MFA in prototype — skip directly to tokens
  return {
    data: {
      requiresMfa: false,
      newDevice: false,
      accessToken: makeToken(user.id, 60 * 60),
      refreshToken: makeToken(user.id, 60 * 60 * 24 * 7),
    },
  };
}

function verifyMfa(body: { mfaToken: string; code: string }): MockResponse {
  const decoded = decodeToken(body.mfaToken);
  if (!decoded) throw new MockHttpError(401, 'MFA token expired');
  if (!/^\d{6}$/.test(body.code)) throw new MockHttpError(400, 'Invalid code');
  return {
    data: {
      newDevice: false,
      accessToken: makeToken(decoded.userId, 60 * 60),
      refreshToken: makeToken(decoded.userId, 60 * 60 * 24 * 7),
    },
  };
}

function refreshSession(body: { refreshToken: string }): MockResponse {
  const decoded = decodeToken(body.refreshToken);
  if (!decoded) throw new MockHttpError(401, 'Refresh token expired');
  return {
    data: {
      accessToken: makeToken(decoded.userId, 60 * 60),
      refreshToken: makeToken(decoded.userId, 60 * 60 * 24 * 7),
    },
  };
}

// ─── Wallet handlers ───────────────────────────────────────────────────────

function walletDashboard(authUserId: string | null): MockResponse {
  const u = requireUser(authUserId);
  const wallets = db().wallets
    .filter((w) => w.userId === u.id)
    .map((w) => ({
      id: w.id,
      currency: w.currency,
      balance: balanceOf(w.id).toFixed(8),
      createdAt: w.createdAt,
    }));
  const recentTransactions = db().transactions
    .filter((t) => t.userId === u.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  return { data: { wallets, recentTransactions } };
}

function walletsList(authUserId: string | null): MockResponse {
  const u = requireUser(authUserId);
  const wallets = db().wallets
    .filter((w) => w.userId === u.id)
    .map((w) => ({
      id: w.id,
      currency: w.currency,
      balance: balanceOf(w.id).toFixed(8),
      createdAt: w.createdAt,
    }));
  return { data: wallets };
}

function transactionsList(authUserId: string | null, query: URLSearchParams): MockResponse {
  const u = requireUser(authUserId);
  const page = parseInt(query.get('page') ?? '1', 10);
  const limit = Math.min(parseInt(query.get('limit') ?? '20', 10), 100);
  const currencyFilter = query.get('currency');
  const typeFilter = query.get('type');

  let txns = db().transactions
    .filter((t) => t.userId === u.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (currencyFilter) txns = txns.filter((t) => t.currency === currencyFilter);
  if (typeFilter) txns = txns.filter((t) => t.type === typeFilter);

  const total = txns.length;
  const start = (page - 1) * limit;
  const slice = txns.slice(start, start + limit);

  return {
    data: {
      transactions: slice,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    },
  };
}

// ─── Funding ───────────────────────────────────────────────────────────────

function funding(
  authUserId: string | null,
  body: { currency: Currency; amount: string; provider: string; momoPhone?: string },
): MockResponse {
  const u = requireUser(authUserId);
  const amount = parseFloat(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new MockHttpError(400, 'Amount must be positive');
  }
  if (body.momoPhone && body.momoPhone.endsWith('000')) {
    throw new MockHttpError(402, 'Mobile money provider declined the payment');
  }
  const fee = amount * 0.005;
  const net = amount - fee;
  const wallet = walletByCurrency(u.id, body.currency);
  if (!wallet) throw new MockHttpError(404, 'Wallet not found');

  db().ledger.push({ walletId: wallet.id, direction: 'credit', amount: net });
  const txn: Transaction = {
    id: uid(), userId: u.id, walletId: wallet.id, type: 'funding',
    status: 'completed', amount: net.toFixed(8), currency: body.currency,
    fee: fee.toFixed(8), counterpartyDisplay: providerLabel(body.provider),
    amlStatus: 'clean', settledAt: nowISO(), createdAt: nowISO(),
  };
  db().transactions.push(txn);

  db().notifications.unshift({
    id: uid(), userId: u.id, type: 'funding_complete',
    message: `Wallet funded with ${net.toFixed(2)} ${body.currency} via ${providerLabel(body.provider)}`,
    read: false, actionUrl: '/wallet', createdAt: nowISO(),
  });

  persist();
  return {
    data: {
      amount: net.toFixed(8),
      fee: fee.toFixed(8),
      newBalance: balanceOf(wallet.id).toFixed(8),
      currency: body.currency,
    },
  };
}

function providerLabel(p: string): string {
  switch (p) {
    case 'momo_mtn': return 'MTN Mobile Money';
    case 'momo_vodafone': return 'Vodafone Cash';
    case 'momo_airteltigo': return 'AirtelTigo Money';
    case 'bank_transfer': return 'Bank Transfer';
    default: return p;
  }
}

// ─── Stablecoin / convert ──────────────────────────────────────────────────

function currentRate(): number {
  // Add small drift over time
  const drift = (Math.sin(Date.now() / 60_000) * 0.002);
  return db().rateBase * (1 + drift);
}

function rate(): MockResponse {
  const r = currentRate();
  return {
    data: {
      AFRi_to_xGHS: r,
      xGHS_to_AFRi: 1 / r,
      updatedAt: nowISO(),
    },
  };
}

function convertPreview(body: { direction: 'AFRi_to_xGHS' | 'xGHS_to_AFRi'; amount: string }): MockResponse {
  const amount = parseFloat(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new MockHttpError(400, 'Invalid amount');
  const r = body.direction === 'AFRi_to_xGHS' ? currentRate() : 1 / currentRate();
  const toAmount = amount * r;
  const fee = toAmount * 0.008;
  const net = toAmount - fee;
  const fromCurrency: Currency = body.direction === 'AFRi_to_xGHS' ? 'AFRi' : 'xGHS';
  const toCurrency: Currency = body.direction === 'AFRi_to_xGHS' ? 'xGHS' : 'AFRi';
  return {
    data: {
      from: { amount: amount.toFixed(8), currency: fromCurrency },
      to: { amount: net.toFixed(8), currency: toCurrency },
      rate: r.toFixed(8),
      fee: fee.toFixed(8),
      feeCurrency: toCurrency,
    },
  };
}

function convert(
  authUserId: string | null,
  body: { direction: 'AFRi_to_xGHS' | 'xGHS_to_AFRi'; amount: string },
): MockResponse {
  const u = requireUser(authUserId);
  const amount = parseFloat(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new MockHttpError(400, 'Invalid amount');
  const fromCurrency: Currency = body.direction === 'AFRi_to_xGHS' ? 'AFRi' : 'xGHS';
  const toCurrency: Currency = body.direction === 'AFRi_to_xGHS' ? 'xGHS' : 'AFRi';
  const fromWallet = walletByCurrency(u.id, fromCurrency)!;
  const toWallet = walletByCurrency(u.id, toCurrency)!;
  if (balanceOf(fromWallet.id) < amount) {
    throw new MockHttpError(400, `Insufficient ${fromCurrency} balance`);
  }
  const r = body.direction === 'AFRi_to_xGHS' ? currentRate() : 1 / currentRate();
  const gross = amount * r;
  const fee = gross * 0.008;
  const net = gross - fee;

  db().ledger.push({ walletId: fromWallet.id, direction: 'debit', amount });
  db().ledger.push({ walletId: toWallet.id, direction: 'credit', amount: net });

  const txnId = uid();
  db().transactions.push({
    id: txnId, userId: u.id, walletId: fromWallet.id, type: 'conversion',
    status: 'completed', amount: amount.toFixed(8), currency: fromCurrency,
    fee: fee.toFixed(8), counterpartyDisplay: `→ ${toCurrency}`,
    amlStatus: 'clean', settledAt: nowISO(), createdAt: nowISO(),
  });
  db().notifications.unshift({
    id: uid(), userId: u.id, type: 'conversion_complete',
    message: `Converted ${amount.toFixed(2)} ${fromCurrency} → ${net.toFixed(2)} ${toCurrency}`,
    read: false, actionUrl: '/wallet', createdAt: nowISO(),
  });
  persist();
  return {
    data: {
      transactionId: txnId,
      from: { amount: amount.toFixed(8), currency: fromCurrency },
      to: { amount: net.toFixed(8), currency: toCurrency },
      fee: fee.toFixed(8),
    },
  };
}

// ─── Transfers ─────────────────────────────────────────────────────────────

function lookupRecipient(authUserId: string | null, body: { identifier: string }): MockResponse {
  const u = requireUser(authUserId);
  const target = db().users.find((x) => x.email === body.identifier || x.phone === body.identifier);
  if (!target) throw new MockHttpError(404, 'Recipient not found');
  if (target.id === u.id) throw new MockHttpError(400, 'Cannot send to yourself');
  return {
    data: {
      userId: target.id,
      displayName: target.email,
      phone: target.phone,
      tier: target.tier,
    },
  };
}

function sendTransfer(
  authUserId: string | null,
  body: { recipientIdentifier: string; currency: Currency; amount: string; note?: string },
): MockResponse {
  const sender = requireUser(authUserId);
  const recipient = db().users.find(
    (x) => x.email === body.recipientIdentifier || x.phone === body.recipientIdentifier,
  );
  if (!recipient) throw new MockHttpError(404, 'Recipient not found');
  if (recipient.id === sender.id) throw new MockHttpError(400, 'Cannot send to yourself');

  const amount = parseFloat(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new MockHttpError(400, 'Invalid amount');

  const fee = Math.max(0.01, amount * 0.005);
  const total = amount + fee;
  const senderWallet = walletByCurrency(sender.id, body.currency)!;
  const recipientWallet = walletByCurrency(recipient.id, body.currency)!;
  if (balanceOf(senderWallet.id) < total) {
    throw new MockHttpError(400, `Insufficient balance. Need ${total.toFixed(2)} ${body.currency}`);
  }

  // AML flagging: large transfers
  const flagThreshold = body.currency === 'AFRi' ? 1000 : 16500;
  const flagged = amount >= flagThreshold;

  db().ledger.push({ walletId: senderWallet.id, direction: 'debit', amount: total });
  db().ledger.push({ walletId: recipientWallet.id, direction: 'credit', amount });

  const txnId = uid();
  db().transactions.push({
    id: txnId, userId: sender.id, walletId: senderWallet.id, type: 'transfer_sent',
    status: 'completed', amount: amount.toFixed(8), currency: body.currency,
    fee: fee.toFixed(8), counterpartyDisplay: recipient.email,
    amlStatus: flagged ? 'flagged' : 'clean',
    settledAt: nowISO(), createdAt: nowISO(),
  });
  db().transactions.push({
    id: uid(), userId: recipient.id, walletId: recipientWallet.id, type: 'transfer_received',
    status: 'completed', amount: amount.toFixed(8), currency: body.currency,
    fee: '0.00000000', counterpartyDisplay: sender.email,
    amlStatus: flagged ? 'flagged' : 'clean',
    settledAt: nowISO(), createdAt: nowISO(),
  });

  if (flagged) {
    db().amlAlerts.unshift({
      id: uid(), transactionId: txnId, userId: sender.id,
      ruleTriggered: 'high_value_transfer', amount: amount.toFixed(8),
      currency: body.currency, status: 'pending', sarFiled: false,
      notes: null, createdAt: nowISO(),
    });
  }

  db().notifications.unshift({
    id: uid(), userId: recipient.id, type: 'transfer_received',
    message: `You received ${amount.toFixed(2)} ${body.currency} from ${sender.email}`,
    read: false, actionUrl: '/wallet/history', createdAt: nowISO(),
  });

  persist();
  return {
    data: {
      transactionId: txnId,
      amount: amount.toFixed(8),
      fee: fee.toFixed(8),
      currency: body.currency,
      newBalance: balanceOf(senderWallet.id).toFixed(8),
      amlStatus: flagged ? 'flagged' : 'clean',
    },
  };
}

function sendExternal(
  authUserId: string | null,
  body: {
    currency: Currency;
    amount: string;
    destType: 'momo' | 'bank';
    momoNetwork?: string;
    momoPhone?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    note?: string;
  },
): MockResponse {
  const u = requireUser(authUserId);
  const amount = parseFloat(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new MockHttpError(400, 'Invalid amount');

  const fee = Math.max(0.01, amount * 0.005);
  const total = amount + fee;
  const wallet = walletByCurrency(u.id, body.currency);
  if (!wallet) throw new MockHttpError(404, 'Wallet not found');
  if (balanceOf(wallet.id) < total) {
    throw new MockHttpError(400, `Insufficient balance. Need ${total.toFixed(2)} ${body.currency}`);
  }

  if (body.destType === 'momo' && body.momoPhone?.endsWith('000')) {
    throw new MockHttpError(402, 'Mobile money provider declined the transaction');
  }

  const counterparty =
    body.destType === 'momo'
      ? `${body.momoPhone} (${providerLabel(body.momoNetwork ?? '')})`
      : `${body.accountName} — ${body.bankName} ${body.accountNumber}`;

  const flagThreshold = body.currency === 'AFRi' ? 1000 : 16500;
  const flagged = amount >= flagThreshold;

  db().ledger.push({ walletId: wallet.id, direction: 'debit', amount: total });

  const txnId = uid();
  db().transactions.push({
    id: txnId, userId: u.id, walletId: wallet.id, type: 'withdrawal',
    status: 'completed', amount: amount.toFixed(8), currency: body.currency,
    fee: fee.toFixed(8), counterpartyDisplay: counterparty,
    amlStatus: flagged ? 'flagged' : 'clean',
    settledAt: nowISO(), createdAt: nowISO(),
  });

  persist();
  return {
    data: {
      transactionId: txnId,
      amount: amount.toFixed(8),
      fee: fee.toFixed(8),
      currency: body.currency,
      newBalance: balanceOf(wallet.id).toFixed(8),
      amlStatus: flagged ? 'flagged' : 'clean',
      counterparty,
    },
  };
}

// ─── KYC / KYB ────────────────────────────────────────────────────────────

function kycStatus(authUserId: string | null): MockResponse {
  const u = requireUser(authUserId);
  const docs = db().kycDocs
    .filter((d) => d.userId === u.id)
    .map((d) => ({
      id: d.id, documentType: d.documentType, status: d.status, submittedAt: d.submittedAt,
    }));
  const approvedTypes = new Set(docs.filter((d) => d.status === 'approved').map((d) => d.documentType));
  const tier1Met = approvedTypes.has('national_id') || approvedTypes.has('passport') || approvedTypes.has('drivers_license');
  const tier2Met = tier1Met && approvedTypes.has('selfie');
  const newTier: 0 | 1 | 2 = tier2Met ? 2 : tier1Met ? 1 : 0;
  if (u.tier !== newTier) {
    u.tier = newTier;
    persist();
  }
  return {
    data: {
      tier: newTier,
      kycStatus: u.kycStatus,
      documents: docs,
      nextStep: !tier1Met
        ? 'Submit a primary ID (national ID, passport, or driver\'s licence)'
        : !tier2Met
          ? 'Submit a selfie / liveness photo to reach Tier 2'
          : null,
      tierRequirements: {
        tier1: { met: tier1Met, requirement: 'Primary ID document approved' },
        tier2: { met: tier2Met, requirement: 'Primary ID + selfie approved' },
      },
    },
  };
}

function kycSubmit(authUserId: string | null, body: { documentType: string }): MockResponse {
  const u = requireUser(authUserId);
  const existing = db().kycDocs.find((d) => d.userId === u.id && d.documentType === body.documentType);
  if (existing && existing.status === 'approved') {
    throw new MockHttpError(409, 'Document already approved');
  }
  // Auto-approve in prototype
  if (existing) {
    existing.status = 'approved';
    existing.reviewedAt = nowISO();
  } else {
    db().kycDocs.push({
      id: uid(), userId: u.id, documentType: body.documentType,
      status: 'approved', submittedAt: nowISO(), reviewedAt: nowISO(),
    });
  }
  // Recompute tier
  const docs = db().kycDocs.filter((d) => d.userId === u.id && d.status === 'approved');
  const approved = new Set(docs.map((d) => d.documentType));
  const tier1 = approved.has('national_id') || approved.has('passport') || approved.has('drivers_license');
  const tier2 = tier1 && approved.has('selfie');
  u.tier = tier2 ? 2 : tier1 ? 1 : 0;
  if (tier1) u.kycStatus = 'approved';
  persist();
  return { data: { message: `Document submitted and auto-approved (prototype). Tier ${u.tier} unlocked.` } };
}

function kybStatus(authUserId: string | null): MockResponse {
  const u = requireUser(authUserId);
  const docs = db().kycDocs.filter((d) => d.userId === u.id);
  const businessReg = docs.find((d) => d.documentType === 'business_registration');
  const directorId = docs.find((d) => d.documentType === 'director_id');
  return {
    data: {
      kybStatus: u.kybStatus,
      businessName: u.businessName ?? '',
      requirements: {
        businessRegistration: {
          met: businessReg?.status === 'approved',
          requirement: 'Certificate of incorporation approved',
        },
        directorId: {
          met: directorId?.status === 'approved',
          requirement: 'Director ID approved',
        },
      },
    },
  };
}

function kybSubmit(authUserId: string | null, body: { documentType: string }): MockResponse {
  const u = requireUser(authUserId);
  if (u.type !== 'business') throw new MockHttpError(400, 'Not a business account');
  const existing = db().kycDocs.find((d) => d.userId === u.id && d.documentType === body.documentType);
  if (existing) {
    existing.status = 'approved';
    existing.reviewedAt = nowISO();
  } else {
    db().kycDocs.push({
      id: uid(), userId: u.id, documentType: body.documentType,
      status: 'approved', submittedAt: nowISO(), reviewedAt: nowISO(),
    });
  }
  const docs = db().kycDocs.filter((d) => d.userId === u.id && d.status === 'approved');
  const approved = new Set(docs.map((d) => d.documentType));
  if (approved.has('business_registration') && approved.has('director_id')) {
    u.kybStatus = 'approved';
  }
  persist();
  return { data: { message: 'Business document submitted and auto-approved (prototype).' } };
}

// ─── Savings ──────────────────────────────────────────────────────────────

function savingsList(authUserId: string | null): MockResponse {
  const u = requireUser(authUserId);
  return { data: db().savings.filter((s) => s.userId === u.id) };
}

function savingsCreate(
  authUserId: string | null,
  body: { label: string; targetAmount?: string },
): MockResponse {
  const u = requireUser(authUserId);
  if (!body.label?.trim()) throw new MockHttpError(400, 'Label required');
  const acct: SavingsAccount = {
    id: uid(), userId: u.id, label: body.label,
    targetAmount: body.targetAmount ? parseFloat(body.targetAmount).toFixed(8) : null,
    balance: '0.00000000', createdAt: nowISO(),
  };
  db().savings.push(acct);
  persist();
  return { data: acct };
}

function savingsDeposit(
  authUserId: string | null,
  body: { savingsAccountId: string; amount: string },
): MockResponse {
  const u = requireUser(authUserId);
  const acct = db().savings.find((s) => s.id === body.savingsAccountId && s.userId === u.id);
  if (!acct) throw new MockHttpError(404, 'Savings account not found');
  const amount = parseFloat(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new MockHttpError(400, 'Invalid amount');

  const wallet = walletByCurrency(u.id, 'AFRi')!;
  if (balanceOf(wallet.id) < amount) throw new MockHttpError(400, 'Insufficient AFRi balance');

  db().ledger.push({ walletId: wallet.id, direction: 'debit', amount });
  acct.balance = (parseFloat(acct.balance) + amount).toFixed(8);
  db().transactions.push({
    id: uid(), userId: u.id, walletId: wallet.id, type: 'savings_deposit',
    status: 'completed', amount: amount.toFixed(8), currency: 'AFRi',
    fee: '0.00000000', counterpartyDisplay: acct.label,
    amlStatus: 'clean', settledAt: nowISO(), createdAt: nowISO(),
  });
  persist();
  return { data: { newBalance: acct.balance } };
}

function savingsWithdraw(
  authUserId: string | null,
  body: { savingsAccountId: string; amount: string },
): MockResponse {
  const u = requireUser(authUserId);
  const acct = db().savings.find((s) => s.id === body.savingsAccountId && s.userId === u.id);
  if (!acct) throw new MockHttpError(404, 'Savings account not found');
  const amount = parseFloat(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new MockHttpError(400, 'Invalid amount');
  if (parseFloat(acct.balance) < amount) throw new MockHttpError(400, 'Insufficient savings balance');

  const wallet = walletByCurrency(u.id, 'AFRi')!;
  acct.balance = (parseFloat(acct.balance) - amount).toFixed(8);
  db().ledger.push({ walletId: wallet.id, direction: 'credit', amount });
  db().transactions.push({
    id: uid(), userId: u.id, walletId: wallet.id, type: 'savings_withdrawal',
    status: 'completed', amount: amount.toFixed(8), currency: 'AFRi',
    fee: '0.00000000', counterpartyDisplay: acct.label,
    amlStatus: 'clean', settledAt: nowISO(), createdAt: nowISO(),
  });
  persist();
  return { data: { newBalance: acct.balance } };
}

// ─── Notifications ────────────────────────────────────────────────────────

function notificationsList(authUserId: string | null): MockResponse {
  const u = requireUser(authUserId);
  const list = db().notifications
    .filter((n) => n.userId === u.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    data: {
      notifications: list,
      unreadCount: list.filter((n) => !n.read).length,
    },
  };
}

function notificationMarkRead(authUserId: string | null, id: string): MockResponse {
  const u = requireUser(authUserId);
  const n = db().notifications.find((x) => x.id === id && x.userId === u.id);
  if (!n) throw new MockHttpError(404, 'Notification not found');
  n.read = true;
  persist();
  return { data: { read: true } };
}

function notificationsReadAll(authUserId: string | null): MockResponse {
  const u = requireUser(authUserId);
  for (const n of db().notifications) {
    if (n.userId === u.id) n.read = true;
  }
  persist();
  return { data: { read: true } };
}

// ─── Collections ──────────────────────────────────────────────────────────

function paymentLinksList(authUserId: string | null): MockResponse {
  const u = requireUser(authUserId);
  const links = db().paymentLinks
    .filter((l) => l.userId === u.id)
    .map((l) => ({ ...l, paymentUrl: `/pay/${l.shortCode}` }));
  return { data: links };
}

function createPaymentLink(
  authUserId: string | null,
  body: { amount: string; currency: Currency; description?: string; expiresInHours: number },
): MockResponse {
  const u = requireUser(authUserId);
  const amount = parseFloat(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new MockHttpError(400, 'Invalid amount');
  const link: PaymentLink = {
    id: uid(), userId: u.id, shortCode: shortCode(),
    amount: amount.toFixed(8), currency: body.currency,
    description: body.description?.trim() || null,
    status: 'active',
    expiresAt: new Date(Date.now() + body.expiresInHours * 3600_000).toISOString(),
    paidAt: null,
  };
  db().paymentLinks.push(link);
  persist();
  return { data: { ...link, paymentUrl: `/pay/${link.shortCode}` } };
}

function paymentLinkInfo(shortCodeArg: string): MockResponse {
  const link = db().paymentLinks.find((l) => l.shortCode === shortCodeArg);
  if (!link) throw new MockHttpError(404, 'Payment link not found');
  if (link.status === 'expired' || new Date(link.expiresAt).getTime() < Date.now()) {
    throw new MockHttpError(410, 'Payment link expired');
  }
  if (link.status === 'paid') throw new MockHttpError(409, 'Payment link already used');
  return {
    data: {
      shortCode: link.shortCode,
      amount: link.amount,
      currency: link.currency,
      description: link.description,
      expiresAt: link.expiresAt,
    },
  };
}

function payPaymentLink(body: { shortCode: string; momoPhone: string; payerReference?: string }): MockResponse {
  const link = db().paymentLinks.find((l) => l.shortCode === body.shortCode);
  if (!link) throw new MockHttpError(404, 'Payment link not found');
  if (link.status !== 'active') throw new MockHttpError(409, 'Payment link not available');
  if (body.momoPhone?.endsWith('000')) throw new MockHttpError(402, 'Mobile money declined');

  const merchant = db().users.find((u) => u.id === link.userId);
  if (!merchant) throw new MockHttpError(404, 'Merchant not found');
  const wallet = walletByCurrency(merchant.id, link.currency)!;
  const amount = parseFloat(link.amount);
  db().ledger.push({ walletId: wallet.id, direction: 'credit', amount });
  link.status = 'paid';
  link.paidAt = nowISO();
  db().transactions.push({
    id: uid(), userId: merchant.id, walletId: wallet.id, type: 'collection',
    status: 'completed', amount: amount.toFixed(8), currency: link.currency,
    fee: '0.00000000',
    counterpartyDisplay: body.payerReference || body.momoPhone,
    amlStatus: 'clean', settledAt: nowISO(), createdAt: nowISO(),
  });
  db().notifications.unshift({
    id: uid(), userId: merchant.id, type: 'payment_collected',
    message: `Customer paid ${amount.toFixed(2)} ${link.currency}${
      body.payerReference ? ` (ref: ${body.payerReference})` : ''
    }`,
    read: false, actionUrl: '/collections', createdAt: nowISO(),
  });
  persist();
  return { data: { paid: true, transactionId: uid() } };
}

// ─── Admin ────────────────────────────────────────────────────────────────

function adminMetrics(authUserId: string | null): MockResponse {
  requireAdmin(authUserId);
  const txnsByCurrency = new Map<Currency, number>();
  for (const t of db().transactions) {
    txnsByCurrency.set(t.currency, (txnsByCurrency.get(t.currency) ?? 0) + parseFloat(t.amount));
  }
  return {
    data: {
      totalUsers: db().users.length,
      pendingKyc: pendingKycCount(),
      pendingAml: pendingAmlCount(),
      totalTransactions: db().transactions.length,
      volume: Array.from(txnsByCurrency.entries()).map(([currency, volume]) => ({
        currency, volume: volume.toFixed(8),
      })),
    },
  };
}

function adminKycQueue(authUserId: string | null): MockResponse {
  requireAdmin(authUserId);
  const items = db().kycDocs
    .filter((d) => d.status === 'pending')
    .map((d) => {
      const u = db().users.find((x) => x.id === d.userId)!;
      return {
        docId: d.id, userId: u.id, email: u.email, phone: u.phone,
        documentType: d.documentType, submittedAt: d.submittedAt,
      };
    });
  return { data: items };
}

function adminKycReview(
  authUserId: string | null, docId: string,
  body: { decision: 'approved' | 'rejected'; notes?: string },
): MockResponse {
  requireAdmin(authUserId);
  const doc = db().kycDocs.find((d) => d.id === docId);
  if (!doc) throw new MockHttpError(404, 'Document not found');
  doc.status = body.decision;
  doc.reviewedAt = nowISO();
  const owner = db().users.find((u) => u.id === doc.userId);
  if (owner) {
    const approvedDocs = db().kycDocs.filter((d) => d.userId === owner.id && d.status === 'approved');
    const approved = new Set(approvedDocs.map((d) => d.documentType));
    const tier1 = approved.has('national_id') || approved.has('passport') || approved.has('drivers_license');
    const tier2 = tier1 && approved.has('selfie');
    owner.tier = tier2 ? 2 : tier1 ? 1 : 0;
    if (tier1) owner.kycStatus = 'approved';
    db().notifications.unshift({
      id: uid(), userId: owner.id,
      type: body.decision === 'approved' ? 'kyc_approved' : 'kyc_rejected',
      message: body.decision === 'approved'
        ? `Your ${doc.documentType.replace(/_/g, ' ')} document was approved`
        : `Your ${doc.documentType.replace(/_/g, ' ')} document was rejected`,
      read: false, actionUrl: '/kyc', createdAt: nowISO(),
    });
  }
  persist();
  return { data: { reviewed: true } };
}

function adminAmlAlerts(authUserId: string | null, query: URLSearchParams): MockResponse {
  requireAdmin(authUserId);
  const status = query.get('status') ?? 'pending';
  return {
    data: db().amlAlerts
      .filter((a) => a.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

function adminAmlReview(
  authUserId: string | null, alertId: string,
  body: { decision: 'cleared' | 'escalated'; sarFiled?: boolean },
): MockResponse {
  requireAdmin(authUserId);
  const alert = db().amlAlerts.find((a) => a.id === alertId);
  if (!alert) throw new MockHttpError(404, 'Alert not found');
  alert.status = body.decision;
  if (body.sarFiled) alert.sarFiled = true;
  persist();
  return { data: { reviewed: true } };
}

function adminReserves(authUserId: string | null): MockResponse {
  requireAdmin(authUserId);
  return { data: db().reserves.slice().sort((a, b) => b.date.localeCompare(a.date)) };
}
