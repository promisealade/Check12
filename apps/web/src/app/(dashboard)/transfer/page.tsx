'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import { Icon } from '../../../lib/icons';

type Currency = 'AFRi' | 'xGHS';
type DestType = 'afrione' | 'momo' | 'bank';

const RATE_AFRI_TO_GHS = 14.82;
const FEE_RATE = 0.005;

const MOMO_NETWORKS = [
  { value: 'momo_mtn', label: 'MTN Mobile Money' },
  { value: 'momo_vodafone', label: 'Vodafone Cash' },
  { value: 'momo_airteltigo', label: 'AirtelTigo Money' },
];

const BANKS = [
  'GCB Bank', 'Ecobank Ghana', 'Absa Ghana', 'Stanbic Bank Ghana',
  'Fidelity Bank Ghana', 'Cal Bank', 'Access Bank Ghana', 'UBA Ghana',
  'Standard Chartered Ghana', 'Zenith Bank Ghana',
];

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
  counterparty?: string;
}

export default function TransferPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [step, setStep] = useState<'form' | 'review' | 'done'>('form');
  const [destType, setDestType] = useState<DestType>('afrione');

  // AfriOne
  const [identifier, setIdentifier] = useState('');
  const [recipient, setRecipient] = useState<RecipientInfo | null>(null);
  const [lookupError, setLookupError] = useState('');

  // MoMo
  const [momoNetwork, setMomoNetwork] = useState('momo_mtn');
  const [momoPhone, setMomoPhone] = useState('');

  // Bank
  const [bankName, setBankName] = useState(BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // Common
  const [currency, setCurrency] = useState<Currency>('AFRi');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [result, setResult] = useState<SendResult | null>(null);
  const [sendError, setSendError] = useState('');

  // ── Derived amounts ──────────────────────────────────────────────────────
  const parsedAmount = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const fee = parsedAmount > 0 ? Math.max(0.01, parsedAmount * FEE_RATE) : 0;
  const totalDeducted = parsedAmount + fee;

  const destAmountGhs = useMemo(() => {
    if (parsedAmount <= 0) return 0;
    return currency === 'AFRi' ? parsedAmount * RATE_AFRI_TO_GHS : parsedAmount;
  }, [parsedAmount, currency]);

  // AfriOne-to-AfriOne: recipient gets same currency
  const destLabel =
    destType === 'afrione'
      ? `${parsedAmount.toFixed(2)} ${currency}`
      : `GHS ${destAmountGhs.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Lookup AfriOne user ─────────────────────────────────────────────────
  const lookup = useMutation({
    mutationFn: () => apiClient.post<RecipientInfo>('/transfers/lookup', { identifier }),
    onSuccess: (res) => { setRecipient(res.data); setLookupError(''); },
    onError: (err: any) => setLookupError(err.response?.data?.detail ?? 'Recipient not found'),
  });

  // ── Validate form before review ─────────────────────────────────────────
  const canReview = useMemo(() => {
    if (parsedAmount <= 0) return false;
    if (destType === 'afrione') return !!recipient;
    if (destType === 'momo') return momoPhone.length >= 10;
    if (destType === 'bank') return accountNumber.length >= 10 && accountName.trim().length > 0;
    return false;
  }, [parsedAmount, destType, recipient, momoPhone, accountNumber, accountName]);

  // ── Send ────────────────────────────────────────────────────────────────
  const send = useMutation({
    mutationFn: async () => {
      if (destType === 'afrione') {
        return apiClient.post<SendResult>('/transfers/send', {
          recipientIdentifier: identifier, currency, amount, note,
        });
      }
      return apiClient.post<SendResult>('/transfers/send-external', {
        currency, amount, note, destType,
        ...(destType === 'momo' ? { momoNetwork, momoPhone } : {}),
        ...(destType === 'bank' ? { bankName, accountNumber, accountName } : {}),
      });
    },
    onSuccess: (res) => {
      setResult(res.data);
      setSendError('');
      setStep('done');
      qc.invalidateQueries({ queryKey: ['wallet-dashboard'] });
      qc.invalidateQueries({ queryKey: ['transactions-stats'] });
    },
    onError: (err: any) =>
      setSendError(err.response?.data?.detail ?? err.response?.data?.message ?? 'Transfer failed'),
  });

  // ── Done screen ─────────────────────────────────────────────────────────
  if (step === 'done' && result) {
    const flagged = result.amlStatus === 'flagged';
    const destName =
      destType === 'afrione'
        ? recipient?.displayName ?? ''
        : result.counterparty ?? '';

    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6">
        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
          flagged ? 'bg-sand-100 text-gold-700' : 'bg-sage-100 text-brand-700'
        }`}>
          <Icon name={flagged ? 'warning' : 'checkCircle'} className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-semibold text-brand-700">
            {flagged ? 'Transfer under review' : 'Sent successfully'}
          </h2>
          <p className="text-muted-500 mt-1 text-sm">
            {flagged
              ? 'Funds may be held while our compliance team reviews this transfer.'
              : `${parseFloat(result.amount).toFixed(2)} ${result.currency} is on its way.`}
          </p>
        </div>
        {flagged && (
          <div className="bg-sand-50 border border-sand-200 rounded-2xl px-4 py-3 text-sm text-gold-700 text-left">
            This transfer was flagged for AML review. Our compliance team will be in touch within 24 hours.
          </div>
        )}
        <div className="bg-white rounded-[24px] ring-1 ring-muted-100 shadow-card p-5 text-left space-y-2.5">
          <SummaryRow label="To" value={destName} />
          <SummaryRow label="You sent" value={`${parseFloat(result.amount).toFixed(2)} ${result.currency}`} />
          <SummaryRow label="Fee" value={`${parseFloat(result.fee).toFixed(4)} ${result.currency}`} />
          <div className="border-t border-muted-100 pt-2.5">
            <SummaryRow label="New balance" value={`${parseFloat(result.newBalance).toFixed(2)} ${result.currency}`} bold />
          </div>
        </div>
        <button className="btn-primary w-full" onClick={() => router.replace('/wallet')}>
          Back to home
        </button>
      </div>
    );
  }

  // ── Review screen ───────────────────────────────────────────────────────
  if (step === 'review') {
    const destName =
      destType === 'afrione'
        ? recipient!.displayName
        : destType === 'momo'
        ? `${momoPhone} · ${MOMO_NETWORKS.find((n) => n.value === momoNetwork)?.label}`
        : `${accountName} · ${bankName}`;

    return (
      <div className="max-w-md mx-auto py-8 px-4 space-y-6">
        <div>
          <button onClick={() => setStep('form')} className="btn-ghost -ml-3 mb-2">
            <Icon name="back" className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-display font-semibold text-brand-700">Review transfer</h1>
          <p className="text-sm text-muted-500 mt-1">Confirm the details before sending.</p>
        </div>

        {/* Amount flow */}
        <div className="bg-white rounded-[28px] ring-1 ring-muted-100 shadow-card overflow-hidden">
          <div className="p-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-400">You send</p>
            <p className="font-display text-3xl font-semibold text-brand-700 tabular-nums">
              {parsedAmount.toFixed(2)} <span className="text-lg font-normal text-muted-500">{currency}</span>
            </p>
            {currency === 'AFRi' && (
              <p className="text-sm text-muted-500 tabular-nums">
                ≈ GHS {(parsedAmount * RATE_AFRI_TO_GHS).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 px-5 py-2 bg-parchment/60 border-y border-muted-100">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Icon name="arrowDown" className="w-4 h-4" />
            </span>
            <div className="text-xs text-muted-500">
              Fee: <span className="text-brand-700 font-medium">{fee.toFixed(4)} {currency}</span>
              {currency === 'AFRi' && (
                <span className="text-muted-400"> · Rate: 1 AFRi = {RATE_AFRI_TO_GHS} GHS</span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-400">
              {destType === 'afrione' ? 'Recipient receives' : 'Destination receives'}
            </p>
            <p className="font-display text-3xl font-semibold text-brand-700 tabular-nums">
              {destType === 'afrione'
                ? <>{parsedAmount.toFixed(2)} <span className="text-lg font-normal text-muted-500">{currency}</span></>
                : <>GHS {destAmountGhs.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
              }
            </p>
            {destType !== 'afrione' && currency === 'AFRi' && (
              <p className="text-sm text-muted-500 tabular-nums">
                {parsedAmount.toFixed(2)} AFRi × {RATE_AFRI_TO_GHS} = GHS {destAmountGhs.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Destination */}
        <div className="bg-white rounded-[24px] ring-1 ring-muted-100 shadow-card p-5 space-y-2.5">
          <SummaryRow
            label="To"
            value={destName}
          />
          <SummaryRow
            label="Via"
            value={
              destType === 'afrione' ? 'AfriOne wallet'
              : destType === 'momo' ? MOMO_NETWORKS.find((n) => n.value === momoNetwork)?.label ?? momoNetwork
              : bankName
            }
          />
          <SummaryRow label="Total deducted" value={`${totalDeducted.toFixed(4)} ${currency}`} bold />
          {note && <SummaryRow label="Note" value={note} />}
        </div>

        {sendError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
            {sendError}
          </div>
        )}

        <button
          className="btn-primary w-full"
          disabled={send.isPending}
          onClick={() => send.mutate()}
        >
          {send.isPending ? 'Sending…' : `Confirm & send`}
          <Icon name="send" className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ── Form screen ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      <div>
        <button onClick={() => router.back()} className="btn-ghost -ml-3 mb-2">
          <Icon name="back" className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-display font-semibold text-brand-700">Send money</h1>
        <p className="text-sm text-muted-500 mt-1">Transfer AFRi or xGHS instantly.</p>
      </div>

      {/* Destination type tabs */}
      <div className="flex gap-1.5 bg-muted-100/60 rounded-2xl p-1">
        {([
          { key: 'afrione', label: 'AfriOne user', icon: 'user' },
          { key: 'momo', label: 'Mobile Money', icon: 'phone' },
          { key: 'bank', label: 'Bank', icon: 'bank' },
        ] as const).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => { setDestType(key); setRecipient(null); setLookupError(''); }}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              destType === key
                ? 'bg-white text-brand-700 shadow-pop ring-1 ring-muted-100'
                : 'text-muted-500 hover:text-brand-700'
            }`}
          >
            <Icon name={icon} className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[28px] ring-1 ring-muted-100 shadow-card p-5 space-y-5">
        {/* ── AfriOne user ── */}
        {destType === 'afrione' && (
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-400">Recipient</label>
            {recipient ? (
              <div className="rounded-2xl bg-sage-50 border border-sage-100 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold shrink-0">
                  {recipient.displayName[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-700 truncate">{recipient.displayName}</p>
                  <p className="text-xs text-muted-500">{recipient.phone} · Tier {recipient.tier}</p>
                </div>
                <button
                  onClick={() => { setRecipient(null); setIdentifier(''); setLookupError(''); }}
                  className="text-xs text-muted-400 hover:text-brand-700 font-medium"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Phone number or email"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setLookupError(''); }}
                  className="input"
                />
                {lookupError && (
                  <p className="text-xs text-red-500">{lookupError}</p>
                )}
                <button
                  className="btn-secondary w-full"
                  disabled={!identifier || lookup.isPending}
                  onClick={() => lookup.mutate()}
                >
                  {lookup.isPending ? 'Searching…' : 'Find recipient'}
                  <Icon name="search" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Mobile Money ── */}
        {destType === 'momo' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-400 block mb-2">Network</label>
              <div className="grid grid-cols-3 gap-2">
                {MOMO_NETWORKS.map((n) => (
                  <button
                    key={n.value}
                    onClick={() => setMomoNetwork(n.value)}
                    className={`py-2 px-1 rounded-xl border text-xs font-semibold text-center transition-colors ${
                      momoNetwork === n.value
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-muted-200 text-muted-500 hover:border-muted-300'
                    }`}
                  >
                    {n.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-400 block mb-1.5">
                Mobile Money number
              </label>
              <input
                type="tel"
                placeholder="+233244000001"
                value={momoPhone}
                onChange={(e) => setMomoPhone(e.target.value)}
                className="input"
              />
            </div>
          </div>
        )}

        {/* ── Bank Account ── */}
        {destType === 'bank' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-400 block mb-1.5">Bank</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="input"
              >
                {BANKS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-400 block mb-1.5">Account number</label>
              <input
                type="text"
                placeholder="0012345678"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="input tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-400 block mb-1.5">Account name</label>
              <input
                type="text"
                placeholder="Kwame Mensah"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="input"
              />
            </div>
          </div>
        )}

        {/* ── Currency ── */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-400 block mb-2">Currency</label>
          <div className="flex gap-2">
            {(['AFRi', 'xGHS'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`flex-1 py-2.5 rounded-2xl border text-sm font-semibold transition-colors ${
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

        {/* ── Amount ── */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-400 block mb-1.5">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-400 text-sm font-medium pointer-events-none">
              {currency}
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

          {/* Live source → destination display */}
          {parsedAmount > 0 && (
            <div className="mt-3 rounded-2xl bg-parchment/80 border border-muted-100 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-500">You send</span>
                <span className="font-semibold text-brand-700 tabular-nums">
                  {parsedAmount.toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-500">Fee (0.5%)</span>
                <span className="text-muted-500 tabular-nums">− {fee.toFixed(4)} {currency}</span>
              </div>
              <div className="border-t border-muted-100 pt-2 flex items-center justify-between text-sm font-semibold">
                <span className="text-brand-700">
                  {destType === 'afrione' ? 'Recipient gets' : 'Destination receives'}
                </span>
                <span className="text-brand-700 tabular-nums">{destLabel}</span>
              </div>
              {destType !== 'afrione' && currency === 'AFRi' && (
                <p className="text-xs text-muted-400 tabular-nums">
                  Rate: 1 AFRi = {RATE_AFRI_TO_GHS} GHS
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Note ── */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-400 block mb-1.5">
            Note <span className="normal-case font-normal text-muted-400">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="What's this for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input"
          />
        </div>

        <button
          className="btn-primary w-full"
          disabled={!canReview}
          onClick={() => { setSendError(''); setStep('review'); }}
        >
          Review transfer
          <Icon name="arrowUpRight" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-muted-500 shrink-0">{label}</span>
      <span className={`text-right ${bold ? 'font-semibold text-brand-700' : 'text-brand-700'}`}>{value}</span>
    </div>
  );
}
