'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import { useAuthStore } from '../../../lib/stores/auth.store';

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

const TX_TYPE_LABELS: Record<string, string> = {
  funding: 'Funded',
  withdrawal: 'Withdrawn',
  conversion: 'Converted',
  transfer_sent: 'Sent',
  transfer_received: 'Received',
  collection: 'Collected',
  savings_deposit: 'Saved',
  savings_withdrawal: 'From savings',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  AFRi: 'AFRi',
  xGHS: 'xGHS',
};

export default function WalletPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['wallet-dashboard'],
    queryFn: async () => (await apiClient.get('/wallets/dashboard')).data,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const afriWallet = data?.wallets.find((w) => w.currency === 'AFRi');
  const xghsWallet = data?.wallets.find((w) => w.currency === 'xGHS');

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div>
        <p className="text-gray-500 text-sm">Welcome back</p>
        <h1 className="text-2xl font-bold text-gray-900">{user?.email ?? 'Your wallet'}</h1>
      </div>

      {/* Wallet cards */}
      <div className="grid grid-cols-2 gap-4">
        <WalletCard wallet={afriWallet} label="AFRi Wallet" color="brand" />
        <WalletCard wallet={xghsWallet} label="xGHS Wallet" color="gold" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { href: '/wallet/fund', label: 'Fund', icon: '↓' },
          { href: '/transfer', label: 'Send', icon: '→' },
          { href: '/collections', label: 'Collect', icon: '↗' },
          { href: '/savings', label: 'Save', icon: '🏦' },
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-colors"
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium text-gray-600">{label}</span>
          </Link>
        ))}
      </div>

      {/* KYC tier notice */}
      {user && user.tier < 2 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">
              Tier {user.tier} — Limited access
            </p>
            <p className="text-xs text-amber-600">Complete verification to unlock full limits</p>
          </div>
          <Link href="/kyc" className="btn-primary text-sm py-1.5 px-4">
            Verify
          </Link>
        </div>
      )}

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Recent transactions</h2>
          <Link href="/wallet/history" className="text-sm text-brand-600 hover:underline">
            See all
          </Link>
        </div>

        {data?.recentTransactions.length === 0 ? (
          <div className="card text-center py-10 text-gray-400 text-sm">
            No transactions yet. Fund your wallet to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {data?.recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WalletCard({
  wallet,
  label,
  color,
}: {
  wallet: WalletBalance | undefined;
  label: string;
  color: 'brand' | 'gold';
}) {
  const gradients = {
    brand: 'from-brand-600 to-brand-700',
    gold: 'from-gold-500 to-gold-600',
  };
  const balance = wallet ? parseFloat(wallet.balance).toFixed(2) : '—';
  const currency = wallet?.currency ?? '';

  return (
    <div
      className={`bg-gradient-to-br ${gradients[color]} rounded-2xl p-5 text-white shadow-md`}
    >
      <p className="text-xs font-medium opacity-75 mb-3">{label}</p>
      <p className="text-3xl font-bold tracking-tight">{balance}</p>
      <p className="text-sm opacity-80 mt-1">{CURRENCY_SYMBOLS[currency] ?? currency}</p>
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isDebit = ['transfer_sent', 'withdrawal', 'conversion', 'savings_deposit'].includes(
    tx.type,
  );
  const label = TX_TYPE_LABELS[tx.type] ?? tx.type;
  const sign = isDebit ? '-' : '+';
  const amountColor = isDebit ? 'text-red-600' : 'text-green-600';

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base">
          {isDebit ? '↑' : '↓'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          {tx.counterpartyDisplay && (
            <p className="text-xs text-gray-400">{tx.counterpartyDisplay}</p>
          )}
          <p className="text-xs text-gray-400">
            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${amountColor}`}>
          {sign}
          {parseFloat(tx.amount).toFixed(2)} {tx.currency}
        </p>
        {tx.amlStatus === 'flagged' && (
          <span className="text-xs text-amber-600 font-medium">AML review</span>
        )}
      </div>
    </div>
  );
}
