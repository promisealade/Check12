'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api/client';

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
      return (await apiClient.get(`/transactions?${params}`)).data;
    },
  });

  function downloadCsv() {
    const params = new URLSearchParams();
    if (currency) params.set('currency', currency);
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/transactions/export?${params}`;
    window.open(url, '_blank');
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 mb-4 block">
          ← Back
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Transaction history</h1>
          <button onClick={downloadCsv} className="btn-secondary text-sm">
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
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
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data?.transactions.length === 0 ? (
        <div className="card text-center py-10 text-gray-400 text-sm">No transactions found.</div>
      ) : (
        <>
          <div className="space-y-2">
            {data?.transactions.map((tx) => {
              const isDebit = DEBIT_TYPES.has(tx.type);
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base">
                    {isDebit ? '↑' : '↓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{TX_LABELS[tx.type] ?? tx.type}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {tx.counterpartyDisplay ?? ''}
                      {tx.counterpartyDisplay ? ' · ' : ''}
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                      {isDebit ? '-' : '+'}{parseFloat(tx.amount).toFixed(2)} {tx.currency}
                    </p>
                    {tx.amlStatus === 'flagged' && (
                      <span className="text-xs text-amber-600">AML review</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="btn-secondary text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
