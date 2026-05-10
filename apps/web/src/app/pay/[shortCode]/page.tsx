'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

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
    queryFn: async () => (await apiClient.get(`/collections/links/${shortCode}`)).data,
    retry: false,
  });

  const pay = useMutation({
    mutationFn: () =>
      apiClient.post('/collections/pay', { shortCode, momoPhone, payerReference }),
    onSuccess: () => {
      setPaid(true);
      setError('');
    },
    onError: (err: any) =>
      setError(err.response?.data?.detail ?? err.response?.data?.message ?? 'Payment failed'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading…</div>
      </div>
    );
  }

  if (fetchError || !linkInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card text-center max-w-sm w-full space-y-4">
          <div className="text-4xl">❌</div>
          <h2 className="font-bold text-gray-800">Link not found or expired</h2>
          <p className="text-sm text-gray-500">
            This payment link is invalid, has already been used, or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card text-center max-w-sm w-full space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold text-gray-800">Payment successful!</h2>
          <p className="text-sm text-gray-500">
            {parseFloat(linkInfo.amount).toFixed(2)} {linkInfo.currency} paid successfully.
          </p>
          {linkInfo.description && (
            <p className="text-sm text-gray-400">{linkInfo.description}</p>
          )}
          <p className="text-xs text-gray-400">
            Prototype — no real funds transferred
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-600">Check12</h1>
          <p className="text-gray-500 text-sm mt-1">Secure payment</p>
        </div>

        <div className="card space-y-4">
          {/* Amount display */}
          <div className="text-center py-4 bg-gray-50 rounded-xl">
            <p className="text-4xl font-bold text-gray-900">
              {parseFloat(linkInfo.amount).toFixed(2)}
            </p>
            <p className="text-gray-500 font-medium mt-1">{linkInfo.currency}</p>
            {linkInfo.description && (
              <p className="text-sm text-gray-400 mt-2">{linkInfo.description}</p>
            )}
          </div>

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

          <div>
            <label className="label" htmlFor="reference">Reference (optional)</label>
            <input
              id="reference"
              type="text"
              placeholder="Your name or order number"
              value={payerReference}
              onChange={(e) => setPayerReference(e.target.value)}
              className="input"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            className="btn-primary w-full"
            disabled={!momoPhone || pay.isPending}
            onClick={() => pay.mutate()}
          >
            {pay.isPending ? 'Processing…' : `Pay ${parseFloat(linkInfo.amount).toFixed(2)} ${linkInfo.currency}`}
          </button>

          <p className="text-center text-xs text-gray-400">
            Expires {new Date(linkInfo.expiresAt).toLocaleDateString()} ·
            Prototype — payments are simulated
          </p>
        </div>
      </div>
    </div>
  );
}
