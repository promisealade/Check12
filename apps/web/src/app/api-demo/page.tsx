'use client';

import { useState } from 'react';
import { apiClient } from '../../lib/api/client';

interface EndpointDemo {
  label: string;
  method: 'GET' | 'POST';
  path: string;
  body?: Record<string, unknown>;
  description: string;
  auth?: boolean;
}

const ENDPOINTS: EndpointDemo[] = [
  {
    label: 'Exchange rate',
    method: 'GET',
    path: '/stablecoin/rate',
    description: 'Get live AFRi/xGHS exchange rate from mock oracle',
    auth: false,
  },
  {
    label: 'Conversion preview',
    method: 'POST',
    path: '/stablecoin/preview',
    body: { direction: 'AFRi_to_xGHS', amount: '10' },
    description: 'Preview a conversion before executing',
    auth: false,
  },
  {
    label: 'Wallet balances',
    method: 'GET',
    path: '/wallets',
    description: 'Fetch all wallets with event-sourced balances (auth required)',
    auth: true,
  },
  {
    label: 'Transaction history',
    method: 'GET',
    path: '/transactions?limit=5',
    description: 'Paginated transaction history (auth required)',
    auth: true,
  },
  {
    label: 'KYC status',
    method: 'GET',
    path: '/kyc/status',
    description: 'Get current KYC tier and submitted documents (auth required)',
    auth: true,
  },
  {
    label: 'Admin metrics',
    method: 'GET',
    path: '/admin/metrics',
    description: 'Platform-wide metrics (admin auth required)',
    auth: true,
  },
];

export default function ApiDemoPage() {
  const [responses, setResponses] = useState<Record<string, { data?: object; error?: string; loading?: boolean }>>({});

  async function runEndpoint(ep: EndpointDemo) {
    const key = ep.path;
    setResponses((r) => ({ ...r, [key]: { loading: true } }));
    try {
      const res = ep.method === 'GET'
        ? await apiClient.get(ep.path)
        : await apiClient.post(ep.path, ep.body);
      setResponses((r) => ({ ...r, [key]: { data: res.data } }));
    } catch (err: any) {
      setResponses((r) => ({
        ...r,
        [key]: { error: err.response?.data?.detail ?? err.message },
      }));
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-body">AfriOne API Demo</h1>
        <p className="text-body/60 mt-2">
          Live interactive demo of the AfriOne stablecoin platform API
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Sign in at{' '}
          <a href="/login" className="text-brand-600 hover:underline">
            /login
          </a>{' '}
          first to access authenticated endpoints · Swagger UI at{' '}
          <a href="http://localhost:3001/api/docs" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
            /api/docs
          </a>
        </p>
      </div>

      {/* Architecture highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {[
          { icon: '📒', label: 'Event-sourced ledger', desc: 'Balance = SUM(credits) - SUM(debits). Append-only, immutable.' },
          { icon: '🔑', label: 'Idempotency keys', desc: 'All POST financial endpoints support 24-hour Redis-backed idempotency.' },
          { icon: '⚡', label: 'Mock integrations', desc: 'Smile ID, Paystack MoMo, Celo oracle, Fireblocks — all simulated.' },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="card text-center space-y-2">
            <div className="text-3xl">{icon}</div>
            <p className="font-medium text-gray-800">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Endpoint demos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Try the API</h2>
        {ENDPOINTS.map((ep) => {
          const state = responses[ep.path];
          return (
            <div key={ep.path} className="card space-y-3">
              <div className="flex items-start gap-3">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${
                    ep.method === 'GET'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {ep.method}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-gray-700">{ep.path}</span>
                    {ep.auth && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                        🔒 auth
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{ep.description}</p>
                </div>
                <button
                  onClick={() => runEndpoint(ep)}
                  disabled={state?.loading}
                  className="btn-primary text-sm py-1.5 px-4 shrink-0"
                >
                  {state?.loading ? '…' : 'Try'}
                </button>
              </div>

              {ep.body && (
                <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto text-gray-600">
                  {JSON.stringify(ep.body, null, 2)}
                </pre>
              )}

              {state?.data && (
                <pre className="text-xs bg-green-50 border border-green-100 rounded-lg p-3 overflow-x-auto text-green-800">
                  {JSON.stringify(state.data, null, 2)}
                </pre>
              )}

              {state?.error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {state.error}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-gray-400 py-4">
        AfriOne Prototype v0.1 · Built with NestJS + Next.js + PostgreSQL + Redis
      </div>
    </div>
  );
}
