'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api/client';

interface Metrics {
  totalUsers: number;
  pendingKyc: number;
  pendingAml: number;
  totalTransactions: number;
  volume: Array<{ currency: string; volume: string }>;
}

export default function AdminMetricsPage() {
  const { data, isLoading } = useQuery<Metrics>({
    queryKey: ['admin-metrics'],
    queryFn: async () => (await apiClient.get('/admin/metrics')).data,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Platform overview</p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/kyc" className="btn-secondary">KYC Queue</Link>
          <Link href="/admin/aml" className="btn-secondary">AML Alerts</Link>
          <Link href="/admin/reserves" className="btn-secondary">Reserves</Link>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total users" value={data?.totalUsers ?? 0} icon="👤" />
        <MetricCard label="Pending KYC" value={data?.pendingKyc ?? 0} icon="🪪" alert={(data?.pendingKyc ?? 0) > 0} />
        <MetricCard label="AML alerts" value={data?.pendingAml ?? 0} icon="⚠️" alert={(data?.pendingAml ?? 0) > 0} />
        <MetricCard label="Transactions" value={data?.totalTransactions ?? 0} icon="💸" />
      </div>

      {/* Volume */}
      {data?.volume && data.volume.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-800">Transaction volume</h2>
          {data.volume.map((v) => (
            <div key={v.currency} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{v.currency}</span>
              <span className="font-bold text-gray-900">
                {parseFloat(v.volume).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: '/admin/kyc', label: 'Review KYC queue', icon: '🪪', count: data?.pendingKyc },
          { href: '/admin/aml', label: 'AML alert review', icon: '⚠️', count: data?.pendingAml },
          { href: '/admin/reserves', label: 'Reserve report', icon: '🏦', count: null },
        ].map(({ href, label, icon, count }) => (
          <Link
            key={href}
            href={href}
            className="card hover:border-brand-200 transition-colors text-center space-y-2"
          >
            <div className="text-3xl">{icon}</div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            {count !== null && count !== undefined && count > 0 && (
              <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {count} pending
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  alert,
}: {
  label: string;
  value: number;
  icon: string;
  alert?: boolean;
}) {
  return (
    <div className={`card text-center space-y-2 ${alert ? 'border-amber-200 bg-amber-50' : ''}`}>
      <div className="text-3xl">{icon}</div>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
