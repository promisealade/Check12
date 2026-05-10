'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api/client';
import { Icon } from '../../../../lib/icons';

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

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-warn-700',
  cleared: 'bg-green-100 text-success-700',
  escalated: 'bg-red-100 text-danger-700',
};

export default function AdminAmlPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'pending' | 'cleared' | 'escalated'>('pending');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: alerts = [] } = useQuery<AmlAlert[]>({
    queryKey: ['admin-aml-alerts', statusFilter],
    queryFn: async () =>
      (await apiClient.get<AmlAlert[]>(`/admin/aml-alerts?status=${statusFilter}`)).data,
  });

  const review = useMutation({
    mutationFn: ({
      alertId, decision, sarFiled,
    }: { alertId: string; decision: 'cleared' | 'escalated'; sarFiled?: boolean }) =>
      apiClient.post(`/admin/aml-alerts/${alertId}/review`, { decision, sarFiled }),
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="h1">AML alerts</h1>
          <p className="subtle mt-1">Anti-money laundering flagged transactions.</p>
        </div>
        <div className="rounded-2xl bg-white border border-muted-100 p-1 flex text-sm">
          {(['pending', 'cleared', 'escalated'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 capitalize rounded-xl transition-colors ${
                statusFilter === s ? 'bg-brand-50 text-brand-700' : 'text-muted-500 hover:text-muted-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      {alerts.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-success-50 text-success-700 flex items-center justify-center">
            <Icon name="checkCircle" className="w-6 h-6" />
          </div>
          <p className="text-sm text-muted-500">No {statusFilter} alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-warn-50 text-warn-700 flex items-center justify-center shrink-0">
                    <Icon name="alert" className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-500">{alert.ruleTriggered}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[alert.status]}`}>
                        {alert.status}
                      </span>
                      {alert.sarFiled && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          SAR filed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-500 mt-1">
                      User: {alert.userId.slice(0, 8)}… · {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-brand-700 tabular-nums">
                    {parseFloat(alert.amount).toFixed(2)} {alert.currency}
                  </p>
                </div>
              </div>

              {alert.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-muted-100">
                  <button
                    className="flex-1 text-sm py-2 rounded-xl border border-green-300 text-success-700 hover:bg-success-50 transition-colors inline-flex items-center justify-center gap-1.5"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ alertId: alert.id, decision: 'cleared' })}
                  >
                    <Icon name="check" className="w-4 h-4" /> Clear
                  </button>
                  <button
                    className="flex-1 text-sm py-2 rounded-xl border border-amber-300 text-warn-700 hover:bg-warn-50 transition-colors inline-flex items-center justify-center gap-1.5"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ alertId: alert.id, decision: 'escalated' })}
                  >
                    <Icon name="warning" className="w-4 h-4" /> Escalate
                  </button>
                  <button
                    className="flex-1 text-sm py-2 rounded-xl border border-red-300 text-danger-700 hover:bg-danger-50 transition-colors inline-flex items-center justify-center gap-1.5"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ alertId: alert.id, decision: 'escalated', sarFiled: true })}
                  >
                    <Icon name="receipt" className="w-4 h-4" /> File SAR
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
