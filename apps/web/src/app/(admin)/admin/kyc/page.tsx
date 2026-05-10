'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api/client';
import { Icon } from '../../../../lib/icons';

interface KycQueueItem {
  docId: string;
  userId: string;
  email: string;
  phone: string;
  documentType: string;
  submittedAt: string;
}

export default function AdminKycPage() {
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: queue = [], isLoading } = useQuery<KycQueueItem[]>({
    queryKey: ['admin-kyc-queue'],
    queryFn: async () => (await apiClient.get<KycQueueItem[]>('/admin/kyc-queue')).data,
  });

  const review = useMutation({
    mutationFn: ({ docId, decision }: { docId: string; decision: 'approved' | 'rejected' }) =>
      apiClient.post(`/admin/kyc/${docId}/review`, { decision }),
    onSuccess: (_, vars) => {
      setMessage(`Document ${vars.decision}`);
      setError('');
      qc.invalidateQueries({ queryKey: ['admin-kyc-queue'] });
      qc.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: any) => setError(err.response?.data?.detail ?? 'Review failed'),
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="h1">KYC review queue</h1>
        <p className="subtle mt-1">{queue.length} document{queue.length === 1 ? '' : 's'} pending review</p>
      </div>

      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/60 rounded-3xl animate-pulse border border-muted-100" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-success-50 text-success-700 flex items-center justify-center">
            <Icon name="checkCircle" className="w-6 h-6" />
          </div>
          <p className="text-sm text-muted-500">All caught up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <div key={item.docId} className="card flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Icon name="id" className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-brand-700 truncate">{item.email}</p>
                  <span className="badge-neutral">{item.documentType.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-muted-500 mt-0.5">
                  {item.phone} · Submitted {new Date(item.submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  className="text-sm px-3 py-1.5 rounded-xl border border-green-300 text-success-700 hover:bg-success-50 transition-colors inline-flex items-center gap-1"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ docId: item.docId, decision: 'approved' })}
                >
                  <Icon name="check" className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  className="text-sm px-3 py-1.5 rounded-xl border border-red-300 text-danger-700 hover:bg-danger-50 transition-colors inline-flex items-center gap-1"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ docId: item.docId, decision: 'rejected' })}
                >
                  <Icon name="x" className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
