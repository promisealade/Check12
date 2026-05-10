'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

type Currency = 'AFRi' | 'xGHS';

interface RecipientInfo {
  userId: string;
  displayName: string;
  phone: string;
  tier: number;
}

interface SendResult {
  transactionId: string;
  amount: string;
  fee: string;
  currency: string;
  newBalance: string;
  amlStatus: string;
}

export default function TransferPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [step, setStep] = useState<'lookup' | 'confirm' | 'done'>('lookup');
  const [identifier, setIdentifier] = useState('');
  const [recipient, setRecipient] = useState<RecipientInfo | null>(null);
  const [currency, setCurrency] = useState<Currency>('AFRi');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState('');

  const lookup = useMutation({
    mutationFn: () => apiClient.post('/transfers/lookup', { identifier }),
    onSuccess: (res) => {
      setRecipient(res.data);
      setError('');
      setStep('confirm');
    },
    onError: (err: any) =>
      setError(err.response?.data?.detail ?? 'Recipient not found'),
  });

  const send = useMutation({
    mutationFn: () =>
      apiClient.post('/transfers/send', {
        recipientIdentifier: identifier,
        currency,
        amount,
        note,
      }),
    onSuccess: (res) => {
      setResult(res.data);
      setError('');
      setStep('done');
      qc.invalidateQueries({ queryKey: ['wallet-dashboard'] });
    },
    onError: (err: any) =>
      setError(err.response?.data?.detail ?? err.response?.data?.message ?? 'Transfer failed'),
  });

  if (step === 'done' && result) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="text-6xl">{result.amlStatus === 'flagged' ? '⚠️' : '✅'}</div>
        <h2 className="text-2xl font-bold text-gray-900">
          {result.amlStatus === 'flagged' ? 'Transfer under review' : 'Sent!'}
        </h2>
        {result.amlStatus === 'flagged' && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-2">
            This transfer has been flagged for AML review. Funds may be held temporarily.
          </p>
        )}
        <div className="card text-left space-y-3">
          <Row label="To" value={recipient?.displayName ?? ''} />
          <Row label="Amount" value={`${parseFloat(result.amount).toFixed(2)} ${result.currency}`} />
          <Row label="Fee" value={`${parseFloat(result.fee).toFixed(2)} ${result.currency}`} />
          <Row label="New balance" value={`${parseFloat(result.newBalance).toFixed(2)} ${result.currency}`} bold />
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
        <h1 className="text-2xl font-bold text-gray-900">Send money</h1>
        <p className="text-gray-500 text-sm mt-1">Transfer AFRi or xGHS to another user</p>
      </div>

      {step === 'lookup' && (
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="identifier">Recipient phone or email</label>
            <input
              id="identifier"
              type="text"
              placeholder="+233244000002 or kofi@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="input"
            />
          </div>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <button
            className="btn-primary w-full"
            disabled={!identifier || lookup.isPending}
            onClick={() => lookup.mutate()}
          >
            {lookup.isPending ? 'Looking up…' : 'Find recipient'}
          </button>
        </div>
      )}

      {step === 'confirm' && recipient && (
        <div className="space-y-4">
          {/* Recipient card */}
          <div className="card bg-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
              {recipient.displayName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-800">{recipient.displayName}</p>
              <p className="text-xs text-gray-400">{recipient.phone} · Tier {recipient.tier}</p>
            </div>
            <button onClick={() => { setStep('lookup'); setRecipient(null); setError(''); }} className="ml-auto text-xs text-gray-400 hover:text-gray-600">
              Change
            </button>
          </div>

          {/* Currency */}
          <div>
            <label className="label">Currency</label>
            <div className="flex gap-3">
              {(['AFRi', 'xGHS'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                    currency === c ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="label" htmlFor="amount">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{currency}</span>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input pl-16"
              />
            </div>
            {amount && parseFloat(amount) > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Fee: {(parseFloat(amount) * 0.005).toFixed(4)} {currency} (0.5%) ·
                Total: {(parseFloat(amount) * 1.005).toFixed(4)} {currency}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="label" htmlFor="note">Note (optional)</label>
            <input
              id="note"
              type="text"
              placeholder="What's this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button
            className="btn-primary w-full"
            disabled={!amount || parseFloat(amount) <= 0 || send.isPending}
            onClick={() => send.mutate()}
          >
            {send.isPending ? 'Sending…' : `Send ${currency}`}
          </button>
        </div>
      )}
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
