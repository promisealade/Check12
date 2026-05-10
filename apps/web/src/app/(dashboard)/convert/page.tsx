'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import { Icon } from '../../../lib/icons';

type Direction = 'AFRi_to_xGHS' | 'xGHS_to_AFRi';

interface Rate {
  AFRi_to_xGHS: number;
  xGHS_to_AFRi: number;
  updatedAt: string;
}

interface Preview {
  from: { amount: string; currency: string };
  to: { amount: string; currency: string };
  rate: string;
  fee: string;
  feeCurrency: string;
}

interface ConvertResult {
  transactionId: string;
  from: { amount: string; currency: string };
  to: { amount: string; currency: string };
  fee: string;
}

export default function ConvertPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [direction, setDirection] = useState<Direction>('AFRi_to_xGHS');
  const [amount, setAmount] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState('');

  const { data: rate } = useQuery<Rate>({
    queryKey: ['stablecoin-rate'],
    queryFn: async () => (await apiClient.get<Rate>('/stablecoin/rate')).data,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) { setPreview(null); return; }
    const timeout = setTimeout(async () => {
      try {
        const res = await apiClient.post<Preview>('/stablecoin/preview', { direction, amount });
        setPreview(res.data);
      } catch {
        setPreview(null);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [amount, direction]);

  const convert = useMutation({
    mutationFn: () => apiClient.post<ConvertResult>('/stablecoin/convert', { direction, amount }),
    onSuccess: (res) => {
      setResult(res.data);
      setError('');
      qc.invalidateQueries({ queryKey: ['wallet-dashboard'] });
    },
    onError: (err: any) =>
      setError(err.response?.data?.detail ?? err.response?.data?.message ?? 'Conversion failed'),
  });

  const [fromCurrency, toCurrency] =
    direction === 'AFRi_to_xGHS' ? ['AFRi', 'xGHS'] : ['xGHS', 'AFRi'];

  if (result) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-success-50 text-success-700 flex items-center justify-center">
          <Icon name="checkCircle" className="w-10 h-10" />
        </div>
        <div>
          <h2 className="h1">Converted!</h2>
          <p className="subtle mt-1">Your conversion settled instantly.</p>
        </div>
        <div className="card text-left space-y-2.5">
          <Row label="From" value={`${parseFloat(result.from.amount).toFixed(4)} ${result.from.currency}`} />
          <Row label="To" value={`${parseFloat(result.to.amount).toFixed(4)} ${result.to.currency}`} bold />
          <Row label="Fee" value={`${parseFloat(result.fee).toFixed(4)} ${result.to.currency}`} />
        </div>
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
        <h1 className="h1">Convert</h1>
        <p className="subtle mt-1">Swap between AFRi and xGHS instantly.</p>
      </div>

      {rate && (
        <div className="rounded-2xl bg-brand-50/60 border border-brand-100 px-4 py-3 text-sm text-brand-700 flex items-center gap-2">
          <Icon name="trending" className="w-4 h-4" />
          <span>
            Live rate: <span className="font-semibold tabular-nums">1 AFRi = {rate.AFRi_to_xGHS.toFixed(4)} xGHS</span>
          </span>
          <span className="text-brand-500/60 text-xs ml-auto">mock oracle</span>
        </div>
      )}

      <div className="card space-y-5">
        {/* Direction toggle */}
        <div className="rounded-2xl bg-parchment/70 border border-muted-100 p-1 flex">
          {(['AFRi_to_xGHS', 'xGHS_to_AFRi'] as Direction[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDirection(d); setPreview(null); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                direction === d
                  ? 'bg-white text-brand-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  : 'text-muted-500 hover:text-muted-700'
              }`}
            >
              {d === 'AFRi_to_xGHS' ? 'AFRi → xGHS' : 'xGHS → AFRi'}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Amount in {fromCurrency}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-400 text-sm font-medium">
              {fromCurrency}
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input pl-16 tabular-nums"
            />
          </div>
        </div>

        {preview && (
          <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Preview</p>
            <Row label="You receive" value={`${parseFloat(preview.to.amount).toFixed(4)} ${preview.to.currency}`} bold />
            <Row label="Rate" value={`1 ${fromCurrency} = ${parseFloat(preview.rate).toFixed(4)} ${toCurrency}`} />
            <Row label="Fee (0.8%)" value={`${parseFloat(preview.fee).toFixed(4)} ${preview.feeCurrency}`} />
          </div>
        )}

        {error && <div className="alert-error">{error}</div>}

        <button
          className="btn-primary w-full"
          disabled={!amount || parseFloat(amount) <= 0 || convert.isPending}
          onClick={() => convert.mutate()}
        >
          {convert.isPending ? 'Converting…' : `Convert ${fromCurrency} → ${toCurrency}`}
          <Icon name="swap" className="w-4 h-4" />
        </button>
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
