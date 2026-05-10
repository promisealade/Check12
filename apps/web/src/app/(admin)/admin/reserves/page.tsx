'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api/client';
import { Icon } from '../../../../lib/icons';

interface Reserve {
  id: string;
  date: string;
  currency: string;
  circulatingSupply: string;
  goldOz: string;
  goldPriceUsd: string;
  reserveValueUsd: string;
  backingRatioPct: string;
  discrepancyPct: string;
  withinTolerance: boolean;
}

export default function ReservesPage() {
  const { data: reserves = [], isLoading } = useQuery<Reserve[]>({
    queryKey: ['admin-reserves'],
    queryFn: async () => (await apiClient.get<Reserve[]>('/admin/reserves')).data,
  });

  const latest = reserves[0];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="h1">Reserve reconciliation</h1>
        <p className="subtle mt-1">Daily audit log of gold backing for AFRi.</p>
      </div>

      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Backing ratio"
            value={`${parseFloat(latest.backingRatioPct).toFixed(2)}%`}
            sub="of circulation"
            ok={parseFloat(latest.backingRatioPct) >= 100}
          />
          <StatCard
            label="Circulating supply"
            value={parseFloat(latest.circulatingSupply).toFixed(2)}
            sub="AFRi"
          />
          <StatCard
            label="Gold reserves"
            value={`${parseFloat(latest.goldOz).toFixed(2)} oz`}
            sub={`@ $${parseFloat(latest.goldPriceUsd).toFixed(2)}/oz`}
          />
          <StatCard
            label="Discrepancy"
            value={`${(parseFloat(latest.discrepancyPct) * 100).toFixed(4)}%`}
            sub={latest.withinTolerance ? 'Within tolerance' : 'Exceeds tolerance'}
            ok={latest.withinTolerance}
            warn={!latest.withinTolerance}
          />
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-parchment/60 border-b border-muted-100">
            <tr>
              {['Date', 'Supply (AFRi)', 'Gold (oz)', 'Reserve ($USD)', 'Backing %', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-muted-100">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 bg-muted-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : reserves.map((r) => (
                  <tr key={r.id} className={!r.withinTolerance ? 'bg-danger-50/40' : ''}>
                    <td className="px-4 py-3 font-medium text-muted-700">{r.date}</td>
                    <td className="px-4 py-3 text-muted-600 tabular-nums">{parseFloat(r.circulatingSupply).toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-600 tabular-nums">{parseFloat(r.goldOz).toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-600 tabular-nums">
                      ${parseFloat(r.reserveValueUsd).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{parseFloat(r.backingRatioPct).toFixed(4)}%</td>
                    <td className="px-4 py-3">
                      {r.withinTolerance ? (
                        <span className="badge-success inline-flex items-center gap-1">
                          <Icon name="check" className="w-3 h-3" /> OK
                        </span>
                      ) : (
                        <span className="badge-error inline-flex items-center gap-1">
                          <Icon name="warning" className="w-3 h-3" /> Alert
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-400 text-center">
        Prototype — reserve data is mock.
      </p>
    </div>
  );
}

function StatCard({
  label, value, sub, ok, warn,
}: { label: string; value: string; sub: string; ok?: boolean; warn?: boolean }) {
  const bg = warn
    ? 'border-red-200 bg-danger-50/60'
    : ok === false
      ? 'border-amber-200 bg-warn-50/60'
      : '';
  return (
    <div className={`card text-center space-y-1 ${bg}`}>
      <p className="text-xs text-muted-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-semibold text-brand-700 tabular-nums">{value}</p>
      <p className="text-xs text-muted-400">{sub}</p>
    </div>
  );
}
