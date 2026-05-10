'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

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
    queryFn: async () => (await apiClient.get('/stablecoin/rate')).data,
    refetchInterval: 30_000,
  });

  // Live preview as user types
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) { setPreview(null); return; }
    const timeout = setTimeout(async () => {
      try {
        const res = await apiClient.post('/stablecoin/preview', { direction, amount });
        setPreview(res.data);
      } catch {
        setPreview(null);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [amount, direction]);

  const convert = useMutation({
    mutationFn: () => apiClient.post('/stablecoin/convert', { direction, amount }),
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
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="text-6xl">✅</div>
        <h2 className="text-2xl font-bold text-gray-900">Converted!</h2>
        <div className="card text-left space-y-3">
          <Row label="From" value={`${parseFloat(result.from.amount).toFixed(4)} ${result.from.currency}`} />
          <Row label="To" value={`${parseFloat(result.to.amount).toFixed(4)} ${result.to.currency}`} />
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
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 mb-4 block">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Convert</h1>
        <p className="text-gray-500 text-sm mt-1">Swap between AFRi and xGHS</p>
      </div>

      {rate && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
          <span className="font-medium">Live rate:</span> 1 AFRi = {rate.AFRi_to_xGHS.toFixed(4)} xGHS
          <span className="text-gray-400 text-xs ml-2">(mock oracle)</span>
        </div>
      )}

      {/* Direction toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200">
        {(['AFRi_to_xGHS', 'xGHS_to_AFRi'] as Direction[]).map((d) => (
          <button
            key={d}
            onClick={() => { setDirection(d); setPreview(null); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              direction === d ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {d === 'AFRi_to_xGHS' ? 'AFRi → xGHS' : 'xGHS → AFRi'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="label">Amount in {fromCurrency}</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            {fromCurrency}
          </span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input pl-16"
          />
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="card bg-brand-50 border-brand-100 space-y-2">
          <p className="text-sm font-medium text-brand-800">Conversion preview</p>
          <div className="space-y-1 text-sm">
            <Row label="You receive" value={`${parseFloat(preview.to.amount).toFixed(4)} ${preview.to.currency}`} bold />
            <Row label="Exchange rate" value={`1 ${fromCurrency} = ${parseFloat(preview.rate).toFixed(4)} ${toCurrency}`} />
            <Row label="Fee (0.8%)" value={`${parseFloat(preview.fee).toFixed(4)} ${preview.feeCurrency}`} />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        className="btn-primary w-full"
        disabled={!amount || parseFloat(amount) <= 0 || convert.isPending}
        onClick={() => convert.mutate()}
      >
        {convert.isPending ? 'Converting…' : `Convert ${fromCurrency} → ${toCurrency}`}
      </button>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-bold text-brand-700' : 'text-gray-800'}>{value}</span>
    </div>
  );
}
