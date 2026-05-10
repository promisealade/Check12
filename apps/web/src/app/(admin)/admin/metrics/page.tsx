'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api/client';
import { Icon, type IconName } from '../../../../lib/icons';

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
    queryFn: async () => (await apiClient.get<Metrics>('/admin/metrics')).data,
    refetchInterval: 60_000,
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="h1">Admin dashboard</h1>
        <p className="subtle mt-1">Platform overview · live mock metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total users" value={data?.totalUsers ?? 0} icon="user" loading={isLoading} />
        <MetricCard label="Pending KYC" value={data?.pendingKyc ?? 0} icon="id" alert={(data?.pendingKyc ?? 0) > 0} loading={isLoading} />
        <MetricCard label="AML alerts" value={data?.pendingAml ?? 0} icon="alert" alert={(data?.pendingAml ?? 0) > 0} loading={isLoading} />
        <MetricCard label="Transactions" value={data?.totalTransactions ?? 0} icon="trending" loading={isLoading} />
      </div>

      {data?.volume && data.volume.length > 0 && (
        <div className="card space-y-4">
          <h2 className="h2">Transaction volume</h2>
          <div className="space-y-2">
            {data.volume.map((v) => (
              <div key={v.currency} className="flex justify-between items-center text-sm">
                <span className="text-muted-600 font-medium">{v.currency}</span>
                <span className="font-semibold text-brand-700 tabular-nums">
                  {parseFloat(v.volume).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/kyc', label: 'KYC queue', icon: 'id' as IconName, count: data?.pendingKyc },
          { href: '/admin/aml', label: 'AML alerts', icon: 'alert' as IconName, count: data?.pendingAml },
          { href: '/admin/reserves', label: 'Reserves', icon: 'shieldCheck' as IconName, count: null as number | null },
        ].map(({ href, label, icon, count }) => (
          <Link
            key={href}
            href={href}
            className="card hover:border-brand-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <Icon name={icon} className="w-5 h-5" />
              </span>
              <p className="font-medium text-brand-700">{label}</p>
            </div>
            {count !== null && count !== undefined && count > 0 && (
              <span className="badge-warning">
                {count} pending review
              </span>
            )}
            {count === 0 && <span className="badge-success">All clear</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label, value, icon, alert, loading,
}: {
  label: string; value: number; icon: IconName; alert?: boolean; loading?: boolean;
}) {
  if (loading) {
    return <div className="h-28 bg-white/70 border border-muted-100 rounded-3xl animate-pulse" />;
  }
  return (
    <div className={`card flex flex-col gap-3 ${alert ? 'border-gold-200 bg-gold-50/40' : ''}`}>
      <div className="flex items-center justify-between">
        <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
          alert ? 'bg-gold-100 text-gold-500' : 'bg-brand-50 text-brand-700'
        }`}>
          <Icon name={icon} className="w-5 h-5" />
        </span>
      </div>
      <div>
        <p className="text-3xl font-semibold text-brand-700 tabular-nums">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
