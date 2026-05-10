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
  transfer_sent: 'Sent to',
  transfer_received: 'From',
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
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-100 rounded-[32px]" />
          <div className="h-24 bg-gray-100 rounded-[24px]" />
          <div className="flex gap-2">
            <div className="h-24 bg-gray-100 rounded-[20px] flex-1" />
            <div className="h-24 bg-gray-100 rounded-[20px] flex-1" />
            <div className="h-24 bg-gray-100 rounded-[20px] flex-1" />
            <div className="h-24 bg-gray-100 rounded-[20px] flex-1" />
          </div>
        </div>
      </div>
    );
  }

  const afriWallet = data?.wallets.find((w) => w.currency === 'AFRi');
  const xghsWallet = data?.wallets.find((w) => w.currency === 'xGHS');

  const afriBalance = afriWallet ? parseFloat(afriWallet.balance).toFixed(2) : '0.00';
  const xghsBalance = xghsWallet ? parseFloat(xghsWallet.balance).toFixed(2) : '0.00';

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* Logo icon */}
          <div className="text-brand-500">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5l-10 14M22 12H2M19 19L5 5" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm leading-tight">Akwaaba</p>
            <h1 className="text-lg font-medium text-gray-900 leading-tight">
              {user?.email?.split('@')[0] || 'User'}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>
          </button>
        </div>
      </div>

      {/* AFRi Wallet */}
      <div className="bg-[#23412a] rounded-[32px] p-6 text-white relative overflow-hidden">
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-[#dfad6c] flex items-center justify-center text-brand-900 font-medium text-lg">
              A
            </div>
            <div>
              <div className="font-medium">AFRi wallet</div>
              <div className="text-[#a4b5a8] text-sm">Gold-backed • USD-pegged</div>
            </div>
          </div>
          <div className="bg-[#415b47] bg-opacity-40 text-[#dfad6c] text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
            Live • 1 AFRi = 14.82 GHS
          </div>
        </div>
        
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-[40px] font-semibold tracking-tight">{afriBalance}</span>
            <span className="text-lg text-[#a4b5a8]">AFRi</span>
          </div>
          <div className="text-[#a4b5a8] text-sm mt-1">
            ≈ GHS {(parseFloat(afriBalance) * 14.82).toFixed(2)} • USD {afriBalance}
          </div>
        </div>
      </div>

      {/* xGHS Wallet */}
      <div className="bg-white rounded-[28px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex justify-between items-center border border-gray-100">
        <div className="flex gap-3 items-center">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm">
            x
          </div>
          <div>
            <div className="font-medium text-gray-800 text-[15px]">xGHS wallet</div>
            <div className="text-gray-500 text-[13px]">1:1 cedi • Bank-backed</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium text-gray-900 text-lg">{xghsBalance}</div>
          <div className="text-gray-500 text-[13px]">GHS {xghsBalance}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 pt-2">
        {[
          { href: '/transfer', label: 'Send' },
          { href: '/wallet/fund', label: 'Receive' },
          { href: '/buy', label: 'Buy' },
          { href: '/withdraw', label: 'Cash out' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-2 p-3 pb-4 rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="w-6 h-6 flex items-center justify-center text-gray-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
            </div>
            <span className="text-[13px] font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[17px] font-medium text-gray-800">Recent</h2>
          <Link href="/wallet/history" className="text-[13px] text-gray-500 hover:text-gray-800 font-medium">
            See all
          </Link>
        </div>

        <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
          {data?.recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No transactions yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data?.recentTransactions.slice(0, 3).map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Badges */}
      <div className="flex justify-center gap-3 pt-6 pb-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#EFEFED] text-[#555] text-xs font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
          Bank of Ghana licensed
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#fdf3e7] text-[#c07f3e] text-xs font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
          100% reserves
        </div>
      </div>

    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isDebit = ['transfer_sent', 'withdrawal', 'conversion', 'savings_deposit'].includes(
    tx.type,
  );
  const labelPrefix = TX_TYPE_LABELS[tx.type] ?? tx.type;
  
  // Format the title depending on type
  let title = labelPrefix;
  if (tx.counterpartyDisplay) {
    if (tx.type === 'transfer_sent') title = `Sent to ${tx.counterpartyDisplay}`;
    else if (tx.type === 'transfer_received') title = `From ${tx.counterpartyDisplay}`;
    else title = `${labelPrefix} ${tx.counterpartyDisplay}`;
  }

  const sign = isDebit ? '-' : '+';
  const amountColor = isDebit ? 'text-gray-800' : 'text-gray-800'; // According to screenshot, amounts are dark grey, not green/red, except maybe a slight tint or just plain text. Let's use gray-800 for now.

  const isAfri = tx.currency === 'AFRi';
  
  // Icon styling based on currency
  const iconBg = isAfri ? 'bg-[#fdf3e7]' : 'bg-[#edf3ee]';
  const iconColor = isAfri ? 'text-[#c07f3e]' : 'text-brand-600';

  return (
    <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3.5">
        <div className={`w-11 h-11 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>
        </div>
        <div>
          <p className="text-[15px] font-medium text-gray-800">{title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-[13px] text-gray-500">
              {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Today'}
            </p>
            {tx.settledAt && (
              <>
                <span className="text-gray-300">•</span>
                <p className="text-[13px] text-gray-500">Settled in 38s</p>
              </>
            )}
            {tx.fee === '0' && (
              <>
                <span className="text-gray-300">•</span>
                <p className="text-[13px] text-gray-500">0% fee</p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-[15px] font-medium ${amountColor}`}>
          {sign}{parseFloat(tx.amount).toFixed(2)} {tx.currency}
        </p>
        <p className="text-[13px] text-gray-500 mt-0.5">
          {isAfri ? '≈ NGN 8,420' : `GHS ${parseFloat(tx.amount).toFixed(2)}`}
        </p>
      </div>
    </div>
  );
}
