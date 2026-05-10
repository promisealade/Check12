'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import { useAuthStore } from '../../../lib/stores/auth.store';
import { Icon, type IconName } from '../../../lib/icons';

interface WalletBalance {
  id: string;
  currency: 'AFRi' | 'xGHS';
  balance: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  fee: string;
  counterpartyDisplay: string | null;
  amlStatus: string;
  settledAt: string | null;
  createdAt: string;
}

interface DashboardData {
  wallets: WalletBalance[];
  recentTransactions: Transaction[];
}

interface SavingsAccount {
  id: string;
  label: string;
  targetAmount: string | null;
  balance: string;
  createdAt: string;
}

const TX_TYPE_LABELS: Record<string, string> = {
  funding: 'Funded',
  withdrawal: 'Withdrawn',
  conversion: 'Converted',
  transfer_sent: 'Sent to',
  transfer_received: 'From',
  collection: 'Collected',
  savings_deposit: 'Saved',
  savings_withdrawal: 'From savings',
};

const RATE_AFRI_TO_GHS = 14.82;

export default function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const [balanceHidden, setBalanceHidden] = useState(false);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['wallet-dashboard'],
    queryFn: async () => (await apiClient.get<DashboardData>('/wallets/dashboard')).data,
    refetchInterval: 30_000,
  });

  // Pull a wider transaction window to compute 30-day stats
  const { data: txList } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ['transactions-stats'],
    queryFn: async () =>
      (await apiClient.get<{ transactions: Transaction[] }>('/transactions?limit=100&page=1')).data,
  });

  const { data: savings = [] } = useQuery<SavingsAccount[]>({
    queryKey: ['savings'],
    queryFn: async () => (await apiClient.get<SavingsAccount[]>('/savings')).data,
  });

  if (isLoading) {
    return (
      <div className="w-full py-8 px-4 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted-100/60 rounded w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-56 bg-muted-100/60 rounded-[32px] lg:col-span-2" />
            <div className="h-56 bg-muted-100/50 rounded-[28px]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted-100/50 rounded-[24px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const afriWallet = data?.wallets.find((w) => w.currency === 'AFRi');
  const xghsWallet = data?.wallets.find((w) => w.currency === 'xGHS');
  const afriBalance = afriWallet ? parseFloat(afriWallet.balance) : 0;
  const xghsBalance = xghsWallet ? parseFloat(xghsWallet.balance) : 0;
  const totalGhs = afriBalance * RATE_AFRI_TO_GHS + xghsBalance;

  const userName = user?.email?.split('@')[0]
    ? user.email[0].toUpperCase() + user.email.split('@')[0].slice(1)
    : 'Friend';

  const stats = compute30dStats(txList?.transactions ?? []);

  return (
    <div className="w-full py-8 px-4 lg:px-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <BrandFlower className="w-12 h-12 text-gold-500 hidden md:block" />
          <div>
            <p className="greeting leading-tight mb-1">Akwaaba</p>
            <h1 className="text-2xl font-display font-semibold text-brand-700 leading-tight tracking-tight">
              {userName}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setBalanceHidden((h) => !h)}
            className="icon-btn"
            aria-label={balanceHidden ? 'Show balances' : 'Hide balances'}
          >
            <Icon name={balanceHidden ? 'eyeOff' : 'eye'} className="w-[18px] h-[18px]" />
          </button>
          <div className="flex gap-2 lg:hidden">
            <Link href="/notifications" className="icon-btn" aria-label="Notifications">
              <Icon name="bell" className="w-[18px] h-[18px]" />
            </Link>
            <Link href="/wallet/fund" className="icon-btn" aria-label="Fund or scan">
              <Icon name="qr" className="w-[18px] h-[18px]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 30-day stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total balance"
          value={balanceHidden ? '••••••' : `GHS ${totalGhs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub="across both wallets"
          icon="wallet"
          tone="brand"
        />
        <StatCard
          label="Sent · 30 days"
          value={`${stats.sent.toFixed(2)}`}
          sub={`${stats.sentCount} transfer${stats.sentCount === 1 ? '' : 's'}`}
          icon="arrowUpRight"
          tone="gold"
        />
        <StatCard
          label="Received · 30 days"
          value={`${stats.received.toFixed(2)}`}
          sub={`${stats.receivedCount} payment${stats.receivedCount === 1 ? '' : 's'}`}
          icon="arrowDownLeft"
          tone="sage"
        />
        <StatCard
          label="Savings"
          value={`${savings
            .reduce((acc, s) => acc + parseFloat(s.balance), 0)
            .toFixed(2)} AFRi`}
          sub={`${savings.length} goal${savings.length === 1 ? '' : 's'}`}
          icon="star"
          tone="sand"
        />
      </div>

      {/* Wallet cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* AFRi hero */}
        <div className="xl:col-span-2 wallet-card p-6 md:p-8 flex flex-col justify-between min-h-[220px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between items-start mb-8 gap-4">
            <div className="flex gap-3 items-center">
              <div className="token-bubble token-bubble--gold w-12 h-12 text-xl shrink-0">A</div>
              <div>
                <div className="font-medium text-lg">AFRi wallet</div>
                <div className="text-white/65 text-sm md:text-base">Gold-backed · USD-pegged</div>
              </div>
            </div>
            <span className="wallet-rate shrink-0">
              Live · 1 AFRi = {RATE_AFRI_TO_GHS.toFixed(2)} GHS
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[40px] md:text-[56px] font-semibold tracking-tight tabular-nums leading-none">
                {balanceHidden ? '••••••' : afriBalance.toFixed(2)}
              </span>
              <span className="text-xl md:text-2xl text-white/70">AFRi</span>
            </div>
            <div className="text-white/65 text-sm md:text-base mt-2 tabular-nums">
              {balanceHidden ? '••••••' : `≈ GHS ${(afriBalance * RATE_AFRI_TO_GHS).toFixed(2)} · USD ${afriBalance.toFixed(2)}`}
            </div>
          </div>
        </div>

        {/* xGHS */}
        <div className="bg-white rounded-[28px] p-6 md:p-8 shadow-card ring-1 ring-muted-100 flex flex-col justify-center min-h-[220px] gap-6">
          <div className="flex gap-4 items-center">
            <div className="token-bubble token-bubble--sage w-12 h-12 text-lg shrink-0">x</div>
            <div>
              <div className="font-medium text-brand-700 text-[17px]">xGHS wallet</div>
              <div className="text-muted-500 text-sm">1:1 cedi · Bank-backed</div>
            </div>
          </div>
          <div>
            <div className="font-display font-semibold text-brand-700 text-3xl md:text-4xl tabular-nums leading-none mb-1">
              {balanceHidden ? '••••••' : xghsBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-muted-500 text-sm tabular-nums">
              {balanceHidden ? '••••••' : `GHS ${xghsBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction href="/transfer" label="Send" icon="arrowUpRight" tone="gold" />
        <QuickAction href="/wallet/fund" label="Fund" icon="arrowDownLeft" tone="sage" />
        <QuickAction href="/convert" label="Convert" icon="swap" tone="brand" />
        <QuickAction href="/collections" label="Cash out" icon="collect" tone="sand" />
      </div>

      {/* Activity + Savings two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-display font-medium text-brand-700">Recent</h2>
            <Link
              href="/wallet/history"
              className="text-sm text-muted-500 hover:text-brand-700 font-medium bg-white px-4 py-2 rounded-full shadow-pop ring-1 ring-muted-100 transition-colors"
            >
              See all
            </Link>
          </div>

          <div className="bg-white rounded-[32px] overflow-hidden shadow-card ring-1 ring-muted-100">
            {data?.recentTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-400 text-sm">
                No transactions yet. Top up your wallet to get started.
              </div>
            ) : (
              <div className="divide-y divide-muted-100/70">
                {data?.recentTransactions.slice(0, 5).map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Savings widget */}
        <SavingsWidget savings={savings} />
      </div>

      {/* Footer Badges */}
      <div className="flex justify-center gap-3 pt-6 pb-4">
        <span className="badge-sage px-4 py-2 text-xs">
          <Icon name="shield" className="w-3.5 h-3.5" />
          Bank of Ghana licensed
        </span>
        <span className="badge-gold px-4 py-2 text-xs">
          <Icon name="shieldCheck" className="w-3.5 h-3.5" />
          100% reserves
        </span>
      </div>
    </div>
  );
}

/* ─────────────── components ─────────────── */

type Tone = 'brand' | 'gold' | 'sage' | 'sand';

const TONE_BUBBLE: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700',
  gold:  'bg-sand-100 text-gold-700',
  sage:  'bg-sage-100 text-brand-700',
  sand:  'bg-sand-50 text-gold-600',
};

function StatCard({
  label, value, sub, icon, tone,
}: {
  label: string; value: string; sub: string; icon: IconName; tone: Tone;
}) {
  return (
    <div className="bg-white rounded-[24px] p-5 ring-1 ring-muted-100 shadow-pop">
      <div className="flex items-center justify-between mb-3">
        <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${TONE_BUBBLE[tone]}`}>
          <Icon name={icon} className="w-5 h-5" />
        </span>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-400 mb-1">{label}</p>
      <p className="text-xl font-display font-semibold text-brand-700 tabular-nums leading-tight">{value}</p>
      <p className="text-xs text-muted-500 mt-0.5">{sub}</p>
    </div>
  );
}

function SavingsWidget({ savings }: { savings: SavingsAccount[] }) {
  const total = savings.reduce((acc, s) => acc + parseFloat(s.balance), 0);
  const top = savings
    .slice()
    .sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance))
    .slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-display font-medium text-brand-700">Savings</h2>
        <Link
          href="/savings"
          className="text-sm text-muted-500 hover:text-brand-700 font-medium bg-white px-4 py-2 rounded-full shadow-pop ring-1 ring-muted-100 transition-colors"
        >
          Manage
        </Link>
      </div>

      <div className="bg-white rounded-[32px] p-6 ring-1 ring-muted-100 shadow-card space-y-4">
        {savings.length === 0 ? (
          <div className="text-center space-y-3 py-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-sand-100 text-gold-700 flex items-center justify-center">
              <Icon name="star" className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-500">Set a goal and start saving in stable AFRi.</p>
            <Link href="/savings" className="btn-primary text-sm">
              Create a goal
              <Icon name="plus" className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-400 mb-1">
                Total saved
              </p>
              <p className="font-display text-2xl font-semibold text-brand-700 tabular-nums">
                {total.toFixed(2)}
                <span className="text-sm font-normal text-muted-400 ml-1">AFRi</span>
              </p>
              <p className="text-xs text-muted-500 tabular-nums">
                ≈ GHS {(total * RATE_AFRI_TO_GHS).toFixed(2)}
              </p>
            </div>

            <div className="space-y-3 border-t border-muted-100 pt-4">
              {top.map((s) => {
                const balance = parseFloat(s.balance);
                const target = s.targetAmount ? parseFloat(s.targetAmount) : null;
                const progress = target ? Math.min(100, (balance / target) * 100) : null;
                return (
                  <div key={s.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-brand-700 truncate">{s.label}</p>
                      <p className="text-sm text-muted-700 tabular-nums shrink-0">
                        {balance.toFixed(2)}
                        {target && <span className="text-muted-400"> / {target.toFixed(0)}</span>}
                      </p>
                    </div>
                    {progress !== null && (
                      <div className="w-full bg-muted-100 rounded-full h-1.5">
                        <div
                          className="bg-gold-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Link
              href="/savings"
              className="block w-full text-center text-sm text-brand-700 ring-1 ring-inset ring-brand-100 rounded-xl py-2 hover:bg-brand-50 transition-colors"
            >
              + New goal
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function QuickAction({ href, label, icon, tone }: {
  href: string; label: string; icon: IconName; tone: Tone;
}) {
  return (
    <Link href={href} className="action-tile p-4 md:p-6 gap-3">
      <span className={`w-12 h-12 rounded-full flex items-center justify-center ${TONE_BUBBLE[tone]}`}>
        <Icon name={icon} className="w-5 h-5" />
      </span>
      <span className="text-[14px] font-medium text-brand-700">{label}</span>
    </Link>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isDebit = ['transfer_sent', 'withdrawal', 'conversion', 'savings_deposit'].includes(tx.type);
  const labelPrefix = TX_TYPE_LABELS[tx.type] ?? tx.type;

  let title = labelPrefix;
  if (tx.counterpartyDisplay) {
    if (tx.type === 'transfer_sent') title = `Sent to ${tx.counterpartyDisplay}`;
    else if (tx.type === 'transfer_received') title = `From ${tx.counterpartyDisplay}`;
    else if (tx.type === 'funding') title = `${tx.counterpartyDisplay} top-up`;
    else title = `${labelPrefix} ${tx.counterpartyDisplay}`;
  }

  const sign = isDebit ? '−' : '+';
  const isAfri = tx.currency === 'AFRi';
  const iconBg = isDebit ? 'bg-sand-100 text-gold-700' : 'bg-sage-200 text-brand-700';
  const iconName: IconName = isDebit ? 'arrowUpRight' : 'arrowDownLeft';

  const amountInGhs = parseFloat(tx.amount) * (isAfri ? RATE_AFRI_TO_GHS : 1);
  const amountClass = isDebit ? 'text-brand-700' : 'text-success-700';

  return (
    <div className="flex items-center justify-between p-4 md:p-5 bg-white hover:bg-muted-50/60 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon name={iconName} className="w-[20px] h-[20px]" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-brand-700 truncate">{title}</p>
          <div className="flex items-center gap-1.5 mt-1 text-[13px] text-muted-500">
            <span>{tx.createdAt ? friendlyDate(tx.createdAt) : 'Today'}</span>
            {tx.settledAt && (
              <>
                <span className="text-muted-300">·</span>
                <span>Settled in 38s</span>
              </>
            )}
            {parseFloat(tx.fee) === 0 && (
              <>
                <span className="text-muted-300">·</span>
                <span>0% fee</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 pl-4">
        <p className={`text-[15px] font-semibold tabular-nums ${amountClass}`}>
          {sign}
          {parseFloat(tx.amount).toFixed(2)} {tx.currency}
        </p>
        <p className="text-[13px] text-muted-500 mt-1 tabular-nums">
          GHS {amountInGhs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}

/* ─────────────── helpers ─────────────── */

function compute30dStats(txns: Transaction[]) {
  const cutoff = Date.now() - 30 * 86400_000;
  let sent = 0, received = 0, sentCount = 0, receivedCount = 0;
  for (const t of txns) {
    if (new Date(t.createdAt).getTime() < cutoff) continue;
    const ghs = parseFloat(t.amount) * (t.currency === 'AFRi' ? RATE_AFRI_TO_GHS : 1);
    if (['transfer_sent', 'withdrawal'].includes(t.type)) {
      sent += ghs;
      sentCount += 1;
    } else if (['transfer_received', 'funding', 'collection'].includes(t.type)) {
      received += ghs;
      receivedCount += 1;
    }
  }
  return { sent, received, sentCount, receivedCount };
}

function friendlyDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400_000);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) {
    return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function BrandFlower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <g strokeLinecap="round" strokeLinejoin="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse
            key={deg}
            cx="16"
            cy="9"
            rx="3"
            ry="6.5"
            transform={`rotate(${deg} 16 16)`}
          />
        ))}
        <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
