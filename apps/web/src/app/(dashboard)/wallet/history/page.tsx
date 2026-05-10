'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api/client';
import { Icon, type IconName } from '../../../../lib/icons';

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

interface TxList {
  transactions: Transaction[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const TX_LABELS: Record<string, string> = {
  funding: 'Funded',
  withdrawal: 'Withdrawn',
  conversion: 'Converted',
  transfer_sent: 'Sent',
  transfer_received: 'Received',
  collection: 'Collected',
  savings_deposit: 'Saved',
  savings_withdrawal: 'Withdrawn from savings',
};

const DEBIT_TYPES = new Set(['transfer_sent', 'withdrawal', 'conversion', 'savings_deposit']);

export default function HistoryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [currency, setCurrency] = useState('');
  const [type, setType] = useState('');

  const { data, isLoading } = useQuery<TxList>({
    queryKey: ['transactions', page, currency, type],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (currency) params.set('currency', currency);
      if (type) params.set('type', type);
      return (await apiClient.get<TxList>(`/transactions?${params}`)).data;
    },
  });

  async function downloadCsv() {
    const params = new URLSearchParams({ page: '1', limit: '1000' });
    if (currency) params.set('currency', currency);
    if (type) params.set('type', type);
    const all = await apiClient.get<TxList>(`/transactions?${params}`);
    const header = ['date', 'type', 'currency', 'amount', 'fee', 'counterparty', 'amlStatus', 'status'];
    const rows = all.data.transactions.map((t) => [
      t.createdAt, t.type, t.currency, t.amount, t.fee,
      t.counterpartyDisplay ?? '', t.amlStatus, t.status,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <button onClick={() => router.back()} className="btn-ghost -ml-3 mb-2">
          <Icon name="back" className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="h1">Transaction history</h1>
            <p className="subtle mt-1">All your wallet activity.</p>
          </div>
          <button onClick={downloadCsv} className="btn-secondary text-sm">
            <Icon name="download" className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <select
          value={currency}
          onChange={(e) => { setCurrency(e.target.value); setPage(1); }}
          className="input flex-1"
        >
          <option value="">All currencies</option>
          <option value="AFRi">AFRi</option>
          <option value="xGHS">xGHS</option>
        </select>
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="input flex-1"
        >
          <option value="">All types</option>
          <option value="funding">Funding</option>
          <option value="transfer_sent">Sent</option>
          <option value="transfer_received">Received</option>
          <option value="conversion">Conversion</option>
          <option value="collection">Collection</option>
          <option value="savings_deposit">Savings deposit</option>
          <option value="savings_withdrawal">Savings withdrawal</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/60 rounded-2xl animate-pulse border border-muted-100" />
          ))}
        </div>
      ) : data?.transactions.length === 0 ? (
        <div className="card text-center py-12 text-muted-400 text-sm">No transactions found.</div>
      ) : (
        <>
          <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-muted-100">
            <div className="divide-y divide-muted-100">
              {data?.transactions.map((tx) => {
                const isDebit = DEBIT_TYPES.has(tx.type);
                const iconName: IconName = isDebit ? 'arrowUpRight' : 'arrowDownLeft';
                const iconBg = isDebit ? 'bg-warn-50 text-warn-700' : 'bg-success-50 text-success-700';
                return (
                  <div key={tx.id} className="flex items-center gap-3.5 p-4 hover:bg-muted-50/50 transition-colors">
                    <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
                      <Icon name={iconName} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-brand-700">
                        {TX_LABELS[tx.type] ?? tx.type}
                      </p>
                      <p className="text-xs text-muted-500 truncate">
                        {tx.counterpartyDisplay ? `${tx.counterpartyDisplay} · ` : ''}
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[15px] font-semibold tabular-nums ${
                        isDebit ? 'text-brand-700' : 'text-success-700'
                      }`}>
                        {isDebit ? '−' : '+'}{parseFloat(tx.amount).toFixed(2)} {tx.currency}
                      </p>
                      {tx.amlStatus === 'flagged' && (
                        <span className="text-xs text-warn-700 inline-flex items-center gap-1">
                          <Icon name="warning" className="w-3 h-3" /> AML review
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm disabled:opacity-40"
              >
                <Icon name="back" className="w-4 h-4" /> Prev
              </button>
              <span className="text-sm text-muted-500 tabular-nums">
                Page {data.pagination.page} of {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="btn-secondary text-sm disabled:opacity-40"
              >
                Next <Icon name="send" className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
