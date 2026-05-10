'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';
import { Icon } from '../../../lib/icons';

interface PaymentLinkInfo {
  shortCode: string;
  amount: string;
  currency: string;
  description: string | null;
  expiresAt: string;
}

export default function GuestPayPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [momoPhone, setMomoPhone] = useState('');
  const [payerReference, setPayerReference] = useState('');
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');

  const { data: linkInfo, isLoading, error: fetchError } = useQuery<PaymentLinkInfo>({
    queryKey: ['payment-link', shortCode],
    queryFn: async () => (await apiClient.get<PaymentLinkInfo>(`/collections/links/${shortCode}`)).data,
    retry: false,
  });

  const pay = useMutation({
    mutationFn: () =>
      apiClient.post('/collections/pay', { shortCode, momoPhone, payerReference }),
    onSuccess: () => { setPaid(true); setError(''); },
    onError: (err: any) =>
      setError(err.response?.data?.detail ?? err.response?.data?.message ?? 'Payment failed'),
  });

  return (
    <div className="min-h-screen bg-parchment relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-32 w-96 h-96 bg-gold-200/40 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 w-96 h-96 bg-sage-200/40 rounded-full blur-3xl" />

      <div className="relative min-h-screen flex flex-col px-4 py-10">
        <div className="flex items-center gap-2 self-center sm:self-start mb-8">
          <BrandMark className="w-8 h-8 text-gold-500" />
          <span className="font-display font-semibold text-brand-700 text-xl tracking-tight">Afrione</span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            {isLoading ? (
              <div className="card animate-pulse h-64" />
            ) : fetchError || !linkInfo ? (
              <div className="card text-center space-y-3">
                <div className="mx-auto w-14 h-14 rounded-full bg-danger-50 text-danger-700 flex items-center justify-center">
                  <Icon name="xCircle" className="w-7 h-7" />
                </div>
                <h2 className="font-display font-semibold text-brand-700">Link not found or expired</h2>
                <p className="text-sm text-muted-500">
                  This payment link is invalid, has already been used, or has expired.
                </p>
              </div>
            ) : paid ? (
              <div className="card text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-sage-200 text-brand-700 flex items-center justify-center">
                  <Icon name="checkCircle" className="w-9 h-9" />
                </div>
                <h2 className="font-display text-xl font-semibold text-brand-700">Payment successful</h2>
                <p className="text-sm text-muted-500">
                  {parseFloat(linkInfo.amount).toFixed(2)} {linkInfo.currency} paid.
                </p>
                {linkInfo.description && (
                  <p className="text-sm text-muted-400">{linkInfo.description}</p>
                )}
                <p className="text-xs text-muted-400 pt-2">
                  Prototype — no real funds transferred.
                </p>
              </div>
            ) : (
              <div className="card space-y-5">
                <div className="text-center py-5 rounded-2xl bg-parchment/70 ring-1 ring-muted-100">
                  <p className="font-display text-4xl font-semibold text-brand-700 tabular-nums">
                    {parseFloat(linkInfo.amount).toFixed(2)}
                  </p>
                  <p className="text-muted-500 font-medium mt-1">{linkInfo.currency}</p>
                  {linkInfo.description && (
                    <p className="text-sm text-muted-400 mt-2 px-4">{linkInfo.description}</p>
                  )}
                </div>

                <div>
                  <label className="label" htmlFor="momoPhone">Mobile money number</label>
                  <input
                    id="momoPhone" type="tel" placeholder="+233244000000"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="reference">Reference (optional)</label>
                  <input
                    id="reference" type="text" placeholder="Your name or order number"
                    value={payerReference}
                    onChange={(e) => setPayerReference(e.target.value)}
                    className="input"
                  />
                </div>

                {error && <div className="alert-error">{error}</div>}

                <button
                  className="btn-primary w-full"
                  disabled={!momoPhone || pay.isPending}
                  onClick={() => pay.mutate()}
                >
                  {pay.isPending ? 'Processing…' : `Pay ${parseFloat(linkInfo.amount).toFixed(2)} ${linkInfo.currency}`}
                  <Icon name="arrowUpRight" className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-muted-400">
                  Expires {new Date(linkInfo.expiresAt).toLocaleDateString()} · Prototype simulation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
      <g strokeLinecap="round" strokeLinejoin="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse key={deg} cx="16" cy="9" rx="2.6" ry="6" transform={`rotate(${deg} 16 16)`} />
        ))}
        <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
