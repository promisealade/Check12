'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import { Icon } from '../../../lib/icons';

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
    mutationFn: () => apiClient.post<RecipientInfo>('/transfers/lookup', { identifier }),
    onSuccess: (res) => {
      setRecipient(res.data);
      setError('');
      setStep('confirm');
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Recipient not found'),
  });

  const send = useMutation({
    mutationFn: () =>
      apiClient.post<SendResult>('/transfers/send', {
        recipientIdentifier: identifier, currency, amount, note,
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
    const flagged = result.amlStatus === 'flagged';
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6">
        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
          flagged ? 'bg-warn-50 text-warn-700' : 'bg-success-50 text-success-700'
        }`}>
          <Icon name={flagged ? 'warning' : 'checkCircle'} className="w-10 h-10" />
        </div>
        <div>
          <h2 className="h1">{flagged ? 'Transfer under review' : 'Sent successfully'}</h2>
          <p className="subtle mt-1">
            {flagged
              ? 'Funds may be held while we review.'
              : `${parseFloat(result.amount).toFixed(2)} ${result.currency} on its way.`}
          </p>
        </div>
        {flagged && (
          <div className="alert-warning text-left">
            This transfer was flagged for AML review. Our compliance team will be in touch.
          </div>
        )}
        <div className="card text-left space-y-2.5">
          <Row label="To" value={recipient?.displayName ?? ''} />
          <Row label="Amount" value={`${parseFloat(result.amount).toFixed(2)} ${result.currency}`} />
          <Row label="Fee" value={`${parseFloat(result.fee).toFixed(2)} ${result.currency}`} />
          <div className="border-t border-muted-100 pt-2.5">
            <Row label="New balance" value={`${parseFloat(result.newBalance).toFixed(2)} ${result.currency}`} bold />
          </div>
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
        <h1 className="h1">Send money</h1>
        <p className="subtle mt-1">Transfer AFRi or xGHS to another user.</p>
      </div>

      {step === 'lookup' && (
        <div className="card space-y-4">
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
          {error && <div className="alert-error">{error}</div>}
          <button
            className="btn-primary w-full"
            disabled={!identifier || lookup.isPending}
            onClick={() => lookup.mutate()}
          >
            {lookup.isPending ? 'Looking up…' : 'Find recipient'}
            <Icon name="arrowUpRight" className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 'confirm' && recipient && (
        <div className="card space-y-5">
          {/* Recipient */}
          <div className="rounded-2xl bg-parchment/70 border border-muted-100 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
              {recipient.displayName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-brand-700 truncate">{recipient.displayName}</p>
              <p className="text-xs text-muted-500">
                {recipient.phone} · Tier {recipient.tier}
              </p>
            </div>
            <button
              onClick={() => { setStep('lookup'); setRecipient(null); setError(''); }}
              className="btn-ghost text-xs"
            >
              Change
            </button>
          </div>

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
            <label className="label" htmlFor="amount">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-400 text-sm font-medium">
                {currency}
              </span>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input pl-16 tabular-nums"
              />
            </div>
            {amount && parseFloat(amount) > 0 && (
              <p className="text-xs text-muted-500 mt-1.5 tabular-nums">
                Fee {(parseFloat(amount) * 0.005).toFixed(4)} {currency} (0.5%)
                <span className="text-muted-300 mx-1.5">·</span>
                Total {(parseFloat(amount) * 1.005).toFixed(4)} {currency}
              </p>
            )}
          </div>

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

          {error && <div className="alert-error">{error}</div>}

          <button
            className="btn-primary w-full"
            disabled={!amount || parseFloat(amount) <= 0 || send.isPending}
            onClick={() => send.mutate()}
          >
            {send.isPending ? 'Sending…' : `Send ${currency}`}
            <Icon name="send" className="w-4 h-4" />
          </button>
        </div>
      )}
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
