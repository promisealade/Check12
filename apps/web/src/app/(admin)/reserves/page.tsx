'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

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
    queryFn: async () => (await apiClient.get('/admin/reserves')).data,
  });

  const latest = reserves[0];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reserve Reconciliation</h1>
        <p className="text-gray-500 text-sm mt-1">
          Daily audit log of gold backing for AFRi stablecoin
        </p>
      </div>

      {/* Current reserve status */}
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
            sub={latest.withinTolerance ? 'Within tolerance' : 'EXCEEDS TOLERANCE'}
            ok={latest.withinTolerance}
            warn={!latest.withinTolerance}
          />
        </div>
      )}

      {/* History table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Date', 'Supply (AFRi)', 'Gold (oz)', 'Reserve ($USD)', 'Backing %', 'Status'].map(
                (h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : reserves.map((r) => (
                  <tr key={r.id} className={!r.withinTolerance ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-700">{r.date}</td>
                    <td className="px-4 py-3 text-gray-600">{parseFloat(r.circulatingSupply).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{parseFloat(r.goldOz).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      ${parseFloat(r.reserveValueUsd).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 font-semibold">{parseFloat(r.backingRatioPct).toFixed(4)}%</td>
                    <td className="px-4 py-3">
                      {r.withinTolerance ? (
                        <span className="badge-success">✓ OK</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          ⚠ Alert
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Prototype — reserve data is seeded mock data. Production integrates Fireblocks custody API.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  ok,
  warn,
}: {
  label: string;
  value: string;
  sub: string;
  ok?: boolean;
  warn?: boolean;
}) {
  const bg = warn ? 'border-red-200 bg-red-50' : ok === false ? 'border-amber-200 bg-amber-50' : '';
  return (
    <div className={`card text-center space-y-1 ${bg}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}
