'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api/client';

interface AmlAlert {
  id: string;
  transactionId: string;
  userId: string;
  ruleTriggered: string;
  amount: string;
  currency: string;
  status: 'pending' | 'cleared' | 'escalated';
  sarFiled: boolean;
  notes: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  cleared: 'bg-green-100 text-green-700',
  escalated: 'bg-red-100 text-red-700',
};

export default function AdminAmlPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: alerts = [] } = useQuery<AmlAlert[]>({
    queryKey: ['admin-aml-alerts', statusFilter],
    queryFn: async () =>
      (await apiClient.get(`/admin/aml-alerts?status=${statusFilter}`)).data,
  });

  const review = useMutation({
    mutationFn: ({
      alertId,
      decision,
      sarFiled,
    }: {
      alertId: string;
      decision: 'cleared' | 'escalated';
      sarFiled?: boolean;
    }) => apiClient.post(`/admin/aml-alerts/${alertId}/review`, { decision, sarFiled }),
    onSuccess: (_, vars) => {
      setMessage(`Alert ${vars.decision}${vars.sarFiled ? ' — SAR filed' : ''}`);
      setError('');
      qc.invalidateQueries({ queryKey: ['admin-aml-alerts'] });
      qc.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Review failed'),
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AML Alert Review</h1>
          <p className="text-gray-500 text-sm mt-1">Anti-money laundering flagged transactions</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm">
          {(['pending', 'cleared', 'escalated'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 capitalize transition-colors ${
                statusFilter === s ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No {statusFilter} alerts</div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-500">{alert.ruleTriggered}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[alert.status]}`}>
                      {alert.status}
                    </span>
                    {alert.sarFiled && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        SAR filed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    User: {alert.userId.slice(0, 8)}… · {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">
                    {parseFloat(alert.amount).toFixed(2)} {alert.currency}
                  </p>
                </div>
              </div>

              {alert.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    className="flex-1 text-sm py-1.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ alertId: alert.id, decision: 'cleared' })}
                  >
                    Clear
                  </button>
                  <button
                    className="flex-1 text-sm py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ alertId: alert.id, decision: 'escalated' })}
                  >
                    Escalate
                  </button>
                  <button
                    className="flex-1 text-sm py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ alertId: alert.id, decision: 'escalated', sarFiled: true })}
                  >
                    File SAR
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
