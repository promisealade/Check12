'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api/client';
import { Icon, type IconName } from '../../../../lib/icons';

type Currency = 'AFRi' | 'xGHS';
type Provider = 'momo_mtn' | 'momo_vodafone' | 'momo_airteltigo' | 'bank_transfer';

const PROVIDERS: Array<{ id: Provider; label: string; icon: IconName }> = [
  { id: 'momo_mtn', label: 'MTN Mobile Money', icon: 'phone' },
  { id: 'momo_vodafone', label: 'Vodafone Cash', icon: 'phone' },
  { id: 'momo_airteltigo', label: 'AirtelTigo Money', icon: 'phone' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: 'bank' },
];

interface FundResult { amount: string; fee: string; newBalance: string; currency: string }

export default function FundWalletPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [currency, setCurrency] = useState<Currency>('AFRi');
  const [provider, setProvider] = useState<Provider>('momo_mtn');
  const [amount, setAmount] = useState('');
  const [momoPhone, setMomoPhone] = useState('');
  const [result, setResult] = useState<FundResult | null>(null);
  const [error, setError] = useState('');

  const fund = useMutation({
    mutationFn: () =>
      apiClient.post<FundResult>('/funding/onramp', {
        currency, amount, provider,
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
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-success-50 text-success-700 flex items-center justify-center">
          <Icon name="checkCircle" className="w-10 h-10" />
        </div>
        <div>
          <h2 className="h1">Wallet funded</h2>
          <p className="subtle mt-1">
            {parseFloat(result.amount).toFixed(2)} {result.currency} added to your wallet.
          </p>
        </div>
        <div className="card text-left space-y-2.5">
          <Row label="Amount" value={`${parseFloat(result.amount).toFixed(2)} ${result.currency}`} />
          <Row label="Fee" value={`${parseFloat(result.fee).toFixed(2)} ${result.currency}`} />
          <div className="border-t border-muted-100 pt-2.5">
            <Row label="New balance" value={`${parseFloat(result.newBalance).toFixed(2)} ${result.currency}`} bold />
          </div>
        </div>
        <p className="text-xs text-muted-400">Prototype — no real money moved.</p>
        <button className="btn-primary w-full" onClick={() => router.replace('/wallet')}>
          Back to wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      <div>
        <button onClick={() => router.back()} className="btn-ghost -ml-3 mb-2">
          <Icon name="back" className="w-4 h-4" /> Back
        </button>
        <h1 className="h1">Fund wallet</h1>
        <p className="subtle mt-1">Add funds via mobile money or bank transfer.</p>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="label">Currency</label>
          <div className="flex gap-2">
            {(['AFRi', 'xGHS'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`flex-1 py-3 rounded-2xl border text-sm font-semibold transition-colors ${
                  currency === c
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-muted-200 text-muted-500 hover:border-muted-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="amount">Amount ({currency})</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-400 text-sm font-medium">
              {currency}
            </span>
            <input
              id="amount" type="number" min="1" step="0.01" placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input pl-16 tabular-nums"
            />
          </div>
          {amount && parseFloat(amount) > 0 && (
            <p className="text-xs text-muted-500 mt-1.5 tabular-nums">
              Fee {(parseFloat(amount) * 0.005).toFixed(2)} {currency} (0.5%)
            </p>
          )}
        </div>

        <div>
          <label className="label">Payment method</label>
          <div className="space-y-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm transition-colors ${
                  provider === p.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-muted-200 hover:border-muted-300'
                }`}
              >
                <span className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  provider === p.id ? 'bg-brand-100 text-brand-700' : 'bg-muted-100 text-muted-500'
                }`}>
                  <Icon name={p.icon} className="w-4 h-4" />
                </span>
                <span className={`font-medium flex-1 text-left ${provider === p.id ? 'text-brand-700' : 'text-muted-700'}`}>
                  {p.label}
                </span>
                {provider === p.id && (
                  <Icon name="check" className="w-4 h-4 text-brand-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {provider !== 'bank_transfer' && (
          <div>
            <label className="label" htmlFor="momoPhone">Mobile money number</label>
            <input
              id="momoPhone" type="tel" placeholder="+233244000000"
              value={momoPhone}
              onChange={(e) => setMomoPhone(e.target.value)}
              className="input"
            />
            <p className="text-xs text-muted-400 mt-1">
              Tip: numbers ending <span className="font-mono">000</span> simulate a decline.
            </p>
          </div>
        )}

        {error && <div className="alert-error">{error}</div>}

        <button
          className="btn-primary w-full"
          disabled={!amount || parseFloat(amount) <= 0 || fund.isPending}
          onClick={() => fund.mutate()}
        >
          {fund.isPending ? 'Processing…' : `Fund ${currency} wallet`}
          <Icon name="plusCircle" className="w-4 h-4" />
        </button>

        <p className="text-center text-xs text-muted-400">
          Prototype mode — payments are simulated.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-500">{label}</span>
      <span className={`tabular-nums ${bold ? 'font-semibold text-brand-700' : 'text-brand-700'}`}>
        {value}
      </span>
    </div>
  );
}
