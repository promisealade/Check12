'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api/client';

type Currency = 'AFRi' | 'xGHS';
type Provider = 'momo_mtn' | 'momo_vodafone' | 'momo_airteltigo' | 'bank_transfer';

const PROVIDERS: Array<{ id: Provider; label: string; icon: string }> = [
  { id: 'momo_mtn', label: 'MTN Mobile Money', icon: '📱' },
  { id: 'momo_vodafone', label: 'Vodafone Cash', icon: '📱' },
  { id: 'momo_airteltigo', label: 'AirtelTigo Money', icon: '📱' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
];

export default function FundWalletPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [currency, setCurrency] = useState<Currency>('AFRi');
  const [provider, setProvider] = useState<Provider>('momo_mtn');
  const [amount, setAmount] = useState('');
  const [momoPhone, setMomoPhone] = useState('');
  const [result, setResult] = useState<{ amount: string; fee: string; newBalance: string; currency: string } | null>(null);
  const [error, setError] = useState('');

  const fund = useMutation({
    mutationFn: () =>
      apiClient.post('/funding/onramp', {
        currency,
        amount,
        provider,
        momoPhone: provider !== 'bank_transfer' ? momoPhone : undefined,
      }),
    onSuccess: (res) => {
      setResult(res.data);
      setError('');
      qc.invalidateQueries({ queryKey: ['wallet-dashboard'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail ?? err.response?.data?.message ?? 'Funding failed');
    },
  });

  if (result) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="text-6xl">✅</div>
        <h2 className="text-2xl font-bold text-gray-900">Wallet funded!</h2>
        <div className="card text-left space-y-3">
          <Row label="Amount funded" value={`${parseFloat(result.amount).toFixed(2)} ${result.currency}`} />
          <Row label="Fee" value={`${parseFloat(result.fee).toFixed(2)} ${result.currency}`} />
          <Row label="New balance" value={`${parseFloat(result.newBalance).toFixed(2)} ${result.currency}`} bold />
        </div>
        <p className="text-xs text-gray-400">
          (Prototype: mock provider — no real money moved)
        </p>
        <button className="btn-primary w-full" onClick={() => router.replace('/wallet')}>
          Back to wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      <div>
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 mb-4 block">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Fund wallet</h1>
        <p className="text-gray-500 text-sm mt-1">
          Add funds via mobile money or bank transfer
        </p>
      </div>

      {/* Currency selector */}
      <div>
        <label className="label">Select currency</label>
        <div className="flex gap-3">
          {(['AFRi', 'xGHS'] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                currency === c
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="label" htmlFor="amount">Amount ({currency})</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            {currency}
          </span>
          <input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input pl-16"
          />
        </div>
        {amount && parseFloat(amount) > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Fee: {(parseFloat(amount) * 0.005).toFixed(2)} {currency} (0.5%)
          </p>
        )}
      </div>

      {/* Provider */}
      <div>
        <label className="label">Payment method</label>
        <div className="space-y-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-colors ${
                provider === p.id
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{p.icon}</span>
              <span className={`font-medium ${provider === p.id ? 'text-brand-700' : 'text-gray-700'}`}>
                {p.label}
              </span>
              {provider === p.id && <span className="ml-auto text-brand-500 text-base">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* MoMo phone */}
      {provider !== 'bank_transfer' && (
        <div>
          <label className="label" htmlFor="momoPhone">Mobile Money number</label>
          <input
            id="momoPhone"
            type="tel"
            placeholder="+233244000000"
            value={momoPhone}
            onChange={(e) => setMomoPhone(e.target.value)}
            className="input"
          />
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        className="btn-primary w-full"
        disabled={!amount || parseFloat(amount) <= 0 || fund.isPending}
        onClick={() => fund.mutate()}
      >
        {fund.isPending ? 'Processing…' : `Fund ${currency} wallet`}
      </button>

      <p className="text-center text-xs text-gray-400">
        Prototype mode — payments are simulated, no real funds transferred
      </p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-bold text-gray-900' : 'text-gray-800'}>{value}</span>
    </div>
  );
}
