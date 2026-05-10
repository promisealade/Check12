'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

type Currency = 'AFRi' | 'xGHS';

interface PaymentLink {
  id: string;
  shortCode: string;
  amount: string;
  currency: string;
  description: string | null;
  status: 'active' | 'paid' | 'expired';
  expiresAt: string;
  paidAt: string | null;
  paymentUrl: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'badge-success',
  paid: 'bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium',
  expired: 'bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs font-medium',
};

export default function CollectionsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', currency: 'AFRi' as Currency, description: '', expiresInHours: 72 });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const { data: links = [] } = useQuery<PaymentLink[]>({
    queryKey: ['payment-links'],
    queryFn: async () => (await apiClient.get('/collections/links')).data,
  });

  const createLink = useMutation({
    mutationFn: () => apiClient.post('/collections/links', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-links'] });
      setShowForm(false);
      setForm({ amount: '', currency: 'AFRi', description: '', expiresInHours: 72 });
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Failed to create link'),
  });

  function copyLink(url: string, id: string) {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment collections</h1>
          <p className="text-gray-500 text-sm mt-1">Create links for customers to pay you</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New link
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-800">New payment link</h2>

          <div className="flex gap-3">
            {(['AFRi', 'xGHS'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setForm((f) => ({ ...f, currency: c }))}
                className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                  form.currency === c ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Amount ({form.currency})</label>
            <input
              type="number"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="input"
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <input
              type="text"
              placeholder="Invoice #INV-001, Service fee…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input"
            />
          </div>

          <div>
            <label className="label">Expires in</label>
            <select
              value={form.expiresInHours}
              onChange={(e) => setForm((f) => ({ ...f, expiresInHours: parseInt(e.target.value) }))}
              className="input"
            >
              <option value={24}>24 hours</option>
              <option value={72}>3 days</option>
              <option value={168}>7 days</option>
            </select>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Cancel</button>
            <button
              className="btn-primary flex-1"
              disabled={!form.amount || createLink.isPending}
              onClick={() => createLink.mutate()}
            >
              {createLink.isPending ? 'Creating…' : 'Create link'}
            </button>
          </div>
        </div>
      )}

      {/* Links list */}
      {links.length === 0 ? (
        <div className="card text-center py-10 text-gray-400 text-sm">
          No payment links yet. Create one to start collecting.
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-gray-700">{link.shortCode}</span>
                    <span className={STATUS_STYLES[link.status]}>{link.status}</span>
                  </div>
                  {link.description && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{link.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Expires {new Date(link.expiresAt).toLocaleDateString()}
                    {link.paidAt && ` · Paid ${new Date(link.paidAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">{parseFloat(link.amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{link.currency}</p>
                </div>
              </div>

              {link.status === 'active' && (
                <button
                  onClick={() => copyLink(link.paymentUrl ?? `/pay/${link.shortCode}`, link.id)}
                  className="w-full text-sm text-brand-600 border border-brand-200 rounded-lg py-2 hover:bg-brand-50 transition-colors"
                >
                  {copied === link.id ? '✓ Copied!' : '📋 Copy payment link'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
